CREATE OR REPLACE VIEW vw_pnl_monthly_v2 AS
SELECT
    EXTRACT(YEAR FROM work_date) AS year_number,
    EXTRACT(MONTH FROM work_date) AS month_number,
    COUNT(work_day_id) AS workdays_count,
    SUM(attendance) AS total_attendance,
    AVG(attendance) AS avg_attendance,
    SUM(income_cash) AS income_cash,
    SUM(income_qr) AS income_qr,
    SUM(income_bar) AS income_bar,
    SUM(total_income) AS total_income,
    SUM(expense_staff) AS expense_staff,
    SUM(expense_stock) AS expense_stock,
    SUM(expense_extras) AS expense_extras,
    SUM(total_expense) AS total_expense,
    SUM(net_result) AS net_result,
    AVG(margin_pct) AS avg_margin_pct
FROM
    vw_workday_pnl
WHERE
    status = 'CLOSED'
GROUP BY
    year_number,
    month_number
ORDER BY
    year_number DESC,
    month_number DESC;
