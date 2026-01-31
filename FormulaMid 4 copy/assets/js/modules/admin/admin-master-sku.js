// Module: admin-master-sku.js
// Logic for SKU Master Page
// initSlidePanel is global from panel.js

(async function () {
  "use strict";

  // 1. Session Check
  const authResult = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!authResult) return;
  const { user, profile } = authResult;

  // 2. DOM Elements (Grouped)
  const ui = {
    listContainer: document.getElementById("list-container"),
    moduleContent: document.getElementById("module-content"),
    inpNombre: document.getElementById("sku-nombre"),
    selCategoria: document.getElementById("sku-categoria"),
    selProveedor: document.getElementById("sku-proveedor"),
    inpPack: document.getElementById("sku-pack"),
    inpMl: document.getElementById("sku-ml"),
    inpCosto: document.getElementById("sku-costo"),
    inpCostoPack: document.getElementById("sku-costo-pack"),
    inpExternalId: document.getElementById("sku-external-id"),
    chkActive: document.getElementById("sku-active"),
    searchInput: document.getElementById("search-input"),
    tabsContainer: document.getElementById("sku-tabs"),
    filtersContainer: document.querySelector(".filter-bar"), // Parent of tabs
    viewTabs: document.getElementById("sku-view-tabs"),
    viewSkus: document.getElementById("view-skus"),
    viewRequests: document.getElementById("view-requests"),
    requestsList: document.getElementById("requests-list-container"),
    btnRefreshRequests: document.getElementById("btn-refresh-requests"),
    panelTitle: document.getElementById("panel-title"),
    btnSave: document.getElementById("btn-save"),
    btnNew: document.getElementById("btn-new"),
    pageCardLoading: document.getElementById("page-card-loading"),
    pageCardEmpty: document.getElementById("page-card-empty"),
    providersTotal: document.getElementById("providers-total"),
    providersActive: document.getElementById("providers-active"),
    providersInactive: document.getElementById("providers-inactive"),
  };

  if (!window.Utils.assertSbOrShowBlockingError(ui.listContainer)) return;

  // 3. State
  const PAGE_KEY = "admin-master-sku";
  const savedState = window.NavState ? window.NavState.restore(PAGE_KEY) : null;

  let categories = [];
  let providers = [];
  let skus = [];
  let requests = [];
  let activeView = savedState?.activeView || "skus";
  let activeCategoryId = savedState?.activeCategoryId || null; // null = todas
  let searchTerm = savedState?.searchTerm || "";
  let editingId = null;
  let firstLoad = !savedState; // Skip loading state if restoring? Or just use normal flow.

  // Restore UI values immediately if possible
  if (searchTerm && ui.searchInput) ui.searchInput.value = searchTerm;

  // 4. Constants & Utilities
  const errorState = (msg) =>
    `<div class="empty-state accent">Error: ${msg}</div>`;
  const requestsEmptyState =
    '<div class="empty-state">No hay solicitudes registradas.</div>';

  // Legacy support or fallback
  const numberOrNull =
    (window.Utils && window.Utils.numberOrNull) ||
    ((v) => {
      if (v === null || v === undefined) return null;
      const n = parseFloat(String(v).replace(",", "."));
      return Number.isFinite(n) ? n : null;
    });

  const requestTypeLabels = {
    create: "Agregar SKU",
    update: "Editar SKU",
    deactivate: "Quitar SKU",
    price_update: "Modificar precio",
    pack_update: "Modificar pack",
    supplier_update: "Cambiar proveedor favorito",
  };

  // 5. Options Render Helpers
  function renderSelectOptions(
    selectEl,
    data,
    placeholder,
    labelKey = "nombre",
    valueKey = "id",
  ) {
    if (!selectEl) return;
    const defaultOption = `<option value="">${placeholder}</option>`;
    const options = (data || [])
      .map(
        (item) =>
          `<option value="${item[valueKey]}">${item[labelKey]}</option>`,
      )
      .join("");
    selectEl.innerHTML = defaultOption + options;
  }

  // 6. Tabs & Filters (Baseline Pattern)
  function renderCategoryTabs() {
    if (!ui.tabsContainer) return;

    // Pattern: status-pill topbar-pill topbar-pill-quiet filter-pill
    const baseClass =
      "status-pill status-neutral topbar-pill topbar-pill-quiet filter-pill";
    const activeClass = "active";

    const allBtn = document.createElement("button");
    allBtn.className = `${baseClass} ${!activeCategoryId ? activeClass : ""}`;
    allBtn.textContent = `Todo`;
    allBtn.onclick = () => filterByCategory(null);

    const catBtns = (categories || []).map((cat) => {
      const btn = document.createElement("button");
      const isActive = String(cat.id) === String(activeCategoryId);
      btn.className = `${baseClass} ${isActive ? activeClass : ""}`;
      btn.textContent = cat.nombre;
      btn.onclick = () => filterByCategory(cat.id);
      return btn;
    });

    ui.tabsContainer.innerHTML = "";
    ui.tabsContainer.appendChild(allBtn);
    catBtns.forEach((btn) => ui.tabsContainer.appendChild(btn));
  }

  async function filterByCategory(catId) {
    activeCategoryId = catId;
    renderCategoryTabs(); // Update active state
    await loadList(); // Reload list with filter
  }

  // 7. View Switching
  function renderViewTabs() {
    if (!ui.viewTabs) return;
    ui.viewTabs.querySelectorAll("[data-view]").forEach((btn) => {
      const view = btn.getAttribute("data-view");
      btn.classList.toggle("active", view === activeView);
    });
  }

  async function setActiveView(view) {
    activeView = view;
    renderViewTabs();
    if (ui.viewSkus) ui.viewSkus.classList.toggle("hidden", view !== "skus");
    if (ui.viewRequests)
      ui.viewRequests.classList.toggle("hidden", view !== "requests");
    if (view === "requests" && requests.length === 0) {
      await loadRequests();
    }
  }

  // 8. Form Management
  const panel = initSlidePanel();

  const setFormCreate = () => {
    editingId = null;
    if (ui.panelTitle) ui.panelTitle.textContent = "Nuevo SKU";
    if (ui.btnSave) ui.btnSave.textContent = "Guardar";
    // Reset inputs
    ui.inpNombre.value = "";
    ui.selCategoria.value = "";
    ui.selProveedor.value = "";
    ui.inpPack.value = "";
    ui.inpMl.value = "";
    ui.inpCosto.value = "";
    ui.inpCostoPack.value = "";
    ui.inpExternalId.value = "";
    ui.chkActive.checked = true;
  };

  const setFormEdit = (item) => {
    editingId = item.id;
    if (ui.panelTitle) ui.panelTitle.textContent = "Editar SKU";
    if (ui.btnSave) ui.btnSave.textContent = "Actualizar";

    ui.inpNombre.value = item.nombre || "";
    ui.selCategoria.value = item.categoria_id || "";
    ui.selProveedor.value = item.proveedor_default_id || "";
    ui.inpPack.value = item.pack_qty || "";
    ui.inpMl.value = item.ml_por_unidad || "";
    ui.inpCosto.value = item.costo || "";
    ui.inpCostoPack.value = item.costo_pack || "";
    ui.inpExternalId.value = item.external_id || "";
    ui.chkActive.checked = item.active;
  };

  // 9. Render Lists
  function renderList(data) {
    if (!ui.listContainer) return;

    if (!data || data.length === 0) {
      ui.listContainer.innerHTML = "";
      // Empty state handled by caller
      return;
    }

    const rows = data
      .map((item) => {
        const statusClass = item.active
          ? "staff-status-accepted"
          : "staff-status-rejected";
        const statusText = item.active ? "Activo" : "Inactivo";
        const provName = item.master_proveedores
          ? item.master_proveedores.nombre_fantasia
          : "-";
        const packQty = item.pack_qty != null ? item.pack_qty : "-";
        const costo =
          item.costo != null ? window.Utils.formatARS(item.costo) : "-";
        const costoPack =
          item.costo_pack != null
            ? window.Utils.formatARS(item.costo_pack)
            : "-";
        const ml =
          item.ml_por_unidad != null ? `${item.ml_por_unidad} ml` : "-";

        return `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong">${item.nombre}</td>
                    <td class="table-cell cell-pad muted">${ml}</td>
                    <td class="table-cell cell-pad">${costo}</td>
                    <td class="table-cell cell-pad">${packQty}</td>
                    <td class="table-cell cell-pad">${costoPack}</td>
                    <td class="table-cell cell-pad muted">${provName}</td>
                    <td class="table-cell cell-pad"><span class="staff-status badge ${statusClass}">${statusText}</span></td>
                    <td class="table-cell cell-pad">
                        <button class="footer-link btn-edit-sku btn-ghost btn-sm" data-id="${item.id}">Editar</button>
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
                            <th class="table-cell is-header cell-pad">Nombre</th>
                            <th class="table-cell is-header cell-pad">ML</th>
                            <th class="table-cell is-header cell-pad">Costo</th>
                            <th class="table-cell is-header cell-pad">Pack</th>
                            <th class="table-cell is-header cell-pad">Costo Pack</th>
                            <th class="table-cell is-header cell-pad">Proveedor</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">Editar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    ui.listContainer.innerHTML = html;
  }

  function renderRequests(data) {
    if (!ui.requestsList) return;
    if (!data || data.length === 0) {
      ui.requestsList.innerHTML = requestsEmptyState;
      return;
    }

    const rows = data
      .map((req) => {
        const createdAt = req.created_at
          ? new Date(req.created_at).toLocaleString()
          : "-";
        const payload = parsePayload(req.payload);
        const skuName = req.sku_nombre || payload.nombre || "-";
        const typeLabel =
          requestTypeLabels[req.request_type] || req.request_type || "-";
        const status = req.status || "pending";
        const statusClass =
          status === "approved"
            ? "status-pill status-success"
            : status === "rejected"
              ? "status-pill status-error"
              : "status-pill status-warning";

        let actionHtml = "-";
        if (status === "pending") {
          actionHtml = `
                    <div class="actions-bar">
                        <button class="btn-ghost btn-sm" data-action="approve" data-id="${req.id}">Aprobar</button>
                        <button class="btn-ghost btn-sm" data-action="reject" data-id="${req.id}">Rechazar</button>
                    </div>
                `;
        }

        return `
                <tr class="table-row">
                    <td class="table-cell cell-pad">${createdAt}</td>
                    <td class="table-cell cell-pad">${typeLabel}</td>
                    <td class="table-cell cell-pad cell-strong">${skuName}</td>
                    <td class="table-cell cell-pad muted">${formatChangeSummary(payload)}</td>
                    <td class="table-cell cell-pad muted">${req.justification || "-"}</td>
                    <td class="table-cell cell-pad"><span class="${statusClass}">${status}</span></td>
                    <td class="table-cell cell-pad">${actionHtml}</td>
                </tr>
            `;
      })
      .join("");

    const html = `
            <div class="table-scroll">
                <table class="table table-sticky">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">Fecha</th>
                            <th class="table-cell is-header cell-pad">Tipo</th>
                            <th class="table-cell is-header cell-pad">SKU</th>
                            <th class="table-cell is-header cell-pad">Cambios</th>
                            <th class="table-cell is-header cell-pad">Motivo</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    ui.requestsList.innerHTML = html;
  }

  // 10. Helpers for Requests
  function parsePayload(payload) {
    if (!payload) return {};
    if (typeof payload === "string") {
      try {
        return JSON.parse(payload);
      } catch (err) {
        return {};
      }
    }
    return payload;
  }

  function formatChangeSummary(payload) {
    const data = parsePayload(payload);
    const parts = [];

    if (data.nombre) parts.push(`Nombre: ${data.nombre}`);
    if (data.ml_por_unidad != null) parts.push(`ML: ${data.ml_por_unidad}`);
    if (data.pack_qty != null) parts.push(`Pack: ${data.pack_qty}`);
    if (data.costo != null)
      parts.push(`Costo: ${window.Utils.formatARS(data.costo)}`);
    if (data.costo_pack != null)
      parts.push(`Costo pack: ${window.Utils.formatARS(data.costo_pack)}`);
    if (data.external_id) parts.push(`ID ext: ${data.external_id}`);

    if (data.categoria_id) {
      const cat = categories.find(
        (c) => String(c.id) === String(data.categoria_id),
      );
      parts.push(`Categoría: ${cat ? cat.nombre : data.categoria_id}`);
    }

    if (data.proveedor_default_id) {
      const prov = providers.find(
        (p) => String(p.id) === String(data.proveedor_default_id),
      );
      parts.push(
        `Proveedor: ${prov ? prov.nombre_fantasia : data.proveedor_default_id}`,
      );
    }

    return parts.length ? parts.join(" · ") : "-";
  }

  // 11. Data Loading
  async function loadList() {
    if (firstLoad) {
      window.Utils.setPageState(ui, { loading: true });
    }

    try {
      // Base query with relationships
      let query = window.sb
        .from("master_sku")
        .select(
          `
                    id, 
                    nombre, 
                    active,
                    pack_qty,
                    ml_por_unidad,
                    costo, 
                    costo_pack,
                    categoria_id, 
                    proveedor_default_id,
                    external_id,
                    master_categories (id, nombre),
                    master_proveedores (id, nombre_fantasia)
                `,
        )
        .order("nombre");

      // Server-side Filtering
      if (activeCategoryId) {
        query = query.eq("categoria_id", activeCategoryId);
      }
      if (searchTerm) {
        query = query.ilike("nombre", `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      skus = data || [];

      if (skus.length === 0) {
        window.Utils.setPageState(ui, { empty: true });
      } else {
        renderList(skus);
        window.Utils.setPageState(ui, { loading: false });
      }
    } catch (err) {
      console.error("Error loading SKUs:", err);
      if (ui.listContainer)
        ui.listContainer.innerHTML = errorState(err.message);
      window.Utils.setPageState(ui, { loading: false }); // Ensure loading is off
    } finally {
      firstLoad = false;
    }
  }

  async function loadRequests() {
    if (!ui.requestsList) return;
    ui.requestsList.innerHTML =
      '<div class="empty-state">Cargando solicitudes...</div>';
    try {
      const { data, error } = await window.sb
        .from("sku_change_requests")
        .select(
          "id, created_at, status, request_type, sku_id, sku_nombre, justification, payload, requested_by",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      requests = data || [];
      renderRequests(requests);
    } catch (err) {
      ui.requestsList.innerHTML = errorState(err.message);
    }
  }

  async function loadOptions() {
    try {
      const [{ data: catData }, { data: provData }] = await Promise.all([
        window.sb
          .from("master_categories")
          .select("id, nombre")
          .eq("active", true)
          .order("nombre"),
        window.sb
          .from("master_proveedores")
          .select("id, nombre_fantasia")
          .eq("active", true)
          .order("nombre_fantasia"),
      ]);

      categories = catData || [];
      providers = provData || [];

      renderSelectOptions(ui.selCategoria, categories, "Seleccionar categoría");
      renderSelectOptions(
        ui.selProveedor,
        providers,
        "Proveedor por defecto",
        "nombre_fantasia",
      );
      renderCategoryTabs();
    } catch (err) {
      console.error("Error loading options:", err);
    }
  }

  // 12. CRUD & Action Logic
  async function saveSku() {
    const nombre = ui.inpNombre.value.trim();
    const categoria_id = ui.selCategoria.value; // Fixed reference

    const payload = {
      nombre: nombre,
      categoria_id: categoria_id || null, // Ensure null if empty
      proveedor_default_id: ui.selProveedor.value || null,
      pack_qty: numberOrNull(ui.inpPack.value),
      ml_por_unidad: numberOrNull(ui.inpMl.value),
      costo: numberOrNull(ui.inpCosto.value),
      costo_pack: numberOrNull(ui.inpCostoPack.value),
      external_id: ui.inpExternalId.value.trim() || null,
      active: ui.chkActive.checked,
    };

    if (!payload.nombre) {
      window.Toast.error("El nombre es obligatorio.");
      return;
    }
    if (!payload.categoria_id) {
      window.Toast.error("La categoría es obligatoria.");
      return;
    }

    ui.btnSave.disabled = true;
    try {
      if (editingId) {
        const { error } = await window.sb
          .from("master_sku")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        window.Toast.success("SKU actualizado correctamente");
      } else {
        const { error } = await window.sb.from("master_sku").insert([payload]);
        if (error) throw error;
        window.Toast.success("SKU creado correctamente");
      }

      panel.close();
      await loadList();
    } catch (err) {
      console.error("Error saving SKU:", err);
      window.Toast.error("Error al guardar: " + err.message);
    } finally {
      ui.btnSave.disabled = false;
    }
  }

  // Request handling
  async function resolveSkuId(req) {
    if (req.sku_id) return req.sku_id;
    const payload = parsePayload(req.payload);
    const skuName = req.sku_nombre || payload.nombre;
    if (!skuName) return null;

    const { data, error } = await window.sb
      .from("master_sku")
      .select("id")
      .eq("nombre", skuName)
      .maybeSingle();
    if (error) throw error;
    return data?.id || null;
  }

  async function applyRequest(req) {
    // Logic duplicated from original file, standardized
    const type = req.request_type;
    const payload = buildSkuPayload(req.payload); // Need helper?
    // Let's include helper buildSkuPayload inside applyRequest or global

    function buildSkuPayloadInternal(payloadInput) {
      const data = parsePayload(payloadInput);
      // Reconstruct object with only valid fields for master_sku
      const result = {};
      // Copy over fields...
      [
        "nombre",
        "categoria_id",
        "proveedor_default_id",
        "external_id",
        "active",
      ].forEach((k) => {
        if (data[k] !== undefined) result[k] = data[k];
      });
      ["pack_qty", "ml_por_unidad", "costo", "costo_pack"].forEach((k) => {
        const val = numberOrNull(data[k]);
        if (val !== null) result[k] = val;
      });
      return result;
    }

    const finalPayload = buildSkuPayloadInternal(req.payload);

    if (type === "create") {
      if (!finalPayload.nombre) throw new Error("Nombre faltante");
      if (finalPayload.active === undefined) finalPayload.active = true;
      const res = await window.sb.from("master_sku").insert([finalPayload]);
      if (res.error) throw res.error;
      return;
    }

    const skuId = await resolveSkuId(req);
    if (!skuId) throw new Error("SKU no encontrado");

    if (type === "deactivate") {
      const res = await window.sb
        .from("master_sku")
        .update({ active: false })
        .eq("id", skuId);
      if (res.error) throw res.error;
      return;
    }

    const res = await window.sb
      .from("master_sku")
      .update(finalPayload)
      .eq("id", skuId);
    if (res.error) throw res.error;
  }

  async function handleRequestAction(action, id) {
    const req = requests.find((r) => String(r.id) === String(id));
    if (!req) return;

    try {
      if (action === "approve") {
        await applyRequest(req);
        await window.sb
          .from("sku_change_requests")
          .update({
            status: "approved",
            approved_by: session.user.id,
            approved_at: new Date().toISOString(),
          })
          .eq("id", id);
        window.Toast.success("Solicitud aprobada");
      } else {
        await window.sb
          .from("sku_change_requests")
          .update({
            status: "rejected",
            approved_by: session.user.id,
            approved_at: new Date().toISOString(),
          })
          .eq("id", id);
        window.Toast.info("Solicitud rechazada");
      }
      await loadRequests();
      await loadList();
    } catch (err) {
      console.error(err);
      window.Toast.error("Error: " + err.message);
    }
  }

  // 13. Events Initialization
  function bindEvents() {
    // Search
    if (ui.searchInput) {
      ui.searchInput.addEventListener(
        "input",
        window.Utils.debounce(async (e) => {
          searchTerm = e.target.value;
          await loadList(); // Server side search
        }, 300),
      );
    }

    // View Tabs
    if (ui.viewTabs) {
      ui.viewTabs.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-view]");
        if (btn) setActiveView(btn.dataset.view);
      });
    }

    // New Button
    if (ui.btnNew) {
      ui.btnNew.addEventListener("click", () => {
        setFormCreate();
        panel.open();
      });
    }

    // Slide Panel
    if (ui.btnSave) {
      ui.btnSave.addEventListener("click", saveSku);
    }

    // List Actions (Delegation)
    if (ui.listContainer) {
      ui.listContainer.addEventListener("click", async (e) => {
        const btnEdit = e.target.closest(".btn-edit-sku");
        if (btnEdit) {
          const id = btnEdit.dataset.id;
          const item = skus.find((s) => String(s.id) === String(id));
          if (item) {
            setFormEdit(item);
            panel.open();
          }
        }
      });
    }

    // Request Actions (Delegation)
    if (ui.requestsList) {
      ui.requestsList.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (btn) {
          handleRequestAction(btn.dataset.action, btn.dataset.id);
        }
      });
    }

    if (ui.btnRefreshRequests) {
      ui.btnRefreshRequests.addEventListener("click", loadRequests);
    }
  }

  // 14. Init
  async function init() {
    bindEvents();

    // Save state before navigating away
    window.addEventListener("beforeunload", () => {
      if (window.NavState) {
        window.NavState.save(PAGE_KEY, {
          activeCategoryId,
          searchTerm,
          activeView,
        });
      }
    });

    await loadOptions();
    await loadList();
    renderViewTabs();
  }

  init();
})();
