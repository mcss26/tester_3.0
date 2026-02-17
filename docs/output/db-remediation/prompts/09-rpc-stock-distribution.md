Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear una RPC transaccional `rpc_distribute_stock` para la distribución de stock desde depósito central a barras/puntos de venta. Actualmente `logistica-distribucion.js` opera sobre múltiples tablas sin transacción, lo que puede dejar stock inconsistente ante fallo parcial.

**Contexto de Arquitectura:**
El módulo `logistica-distribucion.js` ejecuta operaciones multi-tabla:

1. Lee items de `replenishment_items` y `replenishment_requests`
2. UPDATE `inventory_stock` (resta del depósito central)
3. INSERT `inventory_movements` (registra el movimiento)
4. UPDATE `replenishment_items` (marca como distribuido)
5. UPDATE `replenishment_requests` (actualiza estado)

Si algún paso falla, el stock puede quedar desincronizado.

**RPC: `rpc_distribute_stock`**
Parámetros:

- `p_request_id` (uuid) — solicitud de reposición
- `p_items` (jsonb) — array de objetos: [{sku_id, distributed_packs, notes}]
- `p_distributed_by` (uuid) — profile.id del logístico que distribuye

Guards obligatorios:

1. Verificar que `replenishment_requests` con p_request_id existe y status = 'pending' o 'approved'. Si no → RAISE EXCEPTION.
2. Verificar que hay un workday ACTIVE o PLANNED. Si no → RAISE EXCEPTION 'No hay jornada activa para distribuir stock'.
3. Para CADA item en p_items:
   a. Verificar que el SKU existe en `master_sku` y está activo.
   b. Verificar que hay stock suficiente en `inventory_stock` para ese SKU (stock_actual >= distributed_packs × pack_units). Si no → RAISE EXCEPTION con detalle del SKU faltante.
   c. UPDATE `inventory_stock` SET stock_actual = stock_actual - (distributed_packs × conversión a unidades).
   d. INSERT en `inventory_movements` con: sku_id, quantity (negativo, es egreso), movement_type = 'distribution', reference_id = p_request_id, created_by = p_distributed_by.
   e. UPDATE `replenishment_items` SET status = 'received' WHERE request_id = p_request_id AND sku_id = item.sku_id.
4. UPDATE `replenishment_requests` SET status = 'distributed' WHERE id = p_request_id.
5. Retornar JSONB con resumen: {request_id, items_distributed: N, total_units, distributed_by, timestamp}.

Tablas de referencia:

- `inventory_stock`: sku_id (uuid PK/FK), stock_actual (numeric)
- `inventory_movements`: id (uuid PK), sku_id (uuid FK), quantity (numeric), movement_type (text), reference_id (uuid), created_by (uuid FK), created_at (timestamptz)
- `replenishment_items`: id (uuid PK), request_id (uuid FK), sku_id (uuid FK), requested_packs (numeric), status (text)
- `replenishment_requests`: id (uuid PK), status (text), user_id (uuid FK)
- `master_sku`: id (uuid PK), nombre (text), unidades_x_pack (numeric), activo (boolean)

Función: `LANGUAGE plpgsql`, `SECURITY DEFINER`. Toda la lógica es una sola transacción — si cualquier paso falla, PostgreSQL deshace todo automáticamente.

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
