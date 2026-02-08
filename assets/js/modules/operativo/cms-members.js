// cms-members.js
// Lógica para el módulo de Altas de Members y Cumpleaños

(async function () {
  "use strict";

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Guard de Autenticación
  // ─────────────────────────────────────────────────────────────────────────
  if (!window.Auth) {
    console.error("[cms-members] Auth module not loaded.");
    return;
  }

  const session = await window.Auth.guardOrRedirect([
    "operativo",
    "staff_barra",
    "staff_operativo",
    "admin",
    "contable",
  ]);
  if (!session) return;

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Verificar Supabase
  // ─────────────────────────────────────────────────────────────────────────
  if (!window.Utils?.assertSbOrShowBlockingError?.()) {
    console.error("[cms-members] Supabase client not initialized.");
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Referencias DOM
  // ─────────────────────────────────────────────────────────────────────────
  const refs = {
    moduleContent: document.getElementById("module-content"),
    pageCardLoading: document.getElementById("page-card-loading"),
    pageCardEmpty: document.getElementById("page-card-empty"),
    statusPill: document.getElementById("cms-status-pill"),
    requestsList: document.getElementById("requestsList"),
    birthdayList: document.getElementById("birthdayList"),
    searchInput: document.getElementById("searchInput"),
    btnRefresh: document.getElementById("btnRefresh"),
    btnBulk: document.getElementById("btnBulk"),
    instaFrom: document.getElementById("instaFrom"),
    instaTo: document.getElementById("instaTo"),
    countTotal: document.getElementById("count-total"),
    countTotalPill: document.getElementById("count-total-pill"),
    countPendiente: document.getElementById("count-pendiente"),
    countPendienteMetric: document.getElementById("count-pendiente-metric"),
    countActivo: document.getElementById("count-activo"),
    countActivoPill: document.getElementById("count-activo-pill"),
    countRechazado: document.getElementById("count-rechazado"),
    countBanned: document.getElementById("count-banned"),

    countCumple: document.getElementById("count-cumple"),
    birthdayToday: document.getElementById("birthday-today"),
    tabs: document.querySelectorAll(".tab-chip[data-view]"),
    filterPills: document.querySelectorAll(".pill[data-status]"),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Estado Local
  // ─────────────────────────────────────────────────────────────────────────
  const state = {
    members: [],
    currentFilter: "pendiente",
    currentView: "solicitudes",
    isLoading: false,
    birthdayCount: 0,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Helpers de UI
  // ─────────────────────────────────────────────────────────────────────────
  function setLoading(isLoading) {
    state.isLoading = isLoading;
    if (!refs.pageCardLoading || !refs.moduleContent) return;

    if (isLoading) {
      refs.pageCardLoading.classList.add("is-visible");
      refs.moduleContent.classList.add("hidden");
      refs.pageCardEmpty?.classList.remove("is-visible");
    } else {
      refs.pageCardLoading.classList.remove("is-visible");
      if (!refs.pageCardEmpty?.classList.contains("is-visible")) {
        refs.moduleContent.classList.remove("hidden");
      }
    }
  }

  function setEmpty(isEmpty) {
    if (!refs.pageCardEmpty || !refs.moduleContent) return;

    if (isEmpty) {
      refs.pageCardEmpty.classList.add("is-visible");
      refs.moduleContent.classList.add("hidden");
    } else {
      refs.pageCardEmpty.classList.remove("is-visible");
      refs.moduleContent.classList.remove("hidden");
    }
  }

  function escapeHTML(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, (m) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return map[m];
    });
  }

  function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function generateMemberId() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `MC-${num}`;
  }

  function hasCredsIssue(member, statusOverride) {
    const status = (statusOverride ?? member.status ?? "")
      .toString()
      .toLowerCase();
    if (status !== "activo") return false;
    const mid = member.member_id;
    if (!mid || mid === "null" || mid.length < 2) return true;
    // Ya no verificamos access_password porque ya no existe en DB
    return false;
  }

  function setText(ref, value) {
    if (ref) ref.textContent = String(value ?? 0);
  }

  function updateCounts() {
    const counts = {
      total: state.members.length,
      pendiente: 0,
      activo: 0,
      rechazado: 0,
      banned: 0,
    };

    state.members.forEach((m) => {
      const status = m._status || "";
      if (counts[status] !== undefined) counts[status] += 1;
    });

    setText(refs.countTotal, counts.total);
    setText(refs.countTotalPill, counts.total);
    setText(refs.countPendiente, counts.pendiente);
    setText(refs.countPendienteMetric, counts.pendiente);
    setText(refs.countActivo, counts.activo);
    setText(refs.countActivoPill, counts.activo);
    setText(refs.countRechazado, counts.rechazado);
    setText(refs.countBanned, counts.banned);
  }

  function updateStatusPill() {
    if (!refs.statusPill) return;
    if (state.currentView === "cumple") {
      refs.statusPill.textContent = `CUMPLEAÑOS ${state.birthdayCount || 0}`;
    } else {
      refs.statusPill.textContent = `SOLICITUDES ${state.members.length || 0}`;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Carga de Datos
  // ─────────────────────────────────────────────────────────────────────────
  async function loadMembers() {
    setLoading(true);

    try {
      let allData = [];
      let from = 0;
      const PAGE_SIZE = 1000;
      let fetching = true;

      while (fetching) {
        const { data, error } = await window.sb
          .from("members")
          .select(
            "id, created_at, nombre, nacimiento, instagram, telefono, email, status, member_id",
          )
          .order("created_at", { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allData = allData.concat(data);
          from += PAGE_SIZE;
          if (data.length < PAGE_SIZE) fetching = false;
        } else {
          fetching = false;
        }
      }

      state.members = allData.map((m) => {
        let status = (m.status || "pendiente").toString().toLowerCase();
        if (status === "active") status = "activo"; // Normalize English status
        const search = [m.nombre, m.instagram, m.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const credsIssue = hasCredsIssue(m, status);
        return {
          ...m,
          _status: status,
          _search: search,
          _credsIssue: credsIssue,
        };
      });

      updateCounts();
      updateStatusPill();

      if (state.members.length === 0) {
        setEmpty(true);
      } else {
        setEmpty(false);
        if (state.currentView === "cumple") {
          renderBirthdays();
        } else {
          renderList();
        }
      }
    } catch (err) {
      console.error("Error cargando members:", err);
      window.Toast.error("Error al cargar datos: " + err.message);
      if (refs.requestsList) {
        refs.requestsList.innerHTML =
          '<div class="empty-state danger">Error al cargar datos.</div>';
      }
      setEmpty(false);
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Renderizado
  // ─────────────────────────────────────────────────────────────────────────
  function renderList() {
    if (!refs.requestsList || state.currentView !== "solicitudes") return;

    const searchTerm = (refs.searchInput?.value || "").toLowerCase().trim();

    const filtered = state.members.filter((m) => {
      const status = m._status || "";

      let matchStatus = false;
      if (state.currentFilter === "all") matchStatus = true;
      else matchStatus = status === state.currentFilter;

      if (!matchStatus) return false;

      if (searchTerm) {
        return (m._search || "").includes(searchTerm);
      }

      return true;
    });

    if (filtered.length === 0) {
      refs.requestsList.innerHTML =
        '<div class="empty-state">No hay solicitudes en esta vista.</div>';
      return;
    }

    refs.requestsList.innerHTML = filtered
      .map((m, i) => renderMemberCard(m, i))
      .join("");
  }

  function renderMemberCard(m, index) {
    const status = (m._status || "pendiente").toLowerCase();

    let statusClass = "status-warning";
    if (status === "activo") statusClass = "status-success";
    if (status === "rechazado") statusClass = "status-error";
    if (status === "banned") statusClass = "status-error";

    const igHandle = (m.instagram || "").replace("@", "").trim();
    const igLink = igHandle
      ? `<a href="https://instagram.com/${encodeURIComponent(igHandle)}" target="_blank" class="accent">${escapeHTML("@" + igHandle)}</a>`
      : `<span class="faint">Sin IG</span>`;

    const credsIssue = m._credsIssue;

    let actionsHtml = "";

    if (status !== "activo") {
      actionsHtml += `<button class="btn-ghost btn-sm" data-action="approve" data-id="${m.id}">APROBAR</button>`;
    }

    if (status !== "rechazado") {
      actionsHtml += `<button class="btn-danger btn-sm" data-action="reject" data-id="${m.id}">RECHAZAR</button>`;
    }

    if (status === "activo") {
      actionsHtml += `<button class="btn-ghost btn-sm" data-action="resend" data-id="${m.id}">RESEND</button>`;
    }

    return `
        <div class="staff-row" data-instagram="${escapeHTML(igHandle)}" data-member-id="${m.id}">
            <div class="staff-info">
                <div class="row-flex gap-8 align-center">
                    <span class="faint">#${index + 1}</span>
                    <span class="staff-name">${escapeHTML(m.nombre || "Sin Nombre")}</span>
                    <span class="status-pill ${statusClass}">${status.toUpperCase()}</span>
                    ${credsIssue ? '<span class="status-pill status-error">ERR CREDS</span>' : ""}
                </div>
                
                <div class="row-flex gap-16 mt-4 text-sm">
                    <span>${igLink}</span>
                    <span class="muted">${escapeHTML(m.email || "")}</span>
                    ${m.member_id ? `<span class="accent">${escapeHTML(m.member_id)}</span>` : ""}
                    <span class="faint">Alta: ${formatDate(m.created_at)}</span>
                </div>
            </div>

            <div class="staff-actions">
                ${actionsHtml}
            </div>
        </div>
        `;
  }

  function renderBirthdays() {
    if (!refs.birthdayList) return;

    const today = new Date();
    const tDay = today.getDate();
    const tMonth = today.getMonth() + 1;

    const birthdayMembers = state.members.filter((m) => {
      if (!m.nacimiento || m._status !== "activo") return false;

      const parts = m.nacimiento.split("/");
      if (parts.length < 2) return false;

      const mDay = parseInt(parts[0], 10);
      const mMonth = parseInt(parts[1], 10);

      return mDay === tDay && mMonth === tMonth;
    });

    state.birthdayCount = birthdayMembers.length;
    const todayLabel = `${String(tDay).padStart(2, "0")}/${String(tMonth).padStart(2, "0")}`;
    setText(refs.birthdayToday, todayLabel);
    setText(refs.countCumple, birthdayMembers.length);
    updateStatusPill();

    if (birthdayMembers.length === 0) {
      refs.birthdayList.innerHTML = `<div class="empty-state">
                <p>No hay cumpleaños hoy (${todayLabel})</p>
                <p class="faint">Activos: ${state.members.filter((m) => m._status === "activo").length}</p>
            </div>`;
      return;
    }

    refs.birthdayList.innerHTML = birthdayMembers
      .map((m) => renderBirthdayCard(m))
      .join("");
  }

  function renderBirthdayCard(m) {
    const igHandle = (m.instagram || "").replace("@", "").trim();
    const igLink = igHandle
      ? `<a href="https://instagram.com/${encodeURIComponent(igHandle)}" target="_blank" class="accent">@${escapeHTML(igHandle)}</a>`
      : `<span class="faint">Sin IG</span>`;

    return `
        <div class="staff-row" data-member-id="${m.id}">
            <div class="staff-info">
                <div class="row-flex gap-8 align-center">
                    <span class="staff-name">${escapeHTML(m.nombre)}</span>
                    <span class="status-pill status-success">CUMPLEAÑOS HOY</span>
                </div>
                
                <div class="row-flex gap-16 mt-4 text-sm">
                     <span>${igLink}</span>
                     <span class="muted">${escapeHTML(m.email || "")}</span>
                     <span class="faint">Nac: ${escapeHTML(m.nacimiento)}</span>
                </div>
            </div>

            <div class="staff-actions">
                <button class="btn-primary btn-sm" data-action="greet" data-id="${m.id}">
                    🎁 FELICITAR
                </button>
            </div>
        </div>
        `;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Acciones
  // ─────────────────────────────────────────────────────────────────────────
  async function processAction(action, memberId) {
    const member = state.members.find((m) => m.id === memberId);
    if (!member) return;

    let confirmMsg = "";
    if (action === "approve")
      confirmMsg = `¿Aprobar a ${member.nombre} y enviar credenciales?`;
    if (action === "reject")
      confirmMsg = `¿Rechazar solicitud de ${member.nombre}?`;
    if (action === "resend")
      confirmMsg = `¿Regenerar credenciales y reenviar mail a ${member.nombre}?`;

    const confirmed = await window.Utils.confirmModal(confirmMsg);
    if (!confirmed) return;

    const authFnUrl = `${window.APP_CONFIG.SUPABASE_URL}/functions/v1/auth-member`;

    // APPROVE / RESEND: Usar Edge Function (genera password, hashea, envía email)
    if (action === "approve" || action === "resend") {
      try {
        // Asegurar que el miembro tenga member_id
        let finalMemberId = member.member_id;
        if (!finalMemberId || finalMemberId.length < 3) {
          finalMemberId = generateMemberId();
        }

        // Actualizar member_id en DB
        await window.sb
          .from("members")
          .update({ member_id: finalMemberId })
          .eq("id", memberId);

        const actionLabel = action === "resend" ? "Reenviando credenciales..." : "Procesando aprobación...";
        window.Toast.info(actionLabel);

        // Llamar Edge Function
        const resp = await fetch(authFnUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": window.APP_CONFIG.SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${window.APP_CONFIG.SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: "approve",
            member_id: finalMemberId
          })
        });

        const result = await resp.json();

        if (!resp.ok || !result.success) {
          throw new Error(result.error || "Error al procesar miembro");
        }

        // Mostrar credenciales como fallback (por si el email falla)
        if (result.credentials) {
          const title = action === "resend" ? "Credenciales Regeneradas" : "Credenciales Generadas";
          const msg = `✅ MIEMBRO ${action === "resend" ? "ACTUALIZADO" : "APROBADO"}\n\nID: ${result.credentials.member_id}\nPASS: ${result.credentials.password}\n\nURL: midnightclub.com.ar\n\n${result.warning ? '⚠️ ' + result.warning : 'Email enviado correctamente'}\n\n(Copia estos datos por seguridad)`;
          await window.Utils.alertModal(msg, title);
        }

        if (result.warning) {
          window.Toast.warning(result.warning);
        } else {
          const successMsg = action === "resend" ? "Credenciales regeneradas y email enviado" : "Miembro aprobado y email enviado";
          window.Toast.success(successMsg);
        }

        await loadMembers();
        return;
      } catch (err) {
        console.error(`Error en ${action}:`, err);
        window.Toast.error("Error: " + err.message);
        return;
      }
    }

    // REJECT: Solo actualizar status en DB
    if (action === "reject") {
      try {
        const { error } = await window.sb
          .from("members")
          .update({ status: "rechazado" })
          .eq("id", memberId);

        if (error) throw error;

        window.Toast.success("Solicitud rechazada");
        await loadMembers();
        return;
      } catch (err) {
        console.error("Error al rechazar:", err);
        window.Toast.error("Error: " + err.message);
        return;
      }
    }
  }

  async function sendBirthdayGreeting(memberId) {
    const member = state.members.find((m) => m.id === memberId);
    if (!member) return;

    const confirmed = await window.Utils.confirmModal(`¿Enviar saludo de cumpleaños a ${member.nombre} (${member.email})?`);
    if (!confirmed) return;

    if (!window.APP_CONFIG?.EMAILJS?.TEMPLATE_CUMPLE) {
      window.Toast.error("Configuración de EmailJS faltante");
      return;
    }

    const params = {
      to_name: member.nombre,
      to_email: member.email,
      message: "¡Que tengas un excelente día!",
    };

    try {
      await emailjs.send(
        window.APP_CONFIG.EMAILJS.SERVICE_ID,
        window.APP_CONFIG.EMAILJS.TEMPLATE_CUMPLE,
        params,
      );

      window.Toast.success("¡Email enviado correctamente!");
    } catch (err) {
      console.error("Error enviando cumple:", err);
      window.Toast.error(
        "Error: " + (err.text || err.message || "Desconocido"),
      );
    }
  }

  function openBulkInstagrams() {
    const fromVal = parseInt(refs.instaFrom?.value || "0");
    const toVal = parseInt(refs.instaTo?.value || "0");

    if (!fromVal || !toVal || toVal < fromVal) {
      window.Toast.warning("Rango inválido");
      return;
    }

    const rows = refs.requestsList?.querySelectorAll(".staff-row") || [];
    const slice = Array.from(rows).slice(fromVal - 1, toVal);

    let opened = 0;
    slice.forEach((row) => {
      const handle = row.dataset.instagram;
      if (handle) {
        window.open(
          `https://instagram.com/${encodeURIComponent(handle)}`,
          "_blank",
        );
        opened++;
      }
    });

    if (opened === 0) {
      window.Toast.info("No se encontraron usuarios con IG en ese rango");
    } else {
      window.Toast.success(`Abiertos ${opened} perfiles`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. Vista Switching
  // ─────────────────────────────────────────────────────────────────────────
  function switchView(viewName) {
    state.currentView = viewName;

    refs.tabs.forEach((t) => {
      t.classList.toggle("active", t.dataset.view === viewName);
    });

    document.querySelectorAll(".view-container").forEach((el) => {
      el.classList.add("hidden");
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.remove("hidden");

    if (viewName === "solicitudes") {
      renderList();
    } else if (viewName === "cumple") {
      renderBirthdays();
    }

    updateStatusPill();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. Event Listeners
  // ─────────────────────────────────────────────────────────────────────────

  // Tab switching
  refs.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  // Filter pills
  refs.filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      refs.filterPills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      state.currentFilter = pill.dataset.status || "pendiente";
      renderList();
    });
  });

  // Search with debounce
  refs.searchInput?.addEventListener(
    "input",
    window.Utils.debounce(() => {
      renderList();
    }, 300),
  );

  // Refresh
  refs.btnRefresh?.addEventListener("click", loadMembers);

  // Bulk Instagram
  refs.btnBulk?.addEventListener("click", openBulkInstagrams);

  // Delegated click handler for actions
  document.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("[data-action]");
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const memberId = actionBtn.dataset.id;

    if (action === "greet") {
      sendBirthdayGreeting(memberId);
    } else {
      processAction(action, memberId);
    }
  });

  // EmailJS Init
  if (window.emailjs && window.APP_CONFIG?.EMAILJS) {
    try {
      emailjs.init(window.APP_CONFIG.EMAILJS.PUBLIC_KEY);
    } catch (e) {
      console.warn("EmailJS init error", e);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 11. Inicialización
  // ─────────────────────────────────────────────────────────────────────────
  await loadMembers();
})();
