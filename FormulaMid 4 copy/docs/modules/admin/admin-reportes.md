# Reportes Operativos

**Ruta**: `pages/admin/admin-reportes.html`
**Roles**: `admin`, `contable`

## Objetivo Operativo

Visualizar el desempeño histórico del negocio mediante métricas consolidadas de ventas y performance del personal.

## Flujo Principal

1.  **Filtro Temporal**: Selección de rango "Desde" / "Hasta".
2.  **Métricas de Ventas**: Visualización de la recaudación por jornada (Sistema vs Declarado).
3.  **Performance Staff**: Listado de personal con su tasa de asistencia y precisión en cierres de caja (diferencias neta).

## Modelo de Datos

**Lectura**:

- `vw_report_sales_closing`: Vista que compara transacciones de sistema contra cierres manuales.
- `vw_report_staff_performance`: Vista de métricas por usuario.

## Dependencias Técnicas

- `assets/js/modules/admin/admin-reportes.js`: Manejo de tabs y filtros de búsqueda.
