import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const OUT = path.resolve('docs/80-ephemeral/agent-logs/visual-audit');

const PAGES = [
  // Admin
  'pages/admin/admin-index.html',
  'pages/admin/admin-workdays.html',
  'pages/admin/admin-solicitudes.html',
  'pages/admin/admin-reportes.html',
  'pages/admin/admin-central-stock.html',
  'pages/admin/admin-config.html',
  'pages/admin/admin-pagos.html',
  'pages/admin/admin-semanal.html',
  'pages/admin/admin-master-categorias.html',
  'pages/admin/admin-master-nomina.html',
  'pages/admin/admin-master-pos.html',
  'pages/admin/admin-master-proveedores.html',
  'pages/admin/admin-master-tarifario.html',
  'pages/admin/admin-workdays.html',
  'pages/admin/qr/generator.html',
  'pages/admin/qr/index.html',
  'pages/admin/qr/monitor.html',
  'pages/admin/test-devenciones.html',
  // Encargados
  'pages/encargados/encargado-barra-index.html',
  'pages/encargados/encargado-barra-noche.html',
  'pages/encargados/encargado-barra-personal.html',
  'pages/encargados/encargado-caja-index.html',
  'pages/encargados/encargado-caja-noche.html',
  'pages/encargados/encargado-caja-personal.html',
  'pages/encargados/encargado-recepcion.html',
  // Gerencia
  'pages/gerencia/balance-semanal.html',
  // Logistica
  'pages/logistica/logistica-index.html',
  'pages/logistica/logistica-distribucion.html',
  'pages/logistica/logistica-recepcion.html',
  'pages/logistica/logistica-seguimiento.html',
  'pages/logistica/logistica-stock.html',
  // Operativo
  'pages/operativo/operativo-index.html',
  'pages/operativo/operativo-analisis.html',
  'pages/operativo/operativo-master-proveedores.html',
  'pages/operativo/operativo-master-sku.html',
  'pages/operativo/operativo-solicitudes.html',
  'pages/operativo/operativo-stock.html',
  'pages/operativo/operativo-workday.html',
  'pages/operativo/cms-members.html',
  'pages/operativo/scanner.html',
  'pages/operativo/scanner-mock.html',
  // Staff
  'pages/staff/staff-barra-index.html',
  'pages/staff/staff-caja-index.html',
  // Prototypes
  'pages/prototypes/lab-balance-semanal/index.html',
  'pages/prototypes/lab-workdays/index.html',
  'pages/prototypes/lab-workdays-night/index.html',
  'pages/prototypes/test-dropdown/index.html',
];

async function run() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Login
  console.log('[LOGIN] Navigating to login...');
  await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input[type="email"], #email', 'admin@midnightclub.com.ar');
  await page.fill('input[type="password"], #password', '28021999');
  await page.click('button[type="submit"], .btn-login, #btn-login');
  await page.waitForTimeout(5000);
  console.log('[LOGIN] Done. Current URL:', page.url());

  // Screenshot each page
  for (const p of PAGES) {
    const name = p.replace(/pages\//g, '').replace(/\//g, '_').replace('.html', '');
    const url = `${BASE}/${p}`;
    try {
      console.log(`[${name}] Navigating...`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(5000);

      const finalUrl = page.url();
      const redirected = !finalUrl.includes(p.replace('.html', ''));

      if (redirected) {
        console.log(`[${name}] REDIRECTED to ${finalUrl} â€” skipping screenshot`);
        continue;
      }

      await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
      console.log(`[${name}] OK â€” saved`);
    } catch (err) {
      console.log(`[${name}] ERROR â€” ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n[DONE] All pages processed.');
}

run().catch(console.error);
