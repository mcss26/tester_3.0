// Script para extraer items y guardar JSON
const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('.agent/data/recaudacion por articulo 24_01_2026.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

// Find header row
let headerIdx = 6; // Known from previous analysis

// Extract all unique items
const items = [];
for (let i = headerIdx + 1; i < aoa.length; i++) {
    const row = aoa[i];
    if (row && row[0] && row[1]) {
        const codigo = String(row[0]).trim();
        const articulo = String(row[1]).trim();
        // Skip empty or metadata rows
        if (codigo && articulo && 
            !codigo.includes('Noche') && !codigo.includes('Fecha') && 
            !articulo.includes('Noche') && !articulo.includes('Fecha') &&
            codigo.length < 10) {
            items.push({ codigo, articulo });
        }
    }
}

// Save to JSON
fs.writeFileSync('.agent/excel-items.json', JSON.stringify(items, null, 2));

// Generate SQL
let sql = `-- SQL para insertar recetas con external_id
-- Ejecutar en Supabase SQL Editor

-- Opción 1: Actualizar external_id de recetas existentes (si ya existen con nombres similares)
-- Opción 2: Insertar como nuevas recetas

`;

items.forEach(item => {
    sql += `INSERT INTO master_recipes (name, external_id) VALUES ('${item.articulo}', '${item.codigo}') ON CONFLICT DO NOTHING;\n`;
});

fs.writeFileSync('.agent/insert-recipes.sql', sql);

console.log('Items extraídos:', items.length);
console.log('Archivos generados:');
console.log('  - .agent/excel-items.json');
console.log('  - .agent/insert-recipes.sql');
