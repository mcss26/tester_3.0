# Lighthouse Cross-Audit Matrix

> Generated: 2026-02-22
> Reports analyzed: 13/13

---

## Score Grid

| Pantalla | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| admin-central-stock | 🟢 98 | 🟡 88 | 🟢 92 | 🟢 90 |
| admin-config | 🟡 88 | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-index | 🟢 100 | 🟢 95 | 🟢 92 | 🟢 90 |
| admin-master-categorias | 🟡 89 | 🟢 95 | 🟢 92 | 🟢 90 |
| admin-master-nomina | 🟢 93 | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-master-pos | 🟢 94 | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-master-proveedores | 🟡 86 | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-master-tarifario | 🟢 94 | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-pagos | 🟢 98 | 🟢 93 | 🟢 92 | 🟢 90 |
| admin-reportes | 🟢 97 | 🟢 90 | 🟢 92 | 🟢 90 |
| admin-semanal | 🟢 93 | 🟢 95 | 🟢 92 | 🟢 90 |
| admin-solicitudes | 🟢 94 | 🟢 91 | 🟢 92 | 🟢 90 |
| admin-workdays | 🟢 90 | 🟡 88 | 🟢 92 | 🟢 90 |

---

## Failed Audits Analysis

### All Categories — Top 15 by Priority

| Audit | Weight | Screens | Items | Priority |
|---|---|---|---|---|
| **Largest Contentful Paint** (`largest-contentful-paint`) | 25 | 12 | 0 | 300 |
| **Speed Index** (`speed-index`) | 10 | 11 | 0 | 110 |
| **First Contentful Paint** (`first-contentful-paint`) | 10 | 10 | 0 | 100 |
| **Background and foreground colors do not have a sufficient contrast ratio.** (`color-contrast`) | 7 | 13 | 19 | 91 |
| **ARIA input fields do not have accessible names** (`aria-input-field-name`) | 7 | 7 | 11 | 49 |
| **Form elements do not have associated labels** (`label`) | 10 | 4 | 50 | 40 |
| **Cumulative Layout Shift** (`cumulative-layout-shift`) | 25 | 1 | 1 | 25 |
| **Browser errors were logged to the console** (`errors-in-console`) | 1 | 13 | 18 | 13 |
| **Issues were logged in the `Issues` panel in Chrome Devtools** (`inspector-issues`) | 1 | 13 | 13 | 13 |
| **Document does not have a meta description** (`meta-description`) | 1 | 13 | 0 | 13 |
| **Touch targets do not have sufficient size or spacing.** (`target-size`) | 7 | 1 | 2 | 7 |
| **Elements with visible text labels do not have matching accessible names.** (`label-content-name-mismatch`) | 0 | 12 | 14 | 0 |
| **Minify CSS** (`unminified-css`) | 0 | 13 | 65 | 0 |
| **Minify JavaScript** (`unminified-javascript`) | 0 | 13 | 74 | 0 |
| **Reduce unused CSS** (`unused-css-rules`) | 0 | 13 | 16 | 0 |


### Accessibility Issues

| Audit | Weight | Screens | Items | Priority |
|---|---|---|---|---|
| **Background and foreground colors do not have a sufficient contrast ratio.** (`color-contrast`) | 7 | 13 | 19 | 91 |
| **ARIA input fields do not have accessible names** (`aria-input-field-name`) | 7 | 7 | 11 | 49 |
| **Form elements do not have associated labels** (`label`) | 10 | 4 | 50 | 40 |
| **Elements with visible text labels do not have matching accessible names.** (`label-content-name-mismatch`) | 0 | 12 | 14 | 0 |


---

### Pattern Clusters

#### Inline Styles / CSS (2 audits)

- `unminified-css` — Minify CSS (w=0, 13 screens, 65 items)
- `unused-css-rules` — Reduce unused CSS (w=0, 13 screens, 16 items)

#### Missing Labels / ARIA (3 audits)

- `aria-input-field-name` — ARIA input fields do not have accessible names (w=7, 7 screens, 11 items)
- `label` — Form elements do not have associated labels (w=10, 4 screens, 50 items)
- `label-content-name-mismatch` — Elements with visible text labels do not have matching accessible names. (w=0, 12 screens, 14 items)

#### Color Contrast (1 audits)

- `color-contrast` — Background and foreground colors do not have a sufficient contrast ratio. (w=7, 13 screens, 19 items)

#### Performance (4 audits)

- `speed-index` — Speed Index (w=10, 11 screens, 0 items)
- `cumulative-layout-shift` — Cumulative Layout Shift (w=25, 1 screens, 1 items)
- `lcp-breakdown-insight` — LCP breakdown (w=0, 1 screens, 2 items)
- `render-blocking-insight` — Render blocking requests (w=0, 13 screens, 97 items)

#### SEO (1 audits)

- `meta-description` — Document does not have a meta description (w=1, 13 screens, 0 items)

#### Other (12 audits)

- `largest-contentful-paint` — Largest Contentful Paint (w=25, 12 screens, 0 items)
- `first-contentful-paint` — First Contentful Paint (w=10, 10 screens, 0 items)
- `errors-in-console` — Browser errors were logged to the console (w=1, 13 screens, 18 items)
- `inspector-issues` — Issues were logged in the `Issues` panel in Chrome Devtools (w=1, 13 screens, 13 items)
- `target-size` — Touch targets do not have sufficient size or spacing. (w=7, 1 screens, 2 items)
- `unminified-javascript` — Minify JavaScript (w=0, 13 screens, 74 items)
- `unused-javascript` — Reduce unused JavaScript (w=0, 13 screens, 26 items)
- `cache-insight` — Use efficient cache lifetimes (w=0, 13 screens, 16 items)
- `document-latency-insight` — Document request latency (w=0, 13 screens, 0 items)
- `network-dependency-tree-insight` — Network dependency tree (w=0, 13 screens, 39 items)
- `interactive` — Time to Interactive (w=0, 8 screens, 0 items)
- `forced-reflow-insight` — Forced reflow (w=0, 2 screens, 2 items)


---

### Remediation Priority (Top 20)

> Sorted by `weight × screen_count`. Global = appears in ≥3 screens (fix-once pattern).

| # | Audit | Weight | Screens | Scope | Priority |
|---|---|---|---|---|---|
| 1 | **Largest Contentful Paint** | 25 | admin-central-stock, admin-config, admin-master-categorias, admin-master-nomina, admin-master-pos, admin-master-proveedores, admin-master-tarifario, admin-pagos, admin-reportes, admin-semanal, admin-solicitudes, admin-workdays | 🌐 Global | 300 |
| 2 | **Speed Index** | 10 | admin-config, admin-master-categorias, admin-master-nomina, admin-master-pos, admin-master-proveedores, admin-master-tarifario, admin-pagos, admin-reportes, admin-semanal, admin-solicitudes, admin-workdays | 🌐 Global | 110 |
| 3 | **First Contentful Paint** | 10 | admin-central-stock, admin-config, admin-master-categorias, admin-master-nomina, admin-master-pos, admin-master-proveedores, admin-master-tarifario, admin-pagos, admin-semanal, admin-workdays | 🌐 Global | 100 |
| 4 | **Background and foreground colors do not have a sufficient contrast ratio.** | 7 | admin-central-stock, admin-config, admin-index, admin-master-categorias, admin-master-nomina, admin-master-pos, admin-master-proveedores, admin-master-tarifario, admin-pagos, admin-reportes, admin-semanal, admin-solicitudes, admin-workdays | 🌐 Global | 91 |
| 5 | **ARIA input fields do not have accessible names** | 7 | admin-central-stock, admin-master-nomina, admin-master-pos, admin-master-proveedores, admin-master-tarifario, admin-pagos, admin-workdays | 🌐 Global | 49 |
| 6 | **Form elements do not have associated labels** | 10 | admin-central-stock, admin-config, admin-solicitudes, admin-workdays | 🌐 Global | 40 |
| 7 | **Cumulative Layout Shift** | 25 | admin-semanal | 📄 Local | 25 |
| 8 | **Browser errors were logged to the console** | 1 | admin-central-stock, admin-config, admin-index, admin-master-categorias, admin-master-nomina, admin-master-pos, admin-master-proveedores, admin-master-tarifario, admin-pagos, admin-reportes, admin-semanal, admin-solicitudes, admin-workdays | 🌐 Global | 13 |
| 9 | **Issues were logged in the `Issues` panel in Chrome Devtools** | 1 | admin-central-stock, admin-config, admin-index, admin-master-categorias, admin-master-nomina, admin-master-pos, admin-master-proveedores, admin-master-tarifario, admin-pagos, admin-reportes, admin-semanal, admin-solicitudes, admin-workdays | 🌐 Global | 13 |
| 10 | **Document does not have a meta description** | 1 | admin-central-stock, admin-config, admin-index, admin-master-categorias, admin-master-nomina, admin-master-pos, admin-master-proveedores, admin-master-tarifario, admin-pagos, admin-reportes, admin-semanal, admin-solicitudes, admin-workdays | 🌐 Global | 13 |
| 11 | **Touch targets do not have sufficient size or spacing.** | 7 | admin-reportes | 📄 Local | 7 |
