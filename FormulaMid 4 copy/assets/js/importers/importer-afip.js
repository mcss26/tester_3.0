// assets/js/importers/importer-afip.js
(function() {

    const ImporterAfip = {

        process: async (file) => {
            const content = await window.ImporterUtils.readFileAsText(file);
            const rows = window.ImporterUtils.parseCSV(content, ';');

            if (!rows.length) throw new Error("Archivo vacío.");

            const summary = {};

            for (const row of rows) {
                // Columns: "Fecha", "Tipo", "Punto de Venta", "Numero", "Importe Total", "Moneda", "Cotizacion"
                // Or simplified Zoco export: "caja", "cajanom", "importe"
                
                // Let's support standard AFIP "Mis Comprobantes" format
                // "Punto de Venta" is key.
                
                const ptoVenta = row['Punto de Venta'] || row['PTO VTA'] || row['cajanom']; 
                // "cajanom" from Zoco proprietary export?
                
                const importeRaw = row['Importe Total'] || row['Importe'] || row['importe'] || '0';
                const importe = window.ImporterUtils.parseCurrency(importeRaw);

                if (!ptoVenta) continue;

                // Group
                if (!summary[ptoVenta]) summary[ptoVenta] = 0;
                summary[ptoVenta] += importe;
            }

            // Return clean structure
            // { key: "0005", amount: 12345.00 }
            return summary;
        }

    };

    window.ImporterAfip = ImporterAfip;

})();
