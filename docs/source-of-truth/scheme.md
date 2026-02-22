# Esquema de Base de Datos - FormulaMid 4

Listado actualizado automáticamente al 20/02/2026.

> **Actualización Fase 4.2** (Updated: 2026-02-20 03:47): Sincronización profunda contra Supabase real.
>
> - Agregadas 3 tablas: `sku_price_history`, `payment_commission_config`, `payment_reconciliation`.
> - Agregadas 6 vistas: `vw_financial_week_live`, `vw_pnl_monthly_v2`, `vw_workday_cash_balance`, `vw_workday_commissions`, `vw_workday_stock_variance`, `vw_reconciliation_status`.
> - Columna `notes` agregada a `closing_terminals`.
> - Corregidas columnas de vistas existentes contra DB live.
> - Conteos de filas actualizados (67 tablas, 30 vistas, 38 RPCs).

## Tablas Publicas

### accounts_payable

_Tabla de cuentas por pagar (gastos)._

- **id** (uuid) - PK
- **event_id** (uuid) - FK -> events.id
- **amount** (numeric) - DEFAULT 0
- **concept** (text)
- **due_date** (date)
- **status** (text) - DEFAULT 'pending'
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **work_day_id** (uuid) - FK -> work_days.id
- **source_type** (text)
- **source_id** (uuid)
- **category** (text) - DEFAULT 'other', CHECK: 'transport','technical','supplies','entertainment','staff','venue','other'

### audit_config

_Configuración de umbrales y reglas de clasificación para auditorías de cierre de noche._

- **id** (uuid) - PK
- **domain** (text) - Dominio de configuración (e.g. 'gbol')
- **key** (text) - Nombre del parámetro
- **value** (jsonb) - Valor del parámetro
- **description** (text) - Descripción del parámetro
- **is_active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### auth_audit_log

_Audit trail de eventos de autenticación para detección de abusos. (~6858 rows)_

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **action** (text) - CHECK: 'login','login_failed','recovery','password_change','session_validate'
- **member_id** (text)
- **member_uuid** (uuid) - FK -> members.id
- **ip_address** (text)
- **user_agent** (text)
- **success** (boolean) - DEFAULT true
- **error_message** (text)
- **metadata** (jsonb) - DEFAULT '{}'

### bar_session_sales

_Ventas importadas sistema externo (Gbol) para conciliación._

- **id** (uuid) - PK
- **session_id** (uuid) - FK -> bar_sessions.id
- **external_id** (text)
- **product_name** (text)
- **quantity** (numeric) - DEFAULT 0
- **total_amount** (numeric) - DEFAULT 0
- **imported_at** (timestamp with time zone)
- **payment_method** (text) - DEFAULT 'cash', CHECK: 'cash','card','transfer','other'

### bar_sessions

_Sesiones de apertura/cierre de barra._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **opened_by** (uuid) - FK -> profiles.id
- **closed_by** (uuid) - FK -> profiles.id
- **location** (text) - DEFAULT 'General'
- **opened_at** (timestamp with time zone)
- **closed_at** (timestamp with time zone)
- **status** (text) - DEFAULT 'active'
- **opening_notes** (text)
- **closing_notes** (text)
- **created_at** (timestamp with time zone)

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
- **event_date** (date) - UNIQUE
- **status** (text) - DEFAULT 'open', CHECK: 'open','closed'
- **closed_at** (timestamp with time zone)
- **closed_by** (uuid) - FK -> auth.users.id
- **notes** (text)
- **created_at** (timestamp with time zone)
- **work_day_id** (uuid) - FK -> work_days.id
- **total_system** (numeric) - DEFAULT 0
- **total_declared** (numeric) - DEFAULT 0
- **total_difference** (numeric) - DEFAULT 0

### cash_movements

_Movimientos de caja (ingresos/egresos)._

- **id** (uuid) - PK
- **cash_closing_id** (uuid) - FK -> cash_closings.id
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **amount** (numeric)
- **type** (text) - DEFAULT 'withdrawal', CHECK: 'withdrawal','deposit'
- **reason** (text)
- **requested_by** (uuid) - FK -> auth.users.id
- **confirmed_by** (uuid) - FK -> auth.users.id
- **status** (text) - DEFAULT 'pending', CHECK: 'pending','confirmed','rejected'
- **created_at** (timestamp with time zone)
- **confirmed_at** (timestamp with time zone)
- **external_id** (text) - ID único desde CSV para deduplicación. Formato: EXT-{terminal}-{timestamp}-{amount}

### closing_terminals

_Detalle de cierre por terminal._

- **id** (uuid) - PK
- **cash_closing_id** (uuid) - FK -> cash_closings.id
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **staff_id** (uuid) - FK -> auth.users.id
- **declared_cash** (numeric) - DEFAULT 0
- **declared_zoco** (numeric) - DEFAULT 0
- **system_cash** (numeric) - DEFAULT 0
- **system_zoco** (numeric) - DEFAULT 0
- **status** (text) - DEFAULT 'pending', CHECK: 'pending','submitted','verified'
- **submitted_at** (timestamp with time zone)
- **created_at** (timestamp with time zone)
- **signature_data** (text)
- **notes** (text) - Notas del operativo al declarar

### consumption_details

_Desglose de consumo por SKU por reporte. (~90 rows)_

- **id** (uuid) - PK
- **report_id** (uuid) - FK -> consumption_reports.id
- **sku_id** (uuid) - FK -> master_sku.id
- **quantity** (numeric)
- **created_at** (timestamp with time zone)

### consumption_reports

_Reportes de consumo importados (Excel). (~5 rows)_

- **id** (uuid) - PK
- **operational_date** (date)
- **file_name** (text)
- **created_at** (timestamp with time zone)
- **report_type** (text) - DEFAULT 'consumption', CHECK: 'consumption','revenue'

### cost_config

_Configuración de tasas fiscales y comisiones por canal de pago. (~21 rows)_

- **id** (uuid) - PK
- **category** (text) - CHECK: 'tax','channel'
- **channel_name** (text)
- **fee_type** (text)
- **name** (text)
- **rate** (numeric) - DEFAULT 0 — Tasa como decimal (0.21 = 21%)
- **rate_type** (text) - DEFAULT 'percentage', CHECK: 'percentage','fixed'
- **applies_to** (text) - DEFAULT 'base', CHECK: 'base','final','profit'
- **notes** (text)
- **active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### cost_definitions

_Definiciones de costos recurrentes y por noche. Alimenta la cola de pagos. (~14 rows)_

- **id** (uuid) - PK
- **title** (text)
- **category** (text) - CHECK: 'RECURRENTE','FIJO'
- **frequency** (text) - CHECK: 'per_event','weekly','monthly','quarterly','semestral','annual'
- **base_amount** (numeric) - DEFAULT 0
- **amount_mode** (text) - DEFAULT 'FIXED', CHECK: 'FIXED','VARIABLE'
- **tax_rate** (numeric) - DEFAULT 0
- **total_with_tax** (numeric) - DEFAULT 0
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **payment_method** (text)
- **due_day** (integer)
- **holiday_rule** (text) - DEFAULT 'IGNORE', CHECK: 'IGNORE','PREV','NEXT'
- **voucher_type** (text)
- **is_active** (boolean) - DEFAULT true
- **notes** (text)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### events

_Eventos especiales. (~11 rows)_

- **id** (uuid) - PK
- **name** (text)
- **date** (date)
- **status** (text) - DEFAULT 'open'
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **event_time** (time without time zone) - DEFAULT '23:59:00' — Hora del evento para countdown

### finance_opening_cost_defs

_Definiciones de costos de apertura._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **title** (text)
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **amount_mode** (text) - DEFAULT 'FIXED'
- **default_amount** (numeric) - DEFAULT 0
- **due_days_before** (integer) - DEFAULT 0
- **sort_order** (integer) - DEFAULT 100
- **is_active** (boolean) - DEFAULT true

### finance_payment_rules

_Reglas de pago a proveedores._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **title** (text)
- **rule_type** (text)
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **amount_mode** (text) - DEFAULT 'FIXED'
- **fixed_amount** (numeric) - DEFAULT 0
- **is_active** (boolean) - DEFAULT true
- **weekday** (integer)
- **day_of_month** (integer)
- **on_holiday_action** (text) - DEFAULT 'IGNORE'

### finance_payments

_Pagos realizados. (~13 rows)_

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **source_type** (text)
- **title** (text)
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **due_date** (date)
- **amount_total** (numeric) - DEFAULT 0
- **status** (text) - DEFAULT 'PENDING'
- **done_at** (timestamp with time zone)
- **voucher_type** (text)
- **payment_method** (text)
- **notes** (text)
- **created_by** (uuid)
- **supplier_order_id** (uuid)
- **cost_definition_id** (uuid)
- **work_day_id** (uuid)
- **invoice_number** (text)
- **invoice_date** (date)
- **invoice_amount** (numeric)
- **approved_by** (uuid)
- **approved_at** (timestamp with time zone)
- **opening_def_id** (uuid) - FK -> finance_opening_cost_defs.id
- **rule_id** (uuid) - FK -> finance_payment_rules.id

### finance_weekly_closings

_Cierres semanales financieros (White/Black)._

- **id** (uuid) - PK
- **week_start** (date) - UNIQUE
- **income_white** (numeric) - DEFAULT 0
- **income_black** (numeric) - DEFAULT 0
- **expense_white** (numeric) - DEFAULT 0
- **expense_black** (numeric) - DEFAULT 0
- **tax_estimate** (numeric) - DEFAULT 0
- **status** (text) - DEFAULT 'CLOSED', CHECK: 'CLOSED','AUDITED'
- **notes** (text)
- **closed_at** (timestamp with time zone)
- **closed_by** (uuid) - FK -> auth.users.id

### gbol_sync_log

_Audit log de operaciones de sincronización GBOL API._

- **id** (uuid) - PK
- **endpoint** (text)
- **noche** (date)
- **punto_venta** (text)
- **records_imported** (integer) - DEFAULT 0
- **status** (text) - CHECK: 'success','partial','error'
- **error_detail** (text)
- **duration_ms** (integer)
- **synced_by** (uuid) - FK -> auth.users.id
- **synced_at** (timestamp with time zone)

### import_gbol_comandas

_Detalle de items vendidos por ticket desde GBOL API Endpoint #3 (comandas por noche)._

- **id** (uuid) - PK
- **gbol_ticket_id** (text)
- **noche** (date)
- **tipo** (text) - CHECK: 'venta','descuento','cortesia'
- **gbol_caja** (text)
- **hora** (text)
- **external_id** (text)
- **product_name** (text)
- **cantidad** (numeric) - DEFAULT 0
- **monto** (numeric) - DEFAULT 0
- **precio_unitario** (numeric) - DEFAULT 0
- **imported_at** (timestamp with time zone)

### import_gbol_facturacion

_Tickets fiscales importados desde GBOL API Endpoint #1 (facturacionElectronicaConsulta)._

- **id** (uuid) - PK
- **gbol_ticket_id** (text)
- **noche** (date)
- **tipo_fiscal** (text) - CHECK: 'blanco','negro'
- **tipo_comprobante** (text) - CHECK: 'A','B','X'
- **cae** (text)
- **nro_factura** (text)
- **punto_venta** (integer)
- **total** (numeric) - DEFAULT 0
- **efectivo** (numeric) - DEFAULT 0
- **digital** (numeric) - DEFAULT 0
- **tarjetas** (numeric) - DEFAULT 0
- **mercadopago** (numeric) - DEFAULT 0
- **base_imponible** (numeric) - DEFAULT 0
- **iva** (numeric) - DEFAULT 0
- **gbol_caja_nombre** (text)
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **cliente_cuit** (text)
- **cliente_razon** (text)
- **raw_data** (jsonb)
- **imported_at** (timestamp with time zone)

### import_gbol_withdrawals

_Extracciones de caja GBOL. Synced durante noches activas via syncNight flow._

- **id** (uuid) - PK
- **noche** (date)
- **gbol_id** (text)
- **gbol_caja_nombre** (text)
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **monto** (numeric) - DEFAULT 0
- **motivo** (text)
- **autorizado_por** (text)
- **operador** (text)
- **hora** (timestamp with time zone)
- **raw_data** (jsonb)
- **imported_at** (timestamp with time zone)

### import_logs

_Logs de importaciones CSV. (RLS: OFF)_

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **importer_type** (text)
- **file_name** (text)
- **file_size_bytes** (bigint)
- **started_at** (timestamp with time zone)
- **completed_at** (timestamp with time zone)
- **duration_ms** (integer)
- **status** (text) - DEFAULT 'pending'
- **rows_processed** (integer) - DEFAULT 0
- **rows_imported** (integer) - DEFAULT 0
- **rows_skipped** (integer) - DEFAULT 0
- **rows_failed** (integer) - DEFAULT 0
- **error_message** (text)
- **error_details** (jsonb)
- **warnings** (jsonb)
- **imported_by** (uuid) - FK -> auth.users.id
- **metadata** (jsonb)

### inventory_ideal

_Stock ideal por SKU. PK = sku_id (1 row por SKU)._

- **sku_id** (uuid) - PK, FK -> master_sku.id
- **ideal_500** (numeric) - Stock ideal para 500 asistentes
- **ideal_900** (numeric) - Stock ideal para 900 asistentes
- **updated_at** (timestamp with time zone)

### inventory_movements

_Movimientos de inventario (kardex)._

- **id** (uuid) - PK
- **sku_id** (uuid) - FK -> master_sku.id
- **qty_delta** (numeric) - Cantidad del movimiento (+/-)
- **movement_type** (text) - Tipo de movimiento
- **ref_table** (text) - Tabla de referencia
- **ref_id** (uuid) - ID de referencia
- **created_by** (uuid) - FK -> profiles.id, DEFAULT auth.uid()
- **created_at** (timestamp with time zone)

### inventory_stock

_Stock actual. PK = sku_id (1 row por SKU). (~22 rows)_

- **sku_id** (uuid) - PK, FK -> master_sku.id
- **stock_actual** (numeric) - DEFAULT 0
- **updated_at** (timestamp with time zone)
- **requerido** (numeric) - DEFAULT 0

### inventory_stock_adjustments

_Ajustes manuales de stock._

- **id** (uuid) - PK
- **sku_id** (uuid) - FK -> master_sku.id
- **previous_stock** (numeric)
- **new_stock** (numeric)
- **delta** (numeric)
- **reason** (text)
- **adjusted_by** (uuid) - FK -> profiles.id
- **adjusted_at** (timestamp with time zone)
- **source** (text) - DEFAULT 'admin_stock_tool'

### master_categories

_Categorías de productos. (~6 rows)_

- **id** (uuid) - PK
- **nombre** (text)
- **active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### master_proveedores

_Base de proveedores. (~47 rows)_

- **id** (uuid) - PK
- **nombre_fantasia** (text)
- **razon_social** (text)
- **cuit** (text) - UNIQUE
- **email** (text)
- **contacto_nombre** (text)
- **contacto_telefono** (text)
- **banco** (text)
- **cbu_alias** (text)
- **active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **notas** (text)
- **cbu** (text)
- **alias** (text)
- **category** (text)

### master_recipes

_Recetas y fórmulas de conversión para conciliación (Venta -> Stock). (~93 rows)_

- **id** (uuid) - PK
- **name** (text)
- **external_id** (text) - UNIQUE
- **ingredients** (jsonb)
- **created_at** (timestamp with time zone)
- **precio_venta** (numeric) - DEFAULT 0 — Precio de venta al público (incluye IVA)
- **active** (boolean) - DEFAULT true

### master_sku

_Catálogo de productos (SKUs). (~58 rows)_

- **id** (uuid) - PK
- **nombre** (text)
- **categoria_id** (uuid) - FK -> master_categories.id
- **proveedor_default_id** (uuid) - FK -> master_proveedores.id
- **pack_qty** (numeric) - DEFAULT 1
- **ml_por_unidad** (numeric)
- **costo** (numeric) - DEFAULT 0
- **costo_pack** (numeric)
- **external_id** (numeric) - UNIQUE
- **active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **tipo** (text) - DEFAULT 'bar', CHECK: 'bar','limpieza','descartables','otros'

### master_staff_roles

_Roles de personal. (~16 rows)_

- **id** (uuid) - PK
- **name** (text)
- **area** (text) - Área funcional
- **base_rate** (numeric) - DEFAULT 0 — Tarifa base por noche
- **active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)

### members

_Miembros del club. (~2546 rows)_

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **nombre** (text)
- **nacimiento** (text)
- **instagram** (text)
- **telefono** (text)
- **email** (text)
- **status** (text) - DEFAULT 'pendiente'
- **member_id** (text)
- **access_password_hash** (text)
- **access_password** (text)

### menu_categories

_Categorías del menú. (~4 rows)_

- **id** (uuid) - PK
- **name** (text)
- **slug** (text) - UNIQUE
- **display_order** (integer) - DEFAULT 0
- **is_active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)

### menu_items

_Items del menú (carta). (~16 rows)_

- **id** (uuid) - PK
- **name** (text)
- **price** (numeric)
- **category** (text)
- **is_active** (boolean) - DEFAULT true
- **category_id** (uuid) - FK -> menu_categories.id

### payment_categories

_Categorías de métodos de pago. (~5 rows)_

- **id** (bigint) - PK (identity)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **tipo_comprobante** (text)
- **active** (boolean) - DEFAULT true
- **tax_rate** (numeric) - DEFAULT 0

### payment_commission_config

_Configuración de comisiones por método de pago digital. (~4 rows)_

- **id** (uuid) - PK
- **payment_method** (text) - UNIQUE — Método de pago (MercadoPago, tarjeta, etc.)
- **commission_rate** (numeric) - DEFAULT 0 — Tasa de comisión como decimal
- **iva_on_commission** (numeric) - DEFAULT 0.21 — IVA sobre la comisión
- **settlement_delay_days** (integer) - DEFAULT 0 — Días de demora en la liquidación
- **is_active** (boolean) - DEFAULT true
- **notes** (text)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### payment_methods

_Métodos de pago. (~6 rows)_

- **id** (bigint) - PK (identity)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **name** (text)
- **category_id** (bigint) - FK -> payment_categories.id
- **active** (boolean) - DEFAULT true
- **sort_order** (integer) - DEFAULT 100
- **notes** (text)

### payment_reconciliation

_Reconciliación de pagos por método y terminal. Flujo: pending → matched/mismatch → resolved/expired._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **payment_method** (text) - CHECK: 'efectivo','mercadopago','tarjeta','digital'
- **system_amount** (numeric) - DEFAULT 0 — Monto reportado por sistema
- **declared_amount** (numeric) - DEFAULT 0 — Monto declarado
- **settled_amount** (numeric) - Monto liquidado (procesador)
- **diff_amount** (numeric) - Diferencia calculada
- **status** (text) - DEFAULT 'pending', CHECK: 'pending','matched','mismatch','resolved','expired'
- **resolved_by** (uuid)
- **resolved_at** (timestamp with time zone)
- **resolution_notes** (text)
- **created_at** (timestamp with time zone)

### pos_terminals

_Terminales de Punto de Venta. (~3 rows)_

- **id** (uuid) - PK
- **friendly_name** (text)
- **is_active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)
- **provider** (text) - DEFAULT 'MERCADO PAGO'
- **external_id** (text)
- **gbol_alias** (text) - Nombre de la caja en GBOL POS (ej: CAJA 1) para mapeo automático

### pos_terminals_alias

_Mapeo de nombres de terminales externos a IDs internos._

- **id** (uuid) - PK
- **alias** (text) - UNIQUE
- **terminal_id** (uuid) - FK -> pos_terminals.id
- **created_at** (timestamp with time zone)

### profile_functions

_Funciones asignadas a perfiles._

- **id** (uuid) - PK
- **profile_id** (uuid) - FK -> profiles.id
- **function_id** (uuid) - FK -> staff_functions.id
- **active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)

### profiles

_Perfiles de usuario (vinculados a auth). (~4 rows)_

- **id** (uuid) - FK -> auth.users.id, PK
- **full_name** (text)
- **role** (text) - CHECK: 'admin','contable','operativo','logistico','encargado_barra','encargado_caja','encargado_limpieza','encargado_seguridad','staff_barra','staff_caja','staff_seguridad','staff_operativo'
- **active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)

### qr_batches

_Lotes de códigos QR (entradas/invitaciones). (~19 rows)_

- **id** (uuid) - PK
- **name** (text)
- **description** (text)
- **financial_type** (text) - DEFAULT 'INVITACION'
- **market_source** (text)
- **unit_price** (numeric) - DEFAULT 0
- **created_by** (uuid) - FK -> profiles.id
- **created_at** (timestamp with time zone)
- **event_id** (uuid) - FK -> events.id

### qr_checkins

_Logs de accesos._

- **id** (uuid) - PK
- **code_id** (uuid) - FK -> qr_codes.id
- **operator_id** (uuid) - FK -> profiles.id
- **success** (boolean)
- **message** (text)
- **created_at** (timestamp with time zone)

### qr_codes

_Códigos individuales. (~9426 rows)_

- **id** (uuid) - PK
- **batch_id** (uuid) - FK -> qr_batches.id
- **code** (text) - UNIQUE
- **status** (text) - DEFAULT 'PENDIENTE', CHECK: 'PENDIENTE','ACREDITADO','ANULADO'
- **accredited_at** (timestamp with time zone)
- **accredited_by** (uuid) - FK -> profiles.id
- **work_day_id** (uuid) - FK -> work_days.id
- **created_at** (timestamp with time zone)
- **external_id** (text)
- **member_id** (uuid) - FK -> members.id
- **valid_until** (timestamp with time zone)

### recipe_code_mappings

_Mapeo de códigos POS a recetas._

- **id** (uuid) - PK
- **pos_code** (text) - UNIQUE
- **recipe_id** (uuid) - FK -> master_recipes.id
- **notes** (text)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **active** (boolean) - DEFAULT true

### replenishment_items

_Items en solicitudes de reposición. (~13 rows)_

- **id** (uuid) - PK
- **request_id** (uuid) - FK -> replenishment_requests.id
- **sku_id** (uuid) - FK -> master_sku.id
- **requested_packs** (numeric) - DEFAULT 0
- **is_deleted** (boolean) - DEFAULT false
- **created_at** (timestamp with time zone)
- **supplier_order_id** (uuid) - FK -> replenishment_supplier_orders.id
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **status** (text) - DEFAULT 'pending', CHECK: 'pending','assigned','no_stock','backorder','cancelled','received'
- **adjust_packs** (numeric) - DEFAULT 0
- **adjust_reason** (text)
- **adjust_responsible_id** (uuid) - FK -> profiles.id
- **pack_cost_est** (numeric)
- **line_total_est** (numeric)
- **pre_approval_status** (text) - DEFAULT 'pending' — Estado: pending | pre_approved | pre_rejected
- **pre_approved_by** (uuid) - FK -> profiles.id
- **pre_approved_at** (timestamp with time zone)
- **pre_rejection_reason** (text)

### replenishment_receipt_items

_Items recibidos + conteo de verificación._

- **id** (uuid) - PK
- **receipt_id** (uuid) - FK -> replenishment_receipts.id
- **sku_id** (uuid) - FK -> master_sku.id
- **expected_units** (numeric) - DEFAULT 0
- **received_units** (numeric) - DEFAULT 0
- **diff_units** (numeric) - GENERATED: (received_units - expected_units)
- **created_at** (timestamp with time zone)
- **counted_qty** (numeric) - Cantidad contada físicamente
- **counted_by** (uuid) - FK -> profiles.id — Quién realizó el conteo
- **counted_at** (timestamp with time zone)
- **count_notes** (text)
- **count_status** (text) - DEFAULT 'pending', CHECK: 'pending','counted','discrepancy'

### replenishment_receipts

_Recepciones de mercadería._

- **id** (uuid) - PK
- **supplier_order_id** (uuid) - FK -> replenishment_supplier_orders.id
- **received_by** (uuid) - FK -> profiles.id, DEFAULT auth.uid()
- **received_at** (timestamp with time zone)
- **notes** (text)
- **created_at** (timestamp with time zone)

### replenishment_requests

_Solicitudes de reposición (pedidos internos). (~11 rows)_

- **id** (uuid) - PK
- **user_id** (uuid) - FK -> profiles.id
- **status** (text) - DEFAULT 'pending'
- **operational_date** (date)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **target_work_day_id** (uuid) - FK -> work_days.id — Jornada destino

### replenishment_supplier_orders

_Órdenes de compra a proveedores. (~5 rows)_

- **id** (uuid) - PK
- **request_id** (uuid) - FK -> replenishment_requests.id
- **supplier_id** (uuid) - FK -> master_proveedores.id
- **status** (text) - CHECK: 'draft','ready_for_approval','approved','rejected','ordered','in_transit','arrived','received','cancelled'
- **final_cost** (numeric)
- **eta_date** (date)
- **approved_by** (uuid) - FK -> profiles.id
- **approved_at** (timestamp with time zone)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)
- **rejection_reason** (text)
- **invoice_number** (text)
- **invoice_date** (date)
- **invoice_amount** (numeric)
- **invoice_received_by** (uuid) - FK -> profiles.id
- **invoice_received_at** (timestamp with time zone)
- **notes** (text)

### replenishment_tracking

_Seguimiento de órdenes de compra. (RLS: OFF)_

- **id** (uuid) - PK
- **order_id** (uuid) - FK -> replenishment_supplier_orders.id
- **status** (text) - CHECK: 'ordered','in_transit','arrived','delivered'
- **notes** (text)
- **created_by** (uuid) - FK -> profiles.id
- **created_at** (timestamp with time zone)

### revenue_details

_Detalle de reportes de recaudación. (~148 rows)_

- **id** (uuid) - PK
- **report_id** (uuid) - FK -> revenue_reports.id
- **recipe_id** (uuid) - FK -> master_recipes.id
- **recipe_name** (text)
- **external_code** (text)
- **q_paga** (numeric) - DEFAULT 0 — Cantidad vendida (pagada)
- **q_sin_cargo** (numeric) - DEFAULT 0 — Cantidad cortesía
- **q_vip** (numeric) - DEFAULT 0 — Cantidad tarjeta VIP
- **total_quantity** (numeric) - DEFAULT 0
- **total_amount** (numeric) - DEFAULT 0 — Total revenue en $ para esta receta
- **created_at** (timestamp with time zone)

### revenue_reports

_Reportes de recaudación. (~5 rows)_

- **id** (uuid) - PK
- **operational_date** (date) - UNIQUE
- **file_name** (text)
- **total_revenue** (numeric) - DEFAULT 0
- **notes** (text)
- **created_at** (timestamp with time zone)
- **created_by** (uuid) - FK -> auth.users.id
- **updated_at** (timestamp with time zone)
- **updated_by** (uuid) - FK -> auth.users.id
- **work_day_id** (uuid) - FK -> work_days.id — Jornada asociada

### site_config

_Configuración del sitio y variables globales. (~10 rows)_

- **id** (uuid) - PK
- **key** (text) - UNIQUE
- **url** (text)
- **is_active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)
- **name** (text) - Display name editable
- **description** (text) - Descripción o notas opcionales
- **sort_order** (integer) - DEFAULT 0 — Orden de display

### sku_change_requests

_Solicitudes de cambio en SKUs._

- **id** (uuid) - PK
- **created_at** (timestamp with time zone)
- **status** (text) - DEFAULT 'pending', CHECK: 'pending','approved','rejected'
- **request_type** (text) - CHECK: 'create','update','deactivate'
- **sku_id** (uuid) - FK -> master_sku.id
- **sku_nombre** (text)
- **justification** (text)
- **payload** (jsonb) - Datos propuestos en formato JSON
- **requested_by** (uuid) - FK -> profiles.id
- **approved_by** (uuid) - FK -> profiles.id
- **approved_at** (timestamp with time zone)

### sku_price_history

_Historial de precios de costos de SKUs. Alimentado por trigger `trg_sku_cost_price_history`. (~53 rows)_

- **id** (uuid) - PK
- **sku_id** (uuid) - FK -> master_sku.id
- **cost_price** (numeric) - Precio de costo vigente
- **effective_from** (timestamp with time zone) - DEFAULT now() — Inicio vigencia
- **effective_to** (timestamp with time zone) - Fin vigencia (NULL = vigente)
- **changed_by** (uuid) - FK -> auth.users.id
- **created_at** (timestamp with time zone)

### staff_accruals

_Devenciones de nómina: convierte asistencia (staff_convocations) en deuda salarial por jornada._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **user_id** (uuid) - FK -> profiles.id
- **role_id** (uuid) - FK -> master_staff_roles.id
- **base_amount** (numeric) - DEFAULT 0 — Tarifa del rol (snapshot de base_rate)
- **adjustments** (numeric) - DEFAULT 0 — Ajuste manual (+/-)
- **total_amount** (numeric) - GENERATED: base_amount + adjustments
- **status** (text) - DEFAULT 'accrued', CHECK: 'accrued','exported','paid','cancelled'
- **notes** (text)
- **exported_payment_id** (uuid) - FK -> finance_payments.id
- **created_at** (timestamp with time zone)
- **created_by** (uuid) - FK -> auth.users.id
- **updated_at** (timestamp with time zone)
- **UNIQUE**: (work_day_id, user_id)

### staff_convocations

_Convocatorias de personal._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **user_id** (uuid) - FK -> profiles.id
- **role_id** (uuid) - FK -> master_staff_roles.id
- **status** (text) - DEFAULT 'pending'
- **assigned_location** (text)
- **convocated_by** (uuid) - FK -> profiles.id
- **confirmed_at** (timestamp with time zone)
- **created_at** (timestamp with time zone)
- **updated_at** (timestamp with time zone)

### staff_functions

_Catálogo de funciones de staff. (~9 rows)_

- **id** (uuid) - PK
- **slug** (text) - UNIQUE
- **name** (text)
- **active** (boolean) - DEFAULT true
- **created_at** (timestamp with time zone)

### work_day_staff_planning

_Planificación de personal por día._

- **id** (uuid) - PK
- **work_day_id** (uuid) - FK -> work_days.id
- **role_id** (uuid) - FK -> master_staff_roles.id
- **quantity** (integer) - DEFAULT 1
- **approved_budget** (numeric) - DEFAULT 0
- **created_at** (timestamp with time zone)

### work_days

_Días operativos (jornadas). Lifecycle: DRAFT → PLANNED → ACTIVE → CLOSED | CANCELLED. (~9 rows)_

- **id** (uuid) - PK
- **work_date** (date) - UNIQUE
- **status** (text) - CHECK: 'DRAFT','PLANNED','ACTIVE','CLOSED','CANCELLED'
- **opened_by** (uuid) - FK -> profiles.id
- **closed_by** (uuid) - FK -> profiles.id
- **opened_at** (timestamp with time zone)
- **closed_at** (timestamp with time zone)
- **created_at** (timestamp with time zone)
- **notes** (text)
- **attendance** (integer) - DEFAULT 0 — Asistencia
- **event_id** (uuid) - FK -> events.id ON DELETE SET NULL
- **event_name** (text) - Cache desnormalizado del nombre
- **countdown_active** (boolean) - DEFAULT false — Toggle countdown web
- **health_score** (integer) - Score 0-100 calculado por calculate_health_score()
- **net_result** (numeric) - Resultado neto (ingresos - egresos)
- **cancelled_at** (timestamp with time zone)
- **cancelled_reason** (text)

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
- **external_ticket_id** (text) - UNIQUE
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

## Tabla de Plantillas

### work_day_templates

_Plantillas reutilizables para jornadas: configuración de staff, costos asociados y promedios históricos._

- **id** (uuid) - PK
- **name** (text) - NOT NULL
- **staff_config** (jsonb) - DEFAULT '{}' — Configuración de dotación por cargo
- **cost_ids** (uuid[]) - DEFAULT '{}' — IDs de cost_definitions asociados
- **avg_revenue** (numeric) - DEFAULT 0 — Promedio de ingresos
- **avg_attendance** (integer) - DEFAULT 0 — Promedio de asistencia
- **usage_count** (integer) - DEFAULT 0 — Veces utilizada
- **created_at** (timestamptz)

## Vistas

### v_admin_stock

- **sku_id**, **nombre**, **external_id**, **categoria_id**, **categoria_nombre**, **stock_actual**, **ideal_500**, **ideal_900**

### vw_daily_sales_v2

_Resumen de ventas diarias (Versión 2 simplificada)._

- **work_day_id**, **work_date**, **status**, **cash_system**, **cash_declared**, **cash_difference**, **qr_system**, **bar_sales_system**, **total_retiros**, **cant_retiros**, **total_income**, **total_declared**, **total_difference**

### vw_recipe_profitability

_Análisis de rentabilidad por receta (Costo vs. Precio Venta)._

- **id**, **name**, **external_id**, **precio_venta**, **costo_producto**, **base_imponible**, **iva_debito**, **margen_bruto**, **margen_bruto_pct**, **roi_pct**, **flag_rentabilidad**

### vw_reconcile_afip_gbol

_Conciliación diaria entre AFIP y Gbol (Staging)._

- **noche**, **afip_total**, **gbol_total**, **difference**, **facturas_count**, **items_count**

### vw_sku_ideal_dynamic

_Cálculo dinámico de stock ideal basado en consumo histórico (4 semanas)._

- **id**, **nombre**, **tipo**, **costo**, **active**, **consumo_4w**, **fechas_con_consumo**, **asistentes_4w**, **consumo_por_persona**, **ideal_500_calc**, **ideal_800_calc**, **ideal_500_static**, **ideal_900_static**

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

### vw_night_snapshot

_Snapshot completo por noche: ingresos, caja, stock, staff y health score. Alimenta el tab Histórico y el dashboard de reporte._

**Fuentes**: `work_days`, `cash_closings`, `bar_sessions`, `consumption_reports`, `staff_accruals`, `vw_workday_pnl`

- **work_date** (date)
- **event_name** (text)
- **status** (text)
- **total_income** (numeric)
- **gbol_efectivo** (numeric) - Efectivo bruto GBOL
- **gbol_efectivo_neto** (numeric) - Efectivo neto GBOL
- **total_retiros** (numeric) - Total retiros de caja
- **cant_retiros** (integer) - Cantidad de retiros
- **cash_declared** (numeric) - Caja declarada
- **conciliacion_diff** (numeric) - Diferencia de conciliación
- **stock_loss** (numeric) - Pérdida de stock
- **staff_cost** (numeric) - Costo de personal
- **net_result** (numeric) - Resultado neto
- **health_score** (integer) - Score de salud 0-100

### vw_fiscal_summary

_Resumen fiscal por noche: totales AFIP/GBOL para mini-cards en tab Evento._

**Fuentes**: `import_gbol_facturacion`, `work_days`

- **noche** (date) - Fecha de la jornada
- **total_tickets** (integer)
- **tickets_blanco** (integer)
- **tickets_negro** (integer)
- **total_bruto** (numeric)
- **total_blanco** (numeric)
- **total_negro** (numeric)
- **total_efectivo** (numeric)
- **total_digital** (numeric)
- **total_tarjetas** (numeric)
- **total_mercadopago** (numeric)
- **total_iva** (numeric)
- **total_base_imponible** (numeric)
- **pct_blanqueado** (numeric)
- **total_cajas** (integer)
- **total_retiros** (numeric)
- **cant_retiros** (integer)
- **efectivo_neto** (numeric)

### vw_bar_audit_variance

_Varianza de auditoría de barra: diferencia entre stock teórico y físico por producto por sesión._

**Fuentes**: `bar_sessions`, `bar_stock_snapshots`, `bar_session_sales`, `master_recipes`, `master_sku`, `profiles`

- **session_id** (uuid)
- **work_day_id** (uuid)
- **work_date** (date)
- **location** (text)
- **sku_id** (uuid)
- **sku_nombre** (text)
- **categoria** (text)
- **stock_apertura** (numeric)
- **stock_cierre** (numeric)
- **stock_efectivo** (numeric)
- **unidades_repuestas** (numeric)
- **consumo_real** (numeric)
- **consumo_sistema** (numeric)
- **diferencia** (numeric)
- **costo_real** (numeric)
- **costo_sistema** (numeric)
- **costo_diferencia** (numeric)
- **varianza_pct** (numeric)
- **clasificacion** (text)
- **session_status** (text)
- **opened_by_name** (text)
- **closed_by_name** (text)
- **opened_at** (timestamp)
- **closed_at** (timestamp)

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

### vw_consumo_teorico

_Consumo teórico por SKU por noche, calculado desde ventas × recetas._

- **noche** (date)
- **sku_id** (uuid)
- **sku_nombre** (text)
- **cantidad_consumida** (numeric)
- **costo_consumido** (numeric)
- **tickets_origen** (bigint)

### vw_stock_audit_nightly

_Resumen nocturno de auditoría de stock: alertas de pérdida, costos reales vs sistema._

- **work_date** (date)
- **total_skus** (bigint)
- **total_sessions** (bigint)
- **alertas_perdida** (bigint)
- **dentro_rango** (bigint)
- **errores_registro** (bigint)
- **total_costo_real** (numeric)
- **total_costo_sistema** (numeric)
- **total_costo_diferencia** (numeric)
- **varianza_pct_global** (numeric)

### vw_financial_week_live

_Resumen financiero semanal en vivo (sin cerrar)._

- **year_number**, **week_number**, **week_start**, **week_end**, **workdays_count**, **total_attendance**, **income_cash**, **income_qr**, **income_bar**, **total_income**, **expense_staff**, **expense_stock**, **expense_extras**, **total_expense**, **net_result**, **avg_margin_pct**

### vw_finance_weekly

_Resumen financiero semanal cerrado._

- **year_number**, **week_number**, **income_gross**, **expenses_total**, **operating_profit**, **margin_pct**, **tax_vat_payable**, **workdays_count**, **total_attendance**

### vw_pnl_monthly_v2

_P&L mensual (Versión 2 con desglose de ingresos/egresos)._

- **year_number**, **month_number**, **workdays_count**, **total_attendance**, **avg_attendance**, **income_cash**, **income_qr**, **income_bar**, **total_income**, **expense_staff**, **expense_stock**, **expense_extras**, **total_expense**, **net_result**, **avg_margin_pct**

### vw_workday_cash_balance

_Balance de caja completo por jornada: declarado vs sistema, retiros, depósitos, neto._

- **work_day_id**, **work_date**, **total_declared_cash**, **total_declared_zoco**, **total_system_cash**, **total_system_zoco**, **total_declared**, **total_system**, **total_difference**, **total_withdrawals**, **total_deposits**, **net_cash_flow**, **terminal_count**, **withdrawal_count**, **deposit_count**, **closing_status**, **closing_closed_at**, **closing_notes**

### vw_workday_commissions

_Comisiones digitales por jornada: MercadoPago, tarjetas, neto digital._

- **work_date**, **total_mp_bruto**, **total_tarjetas_bruto**, **total_digital_bruto**, **comision_mp**, **comision_tarjetas**, **total_comisiones**, **neto_digital**

### vw_workday_stock_variance

_Varianza de stock consolidada por jornada (todas las sesiones de barra)._

- **work_day_id**, **work_date**, **sku_id**, **sku_nombre**, **categoria**, **stock_apertura_total**, **reposiciones_total**, **stock_cierre_real**, **consumo_real_total**, **consumo_teorico_total**, **stock_esperado**, **varianza_unidades**, **varianza_pct**, **costo_real_total**, **costo_teorico_total**, **costo_varianza**, **diferencia_consumo**, **clasificacion**, **session_count**

### vw_reconciliation_status

_Estado de reconciliación de pagos por jornada._

- **work_day_id**, **work_date**, **total_items**, **matched_count**, **mismatch_count**, **pending_count**, **total_diff**, **overall_status**

## Políticas RLS (Row Level Security)

**Estado:** RLS habilitado en todas las tablas públicas. 10 migraciones de refinamiento aplicadas (2026-02-22).  
**Helper functions:** `is_admin()`, `has_role(role_text)`, `get_my_role()` — definidas en `public`.

### Tablas con Políticas Role-Based (36)

| Tabla                                                  | Write → Roles                       | Read → Roles               |
| ------------------------------------------------------ | ----------------------------------- | -------------------------- |
| `profiles`                                             | admin                               | own user (S), admin (CRUD) |
| `work_days`                                            | admin+operativo                     | multi-rol                  |
| `work_day_templates`                                   | admin+gerencia                      | —                          |
| `master_sku` / `master_categories`                     | admin (`is_admin()`)                | authenticated              |
| `master_proveedores`                                   | admin (`is_admin()`)                | authenticated              |
| `cost_definitions`                                     | admin                               | admin+contable             |
| `audit_config`                                         | admin+contable                      | authenticated              |
| `site_config`                                          | admin+operativo                     | public                     |
| `inventory_stock` / `inventory_ideal`                  | admin+contable                      | authenticated              |
| `inventory_movements`                                  | enc_barra+admin+logística+operativo | authenticated              |
| `inventory_stock_adjustments`                          | admin                               | admin                      |
| `staff_accruals`                                       | admin+contable                      | own user                   |
| `staff_functions` / `profile_functions`                | admin+operativo                     | authenticated/own          |
| `sku_change_requests`                                  | own user (I), admin (U)             | own+admin                  |
| `payment_categories` / `payment_methods`               | admin                               | authenticated              |
| `replenishment_items` / `_receipts` / `_receipt_items` | operativo+logístico+encargado       | authenticated              |
| `replenishment_supplier_orders`                        | operativo+logístico+admin+contable  | authenticated              |
| `import_gbol_withdrawals`                              | —                                   | admin+superadmin           |
| `cash_closings`                                        | enc_caja+admin                      | enc_caja+admin+contable    |
| `closing_terminals`                                    | enc_caja+admin                      | enc_caja+admin+contable    |
| `cash_movements`                                       | enc_caja+admin                      | enc_caja+admin+contable    |
| `finance_payments`                                     | admin                               | admin+contable             |
| `bar_sessions`                                         | enc_barra+admin                     | enc_barra+admin+contable   |
| `bar_stock_snapshots`                                  | enc_barra+admin (INSERT only)       | enc_barra+admin+contable   |
| `bar_session_sales`                                    | enc_barra+admin                     | enc_barra+admin+contable   |
| `master_recipes`                                       | admin (`is_admin()`)                | authenticated              |
| `replenishment_requests`                               | operativo+logístico+admin+contable  | authenticated              |
| `events`                                               | admin+operativo                     | public                     |
| `master_staff_roles`                                   | admin                               | authenticated              |
| `pos_terminals`                                        | admin                               | authenticated              |
| `staff_convocations`                                   | admin+operativo+encargados          | authenticated              |
| `work_day_staff_planning`                              | admin+operativo+encargados          | authenticated              |
| `qr_batches` / `qr_codes`                              | admin+operativo                     | authenticated              |
| `qr_checkins`                                          | admin+operativo+staff_guardia       | authenticated              |
| `import_gbol_comandas` / `import_gbol_facturacion`     | admin                               | admin+contable             |

### Tablas con Acceso Público/Anon (by design)

| Tabla                            | Tipo                           | Justificación                  |
| -------------------------------- | ------------------------------ | ------------------------------ |
| `members`                        | Anon INSERT (status=pendiente) | Formulario público de registro |
| `menu_categories` / `menu_items` | Public read                    | Menú público del local         |
| `site_config`                    | Anon+auth read                 | Configuración pública          |
| `events`                         | Public read                    | Eventos del local              |

### Tablas P2 (genéricas, bajo riesgo)

`recipe_code_mappings`, `import_logs`, `replenishment_tracking`, `finance_weekly_closings`, `finance_opening_cost_defs`, `finance_payment_rules`, `consumption_reports`/`_details`, `accounts_payable`, `revenue_reports`/`_details`.

---

## Mapa Módulo ↔ Tabla

Dependencias de base de datos por módulo JavaScript, extraídas del código fuente (334+ llamadas Supabase).

**Leyenda**: **R** = Read (`.select`), **W** = Write (`.insert` / `.update` / `.upsert` / `.delete`)

### 🔵 Admin (16 módulos)

| Módulo JS                  | Pantalla            | Tablas R                                                                                                                                                                                                                                                | Tablas W                                                                                                                                                                                                    | Vistas                                                                                                                                                                    |
| :------------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `admin-index`              | Dashboard           | `profiles`, `qr_codes`, `work_days`                                                                                                                                                                                                                     | —                                                                                                                                                                                                           | —                                                                                                                                                                         |
| `admin-workdays`           | Gestión Jornadas    | `bar_sessions`, `cash_closings`, `closing_terminals`, `cost_definitions`, `events`, `master_staff_roles`, `pos_terminals`, `profiles`, `qr_codes`, `staff_accruals`, `staff_convocations`, `work_day_staff_planning`, `work_day_templates`, `work_days` | `cash_closings`, `cost_definitions`, `events`, `finance_payments`, `qr_batches`, `qr_codes`, `staff_accruals`, `staff_convocations`, `work_day_staff_planning`, `work_day_templates`, `work_days`           | `vw_bar_audit_variance`, `vw_bar_efficiency`, `vw_consumo_teorico`, `vw_daily_sales`, `vw_fiscal_summary`, `vw_night_snapshot`, `vw_workday_benchmarks`, `vw_workday_pnl` |
| `admin-solicitudes`        | Solicitudes         | `consumption_details`, `consumption_reports`, `master_proveedores`, `master_sku`, `replenishment_items`, `replenishment_requests`, `replenishment_supplier_orders`, `work_days`                                                                         | `finance_payments`, `replenishment_items`, `replenishment_supplier_orders`                                                                                                                                  | `vw_stock_global`                                                                                                                                                         |
| `admin-central-stock`      | Central Stock       | `consumption_details`, `consumption_reports`, `master_categories`, `master_proveedores`, `master_recipes`, `master_sku`, `recipe_code_mappings`, `revenue_details`, `revenue_reports`, `sku_change_requests`, `work_days`                               | `consumption_details`, `consumption_reports`, `inventory_movements`, `inventory_stock`, `master_recipes`, `master_sku`, `recipe_code_mappings`, `revenue_details`, `revenue_reports`, `sku_change_requests` | `vw_recipe_profitability`, `vw_stock_global`                                                                                                                              |
| `admin-reportes`           | Reportes            | —                                                                                                                                                                                                                                                       | —                                                                                                                                                                                                           | `vw_bar_efficiency`, `vw_daily_sales_v2`, `vw_pnl_monthly_v2`, `vw_staff_performance`, `vw_tax_monthly`                                                                   |
| `admin-semanal`            | Balance Semanal     | `finance_weekly_closings`                                                                                                                                                                                                                               | `finance_weekly_closings`                                                                                                                                                                                   | `vw_financial_week_live`                                                                                                                                                  |
| `admin-pagos`              | Pagos               | `cost_definitions`, `finance_payments`, `master_proveedores`, `master_staff_roles`, `payment_categories`, `payment_methods`                                                                                                                             | `cost_definitions`, `finance_payments`                                                                                                                                                                      | —                                                                                                                                                                         |
| `admin-config`             | Configuración       | `cost_config`, `master_sku`                                                                                                                                                                                                                             | `cost_config`, `master_sku`                                                                                                                                                                                 | —                                                                                                                                                                         |
| `admin-master-proveedores` | Maestro Proveedores | `master_categories`, `master_proveedores`                                                                                                                                                                                                               | `master_proveedores`                                                                                                                                                                                        | —                                                                                                                                                                         |
| `admin-master-categorias`  | Maestro Categorías  | `master_categories`                                                                                                                                                                                                                                     | `master_categories`                                                                                                                                                                                         | —                                                                                                                                                                         |
| `admin-master-tarifario`   | Tarifario           | `master_staff_roles`                                                                                                                                                                                                                                    | `master_staff_roles`                                                                                                                                                                                        | —                                                                                                                                                                         |
| `admin-master-nomina`      | Nómina              | `master_staff_roles`, `profiles`                                                                                                                                                                                                                        | `profiles`                                                                                                                                                                                                  | —                                                                                                                                                                         |
| `admin-master-pos`         | Terminales POS      | `pos_terminals`                                                                                                                                                                                                                                         | `pos_terminals`                                                                                                                                                                                             | —                                                                                                                                                                         |
| `qr-dashboard`             | QR Dashboard        | `qr_batches`, `qr_checkins`, `qr_codes`                                                                                                                                                                                                                 | —                                                                                                                                                                                                           | —                                                                                                                                                                         |
| `qr-generator`             | QR Generador        | —                                                                                                                                                                                                                                                       | `qr_batches`, `qr_codes`                                                                                                                                                                                    | —                                                                                                                                                                         |
| `qr-monitor`               | QR Monitor          | `qr_batches`, `qr_codes`                                                                                                                                                                                                                                | —                                                                                                                                                                                                           | —                                                                                                                                                                         |

### 🟢 Operativo (8 módulos)

| Módulo JS                      | Pantalla        | Tablas R                                                                                               | Tablas W                                                                         | Vistas            |
| :----------------------------- | :-------------- | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- | :---------------- |
| `operativo-index`              | Dashboard       | `qr_codes`                                                                                             | —                                                                                | —                 |
| `operativo-workday`            | Jornada del día | `replenishment_items`, `replenishment_requests`, `site_config`, `staff_convocations`, `work_days`      | `site_config`                                                                    | —                 |
| `operativo-solicitudes`        | Solicitudes     | `master_proveedores`, `replenishment_items`, `replenishment_requests`, `replenishment_supplier_orders` | `replenishment_items`, `replenishment_requests`, `replenishment_supplier_orders` | `vw_stock_global` |
| `operativo-stock`              | Stock Real      | —                                                                                                      | —                                                                                | `vw_stock_global` |
| `operativo-analisis`           | Análisis        | `consumption_details`, `consumption_reports`, `master_sku`                                             | `consumption_details`, `consumption_reports`                                     | —                 |
| `operativo-master-sku`         | SKUs            | `master_proveedores`, `master_sku`, `sku_change_requests`                                              | `sku_change_requests`                                                            | —                 |
| `operativo-master-proveedores` | Proveedores     | `master_proveedores`                                                                                   | `master_proveedores`                                                             | —                 |
| `scanner`                      | Scanner QR      | `members`, `profiles`, `qr_codes`, `work_days`                                                         | `qr_checkins`, `qr_codes`                                                        | —                 |
| `cms-members`                  | Miembros        | `members`                                                                                              | `members`                                                                        | —                 |

### 🟠 Encargados (7 módulos)

| Módulo JS                  | Pantalla           | Tablas R                                                                                                         | Tablas W                                                            | Vistas                         |
| :------------------------- | :----------------- | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ | :----------------------------- |
| `encargado-barra-index`    | Dashboard Barra    | `profiles`                                                                                                       | —                                                                   | `vw_supplier_orders_encargado` |
| `encargado-barra-noche`    | Cierre Noche Barra | `bar_sessions`, `bar_stock_snapshots`, `master_sku`                                                              | `bar_sessions`, `bar_stock_snapshots`                               | —                              |
| `encargado-barra-personal` | Personal Barra     | `profiles`, `staff_convocations`, `work_day_staff_planning`, `work_days`                                         | `profiles`, `staff_convocations`                                    | —                              |
| `encargado-caja-index`     | Dashboard Caja     | `profiles`, `work_days`                                                                                          | —                                                                   | —                              |
| `encargado-caja-noche`     | Cierre Noche Caja  | `bar_sessions`, `cash_closings`, `cash_movements`, `closing_terminals`, `pos_terminals`, `profiles`, `work_days` | `cash_closings`, `cash_movements`, `closing_terminals`, `work_days` | —                              |
| `encargado-caja-personal`  | Personal Caja      | `profiles`, `staff_convocations`, `work_day_staff_planning`, `work_days`                                         | `profiles`, `staff_convocations`                                    | —                              |
| `encargado-recepcion`      | Recepción          | `replenishment_items`                                                                                            | —                                                                   | `vw_supplier_orders_encargado` |

### 📦 Logística (5 módulos)

| Módulo JS                | Pantalla       | Tablas R                                                                               | Tablas W                                                                                                                                               | Vistas            |
| :----------------------- | :------------- | :------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- |
| `logistica-index`        | Dashboard      | `profiles`, `work_days`                                                                | —                                                                                                                                                      | —                 |
| `logistica-stock`        | Stock Depósito | `master_categories`                                                                    | `inventory_movements`, `inventory_stock`, `inventory_stock_adjustments`                                                                                | `vw_stock_global` |
| `logistica-distribucion` | Distribución   | `replenishment_items`, `replenishment_requests`                                        | `inventory_movements`, `inventory_stock`, `replenishment_items`, `replenishment_requests`                                                              | `vw_stock_global` |
| `logistica-recepcion`    | Recepción      | `inventory_stock`, `master_proveedores`, `master_sku`, `replenishment_supplier_orders` | `finance_payments`, `inventory_movements`, `inventory_stock`, `replenishment_receipt_items`, `replenishment_receipts`, `replenishment_supplier_orders` | —                 |
| `logistica-seguimiento`  | Seguimiento    | `replenishment_supplier_orders`                                                        | `replenishment_supplier_orders`, `replenishment_tracking`                                                                                              | —                 |

### 🟡 Staff (1 módulo)

| Módulo JS          | Pantalla   | Tablas R                                                                            | Tablas W                                  | Vistas |
| :----------------- | :--------- | :---------------------------------------------------------------------------------- | :---------------------------------------- | :----- |
| `staff-caja-index` | Staff Caja | `cash_closings`, `closing_terminals`, `profiles`, `staff_convocations`, `work_days` | `closing_terminals`, `staff_convocations` | —      |

### 🟣 Gerencia (1 módulo)

| Módulo JS         | Pantalla        | Tablas R | Tablas W | Vistas              |
| :---------------- | :-------------- | :------- | :------- | :------------------ |
| `balance-semanal` | Balance Semanal | —        | —        | `vw_finance_weekly` |

## RPCs de Workday & Utility

| RPC                                                          | Retorna | Descripción                                           |
| ------------------------------------------------------------ | ------- | ----------------------------------------------------- |
| `rpc_create_work_day(date, event_id?, event_name?, notes?)`  | void    | Crea jornada en DRAFT                                 |
| `rpc_confirm_work_day(id)`                                   | void    | DRAFT → PLANNED                                       |
| `rpc_revert_work_day(id)`                                    | void    | PLANNED → DRAFT                                       |
| `rpc_open_work_day(id)`                                      | jsonb   | PLANNED → ACTIVE + pre-flight checks                  |
| `rpc_close_work_day(id)`                                     | void    | ACTIVE → CLOSED                                       |
| `calculate_health_score(id)`                                 | integer | Score 0-100 (staff 40, bar 20, requests 20, stock 20) |
| `admin_generate_workday_accruals(id)`                        | jsonb   | Genera devenciones (guard: ACTIVE/CLOSED)             |
| `admin_export_accruals_to_payments(p_user_id, p_from, p_to)` | jsonb   | Exporta devenciones a finance_payments                |
| `rpc_plan_work_day(p_work_date, p_notes?)`                   | uuid    | Shortcut: crea workday saltando DRAFT                 |
| `rpc_preflight_close_workday(p_work_day_id)`                 | jsonb   | Validaciones pre-cierre y resumen financiero          |

### Finance & Payments

| RPC                                                    | Retorna | Descripción                           |
| ------------------------------------------------------ | ------- | ------------------------------------- |
| `admin_approve_payment(p_payment_id, p_approved_by)`   | void    | Aprueba un pago pendiente             |
| `admin_generate_rule_payments()`                       | void    | Genera pagos recurrentes mensuales    |
| `admin_mark_payment_done(p_payment_id, p_amount, ...)` | void    | Marca pago como realizado             |
| `admin_undo_payment_done(p_payment_id)`                | void    | Revierta pago a pendiente             |
| `admin_sync_opening_cost_payments(p_plan_date)`        | void    | Sincroniza costos de apertura a pagos |

### Inventory & Stock

| RPC                                                        | Retorna | Descripción                          |
| ---------------------------------------------------------- | ------- | ------------------------------------ |
| `admin_bulk_set_stock(changes, p_reason?)`                 | jsonb   | Ajuste masivo de stock con auditoría |
| `rpc_receive_supplier_order(p_order_id, p_items, p_notes)` | void    | Recepción de mercadería              |

### Auth & Security

| RPC                                                    | Retorna | Descripción                            |
| ------------------------------------------------------ | ------- | -------------------------------------- |
| `get_my_role()`                                        | text    | Retorna rol del usuario actual         |
| `has_role(r)`                                          | boolean | Verifica si usuario tiene rol 'r'      |
| `is_admin()`                                           | boolean | Wrapper para has_role('admin')         |
| `update_member_password_hash(p_member_id, p_password)` | void    | Actualiza contraseña de miembro (hash) |
| `verify_member_password(p_member_id, p_password)`      | TABLE   | Verifica credenciales de miembro       |

### Utility

| RPC                               | Retorna | Descripción                           |
| --------------------------------- | ------- | ------------------------------------- |
| `fn_normalize_terminal_name(val)` | text    | Normaliza nombres de POS              |
| `fn_parse_arg_number(val)`        | numeric | Parsea inputs numéricos con locale AR |
