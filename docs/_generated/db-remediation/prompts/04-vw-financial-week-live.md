Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear la vista `vw_financial_week_live` que está referenciada por `admin-semanal.js` pero no existe en producción. Sin esta vista, el módulo Balance Semanal del admin está roto.

**Contexto de Arquitectura:**
Este módulo (`admin-semanal`) lee de `finance_weekly_closings` (tabla de cierres semanales manuales) y de esta vista que debe proporcionar datos LIVE (en tiempo real) del estado financiero de la semana en curso.

La vista agrega datos de `vw_workday_pnl` y `work_days` por semana ISO.

Columnas requeridas:

- `year_number` (integer) — año ISO
- `week_number` (integer) — semana ISO (1-53)
- `week_start` (date) — fecha inicio de la semana (lunes)
- `week_end` (date) — fecha fin de la semana (domingo)
- `workdays_count` (bigint) — jornadas operativas en la semana
- `total_attendance` (bigint) — asistencia acumulada
- `income_cash` (numeric) — efectivo total de la semana
- `income_qr` (numeric) — QR/boletería total
- `income_bar` (numeric) — ventas barra total
- `total_income` (numeric) — ingreso total semanal
- `expense_staff` (numeric) — staff total semanal
- `expense_stock` (numeric) — stock total semanal
- `expense_extras` (numeric) — extras total semanal
- `total_expense` (numeric) — gasto total semanal
- `net_result` (numeric) — resultado neto semanal
- `avg_margin_pct` (numeric) — margen promedio

Referencia: la tabla `finance_weekly_closings` tiene `year_number` y `week_number` como identificadores.

Incluir workdays con status IN ('ACTIVE', 'CLOSED') para que muestre datos LIVE de la semana en curso.
Usar funciones ISO de PostgreSQL: `EXTRACT(ISOYEAR FROM ...)`, `EXTRACT(WEEK FROM ...)`.
Para `week_start` y `week_end` usar: `date_trunc('week', work_date)::date` y `(date_trunc('week', work_date) + interval '6 days')::date`.

Usa `CREATE OR REPLACE VIEW`. Ordenar por year_number DESC, week_number DESC.

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
