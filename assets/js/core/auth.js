/**
 * Core Auth Module (base-path safe)
 * - Redirects funcionan aunque el proyecto esté en subcarpeta (ej: /FormulaMid/)
 */

window.Auth = {
  // Devuelve el "root" de tu app (ej: "/FormulaMid/") tanto desde /login.html como desde /pages/*
  appBasePath() {
    const p = window.location.pathname || "/";
    const i = p.indexOf("/pages/");
    if (i !== -1) return p.slice(0, i + 1); // incluye la barra final
    return p.replace(/\/[^\/]*$/, "/"); // carpeta del archivo actual (login.html)
  },

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

  // Helper interno para verificar si existe el cliente
  checkSb() {
    if (!window.sb) {
      console.warn("[Auth] window.sb not initialized yet.");
      return false;
    }
    return true;
  },

  async getSession() {
    if (!this.checkSb()) return null;

    const { data, error } = await window.sb.auth.getSession();
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    return data.session;
  },

  async getUser() {
    if (!this.checkSb()) return null;

    const { data, error } = await window.sb.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return null;
    }
    return data.user;
  },

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

  async guardOrRedirect(allowedRoles = []) {
    const session = await this.getSession();

    if (!session) {
      window.location.href = this.toAppPath("login");
      return null;
    }

    const profile = await this.getMyProfile();
    if (!profile) {
      console.error("Session exists but no profile found. Signing out.");
      await this.signOutAndGoLogin();
      return null;
    }

    // normalizar roles para comparar
    const role = String(profile.role || "")
      .toLowerCase()
      .trim();
    const allowed = (allowedRoles || [])
      .map((r) => String(r).toLowerCase().trim())
      .filter(Boolean);

    if (allowed.length > 0 && !allowed.includes(role)) {
      const landingPath = this.roleLanding(role);
      if (window.location.pathname !== landingPath)
        window.location.href = landingPath;
      return null;
    }

    return { user: session.user, profile: { ...profile, role } };
  },

  async signOutAndGoLogin() {
    await window.sb.auth.signOut();
    window.location.href = this.toAppPath("login");
  },

  logout() {
    return this.signOutAndGoLogin();
  },
};
