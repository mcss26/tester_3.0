#!/usr/bin/env node
/**
 * inject-csp.js — Inyecta o actualiza el CSP meta tag en todas las páginas HTML.
 * 
 * Policy expandida para cubrir todas las dependencias:
 *   default-src 'self';
 *   script-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://cdn.sheetjs.com;
 *   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
 *   connect-src 'self' https://iyknbgmcnbpvalvsjxjz.supabase.co https://api.emailjs.com;
 *   img-src 'self' data:;
 *   font-src 'self' https://fonts.gstatic.com;
 *   media-src 'self' https://assets.mixkit.co;
 *   frame-src 'none';
 * 
 * Uso: node scripts/inject-csp.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT_DIR, 'pages');
const DRY_RUN = process.argv.includes('--dry-run');

const CSP_TAG = `  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self';
      script-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://cdn.sheetjs.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      connect-src 'self' https://iyknbgmcnbpvalvsjxjz.supabase.co https://api.emailjs.com;
      img-src 'self' data:;
      font-src 'self' https://fonts.gstatic.com;
      media-src 'self' https://assets.mixkit.co;
      frame-src 'none';">`;

function getHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.archive') continue;
      results = results.concat(getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function injectCSP(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

  const cspRegex = /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i;
  const viewportRegex = /(<meta\s+name="viewport"[^>]*>)/i;

  let updated;
  let status;

  if (cspRegex.test(content)) {
    // Update existing CSP
    updated = content.replace(cspRegex, CSP_TAG.trim());
    status = 'updated';
  } else if (viewportRegex.test(content)) {
    // Inject after viewport
    updated = content.replace(viewportRegex, `$1\n${CSP_TAG}`);
    status = 'injected';
  } else {
    // No CSP and no viewport, try to inject in <head>
    const headRegex = /(<head[^>]*>)/i;
    if (headRegex.test(content)) {
      updated = content.replace(headRegex, `$1\n${CSP_TAG}`);
      status = 'injected-head';
    } else {
      console.log(`  ⚠️  ${rel} — No head/viewport meta found, skip`);
      return { status: 'error', file: rel };
    }
  }

  if (updated === content) {
    console.log(`  ⏭️  ${rel} — Sin cambios`);
    return { status: 'no-change', file: rel };
  }

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }

  console.log(`  ✅ ${rel} (${status})`);
  return { status, file: rel };
}

function main() {
  console.log(`🔒 CSP Injection/Update${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log('---');

  // Specific files at root
  const rootFiles = [
    path.join(ROOT_DIR, 'login.html'),
    path.join(ROOT_DIR, 'index.html')
  ].filter(f => fs.existsSync(f));

  // Files in pages/
  const pagesFiles = getHtmlFiles(PAGES_DIR);
  
  const allFiles = [...rootFiles, ...pagesFiles];
  const results = allFiles.map(f => injectCSP(f));

  const injected = results.filter(r => r.status.startsWith('injected')).length;
  const updated = results.filter(r => r.status === 'updated').length;
  const skipped = results.filter(r => r.status === 'no-change').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log('---');
  console.log(`📊 ${injected} injected, ${updated} updated, ${skipped} skipped, ${errors} errors`);
  console.log(`   Total files: ${allFiles.length}`);

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes.');
  }
}

main();
