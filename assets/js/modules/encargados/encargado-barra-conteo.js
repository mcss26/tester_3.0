// Module: encargado-barra-conteo.js
// Conteo de mercadería recibida (Fase 4)

(async function () {
  'use strict';

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(['encargado_barra', 'admin']);
  if (!session) return;

  // 2. DOM Elements
  const ui = {
    moduleContent: document.getElementById('module-content'),
    loadingState: document.getElementById('page-card-loading'),
    emptyState: document.getElementById('page-card-empty'),
    listContainer: document.getElementById('list-container'),
    btnRefresh: document.getElementById('btn-refresh'),
    statusTabs: document.querySelectorAll('.status-tab'),
    // Modal
    modalCount: document.getElementById('modal-count'),
    modalTitle: document.getElementById('modal-title'),
    receiptInfo: document.getElementById('receipt-info'),
    countItemsContainer: document.getElementById('count-items-container'),
    countNotes: document.getElementById('count-notes'),
    closeModal: document.getElementById('close-modal'),
    btnCancelCount: document.getElementById('btn-cancel-count'),
    btnConfirmCount: document.getElementById('btn-confirm-count'),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.listContainer)) return;

  // 3. State
  let receipts = [];
  let selectedReceipt = null;
  let countItems = [];
  let activeStatus = 'pending';

  // 4. Page State Helper
  function setPageState({ loading = false, empty = false } = {}) {
    if (ui.loadingState) ui.loadingState.classList.toggle('is-visible', loading);
    if (ui.emptyState) ui.emptyState.classList.toggle('is-visible', !loading && empty);
    if (ui.moduleContent) {
      ui.moduleContent.classList.toggle('hidden', loading || empty);
    }
  }

  // 5. Data Loading
  async function loadReceipts() {
    setPageState({ loading: true });

    try {
      // Load receipts with their items
      const { data, error } = await window.sb
        .from('replenishment_receipts')
        .select(`
          id, receipt_date, invoice_number, total_amount, notes, received_by,
          supplier_order_id,
          replenishment_receipt_items (
            id, sku_id, quantity_received, cost_at_receipt,
            counted_qty, counted_by, counted_at, count_notes, count_status,
            master_sku:sku_id (id, nombre)
          )
        `)
        .order('receipt_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Process and filter by status
      receipts = (data || []).map(receipt => {
        const items = receipt.replenishment_receipt_items || [];
        const pendingItems = items.filter(i => i.count_status === 'pending' || !i.count_status);
        const countedItems = items.filter(i => i.count_status === 'counted');
        const discrepancyItems = items.filter(i => i.count_status === 'discrepancy');
        
        return {
          ...receipt,
          items,
          pendingCount: pendingItems.length,
          countedCount: countedItems.length,
          discrepancyCount: discrepancyItems.length,
          overallStatus: pendingItems.length > 0 ? 'pending' : 
                         discrepancyItems.length > 0 ? 'discrepancy' : 'counted'
        };
      });

      // Filter by active status tab
      const filtered = receipts.filter(r => {
        if (activeStatus === 'pending') return r.pendingCount > 0;
        if (activeStatus === 'counted') return r.pendingCount === 0 && r.discrepancyCount === 0;
        if (activeStatus === 'discrepancy') return r.discrepancyCount > 0;
        return true;
      });

      if (filtered.length === 0) {
        setPageState({ empty: true });
      } else {
        setPageState({ loading: false, empty: false });
        renderReceipts(filtered);
      }

    } catch (err) {
      console.error('Error loading receipts:', err);
      setPageState({ loading: false, empty: false });
      ui.listContainer.innerHTML = `<div class="empty-state text-error">Error: ${err.message}</div>`;
      window.Toast?.error('Error cargando recepciones');
    }
  }

  // 6. Render Receipts
  function renderReceipts(data) {
    if (!data.length) {
      ui.listContainer.innerHTML = '<div class="empty-state">No hay recepciones en este estado.</div>';
      return;
    }

    const rows = data.map(receipt => {
      const date = new Date(receipt.receipt_date).toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      const statusClass = receipt.pendingCount > 0 ? 'status-warning' : 
                          receipt.discrepancyCount > 0 ? 'status-error' : 'status-success';
      const statusLabel = receipt.pendingCount > 0 ? `${receipt.pendingCount} pendiente(s)` :
                          receipt.discrepancyCount > 0 ? `${receipt.discrepancyCount} discrepancia(s)` : 
                          'Contado ✓';

      return `
        <tr class="table-row cursor-pointer" data-receipt-id="${receipt.id}">
          <td class="table-cell cell-pad">
            <div class="cell-strong">${window.Utils.escapeHtml(receipt.invoice_number || '#' + receipt.id.slice(0, 8))}</div>
            <div class="cell-sub">${date}</div>
          </td>
          <td class="table-cell cell-pad">
            <span class="status-pill ${statusClass}">${statusLabel}</span>
          </td>
          <td class="table-cell cell-pad text-right">
            <div class="cell-strong">${receipt.items.length} items</div>
          </td>
          <td class="table-cell cell-pad text-right">
            <button class="btn btn-ghost btn-xs btn-count" data-receipt-id="${receipt.id}">
              ${receipt.pendingCount > 0 ? 'Contar →' : 'Ver →'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    ui.listContainer.innerHTML = `
      <table class="table table-sticky">
        <thead>
          <tr class="table-head">
            <th class="table-cell is-header cell-pad">Factura/Recepción</th>
            <th class="table-cell is-header cell-pad">Estado</th>
            <th class="table-cell is-header cell-pad text-right">Items</th>
            <th class="table-cell is-header cell-pad text-right"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // 7. Open Count Modal
  function openCountModal(receiptId) {
    selectedReceipt = receipts.find(r => r.id === receiptId);
    if (!selectedReceipt) return;

    // Prepare items for counting
    countItems = selectedReceipt.items.map(item => ({
      ...item,
      sku_name: item.master_sku?.nombre || 'SKU desconocido',
      counted_qty_input: item.counted_qty ?? item.quantity_received // Default to received
    }));

    // Render receipt info
    const date = new Date(selectedReceipt.receipt_date).toLocaleDateString('es-AR');
    ui.receiptInfo.innerHTML = `
      <div class="detail-grid">
        <div class="col-flex">
          <span class="text-xs muted">Factura</span>
          <span class="font-bold">${window.Utils.escapeHtml(selectedReceipt.invoice_number || '-')}</span>
        </div>
        <div class="col-flex">
          <span class="text-xs muted">Fecha</span>
          <span class="font-bold">${date}</span>
        </div>
        <div class="col-flex">
          <span class="text-xs muted">Total Items</span>
          <span class="font-bold">${countItems.length}</span>
        </div>
      </div>
    `;

    // Render items table
    renderCountItems();

    // Reset notes
    ui.countNotes.value = '';

    // Show modal
    ui.modalCount.classList.remove('hidden');
    ui.modalCount.style.display = 'flex';
  }

  // 8. Render Count Items Table
  function renderCountItems() {
    const rows = countItems.map((item, idx) => {
      const isDiscrepancy = item.counted_qty_input !== item.quantity_received;
      const rowClass = isDiscrepancy ? 'bg-warning-subtle' : '';

      return `
        <tr class="table-row ${rowClass}">
          <td class="table-cell cell-pad">
            <div class="cell-strong">${window.Utils.escapeHtml(item.sku_name)}</div>
          </td>
          <td class="table-cell cell-pad text-center">
            <span class="font-bold">${item.quantity_received}</span>
          </td>
          <td class="table-cell cell-pad text-center">
            <input type="number" 
                   class="input input-xs w-70 count-input" 
                   data-idx="${idx}"
                   value="${item.counted_qty_input}" 
                   min="0">
          </td>
          <td class="table-cell cell-pad text-center">
            ${isDiscrepancy ? '<span class="text-warning font-bold">⚠️</span>' : '<span class="text-success">✓</span>'}
          </td>
        </tr>
      `;
    }).join('');

    ui.countItemsContainer.innerHTML = `
      <table class="table">
        <thead>
          <tr class="table-head">
            <th class="table-cell is-header cell-pad">Producto</th>
            <th class="table-cell is-header cell-pad text-center">Facturado</th>
            <th class="table-cell is-header cell-pad text-center">Contado</th>
            <th class="table-cell is-header cell-pad text-center">Estado</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    // Bind count inputs
    ui.countItemsContainer.querySelectorAll('.count-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const val = parseInt(e.target.value) || 0;
        if (countItems[idx]) {
          countItems[idx].counted_qty_input = val;
          renderCountItems(); // Re-render to update status
        }
      });
    });
  }

  // 9. Close Modal
  function closeCountModal() {
    ui.modalCount.classList.add('hidden');
    ui.modalCount.style.display = 'none';
    selectedReceipt = null;
    countItems = [];
  }

  // 10. Confirm Count
  async function confirmCount() {
    if (!selectedReceipt || countItems.length === 0) return;

    const notes = ui.countNotes.value.trim();

    try {
      // Update each item with count data
      for (const item of countItems) {
        const isDiscrepancy = item.counted_qty_input !== item.quantity_received;
        
        const { error } = await window.sb
          .from('replenishment_receipt_items')
          .update({
            counted_qty: item.counted_qty_input,
            counted_by: session.user.id,
            counted_at: new Date().toISOString(),
            count_notes: notes || null,
            count_status: isDiscrepancy ? 'discrepancy' : 'counted'
          })
          .eq('id', item.id);

        if (error) throw error;
      }

      window.Toast?.success('Conteo registrado correctamente');
      closeCountModal();
      await loadReceipts();

    } catch (err) {
      console.error('Error saving count:', err);
      window.Toast?.error('Error: ' + err.message);
    }
  }

  // 11. Event Handlers
  function bindEvents() {
    // Refresh
    ui.btnRefresh?.addEventListener('click', loadReceipts);

    // Status tabs
    ui.statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        ui.statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeStatus = tab.dataset.status || 'pending';
        loadReceipts();
      });
    });

    // List delegation
    ui.listContainer.addEventListener('click', (e) => {
      const row = e.target.closest('[data-receipt-id]');
      if (row) {
        openCountModal(row.dataset.receiptId);
      }
    });

    // Modal buttons
    ui.closeModal?.addEventListener('click', closeCountModal);
    ui.btnCancelCount?.addEventListener('click', closeCountModal);
    ui.btnConfirmCount?.addEventListener('click', confirmCount);

    // Click outside modal
    ui.modalCount?.addEventListener('click', (e) => {
      if (e.target === ui.modalCount) closeCountModal();
    });
  }

  // Init
  bindEvents();
  await loadReceipts();

})();
