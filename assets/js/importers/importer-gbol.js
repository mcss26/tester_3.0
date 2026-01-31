// assets/js/importers/importer-gbol.js
(function() {
    
    const ImporterGbol = {

        process: async (file, workDayId) => {
            const content = await window.ImporterUtils.readFileAsText(file);
            const rows = window.ImporterUtils.parseCSV(content, ';'); // Gbol native often ;
            
            if (!rows.length) throw new Error("Archivo vacío o formato incorrecto.");

            // 1. Resolve Session
            const sessionId = await ImporterGbol.getSessionId(workDayId);
            if (!sessionId) throw new Error("No hay Sesión de Barra (Bar Session) para este WorkDay.");

            const salesPayload = [];
            const missingRecipes = [];
            // Optimistic approach: we don't block import if recipes missing, we just warn.
            
            // 2. Process Rows
            for (const row of rows) {
                // Expected Headers: "Codigo", "Articulo", "Q Paga", "Total Caja"
                // Adjust keys if CSV headers differ slightly (case sensitivity handled in utils?) -> Utils return raw headers.
                // We assume strict Gbol format.

                const codigo = row['Codigo'] || row['codigo'];
                const articulo = row['Articulo'] || row['articulo'];
                const qPaga = row['Q Paga'] || row['q paga'];
                const totalCaja = row['Total Caja'] || row['total caja'];

                if (!codigo) continue; // Skip totals footer or weird lines

                const cantidad = parseFloat((qPaga||"0").replace(',', '.'));
                const total = window.ImporterUtils.parseCurrency(totalCaja);

                if (cantidad === 0 && total === 0) continue;

                salesPayload.push({
                    bar_session_id: sessionId,
                    external_id: codigo,
                    product_name: articulo || 'Unknown',
                    quantity: cantidad,
                    total_amount: total,
                    imported_at: new Date().toISOString()
                });
            }

            // 3. Batch Insert
            if (salesPayload.length > 0) {
                const { error } = await window.sb.from('bar_session_sales').insert(salesPayload);
                if (error) throw error;
            }

            // 4. Update Terminal Closings? 
            // The Roadmap says Phase 1 only puts data in bar_session_sales. 
            // Admin Cierre UI compares "System Gbol" vs "Decl Gbol".
            // Implementation Detail: we should probably update `closing_terminals.system_zoco` somehow?
            // Or `admin-cierre.js` calculates `system_zoco` by summing `bar_session_sales`?
            // "Admin Cierre" usually handles Cash. Gbol sales might be cash or card.
            // If Gbol tracks "Total Caja", is that Cash? Usually yes.
            // But we need to distinguish payment methods if Gbol supports checks/QR.
            // For now, assume Gbol = Sales System.
            // We will leave the "Update closing_terminals" logic to the UI or a separate trigger.
            // This importer just dumps raw data.

            return { count: salesPayload.length, warning: null };
        },

        getSessionId: async (workDayId) => {
            const { data } = await window.sb.from('bar_sessions')
                .select('id')
                .eq('work_day_id', workDayId)
                .maybeSingle();
            
            // If no session exists, create one auto?
            if (!data) {
                const { data: stringNew, error } = await window.sb.from('bar_sessions')
                    .insert({ work_day_id: workDayId, status: 'active', name: 'Auto-Import Session' })
                    .select()
                    .single();
                if (error) throw error;
                return stringNew.id;
            }
            return data.id;
        }
    };

    window.ImporterGbol = ImporterGbol;

})();
