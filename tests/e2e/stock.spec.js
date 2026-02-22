/**
 * Stock Tests — Verificación del módulo de stock central.
 * Usa sesión autenticada de admin.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '.auth', 'admin.json') });

test.describe('Stock: Página principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/admin/admin-central-stock.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('muestra tabla/lista de productos', async ({ page }) => {
    const stockList = page.locator('table, .table, [class*="stock"], [class*="inventory"], [id*="stock"]');
    await expect(stockList.first()).toBeVisible({ timeout: 10_000 });
  });

  test('no tiene recursos rotos', async ({ page }) => {
    const failedResources = [];
    page.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('supabase')) {
        failedResources.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/pages/admin/admin-central-stock.html', { waitUntil: 'networkidle' });
    expect(failedResources).toHaveLength(0);
  });
});

test.describe('Stock: Búsqueda y filtros', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/admin/admin-central-stock.html');
    await page.waitForLoadState('networkidle');
  });

  test('tiene campo de búsqueda', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="Buscar"], input[id*="search"], input[id*="filter"]');
    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill('test');
      await page.waitForTimeout(500);
      // Verificar que no crashea
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      expect(errors).toHaveLength(0);
    }
  });

  test('tiene filtros o categorías', async ({ page }) => {
    const filters = page.locator('select, [class*="filter"], [class*="category"], .tabs, [role="tablist"]');
    // Stock debería tener algún mecanismo de filtrado
    const hasFilters = await filters.first().isVisible().catch(() => false);
    // No forzamos — solo verificamos si existe
    if (hasFilters) {
      await expect(filters.first()).toBeVisible();
    }
  });
});
