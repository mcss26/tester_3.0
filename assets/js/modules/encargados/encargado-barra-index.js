/**
 * Encargado Barra Index
 * @module encargado-barra-index
 * 
 * Portal de entrada para el Encargado de Barra.
 * Alineado al Golden Standard (admin-index pattern).
 * - Valida sesión y rol (encargado_barra).
 * - Muestra estado de jornada en Topbar.
 * - Habilita/deshabilita links según reglas de negocio.
 */

(async function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. DOM References
    // ─────────────────────────────────────────────────────────────
    const ui = {
        // Topbar
        avatar: document.getElementById('user-avatar'),
        userNameDisplay: document.getElementById('user-name-display'),
        userMenu: document.getElementById('user-menu'),
        workdayStatus: document.getElementById('workday-status'),
        workdayText: document.getElementById('workday-text'),
        // Quick Links
        linkRecepcion: document.getElementById('link-recepcion'),
        badgeRecepcion: document.getElementById('badge-recepcion'),
        linkPersonal: document.getElementById('link-personal'),
        linkNoche: document.getElementById('link-noche')
    };

    // ─────────────────────────────────────────────────────────────
    // 2. Auth Guard
    // ─────────────────────────────────────────────────────────────
    const session = await window.Auth.guardOrRedirect(['encargado_barra', 'admin', 'contable']);
    if (!session) return;

    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // ─────────────────────────────────────────────────────────────
    // 3. User Profile (Avatar + Name)
    // ─────────────────────────────────────────────────────────────
    try {
        const { data: profile, error } = await window.sb
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

        if (error) throw error;

        const fullName = profile?.full_name || 'Encargado';
        const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'E';
        ui.avatar.textContent = initials;
        ui.userNameDisplay.textContent = fullName;
    } catch (err) {
        console.error('[encargado-barra-index] Error loading profile:', err);
        ui.avatar.textContent = 'E';
        ui.userNameDisplay.textContent = 'Encargado';
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Workday Status + Button Rules
    // ─────────────────────────────────────────────────────────────
    await loadWorkdayAndRules();

    // ─────────────────────────────────────────────────────────────
    // 5. Avatar Dropdown Toggle
    // ─────────────────────────────────────────────────────────────
    ui.avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        ui.userMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        ui.userMenu.classList.add('hidden');
    });

    // ─────────────────────────────────────────────────────────────
    // 6. Logout
    // ─────────────────────────────────────────────────────────────
    ui.logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        await window.Auth.logout();
    });

    // ═════════════════════════════════════════════════════════════
    // FUNCTIONS
    // ═════════════════════════════════════════════════════════════

    async function loadWorkdayAndRules() {
        // A) Check pending supplier orders for Reception link
        try {
            const { data: pendingOrders, error } = await window.sb
                .from('vw_supplier_orders_encargado')
                .select('order_id, status, eta_date')
                .eq('status', 'approved')
                .not('eta_date', 'is', null);

            if (error) {
                console.error('[encargado-barra-index] Error verificando pedidos:', error);
                window.Toast?.error('Error al verificar pedidos pendientes');
            } else {
                const count = pendingOrders?.length || 0;
                if (count > 0) {
                    enableLink(ui.linkRecepcion);
                    if (ui.badgeRecepcion) {
                        ui.badgeRecepcion.textContent = count;
                        ui.badgeRecepcion.classList.remove('hidden');
                    }
                } else {
                    disableLink(ui.linkRecepcion);
                    if (ui.badgeRecepcion) ui.badgeRecepcion.classList.add('hidden');
                }
            }
        } catch (err) {
            console.error('[encargado-barra-index] Error Button Rules:', err);
            window.Toast?.error('Error al verificar reglas de navegación');
            disableLink(ui.linkRecepcion);
        }

        // B) Check for Open Work Day
        try {
            const openDay = await window.WorkDayHelper.getOpenWorkDay();

            if (openDay) {
                const date = new Date(openDay.work_date + 'T12:00:00');
                const dayName = date.toLocaleDateString('es-AR', { weekday: 'long' });
                const dayNum = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
                ui.workdayText.textContent = `${dayName} ${dayNum}`;
                ui.workdayStatus.classList.remove('status-closed', 'status-planning');
                ui.workdayStatus.classList.add(openDay.status === 'ACTIVE' ? 'status-open' : 'status-planning');

                // Enable navigation links
                enableLink(ui.linkPersonal);
                enableLink(ui.linkNoche);
            } else {
                ui.workdayText.textContent = 'Sin jornada activa';
                ui.workdayStatus.classList.remove('status-open', 'status-planning');
                ui.workdayStatus.classList.add('status-closed');

                // Disable navigation links
                disableLink(ui.linkPersonal);
                disableLink(ui.linkNoche);
            }
        } catch (err) {
            console.warn('[encargado-barra-index] WorkDay fetch error:', err);
            ui.workdayText.textContent = 'Error';
            disableLink(ui.linkPersonal);
            disableLink(ui.linkNoche);
        }
    }

    function enableLink(el) {
        if (!el) return;
        el.classList.remove('is-disabled');
    }

    function disableLink(el) {
        if (!el) return;
        el.classList.add('is-disabled');
    }

})();
