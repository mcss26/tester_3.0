/**
 * Encargado Caja Personal Module
 * Gestión de Convocatorias y Nómina (Specific for Staff Caja)
 * 
 * @module encargado-caja-personal
 * @requires window.Auth
 * @requires window.sb (Supabase client)
 * @requires window.Utils
 * @requires window.Toast
 */
(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['encargado_caja', 'admin', 'contable']);
    if (!session) return;

    // 2. Supabase Assertion
    if (!window.Utils.assertSbOrShowBlockingError()) {
        console.error('[EncargadoCajaPersonal] Supabase client not initialized.');
        return;
    }

    // 3. State
    const state = {
        activeWorkDay: null,
        staffList: [],
        requirements: [],
        convocations: [],
        pendingConfirmAction: null
    };

    // 4. DOM References
    const ui = {
        // Page states
        pageCardLoading: document.getElementById('page-card-loading'),
        pageCardEmpty: document.getElementById('page-card-empty'),
        moduleContent: document.getElementById('module-content'),
        
        // Workday controls
        selectWorkDay: document.getElementById('select-workday'),
        statusLabel: document.getElementById('workday-status'),
        planningSummary: document.getElementById('planning-summary'),
        requirementsList: document.getElementById('requirements-list'),
        coveragePercent: document.getElementById('coverage-percent'),
        
        // Lists
        convocationList: document.getElementById('convocation-list'),
        nominaList: document.getElementById('nomina-list'),
        searchStaff: document.getElementById('search-staff'),
        
        // Tabs
        viewConvocar: document.getElementById('view-convocar'),
        viewNomina: document.getElementById('view-nomina'),
        
        // Staff Panel
        panelOverlay: document.getElementById('panelOverlay'),
        staffPanel: document.getElementById('staff-panel'),
        staffForm: document.getElementById('staff-form'),
        staffName: document.getElementById('staff-name'),
        staffPhone: document.getElementById('staff-phone'),
        btnAddStaff: document.getElementById('btn-add-staff'),
        btnCloseStaffPanel: document.getElementById('btn-close-staff-panel'),
        btnCancelStaff: document.getElementById('btn-cancel-staff'),
        btnSaveStaff: document.getElementById('btn-save-staff'),
        
        // Confirm Modal
        confirmModal: document.getElementById('confirmModal'),
        confirmTitle: document.getElementById('confirm-title'),
        confirmMessage: document.getElementById('confirm-message'),
        btnCancelConfirm: document.getElementById('btn-cancel-confirm'),
        btnConfirmAction: document.getElementById('btn-confirm-action')
    };

    // 5. State Management
    function setPageState({ loading = false, empty = false } = {}) {
        if (ui.pageCardLoading) ui.pageCardLoading.classList.toggle('is-visible', loading);
        if (ui.pageCardEmpty) ui.pageCardEmpty.classList.toggle('is-visible', empty);
        if (ui.moduleContent) ui.moduleContent.classList.toggle('hidden', loading || empty);
    }

    // 6. Panel Functions
    function openPanel() {
        ui.panelOverlay?.classList.add('open');
        ui.staffPanel?.classList.add('open');
    }

    function closePanel() {
        ui.panelOverlay?.classList.remove('open');
        ui.staffPanel?.classList.remove('open');
        ui.staffForm?.reset();
    }

    // 7. Confirm Modal Functions
    function showConfirmModal(title, message, action) {
        state.pendingConfirmAction = action;
        if (ui.confirmTitle) ui.confirmTitle.textContent = title;
        if (ui.confirmMessage) ui.confirmMessage.innerHTML = message;
        ui.confirmModal?.classList.remove('hidden');
    }

    function hideConfirmModal() {
        ui.confirmModal?.classList.add('hidden');
        state.pendingConfirmAction = null;
    }

    // 8. Data Loading Functions
    async function loadWorkDays() {
        try {
            const { data, error } = await window.sb
                .from('work_days')
                .select('id, work_date, status, notes')
                .in('status', ['planning', 'open'])
                .order('work_date', { ascending: true });

            if (error) throw error;

            ui.selectWorkDay.innerHTML = '<option value="">Seleccionar Jornada...</option>';
            (data || []).forEach(wd => {
                const opt = document.createElement('option');
                opt.value = wd.id;
                opt.textContent = `${wd.work_date} (${wd.status === 'open' ? 'En Curso' : 'Planificación'})`;
                ui.selectWorkDay.appendChild(opt);
            });
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Error loading workdays:', e);
            window.Toast?.error('Error al cargar jornadas');
        }
    }

    async function loadNomina() {
        try {
            const { data, error } = await window.sb
                .from('profiles')
                .select('*')
                .ilike('role', '%staff_caja%')
                .order('full_name');

            if (error) throw error;

            const filtered = (data || []).filter(profile => {
                if (typeof profile.active === 'boolean') return profile.active;
                if (typeof profile.is_active === 'boolean') return profile.is_active;
                return true;
            });

            state.staffList = filtered;
            renderNomina(filtered);
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Error loading nomina:', e);
        }
    }

    async function handleWorkDayChange(workDayId) {
        if (!workDayId) {
            state.activeWorkDay = null;
            renderRequirementsReset();
            return;
        }

        try {
            const { data: wd, error } = await window.sb
                .from('work_days')
                .select('*')
                .eq('id', workDayId)
                .single();

            if (error) throw error;

            state.activeWorkDay = wd;
            
            if (ui.statusLabel) {
                ui.statusLabel.textContent = wd.status.toUpperCase();
                ui.statusLabel.className = `status-pill ${wd.status === 'open' ? 'status-success' : 'status-info'}`;
            }

            ui.planningSummary?.classList.remove('hidden');

            await Promise.all([
                loadRequirements(workDayId),
                loadConvocations(workDayId)
            ]);

            renderConvocationView();
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Error changing workday:', e);
            window.Toast?.error('Error al cargar jornada');
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

            // Filter for Caja roles only
            const allReqs = data || [];
            state.requirements = allReqs.filter(r =>
                (r.role.name || '').toLowerCase().includes('caja') ||
                (r.role.name || '').toLowerCase().includes('ticket')
            );

            renderRequirementsList();
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Error loading requirements:', e);
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
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Error loading convocations:', e);
        }
    }

    // 9. Render Functions
    function renderRequirementsList() {
        if (!ui.requirementsList) return;

        if (state.requirements.length === 0) {
            ui.requirementsList.innerHTML = '<div class="muted">No hay planificación de Caja.</div>';
            return;
        }

        ui.requirementsList.innerHTML = state.requirements.map(req => {
            const count = state.convocations.filter(c => c.role_id === req.role.id).length;
            const isMet = count >= req.quantity;
            return `
                <div class="stat-row">
                    <span class="${isMet ? 'accent' : ''}">${req.role.name}</span>
                    <span class="${isMet ? 'accent' : 'danger'}">${count} / ${req.quantity}</span>
                </div>
            `;
        }).join('');

        // Update Percentage
        const totalReq = state.requirements.reduce((acc, r) => acc + r.quantity, 0);
        const relevantRoleIds = state.requirements.map(r => r.role.id);
        const totalConv = state.convocations.filter(c => relevantRoleIds.includes(c.role_id)).length;
        const pct = totalReq > 0 ? Math.round((totalConv / totalReq) * 100) : 0;

        if (ui.coveragePercent) {
            ui.coveragePercent.textContent = `${pct}%`;
            ui.coveragePercent.className = `stat-value ${pct >= 100 ? 'accent' : ''}`;
        }
    }

    function renderRequirementsReset() {
        if (ui.statusLabel) {
            ui.statusLabel.textContent = 'SELECCIONAR';
            ui.statusLabel.className = 'status-pill';
        }
        if (ui.requirementsList) {
            ui.requirementsList.innerHTML = '<div class="faint">Selecciona una jornada.</div>';
        }
        if (ui.convocationList) {
            ui.convocationList.innerHTML = '<div class="empty-state">Selecciona una jornada para gestionar convocatorias.</div>';
        }
        ui.planningSummary?.classList.add('hidden');
        if (ui.coveragePercent) {
            ui.coveragePercent.textContent = '0%';
            ui.coveragePercent.className = 'stat-value';
        }
        state.requirements = [];
        state.convocations = [];
    }

    function renderConvocationView() {
        if (!ui.convocationList) return;

        const searchVal = (ui.searchStaff?.value || '').toLowerCase();
        const filteredStaff = state.staffList.filter(s =>
            (s.full_name || '').toLowerCase().includes(searchVal)
        );

        if (filteredStaff.length === 0) {
            ui.convocationList.innerHTML = '<div class="empty-state">No se encontró staff de caja.</div>';
            return;
        }

        ui.convocationList.innerHTML = filteredStaff.map(staff => {
            const convocation = state.convocations.find(c => c.user_id === staff.id);
            let actionHtml = '';

            if (convocation) {
                const statusClass = {
                    'confirmed': 'status-success',
                    'rejected': 'status-error',
                    'pending': 'status-warning'
                }[convocation.status] || 'status-warning';

                actionHtml = `
                    <div class="table-cell text-right">
                        <span class="status-pill ${statusClass}">${convocation.status}</span>
                        ${convocation.status !== 'confirmed' ?
                            `<button class="btn-ghost btn-sm" data-confirm-id="${convocation.id}">Confirmar</button>`
                            : ''}
                    </div>
                `;
            } else {
                actionHtml = `
                    <div class="table-cell text-right">
                        <button class="btn-primary btn-sm" data-convoke-id="${staff.id}">Convocar</button>
                    </div>
                `;
            }

            return `
                <div class="table-row staff-card">
                    <div class="table-cell">
                        <div class="staff-avatar">${(staff.full_name || 'U').charAt(0)}</div>
                    </div>
                    <div class="table-cell">
                        <div class="cell-strong">${staff.full_name || 'Sin Nombre'}</div>
                        <div class="muted">${staff.role || 'Staff Caja'}</div>
                    </div>
                    ${actionHtml}
                </div>
            `;
        }).join('');

        // Bind convocation buttons
        ui.convocationList.querySelectorAll('[data-convoke-id]').forEach(btn => {
            btn.addEventListener('click', () => openConvocationModal(btn.dataset.convokeId));
        });

        // Bind confirm buttons
        ui.convocationList.querySelectorAll('[data-confirm-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                showConfirmModal(
                    'Confirmar Asistencia',
                    '¿Confirmar asistencia manualmente? Solo usar si el staff no puede hacerlo.',
                    () => manualConfirm(btn.dataset.confirmId)
                );
            });
        });
    }

    function renderNomina(list) {
        if (!ui.nominaList) return;

        ui.nominaList.innerHTML = list.map(staff => `
            <tr class="table-row">
                <td class="table-cell">${staff.full_name || '-'}</td>
                <td class="table-cell muted">${staff.role || 'Staff'}</td>
                <td class="table-cell"><span class="status-pill status-success">●</span></td>
                <td class="table-cell text-right">
                    <button class="btn-ghost btn-sm js-btn-edit-staff" data-staff-id="${staff.id}">✎</button>
                </td>
            </tr>
        `).join('');

        // Delegate edit clicks
        ui.nominaList.querySelectorAll('.js-btn-edit-staff').forEach(btn => {
            btn.addEventListener('click', () => window.Toast?.info('Editar no habilitado'));
        });
    }

    // 10. Action Functions
    async function openConvocationModal(staffId) {
        const roles = state.requirements.map(r => r.role);
        if (roles.length === 0) {
            window.Toast?.warning('No hay roles de Caja planificados para hoy.');
            return;
        }

        // If only one role, auto-select
        if (roles.length === 1) {
            await convocate(staffId, roles[0].id);
            return;
        }

        // Multi-role selection via dropdown
        const optionsHtml = roles.map(r =>
            `<option value="${r.id}">${window.Utils.escapeHtml(r.name)}</option>`
        ).join('');
        showConfirmModal(
            'Seleccionar Rol',
            `<label class="form-label" style="margin-bottom:var(--space-xs)">Rol a asignar:</label>
             <select id="role-select-modal" class="form-select w-full">${optionsHtml}</select>`,
            () => {
                const selectedId = document.getElementById('role-select-modal')?.value;
                if (selectedId) convocate(staffId, selectedId);
            }
        );
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

            window.Toast?.success('Convocatoria enviada');
            await handleWorkDayChange(state.activeWorkDay.id);
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Error convocating:', e);
            window.Toast?.error('Error al convocar: ' + e.message);
        }
    }

    async function manualConfirm(convocationId) {
        try {
            const { error } = await window.sb
                .from('staff_convocations')
                .update({
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString()
                })
                .eq('id', convocationId);

            if (error) throw error;

            window.Toast?.success('Asistencia confirmada');
            hideConfirmModal();
            await handleWorkDayChange(state.activeWorkDay.id);
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Error confirming:', e);
            window.Toast?.error(e.message);
        }
    }

    async function saveStaff() {
        const name = ui.staffName?.value?.trim();
        const phone = ui.staffPhone?.value?.trim();

        if (!name) {
            window.Toast?.warning('Nombre requerido');
            return;
        }

        try {
            const { error } = await window.sb
                .from('profiles')
                .insert({
                    full_name: name,
                    phone: phone || null,
                    role: 'staff_caja',
                    active: true
                });

            if (error) throw error;

            window.Toast?.success('Staff creado');
            closePanel();
            await loadNomina();
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Error saving staff:', e);
            window.Toast?.error('Error al crear staff: ' + e.message);
        }
    }

    // 11. Event Bindings
    function bindEvents() {
        // Workday selector
        ui.selectWorkDay?.addEventListener('change', (e) => handleWorkDayChange(e.target.value));

        // Search (debounced)
        ui.searchStaff?.addEventListener('input', window.Utils?.debounce?.(() => {
            renderConvocationView();
        }, 300) || renderConvocationView);

        // Tab switching
        document.querySelectorAll('.tab-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const target = btn.getAttribute('data-view');
                ui.viewConvocar?.classList.add('hidden');
                ui.viewNomina?.classList.add('hidden');
                document.getElementById('view-' + target)?.classList.remove('hidden');
            });
        });

        // Staff panel
        ui.btnAddStaff?.addEventListener('click', openPanel);
        ui.btnCloseStaffPanel?.addEventListener('click', closePanel);
        ui.btnCancelStaff?.addEventListener('click', closePanel);
        ui.panelOverlay?.addEventListener('click', closePanel);
        ui.staffForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            saveStaff();
        });
        ui.btnSaveStaff?.addEventListener('click', () => {
            ui.staffForm?.requestSubmit();
        });

        // Confirm modal
        ui.btnCancelConfirm?.addEventListener('click', hideConfirmModal);
        ui.btnConfirmAction?.addEventListener('click', () => {
            if (state.pendingConfirmAction) {
                state.pendingConfirmAction();
            }
        });
    }

    // 12. Initialization
    async function init() {
        setPageState({ loading: true });

        try {
            bindEvents();
            await Promise.all([
                loadWorkDays(),
                loadNomina()
            ]);

            // Pre-select first workday if exists
            if (ui.selectWorkDay?.options.length > 1) {
                ui.selectWorkDay.selectedIndex = 1;
                await handleWorkDayChange(ui.selectWorkDay.value);
            }
        } catch (e) {
            console.error('[EncargadoCajaPersonal] Initialization error:', e);
            window.Toast?.error('Error al inicializar');
        } finally {
            setPageState({ loading: false });
        }
    }

    // Start
    init();

})();
