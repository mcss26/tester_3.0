/**
 * Auth Tests — Login flow, credenciales inválidas, redirect por rol.
 */
const { test, expect } = require('@playwright/test');

test.describe('Auth: Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
  });

  test('muestra formulario de login', async ({ page }) => {
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Ingresar');
  });

  test('login con credenciales válidas redirige a admin', async ({ page }) => {
    await page.locator('#email').fill('admin@midnightclub.com.ar');
    await page.locator('#password').fill('28021999');
    await page.locator('button[type="submit"]').click();

    // Botón muestra "Ingresando..." durante la carga
    await expect(page.locator('button[type="submit"]')).toHaveText('Ingresando...');

    // Redirige a admin-index
    await page.waitForURL('**/pages/admin/admin-index.html', { timeout: 15_000 });
    await expect(page).toHaveURL(/admin-index/);
  });

  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.locator('#email').fill('fake@test.com');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Esperar mensaje de error
    const errorMsg = page.locator('#login-error');
    await expect(errorMsg).not.toBeEmpty({ timeout: 10_000 });
    await expect(errorMsg).toContainText('Credenciales incorrectas');

    // El botón vuelve a estado normal
    await expect(page.locator('button[type="submit"]')).toHaveText('Ingresar');
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('campos vacíos muestran error de validación', async ({ page }) => {
    await page.locator('button[type="submit"]').click();

    // El browser debería mostrar validación nativa (required) o nuestro error
    const emailInput = page.locator('#email');
    const isInvalid = await emailInput.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBeTruthy();
  });

  test('toggle staff hint', async ({ page }) => {
    const staffBtn = page.locator('#btn-staff-toggle');
    const staffHint = page.locator('#staff-hint');

    await expect(staffHint).toBeHidden();
    await staffBtn.click();
    await expect(staffHint).toBeVisible();
    await staffBtn.click();
    await expect(staffHint).toBeHidden();
  });
});
