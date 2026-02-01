// assets/js/importers/importer-gbol.js
(function () {

    const ImporterGbol = {

        process: async (file, workDayId) => {
            // PHASE 4: Wrap with import logging
            return await window.ImportLogger.wrap('gbol', file, workDayId, async () => {
                return await ImporterGbol.doImport(file, workDayId);
            });
        },

        doImport: async (file, workDayId) => {
            const content = await window.ImporterUtils.readFileAsText(file);
            const rows = window.ImporterUtils.parseCSV(content, ';'); // Gbol native often ;

            if (!rows.length) throw new Error("Archivo vacío o formato incorrecto.");

            // 1. Resolve Session
            const sessionId = await ImporterGbol.getSessionId(workDayId);
            if (!sessionId) throw new Error("No hay Sesión de Barra (Bar Session) para este WorkDay.");

            // ──────────────────────────────────────────────────────────
            // PHASE 3 - GAP-10: Pre-load recipes for validation
            // ──────────────────────────────────────────────────────────
            const { data: recipes, error: recError } = await window.sb
                .from('master_recipes')
                .select('external_id, name');

            if (recError) throw recError;

            const recipeMap = new Map(recipes?.map(r => [r.external_id, r.name]) || []);
            const missingRecipes = [];

            const salesPayload = [];

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

                const cantidad = parseFloat((qPaga || "0").replace(',', '.'));
                const total = window.ImporterUtils.parseCurrency(totalCaja);

                if (cantidad === 0 && total === 0) continue;

                // ──────────────────────────────────────────────────────────
                // PHASE 3: Check if recipe exists
                // ──────────────────────────────────────────────────────────
                if (!recipeMap.has(codigo)) {
                    missingRecipes.push({
                        codigo,
                        articulo,
                        cantidad,
                        total
                    });
                }

                // ──────────────────────────────────────────────────────────
                // PHASE 4 - GAP-11: Detect payment method
                // ──────────────────────────────────────────────────────────
                const paymentMethod = ImporterGbol.detectPaymentMethod(articulo, codigo);

                salesPayload.push({
                    session_id: sessionId,  // ✅ Changed from bar_session_id
                    external_id: codigo,
                    product_name: articulo || 'Unknown',
                    quantity: cantidad,
                    total_amount: total,
                    payment_method: paymentMethod,  // ✅ NEW: Auto-detect payment method
                    imported_at: new Date().toISOString()
                });
            }

            // 3. Batch Insert
            if (salesPayload.length > 0) {
                const { error } = await window.sb.from('bar_session_sales').insert(salesPayload);
                if (error) throw error;
            }

            // ──────────────────────────────────────────────────────────
            // PHASE 3: Warn about missing recipes
            // ──────────────────────────────────────────────────────────
            if (missingRecipes.length > 0) {
                console.warn('[importer-gbol] Productos sin receta mapeada:', missingRecipes);

                const summary = missingRecipes
                    .slice(0, 5)  // Show first 5
                    .map(r => `• ${r.codigo}: ${r.articulo} (${r.cantidad} unidades)`)
                    .join('\n');

                const moreText = missingRecipes.length > 5 ? `\n... y ${missingRecipes.length - 5} más` : '';

                window.Toast?.warning(
                    `⚠️ Se importaron ${salesPayload.length} ventas exitosamente.\n\n` +
                    `Sin embargo, ${missingRecipes.length} productos NO tienen receta mapeada.\n` +
                    `El cálculo de eficiencia de barra será INCOMPLETO:\n\n${summary}${moreText}`,
                    { duration: 10000 }
                );
            }

            return {
                count: salesPayload.length,
                warnings: missingRecipes.length > 0 ? {
                    type: 'missing_recipes',
                    count: missingRecipes.length,
                    details: missingRecipes
                } : null
            };
        },

        getSessionId: async (workDayId) => {
            const { data } = await window.sb.from('bar_sessions')
                .select('id')
                .eq('work_day_id', workDayId)
                .maybeSingle();

            // If no session exists, create one auto?
            if (!data) {
                const { data: stringNew, error } = await window.sb.from('bar_sessions')
                    .insert({ work_day_id: workDayId, status: 'active' })
                    .select()
                    .single();
                if (error) throw error;
                return stringNew.id;
            }
            return data.id;
        },

        /**
         * PHASE 4: Detect payment method from product name
         * @param {string} productName
         * @param {string} codigo
         * @returns {'cash'|'card'|'other'}
         */
        detectPaymentMethod: (productName, codigo) => {
            if (!productName) return 'cash';

            const lower = productName.toLowerCase();

            // Keywords indicating card/digital payment
            const cardKeywords = ['zoco', 'qr', 'tarjeta', 'digital', 'mercadopago', 'mp'];

            if (cardKeywords.some(keyword => lower.includes(keyword))) {
                return 'card';
            }

            // Default to cash
            return 'cash';
        }
    };

    window.ImporterGbol = ImporterGbol;

})();
