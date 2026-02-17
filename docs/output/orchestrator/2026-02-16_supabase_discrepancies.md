# Auditoría Cruzada: Discrepancias Business Logic ↔ Supabase

> **Fecha:** 2026-02-16
> **Método:** Comparación exhaustiva entre documentación de negocio (`docs/business-logic/`),
> esquema documentado (`docs/scheme.md`) y objetos reales en Supabase producción.

---

## Resumen Ejecutivo

| Categoría                                        | Cant. | Severidad  |
| ------------------------------------------------ | ----- | ---------- |
| Vistas Fantasma (documentadas pero inexistentes) | 5     | 🔴 CRÍTICA |
| RPCs no documentadas                             | 16    | 🟡 MEDIA   |
| Discrepancias de firma en RPCs                   | 1     | 🔴 CRÍTICA |
| Gaps de lógica de negocio sin respaldo DB        | 4     | 🟡 MEDIA   |
| Lógica infiltrada en frontend (debería ser RPC)  | 3     | 🟡 MEDIA   |
| Inconsistencias en `scheme.md`                   | 2     | 🟢 BAJA    |

---

## 🔴 1. Vistas Fantasma — Existen en docs pero NO en la DB

Estas vistas están documentadas en `scheme.md` y/o referenciadas en el mapa de módulos,
pero **no existen** en la base de datos de producción (`pg_views` retorna 0 rows).

| #   | Vista                    | Dónde se referencia                                  | Impacto                                                                                                            |
| --- | ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | `vw_night_snapshot`      | `scheme.md` línea 1155, flujo `workday-management`   | **Tab Histórico y dashboard de reporte** quedan sin datos. Queries del frontend fallarán silenciosamente.          |
| 2   | `vw_stock_audit_nightly` | `scheme.md` línea 1228                               | **Resumen nocturno de auditoría de stock** no disponible. `alertas_perdida`, `varianza_pct_global` no se calculan. |
| 3   | `vw_pnl_monthly_v2`      | `scheme.md` mapa módulo `admin-reportes`             | **Reportes mensuales P&L** rotos. Frontend hará `.select()` sobre vista inexistente.                               |
| 4   | `vw_financial_week_live` | `scheme.md` mapa módulo `admin-semanal`              | **Balance Semanal live** roto. El módulo `admin-semanal.js` no puede renderizar datos.                             |
| 5   | `vw_finance_weekly`      | `scheme.md` mapa módulo `balance-semanal` (Gerencia) | **Vista de Gerencia** sin datos. Módulo referencia vista que nunca se creó.                                        |

> [!CAUTION]
> Las vistas 3, 4 y 5 son referenciadas directamente desde módulos JS. Cualquier usuario que
> navegue a esas pantallas recibirá un error de Supabase (400/404) o datos vacíos.

### Acción recomendada:

- **Opción A:** Crear las 5 vistas con migraciones SQL.
- **Opción B:** Remover las referencias del código JS y `scheme.md` si la funcionalidad no es necesaria aún.

---

## 🔴 2. Discrepancia de Firma en RPC

| RPC                                 | Firma en `scheme.md`                    | Firma real en DB                                                              |
| ----------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| `admin_export_accruals_to_payments` | `(id)` — recibe un solo UUID de workday | `(p_user_id uuid, p_from date, p_to date)` — recibe usuario + rango de fechas |

**Impacto:** El frontend (`admin-workdays.js`) puede estar invocando esta función con los argumentos
incorrectos, causando errores silenciosos o exportaciones parciales.

### Acción recomendada:

- Verificar cómo el frontend llama a esta función.
- Actualizar `scheme.md` con la firma correcta.

---

## 🟡 3. RPCs No Documentadas

Las siguientes 16 funciones existen en producción pero no están listadas en `scheme.md` § "RPCs de Workday":

### Workday/Lifecycle (2 no documentadas)

| Función                       | Firma                                        | Notas                                                           |
| ----------------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| `rpc_plan_work_day`           | `(p_work_date date, p_notes text?)` → `uuid` | Shortcut: crea workday saltando DRAFT. No mencionada en flujos. |
| `rpc_preflight_close_workday` | `(p_work_day_id uuid)` → `jsonb`             | **Pre-flight recién desplegada.** Falta agregarla a docs.       |

### Finance/Payments (5 no documentadas)

| Función                            | Firma                                                            |
| ---------------------------------- | ---------------------------------------------------------------- |
| `admin_approve_payment`            | `(p_payment_id, p_approved_by)` → `void`                         |
| `admin_generate_rule_payments`     | `()` → `void`                                                    |
| `admin_mark_payment_done`          | `(p_payment_id, p_amount, p_voucher, p_method, p_note)` → `void` |
| `admin_undo_payment_done`          | `(p_payment_id)` → `void`                                        |
| `admin_sync_opening_cost_payments` | `(p_plan_date)` → `void`                                         |

### Inventory (2 no documentadas)

| Función                      | Firma                                           |
| ---------------------------- | ----------------------------------------------- |
| `admin_bulk_set_stock`       | `(changes jsonb, p_reason text?)` → `jsonb`     |
| `rpc_receive_supplier_order` | `(p_order_id, p_items jsonb, p_notes)` → `void` |

### Auth/Utility (5 no documentadas)

| Función                       | Firma                                      |
| ----------------------------- | ------------------------------------------ |
| `get_my_role`                 | `()` → `text`                              |
| `has_role`                    | `(r text)` → `boolean`                     |
| `is_admin`                    | `()` → `boolean`                           |
| `update_member_password_hash` | `(p_member_id, p_password)` → `void`       |
| `verify_member_password`      | `(p_member_id, p_password)` → `TABLE(...)` |

### Utility (2 no documentadas)

| Función                      | Firma                    |
| ---------------------------- | ------------------------ |
| `fn_normalize_terminal_name` | `(val text)` → `text`    |
| `fn_parse_arg_number`        | `(val text)` → `numeric` |

### Acción recomendada:

- Agregar sección "RPCs Completas" en `scheme.md` que cubra todas las funciones.
- Priorizar documentar las de Finance y Inventory ya que tienen impacto operativo.

---

## 🟡 4. Gaps de Lógica de Negocio sin Respaldo en DB

Reglas de negocio definidas en `synthesis-report.md` § "Gaps de Control" que **no tienen objetos DB correspondientes**:

| #   | Gap (synthesis-report.md)                                                                             | ¿Existe tabla/vista/RPC?                                                                               | Estado                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | **Consumos "Sin Cargo" / Bonificaciones** — Ticket nominativo con motivo y responsable                | ❌ No hay tabla `cortesia_tickets` ni vista de auditoría de cortesías                                  | **NO IMPLEMENTADO** — Solo se registra `q_sin_cargo` como número en `revenue_details`   |
| 2   | **Eventos de Auditoría por Desvío de Caja** — Diferencia debe crear evento con comentario obligatorio | ❌ No hay tabla `audit_events` ni mecanismo de resolución                                              | **NO IMPLEMENTADO** — La diferencia se calcula en `closing_terminals` pero no se escala |
| 3   | **Ranking de Productos Críticos** — Score Compuesto (Valor 50%, Rotación 30%, Riesgo 20%)             | ❌ No hay vista `vw_product_risk_ranking`                                                              | **NO IMPLEMENTADO**                                                                     |
| 4   | **Control de Accesos (Validación QR)** — Flujo de datos de primera clase dentro del Workday           | ⚠️ Parcial — `qr_codes`, `qr_checkins`, `qr_batches` existen pero no hay vista consolidada por workday | **PARCIALMENTE IMPLEMENTADO** — Falta `vw_workday_access_summary`                       |

---

## 🟡 5. Lógica Infiltrada en Frontend (debería migrarse a RPCs)

Operaciones críticas que se ejecutan desde JavaScript (`Supabase.from().update()`) en vez de RPCs server-side:

| #   | Operación                              | Módulo JS                   | Tablas afectadas                                                | Riesgo                                                                                       |
| --- | -------------------------------------- | --------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | **Apertura/Cierre de sesión de barra** | `encargado-barra-noche.js`  | `bar_sessions`, `bar_stock_snapshots`                           | Sin validación DB-side. Un encargado podría abrir sesión sin workday ACTIVE via API directa. |
| 2   | **Declaración de montos de terminal**  | `encargado-caja-noche.js`   | `closing_terminals`                                             | Sin guards DB-side. Permite sobreescribir `declared_*` sin restricción.                      |
| 3   | **Distribución de stock (logística)**  | `logistica-distribucion.js` | `inventory_stock`, `inventory_movements`, `replenishment_items` | Operación multi-tabla sin transacción. Fallo parcial puede dejar stock inconsistente.        |

> [!IMPORTANT]
> El flujo `bar-manager-night.md` documenta explícitamente: "lógica del lado del cliente que
> interactúa directamente con las tablas de Supabase, **sin usar Funciones Remotas (RPCs)**".
> Esto es una decisión arquitectónica conocida pero de alto riesgo.

### Acción recomendada:

- Crear RPCs transaccionales para las 3 operaciones (al menos para bar sessions y distribución).
- Los guards de `rpc_close_work_day` ya comprueban bars cerradas — esto protege parcialmente.

---

## 🟢 6. Inconsistencias Menores en `scheme.md`

| #   | Inconsistencia                                                                                                                                                                                   | Ubicación                          | Corrección                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | Columnas de `vw_bar_audit_variance` desactualizadas después de migración `fix_bar_audit_math`                                                                                                    | Líneas 1188-1201                   | Agregar columnas: `stock_effective`, `unidades_repuestas`, `session_id`, `location` |
| 2   | Columna `status` de `bar_sessions` documentada como `'active'` pero el RPC `rpc_close_work_day` verifica `'active'` (consistente) — sin embargo `getOpenWorkDay()` en JS busca `status = 'open'` | Flujo `bar-manager-night` línea 20 | Verificar si el frontend usa `'open'` o `'active'` — potencial bug si no coinciden  |

---

## 7. Matriz de Cobertura: Business Logic → Implementación

| Flujo de Negocio                 | Tablas     | Vistas                          | RPCs                            | Guards DB             | Estado                 |
| -------------------------------- | ---------- | ------------------------------- | ------------------------------- | --------------------- | ---------------------- |
| Workday Lifecycle (DRAFT→CLOSED) | ✅         | ✅                              | ✅ 8 RPCs                       | ✅ Sí                 | **ROBUSTO**            |
| Cash Closing Nocturno            | ✅         | ⚠️ `vw_night_snapshot` faltante | ⚠️ Solo `rpc_close`             | ⚠️ Parcial            | **FUNCIONAL con gaps** |
| Bar Manager Night                | ✅         | ✅ Vistas corregidas            | ❌ Sin RPCs                     | ❌ Sin guards         | **VULNERABLE**         |
| Staff/Payroll                    | ✅         | ✅ `vw_staff_accruals_summary`  | ✅ 2 RPCs                       | ✅ Guards en accruals | **ROBUSTO**            |
| Replenishment/Logistics          | ✅         | ✅ `vw_stock_global`            | ✅ `rpc_receive_supplier_order` | ⚠️ Parcial            | **FUNCIONAL**          |
| Balance Semanal                  | ✅ Tabla   | ❌ `vw_finance_weekly` faltante | ❌                              | ❌                    | **ROTO**               |
| Reportes Mensuales               | ✅ Tablas  | ❌ `vw_pnl_monthly_v2` faltante | ❌                              | ❌                    | **ROTO**               |
| QR / Access Control              | ⚠️ Parcial | ❌ Sin vista consolidada        | ❌                              | ❌                    | **INCOMPLETO**         |

---

## 8. Priorización de Remediación

### P0 — Urgente (Pantallas rotas)

1. Crear migración para `vw_pnl_monthly_v2`
2. Crear migración para `vw_financial_week_live` o `vw_finance_weekly`
3. Crear migración para `vw_night_snapshot`
4. Corregir firma documentada de `admin_export_accruals_to_payments`

### P1 — Alta (Seguridad/Integridad)

5. Crear RPC transaccional para apertura/cierre de bar sessions
6. Crear RPC transaccional para distribución de stock
7. Documentar las 16 RPCs faltantes en `scheme.md`

### P2 — Media (Completitud de negocio)

8. Implementar tabla/vista para auditoría de cortesías (Gap 1)
9. Implementar tabla `audit_events` para desvíos de caja (Gap 2)
10. Crear `vw_stock_audit_nightly` (documentada, nunca creada)

### P3 — Baja (Mejora continua)

11. Crear `vw_product_risk_ranking` (Score Compuesto)
12. Crear `vw_workday_access_summary` (QR consolidado)
13. Actualizar columnas de `vw_bar_audit_variance` en `scheme.md`
14. Auditoría RLS completa
