# Admin Central Stock

> **Ruta**: `pages/admin/admin-central-stock.html`
> **Roles**: Admin, Contable, Logistico
> **Última Actualización**: 2026-02-05

### Objetivo Operativo

- Centralizar la gestión del inventario, permitiendo visualizar el stock actual, valorizado y las tendencias de consumo.
- Facilitar la administración de SKUs y Recetas, así como el análisis de rentabilidad.
- Proveer herramientas para la importación de reportes de consumo/recaudación y ajustes manuales de stock.

### Flujo Principal (Workflows)

1. **Visualización de Dashboard**:
    - El usuario ingresa y ve métricas clave (Total Valorizado, Stock Activo/Inactivo).
    - Puede filtrar por fechas, aforo (para cálculo de stock ideal) y categorías.
    - Se muestra un gráfico comparativo de Consumo vs Recaudación.

2. **Gestión de Stock (SKUs)**:
    - **Listado**: Tabla interactiva con ordenamiento y filtros (Búsqueda, Categoría, Estado).
    - **Creación/Edición**: Panel lateral para crear nuevos SKUs o editar existentes.
    - **Solicitudes de Cambio**: Widget para aprobar/rechazar cambios en SKUs solicitados por otros usuarios.
    - **Ajuste Manual**: Modal para descontar stock manualmente (ej. mermas, roturas) registrando el motivo.

3. **Gestión de Recetas**:
    - Pestaña dedicada para listar, crear y editar recetas.
    - Definición de ingredientes y asociación con códigos externos (POS).

4. **Análisis de Rentabilidad**:
    - Comparación de Costo vs Precio de Venta (Margen, ROI).
    - Identificación de recetas rentables, regulares o no convenientes.
    - Exportación de reportes de rentabilidad.

### Modelo de Datos

| Operación | Tablas |
|:----------|:-------|
| **Lectura** | `master_sku`, `vw_stock_global`, `consumption_reports`, `consumption_details`, `revenue_reports`, `revenue_details`, `master_categories`, `master_proveedores`, `work_days`, `sku_change_requests`, `master_recipes` |
| **Escritura** | `master_sku` (Insert/Update), `master_recipes` (Insert/Update/Delete), `sku_change_requests` (Update Status), `inventory_movements` (Insert), `inventory_stock` (Update) |

### Dependencias Técnicas

- **Scripts**: `core/auth.js`, `core/utils.js`, `core/supabase-client.js`, `modules/admin/admin-central-stock.js`
- **Librerías**: Chart.js (Gráficos), SheetJS (Exportación Excel)
- **Componentes**: `slide-panel` (Gestión SKU), `modal` (Ajustes, Recetas, Gráficos)
