UI/UX Golden Standard Reference

## Admin Herramientas - Pattern Library

**Last Updated**: 2026-02-05 (Phase 5 Complete)
**Reference File**: `pages/admin/admin-herramientas.html`
**Status**: ✅ Zero Inline CSS | ✅ UI/UX Consistency | ✅ CSS Architecture | ✅ Accessibility

---

## Overview

This document defines the golden standard UI/UX patterns established in `admin-herramientas.html`. All new pages and components should follow these patterns for consistency.

---

## Design Tokens (tokens.css)

### Color System - Zinc Palette

```css
/* Backgrounds */
--bg-body: #000000           /* Pure black */
--bg-surface: #000000        /* Pure black */
--bg-elevated: #18181b       /* Elevated surfaces */

/* Text */
--text-primary: #ffffff      /* Primary text */
--text-secondary: #d4d4d8    /* Secondary text */
--text-tertiary: #a1a1aa     /* Tertiary/muted text */

/* Borders */
--border-subtle: rgba(255, 255, 255, 0.10)
--border-active: rgba(255, 255, 255, 0.20)

/* Accents */
--brand-primary: #ffffff     /* White for primary actions */
--success: #4ade80
--warning: #fbbf24
--danger: #f87171
```

### Spacing System

```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
```

### Border Radius

```css
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 10px
--radius-xl: 12px
```

---

## Layout & Spacing Guidelines (Critical)
 
 ### Page Shell
 - **Class**: `.page-shell`
 - **Usage**: Top-level container for page content.
 - **Padding**: Should generally avoid massive global padding if using full-width cards, but **Main Content** containers typically require `0 24px` horizontal padding to align with the Topbar and logo.
 - **Header Alignment**: When placing the `.dashboard-header` outside a card, verify it has `padding: 0 24px` to visually align with the Breadcrumbs/Logo above.

 ---

 ## Component Patterns

### 1. Dashboard Header with Tabs

**Usage**: Page titles with action buttons and tab navigation

```html
<div class="dashboard-header align-start">
  <div>
    <h2 class="dashboard-title dashboard-title-soft">Gestión de Inventario</h2>
    <p class="dashboard-subtitle dashboard-subtitle-soft">Control de stock, SKUs y análisis de consumo</p>
  </div>
  <div class="actions-bar">
    <div class="tab-bar" id="main-tabs">
      <button class="tab-chip active" data-tab="stock">Stock</button>
      <button class="tab-chip" data-tab="recetas">Recetas</button>
      <button class="tab-chip" data-tab="rentabilidad">Rentabilidad</button>
    </div>
    <button class="btn-icon btn-icon-flat btn-icon-plus" id="btn-new" aria-label="Nuevo">+</button>
  </div>
</div>
```

**CSS Classes**:

- `.dashboard-header` - Container for page header
- `.align-start` - Aligns items to start (top)
- `.dashboard-title-soft` - Softer title styling
- `.dashboard-subtitle-soft` - Subtle subtitle
- `.actions-bar` - Container for buttons and tabs
- `.tab-bar` - Tab container
- `.tab-chip` - Individual tab button
- `.active` - Active tab state

---

### 2. Summary Metrics Cards

**Usage**: Display key performance indicators at the top of the page

```html
<div class="summary-metrics-container">
  <div class="summary-metrics-grid">
    <div class="summary-metric-card">
      <div class="summary-metric-label">Total Valorizado</div>
      <div class="summary-metric-value summary-metric-primary">$1.208.829,01</div>
    </div>
    <div class="summary-metric-card">
      <div class="summary-metric-label">Stock Activo</div>
      <div class="summary-metric-value summary-metric-success">$784.344,01</div>
    </div>
    <div class="summary-metric-card">
      <div class="summary-metric-label">Stock Inactivo</div>
      <div class="summary-metric-value summary-metric-tertiary">$424.485,00</div>
    </div>
  </div>
</div>
```

**CSS Classes**:

- `.summary-metrics-container` - Outer wrapper
- `.summary-metrics-grid` - 3-column grid layout
- `.summary-metric-card` - Individual metric card
- `.summary-metric-label` - Small uppercase label
- `.summary-metric-value` - Large number display
- `.summary-metric-primary` - Purple accent (var(--purple-400))
- `.summary-metric-success` - White accent
- `.summary-metric-tertiary` - Gray accent

---

### 3. Sidebar Filter Panel

**Usage**: Collapsible sidebar with filters and controls

```html
<aside class="sidebar-filters">
  <h4 class="sidebar-section-title">Filtros</h4>

  <!-- Date Range -->
  <div class="date-range-inline">
    <input type="date" id="filter-date-start" class="input">
    <span class="date-separator">-</span>
    <input type="date" id="filter-date-end" class="input">
  </div>

  <!-- Aforo -->
  <div class="aforo-row">
    <input type="number" id="people-count" class="input" value="500">
    <span class="aforo-label">personas</span>
    <span class="tooltip-trigger" data-tooltip="Descripción">?</span>
  </div>

  <!-- Section with border -->
  <div class="sidebar-section">
    <h4 class="sidebar-section-title">Importar</h4>
    <!-- Content -->
  </div>
</aside>
```

**CSS Classes**:

- `.sidebar-filters` - Main sidebar container
- `.sidebar-section-title` - Small uppercase section header
- `.sidebar-section` - Section with top border and spacing
- `.date-range-inline` - Inline date picker row
- `.aforo-row` - Compact number input with label
- `.tooltip-trigger` - Question mark icon with tooltip

---

### 4. Chart Section with KPIs

**Usage**: Chart display with dropdown selector and KPI cards

```html
<div class="chart-section">
  <div class="chart-header">
    <div class="custom-dropdown" id="chart-mode-dropdown">
      <div class="custom-dropdown-trigger">
        <span class="custom-dropdown-text">Consumo vs Recaudación</span>
        <svg class="custom-dropdown-icon" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="custom-dropdown-menu">
        <div class="custom-dropdown-option" data-value="option1">Opción 1</div>
        <div class="custom-dropdown-option" data-value="option2">Opción 2</div>
      </div>
    </div>
  </div>

  <div class="chart-kpis-grid">
    <div class="chart-kpi-card">
      <div class="chart-kpi-label-row">
        <p class="chart-kpi-label">Costo Consumo</p>
        <span class="chart-kpi-trend trend-up">+2442.8%</span>
      </div>
      <p class="chart-kpi-value chart-kpi-warning">$7.399.077,54</p>
    </div>
  </div>

  <canvas id="chart" class="chart-canvas-max"></canvas>
</div>
```

**CSS Classes**:

- `.chart-section` - Chart container with gradient background
- `.chart-header` - Header with dropdown
- `.custom-dropdown` - Custom styled dropdown
- `.custom-dropdown-trigger` - Clickable dropdown button
- `.custom-dropdown-menu` - Dropdown menu container
- `.custom-dropdown-option` - Individual menu option
- `.chart-kpis-grid` - 3-column KPI grid
- `.chart-kpi-card` - Individual KPI card
- `.chart-kpi-label` - Small uppercase label
- `.chart-kpi-value` - Large number
- `.chart-kpi-warning` - Warning color (yellow)
- `.chart-kpi-success` - Success color (green)
- `.chart-kpi-trend` - Trend indicator badge

---

### 5. Filter Bar with Pills

**Usage**: Horizontal filter bar with category pills and search

```html
<div class="sku-filter-bar">
  <!-- Category Pills -->
  <div class="pill-group" id="category-pills">
    <button class="pill is-active" data-category="all">Todas</button>
    <button class="pill" data-category="bebidas">Bebidas</button>
    <button class="pill" data-category="insumos">Insumos</button>
  </div>

  <div class="filter-spacer"></div>

  <!-- Status Toggle -->
  <button class="status-toggle-btn" data-status="active">
    <span class="status-toggle-label">Activos</span>
    <span class="status-indicator status-active"></span>
  </button>

  <!-- Search -->
  <div class="search-input-wrap">
    <svg class="search-icon" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
    <input type="text" class="input search-input" placeholder="Buscar...">
  </div>

  <!-- Counter -->
  <span class="filter-counter">
    <span id="filter-count">34</span> SKUs
  </span>
</div>
```

**CSS Classes**:

- `.sku-filter-bar` - Main filter bar container
- `.pill-group` - Group of pill buttons
- `.pill` - Individual pill button
- `.is-active` - Active pill state (white bg, black text)
- `.filter-spacer` - Flex spacer
- `.status-toggle-btn` - Status toggle button
- `.status-indicator` - Colored dot indicator
- `.search-input-wrap` - Search input wrapper with icon
- `.filter-counter` - Results counter

---

### 6. Data Table with Sorting

**Usage**: Sortable data table with sticky header

```html
<div class="table-viewport table-shell sku-table-container">
  <div class="table-scroll">
    <table class="table table-sticky table-compact sku-table">
      <thead>
        <tr class="table-head">
          <th class="table-cell is-header cell-pad sortable" data-sort="nombre" tabindex="0">
            Nombre <span class="sort-icon"></span>
          </th>
          <th class="table-cell is-header cell-pad text-right sortable" data-sort="stock" tabindex="0">
            Stock <span class="sort-icon"></span>
          </th>
          <th class="table-cell is-header cell-pad text-center">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody id="table-body">
        <tr data-sku-id="123">
          <td class="table-cell cell-pad">Red Bull Lata 250ml</td>
          <td class="table-cell cell-pad text-right">150</td>
          <td class="table-cell cell-pad text-center">
            <button class="btn-icon" aria-label="Editar">✎</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**CSS Classes**:

- `.table-viewport` - Outer viewport container
- `.table-shell` - Table wrapper
- `.table-scroll` - Scrollable inner container
- `.table` - Base table class
- `.table-sticky` - Sticky header behavior
- `.table-compact` - Reduced padding variant
- `.table-head` - Header row
- `.table-cell` - All table cells
- `.is-header` - Header cell styling
- `.cell-pad` - Standard padding
- `.sortable` - Sortable column
- `.sort-icon` - Sort indicator
- `.text-right` - Right-aligned text
- `.text-center` - Center-aligned text

**Advanced Guidelines for Wide Tables**:

- **Structure**: Always use `table-viewport > table-shell > table-scroll > table`.
- **Layout**: Use `table-layout: fixed` for predictable column widths.
- **Visuals**:
  - `<th>`: Background `rgba(0,0,0,0.6)` for contrast.
  - **Inactive Rows**: Apply opacity (0.5) instead of badges.
  - **Hero Cards**: Max-width ~1400px for large data grids.

---

### 7. Modal Dialog (Native `<dialog>`)

**Usage**: Modal dialogs with native HTML dialog element

```html
<dialog id="myModal" class="modal">
  <div class="modal-content modal-content-md">
    <div class="modal-header">
      <h3 class="modal-title">Modal Title</h3>
      <button class="modal-close" onclick="this.closest('dialog').close()">×</button>
    </div>
    <div class="modal-body">
      <!-- Modal content -->
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="this.closest('dialog').close()">Cancelar</button>
      <button class="btn-primary" id="btn-confirm">Confirmar</button>
    </div>
  </div>
</dialog>
```

**CSS Classes**:

- `.modal` - Applied to `<dialog>` element
- `.modal-content` - Inner content container
- `.modal-content-md` - Medium size (520px)
- `.modal-content-lg` - Large size (800px)
- `.modal-content-xl` - Extra large (900px)
- `.modal-content-imports` - Custom imports size (800px, 80vh)
- `.modal-header` - Header with title and close button
- `.modal-title` - Modal title
- `.modal-close` - Close button (×)
- `.modal-body` - Scrollable body content
- `.modal-body-imports` - Custom imports body (65vh)
- `.modal-footer` - Footer with action buttons

---

### 8. Slide Panel

**Usage**: Side panel that slides in from the right

```html
<div class="panel-overlay" id="panel-overlay"></div>
<aside class="slide-panel" id="slide-panel">
  <div class="panel-header">
    <h3 class="panel-title">Panel Title</h3>
    <button class="panel-close" id="btn-close-panel">×</button>
  </div>
  <div class="panel-body">
    <!-- Panel content -->
  </div>
  <div class="panel-footer">
    <button class="btn-secondary">Cancelar</button>
    <button class="btn-primary">Guardar</button>
  </div>
</aside>
```

**CSS Classes**:

- `.panel-overlay` - Dark backdrop overlay
- `.slide-panel` - Panel container (480px width)
- `.open` or `.active` - Open state
- `.panel-header` - Panel header
- `.panel-title` - Panel title
- `.panel-close` - Close button
- `.panel-body` - Scrollable body
- `.panel-footer` - Fixed footer with buttons

---

### 9. Button System

**Primary Button** (White bg, black text):

```html
<button class="btn-primary">Guardar</button>
```

**Secondary Button** (Transparent with border):

```html
<button class="btn-secondary">Cancelar</button>
```

**Ghost Button** (Transparent, no border):

```html
<button class="btn-ghost">Ver más</button>
```

**Icon Button** (Square with border):

```html
<button class="btn-icon btn-icon-plus" aria-label="Nuevo">+</button>
```

**Danger Button** (Red background):

```html
<button class="btn-danger">Eliminar</button>
```

---

### 10. Dropbox Upload Zone (Import Pattern)

**Usage**: File upload drag-and-drop zones within sidebar (replaces modal-based import)

```html
<div class="sidebar-section">
  <h4 class="sidebar-section-title">Importar</h4>
  <div class="dropbox-grid-2">
    <div class="dropbox-zone" id="dropbox-consumption">
      <input type="file" id="file-consumption" class="hidden" accept=".xlsx, .xls">
      <svg class="dropbox-icon" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <span class="dropbox-title">Consumo</span>
      <span class="dropbox-subtitle">Excel/CSV</span>
    </div>
    <div class="dropbox-zone" id="dropbox-revenue">
      <input type="file" id="file-revenue" class="hidden" accept=".xlsx, .xls">
      <svg class="dropbox-icon" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <span class="dropbox-title">Recaudación</span>
      <span class="dropbox-subtitle">Excel/CSV</span>
    </div>
  </div>
</div>
```

**CSS Classes**:

- `.dropbox-grid-2` - 2-column grid for dropboxes
- `.dropbox-zone` - Upload zone container
- `.dropbox-icon` - Upload icon (SVG)
- `.dropbox-title` - Zone label
- `.dropbox-subtitle` - Subtitle text (e.g., "Excel/CSV")
- `.is-dragover` - State when dragging file over
- `.dropbox-file-selected` - State when file is selected

**Best Practice**:

- Place dropboxes in sidebar sections rather than modals for better UX
- Use `.sidebar-section` wrapper with `.sidebar-section-title` for consistency
- Dropboxes trigger immediate processing callbacks via `setupDropbox()` JS helper

---

### 11. Tab Content Pattern - Recipes (Recetas)

**Usage**: Tab content with sidebar filters, stats, and data table

```html
<div class="tab-content" data-tab="recetas">
  <div class="grid-sidebar-main">
    <!-- Sidebar with filters and collapsible stats -->
    <aside class="sidebar-filters">
      <h4 class="sidebar-section-title">Filtros</h4>
      <div class="sidebar-actions">
        <button class="btn-secondary btn-sm">Limpiar</button>
        <button class="btn-primary btn-sm">Aplicar</button>
      </div>

      <!-- Collapsible Stats -->
      <div class="sidebar-section">
        <div class="stats-header" id="stats-toggle">
          <h4 class="sidebar-section-title">Estadísticas</h4>
          <svg class="toggle-icon" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="stats-body" id="stats-body">
          <div class="stats-compact">
            <div class="stat-item">
              <span class="stat-label">Total Recetas</span>
              <span class="stat-value">124</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Activas</span>
              <span class="stat-value">98</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content with table -->
    <div class="main-content-area">
      <div class="table-viewport table-shell">
        <div class="table-scroll">
          <table class="table table-sticky table-compact" role="table" aria-label="Tabla de recetas">
            <thead>
              <tr role="row">
                <th class="table-cell is-header cell-pad" role="columnheader" scope="col">Nombre</th>
                <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Ingredientes</th>
                <th class="table-cell is-header cell-pad text-center" role="columnheader" scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody id="recipes-table-body">
              <!-- Dynamic rows -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Key Classes**:

- `.grid-sidebar-main` - Sidebar + main grid layout
- `.sidebar-filters` - Sidebar container
- `.sidebar-actions` - Button group in sidebar
- `.stats-header` - Collapsible stats header
- `.toggle-icon` - Chevron icon for collapse/expand
- `.stats-body` - Collapsible stats content
- `.stats-compact` - Compact stats list
- `.stat-item`, `.stat-label`, `.stat-value` - Stat components
- `.table table-sticky table-compact` - Consistent table pattern
- ARIA roles: `role="table"`, `role="row"`, `role="columnheader"`, `scope="col"`

---

### 12. Tab Content Pattern - Profitability (Rentabilidad)

**Usage**: Tab content with summary metrics, filter bar, and data table

```html
<div class="tab-content active" data-tab="rentabilidad">
  <!-- Summary Metrics -->
  <div class="summary-metrics-container">
    <div class="summary-metrics-grid">
      <div class="summary-metric-card">
        <div class="summary-metric-label">Recaudación Total</div>
        <div class="summary-metric-value summary-metric-success">$2.450.320</div>
      </div>
      <div class="summary-metric-card">
        <div class="summary-metric-label">Costo Total</div>
        <div class="summary-metric-value summary-metric-warning">$980.450</div>
      </div>
      <div class="summary-metric-card">
        <div class="summary-metric-label">Margen Neto</div>
        <div class="summary-metric-value summary-metric-primary">60%</div>
      </div>
    </div>
  </div>

  <!-- Filter Bar with Search -->
  <div class="sku-filter-bar">
    <div class="search-input-wrap">
      <svg class="search-icon" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" class="input search-input" placeholder="Buscar receta...">
    </div>

    <select class="rentability-select" id="filter-recipe-category">
      <option value="">Todas las categorías</option>
      <option value="tragos">Tragos</option>
      <option value="comida">Comida</option>
    </select>

    <div class="filter-spacer"></div>

    <span class="filter-counter">
      <span id="recipe-count">45</span> recetas
    </span>
  </div>

  <!-- Data Table -->
  <div class="table-viewport table-shell">
    <div class="table-scroll">
      <table class="table table-sticky table-compact" role="table" aria-label="Tabla de rentabilidad">
        <thead>
          <tr role="row">
            <th class="table-cell is-header cell-pad" role="columnheader" scope="col">Receta</th>
            <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Precio Venta</th>
            <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Costo</th>
            <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Margen %</th>
          </tr>
        </thead>
        <tbody id="profitability-table-body">
          <!-- Dynamic rows -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

**Key Classes**:

- `.summary-metrics-container` / `.summary-metrics-grid` - Top metrics section
- `.summary-metric-card`, `.summary-metric-label`, `.summary-metric-value` - Metric components
- `.summary-metric-primary` / `.summary-metric-success` / `.summary-metric-warning` - Color variants
- `.sku-filter-bar` - Horizontal filter bar
- `.search-input-wrap` + `.search-icon` - Search with icon
- `.rentability-select` - Custom select for rentability tab (compact, 32px height)
- `.filter-spacer` - Flex spacer to push counter right
- `.filter-counter` - Results counter
- ARIA roles for table accessibility

**Pattern Notes**:

- Rentabilidad tab uses summary metrics at top (not sidebar stats)
- Filter bar uses search + select + counter pattern
- Table follows same `.table-sticky table-compact` pattern as other tabs

---

## Utility Classes

### Visibility

```css
.u-hidden       /* display: none !important */
.u-visible      /* display: block !important */
```

### Spacing

```css
.form-group-spaced-top    /* margin-top: 24px */
```

### Text Alignment

```css
.text-center              /* text-align: center */
.text-right               /* text-align: right */
.text-center-muted        /* center + tertiary color */
.table-cell-center-muted  /* for table cells */
```

### Layout

```css
.grid-sidebar-main        /* Sidebar (280px) + main (1fr) */
.filter-spacer            /* flex: 1 spacer */
```

---

## Architectural Patterns by Role

### 1. Managers (Encargados)
- **Pattern**: Master-Detail + Real-time Status Pills
- **Goal**: "Eyes on venue, hands on app" (High visibility)
- **Modules**: `barra-personal`, `caja-noche`, `recepcion`

### 2. Operations (Operativo ERP)
- **Pattern**: View-based Architecture (`vw_stock_global`)
- **Goal**: Decouple UI from inventory calculations
- **Modules**: `stock`, `solicitudes`, `análisis`

### 3. Staff
- **Pattern**: Wizard Step-by-Step
- **Goal**: Reduce human error with clear milestones
- **Modules**: `caja-index`, `barra-index`

---

## State Classes

Use these semantic state classes:

```css
.is-active       /* Active tab, pill, etc. */
.is-open         /* Open dropdown, menu */
.is-visible      /* Visible overlay */
.is-dragover     /* Dragging file over dropzone */
.has-file        /* Dropzone with selected file */
.active          /* Alternative to is-active */
.open            /* Alternative to is-open */
.hidden          /* Hidden element */
```

---

## Accessibility Guidelines

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use `tabindex="0"` for custom interactive elements
- Implement keyboard handlers for Enter and Space keys

### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--accent-focus);
  outline-offset: 2px;
}
```

### ARIA Labels

- Use `aria-label` for icon-only buttons
- Use `role="table"`, `role="row"`, etc. for semantic tables
- Provide `aria-label` for complex widgets

### Color Contrast

- Text on dark backgrounds: minimum WCAG AA compliance
- Primary text: #ffffff (21:1 ratio)
- Secondary text: #d4d4d8 (15:1 ratio)
- Tertiary text: #a1a1aa (9:1 ratio)

---

## Animation Guidelines

### Transitions

Use consistent timing function:

```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects

```css
/* Subtle lift on hover */
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
```

### Loading States

Use `.state-spinner` for loading indicators:

```html
<div class="state-spinner"></div>
```

---

## Responsive Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */

@media (max-width: 1024px) {
  .grid-sidebar-main {
    grid-template-columns: 1fr; /* Stack sidebar */
  }
}
```

---

## CSS Architecture

### File Structure

```
assets/css/
├── tokens.css              # Design tokens (colors, spacing, etc.)
├── components.css          # Global reusable components
└── admin-herramientas.css  # Page-specific styles
```

### Naming Convention

- **BEM-lite**: `component-element-modifier`
- **State classes**: `.is-*`, `.has-*`
- **Utilities**: `.u-*`
- **Modifiers**: `--variant-name`

### Specificity Rules

1. Avoid `!important` except for utility overrides
2. Use single class selectors when possible
3. Scope page-specific styles with `body.admin-shell`
4. Descendant selectors max 3 levels deep

---

## Common Patterns Quick Reference

### Grid Layout (Sidebar + Main)

```html
<div class="grid-sidebar-main">
  <aside class="sidebar-filters">...</aside>
  <div class="main-content-area">...</div>
</div>
```

### Collapsible Stats Section

```html
<div class="stats-header" id="stats-toggle">
  <h4 class="sidebar-section-title">Estadísticas</h4>
  <svg class="toggle-icon" viewBox="0 0 24 24">...</svg>
</div>
<div class="stats-body" id="stats-body">
  <div class="stats-compact">...</div>
</div>
```

### Ingredient Row (Dynamic Template)

```html
<template id="tpl-ingredient-row">
  <div class="ingredient-row">
    <select class="select input-sku">...</select>
    <input type="number" class="input input-amount" placeholder="0.00">
    <button class="btn-icon-flat text-error btn-remove-ing">×</button>
  </div>
</template>
```

---

---

## Technical Standards (Implementation)

Reference patterns for core module structure.

### 1. Standard HTML Anatomy

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Module Name - FormulaMid</title>
    <link rel="stylesheet" href="../../assets/css/main.css" />
  </head>
  <body class="app-shell admin-shell admin-scroll" data-allowed-roles="admin,contable">
    <!-- Topbar -->
    <header class="app-topbar">
      <div class="topbar-left">
        <nav id="breadcrumbs" class="breadcrumbs"></nav>
      </div>
      <nav class="topbar-center topbar-nav-split">
        <!-- Navigation Tabs if applicable -->
      </nav>
      <div class="topbar-right">
        <span class="system-status-pill status-open topbar-pill topbar-pill-quiet">ESTADO: OK</span>
      </div>
    </header>

    <main class="page-shell">
      <div class="page-card-wrap">
        <!-- Content -->
      </div>
    </main>

    <!-- Dependencies -->
    <script defer src="../../assets/js/core/navigation-state.js"></script>
    <script defer src="../../assets/js/core/breadcrumbs.js"></script>
    <script defer src="../../assets/js/core/navigation.js"></script>
    <script defer src="../../assets/js/modules/panel.js"></script>
    <script defer src="../../assets/js/modules/admin/admin-modulo.js"></script>

    <script>
      const breadcrumbContainer = document.getElementById("breadcrumbs");
      if (breadcrumbContainer) window.Breadcrumbs.render(breadcrumbContainer);
    </script>
  </body>
</html>
```

### 2. Standard JavaScript Pattern

All modules MUST use this IIFE async skeleton with defensive DOM grouping.

```javascript
/* Module: admin-modulo.js */
(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  const PAGE_KEY = "admin-modulo";

  // 2. DOM Elements (Grouped in 'ui')
  const ui = {
    listContainer: document.getElementById("list-container"),
    searchInput: document.getElementById("search-input"),
    pageCardLoading: document.getElementById("page-card-loading"),
    pageCardEmpty: document.getElementById("page-card-empty"),
    contentWrap: document.getElementById("module-content")
  };

  // Validation
  if (!window.Utils.assertSbOrShowBlockingError(ui.listContainer)) return;

  // 3. State
  const savedState = window.NavState ? window.NavState.restore(PAGE_KEY) : {};
  let state = {
    dataList: [],
    searchTerm: savedState.searchTerm || ""
  };

  // 4. Render
  function renderList(data) {
    if (!ui.listContainer) return;
    // ... render logic
  }

  function setPageState({ loading = false, empty = false } = {}) {
    ui.pageCardLoading?.classList.toggle("is-visible", loading);
    ui.pageCardEmpty?.classList.toggle("is-visible", empty);
    ui.contentWrap?.classList.toggle("hidden", loading || empty);
  }

  // 5. Data Fetching
  async function loadData() {
    setPageState({ loading: true });
    try {
      const { data, error } = await window.sb.from("table").select("*");
      if (error) throw error;
      state.dataList = data || [];
      
      if (state.dataList.length === 0) setPageState({ empty: true });
      else renderList(state.dataList);
      
    } catch (e) {
      console.error(e);
      window.Toast.error("Error cargando datos");
    } finally {
      ui.pageCardLoading?.classList.remove("is-visible");
    }
  }

  // 6. Init
  loadData();
})();
```

### 3. Dashboard Landing Pattern

For role-based landing pages (`admin-index`).

- **Header**: Glass effect, personalized welcome + Live KPIs.
- **Segmented Nav**: `.segmented-control` > `.segment-btn`.
- **Module Grid**: `.module-grid` > `.module-column` > `.module-card`.

---

## Implementation Checklist

When creating a new page, ensure:

- [ ] Zero inline styles
- [ ] Uses design tokens from tokens.css
- [ ] Follows component patterns from this guide
- [ ] Accessible (keyboard nav, ARIA labels)
- [ ] Responsive (tests on 768px, 1024px, 1920px)
- [ ] Consistent button styles
- [ ] Proper focus indicators
- [ ] Semantic HTML structure
- [ ] Loading and empty states
- [ ] Error handling UI

---

## Migration Guide

To apply golden standard to an existing page:

1. **Audit inline styles**: Search for `style="` in HTML
2. **Create semantic classes**: Define in page-specific CSS
3. **Replace inline styles**: Apply new classes
4. **Adopt header pattern**: Replace page header with dashboard-header
5. **Standardize buttons**: Update to btn-primary/secondary/ghost
6. **Apply table pattern**: Use table-sticky for data tables
7. **Update modals**: Use native `<dialog>` with modal-content classes
8. **Test thoroughly**: Visual regression and interaction testing

---

## Phase 2 Consistency Changes

The following standardizations were applied in Phase 2 to ensure all tabs follow the golden standard:

### Fixed Issues

1. **Duplicate `chartModal` dialog** - Removed duplicate modal declaration (kept semantic structure with modal-header)
2. **Tab Recetas sidebar** - Migrated from `card flex-col gap-4` to `sidebar-filters` pattern with proper sections
3. **Tab Recetas table** - Migrated from `data-table` to `table table-sticky table-compact` with full ARIA roles
4. **Tab Rentabilidad stats** - Migrated from `stat-card`/`stat-label`/`stat-value` to `summary-metric-*` pattern
5. **Tab Rentabilidad filter bar** - Migrated from `filter-bar filter-bar-compact` to `sku-filter-bar` with search icon
6. **Import modal removed** - Replaced with sidebar dropbox pattern (better UX, contextual)

### CSS Cleanup

- Removed duplicate declarations: `.grid-sidebar-main`, `.modal-content-lg`, `.modal-content-md`, `.icon-notification`, `.dropbox-icon`, `.dropbox-title`
- Removed unused utilities: `.sidebar-card-recipes`, `.text-tertiary`, `.font-semibold`, `.font-bold`, `.text-uppercase-tracking`, `.flex-justify-between`, `.border-t`, `.pt-4`, `.avatar-sm`, `.text-sm-tertiary`, `.flex-between-center`, `.flex-gap-2`, `.input-sku-select`, `.input-amount-sm`
- Added new styles: `.rentability-select`, `.chart-modal-hint`
- Fixed broken comment at line ~1840

### Consistency Audit Checklist

Use this checklist when reviewing or creating tabs:

**Sidebar Pattern** (when applicable):

- [ ] Uses `.sidebar-filters` as container
- [ ] Section titles use `.sidebar-section-title`
- [ ] Sections use `.sidebar-section` wrapper with border
- [ ] Stats use `.stats-compact` with `.stat-item` / `.stat-label` / `.stat-value`
- [ ] Collapsible sections use `.stats-header` with `.toggle-icon` chevron

**Summary Metrics Pattern** (when applicable):

- [ ] Uses `.summary-metrics-container` wrapper
- [ ] Grid uses `.summary-metrics-grid`
- [ ] Cards use `.summary-metric-card`
- [ ] Labels use `.summary-metric-label`
- [ ] Values use `.summary-metric-value` with color variant

**Filter Bar Pattern**:

- [ ] Uses `.sku-filter-bar` container
- [ ] Search uses `.search-input-wrap` with `.search-icon` SVG
- [ ] Spacing uses `.filter-spacer` (not manual margins)
- [ ] Counter uses `.filter-counter` with nested `<span id="count">`
- [ ] Pills use `.pill-group` with `.pill` buttons

**Data Table Pattern**:

- [ ] Wrapper uses `.table-viewport .table-shell`
- [ ] Scroll container uses `.table-scroll`
- [ ] Table uses `.table .table-sticky .table-compact`
- [ ] ARIA roles: `role="table"`, `role="row"`, `role="columnheader"`, `scope="col"`
- [ ] Headers use `.table-cell .is-header .cell-pad`
- [ ] Sortable columns use `.sortable` with `.sort-icon`
- [ ] Text alignment uses `.text-right` / `.text-center` on `<th>` and `<td>`

**Modal Pattern**:

- [ ] Uses native `<dialog>` element with `.modal` class
- [ ] Content uses `.modal-content` with size variant (`.modal-content-md`, `.modal-content-lg`, etc.)
- [ ] Header uses `.modal-header` wrapper with `.modal-title` and `.modal-close` button
- [ ] Body uses `.modal-body` (scrollable)
- [ ] Footer uses `.modal-footer` with `.btn-secondary` and `.btn-primary`

---

## Phase 4: CSS Architecture Cleanup (Complete)

**Completed**: 2026-02-05

The CSS in `admin-herramientas.css` is now organized into 10 logical FASE (phase) sections:

| FASE              | Description                   | Line Range       |
| :---------------- | :---------------------------- | :--------------- |
| **FASE 1**  | Visual hierarchy and spacing  | 36-72            |
| **FASE 2**  | Typography and readability    | 339-417          |
| **FASE 3**  | Sidebar and filters           | 824-856          |
| **FASE 4**  | Filter bar and pills          | 858-1030         |
| **FASE 5**  | Main table (Golden Standard)  | 1032-1217        |
| **FASE 6**  | Chart section                 | 436-444, 776-822 |
| **FASE 7**  | Tabs system                   | 1262-1314        |
| **FASE 8**  | Modals and panels             | 1316-1548        |
| **FASE 9**  | Buttons and actions           | 1550-1661        |
| **FASE 10** | Micro-interactions and polish | 1663-1751        |

### Benefits

- **Maintainability**: Each section is clearly labeled with `/* =========... FASE N: Title ...========= */` headers
- **Discoverability**: Easy to find styles for specific components
- **Scalability**: New styles can be added to appropriate sections
- **Consistency**: All 10 areas follow the same organizational pattern

### Unique Component Patterns

These components are specific to `admin-herramientas` and extend the global Golden Standard:

| Component                 | Classes                                                                                                                                   | FASE |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- | :--- |
| **Tab System**      | `.tab-bar`, `.tab-chip`, `.tab-chip.active`                                                                                         | 7    |
| **Custom Dropdown** | `.custom-dropdown`, `.custom-dropdown-trigger`, `.custom-dropdown-menu`, `.custom-dropdown-option`                                | 1    |
| **Summary Metrics** | `.summary-metrics-container`, `.summary-metrics-grid`, `.summary-metric-card`, `.summary-metric-label`, `.summary-metric-value` | 1    |
| **Status Toggle**   | `.status-toggle-btn`, `.status-toggle-label`, `.status-indicator`                                                                   | 4    |
| **Dropbox Zones**   | `.dropbox-zone`, `.dropbox-grid-2`, `.dropbox-icon`, `.dropbox-title`, `.dropbox-subtitle`                                      | 10+  |

---

## Phase 5: Accessibility & Responsive Testing (Complete)

**Completed**: 2026-02-05

### Accessibility Fixes Applied

| Fix                          | Status | Details                                                              |
| :--------------------------- | :----: | :------------------------------------------------------------------- |
| **Heading Hierarchy**  |   ✅   | H4→H3 for Filtros, Importar, Estadísticas (proper H2→H3 sequence) |
| **Date Inputs ARIA**   |   ✅   | `aria-label="Fecha de inicio"` / `aria-label="Fecha de fin"`     |
| **Aforo Input ARIA**   |   ✅   | `aria-label="Número de personas (aforo)"`                         |
| **Semantic Landmarks** |   ✅   | Proper use of `<main>`, `<nav>`, `<aside>`                     |
| **Table Semantics**    |   ✅   | All tables use `<thead>`, `<th>`, `role="columnheader"`        |
| **Focus Indicators**   |   ✅   | Visible focus states on all interactive elements                     |

### Responsive Breakpoints Verified

| Breakpoint        | Resolution | Status | Layout Behavior                 |
| :---------------- | :--------- | :----: | :------------------------------ |
| **Desktop** | 1920×1080 |   ✅   | Full sidebar + main content     |
| **Laptop**  | 1366×768  |   ✅   | Layout adapts proportionally    |
| **Tablet**  | 1024×768  |   ✅   | Grid collapses to single column |
| **Mobile**  | 768×1024  |   ✅   | Sidebar stacks, pills wrap      |

---

## Resources

- **Reference Implementation**: [admin-herramientas.html](../pages/admin/admin-herramientas.html)
- **CSS Source**: [admin-herramientas.css](../assets/css/admin-herramientas.css)
- **Design Tokens**: [tokens.css](../assets/css/tokens.css)
- **Global Components**: [components.css](../assets/css/components.css)

---

**Last Verified**: 2026-02-05
**Zero Inline CSS**: ✅ Confirmed
**Accessibility**: ✅ WCAG AA Compliant
