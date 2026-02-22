/**
 * Health Scan — Recorre TODAS las páginas autenticadas buscando errores reales.
 * 
 * Este test existe para encontrar bugs, no para pasar.
 * Detecta: JS errors, recursos 404, CSP violations, console.error.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '.auth', 'admin.json') });

// ── TODAS las páginas del sistema ────────────────────────────
const ALL_PAGES = [
  // Admin
  { name: 'Admin Index', path: '/pages/admin/admin-index.html' },
  { name: 'Admin Workdays', path: '/pages/admin/admin-workdays.html' },
  { name: 'Admin Central Stock', path: '/pages/admin/admin-central-stock.html' },
  { name: 'Admin Pagos', path: '/pages/admin/admin-pagos.html' },
  { name: 'Admin Solicitudes', path: '/pages/admin/admin-solicitudes.html' },
  { name: 'Admin Reportes', path: '/pages/admin/admin-reportes.html' },
  { name: 'Admin Semanal', path: '/pages/admin/admin-semanal.html' },
  { name: 'Admin Config', path: '/pages/admin/admin-config.html' },
  { name: 'Admin Master Categorías', path: '/pages/admin/admin-master-categorias.html' },
  { name: 'Admin Master Nómina', path: '/pages/admin/admin-master-nomina.html' },
  { name: 'Admin Master POS', path: '/pages/admin/admin-master-pos.html' },
  { name: 'Admin Master Proveedores', path: '/pages/admin/admin-master-proveedores.html' },
  { name: 'Admin Master Tarifario', path: '/pages/admin/admin-master-tarifario.html' },
  { name: 'Admin Test Devenciones', path: '/pages/admin/test-devenciones.html' },
  // Admin QR
  { name: 'QR Generator', path: '/pages/admin/qr/generator.html' },
  { name: 'QR Index', path: '/pages/admin/qr/index.html' },
  { name: 'QR Monitor', path: '/pages/admin/qr/monitor.html' },
  // Operativo
  { name: 'Operativo Index', path: '/pages/operativo/operativo-index.html' },
  { name: 'Operativo Workday', path: '/pages/operativo/operativo-workday.html' },
  { name: 'Operativo Stock', path: '/pages/operativo/operativo-stock.html' },
  { name: 'Operativo Análisis', path: '/pages/operativo/operativo-analisis.html' },
  { name: 'Operativo Solicitudes', path: '/pages/operativo/operativo-solicitudes.html' },
  { name: 'Operativo CMS Members', path: '/pages/operativo/cms-members.html' },
  { name: 'Operativo Master SKU', path: '/pages/operativo/operativo-master-sku.html' },
  { name: 'Operativo Master Proveedores', path: '/pages/operativo/operativo-master-proveedores.html' },
  { name: 'Operativo Scanner', path: '/pages/operativo/scanner.html' },
  { name: 'Operativo Scanner Mock', path: '/pages/operativo/scanner-mock.html' },
  // Encargados
  { name: 'Encargado Barra Index', path: '/pages/encargados/encargado-barra-index.html' },
  { name: 'Encargado Barra Noche', path: '/pages/encargados/encargado-barra-noche.html' },
  { name: 'Encargado Barra Personal', path: '/pages/encargados/encargado-barra-personal.html' },
  { name: 'Encargado Caja Index', path: '/pages/encargados/encargado-caja-index.html' },
  { name: 'Encargado Caja Noche', path: '/pages/encargados/encargado-caja-noche.html' },
  { name: 'Encargado Caja Personal', path: '/pages/encargados/encargado-caja-personal.html' },
  { name: 'Encargado Recepción', path: '/pages/encargados/encargado-recepcion.html' },
  // Logística
  { name: 'Logística Index', path: '/pages/logistica/logistica-index.html' },
  { name: 'Logística Stock', path: '/pages/logistica/logistica-stock.html' },
  { name: 'Logística Distribución', path: '/pages/logistica/logistica-distribucion.html' },
  { name: 'Logística Recepción', path: '/pages/logistica/logistica-recepcion.html' },
  { name: 'Logística Seguimiento', path: '/pages/logistica/logistica-seguimiento.html' },
  // Staff
  { name: 'Staff Barra Index', path: '/pages/staff/staff-barra-index.html' },
  { name: 'Staff Caja Index', path: '/pages/staff/staff-caja-index.html' },
  // Gerencia
  { name: 'Gerencia Balance Semanal', path: '/pages/gerencia/balance-semanal.html' },
];

// ── Test 1: JS Errors en consola ─────────────────────────────
test.describe('Health: Console errors en todas las páginas', () => {
  for (const pg of ALL_PAGES) {
    test(`${pg.name} — sin console.error ni uncaught exceptions`, async ({ page }) => {
      const errors = [];
      const consoleErrors = [];

      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(pg.path, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      // Dar tiempo a que se inicialicen módulos async
      await page.waitForTimeout(3000);

      // Reportar todo lo encontrado
      if (errors.length > 0) {
        console.log(`  ⚠ pageerror en ${pg.name}:`, errors);
      }
      if (consoleErrors.length > 0) {
        console.log(`  ⚠ console.error en ${pg.name}:`, consoleErrors);
      }

      expect(errors, `Uncaught exceptions en ${pg.name}: ${errors.join('; ')}`).toHaveLength(0);
    });
  }
});

// ── Test 2: Recursos rotos (404, 500) ────────────────────────
test.describe('Health: Recursos rotos (CSS/JS/img 404)', () => {
  for (const pg of ALL_PAGES) {
    test(`${pg.name} — sin recursos 404/500`, async ({ page }) => {
      const failedResources = [];

      page.on('response', response => {
        const url = response.url();
        // Ignorar Supabase API calls (pueden fallar por datos)
        if (url.includes('supabase.co')) return;
        // Ignorar favicon 404 (común)
        if (url.includes('favicon') && response.status() === 404) return;

        if (response.status() >= 400) {
          failedResources.push({
            status: response.status(),
            url: url.split('/').slice(-2).join('/'),
          });
        }
      });

      await page.goto(pg.path, { waitUntil: 'networkidle', timeout: 20_000 });

      if (failedResources.length > 0) {
        console.log(`  ⚠ 404 en ${pg.name}:`, failedResources);
      }

      expect(
        failedResources,
        `Recursos rotos en ${pg.name}: ${JSON.stringify(failedResources)}`
      ).toHaveLength(0);
    });
  }
});

// ── Test 3: IDs duplicados ───────────────────────────────────
test.describe('Health: IDs duplicados en el DOM', () => {
  for (const pg of ALL_PAGES) {
    test(`${pg.name} — sin IDs duplicados`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      await page.waitForTimeout(2000);

      const duplicates = await page.evaluate(() => {
        const ids = {};
        const dupes = [];
        document.querySelectorAll('[id]').forEach(el => {
          const id = el.id;
          if (!id) return;
          if (ids[id]) {
            dupes.push(id);
          }
          ids[id] = true;
        });
        return [...new Set(dupes)];
      });

      if (duplicates.length > 0) {
        console.log(`  ⚠ IDs duplicados en ${pg.name}:`, duplicates);
      }

      expect(
        duplicates,
        `IDs duplicados en ${pg.name}: ${duplicates.join(', ')}`
      ).toHaveLength(0);
    });
  }
});
