# Page Override: encargado-caja-noche

> Overrides MASTER.md for `pages/encargados/encargado-caja-noche.html`  
> **Score:** 35/100 (Critical) | **Tier:** 0

---

## Deviations from Master

### Missing Components (must add)

- [ ] `.topbar` + breadcrumb navigation
- [ ] `.dashboard-header` with page title + tabs
- [ ] `.custom-dropdown` replacing 3x native `<select>`
- [ ] `.modal` using standard pattern (currently ad-hoc)
- [ ] `.spinner` replacing `.noche-spinner`

### Layout Override

- Uses `encargado-noche.css` (page-specific)
- Needs migration to `page-shell > page-card-wrap > page-card` structure

### Extra Tokens (page-specific)

- Night shift context: may use `--brand-gold` for shift-active indicators
- Cash register: highlight totals with `--success` (positive) / `--danger` (negative)

### Priority

🔴 **P1** — First page to remediate. Tier-0 operational risk.
