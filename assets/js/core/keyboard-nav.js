/**
 * Keyboard Navigation Core Module
 * Handles global keyboard shortcuts for power users.
 */
(function () {
  "use strict";

  const KeyboardNav = {
    shortcuts: [
      {
        key: "h",
        alt: true,
        desc: "Ir al Inicio",
        action: () =>
          window.Navigation.navigateTo(
            window.Breadcrumbs?.getHomePath() || "/",
          ),
      },
      {
        key: "b",
        alt: true,
        desc: "Volver Atrás",
        action: () => window.history.back(),
      },
      {
        key: "s",
        alt: true,
        desc: "Buscar (Foco)",
        action: () => document.querySelector('input[type="search"]')?.focus(),
      },
      {
        key: "k",
        alt: true,
        desc: "Ver Atajos",
        action: () => KeyboardNav.toggleCheatsheet(),
      },
      {
        key: "Escape",
        desc: "Cerrar Modales/Paneles",
        action: () => KeyboardNav.handleEscape(),
      },
    ],

    init() {
      document.addEventListener("keydown", (e) => this.handleKeydown(e));
    },

    handleKeydown(e) {
      // Ignore if sensitive input (unless Escape)
      const tag = e.target.tagName.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";
      if (isInput && e.key !== "Escape") return;

      // Find matching shortcut
      const match = this.shortcuts.find((s) => {
        if (s.key.toLowerCase() !== e.key.toLowerCase()) return false;
        if (s.alt && !e.altKey) return false;
        if (s.ctrl && !e.ctrlKey) return false;
        if (s.shift && !e.shiftKey) return false;
        return true;
      });

      if (match) {
        e.preventDefault();
        console.log(`Command: ${match.desc}`);
        match.action();
      }
    },

    handleEscape() {
      // Priority: Modals -> Slide Panels
      const activeModal = document.querySelector(
        ".modal.active, .modal:not(.hidden)",
      );
      if (activeModal) {
        // Try to find close button or just hide
        const closeBtn = activeModal.querySelector("[data-modal-close]");
        if (closeBtn) closeBtn.click();
        else activeModal.classList.add("hidden");
        return;
      }

      const slidePanel = document.getElementById("slide-panel");
      if (slidePanel && slidePanel.classList.contains("active")) {
        const closeBtn = document.getElementById("close-panel");
        if (closeBtn) closeBtn.click();
      }
    },

    toggleCheatsheet() {
      let overlay = document.getElementById("shortcuts-overlay");
      if (overlay) {
        overlay.remove();
        return;
      }

      overlay = document.createElement("div");
      overlay.id = "shortcuts-overlay";
      overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); z-index: 99999;
                display: flex; align-items: center; justify-content: center;
                backdrop-filter: blur(4px);
            `;

      const list = this.shortcuts
        .map((s) => {
          const keys = [];
          if (s.alt) keys.push("Alt");
          if (s.ctrl) keys.push("Ctrl");
          keys.push(s.key.toUpperCase());
          return `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
                        <span style="color: #ccc;">${s.desc}</span>
                        <span style="font-family: monospace; font-weight: bold; color: var(--primary, #4cc9f0); background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${keys.join("+")}</span>
                    </div>
                `;
        })
        .join("");

      overlay.innerHTML = `
                <div style="background: var(--surface-1, #1a1a1a); padding: 32px; border-radius: 12px; width: 400px; max-width: 90%; border: 1px solid var(--border-1, #333);">
                    <h2 style="margin-top: 0; margin-bottom: 24px; color: var(--text-1, #fff); border-bottom: 2px solid var(--primary, #4cc9f0); display: inline-block; padding-bottom: 8px;">Atajos de Teclado</h2>
                    ${list}
                    <p style="margin-top: 24px; text-align: center; color: #666; font-size: 0.9em;">Presiona Esc para cerrar</p>
                </div>
            `;

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
      });

      document.body.appendChild(overlay);
    },
  };

  window.KeyboardNav = KeyboardNav;
  // Auto-init only if not mobile (simple check)
  if (window.innerWidth > 768) {
    KeyboardNav.init();
  }
})();
