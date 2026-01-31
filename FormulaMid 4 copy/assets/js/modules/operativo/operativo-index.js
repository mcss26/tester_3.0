/**
 * Operativo Index/Landing Module
 * Handles dashboard data fetching (user profile, system status)
 */
(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect([
    "operativo",
    "staff_barra",
    "staff_operativo",
  ]);
  if (!session) return;

  // 2. DOM References
  const ui = {
    userName: document.getElementById("user-name"),
    systemStatus: document.getElementById("system-status"),
    // New references for widget
    statusWidget: document.getElementById("system-status-widget"),
    statusValue: document.getElementById("system-status-value"),
  };

  // 3. Fetch User Profile
  async function loadProfile() {
    if (!ui.userName) return;
    // Requested: "nombre de perfil operativo"
    ui.userName.textContent = "Operativo";
  }

  // 4. Fetch System Status
  async function loadSystemStatus() {
    // Legacy support or new widget
    const widget = ui.statusWidget || ui.systemStatus;
    const valueLabel = ui.statusValue;

    if (!widget) return;

    try {
      const { data: wd } = await window.sb
        .from("work_days")
        .select("work_date, status")
        .eq("status", "open")
        .maybeSingle();

      if (wd) {
        if (valueLabel) {
          valueLabel.textContent = wd.work_date;
          widget.classList.remove("hidden");
          widget.classList.add("live");
        } else {
          // Fallback for old HTML if ever used
          widget.textContent = `DÍA ${wd.work_date}`;
          widget.className = "status-pill status-success";
          widget.classList.remove("hidden");
        }
      } else {
        if (valueLabel) {
          valueLabel.textContent = "CERRADO";
          widget.classList.remove("hidden");
        } else {
          widget.textContent = "CERRADO";
          widget.className = "status-pill status-error";
          widget.classList.remove("hidden");
        }
      }
    } catch (err) {
      console.warn("Error loading status", err);
    }
  }

  // Init
  await Promise.all([loadProfile(), loadSystemStatus()]);
})();
