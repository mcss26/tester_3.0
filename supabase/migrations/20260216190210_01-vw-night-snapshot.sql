CREATE OR REPLACE VIEW public.vw_night_snapshot AS

WITH terminal_data AS (
    SELECT
        cc.work_day_id,
        SUM(ct.system_cash) AS gbol_efectivo,
        SUM(ct.declared_cash) AS cash_declared,
        SUM((ct.system_cash + ct.system_zoco) - (ct.declared_cash + ct.declared_zoco)) AS conciliacion_diff
    FROM public.closing_terminals ct
    JOIN public.cash_closings cc ON ct.cash_closing_id = cc.id
    GROUP BY cc.work_day_id
),
withdrawal_data AS (
    SELECT
        cc.work_day_id,
        SUM(cm.amount) AS total_retiros,
        COUNT(cm.id)::integer AS cant_retiros
    FROM public.cash_movements cm
    JOIN public.cash_closings cc ON cm.cash_closing_id = cc.id
    WHERE cm.type = 'withdrawal'
    GROUP BY cc.work_day_id
),
staff_cost_data AS (
    SELECT
        sa.work_day_id,
        SUM(sa.total_amount) AS staff_cost
    FROM public.staff_accruals sa
    GROUP BY sa.work_day_id
)
SELECT
    wd.id AS work_day_id,
    wd.work_date,
    wd.event_name,
    wd.status,
    pnl.total_income,
    COALESCE(td.gbol_efectivo, 0) AS gbol_efectivo,
    (COALESCE(td.gbol_efectivo, 0) - COALESCE(wdr.total_retiros, 0)) AS gbol_efectivo_neto,
    COALESCE(wdr.total_retiros, 0) AS total_retiros,
    COALESCE(wdr.cant_retiros, 0) AS cant_retiros,
    COALESCE(td.cash_declared, 0) AS cash_declared,
    COALESCE(td.conciliacion_diff, 0) AS conciliacion_diff,
    COALESCE(scd.staff_cost, 0) AS staff_cost,
    COALESCE(wd.net_result, pnl.net_result, 0) AS net_result,
    wd.health_score
FROM public.work_days wd
LEFT JOIN public.vw_workday_pnl pnl ON wd.id = pnl.work_day_id
LEFT JOIN terminal_data td ON wd.id = td.work_day_id
LEFT JOIN withdrawal_data wdr ON wd.id = wdr.work_day_id
LEFT JOIN staff_cost_data scd ON wd.id = scd.work_day_id
WHERE wd.status IN ('ACTIVE', 'CLOSED');
