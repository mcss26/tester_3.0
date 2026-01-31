/**
 * Module: bar-dashboard.js
 * Standard: logic-engineer (2026)
 * Description: Bar Sessions Dashboard (Active/Closed)
 */

(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'manager', 'encargado_barra', 'contable']);
    if (!session) return;
    const user = session.user;

    // 2. UI References
    const ui = {
        grid: document.getElementById('active-sessions-grid'),
        list: document.getElementById('closed-sessions-list'),
        modal: document.getElementById('modal-new-session'),
        btnNew: document.getElementById('btn-new-session'),
        btnCancel: document.getElementById('btn-cancel-modal'),
        btnCreate: document.getElementById('btn-create-session'),
        pill: document.getElementById('workday-pill'),
        // Modal inputs
        inputLocation: document.getElementById('input-location'),
        inputNotes: document.getElementById('input-notes'),
        // States (Global helpers)
        loadingState: document.getElementById('page-card-loading'),
    };

    if (!window.Utils?.assertSbOrShowBlockingError?.(ui.grid)) return;

    // 3. State
    const state = {
        currentWorkDay: null,
        sessions: []
    };

    // 4. Logic & Fetching
    async function init() {
        await checkWorkDay();
        bindEvents();
    }

    async function checkWorkDay() {
        try {
            const { data: wd, error } = await window.sb
                .from('work_days')
                .select('*')
                .eq('status', 'open')
                .maybeSingle();

            if (error) throw error;

            if (wd) {
                state.currentWorkDay = wd;
                ui.pill.textContent = 'JORNADA ABIERTA';
                ui.pill.className = 'status-pill status-success';
                ui.pill.classList.remove('hidden');
                loadSessions(wd.id);
            } else {
                state.currentWorkDay = null;
                ui.pill.textContent = 'JORNADA CERRADA';
                ui.pill.className = 'status-pill status-error';
                ui.pill.classList.remove('hidden');
                ui.grid.innerHTML = `
                    <div class="state-block">
                        <p class="state-title">Sin Jornada Activa</p>
                        <p class="state-desc">Solicita al administrador o contable iniciar el día para abrir barras.</p>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Error checking workday:', err);
            window.Toast.error('Error al verificar jornada');
        }
    }

    async function loadSessions(workDayId) {
        try {
            const { data: sessions, error } = await window.sb
                .from('bar_sessions')
                .select(`
                    *,
                    opened_by_user:opened_by(email),
                    closed_by_user:closed_by(email)
                `)
                .eq('work_day_id', workDayId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            state.sessions = sessions || [];
            renderSessions();
        } catch (err) {
            console.error('Error loading sessions:', err);
            window.Toast.error('Error al cargar sesiones');
        }
    }

    function renderSessions() {
        ui.grid.innerHTML = '';
        ui.list.innerHTML = '';

        const active = state.sessions.filter(s => s.status === 'open');
        const closed = state.sessions.filter(s => s.status === 'closed');

        // Active Sessions (Grid Layout)
        if (active.length === 0) {
            ui.grid.innerHTML = `<div class="state-block muted italic">No hay barras abiertas.</div>`;
        } else {
            active.forEach(s => {
                const el = document.createElement('div');
                el.className = 'session-card';
                el.innerHTML = `
                    <div class="sc-header">
                        <div>
                            <div class="sc-title">${window.Utils.escapeHtml(s.location)}</div>
                            <div class="sc-subtitle">Iniciada: ${new Date(s.opened_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        </div>
                        <span class="status-pill status-success">Abierta</span>
                    </div>
                    
                    <div class="sc-info">
                        <span class="muted">Abierta por:</span>
                        <div class="font-medium">${window.Utils.escapeHtml(s.opened_by_user?.email?.split('@')[0] || window.Constants?.LABELS?.UNKNOWN || 'Unknown')}</div>
                        ${s.opening_notes ? `<p class="italic text-xs muted mt-1">"${window.Utils.escapeHtml(s.opening_notes)}"</p>` : ''}
                    </div>

                    <div class="sc-actions">
                        <a href="session.html?id=${s.id}" class="btn btn-primary btn-full no-underline">
                            Gestionar
                        </a>
                    </div>
                `;
                ui.grid.appendChild(el);
            });
        }

        // Closed Sessions (List Layout)
        if (closed.length > 0) {
            closed.forEach(s => {
                const row = document.createElement('div');
                row.className = 'list-stack-row'; // Using standardized class
                row.innerHTML = `
                    <div class="row-info">
                        <span class="font-bold muted">${window.Utils.escapeHtml(s.location)}</span>
                        <span class="text-xs muted">Cerrada: ${new Date(s.closed_at).toLocaleTimeString()}</span>
                    </div>
                    <a href="session.html?id=${s.id}" class="btn btn-link btn-xs no-underline">Ver Reporte</a>
                `;
                ui.list.appendChild(row);
            });
        } else {
             ui.list.innerHTML = `<p class="muted text-xs italic p-4">No hay sesiones cerradas hoy.</p>`;
        }
    }

    async function createSession() {
        const location = ui.inputLocation.value;
        const notes = ui.inputNotes.value;

        if (!location) {
            window.Toast.warning('Por favor selecciona una ubicación');
            return;
        }

        ui.btnCreate.disabled = true;
        ui.btnCreate.classList.add('btn-loading');

        try {
            const { data, error } = await window.sb
                .from('bar_sessions')
                .insert({
                    work_day_id: state.currentWorkDay.id,
                    opened_by: user.id,
                    location: location,
                    opening_notes: notes,
                    status: 'open'
                })
                .select()
                .single();

            if (error) throw error;

            window.Toast.success('Barra abierta correctamente');
            // Redirect to session management (Opening Count)
            window.location.href = `session.html?id=${data.id}&mode=opening`;

        } catch (err) {
            console.error(err);
            window.Toast.error('Error al abrir sesión: ' + err.message);
            ui.btnCreate.disabled = false;
            ui.btnCreate.classList.remove('btn-loading');
        }
    }

    function bindEvents() {
        ui.btnNew.addEventListener('click', () => {
            if (!state.currentWorkDay) {
                window.Toast.error('No hay una Jornada (WorkDay) abierta. No se puede abrir barra.');
                return;
            }
            ui.modal.classList.add('is-visible');
        });
        
        ui.btnCancel.addEventListener('click', () => ui.modal.classList.remove('is-visible'));
        
        ui.btnCreate.addEventListener('click', createSession);

        // Close modal on escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ui.modal.classList.contains('is-visible')) {
                ui.modal.classList.remove('is-visible');
            }
        });
    }

    // Run
    init();

})();
