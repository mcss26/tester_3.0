// Module: logistica-stock.js
// Control de inventario del depósito central

(async function() {
  'use strict';
  const listContainer = document.getElementById("list-container");
  const searchInput = document.getElementById("stock-search");
  const btnRefresh = document.getElementById("btn-refresh");
  const categoryTabs = document.getElementById("category-tabs");
  const moduleContent = document.getElementById("module-content");
  const pageCardLoading = document.getElementById("page-card-loading");
  const pageCardEmpty = document.getElementById("page-card-empty");

  const ui = { pageCardLoading, pageCardEmpty, moduleContent };

  // Modal elements
  const modalAdjust = document.getElementById("modal-adjust");
  const closeModal = document.getElementById("close-modal");
  const btnCancelAdjust = document.getElementById("btn-cancel-adjust");
  const btnConfirmAdjust = document.getElementById("btn-confirm-adjust");
  const adjustSkuName = document.getElementById("adjust-sku-name");
  const adjustCurrent = document.getElementById("adjust-current");
  const adjustReal = document.getElementById("adjust-real");
  const adjustDiff = document.getElementById("adjust-diff");
  const adjustReason = document.getElementById("adjust-reason");
  const adjustNotes = document.getElementById("adjust-notes");

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["logistico", "admin"]);
  if (!session) return;

  if (!window.Utils?.assertSbOrShowBlockingError?.(listContainer)) return;

  const PAGE_KEY = "logistica-stock";
  const savedState = window.NavState ? window.NavState.restore(PAGE_KEY) : null;

  let categories = [];
  let rows = [];
  let searchTerm = savedState?.searchTerm || "";
  let activeCategoryId = savedState?.activeCategoryId || null;
  let selectedSku = null;

  // Save state on unload
  window.addEventListener("beforeunload", () => {
    if (window.NavState) {
      window.NavState.save(PAGE_KEY, {
        activeCategoryId,
        searchTerm,
      });
    }
  });

  if (searchInput && searchTerm) {
    searchInput.value = searchTerm;
  }

  const emptyState =
    '<div class="empty-state">No hay registros de stock.</div>';
  const errorState = (msg) =>
    `<div class="empty-state accent">Error: ${msg}</div>`;



  const debounce = (window.Utils && window.Utils.debounce) || ((fn, w) => fn);

  // ─────────────────────────────────────────────────────────────────────────
  // Data Loading
  // ─────────────────────────────────────────────────────────────────────────

  async function loadData() {
    window.Utils.setPageState(ui, { loading: true });
    try {
      const { data: stockData, error: stockError } = await window.sb
        .from("vw_stock_global")
        .select("*")
        .eq("activo", true)
        .order("sku_nombre");

      if (stockError) throw stockError;

      rows = (stockData || []).map((r) => ({
        id: r.sku_id,
        nombre: r.sku_nombre,
        categoria_id: r.categoria_id,
        categoria_nombre: r.categoria_nombre,
        stock_actual: Number(r.stock_actual) || 0,
        requerido: Number(r.requerido) || 0,
        estado: r.estado,
      }));

      if (rows.length === 0) {
        if (listContainer) listContainer.innerHTML = "";
        window.Utils.setPageState(ui, { loading: false, empty: true });
      } else {
        window.Utils.setPageState(ui, { loading: false, empty: false });
        renderList(filteredRows());
      }
    } catch (err) {
      console.error("Error loading stock:", err);
      // In case of error, maybe show empty state or handle differently
       window.Utils.setPageState(ui, { loading: false });
    } finally {
       // Handled above
    }
  }

  async function loadCategories() {
    try {
      const { data, error } = await window.sb
        .from("master_categories")
        .select("id, nombre")
        .eq("active", true)
        .order("nombre");
      if (error) throw error;
      categories = data || [];
      renderCategoryTabs();
    } catch (err) {
      console.error("Error loading categories:", err);
      categories = [];
      renderCategoryTabs();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────────────────────────────────

  function renderCategoryTabs() {
    if (!categoryTabs) return;
    const allBtn = `<button class="tab-chip cat-tab ${activeCategoryId ? "" : "active"}" data-id="">Todos</button>`;
    const catBtns = (categories || []).map(
      (cat) => `
            <button class="tab-chip cat-tab ${activeCategoryId === cat.id ? "active" : ""}" data-id="${cat.id}">
                ${window.Utils.escapeHtml(cat.nombre)}
            </button>
        `,
    );
    categoryTabs.innerHTML = [allBtn, ...catBtns].join("");
  }

  function filteredRows() {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchCat =
        !activeCategoryId ||
        String(r.categoria_id || "") === String(activeCategoryId);
      const matchSearch =
        !term || (r.nombre || "").toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }

  function getStatusClass(estado) {
    switch (estado) {
      case "Crítico":
        return "status-pill status-error";
      case "Bajo":
        return "status-pill status-warning";
      default:
        return "status-pill status-success";
    }
  }

  function getStatusIcon(estado) {
    switch (estado) {
      case "Crítico":
        return "🔴";
      case "Bajo":
        return "🟡";
      default:
        return "🟢";
    }
  }

  function renderList(data) {
    if (!listContainer) return;
    if (!data || data.length === 0) {
      listContainer.innerHTML = emptyState;
      return;
    }

    let html = `
            <div class="table-scroll">
                <table class="table">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">SKU</th>
                            <th class="table-cell is-header cell-pad">Categoría</th>
                            <th class="table-cell is-header cell-pad">Stock Actual</th>
                            <th class="table-cell is-header cell-pad">Requerido</th>
                            <th class="table-cell is-header cell-pad">Diferencia</th>
                            <th class="table-cell is-header cell-pad">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    data.forEach((item) => {
      const diff = item.stock_actual - item.requerido;
      const diffClass =
        diff < 0 ? "text-error" : diff > 0 ? "text-success" : "muted";
      const diffSign = diff > 0 ? "+" : "";

      html += `
                <tr class="table-row">
                    <td class="table-cell cell-pad">${getStatusIcon(item.estado)}</td>
                    <td class="table-cell cell-pad cell-strong">${window.Utils.escapeHtml(item.nombre || "SKU sin nombre")}</td>
                    <td class="table-cell cell-pad muted">${item.categoria_nombre || "-"}</td>
                    <td class="table-cell cell-pad cell-stronger">${item.stock_actual}</td>
                    <td class="table-cell cell-pad muted">${item.requerido}</td>
                    <td class="table-cell cell-pad ${diffClass}">${diffSign}${diff}</td>
                    <td class="table-cell cell-pad">
                        <button class="btn-ghost btn-sm btn-adjust" data-id="${item.id}" data-nombre="${window.Utils.escapeHtml(item.nombre)}" data-stock="${item.stock_actual}">
                            Ajustar
                        </button>
                    </td>
                </tr>
            `;
    });

    html += `</tbody></table></div>`;
    listContainer.innerHTML = html;

    // Bind adjust buttons
    listContainer.querySelectorAll(".btn-adjust").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = btn.dataset.id;
        const nombre = btn.dataset.nombre;
        const stock = parseInt(btn.dataset.stock) || 0;
        openAdjustModal(id, nombre, stock);
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Modal de Ajustes
  // ─────────────────────────────────────────────────────────────────────────

  function openAdjustModal(skuId, skuNombre, stockActual) {
    selectedSku = { id: skuId, nombre: skuNombre, stock: stockActual };

    if (adjustSkuName) adjustSkuName.textContent = skuNombre;
    if (adjustCurrent) adjustCurrent.value = stockActual;
    if (adjustReal) adjustReal.value = stockActual;
    if (adjustDiff) adjustDiff.value = "0";
    if (adjustReason) adjustReason.value = "";
    if (adjustNotes) adjustNotes.value = "";

    if (modalAdjust) modalAdjust.style.display = "flex";
  }

  function closeAdjustModal() {
    if (modalAdjust) modalAdjust.style.display = "none";
    selectedSku = null;
  }

  function updateDiff() {
    if (!adjustCurrent || !adjustReal || !adjustDiff) return;
    const current = parseInt(adjustCurrent.value) || 0;
    const real = parseInt(adjustReal.value) || 0;
    const diff = real - current;
    const sign = diff > 0 ? "+" : "";
    adjustDiff.value = `${sign}${diff}`;
  }

  async function confirmAdjust() {
    if (!selectedSku) return;

    const realQty = parseInt(adjustReal.value);
    const reason = adjustReason.value;
    const notes = adjustNotes.value.trim();

    // Validaciones
    if (isNaN(realQty) || realQty < 0) {
      window.Toast.warning("Ingrese una cantidad válida");
      return;
    }
    if (!reason) {
      window.Toast.warning("Seleccione un motivo para el ajuste");
      return;
    }

    const diff = realQty - selectedSku.stock;
    if (diff === 0) {
      window.Toast.info("No hay diferencia para ajustar");
      return;
    }

    try {
      // 1. Insertar movimiento de inventario
      const movementType = diff > 0 ? "in" : "out";
      const { error: movError } = await window.sb
        .from("inventory_movements")
        .insert({
          sku_id: selectedSku.id,
          created_by: session.user.id,
          type: "adjust",
          quantity: Math.abs(diff),
          cost: 0, // Se podría calcular si es necesario
          notes: `[${reason.toUpperCase()}] ${notes}`.trim(),
        });

      if (movError) throw movError;

      // 2. Insertar registro de ajuste formal
      const { error: adjError } = await window.sb
        .from("inventory_stock_adjustments")
        .insert({
          sku_id: selectedSku.id,
          adjusted_by: session.user.id,
          quantity_diff: diff,
          reason: reason,
          notes: notes || null,
        });

      if (adjError) throw adjError;

      // 3. Actualizar stock actual
      const { error: stockError } = await window.sb
        .from("inventory_stock")
        .update({ quantity: realQty, updated_at: new Date().toISOString() })
        .eq("sku_id", selectedSku.id);

      if (stockError) throw stockError;

      window.Toast.success("Ajuste registrado correctamente");
      closeAdjustModal();
      await loadData();
    } catch (err) {
      console.error("Error saving adjustment:", err);
      window.Toast.error("Error al guardar el ajuste: " + err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────

  if (searchInput) {
    const handleSearch = debounce((e) => {
      searchTerm = e.target.value || "";
      renderList(filteredRows());
    });
    searchInput.addEventListener("input", handleSearch);
  }

  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => loadData());
  }

  if (closeModal) closeModal.addEventListener("click", closeAdjustModal);
  if (btnCancelAdjust)
    btnCancelAdjust.addEventListener("click", closeAdjustModal);
  if (btnConfirmAdjust)
    btnConfirmAdjust.addEventListener("click", confirmAdjust);

  if (adjustReal) {
    adjustReal.addEventListener("input", updateDiff);
  }

  // Category tabs
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("cat-tab")) {
      const id = e.target.dataset.id;
      activeCategoryId = id || null;
      renderCategoryTabs();
      renderList(filteredRows());
    }
  });

  // Click outside modal to close
  if (modalAdjust) {
    modalAdjust.addEventListener("click", (e) => {
      if (e.target === modalAdjust) closeAdjustModal();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────────────────

  await loadCategories();
  await loadData();
})();
