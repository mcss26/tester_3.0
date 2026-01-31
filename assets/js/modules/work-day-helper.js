const WorkDayHelper = {
  /**
   * Get the current active open work day or null.
   */
  async getOpenWorkDay() {
    try {
      const { data, error } = await window.sb
        .from("work_days")
        .select("*")
        .eq("status", "open")
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("WorkDayHelper: Error fetching open work day", err);
      return null;
    }
  },

  /**
   * Get summary view for admin dashboards.
   */
  async getWorkDaySummary() {
    try {
      const { data, error } = await window.sb
        .from("vw_work_day_summary")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("WorkDayHelper: Error fetching summary", err);
      return null;
    }
  },

  resolveRedirectPath() {
    const path = window.location.pathname || "";
    if (path.includes("/pages/admin/")) return "pages/admin/admin-index.html";
    if (path.includes("/pages/encargados/"))
      return "pages/operativo/operativo-index.html";
    if (path.includes("/pages/logistica/"))
      return "pages/logistica/logistica-index.html";
    if (path.includes("/pages/operativo/"))
      return "pages/operativo/operativo-index.html";
    return "login.html";
  },

  /**
   * Require an open work day.
   * If no open day exists, returns null. UI can handle redirection or messaging.
   * @param {Object} opts - Options
   * @param {boolean} opts.autoRedirect - Whether to redirect automatically (default false to handle in UI)
   */
  async requireOpenWorkDay({ autoRedirect = false } = {}) {
    const day = await this.getOpenWorkDay();
    if (!day) {
      if (autoRedirect) {
        console.warn("WorkDayHelper: No open work day found. Redirecting...");
        alert("Se requiere una jornada abierta para acceder a esta sección.");
        const relPath = this.resolveRedirectPath();
        const target = window.Auth?.toAppPath ? window.Auth.toAppPath(relPath) : relPath;
        window.location.href = target;
      }
      return null;
    }
    return day;
  },

  // Legacy support if used elsewhere, mapped to new method
  async requireWorkDay(opts) {
    return this.requireOpenWorkDay({ ...opts, autoRedirect: true });
  },

  /**
   * Format a work day for display.
   */
  formatDate(dateStr) {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  },
  /**
   * Get attendance statistics for a list of work day IDs.
   * Returns a map: { [workDayId]: { planned: number, confirmed: number } }
   */
  async getAttendanceStats(workDayIds) {
    if (!workDayIds || workDayIds.length === 0) return {};

    try {
      // 1. Get Planned Count (Sum quantity from planning)
      const { data: plannedData, error: plannedError } = await window.sb
        .from('work_day_staff_planning')
        .select('work_day_id, quantity')
        .in('work_day_id', workDayIds);

      if (plannedError) throw plannedError;

      // 2. Get Confirmed Count (Count confirmed convocations)
      const { data: confirmedData, error: confirmedError } = await window.sb
        .from('staff_convocations')
        .select('work_day_id')
        .in('work_day_id', workDayIds)
        .eq('status', 'confirmed'); // Only count confirmed

      if (confirmedError) throw confirmedError;

      // 3. Aggregate
      const stats = {};
      
      // Initialize
      workDayIds.forEach(id => { stats[id] = { planned: 0, confirmed: 0 }; });

      // Sum Planned
      (plannedData || []).forEach(row => {
          if (stats[row.work_day_id]) {
              stats[row.work_day_id].planned += (row.quantity || 0);
          }
      });

      // Count Confirmed
      (confirmedData || []).forEach(row => {
          if (stats[row.work_day_id]) {
              stats[row.work_day_id].confirmed += 1;
          }
      });

      return stats;

    } catch (err) {
      console.error("WorkDayHelper: Error fetching attendance stats", err);
      return {};
    }
  }
};

// Expose globally
window.WorkDayHelper = WorkDayHelper;
