/**
 * Smoke Tests — Verifican que las páginas clave cargan sin errores.
 * 
 * Corre: npx playwright test tests/e2e/smoke.spec.js
 * Headed: npx playwright test tests/e2e/smoke.spec.js --headed
 */
const { test, expect } = require('@playwright/test');

// ── Páginas que deben cargar sin errores de consola ──────────
const CRITICAL_PAGES = [
  { name: 'Login', path: '/login.html' },
];

const ADMIN_PAGES = [
  { name: 'Admin Workdays', path: '/pages/admin/admin-workdays.html' },
  { name: 'Admin Members', path: '/pages/admin/cms-members.html' },
  { name: 'Admin Cash', path: '/pages/admin/admin-cash.html' },
  { name: 'Admin Stock', path: '/pages/admin/admin-stock.html' },
];

const OPERATIVO_PAGES = [
  { name: 'Operativo Workday', path: '/pages/operativo/operativo-workday.html' },
  { name: 'Operativo Scanner', path: '/pages/operativo/operativo-scanner.html' },
  { name: 'Operativo Stock', path: '/pages/operativo/operativo-stock.html' },
];

// ── Tests ────────────────────────────────────────────────────

test.describe('Smoke: Páginas críticas cargan', () => {
  for (const page of CRITICAL_PAGES) {
    test(`${page.name} carga sin JS errors`, async ({ page: p }) => {
      const errors = [];
      p.on('pageerror', err => errors.push(err.message));

      const response = await p.goto(page.path);
      expect(response?.status()).toBeLessThan(400);
      expect(errors).toHaveLength(0);
    });
  }
});

test.describe('Smoke: Páginas admin cargan', () => {
  for (const page of ADMIN_PAGES) {
    test(`${page.name} carga (puede redirigir a login)`, async ({ page: p }) => {
      const errors = [];
      p.on('pageerror', err => errors.push(err.message));

      const response = await p.goto(page.path, { waitUntil: 'domcontentloaded' });

      // Admin pages may redirect to login (auth guard) — both are ok
      const finalUrl = p.url();
      const isOnPage = finalUrl.includes(page.path);
      const isOnLogin = finalUrl.includes('login.html');
      expect(isOnPage || isOnLogin).toBeTruthy();

      // No JS errors even after redirect
      expect(errors).toHaveLength(0);
    });
  }
});

test.describe('Smoke: Páginas operativo cargan', () => {
  for (const page of OPERATIVO_PAGES) {
    test(`${page.name} carga (puede redirigir a login)`, async ({ page: p }) => {
      const errors = [];
      p.on('pageerror', err => errors.push(err.message));

      const response = await p.goto(page.path, { waitUntil: 'domcontentloaded' });

      const finalUrl = p.url();
      const isOnPage = finalUrl.includes(page.path);
      const isOnLogin = finalUrl.includes('login.html');
      expect(isOnPage || isOnLogin).toBeTruthy();

      expect(errors).toHaveLength(0);
    });
  }
});

test.describe('Smoke: Login page UI elements', () => {
  test('Login tiene campos de email y password', async ({ page }) => {
    await page.goto('/login.html');
    
    // Verificar elementos clave del login
    await expect(page.locator('input[type="email"], input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button').first()).toBeVisible();
  });

  test('Login no tiene links rotos en CSS/JS', async ({ page }) => {
    const failedResources = [];
    page.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('supabase')) {
        failedResources.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/login.html', { waitUntil: 'networkidle' });
    expect(failedResources).toHaveLength(0);
  });
});
