// Uso: node parse-report.js <carpeta>
// Ej:  node parse-report.js admin-semanal
const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
if (!slug) { console.error("Uso: node parse-report.js <slug>"); process.exit(1); }

const dir = path.join("docs/02-ui-ux/lighthouse", slug);
const reportPath = path.join(dir, "report.json");

if (!fs.existsSync(reportPath)) {
  console.error("No existe:", reportPath);
  process.exit(1);
}

const j = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const cats = j.categories;

const summary = ["# Lighthouse Summary: " + slug, "", "| Categoría | Score |", "|-----------|-------|"];
for (const k in cats) {
  summary.push("| " + cats[k].title + " | **" + Math.round(cats[k].score * 100) + "** |");
}

// A11y failures
summary.push("", "## Audits fallidos (A11y)", "");
const acc = cats.accessibility;
acc.auditRefs.forEach(r => {
  const a = j.audits[r.id];
  if (a && a.score !== null && a.score < 1) {
    const items = (a.details && a.details.items) || [];
    summary.push("- **" + r.id + "** — " + a.title + " (" + items.length + " items, peso=" + r.weight + ")");
    items.slice(0, 5).forEach(it => {
      if (it.node) summary.push("  - `" + it.node.selector + "`");
    });
  }
});

// BP failures
summary.push("", "## Audits fallidos (Best Practices)", "");
const bp = cats["best-practices"];
bp.auditRefs.forEach(r => {
  const a = j.audits[r.id];
  if (a && a.score !== null && a.score < 1) {
    summary.push("- **" + r.id + "** — " + a.title);
  }
});

const outPath = path.join(dir, "summary.md");
fs.writeFileSync(outPath, summary.join("\n"));
console.log("Generado:", outPath);

// Update README
const readmePath = path.join(dir, "README.md");
let readme = fs.readFileSync(readmePath, "utf8");
readme = readme.replace("Estado: ⏳ Pendiente", "Estado: ✅ Analizado");
readme = readme.replace("_Pendiente de análisis_", "Ver [summary.md](summary.md)");
fs.writeFileSync(readmePath, readme);
