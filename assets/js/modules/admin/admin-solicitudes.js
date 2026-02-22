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

    // Audit Chart
    auditChartContainer: document.getElementById("audit-chart-container"),
    auditChartCanvas: document.getElementById("audit-chart-canvas"),
    auditChartDropdown: document.getElementById("audit-chart-dropdown"),
    auditDropdownTrigger: document.getElementById("audit-dropdown-trigger"),
    auditDropdownMenu: document.getElementById("audit-dropdown-menu"),
    auditKpi1Value: document.getElementById("audit-kpi-1-value"),
    auditKpi1Trend: document.getElementById("audit-kpi-1-trend"),
    auditKpi2Value: document.getElementById("audit-kpi-2-value"),
    auditKpi2Trend: document.getElementById("audit-kpi-2-trend"),
    auditKpi3Value: document.getElementById("audit-kpi-3-value"),
    auditKpi3Trend: document.getElementById("audit-kpi-3-trend"),
    auditKpiLabels: document.querySelectorAll("#audit-chart-kpis .chart-kpi-label"),
    btnHistorial: document.getElementById("btn-historial"),

    // List containers (inner scrolls)
    subviewPorItem: document.getElementById("subview-por-item"),
    subviewPorProveedor: document.getElementById("subview-por-proveedor"),
    listContainer: document.getElementById("list-container"),

    // Tabs and sub-tabs
    tabs: document.querySelectorAll("[data-tab]"),
    subtabs: document.querySelectorAll("[data-subtab]"),

    // Stats — Summary Metric Cards
    statDeficitCount: document.getElementById("stat-deficit-count"),
    statTotalCost: document.getElementById("stat-total-cost"),
    statSupplierCount: document.getElementById("stat-supplier-count"),
    preapprovalMetrics: document.getElementById("preapproval-metrics"),


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
    btnClosePrereject: document.getElementById("btn-close-prereject"),
    btnCancelPrereject: document.getElementById("btn-cancel-prereject"),
    formPrereject: document.getElementById("form-prereject"),
    prerejectCount: document.getElementById("prereject-count"),
    prerejectReason: document.getElementById("prereject-reason"),

    // Topbar Dropdowns
    btnNotifications: document.getElementById("btn-notifications"),
    menuNotifications: document.getElementById("notifications-menu"),
    btnUserAvatar: document.getElementById("user-avatar"),
    menuUser: document.getElementById("user-menu"),
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
  let firstLoad = true; // Controls fullscreen loading on first fetch only

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

    // Show active & Load Data
    if (tabId === "pre-aprobacion") {
      ui.viewPreAprobacion?.classList.remove("hidden");
      loadPreApprovalItems();
    } else if (tabId === "pendientes") {
      ui.viewPendientes?.classList.remove("hidden");
      loadOrders();
    }
  }

  // 7. Data Fetching (Pre-Aprobación) — Auto-detección con ideal dinámico
  async function loadPreApprovalItems() {
    if (activeTab !== "pre-aprobacion") return;
    if (firstLoad) Utils.setPageState(ui, { loading: true });
    else ui.viewPreAprobacion?.classList.add("tab-loading");

    try {
      // ── 1. Date range (last 30 days) ──
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 30);
      const startDate = past.toISOString().split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      // ── 2. Parallel fetch: SKUs, stock, reports, attendance ──
      const [skuRes, stockRes, reportRes, workDayRes, processedRes] = await Promise.all([
        window.sb.from("master_sku")
          .select("id, nombre, pack_qty, costo, costo_pack, proveedor_default_id, active")
          .eq("active", true).order("nombre"),
        window.sb.from("vw_stock_global")
          .select("sku_id, stock_actual, requerido"),
        window.sb.from("consumption_reports")
          .select("id").gte("operational_date", startDate).lte("operational_date", endDate),
        window.sb.from("work_days")
          .select("attendance").gte("work_date", startDate).lte("work_date", endDate).eq("status", "closed"),
        window.sb.from("replenishment_items")
          .select("sku_id, pre_approval_status")
          .in("pre_approval_status", ["pre_approved", "pre_rejected"]),
      ]);

      if (skuRes.error) throw skuRes.error;
      const skus = skuRes.data;
      if (!skus || skus.length === 0) {
        preapprovalItems = [];
        renderPreApprovalByItem([]);
        updatePreApprovalStats([]);
        Utils.setPageState(ui, { empty: true });
        return;
      }

      const stockMap = {};
      (stockRes.data || []).forEach((s) => (stockMap[s.sku_id] = s));

      // SKUs already pre-approved or pre-rejected → exclude from grid
      const processedSkuIds = new Set(
        (processedRes.data || []).map((r) => r.sku_id),
      );

      const reportIds = (reportRes.data || []).map((r) => r.id);

      const validDays = (workDayRes.data || []).filter(
        (d) => d.attendance && d.attendance > 0,
      );
      const avgPeople =
        validDays.length > 0
          ? Math.round(validDays.reduce((s, d) => s + d.attendance, 0) / validDays.length)
          : 500;

      // ── 3. Dependent parallel fetch: consumption details + suppliers ──
      const supplierIds = [...new Set(skus.map((s) => s.proveedor_default_id).filter(Boolean))];

      const [detailsRes, suppliersRes] = await Promise.all([
        reportIds.length > 0
          ? window.sb.from("consumption_details").select("sku_id, quantity").in("report_id", reportIds)
          : { data: [] },
        supplierIds.length > 0
          ? window.sb.from("master_proveedores").select("id, nombre_fantasia").in("id", supplierIds)
          : { data: [] },
      ]);

      const consumptionMap = {};
      (detailsRes.data || []).forEach((d) => {
        consumptionMap[d.sku_id] = (consumptionMap[d.sku_id] || 0) + (d.quantity || 0);
      });

      const suppliersMap = {};
      (suppliersRes.data || []).forEach((s) => (suppliersMap[s.id] = s));

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

      // ── 9. Filter: only SKUs below ideal AND not already processed ──
      preapprovalItems = allItems.filter(
        (item) =>
          item.stock_ideal > 0 &&
          item.deficit_units > 0 &&
          !processedSkuIds.has(item.sku_id),
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
      console.error("Pre-approval load error:", err);
      window.Toast?.error("Error cargando datos de stock");
    } finally {
      if (firstLoad) {
        Utils.setPageState(ui, preapprovalItems.length === 0 ? { empty: true } : {});
        firstLoad = false;
      }
      ui.viewPreAprobacion?.classList.remove("tab-loading");
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
    if (firstLoad) Utils.setPageState(ui, { loading: true });
    else ui.viewPendientes?.classList.add("tab-loading");

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
        Utils.setPageState(ui, { empty: true });
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
          supplier_id: o.supplier_id,
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
      if (firstLoad) {
        Utils.setPageState(ui, orders.length === 0 ? { empty: true } : {});
        firstLoad = false;
      }
      ui.viewPendientes?.classList.remove("tab-loading");
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


  // 11. Actions Logic (Approve/Reject)

  // =========================================================================
  //  AUDIT CHART — 3 modes
  // =========================================================================
  let auditChartInstance = null;
  let currentChartMode = 'pedido-vs-consumo';

  const { getThemeColor, CHART_COLORS } = window.Utils;

  function updateKpiLabels(labels) {
    const kpiLabels = ui.auditKpiLabels;
    if (kpiLabels?.length >= 3) {
      kpiLabels[0].textContent = labels[0];
      kpiLabels[1].textContent = labels[1];
      kpiLabels[2].textContent = labels[2];
    }
  }

  function updateKpis(values, trends, classes) {
    if (ui.auditKpi1Value) ui.auditKpi1Value.textContent = values[0];
    if (ui.auditKpi2Value) ui.auditKpi2Value.textContent = values[1];
    if (ui.auditKpi3Value) ui.auditKpi3Value.textContent = values[2];

    [ui.auditKpi1Trend, ui.auditKpi2Trend, ui.auditKpi3Trend].forEach((el, i) => {
      if (!el) return;
      el.textContent = trends?.[i] || '';
      el.className = 'chart-kpi-trend' + (classes?.[i] ? ' ' + classes[i] : '');
    });

    // Apply success/warning classes
    if (ui.auditKpi2Value) {
      ui.auditKpi2Value.className = 'chart-kpi-value' + (classes?.[1] ? ' chart-kpi-success' : '');
    }
  }

  async function loadAuditChart(mode) {
    currentChartMode = mode;
    if (auditChartInstance) { auditChartInstance.destroy(); auditChartInstance = null; }

    try {
      if (mode === 'pedido-vs-consumo') await loadPedidoVsConsumo();
      else if (mode === 'deficit-recurrente') await loadDeficitRecurrente();
      else if (mode === 'tendencia-gasto') await loadTendenciaGasto();
    } catch (err) {
      console.error('Audit Chart Error:', err);
      window.Toast?.error('Error al cargar gráfico de auditoría.');
    }
  }

  // --- MODE 1: Pedido vs Consumo ---
  async function loadPedidoVsConsumo() {
    updateKpiLabels(['Total Pedido', 'Total Consumido', 'Diferencia']);

    // Get last 15 consumption reports
    const { data: reports } = await window.sb
      .from('consumption_reports')
      .select('id, operational_date')
      .order('operational_date', { ascending: false })
      .limit(15);

    if (!reports?.length) {
      updateKpis(['-', '-', '-'], [], []);
      window.Toast?.info('No hay reportes de consumo cargados.');
      return;
    }

    const ordered = [...reports].reverse();
    const reportIds = ordered.map(r => r.id);
    const labels = ordered.map(r => r.operational_date);

    // Consumption details
    const { data: details } = await window.sb
      .from('consumption_details')
      .select('report_id, quantity')
      .in('report_id', reportIds);

    // Replenishment items near same dates
    const dateMin = labels[0];
    const dateMax = labels[labels.length - 1];
    const { data: repItems } = await window.sb
      .from('replenishment_items')
      .select('created_at, requested_packs')
      .gte('created_at', dateMin)
      .lte('created_at', dateMax + 'T23:59:59');

    // Aggregate by date
    const consumoByDate = {};
    const pedidoByDate = {};
    labels.forEach(d => { consumoByDate[d] = 0; pedidoByDate[d] = 0; });

    (details || []).forEach(d => {
      const r = ordered.find(o => o.id === d.report_id);
      if (r) consumoByDate[r.operational_date] += (d.quantity || 0);
    });

    (repItems || []).forEach(ri => {
      const d = ri.created_at?.split('T')[0];
      if (d && pedidoByDate[d] !== undefined) pedidoByDate[d] += (ri.requested_packs || 0);
    });

    const consumoData = labels.map(d => consumoByDate[d]);
    const pedidoData = labels.map(d => pedidoByDate[d]);
    const totalConsumo = consumoData.reduce((a, b) => a + b, 0);
    const totalPedido = pedidoData.reduce((a, b) => a + b, 0);
    const diff = totalPedido - totalConsumo;
    const diffPct = totalPedido > 0 ? ((diff / totalPedido) * 100).toFixed(1) : 0;

    updateKpis(
      [totalPedido.toLocaleString('es-AR'), totalConsumo.toLocaleString('es-AR'), diff >= 0 ? `+${diff.toLocaleString('es-AR')}` : diff.toLocaleString('es-AR')],
      ['', '', `${diffPct}%`],
      ['', 'chart-kpi-success', diff >= 0 ? 'trend-up' : 'trend-down']
    );

    const textColor = getThemeColor('--text-tertiary', '#888');
    const gridColor = 'rgba(255,255,255,0.06)';

    auditChartInstance = await window.ChartLoader.create(ui.auditChartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Pedido', data: pedidoData, borderColor: CHART_COLORS[3], backgroundColor: CHART_COLORS[3], tension: 0.3, fill: false, pointRadius: 3 },
          { label: 'Consumo', data: consumoData, borderColor: CHART_COLORS[2], backgroundColor: CHART_COLORS[2], tension: 0.3, fill: false, pointRadius: 3 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#d4d4d8', usePointStyle: true, font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
  }

  // --- MODE 2: Déficit Recurrente ---
  async function loadDeficitRecurrente() {
    updateKpiLabels(['SKUs en Déficit', 'Mayor Frecuencia', 'Periodicidad']);

    // Count how many times each SKU appears in replenishment_items with deficit
    const { data: items } = await window.sb
      .from('replenishment_items')
      .select('sku_id, sku:master_sku(nombre)')
      .not('pre_approval_status', 'eq', 'rejected');

    if (!items?.length) {
      updateKpis(['-', '-', '-'], [], []);
      window.Toast?.info('No hay datos de déficit.');
      return;
    }

    // Count frequency per SKU
    const freq = {};
    items.forEach(item => {
      const name = item.sku?.nombre || `SKU ${item.sku_id}`;
      if (!freq[name]) freq[name] = 0;
      freq[name]++;
    });

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const skuNames = sorted.map(([name]) => name.length > 18 ? name.substring(0, 18) + '…' : name);
    const counts = sorted.map(([, count]) => count);
    const totalSKUs = Object.keys(freq).length;
    const maxFreq = counts[0] || 0;

    updateKpis(
      [totalSKUs.toString(), maxFreq + 'x', sorted.length > 1 ? (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1) + 'x' : '-'],
      ['', '', ''],
      ['', 'chart-kpi-warning', '']
    );

    const textColor = getThemeColor('--text-tertiary', '#888');
    const gridColor = 'rgba(255,255,255,0.06)';

    auditChartInstance = await window.ChartLoader.create(ui.auditChartCanvas, {
      type: 'bar',
      data: {
        labels: skuNames,
        datasets: [{
          label: 'Veces en déficit',
          data: counts,
          backgroundColor: counts.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + '99'),
          borderColor: counts.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } }
        }
      }
    });
  }

  // --- MODE 3: Tendencia de Gasto ---
  async function loadTendenciaGasto() {
    updateKpiLabels(['Gasto Total', 'Promedio Semanal', 'Tendencia']);

    const { data: orders } = await window.sb
      .from('replenishment_supplier_orders')
      .select('final_cost, status, created_at')
      .in('status', ['approved', 'pre-approved', 'pending']);

    if (!orders?.length) {
      updateKpis(['-', '-', '-'], [], []);
      window.Toast?.info('No hay órdenes para analizar.');
      return;
    }

    // Group by week (ISO week)
    const weekMap = {};
    orders.forEach(o => {
      const d = new Date(o.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!weekMap[key]) weekMap[key] = 0;
      weekMap[key] += (o.final_cost || 0);
    });

    const sortedWeeks = Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]));
    const labels = sortedWeeks.map(([d]) => d);
    const values = sortedWeeks.map(([, v]) => v);

    const totalGasto = values.reduce((a, b) => a + b, 0);
    const avgWeekly = values.length > 0 ? totalGasto / values.length : 0;

    // Trend: compare last 2 weeks
    let trendText = '-';
    let trendClass = '';
    if (values.length >= 2) {
      const last = values[values.length - 1];
      const prev = values[values.length - 2];
      const change = prev > 0 ? (((last - prev) / prev) * 100).toFixed(1) : 0;
      trendText = (change >= 0 ? '+' : '') + change + '%';
      trendClass = change > 0 ? 'trend-up' : change < 0 ? 'trend-down' : 'trend-neutral';
    }

    const fmt = (v) => window.Utils?.formatARS?.(v) || ('$' + v.toLocaleString('es-AR', { minimumFractionDigits: 2 }));

    updateKpis(
      [fmt(totalGasto), fmt(avgWeekly), trendText],
      ['', '', ''],
      ['', '', trendClass]
    );

    const textColor = getThemeColor('--text-tertiary', '#888');
    const gridColor = 'rgba(255,255,255,0.06)';

    auditChartInstance = await window.ChartLoader.create(ui.auditChartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Gasto Semanal',
          data: values,
          borderColor: CHART_COLORS[4],
          backgroundColor: CHART_COLORS[4] + '33',
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: CHART_COLORS[4]
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#d4d4d8', usePointStyle: true, font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, callback: v => '$' + (v / 1000).toFixed(0) + 'k' }, grid: { color: gridColor } }
        }
      }
    });
  }

  // Audit Chart Dropdown
  function setupAuditChartDropdown() {
    const dropdown = ui.auditChartDropdown;
    const trigger = ui.auditDropdownTrigger;
    const menu = ui.auditDropdownMenu;
    if (!dropdown || !trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('is-open');
    });

    menu.querySelectorAll('.custom-dropdown-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.dataset.value;
        trigger.querySelector('.custom-dropdown-text').textContent = opt.textContent.trim();
        dropdown.classList.remove('is-open');
        loadAuditChart(val);
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('is-open');
    });
  }

  // Pre-Approve Items (upsert: update existing pending + insert missing)
  async function preApproveItems(skuIds) {
    if (!skuIds || skuIds.length === 0) return;
    if (
      !(await window.Utils.confirmAction(`¿Aprobar ${skuIds.length} item(s)?`))
    )
      return;

    try {
      // 1. Update any existing pending items for these SKUs
      const { data: updated, error: updateErr } = await window.sb
        .from("replenishment_items")
        .update({
          pre_approval_status: "pre_approved",
          pre_approved_by: session.user.id,
          pre_approved_at: new Date().toISOString(),
        })
        .in("sku_id", skuIds)
        .eq("pre_approval_status", "pending")
        .select("sku_id");

      if (updateErr) throw updateErr;

      // 2. Find SKUs that had no pending record → insert new ones
      const updatedSkuIds = new Set((updated || []).map((r) => r.sku_id));
      const missingSkuIds = skuIds.filter((id) => !updatedSkuIds.has(id));

      if (missingSkuIds.length > 0) {
        const newItems = missingSkuIds.map((skuId) => {
          const item = preapprovalItems.find((i) => i.sku_id === skuId);
          return {
            sku_id: skuId,
            requested_packs: item?.deficit_packs || 0,
            pack_cost_est: item?.estimated_cost
              ? item.estimated_cost / (item.deficit_packs || 1)
              : null,
            line_total_est: item?.estimated_cost || null,
            supplier_id: item?.supplier_id || null,
            pre_approval_status: "pre_approved",
            pre_approved_by: session.user.id,
            pre_approved_at: new Date().toISOString(),
          };
        });

        const { error: insertErr } = await window.sb
          .from("replenishment_items")
          .insert(newItems);

        if (insertErr) throw insertErr;
      }

      window.Toast.success(`${skuIds.length} item(s) pre-aprobados`);
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
      // 1. Update existing pending items for these SKUs
      const { data: updated, error: updateErr } = await window.sb
        .from("replenishment_items")
        .update({
          pre_approval_status: "pre_rejected",
          pre_rejection_reason: reason,
          pre_approved_by: session.user.id,
          pre_approved_at: new Date().toISOString(),
        })
        .in("sku_id", pendingRejectIds)
        .eq("pre_approval_status", "pending")
        .select("sku_id");

      if (updateErr) throw updateErr;

      // 2. Insert rejection records for SKUs with no pending items
      const updatedSkuIds = new Set((updated || []).map((r) => r.sku_id));
      const missingSkuIds = pendingRejectIds.filter(
        (id) => !updatedSkuIds.has(id),
      );

      if (missingSkuIds.length > 0) {
        const newItems = missingSkuIds.map((skuId) => ({
          sku_id: skuId,
          pre_approval_status: "pre_rejected",
          pre_rejection_reason: reason,
          pre_approved_by: session.user.id,
          pre_approved_at: new Date().toISOString(),
        }));

        const { error: insertErr } = await window.sb
          .from("replenishment_items")
          .insert(newItems);

        if (insertErr) throw insertErr;
      }

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

    // Cancel/Rollback — available for any non-cancelled/non-rejected order
    if (!["cancelled", "rejected"].includes(order.status)) {
      actionsHtml += `<button id="btn-cancel-order" class="btn-ghost text-error" style="margin-left:auto;">Cancelar Pedido</button>`;
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
    document
      .getElementById("btn-cancel-order")
      ?.addEventListener("click", () => cancelOrder(order.id));
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
              title: `Pedido #${order.id.slice(0, 8)} - ${order.proveedor}`,
              supplier_id: order.supplier_id || null,
              supplier_order_id: order.id,
              amount_total: paymentAmount,
              due_date: dueDate,
              status: "PENDING",
              source_type: "PEDIDO",
              created_by: session.user.id,
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

  // Cancel/Rollback Order — with mandatory reason + finance_payment cascade
  async function cancelOrder(orderId) {
    // Show inline reason input
    ui.rejectContainer?.classList.remove("hidden");
    if (ui.rejectInput) ui.rejectInput.placeholder = "Motivo de cancelación (obligatorio)";

    ui.panelActions.innerHTML = `
      <button class="btn-secondary" id="btn-cancel-rollback">Volver</button>
      <button id="btn-confirm-cancel" class="btn-primary" style="background: var(--error-color);">Confirmar Cancelación</button>
    `;

    document.getElementById("btn-cancel-rollback").onclick = () => {
      ui.rejectContainer?.classList.add("hidden");
      const order = orders.find(o => o.id === orderId);
      if (order) openPanel(order);
    };

    document.getElementById("btn-confirm-cancel").onclick = async () => {
      const reason = ui.rejectInput?.value?.trim();
      if (!reason) {
        window.Toast.warning("Motivo de cancelación requerido");
        return;
      }
      if (!(await window.Utils.confirmAction("¿Cancelar este pedido? Esta acción dejará constancia."))) return;

      try {
        // 1. Cancel the supplier order
        const { error: orderErr } = await window.sb
          .from("replenishment_supplier_orders")
          .update({
            status: "cancelled",
            rejection_reason: reason,
            approved_by: session.user.id,
            approved_at: new Date().toISOString(),
          })
          .eq("id", orderId);
        if (orderErr) throw orderErr;

        // 2. Cancel associated finance_payment if exists
        const { error: payErr } = await window.sb
          .from("finance_payments")
          .update({ status: "CANCELLED", notes: `Cancelado: ${reason}` })
          .eq("supplier_order_id", orderId);
        if (payErr) console.warn("No se pudo cancelar pago asociado:", payErr);

        window.Toast.success("Pedido cancelado con constancia");
        panelCtrl.close();
        loadOrders();
      } catch (err) {
        console.error("Cancel error:", err);
        window.Toast.error("Error: " + err.message);
      }
    };
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
    ui.btnClosePrereject?.addEventListener("click", () => ui.modalPrereject?.close());
    ui.btnCancelPrereject?.addEventListener("click", () => ui.modalPrereject?.close());
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
  setupAuditChartDropdown();
  switchTab(activeTab);
  if (activeTab === "pre-aprobacion") switchSubtab(activeSubtab);
  (window.requestIdleCallback || setTimeout)(() => loadAuditChart(currentChartMode));

  // Historial button
  ui.btnHistorial?.addEventListener('click', () => {
    window.Toast?.info('Historial de pedidos — Próximamente.');
  });
})();
