# âœ¦ Roadmap TÃ©cnico: RediseÃ±o UI & Seguridad

> **Ãšltima actualizaciÃ³n:** 2026-02-22 03:43
> **Fuente de verdad:** Este documento â€” basado en auditorÃ­a de codebase real
> **MÃ©todo:** Secuencia por dependencias tÃ©cnicas (cada capa consume la anterior)

---

## Principio Ordenador

> **Cada capa es consumidora de la anterior y proveedora de la siguiente.**
> Tocar una capa fuera de orden genera retrabajo en cascada.

```text
CAPA 0 â†’ CAPA 1 â†’ CAPA 2 â†’ E2E â†’ CAPA 3 â†’ CAPA 4
Seguridad  CSS Modular  Layout    Testing  IntegraciÃ³n  Polish
```

---

## Capa 0 â€” Seguridad Core ðŸ”’ âœ… _(completada)_

> Todos los Ã­tems de seguridad core han sido resueltos.

### Completado âœ…

- [x] **`index.html`** â€” Deprecado, redirige a `login.html`
- [x] **RLS masivo** â€” 68/68 tablas habilitadas con 113 policies (sub-select a `profiles`)
- [x] **CSP** â€” Meta tag expandido a 46/46 pÃ¡ginas via `inject-csp.js` (improved update mode)
- [x] **Body hide** â€” Centralizado en `auth.js` (`guardOrRedirect`)
- [x] **Decisiones resueltas** â€” RLS por sub-select (no custom claims), body hide centralizado

### Pendiente

- [ ] Refinar policies RLS genÃ©ricas (`authenticated` sin filtro de rol) en ~20 tablas

### Evidencia

- `Seguridad_Arquitectura.md` â€” 7 hallazgos (eliminado en reestructuraciÃ³n docs)
- `Plan_Blindaje_Review.md` â€” 5 correcciones (eliminado en reestructuraciÃ³n docs)

---

## Capa 1 â€” ModularizaciÃ³n CSS âœ… _(completada)_

> `components.css` (7820L) modularizado en 5 archivos. 112 colisiones Swissâ†”Zinc resueltas. `swiss-style.css` â†’ `theme-swiss.css` (opt-in, 774L). 42 pÃ¡ginas actualizadas.

### Resultado

| Archivo          | LÃ­neas | Contenido                                        |
| :--------------- | :----- | :----------------------------------------------- |
| `base.css`       | 120    | Reset, body, accesibilidad, @keyframes           |
| `layout.css`     | 362    | Topbar, page-shell, breadcrumb, grids, dashboard |
| `components.css` | 6797   | Buttons, cards, toasts, modals, dropdowns        |
| `forms.css`      | 321    | Inputs, selects, checkbox, toggle, form-group    |
| `utilities.css`  | 200    | .hidden, .d-flex, .gap-2, responsive helpers     |

### VerificaciÃ³n âœ…

- [x] Cada clase existe en UN solo archivo (0 colisiones)
- [x] 42 pÃ¡ginas cargan los 5 archivos modulares
- [x] Visual regression: pÃ¡ginas se ven igual
- [x] `swiss-style.css` â†’ `swiss-style.css.bak`, reemplazado por `theme-swiss.css`

---

## Capa 2 â€” Tokens + Layout + GS Compliance âœ… _(completada)_

> Tokens consolidados, layout responsive, CustomDropdowns transversal, GS compliance remediation.

### Tokens âœ…

- [x] Aliases consolidados â€” 14 pares documentados con migration registry
- [x] Spacing semÃ¡ntico (canonical) + numÃ©rico (retrocompat aliases), `--space-3: 12px`
- [x] Aurora legacy eliminado (0 usos)

### Layout âœ…

- [x] `page-shell` responsive: `--shell-px` 100â†’48â†’16px con breakpoints
- [x] `planner-layout` stacking â‰¤1024px
- [x] CustomDropdowns transversal â€” progressive enhancement en 21 pÃ¡ginas

### GS Compliance âœ…

- [x] Scanner relevancia: 10 reglas contextuales (launchers, sidebar, panels, stats, zero-denominator N/A)
- [x] 7 pÃ¡ginas HTML remediadas (batches 1-5)
- [x] **Score avg 59â†’81 (+22pts), compliant 2â†’32 (16Ã—)**
- [x] 5 launchers â†’ N/A, 4 parciales (prototipos/scanner), 4 crÃ­ticos (test pages)

### VerificaciÃ³n âœ…

- [x] 0 redefiniciones de `:root` fuera de `tokens.css`
- [x] Variables de spacing usan mÃºltiplos de 8
- [x] 32/45 pÃ¡ginas â‰¥80% GS compliance

---

## E2E Testing â€” Playwright ðŸ§ª âœ… _(completada sprint 1)_

> 234 tests automatizados cubriendo 46 pÃ¡ginas. **214 passed, 20 bugs encontrados.**

### Completado âœ…

- [x] Playwright instalado + Chromium
- [x] `playwright.config.js` â€” 4 proyectos (setup, smoke, auth, authenticated)
- [x] `smoke.spec.js` â€” 10 tests (pÃ¡ginas cargan sin JS errors)
- [x] `auth.spec.js` â€” 5 tests (login vÃ¡lido/invÃ¡lido, validaciÃ³n, staff toggle)
- [x] `auth.setup.js` â€” Login real + storageState reutilizable
- [x] `navigation.spec.js` â€” 17 tests (nav links admin + mÃ³dulos autenticados)
- [x] `role-navigation.spec.js` â€” 20 tests (nuevos flujos por rol)
- [x] `workday.spec.js` â€” 5 tests (page, data, interacciones)
- [x] `stock.spec.js` â€” 5 tests (page, productos, bÃºsqueda, filtros)
- [x] `health-scan.spec.js` â€” 126 tests (JS errors + 404 + IDs duplicados en 42 pÃ¡ginas)
- [x] `accessibility.spec.js` â€” 45 tests (alt, labels, headings, links vacÃ­os)
- [x] `forms.spec.js` â€” 42 tests (estructura, required visual, select defaults)

### Bugs Encontrados (20)

| Sev.      | Bug                                                              | PÃ¡ginas                                   |
| --------- | ---------------------------------------------------------------- | ----------------------------------------- |
| ~~ðŸ”´~~ âœ… | ~~JS crash `assertSbOrShowBlockingError`~~ â€” `utils.js` agregado | QR Monitor                                |
| ~~ðŸ”´~~ âœ… | ~~404 `admin-portal.js`~~ â†’ renombrado a `admin-index.js`        | admin-index                               |
| ~~ðŸ”´~~ âœ… | ~~ID duplicado `staff-active`~~ â†’ checkbox `staff-is-active`     | admin-master-nomina                       |
| ðŸŸ¡        | 73 selects sin placeholder                                       | admin-config (62), pagos, stock, workdays |
| ðŸŸ¡        | 12 inputs required sin asterisco                                 | pagos, stock, workdays, operativo         |
| ðŸŸ¡        | 11 inputs sin label/aria-label                                   | workdays (4), stock (7)                   |
| ðŸŸ¡        | Headings saltan h2â†’h4                                            | workdays, pagos                           |

### Pendiente

- [ ] Tests CRUD (crear/editar con cleanup)

---

## Capa 3 â€” IntegraciÃ³n + Polish âœ… ðŸ”—âœ¨ _(completada)_

### IntegraciÃ³n âœ…

1. [x] **Limpieza** â€” Archivos legacy movidos a `.archive/`
2. [x] **ValidaciÃ³n** â€” `audit-links.js` + `ds-verify.ps1` en todas las pÃ¡ginas (0 errores)
3. [x] **Aplanar** â€” Selectores `#payModal` y `#btn-view-all-requests` convertidos a clases

### Polish âœ…

1. [x] **Profundidad** â€” Sombras multinivel SaaS (5 niveles) en `tokens.css`
2. [x] **TipografÃ­a** â€” JerarquÃ­a visual refinada
3. [x] **Micro-animaciones** â€” Transitions, hover (translateY), modal-enter (200ms)
4. [x] **ValidaciÃ³n final** â€” `visual.html` como golden standard del catÃ¡logo

---

## Capa 4 â€” UX/DX (En progreso)

### Completado âœ…

- [x] **JSDoc Core** â€” DocumentaciÃ³n tÃ©cnica en 7 archivos centrales (auth, utils, config, etc.)
- [x] **Encargado Personal Pages** â€” Topbar GS estandarizado (breadcrumb-only, sin â† arrow), page states alineados a GS (`page-card-loading`/`page-card-empty`/`module-content`), status pill limpio

### Pendiente

- [ ] AuditorÃ­a visual completa de todas las pantallas (screenshots + wiremap)
- [ ] Refactor de templates JS para mayor legibilidad
- [ ] OptimizaciÃ³n de carga inicial (Critical CSS path)

---

## Protocolo de Cambios (EstÃ¡ndar)

```text
1. ds-verify.ps1 -SaveBaseline     â†’ fijar estado actual
2. Ejecutar transformaciÃ³n          â†’ una capa a la vez
3. ds-verify.ps1                    â†’ comparar contra baseline
4. Si regresiÃ³n Tier0 â†’ revertir   â†’ no avanzar
5. Si ok â†’ nuevo baseline          â†’ siguiente cambio
```

---

## Herramientas Disponibles

| Script                                    | Uso                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `tests/scanners/ui-component-scanner.ps1` | Escanea 45 pÃ¡ginas, 10 reglas de relevancia contextual, genera matrix + CLI prompts  |
| `tests/scanners/ds-verify.ps1`            | Compara scores pre/post y detecta regresiones Tier0                                  |
| `tests/audits/audit-links.js`             | Verifica 0 errores 404 en rutas CSS/JS                                               |
| `tests/audits/audit-css.js`               | Audita especificidad y patrones tÃ³xicos                                              |
| `tests/watchdogs/security-watchdog.ps1`   | Monitoreo de seguridad                                                               |
| **Playwright** (`tests/e2e/`)             | **214 tests E2E**: smoke, auth, navigation, workday, stock, health-scan, a11y, forms |

---

## DocumentaciÃ³n del Design System

> Consolidada en [`docs/01-design-system/`](docs/01-design-system/) (2026-02-20):

| Archivo                                         | Rol                                                |
| :---------------------------------------------- | :------------------------------------------------- |
| [`MASTER.md`](docs/01-design-system/master-design-spec.md)     | Spec completa â€” tokens, componentes, anti-patterns |
| ~~`truth.md`~~                                  | _(eliminado â€” consolidado en MASTER.md)_           |
| [`audit.md`](docs/01-design-system/audit-and-prompts/audit.md)       | 163 divergencias documentadas                      |
| [`visual.html`](docs/01-design-system/audit-and-prompts/visual.html) | CatÃ¡logo visual renderizado (87KB)                 |
| ~~`hardcoded-colors.md`~~                       | _(eliminado â€” resuelto en migraciÃ³n CSS)_          |
| `prompts/`                                      | 7 prompts reusables para agentes                   |
| `reports/`                                      | 4 reports de auditorÃ­a                             |

---

## Planes Relacionados (Otros Dominios)

| Plan                  | Dominio                        | UbicaciÃ³n                                        |
| --------------------- | ------------------------------ | ------------------------------------------------ |
| PLAN_PRODUCTION_READY | Security, CI/CD, Deploy        | `docs/codex/PLAN_PRODUCTION_READY.md`            |
| Workdays Roadmap      | Backend + Frontend (8 sprints) | `docs/migration/artifacts/roadmap_production.md` |

> [!NOTE]
> Estos planes cubren dominios **fuera del scope** de este ROADMAP (que es UI/CSS + Seguridad Core).
