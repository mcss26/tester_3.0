// Module: logistica-recepcion.js
// Recepción de mercadería de proveedores

document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.getElementById('list-container');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnNewReceipt = document.getElementById('btn-new-receipt');

    // Modal de recepción de orden
    const modalReceive = document.getElementById('modal-receive');
    const closeModal = document.getElementById('close-modal');
    const btnCancelReceive = document.getElementById('btn-cancel-receive');
    const btnConfirmReceive = document.getElementById('btn-confirm-receive');
    const receiveSupplier = document.getElementById('receive-supplier');
    const receiveEta = document.getElementById('receive-eta');
    const receiveTotal = document.getElementById('receive-total');
    const receiveInvoice = document.getElementById('receive-invoice');
    const receiveNotes = document.getElementById('receive-notes');
    const receiveItemsContainer = document.getElementById('receive-items-container');

    // Modal de recepción libre
    const modalFreeReceipt = document.getElementById('modal-free-receipt');
    const closeFreeModal = document.getElementById('close-free-modal');
    const btnCancelFree = document.getElementById('btn-cancel-free');
    const btnConfirmFree = document.getElementById('btn-confirm-free');
    const freeSupplier = document.getElementById('free-supplier');
    const freeInvoice = document.getElementById('free-invoice');
    const freeSkuSelect = document.getElementById('free-sku-select');
    const freeQty = document.getElementById('free-qty');
    const btnAddSku = document.getElementById('btn-add-sku');
    const freeItemsBody = document.getElementById('free-items-body');
    const freeNotes = document.getElementById('free-notes');

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['logistico', 'admin', 'contable']);
    if (!session) return;

    if (!window.Utils?.assertSbOrShowBlockingError?.(listContainer)) return;

    let orders = [];
    let suppliers = [];
    let skus = [];
    let activeStatus = null;
    let selectedOrder = null;
    let receiveItems = [];
    let freeItems = [];

    const loadingState = '<div class="empty-state">Cargando órdenes...</div>';
    const emptyState = '<div class="empty-state">No hay órdenes de compra.</div>';
    const errorState = (msg) => `<div class="empty-state accent">Error: ${msg}</div>`;

    // ─────────────────────────────────────────────────────────────────────────
    // Data Loading
    // ─────────────────────────────────────────────────────────────────────────

    async function loadData() {
        if (listContainer) listContainer.innerHTML = loadingState;
        try {
            let query = window.sb
                .from('replenishment_supplier_orders')
                .select(`
                    id,
                    status,
                    total_estimated,
                    expected_date,
                    notes,
                    created_at,
                    supplier_id,
                    master_proveedores!replenishment_supplier_orders_supplier_id_fkey(name)
                `)
                .order('expected_date', { ascending: true });

            if (activeStatus) {
                query = query.eq('status', activeStatus);
            } else {
                query = query.in('status', ['CONFIRMED', 'IN_TRANSIT', 'RECEIVED', 'PARTIAL']);
            }

            const { data, error } = await query;
            if (error) throw error;

            orders = (data || []).map(o => ({
                ...o,
                supplier_name: o.master_proveedores?.name || 'Proveedor desconocido'
            }));

            renderList(orders);
        } catch (err) {
            console.error('Error loading orders:', err);
            if (listContainer) listContainer.innerHTML = errorState(err.message);
        }
    }

    async function loadSuppliers() {
        try {
            const { data, error } = await window.sb
                .from('master_proveedores')
                .select('id, name')
                .eq('is_active', true)
                .order('name');
            if (error) throw error;
            suppliers = data || [];
            renderSupplierOptions();
        } catch (err) {
            console.error('Error loading suppliers:', err);
            suppliers = [];
        }
    }

    async function loadSkus() {
        try {
            const { data, error } = await window.sb
                .from('master_sku')
                .select('id, name')
                .eq('is_active', true)
                .order('name');
            if (error) throw error;
            skus = data || [];
            renderSkuOptions();
        } catch (err) {
            console.error('Error loading SKUs:', err);
            skus = [];
        }
    }

    function renderSupplierOptions() {
        if (!freeSupplier) return;
        freeSupplier.innerHTML = '<option value="">Seleccionar...</option>' +
            suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    function renderSkuOptions() {
        if (!freeSkuSelect) return;
        freeSkuSelect.innerHTML = '<option value="">Buscar SKU...</option>' +
            skus.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rendering
    // ─────────────────────────────────────────────────────────────────────────

    function getStatusPill(status) {
        const classes = {
            'PENDING': 'status-pill status-warning',
            'CONFIRMED': 'status-pill status-info',
            'IN_TRANSIT': 'status-pill status-info',
            'RECEIVED': 'status-pill status-success',
            'PARTIAL': 'status-pill status-warning',
            'CANCELLED': 'status-pill status-error'
        };
        const labels = {
            'CONFIRMED': 'Por Recibir',
            'IN_TRANSIT': 'En Camino',
            'RECEIVED': 'Recibido',
            'PARTIAL': 'Parcial'
        };
        return `<span class="${classes[status] || 'status-pill'}">${labels[status] || status}</span>`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
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
                            <th class="table-cell is-header cell-pad">Proveedor</th>
                            <th class="table-cell is-header cell-pad">Fecha Esperada</th>
                            <th class="table-cell is-header cell-pad">Total Est.</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach(order => {
            const canReceive = order.status === 'CONFIRMED' || order.status === 'IN_TRANSIT' || order.status === 'PARTIAL';
            
            html += `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong">${order.supplier_name}</td>
                    <td class="table-cell cell-pad">${formatDate(order.expected_date)}</td>
                    <td class="table-cell cell-pad muted">${formatCurrency(order.total_estimated)}</td>
                    <td class="table-cell cell-pad">${getStatusPill(order.status)}</td>
                    <td class="table-cell cell-pad">
                        ${canReceive ? `
                            <button class="btn-ghost btn-sm btn-receive" data-id="${order.id}">
                                Recibir
                            </button>
                        ` : `
                            <span class="muted">-</span>
                        `}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        listContainer.innerHTML = html;

        // Bind buttons
        listContainer.querySelectorAll('.btn-receive').forEach(btn => {
            btn.addEventListener('click', () => openReceiveModal(btn.dataset.id));
        });
    }

    function renderReceiveItems(items) {
        if (!receiveItemsContainer) return;

        // Por simplicidad, asumimos que los items vienen de replenishment_items vinculados a la orden
        // En una implementación real, habría que cargarlos desde la BD
        let html = `
            <table class="table">
                <thead>
                    <tr class="table-head">
                        <th class="table-cell is-header cell-pad">SKU</th>
                        <th class="table-cell is-header cell-pad">Esperado</th>
                        <th class="table-cell is-header cell-pad">Recibido</th>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach((item, idx) => {
            html += `
                <tr class="table-row">
                    <td class="table-cell cell-pad cell-strong">${item.sku_nombre}</td>
                    <td class="table-cell cell-pad">${item.quantity_expected}</td>
                    <td class="table-cell cell-pad">
                        <input type="number" 
                               class="input input-compact receive-qty" 
                               data-idx="${idx}"
                               value="${item.quantity_expected}" 
                               min="0"
                               style="width: 80px;">
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        receiveItemsContainer.innerHTML = html;

        // Bind quantity inputs
        receiveItemsContainer.querySelectorAll('.receive-qty').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                const val = parseInt(e.target.value) || 0;
                if (receiveItems[idx]) {
                    receiveItems[idx].quantity_received = val;
                }
            });
        });
    }

    function renderFreeItems() {
        if (!freeItemsBody) return;

        if (freeItems.length === 0) {
            freeItemsBody.innerHTML = '<tr><td colspan="3" class="table-cell cell-pad muted">No hay productos agregados</td></tr>';
            return;
        }

        freeItemsBody.innerHTML = freeItems.map((item, idx) => `
            <tr class="table-row">
                <td class="table-cell cell-pad cell-strong">${item.sku_nombre}</td>
                <td class="table-cell cell-pad">${item.quantity}</td>
                <td class="table-cell cell-pad">
                    <button class="btn-ghost btn-sm btn-remove-free" data-idx="${idx}">✕</button>
                </td>
            </tr>
        `).join('');

        // Bind remove buttons
        freeItemsBody.querySelectorAll('.btn-remove-free').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                freeItems.splice(idx, 1);
                renderFreeItems();
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Modal de Recepción de Orden
    // ─────────────────────────────────────────────────────────────────────────

    async function openReceiveModal(orderId) {
        selectedOrder = orders.find(o => o.id === orderId);
        if (!selectedOrder) return;

        // Simular items de la orden (en producción, cargar desde BD)
        // Por ahora, crear items de ejemplo basados en SKUs
        receiveItems = skus.slice(0, 5).map(sku => ({
            sku_id: sku.id,
            sku_nombre: sku.name,
            quantity_expected: Math.floor(Math.random() * 20) + 5,
            quantity_received: 0
        }));
        receiveItems.forEach(item => item.quantity_received = item.quantity_expected);

        if (receiveSupplier) receiveSupplier.textContent = selectedOrder.supplier_name;
        if (receiveEta) receiveEta.textContent = formatDate(selectedOrder.expected_date);
        if (receiveTotal) receiveTotal.textContent = formatCurrency(selectedOrder.total_estimated);
        if (receiveInvoice) receiveInvoice.value = '';
        if (receiveNotes) receiveNotes.value = '';

        renderReceiveItems(receiveItems);

        if (modalReceive) modalReceive.style.display = 'flex';
    }

    function closeReceiveModal() {
        if (modalReceive) modalReceive.style.display = 'none';
        selectedOrder = null;
        receiveItems = [];
    }

    async function confirmReceive() {
        if (!selectedOrder || receiveItems.length === 0) return;

        const invoice = receiveInvoice?.value.trim();
        const notes = receiveNotes?.value.trim();

        if (!invoice) {
            window.Toast.warning('Ingrese el número de factura o remito');
            return;
        }

        try {
            // 1. Crear registro de recepción
            const { data: receipt, error: rcptError } = await window.sb
                .from('replenishment_receipts')
                .insert({
                    supplier_order_id: selectedOrder.id,
                    received_by: session.user.id,
                    receipt_date: new Date().toISOString(),
                    invoice_number: invoice,
                    total_amount: selectedOrder.total_estimated,
                    notes: notes || null
                })
                .select()
                .single();

            if (rcptError) throw rcptError;

            // 2. Crear items de recepción y movimientos de entrada
            for (const item of receiveItems) {
                if (item.quantity_received > 0) {
                    // Item de recepción
                    await window.sb
                        .from('replenishment_receipt_items')
                        .insert({
                            receipt_id: receipt.id,
                            sku_id: item.sku_id,
                            quantity_received: item.quantity_received,
                            cost_at_receipt: 0 // Podría calcularse
                        });

                    // Movimiento de entrada
                    await window.sb
                        .from('inventory_movements')
                        .insert({
                            sku_id: item.sku_id,
                            created_by: session.user.id,
                            type: 'in',
                            quantity: item.quantity_received,
                            cost: 0,
                            notes: `Recepción ${invoice} - Orden ${selectedOrder.id.slice(0, 8)}`
                        });

                    // Actualizar stock
                    const { data: currentStock } = await window.sb
                        .from('inventory_stock')
                        .select('quantity')
                        .eq('sku_id', item.sku_id)
                        .single();

                    const newQty = (currentStock?.quantity || 0) + item.quantity_received;
                    
                    await window.sb
                        .from('inventory_stock')
                        .upsert({
                            sku_id: item.sku_id,
                            quantity: newQty,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'sku_id' });
                }
            }

            // 3. Actualizar status de la orden
            const allReceived = receiveItems.every(
                item => item.quantity_received >= item.quantity_expected
            );
            const newStatus = allReceived ? 'RECEIVED' : 'PARTIAL';

            await window.sb
                .from('replenishment_supplier_orders')
                .update({ status: newStatus })
                .eq('id', selectedOrder.id);

            window.Toast.success('Recepción registrada correctamente');
            closeReceiveModal();
            await loadData();

        } catch (err) {
            console.error('Error receiving:', err);
            window.Toast.error('Error al registrar recepción: ' + err.message);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Modal de Recepción Libre
    // ─────────────────────────────────────────────────────────────────────────

    function openFreeReceiptModal() {
        freeItems = [];
        if (freeSupplier) freeSupplier.value = '';
        if (freeInvoice) freeInvoice.value = '';
        if (freeSkuSelect) freeSkuSelect.value = '';
        if (freeQty) freeQty.value = '';
        if (freeNotes) freeNotes.value = '';
        renderFreeItems();
        if (modalFreeReceipt) modalFreeReceipt.style.display = 'flex';
    }

    function closeFreeReceiptModal() {
        if (modalFreeReceipt) modalFreeReceipt.style.display = 'none';
        freeItems = [];
    }

    function addFreeItem() {
        const skuId = freeSkuSelect?.value;
        const qty = parseInt(freeQty?.value) || 0;

        if (!skuId || qty <= 0) {
            window.Toast.warning('Seleccione un SKU y cantidad válida');
            return;
        }

        const sku = skus.find(s => s.id === skuId);
        if (!sku) return;

        // Verificar si ya existe
        const existing = freeItems.find(i => i.sku_id === skuId);
        if (existing) {
            existing.quantity += qty;
        } else {
            freeItems.push({
                sku_id: skuId,
                sku_nombre: sku.name,
                quantity: qty
            });
        }

        if (freeSkuSelect) freeSkuSelect.value = '';
        if (freeQty) freeQty.value = '';
        renderFreeItems();
    }

    async function confirmFreeReceipt() {
        if (freeItems.length === 0) {
            window.Toast.info('Agregue al menos un producto');
            return;
        }

        const supplierId = freeSupplier?.value;
        const invoice = freeInvoice?.value.trim();
        const notes = freeNotes?.value.trim();

        if (!supplierId) {
            window.Toast.warning('Seleccione un proveedor');
            return;
        }

        try {
            // 1. Crear registro de recepción sin orden
            const { data: receipt, error: rcptError } = await window.sb
                .from('replenishment_receipts')
                .insert({
                    supplier_order_id: null,
                    received_by: session.user.id,
                    receipt_date: new Date().toISOString(),
                    invoice_number: invoice || 'LIBRE-' + Date.now(),
                    total_amount: 0,
                    notes: `[RECEPCIÓN LIBRE] ${notes || ''}`
                })
                .select()
                .single();

            if (rcptError) throw rcptError;

            // 2. Procesar items
            for (const item of freeItems) {
                // Item de recepción
                await window.sb
                    .from('replenishment_receipt_items')
                    .insert({
                        receipt_id: receipt.id,
                        sku_id: item.sku_id,
                        quantity_received: item.quantity,
                        cost_at_receipt: 0
                    });

                // Movimiento de entrada
                await window.sb
                    .from('inventory_movements')
                    .insert({
                        sku_id: item.sku_id,
                        created_by: session.user.id,
                        type: 'in',
                        quantity: item.quantity,
                        cost: 0,
                        notes: `Recepción libre ${invoice || ''}`
                    });

                // Actualizar stock
                const { data: currentStock } = await window.sb
                    .from('inventory_stock')
                    .select('quantity')
                    .eq('sku_id', item.sku_id)
                    .single();

                const newQty = (currentStock?.quantity || 0) + item.quantity;
                
                await window.sb
                    .from('inventory_stock')
                    .upsert({
                        sku_id: item.sku_id,
                        quantity: newQty,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'sku_id' });
            }

            window.Toast.success('Recepción libre registrada correctamente');
            closeFreeReceiptModal();
            await loadData();

        } catch (err) {
            console.error('Error in free receipt:', err);
            window.Toast.error('Error al registrar recepción: ' + err.message);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event Handlers
    // ─────────────────────────────────────────────────────────────────────────

    if (btnRefresh) btnRefresh.addEventListener('click', () => loadData());
    if (btnNewReceipt) btnNewReceipt.addEventListener('click', openFreeReceiptModal);

    // Modal recepción orden
    if (closeModal) closeModal.addEventListener('click', closeReceiveModal);
    if (btnCancelReceive) btnCancelReceive.addEventListener('click', closeReceiveModal);
    if (btnConfirmReceive) btnConfirmReceive.addEventListener('click', confirmReceive);

    // Modal recepción libre
    if (closeFreeModal) closeFreeModal.addEventListener('click', closeFreeReceiptModal);
    if (btnCancelFree) btnCancelFree.addEventListener('click', closeFreeReceiptModal);
    if (btnConfirmFree) btnConfirmFree.addEventListener('click', confirmFreeReceipt);
    if (btnAddSku) btnAddSku.addEventListener('click', addFreeItem);

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

    // Click outside modals to close
    if (modalReceive) {
        modalReceive.addEventListener('click', (e) => {
            if (e.target === modalReceive) closeReceiveModal();
        });
    }
    if (modalFreeReceipt) {
        modalFreeReceipt.addEventListener('click', (e) => {
            if (e.target === modalFreeReceipt) closeFreeReceiptModal();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Init
    // ─────────────────────────────────────────────────────────────────────────

    await Promise.all([loadData(), loadSuppliers(), loadSkus()]);
});
