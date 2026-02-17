# Doc Mapper Report -- FormulaMid 4

> **Generado:** 2026-02-17 07:42 | **Documentos:** 80 | **Dependencias:** 869

---

## 1. Resumen por CategorÃ­a

| Categoria | Cantidad | Dependencias |
| :--- | :---: | :---: |
| **modules** | 39 | 397 |
| **migration** | 10 | 44 |
| **testing** | 8 | 12 |
| **core** | 6 | 333 |
| **root** | 5 | 10 |
| **business-logic** | 4 | 37 |
| **guides** | 3 | 1 |
| **data-reference** | 2 | 5 |
| **scripts** | 1 | 0 |
| **audits** | 1 | 8 |
| **codex** | 1 | 22 |

## 2. Tablas Mas Referenciadas

| Tabla | Referencias |
| :--- | :---: |
| `work_days` | 22 |
| `profiles` | 16 |
| `master_sku` | 16 |
| `replenishment_supplier_orders` | 13 |
| `master_proveedores` | 13 |
| `replenishment_items` | 11 |
| `staff_convocations` | 11 |
| `master_staff_roles` | 11 |
| `replenishment_requests` | 10 |
| `inventory_movements` | 10 |
| `master_categories` | 9 |
| `closing_terminals` | 9 |
| `work_day_staff_planning` | 9 |
| `staff_accruals` | 9 |
| `inventory_stock` | 8 |

## 3. Documentos Mas Conectados

| Documento | CategorÃ­a | Deps | Tablas | Vistas | RPCs |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `docs/backend-architecture-map.md` | core | 105 | 65 | 20 | 20 |
| `docs/estado-presente.md` | core | 103 | 65 | 25 | 0 |
| `docs/scheme.md` | core | 67 | 50 | 17 | 0 |
| `docs/screen-map.md` | core | 40 | 33 | 6 | 0 |
| `docs/codex/PLAN_PRODUCTION_READY.md` | codex | 22 | 9 | 0 | 5 |
| `docs/modules/admin/admin-pagos.md` | modules | 20 | 6 | 0 | 2 |
| `docs/migration/artifacts/erp-diagnostic-workdays.md` | migration | 19 | 5 | 8 | 6 |
| `docs/business-logic/flows/workday-management.md` | business-logic | 19 | 8 | 4 | 4 |
| `docs/modules/admin/admin-central-stock.md` | modules | 18 | 12 | 1 | 0 |
| `docs/modules/operativo/operativo-workday.md` | modules | 17 | 7 | 0 | 0 |

## 4. Documentos Huerfanos (sin referencia entrante)

- `assets/preview.md` -- Auditor & Control Panel (UI Sandbox)
- `docs/audits/audit-solicitudes-reposicion.md` -- AuditorÃ­a â€” Flujo Solicitudes / ReposiciÃ³n
- `docs/business-logic/flows/bar-manager-night.md` -- Flujo de Negocio: Noche del Encargado de Barra
- `docs/business-logic/flows/night-cash-closing.md` -- Flujo de Negocio: Cierre de Caja Nocturno
- `docs/business-logic/flows/workday-management.md` -- Flujo de Negocio: GestiÃ³n de Jornadas de Trabajo (Workday)
- `docs/codex/PLAN_PRODUCTION_READY.md` -- PLAN PRODUCTION READY - tester_3.0
- `docs/important-data-reference/feature-spec-drinks-by-web.md` -- Feature Spec: Drinks by Web (ConsumiciÃ³n Digital)
- `docs/important-data-reference/user-flows-by-role.md` -- User Flows por Rol â€” Mapa Completo + Gap Analysis
- `docs/migration/artifacts/erp-diagnostic-workdays.md` -- ðŸ§  ERP Architect â€” DiagnÃ³stico: MÃ³dulo Workdays
- `docs/migration/artifacts/kpi-audit.md` -- KPI Audit: Mock Data vs Supabase Schema
- `docs/migration/artifacts/README.md` -- Artefactos de MigraciÃ³n
- `docs/migration/artifacts/roadmap_production.md` -- ðŸ—ºï¸ Workdays: Roadmap a ProducciÃ³n
- `docs/migration/artifacts/sprint3-implementation_plan.md` -- Sprint 3 â€” Frontend Polish: Robustez y Responsividad
- `docs/migration/artifacts/sprint3-walkthrough.md` -- Sprint 3 â€” Frontend Polish: Walkthrough
- `docs/migration/artifacts/ux_research_workdays.md` -- ðŸ”¬ UX Research Report: Workdays Prototypes
- `docs/migration/artifacts/workdays-ui-implementation_plan.md` -- Workdays â€” 6 Edits Plan
- `docs/migration/artifacts/workdays-ui-walkthrough.md` -- Workdays Density Polish â€” Walkthrough
- `docs/modules/admin/admin-config.md` -- Admin: ConfiguraciÃ³n
- `docs/modules/admin/admin-index.md` -- Admin Index (Portal)
- `docs/modules/admin/admin-master-categorias.md` -- Admin Master CategorÃ­as
- `docs/modules/admin/admin-master-pos.md` -- Admin Master POS
- `docs/modules/admin/admin-master-tarifario.md` -- Admin Master Tarifario
- `docs/modules/admin/admin-reportes.md` -- Reportes Operativos
- `docs/modules/admin/test-devenciones.md` -- Admin: Test Devenciones
- `docs/modules/encargados/encargado-barra-index.md` -- Encargado Barra - Index
- `docs/modules/encargados/encargado-barra-noche.md` -- Encargado Barra - Control de Stock (Noche)
- `docs/modules/encargados/encargado-barra-personal.md` -- Encargado Barra - GestiÃ³n de Personal
- `docs/modules/encargados/encargado-caja-index.md` -- Encargado Caja Index
- `docs/modules/encargados/encargado-caja-noche.md` -- Encargado Caja Noche
- `docs/modules/encargados/encargado-caja-personal.md` -- Encargado Caja Personal
- `docs/modules/encargados/encargado-recepcion.md` -- Encargado RecepciÃ³n
- `docs/modules/gerencia/balance-semanal.md` -- Gerencia: Balance Semanal
- `docs/modules/logistica/logistica-distribucion.md` -- DistribuciÃ³n a Barras (LogÃ­stica)
- `docs/modules/logistica/logistica-index.md` -- LogÃ­stica Index
- `docs/modules/logistica/logistica-seguimiento.md` -- LogÃ­stica: Seguimiento
- `docs/modules/members/my-qr.md` -- Members: Mi QR
- `docs/modules/misc/login.md` -- Login
- `docs/modules/operativo/cms-members.md` -- CMS Members
- `docs/modules/operativo/operativo-erp.md` -- Operativo ERP (MenÃº)
- `docs/modules/operativo/operativo-index.md` -- Operativo Index (Portal)
- `docs/modules/operativo/operativo-workday.md` -- Operativo Workday
- `docs/modules/staff/staff-barra-index.md` -- Staff Barra - Landing
- `docs/modules/staff/staff-caja-index.md` -- Terminal de Cajero (Staff)
- `docs/testing/observations/_template.md` -- [nombre-pantalla]
- `docs/testing/tickets/_template.md` -- TK-[NNN]: [tÃ­tulo]
- `docs/testing/tickets/TK-001-crypto-randomuuid-compat.md` -- TK-001: crypto.randomUUID() no disponible â€” bloquea creaciÃ³n de eventos con QR
- `docs/testing/tickets/TK-002-modal-showmodal-compat.md` -- TK-002: modal.showModal() is not a function â€” bloquea creaciÃ³n de Workday
- `docs/testing/tickets/TK-003-staff-cost-not-recalculating.md` -- TK-003: Staff Costs No Recalculan al Cambiar Cantidad
- `docs/testing/tickets/TK-004-staff-dropdowns-empty.md` -- TK-004: Dropdowns de AsignaciÃ³n de Staff VacÃ­os / Opciones Incorrectas
- `docs/testing/tickets/TK-005-base-salary-column-missing.md` -- TK-005: SELECT incluye columna `base_salary` inexistente â€” ROMPE TODA la carga
- `reporte_comparativo_ui_scan.md` -- (sin titulo)
- `scripts/README.md` -- Solo listar, no modificar nada
- `test-data/README.md` -- Archivos CSV de Prueba - Testing Fases 1-5

## 5. Inventario Completo

### modules (39 docs)

#### `docs/modules/_template.md`
- **Titulo:** [Nombre del MÃ³dulo]
- **Lineas:** 196 | **Tamano:** 4.9 KB | **Modificado:** 2026-02-15
- **Vistas:** `vw_vista_b`
- **JS:** `assets/js/modules/[categoria]/[archivo].js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/[categoria]/[archivo].html`

#### `docs/modules/admin/admin-central-stock.md`
- **Titulo:** Admin Central Stock
- **Lineas:** 46 | **Tamano:** 2.4 KB | **Modificado:** 2026-02-05
- **Tablas:** `consumption_details``, ``consumption_reports``, ``inventory_movements``, ``inventory_stock``, ``master_categories``, ``master_proveedores``, ``master_recipes``, ``master_sku``, ``revenue_details``, ``revenue_reports``, ``sku_change_requests``, ``work_days`
- **Vistas:** `vw_stock_global`
- **JS:** `core/auth.js``, ``core/supabase-client.js``, ``core/utils.js``, ``modules/admin/admin-central-stock.js`
- **HTML:** `pages/admin/admin-central-stock.html`

#### `docs/modules/admin/admin-config.md`
- **Titulo:** Admin: ConfiguraciÃ³n
- **Lineas:** 138 | **Tamano:** 4.1 KB | **Modificado:** 2026-02-08
- **Tablas:** `cost_config``, ``master_sku`
- **JS:** `assets/js/modules/admin/admin-config.js``, ``core/auth.js``, ``core/supabase-client.js``, ``core/toast.js`
- **HTML:** `pages/admin/admin-config.html`

#### `docs/modules/admin/admin-index.md`
- **Titulo:** Admin Index (Portal)
- **Lineas:** 53 | **Tamano:** 2.4 KB | **Modificado:** 2026-02-01
- **Tablas:** `profiles``, ``work_days`
- **JS:** `assets/js/modules/admin/admin-navigation.js``, ``assets/js/modules/work-day-helper.js``, ``assets/js/pages/admin/admin-index.js`
- **HTML:** `pages/admin/admin-index.html`
- **CSS:** `assets/css/pages/admin-index.css`

#### `docs/modules/admin/admin-master-categorias.md`
- **Titulo:** Admin Master CategorÃ­as
- **Lineas:** 230 | **Tamano:** 9.4 KB | **Modificado:** 2026-02-15
- **Links MD:** admin-central-stock.md
- **Tablas:** `master_categories`
- **JS:** `assets/js/modules/admin/admin-master-categorias.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/panel.js`
- **HTML:** `pages/admin/admin-master-categorias.html`

#### `docs/modules/admin/admin-master-pos.md`
- **Titulo:** Admin Master POS
- **Lineas:** 228 | **Tamano:** 9.5 KB | **Modificado:** 2026-02-10
- **Links MD:** workdays.md
- **Tablas:** `pos_terminals`
- **JS:** `assets/js/modules/admin/admin-master-pos.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/panel.js`
- **HTML:** `pages/admin/admin-master-pos.html`

#### `docs/modules/admin/admin-master-proveedores.md`
- **Titulo:** Admin Master Proveedores
- **Lineas:** 217 | **Tamano:** 9.4 KB | **Modificado:** 2026-02-15
- **Links MD:** admin-central-stock.md, admin-pagos.md, admin-solicitudes.md
- **Tablas:** `master_proveedores`
- **JS:** `assets/js/modules/admin/admin-master-proveedores.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/panel.js`
- **HTML:** `pages/admin/admin-master-proveedores.html`

#### `docs/modules/admin/admin-master-tarifario.md`
- **Titulo:** Admin Master Tarifario
- **Lineas:** 231 | **Tamano:** 9.5 KB | **Modificado:** 2026-02-15
- **Links MD:** workdays.md
- **Tablas:** `master_staff_roles`
- **JS:** `assets/js/modules/admin/admin-master-tarifario.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/panel.js`
- **HTML:** `pages/admin/admin-master-tarifario.html`

#### `docs/modules/admin/admin-pagos.md`
- **Titulo:** Admin Pagos (GestiÃ³n de Finanzas)
- **Lineas:** 351 | **Tamano:** 15.9 KB | **Modificado:** 2026-02-15
- **Links MD:** admin-master-proveedores.md, admin-solicitudes.md, workdays.md
- **Tablas:** `finance_opening_cost_defs``, ``finance_payment_rules``, ``finance_payments``, ``master_proveedores``, ``replenishment_supplier_orders``, ``work_days`
- **RPCs:** `admin_generate_rule_payments``, ``admin_mark_payment_done`
- **JS:** `assets/js/modules/admin/admin-pagos.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/modal.js`
- **HTML:** `pages/admin/admin-pagos.html`
- **CSS:** `assets/css/modules/admin/admin-pagos.css`

#### `docs/modules/admin/admin-reportes.md`
- **Titulo:** Reportes Operativos
- **Lineas:** 25 | **Tamano:** 0.9 KB | **Modificado:** 2026-02-01
- **Vistas:** `vw_report_sales_closing``, ``vw_report_staff_performance`
- **JS:** `assets/js/modules/admin/admin-reportes.js`
- **HTML:** `pages/admin/admin-reportes.html`

#### `docs/modules/admin/admin-solicitudes.md`
- **Titulo:** Admin Solicitudes (AprobaciÃ³n de Pedidos)
- **Lineas:** 285 | **Tamano:** 12.7 KB | **Modificado:** 2026-02-15
- **Links MD:** admin-pagos.md, admin-central-stock.md, admin-master-proveedores.md
- **Tablas:** `master_proveedores``, ``master_sku``, ``replenishment_items``, ``replenishment_requests``, ``replenishment_supplier_orders`
- **JS:** `assets/js/modules/admin/admin-solicitudes.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/modal.js`
- **HTML:** `pages/admin/admin-solicitudes.html`

#### `docs/modules/admin/test-devenciones.md`
- **Titulo:** Admin: Test Devenciones
- **Lineas:** 84 | **Tamano:** 2.7 KB | **Modificado:** 2026-02-12
- **Links MD:** workdays.md
- **Tablas:** `staff_accruals``, ``staff_convocations`
- **Vistas:** `vw_staff_accruals_summary`
- **RPCs:** `admin_export_accruals_to_payments``, ``admin_generate_workday_accruals`
- **HTML:** `pages/admin/test-devenciones.html`

#### `docs/modules/admin/workdays.md`
- **Titulo:** WORKDAYS â€” Admin Module
- **Lineas:** 103 | **Tamano:** 3.6 KB | **Modificado:** 2026-02-10
- **Tablas:** `finance_payments``, ``work_day_staff_planning``, ``work_days`
- **Vistas:** `vw_daily_sales``, ``vw_night_snapshot`
- **RPCs:** `admin_generate_workday_accruals``, ``rpc_close_work_day``, ``rpc_confirm_work_day``, ``rpc_open_work_day``, ``rpc_revert_work_day`
- **JS:** `assets/js/modules/admin/admin-workdays.js`
- **HTML:** `pages/admin/admin-workdays.html`
- **CSS:** `assets/css/components.css`

#### `docs/modules/encargados/encargado-barra-index.md`
- **Titulo:** Encargado Barra - Index
- **Lineas:** 33 | **Tamano:** 1.6 KB | **Modificado:** 2026-02-01
- **Tablas:** `profiles``, ``work_days`
- **Vistas:** `vw_supplier_orders_encargado`
- **JS:** `core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/encargados/encargado-barra-index.html`

#### `docs/modules/encargados/encargado-barra-noche.md`
- **Titulo:** Encargado Barra - Control de Stock (Noche)
- **Lineas:** 39 | **Tamano:** 1.8 KB | **Modificado:** 2026-02-01
- **Tablas:** `bar_sessions``, ``bar_stock_snapshots``, ``master_sku``, ``work_days`
- **JS:** `core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/encargados/encargado-barra-noche.html`

#### `docs/modules/encargados/encargado-barra-personal.md`
- **Titulo:** Encargado Barra - GestiÃ³n de Personal
- **Lineas:** 43 | **Tamano:** 1.9 KB | **Modificado:** 2026-02-01
- **Tablas:** `master_staff_roles``, ``profiles``, ``staff_convocations``, ``work_day_staff_planning``, ``work_days`
- **JS:** `core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/encargados/encargado-barra-personal.html`

#### `docs/modules/encargados/encargado-caja-index.md`
- **Titulo:** Encargado Caja Index
- **Lineas:** 105 | **Tamano:** 3.2 KB | **Modificado:** 2026-02-01
- **Tablas:** `profiles``, ``work_days`
- **JS:** `assets/js/modules/encargados/encargado-caja-index.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/encargados/encargado-caja-index.js``, ``modules/index-navigation.js``, ``modules/work-day-helper.js`
- **HTML:** `pages/encargados/encargado-caja-index.html`

#### `docs/modules/encargados/encargado-caja-noche.md`
- **Titulo:** Encargado Caja Noche
- **Lineas:** 147 | **Tamano:** 4.9 KB | **Modificado:** 2026-02-01
- **Tablas:** `cash_closings``, ``cash_movements``, ``closing_terminals``, ``pos_terminals``, ``profiles``, ``work_days`
- **JS:** `assets/js/modules/encargados/encargado-caja-noche.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/encargados/encargado-caja-noche.js``, ``modules/index-navigation.js`
- **HTML:** `pages/encargados/encargado-caja-noche.html`

#### `docs/modules/encargados/encargado-caja-personal.md`
- **Titulo:** Encargado Caja Personal
- **Lineas:** 120 | **Tamano:** 3.8 KB | **Modificado:** 2026-02-01
- **Tablas:** `master_staff_roles``, ``profiles``, ``staff_convocations``, ``work_day_staff_planning``, ``work_days`
- **JS:** `assets/js/modules/encargados/encargado-caja-personal.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/encargados/encargado-caja-personal.js``, ``modules/index-navigation.js`
- **HTML:** `pages/encargados/encargado-caja-personal.html`

#### `docs/modules/encargados/encargado-recepcion.md`
- **Titulo:** Encargado RecepciÃ³n
- **Lineas:** 256 | **Tamano:** 11.6 KB | **Modificado:** 2026-02-15
- **Links MD:** ./admin/admin-solicitudes.md, ./admin/admin-central-stock.md, ./admin/admin-master-proveedores.md
- **Tablas:** `inventory_movements``, ``master_sku``, ``replenishment_items``, ``replenishment_supplier_orders`
- **RPCs:** `rpc_receive_supplier_order`
- **JS:** `assets/js/modules/encargados/encargado-recepcion.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/encargados/encargado-recepcion.html`

#### `docs/modules/gerencia/balance-semanal.md`
- **Titulo:** Gerencia: Balance Semanal
- **Lineas:** 128 | **Tamano:** 4 KB | **Modificado:** 2026-02-08
- **Vistas:** `vw_finance_weekly`
- **JS:** `assets/js/modules/gerencia/balance-semanal.js``, ``core/auth.js``, ``core/chart-loader.js``, ``core/utils.js`
- **HTML:** `pages/gerencia/balance-semanal.html`

#### `docs/modules/logistica/logistica-distribucion.md`
- **Titulo:** DistribuciÃ³n a Barras (LogÃ­stica)
- **Lineas:** 57 | **Tamano:** 2.1 KB | **Modificado:** 2026-02-01
- **Tablas:** `inventory_movements``, ``profiles``, ``replenishment_items``, ``replenishment_requests`
- **Vistas:** `vw_stock_global`
- **JS:** `assets/js/core/notify.js``, ``assets/js/modules/logistica/logistica-distribucion.js`
- **HTML:** `pages/logistica/logistica-distribucion.html`

#### `docs/modules/logistica/logistica-index.md`
- **Titulo:** LogÃ­stica Index
- **Lineas:** 33 | **Tamano:** 1.1 KB | **Modificado:** 2026-02-01
- **Tablas:** `profiles``, ``replenishment_requests``, ``replenishment_supplier_orders`
- **JS:** `assets/js/core/auth.js``, ``assets/js/modules/index-navigation.js`
- **HTML:** `pages/logistica/logistica-index.html`

#### `docs/modules/logistica/logistica-recepcion.md`
- **Titulo:** RecepciÃ³n de MercaderÃ­a (LogÃ­stica)
- **Lineas:** 68 | **Tamano:** 2.6 KB | **Modificado:** 2026-02-01
- **Tablas:** `inventory_movements``, ``inventory_stock``, ``master_proveedores``, ``master_sku``, ``replenishment_items``, ``replenishment_receipt_items``, ``replenishment_receipts``, ``replenishment_supplier_orders`
- **Vistas:** `vw_supplier_orders_encargado`
- **JS:** `assets/js/core/notify.js``, ``assets/js/modules/logistica/logistica-recepcion.js`
- **HTML:** `pages/logistica/logistica-recepcion.html`

#### `docs/modules/logistica/logistica-seguimiento.md`
- **Titulo:** LogÃ­stica: Seguimiento
- **Lineas:** 155 | **Tamano:** 5.3 KB | **Modificado:** 2026-02-08
- **Links MD:** logistica-stock.md, logistica-recepcion.md
- **Tablas:** `master_proveedores``, ``replenishment_supplier_orders``, ``replenishment_tracking`
- **JS:** `assets/js/modules/logistica/logistica-seguimiento.js``, ``core/auth.js``, ``core/panel.js``, ``core/utils.js`
- **HTML:** `pages/logistica/logistica-seguimiento.html`

#### `docs/modules/logistica/logistica-stock.md`
- **Titulo:** Stock DepÃ³sito (LogÃ­stica)
- **Lineas:** 57 | **Tamano:** 2.2 KB | **Modificado:** 2026-02-01
- **Tablas:** `inventory_movements``, ``inventory_stock``, ``inventory_stock_adjustments``, ``master_categories``, ``master_sku`
- **Vistas:** `vw_stock_global`
- **JS:** `assets/js/modules/logistica/logistica-stock.js``, ``assets/js/modules/work-day-helper.js`
- **HTML:** `pages/logistica/logistica-stock.html`

#### `docs/modules/members/my-qr.md`
- **Titulo:** Members: Mi QR
- **Lineas:** 100 | **Tamano:** 3 KB | **Modificado:** 2026-02-15
- **Links MD:** ./misc/login.md, ./admin/admin-index.md
- **Tablas:** `events``, ``members`
- **JS:** `assets/js/members/my-qr.js`
- **HTML:** `pages/members/login.html``, ``pages/members/my-qr.html`

#### `docs/modules/misc/login.md`
- **Titulo:** Login
- **Lineas:** 83 | **Tamano:** 2.3 KB | **Modificado:** 2026-02-01
- **Tablas:** `profiles`
- **JS:** `assets/js/modules/login.js`

#### `docs/modules/operativo/cms-members.md`
- **Titulo:** CMS Members
- **Lineas:** 322 | **Tamano:** 14.5 KB | **Modificado:** 2026-02-15
- **Tablas:** `members`
- **JS:** `assets/js/modules/cms-members.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/operativo/cms-members.html`

#### `docs/modules/operativo/operativo-analisis.md`
- **Titulo:** Operativo AnÃ¡lisis
- **Lineas:** 267 | **Tamano:** 13.1 KB | **Modificado:** 2026-02-01
- **Links MD:** operativo-stock.md, operativo-solicitudes.md, operativo-master-sku.md
- **Tablas:** `consumption_details``, ``consumption_reports``, ``master_sku`
- **JS:** `assets/js/modules/operativo/operativo-analisis.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/operativo/operativo-analisis.html`

#### `docs/modules/operativo/operativo-erp.md`
- **Titulo:** Operativo ERP (MenÃº)
- **Lineas:** 19 | **Tamano:** 0.6 KB | **Modificado:** 2026-02-01
- **JS:** `assets/js/modules/index-navigation.js`
- **HTML:** `pages/operativo/operativo-erp.html`

#### `docs/modules/operativo/operativo-index.md`
- **Titulo:** Operativo Index (Portal)
- **Lineas:** 26 | **Tamano:** 0.9 KB | **Modificado:** 2026-02-01
- **Tablas:** `profiles``, ``work_days`
- **JS:** `assets/js/modules/index-navigation.js``, ``assets/js/modules/work-day-helper.js`
- **HTML:** `pages/operativo/operativo-index.html`

#### `docs/modules/operativo/operativo-master-proveedores.md`
- **Titulo:** Operativo Master Proveedores
- **Lineas:** 234 | **Tamano:** 10.7 KB | **Modificado:** 2026-02-15
- **Links MD:** ./admin/admin-master-proveedores.md, operativo-master-sku.md, operativo-solicitudes.md
- **Tablas:** `master_proveedores`
- **JS:** `assets/js/modules/operativo/operativo-master-proveedores.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/panel.js`
- **HTML:** `pages/operativo/operativo-master-proveedores.html`

#### `docs/modules/operativo/operativo-master-sku.md`
- **Titulo:** Operativo Master SKU
- **Lineas:** 270 | **Tamano:** 13.4 KB | **Modificado:** 2026-02-15
- **Links MD:** ./admin/admin-central-stock.md, operativo-master-proveedores.md, ./admin/admin-master-categorias.md
- **Tablas:** `master_categories``, ``master_proveedores``, ``master_sku``, ``sku_change_requests`
- **Vistas:** `vw_stock_global`
- **JS:** `assets/js/modules/operativo/operativo-master-sku.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js``, ``modules/panel.js`
- **HTML:** `pages/operativo/operativo-master-sku.html`

#### `docs/modules/operativo/operativo-solicitudes.md`
- **Titulo:** Operativo Solicitudes
- **Lineas:** 287 | **Tamano:** 14.2 KB | **Modificado:** 2026-02-15
- **Links MD:** operativo-stock.md, operativo-analisis.md, operativo-master-proveedores.md, ./admin/admin-solicitudes.md
- **Tablas:** `master_proveedores``, ``replenishment_items``, ``replenishment_requests``, ``replenishment_supplier_orders``, ``work_days`
- **JS:** `assets/js/modules/operativo/operativo-solicitudes.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/operativo/operativo-solicitudes.html`

#### `docs/modules/operativo/operativo-stock.md`
- **Titulo:** Operativo Stock
- **Lineas:** 216 | **Tamano:** 9.4 KB | **Modificado:** 2026-02-15
- **Links MD:** operativo-solicitudes.md, ./admin/admin-central-stock.md, operativo-master-sku.md
- **Tablas:** `master_categories``, ``master_sku`
- **Vistas:** `vw_stock_global`
- **JS:** `assets/js/modules/operativo/operativo-stock.js``, ``core/auth.js``, ``core/config.js``, ``core/supabase-client.js``, ``core/toast.js``, ``core/utils.js`
- **HTML:** `pages/operativo/operativo-stock.html`

#### `docs/modules/operativo/operativo-workday.md`
- **Titulo:** Operativo Workday
- **Lineas:** 149 | **Tamano:** 5.2 KB | **Modificado:** 2026-02-01
- **Tablas:** `master_sku``, ``master_staff_roles``, ``profiles``, ``replenishment_items``, ``replenishment_requests``, ``staff_convocations``, ``work_days`
- **JS:** `assets/js/modules/operativo/operativo-workday.js``, ``core/auth.js``, ``core/config.js``, ``core/navigation.js``, ``core/supabase-client.js``, ``core/utils.js``, ``modules/operativo/operativo-workday.js``, ``modules/work-day-helper.js`
- **HTML:** `pages/operativo/operativo-solicitudes.html``, ``pages/operativo/operativo-workday.html`

#### `docs/modules/staff/staff-barra-index.md`
- **Titulo:** Staff Barra - Landing
- **Lineas:** 27 | **Tamano:** 0.8 KB | **Modificado:** 2026-02-01
- **JS:** `assets/js/core/auth.js``, ``assets/js/modules/index-navigation.js`
- **HTML:** `pages/staff/staff-barra-index.html`

#### `docs/modules/staff/staff-caja-index.md`
- **Titulo:** Terminal de Cajero (Staff)
- **Lineas:** 35 | **Tamano:** 1.4 KB | **Modificado:** 2026-02-01
- **Tablas:** `cash_movements``, ``staff_convocations`
- **JS:** `assets/js/modules/staff/staff-caja-index.js`
- **HTML:** `pages/staff/staff-caja-index.html`

### migration (10 docs)

#### `docs/migration/artifacts/erp-diagnostic-workdays.md`
- **Titulo:** ðŸ§  ERP Architect â€” DiagnÃ³stico: MÃ³dulo Workdays
- **Lineas:** 264 | **Tamano:** 10.2 KB | **Modificado:** 2026-02-10
- **Tablas:** `cash_closings``, ``events``, ``site_config``, ``staff_accruals``, ``work_days`
- **Vistas:** `vw_bar_audit_variance``, ``vw_bar_efficiency``, ``vw_daily_sales``, ``vw_daily_sales_v2``, ``vw_night_snapshot``, ``vw_sku_ideal_dynamic``, ``vw_staff_accruals_summary``, ``vw_work_day_summary`
- **RPCs:** `admin_generate_workday_accruals``, ``rpc_close_work_day``, ``rpc_confirm_work_day``, ``rpc_create_work_day``, ``rpc_open_work_day``, ``rpc_plan_work_day`

#### `docs/migration/artifacts/kpi-audit.md`
- **Titulo:** KPI Audit: Mock Data vs Supabase Schema
- **Lineas:** 211 | **Tamano:** 13.5 KB | **Modificado:** 2026-02-13
- **Tablas:** `cash_movements``, ``closing_terminals``, ``cost_config``, ``qr_checkins``, ``replenishment_requests``, ``replenishment_supplier_orders``, ``staff_accruals``, ``stg_passline_tickets``, ``work_day_staff_planning`
- **Vistas:** `vw_bar_audit_variance``, ``vw_consumo_teorico``, ``vw_fiscal_summary``, ``vw_staff_accruals_summary``, ``vw_tax_monthly`

#### `docs/migration/artifacts/README.md`
- **Titulo:** Artefactos de MigraciÃ³n
- **Lineas:** 27 | **Tamano:** 2.1 KB | **Modificado:** 2026-02-15

#### `docs/migration/artifacts/roadmap_production.md`
- **Titulo:** ðŸ—ºï¸ Workdays: Roadmap a ProducciÃ³n
- **Lineas:** 631 | **Tamano:** 20.6 KB | **Modificado:** 2026-02-10
- **RPCs:** `rpc_close_work_day``, ``rpc_confirm_work_day``, ``rpc_create_work_day``, ``rpc_open_work_day``, ``rpc_revert_work_day`

#### `docs/migration/artifacts/sprint3-implementation_plan.md`
- **Titulo:** Sprint 3 â€” Frontend Polish: Robustez y Responsividad
- **Lineas:** 129 | **Tamano:** 6.1 KB | **Modificado:** 2026-02-10
- **Vistas:** `vw_workday_pnl`
- **RPCs:** `calculate_health_score`

#### `docs/migration/artifacts/sprint3-walkthrough.md`
- **Titulo:** Sprint 3 â€” Frontend Polish: Walkthrough
- **Lineas:** 76 | **Tamano:** 3.2 KB | **Modificado:** 2026-02-10
- **Tablas:** `work_days`
- **Vistas:** `vw_night_snapshot``, ``vw_workday_pnl`
- **RPCs:** `calculate_health_score`

#### `docs/migration/artifacts/ux_research_workdays.md`
- **Titulo:** ðŸ”¬ UX Research Report: Workdays Prototypes
- **Lineas:** 168 | **Tamano:** 11.8 KB | **Modificado:** 2026-02-12

#### `docs/migration/artifacts/workdays-ui-implementation_plan.md`
- **Titulo:** Workdays â€” 6 Edits Plan
- **Lineas:** 135 | **Tamano:** 4.5 KB | **Modificado:** 2026-02-11

#### `docs/migration/artifacts/workdays-ui-walkthrough.md`
- **Titulo:** Workdays Density Polish â€” Walkthrough
- **Lineas:** 41 | **Tamano:** 1.9 KB | **Modificado:** 2026-02-11

#### `docs/migration/README.md`
- **Titulo:** MigraciÃ³n: WorkDays Unificado + Balance Semanal
- **Lineas:** 22 | **Tamano:** 1.2 KB | **Modificado:** 2026-02-12

### testing (8 docs)

#### `docs/testing/observations/_template.md`
- **Titulo:** [nombre-pantalla]
- **Lineas:** 31 | **Tamano:** 0.7 KB | **Modificado:** 2026-02-16

#### `docs/testing/README.md`
- **Titulo:** Testing Pipeline â€” Directorio de Trabajo
- **Lineas:** 9 | **Tamano:** 0.3 KB | **Modificado:** 2026-02-16

#### `docs/testing/tickets/_template.md`
- **Titulo:** TK-[NNN]: [tÃ­tulo]
- **Lineas:** 31 | **Tamano:** 0.6 KB | **Modificado:** 2026-02-16

#### `docs/testing/tickets/TK-001-crypto-randomuuid-compat.md`
- **Titulo:** TK-001: crypto.randomUUID() no disponible â€” bloquea creaciÃ³n de eventos con QR
- **Lineas:** 59 | **Tamano:** 2.2 KB | **Modificado:** 2026-02-16
- **JS:** `assets/js/core/utils.js``, ``assets/js/modules/admin/admin-workdays.js``, ``assets/js/modules/admin/qr-generator.js`

#### `docs/testing/tickets/TK-002-modal-showmodal-compat.md`
- **Titulo:** TK-002: modal.showModal() is not a function â€” bloquea creaciÃ³n de Workday
- **Lineas:** 85 | **Tamano:** 3.4 KB | **Modificado:** 2026-02-16
- **JS:** `assets/js/core/utils.js`
- **HTML:** `pages/admin/admin-workdays.html`

#### `docs/testing/tickets/TK-003-staff-cost-not-recalculating.md`
- **Titulo:** TK-003: Staff Costs No Recalculan al Cambiar Cantidad
- **Lineas:** 69 | **Tamano:** 2.6 KB | **Modificado:** 2026-02-16
- **Tablas:** `master_staff_roles`
- **JS:** `assets/js/modules/admin/admin-workdays.js`

#### `docs/testing/tickets/TK-004-staff-dropdowns-empty.md`
- **Titulo:** TK-004: Dropdowns de AsignaciÃ³n de Staff VacÃ­os / Opciones Incorrectas
- **Lineas:** 91 | **Tamano:** 3.6 KB | **Modificado:** 2026-02-16
- **Tablas:** `master_staff_roles``, ``profiles`
- **JS:** `assets/js/modules/admin/admin-workdays.js`

#### `docs/testing/tickets/TK-005-base-salary-column-missing.md`
- **Titulo:** TK-005: SELECT incluye columna `base_salary` inexistente â€” ROMPE TODA la carga
- **Lineas:** 87 | **Tamano:** 2.7 KB | **Modificado:** 2026-02-16
- **Tablas:** `master_staff_roles`
- **JS:** `assets/js/modules/admin/admin-workdays.js`

### core (6 docs)

#### `docs/backend-architecture-map.md`
- **Titulo:** Backend Architecture Map â€” FormulaMid 4
- **Lineas:** 215 | **Tamano:** 19.3 KB | **Modificado:** 2026-02-16
- **Tablas:** `accounts_payable``, ``audit_config``, ``auth_audit_log``, ``bar_session_sales``, ``bar_sessions``, ``bar_stock_snapshots``, ``cash_closings``, ``cash_movements``, ``closing_terminals``, ``consumption_details``, ``consumption_reports``, ``cost_config``, ``cost_definitions``, ``events``, ``finance_opening_cost_defs``, ``finance_payment_rules``, ``finance_payments``, ``finance_weekly_closings``, ``gbol_sync_log``, ``import_gbol_comandas``, ``import_gbol_facturacion``, ``import_gbol_withdrawals``, ``import_logs``, ``inventory_ideal``, ``inventory_movements``, ``inventory_stock``, ``inventory_stock_adjustments``, ``master_categories``, ``master_proveedores``, ``master_recipes``, ``master_sku``, ``master_staff_roles``, ``members``, ``menu_categories``, ``menu_items``, ``payment_categories``, ``payment_methods``, ``pos_terminals``, ``pos_terminals_alias``, ``profile_functions``, ``profiles``, ``qr_batches``, ``qr_checkins``, ``qr_codes``, ``recipe_code_mappings``, ``replenishment_items``, ``replenishment_receipt_items``, ``replenishment_receipts``, ``replenishment_requests``, ``replenishment_supplier_orders``, ``replenishment_tracking``, ``revenue_details``, ``revenue_reports``, ``site_config``, ``sku_change_requests``, ``staff_accruals``, ``staff_convocations``, ``staff_functions``, ``stg_afip_facturas``, ``stg_extracciones``, ``stg_gbol_items``, ``stg_passline_tickets``, ``work_day_staff_planning``, ``work_day_templates``, ``work_days`
- **Vistas:** `v_admin_stock``, ``vw_bar_audit_variance``, ``vw_bar_efficiency``, ``vw_consumo_teorico``, ``vw_daily_sales``, ``vw_daily_sales_v2``, ``vw_fiscal_summary``, ``vw_per_capita_revenue``, ``vw_recipe_profitability``, ``vw_reconcile_afip_gbol``, ``vw_sku_ideal_dynamic``, ``vw_staff_accruals_summary``, ``vw_staff_performance``, ``vw_stock_global``, ``vw_supplier_orders_admin``, ``vw_supplier_orders_encargado``, ``vw_tax_monthly``, ``vw_work_day_summary``, ``vw_workday_benchmarks``, ``vw_workday_pnl`
- **RPCs:** `admin_approve_payment``, ``admin_bulk_set_stock``, ``admin_export_accruals_to_payments``, ``admin_generate_rule_payments``, ``admin_generate_workday_accruals``, ``admin_mark_payment_done``, ``admin_sync_opening_cost_payments``, ``admin_undo_payment_done``, ``calculate_costo_pack``, ``calculate_health_score``, ``fn_normalize_terminal_name``, ``fn_parse_arg_number``, ``rpc_close_work_day``, ``rpc_confirm_work_day``, ``rpc_create_work_day``, ``rpc_open_work_day``, ``rpc_plan_work_day``, ``rpc_preflight_close_workday``, ``rpc_receive_supplier_order``, ``rpc_revert_work_day`

#### `docs/estado-presente.md`
- **Titulo:** Estado Presente del Proyecto - FormulaMid 4
- **Lineas:** 297 | **Tamano:** 20.8 KB | **Modificado:** 2026-02-17
- **Links MD:** scheme.md, ./AGENT.md
- **Tablas:** `accounts_payable``, ``audit_config``, ``auth_audit_log``, ``bar_session_sales``, ``bar_sessions``, ``bar_stock_snapshots``, ``cash_closings``, ``cash_movements``, ``closing_terminals``, ``consumption_details``, ``consumption_reports``, ``cost_config``, ``cost_definitions``, ``events``, ``finance_opening_cost_defs``, ``finance_payment_rules``, ``finance_payments``, ``finance_weekly_closings``, ``gbol_sync_log``, ``import_gbol_comandas``, ``import_gbol_facturacion``, ``import_gbol_withdrawals``, ``import_logs``, ``inventory_ideal``, ``inventory_movements``, ``inventory_stock``, ``inventory_stock_adjustments``, ``master_categories``, ``master_proveedores``, ``master_recipes``, ``master_sku``, ``master_staff_roles``, ``members``, ``menu_categories``, ``menu_items``, ``payment_categories``, ``payment_methods``, ``pos_terminals``, ``pos_terminals_alias``, ``profile_functions``, ``profiles``, ``qr_batches``, ``qr_checkins``, ``qr_codes``, ``recipe_code_mappings``, ``replenishment_items``, ``replenishment_receipt_items``, ``replenishment_receipts``, ``replenishment_requests``, ``replenishment_supplier_orders``, ``replenishment_tracking``, ``revenue_details``, ``revenue_reports``, ``site_config``, ``sku_change_requests``, ``staff_accruals``, ``staff_convocations``, ``staff_functions``, ``stg_afip_facturas``, ``stg_extracciones``, ``stg_gbol_items``, ``stg_passline_tickets``, ``work_day_staff_planning``, ``work_day_templates``, ``work_days`
- **Vistas:** `v_admin_stock``, ``vw_bar_audit_variance``, ``vw_bar_efficiency``, ``vw_consumo_teorico``, ``vw_daily_sales``, ``vw_daily_sales_v2``, ``vw_finance_weekly``, ``vw_financial_week_live``, ``vw_fiscal_summary``, ``vw_night_snapshot``, ``vw_per_capita_revenue``, ``vw_pnl_monthly_v2``, ``vw_recipe_profitability``, ``vw_reconcile_afip_gbol``, ``vw_sku_ideal_dynamic``, ``vw_staff_accruals_summary``, ``vw_staff_performance``, ``vw_stock_audit_nightly``, ``vw_stock_global``, ``vw_supplier_orders_admin``, ``vw_supplier_orders_encargado``, ``vw_tax_monthly``, ``vw_work_day_summary``, ``vw_workday_benchmarks``, ``vw_workday_pnl`
- **JS:** `assets/js/modules/login.js`
- **HTML:** `pages/*.html``, ``pages/admin/*.html``, ``pages/admin/qr/*.html``, ``pages/encargados/*.html``, ``pages/gerencia/*.html``, ``pages/logistica/*.html``, ``pages/members/*.html``, ``pages/operativo/*.html``, ``pages/prototypes/*.html``, ``pages/staff/*.html`

#### `docs/INDEX.md`
- **Titulo:** Ãndice de DocumentaciÃ³n
- **Lineas:** 135 | **Tamano:** 6.9 KB | **Modificado:** 2026-02-16
- **Links MD:** estado-presente.md, screen-map.md, scheme.md, ui-golden-standard.md, backend-architecture-map.md, guides/navigation.md, guides/state-management-guide.md, guides/drive-troubleshooting.md, business-logic/synthesis-report.md, testing/README.md, migration/README.md, modules/_template.md, output/README.md, ./AGENT.md, ./.agent/README.md

#### `docs/scheme.md`
- **Titulo:** Esquema de Base de Datos - FormulaMid 4
- **Lineas:** 1329 | **Tamano:** 61.8 KB | **Modificado:** 2026-02-16
- **Tablas:** `accounts_payable``, ``bar_session_sales``, ``bar_sessions``, ``bar_stock_snapshots``, ``cash_closings``, ``cash_movements``, ``closing_terminals``, ``consumption_details``, ``consumption_reports``, ``cost_config``, ``cost_definitions``, ``events``, ``finance_payments``, ``finance_weekly_closings``, ``gbol_sync_log``, ``import_gbol_comandas``, ``import_gbol_facturacion``, ``import_gbol_withdrawals``, ``inventory_movements``, ``inventory_stock``, ``inventory_stock_adjustments``, ``master_categories``, ``master_proveedores``, ``master_recipes``, ``master_sku``, ``master_staff_roles``, ``members``, ``payment_categories``, ``payment_methods``, ``pos_terminals``, ``profiles``, ``qr_batches``, ``qr_checkins``, ``qr_codes``, ``recipe_code_mappings``, ``replenishment_items``, ``replenishment_receipt_items``, ``replenishment_receipts``, ``replenishment_requests``, ``replenishment_supplier_orders``, ``replenishment_tracking``, ``revenue_details``, ``revenue_reports``, ``site_config``, ``sku_change_requests``, ``staff_accruals``, ``staff_convocations``, ``work_day_staff_planning``, ``work_day_templates``, ``work_days`
- **Vistas:** `vw_bar_audit_variance``, ``vw_bar_efficiency``, ``vw_consumo_teorico``, ``vw_daily_sales``, ``vw_daily_sales_v2``, ``vw_finance_weekly``, ``vw_financial_week_live``, ``vw_fiscal_summary``, ``vw_night_snapshot``, ``vw_pnl_monthly_v2``, ``vw_recipe_profitability``, ``vw_staff_performance``, ``vw_stock_global``, ``vw_supplier_orders_encargado``, ``vw_tax_monthly``, ``vw_workday_benchmarks``, ``vw_workday_pnl`

#### `docs/screen-map.md`
- **Titulo:** ðŸ—ºï¸ Mapa de Pantallas - FormulaMid 4
- **Lineas:** 352 | **Tamano:** 21.9 KB | **Modificado:** 2026-02-16
- **Tablas:** `bar_sessions``, ``bar_stock_snapshots``, ``cash_closings``, ``cash_movements``, ``closing_terminals``, ``consumption_details``, ``consumption_reports``, ``cost_config``, ``cost_definitions``, ``finance_payments``, ``finance_weekly_closings``, ``inventory_stock``, ``master_categories``, ``master_proveedores``, ``master_recipes``, ``master_sku``, ``master_staff_roles``, ``members``, ``pos_terminals``, ``profiles``, ``qr_batches``, ``qr_checkins``, ``qr_codes``, ``replenishment_items``, ``replenishment_receipts``, ``replenishment_supplier_orders``, ``replenishment_tracking``, ``site_config``, ``sku_change_requests``, ``staff_accruals``, ``staff_convocations``, ``work_day_staff_planning``, ``work_days`
- **Vistas:** `vw_bar_efficiency``, ``vw_daily_sales_v2``, ``vw_finance_weekly``, ``vw_financial_week_live``, ``vw_stock_global``, ``vw_supplier_orders_encargado`
- **HTML:** `pages/*.html`

#### `docs/ui-golden-standard.md`
- **Titulo:** UI/UX Golden Standard Reference
- **Lineas:** 1350 | **Tamano:** 42.6 KB | **Modificado:** 2026-02-16
- **Vistas:** `vw_stock_global`
- **HTML:** `pages/admin/admin-central-stock.html``, ``pages/admin/admin-solicitudes.html`

### root (5 docs)

#### `AGENT.md`
- **Titulo:** Agent: Orchestrator (FormulaMid 4)
- **Lineas:** 88 | **Tamano:** 3 KB | **Modificado:** 2026-02-16
- **JS:** `assets/js/core/*navigation*.js``, ``assets/js/core/*supabase*.js``, ``assets/js/core/auth*.js``, ``assets/js/core/utils*.js`
- **CSS:** `assets/css/components.css``, ``assets/css/tokens.css`

#### `assets/preview.md`
- **Titulo:** Auditor & Control Panel (UI Sandbox)
- **Lineas:** 37 | **Tamano:** 1.8 KB | **Modificado:** 2026-02-01
- **CSS:** `assets/css/tokens.css`

#### `README.md`
- **Titulo:** Midnight Club / FormulaMid
- **Lineas:** 33 | **Tamano:** 1 KB | **Modificado:** 2026-02-15
- **Links MD:** docs/INDEX.md, docs/estado-presente.md, AGENT.md

#### `reporte_comparativo_ui_scan.md`
- **Titulo:** 
- **Lineas:** 46 | **Tamano:** 2 KB | **Modificado:** 2026-02-17

#### `test-data/README.md`
- **Titulo:** Archivos CSV de Prueba - Testing Fases 1-5
- **Lineas:** 115 | **Tamano:** 2.9 KB | **Modificado:** 2026-02-15

### business-logic (4 docs)

#### `docs/business-logic/flows/bar-manager-night.md`
- **Titulo:** Flujo de Negocio: Noche del Encargado de Barra
- **Lineas:** 70 | **Tamano:** 4.6 KB | **Modificado:** 2026-02-16
- **Tablas:** `bar_sessions``, ``bar_stock_snapshots``, ``master_sku``, ``work_days`
- **HTML:** `pages/encargados/encargado-barra-noche.html`

#### `docs/business-logic/flows/night-cash-closing.md`
- **Titulo:** Flujo de Negocio: Cierre de Caja Nocturno
- **Lineas:** 73 | **Tamano:** 5.4 KB | **Modificado:** 2026-02-16
- **Tablas:** `cash_closings``, ``closing_terminals``, ``import_gbol_facturacion``, ``work_days`
- **RPCs:** `rpc_close_work_day`
- **JS:** `assets/js/core/gbol-service.js``, ``assets/js/modules/admin/admin-workdays.js``, ``assets/js/modules/encargados/encargado-caja-noche.js`
- **HTML:** `pages/admin/admin-workdays.html``, ``pages/encargados/encargado-caja-noche.html`

#### `docs/business-logic/flows/workday-management.md`
- **Titulo:** Flujo de Negocio: GestiÃ³n de Jornadas de Trabajo (Workday)
- **Lineas:** 87 | **Tamano:** 6.6 KB | **Modificado:** 2026-02-16
- **Tablas:** `cash_closings``, ``closing_terminals``, ``finance_payments``, ``staff_accruals``, ``staff_convocations``, ``work_day_staff_planning``, ``work_day_templates``, ``work_days`
- **Vistas:** `vw_bar_audit_variance``, ``vw_consumo_teorico``, ``vw_night_snapshot``, ``vw_workday_pnl`
- **RPCs:** `admin_generate_workday_accruals``, ``rpc_close_work_day``, ``rpc_confirm_work_day``, ``rpc_open_work_day`
- **JS:** `assets/js/core/gbol-service.js``, ``assets/js/modules/admin/admin-workdays.js`
- **HTML:** `pages/admin/admin-workdays.html`

#### `docs/business-logic/synthesis-report.md`
- **Titulo:** Reporte de SÃ­ntesis: LÃ³gica de Negocio y Arquitectura de Control
- **Lineas:** 114 | **Tamano:** 7 KB | **Modificado:** 2026-02-16
- **Tablas:** `closing_terminals``, ``staff_accruals``, ``staff_convocations`

### guides (3 docs)

#### `docs/guides/drive-troubleshooting.md`
- **Titulo:** SoluciÃ³n de Problemas de Google Drive MCP
- **Lineas:** 52 | **Tamano:** 1.7 KB | **Modificado:** 2026-02-07

#### `docs/guides/navigation.md`
- **Titulo:** Navigation System Architecture
- **Lineas:** 95 | **Tamano:** 3.5 KB | **Modificado:** 2026-02-01
- **JS:** `core/navigation.js`

#### `docs/guides/state-management-guide.md`
- **Titulo:** State Management Guide â€” FormulaMid 4
- **Lineas:** 83 | **Tamano:** 1.8 KB | **Modificado:** 2026-02-07

### data-reference (2 docs)

#### `docs/important-data-reference/feature-spec-drinks-by-web.md`
- **Titulo:** Feature Spec: Drinks by Web (ConsumiciÃ³n Digital)
- **Lineas:** 360 | **Tamano:** 21.8 KB | **Modificado:** 2026-02-11
- **Tablas:** `inventory_movements`
- **Vistas:** `vw_drink_consumption_live``, ``vw_drink_sales_by_channel`
- **RPCs:** `rpc_create_drink_order``, ``rpc_redeem_drink_qr`

#### `docs/important-data-reference/user-flows-by-role.md`
- **Titulo:** User Flows por Rol â€” Mapa Completo + Gap Analysis
- **Lineas:** 388 | **Tamano:** 21.1 KB | **Modificado:** 2026-02-12

### scripts (1 docs)

#### `scripts/README.md`
- **Titulo:** Solo listar, no modificar nada
- **Lineas:** 231 | **Tamano:** 7.4 KB | **Modificado:** 2026-02-17

### audits (1 docs)

#### `docs/audits/audit-solicitudes-reposicion.md`
- **Titulo:** AuditorÃ­a â€” Flujo Solicitudes / ReposiciÃ³n
- **Lineas:** 323 | **Tamano:** 13.1 KB | **Modificado:** 2026-02-17
- **Tablas:** `inventory_movements``, ``inventory_stock``, ``replenishment_items``, ``replenishment_receipt_items``, ``replenishment_receipts``, ``replenishment_requests``, ``replenishment_supplier_orders``, ``replenishment_tracking`

### codex (1 docs)

#### `docs/codex/PLAN_PRODUCTION_READY.md`
- **Titulo:** PLAN PRODUCTION READY - tester_3.0
- **Lineas:** 337 | **Tamano:** 19.5 KB | **Modificado:** 2026-02-17
- **Tablas:** `cash_movements``, ``gbol_sync_log``, ``import_gbol_comandas``, ``import_gbol_facturacion``, ``import_logs``, ``qr_batches``, ``qr_codes``, ``replenishment_tracking``, ``site_config`
- **RPCs:** `rpc_close_work_day``, ``rpc_confirm_work_day``, ``rpc_create_work_day``, ``rpc_open_work_day``, ``rpc_preflight_close_workday`
- **JS:** `assets/js/core/config.js``, ``assets/js/core/error-logger.js``, ``assets/js/core/gbol-service.js``, ``assets/js/members/my-qr.js``, ``assets/js/modules/admin/admin-workdays.js``, ``assets/js/modules/operativo/cms-members.js``, ``assets/js/modules/operativo/scanner.js`
- **HTML:** `pages/operativo/scanner.html`

