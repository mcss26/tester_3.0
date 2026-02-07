// Shared helpers for modules (browser-safe)
(function () {
  if (window.Utils) return;

  const debounce = (fn, wait = 180) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const numberOrNull = (val) => {
    if (val === null || val === undefined) return null;
    const n = parseFloat(String(val).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const assertSbOrShowBlockingError = (targetEl, message) => {
    if (window.sb) return true;
    const msg =
      message ||
      "No se pudo iniciar la conexión. Recargá la página o contactá soporte.";
    const target = targetEl || document.getElementById("list-container");
    if (target) {
      target.innerHTML = `<div class="empty-state accent">${msg}</div>`;
    }
    console.error("[Utils] Supabase client not initialized.");
    return false;
  };

  const calcReplenishment = ({ requerido, stock_actual, pack_qty }) => {
    const req = numberOrNull(requerido) || 0;
    const curr = numberOrNull(stock_actual) || 0;
    const packSize = numberOrNull(pack_qty) || 1;

    const unidades = Math.max(req - curr, 0);
    const pack = Math.ceil(unidades / packSize);
    const total = pack * packSize;

    return { unidades, pack, total };
  };

  const mapSolicitudEstadoUI = ({
    supplier_id,
    eta_date,
    final_cost,
    supplier_order_status,
  }) => {
    const s = (supplier_order_status || "").toLowerCase();
    const hasSupplier = Boolean(supplier_id);
    const hasDate = Boolean(eta_date);
    const costKnown = final_cost !== undefined;
    const hasCost = costKnown ? final_cost !== null && final_cost !== "" : true;
    const isReady = hasSupplier && hasDate && hasCost;

    if (!isReady) return "pendiente";
    if (s === "received") return "recibido";
    if (["approved", "ordered", "in_transit", "arrived"].includes(s))
      return "aprobado";
    if (s === "ready_for_approval") return "enviado";
    if (s === "draft" || s === "pending") return "pendiente";

    return "enviado";
  };

  const formatARS = (n) => {
    if (n === null || n === undefined) return "-";
    // Using explicit 'es-AR' locale for consistent formatting
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(n);
  };


  /* DOM Helpers */
  const hide = (el) => { if (el) el.classList.add('hidden'); };
  const show = (el) => { if (el) el.classList.remove('hidden'); };
  const isHidden = (el) => el ? el.classList.contains('hidden') : true;

  /**
   * Escape HTML to prevent XSS
   */
  const escapeHtml = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  /**
   * Promise-based confirmation modal
   * @param {string} message - The confirmation question
   * @param {object} options - Optional config { confirmText, cancelText, isDanger }
   * @returns {Promise<boolean>} - true if confirmed, false if cancelled
   */
  const confirmAction = (message, options = {}) => {
    return new Promise((resolve) => {
      const { confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false } = options;
      
      // Try to use existing modal first
      let modal = document.getElementById('confirmModal');
      let msgEl = document.getElementById('confirm-message');
      let btnConfirm = document.getElementById('btn-confirm-action');
      let btnCancel = document.querySelector('#confirmModal .btn-ghost');

      // Create modal if not exists
      if (!modal) {
        modal = document.createElement('dialog');
        modal.id = 'confirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <p id="confirm-message" class="modal-body"></p>
            <div class="modal-footer">
              <button type="button" class="btn-ghost" id="btn-cancel-confirm">Cancelar</button>
              <button type="button" class="btn-primary" id="btn-confirm-action">Confirmar</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        msgEl = modal.querySelector('#confirm-message');
        btnConfirm = modal.querySelector('#btn-confirm-action');
        btnCancel = modal.querySelector('#btn-cancel-confirm');
      }

      // Update content
      if (msgEl) msgEl.textContent = message;
      if (btnConfirm) {
        btnConfirm.textContent = confirmText;
        btnConfirm.className = isDanger ? 'btn-danger' : 'btn-primary';
      }
      if (btnCancel) btnCancel.textContent = cancelText;

      // Show modal
      modal.showModal();

      // Handlers
      const cleanup = () => {
        modal.close();
        btnConfirm?.removeEventListener('click', onConfirm);
        btnCancel?.removeEventListener('click', onCancel);
        modal?.removeEventListener('close', onClose);
      };

      const onConfirm = () => { cleanup(); resolve(true); };
      const onCancel = () => { cleanup(); resolve(false); };
      const onClose = () => { cleanup(); resolve(false); };

      btnConfirm?.addEventListener('click', onConfirm);
      btnCancel?.addEventListener('click', onCancel);
      modal?.addEventListener('close', onClose);
    });
  };

  /**
   * Set page state (Loading, Empty, Content)
   * Standard for FormulaMid 4 modules
   */
  const setPageState = (ui, { loading = false, empty = false }) => {
    if (!ui) return;
    
    const loader = ui.loadingState || ui.pageCardLoading;
    const content = ui.moduleContent || ui.contentWrap;
    const emptyState = ui.emptyState || ui.pageCardEmpty;

    // Toggle containers
    if (loading) {
      if (loader) loader.classList.add('is-visible');
      if (content) content.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('is-visible');
    } else if (empty) {
      if (loader) loader.classList.remove('is-visible');
      if (content) content.classList.add('hidden');
      if (emptyState) emptyState.classList.add('is-visible');
    } else {
      if (loader) loader.classList.remove('is-visible');
      if (content) content.classList.remove('hidden');
      if (emptyState) emptyState.classList.remove('is-visible');
    }
  };

  const renderStatusBadge = (statusUI) => {
    const styling = window.Constants?.STYLING?.STATUS_CLASSES || {
      pendiente: "status-warning",
      enviado: "status-info",
      aprobado: "status-success",
      recibido: "status-success",
      ready_for_approval: "status-warning",
      draft: "status-info",
    };

    const className = styling[statusUI] || "status-neutral";
    const label = String(statusUI || "UNKNOWN").toUpperCase().replace(/_/g, ' ');

    return `<span class="status-pill ${className}">${label}</span>`;
  };

  /**
   * Promise-based alert modal (informational, single OK button)
   * @param {string} message - The message to display
   * @param {string} [title] - Optional title
   * @returns {Promise<void>}
   */
  const alertModal = (message, title) => {
    return new Promise((resolve) => {
      let modal = document.getElementById('alertModal');

      if (!modal) {
        modal = document.createElement('dialog');
        modal.id = 'alertModal';
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <h3 id="alert-title" class="modal-title" style="margin-bottom:8px;"></h3>
            <p id="alert-message" class="modal-body" style="white-space:pre-wrap;"></p>
            <div class="modal-footer">
              <button type="button" class="btn-primary" id="btn-alert-ok">OK</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const titleEl = modal.querySelector('#alert-title');
      const msgEl = modal.querySelector('#alert-message');
      const btnOk = modal.querySelector('#btn-alert-ok');

      if (titleEl) titleEl.textContent = title || '';
      if (titleEl) titleEl.style.display = title ? '' : 'none';
      if (msgEl) msgEl.textContent = message;

      modal.showModal();

      const cleanup = () => {
        modal.close();
        btnOk?.removeEventListener('click', onOk);
        modal?.removeEventListener('close', onClose);
      };

      const onOk = () => { cleanup(); resolve(); };
      const onClose = () => { cleanup(); resolve(); };

      btnOk?.addEventListener('click', onOk);
      modal?.addEventListener('close', onClose);
    });
  };

  window.Utils = {
    debounce,
    numberOrNull,
    assertSbOrShowBlockingError,
    calcReplenishment,
    mapSolicitudEstadoUI,
    formatARS,
    hide,
    show,
    isHidden,
    escapeHtml,
    confirmAction,
    confirmModal: confirmAction,   // Alias used by cms-members, admin-pagos, etc.
    alertModal,                    // Informational dialog
    renderStatusBadge,
    setPageState,
  };
})();

