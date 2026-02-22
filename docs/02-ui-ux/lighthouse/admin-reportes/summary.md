# Lighthouse Summary: admin-reportes

| Categoría | Score |
|-----------|-------|
| Performance | **97** |
| Accessibility | **90** |
| Best Practices | **92** |
| SEO | **90** |

## Audits fallidos (A11y)

- **color-contrast** — Background and foreground colors do not have a sufficient contrast ratio. (1 items, peso=7)
  - `header.topbar > div.topbar-end > div.dropdown-container > button#user-avatar`
- **target-size** — Touch targets do not have sufficient size or spacing. (2 items, peso=7)
  - `header.topbar > div.topbar-end > div.dropdown-container > button#user-avatar`
  - `body.app-shell > div#toast-container > div.toast > button.toast-close`
- **label-content-name-mismatch** — Elements with visible text labels do not have matching accessible names. (1 items, peso=0)
  - `header.topbar > div.topbar-end > div.dropdown-container > button#user-avatar`

## Audits fallidos (Best Practices)

- **errors-in-console** — Browser errors were logged to the console
- **inspector-issues** — Issues were logged in the `Issues` panel in Chrome Devtools