/**
 * Universal Navigation Handler for FormulaMid 4
 * Handles data-go attribute navigation with optional transitions
 */
(function () {
  "use strict";

  const Navigation = {
    transitionDelay: 200, // Slightly increased for visibility
    progressBar: null,

    createProgressBar() {
      if (document.getElementById("nav-progress-bar")) return;

      const bar = document.createElement("div");
      bar.id = "nav-progress-bar";
      bar.className = "nav-progress-bar";
      document.body.appendChild(bar);
      this.progressBar = bar;
    },

    startProgress() {
      if (!this.progressBar) this.createProgressBar();
      // Force reflow
      this.progressBar.classList.remove("active", "complete");
      void this.progressBar.offsetWidth;
      this.progressBar.classList.add("active");
    },

    finishProgress() {
      if (!this.progressBar) return;
      this.progressBar.classList.add("complete");
      setTimeout(() => {
        this.progressBar.classList.remove("active", "complete");
      }, 500);
    },

    /**
     * Navigate to a page with optional transition effect
     * @param {string} path - Relative path to navigate to
     * @param {object} options - { transition: boolean }
     */
    navigateTo(path, options = { transition: true }) {
      if (window.NavHistory) {
        window.NavHistory.push(window.location.pathname);
      }

      if (window.NavAnalytics) {
        window.NavAnalytics.trackPageView(path);
      }

      this.startProgress();
      this.announce(`Navegando a ${path}...`);
      const fullPath = window.Auth ? window.Auth.toAppPath(path) : path;

      if (options.transition) {
        document.body.classList.add("is-leaving");
        setTimeout(() => {
          window.location.href = fullPath;
        }, this.transitionDelay);
      } else {
        window.location.href = fullPath;
      }
    },

    /**
     * Initialize data-go link handler with event delegation
     */
    init() {
      this.createProgressBar();

      // Handle initial load animation
      // If it's a fresh load (not nav), we might want to skip animation or just fade in.
      // We assume CSS handles the fade-in via 'animation: fadeIn'.
      // We can remove 'initial-load' class if present to enable future CSS transitions if needed.
      document.body.classList.remove("initial-load");

      // Track initial page view
      if (window.NavAnalytics) {
        window.NavAnalytics.trackPageView(window.location.pathname);
      }

      // Save scroll position before navigating
      window.addEventListener("beforeunload", () => {
        sessionStorage.setItem("scroll_position", window.scrollY.toString());
      });

      // Restore scroll position on page load
      window.addEventListener("load", () => {
        const savedScroll = sessionStorage.getItem("scroll_position");
        if (savedScroll) {
          setTimeout(() => {
            window.scrollTo(0, parseInt(savedScroll, 10));
          }, 100);
          sessionStorage.removeItem("scroll_position");
        }
      });

      // Navigation handler (event delegation)
      document.addEventListener("click", (e) => {
        const target = e.target.closest("[data-go]");
        if (!target) return;

        e.preventDefault();
        const path = target.getAttribute("data-go");
        const noTransition = target.hasAttribute("data-no-transition");

        this.navigateTo(path, { transition: !noTransition });
      });

      // Logout handler
      const btnLogout = document.getElementById("btn-logout");
      if (btnLogout) {
        btnLogout.addEventListener("click", () => {
          if (window.Auth) window.Auth.signOutAndGoLogin();
        });
      }

      this.handleAccessibility();
    },

    /**
     * Handle Accessibility features (Focus management, ARIA)
     */
    handleAccessibility() {
      // 1. Create Announcer
      let announcer = document.getElementById("a11y-announcer");
      if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "a11y-announcer";
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.style.cssText =
          "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;";
        document.body.appendChild(announcer);
        this.announcer = announcer;
      }

      // 2. Focus Management on Load
      // Find the main heading or main content to shift focus to
      const mainHeading =
        document.querySelector("h1") ||
        document.querySelector(".dashboard-title");
      if (mainHeading) {
        if (!mainHeading.hasAttribute("tabindex")) {
          mainHeading.setAttribute("tabindex", "-1");
        }
        mainHeading.focus();
      } else {
        const main = document.querySelector("main");
        if (main) {
          if (!main.hasAttribute("tabindex")) {
            main.setAttribute("tabindex", "-1");
          }
          main.focus();
        }
      }
    },

    announce(message) {
      if (this.announcer) {
        this.announcer.textContent = "";
        setTimeout(() => {
          this.announcer.textContent = message;
        }, 100);
      }
    },
  };

  window.Navigation = Navigation;

  // Initialize on DOMContentLoaded to ensure body exists for specific elements
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Navigation.init());
  } else {
    Navigation.init();
  }
})();
