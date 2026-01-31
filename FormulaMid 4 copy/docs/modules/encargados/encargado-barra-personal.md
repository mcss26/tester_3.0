# Encargado Barra - Gestión de Personal

> **Ruta**: `pages/encargados/encargado-barra-personal.html`
> **Roles**: Encargado Barra, Admin
> **Última Actualización**: 2026-01-29

## Objetivo Operativo

Gestionar el staff de barra para una jornada específica, permitiendo convocar personal planificado, registrar asistencia manual (nomina) y dar de alta nuevos miembros de staff.

## Flujo Principal (Workflows)

### 1. Gestión de Convocatorias
1. El usuario selecciona una jornada activa (planning u open).
2. El sistema muestra la dotación requerida vs convocados (KPI de cobertura).
3. El usuario selecciona un miembro del staff de la lista.
4. Se abre un modal de selección de rol.
5. Al confirmar, se inserta/actualiza un registro en `staff_convocations`.

### 2. Gestión de Nómina
1. El usuario cambia a la pestaña "Nómina".
2. El sistema lista todos los perfiles con rol de staff.
3. El usuario puede buscar por nombre/teléfono.
4. El usuario puede "Forzar Asistencia" (confirmación mediante modal), lo que valida la presencia del staff en la jornada actual.

### 3. Registro de Nuevo Staff
1. El usuario pulsa el botón `+`.
2. Se abre un panel lateral (`slide-panel`).
3. El usuario ingresa datos básicos (Nombre, Email, Tel).
4. El sistema crea el perfil en `profiles` con rol `staff`.

## Modelo de Datos

| Operación | Tablas / Vistas |
|:----------|:---|
| **Lectura** | `work_days`, `profiles` (staff), `staff_convocations`, `work_day_staff_planning`, `master_staff_roles` |
| **Escritura** | `staff_convocations`, `profiles` |

## Dependencias Técnicas

- **Scripts Core**: `core/config.js`, `core/supabase-client.js`, `core/auth.js`, `core/utils.js`, `core/toast.js`
- **Módulos**: `index-navigation.js`, `encargados/encargado-barra-personal.js`
- **Componentes UI**: `app-shell`, `page-card-wrap`, `modal-overlay`, `slide-panel`
