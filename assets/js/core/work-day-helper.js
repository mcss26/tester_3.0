/**
 * @fileoverview Work Day and Attendance Management Helper.
 * Manages the "ACTIVE" work day state and staff planning/convocation statistics.
 * 
 * @module WorkDayHelper
 */

/**
 * @namespace WorkDayHelper
 */
const WorkDayHelper = {
  /**
   * Fetches the current active open work day from Supabase.
   * 
   * @async
   * @returns {Promise<Object|null>} The active work day record or null if none.
   */
  async getOpenWorkDay() {
    try {
      const { data, error } = await window.sb
        .from("work_days")
        .select("*")
        .eq("status", "ACTIVE")
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("WorkDayHelper: Error fetching open work day", err);
      return null;
    }
  },

  /**
   * Fetches the current plannable work day (ACTIVE or PLANNED).
   * Use this for encargado indexes where staff management is needed
   * before the workday is opened (ACTIVE).
   * 
   * @async
   * @returns {Promise<Object|null>} The plannable work day record or null.
   */
  async getPlannableWorkDay() {
    try {
      const { data, error } = await window.sb
        .from("work_days")
        .select("*")
        .in("status", ["ACTIVE", "PLANNED"])
        .order("work_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("WorkDayHelper: Error fetching plannable work day", err);
      return null;
    }
  },

  /**
   * Fetches the summary view (vw_work_day_summary) for admin dashboards.
   * 
   * @async
   * @returns {Promise<Object|null>} Summary record or null.
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

  /**
   * Determines the redirection path if no open work day exists, based on current module.
   * 
   * @returns {string} The relative path for redirection.
   */
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
   * Requires an open work day. If none exists, optionally redirects to a fallback page.
   * 
   * @async
   * @param {Object} [opts={}] - Options.
   * @param {boolean} [opts.autoRedirect=false] - Whether to automatically redirect.
   * @returns {Promise<Object|null>} The open work day if found, otherwise null.
   */
  async requireOpenWorkDay({ autoRedirect = false } = {}) {
    const day = await this.getOpenWorkDay();
    if (!day) {
      if (autoRedirect) {
        console.warn("WorkDayHelper: No open work day found. Redirecting...");
        window.Toast.error("Se requiere una jornada abierta para acceder a esta sección.");
        const relPath = this.resolveRedirectPath();
        const target = window.Auth?.toAppPath ? window.Auth.toAppPath(relPath) : relPath;
        window.location.href = target;
      }
      return null;
    }
    return day;
  },

  /**
   * Legacy support alias for requireOpenWorkDay with autoRedirect: true.
   * @async
   * @param {Object} opts - Options.
   */
  async requireWorkDay(opts) {
    return this.requireOpenWorkDay({ ...opts, autoRedirect: true });
  },

  /**
   * Formats a YYYY-MM-DD date string to DD/MM/YYYY.
   * 
   * @param {string} dateStr - Date string in ISO format.
   * @returns {string} Formatted date or "-" if empty.
   */
  formatDate(dateStr) {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  },

  /**
   * Retrieves attendance statistics (planned vs confirmed) for multiple work day IDs.
   * 
   * @async
   * @param {string[]} workDayIds - Array of UUIDs.
   * @returns {Promise<Object>} Map of stats: { [id]: { planned, confirmed } }.
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
