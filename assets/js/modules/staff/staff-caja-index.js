(async function () {
    'use strict';

    /**
     * STATE MANAGEMENT
     */
    const state = {
        currentUser: null,
        currentWorkDay: null,
        cashClosingId: null,

        // Terminal Data
        assignedTerminal: null, // { id, terminal_id, status, ... }
        isAssigned: false,

        // Status
        status: 'idle'
    };

    /**
     * DOM REFERENCES
     */
    const ui = {
        // Welcoming
        userName: document.getElementById('user-name'),
        roleSubtitle: document.getElementById('role-subtitle'),
        // Status & Feedback
        statusMessage: document.getElementById('status-message'),

        // Convocations
        convocationCard: document.getElementById('convocation-card'),
        convocationDate: document.getElementById('convocation-date'),
        convocationRole: document.getElementById('convocation-role'),
        btnConfirmConvocation: document.getElementById('btn-confirm-convocation'),

        // Dashboard
        stepDashboard: document.getElementById('step-dashboard'),
        activeTerminalName: document.getElementById('active-terminal-name'),
        terminalStatusPill: document.getElementById('terminal-status-pill'),
        statusTimeline: document.getElementById('status-timeline'),

        // Closing Form
        closingForm: document.getElementById('closing-form'),
        inputCash: document.getElementById('input-cash'),
        inputZoco: document.getElementById('input-zoco'),
        btnSubmitClose: document.getElementById('btn-submit-close'),

        // Signature
        signatureCanvas: document.getElementById('signature-canvas'),
        signaturePlaceholder: document.getElementById('signature-placeholder'),
        btnClearSignature: document.getElementById('btn-clear-signature'),
    };

    /**
     * AUTH GUARD & INITIALIZATION
     */
    const session = await window.Auth.guardOrRedirect(['staff_caja', 'admin', 'operativo', 'contable']);
    if (!session) return;

    if (!window.Utils.assertSbOrShowBlockingError()) return;

    state.currentUser = session.user;

    // Load Profile Name
    await loadUserProfile();

    // Check Work Day first
    const workDay = await loadCurrentWorkDay();

    if (workDay) {
        // Start App Flow inside Work Day
        await loadConvocations();
        await initSignaturePad();

        // Start Realtime to listen for assignments
        startAssignmentWatcher();
    }

    /**
     * DOM LOGIC & RENDERERS
     */

    function renderConvocationCard(convocation) {
        if (!convocation) return;

        // Format Date
        const dateObj = new Date(convocation.work_days.work_date + 'T12:00:00');
        const dateStr = new Intl.DateTimeFormat('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(dateObj);

        // Update UI
        ui.convocationDate.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        ui.convocationRole.textContent = `Rol asignado: ${convocation.role.toUpperCase().replace('_', ' ')}`;

        ui.btnConfirmConvocation.onclick = () => handleConfirmConvocation(convocation.id);

        ui.convocationCard.classList.remove('hidden');
        ui.convocationCard.classList.add('flex');

        // If pending convocation exists, hide dashboard until confirmed
        ui.stepDashboard.classList.add('hidden');
    }

    async function handleConfirmConvocation(convocationId) {
        try {
            ui.btnConfirmConvocation.disabled = true;
            ui.btnConfirmConvocation.textContent = 'CONFIRMANDO...';

            const { error } = await window.sb
                .from('staff_convocations')
                .update({ status: 'confirmed' })
                .eq('id', convocationId);

            if (error) throw error;

            window.Toast.success('Asistencia confirmada');

            ui.convocationCard.classList.add('hidden');
            ui.convocationCard.classList.remove('flex');

            // Proceed to check assignment
            checkForAssignment();

        } catch (error) {
            console.error('[StaffCaja] Confirmation error:', error);
            window.Toast.error('Error al confirmar asistencia');
            ui.btnConfirmConvocation.disabled = false;
            ui.btnConfirmConvocation.textContent = 'CONFIRMAR ASISTENCIA';
        }
    }

    /**
     * DATA LOADING
     */

    async function loadConvocations() {
        ui.statusMessage.classList.add('hidden');

        try {
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await window.sb
                .from('staff_convocations')
                .select(`
                    id, status, role, work_day_id,
                    work_days!inner ( work_date, type, status )
                `)
                .eq('staff_id', state.currentUser.id)
                .eq('status', 'pending')
                .gte('work_days.work_date', today)
                .order('work_days(work_date)', { ascending: true })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                renderConvocationCard(data[0]);
            } else {
                // If no pending convocation, proceed directly
                checkForAssignment();
            }
        } catch (error) {
            console.error('[StaffCaja] Error loading convocations:', error);
            // Non-blocking error, try to proceed
            checkForAssignment();
        }
    }

    async function loadCurrentWorkDay() {
        try {
            const { data, error } = await window.sb
                .from('work_days')
                .select('id, work_date, status')
                .eq('status', 'open')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (!data) {
                ui.statusMessage.textContent = 'NO HAY JORNADA ACTIVA';
                ui.statusMessage.className = 'alert alert-error mb-4 font-bold text-center block';
                ui.statusMessage.classList.remove('hidden');
                return null;
            }

            state.currentWorkDay = data;

            // Get generic Cash Closing ID for this day
            const { data: closingData, error: closingError } = await window.sb
                .from('cash_closings')
                .select('id')
                .eq('work_day_id', data.id)
                .maybeSingle();

            if (closingError) console.warn('[StaffCaja] No cash closing yet:', closingError.message);
            if (closingData) state.cashClosingId = closingData.id;

            return data;
        } catch (error) {
            console.error('[StaffCaja] Error loading workday:', error);
            return null;
        }
    }

    async function checkForAssignment() {
        if (!state.cashClosingId) {
            ui.statusMessage.textContent = 'ESPERANDO APERTURA DE CAJA...';
            ui.statusMessage.className = 'alert alert-warning mb-4 font-bold text-center block';
            ui.statusMessage.classList.remove('hidden');
            return;
        }

        ui.statusMessage.classList.add('hidden');

        try {
            const { data: assignment, error } = await window.sb
                .from('closing_terminals')
                .select(`
                    id,
                    terminal_id,
                    status,
                    declared_cash,
                    declared_zoco,
                    pos_terminals ( friendly_name )
                `)
                .eq('cash_closing_id', state.cashClosingId)
                .eq('staff_id', state.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (assignment) {
                // ASSIGNED
                state.assignedTerminal = assignment;
                state.isAssigned = true;
                renderDashboard();
            } else {
                // NOT ASSIGNED YET
                state.assignedTerminal = null;
                state.isAssigned = false;
                ui.stepDashboard.classList.add('hidden');

                ui.statusMessage.textContent = 'ESPERANDO ASIGNACIÓN DE TERMINAL...';
                ui.statusMessage.className = 'alert alert-info mb-4 font-bold text-center block animate-pulse';
                ui.statusMessage.classList.remove('hidden');
            }

        } catch (error) {
            console.error('[StaffCaja] Error checking assignment:', error);
            window.Toast.error('Error verificando asignación');
        }
    }

    function updateTimeline(status) {
        if (!ui.statusTimeline) return;

        const steps = ['waiting', 'assigned', 'submitted', 'verified'];
        const statusMap = { opened: 1, submitted: 2, verified: 3, closed: 3 };
        const activeIndex = statusMap[status] ?? 0;

        const stepEls = ui.statusTimeline.querySelectorAll('.timeline-step');
        const connectorEls = ui.statusTimeline.querySelectorAll('.timeline-connector');

        stepEls.forEach((el, i) => {
            el.classList.remove('is-active', 'is-completed');
            if (i < activeIndex) el.classList.add('is-completed');
            else if (i === activeIndex) el.classList.add('is-active');
        });

        connectorEls.forEach((el, i) => {
            el.classList.toggle('is-filled', i < activeIndex);
        });

        // Update pill
        const pillMap = { opened: 'ASIGNADO', submitted: 'DECLARADO', verified: 'VERIFICADO', closed: 'CERRADO' };
        const pillClass = { opened: 'status-active', submitted: 'status-warning', verified: 'status-success', closed: 'status-success' };
        if (ui.terminalStatusPill) {
            ui.terminalStatusPill.textContent = pillMap[status] || 'ESPERANDO';
            ui.terminalStatusPill.className = `status-pill ${pillClass[status] || 'status-active'}`;
        }
    }

    function renderDashboard() {
        if (!state.assignedTerminal) return;

        ui.statusMessage.classList.add('hidden');
        ui.stepDashboard.classList.remove('hidden');
        ui.activeTerminalName.textContent = state.assignedTerminal.pos_terminals.friendly_name;

        // Update timeline
        updateTimeline(state.assignedTerminal.status);

        // Populate Form if data exists
        if (state.assignedTerminal.declared_cash) ui.inputCash.value = state.assignedTerminal.declared_cash;
        if (state.assignedTerminal.declared_zoco) ui.inputZoco.value = state.assignedTerminal.declared_zoco;

        // Check Read Only
        const isReadOnly = ['submitted', 'verified', 'closed'].includes(state.assignedTerminal.status);

        if (isReadOnly) {
            ui.inputCash.disabled = true;
            ui.inputZoco.disabled = true;
            ui.btnSubmitClose.disabled = true;
            ui.btnSubmitClose.textContent = 'CIERRE ENVIADO / VERIFICADO';
            ui.btnSubmitClose.classList.add('btn-disabled');

            // Lock signature
            const ctx = ui.signatureCanvas.getContext('2d');
            ctx.clearRect(0, 0, ui.signatureCanvas.width, ui.signatureCanvas.height);
            // Ideally we should show the saved signature image here if we wanted to be thorough, 
            // but for now locking the input is enough.
            ui.signaturePlaceholder.textContent = 'Firma registrada';
            ui.signatureCanvas.classList.add('pointer-events-none', 'opacity-50');
            ui.btnClearSignature.style.display = 'none';

        } else {
            ui.inputCash.disabled = false;
            ui.inputZoco.disabled = false;
            ui.btnSubmitClose.disabled = false;
            ui.btnSubmitClose.textContent = 'CERRAR TURNO';
            ui.btnSubmitClose.classList.remove('btn-disabled');
            ui.signatureCanvas.classList.remove('pointer-events-none', 'opacity-50');
            ui.btnClearSignature.style.display = 'block';
        }

        // Resize canvas
        setTimeout(resizeCanvas, 100);
    }

    // Signature Logic
    let isSignatureEmpty = true;
    let isDrawing = false;

    function initSignaturePad() {
        if (!ui.signatureCanvas) return;

        const ctx = ui.signatureCanvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#fff';

        function getPos(e) {
            const rect = ui.signatureCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        }

        function start(e) {
            e.preventDefault();
            isDrawing = true;
            const pos = getPos(e);
            const ctx = ui.signatureCanvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ui.signaturePlaceholder.classList.add('hidden');
        }

        function move(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const pos = getPos(e);
            const ctx = ui.signatureCanvas.getContext('2d');
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            isSignatureEmpty = false;
        }

        function end() { isDrawing = false; }

        ui.signatureCanvas.addEventListener('mousedown', start);
        ui.signatureCanvas.addEventListener('mousemove', move);
        ui.signatureCanvas.addEventListener('mouseup', end);
        ui.signatureCanvas.addEventListener('mouseleave', end);
        ui.signatureCanvas.addEventListener('touchstart', start, { passive: false });
        ui.signatureCanvas.addEventListener('touchmove', move, { passive: false });
        ui.signatureCanvas.addEventListener('touchend', end);
    }

    function clearSignature() {
        const ctx = ui.signatureCanvas.getContext('2d');
        ctx.clearRect(0, 0, ui.signatureCanvas.width, ui.signatureCanvas.height);
        ui.signaturePlaceholder.classList.remove('hidden');
        isSignatureEmpty = true;
    }

    function resizeCanvas() {
        if (!ui.signatureCanvas) return;
        const container = ui.signatureCanvas.parentElement;
        ui.signatureCanvas.width = container.offsetWidth;
        ui.signatureCanvas.height = container.offsetHeight;

        const ctx = ui.signatureCanvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#fff';
    }

    async function handleSubmitClosing(e) {
        e.preventDefault();

        if (!navigator.onLine) {
            window.Toast.error('Sin conexión a internet');
            return;
        }

        if (state.assignedTerminal.status !== 'open' && state.assignedTerminal.status !== 'rejected') {
            window.Toast.error('Estado de terminal inválido');
            return;
        }

        if (isSignatureEmpty && !state.assignedTerminal.declared_cash) {
            window.Toast.error('La firma digital es obligatoria');
            return;
        }

        const cash = parseFloat(ui.inputCash.value) || 0;
        const zoco = parseFloat(ui.inputZoco.value) || 0;

        if (cash < 0 || zoco < 0) {
            window.Toast.error('Los montos no pueden ser negativos');
            return;
        }

        const signatureData = ui.signatureCanvas.toDataURL();

        const confirmed = await window.Utils.confirmModal('¿CONFIRMAR CIERRE DE CAJA?\n\nVerifica que los montos coincidan con tu conteo físico. Esta acción notificará al encargado.');
        if (!confirmed) return;

        try {
            ui.btnSubmitClose.disabled = true;
            ui.btnSubmitClose.textContent = 'ENVIANDO...';

            const { error } = await window.sb
                .from('closing_terminals')
                .update({
                    declared_cash: cash,
                    declared_zoco: zoco,
                    signature_data: signatureData,
                    status: 'submitted',
                    submitted_at: new Date().toISOString()
                })
                .eq('id', state.assignedTerminal.id);

            if (error) throw error;

            window.Toast.success('Cierre enviado exitosamente');

            // Reload to update state and lock UI
            checkForAssignment();

        } catch (error) {
            console.error('[StaffCaja] Closing error:', error);
            window.Toast.error('Error al enviar cierre');
            ui.btnSubmitClose.disabled = false;
            ui.btnSubmitClose.textContent = 'CERRAR TURNO';
        }
    }

    /**
     * REALTIME ASSIGNMENT WATCHER
     */
    function startAssignmentWatcher() {
        if (!state.cashClosingId) return;

        window.sb
            .channel('staff_assignment_watch')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'closing_terminals',
                    filter: `cash_closing_id=eq.${state.cashClosingId}`
                },
                (payload) => {
                    // Check if update relates to me
                    if (payload.new && payload.new.staff_id === state.currentUser.id) {
                        console.log('[Realtime] My assignment updated', payload);
                        checkForAssignment();
                        window.Toast.info('Estado de terminal actualizado');
                    } else if (payload.eventType === 'DELETE' && payload.old.id === state.assignedTerminal?.id) {
                        // I was unassigned
                        checkForAssignment();
                        window.Toast.warning('Asignación removida');
                    }
                }
            )
            .subscribe();
    }

    /**
     * HELPER FUNCTIONS & EVENTS
     */

    async function loadUserProfile() {
        if (!ui.userName) return;
        try {
            const { data: profile } = await window.sb
                .from('profiles').select('full_name').eq('id', state.currentUser.id).single();
            if (profile) ui.userName.textContent = profile.full_name;
        } catch { /* Silent */ }
    }

    if (ui.btnLogout) {
        ui.btnLogout.addEventListener('click', () => {
            if (window.Auth) window.Auth.signOutAndGoLogin();
        });
    }

    if (ui.btnClearSignature) ui.btnClearSignature.onclick = clearSignature;
    if (ui.closingForm) ui.closingForm.onsubmit = handleSubmitClosing;

    window.addEventListener('resize', () => {
        if (!ui.stepDashboard.classList.contains('hidden')) {
            resizeCanvas();
        }
    });

})();
