/**
 * Encargado Barra Personal Module
 * @module encargado-barra-personal
 * 
 * Gestión de Convocatorias y Nómina para el Encargado de Barra.
 * - Selección de jornada.
 * - Visualización de planificación/requerimientos.
 * - Convocatoria de staff con selección de rol.
 * - Gestión de nómina.
 */

(async function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. DOM References
    // ─────────────────────────────────────────────────────────────
    const ui = {
        // States
        pageCardLoading: document.getElementById('page-card-loading'),
        pageCardEmpty: document.getElementById('page-card-empty'),
        moduleContent: document.getElementById('module-content'),

        // Controls
        selectWorkday: document.getElementById('selectWorkday'),
        workdayStatus: document.getElementById('workdayStatus'),
        btnRefresh: document.getElementById('btn-refresh'),
        searchStaff: document.getElementById('searchStaff'),

        // Tabs
        tabPills: document.querySelectorAll('[data-tab]'),
        tabConvocar: document.getElementById('tabConvocar'),
        tabNomina: document.getElementById('tabNomina'),

        // Planning
        planningSummary: document.getElementById('planningSummary'),
        requirementsList: document.getElementById('requirementsList'),
        coveragePercent: document.getElementById('coveragePercent'),
        btnAutoConvocate: document.getElementById('btnAutoConvocate'),

        // Lists
        convocationList: document.getElementById('convocationList'),
        nominaList: document.getElementById('nominaList'),

        // Staff Panel
        panelOverlay: document.getElementById('panelOverlay'),
        staffPanel: document.getElementById('staffPanel'),
        btnAddStaff: document.getElementById('btnAddStaff'),
        btnCloseStaffPanel: document.getElementById('btnCloseStaffPanel'),
        btnCancelStaff: document.getElementById('btnCancelStaff'),
        btnSaveStaff: document.getElementById('btnSaveStaff'),
        staffForm: document.getElementById('staffForm'),
        staffName: document.getElementById('staffName'),

        // Role Selection Modal
        roleModal: document.getElementById('roleModal'),
        roleOptions: document.getElementById('roleOptions'),
        btnCancelRole: document.getElementById('btnCancelRole'),
        btnCloseRole: document.getElementById('btn-close-role'),

        // Confirm Modal
        confirmModal: document.getElementById('confirmModal'),
        confirmTitle: document.getElementById('confirmTitle'),
        confirmMessage: document.getElementById('confirmMessage'),
        btnCancelConfirm: document.getElementById('btnCancelConfirm'),
        btnCloseConfirm: document.getElementById('btn-close-confirm'),
        btnConfirm: document.getElementById('btnConfirm')
    };

    // ─────────────────────────────────────────────────────────────
    // 2. State
    // ─────────────────────────────────────────────────────────────
    const state = {
        activeWorkDay: null,
        staffList: [],
        requirements: [],
        convocations: [],
        pendingConvocation: null // { staffId, resolve }
    };

    // ─────────────────────────────────────────────────────────────
    // 3. Guard & Assertions
    // ─────────────────────────────────────────────────────────────
    const session = await window.Auth.guardOrRedirect(['encargado_barra', 'admin', 'contable']);
    if (!session) return;

    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // ─────────────────────────────────────────────────────────────
    // 4. Page State Management
    // ─────────────────────────────────────────────────────────────
    function setPageState(stateName) {
        if (ui.pageCardLoading) ui.pageCardLoading.classList.toggle('hidden', stateName !== 'loading');
        if (ui.pageCardEmpty) ui.pageCardEmpty.classList.toggle('hidden', stateName !== 'empty');
        if (ui.moduleContent) ui.moduleContent.classList.toggle('hidden', stateName !== 'content');
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Tab Management
    // ─────────────────────────────────────────────────────────────
    function initTabs() {
        ui.tabPills.forEach(pill => {
            pill.addEventListener('click', () => {
                // Update pills
                ui.tabPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                // Show/hide content
                const targetTab = pill.dataset.tab;
                ui.tabConvocar.classList.toggle('hidden', targetTab !== 'convocar');
                ui.tabNomina.classList.toggle('hidden', targetTab !== 'nomina');
            });
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Data Loading
    // ─────────────────────────────────────────────────────────────
    async function loadWorkDays() {
        try {
            const { data, error } = await window.sb
                .from('work_days')
                .select('id, work_date, status, notes')
                .in('status', ['PLANNED', 'ACTIVE'])
                .order('work_date', { ascending: true });

            if (error) throw error;

            ui.selectWorkday.innerHTML = '<option value="">Seleccionar Jornada...</option>';
            (data || []).forEach(wd => {
                const opt = document.createElement('option');
                opt.value = wd.id;
                opt.textContent = `${wd.work_date} (${wd.status === 'ACTIVE' ? 'En Curso' : 'Planificación'})`;
                ui.selectWorkday.appendChild(opt);
            });

            return data || [];
        } catch (err) {
            console.error('[encargado-barra-personal] Error loading workdays:', err);
            window.Toast.error('Error al cargar jornadas');
            return [];
        }
    }

    async function loadNomina() {
        try {
            const { data, error } = await window.sb
                .from('profiles')
                .select('*')
                .ilike('role', '%staff%')
                .order('full_name');

            if (error) throw error;

            state.staffList = (data || []).filter(p => p.active !== false);
            renderNomina();
        } catch (err) {
            console.error('[encargado-barra-personal] Error loading nomina:', err);
            window.Toast.error('Error al cargar nómina');
        }
    }

    async function loadRequirements(workDayId) {
        try {
            const { data, error } = await window.sb
                .from('work_day_staff_planning')
                .select(`
                    quantity,
                    role:master_staff_roles (id, name, base_rate)
                `)
                .eq('work_day_id', workDayId);

            if (error) throw error;
            state.requirements = data || [];
        } catch (err) {
            console.error('[encargado-barra-personal] Error loading requirements:', err);
        }
    }

    async function loadConvocations(workDayId) {
        try {
            const { data, error } = await window.sb
                .from('staff_convocations')
                .select('*')
                .eq('work_day_id', workDayId);

            if (error) throw error;
            state.convocations = data || [];
        } catch (err) {
            console.error('[encargado-barra-personal] Error loading convocations:', err);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 7. Rendering
    // ─────────────────────────────────────────────────────────────
    function renderRequirements() {
        ui.requirementsList.innerHTML = '';

        if (state.requirements.length === 0) {
            ui.requirementsList.innerHTML = '<div class="empty-state">No hay planificación definida.</div>';
            ui.planningSummary.classList.add('hidden');
            return;
        }

        ui.planningSummary.classList.remove('hidden');

        state.requirements.forEach(req => {
            const count = state.convocations.filter(c => c.role_id === req.role.id).length;
            const isMet = count >= req.quantity;

            const div = document.createElement('div');
            div.className = 'staff-row';
            div.innerHTML = `
                <span class="${isMet ? 'accent' : ''}">${req.role.name}</span>
                <span class="status-pill ${isMet ? 'status-success' : 'status-warning'}">${count} / ${req.quantity}</span>
            `;
            ui.requirementsList.appendChild(div);
        });

        // Coverage percentage
        const totalReq = state.requirements.reduce((acc, r) => acc + r.quantity, 0);
        const totalConv = state.convocations.length;
        const pct = totalReq > 0 ? Math.round((totalConv / totalReq) * 100) : 0;
        ui.coveragePercent.textContent = `${pct}%`;
    }

    function renderConvocations() {
        ui.convocationList.innerHTML = '';
        const searchVal = (ui.searchStaff.value || '').toLowerCase();

        const filteredStaff = state.staffList.filter(s =>
            (s.full_name || '').toLowerCase().includes(searchVal)
        );

        if (filteredStaff.length === 0) {
            ui.convocationList.innerHTML = '<div class="empty-state">No se encontraron miembros.</div>';
            return;
        }

        filteredStaff.forEach(staff => {
            const convocation = state.convocations.find(c => c.user_id === staff.id);
            const card = document.createElement('div');
            card.className = 'staff-row';

            let actionHtml = '';
            if (convocation) {
                const statusMap = {
                    confirmed: 'status-success',
                    pending: 'status-warning',
                    rejected: 'status-error'
                };
                const statusClass = statusMap[convocation.status] || 'status-neutral';

                actionHtml = `
                    <div class="text-right">
                        <span class="status-pill ${statusClass}">${convocation.status.toUpperCase()}</span>
                        ${convocation.status !== 'confirmed' ?
                            `<button class="btn-ghost btn-sm mt-xs" data-action="confirm" data-id="${convocation.id}">Forzar</button>`
                            : ''}
                    </div>
                `;
            } else {
                actionHtml = `<button class="btn-secondary btn-sm" data-action="convocate" data-staff="${staff.id}">Convocar</button>`;
            }

            card.innerHTML = `
                <div class="flex items-center gap-sm">
                    <div class="avatar-initial">${(staff.full_name || 'U').charAt(0)}</div>
                    <div>
                        <div class="font-medium">${staff.full_name || 'Sin Nombre'}</div>
                        <div class="muted text-sm">${staff.role || 'Staff'}</div>
                    </div>
                </div>
                ${actionHtml}
            `;

            ui.convocationList.appendChild(card);
        });
    }

    function renderNomina() {
        ui.nominaList.innerHTML = '';

        if (state.staffList.length === 0) {
            ui.nominaList.innerHTML = '<tr><td colspan="4" class="text-center muted">No hay staff registrado.</td></tr>';
            return;
        }

        const html = state.staffList.map(staff => `
            <tr class="table-row">
                <td class="table-cell">${staff.full_name || '-'}</td>
                <td class="table-cell muted">${staff.role || 'Staff'}</td>
                <td class="table-cell text-center">
                    <span class="status-pill ${staff.active !== false ? 'status-success' : 'status-error'}">
                        ${staff.active !== false ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>
                <td class="table-cell text-right">
                    <button class="btn-ghost btn-sm" data-action="edit-staff" data-id="${staff.id}">Editar</button>
                </td>
            </tr>
        `).join('');

        ui.nominaList.innerHTML = html;
    }

    // ─────────────────────────────────────────────────────────────
    // 8. Actions
    // ─────────────────────────────────────────────────────────────
    async function handleWorkDayChange(workDayId) {
        if (!workDayId) {
            state.activeWorkDay = null;
            state.requirements = [];
            state.convocations = [];
            ui.workdayStatus.textContent = 'SELECCIONAR';
            ui.workdayStatus.className = 'status-pill status-neutral';
            ui.planningSummary.classList.add('hidden');
            ui.convocationList.innerHTML = '<div class="empty-state">Selecciona una jornada para gestionar convocatorias.</div>';
            return;
        }

        setPageState('loading');

        try {
            const { data: wd, error } = await window.sb
                .from('work_days')
                .select('*')
                .eq('id', workDayId)
                .single();

            if (error) throw error;

            state.activeWorkDay = wd;
            ui.workdayStatus.textContent = wd.status.toUpperCase();
            ui.workdayStatus.className = `status-pill ${wd.status === 'ACTIVE' ? 'status-success' : 'status-info'}`;

            await Promise.all([
                loadRequirements(workDayId),
                loadConvocations(workDayId)
            ]);

            renderRequirements();
            renderConvocations();
            setPageState('content');

        } catch (err) {
            console.error('[encargado-barra-personal] Error:', err);
            window.Toast.error('Error al cargar datos de jornada');
            setPageState('empty');
        }
    }

    async function openRoleSelectionModal(staffId) {
        if (state.requirements.length === 0) {
            window.Toast.warning('No hay roles planificados para hoy.');
            return;
        }

        // Render role options
        ui.roleOptions.innerHTML = state.requirements.map(req => `
            <button class="btn-secondary w-full mb-xs" data-role-id="${req.role.id}">
                ${req.role.name}
            </button>
        `).join('');

        // Store pending convocation
        state.pendingConvocation = { staffId };

        // Show modal
        ui.roleModal.showModal();
    }

    function closeRoleModal() {
        ui.roleModal.close();
        state.pendingConvocation = null;
    }

    async function convocate(userId, roleId) {
        if (!state.activeWorkDay) return;

        try {
            const { error } = await window.sb
                .from('staff_convocations')
                .insert({
                    work_day_id: state.activeWorkDay.id,
                    user_id: userId,
                    role_id: roleId,
                    status: 'pending'
                });

            if (error) throw error;

            window.Toast.success('Convocatoria enviada');
            await handleWorkDayChange(state.activeWorkDay.id);
        } catch (err) {
            console.error('[encargado-barra-personal] Error convocating:', err);
            window.Toast.error('Error al convocar: ' + err.message);
        }
    }

    async function manualConfirm(convocationId) {
        const confirmed = await showConfirmModal(
            'Confirmar Asistencia',
            '¿Confirmar asistencia manualmente? Solo usar si el staff no puede hacerlo.'
        );

        if (!confirmed) return;

        try {
            const { error } = await window.sb
                .from('staff_convocations')
                .update({
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString()
                })
                .eq('id', convocationId);

            if (error) throw error;

            window.Toast.success('Asistencia confirmada');
            await handleWorkDayChange(state.activeWorkDay.id);
        } catch (err) {
            console.error('[encargado-barra-personal] Error confirming:', err);
            window.Toast.error('Error: ' + err.message);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 9. Modal Helpers
    // ─────────────────────────────────────────────────────────────
    function showConfirmModal(title, message) {
        return new Promise(resolve => {
            ui.confirmTitle.textContent = title;
            ui.confirmMessage.textContent = message;
            ui.confirmModal.showModal();

            const handleConfirm = () => {
                cleanup();
                resolve(true);
            };

            const handleCancel = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                ui.confirmModal.close();
                ui.btnConfirm.removeEventListener('click', handleConfirm);
                ui.btnCancelConfirm.removeEventListener('click', handleCancel);
                ui.btnCloseConfirm?.removeEventListener('click', handleCancel);
                ui.confirmModal.removeEventListener('cancel', handleCancel);
            };

            ui.btnConfirm.addEventListener('click', handleConfirm);
            ui.btnCancelConfirm.addEventListener('click', handleCancel);
            ui.btnCloseConfirm?.addEventListener('click', handleCancel);
            ui.confirmModal.addEventListener('cancel', handleCancel);
        });
    }

    function openStaffPanel() {
        ui.staffForm.reset();
        ui.panelOverlay.classList.add('open');
        ui.staffPanel.classList.add('open');
    }

    function closeStaffPanel() {
        ui.panelOverlay.classList.remove('open');
        ui.staffPanel.classList.remove('open');
    }

    async function saveStaff() {
        const name = ui.staffName.value.trim();
        if (!name) {
            window.Toast.warning('Nombre requerido');
            return;
        }

        try {
            const { error } = await window.sb
                .from('profiles')
                .insert({
                    full_name: name,
                    role: 'staff_barra',
                    active: true
                });

            if (error) throw error;

            window.Toast.success('Staff creado');
            closeStaffPanel();
            await loadNomina();
        } catch (err) {
            console.error('[encargado-barra-personal] Error saving staff:', err);
            window.Toast.error('Error al crear staff: ' + err.message);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 10. Event Bindings
    // ─────────────────────────────────────────────────────────────
    function bindEvents() {
        // Workday selector
        ui.selectWorkday.addEventListener('change', e => handleWorkDayChange(e.target.value));

        // Refresh button (optional — not present in all layouts)
        ui.btnRefresh?.addEventListener('click', () => {
            if (state.activeWorkDay) {
                handleWorkDayChange(state.activeWorkDay.id);
            } else {
                init();
            }
        });

        // Search
        ui.searchStaff.addEventListener('input', window.Utils.debounce(() => {
            renderConvocations();
        }, 300));

        // Staff panel
        ui.btnAddStaff?.addEventListener('click', openStaffPanel);
        ui.btnCloseStaffPanel?.addEventListener('click', closeStaffPanel);
        ui.btnCancelStaff?.addEventListener('click', closeStaffPanel);
        ui.panelOverlay?.addEventListener('click', closeStaffPanel);
        ui.btnSaveStaff?.addEventListener('click', saveStaff);

        // Role modal - cancel / close
        ui.btnCancelRole?.addEventListener('click', closeRoleModal);
        ui.btnCloseRole?.addEventListener('click', closeRoleModal);

        // Role modal - role selection (event delegation)
        ui.roleOptions?.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-role-id]');
            if (!btn || !state.pendingConvocation) return;

            const roleId = btn.dataset.roleId;
            const staffId = state.pendingConvocation.staffId;
            closeRoleModal();
            await convocate(staffId, roleId);
        });

        // Convocation list actions (event delegation)
        ui.convocationList?.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;

            if (action === 'convocate') {
                const staffId = btn.dataset.staff;
                await openRoleSelectionModal(staffId);
            } else if (action === 'confirm') {
                const id = btn.dataset.id;
                await manualConfirm(id);
            }
        });

        // Nomina actions (event delegation)
        ui.nominaList?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            if (btn.dataset.action === 'edit-staff') {
                window.Toast.info('Edición de staff no implementada en MVP');
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 11. Initialization
    // ─────────────────────────────────────────────────────────────
    async function init() {
        setPageState('loading');
        initTabs();
        bindEvents();

        await Promise.all([
            loadWorkDays(),
            loadNomina()
        ]);

        // Pre-select first workday if exists
        if (ui.selectWorkday.options.length > 1) {
            ui.selectWorkday.selectedIndex = 1;
            await handleWorkDayChange(ui.selectWorkday.value);
        } else {
            setPageState('empty');
        }
    }

    await init();

})();
