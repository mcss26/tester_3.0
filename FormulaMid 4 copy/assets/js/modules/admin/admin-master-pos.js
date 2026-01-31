// Module: admin-master-pos.js
// Logic for POS Master Page
// initSlidePanel is global from panel.js

(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  // 2. DOM References (Grouped)
  const ui = {
    listContainer: document.getElementById("list-container"),
    moduleContent: document.getElementById("module-content"),
    inpSearch: document.getElementById("pos-search"),
    inpName: document.getElementById("pos-name"),
    inpProvider: document.getElementById("pos-provider"),
    inpExternalId: document.getElementById("pos-external-id"),
    chkActive: document.getElementById("pos-active"),
    panelTitle: document.getElementById("panel-title"),
    btnSave: document.getElementById("btn-save"),
    btnNew: document.getElementById("btn-new"),
    pageCardLoading: document.getElementById("page-card-loading"),
    pageCardEmpty: document.getElementById("page-card-empty"),
    // Filter Pills
    filterPills: document.querySelectorAll(".filter-pill[data-status]"),
    countTotal: document.getElementById("pos-total"),
    countActive: document.getElementById("pos-active-count"),
    countInactive: document.getElementById("pos-inactive-count"),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.listContainer)) return;

  // 3. State
  let terminals = [];
  let editingId = null;
  let currentFilter = "all"; // all, active, inactive
  let searchTerm = "";
  let firstLoad = true;

  // 4. Form State Helpers
  const setFormCreate = () => {
    editingId = null;
    if (ui.panelTitle) ui.panelTitle.textContent = "Nueva Terminal";
    if (ui.btnSave) ui.btnSave.textContent = "Guardar";
    if (ui.inpExternalId) ui.inpExternalId.disabled = false;
    if (ui.inpProvider) ui.inpProvider.value = "MERCADO PAGO";
    ui.inpName.value = "";
    ui.inpExternalId.value = "";
    ui.chkActive.checked = true;
  };

  const setFormEdit = (item) => {
    editingId = item.id;
    if (ui.panelTitle) ui.panelTitle.textContent = "Editar Terminal";
    if (ui.btnSave) ui.btnSave.textContent = "Actualizar";
    if (ui.inpExternalId) ui.inpExternalId.disabled = false;

    ui.inpName.value = item.friendly_name || "";
    ui.inpProvider.value = item.provider || "MERCADO PAGO";
    ui.inpExternalId.value = item.external_id || "";
    ui.chkActive.checked = !!item.is_active;
  };

  // 5. Filter Logic
  function getFilteredData() {
    let filtered = terminals;

    // Status Filter
    if (currentFilter === "active") {
      filtered = filtered.filter((t) => t.is_active);
    } else if (currentFilter === "inactive") {
      filtered = filtered.filter((t) => !t.is_active);
    }

    // Search Filter
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      filtered = filtered.filter((t) => {
        const name = (t.friendly_name || "").toLowerCase();
        const prov = (t.provider || "").toLowerCase();
        const ext = (t.external_id || "").toLowerCase();
        return name.includes(term) || prov.includes(term) || ext.includes(term);
      });
    }

    return filtered;
  }

  function updateSummary() {
    const total = terminals.length;
    const active = terminals.filter((t) => t.is_active).length;
    const inactive = terminals.filter((t) => !t.is_active).length;

    if (ui.countTotal) ui.countTotal.textContent = total;
    if (ui.countActive) ui.countActive.textContent = active;
    if (ui.countInactive) ui.countInactive.textContent = inactive;
  }

  // 6. Render Function
  function renderList() {
    if (!ui.listContainer) return;

    const filtered = getFilteredData();

    if (filtered.length === 0) {
      ui.listContainer.innerHTML = "";
      window.Utils.setPageState(ui, { empty: true });
      return;
    }
    window.Utils.setPageState(ui, { loading: false }); // Ensure content is shown

    const rows = filtered
      .map((item) => {
        const statusClass = item.is_active ? "status-success" : "status-error";
        const statusText = item.is_active ? "Activo" : "Inactivo";
        const date = item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "-";

        return `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong">${item.friendly_name || "-"}</td>
                    <td class="table-cell cell-pad">${item.provider || "-"}</td>
                    <td class="table-cell cell-pad font-mono text-xs">${item.external_id || "-"}</td>
                    <td class="table-cell cell-pad"><span class="status-pill ${statusClass}">${statusText}</span></td>
                    <td class="table-cell cell-pad faint">${date}</td>
                    <td class="table-cell cell-pad">
                        <button class="footer-link btn-edit btn-ghost btn-sm" data-id="${item.id}">Editar</button>
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
                            <th class="table-cell is-header cell-pad">Proveedor</th>
                            <th class="table-cell is-header cell-pad">External ID</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">Creado</th>
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

  // 7. Fetch Data
  async function loadList() {
    if (firstLoad) {
      window.Utils.setPageState(ui, { loading: true });
      firstLoad = false;
    }

    try {
      const { data, error } = await window.sb
        .from("pos_terminals")
        .select(
          "id, friendly_name, provider, external_id, is_active, created_at",
        )
        .order("friendly_name");

      if (error) throw error;
      terminals = data || [];
      updateSummary();
      renderList();
    } catch (err) {
      console.error("Error loading terminals:", err);
      ui.listContainer.innerHTML = `<div class="empty-state accent">Error: ${err.message}</div>`;
      window.Utils.setPageState(ui, { loading: false });
    } finally {
      // Optional: check if empty here if needed, but renderList handles it
      if (terminals.length > 0)
        window.Utils.setPageState(ui, { loading: false });
    }
  }

  // 8. Panel Logic
  const panelCtrl = initSlidePanel({
    onOpen: () => {
      if (!editingId) {
        setFormCreate();
      }
      if (ui.inpName) ui.inpName.focus();
    },
    onClose: () => {
      setFormCreate();
    },
  });

  // 9. CRUD Actions logic
  async function handleSave() {
    const friendly_name = (ui.inpName?.value || "").trim();
    const provider = (ui.inpProvider?.value || "").trim();
    const external_id = (ui.inpExternalId?.value || "").trim();
    const is_active = !!ui.chkActive?.checked;

    if (!friendly_name || !provider || !external_id) {
      window.Toast.error("Todos los campos con * son obligatorios.");
      return;
    }

    const originalBtnText = ui.btnSave.textContent;
    ui.btnSave.textContent = "Guardando...";
    ui.btnSave.disabled = true;

    try {
      const payload = { friendly_name, provider, external_id, is_active };

      if (editingId) {
        const { error } = await window.sb
          .from("pos_terminals")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await window.sb
          .from("pos_terminals")
          .insert([payload]);
        if (error) throw error;
      }

      await loadList();
      window.Toast.success(
        editingId ? "Terminal actualizada" : "Terminal creada",
      );
      panelCtrl.close();
    } catch (err) {
      console.error("Error saving terminal:", err);
      window.Toast.error(err.message || "Error al guardar terminal");
    } finally {
      if (ui.btnSave) {
        ui.btnSave.textContent = originalBtnText;
        ui.btnSave.disabled = false;
      }
    }
  }

  // 10. Bind Events
  function bindEvents() {
    // Toggle Panel (New)
    if (ui.btnNew) {
      ui.btnNew.addEventListener("click", () => {
        editingId = null;
        setFormCreate();
        panelCtrl.open();
      });
    }

    // Save Button
    if (ui.btnSave) {
      ui.btnSave.addEventListener("click", handleSave);
    }

    // Search Input (Debounced)
    if (ui.inpSearch) {
      ui.inpSearch.addEventListener(
        "input",
        window.Utils.debounce((e) => {
          searchTerm = e.target.value;
          renderList();
        }, 300),
      );
    }

    // Edit Delegation
    if (ui.listContainer) {
      ui.listContainer.addEventListener("click", (e) => {
        const target = e.target.closest(".btn-edit");
        if (target) {
          const id = target.getAttribute("data-id");
          const term = terminals.find((t) => String(t.id) === String(id));
          if (term) {
            setFormEdit(term);
            panelCtrl.open();
          }
        }
      });
    }

    // Filter Pills
    ui.filterPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        ui.filterPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        currentFilter = pill.dataset.status;
        renderList();
      });
    });
  }

  // Init Logic
  bindEvents();
  loadList();
})();
