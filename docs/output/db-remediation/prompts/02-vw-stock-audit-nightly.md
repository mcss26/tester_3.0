Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear la vista `vw_stock_audit_nightly` que está documentada en `scheme.md` (línea 1228) pero nunca fue creada en producción. Proporciona un resumen nocturno de auditoría de stock con alertas de pérdida y costos reales vs sistema.

**Contexto de Arquitectura:**
Fuentes principales: `work_days`, `bar_sessions`, `bar_stock_snapshots` (type='opening' y type='closing'), `bar_session_sales`, `master_sku`, `master_recipes`.

La lógica: por cada noche (work_day_id), comparar stock físico consumido (apertura - cierre de bar) vs stock teórico (ventas × recetas). Agregar a nivel de noche.

Columnas requeridas (según `scheme.md`):

- `work_date` (date) — fecha de la jornada
- `total_skus` (bigint) — cantidad de SKUs involucrados en la noche
- `total_sessions` (bigint) — cantidad de sesiones de barra
- `alertas_perdida` (bigint) — SKUs donde consumo_fisico > consumo_teorico (faltante)
- `dentro_rango` (bigint) — SKUs con varianza ≤ 5%
- `errores_registro` (bigint) — SKUs donde consumo_fisico < consumo_teorico (probable error de registro)
- `total_costo_real` (numeric) — suma del costo real del stock consumido físicamente
- `total_costo_sistema` (numeric) — suma del costo teórico según ventas
- `total_costo_diferencia` (numeric) — diferencia entre real y sistema
- `varianza_pct_global` (numeric) — porcentaje de varianza global de la noche

Tablas de referencia clave:

- `bar_stock_snapshots` tiene columnas: `session_id`, `sku_id`, `quantity`, `type` ('opening'/'closing')
- `master_sku` tiene `costo_unitario` (costo por unidad)
- `bar_session_sales` tiene `recipe_id`, `quantity`
- `master_recipes` vincula recetas con SKUs e ingredientes

Usa `CREATE OR REPLACE VIEW`. Agrupa por `work_date` desde `work_days`. Filtra solo workdays con status IN ('ACTIVE', 'CLOSED').

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
