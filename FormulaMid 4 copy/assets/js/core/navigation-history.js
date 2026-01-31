/**
 * Navigation History Manager
 * Maintains navigation stack for smart back navigation
 */
(function () {
  "use strict";

  const NavHistory = {
    maxEntries: 10,

    /**
     * Push navigation entry to history
     */
    push(path) {
      let history = this.getHistory();

      // Don't duplicate consecutive entries
      if (history[history.length - 1] === path) return;

      history.push(path);

      // Keep only last N entries
      if (history.length > this.maxEntries) {
        history = history.slice(-this.maxEntries);
      }

      sessionStorage.setItem("nav_history", JSON.stringify(history));
    },

    /**
     * Pop last entry (when going back)
     */
    pop() {
      const history = this.getHistory();
      history.pop();
      sessionStorage.setItem("nav_history", JSON.stringify(history));
      return history[history.length - 1] || null;
    },

    /**
     * Get previous page (without popping)
     */
    getPrevious() {
      const history = this.getHistory();
      return history[history.length - 2] || null;
    },

    /**
     * Get full history
     */
    getHistory() {
      try {
        return JSON.parse(sessionStorage.getItem("nav_history") || "[]");
      } catch {
        return [];
      }
    },

    /**
     * Clear history
     */
    clear() {
      sessionStorage.removeItem("nav_history");
    },

    /**
     * Get smart back path (contextual fallback)
     */
    getBackPath() {
      const prev = this.getPrevious();
      if (prev) return prev;

      // Fallback to role landing
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

  window.NavHistory = NavHistory;
})();
