# Page Override: admin-workdays

> Overrides MASTER.md for `pages/admin/admin-workdays.html`  
> **Score:** 64/100 (Partial) | **Tier:** 0

---

## Deviations from Master

### Issues to Fix

- [ ] Remove 2x inline styles
- [ ] Replace 4x native `<select>` with `.custom-dropdown`
- [ ] Standardize sidebar to Golden Standard pattern
- [ ] Fix font weights: reduce `--fw-bold` usage to `--fw-semibold`
- [ ] Migrate hardcoded `z-index` to `var(--z-*)` tokens

### Layout Override

- Uses `admin-workdays.css` (page-specific, 664 lines)
- Heavy use of `--font-mono` (7 declarations) — review if all necessary

### Extra Notes

- Calendar/date components may need independent scroll
- Template management modal: ensure uses standard `.modal` pattern

### Priority

🟡 **P2** — Second page to remediate. Tier-0, functional but inconsistent.
