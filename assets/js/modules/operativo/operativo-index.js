/**
 * Operativo Index/Landing Module
 * Handles auth guard, user profile display, workday status widget,
 * MCO QR counter, and user menu interactions.
 */
(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect([
    "operativo",
    "staff_barra",
    "staff_operativo",
    "admin",
    "encargado_barra",
    "encargado_caja",
  ]);
  if (!session) return;

  // 2. DOM References
  const avatar = document.getElementById("user-avatar");
  const userNameDisplay = document.getElementById("user-name-display");
  const userMenu = document.getElementById("user-menu");
  const workdayStatus = document.getElementById("workday-status");
  const workdayText = document.getElementById("workday-text");
  const logoutBtn = document.getElementById("btn-logout");

  // 3. Set user info
  const user = session.user;
  const meta = user.user_metadata || {};
  const fullName = meta.full_name || meta.name || user.email || "";
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "OP";
  if (avatar) avatar.textContent = initials;
  if (userNameDisplay) userNameDisplay.textContent = fullName || user.email;

  // 4. Load workday status
  try {
    const workday = await window.WorkDayHelper.getOpenWorkDay();
    if (workday) {
      const date = new Date(workday.work_date + "T12:00:00");
      const dayName = date.toLocaleDateString("es-AR", { weekday: "long" });
      const dayNum = date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      });
      if (workdayText) workdayText.textContent = `${dayName} ${dayNum}`;
      if (workdayStatus) {
        workdayStatus.classList.remove("status-closed", "status-planning");
        workdayStatus.classList.add(
          workday.status === "open" ? "status-open" : "status-planning"
        );
      }
    } else {
      if (workdayText) workdayText.textContent = "Sin jornada activa";
      if (workdayStatus) {
        workdayStatus.classList.remove("status-open", "status-planning");
        workdayStatus.classList.add("status-closed");
      }
    }
  } catch (err) {
    console.warn("WorkDay fetch error:", err);
    if (workdayText) workdayText.textContent = "Error";
  }

  // 5. Avatar Dropdown Toggle
  if (avatar && userMenu) {
    avatar.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      userMenu.classList.add("hidden");
    });
  }

  // 6. Logout
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const confirmed = window.Utils?.confirmModal
      ? await window.Utils.confirmModal("Cerrar sesion?")
      : window.confirm("Cerrar sesion?");
    if (!confirmed) return;
    try {
      await window.Auth.logout();
    } catch (err) {
      console.error("Logout error:", err);
      window.Toast?.error("Error al cerrar sesion. Por favor intenta nuevamente.");
    }
  });

  // 7. MCO QR Widget
  function initMcoQrWidget() {
    const widget = document.getElementById("mco-widget");
    const elValidated = document.getElementById("mco-qr-validated");

    if (!widget) return;
    if (window.Utils?.assertSbOrShowBlockingError) {
      if (!window.Utils.assertSbOrShowBlockingError(widget)) return;
    } else if (!window.sb) {
      console.warn("Supabase client unavailable for MCO widget");
      return;
    }

    const MCO_BATCH_ID = "141e44d9-42bc-4c2b-a3bb-4d9721e03802";

    const fetchMcoStats = async () => {
      try {
        const { count: validated } = await window.sb
          .from("qr_codes")
          .select("*", { count: "exact", head: true })
          .eq("batch_id", MCO_BATCH_ID)
          .eq("status", "ACREDITADO");

        if (elValidated) elValidated.textContent = validated || 0;
        widget.style.display = "";
      } catch (err) {
        console.warn("Error fetching MCO QR stats:", err);
      }
    };

    fetchMcoStats();
    setInterval(fetchMcoStats, 60000);
  }

  initMcoQrWidget();
})();

