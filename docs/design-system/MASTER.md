# Design System Master — FormulaMid 4

> **LOGIC:** When building a specific page, first check `design-system/formulamid-4/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** FormulaMid 4  
**Category:** Nightclub / Hospitality ERP — Admin Dashboard  
**Style:** Dark Mode (OLED Pure Black)  
**Stack:** Vanilla CSS (tokens.css → components.css → page.css)  
**Generated:** 2026-02-17 | **Updated:** 2026-02-17 (consolidated with design-system-visual.html)

---

## 1. Color Palette (from `tokens.css`)

### Primitives (Zinc Scale)

| Token            | Hex       | Usage              |
| :--------------- | :-------- | :----------------- |
| `--neutral-0`    | `#000000` | Pure black base    |
| `--neutral-150`  | `#111111` | Surface hover      |
| `--neutral-200`  | `#18181b` | Elevated surfaces  |
| `--neutral-300`  | `#27272a` | Heavy borders      |
| `--neutral-400`  | `#3f3f46` | Disabled elements  |
| `--neutral-600`  | `#71717a` | Placeholder text   |
| `--neutral-700`  | `#a1a1aa` | Tertiary text      |
| `--neutral-800`  | `#d4d4d8` | Secondary text     |
| `--neutral-1000` | `#ffffff` | Primary text / CTA |

### Semantic Colors

| Role           | Variable          | Value     | Notes                     |
| :------------- | :---------------- | :-------- | :------------------------ |
| **Brand/CTA**  | `--brand-primary` | `#ffffff` | White — confirmed by user |
| **Success**    | `--success`       | `#4ade80` | Green-400                 |
| **Warning**    | `--warning`       | `#fbbf24` | Yellow-400                |
| **Danger**     | `--danger`        | `#f87171` | Red-400                   |
| **Info**       | `--info`          | `#60a5fa` | Blue-400                  |
| **Focus Ring** | `--accent-focus`  | `#38bdf8` | Sky-400 for a11y          |
| **Brand Gold** | `--brand-gold`    | `#d4c5a0` | Midnight Club accent      |

### Backgrounds

| Variable             | Value             | Usage             |
| :------------------- | :---------------- | :---------------- |
| `--bg-body`          | `#000000`         | Page background   |
| `--bg-surface`       | `#0a0a0a`         | Card base         |
| `--bg-surface-hover` | `#111111`         | Interactive hover |
| `--bg-elevated`      | `#18181b`         | Raised containers |
| `--backdrop`         | `rgba(0,0,0,0.6)` | Modal overlay     |

### Alpha Transparencies (Glass & Borders)

| Variable           | Value                    | Usage             |
| :----------------- | :----------------------- | :---------------- |
| `--white-alpha-05` | `rgba(255,255,255,0.05)` | Subtle surfaces   |
| `--white-alpha-10` | `rgba(255,255,255,0.10)` | Hover states      |
| `--white-alpha-15` | `rgba(255,255,255,0.15)` | Borders (Subtle)  |
| `--white-alpha-20` | `rgba(255,255,255,0.20)` | Borders (Visible) |

### Swiss Layout Principles (Visual Reference)

> **Directives derived from Reference Images:**
>
> 1. **OLED Canvas:** Backgrounds are `#000000`. No deep grays for main backgrounds, only for elevated surfaces (cards).
> 2. **1px Precision:** Borders are thin, crisp, and used to define grid areas.
> 3. **Type Hierarchy:** Big text is **BIG** and bold. Small text is small and distinct (often mono or uppercase).
> 4. **Neon/Signal Accents:** Interactive elements pop (`--brand-gold`, `--success`, `--info`) against the void.

---

## 2. Typography

### Font Stack (current)

| Role     | Variable      | Value                                                                      |
| :------- | :------------ | :------------------------------------------------------------------------- |
| **Sans** | `--font-sans` | `"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif` |
| **Mono** | `--font-mono` | `"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace`   |

### Scale

| Token       | Size   | Usage                |
| :---------- | :----- | :------------------- |
| `--fs-xs`   | `10px` | Labels, badges       |
| `--fs-sm`   | `11px` | Small text, hints    |
| `--fs-md`   | `12px` | Default data         |
| `--fs-base` | `13px` | Body text            |
| `--fs-lg`   | `14px` | Subheadings          |
| `--fs-xl`   | `16px` | Headings             |
| `--fs-2xl`  | `24px` | Page titles          |
| `--fs-3xl`  | `40px` | Hero (use sparingly) |

### Weights

| Token           | Value | Guideline                                  |
| :-------------- | :---- | :----------------------------------------- |
| `--fw-normal`   | `400` | Body text                                  |
| `--fw-medium`   | `500` | Labels, nav items                          |
| `--fw-semibold` | `600` | Subheadings, buttons — **prefer over 700** |
| `--fw-bold`     | `700` | Page titles only                           |

> [!WARNING]
> Fonts have been flagged as too heavy/large in some areas. Prefer `--fw-semibold` (600) over `--fw-bold` (700) except for main page titles.

---

## 3. Spacing & Geometry

| Token        | Value  | Usage             |
| :----------- | :----- | :---------------- |
| `--space-xs` | `4px`  | Tight gaps        |
| `--space-sm` | `8px`  | Icon gaps, inline |
| `--space-md` | `16px` | Standard padding  |
| `--space-lg` | `24px` | Section padding   |
| `--space-xl` | `32px` | Large gaps        |

### Border Radius

| Token             | Value    | Usage               |
| :---------------- | :------- | :------------------ |
| `--radius-sm`     | `4px`    | Pills, badges       |
| `--radius-md`     | `6px`    | Inputs, small cards |
| `--radius-button` | `8px`    | Buttons             |
| `--radius-lg`     | `10px`   | Cards               |
| `--radius-xl`     | `12px`   | Modals              |
| `--radius-full`   | `9999px` | Circles             |

---

## 4. Z-Index Hierarchy

| Token           | Value   | Usage                  |
| :-------------- | :------ | :--------------------- |
| `--z-base`      | `1`     | Base content           |
| `--z-dropdown`  | `50`    | Dropdowns, tooltips    |
| `--z-sticky`    | `100`   | Topbar, sticky headers |
| `--z-overlay`   | `200`   | Overlays               |
| `--z-modal`     | `300`   | Modal dialogs          |
| `--z-panel`     | `1000`  | Side panels            |
| `--z-toast`     | `1200`  | Toast notifications    |
| `--z-skip-link` | `9999`  | Skip links (a11y)      |
| `--z-progress`  | `10000` | Progress bars          |

> [!IMPORTANT]
> **Always use `var(--z-*)` tokens.** Never hardcode `z-index` values in component or page CSS. Current `components.css` has hardcoded values — standardize them.

---

## 5. Transitions & Motion

| Token               | Value                                | Usage                |
| :------------------ | :----------------------------------- | :------------------- |
| `--transition-fast` | `150ms ease`                         | Micro-interactions   |
| `--transition-base` | `200ms ease`                         | Standard hover/focus |
| `--transition-slow` | `300ms ease`                         | Panels, modals       |
| `--transition`      | `all 0.2s cubic-bezier(0.4,0,0.2,1)` | Default              |

### Reduced Motion (REQUIRED)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

> When the user enables "Reduce motion" in their OS accessibility settings, this disables all CSS animations and transitions automatically.

---

## 6. Shadows

| Token           | Value                         |
| :-------------- | :---------------------------- |
| `--shadow-sm`   | `0 1px 3px rgba(0,0,0,0.3)`   |
| `--shadow-soft` | `0 4px 12px rgba(0,0,0,0.25)` |
| `--shadow-lg`   | `0 16px 48px rgba(0,0,0,0.4)` |

---

## 7. Layout Tokens

| Token             | Value                         |
| :---------------- | :---------------------------- |
| `--topbar-height` | `64px`                        |
| `--header-height` | `64px`                        |
| `--sidebar-width` | `260px`                       |
| `--control-h`     | `36px`                        |
| `--control-h-sm`  | `28px`                        |
| `--control-h-lg`  | `44px` (touch-target minimum) |

---

## 8. Chart Tokens (IMPLEMENTED)

```css
:root {
  --chart-bg: var(--bg-elevated);
  --chart-grid: var(--white-alpha-08);
  --chart-label: var(--text-tertiary);
  --chart-tooltip-bg: var(--neutral-200);
  --chart-tooltip-text: var(--text-primary);
  --chart-tooltip-border: var(--border-subtle);
}
```

> Charts now standardized in `design-system-visual.html` (section 13). Config: `borderWidth: 1–1.2`, `tension: 0.3–0.4`, grid `rgba(255,255,255,0.04)`, axis labels via `--font-mono` at 11px. All Chart.js defaults read from tokens via `getComputedStyle`.

---

## 9. Page Architecture Pattern

```
<body class="admin-shell admin-scroll">
  <header class="topbar">...</header>
  <main class="page-shell">
    <div class="page-card-wrap">
      <div class="page-card overflow-visible">
        <div id="page-card-loading">.spinner</div>
        <div id="page-card-empty">empty state</div>
        <div id="module-content">real content</div>
      </div>
    </div>
  </main>
</body>
```

---

## 10. Spinner (Consolidated)

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
.spinner--sm {
  width: 14px;
  height: 14px;
}
.spinner--lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

> Eliminate: `.state-spinner`, `.loading-spinner`, `.qr-loading-spinner`, `.noche-spinner`. Replace all usages with `.spinner` + size modifier.

---

## 11. Component Patterns (from `design-system-visual.html`)

> Reference: `docs/_generated/frontend/design-system-visual.html` — sections 04-14.

### Buttons

Text-only buttons with `‹ ›` bracket decorators. No backgrounds, no borders, no filling.

```css
.btn {
  font-family: var(--font-mono);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: transparent;
  border: none;
}
.btn::before {
  content: "‹";
  opacity: 0.25;
}
.btn::after {
  content: "›";
  opacity: 0.25;
}
.btn:hover::before,
.btn:hover::after {
  opacity: 0.8;
}
```

| Variant          | Color              | Hover Effect                  |
| :--------------- | :----------------- | :---------------------------- |
| `.btn-primary`   | `--text-primary`   | Letter-spacing expands        |
| `.btn-secondary` | `--text-secondary` | Color escalates to primary    |
| `.btn-ghost`     | `--text-tertiary`  | Color + translateY(-1px)      |
| `.btn-danger`    | `--danger`         | Text-shadow glow              |
| `.btn-gold`      | `--brand-gold`     | Double-layer text-shadow glow |

### Toasts (CLI Style)

No containers, no borders, no backgrounds. Keyword is a solid color block.

```html
<div class="toast toast-success"><strong>OK</strong> Data saved.</div>
```

| Variant          | Keyword BG  | Keyword Color |
| :--------------- | :---------- | :------------ |
| `.toast-success` | `--success` | `#000`        |
| `.toast-error`   | `--danger`  | `#fff`        |

### Status Indicators (Glowing Dots)

Pure dots with glow — no pill containers, no text inside the badge.

```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-dot-success {
  background: var(--success);
  box-shadow:
    0 0 6px var(--success),
    0 0 14px rgba(74, 222, 128, 0.3);
}
```

Labels below the dot: `font-mono`, `10px`, `uppercase`.

### Feedback Patterns (CLI Terminal Style)

- **Loading:** `$ fetching records█` (blinking cursor via `.skeleton` pulse)
- **Empty:** `$ query --filter=all` → `0 results returned`
- No card containers, no SVG illustrations.

### Cards & KPIs

No borders, no radius, transparent background. Separator via `card-header` `border-bottom`.

```css
.card {
  background: transparent;
  border: none;
  border-radius: 0;
}
```

KPI values: `font-family: var(--font-sans)`, `28px`, `font-weight: 600`, `letter-spacing: -0.02em`.
Change badges: solid color blocks (success green bg, warning yellow bg).

### Charts (Chart.js v4.4.1)

| Property      | Line Chart               | Multi-line |
| :------------ | :----------------------- | :--------- |
| `borderWidth` | `1.2`                    | `1`        |
| `tension`     | `0.4`                    | `0.3`      |
| `pointRadius` | `4`                      | `0`        |
| `fill`        | `true`                   | `false`    |
| Grid color    | `rgba(255,255,255,0.04)` | same       |
| X-axis grid   | `display: false`         | same       |
| Tick font     | `--font-mono` at `11px`  | same       |

Legend: Custom HTML dots (6×6px circles) with mono text. No Chart.js built-in legend.

---

## Anti-Patterns (FORBIDDEN)

- Light mode default
- Emojis as icons — use SVG (Heroicons/Lucide) **ONLY**
- Missing `cursor: pointer` on clickable elements
- Layout-shifting hovers (no `scale` transforms that push content)
- Low contrast text (maintain 4.5:1 minimum)
- Instant state changes (always use `--transition-*` tokens)
- Invisible focus states
- Hardcoded `z-index` values (use `--z-*` tokens)
- Hardcoded hex colors (use `var(--*)` tokens)
- Inline styles (except JS-controlled dynamic values)
- Native `<select>` elements (use `.custom-dropdown`)

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (SVG only)
- [ ] `cursor: pointer` on all clickable elements
- [ ] Hover states with `--transition-base` (200ms)
- [ ] Text contrast 4.5:1 minimum (WCAG AA)
- [ ] `:focus-visible` styles on all interactive elements
- [ ] `prefers-reduced-motion` media query present
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content behind fixed topbar
- [ ] No horizontal scroll on mobile
- [ ] All `z-index` via `var(--z-*)` tokens
- [ ] All colors via `var(--*)` tokens
- [ ] Spinner: `.spinner` class only (no variants)
- [ ] Charts: read tokens via `getComputedStyle`

---

## 11. Stack Guidelines — Vanilla CSS (translated from Tailwind)

> Source: `ui-ux-pro-max` skill, 6 domain searches, 18 guidelines.  
> Adapted from `html-tailwind` stack to FM4's vanilla CSS architecture.

### 🔴 CRITICAL — Accessibility

|  #  | Guideline                                        | Do (Vanilla CSS)                                                                  | Don't                                          |
| :-: | :----------------------------------------------- | :-------------------------------------------------------------------------------- | :--------------------------------------------- |
|  1  | **Focus visible** — show focus only for keyboard | `:focus-visible { outline: 2px solid var(--accent-focus); outline-offset: 2px; }` | `:focus { outline: ... }` (fires on click too) |
|  2  | **Focus rings** — always show on inputs/buttons  | `:focus-visible { box-shadow: 0 0 0 3px rgba(56,189,248,0.3); }`                  | `outline: none` without replacement            |
|  3  | **Button loading** — disable during async        | `button[disabled] { opacity: 0.6; pointer-events: none; }` + `.spinner` inside    | Button clickable during loading                |

### 🟡 HIGH — Layout & Performance

|  #  | Guideline                               | Do (Vanilla CSS)                                         | Don't                               |
| :-: | :-------------------------------------- | :------------------------------------------------------- | :---------------------------------- |
|  4  | **Fixed elements z-index**              | `.topbar { position: fixed; z-index: var(--z-sticky); }` | `position: fixed` without z-index   |
|  5  | **Z-index scale** — use token hierarchy | `z-index: var(--z-dropdown)` / `var(--z-modal)`          | `z-index: 9999` hardcoded           |
|  6  | **Lazy loading images**                 | `<img loading="lazy" alt="...">`                         | `<img>` without `loading` attribute |
|  7  | **Responsive images**                   | `<img srcset="..." sizes="...">`                         | Same 4000px image on all devices    |
|  8  | **Responsive padding**                  | Use `@media` with `--space-*` tokens (see below)         | Same padding on all breakpoints     |

```css
/* Responsive padding pattern */
.page-card {
  padding: var(--space-sm); /* mobile-first: 8px */
}
@media (min-width: 768px) {
  .page-card {
    padding: var(--space-md);
  } /* tablet: 16px */
}
@media (min-width: 1024px) {
  .page-card {
    padding: var(--space-lg);
  } /* desktop: 24px */
}
```

### 🟢 MEDIUM — Interactions & Components

|  #  | Guideline                                | Do (Vanilla CSS)                                               | Don't                             |
| :-: | :--------------------------------------- | :------------------------------------------------------------- | :-------------------------------- |
|  9  | **Hover transitions**                    | `transition: var(--transition-base);` on all hover targets     | Instant hover changes             |
| 10  | **Card hover**                           | `.card:hover { box-shadow: var(--shadow-soft); }`              | No hover on clickable cards       |
| 11  | **Input sizing** — consistent dimensions | `height: var(--control-h); padding: 0 var(--space-sm);`        | Various heights per input         |
| 12  | **Card structure** — consistent styling  | `border-radius: var(--card-radius); padding: var(--space-lg);` | Mixed card styles                 |
| 13  | **Card spacing** — uniform internal gaps | `display: flex; flex-direction: column; gap: var(--space-md);` | Mixed `margin-bottom` per child   |
| 14  | **Grid gaps** — use `gap` not margins    | `display: grid; gap: var(--space-md);`                         | `margin-bottom` on each grid item |

```css
/* Cursor pointer global rule */
button,
a,
[role="button"],
[role="tab"],
[role="option"],
.btn,
.tab,
.pill,
.clickable,
.custom-dropdown,
summary,
label[for] {
  cursor: pointer;
}
```

### 🔵 LOW — Typography & Style

|  #  | Guideline                             | Do (Vanilla CSS)                                           | Don't                            |
| :-: | :------------------------------------ | :--------------------------------------------------------- | :------------------------------- |
| 15  | **Font size scale** — use tokens only | `font-size: var(--fs-md);`                                 | `font-size: 17px` arbitrary      |
| 16  | **Spacing scale** — use tokens        | `margin: var(--space-md);`                                 | `margin: 13px` arbitrary         |
| 17  | **Negative z-index for BG**           | Decorative backgrounds: `z-index: -1; position: absolute;` | Positive z-index for backgrounds |
| 18  | **Placeholder styling**               | `::placeholder { color: var(--text-placeholder); }`        | Dark/invisible placeholder text  |

```css
/* Placeholder global rule */
input::placeholder,
textarea::placeholder {
  color: var(--text-placeholder);
  opacity: 1;
}
```

---

## 12. Component Inventory — Estado de Implementación

> Consolidado desde `truth.md` (2026-02-21).
> Regla: Solo marcar `[x]` cuando `Select-String -Path swiss-style.css -Pattern "nombre-clase"` devuelva ≥1 resultado.

### P0 — Universales (35+ páginas)

- [x] Buttons (`.btn`) — 47 pages, 384+860 hits ✅
- [x] Topbar (`.topbar`) — 45 pages, 254+6 hits ✅
- [x] Page Shell (`.page-shell`) — 45 pages, 48+0 hits ✅
- [x] Breadcrumb (`.breadcrumb`) — 43 pages, 267 hits ✅
- [x] Toasts (`.toast`) — 40 pages, 48+336 hits ✅
- [x] Cards (`.card`) — 39 pages, 313+190 hits ✅
- [x] Dashboard Header (`.dashboard-header`) — 36 pages ✅
- [x] Dropdown Menu (`.dropdown-menu`) — 34 pages ✅

### P1 — Alto uso (13-29 páginas)

- [ ] Staff Dashboard (`.staff-dashboard`) — 29 pages ⭐ NEW
- [ ] Input/Forms (`.input`, `.form-group`) — 27 pages ⭐ NEW
- [ ] State Blocks (`.state-block`, `.state-loader`) — 20 pages ⭐ NEW
- [ ] Modals (`.modal`) — 17 pages, ⚠️ Alto riesgo (458 JS hits)
- [ ] Spinner (`.spinner`) — 15 pages
- [ ] Slide Panel (`.slide-panel`) — 14 pages ⭐ NEW
- [ ] Tabs (`.tab-bar`, `.tab-chip`) — 13 pages ⭐ NEW
- [ ] Table cells (`.table-cell`) — 11 pages ⭐ NEW
- [ ] Pill Group (`.pill-group`) — 11 pages ⭐ NEW
- [ ] Checkbox (`.checkbox`) — 10 pages

### P2 — Especializados (2-9 páginas)

- [ ] Workday Status (`.workday-status`) — 9 pages ⭐ NEW
- [ ] Actions Bar (`.actions-bar`) — 8 pages ⭐ NEW
- [ ] KPI (`.kpi-value`) — 5 pages
- [ ] Summary Metrics (`.summary-metric`) — 4 pages ⭐ NEW
- [ ] Progress Bar (`.progress-bar`) — 4 pages
- [ ] Tables (`.data-table`) — 3 pages
- [ ] Chart KPI (`.chart-kpi`) — 3 pages ⭐ NEW
- [ ] Badge (`.badge`) — 3 pages ⭐ NEW
- [ ] Tooltips (`.tooltip`) — 2 pages
- [ ] Custom Dropdown (`.custom-dropdown`) — 2 pages
- [ ] Avatar (`.avatar`) — 2 pages ⭐ NEW
- [ ] Skeleton (`.skeleton`) — 2 pages ⭐ NEW

### P3 — Uso mínimo (1 página)

- [ ] Toggle Switch (`.toggle-switch`) — admin-workdays
- [ ] Anomaly Alerts (`.anomaly-alert`) — admin-workdays
- [ ] Status Dots (`.status-dot`) — operativo-index

|   Tier    | Componentes | Páginas cubiertas |
| :-------: | :---------: | :---------------: |
|    P0     |      8      |       34-47       |
|    P1     |     10      |       10-29       |
|    P2     |     12      |        2-9        |
|    P3     |      3      |         1         |
| **Total** |   **33**    |         —         |
