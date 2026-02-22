#!/usr/bin/env node
/**
 * audit-links.js
 * Scans markdown files for broken internal links (file:// and relative paths).
 * Checks that referenced files exist on disk.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_TARGETS = ['README.md', 'state.md', 'ROADMAP.md', 'docs'];

// ── Helpers ──
function walkDir(dir, ext = '.md') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

function extractLinks(content) {
  const links = [];
  // Match markdown links: [text](path) — skip http/https/mailto
  const re = /\[([^\]]*)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const href = m[2].split('#')[0].trim(); // strip anchors
    if (!href) continue;
    if (/^https?:\/\/|^mailto:|^#/.test(href)) continue;
    links.push({ text: m[1], href, offset: m.index });
  }
  return links;
}

// ── Main ──
function main() {
  let files = [];

  for (const target of SCAN_TARGETS) {
    const full = path.join(ROOT, target);
    if (!fs.existsSync(full)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files.push(...walkDir(full));
    } else {
      files.push(full);
    }
  }

  let totalLinks = 0;
  let broken = 0;
  const issues = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const links = extractLinks(content);
    const fileDir = path.dirname(file);

    for (const link of links) {
      totalLinks++;
      let resolved;

      if (link.href.startsWith('file:///')) {
        resolved = link.href.replace('file:///', '');
        // Handle Windows paths
        if (process.platform === 'win32' && /^[a-zA-Z]:/.test(resolved)) {
          // Already absolute
        } else {
          resolved = '/' + resolved;
        }
      } else {
        resolved = path.resolve(fileDir, link.href);
      }

      if (!fs.existsSync(resolved)) {
        broken++;
        const rel = path.relative(ROOT, file).replace(/\\/g, '/');
        issues.push({ file: rel, text: link.text, href: link.href });
      }
    }
  }

  console.log(`\n🔗 Link Audit: ${totalLinks} links scanned, ${broken} broken`);

  if (issues.length > 0) {
    console.log('\n❌ Broken links:');
    for (const i of issues) {
      console.log(`  ${i.file}: [${i.text}](${i.href})`);
    }
  } else {
    console.log('✅ All internal links valid');
  }
}

main();
