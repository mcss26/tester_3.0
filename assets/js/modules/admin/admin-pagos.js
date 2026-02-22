/**
 * Module: admin-pagos.js
 * Standard: logic-engineer (2026) — Golden Standard Aligned
 * Description: Payment & Finance Management (Admin) — Redesigned
 * Data Sources:
 *   - finance_payments (queue)
 *   - cost_definitions (unified cost catalog)
 *   - payment_methods / payment_categories (config)
 *   - master_proveedores (unified provider directory)
 */

(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'contable']);
    if (!session) return;

    const PAGE_KEY = 'admin-pagos';

    // 2. Connection Check
    if (!window.Utils?.assertSbOrShowBlockingError?.()) return;

    // 3. UI References
    const ui = {
        tabs: document.querySelectorAll('#mainTabs .tab-chip'),
        views: document.querySelectorAll('.tab-content'),
        overlay: document.getElementById('panelOverlay'),

        loadingState: document.getElementById('page-card-loading'),
        emptyState: document.getElementById('page-card-empty'),
        moduleContent: document.getElementById('module-content'),

        // KPI
        kpiPendingWeek: document.getElementById('kpiPendingWeek'),
        kpiPendingWeekAmount: document.getElementById('kpiPendingWeekAmount'),
        kpiPaidMonth: document.getElementById('kpiPaidMonth'),
        kpiPaidMonthAmount: document.getElementById('kpiPaidMonthAmount'),
        kpiOverdue: document.getElementById('kpiOverdue'),
        kpiOverdueAmount: document.getElementById('kpiOverdueAmount'),
        kpiNextDue: document.getElementById('kpiNextDue'),
        kpiNextDueLabel: document.getElementById('kpiNextDueLabel'),




        // Tables
        pendingTableBody: document.querySelector('#pendingQueueTable tbody'),
        doneTableBody: document.querySelector('#doneRecentTable tbody'),
        pedidosTableBody: document.querySelector('#pedidosTable tbody'),
        nocheTableBody: document.querySelector('#nocheDefsTable tbody'),
        fijosTableBody: document.querySelector('#fijosDefsTable tbody'),
        suppliersTableBody: document.querySelector('#suppliersTable tbody'),
        nominaTableBody: document.querySelector('#nominaTable tbody'),

        // Totals
        nominaTotalAmount: document.getElementById('nominaTotalAmount'),
        nominaTotalBadge: document.getElementById('nominaTotalBadge'),

        // Modal Pay (native <dialog>)
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
        queueSearch: document.getElementById('queueSearch'),
        supplierSearch: document.getElementById('supplierSearch'),

        configSubTabs: document.querySelectorAll('#configSubTabs .tab-chip-sm')
    };

    // 4. State
    const savedState = window.NavState?.restore(PAGE_KEY) ?? {};
    const state = {
        suppliers: [],            // from master_proveedores

        costDefinitions: [],      // from cost_definitions table
        currentTab: savedState.currentTab || 'DASHBOARD',
        configSubTab: 'RECURRENTES',
        isLoading: false
    };

    // ============================================================
    // HELPERS
    // ============================================================
    const today = () => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const fmt = (n) => window.Utils.formatARS(n || 0);
    const esc = (s) => window.Utils.escapeHtml(s || '');

    function semaforo(dueDate) {
        if (!dueDate) return '<span class="semaforo semaforo-verde"></span>';
        const due = new Date(dueDate + 'T00:00:00');
        const now = today();
        const diff = Math.ceil((due - now) / 86400000);
        if (diff < 0) return '<span class="semaforo semaforo-rojo"></span>';
        if (diff <= 3) return '<span class="semaforo semaforo-amarillo"></span>';
        return '<span class="semaforo semaforo-verde"></span>';
    }

    // ============================================================
    // 6. INIT
    // ============================================================
    async function init() {
        bindEvents();
        Utils.setPageState(ui, { loading: true });
        try {
            await loadLegacySuppliers();
            switchTab(state.currentTab);
        } catch (e) {
            console.error('Init error:', e);
            window.Toast?.error('Error inicializando módulo: ' + e.message);
        } finally {
            Utils.setPageState(ui, {});
        }
    }

    async function loadLegacySuppliers() {
        const { data } = await window.sb
            .from('master_proveedores')
            .select('id, nombre_fantasia, razon_social')
            .eq('active', true)
            .order('nombre_fantasia');

        state.suppliers = data?.map(s => ({
            id: s.id,
            name: s.nombre_fantasia || s.razon_social || 'Sin nombre'
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

    // ============================================================
    // TAB SWITCHING
    // ============================================================
    function switchTab(tabName) {
        state.currentTab = tabName;

        if (window.NavState) {
            window.NavState.save(PAGE_KEY, { currentTab: tabName });
        }

        // Update tab-chip active states
        ui.tabs.forEach(t => {
            if (t.dataset.tab === tabName) t.classList.add('active');
            else t.classList.remove('active');
        });

        // Toggle tab-content visibility
        ui.views.forEach(v => v.classList.add('hidden'));

        const vid = {
            'DASHBOARD': 'panelDashboard',
            'COLA': 'panelCola',
            'PROVEEDORES': 'panelProveedores',
            'CONFIG': 'panelConfig'
        }[tabName];

        const el = document.getElementById(vid);
        if (el) el.classList.remove('hidden');

        // Load Data per Tab
        if (tabName === 'DASHBOARD') {
            Promise.all([refreshKPIs(), loadPendingQueue(), loadRecentDone()]);
            document.getElementById('btnViewPending')?.click();
        } else if (tabName === 'COLA') {
            loadPedidos();
        } else if (tabName === 'PROVEEDORES') {
            loadProveedoresDirectory();
        } else if (tabName === 'CONFIG') {
            switchConfigSubTab(state.configSubTab);
        }
    }

    // ============================================================
    // CONFIG SUB-TAB SWITCHING
    // ============================================================
    function switchConfigSubTab(subTabName) {
        state.configSubTab = subTabName;

        // Update sub-tab chip active states
        ui.configSubTabs.forEach(btn => {
            if (btn.dataset.configtab === subTabName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Toggle sub-panel visibility
        document.querySelectorAll('#panelConfig .config-sub-panel').forEach(p => p.classList.add('hidden'));

        const panelMap = {
            'RECURRENTES': 'configRecurrentes',
            'FIJOS': 'configFijos',
            'NOMINA': 'configNomina',
            'PARAMETROS': 'configParametros'
        };
        const target = document.getElementById(panelMap[subTabName]);
        if (target) target.classList.remove('hidden');

        // Load data for the active sub-tab
        if (subTabName === 'RECURRENTES') loadCostosNoche();
        else if (subTabName === 'FIJOS') loadCostosFijos();
        else if (subTabName === 'NOMINA') loadNomina();
        else if (subTabName === 'PARAMETROS') loadParametros();
    }

    // ============================================================
    // KPI DASHBOARD
    // ============================================================
    async function refreshKPIs() {
        try {
            const now = today();
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
            const weekStr = endOfWeek.toISOString().split('T')[0];
            const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const todayStr = now.toISOString().split('T')[0];

            // Parallel fetch — 4 queries at once
            const [resPending, resPaid, resOverdue, resNext] = await Promise.all([
                window.sb.from('finance_payments').select('id, amount_total').eq('status', 'PENDING').lte('due_date', weekStr),
                window.sb.from('finance_payments').select('id, amount_total').eq('status', 'DONE').gte('done_at', firstOfMonth),
                window.sb.from('finance_payments').select('id, amount_total').in('status', ['PENDING', 'APPROVED']).lt('due_date', todayStr),
                window.sb.from('finance_payments').select('title, due_date').in('status', ['PENDING', 'APPROVED']).gte('due_date', todayStr).order('due_date').limit(1)
            ]);

            const pendingWeek = resPending.data || [];
            const paidMonth = resPaid.data || [];
            const overdue = resOverdue.data || [];
            const nextDue = resNext.data || [];

            // Pending this week
            const pendingCount = pendingWeek.length;
            const pendingSum = pendingWeek.reduce((s, p) => s + (p.amount_total || 0), 0);
            if (ui.kpiPendingWeek) ui.kpiPendingWeek.textContent = pendingCount;
            if (ui.kpiPendingWeekAmount) ui.kpiPendingWeekAmount.textContent = fmt(pendingSum);

            // Paid this month
            const paidCount = paidMonth.length;
            const paidSum = paidMonth.reduce((s, p) => s + (p.amount_total || 0), 0);
            if (ui.kpiPaidMonth) ui.kpiPaidMonth.textContent = fmt(paidSum);
            if (ui.kpiPaidMonthAmount) ui.kpiPaidMonthAmount.textContent = `${paidCount} pagos registrados`;

            // Overdue
            const overdueCount = overdue.length;
            const overdueSum = overdue.reduce((s, p) => s + (p.amount_total || 0), 0);
            if (ui.kpiOverdue) ui.kpiOverdue.textContent = overdueCount;
            if (ui.kpiOverdueAmount) ui.kpiOverdueAmount.textContent = overdueCount > 0 ? fmt(overdueSum) : '';
            const overdueCard = ui.kpiOverdue?.closest('.kpi-card');
            if (overdueCard) overdueCard.classList.toggle('kpi-card-danger', overdueCount > 0);

            // Next due
            if (nextDue.length) {
                if (ui.kpiNextDue) ui.kpiNextDue.textContent = nextDue[0].due_date;
                if (ui.kpiNextDueLabel) ui.kpiNextDueLabel.textContent = esc(nextDue[0].title);
            } else {
                if (ui.kpiNextDue) ui.kpiNextDue.textContent = '—';
                if (ui.kpiNextDueLabel) ui.kpiNextDueLabel.textContent = 'Sin pendientes';
            }

            // Notification badge
            const badge = document.getElementById('notification-count');
            if (badge) badge.textContent = overdueCount || pendingCount || '0';
            populateAlerts(overdueCount, pendingCount, nextDue[0]);
        } catch (err) {
            console.error('Refresh KPIs error:', err);
        }
    }

    // ============================================================
    // ALERT NOTIFICATIONS
    // ============================================================
    function populateAlerts(overdueCount, pendingCount, nextItem) {
        const menu = document.getElementById('notifications-menu');
        if (!menu) return;

        const header = menu.querySelector('.dropdown-header');
        const footer = menu.querySelector('.dropdown-footer');

        // Clear previous items
        menu.querySelectorAll('.notification-item').forEach(el => el.remove());

        const items = [];

        if (overdueCount > 0) {
            items.push({
                title: '⚠️ Pagos Vencidos',
                desc: `${overdueCount} pago(s) pasaron su fecha de vencimiento`,
                time: 'Urgente',
                severity: 'danger'
            });
        }

        if (pendingCount > 0) {
            items.push({
                title: '📋 Pagos Esta Semana',
                desc: `${pendingCount} pago(s) vencen en los próximos 7 días`,
                time: 'Hoy',
                severity: 'info'
            });
        }

        if (nextItem) {
            items.push({
                title: '📅 Próximo Vencimiento',
                desc: `${esc(nextItem.title)} — ${nextItem.due_date}`,
                time: 'Próximo',
                severity: 'info'
            });
        }

        if (items.length === 0) {
            items.push({
                title: '✅ Todo al día',
                desc: 'No hay alertas pendientes',
                time: '—',
                severity: 'info'
            });
        }

        const frag = document.createDocumentFragment();
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'notification-item';
            div.innerHTML = `
                <div class="notification-title">${esc(item.title)}</div>
                <div class="notification-desc">${item.desc}</div>
                <div class="notification-time">${item.time}</div>
            `;
            frag.appendChild(div);
        });

        if (header?.nextSibling) {
            header.after(frag);
        } else {
            menu.insertBefore(frag, footer);
        }
    }

    // ============================================================
    // PENDING QUEUE (Dashboard Tab)
    // ============================================================
    async function loadPendingQueue() {
        if (!ui.pendingTableBody) return;
        ui.pendingTableBody.innerHTML = '<tr><td colspan="8" class="p-8 text-center muted">Cargando pendientes...</td></tr>';

        try {
            const { data, error } = await window.sb
                .from('finance_payments')
                .select(`*, master_proveedores(nombre_fantasia, razon_social)`)
                .in('status', ['PENDING', 'APPROVED'])
                .order('due_date', { ascending: true })
                .limit(100);

            if (error || !data || data.length === 0) {
                ui.pendingTableBody.innerHTML = '<tr><td colspan="8" class="p-8 text-center muted italic">No hay pagos pendientes.</td></tr>';
                return;
            }

            ui.pendingTableBody.innerHTML = data.map(p => {
                const prov = p.master_proveedores?.nombre_fantasia || p.master_proveedores?.razon_social || '—';
                return `
                    <tr class="table-row" role="row">
                        <td class="table-cell cell-pad text-center">
                            <input type="checkbox" class="js-check-pending" value="${p.id}" aria-label="Seleccionar pago ${esc(p.title)}" />
                        </td>
                        <td class="table-cell text-center">${semaforo(p.due_date)}</td>
                        <td class="table-cell cell-pad">
                            <div class="cell-strong">${esc(p.title)}</div>
                            <div class="text-xs muted">${esc(prov)}</div>
                        </td>
                        <td class="table-cell text-center text-xs muted">${p.source_type}</td>
                        <td class="table-cell text-center font-mono text-sm">${p.due_date || '—'}</td>
                        <td class="table-cell text-right font-mono cell-strong">${fmt(p.amount_total)}</td>
                        <td class="table-cell text-center">
                            ${p.status === 'APPROVED' 
                                ? '<span class="status-pill status-info">APROBADO</span>' 
                                : '<span class="status-pill status-warning">PENDIENTE</span>'}
                        </td>
                        <td class="table-cell text-center cell-pad" style="display:flex;gap:4px;justify-content:center;">
                            ${p.status === 'PENDING' ? `<button class="btn-secondary btn-sm js-btn-approve" data-id="${p.id}">APROBAR</button>` : ''}
                            <button class="btn-primary btn-sm js-btn-pay" data-id="${p.id}">PAGAR</button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind Actions
            ui.pendingTableBody.querySelectorAll('.js-btn-pay').forEach(b => {
                b.onclick = () => openPayModal(b.dataset.id);
            });
            ui.pendingTableBody.querySelectorAll('.js-btn-approve').forEach(b => {
                b.onclick = () => approvePayment(b.dataset.id);
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
                .select(`*, master_proveedores(nombre_fantasia, razon_social)`)
                .eq('status', 'DONE')
                .order('done_at', { ascending: false })
                .limit(50);

            if (error || !data || data.length === 0) return;

            ui.doneTableBody.innerHTML = data.map(p => `
                <tr class="table-row" role="row">
                    <td class="table-cell cell-pad">
                         <div class="cell-strong">${esc(p.title)}</div>
                         <div class="text-xs muted">${esc(p.master_proveedores?.nombre_fantasia || p.master_proveedores?.razon_social || '—')}</div>
                    </td>
                    <td class="table-cell text-center text-xs muted">${p.source_type}</td>
                    <td class="table-cell text-center font-mono text-xs muted">${p.due_date}</td>
                    <td class="table-cell text-right font-mono">${fmt(p.amount_total)}</td>
                    <td class="table-cell text-center text-xs font-mono">${p.voucher_type || '-'}</td>
                    <td class="table-cell text-center text-xs">${p.payment_method || '-'}</td>
                    <td class="table-cell text-right cell-pad">
                        <button class="btn-ghost btn-sm js-btn-undo" data-id="${p.id}">DESHACER</button>
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

    // ============================================================
    // COLA DE PAGOS (Pedidos / Tab 2)
    // ============================================================
    async function loadPedidos() {
        if (!ui.pedidosTableBody) return;
        ui.pedidosTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted">Cargando cola aprobados...</td></tr>';
        try {
            const { data, error } = await window.sb
                .from('finance_payments')
                .select(`*, master_proveedores(nombre_fantasia, razon_social)`)
                .eq('status', 'APPROVED')
                .order('due_date', { ascending: true });

            if (error || !data || data.length === 0) {
                ui.pedidosTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted italic">No hay pagos aprobados en cola.</td></tr>';
                return;
            }

            ui.pedidosTableBody.innerHTML = data.map(p => {
                const prov = p.master_proveedores?.nombre_fantasia || p.master_proveedores?.razon_social || '—';
                return `
                <tr class="table-row" role="row">
                    <td class="table-cell cell-pad">${semaforo(p.due_date)}</td>
                    <td class="table-cell cell-pad">
                        <div class="cell-strong">${esc(p.title)}</div>
                        <div class="text-xs muted">${esc(prov)}</div>
                    </td>
                    <td class="table-cell text-center text-xs muted">${p.source_type}</td>
                    <td class="table-cell text-right font-mono cell-strong">${fmt(p.amount_total)}</td>
                    <td class="table-cell text-center font-mono text-sm">${p.due_date || '—'}</td>
                    <td class="table-cell text-center text-xs muted">${p.approved_at ? new Date(p.approved_at).toLocaleDateString('es-AR') : '—'}</td>
                    <td class="table-cell text-center cell-pad">
                        <button class="btn-primary btn-sm js-btn-pay-queue" data-id="${p.id}">PAGAR</button>
                    </td>
                </tr>
                `;
            }).join('');

            ui.pedidosTableBody.querySelectorAll('.js-btn-pay-queue').forEach(b => {
                b.addEventListener('click', () => openPayModal(b.dataset.id));
            });
        } catch (err) {
            console.error('Load cola error:', err);
        }
    }

    // ============================================================
    // HELPERS — Inline Editing
    // ============================================================
    const PAYMENT_METHODS = ['EFECT', 'TRANSF', 'CHEQUE', 'DEBITO', 'CRIPTO'];

    function buildSupplierOptions(selectedId) {
        const none = '<option value="">— Sin proveedor —</option>';
        return none + state.suppliers.map(s =>
            `<option value="${s.id}"${s.id === selectedId ? ' selected' : ''}>${esc(s.name)}</option>`
        ).join('');
    }

    function buildMethodOptions(selected) {
        return '<option value="">—</option>' + PAYMENT_METHODS.map(m =>
            `<option value="${m}"${m === selected ? ' selected' : ''}>${m}</option>`
        ).join('');
    }

    function toggleEditRow(rowEl, editing) {
        rowEl.querySelectorAll('.cell-read').forEach(el => el.classList.toggle('hidden', editing));
        rowEl.querySelectorAll('.cell-edit').forEach(el => el.classList.toggle('hidden', !editing));
        rowEl.querySelector('.js-actions-read')?.classList.toggle('hidden', editing);
        rowEl.querySelector('.js-actions-edit')?.classList.toggle('hidden', !editing);
    }

    async function saveInlineRow(type, id, rowEl) {
        const updates = {};
        rowEl.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            let val = input.value;
            if (field === 'base_amount' || field === 'total_with_tax' || field === 'tax_rate') val = parseFloat(val) || 0;
            if (field === 'supplier_id' && !val) val = null;
            updates[field] = val;
        });
        updates.updated_at = new Date().toISOString();

        try {
            const { error } = await window.sb.from('cost_definitions').update(updates).eq('id', id);
            if (error) throw error;
            window.Toast?.ok('Costo actualizado');
            type === 'noche' ? loadCostosNoche() : loadCostosFijos();
        } catch (err) {
            window.Toast?.error('Error: ' + err.message);
        }
    }

    async function deleteCostDef(id, type) {
        if (!await window.Utils.confirmModal('¿Eliminar este costo?')) return;
        try {
            const { error } = await window.sb.from('cost_definitions').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id);
            if (error) throw error;
            window.Toast?.ok('Costo eliminado');
            type === 'noche' ? loadCostosNoche() : loadCostosFijos();
        } catch (err) {
            window.Toast?.error('Error: ' + err.message);
        }
    }

    // ============================================================
    // COSTOS RECURRENTES — from cost_definitions (frequency='per_event')
    // ============================================================
    async function loadCostosNoche() {
        if (!ui.nocheTableBody) return;
        ui.nocheTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center muted">Cargando recurrentes...</td></tr>';

        const showInactive = document.getElementById('nocheShowInactive')?.checked;

        try {
            let q = window.sb
                .from('cost_definitions')
                .select('*, master_proveedores(nombre_fantasia)')
                .eq('frequency', 'per_event')
                .neq('category', 'COD')
                .order('title');

            if (!showInactive) q = q.eq('is_active', true);

            const { data, error } = await q;
            if (error || !data || data.length === 0) {
                ui.nocheTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center muted italic">No hay costos recurrentes.</td></tr>';
                return;
            }

            ui.nocheTableBody.innerHTML = data.map(d => {
                const amt = d.base_amount || 0;
                const prov = d.master_proveedores?.nombre_fantasia || '—';
                const meth = d.payment_method || '—';
                return `
                <tr class="table-row js-cost-row" data-id="${d.id}"${!d.is_active ? ' style="opacity:0.45"' : ''}>
                    <td class="table-cell cell-pad">
                        <span class="cell-read cell-strong">${esc(d.title)}</span>
                        <input class="cell-edit hidden input-inline" data-field="title" value="${esc(d.title)}" />
                    </td>
                    <td class="table-cell text-right">
                        <span class="cell-read font-mono text-sm">${fmt(amt)}</span>
                        <input class="cell-edit hidden input-inline input-number text-right" data-field="base_amount" type="number" step="100" value="${amt}" />
                    </td>
                    <td class="table-cell text-center">
                        <span class="cell-read text-xs">${esc(prov)}</span>
                        <select class="cell-edit hidden input-inline" data-field="supplier_id" aria-label="Proveedor de ${esc(d.title)}">${buildSupplierOptions(d.supplier_id)}</select>
                    </td>
                    <td class="table-cell text-center">
                        <span class="cell-read text-xs">${esc(meth)}</span>
                        <select class="cell-edit hidden input-inline" data-field="payment_method" aria-label="Método de pago de ${esc(d.title)}">${buildMethodOptions(d.payment_method)}</select>
                    </td>
                    <td class="table-cell text-center cell-pad">
                        <span class="js-actions-read">
                            <button class="btn-ghost btn-sm js-btn-edit-row">EDITAR</button>
                        </span>
                        <span class="js-actions-edit hidden">
                            <button class="btn-primary btn-sm js-btn-save-row">OK</button>
                            <button class="btn-ghost btn-sm js-btn-cancel-row">✕</button>
                            <button class="btn-ghost btn-sm text-danger js-btn-delete-row">🗑</button>
                        </span>
                    </td>
                </tr>`;
            }).join('');

            // Bind inline edit events
            ui.nocheTableBody.querySelectorAll('.js-cost-row').forEach(row => {
                const id = row.dataset.id;
                row.querySelector('.js-btn-edit-row')?.addEventListener('click', () => toggleEditRow(row, true));
                row.querySelector('.js-btn-cancel-row')?.addEventListener('click', () => loadCostosNoche());
                row.querySelector('.js-btn-save-row')?.addEventListener('click', () => saveInlineRow('noche', id, row));
                row.querySelector('.js-btn-delete-row')?.addEventListener('click', () => deleteCostDef(id, 'noche'));
            });

        } catch (err) {
            console.error('Load recurrentes error:', err);
        }
    }

    // ============================================================
    // COSTOS FIJOS (Tab 4) — from cost_definitions (frequency != 'PER_EVENT')
    // ============================================================
    async function loadCostosFijos() {
        if (!ui.fijosTableBody) return;
        ui.fijosTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted">Cargando costos fijos...</td></tr>';

        const showInactive = document.getElementById('fijosShowInactive')?.checked;

        try {
            let q = window.sb
                .from('cost_definitions')
                .select('*, master_proveedores(nombre_fantasia)')
                .neq('frequency', 'per_event')
                .neq('category', 'COD')
                .order('title');

            if (!showInactive) q = q.eq('is_active', true);

            const { data, error } = await q;
            if (error || !data || data.length === 0) {
                ui.fijosTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted italic">No hay costos fijos configurados.</td></tr>';
                if (ui.fijosTotalSinIva) ui.fijosTotalSinIva.textContent = fmt(0);
                if (ui.fijosTotalConIva) ui.fijosTotalConIva.textContent = fmt(0);
                return;
            }

            const TAX_OPTS = [
                { label: '0%', value: 0 },
                { label: '10.5%', value: 0.105 },
                { label: '21%', value: 0.21 },
                { label: '27%', value: 0.27 }
            ];

            let totalSinIva = 0, totalConIva = 0;
            ui.fijosTableBody.innerHTML = data.map(d => {
                const base = d.base_amount || 0;
                const total = d.total_with_tax || base;
                const taxPct = d.tax_rate ? `${(d.tax_rate * 100).toFixed(1).replace('.0', '')}%` : '—';
                const prov = d.master_proveedores?.nombre_fantasia || '—';
                const meth = d.payment_method || '—';
                if (d.is_active) { totalSinIva += base; totalConIva += total; }

                const taxOpts = TAX_OPTS.map(t =>
                    `<option value="${t.value}"${t.value === (d.tax_rate || 0) ? ' selected' : ''}>${t.label}</option>`
                ).join('');

                return `
                <tr class="table-row js-cost-row" data-id="${d.id}"${!d.is_active ? ' style="opacity:0.45"' : ''}>
                    <td class="table-cell cell-pad">
                        <span class="cell-read cell-strong">${esc(d.title)}</span>
                        <input class="cell-edit hidden input-inline" data-field="title" value="${esc(d.title)}" />
                    </td>
                    <td class="table-cell text-right">
                        <span class="cell-read font-mono text-sm">${fmt(base)}</span>
                        <input class="cell-edit hidden input-inline input-number text-right js-base" data-field="base_amount" type="number" step="100" value="${base}" />
                    </td>
                    <td class="table-cell text-center">
                        <span class="cell-read text-xs">${taxPct}</span>
                        <select class="cell-edit hidden input-inline js-tax" data-field="tax_rate" aria-label="Alícuota IVA de ${esc(d.title)}">${taxOpts}</select>
                    </td>
                    <td class="table-cell text-right">
                        <span class="cell-read font-mono text-sm font-bold">${fmt(total)}</span>
                        <input class="cell-edit hidden input-inline input-number text-right js-total" data-field="total_with_tax" type="number" step="100" value="${total}" />
                    </td>
                    <td class="table-cell text-center">
                        <span class="cell-read text-xs">${esc(prov)}</span>
                        <select class="cell-edit hidden input-inline" data-field="supplier_id" aria-label="Proveedor de ${esc(d.title)}">${buildSupplierOptions(d.supplier_id)}</select>
                    </td>
                    <td class="table-cell text-center">
                        <span class="cell-read text-xs">${esc(meth)}</span>
                        <select class="cell-edit hidden input-inline" data-field="payment_method" aria-label="Método de pago de ${esc(d.title)}">${buildMethodOptions(d.payment_method)}</select>
                    </td>
                    <td class="table-cell text-center cell-pad">
                        <span class="js-actions-read">
                            <button class="btn-ghost btn-sm js-btn-edit-row">EDITAR</button>
                        </span>
                        <span class="js-actions-edit hidden">
                            <button class="btn-primary btn-sm js-btn-save-row">OK</button>
                            <button class="btn-ghost btn-sm js-btn-cancel-row">✕</button>
                            <button class="btn-ghost btn-sm text-danger js-btn-delete-row">🗑</button>
                        </span>
                    </td>
                </tr>`;
            }).join('');

            if (ui.fijosTotalSinIva) ui.fijosTotalSinIva.textContent = fmt(totalSinIva);
            if (ui.fijosTotalConIva) ui.fijosTotalConIva.textContent = fmt(totalConIva);

            // Bind inline edit + IVA auto-calc
            ui.fijosTableBody.querySelectorAll('.js-cost-row').forEach(row => {
                const id = row.dataset.id;
                const baseIn = row.querySelector('.js-base');
                const taxIn = row.querySelector('.js-tax');
                const totalIn = row.querySelector('.js-total');

                // IVA auto-calc: base → total
                const calcTotal = () => {
                    const b = parseFloat(baseIn.value) || 0;
                    const t = parseFloat(taxIn.value) || 0;
                    totalIn.value = (b * (1 + t)).toFixed(2);
                };
                // IVA auto-calc: total → base
                const calcBase = () => {
                    const tot = parseFloat(totalIn.value) || 0;
                    const t = parseFloat(taxIn.value) || 0;
                    baseIn.value = (tot / (1 + t)).toFixed(2);
                };

                baseIn?.addEventListener('input', calcTotal);
                taxIn?.addEventListener('change', calcTotal);
                totalIn?.addEventListener('input', calcBase);

                row.querySelector('.js-btn-edit-row')?.addEventListener('click', () => toggleEditRow(row, true));
                row.querySelector('.js-btn-cancel-row')?.addEventListener('click', () => loadCostosFijos());
                row.querySelector('.js-btn-save-row')?.addEventListener('click', () => saveInlineRow('fijo', id, row));
                row.querySelector('.js-btn-delete-row')?.addEventListener('click', () => deleteCostDef(id, 'fijo'));
            });

        } catch (err) {
            console.error('Load costos fijos error:', err);
        }
    }

    // ============================================================
    // NÓMINA OPERATIVA (from master_staff_roles — mirrors tarifario)
    // ============================================================
    async function loadNomina() {
        if (!ui.nominaTableBody) return;
        ui.nominaTableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center muted">Cargando nómina...</td></tr>';

        try {
            const { data, error } = await window.sb
                .from('master_staff_roles')
                .select('id, name, area, base_rate')
                .order('area')
                .order('name');

            if (error || !data || data.length === 0) {
                ui.nominaTableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center muted italic">No hay cargos registrados en el tarifario.</td></tr>';
                if (ui.nominaTotalAmount) ui.nominaTotalAmount.textContent = fmt(0);
                if (ui.nominaTotalBadge) ui.nominaTotalBadge.textContent = 'Total: $0';
                return;
            }

            let totalNomina = 0;
            ui.nominaTableBody.innerHTML = data.map(r => {
                const rate = r.base_rate || 0;
                totalNomina += rate;
                return `
                    <tr class="table-row" role="row">
                        <td class="table-cell cell-pad cell-strong font-medium">${esc(r.name)}</td>
                        <td class="table-cell text-center text-xs muted">${esc(r.area || '—')}</td>
                        <td class="table-cell text-right font-mono text-sm font-bold">$${parseInt(rate).toLocaleString('es-AR')}</td>
                    </tr>
                `;
            }).join('');

            if (ui.nominaTotalAmount) ui.nominaTotalAmount.textContent = fmt(totalNomina);
            if (ui.nominaTotalBadge) ui.nominaTotalBadge.textContent = `Total: $${parseInt(totalNomina).toLocaleString('es-AR')}`;
        } catch (err) {
            console.error('Load nomina error:', err);
            ui.nominaTableBody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-danger">Error: ${err.message}</td></tr>`;
        }
    }

    // ============================================================
    // PARÁMETROS (Config cards — DB-backed, editable)
    // ============================================================
    async function loadParametros() {
        // ── Payment Methods ──
        const pmEl = document.getElementById('paramPayMethods');
        if (pmEl) {
            const { data: methods } = await window.sb
                .from('payment_methods')
                .select('*')
                .eq('active', true)
                .order('sort_order');

            pmEl.innerHTML = (methods || []).map(m => `
                <div class="config-list-item js-param-row" data-table="payment_methods" data-id="${m.id}">
                    <span class="cell-read">${esc(m.name)}</span>
                    <input class="cell-edit hidden input-inline" data-field="name" value="${esc(m.name)}" style="max-width:180px" />
                    <span class="js-actions-read">
                        <button class="btn-ghost btn-xs js-btn-edit-param">✎</button>
                        <button class="btn-ghost btn-xs text-danger js-btn-del-param">✕</button>
                    </span>
                    <span class="js-actions-edit hidden">
                        <button class="btn-primary btn-xs js-btn-save-param">OK</button>
                        <button class="btn-ghost btn-xs js-btn-cancel-param">↩</button>
                    </span>
                </div>
            `).join('') + `<button class="btn-ghost btn-xs mt-1 js-btn-add-param" data-table="payment_methods">+ Agregar</button>`;
        }

        // ── Voucher Types (with alícuota) ──
        const vtEl = document.getElementById('paramVoucherTypes');
        if (vtEl) {
            const { data: types } = await window.sb
                .from('payment_categories')
                .select('*')
                .eq('active', true)
                .order('id');

            const TAX_OPTS = [
                { label: '0%', value: 0 },
                { label: '10.5%', value: 0.105 },
                { label: '21%', value: 0.21 },
                { label: '27%', value: 0.27 }
            ];

            vtEl.innerHTML = (types || []).map(v => {
                const taxLabel = v.tax_rate ? `${(v.tax_rate * 100).toFixed(1).replace('.0', '')}%` : '0%';
                const taxOpts = TAX_OPTS.map(t =>
                    `<option value="${t.value}"${t.value === (v.tax_rate || 0) ? ' selected' : ''}>${t.label}</option>`
                ).join('');
                return `
                <div class="config-list-item js-param-row" data-table="payment_categories" data-id="${v.id}">
                    <span class="cell-read">${esc(v.tipo_comprobante)} <span class="muted text-xs">(${taxLabel})</span></span>
                    <input class="cell-edit hidden input-inline" data-field="tipo_comprobante" value="${esc(v.tipo_comprobante)}" style="max-width:140px" />
                    <select class="cell-edit hidden input-inline" data-field="tax_rate" aria-label="Alícuota IVA de ${esc(v.tipo_comprobante)}" style="max-width:80px">${taxOpts}</select>
                    <span class="js-actions-read">
                        <button class="btn-ghost btn-xs js-btn-edit-param">✎</button>
                        <button class="btn-ghost btn-xs text-danger js-btn-del-param">✕</button>
                    </span>
                    <span class="js-actions-edit hidden">
                        <button class="btn-primary btn-xs js-btn-save-param">OK</button>
                        <button class="btn-ghost btn-xs js-btn-cancel-param">↩</button>
                    </span>
                </div>`;
            }).join('') + `<button class="btn-ghost btn-xs mt-1 js-btn-add-param" data-table="payment_categories">+ Agregar</button>`;
        }

        // ── Tax Rates (read-only reference) ──
        const trEl = document.getElementById('paramTaxRates');
        if (trEl) {
            trEl.innerHTML = [
                { label: 'IVA 21%',   value: '21.0%' },
                { label: 'IVA 10.5%', value: '10.5%' },
                { label: 'IVA 27%',   value: '27.0%' },
                { label: 'Exento',    value: '0%' }
            ].map(t => `<div class="config-list-item">${esc(t.label)} <span class="muted text-xs">(${t.value})</span></div>`).join('');
        }

        // ── Bind param events ──
        document.getElementById('configParametros')?.querySelectorAll('.js-param-row').forEach(row => {
            const table = row.dataset.table;
            const id = row.dataset.id;

            row.querySelector('.js-btn-edit-param')?.addEventListener('click', () => {
                row.querySelectorAll('.cell-read').forEach(el => el.classList.add('hidden'));
                row.querySelectorAll('.cell-edit').forEach(el => el.classList.remove('hidden'));
                row.querySelector('.js-actions-read')?.classList.add('hidden');
                row.querySelector('.js-actions-edit')?.classList.remove('hidden');
            });

            row.querySelector('.js-btn-cancel-param')?.addEventListener('click', () => loadParametros());

            row.querySelector('.js-btn-save-param')?.addEventListener('click', async () => {
                const updates = {};
                row.querySelectorAll('[data-field]').forEach(input => {
                    let val = input.value;
                    if (input.dataset.field === 'tax_rate') val = parseFloat(val) || 0;
                    updates[input.dataset.field] = val;
                });
                updates.updated_at = new Date().toISOString();
                try {
                    const { error } = await window.sb.from(table).update(updates).eq('id', id);
                    if (error) throw error;
                    window.Toast?.ok('Parámetro actualizado');
                    loadParametros();
                } catch (err) { window.Toast?.error('Error: ' + err.message); }
            });

            row.querySelector('.js-btn-del-param')?.addEventListener('click', async () => {
                if (!await window.Utils.confirmModal('¿Eliminar este parámetro?')) return;
                try {
                    const { error } = await window.sb.from(table).update({ active: false, updated_at: new Date().toISOString() }).eq('id', id);
                    if (error) throw error;
                    window.Toast?.ok('Eliminado');
                    loadParametros();
                } catch (err) { window.Toast?.error('Error: ' + err.message); }
            });
        });

        // ── Add new param buttons ──
        document.getElementById('configParametros')?.querySelectorAll('.js-btn-add-param').forEach(btn => {
            btn.addEventListener('click', async () => {
                const table = btn.dataset.table;
                const newName = await window.Utils.promptModal(table === 'payment_methods' ? 'Nombre del método:' : 'Nombre del comprobante:');
                if (!newName?.trim()) return;
                try {
                    const row = table === 'payment_methods'
                        ? { name: newName.trim(), sort_order: 99, active: true }
                        : { tipo_comprobante: newName.trim(), tax_rate: 0, active: true };
                    const { error } = await window.sb.from(table).insert(row);
                    if (error) throw error;
                    window.Toast?.ok('Agregado');
                    loadParametros();
                } catch (err) { window.Toast?.error('Error: ' + err.message); }
            });
        });
    }

    // ============================================================
    // PROVEEDORES DIRECTORY (Tab 3) — from master_proveedores
    // ============================================================
    async function loadProveedoresDirectory() {
        if (!ui.suppliersTableBody) return;
        ui.suppliersTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted">Cargando directorio...</td></tr>';

        try {
            const { data, error } = await window.sb
                .from('master_proveedores')
                .select('*')
                .eq('active', true)
                .order('nombre_fantasia');

            if (error || !data || data.length === 0) {
                ui.suppliersTableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center muted italic">No hay proveedores registrados.</td></tr>';
                return;
            }

            state.suppliers = data; // Update main state

            ui.suppliersTableBody.innerHTML = data.map(s => `
                <tr class="table-row" role="row">
                    <td class="table-cell cell-pad font-bold text-sm">${esc(s.nombre_fantasia || s.razon_social)}</td>
                    <td class="table-cell text-center text-xs">${esc(s.category || '—')}</td>
                    <td class="table-cell text-center text-xs">${esc(s.contacto_telefono || '—')}</td>
                    <td class="table-cell text-center text-xs">${esc(s.banco || '—')}</td>
                    <td class="table-cell text-xs font-mono">${esc(s.cuit || '—')}</td>
                    <td class="table-cell text-xs font-mono">${esc(s.cbu_alias || '—')}</td>
                    <td class="table-cell text-center cell-pad">
                        <button class="btn-ghost btn-sm js-btn-view-supplier" data-id="${s.id}">VER</button>
                    </td>
                </tr>
            `).join('');

            ui.suppliersTableBody.querySelectorAll('.js-btn-view-supplier').forEach(b => {
                b.addEventListener('click', () => {
                    const sup = state.suppliers.find(s => s.id === b.dataset.id);
                    if (sup?.cbu_alias) {
                        navigator.clipboard?.writeText(sup.cbu_alias || '');
                        window.Toast?.success('CBU/Alias copiado al portapapeles');
                    } else {
                        window.Toast?.info('Sin datos bancarios registrados');
                    }
                });
            });
        } catch (err) {
            console.error('Load proveedores error:', err);
        }
    }

    // ============================================================
    // MODAL (Native <dialog>)
    // ============================================================
    async function openPayModal(id) {
        if (!id) return;
        try {
            const { data: p } = await window.sb.from('finance_payments').select('*').eq('id', id).single();
            if (!p) return;

            ui.payPaymentId.value = p.id;
            ui.payTitle.textContent = p.title;
            ui.payDue.textContent = `Vence: ${p.due_date} · Total: ${fmt(p.amount_total)}`;
            ui.payAmount.value = p.amount_total;

            // Reset amount visibility (may have been hidden by bulk)
            ui.payAmount.parentElement.style.display = '';

            ui.payModal.showModal();
        } catch (err) {
            console.error('Open pay modal error:', err);
        }
    }

    function closePayModal() {
        ui.payModal.close();
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
            refreshKPIs();
        } catch (err) {
            console.error('Confirm pay error:', err);
            window.Toast.error('Error al registrar pago: ' + err.message);
        } finally {
            ui.btnConfirmPay.disabled = false;
            ui.btnConfirmPay.classList.remove('btn-loading');
        }
    }

    async function approvePayment(id) {
        const confirmed = await window.Utils.confirmAction?.('¿Aprobar este pago y enviarlo a cola de contaduría?', { confirmText: 'Aprobar' });
        if (!confirmed) return;

        try {
            const { error } = await window.sb.rpc('admin_approve_payment', {
                p_payment_id: id,
                p_approved_by: session.user.id
            });
            if (error) throw error;
            window.Toast.success('Pago aprobado → Cola de contaduría.');
            loadPendingQueue();
            refreshKPIs();
        } catch (err) {
            console.error('Approve payment error:', err);
            window.Toast.error('Error al aprobar pago: ' + err.message);
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
            refreshKPIs();
        } catch (err) {
            console.error('Undo payment error:', err);
            window.Toast.error('Error al deshacer pago');
        }
    }

    // ============================================================
    // SAVE EXTRA (Manual ad-hoc payment)
    // ============================================================
    async function saveExtra() {
        const title = document.getElementById('extraTitle')?.value.trim();
        const dueDate = document.getElementById('extraDueDate')?.value;
        const amount = Number(document.getElementById('extraAmount')?.value);
        const supplierInput = document.getElementById('extraSupplierInput')?.value.trim();

        if (!title || !dueDate || !amount) {
            window.Toast?.warning('Completá título, vencimiento y monto.');
            return;
        }

        // Resolve supplier from datalist name
        const matched = state.suppliers.find(s => s.name === supplierInput);

        try {
            const { error } = await window.sb.from('finance_payments').insert({
                title,
                supplier_id: matched?.id || null,
                due_date: dueDate,
                amount_total: amount,
                status: 'PENDING',
                source_type: 'EXTRA',
                created_by: session.user.id
            });
            if (error) throw error;

            window.Toast?.success('Pago extra agregado a la cola.');
            closeAllPanels();
            loadPendingQueue();
            refreshKPIs();
        } catch (err) {
            console.error('Save extra error:', err);
            window.Toast?.error('Error al guardar pago extra: ' + err.message);
        }
    }

    // ============================================================
    // BULK ACTIONS
    // ============================================================
    function updateBulkUI() {
        const checked = document.querySelectorAll('.js-check-pending:checked');
        if (ui.bulkActionsWrap) {
            ui.bulkActionsWrap.classList.toggle('hidden', checked.length === 0);
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

        ui.payModal.showModal();
    }

    // ============================================================
    // PANEL MANAGEMENT
    // ============================================================
    function openPanel(panelId) {
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

    // ============================================================
    // CLIENT-SIDE SEARCH
    // ============================================================
    function filterQueueBySearch(query) {
        const q = query.toLowerCase();
        const rows = ui.pendingTableBody?.querySelectorAll('tr.table-row') || [];
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(q) ? '' : 'none';
        });
    }

    function filterSuppliersBySearch(query) {
        const q = query.toLowerCase();
        const rows = ui.suppliersTableBody?.querySelectorAll('tr.table-row') || [];
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(q) ? '' : 'none';
        });
    }

    // ============================================================
    // BIND EVENTS
    // ============================================================
    function bindEvents() {
        // Tab navigation
        ui.tabs.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        // Panel overlay click
        ui.overlay?.addEventListener('click', closeAllPanels);

        // Sub-views toggle (Pending / Done) in Dashboard
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

        // Queue search
        ui.queueSearch?.addEventListener('input', (e) => filterQueueBySearch(e.target.value));

        // Supplier search
        ui.supplierSearch?.addEventListener('input', (e) => filterSuppliersBySearch(e.target.value));

        // CONFIG sub-tabs
        ui.configSubTabs.forEach(btn => {
            btn.addEventListener('click', () => switchConfigSubTab(btn.dataset.configtab));
        });

        // Costos Noche: show inactive toggle
        document.getElementById('nocheShowInactive')?.addEventListener('change', loadCostosNoche);

        // Costos Fijos: show inactive toggle
        document.getElementById('fijosShowInactive')?.addEventListener('change', loadCostosFijos);

        // Modal Pay
        ui.btnConfirmPay?.addEventListener('click', confirmPay);
        ui.btnClosePayModal?.addEventListener('click', closePayModal);
        ui.btnCancelPay?.addEventListener('click', closePayModal);

        // Bulk pay
        document.getElementById('btnBulkPay')?.addEventListener('click', switchBulkPay);

        // Check all pending
        document.getElementById('checkAllPending')?.addEventListener('change', (e) => {
            document.querySelectorAll('.js-check-pending').forEach(c => { c.checked = e.target.checked; });
            updateBulkUI();
        });

        // New Extra payment
        document.getElementById('btnNewExtra')?.addEventListener('click', () => openPanel('extraPanel'));

        // Extra panel
        document.getElementById('btnCloseExtraPanel')?.addEventListener('click', closeAllPanels);
        document.getElementById('btnCancelExtra')?.addEventListener('click', closeAllPanels);
        document.getElementById('btnSaveExtra')?.addEventListener('click', saveExtra);

        // Config: Export costs
        document.getElementById('btnExportCosts')?.addEventListener('click', () => {
            window.Toast?.info('Exportación de costos (próximamente)');
        });

        // Empty state reload
        document.getElementById('btn-reload-empty')?.addEventListener('click', () => switchTab(state.currentTab));

        // New Supplier button
        document.getElementById('btnNewSupplier')?.addEventListener('click', () => {
            window.Toast?.info('Panel de alta de proveedor (próximamente)');
        });
    }

    function updateViewButtonsUI(mode) {
        const btnPending = document.getElementById('btnViewPending');
        const btnDone = document.getElementById('btnViewDone');

        if (mode === 'pending') {
            btnPending?.classList.replace('btn-ghost', 'btn-primary');
            btnDone?.classList.replace('btn-primary', 'btn-ghost');
        } else {
            btnDone?.classList.replace('btn-ghost', 'btn-primary');
            btnPending?.classList.replace('btn-primary', 'btn-ghost');
        }
    }



    // --- Init ---
    init();

})();
