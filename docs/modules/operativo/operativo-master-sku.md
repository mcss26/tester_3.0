# Operativo Master SKU

> **Rol**: Operativo, Staff Barra, Staff Operativo
> **Ruta**: `pages/operativo/operativo-master-sku.html`
> **JS**: `assets/js/modules/operativo/operativo-master-sku.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Operativo** (`operativo`), **Staff de Barra** (`staff_barra`) o **Staff Operativo** (`staff_operativo`) que necesitan reportar cambios en el catálogo de productos desde el campo.

### 1.2 ¿Qué hace?
Gestiona la integridad del catálogo de productos desde el campo mediante un sistema de **Solicitudes de Cambio**. A diferencia del administrador, el personal operativo no tiene permisos de edición directa; en su lugar, el módulo permite reportar errores de precio, nuevos productos o cambios de pack, los cuales deben ser aprobados por Gerencia. Provee una vista completa del maestro (idéntica a la de administración en lectura) pero restringiendo los cambios a un sistema de peticiones que requiere validación administrativa.

### 1.3 ¿Cómo lo hace?
El módulo presenta una interfaz dual:
1. **Vista Maestro**: Una lista de solo lectura del catálogo activo para consulta rápida de costos, packs, proveedores y niveles de stock
2. **Sistema de Solicitudes**:
   - El usuario selecciona un tipo de acción (`Crear`, `Editar`, `Modificar precio`, `Modificar pack`, `Modificar proveedor`, `Desactivar`)
   - Completa los campos relevantes y adjunta una **Justificación obligatoria**
   - La solicitud se inserta en `sku_change_requests` con estado `pending` y payload JSON estructurado
3. **Seguimiento**: El staff puede ver el historial de sus propias solicitudes y verificar si fueron aprobadas o rechazadas

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Operativo > SKU

### 2.2 Flujo Principal

**Pestaña Solicitudes - Vista por Defecto:**
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: operativo, staff_barra, staff_operativo)
3. Sistema carga el historial de solicitudes propias desde `sku_change_requests`
4. Usuario puede ver estado de solicitudes (pending, approved, rejected) con badges de color
5. Para crear nueva solicitud, usuario clickea "Nueva Solicitud"
6. Se abre panel lateral donde elige el tipo de cambio y completa formulario dinámico
7. Usuario adjunta justificación obligatoria
8. Sistema valida campos y guarda en `sku_change_requests` sin impactar `master_sku`
9. Sistema muestra feedback y actualiza lista de solicitudes

**Pestaña Maestro - Consulta:**
1. Usuario cambia a pestaña "Maestro"
2. Sistema muestra tabla de solo lectura del catálogo completo
3. Usuario puede filtrar por categoría o buscar por texto
4. Usuario consulta información de SKU, categoría, stock actual/requerido, proveedor
5. Opcionalmente, puede iniciar solicitud de cambio desde un SKU específico

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Tipo de Solicitud (select), SKU Objetivo (select autocompletado), Justificación (texto largo obligatorio)
- **Campos condicionales**: Según tipo de solicitud (precio, pack_qty, proveedor, etc.)
- **Acción principal**: Botón "Solicitar Cambio" (abre formulario), "Enviar Solicitud" (guarda petición)
- **Feedback inmediato**: Toast de éxito, actualización de lista de solicitudes, Pills de color para estados

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `master_sku` (con joins a categories/providers), `master_proveedores`, `sku_change_requests` | id, name, category_id, provider_id, pack_qty, ml_per_unit, unit_cost, pack_cost, external_id, active, request_type, status, payload (JSON), justification |
| **Escritura** | `sku_change_requests` | sku_id, request_type, requested_by, payload (JSON), justification, status (pending), created_at |

### 3.2 Lógica de Negocio
El módulo implementa un sistema de gobernanza de datos mediante solicitudes:

**Sistema de Solicitudes**:
- Tipos de solicitud: `create`, `update`, `deactivate`, `price_update`, `pack_update`, `supplier_update`
- Cada tipo muestra campos condicionales específicos en el formulario
- Payload estructurado como JSON para facilitar la aplicación automática por admin
- Justificación obligatoria para auditoría y contexto de aprobación

**Visibilidad Condicional**:
- Formulario dinámico que muestra/oculta campos según el tipo de solicitud seleccionado
- Solo muestra campos relevantes (ej: solo precio si se elige "Modificar precio")
- SKU selector se oculta para tipo `create` (nuevo producto)

**Seguridad y Control**:
- No permite mutación directa de `master_sku`
- Solicitudes quedan vinculadas al usuario que las creó (`requested_by`)
- Estado inicial siempre `pending`, solo admin puede aprobar/rechazar

**Casos especiales**:
- Si se solicita cambio de proveedor, el payload incluye el provider_id nuevo
- Solicitudes rechazadas mantienen el histórico pero no permiten re-envío (debe crear nueva)
- Justificaciones se almacenan para auditoría futura

### 3.3 Endpoints/API
Operaciones Supabase:
- `master_sku`: SELECT (con joins a categories/providers para vista maestro)
- `master_proveedores`: SELECT (para dropdown de proveedores en solicitudes)
- `sku_change_requests`: SELECT (filtrado por usuario actual), INSERT

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tab view con dos paneles (Solicitudes / Maestro)
- **Tabla Maestro**: Lista de solo lectura con filtros de categoría y búsqueda
- **Tabla Solicitudes**: Lista de solicitudes propias con badges de estado
- **Overlay**: `slide-panel` para creación de solicitudes con formulario dinámico
- **Feedback**: `Toast`, Pills de color para estados (Amarillo: Pendiente, Verde: Aprobado, Rojo: Rechazado)

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de datos | `.loading-spinner` |
| **Empty** | Sin solicitudes propias | `.empty-state` con CTA "Nueva Solicitud" |
| **Error** | Fallo en operación | `Toast.error()` con mensaje descriptivo |
| **Success** | Solicitud enviada | `Toast.success()` + actualización de tabla + cierre de panel |
| **Pending** | Solicitud sin revisar | Badge amarillo en fila |
| **Approved** | Solicitud aprobada | Badge verde en fila |
| **Rejected** | Solicitud rechazada | Badge rojo en fila |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabs, tabla y formularios
- [x] Labels descriptivos en todos los campos del formulario dinámico
- [x] Contraste de colores para badges cumple WCAG AA
- [x] Mensajes de error descriptivos en validaciones
- [x] Justificación clara de estados de solicitud

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles operativos)
- `core/utils.js` (validaciones, normalización de datos)
- `core/toast.js`

### 5.2 Módulos Externos
- `modules/panel.js` (slide-panel para formulario de solicitudes)

### 5.3 Dependencias entre Módulos
- **Consume**: Datos de `master_sku`, `master_categories` y `master_proveedores` (para consultas y selects)
- **Es consumido por**: Módulo admin que procesa las solicitudes creadas aquí
- **Complementa**: `admin-central-stock.md` (versión con permisos de aprobación)
- **Relacionado con**: Sistema de notificaciones para alertar a admin de nuevas solicitudes

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `operativo`, `staff_barra` y `staff_operativo` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS: lectura de master_sku, escritura solo en sku_change_requests
- [x] Usuarios solo ven sus propias solicitudes en el historial

### 6.2 Validaciones de Datos
- [x] Campos requeridos: `request_type`, `justification`
- [x] SKU requerido para todos los tipos excepto `create`
- [x] Validaciones condicionales según tipo de solicitud
- [x] Justificación mínima de 10 caracteres
- [x] Valores numéricos válidos para costos y cantidades

### 6.3 Manejo de Errores
- Errores de validación se muestran inline en el formulario del panel
- Errores de conexión/permisos se capturan y muestran con Toast.error()
- Si la tabla `sku_change_requests` no existe, se muestra error descriptivo
- Errores en guardado mantienen el panel abierto con datos para corrección

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La separación entre consulta y solicitudes permite:
- **Control de datos críticos**: Admin mantiene control sobre cambios de costos y proveedores
- **Empoderamiento operativo**: Staff puede reportar problemas sin depender de llamadas/emails
- **Auditoría completa**: Todas las solicitudes quedan registradas con justificación y timestamps
- **Contexto para aprobación**: Admin ve el "por qué" detrás de cada cambio solicitado

### 7.2 Patrones Utilizados
- **Payload JSON para cambios**: Estructura los datos del cambio solicitado de forma consistente
- **Formulario dinámico**: Muestra solo campos relevantes según tipo de solicitud
- **Visibilidad filtrada**: Usuarios solo ven sus propias solicitudes (via RLS)
- **Vista maestra de referencia**: Permite consultar catálogo actual mientras se crea solicitud

### 7.3 Consideraciones de Performance
- Carga de solicitudes filtrada por usuario actual (reduce volumen de datos)
- Vista maestro usa misma query que admin (consistencia de datos)
- Formulario dinámico renderiza campos condicionalmente (sin re-cargar página)
- Validaciones síncronas antes de enviar a BD

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Por qué no puedo editar un SKU directamente?**
R: Los roles operativos no tienen permisos de edición directa para proteger datos críticos como costos y proveedores. El sistema de solicitudes permite reportar cambios que serán revisados por administración.

**P: ¿Qué pasa si mi solicitud es rechazada?**
R: Las solicitudes rechazadas quedan en el histórico pero no pueden re-enviarse. Debes crear una nueva solicitud con más contexto en la justificación si consideras que el cambio sigue siendo necesario.

**P: ¿Cuánto tiempo tarda en aprobarse una solicitud?**
R: Depende del flujo de trabajo de tu organización. Las solicitudes quedan en estado "Pendiente" hasta que un administrador las revise. Puedes consultar el estado en la pestaña "Solicitudes".

**P: ¿Puedo ver solicitudes de otros usuarios?**
R: No, por seguridad y privacidad, cada usuario solo ve sus propias solicitudes. Los administradores son los únicos que ven todas las solicitudes pendientes.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Crear solicitud de cambio de precio con justificación válida
- [x] Tipo create: Verificar que selector de SKU se oculta para nuevos productos
- [x] Campos condicionales: Verificar que formulario muestra campos correctos según tipo
- [x] Error de validación: Intentar enviar sin justificación
- [x] Consulta maestro: Verificar vista de solo lectura funciona correctamente
- [x] Estado vacío: Acceder sin solicitudes previas
- [x] Permisos: Intentar acceder con rol admin (debe funcionar también)
- [x] Histórico: Verificar que solo se muestran solicitudes propias

### 9.2 Datos de Prueba
- Al menos 5 SKUs activos en `master_sku` para probar selección
- Al menos 3 proveedores en `master_proveedores` para solicitudes de cambio de proveedor
- Solicitudes de prueba en diferentes estados (pending, approved, rejected)
- Tabla `sku_change_requests` debe existir con estructura correcta

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 detallando el flujo de gobernanza de datos mediante solicitudes de cambio |

---

## 11. Referencias y Links

- [Admin Central Stock](../admin/admin-central-stock.md) - Módulo de aprobación de solicitudes creadas aquí
- [Operativo Master Proveedores](operativo-master-proveedores.md) - Gestión de proveedores referenciados en solicitudes
- [Master Categorías](../admin/admin-master-categorias.md) - Categorías de productos
- [Screen Map](../../architecture/screen-map.md#operativo-master-sku) - Ubicación en arquitectura de pantallas

---

## NOTAS TÉCNICAS

### Problemas Conocidos
1. **Error de Base de Datos**: La tabla `sku_change_requests` debe existir en Supabase con la siguiente estructura:
   - `id` (uuid, primary key)
   - `sku_id` (uuid, foreign key to master_sku, nullable para tipo create)
   - `request_type` (text: create|update|deactivate|price_update|pack_update|supplier_update)
   - `requested_by` (uuid, foreign key to profiles)
   - `payload` (jsonb)
   - `justification` (text, required)
   - `status` (text: pending|approved|rejected)
   - `created_at`, `updated_at` (timestamps)
   - `reviewed_by` (uuid, foreign key to profiles, nullable)
   - `reviewed_at` (timestamp, nullable)

2. **Vista Maestro**: Debe mostrar datos de `master_sku` completos (no solo `vw_stock_global`), incluyendo costos, pack y proveedor para que el staff tenga contexto completo al crear solicitudes.
