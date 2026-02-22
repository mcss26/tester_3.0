// console-errors-collector.js
// Uses Playwright to navigate to all admin screens and capture console errors.
// Usage: node scripts/console-errors-collector.js
// Output: docs/02-ui-ux/lighthouse/console-errors.md

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE_URL = "http://127.0.0.1:5501";
const LH_DIR = path.join("docs", "02-ui-ux", "lighthouse");
const OUT_PATH = path.join(LH_DIR, "console-errors.md");

const SCREENS = [
  { slug: "admin-index", path: "/pages/admin/admin-index.html" },
  { slug: "admin-semanal", path: "/pages/admin/admin-semanal.html" },
  { slug: "admin-reportes", path: "/pages/admin/admin-reportes.html" },
  { slug: "admin-pagos", path: "/pages/admin/admin-pagos.html" },
  { slug: "admin-solicitudes", path: "/pages/admin/admin-solicitudes.html" },
  { slug: "admin-config", path: "/pages/admin/admin-config.html" },
  { slug: "admin-central-stock", path: "/pages/admin/admin-central-stock.html" },
  { slug: "admin-master-categorias", path: "/pages/admin/admin-master-categorias.html" },
  { slug: "admin-master-nomina", path: "/pages/admin/admin-master-nomina.html" },
  { slug: "admin-master-pos", path: "/pages/admin/admin-master-pos.html" },
  { slug: "admin-master-proveedores", path: "/pages/admin/admin-master-proveedores.html" },
  { slug: "admin-master-tarifario", path: "/pages/admin/admin-master-tarifario.html" },
  { slug: "admin-workdays", path: "/pages/admin/admin-workdays.html" },
];

async function collectErrors() {
  console.log("\n🔍 Console Errors Collector (Playwright)\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 823 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });

  const allResults = [];

  for (const screen of SCREENS) {
    const url = `${BASE_URL}${screen.path}`;
    const errors = [];
    const warnings = [];

    const page = await context.newPage();

    // Capture console messages
    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === "error") {
        errors.push(text);
      } else if (type === "warning") {
        warnings.push(text);
      }
    });

    // Capture page errors (unhandled JS exceptions)
    page.on("pageerror", (err) => {
      errors.push(`[PageError] ${err.message}`);
    });

    // Capture failed network requests
    page.on("requestfailed", (req) => {
      errors.push(`[Network] ${req.method()} ${req.url()} → ${req.failure()?.errorText || "failed"}`);
    });

    console.log(`📄 ${screen.slug}...`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      errors.push(`[Navigation] ${e.message}`);
    }

    await page.close();

    allResults.push({
      slug: screen.slug,
      url,
      errors,
      warnings,
      errorCount: errors.length,
      warningCount: warnings.length,
    });

    const icon = errors.length > 0 ? "❌" : "✅";
    console.log(`   ${icon} ${errors.length} errors, ${warnings.length} warnings`);
  }

  await browser.close();

  // Generate markdown report
  const md = generateReport(allResults);
  fs.writeFileSync(OUT_PATH, md);
  console.log(`\n📝 Report saved: ${OUT_PATH}`);
  console.log(
    `   Total: ${allResults.reduce((s, r) => s + r.errorCount, 0)} errors, ${allResults.reduce(
      (s, r) => s + r.warningCount,
      0
    )} warnings across ${SCREENS.length} screens`
  );
}

function generateReport(results) {
  const lines = [
    "# Console Errors Matrix — Admin Screens",
    "",
    `> Generated: ${new Date().toISOString()}`,
    `> Tool: Playwright ${require("playwright/package.json").version}`,
    "",
    "## Summary Grid",
    "",
    "| Screen | Errors | Warnings | Status |",
    "|--------|--------|----------|--------|",
  ];

  const totalErrors = results.reduce((s, r) => s + r.errorCount, 0);
  const totalWarnings = results.reduce((s, r) => s + r.warningCount, 0);

  for (const r of results) {
    const status = r.errorCount === 0 ? "✅" : "❌";
    lines.push(`| ${r.slug} | ${r.errorCount} | ${r.warningCount} | ${status} |`);
  }
  lines.push(`| **TOTAL** | **${totalErrors}** | **${totalWarnings}** | |`);

  // Detailed errors per screen
  lines.push("", "---", "", "## Detailed Errors", "");

  for (const r of results) {
    if (r.errorCount === 0 && r.warningCount === 0) continue;

    lines.push(`### ${r.slug}`, "");

    if (r.errors.length > 0) {
      lines.push("**Errors:**", "");
      for (const e of r.errors) {
        lines.push(`- \`${e.substring(0, 200)}\``);
      }
      lines.push("");
    }

    if (r.warnings.length > 0) {
      lines.push("**Warnings:**", "");
      for (const w of r.warnings.slice(0, 10)) {
        lines.push(`- \`${w.substring(0, 200)}\``);
      }
      if (r.warnings.length > 10) {
        lines.push(`- _(${r.warnings.length - 10} more warnings omitted)_`);
      }
      lines.push("");
    }
  }

  // Pattern analysis
  lines.push("---", "", "## Error Patterns", "");
  const errorTexts = results.flatMap((r) => r.errors);
  const patterns = {};
  for (const e of errorTexts) {
    // Simplify error text for pattern matching
    const key = e
      .replace(/http:\/\/127\.0\.0\.1:\d+/g, "[LOCAL]")
      .replace(/https:\/\/[^\s/]+/g, "[EXTERNAL]")
      .replace(/'sha256-[^']+'/g, "'sha256-...'")
      .substring(0, 120);
    patterns[key] = (patterns[key] || 0) + 1;
  }

  const sorted = Object.entries(patterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  if (sorted.length > 0) {
    lines.push("| Count | Pattern |", "|-------|---------|");
    for (const [pat, count] of sorted) {
      lines.push(`| ${count} | \`${pat}\` |`);
    }
  } else {
    lines.push("No errors found! 🎉");
  }

  return lines.join("\n");
}

collectErrors().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
