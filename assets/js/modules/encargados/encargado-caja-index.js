/**
 * Encargado Caja Index Module
 * Landing page for Cash Manager role
 * 
 * @module encargado-caja-index
 * @requires window.Auth
 * @requires window.sb (Supabase client)
 * @requires window.Utils
 * @requires window.WorkDayHelper
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
        avatar: document.getElementById('user-avatar'),
        userNameDisplay: document.getElementById('user-name-display'),
        userMenu: document.getElementById('user-menu'),
        workdayStatus: document.getElementById('workday-status'),
        workdayText: document.getElementById('workday-text'),
        linkPersonal: document.getElementById('link-personal'),
        linkNoche: document.getElementById('link-noche')
    };

    // 4. User Profile
    try {
        const { data: profile, error } = await window.sb
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

        if (error) throw error;

        const fullName = profile?.full_name || 'Encargado';
        const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'E';
        if (ui.avatar) ui.avatar.textContent = initials;
        if (ui.userNameDisplay) ui.userNameDisplay.textContent = fullName;
    } catch (err) {
        console.error('[EncargadoCajaIndex] Error loading profile:', err);
        if (ui.avatar) ui.avatar.textContent = 'E';
        if (ui.userNameDisplay) ui.userNameDisplay.textContent = 'Encargado';
    }

    // 5. Workday Status + Navigation Rules
    try {
        const openDay = await window.WorkDayHelper.getPlannableWorkDay();

        if (openDay) {
            const date = new Date(openDay.work_date + 'T12:00:00');
            const dayName = date.toLocaleDateString('es-AR', { weekday: 'long' });
            const dayNum = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

            if (ui.workdayText) ui.workdayText.textContent = `${dayName} ${dayNum}`;
            if (ui.workdayStatus) {
                ui.workdayStatus.classList.remove('status-closed', 'status-planning');
                ui.workdayStatus.classList.add(openDay.status === 'ACTIVE' ? 'status-open' : 'status-planning');
            }

            // Personal: enabled on PLANNED and ACTIVE
            enableLink(ui.linkPersonal);

            // Noche: only enabled on ACTIVE
            if (openDay.status === 'ACTIVE') {
                enableLink(ui.linkNoche);
            } else {
                disableLink(ui.linkNoche);
            }
        } else {
            if (ui.workdayText) ui.workdayText.textContent = 'Sin jornada activa';
            if (ui.workdayStatus) {
                ui.workdayStatus.classList.remove('status-open', 'status-planning');
                ui.workdayStatus.classList.add('status-closed');
            }
            disableLink(ui.linkPersonal);
            disableLink(ui.linkNoche);
        }
    } catch (err) {
        console.warn('[EncargadoCajaIndex] WorkDay fetch error:', err);
        if (ui.workdayText) ui.workdayText.textContent = 'Error';
        disableLink(ui.linkPersonal);
        disableLink(ui.linkNoche);
    }

    // 6. Avatar Dropdown Toggle
    if (ui.avatar) {
        ui.avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            if (ui.userMenu) ui.userMenu.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', () => {
        if (ui.userMenu) ui.userMenu.classList.add('hidden');
    });

    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════

    function enableLink(el) {
        if (!el) return;
        el.classList.remove('is-disabled');
    }

    function disableLink(el) {
        if (!el) return;
        el.classList.add('is-disabled');
    }

})();

