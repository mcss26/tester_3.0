/**
 * Admin Cierre Module
 * Logic for reconciling cash and closing the night.
 * Refactored to 'logic-engineer' standards.
 */

(async function() {
    'use strict';

    // 1. Auth Guard
    const authResult = await window.Auth.guardOrRedirect(['admin', 'contable']);
    if (!authResult) return;
    const { user } = authResult;

    // 2. Client Check
    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // 3. DOM References
    const refs = {
        inputDate: document.getElementById('input-date'),
        btnLoad: document.getElementById('btn-load'),
        btnCloseNight: document.getElementById('btn-close-night'),
        btnSaveNotes: document.getElementById('btn-save-notes'),
        notesInput: document.getElementById('closing-notes'),
        statusPill: document.getElementById('current-closing-status'),
        tableBody: document.getElementById('table-body'),
        
        // Totals
        totalCashDecl: document.getElementById('total-cash-decl'),
        totalZocoDecl: document.getElementById('total-zoco-decl'),
        totalCashSys: document.getElementById('total-cash-sys'),
        totalZocoSys: document.getElementById('total-zoco-sys'),
        totalDiff: document.getElementById('total-diff'),
        
        // QR Inputs
        qrPassline: {
            qty: document.getElementById('qr-passline-qty'),
            sys: document.getElementById('qr-passline-sys'),
            decl: document.getElementById('qr-passline-decl'),
            diff: document.getElementById('qr-passline-diff')
        },
        qrBoleteria: {
            qty: document.getElementById('qr-boleteria-qty'),
            sys: document.getElementById('qr-boleteria-sys'),
            decl: document.getElementById('qr-boleteria-decl'),
            diff: document.getElementById('qr-boleteria-diff')
        },
        qrRrpp: {
            qty: document.getElementById('qr-rrpp-qty'),
            sys: document.getElementById('qr-rrpp-sys')
        },

        // Hidden Files
        files: {
            extracciones: document.getElementById('file-extracciones'),
            gbol: document.getElementById('file-gbol'),
            passline: document.getElementById('file-passline'),
            afip: document.getElementById('file-afip')
        },

        // Modals
        modalConfirm: document.getElementById('confirmModal'),
        btnConfirmModal: document.getElementById('btnConfirmModal'),
        btnCancelModal: document.getElementById('btnCancelModal'),
        confirmDiffDisplay: document.getElementById('confirm-diff-display'),

        modalInfo: document.getElementById('infoModal'),
        infoContent: document.getElementById('infoContent'),
        btnCloseInfo: document.getElementById('btnCloseInfo'),

        // Page States
        pageCardLoading: document.getElementById('page-card-loading'),
        pageCardEmpty: document.getElementById('page-card-empty'),
        pageCardEmptyMessage: document.getElementById('page-card-empty-message'),
        contentWrap: document.getElementById('cierre-content')
    };

    // 4. Local State
    const state = {
        workDayId: null,
        closingId: null,
        isLoading: false
    };

    const statusLabels = {
        verified: { label: 'Verificado', cls: 'success' },
        pending: { label: 'Pendiente', cls: 'warning' }
    };

    function setButtonLoading(btn, isLoading) {
        if (!btn) return;
        btn.classList.toggle('btn-loading', isLoading);
        btn.disabled = isLoading;
        btn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    }

    function setStatusPill(text, statusClass) {
        if (!refs.statusPill) return;
        const base = 'system-status-pill topbar-pill topbar-pill-quiet';
        refs.statusPill.className = statusClass ? `${base} status-${statusClass}` : base;
        refs.statusPill.textContent = text;
    }

    function setPageState({ loading = false, empty = false, emptyMessage = '' } = {}) {
        if (refs.pageCardLoading) {
            refs.pageCardLoading.classList.toggle('is-visible', loading);
        }
        if (refs.pageCardEmpty) {
            refs.pageCardEmpty.classList.toggle('is-visible', empty);
        }
        if (refs.pageCardEmptyMessage && emptyMessage) {
            refs.pageCardEmptyMessage.textContent = emptyMessage;
        }
        if (refs.contentWrap) {
            refs.contentWrap.classList.toggle('hidden', loading || empty);
        }
    }

    function setImportsEnabled(workDayId) {
        const buttons = document.querySelectorAll('.btn-import');
        buttons.forEach(btn => {
            const isManual = btn.dataset.trigger === 'file-afip';
            const enabled = Boolean(workDayId) || isManual;
            btn.disabled = !enabled;
            btn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
        });
    }

    function setCloseNightVisibility(isVisible) {
        if (!refs.btnCloseNight) return;
        refs.btnCloseNight.classList.toggle('hidden', !isVisible);
        refs.btnCloseNight.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    }

    function applyDiffClass(el, diff) {
        if (!el) return;
        el.classList.remove('text-success', 'text-error', 'muted');
        if (diff === 0) el.classList.add('muted');
        else if (diff < 0) el.classList.add('text-error');
        else el.classList.add('text-success');
    }

    // 5. Initialize
    function init() {
        refs.inputDate.value = new Date().toISOString().split('T')[0];
        setImportsEnabled(null);
        setCloseNightVisibility(false);
        bindEvents();
        loadData();
    }

    // 6. Event Binding
    function bindEvents() {
        refs.btnLoad.addEventListener('click', loadData);
        refs.btnCloseNight.addEventListener('click', closeNight);
        
        // Modal Handlers
        if(refs.btnConfirmModal) refs.btnConfirmModal.addEventListener('click', performCloseNight);
        if(refs.btnCancelModal) refs.btnCancelModal.addEventListener('click', () => toggleModal(refs.modalConfirm, false));
        if(refs.btnCloseInfo) refs.btnCloseInfo.addEventListener('click', () => toggleModal(refs.modalInfo, false));
        
        refs.btnSaveNotes.addEventListener('click', async () => {
            if (!state.closingId) return;
            const notes = refs.notesInput.value.trim();

            setButtonLoading(refs.btnSaveNotes, true);
            try {
                const { error } = await window.sb
                    .from('cash_closings')
                    .update({ notes })
                    .eq('id', state.closingId);

                if (error) throw error;
                window.Toast.success('Notas guardadas');
            } catch (error) {
                console.error(error);
                window.Toast.error('Error al guardar notas');
            } finally {
                setButtonLoading(refs.btnSaveNotes, false);
            }
        });

        // Import Triggers (Delegation or Direct)
        document.querySelectorAll('.btn-import').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.trigger;
                const fileInput = document.getElementById(targetId);
                if (fileInput) fileInput.click();
            });
        });

        // File Handler Binding
        bindFileHandler('file-extracciones', async (f) => {
            const { count } = await window.ImporterExtracciones.process(f, state.workDayId);
            window.Toast.success(`Importados ${count} retiros de tesorería.`);
            loadData();
        });

        bindFileHandler('file-gbol', async (f) => {
            const { count } = await window.ImporterGbol.process(f, state.workDayId);
            window.Toast.success(`Importadas ${count} ventas de Gbol.`);
            loadData();
        });

        bindFileHandler('file-passline', async (f) => {
            const { count } = await window.ImporterPassline.process(f, state.workDayId);
            window.Toast.success(`Procesados ${count} registros de acceso/QR.`);
            loadQrStats(state.workDayId);
        });

        bindFileHandler('file-afip', async (f) => {
            const summary = await window.ImporterAfip.process(f);
            renderAfipComparison(summary);
            window.Toast.success('Reporte de terminales procesado.');
        });

        // QR Calculations
        refs.qrPassline.decl.addEventListener('input', updateQrDiffs);
        refs.qrBoleteria.decl.addEventListener('input', updateQrDiffs);
    }

    function toggleModal(modal, show) {
        if (!modal) return;
        if (show) modal.classList.remove('hidden');
        else modal.classList.add('hidden');
    }

    function bindFileHandler(inputId, handler) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('change', async (e) => {
            if (!e.target.files.length) return;
            const file = e.target.files[0];

            // UI Feedback
            const btn = document.querySelector(`button[data-trigger="${inputId}"]`);
            const prevText = btn ? btn.textContent : '';
            if (btn) {
                btn.textContent = '...';
                btn.disabled = true;
                btn.classList.add('btn-loading');
                btn.setAttribute('aria-busy', 'true');
            }

            try {
                if (!state.workDayId && inputId !== 'file-afip') {
                    throw new Error("No hay Jornada activa para importar datos.");
                }
                await handler(file);
            } catch (err) {
                console.error(err);
                window.Toast.error(err.message || "Error importando archivo");
            } finally {
                if (btn) {
                    btn.textContent = prevText;
                    btn.disabled = false;
                    btn.classList.remove('btn-loading');
                    btn.setAttribute('aria-busy', 'false');
                }
                input.value = '';
            }
        });
    }

    // 7. Data Loading
    async function loadData() {
        const dateVal = refs.inputDate.value;
        if (!dateVal) return;

        state.isLoading = true;
        setButtonLoading(refs.btnLoad, true);
        setPageState({ loading: true, empty: false });
        
        try {
            // A. Get WorkDay
            const { data: wd, error: wdError } = await window.sb
                .from('work_days')
                .select('id, status')
                .eq('work_date', dateVal)
                .maybeSingle();

            if (wdError) throw wdError;

            if (!wd) {
                renderEmpty("No hay Jornada (WorkDay) iniciada para esta fecha.");
                state.workDayId = null;
                state.closingId = null;
                setStatusPill('ESTADO: SIN JORNADA');
                setImportsEnabled(null);
                setCloseNightVisibility(false);
                return;
            }

            state.workDayId = wd.id;

            // B. Get Cash Closing
            let { data: closing, error: cError } = await window.sb
                .from('cash_closings')
                .select('*')
                .eq('work_day_id', wd.id)
                .maybeSingle();

            if (cError) throw cError;

            if (!closing) {
                // Fallback: Create cash_closing on-demand if missing
                const { data: newClosing, error: createError } = await window.sb
                    .from('cash_closings')
                    .insert({
                        work_day_id: wd.id,
                        status: 'open',
                        total_system: 0,
                        total_declared: 0,
                        total_difference: 0
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Failed to create cash_closing:', createError);
                    renderEmpty("No hay Caja (CashClosing) y no se pudo crear.");
                    setStatusPill('ESTADO: ERROR');
                    state.closingId = null;
                    setImportsEnabled(wd.id);
                    setCloseNightVisibility(false);
                    return;
                }

                closing = newClosing;
                window.Toast.info('Se creó el cierre de caja automáticamente.');
            }

            // Set Context
            state.closingId = closing.id;
            updateStatusUI(closing);
            setImportsEnabled(wd.id);
            setCloseNightVisibility(true);
            setPageState({ empty: false });

            // C. Load Terminals & Details
            const { data: terminals } = await window.sb.from('pos_terminals').select('id, friendly_name');
            const { data: details } = await window.sb
                .from('closing_terminals')
                .select('*, staff:staff_id(email)')
                .eq('cash_closing_id', closing.id);

            renderMainTable(terminals || [], details || []);
            loadQrStats(wd.id);

        } catch (err) {
            console.error(err);
            window.Toast.error("Error cargando datos del cierre");
        } finally {
            state.isLoading = false;
            setButtonLoading(refs.btnLoad, false);
            setPageState({ loading: false });
        }
    }

    // 8. Render Logic
    function renderMainTable(terminals, details) {
        refs.tableBody.innerHTML = '';
        
        // Accumulators
        let acc = { cashDecl: 0, zocoDecl: 0, cashSys: 0, zocoSys: 0, diff: 0 };

        const rows = terminals.map(t => {
            const detail = details.find(d => d.terminal_id === t.id) || {
                declared_cash: 0, declared_zoco: 0, system_cash: 0, system_zoco: 0, status: 'pending'
            };

            const cashD = Number(detail.declared_cash) || 0;
            const zocoD = Number(detail.declared_zoco) || 0;
            const cashS = Number(detail.system_cash) || 0;
            const zocoS = Number(detail.system_zoco) || 0;
            const diff = (cashD + zocoD) - (cashS + zocoS);

            // Update Accumulators
            acc.cashDecl += cashD;
            acc.zocoDecl += zocoD;
            acc.cashSys += cashS;
            acc.zocoSys += zocoS;
            acc.diff += diff;

            const statusKey = (detail.status || 'pending').toLowerCase();
            const statusInfo = statusLabels[statusKey] || statusLabels.pending;
            const diffClass = diff === 0 ? 'muted' : (diff < 0 ? 'text-error' : 'text-success');

            return `
                <tr class="table-row">
                    <td class="table-cell">
                        <div class="font-bold">${t.friendly_name}</div>
                        <div class="text-xs muted">${detail.staff?.email || '-'}</div>
                    </td>
                    <td class="table-cell text-right font-mono">${window.Utils.formatARS(cashD)}</td>
                    <td class="table-cell text-right font-mono">${window.Utils.formatARS(zocoD)}</td>
                    <td class="table-cell text-right font-mono muted">${window.Utils.formatARS(cashS)}</td>
                    <td class="table-cell text-right font-mono muted">${window.Utils.formatARS(zocoS)}</td>
                    <td class="table-cell text-right font-mono font-bold ${diffClass}">
                        ${window.Utils.formatARS(diff)}
                    </td>
                    <td class="table-cell text-center">
                        <span class="status-pill status-${statusInfo.cls}">
                            ${statusInfo.label}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        refs.tableBody.innerHTML = rows;
        setPageState({ empty: false });
        renderTotals(acc);
    }

    function renderTotals(acc) {
        refs.totalCashDecl.textContent = window.Utils.formatARS(acc.cashDecl);
        refs.totalZocoDecl.textContent = window.Utils.formatARS(acc.zocoDecl);
        refs.totalCashSys.textContent = window.Utils.formatARS(acc.cashSys);
        refs.totalZocoSys.textContent = window.Utils.formatARS(acc.zocoSys);
        refs.totalDiff.textContent = window.Utils.formatARS(acc.diff);
        
        // Color coding for total diff
        applyDiffClass(refs.totalDiff, acc.diff);
    }

    function renderEmpty(msg) {
        refs.tableBody.innerHTML = `<tr><td colspan="7" class="cell-pad text-center muted">${msg}</td></tr>`;
        setPageState({ empty: true, emptyMessage: msg });
        resetTotals();
    }

    function resetTotals() {
        renderTotals({ cashDecl: 0, zocoDecl: 0, cashSys: 0, zocoSys: 0, diff: 0 });
    }

    function updateStatusUI(closing) {
        const isClosed = closing.status === 'closed';
        setStatusPill(`ESTADO: ${isClosed ? 'CERRADO' : 'ABIERTO'}`, isClosed ? 'closed' : 'open');
        refs.notesInput.value = closing.notes || '';

        refs.btnCloseNight.disabled = isClosed;
        refs.btnCloseNight.textContent = isClosed ? 'CERRADO' : 'CERRAR NOCHE';
        
        // Disable imports if closed? Maybe allow for review.
    }

    // 9. QR Logic
    async function loadQrStats(workDayId) {
        const { data: qrs, error } = await window.sb
            .from('qr_codes')
            .select('*, qr_batches(market_source, unit_price)')
            .eq('work_day_id', workDayId)
            .eq('status', 'ACREDITADO');

        if (error) {
            console.error(error);
            return;
        }

        const stats = {
            passline: { qty: 0, sys: 0 },
            boleteria: { qty: 0, sys: 0 },
            rrpp: { qty: 0, sys: 0 }
        };

        qrs.forEach(q => {
            const source = (q.qr_batches?.market_source || '').toUpperCase();
            const price = Number(q.qr_batches?.unit_price) || 0;
            
            if (source === 'PASSLINE') {
                stats.passline.qty++;
                stats.passline.sys += price;
            } else if (source === 'BOLETERIA') {
                stats.boleteria.qty++;
                stats.boleteria.sys += price;
            } else {
                stats.rrpp.qty++;
                stats.rrpp.sys += price;
            }
        });

        // Render
        refs.qrPassline.qty.textContent = stats.passline.qty;
        refs.qrPassline.sys.textContent = window.Utils.formatARS(stats.passline.sys);
        refs.qrPassline.sys.dataset.val = stats.passline.sys;

        refs.qrBoleteria.qty.textContent = stats.boleteria.qty;
        refs.qrBoleteria.sys.textContent = window.Utils.formatARS(stats.boleteria.sys);
        refs.qrBoleteria.sys.dataset.val = stats.boleteria.sys;

        refs.qrRrpp.qty.textContent = stats.rrpp.qty;
        refs.qrRrpp.sys.textContent = window.Utils.formatARS(stats.rrpp.sys);

        updateQrDiffs();
    }

    function updateQrDiffs() {
        ['qrPassline', 'qrBoleteria'].forEach(k => {
            const group = refs[k];
            const sys = Number(group.sys.dataset.val || 0);
            const decl = Number(group.decl.value || 0);
            const diff = decl - sys;

            group.diff.textContent = window.Utils.formatARS(diff);
            applyDiffClass(group.diff, diff);
        });
    }

    function renderAfipComparison(summary) {
        let msg = "Resumen Fiscal (AFIP) vs Sistema:\n\n";
        let total = 0;
        for (const [pv, amt] of Object.entries(summary)) {
            msg += `PV ${pv}: ${window.Utils.formatARS(amt)}\n`;
            total += amt;
        }
        msg += `\nTotal Fiscal: ${window.Utils.formatARS(total)}`;
        
        refs.infoContent.textContent = msg;
        toggleModal(refs.modalInfo, true);
    }

    // 10. Close Action
    function closeNight() {
        if (!state.closingId) return;
        const diffText = refs.totalDiff.textContent;
        refs.confirmDiffDisplay.textContent = diffText;
        toggleModal(refs.modalConfirm, true);
    }

    async function performCloseNight() {
        toggleModal(refs.modalConfirm, false);
        state.isLoading = true;
        setButtonLoading(refs.btnCloseNight, true);

        const { error } = await window.sb
            .from('cash_closings')
            .update({ 
                status: 'closed',
                closed_at: new Date().toISOString(),
                closed_by: window.Auth.user.id
            })
            .eq('id', state.closingId);

        state.isLoading = false;
        setButtonLoading(refs.btnCloseNight, false);

        if (error) {
            console.error(error);
            window.Toast.error('Error al cerrar noche');
        } else {
            window.Toast.success('Noche cerrada exitosamente');
            setTimeout(() => window.location.reload(), 1500);
        }
    }

    // Start
    init();

})();
