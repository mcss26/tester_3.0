# Project Status — FormulaMid 4

> **Consolidado:** 2026-02-22
> **Fuentes:** screen-map + user-flows-by-role (estado-presente.md eliminado — deprecado, ver state.md)

---
## Part 1 — Mapa de Pantallas

> **Ãšltima ActualizaciÃ³n**: 2026-02-16  
> **Total Pantallas**: 46 producciÃ³n + 3 prototipos  
> **Documento**: Arquitectura de navegaciÃ³n y contextos de usuario

---

## ðŸŽ¯ PropÃ³sito

Este documento visualiza la **topografÃ­a completa** del sistema FormulaMid 4, organizando las 46 pantallas por rol operativo y contexto funcional. Ãštil para:

- Desarrolladores que necesitan entender el flujo de navegaciÃ³n
- QA para validar cobertura de tests por mÃ³dulo
- Stakeholders para comprender el alcance del sistema

---

## ðŸ—ºï¸ VisualizaciÃ³n de Arquitectura

```mermaid
graph TD
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% PORTAL CENTRAL
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    Portal[ðŸ  Portal Central<br/><small><i>index.html</i></small>]

    Portal --> A_IDX
    Portal --> O_IDX
    Portal --> L_IDX
    Portal --> E_BAR
    Portal --> E_CAJ
    Portal --> S_BAR
    Portal --> G_BAL
    Portal --> M_QR

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% ADMINISTRACIÃ“N (17 pantallas)
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    subgraph FM4_ADM [ðŸ”µ ADMINISTRACIÃ“N Â· 17 pantallas]
        direction TB
        A_IDX[ðŸ“Š Dashboard<br/><small><i>admin-index</i></small>]

        subgraph ADM_OPS [âš™ï¸ Operaciones Diarias]
            A_WD[ðŸ“… Work Days<br/><small><i>admin-workdays</i></small>]
            A_SOL[ðŸ“¬ Solicitudes<br/><small><i>admin-solicitudes</i></small>]
            A_REP[ðŸ“ˆ Reportes<br/><small><i>admin-reportes</i></small>]
            A_WKL[ðŸ“Š Semanal<br/><small><i>admin-semanal</i></small>]
            A_CFG[âš™ï¸ Config<br/><small><i>admin-config</i></small>]
        end

        subgraph ADM_STK [ðŸ“¦ Control de Inventario]
            A_CEN[ðŸ” Central Stock<br/><small><i>admin-central-stock</i></small>]
        end

        subgraph ADM_MST [ðŸ—ƒï¸ Maestros de Datos]
            A_PRV[ðŸ¢ Proveedores<br/><small><i>admin-master-proveedores</i></small>]
            A_CAT[ðŸ“ CategorÃ­as<br/><small><i>admin-master-categorias</i></small>]
            A_TAR[ðŸ’° Tarifario<br/><small><i>admin-master-tarifario</i></small>]
            A_NOM[ðŸ‘¥ NÃ³mina<br/><small><i>admin-master-nomina</i></small>]
            A_PAG[ðŸ’³ Pagos<br/><small><i>admin-pagos</i></small>]
            A_POS[ðŸ“Ÿ Terminales POS<br/><small><i>admin-master-pos</i></small>]
        end

        subgraph ADM_BAR [ðŸ¸ GestiÃ³n de Barras]
            AB_IDX[ðŸŽ¯ Hub Barras<br/><small><i>barras/index</i></small>]
            AB_REC[ðŸ“– Recetas<br/><small><i>barras/recipes</i></small>]
            AB_SES[ðŸŒ™ Sesiones<br/><small><i>barras/session</i></small>]
        end

        subgraph ADM_QR [ðŸ“± Sistema QR]
            QR_IDX[ðŸŽ¯ Hub QR<br/><small><i>qr/index</i></small>]
            QR_GEN[ðŸ”² Generador<br/><small><i>qr/generator</i></small>]
            QR_MON[ðŸ‘ï¸ Monitor<br/><small><i>qr/monitor</i></small>]
        end
    end

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% OPERATIVO (9 pantallas)
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    subgraph FM4_OPE [ðŸŸ¢ OPERATIVO Â· 9 pantallas]
        direction TB
        O_IDX[ðŸ“Š Dashboard<br/><small><i>operativo-index</i></small>]

        subgraph OPE_ERP [ðŸ“‹ ERP Operativo]
            O_STK[ðŸ“¦ Stock Real<br/><small><i>operativo-stock</i></small>]
            O_WD[ðŸ“… Work Day<br/><small><i>operativo-workday</i></small>]
            O_SOL[ðŸ“¬ Solicitudes<br/><small><i>operativo-solicitudes</i></small>]
            O_ANA[ðŸ“Š AnÃ¡lisis<br/><small><i>operativo-analisis</i></small>]
            O_SCN[ðŸ“· Scanner<br/><small><i>scanner</i></small>]
        end

        subgraph OPE_CMS [ðŸ‘¥ Comunidad]
            O_MEM[ðŸ‘¤ Miembros<br/><small><i>cms-members</i></small>]
        end

        subgraph OPE_MST [ðŸ—ƒï¸ Maestros Op.]
            O_SKU[ðŸ·ï¸ SKUs<br/><small><i>operativo-master-sku</i></small>]
            O_PRV[ðŸ¢ Proveedores<br/><small><i>operativo-master-proveedores</i></small>]
        end
    end

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% LOGÃSTICA (5 pantallas)
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    subgraph FM4_LOG [ðŸ“¦ LOGÃSTICA Â· 5 pantallas]
        direction TB
        L_IDX[ðŸ“Š Dashboard<br/><small><i>logistica-index</i></small>]
        L_STK[ðŸ­ Stock DepÃ³sito<br/><small><i>logistica-stock</i></small>]
        L_DIS[ðŸšš DistribuciÃ³n<br/><small><i>logistica-distribucion</i></small>]
        L_REC[ðŸ“¥ RecepciÃ³n<br/><small><i>logistica-recepcion</i></small>]
        L_SEG[ðŸ”Ž Seguimiento<br/><small><i>logistica-seguimiento</i></small>]
    end

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% ENCARGADOS (7 pantallas)
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    subgraph FM4_ENC [ðŸŸ  ENCARGADOS Â· 7 pantallas]
        direction TB

        subgraph ENC_BAR [ðŸ¸ Encargado Barra]
            E_BAR[ðŸ“Š Dashboard<br/><small><i>encargado-barra-index</i></small>]
            E_BNO[ðŸŒ™ Cierre Noche<br/><small><i>encargado-barra-noche</i></small>]
            E_BPE[ðŸ‘¥ Personal<br/><small><i>encargado-barra-personal</i></small>]
        end

        subgraph ENC_CAJ [ðŸ’° Encargado Caja]
            E_CAJ[ðŸ“Š Dashboard<br/><small><i>encargado-caja-index</i></small>]
            E_CNO[ðŸŒ™ Cierre Noche<br/><small><i>encargado-caja-noche</i></small>]
            E_CPE[ðŸ‘¥ Personal<br/><small><i>encargado-caja-personal</i></small>]
        end

        E_REP[ðŸ“¥ RecepciÃ³n<br/><small><i>encargado-recepcion</i></small>]
    end

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% STAFF (2 pantallas)
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    subgraph FM4_STA [ðŸŸ¡ STAFF Â· 2 pantallas]
        direction TB
        S_BAR[ðŸ¸ Staff Barra<br/><small><i>staff-barra-index</i></small>]
        S_CAJ[ðŸ’° Staff Caja<br/><small><i>staff-caja-index</i></small>]
    end

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% GERENCIA (1 pantalla)
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    subgraph FM4_GER [ðŸŸ£ GERENCIA Â· 1 pantalla]
        direction TB
        G_BAL[ðŸ“Š Balance Semanal<br/><small><i>balance-semanal</i></small>]
    end

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% MEMBERS (1 pantalla)
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    subgraph FM4_MEM [ðŸ”´ MEMBERS Â· 1 pantalla]
        direction TB
        M_QR[ðŸ“± Mi QR<br/><small><i>my-qr</i></small>]
    end

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% CONEXIONES INTERNAS
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    A_IDX --> ADM_OPS
    A_IDX --> ADM_STK
    A_IDX --> ADM_MST
    A_IDX --> ADM_BAR
    A_IDX --> ADM_QR

    O_IDX --> OPE_ERP
    O_IDX --> OPE_MST

    L_IDX --> L_STK
    L_IDX --> L_DIS
    L_IDX --> L_REC

    E_BAR --> E_BNO
    E_BAR --> E_BPE
    E_CAJ --> E_CNO
    E_CAJ --> E_CPE

    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    %% ESTILOS PREMIUM
    %% â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    classDef default fill:#1a1b1e,stroke:#333,color:#a9b1d6,stroke-width:1px;
    classDef admin fill:#1e293b,stroke:#3b82f6,color:#eff6ff,stroke-width:2px;
    classDef operative fill:#1e293b,stroke:#10b981,color:#ecfdf5,stroke-width:2px;
    classDef logistics fill:#1e293b,stroke:#8b5cf6,color:#f5f3ff,stroke-width:2px;
    classDef supervisor fill:#1e293b,stroke:#f59e0b,color:#fffbeb,stroke-width:2px;
    classDef staff fill:#1e293b,stroke:#eab308,color:#fefce8,stroke-width:2px;
    classDef gerencia fill:#1e293b,stroke:#a855f7,color:#faf5ff,stroke-width:2px;
    classDef portal fill:#0f172a,stroke:#ef4444,color:#fff,stroke-width:3px;
    classDef members fill:#1e293b,stroke:#ef4444,color:#fee2e2,stroke-width:2px;

    class Portal portal;
    class A_IDX,A_WD,A_SOL,A_REP,A_WKL,A_CFG,A_CEN,A_PRV,A_CAT,A_TAR,A_NOM,A_PAG,A_POS,QR_IDX,QR_GEN,QR_MON admin;
    class O_IDX,O_STK,O_WD,O_SOL,O_ANA,O_SCN,O_MEM,O_SKU,O_PRV operative;
    class L_IDX,L_STK,L_DIS,L_REC,L_SEG logistics;
    class E_BAR,E_BNO,E_BPE,E_CAJ,E_CNO,E_CPE,E_REP supervisor;
    class S_BAR,S_CAJ staff;
    class G_BAL gerencia;
    class M_QR members;
```

---

## ðŸ“‹ Resumen por Contexto

| Contexto             | PÃ¡ginas | Directorio                    | Roles Permitidos                    |
| :------------------- | :-----: | :---------------------------- | :---------------------------------- |
| ðŸ”µ **Admin**         |   17    | `pages/admin/*` (incl. `qr/`) | `admin`, `contable`                 |
| ðŸŸ¢ **Operativo**     |   10    | `pages/operativo/*`           | `operativo`, `staff_operativo`      |
| ðŸ“¦ **LogÃ­stica**     |    5    | `pages/logistica/*`           | `logistico`, `admin`                |
| ðŸŸ  **Encargados**    |    7    | `pages/encargados/*`          | `encargado_barra`, `encargado_caja` |
| ðŸŸ¡ **Staff**         |    2    | `pages/staff/*`               | `staff_barra`, `staff_caja`         |
| ðŸŸ£ **Gerencia**      |    1    | `pages/gerencia/*`            | `gerencia`, `admin`                 |
| ðŸ”´ **Members**       |    1    | `pages/members/*`             | `member`                            |
| ðŸ› ï¸ **Dev Utilities** |    0    | `pages/*.html`                | â€”                                   |
| ðŸ§ª **Prototypes**    |    4    | `pages/prototypes/*`          | â€”                                   |
| **TOTAL**            | **49**  | â€”                             | â€”                                   |

---

## ðŸ“‚ Inventario Completo por Carpeta

### ðŸ”µ Admin (17)

|  #  | Archivo                         | PropÃ³sito                                              | Tablas Principales                                      |
| :-: | :------------------------------ | :----------------------------------------------------- | :------------------------------------------------------ |
|  1  | `admin-index.html`              | Dashboard principal de administraciÃ³n                  | `work_days`, `profiles`, `qr_codes`                     |
|  2  | `admin-workdays.html`           | GestiÃ³n de jornadas laborales (+ Night Chief + Cierre) | `work_days`, `staff_convocations`, `cash_closings` + 8V |
|  3  | `admin-solicitudes.html`        | Centro de solicitudes de insumos                       | `replenishment_*`, `master_sku`, `vw_stock_global`      |
|  4  | `admin-reportes.html`           | GeneraciÃ³n de reportes                                 | 5 vistas: `vw_bar_efficiency`, `vw_daily_sales_v2`â€¦     |
|  5  | `admin-semanal.html`            | Cierre semanal y balance                               | `finance_weekly_closings`, `vw_financial_week_live`     |
|  6  | `admin-central-stock.html`      | GestiÃ³n centralizada: Stock, Recetas, Rentabilidad     | `master_sku`, `master_recipes`, `inventory_stock` + 2V  |
|  7  | `admin-master-proveedores.html` | Maestro de proveedores                                 | `master_proveedores`, `master_categories`               |
|  8  | `admin-master-categorias.html`  | Maestro de categorÃ­as                                  | `master_categories`                                     |
|  9  | `admin-master-tarifario.html`   | Tarifario de precios                                   | `master_staff_roles`                                    |
| 10  | `admin-master-nomina.html`      | GestiÃ³n de personal                                    | `profiles`, `master_staff_roles`                        |
| 11  | `admin-pagos.html`              | Control de pagos                                       | `finance_payments`, `cost_definitions`, `payment_*`     |
| 12  | `admin-master-pos.html`         | Terminales punto de venta                              | `pos_terminals`                                         |
| 13  | `admin-config.html`             | ConfiguraciÃ³n del sitio                                | `cost_config`, `master_sku`                             |
| 14  | `test-devenciones.html`         | Testing de devengados de nÃ³mina                        | `staff_accruals`                                        |
| 15  | `qr/index.html`                 | Hub del sistema QR                                     | `qr_batches`, `qr_checkins`, `qr_codes`                 |
| 16  | `qr/generator.html`             | Generador de cÃ³digos QR                                | `qr_batches`, `qr_codes`                                |
| 17  | `qr/monitor.html`               | Monitor de escaneos QR                                 | `qr_batches`, `qr_codes`                                |

### ðŸŸ¢ Operativo (10)

|  #  | Archivo                             | PropÃ³sito                       | Tablas Principales                               |
| :-: | :---------------------------------- | :------------------------------ | :----------------------------------------------- |
|  1  | `operativo-index.html`              | Dashboard operativo             | `qr_codes`                                       |
|  2  | `operativo-stock.html`              | Control de stock en tiempo real | `vw_stock_global`                                |
|  3  | `operativo-workday.html`            | Jornada del dÃ­a                 | `work_days`, `staff_convocations`, `site_config` |
|  4  | `operativo-solicitudes.html`        | Solicitudes operativas          | `replenishment_*`, `vw_stock_global`             |
|  5  | `operativo-analisis.html`           | AnÃ¡lisis de datos               | `consumption_reports`, `consumption_details`     |
|  6  | `scanner.html`                      | Scanner de cÃ³digos              | `qr_codes`, `members`, `qr_checkins`             |
|  7  | `scanner-mock.html`                 | Scanner mock (desarrollo)       | â€” (mock sin conexiÃ³n a BD)                       |
|  8  | `cms-members.html`                  | GestiÃ³n de miembros             | `members`                                        |
|  9  | `operativo-master-sku.html`         | SKUs (vista operativa)          | `master_sku`, `sku_change_requests`              |
| 10  | `operativo-master-proveedores.html` | Proveedores (vista operativa)   | `master_proveedores`                             |

### ðŸ“¦ LogÃ­stica (5)

|  #  | Archivo                       | PropÃ³sito               | Tablas Principales                                        |
| :-: | :---------------------------- | :---------------------- | :-------------------------------------------------------- |
|  1  | `logistica-index.html`        | Dashboard de logÃ­stica  | `profiles`, `work_days`                                   |
|  2  | `logistica-stock.html`        | Stock en depÃ³sito       | `inventory_stock`, `vw_stock_global`                      |
|  3  | `logistica-distribucion.html` | Ã“rdenes de distribuciÃ³n | `replenishment_*`, `inventory_stock`, `vw_stock_global`   |
|  4  | `logistica-recepcion.html`    | RecepciÃ³n de mercaderÃ­a | `replenishment_receipts`, `inventory_stock`               |
|  5  | `logistica-seguimiento.html`  | Seguimiento de Ã³rdenes  | `replenishment_supplier_orders`, `replenishment_tracking` |

### ðŸŸ  Encargados (7)

|  #  | Archivo                         | PropÃ³sito                 | Tablas Principales                                     |
| :-: | :------------------------------ | :------------------------ | :----------------------------------------------------- |
|  1  | `encargado-barra-index.html`    | Dashboard encargado barra | `profiles`, `vw_supplier_orders_encargado`             |
|  2  | `encargado-barra-noche.html`    | Cierre nocturno barra     | `bar_sessions`, `bar_stock_snapshots`, `master_sku`    |
|  3  | `encargado-barra-personal.html` | Personal de barra         | `staff_convocations`, `work_day_staff_planning`        |
|  4  | `encargado-caja-index.html`     | Dashboard encargado caja  | `profiles`, `work_days`                                |
|  5  | `encargado-caja-noche.html`     | Cierre nocturno caja      | `cash_closings`, `closing_terminals`, `cash_movements` |
|  6  | `encargado-caja-personal.html`  | Personal de caja          | `staff_convocations`, `work_day_staff_planning`        |
|  7  | `encargado-recepcion.html`      | RecepciÃ³n de insumos      | `replenishment_items`, `vw_supplier_orders_encargado`  |

### ðŸŸ¡ Staff (2)

|  #  | Archivo                  | PropÃ³sito            | Tablas Principales                                |
| :-: | :----------------------- | :------------------- | :------------------------------------------------ |
|  1  | `staff-barra-index.html` | Interfaz staff barra | `bar_sessions`, `bar_stock_snapshots`             |
|  2  | `staff-caja-index.html`  | Interfaz staff caja  | `cash_closings`, `closing_terminals`, `work_days` |

### ðŸŸ£ Gerencia (1)

|  #  | Archivo                | PropÃ³sito                   | Tablas Principales  |
| :-: | :--------------------- | :-------------------------- | :------------------ |
|  1  | `balance-semanal.html` | Balance consolidado semanal | `vw_finance_weekly` |

### ðŸ”´ Members (1)

|  #  | Archivo      | PropÃ³sito                             | Tablas Principales    |
| :-: | :----------- | ------------------------------------- | :-------------------- |
|  1  | `my-qr.html` | VisualizaciÃ³n QR personal del miembro | `qr_codes`, `members` |

---

## ConclusiÃ³n Operativa

La arquitectura FM4 implementa una **separaciÃ³n clara por rol y contexto**:

| PatrÃ³n                      | DescripciÃ³n                                                  |
| :-------------------------- | :----------------------------------------------------------- |
| **JerarquÃ­a de Dashboards** | Cada contexto tiene un `*-index.html` como punto de entrada  |
| **MÃ³dulos Anidados**        | Admin agrupa Barras y QR como sub-sistemas                   |
| **Roles Exclusivos**        | Staff tiene interfaces simplificadas sin acceso a maestros   |
| **DuplicaciÃ³n Controlada**  | Operativo replica algunos maestros con vista de solo-lectura |

### ðŸ”— Flujos CrÃ­ticos

```
Solicitud de Insumos:
operativo-solicitudes â†’ admin-solicitudes â†’ logistica-distribucion

Cierre de Jornada:
encargado-barra-noche â†’ admin-workdays (Night Chief tab)

GestiÃ³n de Miembros:
cms-members â†’ operativo-cms â†’ admin-master-nomina
```

---

## ðŸ› ï¸ Notas TÃ©cnicas

| Aspecto        | ImplementaciÃ³n                                                                 |
| :------------- | :----------------------------------------------------------------------------- |
| **Auth**       | `data-allowed-roles` + `Auth.guardOrRedirect()`                                |
| **NavegaciÃ³n** | `data-go` con `admin-navigation.js`                                            |
| **Estado**     | `window.Utils.setPageState()` para loading/empty/ready                         |
| **Realtime**   | Supabase Channels en mÃ³dulos de encargados                                     |
| **CSS**        | `tokens.css` + `components.css` + mÃ³dulo-especÃ­ficos (0 imports de `main.css`) |

### ðŸ“Š DistribuciÃ³n por Tipo

```
Dashboards (Ã­ndices):    7 pantallas (15%)
Maestros de datos:       9 pantallas (19%)
Operaciones:            15 pantallas (31%)
Reportes/AnÃ¡lisis:       6 pantallas (12%)
Sistemas especiales:    11 pantallas (23%)
```

---

_Documento generado automÃ¡ticamente por Antigravity Agent usando el skill `generating-screen-maps`._

---

## Part 2 — User Flows by Role

> **Fuentes**: 4 notebooks NotebookLM + 46 pantallas tester_3.0 + screen-map.md + data-allowed-roles
> **Fecha**: 11-Feb-2026
> **PropÃ³sito**: Alinear skills de desarrollo con la realidad operativa

---

## Descubrimiento Clave: 12 Roles en CÃ³digo vs 6 Documentados

Los notebooks documentan 6 roles (Admin, Contable, Operativo, LogÃ­stico, Encargado, Staff).
El cÃ³digo **implementa 12 sub-roles**:

| Rol Base      | Sub-roles en cÃ³digo                                                              | Pantallas                    |
| ------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| **Admin**     | `admin`                                                                          | 20+ (acceso total)           |
| **Contable**  | `contable`                                                                       | 12 (compartidas con admin)   |
| **Gerente**   | `gerente`                                                                        | 1 (`balance-semanal`)        |
| **Operativo** | `operativo`, `staff_operativo`                                                   | 9                            |
| **LogÃ­stico** | `logistico`                                                                      | 5 + 3 compartidas            |
| **Encargado** | `encargado_barra`, `encargado_caja`, `encargado_limpieza`, `encargado_seguridad` | 7                            |
| **Staff**     | `staff_barra`, `staff_caja`, `staff_guardia`, `staff_seguridad`                  | 2-3                          |
| **Manager**   | `manager`                                                                        | 1 (`qr/monitor`)             |
| **Member**    | (sin rol explÃ­cito)                                                              | 0 (migrado a `midnightclub`) |

> [!IMPORTANT]
> Los roles `encargado_limpieza`, `encargado_seguridad`, `staff_guardia`, `staff_seguridad`, `gerente`, y `manager` no estÃ¡n documentados en ningÃºn notebook pero SÃ estÃ¡n en el cÃ³digo.

---

## 1. Admin â€” Control Total

### Pantallas (20+)

```
admin-index.html â”€â”€â”€ Dashboard
â”œâ”€â”€ Operaciones Diarias
â”‚   â”œâ”€â”€ admin-workdays.html â”€â”€â”€ GestiÃ³n jornadas + Night Chief + Cierre
â”‚   â”œâ”€â”€ admin-solicitudes.html â”€â”€â”€ Centro de solicitudes
â”‚   â”œâ”€â”€ admin-reportes.html â”€â”€â”€ Reportes
â”‚   â”œâ”€â”€ admin-semanal.html â”€â”€â”€ Cierre semanal
â”‚   â””â”€â”€ admin-config.html â”€â”€â”€ ConfiguraciÃ³n
â”œâ”€â”€ Inventario
â”‚   â””â”€â”€ admin-central-stock.html â”€â”€â”€ Stock + Recetas + Rentabilidad
â”œâ”€â”€ Maestros
â”‚   â”œâ”€â”€ admin-master-proveedores.html
â”‚   â”œâ”€â”€ admin-master-categorias.html
â”‚   â”œâ”€â”€ admin-master-tarifario.html
â”‚   â”œâ”€â”€ admin-master-nomina.html
â”‚   â”œâ”€â”€ admin-master-pos.html
â”‚   â””â”€â”€ admin-pagos.html
â””â”€â”€ QR
    â”œâ”€â”€ qr/index.html
    â”œâ”€â”€ qr/generator.html
    â””â”€â”€ qr/monitor.html
```

### Flujo de un dÃ­a tÃ­pico (Admin) â€” Ciclo OPERACIONAL (diario)

```
1. ANTES de abrir â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   admin-workdays.html â†’ Crear/Planificar workday (staff, evento, template)
   admin-solicitudes.html â†’ Revisar solicitudes pendientes
   admin-central-stock.html â†’ Verificar stock general

2. DURANTE la noche â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   admin-workdays.html (Night Chief tab) â†’ KPIs en vivo, break-even
   qr/monitor.html â†’ Monitorear ingresos QR
   admin-reportes.html â†’ Reportes en tiempo real

3. DESPUÃ‰S (pre-cierre/cierre) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   admin-workdays.html (Cierre tab) â†’ P&L, verificar diferencias
   admin-pagos.html â†’ Generar pagos pendientes
   â˜… FIN del ciclo operacional diario
```

### Flujo semanal (Admin) â€” Ciclo FINANCIERO (lunes)

```
4. LUNES â€” Balance Semanal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   balance-semanal.html â†’ Cruces de caja (8 POS Ã— sistema vs rendiciÃ³n)
                        â†’ Cruces de rendimiento (SKU Ã— comandas vs consumido)
                        â†’ ZOCO vs Sistema (descalces de procesadores)
                        â†’ Gap fiscal (POS vs AFIP)
                        â†’ Documentos/evidencia (GBOL exports, extractos)
                        â†’ Export CSV/PDF
   â˜… MÃ³dulo INDEPENDIENTE, no parte de Workdays
```

### Gaps del Admin

| Lo que deberÃ­a tener (GBol) | Estado                                   | Prioridad |
| --------------------------- | ---------------------------------------- | --------- |
| 8 tipos de auditorÃ­a        | âŒ No existe                             | ðŸ”´ Alta   |
| Dashboard de health score   | âš ï¸ Calculado, sin visualizaciÃ³n dedicada | ðŸŸ¡ Media  |
| Comparativa GBol vs FM4     | âŒ No existe                             | ðŸŸ¢ Baja   |

---

## 2. Operativo â€” Manager de Turno

### Pantallas (9)

```
operativo-index.html â”€â”€â”€ Dashboard
â”œâ”€â”€ ERP Operativo
â”‚   â”œâ”€â”€ operativo-workday.html â”€â”€â”€ Jornada del dÃ­a (passline, staff, stock)
â”‚   â”œâ”€â”€ operativo-stock.html â”€â”€â”€ Stock en tiempo real
â”‚   â”œâ”€â”€ operativo-solicitudes.html â”€â”€â”€ Solicitudes (crear + seguimiento)
â”‚   â”œâ”€â”€ operativo-analisis.html â”€â”€â”€ AnÃ¡lisis de datos
â”‚   â””â”€â”€ scanner.html â”€â”€â”€ Scanner QR
â”œâ”€â”€ Comunidad
â”‚   â””â”€â”€ cms-members.html â”€â”€â”€ GestiÃ³n miembros
â””â”€â”€ Maestros (vista)
    â”œâ”€â”€ operativo-master-sku.html â”€â”€â”€ CatÃ¡logo SKU (lectura)
    â””â”€â”€ operativo-master-proveedores.html â”€â”€â”€ Proveedores (lectura)
```

### Flujo de un dÃ­a tÃ­pico (Operativo)

```
1. PRE-APERTURA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   operativo-workday.html â†’ Ver staff confirmado, ausentes, rendimiento
   operativo-stock.html â†’ Verificar stock actual vs ideal
   operativo-solicitudes.html â†’ Crear solicitudes urgentes

2. DURANTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   operativo-workday.html â†’ Passline links (capacidad, ventas)
   scanner.html â†’ Escanear QR de ingreso
   operativo-stock.html â†’ Monitorear consumo en vivo

3. POST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   operativo-analisis.html â†’ Revisar performance
   operativo-solicitudes.html â†’ Generar solicitudes para reposiciÃ³n
```

### Gaps del Operativo

| Lo que deberÃ­a tener                  | Estado                               | Prioridad |
| ------------------------------------- | ------------------------------------ | --------- |
| Vista de rendimiento staff individual | âš ï¸ Existe workday pero sin historial | ðŸ”´ Alta   |
| Alerta stock bajo en tiempo real      | âš ï¸ Stock existe, alertas no          | ðŸŸ¡ Media  |
| Chat/comunicaciÃ³n con Encargados      | âŒ No existe                         | ðŸŸ¡ Media  |
| Panel de emergencia (seguridad)       | âŒ No digitalizado (es fÃ­sico hoy)   | ðŸŸ¢ Baja   |

---

## 3. LogÃ­stico â€” Jefe de DepÃ³sito

### Pantallas (5)

```
logistica-index.html â”€â”€â”€ Dashboard
â”œâ”€â”€ logistica-stock.html â”€â”€â”€ Stock en depÃ³sito central
â”œâ”€â”€ logistica-distribucion.html â”€â”€â”€ Ã“rdenes de distribuciÃ³n
â”œâ”€â”€ logistica-recepcion.html â”€â”€â”€ RecepciÃ³n de mercaderÃ­a
â””â”€â”€ logistica-seguimiento.html â”€â”€â”€ Seguimiento de Ã³rdenes
```

### Flujo principal (LogÃ­stico)

```
1. RECIBE solicitud (de Operativo/Encargado vÃ­a operativo-solicitudes)
2. logistica-seguimiento â†’ Ve solicitudes pendientes
3. logistica-stock â†’ Verifica disponibilidad en depÃ³sito
4. logistica-distribucion â†’ Prepara orden de distribuciÃ³n
5. logistica-recepcion â†’ Registra recepciÃ³n de proveedor
6. â†’ Staff de barra confirma recepciÃ³n (encargado-recepcion.html)
```

### Gaps del LogÃ­stico

| Lo que deberÃ­a tener                           | Estado                                        | Prioridad |
| ---------------------------------------------- | --------------------------------------------- | --------- |
| ConexiÃ³n directa con Solicitudes del Operativo | âš ï¸ Puede ver, pero no hay flujo bidireccional | ðŸ”´ Alta   |
| Notificaciones de stock crÃ­tico                | âŒ No existe                                  | ðŸ”´ Alta   |
| Historial de recepciones vs pedidos            | âš ï¸ Parcial                                    | ðŸŸ¡ Media  |
| IntegraciÃ³n con proveedores (ETA)              | âŒ No existe                                  | ðŸŸ¢ Baja   |

---

## 4. Encargado â€” SupervisiÃ³n de Ãrea

### Pantallas (7, divididas en Barra y Caja)

```
ENCARGADO BARRA (3):                    ENCARGADO CAJA (3):
encargado-barra-index.html â”€ Dashboard  encargado-caja-index.html â”€ Dashboard
encargado-barra-noche.html â”€ Cierre     encargado-caja-noche.html â”€ Cierre
encargado-barra-personal.html â”€ Staff   encargado-caja-personal.html â”€ Staff

COMPARTIDA (1):
encargado-recepcion.html â”€â”€â”€ Confirmar recepciÃ³n de insumos
```

### Flujo principal (Encargado Barra)

```
1. PRE-APERTURA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   encargado-barra-personal.html â†’ Confirmar staff presente
   encargado-recepcion.html â†’ Verificar insumos recibidos

2. DURANTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   encargado-barra-index.html â†’ Monitorear ventas por terminal
   (Sin pantalla dedicada) â†’ Aprobar solicitudes de su zona

3. CIERRE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   encargado-barra-noche.html â†’ Cierre de barras, verificar diferencias
   â†’ Datos fluyen a admin-workdays (Night Chief tab)
```

### Flujo principal (Encargado Caja)

```
1. PRE-APERTURA â†’ encargado-caja-personal.html â†’ Staff asignado
2. DURANTE â†’ encargado-caja-index.html â†’ Monitor terminales
3. CIERRE â†’ encargado-caja-noche.html â†’ Arqueo, validar cierres Staff
```

### Gaps del Encargado

| Lo que deberÃ­a tener                                   | Estado                                                                                    | Prioridad |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- | --------- |
| Arqueo ciego del Staff (GBol workflow)                 | âŒ El workflow dice que Staff cierra sin ver totales, Encargado verifica. No implementado | ðŸ”´ Alta   |
| AprobaciÃ³n de solicitudes desde su vista               | âš ï¸ Puede ver, no aprobar directamente                                                     | ðŸŸ¡ Media  |
| `encargado_limpieza` y `encargado_seguridad` pantallas | âŒ Roles en cÃ³digo, sin pantallas propias                                                 | ðŸŸ¡ Media  |
| Dashboard unificado (no tener que elegir barra/caja)   | âŒ Son dos flujos separados                                                               | ðŸŸ¢ Baja   |

---

## 5. Staff â€” Terminal POS

### Pantallas (2)

```
staff-barra-index.html â”€â”€â”€ POS Barra (venta de tragos)
staff-caja-index.html â”€â”€â”€ POS Caja/BoleterÃ­a (venta de entradas)
```

### Flujo (Staff)

```
1. Login â†’ Se valida rol â†’ Redirige a su POS
2. Abrirl turno â†’ Vende durante la noche
3. Cierre â†’ Arqueo ciego (deberÃ­a no ver totales del sistema)
4. â†’ Encargado verifica diferencias
```

### Sub-roles sin pantalla propia

| Sub-rol           | En cÃ³digo                      | Pantalla dedicada                 | Gap                                 |
| ----------------- | ------------------------------ | --------------------------------- | ----------------------------------- |
| `staff_barra`     | âœ…                             | âœ… `staff-barra-index`            | â€”                                   |
| `staff_caja`      | âœ…                             | âœ… `staff-caja-index`             | â€”                                   |
| `staff_guardia`   | âœ… (en `scanner.html`)         | âŒ Comparte scanner con Operativo | PodrÃ­a necesitar vista simplificada |
| `staff_seguridad` | âœ… (en `encargado-caja-noche`) | âŒ Sin vista propia               | Aclarar si necesita algo            |
| `staff_operativo` | âœ… (en varias operativo)       | âŒ Comparte con Operativo         | Aclarar permisos                    |

---

## 6. Roles Secundarios

### Contable

- Acceso a **12 pantallas** de Admin (solo lectura/validaciÃ³n)
- No tiene dashboard propio â€” entra por las mismas pantallas de Admin
- **Gap**: No tiene vista de auditorÃ­a dedicada (las 8 auditorÃ­as de GBol)

### Gerente

- Acceso principal: `balance-semanal.html` â€” mÃ³dulo financiero semanal
- El Balance Semanal es un mÃ³dulo completo: cruces de caja, rendimiento, ZOCO, fiscal, documentos
- **Gap**: Necesita comparativas histÃ³ricas (semana vs semana anterior), tendencias multiperiodo

### Manager

- Solo `qr/monitor.html`
- **Gap**: Rol poco documentado. Â¿Es un alias de otro rol?

### Member

- Migrado a repo pÃºblico `midnightclub` (`members-only.html`)
- QR se genera en la propia pÃ¡gina del member via edge function `generate-member-qr`

---

## 7. Flujos Cross-Rol (Cadena Completa)

### Flujo de Stock (5 pasos, 4 roles)

```
Operativo detecta falta        Encargado aprueba          LogÃ­stico prepara           Encargado recibe
operativo-solicitudes.html  â†’  (sin pantalla propia)  â†’  logistica-distribucion  â†’  encargado-recepcion
       [OPERATIVO]                 [ENCARGADO]              [LOGÃSTICO]              [ENCARGADO]
                                                                                         â”‚
                                                                                         â–¼
                                                                              Admin verifica
                                                                           admin-solicitudes
                                                                               [ADMIN]
```

> [!WARNING]
> **Gap crÃ­tico**: El paso 2 (aprobaciÃ³n del Encargado) no tiene pantalla dedicada. El Encargado no puede aprobar/rechazar solicitudes desde su propia interfaz.

### Flujo de Caja (5 pasos, 3 roles)

```
Staff abre terminal â†’ Staff vende â†’ Staff cierra (arqueo ciego) â†’ Encargado verifica â†’ Admin cierra definitivo
  staff-*-index       staff-*-index     (NO EXISTE)            encargado-*-noche      admin-workdays
    [STAFF]             [STAFF]          [STAFF]                 [ENCARGADO]             [ADMIN]
```

> [!WARNING]
> **Gap crÃ­tico**: El arqueo ciego (Staff cierra sin ver totales del sistema) no estÃ¡ implementado. El Staff ve todo.

### Flujo de Ingreso (3 fases, roles fÃ­sicos)

```
Seguridad Privada â†’ PolicÃ­a â†’ Validadores â†’ Operativo (Scanner)
    [FÃSICO]        [FÃSICO]    [FÃSICO]     scanner.html
                                              [OPERATIVO / STAFF_GUARDIA]
```

> [!NOTE]
> Este flujo es mayormente fÃ­sico. Solo el paso final (scanner QR) estÃ¡ digitalizado. El protocolo estÃ¡ en NB4 pero no hay necesidad inmediata de digitalizarlo mÃ¡s allÃ¡ del scanner.

---

## 8. Matriz Pantalla Ã— Rol (Permisos Reales del CÃ³digo)

| Pantalla               | admin | contable | operativo | logistico | enc_barra | enc_caja | staff_barra | staff_caja |
| ---------------------- | :---: | :------: | :-------: | :-------: | :-------: | :------: | :---------: | :--------: |
| admin-index            |  âœ…   |          |           |           |           |          |             |            |
| admin-workdays         |  âœ…   |    âœ…    |           |           |           |          |             |            |
| admin-solicitudes      |  âœ…   |    âœ…    |           |           |           |          |             |            |
| admin-reportes         |  âœ…   |    âœ…    |           |           |           |          |             |            |
| admin-semanal          |  âœ…   |    âœ…    |           |           |           |          |             |            |
| admin-central-stock    |  âœ…   |    âœ…    |           |    âœ…     |           |          |             |            |
| admin-pagos            |  âœ…   |    âœ…    |           |           |           |          |             |            |
| admin-config           |  âœ…   |          |           |           |           |          |             |            |
| admin-master-\* (6)    |  âœ…   |    âœ…    |           |           |           |          |             |            |
| operativo-index        |  âœ…   |          |    âœ…     |           |    âœ…     |    âœ…    |             |            |
| operativo-workday      |  âœ…   |          |    âœ…     |           |    âœ…     |    âœ…    |     âœ…      |     âœ…     |
| operativo-stock        |  âœ…   |          |    âœ…     |    âœ…     |           |          |             |            |
| operativo-solicitudes  |  âœ…   |          |    âœ…     |    âœ…     |           |          |             |            |
| operativo-analisis     |  âœ…   |          |    âœ…     |    âœ…     |           |          |             |            |
| operativo-master-sku   |  âœ…   |          |    âœ…     |           |           |          |             |            |
| scanner                |  âœ…   |          |    âœ…     |           |           |          |             |            |
| cms-members            |  âœ…   |    âœ…    |    âœ…     |           |           |          |             |            |
| logistica-\* (5)       |  âœ…   |          |           |    âœ…     |           |          |             |            |
| encargado-barra-\* (3) |  âœ…   |          |           |           |    âœ…     |          |             |            |
| encargado-caja-\* (3)  |  âœ…   |          |           |           |           |    âœ…    |             |            |
| encargado-recepcion    |  âœ…   |    âœ…    |           |           |    âœ…     |          |             |            |
| staff-barra-index      |  âœ…   |          |           |           |           |          |     âœ…      |            |
| staff-caja-index       |       |          |    âœ…     |           |           |          |             |     âœ…     |
| balance-semanal        |  âœ…   |    âœ…    |           |           |           |          |             |            |
| qr/index               |  âœ…   |          |           |           |           |    âœ…    |             |            |
| qr/generator           |  âœ…   |          |           |           |           |          |             |            |
| qr/monitor             |  âœ…   |          |           |           |           |          |             |            |

---

## 9. Resumen de Gaps â€” Priorizado por Impacto

### ðŸ”´ CrÃ­ticos (bloquean workflows documentados)

1. **Arqueo ciego Staff** â€” El workflow de GBol dice que Staff no debe ver totales. No implementado.
2. **AprobaciÃ³n de solicitudes por Encargado** â€” Sin pantalla, el Encargado no puede aprobar solicitudes de su zona.
3. **Audit trail** â€” Las 8 auditorÃ­as de GBol (anulaciones, precios, conexiones) no existen en FM4.

### ðŸŸ¡ Importantes (mejoran significativamente la operaciÃ³n)

4. **Vista unificada Contable** â€” Contable entra por pantallas de Admin sin dashboard propio.
5. **Alertas de stock bajo en tiempo real** â€” Solo hay check manual.
6. **Roles fantasma** â€” `encargado_limpieza`, `encargado_seguridad`, `staff_guardia` existen en cÃ³digo sin pantalla propia.
7. **Historial de rendimiento Staff** â€” Solo datos del dÃ­a actual, sin tendencia.
8. **Flujo bidireccional LogÃ­stico â†” Operativo** â€” Solicitudes van en una direcciÃ³n, no hay feedback.

### ðŸŸ¢ Deseables (nice-to-have)

9. **Dashboard Gerente expandido** â€” Balance Semanal ya es mÃ³dulo completo (rediseÃ±o v3), necesita comparativas histÃ³ricas.
10. **Chat/notificaciones entre roles** â€” ComunicaciÃ³n es verbal/WhatsApp hoy.
11. **DigitalizaciÃ³n protocolo ingreso** â€” Funciona bien en fÃ­sico.
12. **IntegraciÃ³n ETA proveedores** â€” Datos de proveedor no disponibles.

---

_Documento basado en 4 notebooks NotebookLM, 46 pantallas de tester_3.0, y `data-allowed-roles` del cÃ³digo fuente._
