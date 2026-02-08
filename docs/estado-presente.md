# Estado Presente del Proyecto - FormulaMid 4

> **Fecha**: 08/02/2026 12:07
> **Versión**: 4.0.1 (Post-Audit Cleanup)
> **Estado General**: 🟡 En Desarrollo / Consolidación
> **Fuente de Verdad**: Este documento

---

## 📊 Métricas Clave

| Métrica                     | Estado Actual | Variación (vs anterior) |
| :-------------------------- | :------------ | :---------------------- |
| **Pantallas Operativas**    | **48**        | Sin cambio              |
| **Tablas en Base de Datos** | **60**        | Corrección: eran 60 (no 48) |
| **Vistas SQL (public)**     | **18**        | Verificado ✅            |
| **Módulos JS**              | **43**        | +1 (recount ajustado)   |
| **Core JS**                 | **18**        | Sin cambio              |
| **Importers JS**            | **6**         | Sin cambio              |
| **Archivos CSS**            | **13**        | +1 (launcher, admin-index; main.css eliminado) |
| **Roles Configurados**      | **12**        | Sin cambio              |
| **Skills Activos**          | **14**        | +2 (brand-developer, creative-director) |
| **Documentación de Módulos**| **34**        | Sin cambio              |
| **Recetas Master**          | **93**        | Verificado ✅            |
| **Members Registrados**     | **2,245**     | +2 (live query)         |
| **Proveedores Activos**     | **47**        | Verificado ✅            |
| **SKUs Activos**            | **26**        | Corrección: eran 26 (no 58) |
| **Profiles (Users)**        | **4**         | Live query              |
| **Work Days**               | **5**         | Live query              |
| **Events**                  | **7**         | Live query              |

---

## 🗃️ Inventario de Archivos Vivos

### Páginas HTML por Contexto

| Contexto | Páginas | Directorio | Detalle |
|:---------|:-------:|:-----------|:--------|
| 🔵 Admin | 15 | `pages/admin/*.html` | Index + Ops + Masters + Config + Test-devenciones |
| 🔵 Admin QR | 3 | `pages/admin/qr/*.html` | Index, Generator, Monitor |
| 🟢 Operativo | 9 | `pages/operativo/*.html` | Index + ERP + CMS + Masters + Scanner |
| 📦 Logística | 5 | `pages/logistica/*.html` | Index + Stock + Distribución + Recepción + Seguimiento |
| 🟠 Encargados | 7 | `pages/encargados/*.html` | Barra (3) + Caja (3) + Recepción |
| 🟡 Staff | 2 | `pages/staff/*.html` | Barra + Caja |
| 🟣 Gerencia | 1 | `pages/gerencia/*.html` | Balance Semanal |
| 🔴 Members | 1 | `pages/members/*.html` | My QR |
| 🛠️ Dev Utilities | 3 | `pages/*.html` | Components Catalog, Layout Patterns, Module Audit |
| 🏠 Root | 2 | `/*.html` | index.html (redirect) + login.html |
| **TOTAL** | **48** | — | — |

### Módulos JavaScript

| Área | Archivos | Directorio |
|:-----|:--------:|:-----------|
| Admin | 17 | `assets/js/modules/admin/` (14 módulos + 3 QR) |
| Operativo | 10 | `assets/js/modules/operativo/` |
| Encargados | 7 | `assets/js/modules/encargados/` |
| Logística | 5 | `assets/js/modules/logistica/` |
| Gerencia | 1 | `assets/js/modules/gerencia/` |
| Staff | 1 | `assets/js/modules/staff/` |
| Members | 1 | `assets/js/members/` |
| Root | 1 | `assets/js/modules/login.js` |
| **Subtotal Módulos** | **43** | — |
| Core | 18 | `assets/js/core/` |
| Importers | 6 | `assets/js/importers/` |
| **TOTAL JS** | **67** | — |

### Archivos CSS (13 archivos)

| Archivo | Tamaño | Propósito |
|:--------|:------:|:----------|
| `components.css` | 140KB | Componentes globales |
| `admin-central-stock.css` | 42KB | Módulo Central Stock |
| `cms-members.css` | 11KB | Módulo CMS Members |
| `admin-pagos.css` | 11KB | Módulo Pagos |
| `admin-master.css` | 8.1KB | Maestros admin |
| `pages/admin-index.css` | 6.6KB | Estilos de índices admin |
| `tokens.css` | 5.6KB | Design tokens `:root` |
| `admin-solicitudes.css` | 5.3KB | Módulo Solicitudes |
| `admin-cierre.css` | 3.6KB | Módulo Cierre |
| `admin-semanal.css` | 3.5KB | Balance Semanal |
| `launcher.css` | 3KB | Launcher/Dashboard |
| `admin-config.css` | 1.8KB | Admin Config |
| `admin-reportes.css` | 1.6KB | Admin Reportes |

### Documentación por Módulo

| Área | Docs | Directorio |
|:-----|:----:|:-----------|
| Admin | 11 | `docs/modules/admin/` |
| Operativo | 9 | `docs/modules/operativo/` |
| Encargados | 7 | `docs/modules/encargados/` |
| Logística | 4 | `docs/modules/logistica/` |
| Staff | 2 | `docs/modules/staff/` |
| Misc | 1 | `docs/modules/misc/` |
| **TOTAL** | **34** | — |

### Scripts de Utilidad (9 archivos en `scripts/`)

| Script | Propósito |
|:-------|:----------|
| `audit-modules.js` | Auditoría automática de módulos |
| `audit.mjs` | Auditoría general |
| `extract-recipes.js` | Extracción de recetas |
| `insert-recipes.sql` | Inserción de recetas en DB |
| `find-mcp-artifacts.ps1` | Búsqueda de artefactos MCP |
| `mcp-drive-reset.ps1` | Reset de credenciales Drive MCP |
| `migration.sql` | Script de migración SQL |
| `migration_script.js` | Script de migración JS |
| `patch-ui-minimums.ps1` | Parche batch de mínimos UI |

---

## 🗄️ Base de Datos (Supabase - FormulaMid)

### Tablas (60 en schema `public`)

| Dominio | Tablas |
|:--------|:-------|
| **Identity** | `profiles`, `staff_functions`, `profile_functions` |
| **Work Days** | `work_days`, `work_day_staff_planning`, `events` |
| **Staff** | `master_staff_roles`, `staff_convocations`, `staff_accruals` |
| **Inventory** | `master_categories`, `master_sku`, `inventory_stock`, `inventory_ideal`, `inventory_stock_adjustments`, `inventory_movements` |
| **Suppliers** | `master_proveedores` |
| **Replenishment** | `replenishment_requests`, `replenishment_items`, `replenishment_supplier_orders`, `replenishment_receipts`, `replenishment_receipt_items`, `replenishment_tracking` |
| **Finance** | `finance_payments`, `finance_payment_rules`, `finance_opening_cost_defs`, `finance_weekly_closings`, `cost_definitions`, `cost_config`, `accounts_payable` |
| **Cash** | `cash_closings`, `closing_terminals`, `cash_movements`, `pos_terminals`, `pos_terminals_alias`, `payment_categories`, `payment_methods` |
| **Bar** | `bar_sessions`, `bar_stock_snapshots`, `bar_session_sales`, `master_recipes`, `recipe_code_mappings` |
| **Revenue** | `revenue_reports`, `revenue_details`, `consumption_reports`, `consumption_details` |
| **QR/Members** | `qr_batches`, `qr_codes`, `qr_checkins`, `members`, `auth_audit_log` |
| **Staging** | `stg_extracciones`, `stg_gbol_items`, `stg_passline_tickets`, `stg_afip_facturas` |
| **Config** | `site_config`, `audit_config`, `menu_categories`, `menu_items`, `import_logs`, `sku_change_requests` |

### Vistas SQL (18 en schema `public`)

| Vista | Dominio |
|:------|:--------|
| `v_admin_stock` | Inventario |
| `vw_bar_audit_variance` | Auditoría Barra |
| `vw_bar_efficiency` | Eficiencia Barra |
| `vw_daily_sales` | Ventas Diarias |
| `vw_daily_sales_v2` | Ventas Diarias v2 |
| `vw_finance_weekly` | Balance Semanal |
| `vw_financial_week_live` | Semana Financiera Live |
| `vw_pnl_monthly_v2` | P&L Mensual |
| `vw_recipe_profitability` | Rentabilidad Recetas |
| `vw_reconcile_afip_gbol` | Conciliación AFIP/GBOL |
| `vw_sku_ideal_dynamic` | Stock Ideal Dinámico |
| `vw_staff_accruals_summary` | Devengados de Staff |
| `vw_staff_performance` | Performance Staff |
| `vw_stock_global` | Stock Global |
| `vw_supplier_orders_admin` | Órdenes Admin |
| `vw_supplier_orders_encargado` | Órdenes Encargado |
| `vw_tax_monthly` | Impuestos Mensuales |
| `vw_work_day_summary` | Resumen Jornada |

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
- **Workspace Hygiene**: Score 10/10 post-audit (08/02/2026)

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

| # | Issue | Status | Detalle |
|:-:|:------|:-------|:--------|
| 1 | CSS Legacy (`main.css`) | ✅ ELIMINADO | Archivo borrado, 0 imports restantes |
| 2 | Blocking UX | ✅ RESUELTO | 0 ocurrencias de `alert()`/`confirm()` |
| 3 | CSS Duplicates | ✅ RESUELTO | Selectores consolidados en `components.css` |
| 4 | Inline Styles | ⏳ PENDIENTE | ~25 páginas con estilos inline |
| 5 | Orphan JS | ⏳ PENDIENTE | `operativo-erp.js` sin HTML directo (posible módulo auxiliar) |
| 6 | Hardcoded Colors | ⏳ PENDIENTE | 18 HEX en chart.js configs |
| 7 | Docs gaps | ⏳ PENDIENTE | Faltan: `logistica-seguimiento.md`, `admin-config.md`, `test-devenciones.md`, `gerencia/balance-semanal.md`, `members/my-qr.md` |

---

## 🏗️ Estructura del Workspace (Post-Audit)

```
tester_3.0/
├── .agent/                    # Agent tooling (gitignored)
│   ├── migrations/            # 3 SQL migration scripts
│   ├── rules/                 # 3 rule files
│   └── workflows/             # 1 workflow
├── .gemini/antigravity/       # Skills + Knowledge (fuente de verdad)
│   ├── skills/                # 14 skills activos
│   ├── knowledge/             # KIs persistentes
│   └── brain/                 # Artifacts por conversación
├── assets/
│   ├── css/                   # 13 archivos CSS
│   │   ├── tokens.css         # Design tokens (INMUTABLE)
│   │   ├── components.css     # Componentes globales (140KB)
│   │   └── pages/             # CSS específico (admin-index.css)
│   └── js/
│       ├── core/              # 18 utilidades compartidas
│       ├── modules/           # 43 módulos de negocio
│       ├── importers/         # 6 importadores
│       └── members/           # 1 módulo members
├── docs/
│   ├── architecture/          # Navegación y componentes
│   ├── guides/                # 3 guías técnicas
│   ├── modules/               # 34 fichas de módulo
│   └── 7 docs canónicos
├── pages/                     # 46 pantallas + 2 root
├── scripts/                   # 9 scripts de utilidad
├── supabase/                  # Edge functions
├── test-data/                 # Datos de prueba sintéticos
├── index.html                 # Redirect
└── login.html                 # Entry point
```

---

## 📝 Última Actualización

**Fecha**: 08/02/2026 12:12
**Cambios**:
- **DB Verificada (Live)**: Tablas reales = 60 (doc decía 48 — miscount corregido)
- **SKU Activos**: Corregido de 58 → 26 (dato real)
- **Members**: 2,243 → 2,245 (live)
- **Nuevas métricas**: Profiles (4), Work Days (5), Events (7)
- **Workspace Audit**: Score de higiene 6/10 → 10/10
- **Eliminado**: `.agent/skills/`, `.agent/data/`, `docs/qa/`, `docs/planning/`, `image/golden/`, `main.css`, `nul`
- **Recount**: CSS 12→13, JS modules 42→43, Skills 12→14
- **Supabase Project ID**: `iyknbgmcnbpvalvsjxjz` (región us-west-2)

---

> [!IMPORTANT]
> **Este documento debe actualizarse inmediatamente después de cada cambio significativo**.
>
> Ver reglas completas en: [auditing-workspace/SKILL.md](../../.gemini/antigravity/skills/auditing-workspace/SKILL.md)

---
