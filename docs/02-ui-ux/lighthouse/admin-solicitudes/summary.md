# Lighthouse Summary: admin-solicitudes

| Categoría | Score |
|-----------|-------|
| Performance | **94** |
| Accessibility | **91** |
| Best Practices | **92** |
| SEO | **90** |

## Audits fallidos (A11y)

- **color-contrast** — Background and foreground colors do not have a sufficient contrast ratio. (4 items, peso=7)
  - `header.topbar > div.topbar-end > div.dropdown-container > button#user-avatar`
  - `div#audit-chart-kpis > div.chart-kpi-card > div.chart-kpi-label-row > p.chart-kpi-label`
  - `div#audit-chart-kpis > div.chart-kpi-card > div.chart-kpi-label-row > p.chart-kpi-label`
  - `div#audit-chart-kpis > div.chart-kpi-card > div.chart-kpi-label-row > p.chart-kpi-label`
- **label** — Form elements do not have associated labels (1 items, peso=10)
  - `tbody > tr > td.table-cell > input.js-item-checkbox`
- **label-content-name-mismatch** — Elements with visible text labels do not have matching accessible names. (2 items, peso=0)
  - `header.topbar > div.topbar-end > div.dropdown-container > button#btn-notifications`
  - `header.topbar > div.topbar-end > div.dropdown-container > button#user-avatar`

## Audits fallidos (Best Practices)

- **errors-in-console** — Browser errors were logged to the console
- **inspector-issues** — Issues were logged in the `Issues` panel in Chrome Devtools