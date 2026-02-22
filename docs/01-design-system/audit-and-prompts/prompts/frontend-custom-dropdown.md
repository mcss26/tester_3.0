# CustomDropdown Component â€” Design & Implementation Brief

## Contexto

El Orchestrator ejecutÃ³ un risk analysis (`docs/80-ephemeral/agent-logs/ui-scan/select-risk-report.md`) que encontrÃ³ **45 `<select>`** en producciÃ³n:

- **5 CRITICAL** â€” usan 3-5 APIs nativas (`.value`, `.selectedIndex`, `.options`, `.innerHTML`, `.appendChild`) y escriben a DB
- **22 HIGH** â€” usan 1-2 APIs nativas con DB ops
- **18 LOW** â€” sin JS o sin DB

**DecisiÃ³n: Wrap approach** â€” el CustomDropdown debe estilizar visualmente el `<select>` nativo sin reemplazar el DOM funcional. Cero cambios en JS existente.

---

## QuÃ© necesito que hagas

### 1. DiseÃ±ar el componente `custom-dropdown` en Stitch

DiseÃ±Ã¡ un mockup en Stitch con estos estados:

- **Default** (cerrado)
- **Hover** (trigger highlighted)
- **Open** (dropdown extendido)
- **Selected** (opciÃ³n marcada)
- **Disabled** (grayed out)

**Visual**: seguir el Swiss Style design system. Colores de `tokens.css`:

- Background: `var(--bg-card)` â†’ `#1a1a1a`
- Border: `var(--border-default)` â†’ `rgba(255,255,255,0.08)`
- Text: `var(--text-primary)` â†’ `#e4e4e7`
- Hover: `var(--bg-hover)` â†’ `rgba(255,255,255,0.06)`
- Focus ring: `var(--brand-accent)` â†’ `#f0b90b`

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

### 3. Wrapping â€” CÃ³mo funciona

```html
<!-- ANTES (actual en producciÃ³n) -->
<select id="select-event">
  <option value="">-- Sin Evento --</option>
  <option value="abc123">Noche Techno</option>
</select>

<!-- DESPUES (wrap approach) -->
<div class="custom-dropdown">
  <button class="custom-dropdown-trigger" type="button">
    <span class="custom-dropdown-text">-- Sin Evento --</span>
    <span class="custom-dropdown-icon">â–¾</span>
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
3. El `.custom-dropdown-trigger` muestra la selecciÃ³n actual
4. En mobile: el `<select>` nativo se activa (UX nativa superior)
5. En desktop: overlay custom con `.custom-dropdown-menu`
6. Cualquier cambio en el `<select>` sincroniza el trigger text
7. JS existente sigue usando `getElementById('select-event').value` â†’ funciona igual

### 4. Constraints

- **NO renombrar IDs** â€” hay 27 selects DB-bound
- **NO eliminar el `<select>`** â€” el JS lo referencia directamente
- **NO agregar JS al componente** â€” solo CSS. El JS de sincronizaciÃ³n (trigger â†” select) se puede agregar como micro-utility separado si es necesario
- **Seguir tokens** â€” solo `var(--xxx)` de `tokens.css`, nunca hardcode colors

### 5. Archivos a leer

| Archivo                                     | Para quÃ©                             |
| ------------------------------------------- | ------------------------------------ |
| `assets/css/tokens.css`                     | Colores, spacing, typography         |
| `assets/css/swiss-style.css`                | Componentes existentes, ver patterns |
| `docs/80-ephemeral/agent-logs/ui-scan/select-risk-report.md` | Detalle de cada select y su riesgo   |
| `docs/80-ephemeral/agent-logs/ui-scan/compliance-matrix.md`  | Score de cada pÃ¡gina pre-cambio      |

### 6. Output esperado

1. **Stitch mockup** del componente (5 estados)
2. **CSS classes** agregadas a `swiss-style.css`
3. **Confirmar** que no se tocÃ³ ningÃºn JS

### 7. VerificaciÃ³n

Cuando termines, avisame y pedile al CLI Orchestrator que corra `/verify-components` para confirmar que no rompimos nada.
