# Admin Herramientas

> **Ruta**: `pages/admin/admin-herramientas.html`
> **Roles**: `admin`, `contable`, `logistico`
> **Última Actualización**: 2026-01-29

## Objetivo Operativo

Proveer herramientas avanzadas para la inteligencia de stock y análisis de consumos. Permite importar datos externos (Excel), calcular niveles ideales de stock basados en consumos históricos y realizar auditorías comparando el consumo real contra los movimientos registrados en el sistema.

## Flujo Principal (Workflows)

### Importación de Consumos
1. El usuario selecciona una **Fecha Operativa**.
2. El usuario carga un archivo Excel (.xlsx) con los consumos de la jornada.
3. El sistema previsualiza los datos y busca coincidencias con los SKUs del sistema (por nombre o ID externo).
4. El usuario confirma la importación, lo que genera un registro en `consumption_reports` y sus detalles en `consumption_details`.

### Análisis de Ideales
1. El usuario define un rango de fechas.
2. El sistema calcula el consumo promedio diario por SKU en ese periodo.
3. El sistema proyecta el "Ideal 500" (reposición para una noche de 500 pax) y el "Ideal 900" (reposición para una noche de 900 pax).

### Comparativa Real vs Sistema
1. El usuario define un rango de fechas.
2. El sistema cruza los datos de `consumption_details` (Real) contra `inventory_movements` de tipo 'consumption' o 'loss' (Sistema).
3. Se muestra una tabla con las diferencias detectadas, resaltando desviaciones significativas.

### Histórico de Consumo
1. El sistema carga los últimos 20 reportes de consumo.
2. Identifica los Top 5 productos más consumidos.
3. Renderiza un gráfico de líneas (`Chart.js`) mostrando la evolución del consumo en el tiempo.

## Modelo de Datos

| Operación | Tablas |
|:----------|:-------|
| **Lectura** | `consumption_reports`, `consumption_details`, `master_sku`, `inventory_movements` |
| **Escritura** | `consumption_reports`, `consumption_details` |

## Dependencias Técnicas

- **Core**: `auth.js`, `supabase-client.js`, `utils.js`, `toast.js`
- **Módulos**: `analysis-helpers.js`, `admin-navigation.js`
- **Librerías Externas**: `Chart.js`, `SheetJS (XLSX)`
