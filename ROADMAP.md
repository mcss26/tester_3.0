# ✦ Roadmap Técnico: Rediseño UI & Seguridad

> **Última actualización:** 2026-02-21 23:30
> **Fuente de verdad:** Este documento — basado en auditoría de codebase real
> **Método:** Secuencia por dependencias técnicas (cada capa consume la anterior)

---

## Principio Ordenador

> **Cada capa es consumidora de la anterior y proveedora de la siguiente.**
> Tocar una capa fuera de orden genera retrabajo en cascada.

```text
CAPA 0 → CAPA 1 → CAPA 2 → E2E → CAPA 3 → CAPA 4
Seguridad  CSS Modular  Layout    Testing  Integración  Polish
```

---

## Capa 0 — Seguridad Core 🔒 _(~95% completa)_

> La mayoría de los ítems están resueltos. Quedan 2 pendientes menores.

### Completado ✅

- [x] **`index.html`** — Deprecado, redirige a `login.html`
- [x] **RLS masivo** — 68/68 tablas habilitadas con 113 policies (sub-select a `profiles`)
- [x] **CSP** — Meta tag piloto en `login.html` (script-src, connect-src, frame-src none)
- [x] **Body hide** — Centralizado en `auth.js` (`guardOrRedirect`)
- [x] **Decisiones resueltas** — RLS por sub-select (no custom claims), body hide centralizado

### Pendiente

- [x] ~~Descomentar `guardOrRedirect` en `scanner.js`~~ → ✅ Restaurado + mock user eliminado + profile real (2026-02-21)
- [ ] Expandir CSP a las demás páginas (post-piloto)
- [ ] Refinar policies RLS genéricas (`authenticated` sin filtro de rol) en ~20 tablas

### Evidencia

- [Seguridad_Arquitectura.md](docs/operaciones/testing/observations/Seguridad_Arquitectura.md) — 7 hallazgos
- [Plan_Blindaje_Review.md](docs/operaciones/testing/observations/Plan_Blindaje_Review.md) — 5 correcciones

---

## Capa 1 — Modularización CSS ✅ _(completada)_

> `components.css` (7820L) modularizado en 5 archivos. 112 colisiones Swiss↔Zinc resueltas. `swiss-style.css` → `theme-swiss.css` (opt-in, 774L). 42 páginas actualizadas.

### Resultado

| Archivo          | Líneas | Contenido                                        |
| :--------------- | :----- | :----------------------------------------------- |
| `base.css`       | 120    | Reset, body, accesibilidad, @keyframes           |
| `layout.css`     | 362    | Topbar, page-shell, breadcrumb, grids, dashboard |
| `components.css` | 6797   | Buttons, cards, toasts, modals, dropdowns        |
| `forms.css`      | 321    | Inputs, selects, checkbox, toggle, form-group    |
| `utilities.css`  | 200    | .hidden, .d-flex, .gap-2, responsive helpers     |

### Verificación ✅

- [x] Cada clase existe en UN solo archivo (0 colisiones)
- [x] 42 páginas cargan los 5 archivos modulares
- [x] Visual regression: páginas se ven igual
- [x] `swiss-style.css` → `swiss-style.css.bak`, reemplazado por `theme-swiss.css`

---

## Capa 2 — Tokens + Layout + GS Compliance ✅ _(completada)_

> Tokens consolidados, layout responsive, CustomDropdowns transversal, GS compliance remediation.

### Tokens ✅

- [x] Aliases consolidados — 14 pares documentados con migration registry
- [x] Spacing semántico (canonical) + numérico (retrocompat aliases), `--space-3: 12px`
- [x] Aurora legacy eliminado (0 usos)

### Layout ✅

- [x] `page-shell` responsive: `--shell-px` 100→48→16px con breakpoints
- [x] `planner-layout` stacking ≤1024px
- [x] CustomDropdowns transversal — progressive enhancement en 21 páginas

### GS Compliance ✅

- [x] Scanner relevancia: 10 reglas contextuales (launchers, sidebar, panels, stats, zero-denominator N/A)
- [x] 7 páginas HTML remediadas (batches 1-5)
- [x] **Score avg 59→81 (+22pts), compliant 2→32 (16×)**
- [x] 5 launchers → N/A, 4 parciales (prototipos/scanner), 4 críticos (test pages)

### Verificación ✅

- [x] 0 redefiniciones de `:root` fuera de `tokens.css`
- [x] Variables de spacing usan múltiplos de 8
- [x] 32/45 páginas ≥80% GS compliance

---

## E2E Testing — Playwright 🧪 _(~90% completa)_

> 214 tests automatizados cubriendo 46 páginas. **194 passed, 20 bugs encontrados.**

### Completado ✅

- [x] Playwright instalado + Chromium
- [x] `playwright.config.js` — 4 proyectos (setup, smoke, auth, authenticated)
- [x] `smoke.spec.js` — 10 tests (páginas cargan sin JS errors)
- [x] `auth.spec.js` — 5 tests (login válido/inválido, validación, staff toggle)
- [x] `auth.setup.js` — Login real + storageState reutilizable
- [x] `navigation.spec.js` — 17 tests (nav links admin + módulos autenticados)
- [x] `workday.spec.js` — 5 tests (page, data, interacciones)
- [x] `stock.spec.js` — 5 tests (page, productos, búsqueda, filtros)
- [x] `health-scan.spec.js` — 126 tests (JS errors + 404 + IDs duplicados en 42 páginas)
- [x] `accessibility.spec.js` — 45 tests (alt, labels, headings, links vacíos)
- [x] `forms.spec.js` — 42 tests (estructura, required visual, select defaults)

### Bugs Encontrados (20)

| Sev.      | Bug                                                              | Páginas                                   |
| --------- | ---------------------------------------------------------------- | ----------------------------------------- |
| ~~🔴~~ ✅ | ~~JS crash `assertSbOrShowBlockingError`~~ — `utils.js` agregado | QR Monitor                                |
| ~~🔴~~ ✅ | ~~404 `admin-portal.js`~~ → renombrado a `admin-index.js`        | admin-index                               |
| ~~🔴~~ ✅ | ~~ID duplicado `staff-active`~~ → checkbox `staff-is-active`     | admin-master-nomina                       |
| 🟡        | 73 selects sin placeholder                                       | admin-config (62), pagos, stock, workdays |
| 🟡        | 12 inputs required sin asterisco                                 | pagos, stock, workdays, operativo         |
| 🟡        | 11 inputs sin label/aria-label                                   | workdays (4), stock (7)                   |
| 🟡        | Headings saltan h2→h4                                            | workdays, pagos                           |

### Pendiente

- [x] ~~Corregir 3 bugs críticos (🔴)~~ → ✅ Todos resueltos (2026-02-21)
- [ ] Tests por rol (operativo, encargado, staff → cada uno a su index)
- [ ] Tests CRUD (crear/editar con cleanup)

---

## Capa 3 — Integración + Polish 🔗✨

### Integración

1. **Limpieza** — Mover archivos legacy a `.archive/`
2. **Validación** — `audit-links.js` + `ds-verify.ps1` en todas las páginas
3. **Aplanar** — Solo los 2 selectores `#id` reales (`#payModal`, `#btn-view-all-requests`)

### Polish

1. **Profundidad** — Sombras multinivel SaaS
2. **Tipografía** — Jerarquía visual refinada
3. **Micro-animaciones** — Transitions, hover states
4. **Validación final** — `visual.html` como golden standard del catálogo

---

## Protocolo de Cambios (Estándar)

```text
1. ds-verify.ps1 -SaveBaseline     → fijar estado actual
2. Ejecutar transformación          → una capa a la vez
3. ds-verify.ps1                    → comparar contra baseline
4. Si regresión Tier0 → revertir   → no avanzar
5. Si ok → nuevo baseline          → siguiente cambio
```

---

## Herramientas Disponibles

| Script                                    | Uso                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `tests/scanners/ui-component-scanner.ps1` | Escanea 45 páginas, 10 reglas de relevancia contextual, genera matrix + CLI prompts  |
| `tests/scanners/ds-verify.ps1`            | Compara scores pre/post y detecta regresiones Tier0                                  |
| `tests/audits/audit-links.js`             | Verifica 0 errores 404 en rutas CSS/JS                                               |
| `tests/audits/audit-css.js`               | Audita especificidad y patrones tóxicos                                              |
| `tests/watchdogs/security-watchdog.ps1`   | Monitoreo de seguridad                                                               |
| **Playwright** (`tests/e2e/`)             | **214 tests E2E**: smoke, auth, navigation, workday, stock, health-scan, a11y, forms |

---

## Documentación del Design System

> Consolidada en [`docs/design-system/`](docs/design-system/) (2026-02-20):

| Archivo                                                         | Rol                                                |
| :-------------------------------------------------------------- | :------------------------------------------------- |
| [`MASTER.md`](docs/design-system/MASTER.md)                     | Spec completa — tokens, componentes, anti-patterns |
| [`truth.md`](docs/design-system/truth.md)                       | Inventario de 33 componentes priorizados P0-P3     |
| [`audit.md`](docs/design-system/audit.md)                       | 163 divergencias documentadas                      |
| [`visual.html`](docs/design-system/visual.html)                 | Catálogo visual renderizado (87KB)                 |
| [`hardcoded-colors.md`](docs/design-system/hardcoded-colors.md) | 128 hex fuera de `:root`                           |
| `prompts/`                                                      | 7 prompts reusables para agentes                   |
| `reports/`                                                      | 4 reports de auditoría                             |

---

## Planes Relacionados (Otros Dominios)

| Plan                  | Dominio                        | Ubicación                                        |
| --------------------- | ------------------------------ | ------------------------------------------------ |
| PLAN_PRODUCTION_READY | Security, CI/CD, Deploy        | `docs/codex/PLAN_PRODUCTION_READY.md`            |
| Workdays Roadmap      | Backend + Frontend (8 sprints) | `docs/migration/artifacts/roadmap_production.md` |

> [!NOTE]
> Estos planes cubren dominios **fuera del scope** de este ROADMAP (que es UI/CSS + Seguridad Core).
