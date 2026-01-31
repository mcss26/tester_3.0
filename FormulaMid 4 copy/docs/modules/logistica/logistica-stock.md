# Stock Depósito (Logística)

**Ruta**: `pages/logistica/logistica-stock.html`
**Roles**: `logistico`

## Objetivo Operativo

Controlar el inventario físico del depósito central. Permite visualizar el stock actual, realizar conteos físicos, registrar ajustes (mermas, roturas, diferencias) y mantener la trazabilidad de todos los movimientos.

## Flujo Principal

1.  **Vista de Inventario**:
    - Tabla con todos los SKUs activos.
    - Columnas: SKU, Categoría, Stock Actual, Stock Requerido, Diferencia, Estado.
    - Filtros por categoría y buscador por nombre/código.
    - Indicadores visuales: 🔴 Crítico, 🟡 Bajo Mínimo, 🟢 OK.

2.  **Conteo Físico**:
    - Input para registrar cantidad real contada.
    - Cálculo automático de diferencia vs. stock sistema.
    - Registro del movimiento de tipo `adjust` en `inventory_movements`.

3.  **Registro de Ajustes**:
    - Motivos predefinidos: `conteo`, `rotura`, `merma`, `vencimiento`, `otro`.
    - Campo de notas obligatorio para justificar el ajuste.
    - El ajuste genera automáticamente un registro en `inventory_stock_adjustments`.

4.  **Historial de Movimientos**:
    - Timeline de últimos movimientos del SKU seleccionado.
    - Tipo, cantidad, responsable, fecha y notas.

## Modelo de Datos

**Lectura**:

- `vw_stock_global`: Stock consolidado con estados calculados.
- `master_sku`: Catálogo de productos.
- `master_categories`: Para filtros.
- `inventory_movements`: Historial de movimientos por SKU.

**Escritura**:

- `inventory_stock`: Actualización de cantidad (vía trigger desde movimientos).
- `inventory_movements`: Registro de cada entrada/salida/ajuste.
- `inventory_stock_adjustments`: Registro formal de ajustes con aprobación.

## Reglas de Negocio

1.  Todo cambio de stock debe generar un registro en `inventory_movements`.
2.  Los ajustes requieren motivo y notas obligatorias.
3.  El campo `created_by` debe capturar el ID del usuario logístico.
4.  Un ajuste significativo (> 10% del stock) debería generar una alerta.

## Dependencias Técnicas

- `assets/js/modules/logistica/logistica-stock.js`: Lógica del módulo.
- `assets/js/modules/work-day-helper.js`: Vinculación con jornada activa.
