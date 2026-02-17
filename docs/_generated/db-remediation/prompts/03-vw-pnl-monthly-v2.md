Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear la vista `vw_pnl_monthly_v2` que está referenciada por `admin-reportes.js` pero no existe en producción. Sin esta vista, el módulo de Reportes Mensuales P&L está roto.

**Contexto de Arquitectura:**
Esta vista agrega la vista existente `vw_workday_pnl` por mes. La vista `vw_workday_pnl` ya tiene las columnas:

- `work_day_id`, `work_date`, `status`, `event_name`, `attendance`
- `income_cash`, `income_qr`, `income_bar`, `total_income`
- `expense_staff`, `expense_stock`, `expense_extras`, `total_expense`
- `net_result`, `margin_pct`

La vista mensual debe agrupar por año y mes (EXTRACT(YEAR FROM work_date), EXTRACT(MONTH FROM work_date)) y sumar/promediar las métricas relevantes.

Columnas que debe tener `vw_pnl_monthly_v2`:

- `year_number` (integer) — año
- `month_number` (integer) — mes (1-12)
- `workdays_count` (bigint) — cantidad de jornadas en el mes
- `total_attendance` (bigint) — asistencia total del mes
- `avg_attendance` (numeric) — promedio de asistencia por noche
- `income_cash` (numeric) — suma de efectivo
- `income_qr` (numeric) — suma QR/boletería
- `income_bar` (numeric) — suma ventas barra
- `total_income` (numeric) — ingreso total del mes
- `expense_staff` (numeric) — gasto staff total
- `expense_stock` (numeric) — gasto stock total
- `expense_extras` (numeric) — gastos extras total
- `total_expense` (numeric) — gasto total del mes
- `net_result` (numeric) — resultado neto del mes
- `avg_margin_pct` (numeric) — margen promedio

Solo agregar workdays con status = 'CLOSED' para reportes finales.
Ordenar por year_number DESC, month_number DESC.

Usa `CREATE OR REPLACE VIEW`.

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
