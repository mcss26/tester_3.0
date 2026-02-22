// Module: logistica-seguimiento.js
// Seguimiento de órdenes de compra (Fase 2)

(async function () {
  'use strict';

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(['logistico', 'admin']);
  if (!session) return;

  // 2. DOM Elements
  const ui = {
    moduleContent: document.getElementById('module-content'),
    loadingState: document.getElementById('page-card-loading'),
    emptyState: document.getElementById('page-card-empty'),
    listContainer: document.getElementById('list-container'),
    btnRefresh: document.getElementById('btn-refresh'),
    statusTabs: document.querySelectorAll('.status-tab'),
    // Panel
    panelTitle: document.getElementById('panel-title'),
    orderInfo: document.getElementById('order-info'),
    timelineList: document.getElementById('timeline-list'),
    newStatus: document.getElementById('new-status'),
    eventNotes: document.getElementById('event-notes'),
    btnAddEvent: document.getElementById('btn-add-event'),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.listContainer)) return;

  // 3. State
  let orders = [];
  let selectedOrder = null;
  let activeStatus = null;

  // 4. Panel Integration
  const panelCtrl = window.initSlidePanel({
    onOpen() { },
    onClose() {
      selectedOrder = null;
      if (ui.newStatus) ui.newStatus.value = '';
      if (ui.eventNotes) ui.eventNotes.value = '';
    }
  });

  // 6. Data Loading
  async function loadOrders() {
    Utils.setPageState(ui, { loading: true });

    try {
      // Get orders with latest tracking status
      const { data, error } = await window.sb
        .from('replenishment_supplier_orders')
        .select(`
          id, supplier_id, status, eta_date, final_cost, notes, created_at,
          master_proveedores:supplier_id (id, nombre_fantasia),
          replenishment_tracking (id, status, notes, created_at, created_by)
        `)
        .in('status', ['approved', 'ordered', 'in_transit', 'arrived', 'delivered', 'received'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      orders = (data || []).map(order => {
        // Get latest tracking status
        const tracking = order.replenishment_tracking || [];
        const latestTracking = tracking.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
        
        return {
          ...order,
          supplierName: order.master_proveedores?.nombre_fantasia || 'Sin Proveedor',
          trackingStatus: latestTracking?.status || 'ordered',
          trackingHistory: tracking.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        };
      });

      // Filter by active status tab
      const filtered = activeStatus 
        ? orders.filter(o => o.trackingStatus === activeStatus)
        : orders;

      if (filtered.length === 0) {
        Utils.setPageState(ui, { empty: true });
      } else {
        Utils.setPageState(ui, {});
        renderOrders(filtered);
      }

    } catch (err) {
      console.error('Error loading orders:', err);
      Utils.setPageState(ui, { error: true });
      window.Toast?.error('Error cargando pedidos');
    }
  }

  // 7. Render Orders
  function renderOrders(data) {
    if (!data.length) {
      ui.listContainer.innerHTML = '<div class="empty-state">No hay pedidos en este estado.</div>';
      return;
    }

    const statusConfig = {
      ordered: { label: 'ORDENADO', class: 'status-info', icon: '📋' },
      in_transit: { label: 'EN TRÁNSITO', class: 'status-warning', icon: '🚚' },
      arrived: { label: 'LLEGADO', class: 'status-success', icon: '📦' },
      delivered: { label: 'ENTREGADO', class: 'status-success', icon: '✅' },
    };

    const rows = data.map(order => {
      const cfg = statusConfig[order.trackingStatus] || statusConfig.ordered;
      const eta = order.eta_date 
        ? new Date(order.eta_date).toLocaleDateString('es-AR')
        : '-';
      const total = order.final_cost || 0;

      return `
        <tr class="table-row cursor-pointer" data-order-id="${order.id}">
          <td class="table-cell cell-pad">
            <div class="cell-strong">${window.Utils.escapeHtml(order.supplierName)}</div>
            <div class="cell-sub">#${order.id.slice(0, 8)}</div>
          </td>
          <td class="table-cell cell-pad">
            <span class="status-pill ${cfg.class}">${cfg.icon} ${cfg.label}</span>
          </td>
          <td class="table-cell cell-pad text-right">
            <div class="cell-strong">$${total.toLocaleString('es-AR')}</div>
          </td>
          <td class="table-cell cell-pad text-right">
            <div class="cell-sub">ETA: ${eta}</div>
          </td>
          <td class="table-cell cell-pad text-right">
            <button class="btn btn-ghost btn-xs btn-view" data-order-id="${order.id}">Ver →</button>
          </td>
        </tr>
      `;
    }).join('');

    ui.listContainer.innerHTML = `
      <table class="table table-sticky">
        <thead>
          <tr class="table-head">
            <th class="table-cell is-header cell-pad">Proveedor</th>
            <th class="table-cell is-header cell-pad">Estado</th>
            <th class="table-cell is-header cell-pad text-right">Total</th>
            <th class="table-cell is-header cell-pad text-right">ETA</th>
            <th class="table-cell is-header cell-pad text-right"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // 8. Open Panel with Order Details
  function openPanel(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    selectedOrder = order;
    ui.panelTitle.textContent = `Orden #${order.id.slice(0, 8)}`;

    // Order Info
    const eta = order.eta_date 
      ? new Date(order.eta_date).toLocaleDateString('es-AR')
      : 'No definida';
    const total = order.final_cost || 0;

    ui.orderInfo.innerHTML = `
      <div class="detail-grid">
        <div class="col-flex">
          <span class="text-xs muted">Proveedor</span>
          <span class="font-bold">${window.Utils.escapeHtml(order.supplierName)}</span>
        </div>
        <div class="col-flex">
          <span class="text-xs muted">ETA</span>
          <span class="font-bold">${eta}</span>
        </div>
        <div class="col-flex">
          <span class="text-xs muted">Total</span>
          <span class="font-bold">$${total.toLocaleString('es-AR')}</span>
        </div>
        <div class="col-flex">
          <span class="text-xs muted">Estado Actual</span>
          <span class="font-bold">${order.trackingStatus.toUpperCase()}</span>
        </div>
      </div>
    `;

    // Timeline
    renderTimeline(order.trackingHistory);

    // Reset form
    ui.newStatus.value = '';
    ui.eventNotes.value = '';

    panelCtrl.open();
  }

  // 9. Render Timeline
  function renderTimeline(events) {
    if (!events || events.length === 0) {
      ui.timelineList.innerHTML = '<div class="text-sm muted italic">Sin historial de estados.</div>';
      return;
    }

    const statusLabels = {
      ordered: '📋 Ordenado',
      in_transit: '🚚 En Tránsito',
      arrived: '📦 Llegado a Depósito',
      delivered: '✅ Entregado',
    };

    const items = events.map((ev, idx) => {
      const date = new Date(ev.created_at).toLocaleString('es-AR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      });
      const label = statusLabels[ev.status] || ev.status;
      const isLast = idx === events.length - 1;

      return `
        <div class="timeline-item ${isLast ? 'is-active' : ''}">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="font-bold">${label}</span>
              <span class="text-xs muted">${date}</span>
            </div>
            ${ev.notes ? `<p class="text-sm muted mt-1">${window.Utils.escapeHtml(ev.notes)}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    ui.timelineList.innerHTML = items;
  }

  // 10. Add Tracking Event
  async function addTrackingEvent() {
    if (!selectedOrder) return;

    const newStatus = ui.newStatus.value;
    const notes = ui.eventNotes.value.trim();

    if (!newStatus) {
      window.Toast?.warning('Selecciona un estado');
      return;
    }

    try {
      // Insert tracking event
      const { error: trackError } = await window.sb
        .from('replenishment_tracking')
        .insert({
          order_id: selectedOrder.id,
          status: newStatus,
          notes: notes || null,
          created_by: session.user.id,
        });

      if (trackError) throw trackError;

      // Update order status if delivered
      if (newStatus === 'delivered') {
        await window.sb
          .from('replenishment_supplier_orders')
          .update({ status: 'received' })
          .eq('id', selectedOrder.id);
      }

      window.Toast?.success('Estado actualizado');
      panelCtrl.close();
      await loadOrders();

    } catch (err) {
      console.error('Error adding tracking event:', err);
      window.Toast?.error('Error: ' + err.message);
    }
  }

  // 11. Event Handlers
  function bindEvents() {
    // Refresh
    ui.btnRefresh?.addEventListener('click', loadOrders);

    // Status tabs
    ui.statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        ui.statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeStatus = tab.dataset.status || null;
        loadOrders();
      });
    });

    // List delegation
    ui.listContainer.addEventListener('click', (e) => {
      const row = e.target.closest('[data-order-id]');
      if (row) {
        openPanel(row.dataset.orderId);
      }
    });

    // Add event button
    ui.btnAddEvent?.addEventListener('click', addTrackingEvent);
  }

  // Init
  bindEvents();
  await loadOrders();

})();
