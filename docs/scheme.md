# Esquema de Base de Datos - FormulaMid 4

Listado actualizado automáticamente al 16/02/2026.

> **Actualización Fase 4** (Updated: 2026-02-07 12:15): Se agregaron tablas de auditoría, configuración de costos y reportes financieros semanales.
>
> - `auth_audit_log` - Auditoría de accesos.
> - `finance_weekly_closings` - Cierres semanales.
> - `import_logs` - Trazabilidad de importaciones.

## Tablas Publicas

### accounts_payable

_Tabla de cuentas por pagar (gastos)._

- **id** (uuid) - PK
- **event_id** (uuid) - FK -> events.id
- **amount** (numeric)
- **concept** (text)
- **due_date** (date)
- **status** (text)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **work_day_id** (uuid) - FK -> work_days.id
- **source_type** (text)
- **source_id** (uuid)
- **category** (text) - DEFAULT 'other', CHECK: 'transport','technical','supplies','entertainment','staff','venue','other'

### auth_audit_log

_Audit trail de eventos de autenticación._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **action** (text)
- **member_id** (text)
- **member_uuid** (uuid) - FK -> members.id
- **ip_address** (text)
- **user_agent** (text)
- **success** (boolean)
- **error_message** (text)
- **metadata** (jsonb)

### bar_session_sales

_Ventas importadas sistema externo (Gbol) para conciliación._

- **id** (uuid) - PK
- **session_id** (uuid) - FK -> bar_sessions.id
- **external_id** (text)
- **product_name** (text)
- **quantity** (numeric)
- **total_amount** (numeric)
- **payment_method** (text) - Payment method: 'cash', 'card', 'transfer', 'other' (Fase 4)
- **imported_at** (timestamp without time zone)

### bar_sessions

_Sesiones de apertura/cierre de barra._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **location** (text)
- **opened_by** (uuid) - FK -> profiles.id
- **opened_at** (timestamp with time zone)
- **status** (text)
- **closing_notes** (text)
- **closed_at** (timestamp with time zone)
- **closed_by** (uuid) - FK -> profiles.id
- **created_at** (timestamp with time zone)
- **opening_notes** (text)

### bar_stock_snapshots

_Capturas de stock (apertura/cierre) por sesión de barra._

- **id** (uuid) - PK
- **session_id** (uuid) - FK -> bar_sessions.id
- **sku_id** (uuid) - FK -> master_sku.id
- **quantity** (numeric)
- **type** (text)
- **captured_at** (timestamp with time zone)
- **created_by** (uuid) - FK -> profiles.id

### cash_closings

_Cierres de caja (arqueos)._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **closed_by** (uuid)
- **event_date** (date)
- **status** (text)
- **total_system** (numeric)
- **total_declared** (numeric)
- **total_difference** (numeric)
- **notes** (text)
- **created_at** (timestamp with time zone)
- **closed_at** (timestamp with time zone)

### cash_movements

_Movimientos de caja (ingresos/egresos)._

- **id** (uuid) - PK
- **cash_closing_id** (uuid) - FK -> cash_closings.id
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **requested_by** (uuid)
- **confirmed_by** (uuid)
- **type** (text)
- **amount** (numeric)
- **reason** (text)
- **status** (text)
- **external_id** (text) - Unique ID from external CSV import (deduplication)
- **created_at** (timestamp with time zone)
- **confirmed_at** (timestamp with time zone)

### closing_terminals

_Detalle de cierre por terminal._

- **id** (uuid) - PK
- **cash_closing_id** (uuid) - FK -> cash_closings.id
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **staff_id** (uuid)
- **system_cash** (numeric)
- **system_zoco** (numeric)
- **declared_cash** (numeric)
- **declared_zoco** (numeric)
- **status** (text)
- **created_at** (timestamp with time zone)
- **submitted_at** (timestamp with time zone)

### consumption_details

_Desglose de consumo por SKU por reporte._

- **id** (uuid) - PK
- **report_id** (uuid) - FK -> consumption_reports.id
- **sku_id** (uuid) - FK -> master_sku.id
- **quantity** (numeric)
- **created_at** (timestamp with time zone)

### consumption_reports

_Reportes de consumo importados (Excel)._

- **id** (uuid) - PK
- **operational_date** (date)
- **file_name** (text)
- **created_at** (timestamp with time zone)

### cost_config

_Configuración de tasas fiscales y comisiones._

- **id** (uuid) - PK
- **category** (text)
- **channel_name** (text)
- **fee_type** (text)
- **name** (text)
- **rate** (numeric)
- **rate_type** (text)
- **applies_to** (text)
- **notes** (text)
- **active** (boolean)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### cost_definitions

_Definiciones de costos recurrentes y fijos._

- **id** (uuid) - PK
- **title** (text)
- **category** (text)
- **frequency** (text)
- **base_amount** (numeric)
- **amount_mode** (text)
- **tax_rate** (numeric)
- **total_with_tax** (numeric)
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **payment_method** (text)
- **due_day** (integer)
- **holiday_rule** (text)
- **voucher_type** (text)
- **is_active** (boolean)
- **notes** (text)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### events

_Eventos especiales._

- **id** (uuid) - PK
- **name** (text)
- **date** (date)
- **status** (text)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### finance_opening_cost_defs

_Definiciones de costos de apertura._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **title** (text)
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **amount_mode** (text)
- **default_amount** (numeric)
- **due_days_before** (integer)
- **sort_order** (integer)
- **is_active** (boolean)

### finance_payment_rules

_Reglas de pago a proveedores._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **title** (text)
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **rule_type** (text)
- **amount_mode** (text)
- **fixed_amount** (numeric)
- **day_of_month** (integer)
- **weekday** (integer)
- **on_holiday_action** (text)
- **is_active** (boolean)

### finance_payments

_Pagos realizados._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **source_type** (text)
- **title** (text)
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **due_date** (date)
- **amount_total** (numeric)
- **status** (text)
- **done_at** (timestamp with time zone)
- **voucher_type** (text)
- **payment_method** (text)
- **notes** (text)
- **rule_id** (uuid)
- **opening_def_id** (uuid)

### finance_weekly_closings

_Cierres semanales financieros (White/Black)._

- **id** (uuid) - PK
- **week_start** (date)
- **income_white** (numeric)
- **income_black** (numeric)
- **expense_white** (numeric)
- **expense_black** (numeric)
- **tax_estimate** (numeric)
- **status** (text)
- **notes** (text)
- **closed_at** (timestamp with time zone)
- **closed_by** (uuid) - FK -> auth.users.id

### import_logs

_Logs de importaciones CSV._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **importer_type** (text)
- **file_name** (text)
- **file_size_bytes** (bigint)
- **started_at** (timestamp with time zone)
- **completed_at** (timestamp with time zone)
- **duration_ms** (integer)
- **status** (text)
- **rows_processed** (integer)
- **rows_imported** (integer)
- **rows_skipped** (integer)
- **rows_failed** (integer)
- **error_message** (text)
- **error_details** (jsonb)
- **warnings** (jsonb)
- **imported_by** (uuid) - FK -> auth.users.id
- **metadata** (jsonb)

### inventory_ideal

_Stock ideal por SKU._

- **id** (uuid) - PK
- **sku_id** (uuid) - FK -> master_sku.id
- **ideal_stock** (numeric)
- **min_stock** (numeric)
- **event_type** (text)
- **created_at** (timestamp with time zone)

### inventory_movements

_Movimientos de inventario (kardex)._

- **id** (uuid) - PK
- **sku_id** (uuid) - FK -> master_sku.id
- **created_by** (uuid) - FK -> profiles.id
- **type** (text)
- **quantity** (numeric)
- **cost** (numeric)
- **notes** (text)
- **created_at** (timestamp with time zone)
- **reference_id** (uuid)

### inventory_stock

_Stock actual._

- **id** (uuid) - PK
- **sku_id** (uuid) - FK -> master_sku.id
- **quantity** (numeric)
- **location** (text)
- **updated_at** (timestamp with time zone)

### inventory_stock_adjustments

_Ajustes manuales de stock._

- **id** (uuid) - PK
- **sku_id** (uuid) - FK -> master_sku.id
- **adjusted_by** (uuid) - FK -> profiles.id
- **quantity_diff** (numeric)
- **reason** (text)
- **notes** (text)
- **created_at** (timestamp with time zone)
- **approved_at** (timestamp with time zone)

### master_categories

_Categorías de productos._

- **id** (uuid) - PK
- **name** (text)
- **parent_id** (uuid)
- **is_active** (boolean)
- **created_at** (timestamp with time zone)

### master_proveedores

_Base de proveedores._

- **id** (uuid) - PK
- **name** (text)
- **tax_id** (text)
- **contact_name** (text)
- **contact_email** (text)
- **contact_phone** (text)
- **payment_terms** (text)
- **banco** (text)
- **cbu_alias** (text)
- **active** (boolean)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **notas** (text)
- **cbu** (text)
- **alias** (text)
- **category** (text)

### master_recipes

_Recetas y fórmulas de conversión para conciliación (Venta -> Stock)._

- **id** (uuid) - PK
- **name** (text)
- **external_id** (text)
- **ingredients** (jsonb)
- **created_at** (timestamp with time zone)
- **precio_venta** (numeric)

### master_sku

_Catálogo de productos (SKUs)._

- **id** (uuid) - PK
- **nombre** (text)
- **categoria_id** (uuid) - FK -> master_categories.id
- **proveedor_default_id** (uuid) - FK -> master_proveedores.id
- **pack_qty** (numeric)
- **ml_por_unidad** (numeric)
- **costo** (numeric)
- **costo_pack** (numeric)
- **external_id** (numeric)
- **tipo** (text) - Clasificación: bar, limpieza, descartables, otros
- **active** (boolean)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### master_staff_roles

_Roles de personal._

- **id** (uuid) - PK
- **name** (text)
- **description** (text)
- **base_salary** (numeric)
- **permissions** (jsonb)
- **created_at** (timestamp with time zone)

### members

_Miembros del club._

- **id** (uuid) - PK
- **member_id** (text)
- **nombre** (text)
- **email** (text)
- **telefono** (text)
- **instagram** (text)
- **nacimiento** (text)
- **status** (text)
- **access_password** (text)
- **access_password_hash** (text)
- **created_at** (timestamp with time zone)

### menu_categories

_Categorías del menú._

- **id** (uuid) - PK
- **name** (text)
- **slug** (text)
- **display_order** (integer)
- **is_active** (boolean)
- **created_at** (timestamp with time zone)

### menu_items

_Items del menú (carta)._

- **id** (uuid) - PK
- **name** (text)
- **price** (numeric)
- **category** (text)
- **is_active** (boolean)

### payment_categories

_Categorías de métodos de pago._

- **id** (bigint) - PK
- **tipo_comprobante** (text)
- **active** (boolean)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### payment_methods

_Métodos de pago._

- **id** (bigint) - PK
- **category_id** (bigint) - FK -> payment_categories.id
- **name** (text)
- **active** (boolean)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### pos_terminals

_Terminales de Punto de Venta._

- **id** (uuid) - PK
- **friendly_name** (text)
- **provider** (text)
- **external_id** (text)
- **is_active** (boolean)
- **created_at** (timestamp with time zone)

### pos_terminals_alias

_Mapeo de nombres de terminales externos a IDs internos._

- **id** (uuid) - PK
- **alias** (text)
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **created_at** (timestamp with time zone)

### profile_functions

_Funciones asignadas a perfiles._

- **id** (uuid) - PK
- **profile_id** (uuid) - FK -> profiles.id
- **function_id** (uuid) - FK -> staff_functions.id
- **active** (boolean)
- **created_at** (timestamp with time zone)

### profiles

_Perfiles de usuario (vinculados a auth)._

- **id** (uuid) - FK -> auth.users.id, PK
- **full_name** (text)
- **role** (text)
- **active** (boolean)
- **created_at** (timestamp with time zone)

### qr_batches

_Lotes de códigos QR (entradas/invitaciones)._

- **id** (uuid) - PK
- **name** (text)
- **description** (text)
- **financial_type** (text)
- **market_source** (text)
- **unit_price** (numeric)
- **created_by** (uuid) - FK -> profiles.id
- **created_at** (timestamp with time zone)

### qr_checkins

_Logs de accesos._

- **id** (uuid) - PK
- **code_id** (uuid) - FK -> qr_codes.id
- **operator_id** (uuid) - FK -> profiles.id
- **success** (boolean)
- **message** (text)
- **created_at** (timestamp with time zone)

### qr_codes

_Códigos individuales._

- **id** (uuid) - PK
- **batch_id** (uuid) - FK -> qr_batches.id
- **code** (text)
- **status** (text)
- **accredited_at** (timestamp with time zone)
- **accredited_by** (uuid) - FK -> profiles.id
- **work_day_id** (uuid) - FK -> work_days.id
- **external_id** (text)
- **created_at** (timestamp with time zone)
- **ticket_xml** (text)

### recipe_code_mappings

_Mapeo de códigos POS a recetas._

- **id** (uuid) - PK
- **pos_code** (text)
- **recipe_id** (uuid) - FK -> master_recipes.id
- **notes** (text)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### replenishment_items

_Items en solicitudes de reposición._

- **id** (uuid) - PK
- **request_id** (uuid) - FK -> replenishment_requests.id
- **sku_id** (uuid) - FK -> master_sku.id
- **adjust_responsible_id** (uuid) - FK -> profiles.id
- **quantity_requested** (numeric)
- **quantity_approved** (numeric)
- **status** (text)
- **notes** (text)
- **pre_approval_status** (text)
- **pre_approved_by** (uuid) - FK -> profiles.id
- **pre_approved_at** (timestamp with time zone)
- **pre_rejection_reason** (text)
- **created_at** (timestamp with time zone)

### replenishment_receipt_items

_Items recibidos + conteo de verificación._

- **id** (uuid) - PK
- **receipt_id** (uuid) - FK -> replenishment_receipts.id
- **sku_id** (uuid) - FK -> master_sku.id
- **quantity_received** (numeric)
- **cost_at_receipt** (numeric)
- **counted_qty** (numeric) - Cantidad contada físicamente (Fase 4: encargado-barra-conteo)
- **counted_by** (uuid) - FK -> auth.users.id - Quién realizó el conteo
- **counted_at** (timestamp with time zone) - Fecha/hora del conteo
- **count_notes** (text) - Observaciones del conteo
- **count_status** (text) - Estado: 'pending', 'counted', 'discrepancy'
- **created_at** (timestamp with time zone)

### replenishment_receipts

_Recepciones de mercadería._

- **id** (uuid) - PK
- **supplier_order_id** (uuid) - FK -> replenishment_supplier_orders.id
- **received_by** (uuid) - FK -> profiles.id
- **receipt_date** (timestamp with time zone)
- **invoice_number** (text)
- **total_amount** (numeric)
- **notes** (text)
- **created_at** (timestamp with time zone)

### replenishment_requests

_Solicitudes de reposición (pedidos internos)._

- **id** (uuid) - PK
- **user_id** (uuid) - FK -> profiles.id
- **status** (text)
- **operational_date** (date)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **target_work_day_id** (uuid) - FK -> work_days.id — Jornada destino

### replenishment_supplier_orders

_Órdenes de compra a proveedores._

- **id** (uuid) - PK
- **request_id** (uuid) - FK -> replenishment_requests.id
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **approved_by** (uuid) - FK -> profiles.id
- **status** (text)
- **final_cost** (numeric)
- **eta_date** (date)
- **notes** (text)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **rejection_reason** (text)
- **invoice_number** (text)
- **invoice_date** (date)
- **invoice_amount** (numeric)
- **invoice_received_by** (uuid) - FK -> profiles.id
- **invoice_received_at** (timestamp with time zone)

### replenishment_tracking

_Seguimiento de órdenes de compra._

- **id** (uuid) - PK
- **order_id** (uuid) - FK -> replenishment_supplier_orders.id
- **status** (text)
- **notes** (text)
- **created_by** (uuid) - FK -> profiles.id
- **created_at** (timestamp with time zone)

### revenue_details

_Detalle de reportes de recaudación._

- **id** (uuid) - PK
- **report_id** (uuid) - FK -> revenue_reports.id
- **recipe_id** (uuid) - FK -> master_recipes.id
- **recipe_name** (text)
- **external_code** (text)
- **q_paga** (numeric)
- **q_sin_cargo** (numeric)
- **q_vip** (numeric)
- **total_quantity** (numeric)
- **total_amount** (numeric)
- **created_at** (timestamp with time zone)

### revenue_reports

_Reportes de recaudación._

- **id** (uuid) - PK
- **operational_date** (date)
- **file_name** (text)
- **total_revenue** (numeric)
- **notes** (text)
- **created_at** (timestamp with time zone)
- **created_by** (uuid) - FK -> auth.users.id
- **updated_at** (timestamp with time zone)
- **updated_by** (uuid) - FK -> auth.users.id
- **work_day_id** (uuid) - FK -> work_days.id — Jornada asociada

### site_config

_Configuración del sitio y variables globales._

- **id** (uuid) - PK
- **key** (text)
- **url** (text)
- **is_active** (boolean)
- **created_at** (timestamp with time zone)

### sku_change_requests

_Solicitudes de cambio en SKUs._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **status** (text)
- **request_type** (text)
- **sku_id** (uuid) - FK -> master_sku.id
- **sku_nombre** (text)
- **justification** (text)
- **payload** (jsonb)
- **requested_by** (uuid) - FK -> profiles.id
- **approved_by** (uuid) - FK -> profiles.id
- **approved_at** (timestamp with time zone)

### staff_convocations

_Convocatorias de personal._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **user_id** (uuid) - FK -> profiles.id
- **role_id** (uuid) - FK -> master_staff_roles.id
- **status** (text)
- **assigned_location** (text)
- **convocated_by** (uuid) - FK -> profiles.id
- **confirmed_at** (timestamp with time zone)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### staff_functions

_Catálogo de funciones de staff._

- **id** (uuid) - PK
- **slug** (text)
- **name** (text)
- **description** (text)
- **created_at** (timestamp with time zone)

### work_day_staff_planning

_Planificación de personal por día._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **role_id** (uuid) - FK -> master_staff_roles.id
- **quantity** (integer)
- **approved_budget** (numeric)
- **created_at** (timestamp with time zone)

### work_days

_Días operativos (jornadas). Lifecycle: DRAFT → PLANNED → ACTIVE → CLOSED._

- **id** (uuid) - PK
- **work_date** (date) - UNIQUE
- **status** (text) - CHECK: 'DRAFT', 'PLANNED', 'ACTIVE', 'CLOSED'
- **opened_by** (uuid) - FK -> profiles.id
- **closed_by** (uuid) - FK -> profiles.id
- **opened_at** (timestamp with time zone)
- **closed_at** (timestamp with time zone)
- **created_at** (timestamp with time zone)
- **notes** (text)
- **attendance** (integer) - Asistencia (default: 0)
- **event_id** (uuid) - FK -> events.id ON DELETE SET NULL
- **event_name** (text) - Cache desnormalizado del nombre
- **countdown_active** (boolean) - Toggle countdown web (default: false)
- **health_score** (integer) - Score 0-100 calculado por calculate_health_score()
- **net_result** (numeric) - Resultado neto (ingresos - egresos)

## Tablas de Staging (Fase 1 / Admin Cierre)

### stg_afip_facturas

_Ingesta cruda de facturación electrónica AFIP._

- **id** (bigint) - PK
- **ptovta** (text)
- **factura_nro** (text)
- **cae** (text)
- **fechafc** (text)
- **caja_nro** (text)
- **caja_nom** (text)
- **importe_total_raw** (text)
- **efectivo_raw** (text)
- **tarjetas_raw** (text)
- **noche_fiscal** (text)
- **hora** (text)
- **ticket_nro** (text)
- **ingested_at** (timestamp with time zone)

### stg_extracciones

_Ingesta cruda de extracciones bancarias/caja._

- **id** (bigint) - PK
- **noche_meta** (text)
- **terminal_raw** (text)
- **hora** (text)
- **monto_raw** (text)
- **estado** (text)
- **hora_aut** (text)
- **usuario_gen** (text)
- **ingested_at** (timestamp with time zone)

### stg_gbol_items

_Ingesta cruda de recaudación por ítem Gbol._

- **id** (bigint) - PK
- **noche_meta** (text)
- **articulo_codigo** (text)
- **articulo_nombre** (text)
- **q_paga** (text)
- **q_sin_cargo** (text)
- **q_tarj_vip** (text)
- **total_caja_raw** (text)
- **ingested_at** (timestamp with time zone)

### stg_passline_tickets

_Ingesta cruda de tickets Passline._

- **id** (bigint) - PK
- **external_ticket_id** (text)
- **nombre** (text)
- **email** (text)
- **telefono** (text)
- **dni** (text)
- **id_compra** (text)
- **llave_evento** (text)
- **fecha_evento** (text)
- **fecha_compra** (text)
- **tipo_ticket** (text)
- **total_raw** (text)
- **estado_ticket** (text)
- **fecha_hora_val_1** (text)
- **fecha_hora_val_2** (text)
- **codigo_activacion** (text)
- **ingested_at** (timestamp with time zone)

### pos_terminals_alias

_Mapeo de nombres de terminales externos a IDs internos._

- **id** (uuid) - PK
- **alias** (text)
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **created_at** (timestamp with time zone)

### staff_accruals

_Devenciones de nómina: convierte asistencia (staff_convocations) en deuda salarial por jornada._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **user_id** (uuid) - FK -> profiles.id
- **role_id** (uuid) - FK -> master_staff_roles.id
- **base_amount** (numeric) - Tarifa del rol (snapshot de base_rate)
- **adjustments** (numeric) - Ajuste manual (+/-)
- **total_amount** (numeric) - GENERATED: base_amount + adjustments
- **status** (text) - 'accrued' | 'exported' | 'paid' | 'cancelled'
- **notes** (text)
- **exported_payment_id** (uuid) - FK -> finance_payments.id
- **created_at** (timestamp with time zone)
- **created_by** (uuid) - FK -> auth.users.id
- **updated_at** (timestamp with time zone)
- **UNIQUE**: (work_day_id, user_id)

## Vistas

### v_admin_stock

- **sku_id**, **nombre**, **external_id**, **categoria_id**, **categoria_nombre**, **stock_actual**, **ideal_500**, **ideal_900**

### vw_bar_efficiency

_Eficiencia operativa de barras (Costos teóricos vs físicos)._

- **session_id**, **location**, **work_day_id**, **work_date**, **opened_at**, **status**, **items_revenue**, **cost_physical**, **cost_theoretical**, **cost_difference**, **cost_percentage**

### vw_daily_sales_v2

_Resumen de ventas diarias (Versión 2 - Reemplaza vw_daily_sales)._

- **work_day_id**, **work_date**, **status**, **cash_system**, **cash_declared**, **cash_difference**, **qr_system**, **bar_sales_system**, **total_income**, **total_declared**, **total_difference**, **closing_notes**

### vw_finance_weekly

_Reporte semanal histórico._

- **week_start**, **income_white**, **expense_white**, **balance_white**, **tax_estimate**

### vw_financial_week_live

_Estado financiero de la semana en curso (tiempo real)._

- **week_start**, **current_income**, **current_expense**, **projected_balance**

### vw_pnl_monthly_v2

_Reporte P&L mensual (Ingresos vs Egresos por categoría)._

- **month**, **type**, **category**, **amount**

### vw_recipe_profitability

_Análisis de rentabilidad por receta (Costo vs. Precio Venta)._

- **recipe_id**, **name**, **category**, **cost_per_unit**, **sale_price**, **margin_amount**, **margin_percentage**

### vw_reconcile_afip_gbol

_Conciliación diaria entre AFIP y Gbol (Staging)._

- **noche**, **afip_total**, **gbol_total**, **difference**, **facturas_count**, **items_count**

### vw_sku_ideal_dynamic

_Cálculo dinámico de stock ideal basado en ventas históricas._

- **sku_id**, **product_name**, **avg_weekly_sales**, **safety_stock**, **recommended_order_qty**

### vw_staff_performance

- **user_id**, **full_name**, **role**, **shifts_total**, **shifts_confirmed**, **closures_count**, **net_cash_difference**, **abs_cash_difference**

### vw_stock_global

- **sku_id**, **sku_nombre**, **categoria_id**, **categoria_nombre**, **stock_actual**, **requerido**, **activo**, **estado**

### vw_supplier_orders_admin

- **order_id**, **proveedor**, **estado**, **fecha_eta**, **presupuesto**, **costo_final**, **skus_count**

### vw_supplier_orders_encargado

- **order_id**, **proveedor**, **skus_count**, **final_cost**, **eta_date**, **status**, **created_at**

### vw_tax_monthly

_Reporte fiscal mensual estimado._

- **month**, **total_factura_a**, **estimated_vat_credit**, **total_factura_c**

### vw_work_day_summary

- **open_day**, **planned_days**, **closed_days**

### vw_daily_sales

_Consolidación financiera diaria (Fase 2 - 01/02/2026)._

Integra automáticamente todos los flujos financieros de una jornada.

**Fuentes**: `cash_closings`, `closing_terminals`, `bar_sessions`, `bar_session_sales`, `qr_codes`, `qr_batches`, `cash_movements`, `accounts_payable`

- **work_day_id** (uuid) - FK → work_days.id
- **work_date** (date)
- **work_day_status** (text)
- **opened_at** (timestamp)
- **closed_at** (timestamp)
- **cash_system** (numeric) - Total efectivo sistema
- **cash_declared** (numeric) - Total efectivo declarado
- **cash_difference** (numeric) - Diferencia efectivo
- **zoco_system** (numeric) - Total digital sistema
- **zoco_declared** (numeric) - Total digital declarado
- **zoco_difference** (numeric) - Diferencia digital
- **bar_sales_system** (numeric) - Ventas de barra
- **bar_transaction_count** (bigint) - Cantidad transacciones barra
- **qr_total** (numeric) - Ingresos por QR/boletería
- **qr_people_count** (bigint) - Personas acreditadas
- **withdrawals** (numeric) - Retiros de tesorería
- **withdrawal_count** (bigint) - Cantidad de retiros
- **expenses** (numeric) - Gastos
- **expense_count** (bigint) - Cantidad de gastos
- **total_system** (numeric) - **Total ingresos sistema**
- **total_declared** (numeric) - **Total declarado**
- **total_difference** (numeric) - **Diferencia total**
- **net_to_render** (numeric) - **Neto a rendir** (ingresos - retiros - gastos)
- **closing_notes** (text)
- **closing_status** (text)
- **closed_by** (uuid)

### vw_bar_efficiency

_Análisis de eficiencia de barra: Físico vs. Teórico (Fase 2 - 01/02/2026)._

Compara consumo físico (conteos) vs. consumo teórico (ventas × recetas).

**Fuentes**: `bar_sessions`, `bar_stock_snapshots`, `bar_session_sales`, `master_recipes`, `master_sku`, `profiles`

- **session_id** (uuid) - FK → bar_sessions.id
- **work_day_id** (uuid) - FK → work_days.id
- **work_date** (date)
- **location** (text) - Ubicación de barra
- **status** (text)
- **opened_at** (timestamp)
- **closed_at** (timestamp)
- **opened_by_name** (text)
- **closed_by_name** (text)
- **cost_physical** (numeric) - Costo del stock consumido físicamente
- **cost_theoretical** (numeric) - Costo según ventas × recetas
- **cost_difference** (numeric) - Diferencia (físico - teórico)
- **variance_percentage** (numeric) - % de varianza
- **efficiency_rating** (text) - Clasificación: EXCELENTE (≤3%), BUENO (≤5%), ACEPTABLE (≤10%), CRÍTICO (>10%), SIN_DATOS
- **skus_with_variance** (bigint) - SKUs con diferencias
- **revenue_total** (numeric) - Ingresos por ventas
- **transaction_count** (bigint) - Cantidad de transacciones
- **gross_margin** (numeric) - Margen bruto (ventas - costo teórico)
- **gross_margin_percentage** (numeric) - % margen bruto
- **loss_amount** (numeric) - Pérdida valorizada (solo si hay faltante)

### vw_staff_accruals_summary

_Resumen de devenciones por persona/rol para reportes de nómina._

**Fuentes**: `staff_accruals`, `profiles`, `master_staff_roles`, `work_days`

- **user_id** (uuid)
- **full_name** (text)
- **role_name** (text)
- **role_id** (uuid)
- **nights_worked** (int) - Cantidad de noches trabajadas
- **total_owed** (numeric) - Total devengado
- **total_paid** (numeric) - Total pagado
- **total_pending** (numeric) - Total pendiente (accrued + exported)
- **first_date** (date) - Primera jornada
- **last_date** (date) - Última jornada

### vw_per_capita_revenue

_Revenue per capita por jornada: ingresos totales / asistencia._

**Fuentes**: `work_days`, `cash_closings`, `qr_codes`, `qr_batches`, `bar_sessions`, `bar_session_sales`

- **work_day_id** (uuid)
- **work_date** (date)
- **entries** (integer) - Asistencia
- **total_revenue** (numeric)
- **revenue_per_capita** (numeric)

### vw_workday_pnl

_P&L por jornada: ingresos (cash, QR, bar) vs egresos (staff, stock, extras)._

**Fuentes**: `work_days`, `cash_closings`, `qr_codes`, `qr_batches`, `bar_sessions`, `bar_session_sales`, `staff_accruals`, `consumption_reports`, `consumption_details`, `master_sku`, `accounts_payable`

- **work_day_id** (uuid)
- **work_date** (date)
- **status** (text)
- **event_name** (text)
- **attendance** (integer)
- **income_cash** (numeric)
- **income_qr** (numeric)
- **income_bar** (numeric)
- **total_income** (numeric)
- **expense_staff** (numeric)
- **expense_stock** (numeric)
- **expense_extras** (numeric)
- **total_expense** (numeric)
- **net_result** (numeric)
- **margin_pct** (numeric)

### vw_workday_benchmarks

_Promedios históricos por día de semana y tipo de evento para benchmarking._

**Fuentes**: `work_days`, `vw_workday_pnl`

- **day_of_week** (integer) - 0=Sunday...6=Saturday
- **event_type** (text) - Nombre del evento o 'regular'
- **sample_count** (bigint)
- **avg_income** (numeric)
- **avg_expense** (numeric)
- **avg_net_result** (numeric)
- **avg_margin_pct** (numeric)
- **avg_attendance** (numeric)

## Tabla de Plantillas

### work_day_templates

_Plantillas reutilizables para jornadas: configuración de staff, costos asociados y promedios históricos._

- **id** (uuid) - PK
- **name** (text) - NOT NULL
- **staff_config** (jsonb) - Configuración de dotación por cargo
- **cost_ids** (uuid[]) - IDs de cost_definitions asociados
- **avg_revenue** (numeric) - Promedio de ingresos
- **avg_attendance** (integer) - Promedio de asistencia
- **usage_count** (integer) - Veces utilizada
- **created_at** (timestamptz)

## RPCs de Workday

| RPC                                                         | Retorna | Descripción                                           |
| ----------------------------------------------------------- | ------- | ----------------------------------------------------- |
| `rpc_create_work_day(date, event_id?, event_name?, notes?)` | void    | Crea jornada en DRAFT                                 |
| `rpc_confirm_work_day(id)`                                  | void    | DRAFT → PLANNED                                       |
| `rpc_revert_work_day(id)`                                   | void    | PLANNED → DRAFT                                       |
| `rpc_open_work_day(id)`                                     | jsonb   | PLANNED → ACTIVE + pre-flight checks                  |
| `rpc_close_work_day(id)`                                    | void    | ACTIVE → CLOSED                                       |
| `calculate_health_score(id)`                                | integer | Score 0-100 (staff 40, bar 20, requests 20, stock 20) |
| `admin_generate_workday_accruals(id)`                       | jsonb   | Genera devenciones (guard: ACTIVE/CLOSED)             |
| `admin_export_accruals_to_payments(id)`                     | jsonb   | Exporta devenciones a finance_payments                |
