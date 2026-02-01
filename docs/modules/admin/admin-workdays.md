# Admin Workdays (Planner ZBB & Centro de Comando)

> **Ruta**: `pages/admin/admin-workdays.html`
> **Roles**: Admin, Contable
> **Estándar**: logic-engineer (2026)
> **Última Actualización**: 2026-02-01

## Objetivo Operativo

Transformado de un simple listado a un **Dashboard ZBB (Zero-Based Budgeting)**, este módulo permite planificar la operación completa antes de abrir la jornada. Sus objetivos son:
1.  **Presupuestar** dotación (Staff) y costos fijos (Apertura) para calcular el Break-even.
2.  **Integrar** costos automáticamente con el módulo de Finanzas (`accounts_payable`).
3.  **Gestionar** solicitudes de reposición pendientes antes de operar.
4.  **Vincular** eventos del calendario y configurar el countdown público.

## Interfaz: El Dashboard de 4 Paneles

La UI se divide en 4 secciones lógicas para una planificación integral:

1.  **Panel A (Evento)**: Definición de fecha, vínculo con eventos (`events`) y nivel de demanda.
2.  **Panel B (Staff)**: Dimensionamiento de personal. Calcula costo de nómina en tiempo real basado en `base_rate`.
3.  **Panel C (Costos)**: Costos de apertura (Hielo, Seguridad, Limpieza, etc.) configurables por jornada.
4.  **Panel D (Solicitudes)**: Gestión visual de solicitudes de reposición (`replenishment_requests`) pendientes.

## Flujo Principal (Workflows)

### 1. Planificación ZBB
1.  **Definición**: Admin selecciona fecha y evento.
2.  **Presupuesto**: Configura cantidad de staff (Panel B) y ajusta costos de apertura (Panel C).
3.  **Validación**: Observa los KPIs en el header (Costo Staff, Costo Fijo, Total Break-even).
4.  **Revisión**: Verifica solicitudes de stock en Panel D y hace click para ver detalle si es necesario.
5.  **Confirmación**:
    - Se crea la jornada en `work_days`.
    - Se inserta el detalle de staff en `work_day_staff_planning`.
    - **NUEVO**: Se generan deudas en `accounts_payable` (Source: `opening_cost`).
    - **NUEVO**: Se abre la caja automáticamente (`cash_closings`).

### 2. Apertura de Jornada
El sistema intenta ejecutar el RPC oficial `rpc_open_work_day`. Si falla (por permisos o inexistencia), utiliza un **Fallback Automático** que actualiza el estado directamente via SQL client, asegurando la operatividad.

## Modelo de Datos

| Operación | Tablas / Funciones | Descripción |
|:----------|:-------------------|:------------|
| **Lectura** | `work_days` | Historial |
| **Lectura** | `master_staff_roles` | Panel B: Cargos y tarifas |
| **Lectura** | `finance_opening_cost_defs` | Panel C: Costos default |
| **Lectura** | `replenishment_requests` | Panel D: Solicitudes pendientes |
| **Escritura** | `work_days` | Insertar nueva jornada |
| **Escritura** | `work_day_staff_planning` | Guardar plan de staff |
| **Escritura** | `accounts_payable` | **Integración**: Generación de deudas |
| **Escritura** | `cash_closings` | **Integración**: Apertura de caja |

## Bugs Corregidos & Mejoras (v2.0)

- **Modal Eventos**: Eliminado campo `event_time` del insert para compatibilidad con esquema.
- **Resiliencia**: Fallback automático si `rpc_open_work_day` falla.
- **Optimizaciones**: Carga de datos paralela (`Promise.all`) para los 4 paneles.
