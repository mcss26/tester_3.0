/**
 * Staff Barra Index Module
 * Landing page for Bar Staff role
 * 
 * @module staff-barra-index
 * @requires window.Auth
 * @requires window.sb (Supabase client)
 * @requires window.Utils
 * @requires window.WorkDayHelper
 */
(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['staff_barra', 'admin']);
    if (!session) return;

    // 2. Supabase Assertion
    if (!window.Utils.assertSbOrShowBlockingError()) {
        console.error('[StaffBarraIndex] Supabase client not initialized.');
        return;
    }

    // 3. DOM References
    const ui = {
        avatar: document.getElementById('user-avatar'),
        userNameDisplay: document.getElementById('user-name-display'),
        userMenu: document.getElementById('user-menu'),
        workdayStatus: document.getElementById('workday-status'),
        workdayText: document.getElementById('workday-text')
    };

    // 4. User Profile
    try {
        const { data: profile, error } = await window.sb
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

        if (error) throw error;

        const fullName = profile?.full_name || 'Staff';
        const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
        if (ui.avatar) ui.avatar.textContent = initials;
        if (ui.userNameDisplay) ui.userNameDisplay.textContent = fullName;
    } catch (err) {
        console.error('[StaffBarraIndex] Error loading profile:', err);
        if (ui.avatar) ui.avatar.textContent = 'S';
        if (ui.userNameDisplay) ui.userNameDisplay.textContent = 'Staff';
    }

    // 5. Workday Status
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
        } else {
            if (ui.workdayText) ui.workdayText.textContent = 'Sin jornada activa';
            if (ui.workdayStatus) {
                ui.workdayStatus.classList.remove('status-open', 'status-planning');
                ui.workdayStatus.classList.add('status-closed');
            }
        }
    } catch (err) {
        console.warn('[StaffBarraIndex] WorkDay fetch error:', err);
        if (ui.workdayText) ui.workdayText.textContent = 'Error';
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

})();
