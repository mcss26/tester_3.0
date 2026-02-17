/**
 * Module: admin-workdays.js
 * Standard: logic-engineer (2026)
 * Description: Workday Management - 3-Tab Dashboard (PLANNER / NIGHT CHIEF / REPORT)
 * Status Machine: DRAFT → PLANNED → ACTIVE → CLOSED
 * Integrates cash closing, GBOL sync, stock audit, and premium history.
 */

(async function () {
    'use strict';

    // ── Status Machine Constants ──
    const STATUS = Object.freeze({
        DRAFT:     'DRAFT',
        PLANNED:   'PLANNED',
        ACTIVE:    'ACTIVE',
        CLOSED:    'CLOSED',
        CANCELLED: 'CANCELLED',
    });

    const STATUS_DISPLAY = Object.freeze({
        [STATUS.DRAFT]:   { label: 'Borrador',    cls: 'status-draft' },
        [STATUS.PLANNED]: { label: 'Planificada', cls: 'status-planned' },
        [STATUS.ACTIVE]:  { label: 'ABIERTA',     cls: 'status-open' },
        [STATUS.CLOSED]:  { label: 'Cerrada',     cls: 'status-closed' },
    });

    function getStatusDisplay(status) {
        return STATUS_DISPLAY[status] || { label: status || '—', cls: 'status-muted' };
    }

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
        btnAddCost: document.getElementById('btn-add-cost'),
        costModal: document.getElementById('costModal'),
        costModalTitle: document.getElementById('costModalTitle'),
        inputCostName: document.getElementById('input-cost-name'),
        inputCostAmount: document.getElementById('input-cost-amount'),
        inputCostId: document.getElementById('input-cost-id'),
        btnCancelCostModal: document.getElementById('btnCancelCostModal'),
        btnSaveCost: document.getElementById('btnSaveCost'),

        // ── Cierre / Evento Tab ──
        tabBar: document.getElementById('workday-tabs'),

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

        // ── P&L Modal (Sprint 3) ──
        pnlHealthBadge: document.getElementById('pnl-health-badge'),
        pnlIncomeCash: document.getElementById('pnl-income-cash'),
        pnlIncomeQr: document.getElementById('pnl-income-qr'),
        pnlIncomeBar: document.getElementById('pnl-income-bar'),
        pnlTotalIncome: document.getElementById('pnl-total-income'),
        pnlExpenseStaff: document.getElementById('pnl-expense-staff'),
        pnlExpenseStock: document.getElementById('pnl-expense-stock'),
        pnlExpenseExtras: document.getElementById('pnl-expense-extras'),
        pnlTotalExpense: document.getElementById('pnl-total-expense'),
        pnlNetResult: document.getElementById('pnl-net-result'),
        pnlMarginPct: document.getElementById('pnl-margin-pct'),
        pnlBreakevenFill: document.getElementById('pnl-breakeven-fill'),
        pnlBreakevenLabel: document.getElementById('pnl-breakeven-label'),
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

        // ── Report Dashboard ──
        rptDate: document.getElementById('rpt-date'),
        rptEvent: document.getElementById('rpt-event'),
        rptHealthBadge: document.getElementById('rpt-health-badge'),
        rptKpiRevenue: document.getElementById('rpt-kpi-revenue'),
        rptKpiNet: document.getElementById('rpt-kpi-net'),
        rptKpiMargin: document.getElementById('rpt-kpi-margin'),
        rptKpiPercapita: document.getElementById('rpt-kpi-percapita'),
        rptKpiScore: document.getElementById('rpt-kpi-score'),
        rptKpiRevenueDelta: document.getElementById('rpt-kpi-revenue-delta'),
        rptKpiNetDelta: document.getElementById('rpt-kpi-net-delta'),
        rptKpiMarginDelta: document.getElementById('rpt-kpi-margin-delta'),
        rptKpiPercapitaDelta: document.getElementById('rpt-kpi-percapita-delta'),
        rptKpiScoreDelta: document.getElementById('rpt-kpi-score-delta'),
        rptChartCanvas: document.getElementById('rpt-chart'),
        rptChartMode: document.getElementById('rpt-chart-mode'),
        rptChartMargin: document.getElementById('rpt-chart-margin'),
        rptChartBreakeven: document.getElementById('rpt-chart-breakeven'),
        rptFiscalBody: document.getElementById('rpt-fiscal-body'),
        rptAnomaliesList: document.getElementById('rpt-anomalies-list'),
        rptOpsStockPrecision: document.getElementById('rpt-ops-stock-precision'),
        rptOpsStockLoss: document.getElementById('rpt-ops-stock-loss'),
        rptOpsStockSkus: document.getElementById('rpt-ops-stock-skus'),
        rptOpsCajaDiff: document.getElementById('rpt-ops-caja-diff'),
        rptOpsCajaTerminals: document.getElementById('rpt-ops-caja-terminals'),
        rptOpsNominaCount: document.getElementById('rpt-ops-nomina-count'),
        rptOpsNominaCost: document.getElementById('rpt-ops-nomina-cost'),

        // ── Pre-flight Modal (Sprint 3) ──
        preFlightModal: document.getElementById('preFlightModal'),
        preFlightChecks: document.getElementById('preflight-checks'),
        preFlightStatusBadge: document.getElementById('preflight-status-badge'),
        btnConfirmPreFlight: document.getElementById('btnConfirmPreFlight'),
        btnCancelPreFlight: document.getElementById('btnCancelPreFlight'),

        // ── LIVE Indicator (Sprint 5) ──
        liveDot: document.getElementById('live-dot'),
        liveChip: document.getElementById('live-chip'),
        liveChipTime: document.getElementById('live-chip-time'),

        // ── Sprint 4: Templates & Break-Even ──
        selectTemplate: document.getElementById('select-template'),
        btnSaveTemplate: document.getElementById('btn-save-template'),
        templateModal: document.getElementById('templateModal'),
        templateModalTitle: document.getElementById('templateModalTitle'),
        inputTemplateName: document.getElementById('input-template-name'),
        inputTemplateId: document.getElementById('input-template-id'),
        btnCancelTemplateModal: document.getElementById('btnCancelTemplateModal'),
        btnSaveTemplateConfirm: document.getElementById('btnSaveTemplate'),
        breakevenCard: document.getElementById('breakeven-card'),
        beCost: document.getElementById('be-cost'),
        beAvgRevenue: document.getElementById('be-avg-revenue'),
        beProgressBar: document.getElementById('be-progress-bar'),
        beProgressPct: document.getElementById('be-progress-pct'),
        benchmarkPills: document.getElementById('benchmark-pills'),
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

        // Report Dashboard state
        reportDashboardLoaded: false,
        reportChartInstance: null,

        // Sprint 4: Templates & Benchmarks
        templates: [],
        benchmarks: null,   // { avg_revenue, avg_attendance, avg_margin, sample_count }
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

        // Cost Modal
        ui.btnAddCost?.addEventListener('click', () => openCostModal());
        ui.btnCancelCostModal?.addEventListener('click', closeCostModal);
        ui.btnSaveCost?.addEventListener('click', handleSaveCost);

        // Cost Edit (delegated)
        ui.costsContainer?.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.js-edit-cost');
            if (editBtn) openCostModal(editBtn.dataset.costId);
        });

        // ── Tab Bar ──
        ui.tabBar?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-tab]');
            if (btn) switchTab(btn.dataset.tab);
        });

        // ── Cierre / Evento events ──
        ui.btnCloseNight?.addEventListener('click', openCloseNightModal);
        ui.btnConfirmCloseNight?.addEventListener('click', performCloseNight);
        ui.btnCancelCloseNight?.addEventListener('click', () => ui.closeNightModal?.classList.add('hidden'));

        // ── Pre-flight events (Sprint 3) ──
        ui.btnConfirmPreFlight?.addEventListener('click', handlePreFlightConfirm);
        ui.btnCancelPreFlight?.addEventListener('click', () => ui.preFlightModal?.classList.add('hidden'));

        // ── Sprint 4: Template events ──
        ui.selectTemplate?.addEventListener('change', handleApplyTemplate);
        ui.btnSaveTemplate?.addEventListener('click', openTemplateModal);
        ui.btnCancelTemplateModal?.addEventListener('click', () => ui.templateModal?.classList.add('hidden'));
        ui.btnSaveTemplateConfirm?.addEventListener('click', handleSaveTemplate);

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

    // ── Tab Switching (Status-Aware) ──
    const TAB_IDS = ['panelPlanner', 'panelNightChief', 'panelReport'];

    function switchTab(tabId) {
        // Guard: enforce visibility rules
        const status = state.activeWorkDay?.status;
        if (tabId === 'panelNightChief' && status !== STATUS.ACTIVE) {
            window.Toast.warning('Night Chief solo disponible con jornada ABIERTA.');
            return;
        }
        if (tabId === 'panelReport' && status !== STATUS.CLOSED && !state.historyLoaded) {
            // Allow report tab if history has been loaded or day is closed
        }

        state.activeTab = tabId;
        TAB_IDS.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', id !== tabId);
        });
        ui.tabBar?.querySelectorAll('.tab-chip').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
            btn.setAttribute('aria-selected', btn.dataset.tab === tabId ? 'true' : 'false');
        });

        // Lazy-load cierre data when entering Night Chief tab
        if (tabId === 'panelNightChief' && state.activeWorkDay && !state.cierreLoaded) {
            loadCierreData();
        }
        // Lazy-load accruals (only re-fetch on date change or mutation)
        if (tabId === 'panelNightChief' && state.activeWorkDay && !state.accrualsLoaded) {
            loadAccruals();
        }
        // Lazy-load Stock Audit data (now part of Night Chief panel)
        if (tabId === 'panelNightChief' && state.activeWorkDay && !state.stockAuditLoaded) {
            loadStockAuditData();
        }
        // Lazy-load history + Report dashboard
        if (tabId === 'panelReport' && !state.historyLoaded) {
            renderHistoryTable();
        }
        if (tabId === 'panelReport' && !state.reportDashboardLoaded) {
            loadReportDashboard();
        }

        // Polling lifecycle
        if (tabId === 'panelNightChief') {
            startPolling();
        } else {
            stopPolling();
        }
    }

    // ── Tab Visibility Update (called on status change) ──
    function updateTabVisibility() {
        const status = state.activeWorkDay?.status;
        const tabs = ui.tabBar?.querySelectorAll('.tab-chip') || [];

        tabs.forEach(btn => {
            const tab = btn.dataset.tab;
            switch (tab) {
                case 'panelPlanner':
                    btn.disabled = false;
                    btn.classList.remove('tab-disabled');
                    break;
                case 'panelNightChief':
                    if (status === STATUS.ACTIVE) {
                        btn.disabled = false;
                        btn.classList.remove('tab-disabled');
                    } else {
                        btn.disabled = true;
                        btn.classList.add('tab-disabled');
                    }
                    break;
                case 'panelReport':
                    // Always accessible (shows history)
                    btn.disabled = false;
                    btn.classList.remove('tab-disabled');
                    break;
            }
        });
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
                window.sb.from('master_staff_roles').select('id, name, area, base_rate').eq('active', true).order('name'),
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

            // Sprint 4: Load templates & benchmarks in background
            loadTemplates();
            loadBenchmarks();
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
                .neq('status', STATUS.CANCELLED)
                .maybeSingle();

            if (error) throw error;

            if (day) {
                // FOUND -> Edit Mode
                state.activeWorkDay = day;
                const sd = getStatusDisplay(day.status);
                ui.statusIndicator.textContent = sd.label;
                ui.statusIndicator.className = `status-pill-header ${sd.cls}`;
                ui.statusIndicator.classList.remove('is-checking');

                // Dynamic button label per status
                updateFooterButtons(day.status);
                updateTabVisibility();

                // Load Details
                await loadDayDetails(day.id);

            } else {
                // NEW -> Draft Mode
                state.activeWorkDay = null;
                ui.statusIndicator.textContent = 'Nueva (Borrador)';
                ui.statusIndicator.className = 'status-pill-header status-draft';
                ui.statusIndicator.classList.remove('is-checking');

                updateFooterButtons(null); // No day yet → create mode
                updateTabVisibility();
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
                        <span class="item-meta">Budget: ${window.Utils.formatARS(role.base_rate)}</span>
                    </div>
                    <div class="item-controls">
                        <span class="text-xs mr-2 text-muted">Cupo:</span>
                        <input type="number" min="0" max="99" value="${qty}" 
                            class="input input-compact text-center w-70"
                            data-action="qty-change"
                            data-role-id="${role.id}">
                        <span class="badge badge-quiet text-xs" style="min-width: 80px; text-align: right;">
                            ${window.Utils.formatARS(qty * (role.base_rate || 0))}
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
        const eligibleUsers = state.users.filter((u) =>
            ["staff", "encargado", "admin"].includes(u.role?.toLowerCase()),
        );

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
                    <button class="btn-icon btn-sm js-edit-cost" data-cost-id="${cost.id}" title="Editar definición">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `}).join('');
    }

    function calculateTotals() {
        let staffTotal = 0;
        let fixedTotal = 0;

        state.roles.forEach(role => {
            const qty = state.staffPlan[role.id] || 0;
            const rate = role.base_rate || 0;
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

        // Sprint 4: Update break-even card
        updateBreakEvenCard(staffTotal + fixedTotal);
    }

    // 10. Actions — Status Machine Dispatcher
    async function handleConfirmOrUpdate() {
        if (!state.activeWorkDay) {
            await handleCreate();
            return;
        }

        // Dispatch by current status
        switch (state.activeWorkDay.status) {
            case STATUS.DRAFT:
                await handleConfirmPlan(); // DRAFT → PLANNED
                break;
            case STATUS.PLANNED:
                await handleOpen(); // PLANNED → ACTIVE
                break;
            case STATUS.ACTIVE:
                await handleUpdate(); // Save edits while ACTIVE
                break;
            default:
                await handleUpdate();
        }
    }

    // ── Create Day (no status yet → DRAFT) ──
    async function handleCreate() {
        const dateVal = ui.inputDate.value;
        if (!dateVal) return window.Toast.warning('Selecciona fecha.');

        const confirmed = await window.Utils.confirmAction(
            `¿Crear jornada para ${window.WorkDayHelper.formatDate(dateVal)}?`, { confirmText: 'Crear' }
        );
        if (!confirmed) return;

        window.Utils.setPageState(ui, { loading: true });
        
        try {
            // A. Create Day in DRAFT
            const { data: day, error: errDay } = await window.sb.from('work_days')
                .insert({ work_date: dateVal, notes: ui.inputNotes.value, status: STATUS.DRAFT })
                .select().single();
            if (errDay) throw errDay;

            // B. Staff Plan
            const staffPayload = state.roles
                .filter(r => (state.staffPlan[r.id] || 0) > 0)
                .map(role => ({
                    work_day_id: day.id,
                    role_id: role.id,
                    quantity: state.staffPlan[role.id],
                    approved_budget: state.staffPlan[role.id] * (role.base_rate || 0)
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

            // NOTE: No rpc_open_work_day here — day stays in DRAFT until confirmed
            window.Toast.success('Jornada creada en Borrador.');
            
            // Reload to enter "Edit Mode"
            handleDateChange();

        } catch (e) {
            console.error(e);
            window.Toast.error('Falló creación.');
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    // ── Confirm Plan (DRAFT → PLANNED) ──
    async function handleConfirmPlan() {
        if (!state.activeWorkDay) return;
        const ok = await window.Utils.confirmAction(
            '¿Confirmar planificación? La jornada quedará lista para abrir.',
            { confirmText: 'Confirmar Plan' }
        );
        if (!ok) return;

        window.Utils.setPageState(ui, { loading: true });
        try {
            // Save any pending staff/cost changes first
            await handleUpdate();

            const { error } = await window.sb.rpc('rpc_confirm_work_day', {
                p_work_day_id: state.activeWorkDay.id
            });
            if (error) throw error;

            window.Toast.success('Planificación confirmada.');
            handleDateChange();
        } catch (e) {
            console.error(e);
            window.Toast.error('Error al confirmar plan.');
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    // ── Open Day (PLANNED → ACTIVE) — Sprint 3: Pre-flight gate ──
    function handleOpen() {
        if (!state.activeWorkDay) return;
        showPreFlightModal();
    }

    function showPreFlightModal() {
        const wd = state.activeWorkDay;
        const checks = runPreFlightChecks(wd);
        const criticalFails = checks.filter(c => !c.pass && c.critical);

        // Render checklist
        ui.preFlightChecks.innerHTML = checks.map(c => `
            <div class="preflight-item ${c.pass ? 'preflight-pass' : (c.critical ? 'preflight-fail' : 'preflight-warn')}">
                <span class="preflight-icon">${c.pass ? '✅' : (c.critical ? '❌' : '⚠️')}</span>
                <div class="preflight-detail">
                    <span class="preflight-label">${c.label}</span>
                    <span class="preflight-info text-xs muted">${c.info}</span>
                </div>
            </div>
        `).join('');

        // Badge
        if (criticalFails.length > 0) {
            ui.preFlightStatusBadge.textContent = 'Bloqueado';
            ui.preFlightStatusBadge.className = 'status-pill staff-status-absent';
        } else if (!checks.every(c => c.pass)) {
            ui.preFlightStatusBadge.textContent = 'Con advertencias';
            ui.preFlightStatusBadge.className = 'status-pill staff-status-pending';
        } else {
            ui.preFlightStatusBadge.textContent = 'Listo';
            ui.preFlightStatusBadge.className = 'status-pill staff-status-active';
        }

        ui.btnConfirmPreFlight.disabled = criticalFails.length > 0;
        ui.preFlightModal?.classList.remove('hidden');
    }

    function runPreFlightChecks(wd) {
        const checks = [];

        // 1. Staff convocado (critical)
        const staffCards = ui.staffContainer?.querySelectorAll('.staff-role-card') || [];
        const assignedStaff = Array.from(staffCards).filter(card => {
            const select = card.querySelector('select');
            return select && select.value;
        }).length;
        checks.push({
            label: 'Staff convocado',
            info: assignedStaff > 0 ? `${assignedStaff} persona(s) asignada(s)` : 'Sin staff asignado',
            pass: assignedStaff > 0,
            critical: true
        });

        // 2. Costos de apertura (warning)
        const costCards = ui.costsContainer?.querySelectorAll('.cost-item') || [];
        checks.push({
            label: 'Costos de apertura',
            info: costCards.length > 0 ? `${costCards.length} costo(s) cargado(s)` : 'Sin costos — procederá con $0',
            pass: costCards.length > 0,
            critical: false
        });

        // 3. Evento vinculado (warning)
        const hasEvent = ui.selectEvent?.value && ui.selectEvent.value !== '';
        checks.push({
            label: 'Evento vinculado',
            info: hasEvent ? ui.selectEvent.options[ui.selectEvent.selectedIndex]?.text || 'Sí' : 'Sin evento — noche genérica',
            pass: hasEvent,
            critical: false
        });

        // 4. Fecha válida (critical)
        const dateVal = ui.inputDate?.value;
        checks.push({
            label: 'Fecha operativa',
            info: dateVal || 'Sin fecha',
            pass: !!dateVal,
            critical: true
        });

        return checks;
    }

    async function handlePreFlightConfirm() {
        ui.preFlightModal?.classList.add('hidden');
        window.Utils.setPageState(ui, { loading: true });
        try {
            await window.sb.rpc('rpc_open_work_day', { p_work_day_id: state.activeWorkDay.id });
            window.Toast.success('Jornada abierta.');
            handleDateChange();
        } catch (e) {
            console.error(e);
            window.Toast.error('Error al abrir jornada.');
        } finally {
            window.Utils.setPageState(ui, { loading: false });
        }
    }

    // handleRevert removed — PLANNED→DRAFT revert not yet wired in UI

    // ── Dynamic footer buttons ──
    function updateFooterButtons(status) {
        const btnSave = document.getElementById('btn-save-planning');
        if (!ui.btnConfirm) return;

        if (!status) {
            // New day — create mode
            ui.btnConfirm.textContent = 'Crear Jornada';
            ui.btnConfirm.classList.add('btn-primary');
            ui.btnConfirm.classList.remove('btn-secondary', 'btn-danger');
            ui.btnConfirm.disabled = false;
            if (btnSave) btnSave.disabled = true;
            return;
        }

        switch (status) {
            case STATUS.DRAFT:
                ui.btnConfirm.textContent = 'Confirmar Plan';
                ui.btnConfirm.classList.add('btn-primary');
                ui.btnConfirm.classList.remove('btn-secondary', 'btn-danger');
                ui.btnConfirm.disabled = false;
                if (btnSave) btnSave.disabled = false;
                break;
            case STATUS.PLANNED:
                ui.btnConfirm.textContent = 'Abrir Jornada';
                ui.btnConfirm.classList.add('btn-primary');
                ui.btnConfirm.classList.remove('btn-secondary', 'btn-danger');
                ui.btnConfirm.disabled = false;
                if (btnSave) btnSave.disabled = false;
                break;
            case STATUS.ACTIVE:
                ui.btnConfirm.textContent = 'Actualizar Jornada';
                ui.btnConfirm.classList.add('btn-secondary');
                ui.btnConfirm.classList.remove('btn-primary', 'btn-danger');
                ui.btnConfirm.disabled = false;
                if (btnSave) btnSave.disabled = false;
                break;
            case STATUS.CLOSED:
                ui.btnConfirm.textContent = 'Cerrada';
                ui.btnConfirm.disabled = true;
                ui.btnConfirm.classList.remove('btn-primary', 'btn-danger');
                ui.btnConfirm.classList.add('btn-secondary');
                if (btnSave) btnSave.disabled = true;
                break;
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
                approved_budget: (state.staffPlan[role.id] || 0) * (role.base_rate || 0)
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

    // 11. Modal Logic (Events & Costs)
    function openEventModal() { ui.createEventModal.classList.remove('hidden'); }
    function closeEventModal() { ui.createEventModal.classList.add('hidden'); }

    function openCostModal(costId) {
        // Reset
        ui.inputCostName.value = '';
        ui.inputCostAmount.value = '';
        ui.inputCostId.value = '';

        if (costId) {
            // Edit mode
            const cost = state.openingCosts.find(c => c.id === costId);
            if (cost) {
                ui.costModalTitle.textContent = 'Editar Costo de Apertura';
                ui.inputCostName.value = cost.title;
                ui.inputCostAmount.value = cost.base_amount;
                ui.inputCostId.value = cost.id;
            }
        } else {
            // Add mode
            ui.costModalTitle.textContent = 'Agregar Costo de Apertura';
        }

        ui.costModal.classList.remove('hidden');
        ui.inputCostName.focus();
    }

    function closeCostModal() {
        ui.costModal.classList.add('hidden');
    }

    async function handleSaveCost() {
        const title = ui.inputCostName.value.trim();
        const amount = parseFloat(ui.inputCostAmount.value);
        const editId = ui.inputCostId.value || null;

        if (!title || isNaN(amount) || amount < 0) {
            return window.Toast.warning('Completa nombre y monto válido.');
        }

        const btn = ui.btnSaveCost;
        const prevText = btn.textContent;
        btn.textContent = 'Guardando...';
        btn.disabled = true;

        try {
            if (editId) {
                // ── UPDATE ──
                const { error } = await window.sb.from('cost_definitions')
                    .update({ title, base_amount: amount })
                    .eq('id', editId);

                if (error) throw error;

                // Update local state
                const idx = state.openingCosts.findIndex(c => c.id === editId);
                if (idx !== -1) {
                    state.openingCosts[idx].title = title;
                    state.openingCosts[idx].base_amount = amount;
                }
                state.costsPlan[editId] = { amount, isAdjusted: false };

                window.Toast.success('Costo actualizado.');
            } else {
                // ── INSERT ──
                const { data, error } = await window.sb.from('cost_definitions')
                    .insert({
                        title,
                        base_amount: amount,
                        frequency: 'per_event',
                        is_active: true
                    })
                    .select()
                    .single();

                if (error) throw error;

                state.openingCosts.push(data);
                state.costsPlan[data.id] = { amount: data.base_amount, isAdjusted: false };

                window.Toast.success('Costo agregado.');
            }

            // Re-render
            renderCostsList();
            calculateTotals();
            closeCostModal();

        } catch (e) {
            console.error(e);
            window.Toast.error('Error guardando costo.');
        } finally {
            btn.textContent = prevText;
            btn.disabled = false;
        }
    }
    
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
                    code: window.Utils.generateUUID(),
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
        // Switch to Night Chief tab for review before closing
        ui.inputDate.value = date;
        await handleDateChange();
        switchTab('panelNightChief');
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
                    .insert({ work_day_id: wdId, status: STATUS.ACTIVE, total_system: 0, total_declared: 0, total_difference: 0 })
                    .select().single();
                if (createErr) { window.Toast.error('No se pudo crear cierre de caja.'); return; }
                closing = newC;
                window.Toast.info('Cierre de caja creado automáticamente.');
            }

            state.closingId = closing.id;
            ui.closingNotes.value = closing.notes || '';
            ui.btnCloseNight.disabled = closing.status === STATUS.CLOSED;
            ui.btnCloseNight.textContent = closing.status === STATUS.CLOSED ? 'CERRADO' : 'CERRAR NOCHE';

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

    // ── Close Night (Hardened — Pre-flight + Server-side validation) ──
    // Preflight data cache for the current modal session
    let _preflightData = null;

    async function openCloseNightModal() {
        if (!state.activeWorkDay) return;

        // ── Step 1: Run pre-flight checklist via RPC ──
        // All validation + financial calculation happens server-side
        try {
            const { data: preflight, error: pfErr } = await window.sb.rpc('rpc_preflight_close_workday', {
                p_work_day_id: state.activeWorkDay.id
            });
            if (pfErr) { window.Toast.error(pfErr.message); return; }

            _preflightData = preflight;

            // Cache the cash_closing_id from preflight if we don't have it yet
            if (preflight.cash_closing_id && !state.closingId) {
                state.closingId = preflight.cash_closing_id;
            }

            // ── Step 2: Render pre-flight checks (visual only) ──
            renderPreflightChecks(preflight.checks);

            // ── Step 3: Render financial summary from server ──
            renderFinancialSummary(preflight.financial_summary);

            // ── Step 4: Fetch P&L + Health Score for the modal cards ──
            await _populatePnlModal();

            // ── Step 5: Enable/disable close button based on can_close ──
            if (ui.btnConfirmCloseNight) {
                ui.btnConfirmCloseNight.disabled = !preflight.can_close;
            }

        } catch (err) {
            console.error('[preflight] Error:', err);
            window.Toast.error('Error al ejecutar pre-flight: ' + (err.message || err));
            return;
        }

        ui.closeNightModal?.classList.remove('hidden');
    }

    /**
     * Renders the pre-flight check results in the confirmation modal.
     * Each check is displayed as a row with ✅/❌/⚠️ icons.
     */
    function renderPreflightChecks(checks) {
        // Use confirmDiffDisplay area to show structured checks
        if (!ui.confirmDiffDisplay) return;

        if (!checks || checks.length === 0) {
            ui.confirmDiffDisplay.innerHTML = '<span class="muted">Sin datos de validación</span>';
            return;
        }

        const rows = checks.map(c => {
            const icon = c.pass ? '✅' : (c.blocking ? '❌' : '⚠️');
            const cls = c.pass ? 'text-success' : (c.blocking ? 'text-error' : 'text-warning');
            return `<div class="preflight-row" style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                <span style="font-size:1.1em;">${icon}</span>
                <span class="font-bold" style="min-width:180px;">${window.Utils.escapeHtml(c.label)}</span>
                <span class="${cls} text-sm">${window.Utils.escapeHtml(c.detail)}</span>
            </div>`;
        }).join('');

        ui.confirmDiffDisplay.innerHTML = rows;
    }

    /**
     * Renders the financial summary from the pre-flight RPC response.
     * Maps directly to existing UI element IDs to preserve modal layout.
     */
    function renderFinancialSummary(summary) {
        if (!summary) return;
        const fmt = window.Utils.formatARS;

        // Cash/Zoco KPIs (Night Chief tab)
        if (ui.evtKpiSystem) ui.evtKpiSystem.textContent = fmt(summary.total_system || 0);
        if (ui.evtKpiDeclared) ui.evtKpiDeclared.textContent = fmt(summary.total_declared || 0);
        if (ui.evtKpiDiff) {
            const diff = summary.total_difference || 0;
            ui.evtKpiDiff.textContent = fmt(diff);
            applyDiffClass(ui.evtKpiDiff, diff);
        }

        // Totals row in cierre table
        if (ui.totalCashSys) ui.totalCashSys.textContent = fmt(summary.cash_system || 0);
        if (ui.totalZocoSys) ui.totalZocoSys.textContent = fmt(summary.zoco_system || 0);
        if (ui.totalCashDecl) ui.totalCashDecl.textContent = fmt(summary.cash_declared || 0);
        if (ui.totalZocoDecl) ui.totalZocoDecl.textContent = fmt(summary.zoco_declared || 0);
        if (ui.totalDiff) {
            ui.totalDiff.textContent = fmt(summary.total_difference || 0);
            applyDiffClass(ui.totalDiff, summary.total_difference || 0);
        }
    }

    /**
     * Populates the P&L and Health Score cards inside the close-night modal.
     * Fetches from vw_workday_pnl + calculate_health_score.
     */
    async function _populatePnlModal() {
        const fmtPnl = (v) => v != null ? window.Utils.formatARS(v) : '—';
        try {
            const [pnlRes, hsRes] = await Promise.all([
                window.sb.from('vw_workday_pnl')
                    .select('*')
                    .eq('work_day_id', state.activeWorkDay.id)
                    .maybeSingle(),
                window.sb.rpc('calculate_health_score', {
                    p_work_day_id: state.activeWorkDay.id
                })
            ]);

            // Populate P&L card
            const pnl = pnlRes.data;
            if (pnl) {
                ui.pnlIncomeCash.textContent = fmtPnl(pnl.income_cash);
                ui.pnlIncomeQr.textContent = fmtPnl(pnl.income_qr);
                ui.pnlIncomeBar.textContent = fmtPnl(pnl.income_bar);
                ui.pnlTotalIncome.textContent = fmtPnl(pnl.total_income);
                ui.pnlExpenseStaff.textContent = fmtPnl(pnl.expense_staff);
                ui.pnlExpenseStock.textContent = fmtPnl(pnl.expense_stock);
                ui.pnlExpenseExtras.textContent = fmtPnl(pnl.expense_extras);
                ui.pnlTotalExpense.textContent = fmtPnl(pnl.total_expense);

                const net = pnl.net_result || 0;
                ui.pnlNetResult.textContent = fmtPnl(net);
                ui.pnlNetResult.classList.toggle('text-success', net > 0);
                ui.pnlNetResult.classList.toggle('text-danger', net < 0);

                const margin = pnl.margin_pct;
                ui.pnlMarginPct.textContent = margin != null ? `${Number(margin).toFixed(1)}%` : '—';

                // Break-even progress
                const totalIncome = pnl.total_income || 0;
                const totalExpense = pnl.total_expense || 0;
                const bePct = totalExpense > 0 ? Math.min((totalIncome / totalExpense) * 100, 150) : 0;
                ui.pnlBreakevenFill.style.width = `${Math.min(bePct, 100)}%`;
                ui.pnlBreakevenFill.classList.toggle('be-over', bePct >= 100);
                ui.pnlBreakevenFill.classList.toggle('be-under', bePct < 100);
                ui.pnlBreakevenLabel.textContent = `Break-even: ${bePct.toFixed(0)}%`;
            }

            // Populate Health Score badge
            const hs = hsRes.data;
            if (hs != null) {
                const score = Number(hs);
                ui.pnlHealthBadge.textContent = `${score}/100`;
                ui.pnlHealthBadge.className = 'status-pill ' +
                    (score >= 75 ? 'staff-status-active' :
                     score >= 50 ? 'staff-status-pending' : 'staff-status-absent');
            } else {
                ui.pnlHealthBadge.textContent = '—';
                ui.pnlHealthBadge.className = 'status-pill';
            }
        } catch (err) {
            console.warn('[pnl-modal] Could not load P&L data:', err);
            // Modal still opens — P&L fields just show '—'
        }
    }

    async function performCloseNight() {
        ui.closeNightModal?.classList.add('hidden');
        ui.btnCloseNight.disabled = true;
        ui.btnCloseNight.textContent = 'Cerrando...';

        try {
            // ── ONE call. The RPC validates AND closes. ──
            // Guards (bars, terminals, status) are enforced server-side.
            // Financial totals are calculated from closing_terminals in SQL.
            const { data: closeResult, error: closeErr } = await window.sb.rpc('rpc_close_work_day', {
                p_work_day_id: state.activeWorkDay.id,
                p_cash_closing_id: state.closingId || null
            });
            if (closeErr) throw closeErr;

            console.log('[cierre] Result:', closeResult);

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
    // 13. NIGHT CHIEF LIVE (Phase D)
    // ═══════════════════════════════════════════════════════════

    let pollingTimer = null;
    const POLL_INTERVAL_MS = 60_000; // 60 seconds

    function startPolling() {
        if (pollingTimer) return; // Already running
        if (state.activeWorkDay?.status !== STATUS.ACTIVE) return;
        console.log('[night-chief] Polling started (60s)');
        pollingTimer = setInterval(pollKPIs, POLL_INTERVAL_MS);
        pollKPIs(); // Immediate first fetch

        // Sprint 5: Show LIVE indicator
        ui.liveDot?.classList.remove('hidden');
        ui.liveChip?.classList.remove('hidden');
    }

    function stopPolling() {
        if (pollingTimer) {
            clearInterval(pollingTimer);
            pollingTimer = null;
            console.log('[night-chief] Polling stopped');
        }

        // Sprint 5: Hide LIVE indicator
        ui.liveDot?.classList.add('hidden');
        ui.liveChip?.classList.add('hidden');
    }

    async function pollKPIs() {
        if (!state.activeWorkDay || state.activeWorkDay.status !== STATUS.ACTIVE) {
            stopPolling();
            return;
        }

        try {
            const wdId = state.activeWorkDay.id;

            // Parallel fetch: cierre totals + daily sales
            const [closingRes, salesRes] = await Promise.all([
                window.sb.from('cash_closings')
                    .select('total_system, total_declared, total_difference')
                    .eq('work_day_id', wdId).maybeSingle(),
                window.sb.from('vw_daily_sales')
                    .select('bar_sales_system, qr_total')
                    .eq('work_day_id', wdId).maybeSingle()
            ]);

            // Update KPI displays if elements exist
            const closing = closingRes.data;
            const sales = salesRes.data;

            if (closing) {
                if (ui.evtKpiSystem) ui.evtKpiSystem.textContent = window.Utils.formatARS(closing.total_system || 0);
                if (ui.evtKpiDeclared) ui.evtKpiDeclared.textContent = window.Utils.formatARS(closing.total_declared || 0);
                if (ui.totalDiff) {
                    const diff = closing.total_difference || 0;
                    ui.totalDiff.textContent = window.Utils.formatARS(diff);
                    applyDiffClass(ui.totalDiff, diff);
                }
            }

            // Run anomaly checks
            checkAnomalies(closing, sales);

            // Sprint 5: Update LIVE timestamp
            if (ui.liveChipTime) {
                const now = new Date();
                ui.liveChipTime.textContent = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }

        } catch (err) {
            console.warn('[night-chief] Poll error:', err.message);
        }
    }

    function checkAnomalies(closing, sales) {
        const alertContainer = document.getElementById('anomaly-alerts');
        if (!alertContainer) return;

        const alerts = [];

        // A. Cash difference > threshold
        if (closing) {
            const diff = Math.abs(closing.total_difference || 0);
            if (diff > 5000) {
                alerts.push({
                    type: 'error',
                    icon: '💰',
                    message: `Diferencia de caja: ${window.Utils.formatARS(closing.total_difference)}`,
                });
            }
        }

        // B. Stock variance > 15% (from stock audit KPIs if loaded)
        const varianceEl = document.getElementById('stock-variance');
        if (varianceEl) {
            const variance = parseFloat(varianceEl.textContent) || 0;
            if (Math.abs(variance) > 15) {
                alerts.push({
                    type: 'warning',
                    icon: '📦',
                    message: `Variación de stock: ${variance.toFixed(1)}% (umbral: ±15%)`,
                });
            }
        }

        // Render alerts
        if (alerts.length === 0) {
            alertContainer.innerHTML = '';
            alertContainer.classList.add('hidden');
            return;
        }

        alertContainer.classList.remove('hidden');
        alertContainer.innerHTML = alerts.map(a =>
            `<div class="alert-strip alert-${a.type}">
                <span class="alert-icon">${a.icon}</span>
                <span class="alert-message">${a.message}</span>
            </div>`
        ).join('');
    }

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
            window.Toast?.error('Error cargando devenciones.');
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
                .select('work_date, event_name, status, total_income, gbol_efectivo, gbol_efectivo_neto, total_retiros, cant_retiros, cash_declared, conciliacion_diff, stock_loss, staff_cost, net_result, health_score')
                .order('work_date', { ascending: false })
                .limit(50);

            state.historyLoaded = true;

            if (error) throw error;

            if (!data || !data.length) {
                ui.historyTableBody.innerHTML = '<tr><td colspan="13" class="p-4 text-center muted italic">Sin jornadas registradas</td></tr>';
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
                const st = getStatusDisplay(row.status);

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
                    ${diffCell(row.net_result)}
                    <td class="table-cell text-center">${row.health_score != null ? `<span class="status-pill ${Number(row.health_score) >= 75 ? 'staff-status-active' : Number(row.health_score) >= 50 ? 'staff-status-pending' : 'staff-status-absent'}">${row.health_score}</span>` : '<span class="muted">—</span>'}</td>
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
                        switchTab('panelPlanner');
                    }
                });
            });

        } catch (err) {
            console.error('[history]', err);
            window.Toast?.error('Error cargando historial.');
            ui.historyTableBody.innerHTML = '<tr><td colspan="13" class="p-4 text-center text-danger">Error cargando historial</td></tr>';
        }
    }

    // ═══════════════════════════════════════════════════════════
    // REPORT DASHBOARD (Phase 2 — Dual-Panel Diagnostic)
    // ═══════════════════════════════════════════════════════════

    async function loadReportDashboard() {
        if (!state.activeWorkDay) return;
        state.reportDashboardLoaded = true;

        const wdId = state.activeWorkDay.id;
        const dateStr = state.activeWorkDay.work_date;

        try {
            // Parallel fetch all data sources
            const [pnlRes, hsRes, effRes, closingRes, accRes, fiscalRes, histRes] = await Promise.all([
                window.sb.from('vw_workday_pnl').select('*').eq('work_day_id', wdId).maybeSingle(),
                window.sb.rpc('calculate_health_score', { p_work_day_id: wdId }),
                window.sb.from('vw_bar_efficiency').select('*').eq('work_day_id', wdId),
                window.sb.from('cash_closings').select('total_system, total_declared, total_difference').eq('work_day_id', wdId).maybeSingle(),
                window.sb.from('staff_accruals').select('id, status, base_amount, adjustments').eq('work_day_id', wdId),
                window.sb.from('vw_fiscal_summary').select('*').eq('noche', dateStr).maybeSingle(),
                window.sb.from('vw_night_snapshot').select('total_income, net_result, health_score').order('work_date', { ascending: false }).limit(10),
            ]);

            const pnl = pnlRes.data;
            const healthScore = hsRes.data;
            const efficiency = effRes.data || [];
            const closing = closingRes.data;
            const accruals = (accRes.data || []).filter(a => a.status !== 'cancelled');
            const fiscal = fiscalRes.data;
            const history = histRes.data || [];

            // ── Header ──
            loadReportHeader(dateStr, healthScore);

            // ── KPI Strip ──
            loadReportKpis(pnl, healthScore, history);

            // ── Chart ──
            initReportChart(history);

            // ── Fiscal Table ──
            renderReportFiscal(fiscal);

            // ── Anomalies ──
            renderReportAnomalies(closing, efficiency);

            // ── Ops Summary ──
            renderReportOps(efficiency, closing, accruals);

        } catch (err) {
            console.error('[report-dashboard]', err);
            window.Toast.error('Error cargando dashboard del reporte.');
            state.reportDashboardLoaded = false; // Allow retry
        }
    }

    function loadReportHeader(dateStr, healthScore) {
        if (ui.rptDate) ui.rptDate.textContent = dateStr || '—';
        if (ui.rptEvent) ui.rptEvent.textContent = state.activeWorkDay?.event_name || state.activeWorkDay?.events?.name || '—';

        if (ui.rptHealthBadge && healthScore != null) {
            const score = Number(healthScore);
            ui.rptHealthBadge.textContent = `${score}/100`;
            ui.rptHealthBadge.className = 'status-pill ' +
                (score >= 75 ? 'staff-status-active' :
                 score >= 50 ? 'staff-status-pending' : 'staff-status-absent');
        }
    }

    function loadReportKpis(pnl, healthScore, history) {
        const fmt = window.Utils.formatARS;

        if (!pnl) return;

        const totalIncome = pnl.total_income || 0;
        const netResult = pnl.net_result || 0;
        const margin = pnl.margin_pct != null ? Number(pnl.margin_pct) : null;
        const totalExpense = pnl.total_expense || 0;

        // Per Capita: income / QR count (approximate)
        const perCapita = pnl.qr_count ? Math.round(totalIncome / pnl.qr_count) : null;

        if (ui.rptKpiRevenue) ui.rptKpiRevenue.textContent = fmt(totalIncome);
        if (ui.rptKpiNet) {
            ui.rptKpiNet.textContent = fmt(netResult);
            ui.rptKpiNet.classList.toggle('text-success', netResult > 0);
            ui.rptKpiNet.classList.toggle('text-danger', netResult < 0);
        }
        if (ui.rptKpiMargin) ui.rptKpiMargin.textContent = margin != null ? `${margin.toFixed(1)}%` : '—';
        if (ui.rptKpiPercapita) ui.rptKpiPercapita.textContent = perCapita ? fmt(perCapita) : '—';
        if (ui.rptKpiScore) {
            const score = Number(healthScore) || 0;
            ui.rptKpiScore.textContent = `${score}/100`;
        }

        // Deltas vs average of last 10 nights
        if (history.length > 1) {
            const avg = (arr, key) => {
                const vals = arr.slice(1).map(r => Number(r[key] || 0)).filter(v => v > 0);
                return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            };

            const setDelta = (el, current, average) => {
                if (!el || !average) return;
                const pct = ((current - average) / average * 100).toFixed(0);
                const arrow = Number(pct) >= 0 ? '↑' : '↓';
                el.textContent = `${arrow} ${Math.abs(pct)}% vs prom.`;
                el.className = `stat-delta ${Number(pct) >= 0 ? 'is-positive' : 'is-negative'}`;
            };

            setDelta(ui.rptKpiRevenueDelta, totalIncome, avg(history, 'total_income'));
            setDelta(ui.rptKpiNetDelta, netResult, avg(history, 'net_result'));
        }
    }

    function initReportChart(history) {
        if (!ui.rptChartCanvas || !window.Chart) return;

        // Destroy previous instance
        if (state.reportChartInstance) {
            state.reportChartInstance.destroy();
            state.reportChartInstance = null;
        }

        const labels = history.map(r => r.work_date || '').reverse();
        const incomes = history.map(r => Number(r.total_income || 0)).reverse();
        const nets = history.map(r => Number(r.net_result || 0)).reverse();

        const ctx = ui.rptChartCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

        state.reportChartInstance = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: incomes,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                    },
                    {
                        label: 'Neto',
                        data: nets,
                        borderColor: 'rgba(34, 197, 94, 0.8)',
                        backgroundColor: 'transparent',
                        borderDash: [4, 4],
                        tension: 0.3,
                        pointRadius: 2,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 16, color: '#9ca3af' } },
                },
                scales: {
                    x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: '#6b7280', font: { size: 10 }, callback: v => window.Utils.formatARS(v) }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });

        // Chart KPIs below chart
        if (ui.rptChartMargin) {
            const pnlMargin = ui.rptKpiMargin?.textContent || '—';
            ui.rptChartMargin.textContent = pnlMargin;
        }
        if (ui.rptChartBreakeven) {
            const lastIncome = incomes[incomes.length - 1] || 0;
            const lastNet = nets[nets.length - 1] || 0;
            const expense = lastIncome - lastNet;
            const bePct = expense > 0 ? Math.round((lastIncome / expense) * 100) : 0;
            ui.rptChartBreakeven.textContent = `${bePct}%`;
        }
    }

    function renderReportFiscal(fiscal) {
        if (!ui.rptFiscalBody) return;

        if (!fiscal) {
            ui.rptFiscalBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center muted italic">Sin datos fiscales para esta noche</td></tr>';
            return;
        }

        const bruto = Number(fiscal.total_bruto || 0);
        const pct = Number(fiscal.pct_blanqueado || 0);
        const iva = Number(fiscal.total_iva || 0);
        const tickets = Number(fiscal.total_tickets || 0);
        const negro = bruto > 0 ? bruto * (1 - pct / 100) : 0;

        const fmt = window.Utils.formatARS;
        ui.rptFiscalBody.innerHTML = `
            <tr class="table-row">
                <td class="table-cell cell-pad">🧾 Facturado (Blanco)</td>
                <td class="table-cell text-right font-mono">${fmt(bruto * pct / 100)}</td>
                <td class="table-cell text-right font-mono">${pct.toFixed(0)}%</td>
                <td class="table-cell text-right font-mono">${tickets}</td>
            </tr>
            <tr class="table-row">
                <td class="table-cell cell-pad">💵 Efectivo (Negro)</td>
                <td class="table-cell text-right font-mono">${fmt(negro)}</td>
                <td class="table-cell text-right font-mono">${(100 - pct).toFixed(0)}%</td>
                <td class="table-cell text-right font-mono muted">—</td>
            </tr>
            <tr class="table-row table-row-border">
                <td class="table-cell cell-pad font-bold">Total Bruto</td>
                <td class="table-cell text-right font-mono font-bold">${fmt(bruto)}</td>
                <td class="table-cell text-right font-mono">100%</td>
                <td class="table-cell text-right font-mono">${tickets}</td>
            </tr>
            <tr class="table-row">
                <td class="table-cell cell-pad muted">IVA</td>
                <td class="table-cell text-right font-mono muted">${fmt(iva)}</td>
                <td class="table-cell"></td>
                <td class="table-cell"></td>
            </tr>
        `;
    }

    function renderReportAnomalies(closing, efficiency) {
        if (!ui.rptAnomaliesList) return;

        const anomalies = [];

        // 1. Cash difference
        if (closing) {
            const diff = Number(closing.total_difference || 0);
            if (Math.abs(diff) > 5000) {
                anomalies.push({
                    severity: Math.abs(diff) > 20000 ? 'high' : 'medium',
                    icon: '💰',
                    text: `Diferencia de caja: ${window.Utils.formatARS(diff)}`,
                    cta: 'Revisar Caja',
                });
            }
        }

        // 2. Stock variance
        if (efficiency.length) {
            const totalLoss = efficiency.reduce((s, r) => s + Number(r.loss_amount || 0), 0);
            const avgEff = efficiency.reduce((s, r) => s + Number(r.efficiency_pct || 100), 0) / efficiency.length;

            if (avgEff < 85) {
                anomalies.push({
                    severity: avgEff < 70 ? 'high' : 'medium',
                    icon: '📦',
                    text: `Eficiencia de stock: ${avgEff.toFixed(0)}% — Merma: ${window.Utils.formatARS(totalLoss)}`,
                    cta: 'Revisar Stock',
                });
            }
        }

        // 3. No anomalies
        if (anomalies.length === 0) {
            ui.rptAnomaliesList.innerHTML = '<div class="rpt-anomaly-empty muted italic">Sin anomalías detectadas ✅</div>';
            return;
        }

        ui.rptAnomaliesList.innerHTML = anomalies.map(a => `
            <div class="rpt-anomaly-card severity-${a.severity}">
                <span class="rpt-anomaly-icon">${a.icon}</span>
                <span class="rpt-anomaly-text">${a.text}</span>
                <button class="rpt-anomaly-cta">${a.cta}</button>
            </div>
        `).join('');
    }

    function renderReportOps(efficiency, closing, accruals) {
        const fmt = window.Utils.formatARS;

        // Stock Audit
        if (efficiency.length) {
            const avgEff = efficiency.reduce((s, r) => s + Number(r.efficiency_pct || 100), 0) / efficiency.length;
            const totalLoss = efficiency.reduce((s, r) => s + Number(r.loss_amount || 0), 0);
            const skusDiff = efficiency.filter(r => Math.abs(Number(r.loss_amount || 0)) > 0).length;

            if (ui.rptOpsStockPrecision) ui.rptOpsStockPrecision.textContent = `${avgEff.toFixed(0)}%`;
            if (ui.rptOpsStockLoss) ui.rptOpsStockLoss.textContent = fmt(totalLoss);
            if (ui.rptOpsStockSkus) ui.rptOpsStockSkus.textContent = String(skusDiff);
        }

        // Caja
        if (closing) {
            const diff = Number(closing.total_difference || 0);
            if (ui.rptOpsCajaDiff) {
                ui.rptOpsCajaDiff.textContent = fmt(diff);
                ui.rptOpsCajaDiff.classList.toggle('text-success', diff === 0);
                ui.rptOpsCajaDiff.classList.toggle('text-danger', diff < 0);
            }
            if (ui.rptOpsCajaTerminals) ui.rptOpsCajaTerminals.textContent = '—'; // Simplified
        }

        // Nómina
        if (accruals.length) {
            const totalCost = accruals.reduce((s, a) => s + Number(a.base_amount || 0) + Number(a.adjustments || 0), 0);
            if (ui.rptOpsNominaCount) ui.rptOpsNominaCount.textContent = String(accruals.length);
            if (ui.rptOpsNominaCost) ui.rptOpsNominaCost.textContent = fmt(totalCost);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // Sprint 4: Templates & Break-Even
    // ═══════════════════════════════════════════════════════════════

    async function loadTemplates() {
        try {
            const { data, error } = await window.sb
                .from('work_day_templates')
                .select('id, name, staff_config, cost_ids, avg_revenue, avg_attendance, usage_count')
                .order('usage_count', { ascending: false });
            if (error) throw error;
            state.templates = data || [];
            renderTemplateDropdown();
        } catch (e) {
            console.warn('Templates load failed:', e);
        }
    }

    function renderTemplateDropdown() {
        if (!ui.selectTemplate) return;
        const opts = state.templates.map(t =>
            `<option value="${t.id}">${t.name} (${t.usage_count || 0} usos)</option>`
        ).join('');
        ui.selectTemplate.innerHTML = `<option value="">-- Sin plantilla --</option>${opts}`;
    }

    async function handleApplyTemplate() {
        const id = ui.selectTemplate?.value;
        if (!id) return;
        const tpl = state.templates.find(t => t.id === id);
        if (!tpl) return;

        // Apply staff config
        if (tpl.staff_config && typeof tpl.staff_config === 'object') {
            Object.entries(tpl.staff_config).forEach(([roleId, qty]) => {
                if (state.staffPlan.hasOwnProperty(roleId)) {
                    state.staffPlan[roleId] = Number(qty);
                }
            });
            renderStaffList();
        }

        // Apply costs (activate matching cost_ids)
        if (Array.isArray(tpl.cost_ids)) {
            state.openingCosts.forEach(c => {
                if (tpl.cost_ids.includes(c.id)) {
                    state.costsPlan[c.id] = { amount: c.base_amount, isAdjusted: false };
                }
            });
            renderCostsList();
        }

        calculateTotals();

        // Increment usage_count
        await window.sb.from('work_day_templates')
            .update({ usage_count: (tpl.usage_count || 0) + 1 })
            .eq('id', id);
        tpl.usage_count = (tpl.usage_count || 0) + 1;

        window.Toast.success(`Plantilla "${tpl.name}" aplicada.`);
    }

    function openTemplateModal() {
        if (!ui.templateModal) return;
        ui.inputTemplateId.value = '';
        ui.inputTemplateName.value = '';
        ui.templateModalTitle.textContent = 'Guardar Plantilla';
        ui.templateModal.classList.remove('hidden');
        ui.inputTemplateName.focus();
    }

    async function handleSaveTemplate() {
        const name = ui.inputTemplateName?.value.trim();
        if (!name) { window.Toast.error('Ingresá un nombre.'); return; }

        const payload = {
            name,
            staff_config: { ...state.staffPlan },
            cost_ids: Object.keys(state.costsPlan),
        };

        const editId = ui.inputTemplateId?.value;
        try {
            if (editId) {
                const { error } = await window.sb.from('work_day_templates').update(payload).eq('id', editId);
                if (error) throw error;
                window.Toast.success('Plantilla actualizada.');
            } else {
                const { error } = await window.sb.from('work_day_templates').insert(payload);
                if (error) throw error;
                window.Toast.success('Plantilla creada.');
            }
            ui.templateModal?.classList.add('hidden');
            await loadTemplates();
        } catch (e) {
            console.error('Save template error:', e);
            window.Toast.error('Error guardando plantilla.');
        }
    }

    async function loadBenchmarks() {
        try {
            // Get day_of_week for the selected date
            const dateVal = ui.inputDate?.value;
            if (!dateVal) return;
            const dow = new Date(dateVal + 'T12:00:00').getDay(); // 0=Sun, 6=Sat

            const { data, error } = await window.sb
                .from('vw_workday_benchmarks')
                .select('*')
                .eq('day_of_week', dow)
                .maybeSingle();
            if (error) throw error;
            state.benchmarks = data;
            renderBenchmarkPills();
            // Re-run break-even with benchmarks
            calculateTotals();
        } catch (e) {
            console.warn('Benchmarks load failed:', e);
        }
    }

    function renderBenchmarkPills() {
        if (!ui.benchmarkPills || !state.benchmarks) {
            if (ui.benchmarkPills) ui.benchmarkPills.innerHTML = '<span class="wd-benchmark-pill muted">Sin datos históricos</span>';
            return;
        }
        const b = state.benchmarks;
        const fmt = window.Utils.formatARS;
        ui.benchmarkPills.innerHTML = [
            `<span class="wd-benchmark-pill">📊 Avg Revenue: ${fmt(b.avg_revenue || 0)}</span>`,
            `<span class="wd-benchmark-pill">👥 Avg Asistencia: ${Math.round(b.avg_attendance || 0)}</span>`,
            `<span class="wd-benchmark-pill">📈 Avg Margen: ${(b.avg_margin || 0).toFixed(1)}%</span>`,
            `<span class="wd-benchmark-pill muted">Muestra: ${b.sample_count || 0} jornadas</span>`,
        ].join('');
    }

    function updateBreakEvenCard(totalCost) {
        if (!ui.beCost) return;
        const fmt = window.Utils.formatARS;
        ui.beCost.textContent = fmt(totalCost);

        const avgRev = state.benchmarks?.avg_revenue || 0;
        ui.beAvgRevenue.textContent = avgRev ? `${fmt(avgRev)} avg` : 'Sin datos';

        if (avgRev > 0) {
            const pct = Math.min(Math.round((totalCost / avgRev) * 100), 100);
            ui.beProgressBar.style.width = `${pct}%`;
            ui.beProgressPct.textContent = `${pct}%`;

            // Color coding: green if under 70%, yellow 70-90%, red 90+%
            ui.beProgressBar.classList.remove('be-safe', 'be-warn', 'be-danger');
            if (pct < 70) ui.beProgressBar.classList.add('be-safe');
            else if (pct < 90) ui.beProgressBar.classList.add('be-warn');
            else ui.beProgressBar.classList.add('be-danger');
        } else {
            ui.beProgressBar.style.width = '0%';
            ui.beProgressPct.textContent = '—';
        }
    }

    // Start
    init();

})();
