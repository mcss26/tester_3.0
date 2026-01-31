# Estandarizacion UI - FormulaMid 4

Fecha: 2026-01-29
Objetivo: eliminar deuda tecnica UI y lograr 100% compliance con el sistema de diseno.

## Indice

- [Estado actual](#estado-actual)
- [Golden Standard](#golden-standard)
- [Estandares por componente](#estandares-por-componente)
  - [1. Tablas](#1-tablas)
  - [2. Colores](#2-colores)
  - [3. Topbar](#3-topbar)
  - [4. Filter Bar](#4-filter-bar)
  - [5. Estados de pagina](#5-estados-de-pagina)
  - [6. Slide Panel](#6-slide-panel)
  - [7. Botones](#7-botones)
  - [8. Inputs](#8-inputs)
- [Fases de implementacion](#fases-de-implementacion)
- [Checklist de QA](#checklist-de-qa)
- [Orden de ejecucion](#orden-of-ejecucion)
- [Metricas de exito](#metricas-de-exito)
- [Archivos criticos](#archivos-criticos)

## Estado actual

| Metrica                     | Valor    |
| --------------------------- | -------- |
| Modulos totales             | 26       |
| Compliant (Golden Standard) | 2 (8%)   |
| Parcial                     | 8 (31%)  |
| Pendiente migracion         | 16 (61%) |
| Clases Tailwind "alien"     | 78+      |
| alert() nativos             | 33+      |
| confirm() nativos           | 6+       |

## Golden Standard

Referencia: `admin-master-proveedores.html`

Estructura base:

```
body.app-shell.admin-shell.admin-proveedores
└── header.app-topbar
│   ├── .topbar-left (boton back + label)
│   ├── nav.topbar-center.topbar-nav-split
│   │   ├── .topbar-nav-group.left (links fade)
│   │   ├── .topbar-nav-group.center (link activo)
│   │   └── .topbar-nav-group.right (links fade)
│   └── .topbar-right (status pill)
└── main.page-shell
    └── .page-card-wrap > .page-card
        ├── .page-card-loading (overlay)
        ├── .page-card-empty (overlay)
        └── #module-content
            └── .staff-dashboard
                ├── .dashboard-header
                ├── .filter-bar.filter-bar-compact
                └── .staff-list#list-container
```

## Estandares por componente

### 1. Tablas

#### Estructura HTML requerida

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
      <tbody id="table-body">
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

#### Clases obligatorias

| Clase          | Proposito                       |
| -------------- | ------------------------------- |
| staff-list     | Contenedor de lista             |
| table-viewport | Define area visible             |
| table-shell    | Aplica bordes, radius, spacing  |
| table-scroll   | Contenedor con scroll interno   |
| table-sticky   | Header sticky dentro del scroll |

#### CSS scope por modulo

```css
/* En components.css - scope del modulo */
.admin-proveedores .table {
  table-layout: fixed;
}

.admin-proveedores .table th,
.admin-proveedores .table td {
  vertical-align: middle;
}

/* Anchos por columna (deben sumar 100%) */
.admin-proveedores .table th:nth-child(1),
.admin-proveedores .table td:nth-child(1) {
  width: 28%;
}

.admin-proveedores .table th:nth-child(2),
.admin-proveedores .table td:nth-child(2) {
  width: 28%;
}

/* Columnas numericas: text-align center */
.admin-proveedores .table th:nth-child(3),
.admin-proveedores .table td:nth-child(3) {
  width: 12%;
  text-align: center;
}
```

#### Estilos base existentes (NO modificar)

```css
/* Ya definidos en components.css */
.table-viewport {
  max-height: 60vh;
  overflow: hidden;
  border-radius: 12px;
}
.table-scroll {
  max-height: 100%;
  overflow-y: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-md);
  color: var(--text-1);
}
.table-sticky thead th {
  position: sticky;
  top: 0;
  background: var(--bg-elev);
  z-index: 2;
}
.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}
```

#### NO hacer

```html
<!-- INCORRECTO: clases Tailwind -->
<table class="w-full text-left text-sm">
  <tr class="bg-[#1c1c1e] border-white/10">
    <!-- INCORRECTO: estilos inline -->
    <td style="width: 200px; text-align: center;"></td>
  </tr>
</table>
```

#### Hacer

```html
<!-- CORRECTO: clases semanticas -->
<div class="staff-list table-viewport table-shell">
  <div class="table-scroll">
    <table class="table table-sticky"></table>
  </div>
</div>
```

### 2. Colores

#### Arquitectura de 3 niveles

```
┌─────────────────────────────────────┐
│  3. COMPONENTE (--btn-primary-bg)   │ -> Usar en componentes especificos
├─────────────────────────────────────┤
│  2. SEMANTICO (--accent, --text-1)  │ -> Usar en estilos CSS
├─────────────────────────────────────┤
│  1. PRIMITIVO (--red-600)           │ -> NUNCA usar directamente
└─────────────────────────────────────┘
```

#### Tokens de color disponibles

| Token semantico | Valor   | Uso                           |
| --------------- | ------- | ----------------------------- |
| --accent        | #ff3b30 | Color primario de marca, CTAs |
| --danger        | #ff453a | Errores, eliminaciones        |
| --success       | #30d158 | Confirmaciones, exito         |
| --warning       | #ff9f0a | Advertencias                  |
| --info          | #0a84ff | Informacion                   |

#### Tokens de texto

| Token    | Valor                  | Uso                    |
| -------- | ---------------------- | ---------------------- |
| --text-1 | #ffffff                | Texto principal        |
| --text-2 | rgba(255,255,255,0.70) | Texto secundario       |
| --text-3 | rgba(255,255,255,0.50) | Placeholders, disabled |

#### Tokens de superficie

| Token       | Valor                  | Uso                 |
| ----------- | ---------------------- | ------------------- |
| --bg-base   | #050505                | Fondo principal app |
| --bg-elev   | rgba(20,5,5,0.92)      | Modales, dropdowns  |
| --surface-1 | rgba(255,255,255,0.06) | Cards, inputs       |
| --surface-2 | rgba(255,255,255,0.12) | Hover states        |

#### Tokens de borde

| Token      | Valor                  | Uso                  |
| ---------- | ---------------------- | -------------------- |
| --border-1 | rgba(255,255,255,0.12) | Bordes sutiles       |
| --border-2 | rgba(255,255,255,0.24) | Bordes activos/focus |

#### Tabla de mapeo: Tailwind -> Token

| Clase Tailwind (NO) | Token equivalente (SI) |
| ------------------- | ---------------------- |
| bg-white/5          | var(--surface-1)       |
| bg-white/10         | var(--surface-2)       |
| border-white/10     | var(--border-1)        |
| text-white/50       | var(--text-3)          |
| text-white/70       | var(--text-2)          |
| bg-purple-600       | var(--accent)          |
| text-green-500      | var(--success)         |
| text-red-500        | var(--danger)          |
| bg-[#1c1c1e]        | var(--surface-1)       |

#### NO hacer

```css
/* INCORRECTO: valores hardcodeados */
.card {
  background: rgba(255, 255, 255, 0.06);
}
.btn {
  background: #ff3b30;
}
.text {
  color: #ffffff;
}
```

#### Hacer

```css
/* CORRECTO: usar tokens semanticos */
.card {
  background: var(--surface-1);
}
.btn {
  background: var(--accent);
}
.text {
  color: var(--text-1);
}
```

### 3. Topbar

#### Estructura HTML requerida

```html
<header class="app-topbar">
  <!-- Seccion izquierda: Back + Label -->
  <div class="topbar-left">
    <button
      class="btn-icon btn-icon-flat"
      data-go="ruta/anterior.html"
      aria-label="Volver"
    >
      ←
    </button>
    <span class="topbar-back">INICIO</span>
  </div>

  <!-- Seccion centro: Navegacion Split -->
  <nav class="topbar-center topbar-nav-split">
    <div class="topbar-nav-group left">
      <button class="topbar-link is-fade-1" data-go="modulo1.html">
        Link 1
      </button>
      <button class="topbar-link is-fade-2" data-go="modulo2.html">
        Link 2
      </button>
      <button class="topbar-link is-fade-3" data-go="modulo3.html">
        Link 3
      </button>
    </div>
    <div class="topbar-nav-group center">
      <button class="topbar-link is-center active">Modulo Activo</button>
    </div>
    <div class="topbar-nav-group right">
      <button class="topbar-link is-fade-1" data-go="modulo4.html">
        Link 4
      </button>
      <button class="topbar-link is-fade-2" data-go="modulo5.html">
        Link 5
      </button>
      <button class="topbar-link is-fade-3" data-go="modulo6.html">
        Link 6
      </button>
    </div>
  </nav>

  <!-- Seccion derecha: Status -->
  <div class="topbar-right">
    <span class="system-status-pill status-open topbar-pill topbar-pill-quiet"
      >ESTADO: OK</span
    >
  </div>
</header>
```

#### Clases de topbar

| Clase                   | Proposito                               |
| ----------------------- | --------------------------------------- |
| app-topbar              | Contenedor principal (grid 3 columnas)  |
| topbar-left             | Seccion izquierda (justify-self: start) |
| topbar-center           | Seccion central (justify-self: center)  |
| topbar-right            | Seccion derecha (justify-self: end)     |
| topbar-nav-split        | Navegacion dividida en 3 grupos         |
| topbar-nav-group.left   | Links a la izquierda del activo         |
| topbar-nav-group.center | Link activo centrado                    |
| topbar-nav-group.right  | Links a la derecha del activo           |

#### Clases de links

| Clase                 | Efecto                     |
| --------------------- | -------------------------- |
| topbar-link           | Estilo base de link        |
| topbar-link.active    | Link activo (resaltado)    |
| topbar-link.is-center | Link centrado (titulo)     |
| topbar-link.is-fade-1 | Opacidad 75% (mas cercano) |
| topbar-link.is-fade-2 | Opacidad 55%               |
| topbar-link.is-fade-3 | Opacidad 40% (mas lejano)  |

#### CSS requerido para balance

```css
/* Para topbars tipo "hub" con navegacion centrada */
.admin-proveedores .app-topbar {
  grid-template-columns: 1fr auto 1fr;
}

.admin-proveedores .topbar-left {
  justify-self: start;
}
.admin-proveedores .topbar-right {
  justify-self: end;
}

.admin-proveedores .topbar-nav-split {
  display: flex;
  justify-content: center;
}

.admin-proveedores .topbar-nav-group.left,
.admin-proveedores .topbar-nav-group.right {
  flex: 1;
  min-width: 0;
  display: flex;
}

.admin-proveedores .topbar-nav-group.left {
  justify-content: flex-start;
  padding-right: 16px;
}

.admin-proveedores .topbar-nav-group.right {
  justify-content: flex-end;
  padding-left: 16px;
}

.admin-proveedores .topbar-nav-group.center {
  flex: 0 0 auto;
}
```

#### NO hacer

```html
<!-- INCORRECTO: clases Tailwind -->
<header class="h-[60px] flex items-center justify-between bg-white/5 px-6">
  <div class="flex items-center gap-4"></div>
</header>
```

#### Hacer

```html
<!-- CORRECTO: clases semanticas -->
<header class="app-topbar">
  <div class="topbar-left"></div>
</header>
```

### 4. Filter Bar

#### Estructura HTML requerida

```html
<div class="filter-bar filter-bar-compact" aria-label="Filtros">
  <!-- Grupo de Pills/Tabs -->
  <div class="filter-group">
    <button
      class="status-pill status-neutral topbar-pill topbar-pill-quiet filter-pill active"
      data-status="all"
      aria-label="Mostrar todos"
    >
      Total <span class="pill-count" id="count-total">0</span>
    </button>
    <button
      class="status-pill status-success topbar-pill topbar-pill-quiet filter-pill"
      data-status="active"
      aria-label="Mostrar activos"
    >
      Activos <span class="pill-count" id="count-active">0</span>
    </button>
    <button
      class="status-pill status-error topbar-pill topbar-pill-quiet filter-pill"
      data-status="inactive"
      aria-label="Mostrar inactivos"
    >
      Inactivos <span class="pill-count" id="count-inactive">0</span>
    </button>
  </div>

  <!-- Acciones de filtro -->
  <div class="filter-actions">
    <input
      type="search"
      id="search-input"
      class="input input-compact filter-input"
      placeholder="Buscar..."
      aria-label="Buscar"
    />
    <select class="input input-compact" aria-label="Filtrar por categoria">
      <option>Todas las categorias</option>
    </select>
  </div>
</div>
```

#### Clases de Filter Bar

| Clase              | Proposito                                  |
| ------------------ | ------------------------------------------ |
| filter-bar         | Contenedor principal (flex, space-between) |
| filter-bar-compact | Altura reducida                            |
| filter-group       | Grupo de pills/tabs                        |
| filter-pill        | Pill clickeable                            |
| filter-pill.active | Pill seleccionado                          |
| filter-actions     | Contenedor de inputs                       |
| filter-input       | Input de busqueda                          |
| input-compact      | Input altura reducida                      |

#### Estados de pills

| Clase          | Color               |
| -------------- | ------------------- |
| status-neutral | Gris (--text-3)     |
| status-success | Verde (--success)   |
| status-error   | Rojo (--danger)     |
| status-warning | Naranja (--warning) |

### 5. Estados de pagina

#### Estructura HTML requerida

```html
<div class="page-card-wrap">
  <div class="page-card">
    <!-- Overlay Loading -->
    <div class="page-card-loading" id="page-card-loading">
      <div class="state-block loading">
        <div class="state-spinner" aria-hidden="true"></div>
        <div class="state-loader"></div>
        <p class="state-title">Cargando datos...</p>
        <p class="state-desc">Esto puede tardar unos segundos</p>
      </div>
    </div>

    <!-- Overlay Empty -->
    <div class="page-card-empty" id="page-card-empty">
      <div class="state-block">
        <p class="state-title">Sin resultados</p>
        <p class="state-desc">Prueba con otro termino de busqueda.</p>
        <button class="btn-ghost btn-sm mt-2" id="btn-clear-search">
          Limpiar busqueda
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div id="module-content">
      <!-- ... contenido del modulo ... -->
    </div>
  </div>
</div>
```

#### JavaScript para control de estados

```js
const refs = {
  loadingOverlay: document.getElementById("page-card-loading"),
  emptyOverlay: document.getElementById("page-card-empty"),
  contentWrap: document.getElementById("module-content"),
};

function setPageState({ loading = false, empty = false } = {}) {
  refs.loadingOverlay.classList.toggle("is-visible", loading);
  refs.emptyOverlay.classList.toggle("is-visible", empty);
  if (refs.contentWrap) {
    refs.contentWrap.classList.toggle("hidden", loading || empty);
  }
}

// Uso:
setPageState({ loading: true }); // Mostrar loading
setPageState({ empty: true }); // Mostrar empty
setPageState(); // Mostrar contenido
```

#### Reglas importantes

- Overlays en HTML: siempre definir overlays en el HTML, no inyectarlos con JS
- Clase `is-visible`: usar para mostrar overlays
- Clase `hidden`: aplicar a `#module-content` cuando loading/empty
- Nunca superponer: el contenido debe ocultarse cuando el overlay este visible

### 6. Slide Panel

#### Estructura HTML requerida

```html
<!-- Overlay -->
<div class="panel-overlay" id="panel-overlay"></div>

<!-- Panel -->
<div class="slide-panel" id="slide-panel">
  <div class="panel-header">
    <h3 class="panel-title" id="panel-title">Titulo del Panel</h3>
    <button class="panel-close" id="btn-close-panel" aria-label="Cerrar panel">
      ×
    </button>
  </div>

  <div class="panel-body" id="panel-form-container">
    <div id="panel-error" class="panel-error"></div>

    <div class="form-group">
      <label for="campo-1" class="form-label">Campo 1 *</label>
      <input type="text" id="campo-1" class="input" required />
    </div>

    <div class="form-group">
      <label for="campo-2" class="form-label">Campo 2</label>
      <input type="text" id="campo-2" class="input" />
    </div>
  </div>

  <div class="panel-footer">
    <button class="btn btn-secondary" id="btn-cancel">Cancelar</button>
    <button class="btn btn-primary" id="btn-save">Guardar</button>
  </div>
</div>
```

#### Clases de panel

| Clase               | Proposito                                  |
| ------------------- | ------------------------------------------ |
| panel-overlay       | Fondo oscuro detras del panel              |
| slide-panel         | Contenedor del panel (slide desde derecha) |
| slide-panel.is-open | Panel visible                              |
| panel-header        | Cabecera con titulo y boton cerrar         |
| panel-body          | Contenido scrolleable                      |
| panel-footer        | Botones de accion fijos al fondo           |
| panel-close         | Boton X para cerrar                        |

#### JavaScript para control

```js
function openPanel() {
  document.getElementById("panel-overlay").classList.add("is-visible");
  document.getElementById("slide-panel").classList.add("is-open");
}

function closePanel() {
  document.getElementById("panel-overlay").classList.remove("is-visible");
  document.getElementById("slide-panel").classList.remove("is-open");
}
```

### 7. Botones

#### Variantes disponibles

```html
<!-- Primario (CTA principal) -->
<button class="btn btn-primary">Guardar</button>

<!-- Secundario -->
<button class="btn btn-secondary">Cancelar</button>

<!-- Ghost (transparente) -->
<button class="btn btn-ghost">Ver mas</button>

<!-- Danger -->
<button class="btn btn-danger">Eliminar</button>

<!-- Icon-only (requiere aria-label) -->
<button class="btn-icon btn-icon-flat" aria-label="Nuevo">+</button>

<!-- Tamaños -->
<button class="btn btn-primary btn-sm">Pequeno</button>
<button class="btn btn-primary btn-lg">Grande</button>
```

#### Tokens de botones

| Token              | Valor                   |
| ------------------ | ----------------------- |
| --btn-primary-bg   | var(--accent) (#ff3b30) |
| --btn-primary-text | var(--text-1) (blanco)  |
| --btn-radius       | 99px (pill)             |

#### Regla de accesibilidad

Botones icon-only SIEMPRE requieren `aria-label`.

```html
<!-- INCORRECTO -->
<button class="btn-icon">×</button>

<!-- CORRECTO -->
<button class="btn-icon" aria-label="Cerrar">×</button>
```

### 8. Inputs

#### Estructura de form group

```html
<div class="form-group">
  <label for="input-id" class="form-label">Label del Campo *</label>
  <input
    type="text"
    id="input-id"
    class="input"
    placeholder="Placeholder..."
    required
  />
  <span class="note">Texto de ayuda opcional.</span>
</div>
```

#### Variantes de input

```html
<!-- Input estandar -->
<input type="text" class="input" placeholder="..." />

<!-- Input compacto (filter bars) -->
<input type="search" class="input input-compact" placeholder="Buscar..." />

<!-- Select -->
<select class="input">
  <option>Opcion 1</option>
</select>

<!-- Textarea -->
<textarea class="input" rows="4"></textarea>
```

#### Tokens de input

| Token          | Valor                   |
| -------------- | ----------------------- |
| --input-bg     | rgba(0,0,0,0.3)         |
| --input-border | var(--border-1)         |
| --input-radius | var(--radius-md) (14px) |

## Fases de implementacion

### Fase 1: Consolidacion de infraestructura CSS

#### 1.1 Documentar utilidades existentes

Archivo: `assets/css/tokens.css`

Agregar seccion documentada para utilidades tipo Tailwind que ya existen pero no estan documentadas:

```css
/* ===== UTILIDADES (Documentadas) ===== */
/* Flex */
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-2 {
  gap: var(--space-2);
}
.gap-4 {
  gap: var(--space-4);
}

/* Spacing */
.mt-4 {
  margin-top: var(--space-4);
}
.mb-4 {
  margin-bottom: var(--space-4);
}
.p-4 {
  padding: var(--space-4);
}

/* Typography */
.text-xs {
  font-size: var(--fs-xs);
}
.text-sm {
  font-size: var(--fs-sm);
}
.font-bold {
  font-weight: 700;
}

/* Visibility */
.hidden {
  display: none !important;
}
.opacity-60 {
  opacity: 0.6;
}
```

#### 1.2 Agregar clases faltantes

Archivo: `assets/css/components.css`

```css
/* Sprint 1 - Barras */
.list-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.stack-lg {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-4);
}
.section-title.muted {
  color: var(--text-3);
}
.panel-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-1);
  background: var(--surface-2);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
}
.ingredient-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

/* Sprint 2 - QR */
.progress-bar {
  height: 0.75rem;
  width: 100%;
  background: var(--surface-2);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
}
```

#### 1.3 Crear tabla de mapeo

Archivo: `docs/architecture/token-mapping.md`

```
Valor Hardcodeado  Token Equivalente
bg-white/5         var(--surface-1)
bg-white/10        var(--surface-2)
border-white/10    var(--border-1)
text-white/50      var(--text-3)
text-white/70      var(--text-2)
bg-purple-600      var(--accent)
text-green-500     var(--success)
text-red-500       var(--danger)
```

### Fase 2: Migracion de modulos por sprint

#### Sprint 1: Modulo Barras (prioridad alta)

Archivos a modificar:

- `pages/operativo/barras/index.html`
- `pages/operativo/barras/session.html`
- `pages/operativo/barras/recipes.html`
- `assets/js/modules/operativo/bar-dashboard.js`
- `assets/js/modules/operativo/bar-session.js`
- `assets/js/modules/operativo/bar-recipes.js`

Tareas HTML:

- Reemplazar clases Tailwind por clases semanticas (ver `roadmap_remediation_uiux.md` lineas 14-55)
- Estructura: `page-card-wrap > page-card > staff-dashboard`
- Agregar overlays `page-card-loading` y `page-card-empty`

Tareas JS:

- Reemplazar `alert()` -> `window.Toast.warning/error/success()`
- Reemplazar `confirm()` -> Modal `#confirmModal`
- Implementar `setPageState({ loading, empty })`

#### Sprint 2: Modulo QR (prioridad media)

Archivos a modificar:

- `pages/admin/qr/index.html`
- `pages/admin/qr/generator.html`
- `pages/admin/qr/monitor.html`
- `assets/js/modules/admin/qr-generator.js`
- `assets/js/modules/admin/qr-dashboard.js`

Tareas:

- Migrar topbar a `app-topbar` estandar
- Reemplazar layouts Tailwind por `page-shell`, `kpi-grid`
- Implementar `progress-bar` semantico
- Eliminar `alert()/confirm()` -> Toast/Modal

#### Sprint 3: Cleanup Admin (prioridad baja)

Archivos:

- `assets/js/modules/admin/admin-pagos.js` (10 lineas con fallback alert)
- `assets/js/modules/admin/admin-workdays.js` (1 confirm)
- `assets/js/modules/admin/admin-master-tarifario.js` (1 confirm)

Tareas:

- Eliminar fallbacks `window.Toast ? ... : alert()`
- Reemplazar `confirm()` -> Modal existente

### Fase 3: Normalizacion de componentes core

#### 3.1 Unificar SlidePanel Pattern

Crear archivo: `assets/js/core/slide-panel.js`

```js
// API unificada para todos los modulos
export function openPanel(panelId, options = {}) {
  /* ... */
}
export function closePanel(panelId) {
  /* ... */
}
export function setPanelLoading(panelId, loading) {
  /* ... */
}
```

#### 3.2 Unificar Modal Pattern

Crear archivo: `assets/js/core/modal.js`

```js
// Reemplaza todos los confirm() nativos
export function showConfirmModal({ title, message, onConfirm, onCancel }) {
  /* ... */
}
export function showAlertModal({ title, message, type }) {
  /* ... */
}
```

#### 3.3 Estandarizar estados de pagina

Patron a replicar (de `admin-master-proveedores`):

```js
const refs = {
  loadingOverlay: document.getElementById("page-card-loading"),
  emptyOverlay: document.getElementById("page-card-empty"),
  contentWrap: document.getElementById("module-content"),
};

function setPageState({ loading = false, empty = false } = {}) {
  refs.loadingOverlay.classList.toggle("is-visible", loading);
  refs.emptyOverlay.classList.toggle("is-visible", empty);
  refs.contentWrap?.classList.toggle("hidden", loading || empty);
}
```

### Fase 4: Accesibilidad

#### 4.1 Auditoria de aria-labels

Prioridad: botones icon-only

```html
<!-- Antes -->
<button class="btn btn-icon">×</button>

<!-- Despues -->
<button class="btn btn-icon" aria-label="Cerrar panel">×</button>
```

#### 4.2 Focus trap en modales

Implementar en todos los modales y slide-panels:

- Tab cycling dentro del contenedor
- Escape para cerrar
- Focus al primer elemento focuseable al abrir
- Restore focus al cerrar

#### 4.3 Skip links

Agregar en layout base para saltar navegacion repetitiva.

### Fase 5: Validacion y QA

Checklist por modulo:

- Layout `page-card-wrap` (estructura HTML correcta)
- Overlays loading/empty (presentes en HTML, no inyectados)
- Sin clases Tailwind (grep 0 resultados)
- Sin `alert()/confirm()` (grep 0 resultados)
- TableShell correcto (`table-viewport > table-scroll > table`)
- FilterBar presente (tabs + search + select)
- Tokens semanticos (sin valores hardcodeados)
- aria-labels en botones icon-only

## Checklist de QA

Comandos de verificacion:

```sh
# Buscar clases Tailwind restantes
grep -r "bg-white/" pages/
grep -r "text-white/" pages/
grep -r "border-white/" pages/

# Buscar alerts/confirms
grep -r "alert(" assets/js/modules/
grep -r "confirm(" assets/js/modules/

# Buscar valores hardcodeados
grep -r "rgba(255" assets/css/
grep -r "#ffffff" assets/css/
```

## Orden de ejecucion

Semana 1

- Fase 1.1: Documentar utilidades en `tokens.css`
- Fase 1.2: Agregar clases faltantes en `components.css`
- Fase 1.3: Crear `token-mapping.md`

Semana 2

- Sprint 1: Migrar `barras/index.html`
- Sprint 1: Migrar `barras/session.html`
- Sprint 1: Migrar `barras/recipes.html`
- Sprint 1: Limpiar JS de barras
- Verificar Sprint 1 en browser

Semana 3

- Sprint 2: Migrar modulo QR completo
- Sprint 3: Cleanup Admin JS
- Verificar Sprints 2-3 en browser

Semana 4

- Fase 3: Crear `slide-panel.js` y `modal.js` compartidos
- Fase 4: Auditoria y fixes de accesibilidad
- Fase 5: QA final con checklist

## Metricas de exito

| Metrica               | Antes     | Objetivo     |
| --------------------- | --------- | ------------ |
| Clases Tailwind       | 78+       | 0            |
| alert() calls         | 33+       | 0            |
| confirm() calls       | 6+        | 0            |
| Modulos compliant     | 2/26 (8%) | 26/26 (100%) |
| aria-labels faltantes | ~20       | 0            |

## Archivos criticos

### CSS

- `assets/css/tokens.css` (agregar utilidades documentadas)
- `assets/css/components.css` (agregar clases faltantes)

### HTML (Sprint 1)

- `pages/operativo/barras/index.html`
- `pages/operativo/barras/session.html`
- `pages/operativo/barras/recipes.html`

### HTML (Sprint 2)

- `pages/admin/qr/index.html`
- `pages/admin/qr/generator.html`
- `pages/admin/qr/monitor.html`

### JS

- `assets/js/modules/operativo/bar-*.js` (3 archivos)
- `assets/js/modules/admin/qr-*.js` (2 archivos)
- `assets/js/modules/admin/admin-pagos.js`
- `assets/js/modules/admin/admin-workdays.js`
- `assets/js/modules/admin/admin-master-tarifario.js`

### Nuevos archivos

- `assets/js/core/slide-panel.js`
- `assets/js/core/modal.js`
- `docs/architecture/token-mapping.md`
