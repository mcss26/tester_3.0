#!/usr/bin/env node
/**
 * Audits HTML modules/pages for structural health:
 * - Missing local asset references (script/link/img)
 * - Inline style usage
 * - Basic metadata (title, role attributes, css/js counts)
 *
 * Usage:
 *   node scripts/audit-modules.js
 *   node scripts/audit-modules.js --json reports/module-audit.json
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const PAGES_DIR = path.join(ROOT, "pages");
const ROOT_HTML = ["index.html", "login.html"];

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkHtml(full));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function isExternalRef(ref) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(ref);
}

function normalizeRef(rawRef) {
  if (!rawRef) return "";
  return rawRef.trim().split("#")[0].split("?")[0];
}

function resolveRef(fromFile, href) {
  if (href.startsWith("/")) {
    return path.join(ROOT, href.slice(1));
  }
  return path.resolve(path.dirname(fromFile), href);
}

function collectRefs(html, fromFile) {
  const refs = [];
  const rx = /<(script|link|img)\b[^>]*?\b(?:src|href)=["']([^"']+)["'][^>]*>/gi;
  for (const m of html.matchAll(rx)) {
    const tag = m[1].toLowerCase();
    const raw = m[2];
    const ref = normalizeRef(raw);
    if (!ref || isExternalRef(ref)) continue;
    refs.push({
      tag,
      raw,
      target: resolveRef(fromFile, ref),
    });
  }
  return refs;
}

function auditFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const references = collectRefs(html, filePath);
  const missingRefs = references
    .filter((r) => !fs.existsSync(r.target))
    .map((r) => ({
      tag: r.tag,
      ref: r.raw,
      target: rel(r.target),
    }));

  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() || "(sin título)";
  const roles = html.match(/data-allowed-roles=["']([^"']+)["']/i)?.[1] || "";

  return {
    file: rel(filePath),
    title,
    roles,
    sizeKB: +(html.length / 1024).toFixed(1),
    cssCount: (html.match(/<link[^>]+stylesheet/gi) || []).length,
    jsCount: (html.match(/<script[^>]*src=/gi) || []).length,
    inlineStyles: (html.match(/\sstyle=["'][^"']+["']/gi) || []).length,
    inlineOnclick: (html.match(/\sonclick=["'][^"']+["']/gi) || []).length,
    hasTopbar: /class=["'][^"']*\btopbar\b/i.test(html),
    hasSlidePanel: /\bslide-panel\b|initSlidePanel/i.test(html),
    missingRefs,
  };
}

function parseArgs(argv) {
  const args = { json: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--json" && argv[i + 1]) {
      args.json = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function writeJsonReport(outPath, results) {
  const absolute = path.isAbsolute(outPath) ? outPath : path.join(ROOT, outPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(
    absolute,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        pages: results,
      },
      null,
      2
    ),
    "utf8"
  );
  return rel(absolute);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const pageFiles = walkHtml(PAGES_DIR);
  const rootFiles = ROOT_HTML.map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f));
  const htmlFiles = [...pageFiles, ...rootFiles];
  const results = htmlFiles.map(auditFile);

  const missing = [];
  for (const page of results) {
    for (const ref of page.missingRefs) {
      missing.push({
        file: page.file,
        tag: ref.tag,
        ref: ref.ref,
        target: ref.target,
      });
    }
  }

  const withInlineStyles = results.filter((r) => r.inlineStyles > 0).length;
  const withInlineOnclick = results.filter((r) => r.inlineOnclick > 0).length;

  console.log(`Pages audited: ${results.length}`);
  console.log(`Missing local references: ${missing.length}`);
  console.log(`Pages with inline style: ${withInlineStyles}`);
  console.log(`Pages with inline onclick: ${withInlineOnclick}`);

  if (missing.length > 0) {
    console.log("\nMissing refs:");
    for (const issue of missing) {
      console.log(`- ${issue.file} -> ${issue.tag}:${issue.ref} [${issue.target}]`);
    }
  }

  if (args.json) {
    const reportPath = writeJsonReport(args.json, results);
    console.log(`\nJSON report: ${reportPath}`);
  }

  process.exitCode = missing.length > 0 ? 1 : 0;
}

main();
