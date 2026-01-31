# Admin Workdays (Gestión de Jornadas)

> **Ruta**: `pages/admin/admin-workdays.html`
> **Roles**: Admin, Contable
> **Última Actualización**: 2026-01-29

## Objetivo Operativo

Este módulo permite la gestión centralizada de las jornadas laborales ("Work Days") del establecimiento. Es el punto de partida para el ciclo operativo diario, permitiendo:
1.  **Planificar** futuras jornadas y definir la dotación (staff) y presupuesto estimado.
2.  **Abrir** la jornada operativa actual, habilitando el registro de asistencia, movimientos de caja y ventas.
3.  **Cerrar** la jornada, bloqueando operaciones y finalizando el ciclo fiscal del día.
4.  Visualizar el estado de cobertura de staff (Planificado vs Confirmado).

## Flujo Principal (Workflows)

### 1. Planificación de Jornada
1.  Usuario hace click en "+ Nueva Fecha".
2.  Se abre un panel lateral ("Slide Panel").
3.  Usuario selecciona fecha y carga notas.
4.  Sistema muestra cargos activos y tarifa base.
5.  Usuario ingresa cantidad requerida por cargo (Planning).
6.  Sistema calcula presupuesto estimado en tiempo real.
7.  Usuario confirma "Guardar Planificación".
8.  Sistema registra la jornada en estado `planning` y el detalle en `work_day_staff_planning`.

### 2. Apertura de Jornada
1.  En el listado, usuario identifica una jornada "PLANIFICADA".
2.  Hace click en "ABRIR".
3.  Sistema solicita confirmación (Modal).
4.  Sistema ejecuta RPC `rpc_open_work_day`:
    - Cambia estado a `open`.
    - Realiza validaciones de unicidad (solo una abierta a la vez).
5.  La jornada pasa a estado "EN CURSO".

### 3. Cierre de Jornada
1.  Usuario identifica la jornada "EN CURSO".
2.  Hace click en "CERRAR".
3.  Sistema solicita confirmación (Modal).
4.  Sistema ejecuta RPC `rpc_close_work_day`:
    - Cambia estado a `closed`.
    - Congela operaciones dependientes.

## Modelo de Datos

| Operación | Tablas / Funciones | Descripción |
|:----------|:-------------------|:------------|
| **Lectura** | `work_days` | Listado principal |
| **Lectura** | `master_staff_roles` | Cargos para planificación |
| **Lectura** | `work_day_attendance` | Vía Helper, para stats de cobertura |
| **Escritura** | `work_days` | Insertar nueva planificación |
| **Escritura** | `work_day_staff_planning` | Detalle de dotación requerida |
| **RPC** | `rpc_open_work_day` | Lógica negocio apertura |
| **RPC** | `rpc_close_work_day` | Lógica negocio cierre |

## Dependencias Técnicas

### Scripts
- `assets/js/modules/admin/admin-workdays.js`: Lógica principal (IIFE pattern).
- `assets/js/modules/work-day-helper.js`: Helpers de datos y formateo.
- `assets/js/core/auth.js`: Guard de seguridad.
- `assets/js/core/utils.js`: Utilidades DOM y validaciones.

### Componentes UI
- **Confirm Modal**: `#confirmModal` para acciones críticas.
- **Slide Panel**: `window.initSlidePanel` para formulario de planificación.
- **Toast**: Feedback de usuario (`window.Toast`).

## Validaciones de Negocio
- **Unicidad de Apertura**: Solo puede existir una jornada en estado `open` simultáneamente.
- **Integridad de Cierre**: No se puede reabrir una jornada cerrada (desde esta UI).
- **Roles**: Solo roles con permiso (`admin`, `contable`) pueden gestionar jornadas.
