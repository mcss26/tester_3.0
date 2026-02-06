(async function () {
  "use strict";

  // 1. Auth Guard & Initial Check
  const session = await window.Auth.guardOrRedirect([
    "operativo",
    "logistico",
    "admin",
    "contable",
  ]);
  if (!session) return;

  // 2. DOM Elements (Grouped)
  const ui = {
    containers: {
      skuList: document.getElementById("sku-list-container"),
      supplierList: document.getElementById("supplier-list-container"),
    },
    views: {
      sku: document.getElementById("view-sku-table"),
      supplier: document.getElementById("view-supplier-table"),
    },
    tabs: document.querySelectorAll("[data-tab]"),
    modals: {
      adjust: document.getElementById("modal-adjust"),
    },
    controls: {
      adjustReasonSelect: document.getElementById("adjust-reason-select"),
      adjustReasonText: document.getElementById("adjust-reason-text"),
      btnConfirmAdjust: document.getElementById("confirm-adjust"),
      closeModalBtns: document.querySelectorAll("[data-close-modal]"),
    },
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.containers.skuList))
    return;

  // 3. State
  const PAGE_KEY = "operativo-solicitudes";
  const savedState = window.NavState ? window.NavState.restore(PAGE_KEY) : null;

  const state = {
    currentRequestId: null,
    providers: [],
    pendingAdjustmentItemId: null,
    activeTab: savedState?.activeTab || "sku-table",
    stockMap: {},
    orderMap: {},
  };

  // Save state on unload
  window.addEventListener("beforeunload", () => {
    if (window.NavState) {
      window.NavState.save(PAGE_KEY, {
        activeTab: state.activeTab,
      });
    }
  });

  // 4. Data Loading Logic

  async function loadProviders() {
    const { data } = await window.sb
      .from("master_proveedores")
      .select("id, nombre_fantasia")
      .eq("active", true)
      .order("nombre_fantasia");
    state.providers = data || [];
  }

  async function ensureDailyRequest() {
    const openDay = await window.WorkDayHelper.getOpenWorkDay();
    const workDate = openDay
      ? openDay.work_date
      : new Date().toISOString().split("T")[0];

    const { data, error } = await window.sb
      .from("replenishment_requests")
      .select("id, status")
      .eq("operational_date", workDate)
      .eq("user_id", session.user.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      state.currentRequestId = data[0].id;
      return;
    }

    const { data: newReq, error: createError } = await window.sb
      .from("replenishment_requests")
      .insert([
        {
          user_id: session.user.id,
          operational_date: workDate,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (createError) throw createError;
    state.currentRequestId = newReq.id;
  }

  async function populateItems() {
    if (!state.currentRequestId) return;

    // 1. Get all currently existing SKU IDs in this request to avoid duplicates
    // We fetch ALL (or a large limit) to ensure we don't duplicate.
    const { data: existingItems, error: existingItemsError } = await window.sb
      .from("replenishment_items")
      .select("sku_id")
      .eq("request_id", state.currentRequestId);
    
    if (existingItemsError) throw existingItemsError;

    const existingIds = new Set(
      (existingItems || []).map((i) => String(i.sku_id)),
    );

    // 2. Fetch all Low Stock items from the view
    // "Bajo" implies current < required (or min/ideal logic in the view)
    const { data: lowStock, error: lowStockError } = await window.sb
      .from("vw_stock_global")
      .select("*")
      .eq("activo", true)
      .eq("estado", "Bajo");

    if (lowStockError) throw lowStockError;
    if (!lowStock || lowStock.length === 0) return;

    // 3. Filter for items that are NOT in the request yet
    const toInsert = [];
    lowStock.forEach((row) => {
      const skuId = row.sku_id;
      if (!skuId) return;
      if (existingIds.has(String(skuId))) return; // Already exists

      const stockActual = row.stock_actual ?? 0;
      const requerido = row.requerido ?? 0;
      const packQty = row.pack_qty || 1;
      const deficit = requerido - stockActual;
      const reqPacks = Math.ceil(deficit / packQty);

      if (reqPacks > 0) {
        toInsert.push({
          request_id: state.currentRequestId,
          sku_id: skuId,
          requested_packs: reqPacks,
          supplier_id: row.proveedor_default_id || null, // Auto-select default provider if available
          status: "pending",
        });
      }
    });

    // 4. Insert new items found
    if (toInsert.length > 0) {
      console.log(`[OperativoSolicitudes] Adding ${toInsert.length} new low-stock items.`);
      await window.sb.from("replenishment_items").insert(toInsert);
    }
  }

  async function loadSkuTable() {
    if (!state.currentRequestId) return;
    ui.containers.skuList.innerHTML =
      '<div class="empty-state">Cargando...</div>';

    try {
      // 1. Fetch Items
      const { data: items, error: itemsError } = await window.sb
        .from("replenishment_items")
        .select(
          `
                    *,
                    master_sku (nombre, pack_qty),
                    master_proveedores (id, nombre_fantasia)
                `,
        )
        .eq("pre_approval_status", "pre_approved")
        .order("created_at", { ascending: true })
        .limit(5000);

      if (itemsError) throw itemsError;

      // 2. Fetch Stock and Orders in parallel (Optimización Item 7)
      const skuIds = items.map((i) => i.sku_id).filter(Boolean);
      const orderIds = items.map((i) => i.supplier_order_id).filter(Boolean);

      const [stocksResult, ordersResult] = await Promise.all([
        skuIds.length > 0
          ? window.sb.from("vw_stock_global").select("*").in("sku_id", skuIds)
          : Promise.resolve({ data: [] }),
        orderIds.length > 0
          ? window.sb
              .from("replenishment_supplier_orders")
              .select("*")
              .in("id", orderIds)
          : Promise.resolve({ data: [] }),
      ]);

      state.stockMap = {};
      (stocksResult.data || []).forEach((s) => {
        state.stockMap[s.sku_id] = s;
      });

      state.orderMap = {};
      (ordersResult.data || []).forEach((o) => {
        state.orderMap[o.id] = o;
      });

      renderSkuTable(items || []);
    } catch (err) {
      console.error("loadSkuTable error:", err);
      ui.containers.skuList.innerHTML = `<div class="empty-state accent">Error: ${err.message}</div>`;
    }
  }

  function renderSkuTable(items) {
    if (!items.length) {
      ui.containers.skuList.innerHTML =
        '<div class="empty-state">No hay items en la solicitud.</div>';
      return;
    }

    let html = `
        <table class="table">
            <thead>
                <tr class="table-head">
                    <th class="table-cell is-header cell-pad">SKU</th>
                    <th class="table-cell is-header cell-pad cell-narrow">Unidades</th>
                    <th class="table-cell is-header cell-pad cell-narrow">Pack</th>
                    <th class="table-cell is-header cell-pad cell-narrow">Total</th>
                    <th class="table-cell is-header cell-pad">Proveedor</th>
                    <th class="table-cell is-header cell-pad">Fecha</th>
                    <th class="table-cell is-header cell-pad">Estado</th>
                </tr>
            </thead>
            <tbody>`;

    items.forEach((item) => {
      const stockData = state.stockMap[item.sku_id];

      // Calculation
      const calc = window.Utils.calcReplenishment({
        requerido: stockData?.requerido,
        stock_actual: stockData?.stock_actual,
        pack_qty: item.master_sku?.pack_qty,
      });

      // Order Info
      const order = item.supplier_order_id
        ? state.orderMap[item.supplier_order_id]
        : null;
      const etaDate = order ? order.eta_date : "";
      const orderStatus = order ? order.status : "draft";

      // Status UI (Item 4: renderStatusBadge)
      const statusUI = window.Utils.mapSolicitudEstadoUI({
        supplier_id: item.supplier_id,
        eta_date: etaDate,
        final_cost: order ? order.final_cost : null,
        supplier_order_status: orderStatus,
      });
      const statusBadge = window.Utils.renderStatusBadge(statusUI);

      // Dropdowns (XSS fix: use escapeHtml for name)
      const provOptions = state.providers
        .map(
          (p) =>
            `<option value="${p.id}" ${p.id === item.supplier_id ? "selected" : ""}>${window.Utils.escapeHtml(p.nombre_fantasia)}</option>`,
        )
        .join("");

      html += `
            <tr class="table-row">
                <td class="table-cell cell-pad">
                    <div class="cell-strong">${window.Utils.escapeHtml(item.master_sku?.nombre || window.Constants?.LABELS?.UNKNOWN_SKU || "Unknown")}</div>
                    <div class="muted text-sm">SKU: ${item.master_sku?.pack_qty || 1} u/pack</div>
                </td>
                <td class="table-cell cell-pad cell-narrow">${stockData ? calc.unidades : "—"}</td>
                <td class="table-cell cell-pad cell-narrow">${stockData ? calc.pack : "—"}</td>
                <td class="table-cell cell-pad cell-narrow cell-strong">${stockData ? calc.total : "—"}</td>
                
                <td class="table-cell cell-pad">
                    <select class="input input-compact js-supplier" data-id="${item.id}">
                        <option value="">Seleccionar...</option>
                        ${provOptions}
                    </select>
                </td>
                
                <td class="table-cell cell-pad">
                    <input type="date" class="input input-compact js-date" 
                           data-item-id="${item.id}" 
                           data-supplier-id="${item.supplier_id || ""}"
                           data-order-id="${item.supplier_order_id || ""}"
                           value="${etaDate || ""}"
                           ${item.supplier_id ? "" : "disabled"}>
                </td>
                
                <td class="table-cell cell-pad">
                    ${statusBadge}
                </td>
            </tr>`;
    });

    html += "</tbody></table>";
    ui.containers.skuList.innerHTML = html;

    document
      .querySelectorAll(".js-supplier")
      .forEach((el) => el.addEventListener("change", onSupplierChange));

    // Debounce date change (Item 8)
    const debouncedDateChange = window.Utils.debounce(onDateChange, 500);
    document
      .querySelectorAll(".js-date")
      .forEach((el) => el.addEventListener("change", debouncedDateChange));
  }

  // 5. Handlers

  async function onSupplierChange(e) {
    const id = e.target.dataset.id;
    const val = e.target.value || null;

    await window.sb
      .from("replenishment_items")
      .update({
        supplier_id: val,
        supplier_order_id: null,
        status: "pending",
      })
      .eq("id", id);

    loadSkuTable();
  }

  async function onDateChange(e) {
    const input = e.target;
    const itemId = input.dataset.itemId;
    const supplierId = input.dataset.supplierId;
    const existingOrderId = input.dataset.orderId;
    const newDate = input.value;

    if (!supplierId) return;

    // Date validation (Item 5)
    if (newDate) {
      const selectedDate = new Date(newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        window.Toast.warning("⚠️ Fecha de entrega es en el pasado");
      }
    }

    try {
      let orderId = existingOrderId;

      if (!orderId) {
        const { data: drafts } = await window.sb
          .from("replenishment_supplier_orders")
          .select("id")
          .eq("request_id", state.currentRequestId)
          .eq("supplier_id", supplierId)
          .eq("status", "draft")
          .limit(1);

        if (drafts && drafts.length > 0) {
          orderId = drafts[0].id;
        } else {
          const { data: newOrder, error } = await window.sb
            .from("replenishment_supplier_orders")
            .insert([
              {
                request_id: state.currentRequestId,
                supplier_id: supplierId,
                status: "draft",
                eta_date: newDate,
              },
            ])
            .select()
            .single();
          if (error) throw error;
          orderId = newOrder.id;
        }

        await window.sb
          .from("replenishment_items")
          .update({ supplier_order_id: orderId })
          .eq("id", itemId);
      } else {
        await window.sb
          .from("replenishment_supplier_orders")
          .update({ eta_date: newDate })
          .eq("id", orderId);
      }

      loadSkuTable();
    } catch (err) {
      console.error("Date update error", err);
      window.Toast.error("Error actualizando fecha");
    }
  }

  async function loadSupplierTable() {
    if (!state.currentRequestId) return;
    ui.containers.supplierList.innerHTML =
      '<div class="empty-state">Calculando órdenes...</div>';

    const { data: items, error } = await window.sb
      .from("replenishment_items")
      .select("*, master_proveedores(nombre_fantasia, id)")
      .eq("request_id", state.currentRequestId)
      .neq("status", "cancelled")
      .limit(5000);

    if (error) {
      ui.containers.supplierList.innerHTML = `<div class="empty-state accent">Error: ${error.message}</div>`;
      return;
    }

    const groups = {};
    (items || []).forEach((item) => {
      const sId = item.supplier_id || "";
      if (!groups[sId]) {
        groups[sId] = {
          supplierId: sId,
          supplierName:
            item.master_proveedores?.nombre_fantasia ||
            window.Constants?.LABELS?.NO_SUPPLIER ||
            "Sin Proveedor",
          itemCount: 0,
          orderId: item.supplier_order_id || null,
        };
      }
      groups[sId].itemCount += 1;
      if (item.supplier_order_id) groups[sId].orderId = item.supplier_order_id;
    });

    const orderIds = Object.values(groups)
      .map((g) => g.orderId)
      .filter(Boolean);
    let ordersDataMap = {};
    if (orderIds.length > 0) {
      const { data: orders } = await window.sb
        .from("replenishment_supplier_orders")
        .select("*")
        .in("id", orderIds);
      (orders || []).forEach((o) => {
        ordersDataMap[o.id] = o;
      });
    }

    const groupsArr = Object.values(groups);
    if (!groupsArr.length) {
      ui.containers.supplierList.innerHTML =
        '<div class="empty-state">No hay items asignados.</div>';
      return;
    }

    let html = `
        <table class="table">
            <thead>
                <tr class="table-head">
                    <th class="table-cell is-header cell-pad">Proveedor</th>
                    <th class="table-cell is-header cell-pad">Items</th>
                    <th class="table-cell is-header cell-pad">Costo Final</th>
                    <th class="table-cell is-header cell-pad">Fecha Repo</th>
                    <th class="table-cell is-header cell-pad">Estado Orden</th>
                </tr>
            </thead>
            <tbody>`;

    groupsArr.forEach((grp) => {
      const order = grp.orderId ? ordersDataMap[grp.orderId] : null;
      const costVal = order ? order.final_cost : "";
      const dateVal = order ? order.eta_date || "" : "";
      const internalStatus = order ? order.status : "draft";

      const statusUI = window.Utils.mapSolicitudEstadoUI({
        supplier_id: grp.supplierId,
        eta_date: dateVal,
        final_cost: order ? order.final_cost : null,
        supplier_order_status: internalStatus,
      });
      const statusBadge = window.Utils.renderStatusBadge(statusUI);

      const disabled = grp.supplierId ? "" : "disabled";

      html += `
            <tr class="table-row">
                <td class="table-cell cell-pad cell-strong">${window.Utils.escapeHtml(grp.supplierName)}</td>
                <td class="table-cell cell-pad">${grp.itemCount}</td>
                <td class="table-cell cell-pad">
                    <input type="number" class="input input-compact js-ord-cost" data-sid="${grp.supplierId}" data-oid="${grp.orderId || ""}" value="${costVal}" placeholder="0.00" ${disabled}>
                </td>
                <td class="table-cell cell-pad">
                    <input type="date" class="input input-compact js-ord-date" data-sid="${grp.supplierId}" data-oid="${grp.orderId || ""}" value="${dateVal}" ${disabled}>
                </td>
                <td class="table-cell cell-pad">
                    ${statusBadge}
                </td>
            </tr>`;
    });

    html += "</tbody></table>";
    ui.containers.supplierList.innerHTML = html;

    document
      .querySelectorAll(".js-ord-cost")
      .forEach((el) => el.addEventListener("change", onOrderInfoChange));
    document
      .querySelectorAll(".js-ord-date")
      .forEach((el) => el.addEventListener("change", onOrderInfoChange));
  }

  async function onOrderInfoChange(e) {
    const input = e.target;
    const supplierId = input.dataset.sid;
    let orderId = input.dataset.oid;
    if (!supplierId) return;

    const row = input.closest("tr");
    const costInput = row.querySelector(".js-ord-cost");
    const dateInput = row.querySelector(".js-ord-date");

    const rawCost = parseFloat(costInput.value);
    const newCost = isNaN(rawCost) ? null : rawCost;
    const newDate = dateInput.value || null;

    // Date validation
    if (newDate) {
      const selectedDate = new Date(newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        window.Toast.warning("⚠️ Fecha de entrega es en el pasado");
      }
    }

    try {
      if (!orderId) {
        orderId = await ensureSupplierOrder({
          request_id: state.currentRequestId,
          supplier_id: supplierId,
        });
        await syncItemsToSupplierOrder({
          request_id: state.currentRequestId,
          supplier_id: supplierId,
          order_id: orderId,
        });
        costInput.dataset.oid = orderId;
        dateInput.dataset.oid = orderId;
      }

      await window.sb
        .from("replenishment_supplier_orders")
        .update({ final_cost: newCost, eta_date: newDate })
        .eq("id", orderId);

      const isReady = newCost !== null && newCost >= 0 && newDate;
      const nextStatus = isReady ? "ready_for_approval" : "draft";

      await window.sb
        .from("replenishment_supplier_orders")
        .update({ status: nextStatus })
        .eq("id", orderId);

      loadSupplierTable();
    } catch (err) {
      console.error("Order Update Error:", err);
      window.Toast.error("Error actualizando orden");
    }
  }

  async function ensureSupplierOrder({ request_id, supplier_id }) {
    const { data: existing } = await window.sb
      .from("replenishment_supplier_orders")
      .select("id")
      .eq("request_id", request_id)
      .eq("supplier_id", supplier_id)
      .neq("status", "cancelled")
      .limit(1);

    if (existing && existing.length > 0) return existing[0].id;

    const { data: newOrder, error } = await window.sb
      .from("replenishment_supplier_orders")
      .insert([
        {
          request_id: request_id,
          supplier_id: supplier_id,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return newOrder.id;
  }

  async function syncItemsToSupplierOrder({
    request_id,
    supplier_id,
    order_id,
  }) {
    await window.sb
      .from("replenishment_items")
      .update({ supplier_order_id: order_id })
      .eq("request_id", request_id)
      .eq("supplier_id", supplier_id);
  }

  // 6. Init

  ui.tabs.forEach((t) => {
    t.addEventListener("click", () => {
      ui.tabs.forEach((x) => x.classList.remove("active"));
      t.classList.add("active");

      state.activeTab = t.dataset.tab;
      if (state.activeTab === "sku-table") {
        ui.views.sku.classList.remove("hidden");
        ui.views.supplier.classList.add("hidden");
        loadSkuTable();
      } else {
        ui.views.sku.classList.add("hidden");
        ui.views.supplier.classList.remove("hidden");
        loadSupplierTable();
      }
    });
  });

  try {
    await loadProviders();
    await ensureDailyRequest();
    await populateItems();
    await loadSkuTable();
  } catch (err) {
    console.error("Init Error:", err);
    if (ui.containers.skuList) {
      ui.containers.skuList.innerHTML = `<div class="empty-state accent">Error inicializando solicitud: ${err.message}</div>`;
    }
  }
})();
