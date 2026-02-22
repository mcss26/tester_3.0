/**
 * Workday Tests — Ciclo de vida de jornadas.
 * Usa sesión autenticada de admin.
 * 
 * NOTA: Estos tests interactúan con datos reales de Supabase.
 * Ejecutar con precaución en producción.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '.auth', 'admin.json') });

test.describe('Workday: Página principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/admin/admin-workdays.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    // Esperar que la página se inicialice (carga datos de Supabase)
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test('muestra tabla o lista de workdays', async ({ page }) => {
    // Esperar que carguen datos
    const table = page.locator('table, .table, [class*="workday"]');
    await expect(table.first()).toBeVisible({ timeout: 10_000 });
  });

  test('tiene elementos interactivos para gestionar jornadas', async ({ page }) => {
    // La UI puede tener: botón crear, calendario, date picker, o controles inline
    const interactiveElements = page.locator(
      'button, input[type="date"], .calendar, [class*="date-picker"], select, [role="button"]'
    );
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('no tiene recursos rotos (CSS/JS/img)', async ({ page }) => {
    const failedResources = [];
    page.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('supabase')) {
        failedResources.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/pages/admin/admin-workdays.html', { waitUntil: 'networkidle' });
    expect(failedResources).toHaveLength(0);
  });
});

test.describe('Workday: Interacciones UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/admin/admin-workdays.html');
    await page.waitForLoadState('networkidle');
  });

  test('click en fecha/jornada abre detalle o modal', async ({ page }) => {
    // Buscar el primer elemento clickeable que parezca una jornada
    const workdayRow = page.locator('tr[data-id], .card[data-id], [data-workday-id], tbody tr').first();
    
    if (await workdayRow.isVisible()) {
      await workdayRow.click();
      // Debería abrir un modal, slide-panel, o navegar a detalle
      await page.waitForTimeout(1000);
      const modalOrPanel = page.locator('.modal, .slide-panel, [class*="modal"], [class*="panel"], [class*="detail"]');
      // Si hay modal/panel visible o si navegó a otra URL, el test pasa
      const hasModal = await modalOrPanel.first().isVisible().catch(() => false);
      const urlChanged = !page.url().includes('admin-workdays.html');
      expect(hasModal || urlChanged).toBeTruthy();
    }
  });
});
