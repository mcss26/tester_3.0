/**
 * Admin Stock Controller
 * Logic for Inventory Overview, Filtering and State Management
 */

(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect([
    "admin",
    "contable",
    "logistica",
  ]);
  if (!session) return;

  // 2. DOM Elements
  const ui = {
    listContainer: document.getElementById("list-container"),
    moduleContent: document.getElementById("module-content"),
    inpSearch: document.getElementById("stock-search"),
    btnRefresh: document.getElementById("btn-refresh"),
    filterGroup: document.getElementById("stock-tabs"),
    countTotal: document.getElementById("count-total"),

    // Panel
    panelTitle: document.getElementById("panel-title"),
    panelContent: document.getElementById("panel-content"),
    btnSavePanel: document.getElementById("btn-save-panel"),

    // Global States
    loadingState: document.getElementById("page-card-loading"),
    emptyState: document.getElementById("page-card-empty"),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.listContainer)) return;

  // 3. State
  const PAGE_KEY = "admin-stock";
  const savedState = window.NavState ? window.NavState.restore(PAGE_KEY) : null;

  const state = {
    categories: [],
    rows: [], // merged stock data from vw_stock_global
    activeCategoryId: savedState?.activeCategoryId || "", // empty = all
    searchTerm: savedState?.searchTerm || "",
    firstLoad: !savedState,
    editingItem: null,
  };

  // Restore UI
  if (state.searchTerm && ui.inpSearch) ui.inpSearch.value = state.searchTerm;

  // Save state on unload
  window.addEventListener("beforeunload", () => {
    if (window.NavState) {
      window.NavState.save(PAGE_KEY, {
        activeCategoryId: state.activeCategoryId,
        searchTerm: state.searchTerm,
      });
    }
  });

  // 4. Panel Integration
  const panelCtrl = window.initSlidePanel({
    onOpen: () => {},
    onClose: () => {
      state.editingItem = null;
      ui.panelContent.innerHTML = "";
    },
  });

  // 5. Helpers
  function updateSummary() {
    if (!ui.countTotal) return;
    ui.countTotal.textContent = state.rows.length;
    renderCategoryTabs();
  }

  function renderCategoryTabs() {
    if (!ui.filterGroup) return;

    const total = state.rows.length;
    const catCounts = {};
    state.rows.forEach((r) => {
      const catId = r.master_sku?.categoria_id || "null";
      catCounts[catId] = (catCounts[catId] || 0) + 1;
    });

    const allActive = state.activeCategoryId === "" ? "active" : "";
    const allHtml = `
            <button class="status-pill status-neutral topbar-pill topbar-pill-quiet filter-pill ${allActive}" data-id="">
                Todos <span class="pill-count">${total}</span>
            </button>
        `;

    const catHtml = state.categories
      .map((cat) => {
        const active =
          state.activeCategoryId === String(cat.id) ? "active" : "";
        const count = catCounts[cat.id] || 0;
        return `
                <button class="status-pill status-neutral topbar-pill topbar-pill-quiet filter-pill ${active}" data-id="${cat.id}">
                    ${window.Utils.escapeHtml(cat.nombre)} <span class="pill-count">${count}</span>
                </button>
            `;
      })
      .join("");

    ui.filterGroup.innerHTML = allHtml + catHtml;

    ui.filterGroup.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.onclick = () => {
        state.activeCategoryId = btn.dataset.id;
        renderCategoryTabs();
        renderList();
      };
    });
  }

  function getFilteredData() {
    const term = state.searchTerm.toLowerCase().trim();
    return state.rows.filter((r) => {
      const sku = r.master_sku || {};
      const matchCat =
        state.activeCategoryId === "" ||
        String(sku.categoria_id) === state.activeCategoryId;
      const matchSearch =
        !term || (sku.nombre || "").toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }

  // 6. Render List
  function renderList() {
    if (!ui.listContainer) return;

    const filtered = getFilteredData();

    if (filtered.length === 0) {
      ui.listContainer.innerHTML = "";
      window.Utils.setPageState(ui, { empty: true });
      return;
    }
    window.Utils.setPageState(ui, { empty: false });

    const rowsHtml = filtered
      .map((item) => {
        const sku = item.master_sku || {};
        const valFormatted = window.Utils.formatARS(item.valorizado);

        // Status Mapping (UI standard)
        const estadoNormalized = (item.estado || "").toString().toLowerCase();
        let statusClass = "status-success";
        if (estadoNormalized.includes("crit")) statusClass = "status-error";
        else if (estadoNormalized.includes("bajo"))
          statusClass = "status-warning";

        const inactiveClass = !item.active ? "is-inactive" : "";

        return `
                <tr class="table-row ${inactiveClass}">
                    <td class="table-cell cell-pad cell-strong font-medium">${window.Utils.escapeHtml(sku.nombre || "SKU sin nombre")}</td>
                    <td class="table-cell cell-pad text-right muted">${item.requerido}</td>
                    <td class="table-cell cell-pad text-right cell-stronger">${item.stock_actual}</td>
                    <td class="table-cell cell-pad text-right muted text-xs">${valFormatted}</td>
                    <td class="table-cell cell-pad text-center"><span class="status-pill ${statusClass}">${item.estado}</span></td>
                    <td class="table-cell cell-pad text-center">
                        <label class="switch switch-sm">
                            <input type="checkbox" class="toggle-active" data-id="${item.id}" ${item.active ? "checked" : ""}>
                            <span class="slider round"></span>
                        </label>
                    </td>
                    <td class="table-cell cell-pad text-right">
                         <button class="footer-link btn-view btn-ghost btn-sm" data-id="${item.id}">Ver</button>
                    </td>
                </tr>
            `;
      })
      .join("");

    const html = `
            <div class="table-scroll">
                <table class="table table-sticky">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">SKU</th>
                            <th class="table-cell is-header cell-pad text-right">REQUERIDO</th>
                            <th class="table-cell is-header cell-pad text-right">ACTUAL</th>
                            <th class="table-cell is-header cell-pad text-right">VALORIZADO</th>
                            <th class="table-cell is-header cell-pad text-center">ESTADO</th>
                            <th class="table-cell is-header cell-pad text-center">ACTIVO</th>
                            <th class="table-cell is-header cell-pad text-right">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        `;

    ui.listContainer.innerHTML = html;
    bindListEvents();
  }

  function bindListEvents() {
    ui.listContainer.querySelectorAll(".toggle-active").forEach((toggle) => {
      toggle.addEventListener("change", async (e) => {
        const id = e.target.dataset.id;
        const checked = e.target.checked;
        await toggleActive(id, checked);
      });
    });

    ui.listContainer.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const item = state.rows.find((r) => String(r.id) === String(id));
        if (item) openDetail(item);
      });
    });
  }

  function openDetail(item) {
    state.editingItem = item;
    if (ui.panelTitle)
      ui.panelTitle.textContent = item.master_sku?.nombre || "Detalle";

    ui.panelContent.innerHTML = `
            <div class="p-4">
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Producto</span>
                        <span class="detail-value">${window.Utils.escapeHtml(item.master_sku?.nombre)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Stock Actual</span>
                        <span class="detail-value cell-stronger">${item.stock_actual}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ideal Requerido</span>
                        <span class="detail-value muted">${item.requerido}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Valorizado</span>
                        <span class="detail-value font-mono">${window.Utils.formatARS(item.valorizado)}</span>
                    </div>
                </div>
                <div class="state-block mt-4 mb-2">
                    <p class="text-xs muted">Historial y ajustes avanzados estarán disponibles próximamente.</p>
                </div>
            </div>
        `;
    panelCtrl.open();
  }

  // 7. Data Loading
  async function loadData() {
    if (state.firstLoad) {
      window.Utils.setPageState(ui, { loading: true });
      state.firstLoad = false;
    }

    if (ui.btnRefresh) ui.btnRefresh.classList.add("btn-loading");

    try {
      // Paralell loaders
      const [catResult, stockResult, skuResult] = await Promise.all([
        window.sb
          .from("master_categories")
          .select("id, nombre")
          .eq("active", true)
          .order("nombre"),
        window.sb.from("vw_stock_global").select("*").order("sku_nombre"),
        window.sb.from("master_sku").select("id, costo, categoria_id"),
      ]);

      if (stockResult.error) throw stockResult.error;

      state.categories = catResult.data || [];

      const costMap = new Map();
      const catMap = new Map();
      (skuResult.data || []).forEach((c) => {
        costMap.set(c.id, Number(c.costo) || 0);
        catMap.set(c.id, c.categoria_id);
      });

      // Merge
      state.rows = (stockResult.data || []).map((r) => {
        const skuId = r.sku_id || r.id;
        const stockActual = Number(r.stock_actual) || 0;
        const cost = costMap.get(skuId) || 0;
        const catId = r.categoria_id || catMap.get(skuId);

        return {
          id: skuId,
          master_sku: {
            id: skuId,
            nombre: r.sku_nombre,
            categoria_id: catId,
          },
          stock_actual: stockActual,
          requerido: Number(r.requerido) || 0,
          valorizado: stockActual * cost,
          estado: r.estado,
          active: r.activo,
        };
      });

      updateSummary();
      renderList();
    } catch (err) {
      console.error("Error loading stock:", err);
      window.Toast.error(
        window.Constants?.MESSAGES?.ERROR_LOAD || "Error cargando inventario",
      );
    } finally {
      window.Utils.setPageState(ui, { loading: false });
      if (ui.btnRefresh) ui.btnRefresh.classList.remove("btn-loading");
    }
  }

  async function toggleActive(id, isActive) {
    try {
      const { error } = await window.sb
        .from("master_sku")
        .update({ active: isActive })
        .eq("id", id);

      if (error) throw error;

      const row = state.rows.find((r) => String(r.id) === String(id));
      if (row) {
        row.active = isActive;
        renderList();
      }
      window.Toast.success(`Item ${isActive ? "activado" : "desactivado"}`);
    } catch (err) {
      console.error(err);
      window.Toast.error("Error al actualizar estado");
      await loadData(); // revert
    }
  }

  // 8. Bind Global Events
  function bindGlobalEvents() {
    if (ui.inpSearch) {
      ui.inpSearch.addEventListener(
        "input",
        window.Utils.debounce((e) => {
          state.searchTerm = e.target.value;
          renderList();
        }, 300),
      );
    }

    if (ui.btnRefresh) ui.btnRefresh.addEventListener("click", loadData);

    if (ui.btnSavePanel) {
      ui.btnSavePanel.addEventListener("click", () => {
        window.Toast.info("Funcionalidad en desarrollo");
        panelCtrl.close();
      });
    }
  }

  // Start
  bindGlobalEvents();
  loadData();
})();
