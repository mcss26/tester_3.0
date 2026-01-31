/**
 * Shared SlidePanel Module
 * Standardizes slide-over panel behavior across the application.
 */

window.initSlidePanel = function(options = {}) {
    const defaults = {
        overlayId: 'panel-overlay',
        panelId: 'slide-panel',
        closeBtnId: 'btn-close-panel',
        cancelBtnId: 'btn-cancel',
        onOpen: () => {},
        onClose: () => {}
    };

    const config = { ...defaults, ...options };

    const overlay = document.getElementById(config.overlayId);
    const panel = document.getElementById(config.panelId);
    const closeBtn = document.getElementById(config.closeBtnId);
    const cancelBtn = document.getElementById(config.cancelBtnId);

    if (!overlay || !panel) {
        console.error('SlidePanel: Overlay or Panel element not found');
        return null;
    }

    function open() {
        panel.classList.add('open');
        panel.classList.add('active');
        overlay.classList.add('open');
        overlay.classList.add('active');
        config.onOpen();
    }

    function close() {
        panel.classList.remove('open');
        panel.classList.remove('active');
        overlay.classList.remove('open');
        overlay.classList.remove('active');
        config.onClose();
        
        // Optional: clear errors or form reset logic could be handled by caller
        // via onClose callback or externally.
    }

    // Bind Internal Events
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    
    // Close on overlay click
    overlay.addEventListener('click', close);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('active')) {
            close();
        }
    });

    // Public API
    return {
        open,
        close,
        isActive: () => panel.classList.contains('open') || panel.classList.contains('active')
    };
};
