# Plan de Implementación — WorkDays Unified (6 Fases)

> **Fecha**: 16-Feb-2026
> **Objetivo**: Reemplazar `admin-workdays.html` con 3 tabs unificados
> **Report Design**: Versión A "Post-Mortem Dashboard" (Chart.js + 3 cards + reconciliation)

---

## Decisiones Resueltas

| #   | Pregunta                | Decisión                                                                                   |
| :-- | :---------------------- | :----------------------------------------------------------------------------------------- |
| 1   | Report ≠ Balance?       | Report = tab 3 (1 noche). Balance = módulo independiente (semana)                          |
| 2   | Versión del Report?     | **Versión A "Post-Mortem Dashboard"** — KPIs + Chart.js 3 modos + 3 cards + reconciliation |
| 3   | Triple cruce CMV?       | **Balance Semanal** (aggregado). Report muestra cruce simplificado per-noche               |
| 4   | Mock data?              | **No.** Solo datos reales (GBOL, ZOCO, 8 POS, precios reales)                              |
| 5   | CSS strategy?           | **Design system base** (tokens.css + components.css). Prototipos ya migrados               |
| 6   | Devenciones en Planner? | **No.** staff_accruals es post-cierre, no pertenece al Planner                             |

---

## Arquitectura de Origen

| Prototipo            | Prefijo BEM | HTML    | CSS      | JS      |
| :------------------- | :---------- | :------ | :------- | :------ |
| `lab-workdays`       | `wd-*`      | 624 lín | 1114 lín | 334 lín |
| `lab-workdays-night` | `nc-*`      | 277 lín | 706 lín  | 252 lín |
| **Report** _(nuevo)_ | `rp-*`      | —       | —        | —       |

---

## Fase 1 — Scaffold HTML + Tab System

**Entregable**: HTML shell + tab controller funcional (3 tabs vacíos)

| Tarea | Archivo               | Detalle                                                                                                                                               |
| :---- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML  | `admin-workdays.html` | Head (tokens + components + local CSS), topbar, tab bar (3 buttons `role="tab"`), 3 `<section role="tabpanel">`, toast container, modal, Chart.js CDN |
| CSS   | `admin-workdays.css`  | Tab system styles (bar, active state, transitions), shell layout                                                                                      |
| JS    | `admin-workdays.js`   | Tab controller (click, aria-selected toggle, panel show/hide), lazy init pattern                                                                      |

**Verificación**: 3 tabs clickeables, solo un panel visible, aria correcto

---

## Fase 2 — Tab Planner

**Fuente**: `pages/prototypes/lab-workdays/` (624 + 1114 + 334 lín)

| Tarea | Detalle                                                                                                                                                                    |
| :---- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML  | Copiar `<main>` de lab-workdays: tabla workdays, planner expandible con 3 cards (Staff, Costos, Solicitudes), KPI summary bar, evento strip, countdown, modal cerrar noche |
| CSS   | Append `/* PLANNER (wd-*) */` — copy de style.css (1114 lín), ajustar selectores `.lab-shell`                                                                              |
| JS    | Integrar app.js (334 lín): row expand/collapse, countdown timer, payment toggles + toasts, confirm plan, modal cerrar noche                                                |

**Verificación**: tabla renderiza, rows expanden, countdown actualiza, toasts funcionan, modal abre/cierra

---

## Fase 3 — Tab Night Chief

**Fuente**: `pages/prototypes/lab-workdays-night/` (277 + 706 + 252 lín)

| Tarea | Detalle                                                                                                                                        |
| :---- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML  | Copiar `<main>` de lab-workdays-night: header info en vivo, KPI strip, split 50/50 (Stock + Caja), QR audit, nómina + sparklines, notas cierre |
| CSS   | Append `/* NIGHT CHIEF (nc-*) */` — copy de style.css (706 lín), ajustar `.lab-shell`                                                          |
| JS    | Integrar app.js (252 lín): KPI strip rendering, stock filter/search, sparkline canvas, import sources pills                                    |

**Verificación**: KPI strip 4 métricas, split 50/50, sparklines, filters, switch Planner↔NC fluido

---

## Fase 4 — Tab Report: Post-Mortem Dashboard

**Fuente**: `b6fe52e2` resolved.6 (plan) + resolved.7 (walkthrough verificado)

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ S1: HERO KPIs STRIP                                      │
│ Revenue $1.6M │ Resultado $1.04M │ Health 92 │ Per Cáp.  │
│ (cada KPI con delta ↑↓→ vs promedio 10 noches)          │
├──────────────────────────────────────────────────────────┤
│ S2: P&L CHART — Chart.js                                 │
│ [Modo: ▼ Waterfall | Area | Doughnut]                   │
│ ┌──────────────────────────────────────────────────┐     │
│ │              (chart canvas)                      │     │
│ └──────────────────────────────────────────────────┘     │
│ KPIs: Margen 65% │ Break-Even $560K │ vs Promedio +8.2% │
├──────────────────────────────────────────────────────────┤
│ S3: FACTURACIÓN FISCAL (tabla + export XLSX)             │
│ Digital $810K │ Efectivo $620K │ Factura B $170K         │
├──────────────────────────────────────────────────────────┤
│ S4: RESUMEN OPERATIVO (collapsible 3 cards)              │
│ [Stock Audit] [Caja] [Nómina]                            │
├──────────────────────────────────────────────────────────┤
│ S5: RECONCILIATION (Passline × GBOL × AFIP)              │
│ Tickets: ✓ │ GBOL: ⚠ Gap $56K │ AFIP: ✓                │
├──────────────────────────────────────────────────────────┤
│ S6: HISTORIAL (últimas 10 noches)                        │
│ Fecha │ Evento │ Revenue │ Health │ Trend                │
└──────────────────────────────────────────────────────────┘
```

### Tareas

| Tarea | Detalle                                                                                                                                                                                                                       |
| :---- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML  | `rp-kpi-strip` (4 KPIs + delta), `rp-chart-section` (canvas + dropdown + chart-kpis), `rp-facturacion` (table + export), `rp-snapshot` (3-col grid), `rp-reconciliation` (3 source cards), `rp-history` (table + badges)      |
| CSS   | `rp-*` prefixed: KPI strip, chart section, facturación, 3-col snapshot, reconciliation, history                                                                                                                               |
| JS    | `initCharts()`, `switchChartMode()`, `renderWaterfall()`, `renderAreaChart()`, `renderDoughnut()`, `updateChartKpis()`, `renderFiscal()`, `renderSnapshot()`, `toggleSnapshot()`, `renderReconciliation()`, `renderHistory()` |

### Chart Modes (3 via dropdown)

| Modo                   | Chart Type           | KPIs Asociados                                  |
| :--------------------- | :------------------- | :---------------------------------------------- |
| Consumo vs Recaudación | Area (gradient fill) | Costo Consumo, Recaudación, Margen Bruto        |
| P&L Waterfall          | Bar (stacked)        | Margen Operativo, Break-Even, vs Promedio       |
| Revenue por Canal      | Doughnut             | Total Facturado, Transacciones, Ticket Promedio |

### Dependencias de Datos

| Fuente   | Dato                             | Sección           |
| :------- | :------------------------------- | :---------------- |
| GBOL     | 8 POS (2 boleterías + 6 barras)  | S2, S5            |
| GBOL     | Rendiciones por caja             | S3, S4 Caja       |
| ZOCO     | Descalces sistema vs caja        | S5 Reconciliation |
| Sistema  | Precios reales por producto      | S2, S3            |
| GBOL     | Recargo 15% TD/TC                | S3 Fiscal         |
| Passline | Tickets, cortesías               | S1 KPIs, S5       |
| Supabase | `work_days`, `staff_assignments` | S4, S6            |

**Verificación**: KPIs con deltas, chart switch 3 modos, fiscal totales, 3 cards collapse, reconciliation status, historial badges

---

## Fase 5 — Polish + Responsive + a11y

| Tarea      | Detalle                                                                                                               |
| :--------- | :-------------------------------------------------------------------------------------------------------------------- |
| Responsive | `1024px`: cards 3→2 col, chart reduce, split stack. `768px`: 2→1 col, KPI stack, tab scroll. `prefers-reduced-motion` |
| a11y       | `aria-selected/controls/tablist`, chart `aria-label`, skip-link, focus visible                                        |
| Print      | `@media print`: ocultar topbar/tabs, expandir todo, chart fallback tabla                                              |

---

## Fase 6 — Verificación Final + Walkthrough

| Tarea       | Detalle                                                                                                                 |
| :---------- | :---------------------------------------------------------------------------------------------------------------------- |
| Visual      | 3 tabs renderizan, datos reales (no placeholders), transiciones fluidas                                                 |
| Funcional   | Planner: countdown + expand + confirm + modal. NC: KPIs + filters + sparklines. Report: charts + cards + reconciliation |
| Walkthrough | Screenshots por tab + recording chart modes + diff summary                                                              |

---

## Alcance Explícito

| Se Hace                                 | No Se Hace (otro sprint)                 |
| :-------------------------------------- | :--------------------------------------- |
| Unificar 3 tabs en un HTML              | Conectar Supabase live (datos hardcoded) |
| CSS premium merged (wd + nc + rp)       | Refactorizar BEM a prefijo único         |
| Report Dashboard con Chart.js + 3 cards | Balance Semanal (módulo independiente)   |
| Preservar interactividad de prototipos  | Tests automatizados E2E                  |
| Reconciliation block estático           | XLSX export funcional (solo botones UI)  |
| Chart.js via CDN                        | Bundle/build system                      |
