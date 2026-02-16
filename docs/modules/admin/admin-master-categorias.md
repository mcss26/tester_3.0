# Admin Master Categorías

> **Rol**: Admin, Contable
> **Ruta**: `pages/admin/admin-master-categorias.html`
> **JS**: `assets/js/modules/admin/admin-master-categorias.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin** o **Contable** que gestionan la taxonomía de productos del sistema.

### 1.2 ¿Qué hace?
Centraliza y estandariza las categorías de productos del establecimiento. Su propósito es crear una estructura de clasificación coherente que permita organizar el catálogo de SKUs y facilitar el filtrado en reportes de ventas, inventario y análisis de costos.

### 1.3 ¿Cómo lo hace?
Presenta una lista simple de categorías con su estado de activación. La gestión (alta, baja, modificación) se realiza mediante un panel lateral deslizable (SlidePanel) que captura el nombre de la categoría y su estado. La persistencia es directa contra la tabla `master_categories` de Supabase con ordenamiento alfabético automático.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
Navegación superior Admin > "Categorías"

### 2.2 Flujo Principal
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable)
3. Sistema carga lista de categorías desde `master_categories` ordenadas alfabéticamente
4. Usuario puede ver categorías activas e inactivas
5. Usuario clickea en "+ Nueva Categoría" (crear) o "Editar" (modificar)
6. Se abre `slide-panel` lateral con formulario
7. Usuario ingresa nombre (obligatorio) y marca estado de activación (checkbox)
8. Sistema valida que el nombre no esté vacío
9. Al guardar (INSERT o UPDATE), sistema persiste en `master_categories`
10. Panel se cierra automáticamente y tabla se recarga
11. Sistema muestra estado de carga ("Cargando categorías...")

### 2.3 Inputs y Acciones Clave
- **Campos principales**: `cat-nombre` (Texto, Requerido), `cat-active` (Checkbox para estado activo/inactivo)
- **Acción principal**: Botón "Guardar" o "Actualizar" (`#btn-save`)
- **Feedback inmediato**: Cierre del panel lateral, refresco de tabla con indicador de carga, Toast notifications

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `master_categories` | id, nombre, active |
| **Escritura** | `master_categories` (Insert/Update) | id (auto), nombre (string), active (boolean) |

### 3.2 Lógica de Negocio
El módulo implementa un CRUD simple con las siguientes características:

**Gestión de Categorías**:
- Operaciones INSERT y UPDATE directas sobre `master_categories`
- Recuperación ordenada alfabéticamente por nombre mediante `.order('nombre')`
- Estado activo/inactivo para control de visibilidad

**Validaciones**:
- Comprobación client-side de que `nombre` no esté vacío antes del envío
- Lanza `Error` si validación falla, evitando request a Supabase

**Gestión de Estado de Formulario**:
- Al crear nuevo: resetea explícitamente el estado del formulario (ID = null)
- Al editar: mantiene ID original para evitar duplicados accidentales

**Casos especiales**:
- Categorías inactivas se mantienen en BD para preservar integridad referencial con SKUs existentes
- No se permite eliminar categorías, solo desactivarlas
- Se recomienda implementar validación de nombres duplicados en tiempo real

### 3.3 Endpoints/API
Operaciones Supabase:
- `master_categories`: SELECT (ordenado por nombre), INSERT, UPDATE

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Lista/tabla simple de categorías
- **Overlay**: `slide-panel` para creación/edición
- **Feedback**: Toast notifications, estado de carga

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial o recarga | "Cargando categorías..." en tabla |
| **Empty** | Sin categorías | `.empty-state` con CTA "Nueva Categoría" |
| **Error** | Fallo de Supabase | Mensaje de error en sección de alerta |
| **Success** | Categoría guardada | Recarga de tabla con nueva/modificada categoría |
| **Form Reset** | Click en "Nuevo" | Limpia campos y resetea ID a null |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional
- [x] Labels descriptivos en formulario
- [x] Contraste de colores cumple WCAG AA
- [x] Mensajes de error descriptivos

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles admin/contable)
- `core/utils.js`
- `core/toast.js`

### 5.2 Módulos Externos
- `modules/panel.js` (SlidePanel para edición)
- `admin-navigation.js` (navegación común del área admin)

### 5.3 Dependencias entre Módulos
- **Es consumido por**:
  - Master SKU (asignación de categoría a productos)
  - Admin Stock (filtros por categoría)
  - Reportes de ventas e inventario (agrupación por categoría)
- **Consume**: Ninguno (es una tabla maestra independiente)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin` y `contable` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Atributo `data-allowed-roles` en HTML
- [x] Permisos a nivel de Supabase RLS para escritura

### 6.2 Validaciones de Datos
- [x] Campo requerido: `nombre`
- [x] Validación client-side con throw Error
- [x] Prevención de envío con campos vacíos
- [ ] Validación de nombres duplicados (recomendado implementar en tiempo real)

### 6.3 Manejo de Errores
- Errores de validación se lanzan como `Error` y se capturan en bloques try/catch
- Errores de Supabase se muestran en estado de alerta dentro de la lista
- Errores de conexión/permisos se capturan y muestran de forma amigable

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
El uso del patrón **Master-Detail con SlidePanel** ofrece:
- **Contexto visual**: Usuario mantiene vista de la lista principal mientras edita
- **Reducción de carga cognitiva**: No requiere navegación a páginas aisladas de edición
- **Fluidez operativa**: Permite gestiones múltiples sin cambios de contexto

La simplicidad del módulo refleja que las categorías son:
- **Datos maestros estables**: No cambian frecuentemente
- **Estructura plana**: Sin jerarquías ni relaciones complejas
- **Validación simple**: Solo requieren nombre único

### 7.2 Patrones Utilizados
- **SlidePanel**: Edición en contexto sin pérdida de vista principal
- **CRUD simple**: Operaciones directas sin capas de abstracción innecesarias
- **Ordenamiento en BD**: `.order('nombre')` para consistencia en presentación
- **Soft Delete**: Campo `active` en lugar de eliminación física

### 7.3 Consideraciones de Performance
- Sin paginación (cantidad esperada < 20 categorías)
- Ordenamiento alfabético en base de datos
- Carga completa en una sola query
- Reset explícito del formulario para evitar estados inconsistentes

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Puedo eliminar una categoría?**
R: No se eliminan categorías para mantener integridad referencial. Se desactivan usando el campo `active`, lo que las oculta de los selectores pero preserva el histórico de productos asociados.

**P: ¿Qué pasa si intento crear una categoría con nombre duplicado?**
R: Actualmente el sistema no valida duplicados en tiempo real. Se recomienda verificar la lista antes de crear. Esta validación está pendiente de implementación.

**P: ¿Puedo reactivar una categoría inactiva?**
R: Sí, editando la categoría y marcando el checkbox de "Activo".

**P: ¿Cuántas categorías puedo crear?**
R: No hay límite técnico, pero se recomienda mantener entre 5-15 categorías para facilitar la organización y evitar fragmentación excesiva del catálogo.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Crear nueva categoría con nombre válido
- [x] Validación: Intentar guardar sin nombre (debe mostrar error)
- [x] Estado vacío: Acceder sin categorías existentes
- [x] Permisos: Intentar acceder con rol no autorizado (debe redirigir)
- [x] Edición: Modificar nombre de categoría existente
- [x] Activación/Desactivación: Cambiar estado de categoría
- [x] Reset de formulario: Verificar que "Nuevo" limpia campos correctamente
- [ ] Duplicados: Probar creación de categorías con nombres idénticos

### 9.2 Datos de Prueba
- Crear categorías estándar: "Barra", "Cocina", "Descartables", "Limpieza"
- Probar nombres con caracteres especiales: "Bar & Eventos"
- Crear al menos una categoría inactiva
- Editar categoría existente y verificar que mantiene su ID

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-25 | Antigravity AI | Migración a estándar robusto v2 |

---

## 11. Referencias y Links

- [Admin Central Stock](admin-central-stock.md) - Utiliza categorías para clasificar productos y stock
- [Admin Central Stock](admin-central-stock.md) - Filtros por categoría en visualización de inventario
- [Screen Map](../../screen-map.md#admin-master-categorias) - Ubicación en arquitectura de pantallas
