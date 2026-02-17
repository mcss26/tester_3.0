Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear una RPC transaccional `rpc_declare_terminal_amounts` para la declaración de montos de terminal durante el cierre nocturno de caja. Actualmente `encargado-caja-noche.js` hace UPDATE directo a `closing_terminals` sin guards DB-side, permitiendo sobreescribir montos sin restricción.

**Contexto de Arquitectura:**
El módulo `encargado-caja-noche.js` manipula directamente la tabla `closing_terminals` para registrar los montos declarados por cada terminal POS al cierre de la noche.

**RPC: `rpc_declare_terminal_amounts`**
Parámetros:

- `p_cash_closing_id` (uuid) — FK al cierre de caja activo
- `p_terminal_id` (uuid) — la terminal POS
- `p_declared_cash` (numeric) — monto efectivo declarado
- `p_declared_digital` (numeric) — monto digital/ZOCO declarado
- `p_declared_by` (uuid) — profile.id del encargado que declara
- `p_notes` (text DEFAULT NULL) — notas opcionales

Guards obligatorios:

1. Verificar que `cash_closings` con p_cash_closing_id existe y su workday asociado tiene status = 'ACTIVE'. Si no → RAISE EXCEPTION 'No hay cierre activo para esta jornada'.
2. Verificar que `pos_terminals` con p_terminal_id existe y is_active = true. Si no → RAISE EXCEPTION 'Terminal inválida o inactiva'.
3. Verificar que el registro en `closing_terminals` no tenga `locked = true` (si existe esa columna) o que no haya sido declarado previamente más de 2 veces (anti-manipulación).
4. UPSERT en `closing_terminals`:
   - Si existe registro para (cash_closing_id, terminal_id): UPDATE declared_cash, declared_digital, declared_by, declared_at = NOW()
   - Si no existe: INSERT con los valores proporcionados
5. Retornar JSONB con: terminal_id, declared_cash, declared_digital, system_cash (del registro existente), system_digital, difference_cash, difference_digital

Tablas de referencia:

- `closing_terminals`: id (uuid PK), cash_closing_id (uuid FK), terminal_id (uuid FK), system_cash (numeric), system_digital (numeric), declared_cash (numeric), declared_digital (numeric), difference_cash (numeric), difference_digital (numeric)
- `cash_closings`: id (uuid PK), work_day_id (uuid FK), status (text)
- `pos_terminals`: id (uuid PK), friendly_name (text), is_active (boolean)

Función: `LANGUAGE plpgsql`, `SECURITY DEFINER`.

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
