# Lighthouse Audit: Admin Screens

## Estructura

Cada subcarpeta = 1 pantalla admin. Contenido por carpeta:

| Archivo          | Descripción                                |
| ---------------- | ------------------------------------------ |
| `README.md`      | Metadata de la pantalla (HTML, CSS, JS)    |
| `screenshot.png` | Captura visual (desde visual-audit previo) |
| `context.md`     | Contexto cargado por context-loader        |
| `report.json`    | Lighthouse JSON (13/13 ✅)                 |
| `summary.md`     | Resumen parseado del Lighthouse JSON       |

## Estado actual

| Pantalla                 | Screenshot | Context | Lighthouse |
| ------------------------ | ---------- | ------- | ---------- |
| admin-index              | ✅         | ✅      | ✅         |
| admin-workdays           | ✅         | ✅      | ✅         |
| admin-semanal            | ❌         | ✅      | ✅         |
| admin-reportes           | ✅         | ✅      | ✅         |
| admin-pagos              | ✅         | ✅      | ✅         |
| admin-solicitudes        | ✅         | ✅      | ✅         |
| admin-config             | ✅         | ✅      | ✅         |
| admin-central-stock      | ✅         | ✅      | ✅         |
| admin-master-categorias  | ✅         | ✅      | ✅         |
| admin-master-nomina      | ✅         | ✅      | ✅         |
| admin-master-pos         | ✅         | ✅      | ✅         |
| admin-master-proveedores | ✅         | ✅      | ✅         |
| admin-master-tarifario   | ✅         | ✅      | ✅         |

## Reportes generados

- **lighthouse-matrix.md** — Matriz cruzada de hallazgos (scores, patterns, remediation)
- **console-errors.md** — Errores de consola capturados con Playwright (30 total)

## Scripts

```powershell
# Parsear un reporte individual:
node docs/02-ui-ux/lighthouse/parse-report.js <slug>

# Correr Lighthouse en pantallas pendientes (con auth automática):
node scripts/lighthouse-playwright.js [slug]

# Recolectar errores de consola de todas las pantallas:
node scripts/console-errors-collector.js

# Regenerar la matriz cruzada:
node scripts/lighthouse-matrix.js
```

## Remediación pendiente

1. **CSP script-src** — 28 errores inline script en 13 pantallas
2. **color-contrast** — 19 elementos en 13 pantallas
3. **aria-input-field-name** — 11 elementos en 7 pantallas
4. **label** — 50 elementos en 4 pantallas
5. **meta-description** — Faltante en 13 pantallas
