/**
 * Breadcrumb Navigation Component
 * Displays location hierarchy: Home > Admin > SKU Master
 */
(function () {
  "use strict";

  const Breadcrumbs = {
    /**
     * Render breadcrumbs based on current path
     * @param {HTMLElement} container - Where to render breadcrumbs
     */
    render(container) {
      const path = window.location.pathname;
      const crumbs = this.buildCrumbs(path);

      container.innerHTML = crumbs
        .map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          const separator = isLast
            ? ""
            : `<span class="mx-2 text-white/30 separator">|</span>`;

          if (container.classList.contains("breadcrumbs-pipe")) {
            // Custom pipe render
            return `
                <span class="inline-flex items-center ${isLast ? "text-white" : "text-white/60 hover:text-white transition-colors"}">
                  ${
                    isLast
                      ? crumb.label
                      : `<a href="#" data-go="${crumb.path}">${crumb.label}</a>`
                  }
                </span>
                ${separator}
              `;
          }

          // Default render (previous behavior, assuming CSS handles separators or added here)
          return `
            <span class="breadcrumb-item ${isLast ? "active" : ""}">
              ${
                isLast
                  ? crumb.label
                  : `
                <a href="#" data-go="${crumb.path}">${crumb.label}</a>
              `
              }
            </span>
          `;
        })
        .join("");
    },

    /**
     * Build breadcrumb trail from path
     */
    buildCrumbs(path) {
      const parts = path.split("/").filter(Boolean);
      const crumbs = [{ label: "Inicio", path: this.getHomePath() }];

      // Detect context
      if (parts.includes("admin")) {
        crumbs.push({
          label: "Admin",
          path: "pages/admin/admin-index.html",
        });

        // Add current page
        const page = parts[parts.length - 1];
        const pageName = this.humanize(page);
        if (pageName !== "Admin Index") {
          crumbs.push({ label: pageName, path: null });
        }
      } else if (parts.includes("logistica")) {
        crumbs.push({
          label: "Logística",
          path: "pages/logistica/logistica-index.html",
        });

        const page = parts[parts.length - 1];
        const pageName = this.humanize(page);
        if (pageName !== "Logistica Index") {
          crumbs.push({ label: pageName, path: null });
        }
      } else if (parts.includes("operativo")) {
        crumbs.push({
          label: "Operativo",
          path: "pages/operativo/operativo-index.html",
        });

        const page = parts[parts.length - 1];
        const pageName = this.humanize(page);
        if (pageName !== "Operativo Index") {
          crumbs.push({ label: pageName, path: null });
        }
      } else if (parts.includes("encargados")) {
        crumbs.push({ label: "Encargados", path: null });
      }

      return crumbs;
    },

    /**
     * Convert filename to human-readable label
     */
    humanize(filename) {
      return filename
        .replace(".html", "")
        .replace(/-/g, " ")
        .replace(/admin |operativo |logistica /gi, "")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    },

    /**
     * Get home path based on current page context (NOT user role)
     * Admin pages → admin-index, Operativo → operativo-index, etc.
     */
    getHomePath() {
      const path = window.location.pathname;

      if (path.includes("/admin/")) {
        return "pages/admin/admin-index.html";
      }
      if (path.includes("/operativo/")) {
        return "pages/operativo/operativo-index.html";
      }
      if (path.includes("/logistica/")) {
        return "pages/logistica/logistica-index.html";
      }
      if (path.includes("/encargados/")) {
        return "pages/encargados/encargado-index.html";
      }
      if (path.includes("/staff/")) {
        return "pages/staff/staff-index.html";
      }

      // Fallback to role-based landing
      if (!window.Auth) return "/login.html";
      try {
        const profile = JSON.parse(
          sessionStorage.getItem("user_profile") || "{}",
        );
        return window.Auth.roleLanding(profile.role);
      } catch {
        return "/login.html";
      }
    },
  };

  window.Breadcrumbs = Breadcrumbs;
})();
