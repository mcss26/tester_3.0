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

    // Stats
    preapprovalStats: document.getElementById("preapproval-stats"),
    preapprovalCount: document.getElementById("preapproval-count"),
    preapprovalTotalBudget: document.getElementById("preapproval-total-budget"),
    unassignedStats: document.getElementById("unassigned-stats"),
    unassignedTotalBudget: document.getElementById("unassigned-total-budget"),

    // Actions
    btnRefresh: document.getElementById("btn-refresh"),
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
    window.Utils.setPageState(state, {
      moduleContent: ui.moduleContent,
      loadingOverlay: ui.loadingState,
      emptyOverlay: ui.emptyState,
    });
  }

  // 6. Tab Logic
  // 6. Tab Logic
  const tabController = window.TabManager
    ? window.TabManager.init({
        tabs: ui.tabs,
        defaultTab: activeTab,
        onSwitch: (tabId) => {
          activeTab = tabId;
          refreshViews(tabId);
        },
      })
    : null;

  function refreshViews(tabId) {
    // Hide all views and stats
    [
      ui.viewPreAprobacion,
      ui.viewPendientes,
      ui.viewUnassigned,
      ui.viewHistorial,
    ].forEach((v) => v?.classList.add("hidden"));
    [ui.preapprovalStats, ui.unassignedStats].forEach((s) =>
      s?.classList.add("hidden"),
    );

    if (tabId === "pre-aprobacion") {
      ui.viewPreAprobacion?.classList.remove("hidden");
      ui.preapprovalStats?.classList.remove("hidden");
      loadPreApprovalItems();
    } else if (tabId === "pendientes") {
      ui.viewPendientes?.classList.remove("hidden");
      loadOrders();
    } else if (tabId === "sin-asignar") {
      ui.viewUnassigned?.classList.remove("hidden");
      ui.unassignedStats?.classList.remove("hidden");
      loadUnassigned();
    } else if (tabId === "historial") {
      ui.viewHistorial?.classList.remove("hidden");
    }
  }

  // Initial load
  refreshViews(activeTab);

  function switchSubtab(subtabId) {
    activeSubtab = subtabId;

    ui.subtabs.forEach((t) => {
      t.classList.toggle("is-active", t.dataset.subtab === subtabId);
    });

    ui.subviewPorItem?.classList.toggle("hidden", subtabId !== "item");
    ui.subviewPorProveedor?.classList.toggle(
      "hidden",
      subtabId !== "proveedor",
    );

    ui.preapprovalBulkActions?.classList.toggle("hidden", subtabId !== "item");

    if (subtabId === "item") renderPreApprovalByItem(preapprovalItems);
    else renderPreApprovalBySupplier(preapprovalItems);
  }

  // 7. Data Fetching (Pre-Aprobación)
  async function loadPreApprovalItems() {
    if (activeTab !== "pre-aprobacion") return;
    setPageState("loading");

    try {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 30);

      // Get recent requests
      const { data: requests, error: reqError } = await window.sb
        .from("replenishment_requests")
        .select("id")
        .gte("operational_date", past.toISOString().split("T")[0])
        .neq("status", "cancelled");

      if (reqError) throw reqError;
      const requestIds = (requests || []).map((r) => r.id);

      if (requestIds.length === 0) {
        preapprovalItems = [];
        renderPreApprovalByItem([]);
        updatePreApprovalStats([]);
        return;
      }

      // Get items
      const { data: items, error: itemError } = await window.sb
        .from("replenishment_items")
        .select(
          `
                    id, request_id, sku_id, requested_packs, status,
                    pre_approval_status, pre_rejection_reason,
                    supplier_id,
                    master_sku (id, nombre, pack_qty, costo, costo_pack, proveedor_default_id),
                    master_proveedores:supplier_id (id, nombre_fantasia)
                `,
        )
        .in("request_id", requestIds)
        .neq("status", "cancelled")
        .or("pre_approval_status.is.null,pre_approval_status.eq.pending");

      if (itemError) throw itemError;

      // Stock data
      const skuIds = (items || []).map((i) => i.sku_id).filter(Boolean);
      let stockMap = {};
      if (skuIds.length > 0) {
        const { data: stocks } = await window.sb
          .from("vw_stock_global")
          .select("*")
          .in("sku_id", skuIds);
        (stocks || []).forEach((s) => (stockMap[s.sku_id] = s));
      }

      // Default suppliers
      const defaultSupplierIds = (items || [])
        .map((i) => i.master_sku?.proveedor_default_id)
        .filter(Boolean);

      let defaultSuppliersMap = {};
      if (defaultSupplierIds.length > 0) {
        const { data: suppliers } = await window.sb
          .from("master_proveedores")
          .select("id, nombre_fantasia")
          .in("id", defaultSupplierIds);
        (suppliers || []).forEach((s) => (defaultSuppliersMap[s.id] = s));
      }

      preapprovalItems = (items || []).map((item) => {
        const sku = item.master_sku || {};
        const stockData = stockMap[item.sku_id];
        const packCost =
          sku.costo_pack !== null
            ? sku.costo_pack
            : (sku.costo || 0) * (sku.pack_qty || 1);
        const estimatedCost = (item.requested_packs || 0) * packCost;

        let supplierName =
          window.Constants?.LABELS?.UNASSIGNED || "Sin asignar";
        let supplierId = item.supplier_id;
        if (item.master_proveedores?.nombre_fantasia) {
          supplierName = item.master_proveedores.nombre_fantasia;
        } else if (
          sku.proveedor_default_id &&
          defaultSuppliersMap[sku.proveedor_default_id]
        ) {
          supplierName =
            defaultSuppliersMap[sku.proveedor_default_id].nombre_fantasia +
            " (default)";
          supplierId = sku.proveedor_default_id;
        }

        return {
          id: item.id,
          sku_id: item.sku_id,
          sku_nombre:
            sku.nombre || window.Constants?.LABELS?.UNKNOWN_SKU || "Unknown",
          requested_packs: item.requested_packs || 0,
          pack_qty: sku.pack_qty || 1,
          total_units: (item.requested_packs || 0) * (sku.pack_qty || 1),
          estimated_cost: estimatedCost,
          supplier_id: supplierId,
          supplier_name: supplierName,
          stock_actual: stockData?.stock_actual || 0,
          stock_requerido: stockData?.requerido || 0,
          pre_approval_status: item.pre_approval_status || "pending",
        };
      });

      if (activeSubtab === "item") {
        renderPreApprovalByItem(preapprovalItems);
      } else {
        renderPreApprovalBySupplier(preapprovalItems);
      }
      updatePreApprovalStats(preapprovalItems);
    } catch (err) {
      console.error("Pre-Approval Load Error:", err);
      window.Toast?.error("Error cargando solicitudes: " + err.message);
    } finally {
      setPageState(preapprovalItems.length === 0 ? "empty" : "ready");
    }
  }

  // 8. Render Pre-Approval
  function renderPreApprovalByItem(items) {
    if (!ui.subviewPorItem) return;

    if (items.length === 0) {
      ui.subviewPorItem.innerHTML = `<div class="empty-state">No hay items pendientes de pre-aprobación.</div>`;
      return;
    }

    const rows = items
      .map((item) => {
        const isSelected = selectedItemIds.has(item.id);
        return `
                <tr class="table-row ${isSelected ? "bg-accent/10" : ""}">
                    <td class="table-cell cell-pad text-center">
                        <input type="checkbox" class="js-item-checkbox" data-id="${item.id}" ${isSelected ? "checked" : ""}>
                    </td>
                    <td class="table-cell cell-pad cell-strong font-medium">${window.Utils.escapeHtml(item.sku_nombre)}</td>
                    <td class="table-cell cell-pad text-center">${item.requested_packs}</td>
                    <td class="table-cell cell-pad text-center">${item.total_units} u.</td>
                    <td class="table-cell cell-pad text-right muted font-mono text-sm">${window.Utils.formatARS(item.estimated_cost)}</td>
                    <td class="table-cell cell-pad">${window.Utils.escapeHtml(item.supplier_name)}</td>
                    <td class="table-cell cell-pad text-right">
                        <button class="btn-ghost btn-sm btn-success js-preapprove-single" data-id="${item.id}">✓</button>
                        <button class="btn-ghost btn-sm text-error js-prereject-single" data-id="${item.id}">✕</button>
                    </td>
                </tr>
            `;
      })
      .join("");

    ui.subviewPorItem.innerHTML = `
            <table class="table table-sticky">
                <thead>
                    <tr class="table-head">
                        <th class="table-cell is-header cell-pad text-center" style="width: 40px;">
                            <input type="checkbox" id="select-all-items" title="Seleccionar todos">
                        </th>
                        <th class="table-cell is-header cell-pad">SKU</th>
                        <th class="table-cell is-header cell-pad text-center">Packs</th>
                        <th class="table-cell is-header cell-pad text-center">Unidades</th>
                        <th class="table-cell is-header cell-pad text-right">Costo Est.</th>
                        <th class="table-cell is-header cell-pad">Proveedor</th>
                        <th class="table-cell is-header cell-pad text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
  }

  function renderPreApprovalBySupplier(items) {
    if (!ui.subviewPorProveedor) return;

    if (items.length === 0) {
      ui.subviewPorProveedor.innerHTML = `<div class="empty-state">No hay items pendientes.</div>`;
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
      .map((group) => {
        const itemIds = group.items.map((i) => i.id);
        const allSelected = itemIds.every((id) => selectedItemIds.has(id));

        const itemRows = group.items
          .map(
            (item) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span class="text-sm">${window.Utils.escapeHtml(item.sku_nombre)}</span>
                    <span class="text-sm muted">${item.requested_packs} packs (${item.total_units} u.)</span>
                </div>
            `,
          )
          .join("");

        return `
                <div class="card" style="padding: 16px; margin-bottom: 16px; background: var(--surface-2); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" class="js-supplier-checkbox" data-supplier-id="${group.supplier_id || ""}" data-item-ids='${JSON.stringify(itemIds)}' ${allSelected ? "checked" : ""}>
                            <h3 class="font-bold">${window.Utils.escapeHtml(group.supplier_name)}</h3>
                            <span class="badge status-neutral">${group.items.length} items</span>
                        </div>
                        <span class="font-mono font-bold">${window.Utils.formatARS(group.total_cost)}</span>
                    </div>
                    <div style="margin-bottom: 12px; max-height: 128px; overflow-y: auto;">
                        ${itemRows}
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="btn-primary btn-sm js-preapprove-supplier" data-item-ids='${JSON.stringify(itemIds)}'>Aprobar Todo</button>
                        <button class="btn-ghost btn-sm text-error js-prereject-supplier" data-item-ids='${JSON.stringify(itemIds)}'>Rechazar Todo</button>
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
    if (ui.preapprovalCount) ui.preapprovalCount.textContent = count;
    if (ui.preapprovalTotalBudget)
      ui.preapprovalTotalBudget.textContent =
        window.Utils.formatARS(totalBudget);
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
        return;
      }

      const { data: rawOrders, error: ordError } = await window.sb
        .from("replenishment_supplier_orders")
        .select(`*, master_proveedores (nombre_fantasia)`)
        .in("request_id", requestIds)
        .neq("status", "cancelled")
        .order("eta_date", { ascending: true });

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
            <table class="table table-sticky">
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
        return;
      }

      const { data: items } = await window.sb
        .from("replenishment_items")
        .select(`*, master_sku (id, nombre, pack_qty, costo, costo_pack)`)
        .in("request_id", requestIds)
        .neq("status", "cancelled");

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
            <table class="table table-sticky">
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
    ui.modalPrereject?.classList.remove("hidden");
    ui.modalPrereject?.classList.add("active");
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
      ui.modalPrereject.classList.remove("active");
      ui.modalPrereject.classList.add("hidden");
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

    // Bulk Actions
    ui.btnPreapproveSelected?.addEventListener("click", () =>
      preApproveItems(Array.from(selectedItemIds)),
    );
    ui.btnPrerejectSelected?.addEventListener("click", () =>
      openPreRejectModal(Array.from(selectedItemIds)),
    );

    // Modal Pre-Reject
    ui.formPrereject?.addEventListener("submit", submitPreReject);
    ui.modalPrereject?.querySelectorAll("[data-modal-close]").forEach((b) => {
      b.addEventListener("click", () => {
        ui.modalPrereject.classList.remove("active");
        ui.modalPrereject.classList.add("hidden");
      });
    });

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
    document
      .getElementById("btn-logout")
      ?.addEventListener("click", () => window.Auth.signOutAndGoLogin());
  }

  // Init
  bindEvents();
  switchTab(activeTab);
  if (activeTab === "pre-aprobacion") switchSubtab(activeSubtab);
})();
