// Module: admin-master-categorias.js
// Logic for Categories Master Page
// initSlidePanel is global from panel.js

(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return; // Redirecting...

  // 2. DOM References (Grouped)
  const refs = {
    listContainer: document.getElementById("list-container"),
    moduleContent: document.getElementById("module-content"),
    inpNombre: document.getElementById("cat-nombre"),
    chkActive: document.getElementById("cat-active"),
    panelTitle: document.getElementById("panel-title"),
    btnSave: document.getElementById("btn-save"),
    btnNew: document.getElementById("btn-new"),
    searchInput: document.getElementById("search-input"),
    countTotal: document.getElementById("categories-total"),
    countActive: document.getElementById("categories-active"),
    countInactive: document.getElementById("categories-inactive"),
    pageCardLoading: document.getElementById("page-card-loading"),
    pageCardEmpty: document.getElementById("page-card-empty"),
    btnClearSearch: document.getElementById("btn-clear-search"),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(refs.listContainer)) return;

  // 3. UI State Templates
  const ui = {
    error: (msg) => `
            <div class="state-block">
                <p class="state-title danger">Error al cargar</p>
                <p class="state-desc">${msg}</p>
            </div>
        `,
    empty: `
            <div class="state-block">
                <p class="state-title">Sin categorías</p>
                <p class="state-desc">No hay categorías registradas.</p>
                <button class="btn-ghost btn-sm mt-2" data-action="create-category">Crear categoría</button>
            </div>
        `,
  };

  // 4. State
  let categories = [];
  let editingId = null;
  let currentStatus = "all";
  let firstLoad = true;
  let searchTimer = null;

  function updateSummary() {
    if (!refs.countTotal || !refs.countActive || !refs.countInactive) return;
    const total = categories.length;
    const active = categories.filter((c) => c.active).length;
    const inactive = total - active;
    refs.countTotal.textContent = total;
    refs.countActive.textContent = active;
    refs.countInactive.textContent = inactive;
  }

  // 5. Form State Helpers
  const setFormCreate = () => {
    editingId = null;
    if (refs.panelTitle) refs.panelTitle.textContent = "Nueva Categoría";
    if (refs.btnSave) refs.btnSave.textContent = "Guardar";
  };

  const setFormEdit = () => {
    if (refs.panelTitle) refs.panelTitle.textContent = "Editar Categoría";
    if (refs.btnSave) refs.btnSave.textContent = "Actualizar";
  };

  // 6. Render Function
  function renderList(data) {
    if (!data || data.length === 0) {
      window.Utils.setPageState(refs, { empty: true });
      return;
    }

    const searchTerm = (refs.searchInput?.value || "").toLowerCase().trim();
    const baseFiltered = data.filter((item) => {
      if (currentStatus === "active") return !!item.active;
      if (currentStatus === "inactive") return !item.active;
      return true;
    });
    const filtered = !searchTerm
      ? baseFiltered
      : baseFiltered.filter((item) => {
          const values = [item.nombre, item.created_at]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return values.includes(searchTerm);
        });

    if (filtered.length === 0) {
      refs.listContainer.innerHTML = "";
      window.Utils.setPageState(refs, { empty: true });
      return;
    }
    window.Utils.setPageState(refs, { loading: false }); // Show Content

    let html = `
            <div class="table-scroll">
                <table class="table table-sticky">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">Nombre</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">Creado</th>
                            <th class="table-cell is-header cell-pad">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    filtered.forEach((item) => {
      const statusClass = item.active
        ? "staff-status-accepted"
        : "staff-status-rejected";
      const statusText = item.active ? "Activo" : "Inactivo";
      const date = item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : "-";

      html += `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong">${item.nombre}</td>
                    <td class="table-cell cell-pad"><span class="staff-status badge ${statusClass}">${statusText}</span></td>
                    <td class="table-cell cell-pad faint">${date}</td>
                    <td class="table-cell cell-pad">
                        <button class="btn-ghost btn-sm btn-edit-cat" data-id="${item.id}">Editar</button>
                    </td>
                </tr>
            `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        `;

    refs.listContainer.innerHTML = html;
  }

  // 7. Fetch Data
  async function loadList() {
    if (firstLoad) {
      window.Utils.setPageState(refs, { loading: true });
      firstLoad = false;
    }

    try {
      const { data, error } = await window.sb
        .from("master_categories")
        .select("id, nombre, active, created_at")
        .order("nombre");

      if (error) throw error;
      categories = data || [];
      updateSummary();
      renderList(categories);
    } catch (err) {
      console.error("Error loading categories:", err);
      refs.listContainer.innerHTML = ui.error(err.message);
      window.Utils.setPageState(refs, { loading: false });
    } finally {
      if (categories.length > 0) {
        window.Utils.setPageState(refs, { loading: false });
      }
    }
  }

  // Init list
  loadList();

  // 8. Panel Logic
  const panelCtrl = window.initSlidePanel({
    onOpen: () => {
      if (!editingId) {
        if (refs.inpNombre) refs.inpNombre.value = "";
        if (refs.chkActive) refs.chkActive.checked = true;
        setFormCreate();
      }
      if (refs.inpNombre) refs.inpNombre.focus();
    },
    onClose: () => {
      setFormCreate();
    },
    onSave: async () => {
      const nombre = (refs.inpNombre?.value || "").trim();
      const active = !!refs.chkActive?.checked;

      if (!nombre) throw new Error("El nombre es obligatorio.");

      const payload = { nombre, active };

      if (editingId) {
        const { error } = await window.sb
          .from("master_categories")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await window.sb
          .from("master_categories")
          .insert([payload]);
        if (error) throw error;
      }

      await loadList();
      setFormCreate();
      if (panelCtrl?.close) panelCtrl.close();
    },
  });

  // 9. Hook "Nuevo" button
  if (refs.btnNew) {
    refs.btnNew.addEventListener("click", () => {
      editingId = null;
      setFormCreate();
      panelCtrl?.open?.();
    });
  }

  if (refs.searchInput) {
    refs.searchInput.addEventListener("input", () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => renderList(categories), 180);
    });
  }

  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentStatus = btn.dataset.status || "all";
      if (currentStatus === "all" && refs.searchInput)
        refs.searchInput.value = "";
      renderList(categories);
    });
  });

  // 10. Edit handlers (event delegation)
  if (refs.listContainer) {
    refs.listContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest('[data-action="create-category"]')) {
        refs.btnNew?.click();
        return;
      }
      if (target && target.classList.contains("btn-edit-cat")) {
        const id = target.getAttribute("data-id");
        const cat = categories.find((c) => c.id === id);
        if (!cat) return;
        editingId = id;
        setFormEdit();
        if (refs.inpNombre) refs.inpNombre.value = cat.nombre || "";
        if (refs.chkActive) refs.chkActive.checked = !!cat.active;
        if (panelCtrl?.open) panelCtrl.open();
      }
    });
  }

  if (refs.btnClearSearch) {
    refs.btnClearSearch.addEventListener("click", () => {
      if (refs.searchInput) refs.searchInput.value = "";
      currentStatus = "all";
      document
        .querySelectorAll(".filter-pill")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelector('.filter-pill[data-status="all"]')
        ?.classList.add("active");
      renderList(categories);
    });
  }
})();
