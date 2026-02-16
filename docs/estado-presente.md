# Estado Presente del Proyecto - FormulaMid 4

> **Fecha**: 16/02/2026 00:10
> **Versión**: 4.0.5 (Docs Sync)
> **Estado General**: 🟡 En Desarrollo / Consolidación
> **Fuente de Verdad**: Este documento

---

## 📊 Métricas Clave

| Métrica                      | Estado Actual | Variación (vs anterior)                     |
| :--------------------------- | :------------ | :------------------------------------------ |
| **Pantallas Operativas**     | **47**        | −1 (recount: 45 pages/ + 2 root)            |
| **Tablas en Base de Datos**  | **60**        | Corrección: eran 60 (no 48)                 |
| **Vistas SQL (public)**      | **18**        | Verificado ✅                               |
| **Módulos JS**               | **42**        | −1 (recount verificado)                     |
| **Core JS**                  | **20**        | +2 (navigation-debug, navigation-analytics) |
| **Importers JS**             | **6**         | Sin cambio                                  |
| **Archivos CSS**             | **18**        | −1 (recount verificado)                     |
| **Roles Configurados**       | **12**        | Sin cambio                                  |
| **Skills Activos**           | **13**        | −3 (cleanup previo)                         |
| **Documentación de Módulos** | **38**        | +4 (excl. template, verificado)             |
| **Recetas Master**           | **93**        | Verificado ✅                               |
| **Members Registrados**      | **2,245**     | +2 (live query)                             |
| **Proveedores Activos**      | **47**        | Verificado ✅                               |
| **SKUs Activos**             | **26**        | Corrección: eran 26 (no 58)                 |
| **Profiles (Users)**         | **4**         | Live query                                  |
| **Work Days**                | **5**         | Live query                                  |
| **Events**                   | **7**         | Live query                                  |

---

## 🗃️ Inventario de Archivos Vivos

### Páginas HTML por Contexto

| Contexto         | Páginas | Directorio                | Detalle                                                |
| :--------------- | :-----: | :------------------------ | :----------------------------------------------------- |
| 🔵 Admin         |   15    | `pages/admin/*.html`      | Index + Ops + Masters + Config + Test-devenciones      |
| 🔵 Admin QR      |    3    | `pages/admin/qr/*.html`   | Index, Generator, Monitor                              |
| 🟢 Operativo     |    9    | `pages/operativo/*.html`  | Index + ERP + CMS + Masters + Scanner                  |
| 📦 Logística     |    5    | `pages/logistica/*.html`  | Index + Stock + Distribución + Recepción + Seguimiento |
| 🟠 Encargados    |    7    | `pages/encargados/*.html` | Barra (3) + Caja (3) + Recepción                       |
| 🟡 Staff         |    2    | `pages/staff/*.html`      | Barra + Caja                                           |
| 🟣 Gerencia      |    1    | `pages/gerencia/*.html`   | Balance Semanal                                        |
| 🔴 Members       |    1    | `pages/members/*.html`    | My QR                                                  |
| 🛠️ Dev Utilities |    3    | `pages/*.html`            | Components Catalog, Layout Patterns, Module Audit      |
| 🏠 Root          |    2    | `/*.html`                 | index.html (redirect) + login.html                     |
| **TOTAL**        | **47**  | —                         | —                                                      |

### Módulos JavaScript

| Área                 | Archivos | Directorio                                     |
| :------------------- | :------: | :--------------------------------------------- |
| Admin                |    17    | `assets/js/modules/admin/` (14 módulos + 3 QR) |
| Operativo            |    10    | `assets/js/modules/operativo/`                 |
| Encargados           |    7     | `assets/js/modules/encargados/`                |
| Logística            |    5     | `assets/js/modules/logistica/`                 |
| Gerencia             |    1     | `assets/js/modules/gerencia/`                  |
| Staff                |    1     | `assets/js/modules/staff/`                     |
| Members              |    1     | `assets/js/members/`                           |
| Root                 |    1     | `assets/js/modules/login.js`                   |
| **Subtotal Módulos** |  **42**  | —                                              |
| Core                 |    20    | `assets/js/core/`                              |
| Importers            |    6     | `assets/js/importers/`                         |
| **TOTAL JS**         |  **68**  | —                                              |

### Archivos CSS (18 archivos)

| Archivo                   | Propósito                  |
| :------------------------ | :------------------------- |
| `components.css`          | Componentes globales       |
| `admin-central-stock.css` | Módulo Central Stock       |
| `cms-members.css`         | Módulo CMS Members         |
| `admin-pagos.css`         | Módulo Pagos               |
| `admin-master.css`        | Maestros admin             |
| `admin-workdays.css`      | Módulo Workdays            |
| `balance-semanal.css`     | Balance Semanal (gerencia) |
| `pages/admin-index.css`   | Estilos de índices admin   |
| `tokens.css`              | Design tokens `:root`      |
| `admin-solicitudes.css`   | Módulo Solicitudes         |
| `admin-semanal.css`       | Balance Semanal (admin)    |
| `launcher.css`            | Launcher/Dashboard         |
| `admin-config.css`        | Admin Config               |
| `admin-reportes.css`      | Admin Reportes             |
| `encargado-noche.css`     | Encargado Noche            |
| `members.css`             | Members (My QR)            |
| `scanner.css`             | Scanner                    |
| `staff-caja.css`          | Staff Caja                 |

### Documentación por Módulo

| Área       |  Docs  | Directorio                 |
| :--------- | :----: | :------------------------- |
| Admin      |   12   | `docs/modules/admin/`      |
| Operativo  |   9    | `docs/modules/operativo/`  |
| Encargados |   7    | `docs/modules/encargados/` |
| Logística  |   5    | `docs/modules/logistica/`  |
| Gerencia   |   1    | `docs/modules/gerencia/`   |
| Members    |   1    | `docs/modules/members/`    |
| Staff      |   2    | `docs/modules/staff/`      |
| Misc       |   1    | `docs/modules/misc/`       |
| **TOTAL**  | **38** | —                          |

### Scripts de Utilidad (5 archivos en `scripts/`)

| Script               | Propósito                       |
| :------------------- | :------------------------------ |
| `audit-css.js`       | Auditoría CSS                   |
| `audit-links.js`     | Auditoría de links internos     |
| `audit-modules.js`   | Auditoría automática de módulos |
| `audit.mjs`          | Auditoría general               |
| `extract-recipes.js` | Extracción de recetas           |

---

## 🗄️ Base de Datos (Supabase - FormulaMid)

### Tablas (60 en schema `public`)

| Dominio           | Tablas                                                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Identity**      | `profiles`, `staff_functions`, `profile_functions`                                                                                                                  |
| **Work Days**     | `work_days`, `work_day_staff_planning`, `events`                                                                                                                    |
| **Staff**         | `master_staff_roles`, `staff_convocations`, `staff_accruals`                                                                                                        |
| **Inventory**     | `master_categories`, `master_sku`, `inventory_stock`, `inventory_ideal`, `inventory_stock_adjustments`, `inventory_movements`                                       |
| **Suppliers**     | `master_proveedores`                                                                                                                                                |
| **Replenishment** | `replenishment_requests`, `replenishment_items`, `replenishment_supplier_orders`, `replenishment_receipts`, `replenishment_receipt_items`, `replenishment_tracking` |
| **Finance**       | `finance_payments`, `finance_payment_rules`, `finance_opening_cost_defs`, `finance_weekly_closings`, `cost_definitions`, `cost_config`, `accounts_payable`          |
| **Cash**          | `cash_closings`, `closing_terminals`, `cash_movements`, `pos_terminals`, `pos_terminals_alias`, `payment_categories`, `payment_methods`                             |
| **Bar**           | `bar_sessions`, `bar_stock_snapshots`, `bar_session_sales`, `master_recipes`, `recipe_code_mappings`                                                                |
| **Revenue**       | `revenue_reports`, `revenue_details`, `consumption_reports`, `consumption_details`                                                                                  |
| **QR/Members**    | `qr_batches`, `qr_codes`, `qr_checkins`, `members`, `auth_audit_log`                                                                                                |
| **Staging**       | `stg_extracciones`, `stg_gbol_items`, `stg_passline_tickets`, `stg_afip_facturas`                                                                                   |
| **Config**        | `site_config`, `audit_config`, `menu_categories`, `menu_items`, `import_logs`, `sku_change_requests`                                                                |

### Vistas SQL (18 en schema `public`)

| Vista                          | Dominio                |
| :----------------------------- | :--------------------- |
| `v_admin_stock`                | Inventario             |
| `vw_bar_audit_variance`        | Auditoría Barra        |
| `vw_bar_efficiency`            | Eficiencia Barra       |
| `vw_daily_sales`               | Ventas Diarias         |
| `vw_daily_sales_v2`            | Ventas Diarias v2      |
| `vw_finance_weekly`            | Balance Semanal        |
| `vw_financial_week_live`       | Semana Financiera Live |
| `vw_pnl_monthly_v2`            | P&L Mensual            |
| `vw_recipe_profitability`      | Rentabilidad Recetas   |
| `vw_reconcile_afip_gbol`       | Conciliación AFIP/GBOL |
| `vw_sku_ideal_dynamic`         | Stock Ideal Dinámico   |
| `vw_staff_accruals_summary`    | Devengados de Staff    |
| `vw_staff_performance`         | Performance Staff      |
| `vw_stock_global`              | Stock Global           |
| `vw_supplier_orders_admin`     | Órdenes Admin          |
| `vw_supplier_orders_encargado` | Órdenes Encargado      |
| `vw_tax_monthly`               | Impuestos Mensuales    |
| `vw_work_day_summary`          | Resumen Jornada        |

---

## 🚦 Semáforo de Módulos

### 🟢 Completos y Verificados

- **Navigation System**: Unificación de rutas y estado global
- **Sistema de Autenticación**: `Auth.guardOrRedirect()` en 91% de módulos
- **Staff Caja (Operativo)**: Flujo completo con firma digital y cierre ciego
- **Gestión de Stock**: Vistas `vw_stock_global` y ajustes validados
- **Balance Semanal**: Vista SQL `vw_finance_weekly` y dashboard implementado
- **Arqueo de Recaudación**: Comparación consumo real vs esperado
- **CSS Architecture**: 100% páginas migradas a `tokens.css` + `components.css`
- **Blocking UX**: 0 `alert()` / `confirm()` nativos en módulos auditados
- **Workspace Hygiene**: Score 11/10 post-audit (15/02/2026)

### 🟡 En Progreso / Calidad Beta

- **Admin Workdays**: Planner de staff en desarrollo
- **Admin Solicitudes**: Refactorización de lógica de aprobación
- **Reportes de Eficiencia**: Vistas creadas, falta integración UI
- **Logística**: Módulos funcionales, pendiente polish visual
- **Admin Config**: Módulo de configuración funcional
- **CMS Members**: Acceso operativo en validación
- **Inline Styles**: ~25 páginas con estilos inline pendientes

### 🔴 Pendiente / Bloqueado

- **Agente IA (Antigravity Agent)**: ⚠️ **PAUSADO** hasta consolidación del legacy
- **Sandbox WYSIWYG**: Archivado

---

## 🛠️ Deuda Técnica Identificada

|  #  | Issue                   | Status       | Detalle                                                       |
| :-: | :---------------------- | :----------- | :------------------------------------------------------------ |
|  1  | CSS Legacy (`main.css`) | ✅ ELIMINADO | Archivo borrado, 0 imports restantes                          |
|  2  | Blocking UX             | ✅ RESUELTO  | 0 ocurrencias de `alert()`/`confirm()`                        |
|  3  | CSS Duplicates          | ✅ RESUELTO  | Selectores consolidados en `components.css`                   |
|  4  | Inline Styles           | ⏳ PENDIENTE | ~25 páginas con estilos inline                                |
|  5  | Orphan JS               | ⏳ PENDIENTE | `operativo-erp.js` sin HTML directo (posible módulo auxiliar) |
|  6  | Hardcoded Colors        | ⏳ PENDIENTE | 18 HEX en chart.js configs                                    |
|  7  | Docs gaps               | ✅ RESUELTO  | Los 5 docs faltantes ahora existen                            |
|  8  | Legacy Logs in .agent   | ✅ RESUELTO  | Logs consolidados en `docs/logs/`                             |
|  9  | Duplicate Specs         | ✅ RESUELTO  | `feature-spec-drinks-by-web copy.md` eliminados               |

---

## 🏗️ Estructura del Workspace (Post-Audit)

```
tester_3.0/
├── .agent/                    # Agent tooling (gitignored)
│   ├── agents/                # 5 sub-agentes (frontend, logic, data, qa, product)
│   ├── skills/                # 13 skills atómicos
│   ├── workflows/             # 1 workflow (track-module)
│   ├── README.md              # Gobernanza del sistema de agentes
│   └── REGISTRY.yml           # Routing canónico + tiers de riesgo
├── .gemini/antigravity/       # Knowledge (fuente de verdad)
│   ├── knowledge/             # KIs persistentes
│   └── brain/                 # Artifacts por conversación
├── assets/
│   ├── css/                   # 18 archivos CSS
│   │   ├── tokens.css         # Design tokens (INMUTABLE)
│   │   ├── components.css     # Componentes globales (140KB)
│   │   └── pages/             # CSS específico (admin-index.css)
│   └── js/
│       ├── core/              # 20 utilidades compartidas
│       ├── modules/           # 42 módulos de negocio
│       ├── importers/         # 6 importadores
│       └── members/           # 1 módulo members
├── docs/
│   ├── guides/                # 3 guías técnicas
│   ├── important-data-reference/ # Datos de referencia (xlsx, csv, specs)
│   ├── migration/             # Migración WorkDays + Balance
│   ├── modules/               # 38 fichas de módulo
│   ├── output/                # Output por agente (6 subdirs)
│   └── 5 docs canónicos
├── pages/                     # 45 pantallas + 3 prototipos + 2 root
├── scripts/                   # 5 scripts de utilidad
├── supabase/                  # Edge functions
├── test-data/                 # Datos de prueba sintéticos
├── AGENT.md                   # Reglas globales de agentes
├── index.html                 # Redirect
└── login.html                 # Entry point
```

---

## 📝 Última Actualización

**Fecha**: 16/02/2026 00:10
**Cambios**:

- **Docs Sync**: Métricas corregidas contra filesystem real (scripts 18→5, modules docs 34→38, JS 43→42, skills 16→13)
- **Agent Infra**: Indexados agents/ (5 sub-agentes), REGISTRY.yml, AGENT.md
- **Deuda #7**: Marcada como RESUELTO (los 5 docs faltantes ya existen)
- **Workspace Tree**: Corregido (eliminado `docs/architecture/` fantasma, conteos actualizados)
- **Supabase Project ID**: `iyknbgmcnbpvalvsjxjz` (región us-west-2)

---

> [!IMPORTANT]
> **Este documento debe actualizarse inmediatamente después de cada cambio significativo**.
>
> Ver reglas completas en: [AGENT.md](../AGENT.md)

---
