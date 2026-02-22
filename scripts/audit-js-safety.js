/**
 * audit-js-safety.js
 * Scans JS files in assets/js/core/ and assets/js/modules/ for safety anti-patterns.
 * Outputs a markdown report to docs/output/js-safety-report.md
 *
 * Anti-patterns detected:
 *   1. Fire-and-forget Supabase calls (no error destructuring)
 *   2. Silent catches (empty catch blocks)
 *   3. .single() without .maybeSingle() consideration
 *   4. setInterval without clearInterval
 *
 * Based on: audit-jsdoc.js structure
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = [
  path.join(ROOT, 'assets', 'js', 'core'),
  path.join(ROOT, 'assets', 'js', 'modules'),
];
const OUTPUT = path.join(ROOT, 'docs', 'output', 'js-safety-report.md');

// ── Helpers ──

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

// ── Detectors ──

/**
 * Detect fire-and-forget Supabase calls:
 * Lines with `await window.sb.from(` that do NOT have `const {` or `let {` before them.
 */
function detectFireAndForget(lines) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match lines that await a Supabase call
    if (!/await\s+(?:window\.)?sb\b/.test(line)) continue;
    // Check if it's a mutation (insert, update, delete, upsert, rpc)
    if (!/\.(insert|update|delete|upsert|rpc)\s*\(/.test(line)) continue;
    // Check if result is captured (same line or line above)
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    const combined = prevLine + ' ' + line;
    if (/(?:const|let|var)\s*\{/.test(combined)) continue;
    if (/(?:const|let|var)\s+\w+\s*=/.test(combined)) continue;
    findings.push({ line: i + 1, content: line.substring(0, 120) });
  }
  return findings;
}

/**
 * Detect silent catches: catch blocks that are empty or only have comments.
 */
function detectSilentCatches(lines) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match `} catch {` or `} catch (e) {`
    if (!/}\s*catch\s*(\([^)]*\))?\s*\{/.test(line)) continue;

    // Look at next non-empty lines to see if body is empty or comment-only
    let bodyEmpty = true;
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      const bodyLine = lines[j].trim();
      if (bodyLine === '}') break;
      if (bodyLine === '') continue;
      // Check if it's only a comment
      if (bodyLine.startsWith('//') || bodyLine.startsWith('/*') || bodyLine.startsWith('*')) continue;
      bodyEmpty = false;
      break;
    }
    if (bodyEmpty) {
      findings.push({ line: i + 1, content: line.substring(0, 120) });
    }
  }
  return findings;
}

/**
 * Detect .single() usage (potential PGRST116 risk).
 */
function detectSingleUsage(lines) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/\.single\(\)/.test(line) && !/\.maybeSingle\(\)/.test(line)) {
      findings.push({ line: i + 1, content: line.substring(0, 120) });
    }
  }
  return findings;
}

/**
 * Detect setInterval without corresponding clearInterval in the same file.
 */
function detectUncleanedIntervals(lines, fullContent) {
  const findings = [];
  const hasSetInterval = /setInterval\s*\(/.test(fullContent);
  const hasClearInterval = /clearInterval\s*\(/.test(fullContent);
  const hasBeforeUnload = /beforeunload/.test(fullContent);

  if (hasSetInterval && (!hasClearInterval || !hasBeforeUnload)) {
    for (let i = 0; i < lines.length; i++) {
      if (/setInterval\s*\(/.test(lines[i])) {
        findings.push({
          line: i + 1,
          content: lines[i].trim().substring(0, 120),
          missing: !hasClearInterval ? 'clearInterval' : 'beforeunload listener',
        });
      }
    }
  }
  return findings;
}

// ── Main ──

function main() {
  let allFiles = [];
  for (const dir of SCAN_DIRS) {
    allFiles.push(...walkDir(dir));
  }
  allFiles.sort();

  const totals = { fireForget: 0, silentCatch: 0, single: 0, interval: 0 };
  const fileResults = [];

  for (const file of allFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    const ff = detectFireAndForget(lines);
    const sc = detectSilentCatches(lines);
    const si = detectSingleUsage(lines);
    const iv = detectUncleanedIntervals(lines, content);

    totals.fireForget += ff.length;
    totals.silentCatch += sc.length;
    totals.single += si.length;
    totals.interval += iv.length;

    const total = ff.length + sc.length + si.length + iv.length;
    if (total === 0) continue;

    fileResults.push({ rel, fireForget: ff, silentCatch: sc, single: si, interval: iv, total });
  }

  const grandTotal = totals.fireForget + totals.silentCatch + totals.single + totals.interval;

  // ── Generate Report ──
  const md = [
    '# JS Safety Report',
    '',
    `> Generated: ${new Date().toISOString().split('T')[0]}`,
    `> Scanner: \`scripts/audit-js-safety.js\``,
    '',
    `## Summary`,
    '',
    `| Category | Count | Risk |`,
    `|:--|--:|:--|`,
    `| 🔴 Fire-and-forget mutations | ${totals.fireForget} | Silent data loss |`,
    `| 🔴 Silent catches | ${totals.silentCatch} | Hidden errors |`,
    `| 🟡 .single() usage | ${totals.single} | PGRST116 risk |`,
    `| 🟡 Uncleaned intervals | ${totals.interval} | Memory leak |`,
    `| **Total findings** | **${grandTotal}** | |`,
    '',
  ];

  // Score
  const safetyScore = allFiles.length > 0
    ? Math.max(0, Math.round(100 - (grandTotal / allFiles.length) * 15))
    : 100;
  md.push(`**Safety Score: ${safetyScore}/100** (${allFiles.length} files scanned)`);
  md.push('');

  // Per-file details
  md.push('---');
  md.push('');
  md.push('## Findings by File');
  md.push('');

  // Sort by total findings descending
  fileResults.sort((a, b) => b.total - a.total);

  for (const f of fileResults) {
    md.push(`### \`${f.rel}\` (${f.total} findings)`);
    md.push('');

    if (f.fireForget.length > 0) {
      md.push('**🔴 Fire-and-forget mutations:**');
      for (const item of f.fireForget) {
        md.push(`- L${item.line}: \`${item.content}\``);
      }
      md.push('');
    }
    if (f.silentCatch.length > 0) {
      md.push('**🔴 Silent catches:**');
      for (const item of f.silentCatch) {
        md.push(`- L${item.line}: \`${item.content}\``);
      }
      md.push('');
    }
    if (f.single.length > 0) {
      md.push('**🟡 .single() usage:**');
      for (const item of f.single) {
        md.push(`- L${item.line}: \`${item.content}\``);
      }
      md.push('');
    }
    if (f.interval.length > 0) {
      md.push('**🟡 Uncleaned intervals:**');
      for (const item of f.interval) {
        md.push(`- L${item.line}: \`${item.content}\` (missing: ${item.missing})`);
      }
      md.push('');
    }
  }

  // ── Write ──
  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT, md.join('\n'), 'utf8');

  // ── Console Output ──
  console.log('');
  console.log(`🛡️  JS Safety Scan: ${grandTotal} findings across ${fileResults.length} files`);
  console.log(`   🔴 Fire-and-forget: ${totals.fireForget}`);
  console.log(`   🔴 Silent catches:  ${totals.silentCatch}`);
  console.log(`   🟡 .single() risk:  ${totals.single}`);
  console.log(`   🟡 Interval leaks:  ${totals.interval}`);
  console.log(`   Score: ${safetyScore}/100`);
  console.log(`📄 Report: ${path.relative(ROOT, OUTPUT)}`);
}

main();
