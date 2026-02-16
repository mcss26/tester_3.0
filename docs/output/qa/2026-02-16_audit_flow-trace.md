# Flow Trace Report - 2026-02-16 07:09

## Contexto
Analisis estatico del flujo de datos y navegacion de FormulaMid 4.
Generado por flow-tracer.ps1 despues de 1 scans (0.1 min).

## Navegacion (data-go)

### Links rotos (paginas que no existen)
Ninguno. Todos los data-go apuntan a paginas existentes.

### Paginas huerfanas (sin links entrantes)
- `pages/admin/admin-central-stock.html`
- `pages/admin/admin-config.html`
- `pages/admin/admin-master-categorias.html`
- `pages/admin/admin-master-nomina.html`
- `pages/admin/admin-master-pos.html`
- `pages/admin/admin-master-proveedores.html`
- `pages/admin/admin-master-tarifario.html`
- `pages/admin/admin-pagos.html`
- `pages/admin/admin-reportes.html`
- `pages/admin/admin-semanal.html`
- `pages/admin/admin-solicitudes.html`
- `pages/admin/admin-workdays.html`
- `pages/encargados/encargado-barra-noche.html`
- `pages/encargados/encargado-barra-personal.html`
- `pages/encargados/encargado-recepcion.html`
- `pages/gerencia/balance-semanal.html`
- `pages/logistica/logistica-distribucion.html`
- `pages/logistica/logistica-recepcion.html`
- `pages/logistica/logistica-seguimiento.html`
- `pages/logistica/logistica-stock.html`
- `pages/members/my-qr.html`
- `pages/operativo/cms-members.html`
- `pages/operativo/operativo-analisis.html`
- `pages/operativo/operativo-master-proveedores.html`
- `pages/operativo/operativo-master-sku.html`
- `pages/operativo/operativo-solicitudes.html`
- `pages/operativo/operativo-stock.html`
- `pages/operativo/operativo-workday.html`
- `pages/operativo/scanner.html`

## Tablas Supabase

### Tablas usadas en codigo pero NO en scheme.md
- `audit_config` (usada en: gbol-service.js)
- `error_log` (usada en: error-logger.js)
- `gbol_sync_log` (usada en: gbol-service.js)
- `import_gbol_comandas` (usada en: gbol-service.js)
- `import_gbol_facturacion` (usada en: gbol-service.js)
- `import_gbol_withdrawals` (usada en: gbol-service.js)
- `vw_bar_audit_variance` (usada en: admin-workdays.js)
- `vw_consumo_teorico` (usada en: admin-workdays.js)
- `vw_fiscal_summary` (usada en: gbol-service.js, admin-workdays.js)
- `vw_night_snapshot` (usada en: admin-workdays.js)

### Uso de tablas por archivo
- `audit_config`: gbol-service.js
- `bar_session_sales`: importer-gbol.js
- `bar_sessions`: importer-gbol.js, admin-workdays.js, encargado-barra-noche.js, encargado-caja-noche.js
- `bar_stock_snapshots`: encargado-barra-noche.js
- `cash_closings`: importer-extracciones.js, admin-workdays.js, encargado-caja-noche.js, staff-caja-index.js
- `cash_movements`: importer-extracciones.js, encargado-caja-noche.js
- `closing_terminals`: gbol-service.js, admin-workdays.js, encargado-caja-noche.js, staff-caja-index.js
- `consumption_details`: admin-central-stock.js, admin-solicitudes.js, operativo-analisis.js
- `consumption_reports`: admin-central-stock.js, admin-solicitudes.js, operativo-analisis.js
- `cost_config`: admin-config.js
- `cost_definitions`: admin-pagos.js, admin-workdays.js
- `error_log`: error-logger.js
- `events`: admin-workdays.js
- `finance_payments`: admin-pagos.js, admin-solicitudes.js, admin-workdays.js, logistica-recepcion.js
- `finance_weekly_closings`: admin-semanal.js
- `gbol_sync_log`: gbol-service.js
- `import_gbol_comandas`: gbol-service.js
- `import_gbol_facturacion`: gbol-service.js
- `import_gbol_withdrawals`: gbol-service.js
- `import_logs`: import-logger.js
- `inventory_movements`: admin-central-stock.js, logistica-distribucion.js, logistica-recepcion.js, logistica-stock.js
- `inventory_stock`: admin-central-stock.js, logistica-distribucion.js, logistica-recepcion.js, logistica-stock.js
- `inventory_stock_adjustments`: logistica-stock.js
- `master_categories`: admin-central-stock.js, admin-master-categorias.js, admin-master-proveedores.js, logistica-stock.js
- `master_proveedores`: admin-central-stock.js, admin-master-proveedores.js, admin-pagos.js, admin-solicitudes.js, logistica-recepcion.js, operativo-master-proveedores.js, operativo-master-sku.js, operativo-solicitudes.js
- `master_recipes`: importer-gbol.js, admin-central-stock.js
- `master_sku`: admin-central-stock.js, admin-config.js, admin-solicitudes.js, encargado-barra-noche.js, logistica-recepcion.js, operativo-analisis.js, operativo-master-sku.js
- `master_staff_roles`: admin-master-nomina.js, admin-master-tarifario.js, admin-pagos.js, admin-workdays.js
- `members`: cms-members.js, scanner.js
- `payment_categories`: admin-pagos.js
- `payment_methods`: admin-pagos.js
- `pos_terminals`: gbol-service.js, importer-extracciones.js, admin-master-pos.js, admin-workdays.js, encargado-caja-noche.js
- `pos_terminals_alias`: importer-extracciones.js
- `profiles`: auth.js, admin-index.js, admin-master-nomina.js, admin-workdays.js, encargado-barra-index.js, encargado-barra-personal.js, encargado-caja-index.js, encargado-caja-noche.js, encargado-caja-personal.js, logistica-index.js, scanner.js, staff-caja-index.js
- `qr_batches`: importer-passline.js, admin-workdays.js, qr-dashboard.js, qr-generator.js, qr-monitor.js
- `qr_checkins`: qr-dashboard.js, scanner.js
- `qr_codes`: importer-passline.js, admin-index.js, admin-workdays.js, qr-dashboard.js, qr-generator.js, qr-monitor.js, operativo-index.js, scanner.js
- `recipe_code_mappings`: admin-central-stock.js
- `replenishment_items`: admin-solicitudes.js, encargado-recepcion.js, logistica-distribucion.js, operativo-solicitudes.js, operativo-workday.js
- `replenishment_receipt_items`: logistica-recepcion.js
- `replenishment_receipts`: logistica-recepcion.js
- `replenishment_requests`: admin-solicitudes.js, logistica-distribucion.js, operativo-solicitudes.js, operativo-workday.js
- `replenishment_supplier_orders`: admin-solicitudes.js, logistica-recepcion.js, logistica-seguimiento.js, operativo-solicitudes.js
- `replenishment_tracking`: logistica-seguimiento.js
- `revenue_details`: admin-central-stock.js
- `revenue_reports`: admin-central-stock.js
- `site_config`: operativo-workday.js
- `sku_change_requests`: admin-central-stock.js, operativo-master-sku.js
- `staff_accruals`: admin-workdays.js
- `staff_convocations`: work-day-helper.js, admin-workdays.js, encargado-barra-personal.js, encargado-caja-personal.js, operativo-workday.js, staff-caja-index.js
- `vw_bar_audit_variance`: admin-workdays.js
- `vw_bar_efficiency`: admin-reportes.js, admin-workdays.js
- `vw_consumo_teorico`: admin-workdays.js
- `vw_daily_sales`: admin-workdays.js
- `vw_daily_sales_v2`: admin-reportes.js
- `vw_finance_weekly`: balance-semanal.js
- `vw_financial_week_live`: admin-semanal.js
- `vw_fiscal_summary`: gbol-service.js, admin-workdays.js
- `vw_night_snapshot`: admin-workdays.js
- `vw_pnl_monthly_v2`: admin-reportes.js
- `vw_recipe_profitability`: admin-central-stock.js
- `vw_staff_performance`: admin-reportes.js
- `vw_stock_global`: admin-central-stock.js, admin-solicitudes.js, logistica-distribucion.js, logistica-stock.js, operativo-solicitudes.js, operativo-stock.js
- `vw_supplier_orders_encargado`: encargado-barra-index.js, encargado-recepcion.js
- `vw_tax_monthly`: admin-reportes.js
- `vw_work_day_summary`: work-day-helper.js
- `vw_workday_pnl`: admin-workdays.js
- `work_day_staff_planning`: work-day-helper.js, admin-workdays.js, encargado-barra-personal.js, encargado-caja-personal.js
- `work_days`: work-day-helper.js, admin-central-stock.js, admin-index.js, admin-solicitudes.js, admin-workdays.js, encargado-barra-personal.js, encargado-caja-index.js, encargado-caja-noche.js, encargado-caja-personal.js, logistica-index.js, operativo-workday.js, scanner.js, staff-caja-index.js

## JS huerfanos (sin referencia HTML)
- `import-logger.js`
- `login.js`
- `admin-index.js`
- `admin-workdays.js`
- `operativo-erp.js`

## Mapa de navegacion
- `encargado-barra-noche.html` -> encargado-barra-index.html -> encargado-barra-index.html -> encargado-barra-index.html
- `encargado-barra-personal.html` -> encargado-barra-index.html
- `encargado-caja-noche.html` -> encargado-caja-index.html -> encargado-caja-personal.html
- `encargado-caja-personal.html` -> encargado-caja-index.html -> encargado-caja-noche.html
- `encargado-recepcion.html` -> encargado-barra-index.html

## Proximos pasos
- Resolver links rotos
- Documentar tablas faltantes en scheme.md
- Revisar paginas huerfanas (eliminar o conectar)
- Verificar JS huerfanos (eliminar o integrar)
