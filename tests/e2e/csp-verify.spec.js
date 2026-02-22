const { test, expect } = require('@playwright/test');
const path = require('path');

// Reutilizar la sesión de administrador para evitar logins repetidos
const STORAGE_STATE = path.join(__dirname, '.auth', 'admin.json');

const PAGES_TO_CHECK = [
  '/pages/admin/admin-index.html',
  '/pages/operativo/operativo-index.html',
  '/pages/encargados/encargado-barra-index.html',
  '/pages/logistica/logistica-index.html',
  '/pages/staff/staff-caja-index.html',
  '/pages/staff/staff-barra-index.html'
];

test.describe('CSP Verification across HTML pages', () => {
  // Aplicar storageState a nivel de describe para este set de pruebas
  test.use({ storageState: STORAGE_STATE });

  for (const pagePath of PAGES_TO_CHECK) {
    test(`Verificar meta CSP en ${pagePath}`, async ({ page }) => {
      // Navegar a la página
      await page.goto(pagePath);
      
      // Localizar el meta tag de CSP
      // El selector busca un <meta> cuyo http-equiv o name sea Content-Security-Policy (insensible a mayúsculas)
      const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"], meta[name="Content-Security-Policy"]');
      
      // Verificar que el meta tag existe
      await expect(cspMeta).toBeAttached();

      // Leer el atributo content
      const content = await cspMeta.getAttribute('content');
      
      // Verificar directivas requeridas
      expect(content).toContain("default-src 'self'");
      expect(content).toContain("frame-src 'none'");
    });
  }
});
