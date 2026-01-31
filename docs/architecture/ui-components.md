# Arquitectura de Componentes UI - FormulaMid 4

> Referencia completa del sistema de componentes para desarrollo consistente de interfaces.
>
> **Última Actualización**: 2026-01-29

---

## Tabla de Contenidos

1. [Componentes Base](#componentes-base)
2. [Componentes Core ERP](#componentes-core-erp)
3. [Sistema de Tokens de Diseño](#sistema-de-tokens-de-diseño)
4. [Estados de Componentes](#estados-de-componentes)
5. [Patrones de Formularios](#patrones-de-formularios)
6. [Topbar Balanceado (Golden Standard)](#topbar-balanceado-golden-standard)
7. [Navegación Accesible](#navegación-accesible)
8. [Mensajes de Error](#mensajes-de-error)
9. [Componentes Específicos FormulaMid](#componentes-específicos-formulamid)
10. [Matriz de Implementación por Módulo](#matriz-de-implementación-por-módulo)
11. [Checklist de Implementación](#checklist-de-implementación)
12. [Referencias](#referencias)

---

## Componentes Base

Los componentes base son elementos fundamentales que se utilizan en toda la aplicación. Cada componente debe implementar todos los estados especificados para garantizar consistencia.

| Componente | Variantes | Estados |
|------------|-----------|---------|
| **Botones** | Primarios, secundarios, terciarios, ghost | hover, active, disabled, focus-visible |
| **Inputs de texto** | Default, filled, error, disabled | Con labels claros y placeholder apropiado |
| **Checkboxes** | Checked, unchecked, indeterminate | disabled disponible |
| **Radio buttons** | Checked, unchecked | disabled disponible |
| **Selects/Dropdowns** | Single, multi-select | Navegación por teclado |
| **Cards** | Contenedores jerárquicos | Áreas de interacción claras |
| **Iconos** | Set consistente | Tamaños estandarizados |

### Implementación de Botones

```css
.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-radius: var(--btn-radius);
  transition: all 0.2s ease;
  padding: 10px 20px;
  min-height: 44px; /* Touch target */
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: var(--text-1);
  border: 1px solid var(--border-2);
}

.btn-secondary {
  background: var(--surface-1);
  color: var(--text-1);
}
```

---

## Componentes Core ERP

Estos componentes definen la arquitectura visual del ERP. Son obligatorios en todas las vistas de tipo Master y vistas con tablas.

### 1. TableShell (Tablas con Scroll Interno)

**Objetivo**: Proporcionar sticky header consistente con scroll interno, evitando conflictos con el scroll de página.

**Estructura HTML Requerida**:

```html
<div class="staff-list table-viewport table-shell">
  <div class="table-scroll">
    <table class="table table-sticky">
      <thead>
        <tr>
          <th scope="col">Columna 1</th>
          <th scope="col">Columna 2</th>
          <th scope="col">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Dato 1</td>
          <td>Dato 2</td>
          <td>
            <button class="btn btn-ghost btn-sm">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Clases Explicadas**:
- `staff-list`: Contenedor de lista de personal/datos
- `table-viewport`: Define el área visible de la tabla
- `table-shell`: Aplica estilos de borde, radius y spacing
- `table-scroll`: Contenedor con scroll interno
- `table-sticky`: Hace el header sticky dentro del scroll

**Reglas**:
- ✅ Siempre usar en conjunto: `table-viewport table-shell`
- ✅ Header debe usar `<th scope="col">` para accesibilidad
- ✅ Evitar clases adicionales que rompan el scroll
- ⚠️ No mezclar con scroll de página

**CSS Pattern (Golden Standard)**:

Para tablas con muchas columnas, usar `table-layout: fixed` y definir anchos por columna:

```css
.module-scope .table {
  table-layout: fixed;
}

.module-scope .table th,
.module-scope .table td {
  vertical-align: middle;
}

/* Anchos por columna (deben sumar 100%) */
.module-scope .table th:nth-child(1),
.module-scope .table td:nth-child(1) { width: 28%; }

.module-scope .table th:nth-child(2),
.module-scope .table td:nth-child(2) { width: 28%; }

/* Columnas numéricas: usar text-align: center */
.module-scope .table th:nth-child(3),
.module-scope .table td:nth-child(3) {
  width: 12%;
  text-align: center;
}
```

> **Referencia**: Ver implementación en [`components.css`](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/css/components.css) (líneas 706-745)

---

### 2. FilterBar (Filtros y Búsqueda)

**Objetivo**: Barra estandarizada para filtros, tabs y búsqueda, garantizando consistencia visual.

**Estructura HTML Baseline (Master List)**:

```html
<div class="filter-bar filter-bar-compact">
  <div class="filter-group tab-bar">
    <button class="tab-chip active" data-filter="all">
      Total <span class="chip-count">24</span>
    </button>
    <button class="tab-chip" data-filter="active">
      Activos <span class="chip-count">20</span>
    </button>
    <button class="tab-chip" data-filter="inactive">
      Inactivos <span class="chip-count">4</span>
    </button>
  </div>
  <div class="filter-actions">
    <input
      class="input input-compact"
      type="search"
      placeholder="Buscar..."
      aria-label="Buscar registros"
    />
    <select class="input input-compact" aria-label="Filtrar por categoría">
      <option>Todas las categorías</option>
      <option>Categoría A</option>
    </select>
  </div>
</div>
```

**Variante con Tabs de Categoría**:

```html
<div class="tabs-row">
  <div class="tabs-actions">
    <div class="tab-bar">
      <button class="tab-chip active">Todos</button>
      <button class="tab-chip">Bebidas</button>
      <button class="tab-chip">Snacks</button>
    </div>
    <input
      class="input input-compact"
      type="search"
      placeholder="Buscar productos..."
    />
  </div>
</div>
```

**Reglas**:
- ✅ Pills funcionan como filtros activos (añadir/remover clase `active`)
- ✅ Search debe tener debounce de 150-200ms
- ✅ Usar `input-compact` para reducir altura
- ✅ Counters (`chip-count`) se actualizan dinámicamente

---

### 3. ActionBar (CTA Principal + Acciones Secundarias)

**Objetivo**: Definir claramente la acción principal de la vista y acciones secundarias.

**Estructura HTML**:

```html
<div class="action-bar">
  <button class="btn btn-primary" id="btn-create">
    <svg class="icon"><!-- icono + --></svg>
    Crear Nuevo
  </button>
  <button class="btn btn-ghost" id="btn-refresh">
    <svg class="icon"><!-- icono refresh --></svg>
    Refrescar
  </button>
  <button class="btn btn-ghost" id="btn-export">
    Exportar
  </button>
</div>
```

**Variante Minimalista (Icon-Only)**:

```html
<div class="dashboard-header align-start">
  <div class="header-content">
    <h2 class="dashboard-title">Proveedores</h2>
    <p class="dashboard-subtitle">Gestión de proveedores activos</p>
  </div>
  <button class="btn btn-icon" id="btn-new" aria-label="Crear nuevo proveedor">
    <svg class="icon"><!-- + --></svg>
  </button>
</div>
```

**Reglas**:
- ✅ Un solo CTA primario (`btn-primary`) por vista
- ✅ Acciones secundarias en `btn-ghost`
- ✅ Icon-only buttons requieren `aria-label`

---

### 4. SlidePanel / Modal (Estructura Unificada)

**Objetivo**: Contenedores para formularios y detalles, con estructura consistente.

**SlidePanel (Recomendado para Formularios)**:

```html
<div class="panel-overlay" id="panel-overlay"></div>
<aside class="slide-panel" id="slide-panel">
  <div class="panel-header">
    <h3 class="panel-title">Nuevo Proveedor</h3>
    <button class="panel-close" id="btn-close-panel" aria-label="Cerrar panel">
      ×
    </button>
  </div>
  <div class="panel-body">
    <!-- Formulario -->
    <div class="form-section">
      <h4 class="section-title">Información General</h4>
      <div class="form-field">
        <label for="nombre" class="form-label">
          Nombre <span class="required">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          class="form-input"
          aria-required="true"
        />
      </div>
    </div>
  </div>
  <div class="panel-footer">
    <button class="btn btn-secondary" id="btn-cancel">Cancelar</button>
    <button class="btn btn-primary" id="btn-save">Guardar</button>
  </div>
</aside>
```

**Modal (Para Confirmaciones y Detalles)**:

```html
<div class="modal-overlay hidden" id="modal">
  <div class="modal-card">
    <div class="modal-header">
      <h3 class="modal-title">Confirmar Eliminación</h3>
      <button class="modal-close" aria-label="Cerrar modal">×</button>
    </div>
    <div class="modal-body">
      <p>¿Está seguro que desea eliminar este registro?</p>
      <p class="text-muted">Esta acción no se puede deshacer.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancelar</button>
      <button class="btn btn-danger">Eliminar</button>
    </div>
  </div>
</div>
```

**Reglas**:
- ✅ Usar SlidePanel para formularios largos
- ✅ Usar Modal para confirmaciones y diálogos cortos
- ✅ Implementar Focus Trap (Tab solo dentro del panel/modal)
- ✅ Cerrar con Escape key
- ⚠️ NUNCA usar `confirm()` nativo - rompe la experiencia

---

### 5. Estados (Loading / Empty / Error)

**Objetivo**: Feedback visual consistente para estados asíncronos.

**Estructura HTML (Baseline Master)**:

```html
<div class="page-card-wrap">
  <div class="page-card">
    <!-- Overlays de Estado -->
    <div class="page-card-loading" id="page-card-loading">
      <div class="state-block">
        <div class="loading-spinner"></div>
        <p class="state-title">Cargando datos...</p>
        <p class="state-desc">Esto puede tardar unos segundos</p>
      </div>
    </div>

    <div class="page-card-empty" id="page-card-empty">
      <div class="state-block">
        <svg class="state-icon"><!-- icono vacío --></svg>
        <p class="state-title">Sin resultados</p>
        <p class="state-desc">No se encontraron registros con los filtros aplicados</p>
      </div>
    </div>

    <!-- Contenido Principal (debe ocultarse cuando loading/empty está visible) -->
    <div id="module-content">
      <div class="staff-dashboard">
        <!-- ... -->
      </div>
    </div>
  </div>
</div>
```

**JavaScript para Control de Estados**:

```javascript
const refs = {
  loadingOverlay: document.getElementById('page-card-loading'),
  emptyOverlay: document.getElementById('page-card-empty'),
  contentWrap: document.getElementById('module-content'),
  tableBody: document.getElementById('table-body')
};

function setPageState({ loading = false, empty = false } = {}) {
  refs.loadingOverlay.classList.toggle('is-visible', loading);
  refs.emptyOverlay.classList.toggle('is-visible', empty);
  if (refs.contentWrap) refs.contentWrap.classList.toggle('hidden', loading || empty);
}
```

**Compatibilidad con Versiones Anteriores**:

Las siguientes clases siguen vigentes pero se recomienda migrar al patrón de overlays:

```html
<!-- Legacy (funcional pero no recomendado) -->
<div class="empty-state">
  <p>No hay datos disponibles</p>
</div>

<div class="loading-spinner">Cargando...</div>

<div class="error-msg">Error al cargar datos</div>
```

**Reglas**:
- ✅ Estados a nivel `page-card` (no dentro de tabla)
- ✅ Usar clase `is-visible` para control de visibilidad
- ✅ Incluir overlays en HTML (no inyectarlos con JS)
- ⚠️ Evitar inyección de HTML para estados (`innerHTML`)

---

## Sistema de Tokens de Diseño

El sistema utiliza una arquitectura de 3 niveles basada en el estándar **W3C DTCG** (Design Tokens Community Group) para garantizar consistencia y mantenibilidad.

### Arquitectura de 3 Niveles

```
┌─────────────────────────────────────┐
│  3. COMPONENTES (Component Tokens) │ → Uso en componentes
├─────────────────────────────────────┤
│  2. SEMÁNTICOS (Semantic Tokens)   │ → Uso en estilos CSS
├─────────────────────────────────────┤
│  1. PRIMITIVOS (Raw Values)        │ → Solo definición
└─────────────────────────────────────┘
```

---

### Nivel 1: Primitivos (Raw Values)

**Objetivo**: Definir la paleta base. **NO usar directamente en componentes.**

```css
:root {
  /* Neutral Palette (Dark Theme) */
  --neutral-0: #000000;
  --neutral-50: #050505;
  --neutral-100: #0a0a0a;
  --neutral-200: #1a1a1a;
  --neutral-800: #e5e5e5;
  --neutral-900: #f5f5f5;
  --neutral-1000: #ffffff;

  /* Alpha Transparencies */
  --white-alpha-06: rgba(255, 255, 255, 0.06);
  --white-alpha-10: rgba(255, 255, 255, 0.10);
  --white-alpha-24: rgba(255, 255, 255, 0.24);
  --white-alpha-50: rgba(255, 255, 255, 0.50);
  --white-alpha-70: rgba(255, 255, 255, 0.70);
  --black-alpha-60: rgba(0, 0, 0, 0.60);
  --black-alpha-92: rgba(0, 0, 0, 0.92);

  /* Semantic Colors (Base) */
  --red-500: #ff453a;
  --red-600: #ff3b30;
  --green-500: #30d158;
  --blue-500: #0a84ff;
  --orange-500: #ff9f0a;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

---

### Nivel 2: Semánticos (Design Decisions)

**Objetivo**: Abstraer el propósito del valor. **Use estos tokens en sus estilos.**

```css
:root {
  /* ===== SUPERFICIES ===== */
  --bg-base: var(--neutral-50);        /* Fondo principal de la app */
  --bg-elev: var(--black-alpha-92);    /* Modales, dropdowns elevados */
  --surface-1: var(--white-alpha-06);  /* Cards nivel 1 */
  --surface-2: var(--white-alpha-10);  /* Cards nivel 2 (hover) */

  /* ===== TEXTO ===== */
  --text-1: var(--neutral-1000);       /* Texto principal (blanco) */
  --text-2: var(--white-alpha-70);     /* Texto secundario */
  --text-3: var(--white-alpha-50);     /* Placeholders, disabled */
  --text-inverse: var(--neutral-50);   /* Texto sobre fondos sólidos */

  /* ===== ESTADO ===== */
  --accent: var(--red-600);            /* Color primario de marca */
  --success: var(--green-500);         /* Confirmaciones, éxito */
  --danger: var(--red-500);            /* Errores, eliminaciones */
  --warning: var(--orange-500);        /* Advertencias */
  --info: var(--blue-500);             /* Información */

  /* ===== BORDES ===== */
  --border-1: var(--white-alpha-10);   /* Bordes sutiles */
  --border-2: var(--white-alpha-24);   /* Bordes estándar */
  --border-3: var(--white-alpha-50);   /* Bordes destacados */

  /* ===== INTERACCIÓN ===== */
  --focus-ring: var(--accent);         /* Outline de focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
}
```

---

### Nivel 3: Componentes (Component Specific)

**Objetivo**: Alias específicos para componentes complejos, facilita tematización.

```css
:root {
  /* Botones */
  --btn-primary-bg: var(--accent);
  --btn-primary-text: var(--text-1);
  --btn-radius: var(--radius-md);
  --btn-padding-y: 10px;
  --btn-padding-x: 20px;

  /* Inputs */
  --input-bg: var(--surface-1);
  --input-border: var(--border-2);
  --input-radius: var(--radius-md);
  --input-text: var(--text-1);
  --input-placeholder: var(--text-3);

  /* Cards */
  --card-bg: var(--surface-1);
  --card-border: var(--border-1);
  --card-radius: var(--radius-lg);

  /* Tables */
  --table-header-bg: var(--surface-2);
  --table-row-hover: var(--surface-1);
  --table-border: var(--border-1);
}
```

---

### Uso Correcto de Tokens

**✅ CORRECTO**:
```css
.card {
  background: var(--card-bg);      /* Usa token de componente */
  border: 1px solid var(--border-1); /* O token semántico */
  color: var(--text-1);
}
```

**❌ INCORRECTO**:
```css
.card {
  background: var(--white-alpha-06);  /* NO usar primitivos directamente */
  border: 1px solid rgba(255,255,255,0.1); /* NO hardcodear valores */
  color: #ffffff;
}
```

---

## Estados de Componentes

Todos los componentes interactivos deben implementar estados visuales claros para feedback del usuario.

### Tabla de Estados

| Estado | Descripción | Tokens Recomendados | Implementación |
|--------|-------------|---------------------|----------------|
| **Default** | Estado inicial | `--surface-1`, `--text-1` | Estado base del componente |
| **Hover** | Cursor sobre elemento | `--surface-2` | `filter: brightness(1.1)` |
| **Active** | Presionado/clickeado | `--surface-1` | `transform: scale(0.98)` |
| **Focus** | Navegación por teclado | `--focus-ring`, `--accent` | `outline: 2px solid` |
| **Disabled** | Inactivo | `--text-3`, opacidad 0.5 | `cursor: not-allowed` |
| **Loading** | Procesando | Spinner + `--text-2` | Overlay o inline spinner |
| **Error** | Error de validación | `--danger` | Borde rojo + mensaje |

### Implementación CSS Completa

```css
/* ===== BOTONES ===== */
.btn {
  /* Base */
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--btn-radius);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 44px; /* Touch target WCAG */

  /* Estados */
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

/* ===== INPUTS ===== */
.input {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  color: var(--input-text);
  padding: 10px 16px;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: var(--input-placeholder);
  }

  &:hover {
    border-color: var(--border-3);
  }

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--surface-1);
  }

  &.has-error {
    border-color: var(--danger);
  }
}

/* ===== CARDS ===== */
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--space-lg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
```

---

## Patrones de Formularios

Los formularios son componentes críticos en un ERP. Deben ser accesibles, validables y proporcionar feedback claro.

### Estructura Requerida

- ✅ **Labels visibles** — No solo placeholders (WCAG 2.1)
- ✅ **Agrupación lógica** — Campos relacionados juntos
- ✅ **Validación inline** — Feedback inmediato sin esperar submit
- ✅ **Mensajes de ayuda** — Texto de soporte cuando sea necesario
- ✅ **Campos requeridos** — Asterisco + `aria-required="true"`
- ✅ **Progreso visible** — Para formularios multi-paso
- ✅ **Autocompletado** — Atributos `autocomplete` apropiados

### Ejemplo Completo de Campo

```html
<div class="form-field">
  <label for="email" class="form-label">
    Correo electrónico <span class="required">*</span>
  </label>
  <input
    type="email"
    id="email"
    name="email"
    class="form-input"
    placeholder="ejemplo@correo.com"
    autocomplete="email"
    aria-required="true"
    aria-describedby="email-help email-error"
  />
  <span id="email-help" class="form-help">
    Usaremos este correo para notificaciones importantes
  </span>
  <span id="email-error" class="form-error" role="alert" hidden>
    Por favor ingresa un correo válido
  </span>
</div>
```

### Validación JavaScript

```javascript
/**
 * Valida un campo de formulario y muestra/oculta errores
 * @param {HTMLInputElement} input - Campo a validar
 * @returns {boolean} - true si válido, false si inválido
 */
function validateField(input) {
  const field = input.closest('.form-field');
  const errorEl = field.querySelector('.form-error');

  if (!input.validity.valid) {
    field.classList.add('has-error');
    errorEl.hidden = false;
    errorEl.textContent = getErrorMessage(input);
    return false;
  }

  field.classList.remove('has-error');
  errorEl.hidden = true;
  return true;
}

/**
 * Genera mensaje de error basado en el tipo de validación
 * @param {HTMLInputElement} input
 * @returns {string}
 */
function getErrorMessage(input) {
  if (input.validity.valueMissing) return 'Este campo es obligatorio';
  if (input.validity.typeMismatch) {
    if (input.type === 'email') return 'Ingresa un correo válido';
    if (input.type === 'url') return 'Ingresa una URL válida';
    return 'Formato inválido';
  }
  if (input.validity.tooShort) {
    return `Mínimo ${input.minLength} caracteres`;
  }
  if (input.validity.tooLong) {
    return `Máximo ${input.maxLength} caracteres`;
  }
  if (input.validity.rangeUnderflow) {
    return `El valor mínimo es ${input.min}`;
  }
  if (input.validity.rangeOverflow) {
    return `El valor máximo es ${input.max}`;
  }
  if (input.validity.patternMismatch) {
    return input.dataset.errorPattern || 'Formato no válido';
  }
  return 'Valor inválido';
}

// Uso
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.classList.contains('has-error')) {
      validateField(input);
    }
  });
});
```

### Formulario Multi-Paso

```html
<form class="multi-step-form" data-current-step="1">
  <!-- Progress Indicator -->
  <div class="form-progress">
    <div class="progress-step active" data-step="1">
      <span class="step-number">1</span>
      <span class="step-label">Información básica</span>
    </div>
    <div class="progress-step" data-step="2">
      <span class="step-number">2</span>
      <span class="step-label">Contacto</span>
    </div>
    <div class="progress-step" data-step="3">
      <span class="step-number">3</span>
      <span class="step-label">Confirmación</span>
    </div>
  </div>

  <!-- Step 1 -->
  <fieldset class="form-step" data-step="1">
    <legend class="form-legend">Información básica</legend>
    <!-- campos -->
  </fieldset>

  <!-- Step 2 -->
  <fieldset class="form-step hidden" data-step="2">
    <legend class="form-legend">Contacto</legend>
    <!-- campos -->
  </fieldset>

  <!-- Navigation -->
  <div class="form-navigation">
    <button type="button" class="btn btn-secondary" id="btn-prev">
      Anterior
    </button>
    <button type="button" class="btn btn-primary" id="btn-next">
      Siguiente
    </button>
    <button type="submit" class="btn btn-primary hidden" id="btn-submit">
      Enviar
    </button>
  </div>
</form>
```

---

## Topbar Balanceado (Golden Standard)

> **Referencia**: [`admin-master-proveedores.html`](file:///Users/lucianopieve/Documents/FormulaMid%204/pages/admin/admin-master-proveedores.html)

Para módulos con navegación tipo "hub" donde el título activo debe estar centrado, aplicar este patrón CSS que garantiza simetría visual perfecta.

### Problema

Cuando hay 3+ links a cada lado del título central, el texto de diferente longitud causa asimetría visual (ej: "Categorías" vs "POS").

### Solución CSS

```css
/* Container principal usa grid 1fr auto 1fr */
.module-scope .app-topbar {
  grid-template-columns: 1fr auto 1fr;
}

.module-scope .topbar-left { justify-self: start; }
.module-scope .topbar-right { justify-self: end; }

/* Los grupos de nav deben tener flex: 1 para ancho igual */
.module-scope .topbar-nav-split {
  display: flex;
  justify-content: center;
}

.module-scope .topbar-nav-group.left,
.module-scope .topbar-nav-group.right {
  flex: 1;
  min-width: 0;
  display: flex;
}

/* Alineación espejo para simetría visual */
.module-scope .topbar-nav-group.left {
  justify-content: flex-start;  /* Links pegados a la izquierda */
  padding-right: 16px;
}

.module-scope .topbar-nav-group.right {
  justify-content: flex-end;    /* Links pegados a la derecha */
  padding-left: 16px;
}

.module-scope .topbar-nav-group.center {
  flex: 0 0 auto;
}
```

### Estructura HTML Requerida

```html
<nav class="topbar-center topbar-nav-split">
  <div class="topbar-nav-group left">
    <button class="topbar-link is-fade-1">Link 1</button>
    <button class="topbar-link is-fade-2">Link 2</button>
  </div>
  <div class="topbar-nav-group center">
    <button class="topbar-link is-center active">Título Activo</button>
  </div>
  <div class="topbar-nav-group right">
    <button class="topbar-link is-fade-1">Link 3</button>
    <button class="topbar-link is-fade-2">Link 4</button>
  </div>
</nav>
```

### Métricas de Validación

| Métrica | Aceptable |
|:--------|:----------|
| Offset del título respecto al centro del viewport | < 2px |
| Diferencia de ancho entre grupos left/right | 0px (flex: 1) |
| Asimetría de gaps (left gap vs right gap) | < 2px |

---

## Navegación Accesible

La navegación por teclado es fundamental para accesibilidad y eficiencia en un ERP.

### Requisitos WCAG 2.1

| Criterio | Implementación | Nivel WCAG |
|----------|----------------|------------|
| **Orden de tabulación** | `tabindex` lógico, flujo natural HTML | A |
| **Skip links** | Link oculto para saltar navegación | A |
| **Landmarks ARIA** | `header`, `nav`, `main`, `aside`, `footer` | A |
| **Navegación por teclado** | Todas las funciones accesibles sin mouse | A |
| **Focus trap** | En modales y overlays activos | A |
| **Breadcrumbs** | Para jerarquía compleja | AA |
| **Página actual** | Visual + `aria-current="page"` | AA |
| **Focus visible** | Outline mínimo 2px | AA |

### Skip Link Implementation

```html
<a href="#main-content" class="skip-link">
  Saltar al contenido principal
</a>

<header><!-- navegación --></header>

<main id="main-content">
  <!-- contenido -->
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  z-index: 9999;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
```

### Landmarks Correctos

```html
<body>
  <a href="#main-content" class="skip-link">Saltar al contenido</a>

  <header role="banner">
    <nav role="navigation" aria-label="Principal">
      <ul>
        <li><a href="/" aria-current="page">Inicio</a></li>
        <li><a href="/productos">Productos</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content" role="main">
    <h1>Título principal</h1>
    <!-- contenido -->
  </main>

  <aside role="complementary" aria-label="Filtros">
    <!-- filtros/sidebar -->
  </aside>

  <footer role="contentinfo">
    <!-- pie de página -->
  </footer>
</body>
```

### Focus Trap en Modales

```javascript
/**
 * Implementa focus trap en un modal
 * @param {HTMLElement} modal - Elemento modal
 */
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });

  // Focus primer elemento al abrir
  firstElement.focus();
}

// Uso
const modal = document.getElementById('modal');
modal.addEventListener('show', () => trapFocus(modal));
```

---

## Mensajes de Error

Los mensajes de error son críticos para la experiencia del usuario. Deben ser claros, específicos y accesibles.

### Principios de Diseño

1. **Lenguaje claro** — Explicar qué salió mal en términos comprensibles
2. **Soluciones específicas** — Indicar cómo corregir el problema
3. **Múltiples indicadores** — Color + icono + texto (no solo color)
4. **Posicionamiento** — Cerca del campo/acción afectada
5. **Persistencia** — Visibles hasta ser corregidos
6. **Resumen de errores** — Lista al inicio para múltiples errores

### Roles ARIA para Errores

```html
<!-- Para errores críticos que necesitan atención inmediata -->
<div role="alert" aria-live="assertive" class="alert alert-danger">
  <strong>Error:</strong> No se pudo guardar. Revise los campos marcados.
</div>

<!-- Para actualizaciones de estado menos urgentes -->
<div aria-live="polite" class="alert alert-info">
  3 campos requieren corrección
</div>

<!-- Para notificaciones de éxito -->
<div role="status" aria-live="polite" class="alert alert-success">
  ✓ Guardado exitosamente
</div>
```

### Componente de Mensaje de Error

```html
<div class="error-message" role="alert">
  <svg class="error-icon" aria-hidden="true" width="24" height="24">
    <use href="#icon-error"></use>
  </svg>
  <div class="error-content">
    <strong class="error-title">No se pudo guardar el formulario</strong>
    <p class="error-description">
      El campo "correo" tiene un formato inválido.
      Ejemplo válido: usuario@dominio.com
    </p>
    <button class="error-action">Ver detalles</button>
  </div>
  <button class="error-dismiss" aria-label="Cerrar mensaje">×</button>
</div>
```

```css
.error-message {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 4px solid var(--danger);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.error-icon {
  color: var(--danger);
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-title {
  color: #991b1b;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.error-description {
  color: #7f1d1d;
  margin: 0;
  line-height: 1.5;
}

.error-action {
  margin-top: 8px;
  padding: 4px 12px;
  background: transparent;
  color: #991b1b;
  border: 1px solid #991b1b;
  border-radius: 4px;
  cursor: pointer;
}

.error-dismiss {
  background: transparent;
  border: none;
  color: #7f1d1d;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
```

### Resumen de Errores (Múltiples Campos)

```html
<div class="error-summary" role="alert" aria-labelledby="error-summary-title">
  <h3 id="error-summary-title" class="error-summary-title">
    Se encontraron 3 errores en el formulario
  </h3>
  <ul class="error-summary-list">
    <li>
      <a href="#email">Correo electrónico: formato inválido</a>
    </li>
    <li>
      <a href="#telefono">Teléfono: campo obligatorio</a>
    </li>
    <li>
      <a href="#direccion">Dirección: mínimo 10 caracteres</a>
    </li>
  </ul>
</div>
```

---

## Componentes Específicos FormulaMid

### Cards de Producto

```html
<article class="product-card">
  <div class="product-image">
    <img
      src="/images/producto.jpg"
      alt="Coca Cola 500ml"
      loading="lazy"
      width="300"
      height="300"
    />
    <span class="product-badge">Nuevo</span>
  </div>
  <div class="product-info">
    <h3 class="product-name">Coca Cola 500ml</h3>
    <p class="product-category">Bebidas</p>
    <p class="product-price">$12.500</p>
    <span class="product-stock status-pill status-success">
      En stock: 15 unidades
    </span>
  </div>
  <div class="product-actions">
    <button class="btn btn-primary btn-sm">Agregar al pedido</button>
    <button class="btn btn-ghost btn-sm">Ver detalles</button>
  </div>
</article>
```

### Tabla de Datos Accesible

```html
<div class="table-container" role="region" aria-label="Lista de productos" tabindex="0">
  <table class="data-table">
    <caption class="visually-hidden">
      Lista de productos con precios y stock disponible
    </caption>
    <thead>
      <tr>
        <th scope="col">
          <button class="th-sort" data-sort="nombre">
            Producto
            <svg class="sort-icon" aria-hidden="true">↕</svg>
          </button>
        </th>
        <th scope="col">Categoría</th>
        <th scope="col" class="text-right">Precio</th>
        <th scope="col" class="text-right">Stock</th>
        <th scope="col">Acciones</th>
      </tr>
    </thead>
    <tbody id="table-body">
      <tr>
        <td class="cell-strong">Coca Cola 500ml</td>
        <td>Bebidas</td>
        <td class="text-right">$12.500</td>
        <td class="text-right">
          <span class="status-pill status-success">15</span>
        </td>
        <td>
          <button class="btn btn-ghost btn-sm">Editar</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Pills de Estado

```html
<!-- Estados de disponibilidad -->
<span class="status-pill status-success">Activo</span>
<span class="status-pill status-error">Inactivo</span>
<span class="status-pill status-warning">Pendiente</span>
<span class="status-pill status-neutral">Sin asignar</span>

<!-- Contadores en tabs -->
<button class="tab-chip active">
  Total <span class="chip-count">24</span>
</button>
```

```css
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}

.status-pill.status-success {
  background: rgba(48, 209, 88, 0.15);
  color: var(--success);
}

.status-pill.status-error {
  background: rgba(255, 69, 58, 0.15);
  color: var(--danger);
}

.status-pill.status-warning {
  background: rgba(255, 159, 10, 0.15);
  color: var(--warning);
}

.status-pill.status-neutral {
  background: var(--surface-2);
  color: var(--text-2);
}
```

---

## Matriz de Implementación por Módulo

Estado de adopción de componentes estándar en los módulos del sistema.

### Leyenda

- ✅ **Completado**: Implementa correctamente el estándar
- ⚠️ **Parcial**: Implementa pero con desviaciones menores
- ❌ **No Cumple**: No implementa o tiene desviaciones mayores
- ⏳ **Pendiente**: Requiere migración completa

### Módulos Admin Master

| Módulo | Layout PC | TableShell | FilterBar | SlidePanel | Overlays | Estado |
|--------|-----------|------------|-----------|------------|----------|--------|
| **Proveedores** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ GOLDEN STANDARD |
| **Categorías** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Compliant |
| **SKU** | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ⏳ Requiere overlays |
| **POS** | ✅ | ⚠️ | ❌ | ✅ | ❌ | ⏳ Requiere FilterBar |
| **Tarifario** | ✅ | ✅ | ❌ | ✅ | ❌ | ⏳ Requiere FilterBar |

### Módulos Admin Soporte

| Módulo | Layout PC | TableShell | FilterBar | Panel/Modal | Overlays | Estado |
|--------|-----------|------------|-----------|-------------|----------|--------|
| **Stock** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ JS Legacy |
| **Solicitudes** | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ⚠️ Deuda técnica |
| **Stock Ajustes** | ✅ | N/A | ⚠️ | ❌ | ❌ | ⏳ Form-based |
| **Pagos** | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⏳ Múltiples tablas |
| **Reportes** | ✅ | ❌ | ⚠️ | ❌ | ❌ | ⏳ Custom tables |
| **Workdays** | ✅ | ✅ | ❌ | ✅ | ⚠️ | ⏳ Sin filtros |

### Módulos Operativo

| Módulo | Layout PC | TableShell | FilterBar | Panel/Modal | Overlays | Estado |
|--------|-----------|------------|-----------|-------------|----------|--------|
| **Operativo Proveedores** | ✅ | ⚠️ | ❌ | ✅ | ❌ | ⏳ Pendiente |
| **Operativo SKU** | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⏳ Pendiente |
| **Operativo Stock** | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ⏳ Pendiente |
| **Operativo Solicitudes** | ✅ | ❌ | ⚠️ | ⚠️ | ⚠️ | ⏳ Pendiente |
| **Operativo Análisis** | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | ⏳ Pendiente |

### Módulos Logística

| Módulo | Layout PC | TableShell | FilterBar | Panel/Modal | Overlays | Estado |
|--------|-----------|------------|-----------|-------------|----------|--------|
| **Logística Stock** | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ⏳ Pendiente |
| **Logística Recepción** | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ | ⏳ Pendiente |
| **Logística Distribución** | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ | ⏳ Pendiente |

### Otros Módulos

| Módulo | Layout PC | TableShell | FilterBar | Panel/Modal | Overlays | Estado |
|--------|-----------|------------|-----------|-------------|----------|--------|
| **CMS Members** | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ CSS phantom classes |
| **Herramientas Análisis** | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | ⏳ Pendiente |

### Resumen General

- **Total Módulos**: 26
- **✅ Compliant**: 2 (8%)
- **⚠️ Parcial**: 8 (31%)
- **⏳ Pendiente**: 16 (61%)

**Prioridad de Migración (Sprint UI P1)**:
1. Admin Master POS + Tarifario (agregar FilterBar + Overlays)
2. Admin Master SKU (agregar Overlays estándar)
3. Admin Stock + Solicitudes (migrar a Async IIFE)
4. Operativo Master (alinear con Admin)
5. Logística (normalizar componentes)

---

## Checklist de Implementación

Use esta lista al crear o refactorizar componentes:

### Accesibilidad (WCAG 2.1 AA)

- [ ] **Semántica HTML correcta** — Usar elementos nativos antes de ARIA
- [ ] **Contraste de colores** — Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- [ ] **Tamaño de fuente** — Mínimo 16px para texto principal
- [ ] **Áreas táctiles** — Mínimo 44x44px en dispositivos touch (WCAG 2.5.5)
- [ ] **Labels y descripciones** — Todo control interactivo debe tener label o aria-label
- [ ] **Textos alternativos** — `alt` descriptivo para imágenes informativas, vacío para decorativas
- [ ] **Navegación por teclado** — Tab, Enter, Escape, Arrow keys funcionales
- [ ] **Focus visible** — Outline de 2px mínimo, nunca `outline: none` sin reemplazo
- [ ] **Focus trap** — En modales y overlays activos
- [ ] **Landmarks ARIA** — `header`, `nav`, `main`, `aside`, `footer`
- [ ] **Skip links** — Para saltar navegación repetitiva
- [ ] **Roles ARIA apropiados** — `role="alert"`, `aria-live`, `aria-current`, etc.

### Estados Visuales

- [ ] **Default** — Estado base definido
- [ ] **Hover** — Feedback visual al pasar el mouse
- [ ] **Active** — Feedback al hacer clic
- [ ] **Focus** — Indicador visible para navegación por teclado
- [ ] **Disabled** — Opacidad 0.5 + `cursor: not-allowed`
- [ ] **Loading** — Spinner o skeleton loader
- [ ] **Error** — Color + icono + texto (no solo color)
- [ ] **Success** — Confirmación visual clara

### Formularios

- [ ] **Labels visibles** — No solo placeholders
- [ ] **Campos requeridos** — Asterisco + `aria-required="true"`
- [ ] **Validación inline** — Feedback sin esperar submit
- [ ] **Mensajes de error** — Específicos y accionables
- [ ] **Mensajes de ayuda** — Cuando sea necesario
- [ ] **Autocompletado** — Atributos `autocomplete` apropiados
- [ ] **Agrupación lógica** — `<fieldset>` y `<legend>` donde aplique

### Performance

- [ ] **Debounce en búsqueda** — 150-200ms
- [ ] **Lazy loading de imágenes** — `loading="lazy"`
- [ ] **Virtualización** — Para listas grandes (>100 items)
- [ ] **Async/await** — IIFE pattern para scripts
- [ ] **Evitar layout shifts** — Overlays estáticos en HTML

### Responsive

- [ ] **Breakpoints** — Mobile (<600px), Tablet (600-1024px), Desktop (>1024px)
- [ ] **Touch targets** — Espaciado adecuado en mobile
- [ ] **Scroll interno** — TableShell en desktop, scroll natural en mobile
- [ ] **Stack layout** — Columnas se apilan en mobile

### Tokens y Estilos

- [ ] **Usar tokens semánticos** — No primitivos ni hardcoded
- [ ] **No estilos inline** — Todo en CSS (excepto dinámicos)
- [ ] **Transiciones suaves** — `transition: all 0.2s ease`
- [ ] **Consistencia visual** — Spacing, radius, colores según sistema

---

## Referencias

### Documentación Oficial

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — Accesibilidad web
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) — Guías de accesibilidad
- [A11y Style Guide](https://a11y-style-guide.com/style-guide/) — Patrones accesibles
- [Inclusive Components](https://inclusive-components.design/) — Componentes inclusivos
- [W3C DTCG](https://www.w3.org/community/design-tokens/) — Estándar de Design Tokens

### Herramientas

- [axe DevTools](https://www.deque.com/axe/devtools/) — Auditoría de accesibilidad
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) — Auditoría de performance y accesibilidad
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/) — Verificar contraste WCAG

### Documentos Relacionados

- [Plan UI/UX](/docs/architecture/ui-standards.md) — Estándares y roadmap de implementación
- [Reglas de Frontend](/docs/rules/frontend.md) — Reglas de desarrollo frontend
- [Esquema de Base de Datos](/docs/scheme.md) — Estructura de datos

---

**Última Actualización**: 2026-01-29
**Mantenedores**: Equipo Frontend FormulaMid
**Versión del Sistema de Componentes**: 2.0 (Post Sprint UI P1)
