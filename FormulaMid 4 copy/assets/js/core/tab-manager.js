/**
 * Tab Manager
 * Unified tab switching pattern for all modules
 */
(function () {
  "use strict";

  const TabManager = {
    /**
     * Initialize tab system
     * @param {object} config - { tabs: NodeList, onSwitch: function, defaultTab: string }
     */
    init(config) {
      const { tabs, onSwitch, defaultTab } = config;

      // Validate inputs
      if (!tabs || tabs.length === 0) {
        console.warn("TabManager: No tabs provided");
        return null;
      }

      let activeTab = defaultTab || tabs[0]?.dataset.tab;

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const newTab = tab.dataset.tab;
          if (newTab === activeTab) return;

          // Update UI
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");

          // Update state
          activeTab = newTab;

          // Callback
          if (onSwitch) onSwitch(newTab);
        });
      });

      // Activate default tab logic (UI update)
      const defaultTabEl = Array.from(tabs).find(
        (t) => t.dataset.tab === activeTab,
      );

      if (defaultTabEl) {
        // We manually update classes here instead of clicking to avoid re-triggering logic indiscriminately
        // unless the consumer wants it. But usually we want to set initial state.
        tabs.forEach((t) => t.classList.remove("active"));
        defaultTabEl.classList.add("active");

        // Trigger initial callback if needed?
        // Typically modules call render() manually after init, but let's stick to the pattern.
      }

      return {
        getActiveTab: () => activeTab,
        switchTo: (tabId) => {
          const tabEl = Array.from(tabs).find((t) => t.dataset.tab === tabId);
          if (tabEl) tabEl.click();
        },
      };
    },
  };

  window.TabManager = TabManager;
})();
