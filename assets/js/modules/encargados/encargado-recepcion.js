/**
 * Encargado Recepción Module
 * @module encargado-recepcion
 * 
 * Lista órdenes aprobadas (vw_supplier_orders_encargado)
 * Muestra detalle de items para ajustar cantidad
 * Confirma recepción vía RPC (rpc_receive_supplier_order)
 */

(async function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. DOM References
    // ─────────────────────────────────────────────────────────────
    const ui = {
        pageLoading: document.getElementById('pageLoading'),
        pageEmpty: document.getElementById('pageEmpty'),
        pageContent: document.getElementById('pageContent'),

        // Table
        ordersBody: document.getElementById('orders-body'),

        // Modal
        modal: document.getElementById('modal'),
        modalTitle: document.getElementById('modal-title'),
        modalBody: document.getElementById('modal-body'),
        modalClose: document.getElementById('modal-close'),
        modalCancel: document.getElementById('modal-cancel'),
        modalConfirm: document.getElementById('modal-confirm'),

        // Refresh
        btnRefresh: document.getElementById('btn-refresh')
    };

    // ─────────────────────────────────────────────────────────────
    // 2. State
    // ─────────────────────────────────────────────────────────────
    let currentOrders = [];
    let currentItems = [];
    let selectedOrder = null;

    // ─────────────────────────────────────────────────────────────
    // 3. Guard & Assertions
    // ─────────────────────────────────────────────────────────────
    const session = await window.Auth.guardOrRedirect(['encargado_barra', 'admin', 'contable']);
    if (!session) return;

    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // Aliases for Utils.setPageState compat (DRY: reuse existing refs)
    ui.loadingState = ui.pageLoading;
    ui.emptyState = ui.pageEmpty;
    ui.moduleContent = ui.pageContent;

    // ─────────────────────────────────────────────────────────────
    // 4. Data Loading
    // ─────────────────────────────────────────────────────────────
    async function loadOrders() {
        Utils.setPageState(ui, { loading: true });

        try {
            const { data, error } = await window.sb
                .from('vw_supplier_orders_encargado')
                .select('*')
                .eq('status', 'approved')
                .not('eta_date', 'is', null)
                .order('eta_date', { ascending: true });

            if (error) throw error;

            currentOrders = data || [];

            if (currentOrders.length === 0) {
                Utils.setPageState(ui, { empty: true });
                return;
            }

            renderOrders(currentOrders);
            Utils.setPageState(ui, {});

        } catch (err) {
            console.error('[encargado-recepcion] Error loading orders:', err);
            window.Toast.error('Error cargando pedidos');
            Utils.setPageState(ui, { empty: true });
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Rendering
    // ─────────────────────────────────────────────────────────────
    function renderOrders(orders) {
        const html = orders.map(order => {
            const eta = order.eta_date
                ? new Date(order.eta_date).toLocaleDateString('es-AR')
                : '-';
            const hasCost = order.final_cost !== null && order.final_cost !== undefined && order.final_cost !== '';
            const costNum = hasCost ? Number(order.final_cost) : NaN;
            const cost = hasCost && Number.isFinite(costNum)
                ? window.Utils.formatARS(costNum)
                : '-';

            return `
                <tr class="table-row">
                    <td class="table-cell cell-pad">
                        <div class="font-medium">${order.proveedor || 'Desconocido'}</div>
                    </td>
                    <td class="table-cell cell-pad text-center">${order.skus_count || 0}</td>
                    <td class="table-cell cell-pad text-right font-mono">${cost}</td>
                    <td class="table-cell cell-pad text-center">${eta}</td>
                    <td class="table-cell cell-pad text-center">
                        <button class="btn-primary btn-sm" data-action="receive" data-id="${order.order_id || ''}">
                            Recibir
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        ui.ordersBody.innerHTML = html;
    }

    function renderItemsForm(items) {
        if (!items || items.length === 0) {
            ui.modalBody.innerHTML = '<div class="empty-state">Esta orden no tiene ítems.</div>';
            return;
        }

        let html = `
            <table class="table table-compact">
                <thead>
                    <tr class="table-head">
                        <th class="table-cell is-header cell-pad">Producto</th>
                        <th class="table-cell is-header cell-pad text-center">Packs Sol.</th>
                        <th class="table-cell is-header cell-pad text-center">Unidades Esp.</th>
                        <th class="table-cell is-header cell-pad text-center cell-narrow">Recibido</th>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach(item => {
            const skuName = item.master_sku?.nombre || 'Producto Desconocido';
            const packQty = item.master_sku?.pack_qty || 1;
            const reqPacks = parseFloat(item.requested_packs || 0);
            const adjPacks = parseFloat(item.adjust_packs || 0);
            const finalPacks = reqPacks + adjPacks;
            const expectedUnits = finalPacks * packQty;

            html += `
                <tr data-sku-id="${item.sku_id}">
                    <td class="table-cell cell-pad">
                        <div class="font-medium">${skuName}</div>
                        <div class="muted text-sm">x${packQty} un/pack</div>
                    </td>
                    <td class="table-cell cell-pad text-center">${finalPacks}</td>
                    <td class="table-cell cell-pad text-center font-bold">${expectedUnits}</td>
                    <td class="table-cell cell-pad text-center">
                        <input type="number" 
                               class="input input-received cell-narrow text-right" 
                               value="${expectedUnits}" 
                               min="0" 
                               step="0.01"
                               data-expected="${expectedUnits}"
                               data-sku="${item.sku_id}">
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;

        html += `
            <div class="form-group mt-md">
                <label>Notas de recepción (opcional)</label>
                <textarea id="receipt-notes" class="input" rows="2" placeholder="Ej: Faltante parcial en vodka..."></textarea>
            </div>
        `;

        ui.modalBody.innerHTML = html;
    }

    // ─────────────────────────────────────────────────────────────
    // 7. Modal Actions
    // ─────────────────────────────────────────────────────────────
    async function openReceptionModal(orderId) {
        selectedOrder = currentOrders.find(o => String(o.order_id) === String(orderId));
        if (!selectedOrder) return;

        ui.modalTitle.textContent = `Recibiendo: ${selectedOrder.proveedor}`;
        ui.modalBody.innerHTML = '<div class="loading-spinner"></div>';
        ui.modal.showModal();

        try {
            const { data, error } = await window.sb
                .from('replenishment_items')
                .select(`
                    id,
                    sku_id,
                    requested_packs,
                    adjust_packs,
                    master_sku (
                        nombre,
                        pack_qty
                    )
                `)
                .eq('supplier_order_id', orderId);

            if (error) throw error;

            currentItems = data;
            renderItemsForm(currentItems);

        } catch (err) {
            console.error('[encargado-recepcion] Error loading items:', err);
            ui.modalBody.innerHTML = '<div class="empty-state text-error">No se pudieron cargar los ítems.</div>';
        }
    }

    function closeModal() {
        ui.modal.close();
        selectedOrder = null;
        currentItems = [];
    }

    async function confirmReception() {
        if (!selectedOrder) return;

        ui.modalConfirm.disabled = true;
        ui.modalConfirm.textContent = 'Procesando...';

        try {
            const rows = document.querySelectorAll('#modal-body tr[data-sku-id]');
            if (!rows.length) {
                window.Toast.warning('Esta orden no tiene ítems para recibir.');
                closeModal();
                return;
            }

            const itemsPayload = [];
            const notesEl = document.getElementById('receipt-notes');
            const notes = notesEl ? notesEl.value : '';

            rows.forEach(row => {
                const input = row.querySelector('.input-received');
                if (!input) return;
                const skuId = row.dataset.skuId;
                if (!skuId) return;
                const expected = parseFloat(input.dataset.expected || '0');
                let received = parseFloat(input.value);
                if (!Number.isFinite(received) || received < 0) received = 0;

                itemsPayload.push({
                    sku_id: skuId,
                    expected: Number.isFinite(expected) ? expected : 0,
                    received
                });
            });

            const { error } = await window.sb.rpc('rpc_receive_supplier_order', {
                p_order_id: selectedOrder.order_id,
                p_items: itemsPayload,
                p_notes: notes || ''
            });

            if (error) throw error;

            window.Toast.success('Recepción registrada correctamente.');
            closeModal();
            await loadOrders();

        } catch (err) {
            console.error('[encargado-recepcion] Error confirming:', err);
            window.Toast.error('Error al procesar la recepción: ' + err.message);
        } finally {
            ui.modalConfirm.disabled = false;
            ui.modalConfirm.textContent = 'Confirmar Recepción';
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 8. Event Bindings
    // ─────────────────────────────────────────────────────────────
    function bindEvents() {
        // Refresh
        ui.btnRefresh?.addEventListener('click', () => loadOrders());

        // Modal close / cancel
        ui.modalClose?.addEventListener('click', closeModal);
        ui.modalCancel?.addEventListener('click', closeModal);
        ui.modal?.addEventListener('cancel', closeModal);

        // Modal confirm
        ui.modalConfirm?.addEventListener('click', confirmReception);

        // Receive buttons (event delegation)
        ui.ordersBody?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="receive"]');
            if (btn) openReceptionModal(btn.dataset.id);
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 9. Init
    // ─────────────────────────────────────────────────────────────
    bindEvents();
    await loadOrders();

})();
