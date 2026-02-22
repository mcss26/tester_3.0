# Design System Master â€” FormulaMid 4

> **LOGIC:** When building a specific page, first check `design-system/formulamid-4/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** FormulaMid 4  
**Category:** Nightclub / Hospitality ERP â€” Admin Dashboard  
**Style:** Dark Mode (OLED Pure Black)  
**Stack:** Vanilla CSS (tokens.css â†’ components.css â†’ page.css)  
**Generated:** 2026-02-17 | **Updated:** 2026-02-22 (95 tokens added from tokens.css audit)

---

## 1. Color Palette (from `tokens.css`)

### Primitives (Zinc Scale)

| Token            | Hex       | Usage              |
| :--------------- | :-------- | :----------------- |
| `--neutral-0`    | `#000000` | Pure black base    |
| `--neutral-50`   | `#050505` | Near-black surface |
| `--neutral-100`  | `#0a0a0a` | Dark surface       |
| `--neutral-150`  | `#111111` | Surface hover      |
| `--neutral-200`  | `#18181b` | Elevated surfaces  |
| `--neutral-300`  | `#27272a` | Heavy borders      |
| `--neutral-400`  | `#3f3f46` | Disabled elements  |
| `--neutral-500`  | `#52525b` | Mid-tone borders   |
| `--neutral-600`  | `#71717a` | Placeholder text   |
| `--neutral-700`  | `#a1a1aa` | Tertiary text      |
| `--neutral-800`  | `#d4d4d8` | Secondary text     |
| `--neutral-900`  | `#e4e4e7` | Near-white text    |
| `--neutral-950`  | `#f4f4f5` | Off-white surface  |
| `--neutral-1000` | `#ffffff` | Primary text / CTA |

### Semantic Colors

| Role              | Variable            | Value                  | Notes                     |
| :---------------- | :------------------ | :--------------------- | :------------------------ |
| **Brand/CTA**     | `--brand-primary`   | `#ffffff`              | White â€” confirmed by user |
| **Success**       | `--success`         | `#4ade80`              | Green-400                 |
| **Warning**       | `--warning`         | `#fbbf24`              | Yellow-400                |
| **Danger**        | `--danger`          | `#f87171`              | Red-400                   |
| **Info**          | `--info`            | `#60a5fa`              | Blue-400                  |
| **Focus Ring**    | `--accent-focus`    | `#38bdf8`              | Sky-400 for a11y          |
| **Brand Gold**    | `--brand-gold`      | `#d4c5a0`              | Midnight Club accent      |
| **Gold Dark**     | `--brand-gold-dark` | `#c9a96e`              | Darker gold variant       |
| **Primary**       | `--primary`         | `var(--brand-primary)` | Alias for brand           |
| **Primary Hover** | `--primary-hover`   | `var(--neutral-900)`   | Hover state               |
| **Primary Light** | `--primary-light`   | `var(--neutral-950)`   | Light variant             |
| **Accent**        | `--accent`          | `var(--neutral-1000)`  | Generic accent            |
| **Error**         | `--error`           | alias of `--danger`    | Semantic alias            |

### Status Backgrounds (10% opacity)

| Variable              | Value                      | Usage              |
| :-------------------- | :------------------------- | :----------------- |
| `--accent-success-bg` | `rgba(74, 222, 128, 0.1)`  | Success background |
| `--accent-warning-bg` | `rgba(251, 191, 36, 0.1)`  | Warning background |
| `--accent-error-bg`   | `rgba(248, 113, 113, 0.1)` | Error background   |
| `--accent-info-bg`    | `rgba(56, 189, 248, 0.1)`  | Info background    |
| `--success-bg`        | alias of above             | Legacy alias       |
| `--warning-bg`        | alias of above             | Legacy alias       |
| `--danger-bg`         | alias of above             | Legacy alias       |
| `--info-bg`           | alias of above             | Legacy alias       |

### Palette Colors (Named)

| Variable       | Value     | Usage        |
| :------------- | :-------- | :----------- |
| `--sky-400`    | `#38bdf8` | Focus/Info   |
| `--blue-400`   | `#60a5fa` | Info variant |
| `--blue-500`   | `#3b82f6` | Links        |
| `--red-400`    | `#f87171` | Danger       |
| `--red-500`    | `#ff453a` | Error (iOS)  |
| `--red-600`    | `#ff3b30` | Critical     |
| `--green-400`  | `#4ade80` | Success      |
| `--green-500`  | `#22c55e` | Active       |
| `--orange-400` | `#fb923c` | Warning alt  |
| `--orange-500` | `#f59e0b` | Caution      |
| `--yellow-400` | `#fbbf24` | Warning      |
| `--purple-400` | `#c084fc` | Chart accent |
| `--purple-500` | `#a855f7` | Chart accent |

### Backgrounds

| Variable             | Value                   | Usage             |
| :------------------- | :---------------------- | :---------------- |
| `--bg-body`          | `#000000`               | Page background   |
| `--bg-base`          | `var(--bg-body)`        | Alias             |
| `--bg-surface`       | `#0a0a0a`               | Card base         |
| `--bg-surface-hover` | `#111111`               | Interactive hover |
| `--bg-elevated`      | `#18181b`               | Raised containers |
| `--bg-elev`          | `var(--bg-elevated)`    | Short alias       |
| `--bg-tertiary`      | `var(--neutral-300)`    | Tertiary bg       |
| `--bg-card`          | alias of `--bg-surface` | Card alias        |
| `--bg-input`         | alias of `--bg-surface` | Input alias       |
| `--backdrop`         | `rgba(0,0,0,0.6)`       | Modal overlay     |

### Alpha Transparencies (Glass & Borders)

| Variable           | Value                    | Usage             |
| :----------------- | :----------------------- | :---------------- |
| `--white-alpha-05` | `rgba(255,255,255,0.05)` | Subtle surfaces   |
| `--white-alpha-10` | `rgba(255,255,255,0.10)` | Hover states      |
| `--white-alpha-15` | `rgba(255,255,255,0.15)` | Borders (Subtle)  |
| `--white-alpha-20` | `rgba(255,255,255,0.20)` | Borders (Visible) |
| `--white-alpha-30` | `rgba(255,255,255,0.30)` | Prominent borders |
| `--white-alpha-50` | `rgba(255,255,255,0.50)` | Dividers          |
| `--white-alpha-70` | `rgba(255,255,255,0.70)` | Text overlays     |
| `--black-alpha-20` | `rgba(0,0,0,0.20)`       | Light shadow      |
| `--black-alpha-40` | `rgba(0,0,0,0.40)`       | Medium shadow     |
| `--black-alpha-60` | `rgba(0,0,0,0.60)`       | Heavy overlay     |

### Semantic Surface & Text Aliases

| Variable             | Maps To                 | Usage                |
| :------------------- | :---------------------- | :------------------- |
| `--surface-1`        | `var(--white-alpha-05)` | Level 1 surface      |
| `--surface-2`        | `var(--white-alpha-10)` | Level 2 surface      |
| `--surface-3`        | alias                   | Level 3 surface      |
| `--surface-card`     | alias                   | Card surface         |
| `--surface-hover`    | alias                   | Hover surface        |
| `--text-1`           | `var(--text-primary)`   | Primary text alias   |
| `--text-2`           | `var(--text-secondary)` | Secondary alias      |
| `--text-3`           | `var(--text-tertiary)`  | Tertiary alias       |
| `--text-inverse`     | inverse color           | On-dark text         |
| `--text-muted`       | muted color             | De-emphasized text   |
| `--text-sm`          | `var(--fs-sm)`          | Small text size      |
| `--border`           | generic border          | Generic border       |
| `--border-1`         | `var(--border-subtle)`  | Subtle border alias  |
| `--border-2`         | `var(--border-active)`  | Active border alias  |
| `--border-color`     | generic                 | Border color prop    |
| `--border-default`   | `var(--neutral-400)`    | Default border       |
| `--border-active`    | `var(--white-alpha-20)` | Active border        |
| `--border-highlight` | `var(--white-alpha-30)` | Highlight            |
| `--accent-rgb`       | RGB value of accent     | For rgba() usage     |
| `--accent-color`     | alias                   | Generic accent color |

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
| `--fs-4xl`  | `64px` | Display (rare)       |

### Line Heights

| Token          | Value | Usage          |
| :------------- | :---- | :------------- |
| `--lh-tight`   | `1.1` | Headings       |
| `--lh-normal`  | `1.4` | Body text      |
| `--lh-relaxed` | `1.5` | Readable prose |

### Weights

| Token           | Value | Guideline                                  |
| :-------------- | :---- | :----------------------------------------- |
| `--fw-normal`   | `400` | Body text                                  |
| `--fw-medium`   | `500` | Labels, nav items                          |
| `--fw-semibold` | `600` | Subheadings, buttons â€” **prefer over 700** |
| `--fw-bold`     | `700` | Page titles only                           |

> [!WARNING]
> Fonts have been flagged as too heavy/large in some areas. Prefer `--fw-semibold` (600) over `--fw-bold` (700) except for main page titles.

---

## 3. Spacing & Geometry

| Token          | Value             | Usage             |
| :------------- | :---------------- | :---------------- |
| `--space-unit` | `4px`             | Base unit         |
| `--space-xs`   | `4px`             | Tight gaps        |
| `--space-1`    | `var(--space-xs)` | Alias             |
| `--space-sm`   | `8px`             | Icon gaps, inline |
| `--space-2`    | `var(--space-sm)` | Alias             |
| `--space-3`    | `12px`            | Medium gaps       |
| `--space-md`   | `16px`            | Standard padding  |
| `--space-4`    | `var(--space-md)` | Alias             |
| `--space-5`    | `20px`            | Mid-large gaps    |
| `--space-lg`   | `24px`            | Section padding   |
| `--space-6`    | `var(--space-lg)` | Alias             |
| `--space-xl`   | `32px`            | Large gaps        |
| `--space-8`    | `var(--space-xl)` | Alias             |
| `--space-12`   | `48px`            | Extra large       |
| `--space-16`   | `64px`            | Maximum gaps      |

### Border Radius

| Token             | Value    | Usage               |
| :---------------- | :------- | :------------------ |
| `--radius-sm`     | `4px`    | Pills, badges       |
| `--radius-md`     | `6px`    | Inputs, small cards |
| `--radius-button` | `8px`    | Buttons             |
| `--radius-lg`     | `10px`   | Cards               |
| `--radius-xl`     | `12px`   | Modals              |
| `--radius-full`   | `9999px` | Circles             |
| `--radius-2xl`    | `16px`   | Large panels        |

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
> **Always use `var(--z-*)` tokens.** Never hardcode `z-index` values in component or page CSS. Current `components.css` has hardcoded values â€” standardize them.

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
| `--shadow-xs`   | `0 1px 2px rgba(0,0,0,0.3)`   |
| `--shadow-sm`   | `0 1px 3px rgba(0,0,0,0.3)`   |
| `--shadow-md`   | `0 4px 8px rgba(0,0,0,0.3)`   |
| `--shadow-soft` | `0 4px 12px rgba(0,0,0,0.25)` |
| `--shadow-xl`   | `0 8px 24px rgba(0,0,0,0.4)`  |
| `--shadow-lg`   | `0 16px 48px rgba(0,0,0,0.4)` |

---

## 7. Layout Tokens

| Token               | Value                          |
| :------------------ | :----------------------------- |
| `--topbar-height`   | `64px`                         |
| `--topbar-h`        | `var(--topbar-height)` â€” alias |
| `--topbar-h-mobile` | mobile-specific height         |
| `--header-height`   | `64px`                         |
| `--sidebar-width`   | `260px`                        |
| `--page-max`        | max page width                 |
| `--page-pad`        | page padding                   |
| `--shell-px`        | shell horizontal padding       |
| `--container-width` | container max-width            |
| `--control-h`       | `36px`                         |
| `--control-h-sm`    | `28px`                         |
| `--control-h-lg`    | `44px` (touch-target minimum)  |
| `--ease-out`        | easing function                |
| `--grid-color`      | grid line color                |

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
  --chart-text: var(--text-tertiary);
  --chart-border: var(--white-alpha-08);
  --chart-font: var(--font-mono);
  --chart-line-1: var(--text-primary);
  --chart-line-2: var(--success);
  --chart-line-3: var(--danger);
  --chart-line-4: var(--info);
  --chart-point-bg: var(--bg-surface);
  --chart-point-border: var(--text-primary);
  --chart-fill: var(--white-alpha-05);
}
```

---

## 8b. Component Tokens

| Token                 | Value                    | Usage               |
| :-------------------- | :----------------------- | :------------------ |
| `--btn-primary-bg`    | `var(--brand-primary)`   | Primary button bg   |
| `--btn-primary-text`  | `var(--neutral-0)`       | Primary button text |
| `--btn-radius`        | `var(--radius-md)`       | Button radius       |
| `--card-bg`           | `var(--bg-surface)`      | Card background     |
| `--card-border`       | `var(--border-subtle)`   | Card border         |
| `--card-shadow`       | `var(--shadow-sm)`       | Card shadow         |
| `--card-shadow-hover` | `var(--shadow-md)`       | Card hover shadow   |
| `--modal-shadow`      | `var(--shadow-xl)`       | Modal shadow        |
| `--dropdown-shadow`   | `var(--shadow-lg)`       | Dropdown shadow     |
| `--input-bg`          | `var(--bg-surface)`      | Input background    |
| `--input-border`      | `var(--border-subtle)`   | Input border        |
| `--input-radius`      | `var(--radius-md)`       | Input radius        |
| `--input-font`        | `var(--font-sans)`       | Input font          |
| `--input-fs`          | `var(--fs-base)`         | Input font size     |
| `--input-lh`          | `var(--lh-normal)`       | Input line height   |
| `--input-h`           | `var(--control-h)`       | Input height        |
| `--danger-color`      | color for danger context | Danger text         |
| `--accent-error`      | alias                    | Error accent        |
| `--accent-success`    | alias                    | Success accent      |
| `--accent-warning`    | alias                    | Warning accent      |

---

## 8c. Print Tokens (QR / Receipts)

| Token        | Value   | Usage               |
| :----------- | :------ | :------------------ |
| `--paper-mm` | `80mm`  | Receipt paper width |
| `--pad-mm`   | `4mm`   | Print padding       |
| `--qr-mm`    | `35mm`  | QR code size        |
| `--gap-mm`   | `6mm`   | Print gap           |
| `--font-mm`  | `3.2mm` | Print font size     |

> Charts now standardized in `design-system-visual.html` (section 13). Config: `borderWidth: 1â€“1.2`, `tension: 0.3â€“0.4`, grid `rgba(255,255,255,0.04)`, axis labels via `--font-mono` at 11px. All Chart.js defaults read from tokens via `getComputedStyle`.

---

## 9. Page Architecture Pattern

```text
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

> Reference: `docs/80-ephemeral/agent-logs/frontend/design-system-visual.html` â€” sections 04-14.

### Buttons

Text-only buttons with `â€¹ â€º` bracket decorators. No backgrounds, no borders, no filling.

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
  content: "â€¹";
  opacity: 0.25;
}
.btn::after {
  content: "â€º";
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

Pure dots with glow â€” no pill containers, no text inside the badge.

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

- **Loading:** `$ fetching recordsâ–ˆ` (blinking cursor via `.skeleton` pulse)
- **Empty:** `$ query --filter=all` â†’ `0 results returned`
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

Legend: Custom HTML dots (6Ã—6px circles) with mono text. No Chart.js built-in legend.

---

## Anti-Patterns (FORBIDDEN)

- Light mode default
- Emojis as icons â€” use SVG (Heroicons/Lucide) **ONLY**
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

## 11. Stack Guidelines â€” Vanilla CSS (translated from Tailwind)

> Source: `ui-ux-pro-max` skill, 6 domain searches, 18 guidelines.  
> Adapted from `html-tailwind` stack to FM4's vanilla CSS architecture.

### ðŸ”´ CRITICAL â€” Accessibility

|  #  | Guideline                                        | Do (Vanilla CSS)                                                                  | Don't                                          |
| :-: | :----------------------------------------------- | :-------------------------------------------------------------------------------- | :--------------------------------------------- |
|  1  | **Focus visible** â€” show focus only for keyboard | `:focus-visible { outline: 2px solid var(--accent-focus); outline-offset: 2px; }` | `:focus { outline: ... }` (fires on click too) |
|  2  | **Focus rings** â€” always show on inputs/buttons  | `:focus-visible { box-shadow: 0 0 0 3px rgba(56,189,248,0.3); }`                  | `outline: none` without replacement            |
|  3  | **Button loading** â€” disable during async        | `button[disabled] { opacity: 0.6; pointer-events: none; }` + `.spinner` inside    | Button clickable during loading                |

### ðŸŸ¡ HIGH â€” Layout & Performance

|  #  | Guideline                               | Do (Vanilla CSS)                                         | Don't                               |
| :-: | :-------------------------------------- | :------------------------------------------------------- | :---------------------------------- |
|  4  | **Fixed elements z-index**              | `.topbar { position: fixed; z-index: var(--z-sticky); }` | `position: fixed` without z-index   |
|  5  | **Z-index scale** â€” use token hierarchy | `z-index: var(--z-dropdown)` / `var(--z-modal)`          | `z-index: 9999` hardcoded           |
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

### ðŸŸ¢ MEDIUM â€” Interactions & Components

|  #  | Guideline                                | Do (Vanilla CSS)                                               | Don't                             |
| :-: | :--------------------------------------- | :------------------------------------------------------------- | :-------------------------------- |
|  9  | **Hover transitions**                    | `transition: var(--transition-base);` on all hover targets     | Instant hover changes             |
| 10  | **Card hover**                           | `.card:hover { box-shadow: var(--shadow-soft); }`              | No hover on clickable cards       |
| 11  | **Input sizing** â€” consistent dimensions | `height: var(--control-h); padding: 0 var(--space-sm);`        | Various heights per input         |
| 12  | **Card structure** â€” consistent styling  | `border-radius: var(--card-radius); padding: var(--space-lg);` | Mixed card styles                 |
| 13  | **Card spacing** â€” uniform internal gaps | `display: flex; flex-direction: column; gap: var(--space-md);` | Mixed `margin-bottom` per child   |
| 14  | **Grid gaps** â€” use `gap` not margins    | `display: grid; gap: var(--space-md);`                         | `margin-bottom` on each grid item |

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

### ðŸ”µ LOW â€” Typography & Style

|  #  | Guideline                             | Do (Vanilla CSS)                                           | Don't                            |
| :-: | :------------------------------------ | :--------------------------------------------------------- | :------------------------------- |
| 15  | **Font size scale** â€” use tokens only | `font-size: var(--fs-md);`                                 | `font-size: 17px` arbitrary      |
| 16  | **Spacing scale** â€” use tokens        | `margin: var(--space-md);`                                 | `margin: 13px` arbitrary         |
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

## 12. Component Inventory â€” Estado de ImplementaciÃ³n

> Consolidado desde `truth.md` (2026-02-21).
> Regla: Solo marcar `[x]` cuando `Select-String -Path swiss-style.css -Pattern "nombre-clase"` devuelva â‰¥1 resultado.

### P0 â€” Universales (35+ pÃ¡ginas)

- [x] Buttons (`.btn`) â€” 47 pages, 384+860 hits âœ…
- [x] Topbar (`.topbar`) â€” 45 pages, 254+6 hits âœ…
- [x] Page Shell (`.page-shell`) â€” 45 pages, 48+0 hits âœ…
- [x] Breadcrumb (`.breadcrumb`) â€” 43 pages, 267 hits âœ…
- [x] Toasts (`.toast`) â€” 40 pages, 48+336 hits âœ…
- [x] Cards (`.card`) â€” 39 pages, 313+190 hits âœ…
- [x] Dashboard Header (`.dashboard-header`) â€” 36 pages âœ…
- [x] Dropdown Menu (`.dropdown-menu`) â€” 34 pages âœ…

### P1 â€” Alto uso (13-29 pÃ¡ginas)

- [ ] Staff Dashboard (`.staff-dashboard`) â€” 29 pages â­ NEW
- [ ] Input/Forms (`.input`, `.form-group`) â€” 27 pages â­ NEW
- [ ] State Blocks (`.state-block`, `.state-loader`) â€” 20 pages â­ NEW
- [ ] Modals (`.modal`) â€” 17 pages, âš ï¸ Alto riesgo (458 JS hits)
- [ ] Spinner (`.spinner`) â€” 15 pages
- [ ] Slide Panel (`.slide-panel`) â€” 14 pages â­ NEW
- [ ] Tabs (`.tab-bar`, `.tab-chip`) â€” 13 pages â­ NEW
- [ ] Table cells (`.table-cell`) â€” 11 pages â­ NEW
- [ ] Pill Group (`.pill-group`) â€” 11 pages â­ NEW
- [ ] Checkbox (`.checkbox`) â€” 10 pages

### P2 â€” Especializados (2-9 pÃ¡ginas)

- [ ] Workday Status (`.workday-status`) â€” 9 pages â­ NEW
- [ ] Actions Bar (`.actions-bar`) â€” 8 pages â­ NEW
- [ ] KPI (`.kpi-value`) â€” 5 pages
- [ ] Summary Metrics (`.summary-metric`) â€” 4 pages â­ NEW
- [ ] Progress Bar (`.progress-bar`) â€” 4 pages
- [ ] Tables (`.data-table`) â€” 3 pages
- [ ] Chart KPI (`.chart-kpi`) â€” 3 pages â­ NEW
- [ ] Badge (`.badge`) â€” 3 pages â­ NEW
- [ ] Tooltips (`.tooltip`) â€” 2 pages
- [ ] Custom Dropdown (`.custom-dropdown`) â€” 2 pages
- [ ] Avatar (`.avatar`) â€” 2 pages â­ NEW
- [ ] Skeleton (`.skeleton`) â€” 2 pages â­ NEW

### P3 â€” Uso mÃ­nimo (1 pÃ¡gina)

- [ ] Toggle Switch (`.toggle-switch`) â€” admin-workdays
- [ ] Anomaly Alerts (`.anomaly-alert`) â€” admin-workdays
- [ ] Status Dots (`.status-dot`) â€” operativo-index

|   Tier    | Componentes | PÃ¡ginas cubiertas |
| :-------: | :---------: | :---------------: |
|    P0     |      8      |       34-47       |
|    P1     |     10      |       10-29       |
|    P2     |     12      |        2-9        |
|    P3     |      3      |         1         |
| **Total** |   **33**    |         â€”         |

---

## 11. State Management Patterns

## Pattern: Module-Scoped State Object

Every module uses a single `state` object declared at the top of its IIFE:

```javascript
(async function () {
    'use strict';
    
    const state = {
        items: [],
        currentTab: 'DEFAULT',
        isLoading: false
    };
    
    // All functions read/write state.xxx
})();
```

## Tab State Persistence

Use `window.NavState` to remember the user's active tab:

```javascript
const PAGE_KEY = 'admin-pagos';
const saved = window.NavState?.restore(PAGE_KEY) ?? {};

const state = {
    currentTab: saved.currentTab || 'DASHBOARD'
};

function switchTab(name) {
    state.currentTab = name;
    window.NavState?.save(PAGE_KEY, { currentTab: name });
}
```

## UI References (DOM Cache)

Cache all `getElementById` / `querySelector` calls in a `ui` object:

```javascript
const ui = {
    table: document.querySelector('#myTable tbody'),
    modal: document.getElementById('myModal'),
    btnSave: document.getElementById('btnSave')
};
```

> **Rule**: Never call `document.getElementById` inside loops or render functions.

## Data Flow

```
Supabase â†’ state.items â†’ renderTable(state.items) â†’ DOM
                 â†‘
           user action â†’ mutation â†’ Supabase â†’ reload
```

## Chart.js Instances

Always destroy before re-creating:

```javascript
if (state.chartInstance) state.chartInstance.destroy();
state.chartInstance = new Chart(ctx, config);
```

## Error Handling

Use `try/catch` with `window.Toast`:

```javascript
try {
    const { data, error } = await window.sb.from('table').select('*');
    if (error) throw error;
    // render
} catch (err) {
    console.error('[module]', err);
    window.Toast?.error('Error: ' + err.message);
}
```


---

## 12. Token Migration Registry

> **Generado:** 2026-02-21  
> **DecisiÃ³n:** SemÃ¡ntico gana. Aliases numÃ©ricos y shorthand se mantienen como retrocompat.

## Estado del Sistema

### Spacing: SemÃ¡ntico (canonical) + NumÃ©rico (alias)

| Canonical    | Value | Alias        | Alias Refs | Migrar cuando |
| :----------- | ----: | :----------- | ---------: | :------------ |
| `--space-xs` |   4px | `--space-1`  |          3 | Low priority  |
| `--space-sm` |   8px | `--space-2`  |         11 | Low priority  |
| `--space-3`  |  12px | â€”            |          â€” | N/A (Ãºnico)   |
| `--space-md` |  16px | `--space-4`  |         14 | Medium        |
| â€”            |  20px | `--space-5`  |          1 | Can remove    |
| `--space-lg` |  24px | `--space-6`  |          6 | Low           |
| `--space-xl` |  32px | `--space-8`  |          4 | Low           |
| â€”            |  48px | `--space-12` |          1 | Can remove    |
| â€”            |  64px | `--space-16` |          2 | Low           |

### Shorthand Aliases

| Canonical          | Canonical Refs | Alias           | Alias Refs | Priority       |
| :----------------- | -------------: | :-------------- | ---------: | :------------- |
| `--text-primary`   |            124 | `--text-1`      |         61 | High (bulk)    |
| `--text-tertiary`  |             89 | `--text-3`      |         34 | High           |
| `--border-subtle`  |             84 | `--border-1`    |         86 | High (biggest) |
| `--text-secondary` |             67 | `--text-2`      |         42 | High           |
| `--white-alpha-05` |              â€” | `--surface-1`   |         24 | Medium         |
| `--border-active`  |             16 | `--border-2`    |         21 | Medium         |
| `--bg-elevated`    |             19 | `--bg-elev`     |         18 | Medium         |
| `--white-alpha-10` |              â€” | `--surface-2`   |         17 | Medium         |
| `--topbar-height`  |             10 | `--topbar-h`    |          6 | Low            |
| `--fs-sm`          |              â€” | `--text-sm`     |          7 | Low            |
| `--bg-body`        |             15 | `--bg-base`     |          6 | Low            |
| `--neutral-300`    |              â€” | `--bg-tertiary` |          3 | Low            |

## Script de MigraciÃ³n

Para migrar un alias al canÃ³nico:

```powershell
# Example: migrate --text-1 â†’ --text-primary
$files = Get-ChildItem -Recurse assets\css\*.css
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  if ($content -match '--text-1[^0-9]') {
    $content = $content -replace '--text-1(?=[^0-9a-z-])', '--text-primary'
    Set-Content $f.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Updated: $($f.Name)"
  }
}
```

## Regla para CÃ³digo Nuevo

- âœ… Usar nombres **canÃ³nicos** (`--space-md`, `--text-primary`, `--border-subtle`)
- âŒ No usar aliases (`--space-4`, `--text-1`, `--border-1`) en cÃ³digo nuevo
- Los aliases se mantendrÃ¡n hasta que se haga un batch migration
