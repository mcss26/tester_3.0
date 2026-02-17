-- ============================================================
-- Migration: Fix cash flow bugs (3 issues)
-- Date: 2026-02-17
-- ============================================================

-- BUG 3: closing_terminals missing 'notes' column
-- The JS writes notes on terminal close but column doesn't exist
-- Notes were silently dropped by Supabase
ALTER TABLE closing_terminals ADD COLUMN IF NOT EXISTS notes TEXT;

-- BUG 5: Orphaned cash_closing with status='open' for CLOSED work_day
-- Work day 57a9ed5c (2026-01-18) is CLOSED but its cash_closing was 'open'
UPDATE cash_closings 
SET status = 'closed',
    closed_at = COALESCE(closed_at, NOW())
WHERE work_day_id = '57a9ed5c-43ec-41be-8696-4ed54c38438a'
  AND status != 'closed';

-- BUG 2: conciliacion_diff sign inconsistency in vw_night_snapshot
-- BEFORE: system - declared (positive = faltante) ← WRONG, opposite of JS
-- AFTER:  declared - system (negative = faltante) ← Consistent with cash_closings.total_difference
CREATE OR REPLACE VIEW vw_night_snapshot AS
WITH terminal_data AS (
    SELECT cc.work_day_id,
        sum(ct.system_cash) AS gbol_efectivo,
        sum(ct.declared_cash) AS cash_declared,
        -- FIX: declared - system (negative = faltante, positive = sobrante)
        sum((ct.declared_cash + ct.declared_zoco) - (ct.system_cash + ct.system_zoco)) AS conciliacion_diff
    FROM closing_terminals ct
        JOIN cash_closings cc ON ct.cash_closing_id = cc.id
    GROUP BY cc.work_day_id
), withdrawal_data AS (
    SELECT cc.work_day_id,
        sum(cm.amount) AS total_retiros,
        count(cm.id)::integer AS cant_retiros
    FROM cash_movements cm
        JOIN cash_closings cc ON cm.cash_closing_id = cc.id
    WHERE cm.type = 'withdrawal'
    GROUP BY cc.work_day_id
), staff_cost_data AS (
    SELECT sa.work_day_id,
        sum(sa.total_amount) AS staff_cost
    FROM staff_accruals sa
    GROUP BY sa.work_day_id
), stock_loss_data AS (
    SELECT vw_bar_efficiency.work_day_id,
        sum(vw_bar_efficiency.loss_amount) AS stock_loss
    FROM vw_bar_efficiency
    GROUP BY vw_bar_efficiency.work_day_id
)
SELECT wd.id AS work_day_id,
    wd.work_date,
    wd.event_name,
    wd.status,
    pnl.total_income,
    COALESCE(td.gbol_efectivo, 0::numeric) AS gbol_efectivo,
    COALESCE(td.gbol_efectivo, 0::numeric) - COALESCE(wdr.total_retiros, 0::numeric) AS gbol_efectivo_neto,
    COALESCE(wdr.total_retiros, 0::numeric) AS total_retiros,
    COALESCE(wdr.cant_retiros, 0) AS cant_retiros,
    COALESCE(td.cash_declared, 0::numeric) AS cash_declared,
    COALESCE(td.conciliacion_diff, 0::numeric) AS conciliacion_diff,
    COALESCE(sld.stock_loss, 0::numeric) AS stock_loss,
    COALESCE(scd.staff_cost, 0::numeric) AS staff_cost,
    COALESCE(wd.net_result, pnl.net_result, 0::numeric) AS net_result,
    wd.health_score
FROM work_days wd
    LEFT JOIN vw_workday_pnl pnl ON wd.id = pnl.work_day_id
    LEFT JOIN terminal_data td ON wd.id = td.work_day_id
    LEFT JOIN withdrawal_data wdr ON wd.id = wdr.work_day_id
    LEFT JOIN staff_cost_data scd ON wd.id = scd.work_day_id
    LEFT JOIN stock_loss_data sld ON wd.id = sld.work_day_id
WHERE wd.status = ANY (ARRAY['ACTIVE', 'CLOSED']);
