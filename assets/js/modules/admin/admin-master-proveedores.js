// Module: admin-master-proveedores.js
// Logic for Suppliers Master Page
// initSlidePanel is global from panel.js

(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  // 2. DOM Elements
  const listContainer = document.getElementById("list-container");
  const moduleContent = document.getElementById("module-content");
  const inpNombre = document.getElementById("prov-nombre");
  const inpRazonSocial = document.getElementById("prov-razon-social");
  const inpCuit = document.getElementById("prov-cuit");
  const inpTelefono = document.getElementById("prov-telefono");
  const inpEmail = document.getElementById("prov-email");
  const inpContactoNombre = document.getElementById("prov-contacto-nombre");
  const inpBanco = document.getElementById("prov-banco");
  const inpCbu = document.getElementById("prov-cbu");
  const inpCategory = document.getElementById("prov-category");
  const inpNotas = document.getElementById("prov-notas");
  const chkActive = document.getElementById("prov-active");
  const panelTitle = document.getElementById("panel-title");
  const btnSave = document.getElementById("btn-save");
  const btnNew = document.getElementById("btn-new");
  const searchInput = document.getElementById("providers-search");
  const countTotal = document.getElementById("providers-total");
  const countActive = document.getElementById("providers-active");
  const countInactive = document.getElementById("providers-inactive");
  const pageCardLoading = document.getElementById("page-card-loading");
  const pageCardEmpty = document.getElementById("page-card-empty");
  const btnClearSearch = document.getElementById("btn-clear-search");

  // Page State Management
  function setPageState({ loading = false, empty = false } = {}) {
    pageCardLoading?.classList.toggle("is-visible", loading);
    pageCardEmpty?.classList.toggle("is-visible", empty);
    moduleContent?.classList.toggle("hidden", loading || empty);
  }

  if (!window.Utils?.assertSbOrShowBlockingError?.(listContainer)) return;

  const errorState = (msg) => `
        <div class="state-block">
            <p class="state-title danger">Error al cargar</p>
            <p class="state-desc">${msg}</p>
        </div>
    `;
  const emptyState = `
        <div class="state-block">
            <p class="state-title">Sin proveedores</p>
            <p class="state-desc">No hay proveedores registrados.</p>
            <button class="btn-ghost btn-sm mt-2" data-action="create-provider">Crear proveedor</button>
        </div>
    `;

  let providers = [];
  let categories = [];
  let editingId = null;
  let expandedId = null;
  let currentStatus = "all";
  let firstLoad = true;
  let overlayTimer = null;
  let searchTimer = null;

  const setFormCreate = () => {
    editingId = null;
    if (panelTitle) panelTitle.textContent = "Nuevo Proveedor";
    if (btnSave) btnSave.textContent = "Guardar";
  };

  const setFormEdit = () => {
    if (panelTitle) panelTitle.textContent = "Editar Proveedor";
    if (btnSave) btnSave.textContent = "Actualizar";
  };

  function updateSummary() {
    if (!countTotal || !countActive || !countInactive) return;
    const total = providers.length;
    const active = providers.filter((p) => p.active).length;
    const inactive = total - active;
    countTotal.textContent = total;
    countActive.textContent = active;
    countInactive.textContent = inactive;
  }

  function renderCategoryOptions(selectedValue = "") {
    if (!inpCategory) return;
    const options = ['<option value="">Seleccionar rubro</option>'];
    categories.forEach((cat) => {
      const name = cat.nombre;
      options.push(`<option value="${name}">${name}</option>`);
    });

    if (
      selectedValue &&
      !categories.some((cat) => cat.nombre === selectedValue)
    ) {
      options.push(
        `<option value="${selectedValue}">${selectedValue}</option>`,
      );
    }

    inpCategory.innerHTML = options.join("");
    if (selectedValue) inpCategory.value = selectedValue;
  }

  async function loadCategories() {
    try {
      const { data, error } = await window.sb
        .from("master_categories")
        .select("id, nombre, active")
        .order("nombre");

      if (error) throw error;
      categories = data || [];
      renderCategoryOptions();
    } catch (err) {
      console.error("Error loading categories:", err);
      renderCategoryOptions();
    }
  }

  // 3. Render Function
  function renderList(data) {
    if (!data || data.length === 0) {
      listContainer.innerHTML = emptyState;
      pageCardEmpty?.classList.remove("is-visible");
      return;
    }

    const searchTerm = (searchInput?.value || "").toLowerCase().trim();
    const baseFiltered = data.filter((item) => {
      if (currentStatus === "active") return !!item.active;
      if (currentStatus === "inactive") return !item.active;
      return true;
    });

    const filtered = !searchTerm
      ? baseFiltered
      : baseFiltered.filter((item) => {
          const values = [
            item.nombre_fantasia,
            item.razon_social,
            item.cuit,
            item.category,
            item.email,
            item.contacto_nombre,
            item.contacto_telefono,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return values.includes(searchTerm);
        });

    if (filtered.length === 0) {
      listContainer.innerHTML = "";
      pageCardEmpty?.classList.add("is-visible");
      return;
    }
    pageCardEmpty?.classList.remove("is-visible");

    const rows = [];
    rows.push(`
            <div class="table-viewport table-shell table-viewport-limited">
                <div class="table-scroll">
                    <table class="table table-sticky">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">Nombre (Fantasia)</th>
                            <th class="table-cell is-header cell-pad">Razón Social</th>
                            <th class="table-cell is-header cell-pad">CUIT</th>
                            <th class="table-cell is-header cell-pad">Banco</th>
                            <th class="table-cell is-header cell-pad">Alias/CBU</th>
                            <th class="table-cell is-header cell-pad">Editar</th>
                        </tr>
                    </thead>
                    <tbody>
        `);

    filtered.forEach((item) => {
      const inactiveClass = item.active ? "" : "is-inactive";
      const cuit = item.cuit || "-";
      const razon = item.razon_social || "-";
      const banco = item.banco || "-";
      const cbu = item.cbu_alias || "-";
      const notas = item.notas || "";
      const telefono = item.contacto_telefono || "-";
      const email = item.email || "-";
      const contactoNombre = item.contacto_nombre || "-";
      const isExpanded = expandedId === item.id;

      rows.push(`
                <tr class="table-row row-clickable prov-row ${isExpanded ? "is-open" : ""} ${inactiveClass}" data-id="${item.id}">
                    <td class="table-cell cell-pad cell-strong">
                        <span class="row-caret">▸</span>${item.nombre_fantasia}
                    </td>
                    <td class="table-cell cell-pad muted">${razon}</td>
                    <td class="table-cell cell-pad muted">${cuit}</td>
                    <td class="table-cell cell-pad muted">${banco}</td>
                    <td class="table-cell cell-pad muted">${cbu}</td>
                    <td class="table-cell cell-pad">
                        <button class="btn-ghost btn-sm btn-edit-prov" data-id="${item.id}" title="Editar">Editar</button>
                        ${notas ? `<span class="note">${notas.slice(0, 50)}${notas.length > 50 ? "…" : ""}</span>` : ""}
                    </td>
                </tr>
                <tr class="prov-details row-details row-subtle ${isExpanded ? "is-open" : ""} ${inactiveClass}" data-id="${item.id}">
                    <td colspan="6" class="table-cell cell-pad-sm text-sm muted">
                        <div class="row-flex">
                            <div><strong>Contacto:</strong> <span class="muted">${contactoNombre}</span></div>
                            <div><strong>Teléfono:</strong> <span class="muted">${telefono}</span></div>
                            <div><strong>Email:</strong> <span class="muted">${email}</span></div>
                        </div>
                    </td>
                </tr>
            `);
    });

    rows.push(`</tbody></table></div></div>`);
    listContainer.innerHTML = rows.join("");
  }

  // 4. Fetch Data
  async function loadList() {
    listContainer.innerHTML = "";
    pageCardEmpty?.classList.remove("is-visible");
    if (firstLoad) {
      pageCardLoading?.classList.add("is-visible");
      firstLoad = false;
    }
    try {
      const { data, error } = await window.sb
        .from("master_proveedores")
        .select(
          "id, nombre_fantasia, razon_social, cuit, category, banco, cbu_alias, email, contacto_nombre, contacto_telefono, notas, active",
        )
        .order("nombre_fantasia");

      if (error) throw error;
      providers = data || [];
      updateSummary();
      renderList(providers);
    } catch (err) {
      console.error("Error loading suppliers:", err);
      listContainer.innerHTML = errorState(err.message);
    } finally {
      if (overlayTimer) {
        clearTimeout(overlayTimer);
        overlayTimer = null;
      }
      pageCardLoading?.classList.remove("is-visible");
    }
  }

  // Init
  await loadCategories();
  loadList();

  // 5. Panel Logic
  const panelCtrl = window.initSlidePanel({
    onOpen: () => {
      if (!editingId) {
        // Reset fields
        if (inpNombre) inpNombre.value = "";
        if (inpRazonSocial) inpRazonSocial.value = "";
        if (inpCuit) inpCuit.value = "";
        if (inpTelefono) inpTelefono.value = "";
        if (inpEmail) inpEmail.value = "";
        if (inpBanco) inpBanco.value = "";
        if (inpCbu) inpCbu.value = "";
        if (inpContactoNombre) inpContactoNombre.value = "";
        renderCategoryOptions();
        if (inpNotas) inpNotas.value = "";
        if (chkActive) chkActive.checked = true;
        setFormCreate();
      }
      if (inpNombre) inpNombre.focus();
    },
    onClose: () => {
      setFormCreate();
    },
    onSave: async () => {
      const nombre = (inpNombre?.value || "").trim();
      const razonSocial = (inpRazonSocial?.value || "").trim();
      const cuitRaw = (inpCuit?.value || "").trim();
      const telefono = (inpTelefono?.value || "").trim();
      const email = (inpEmail?.value || "").trim();
      const banco = (inpBanco?.value || "").trim();
      const cbu = (inpCbu?.value || "").trim();
      const contactoNombre = (inpContactoNombre?.value || "").trim();
      const category = (inpCategory?.value || "").trim();
      const notas = (inpNotas?.value || "").trim();
      const active = !!chkActive?.checked;

      if (!nombre) {
        window.Toast.error("El nombre de fantasía es obligatorio.");
        return;
      }

      // UI Loading
      const originalBtnText = btnSave.textContent;
      btnSave.textContent = "Guardando...";
      btnSave.disabled = true;

      try {
        // Normalizar CUIT (quitar separadores)
        const cuit = cuitRaw ? cuitRaw.replace(/[^\d]/g, "") : null;

        const payload = {
          nombre_fantasia: nombre,
          razon_social: razonSocial || nombre,
          cuit: cuit || null,
          banco: banco || null,
          cbu_alias: cbu || null,
          contacto_telefono: telefono || null,
          email: email || null,
          contacto_nombre: contactoNombre || null,
          category: category || null,
          notas: notas || null,
          active,
        };

        if (editingId) {
          const { error } = await window.sb
            .from("master_proveedores")
            .update(payload)
            .eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await window.sb
            .from("master_proveedores")
            .insert([payload]);
          if (error) throw error;
        }

        // Success
        window.Toast.success(
          editingId ? "Proveedor actualizado" : "Proveedor creado",
        );
        await loadList();
        setFormCreate();
        editingId = null;
        if (panelCtrl?.close) panelCtrl.close();
      } catch (err) {
        console.error("Error saving provider:", err);
        window.Toast.error(err.message || "Error al guardar proveedor");
      } finally {
        // Restore UI
        if (btnSave) {
          btnSave.textContent = originalBtnText;
          btnSave.disabled = false;
        }
      }
    },
  });

  // Reset to create mode when clicking Nuevo
  if (btnNew) {
    btnNew.addEventListener("click", () => {
      setFormCreate();
      editingId = null;
      panelCtrl?.open?.();
    });
  }

  // Focus trap and Escape key handler
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      document.getElementById("slide-panel")?.classList.contains("is-open")
    ) {
      panelCtrl?.close?.();
    }
  });

  function toggleDetails(id) {
    const openDetails = listContainer.querySelector(".prov-details.is-open");
    if (openDetails && openDetails.dataset.id !== id) {
      openDetails.classList.remove("is-open");
      const prevRow = listContainer.querySelector(
        `.prov-row[data-id="${openDetails.dataset.id}"]`,
      );
      if (prevRow) prevRow.classList.remove("is-open");
    }

    const detailsRow = listContainer.querySelector(
      `.prov-details[data-id="${id}"]`,
    );
    const mainRow = listContainer.querySelector(`.prov-row[data-id="${id}"]`);
    if (!detailsRow) return;

    const willOpen = !detailsRow.classList.contains("is-open");
    detailsRow.classList.toggle("is-open", willOpen);
    if (mainRow) mainRow.classList.toggle("is-open", willOpen);
    expandedId = willOpen ? id : null;
  }

  // Search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => renderList(providers), 180);
    });
  }

  // Status pills
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentStatus = btn.dataset.status || "all";
      if (currentStatus === "all" && searchInput) {
        searchInput.value = "";
      }
      renderList(providers);
    });
  });

  // Edit button handler (event delegation)
  if (listContainer) {
    listContainer.addEventListener("click", (e) => {
      const target = e.target;
      const createBtn = target.closest('[data-action="create-provider"]');
      if (createBtn) {
        btnNew?.click();
        return;
      }
      const editBtn = target.closest(".btn-edit-prov");
      if (editBtn) {
        const id = editBtn.getAttribute("data-id");
        const prov = providers.find((p) => p.id === id);
        if (!prov) return;
        editingId = id;
        setFormEdit();

        if (inpNombre) inpNombre.value = prov.nombre_fantasia || "";
        if (inpRazonSocial) inpRazonSocial.value = prov.razon_social || "";
        if (inpCuit) inpCuit.value = prov.cuit || "";
        if (inpTelefono) inpTelefono.value = prov.contacto_telefono || "";
        if (inpEmail) inpEmail.value = prov.email || "";
        if (inpBanco) inpBanco.value = prov.banco || "";
        if (inpCbu) inpCbu.value = prov.cbu_alias || "";
        if (inpContactoNombre)
          inpContactoNombre.value = prov.contacto_nombre || "";
        renderCategoryOptions(prov.category || "");
        if (inpNotas) inpNotas.value = prov.notas || "";
        if (chkActive) chkActive.checked = !!prov.active;

        if (panelCtrl?.open) panelCtrl.open();
        return;
      }

      const row = target.closest(".prov-row");
      if (row) {
        const id = row.getAttribute("data-id");
        toggleDetails(id);
        const expanded = row.classList.contains("is-open");
        row.setAttribute("aria-expanded", expanded ? "true" : "false");
      }
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentStatus = "all";
      document
        .querySelectorAll(".filter-pill")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelector('.filter-pill[data-status=\"all\"]')
        ?.classList.add("active");
      renderList(providers);
    });
  }

  // 6. Shared Events
  document
    .getElementById("btn-logout")
    ?.addEventListener("click", () => window.Auth.signOutAndGoLogin());
})();
