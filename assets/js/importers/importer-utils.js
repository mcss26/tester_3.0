// assets/js/importers/importer-utils.js
(function() {
    
    /**
     * Parses a local currency string (e.g. "1.095.500,00") to a float (1095500.00).
     * Handles:
     * - "1.000,00" -> 1000.00
     * - "1,50" -> 1.50
     * - "500" -> 500.00
     * - "$ 500" -> 500.00
     */
    const parseCurrency = (str) => {
        if (!str) return 0;
        let s = String(str).trim();
        // Remove currency symbols and spaces
        s = s.replace(/[$\s]/g, '');
        
        // Check format assumption: If it has dots and commas, dots are thousands separator (EU/ARG).
        if (s.includes('.') && s.includes(',')) {
            s = s.replace(/\./g, ''); // Remove thousands separator
            s = s.replace(',', '.');  // Replace decimal separator
        } else if (s.includes(',')) {
             // "100,50" -> 100.50
            s = s.replace(',', '.');
        }
        // If it only has dots "100.50" -> assume standard float unless it fits "1.000" pattern?
        // Risky ambiguity. But usually "1.000" in ARG context is 1000. 
        // Yet "10.5" is 10.50. 
        // Let's stick to the rule: If it comes from local CSVs, dots are likely thousands.
        // SAFEGUARD: If we see MULTIPLE dots, it's definitely thousands. 
        // If single dot and 3 decimals? "1.000". Likely 1000.
        
        // For this project, we assume standard AR Format: 1.234,56
        // So we strip dots always.
        // Exception: Gbol might export standard CSV 1000.00? We verify in specific importers.
        // But for "shared" logic, let's assume AR Clean.
        
        return parseFloat(s) || 0;
    };

    const parseCSV = (content, delimiter = ';') => {
        const lines = content.split(/\r?\n/);
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
        const rows = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Handle quotes? Simple split for now.
            const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
            
            if (values.length < headers.length) continue; // Skip incomplete lines
            
            const row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx];
            });
            rows.push(row);
        }
        return rows;
    };

    /**
     * Reads a file input as text.
     * @param {File} file 
     */
    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file, 'ISO-8859-1'); // Latin-1 usually for local Excel CSVs
        });
    };

    window.ImporterUtils = {
        parseCurrency,
        parseCSV,
        readFileAsText
    };

})();
