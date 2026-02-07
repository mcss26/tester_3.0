// Module: admin-solicitudes.js
// Logic for Requests Management (Pedidos)

(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  // 2. DOM Elements (Grouped)
  const ui = {
    // Main containers
    moduleContent: document.getElementById("module-content"),
    loadingState: document.getElementById("page-card-loading"),
    emptyState: document.getElementById("page-card-empty"),
    btnReloadEmpty: document.getElementById("btn-reload-empty"),

    // Views containers
    viewPreAprobacion: document.getElementById("view-pre-aprobacion"),
    viewPendientes: document.getElementById("view-pendientes"),
    viewUnassigned: document.getElementById("view-unassigned"),
    viewHistorial: document.getElementById("view-historial"),

    // List containers (inner scrolls)
    subviewPorItem: document.getElementById("subview-por-item"),
    subviewPorProveedor: document.getElementById("subview-por-proveedor"),
    listContainer: document.getElementById("list-container"),
    unassignedContainer: document.getElementById("unassigned-container"),
    historialContainer: document.getElementById("historial-container"),

    // Tabs and sub-tabs
    tabs: document.querySelectorAll("[data-tab]"),
    subtabs: document.querySelectorAll("[data-subtab]"),

    // Stats — Summary Metric Cards
    statDeficitCount: document.getElementById("stat-deficit-count"),
    statTotalCost: document.getElementById("stat-total-cost"),
    statSupplierCount: document.getElementById("stat-supplier-count"),
    preapprovalMetrics: document.getElementById("preapproval-metrics"),
    unassignedStats: document.getElementById("unassigned-stats"),
    unassignedTotalBudget: document.getElementById("unassigned-total-budget"),

    // Actions
    preapprovalBulkActions: document.getElementById("preapproval-bulk-actions"),
    btnPreapproveSelected: document.getElementById("btn-preapprove-selected"),
    btnPrerejectSelected: document.getElementById("btn-prereject-selected"),
    preapprovalSelectionInfo: document.getElementById(
      "preapproval-selection-info",
    ),

    // Panel
    panelTitle: document.getElementById("panel-title"),
    panelContent: document.getElementById("order-detail-content"),
    panelActions: document.getElementById("panel-actions"),
    rejectContainer: document.getElementById("reject-reason-container"),
    rejectInput: document.getElementById("reject-reason"),

    // Modal
    modalPrereject: document.getElementById("modal-prereject"),
    formPrereject: document.getElementById("form-prereject"),
    prerejectCount: document.getElementById("prereject-count"),
    prerejectReason: document.getElementById("prereject-reason"),

    // Topbar Dropdowns
    btnNotifications: document.getElementById("btn-notifications"),
    menuNotifications: document.getElementById("notifications-menu"),
    btnUserAvatar: document.getElementById("user-avatar"),
    menuUser: document.getElementById("user-menu"),
    logoutBtn: document.getElementById("btn-logout"),
    userNameDisplay: document.getElementById("user-name-display"),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.listContainer)) return;

  // 3. State
  const PAGE_KEY = "admin-solicitudes";
  const savedState = window.NavState ? window.NavState.restore(PAGE_KEY) : null;

  let orders = []; // For Pendientes
  let preapprovalItems = []; // For Pre-Aprobación
  let selectedItemIds = new Set(); // Selected items for bulk actions
  let activeTab = savedState?.activeTab || "pre-aprobacion";
  let activeSubtab = savedState?.activeSubtab || "item"; // 'item' or 'proveedor'
  let pendingRejectIds = [];

  // Save state on unload
  window.addEventListener("beforeunload", () => {
    if (window.NavState) {
      window.NavState.save(PAGE_KEY, {
        activeTab,
        activeSubtab,
      });
    }
  });

  // 4. Panel Integration
  const panelCtrl = window.initSlidePanel({
    onOpen: () => {
      ui.rejectContainer?.classList.add("hidden");
      if (ui.rejectInput) ui.rejectInput.value = "";
    },
    onClose: () => {
      if (ui.panelContent) ui.panelContent.innerHTML = "";
      if (ui.panelActions) ui.panelActions.innerHTML = "";
    },
  });

  function setPageState(state) {
    if (!window.Utils?.setPageState) return;
    const uiRefs = {
      loadingState: ui.loadingState,
      moduleContent: ui.moduleContent,
      emptyState: ui.emptyState,
    };
    if (state === "loading") {
      window.Utils.setPageState(uiRefs, { loading: true, empty: false });
    } else if (state === "empty") {
      window.Utils.setPageState(uiRefs, { loading: false, empty: true });
    } else {
      window.Utils.setPageState(uiRefs, { loading: false, empty: false });
    }
  }

  // 6. Tab Logic (Custom implementation for is-active support)
  function initTabs() {
    ui.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const newTab = tab.dataset.tab;
            if (newTab === activeTab) return;
            switchTab(newTab);
        });
    });
    // Set initial state
    switchTab(activeTab);
  }

  function switchTab(tabId) {
    activeTab = tabId;
    ui.tabs.forEach((t) => {
      const isActive = t.dataset.tab === tabId;
      // tab-chip uses 'active', pill uses 'is-active'
      if (t.classList.contains('tab-chip')) {
        t.classList.toggle('active', isActive);
      } else {
        t.classList.toggle('is-active', isActive);
      }
    });

    // Show summary metrics only on pre-aprobacion
    ui.preapprovalMetrics?.classList.toggle('hidden', tabId !== 'pre-aprobacion');

    refreshViews(tabId);
  }

  function switchSubtab(subtabId) {
    activeSubtab = subtabId;

    ui.subtabs.forEach((t) => {
      t.classList.toggle("is-active", t.dataset.subtab === subtabId);
      t.classList.remove("active");
    });

    ui.subviewPorItem?.classList.toggle("hidden", subtabId !== "item");
    ui.subviewPorProveedor?.classList.toggle("hidden", subtabId !== "proveedor");
    ui.preapprovalBulkActions?.classList.toggle("hidden", subtabId !== "item");

    if (subtabId === "item") renderPreApprovalByItem(preapprovalItems);
    else renderPreApprovalBySupplier(preapprovalItems);
  }

  function refreshViews(tabId) {
    // Hide all
    ui.viewPreAprobacion?.classList.add("hidden");
    ui.viewPendientes?.classList.add("hidden");
    ui.viewUnassigned?.classList.add("hidden");
    ui.viewHistorial?.classList.add("hidden");

    // Show active & Load Data
    if (tabId === "pre-aprobacion") {
      ui.viewPreAprobacion?.classList.remove("hidden");
      loadPreApprovalItems();
    } else if (tabId === "pendientes") {
      ui.viewPendientes?.classList.remove("hidden");
      loadOrders();
    } else if (tabId === "sin-asignar") {
      ui.viewUnassigned?.classList.remove("hidden");
      loadUnassigned();
    } else if (tabId === "historial") {
      ui.viewHistorial?.classList.remove("hidden");
    }
  }

  // 7. Data Fetching (Pre-Aprobación) — Auto-detección con ideal dinámico
  async function loadPreApprovalItems() {
    if (activeTab !== "pre-aprobacion") return;
    setPageState("loading");

    try {
      // ── 1. Date range (last 30 days) ──
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 30);
      const startDate = past.toISOString().split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      // ── 2. Fetch ALL active SKUs with provider info ──
      const { data: skus, error: skuErr } = await window.sb
        .from("master_sku")
        .select(
          "id, nombre, pack_qty, costo, costo_pack, proveedor_default_id, active",
        )
        .eq("active", true)
        .order("nombre");

      if (skuErr) throw skuErr;
      if (!skus || skus.length === 0) {
        preapprovalItems = [];
        renderPreApprovalByItem([]);
        updatePreApprovalStats([]);
        setPageState("empty");
        return;
      }

      // ── 3. Fetch stock levels from vw_stock_global ──
      const { data: stockData } = await window.sb
        .from("vw_stock_global")
        .select("sku_id, stock_actual, requerido");

      const stockMap = {};
      (stockData || []).forEach((s) => (stockMap[s.sku_id] = s));

      // ── 4. Fetch consumption reports in range ──
      const { data: reports } = await window.sb
        .from("consumption_reports")
        .select("id")
        .gte("operational_date", startDate)
        .lte("operational_date", endDate);

      const reportIds = (reports || []).map((r) => r.id);

      // ── 5. Fetch consumption details ──
      let consumptionMap = {};
      if (reportIds.length > 0) {
        const { data: details } = await window.sb
          .from("consumption_details")
          .select("sku_id, quantity")
          .in("report_id", reportIds);
        (details || []).forEach((d) => {
          consumptionMap[d.sku_id] =
            (consumptionMap[d.sku_id] || 0) + (d.quantity || 0);
        });
      }

      // ── 6. Get average attendance for ideal calculation ──
      const { data: workDays } = await window.sb
        .from("work_days")
        .select("attendance")
        .gte("work_date", startDate)
        .lte("work_date", endDate)
        .eq("status", "closed");

      const validDays = (workDays || []).filter(
        (d) => d.attendance && d.attendance > 0,
      );
      const avgPeople =
        validDays.length > 0
          ? Math.round(
              validDays.reduce((s, d) => s + d.attendance, 0) /
                validDays.length,
            )
          : 500; // Fallback default

      // ── 7. Get supplier names ──
      const supplierIds = skus
        .map((s) => s.proveedor_default_id)
        .filter(Boolean);
      let suppliersMap = {};
      if (supplierIds.length > 0) {
        const { data: suppliers } = await window.sb
          .from("master_proveedores")
          .select("id, nombre_fantasia")
          .in("id", [...new Set(supplierIds)]);
        (suppliers || []).forEach((s) => (suppliersMap[s.id] = s));
      }

      // ── 8. Build items with dynamic ideal calculation ──
      const allItems = skus.map((sku) => {
        const stockInfo = stockMap[sku.id] || {};
        const consumption = consumptionMap[sku.id] || 0;
        const actual = stockInfo.stock_actual ?? 0;

        // Dynamic ideal: same formula as admin-central-stock
        let ideal = 0;
        if (avgPeople > 0 && consumption > 0) {
          ideal = Math.ceil((consumption / avgPeople) * avgPeople);
        } else {
          ideal = stockInfo.requerido ?? 0; // Fallback to static
        }

        const deficitUnits = Math.max(0, ideal - actual);
        const packQty = sku.pack_qty || 1;
        const deficitPacks = Math.ceil(deficitUnits / packQty);
        const packCost =
          sku.costo_pack != null
            ? sku.costo_pack
            : (sku.costo || 0) * packQty;
        const estimatedCost = deficitPacks * packCost;

        const supplierId = sku.proveedor_default_id || null;
        const supplierName = supplierId
          ? suppliersMap[supplierId]?.nombre_fantasia || "Sin asignar"
          : "Sin asignar";

        return {
          id: sku.id,
          sku_id: sku.id,
          sku_nombre: sku.nombre || "Unknown",
          stock_actual: actual,
          stock_ideal: ideal,
          consumption: consumption,
          deficit_units: deficitUnits,
          deficit_packs: deficitPacks,
          pack_qty: packQty,
          estimated_cost: estimatedCost,
          supplier_id: supplierId,
          supplier_name: supplierName,
        };
      });

      // ── 9. Filter: only SKUs below their dynamic ideal ──
      preapprovalItems = allItems.filter(
        (item) => item.stock_ideal > 0 && item.deficit_units > 0,
      );

      // Sort by largest deficit first
      preapprovalItems.sort((a, b) => b.deficit_units - a.deficit_units);

      if (activeSubtab === "item") {
        renderPreApprovalByItem(preapprovalItems);
      } else {
        renderPreApprovalBySupplier(preapprovalItems);
      }
      updatePreApprovalStats(preapprovalItems);
    } catch (err) {
      console.error("Auto-Detection Load Error:", err);
      window.Toast?.error("Error cargando stock: " + err.message);
    } finally {
      setPageState(preapprovalItems.length === 0 ? "empty" : "ready");
    }
  }

  // 8. Render Pre-Approval (Auto-detected items)
  function renderPreApprovalByItem(items) {
    if (!ui.subviewPorItem) return;

    if (items.length === 0) {
      ui.subviewPorItem.innerHTML = `<div class="empty-state">Todos los SKUs activos están al nivel de stock ideal. ✓</div>`;
      return;
    }

    const rows = items
      .map((item) => {
        const isSelected = selectedItemIds.has(item.id);
        const urgencyClass =
          item.stock_actual === 0
            ? "text-error"
            : item.deficit_units > item.stock_ideal * 0.5
              ? "text-warning"
              : "";
        const namePrefix = item.stock_actual === 0 ? '<span class="urgent-indicator"></span>' : '';
        return `
                <tr role="row">
                    <td class="table-cell cell-pad text-center">
                        <input type="checkbox" class="js-item-checkbox" data-id="${item.id}" ${isSelected ? "checked" : ""}>
                    </td>
                    <td class="table-cell cell-pad">${namePrefix}${window.Utils.escapeHtml(item.sku_nombre)}</td>
                    <td class="table-cell cell-pad text-right font-mono ${urgencyClass}">${item.stock_actual}</td>
                    <td class="table-cell cell-pad text-right font-mono muted">${item.stock_ideal}</td>
                    <td class="table-cell cell-pad text-right font-mono ${urgencyClass}">${item.deficit_units}</td>
                    <td class="table-cell cell-pad text-right font-mono">${item.deficit_packs}</td>
                    <td class="table-cell cell-pad text-right font-mono muted">${window.Utils.formatARS(item.estimated_cost)}</td>
                    <td class="table-cell cell-pad muted">${window.Utils.escapeHtml(item.supplier_name)}</td>
                    <td class="table-cell cell-pad text-center">
                        <button class="btn-ghost btn-sm btn-success js-preapprove-single" data-id="${item.id}" aria-label="Aprobar">✓</button>
                        <button class="btn-ghost btn-sm text-error js-prereject-single" data-id="${item.id}" aria-label="Rechazar">✕</button>
                    </td>
                </tr>
            `;
      })
      .join("");

    ui.subviewPorItem.innerHTML = `
            <div class="table-scroll">
                <table class="table table-sticky table-compact" role="table" aria-label="SKUs con déficit de stock">
                    <thead>
                        <tr role="row">
                            <th class="table-cell is-header cell-pad text-center" role="columnheader" style="width: 40px;">
                                <input type="checkbox" id="select-all-items" title="Seleccionar todos">
                            </th>
                            <th class="table-cell is-header cell-pad" role="columnheader" scope="col">SKU</th>
                            <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Actual</th>
                            <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Ideal</th>
                            <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Déficit</th>
                            <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Packs</th>
                            <th class="table-cell is-header cell-pad text-right" role="columnheader" scope="col">Costo Est.</th>
                            <th class="table-cell is-header cell-pad" role="columnheader" scope="col">Proveedor</th>
                            <th class="table-cell is-header cell-pad text-center" role="columnheader" scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
  }

  function renderPreApprovalBySupplier(items) {
    if (!ui.subviewPorProveedor) return;

    if (items.length === 0) {
      ui.subviewPorProveedor.innerHTML = `<div class="empty-state">Sin déficits detectados.</div>`;
      return;
    }

    const bySupplier = {};
    items.forEach((item) => {
      const key = item.supplier_id || "sin-asignar";
      if (!bySupplier[key]) {
        bySupplier[key] = {
          supplier_id: item.supplier_id,
          supplier_name: item.supplier_name,
          items: [],
          total_cost: 0,
        };
      }
      bySupplier[key].items.push(item);
      bySupplier[key].total_cost += item.estimated_cost;
    });

    const cards = Object.values(bySupplier)
      .sort((a, b) => b.total_cost - a.total_cost)
      .map((group) => {
        const itemSkuIds = group.items.map((i) => i.sku_id);
        const allSelected = itemSkuIds.every((id) =>
          selectedItemIds.has(id),
        );

        const itemRows = group.items
          .map(
            (item) => `
                <div class="supplier-card-item">
                    <span class="text-sm">${window.Utils.escapeHtml(item.sku_nombre)}</span>
                    <span class="text-sm muted font-mono">-${item.deficit_units} u. → ${item.deficit_packs} packs</span>
                </div>
            `,
          )
          .join("");

        return `
                <div class="supplier-card">
                    <div class="supplier-card-header">
                        <div class="supplier-card-header-left">
                            <input type="checkbox" class="js-supplier-checkbox" data-supplier-id="${group.supplier_id || ""}" data-item-ids='${JSON.stringify(itemSkuIds)}' ${allSelected ? "checked" : ""}>
                            <h3>${window.Utils.escapeHtml(group.supplier_name)}</h3>
                            <span class="badge status-neutral">${group.items.length} items</span>
                        </div>
                        <span class="font-mono">${window.Utils.formatARS(group.total_cost)}</span>
                    </div>
                    <div class="supplier-card-body">
                        ${itemRows}
                    </div>
                    <div class="supplier-card-footer">
                        <button class="btn-primary btn-sm js-preapprove-supplier" data-item-ids='${JSON.stringify(itemSkuIds)}'>Aprobar Todo</button>
                        <button class="btn-ghost btn-sm text-error js-prereject-supplier" data-item-ids='${JSON.stringify(itemSkuIds)}'>Ignorar</button>
                    </div>
                </div>
            `;
      })
      .join("");

    ui.subviewPorProveedor.innerHTML = cards;
  }

  function updatePreApprovalStats(items) {
    const count = items.length;
    const totalBudget = items.reduce((sum, i) => sum + i.estimated_cost, 0);
    const uniqueSuppliers = new Set(items.map(i => i.supplier_id).filter(Boolean)).size;

    // Summary metric cards (Golden Standard)
    if (ui.statDeficitCount) ui.statDeficitCount.textContent = count;
    if (ui.statTotalCost) ui.statTotalCost.textContent = window.Utils.formatARS(totalBudget);
    if (ui.statSupplierCount) ui.statSupplierCount.textContent = uniqueSuppliers;
  }

  function updateSelectionUI() {
    const count = selectedItemIds.size;
    if (ui.preapprovalSelectionInfo)
      ui.preapprovalSelectionInfo.textContent = `${count} seleccionados`;
    if (ui.btnPreapproveSelected)
      ui.btnPreapproveSelected.disabled = count === 0;
    if (ui.btnPrerejectSelected) ui.btnPrerejectSelected.disabled = count === 0;
  }

  // 9. Data Fetching (Pendientes/Orders)
  async function loadOrders() {
    if (activeTab !== "pendientes") return;
    setPageState("loading");

    try {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 30);

      const { data: requests, error: reqError } = await window.sb
        .from("replenishment_requests")
        .select("id")
        .gte("operational_date", past.toISOString().split("T")[0])
        .neq("status", "cancelled");

      if (reqError) throw reqError;
      const requestIds = (requests || []).map((r) => r.id);

      if (requestIds.length === 0) {
        renderOrders([]);
        setPageState("empty");
        return;
      }

      const { data: rawOrders, error: ordError } = await window.sb
        .from("replenishment_supplier_orders")
        .select(`*, master_proveedores (nombre_fantasia)`)
        .in("request_id", requestIds)
        .neq("status", "cancelled")
        .order("eta_date", { ascending: true })
        .limit(10000);

      if (ordError) throw ordError;

      const orderIds = rawOrders.map((o) => o.id);
      let itemsMap = {};
      if (orderIds.length > 0) {
        const { data: items, error: itemError } = await window.sb
          .from("replenishment_items")
          .select(
            `id, supplier_order_id, requested_packs, master_sku (nombre, pack_qty, costo, costo_pack)`,
          )
          .in("supplier_order_id", orderIds);

        if (itemError) throw itemError;
        (items || []).forEach((item) => {
          if (!itemsMap[item.supplier_order_id])
            itemsMap[item.supplier_order_id] = [];
          itemsMap[item.supplier_order_id].push(item);
        });
      }

      orders = rawOrders.map((o) => {
        const ordItems = itemsMap[o.id] || [];
        const totalBudget = ordItems.reduce((sum, item) => {
          const packs = item.requested_packs || 0;
          const sku = item.master_sku || {};
          const unitCost = sku.costo || 0;
          const packQty = sku.pack_qty || 1;
          const packCost =
            sku.costo_pack !== null ? sku.costo_pack : unitCost * packQty;
          return sum + packs * packCost;
        }, 0);

        return {
          id: o.id,
          proveedor: o.master_proveedores?.nombre_fantasia || "Desconocido",
          status: o.status,
          eta_date: o.eta_date,
          final_cost: o.final_cost,
          presupuesto: totalBudget,
          items: ordItems,
        };
      });

      renderOrders(orders);
    } catch (err) {
      console.error("Load Error:", err);
      window.Toast?.error("Error cargando pedidos");
    } finally {
      setPageState(orders.length === 0 ? "empty" : "ready");
    }
  }

  function renderOrders(data) {
    if (!ui.listContainer) return;
    const activeOrders = data.filter((o) =>
      ["draft", "ready_for_approval"].includes(o.status),
    );

    if (activeOrders.length === 0) {
      ui.listContainer.innerHTML = `<div class="empty-state">No hay pedidos pendientes de aprobación final.</div>`;
      return;
    }

    const rows = activeOrders
      .map((o) => {
        const costoFinal =
          o.final_cost !== null ? window.Utils.formatARS(o.final_cost) : "-";
        const presupuesto = window.Utils.formatARS(o.presupuesto);
        const statusBadge = window.Utils.renderStatusBadge(o.status);

        return `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong font-medium">${window.Utils.escapeHtml(o.proveedor)}</td>
                    <td class="table-cell cell-pad text-center">${o.items.length}</td>
                    <td class="table-cell cell-pad text-right muted font-mono text-sm">${presupuesto}</td>
                    <td class="table-cell cell-pad text-right cell-stronger font-mono">${costoFinal}</td>
                    <td class="table-cell cell-pad text-center muted">${o.eta_date || "-"}</td>
                    <td class="table-cell cell-pad text-center">${statusBadge}</td>
                    <td class="table-cell cell-pad text-right">
                        <button class="footer-link btn-ghost btn-sm js-view-order" data-id="${o.id}">Ver</button>
                    </td>
                </tr>
             `;
      })
      .join("");

    ui.listContainer.innerHTML = `
            <div class="table-scroll">
                <table class="table table-sticky table-compact">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">Proveedor</th>
                            <th class="table-cell is-header cell-pad text-center">Items</th>
                            <th class="table-cell is-header cell-pad text-right">Presupuesto Est.</th>
                            <th class="table-cell is-header cell-pad text-right">Costo Final</th>
                            <th class="table-cell is-header cell-pad text-center">Fecha Entrega</th>
                            <th class="table-cell is-header cell-pad text-center">Estado</th>
                            <th class="table-cell is-header cell-pad text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
  }

  // 10. Data Fetching (Unassigned)
  async function loadUnassigned() {
    if (!ui.unassignedContainer) return;
    setPageState({ loading: true });

    try {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 30);

      const { data: requests } = await window.sb
        .from("replenishment_requests")
        .select("id")
        .gte("operational_date", past.toISOString().split("T")[0])
        .neq("status", "cancelled");

      const requestIds = (requests || []).map((r) => r.id);
      if (requestIds.length === 0) {
        renderUnassigned([], {});
        setPageState("empty");
        return;
      }

      const { data: items } = await window.sb
        .from("replenishment_items")
        .select(`*, master_sku (id, nombre, pack_qty, costo, costo_pack)`)
        .in("request_id", requestIds)
        .neq("status", "cancelled")
        .limit(10000);

      const skuIds = (items || []).map((i) => i.sku_id);
      let stockMap = {};
      if (skuIds.length > 0) {
        const { data: stocks } = await window.sb
          .from("vw_stock_global")
          .select("*")
          .in("sku_id", skuIds);
        (stocks || []).forEach((s) => (stockMap[s.sku_id] = s));
      }

      const orderIds = (items || [])
        .map((i) => i.supplier_order_id)
        .filter(Boolean);
      let orderMap = {};
      if (orderIds.length > 0) {
        const { data: os } = await window.sb
          .from("replenishment_supplier_orders")
          .select("id, eta_date")
          .in("id", orderIds);
        (os || []).forEach((o) => (orderMap[o.id] = o));
      }

      const unassignedItems = (items || []).filter((item) => {
        if (!item.supplier_id) return true;
        if (!item.supplier_order_id) return true;
        const order = orderMap[item.supplier_order_id];
        if (!order || !order.eta_date) return true;
        return false;
      });

      renderUnassigned(unassignedItems, stockMap);
    } catch (err) {
      console.error(err);
      ui.unassignedContainer.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    } finally {
      setPageState("ready");
    }
  }

  function renderUnassigned(items, stockMap) {
    if (items.length === 0) {
      ui.unassignedContainer.innerHTML = `<div class="empty-state">Todo asignado correctamente.</div>`;
      if (ui.unassignedTotalBudget)
        ui.unassignedTotalBudget.textContent = "$0,00";
      return;
    }

    let totalBudget = 0;

    const rows = items
      .map((item) => {
        const stockData = stockMap[item.sku_id];
        const sku = item.master_sku || {};
        const calc = window.Utils.calcReplenishment({
          requerido: stockData?.requerido,
          stock_actual: stockData?.stock_actual,
          pack_qty: sku.pack_qty,
        });

        const packCost =
          sku.costo_pack !== null
            ? sku.costo_pack
            : (sku.costo || 0) * (sku.pack_qty || 1);
        const itemEst = calc.pack * packCost;
        totalBudget += itemEst;

        return `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong font-medium">${window.Utils.escapeHtml(sku.nombre || "Unknown")}</td>
                    <td class="table-cell cell-pad text-center">${calc.unidades}</td>
                    <td class="table-cell cell-pad text-center">${calc.pack}</td>
                    <td class="table-cell cell-pad text-center cell-strong">${calc.total}</td>
                    <td class="table-cell cell-pad text-right muted font-mono text-sm">${window.Utils.formatARS(itemEst)}</td>
                </tr>
            `;
      })
      .join("");

    ui.unassignedContainer.innerHTML = `
            <div class="table-scroll">
                <table class="table table-sticky table-compact">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">SKU</th>
                            <th class="table-cell is-header cell-pad text-center">Unidades</th>
                            <th class="table-cell is-header cell-pad text-center">Pack</th>
                            <th class="table-cell is-header cell-pad text-center">Total</th>
                            <th class="table-cell is-header cell-pad text-right">Presupuesto</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

    if (ui.unassignedTotalBudget)
      ui.unassignedTotalBudget.textContent =
        window.Utils.formatARS(totalBudget);
  }

  // 11. Actions Logic (Approve/Reject)

  // Pre-Approve Items
  async function preApproveItems(itemIds) {
    if (!itemIds || itemIds.length === 0) return;
    if (
      !(await window.Utils.confirmAction(`¿Aprobar ${itemIds.length} item(s)?`))
    )
      return;

    try {
      const { error } = await window.sb
        .from("replenishment_items")
        .update({
          pre_approval_status: "pre_approved",
          pre_approved_by: session.user.id,
          pre_approved_at: new Date().toISOString(),
        })
        .in("id", itemIds);

      if (error) throw error;
      window.Toast.success(`${itemIds.length} item(s) pre-aprobados`);
      selectedItemIds.clear();
      updateSelectionUI();
      loadPreApprovalItems();
    } catch (err) {
      console.error(err);
      window.Toast.error("Error: " + err.message);
    }
  }

  // Pre-Reject Items
  function openPreRejectModal(itemIds) {
    pendingRejectIds = itemIds;
    if (ui.prerejectCount) ui.prerejectCount.textContent = itemIds.length;
    if (ui.prerejectReason) ui.prerejectReason.value = "";
    ui.modalPrereject?.showModal();
  }

  async function submitPreReject(e) {
    e.preventDefault();
    const reason = ui.prerejectReason.value.trim();
    if (!reason) {
      window.Toast.warning("Debes indicar un motivo");
      return;
    }

    try {
      const { error } = await window.sb
        .from("replenishment_items")
        .update({
          pre_approval_status: "pre_rejected",
          pre_rejection_reason: reason,
          pre_approved_by: session.user.id,
          pre_approved_at: new Date().toISOString(),
        })
        .in("id", pendingRejectIds);

      if (error) throw error;

      window.Toast.success("Items rechazados");
      ui.modalPrereject.close();
      pendingRejectIds = [];
      selectedItemIds.clear();
      updateSelectionUI();
      loadPreApprovalItems();
    } catch (err) {
      console.error(err);
      window.Toast.error("Error: " + err.message);
    }
  }

  // Order View/Approve Logic
  function openPanel(order) {
    if (ui.panelTitle)
      ui.panelTitle.textContent = `Pedido #${order.id.split("-")[0]}`;

    const costoFinal =
      order.final_cost !== null
        ? window.Utils.formatARS(order.final_cost)
        : '<span class="status-pill status-error">Pendiente</span>';
    const fechaEta =
      order.eta_date ||
      '<span class="status-pill status-error">Pendiente</span>';

    const rows = order.items
      .map((item) => {
        const sku = item.master_sku || {};
        const itemEst =
          (item.requested_packs || 0) *
          (sku.costo_pack || (sku.costo || 0) * (sku.pack_qty || 1));
        const units = (item.requested_packs || 0) * (sku.pack_qty || 1);
        return `
                <tr class="table-row">
                    <td class="table-cell cell-pad text-sm font-medium">${window.Utils.escapeHtml(sku.nombre)}</td>
                    <td class="table-cell cell-pad text-sm text-center">${item.requested_packs}</td>
                    <td class="table-cell cell-pad text-sm text-center">${units} u.</td>
                    <td class="table-cell cell-pad text-sm text-right muted font-mono">${window.Utils.formatARS(itemEst)}</td>
                </tr>
            `;
      })
      .join("");

    ui.panelContent.innerHTML = `
            <div class="state-block" style="margin-bottom: 24px; padding: 16px;">
                <div class="detail-grid">
                    <div style="display: flex; flex-direction: column;"><span class="muted text-xs" style="text-transform: uppercase;">Proveedor</span><span class="font-bold">${window.Utils.escapeHtml(order.proveedor)}</span></div>
                    <div style="display: flex; flex-direction: column;"><span class="muted text-xs" style="text-transform: uppercase;">Fecha Eta</span><span class="font-bold">${fechaEta}</span></div>
                    <div style="display: flex; flex-direction: column;"><span class="muted text-xs" style="text-transform: uppercase;">Presupuesto</span><span class="font-bold">${window.Utils.formatARS(order.presupuesto)}</span></div>
                    <div style="display: flex; flex-direction: column;"><span class="muted text-xs" style="text-transform: uppercase;">Costo Final</span><span class="font-bold">${costoFinal}</span></div>
                </div>
            </div>
            <div class="table-shell"><table class="table table-compact"><thead><tr class="table-head"><th>SKU</th><th>Packs</th><th>Units</th><th class="text-right">Est.</th></tr></thead><tbody>${rows}</tbody></table></div>
        `;

    const canApprove =
      order.final_cost !== null && order.final_cost >= 0 && order.eta_date;
    let actionsHtml = "";

    if (order.status === "ready_for_approval" || order.status === "draft") {
      if (canApprove) {
        actionsHtml += `<button id="btn-approve" class="btn-primary">Aprobar Pedido</button>`;
      } else {
        actionsHtml += `<span class="muted text-xs" style="font-style: italic; margin-right: 16px;">Esperando confirmación final...</span>`;
      }
      actionsHtml += `<button id="btn-reject" class="btn-ghost text-error">Rechazar</button>`;
    }

    ui.panelActions.innerHTML = actionsHtml;
    panelCtrl.open();

    document
      .getElementById("btn-approve")
      ?.addEventListener("click", () =>
        updateStatus(order.id, "approved", null),
      );
    document.getElementById("btn-reject")?.addEventListener("click", () => {
      ui.rejectContainer?.classList.remove("hidden");
      ui.panelActions.innerHTML = `
                <button class="btn-secondary" id="btn-cancel-reject">Cancelar</button>
                <button id="btn-confirm-reject" class="btn-primary" style="background: var(--error-color);">Confirmar</button>
            `;
      document.getElementById("btn-confirm-reject").onclick = () =>
        confirmReject(order.id);
      document.getElementById("btn-cancel-reject").onclick = () => {
        ui.rejectContainer?.classList.add("hidden");
        ui.panelActions.innerHTML = actionsHtml;
        openPanel(order); // Re-bind events hack
      };
    });
  }

  async function confirmReject(id) {
    const reason = ui.rejectInput.value.trim();
    if (!reason) {
      window.Toast.warning("Motivo requerido");
      return;
    }
    await updateStatus(id, "rejected", reason);
  }

  async function updateStatus(id, newStatus, reason) {
    if (!(await window.Utils.confirmAction("¿Confirmar acción?"))) return;

    try {
      const payload = {
        status: newStatus,
        approved_by: session.user.id,
        approved_at: new Date().toISOString(),
      };
      if (newStatus === "rejected" && reason) payload.rejection_reason = reason;

      const { error } = await window.sb
        .from("replenishment_supplier_orders")
        .update(payload)
        .eq("id", id);
      if (error) throw error;

      // Fase 5: Crear pago automático en finance_payments al aprobar
      if (newStatus === "approved") {
        const order = orders.find(o => o.id === id);
        if (order) {
          const paymentAmount = order.final_cost || order.presupuesto || 0;
          const dueDate = order.eta_date || new Date().toISOString().split("T")[0];
          
          const { error: paymentError } = await window.sb
            .from("finance_payments")
            .insert({
              supplier_id: order.items[0]?.master_sku?.proveedor_default_id || null,
              supplier_order_id: order.id,
              amount: paymentAmount,
              due_date: dueDate,
              status: "pending",
              concept: `Pedido #${order.id.slice(0, 8)} - ${order.proveedor}`,
              created_by: session.user.id,
              created_at: new Date().toISOString(),
            });

          if (paymentError) {
            console.error("Error creating automatic payment:", paymentError);
            window.Toast?.warning("Orden aprobada, pero hubo error creando el pago: " + paymentError.message);
          } else {
            window.Toast?.info("💰 Pago agregado al calendario");
          }
        }
      }

      panelCtrl.close();
      loadOrders();
      window.Toast.success("Estado actualizado");
    } catch (err) {
      window.Toast.error(err.message);
    }
  }

  // 12. Event Delegation
  function bindEvents() {
    // Tabs
    ui.tabs.forEach((t) =>
      t.addEventListener("click", () => switchTab(t.dataset.tab)),
    );

    // Subtabs
    ui.subtabs.forEach((t) =>
      t.addEventListener("click", () => switchSubtab(t.dataset.subtab)),
    );

    // Refresh
    ui.btnRefresh?.addEventListener("click", () => {
      if (activeTab === "pre-aprobacion") loadPreApprovalItems();
      else if (activeTab === "pendientes") loadOrders();
      else if (activeTab === "sin-asignar") loadUnassigned();
    });

    // Empty State Reload
    ui.btnReloadEmpty?.addEventListener("click", () => location.reload());

    // Bulk Actions
    ui.btnPreapproveSelected?.addEventListener("click", () =>
      preApproveItems(Array.from(selectedItemIds)),
    );
    ui.btnPrerejectSelected?.addEventListener("click", () =>
      openPreRejectModal(Array.from(selectedItemIds)),
    );

    // Modal Pre-Reject
    ui.formPrereject?.addEventListener("submit", submitPreReject);

    // View Selection: Pre-Aprobacion
    ui.viewPreAprobacion?.addEventListener("change", (e) => {
      const t = e.target;
      // Select All
      if (t.id === "select-all-items") {
        const checkboxes =
          ui.subviewPorItem.querySelectorAll(".js-item-checkbox");
        checkboxes.forEach((cb) => {
          cb.checked = t.checked;
          t.checked
            ? selectedItemIds.add(cb.dataset.id)
            : selectedItemIds.delete(cb.dataset.id);
        });
        updateSelectionUI();
        return;
      }
      // Item Checkbox
      if (t.classList.contains("js-item-checkbox")) {
        t.checked
          ? selectedItemIds.add(t.dataset.id)
          : selectedItemIds.delete(t.dataset.id);
        updateSelectionUI();
        return;
      }
      // Supplier Checkbox
      if (t.classList.contains("js-supplier-checkbox")) {
        const ids = JSON.parse(t.dataset.itemIds || "[]");
        ids.forEach((id) =>
          t.checked ? selectedItemIds.add(id) : selectedItemIds.delete(id),
        );
        updateSelectionUI();
      }
    });

    // View Click: Pre-Aprobacion actions
    ui.viewPreAprobacion?.addEventListener("click", (e) => {
      const t = e.target;
      const btnApprove = t.closest(".js-preapprove-single");
      if (btnApprove) {
        preApproveItems([btnApprove.dataset.id]);
        return;
      }

      const btnReject = t.closest(".js-prereject-single");
      if (btnReject) {
        openPreRejectModal([btnReject.dataset.id]);
        return;
      }

      const btnSupApprove = t.closest(".js-preapprove-supplier");
      if (btnSupApprove) {
        preApproveItems(JSON.parse(btnSupApprove.dataset.itemIds));
        return;
      }

      const btnSupReject = t.closest(".js-prereject-supplier");
      if (btnSupReject) {
        openPreRejectModal(JSON.parse(btnSupReject.dataset.itemIds));
        return;
      }
    });

    // View Click: Orders (Pendientes)
    ui.listContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest(".js-view-order");
      if (btn) {
        const order = orders.find((o) => o.id === btn.dataset.id);
        if (order) openPanel(order);
      }
    });

    // Logout
    ui.logoutBtn?.addEventListener("click", () =>
      window.Auth.signOutAndGoLogin(),
    );

    // Topbar Dropdowns
    setupDropdown(ui.btnNotifications, ui.menuNotifications);
    setupDropdown(ui.btnUserAvatar, ui.menuUser);
  }

  function setupDropdown(trigger, menu) {
    if (!trigger || !menu) return;
    
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = menu.classList.contains("hidden");
      // Close all others first
      document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.add("hidden"));
      
      if (isHidden) {
        menu.classList.remove("hidden");
      }
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
            menu.classList.add("hidden");
        }
    });
  }

  // Init
  bindEvents();
  switchTab(activeTab);
  if (activeTab === "pre-aprobacion") switchSubtab(activeSubtab);
})();
