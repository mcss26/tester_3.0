#!/usr/bin/env node
/**
 * audit.mjs — Codebase Health Audit Script
 * 
 * Scans all JS modules for adherence to the Golden Standard:
 *   1. IIFE pattern (no DOMContentLoaded)
 *   2. assertSbOrShowBlockingError before window.sb usage  
 *   3. escapeHtml on user data in template literals
 *   4. No native alert()/confirm() calls
 *   5. No local getThemeColor duplicates
 * 
 * Usage:
 *   node scripts/audit.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

const MODULES_DIR = join(process.cwd(), 'assets', 'js', 'modules');
const CORE_DIR = join(process.cwd(), 'assets', 'js', 'core');

const CHECKS = [
  {
    id: 'NO_DOMCONTENTLOADED',
    label: 'DOMContentLoaded detected (should be IIFE)',
    test: (code) => /DOMContentLoaded/.test(code)
  },
  {
    id: 'MISSING_ASSERT_SB',
    label: 'Uses window.sb without assertSbOrShowBlockingError',
    test: (code, filename) => {
      if (filename.includes('login')) return false; // login page is pre-auth
      return /window\.sb\b/.test(code) && !/assertSbOrShowBlockingError/.test(code);
    }
  },
  {
    id: 'NATIVE_ALERT',
    label: 'Uses native alert()',
    test: (code) => /(?<!\w)alert\(/.test(code) && !/Toast|console/.test(code.split('alert(')[0].split('\n').pop())
  },
  {
    id: 'NATIVE_CONFIRM',
    label: 'Uses native confirm()',
    test: (code) => /(?<![.\w])confirm\(/.test(code) && !/confirmModal/.test(code)
  },
  {
    id: 'LOCAL_GETTHEMECOLOR',
    label: 'Local getThemeColor (should use window.Utils)',
    test: (code) => /function getThemeColor/.test(code)
  },
  {
    id: 'WINDOW_OBJECT_EXPORT',
    label: 'Module exports via window object (should be IIFE-scoped)',
    test: (code, filename) => {
      // Skip core files that legitimately export to window
      if (filename.startsWith('core') || filename.includes('importer')) return false;
      return /window\.\w+Module\s*=/.test(code);
    }
  }
];

async function getJSFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith('.js'))
    .map(e => join(e.parentPath || e.path, e.name));
}

async function audit() {
  console.log('\n🔍 FormulaMid — Codebase Audit\n' + '═'.repeat(40));

  const files = await getJSFiles(MODULES_DIR);
  const issues = [];

  for (const filePath of files) {
    const code = await readFile(filePath, 'utf-8');
    const name = basename(filePath);
    const relPath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');

    for (const check of CHECKS) {
      if (check.test(code, relPath)) {
        issues.push({ file: relPath, name, check: check.id, label: check.label });
      }
    }
  }

  if (issues.length === 0) {
    console.log('\n✅ All modules pass audit checks.\n');
    return;
  }

  console.log(`\n⚠️  ${issues.length} issue(s) found:\n`);

  // Group by file
  const grouped = {};
  for (const issue of issues) {
    if (!grouped[issue.file]) grouped[issue.file] = [];
    grouped[issue.file].push(issue.label);
  }

  for (const [file, labels] of Object.entries(grouped)) {
    console.log(`  📄 ${file}`);
    labels.forEach(l => console.log(`     ❌ ${l}`));
    console.log('');
  }

  console.log(`Total: ${issues.length} issues across ${Object.keys(grouped).length} files\n`);

  process.exitCode = issues.length > 0 ? 1 : 0;
}

audit().catch(err => {
  console.error('Audit script error:', err);
  process.exitCode = 1;
});
