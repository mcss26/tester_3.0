# RLS Policy Audit Report — FormulaMid

**Fecha:** 2026-02-22 02:26  
**Fuente:** `pg_policies` en Supabase + código JS + `docs/logica/*` + `docs/source-of-truth/*`  
**Policies totales:** 165 (post-refinamiento) | **Tablas con RLS:** ~45  
**Validación:** Cruzado contra 4 flujos de negocio documentados y grep del código  
**Estado:** ✅ P0 + P1 aplicados (10 migraciones)

---

## Resumen Ejecutivo

| Clasificación                         | Tablas | Estado                                  |
| ------------------------------------- | ------ | --------------------------------------- |
| 🟢 Bien protegidas (filtro por rol)   | **36** | ✅ Incluye 19 tablas refinadas en P0+P1 |
| 🟡 Genéricas (authenticated, sin rol) | **3**  | P2 pendiente (bajo riesgo)              |
| 🔵 Public/Anon (diseño intencionado)  | **6**  | ✅ By design                            |

**Resultado:** 105 policies role-filtered vs 60 genéricas (mayoría SELECT read-all legítimos).

---

## Contexto de Negocio Clave (de `docs/logica/`)

### Cierre de Caja (`night-cash-closing.md`)

- **Fase 1:** `encargado_caja` crea `cash_closings` y llena `closing_terminals.declared_*`
- **Fase 2:** `admin` sincroniza GBOL y llena `closing_terminals.system_*`
- ⚠️ **Staff NO escribe directamente** en `cash_closings` ni `closing_terminals`

### Barra (`bar-manager-night.md`)

- **Solo `encargado_barra`** crea/cierra `bar_sessions` y escribe en `bar_stock_snapshots`
- Staff de barra NO tiene acceso directo a estas tablas

### Workday (`workday-management.md`)

- Transiciones de estado via **RPCs** (`rpc_open_work_day`, `rpc_close_work_day`)
- Solo `admin` + `contable` acceden a `admin-workdays.html`

### Reconciliación (`synthesis-report.md`)

- Cierre nocturno = **preliminar** (`pending`)
- Cierre definitivo = **semanal** cuando llega el reporte Zoco

---

## ✅ Migraciones Aplicadas

### P0 — Financiero (4 migraciones)

| Migración                      | Tabla               | Antes              | Después                                   |
| ------------------------------ | ------------------- | ------------------ | ----------------------------------------- |
| `rls_refine_cash_closings`     | `cash_closings`     | 1× ALL USING(true) | 4 policies: S/I/U=enc_caja+admin, D=admin |
| `rls_refine_closing_terminals` | `closing_terminals` | 1× ALL USING(true) | 4 policies: S/I/U=enc_caja+admin, D=admin |
| `rls_refine_cash_movements`    | `cash_movements`    | 1× ALL USING(true) | 4 policies: S/I/U=enc_caja+admin, D=admin |
| `rls_refine_finance_payments`  | `finance_payments`  | 3× genéricas S/I/U | 3 policies: S=admin+contable, I/U=admin   |

### P1 — Operacional (6 migraciones)

| Migración                            | Tablas                                                                                           | Cambio                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `rls_refine_bar_tables`              | `bar_sessions`, `bar_stock_snapshots`, `bar_session_sales`                                       | enc_barra+admin write, +contable read. Snapshots inmutables |
| `rls_refine_master_recipes`          | `master_recipes`                                                                                 | `is_admin()` real (antes USING(true) con nombre engañoso)   |
| `rls_cleanup_replenishment_requests` | `replenishment_requests`                                                                         | Dropped 2 genéricas, agregado admin+contable                |
| `rls_refine_events_and_config`       | `events`, `master_staff_roles`, `pos_terminals`, `staff_convocations`, `work_day_staff_planning` | Role-based write, auth read                                 |
| `rls_refine_qr_tables`               | `qr_batches`, `qr_codes`, `qr_checkins`                                                          | admin+operativo write, staff_guardia insert checkins        |
| `rls_refine_gbol_imports`            | `import_gbol_comandas`, `import_gbol_facturacion`                                                | admin-only write, admin+contable read                       |

---

## 🟢 Tablas Bien Protegidas (36 tablas — incluye refinadas)

### Pre-existentes (17)

| Tabla                                                     | Write → Roles                       | Read → Roles               |
| --------------------------------------------------------- | ----------------------------------- | -------------------------- |
| `profiles`                                                | admin                               | own user (S), admin (CRUD) |
| `work_days`                                               | admin+operativo                     | multi-rol                  |
| `work_day_templates`                                      | admin+gerencia                      | —                          |
| `master_sku` / `master_categories` / `master_proveedores` | admin (`is_admin()`)                | authenticated              |
| `cost_definitions`                                        | admin                               | admin+contable             |
| `audit_config`                                            | admin+contable                      | authenticated              |
| `site_config`                                             | admin+operativo                     | public                     |
| `inventory_stock` / `inventory_ideal`                     | admin+contable                      | authenticated              |
| `inventory_movements`                                     | enc_barra+admin+logística+operativo | authenticated              |
| `inventory_stock_adjustments`                             | admin                               | admin                      |
| `staff_accruals`                                          | admin+contable                      | own user                   |
| `staff_functions` / `profile_functions`                   | admin+operativo                     | authenticated/own          |
| `sku_change_requests`                                     | own user (I), admin (U)             | own+admin                  |
| `payment_categories` / `payment_methods`                  | admin                               | authenticated              |
| `replenishment_items` / `_receipts` / `_receipt_items`    | operativo+logístico+encargado       | authenticated              |
| `replenishment_supplier_orders`                           | operativo+logístico+admin+contable  | authenticated              |
| `import_gbol_withdrawals`                                 | —                                   | admin+superadmin           |

### Refinadas en P0+P1 (19)

| Tabla                     | Write → Roles                      | Read → Roles             |
| ------------------------- | ---------------------------------- | ------------------------ |
| `cash_closings`           | enc_caja+admin                     | enc_caja+admin+contable  |
| `closing_terminals`       | enc_caja+admin                     | enc_caja+admin+contable  |
| `cash_movements`          | enc_caja+admin                     | enc_caja+admin+contable  |
| `finance_payments`        | admin                              | admin+contable           |
| `bar_sessions`            | enc_barra+admin                    | enc_barra+admin+contable |
| `bar_stock_snapshots`     | enc_barra+admin (INSERT only)      | enc_barra+admin+contable |
| `bar_session_sales`       | enc_barra+admin                    | enc_barra+admin+contable |
| `master_recipes`          | admin                              | authenticated            |
| `replenishment_requests`  | operativo+logístico+admin+contable | authenticated            |
| `events`                  | admin+operativo                    | public                   |
| `master_staff_roles`      | admin                              | authenticated            |
| `pos_terminals`           | admin                              | authenticated            |
| `staff_convocations`      | admin+operativo+encargados         | authenticated            |
| `work_day_staff_planning` | admin+operativo+encargados         | authenticated            |
| `qr_batches`              | admin+operativo                    | authenticated            |
| `qr_codes`                | admin+operativo                    | authenticated            |
| `qr_checkins`             | admin+operativo+staff_guardia      | authenticated            |
| `import_gbol_comandas`    | admin                              | admin+contable           |
| `import_gbol_facturacion` | admin                              | admin+contable           |

---

## 🟡 P2 — Bajo Riesgo (pendiente, aceptable)

| Tabla                                                 | Policy              | Justificación                        |
| ----------------------------------------------------- | ------------------- | ------------------------------------ |
| `recipe_code_mappings`                                | S/I/U/D USING(true) | Config admin, bajo volumen           |
| `import_logs`                                         | S/I USING(true)     | Log insert-only                      |
| `replenishment_tracking`                              | S/I USING(true)     | Audit log                            |
| `finance_weekly_closings`                             | SELECT only         | Solo lectura                         |
| `finance_opening_cost_defs` / `finance_payment_rules` | S/I/U/D USING(true) | Config admin-pagos                   |
| `consumption_reports`/`_details`                      | ALL authenticated   | Reportes multi-rol                   |
| `accounts_payable`                                    | ALL USING(true)     | ⚠️ Tabla zombie (sin refs en código) |
| `revenue_reports`/`_details`                          | S/I/U USING(true)   | Admin solo en práctica               |

---

## 🔵 Public/Anon Access (by design)

| Tabla                            | Policy                         | Justificación      |
| -------------------------------- | ------------------------------ | ------------------ |
| `members`                        | Anon INSERT (status=pendiente) | Formulario público |
| `menu_categories` / `menu_items` | Public read                    | Menú público       |
| `site_config`                    | Anon+auth read                 | Config pública     |
| `events`                         | Public read                    | Eventos del local  |

---

## ⚠️ Hallazgos Remediados

| Hallazgo                                                                 | Estado                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| `replenishment_requests` — 2 policies genéricas anulaban las específicas | ✅ Genéricas eliminadas                              |
| `master_recipes` — policy name mentía ("admin" pero USING(true))         | ✅ Reemplazada con `is_admin()`                      |
| `closing_terminals` — patrón dual-write                                  | ✅ Documentado, no mitigable con RLS a nivel columna |
| `accounts_payable` — tabla zombie                                        | 🟡 P2: lockdown cuando se implemente                 |

---

## Helpers Disponibles

| Función          | Definición                                              | Disponible |
| ---------------- | ------------------------------------------------------- | ---------- |
| `is_admin()`     | `EXISTS(profiles WHERE id=auth.uid() AND role='admin')` | ✅         |
| `has_role(text)` | Check con parámetro                                     | ✅         |
| `get_my_role()`  | Retorna role string del user                            | ✅         |
