Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear la vista `vw_finance_weekly` que está referenciada por `balance-semanal.js` (módulo de Gerencia) pero no existe en producción. Sin esta vista, la pantalla de Balance Semanal de Gerencia está completamente rota.

**Contexto de Arquitectura:**
El módulo `balance-semanal.js` consume esta vista para mostrar una tabla consolidada de Ingresos vs Gastos agrupados por semana operativa. Debe calcular automáticamente utilidad (Profit) y margen operativo.

Según la documentación del módulo (`docs/modules/gerencia/balance-semanal.md`), el frontend espera estas columnas:

- `year_number` (integer) — año
- `week_number` (integer) — semana ISO
- `income_gross` (numeric) — ingreso bruto total de la semana (cash + QR + bar)
- `expenses_total` (numeric) — gastos totales (staff + stock + extras)
- `operating_profit` (numeric) — utilidad operativa (income_gross - expenses_total)
- `margin_pct` (numeric) — margen porcentual: (operating_profit / NULLIF(income_gross, 0)) \* 100
- `tax_vat_payable` (numeric) — estimación IVA a pagar (21% sobre income_gross como aproximación, ajustar según configuración)
- `workdays_count` (bigint) — cantidad de jornadas en la semana
- `total_attendance` (bigint) — asistencia acumulada

Fuentes: la vista existente `vw_workday_pnl` agrupada por semana ISO.

Solo incluir workdays con status = 'CLOSED' para datos definitivos (esta vista es para Gerencia, no live).
Usar `EXTRACT(ISOYEAR FROM work_date)` y `EXTRACT(WEEK FROM work_date)`.
Ordenar por year_number DESC, week_number DESC.

Usa `CREATE OR REPLACE VIEW`.

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
