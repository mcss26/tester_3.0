-- =============================================================
-- Migración: fix_vat_formula
-- Corrige fórmula IVA en vw_finance_weekly
-- Antes:  income_gross * 0.21 (aplica IVA sobre el bruto)
-- Ahora:  income_gross / 1.21 * 0.21 (extrae IVA de precio con IVA incluido)
-- =============================================================

CREATE OR REPLACE VIEW public.vw_finance_weekly AS
WITH weekly_aggregated AS (
    SELECT
        EXTRACT(ISOYEAR FROM work_date) AS year_number,
        EXTRACT(WEEK FROM work_date) AS week_number,
        SUM(total_income) AS income_gross,
        SUM(total_expense) AS expenses_total,
        COUNT(work_day_id) AS workdays_count,
        SUM(COALESCE(attendance, 0)) AS total_attendance
    FROM
        public.vw_workday_pnl
    WHERE
        status = 'CLOSED'
    GROUP BY
        1, 2
)
SELECT
    w.year_number,
    w.week_number,
    w.income_gross,
    w.expenses_total,
    (w.income_gross - w.expenses_total) AS operating_profit,
    ((w.income_gross - w.expenses_total) / NULLIF(w.income_gross, 0)) * 100 AS margin_pct,
    ROUND(w.income_gross / 1.21 * 0.21, 2) AS tax_vat_payable,
    w.workdays_count,
    w.total_attendance
FROM
    weekly_aggregated w
ORDER BY
    w.year_number DESC,
    w.week_number DESC;
