/**
 * Encargado Recepción Module
 * - Lista órdenes aprobadas (vw_supplier_orders_encargado)
 * - Muestra detalle de items para ajustar cantidad
 * - Confirma recepción vía RPC (rpc_receive_supplier_order)
 */

(function () {
    'use strict';

    // State
    let currentOrders = [];
    let currentItems = [];
    let selectedOrder = null;

    // DOM Elements
    const dom = {
        listContainer: document.getElementById('list-container'),
        modal: document.getElementById('modal'),
        modalTitle: document.getElementById('modal-title'),
        modalBody: document.getElementById('modal-body'),
        modalClose: document.getElementById('modal-close'),
        modalCancel: document.getElementById('modal-cancel'),
        modalConfirm: document.getElementById('modal-confirm')
    };

    /**
     * Init
     */
    async function init() {

            const session = await window.Auth.guardOrRedirect(['encargado_barra', 'admin', 'contable']);
            if (!session) return;

            if (!dom.listContainer) return;
            if (window.Utils?.assertSbOrShowBlockingError) {
                if (!window.Utils.assertSbOrShowBlockingError(dom.listContainer)) return;
            } else if (!window.sb) {
                dom.listContainer.innerHTML = '<div class="empty-state accent">No se pudo iniciar la conexión.</div>';
                return;
            }

            // 1. Bind Events
            bindEvents();

            // 2. Cargar lista de pedidos
            await loadOrders();
        }

        /**
         * Carga y renderiza órdenes
         */
        async function loadOrders() {
            if (!dom.listContainer) return;
            dom.listContainer.innerHTML = '<div class="loading-spinner">Cargando pedidos...</div>';

            try {
                // Consulta a la vista creada en Prompt 1
                // vw_supplier_orders_encargado filtra: approved, ordered, in_transit
                const { data, error } = await window.sb
                    .from('vw_supplier_orders_encargado')
                    .select('*')
                    .eq('status', 'approved') // Solo approved por ahora según prompt, o ampliar si se quiere ver ordered
                    .not('eta_date', 'is', null) // Solo con fecha estimada
                    .order('eta_date', { ascending: true });

                if (error) throw error;

                currentOrders = data || [];
                renderOrders(currentOrders);

            } catch (err) {
                console.error('Error cargando pedidos:', err);
                dom.listContainer.innerHTML = '<p class="error-msg">Error cargando lista de pedidos.</p>';
            }
        }

        /**
         * Render Table
         */
        function renderOrders(orders) {
            if (!orders.length) {
                dom.listContainer.innerHTML = `
                <div class="empty-state">
                    <p>No hay pedidos pendientes de recepción.</p>
                </div>`;
                return;
            }

            let html = `
            <div class="table-scroll">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Proveedor</th>
                        <th>Fecha ETA</th>
                        <th>SKUs</th>
                        <th>Costo Final</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
        `;

            orders.forEach(order => {
                const eta = order.eta_date
                    ? new Date(order.eta_date).toLocaleDateString('es-AR')
                    : '-';
                const hasCost = order.final_cost !== null && order.final_cost !== undefined && order.final_cost !== '';
                const costNum = hasCost ? Number(order.final_cost) : NaN;
                const cost = hasCost && Number.isFinite(costNum)
                    ? window.Utils.formatARS(costNum)
                    : '-';

                html += `
                <tr>
                    <td><strong>${order.proveedor || 'Desconocido'}</strong></td>
                    <td>${eta}</td>
                    <td>${order.skus_count || 0} ítems</td>
                    <td>${cost}</td>
                    <td>
                        <button class="btn-primary btn-sm btn-receive" data-id="${order.order_id || ''}">
                            Recibir
                        </button>
                    </td>
                </tr>
            `;
            });

            html += `</tbody></table></div>`;
            dom.listContainer.innerHTML = html;

            // Bind clicks dynamic
            document.querySelectorAll('.btn-receive').forEach(btn => {
                btn.addEventListener('click', () => openReceptionModal(btn.dataset.id));
            });
        }

        /**
         * Abre modal de recepción para una orden
         */
        async function openReceptionModal(orderId) {
            selectedOrder = currentOrders.find(o => String(o.order_id) === String(orderId));
            if (!selectedOrder || !dom.modal || !dom.modalBody || !dom.modalTitle) return;

            // UI Reset
            dom.modalTitle.textContent = `Recibiendo: ${selectedOrder.proveedor}`;
            dom.modalBody.innerHTML = '<div class="loading-spinner">Cargando ítems...</div>';
            dom.modal.classList.remove('hidden');

            try {
                // Fetch items con join a master_sku
                // Necesitamos: requested_packs, adjust_packs, pack_qty (sku)
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
                console.error('Error cargando items:', err);
                dom.modalBody.innerHTML = '<p class="error-msg">No se pudieron cargar los ítems.</p>';
            }
        }

        /**
         * Renderiza formulario de ítems en modal
         */
        function renderItemsForm(items) {
            if (!items || items.length === 0) {
                dom.modalBody.innerHTML = '<p>Esta orden no tiene ítems.</p>';
                return;
            }

            let html = `
            <table class="data-table table-compact">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Packs Sol.</th>
                        <th>Unidades Esp.</th>
                        <th style="width: 120px;">Recibido (Unid)</th>
                    </tr>
                </thead>
                <tbody>
        `;

            items.forEach(item => {
                const skuName = item.master_sku?.nombre || 'Producto Desconocido';
                const packQty = item.master_sku?.pack_qty || 1;

                // Expected Logic: (requested + adjustments) * pack_qty
                const reqPacks = parseFloat(item.requested_packs || 0);
                const adjPacks = parseFloat(item.adjust_packs || 0);
                const finalPacks = reqPacks + adjPacks;
                const expectedUnits = finalPacks * packQty;

                // Input default = expectedUnits
                html += `
                <tr data-sku-id="${item.sku_id}">
                    <td>
                        <div class="cell-strong">${skuName}</div>
                        <div class="muted text-sm">x${packQty} un/pack</div>
                    </td>
                    <td>${finalPacks}</td>
                    <td><strong class="cell-strong">${expectedUnits}</strong></td>
                    <td>
                        <input type="number" 
                               class="input input-compact input-received" 
                               value="${expectedUnits}" 
                               min="0" 
                               step="0.01"
                               data-expected="${expectedUnits}"
                               data-sku="${item.sku_id}"
                        >
                    </td>
                </tr>
            `;
            });

            html += `</tbody></table>`;

            // Add Notes Field
            html += `
            <div class="form-group" style="margin-top: 1rem;">
                <label>Notas de recepción (opcional)</label>
                <textarea id="receipt-notes" class="input input-full" rows="2" placeholder="Ej: Faltante parcial en vodka..."></textarea>
            </div>
        `;

            dom.modalBody.innerHTML = html;
        }

        /**
         * Confirma la recepción llamando al RPC
         */
        async function confirmReception() {
            if (!selectedOrder) return;

            const confirmBtn = dom.modalConfirm;
            if (!confirmBtn) return;
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Procesando...';

            try {
                // Construir payload
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

                // Call RPC
                const { error } = await window.sb.rpc('rpc_receive_supplier_order', {
                    p_order_id: selectedOrder.order_id,
                    p_items: itemsPayload, // Supabase client auto-converts array to jsonb
                    p_notes: notes || ''
                });

                if (error) throw error;

                window.Toast.success('Recepción registrada correctamente.');

                closeModal();
                loadOrders(); // Recargar lista

            } catch (err) {
                console.error('Error confirmando recepción:', err);
                window.Toast.error('Error al procesar la recepción: ' + err.message);
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirmar Recepción';
            }
        }

        /**
         * Helper close modal
         */
        function closeModal() {
            dom.modal.classList.add('hidden');
            selectedOrder = null;
            currentItems = [];
        }

        /**
         * Bind Global Events
         */
        function bindEvents() {
            if (dom.modalClose) dom.modalClose.addEventListener('click', closeModal);
            if (dom.modalCancel) dom.modalCancel.addEventListener('click', closeModal);
            if (dom.modalConfirm) dom.modalConfirm.addEventListener('click', confirmReception);

            // Click outside (opcional)
            window.addEventListener('click', (e) => {
                if (dom.modal && e.target === dom.modal) closeModal();
            });
        }

        // Run
        document.addEventListener('DOMContentLoaded', init);

    }) ();
