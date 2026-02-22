# Resource Analysis: CustomDropdown

> **Source**: MDN Web Docs — CSS Reference (commit `2df9b00`)
> **Date**: 2026-02-19
> **Scope**: Techniques applicable to the **CustomDropdown (Wrap Approach)** and **Swiss Style** system.

---

## 1. CSS Moderno Aplicable

### 1.1 `appearance: base-select` + `::picker(select)` ⭐ GAME CHANGER

El nuevo valor `base-select` transforma completamente el juego para `<select>`:

- **Qué hace**: Opt-in a un `<select>` completamente estilizable, con picker renderizado en el **top layer** (como un popover).
- **Impacto en nuestro Wrap**: Si los browsers target lo soportan, **podríamos prescindir del wrapper div** y estilar el `<select>` nativamente.
- **Positioning**: El picker se posiciona con **CSS Anchor Positioning** relativo al select.
- **Options estilizables**: Los `<option>` dejan de ser cajas opacas del OS.

```css
/* Opt-in al nuevo modelo */
select,
::picker(select) {
  appearance: base-select;
}

/* Ahora podemos estilar el picker */
::picker(select) {
  background-color: var(--color-surface);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-s);
}
```

| Browser | Soporte |
| ------- | ------- |
| Chrome  | 134+    |
| Firefox | ❌      |
| Safari  | ❌      |

> [!CAUTION]
> **No es Baseline todavía.** Usable como progressive enhancement, NO como estrategia principal. El Wrap Approach sigue siendo necesario como fallback.

---

### 1.2 `field-sizing: content` para Select

Hace que el `<select>` ajuste su width al contenido de la opción seleccionada (no al `<option>` más largo).

```css
select {
  field-sizing: content;
}
```

- **Efecto en dropdown**: El trigger cambia de ancho dinámicamente al seleccionar opciones.
- **Efecto en multiselect**: Muestra todas las opciones sin scroll.

| Browser | Soporte |
| ------- | ------- |
| Chrome  | 123+    |
| Firefox | ❌      |
| Safari  | ❌      |

> [!WARNING]
> No es Baseline. Solo Chrome/Edge. **No usar como dependencia**; puede ser un nice-to-have como progressive enhancement con `@supports`.

```css
@supports (field-sizing: content) {
  .custom-dropdown__select {
    field-sizing: content;
  }
}
```

---

### 1.3 `appearance: none` — El Estándar Seguro

Sigue siendo la herramienta core para reset del `<select>` nativo:

```css
.custom-dropdown__select {
  appearance: none;
  -webkit-appearance: none;
  /* Elimina la flecha nativa del OS */
  /* Mantiene la funcionalidad: focus, keyboard, option selection */
}
```

- **Baseline**: ✅ Todos los browsers.
- **Limitaciones**: Los `<option>` siguen siendo **no estilizables** con `none`. Solo el trigger button se resetea.
- **Key insight**: `none` da una apariencia "primitiva" — elimina el chrome visual del OS pero mantiene funcionalidad.

---

## 2. State Management via CSS (Sin JS)

### 2.1 `:focus-within` para Detectar Apertura ✅ RECOMENDADO

**Baseline**: ✅ Enero 2020 — Todos los browsers.

```css
/* Wrapper detecta cuando el select interno tiene focus */
.custom-dropdown:focus-within .custom-dropdown__menu {
  display: block;
  opacity: 1;
}

/* Highlight visual del wrapper cuando el select está activo */
.custom-dropdown:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 var(--border-width-thick) var(--color-primary-alpha);
}
```

**Aplicación directa al Wrap Approach**:

- El `<select>` nativo (hidden) recibe focus → `:focus-within` se propaga al wrapper div → CSS activa el menú visual.
- **Funciona en shadow trees** también.

> [!IMPORTANT]
> `:focus-within` **SÍ puede usarse** para el estado Open/Close del dropdown sin JS. El select nativo recibe focus al hacer click/tab, y el wrapper detecta eso. Sin embargo, hay un **edge case**: el menu custom se cierra al perder focus, lo cual puede ser abrupto al hacer click en una option custom que no es el select nativo. Se necesita JS mínimo para ese caso.

---

### 2.2 `:has()` para State Reactivo ✅ RECOMENDADO

**Baseline**: ✅ Diciembre 2023 — Todos los browsers modernos.

#### Detectar si hay selección válida

```css
/* Si el select tiene una option con value seleccionado */
.custom-dropdown:has(select:not([value=""])) {
  /* Estado "tiene valor" */
}

/* Si el select es required y está valid */
.custom-dropdown:has(select:valid) .custom-dropdown__label {
  color: var(--color-success);
}

/* Si el select es invalid */
.custom-dropdown:has(select:invalid) .custom-dropdown__label {
  color: var(--color-danger);
}
```

#### Detectar checked en radios/checkboxes simulados

```css
/* Si algún radio interno está checked */
.custom-dropdown:has(input[type="radio"]:checked) {
  /* Activa estilos de "seleccionado" */
}
```

#### Logical AND/OR

```css
/* OR: si tiene focus O tiene valor */
.custom-dropdown:has(select:focus, select:valid) {
}

/* AND: si tiene focus Y tiene valor */
.custom-dropdown:has(select:focus):has(select:valid) {
}
```

> [!NOTE]
> **Performance**: Evitar `:has()` con anchoring broad (e.g., `body:has(...)`). Usar scoped to el wrapper `.custom-dropdown:has(...)`.

---

### 2.3 `:valid` / `:invalid` — Form Validation Nativa

**Baseline**: ✅ Todos los browsers.

```css
/* El select nativo con required marca valid/invalid automáticamente */
.custom-dropdown__select:valid ~ .custom-dropdown__trigger {
  border-color: var(--color-success);
}

.custom-dropdown__select:invalid ~ .custom-dropdown__trigger {
  border-color: var(--color-danger);
}
```

No requiere JS para validación visual. Combina con `:has()` para propagación al parent.

---

## 3. Mejoras A11y

### 3.1 Pattern: `<label>` vinculado con Select + Trigger Custom

```html
<div class="custom-dropdown" role="combobox" aria-expanded="false">
  <label for="store-select" class="custom-dropdown__label"> Sucursal </label>

  <!-- Select nativo: screen reader interactúa con este -->
  <select
    id="store-select"
    class="custom-dropdown__select"
    aria-hidden="false"
    tabindex="0"
  >
    <option value="">Seleccionar...</option>
    <option value="1">Centro</option>
    <option value="2">Norte</option>
  </select>

  <!-- Trigger visual: hidden para SR -->
  <div class="custom-dropdown__trigger" aria-hidden="true">
    <span class="custom-dropdown__value">Seleccionar...</span>
    <span class="custom-dropdown__arrow">▾</span>
  </div>
</div>
```

**Key patterns**:

- `<label for>` apunta al `<select>` nativo → funciona con click y screen reader.
- `aria-hidden="true"` en el trigger visual → SR ignora el decorativo.
- El `<select>` no es `display: none` sino visualmente oculto (`opacity: 0; position: absolute`) → mantiene focusability.

### 3.2 `aria-expanded` y JS Mínimo

```javascript
// Unico JS requerido para A11y
dropdown.addEventListener("focus", () => {
  wrapper.setAttribute("aria-expanded", "true");
});
dropdown.addEventListener("blur", () => {
  wrapper.setAttribute("aria-expanded", "false");
});
```

---

## 4. Recomendación Final

### ¿Podemos evitar JS para Open/Close usando `:focus-within`?

**Parcialmente SÍ** — `:focus-within` detecta correctamente cuando el select nativo tiene focus. El CSS puede mostrar/ocultar el menú custom basándose en esto. Sin embargo:

| Caso                         | `:focus-within` solo | Con JS mínimo |
| ---------------------------- | -------------------- | ------------- |
| Abrir con click              | ✅                   | ✅            |
| Abrir con Tab                | ✅                   | ✅            |
| Cerrar con Escape            | ❌ Necesita blur     | ✅            |
| Cerrar al click fuera        | ✅ (pierde focus)    | ✅            |
| `aria-expanded` sync         | ❌                   | ✅            |
| Cerrar al seleccionar option | ⚠️ Depende           | ✅            |

**Veredicto**: `:focus-within` maneja el 80% del estado. El JS mínimo es solo para `aria-expanded` y edge cases de close.

### ¿Podemos usar `field-sizing: content`?

**Como progressive enhancement SÍ**, como dependencia NO. Wrap con `@supports`.

### Estrategia Recomendada (Pragmática)

```
Prioridad 1 (HOY):      appearance: none + :focus-within + :has() + JS mínimo
Prioridad 2 (FUTURO):   appearance: base-select + ::picker(select) como upgrade
Progressive Enhancement: field-sizing: content via @supports
```

```css
/* === STACK COMPLETO === */

/* 1. Reset */
.custom-dropdown__select {
  appearance: none;
}

/* 2. State via CSS */
.custom-dropdown:focus-within .custom-dropdown__menu {
  display: block;
}

/* 3. Validation via CSS */
.custom-dropdown:has(select:valid) {
  /* valid styles */
}
.custom-dropdown:has(select:invalid) {
  /* error styles */
}

/* 4. Progressive Enhancement */
@supports (field-sizing: content) {
  .custom-dropdown__select {
    field-sizing: content;
  }
}

/* 5. Future: Native styling (cuando sea Baseline) */
@supports (appearance: base-select) {
  select,
  ::picker(select) {
    appearance: base-select;
  }
}
```
