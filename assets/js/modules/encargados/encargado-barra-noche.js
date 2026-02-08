/**
 * Encargado Barra - Módulo Noche
 * @module encargado-barra-noche
 * 
 * Gestiona la Apertura y Cierre de Barra con toma de stock.
 * - Verificación de jornada activa
 * - Apertura de barra con stock inicial
 * - Cierre de barra con stock final
 * - Snapshots de inventario
 */

(async function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. DOM References
    // ─────────────────────────────────────────────────────────────
    const ui = {
        // States
        pageLoading: document.getElementById('pageLoading'),
        pageNoDay: document.getElementById('pageNoDay'),
        pageSessionClosed: document.getElementById('pageSessionClosed'),
        pageOpen: document.getElementById('pageOpen'),
        pageActive: document.getElementById('pageActive'),
        closedTime: document.getElementById('closedTime'),

        // Opening
        openingStockList: document.getElementById('openingStockList'),
        openingNotes: document.getElementById('openingNotes'),
        btnSubmitOpen: document.getElementById('btnSubmitOpen'),

        // Active Session
        activeSessionTime: document.getElementById('activeSessionTime'),
        btnCloseSession: document.getElementById('btnCloseSession'),

        // Closing
        closingView: document.getElementById('closingView'),
        closingStockList: document.getElementById('closingStockList'),
        closingNotes: document.getElementById('closingNotes'),
        btnCancelClose: document.getElementById('btnCancelClose'),
        btnSubmitClose: document.getElementById('btnSubmitClose'),

        // Refresh
        btnRefresh: document.getElementById('btn-refresh'),

        // Confirm Modal
        confirmModal: document.getElementById('confirmModal'),
        confirmTitle: document.getElementById('confirmTitle'),
        confirmMessage: document.getElementById('confirmMessage'),
        btnCancelConfirm: document.getElementById('btnCancelConfirm'),
        btnConfirm: document.getElementById('btnConfirm')
    };

    // ─────────────────────────────────────────────────────────────
    // 2. State
    // ─────────────────────────────────────────────────────────────
    let currentUser = null;
    let currentWorkDay = null;
    let currentSession = null;

    // ─────────────────────────────────────────────────────────────
    // 3. Guard & Assertions
    // ─────────────────────────────────────────────────────────────
    const session = await window.Auth.guardOrRedirect(['encargado_barra', 'admin', 'contable']);
    if (!session) return;

    if (!window.Utils.assertSbOrShowBlockingError()) return;

    currentUser = session.user;

    // ─────────────────────────────────────────────────────────────
    // 4. Page State Management
    // ─────────────────────────────────────────────────────────────
    function setPageState(stateName) {
        ui.pageLoading.classList.toggle('hidden', stateName !== 'loading');
        ui.pageNoDay.classList.toggle('hidden', stateName !== 'noDay');
        ui.pageSessionClosed.classList.toggle('hidden', stateName !== 'sessionClosed');
        ui.pageOpen.classList.toggle('hidden', stateName !== 'open');
        ui.pageActive.classList.toggle('hidden', stateName !== 'active');
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Data Loading
    // ─────────────────────────────────────────────────────────────
    async function fetchCriticalStock() {
        try {
            const { data: skus, error } = await window.sb
                .from('master_sku')
                .select('*')
                .eq('active', true)
                .order('nombre');

            if (error) throw error;
            return skus || [];
        } catch (err) {
            console.error('[encargado-barra-noche] Error fetching stock:', err);
            window.Toast.error('Error al cargar inventario');
            return [];
        }
    }

    /**
     * Sprint 1A: Fetch the last closing stock snapshot to precarga opening defaults.
     * Returns a Map<sku_id, quantity> from the most recent closed session.
     */
    async function fetchLastClosingStock(workDayId) {
        try {
            // Find the most recent closed bar session (could be from a previous work_day)
            const { data: lastSession, error: sessErr } = await window.sb
                .from('bar_sessions')
                .select('id, work_day_id, closed_at')
                .eq('status', 'closed')
                .order('closed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (sessErr || !lastSession) return new Map();

            const { data: snapshots, error: snapErr } = await window.sb
                .from('bar_stock_snapshots')
                .select('sku_id, quantity')
                .eq('session_id', lastSession.id)
                .eq('type', 'closing');

            if (snapErr || !snapshots) return new Map();

            const map = new Map();
            snapshots.forEach(s => map.set(s.sku_id, Number(s.quantity) || 0));
            return map;
        } catch (err) {
            console.warn('[encargado-barra-noche] Could not fetch last closing stock:', err);
            return new Map();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Rendering
    // ─────────────────────────────────────────────────────────────
    /**
     * Renders stock input list.
     * @param {HTMLElement} container - Target container
     * @param {Array} skus - Active SKUs
     * @param {Map} [lastClosing] - Optional Map<sku_id, qty> from last closing for precarga
     */
    function renderStockList(container, skus, lastClosing = null) {
        if (skus.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay SKUs activos.</div>';
            return;
        }

        const hasPrecarga = lastClosing && lastClosing.size > 0;

        const html = skus.map(sku => {
            const prevQty = hasPrecarga ? (lastClosing.get(sku.id) || 0) : null;
            const showPrevBadge = prevQty !== null && prevQty > 0;

            return `
            <div class="staff-row" data-sku-id="${sku.id}">
                <div>
                    <div class="font-medium">${window.Utils.escapeHtml(sku.nombre)}</div>
                    <div class="muted text-sm">${sku.tipo || 'Unid.'}</div>
                    ${showPrevBadge ? `<div class="text-xs muted precarga-hint" data-prev="${prevQty}">Cierre ant: <strong>${prevQty}</strong></div>` : ''}
                </div>
                <div class="stock-input-wrap">
                    <input type="number" 
                           class="input stock-input cell-narrow text-right" 
                           placeholder="0" 
                           step="0.01" 
                           min="0"
                           ${showPrevBadge ? `value="${prevQty}"` : ''}
                           data-sku-id="${sku.id}"
                           data-prev-qty="${prevQty !== null ? prevQty : ''}">
                    <span class="precarga-delta hidden" data-sku-id="${sku.id}"></span>
                </div>
            </div>
        `;
        }).join('');

        container.innerHTML = html;

        // Bind change detection for precargados
        if (hasPrecarga) {
            container.querySelectorAll('.stock-input[data-prev-qty]').forEach(input => {
                input.addEventListener('input', () => {
                    const prev = parseFloat(input.dataset.prevQty);
                    const curr = parseFloat(input.value) || 0;
                    const delta = curr - prev;
                    const deltaEl = container.querySelector(`.precarga-delta[data-sku-id="${input.dataset.skuId}"]`);
                    if (!deltaEl || isNaN(prev)) return;

                    if (delta === 0) {
                        deltaEl.classList.add('hidden');
                    } else {
                        deltaEl.classList.remove('hidden');
                        deltaEl.textContent = `${delta > 0 ? '+' : ''}${delta}`;
                        deltaEl.className = `precarga-delta ${delta > 0 ? 'text-success' : 'text-error'}`;
                    }
                });
            });
        }
    }

    function getStockInputs(container) {
        const inputs = container.querySelectorAll('.stock-input');
        const data = [];

        inputs.forEach(input => {
            const val = input.value;
            data.push({
                skuId: input.dataset.skuId,
                quantity: val !== '' && !isNaN(val) ? parseFloat(val) : 0
            });
        });

        return data;
    }

    // ─────────────────────────────────────────────────────────────
    // 7. Actions
    // ─────────────────────────────────────────────────────────────
    async function executeOpenBar(workDayId, userId, stockData, notes) {
        // Create Session
        const { data: barSession, error: sessErr } = await window.sb
            .from('bar_sessions')
            .insert({
                work_day_id: workDayId,
                opened_by: userId,
                status: 'active',
                opening_notes: notes
            })
            .select()
            .single();

        if (sessErr) throw sessErr;

        // Insert Snapshots
        const snapshots = stockData.map(item => ({
            session_id: barSession.id,
            sku_id: item.skuId,
            quantity: item.quantity,
            type: 'opening',
            created_by: userId
        }));

        const { error: snapErr } = await window.sb
            .from('bar_stock_snapshots')
            .insert(snapshots);

        if (snapErr) throw snapErr;

        return barSession;
    }

    async function executeCloseBar(sessionId, userId, stockData, notes) {
        // Insert Snapshots
        const snapshots = stockData.map(item => ({
            session_id: sessionId,
            sku_id: item.skuId,
            quantity: item.quantity,
            type: 'closing',
            created_by: userId
        }));

        const { error: snapErr } = await window.sb
            .from('bar_stock_snapshots')
            .insert(snapshots);

        if (snapErr) throw snapErr;

        // Close Session
        const { error: sessErr } = await window.sb
            .from('bar_sessions')
            .update({
                status: 'closed',
                closed_at: new Date().toISOString(),
                closed_by: userId,
                closing_notes: notes
            })
            .eq('id', sessionId);

        if (sessErr) throw sessErr;
    }

    // ─────────────────────────────────────────────────────────────
    // 8. Modal Helper
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
                ui.confirmModal.removeEventListener('cancel', handleCancel);
            };

            ui.btnConfirm.addEventListener('click', handleConfirm);
            ui.btnCancelConfirm.addEventListener('click', handleCancel);
            ui.confirmModal.addEventListener('cancel', handleCancel);
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 9. Event Bindings
    // ─────────────────────────────────────────────────────────────
    function bindEvents() {
        // Refresh
        ui.btnRefresh?.addEventListener('click', () => init());

        // Submit Opening
        ui.btnSubmitOpen?.addEventListener('click', async () => {
            const confirmed = await showConfirmModal(
                'Confirmar Apertura',
                '¿Confirmar apertura y stocks iniciales?'
            );

            if (!confirmed) return;

            try {
                ui.btnSubmitOpen.disabled = true;
                const stockData = getStockInputs(ui.openingStockList);
                const notes = ui.openingNotes.value.trim();
                await executeOpenBar(currentWorkDay.id, currentUser.id, stockData, notes);
                window.Toast.success('Barra abierta correctamente');
                await init();
            } catch (err) {
                console.error('[encargado-barra-noche] Error opening bar:', err);
                window.Toast.error('Error: ' + err.message);
                ui.btnSubmitOpen.disabled = false;
            }
        });

        // Open Closing View
        ui.btnCloseSession?.addEventListener('click', async () => {
            ui.closingView.classList.remove('hidden');
            ui.btnCloseSession.disabled = true;

            // Load closing stock
            const stock = await fetchCriticalStock();
            renderStockList(ui.closingStockList, stock);
        });

        // Cancel Closing
        ui.btnCancelClose?.addEventListener('click', () => {
            ui.closingView.classList.add('hidden');
            ui.btnCloseSession.disabled = false;
        });

        // Submit Closing
        ui.btnSubmitClose?.addEventListener('click', async () => {
            const confirmed = await showConfirmModal(
                'Cerrar Barra',
                '¿Seguro que deseas cerrar la barra? Esta acción es irreversible.'
            );

            if (!confirmed) return;

            try {
                ui.btnSubmitClose.disabled = true;
                const stockData = getStockInputs(ui.closingStockList);
                const notes = ui.closingNotes.value.trim();
                await executeCloseBar(currentSession.id, currentUser.id, stockData, notes);
                window.Toast.success('Barra cerrada correctamente');
                await init();
            } catch (err) {
                console.error('[encargado-barra-noche] Error closing bar:', err);
                window.Toast.error('Error: ' + err.message);
                ui.btnSubmitClose.disabled = false;
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 10. Initialization
    // ─────────────────────────────────────────────────────────────
    async function init() {
        setPageState('loading');

        try {
            // 1. Check Work Day
            const openDay = await window.WorkDayHelper.getOpenWorkDay();
            
            if (!openDay) {
                setPageState('noDay');
                return;
            }

            currentWorkDay = openDay;

            // 2. Check Bar Session
            const { data: barSession, error } = await window.sb
                .from('bar_sessions')
                .select('*')
                .eq('work_day_id', openDay.id)
                .eq('opened_by', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!barSession) {
                // Ready to open — precarga last closing stock as defaults
                const [stock, lastClosing] = await Promise.all([
                    fetchCriticalStock(),
                    fetchLastClosingStock(openDay.id)
                ]);
                renderStockList(ui.openingStockList, stock, lastClosing);
                if (lastClosing.size > 0) {
                    window.Toast.info(`Precargados ${lastClosing.size} valores del cierre anterior.`);
                }
                setPageState('open');

            } else if (barSession.status === 'closed') {
                // Already closed
                currentSession = barSession;
                ui.closedTime.textContent = `Turno finalizado a las ${new Date(barSession.closed_at).toLocaleTimeString()}`;
                setPageState('sessionClosed');

            } else {
                // Active session
                currentSession = barSession;
                ui.activeSessionTime.textContent = `Desde ${new Date(barSession.opened_at).toLocaleTimeString()}`;
                ui.closingView.classList.add('hidden');
                ui.btnCloseSession.disabled = false;
                setPageState('active');
            }

        } catch (err) {
            console.error('[encargado-barra-noche] Init error:', err);
            window.Toast.error('Error cargando panel: ' + err.message);
            setPageState('noDay');
        }
    }

    bindEvents();
    await init();

})();
