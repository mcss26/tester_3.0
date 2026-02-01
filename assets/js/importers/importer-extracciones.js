// assets/js/importers/importer-extracciones.js
(function () {

    const ImporterExtracciones = {

        /**
         * Main entry point
         * @param {File} file 
         * @param {string} workDayId 
         */
        process: async (file, workDayId) => {
            const content = await window.ImporterUtils.readFileAsText(file);
            const lines = content.split(/\r?\n/);

            const transactions = [];
            let currentTerminalName = null;
            let importCount = 0;

            // 1. Get Terminal Map
            const terminalMap = await ImporterExtracciones.getTerminalMap();
            const closingId = await ImporterExtracciones.getClosingId(workDayId);

            if (!closingId) {
                throw new Error("No hay un Cierre de Caja (Cash Closing) activo para este WorkDay.");
            }

            // 2. Parse Lines
            for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine) continue;

                // Context Switch
                // Example: "Barras - CAJA 1;;;..."
                if (cleanLine.includes('Barras -') || cleanLine.includes('Boleteria -') || cleanLine.toUpperCase().includes('CAJA')) {
                    // Try to extract name. 
                    // Usually lines are like: "Barras - CAJA 1;..."
                    // We take the first part before semicolon
                    const headerPart = cleanLine.split(';')[0].trim();
                    if (headerPart.length > 3) { // Avoid noise
                        currentTerminalName = headerPart;
                        // console.log("Context switch:", currentTerminalName);
                    }
                    continue; // Header line logic ends here
                }

                // Data Line Detection
                // Usually starts with time pattern HH:MM:SS or just HH:MM
                const cols = cleanLine.split(';');
                if (cols.length < 4) continue;

                const firstCol = cols[0];
                const isTime = firstCol.includes(':') && firstCol.length <= 8;

                if (isTime) {
                    // It's a transaction
                    if (!currentTerminalName) continue; // Skip orphaned rows

                    const rawAmount = cols[3]; // Assumption: Col 3 is Amount
                    const monto = window.ImporterUtils.parseCurrency(rawAmount);

                    if (monto === 0) continue; // Filter 0s as per rules

                    const concepto = cols[1]; // "Efectivo" or "Retiro"
                    const usuario = cols[6] || 'System';

                    const terminalId = terminalMap[currentTerminalName] || terminalMap[ImporterExtracciones.normalizeName(currentTerminalName)];

                    if (terminalId) {
                        // PHASE 3: FIX GAP-08 (negative amount) + GAP-09 (deduplication)
                        transactions.push({
                            cash_closing_id: closingId,
                            terminal_id: terminalId,
                            amount: Math.abs(monto),  // ✅ FIX: Always positive (type='withdrawal' indicates direction)
                            type: 'withdrawal',
                            reason: concepto,
                            external_id: `EXT-${currentTerminalName}-${firstCol}-${monto}`,  // ✅ NEW: Unique hash for deduplication
                            description: `[Import] ${concepto} (${usuario})`,
                            status: 'confirmed',
                            created_at: new Date().toISOString()
                        });
                        importCount++;
                    } else {
                        console.warn(`Terminal desconocida: ${currentTerminalName}`);
                    }
                }
            }

            // 3. Batch Upsert (PHASE 3: Handle duplicates)
            if (transactions.length > 0) {
                const { error } = await window.sb
                    .from('cash_movements')
                    .upsert(transactions, {
                        onConflict: 'external_id',
                        ignoreDuplicates: true
                    });

                if (error) {
                    if (error.code === '23505') {
                        window.Toast?.warning(
                            `Se detectaron ${transactions.length} retiros duplicados. No se importaron nuevamente.`
                        );
                        return { count: 0, skipped: transactions.length };
                    }
                    throw error;
                }
            }

            return { count: importCount, ignored: 0 }; // TODO: track ignored
        },

        getTerminalMap: async () => {
            // Fetch aliases
            const { data: aliases } = await window.sb.from('pos_terminals_alias').select('alias, terminal_id');
            const map = {};
            if (aliases) {
                aliases.forEach(a => map[a.alias] = a.terminal_id);
            }
            // Also fetch raw terminals for direct match
            const { data: terms } = await window.sb.from('pos_terminals').select('id, friendly_name');
            if (terms) {
                terms.forEach(t => map[t.friendly_name] = t.id);
            }
            return map;
        },

        normalizeName: (name) => {
            // "Barras - CAJA 1" -> "CAJA 1" ??
            // This depends on the specific alias table config.
            return name;
        },

        getClosingId: async (workDayId) => {
            const { data } = await window.sb.from('cash_closings').select('id').eq('work_day_id', workDayId).maybeSingle();
            return data?.id;
        }

    };

    window.ImporterExtracciones = ImporterExtracciones;

})();
