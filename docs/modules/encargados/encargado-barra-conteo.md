# Encargado Barra - Conteo de Mercadería

> **Ruta**: `pages/encargados/encargado-barra-conteo.html`
> **Roles**: Encargado Barra, Admin
> **Última Actualización**: 2026-02-07

## Objetivo Operativo

Verificar las cantidades físicas de mercadería recibida contra las cantidades facturadas, registrando discrepancias para control de inventario.

## Flujo Principal (Workflows)

### 1. Listado de Recepciones
1. El sistema carga las últimas 50 recepciones desde `replenishment_receipts` con sus items.
2. Cada recepción muestra: factura/ID, fecha, estado (pendiente/contado/discrepancia), cantidad de items.
3. Se puede filtrar por estado mediante tabs: **Pendientes**, **Contados**, **Con Discrepancia**.

### 2. Conteo de Items
1. Al seleccionar una recepción, se abre un modal con el detalle de factura.
2. Se muestra tabla comparativa: Producto | Facturado | Contado | Estado.
3. El usuario ingresa la cantidad física contada para cada item.
4. El sistema marca visualmente las discrepancias (⚠️ fondo amarillo) en tiempo real.

### 3. Confirmación de Conteo
1. El usuario puede agregar notas de observación (productos dañados, diferencias, etc.).
2. Al confirmar, se actualiza cada `replenishment_receipt_items` con:
   - `counted_qty`, `counted_by`, `counted_at`, `count_notes`
   - `count_status`: `'counted'` o `'discrepancy'`

## Modelo de Datos

| Operación | Tablas / Vistas |
|:----------|:---|
| **Lectura** | `replenishment_receipts`, `replenishment_receipt_items`, `master_sku` (join via `sku_id`) |
| **Escritura** | `replenishment_receipt_items` (`counted_qty`, `counted_by`, `counted_at`, `count_status`, `count_notes`) |

## Dependencias Técnicas

- **Scripts Core**: `core/config.js`, `core/supabase-client.js`, `core/auth.js`, `core/utils.js`, `core/toast.js`
- **Módulos**: `core/navigation.js` (data-go), `encargados/encargado-barra-conteo.js`
- **Lógica Específica**: `setPageState` (loading/empty states), modal de conteo con input validation.
