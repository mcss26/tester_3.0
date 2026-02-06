/**
 * Operativo Workday Module (Refactored)
 * Standard: logic-engineer (2026)
 * Description: Manages Passline Links, Staff Status, and Operative Requests
 */

(async function () {
  "use strict";

  // 1. Auth Guard
  const allowedRoles = (
    document.body.dataset.allowedRoles || "operativo,admin"
  ).split(",");
  const session = await window.Auth.guardOrRedirect(allowedRoles);
  if (!session) return;

  // 2. DOM References
  const ui = {
    moduleContent: document.getElementById("module-content"),
    loadingState: document.getElementById("page-card-loading"),
    workdayStatus: document.getElementById("workday-status"),

    // Panel A: Passline Links
    linksTableBody: document.getElementById("links-table-body"),
    btnNewLink: document.getElementById("btn-new-link"),
    linkModal: document.getElementById("link-modal"),
    linkModalTitle: document.getElementById("link-modal-title"),
    inputLinkName: document.getElementById("input-link-name"),
    inputLinkDescription: document.getElementById("input-link-description"),
    inputLinkUrl: document.getElementById("input-link-url"),
    btnSaveLink: document.getElementById("btn-save-link"),
    btnCancelLink: document.getElementById("btn-cancel-link"),

    // Panel B: Nómina
    staffContainer: document.getElementById("staff-container"),
    staffSummaryBadge: document.getElementById("staff-summary-badge"),

    // Panel C: Solicitudes
    requestsContainer: document.getElementById("requests-container"),

    // Templates
    loading:
      '<div class="state-block loading"><div class="state-loader"></div><p class="state-title">Cargando...</p></div>',
    emptyLinks:
      '<tr><td colspan="4" class="table-cell text-center text-white/30 p-4">No hay tipos de entrada configurados.</td></tr>',
    emptyStaff:
      '<div class="state-block"><p class="state-title">No hay personal convocado.</p></div>',
    emptyRequests:
      '<div class="state-block"><p class="state-title">No hay solicitudes pendientes.</p></div>',
  };

  const state = {
    openWorkDay: null,
    openWorkDayChecked: false,
    links: [],
    editingLinkId: null,
  };

  // Validation
  const blockingTarget =
    ui.moduleContent || ui.linksTableBody || ui.staffContainer;
  if (!window.Utils?.assertSbOrShowBlockingError?.(blockingTarget)) return;

  // 3. Initialization
  async function init() {
    window.Utils.setPageState(ui, { loading: true });

    try {
      await getOpenWorkDay();
      updateWorkdayStatusPill();
      bindEvents();

      // Load all panels in parallel
      await Promise.all([
        loadPasslineLinks(),
        loadStaffStatus(),
        loadRequests(),
      ]);
    } catch (err) {
      console.error("Init error:", err);
      window.Toast?.error("Error al inicializar Work Day.");
    } finally {
      window.Utils.setPageState(ui, { loading: false });
    }
  }

  // 4. Event Binding
  function bindEvents() {
    // New Link Button
    ui.btnNewLink?.addEventListener("click", () => openLinkModal());

    // Modal Actions
    ui.btnCancelLink?.addEventListener("click", closeLinkModal);
    ui.btnSaveLink?.addEventListener("click", saveLinkType);

    // Close modal on overlay click
    ui.linkModal?.addEventListener("click", (e) => {
      if (e.target === ui.linkModal) closeLinkModal();
    });

    // Table Event Delegation (Edit/Delete/Open Link)
    ui.linksTableBody?.addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".btn-edit-link");
      const deleteBtn = e.target.closest(".btn-delete-link");
      const linkCell = e.target.closest(".link-url");

      if (editBtn) {
        const linkId = editBtn.dataset.id;
        openLinkModal(linkId);
      } else if (deleteBtn) {
        const linkId = deleteBtn.dataset.id;
        const linkName = deleteBtn.dataset.name;
        const confirmed = await window.Utils.confirmAction(
          `¿Desactivar "${linkName}"?`,
          { confirmText: "Desactivar", isDanger: true }
        );
        if (confirmed) await deleteLinkType(linkId);
      } else if (linkCell) {
        const url = linkCell.dataset.url;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  }

  // 5. Work Day Helper
  async function getOpenWorkDay() {
    if (state.openWorkDayChecked) return state.openWorkDay;
    state.openWorkDayChecked = true;

    if (window.WorkDayHelper?.getOpenWorkDay) {
      state.openWorkDay = await window.WorkDayHelper.getOpenWorkDay();
      return state.openWorkDay;
    }

    const { data, error } = await window.sb
      .from("work_days")
      .select("id, work_date, status")
      .eq("status", "open")
      .maybeSingle();

    if (error) throw error;
    state.openWorkDay = data || null;
    return state.openWorkDay;
  }

  function updateWorkdayStatusPill() {
    if (!ui.workdayStatus) return;
    if (state.openWorkDay) {
      const formatted =
        window.WorkDayHelper?.formatDate?.(state.openWorkDay.work_date) ||
        state.openWorkDay.work_date;
      ui.workdayStatus.textContent = `Jornada: ${formatted}`;
      ui.workdayStatus.className = "system-status-pill status-open topbar-pill";
    } else {
      ui.workdayStatus.textContent = "Sin jornada activa";
      ui.workdayStatus.className =
        "system-status-pill status-closed topbar-pill topbar-pill-quiet";
    }
  }

  // 6. PANEL A: Passline Links CRUD
  async function loadPasslineLinks() {
    if (!ui.linksTableBody) return;
    ui.linksTableBody.innerHTML =
      '<tr><td colspan="4" class="table-cell text-center p-4">' +
      ui.loading +
      "</td></tr>";

    try {
      const { data, error } = await window.sb
        .from("site_config")
        .select("*")
        .like("key", "passline_%")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      state.links = data || [];
      renderLinksTable();
    } catch (err) {
      console.error("Error loading links:", err);
      ui.linksTableBody.innerHTML =
        '<tr><td colspan="4" class="table-cell text-center text-red-400 p-4">Error cargando links.</td></tr>';
      window.Toast?.error("Error al cargar links de Passline.");
    }
  }

  function renderLinksTable() {
    if (!ui.linksTableBody) return;

    if (state.links.length === 0) {
      ui.linksTableBody.innerHTML = ui.emptyLinks;
      return;
    }

    ui.linksTableBody.innerHTML = state.links
      .map((link) => {
        const safeName = window.Utils?.escapeHtml?.(link.name || "Sin nombre");
        const safeDescription = window.Utils?.escapeHtml?.(
          link.description || "--"
        );
        const safeUrl = window.Utils?.escapeHtml?.(link.url) || "";
        const displayUrl =
          safeUrl.length > 30 ? safeUrl.substring(0, 27) + "..." : safeUrl;

        return `
        <tr class="table-row">
          <td class="table-cell cell-pad">
            <span class="font-medium text-white">${safeName}</span>
          </td>
          <td class="table-cell cell-pad">
            <span class="text-white/60 text-xs">${safeDescription}</span>
          </td>
          <td class="table-cell cell-pad link-url" data-url="${safeUrl}" style="cursor: pointer;">
            <span class="text-accent hover:underline text-xs" title="${safeUrl}">${displayUrl}</span>
          </td>
          <td class="table-cell cell-pad text-right">
            <div class="flex gap-2 justify-end">
              <button class="btn-icon btn-xs btn-edit-link" data-id="${link.id}" title="Editar">
                ✏️
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  }

  function openLinkModal(linkId = null) {
    if (!ui.linkModal) return;

    state.editingLinkId = linkId;

    if (linkId) {
      // Edit mode
      const link = state.links.find((l) => l.id === linkId);
      if (!link) return;

      ui.linkModalTitle.textContent = "Editar Tipo de Entrada";
      ui.inputLinkName.value = link.name || "";
      ui.inputLinkDescription.value = link.description || "";
      ui.inputLinkUrl.value = link.url || "";
    } else {
      // Create mode
      ui.linkModalTitle.textContent = "Nuevo Tipo de Entrada";
      ui.inputLinkName.value = "";
      ui.inputLinkDescription.value = "";
      ui.inputLinkUrl.value = "";
    }

    ui.linkModal.classList.remove("hidden");
  }

  function closeLinkModal() {
    if (!ui.linkModal) return;
    ui.linkModal.classList.add("hidden");
    state.editingLinkId = null;
  }

  async function saveLinkType() {
    const name = ui.inputLinkName?.value?.trim();
    const description = ui.inputLinkDescription?.value?.trim();
    const url = ui.inputLinkUrl?.value?.trim();

    if (!name || !url) {
      window.Toast?.warning("Completa nombre y URL.");
      return;
    }

    try {
      const payload = {
        name,
        description: description || null,
        url,
        is_active: true,
      };

      if (state.editingLinkId) {
        // Update (don't change key)
        const { error } = await window.sb
          .from("site_config")
          .update(payload)
          .eq("id", state.editingLinkId);

        if (error) throw error;
        window.Toast?.success("Tipo de entrada actualizado.");
      } else {
        // Insert (generate key from name)
        const key =
          "passline_" +
          name
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");
        payload.key = key;
        payload.sort_order = (state.links.length + 1) * 10;

        const { error } = await window.sb.from("site_config").insert(payload);

        if (error) throw error;
        window.Toast?.success("Tipo de entrada creado.");
      }

      closeLinkModal();
      await loadPasslineLinks();
    } catch (err) {
      console.error("Error saving link:", err);
      window.Toast?.error(err.message || "Error al guardar.");
    }
  }

  async function deleteLinkType(linkId) {
    try {
      // Soft delete: set is_active = false
      const { error } = await window.sb
        .from("site_config")
        .update({ is_active: false })
        .eq("id", linkId);

      if (error) throw error;

      window.Toast?.success("Tipo de entrada desactivado.");
      await loadPasslineLinks();
    } catch (err) {
      console.error("Error deleting link:", err);
      window.Toast?.error(err.message || "Error al eliminar.");
    }
  }

  // 7. PANEL B: Nómina
  async function loadStaffStatus() {
    if (!ui.staffContainer) return;
    ui.staffContainer.innerHTML = ui.loading;

    try {
      const openDay = await getOpenWorkDay();
      if (!openDay?.id) {
        ui.staffContainer.innerHTML =
          '<div class="state-block"><p class="state-title">No hay jornada activa.</p></div>';
        if (ui.staffSummaryBadge) ui.staffSummaryBadge.textContent = "--/--";
        return;
      }

      const { data, error } = await window.sb
        .from("staff_convocations")
        .select(
          `
          id,
          status,
          role_id ( name ),
          user_id ( full_name )
        `
        )
        .eq("work_day_id", openDay.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        ui.staffContainer.innerHTML = ui.emptyStaff;
        if (ui.staffSummaryBadge) ui.staffSummaryBadge.textContent = "0/0";
        return;
      }

      // Process
      const total = data.length;
      const confirmed = data.filter((d) =>
        ["confirmed", "present", "accepted"].includes(d.status)
      ).length;

      // Update Badge
      if (ui.staffSummaryBadge) {
        ui.staffSummaryBadge.textContent = `${confirmed}/${total}`;
        ui.staffSummaryBadge.className =
          confirmed === total ? "badge badge-success" : "badge badge-warning";
      }

      // Render Table
      const sorted = data.sort((a, b) => {
        const priority = {
          present: 0,
          confirmed: 1,
          accepted: 2,
          pending: 3,
          rejected: 4,
        };
        return (priority[a.status] || 99) - (priority[b.status] || 99);
      });

      const rows = sorted
        .map((item) => {
          const isConfirmed = ["confirmed", "present", "accepted"].includes(
            item.status
          );
          const statusIcon = isConfirmed
            ? "✅"
            : item.status === "rejected"
              ? "❌"
              : "⏳";
          const statusColor = isConfirmed
            ? "text-green-400"
            : item.status === "rejected"
              ? "text-red-400"
              : "text-yellow-400";
          const safeName = window.Utils?.escapeHtml?.(
            item.user_id?.full_name || "Desconocido"
          );
          const safeRole = window.Utils?.escapeHtml?.(
            item.role_id?.name || "Staff"
          );

          return `
          <tr class="table-row">
            <td class="table-cell cell-pad">
              <span class="font-medium text-white">${safeName}</span>
            </td>
            <td class="table-cell cell-pad">
              <span class="text-white/70 text-xs">${safeRole}</span>
            </td>
            <td class="table-cell cell-pad text-right">
              <span class="${statusColor} font-bold text-xs uppercase">
                ${statusIcon} ${item.status}
              </span>
            </td>
          </tr>
        `;
        })
        .join("");

      ui.staffContainer.innerHTML = `
        <div class="table-scroll" style="max-height: 400px;">
          <table class="table table-compact">
            <thead>
              <tr>
                <th class="table-cell is-header">Personal</th>
                <th class="table-cell is-header">Rol</th>
                <th class="table-cell is-header text-right">Estado</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      console.error("Error loading staff:", err);
      ui.staffContainer.innerHTML =
        '<div class="state-block error"><p class="state-title text-red-400">Error cargando nómina.</p></div>';
      window.Toast?.error("Error al cargar estado de nómina.");
    }
  }

  // 8. PANEL C: Solicitudes
  async function loadRequests() {
    if (!ui.requestsContainer) return;
    ui.requestsContainer.innerHTML = ui.loading;

    try {
      const openDay = await getOpenWorkDay();
      const workDate =
        openDay?.work_date || new Date().toISOString().split("T")[0];

      // Get latest request for user
      const { data: requests, error: requestError } = await window.sb
        .from("replenishment_requests")
        .select("id")
        .eq("operational_date", workDate)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (requestError) throw requestError;

      if (!requests || requests.length === 0) {
        ui.requestsContainer.innerHTML = ui.emptyRequests;
        return;
      }

      const requestId = requests[0].id;

      // Get items
      const { data: items, error: itemsError } = await window.sb
        .from("replenishment_items")
        .select(
          `
          id,
          requested_packs,
          quantity_requested,
          status,
          pre_approval_status,
          master_sku ( nombre, pack_qty )
        `
        )
        .eq("request_id", requestId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        ui.requestsContainer.innerHTML = ui.emptyRequests;
        return;
      }

      // Render table
      const rows = items
        .map((item) => {
          const name = window.Utils?.escapeHtml?.(
            item.master_sku?.nombre || "Sin nombre"
          );
          const packQty =
            window.Utils?.numberOrNull?.(item.master_sku?.pack_qty) || 1;
          const requestedPacks = window.Utils?.numberOrNull?.(
            item.requested_packs
          );
          const quantityRequested = window.Utils?.numberOrNull?.(
            item.quantity_requested
          );
          const packs =
            requestedPacks != null
              ? requestedPacks
              : quantityRequested != null
                ? Math.ceil(quantityRequested / packQty)
                : 0;

          // Pre-approval badge
          const preStatus = item.pre_approval_status || "pending";
          const preIcon =
            preStatus === "approved"
              ? "✅"
              : preStatus === "rejected"
                ? "❌"
                : "⏳";
          const preColor =
            preStatus === "approved"
              ? "text-green-400"
              : preStatus === "rejected"
                ? "text-red-400"
                : "text-yellow-400";

          // Final status badge
          const finalStatus = item.status || "pending";
          const finalColor =
            finalStatus === "approved"
              ? "text-green-400"
              : finalStatus === "rejected"
                ? "text-red-400"
                : "text-white/50";

          return `
          <tr class="table-row hover:bg-white/5 transition-colors cursor-pointer"
              data-go="pages/operativo/operativo-solicitudes.html">
            <td class="table-cell cell-pad">
              <span class="font-medium text-white">${name}</span>
            </td>
            <td class="table-cell cell-pad text-center">
              <span class="font-mono text-white/70">${packs}</span>
            </td>
            <td class="table-cell cell-pad text-center">
              <span class="${preColor} text-xs font-bold uppercase">
                ${preIcon} ${preStatus}
              </span>
            </td>
            <td class="table-cell cell-pad text-center">
              <span class="${finalColor} text-xs uppercase">
                ${finalStatus}
              </span>
            </td>
          </tr>
        `;
        })
        .join("");

      ui.requestsContainer.innerHTML = `
        <div class="table-scroll" style="max-height: 400px;">
          <table class="table table-compact">
            <thead>
              <tr>
                <th class="table-cell is-header">Item</th>
                <th class="table-cell is-header text-center">Packs</th>
                <th class="table-cell is-header text-center">Pre-Aprob.</th>
                <th class="table-cell is-header text-center">Estado</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      console.error("Error loading requests:", err);
      ui.requestsContainer.innerHTML =
        '<div class="state-block error"><p class="state-title text-red-400">Error cargando solicitudes.</p></div>';
      window.Toast?.error("Error al cargar solicitudes.");
    }
  }

  // 9. Start
  init();
})();
