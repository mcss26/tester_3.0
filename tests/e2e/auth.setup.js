/**
 * Auth Setup — Genera storageState reutilizable para tests que necesitan login.
 * 
 * Playwright guarda cookies/localStorage y los reutiliza en otros tests,
 * evitando re-login en cada test.
 * 
 * Corre automáticamente como setup project antes de los demás tests.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '.auth', 'admin.json');

// Credentials — en producción usar env vars
const ADMIN_EMAIL = process.env.TEST_EMAIL || 'admin@midnightclub.com.ar';
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || '28021999';

test('login como admin y guardar sesión', async ({ page }) => {
  // 1. Ir al login
  await page.goto('/login.html');
  await expect(page.locator('#login-form')).toBeVisible();

  // 2. Llenar credenciales
  await page.locator('#email').fill(ADMIN_EMAIL);
  await page.locator('#password').fill(ADMIN_PASSWORD);

  // 3. Submit
  await page.locator('button[type="submit"]').click();

  // 4. Esperar redirect a admin-index (con timeout generoso para Supabase)
  await page.waitForURL('**/pages/admin/admin-index.html', { timeout: 15_000 });

  // 5. Verificar que estamos en admin
  await expect(page).toHaveURL(/admin-index/);

  // 6. Guardar session state para reutilizar
  await page.context().storageState({ path: AUTH_FILE });
});
