# Admin Master Tarifario

> **Rol**: Admin, Contable
> **Ruta**: `pages/admin/admin-master-tarifario.html`
> **JS**: `assets/js/modules/admin/admin-master-tarifario.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin** o **Contable** que gestionan la estructura de cargos y remuneraciones del personal.

### 1.2 ¿Qué hace?
Gestiona la estructura de cargos (roles) del personal y sus remuneraciones base. Funciona como el "maestro de precios" para el costo de la mano de obra, permitiendo estandarizar lo que se paga por hora o jornada según el cargo y el área de trabajo. Esta información alimenta el sistema de liquidación de sueldos y planificación de presupuesto de nómina.

### 1.3 ¿Cómo lo hace?
Presenta una tabla administrativa organizada por Cargo y Área operativa. La gestión integral (Alta, Baja, Modificación) se realiza a través de un slide-panel que captura el nombre del cargo, el área de trabajo (Barra, Caja, Seguridad, etc.) y la tarifa base numérica. La persistencia se realiza en la tabla `master_staff_roles` de Supabase.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Admin > Tarifario

### 2.2 Flujo Principal
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable)
3. Sistema carga lista de cargos desde `master_staff_roles`
4. Usuario visualiza tabla con columnas: Cargo, Área, Tarifa Base
5. Usuario clickea en "+" (Crear) o "Editar" en una fila
6. Se abre `slide-panel` lateral con formulario
7. Usuario completa campos:
   - Nombre del Cargo (ej: "Barra Principal", "Seguridad", "Limpieza")
   - Área: selector con opciones pre-definidas (Barra, Caja, Recepción, Seguridad, Limpieza, Cocina, etc.)
   - Tarifa Base: valor monetario numérico (por hora o jornada según configuración)
8. Sistema valida campos obligatorios (Nombre y Área)
9. Al guardar, sistema persiste en `master_staff_roles`
10. Panel se cierra y tabla se recarga
11. Sistema muestra notificación de éxito vía Toast

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Nombre del Cargo (texto requerido), Área (Select requerido), Tarifa Base (Number)
- **Acción principal**: Botón "Guardar" o "Actualizar" en el panel
- **Feedback inmediato**: Notificación de éxito vía Toast, recarga de tabla principal

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `master_staff_roles` | id, name, area, base_rate, active |
| **Escritura** | `master_staff_roles` (Insert/Update) | name (string), area (string), base_rate (numeric), active (boolean) |

### 3.2 Lógica de Negocio
El módulo implementa un CRUD estándar con las siguientes características:

**Gestión de Cargos y Tarifas**:
- CRUD completo sobre `master_staff_roles`
- Agrupación lógica por áreas operativas
- Definición de tarifa base por cargo (puede ser por hora o jornada completa)
- Estado activo/inactivo para control de disponibilidad

**Validaciones**:
- Campos obligatorios: Nombre y Área
- Tarifa Base puede ser 0 o null (útil para cargos sin costo directo o pendientes de definición)
- Hard-coding de áreas operativas en el select del formulario

**Casos especiales**:
- Cargos inactivos se preservan para mantener integridad referencial con jornadas pasadas
- Si se modifica la tarifa, afecta solo a jornadas futuras (no retroactivo)
- Un mismo cargo puede tener tarifas diferentes si se crea con nombre distinto (ej: "Barra Jr." vs "Barra Sr.")

### 3.3 Endpoints/API
Operaciones Supabase:
- `master_staff_roles`: SELECT, INSERT, UPDATE

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tabla de cargos con columnas: Nombre, Área, Tarifa Base, Estado
- **Overlay**: `slide-panel` para creación/edición
- **Feedback**: Toast notifications

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial | `.loading-spinner` |
| **Empty** | Sin cargos registrados | `.empty-state` con CTA "Nuevo Cargo" |
| **Error** | Fallo en operación | `Toast.error()` |
| **Success** | Cargo guardado | `Toast.success()` + recarga de tabla |
| **Active/Inactive** | Estado de cargo | Badge o indicador visual |

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
  - Admin Workdays (cálculo de costos de dotación proyectada)
  - Módulo de Liquidación de Sueldos (cálculo de pagos por jornada)
  - Reportes de costos operativos (análisis de gastos de personal)
- **Consume**: Ninguno (es una tabla maestra independiente)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin` y `contable` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura

### 6.2 Validaciones de Datos
- [x] Campos requeridos: `name`, `area`
- [x] Formato numérico: `base_rate` (puede ser null o 0)
- [x] Áreas válidas: limitadas a opciones del selector
- [ ] Prevención de duplicados exactos (nombre + área)

### 6.3 Manejo de Errores
- Errores de validación se muestran inline en el formulario
- Errores de Supabase se capturan y muestran con Toast.error()
- Validación de campos requeridos antes de envío

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La separación por área operativa permite:
- **Organización lógica**: Agrupar cargos similares para reportes y análisis
- **Planificación flexible**: Calcular presupuestos por área de trabajo
- **Escalabilidad**: Agregar nuevas áreas sin modificar estructura de datos

El uso de tarifa base única (en lugar de múltiples tarifas por cargo) simplifica:
- **Gestión**: Una sola tarifa de referencia por cargo
- **Cálculos**: Base simple para liquidaciones con posibles ajustes posteriores
- **Comprensión**: Claridad en costos base antes de bonificaciones o recargos

### 7.2 Patrones Utilizados
- **Master Data Management**: Tabla única como fuente de verdad para costos laborales
- **SlidePanel**: Edición en contexto sin pérdida de vista principal
- **Soft Delete**: Campo `active` en lugar de eliminación física
- **Hard-coded options**: Áreas operativas definidas en el cliente (podrían migrar a tabla maestra)

### 7.3 Consideraciones de Performance
- Sin paginación (cantidad esperada < 30 cargos)
- Carga completa en una sola query
- Posible índice en `area` para agrupaciones en reportes

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿La tarifa base es por hora o por jornada?**
R: Depende de la configuración del establecimiento. El sistema almacena el valor numérico; la interpretación (hora/jornada) se define en la lógica de liquidación de sueldos.

**P: ¿Puedo tener múltiples cargos en la misma área?**
R: Sí, puedes crear tantos cargos como necesites dentro de la misma área (ej: "Barra Jr.", "Barra Sr.", "Barra Principal" todos en área "Barra").

**P: ¿Qué pasa si cambio la tarifa de un cargo?**
R: El cambio afecta a futuras asignaciones y liquidaciones. Las jornadas ya completadas mantienen la tarifa vigente al momento de su ejecución.

**P: ¿Puedo dejar la tarifa en 0?**
R: Sí, útil para cargos sin costo directo (ej: voluntarios, propietarios) o cargos pendientes de definición de tarifa.

**P: ¿Cómo agrego una nueva área operativa?**
R: Actualmente las áreas están hard-coded en el formulario. Para agregar una nueva área, se debe modificar el código del módulo (recomendación: migrar a tabla maestra).

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Crear nuevo cargo con todos los campos válidos
- [x] Validación: Intentar guardar sin nombre o área (debe mostrar error)
- [x] Estado vacío: Acceder sin cargos registrados
- [x] Permisos: Intentar acceder con rol no autorizado
- [x] Edición: Modificar tarifa de cargo existente
- [x] Tarifa cero: Crear cargo con tarifa base = 0
- [x] Múltiples cargos: Crear varios cargos en la misma área
- [x] Activación/Desactivación: Cambiar estado de cargo

### 9.2 Datos de Prueba
- Crear cargos de diferentes áreas: "Barra Principal" (Barra, $5000), "Cajero" (Caja, $4500), "Seguridad" (Seguridad, $6000)
- Crear un cargo con tarifa 0
- Incluir al menos un cargo inactivo
- Probar diferentes rangos de tarifas: desde $3000 hasta $10000

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 incorporando lógica de cargos y áreas |

---

## 11. Referencias y Links

- [Admin Workdays](workdays.md) - Utiliza tarifas para calcular costos de dotación
- [Screen Map](../../screen-map.md#admin-master-tarifario) - Ubicación en arquitectura de pantallas
