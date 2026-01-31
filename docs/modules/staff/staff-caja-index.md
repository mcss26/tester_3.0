# Terminal de Cajero (Staff)

**Ruta**: `pages/staff/staff-caja-index.html`
**Roles**: `staff_caja`, `operativo`, `admin`

## Objetivo Operativo

Interfaz de trabajo para el cajero durante su turno. Permite confirmar asistencia, elegir terminal de trabajo, recibir retiros y realizar la declaración jurada de cierre.

## Flujo Principal

1.  **Convocatoria**: Confirmación de asistencia si el staff tiene un llamado pendiente para el día.
2.  **Selección de Terminal**: El cajero elige en qué punto de venta operará (si no ha sido pre-asignado).
3.  **Operación**:
    - Recepción de **Fondos** y **Retiros**: El sistema alerta sobre retiros solicitados por el encargado; el cajero debe confirmarlos para validar el egreso.
4.  **Cierre de Turno**:
    - Declaración de **Total Efectivo**.
    - Declaración de **Total Zoco/QR**.
    - El turno se cierra y la terminal queda disponible para conciliación por administración.

## Modelo de Datos

**Lectura**:

- `staff_convocations`: Confirmación de trabajo.
- `cash_terminals`: Selección de equipo de trabajo.

**Escritura**:

- `cash_terminal_sessions`: Creación de la sesión de trabajo.
- `cash_movements`: Registro de la declaración final de efectivo y activos digitales.

## Dependencias Técnicas

- `assets/js/modules/staff/staff-caja-index.js`: Lógica de validación de cierres y flujo de pasos (Wizard).
