// assets/js/importers/importer-passline.js
(function () {

    const ImporterPassline = {

        process: async (file, workDayId) => {
            // PHASE 4: Wrap with import logging
            return await window.ImportLogger.wrap('passline', file, workDayId, async () => {
                return await ImporterPassline.doImport(file, workDayId);
            });
        },

        doImport: async (file, workDayId) => {
            const content = await window.ImporterUtils.readFileAsText(file);
            const rows = window.ImporterUtils.parseCSV(content, ';'); // Check if Passline uses ; or ,
            // Passline exports often use semicolon if spanish regional settings

            if (!rows.length) throw new Error("Archivo vacío.");

            const tickets = [];
            const batchesCache = {}; // name -> id

            // Pre-fetch existing batches for this WorkDay?
            // Actually batches are usually global or per event. 
            // WorkDay implies an Event.
            // Let's lazy create batches.

            let count = 0;

            for (const row of rows) {
                // Pasline real columns: "ID ticket", "Tipo", "Email", "Nombre" 
                const extId = row['ID ticket'] || row['ID'] || row['id'];
                const ticketName = row['Tipo'] || row['Ticket'] || row['Tipo Ticket'] || row['ticket'];
                const montoRaw = row['Total'] || row['Monto'] || row['Precio'] || '0';
                const customerName = row['Nombre'] || row['Comprador'] || 'Unknown';
                const email = row['Email'] || row['Correo'];

                // ──────────────────────────────────────────────────────────
                // PHASE 3 - GAP-13: Read dynamic status from CSV
                // ──────────────────────────────────────────────────────────
                const rawStatus = row['Estado'] || row['estado_ticket'] || row['Estado Ticket'] || row['Estado QR'];
                const normalizedStatus = rawStatus ? rawStatus.toUpperCase().trim() : 'ACREDITADO';

                // Validate against allowed statuses
                const validStatuses = ['ACREDITADO', 'PENDIENTE', 'CANCELADO', 'REEMBOLSADO', 'USADO'];
                const status = validStatuses.includes(normalizedStatus) ? normalizedStatus : 'ACREDITADO';

                if (!extId) continue;

                const monto = window.ImporterUtils.parseCurrency(montoRaw);

                // Batch Logic
                let batchId = batchesCache[ticketName];
                if (!batchId) {
                    batchId = await ImporterPassline.resolveBatch(ticketName, workDayId, monto);
                    batchesCache[ticketName] = batchId;
                }

                tickets.push({
                    work_day_id: workDayId,
                    batch_id: batchId,  // ✅ Changed from qr_batch_id
                    external_id: extId,
                    status: status,  // ✅ DYNAMIC (was hardcoded 'ACREDITADO')
                    code: extId,  // QR code string
                    created_at: new Date().toISOString()
                });
                count++;
            }

            // 3. Batch Upsert with error handling
            const chunkSize = 100;
            let processedCount = 0;

            for (let i = 0; i < tickets.length; i += chunkSize) {
                const chunk = tickets.slice(i, i + chunkSize);
                const { data, error } = await window.sb
                    .from('qr_codes')
                    .upsert(chunk, {
                        onConflict: 'external_id',
                        ignoreDuplicates: false  // Update existing
                    })
                    .select();

                if (error) {
                    console.error('[importer-passline] Error en chunk:', error);
                    throw error;  // Stop on error
                }

                processedCount += chunk.length;
            }

            return { count };
        },

        resolveBatch: async (name, workDayId, price) => {
            // Check if exists
            const { data } = await window.sb.from('qr_batches')
                .select('id')
                .eq('work_day_id', workDayId)
                .eq('name', name)
                .maybeSingle();

            if (data) return data.id;

            // Create new
            const { data: stringNew, error } = await window.sb.from('qr_batches')
                .insert({
                    work_day_id: workDayId,
                    name: name,
                    unit_price: price,
                    market_source: 'PASSLINE', // Auto-classify
                    financial_type: 'revenue'
                })
                .select()
                .single();

            if (error) throw error;
            return stringNew.id;
        }

    };

    window.ImporterPassline = ImporterPassline;

})();
