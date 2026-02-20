/**
 * Navigation Analytics Core Module
 * Tracks page views and user interactions.
 */
(function () {
  "use strict";

  const Analytics = {
    sessionQueue: [],

    init() {
      // Check for previous queue in session storage
      const saved = sessionStorage.getItem("analytics_queue");
      if (saved) {
        try {
          this.sessionQueue = JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing analytics queue", e);
        }
      }

      // Flush on unload
      window.addEventListener("beforeunload", () => {
        sessionStorage.setItem(
          "analytics_queue",
          JSON.stringify(this.sessionQueue),
        );
      });
    },

    trackPageView(path) {
      const role =
        window.Auth && window.Auth.user && window.Auth.user.role
          ? window.Auth.user.role
          : "guest";

      const event = {
        type: "page_view",
        path: path,
        timestamp: new Date().toISOString(),
        user_role: role,
      };

      this.log(event);
    },

    trackEvent(category, action, label = null) {
      const role =
        window.Auth && window.Auth.user && window.Auth.user.role
          ? window.Auth.user.role
          : "guest";

      const event = {
        type: "event",
        category,
        action,
        label,
        timestamp: new Date().toISOString(),
        user_role: role,
      };
      this.log(event);
    },

    log(event) {
      // Add to session queue
      this.sessionQueue.push(event);
      // Limit queue size to prevent overflow
      if (this.sessionQueue.length > 50) this.sessionQueue.shift();

      // In a real implementation, this would send data to Supabase/BE
      // For now, we log to console for verification
      const debugMode = localStorage.getItem("debug_analytics") === "true";

      if (debugMode) {
        // Debug analytics logging available via localStorage.debug_analytics
      }
    },

    dump() {
      console.table(this.sessionQueue);
    },
  };

  window.NavAnalytics = Analytics;
  Analytics.init();
})();
