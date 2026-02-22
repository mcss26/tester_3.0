// lighthouse-matrix.js
// Reads all report.json files from docs/02-ui-ux/lighthouse/<slug>/
// and generates a cross-screen pattern matrix.
//
// Usage: node scripts/lighthouse-matrix.js
// Output: docs/02-ui-ux/lighthouse/lighthouse-matrix.md
const fs = require("fs");
const path = require("path");

const LH_DIR = path.join("docs", "02-ui-ux", "lighthouse");
const OUT_PATH = path.join(LH_DIR, "lighthouse-matrix.md");
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

/* ── helpers ─────────────────────────────────────────────────── */

function readReports() {
  const dirs = fs
    .readdirSync(LH_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const reports = [];
  for (const dir of dirs) {
    const reportPath = path.join(LH_DIR, dir.name, "report.json");
    if (!fs.existsSync(reportPath)) continue;
    try {
      const json = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      reports.push({ slug: dir.name, data: json });
    } catch (e) {
      console.warn(`⚠ Could not parse ${reportPath}: ${e.message}`);
    }
  }
  return reports;
}

function getScore(report, catId) {
  const cat = report.data.categories?.[catId];
  return cat ? Math.round(cat.score * 100) : null;
}

function scoreEmoji(score) {
  if (score === null) return "—";
  if (score >= 90) return `🟢 ${score}`;
  if (score >= 50) return `🟡 ${score}`;
  return `🔴 ${score}`;
}

function collectFailedAudits(reports) {
  const auditMap = new Map();

  for (const { slug, data } of reports) {
    const audits = data.audits || {};
    for (const [auditId, audit] of Object.entries(audits)) {
      if (!audit.score && audit.score !== 0) continue; // skip informational
      if (audit.score >= 1) continue; // passed

      const itemCount =
        audit.details?.items?.length ||
        audit.details?.headings?.length ||
        0;

      if (!auditMap.has(auditId)) {
        auditMap.set(auditId, {
          id: auditId,
          title: audit.title,
          description: (audit.description || "").slice(0, 120),
          weight: 0,
          screens: [],
          totalItems: 0,
        });
      }

      const entry = auditMap.get(auditId);
      entry.screens.push(slug);
      entry.totalItems += itemCount;

      // accumulate weight from category refs
      for (const cat of Object.values(data.categories || {})) {
        const ref = (cat.auditRefs || []).find((r) => r.id === auditId);
        if (ref && ref.weight > entry.weight) {
          entry.weight = ref.weight;
        }
      }
    }
  }

  return [...auditMap.values()];
}

function priorityScore(audit) {
  return audit.weight * audit.screens.length;
}

/* ── generators ──────────────────────────────────────────────── */

function genScoreGrid(reports) {
  const header = `| Pantalla | Performance | Accessibility | Best Practices | SEO |`;
  const sep = `|---|---|---|---|---|`;
  const rows = reports.map(({ slug, data }) => {
    const scores = CATEGORIES.map((c) => scoreEmoji(getScore({ data }, c)));
    return `| ${slug} | ${scores.join(" | ")} |`;
  });
  return [header, sep, ...rows].join("\n");
}

function genTopIssues(failedAudits, catFilter, label) {
  const filtered = failedAudits
    .filter((a) => {
      if (!catFilter) return true;
      return a.id.includes(catFilter) || a.screens.length >= 1;
    })
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 15);

  if (filtered.length === 0) return `### ${label}\n\nNo issues found.\n`;

  const header = `| Audit | Weight | Screens | Items | Priority |`;
  const sep = `|---|---|---|---|---|`;
  const rows = filtered.map((a) => {
    const ps = priorityScore(a);
    return `| **${a.title}** (\`${a.id}\`) | ${a.weight} | ${a.screens.length} | ${a.totalItems} | ${ps} |`;
  });

  return [`### ${label}`, "", header, sep, ...rows, ""].join("\n");
}

function genPatternClusters(failedAudits) {
  const clusters = {
    "Inline Styles / CSS": [],
    "Missing Labels / ARIA": [],
    "Color Contrast": [],
    "CSP / Security": [],
    "Performance": [],
    "SEO": [],
    "Other": [],
  };

  for (const a of failedAudits) {
    const id = a.id.toLowerCase();
    if (id.includes("label") || id.includes("aria") || id.includes("name"))
      clusters["Missing Labels / ARIA"].push(a);
    else if (id.includes("contrast") || id.includes("color"))
      clusters["Color Contrast"].push(a);
    else if (id.includes("csp") || id.includes("security") || id.includes("https"))
      clusters["CSP / Security"].push(a);
    else if (id.includes("inline") || id.includes("css") || id.includes("style"))
      clusters["Inline Styles / CSS"].push(a);
    else if (
      id.includes("speed") ||
      id.includes("render") ||
      id.includes("layout") ||
      id.includes("lcp") ||
      id.includes("cls") ||
      id.includes("fcp") ||
      id.includes("tbt")
    )
      clusters["Performance"].push(a);
    else if (id.includes("meta") || id.includes("crawl") || id.includes("robots"))
      clusters["SEO"].push(a);
    else clusters["Other"].push(a);
  }

  const lines = ["### Pattern Clusters", ""];
  for (const [name, items] of Object.entries(clusters)) {
    if (items.length === 0) continue;
    lines.push(`#### ${name} (${items.length} audits)`);
    lines.push("");
    for (const a of items.sort((x, y) => priorityScore(y) - priorityScore(x))) {
      lines.push(
        `- \`${a.id}\` — ${a.title} (w=${a.weight}, ${a.screens.length} screens, ${a.totalItems} items)`
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

function genRemediationPriority(failedAudits) {
  const sorted = failedAudits
    .filter((a) => a.weight > 0)
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 20);

  if (sorted.length === 0)
    return "### Remediation Priority\n\nNo weighted issues found.\n";

  const header = `| # | Audit | Weight | Screens | Scope | Priority |`;
  const sep = `|---|---|---|---|---|---|`;
  const rows = sorted.map((a, i) => {
    const scope = a.screens.length >= 3 ? "🌐 Global" : "📄 Local";
    return `| ${i + 1} | **${a.title}** | ${a.weight} | ${a.screens.join(", ")} | ${scope} | ${priorityScore(a)} |`;
  });

  return [
    "### Remediation Priority (Top 20)",
    "",
    "> Sorted by `weight × screen_count`. Global = appears in ≥3 screens (fix-once pattern).",
    "",
    header,
    sep,
    ...rows,
    "",
  ].join("\n");
}

/* ── main ────────────────────────────────────────────────────── */

function main() {
  const reports = readReports();
  if (reports.length === 0) {
    console.error("❌ No report.json files found in", LH_DIR);
    process.exit(1);
  }

  console.log(`📊 Found ${reports.length} report(s): ${reports.map((r) => r.slug).join(", ")}`);

  const failedAudits = collectFailedAudits(reports);
  console.log(`🔍 ${failedAudits.length} unique failed audits across all reports`);

  const md = [
    `# Lighthouse Cross-Audit Matrix`,
    "",
    `> Generated: ${new Date().toISOString().slice(0, 10)}`,
    `> Reports analyzed: ${reports.length}/13`,
    "",
    "---",
    "",
    "## Score Grid",
    "",
    genScoreGrid(reports),
    "",
    "---",
    "",
    "## Failed Audits Analysis",
    "",
    genTopIssues(failedAudits, null, "All Categories — Top 15 by Priority"),
    "",
    genTopIssues(
      failedAudits.filter((a) => {
        const id = a.id.toLowerCase();
        return id.includes("label") || id.includes("aria") || id.includes("contrast") || id.includes("name");
      }),
      null,
      "Accessibility Issues"
    ),
    "",
    "---",
    "",
    genPatternClusters(failedAudits),
    "",
    "---",
    "",
    genRemediationPriority(failedAudits),
  ].join("\n");

  fs.writeFileSync(OUT_PATH, md, "utf8");
  console.log(`✅ Matrix written to ${OUT_PATH}`);
}

main();
