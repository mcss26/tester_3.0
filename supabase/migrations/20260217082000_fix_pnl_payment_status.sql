-- =============================================================
-- Migration: fix_pnl_payment_status
-- Date: 2026-02-17
-- Fixes: vw_workday_pnl only counts APPROVED payments.
--        When a payment is marked DONE it vanishes from PnL.
--        Fix: count APPROVED + DONE in expense_extras.
-- =============================================================

CREATE OR REPLACE VIEW vw_workday_pnl AS
SELECT wd.id AS work_day_id,
    wd.work_date,
    wd.status,
    wd.event_name,
    wd.attendance,
    COALESCE(cc_totals.cash_income, 0::numeric) AS income_cash,
    COALESCE(qr_totals.qr_revenue, 0::numeric) AS income_qr,
    COALESCE(bar_totals.bar_revenue, 0::numeric) AS income_bar,
    COALESCE(cc_totals.cash_income, 0::numeric)
      + COALESCE(qr_totals.qr_revenue, 0::numeric)
      + COALESCE(bar_totals.bar_revenue, 0::numeric) AS total_income,
    COALESCE(staff_totals.staff_cost, 0::numeric) AS expense_staff,
    COALESCE(stock_totals.stock_cost, 0::numeric) AS expense_stock,
    COALESCE(extras_totals.extras_cost, 0::numeric) AS expense_extras,
    COALESCE(staff_totals.staff_cost, 0::numeric)
      + COALESCE(stock_totals.stock_cost, 0::numeric)
      + COALESCE(extras_totals.extras_cost, 0::numeric) AS total_expense,
    COALESCE(cc_totals.cash_income, 0::numeric)
      + COALESCE(qr_totals.qr_revenue, 0::numeric)
      + COALESCE(bar_totals.bar_revenue, 0::numeric)
      - (COALESCE(staff_totals.staff_cost, 0::numeric)
         + COALESCE(stock_totals.stock_cost, 0::numeric)
         + COALESCE(extras_totals.extras_cost, 0::numeric)) AS net_result,
    CASE
        WHEN (COALESCE(cc_totals.cash_income, 0::numeric)
              + COALESCE(qr_totals.qr_revenue, 0::numeric)
              + COALESCE(bar_totals.bar_revenue, 0::numeric)) > 0::numeric
        THEN round(
            (COALESCE(cc_totals.cash_income, 0::numeric)
              + COALESCE(qr_totals.qr_revenue, 0::numeric)
              + COALESCE(bar_totals.bar_revenue, 0::numeric)
              - (COALESCE(staff_totals.staff_cost, 0::numeric)
                 + COALESCE(stock_totals.stock_cost, 0::numeric)
                 + COALESCE(extras_totals.extras_cost, 0::numeric)))
            * 100.0
            / (COALESCE(cc_totals.cash_income, 0::numeric)
               + COALESCE(qr_totals.qr_revenue, 0::numeric)
               + COALESCE(bar_totals.bar_revenue, 0::numeric)), 2)
        ELSE 0::numeric
    END AS margin_pct
FROM work_days wd
  LEFT JOIN LATERAL (
    SELECT COALESCE(sum(cc.total_system), 0::numeric) AS cash_income
    FROM cash_closings cc
    WHERE cc.work_day_id = wd.id
  ) cc_totals ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE(sum(qb.unit_price), 0::numeric) AS qr_revenue
    FROM qr_codes qc
      JOIN qr_batches qb ON qb.id = qc.batch_id
    WHERE qc.work_day_id = wd.id AND qc.status = 'used'::text
  ) qr_totals ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE(sum(bss.total_amount), 0::numeric) AS bar_revenue
    FROM bar_sessions bs
      JOIN bar_session_sales bss ON bss.session_id = bs.id
    WHERE bs.work_day_id = wd.id
  ) bar_totals ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE(sum(sa.total_amount), 0::numeric) AS staff_cost
    FROM staff_accruals sa
    WHERE sa.work_day_id = wd.id AND sa.status <> 'cancelled'::text
  ) staff_totals ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE(sum(cd.quantity * COALESCE(ms.costo, 0::numeric)), 0::numeric) AS stock_cost
    FROM consumption_reports cr
      JOIN consumption_details cd ON cd.report_id = cr.id
      JOIN master_sku ms ON ms.id = cd.sku_id
    WHERE cr.operational_date = wd.work_date
  ) stock_totals ON true
  -- FIX: count both APPROVED (queued) and DONE (paid) payments
  LEFT JOIN LATERAL (
    SELECT COALESCE(sum(fp.amount_total), 0::numeric) AS extras_cost
    FROM finance_payments fp
    WHERE fp.work_day_id = wd.id
      AND fp.status IN ('APPROVED', 'DONE')
  ) extras_totals ON true;
