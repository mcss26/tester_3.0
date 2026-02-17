CREATE OR REPLACE VIEW public.vw_financial_week_live AS
SELECT
    EXTRACT(ISOYEAR FROM pnl.work_date)::integer AS year_number,
    EXTRACT(WEEK FROM pnl.work_date)::integer AS week_number,
    date_trunc('week', pnl.work_date)::date AS week_start,
    (date_trunc('week', pnl.work_date) + '6 days'::interval)::date AS week_end,
    COUNT(pnl.work_day_id) AS workdays_count,
    COALESCE(SUM(pnl.attendance), 0)::bigint AS total_attendance,
    COALESCE(SUM(pnl.income_cash), 0) AS income_cash,
    COALESCE(SUM(pnl.income_qr), 0) AS income_qr,
    COALESCE(SUM(pnl.income_bar), 0) AS income_bar,
    COALESCE(SUM(pnl.total_income), 0) AS total_income,
    COALESCE(SUM(pnl.expense_staff), 0) AS expense_staff,
    COALESCE(SUM(pnl.expense_stock), 0) AS expense_stock,
    COALESCE(SUM(pnl.expense_extras), 0) AS expense_extras,
    COALESCE(SUM(pnl.total_expense), 0) AS total_expense,
    COALESCE(SUM(pnl.net_result), 0) AS net_result,
    COALESCE(AVG(pnl.margin_pct), 0) AS avg_margin_pct
FROM
    public.vw_workday_pnl pnl
WHERE
    pnl.status IN ('ACTIVE', 'CLOSED')
GROUP BY
    1, 2, 3, 4;
