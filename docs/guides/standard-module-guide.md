# Guía de Implementación Estándar de Módulos (Golden Standard)

> **Estado**: Vigente
> **Golden Standard Visual**: [`admin-master-proveedores.html`](file:///Users/lucianopieve/Documents/FormulaMid%204/pages/admin/admin-master-proveedores.html) — Referencia de UI pulida
> **Golden Standard JS**: [`admin-master-sku.js`](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/js/modules/admin/admin-master-sku.js) — Referencia de estructura JS
> **Propósito**: Unificar la arquitectura técnica y visual de todos los módulos de FormulaMid 4.

---

## 1. Principios de Arquitectura

1.  **Uniformidad Visual**: Todos los módulos deben verse y comportarse igual. Un usuario no debe notar diferencia al cambiar de pantalla.
2.  **JS Defensivo**: Todo código asíncrono debe estar protegido por `try-catch` y la UI debe bloquearse o mostrar estados de carga durante las operaciones.
3.  **Dom Grouping**: Todas las referencias al DOM deben agruparse en un objeto `ui` o `refs` al inicio del script.
4.  **Feedback Constante**: El usuario siempre debe saber qué está pasando (Toast, Loading, Empty State).

---

## 2. Anatomía HTML Estándar

Todo módulo administrativo debe seguir esta estructura exacta.

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nombre del Módulo - FormulaMid</title>
    <link rel="stylesheet" href="../../assets/css/main.css" />
  </head>
  <body
    class="app-shell admin-shell admin-scroll [admin-modulo-clase]"
    data-allowed-roles="admin,contable"
  >
    <!-- 1. Topbar Navigation -->
    <!-- 1. Topbar Navigation -->
    <header class="app-topbar">
      <div class="topbar-left">
        <nav id="breadcrumbs" class="breadcrumbs"></nav>
      </div>

      <!-- Navigation Tabs (Si aplica) -->
      <nav class="topbar-center topbar-nav-split">
        <!-- ... botones de navegación de sección ... -->
        <!-- Ver sección "Topbar Balanceado" en ui-components.md -->
      </nav>

      <div class="topbar-right">
        <span
          class="system-status-pill status-open topbar-pill topbar-pill-quiet"
          >ESTADO: OK</span
        >
      </div>
    </header>

    <main class="page-shell">
      <div class="page-card-wrap">
        <!-- ... rest of page content ... -->
      </div>
    </main>

    <!-- ... Slide Panel ... -->

    <!-- Scripts -->
    <!-- Dependencias Core -->
    <!-- ... supabase, config, client, auth, utils, toast ... -->
    <script defer src="../../assets/js/core/navigation-state.js"></script>
    <script defer src="../../assets/js/core/breadcrumbs.js"></script>
    <script defer src="../../assets/js/core/navigation.js"></script>

    <script defer src="../../assets/js/modules/panel.js"></script>
    <script defer src="../../assets/js/modules/admin/admin-modulo.js"></script>

    <script>
      // Auto-render breadcrumbs
      const breadcrumbContainer = document.getElementById("breadcrumbs");
      if (breadcrumbContainer) {
        window.Breadcrumbs.render(breadcrumbContainer);
      }
    </script>
  </body>
</html>
```

---

## 3. Diccionario de Clases UI (Reference)

### Inputs y Filtros

- Search Input: `input input-compact filter-input`
- Form Input: `input w-full` (o solo `.input` si es bloque)
- Filter Pill: `status-pill topbar-pill topbar-pill-quiet filter-pill` (Estado activo: `.status-neutral` o color + `.active`)

### Tabla

- Table Container: `table-scroll`
- Table: `table table-sticky`
- Headers: `table-cell is-header cell-pad`
- Cells: `table-cell cell-pad`
- Action Buttons: `btn-ghost btn-sm`

### Textos

- Título: `dashboard-title dashboard-title-soft`
- Subtítulo: `dashboard-subtitle dashboard-subtitle-soft`
- Notas/Muted: `.muted` o `.faint`
- Énfasis: `.cell-strong`

---

## 4. Patrón JavaScript Estándar

El archivo JS debe seguir estrictamente este esqueleto para mantener consistencia y performance, integrando `NavState` para persistencia.

```javascript
/* Module: admin-modulo.js */
(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  const PAGE_KEY = "admin-modulo";

  // 2. DOM Elements (Agrupados en 'ui')
  const ui = {
    listContainer: document.getElementById("list-container"),
    searchInput: document.getElementById("search-input"),
    pageCardLoading: document.getElementById("page-card-loading"),
    pageCardEmpty: document.getElementById("page-card-empty"),
    contentWrap: document.getElementById("module-content"),
    // ... inputs del panel ...
    btnNew: document.getElementById("btn-new"),
    btnSave: document.getElementById("btn-save"),
  };

  // Validación crítica de DOM
  if (!window.Utils.assertSbOrShowBlockingError(ui.listContainer)) return;

  // 3. State & Validation
  // Restore previous state
  const savedState = window.NavState ? window.NavState.restore(PAGE_KEY) : {};

  let state = {
    dataList: [],
    editingId: null,
    searchTerm: savedState.searchTerm || "",
    activeFilter: savedState.activeFilter || "all",
  };

  // 4. Initialization (Panel)
  const panel = window.initSlidePanel({
    onOpen: () => {
      // Lógica de reset o foco
    },
    onSave: handleSave, // Función separada
  });

  // 5. Render Functions
  function renderList(data) {
    if (!ui.listContainer) return;

    // Use map().join('') for performance
    const rows = data
      .map(
        (item) => `
            <tr class="table-row">
                <td class="table-cell cell-pad cell-strong">${item.name}</td>
                <td class="table-cell cell-pad">
                    <button class="btn-ghost btn-sm btn-edit" data-id="${item.id}">Editar</button>
                </td>
            </tr>
        `,
      )
      .join("");

    ui.listContainer.innerHTML = `
            <div class="table-scroll">
                <table class="table table-sticky">
                    <!-- thead -->
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
  }

  // 5.1 Estados de página (loading/empty)
  function setPageState({ loading = false, empty = false } = {}) {
    if (ui.pageCardLoading)
      ui.pageCardLoading.classList.toggle("is-visible", loading);
    if (ui.pageCardEmpty)
      ui.pageCardEmpty.classList.toggle("is-visible", empty);
    if (ui.contentWrap)
      ui.contentWrap.classList.toggle("hidden", loading || empty);
  }

  // 6. Data Fetching
  async function loadData() {
    // Manage Loading State
    ui.pageCardLoading?.classList.add("is-visible");
    ui.pageCardEmpty?.classList.remove("is-visible");

    try {
      const { data, error } = await window.sb.from("table_name").select("*");

      if (error) throw error;
      state.dataList = data || [];

      if (state.dataList.length === 0) {
        ui.pageCardEmpty?.classList.add("is-visible");
      } else {
        renderList(state.dataList);
      }
    } catch (e) {
      console.error(e);
      window.Toast.error("Error cargando datos");
    } finally {
      ui.pageCardLoading?.classList.remove("is-visible");
    }
  }

  // 7. Event Binding
  function bindEvents() {
    // Save state on unload
    window.addEventListener("beforeunload", () => {
      if (window.NavState) {
        window.NavState.save(PAGE_KEY, {
          searchTerm: state.searchTerm,
          activeFilter: state.activeFilter,
        });
      }
    });

    // Search debounce
    if (ui.searchInput) {
      ui.searchInput.value = state.searchTerm; // Restore value
      ui.searchInput.addEventListener(
        "input",
        window.Utils.debounce((e) => {
          state.searchTerm = e.target.value;
          loadData(); // o filtrado en cliente
        }, 300),
      );
    }

    // Event Delegation para botones en tabla
    ui.listContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-edit");
      if (btn) {
        // Open edit logic
      }
    });

    // Botones primarios
    ui.btnNew?.addEventListener("click", () => panel.open());
    ui.btnSave?.addEventListener("click", panel.onSave); // Si se maneja así, o llamar directo
  }

  /**
   * Navigation:
   * - Use data-go in HTML for static links
   * - Use Navigation.navigateTo() for redirects
   */

  // 8. Init
  bindEvents();
  loadData();
})();
```

---

## 5. Patrón Landing / Dashboard (`admin-index`)

**Usage**: Pantallas principales de aterrizaje por rol (Admin, Encargado, Staff).

**Estructura Crítica**:

1. **Header (Glass)**: Bienvenida personalizada + KPIs en vivo (Estado Jornada, QRs).
2. **Segmented Nav**: Selector de rol/vista (`.segmented-control` > `.segment-btn`).
3. **Module Grid**: Layout de tarjetas de navegación filtrables (`.module-grid > .module-column > .module-card`).

```html
<!-- Grid de Módulos (Filtrable por JS) -->
<section class="module-grid">
  <div class="module-column">
    <h3>OPERACIONES</h3>
    <a
      href="#"
      class="module-card"
      data-visible-roles="admin,operativo"
      data-go="..."
    >
      Control Stock
    </a>
  </div>
</section>
```

---

## 6. Checklist de Verificación (QA)

Antes de cerrar cualquier tarea de módulo, verifica:

- [ ] **Estructura HTML**: ¿Usa `.page-card-wrap` y los componentes estándar?
- [ ] **CSS Limpio**: ¿No hay bloques `<style>` ni clases "Alien" (e.g. `mb-4`, `flex`) en el HTML?
- [ ] **Estado de Carga**: ¿Se ve el spinner (`.page-card-loading`) al iniciar?
- [ ] **Estado Vacío**: ¿Se ve el mensaje de "Sin resultados" si la tabla está vacía?
- [ ] **Panel CRUD**: ¿El panel desliza correctamente y tiene el overlay funcional?
- [ ] **Feedback**: ¿Guarda/Actualiza mostrando Toast success/error?
- [ ] **Consola Limpia**: ¿No hay errores rojos ni logs innecesarios en consola?
