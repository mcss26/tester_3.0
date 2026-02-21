# Estado Presente del Proyecto - FormulaMid 4

> **Fecha**: 19/02/2026 22:20
> **Versión**: 4.1.0 (onclick migration + docs audit)
> **Estado General**: 🟡 En Desarrollo / Consolidación
> **Fuente de Verdad**: Este documento

---

## 📊 Métricas Clave

| Métrica                      | Estado Actual | Variación (vs anterior)                                                                          |
| :--------------------------- | :------------ | :----------------------------------------------------------------------------------------------- |
| **Pantallas Operativas**     | **50**        | +3 (recount: 45 pages/ + 3 prototipos + 2 root)                                                  |
| **Tablas en Base de Datos**  | **65**        | +5 vs anterior (GBOL API + audit_config + work_day_templates)                                    |
| **Vistas SQL (public)**      | **27**        | +5 vistas remediación (night_snapshot, stock_audit, pnl_monthly, financial_week, finance_weekly) |
| **Módulos JS**               | **42**        | −1 (recount verificado)                                                                          |
| **Core JS**                  | **20**        | +2 (navigation-debug, navigation-analytics)                                                      |
| **Importers JS**             | **6**         | Sin cambio                                                                                       |
| **Archivos CSS**             | **18**        | −1 (recount verificado)                                                                          |
| **Roles Configurados**       | **11**        | −1 (recount: 11 en REGISTRY.yml)                                                                 |
| **Skills Activos**           | **23**        | +8 vs anterior (23 en REGISTRY.yml, 23 carpetas en .agent/skills/)                               |
| **Documentación de Módulos** | **37**        | −1 vs anterior (eliminado `operativo-erp.md` huérfano)                                           |
| **Recetas Master**           | **93**        | Verificado ✅                                                                                    |
| **Members Registrados**      | **2,245**     | +2 (live query)                                                                                  |
| **Proveedores Activos**      | **47**        | Verificado ✅                                                                                    |
| **SKUs Activos**             | **26**        | Corrección: eran 26 (no 58)                                                                      |
| **Profiles (Users)**         | **4**         | Live query                                                                                       |
| **Work Days**                | **5**         | Live query                                                                                       |
| **Events**                   | **7**         | Live query                                                                                       |

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
| 🔴 Members       |    0    | `pages/members/*.html`    | Migrado a `midnightclub` (página pública)              |
| 🛠️ Dev Utilities |    3    | `pages/*.html`            | Components Catalog, Layout Patterns, Module Audit      |
| 🧪 Prototypes    |    3    | `pages/prototypes/*.html` | lab-balance-semanal, lab-workdays, lab-workdays-night  |
| 🏠 Root          |    2    | `/*.html`                 | index.html (redirect) + login.html                     |
| **TOTAL**        | **49**  | —                         | — (my-qr migrado a midnightclub)                       |

### Módulos JavaScript

| Área                 | Archivos | Directorio                                     |
| :------------------- | :------: | :--------------------------------------------- |
| Admin                |    17    | `assets/js/modules/admin/` (14 módulos + 3 QR) |
| Operativo            |    10    | `assets/js/modules/operativo/`                 |
| Encargados           |    7     | `assets/js/modules/encargados/`                |
| Logística            |    5     | `assets/js/modules/logistica/`                 |
| Gerencia             |    1     | `assets/js/modules/gerencia/`                  |
| Staff                |    1     | `assets/js/modules/staff/`                     |
| Members              |    0     | `assets/js/members/` (migrado a midnightclub)  |
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

### Scripts de Utilidad (20 ejecutables en `scripts/`)

| Script                     | Propósito                                             |
| :------------------------- | :---------------------------------------------------- |
| `audit-css.js`             | Auditoría CSS                                         |
| `audit-links.js`           | Auditoría de links internos                           |
| `audit-modules.js`         | Auditoría automática de módulos                       |
| `audit.mjs`                | Auditoría general                                     |
| `extract-recipes.js`       | Extracción de recetas                                 |
| `security-watchdog.ps1`    | Watchdog de seguridad (permisos, integridad, leaks)   |
| `security-startup.ps1`     | Checks iniciales al abrir VS Code                     |
| `security-shutdown.ps1`    | Checks finales al cerrar VS Code                      |
| `backup-configs.ps1`       | Backup de configs (.env, credenciales) en ZIP         |
| `ops-watchdog.ps1`         | Watchdog operativo (health checks continuos)          |
| `flow-tracer.ps1`          | Trazador de flujos v2 (nav, tablas R/W, cross-module) |
| `context-loader.ps1`       | Generador de contexto por tópico (KIs + código + git) |
| `workdays-verifier.ps1`    | Verifier progresivo 8 fases para admin-workdays       |
| `batch-remediation.ps1`    | Orquestador batch UI remediation (Gemini CLI)         |
| `db-batch-remediation.ps1` | Orquestador batch DB remediation (SQL migrations)     |
| `persona_generator.py`     | Generador de personas sintéticas                      |
| `testing-tracker.js`       | Tracker de testing por módulo                         |
| `auto-prompter.ps1`        | Generador de prompts batch para Gemini CLI            |
| `ui-component-scanner.ps1` | Scanner de componentes UI por página (compliance)     |

---

## 🗄️ Base de Datos (Supabase - FormulaMid)

### Tablas (65 en schema `public`)

| Dominio           | Tablas                                                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Identity**      | `profiles`, `staff_functions`, `profile_functions`                                                                                                                  |
| **Work Days**     | `work_days`, `work_day_staff_planning`, `work_day_templates`, `events`                                                                                              |
| **Staff**         | `master_staff_roles`, `staff_convocations`, `staff_accruals`                                                                                                        |
| **Inventory**     | `master_categories`, `master_sku`, `inventory_stock`, `inventory_ideal`, `inventory_stock_adjustments`, `inventory_movements`                                       |
| **Suppliers**     | `master_proveedores`                                                                                                                                                |
| **Replenishment** | `replenishment_requests`, `replenishment_items`, `replenishment_supplier_orders`, `replenishment_receipts`, `replenishment_receipt_items`, `replenishment_tracking` |
| **Finance**       | `finance_payments`, `finance_payment_rules`, `finance_opening_cost_defs`, `finance_weekly_closings`, `cost_definitions`, `cost_config`, `accounts_payable`          |
| **Cash**          | `cash_closings`, `closing_terminals`, `cash_movements`, `pos_terminals`, `pos_terminals_alias`, `payment_categories`, `payment_methods`                             |
| **Bar**           | `bar_sessions`, `bar_stock_snapshots`, `bar_session_sales`, `master_recipes`, `recipe_code_mappings`                                                                |
| **Revenue**       | `revenue_reports`, `revenue_details`, `consumption_reports`, `consumption_details`                                                                                  |
| **QR/Members**    | `qr_batches`, `qr_codes`, `qr_checkins`, `members`, `auth_audit_log`                                                                                                |
| **Import/GBOL**   | `import_gbol_facturacion`, `import_gbol_comandas`, `import_gbol_withdrawals`, `gbol_sync_log`, `import_logs`                                                        |
| **Staging**       | `stg_extracciones`, `stg_gbol_items`, `stg_passline_tickets`, `stg_afip_facturas`                                                                                   |
| **Config**        | `site_config`, `audit_config`, `menu_categories`, `menu_items`, `sku_change_requests`                                                                               |

> **Detalle completo**: Ver [scheme.md](./scheme.md) para columnas, FKs, checks y mapa módulo↔tabla.

### Vistas SQL (27 en schema `public`)

| Vista                          | Dominio                  | Estado       |
| :----------------------------- | :----------------------- | :----------- |
| `v_admin_stock`                | Inventario               | ✅           |
| `vw_bar_audit_variance`        | Auditoría Barra          | ✅           |
| `vw_bar_efficiency`            | Eficiencia Barra         | ✅           |
| `vw_consumo_teorico`           | Consumo Teórico SKU      | ✅           |
| `vw_daily_sales`               | Ventas Diarias           | ✅           |
| `vw_daily_sales_v2`            | Ventas Diarias v2        | ✅           |
| `vw_finance_weekly`            | Balance Semanal Gerencia | 🆕 migración |
| `vw_financial_week_live`       | Balance Semanal Live     | 🆕 migración |
| `vw_fiscal_summary`            | Resumen Fiscal           | ✅           |
| `vw_night_snapshot`            | Snapshot Nocturno        | 🆕 migración |
| `vw_per_capita_revenue`        | Revenue Per Capita       | ✅           |
| `vw_pnl_monthly_v2`            | P&L Mensual v2           | 🆕 migración |
| `vw_recipe_profitability`      | Rentabilidad Recetas     | ✅           |
| `vw_reconcile_afip_gbol`       | Conciliación AFIP/GBOL   | ✅           |
| `vw_sku_ideal_dynamic`         | Stock Ideal Dinámico     | ✅           |
| `vw_staff_accruals_summary`    | Devengados de Staff      | ✅           |
| `vw_staff_performance`         | Performance Staff        | ✅           |
| `vw_stock_audit_nightly`       | Auditoría Stock Noche    | 🆕 migración |
| `vw_stock_global`              | Stock Global             | ✅           |
| `vw_supplier_orders_admin`     | Órdenes Admin            | ✅           |
| `vw_supplier_orders_encargado` | Órdenes Encargado        | ✅           |
| `vw_tax_monthly`               | Impuestos Mensuales      | ✅           |
| `vw_work_day_summary`          | Resumen Jornada          | ✅           |
| `vw_workday_benchmarks`        | Benchmarks por Día       | ✅           |
| `vw_workday_pnl`               | P&L por Jornada          | ✅           |

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

- **Admin Workdays**: Módulo verificado 100/100 (verifier progresivo), pendiente Sprint 5 (live badge)
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

```text
tester_3.0/
├── .agent/                    # Agent tooling (gitignored)
│   ├── agents/                # 7 sub-agentes (frontend, logic, data, qa, product, orchestrator, security-ops)
│   ├── skills/                # 23 skills atómicos
│   ├── workflows/             # 5 workflows (apply-components, design-system-audit, orch-workflow, testing-pipeline, verify-components)
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
│   ├── architecture/            # Source of truth (esquema, estado, flujos, guías, planes)
│   │   ├── flows/               # Flujos de negocio (3 docs)
│   │   └── guides/              # Guías técnicas (3 docs)
│   ├── modules/                 # 37 fichas de módulo
│   ├── testing/                 # Tickets, observations, plans
│   ├── reference/               # Datos externos inmutables (specs, xlsx, csv)
│   │   └── external-data/       # Archivos externos (Gbol, Passline, Zoco)
│   ├── _generated/              # Output por agente/script (10 subdirs)
│   │   ├── frontend/            # Auditorías CSS, design system
│   │   ├── orchestrator/        # Planes, prompts, changelogs
│   │   ├── qa/                  # Auditorías de coherencia
│   │   ├── ui-scan/             # Scans de compliance por página
│   │   ├── repo-audit/          # Auditorías de repo
│   │   └── migration/           # Artifacts de migración WorkDays
│   └── INDEX.md                 # Índice de documentación
├── pages/                     # 45 pantallas + 3 prototipos + 2 root = 50
├── scripts/                   # 20 scripts (5 audit + 7 ops PS1 + 3 security PS1 + 3 batch + 2 misc)
├── supabase/                  # Edge functions + 26 migrations (7 legacy + 9 batch + 10 fixes)
├── test-data/                 # Datos de prueba sintéticos
├── AGENT.md                   # Reglas globales de agentes
├── index.html                 # Redirect
└── login.html                 # Entry point
```

---

## 📝 Última Actualización

**Fecha**: 19/02/2026 22:20
**Cambios**:

- **Fix `vw_workday_pnl`**: CTE `extras_totals` ahora lee `finance_payments` (status APPROVED) en vez de `accounts_payable` (vacía)
  - Migración: `20260217063000_fix_pnl_expense_extras.sql`
  - Cascada: 5 vistas dependientes actualizadas automáticamente
- **`stock_loss` validado**: Ya existía en `vw_night_snapshot` (no requirió migración)
- **UI Re-scan**: Score promedio 59/100, 3 compliant, 34 parciales, 7 críticas
  - Baseline guardado para futuras comparaciones
  - Reporte: `docs/_generated/ui-scan/rescan-report-20260217-0639.md`
- **Migraciones Supabase**: 26 totales (7 legacy + 9 batch + 10 fixes)

---

> [!IMPORTANT]
> **Este documento debe actualizarse inmediatamente después de cada cambio significativo**.
>
> Ver reglas completas en: [AGENTS.md](../AGENTS.md)

---
