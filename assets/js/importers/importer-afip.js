// assets/js/importers/importer-afip.js
(function() {

    const ImporterAfip = {

        process: async (file) => {
            return await window.ImportLogger.wrap('afip', file, null, async () => {
                const content = await window.ImporterUtils.readFileAsText(file);
                const rows = window.ImporterUtils.parseCSV(content, ';');

                if (!rows.length) throw new Error("Archivo vacío.");

                const summary = {};

                for (const row of rows) {
                    const ptoVenta = row['Punto de Venta'] || row['PTO VTA'] || row['cajanom']; 
                    const importeRaw = row['Importe Total'] || row['Importe'] || row['importe'] || '0';
                    const importe = window.ImporterUtils.parseCurrency(importeRaw);

                    if (!ptoVenta) continue;

                    if (!summary[ptoVenta]) summary[ptoVenta] = 0;
                    summary[ptoVenta] += importe;
                }

                summary.count = Object.keys(summary).length;
                return summary;
            });
        }

    };

    window.ImporterAfip = ImporterAfip;

})();
