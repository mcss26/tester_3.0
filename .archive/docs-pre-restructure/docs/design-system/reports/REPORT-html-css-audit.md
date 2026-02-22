# HTML/CSS Remediation Audit — CRITICAL Pages

> **Date**: 2026-02-19  
> **Scope**: 5 CRITICAL pages from `select-risk-report.md`  
> **DS Reference**: `tokens.css` (265 lines), `swiss-style.css` (558 lines), `components.css` (7820 lines)

---

## Summary

| Check                       | CRITICAL Pages Total                    |
| --------------------------- | --------------------------------------- |
| Inline styles               | **2** (1 page)                          |
| Orphan classes              | **1** (`input-sm`)                      |
| Native `<select>` unwrapped | **11**                                  |
| `<select>` already wrapped  | **2** (proven in `admin-central-stock`) |
| Structure issues            | **2** (layout divergences)              |

---

## admin-workdays.html

| #   | Tipo           | Línea    | Actual                                                                 | Propuesto                                                                            | Impacto                            |
| --- | -------------- | -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| 1   | inline-style   | L234     | `style="width: 0%"` on `.wd-breakeven-bar`                             | JS-only (runtime width). Keep — not a DS concern                                     | 🟢 None                            |
| 2   | inline-style   | L956     | `style="margin-top: 24px;"` on `.staff-dashboard`                      | `class="mt-4"` or `class="mt-6"` (24px = `--space-6`)                                | 🟡 Bajo                            |
| 3   | select-nativo  | L262     | `<select id="select-event" class="input">`                             | Wrap con `.custom-dropdown`                                                          | **⚠️ CRITICAL — solo wrap visual** |
| 4   | select-nativo  | L289     | `<select id="select-template" class="input">`                          | Wrap con `.custom-dropdown`                                                          | **⚠️ CRITICAL — solo wrap visual** |
| 5   | select-nativo  | L714     | `<select id="sa-filter-clasif" class="input input-sm">`                | Wrap con `.custom-dropdown`. Fix orphan: `input-sm` → `btn-sm` or add DS class       | **⚠️ HIGH — orphan class**         |
| 6   | select-nativo  | L851     | `<select id="rpt-chart-mode" class="input input-sm rpt-chart-select">` | Wrap con `.custom-dropdown`. `rpt-chart-select` ✅ in page CSS. `input-sm` ❌ orphan | **⚠️ HIGH — orphan class**         |
| 7   | clase-huérfana | L714,851 | `input-sm`                                                             | No CSS definition exists anywhere. Replace with `btn-sm` pattern or define in DS     | 🔴 Orphan                          |

---

## encargado-barra-personal.html

| #   | Tipo          | Línea | Actual                                            | Propuesto                                                          | Impacto                            |
| --- | ------------- | ----- | ------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------- |
| 1   | select-nativo | L69   | `<select id="selectWorkday" class="input">`       | Wrap con `.custom-dropdown`                                        | **⚠️ CRITICAL — solo wrap visual** |
| 2   | estructura    | —     | Page uses `topbar` but not `.wrapper` for content | Consider aligning main content with DS `.wrapper` or `.page-shell` | 🟡 Bajo                            |

---

## admin-central-stock.html

| #   | Tipo          | Línea    | Actual                                                                      | Propuesto                                                                                                         | Impacto                            |
| --- | ------------- | -------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | ✅ wrapped    | L264–280 | `<select id="chart-mode">` + `.custom-dropdown`                             | Already wrapped — **reference implementation**                                                                    | 🟢 Done                            |
| 2   | ✅ wrapped    | L332–348 | `<select id="category-filter">` + `.custom-dropdown`                        | Already wrapped — **reference implementation**                                                                    | 🟢 Done                            |
| 3   | select-nativo | L521     | `<select id="filter-profitability-flag" class="select rentability-select">` | Wrap con `.custom-dropdown`. Uses `.select` (components.css L330) + `.rentability-select` (page CSS) — both valid | **⚠️ HIGH**                        |
| 4   | select-nativo | L633     | `<select class="select input-sku">` (no id)                                 | Wrap con `.custom-dropdown`. No ID → LOW risk                                                                     | 🟡 LOW                             |
| 5   | select-nativo | L658     | `<select id="sku-categoria" class="input">`                                 | Wrap con `.custom-dropdown`                                                                                       | **⚠️ HIGH**                        |
| 6   | select-nativo | L665     | `<select id="sku-proveedor" class="input">`                                 | Wrap con `.custom-dropdown`                                                                                       | **⚠️ HIGH**                        |
| 7   | select-nativo | L799     | `<select id="select-sku-modal" class="input">`                              | Wrap con `.custom-dropdown`                                                                                       | **⚠️ HIGH**                        |
| 8   | select-nativo | L851     | `<select id="select-recipe" class="input">`                                 | Wrap con `.custom-dropdown`                                                                                       | **⚠️ CRITICAL — solo wrap visual** |

---

## admin-semanal.html

| #   | Tipo                | Línea | Actual                                              | Propuesto                                                                                                      | Impacto                            |
| --- | ------------------- | ----- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | select-nativo       | L85   | `<select id="weekSelect" class="week-select">`      | Wrap con `.custom-dropdown`. Note: uses `week-select` (defined in `admin-semanal.css` L121) — valid but non-DS | **⚠️ CRITICAL — solo wrap visual** |
| 2   | componente-faltante | L85   | `week-select` bypasses `.input` class               | Should add `class="input week-select"` for DS consistency                                                      | 🟡 Bajo                            |
| 3   | estructura          | L17   | `<body class="app-shell admin-shell admin-scroll">` | `app-shell`, `admin-shell`, `admin-scroll` — verify all exist in CSS                                           | 🟡 Check                           |

---

## encargado-caja-personal.html

| #   | Tipo          | Línea | Actual                                                     | Propuesto                                                                 | Impacto                            |
| --- | ------------- | ----- | ---------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| 1   | select-nativo | L72   | `<select id="select-workday" class="input input-compact">` | Wrap con `.custom-dropdown`. `input-compact` ✅ in `components.css` L4086 | **⚠️ CRITICAL — solo wrap visual** |

---

## Cross-Cutting: Orphan Class Inventory

| Class                | Used In                             | Defined In                        | Status                                          |
| -------------------- | ----------------------------------- | --------------------------------- | ----------------------------------------------- |
| `input-sm`           | admin-workdays.html L714, L851      | ❌ **Nowhere**                    | 🔴 **ORPHAN — needs definition or replacement** |
| `week-select`        | admin-semanal.html L85              | `admin-semanal.css` L121          | ✅ Page-specific                                |
| `input-compact`      | encargado-caja-personal.html L72    | `components.css` L4086            | ✅ Valid                                        |
| `rpt-chart-select`   | admin-workdays.html L851            | `admin-workdays.css` L366         | ✅ Page-specific                                |
| `u-hidden`           | admin-central-stock.html            | `components.css` L1814 + page CSS | ✅ Valid (duplicate definition)                 |
| `rentability-select` | admin-central-stock.html L521       | `admin-central-stock.css` L1662   | ✅ Page-specific                                |
| `input-sku`          | admin-central-stock.html L633       | `components.css` L5836            | ✅ Valid                                        |
| `select`             | admin-central-stock.html L521, L633 | `components.css` L330             | ✅ Valid                                        |

---

## Native `<select>` Wrap Priority

Based on `select-risk-report.md` + this audit:

### Batch 1: CRITICAL (Must Wrap — DB-bound + multiple APIs)

| Select ID        | Page                     | Current Class           | Wrap Risk |
| ---------------- | ------------------------ | ----------------------- | --------- |
| `select-event`   | admin-workdays           | `.input`                | 🟢 Safe   |
| `selectWorkday`  | encargado-barra-personal | `.input`                | 🟢 Safe   |
| `select-recipe`  | admin-central-stock      | `.input`                | 🟢 Safe   |
| `weekSelect`     | admin-semanal            | `.week-select`          | 🟢 Safe   |
| `select-workday` | encargado-caja-personal  | `.input .input-compact` | 🟢 Safe   |

### Batch 2: HIGH (Should Wrap — DB-bound)

| Select ID                   | Page                | Current Class                        | Wrap Risk                      |
| --------------------------- | ------------------- | ------------------------------------ | ------------------------------ |
| `filter-profitability-flag` | admin-central-stock | `.select .rentability-select`        | 🟢 Safe                        |
| `sku-categoria`             | admin-central-stock | `.input`                             | 🟢 Safe                        |
| `sku-proveedor`             | admin-central-stock | `.input`                             | 🟢 Safe                        |
| `select-sku-modal`          | admin-central-stock | `.input`                             | 🟢 Safe                        |
| `sa-filter-clasif`          | admin-workdays      | `.input .input-sm`                   | ⚠️ Fix orphan `input-sm` first |
| `rpt-chart-mode`            | admin-workdays      | `.input .input-sm .rpt-chart-select` | ⚠️ Fix orphan `input-sm` first |

### Batch 3: Already Done ✅

| Select ID         | Page                | Status                             |
| ----------------- | ------------------- | ---------------------------------- |
| `chart-mode`      | admin-central-stock | ✅ Wrapped with `.custom-dropdown` |
| `category-filter` | admin-central-stock | ✅ Wrapped with `.custom-dropdown` |

---

## Recommendations

1. **Define `input-sm`** in `swiss-style.css` or `components.css`:
   ```css
   .input-sm {
     height: var(--control-h-sm);
     font-size: var(--fs-sm);
     padding: 0 8px;
   }
   ```
2. **Add `input` class** to `weekSelect` alongside `week-select` for DS consistency.
3. **Replace inline `margin-top: 24px`** in `admin-workdays.html` L956 with `class="mt-6"` (needs `mt-6` utility) or keep as-is if page-specific.
4. **Use `admin-central-stock.html` L264–348** as the template for all Wrap Approach implementations.
5. **Resolve `u-hidden` duplication** — defined in both `components.css` and `admin-central-stock.css`. Keep only in `components.css`.
