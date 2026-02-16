# Flow Trace Report v2 - 2026-02-16 13:11

> Analisis estatico del flujo de datos y navegacion de FormulaMid 4.
> Generado por low-tracer.ps1 v2 en 1 segundos.

---

## 1. Navegacion

### Links rotos (destinos que no existen)
Ninguno. Todos los links apuntan a paginas existentes.

### Mapa de navegacion

| Pagina | Destinos |
|---|---|
| `admin-central-stock.html` | admin-index.html, admin-config.html |
| `admin-config.html` | admin-index.html |
| `admin-index.html` | admin-config.html, admin-workdays.html, admin-central-stock.html, admin-pagos.html, operativo-index.html |
| `admin-master-categorias.html` | admin-index.html, admin-central-stock.html, admin-master-proveedores.html, admin-master-categorias.html, admin-master-nomina.html, admin-pagos.html, admin-master-tarifario.html, admin-master-pos.html |
| `admin-master-nomina.html` | admin-index.html, admin-central-stock.html, admin-master-proveedores.html, admin-master-categorias.html, admin-master-nomina.html, admin-pagos.html, admin-master-tarifario.html, admin-master-pos.html |
| `admin-master-pos.html` | admin-index.html, admin-config.html, admin-central-stock.html, admin-master-proveedores.html, admin-master-categorias.html, admin-master-nomina.html, admin-pagos.html, admin-master-tarifario.html, admin-master-pos.html |
| `admin-master-proveedores.html` | admin-index.html, admin-central-stock.html, admin-master-proveedores.html, admin-master-categorias.html, admin-master-nomina.html, admin-pagos.html, admin-master-tarifario.html, admin-master-pos.html |
| `admin-master-tarifario.html` | admin-index.html, admin-config.html, admin-central-stock.html, admin-master-proveedores.html, admin-master-categorias.html, admin-master-nomina.html, admin-pagos.html, admin-master-tarifario.html, admin-master-pos.html |
| `admin-pagos.html` | admin-index.html, admin-config.html |
| `admin-reportes.html` | admin-index.html |
| `admin-semanal.html` | admin-index.html |
| `admin-solicitudes.html` | admin-index.html, admin-config.html |
| `admin-workdays.html` | admin-index.html, admin-config.html |
| `index.html` | admin-index.html, generator.html |
| `monitor.html` | index.html |
| `components_catalog.html` | layout_patterns.html |
| `encargado-barra-index.html` | encargado-recepcion.html, encargado-barra-personal.html, encargado-barra-noche.html |
| `encargado-barra-noche.html` | encargado-barra-index.html |
| `encargado-barra-personal.html` | encargado-barra-index.html |
| `encargado-caja-index.html` | encargado-caja-personal.html, encargado-caja-noche.html |
| `encargado-caja-noche.html` | encargado-caja-index.html, encargado-caja-personal.html |
| `encargado-caja-personal.html` | encargado-caja-index.html, encargado-caja-noche.html |
| `encargado-recepcion.html` | encargado-barra-index.html |
| `balance-semanal.html` | admin-index.html |
| `logistica-distribucion.html` | logistica-index.html, logistica-stock.html, logistica-distribucion.html, logistica-recepcion.html, logistica-seguimiento.html |
| `logistica-index.html` | logistica-index.html, logistica-stock.html, logistica-distribucion.html, logistica-recepcion.html, logistica-seguimiento.html |
| `logistica-recepcion.html` | logistica-index.html, logistica-stock.html, logistica-distribucion.html, logistica-recepcion.html, logistica-seguimiento.html |
| `logistica-seguimiento.html` | logistica-index.html, logistica-stock.html, logistica-distribucion.html, logistica-recepcion.html, logistica-seguimiento.html |
| `logistica-stock.html` | logistica-index.html, logistica-stock.html, logistica-distribucion.html, logistica-recepcion.html, logistica-seguimiento.html |
| `cms-members.html` | operativo-index.html |
| `operativo-analisis.html` | operativo-index.html |
| `operativo-index.html` | operativo-workday.html, operativo-stock.html, operativo-solicitudes.html, cms-members.html, operativo-master-sku.html |
| `operativo-master-proveedores.html` | operativo-index.html |
| `operativo-master-sku.html` | operativo-index.html |
| `operativo-solicitudes.html` | operativo-index.html |
| `operativo-stock.html` | operativo-index.html |
| `operativo-workday.html` | operativo-index.html, operativo-solicitudes.html |
| `index.html` | index.html |

### Paginas huerfanas (sin links entrantes)

- `pages/admin/admin-reportes.html`
- `pages/admin/admin-semanal.html`
- `pages/admin/admin-solicitudes.html`
- `pages/gerencia/balance-semanal.html`
- `pages/members/my-qr.html`
- `pages/operativo/operativo-analisis.html`
- `pages/operativo/operativo-master-proveedores.html`
- `pages/operativo/scanner.html`

---

## 2. Tablas Supabase (Read/Write)

### Tablas usadas en codigo pero NO en scheme.md

| Tabla | Usada en |
|---|---|
| `audit_config` | gbol-service.js |
| `error_log` | error-logger.js |
| `gbol_sync_log` | gbol-service.js |
| `import_gbol_comandas` | gbol-service.js |
| `import_gbol_facturacion` | gbol-service.js |
| `import_gbol_withdrawals` | gbol-service.js |
| `vw_consumo_teorico` | admin-workdays.js |

### Uso de tablas por archivo (clasificado)

| Tabla | Reads (archivos) | Writes (archivos) |
|---|---|---|
| `audit_config` | gbol-service.js | - |
| `bar_session_sales` | - | importer-gbol.js |
| `bar_sessions` | importer-gbol.js, admin-workdays.js, encargado-barra-noche.js, encargado-caja-noche.js | importer-gbol.js, encargado-barra-noche.js |
| `bar_stock_snapshots` | encargado-barra-noche.js | encargado-barra-noche.js |
| `cash_closings` | importer-extracciones.js, admin-workdays.js, encargado-caja-noche.js, staff-caja-index.js | admin-workdays.js, encargado-caja-noche.js |
| `cash_movements` | encargado-caja-noche.js | importer-extracciones.js, encargado-caja-noche.js |
| `closing_terminals` | admin-workdays.js, encargado-caja-noche.js, staff-caja-index.js | gbol-service.js, encargado-caja-noche.js, staff-caja-index.js |
| `consumption_details` | admin-central-stock.js, admin-solicitudes.js, operativo-analisis.js | admin-central-stock.js, operativo-analisis.js |
| `consumption_reports` | admin-central-stock.js, admin-solicitudes.js, operativo-analisis.js | admin-central-stock.js, operativo-analisis.js |
| `cost_config` | admin-config.js | admin-config.js |
| `cost_definitions` | admin-pagos.js, admin-workdays.js | admin-pagos.js, admin-workdays.js |
| `error_log` | - | error-logger.js |
| `events` | admin-workdays.js | admin-workdays.js |
| `finance_payments` | admin-pagos.js | admin-pagos.js, admin-solicitudes.js, admin-workdays.js, logistica-recepcion.js |
| `finance_weekly_closings` | admin-semanal.js | admin-semanal.js |
| `gbol_sync_log` | gbol-service.js | gbol-service.js |
| `import_gbol_comandas` | gbol-service.js | gbol-service.js |
| `import_gbol_facturacion` | gbol-service.js | gbol-service.js |
| `import_gbol_withdrawals` | gbol-service.js | gbol-service.js |
| `import_logs` | - | import-logger.js |
| `inventory_movements` | - | admin-central-stock.js, logistica-distribucion.js, logistica-recepcion.js, logistica-stock.js |
| `inventory_stock` | admin-central-stock.js, logistica-distribucion.js, logistica-recepcion.js, logistica-stock.js | admin-central-stock.js, logistica-distribucion.js, logistica-recepcion.js, logistica-stock.js |
| `inventory_stock_adjustments` | - | logistica-stock.js |
| `master_categories` | admin-central-stock.js, admin-master-categorias.js, admin-master-proveedores.js, logistica-stock.js | admin-master-categorias.js |
| `master_proveedores` | admin-central-stock.js, admin-master-proveedores.js, admin-pagos.js, admin-solicitudes.js, logistica-recepcion.js, operativo-master-proveedores.js, operativo-master-sku.js, operativo-solicitudes.js | admin-master-proveedores.js, operativo-master-proveedores.js |
| `master_recipes` | importer-gbol.js, admin-central-stock.js | admin-central-stock.js |
| `master_sku` | admin-central-stock.js, admin-config.js, admin-solicitudes.js, encargado-barra-noche.js, logistica-recepcion.js, operativo-analisis.js, operativo-master-sku.js | admin-central-stock.js, admin-config.js |
| `master_staff_roles` | admin-master-nomina.js, admin-master-tarifario.js, admin-pagos.js, admin-workdays.js | admin-master-tarifario.js |
| `members` | cms-members.js, scanner.js | cms-members.js |
| `payment_categories` | admin-pagos.js | - |
| `payment_methods` | admin-pagos.js | - |
| `pos_terminals` | gbol-service.js, importer-extracciones.js, admin-master-pos.js, admin-workdays.js, encargado-caja-noche.js | admin-master-pos.js |
| `pos_terminals_alias` | importer-extracciones.js | - |
| `profiles` | auth.js, admin-index.js, admin-master-nomina.js, admin-workdays.js, encargado-barra-index.js, encargado-barra-personal.js, encargado-caja-index.js, encargado-caja-noche.js, encargado-caja-personal.js, logistica-index.js, scanner.js, staff-caja-index.js | admin-master-nomina.js, encargado-barra-personal.js, encargado-caja-personal.js |
| `qr_batches` | importer-passline.js, admin-workdays.js, qr-dashboard.js, qr-monitor.js | importer-passline.js, admin-workdays.js, qr-generator.js |
| `qr_checkins` | qr-dashboard.js | scanner.js |
| `qr_codes` | admin-index.js, admin-workdays.js, qr-dashboard.js, qr-monitor.js, operativo-index.js, scanner.js | importer-passline.js, admin-workdays.js, qr-generator.js, scanner.js |
| `recipe_code_mappings` | admin-central-stock.js | admin-central-stock.js |
| `replenishment_items` | admin-solicitudes.js, encargado-recepcion.js, logistica-distribucion.js, operativo-solicitudes.js, operativo-workday.js | admin-solicitudes.js, logistica-distribucion.js, operativo-solicitudes.js |
| `replenishment_receipt_items` | - | logistica-recepcion.js |
| `replenishment_receipts` | - | logistica-recepcion.js |
| `replenishment_requests` | admin-solicitudes.js, logistica-distribucion.js, operativo-solicitudes.js, operativo-workday.js | logistica-distribucion.js, operativo-solicitudes.js |
| `replenishment_supplier_orders` | admin-solicitudes.js, logistica-recepcion.js, logistica-seguimiento.js, operativo-solicitudes.js | admin-solicitudes.js, logistica-recepcion.js, logistica-seguimiento.js, operativo-solicitudes.js |
| `replenishment_tracking` | - | logistica-seguimiento.js |
| `revenue_details` | admin-central-stock.js | admin-central-stock.js |
| `revenue_reports` | admin-central-stock.js | admin-central-stock.js |
| `site_config` | operativo-workday.js | operativo-workday.js |
| `sku_change_requests` | admin-central-stock.js, operativo-master-sku.js | admin-central-stock.js, operativo-master-sku.js |
| `staff_accruals` | admin-workdays.js | admin-workdays.js |
| `staff_convocations` | work-day-helper.js, admin-workdays.js, encargado-barra-personal.js, encargado-caja-personal.js, operativo-workday.js, staff-caja-index.js | admin-workdays.js, encargado-barra-personal.js, encargado-caja-personal.js, staff-caja-index.js |
| `vw_bar_audit_variance` | admin-workdays.js | - |
| `vw_bar_efficiency` | admin-reportes.js, admin-workdays.js | - |
| `vw_consumo_teorico` | admin-workdays.js | - |
| `vw_daily_sales` | admin-workdays.js | - |
| `vw_daily_sales_v2` | admin-reportes.js | - |
| `vw_finance_weekly` | balance-semanal.js | - |
| `vw_financial_week_live` | admin-semanal.js | admin-semanal.js |
| `vw_fiscal_summary` | gbol-service.js, admin-workdays.js | - |
| `vw_night_snapshot` | admin-workdays.js | - |
| `vw_pnl_monthly_v2` | admin-reportes.js | - |
| `vw_recipe_profitability` | admin-central-stock.js | - |
| `vw_staff_performance` | admin-reportes.js | - |
| `vw_stock_global` | admin-central-stock.js, admin-solicitudes.js, logistica-distribucion.js, logistica-stock.js, operativo-solicitudes.js, operativo-stock.js | - |
| `vw_supplier_orders_encargado` | encargado-barra-index.js, encargado-recepcion.js | - |
| `vw_tax_monthly` | admin-reportes.js | - |
| `vw_work_day_summary` | work-day-helper.js | - |
| `vw_workday_benchmarks` | admin-workdays.js | - |
| `vw_workday_pnl` | admin-workdays.js | - |
| `work_day_staff_planning` | work-day-helper.js, admin-workdays.js, encargado-barra-personal.js, encargado-caja-personal.js | admin-workdays.js |
| `work_day_templates` | admin-workdays.js | admin-workdays.js |
| `work_days` | work-day-helper.js, admin-central-stock.js, admin-index.js, admin-solicitudes.js, admin-workdays.js, encargado-barra-personal.js, encargado-caja-index.js, encargado-caja-noche.js, encargado-caja-personal.js, logistica-index.js, operativo-workday.js, scanner.js, staff-caja-index.js | admin-workdays.js, encargado-caja-noche.js |

---

## 3. Cross-Module Data Flows

### Resumen por modulo

| Modulo | Tablas leidas | Tablas escritas |
|---|---|---|
| **ADMIN** | 56 | 40 |
| **ENCARGADOS** | 13 | 8 |
| **GERENCIA** | 1 | 0 |
| **LOGISTICA** | 10 | 10 |
| **OPERATIVO** | 15 | 11 |
| **STAFF** | 5 | 2 |

### Tablas compartidas entre modulos

| Tabla | Escritura (modulos) | Lectura (modulos) | Patron |
|---|---|---|---|
| `bar_sessions` | admin, encargados | admin, encargados | [!!] MULTI-WRITER |
| `cash_closings` | admin, encargados | admin, encargados, staff | [!!] MULTI-WRITER |
| `cash_movements` | admin, encargados | encargados | [!!] MULTI-WRITER |
| `closing_terminals` | admin, encargados, staff | admin, encargados, staff | [!!] MULTI-WRITER |
| `consumption_details` | admin, operativo | admin, operativo | [!!] MULTI-WRITER |
| `consumption_reports` | admin, operativo | admin, operativo | [!!] MULTI-WRITER |
| `finance_payments` | admin, logistica | admin | [!!] MULTI-WRITER |
| `inventory_movements` | admin, logistica | - | [!!] MULTI-WRITER |
| `inventory_stock` | admin, logistica | admin, logistica | [!!] MULTI-WRITER |
| `master_categories` | admin | admin, logistica | [OK] Cross-flow |
| `master_proveedores` | admin, operativo | admin, logistica, operativo | [!!] MULTI-WRITER |
| `master_sku` | admin | admin, encargados, logistica, operativo | [OK] Cross-flow |
| `pos_terminals` | admin | admin, encargados | [OK] Cross-flow |
| `profiles` | admin, encargados | admin, encargados, logistica, operativo, staff | [!!] MULTI-WRITER |
| `qr_checkins` | operativo | admin | [OK] Cross-flow |
| `qr_codes` | admin, operativo | admin, operativo | [!!] MULTI-WRITER |
| `replenishment_items` | admin, logistica, operativo | admin, encargados, logistica, operativo | [!!] MULTI-WRITER |
| `replenishment_requests` | logistica, operativo | admin, logistica, operativo | [!!] MULTI-WRITER |
| `replenishment_supplier_orders` | admin, logistica, operativo | admin, logistica, operativo | [!!] MULTI-WRITER |
| `sku_change_requests` | admin, operativo | admin, operativo | [!!] MULTI-WRITER |
| `staff_convocations` | admin, encargados, staff | admin, encargados, operativo, staff | [!!] MULTI-WRITER |
| `vw_stock_global` | - | admin, logistica, operativo | [RO] Read-only |
| `work_day_staff_planning` | admin | admin, encargados | [OK] Cross-flow |
| `work_days` | admin, encargados | admin, encargados, logistica, operativo, staff | [!!] MULTI-WRITER |

### Silos de datos (tabla usada por un solo modulo)

| Tabla | Modulo |
|---|---|
| `audit_config` | admin |
| `bar_session_sales` | admin |
| `bar_stock_snapshots` | encargados |
| `cost_config` | admin |
| `cost_definitions` | admin |
| `events` | admin |
| `finance_weekly_closings` | admin |
| `gbol_sync_log` | admin |
| `import_gbol_comandas` | admin |
| `import_gbol_facturacion` | admin |
| `import_gbol_withdrawals` | admin |
| `import_logs` | admin |
| `inventory_stock_adjustments` | logistica |
| `master_recipes` | admin |
| `master_staff_roles` | admin |
| `members` | operativo |
| `payment_categories` | admin |
| `payment_methods` | admin |
| `pos_terminals_alias` | admin |
| `qr_batches` | admin |
| `recipe_code_mappings` | admin |
| `replenishment_receipt_items` | logistica |
| `replenishment_receipts` | logistica |
| `replenishment_tracking` | logistica |
| `revenue_details` | admin |
| `revenue_reports` | admin |
| `site_config` | operativo |
| `staff_accruals` | admin |
| `vw_bar_audit_variance` | admin |
| `vw_bar_efficiency` | admin |
| `vw_consumo_teorico` | admin |
| `vw_daily_sales` | admin |
| `vw_daily_sales_v2` | admin |
| `vw_finance_weekly` | gerencia |
| `vw_financial_week_live` | admin |
| `vw_fiscal_summary` | admin |
| `vw_night_snapshot` | admin |
| `vw_pnl_monthly_v2` | admin |
| `vw_recipe_profitability` | admin |
| `vw_staff_performance` | admin |
| `vw_supplier_orders_encargado` | encargados |
| `vw_tax_monthly` | admin |
| `vw_workday_benchmarks` | admin |
| `vw_workday_pnl` | admin |
| `work_day_templates` | admin |

---

## 4. JS huerfanos (sin referencia HTML)

- `login.js`
- `admin-index.js`
- `admin-workdays.js`
- `operativo-erp.js`

---

## 5. Tablas en schema sin uso en codigo

- `tablas`
- `accounts_payable`
- `auth_audit_log`
- `finance_opening_cost_defs`
- `finance_payment_rules`
- `inventory_ideal`
- `menu_categories`
- `menu_items`
- `profile_functions`
- `staff_functions`
- `stg_afip_facturas`
- `stg_extracciones`
- `stg_gbol_items`
- `stg_passline_tickets`
- `vistas`
- `v_admin_stock`
- `vw_reconcile_afip_gbol`
- `vw_sku_ideal_dynamic`
- `vw_supplier_orders_admin`
- `vw_staff_accruals_summary`
- `vw_per_capita_revenue`
- `tabla`
- `rpcs`

---

## Proximos pasos

- Resolver links rotos
- Documentar tablas faltantes en scheme.md
- Revisar paginas huerfanas
- Verificar JS huerfanos
- Investigar tablas con patron MULTI-WRITER
- Conectar silos de datos que deberian fluir entre modulos

