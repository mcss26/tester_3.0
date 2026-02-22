/**
 * @fileoverview Core Authentication & Authorization Module
 * Handles path resolution, session management, and role-based access control (RBAC).
 * Supports sub-folder deployments (e.g., /FormulaMid/) and local development environments.
 * 
 * @module Auth
 */

/**
 * @namespace Auth
 */
window.Auth = {
  /**
   * Resolves the application base path regardless of current depth.
   * Useful for projects hosted in subdirectories.
   * 
   * @returns {string} The base path including trailing slash (e.g., "/" or "/FormulaMid/").
   */
  appBasePath() {
    const p = window.location.pathname || "/";
    const i = p.indexOf("/pages/");
    if (i !== -1) return p.slice(0, i + 1); // incluye la barra final
    return p.replace(/\/[^\/]*$/, "/"); // carpeta del archivo actual (login.html)
  },

  /**
   * Converts a relative path to an absolute application path.
   * Automatically appends .html in local environments for cleaner code usage.
   * 
   * @param {string} relPath - Relative path (e.g., "pages/admin/index").
   * @returns {string} The resolved application path.
   */
  toAppPath(relPath) {
    let clean = String(relPath || "").replace(/^\/+/, "");

    // Auto-append .html for local dev if missing
    // Logic: If on localhost/file and path looks like a page (no extension), add .html
    // This allows cleaner code usage like 'pages/admin/index' while validating locally.
    const isLocal =
      ["localhost", "127.0.0.1", "", "0.0.0.0"].includes(
        window.location.hostname,
      ) || window.location.protocol === "file:";

    if (isLocal) {
      // Ignore if already has extension, or query/hash
      if (
        !clean.match(/\.[a-z0-9]+$/i) &&
        !clean.includes("?") &&
        !clean.includes("#")
      ) {
        clean += ".html";
      }
    }

    return this.appBasePath() + clean;
  },

  /**
   * Internal helper to verify if the Supabase client (window.sb) is initialized.
   * 
   * @private
   * @returns {boolean} True if initialized, false otherwise.
   */
  checkSb() {
    if (!window.sb) {
      console.warn("[Auth] window.sb not initialized yet.");
      return false;
    }
    return true;
  },

  /**
   * Retrieves the current Supabase session.
   * 
   * @async
   * @returns {Promise<Object|null>} The session object or null if none or error.
   */
  async getSession() {
    if (!this.checkSb()) return null;

    const { data, error } = await window.sb.auth.getSession();
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    return data.session;
  },

  /**
   * Retrieves the current authenticated user from Supabase.
   * 
   * @async
   * @returns {Promise<Object|null>} The user object or null if none or error.
   */
  async getUser() {
    if (!this.checkSb()) return null;

    const { data, error } = await window.sb.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return null;
    }
    return data.user;
  },

  /**
   * Fetches the profile associated with the current user from the 'profiles' table.
   * 
   * @async
   * @returns {Promise<Object|null>} Profile data (id, full_name, role) or null.
   */
  async getMyProfile() {
    const user = await this.getUser();
    if (!user) return null;

    const { data, error } = await window.sb
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  },

  /**
   * Determines the landing page path for a specific role.
   * 
   * @param {string} role - The user's role.
   * @returns {string} The landing page path.
   */
  roleLanding(role) {
    const r = String(role || "")
      .toLowerCase()
      .trim();

    if (r === "admin" || r === "contable")
      return this.toAppPath("pages/admin/admin-index");
    if (r === "manager") return this.toAppPath("pages/admin/admin-index");
    if (r === "logistico")
      return this.toAppPath("pages/logistica/logistica-index");

    // Encargados
    if (r === "encargado_caja")
      return this.toAppPath("pages/encargados/encargado-caja-index");
    if (r === "encargado_barra")
      return this.toAppPath("pages/encargados/encargado-barra-index");

    // Other encargados (limpieza, seguridad) fallback to standard operativo or specific if exists
    if (r.startsWith("encargado_"))
      return this.toAppPath("pages/operativo/operativo-index");

    // Staff specific dashboard
    if (r === "staff_caja")
      return this.toAppPath("pages/staff/staff-caja-index");
    if (r === "staff_barra")
      return this.toAppPath("pages/staff/staff-barra-index");

    // Operativo fallback
    return this.toAppPath("pages/operativo/operativo-index");
  },

  /**
   * Guards a page by checking session and role.
   * Hides the body until validation is successful.
   * Redirects to login if no session, or to role-specific landing if role is not allowed.
   * 
   * @async
   * @param {string[]} [allowedRoles=[]] - Array of roles allowed to access the page. Empty means all authenticated users.
   * @returns {Promise<Object|null>} Object containing user and profile, or null if redirected.
   */
  async guardOrRedirect(allowedRoles = []) {
    document.body.style.visibility = 'hidden';

    const allowed = (allowedRoles || [])
      .map((r) => String(r).toLowerCase().trim())
      .filter(Boolean);

    const session = await this.getSession();

    if (!session) {
      window.location.href = this.toAppPath("login");
      return null;
    }

    const profile = await this.getMyProfile();

    if (!profile) {
      console.error("Session exists but no profile found.");
      return null;
    }

    const role = String(profile.role || "").toLowerCase().trim();

    if (allowed.length > 0 && !allowed.includes(role)) {
      const landingPath = this.roleLanding(role);
      if (window.location.pathname !== landingPath) {
        window.location.href = landingPath;
      }
      return null;
    }

    document.body.style.visibility = 'visible';
    return { user: session.user, profile: { ...profile, role } };
  },

  /**
   * Signs out the current user and redirects to the login page.
   * 
   * @async
   */
  async signOutAndGoLogin() {
    await window.sb.auth.signOut();
    window.location.href = this.toAppPath("login");
  },

  /**
   * Alias for signOutAndGoLogin.
   */
  logout() {
    return this.signOutAndGoLogin();
  },
};

