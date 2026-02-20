# Source of Truth — Design System Components

> Plan vigente: [ROADMAP.md](../../ROADMAP.md)
> CSS target: Arquitectura modular (ver ROADMAP §2)
> Prompt orchestrador: [PROMPT-ds-redesign-v2.md](./PROMPT-ds-redesign-v2.md)
> Verificado por grep (PowerShell Select-String) el 2026-02-19.
> Sin checks = sin evidencia. Scan: 49 HTML + 44 JS files.

## Componentes en swiss-style.css — Por prioridad

### P0 — Universales (35+ páginas)

- [x] Buttons (`.btn`) — 47 pages, 384+860 hits ✅ verified 17 hits in swiss-style.css
  - **Estructura:** Base + 6 variantes: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-icon-flat`. Usa `--control-h`, `--radius-button`.
  - **Estados:** `:hover`, `:active`, `:disabled`, `:focus-visible`.
  - **JS deps:** 860 hits — mayormente `getElementById('btn-*')` + event listeners. Clases no se modifican dinámicamente (salvo `disabled`).

- [x] Topbar (`.topbar`) — 45 pages, 254+6 hits ✅ verified 17 hits in swiss-style.css
  - **Estructura:** Header fijo. 3 zonas: `.topbar-start`, `.topbar-center`, `.topbar-end`. Usa `--topbar-height: 56px`.
  - **Estados:** Sticky on scroll. Dropdown user menu (`.dropdown-container`).
  - **JS deps:** `auth.js` inyecta nombre de usuario. `nav.js` maneja dropdown toggle.

- [x] Page Shell (`.page-shell`) — 45 pages, 48+0 hits ✅ verified 5 hits in swiss-style.css
  - **Estructura:** Container principal (`<main>`). Padding, max-width, margin auto.
  - **Estados:** Ninguno. Puro CSS.
  - **JS deps:** Ninguna.

- [x] Breadcrumb (`.breadcrumb`) — 43 pages, 267 hits ✅ verified 13 hits in swiss-style.css

- [x] Toasts (`.toast`) — 40 pages, 48+336 hits ✅ verified 5 hits in swiss-style.css
  - **Estructura:** Container fijo bottom-right. Variantes: `.toast-success`, `.toast-error`, `.toast-warning`. Auto-dismiss con animación.
  - **Estados:** `.is-visible` (slide-in), salida por timeout (3s default).
  - **JS deps:** `showToast()` en `toasts.js` — crea DOM, agrega clase, auto-remove. **No tocar el JS.**

- [x] Cards (`.card`) — 39 pages, 313+190 hits ✅ verified 8 hits in swiss-style.css
  - **Estructura:** `.card-header`, `.card-title`, `.card-body`, `.card-footer`. Usa `--card-bg`, `--card-border`, `--card-radius`.
  - **Estados:** Estático. Algunas con `.card-stat` para métricas.
  - **JS deps:** Contenido dinámico insertado en `.card-body`. Estructura HTML estable.

- [x] Dashboard Header (`.dashboard-header`) — 36 pages, 57 hits ✅ verified 5 hits in swiss-style.css

- [x] Dropdown Menu (`.dropdown-menu`, `.dropdown-item`) — 34 pages, 96 hits ✅ verified 4 hits in swiss-style.css

### P1 — Alto uso (13-29 páginas)

- [ ] Staff Dashboard (`.staff-dashboard`) — 29 pages, 51 hits ⭐ NEW
- [ ] Input/Forms (`.input`, `.form-group`, `.form-label`) — 27 pages, 421 hits ⭐ NEW
- [ ] State Blocks (`.state-block`, `.state-loader`) — 20 pages, 62 hits ⭐ NEW

- [ ] Modals (`.modal`) — 17 pages, 283+458 hits
  - **Estructura:** `.modal-overlay` + `.modal-card` + `.modal-header` / `.modal-body` / `.modal-footer`. Variantes: `.modal-compact`, `.modal-content-xl`.
  - **Estados:** `.hidden` (cerrado), visible (abierto). Algunos usan `<dialog>` nativo.
  - **JS deps:** ⚠️ **Alto riesgo.** 458 JS hits. Toggle de `.hidden`, `showModal()`, `close()`. Mantener ambos patrones (div overlay + dialog).

- [ ] Spinner (`.spinner`) — 15 pages, 29+1 hits
  - **Estructura:** Loading indicator con animación CSS. Variante inline (`.state-loader`) y fullscreen (`.page-card-loading`).
  - **Estados:** `.is-visible` / hidden.
  - **JS deps:** Toggle de visibilidad en callbacks de fetch.

- [ ] Slide Panel (`.slide-panel`) — 14 pages, 16 hits ⭐ NEW
- [ ] Tabs (`.tab-bar`, `.tab-chip`) — 13 pages, 44 hits ⭐ NEW
- [ ] Table cells (`.table-cell`) — 11 pages, 235 hits ⭐ NEW
- [ ] Pill Group (`.pill-group`) — 11 pages, 11 hits ⭐ NEW

- [ ] Checkbox (`.checkbox`) — 10 pages, 39+17 hits
  - **Estructura:** `appearance: none` + decoración CSS. Check mark via `::after`. Dentro de `.checkbox-row`.
  - **Estados:** `:checked` (green bg + ✓), `:hover`, `:disabled`.
  - **JS deps:** `checked` property leída por JS. No modifica clases.

### P2 — Especializados (2-9 páginas)

- [ ] Workday Status (`.workday-status`) — 9 pages, 9 hits ⭐ NEW
- [ ] Actions Bar (`.actions-bar`) — 8 pages, 12 hits ⭐ NEW

- [ ] KPI (`.kpi-value`) — 5 pages, 12+1 hits
  - **Estructura:** Typography token para valores numéricos grandes. Dentro de `.chart-kpi-card`.
  - **Estados:** `.chart-kpi-success`, `.chart-kpi-trend`.
  - **JS deps:** Contenido dinámico (innerText). Sin cambios de clase.

- [ ] Summary Metrics (`.summary-metric`) — 4 pages, 75 hits ⭐ NEW

- [ ] Progress Bar (`.progress-bar`) — 4 pages, 14+4 hits
  - **Estructura:** Track (bg) + fill (fg). Width dinámica via `style.width`.
  - **Estados:** Color por completeness (green/yellow/red).
  - **JS deps:** `style.width = '${pct}%'` — sin cambio de clases.

- [ ] Tables (`.data-table`) — 3 pages, 16+4 hits
  - **Estructura:** `.table-viewport`, `.table-scroll`, `.table-sticky`, `.table-head`, `.table-cell`. Sorting via `.sortable` + `.sort-icon`.
  - **Estados:** `.is-header`, hover en rows.
  - **JS deps:** `innerHTML` para tbody rebuild. Sorting event listeners.

- [ ] Chart KPI (`.chart-kpi`) — 3 pages, 35 hits ⭐ NEW
- [ ] Badge (`.badge`) — 3 pages, 4 hits ⭐ NEW

- [ ] Tooltips (`.tooltip`) — 2 pages, 15+11 hits
  - **Estructura:** `.tooltip-trigger` con `data-tooltip="text"`. Posicionamiento vía CSS `::after`.
  - **Estados:** `:hover` muestra tooltip.
  - **JS deps:** Solo data attribute. Puro CSS.

- [ ] Custom Dropdown (`.custom-dropdown`) — 2 pages, 22+9 hits
  - **Estructura:** `.custom-dropdown-trigger` + `.custom-dropdown-menu` + `.custom-dropdown-option`. Hidden `<select>` para backward compat.
  - **Estados:** `.open` (menú visible), `.selected` en opciones.
  - **JS deps:** `admin-central-stock.js` L350-434 usa Wrap Approach. **Referencia validada.**

- [ ] Avatar (`.avatar`) — 2 pages, 6 hits ⭐ NEW
- [ ] Skeleton (`.skeleton`) — 2 pages, 30 hits ⭐ NEW

### P3 — Uso mínimo (1 página)

- [ ] Toggle Switch (`.toggle-switch`) — 1 page (admin-workdays)
  - **Estructura:** Input checkbox con estilo de switch slider. Track + thumb.
  - **Estados:** `:checked` (slide right + color change).
  - **JS deps:** `checked` property. Sin cambios de clase.

- [ ] Anomaly Alerts (`.anomaly-alert`) — 1 page (admin-workdays)
  - **Estructura:** Alert banner con icono + mensaje. Variantes: warning, error.
  - **Estados:** `.is-visible` / hidden.
  - **JS deps:** Toggle de visibilidad.

- [ ] Status Dots (`.status-dot`) — 1 page (operativo-index)
  - **Estructura:** Dot indicator con color semántico. Variantes: active, inactive, warning.
  - **Estados:** Puro CSS, cambio de clase por JS.
  - **JS deps:** `classList.add/remove` para cambiar estado.

### Eliminados

- ~~Tabs (`.wk-tab`)~~ — 0 pages → No se usa
- ~~Health Score (`.health-score`)~~ — 0 pages → No se usa

---

## Totales

|   Tier    | Componentes | Páginas cubiertas |
| :-------: | :---------: | :---------------: |
|    P0     |      8      |       34-47       |
|    P1     |     10      |       10-29       |
|    P2     |     12      |        2-9        |
|    P3     |      3      |         1         |
| **Total** |   **33**    |       **—**       |

## Regla

Solo marcar `[x]` cuando `Select-String -Path swiss-style.css -Pattern "nombre-clase"` devuelva ≥1 resultado.

## Archivos de referencia

| Archivo                   | Path                                                 | Rol                              |
| ------------------------- | ---------------------------------------------------- | -------------------------------- |
| tokens.css                | `assets/css/tokens.css`                              | Paleta canónica — INMUTABLE      |
| MASTER.md                 | `.agent/design-system/MASTER.md`                     | Spec visual Swiss Style          |
| swiss-style.css           | `assets/css/swiss-style.css`                         | Destino de producción            |
| components.css            | `assets/css/components.css`                          | Ref funcional legacy (NO copiar) |
| design-system-visual.html | `docs/_generated/frontend/design-system-visual.html` | Referencia visual                |
| ROADMAP.md                | `ROADMAP.md`                                         | Plan maestro unificado           |
| DS Rules                  | `.gemini/design-system.md`                           | R1-R9 para todo agente           |
