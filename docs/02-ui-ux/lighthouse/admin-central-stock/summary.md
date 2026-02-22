# Lighthouse Summary: admin-central-stock

| Categoría | Score |
|-----------|-------|
| Performance | **98** |
| Accessibility | **88** |
| Best Practices | **92** |
| SEO | **90** |

## Audits fallidos (A11y)

- **aria-input-field-name** — ARIA input fields do not have accessible names (2 items, peso=7)
  - `div#panel-form-container > div.form-group > div.custom-dropdown > div.custom-dropdown-trigger`
  - `div#panel-form-container > div.form-group > div.custom-dropdown > div.custom-dropdown-trigger`
- **color-contrast** — Background and foreground colors do not have a sufficient contrast ratio. (4 items, peso=7)
  - `header.topbar > div.topbar-end > div.dropdown-container > button#user-avatar`
  - `aside.sidebar-filters > div#requests-widget-section > div#requests-widget-body > button#btn-view-all-requests`
  - `div#chart-kpis > div.chart-kpi-card > div.chart-kpi-label-row > p.chart-kpi-label`
  - `div#chart-kpis > div.chart-kpi-card > div.chart-kpi-label-row > p.chart-kpi-label`
- **label** — Form elements do not have associated labels (26 items, peso=10)
  - `tr.table-row > td.table-cell > label.toggle-switch > input.toggle-input`
  - `tr.table-row > td.table-cell > label.toggle-switch > input.toggle-input`
  - `tr.table-row > td.table-cell > label.toggle-switch > input.toggle-input`
  - `tr.table-row > td.table-cell > label.toggle-switch > input.toggle-input`
  - `tr.table-row > td.table-cell > label.toggle-switch > input.toggle-input`
- **label-content-name-mismatch** — Elements with visible text labels do not have matching accessible names. (1 items, peso=0)
  - `header.topbar > div.topbar-end > div.dropdown-container > button#user-avatar`

## Audits fallidos (Best Practices)

- **errors-in-console** — Browser errors were logged to the console
- **inspector-issues** — Issues were logged in the `Issues` panel in Chrome Devtools