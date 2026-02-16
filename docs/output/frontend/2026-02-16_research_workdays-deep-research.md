# Deep Research — WorkDays Module

> **Fecha**: 16-Feb-2026
> **Fuentes**: 8 conversaciones (22+ artefactos, ~4,500 líneas) + 6 docs migración
> **Propósito**: Consolidar toda la lógica, decisiones e investigación previa

---

## 1. Fuentes Revisadas

| Conv ID    | Título                      | Artefactos Clave                                                                                   | Líneas |
| :--------- | :-------------------------- | :------------------------------------------------------------------------------------------------- | :----: |
| `5fbaf286` | Workdays Planner            | `exploration_workdays_planner.md`, `implementation_plan.md`, `walkthrough.md`                      |  438   |
| `cb5a2f9a` | KPI Deep Research           | `kpi-deep-research.md`, `implementation_plan.md`                                                   |  352   |
| `d4d4195e` | Devenciones Module          | `implementation_plan.md` (staff_accruals, 2 RPCs)                                                  |  265   |
| `b6fe52e2` | Audit Ledger + Balance v4   | `implementation_plan.md` (15 iteraciones del Report), `deep_research_context.md`, `walkthrough.md` |  1360  |
| `0a232f5c` | UX Research                 | `ux_research_workdays.md`                                                                          |  169   |
| `314a9553` | Premium CSS Polish          | `implementation_plan.md` (CSS polish workdays)                                                     |   71   |
| `76748db7` | Night Chief Refinements     | `implementation_plan.md` (import pills en KPI strip)                                               |  ~60   |
| `33c6f121` | Lab Reports                 | `implementation_plan.md`, `walkthrough.md`                                                         |  ~80   |
| **Repo**   | `docs/migration/artifacts/` | 6 docs: kpi-audit, erp-diagnostic, roadmap, sprint3, workdays-ui, ux-research                      |  1430  |

---

## 2. Decisiones Ya Tomadas

|  #  | Decisión                                                                                                       | Fuente                       |          Status           |
| :-: | :------------------------------------------------------------------------------------------------------------- | :--------------------------- | :-----------------------: |
|  1  | **4 estados canónicos** UPPERCASE: `DRAFT → PLANNED → ACTIVE → CLOSED`                                         | erp-diagnostic               |     ✅ Migrado en DB      |
|  2  | **5 RPCs con guards**: `rpc_create`, `rpc_confirm`, `rpc_open`, `rpc_close`, `admin_generate_workday_accruals` | erp-diagnostic + devenciones |         ✅ En DB          |
|  3  | **3 tabs**: PLANNER / NIGHT CHIEF / REPORT (4→3, absorbe `admin-cierre`)                                       | roadmap + exploration        |     ✅ Consenso firme     |
|  4  | **Devenciones** (`staff_accruals`): tabla 13 cols, 2 RPCs                                                      | `d4d4195e`                   |      ✅ Implementado      |
|  5  | **FK `event_id`** en `work_days` (era matching por fecha)                                                      | erp-diagnostic GAP-3         |        ✅ Migrado         |
|  6  | **`countdown_active`** boolean en `work_days`                                                                  | erp-diagnostic GAP-4         |        ✅ Migrado         |
|  7  | **Import pills en KPI strip** del Night Chief                                                                  | `76748db7`                   |      ✅ Prototipado       |
|  8  | **BEM naming**: `wd-*` Planner, `nc-*` Night Chief, `rp-*` Report                                              | exploration + prototipos     |      ✅ Consistente       |
|  9  | **Pre-flight checklist** antes de Cerrar Noche                                                                 | UX research acción #1        | Diseñado, no implementado |
| 10  | **Health Score** 0-100 al cerrar                                                                               | roadmap Sprint 2             |       SQL definido        |
| 11  | **Report = Versión A "Post-Mortem Dashboard"** (no Ledger forense)                                             | `178865b8` (esta sesión)     |  ✅ Decisión del usuario  |

---

## 3. Evolución del Report — Cronología Completa

El Report en `b6fe52e2` pasó por **15 iteraciones** documentadas en walkthroughs:

| Versión     | Nombre                       | Diseño                                                                                    | Status           |
| :---------- | :--------------------------- | :---------------------------------------------------------------------------------------- | :--------------- |
| resolved.6  | Plan inicial                 | 5 secciones: KPIs + P&L Chart (3 modos) + Fiscal + **3 cards** + Historial                | Plan propuesto   |
| resolved.7  | **Post-Mortem Dashboard**    | Dual-panel 55/45, Chart.js (area, waterfall, doughnut), reconciliation, anomalies con CTA | **Implementado** |
| resolved.8  | Monochrome polish            | Surfaces monocromáticas, severity dots                                                    | Polish aplicado  |
| resolved.9  | **Ledger Auditoría Forense** | Rewrite: 6 paneles `<details>`, sin Chart.js, drill-down modal                            | Rewrite          |
| resolved.10 | Datos Reales Phase 2         | 8 POS, ZOCO sub-table, recargo 15% TD/TC                                                  | Datos reales     |
| resolved.14 | Último fix                   | CSS fix `body { justify-content: flex-start }`                                            | Bug fix          |

> **Decisión final (16-Feb-2026):** El usuario eligió **Versión A (resolved.6/7)** — Dashboard con charts + 3 cards, descartando la Versión B (Ledger forense con 6 accordions).

---

## 4. Gaps Pendientes (Decisión Requerida)

### Gap Crítico: Conciliación ZOCO

Descalce ZOCO↔Sistema real: $4.2M, $557K, $594K en 3 noches. ZOCO→Banco cruza perfecto, pero ZOCO→Sistema falla porque la columna "Tarjetas" mezcla ZOCO + VIUMI + MP.

| Opción | Descripción                                      | Esfuerzo |
| :----: | :----------------------------------------------- | :------: |
| **A**  | Crear `zoco_settlements` + importer CSV          |   Alto   |
| **B**  | Campo manual en Night Chief para monto ZOCO real |   Bajo   |
| **C**  | Dejar mock, resolver en sprint posterior         |   Nulo   |

### Gap Medio: Free/VIP Drinks Tracking

`revenue_details` ya tiene `q_sin_cargo` y `q_vip`. Costo calculable via `master_recipes.ingredients × master_sku.costo`. No hay UI.

### Gap Medio: Guardarropas

No existe en DB. Es dato manual o futuro módulo.

---

## 5. Lógica de Negocio Rescatada

### 5.1 Estructura de POS (Real)

8 puntos de venta: 2 Boleterías (General 1, General 2) + 6 Barras (Caja 1–5 + Caja 1.2)

### 5.2 Pricing

- **Recargo tarjeta**: 15% lineal (TD y TC), automático en GBOL
- **IVA**: 21% sobre base imponible
- **Fórmula**: `Precio Base = Precio Final / (1 + 0.21)`, `Utilidad = Base − Costo − Canal − Impuestos`

### 5.3 Triple Cruce CMV (Balance Semanal)

```
Cadena A: RECAUDACIÓN → revenue_details × master_recipes × master_sku = CMV Teórico
Cadena B: CONSUMO FÍSICO → consumption_details × master_sku = CMV Real
Cadena C: FISCAL → stg_afip_facturas vs stg_gbol_items = Δ AFIP-GBOL
Merma = CMV Real − CMV Teórico
```

### 5.4 Health Score (5 componentes)

| Componente           | Peso  | Fuente                                |
| :------------------- | :---: | :------------------------------------ |
| Cash conciliation    | 30pts | `vw_night_snapshot.conciliacion_diff` |
| Stock efficiency     | 25pts | `vw_bar_efficiency.efficiency_pct`    |
| Staff compliance     | 20pts | `staff_convocations` confirmed rate   |
| Revenue vs benchmark | 15pts | `vw_workday_benchmarks`               |
| Base points          | 10pts | Siempre                               |

### 5.5 UX Research Findings (Top 5)

|  #  | Acción                                            | Impacto |
| :-: | :------------------------------------------------ | :-----: |
|  1  | Pre-flight checklist antes de Cerrar Noche        |  Alto   |
|  2  | Empty states informativos en tablas Night Chief   |  Alto   |
|  3  | Tooltips para abreviaturas (EFVO SIST, EFVO DECL) |  Medio  |
|  4  | Hover + cursor en áreas colapsables Planner       |  Medio  |
|  5  | Contadores en filter chips de Stock Audit         |  Medio  |

---

## 6. Balance Semanal — Módulo Independiente

> **Decisión clave**: El Balance Semanal NO es un sub-tab de Workdays. Es un **módulo financiero independiente** con breadcrumb `Financiero / Balance Semanal`.

### Layout: 4 columnas + footer

```
┌─────────────────────────────────────────────────┐
│ BALANCE SEMANAL · Semana 7 · 4 noches [Export]  │
├──────────┬──────────┬──────────┬────────────────┤
│ REVENUE  │ GASTOS   │ RESULTADO│ HEALTH 87      │
├──────────┴──────────┴──────────┴────────────────┤
│ ┌───────────────────┐ ┌───────────────────────┐ │
│ │ CRUCES DE CAJA    │ │ CRUCES DE RENDIMIENTO │ │
│ └───────────────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────┤
│ DOCUMENTOS · EVIDENCIA                [Adjuntar]│
└─────────────────────────────────────────────────┘
```

**Flujo temporal**: Jue-Dom = Workdays (operacional). **Lunes** = Balance Semanal (financiero).

---

## 7. Arquitectura DB Confirmada

### Tablas Core (12)

`work_days`, `work_day_staff_planning`, `staff_convocations`, `staff_accruals`, `cash_closings`, `closing_terminals`, `bar_sessions` + `bar_session_sales`, `bar_stock_snapshots`, `cost_definitions`, `accounts_payable`, `revenue_reports` + `revenue_details`, `master_recipes`

### Vistas Existentes (8)

`vw_night_snapshot`, `vw_work_day_summary`, `vw_daily_sales_v2`, `vw_bar_efficiency`, `vw_bar_audit_variance`, `vw_staff_accruals_summary`, `vw_sku_ideal_dynamic`, `vw_per_capita_revenue`

### Vistas Pre-escritas (SQL en roadmap, pendientes de migrar)

`vw_workday_pnl`, `vw_per_capita_revenue`, `vw_workday_benchmarks`, `vw_weekly_stock_cross`

---

## 8. Roadmap de Producción (8 Sprints)

| Sprint | Objetivo                                               |  Status   |
| :----: | :----------------------------------------------------- | :-------: |
|   S1   | Foundation: HTML tabs 4→3, JS status machine           | Pendiente |
|   S2   | Pre-Flight + Health Score + P&L Preview                | Pendiente |
|   S3   | Fix 6 blind spots + new views (SQL definido)           | Pendiente |
|   S4   | Templates + Break-Even + Benchmarks (SQL definido)     | Pendiente |
|   S5   | P&L View + Night Chief Live + Score RPC (SQL definido) | Pendiente |
|   S6   | Supply Chain ↔ Workday link                            | Pendiente |
|   S7   | Edge cases + UX + Responsive                           | Pendiente |
|   S8   | Deploy + Smoke test + Monitor                          | Pendiente |

> **Backend listo**: DB Schema 85%, RPCs 80%, 8 vistas corregidas.
> **Frontend pendiente**: HTML 20%, JS 15%, Integración Logística 10%.
