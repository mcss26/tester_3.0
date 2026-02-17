-- ============================================================================
-- Migration: vw_workday_cash_balance
-- Purpose:   Consolidate Cash Flow logic into a single DB view per work_day.
--            Aggregates closing_terminals (declared/system) and cash_movements
--            (withdrawals/deposits) grouped by work_days.id.
-- Phase:     1 (Thick DB)
-- Created:   2026-02-17
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_workday_cash_balance AS
WITH terminal_totals AS (
    SELECT
        cc.work_day_id,
        COALESCE(SUM(ct.declared_cash), 0)  AS total_declared_cash,
        COALESCE(SUM(ct.declared_zoco), 0)  AS total_declared_zoco,
        COALESCE(SUM(ct.system_cash), 0)    AS total_system_cash,
        COALESCE(SUM(ct.system_zoco), 0)    AS total_system_zoco,
        COUNT(ct.id)                        AS terminal_count
    FROM cash_closings cc
    LEFT JOIN closing_terminals ct ON ct.cash_closing_id = cc.id
    GROUP BY cc.work_day_id
),
movement_totals AS (
    SELECT
        cc.work_day_id,
        COALESCE(SUM(cm.amount) FILTER (
            WHERE cm.type = 'withdrawal' AND cm.status = 'confirmed'
        ), 0) AS total_withdrawals,
        COALESCE(SUM(cm.amount) FILTER (
            WHERE cm.type = 'deposit' AND cm.status = 'confirmed'
        ), 0) AS total_deposits,
        COUNT(cm.id) FILTER (
            WHERE cm.type = 'withdrawal'
        ) AS withdrawal_count,
        COUNT(cm.id) FILTER (
            WHERE cm.type = 'deposit'
        ) AS deposit_count
    FROM cash_closings cc
    LEFT JOIN cash_movements cm ON cm.cash_closing_id = cc.id
    GROUP BY cc.work_day_id
)
SELECT
    wd.id                                               AS work_day_id,
    wd.work_date,

    -- Terminal aggregates
    COALESCE(tt.total_declared_cash, 0)                 AS total_declared_cash,
    COALESCE(tt.total_declared_zoco, 0)                 AS total_declared_zoco,
    COALESCE(tt.total_system_cash, 0)                   AS total_system_cash,
    COALESCE(tt.total_system_zoco, 0)                   AS total_system_zoco,

    -- Totals
    COALESCE(tt.total_declared_cash, 0)
        + COALESCE(tt.total_declared_zoco, 0)           AS total_declared,
    COALESCE(tt.total_system_cash, 0)
        + COALESCE(tt.total_system_zoco, 0)             AS total_system,
    (COALESCE(tt.total_declared_cash, 0) + COALESCE(tt.total_declared_zoco, 0))
        - (COALESCE(tt.total_system_cash, 0) + COALESCE(tt.total_system_zoco, 0))
                                                        AS total_difference,

    -- Cash movements
    COALESCE(mt.total_withdrawals, 0)                   AS total_withdrawals,
    COALESCE(mt.total_deposits, 0)                      AS total_deposits,

    -- Net cash flow: what should physically be in the register
    (COALESCE(tt.total_declared_cash, 0) + COALESCE(tt.total_declared_zoco, 0))
        - COALESCE(mt.total_withdrawals, 0)
        + COALESCE(mt.total_deposits, 0)                AS net_cash_flow,

    -- Counters
    COALESCE(tt.terminal_count, 0)                      AS terminal_count,
    COALESCE(mt.withdrawal_count, 0)                    AS withdrawal_count,
    COALESCE(mt.deposit_count, 0)                       AS deposit_count,

    -- Closing metadata
    cc.status                                           AS closing_status,
    cc.closed_at                                        AS closing_closed_at,
    cc.notes                                            AS closing_notes

FROM work_days wd
LEFT JOIN terminal_totals  tt ON tt.work_day_id = wd.id
LEFT JOIN movement_totals  mt ON mt.work_day_id = wd.id
LEFT JOIN cash_closings    cc ON cc.work_day_id = wd.id;

-- ============================================================================
-- Permissions
-- ============================================================================
GRANT SELECT ON public.vw_workday_cash_balance TO authenticated;
GRANT SELECT ON public.vw_workday_cash_balance TO service_role;
