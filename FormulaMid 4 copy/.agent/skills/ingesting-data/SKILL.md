---
name: ingesting-data
description: Expert in ETL (Extract-Transform-Load) and Forensic Data Parsing for FormulaMid. Use this skill when the user uploads CSVs (Passline, Gbol, Treasury, AFIP), asks to create importers, or works on 'admin-cierre.html'.
---

# Ingesting Data Skill (ETL Specialist)

> **Fuente de Verdad**: [scheme.md](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/scheme.md)
> **Standard**: ETL (Extract -> Load Staging -> Transform)

---

## 🧠 Core Philosophy: "Audit-First"
We prioritize **historical truth**. When importing data, we strictly follow an **ELT (Extract -> Load to Staging -> Transform)** pattern to ensure data integrity before affecting financial tables.

1.  **Raw Loading**: First, insert raw CSV data into `stg_` tables (all columns as `text`).
2.  **Transformation**: Cast types (Strings to Numeric) and map Foreign Keys (External IDs to UUIDs) via SQL Views or secondary JS processing.
3.  **Idempotency**: Never duplicate data. Use `external_id` or unique composite keys to prevent double-counting if a file is uploaded twice.

---

## 📂 Supported Parsers & Logic

### 1. Treasury / Cash Flow (Extracciones)
*   **Source File**: `EXTRACCIONES - DD - MM - YY.csv`
*   **Complexity**: **Hierarchical (Non-Flat)**. Contains headers ("Barras - CAJA 1") and data rows mixed.
*   **Logic**:
    *   **Filter**: IGNORE rows where Amount is `"0,00"` or Status is `"Rechazada"`.
    *   **Context**: Detect the terminal (e.g., "CAJA 1") from section headers to assign the `terminal_id`.
    *   **Target**: `stg_extracciones` -> `cash_movements` (type: 'withdrawal').

### 2. Gbol Sales (Venta Bruta)
*   **Source File**: `RECAUDACION POR ITEM - DD - MM - YY.csv`
*   **Logic**:
    *   **Mapping**: Map `Codigo` (Col 0) to `master_recipes.external_id`.
    *   **Validation**: The sum of `Total` column must match the CSV footer.
    *   **Alert**: If a `Codigo` has no match in `master_recipes`, flag it as "Unmapped Item" (Do not crash).
    *   **Target**: `stg_gbol_items` -> `bar_session_sales`.

### 3. Passline (Access & Tickets)
*   **Source File**: `1. Flujo de Acceso...csv`
*   **Logic**:
    *   **Unique Key**: Use `Ticket ID` (or `id_compra`) as the unique identifier.
    *   **Sanitization**: Strip currency symbols and thousand separators from `Monto`.
    *   **Target**: `stg_passline_tickets` -> `qr_codes`.

### 4. Fiscal Data (AFIP/Zoco)
*   **Source File**: `Factura electrónica...csv`
*   **Logic**:
    *   **Grouping**: Group rows by `Punto de Venta` (POS) to compare against internal terminals.
    *   **Target**: `stg_afip_facturas` (Read-only for validation vs `closing_terminals`).

---

## 🛠️ Implementation Standards

### JS Parser Structure
All importers in `assets/js/importers/` must follow this pattern:

```javascript
import Papa from 'papaparse'; // Or global window.Papa

export async function parseTreasuryCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: false, // False for hierarchical files
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rawRows = results.data;
                    const cleanData = processHierarchicalRows(rawRows); 
                    await bulkInsertToStaging(cleanData);
                    resolve({ success: true, count: cleanData.length });
                } catch (err) {
                    reject(err);
                }
            },
            error: (err) => reject(err)
        });
    });
}
```

### Staging Tables Reference
Always insert into these tables first (defined in `scheme.md`):
*   `public.stg_extracciones`
*   `public.stg_gbol_items`
*   `public.stg_passline_tickets`
*   `public.stg_afip_facturas`

---

## ✅ Ingest Quality Checklist (DoD)
Before finishing an importer task:

- [ ] **Zero Trash**: Did I filter out rows with `0.00` amount (Ghost records)?
- [ ] **Feedback**: Does the UI show a **Spinner** during parsing (files can be large)?
- [ ] **Error Handling**: If `PapaParse` fails, do I show a `window.Toast.error`?
- [ ] **Type Safety**: Are numeric strings (e.g., "1.200,50") correctly converted to floats (1200.50) before DB insert?
- [ ] **Idempotency**: Did I use `upsert()` or check for existing IDs to avoid duplicates?

---

## 🔗 Referencias

- [Schema Definition](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/scheme.md)