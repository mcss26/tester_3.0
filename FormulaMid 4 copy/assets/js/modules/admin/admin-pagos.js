/**
 * Module: admin-pagos.js
 * Standard: logic-engineer (2026)
 * Description: Payment and Finance Management (Admin)
 */

(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'contable']);
    if (!session) return;
    
    // 2. Connection Check
    if (!window.Utils?.assertSbOrShowBlockingError?.()) return;

    // 3. UI References
    // 3. UI References
    const ui = {
        tabs: document.querySelectorAll('.filter-pill'),
        views: document.querySelectorAll('.view-container'),
        overlay: document.getElementById('panelOverlay'),
        
        loadingState: document.getElementById('page-card-loading'),
        emptyState: document.getElementById('page-card-empty'),
        moduleContent: document.getElementById('module-content'),
        
        // Panels
        panels: {
            rule: document.getElementById('rulePanel'),
            opening: document.getElementById('openingPanel'),
            extra: document.getElementById('extraPanel')
        },
        
        // Lists
        notifListDash: document.getElementById('notifListDash'),
        notifUpdatedDash: document.getElementById('notifUpdatedDash'),
        
        // Tables
        pendingTableBody: document.querySelector('#pendingQueueTable tbody'),
        doneTableBody: document.querySelector('#doneRecentTable tbody'),
        rulesTableBody: document.querySelector('#rulesTable tbody'),
        openingTableBody: document.querySelector('#openingDefsTable tbody'),
        extrasTableBody: document.querySelector('#extrasTable tbody'),
        pedidosTableBody: document.querySelector('#pedidosTable tbody'),
        
        // Modal Pay
        payModal: document.getElementById('payModal'),
        payPaymentId: document.getElementById('payPaymentId'),
        payTitle: document.getElementById('payTitle'),
        payDue: document.getElementById('payDue'),
        payAmount: document.getElementById('payAmount'),
        payVoucher: document.getElementById('payVoucher'),
        payMethod: document.getElementById('payMethod'),
        payNote: document.getElementById('payNote'),
        btnConfirmPay: document.getElementById('btnConfirmPay'),
        btnClosePayModal: document.getElementById('btnClosePayModal'),
        btnCancelPay: document.getElementById('btnCancelPay'),
        
        // Tools
        suppliersList: document.getElementById('suppliersList'),
        bulkActionsWrap: document.getElementById('bulkActionsPending'),
        bulkCount: document.getElementById('bulkCount'),
        queueSearch: document.getElementById('queueSearch')
    };

    // 4. State
    const state = {
        suppliers: [],
        currentTab: 'TODOS',
        selectedDay: null,
        isLoading: false
    };

    // 5. Logic
    async function init() {
    async function init() {
        window.Utils.setPageState(ui, { loading: true });
        try {
            await loadSuppliers();
            await refreshDashboard();
            switchTab('TODOS');
            renderCalendarMini(new Date());
            bindEvents();
        } catch (e) {
            console.error('Init error:', e);
            window.Toast?.error('Error inicializando módulo');
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    // Removed custom setPageState wrapper as we use Utils.setPageState directly now

    async function loadSuppliers() {
        const { data } = await window.sb
            .from('master_proveedores')
            .select('id, nombre, name')
            .eq('active', true)
            .order('nombre');
        
        state.suppliers = data?.map(s => ({
            id: s.id,
            name: s.nombre || s.name || 'Sin nombre'
        })) || [];
        
        if (ui.suppliersList) {
            ui.suppliersList.innerHTML = '';
            state.suppliers.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.name;
                ui.suppliersList.appendChild(opt);
            });
        }
    }

    function switchTab(tabName) {
        state.currentTab = tabName;
        ui.tabs.forEach(t => {
            if (t.dataset.tab === tabName) t.classList.add('is-active');
            else t.classList.remove('is-active');
        });
        
        ui.views.forEach(v => v.classList.add('hidden'));
        
        const vid = {
            'TODOS': 'panelCalendario',
            'PEDIDOS': 'panelPedidos',
            'APERTURA': 'panelApertura',
            'RECURRENTES': 'panelRecurrentes',
            'EXTRAS': 'panelExtras',
            'CONFIG': 'panelConfig'
        }[tabName];
        
        const el = document.getElementById(vid);
        if (el) el.classList.remove('hidden');

        // Load Data per Tab
        if (tabName === 'TODOS') {
            loadPendingQueue();
            loadRecentDone();
            document.getElementById('btnViewPending')?.click();
        } else if (tabName === 'PEDIDOS') {
            loadPedidos();
        } else if (tabName === 'RECURRENTES') {
            loadRules();
        } else if (tabName === 'APERTURA') {
            loadOpeningDefs();
        } else if (tabName === 'EXTRAS') {
            loadExtras();
        }
    }

    async function loadRules() {
        if (!ui.rulesTableBody) return;
        ui.rulesTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted">Cargando reglas...</td></tr>';
        try {
            const { data, error } = await window.sb
                .from('finance_payment_rules')
                .select(`*, master_proveedores(nombre, name)`)
                .order('title');
            
            if (error || !data || data.length === 0) {
                ui.rulesTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted italic">No hay reglas configuradas.</td></tr>';
                return;
            }

            ui.rulesTableBody.innerHTML = data.map(r => `
                <tr class="table-row">
                    <td class="table-cell cell-pad font-bold text-sm">${window.Utils.escapeHtml(r.title)}</td>
                    <td class="table-cell text-xs">${window.Utils.escapeHtml(r.master_proveedores?.nombre || r.master_proveedores?.name || '—')}</td>
                    <td class="table-cell text-center text-xs">${r.rule_type}</td>
                    <td class="table-cell text-right font-mono text-sm">${r.amount_mode === 'FIXED' ? window.Utils.formatARS(r.default_amount || 0) : 'Variable'}</td>
                    <td class="table-cell text-center text-xs">${r.day_of_month ? 'Día ' + r.day_of_month : 'Semanal'}</td>
                    <td class="table-cell text-center">
                        <span class="status-pill ${r.is_active ? 'status-success' : 'status-error'}">${r.is_active ? 'ACTIVO' : 'INACTIVO'}</span>
                    </td>
                    <td class="table-cell text-center cell-pad">
                        <button class="btn btn-ghost btn-xs" onclick="window.Toast.info('Editar regla: ${r.id}')">EDITAR</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Load rules error:', err);
        }
    }

    async function loadOpeningDefs() {
        if (!ui.openingTableBody) return;
        ui.openingTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center muted">Cargando definiciones...</td></tr>';
        try {
            const { data, error } = await window.sb
                .from('finance_opening_cost_defs')
                .select(`*, master_proveedores(nombre, name)`)
                .order('sort_order');
            
            if (error || !data || data.length === 0) {
                ui.openingTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center muted italic">No hay definiciones.</td></tr>';
                return;
            }

            ui.openingTableBody.innerHTML = data.map(d => `
                <tr class="table-row">
                    <td class="table-cell cell-pad font-bold text-sm">${window.Utils.escapeHtml(d.title)}</td>
                    <td class="table-cell text-xs">${window.Utils.escapeHtml(d.master_proveedores?.nombre || d.master_proveedores?.name || '—')}</td>
                    <td class="table-cell text-center text-xs">${d.amount_mode}</td>
                    <td class="table-cell text-right font-mono text-sm">${window.Utils.formatARS(d.default_amount || 0)}</td>
                    <td class="table-cell text-center">
                        <span class="status-pill ${d.is_active ? 'status-success' : 'status-error'}">${d.is_active ? 'ACTIVO' : 'INACTIVO'}</span>
                    </td>
                    <td class="table-cell text-center cell-pad">
                        <button class="btn btn-ghost btn-xs" onclick="window.Toast.info('Editar apertura: ${d.id}')">EDITAR</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Load opening error:', err);
        }
    }

    async function loadExtras() {
        if (!ui.extrasTableBody) return;
        ui.extrasTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center muted">Cargando extras...</td></tr>';
        try {
            const { data, error } = await window.sb
                .from('finance_payments')
                .select(`*, master_proveedores(nombre, name)`)
                .eq('source_type', 'EXTRA')
                .order('due_date', { ascending: false });
            
            if (error || !data || data.length === 0) {
                ui.extrasTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center muted italic">No se encontraron pagos extra.</td></tr>';
                return;
            }

            ui.extrasTableBody.innerHTML = data.map(e => `
                <tr class="table-row">
                    <td class="table-cell cell-pad font-bold text-sm">${window.Utils.escapeHtml(e.title)}</td>
                    <td class="table-cell text-xs">${window.Utils.escapeHtml(e.master_proveedores?.nombre || e.master_proveedores?.name || '—')}</td>
                    <td class="table-cell text-center text-xs font-mono">${e.due_date}</td>
                    <td class="table-cell text-right font-mono text-sm">${window.Utils.formatARS(e.amount_total)}</td>
                    <td class="table-cell text-center">
                        <span class="status-pill status-${e.status === 'DONE' ? 'success' : 'warning'}">${e.status}</span>
                    </td>
                    <td class="table-cell text-center cell-pad">
                        <button class="btn btn-ghost btn-xs js-btn-pay" data-id="${e.id}" ${e.status === 'DONE' ? 'disabled' : ''}>PAGAR</button>
                    </td>
                </tr>
            `).join('');
            
            ui.extrasTableBody.querySelectorAll('.js-btn-pay').forEach(b => {
                b.onclick = () => openPayModal(b.dataset.id);
            });
        } catch (err) {
            console.error('Load extras error:', err);
        }
    }

    async function loadPedidos() {
        if (!ui.pedidosTableBody) return;
        ui.pedidosTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted">Cargando pedidos...</td></tr>';
        try {
            const { data, error } = await window.sb
                .from('vw_supplier_orders_admin')
                .select('*')
                .in('estado', ['APPROVED', 'COMPLETED', 'PARTIAL_RECEIPT'])
                .order('order_id', { ascending: false });
            
            if (error || !data || data.length === 0) {
                ui.pedidosTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted italic">No hay pedidos pendientes de pago.</td></tr>';
                return;
            }

            ui.pedidosTableBody.innerHTML = data.map(o => `
                <tr class="table-row">
                    <td class="table-cell cell-pad font-mono text-xs">#${o.order_id.slice(0,8)}</td>
                    <td class="table-cell text-sm font-bold">${window.Utils.escapeHtml(o.proveedor)}</td>
                    <td class="table-cell text-center text-xs">${o.skus_count} SKUs</td>
                    <td class="table-cell text-right font-mono text-sm">${window.Utils.formatARS(o.costo_final || o.presupuesto || 0)}</td>
                    <td class="table-cell text-center text-xs font-mono">${o.fecha_eta || '—'}</td>
                    <td class="table-cell text-center">
                        <span class="status-pill status-${o.estado === 'COMPLETED' ? 'success' : 'warning'}">${o.estado}</span>
                    </td>
                    <td class="table-cell text-center cell-pad">
                        <button class="btn btn-ghost btn-xs" onclick="window.Toast.info('Detalle del pedido: ${o.order_id}')">VER</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Load pedidos error:', err);
        }
    }


    async function refreshDashboard() {
        try {
            const { count: pendingCount } = await window.sb
                .from('finance_payments')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'PENDING');
                
            if (ui.notifListDash) {
                ui.notifListDash.innerHTML = `
                    <li class="notif-item">
                        <span class="notif-text">Pagos Pendientes Total</span>
                        <span class="notif-value">${pendingCount || 0}</span>
                    </li>
                `;
            }
            if (ui.notifUpdatedDash) {
                 ui.notifUpdatedDash.textContent = 'Actualizado: ' + new Date().toLocaleTimeString();
            }
        } catch (err) {
            console.error('Refresh dashboard error:', err);
        }
    }

    async function loadPendingQueue() {
        if (!ui.pendingTableBody) return;
        ui.pendingTableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center muted">Cargando pendientes...</td></tr>';
        
        try {
            let q = window.sb
                .from('finance_payments')
                .select(`*, master_proveedores(nombre, name)`)
                .eq('status', 'PENDING')
                .order('due_date', { ascending: true })
                .limit(100);
                
            if (state.selectedDay) {
                q = q.eq('due_date', state.selectedDay);
            }

            const { data, error } = await q;
            if (error || !data || data.length === 0) {
                ui.pendingTableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center muted italic">No hay pagos pendientes.</td></tr>';
                return;
            }

            ui.pendingTableBody.innerHTML = data.map(p => {
                const prov = p.master_proveedores?.nombre || p.master_proveedores?.name || '—';
                const isOverdue = new Date(p.due_date) < new Date().setHours(0,0,0,0);
                const dateClass = isOverdue ? 'text-error font-bold' : 'muted';
                
                return `
                    <tr class="table-row">
                        <td class="table-cell cell-pad text-center">
                            <input type="checkbox" class="js-check-pending" value="${p.id}" />
                        </td>
                        <td class="table-cell cell-pad">
                            <div class="cell-strong">${window.Utils.escapeHtml(p.title)}</div>
                            <div class="text-xs muted">${window.Utils.escapeHtml(prov)}</div>
                        </td>
                        <td class="table-cell text-center text-xs muted">${p.source_type}</td>
                        <td class="table-cell text-center font-mono text-sm ${dateClass}">${p.due_date || '—'}</td>
                        <td class="table-cell text-right font-mono cell-strong">${window.Utils.formatARS(p.amount_total)}</td>
                        <td class="table-cell text-center"><span class="status-pill status-warning">PEND</span></td>
                        <td class="table-cell text-center cell-pad">
                            <button class="btn btn-primary btn-xs js-btn-pay" data-id="${p.id}">PAGAR</button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind Actions
            ui.pendingTableBody.querySelectorAll('.js-btn-pay').forEach(b => {
                b.onclick = () => openPayModal(b.dataset.id);
            });
            ui.pendingTableBody.querySelectorAll('.js-check-pending').forEach(c => {
                c.onchange = updateBulkUI;
            });
        } catch (err) {
            console.error('Load pending error:', err);
        }
    }

    async function loadRecentDone() {
        if (!ui.doneTableBody) return;
        ui.doneTableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center muted italic">No hay pagos realizados recientemente.</td></tr>';
        
        try {
            const { data, error } = await window.sb
                .from('finance_payments')
                .select(`*, master_proveedores(nombre, name)`)
                .eq('status', 'DONE')
                .order('done_at', { ascending: false })
                .limit(50);
                
            if (error || !data || data.length === 0) return;
            
            ui.doneTableBody.innerHTML = data.map(p => `
                <tr class="table-row">
                    <td class="table-cell cell-pad">
                         <div class="cell-strong">${window.Utils.escapeHtml(p.title)}</div>
                         <div class="text-xs muted">${window.Utils.escapeHtml(p.master_proveedores?.nombre || p.master_proveedores?.name || '—')}</div>
                    </td>
                    <td class="table-cell text-center text-xs muted">${p.source_type}</td>
                    <td class="table-cell text-center font-mono text-xs muted">${p.due_date}</td>
                    <td class="table-cell text-right font-mono">${window.Utils.formatARS(p.amount_total)}</td>
                    <td class="table-cell text-center text-xs font-mono">${p.voucher_type || '-'}</td>
                    <td class="table-cell text-center text-xs">${p.payment_method || '-'}</td>
                    <td class="table-cell text-right cell-pad">
                        <button class="btn btn-ghost btn-xs js-btn-undo" data-id="${p.id}">DESHACER</button>
                    </td>
                </tr>
            `).join('');

            ui.doneTableBody.querySelectorAll('.js-btn-undo').forEach(b => {
                b.onclick = () => undoPayment(b.dataset.id);
            });
        } catch (err) {
            console.error('Load recent error:', err);
        }
    }

    async function openPayModal(id) {
        if (!id) return;
        try {
            const { data: p } = await window.sb.from('finance_payments').select('*').eq('id', id).single();
            if (!p) return;
            
            ui.payPaymentId.value = p.id;
            ui.payTitle.textContent = p.title;
            ui.payDue.textContent = `Vence: ${p.due_date} · Total: ${window.Utils.formatARS(p.amount_total)}`;
            ui.payAmount.value = p.amount_total; 
            
            ui.payModal.classList.remove('hidden');
        } catch (err) {
            console.error('Open pay modal error:', err);
        }
    }

    function closePayModal() {
        ui.payModal.classList.add('hidden');
    }

    async function confirmPay() {
        const id = ui.payPaymentId.value;
        const amount = Number(ui.payAmount.value);
        const voucher = ui.payVoucher.value.trim();
        const method = ui.payMethod.value;
        const note = ui.payNote.value.trim();
        
        if (!amount || !voucher || !method) {
            window.Toast.warning('Favor completar monto, comprobante y método');
            return;
        }

        ui.btnConfirmPay.disabled = true;
        ui.btnConfirmPay.classList.add('btn-loading');
        
        try {
            // Handle Bulk logic if ID contains comma
            if (id.includes(',')) {
                const ids = id.split(',');
                for (const singID of ids) {
                    const { data: p } = await window.sb.from('finance_payments').select('amount_total').eq('id', singID).single();
                    if (p) {
                        await window.sb.rpc('admin_mark_payment_done', {
                            p_payment_id: singID,
                            p_amount: p.amount_total,
                            p_voucher: voucher,
                            p_method: method,
                            p_note: note + ' (Pago en Lote)'
                        });
                    }
                }
                window.Toast.success('Pagos en lote registrados correctamente.');
            } else {
                const { error } = await window.sb.rpc('admin_mark_payment_done', {
                    p_payment_id: id,
                    p_amount: amount,
                    p_voucher: voucher,
                    p_method: method,
                    p_note: note
                });
                if (error) throw error;
                window.Toast.success('Pago registrado correctamente.');
            }
            
            closePayModal();
            loadPendingQueue();
            loadRecentDone();
            refreshDashboard();
        } catch (err) {
             console.error('Confirm pay error:', err);
             window.Toast.error('Error al registrar pago: ' + err.message);
        } finally {
            ui.btnConfirmPay.disabled = false;
            ui.btnConfirmPay.classList.remove('btn-loading');
        }
    }

    async function undoPayment(id) {
        const confirmed = await window.Utils.confirmModal?.('¿Desea deshacer el pago y volverlo a Pendiente?', { isDanger: true });
        if (!confirmed) return;

        try {
            const { error } = await window.sb.rpc('admin_undo_payment_done', { p_payment_id: id });
            if (error) throw error;
            window.Toast.success('Pago deshecho.');
            loadPendingQueue();
            loadRecentDone();
            refreshDashboard();
        } catch (err) {
            console.error('Undo payment error:', err);
            window.Toast.error('Error al deshacer pago');
        }
    }

    function updateBulkUI() {
        const checked = document.querySelectorAll('.js-check-pending:checked');
        if (ui.bulkActionsWrap) {
            ui.bulkActionsWrap.style.display = checked.length > 0 ? 'flex' : 'none';
            if (ui.bulkCount) ui.bulkCount.textContent = `${checked.length} selecc.`;
        }
    }

    function switchBulkPay() {
        const checked = document.querySelectorAll('.js-check-pending:checked');
        if (checked.length === 0) return;
        
        const ids = Array.from(checked).map(c => c.value);
        ui.payPaymentId.value = ids.join(',');
        ui.payTitle.textContent = `Pago en Lote (${checked.length} ítems)`;
        ui.payDue.textContent = "Se utilizará el monto total original de cada ítem.";
        ui.payAmount.value = 0; 
        ui.payAmount.parentElement.style.display = 'none'; 
        
        ui.payModal.classList.remove('hidden');
    }

    // --- PANEL MANAGEMENT ---
    function openPanel(panelId, loadId = null) {
        Object.values(ui.panels).forEach(p => p?.classList.remove('open'));

        const panel = document.getElementById(panelId);
        if (!panel) return;

        const form = panel.querySelector('form');
        if (form) form.reset();

        ui.overlay?.classList.add('open');
        panel.classList.add('open');
    }

    function closeAllPanels() {
        Object.values(ui.panels).forEach(p => p?.classList.remove('open'));
        ui.overlay?.classList.remove('open');
    }

    function bindEvents() {
        ui.tabs.forEach(btn => btn.onclick = () => switchTab(btn.dataset.tab));
        ui.overlay?.addEventListener('click', closeAllPanels);

        // Sub-views buttons
        document.getElementById('btnViewPending')?.addEventListener('click', () => {
             document.getElementById('pendingQueueWrap')?.classList.remove('hidden');
             document.getElementById('doneRecentWrap')?.classList.add('hidden');
             updateViewButtonsUI('pending');
        });
        document.getElementById('btnViewDone')?.addEventListener('click', () => {
             document.getElementById('pendingQueueWrap')?.classList.add('hidden');
             document.getElementById('doneRecentWrap')?.classList.remove('hidden');
             updateViewButtonsUI('done');
        });

        // Bulk Pay
        document.getElementById('btnBulkPay')?.addEventListener('click', switchBulkPay);
        document.getElementById('checkAllPending')?.onclick = (e) => {
             document.querySelectorAll('.js-check-pending').forEach(c => c.checked = e.target.checked);
             updateBulkUI();
        };

        // Modal Actions
        ui.btnConfirmPay.onclick = confirmPay;
        ui.btnCancelPay.onclick = closePayModal;
        ui.btnClosePayModal.onclick = closePayModal;
        
        // Modal Click Outside & ESC
        ui.payModal.addEventListener('click', (e) => {
            if (e.target === ui.payModal) closePayModal();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closePayModal();
                closeAllPanels();
            }
        });

        // Panels
        document.getElementById('btnOpenRuleModal')?.onclick = () => openPanel('rulePanel');
        document.getElementById('btnCancelRule')?.onclick = closeAllPanels;
        document.getElementById('btnNewOpeningDef')?.onclick = () => openPanel('openingPanel');
        document.getElementById('btnCancelOpening')?.onclick = closeAllPanels;
        document.getElementById('btnNewExtra')?.onclick = () => openPanel('extraPanel');
        document.getElementById('btnCancelExtra')?.onclick = closeAllPanels;
        
        // Tab specific triggers
        document.getElementById('btnClearDay')?.onclick = () => {
             state.selectedDay = null;
             loadPendingQueue();
             loadRecentDone();
             window.Toast?.info('Filtrado limpiado');
        };
    }

    function updateViewButtonsUI(mode) {
        const p = document.getElementById('btnViewPending');
        const d = document.getElementById('btnViewDone');
        if (mode === 'pending') {
            p?.classList.replace('btn-ghost', 'btn-primary');
            d?.classList.replace('btn-secondary', 'btn-ghost');
        } else {
            p?.classList.replace('btn-primary', 'btn-ghost');
            d?.classList.replace('btn-ghost', 'btn-secondary');
        }
    }

    function renderCalendarMini(date) {
        const m = document.getElementById('calMonthMini');
        if (m) m.textContent = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
        const g = document.getElementById('calGridMini');
        if (g) g.innerHTML = '<div class="p-4 text-center muted italic text-xs">Calendario resumido activo</div>';
    }

    // --- Init ---
    init();

})();
