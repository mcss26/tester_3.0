/**
 * Logistica Index/Landing Module
 * Golden Standard alignment — workday status, avatar, nav rules.
 * 
 * @module logistica-index
 * @requires window.Auth
 * @requires window.sb (Supabase client)
 * @requires window.Utils
 * @requires window.WorkDayHelper
 */
(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["logistico", "admin"]);
  if (!session) return;

  if (!window.Utils.assertSbOrShowBlockingError()) return;

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
      .slice(0, 2) || "LG";
  if (avatar) avatar.textContent = initials;
  if (userNameDisplay) userNameDisplay.textContent = fullName || user.email;

  // 4. Load workday status
  try {
    const workday = await window.WorkDayHelper.getPlannableWorkDay();
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
          workday.status === "ACTIVE" ? "status-open" : "status-planning"
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
    console.warn("[logistica-index] WorkDay fetch error:", err);
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
    const confirmed = await window.Utils.confirmModal("Cerrar sesión?");
    if (!confirmed) return;
    try {
      await window.Auth.logout();
    } catch (err) {
      console.error("[logistica-index] Logout error:", err);
      window.Toast?.error("Error al cerrar sesión.");
    }
  });
})();
