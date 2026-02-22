#!/usr/bin/env node
/**
 * audit-jsdoc.js â€” JSDoc Coverage Auditor
 * 
 * Scans all JS files in assets/js/core/ and assets/js/modules/ (recursive).
 * Reports which exported/public functions have JSDoc comments.
 * 
 * Output:
 *   - Console summary
 *   - docs/80-ephemeral/agent-logs/jsdoc-coverage.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCAN_DIRS = ['assets/js/core', 'assets/js/modules'];
const OUTPUT_DIR = path.resolve(ROOT, 'docs/output');
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'jsdoc-coverage.md');

// â”€â”€â”€ Recursive file walk â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.resolve(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      results.push(...walkDir(full));
    } else if (full.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

// â”€â”€â”€ Patterns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FUNC_PATTERNS = [
  // const name = (...) => | const name = function( | const name = async (
  /^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)\s*=>|function\s*\()/,
  // function name(
  /^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/,
  // Object method: name( or name: function(
  /^\s+(\w+)\s*(?::\s*(?:async\s*)?function\s*\(|\([^)]*\)\s*\{)/,
];

const JSDOC_END = /\*\/\s*$/;
const SKIP_NAMES = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'new', 'else', 'try', 'class', 'constructor', 'get', 'set', 'throw', 'delete', 'typeof', 'void', 'then', 'resolve', 'reject']);

/**
 * Extract functions from a JS file and check JSDoc coverage
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const seen = new Set();
  const functions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of FUNC_PATTERNS) {
      const match = line.match(pattern);
      if (!match || !match[1]) continue;

      const name = match[1];
      if (SKIP_NAMES.has(name) || name.startsWith('_') || seen.has(name)) continue;
      seen.add(name);

      // Check if lines above have JSDoc (/** ... */)
      let hasJSDoc = false;
      for (let j = i - 1; j >= Math.max(0, i - 8); j--) {
        const prev = lines[j].trim();
        if (JSDOC_END.test(lines[j])) { hasJSDoc = true; break; }
        if (prev === '') continue;
        if (prev.startsWith('*') || prev.startsWith('/**') || prev.startsWith('//')) continue;
        break; // Non-comment line â€” stop
      }

      functions.push({ name, line: i + 1, hasJSDoc });
      break;
    }
  }

  return functions;
}

// â”€â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function main() {
  const allFiles = [];

  for (const dir of SCAN_DIRS) {
    const fullDir = path.resolve(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;
    allFiles.push(...walkDir(fullDir));
  }

  if (allFiles.length === 0) {
    console.log('No JS files found.');
    process.exit(0);
  }

  const results = [];
  let totalFuncs = 0;
  let totalDocumented = 0;

  for (const file of allFiles.sort()) {
    const relPath = path.relative(ROOT, file).replace(/\\/g, '/');
    const functions = analyzeFile(file);

    if (functions.length === 0) continue;

    const documented = functions.filter(f => f.hasJSDoc).length;
    const pct = Math.round((documented / functions.length) * 100);

    totalFuncs += functions.length;
    totalDocumented += documented;

    results.push({
      file: relPath,
      functions,
      documented,
      total: functions.length,
      pct,
    });
  }

  const globalPct = totalFuncs > 0 ? Math.round((totalDocumented / totalFuncs) * 100) : 0;

  // â”€â”€â”€ Console Output â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('\n  ========================================');
  console.log('   JSDoc Coverage Audit');
  console.log('  ========================================\n');
  console.log(`  Files scanned:     ${allFiles.length}`);
  console.log(`  With functions:    ${results.length}`);
  console.log(`  Functions found:   ${totalFuncs}`);
  console.log(`  With JSDoc:        ${totalDocumented}`);
  console.log(`  Coverage:          ${globalPct}%\n`);

  // Show files with low coverage
  const lowCoverage = results.filter(r => r.pct < 50).sort((a, b) => a.pct - b.pct);
  if (lowCoverage.length > 0) {
    console.log(`  âš  Files below 50% coverage: ${lowCoverage.length}`);
    for (const r of lowCoverage.slice(0, 15)) {
      console.log(`    ${String(r.pct).padStart(3)}%  ${r.file} (${r.documented}/${r.total})`);
    }
    if (lowCoverage.length > 15) console.log(`    ... and ${lowCoverage.length - 15} more`);
    console.log();
  }

  // â”€â”€â”€ Markdown Output â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const md = [
    '# JSDoc Coverage Report',
    '',
    `> Generated: ${new Date().toISOString().slice(0, 16)}`,
    '',
    '## Summary',
    '',
    '| Metric | Value |',
    '| --- | --- |',
    `| Files scanned | ${allFiles.length} |`,
    `| With functions | ${results.length} |`,
    `| Functions found | ${totalFuncs} |`,
    `| With JSDoc | ${totalDocumented} |`,
    `| **Coverage** | **${globalPct}%** |`,
    '',
    '---',
    '',
    '## Coverage by File',
    '',
    '| Coverage | File | Funcs | Documented |',
    '| --- | --- | --- | --- |',
  ];

  for (const r of results.sort((a, b) => a.pct - b.pct)) {
    const icon = r.pct >= 80 ? 'âœ…' : r.pct >= 50 ? 'ðŸŸ¡' : 'ðŸ”´';
    md.push(`| ${icon} ${r.pct}% | ${r.file} | ${r.total} | ${r.documented} |`);
  }

  // Detail: missing JSDoc
  const needsWork = results.filter(r => r.pct < 100);
  if (needsWork.length > 0) {
    md.push('', '---', '', '## Missing JSDoc', '');
    for (const r of needsWork.sort((a, b) => a.pct - b.pct)) {
      const missing = r.functions.filter(f => !f.hasJSDoc);
      if (missing.length === 0) continue;
      md.push(`### ${r.file}`, '');
      for (const f of missing) {
        md.push(`- \`${f.name}\` (L${f.line})`);
      }
      md.push('');
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, md.join('\n'), 'utf-8');
  console.log(`  Report: docs/80-ephemeral/agent-logs/jsdoc-coverage.md`);
  console.log();
}

main();
