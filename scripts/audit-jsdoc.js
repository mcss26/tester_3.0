#!/usr/bin/env node
/**
 * audit-jsdoc.js
 * Scans JS files in assets/js/core/ and assets/js/modules/ for JSDoc coverage.
 * Outputs a markdown report to docs/80-ephemeral/agent-logs/jsdoc-coverage.md
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = [
  path.join(ROOT, 'assets', 'js', 'core'),
  path.join(ROOT, 'assets', 'js', 'modules'),
];
const OUTPUT = path.join(ROOT, 'docs', 'output', 'jsdoc-coverage.md');

// â”€â”€ Helpers â”€â”€
function walkDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Extracts exported/named functions from a JS file.
 * Matches: function name(, async function name(, const name = (,
 *          const name = async (, exports.name =
 */
function extractFunctions(content) {
  const lines = content.split('\n');
  const fns = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip comment-only lines
    if (line.startsWith('//') || line.startsWith('*')) continue;

    // Match: function name( or async function name(
    const fnMatch = line.match(/(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
    if (fnMatch) {
      const hasJsdoc = hasJsdocAbove(lines, i);
      fns.push({ name: fnMatch[1], line: i + 1, documented: hasJsdoc });
      continue;
    }

    // Match: const/let/var name = (...) => or const name = async (...) =>
    const arrowMatch = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(?/);
    if (arrowMatch && (line.includes('=>') || line.includes('function'))) {
      const hasJsdoc = hasJsdocAbove(lines, i);
      fns.push({ name: arrowMatch[1], line: i + 1, documented: hasJsdoc });
    }
  }

  return fns;
}

function hasJsdocAbove(lines, idx) {
  // Walk backwards looking for */ (end of JSDoc block)
  for (let j = idx - 1; j >= Math.max(0, idx - 3); j--) {
    const prev = lines[j].trim();
    if (prev === '') continue;
    if (prev.endsWith('*/')) return true;
    return false;
  }
  return false;
}

// â”€â”€ Main â”€â”€
function main() {
  let allFiles = [];
  for (const dir of SCAN_DIRS) {
    allFiles.push(...walkDir(dir));
  }
  allFiles.sort();

  let totalFns = 0;
  let totalDocumented = 0;
  const rows = [];

  for (const file of allFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const fns = extractFunctions(content);

    if (fns.length === 0) continue;

    const documented = fns.filter(f => f.documented).length;
    const pct = fns.length > 0 ? Math.round((documented / fns.length) * 100) : 0;
    totalFns += fns.length;
    totalDocumented += documented;

    const undocumented = fns.filter(f => !f.documented).map(f => `\`${f.name}\` (L${f.line})`);

    rows.push({ rel, total: fns.length, documented, pct, undocumented });
  }

  const overallPct = totalFns > 0 ? Math.round((totalDocumented / totalFns) * 100) : 0;

  // â”€â”€ Output â”€â”€
  const lines = [
    '# JSDoc Coverage Report',
    '',
    `> Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    `**Overall: ${totalDocumented}/${totalFns} functions documented (${overallPct}%)**`,
    '',
    '| File | Functions | Documented | Coverage |',
    '|---|---|---|---|',
  ];

  for (const r of rows) {
    const icon = r.pct >= 80 ? 'âœ…' : r.pct >= 50 ? 'âš ï¸' : 'âŒ';
    lines.push(`| \`${r.rel}\` | ${r.total} | ${r.documented} | ${icon} ${r.pct}% |`);
  }

  lines.push('');
  lines.push('## Undocumented Functions');
  lines.push('');

  for (const r of rows) {
    if (r.undocumented.length === 0) continue;
    lines.push(`### \`${r.rel}\``);
    lines.push(r.undocumented.join(', '));
    lines.push('');
  }

  const output = lines.join('\n');

  // Ensure output dir exists
  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(OUTPUT, output, 'utf8');
  console.log(`\nðŸ“Š JSDoc Coverage: ${totalDocumented}/${totalFns} (${overallPct}%)`);
  console.log(`ðŸ“„ Report: ${path.relative(ROOT, OUTPUT)}`);

  // Summary per directory
  const dirs = {};
  for (const r of rows) {
    const dir = path.dirname(r.rel);
    if (!dirs[dir]) dirs[dir] = { total: 0, documented: 0 };
    dirs[dir].total += r.total;
    dirs[dir].documented += r.documented;
  }

  console.log('\nBy directory:');
  for (const [dir, d] of Object.entries(dirs)) {
    const pct = d.total > 0 ? Math.round((d.documented / d.total) * 100) : 0;
    console.log(`  ${dir}: ${d.documented}/${d.total} (${pct}%)`);
  }
}

main();
