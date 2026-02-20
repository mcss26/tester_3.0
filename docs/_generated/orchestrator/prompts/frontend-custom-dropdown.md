# CustomDropdown Component — Design & Implementation Brief

## Contexto

El Orchestrator ejecutó un risk analysis (`docs/_generated/ui-scan/select-risk-report.md`) que encontró **45 `<select>`** en producción:

- **5 CRITICAL** — usan 3-5 APIs nativas (`.value`, `.selectedIndex`, `.options`, `.innerHTML`, `.appendChild`) y escriben a DB
- **22 HIGH** — usan 1-2 APIs nativas con DB ops
- **18 LOW** — sin JS o sin DB

**Decisión: Wrap approach** — el CustomDropdown debe estilizar visualmente el `<select>` nativo sin reemplazar el DOM funcional. Cero cambios en JS existente.

---

## Qué necesito que hagas

### 1. Diseñar el componente `custom-dropdown` en Stitch

Diseñá un mockup en Stitch con estos estados:

- **Default** (cerrado)
- **Hover** (trigger highlighted)
- **Open** (dropdown extendido)
- **Selected** (opción marcada)
- **Disabled** (grayed out)

**Visual**: seguir el Swiss Style design system. Colores de `tokens.css`:

- Background: `var(--bg-card)` → `#1a1a1a`
- Border: `var(--border-default)` → `rgba(255,255,255,0.08)`
- Text: `var(--text-primary)` → `#e4e4e7`
- Hover: `var(--bg-hover)` → `rgba(255,255,255,0.06)`
- Focus ring: `var(--brand-accent)` → `#f0b90b`

### 2. Implementar el CSS en `swiss-style.css`

API de clases CSS:

```css
.custom-dropdown          /* wrapper container */
.custom-dropdown-trigger  /* visible button/display */
.custom-dropdown-menu     /* options container (overlay) */
.custom-dropdown-option   /* individual option */
.custom-dropdown-text     /* label text inside trigger */
.custom-dropdown-icon     /* chevron/arrow icon */
.custom-dropdown.is-open  /* state: menu visible */
.custom-dropdown.is-disabled /* state: grayed out */
```

### 3. Wrapping — Cómo funciona

```html
<!-- ANTES (actual en producción) -->
<select id="select-event">
  <option value="">-- Sin Evento --</option>
  <option value="abc123">Noche Techno</option>
</select>

<!-- DESPUES (wrap approach) -->
<div class="custom-dropdown">
  <button class="custom-dropdown-trigger" type="button">
    <span class="custom-dropdown-text">-- Sin Evento --</span>
    <span class="custom-dropdown-icon">▾</span>
  </button>
  <select id="select-event" class="custom-dropdown-native">
    <option value="">-- Sin Evento --</option>
    <option value="abc123">Noche Techno</option>
  </select>
</div>
```

**Reglas del wrap:**

1. El `<select>` original QUEDA en el DOM con su `id` intacto
2. El `<select>` se oculta visualmente (`opacity: 0; position: absolute`) pero sigue funcional
3. El `.custom-dropdown-trigger` muestra la selección actual
4. En mobile: el `<select>` nativo se activa (UX nativa superior)
5. En desktop: overlay custom con `.custom-dropdown-menu`
6. Cualquier cambio en el `<select>` sincroniza el trigger text
7. JS existente sigue usando `getElementById('select-event').value` → funciona igual

### 4. Constraints

- **NO renombrar IDs** — hay 27 selects DB-bound
- **NO eliminar el `<select>`** — el JS lo referencia directamente
- **NO agregar JS al componente** — solo CSS. El JS de sincronización (trigger ↔ select) se puede agregar como micro-utility separado si es necesario
- **Seguir tokens** — solo `var(--xxx)` de `tokens.css`, nunca hardcode colors

### 5. Archivos a leer

| Archivo                                     | Para qué                             |
| ------------------------------------------- | ------------------------------------ |
| `assets/css/tokens.css`                     | Colores, spacing, typography         |
| `assets/css/swiss-style.css`                | Componentes existentes, ver patterns |
| `docs/_generated/ui-scan/select-risk-report.md` | Detalle de cada select y su riesgo   |
| `docs/_generated/ui-scan/compliance-matrix.md`  | Score de cada página pre-cambio      |

### 6. Output esperado

1. **Stitch mockup** del componente (5 estados)
2. **CSS classes** agregadas a `swiss-style.css`
3. **Confirmar** que no se tocó ningún JS

### 7. Verificación

Cuando termines, avisame y pedile al CLI Orchestrator que corra `/verify-components` para confirmar que no rompimos nada.
