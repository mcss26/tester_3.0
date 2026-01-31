# Encargado Caja Personal

> **Rol**: Encargado
> **Ruta**: `pages/encargados/encargado-caja-personal.html`
> **JS**: `assets/js/modules/encargados/encargado-caja-personal.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Encargado de Caja** (`encargado_caja`) o **Admin**.

### 1.2 ¿Qué hace?
Gestión integral de personal de caja:
- **Convocatorias**: Planificación y seguimiento de staff para jornadas específicas
- **Nómina**: Listado y administración del equipo de caja disponible

### 1.3 ¿Cómo lo hace?
1. **Sistema de Tabs**: Alterna entre vistas Convocatorias/Nómina
2. **Selector de Jornada**: Filtra datos por fecha de trabajo
3. **Panel CRUD**: SlidePanel estándar para creación de staff
4. **Modal de Confirmación**: Reemplaza diálogos nativos del navegador

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Encargados > Cajas > Personal

### 2.2 Flujo Principal - Convocatorias
1. Seleccionar jornada desde dropdown
2. Ver resumen de requerimientos vs cubiertos
3. Buscar staff en lista filtrada
4. Click "Convocar" → Modal de confirmación de rol
5. Staff aparece con estado "pending"
6. Confirmar asistencia manualmente si necesario

### 2.3 Flujo Principal - Nómina
1. Click tab "Nómina (Staff)"
2. Ver lista de staff de caja activo
3. Buscar por nombre
4. Click "+ Nuevo" → SlidePanel
5. Completar formulario y guardar

### 2.4 Estados de la UI

| Estado | Trigger | Componente |
|:-------|:--------|:-----------|
| **Loading** | Carga inicial | `#page-card-loading.is-visible` |
| **Empty** | Sin jornada seleccionada | `#page-card-empty.is-visible` |
| **Content** | Datos cargados | `#module-content` visible |

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `work_days`, `profiles`, `work_day_staff_planning`, `staff_convocations`, `master_staff_roles` | id, status, work_date, full_name, role, quantity |
| **Escritura** | `staff_convocations`, `profiles` | work_day_id, user_id, role_id, status |

### 3.2 Lógica de Negocio
- Filtra staff solo con rol `%staff_caja%`
- Filtra requerimientos que incluyan "caja" o "ticket" en nombre
- Calcula porcentaje de cobertura (convocados/requeridos)
- Estados de convocatoria: `pending`, `confirmed`, `rejected`

### 3.3 Patrón de Código
- **IIFE async** para encapsulación total
- **Objeto `ui`** con todas las referencias DOM agrupadas
- **Objeto `state`** para datos reactivos
- **`setPageState()`** para gestión de estados loading/empty/content
- **Modal de confirmación** en lugar de `confirm()` nativo
- **Búsqueda debounced** con `window.Utils.debounce()`

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` estándar
- **Topbar**: Simple con navegación Personal/Noche
- **Tabs**: `.tab-bar` con `.tab-chip`
- **FilterBar**: Selector de jornada + status pill
- **StaffList**: Cards de staff con acciones
- **TableShell**: Tabla sticky para nómina

### 4.2 Overlays
- **SlidePanel** (`#staff-panel`): Formulario nuevo staff
- **ConfirmModal** (`#confirmModal`): Confirmaciones

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js`
- `core/utils.js`
- `core/toast.js`

### 5.2 Módulos
- `modules/index-navigation.js`
- `modules/encargados/encargado-caja-personal.js`

---

## 6. Historial de Cambios

| Fecha | Autor | Descripción |
|:------|:------|:------------|
| 2026-01-29 | Claude Code | Refactorización mayor: patrón IIFE async, eliminación pseudo-Tailwind, modales estándar |
| 2026-01-28 | Antigravity AI | Creación inicial |
