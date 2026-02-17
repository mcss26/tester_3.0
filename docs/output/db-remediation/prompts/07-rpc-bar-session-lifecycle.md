Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear dos RPCs transaccionales para el ciclo de vida de sesiones de barra: apertura y cierre. Actualmente estas operaciones se ejecutan client-side desde `encargado-barra-noche.js` sin validación DB-side, lo que permite abrir sesiones sin workday ACTIVE.

**Contexto de Arquitectura:**
El módulo `encargado-barra-noche.js` manipula directamente:

- `bar_sessions` — INSERT para abrir, UPDATE para cerrar
- `bar_stock_snapshots` — INSERT type='opening' al abrir, INSERT type='closing' al cerrar

Actualmente NO hay guards de base de datos. Un encargado podría manipular sesiones via API directa sin restricciones.

**RPC 1: `rpc_open_bar_session`**
Parámetros:

- `p_work_day_id` (uuid) — jornada activa
- `p_location` (text) — ubicación de la barra (ej: 'BARRA_PRINCIPAL', 'BARRA_VIP')
- `p_opened_by` (uuid) — profile.id del encargado
- `p_opening_stock` (jsonb) — array de {sku_id, quantity} para el snapshot de apertura

Guards obligatorios:

1. Verificar que `work_days.status = 'ACTIVE'` para p_work_day_id. Si no → RAISE EXCEPTION.
2. Verificar que NO existe `bar_sessions` con `work_day_id = p_work_day_id AND location = p_location AND status = 'active'`. Si existe → RAISE EXCEPTION 'Ya hay sesión activa en esta barra'.
3. Crear la sesión en `bar_sessions` con status = 'active'.
4. Insertar cada item de p_opening_stock en `bar_stock_snapshots` con type = 'opening'.
5. Retornar JSONB con el session_id creado.

**RPC 2: `rpc_close_bar_session`**
Parámetros:

- `p_session_id` (uuid) — sesión a cerrar
- `p_closed_by` (uuid) — profile.id del encargado
- `p_closing_stock` (jsonb) — array de {sku_id, quantity} para el snapshot de cierre

Guards obligatorios:

1. Verificar que la sesión existe y `status = 'active'`. Si no → RAISE EXCEPTION.
2. Verificar que el workday asociado aún está ACTIVE. Si no → RAISE EXCEPTION.
3. Insertar cada item de p_closing_stock en `bar_stock_snapshots` con type = 'closing'.
4. UPDATE `bar_sessions` SET status = 'closed', closed_at = NOW(), closed_by = p_closed_by.
5. Retornar JSONB con resumen: session_id, skus_count, opened_at, closed_at.

Tablas de referencia:

- `bar_sessions`: id (uuid PK), work_day_id (uuid FK), location (text), status (text: 'active'/'closed'), opened_by (uuid FK), closed_by (uuid FK), opened_at (timestamptz), closed_at (timestamptz)
- `bar_stock_snapshots`: id (uuid PK), session_id (uuid FK), sku_id (uuid FK), quantity (numeric), type (text: 'opening'/'closing'), created_at (timestamptz)

Ambas funciones: `LANGUAGE plpgsql`, `SECURITY DEFINER`, envueltas en transacción implícita de PostgreSQL.

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
