/**
 * fix-encoding.js
 * Scans all HTML files in pages/ for U+FFFD (replacement character)
 * and replaces common Spanish patterns with correct UTF-8.
 * 
 * Usage: node scripts/fix-encoding.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '..', 'pages');
const FFFD = '\uFFFD';
const DRY_RUN = process.argv.includes('--dry-run');

// Map: broken pattern → correct replacement
// The FFFD replaces a single accented character
const REPLACEMENTS = {
  // á → \uFFFD
  'est\uFFFD': 'está',
  'P\uFFFDgina': 'Página',
  'p\uFFFDgina': 'página',
  'r\uFFFDpida': 'rápida',
  'r\uFFFDpido': 'rápido',
  'est\uFFFDndar': 'estándar',
  'bar\uFFFDn': 'barán',
  'M\uFFFDs': 'Más',
  'm\uFFFDs': 'más',
  'b\uFFFDsica': 'básica',
  'B\uFFFDsqueda': 'Búsqueda',  // ú case
  'autom\uFFFDtica': 'automática',
  'autom\uFFFDtico': 'automático',
  // é → \uFFFD
  'caf\uFFFD': 'café',
  // ó → \uFFFD
  'Gesti\uFFFDn': 'Gestión',
  'gesti\uFFFDn': 'gestión',
  'Planificaci\uFFFDn': 'Planificación',
  'planificaci\uFFFDn': 'planificación',
  'Navegaci\uFFFDn': 'Navegación',
  'navegaci\uFFFDn': 'navegación',
  'Sesi\uFFFDn': 'Sesión',
  'sesi\uFFFDn': 'sesión',
  'Declaraci\uFFFDn': 'Declaración',
  'declaraci\uFFFDn': 'declaración',
  'operaci\uFFFDn': 'operación',
  'Operaci\uFFFDn': 'Operación',
  'descripci\uFFFDn': 'descripción',
  'Descripci\uFFFDn': 'Descripción',
  'reposici\uFFFDn': 'reposición',
  'Reposici\uFFFDn': 'Reposición',
  'generaci\uFFFDn': 'generación',
  'Generaci\uFFFDn': 'Generación',
  'informaci\uFFFDn': 'información',
  'Informaci\uFFFDn': 'Información',
  'configuraci\uFFFDn': 'configuración',
  'Configuraci\uFFFDn': 'Configuración',
  'distribuci\uFFFDn': 'distribución',
  'Distribuci\uFFFDn': 'Distribución',
  'recepci\uFFFDn': 'recepción',
  'Recepci\uFFFDn': 'Recepción',
  'asignaci\uFFFDn': 'asignación',
  'asignacion': 'asignación',   // missing accent entirely
  'confirmaci\uFFFDn': 'confirmación',
  'Confirmaci\uFFFDn': 'Confirmación',
  'autorizaci\uFFFDn': 'autorización',
  'acci\uFFFDn': 'acción',
  'Acci\uFFFDn': 'Acción',
  'soluci\uFFFDn': 'solución',
  'transacci\uFFFDn': 'transacción',
  'aprobaci\uFFFDn': 'aprobación',
  'verificaci\uFFFDn': 'verificación',
  'solicitud\uFFFDn': 'solicitudón',  // edge case
  'creaci\uFFFDn': 'creación',
  'creacion': 'creación',
  'edici\uFFFDn': 'edición',
  'eliminaci\uFFFDn': 'eliminación',
  'actualizaci\uFFFDn': 'actualización',
  'liquidaci\uFFFDn': 'liquidación',
  'observaci\uFFFDn': 'observación',
  'devoluci\uFFFDn': 'devolución',
  'producci\uFFFDn': 'producción',
  'N\uFFFDmina': 'Nómina',
  'n\uFFFDmina': 'nómina',
  'N\uFFFDmero': 'Número',
  'n\uFFFDmero': 'número',
  'C\uFFFDdigo': 'Código',
  'c\uFFFDdigo': 'código',
  'Hist\uFFFDrico': 'Histórico',
  'hist\uFFFDrico': 'histórico',
  'P\uFFFDblicos': 'Públicos',
  'p\uFFFDblicos': 'públicos',
  'Pr\uFFFDximamente': 'Próximamente',
  '\uFFFDrdenes': 'Órdenes',
  '\uFFFDrdenes': 'órdenes',
  'M\uFFFDdulo': 'Módulo',
  'm\uFFFDdulo': 'módulo',
  // ú → \uFFFD
  'b\uFFFDsqueda': 'búsqueda',
  'Men\uFFFD': 'Menú',
  'men\uFFFD': 'menú',
  'aqu\uFFFD': 'aquí',       // í
  // í → \uFFFD
  'Estad\uFFFDsticas': 'Estadísticas',
  'estad\uFFFDsticas': 'estadísticas',
  'categor\uFFFDa': 'categoría',
  'Categor\uFFFDa': 'Categoría',
  'categor\uFFFDas': 'categorías',
  'garant\uFFFDa': 'garantía',
  'log\uFFFDstica': 'logística',
  'Log\uFFFDstica': 'Logística',
  'anal\uFFFDtica': 'analítica',
  'Anal\uFFFDtica': 'Analítica',
  'An\uFFFDlisis': 'Análisis',
  'an\uFFFDlisis': 'análisis',
  'Cr\uFFFDtico': 'Crítico',
  'cr\uFFFDtico': 'crítico',
  // ñ → \uFFFD
  'Compa\uFFFD\uFFFDa': 'Compañía',
  'A\uFFFDo': 'Año',
  'a\uFFFDo': 'año',
  'Dise\uFFFDo': 'Diseño',
  'dise\uFFFDo': 'diseño',
  'Ense\uFFFDar': 'Enseñar',
  'peque\uFFFDo': 'pequeño',
  'Peque\uFFFDo': 'Pequeño',
  'Se\uFFFDal': 'Señal',
  'Da\uFFFDo': 'Daño',
  'Espa\uFFFDol': 'Español',
  // Common standalone / em-dash / bullet
  '\uFFFD': '—',  // Fallback: lone FFFD → em-dash (most common use: title separators)
};

function getAllHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  if (!content.includes(FFFD)) {
    return { file: path.relative(PAGES_DIR, filePath), changes: 0, remaining: 0 };
  }
  
  const originalFffdCount = (content.match(/\uFFFD/g) || []).length;
  let changes = 0;
  
  // Apply replacements longest-first to avoid partial matches
  const sortedKeys = Object.keys(REPLACEMENTS).sort((a, b) => b.length - a.length);
  
  for (const broken of sortedKeys) {
    if (!content.includes(broken)) continue;
    const fixed = REPLACEMENTS[broken];
    const before = content;
    content = content.split(broken).join(fixed);
    if (content !== before) {
      const count = (before.split(broken).length - 1);
      changes += count;
    }
  }
  
  const remaining = (content.match(/\uFFFD/g) || []).length;
  
  if (!DRY_RUN && changes > 0) {
    // Write as UTF-8 without BOM
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return {
    file: path.relative(PAGES_DIR, filePath),
    changes,
    remaining,
    originalFffd: originalFffdCount
  };
}

// Main
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
console.log(`Scanning: ${PAGES_DIR}\n`);

const files = getAllHtmlFiles(PAGES_DIR);
let totalChanges = 0;
let totalRemaining = 0;
const results = [];

for (const f of files) {
  const result = fixFile(f);
  if (result.changes > 0 || result.remaining > 0) {
    results.push(result);
    totalChanges += result.changes;
    totalRemaining += result.remaining;
  }
}

console.log('FILE'.padEnd(45) + 'FFFD  FIXED  LEFT');
console.log('-'.repeat(70));
for (const r of results) {
  console.log(
    r.file.padEnd(45) +
    String(r.originalFffd).padStart(4) +
    String(r.changes).padStart(7) +
    String(r.remaining).padStart(6)
  );
}
console.log('-'.repeat(70));
console.log(`Total: ${totalChanges} replacements, ${totalRemaining} remaining`);

if (totalRemaining > 0) {
  console.log('\n⚠ REMAINING FFFD — need manual patterns:');
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/.{0,15}\uFFFD.{0,15}/g);
    if (matches) {
      const relPath = path.relative(PAGES_DIR, f);
      const unique = [...new Set(matches)];
      for (const m of unique.slice(0, 5)) {
        console.log(`  ${relPath}: "${m.trim()}"`);
      }
    }
  }
}
