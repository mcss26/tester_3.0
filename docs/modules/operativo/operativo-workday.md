# Operativo Workday

> **Rol**: Operativo, Staff Barra
> **Ruta**: `pages/operativo/operativo-workday.html`
> **JS**: `assets/js/modules/operativo/operativo-workday.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-30

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Operativo** (`operativo`) o **Staff de Barra** (`staff_barra`) que necesitan visualizar la situación operativa del día.

### 1.2 ¿Qué hace?
Consolida en una sola vista:
- **Breadcrumbs** de navegación (INICIO → WORKDAY).
- **PASSLINE** con accesos públicos externos.
- **Solicitudes operativas** (items + packs calculados) con acceso directo a `operativo-solicitudes`.
- **Estado del personal** con comparativa convocado vs confirmado y listado por estado.

### 1.3 ¿Cómo lo hace?
1. **Auth guard** con `Auth.guardOrRedirect()` para roles operativo/staff_barra.
2. **Breadcrumbs** se renderizan en topbar con separadores `|`.
3. **Jornada activa**: usa `WorkDayHelper.getOpenWorkDay()` (fallback a `work_days`).
4. **Solicitudes**: busca la request del día (`replenishment_requests`) y renderiza sus items (`replenishment_items`) con packs calculados.
5. **Personal**: carga convocatorias (`staff_convocations`), calcula total convocado y confirmados, y muestra lista ordenada por estado.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Operativo > Workday

### 2.2 Flujo Principal

**PASSLINE:**
1. Usuario despliega la fila "PASSLINE".
2. Visualiza 5 accesos externos y puede abrir cada link público.

**Solicitudes Operativas (Panel Izquierdo):**
1. Usuario ingresa a la pantalla.
2. Sistema identifica la jornada activa y la request del día.
3. Se listan items con **packs a solicitar** calculados automáticamente.
4. Al seleccionar una fila, se redirige a `operativo-solicitudes`.

**Estado de Personal (Panel Derecho):**
1. Sistema carga convocatorias de la jornada activa.
2. Muestra comparativa **Convocados vs Confirmados**.
3. Lista personal con su rol y estado.

### 2.3 Inputs y Acciones Clave
- **Breadcrumbs**: link a `operativo-index`.
- **PASSLINE**: links externos (placeholderpassline.com).
- **Solicitudes**: click en fila → `pages/operativo/operativo-solicitudes.html`.

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `work_days`, `replenishment_requests`, `replenishment_items`, `master_sku` | status, operational_date, request_id, requested_packs, quantity_requested, pack_qty |
| **Lectura** | `staff_convocations`, `profiles`, `master_staff_roles` | work_day_id, status, full_name, role_id |

### 3.2 Lógica de Negocio
- **Jornada activa**: si no hay `status = 'open'`, muestra estado vacío.
- **Packs solicitados**:
  - Usa `requested_packs` si existe.
  - Si no, calcula `ceil(quantity_requested / pack_qty)`.
- **Comparativa staff**: confirma estados `confirmed`, `present`, `accepted` vs total convocado.

### 3.3 Endpoints/API
Operaciones Supabase:
- `work_days`: SELECT (status = 'open')
- `replenishment_requests`: SELECT (operational_date + user_id)
- `replenishment_items`: SELECT (request_id + master_sku)
- `staff_convocations`: SELECT (work_day_id)
- `profiles`, `master_staff_roles`: SELECT (join para nombre y rol)

---

## 4. Componentes UI

### 4.1 Estructura
- **Topbar**: breadcrumbs con separadores `|`.
- **PASSLINE**: acordeón con links externos.
- **Panel Izquierdo**: tabla con items y packs.
- **Panel Derecho**: resumen convocado/confirmado + lista de staff.

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial | "Cargando..." en tablas/listas |
| **No Active Workday** | Sin jornada abierta | Mensaje informativo |
| **Empty Requests** | Sin items | "No hay solicitudes pendientes" |
| **Empty Staff** | Sin convocatorias | "No hay personal convocado" |
| **Loaded** | Data disponible | Tabla/lista renderizada |

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js`
- `core/utils.js`
- `core/navigation.js`

### 5.2 Módulos
- `modules/work-day-helper.js`
- `modules/operativo/operativo-workday.js`

### 5.3 Dependencias entre Módulos
- **Consume**: `operativo-solicitudes` (navegación directa)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `operativo` y `staff_barra`
- [x] Validación con `Auth.guardOrRedirect()`

### 6.2 Validaciones de Datos
- [x] Verificación de cliente Supabase con `Utils.assertSbOrShowBlockingError()`
- [x] Cálculo seguro de packs con fallback a pack_qty = 1

### 6.3 Manejo de Errores
- Errores de carga se muestran con mensaje genérico en tabla/lista
- Estados vacíos informativos para jornada sin abrir o sin datos

---

## 7. Testing y Verificación

### 7.1 Escenarios de Prueba
- [x] Jornada abierta con solicitudes y staff
- [x] Jornada abierta sin solicitudes
- [x] Jornada abierta sin staff
- [x] Sin jornada activa (mensajes vacíos)
- [x] Navegación a `operativo-solicitudes` al click de fila
- [x] Links PASSLINE abren en nueva pestaña
