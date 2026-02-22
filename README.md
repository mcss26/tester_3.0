# Midnight Club / FormulaMid 4

> Frontend + utilidades operativas para gestión de nightclub.  
> HTML estático · Vanilla JS · Supabase · CSS modular

---

## Arquitectura

| Capa     | Tecnología                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | HTML estático + Vanilla JS (ES modules)                                                                                                        |
| Estilos  | CSS modular: `tokens.css` + 5 modulares (`base`, `layout`, `components`, `forms`, `utilities`) + `theme-swiss.css` (opt-in) + 16 page-specific |
| Backend  | Supabase (Auth, Postgres 65 tablas, 27 vistas, 38 RPCs, Edge Functions)                                                                        |
| Tooling  | Node.js (audits) + PowerShell (scans, watchdogs, verificación) + Playwright (E2E)                                                              |
| Hosting  | Estático (sin bundler, sin framework)                                                                                                          |

## Estructura del Repositorio

```text
tester_3.0/
├── pages/          46 HTML (7 módulos: admin, encargados, operativo, logística, staff, gerencia, prototypes)
├── assets/
│   ├── css/        tokens.css + 5 modulares (base/layout/components/forms/utilities) + theme-swiss.css (opt-in) + 16 page-specific
│   └── js/
│       ├── core/   20 módulos (auth, config, router, utils, supabase-client)
│       ├── modules/ 42 módulos de negocio
│       └── importers/ 6 importadores (GBOL, AFIP, Passline)
├── scripts/        27 herramientas operativas (audit, extract, backup, context, security)
├── docs/           _router.md → 00-source-of-truth/ 01-design-system/ 02-ui-ux/ 03-business-logic/ 04-operations/ 80-ephemeral/
├── supabase/       39 migraciones + 1 edge function
├── .agent/         4 agentes, 12 workflows, 22 skills (component-builder absorbida → css-architect v3.0)
└── tests/          8 subdirs: sql/ audits/ scanners/ watchdogs/ runners/ collectors/ fixtures/ e2e/ (9 specs, 214 tests)
```

## Módulos por Dominio

| Módulo     | Pantallas | Roles                                        |
| ---------- | --------- | -------------------------------------------- |
| Admin      | 20+       | `admin`                                      |
| Operativo  | 9         | `operativo`, `staff_operativo`               |
| Logística  | 5+3       | `logistico`                                  |
| Encargados | 7         | `enc_barra`, `enc_caja`, `enc_limpieza`      |
| Staff      | 2-3       | `staff_barra`, `staff_caja`, `staff_guardia` |
| Gerencia   | 1         | `gerente`                                    |
| Members    | 1         | (sin rol explícito)                          |

## Quick Start

```bash
npm install
npm run audit
```

## Scripts

| Comando                  | Descripción                                   | Script                          |
| ------------------------ | --------------------------------------------- | ------------------------------- |
| `npm run audit`          | Ejecuta todas las auditorías                  | —                               |
| `npm run audit:modules`  | Valida reglas base JS en `assets/js/modules`  | `tests/audits/audit.mjs`        |
| `npm run audit:css`      | Detecta `<style>` e inline styles en `pages/` | `tests/audits/audit-css.js`     |
| `npm run audit:pages`    | Audita HTML y referencias de assets locales   | `tests/audits/audit-modules.js` |
| `npm run audit:links`    | Valida links locales en `.md` y `.html`       | `tests/audits/audit-links.js`   |
| `npm run test:sql`       | Ejecuta suites SQL (stock, cash, payments)    | `tests/runners/run-audits.mjs`  |
| `npm run test:e2e`       | Ejecuta E2E con Playwright                    | `npx playwright test`           |
| `npm run test:e2e:smoke` | Solo smoke tests                              | Playwright smoke.spec.js        |
| `npm run test`           | Todas las auditorías + SQL tests + E2E        | —                               |

## Herramientas PowerShell / Node

| Script                         | Uso                                                              |
| ------------------------------ | ---------------------------------------------------------------- |
| `audit-jsdoc.js`               | Audita cobertura JSDoc en core/ y modules/ → `jsdoc-coverage.md` |
| `audit-links.js`               | Valida links internos en archivos markdown                       |
| `extract-recipes.js`           | Extrae recetas de facturación GBOL                               |
| `inject-csp.js`                | Inyecta Content Security Policy en HTML                          |
| `context-loader.ps1`           | Carga contexto del repo para agentes AI                          |
| `flow-tracer.ps1`              | Traza flujos de ejecución entre módulos                          |
| `doc-mapper.ps1`               | Mapea documentación a estructura del repo                        |
| `security-startup.ps1`         | Verificación de seguridad al iniciar                             |
| `security-shutdown.ps1`        | Limpieza segura al cerrar                                        |
| `visual-audit-screenshots.mjs` | Captura screenshots para auditoría visual                        |
| `workdays-verifier.ps1`        | Verifica integridad de jornadas laborales                        |

## Design System

- **GS Compliance:** Score avg **81%** · 32/45 páginas compliant (≥80) · 5 launchers N/A
- **JSDoc Coverage:** **5%** (43/923 funciones documentadas — core 37%, modules 0-24%)
- Spec completa: [`docs/01-design-system/master-design-spec.md`](docs/01-design-system/master-design-spec.md)
- Compliance matrix: `docs/80-ephemeral/agent-logs/ui-scan/compliance-matrix.md` (regenerar con `ui-component-scanner.ps1`)
- JSDoc report: [`docs/80-ephemeral/agent-logs/jsdoc-coverage.md`](docs/80-ephemeral/agent-logs/jsdoc-coverage.md)

## E2E Testing (Playwright)

- **9 specs** — smoke, auth, health-scan, accessibility, forms, navigation, stock, workday
- **Última corrida:** 121/127 health-scan passed (5.4 min, 2026-02-22)
- **7/7 bugs detectados resueltos** (3 🔴 critical + 4 🟡 yellow)
- Config: [`playwright.config.js`](playwright.config.js)
- Reports: `tests/e2e/report/`

## CSS Modular

| Archivo           | Líneas | Contenido                                          |
| ----------------- | ------ | -------------------------------------------------- |
| `tokens.css`      | 264    | Variables CSS (colores, spacing, shadows, z-index) |
| `base.css`        | 120    | Reset, body, accesibilidad, @keyframes             |
| `layout.css`      | 362    | Topbar, page-shell, breadcrumb, grids, dashboard   |
| `components.css`  | 6797   | Buttons, cards, toasts, modals, dropdowns          |
| `forms.css`       | 321    | Inputs, selects, checkbox, toggle, form-group      |
| `utilities.css`   | 200    | .hidden, .d-flex, .gap-2, responsive helpers       |
| `theme-swiss.css` | 774    | Swiss design theme (opt-in layer)                  |

## Referencias

| Documento                              | Contenido                                     |
| -------------------------------------- | --------------------------------------------- |
| [`state.md`](state.md)                 | Estado actual del proyecto con métricas vivas |
| [`ROADMAP.md`](ROADMAP.md)             | Roadmap técnico por capas de dependencia      |
| [`.agent/README.md`](.agent/README.md) | Instrucciones para agentes AI                 |
| [`docs/_router.md`](docs/_router.md)   | Índice de documentación                       |
