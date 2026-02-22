/**
 * Audit Runner — Stock, Cash & Payments Flow Tests
 * 
 * Ejecuta tests SQL contra Supabase y reporta PASS/FAIL.
 * Sin dependencias externas (usa fetch nativo de Node 18+).
 *
 * USO:
 *   node tests/runners/run-audits.mjs                    # Corre todos
 *   node tests/runners/run-audits.mjs --suite stock      # Solo stock
 *   node tests/runners/run-audits.mjs --suite cash       # Solo caja
 *   node tests/runners/run-audits.mjs --suite payments   # Solo pagos
 *
 * ENV (o crear tests/.env):
 *   SUPABASE_URL=https://iyknbgmcnbpvalvsjxjz.supabase.co
 *   SUPABASE_SERVICE_KEY=eyJ...  (service_role, NO anon)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([^#=]+?)\s*=\s*(.+?)\s*$/);
      if (match) process.env[match[1]] = match[2];
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan variables SUPABASE_URL y SUPABASE_SERVICE_KEY');
  console.error('   Crear archivo tests/.env con esas variables');
  process.exit(1);
}

// ── SQL Runner ──────────────────────────────────────────────
async function executeSql(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query })
  });

  // Fallback: use pg_net or direct SQL endpoint
  if (!res.ok) {
    // Use the SQL query endpoint directly
    const sqlRes = await fetch(`${SUPABASE_URL}/pg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ query })
    });
    if (!sqlRes.ok) {
      throw new Error(`SQL Error: ${sqlRes.status} ${await sqlRes.text()}`);
    }
    return sqlRes.json();
  }
  return res.json();
}

// ── Test Suites ─────────────────────────────────────────────
const SUITES = {
  stock: {
    name: '📦 Stock / Bar Flow',
    file: resolve(__dirname, '..', 'sql', 'audit-stock-flow.sql')
  },
  cash: {
    name: '💰 Cash Flow',
    file: resolve(__dirname, '..', 'sql', 'audit-cash-flow.sql')
  },
  payments: {
    name: '💳 Payments Flow',
    file: resolve(__dirname, '..', 'sql', 'audit-payments-flow.sql')
  }
};

// ── Runner ──────────────────────────────────────────────────
async function runSuite(key) {
  const suite = SUITES[key];
  if (!existsSync(suite.file)) {
    console.error(`  ❌ Archivo no encontrado: ${suite.file}`);
    return { passed: 0, failed: 0, skipped: 0 };
  }

  const sql = readFileSync(suite.file, 'utf-8');
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${suite.name}`);
  console.log(`${'═'.repeat(60)}`);

  try {
    const rows = await executeSql(sql);
    let passed = 0, failed = 0, skipped = 0;

    for (const row of rows) {
      const test = row.test || row.Test || Object.values(row)[0];
      const result = row.result || row.Result || Object.values(row)[1];
      const isPass = result?.startsWith('PASS');
      const isFail = result?.startsWith('FAIL');
      const isSkip = result?.startsWith('SKIP');

      const icon = isPass ? '✅' : isFail ? '❌' : '⏭️';
      console.log(`  ${icon} ${test}: ${result}`);

      if (isPass) passed++;
      else if (isFail) failed++;
      else skipped++;
    }

    console.log(`\n  Resultado: ${passed} PASS, ${failed} FAIL, ${skipped} SKIP`);
    return { passed, failed, skipped };

  } catch (err) {
    console.error(`  ❌ Error ejecutando suite: ${err.message}`);
    return { passed: 0, failed: 1, skipped: 0 };
  }
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const suiteArg = args.indexOf('--suite');
  const selectedSuite = suiteArg !== -1 ? args[suiteArg + 1] : null;

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          MIDNIGHT CLUB — DB Audit Runner                ║');
  console.log('║          Testing against: ' + SUPABASE_URL.replace('https://', '').substring(0, 20) + '...          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const suitesToRun = selectedSuite ? [selectedSuite] : Object.keys(SUITES);
  let totalPassed = 0, totalFailed = 0, totalSkipped = 0;

  for (const key of suitesToRun) {
    if (!SUITES[key]) {
      console.error(`❌ Suite desconocida: ${key}. Opciones: ${Object.keys(SUITES).join(', ')}`);
      continue;
    }
    const r = await runSuite(key);
    totalPassed += r.passed;
    totalFailed += r.failed;
    totalSkipped += r.skipped;
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  TOTAL: ${totalPassed} PASS, ${totalFailed} FAIL, ${totalSkipped} SKIP`);
  console.log('═'.repeat(60));

  process.exit(totalFailed > 0 ? 1 : 0);
}

main();
