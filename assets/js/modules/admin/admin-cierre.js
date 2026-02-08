/**
 * Admin Cierre Module
 * Logic for reconciling cash and closing the night.
 * Refactored to 'logic-engineer' standards.
 */

(async function () {
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
        isLoading: false,
        auditConfig: null  // Sprint 1B: loaded from audit_config
    };

    const statusLabels = {
        verified: { label: 'Verificado', cls: 'success' },
        pending: { label: 'Pendiente', cls: 'warning' }
    };

    // Sprint 1B: Classification labels
    const diffLabels = {
        CUADRADO: { label: 'Cuadrado', cls: 'success', icon: '✓' },
        FALTANTE_MENOR: { label: 'Faltante Menor', cls: 'warning', icon: '⚠' },
        FALTANTE_GRAVE: { label: 'Faltante Grave', cls: 'error', icon: '✗' },
        SOBRANTE: { label: 'Sobrante', cls: 'info', icon: '↑' }
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
        el.classList.remove('text-success', 'text-error', 'muted', 'text-warning');
        if (diff === 0) el.classList.add('muted');
        else if (diff < 0) el.classList.add('text-error');
        else el.classList.add('text-success');
    }

    /**
     * Sprint 1B: Classify a cash difference using audit_config thresholds.
     * Convention: diff = Declared - System.
     *   diff < 0: Faltante (declared less than system)
     *   diff > 0: Sobrante (declared more than system)
     */
    function classifyDiff(diff) {
        const threshold = state.auditConfig?.threshold || 500;
        const faltanteMenor = state.auditConfig?.faltante_menor || 5000;
        const absDiff = Math.abs(diff);

        if (absDiff <= threshold) return 'CUADRADO';
        if (diff < 0 && absDiff <= faltanteMenor) return 'FALTANTE_MENOR';
        if (diff < 0) return 'FALTANTE_GRAVE';
        return 'SOBRANTE';
    }

    /** Sprint 1B: Load audit thresholds from audit_config table */
    async function loadAuditConfig() {
        try {
            const { data, error } = await window.sb
                .from('audit_config')
                .select('key, value')
                .eq('domain', 'cash_closing')
                .eq('is_active', true);

            if (error || !data) return;

            state.auditConfig = {};
            data.forEach(row => {
                if (row.key === 'threshold_ars') state.auditConfig.threshold = Number(row.value) || 500;
                if (row.key === 'classifications') {
                    state.auditConfig.faltante_menor = row.value?.faltante_menor || 5000;
                }
            });
        } catch (err) {
            console.warn('[admin-cierre] Could not load audit_config:', err);
        }
    }

    // 5. Initialize
    function init() {
        refs.inputDate.value = new Date().toISOString().split('T')[0];
        setImportsEnabled(null);
        setCloseNightVisibility(false);
        bindEvents();
        loadAuditConfig(); // Sprint 1B: Pre-load thresholds
        loadData();
    }

    // 6. Event Binding
    function bindEvents() {
        refs.btnLoad.addEventListener('click', loadData);
        refs.btnCloseNight.addEventListener('click', closeNight);

        // Modal Handlers
        if (refs.btnConfirmModal) refs.btnConfirmModal.addEventListener('click', performCloseNight);
        if (refs.btnCancelModal) refs.btnCancelModal.addEventListener('click', () => toggleModal(refs.modalConfirm, false));
        if (refs.btnCloseInfo) refs.btnCloseInfo.addEventListener('click', () => toggleModal(refs.modalInfo, false));

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
            loadBreakdown(wd.id);
            loadBarAudit(wd.id); // Sprint 2: Load bar stock audit
            loadStaffPerformance(wd.id); // Sprint 3: Load staff performance

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

            // Sprint 1B: Threshold-based classification
            const classification = classifyDiff(diff);
            const classInfo = diffLabels[classification] || diffLabels.CUADRADO;
            const diffClass = diff === 0 ? 'muted' : (diff < 0 ? 'text-error' : 'text-success');

            return `
                <tr class="table-row">
                    <td class="table-cell">
                        <div class="font-bold">${t.friendly_name}</div>
                        <div class="text-xs muted">${window.Utils.escapeHtml(detail.staff?.email || '-')}</div>
                    </td>
                    <td class="table-cell text-right font-mono">${window.Utils.formatARS(cashD)}</td>
                    <td class="table-cell text-right font-mono">${window.Utils.formatARS(zocoD)}</td>
                    <td class="table-cell text-right font-mono muted">${window.Utils.formatARS(cashS)}</td>
                    <td class="table-cell text-right font-mono muted">${window.Utils.formatARS(zocoS)}</td>
                    <td class="table-cell text-right font-mono font-bold ${diffClass}">
                        ${window.Utils.formatARS(diff)}
                    </td>
                    <td class="table-cell text-center">
                        <span class="status-pill status-${classInfo.cls}" title="${classInfo.label}">
                            ${classInfo.icon} ${classInfo.label}
                        </span>
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

        try {
            // ──────────────────────────────────────────────────────────
            // Checkpoints en Paralelo: Validar Bar Sessions + Closing Terminals
            // ──────────────────────────────────────────────────────────
            const [barResult, termResult] = await Promise.all([
                window.sb
                    .from('bar_sessions')
                    .select('id, location, opened_by, profiles(full_name)')
                    .eq('work_day_id', state.workDayId)
                    .neq('status', 'closed'),
                window.sb
                    .from('closing_terminals')
                    .select('id, terminal_id, pos_terminals(friendly_name)')
                    .eq('cash_closing_id', state.closingId)
                    .not('status', 'in', '(submitted,verified)')
            ]);

            // Validar resultados de bar_sessions
            if (barResult.error) throw barResult.error;
            if (barResult.data && barResult.data.length > 0) {
                const barList = barResult.data.map(b =>
                    `${b.location || 'Barra'} (${b.profiles?.full_name || 'Sin asignar'})`
                ).join(', ');
                throw new Error(
                    `No se puede cerrar la noche. Hay ${barResult.data.length} sesión(es) de barra sin cerrar: ${barList}. ` +
                    `Todas las barras deben completar su auditoría antes del cierre administrativo.`
                );
            }

            // Validar resultados de closing_terminals
            if (termResult.error) throw termResult.error;
            if (termResult.data && termResult.data.length > 0) {
                const termNames = termResult.data
                    .map(t => t.pos_terminals?.friendly_name || 'Terminal')
                    .join(', ');
                throw new Error(
                    `No se puede cerrar la noche. Las siguientes cajas no han sido cerradas: ${termNames}. ` +
                    `Todos los encargados de caja deben completar sus arqueos antes del cierre.`
                );
            }

            // ──────────────────────────────────────────────────────────
            // Sprint 2: Checkpoint de Varianza de Stock
            // ──────────────────────────────────────────────────────────
            const { data: stockAlerts } = await window.sb
                .from('vw_bar_audit_variance')
                .select('sku_nombre, diferencia, varianza_pct, clasificacion')
                .eq('work_day_id', state.workDayId)
                .eq('clasificacion', 'ALERTA_PERDIDA');

            if (stockAlerts && stockAlerts.length > 0) {
                const alertList = stockAlerts.slice(0, 5).map(a =>
                    `${a.sku_nombre}: Δ${a.diferencia} (${a.varianza_pct}%)`
                ).join('\n');

                const acceptMerma = confirm(
                    `⚠ Hay ${stockAlerts.length} SKUs con alertas de pérdida en la barra:\n\n` +
                    `${alertList}${stockAlerts.length > 5 ? '\n...y más' : ''}\n\n` +
                    `¿Aceptar merma y continuar con el cierre?`
                );

                if (!acceptMerma) {
                    window.Toast.info('Cierre cancelado. Revise la auditoría de stock.');
                    return;
                }
            }

            // ──────────────────────────────────────────────────────────
            // Cerrar Cash Closing y Work Day en Paralelo
            // ──────────────────────────────────────────────────────────
            const closedAt = new Date().toISOString();
            const userId = window.Auth.user.id;

            const [closingResult, workDayResult] = await Promise.all([
                window.sb
                    .from('cash_closings')
                    .update({
                        status: 'closed',
                        closed_at: closedAt,
                        closed_by: userId
                    })
                    .eq('id', state.closingId),
                window.sb
                    .from('work_days')
                    .update({
                        status: 'closed',
                        closed_at: closedAt,
                        closed_by: userId
                    })
                    .eq('id', state.workDayId)
            ]);

            if (closingResult.error) throw closingResult.error;
            if (workDayResult.error) throw workDayResult.error;

            // ──────────────────────────────────────────────────────────
            // Generar Reporte Integral Automáticamente
            // ──────────────────────────────────────────────────────────
            window.Toast.success('Noche cerrada exitosamente. Generando reporte integral...');

            try {
                await generateNightReport(state.workDayId);
                window.Toast.success('Reporte integral generado correctamente.');
            } catch (reportError) {
                console.error('[admin-cierre] Error generando reporte:', reportError);
                window.Toast.warning('Noche cerrada, pero hubo un error al generar el reporte. Puedes descargarlo manualmente.');
            }

            setTimeout(() => window.location.reload(), 2000);

        } catch (error) {
            console.error('[admin-cierre] Error al cerrar noche:', error);
            window.Toast.error(error.message || 'Error al cerrar noche');
        } finally {
            state.isLoading = false;
            setButtonLoading(refs.btnCloseNight, false);
        }
    }

    async function generateNightReport(workDayId) {
        // Sprint 3: Consolidated Night Report — collects all data and generates downloadable text report
        try {
            // Parallel fetch all data sources
            const [dailySales, terminals, barAudit, staffPerf] = await Promise.all([
                window.sb.from('vw_daily_sales').select('*').eq('work_day_id', workDayId).maybeSingle(),
                window.sb.from('closing_terminals').select('*, pos_terminals(friendly_name), profiles(full_name)').eq('cash_closing_id', state.closingId),
                window.sb.from('vw_bar_audit_variance').select('*').eq('work_day_id', workDayId).order('costo_diferencia', { ascending: false }),
                window.sb.from('vw_staff_performance').select('*')
            ]);

            const ds = dailySales.data || {};
            const terms = terminals.data || [];
            const audit = barAudit.data || [];
            const staff = staffPerf.data || [];

            // Filter staff to those who worked today
            const todayStaffIds = new Set(terms.map(t => t.staff_id).filter(Boolean));
            const todayStaff = staff.filter(s => todayStaffIds.has(s.user_id));

            const now = new Date();
            const dateStr = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = now.toLocaleTimeString('es-AR');

            // Build report sections
            const lines = [];
            lines.push('═══════════════════════════════════════════════════════');
            lines.push('          REPORTE INTEGRAL DE CIERRE DE NOCHE');
            lines.push('═══════════════════════════════════════════════════════');
            lines.push(`Fecha:     ${dateStr}`);
            lines.push(`Generado:  ${timeStr}`);
            lines.push(`Jornada:   ${workDayId}`);
            lines.push('');

            // ── Section 1: Cash Reconciliation ──
            lines.push('───────────────────────────────────────────────────────');
            lines.push('  1. CONCILIACIÓN DE CAJA');
            lines.push('───────────────────────────────────────────────────────');
            lines.push('');

            let totalDiff = 0;
            terms.forEach(t => {
                const cashD = Number(t.declared_cash) || 0;
                const zocoD = Number(t.declared_zoco) || 0;
                const cashS = Number(t.system_cash) || 0;
                const zocoS = Number(t.system_zoco) || 0;
                const diff = (cashD + zocoD) - (cashS + zocoS);
                totalDiff += diff;
                const classification = classifyDiff(diff);

                lines.push(`  ${(t.pos_terminals?.friendly_name || 'Terminal').padEnd(20)} | ` +
                    `Decl: $${(cashD + zocoD).toFixed(0).padStart(8)} | ` +
                    `Sist: $${(cashS + zocoS).toFixed(0).padStart(8)} | ` +
                    `Δ: $${diff.toFixed(0).padStart(7)} | ${classification}`);
            });

            lines.push('');
            lines.push(`  TOTAL DIFERENCIA: $${totalDiff.toFixed(0)}  [${classifyDiff(totalDiff)}]`);
            lines.push('');

            // ── Section 2: Sales Breakdown ──
            lines.push('───────────────────────────────────────────────────────');
            lines.push('  2. DESGLOSE DE VENTAS (SISTEMA)');
            lines.push('───────────────────────────────────────────────────────');
            const barTotal = (ds.bar_sales_cash || 0) + (ds.bar_sales_card || 0);
            const qrTotal = ds.qr_total || 0;
            lines.push(`  Ventas Barra:     $${barTotal.toFixed(0)}`);
            lines.push(`    - Efectivo:     $${(ds.bar_sales_cash || 0).toFixed(0)}`);
            lines.push(`    - Digital:      $${(ds.bar_sales_card || 0).toFixed(0)}`);
            lines.push(`  Entradas QR:      $${qrTotal.toFixed(0)}`);
            lines.push(`  TOTAL SISTEMA:    $${(barTotal + qrTotal).toFixed(0)}`);

            if (ds.withdrawals) lines.push(`  Retiros:         -$${Number(ds.withdrawals).toFixed(0)}`);
            if (ds.net_to_render) lines.push(`  Neto a Rendir:    $${Number(ds.net_to_render).toFixed(0)}`);
            lines.push('');

            // ── Section 3: Bar Stock Audit ──
            if (audit.length > 0) {
                lines.push('───────────────────────────────────────────────────────');
                lines.push('  3. AUDITORÍA DE STOCK DE BARRA');
                lines.push('───────────────────────────────────────────────────────');

                const totalMerma = audit.reduce((s, r) => s + Math.max(0, Number(r.costo_diferencia) || 0), 0);
                const alerts = audit.filter(r => r.clasificacion === 'ALERTA_PERDIDA');
                const withinRange = audit.filter(r => r.clasificacion === 'DENTRO_DE_RANGO');
                lines.push(`  SKUs auditados:   ${audit.length}`);
                lines.push(`  En rango:         ${withinRange.length} (${Math.round((withinRange.length / audit.length) * 100)}%)`);
                lines.push(`  Alertas:          ${alerts.length}`);
                lines.push(`  Pérdida estimada: $${totalMerma.toFixed(0)}`);

                if (alerts.length > 0) {
                    lines.push('');
                    lines.push('  Detalle Alertas:');
                    alerts.forEach(a => {
                        lines.push(`    • ${(a.sku_nombre || '-').padEnd(25)} Δ${a.diferencia}  (${a.varianza_pct}%)`);
                    });
                }
                lines.push('');
            }

            // ── Section 4: Staff Performance ──
            if (todayStaff.length > 0) {
                lines.push('───────────────────────────────────────────────────────');
                lines.push('  4. DESEMPEÑO DE OPERARIOS (HISTÓRICO)');
                lines.push('───────────────────────────────────────────────────────');
                lines.push('');
                lines.push('  Nombre'.padEnd(28) + 'Turnos  Cierres  Δ Neto     Δ Abs');
                lines.push('  ' + '─'.repeat(55));

                todayStaff.forEach(s => {
                    const name = (s.full_name || 'Sin nombre').substring(0, 24).padEnd(26);
                    const shifts = String(s.shifts_total || 0).padStart(5);
                    const closures = String(s.closures_count || 0).padStart(7);
                    const netDiff = `$${(s.net_cash_difference || 0).toFixed(0)}`.padStart(9);
                    const absDiff = `$${(s.abs_cash_difference || 0).toFixed(0)}`.padStart(9);
                    lines.push(`  ${name}${shifts}  ${closures}  ${netDiff}  ${absDiff}`);
                });
                lines.push('');
            }

            lines.push('═══════════════════════════════════════════════════════');
            lines.push('  Fin del Reporte');
            lines.push('═══════════════════════════════════════════════════════');

            // Download as text file
            const reportText = lines.join('\n');
            const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reporte_Cierre_${workDayId}_${now.toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error('[admin-cierre] Error generating night report:', err);
            throw err;
        }
    }

    // 11. Breakdown Logic (Phase 5)
    async function loadBreakdown(workDayId) {
        const { data: summary, error } = await window.sb
            .from('vw_daily_sales')
            .select('*')
            .eq('work_day_id', workDayId)
            .single();

        if (error) {
            console.error('Error loading breakdown:', error);
            return;
        }
        renderBreakdown(summary);
    }

    // ──────────────────────────────────────────────────────────────
    // 12. Sprint 1B+2: Bar Stock Audit Section
    // ──────────────────────────────────────────────────────────────
    async function loadBarAudit(workDayId) {
        const auditContainer = document.getElementById('bar-audit-section');
        if (!auditContainer) return; // HTML section not present yet

        try {
            const { data: variance, error } = await window.sb
                .from('vw_bar_audit_variance')
                .select('*')
                .eq('work_day_id', workDayId)
                .order('costo_diferencia', { ascending: false });

            if (error) throw error;
            renderBarAudit(auditContainer, variance || []);
        } catch (err) {
            console.warn('[admin-cierre] Bar audit load error:', err);
            if (auditContainer) {
                auditContainer.innerHTML = '<div class="muted text-sm">Sin datos de auditoría de barra para esta jornada.</div>';
            }
        }
    }

    function renderBarAudit(container, rows) {
        if (rows.length === 0) {
            container.innerHTML = '<div class="muted text-sm">Sin sesiones de barra cerradas para auditar.</div>';
            return;
        }

        // KPIs
        const totalMerma = rows.reduce((s, r) => s + Math.max(0, Number(r.costo_diferencia) || 0), 0);
        const totalItems = rows.length;
        const alertCount = rows.filter(r => r.clasificacion === 'ALERTA_PERDIDA').length;
        const withinRange = rows.filter(r => r.clasificacion === 'DENTRO_DE_RANGO').length;
        const efficiencyPct = totalItems > 0 ? Math.round((withinRange / totalItems) * 100) : 0;

        const classMap = {
            'DENTRO_DE_RANGO': { cls: 'success', label: 'OK' },
            'ALERTA_PERDIDA': { cls: 'error', label: 'Alerta' },
            'ERROR_REGISTRO': { cls: 'warning', label: 'Error' },
            'SIN_MOVIMIENTO': { cls: 'muted', label: 'Sin Mov.' }
        };

        const kpiHtml = `
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-value">${window.Utils.formatARS(totalMerma)}</div>
                    <div class="kpi-label">Pérdida Estimada</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">${efficiencyPct}%</div>
                    <div class="kpi-label">SKUs en Rango</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value ${alertCount > 0 ? 'text-error' : ''}">${alertCount}</div>
                    <div class="kpi-label">Alertas</div>
                </div>
            </div>
        `;

        const tableHtml = rows.map(r => {
            const info = classMap[r.clasificacion] || classMap['SIN_MOVIMIENTO'];
            const diff = Number(r.diferencia) || 0;
            const diffClass = diff === 0 ? 'muted' : (diff > 0 ? 'text-error' : 'text-success');

            return `
                <tr class="table-row">
                    <td class="table-cell">
                        <div class="font-medium">${window.Utils.escapeHtml(r.sku_nombre || '-')}</div>
                        <div class="text-xs muted">${window.Utils.escapeHtml(r.categoria || '')}</div>
                    </td>
                    <td class="table-cell text-right font-mono">${r.stock_apertura}</td>
                    <td class="table-cell text-right font-mono">${r.stock_cierre}</td>
                    <td class="table-cell text-right font-mono">${r.consumo_real}</td>
                    <td class="table-cell text-right font-mono muted">${r.consumo_sistema}</td>
                    <td class="table-cell text-right font-mono font-bold ${diffClass}">${diff}</td>
                    <td class="table-cell text-right font-mono">${r.varianza_pct}%</td>
                    <td class="table-cell text-center">
                        <span class="status-pill status-${info.cls}">${info.label}</span>
                    </td>
                </tr>`;
        }).join('');

        container.innerHTML = `
            ${kpiHtml}
            <div class="table-wrap table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="table-header">SKU</th>
                            <th class="table-header text-right">Apertura</th>
                            <th class="table-header text-right">Cierre</th>
                            <th class="table-header text-right">Real</th>
                            <th class="table-header text-right">Sistema</th>
                            <th class="table-header text-right">Δ</th>
                            <th class="table-header text-right">%</th>
                            <th class="table-header text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>${tableHtml}</tbody>
                </table>
            </div>
        `;
    }

    // ──────────────────────────────────────────────────────────────
    // 13. Sprint 3: Staff Performance Panel
    // ──────────────────────────────────────────────────────────────
    async function loadStaffPerformance(workDayId) {
        const container = document.getElementById('staff-performance-section');
        if (!container) return;

        try {
            // Get today's staff from closing_terminals
            const { data: terminals } = await window.sb
                .from('closing_terminals')
                .select('staff_id')
                .eq('cash_closing_id', state.closingId);

            if (!terminals || terminals.length === 0) {
                container.innerHTML = '<div class="muted text-sm">Sin operarios asignados.</div>';
                return;
            }

            const staffIds = [...new Set(terminals.map(t => t.staff_id).filter(Boolean))];

            if (staffIds.length === 0) {
                container.innerHTML = '<div class="muted text-sm">Sin operarios registrados.</div>';
                return;
            }

            const { data: perfData, error } = await window.sb
                .from('vw_staff_performance')
                .select('*')
                .in('user_id', staffIds);

            if (error) throw error;
            renderStaffPerformance(container, perfData || []);
        } catch (err) {
            console.warn('[admin-cierre] Staff performance load error:', err);
            if (container) {
                container.innerHTML = '<div class="muted text-sm">No se pudo cargar el historial de operarios.</div>';
            }
        }
    }

    function renderStaffPerformance(container, staff) {
        if (staff.length === 0) {
            container.innerHTML = '<div class="muted text-sm">Sin datos históricos disponibles.</div>';
            return;
        }

        // Determine reliability: based on abs_cash_difference / closures_count
        function getReliability(s) {
            const closures = s.closures_count || 0;
            if (closures < 3) return { label: 'Nuevo', cls: 'muted', icon: '○' };
            const avgAbs = (s.abs_cash_difference || 0) / closures;
            const threshold = state.auditConfig?.threshold || 500;
            if (avgAbs <= threshold) return { label: 'Fiable', cls: 'success', icon: '●' };
            if (avgAbs <= threshold * 3) return { label: 'Regular', cls: 'warning', icon: '◐' };
            return { label: 'Riesgo', cls: 'error', icon: '◉' };
        }

        const tableHtml = staff.map(s => {
            const rel = getReliability(s);
            const netDiff = Number(s.net_cash_difference) || 0;
            const netClass = netDiff === 0 ? 'muted' : (netDiff < 0 ? 'text-error' : 'text-success');

            return `
                <tr class="table-row">
                    <td class="table-cell">
                        <div class="font-medium">${window.Utils.escapeHtml(s.full_name || '-')}</div>
                        <div class="text-xs muted">${s.role || '-'}</div>
                    </td>
                    <td class="table-cell text-center font-mono">${s.shifts_total || 0}</td>
                    <td class="table-cell text-center font-mono">${s.closures_count || 0}</td>
                    <td class="table-cell text-right font-mono ${netClass}">
                        ${window.Utils.formatARS(netDiff)}
                    </td>
                    <td class="table-cell text-right font-mono muted">
                        ${window.Utils.formatARS(s.abs_cash_difference || 0)}
                    </td>
                    <td class="table-cell text-center">
                        <span class="status-pill status-${rel.cls}" title="${rel.label}">
                            ${rel.icon} ${rel.label}
                        </span>
                    </td>
                </tr>`;
        }).join('');

        container.innerHTML = `
            <div class="table-wrap table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="table-header">Operario</th>
                            <th class="table-header text-center">Turnos</th>
                            <th class="table-header text-center">Cierres</th>
                            <th class="table-header text-right">Δ Neto</th>
                            <th class="table-header text-right">Δ Absoluto</th>
                            <th class="table-header text-center">Fiabilidad</th>
                        </tr>
                    </thead>
                    <tbody>${tableHtml}</tbody>
                </table>
            </div>
            <div class="text-xs muted" style="margin-top: 8px;">
                Fiabilidad calculada sobre promedio histórico de diferencias absolutas por cierre.
            </div>
        `;
    }

    function renderBreakdown(summary) {
        if (!summary) return;

        // Elements
        const els = {
            barCash: document.getElementById('breakdown-bar-cash'),
            barCard: document.getElementById('breakdown-bar-card'),
            barTotal: document.getElementById('breakdown-bar-total'),
            qrZoco: document.getElementById('breakdown-qr-zoco'),
            qrTotal: document.getElementById('breakdown-qr-total'),
            totalCash: document.getElementById('breakdown-total-cash'),
            totalZoco: document.getElementById('breakdown-total-zoco'),
            totalGlobal: document.getElementById('breakdown-total-global')
        };

        // Bars
        const barCash = summary.bar_sales_cash || 0;
        const barCard = summary.bar_sales_card || 0;
        const barTotal = summary.bar_sales_system || (barCash + barCard);

        if (els.barCash) els.barCash.textContent = window.Utils.formatARS(barCash);
        if (els.barCard) els.barCard.textContent = window.Utils.formatARS(barCard);
        if (els.barTotal) els.barTotal.textContent = window.Utils.formatARS(barTotal);

        // QR (Assume all QR is digital/zoco/card for now, or use logic)
        // qr_income from view is total accredited
        const qrTotal = summary.qr_total || 0;

        if (els.qrZoco) els.qrZoco.textContent = window.Utils.formatARS(qrTotal);
        if (els.qrTotal) els.qrTotal.textContent = window.Utils.formatARS(qrTotal);

        // System Totals
        // Cash System = Bar Cash + (Any other cash). Note: view has cash_system from terminals usually.
        // But here verify consistency:
        // View cash_system comes from closing_terminals.
        // View zoco_system comes from closing_terminals.
        // BUT bar_sales_cash/card comes from bar_session_sales.
        // We want to show the COMPONENT breakdown.

        const totalCash = barCash; // + other sources if any
        const totalZoco = barCard + qrTotal; // + other sources
        const globalTotal = totalCash + totalZoco;

        if (els.totalCash) els.totalCash.textContent = window.Utils.formatARS(totalCash);
        if (els.totalZoco) els.totalZoco.textContent = window.Utils.formatARS(totalZoco);
        if (els.totalGlobal) els.totalGlobal.textContent = window.Utils.formatARS(globalTotal);
    }

    // Start
    init();

})();
