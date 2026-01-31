// Module: logistica-distribucion.js
// Gestión de pedidos de reposición y despacho a barras

document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.getElementById('list-container');
    const btnRefresh = document.getElementById('btn-refresh');
    const statusTabs = document.getElementById('status-tabs');

    // Modal elements
    const modalDispatch = document.getElementById('modal-dispatch');
    const closeModal = document.getElementById('close-modal');
    const btnCancelDispatch = document.getElementById('btn-cancel-dispatch');
    const btnConfirmDispatch = document.getElementById('btn-confirm-dispatch');
    const dispatchRequester = document.getElementById('dispatch-requester');
    const dispatchDate = document.getElementById('dispatch-date');
    const dispatchPriority = document.getElementById('dispatch-priority');
    const dispatchNotes = document.getElementById('dispatch-notes');
    const dispatchItemsContainer = document.getElementById('dispatch-items-container');

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['logistico', 'admin', 'contable']);
    if (!session) return;

    if (!window.Utils?.assertSbOrShowBlockingError?.(listContainer)) return;

    let requests = [];
    let activeStatus = null; // null = todos
    let selectedRequest = null;
    let dispatchItems = [];

    const loadingState = '<div class="empty-state">Cargando pedidos...</div>';
    const emptyState = '<div class="empty-state">No hay pedidos pendientes.</div>';
    const errorState = (msg) => `<div class="empty-state accent">Error: ${msg}</div>`;

    // ─────────────────────────────────────────────────────────────────────────
    // Data Loading
    // ─────────────────────────────────────────────────────────────────────────

    async function loadData() {
        if (listContainer) listContainer.innerHTML = loadingState;
        try {
            let query = window.sb
                .from('replenishment_requests')
                .select(`
                    id,
                    status,
                    priority,
                    desired_date,
                    notes,
                    created_at,
                    user_id,
                    profiles!replenishment_requests_user_id_fkey(full_name)
                `)
                .order('created_at', { ascending: false });

            if (activeStatus) {
                query = query.eq('status', activeStatus);
            } else {
                // Por defecto, solo mostrar PENDING y APPROVED (no histórico completo)
                query = query.in('status', ['PENDING', 'APPROVED', 'DISPATCHED']);
            }

            const { data, error } = await query;
            if (error) throw error;

            requests = (data || []).map(r => ({
                ...r,
                requester_name: r.profiles?.full_name || 'Desconocido'
            }));

            renderList(requests);
        } catch (err) {
            console.error('Error loading requests:', err);
            if (listContainer) listContainer.innerHTML = errorState(err.message);
        }
    }

    async function loadRequestItems(requestId) {
        try {
            const { data, error } = await window.sb
                .from('replenishment_items')
                .select(`
                    id,
                    sku_id,
                    quantity_requested,
                    quantity_approved,
                    status,
                    notes,
                    master_sku!replenishment_items_sku_id_fkey(id, name)
                `)
                .eq('request_id', requestId);

            if (error) throw error;

            // También cargar stock disponible para cada SKU
            const skuIds = (data || []).map(item => item.sku_id);
            const { data: stockData } = await window.sb
                .from('vw_stock_global')
                .select('sku_id, stock_actual')
                .in('sku_id', skuIds);

            const stockMap = new Map();
            (stockData || []).forEach(s => stockMap.set(s.sku_id, s.stock_actual));

            return (data || []).map(item => ({
                ...item,
                sku_nombre: item.master_sku?.name || 'SKU desconocido',
                stock_disponible: stockMap.get(item.sku_id) || 0,
                quantity_to_dispatch: item.quantity_approved || item.quantity_requested
            }));

        } catch (err) {
            console.error('Error loading items:', err);
            return [];
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rendering
    // ─────────────────────────────────────────────────────────────────────────

    function getStatusPill(status) {
        const classes = {
            'PENDING': 'status-pill status-warning',
            'APPROVED': 'status-pill status-info',
            'DISPATCHED': 'status-pill status-success',
            'PARTIAL': 'status-pill status-warning',
            'CANCELLED': 'status-pill status-error'
        };
        return `<span class="${classes[status] || 'status-pill'}">${status}</span>`;
    }

    function getPriorityIcon(priority) {
        switch (priority) {
            case 'HIGH': return '🔴';
            case 'MEDIUM': return '🟡';
            default: return '🟢';
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function renderList(data) {
        if (!listContainer) return;
        if (!data || data.length === 0) {
            listContainer.innerHTML = emptyState;
            return;
        }

        let html = `
            <div class="table-scroll">
                <table class="table">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">Prioridad</th>
                            <th class="table-cell is-header cell-pad">Solicitante</th>
                            <th class="table-cell is-header cell-pad">Fecha Deseada</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">Creado</th>
                            <th class="table-cell is-header cell-pad">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach(req => {
            const canDispatch = req.status === 'PENDING' || req.status === 'APPROVED';
            
            html += `
                <tr class="table-row">
                    <td class="table-cell cell-pad">${getPriorityIcon(req.priority)}</td>
                    <td class="table-cell cell-pad cell-strong">${req.requester_name}</td>
                    <td class="table-cell cell-pad">${formatDate(req.desired_date)}</td>
                    <td class="table-cell cell-pad">${getStatusPill(req.status)}</td>
                    <td class="table-cell cell-pad muted">${formatDate(req.created_at)}</td>
                    <td class="table-cell cell-pad">
                        ${canDispatch ? `
                            <button class="btn-ghost btn-sm btn-dispatch" data-id="${req.id}">
                                Despachar
                            </button>
                        ` : `
                            <button class="btn-ghost btn-sm btn-view" data-id="${req.id}">
                                Ver
                            </button>
                        `}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        listContainer.innerHTML = html;

        // Bind buttons
        listContainer.querySelectorAll('.btn-dispatch').forEach(btn => {
            btn.addEventListener('click', () => openDispatchModal(btn.dataset.id));
        });
        listContainer.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => openDispatchModal(btn.dataset.id, true));
        });
    }

    function renderDispatchItems(items, viewOnly = false) {
        if (!dispatchItemsContainer) return;

        let html = `
            <table class="table">
                <thead>
                    <tr class="table-head">
                        <th class="table-cell is-header cell-pad">SKU</th>
                        <th class="table-cell is-header cell-pad">Solicitado</th>
                        <th class="table-cell is-header cell-pad">Stock Disp.</th>
                        <th class="table-cell is-header cell-pad">A Despachar</th>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach((item, idx) => {
            const hasEnough = item.stock_disponible >= item.quantity_to_dispatch;
            const stockClass = hasEnough ? '' : 'text-error';

            html += `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong">${item.sku_nombre}</td>
                    <td class="table-cell cell-pad">${item.quantity_requested}</td>
                    <td class="table-cell cell-pad ${stockClass}">${item.stock_disponible}</td>
                    <td class="table-cell cell-pad">
                        ${viewOnly ? item.quantity_to_dispatch : `
                            <input type="number" 
                                   class="input input-compact dispatch-qty" 
                                   data-idx="${idx}"
                                   value="${item.quantity_to_dispatch}" 
                                   min="0" 
                                   max="${item.stock_disponible}"
                                   style="width: 80px;">
                        `}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        dispatchItemsContainer.innerHTML = html;

        // Bind quantity inputs
        if (!viewOnly) {
            dispatchItemsContainer.querySelectorAll('.dispatch-qty').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.dataset.idx);
                    const val = parseInt(e.target.value) || 0;
                    if (dispatchItems[idx]) {
                        dispatchItems[idx].quantity_to_dispatch = val;
                    }
                });
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Modal de Despacho
    // ─────────────────────────────────────────────────────────────────────────

    async function openDispatchModal(requestId, viewOnly = false) {
        selectedRequest = requests.find(r => r.id === requestId);
        if (!selectedRequest) return;

        dispatchItems = await loadRequestItems(requestId);

        if (dispatchRequester) dispatchRequester.textContent = selectedRequest.requester_name;
        if (dispatchDate) dispatchDate.textContent = formatDate(selectedRequest.desired_date);
        if (dispatchPriority) dispatchPriority.textContent = selectedRequest.priority || 'NORMAL';
        if (dispatchNotes) dispatchNotes.textContent = selectedRequest.notes || '';

        renderDispatchItems(dispatchItems, viewOnly);

        if (btnConfirmDispatch) {
            btnConfirmDispatch.style.display = viewOnly ? 'none' : 'inline-flex';
            btnConfirmDispatch.textContent = 'Confirmar Despacho';
        }

        if (modalDispatch) modalDispatch.style.display = 'flex';
    }

    function closeDispatchModal() {
        if (modalDispatch) modalDispatch.style.display = 'none';
        selectedRequest = null;
        dispatchItems = [];
    }

    async function confirmDispatch() {
        if (!selectedRequest || dispatchItems.length === 0) return;

        // Validar que hay algo para despachar
        const hasItems = dispatchItems.some(item => item.quantity_to_dispatch > 0);
        if (!hasItems) {
            window.Toast.info('No hay items para despachar');
            return;
        }

        // Validar stock suficiente
        const insufficientStock = dispatchItems.filter(
            item => item.quantity_to_dispatch > item.stock_disponible
        );
        if (insufficientStock.length > 0) {
            window.Toast.error('Stock insuficiente para algunos items');
            return;
        }

        try {
            // 1. Registrar movimientos de salida
            for (const item of dispatchItems) {
                if (item.quantity_to_dispatch > 0) {
                    const { error: movError } = await window.sb
                        .from('inventory_movements')
                        .insert({
                            sku_id: item.sku_id,
                            created_by: session.user.id,
                            type: 'out',
                            quantity: item.quantity_to_dispatch,
                            cost: 0,
                            notes: `Despacho a barra - Pedido ${selectedRequest.id.slice(0, 8)}`
                        });

                    if (movError) throw movError;

                    // Actualizar item del pedido
                    const newQty = item.stock_disponible - item.quantity_to_dispatch;
                    await window.sb
                        .from('inventory_stock')
                        .update({ quantity: newQty, updated_at: new Date().toISOString() })
                        .eq('sku_id', item.sku_id);

                    // Marcar item como despachado
                    await window.sb
                        .from('replenishment_items')
                        .update({ 
                            quantity_approved: item.quantity_to_dispatch,
                            status: 'DISPATCHED'
                        })
                        .eq('id', item.id);
                }
            }

            // 2. Actualizar status del pedido
            const allDispatched = dispatchItems.every(
                item => item.quantity_to_dispatch >= item.quantity_requested
            );
            const newStatus = allDispatched ? 'DISPATCHED' : 'PARTIAL';

            const { error: reqError } = await window.sb
                .from('replenishment_requests')
                .update({ status: newStatus })
                .eq('id', selectedRequest.id);

            if (reqError) throw reqError;

            window.Toast.success('Despacho registrado correctamente');
            closeDispatchModal();
            await loadData();

        } catch (err) {
            console.error('Error dispatching:', err);
            window.Toast.error('Error al registrar despacho: ' + err.message);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event Handlers
    // ─────────────────────────────────────────────────────────────────────────

    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => loadData());
    }

    if (closeModal) closeModal.addEventListener('click', closeDispatchModal);
    if (btnCancelDispatch) btnCancelDispatch.addEventListener('click', closeDispatchModal);
    if (btnConfirmDispatch) btnConfirmDispatch.addEventListener('click', confirmDispatch);

    // Status tabs
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('status-tab')) {
            const status = e.target.dataset.status || null;
            activeStatus = status;
            
            document.querySelectorAll('.status-tab').forEach(tab => {
                tab.classList.toggle('active', (tab.dataset.status || null) === status);
            });
            
            loadData();
        }
    });

    // Click outside modal to close
    if (modalDispatch) {
        modalDispatch.addEventListener('click', (e) => {
            if (e.target === modalDispatch) closeDispatchModal();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Init
    // ─────────────────────────────────────────────────────────────────────────

    await loadData();
});
