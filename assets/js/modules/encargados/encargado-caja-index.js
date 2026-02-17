/**
 * Encargado Caja Index Module
 * Landing page for Cash Manager role
 * 
 * @module encargado-caja-index
 * @requires window.Auth
 * @requires window.sb (Supabase client)
 * @requires window.Utils
 */
(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['encargado_caja', 'admin', 'contable']);
    if (!session) return;

    // 2. Supabase Assertion
    if (!window.Utils.assertSbOrShowBlockingError()) {
        console.error('[EncargadoCajaIndex] Supabase client not initialized.');
        return;
    }

    // 3. DOM References
    const ui = {
        userName: document.getElementById('user-name'),
        systemStatus: document.getElementById('system-status'),
        pageCardLoading: document.getElementById('page-card-loading'),
        pageCardEmpty: document.getElementById('page-card-empty'),
        contentWrap: document.getElementById('module-content')
    };

    // 4. State Management
    function setPageState({ loading = false, empty = false } = {}) {
        if (ui.pageCardLoading) ui.pageCardLoading.classList.toggle('is-visible', loading);
        if (ui.pageCardEmpty) ui.pageCardEmpty.classList.toggle('is-visible', empty);
        if (ui.contentWrap) ui.contentWrap.classList.toggle('hidden', loading || empty);
    }

    // 5. Data Loading Functions
    async function loadUserProfile() {
        if (!ui.userName) return;
        
        try {
            const { data: profile, error } = await window.sb
                .from('profiles')
                .select('full_name')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;
            ui.userName.textContent = profile?.full_name || 'Encargado';
        } catch (e) {
            console.error('[EncargadoCajaIndex] Error loading profile:', e);
            ui.userName.textContent = 'Encargado';
        }
    }

    async function loadSystemStatus() {
        if (!ui.systemStatus) return;

        try {
            const { data: wd, error } = await window.sb
                .from('work_days')
                .select('work_date, status')
                .eq('status', 'ACTIVE')
                .maybeSingle();

            if (error) throw error;

            if (wd) {
                ui.systemStatus.textContent = `🟢 CAJA OPERATIVA: ${wd.work_date}`;
                ui.systemStatus.className = 'system-status-pill status-success';
            } else {
                ui.systemStatus.textContent = '🔴 CAJA CERRADA';
                ui.systemStatus.className = 'system-status-pill status-error';
            }
        } catch (e) {
            console.error('[EncargadoCajaIndex] Error loading status:', e);
            ui.systemStatus.textContent = '⚠️ Error de conexión';
            ui.systemStatus.className = 'system-status-pill status-warning';
        }
    }

    // 6. Initialization
    async function init() {
        setPageState({ loading: true });

        try {
            await Promise.all([
                loadUserProfile(),
                loadSystemStatus()
            ]);
        } catch (e) {
            console.error('[EncargadoCajaIndex] Initialization error:', e);
            window.Toast?.error('Error al cargar datos');
        } finally {
            setPageState({ loading: false });
        }
    }

    // Start
    init();

})();
