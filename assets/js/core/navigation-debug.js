/**
 * Navigation Debug Tool
 * Developer tool to inspect navigation state, history, and analytics.
 * Activate with Ctrl+Shift+D
 */
(function () {
  "use strict";

  const NavDebug = {
    isVisible: false,
    panel: null,
    timer: null,

    init() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
          e.preventDefault();
          this.toggle();
        }
      });
    },

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    },

    open() {
      if (this.panel) this.panel.remove();

      this.panel = document.createElement("div");
      this.panel.id = "nav-debug-panel";
      this.panel.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; width: 320px;
                background: rgba(0, 0, 0, 0.9); color: #0f0; font-family: 'Courier New', monospace;
                font-size: 12px; z-index: 100000; padding: 16px; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5); border: 1px solid #0f0;
                max-height: 80vh; overflow-y: auto;
            `;

      this.updateContent();
      document.body.appendChild(this.panel);
      this.isVisible = true;

      // Auto-refresh every section
      this.timer = setInterval(() => this.updateContent(), 1000);
    },

    close() {
      if (this.panel) this.panel.remove();
      this.panel = null;
      this.isVisible = false;
      if (this.timer) clearInterval(this.timer);
    },

    updateContent() {
      if (!this.panel) return;

      const hist = window.NavHistory ? window.NavHistory.getHistory() : [];
      const analytics = window.NavAnalytics
        ? window.NavAnalytics.sessionQueue
        : [];
      const user = window.Auth ? window.Auth.user : null;
      const scroll = sessionStorage.getItem("scroll_position");
      const stateKeys = Object.keys(sessionStorage).filter((k) =>
        k.startsWith("nav_state_"),
      );

      let html = `
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #0f0; margin-bottom:8px; padding-bottom:4px;">
                    <strong>NAV DEBUGGER</strong>
                    <span style="cursor:pointer" onclick="document.getElementById('nav-debug-panel').remove(); window.NavDebug.isVisible=false;">[X]</span>
                </div>
                
                <div style="margin-bottom:8px;">
                    <strong style="color:#fff">Current Context</strong><br/>
                    Path: ${window.location.pathname}<br/>
                    Role: ${user ? user.role : "Guest"}<br/>
                    Scroll Saved: ${scroll || "None"}
                </div>

                <div style="margin-bottom:8px;">
                    <strong style="color:#fff">History Stack (${hist.length})</strong><br/>
                    <div style="color:#aaa; padding-left:8px;">
                        ${hist
                          .slice(-5)
                          .reverse()
                          .map((url) => `<div>← ${url}</div>`)
                          .join("")}
                    </div>
                </div>

                <div style="margin-bottom:8px;">
                    <strong style="color:#fff">Saved States</strong><br/>
                    <div style="color:#aaa; padding-left:8px;">
                        ${stateKeys.length ? stateKeys.map((k) => `<div>${k.replace("nav_state_", "")}</div>`).join("") : "None"}
                    </div>
                </div>

                <div>
                    <strong style="color:#fff">Analytics Events (${analytics.length})</strong><br/>
                    <div style="color:#aaa; padding-left:8px;">
                         ${analytics
                           .slice(-3)
                           .reverse()
                           .map(
                             (e) =>
                               `<div>${e.type}: ${e.path || e.action}</div>`,
                           )
                           .join("")}
                    </div>
                </div>
            `;

      this.panel.innerHTML = html;
    },
  };

  window.NavDebug = NavDebug;
  NavDebug.init();
})();
