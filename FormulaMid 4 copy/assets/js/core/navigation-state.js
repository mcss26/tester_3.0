/**
 * Navigation State Manager
 * Persists page state across navigation using sessionStorage
 */
(function () {
  "use strict";

  const NavState = {
    /**
     * Save page state before navigating away
     * @param {string} pageKey - Unique identifier for page (e.g., 'admin-master-sku')
     * @param {object} state - State to save { filters, search, tab, etc. }
     */
    save(pageKey, state) {
      const stateData = {
        ...state,
        timestamp: Date.now(),
        scrollPosition: window.scrollY,
      };
      sessionStorage.setItem(`nav_state_${pageKey}`, JSON.stringify(stateData));
    },

    /**
     * Restore page state on load
     * @param {string} pageKey - Unique identifier for page
     * @returns {object|null} Restored state or null
     */
    restore(pageKey) {
      const stored = sessionStorage.getItem(`nav_state_${pageKey}`);
      if (!stored) return null;

      try {
        const state = JSON.parse(stored);
        // Only restore if less than 30 minutes old
        if (Date.now() - state.timestamp > 30 * 60 * 1000) {
          this.clear(pageKey);
          return null;
        }
        return state;
      } catch (err) {
        console.error("[NavState] Error restoring state:", err);
        return null;
      }
    },

    /**
     * Clear state for a page
     */
    clear(pageKey) {
      sessionStorage.removeItem(`nav_state_${pageKey}`);
    },

    /**
     * Clear all navigation state (e.g., on logout)
     */
    clearAll() {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith("nav_state_"))
        .forEach((key) => sessionStorage.removeItem(key));
    },
  };

  window.NavState = NavState;
})();
