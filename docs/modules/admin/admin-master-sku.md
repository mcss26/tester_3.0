# Admin Master SKU

> **Rol**: Admin, Contable
> **Ruta**: `pages/admin/admin-master-sku.html`
> **JS**: `assets/js/modules/admin/admin-master-sku.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin** o **Contable** que gestionan el catálogo maestro de productos de la organización.

### 1.2 ¿Qué hace?
Gestiona el catálogo maestro de productos (SKU - Stock Keeping Units), definiendo sus atributos técnicos (medidas en ml), comerciales (costos unitarios y por pack) y logísticos (proveedor default, cantidad por pack). Además, funciona como centro de control para aprobar o rechazar solicitudes de cambios provenientes de otros módulos.

### 1.3 ¿Cómo lo hace?
Utiliza una interfaz de doble pestaña que permite tanto la gestión directa de SKUs como la revisión de solicitudes de cambio. Al aprobar una solicitud, el sistema aplica automáticamente el payload (JSON) sobre la tabla master_sku, manteniendo un flujo de trabajo controlado.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Admin > SKU

### 2.2 Flujo Principal

**Pestaña SKU - Gestión Directa:**
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable)
3. Sistema carga lista de SKUs activos e inactivos desde `master_sku`
4. Usuario puede filtrar por categoría (pills superiores) o buscar por texto (debounced)
5. Usuario clickea en "+" (Crear) o "Editar" en una fila
6. Se abre `slide-panel` lateral con formulario
7. Usuario completa campos y sistema valida
8. Al guardar, sistema actualiza `master_sku` y refresca lista
9. Sistema muestra feedback con `Toast.success()`

**Pestaña Solicitudes - Flujo de Aprobación:**
1. Usuario cambia a pestaña "Solicitudes"
2. Sistema muestra solicitudes pendientes de `sku_change_requests`
3. Usuario revisa los cambios propuestos
4. Usuario aprueba o rechaza:
   - **Aprobar**: Aplica payload JSON a `master_sku`, marca solicitud como `approved`
   - **Rechazar**: Marca solicitud como `rejected` sin aplicar cambios
5. Sistema actualiza estados y muestra feedback

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Nombre, Categoría, Proveedor, Pack Qty, ML por unidad, Costos (unitario y pack), ID Externo
- **Acción principal**: Botón "Guardar" (en panel de edición) o "Aprobar/Rechazar" (en solicitudes)
- **Feedback inmediato**: Recarga de datos vía Supabase, actualización de estados en tabla, badges de éxito/error, Toast notifications

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `master_sku`, `master_categories`, `master_proveedores`, `sku_change_requests` | id, name, category_id, provider_id, pack_qty, ml_per_unit, unit_cost, pack_cost, external_id, active |
| **Escritura** | `master_sku` (Insert/Update), `sku_change_requests` (Update status) | id, status (approved/rejected), payload (JSON) |

### 3.2 Lógica de Negocio
El módulo implementa dos modos de operación:

**Gestión Directa**:
- Operaciones CRUD completas sobre `master_sku`
- Validación de campos obligatorios (nombre, categoría, proveedor)
- Actualización inmediata sin flujo de aprobación

**Sistema de Solicitudes**:
- Lógica de resolución de IDs de SKU basada en nombre cuando es necesario
- Aplicación de cambios incrementales usando el payload JSON de la solicitud
- Actualización atómica de estados (pending → approved/rejected)
- Registro de auditoría automático con timestamps

**Casos especiales**:
- Si el SKU referenciado en una solicitud ya no existe, el sistema previene la aplicación del cambio
- Los cambios aplicados desde solicitudes se validan contra las mismas reglas que la edición directa

### 3.3 Endpoints/API
Operaciones Supabase:
- `master_sku`: SELECT (con joins a categories/providers), INSERT, UPDATE
- `sku_change_requests`: SELECT (filtrado por pending), UPDATE (cambio de status)
- `master_categories`: SELECT (para dropdown)
- `master_proveedores`: SELECT (para dropdown)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tab view con dos paneles (SKU / Solicitudes)
- **Tabla**: Lista de SKUs con filtros de categoría (pills) y búsqueda
- **Overlay**: `slide-panel` para creación/edición de SKU
- **Feedback**: `Toast`, badges de estado

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de datos | `.loading-spinner` |
| **Empty** | Sin SKUs o solicitudes | `.empty-state` con CTA "Crear SKU" |
| **Error** | Fallo en operación | `Toast.error()` con mensaje descriptivo |
| **Success** | SKU guardado o solicitud procesada | `Toast.success()` + actualización de tabla |
| **Pending** | Solicitudes sin revisar | Badge amarillo en fila |
| **Approved/Rejected** | Solicitud procesada | Badge verde/rojo en fila |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabla y formularios
- [x] Labels descriptivos en todos los campos
- [x] Contraste de colores cumple WCAG AA
- [x] Mensajes de error descriptivos en validaciones

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles admin/contable)
- `core/utils.js` (formatos, validaciones)
- `core/toast.js`

### 5.2 Módulos Externos
- `modules/panel.js` (slide-panel para edición)

### 5.3 Dependencias entre Módulos
- **Consume**: Datos de `master_categories` y `master_proveedores` (deben existir previamente)
- **Es consumido por**: Todos los módulos de stock, solicitudes, análisis que referencian SKUs
- **Recibe solicitudes de**: Staff (módulo de solicitudes de cambio de SKU)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin` y `contable` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura

### 6.2 Validaciones de Datos
- [x] Campos requeridos: `name`, `category_id`, `provider_id`, `pack_qty`, `ml_per_unit`
- [x] Rangos numéricos: `pack_qty >= 1`, `ml_per_unit > 0`, `unit_cost >= 0`, `pack_cost >= 0`
- [x] Formato de costos: valores decimales válidos
- [x] Prevención de duplicados por nombre (case insensitive)

### 6.3 Manejo de Errores
- Errores de validación se muestran inline en el formulario
- Errores de conexión/permisos se capturan y muestran con Toast.error()
- Errores al aplicar solicitudes registran el fallo y mantienen el estado pending

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La separación en dos pestañas (gestión directa vs. solicitudes) permite:
- **Agilidad operativa**: Admin puede hacer cambios directos sin burocracia
- **Control de cambios**: Cambios propuestos por otros roles pasan por revisión
- **Auditoría**: Todas las solicitudes quedan registradas con su payload original

### 7.2 Patrones Utilizados
- **Payload JSON para cambios**: Permite aplicar cambios parciales sin sobrescribir todo el registro
- **Resolución de IDs por nombre**: Facilita la integración con sistemas externos que solo conocen nombres de productos
- **Filtrado client-side con debounce**: Mejora UX sin sobrecargar el servidor

### 7.3 Consideraciones de Performance
- Búsqueda con debounce (300ms) para evitar queries excesivas
- Joins pre-calculados en queries de lectura
- Índices en `master_sku.name` y `master_sku.category_id`

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué diferencia hay entre editar directamente y aprobar una solicitud?**
R: La edición directa es instantánea y solo disponible para Admin/Contable. Las solicitudes son cambios propuestos por otros roles que requieren aprobación, manteniendo un registro de auditoría.

**P: ¿Qué pasa si rechazo una solicitud por error?**
R: Las solicitudes rechazadas quedan registradas pero no se pueden revertir. El usuario que la creó debe generar una nueva solicitud.

**P: ¿Puedo desactivar un SKU en lugar de eliminarlo?**
R: Sí, existe un campo `active` que permite desactivar SKUs sin perder el histórico de datos.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Crear nuevo SKU con todos los campos válidos
- [x] Error de validación: Intentar guardar sin campos requeridos
- [x] Estado vacío: Acceder sin SKUs ni solicitudes existentes
- [x] Permisos: Intentar acceder con rol staff (debe redirigir)
- [x] Aprobar solicitud: Verificar que cambios se aplican correctamente a master_sku
- [x] Rechazar solicitud: Verificar que master_sku no cambia

### 9.2 Datos de Prueba
- Al menos 2 categorías en `master_categories`
- Al menos 2 proveedores en `master_proveedores`
- SKUs de prueba en diferentes categorías
- Solicitudes pendientes en `sku_change_requests` con payloads válidos

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Actualización V2 incorporando lógica de Solicitudes |

---

## 11. Referencias y Links

- [Master Categorías](admin-master-categorias.md) - Gestión de categorías de productos
- [Master Proveedores](admin-master-proveedores.md) - Gestión de proveedores
- [Admin Stock](admin-stock.md) - Visualización de inventario por SKU
- [Screen Map](../../screen-map.md#admin-master-sku) - Ubicación en arquitectura de pantallas
