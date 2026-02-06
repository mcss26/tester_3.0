/**
 * Logistica Index/Landing Module
 * Handles dashboard status and profile
 */
(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["logistico", "admin"]);
  if (!session) return;

  // 2. DOM References
  const ui = {
    userName: document.getElementById("user-name"),
    systemStatus: document.getElementById("system-status"),
    moduleContent: document.getElementById("module-content"), // Generic container if exists
    pageCardLoading: document.getElementById("page-card-loading") // If exists
  };

  if (!window.Utils.assertSbOrShowBlockingError()) return;

  // 3. Load Data

  async function init() {
    window.Utils.setPageState(ui, { loading: true });
    try {
    // Profile
    if (ui.userName) {
      const { data: profile } = await window.sb
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      ui.userName.textContent = profile?.full_name || "Logística";
    }

    // Status
    if (ui.systemStatus) {
      const { data: wd } = await window.sb
        .from("work_days")
        .select("work_date, status")
        .eq("status", "open")
        .maybeSingle();

      if (wd) {
        ui.systemStatus.textContent = `🟢 OPERACIÓN DÍA: ${wd.work_date}`;
        ui.systemStatus.className = "system-status-pill status-success";
        ui.systemStatus.style.display = "inline-block";
      } else {
        ui.systemStatus.textContent = "🔴 SISTEMA CERRADO";
        ui.systemStatus.className = "system-status-pill status-error";
        ui.systemStatus.style.display = "inline-block";
      }
    }
    
    window.Utils.setPageState(ui, { loading: false });
  } catch (e) {
    console.error(e);
    window.Utils.setPageState(ui, { loading: false });
  }
}

  await init();
})();
