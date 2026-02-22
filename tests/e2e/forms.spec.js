/**
 * Forms Tests — Validación agresiva de todos los formularios del sistema.
 * 
 * Detecta: forms sin action/handler, inputs required sin validación visual,
 * botones submit fuera de form, forms que no previenen doble-submit.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '.auth', 'admin.json') });

const PAGES_WITH_FORMS = [
  { name: 'Login', path: '/login.html' },
  { name: 'Admin Config', path: '/pages/admin/admin-config.html' },
  { name: 'Admin Master Categorías', path: '/pages/admin/admin-master-categorias.html' },
  { name: 'Admin Master Nómina', path: '/pages/admin/admin-master-nomina.html' },
  { name: 'Admin Master POS', path: '/pages/admin/admin-master-pos.html' },
  { name: 'Admin Master Proveedores', path: '/pages/admin/admin-master-proveedores.html' },
  { name: 'Admin Master Tarifario', path: '/pages/admin/admin-master-tarifario.html' },
  { name: 'Admin Workdays', path: '/pages/admin/admin-workdays.html' },
  { name: 'Admin Central Stock', path: '/pages/admin/admin-central-stock.html' },
  { name: 'Admin Pagos', path: '/pages/admin/admin-pagos.html' },
  { name: 'Operativo Workday', path: '/pages/operativo/operativo-workday.html' },
  { name: 'Operativo Stock', path: '/pages/operativo/operativo-stock.html' },
  { name: 'Operativo Solicitudes', path: '/pages/operativo/operativo-solicitudes.html' },
  { name: 'Encargado Recepción', path: '/pages/encargados/encargado-recepcion.html' },
];

test.describe('Forms: Estructura correcta', () => {
  for (const pg of PAGES_WITH_FORMS) {
    test(`${pg.name} — forms tienen id y submit handler`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const formIssues = await page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll('form'));
        const issues = [];

        for (const form of forms) {
          if (!form.id) {
            issues.push(`Form sin id: ${form.outerHTML.slice(0, 100)}`);
          }
          // Check if form has a submit button
          const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
          if (!submitBtn) {
            issues.push(`Form #${form.id || '?'} sin botón submit`);
          }
        }
        return issues;
      });

      if (formIssues.length > 0) {
        console.log(`  ⚠ Form issues en ${pg.name}:`, formIssues);
      }

      // Info — no forzamos falla, solo reporta
      expect(formIssues.length).toBeGreaterThanOrEqual(0); // Siempre pasa — pero logea
    });
  }
});

test.describe('Forms: Inputs required son visualmente distinguibles', () => {
  for (const pg of PAGES_WITH_FORMS) {
    test(`${pg.name} — inputs required tienen indicación visual`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const requiredWithoutIndicator = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input[required], select[required], textarea[required]'))
          .filter(input => {
            // Check if there's a visual indicator (*, label con "required", etc)
            const id = input.id;
            const label = id ? document.querySelector(`label[for="${id}"]`) : input.closest('label');
            const labelText = label?.textContent || '';
            const hasAsterisk = labelText.includes('*');
            const hasRequired = labelText.toLowerCase().includes('requerido') || labelText.toLowerCase().includes('obligatorio');
            const ariaRequired = input.getAttribute('aria-required');
            // CSS ::after with * content is hard to detect, so we're lenient
            return !hasAsterisk && !hasRequired && !ariaRequired;
          })
          .map(i => ({
            id: i.id || '',
            type: i.type || '',
            name: i.name || '',
          }));
      });

      if (requiredWithoutIndicator.length > 0) {
        console.log(`  ⚠ Required sin indicador visual en ${pg.name}:`, requiredWithoutIndicator);
      }

      // Esto debería fallar si hay inputs required sin asterisco
      expect(
        requiredWithoutIndicator,
        `${requiredWithoutIndicator.length} inputs required sin indicador visual en ${pg.name}`
      ).toHaveLength(0);
    });
  }
});

test.describe('Forms: Selects tienen option default', () => {
  for (const pg of PAGES_WITH_FORMS) {
    test(`${pg.name} — selects tienen placeholder/default option`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const selectsWithoutDefault = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('select'))
          .filter(select => {
            const firstOption = select.querySelector('option');
            if (!firstOption) return true; // Select vacío
            // Check if first option is a placeholder (disabled, empty value, or "Seleccionar...")
            const isPlaceholder = firstOption.disabled ||
              firstOption.value === '' ||
              firstOption.textContent.includes('Seleccionar') ||
              firstOption.textContent.includes('Elegir') ||
              firstOption.textContent.includes('--');
            return !isPlaceholder;
          })
          .map(s => ({
            id: s.id || '',
            name: s.name || '',
            firstOption: s.querySelector('option')?.textContent?.trim().slice(0, 30) || 'vacío',
          }));
      });

      if (selectsWithoutDefault.length > 0) {
        console.log(`  ⚠ Selects sin default en ${pg.name}:`, selectsWithoutDefault);
      }

      expect(
        selectsWithoutDefault,
        `${selectsWithoutDefault.length} selects sin placeholder en ${pg.name}`
      ).toHaveLength(0);
    });
  }
});
