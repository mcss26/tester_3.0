# Estado Presente del Proyecto - FormulaMid 4

> **Fecha**: 08/02/2026
> **Versión**: 4.0.0 (Fase de Consolidación)
> **Estado General**: 🟡 En Desarrollo / Consolidación
> **Fuente de Verdad**: Este documento

---

## 📊 Métricas Clave

| Métrica                     | Estado Actual | Variación (vs semana anterior) |
| :-------------------------- | :------------ | :----------------------------- |
| **Pantallas Operativas**    | **48**        | +3 (logistica-seguimiento, admin-config, test-devenciones) |
| **Tablas en Base de Datos** | **48**        | Sin cambio                     |
| **Vistas SQL (public)**     | **18**        | +6 (vw_pnl_monthly_v2, vw_financial_week_live, etc.) |
| **Módulos JS (Legacy)**     | **42**        | -1 (orphan inventario)         |
| **Core JS**                 | **18**        | Sin cambio                     |
| **Importers JS**            | **6**         | Sin cambio                     |
| **Archivos CSS**            | **12**        | Sin cambio                     |
| **Roles Configurados**      | **12**        | +6 (roles en profiles check)   |
| **Skills Globales**         | **12**        | Sin cambio                     |
| **Recetas Master**          | **93**        | +14                            |
| **Members Registrados**     | **2,243**     | En crecimiento                 |
| **Proveedores**             | **47**        | -                              |
| **SKUs Activos**            | **58**        | -                              |

---

## 🗃️ Inventario de Archivos Vivos

### Páginas HTML por Contexto

| Contexto | Páginas | Directorio | Detalle |
|:---------|:-------:|:-----------|:--------|
| 🔵 Admin | 15 | `pages/admin/*.html` | Dashboard + Ops + Masters + Config |
| 🔵 Admin QR | 3 | `pages/admin/qr/*.html` | Index, Generator, Monitor |
| 🟢 Operativo | 11 | `pages/operativo/*.html` | Dashboard + ERP + CMS + Masters + Scanner |
| 📦 Logística | 5 | `pages/logistica/*.html` | Dashboard + Stock + Distribución + Recepción + Seguimiento |
| 🟠 Encargados | 7 | `pages/encargados/*.html` | Barra (3) + Caja (3) + Recepción |
| 🟡 Staff | 2 | `pages/staff/*.html` | Barra + Caja |
| 🟣 Gerencia | 1 | `pages/gerencia/*.html` | Balance Semanal |
| 🔴 Members | 1 | `pages/members/*.html` | My QR |
| 🛠️ Dev Utilities | 3 | `pages/*.html` | Components Catalog, Layout Patterns, Module Audit |
| **TOTAL** | **48** | — | — |

### Módulos JavaScript

| Área | Archivos | Directorio |
|:-----|:--------:|:-----------|
| Admin | 18 | `assets/js/modules/admin/` |
| Operativo | 10 | `assets/js/modules/operativo/` |
| Encargados | 7 | `assets/js/modules/encargados/` |
| Logística | 5 | `assets/js/modules/logistica/` |
| Gerencia | 1 | `assets/js/modules/gerencia/` |
| Staff | 1 | `assets/js/modules/staff/` |
| Members | 1 | `assets/js/members/` |
| Core | 18 | `assets/js/core/` |
| Importers | 6 | `assets/js/importers/` |
| Root | 1 | `assets/js/modules/login.js` |
| **TOTAL** | **68** | — |

### Archivos CSS

| Archivo | Tamaño | Propósito |
|:--------|:------:|:----------|
| `components.css` | 140KB | Componentes globales |
| `tokens.css` | 5.6KB | Design tokens `:root` |
| `admin-central-stock.css` | 41KB | Módulo Central Stock |
| `admin-pagos.css` | 10KB | Módulo Pagos |
| `cms-members.css` | 10KB | Módulo CMS Members |
| `admin-master.css` | 7.2KB | Maestros admin |
| `admin-solicitudes.css` | 5.3KB | Módulo Solicitudes |
| `admin-semanal.css` | 3.5KB | Balance Semanal |
| `admin-cierre.css` | 3.5KB | Módulo Cierre |
| `admin-config.css` | 1.8KB | Admin Config |
| `admin-reportes.css` | 1.6KB | Admin Reportes |
| `main.css` | 64B | Stub vacío (deprecado) |

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

---

## 🗄️ Base de Datos (Supabase - FormulaMid)

### Tablas (48 en schema `public`)

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

- **Navigation System**: Unificación de rutas y estado global.
- **Sistema de Autenticación**: `Auth.guardOrRedirect()` implementado en 91% de módulos.
- **Staff Caja (Operativo)**: Flujo completo con firma digital y cierre ciego.
- **Remediación Admin (Fase 1)**: Eliminación de `alert()` en 13 módulos clave.
- **Gestión de Stock**: Vistas `vw_stock_global` y ajustes validados.
- **Blocking UX**: Eliminación total de `alert()` y `confirm()` nativos en módulos auditados.
- **Balance Semanal**: Vista SQL `vw_finance_weekly` y dashboard implementado.
- **Arqueo de Recaudación**: Comparación consumo real vs esperado con detección de faltantes.
- **CSS Architecture**: 100% páginas migradas a `tokens.css` + `components.css` (0 imports `main.css`).

### 🟡 En Progreso / Calidad Beta

- **UI/UX Remediation**: Migración de Alien CSS crítica completada. Restan inline styles en ~25 páginas.
- **Admin Workdays**: Planner de staff en desarrollo.
- **Admin Solicitudes**: Refactorización de lógica de aprobación.
- **Reportes de Eficiencia**: Vistas creadas, falta integración UI.
- **Logística**: Módulos funcionales, pendiente polish visual. `logistica-seguimiento.html` agregado.
- **Admin Config**: Módulo de configuración del sitio funcional.

### 🔴 Pendiente / Bloqueado

- **Agente IA (Antigravity Agent)**: ⚠️ **PAUSADO** hasta consolidación del legacy.
- **Sandbox WYSIWYG**: Archivado temporalmente.

---

## 🛠️ Deuda Técnica Identificada

Según auditoría del 08/02/2026:

1.  **CSS Legacy (`main.css`)**: ✅ **RESUELTO** — 16/16 páginas migradas a imports explícitos.
2.  **Blocking UX Remaining**: ✅ **RESUELTO** (0 ocurrencias detectadas).
3.  **CSS Duplicates**:
    - ✅ **RESUELTO**: `.custom-dropdown` consolidado, `@keyframes fadeIn` unificado en `components.css`.
    - ⏳ **PENDIENTE**: Inline styles en ~25 páginas.
4.  **Orphan Code**:
    - ⏳ **PENDIENTE**: `admin-inventario.js` (83KB, sin HTML que lo cargue).
5.  **Hardcoded Colors (18 casos)**:
    - Colores en hex (`#fff`, `#ff3b30`) dentro de los charts JS.
6.  **Docs Faltantes**:
    - ⏳ `logistica-seguimiento.md` — no existe doc para la pantalla.
    - ⏳ `admin-config.md` — no existe doc para la pantalla.
    - ⏳ `test-devenciones.md` — no existe doc para la pantalla.
    - ⏳ No existen docs para `gerencia/balance-semanal.md` ni `members/my-qr.md`.

---

## 📝 Última Actualización

**Fecha**: 08/02/2026 03:22
**Cambios**:
- **Auditoría Completa**: Recuento de todos los archivos vivos (HTML, JS, CSS, docs, DB)
- **Vistas SQL**: Actualizadas de 12 → 18 (6 nuevas vistas financieras y de staff)
- **Recetas**: Actualizadas de 79 → 93
- **Roles en DB**: 12 roles definidos en check constraint de `profiles.role`
- **Logística**: 5 pantallas (se agregó `logistica-seguimiento.html`)
- **Admin**: 18 pantallas totales (15 directas + 3 QR)
- **Docs gaps identificados**: 5 pantallas sin documentación de módulo

---

> [!IMPORTANT]
> **Este documento debe actualizarse inmediatamente después de cada cambio significativo**.
>
> Ver reglas completas en: [auditing-workspace/SKILL.md](../../.gemini/antigravity/skills/auditing-workspace/SKILL.md)

---
