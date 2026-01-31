# Esquema de Base de Datos - FormulaMid 4

Listado actualizado automáticamente al 30/01/2026.

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

### bar_session_sales

_Ventas importadas sistema externo (Gbol) para conciliación._

- **id** (uuid) - PK
- **session_id** (uuid) - FK -> bar_sessions.id
- **external_id** (text)
- **product_name** (text)
- **quantity** (numeric)
- **total_amount** (numeric)
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
- **day_of_month** (integer)
- **weekday** (integer)
- **on_holiday_action** (text)
- **is_active** (boolean)

### finance_payments

_Pagos realizados._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **amount** (numeric)
- **payment_date** (date)
- **method** (text)
- **reference** (text)
- **status** (text)

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
- **created_at** (timestamp with time zone)
- **dni** (text)
- **genero** (text)
- **ciudad** (text)

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

_Items recibidos._

- **id** (uuid) - PK
- **receipt_id** (uuid) - FK -> replenishment_receipts.id
- **sku_id** (uuid) - FK -> master_sku.id
- **quantity_received** (numeric)
- **cost_at_receipt** (numeric)
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
- **priority** (text)
- **desired_date** (date)
- **notes** (text)
- **created_at** (timestamp with time zone)

### replenishment_supplier_orders

_Órdenes de compra a proveedores._

- **id** (uuid) - PK
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **approved_by** (uuid) - FK -> profiles.id
- **status** (text)
- **total_estimated** (numeric)
- **expected_date** (date)
- **notes** (text)
- **created_at** (timestamp with time zone)
- **final_cost** (numeric)

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

_Días operativos (jornadas)._

- **id** (uuid) - PK
- **work_date** (date)
- **status** (text)
- **opened_by** (uuid) - FK -> profiles.id
- **closed_by** (uuid) - FK -> profiles.id
- **opened_at** (timestamp with time zone)
- **closed_at** (timestamp with time zone)
- **created_at** (timestamp with time zone)
- **notes** (text)

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

## Vistas

### v_admin_stock

- **sku_id**, **nombre**, **external_id**, **categoria_id**, **categoria_nombre**, **stock_actual**, **ideal_500**, **ideal_900**

### vw_bar_efficiency

_Eficiencia operativa de barras (Costos teóricos vs físicos)._

- **session_id**, **location**, **work_day_id**, **work_date**, **opened_at**, **status**, **items_revenue**, **cost_physical**, **cost_theoretical**, **cost_difference**, **cost_percentage**

### vw_daily_sales_v2

_Resumen de ventas diarias (Versión 2 - Reemplaza vw_daily_sales)._

- **work_day_id**, **work_date**, **status**, **cash_system**, **cash_declared**, **cash_difference**, **qr_system**, **bar_sales_system**, **total_income**, **total_declared**, **total_difference**, **closing_notes**

### vw_pnl_monthly_v2

_Reporte P&L mensual (Ingresos vs Egresos por categoría)._

- **month**, **type**, **category**, **amount**

### vw_reconcile_afip_gbol

_Conciliación diaria entre AFIP y Gbol (Staging)._

- **noche**, **afip_total**, **gbol_total**, **difference**, **facturas_count**, **items_count**

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
