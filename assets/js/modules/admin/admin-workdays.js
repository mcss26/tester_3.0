/**
 * Module: admin-workdays.js
 * Standard: logic-engineer (2026)
 * Description: Workday Management - ZBB Planner Dashboard (Unified Staffing & Convocation)
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
        selectCountdownEvent: document.getElementById('select-countdown-event'),
        inputNotes: document.getElementById('input-notes'),
        statusIndicator: document.getElementById('workday-status-indicator'),
        
        staffContainer: document.getElementById('staff-container'),
        costsContainer: document.getElementById('costs-container'),

        // Actions
        btnConfirm: document.getElementById('btn-confirm-jornada'),
        btnHistory: document.getElementById('btn-back-list'),

        // Slide Panel (History)
        panelInstance: null,
        historyContainer: document.getElementById('history-container'),

        // Event Modal
        btnNewEvent: document.getElementById('btn-new-event'),
        createEventModal: document.getElementById('createEventModal'),
        inputEventName: document.getElementById('input-event-name'),
        inputEventDate: document.getElementById('input-event-date'),
        inputEventTime: document.getElementById('input-event-time'),
        inputEventQrQty: document.getElementById('input-event-qr-qty'),
        btnCancelEventModal: document.getElementById('btnCancelEventModal'),
        btnCreateEvent: document.getElementById('btnCreateEvent'),

        // Cost Modal
        btnSaveCost: document.getElementById('btnSaveCost'),
        // ... (other modal refs handled dynamically or via delegation)
    };

    // Validation
    if (!window.Utils.assertSbOrShowBlockingError(ui.moduleContent)) return;

    // 3. State
    const state = {
        roles: [],
        users: [],         // All profiles
        openingCosts: [],
        events: [],
        
        // Planner State
        activeWorkDay: null, // If editing existing day
        
        staffPlan: {},     // { roleId: quantity }
        allocations: {},   // { roleId: [ { userId, allocationId, status } ] } -> Derived from convocations
        
        costsPlan: {},     // { costId: { amount, isAdjusted } }
        
        history: [],
        isLoading: false,
        currentCountdownEventId: null
    };

    // 4. Utils
    const DateUtils = {
        getWeekNumber: (date) => {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        }
    };

    // 5. Initialization
    async function init() {
        if (window.initSlidePanel) {
            ui.panelInstance = window.initSlidePanel({ panelId: 'slide-panel', overlayId: 'panel-overlay' });
        }

        bindEvents();
        await loadInitialData();

        // Default today's date if empty
        if (!ui.inputDate.value) {
            ui.inputDate.value = new Date().toISOString().split('T')[0];
        }
        
        // Trigger initial load
        handleDateChange();
    }

    // 6. Event Binding
    function bindEvents() {
        ui.inputDate?.addEventListener('change', handleDateChange);

        ui.btnHistory?.addEventListener('click', () => {
            renderHistory();
            ui.panelInstance?.open();
        });

        // History Actions
        ui.historyContainer?.addEventListener('click', (e) => {
            const btnClose = e.target.closest('.js-close-workday');
            if (btnClose) handleCloseWorkday(btnClose.dataset.id, btnClose.dataset.date);
            
            const btnLoad = e.target.closest('.js-load-workday');
            if (btnLoad) {
                ui.inputDate.value = btnLoad.dataset.date;
                handleDateChange();
                ui.panelInstance?.close();
            }
        });

        // Staff Inputs (Quantity)
        ui.staffContainer?.addEventListener('input', (e) => {
            if (e.target.dataset.action === 'qty-change') {
                const roleId = e.target.dataset.roleId;
                const qty = parseInt(e.target.value) || 0;
                state.staffPlan[roleId] = qty;
                
                // If reducing quantity, we might need to warn or clean up extra allocations on save
                // For UI, we just re-render slots if needed, but easier to just update totals first
                calculateTotals();
                // Optional: Re-render slots immediately? 
                // Better to wait for user to finish typing or require Update to see slots change?
                // For seamless UX, let's re-render slots if needed (Edit Mode)
                if (state.activeWorkDay) renderStaffSlots(roleId, qty);
            }
        });

        // Staff Assignment (Allocation)
        ui.staffContainer?.addEventListener('change', (e) => {
            if (e.target.dataset.action === 'assign-user') {
                const roleId = e.target.dataset.roleId;
                const index = parseInt(e.target.dataset.index);
                const userId = e.target.value;
                
                if (!state.allocations[roleId]) state.allocations[roleId] = [];
                // Ensure array size
                while (state.allocations[roleId].length <= index) state.allocations[roleId].push({});
                
                state.allocations[roleId][index] = { 
                    userId, 
                    status: userId ? 'confirmed' : null, // Auto-confirm for admin assignment
                    isNew: true 
                };
                
                // Note: We don't save yet, just state
            }
        });

        // Costs Input
        ui.costsContainer?.addEventListener('input', (e) => {
            if (e.target.dataset.costId) {
                const costId = e.target.dataset.costId;
                const amount = parseFloat(e.target.value) || 0;
                const def = state.openingCosts.find(c => c.id === costId);
                state.costsPlan[costId] = { amount, isAdjusted: amount !== (def?.default_amount || 0) };
                calculateTotals();
            }
        });

        ui.btnConfirm?.addEventListener('click', handleConfirmOrUpdate);

        // Event Modal
        ui.btnNewEvent?.addEventListener('click', openEventModal);
        ui.btnCancelEventModal?.addEventListener('click', closeEventModal);
        ui.btnCreateEvent?.addEventListener('click', handleCreateEvent);
    }

    // 7. Data Loading
    async function loadInitialData() {
        window.Utils.setPageState(ui, { loading: true });
        try {
            const [rolesRes, costsRes, eventsRes, historyRes, usersRes] = await Promise.all([
                window.sb.from('master_staff_roles').select('*').eq('active', true).order('name'),
                window.sb.from('finance_opening_cost_defs').select('*').eq('is_active', true).order('sort_order'),
                window.sb.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(20),
                window.WorkDayHelper.getWorkDaySummary(),
                window.sb.from('profiles').select('id, full_name, role').order('full_name') // Fetch users
            ]);

            state.roles = rolesRes.data || [];
            state.openingCosts = costsRes.data || [];
            state.events = eventsRes.data || [];
            state.users = usersRes.data || [];
            state.history = flattenHistory(historyRes);

            // Init defaults
            state.roles.forEach(r => state.staffPlan[r.id] = 0);
            state.openingCosts.forEach(c => state.costsPlan[c.id] = { amount: c.default_amount, isAdjusted: false });

            renderBasicPanels();
        } catch (e) {
            console.error('Init Error:', e);
            window.Toast.error('Falló carga inicial.');
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

    // 8. Day Management (Edit vs New)
    async function handleDateChange() {
        const dateVal = ui.inputDate.value;
        if (!dateVal) return;

        ui.statusIndicator.className = 'status-pill staff-status-pending';
        ui.statusIndicator.textContent = 'Verificando...';
        ui.statusIndicator.style.opacity = '0.5';

        // Reset State for Plans
        state.roles.forEach(r => {
            state.staffPlan[r.id] = 0;
            state.allocations[r.id] = [];
        });
        state.openingCosts.forEach(c => state.costsPlan[c.id] = { amount: c.default_amount, isAdjusted: false });
        
        // Reset Inputs
        ui.inputNotes.value = '';
        ui.selectEvent.value = '';
        ui.checkHighDemand.checked = false;

        try {
            // Check for existing day
            const { data: day, error } = await window.sb
                .from('work_days')
                .select('*')
                .eq('work_date', dateVal)
                .neq('status', 'cancelled')
                .maybeSingle();

            if (error) throw error;

            if (day) {
                // FOUND -> Edit Mode
                state.activeWorkDay = day;
                ui.statusIndicator.textContent = day.status === 'open' ? 'ABIERTA' : 'Planificada';
                ui.statusIndicator.className = day.status === 'open' ? 'status-pill status-open' : 'status-pill status-planning';
                ui.statusIndicator.style.opacity = '1';

                ui.btnConfirm.textContent = 'Actualizar Jornada';
                ui.btnConfirm.classList.remove('btn-primary');
                ui.btnConfirm.classList.add('btn-secondary');
                // If open, maybe restrict some edits? For now allow updating staff.

                // Load Details
                await loadDayDetails(day.id);

            } else {
                // NEW -> Draft Mode
                state.activeWorkDay = null;
                ui.statusIndicator.textContent = 'Nueva (Borrador)';
                ui.statusIndicator.className = 'status-pill staff-status-pending';
                ui.statusIndicator.style.opacity = '1';

                ui.btnConfirm.textContent = 'Guardar y Abrir';
                ui.btnConfirm.classList.add('btn-primary');
                ui.btnConfirm.classList.remove('btn-secondary');
            }

            renderStaffList(); // Re-render with/without slots
            calculateTotals();

        } catch (e) {
            console.error('Date Check Error:', e);
            window.Toast.error('Error verificando fecha.');
        }
    }

    async function loadDayDetails(dayId) {
        // 1. Planning
        const { data: planning } = await window.sb.from('work_day_staff_planning').select('*').eq('work_day_id', dayId);
        if (planning) {
            planning.forEach(p => state.staffPlan[p.role_id] = p.quantity);
        }

        // 2. Convocations (Allocations)
        const { data: convos } = await window.sb.from('staff_convocations').select('*').eq('work_day_id', dayId);
        if (convos) {
            // Group by role based on user? Or we need role in convocations?
            // Convocations has 'role_id'.
            convos.forEach(c => {
                if (!state.allocations[c.role_id]) state.allocations[c.role_id] = [];
                state.allocations[c.role_id].push({
                    userId: c.user_id,
                    status: c.status,
                    allocationId: c.id
                });
            });
        }

        // 3. Metadata
        if (state.activeWorkDay.notes) ui.inputNotes.value = state.activeWorkDay.notes;
        // Event binding needed? Events table doesn't have work_day_id usually, work_days might link?
        // Current schema: work_days table doesn't have event_id column usually, it's loose coupling by date.
        // But we have 'events' table. We can auto-select if date matches.
        const matchingEvent = state.events.find(ev => ev.date === state.activeWorkDay.work_date);
        if (matchingEvent) ui.selectEvent.value = matchingEvent.id;

    }

    // 9. Rendering
    function renderBasicPanels() {
        renderEventsDropdown();
        renderStaffList();
        renderCostsList();
    }

    function renderEventsDropdown() {
        // ... (Keep existing logic)
        if (!ui.selectEvent) return;
        const options = state.events.map(ev => `
            <option value="${ev.id}">${window.Utils.escapeHtml(ev.name)} (${window.WorkDayHelper.formatDate(ev.date)})</option>
        `).join('');
        ui.selectEvent.innerHTML = '<option value="">-- Sin Evento Vinculado --</option>' + options;
    }

    function renderStaffList() {
        if (!ui.staffContainer) return;
        
        ui.staffContainer.innerHTML = state.roles.map(role => {
            const qty = state.staffPlan[role.id] || 0;
            return `
            <div class="planner-item" style="flex-direction:column; align-items:stretch; gap:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="item-info">
                        <span class="item-name">${window.Utils.escapeHtml(role.name)}</span>
                        <span class="item-meta">Budget: ${window.Utils.formatARS(role.base_salary || role.base_rate)}</span>
                    </div>
                    <div class="item-controls">
                        <span class="text-xs mr-2 text-muted">Cupo:</span>
                        <input type="number" min="0" max="99" value="${qty}" 
                            class="input input-compact text-center w-70"
                            data-action="qty-change"
                            data-role-id="${role.id}">
                        <span class="badge badge-quiet text-xs" style="min-width: 80px; text-align: right;">
                            ${window.Utils.formatARS(0)}
                        </span>
                    </div>
                </div>
                
                <!-- Slots Container (Only if existing day) -->
                ${state.activeWorkDay ? `<div id="slots-${role.id}" class="staff-slots-grid"></div>` : ''}
            </div>
        `}).join('');

        // If active day, render slots for existing quantities
        if (state.activeWorkDay) {
            state.roles.forEach(role => renderStaffSlots(role.id, state.staffPlan[role.id]));
        }
    }

    function renderStaffSlots(roleId, qty) {
        const container = document.getElementById(`slots-${roleId}`);
        if (!container) return;

        let html = '';
        const currentAllocations = state.allocations[roleId] || [];
        
        // Filter users for this role (loose match or catch-all)
        // Heuristic: Match user.role string with role.name (normalized)
        // Or assume 'staff' user role covers most.
        const roleName = state.roles.find(r => r.id === roleId)?.name.toLowerCase() || '';
        const eligibleUsers = state.users.filter(u => {
            const uRole = (u.role || '').toLowerCase();
            // Allow if roles match roughly OR if user is generic staff
            return uRole.includes(roleName) || uRole.includes('staff') || uRole === 'admin'; 
        });

        const userOptions = eligibleUsers.map(u => `<option value="${u.id}">${window.Utils.escapeHtml(u.full_name)}</option>`).join('');

        for (let i = 0; i < qty; i++) {
            const alloc = currentAllocations[i] || {};
            const assignedVal = alloc.userId || '';
            const statusBadge = alloc.status === 'confirmed' ? '✅' : (alloc.status === 'pending' ? '⏳' : '⚪');

            html += `
                <div class="staff-slot-row" style="display:flex; gap:8px; align-items:center; margin-top:4px;">
                    <span class="text-xs text-muted" style="width:20px;">#${i+1}</span>
                    <select class="input input-sm" style="flex:1;" 
                        data-action="assign-user" data-role-id="${roleId}" data-index="${i}">
                        <option value="">-- Vacante --</option>
                        ${eligibleUsers.map(u => `
                            <option value="${u.id}" ${u.id === assignedVal ? 'selected' : ''}>
                                ${window.Utils.escapeHtml(u.full_name)}
                            </option>
                        `).join('')}
                    </select>
                    <span title="${alloc.status || 'Sin asignar'}">${assignedVal ? statusBadge : ''}</span>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    function renderCostsList() {
        if (!ui.costsContainer) return;
        ui.costsContainer.innerHTML = state.openingCosts.map(cost => {
            const plan = state.costsPlan[cost.id] || { amount: cost.default_amount };
            return `
            <div class="planner-item">
                <div class="item-info">
                    <span class="item-name">${window.Utils.escapeHtml(cost.title)}</span>
                    <span class="item-meta">Recurrente: ${window.Utils.formatARS(cost.default_amount)}</span>
                </div>
                <div class="item-controls">
                    <input type="number" min="0" value="${plan.amount}" 
                        class="input input-compact text-center w-200"
                        data-cost-id="${cost.id}">
                </div>
            </div>
        `}).join('');
    }

    function calculateTotals() {
        let staffTotal = 0;
        let fixedTotal = 0;

        state.roles.forEach(role => {
            const qty = state.staffPlan[role.id] || 0;
            const rate = role.base_salary || role.base_rate || 0;
            const sub = qty * rate;
            staffTotal += sub;

            // Update badge
            const input = ui.staffContainer.querySelector(`input[data-role-id="${role.id}"]`);
            if (input) {
                const badge = input.nextElementSibling;
                if (badge) badge.textContent = window.Utils.formatARS(sub);
            }
        });

        Object.values(state.costsPlan).forEach(plan => fixedTotal += plan.amount);

        ui.staffSubtotal.textContent = window.Utils.formatARS(staffTotal);
        ui.costsSubtotal.textContent = window.Utils.formatARS(fixedTotal);
        ui.kpiStaff.textContent = window.Utils.formatARS(staffTotal);
        ui.kpiFixed.textContent = window.Utils.formatARS(fixedTotal);
        ui.kpiTotal.textContent = window.Utils.formatARS(staffTotal + fixedTotal);
    }

    // 10. Actions
    async function handleConfirmOrUpdate() {
        if (state.activeWorkDay) {
            await handleUpdate();
        } else {
            await handleCreate();
        }
    }

    async function handleCreate() {
        // ... (Existing Logic refined)
        const dateVal = ui.inputDate.value;
        if (!dateVal) return window.Toast.warning('Selecciona fecha.');

        const confirmed = await window.Utils.confirmAction(
            `¿Crear y ABRIR jornada para ${window.WorkDayHelper.formatDate(dateVal)}?`, { confirmText: 'Crear' }
        );
        if (!confirmed) return;

        window.Utils.setPageState(ui, { loading: true });
        
        try {
            // A. Create Day
            const { data: day, error: errDay } = await window.sb.from('work_days')
                .insert({ work_date: dateVal, notes: ui.inputNotes.value, status: 'planning' })
                .select().single();
            if (errDay) throw errDay;

            // B. Staff Plan
            const staffPayload = state.roles
                .filter(r => (state.staffPlan[r.id] || 0) > 0)
                .map(role => ({
                    work_day_id: day.id,
                    role_id: role.id,
                    quantity: state.staffPlan[role.id],
                    approved_budget: state.staffPlan[role.id] * (role.base_salary || 0)
                }));
            
            if (staffPayload.length > 0) await window.sb.from('work_day_staff_planning').insert(staffPayload);

            // C. Costs
            const costsPayload = state.openingCosts
                .filter(c => (state.costsPlan[c.id]?.amount || 0) > 0)
                .map(cost => ({
                    work_day_id: day.id,
                    source_id: cost.id,
                    source_type: 'opening_cost',
                    amount: state.costsPlan[cost.id].amount,
                    status: 'pending',
                    concept: `Apertura: ${cost.title}`,
                    due_date: dateVal
                }));
            if (costsPayload.length > 0) await window.sb.from('accounts_payable').insert(costsPayload);

            // D. Open
            await window.sb.rpc('rpc_open_work_day', { p_work_day_id: day.id });

            window.Toast.success('Jornada creada. Ahora puedes asignar personal.');
            
            // Reload to enter "Edit Mode"
            handleDateChange();

        } catch (e) {
            console.error(e);
            window.Toast.error('Falló creación.');
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    async function handleUpdate() {
        // Update Plan & Allocations
        window.Utils.setPageState(ui, { loading: true });
        try {
            const dayId = state.activeWorkDay.id;

            // 1. Update Notes
            await window.sb.from('work_days').update({ notes: ui.inputNotes.value }).eq('id', dayId);

            // 2. Staff Plan (Sync: Delete & Re-insert is easiest for bulk plan, but dangerous if IDs needed? 
            // Better: Upsert by (work_day_id, role_id)
            const staffPayload = state.roles.map(role => ({
                work_day_id: dayId,
                role_id: role.id,
                quantity: state.staffPlan[role.id] || 0,
                approved_budget: (state.staffPlan[role.id] || 0) * (role.base_salary || 0)
            }));
            await window.sb.from('work_day_staff_planning').upsert(staffPayload, { onConflict: 'work_day_id, role_id' });

            // 3. Allocations (Convocations)
            // Flatten state.allocations
            let convocationsPayload = [];
            Object.keys(state.allocations).forEach(roleId => {
                const allocs = state.allocations[roleId];
                allocs.forEach(alloc => {
                    if (alloc.userId) { // Only save assigned
                        convocationsPayload.push({
                            work_day_id: dayId,
                            role_id: roleId,
                            user_id: alloc.userId,
                            status: alloc.status || 'confirmed',
                            // id: alloc.allocationId // If we have ID, upsert. If not, insert.
                        });
                    }
                });
            });

            // Upsert is tricky without ID.
            // Strategy: Delete all for this day and re-insert is clean only if history doesn't matter much.
            // For now, let's just insert new ones or basic upsert if we can unique by user?
            // Unique key for staff_convocations: (work_day_id, user_id)? hopefully.
            if (convocationsPayload.length > 0) {
                 const { error } = await window.sb.from('staff_convocations')
                    .upsert(convocationsPayload, { onConflict: 'work_day_id, user_id' });
                 if (error) throw error;
            }

            window.Toast.success('Jornada actualizada.');
        } catch (e) {
            console.error(e);
            window.Toast.error('Falló actualización.');
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    // 11. Modal Logic (Events)
    function openEventModal() { ui.createEventModal.classList.remove('hidden'); }
    function closeEventModal() { ui.createEventModal.classList.add('hidden'); }
    
    async function handleCreateEvent() {
        const name = ui.inputEventName.value;
        const date = ui.inputEventDate.value;
        if (!name || !date) return;
        
        ui.btnCreateEvent.textContent = 'Creando...';
        try {
            const { data } = await window.sb.from('events').insert({ name, date, status: 'active' }).select().single();
            window.Toast.success('Evento creado.');
            state.events.unshift(data);
            renderEventsDropdown();
            ui.selectEvent.value = data.id;
            closeEventModal();
        } catch(e) { window.Toast.error('Error creando evento'); }
        finally { ui.btnCreateEvent.textContent = 'Crear Evento'; }
    }

    function renderHistory() {
        const rows = state.history.map(item => `
            <tr class="table-row">
                <td class="table-cell cell-pad font-bold">${window.WorkDayHelper.formatDate(item.work_date)}</td>
                <td class="table-cell cell-pad">${window.Utils.renderStatusBadge(item._status)}</td>
                <td class="table-cell cell-pad text-right">
                   <button class="btn-primary btn-xs js-load-workday" data-date="${item.work_date}">Ver</button>
                   ${item._status === 'open' ? `<button class="btn-secondary btn-xs js-close-workday" data-id="${item.id}" data-date="${item.work_date}">Cerrar</button>` : ''}
                </td>
            </tr>
        `).join('');
        ui.historyContainer.innerHTML = `<table class="table table-compact"><tbody>${rows}</tbody></table>`;
    }

    async function handleCloseWorkday(id, date) {
        if (!await window.Utils.confirmAction(`¿Cerrar jornada ${date}?`, { isDanger: true })) return;
        await window.sb.from('work_days').update({ status: 'closed', closed_at: new Date() }).eq('id', id);
        window.location.reload();
    }

    // Start
    init();

})();
