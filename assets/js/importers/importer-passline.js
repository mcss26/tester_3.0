// assets/js/importers/importer-passline.js
(function() {

    const ImporterPassline = {
        
        process: async (file, workDayId) => {
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
                // Columns: "ID", "Nombre", "Email", "Ticket", "Monto" (approx)
                const extId = row['ID'] || row['id'];
                const ticketName = row['Ticket'] || row['Tipo Ticket'] || row['ticket'];
                const montoRaw = row['Monto'] || row['Precio'] || '0';
                const customerName = row['Nombre'] || row['Comprador'] || 'Unknown';
                const email = row['Email'] || row['Correo'];

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
                    qr_batch_id: batchId,
                    external_id: extId,
                    status: 'ACREDITADO', // If in access flow, it's used.
                    source_platform: 'Passline',
                    scanned_at: new Date().toISOString(), // Or from CSV "Hora"
                    customer_email: email, // Optional CRM
                    customer_name: customerName,
                    price_paid: monto
                });
                count++;
            }

            // Batch Upsert
            // Chunking if too big? Supabase limit is generous but good practice.
            const chunkSize = 100;
            for (let i = 0; i < tickets.length; i += chunkSize) {
                const chunk = tickets.slice(i, i + chunkSize);
                const { error } = await window.sb.from('qr_codes')
                    .upsert(chunk, { onConflict: 'external_id' });
                
                if (error) {
                    console.error("Batch error", error);
                    // Continue? Or throw?
                }
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
