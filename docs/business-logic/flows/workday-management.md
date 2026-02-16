# Flujo de Negocio: Gestión de Jornadas de Trabajo (Workday)

**ID de Flujo:** `workday-management`
**Prioridad:** Alta
**Actores Principales:** `admin`, `contable`
**Punto de Entrada Principal:** `pages/admin/admin-workdays.html`

---

## Resumen

Este flujo describe el ciclo de vida completo de una "jornada de trabajo" (Workday) en el sistema. Es el proceso central que abarca desde la planificación de recursos y costos, pasando por la operación en tiempo real durante la noche, hasta el cierre contable y la generación de reportes de rentabilidad. El flujo está implementado como una máquina de estados finitos que asegura la integridad de los datos en cada etapa.

---

## Máquina de Estados del Workday

El `Workday` progresa a través de cuatro estados principales. Las transiciones son manejadas por funciones RPC en la base de datos para garantizar la seguridad y la lógica de negocio.

1.  **`DRAFT` (Borrador):**
    *   **Contexto:** La jornada existe solo como un plan.
    *   **Acciones:** El administrador puede seleccionar una fecha, definir qué personal es necesario (`work_day_staff_planning`), asignar costos de apertura (`finance_payments`) y guardar la configuración como una plantilla (`work_day_templates`).
    *   **UI:** Pestaña "Planner".

2.  **`PLANNED` (Planificado):**
    *   **Transición:** Se llega a este estado al ejecutar la función `rpc_confirm_work_day`.
    *   **Acciones:** El plan se confirma. Se pueden enviar convocatorias formales al personal (`staff_convocations`).
    *   **UI:** Pestaña "Planner" (bloqueada para edición mayor).

3.  **`ACTIVE` (Activo / En Vivo):**
    *   **Transición:** Se activa mediante `rpc_open_work_day`.
    *   **Acciones:** La jornada está en curso. Se habilita la operación en tiempo real. Un proceso de sondeo (`polling`) comienza a consultar datos en vivo.
    *   **UI:** Se habilita la pestaña "Night Chief", que actúa como el panel de control operativo.

4.  **`CLOSED` (Cerrado):**
    *   **Transición:** Se cierra con la función `rpc_close_work_day`.
    *   **Acciones:** La operación ha finalizado. Se calculan y guardan todos los datos finales, incluyendo la nómina (`staff_accruals`), las variaciones de stock y un puntaje de salud (`health_score`) de la jornada.
    *   **UI:** La pestaña "Report" se convierte en la vista principal, mostrando un análisis detallado de Profit & Loss (P&L).

---

## Secuencia de Operaciones Detallada

1.  **Planificación (`DRAFT`):**
    *   Un admin navega a `admin-workdays.html`.
    *   Selecciona una fecha.
    *   Dimensiona el personal y los costos asociados.
    *   Confirma el plan, llamando a `rpc_confirm_work_day`.

2.  **Activación (`PLANNED` → `ACTIVE`):**
    *   Al inicio de la jornada, un admin o encargado hace clic en "Abrir Jornada", ejecutando `rpc_open_work_day`.
    *   El sistema desbloquea el panel "Night Chief".

3.  **Reconciliación en Vivo (`ACTIVE`):**
    *   Durante la noche, el "Jefe de Noche" (Night Chief) utiliza su panel.
    *   Se dispara la función `GbolService.syncNight()`. Esta es una operación crítica que:
        1.  Se conecta con el sistema de Punto de Venta externo (GBOL).
        2.  Trae los datos de ventas y los guarda en tablas temporales (`import_*`).
        3.  La función `populateSystemAmounts` procesa estos datos y los agrega en `closing_terminals`. Esto representa el lado "Sistema" de la reconciliación financiera.
    *   El personal de caja introduce manualmente los montos declarados (efectivo, tarjetas), que se comparan con las cifras del "Sistema".

4.  **Auditorías y Nómina (`ACTIVE`):**
    *   Hacia el final de la noche, se ejecuta el RPC `admin_generate_workday_accruals` para calcular y crear los registros de pago para el personal en `staff_accruals`.
    *   Se realiza la auditoría de stock, comparando el consumo teórico (`vw_consumo_teorico`) con el conteo físico. Las diferencias se reflejan en `vw_bar_audit_variance`.

5.  **Cierre (`ACTIVE` → `CLOSED`):**
    *   El encargado ejecuta `rpc_close_work_day`.
    *   Esta función finaliza todos los cálculos, actualiza el estado del `work_days` y `cash_closings`, y genera el `health_score`.

6.  **Reportería (`CLOSED`):**
    *   Una vez cerrada, la jornada se analiza a través de la pestaña "Report".
    *   Los gráficos y KPIs de esta vista se alimentan principalmente de las vistas de base de datos `vw_workday_pnl` y `vw_night_snapshot`.

---

## Componentes Técnicos Clave

| Componente                                       | Tipo                | Responsabilidad                                                                                                                             |
| ------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/admin/admin-workdays.html`                | Archivo HTML        | Punto de entrada y estructura de la UI (Planner, Night Chief, Report). Define los roles permitidos (`admin`, `contable`).                   |
| `assets/js/modules/admin/admin-workdays.js`      | Archivo JavaScript  | **Corazón del flujo.** Contiene la lógica de la UI, la máquina de estados, y orquesta todas las llamadas a la base de datos y servicios.      |
| `assets/js/core/gbol-service.js`                 | Archivo JavaScript  | Fachada para la integración con el TPV externo (GBOL). Maneja la sincronización de datos financieros para la reconciliación.               |
| `work_days`                                      | Tabla (Supabase)    | La tabla central que contiene el registro principal para cada jornada y su estado actual.                                                   |
| `cash_closings`                                  | Tabla (Supabase)    | Almacena los resultados de los cierres de caja, incluyendo montos declarados vs. sistema.                                                  |
| `staff_accruals`                                 | Tabla (Supabase)    | Almacena los registros de nómina generados para el personal en una jornada específica.                                                      |
| `rpc_open_work_day`, `rpc_close_work_day`        | Función RPC (DB)    | Funciones seguras que manejan las transiciones críticas de estado del Workday, conteniendo la lógica de negocio que no debe vivir en el cliente. |
| `vw_workday_pnl`, `vw_night_snapshot`            | Vista (Supabase)    | Vistas complejas que agregan datos de múltiples tablas para alimentar los dashboards de reportería de forma eficiente.                      |
