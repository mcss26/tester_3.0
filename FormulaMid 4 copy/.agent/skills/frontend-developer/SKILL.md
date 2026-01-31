---
name: frontend-developer
description: Generación de HTML/CSS, componentes visuales y diseño para FormulaMid 4.
---

# Skill: Frontend Developer (UI/UX)

> **Fuente de Verdad**: `docs/architecture/standard-module-guide.md` (Para estructura de módulos), `assets/css/main.css` (Para estilos).
> **Última Actualización**: 2026-01-29

Este documento contiene los patrones obligatorios para todo desarrollo frontend.

---

> [!CRITICAL]
> **POLÍTICA DE CSS CONGELADO (FROZEN CSS)**
> El diccionario de estilos está **CERRADO**.
>
> 1. **PROHIBIDO** crear nuevas clases CSS.
> 2. **PROHIBIDO** modificar `tokens.css` o `components.css`.
> 3. **EXCEPCIÓN ÚNICA**: Pedido explícito del usuario o consulta previa aprobada.
> 4. Usa ÚNICAMENTE lo que ya existe en `components.css`. Si "falta algo", pregunta antes de inventarlo.

---

## 1. Design Philosophy (Consolidated)

> [!TIP]
> **Premium Aesthetic**: Dark mode by default, high contrast, smooth gradients, "glassmorphism" accents.
> **Responsive**: Mobile-first for POS/Operational views; Desktop-optimized for Admin/Dashboard.
> **Feedback-Rich**: Every action provides immediate visual feedback (hover, active, loading, toast).
>
> **Golden Rule**: Para CUALQUIER pantalla nueva o refactorización, consulta PRIMERO `docs/architecture/standard-module-guide.md`. Copia la anatomía HTML de allí.
> **Golden Standard Visual**: [`admin-master-proveedores.html`](file:///Users/lucianopieve/Documents/FormulaMid%204/pages/admin/admin-master-proveedores.html) — La referencia de UI más pulida.

### 1.1 Core Principles (Baseline Master)

1. **Unify Headers**: Title, subtitle, and primary action in one line (Context Strip).
2. **Critical Actions Visibility**: Always visible in the header. CTA "+" is the primary action.
3. **Consistent Spacing**: Use the 8pt grid strictly.
4. **Empty States**: Never leave a blank screen; suggest the next action via `page-card-empty` overlay.
5. **Visual Hierarchy**: Separate filters (left) from primary actions (right).
6. **Baseline Global**: `TableShell` (viewport+scroll+sticky) + `FilterBar` (compact) apply to ALL list/table modules.
7. **Navigation Consistency**: Back always goes to index. Transitions use `data-go` with `body.is-leaving`.

---

## 2. Architecture Standards (MANDATORY)

### 2.1 JavaScript Module Pattern

**Standard**: Async IIFE (Immediately Invoked Function Expression)

All page-specific logic MUST be encapsulated to prevent global scope pollution.

```javascript
/* Standard Module Pattern */
(async function () {
  "use strict";

  // 1. Auth Guard (Fail fast)
  const session = await window.Auth.guardOrRedirect(["admin"]);
  if (!session) return;

  // 2. UI References (Unified object)
  const ui = {
    btnSave: document.getElementById("btn-save"),
    listContainer: document.getElementById("list-container"),
    // ...
  };

  // 3. State
  let state = { data: [] };

  // 4. Init
  async function init() {
    // ...
  }

  await init();
})();
```

### 2.2 Navigation Standard

**Reference**: `docs/architecture/navigation.md`

- **Use `data-go`**: For all internal links.
- **Use `Navigation.navigateTo()`**: For programmatic redirects.
- **Do NOT use**: `window.location.href` manually (except for fallbacks).

### 2.3 DOM Access Standard

- **Use**: `const ui = { ... }` object at the top of the module.
- **Do NOT use**: scattered `document.getElementById` calls inside functions.
- **RATIONALE**: Centralizes DOM coupling, making refactors easier.

---

## 2. Design Tokens (W3C DTCG Standard)

> [!IMPORTANT]
> La arquitectura de estilos se basa en **3 archivos centrales**:
>
> 1.  **`main.css`**: Punto de entrada (solo imports).
> 2.  **`tokens.css`**: Variables bajo estándar W3C DTCG (**Primitivos** → **Semánticos** → **Componente**).
> 3.  **`components.css`**: Clases de UI consolidadas.
>
> **Regla de Oro**: Si existe en el sistema de diseño, ÚSALO. No hardcodees valores.

### 1.1 Tokens Semánticos (USE ESTOS)

Estos tokens describen la _intención_ del diseño y son los que debes usar mayoritariamente en tus hojas de estilo de módulo.

| Token            | Descripción                          | Equivalente Primitivo (Ref) |
| :--------------- | :----------------------------------- | :-------------------------- |
| `--bg-base`      | Fondo general de la aplicación       | `var(--neutral-50)`         |
| `--bg-elev`      | Superficies elevadas (modales, navs) | `var(--black-alpha-92)`     |
| `--surface-1`    | Contenedores primarios (cards)       | `var(--white-alpha-06)`     |
| `--surface-2`    | Estado Hover de contenedores         | `var(--white-alpha-12)`     |
| `--text-1`       | Texto principal (alta legibilidad)   | `var(--neutral-1000)`       |
| `--text-2`       | Texto secundario (metadata)          | `var(--white-alpha-70)`     |
| `--text-inverse` | Texto sobre acentos sólidos          | `var(--neutral-50)`         |
| `--accent`       | Color de marca (interacción)         | `var(--red-600)`            |
| `--border-1`     | Bordes sutiles                       | `var(--white-alpha-12)`     |

### 1.2 Tokens de Componente (Specific Aliases)

Úsalos cuando estés construyendo o modificando componentes específicos para asegurar consistencia automática.

| Token              | Uso                                          |
| :----------------- | :------------------------------------------- |
| `--btn-primary-bg` | Fondo de botones primarios                   |
| `--input-bg`       | Fondo de campos de entrada                   |
| `--card-radius`    | Borde redondeado de tarjetas (`--radius-lg`) |
| `--shadow-soft`    | Sombra estándar de elevación                 |

### 1.3 Dimensiones & Primitivos

Usa estos solo para layout o correcciones finas.

| Token         | Valor    |
| :------------ | :------- |
| `--page-max`  | `1120px` |
| `--page-pad`  | `24px`   |
| `--radius-md` | `14px`   |
| `--radius-lg` | `20px`   |

---

## 2. Layout Components

### 2.1 App Shell

Contenedor base para páginas internas.
Ver plantilla completa en `docs/architecture/standard-module-guide.md`.

```html
<body class="app-shell admin-shell">
  <header class="app-topbar">...</header>
  <main class="page-shell">...</main>
</body>
```

**Variantes**:

- `.admin-shell` — Para módulos administrativos (sticky headers en tablas)
- `.stock-shell` — Igual comportamiento que admin

### 2.2 Topbar (Minimalista, Master Admin)

```html
<header class="app-topbar">
  <div class="topbar-left">
    <button
      class="btn-icon btn-icon-flat"
      data-go="pages/admin/admin-index.html"
    >
      ←
    </button>
    <span class="topbar-back">INICIO</span>
  </div>
  <nav class="topbar-center topbar-nav-split">
    <div class="topbar-nav-group left">
      <button
        class="topbar-link is-fade-1"
        data-go="pages/admin/admin-master-sku.html"
      >
        SKU
      </button>
      <button
        class="topbar-link is-fade-2"
        data-go="pages/admin/barras/recipes.html"
      >
        Recetas
      </button>
      <button
        class="topbar-link is-fade-3"
        data-go="pages/admin/admin-master-proveedores.html"
      >
        Proveedores
      </button>
    </div>
    <div class="topbar-nav-group center">
      <button
        class="topbar-link is-center active"
        data-go="pages/admin/admin-master-categorias.html"
      >
        Categorías
      </button>
    </div>
    <div class="topbar-nav-group right">
      <button
        class="topbar-link is-fade-1"
        data-go="pages/admin/admin-pagos.html"
      >
        Pagos
      </button>
      <button
        class="topbar-link is-fade-2"
        data-go="pages/admin/admin-master-tarifario.html"
      >
        Tarifario
      </button>
      <button
        class="topbar-link is-fade-3"
        data-go="pages/admin/admin-master-pos.html"
      >
        POS
      </button>
    </div>
  </nav>
  <div class="topbar-right">
    <span class="system-status-pill status-open topbar-pill topbar-pill-quiet"
      >ESTADO: OK</span
    >
  </div>
</header>
```

### 2.3 Topbar (Simple, otros módulos)

Usar cuando el módulo no requiere navegación split:

```html
<header class="app-topbar">
  <div class="topbar-left">
    <button
      class="btn-icon btn-icon-flat"
      data-go="pages/admin/admin-index.html"
    >
      ←
    </button>
    <span class="topbar-back">INICIO</span>
  </div>
  <div class="topbar-center">
    <span class="topbar-title">TÍTULO</span>
  </div>
  <div class="topbar-right">
    <span class="system-status-pill status-open topbar-pill topbar-pill-quiet"
      >ESTADO: OK</span
    >
  </div>
</header>
```

### 2.4 Page Shell

Contenedor principal del contenido.

```html
<main class="page-shell">
  <!-- Contenido de la página -->
</main>
```

---

## 3. Dashboard Components

### 3.1 Staff Dashboard (Glassmorphism)

Card principal con efecto glass para dashboards.

```html
<div class="staff-dashboard">
  <div class="dashboard-header align-start">
    <div>
      <h2 class="dashboard-title">Título</h2>
      <p class="dashboard-subtitle">Descripción opcional</p>
    </div>
    <button
      class="btn-icon btn-icon-flat btn-icon-plus"
      aria-label="Nueva entidad"
    >
      +
    </button>
  </div>
  <div class="staff-list">
    <!-- Contenido scrolleable -->
  </div>
</div>
```

**Propiedades CSS clave**:

- `backdrop-filter: blur(20px)`
- `background: rgba(255, 255, 255, 0.02)`
- `border-radius: var(--radius-xl)`
- `height: 65vh`

---

## 4. Overlay Components

### 4.1 Slide Panel (Formularios Laterales)

Panel que se desliza desde la derecha (o abajo en mobile).

````html
<!-- Overlay para cerrar al hacer click afuera -->
<div class="panel-overlay" id="panelOverlay"></div>

<!-- Panel -->
<aside class="slide-panel" id="myPanel">
  <div class="panel-header">
    <h3 class="panel-title">Título Panel</h3>
    <button class="panel-close" id="btn-close-panel">×</button>
  </div>
  <div class="panel-body">
    <form id="myForm">
      <!-- Form groups -->
    </form>
  </div>
  <div class="panel-footer">
    <button class="btn-secondary" id="btnCancel">Cancelar</button>
    <button class="btn-primary" id="btnSave">Guardar</button>
  </div>
</aside>

### 4.2 TableShell + FilterBar (Baseline Master Global) ```html
<!-- FilterBar Compact -->
<div class="filter-bar filter-bar-compact">
  <div class="filter-group">
    <!-- Pills actúan como filtro principal -->
    <button class="status-pill filter-pill active" data-status="all">
      Total
    </button>
    <button class="status-pill filter-pill" data-status="active">
      Activos
    </button>
    <button class="status-pill filter-pill" data-status="inactive">
      Inactivos
    </button>
  </div>
  <div class="filter-actions">
    <input
      type="search"
      class="input input-compact filter-input"
      placeholder="Buscar..."
    />
  </div>
</div>

<!-- TableShell (Viewport + Scroll + Sticky) -->
<div class="staff-list table-viewport table-shell">
  <div class="table-scroll">
    <table class="table table-sticky">
      <thead>
        <tr class="table-head">
          <th class="table-cell is-header">...</th>
        </tr>
      </thead>
      <tbody>
        ...
      </tbody>
    </table>
  </div>
</div>
````

### 4.3 Estados a nivel `page-card` (obligatorio)

```html
<div class="page-card-loading" id="page-card-loading">...</div>
<div class="page-card-empty" id="page-card-empty">...</div>
```

---

## 5. Decisiones obligatorias por módulo

- Si hay **tabla/lista** → usar TableShell + sticky.
- Si hay **filtros** → usar FilterBar (pills + search).
- Si hay **alta/edición** → usar SlidePanel estándar.
- Si hay **botón editar** en tabla → usar `btn-ghost` (NO primary, NO icon-only).
- Si hay **loading/empty** → overlay en `page-card` (no dentro de tabla).
- Si hay **navegación por data-go** → transición ligera (`body.is-leaving`).

**Control JS obligatorio (Panel & Nav)**:

```javascript
function openPanel(panelId) {
  document.getElementById("panelOverlay").classList.add("open");
  document.getElementById(panelId).classList.add("open");
}

function closePanel(panelId) {
  document.getElementById("panelOverlay").classList.remove("open");
  document.getElementById(panelId).classList.remove("open");
}

// Cerrar al click en overlay
document
  .getElementById("panelOverlay")
  .addEventListener("click", () => closePanel("myPanel"));

// ---------------------------------------------------------
// Page Transition Logic (Copiar tal cual)
// ---------------------------------------------------------
document.querySelectorAll("[data-go]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const url = btn.dataset.go;
    document.body.classList.add("is-leaving");
    setTimeout(() => {
      window.location.href = url;
    }, 300); // Coincide con CSS transition time
  });
});
```

### 4.2 Modal

```html
<div class="modal-overlay hidden" id="confirmModal">
  <div class="modal-card" style="max-width:400px;">
    <div class="modal-header">
      <h2>Confirmar Acción</h2>
    </div>
    <div class="modal-body">
      <p>¿Estás seguro de continuar?</p>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" id="btnCancelModal">Cancelar</button>
      <button class="btn-primary" id="btnConfirmModal">Confirmar</button>
    </div>
  </div>
</div>
```

---

## 5. Tables (Sticky Headers)

### 5.1 Estructura Base

```html
<div class="staff-list">
  <div class="table-scroll">
    <table class="table">
      <thead>
        <tr class="table-head">
          <th class="table-cell is-header">COLUMNA 1</th>
          <th class="table-cell is-header text-center">COLUMNA 2</th>
          <th class="table-cell is-header text-right">MONTO</th>
        </tr>
      </thead>
      <tbody>
        <tr class="table-row">
          <td class="table-cell">Dato 1</td>
          <td class="table-cell text-center">Dato 2</td>
          <td class="table-cell text-right">$1.000</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### 5.2 Modificadores de Celda

| Clase          | Efecto           |
| :------------- | :--------------- |
| `.text-center` | Centrar texto    |
| `.text-right`  | Alinear derecha  |
| `.cell-pad`    | Padding extra    |
| `.cell-narrow` | Ancho fijo 80px  |
| `.cell-strong` | Font weight bold |

---

## 6. Buttons

### 6.1 Primary Button (Acción Principal)

```html
<button class="btn-primary">GUARDAR</button>
```

- Fondo: `var(--accent)` (#ff3b30)
- Glow: `box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3)`

### 6.2 Secondary Button

```html
<button class="btn-secondary">CANCELAR</button>
```

### 6.3 Ghost Button

```html
<button class="btn-ghost">VER MÁS</button>
```

### 6.4 Danger Button

```html
<button class="btn-danger">ELIMINAR</button>
```

### 6.5 Icon Button

```html
<button class="btn-icon" aria-label="Cerrar">×</button>
```

### 6.6 Size Modifier

```html
<button class="btn-primary btn-sm">ACCIÓN</button>
```

---

## 7. Forms

### 7.1 Form Group

```html
<div class="form-group">
  <label>Nombre del Campo</label>
  <input id="fieldName" class="input" required />
</div>
```

### 7.2 Form Row (Campos Inline)

```html
<div class="form-row">
  <div class="form-group">
    <label>Campo 1</label>
    <input class="input" />
  </div>
  <div class="form-group">
    <label>Campo 2</label>
    <input class="input" />
  </div>
</div>
```

---

## 8. Feedback System

### 8.1 Toast (Notificaciones)

> [!IMPORTANT]
> **OBLIGATORIO** usar `window.Toast` para toda retroalimentación al usuario.

```javascript
// Éxito
window.Toast.success("Operación completada");

// Error
window.Toast.error("Error al guardar");

// Info
window.Toast.info("Información importante");

// Warning
window.Toast.warning("Atención: revisar datos");
```

### 8.2 Status Pills

```html
<span class="status-pill status-success">Completado</span>
<span class="status-pill status-warning">Pendiente</span>
<span class="status-pill status-error">Rechazado</span>
```

### 8.3 Empty State

```html
<div class="empty-state">No hay registros para mostrar.</div>
```

---

## 9. Utility Classes

| Clase          | Efecto                     |
| :------------- | :------------------------- |
| `.hidden`      | `display: none !important` |
| `.muted`       | Color `--text-2`           |
| `.faint`       | Color `--text-3`           |
| `.accent`      | Color `--accent`           |
| `.danger`      | Color `--danger`           |
| `.text-center` | Centrar texto              |
| `.text-right`  | Alinear derecha            |
| `.w-full`      | Width 100%                 |
| `.fade-in`     | Animación fadeIn           |

---

## 10. Plantilla Base de Página

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FormulaMid — Nombre Módulo</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../../assets/css/main.css" />
  </head>
  <body class="app-shell admin-shell">
    <header class="app-topbar">
      <div class="topbar-left">
        <button class="btn-icon" onclick="history.back()">←</button>
        <div class="topbar-brand">NOMBRE MÓDULO</div>
      </div>
      <div class="topbar-right">
        <span id="user-name">Admin</span>
        <button class="btn-icon" id="btn-logout">Salir</button>
      </div>
    </header>

    <main class="page-shell">
      <!-- Contenido -->
    </main>

    <!-- OVERLAYS -->
    <div class="panel-overlay" id="panelOverlay"></div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
    <script src="../../assets/js/core/config.js"></script>
    <script src="../../assets/js/core/supabase-client.js"></script>
    <script src="../../assets/js/core/utils.js"></script>
    <script src="../../assets/js/core/auth.js"></script>
    <script src="../../assets/js/core/toast.js"></script>
    <script src="../../assets/js/modules/mi-modulo.js"></script>
  </body>
</html>
```

---

## 11. Advanced Patterns (Specialized Views)

### 11.1 Wizard (`/wizard`)

**Usage**: Complex sequential processes (e.g., Opening Cash Register, Onboarding).

- **Stepper**: Visual progress indicator at the top.
- **Validation**: Step-by-step; blocks advance if invalid.
- **Confirmation**: Final step is always a summary.

### 11.2 Kanban (`/kanban`)

**Usage**: State management (Orders, Tasks).

- **Columns**: Fixed states (Pending, In Progress, Done).
- **Drag & Drop**: Updates `status` immediately via `window.sb`.
- **Ghosting**: Visual feedback during drag.

### 11.3 POS Grid (`/pos`)

**Usage**: High-density touch interface for Cashiers/Bartenders.

- **Layout**: Large touch targets, minimal text.
- **Feedback**: Instant visual response/sound on tap.

### 11.4 KPI Cards (Dashboard)

**Structure**:

```html
<div class="kpi-card">
  <h3 class="kpi-label">TOTAL VENTAS</h3>
  <p class="kpi-value" id="kpi-sales">--</p>
  <span class="kpi-trend positive">+5% vs ayer</span>
</div>
```

---

## 12. UX & Accessibility Audit Guidelines

### 12.1 Spacing & Rhythm

- **Scale**: 8px / 16px / 24px / 32px.
- **Rhythm**: Header-Content (16px), Section-Section (24px).
- **Internal**: Elements within a block (8px or 12px).

### 12.2 Accessibility Checks

- **Contrast**: Secondary text min opacity 0.7.
- **Touch Targets**: Min 36x36px for small icons.
- **Focus**: Visible focus states for all inputs/buttons.
- **Text**: Avoid ALL CAPS for long text; use only for short labels.

---

## 13. Checklist de Validación

Al crear cualquier componente UI, verificar:

- [ ] Usa design tokens (no valores hardcodeados)
- [ ] Estructura: `app-shell` + `app-topbar` + `page-shell`
- [ ] Tablas con `.table-scroll` y `.table-head`
- [ ] Formularios en `.slide-panel`
- [ ] Botones: `.btn-primary` / `.btn-secondary`
- [ ] Feedback: `window.Toast`
- [ ] Empty states definidos

---

## 14. Mantenimiento de Fuentes de Verdad

> [!CAUTION]
> **Reglas para evitar duplicación de documentación**

### 14.1 Ubicaciones Canónicas

| Tipo de Documento   | Ubicación Única             | NO crear en    |
| :------------------ | :-------------------------- | :------------- |
| Estado del proyecto | `docs/estado-presente.md`   | `.agent/`      |
| Roadmap             | `docs/roadmap.md`           | `.agent/`      |
| CSS/Tokens          | `assets/css/tokens.css`     | Otros CSS      |
| Componentes CSS     | `assets/css/components.css` | Estilos inline |
| Skills técnicos     | `.agent/skills/`            | `docs/`        |

### 14.2 Reglas de Actualización

1. **Si modificas tokens CSS** → Actualizar este SKILL.md (sección 2)
2. **Si agregas componente nuevo** → Documentar en este SKILL.md
3. **NUNCA crear archivos duplicados** → Si existe, actualizar el existente
4. **Archivar obsoletos** → Mover a `_archive/`, no duplicar
5. **LOCKDOWN**: No toques los archivos CSS base sin permiso expreso. Si crees que falta un estilo, usa uno existente o pregunta.

### 14.3 Checklist Pre-Commit

- [ ] ¿Existe ya un archivo similar? → Actualizar, no crear nuevo
- [ ] ¿Las referencias en otros docs apuntan a la fuente correcta?
- [ ] ¿Se actualizó la fecha `Última Actualización` del skill?

---

## 15. Orquestación Post-Tarea

> [!IMPORTANT]
> **Al finalizar cualquier tarea que modifique un módulo HTML/JS, DEBES:**

### 15.1 Llamar a `documentation-generator`

Si creaste o modificaste significativamente un módulo:

```
Ejecutar skill: documentation-generator
Target: pages/[categoria]/[modulo].html
Output: docs/modules/[categoria]/[modulo].md
```

### 15.2 Actualizar Documentos Relacionados

| Si modificaste...          | Actualizar...                           |
| :------------------------- | :-------------------------------------- |
| Nueva pantalla             | `docs/screen-map.md`                    |
| Nuevo componente CSS       | Este SKILL.md (sección correspondiente) |
| Cambio de flujo de usuario | `docs/modules/[modulo].md`              |

### 15.3 Verificación Final

- [ ] Ficha de módulo existe y está actualizada
- [ ] `docs/screen-map.md` refleja pantallas actuales
- [ ] No hay archivos temporales sin limpiar

---

## 16. Negative Constraints (Anti-Patterns)

> [!CRITICAL]
> **Aislamiento de Midnight Club Online (MCO)**
> Este proyecto (FormulaMid 4) y MCO son universos distintos.

1. **NO IMPORTAR tokens de MCO**:
   - ⛔ Prohibido usar colores Neon (`#00f3ff`, `#ff1a1a`).
   - ⛔ Prohibido usar fuentes "Outline" o "Brutalist".
   - ⛔ Prohibido fondo negro puro `#050505` (Usar `--bg-base` / `var(--neutral-50)`).

2. **Estilo**:
   - FM4 es **Clean, Professional, Glassmorphism**.
   - MCO es **Street, Dark, Aggressive**.
   - No mezclar. Si parece un videojuego de carreras, **ESTÁ MAL** para FM4.

---

## 🔗 Referencias

- [Guía de Módulos](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/standard-module-guide.md) — Anatomía HTML/JS
- [Estándares UI](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/ui-standards.md) — Principios y progreso
- [Componentes UI](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/ui-components.md) — Catálogo de componentes
- [Tokens CSS](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/css/tokens.css) — Variables de diseño
- [Componentes CSS](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/css/components.css) — Clases disponibles
