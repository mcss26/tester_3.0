/**
 * Encargado Caja Noche Module
 * Dashboard for monitoring terminals and requesting withdrawals upon cash saturation.
 * 
 * @refactored 2026-01-29 - IIFE async pattern, logic-engineer standards
 */

(async function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Auth Guard
    // ─────────────────────────────────────────────────────────────────────────
    const allowedRolesAttr = document.body.getAttribute('data-allowed-roles');
    const allowedRoles = allowedRolesAttr
        ? allowedRolesAttr.split(',').map(r => r.trim()).filter(Boolean)
        : [];

    const session = await window.Auth.guardOrRedirect(allowedRoles);
    if (!session) return;

    if (!window.Utils.assertSbOrShowBlockingError()) {
        console.error('[EncargadoCajaNoche] Supabase client not initialized.');
        return;
    }

    const { user } = session;

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DOM References
    // ─────────────────────────────────────────────────────────────────────────
    const ui = {
        // States
        pageCardLoading: document.getElementById('page-card-loading'),
        pageCardEmpty: document.getElementById('page-card-empty'),
        pageCardContent: document.getElementById('page-card-content'),

        // Stats
        statTerminals: document.getElementById('stat-terminals'),
        statSubmitted: document.getElementById('stat-submitted'),
        statPending: document.getElementById('stat-pending-withdrawal'),
        statTotalCash: document.getElementById('stat-total-cash'),
        statTotalZoco: document.getElementById('stat-total-zoco'),
        statTotalDeclared: document.getElementById('stat-total-declared'),

        // Grid & Log
        terminalsGrid: document.getElementById('terminals-grid'),
        movementsLog: document.getElementById('movements-log'),

        // Views
        viewMonitor: document.getElementById('view-monitor'),
        viewMovements: document.getElementById('view-movements'),

        // Modals
        modalOpenTerminal: document.getElementById('modal-open-terminal'),
        modalWithdrawal: document.getElementById('modal-withdrawal'),
        modalCloseTerminal: document.getElementById('modal-close-terminal'),
        modalCloseNight: document.getElementById('modal-close-night'),
        confirmModal: document.getElementById('confirmModal'),
        confirmModalTitle: document.getElementById('confirmModalTitle'),
        confirmModalMessage: document.getElementById('confirmModalMessage'),
        confirmModalAccept: document.getElementById('confirmModalAccept'),

        // Open Terminal Form
        openSelectTerminal: document.getElementById('open-select-terminal'),
        openSelectStaff: document.getElementById('open-select-staff'),
        openAmount: document.getElementById('open-amount'),
        formOpenTerminal: document.getElementById('form-open-terminal'),

        // Withdrawal Form
        selectTerminal: document.getElementById('select-terminal'),
        inputAmount: document.getElementById('input-amount'),
        inputReason: document.getElementById('input-reason'),
        formWithdrawal: document.getElementById('form-withdrawal'),

        // Close Terminal Form
        closeTerminalId: document.getElementById('close-terminal-id'),
        closeCashAmount: document.getElementById('close-cash-amount'),
        closeZocoAmount: document.getElementById('close-zoco-amount'),
        closeNotes: document.getElementById('close-notes'),
        signatureCanvas: document.getElementById('signature-canvas'),
        signaturePlaceholder: document.getElementById('signature-placeholder'),
        btnClearSignature: document.getElementById('btn-clear-signature'),
        formCloseTerminal: document.getElementById('form-close-terminal'),

        // Close Night Form
        nightCloseNotes: document.getElementById('night-close-notes'),
        formCloseNight: document.getElementById('form-close-night'),

        // Buttons
        btnOpenTerminalModal: document.getElementById('btn-open-terminal-modal'),
        btnRequestWithdrawalModal: document.getElementById('btn-request-withdrawal-modal'),
        btnCloseNight: document.getElementById('btn-close-night-init'),

        // Tabs
        tabs: document.querySelectorAll('.tab-chip')
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 3. State
    // ─────────────────────────────────────────────────────────────────────────
    let state = {
        closingId: null,
        currentWorkDayId: null,
        terminals: [],
        movements: [],
        staffList: [],
        rtChannel: null,
        signatureCtx: null,
        isDrawing: false
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Page State Management
    // ─────────────────────────────────────────────────────────────────────────
    function setPageState(stateName) {
        ui.pageCardLoading?.classList.remove('is-visible');
        ui.pageCardEmpty?.classList.add('hidden');
        ui.pageCardContent?.classList.add('hidden');

        switch (stateName) {
            case 'loading':
                ui.pageCardLoading?.classList.add('is-visible');
                break;
            case 'empty':
                ui.pageCardEmpty?.classList.remove('hidden');
                break;
            case 'content':
                ui.pageCardContent?.classList.remove('hidden');
                break;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Modal Helpers
    // ─────────────────────────────────────────────────────────────────────────
    function openModal(modalEl) {
        modalEl?.classList.add('open');
    }

    function closeModal(modalEl) {
        modalEl?.classList.remove('open');
    }

    function showConfirmModal(title, message, onAccept) {
        if (!ui.confirmModal) return;
        ui.confirmModalTitle.textContent = title;
        ui.confirmModalMessage.textContent = message;
        openModal(ui.confirmModal);

        // Clone and replace to remove old listeners
        const newBtn = ui.confirmModalAccept.cloneNode(true);
        ui.confirmModalAccept.parentNode.replaceChild(newBtn, ui.confirmModalAccept);
        ui.confirmModalAccept = newBtn;

        ui.confirmModalAccept.addEventListener('click', () => {
            closeModal(ui.confirmModal);
            onAccept();
        });
    }

    // Bind all [data-modal-close] buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) closeModal(modal);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Data Loading
    // ─────────────────────────────────────────────────────────────────────────
    async function loadCurrentClosing() {
        // Find Open WorkDay
        const { data: wd, error: wdError } = await window.sb
            .from('work_days')
            .select('id, status')
            .eq('status', 'ACTIVE')
            .maybeSingle();

        if (wdError) {
            console.error('Error loading workday', wdError);
            return false;
        }

        if (!wd) {
            console.warn('No open workday found.');
            state.currentWorkDayId = null;
            return false;
        }

        state.currentWorkDayId = wd.id;

        // Find Cash Closing for this WorkDay
        const { data, error } = await window.sb
            .from('cash_closings')
            .select('*')
            .eq('work_day_id', wd.id)
            .maybeSingle();

        if (error) {
            console.error('Error loading closing', error);
            return false;
        }

        if (data) {
            state.closingId = data.id;
            if (data.status === 'closed') {
                renderClosedState(data);
                return false; // Don't continue loading
            }
        } else {
            state.closingId = null;
        }

        return true;
    }

    async function loadStaff() {
        try {
            const { data, error } = await window.sb
                .from('profiles')
                .select('id, full_name, role')
                .ilike('role', '%staff_caja%')
                .eq('active', true)
                .order('full_name');

            if (error) throw error;
            state.staffList = data || [];
            populateStaffSelect();
        } catch (err) {
            console.error(err);
            window.Toast?.error('Error al cargar personal');
        }
    }

    async function loadData() {
        if (!state.currentWorkDayId) {
            const hasWorkday = await loadCurrentClosing();
            if (!hasWorkday) {
                setPageState('empty');
                return;
            }
        }

        // Get Terminals + Closings Status
        const { data: terminals, error } = await window.sb
            .from('pos_terminals')
            .select(`
                id, friendly_name, is_active,
                closings:closing_terminals(status, declared_cash, declared_zoco, submitted_at, id)
            `)
            .eq('is_active', true)
            .order('friendly_name');

        if (error) {
            console.error('Error loading terminals', error);
            return;
        }

        state.terminals = terminals.map(t => ({ ...t, closing: null }));

        if (state.closingId) {
            const { data: closings, error: closingError } = await window.sb
                .from('closing_terminals')
                .select('*')
                .eq('cash_closing_id', state.closingId);

            if (closingError) {
                console.error('Error loading closing terminals', closingError);
            } else if (closings) {
                state.terminals = state.terminals.map(t => ({
                    ...t,
                    closing: closings.find(c => c.terminal_id === t.id)
                }));
            }

            // Fetch movements
            const { data: mData, error: movementError } = await window.sb
                .from('cash_movements')
                .select('*')
                .eq('cash_closing_id', state.closingId)
                .order('created_at', { ascending: false });

            if (movementError) console.error('Error loading movements', movementError);
            else state.movements = mData || [];
        }

        renderDashboard();
        setPageState('content');
    }

    async function ensureClosingExists() {
        if (state.closingId) return true;
        if (!state.currentWorkDayId) {
            window.Toast?.error('No hay jornada de trabajo abierta. No se puede operar.');
            return false;
        }

        const { data, error } = await window.sb
            .from('cash_closings')
            .insert({
                work_day_id: state.currentWorkDayId,
                closed_by: user.id,
                status: 'pending',
                total_system: 0,
                total_declared: 0,
                total_difference: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating cash closing', error);
            window.Toast?.error('Error crítico: No se pudo inicializar la jornada de caja.');
            return false;
        }

        state.closingId = data.id;
        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Rendering Functions
    // ─────────────────────────────────────────────────────────────────────────
    function renderDashboard() {
        const { terminals, movements } = state;

        // Update Stats
        const submittedCount = terminals.filter(t =>
            t.closing?.status === 'submitted' || t.closing?.status === 'verified'
        ).length;
        const pendingWithdrawals = movements.filter(m => m.status === 'pending').length;

        ui.statTerminals.textContent = `${submittedCount}/${terminals.length}`;
        ui.statSubmitted.textContent = submittedCount;
        ui.statPending.textContent = pendingWithdrawals;

        // Render Grid using map().join('')
        ui.terminalsGrid.innerHTML = terminals.map(t => {
            const status = t.closing?.status || 'pending_open';
            const isOpened = !!t.closing;
            const isSubmitted = status === 'submitted' || status === 'verified';
            const terminalPendingMovements = movements.filter(
                m => m.terminal_id === t.id && m.status === 'pending'
            ).length;

            // Status classes
            let statusClass = 'status-closed';
            let statusIcon = 'bg-muted';
            if (isSubmitted) {
                statusClass = 'status-verified';
                statusIcon = 'bg-success';
            } else if (isOpened) {
                statusClass = 'status-open';
                statusIcon = 'bg-info';
            }

            const warningBadge = terminalPendingMovements > 0
                ? '<span class="badge badge-warning">Retiro</span>'
                : '';

            // Actions
            let actionHtml = '';
            if (isSubmitted) {
                const cash = t.closing.declared_cash || 0;
                const zoco = t.closing.declared_zoco || 0;
                const total = cash + zoco;
                actionHtml = `
                    <div class="terminal-total">
                        <div class="row-flex gap-md">
                            <div><span class="label-xs">Efectivo</span><span class="value-sm">${window.Utils.formatARS(cash)}</span></div>
                            <div><span class="label-xs">Zoco</span><span class="value-sm">${window.Utils.formatARS(zoco)}</span></div>
                        </div>
                        <span class="label-xs" style="margin-top:var(--space-xs)">Total</span>
                        <span class="value-lg text-success">${window.Utils.formatARS(total)}</span>
                    </div>`;
            } else if (isOpened) {
                actionHtml = `
                    <div class="terminal-actions">
                        <button class="btn-ghost btn-sm" data-withdrawal-for="${t.id}">Retiro</button>
                        <button class="btn-danger-outline btn-sm" data-close-terminal="${t.id}">Cerrar</button>
                    </div>`;
            } else {
                actionHtml = `<span class="label-xs text-muted">Sin Asignar</span>`;
            }

            return `
                <div class="terminal-card ${statusClass}">
                    <div class="terminal-header">
                        <h3 class="terminal-name">${t.friendly_name}</h3>
                        <div class="terminal-indicators">
                            <span class="status-dot ${statusIcon}"></span>
                            ${warningBadge}
                        </div>
                    </div>
                    <div class="terminal-body">
                        ${actionHtml}
                    </div>
                </div>`;
        }).join('');

        // Bind dynamic actions
        ui.terminalsGrid.querySelectorAll('[data-withdrawal-for]').forEach(btn => {
            btn.addEventListener('click', () => openWithdrawalFor(btn.dataset.withdrawalFor));
        });
        ui.terminalsGrid.querySelectorAll('[data-close-terminal]').forEach(btn => {
            btn.addEventListener('click', () => openCloseTerminalModal(btn.dataset.closeTerminal));
        });

        // Update Financial KPIs
        const submittedTerminals = terminals.filter(t =>
            t.closing?.status === 'submitted' || t.closing?.status === 'verified'
        );
        const totalCash = submittedTerminals.reduce((acc, t) => acc + (t.closing.declared_cash || 0), 0);
        const totalZoco = submittedTerminals.reduce((acc, t) => acc + (t.closing.declared_zoco || 0), 0);
        if (ui.statTotalCash) ui.statTotalCash.textContent = window.Utils.formatARS(totalCash);
        if (ui.statTotalZoco) ui.statTotalZoco.textContent = window.Utils.formatARS(totalZoco);
        if (ui.statTotalDeclared) ui.statTotalDeclared.textContent = window.Utils.formatARS(totalCash + totalZoco);

        // Render Log using map().join('')
        if (movements.length === 0) {
            ui.movementsLog.innerHTML = '<div class="empty-state-text">Sin movimientos recientes</div>';
        } else {
            ui.movementsLog.innerHTML = movements.slice(0, 5).map(m => {
                const termName = terminals.find(t => t.id === m.terminal_id)?.friendly_name || 'Terminal';
                const statusClass = m.status === 'confirmed' ? 'bg-success' : 'bg-warning';
                const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return `
                    <div class="log-row">
                        <div class="log-info">
                            <span class="status-dot ${statusClass}"></span>
                            <div>
                                <p class="log-title">${termName} <span class="text-muted">(${m.type === 'withdrawal' ? 'Retiro' : 'Ingreso'})</span></p>
                                <p class="log-subtitle">${m.reason}</p>
                            </div>
                        </div>
                        <div class="log-data">
                            <p class="log-amount">${window.Utils.formatARS(m.amount)}</p>
                            <p class="log-time">${timeStr}</p>
                        </div>
                    </div>`;
            }).join('');
        }
    }

    function renderClosedState(closingData) {
        setPageState('empty');
        if (ui.pageCardEmpty) {
            ui.pageCardEmpty.innerHTML = `
                <div class="text-center">
                    <p class="label-lg">🌙 Noche Cerrada</p>
                    <p class="label-sm" style="margin-top:var(--space-sm)">El cierre de caja ha sido finalizado.</p>
                    <p class="label-lg text-success" style="margin-top:var(--space-md)">${window.Utils.formatARS(closingData.total_declared || 0)}</p>
                </div>
            `;
        }
    }

    function populateTerminalSelect(elementId = 'select-terminal') {
        const select = elementId === 'select-terminal' ? ui.selectTerminal : ui.openSelectTerminal;
        if (!select) return;
        select.innerHTML = state.terminals.map(t =>
            `<option value="${t.id}">${t.friendly_name}</option>`
        ).join('');
    }

    function populateStaffSelect() {
        if (!ui.openSelectStaff) return;
        ui.openSelectStaff.innerHTML = '<option value="">Seleccionar responsable...</option>' +
            state.staffList.map(s =>
                `<option value="${s.id}">${s.full_name}</option>`
            ).join('');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Form Submissions
    // ─────────────────────────────────────────────────────────────────────────
    function openWithdrawalFor(terminalId) {
        populateTerminalSelect('select-terminal');
        ui.selectTerminal.value = terminalId;
        openModal(ui.modalWithdrawal);
    }

    async function submitWithdrawal() {
        if (!await ensureClosingExists()) return;

        const terminalId = ui.selectTerminal.value;
        const amount = ui.inputAmount.value;
        const reason = ui.inputReason.value;

        if (!user?.id) {
            window.Toast?.error('Sesión no válida. Vuelve a iniciar sesión.');
            return;
        }

        const btn = ui.formWithdrawal.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            const { error } = await window.sb
                .from('cash_movements')
                .insert([{
                    cash_closing_id: state.closingId,
                    terminal_id: terminalId,
                    amount: amount,
                    reason: reason,
                    requested_by: user.id,
                    type: 'withdrawal',
                    status: 'pending'
                }]);

            if (error) throw error;

            window.Toast?.success('Retiro solicitado correctamente.');
            closeModal(ui.modalWithdrawal);
            ui.formWithdrawal.reset();
            loadData();
        } catch (err) {
            console.error(err);
            window.Toast?.error('Error al crear retiro.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'SOLICITAR';
        }
    }

    async function submitOpenTerminal() {
        if (!await ensureClosingExists()) return;

        const termId = ui.openSelectTerminal.value;
        const staffId = ui.openSelectStaff.value;
        const initialFund = ui.openAmount.value || 0;

        const alreadyOpen = state.terminals.find(t =>
            t.id === termId && t.closing && t.closing.status !== 'verified'
        );
        if (alreadyOpen?.closing) {
            window.Toast?.warning('Esta terminal ya tiene una sesión abierta.');
            return;
        }

        const btn = ui.formOpenTerminal.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Abriendo...';

        try {
            const { error } = await window.sb
                .from('closing_terminals')
                .insert({
                    cash_closing_id: state.closingId,
                    terminal_id: termId,
                    staff_id: staffId,
                    system_cash: 0,
                    system_zoco: 0,
                    declared_cash: 0,
                    declared_zoco: 0,
                    notes: initialFund > 0 ? `Fondo Inicial: $${initialFund}` : ''
                });

            if (error) throw error;

            window.Toast?.success('Terminal abierta con éxito.');
            closeModal(ui.modalOpenTerminal);
            ui.formOpenTerminal.reset();
            loadData();
        } catch (err) {
            console.error(err);
            window.Toast?.error('Error al abrir terminal.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'ABRIR';
        }
    }

    function openCloseTerminalModal(terminalId) {
        const t = state.terminals.find(term => term.id === terminalId);
        if (!t || !t.closing) return;

        ui.closeTerminalId.value = t.closing.id;
        ui.closeCashAmount.value = '';
        ui.closeZocoAmount.value = '';
        ui.closeNotes.value = '';

        openModal(ui.modalCloseTerminal);

        // Init Signature Pad after modal is visible
        setTimeout(() => initSignaturePad(), 100);
    }

    async function submitCloseTerminal() {
        const closingTerminalId = ui.closeTerminalId.value;
        const cash = parseFloat(ui.closeCashAmount.value) || 0;
        const zoco = parseFloat(ui.closeZocoAmount.value) || 0;
        const notes = ui.closeNotes.value;

        // Get Signature
        const signatureData = ui.signatureCanvas.toDataURL('image/png');
        const isSignatureEmpty = !ui.signaturePlaceholder.classList.contains('hidden');

        if (isSignatureEmpty) {
            showConfirmModal(
                'Firma Requerida',
                'No se ha detectado firma. ¿Deseas cerrar la caja sin firmar?',
                () => doCloseTerminal(closingTerminalId, cash, zoco, notes, null)
            );
            return;
        }

        await doCloseTerminal(closingTerminalId, cash, zoco, notes, signatureData);
    }

    async function doCloseTerminal(closingTerminalId, cash, zoco, notes, signatureData) {
        const btn = ui.formCloseTerminal.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Cerrando...';

        try {
            const { error } = await window.sb
                .from('closing_terminals')
                .update({
                    declared_cash: cash,
                    declared_zoco: zoco,
                    status: 'submitted',
                    submitted_at: new Date().toISOString(),
                    notes: notes,
                    signature_data: signatureData
                })
                .eq('id', closingTerminalId);

            if (error) throw error;

            window.Toast?.success('Caja cerrada correctamente.');
            closeModal(ui.modalCloseTerminal);
            loadData();
        } catch (err) {
            console.error(err);
            window.Toast?.error('Error al cerrar caja: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'CERRAR CAJA';
        }
    }

    async function submitCloseNight() {
        if (!state.closingId) {
            window.Toast?.error('No hay cierre de caja activo.');
            return;
        }

        const notes = ui.nightCloseNotes.value;
        const btn = ui.formCloseNight.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Finalizando...';

        try {
            // ──────────────────────────────────────────────────────────
            // Checkpoint: Verificar bar_sessions antes de permitir cierre
            // ──────────────────────────────────────────────────────────
            const { data: openBars, error: barError } = await window.sb
                .from('bar_sessions')
                .select('id, location, profiles(full_name)', { count: 'exact' })
                .eq('work_day_id', state.currentWorkDayId)
                .neq('status', 'closed');

            if (barError) throw barError;

            if (openBars && openBars.length > 0) {
                const barList = openBars.map(b =>
                    `${b.location || 'Barra'} (${b.profiles?.full_name || 'Sin asignar'})`
                ).join(', ');
                throw new Error(
                    `No puedes cerrar la noche hasta que se cierren ${openBars.length} sesión(es) de barra pendientes: ${barList}`
                );
            }

            // Cálculo de totales
            // NOTA: Los retiros (cash_movements) NO se restan aquí.
            // El operador declara el efectivo físico NETO (ya descontados retiros).
            // La conciliación completa (incluyendo retiros) se realiza en
            // vw_workday_cash_balance.net_cash_flow a nivel de base de datos.
            const submitted = state.terminals.filter(t =>
                t.closing && (t.closing.status === 'submitted' || t.closing.status === 'verified')
            );
            const totalDeclared = submitted.reduce((acc, t) =>
                acc + (t.closing.declared_cash || 0) + (t.closing.declared_zoco || 0), 0
            );
            const totalSystem = submitted.reduce((acc, t) =>
                acc + (t.closing.system_cash || 0) + (t.closing.system_zoco || 0), 0
            );
            const totalDifference = totalDeclared - totalSystem;

            // ──────────────────────────────────────────────────────────
            // Cerrar cash_closings y work_day en paralelo
            // ──────────────────────────────────────────────────────────
            const closedAt = new Date().toISOString();

            const [closingResult, workDayResult] = await Promise.all([
                window.sb
                    .from('cash_closings')
                    .update({
                        status: 'closed',
                        closed_at: closedAt,
                        closed_by: user.id,
                        total_system: totalSystem,
                        total_declared: totalDeclared,
                        total_difference: totalDifference,
                        notes: notes
                    })
                    .eq('id', state.closingId),
                window.sb
                    .from('work_days')
                    .update({
                        status: 'closed',
                        closed_at: closedAt,
                        closed_by: user.id
                    })
                    .eq('id', state.currentWorkDayId)
            ]);

            if (closingResult.error) throw closingResult.error;
            if (workDayResult.error) throw workDayResult.error;

            closeModal(ui.modalCloseNight);
            window.Toast?.success('Cierre de noche exitoso. Jornada finalizada.');
            loadCurrentClosing();
        } catch (err) {
            console.error('[encargado-caja-noche] Error al cerrar noche:', err);
            window.Toast?.error(err.message || 'Error al cerrar la noche.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'FINALIZAR';
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. Signature Pad
    // ─────────────────────────────────────────────────────────────────────────
    function initSignaturePad() {
        const canvas = ui.signatureCanvas;
        if (!canvas) return;

        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();

        canvas.width = rect.width;
        canvas.height = rect.height;

        state.signatureCtx = canvas.getContext('2d');
        state.signatureCtx.strokeStyle = '#fff';
        state.signatureCtx.lineWidth = 2;
        state.signatureCtx.lineCap = 'round';
        state.isDrawing = false;

        const getCoordinates = (event) => {
            let clientX, clientY;
            if (event.touches?.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }
            const canvasRect = canvas.getBoundingClientRect();
            return {
                offsetX: clientX - canvasRect.left,
                offsetY: clientY - canvasRect.top
            };
        };

        const startDrawing = (e) => {
            state.isDrawing = true;
            state.signatureCtx.beginPath();
            const { offsetX, offsetY } = getCoordinates(e);
            state.signatureCtx.moveTo(offsetX, offsetY);
            ui.signaturePlaceholder?.classList.add('hidden');
        };

        const draw = (e) => {
            if (!state.isDrawing) return;
            e.preventDefault();
            const { offsetX, offsetY } = getCoordinates(e);
            state.signatureCtx.lineTo(offsetX, offsetY);
            state.signatureCtx.stroke();
        };

        const stopDrawing = () => {
            state.isDrawing = false;
            state.signatureCtx.closePath();
        };

        canvas.onmousedown = startDrawing;
        canvas.onmousemove = draw;
        canvas.onmouseup = stopDrawing;
        canvas.onmouseleave = stopDrawing;
        canvas.ontouchstart = startDrawing;
        canvas.ontouchmove = draw;
        canvas.ontouchend = stopDrawing;

        ui.btnClearSignature?.addEventListener('click', () => {
            state.signatureCtx.clearRect(0, 0, canvas.width, canvas.height);
            ui.signaturePlaceholder?.classList.remove('hidden');
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 10. Realtime Subscription
    // ─────────────────────────────────────────────────────────────────────────
    function startRealtime() {
        if (state.rtChannel) {
            window.sb.removeChannel(state.rtChannel);
            state.rtChannel = null;
        }

        state.rtChannel = window.sb.channel('encargado_caja_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_movements' }, () => loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'closing_terminals' }, () => loadData())
            .subscribe();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 11. Event Bindings
    // ─────────────────────────────────────────────────────────────────────────
    function bindEvents() {
        // Tabs Logic
        ui.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                ui.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const viewId = tab.getAttribute('data-view');
                ui.viewMonitor?.classList.add('hidden');
                ui.viewMovements?.classList.add('hidden');

                const target = document.getElementById(`view-${viewId}`);
                target?.classList.remove('hidden');
            });
        });

        // Open Terminal Modal
        ui.btnOpenTerminalModal?.addEventListener('click', () => {
            populateTerminalSelect('open-select-terminal');
            if (state.staffList.length) {
                populateStaffSelect();
            } else {
                loadStaff();
            }
            openModal(ui.modalOpenTerminal);
        });

        // Request Withdrawal Modal
        ui.btnRequestWithdrawalModal?.addEventListener('click', () => {
            populateTerminalSelect('select-terminal');
            openModal(ui.modalWithdrawal);
        });

        // Forms
        ui.formOpenTerminal?.addEventListener('submit', (e) => {
            e.preventDefault();
            submitOpenTerminal();
        });

        ui.formWithdrawal?.addEventListener('submit', (e) => {
            e.preventDefault();
            submitWithdrawal();
        });

        ui.formCloseTerminal?.addEventListener('submit', (e) => {
            e.preventDefault();
            submitCloseTerminal();
        });

        // Close Night
        ui.btnCloseNight?.addEventListener('click', () => {
            openModal(ui.modalCloseNight);
        });

        ui.formCloseNight?.addEventListener('submit', (e) => {
            e.preventDefault();
            submitCloseNight();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 12. Initialization
    // ─────────────────────────────────────────────────────────────────────────
    async function init() {
        setPageState('loading');
        bindEvents();

        const hasWorkday = await loadCurrentClosing();
        if (!hasWorkday) {
            setPageState('empty');
            return;
        }

        await loadData();
        startRealtime();
    }

    init();
})();
