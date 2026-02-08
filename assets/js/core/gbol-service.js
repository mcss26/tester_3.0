/**
 * GBOL Service — Centralized API facade for GBOL POS integration
 * Standard: logic-engineer (2026)
 * 
 * All GBOL API communication flows through this service.
 * Modules should NEVER call GBOL endpoints directly.
 * 
 * Public API:
 *   GbolService.authenticate()
 *   GbolService.fetchFacturacion(noche, puntoDeVenta)
 *   GbolService.fetchComandas(noche, puntoDeVenta)
 *   GbolService.fetchWithdrawals()
 *   GbolService.fetchStockAudit()
 *   GbolService.syncNight(noche, options)
 *   GbolService.getSyncStatus(noche)
 *   GbolService.resolveTerminalId(cajanom)
 */
(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────────
    // Configuration
    // ─────────────────────────────────────────────────────────────────
    const GBOL_BASE_URL = 'https://tickets.midnightclub.com.ar/gbol/api';

    const ENDPOINTS = {
        LOGIN:        '/account/login',
        FACTURACION:  '/tickets/facturacionElectronicaConsulta',
        COMANDAS:     '/generic/consultarMercaderias',    // TBC: validate with prod
        STOCK:        '/inventarios/stockIdealCompras',
        CAJAS:        '/generic/consultarCajas',
        WITHDRAWALS:  '/withdrawals/history',             // Extracciones — only works with noche abierta
    };

    // ─────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────
    let _token = null;
    let _tokenExpiry = 0;
    let _terminalMap = null;  // { cajanom: terminal_id }

    // ─────────────────────────────────────────────────────────────────
    // Internal Helpers
    // ─────────────────────────────────────────────────────────────────

    /**
     * Load GBOL credentials from gbol_config or config table.
     * Avoids hardcoding tokens — reads from Supabase securely.
     */
    async function _loadCredentials() {
        if (!window.sb) throw new Error('[gbol-service] Supabase not initialized');

        const { data, error } = await window.sb
            .from('audit_config')
            .select('key, value')
            .eq('domain', 'gbol')
            .eq('is_active', true);

        if (error || !data || data.length === 0) {
            throw new Error('[gbol-service] No GBOL credentials found in audit_config (domain=gbol)');
        }

        const config = {};
        data.forEach(row => {
            // audit_config.value is JSONB — extract primitive or keep object
            config[row.key] = (typeof row.value === 'object' && row.value !== null)
                ? (row.value.value || row.value)  // Unwrap { value: "..." } or keep as-is
                : row.value;
        });
        return config;
    }

    /**
     * Make authenticated request to GBOL API.
     */
    async function _request(endpoint, { method = 'GET', body = null } = {}) {
        if (!_token) {
            throw new Error('[gbol-service] Not authenticated. Call authenticate() first.');
        }

        const url = `${GBOL_BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${_token}`,
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (response.status === 401) {
            // Token expired — try re-auth once
            console.warn('[gbol-service] Token expired, re-authenticating...');
            _token = null;
            await GbolService.authenticate();
            return _request(endpoint, { method, body });
        }

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`[gbol-service] ${method} ${endpoint} → ${response.status}: ${errorText}`);
        }

        return response.json();
    }

    /**
     * Map GBOL's tipo comprobante code to fiscal category.
     * 1 = Factura A, 6/83 = Factura B/Ticket, 0/99 = X (internal)
     */
    function _mapTipoComprobante(tcom) {
        if (tcom === 1) return 'A';
        if (tcom === 6 || tcom === 83) return 'B';
        return 'X';
    }

    /**
     * Determine item type from comanda line item.
     */
    function _classifyItem(item) {
        if (String(item.codigo).startsWith('D')) return 'descuento';
        if (item.monto === 0) return 'cortesia';
        return 'venta';
    }

    /**
     * Log a sync operation to gbol_sync_log.
     */
    async function _logSync(endpoint, noche, puntoDeVenta, recordsImported, status, errorDetail = null, durationMs = 0) {
        if (!window.sb) return;

        const userId = window.Auth?.user?.id || null;

        await window.sb.from('gbol_sync_log').insert({
            endpoint,
            noche,
            punto_venta: puntoDeVenta,
            records_imported: recordsImported,
            status,
            error_detail: errorDetail,
            duration_ms: durationMs,
            synced_by: userId,
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────
    const GbolService = {

        /**
         * Authenticate with GBOL API using stored credentials.
         * Token is cached in memory until expiry.
         */
        authenticate: async function () {
            if (_token && Date.now() < _tokenExpiry) {
                return true;  // Token still valid
            }

            const creds = await _loadCredentials();
            if (!creds.email || !creds.password) {
                throw new Error('[gbol-service] Missing email/password in audit_config (domain=gbol)');
            }

            const url = `${GBOL_BASE_URL}${ENDPOINTS.LOGIN}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: creds.email,
                    password: creds.password
                }),
            });

            if (!response.ok) {
                throw new Error(`[gbol-service] Login failed: ${response.status}`);
            }

            const data = await response.json();
            _token = data.accessToken || data.token;
            // Set expiry to 4 hours from now (conservative — GBOL tokens last ~8h)
            _tokenExpiry = Date.now() + (4 * 60 * 60 * 1000);

            console.info('[gbol-service] Authenticated successfully');
            return true;
        },

        /**
         * Resolve a GBOL cajanom string to a pos_terminals UUID.
         * Builds a cache on first call.
         * @param {string} cajanom — e.g. "CAJA 1"
         * @returns {string|null} terminal_id UUID or null
         */
        resolveTerminalId: async function (cajanom) {
            if (!cajanom) return null;

            if (!_terminalMap) {
                const { data } = await window.sb
                    .from('pos_terminals')
                    .select('id, friendly_name, gbol_alias')
                    .eq('is_active', true);

                _terminalMap = {};
                (data || []).forEach(t => {
                    if (t.gbol_alias) {
                        _terminalMap[t.gbol_alias.toUpperCase().trim()] = t.id;
                    }
                    // Also index by friendly_name as fallback
                    if (t.friendly_name) {
                        _terminalMap[t.friendly_name.toUpperCase().trim()] = t.id;
                    }
                });
            }

            const key = cajanom.toUpperCase().trim();
            return _terminalMap[key] || null;
        },

        /**
         * Clear the terminal cache (call after updating pos_terminals.gbol_alias).
         */
        clearTerminalCache: function () {
            _terminalMap = null;
        },

        // ─────────────────────────────────────────────────────────────
        // Endpoint #1: Facturación
        // ─────────────────────────────────────────────────────────────

        /**
         * Fetch fiscal tickets from GBOL for a given night.
         * @param {string} noche — operative date, e.g. "2026-02-08"
         * @param {string} [puntoDeVenta="T-0"] — POS filter ("T-0" = all)
         * @returns {Object[]} Transformed records ready for import_gbol_facturacion
         */
        fetchFacturacion: async function (noche, puntoDeVenta = 'T-0') {
            await GbolService.authenticate();

            const raw = await _request(ENDPOINTS.FACTURACION, {
                method: 'POST',
                body: {
                    estado: -1,
                    metodoDePago: -1,
                    puntoDeVenta,
                    noche,
                    tipoBusqueda: 1,
                },
            });

            const tickets = raw?.data?.facturacion || raw?.facturacion || raw || [];
            if (!Array.isArray(tickets)) {
                console.warn('[gbol-service] Unexpected facturacion response shape:', raw);
                return [];
            }

            // Transform to our schema
            const transformed = [];
            for (const t of tickets) {
                const terminalId = await GbolService.resolveTerminalId(t.cajanom);

                transformed.push({
                    gbol_ticket_id: String(t.id),
                    noche,
                    tipo_fiscal: (t.estado === 'APROBADO') ? 'blanco' : 'negro',
                    tipo_comprobante: _mapTipoComprobante(t.tcom),
                    cae: t.cae || null,
                    nro_factura: t.factura || null,
                    punto_venta: t.ptovta ? Number(t.ptovta) : null,
                    total: Number(t.importe) || 0,
                    efectivo: Number(t.efectivo) || 0,
                    digital: (Number(t.tarjetas) || 0) + (Number(t.merpag) || 0),
                    tarjetas: Number(t.tarjetas) || 0,
                    mercadopago: Number(t.merpag) || 0,
                    base_imponible: Number(t.bimp) || 0,
                    iva: Number(t.iva) || 0,
                    gbol_caja_nombre: t.cajanom || null,
                    terminal_id: terminalId,
                    cliente_cuit: t.ndoc || null,
                    cliente_razon: t.cliente || null,
                    raw_data: t,
                });
            }

            return transformed;
        },

        // ─────────────────────────────────────────────────────────────
        // Endpoint #3: Comandas
        // ─────────────────────────────────────────────────────────────

        /**
         * Fetch item-level sales (comandas) for a given night.
         * @param {string} noche — operative date
         * @param {string} [puntoDeVenta="T-0"] — POS filter
         * @returns {Object[]} Flat array ready for import_gbol_comandas
         */
        fetchComandas: async function (noche, puntoDeVenta = 'T-0') {
            await GbolService.authenticate();

            const raw = await _request(ENDPOINTS.COMANDAS, {
                method: 'POST',
                body: { noche, puntoDeVenta },
            });

            // Response is { ticketId: { encabezado: {...}, contenido: [...] } }
            if (!raw || typeof raw !== 'object') {
                console.warn('[gbol-service] Unexpected comandas response:', raw);
                return [];
            }

            const items = [];
            for (const [ticketId, comanda] of Object.entries(raw)) {
                if (!comanda?.contenido || !Array.isArray(comanda.contenido)) continue;

                for (const item of comanda.contenido) {
                    const tipo = _classifyItem(item);
                    const cantidad = Number(item.cantidad) || 0;
                    const monto = Number(item.monto) || 0;

                    items.push({
                        gbol_ticket_id: String(ticketId),
                        noche,
                        tipo,
                        gbol_caja: comanda.encabezado?.caja || null,
                        hora: comanda.encabezado?.hora || null,
                        external_id: String(item.codigo),
                        product_name: item.articu || null,
                        cantidad,
                        monto,
                        precio_unitario: cantidad > 0 ? Math.round((monto / cantidad) * 100) / 100 : 0,
                    });
                }
            }

            return items;
        },

        // ─────────────────────────────────────────────────────────────
        // Endpoint #2: Stock Audit (reference only)
        // ─────────────────────────────────────────────────────────────

        /**
         * Fetch stock data from GBOL for SKU alignment audit.
         * NOT used for operational stock — only for comparing codes/prices.
         */
        fetchStockAudit: async function () {
            await GbolService.authenticate();

            const raw = await _request(ENDPOINTS.STOCK);
            if (!Array.isArray(raw)) return [];

            return raw.map(item => ({
                external_id: String(item.codigo),
                nombre: item.detalle,
                stock_gbol: Number(item.stock) || 0,
                precio_costo: Number(item.precio) || 0,
            }));
        },

        // ─────────────────────────────────────────────────────────────
        // Endpoint #4: Withdrawals (Extracciones de caja)
        // ─────────────────────────────────────────────────────────────

        /**
         * Fetch cash withdrawals from GBOL (extracciones).
         * ⚠️ Only works when a night is currently open in GBOL.
         * Returns empty array (not error) if no night is open.
         *
         * @param {string} noche — operative date for tagging
         * @returns {Object[]} Transformed records for import_gbol_withdrawals
         */
        fetchWithdrawals: async function (noche) {
            await GbolService.authenticate();

            try {
                const raw = await _request(ENDPOINTS.WITHDRAWALS);
                const rows = Array.isArray(raw) ? raw : (raw?.data || raw?.extracciones || []);

                return rows.map(w => {
                    const cajaName = w.caja || w.cajanom || w.cajaNombre || null;
                    return {
                        noche,
                        gbol_id:          String(w.id || w._id || ''),
                        gbol_caja_nombre: cajaName,
                        monto:            Number(w.monto || w.amount || 0),
                        motivo:           w.motivo || w.reason || w.descripcion || null,
                        autorizado_por:   w.autorizadoPor || w.autorizado || w.supervisor || null,
                        operador:         w.operador || w.cajero || w.usuario || null,
                        hora:             w.fecha || w.hora || w.createdAt || null,
                        raw_data:         w,
                    };
                });

            } catch (err) {
                // "No hay noche abierta" is expected when night is closed — not a real error
                if (err.message && err.message.includes('400')) {
                    console.info('[gbol-service] Withdrawals: no active night — skipping.');
                    return [];
                }
                throw err;
            }
        },

        // ─────────────────────────────────────────────────────────────
        // Orchestrator: Sync a full night
        // ─────────────────────────────────────────────────────────────

        /**
         * Synchronize all GBOL data for a night.
         * Performs DELETE+INSERT (idempotent) for the given date.
         * 
         * @param {string} noche — operative date
         * @param {Object} [options]
         * @param {string} [options.puntoDeVenta="T-0"]
         * @param {boolean} [options.syncFacturacion=true]
         * @param {boolean} [options.syncComandas=true]
         * @returns {{ facturacion: number, comandas: number }}
         */
        syncNight: async function (noche, options = {}) {
            const {
                puntoDeVenta = 'T-0',
                syncFacturacion = true,
                syncComandas = true,
                syncWithdrawals = true,
            } = options;

            if (!window.sb) throw new Error('[gbol-service] Supabase not initialized');

            const results = { facturacion: 0, comandas: 0, withdrawals: 0 };

            // ── Facturación ──
            if (syncFacturacion) {
                const t0 = performance.now();
                try {
                    const records = await GbolService.fetchFacturacion(noche, puntoDeVenta);

                    // DELETE existing for idempotency
                    await window.sb
                        .from('import_gbol_facturacion')
                        .delete()
                        .eq('noche', noche);

                    // INSERT fresh data
                    if (records.length > 0) {
                        // Batch in chunks of 500 to avoid payload limits
                        for (let i = 0; i < records.length; i += 500) {
                            const chunk = records.slice(i, i + 500);
                            const { error } = await window.sb
                                .from('import_gbol_facturacion')
                                .insert(chunk);
                            if (error) throw error;
                        }
                    }

                    results.facturacion = records.length;
                    const duration = Math.round(performance.now() - t0);
                    await _logSync('facturacion', noche, puntoDeVenta, records.length, 'success', null, duration);

                } catch (err) {
                    const duration = Math.round(performance.now() - t0);
                    await _logSync('facturacion', noche, puntoDeVenta, 0, 'error', err.message, duration);
                    throw err;
                }
            }

            // ── Comandas ──
            if (syncComandas) {
                const t0 = performance.now();
                try {
                    const records = await GbolService.fetchComandas(noche, puntoDeVenta);

                    // DELETE existing for idempotency
                    await window.sb
                        .from('import_gbol_comandas')
                        .delete()
                        .eq('noche', noche);

                    // INSERT fresh data
                    if (records.length > 0) {
                        for (let i = 0; i < records.length; i += 500) {
                            const chunk = records.slice(i, i + 500);
                            const { error } = await window.sb
                                .from('import_gbol_comandas')
                                .insert(chunk);
                            if (error) throw error;
                        }
                    }

                    results.comandas = records.length;
                    const duration = Math.round(performance.now() - t0);
                    await _logSync('comandas', noche, puntoDeVenta, records.length, 'success', null, duration);

                } catch (err) {
                    const duration = Math.round(performance.now() - t0);
                    await _logSync('comandas', noche, puntoDeVenta, 0, 'error', err.message, duration);
                    throw err;
                }
            }

            // ── Withdrawals (Extracciones) ──
            if (syncWithdrawals) {
                const t0 = performance.now();
                try {
                    const records = await GbolService.fetchWithdrawals(noche);

                    if (records.length > 0) {
                        // Resolve terminal IDs
                        for (const r of records) {
                            if (r.gbol_caja_nombre) {
                                r.terminal_id = await GbolService.resolveTerminalId(r.gbol_caja_nombre);
                            }
                        }

                        // DELETE existing for idempotency
                        await window.sb
                            .from('import_gbol_withdrawals')
                            .delete()
                            .eq('noche', noche);

                        // INSERT fresh data
                        for (let i = 0; i < records.length; i += 500) {
                            const chunk = records.slice(i, i + 500);
                            const { error } = await window.sb
                                .from('import_gbol_withdrawals')
                                .insert(chunk);
                            if (error) throw error;
                        }
                    }

                    results.withdrawals = records.length;
                    const duration = Math.round(performance.now() - t0);
                    await _logSync('withdrawals', noche, puntoDeVenta, records.length, 'success', null, duration);

                } catch (err) {
                    // Non-blocking: log but don't fail entire sync
                    const duration = Math.round(performance.now() - t0);
                    await _logSync('withdrawals', noche, puntoDeVenta, 0, 'skipped', err.message, duration);
                    console.warn('[gbol-service] Withdrawals sync skipped:', err.message);
                }
            }

            return results;
        },

        /**
         * Get sync status for a given night from gbol_sync_log.
         * @param {string} noche
         * @returns {{ facturacion: Object|null, comandas: Object|null }}
         */
        getSyncStatus: async function (noche) {
            if (!window.sb) return { facturacion: null, comandas: null };

            const { data } = await window.sb
                .from('gbol_sync_log')
                .select('*')
                .eq('noche', noche)
                .order('synced_at', { ascending: false })
                .limit(10);

            const result = { facturacion: null, comandas: null };
            (data || []).forEach(row => {
                if (row.endpoint === 'facturacion' && !result.facturacion) {
                    result.facturacion = row;
                }
                if (row.endpoint === 'comandas' && !result.comandas) {
                    result.comandas = row;
                }
            });

            return result;
        },

        /**
         * Populate system_cash and system_zoco on closing_terminals
         * using facturacion data already imported for the night.
         * 
         * @param {string} closingId — UUID of cash_closings row
         * @param {string} noche — operative date to read facturacion from
         */
        populateSystemAmounts: async function (closingId, noche) {
            if (!window.sb) throw new Error('[gbol-service] Supabase not initialized');

            // Read imported facturacion for this night
            const { data: tickets, error } = await window.sb
                .from('import_gbol_facturacion')
                .select('gbol_caja_nombre, efectivo, digital, terminal_id')
                .eq('noche', noche);

            if (error) throw error;
            if (!tickets || tickets.length === 0) {
                console.warn('[gbol-service] No facturacion data for', noche);
                return { updated: 0 };
            }

            // Group by terminal
            const grouped = {};
            tickets.forEach(t => {
                const key = t.terminal_id;
                if (!key) return;  // No terminal mapping — skip
                if (!grouped[key]) grouped[key] = { cash: 0, digital: 0 };
                grouped[key].cash += Number(t.efectivo) || 0;
                grouped[key].digital += Number(t.digital) || 0;
            });

            // Update closing_terminals
            let updated = 0;
            for (const [terminalId, totals] of Object.entries(grouped)) {
                const { error: updateError } = await window.sb
                    .from('closing_terminals')
                    .update({
                        system_cash: totals.cash,
                        system_zoco: totals.digital,
                    })
                    .eq('cash_closing_id', closingId)
                    .eq('terminal_id', terminalId);

                if (!updateError) updated++;
            }

            return { updated, terminals: Object.keys(grouped).length };
        },

        /**
         * Fetch fiscal summary for a night from the view.
         * @param {string} noche
         */
        getFiscalSummary: async function (noche) {
            if (!window.sb) return null;

            const { data, error } = await window.sb
                .from('vw_fiscal_summary')
                .select('*')
                .eq('noche', noche)
                .maybeSingle();

            if (error) {
                console.error('[gbol-service] Error fetching fiscal summary:', error);
                return null;
            }
            return data;
        },
    };

    // Export
    window.GbolService = GbolService;

})();
