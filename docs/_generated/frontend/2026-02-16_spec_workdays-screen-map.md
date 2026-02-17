# Screen Map — WorkDays + Balance Semanal

> **Fecha**: 16-Feb-2026
> **Fuente**: Deep Research (22+ artefactos) + verificación de archivos reales

---

## 1. Flujo Operativo Temporal

```mermaid
graph LR
    subgraph SEMANA["CICLO SEMANAL"]
        direction LR
        subgraph OPNOCHE["Jue-Dom OPERATIVO"]
            A["PLANNER<br/>DRAFT - PLANNED"]
            B["NIGHT CHIEF<br/>ACTIVE"]
            C["REPORT<br/>CLOSED"]
            A -->|rpc_confirm + rpc_open| B
            B -->|rpc_close| C
        end
        subgraph FINLUNES["Lunes FINANCIERO"]
            D["BALANCE SEMANAL<br/>Agregado 4 noches"]
        end
        C -.->|datos acumulados| D
    end
```

---

## 2. Mapa de Pantallas

### Prototipos (`tester_3.0/pages/prototypes/`)

| Pantalla            | Carpeta                |   Estado    | Destino Producción                          |
| :------------------ | :--------------------- | :---------: | :------------------------------------------ |
| **Planner**         | `lab-workdays/`        | Prototipado | Tab 1 de `admin-workdays.html`              |
| **Night Chief**     | `lab-workdays-night/`  | Prototipado | Tab 2 de `admin-workdays.html`              |
| **Balance Semanal** | `lab-balance-semanal/` | Prototipado | Módulo independiente `balance-semanal.html` |

> **Report (Tab 3)**: No existe como prototipo independiente. Se construye nuevo como "Post-Mortem Dashboard" (Versión A) dentro de `admin-workdays.html`.

### Producción (`tester_3.0/pages/admin/`)

| Pantalla                   | Archivo             |   Status    | Destino                                   |
| :------------------------- | :------------------ | :---------: | :---------------------------------------- |
| `admin-workdays.html`      | Legacy 4 tabs       | Desalineado | **Reemplazado** por 3 tabs unificados     |
| `admin-semanal.html`       | Legacy balance      | Desalineado | **Reemplazado** por `lab-balance-semanal` |
| `admin-reportes.html`      | Reportes noche      | Se mantiene | Complementa Report tab                    |
| `admin-pagos.html`         | Pagos proveedores   |   Vigente   | Fuente de `finance_payments`              |
| `admin-central-stock.html` | Stock + GBOL import |   Vigente   | Puente clave para cruce CMV               |

---

## 3. Arquitectura — Flujo Detallado

```mermaid
flowchart TD
    subgraph INDEX["admin-index.html"]
        I1["OPERATIVO"]
        I2["FINANCIERO"]
    end

    subgraph OPERATIVO["Modulo Operativo"]
        WD["admin-workdays.html<br/>3 TABS"]

        subgraph TAB1["Tab 1: PLANNER"]
            P1["Estado: DRAFT / PLANNED"]
            P2["Staff Planning (3 cards)"]
            P3["Costos Fijos + Solicitudes"]
            P4["Countdown + Event Selector"]
        end

        subgraph TAB2["Tab 2: NIGHT CHIEF"]
            N1["Estado: ACTIVE"]
            N2["KPI Strip + Import Pills"]
            N3["Split 50/50: Stock + Caja"]
            N4["Pre-flight + Cierre"]
        end

        subgraph TAB3["Tab 3: REPORT"]
            R1["Estado: CLOSED"]
            R2["Hero KPIs + Chart.js 3 modos"]
            R3["Facturacion Fiscal"]
            R4["3 Cards Snapshot"]
            R5["Reconciliation"]
            R6["Historial 10 noches"]
        end
    end

    subgraph FINANCIERO["Modulo Financiero"]
        BS["balance-semanal.html<br/>INDEPENDIENTE"]
        PG["admin-pagos.html"]
        RP["admin-reportes.html"]
    end

    I1 --> WD
    I2 --> BS
    I2 --> PG
    I2 --> RP
    WD --> TAB1
    WD --> TAB2
    WD --> TAB3
    R6 -.->|link| BS
```

---

## 4. State Machine — Lifecycle de una Jornada

```mermaid
stateDiagram-v2
    [*] --> DRAFT: rpc_create_work_day
    DRAFT --> PLANNED: rpc_confirm_work_day
    PLANNED --> DRAFT: rpc_revert_work_day
    PLANNED --> ACTIVE: rpc_open_work_day
    ACTIVE --> CLOSED: rpc_close_work_day
```

---

## 5. Visibilidad de Tabs por Estado

|   Estado    |      Tab PLANNER      |   Tab NIGHT CHIEF   | Tab REPORT |
| :---------: | :-------------------: | :-----------------: | :--------: |
|  **DRAFT**  | **Activo** (editable) |      Disabled       |  Disabled  |
| **PLANNED** |  Visible (read-only)  |      Disabled       |  Disabled  |
| **ACTIVE**  |  Visible (read-only)  |     **Activo**      |  Disabled  |
| **CLOSED**  |  Visible (read-only)  | Visible (read-only) | **Activo** |

---

## 6. Journey del Admin (Ciclo Semanal)

```mermaid
journey
    title Ciclo Semanal del Administrador
    section Preparacion (Mie-Jue)
      Crear jornada DRAFT: 5: Admin
      Configurar evento: 4: Admin
      Asignar staff: 4: Admin
      Confirmar plan: 5: Admin
    section Noche (Jue-Dom)
      Pre-flight check: 4: Admin
      Abrir noche: 5: Admin
      Night Chief monitorea: 3: Encargado
      Importar GBOL/Passline: 3: Encargado
      Cerrar noche: 5: Admin
    section Post-mortem (dia siguiente)
      Revisar Report Dashboard: 4: Admin
      Analizar charts y anomalias: 3: Admin
    section Balance (Lunes)
      Abrir Balance Semanal: 5: Admin
      Cruzar caja y rendimiento: 4: Admin
      Exportar PDF: 3: Admin
```

---

## 7. Data Flow — Tabla → Pantalla

```mermaid
flowchart LR
    subgraph DB["Supabase DB"]
        WD[work_days]
        CC[cash_closings]
        CT[closing_terminals]
        SA[staff_accruals]
        SC[staff_convocations]
        CD[cost_definitions]
        RR[revenue_reports]
        RD[revenue_details]
        MR[master_recipes]
        SKU[master_sku]
    end

    subgraph VIEWS["Vistas"]
        VNS[vw_night_snapshot]
        VBE[vw_bar_efficiency]
        VSA[vw_staff_accruals_summary]
        VPL[vw_workday_pnl]
    end

    subgraph SCREENS["Pantallas"]
        PLAN["PLANNER"]
        NC["NIGHT CHIEF"]
        RPT["REPORT"]
        BAL["BALANCE SEMANAL"]
    end

    SC --> PLAN
    CD --> PLAN
    VNS --> NC
    CT --> NC
    VNS --> RPT
    VBE --> RPT
    VSA --> RPT
    VPL --> RPT
    RD --> BAL
    MR --> BAL
    SKU --> BAL
    VBE --> BAL
```

---

## 8. Pantallas Eliminadas / Absorbidas

| Pantalla Legacy             | Destino                |   Accion    |
| :-------------------------- | :--------------------- | :---------: |
| `admin-cierre.html` + `.js` | Night Chief (Tab 2)    |   DELETE    |
| `admin-semanal.html`        | `balance-semanal.html` | REEMPLAZADA |
| `balance-semanal.js` (ger.) | `balance-semanal.html` | SUPERCEDIDA |

---

## 9. Componentes Compartidos (Design System)

| Componente          | Clases                                           | Usado en         |
| :------------------ | :----------------------------------------------- | :--------------- |
| Topbar + Breadcrumb | `lab-topbar`                                     | Todas            |
| KPI Strip           | `wd-kpi-strip` / `nc-kpi-strip` / `rp-kpi-strip` | Todas            |
| Panel               | `wd-panel` / `nc-panel` / `rp-panel`             | Todas            |
| Table               | `wd-table` / `nc-table` / `rp-table`             | Todas            |
| Chart Section       | `rp-chart-section` + `<canvas>`                  | Report           |
| Snapshot 3-col      | `rp-snapshot`                                    | Report           |
| Reconciliation      | `rp-reconciliation`                              | Report           |
| Countdown           | `wd-countdown`                                   | Planner          |
| Import Pills        | `nc-import-pill`                                 | Night Chief      |
| Diff Cell           | `rp-diff--negative/positive`                     | Report + Balance |
