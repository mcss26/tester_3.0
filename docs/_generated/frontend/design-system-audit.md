# Design System Audit Report

> **Generated**: 2026-02-18T23:24 (ART)
> **Skill**: `design-system-architect` v1.0.0 — Steps 1 & 2
> **Scope**: `tokens.css` · `swiss-style.css` · `design-system-visual.html`
> **Rule compliance**: `.gemini/design-system.md` — **no CSS files were modified**

---

## Executive Summary

| Category                                       |  Items  | Critical | Warning | Pass  |
| :--------------------------------------------- | :-----: | :------: | :-----: | :---: |
| Token conflicts (tokens.css ↔ swiss-style.css) |    9    |    3     |    6    |   0   |
| Token conflicts (tokens.css ↔ visual.html)     |   12    |    3     |    9    |   0   |
| Component coverage gaps                        |    6    |    0     |    6    |   0   |
| WCAG AA violations                             |    3    |    1     |    2    |   0   |
| Hardcoded hex (outside `:root`)                |   128   |    21    |   107   |   0   |
| Structural issues                              |    5    |    1     |    4    |   0   |
| **Total divergences**                          | **163** |  **29**  | **134** | **—** |

---

## 1. Token Conflict Resolution — `tokens.css` ↔ `swiss-style.css`

Per the source-of-truth hierarchy (R2), `tokens.css` wins unless the user explicitly overrides. The user has made **3 explicit decisions** where `swiss-style.css` wins.

|  #  | Token              | `tokens.css`                                                               | `swiss-style.css`                               | Resolution                       | Authority                      |
| :-: | :----------------- | :------------------------------------------------------------------------- | :---------------------------------------------- | :------------------------------- | :----------------------------- |
|  1  | `--bg-body`        | `#000000`                                                                  | `#050505`                                       | ✅ `#000000`                     | tokens.css wins                |
|  2  | `--bg-surface`     | `#000000`                                                                  | `#0a0a0a`                                       | ⚡ `#0a0a0a`                     | **USER DECISION** — swiss wins |
|  3  | `--bg-elevated`    | `var(--neutral-200)` → `#18181b`                                           | `#111111`                                       | ✅ `#18181b`                     | tokens.css wins                |
|  4  | `--border-subtle`  | `var(--white-alpha-10)` → `rgba(255,255,255,0.10)`                         | `#27272a`                                       | ✅ `rgba(255,255,255,0.10)`      | tokens.css wins                |
|  5  | `--text-secondary` | `var(--neutral-800)` → `#d4d4d8`                                           | `#a1a1aa`                                       | ⚡ `#a1a1aa`                     | **USER DECISION** — swiss wins |
|  6  | `--text-tertiary`  | `var(--neutral-700)` → `#a1a1aa`                                           | `#52525b`                                       | ✅ `#a1a1aa`                     | tokens.css wins                |
|  7  | `--topbar-height`  | `56px`                                                                     | `60px`                                          | ✅ `56px`                        | tokens.css wins                |
|  8  | `--font-sans`      | `"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif` | `'Inter', system-ui, -apple-system, sans-serif` | ✅ tokens.css value              | tokens.css wins                |
|  9  | `--font-mono`      | `"SFMono-Regular", Menlo, Monaco, Consolas, monospace`                     | `'JetBrains Mono', monospace`                   | ⚡ `'JetBrains Mono', monospace` | **USER DECISION** — swiss wins |

### Action Required

When tokens.css is updated (with user approval, per R1), apply these resolved values:

1. **`--bg-surface`** → change in `tokens.css` from `#000000` to `#0a0a0a`
2. **`--text-secondary`** → change in `tokens.css` from `var(--neutral-800)` (`#d4d4d8`) to `#a1a1aa`
3. **`--font-mono`** → change in `tokens.css` from SFMono stack to `'JetBrains Mono', monospace`
4. **`swiss-style.css`** → update `--bg-body` to `#000000`, `--bg-elevated` to `var(--neutral-200)`, `--border-subtle` to `var(--white-alpha-10)`, `--topbar-height` to `56px`, `--font-sans` to tokens.css value, `--text-tertiary` to `var(--neutral-700)`

---

## 2. Token Conflicts — `tokens.css` ↔ `design-system-visual.html`

The visual HTML re-declares tokens inline in its `<style>:root` block. Several values diverge from both `tokens.css` AND the resolved tokens above.

|  #  | Token              | `tokens.css` (resolved)           | `visual.html` `:root`    | Status                                                     |
| :-: | :----------------- | :-------------------------------- | :----------------------- | :--------------------------------------------------------- |
|  1  | `--bg-surface`     | `#0a0a0a` (user decision)         | `#0a0a0a`                | ✅ Match                                                   |
|  2  | `--bg-elevated`    | `#18181b`                         | `#111111`                | ❌ **Diverges** — uses swiss-style value                   |
|  3  | `--border-subtle`  | `rgba(255,255,255,0.10)`          | `rgba(255,255,255,0.06)` | ❌ **Diverges** — unique value, neither file               |
|  4  | `--border-default` | _(not in tokens.css)_             | `rgba(255,255,255,0.12)` | ⚠️ Swiss defines as `#3f3f46`                              |
|  5  | `--border-strong`  | _(not in tokens.css)_             | `rgba(255,255,255,0.20)` | ⚠️ Not canonical — possible alias for `--border-highlight` |
|  6  | `--text-primary`   | `var(--neutral-1000)` → `#ffffff` | `#f4f4f5`                | ❌ **Diverges** — uses `--neutral-950` value instead       |
|  7  | `--text-secondary` | `#a1a1aa` (user decision)         | `#a1a1aa`                | ✅ Match                                                   |
|  8  | `--text-muted`     | _(not in tokens.css)_             | `#3f3f46`                | ⚠️ Non-canonical token — maps to `--neutral-400`           |
|  9  | `--brand-primary`  | `var(--neutral-1000)` → `#ffffff` | `#f4f4f5`                | ❌ **Diverges** — same as text-primary issue               |
| 10  | `--brand-gold`     | `#e4d2a8`                         | `#d4c5a0`                | ❌ **Diverges** — unique value in HTML                     |
| 11  | `--topbar-h`       | `var(--topbar-height)` → `56px`   | `64px`                   | ❌ **Diverges** — 64px instead of 56px                     |
| 12  | `--sidebar-w`      | `--sidebar-width: 240px`          | `260px`                  | ❌ **Diverges** — 260px instead of 240px                   |

### Additional tokens in `visual.html` not present in `tokens.css`

| Token               | Value in HTML            | Status                             |
| :------------------ | :----------------------- | :--------------------------------- |
| `--bg-hover`        | `rgba(255,255,255,0.03)` | ⚠️ Non-canonical                   |
| `--border-focus`    | `#38bdf8`                | ⚠️ Duplicate of `--accent-focus`   |
| `--brand-gold-glow` | `rgba(212,197,160,0.12)` | ⚠️ Non-canonical                   |
| `--space-24`        | `96px`                   | ⚠️ Not in tokens.css spacing scale |
| `--max-w`           | `1440px`                 | ⚠️ Not in tokens.css               |

---

## 3. Component Coverage Audit

### 3.1 Components in `swiss-style.css` → Showcase in `visual.html`

| Component Class                                                        | In `swiss-style.css` | In `visual.html` | Status                                                      |
| :--------------------------------------------------------------------- | :------------------: | :--------------: | :---------------------------------------------------------- |
| `.btn-primary`                                                         |          ✅          |        ✅        | ✅ Present                                                  |
| `.btn-secondary`                                                       |          ✅          |        ✅        | ✅ Present                                                  |
| `.btn-ghost`                                                           |          ✅          |        ✅        | ✅ Present                                                  |
| `.btn-danger`                                                          |          ✅          |        ✅        | ✅ Present                                                  |
| `.btn-gold`                                                            |          ✅          |        ✅        | ✅ Present                                                  |
| `.btn-sm`                                                              |          ✅          |        ✅        | ✅ Present                                                  |
| `.btn-icon`                                                            |          ✅          |        ✅        | ✅ Present                                                  |
| `.btn-icon-flat`                                                       |          ✅          |        ❌        | ⚠️ **Missing showcase**                                     |
| `.btn:disabled`                                                        |          ✅          |        ❌        | ⚠️ **Missing showcase**                                     |
| `.input` / `.input-group` / `.input-label`                             |          ✅          |        ✅        | ✅ Present                                                  |
| `select.input`                                                         |          ✅          |        ✅        | ✅ Present                                                  |
| `.card` / `.card-header` / `.card-title`                               |          ✅          |        ✅        | ✅ Present                                                  |
| `.table-wrap` / `.table`                                               |          ✅          |        ✅        | ✅ Present                                                  |
| `.tab-wrap` / `.tab-item`                                              |          ✅          |        ✅        | ✅ Present                                                  |
| `.badge` / `.badge-dot`                                                |          ✅          |        ❌        | ⚠️ **Missing showcase**                                     |
| `.badge-success` / `.badge-warning` / `.badge-secondary`               |          ✅          |        ❌        | ⚠️ **Missing showcase**                                     |
| `.dashboard-grid`                                                      |          ✅          |        ❌        | ⚠️ **Missing showcase**                                     |
| `.topbar` / `.brand` / `.nav-menu` / `.nav-item`                       |          ✅          |        ✅        | ✅ Present (live)                                           |
| `.wrapper`                                                             |          ✅          |        ✅        | ✅ Present (live)                                           |
| `.ds-section` / `.section-header` / `.section-title` / `.section-desc` |          ✅          |        ✅        | ✅ Present (live)                                           |
| `.grid-2` / `.grid-3` / `.grid-4` / `.grid-auto`                       |          ✅          |        ✅        | ✅ Present (live)                                           |
| Utilities (`.hidden`, `.d-flex`, etc.)                                 |          ✅          |        ❌        | ⚠️ **Missing showcase** — acceptable (structural utilities) |

### 3.2 Components in `visual.html` → Not in `swiss-style.css`

| Component                                       | In `visual.html` | In `swiss-style.css` | Status                                     |
| :---------------------------------------------- | :--------------: | :------------------: | :----------------------------------------- |
| `.skeleton`                                     |        ✅        |          ❌          | ⚠️ HTML-only (animation defined inline)    |
| `.status-dot` / `.status-dot-*`                 |        ✅        |          ❌          | ⚠️ HTML-only — **needs migration to CSS**  |
| `.anti-card`                                    |        ✅        |          ❌          | ✅ OK — showcase-only pattern              |
| `.toast` / `.toast-success` / `.toast-error`    |        ✅        |          ❌          | ⚠️ HTML-only — **needs migration to CSS**  |
| `.modal-demo` / `.modal-body` / `.modal-footer` |        ✅        |          ❌          | ⚠️ HTML-only — **needs migration to CSS**  |
| `.pill-nav` / `.pill-item`                      |        ✅        |          ❌          | ⚠️ HTML-only — **needs migration to CSS**  |
| `.pagination` / `.page-item`                    |        ✅        |          ❌          | ⚠️ HTML-only — **needs migration to CSS**  |
| `.chart-container`                              |        ✅        |          ❌          | ✅ OK — layout utility for Chart.js        |
| `.btn-lg`                                       |        ✅        |          ❌          | ⚠️ HTML-only — missing size variant in CSS |

### Summary: 6 Missing Showcases | 6 Components need CSS migration

---

## 4. WCAG AA Compliance

### 4.1 Color Contrast Results

Ratios calculated against `--bg-body: #000000`:

| Foreground            | Hex                                 |   Ratio    |    Req.     | Status      |
| :-------------------- | :---------------------------------- | :--------: | :---------: | :---------- |
| `--text-primary`      | `#ffffff` (tokens)                  |  21.00:1   |   ≥ 4.5:1   | ✅ Pass     |
| `--text-primary`      | `#f4f4f5` (visual.html)             |  19.11:1   |   ≥ 4.5:1   | ✅ Pass     |
| `--text-secondary`    | `#a1a1aa` (resolved)                |   8.19:1   |   ≥ 4.5:1   | ✅ Pass     |
| `--text-secondary`    | `#d4d4d8` (tokens.css original)     |  14.21:1   |   ≥ 4.5:1   | ✅ Pass     |
| `--text-tertiary`     | `#a1a1aa` (tokens.css)              |   8.19:1   |   ≥ 4.5:1   | ✅ Pass     |
| **`--text-tertiary`** | **`#52525b` (swiss / visual.html)** | **2.72:1** | **≥ 4.5:1** | **❌ FAIL** |
| `--brand-gold`        | `#e4d2a8` (tokens)                  |  14.08:1   |    ≥ 3:1    | ✅ Pass     |
| `--brand-gold`        | `#d4c5a0` (visual.html)             |  12.29:1   |    ≥ 3:1    | ✅ Pass     |
| `--success`           | `#4ade80`                           |  12.05:1   |    ≥ 3:1    | ✅ Pass     |
| `--warning`           | `#fbbf24`                           |  12.58:1   |    ≥ 3:1    | ✅ Pass     |
| `--danger`            | `#f87171`                           |   7.59:1   |    ≥ 3:1    | ✅ Pass     |
| `--info`              | `#60a5fa`                           |   8.26:1   |    ≥ 3:1    | ✅ Pass     |

#### Critical Finding

**`--text-tertiary (#52525b)` on `--bg-body (#000)` = 2.72:1** — fails both normal text (needs ≥ 4.5:1) and large text (needs ≥ 3:1).

- In `tokens.css`, `--text-tertiary` resolves to `var(--neutral-700)` = `#a1a1aa` (8.19:1 ✅)
- In `swiss-style.css` and `visual.html`, `--text-tertiary` = `#52525b` (2.72:1 ❌)
- Since `tokens.css` wins for this token, the resolved value (`#a1a1aa`) is WCAG-compliant.
- **Action**: Update `swiss-style.css` and `visual.html` to use the tokens.css value.

### 4.2 Toast Hardcoded Colors

| Element                 | Foreground         | Background                   | Status                                          |
| :---------------------- | :----------------- | :--------------------------- | :---------------------------------------------- |
| `.toast-success strong` | `#000` (hardcoded) | `var(--success)` = `#4ade80` | ⚠️ Hardcoded but visually OK (13.27:1)          |
| `.toast-error strong`   | `#fff` (hardcoded) | `var(--danger)` = `#f87171`  | ⚠️ Hardcoded — should use `var(--text-primary)` |

### 4.3 Focus & Keyboard

| Check                    | Status     | Notes                                                                   |
| :----------------------- | :--------- | :---------------------------------------------------------------------- |
| `:focus-visible` styles  | ✅ Present | Applied to `.btn`, `.nav-item`, `.tab-item`, `.pill-item`, `.page-item` |
| Focus indicator contrast | ✅         | Uses `#38bdf8` (sky-400) — high contrast on dark bg                     |
| Tab order                | ✅         | No `tabindex > 0` found                                                 |
| Skip-link                | ✅ Present | `<a href="#main-content" class="skip-link">`                            |

### 4.4 Semantic HTML

| Check             | Status | Notes                                                     |
| :---------------- | :----- | :-------------------------------------------------------- |
| Single `<h1>`     | ✅     | `id="hero-title"`                                         |
| Heading hierarchy | ✅     | h1 → h2 (section titles), no skipped levels               |
| Table roles       | ✅     | `role="table"` + `aria-label` on data table               |
| Tab roles         | ✅     | `role="tablist"` + `role="tab"` on navigation tabs        |
| Form labels       | ✅     | All inputs have associated `<label>` with `for` attribute |
| Pagination ARIA   | ✅     | `role="navigation"` + `aria-label`                        |

---

## 5. Hardcoded Hex Colors

Per **HR-1**: Every color MUST use `var(--token-name)`. Hex outside `:root {}` = bug.

### 5.1 In `design-system-visual.html` (outside `:root`)

Found **21 unique hex values** used outside the `:root` block:

| Hex                             | Count | Context                                  | Severity                                            |
| :------------------------------ | :---: | :--------------------------------------- | :-------------------------------------------------- |
| `#000`                          |  3+   | Toast text, anti-pattern bg, chart badge | 🔴 Should be `var(--bg-body)` or `var(--neutral-0)` |
| `#fff`                          |  3+   | Toast text, chart legend dot             | 🔴 Should be `var(--text-primary)`                  |
| `#ffffff`                       |  2+   | Chart borderColor, point border          | 🔴 Should be `var(--brand-primary)`                 |
| `#0a0a0a`                       |   1   | Chart pointBackgroundColor               | 🔴 Should be `var(--bg-surface)`                    |
| `#050505`                       |   1   | JS zinc palette data                     | 🟡 Data display — acceptable                        |
| `#18181b`, `#27272a`, etc.      |   8   | JS zinc/semantic data injection          | 🟡 Data display — acceptable                        |
| `#4ade80`, `#f87171`, `#60a5fa` |   3   | Chart.js dataset borderColor             | 🔴 Should use token vars                            |
| `#fbbf24`                       |   1   | Chart.js config                          | 🔴 Should use token var                             |
| `#52525b`                       |   1   | Chart.defaults.color                     | 🔴 Should use CSS variable                          |

**Actionable items**: 12 hex values in CSS/JS outside data injection should be replaced with `var()` references.

### 5.2 In `swiss-style.css` (outside `:root`)

| Line | Hex       | Context                                       | Severity                        |
| :--: | :-------- | :-------------------------------------------- | :------------------------------ |
| 224  | `#000`    | `.btn-primary { color: #000; }`               | 🔴 Should be `var(--neutral-0)` |
| 225  | `#e5e5e5` | `.btn-primary:hover { background: #e5e5e5; }` | 🔴 Should be a token reference  |
| 234  | `#000`    | `.btn-gold { color: #000; }`                  | 🔴 Should be `var(--neutral-0)` |

### 5.3 In other CSS files

From `hardcoded-colors-report.md`:

| File                  | Count | Severity                                |
| :-------------------- | :---: | :-------------------------------------- |
| `components.css`      |  34   | 🔴 Highest — 34 hardcoded hex values    |
| `qr-generator.css`    |   3   | 🔴 In print module — may be intentional |
| `members.css`         |   2   | 🟡 Used as fallbacks in `var()`         |
| `encargado-noche.css` |   3   | 🟡 Used as fallbacks in `var()`         |
| `cms-members.css`     |   1   | 🟡 Used as fallback in `var()`          |

### 5.4 In HTML pages

| File                      | Count | Severity                  |
| :------------------------ | :---: | :------------------------ |
| `layout_patterns.html`    |  13   | 🔴 Inline styles with hex |
| `components_catalog.html` |  12   | 🔴 Inline styles with hex |
| `module-audit.html`       |   7   | 🔴 Inline styles + JS     |
| `scanner-mock.html`       |   1   | 🟡 Badge color            |

**Total across codebase**: 128 hardcoded hex values outside `:root` blocks.

---

## 6. Structural Integrity

### 6.1 HTML Structure

| Check                 | Status | Notes                                                                                                            |
| :-------------------- | :----- | :--------------------------------------------------------------------------------------------------------------- |
| `.ds-section` pattern | ✅     | All 14 sections follow `section.ds-section > .section-header + .section-content`                                 |
| Section numbering     | ✅     | Sequential 01-14, no gaps                                                                                        |
| Navigation links      | ⚠️     | Nav only links to 4 anchors (`#foundations`, `#components`, `#interactive`, `#visuals`), not individual sections |
| Scroll-spy            | ✅     | Observes `div[id]` containers, highlights correct nav item                                                       |

### 6.2 CSS Architecture Issues in `visual.html`

| Check                       | Status | Notes                                                                                                                     |
| :-------------------------- | :----- | :------------------------------------------------------------------------------------------------------------------------ |
| `!important`                | ⚠️     | 2 instances in `@media (prefers-reduced-motion)` — acceptable                                                             |
| Inline styles               | ❌     | **Heavy inline style usage** — ~40+ elements with `style=""` attributes that could use token vars or utility classes      |
| Transitions with raw values | ⚠️     | `280ms var(--ease)` used directly instead of `var(--transition-*)` tokens in button transitions                           |
| Duplicate class definitions | ❌     | `.btn`, `.card`, `.input`, `.table` are fully redefined in `visual.html` — diverge from `swiss-style.css` implementations |

### 6.3 Critical: `visual.html` Redefines All Components

The visual HTML file contains **complete inline CSS** that redefines buttons, cards, inputs, tables, etc. with a different design language (Swiss typographic style with `border-radius: 0` etc.) that **diverges significantly from `swiss-style.css`** definitions:

| Component             | `swiss-style.css`                      | `visual.html`        |
| :-------------------- | :------------------------------------- | :------------------- |
| `.btn` padding        | `var(--space-2) var(--space-4)`        | `4px 0`              |
| `.btn` border-radius  | `var(--radius-md)` = `6px`             | `0`                  |
| `.btn` background     | `transparent`                          | `transparent` ✅     |
| `.card` border-radius | Likely radius token                    | `0`                  |
| `.card` background    | `var(--card-bg)` → `var(--bg-surface)` | `transparent`        |
| `.input` border       | `1px solid var(--input-border)`        | `border-bottom only` |
| `.table th` font      | System default                         | `var(--font-mono)`   |

> **Assessment**: The visual HTML intentionally showcases a "Swiss editorial" interpretation that differs from the production `swiss-style.css`. This is acceptable for the showcase page, but must be **explicitly documented** to avoid confusion about which implementation is the production standard.

---

## 7. Tokens Unique to Each File (No Conflict — But Missing)

### 7.1 In `tokens.css` but NOT in `swiss-style.css`

These tokens are defined in tokens.css but have no equivalent in swiss-style.css:

| Category         | Tokens                                                                                                                                                      |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alpha primitives | `--white-alpha-05/08/20/30/50/70`, `--black-alpha-20/40/60`                                                                                                 |
| Color primitives | `--sky-400`, `--blue-400/500`, `--red-400/500/600`, `--green-400/500`, `--orange-400/500`, `--yellow-400`, `--purple-400/500`                               |
| Typography       | `--fw-normal/medium/semibold/bold`, `--fs-xs` through `--fs-4xl`, `--lh-tight/normal/relaxed`                                                               |
| Layout           | `--control-h/h-sm/h-lg`, `--header-height`, `--sidebar-width`                                                                                               |
| Component tokens | `--btn-primary-bg/text`, `--btn-radius`, `--card-bg/border/radius`, `--input-bg/border/radius`                                                              |
| Aurora variant   | `--aurora-red`, `--accent-aurora`, `--btn-primary-aurora-bg`                                                                                                |
| Print tokens     | `--paper-mm`, `--pad-mm`, `--qr-mm`, `--gap-mm`, `--font-mm`                                                                                                |
| Shadows          | `--shadow-sm/soft/lg`                                                                                                                                       |
| Z-index          | `--z-panel/toast/skip-link/progress`                                                                                                                        |
| Aliases          | `--bg-base`, `--bg-elev`, `--surface-1/2`, `--text-1/2/3`, `--border-1/2`, `--text-sm`, `--topbar-h`, `--primary/primary-hover/primary-light/primary-color` |

### 7.2 In `swiss-style.css` but NOT in `tokens.css`

| Token                   | Value                    | Status                                                            |
| :---------------------- | :----------------------- | :---------------------------------------------------------------- |
| `--border-default`      | `#3f3f46`                | ⚠️ Missing from tokens — used frequently in components            |
| `--space-1/2/3/6/12/16` | numeric scale            | ⚠️ Overlaps partially with `--space-xs/sm/md/lg/xl` — dual naming |
| `--container-width`     | `1400px`                 | ⚠️ Missing from tokens                                            |
| `--grid-color`          | `rgba(255,255,255,0.08)` | ⚠️ Missing from tokens                                            |

---

## 8. Recommendations (Prioritized)

### P0 — Critical (before any generation)

|  #  | Action                                                                                                                        | Files Affected    |
| :-: | :---------------------------------------------------------------------------------------------------------------------------- | :---------------- |
|  1  | Apply 3 user-decided token resolutions to `tokens.css` (requires user approval per R1)                                        | `tokens.css`      |
|  2  | Sync `swiss-style.css` `:root` to match resolved `tokens.css` values for the 6 tokens where tokens.css wins                   | `swiss-style.css` |
|  3  | Add `--border-default` to `tokens.css` (referenced in both swiss-style.css and visual.html but missing from canonical source) | `tokens.css`      |

### P1 — High (before next visual HTML generation)

|  #  | Action                                                                                                                        | Files Affected    |
| :-: | :---------------------------------------------------------------------------------------------------------------------------- | :---------------- |
|  4  | Sync `visual.html` `:root` block to match resolved tokens — 7 diverging values identified                                     | `visual.html`     |
|  5  | Replace 12 hardcoded hex values in `visual.html` CSS/JS with `var()` references                                               | `visual.html`     |
|  6  | Add missing component showcases: `.btn-icon-flat`, `.btn:disabled`, `.badge/*`, `.dashboard-grid`                             | `visual.html`     |
|  7  | Migrate HTML-only components to `swiss-style.css`: `.toast`, `.modal`, `.pill-nav`, `.pagination`, `.status-dot`, `.skeleton` | `swiss-style.css` |

### P2 — Medium (backlog)

|  #  | Action                                                                                                        | Files Affected           |
| :-: | :------------------------------------------------------------------------------------------------------------ | :----------------------- |
|  8  | Resolve spacing dual-naming: `--space-{n}` (swiss) vs `--space-{xs-xl}` (tokens) — pick one convention        | Both CSS files           |
|  9  | Fix 34 hardcoded hex values in `components.css`                                                               | `components.css`         |
| 10  | Fix 25 hardcoded hex values in HTML pages (`layout_patterns.html`, `components_catalog.html`, etc.)           | HTML pages               |
| 11  | Document intentional divergences between `visual.html` Swiss editorial style and production `swiss-style.css` | `MASTER.md` or audit doc |
| 12  | Add `.btn-lg` variant to `swiss-style.css` (exists in visual.html showcase but not in production CSS)         | `swiss-style.css`        |

### P3 — Low (nice-to-have)

|  #  | Action                                                                                                  | Notes                    |
| :-: | :------------------------------------------------------------------------------------------------------ | :----------------------- |
| 13  | Eliminate token aliases (`--bg-base`, `--text-1`, `--border-1`, etc.) or document as official shorthand | Reduces confusion        |
| 14  | Consolidate `--primary`, `--primary-color`, `--primary-hover`, `--primary-light` naming                 | 4 tokens for one concept |
| 15  | Add Chart.js token layer (`--chart-grid-color`, `--chart-font-family`, etc.)                            | Eliminates JS hardcoding |

---

## Appendix A: Checklist Status

Cross-reference with `resources/audit-checklist.md`:

### Token Integrity

| Check                         | Status                                     |
| :---------------------------- | :----------------------------------------- |
| 1.1 Primitive tokens complete | ✅ All 73 primitives present               |
| 1.2 Semantic tokens complete  | ⚠️ 9 conflicts identified, 3 user-resolved |
| 1.3 Component tokens complete | ✅ 11 component tokens present             |

### Component Coverage

| Check                   | Status                             |
| :---------------------- | :--------------------------------- |
| 2.1 CSS → HTML coverage | ⚠️ 6 components missing showcase   |
| 2.2 HTML → CSS coverage | ⚠️ 6 components need CSS migration |

### WCAG AA

| Check                | Status                                       |
| :------------------- | :------------------------------------------- |
| 3.1 Color contrast   | ⚠️ 1 failure (`--text-tertiary` swiss value) |
| 3.2 Focus & keyboard | ✅ All checks pass                           |
| 3.3 Semantic HTML    | ✅ All checks pass                           |

### Structural Integrity

| Check                | Status                                                     |
| :------------------- | :--------------------------------------------------------- |
| 4.1 HTML structure   | ✅ All sections follow pattern                             |
| 4.2 CSS architecture | ❌ Inline styles + hardcoded hex + component redefinitions |

---

## Appendix B: Input Reports Used

| Report                     | Location                        | Stats                          |
| :------------------------- | :------------------------------ | :----------------------------- |
| Token Inventory            | `tokens-inventory.md`           | 155 tokens across 4 tiers      |
| Swiss Token Inventory      | `swiss-tokens-inventory.md`     | 33 tokens in `:root`           |
| Token Diff                 | `token-diff.md`                 | 9 confirmed conflicts          |
| Swiss Components Inventory | `swiss-components-inventory.md` | 46 classes in 11 categories    |
| Hardcoded Colors Report    | `hardcoded-colors-report.md`    | 128 hex values outside `:root` |

---

_Report generated by `design-system-architect` skill, Steps 1-2. No CSS files were modified._
