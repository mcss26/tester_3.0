/**
 * Encargado Barra Index
 * @module encargado-barra-index
 * 
 * Portal de entrada para el Encargado de Barra.
 * - Valida sesión y rol (encargado_barra).
 * - Muestra estado del sistema y navegación a submódulos.
 */

(async function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. DOM References
    // ─────────────────────────────────────────────────────────────
    const ui = {
        userName: document.getElementById('user-name'),
        systemStatus: document.getElementById('system-status'),
        btnRecepcion: document.getElementById('btn-recepcion'),
        badgeRecepcion: document.getElementById('badge-recepcion'),
        btnPersonal: document.getElementById('btn-personal'),
        btnNoche: document.getElementById('btn-noche')
    };

    // ─────────────────────────────────────────────────────────────
    // 2. Guard & Assertions
    // ─────────────────────────────────────────────────────────────
    const session = await window.Auth.guardOrRedirect(['encargado_barra', 'admin', 'contable']);
    if (!session) return;

    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // ─────────────────────────────────────────────────────────────
    // 3. Load User Profile
    // ─────────────────────────────────────────────────────────────
    try {
        const { data: profile, error } = await window.sb
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

        if (error) throw error;
        ui.userName.textContent = profile?.full_name || 'Encargado';
    } catch (err) {
        console.error('[encargado-barra-index] Error loading profile:', err);
        ui.userName.textContent = 'Encargado';
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Check Button Rules
    // ─────────────────────────────────────────────────────────────
    await checkButtonRules();

    // ─────────────────────────────────────────────────────────────
    // FUNCTIONS
    // ─────────────────────────────────────────────────────────────

    async function checkButtonRules() {
        // Check pending supplier orders for Reception button
        try {
            const { data: pendingOrders, error } = await window.sb
                .from('vw_supplier_orders_encargado')
                .select('order_id, status, eta_date')
                .eq('status', 'approved')
                .not('eta_date', 'is', null);

            if (error) {
                console.error('[encargado-barra-index] Error verificando pedidos:', error);
                window.Toast?.error('Error al verificar pedidos pendientes');
                disableButton(ui.btnRecepcion);
            } else {
                const count = pendingOrders?.length || 0;
                if (count > 0) {
                    enableButton(ui.btnRecepcion);
                    if (ui.badgeRecepcion) {
                        ui.badgeRecepcion.textContent = count;
                        ui.badgeRecepcion.classList.remove('hidden');
                    }
                } else {
                    disableButton(ui.btnRecepcion);
                    if (ui.badgeRecepcion) ui.badgeRecepcion.classList.add('hidden');
                }
            }
        } catch (err) {
            console.error('[encargado-barra-index] Error Button Rules:', err);
            window.Toast?.error('Error al verificar reglas de navegación');
            disableButton(ui.btnRecepcion);
        }

        // Check for Open Work Day
        const openDay = await window.WorkDayHelper.getOpenWorkDay();

        if (openDay) {
            // Update Status Display - Day is open
            ui.systemStatus.textContent = `🟢 BARRA OPERATIVA: ${openDay.work_date}`;
            ui.systemStatus.className = 'system-status-pill status-success';

            // Enable navigation buttons
            enableButton(ui.btnPersonal);
            ui.btnPersonal.onclick = () => {
                window.location.href = window.Auth.toAppPath('pages/encargados/encargado-barra-personal.html');
            };

            enableButton(ui.btnNoche);
            ui.btnNoche.onclick = () => {
                window.location.href = window.Auth.toAppPath('pages/encargados/encargado-barra-noche.html');
            };
        } else {
            // Update Status Display - Bar closed
            ui.systemStatus.textContent = '🔴 BARRA CERRADA';
            ui.systemStatus.className = 'system-status-pill status-error';

            // Disable navigation buttons
            disableButton(ui.btnPersonal);
            disableButton(ui.btnNoche);
        }
    }

    function enableButton(btn) {
        if (!btn) return;
        btn.classList.remove('is-disabled');
        btn.removeAttribute('aria-disabled');
        btn.disabled = false;
    }

    function disableButton(btn) {
        if (!btn) return;
        btn.classList.add('is-disabled');
        btn.setAttribute('aria-disabled', 'true');
        btn.disabled = true;
        btn.onclick = null;
    }

})();
