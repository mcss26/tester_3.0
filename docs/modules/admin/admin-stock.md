# Admin Stock

> **Rol**: Admin, Contable, Logístico
> **Ruta**: `pages/admin/admin-stock.html`
> **JS**: `assets/js/modules/admin/admin-stock.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin**, **Contable** o **Logístico** que necesitan monitorear el inventario actual y tomar decisiones sobre reposición o valorización del stock.

### 1.2 ¿Qué hace?
Funciona como monitor central de existencias del establecimiento. Proporciona una visión consolidada del inventario actual comparándolo con los niveles requeridos (stock ideal) para detectar faltantes. Además, permite la valorización económica del stock disponible basado en los costos unitarios cargados en los SKUs, y controla la disponibilidad de productos activándolos o desactivándolos del catálogo operacional.

### 1.3 ¿Cómo lo hace?
Consume la vista de base de datos `vw_stock_global` que pre-calcula las existencias y las cruza con datos de `master_sku` para obtener costos actualizados. La interfaz permite filtrar por categorías mediante pills superiores y realizar búsquedas textuales con debounce. Incluye un sistema de valorización automática (Stock Actual × Costo Unitario) y controles directos tipo toggle para activar/desactivar SKUs sin salir de la pantalla.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Admin > Inventario (Stock)

### 2.2 Flujo Principal
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable, logistico)
3. Sistema carga datos desde `vw_stock_global` y `master_sku`
4. Sistema fusiona datos en el cliente para calcular valorización
5. Usuario puede filtrar por categoría usando pills superiores (Barra, Cocina, Descartables, etc.)
6. Usuario puede buscar por nombre/SKU en searchbox (con debounce)
7. Sistema muestra tabla con:
   - Stock Actual vs. Requerido
   - Estado visual (Bajo/Correcto) con badges de color
   - Valorización por fila (Stock × Costo)
   - Toggle de activación
8. Usuario puede activar/desactivar SKUs directamente desde la tabla
9. Sistema actualiza `master_sku.active` y refresca indicadores
10. Sistema muestra feedback con status pills y actualización reactiva

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Searchbox (filtro por nombre/SKU), Chips de categoría (filtro por `categoria_id`)
- **Acción principal**: Consulta y supervisión de niveles de alerta (Bajo vs. Correcto)
- **Acción secundaria**: Toggle de Activo (actualización directa en `master_sku`)
- **Feedback inmediato**: Etiquetas de estado (status-pill) con colores semánticos, actualización reactiva de tabla al filtrar, recálculo de totales de valorización

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `vw_stock_global`, `master_sku` | sku_id, name, category, current_qty, required_qty, status, unit_cost, pack_cost, active |
| **Escritura** | `master_sku` (Update) | active (boolean) |

### 3.2 Lógica de Negocio
El módulo implementa tres funciones principales:

**Monitoreo de Stock**:
- Comparación en tiempo real de Stock Actual vs. Stock Requerido
- Clasificación automática de estados: "Bajo" (actual < requerido), "Correcto" (actual >= requerido)
- Visualización mediante badges de color (rojo para Bajo, verde para Correcto)

**Valorización Económica**:
- Fusión de datos en el cliente entre `vw_stock_global` y `master_sku`
- Cálculo: Stock Actual × Costo Unitario para cada SKU
- Totalización del valor del inventario completo
- Actualización reactiva al cambiar filtros

**Control de Disponibilidad**:
- Toggle para activar/desactivar SKUs del catálogo operacional
- Actualización directa de `master_sku.active` sin salir de la pantalla
- Impacto en visibilidad del SKU en otros módulos (solicitudes, ventas, etc.)

**Casos especiales**:
- SKUs inactivos se muestran con indicador visual diferenciado
- Productos con costo $0 se marcan para revisión
- Filtros combinados (categoría + búsqueda) se aplican con operador AND

### 3.3 Endpoints/API
Operaciones Supabase:
- `vw_stock_global`: SELECT (vista pre-calculada con cantidades y estados)
- `master_sku`: SELECT (para costos), UPDATE (campo active)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tabla de inventario con scroll pegajoso para cabeceras
- **Filtros**: Pills de categoría + searchbox con debounce
- **Feedback**: Status pills (Bajo/Correcto), badges de estado, totales de valorización

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de datos | `.loading-spinner` |
| **Empty** | Sin stock o filtros sin resultados | `.empty-state` con CTA |
| **Stock Bajo** | current_qty < required_qty | Badge rojo "Bajo" |
| **Stock Correcto** | current_qty >= required_qty | Badge verde "Correcto" |
| **SKU Inactivo** | active = false | Fila con opacidad reducida, badge gris |
| **Error** | Fallo en operación | `Toast.error()` |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabla y filtros
- [x] Labels descriptivos en controles
- [x] Contraste de colores cumple WCAG AA (badges de estado)
- [x] Mensajes de error descriptivos

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles admin/contable/logistico)
- `core/utils.js` (formatos numéricos, debounce)
- `core/toast.js`

### 5.2 Módulos Externos
- Ninguno (módulo standalone de consulta)

### 5.3 Dependencias entre Módulos
- **Consume**:
  - `master_sku` (costos y estados de activación)
  - `vw_stock_global` (cantidades calculadas)
- **Es consumido por**: Módulos de reporte y análisis que necesitan visión del inventario valorizado
- **Relacionado con**:
  - Admin Stock Ajustes (corrección manual de existencias)
  - Admin Solicitudes (generación de pedidos de reposición)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin`, `contable` y `logistico` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para lectura de vistas y escritura en master_sku

### 6.2 Validaciones de Datos
- [x] Validación de permisos para toggle de activación
- [x] Confirmación implícita al cambiar estado de SKU
- [x] Validación de existencia del SKU antes de actualizar

### 6.3 Manejo de Errores
- Errores de conexión se capturan y muestran con Toast.error()
- Errores al actualizar estado de SKU revierten el toggle y notifican al usuario
- Búsqueda con debounce para evitar saturación de queries
- Estado de carga visible durante consultas largas

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La separación entre vista pre-calculada (`vw_stock_global`) y tabla maestra (`master_sku`) permite:
- **Performance**: Los cálculos complejos de inventario se hacen en BD, no en cliente
- **Separación de responsabilidades**: Stock es dato operativo, costos son dato maestro
- **Flexibilidad**: La fusión client-side permite actualizaciones de costos sin recalcular stock

El toggle inline de activación evita:
- Navegación a pantallas de edición completa
- Pérdida de contexto al hacer cambios rápidos
- Demoras en flujo de trabajo operativo

### 7.2 Patrones Utilizados
- **Vista pre-calculada**: Delega lógica compleja a PostgreSQL para mejor performance
- **Fusión client-side**: Combina datos de múltiples fuentes para enriquecer información
- **Debounce en búsqueda**: Evita saturación de queries con búsquedas parciales
- **Filtros combinados**: Permite refinamiento progresivo sin recargas completas

### 7.3 Consideraciones de Performance
- Vista `vw_stock_global` indexada por categoría y nombre
- Debounce de 300ms en searchbox para reducir queries
- Scroll pegajoso para cabeceras sin afectar performance
- Sin paginación (asumiendo catálogo moderado < 500 SKUs)
- Cálculo de valorización en memoria (no query adicional)

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué significa el badge "Bajo" en un producto?**
R: Indica que el stock actual está por debajo del stock requerido (nivel ideal). Es una señal para generar una solicitud de reposición.

**P: ¿Cómo se calcula la valorización del inventario?**
R: Multiplicando el Stock Actual por el Costo Unitario definido en el Master SKU. El total general es la suma de todas las valorizaciones individuales.

**P: ¿Qué pasa si desactivo un SKU desde esta pantalla?**
R: El producto deja de aparecer en los selectores de otros módulos (solicitudes, ventas) pero mantiene su stock y puede volver a activarse cuando sea necesario.

**P: ¿Por qué algunos productos muestran valorización $0?**
R: Porque no tienen costo unitario cargado en el Master SKU. Deben actualizarse en el módulo Admin Master SKU.

**P: ¿El stock que veo es en tiempo real?**
R: Sí, la vista `vw_stock_global` se actualiza automáticamente con cada movimiento de inventario (recepciones, consumos, ajustes).

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Visualizar inventario completo con todos los filtros
- [x] Filtro por categoría: Aplicar diferentes pills y verificar resultados
- [x] Búsqueda textual: Probar búsqueda parcial con debounce
- [x] Combinación de filtros: Categoría + búsqueda simultánea
- [x] Toggle de activación: Desactivar SKU y verificar actualización
- [x] Cálculo de valorización: Verificar totales con productos de diferentes costos
- [x] Estado vacío: Aplicar filtro que no retorna resultados
- [x] Permisos: Intentar acceder con rol no autorizado
- [x] Estados de stock: Verificar badges Bajo/Correcto según cantidades

### 9.2 Datos de Prueba
- SKUs en diferentes categorías (Barra, Cocina, Descartables)
- Productos con stock bajo (actual < requerido)
- Productos con stock correcto (actual >= requerido)
- Productos con costo $0 (para validar alertas)
- Productos activos e inactivos
- Al menos 20-30 SKUs para probar performance de búsqueda

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 incorporando lógica de valorización y filtros por categoría |

---

## 11. Referencias y Links

- [Admin Master SKU](admin-master-sku.md) - Gestión de costos unitarios de productos
- [Admin Stock Ajustes](admin-stock-ajustes.md) - Corrección manual de inventario
- [Admin Solicitudes](admin-solicitudes.md) - Generación de pedidos de reposición
- [Screen Map](../../screen-map.md#admin-stock) - Ubicación en arquitectura de pantallas
