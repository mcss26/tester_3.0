# ✦ Roadmap Técnico: Rediseño UI & Seguridad

> **Última actualización:** 2026-02-20 13:48
> **Fuente de verdad:** Este documento — basado en auditoría de codebase real
> **Método:** Secuencia por dependencias técnicas (cada capa consume la anterior)

---

## Principio Ordenador

> **Cada capa es consumidora de la anterior y proveedora de la siguiente.**
> Tocar una capa fuera de orden genera retrabajo en cascada.

```text
CAPA 0 → CAPA 1 → CAPA 2 → CAPA 3 → CAPA 4
Seguridad  CSS Modular  Layout+Components  Integración  Polish
```

---

## Capa 0 — Seguridad Core 🔒 _(~90% completa)_

> La mayoría de los ítems están resueltos. Quedan 3 pendientes menores.

### Completado ✅

- [x] **`index.html`** — Deprecado, redirige a `login.html`
- [x] **RLS masivo** — 68/68 tablas habilitadas con 113 policies (sub-select a `profiles`)
- [x] **CSP** — Meta tag piloto en `login.html` (script-src, connect-src, frame-src none)
- [x] **Body hide** — Centralizado en `auth.js` (`guardOrRedirect`)
- [x] **Decisiones resueltas** — RLS por sub-select (no custom claims), body hide centralizado

### Pendiente

- [ ] Descomentar `guardOrRedirect` en `scanner.js` (delegado al usuario)
- [ ] Expandir CSP a las demás páginas (post-piloto)
- [ ] Refinar policies RLS genéricas (`authenticated` sin filtro de rol) en ~20 tablas

### Evidencia

- [Seguridad_Arquitectura.md](docs/operaciones/testing/observations/Seguridad_Arquitectura.md) — 7 hallazgos
- [Plan_Blindaje_Review.md](docs/operaciones/testing/observations/Plan_Blindaje_Review.md) — 5 correcciones

---

## Capa 1 — Modularización CSS 🔧 _(decisión pendiente)_

> **Hallazgo crítico:** `components.css` (7820L) es un monolito cargado por 39 páginas. `swiss-style.css` (1325L) tiene el diseño Swiss pero NO lo carga ninguna página de producción. Hay **112 colisiones** de clases definidas en ambos archivos con estilos opuestos.

### Problema

```text
Hoy:                              Objetivo:
components.css    7820L (todo)    base.css         ~80L
swiss-style.css   1325L (0 páginas) → layout.css       ~400L
tokens.css         264L (OK)        components.css   ~800L (slim)
16 page-specific  ~4700L            forms.css        ~250L
                                    utilities.css    ~100L
                                    tokens.css        264L (sin cambios)
                                    16 page-specific ~4700L (sin cambios)
```

### Objetivos

1. **Modularizar** `components.css` (7820L) → 5 archivos categorizados (~1630L total)
2. **Resolver 112 colisiones** — Para cada componente, elegir Swiss o Zinc como canónico
3. **Activar Swiss** — Los componentes P0 ya migrados (buttons ‹›, cards transparentes, toasts CLI) pasan a producción
4. **Crear definiciones Swiss** para tables, tabs, badges (P1 con alto uso)
5. **Absorber `swiss-style.css`** — Se distribuye en los archivos modulares y se elimina
6. **Actualizar `<link>`** en las 39 páginas HTML

### Archivos propuestos

| Archivo          | Contenido                                                                        | Fuente                                              |
| :--------------- | :------------------------------------------------------------------------------- | :-------------------------------------------------- |
| `base.css`       | Reset, body, accesibilidad, @keyframes                                           | components.css L99-160 + swiss-style.css L48-81     |
| `layout.css`     | Topbar, page-shell, breadcrumb, wrapper, grids, dashboard-header                 | swiss-style.css L83-523 + components.css L1127-1384 |
| `components.css` | Buttons, cards, toasts, modals, badges, dropdowns, progress, spinners, skeletons | Swiss P0 + Zinc P1/P2                               |
| `forms.css`      | Inputs, selects, checkbox, toggle, custom-dropdown, form-group                   | components.css L293-463 + swiss-style.css forms     |
| `utilities.css`  | .hidden, .d-flex, .gap-2, .text-right, responsive helpers                        | components.css L1741-1825                           |

### Por qué antes de Layout/Components

Sin esta modularización, cualquier cambio en Layout (Capa 2 antigua) o Componentes (Capa 3 antigua) requiere editar un archivo de 7820 líneas. La modularización habilita que agentes trabajen en archivos de 200-400 líneas con scope claro.

### Verificación

- [ ] Cada clase existe en UN solo archivo (0 colisiones)
- [ ] Las 39 páginas cargan los 5 archivos modulares
- [ ] Visual regression: las páginas se ven igual o mejor
- [ ] `swiss-style.css` eliminado

---

## Capa 2 — Tokens + Layout 🎨📐

> Tokens ya funcionan parcialmente. Layout se beneficia de la modularización.

### Tokens

1. **Consolidar aliases** — `--border-1`↔`--border-subtle`, `--bg-elev`↔`--bg-elevated`
2. **Consolidar** — Spacing 8pt, Zinc Palette WCAG, Shadows SaaS, Z-Index scale
3. **Blindar** — `tokens.css` como única fuente de variables CSS
4. **Remediar** — 41 prompts CLI listos en `docs/output/ui-scan/cli-prompts/`

### Layout

1. **Prototipar** layout refinado en módulo encargados (sandbox: 0 `#id`, 0 `!important`, 76L CSS)
2. **CustomDropdowns** transversal — reemplazar `<select>` nativos (~25 páginas)
3. **Responsive** — Breakpoints del token system

### Verificación

- [ ] 0 redefiniciones de `:root` fuera de `tokens.css`
- [ ] Todas las variables de spacing usan múltiplos de 8
- [ ] Encargados usan el layout refinado

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

| Script                     | Uso                                                 |
| -------------------------- | --------------------------------------------------- |
| `ui-component-scanner.ps1` | Escanea páginas y genera `summary.json` con scores  |
| `ds-verify.ps1`            | Compara scores pre/post y detecta regresiones Tier0 |
| `audit-links.js`           | Verifica 0 errores 404 en rutas CSS/JS              |
| `audit-css.js`             | Audita especificidad y patrones tóxicos             |
| `security-watchdog.ps1`    | Monitoreo de seguridad                              |

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
