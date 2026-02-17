Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear la vista `vw_night_snapshot` que no existe en producción pero está documentada y es referenciada por `admin-workdays.js` para alimentar el tab Histórico y el dashboard de reporte.

**Contexto de Arquitectura:**
La vista debe consolidar un snapshot completo por noche operativa. Fuentes: `work_days`, `cash_closings`, `closing_terminals`, `bar_sessions`, `bar_session_sales`, `consumption_reports`, `staff_accruals`, y la vista existente `vw_workday_pnl`.

Columnas requeridas (según `scheme.md`):

- `work_day_id` (uuid) — PK de work_days
- `work_date` (date) — fecha de la jornada
- `event_name` (text) — nombre del evento (puede ser NULL)
- `status` (text) — estado del workday (DRAFT, PLANNED, ACTIVE, CLOSED)
- `total_income` (numeric) — ingreso total desde vw_workday_pnl
- `gbol_efectivo` (numeric) — efectivo bruto desde closing_terminals (sumar system_cash de todas las terminales)
- `gbol_efectivo_neto` (numeric) — efectivo neto (gbol_efectivo menos retiros)
- `total_retiros` (numeric) — total de retiros de caja (cash_movements WHERE type = 'withdrawal' o similar)
- `cant_retiros` (integer) — cantidad de retiros
- `cash_declared` (numeric) — caja declarada (suma de declared_cash en closing_terminals)
- `conciliacion_diff` (numeric) — diferencia de conciliación (system total vs declared total)
- `stock_loss` (numeric) — pérdida valorizada de stock (puede venir de bar_session variance)
- `staff_cost` (numeric) — costo de personal desde staff_accruals (SUM total_amount WHERE work_day_id)
- `net_result` (numeric) — resultado neto desde work_days.net_result o vw_workday_pnl
- `health_score` (integer) — score de salud desde work_days.health_score

Usa `CREATE OR REPLACE VIEW` con `LEFT JOIN` para que funcione aun con datos parciales.
Solo incluye workdays con status IN ('ACTIVE', 'CLOSED') para evitar basura de DRAFT/PLANNED.

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
