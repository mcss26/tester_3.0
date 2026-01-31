# Recepción de Mercadería (Logística)

**Ruta**: `pages/logistica/logistica-recepcion.html`
**Roles**: `logistico`

## Objetivo Operativo

Registrar el ingreso de mercadería al depósito cuando llegan pedidos de proveedores. Verificar cantidades contra lo ordenado, registrar discrepancias y actualizar el stock del sistema.

## Flujo Principal

1.  **Órdenes Esperadas**:
    - Lista de `replenishment_supplier_orders` con status `CONFIRMED` o `IN_TRANSIT`.
    - Mostrar proveedor, fecha esperada y total estimado.
    - Filtro por fecha y proveedor.

2.  **Recepción de Orden**:
    - Seleccionar orden a recepcionar.
    - Ver detalle de items esperados (desde `replenishment_items` vinculados).
    - Input para cantidad recibida por cada SKU.
    - Campo para número de factura/remito.
    - Notas de recepción (ej: "2 unidades llegaron dañadas").

3.  **Verificación de Discrepancias**:
    - Comparación visual: Esperado vs. Recibido.
    - Registro automático de diferencias.
    - Opción de recepción parcial si faltan items.

4.  **Confirmación**:
    - Botón "Confirmar Recepción" que:
      a. Crea registro en `replenishment_receipts`.
      b. Crea registros en `replenishment_receipt_items`.
      c. Genera movimientos de tipo `in` en `inventory_movements`.
      d. Actualiza status de la orden a `RECEIVED` o `PARTIAL`.

5.  **Recepción Libre** (sin orden previa):
    - Para compras de urgencia o entregas no programadas.
    - Selección manual de SKUs y cantidades.
    - Requiere seleccionar proveedor.

## Modelo de Datos

**Lectura**:

- `replenishment_supplier_orders`: Órdenes de compra pendientes.
- `vw_supplier_orders_encargado`: Vista resumida de órdenes.
- `master_sku`: Catálogo para recepciones libres.
- `master_proveedores`: Lista de proveedores.

**Escritura**:

- `replenishment_receipts`: Nueva recepción.
- `replenishment_receipt_items`: Detalle de lo recibido.
- `inventory_movements`: Entrada de mercadería.
- `replenishment_supplier_orders`: Actualización de status.

## Reglas de Negocio

1.  Toda recepción debe registrar el ID del usuario que recibe.
2.  El costo unitario se toma de `master_sku.cost_price` o se ingresa manualmente si difiere.
3.  Las recepciones parciales mantienen la orden abierta hasta completarse.
4.  El número de factura es obligatorio para recepciones de órdenes formales.

## Dependencias Técnicas

- `assets/js/modules/logistica/logistica-recepcion.js`: Lógica del módulo.
- `assets/js/core/notify.js`: Notificaciones.
- Triggers en DB para actualizar `inventory_stock` automáticamente.
