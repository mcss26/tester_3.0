# Operativo Stock

> **Rol**: Operativo, Logístico
> **Ruta**: `pages/operativo/operativo-stock.html`
> **JS**: `assets/js/modules/operativo/operativo-stock.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Operativo** (`operativo`) o **Logístico** (`logistico`) que necesitan consultar el estado del inventario para la operación diaria.

### 1.2 ¿Qué hace?
Proporciona una vista en tiempo real del estado del inventario global, permitiendo al personal de logística identificar rápidamente faltantes (quiebres de stock) comparando las existencias físicas actuales contra los requerimientos mínimos definidos para la operación. El enfoque es detectar alertas de reposición mediante el cálculo de diferencias entre stock actual y requerido.

### 1.3 ¿Cómo lo hace?
El módulo consume una vista consolidada (`vw_stock_global`) que centraliza datos de SKUs, categorías y niveles de stock. Calcula automáticamente la diferencia (`Stock Actual - Requerido`) y resalta visualmente los SKUs que están por debajo del nivel requerido. Organiza el catálogo mediante pestañas dinámicas basadas en las categorías de los productos cargados, permitiendo filtrar rápidamente por tipo de producto.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Operativo > Stock

### 2.2 Flujo Principal
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: operativo, logistico)
3. Sistema carga datos desde `vw_stock_global` (solo SKUs activos)
4. Sistema genera tabs de categoría dinámicamente a partir de los datos recibidos
5. Usuario puede filtrar por categoría (tabs superiores) o buscar por texto (debounced search)
6. Sistema calcula y muestra la diferencia entre stock actual y requerido
7. Productos con diferencia negativa se resaltan visualmente como alertas
8. Usuario puede refrescar datos para sincronizar con la última versión de BD

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Buscador de SKU (text input con debounce), Filtro de Categoría (tabs dinámicos)
- **Acción principal**: Botón "Refrescar" para sincronizar datos
- **Feedback inmediato**: Badges de estado (Verde para stock suficiente, Rojo/Amarillo para stock crítico), indicadores numéricos de diferencia

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `vw_stock_global` | sku_name, category_name, stock_actual, stock_requerido, diferencia (calculado), active |

### 3.2 Lógica de Negocio
El módulo implementa una lógica de solo lectura centrada en la detección de alertas:

**Cálculo de Diferencias**:
- Formula: `Diferencia = Stock Actual - Stock Requerido`
- Valores negativos indican necesidad de reposición inmediata
- Valores positivos indican stock suficiente o excedente

**Filtrado y Visualización**:
- Muestra solo SKUs marcados como `activos` en la vista
- Ordenamiento alfabético por nombre de SKU
- Tabs de categoría generados dinámicamente desde los datos
- Búsqueda debounced para evitar queries excesivas

**Casos especiales**:
- Si un SKU no tiene stock requerido definido, se muestra advertencia
- SKUs con stock actual 0 se marcan con alerta crítica
- La vista consolida automáticamente datos de múltiples almacenes si existen

### 3.3 Endpoints/API
Operaciones Supabase:
- `vw_stock_global`: SELECT (filtrado por active = true, con ordering por name)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tabla de inventario con tabs de categoría
- **Tabs dinámicos**: Generados desde las categorías únicas en los datos
- **Feedback**: Badges de estado, indicadores numéricos con colores

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de datos | `.loading-spinner` |
| **Empty** | Sin SKUs activos | `.empty-state` con mensaje informativo |
| **Error** | Fallo de conexión | `Toast.error()` con mensaje descriptivo |
| **Success** | Datos cargados | Tabla poblada con badges de estado |
| **Stock Crítico** | Diferencia < 0 | Badge rojo + highlight en fila |
| **Stock Suficiente** | Diferencia >= 0 | Badge verde |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabs y tabla
- [x] Contraste de colores para badges cumple WCAG AA
- [x] Mensajes descriptivos en estados vacíos
- [x] Indicadores visuales claros para alertas críticas

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles operativo/logistico)
- `core/utils.js` (formatos, búsqueda debounced)
- `core/toast.js`

### 5.2 Módulos Externos
Ninguno

### 5.3 Dependencias entre Módulos
- **Consume**: Vista `vw_stock_global` (consolidada desde `master_sku`, `master_categories` y tablas de stock)
- **Es consumido por**: Módulos de solicitudes de reposición que necesitan conocer el estado del stock
- **Relacionado con**: `operativo-solicitudes.md` (genera pedidos basados en alertas de stock)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `operativo` y `logistico` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para lectura de vista

### 6.2 Validaciones de Datos
- [x] Solo muestra SKUs activos (filtrado por vista)
- [x] Validación de existencia de datos antes de renderizar
- [x] Manejo de valores nulos en stock actual/requerido

### 6.3 Manejo de Errores
- Errores de conexión se capturan y muestran con Toast.error()
- Si la vista no existe o no retorna datos, se muestra estado vacío
- Búsquedas sin resultados muestran mensaje informativo
- Refresh fallido mantiene los datos anteriores y notifica al usuario

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La decisión de usar una vista consolidada (`vw_stock_global`) en lugar de múltiples queries permite:
- **Simplicidad**: Una única fuente de verdad para el estado del stock
- **Performance**: La vista pre-calcula joins y agregaciones complejas
- **Consistencia**: Todos los módulos operativos ven los mismos datos
- **Solo lectura**: Los operativos consultan sin riesgo de modificar datos críticos

### 7.2 Patrones Utilizados
- **Vista materializada**: `vw_stock_global` consolida datos de múltiples tablas
- **Filtrado client-side con debounce**: Mejora UX sin sobrecargar el servidor
- **Tabs dinámicos**: Generados desde los datos para adaptarse al catálogo actual
- **Códigos de color**: Verde/Rojo para comunicación visual inmediata del estado

### 7.3 Consideraciones de Performance
- Búsqueda con debounce (300ms) para evitar queries excesivas
- Vista pre-calculada en BD reduce carga computacional en cliente
- Carga inicial única, refreshes manuales bajo demanda
- Renderizado incremental de filas para tablas grandes

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Por qué algunos productos no aparecen en la lista?**
R: El módulo solo muestra SKUs marcados como `activos`. Los productos inactivos o descontinuados no se visualizan para mantener la claridad operativa.

**P: ¿Qué significa un badge rojo en un producto?**
R: Indica que el stock actual está por debajo del nivel requerido. Es una alerta de reposición que debe ser atendida mediante el módulo de Solicitudes.

**P: ¿Los datos se actualizan automáticamente?**
R: No, los datos se cargan al ingresar a la pantalla y deben refrescarse manualmente con el botón "Refrescar" para ver cambios recientes.

**P: ¿Puedo modificar el stock desde esta pantalla?**
R: No, este es un módulo de solo consulta. Las modificaciones de stock se realizan desde módulos de admin o mediante recepciones de pedidos.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Acceder con rol operativo y visualizar stock con alertas
- [x] Estado vacío: Verificar mensaje cuando no hay SKUs activos
- [x] Búsqueda: Probar filtrado por texto en nombres de productos
- [x] Filtrado por categoría: Verificar tabs dinámicos funcionan correctamente
- [x] Permisos: Intentar acceder con rol no autorizado (debe redirigir)
- [x] Refresh: Verificar actualización de datos tras cambios en BD

### 9.2 Datos de Prueba
- Al menos 5 SKUs activos en diferentes categorías
- Algunos SKUs con stock_actual < stock_requerido (para probar alertas)
- Algunos SKUs con stock suficiente (diferencia positiva)
- Al menos 3 categorías diferentes para probar tabs dinámicos

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 incorporando lógica de comparación de stock vs requerimientos |

---

## 11. Referencias y Links

- [Operativo Solicitudes](operativo-solicitudes.md) - Generación de pedidos de reposición basados en alertas
- [Admin Central Stock](../admin/admin-central-stock.md) - Vista administrativa completa de inventario
- [Master SKU](operativo-master-sku.md) - Gestión del catálogo de productos
- [Screen Map](../../screen-map.md#operativo-stock) - Ubicación en arquitectura de pantallas
