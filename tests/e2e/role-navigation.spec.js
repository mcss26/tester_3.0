/**
 * Role Navigation Tests — Verifica que admin puede navegar a los módulos de cada rol.
 * 
 * Dado que admin tiene acceso a todos los roles, estos tests verifican:
 * 1. Que las páginas de cada módulo cargan correctamente con sesión admin
 * 2. Que los launchers de cada rol son accesibles
 * 3. Que no hay errores JS al navegar entre módulos
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '.auth', 'admin.json');

test.use({ storageState: AUTH_FILE });

// ── Operativo Module ──────────────────────────────────────────────────
test.describe('Módulo Operativo (navegación admin)', () => {
  test('operativo-index carga correctamente', async ({ page }) => {
    await page.goto('/pages/operativo/operativo-index.html');
    await expect(page.locator('.dashboard-title')).toBeVisible();
    await expect(page.locator('.main-nav')).toBeVisible();
  });

  test('operativo-workday carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/operativo/operativo-workday.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('operativo-stock carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/operativo/operativo-stock.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('operativo-solicitudes carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/operativo/operativo-solicitudes.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('operativo nav links apuntan a rutas válidas', async ({ page }) => {
    await page.goto('/pages/operativo/operativo-index.html');
    const links = page.locator('.main-nav .nav-link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toContain('undefined');
    }
  });
});

// ── Encargado Barra Module ────────────────────────────────────────────
test.describe('Módulo Encargado Barra (navegación admin)', () => {
  test('encargado-barra-index carga correctamente', async ({ page }) => {
    await page.goto('/pages/encargados/encargado-barra-index.html');
    await expect(page.locator('.dashboard-title')).toBeVisible();
  });

  test('encargado-barra-noche carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/encargados/encargado-barra-noche.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('encargado-barra-personal carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/encargados/encargado-barra-personal.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });
});

// ── Encargado Caja Module ─────────────────────────────────────────────
test.describe('Módulo Encargado Caja (navegación admin)', () => {
  test('encargado-caja-index carga correctamente', async ({ page }) => {
    await page.goto('/pages/encargados/encargado-caja-index.html');
    await expect(page.locator('.dashboard-title')).toBeVisible();
  });

  test('encargado-caja-noche carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/encargados/encargado-caja-noche.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('encargado-caja-personal carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/encargados/encargado-caja-personal.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });
});

// ── Staff Module ──────────────────────────────────────────────────────
test.describe('Módulo Staff (navegación admin)', () => {
  test('staff-caja-index carga correctamente', async ({ page }) => {
    await page.goto('/pages/staff/staff-caja-index.html');
    await expect(page.locator('body')).toBeVisible();
  });

  test('staff-barra-index carga correctamente', async ({ page }) => {
    await page.goto('/pages/staff/staff-barra-index.html');
    await expect(page.locator('body')).toBeVisible();
  });
});

// ── Logística Module ──────────────────────────────────────────────────
test.describe('Módulo Logística (navegación admin)', () => {
  test('logistica-index carga correctamente', async ({ page }) => {
    await page.goto('/pages/logistica/logistica-index.html');
    await expect(page.locator('.dashboard-title')).toBeVisible();
  });

  test('logistica-stock carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/logistica/logistica-stock.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('logistica-distribucion carga sin errores JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/pages/logistica/logistica-distribucion.html');
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });
});

// ── Gerencia Module ───────────────────────────────────────────────────
test.describe('Módulo Gerencia (navegación admin)', () => {
  test('balance-semanal carga correctamente', async ({ page }) => {
    await page.goto('/pages/gerencia/balance-semanal.html');
    await expect(page.locator('body')).toBeVisible();
  });
});
