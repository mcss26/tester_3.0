/**
 * Admin Master Tarifario Module
 * Gestion de Cargos y Tarifas Base
 * Pattern: Async IIFE (Refactored from Legacy Object)
 */

(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  // 2. DOM Elements (Grouped)
  const ui = {
    listContainer: document.getElementById("list-container"),
    moduleContent: document.getElementById("module-content"),
    inpSearch: document.getElementById("roles-search"),
    btnAdd: document.getElementById("btn-new"),

    // Panel Elements
    panelTitle: document.getElementById("panel-title"),
    btnSave: document.getElementById("btn-save"),
    btnDelete: document.getElementById("btn-delete-role"),
    inputName: document.getElementById("input-name"),
    inputArea: document.getElementById("input-area"),
    inputRate: document.getElementById("input-rate"),

    // Global States
    pageCardLoading: document.getElementById("page-card-loading"),
    pageCardEmpty: document.getElementById("page-card-empty"),

    // Filters
    filterPills: document.querySelectorAll(".filter-pill[data-area]"),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.listContainer)) return;

  // 3. State
  let state = {
    activeRole: null,
    roles: [],
    currentFilter: "all", // all, Barra, Caja, etc.
    searchTerm: "",
    firstLoad: true,
  };

  // 4. Form State Helpers
  const setFormCreate = () => {
    state.activeRole = null;
    if (ui.panelTitle) ui.panelTitle.textContent = "Nuevo Cargo";
    if (ui.btnSave) ui.btnSave.textContent = "Guardar";
    if (ui.inputName) ui.inputName.value = "";
    if (ui.inputArea) ui.inputArea.value = "Barra";
    if (ui.inputRate) ui.inputRate.value = "";
    if (ui.btnDelete) ui.btnDelete.classList.add("hidden");
  };

  const setFormEdit = (role) => {
    state.activeRole = role;
    if (ui.panelTitle) ui.panelTitle.textContent = "Editar Cargo";
    if (ui.btnSave) ui.btnSave.textContent = "Actualizar";
    if (ui.inputName) ui.inputName.value = role.name || "";
    if (ui.inputArea) ui.inputArea.value = role.area || "Barra";
    if (ui.inputRate) ui.inputRate.value = role.base_rate || 0;
    if (ui.btnDelete) ui.btnDelete.classList.remove("hidden");
  };

  // 5. Filter Logic
  function getFilteredData() {
    let filtered = state.roles;

    // Area Filter
    if (state.currentFilter !== "all") {
      filtered = filtered.filter((r) => r.area === state.currentFilter);
    }

    // Search Filter
    const term = state.searchTerm.toLowerCase().trim();
    if (term) {
      filtered = filtered.filter((r) => {
        const name = (r.name || "").toLowerCase();
        const area = (r.area || "").toLowerCase();
        return name.includes(term) || area.includes(term);
      });
    }
    return filtered;
  }

  // 6. Render
  function renderRoles() {
    if (!ui.listContainer) return;

    const filtered = getFilteredData();

    if (filtered.length === 0) {
      ui.listContainer.innerHTML = "";
      window.Utils.setPageState(ui, { empty: true });
      return;
    }
    window.Utils.setPageState(ui, { loading: false }); // Show content

    const rows = filtered
      .map((role) => {
        return `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong font-medium">${role.name || "-"}</td>
                    <td class="table-cell cell-pad muted">${role.area || "-"}</td>
                    <td class="table-cell cell-pad accent nowrap font-medium">$${parseInt(role.base_rate || 0).toLocaleString()}</td>
                    <td class="table-cell cell-pad">
                        <button class="footer-link btn-edit btn-ghost btn-sm" data-id="${role.id}" title="Editar">Editar</button>
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
                            <th class="table-cell is-header cell-pad">Cargo</th>
                            <th class="table-cell is-header cell-pad">Área</th>
                            <th class="table-cell is-header cell-pad">Tarifa Base ($)</th>
                            <th class="table-cell is-header cell-pad">Acciones</th>
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

  // 7. Load Data
  async function loadRoles() {
    if (state.firstLoad) {
      window.Utils.setPageState(ui, { loading: true });
      state.firstLoad = false;
    }

    try {
      const { data, error } = await window.sb
        .from("master_staff_roles")
        .select("*")
        .order("name"); // Or order by area then name

      if (error) throw error;
      state.roles = data || [];
      renderRoles();
    } catch (err) {
      console.error("Error loading roles:", err);
      ui.listContainer.innerHTML = `<div class="empty-state accent">Error: ${err.message}</div>`;
      window.Utils.setPageState(ui, { loading: false });
    } finally {
      if (state.roles.length > 0)
        window.Utils.setPageState(ui, { loading: false });
    }
  }

  // 8. CRUD Actions
  async function saveRole() {
    const name = ui.inputName.value.trim();
    const area = ui.inputArea.value;
    const rate = parseFloat(ui.inputRate.value) || 0;

    if (!name || !area) {
      window.Toast?.error("Nombre y Área son obligatorios");
      return;
    }

    const roleData = {
      name,
      area,
      base_rate: rate,
      active: true,
    };

    const originalBtnText = ui.btnSave.textContent;
    ui.btnSave.textContent = "Guardando...";
    ui.btnSave.disabled = true;

    try {
      let error;
      if (state.activeRole) {
        // Update
        const { error: err } = await window.sb
          .from("master_staff_roles")
          .update(roleData)
          .eq("id", state.activeRole.id);
        error = err;
      } else {
        // Insert
        const { error: err } = await window.sb
          .from("master_staff_roles")
          .insert(roleData);
        error = err;
      }

      if (error) throw error;

      window.Toast?.success("Guardado correctamente");
      panelCtrl.close();
      await loadRoles();
    } catch (err) {
      console.error("Error saving role:", err);
      window.Toast?.error("Error al guardar: " + err.message);
    } finally {
      if (ui.btnSave) {
        ui.btnSave.textContent = originalBtnText;
        ui.btnSave.disabled = false;
      }
    }
  }

  async function deleteRole(id) {
    const confirmed = await window.Utils.confirmModal("¿Estás seguro de eliminar este cargo?");
    if (!confirmed) return;

    try {
      const { error } = await window.sb
        .from("master_staff_roles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      window.Toast?.success("Cargo eliminado");
      panelCtrl.close();
      await loadRoles();
    } catch (err) {
      console.error(err);
      window.Toast?.error("Error al eliminar: " + err.message);
    }
  }

  // 9. Init Panel
  const panelCtrl = initSlidePanel({
    onOpen: () => {
      if (!state.activeRole) {
        setFormCreate();
      }
      if (ui.inputName) ui.inputName.focus();
    },
    onClose: () => {
      setFormCreate();
    },
    // We will bind save manually to handle custom logic easily or use default?
    // Standard pattern: manual binding if we have complex validation or custom buttons
  });

  // 10. Bind Events
  if (ui.btnAdd) {
    ui.btnAdd.addEventListener("click", () => {
      state.activeRole = null;
      setFormCreate();
      panelCtrl.open();
    });
  }

  // Manual Save Bind for full control
  if (ui.btnSave) {
    ui.btnSave.addEventListener("click", saveRole);
  }

  if (ui.btnDelete) {
    ui.btnDelete.addEventListener("click", () => {
      if (state.activeRole) deleteRole(state.activeRole.id);
    });
  }

  // Search
  if (ui.inpSearch) {
    ui.inpSearch.addEventListener(
      "input",
      window.Utils.debounce((e) => {
        state.searchTerm = e.target.value;
        renderRoles();
      }, 300),
    );
  }

  // Filter Pills
  ui.filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      ui.filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.currentFilter = pill.dataset.area;
      renderRoles();
    });
  });

  // Edit Delegation
  if (ui.listContainer) {
    ui.listContainer.addEventListener("click", (e) => {
      const target = e.target.closest(".btn-edit");
      if (target) {
        const id = target.getAttribute("data-id");
        const role = state.roles.find((r) => String(r.id) === String(id));
        if (role) {
          setFormEdit(role);
          panelCtrl.open();
        }
      }
    });
  }

  document
    .getElementById("btn-logout")
    ?.addEventListener("click", () => window.Auth.signOutAndGoLogin());

  // Start
  loadRoles();
})();
