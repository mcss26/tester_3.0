# Distribución a Barras (Logística)

**Ruta**: `pages/logistica/logistica-distribucion.html`
**Roles**: `logistico`

## Objetivo Operativo

Gestionar los pedidos de reposición (`replenishment_requests`) que llegan desde las barras u otros puntos de venta. El logístico arma los pedidos, los despacha y registra la salida de mercadería del depósito.

## Flujo Principal

1.  **Lista de Pedidos Pendientes**:
    - Tabla de `replenishment_requests` con status `PENDING` o `APPROVED`.
    - Ordenados por prioridad y fecha deseada.
    - Indicador de urgencia visual.

2.  **Detalle del Pedido**:
    - Lista de items solicitados (`replenishment_items`).
    - Columnas: SKU, Cantidad Solicitada, Cantidad Aprobada, Stock Disponible.
    - Validación visual si hay stock suficiente.

3.  **Armado y Despacho**:
    - Input para cantidad a entregar (puede diferir de lo solicitado).
    - Botón "Despachar" que:
      a. Genera movimiento de tipo `out` en `inventory_movements` por cada item.
      b. Actualiza status del pedido a `DISPATCHED`.
      c. Registra timestamp y responsable.

4.  **Historial de Despachos**:
    - Pedidos ya despachados con fecha, destinatario y totales.

## Modelo de Datos

**Lectura**:

- `replenishment_requests`: Pedidos de reposición.
- `replenishment_items`: Detalle de cada pedido.
- `vw_stock_global`: Validar disponibilidad antes de despachar.
- `profiles`: Nombre del solicitante.

**Escritura**:

- `replenishment_items`: Actualización de `quantity_approved`, `status`.
- `replenishment_requests`: Cambio de status a `DISPATCHED`.
- `inventory_movements`: Salida de mercadería del depósito.

## Reglas de Negocio

1.  No se puede despachar más de lo que hay en stock.
2.  Si se despacha parcialmente, el status queda en `PARTIAL`.
3.  Un pedido `DISPATCHED` no puede modificarse, solo visualizarse.
4.  La barra destino debe confirmarse en otro módulo (operativo).

## Dependencias Técnicas

- `assets/js/modules/logistica/logistica-distribucion.js`: Lógica del módulo.
- `assets/js/core/notify.js`: Notificaciones de éxito/error.
