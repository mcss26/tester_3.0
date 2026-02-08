/**
 * Module: admin-workdays.js
 * Standard: logic-engineer (2026)
 * Description: Workday Management - 4-Tab Dashboard (Planificación / Evento / Stock Audit / Histórico)
 * Integrates cash closing, GBOL sync, stock audit, and premium history.
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
        // selectCountdownEvent: removed (dead ref)
        inputNotes: document.getElementById('input-notes'),
        inputNotes: document.getElementById('input-notes'),
        statusIndicator: document.getElementById('workday-status-header'),
        
        // Date Nav
        btnPrevDay: document.getElementById('btn-prev-day'),
        btnNextDay: document.getElementById('btn-next-day'),
        btnToday: document.getElementById('btn-today'),
        currentDateDisplay: document.getElementById('current-date-display'),
        
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

        // ── Cierre / Evento Tab ──
        tabBar: document.getElementById('workday-tabs'),
        panelPlan: document.getElementById('panelPlan'),
        panelEvento: document.getElementById('panelEvento'),
        panelStockAudit: document.getElementById('panelStockAudit'),
        panelHistorico: document.getElementById('panelHistorico'),

        cierreTableBody: document.getElementById('cierre-table-body'),
        totalCashDecl: document.getElementById('total-cash-decl'),
        totalZocoDecl: document.getElementById('total-zoco-decl'),
        totalCashSys: document.getElementById('total-cash-sys'),
        totalZocoSys: document.getElementById('total-zoco-sys'),
        totalDiff: document.getElementById('total-diff'),
        evtKpiSystem: document.getElementById('evt-kpi-system'),
        evtKpiDeclared: document.getElementById('evt-kpi-declared'),
        evtKpiDiff: document.getElementById('evt-kpi-diff'),
        btnCloseNight: document.getElementById('btn-close-night'),
        btnSaveNotes: document.getElementById('btn-save-notes'),
        closingNotes: document.getElementById('closing-notes'),
        qrPassline: { qty: document.getElementById('qr-passline-qty'), sys: document.getElementById('qr-passline-sys'), decl: document.getElementById('qr-passline-decl'), diff: document.getElementById('qr-passline-diff') },
        qrBoleteria: { qty: document.getElementById('qr-boleteria-qty'), sys: document.getElementById('qr-boleteria-sys'), decl: document.getElementById('qr-boleteria-decl'), diff: document.getElementById('qr-boleteria-diff') },
        qrRrpp: { qty: document.getElementById('qr-rrpp-qty'), sys: document.getElementById('qr-rrpp-sys') },
        closeNightModal: document.getElementById('closeNightModal'),
        confirmDiffDisplay: document.getElementById('confirm-diff-display'),
        btnConfirmCloseNight: document.getElementById('btnConfirmCloseNight'),
        btnCancelCloseNight: document.getElementById('btnCancelCloseNight'),
        historyTableBody: document.getElementById('history-table-body'),

        // ── Devenciones ──
        devencionesTableBody: document.getElementById('devenciones-table-body'),
        devencionKpiTotal: document.getElementById('devencion-kpi-total'),
        devencionesTotalFooter: document.getElementById('devenciones-total-footer'),
        btnGenerateAccruals: document.getElementById('btn-generate-accruals'),
        sectionDevenciones: document.getElementById('section-devenciones'),

        // ── GBOL Sync ──
        btnSyncGbol: document.getElementById('btn-sync-gbol-wd'),
        fiscalCards: document.getElementById('fiscal-summary-cards'),
        fiscalBruto: document.getElementById('fiscal-total-bruto'),
        fiscalPctBlanco: document.getElementById('fiscal-pct-blanco'),
        fiscalIva: document.getElementById('fiscal-iva'),
        fiscalTickets: document.getElementById('fiscal-tickets'),

        // ── Stock Audit ──
        saKpiPhysical: document.getElementById('sa-kpi-physical'),
        saKpiTheoretical: document.getElementById('sa-kpi-theoretical'),
        saKpiLoss: document.getElementById('sa-kpi-loss'),
        saKpiLossDelta: document.getElementById('sa-kpi-loss-delta'),
        saKpiRating: document.getElementById('sa-kpi-rating'),
        saSessionsBody: document.getElementById('sa-sessions-body'),
        saVarianceBody: document.getElementById('sa-variance-body'),
        saFilterClasif: document.getElementById('sa-filter-clasif'),
        saConsumoGbolBody: document.getElementById('sa-consumo-gbol-body'),
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
        
        isLoading: false,
        currentCountdownEventId: null,

        // Cierre state
        closingId: null,
        activeTab: 'panelPlan',
        cierreLoaded: false,
        accrualsLoaded: false,
        historyLoaded: false,
        accruals: [],       // staff_accruals for active workday

        // Stock Audit state
        stockAuditLoaded: false,
        barEfficiency: [],  // vw_bar_efficiency rows
        barVariance: [],    // vw_bar_audit_variance rows
        consumoTeorico: [], // vw_consumo_teorico rows
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

        // ── Date Navigation (New) ──
        ui.btnPrevDay?.addEventListener('click', () => changeDateByOffset(-1));
        ui.btnNextDay?.addEventListener('click', () => changeDateByOffset(1));
        ui.btnToday?.addEventListener('click', () => {
             ui.inputDate.value = new Date().toISOString().split('T')[0];
             handleDateChange();
        });

        function changeDateByOffset(offset) {
            const current = ui.inputDate.value ? new Date(ui.inputDate.value) : new Date();
            current.setDate(current.getDate() + offset + 1); // +1 because inputs are YYYY-MM-DD
            // Wait, Date input value is string.
            // Let's use WorkDayHelper or specific logic
            const base = ui.inputDate.value ? new Date(ui.inputDate.value + 'T12:00:00') : new Date();
            base.setDate(base.getDate() + offset);
            ui.inputDate.value = base.toISOString().split('T')[0];
            handleDateChange();
        }

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
                state.costsPlan[costId] = { amount, isAdjusted: amount !== (def?.base_amount || 0) };
                calculateTotals();
            }
        });

        ui.btnConfirm?.addEventListener('click', handleConfirmOrUpdate);

        // Event Modal
        ui.btnNewEvent?.addEventListener('click', openEventModal);
        ui.btnCancelEventModal?.addEventListener('click', closeEventModal);
        ui.btnCreateEvent?.addEventListener('click', handleCreateEvent);

        // ── Tab Bar ──
        ui.tabBar?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-tab]');
            if (btn) switchTab(btn.dataset.tab);
        });

        // ── Cierre / Evento events ──
        ui.btnCloseNight?.addEventListener('click', openCloseNightModal);
        ui.btnConfirmCloseNight?.addEventListener('click', performCloseNight);
        ui.btnCancelCloseNight?.addEventListener('click', () => ui.closeNightModal?.classList.add('hidden'));

        ui.btnSaveNotes?.addEventListener('click', handleSaveNotes);

        // ── GBOL Sync ──
        ui.btnSyncGbol?.addEventListener('click', handleGbolSync);

        // ── Stock Audit Filter ──
        ui.saFilterClasif?.addEventListener('change', () => renderVarianceTable(ui.saFilterClasif.value));

        // Import Triggers
        document.querySelectorAll('#panelEvento .btn-import').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileInput = document.getElementById(e.currentTarget.dataset.trigger);
                if (fileInput) fileInput.click();
            });
        });

        bindFileHandler('file-extracciones', async (f) => {
            const { count } = await window.ImporterExtracciones.process(f, state.activeWorkDay?.id);
            window.Toast.success(`Importados ${count} retiros.`);
            loadCierreData();
        });
        bindFileHandler('file-gbol', async (f) => {
            const { count } = await window.ImporterGbol.process(f, state.activeWorkDay?.id);
            window.Toast.success(`Importadas ${count} ventas Gbol.`);
            loadCierreData();
        });
        bindFileHandler('file-passline', async (f) => {
            const { count } = await window.ImporterPassline.process(f, state.activeWorkDay?.id);
            window.Toast.success(`Procesados ${count} registros QR.`);
            loadQrStats(state.activeWorkDay?.id);
        });
        bindFileHandler('file-afip', async (f) => {
            const summary = await window.ImporterAfip.process(f);
            window.Toast.success('Terminales procesadas.');
        });

        // QR live diffs
        ui.qrPassline.decl?.addEventListener('input', updateQrDiffs);
        ui.qrBoleteria.decl?.addEventListener('input', updateQrDiffs);
    }

    // ── Tab Switching ──
    function switchTab(tabId) {
        state.activeTab = tabId;
        ['panelPlan', 'panelEvento', 'panelStockAudit', 'panelHistorico'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', id !== tabId);
        });
        ui.tabBar?.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.tab === tabId);
            btn.setAttribute('aria-selected', btn.dataset.tab === tabId ? 'true' : 'false');
        });

        // Lazy-load cierre data when entering Evento tab
        if (tabId === 'panelEvento' && state.activeWorkDay && !state.cierreLoaded) {
            loadCierreData();
        }
        // Lazy-load accruals (only re-fetch on date change or mutation)
        if (tabId === 'panelEvento' && state.activeWorkDay && !state.accrualsLoaded) {
            loadAccruals();
        }
        // Lazy-load Stock Audit data
        if (tabId === 'panelStockAudit' && state.activeWorkDay && !state.stockAuditLoaded) {
            loadStockAuditData();
        }
        // Lazy-load history (only re-fetch on date change)
        if (tabId === 'panelHistorico' && !state.historyLoaded) {
            renderHistoryTable();
        }
    }

    // ── File handler helper ──
    function bindFileHandler(inputId, handler) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.addEventListener('change', async (e) => {
            if (!e.target.files.length) return;
            const file = e.target.files[0];
            const btn = document.querySelector(`button[data-trigger="${inputId}"]`);
            const prevText = btn?.textContent || '';
            if (btn) { btn.textContent = '...'; btn.disabled = true; }
            try {
                if (!state.activeWorkDay?.id && inputId !== 'file-afip') throw new Error('No hay jornada activa.');
                await handler(file);
            } catch (err) {
                window.Toast.error(err.message || 'Error importando');
            } finally {
                if (btn) { btn.textContent = prevText; btn.disabled = false; }
                input.value = '';
            }
        });
    }

    // 7. Data Loading
    async function loadInitialData() {
        window.Utils.setPageState(ui, { loading: true });
        try {
            const [rolesRes, costsRes, eventsRes, usersRes] = await Promise.all([
                window.sb.from('master_staff_roles').select('id, name').eq('active', true).order('name'),
                window.sb.from('cost_definitions').select('id, title, base_amount').eq('frequency', 'per_event').eq('is_active', true).order('title'),
                window.sb.from('events').select('id, name, date').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(20),
                window.sb.from('profiles').select('id, full_name, role').order('full_name') // Fetch users
            ]);

            state.roles = rolesRes.data || [];
            state.openingCosts = costsRes.data || [];
            state.events = eventsRes.data || [];
            state.users = usersRes.data || [];

            // Init defaults
            state.roles.forEach(r => state.staffPlan[r.id] = 0);
            state.openingCosts.forEach(c => state.costsPlan[c.id] = { amount: c.base_amount, isAdjusted: false });

            renderBasicPanels();
        } catch (e) {
            console.error('Init Error:', e);
            window.Toast.error('Falló carga inicial.');
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    // flattenHistory removed — Histórico now served by vw_night_snapshot

    // 8. Day Management (Edit vs New)
    async function handleDateChange() {
        const dateVal = ui.inputDate.value;
        if (!dateVal) return;

        // Reset lazy-load flags for new date
        state.cierreLoaded = false;
        state.accrualsLoaded = false;
        state.historyLoaded = false;
        state.stockAuditLoaded = false;
        state.closingId = null;

        ui.statusIndicator.className = 'status-pill-header staff-status-pending';
        ui.statusIndicator.textContent = 'Verificando...';
        ui.statusIndicator.classList.add('is-checking');
        
        // Update Date Display
        if (ui.currentDateDisplay) {
            const dateObj = new Date(dateVal + 'T12:00:00');
            const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
            ui.currentDateDisplay.textContent = dateObj.toLocaleDateString('es-AR', options);
        }

        // Reset State for Plans
        state.roles.forEach(r => {
            state.staffPlan[r.id] = 0;
            state.allocations[r.id] = [];
        });
        state.openingCosts.forEach(c => state.costsPlan[c.id] = { amount: c.base_amount, isAdjusted: false });
        
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
                ui.statusIndicator.className = day.status === 'open' ? 'status-pill-header status-open' : 'status-pill-header status-planning';
                ui.statusIndicator.classList.remove('is-checking');

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
                ui.statusIndicator.className = 'status-pill-header staff-status-pending';
                ui.statusIndicator.classList.remove('is-checking');

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
            const plan = state.costsPlan[cost.id] || { amount: cost.base_amount };
            return `
            <div class="planner-item">
                <div class="item-info">
                    <span class="item-name">${window.Utils.escapeHtml(cost.title)}</span>
                    <span class="item-meta">Recurrente: ${window.Utils.formatARS(cost.base_amount)}</span>
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

            // C. Costs → finance_payments
            const costsPayload = state.openingCosts
                .filter(c => (state.costsPlan[c.id]?.amount || 0) > 0)
                .map(cost => ({
                    title: cost.title,
                    supplier_id: cost.supplier_id || null,
                    cost_definition_id: cost.id,
                    work_day_id: day.id,
                    source_type: 'RECURRENTE',
                    amount_total: state.costsPlan[cost.id].amount,
                    due_date: dateVal,
                    status: 'PENDING',
                    voucher_type: cost.voucher_type || null,
                    payment_method: cost.payment_method || null,
                    created_by: session.user.id,
                }));
            if (costsPayload.length > 0) await window.sb.from('finance_payments').insert(costsPayload);

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

            // QR Batch auto-generation
            const qrQty = parseInt(document.getElementById('input-event-qr-qty')?.value) || 0;
            if (qrQty > 0) {
                const { data: batch, error: batchErr } = await window.sb.from('qr_batches').insert({
                    name: `${name} - Auto`,
                    financial_type: 'VENTA',
                    created_by: session.user.id
                }).select().single();
                if (batchErr) throw batchErr;

                const rows = Array.from({ length: qrQty }, () => ({
                    batch_id: batch.id,
                    code: crypto.randomUUID(),
                    status: 'PENDIENTE'
                }));
                await window.sb.from('qr_codes').insert(rows);
                window.Toast.success(`Lote de ${qrQty} QRs creado.`);
            }

            closeEventModal();
        } catch(e) {
            console.error(e);
            window.Toast.error('Error creando evento');
        }
        finally { ui.btnCreateEvent.textContent = 'Crear Evento'; }
    }

    // renderHistory removed — replaced by Histórico tab (vw_night_snapshot)

    async function handleCloseWorkday(id, date) {
        // Switch to Evento tab instead of closing directly
        ui.inputDate.value = date;
        await handleDateChange();
        switchTab('panelEvento');
        window.Toast.info('Revisa la rendición antes de cerrar la noche.');
    }

    // ═══════════════════════════════════════════════════════════════
    // 12. CIERRE / EVENTO LOGIC (migrated from admin-cierre.js)
    // ═══════════════════════════════════════════════════════════════

    const cierreStatusLabels = {
        verified: { label: 'Verificado', cls: 'success' },
        submitted: { label: 'Enviado', cls: 'info' },
        pending: { label: 'Pendiente', cls: 'warning' }
    };

    function applyDiffClass(el, diff) {
        if (!el) return;
        el.classList.remove('text-success', 'text-error', 'muted');
        if (diff === 0) el.classList.add('muted');
        else if (diff < 0) el.classList.add('text-error');
        else el.classList.add('text-success');
    }

    async function loadCierreData() {
        if (!state.activeWorkDay) return;
        const wdId = state.activeWorkDay.id;

        try {
            // A. Get or create cash_closing
            let { data: closing, error: cErr } = await window.sb
                .from('cash_closings').select('*')
                .eq('work_day_id', wdId).maybeSingle();
            if (cErr) throw cErr;

            if (!closing) {
                const { data: newC, error: createErr } = await window.sb
                    .from('cash_closings')
                    .insert({ work_day_id: wdId, status: 'open', total_system: 0, total_declared: 0, total_difference: 0 })
                    .select().single();
                if (createErr) { window.Toast.error('No se pudo crear cierre de caja.'); return; }
                closing = newC;
                window.Toast.info('Cierre de caja creado automáticamente.');
            }

            state.closingId = closing.id;
            ui.closingNotes.value = closing.notes || '';
            ui.btnCloseNight.disabled = closing.status === 'closed';
            ui.btnCloseNight.textContent = closing.status === 'closed' ? 'CERRADO' : 'CERRAR NOCHE';

            // B. Load terminals
            const [termRes, detailRes] = await Promise.all([
                window.sb.from('pos_terminals').select('id, friendly_name'),
                window.sb.from('closing_terminals').select('*, staff:staff_id(email)').eq('cash_closing_id', closing.id)
            ]);

            renderCierreTable(termRes.data || [], detailRes.data || []);
            // Fire sub-loads in parallel (previously sequential waterfall)
            await Promise.all([
                loadQrStats(wdId),
                loadBreakdown(wdId),
                loadFiscalSummary(state.activeWorkDay.work_date),
            ]);
            state.cierreLoaded = true;

        } catch (err) {
            console.error('[cierre] Load error:', err);
            window.Toast.error('Error cargando cierre.');
        }
    }

    function renderCierreTable(terminals, details) {
        if (!ui.cierreTableBody) return;
        let acc = { cashDecl: 0, zocoDecl: 0, cashSys: 0, zocoSys: 0, diff: 0 };

        const rows = terminals.map(t => {
            const d = details.find(x => x.terminal_id === t.id) || { declared_cash: 0, declared_zoco: 0, system_cash: 0, system_zoco: 0, status: 'pending' };
            const cD = Number(d.declared_cash) || 0, zD = Number(d.declared_zoco) || 0;
            const cS = Number(d.system_cash) || 0, zS = Number(d.system_zoco) || 0;
            const diff = (cD + zD) - (cS + zS);
            acc.cashDecl += cD; acc.zocoDecl += zD; acc.cashSys += cS; acc.zocoSys += zS; acc.diff += diff;

            const si = cierreStatusLabels[(d.status || 'pending').toLowerCase()] || cierreStatusLabels.pending;
            const dc = diff === 0 ? 'muted' : (diff < 0 ? 'text-error' : 'text-success');
            return `<tr class="table-row">
                <td class="table-cell"><div class="font-bold">${window.Utils.escapeHtml(t.friendly_name)}</div><div class="text-xs muted">${window.Utils.escapeHtml(d.staff?.email || '-')}</div></td>
                <td class="table-cell text-right font-mono">${window.Utils.formatARS(cD)}</td>
                <td class="table-cell text-right font-mono">${window.Utils.formatARS(zD)}</td>
                <td class="table-cell text-right font-mono muted">${window.Utils.formatARS(cS)}</td>
                <td class="table-cell text-right font-mono muted">${window.Utils.formatARS(zS)}</td>
                <td class="table-cell text-right font-mono font-bold ${dc}">${window.Utils.formatARS(diff)}</td>
                <td class="table-cell text-center"><span class="status-pill status-${si.cls}">${si.label}</span></td>
            </tr>`;
        }).join('');

        ui.cierreTableBody.innerHTML = rows || '<tr><td colspan="7" class="cell-pad text-center muted">Sin terminales</td></tr>';
        renderCierreTotals(acc);
    }

    function renderCierreTotals(acc) {
        ui.totalCashDecl.textContent = window.Utils.formatARS(acc.cashDecl);
        ui.totalZocoDecl.textContent = window.Utils.formatARS(acc.zocoDecl);
        ui.totalCashSys.textContent = window.Utils.formatARS(acc.cashSys);
        ui.totalZocoSys.textContent = window.Utils.formatARS(acc.zocoSys);
        ui.totalDiff.textContent = window.Utils.formatARS(acc.diff);
        applyDiffClass(ui.totalDiff, acc.diff);

        // Update Evento KPIs
        const totalSys = acc.cashSys + acc.zocoSys;
        const totalDecl = acc.cashDecl + acc.zocoDecl;
        if (ui.evtKpiSystem) ui.evtKpiSystem.textContent = window.Utils.formatARS(totalSys);
        if (ui.evtKpiDeclared) ui.evtKpiDeclared.textContent = window.Utils.formatARS(totalDecl);
        if (ui.evtKpiDiff) { ui.evtKpiDiff.textContent = window.Utils.formatARS(acc.diff); applyDiffClass(ui.evtKpiDiff, acc.diff); }
    }

    // ── QR ──
    async function loadQrStats(workDayId) {
        if (!workDayId) return;
        const { data: qrs, error } = await window.sb
            .from('qr_codes').select('*, qr_batches(market_source, unit_price)')
            .eq('work_day_id', workDayId).eq('status', 'ACREDITADO');
        if (error) return console.error(error);

        const stats = { passline: { qty: 0, sys: 0 }, boleteria: { qty: 0, sys: 0 }, rrpp: { qty: 0, sys: 0 } };
        (qrs || []).forEach(q => {
            const src = (q.qr_batches?.market_source || '').toUpperCase();
            const price = Number(q.qr_batches?.unit_price) || 0;
            if (src === 'PASSLINE') { stats.passline.qty++; stats.passline.sys += price; }
            else if (src === 'BOLETERIA') { stats.boleteria.qty++; stats.boleteria.sys += price; }
            else { stats.rrpp.qty++; stats.rrpp.sys += price; }
        });

        ui.qrPassline.qty.textContent = stats.passline.qty;
        ui.qrPassline.sys.textContent = window.Utils.formatARS(stats.passline.sys);
        ui.qrPassline.sys.dataset.val = stats.passline.sys;
        ui.qrBoleteria.qty.textContent = stats.boleteria.qty;
        ui.qrBoleteria.sys.textContent = window.Utils.formatARS(stats.boleteria.sys);
        ui.qrBoleteria.sys.dataset.val = stats.boleteria.sys;
        ui.qrRrpp.qty.textContent = stats.rrpp.qty;
        ui.qrRrpp.sys.textContent = window.Utils.formatARS(stats.rrpp.sys);
        updateQrDiffs();
    }

    function updateQrDiffs() {
        ['qrPassline', 'qrBoleteria'].forEach(k => {
            const g = ui[k];
            if (!g?.sys || !g?.decl || !g?.diff) return;
            const sys = Number(g.sys.dataset.val || 0);
            const decl = Number(g.decl.value || 0);
            const diff = decl - sys;
            g.diff.textContent = window.Utils.formatARS(diff);
            applyDiffClass(g.diff, diff);
        });
    }

    // ── Breakdown ──
    async function loadBreakdown(workDayId) {
        const { data, error } = await window.sb.from('vw_daily_sales').select('*').eq('work_day_id', workDayId).maybeSingle();
        if (error || !data) return;
        renderBreakdown(data);
    }

    function renderBreakdown(s) {
        const el = (id) => document.getElementById(id);
        const barCash = s.bar_sales_cash || 0, barCard = s.bar_sales_card || 0;
        const barTotal = s.bar_sales_system || (barCash + barCard);
        const qrTotal = s.qr_total || 0;
        const totalCash = barCash, totalZoco = barCard + qrTotal, globalTotal = totalCash + totalZoco;

        const fmt = window.Utils.formatARS;
        if (el('breakdown-bar-cash')) el('breakdown-bar-cash').textContent = fmt(barCash);
        if (el('breakdown-bar-card')) el('breakdown-bar-card').textContent = fmt(barCard);
        if (el('breakdown-bar-total')) el('breakdown-bar-total').textContent = fmt(barTotal);
        if (el('breakdown-qr-zoco')) el('breakdown-qr-zoco').textContent = fmt(qrTotal);
        if (el('breakdown-qr-total')) el('breakdown-qr-total').textContent = fmt(qrTotal);
        if (el('breakdown-total-cash')) el('breakdown-total-cash').textContent = fmt(totalCash);
        if (el('breakdown-total-zoco')) el('breakdown-total-zoco').textContent = fmt(totalZoco);
        if (el('breakdown-total-global')) el('breakdown-total-global').textContent = fmt(globalTotal);
    }

    // ── Close Night ──
    function openCloseNightModal() {
        if (!state.closingId) return;
        ui.confirmDiffDisplay.textContent = ui.totalDiff.textContent;
        ui.closeNightModal?.classList.remove('hidden');
    }

    async function performCloseNight() {
        ui.closeNightModal?.classList.add('hidden');
        ui.btnCloseNight.disabled = true;
        ui.btnCloseNight.textContent = 'Cerrando...';

        try {
            // Checkpoints: bar sessions + terminal closings
            const [barRes, termRes] = await Promise.all([
                window.sb.from('bar_sessions').select('id, location, profiles(full_name)')
                    .eq('work_day_id', state.activeWorkDay.id).neq('status', 'closed'),
                window.sb.from('closing_terminals').select('id, pos_terminals(friendly_name)')
                    .eq('cash_closing_id', state.closingId).not('status', 'in', '(submitted,verified)')
            ]);

            if (barRes.error) throw barRes.error;
            if (barRes.data?.length > 0) {
                throw new Error(`Hay ${barRes.data.length} barra(s) sin cerrar: ${barRes.data.map(b => b.profiles?.full_name || b.location).join(', ')}`);
            }
            if (termRes.error) throw termRes.error;
            if (termRes.data?.length > 0) {
                throw new Error(`Cajas sin cerrar: ${termRes.data.map(t => t.pos_terminals?.friendly_name).join(', ')}`);
            }

            // ── CRITICAL FIX: Persist totals into cash_closings ──
            const totalSys = parseFloat(ui.evtKpiSystem?.textContent?.replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;
            const totalDecl = parseFloat(ui.evtKpiDeclared?.textContent?.replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;
            const totalDiff = totalDecl - totalSys;

            const closedAt = new Date().toISOString();
            const userId = session.user.id;

            const [closingRes, wdRes] = await Promise.all([
                window.sb.from('cash_closings').update({
                    status: 'closed',
                    closed_at: closedAt,
                    closed_by: userId,
                    total_system: totalSys,
                    total_declared: totalDecl,
                    total_difference: totalDiff
                }).eq('id', state.closingId),
                window.sb.from('work_days').update({
                    status: 'closed', closed_at: closedAt, closed_by: userId
                }).eq('id', state.activeWorkDay.id)
            ]);

            if (closingRes.error) throw closingRes.error;
            if (wdRes.error) throw wdRes.error;

            window.Toast.success('Noche cerrada exitosamente.');
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            console.error('[cierre] Close error:', err);
            window.Toast.error(err.message || 'Error al cerrar noche');
            ui.btnCloseNight.disabled = false;
            ui.btnCloseNight.textContent = 'CERRAR NOCHE';
        }
    }

    async function handleSaveNotes() {
        if (!state.closingId) return;
        try {
            await window.sb.from('cash_closings').update({ notes: ui.closingNotes.value.trim() }).eq('id', state.closingId);
            window.Toast.success('Notas guardadas.');
        } catch (e) { window.Toast.error('Error guardando notas.'); }
    }

    // Old renderHistoryTable removed — async version at bottom uses vw_night_snapshot

    // ═══════════════════════════════════════════════════════════
    // DEVENCIONES (Staff Accruals)
    // ═══════════════════════════════════════════════════════════
    const fmt = window.Utils.formatARS;
    const esc = window.Utils.escapeHtml;

    async function loadAccruals() {
        if (!state.activeWorkDay?.id || !ui.devencionesTableBody) return;

        try {
            const { data, error } = await window.sb
                .from('staff_accruals')
                .select('id, work_day_id, user_id, role_id, amount, adjustment, status, created_at, profiles(full_name), master_staff_roles(name)')
                .eq('work_day_id', state.activeWorkDay.id)
                .order('created_at');

            if (error) throw error;

            state.accruals = data || [];
            state.accrualsLoaded = true;
            renderAccruals();

            // Enable generate button only if no accruals yet
            if (ui.btnGenerateAccruals) {
                const hasAccrued = state.accruals.some(a => a.status === 'accrued');
                ui.btnGenerateAccruals.disabled = state.accruals.length > 0 && !hasAccrued;
                ui.btnGenerateAccruals.textContent = state.accruals.length > 0 
                    ? 'Regenerar Devenciones' 
                    : 'Generar Devenciones';
            }
        } catch (err) {
            console.error('[devenciones] Load error:', err);
        }
    }

    function renderAccruals() {
        if (!ui.devencionesTableBody) return;

        if (!state.accruals || state.accruals.length === 0) {
            ui.devencionesTableBody.innerHTML = `<tr><td colspan="6" class="cell-pad text-center muted">Genera devenciones para ver el detalle de nómina.</td></tr>`;
            if (ui.devencionKpiTotal) ui.devencionKpiTotal.textContent = '$0';
            if (ui.devencionesTotalFooter) ui.devencionesTotalFooter.textContent = '$0';
            return;
        }

        const statusMap = {
            'accrued': '<span class="status-pill status-warning">Devengado</span>',
            'exported': '<span class="status-pill status-info">Exportado</span>',
            'paid': '<span class="status-pill status-success">Pagado</span>',
            'cancelled': '<span class="status-pill status-muted">Anulado</span>'
        };

        let totalAccrued = 0;
        ui.devencionesTableBody.innerHTML = state.accruals.map(a => {
            const name = a.profiles?.full_name || '—';
            const role = a.master_staff_roles?.name || '—';
            const total = (a.base_amount || 0) + (a.adjustments || 0);
            if (a.status !== 'cancelled') totalAccrued += total;

            return `<tr class="table-row js-accrual-row" data-id="${a.id}"${a.status === 'cancelled' ? ' style="opacity:0.4"' : ''}>
                <td class="table-cell cell-pad cell-strong">${esc(name)}</td>
                <td class="table-cell text-center text-xs">${esc(role)}</td>
                <td class="table-cell text-right font-mono text-sm">${fmt(a.base_amount)}</td>
                <td class="table-cell text-right">
                    ${a.status === 'accrued' 
                        ? `<input type="number" class="input input-reconcile-compact js-adj-input" data-id="${a.id}" value="${a.adjustments || 0}" step="500" style="max-width:90px;text-align:right;" aria-label="Ajuste para ${esc(name)}"/>`
                        : `<span class="font-mono text-sm ${a.adjustments ? 'text-warning' : 'muted'}">${fmt(a.adjustments || 0)}</span>`
                    }
                </td>
                <td class="table-cell text-right font-mono font-bold">${fmt(total)}</td>
                <td class="table-cell text-center">${statusMap[a.status] || a.status}</td>
            </tr>`;
        }).join('');

        // Totals
        if (ui.devencionKpiTotal) ui.devencionKpiTotal.textContent = fmt(totalAccrued);
        if (ui.devencionesTotalFooter) ui.devencionesTotalFooter.textContent = fmt(totalAccrued);

        // Bind adjustment inputs
        ui.devencionesTableBody.querySelectorAll('.js-adj-input').forEach(inp => {
            inp.addEventListener('change', () => adjustAccrual(inp.dataset.id, parseFloat(inp.value) || 0));
        });
    }

    async function generateAccruals() {
        if (!state.activeWorkDay?.id) return;

        // Lápiz: Confirm before generating
        const confirmed = await window.Utils.confirmAction(
            '¿Generar devenciones de nómina para esta jornada? Se tomarán las convocatorias confirmadas y las tarifas vigentes.',
            { confirmText: 'Generar' }
        );
        if (!confirmed) return;

        // Tinta: Execute
        try {
            ui.btnGenerateAccruals.disabled = true;
            ui.btnGenerateAccruals.textContent = 'Generando...';

            const { data, error } = await window.sb.rpc('admin_generate_workday_accruals', {
                p_work_day_id: state.activeWorkDay.id
            });

            if (error) throw error;

            const result = data;
            if (result?.new_accruals > 0) {
                window.Toast.success(`${result.new_accruals} devencion(es) generada(s).`);
            } else {
                window.Toast.info('No se generaron nuevas devenciones (ya existían o no hay convocados confirmados).');
            }

            await loadAccruals();
        } catch (err) {
            console.error('[devenciones] Generate error:', err);
            window.Toast.error('Error al generar devenciones: ' + err.message);
        } finally {
            ui.btnGenerateAccruals.disabled = false;
        }
    }

    async function adjustAccrual(accrualId, adjustment) {
        try {
            const { error } = await window.sb
                .from('staff_accruals')
                .update({ adjustments: adjustment })
                .eq('id', accrualId)
                .eq('status', 'accrued'); // Only allow adjusting 'accrued' status

            if (error) throw error;
            window.Toast.success('Ajuste guardado.');
            await loadAccruals();
        } catch (err) {
            console.error('[devenciones] Adjust error:', err);
            window.Toast.error('Error al ajustar: ' + err.message);
        }
    }

    // Bind devenciones events
    if (ui.btnGenerateAccruals) {
        ui.btnGenerateAccruals.addEventListener('click', generateAccruals);
    }

    // ═══════════════════════════════════════════════════════════
    // GBOL SYNC (migrated from admin-cierre)
    // ═══════════════════════════════════════════════════════════
    async function handleGbolSync() {
        if (!state.activeWorkDay) {
            window.Toast.warning('Primero confirma una jornada.');
            return;
        }
        if (!window.GbolService) {
            window.Toast.error('GbolService no disponible.');
            return;
        }

        const btn = ui.btnSyncGbol;
        const prev = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sincronizando...';

        try {
            const dateStr = state.activeWorkDay.work_date;
            const result = await window.GbolService.syncNight(dateStr);

            if (result.facturacion > 0 || result.comandas > 0 || result.withdrawals > 0) {
                const parts = [];
                if (result.facturacion) parts.push(`${result.facturacion} fact`);
                if (result.comandas) parts.push(`${result.comandas} comandas`);
                if (result.withdrawals) parts.push(`${result.withdrawals} retiros`);
                window.Toast.success(`GBOL sync: ${parts.join(', ')}.`);
            } else {
                window.Toast.info('GBOL: Sin datos nuevos para esta noche.');
            }

            // Populate system amounts for terminals
            await window.GbolService.populateSystemAmounts(state.activeWorkDay.id, dateStr);

            // Reload cierre data + fiscal summary
            loadCierreData();
            loadFiscalSummary(dateStr);
            // Reset stock audit to re-fetch
            state.stockAuditLoaded = false;

        } catch (err) {
            console.error('[GBOL Sync]', err);
            window.Toast.error('Error sincronizando GBOL: ' + err.message);
        } finally {
            btn.textContent = prev;
            btn.disabled = false;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // FISCAL SUMMARY (GBOL mini-cards in Evento tab)
    // ═══════════════════════════════════════════════════════════
    async function loadFiscalSummary(dateStr) {
        if (!dateStr) return;
        try {
            const { data, error } = await window.sb
                .from('vw_fiscal_summary')
                .select('*')
                .eq('noche', dateStr)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                if (ui.fiscalCards) ui.fiscalCards.style.display = '';
                if (ui.fiscalBruto) ui.fiscalBruto.textContent = window.Utils.formatARS(data.total_bruto || 0);
                if (ui.fiscalPctBlanco) ui.fiscalPctBlanco.textContent = `${data.pct_blanqueado || 0}%`;
                if (ui.fiscalIva) ui.fiscalIva.textContent = window.Utils.formatARS(data.total_iva || 0);
                if (ui.fiscalTickets) ui.fiscalTickets.textContent = data.total_tickets || 0;
            } else {
                if (ui.fiscalCards) ui.fiscalCards.style.display = 'none';
            }
        } catch (err) {
            console.error('[fiscal-summary]', err);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // STOCK AUDIT TAB
    // ═══════════════════════════════════════════════════════════
    async function loadStockAuditData() {
        if (!state.activeWorkDay) return;
        const wdId = state.activeWorkDay.id;
        const dateStr = state.activeWorkDay.work_date;

        try {
            const [effRes, varRes, ctRes] = await Promise.all([
                window.sb.from('vw_bar_efficiency').select('*').eq('work_day_id', wdId),
                window.sb.from('vw_bar_audit_variance').select('*').eq('work_day_id', wdId),
                window.sb.from('vw_consumo_teorico').select('*').eq('noche', dateStr),
            ]);

            state.barEfficiency = effRes.data || [];
            state.barVariance = varRes.data || [];
            state.consumoTeorico = ctRes.data || [];
            state.stockAuditLoaded = true;

            // KPIs
            const totPhysical = state.barEfficiency.reduce((s, r) => s + Number(r.cost_physical || 0), 0);
            const totTheoretical = state.barEfficiency.reduce((s, r) => s + Number(r.cost_theoretical || 0), 0);
            const totLoss = state.barEfficiency.reduce((s, r) => s + Number(r.loss_amount || 0), 0);
            const avgRating = state.barEfficiency.length
                ? state.barEfficiency.reduce((s, r) => s + Number(r.efficiency_pct || 100), 0) / state.barEfficiency.length
                : 0;

            if (ui.saKpiPhysical) ui.saKpiPhysical.textContent = window.Utils.formatARS(totPhysical);
            if (ui.saKpiTheoretical) ui.saKpiTheoretical.textContent = window.Utils.formatARS(totTheoretical);
            if (ui.saKpiLoss) ui.saKpiLoss.textContent = window.Utils.formatARS(totLoss);
            if (ui.saKpiLossDelta) {
                const pctLoss = totTheoretical > 0 ? ((totLoss / totTheoretical) * 100).toFixed(1) : 0;
                ui.saKpiLossDelta.textContent = `${pctLoss}% del teórico`;
                ui.saKpiLossDelta.className = `stat-delta ${Number(pctLoss) > 5 ? 'is-negative' : 'is-positive'}`;
            }
            if (ui.saKpiRating) {
                const { emoji, label } = getEfficiencyRating(avgRating);
                ui.saKpiRating.textContent = `${emoji} ${avgRating.toFixed(0)}%`;
                ui.saKpiRating.title = label;
            }

            renderSessionsTable();
            renderVarianceTable('');
            renderConsumoTeorico();

        } catch (err) {
            console.error('[stock-audit]', err);
            window.Toast.error('Error cargando stock audit.');
        }
    }

    function getEfficiencyRating(pct) {
        if (pct >= 95) return { emoji: '🟢', label: 'Excelente' };
        if (pct >= 85) return { emoji: '🟡', label: 'Aceptable' };
        if (pct >= 70) return { emoji: '🟠', label: 'Bajo' };
        return { emoji: '🔴', label: 'Crítico' };
    }

    function renderSessionsTable() {
        if (!ui.saSessionsBody) return;
        if (!state.barEfficiency.length) {
            ui.saSessionsBody.innerHTML = '<tr><td colspan="8" class="cell-pad text-center muted">Sin sesiones de barra para esta noche</td></tr>';
            return;
        }

        ui.saSessionsBody.innerHTML = state.barEfficiency.map(s => {
            const varPct = s.efficiency_pct ? (100 - Number(s.efficiency_pct)).toFixed(1) : '—';
            const { emoji } = getEfficiencyRating(Number(s.efficiency_pct || 0));
            return `<tr class="table-row">
                <td class="table-cell">${window.Utils.escapeHtml(s.location_name || 'Sin ubicación')}</td>
                <td class="table-cell">${window.Utils.escapeHtml(s.barman_name || '—')}</td>
                <td class="table-cell text-right font-mono">${window.Utils.formatARS(s.revenue || 0)}</td>
                <td class="table-cell text-right font-mono">${window.Utils.formatARS(s.cost_physical || 0)}</td>
                <td class="table-cell text-right font-mono">${window.Utils.formatARS(s.cost_theoretical || 0)}</td>
                <td class="table-cell text-right font-mono">${window.Utils.formatARS(s.loss_amount || 0)}</td>
                <td class="table-cell text-right font-mono">${varPct}%</td>
                <td class="table-cell text-center">${emoji} ${Number(s.efficiency_pct || 0).toFixed(0)}%</td>
            </tr>`;
        }).join('');
    }

    function renderVarianceTable(filterClasif) {
        if (!ui.saVarianceBody) return;
        let rows = state.barVariance;
        if (filterClasif) rows = rows.filter(r => r.clasificacion === filterClasif);

        if (!rows.length) {
            ui.saVarianceBody.innerHTML = '<tr><td colspan="9" class="cell-pad text-center muted">Sin datos de varianza</td></tr>';
            return;
        }

        const statusMap = {
            'ALERTA_PERDIDA': { cls: 'status-error', label: '🔴 Pérdida' },
            'ERROR_REGISTRO': { cls: 'status-warning', label: '🟡 Error' },
            'DENTRO_DE_RANGO': { cls: 'status-success', label: '🟢 OK' },
            'SIN_MOVIMIENTO': { cls: 'status-muted', label: '⚪ Sin Mov.' },
        };

        ui.saVarianceBody.innerHTML = rows.map(r => {
            const st = statusMap[r.clasificacion] || statusMap['SIN_MOVIMIENTO'];
            return `<tr class="table-row">
                <td class="table-cell">${window.Utils.escapeHtml(r.sku_name || r.sku_id || '—')}</td>
                <td class="table-cell">${window.Utils.escapeHtml(r.category || '—')}</td>
                <td class="table-cell text-right font-mono">${r.qty_apertura ?? '—'}</td>
                <td class="table-cell text-right font-mono">${r.qty_cierre ?? '—'}</td>
                <td class="table-cell text-right font-mono">${r.consumo_real ?? '—'}</td>
                <td class="table-cell text-right font-mono">${r.consumo_sistema ?? '—'}</td>
                <td class="table-cell text-right font-mono">${r.diferencia ?? '—'}</td>
                <td class="table-cell text-right font-mono">${window.Utils.formatARS(r.costo_diferencia || 0)}</td>
                <td class="table-cell text-center"><span class="status-pill ${st.cls}">${st.label}</span></td>
            </tr>`;
        }).join('');
    }

    function renderConsumoTeorico() {
        if (!ui.saConsumoGbolBody) return;
        if (!state.consumoTeorico.length) {
            ui.saConsumoGbolBody.innerHTML = '<tr><td colspan="4" class="cell-pad text-center muted">Sin datos GBOL para esta noche</td></tr>';
            return;
        }

        ui.saConsumoGbolBody.innerHTML = state.consumoTeorico.map(c => `
            <tr class="table-row">
                <td class="table-cell">${window.Utils.escapeHtml(c.sku_name || c.sku_id || '—')}</td>
                <td class="table-cell text-right font-mono">${Number(c.qty_consumed || 0).toFixed(2)}</td>
                <td class="table-cell text-right font-mono">${window.Utils.formatARS(c.cost_consumed || 0)}</td>
                <td class="table-cell text-right font-mono">${c.ticket_count || 0}</td>
            </tr>
        `).join('');
    }

    // ═══════════════════════════════════════════════════════════
    // HISTÓRICO TAB (Premium — vw_night_snapshot)
    // ═══════════════════════════════════════════════════════════
    async function renderHistoryTable() {
        if (!ui.historyTableBody) return;

        try {
            const { data, error } = await window.sb
                .from('vw_night_snapshot')
                .select('work_date, event_name, status, total_income, gbol_efectivo, gbol_efectivo_neto, total_retiros, cant_retiros, cash_declared, conciliacion_diff, stock_loss, staff_cost')
                .order('work_date', { ascending: false })
                .limit(50);

            state.historyLoaded = true;

            if (error) throw error;

            if (!data || !data.length) {
                ui.historyTableBody.innerHTML = '<tr><td colspan="11" class="p-4 text-center muted italic">Sin jornadas registradas</td></tr>';
                return;
            }

            const fmt = (v) => v != null ? window.Utils.formatARS(v) : '—';
            const diffCell = (val) => {
                if (val == null) return '<td class="table-cell text-right font-mono muted">—</td>';
                const n = Number(val);
                const cls = n < 0 ? 'text-danger' : n > 0 ? 'text-success' : '';
                return `<td class="table-cell text-right font-mono ${cls}">${window.Utils.formatARS(n)}</td>`;
            };

            ui.historyTableBody.innerHTML = data.map(row => {
                const date = row.work_date || '—';
                const event = row.event_name || '—';
                const statusMap = {
                    'open': { cls: 'status-open', label: 'Abierta' },
                    'closed': { cls: 'status-success', label: 'Cerrada' },
                };
                const st = statusMap[row.status] || { cls: 'status-muted', label: row.status || '—' };

                const retiros = Number(row.total_retiros || 0);
                const retirosLabel = retiros > 0
                    ? `<span title="${row.cant_retiros} retiro(s)">${fmt(retiros)}</span>`
                    : '<span class="muted">—</span>';

                return `<tr class="table-row clickable-row" data-date="${date}" style="cursor:pointer;">
                    <td class="table-cell cell-pad font-mono">${date}</td>
                    <td class="table-cell">${window.Utils.escapeHtml(event)}</td>
                    <td class="table-cell text-right font-mono">${fmt(row.total_income)}</td>
                    <td class="table-cell text-right font-mono">${fmt(row.gbol_efectivo)}</td>
                    <td class="table-cell text-right font-mono">${retirosLabel}</td>
                    <td class="table-cell text-right font-mono">${fmt(row.gbol_efectivo_neto)}</td>
                    <td class="table-cell text-right font-mono">${fmt(row.cash_declared)}</td>
                    ${diffCell(row.conciliacion_diff)}
                    <td class="table-cell text-right font-mono">${fmt(row.stock_loss)}</td>
                    <td class="table-cell text-right font-mono">${fmt(row.staff_cost)}</td>
                    <td class="table-cell text-center"><span class="status-pill ${st.cls}">${st.label}</span></td>
                </tr>`;
            }).join('');

            // Click to navigate to that date
            ui.historyTableBody.querySelectorAll('.clickable-row').forEach(tr => {
                tr.addEventListener('click', () => {
                    const d = tr.dataset.date;
                    if (d && ui.inputDate) {
                        ui.inputDate.value = d;
                        handleDateChange();
                        switchTab('panelPlan');
                    }
                });
            });

        } catch (err) {
            console.error('[history]', err);
            ui.historyTableBody.innerHTML = '<tr><td colspan="11" class="p-4 text-center text-danger">Error cargando historial</td></tr>';
        }
    }

    // Start
    init();

})();
