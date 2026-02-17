-- =============================================================
-- Migration: fix_daily_sales_expenses
-- Date: 2026-02-17
-- Fixes: vw_daily_sales CTE gastos_totals reads accounts_payable
--        (0 rows, status='approved' lowercase bug).
--        Migrated to finance_payments IN ('APPROVED','DONE').
-- Also: deprecates accounts_payable with COMMENT.
-- =============================================================

CREATE OR REPLACE VIEW vw_daily_sales AS
WITH caja_totals AS (
    SELECT cc.work_day_id,
        sum(ct.system_cash) AS cash_system,
        sum(ct.declared_cash) AS cash_declared,
        sum(ct.system_zoco) AS zoco_system,
        sum(ct.declared_zoco) AS zoco_declared
    FROM cash_closings cc
        LEFT JOIN closing_terminals ct ON ct.cash_closing_id = cc.id
    GROUP BY cc.work_day_id
), bar_totals AS (
    SELECT bs.work_day_id,
        sum(bss.total_amount) AS bar_sales_total,
        count(DISTINCT bss.id) AS bar_transaction_count,
        sum(bss.total_amount) FILTER (WHERE bss.payment_method = 'cash') AS bar_sales_cash,
        sum(bss.total_amount) FILTER (WHERE bss.payment_method = 'card') AS bar_sales_card,
        sum(bss.total_amount) FILTER (WHERE bss.payment_method = ANY (ARRAY['transfer', 'other'])) AS bar_sales_other
    FROM bar_sessions bs
        LEFT JOIN bar_session_sales bss ON bss.session_id = bs.id
    WHERE bs.status = 'closed'
    GROUP BY bs.work_day_id
), qr_totals AS (
    SELECT qc.work_day_id,
        count(qc.id) FILTER (WHERE qc.status = 'ACREDITADO') AS qr_accredited_count,
        sum(qb.unit_price) FILTER (WHERE qc.status = 'ACREDITADO') AS qr_income
    FROM qr_codes qc
        LEFT JOIN qr_batches qb ON qb.id = qc.batch_id
    GROUP BY qc.work_day_id
), retiros_totals AS (
    SELECT cc.work_day_id,
        sum(cm.amount) AS total_withdrawals,
        count(cm.id) AS withdrawal_count
    FROM cash_closings cc
        LEFT JOIN cash_movements cm ON cm.cash_closing_id = cc.id
    WHERE cm.type = 'withdrawal'
    GROUP BY cc.work_day_id
), gastos_totals AS (
    -- FIX: migrated from accounts_payable (empty, lowercase status bug)
    --      to finance_payments with correct status filter
    SELECT work_day_id,
        sum(amount_total) AS total_expenses,
        count(id) AS expense_count
    FROM finance_payments
    WHERE status IN ('APPROVED', 'DONE')
      AND work_day_id IS NOT NULL
    GROUP BY work_day_id
)
SELECT wd.id AS work_day_id,
    wd.work_date,
    COALESCE(cj.cash_system, 0::numeric) AS cash_system,
    COALESCE(cj.cash_declared, 0::numeric) AS cash_declared,
    COALESCE(cj.cash_declared - cj.cash_system, 0::numeric) AS cash_difference,
    COALESCE(cj.zoco_system, 0::numeric) AS zoco_system,
    COALESCE(cj.zoco_declared, 0::numeric) AS zoco_declared,
    COALESCE(cj.zoco_declared - cj.zoco_system, 0::numeric) AS zoco_difference,
    COALESCE(bt.bar_sales_total, 0::numeric) AS bar_sales_system,
    COALESCE(bt.bar_transaction_count, 0::bigint) AS bar_transaction_count,
    COALESCE(bt.bar_sales_cash, 0::numeric) AS bar_sales_cash,
    COALESCE(bt.bar_sales_card, 0::numeric) AS bar_sales_card,
    COALESCE(bt.bar_sales_other, 0::numeric) AS bar_sales_other,
    COALESCE(qt.qr_income, 0::numeric) AS qr_total,
    COALESCE(qt.qr_accredited_count, 0::bigint) AS qr_people_count,
    COALESCE(rt.total_withdrawals, 0::numeric) AS withdrawals,
    COALESCE(rt.withdrawal_count, 0::bigint) AS withdrawal_count,
    COALESCE(gt.total_expenses, 0::numeric) AS expenses,
    COALESCE(gt.expense_count, 0::bigint) AS expense_count,
    COALESCE(cj.cash_system, 0::numeric) + COALESCE(cj.zoco_system, 0::numeric)
        + COALESCE(qt.qr_income, 0::numeric) + COALESCE(bt.bar_sales_total, 0::numeric) AS total_system,
    COALESCE(cj.cash_declared, 0::numeric) + COALESCE(cj.zoco_declared, 0::numeric) AS total_declared,
    COALESCE(cj.cash_declared, 0::numeric) + COALESCE(cj.zoco_declared, 0::numeric)
        - (COALESCE(cj.cash_system, 0::numeric) + COALESCE(cj.zoco_system, 0::numeric)) AS total_difference,
    COALESCE(cj.cash_system, 0::numeric) + COALESCE(cj.zoco_system, 0::numeric)
        + COALESCE(qt.qr_income, 0::numeric) + COALESCE(bt.bar_sales_total, 0::numeric)
        - COALESCE(rt.total_withdrawals, 0::numeric)
        - COALESCE(gt.total_expenses, 0::numeric) AS net_to_render,
    cc.notes AS closing_notes,
    cc.status AS closing_status,
    wd.closed_by,
    wd.status AS work_day_status
FROM work_days wd
    LEFT JOIN caja_totals cj ON cj.work_day_id = wd.id
    LEFT JOIN bar_totals bt ON bt.work_day_id = wd.id
    LEFT JOIN qr_totals qt ON qt.work_day_id = wd.id
    LEFT JOIN retiros_totals rt ON rt.work_day_id = wd.id
    LEFT JOIN gastos_totals gt ON gt.work_day_id = wd.id
    LEFT JOIN cash_closings cc ON cc.work_day_id = wd.id;

-- I3: Mark accounts_payable as deprecated
COMMENT ON TABLE accounts_payable IS 'DEPRECATED 2026-02-17 — Reemplazada por finance_payments. Sin consumidores activos.';
