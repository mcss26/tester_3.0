# Midnight Workflows — FormulaMid 4

> **Consolidado:** 2026-02-22
> **Contenido:** 4 flujos operativos fusionados (synthesis + workday + cash-closing + bar-manager)

---
## §1 — Visión Estratégica: Lógica de Negocio

---

## 1. VisiÃ³n EstratÃ©gica: El Ecosistema de Control

El objetivo principal del sistema no es simplemente registrar datos, sino **optimizar la operaciÃ³n a travÃ©s de un ecosistema de control con datos confiables y accionables**. El sistema debe concentrar, normalizar y cerrar cada jornada con total trazabilidad para permitir una auditorÃ­a rÃ¡pida y la toma de decisiones.

- **Consumidor Principal:** Rol de `admin`.
- **Datos CrÃ­ticos:** DesvÃ­o de caja, auditorÃ­a de stock y reporte de pÃ©rdidas/errores.

El sistema conecta herramientas de **prevenciÃ³n** (Calculadora de Precios, Stock Ideal) con mecanismos de **detecciÃ³n** (AuditorÃ­a de Flujos) para atacar las causas raÃ­z de las inconsistencias y no solo sus sÃ­ntomas.

---

## 2. El `Workday` como Contenedor Operativo Central

El `Workday` es la entidad que aglutina toda la actividad de una jornada. Su ciclo de vida (`DRAFT` â†’ `PLANNED` â†’ `ACTIVE` â†’ `CLOSED`) actÃºa como el proceso maestro que orquesta los demÃ¡s flujos.

### Diagrama Conceptual del Flujo de Datos

```mermaid
graph TD
    subgraph "Fase de PlanificaciÃ³n (Admin)"
        A[Admin: Define Plan de Staff] --> W[Workday: DRAFT/PLANNED];
    end

    subgraph "Fase de OperaciÃ³n (Encargados)"
        W -- "ID de Jornada" --> B[Flujo de Barra];
        W -- "ID de Jornada" --> C[Flujo de Caja];
        W -- "ID de Jornada" --> V[Flujo de ValidaciÃ³n QR];
    end

    subgraph "Fuentes de Datos Externas"
        G[Sistema POS: GBOL]
        Z[Procesador de Pago: Zoco]
        P[Tickets: Passline]
    end

    subgraph "MÃ³dulos de RecolecciÃ³n de Datos"
        B -- "Crea/Actualiza" --> BS[bar_sessions];
        B -- "Crea/Actualiza" --> BSS[bar_stock_snapshots];
        C -- "Crea/Actualiza" --> CT[closing_terminals];
        C -- "Crea/Actualiza" --> CC[cash_closings];
        V -- "Input de datos" --> W;
    end
    
    subgraph "Fase de Cierre y AuditorÃ­a (Admin)"
        W -- "Pasa a estado: CLOSED" --> R[Reporte Final de Workday];
        G -- "Sincroniza Ventas" --> CT;
        Z -- "ConciliaciÃ³n AsÃ­ncrona" --> R;
        P -- "Valida Accesos" --> V;
    end

    BSS --> R;
    CC --> R;
```

---

## 3. Ciclos de Vida de las Entidades Clave

### 3.1. Ciclo de Vida del Personal (Staffing)

El sistema gestiona el personal desde la demanda hasta el pago.

1.  **Demanda (Planner):** En el `Workday Planner`, el `admin` define la **dotaciÃ³n** necesaria por rol/Ã¡rea (ej: "3 bartenders"). Se guarda en `staff_plan`.
2.  **AsignaciÃ³n (Encargados):** Los encargados de Ã¡rea reciben esta demanda y convocan al personal, asignando **personas concretas** de su nÃ³mina. Se registra en `staff_convocations` y `staff_assignments`.
3.  **Devengado (NÃ³mina):** Al cierre, el sistema calcula el pago por rol basÃ¡ndose en un `Tarifario` centralizado, generando los registros en `staff_accruals`.

### 3.2. Ciclo de Vida Financiero (Cash Closing)

La reconciliaciÃ³n de caja es un proceso de dos fases para manejar la asincronÃ­a de los proveedores de pago.

1.  **Cierre Preliminar (Noche):**
    -   El `encargado de caja` registra los montos **declarados** manualmente (efectivo, Zoco manual).
    -   El `admin` sincroniza los datos del POS (GBOL) para obtener los montos del **sistema**.
    -   Ambos valores (`declared_*` y `system_*`) se guardan en `closing_terminals`. El estado es `pending`.
2.  **Cierre Definitivo (Semanal):**
    -   DÃ­as despuÃ©s (ej. lunes), llega el reporte oficial de Zoco.
    -   Un proceso de `Balance Semanal` cruza el preliminar contra el oficial.
    -   El estado cambia a `matched`, `mismatch`, o `resolved`.

### 3.3. Ciclo de Vida del Inventario (Stock)

El control de stock es fundamental para la auditorÃ­a de costos.

1.  **Apertura de SesiÃ³n:** El stock inicial de una sesiÃ³n de barra se basa en: `Cierre de la SesiÃ³n Anterior + Reposiciones Intermedias`.
2.  **Cierre de SesiÃ³n:** Se registra el stock fÃ­sico final.
3.  **AuditorÃ­a:** El sistema compara el **Consumo Real** (`Apertura - Cierre`) con el **Consumo TeÃ³rico** (calculado por las recetas de los productos vendidos en el POS).

---

## 4. Gaps de Control y Reglas de Negocio a Implementar

La combinaciÃ³n de los anÃ¡lisis de cÃ³digo y los documentos estratÃ©gicos revela los siguientes puntos crÃ­ticos a modelar en el sistema:

| Gap / Punto CrÃ­tico                                    | Regla de Negocio a Implementar                                                                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Consumos "Sin Cargo" / Bonificaciones**             | Todo producto sin cargo debe emitirse con un **ticket nominativo** que incluya `motivo` y `responsable`. Se debe auditar un reporte diario de estos tickets y su impacto en el costo.          |
| **2. DesvÃ­os de Caja**                                   | Una diferencia entre el monto declarado y el del sistema **debe crear un "Evento de AuditorÃ­a"**. Este evento debe requerir un `comentario obligatorio` y permanecer abierto hasta su resoluciÃ³n. |
| **3. Trazabilidad de la Apertura de Stock**              | La "precarga" de stock en la apertura de barra debe ser justificable. Es necesario un **registro o ledger de reposiciones intermedias** para explicar cualquier diferencia con el cierre anterior. |
| **4. AsincronÃ­a de Canales de Pago**                     | El sistema debe manejar estados de conciliaciÃ³n (`pending`, `matched`, `mismatch`). El cierre nocturno es **preliminar**; la conciliaciÃ³n final puede ocurrir dÃ­as despuÃ©s.                   |
| **5. Ranking de Productos CrÃ­ticos**                     | El sistema debe poder rankear productos por un **Score Compuesto** (Valor 50%, RotaciÃ³n 30%, Riesgo 20%) para enfocar los esfuerzos de control en el "Top 15".                               |
| **6. CÃ¡lculo de Precios de Venta**                       | Los precios deben calcularse con **"ingenierÃ­a inversa"**, partiendo de un `margen neto objetivo` y despejando el precio final tras aplicar costos de canal e impuestos.                 |
| **7. Control de Accesos (ValidaciÃ³n QR)**                | La validaciÃ³n de tickets (ej. Passline) debe ser tratada como un **flujo de datos de primera clase** dentro del `Workday`, registrando conteos y anomalÃ­as.                                   |

---

## 5. Alcance y Prioridades para VersiÃ³n 1.0

- **Foco Principal:** Cierres de jornada consistentes, auditables y rÃ¡pidos.
- **Fuera de Alcance 1.0:** Alertas en tiempo real (ya cubiertas por GBOL).
- **Resultado Clave:** Proveer al `admin` un reporte de cierre accionable que exponga desvÃ­os y permita una auditorÃ­a eficiente sin depender de herramientas externas.

---

## §2 — Gestión de Jornadas de Trabajo (Workday)

**ID de Flujo:** `workday-management`
**Prioridad:** Alta
**Actores Principales:** `admin`, `contable`
**Punto de Entrada Principal:** `pages/admin/admin-workdays.html`

---

## Resumen

Este flujo describe el ciclo de vida completo de una "jornada de trabajo" (Workday) en el sistema. Es el proceso central que abarca desde la planificaciÃ³n de recursos y costos, pasando por la operaciÃ³n en tiempo real durante la noche, hasta el cierre contable y la generaciÃ³n de reportes de rentabilidad. El flujo estÃ¡ implementado como una mÃ¡quina de estados finitos que asegura la integridad de los datos en cada etapa.

---

## MÃ¡quina de Estados del Workday

El `Workday` progresa a travÃ©s de cuatro estados principales. Las transiciones son manejadas por funciones RPC en la base de datos para garantizar la seguridad y la lÃ³gica de negocio.

1.  **`DRAFT` (Borrador):**
    *   **Contexto:** La jornada existe solo como un plan.
    *   **Acciones:** El administrador puede seleccionar una fecha, definir quÃ© personal es necesario (`work_day_staff_planning`), asignar costos de apertura (`finance_payments`) y guardar la configuraciÃ³n como una plantilla (`work_day_templates`).
    *   **UI:** PestaÃ±a "Planner".

2.  **`PLANNED` (Planificado):**
    *   **TransiciÃ³n:** Se llega a este estado al ejecutar la funciÃ³n `rpc_confirm_work_day`.
    *   **Acciones:** El plan se confirma. Se pueden enviar convocatorias formales al personal (`staff_convocations`).
    *   **UI:** PestaÃ±a "Planner" (bloqueada para ediciÃ³n mayor).

3.  **`ACTIVE` (Activo / En Vivo):**
    *   **TransiciÃ³n:** Se activa mediante `rpc_open_work_day`.
    *   **Acciones:** La jornada estÃ¡ en curso. Se habilita la operaciÃ³n en tiempo real. Un proceso de sondeo (`polling`) comienza a consultar datos en vivo.
    *   **UI:** Se habilita la pestaÃ±a "Night Chief", que actÃºa como el panel de control operativo.

4.  **`CLOSED` (Cerrado):**
    *   **TransiciÃ³n:** Se cierra con la funciÃ³n `rpc_close_work_day`.
    *   **Acciones:** La operaciÃ³n ha finalizado. Se calculan y guardan todos los datos finales, incluyendo la nÃ³mina (`staff_accruals`), las variaciones de stock y un puntaje de salud (`health_score`) de la jornada.
    *   **UI:** La pestaÃ±a "Report" se convierte en la vista principal, mostrando un anÃ¡lisis detallado de Profit & Loss (P&L).

---

## Secuencia de Operaciones Detallada

1.  **PlanificaciÃ³n (`DRAFT`):**
    *   Un admin navega a `admin-workdays.html`.
    *   Selecciona una fecha.
    *   Dimensiona el personal y los costos asociados.
    *   Confirma el plan, llamando a `rpc_confirm_work_day`.

2.  **ActivaciÃ³n (`PLANNED` â†’ `ACTIVE`):**
    *   Al inicio de la jornada, un admin o encargado hace clic en "Abrir Jornada", ejecutando `rpc_open_work_day`.
    *   El sistema desbloquea el panel "Night Chief".

3.  **ReconciliaciÃ³n en Vivo (`ACTIVE`):**
    *   Durante la noche, el "Jefe de Noche" (Night Chief) utiliza su panel.
    *   Se dispara la funciÃ³n `GbolService.syncNight()`. Esta es una operaciÃ³n crÃ­tica que:
        1.  Se conecta con el sistema de Punto de Venta externo (GBOL).
        2.  Trae los datos de ventas y los guarda en tablas temporales (`import_*`).
        3.  La funciÃ³n `populateSystemAmounts` procesa estos datos y los agrega en `closing_terminals`. Esto representa el lado "Sistema" de la reconciliaciÃ³n financiera.
    *   El personal de caja introduce manualmente los montos declarados (efectivo, tarjetas), que se comparan con las cifras del "Sistema".

4.  **AuditorÃ­as y NÃ³mina (`ACTIVE`):**
    *   Hacia el final de la noche, se ejecuta el RPC `admin_generate_workday_accruals` para calcular y crear los registros de pago para el personal en `staff_accruals`.
    *   Se realiza la auditorÃ­a de stock, comparando el consumo teÃ³rico (`vw_consumo_teorico`) con el conteo fÃ­sico. Las diferencias se reflejan en `vw_bar_audit_variance`.

5.  **Cierre (`ACTIVE` â†’ `CLOSED`):**
    *   El encargado ejecuta `rpc_close_work_day`.
    *   Esta funciÃ³n finaliza todos los cÃ¡lculos, actualiza el estado del `work_days` y `cash_closings`, y genera el `health_score`.

6.  **ReporterÃ­a (`CLOSED`):**
    *   Una vez cerrada, la jornada se analiza a travÃ©s de la pestaÃ±a "Report".
    *   Los grÃ¡ficos y KPIs de esta vista se alimentan principalmente de las vistas de base de datos `vw_workday_pnl` y `vw_night_snapshot`.

---

## Componentes TÃ©cnicos Clave

| Componente                                       | Tipo                | Responsabilidad                                                                                                                             |
| ------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/admin/admin-workdays.html`                | Archivo HTML        | Punto de entrada y estructura de la UI (Planner, Night Chief, Report). Define los roles permitidos (`admin`, `contable`).                   |
| `assets/js/modules/admin/admin-workdays.js`      | Archivo JavaScript  | **CorazÃ³n del flujo.** Contiene la lÃ³gica de la UI, la mÃ¡quina de estados, y orquesta todas las llamadas a la base de datos y servicios.      |
| `assets/js/core/gbol-service.js`                 | Archivo JavaScript  | Fachada para la integraciÃ³n con el TPV externo (GBOL). Maneja la sincronizaciÃ³n de datos financieros para la reconciliaciÃ³n.               |
| `work_days`                                      | Tabla (Supabase)    | La tabla central que contiene el registro principal para cada jornada y su estado actual.                                                   |
| `cash_closings`                                  | Tabla (Supabase)    | Almacena los resultados de los cierres de caja, incluyendo montos declarados vs. sistema.                                                  |
| `staff_accruals`                                 | Tabla (Supabase)    | Almacena los registros de nÃ³mina generados para el personal en una jornada especÃ­fica.                                                      |
| `rpc_open_work_day`, `rpc_close_work_day`        | FunciÃ³n RPC (DB)    | Funciones seguras que manejan las transiciones crÃ­ticas de estado del Workday, conteniendo la lÃ³gica de negocio que no debe vivir en el cliente. |
| `vw_workday_pnl`, `vw_night_snapshot`            | Vista (Supabase)    | Vistas complejas que agregan datos de mÃºltiples tablas para alimentar los dashboards de reporterÃ­a de forma eficiente.                      |

---

## §3 — Cierre de Caja Nocturno

**ID de Flujo:** `night-cash-closing`
**Prioridad:** Alta
**Actores Principales:** `encargado de caja`, `admin`
**Puntos de Entrada:** 
- `pages/encargados/encargado-caja-noche.html` (para el encargado)
- `pages/admin/admin-workdays.html` (para el administrador)

---

## Resumen

El Cierre de Caja Nocturno es un flujo de dos fases diseÃ±ado para separar la declaraciÃ³n de fondos del encargado de la reconciliaciÃ³n final del sistema. Esto crea un punto de control claro y un rastro de auditorÃ­a robusto. Primero, el Encargado de Caja declara el dinero y otros mÃ©todos de pago contados fÃ­sicamente. Segundo, un Administrador sincroniza los datos de ventas del sistema externo (GBOL) para comparar y finalizar el cierre.

---

## Fase 1: DeclaraciÃ³n del Encargado de Caja

Esta fase se centra en la responsabilidad del `encargado de caja`.

**Punto de Entrada:** `pages/encargados/encargado-caja-noche.html`
**LÃ³gica Principal:** `assets/js/modules/encargados/encargado-caja-noche.js`

### Secuencia de Operaciones:

1.  **Asegurar Cierre Existente:** Al cargar la pÃ¡gina, el script `ensureClosingExists` verifica si ya existe un registro en la tabla `cash_closings` para la jornada activa. Si no, lo crea.
2.  **Cierre por Terminal:** Para cada terminal de venta (POS):
    *   El encargado introduce los montos contados en el formulario (ej. `declared_cash`, `declared_zoco`).
    *   Al enviar, la funciÃ³n `submitCloseTerminal` actualiza la fila correspondiente en la tabla `closing_terminals`, llenando los campos `declared_*`. En este punto, los campos `system_*` permanecen en `0`.
3.  **Cierre de la Noche (Soft Close):**
    *   Una vez que todas las terminales estÃ¡n cerradas, el encargado hace clic en "Cerrar Noche".
    *   La funciÃ³n `submitCloseNight` actualiza el estado del registro principal en `cash_closings` y tambiÃ©n el estado del `work_days` a `closed`. Esto es un cierre "suave" o preliminar.

**Resultado de la Fase 1:** Todos los montos declarados por el personal de caja han sido registrados en la base de datos. El sistema estÃ¡ a la espera de los datos oficiales de ventas para la reconciliaciÃ³n.

---

## Fase 2: SincronizaciÃ³n y ReconciliaciÃ³n del Administrador

Esta fase es responsabilidad del rol `admin`, y tÃ­picamente se ejecuta desde un panel de control central.

**Punto de Entrada:** `pages/admin/admin-workdays.html` (o similar)
**LÃ³gica Principal:** `assets/js/core/gbol-service.js` orquestado por `assets/js/modules/admin/admin-workdays.js`.

### Secuencia de Operaciones:

1.  **Disparador de SincronizaciÃ³n:** Un administrador inicia el proceso de sincronizaciÃ³n, probablemente desde el panel de la jornada de trabajo (`admin-workdays.html`).
2.  **SincronizaciÃ³n con GBOL (`syncNight`):**
    *   Se invoca la funciÃ³n `GbolService.syncNight()`.
    *   Esta funciÃ³n se conecta a la API del sistema de ventas externo (GBOL) y descarga el informe de facturaciÃ³n del dÃ­a.
    *   Los datos brutos se insertan en una tabla de preparaciÃ³n (staging table) llamada `import_gbol_facturacion`.
3.  **PoblaciÃ³n de Montos del Sistema (`populateSystemAmounts`):**
    *   A continuaciÃ³n, se llama a `GbolService.populateSystemAmounts()`.
    *   Este mÃ©todo procesa los datos de la tabla `import_gbol_facturacion`.
    *   Calcula los totales por mÃ©todo de pago para cada terminal (ej. `system_cash`, `system_zoco`).
    *   Actualiza las mismas filas en `closing_terminals` que el encargado modificÃ³, pero esta vez llenando los campos `system_*`.

**Resultado de la Fase 2:** La tabla `closing_terminals` ahora contiene tanto los montos declarados (`declared_*`) como los montos reportados por el sistema (`system_*`). El sistema puede ahora calcular y mostrar las discrepancias.

---

## Componentes TÃ©cnicos Clave

| Componente                    | Tipo             | Responsabilidad                                                                                                            |
| ----------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `encargado-caja-noche.js`     | Archivo JS       | Maneja la lÃ³gica del cliente para la declaraciÃ³n de montos y el cierre suave de la noche.                                    |
| `gbol-service.js`             | Archivo JS       | **Componente crÃ­tico.** ActÃºa como la capa de servicio para el TPV externo, manejando la sincronizaciÃ³n y reconciliaciÃ³n de datos. |
| `admin-workdays.js`           | Archivo JS       | Orquesta el proceso de reconciliaciÃ³n llamando a los mÃ©todos del `gbol-service`.                                          |
| `cash_closings`               | Tabla (Supabase) | Tabla principal que representa el cierre financiero de una jornada completa.                                                |
| `closing_terminals`           | Tabla (Supabase) | **Tabla clave de reconciliaciÃ³n.** Contiene una fila por terminal, con columnas para `declared_*` y `system_*` para la comparaciÃ³n. |
| `import_gbol_facturacion`     | Tabla (Supabase) | Tabla temporal para almacenar los datos brutos de ventas traÃ­dos desde el sistema GBOL antes de ser procesados.            |
| `rpc_close_work_day`          | FunciÃ³n RPC (DB) | Una funciÃ³n mÃ¡s robusta, probablemente usada por el admin para realizar el cierre transaccional final de toda la jornada.       |

---

## §4 — Noche del Encargado de Barra

**ID de Flujo:** `bar-manager-night`
**Prioridad:** Media
**Actores Principales:** `encargado de barra`
**Punto de Entrada Principal:** `pages/encargados/encargado-barra-noche.html`

---

## Resumen

Este flujo define el proceso operativo para un `encargado de barra` durante su turno. El ciclo de vida completo de su sesiÃ³n (apertura, actividad, cierre) estÃ¡ rÃ­gidamente estructurado en torno a la toma de inventario. Todo el proceso depende de que exista una "Jornada de Trabajo" (`work_day`) activa en el sistema.

---

## Prerrequisito CrÃ­tico: Jornada de Trabajo Activa

Antes de que cualquier operaciÃ³n pueda comenzar, el sistema realiza una verificaciÃ³n fundamental a travÃ©s de `WorkDayHelper.getOpenWorkDay()`.

- **Si existe un `work_day` con `status = 'open'`:** El flujo puede continuar.
- **Si no existe un `work_day` activo:** La interfaz de usuario se bloquea y muestra un mensaje indicando al encargado que debe contactar a la administraciÃ³n para abrir la jornada.

---

## Ciclo de Vida de la SesiÃ³n de Barra

El flujo se gestiona como una mÃ¡quina de estados controlada desde el cliente (`encargado-barra-noche.js`) que interactÃºa directamente con la base de datos.

### 1. Apertura de SesiÃ³n

- **Contexto:** El encargado inicia su turno.
- **LÃ³gica Principal:** `executeOpenBar`
- **Proceso:**
    1.  El sistema presenta una lista de todos los productos (`master_sku`) para registrar el inventario inicial.
    2.  **Mecanismo de Precarga:** Para agilizar el conteo, los campos de stock inicial se rellenan automÃ¡ticamente (`precarga`) con los valores del **cierre de la Ãºltima sesiÃ³n de barra registrada**, sin importar a quÃ© jornada perteneciÃ³. Esta lÃ³gica reside en `fetchLastClosingStock`.
    3.  El encargado verifica y ajusta las cantidades.
    4.  Al confirmar, el sistema:
        -   Crea un nuevo registro en `bar_sessions` con `status='active'`, asociando la sesiÃ³n al `work_day` activo y al usuario.
        -   Guarda cada item del inventario inicial como un registro de tipo `opening` en la tabla `bar_stock_snapshots`.

### 2. SesiÃ³n Activa

- **Contexto:** El turno estÃ¡ en progreso.
- **UI:** La vista de apertura se oculta y se muestra un panel que indica que la sesiÃ³n estÃ¡ activa, mostrando la hora de inicio.
- **Acciones:** La Ãºnica acciÃ³n principal disponible en esta fase es iniciar el proceso de cierre del turno.

### 3. Cierre de SesiÃ³n

- **Contexto:** El encargado finaliza su turno.
- **LÃ³gica Principal:** `executeCloseBar`
- **Proceso:**
    1.  El sistema vuelve a presentar la lista completa de SKUs para que el encargado registre el inventario fÃ­sico final.
    2.  Al confirmar, el sistema:
        -   Guarda el inventario final como registros de tipo `closing` en la tabla `bar_stock_snapshots`.
        -   Actualiza el estado de la sesiÃ³n actual en `bar_sessions` a `status='closed'`.

---

## Modelo de Datos y Componentes TÃ©cnicos

Este flujo se caracteriza por una lÃ³gica del lado del cliente que interactÃºa directamente con las tablas de Supabase, sin usar Funciones Remotas (RPCs).

| Componente                | Tipo             | Responsabilidad                                                                                                                      |
| ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `encargado-barra-noche.js`| Archivo JS       | **CorazÃ³n del flujo.** Orquesta toda la lÃ³gica de la UI, el ciclo de vida de la sesiÃ³n y las operaciones de base de datos.               |
| `work-day-helper.js`      | Archivo JS       | Provee la funciÃ³n crÃ­tica `getOpenWorkDay()` que actÃºa como barrera de entrada para todo el proceso.                                   |
| `work_days`               | Tabla (Supabase) | Tabla maestra que define si el local estÃ¡ operativo. El flujo depende de un registro `open` aquÃ­.                                      |
| `master_sku`              | Tabla (Supabase) | La lista canÃ³nica de todos los productos que deben ser contados.                                                                     |
| `bar_sessions`            | Tabla (Supabase) | Registra el ciclo de vida (`active`, `closed`) de cada turno de un encargado, vinculÃ¡ndolo a un `work_day`.                         |
| `bar_stock_snapshots`     | Tabla (Supabase) | **Tabla de AuditorÃ­a.** Funciona como un libro mayor que registra el `opening` y `closing` stock para cada `bar_session`. Esto permite un seguimiento detallado del inventario a lo largo del tiempo. |
