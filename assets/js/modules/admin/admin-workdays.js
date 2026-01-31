/**
 * Module: admin-workdays.js
 * Standard: logic-engineer (2026)
 * Description: Workday Management - ZBB Planner Dashboard (Refactored)
 */

(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'contable']);
    if (!session) return;

    // 2. UI References
    const ui = {
        moduleContent: document.getElementById('module-content'),
        loadingState: document.getElementById('page-card-loading'),

        // KPIs
        kpiStaff: document.getElementById('kpi-staff-cost'),
        kpiFixed: document.getElementById('kpi-fixed-cost'),
        kpiTotal: document.getElementById('kpi-total-cost'),
        staffSubtotal: document.getElementById('staff-subtotal'),
        costsSubtotal: document.getElementById('costs-subtotal'),

        // Panels
        inputDate: document.getElementById('input-date'),
        selectEvent: document.getElementById('select-event'),
        checkHighDemand: document.getElementById('check-high-demand'),
        staffContainer: document.getElementById('staff-container'),
        costsContainer: document.getElementById('costs-container'),
        inputNotes: document.getElementById('input-notes'),
        statusIndicator: document.getElementById('workday-status-indicator'),

        // Actions
        btnConfirm: document.getElementById('btn-confirm-jornada'),
        btnHistory: document.getElementById('btn-back-list'),

        // Slide Panel (History)
        panelInstance: null,
        historyContainer: document.getElementById('history-container'),

        // Countdown Config
        selectCountdownEvent: document.getElementById('select-countdown-event'),
        btnSaveCountdown: document.getElementById('btn-save-countdown'),

        // Event Modal
        btnNewEvent: document.getElementById('btn-new-event'),
        createEventModal: document.getElementById('createEventModal'),
        inputEventName: document.getElementById('input-event-name'),
        inputEventDate: document.getElementById('input-event-date'),
        inputEventQrQty: document.getElementById('input-event-qr-qty'),
        btnCancelEventModal: document.getElementById('btnCancelEventModal'),
        btnCreateEvent: document.getElementById('btnCreateEvent')
    };

    // Validation
    if (!window.Utils.assertSbOrShowBlockingError(ui.moduleContent)) return;

    // 3. State
    const state = {
        roles: [],
        openingCosts: [],
        events: [],
        staffPlan: {}, // { roleId: quantity }
        costsPlan: {}, // { costId: { amount, isAdjusted } }
        history: [],
        isLoading: false,
        currentCountdownEventId: null
    };

    // 4. Initialization
    async function init() {
        // Init Slide Panel for History
        if (window.initSlidePanel) {
            ui.panelInstance = window.initSlidePanel({
                panelId: 'slide-panel',
                overlayId: 'panel-overlay'
            });
        }

        bindEvents();
        await loadInitialData();
        
        // Default today's date if empty
        if (!ui.inputDate.value) {
            ui.inputDate.value = new Date().toISOString().split('T')[0];
        }
    }

    // 5. Event Binding
    function bindEvents() {
        // History Panel
        ui.btnHistory?.addEventListener('click', () => {
            renderHistory();
            ui.panelInstance?.open();
        });

        // History Item Click (Event Delegation)
        ui.historyContainer?.addEventListener('click', (e) => {
            const btn = e.target.closest('.js-view-workday');
            if (btn) {
                // For now, reload page - in future could load specific workday
                window.location.reload();
            }
        });

        // KPI Recalculation on Inputs
        ui.staffContainer?.addEventListener('input', (e) => {
            if (e.target.dataset.roleId) {
                const roleId = e.target.dataset.roleId;
                const qty = parseInt(e.target.value) || 0;
                state.staffPlan[roleId] = qty;
                calculateTotals();
            }
        });

        ui.costsContainer?.addEventListener('input', (e) => {
            if (e.target.dataset.costId) {
                const costId = e.target.dataset.costId;
                const amount = parseFloat(e.target.value) || 0;
                const def = state.openingCosts.find(c => c.id === costId);
                state.costsPlan[costId] = {
                    amount,
                    isAdjusted: amount !== (def?.default_amount || 0)
                };
                calculateTotals();
            }
        });

        // Reset Cost Button (Event Delegation)
        ui.costsContainer?.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-reset-cost');
            if (btn) {
                const costId = btn.dataset.id;
                const def = state.openingCosts.find(c => c.id === costId);
                const input = ui.costsContainer.querySelector(`input[data-cost-id="${costId}"]`);
                if (input && def) {
                    input.value = def.default_amount;
                    state.costsPlan[costId] = { amount: def.default_amount, isAdjusted: false };
                    calculateTotals();
                }
            }
        });

        // Confirm Action
        ui.btnConfirm?.addEventListener('click', handleConfirm);

        // Countdown Config
        ui.btnSaveCountdown?.addEventListener('click', saveCountdownEvent);

        // Event Modal
        ui.btnNewEvent?.addEventListener('click', openEventModal);
        ui.btnCancelEventModal?.addEventListener('click', closeEventModal);
        ui.btnCreateEvent?.addEventListener('click', handleCreateEvent);
        ui.createEventModal?.addEventListener('click', (e) => {
            if (e.target === ui.createEventModal) closeEventModal();
        });
    }

    // 6. Data Fetching
    async function loadInitialData() {
        window.Utils.setPageState(ui, { loading: true });

        try {
            const [rolesRes, costsRes, eventsRes, historyRes, countdownRes] = await Promise.all([
                window.sb.from('master_staff_roles').select('*').eq('active', true).order('name'),
                window.sb.from('finance_opening_cost_defs').select('*').eq('is_active', true).order('sort_order'),
                window.sb.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(15),
                window.WorkDayHelper.getWorkDaySummary(),
                window.sb.from('site_config').select('url').eq('key', 'next_event_id').maybeSingle()
            ]);

            if (rolesRes.error) throw rolesRes.error;
            if (costsRes.error) throw costsRes.error;
            if (eventsRes.error) throw eventsRes.error;

            state.roles = rolesRes.data || [];
            state.openingCosts = costsRes.data || [];
            state.events = eventsRes.data || [];
            state.history = flattenHistory(historyRes);
            state.currentCountdownEventId = countdownRes?.data?.url || null;

            // Initialize plans
            state.roles.forEach(r => state.staffPlan[r.id] = 0);
            state.openingCosts.forEach(c => {
                state.costsPlan[c.id] = { amount: c.default_amount, isAdjusted: false };
            });

            renderPanels();
        } catch (e) {
            console.error('Error loading initial data:', e);
            window.Toast.error('Error al cargar datos operativos.');
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    function flattenHistory(summary) {
        if (!summary) return [];
        const list = [];
        if (summary.open_day) list.push({ ...summary.open_day, _status: 'open' });
        if (summary.planned_days) summary.planned_days.forEach(d => list.push({ ...d, _status: 'planning' }));
        if (summary.closed_days) summary.closed_days.forEach(d => list.push({ ...d, _status: 'closed' }));
        return list;
    }

    // 7. Rendering
    function renderPanels() {
        renderEventsDropdown();
        renderCountdownDropdown();
        renderStaffList();
        renderCostsList();
        calculateTotals();
    }

    function renderEventsDropdown() {
        if (!ui.selectEvent) return;
        const options = state.events.map(ev => `
            <option value="${ev.id}">${window.Utils.escapeHtml(ev.name)} (${window.WorkDayHelper.formatDate(ev.date)})</option>
        `).join('');
        ui.selectEvent.innerHTML = '<option value="">-- Sin Evento Vinculado --</option>' + options;
    }

    function renderCountdownDropdown() {
        if (!ui.selectCountdownEvent) return;
        const options = state.events.map(ev => `
            <option value="${ev.id}" ${ev.id === state.currentCountdownEventId ? 'selected' : ''}>
                ${window.Utils.escapeHtml(ev.name)} (${window.WorkDayHelper.formatDate(ev.date)})
            </option>
        `).join('');
        ui.selectCountdownEvent.innerHTML = '<option value="">-- Sin countdown --</option>' + options;
    }

    function renderStaffList() {
        if (!ui.staffContainer) return;
        if (state.roles.length === 0) {
            ui.staffContainer.innerHTML = '<p class="faint p-4 text-center">No hay roles activos.</p>';
            return;
        }

        ui.staffContainer.innerHTML = state.roles.map(role => `
            <div class="planner-item">
                <div class="item-info">
                    <span class="item-name">${window.Utils.escapeHtml(role.name)}</span>
                    <span class="item-meta">${window.Utils.formatARS(role.base_rate)} / jornada</span>
                </div>
                <div class="item-controls">
                    <input type="number" min="0" max="99" value="0" 
                        class="input input-compact text-center w-70"
                        data-role-id="${role.id}">
                    <span class="badge badge-quiet text-xs" style="min-width: 80px; text-align: right;">
                        ${window.Utils.formatARS(0)}
                    </span>
                </div>
            </div>
        `).join('');
    }

    function renderCostsList() {
        if (!ui.costsContainer) return;
        if (state.openingCosts.length === 0) {
            ui.costsContainer.innerHTML = '<p class="faint p-4 text-center">No hay costos de apertura definidos.</p>';
            return;
        }

        ui.costsContainer.innerHTML = state.openingCosts.map(cost => `
            <div class="planner-item">
                <div class="item-info">
                    <span class="item-name">${window.Utils.escapeHtml(cost.title)}</span>
                    <span class="item-meta">Default: ${window.Utils.formatARS(cost.default_amount)}</span>
                </div>
                <div class="item-controls">
                    <input type="number" min="0" value="${cost.default_amount}" 
                        class="input input-compact text-center w-200"
                        data-cost-id="${cost.id}">
                    <button class="btn-icon btn-xs btn-reset-cost" data-id="${cost.id}" title="Restaurar default">↺</button>
                </div>
            </div>
        `).join('');
    }

    // 8. Logic & Calculations
    function calculateTotals() {
        let staffTotal = 0;
        let fixedTotal = 0;

        // Staff
        state.roles.forEach(role => {
            const qty = state.staffPlan[role.id] || 0;
            const sub = qty * role.base_rate;
            staffTotal += sub;
            
            // Update row badge if visible
            const input = ui.staffContainer.querySelector(`input[data-role-id="${role.id}"]`);
            if (input) {
                const badge = input.nextElementSibling;
                if (badge) badge.textContent = window.Utils.formatARS(sub);
            }
        });

        // Fixed
        Object.values(state.costsPlan).forEach(plan => {
            fixedTotal += plan.amount;
        });

        // Update UI
        ui.staffSubtotal.textContent = window.Utils.formatARS(staffTotal);
        ui.costsSubtotal.textContent = window.Utils.formatARS(fixedTotal);
        ui.kpiStaff.textContent = window.Utils.formatARS(staffTotal);
        ui.kpiFixed.textContent = window.Utils.formatARS(fixedTotal);
        ui.kpiTotal.textContent = window.Utils.formatARS(staffTotal + fixedTotal);
    }

    // 9. History Logic
    function renderHistory() {
        if (!ui.historyContainer) return;
        
        if (state.history.length === 0) {
            ui.historyContainer.innerHTML = '<p class="faint text-center p-4">Historial vacío.</p>';
            return;
        }

        const rows = state.history.map(item => `
            <tr class="table-row">
                <td class="table-cell cell-pad">${window.WorkDayHelper.formatDate(item.work_date)}</td>
                <td class="table-cell cell-pad">${window.Utils.renderStatusBadge(item._status)}</td>
                <td class="table-cell cell-pad text-right">
                    <button class="btn-ghost btn-xs js-view-workday" data-id="${item.id}">Ver</button>
                </td>
            </tr>
        `).join('');

        ui.historyContainer.innerHTML = `
            <div class="table-scroll" style="max-height: 80vh;">
                <table class="table table-sticky table-compact">
                    <thead>
                        <tr>
                            <th class="table-cell is-header cell-pad">Fecha</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad"></th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    // 10. Submission
    async function handleConfirm() {
        const dateVal = ui.inputDate.value;
        if (!dateVal) return window.Toast.warning('Selecciona una fecha operativa.');

        // 1. Check if date already exists
        const { data: existing, error: errCheck } = await window.sb
            .from('work_days')
            .select('id')
            .eq('work_date', dateVal)
            .maybeSingle();

        if (errCheck) {
            console.error('Check error:', errCheck);
            return window.Toast.error('Error al verificar la fecha.');
        }

        if (existing) {
            return window.Toast.error(`Ya existe una jornada para el ${window.WorkDayHelper.formatDate(dateVal)}.`);
        }

        const confirmed = await window.Utils.confirmAction(
            `¿Confirmar planificación y ABRIR jornada para el ${window.WorkDayHelper.formatDate(dateVal)}?`,
            { confirmText: 'Confirmar y Abrir', isDanger: false }
        );

        if (!confirmed) return;

        window.Utils.setPageState(ui, { loading: true });
        const eventId = ui.selectEvent.value || null;
        
        try {
            // A. Create Work Day
            const { data: day, error: errDay } = await window.sb
                .from('work_days')
                .insert({
                    work_date: dateVal,
                    notes: ui.inputNotes.value.trim() || null,
                    status: 'planning'
                })
                .select()
                .single();

            if (errDay) throw errDay;

            // B. Staff Planning Bulk Insert
            const staffPayload = state.roles
                .filter(r => (state.staffPlan[r.id] || 0) > 0)
                .map(role => ({
                    work_day_id: day.id,
                    role_id: role.id,
                    quantity: state.staffPlan[role.id],
                    approved_budget: (state.staffPlan[role.id] || 0) * (role.base_rate || 0)
                }));

            if (staffPayload.length > 0) {
                const { error: errStaff } = await window.sb
                    .from('work_day_staff_planning')
                    .insert(staffPayload);
                if (errStaff) throw errStaff;
            }

            // C. Accounts Payable (Opening Costs) Bulk Insert
            const costsPayload = state.openingCosts
                .filter(c => (state.costsPlan[c.id]?.amount || 0) > 0)
                .map(cost => ({
                    work_day_id: day.id,
                    event_id: eventId,
                    source_id: cost.id,
                    source_type: 'opening_cost',
                    amount: state.costsPlan[cost.id].amount,
                    status: 'pending',
                    concept: `Apertura (${window.WorkDayHelper.formatDate(dateVal)}): ${cost.title}`,
                    due_date: dateVal
                }));

            if (costsPayload.length > 0) {
                const { error: errCosts } = await window.sb
                    .from('accounts_payable')
                    .insert(costsPayload);
                if (errCosts) throw errCosts;
            }

            // D. RPC Open Work Day (Official activation)
            const { error: errRpc } = await window.sb.rpc('rpc_open_work_day', { 
                p_work_day_id: day.id 
            });
            if (errRpc) throw errRpc;

            window.Toast.success('Jornada planificada y abierta con éxito.');
            
            // Wait for toast and redirect or reload
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (e) {
            console.error('Failure during submission:', e);
            window.Toast.error(e.message || 'Error crítico procesando la jornada.');
            
            // Attempt cleanup if day was created but not opened? 
            // In a better design, this should be a single transaction/RPC.
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    // 11. Countdown Config
    async function saveCountdownEvent() {
        const eventId = ui.selectCountdownEvent?.value || null;
        ui.btnSaveCountdown.disabled = true;
        ui.btnSaveCountdown.textContent = 'Guardando...';

        try {
            const { error } = await window.sb
                .from('site_config')
                .upsert(
                    { key: 'next_event_id', url: eventId || '', is_active: !!eventId },
                    { onConflict: 'key' }
                );

            if (error) throw error;

            state.currentCountdownEventId = eventId;
            window.Toast.success('Countdown actualizado correctamente.');
        } catch (e) {
            console.error('Error saving countdown:', e);
            window.Toast.error('Error al guardar el countdown.');
        } finally {
            ui.btnSaveCountdown.disabled = false;
            ui.btnSaveCountdown.textContent = 'Guardar';
        }
    }

    // 12. Event Modal
    function openEventModal() {
        ui.inputEventName.value = '';
        ui.inputEventDate.value = ui.inputDate.value || new Date().toISOString().split('T')[0];
        ui.inputEventQrQty.value = '0';
        ui.createEventModal?.classList.remove('hidden');
        ui.inputEventName?.focus();
    }

    function closeEventModal() {
        ui.createEventModal?.classList.add('hidden');
    }

    async function handleCreateEvent() {
        const name = ui.inputEventName?.value.trim();
        const date = ui.inputEventDate?.value;
        const qrQty = parseInt(ui.inputEventQrQty?.value) || 0;

        if (!name) return window.Toast.warning('Ingresa un nombre para el evento.');
        if (!date) return window.Toast.warning('Selecciona una fecha.');

        ui.btnCreateEvent.disabled = true;
        ui.btnCreateEvent.textContent = 'Creando...';

        try {
            // 1. Create Event
            const { data: event, error: errEvent } = await window.sb
                .from('events')
                .insert({ name, date, status: 'active' })
                .select()
                .single();

            if (errEvent) throw errEvent;

            // 2. If QR quantity specified, create batch + codes
            if (qrQty > 0) {
                const { data: batch, error: errBatch } = await window.sb
                    .from('qr_batches')
                    .insert({
                        name: `${name} - Entradas`,
                        event_id: event.id,
                        financial_type: 'VENTA',
                        market_source: 'BOLETERIA',
                        unit_price: 0,
                        created_by: session.user.id
                    })
                    .select()
                    .single();

                if (errBatch) throw errBatch;

                // 3. Generate QR codes
                const codes = Array.from({ length: qrQty }, () => ({
                    batch_id: batch.id,
                    code: crypto.randomUUID(),
                    status: 'PENDIENTE'
                }));

                const { error: errCodes } = await window.sb
                    .from('qr_codes')
                    .insert(codes);

                if (errCodes) throw errCodes;

                window.Toast.success(`Evento "${name}" creado con ${qrQty} entradas.`);
            } else {
                window.Toast.success(`Evento "${name}" creado.`);
            }

            // Add to state and re-render dropdowns
            state.events.unshift(event);
            renderEventsDropdown();
            renderCountdownDropdown();

            // Auto-select new event
            ui.selectEvent.value = event.id;

            closeEventModal();
        } catch (e) {
            console.error('Error creating event:', e);
            window.Toast.error(e.message || 'Error al crear evento.');
        } finally {
            ui.btnCreateEvent.disabled = false;
            ui.btnCreateEvent.textContent = 'Crear Evento';
        }
    }

    // Start
    init();

})();
