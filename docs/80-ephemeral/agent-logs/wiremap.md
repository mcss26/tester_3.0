# Wiremap — Routing Completo

> Generated: 2026-02-21

## 1. Auth Flow

```mermaid
flowchart TD
    LOGIN[login.html] -->|auth success| ROLE_CHECK{"Auth.roleLanding(role)"}
    ROLE_CHECK -->|admin / contable / manager| ADMIN_IDX[admin/admin-index]
    ROLE_CHECK -->|logistico| LOG_IDX[logistica/logistica-index]
    ROLE_CHECK -->|encargado_caja| ENC_CAJA[encargados/encargado-caja-index]
    ROLE_CHECK -->|encargado_barra| ENC_BARRA[encargados/encargado-barra-index]
    ROLE_CHECK -->|staff_caja| STAFF_CAJA[staff/staff-caja-index]
    ROLE_CHECK -->|staff_barra| STAFF_BARRA[staff/staff-barra-index]
    ROLE_CHECK -->|encargado_*| OP_IDX[operativo/operativo-index]
    ROLE_CHECK -->|default| OP_IDX

    ANY_PAGE -->|no session| LOGIN
    ANY_PAGE -->|wrong role| ROLE_CHECK
```

---

## 2. Role Access Matrix

| Página                       | admin | contable | logistico | enc_barra | enc_caja | staff_caja | operativo | staff_barra | staff_operativo | manager | gerente |
| ---------------------------- | :---: | :------: | :-------: | :-------: | :------: | :--------: | :-------: | :---------: | :-------------: | :-----: | :-----: |
| **Admin**                    |       |          |           |           |          |            |           |             |                 |         |         |
| admin-index                  |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |         |
| admin-config                 |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |         |
| admin-central-stock          |  ✅   |    ✅    |    ✅     |           |          |            |           |             |                 |         |         |
| admin-workdays               |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |         |
| admin-pagos                  |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |         |
| admin-solicitudes            |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |         |
| admin-reportes               |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |         |
| admin-semanal                |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |         |
| admin-master-\* (6 pages)    |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |         |
| qr/index (dashboard)         |  ✅   |          |           |           |    ✅    |            |           |             |                 |         |         |
| qr/monitor                   |  ✅   |    ✅    |           |           |          |            |           |             |                 |   ✅    |         |
| **Operativo**                |       |          |           |           |          |            |           |             |                 |         |         |
| operativo-index              |  ✅   |    ✅    |           |           |          |            |    ✅     |             |       ✅        |         |         |
| operativo-stock              |       |          |    ✅     |           |          |            |    ✅     |             |                 |         |         |
| operativo-solicitudes        |  ✅   |    ✅    |           |           |          |            |    ✅     |             |       ✅        |         |         |
| operativo-master-sku         |  ✅   |    ✅    |           |           |          |            |    ✅     |     ✅      |       ✅        |         |         |
| operativo-master-proveedores |  ✅   |    ✅    |           |           |          |            |    ✅     |     ✅      |       ✅        |         |         |
| operativo-analisis           |       |          |    ✅     |           |          |            |    ✅     |             |                 |         |         |
| operativo-workday            |  ✅   |    ✅    |           |           |          |            |    ✅     |             |       ✅        |         |         |
| cms-members                  |  ✅   |    ✅    |           |           |          |            |    ✅     |             |       ✅        |         |         |
| scanner                      |  ✅   |          |           |           |          |            |    ✅     |             |                 |         |         |
| **Logística**                |       |          |           |           |          |            |           |             |                 |         |         |
| logistica-index              |  ✅   |          |    ✅     |           |          |            |           |             |                 |         |         |
| logistica-stock              |  ✅   |          |    ✅     |           |          |            |           |             |                 |         |         |
| logistica-distribucion       |  ✅   |    ✅    |    ✅     |           |          |            |           |             |                 |         |         |
| logistica-recepcion          |  ✅   |    ✅    |    ✅     |           |          |            |           |             |                 |         |         |
| logistica-seguimiento        |  ✅   |          |    ✅     |           |          |            |           |             |                 |         |         |
| **Encargados**               |       |          |           |           |          |            |           |             |                 |         |         |
| encargado-barra-index        |  ✅   |    ✅    |           |    ✅     |          |            |           |             |                 |         |         |
| encargado-barra-personal     |  ✅   |    ✅    |           |    ✅     |          |            |           |             |                 |         |         |
| encargado-barra-noche        |  ✅   |    ✅    |           |    ✅     |          |            |           |             |                 |         |         |
| encargado-recepcion          |  ✅   |    ✅    |           |    ✅     |          |            |           |             |                 |         |         |
| encargado-caja-index         |  ✅   |    ✅    |           |           |    ✅    |            |           |             |                 |         |         |
| encargado-caja-personal      |  ✅   |    ✅    |           |           |    ✅    |            |           |             |                 |         |         |
| encargado-caja-noche         |  ✅   |    ✅    |           |           |    ✅    |            |           |             |                 |         |         |
| **Staff**                    |       |          |           |           |          |            |           |             |                 |         |         |
| staff-caja-index             |  ✅   |    ✅    |           |           |          |     ✅     |    ✅     |             |                 |         |         |
| staff-barra-index            |   —   |    —     |     —     |     —     |    —     |     —      |     —     |      —      |        —        |    —    |    —    |
| **Gerencia**                 |       |          |           |           |          |            |           |             |                 |         |         |
| balance-semanal              |  ✅   |    ✅    |           |           |          |            |           |             |                 |         |   ✅    |
| **Sin guard**                |       |          |           |           |          |            |           |             |                 |         |         |
| members/my-qr                |   —   |    —     |     —     |     —     |    —     |     —      |     —     |      —      |        —        |    —    |    —    |
| scanner-mock                 |   —   |    —     |     —     |     —     |    —     |     —      |     —     |      —      |        —        |    —    |    —    |
| test-devenciones             |   —   |    —     |     —     |     —     |    —     |     —      |     —     |      —      |        —        |    —    |    —    |
| prototypes/\* (4)            |   —   |    —     |     —     |     —     |    —     |     —      |     —     |      —      |        —        |    —    |    —    |

> `—` = sin guardOrRedirect (acceso libre o página de prueba)

---

## 3. Navigation Graph by Module

### Admin

```mermaid
flowchart LR
    AI[admin-index] --> AW[admin-workdays]
    AI --> ACS[admin-central-stock]
    AI --> AP[admin-pagos]
    AI --> AS[admin-solicitudes]
    AI --> AR[admin-reportes]
    AI --> ASem[admin-semanal]
    AI --> AC[admin-config]
    AI --> OI[operativo-index]

    ACS --> AI
    ACS --> AC
    AP --> AI
    AP --> AC
    AS --> AI
    AS --> AC
    AW --> AI
    AW --> AC
    AR --> AI
    ASem --> AI

    subgraph Masters
        AMP[admin-master-proveedores]
        AMC[admin-master-categorias]
        AMN[admin-master-nomina]
        AMT[admin-master-tarifario]
        AMPOS[admin-master-pos]
    end

    AMP <--> AMC
    AMP <--> AMN
    AMP <--> AMT
    AMP <--> AMPOS
    AMP --> AI
    AMP --> ACS
    AMP --> AP

    subgraph QR
        QI[qr/index] --> QG[qr/generator]
        QG --> QI
        QM[qr/monitor] --> QI
    end

    AI ~~~ QI
    QI --> AI
    QG --> AI
```

### Operativo

```mermaid
flowchart LR
    OI[operativo-index] --> OW[operativo-workday]
    OI --> OS[operativo-stock]
    OI --> OSol[operativo-solicitudes]
    OI --> CMS[cms-members]
    OI --> OMSKU[operativo-master-sku]

    OW --> OI
    OW --> OSol
    OS --> OI
    OSol --> OI
    CMS --> OI
    OMSKU --> OI
    OMP[operativo-master-proveedores] --> OI
    OA[operativo-analisis] --> OI
    SC[scanner] --> OI
```

### Logística

```mermaid
flowchart LR
    subgraph Topbar Navigation
        LI[logistica-index]
        LS[logistica-stock]
        LD[logistica-distribucion]
        LR[logistica-recepcion]
        LSeg[logistica-seguimiento]
    end

    LI <--> LS
    LI <--> LD
    LI <--> LR
    LI <--> LSeg
    LS <--> LD
    LS <--> LR
    LS <--> LSeg
```

### Encargados

```mermaid
flowchart LR
    subgraph Barra
        EBI[enc-barra-index] --> EBP[enc-barra-personal]
        EBI --> EBN[enc-barra-noche]
        EBI --> ER[enc-recepcion]
        EBP --> EBI
        EBN --> EBI
        ER --> EBI
    end

    subgraph Caja
        ECI[enc-caja-index] --> ECP[enc-caja-personal]
        ECI --> ECN[enc-caja-noche]
        ECP --> ECI
        ECN --> ECI
    end
```

### Staff / Gerencia / Other

```mermaid
flowchart LR
    SCI[staff-caja-index] --> ROOT["/index.html (root)"]
    SBI[staff-barra-index] -.- ISOLATED["(no outbound links)"]
    BS[balance-semanal] --> AI[admin-index]
    MQR[members/my-qr] -.- ISOLATED2["(isolated)"]
    SM[scanner-mock] -.- ISOLATED3["(isolated)"]
```

---

## 4. Cross-Module Links

| Desde            | Hacia                | Tipo            |
| ---------------- | -------------------- | --------------- |
| admin-index      | operativo-index      | Launcher card   |
| balance-semanal  | admin-index          | Breadcrumb back |
| staff-caja-index | /index.html (root)   | Breadcrumb back |
| login.html       | (role-based landing) | Auth redirect   |

---

## 5. Isolated Pages (no inbound links from any other page)

| Página                                        | Tipo       | Nota                                                  |
| --------------------------------------------- | ---------- | ----------------------------------------------------- |
| `scanner-mock.html`                           | Test       | QR scanner mock for dev                               |
| `members/my-qr.html`                          | Public     | Member QR display                                     |
| `admin/test-devenciones.html`                 | Test       | Accruals test page                                    |
| `prototypes/*` (4 pages)                      | Lab        | Design prototypes                                     |
| `staff/staff-barra-index.html`                | Production | ⚠ No inbound links — only reachable via Auth redirect |
| `operativo/operativo-analisis.html`           | Production | ⚠ No launcher card in operativo-index                 |
| `operativo/operativo-master-proveedores.html` | Production | ⚠ No launcher card in operativo-index                 |

---

## 6. Stats

| Metric                    | Value |
| ------------------------- | ----- |
| Total HTML pages          | 47    |
| With guardOrRedirect      | 38    |
| Without guard             | 9     |
| Unique roles              | 11    |
| Cross-module links        | 4     |
| Isolated production pages | 3     |
| Test/prototype pages      | 6     |
