# Admin Master POS

> **Rol**: Admin, Contable
> **Ruta**: `pages/admin/admin-master-pos.html`
> **JS**: `assets/js/modules/admin/admin-master-pos.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin** o **Contable** que gestionan el parque de terminales de cobro electrónico del establecimiento.

### 1.2 ¿Qué hace?
Gestiona el registro maestro de terminales POS (Point of Sale) físicas del establecimiento. Permite mapear hardware físico (identificado por serial/ID externo provisto por el servicio de pagos) a nombres lógicos que identifican puntos de venta específicos (como "Barra Principal" o "Recepción") y sus proveedores de pago (Mercado Pago, Getnet, Payway, etc.).

### 1.3 ¿Cómo lo hace?
Provee un listado administrativo de todas las terminales registradas con su estado actual (Activo/Inactivo). La gestión integral se realiza mediante un slide-panel donde se definen el nombre "friendly", el proveedor del servicio y el identificador único del dispositivo físico. Los datos persisten en la tabla `pos_terminals` de Supabase.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Admin > POS

### 2.2 Flujo Principal
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable)
3. Sistema carga lista de terminales desde `pos_terminals`
4. Usuario visualiza tabla de terminales registradas con sus proveedores
5. Usuario clickea en "+" (Crear nueva terminal) o "Editar" en una fila
6. Se abre `slide-panel` lateral con formulario
7. Usuario completa campos:
   - Nombre (Friendly Name): identificación interna (ej: "Barra VIP")
   - Proveedor: selector con opciones (MERCADO PAGO, GETNET, PAYWAY, etc.)
   - External ID: código/serial del dispositivo físico (mandatorio)
8. Sistema valida campos requeridos
9. Al guardar, sistema persiste en `pos_terminals`
10. Panel se cierra y tabla se recarga automáticamente
11. Sistema muestra feedback con Toast

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Nombre (Friendly Name), Proveedor (Select), External ID (Serial/Código, requerido)
- **Acción principal**: Botón "Guardar" o "Actualizar" en el panel lateral
- **Feedback inmediato**: Recarga automática de lista tras confirmación de Supabase, Toast notifications, badges de estado

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `pos_terminals` | id, friendly_name, provider, external_id, active |
| **Escritura** | `pos_terminals` (Insert/Update) | friendly_name (string), provider (string), external_id (string, requerido), active (boolean) |

### 3.2 Lógica de Negocio
El módulo implementa un CRUD completo con las siguientes características:

**Gestión de Terminales**:
- Registro de dispositivos POS con identificación dual: nombre lógico interno + ID externo del proveedor
- Soporte para múltiples proveedores de pago
- Estado activo/inactivo para control de disponibilidad

**Validaciones**:
- External ID es mandatorio: asegura vinculación unívoca con hardware físico
- Friendly Name requerido para identificación interna
- Proveedor debe seleccionarse del catálogo disponible

**Casos especiales**:
- Si una terminal se desactiva, sus transacciones históricas se preservan
- El External ID debe coincidir exactamente con el provisto por el servicio de pagos
- Una terminal puede reasignarse a otro punto de venta cambiando solo el Friendly Name

### 3.3 Endpoints/API
Operaciones Supabase:
- `pos_terminals`: SELECT, INSERT, UPDATE

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tabla de terminales con columnas: Nombre, Proveedor, External ID, Estado
- **Overlay**: `slide-panel` para creación/edición
- **Feedback**: Toast notifications, badges de estado

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial | `.loading-spinner` |
| **Empty** | Sin terminales registradas | `.empty-state` con CTA "Nueva Terminal" |
| **Error** | Fallo en operación | `Toast.error()` |
| **Success** | Terminal guardada | `Toast.success()` + recarga de tabla |
| **Active/Inactive** | Estado de terminal | Badge verde/gris en fila |

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
- `modules/panel.js` (slide-panel para edición)
- `admin-navigation.js` (navegación común del área admin)

### 5.3 Dependencias entre Módulos
- **Es consumido por**:
  - Módulo de Cierre de Caja (conciliación por terminal)
  - Reportes de ventas (segmentación por punto de venta)
  - Módulo de Transacciones (registro de pagos por terminal)
- **Consume**: Ninguno (es una tabla maestra independiente)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin` y `contable` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura

### 6.2 Validaciones de Datos
- [x] Campos requeridos: `friendly_name`, `provider`, `external_id`
- [x] External ID: debe ser único por proveedor (evitar duplicados)
- [x] Formato: External ID como string alfanumérico

### 6.3 Manejo de Errores
- Errores de validación se muestran inline en el formulario
- Errores de Supabase se capturan y muestran con Toast.error()
- Validación de External ID único (recomendado implementar constraint en BD)

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La separación entre identificación lógica (Friendly Name) y física (External ID) permite:
- **Flexibilidad operativa**: Reasignar terminales entre puntos de venta sin afectar integraciones
- **Trazabilidad**: Vincular transacciones al dispositivo físico específico
- **Multi-proveedor**: Soportar diferentes servicios de pago en un solo sistema

El uso de tabla maestra centralizada evita:
- Duplicación de datos de terminales en múltiples módulos
- Inconsistencias en reportes y conciliaciones
- Complejidad en migraciones de proveedores de pago

### 7.2 Patrones Utilizados
- **Master Data Management**: Tabla única como fuente de verdad
- **SlidePanel**: Edición en contexto sin pérdida de vista principal
- **Soft Delete**: Campo `active` en lugar de eliminación física

### 7.3 Consideraciones de Performance
- Sin paginación (cantidad esperada < 20 terminales)
- Carga completa en una sola query
- Índice recomendado en `external_id` para búsquedas rápidas en integraciones

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué es el External ID y dónde lo encuentro?**
R: Es el identificador único del dispositivo físico provisto por el servicio de pagos (Mercado Pago, Getnet, etc.). Lo encuentras en el panel de administración del proveedor o en la configuración del dispositivo.

**P: ¿Puedo tener múltiples terminales del mismo proveedor?**
R: Sí, puedes registrar tantas terminales como necesites del mismo proveedor, siempre que cada una tenga un External ID único.

**P: ¿Qué pasa si desactivo una terminal?**
R: La terminal deja de estar disponible para nuevas transacciones, pero todas sus transacciones históricas se preservan para reportes y auditorías.

**P: ¿Puedo cambiar el nombre de una terminal sin afectar los datos?**
R: Sí, el Friendly Name es solo para identificación interna. Cambiar el nombre no afecta la vinculación con transacciones (que usan el External ID).

**P: ¿Qué hago si cambio de proveedor de pagos?**
R: Desactiva las terminales del proveedor anterior y registra las nuevas terminales con sus nuevos External IDs. El histórico se preserva.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Crear nueva terminal con todos los campos válidos
- [x] Validación: Intentar guardar sin External ID (debe mostrar error)
- [x] Estado vacío: Acceder sin terminales registradas
- [x] Permisos: Intentar acceder con rol no autorizado
- [x] Edición: Modificar Friendly Name de terminal existente
- [x] Activación/Desactivación: Cambiar estado de terminal
- [x] Duplicados: Intentar crear terminal con External ID duplicado
- [x] Múltiples proveedores: Registrar terminales de diferentes proveedores

### 9.2 Datos de Prueba
- Crear 2-3 terminales de Mercado Pago con External IDs ficticios
- Crear 1 terminal de otro proveedor (Getnet o Payway)
- Incluir al menos una terminal inactiva
- Probar nombres descriptivos: "Barra Principal", "Barra VIP", "Recepción"

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 conforme al nuevo estándar |

---

## 11. Referencias y Links

- [Admin Workdays — Night Chief](workdays.md) - Cierre de caja integrado en Night Chief tab
- [Screen Map](../../screen-map.md#admin-master-pos) - Ubicación en arquitectura de pantallas
