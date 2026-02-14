# Workdays — 6 Edits Plan

## Scope: Targeted edits. Preserve all elements not mentioned.

---

### Edit 1: Event & KPI selectors → INTO table row

**HTML** — Add event dropdown + KPI badge inline in the DRAFT row's "Evento" cell (L88-90):

```html
<td class="wd-td wd-td--evento">
  <select class="wd-evento-select wd-evento-select--inline" id="evento-select">
    <option value="">Seleccionar evento...</option>
    <!-- options -->
  </select>
  <span class="wd-kpi-pill" id="kpi-badge">79%</span>
</td>
```

**HTML** — Remove `<select>` from planner footer (L368-375). Footer becomes: `Total | Budget | Confirm`.

**CSS** — New `.wd-evento-select--inline` (200px, compact) and `.wd-kpi-pill` (pill badge with subtle progress ring).

**CSS** — Footer grid changes from `auto 1fr auto auto` → `1fr auto auto` (3 children).

#### Files: [index.html](file:///c:/Users/siste/Documents/GitHub/formulamid-prototypes/screens/lab-workdays/index.html), [style.css](file:///c:/Users/siste/Documents/GitHub/formulamid-prototypes/screens/lab-workdays/style.css)

---

### Edit 2: Button → Right-aligned in toolbar

Current toolbar has `space-between` + hidden title. Change to push button to the right via `margin-left: auto` on button.

**CSS** — `.wd-toolbar { justify-content: flex-end; }` (revert to original intent).

#### Files: [style.css](file:///c:/Users/siste/Documents/GitHub/formulamid-prototypes/screens/lab-workdays/style.css)

---

### Edit 3: Center ALL cell content

**CSS** changes:
```css
.wd-th { text-align: center; }
.wd-td { text-align: center; }
.wd-td--actions { text-align: center; }  /* was: right */
```

Ensure inner elements center: `.wd-status`, `.wd-date-label`, `.wd-countdown` → `justify-content: center; width: 100%`.

#### Files: [style.css](file:///c:/Users/siste/Documents/GitHub/formulamid-prototypes/screens/lab-workdays/style.css)

---

### Edit 4: Countdown → Premium digital clock

Replace current small countdown blocks with larger flip-clock style:

```css
.wd-countdown__block {
  display: flex;
  flex-direction: column;  /* number on top, unit below */
  align-items: center;
  min-width: 42px;
  padding: 6px 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.wd-countdown__block .wd-countdown__num {
  font-size: 18px; font-weight: 700; color: #fff;
}
.wd-countdown__block .wd-countdown__unit {
  font-size: 9px; text-transform: uppercase; color: var(--text-tertiary);
}
```

**HTML** — Change from `04<small>d</small>` to structured `<span class="wd-countdown__num">04</span><span class="wd-countdown__unit">d</span>`.

#### Files: [index.html](file:///c:/Users/siste/Documents/GitHub/formulamid-prototypes/screens/lab-workdays/index.html), [style.css](file:///c:/Users/siste/Documents/GitHub/formulamid-prototypes/screens/lab-workdays/style.css)

---

### Edit 5: Planner card grid hierarchy

Current grid already uses `repeat(3, 1fr)` on desktop ✅. Fix responsive breakpoints:

- **≥1280px**: Keep `repeat(3, 1fr)` (current)
- **1024px**: Already has `1fr 1fr` + `#card-solicitudes` spanning ✅
- **≤768px**: Already has `1fr` ✅

Footer below cards → change from grid to flex:
```css
.wd-planner__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```
With 3 children now (total | budget | confirm), flex space-between works correctly.

#### Files: [style.css](file:///c:/Users/siste/Documents/GitHub/formulamid-prototypes/screens/lab-workdays/style.css)

---

### Edit 6: Card internal structure consistency

Current cards already have: header-bar + body + total footer with `margin-top: auto` ✅

Polish:
- Ensure `min-height` for card consistency
- Hover: border-color + deeper shadow (already exists at L344-347) ✅
- Card total footer uses consistent 13px/14px sizing (already at L604-618) ✅

> [!NOTE]
> Cards already follow the requested pattern. Minor polish only.

---

## Execution Order

| Step | Edit | Risk |
|:----:|------|:----:|
| 1 | Edit 4: Countdown HTML+CSS (standalone) | Low |
| 2 | Edit 1: Event selector into row + footer refactor | Medium |
| 3 | Edit 2: Toolbar right-align | Low |
| 4 | Edit 3: Center cells | Low |
| 5 | Edit 5: Footer flex refactor | Low |
| 6 | Edit 6: Card polish | Low |
| 7 | Verify in browser | — |

## Verification
Screenshot comparison after all edits.
