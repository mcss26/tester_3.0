const fs = require('fs');
const path = require('path');

const base = 'docs/02-ui-ux/lighthouse';

const screens = [
  { slug: 'admin-index',              html: 'admin-index.html',              css: 'pages/admin-index.css',     js: 'admin-index.js' },
  { slug: 'admin-workdays',           html: 'admin-workdays.html',           css: 'admin-workdays.css',        js: 'admin-workdays.js' },
  { slug: 'admin-semanal',            html: 'admin-semanal.html',            css: 'admin-semanal.css',         js: 'admin-semanal.js' },
  { slug: 'admin-reportes',           html: 'admin-reportes.html',           css: 'admin-reportes.css',        js: 'admin-reportes.js' },
  { slug: 'admin-pagos',              html: 'admin-pagos.html',              css: 'admin-pagos.css',           js: 'admin-pagos.js' },
  { slug: 'admin-solicitudes',        html: 'admin-solicitudes.html',        css: 'admin-solicitudes.css',     js: 'admin-solicitudes.js' },
  { slug: 'admin-config',             html: 'admin-config.html',             css: 'admin-config.css',          js: 'admin-config.js' },
  { slug: 'admin-central-stock',      html: 'admin-central-stock.html',      css: 'admin-central-stock.css',   js: 'admin-central-stock.js' },
  { slug: 'admin-master-categorias',  html: 'admin-master-categorias.html',  css: 'admin-master.css',          js: 'admin-master-categorias.js' },
  { slug: 'admin-master-nomina',      html: 'admin-master-nomina.html',      css: 'admin-master.css',          js: 'admin-master-nomina.js' },
  { slug: 'admin-master-pos',         html: 'admin-master-pos.html',         css: 'admin-master.css',          js: 'admin-master-pos.js' },
  { slug: 'admin-master-proveedores', html: 'admin-master-proveedores.html', css: 'admin-master.css',          js: 'admin-master-proveedores.js' },
  { slug: 'admin-master-tarifario',   html: 'admin-master-tarifario.html',   css: 'admin-master.css',          js: 'admin-master-tarifario.js' },
];

screens.forEach(s => {
  const dir = path.join(base, s.slug);
  fs.mkdirSync(dir, { recursive: true });

  const readme = [
    '# ' + s.slug,
    '',
    '## Archivos',
    '| Tipo | Ruta |',
    '|------|------|',
    '| HTML | `pages/admin/' + s.html + '` |',
    '| CSS  | `assets/css/' + s.css + '` |',
    '| JS   | `assets/js/modules/admin/' + s.js + '` |',
    '',
    '## Lighthouse',
    '',
    '> Guardar el JSON de Lighthouse acá como `report.json`',
    '',
    'Estado: ⏳ Pendiente',
    '',
    '## Issues encontrados',
    '',
    '_Pendiente de análisis_',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(dir, 'README.md'), readme);
});

// Move existing workdays JSON into its folder
const src = path.join(base, 'admin-workdays.json');
const dst = path.join(base, 'admin-workdays', 'report.json');
if (fs.existsSync(src)) {
  fs.copyFileSync(src, dst);
  console.log('Movido workdays JSON -> admin-workdays/report.json');
}

// Parse workdays report into summary
if (fs.existsSync(dst)) {
  const j = JSON.parse(fs.readFileSync(dst, 'utf8'));
  const cats = j.categories;
  const summary = [
    '# Lighthouse Summary: admin-workdays',
    '',
    '| Categoría | Score |',
    '|-----------|-------|',
  ];
  for (const k in cats) {
    summary.push('| ' + cats[k].title + ' | **' + Math.round(cats[k].score * 100) + '** |');
  }

  // Failing a11y audits
  summary.push('', '## Audits fallidos (A11y)', '');
  const acc = cats.accessibility;
  acc.auditRefs.forEach(r => {
    const a = j.audits[r.id];
    if (a && a.score !== null && a.score < 1) {
      const items = (a.details && a.details.items) || [];
      summary.push('- **' + r.id + '** — ' + a.title + ' (' + items.length + ' items, peso=' + r.weight + ')');
    }
  });

  // BP failed
  summary.push('', '## Audits fallidos (Best Practices)', '');
  const bp = cats['best-practices'];
  bp.auditRefs.forEach(r => {
    const a = j.audits[r.id];
    if (a && a.score !== null && a.score < 1) {
      summary.push('- **' + r.id + '** — ' + a.title);
    }
  });

  fs.writeFileSync(path.join(base, 'admin-workdays', 'summary.md'), summary.join('\n'));
  console.log('Generado admin-workdays/summary.md');

  // Update README
  const readmePath = path.join(base, 'admin-workdays', 'README.md');
  let readme = fs.readFileSync(readmePath, 'utf8');
  readme = readme.replace('Estado: ⏳ Pendiente', 'Estado: ✅ Analizado');
  readme = readme.replace('_Pendiente de análisis_', 'Ver [summary.md](summary.md)');
  fs.writeFileSync(readmePath, readme);
}

// Create parse script for future reports
const parseScript = [
  '// Uso: node parse-report.js <carpeta>',
  '// Ej:  node parse-report.js admin-semanal',
  'const fs = require("fs");',
  'const path = require("path");',
  '',
  'const slug = process.argv[2];',
  'if (!slug) { console.error("Uso: node parse-report.js <slug>"); process.exit(1); }',
  '',
  'const dir = path.join("docs/02-ui-ux/lighthouse", slug);',
  'const reportPath = path.join(dir, "report.json");',
  '',
  'if (!fs.existsSync(reportPath)) {',
  '  console.error("No existe:", reportPath);',
  '  process.exit(1);',
  '}',
  '',
  'const j = JSON.parse(fs.readFileSync(reportPath, "utf8"));',
  'const cats = j.categories;',
  '',
  'const summary = ["# Lighthouse Summary: " + slug, "", "| Categoría | Score |", "|-----------|-------|"];',
  'for (const k in cats) {',
  '  summary.push("| " + cats[k].title + " | **" + Math.round(cats[k].score * 100) + "** |");',
  '}',
  '',
  '// A11y failures',
  'summary.push("", "## Audits fallidos (A11y)", "");',
  'const acc = cats.accessibility;',
  'acc.auditRefs.forEach(r => {',
  '  const a = j.audits[r.id];',
  '  if (a && a.score !== null && a.score < 1) {',
  '    const items = (a.details && a.details.items) || [];',
  '    summary.push("- **" + r.id + "** — " + a.title + " (" + items.length + " items, peso=" + r.weight + ")");',
  '    items.slice(0, 5).forEach(it => {',
  '      if (it.node) summary.push("  - `" + it.node.selector + "`");',
  '    });',
  '  }',
  '});',
  '',
  '// BP failures',
  'summary.push("", "## Audits fallidos (Best Practices)", "");',
  'const bp = cats["best-practices"];',
  'bp.auditRefs.forEach(r => {',
  '  const a = j.audits[r.id];',
  '  if (a && a.score !== null && a.score < 1) {',
  '    summary.push("- **" + r.id + "** — " + a.title);',
  '  }',
  '});',
  '',
  'const outPath = path.join(dir, "summary.md");',
  'fs.writeFileSync(outPath, summary.join("\\n"));',
  'console.log("Generado:", outPath);',
  '',
  '// Update README',
  'const readmePath = path.join(dir, "README.md");',
  'let readme = fs.readFileSync(readmePath, "utf8");',
  'readme = readme.replace("Estado: ⏳ Pendiente", "Estado: ✅ Analizado");',
  'readme = readme.replace("_Pendiente de análisis_", "Ver [summary.md](summary.md)");',
  'fs.writeFileSync(readmePath, readme);',
  '',
].join('\n');

fs.writeFileSync(path.join(base, 'parse-report.js'), parseScript);
console.log('Creado parse-report.js');

console.log('\\nListo! ' + screens.length + ' carpetas creadas.');
