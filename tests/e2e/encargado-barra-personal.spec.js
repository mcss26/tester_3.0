/**
 * E2E Tests — Encargado Barra Personal
 * 
 * TDD approach: estas pruebas capturan el comportamiento ESPERADO.
 * Se escriben ANTES de corregir los bugs para que fallen (RED).
 * Luego se corrige el código hasta que pasen (GREEN).
 * 
 * Corre: npx playwright test tests/e2e/encargado-barra-personal.spec.js --headed
 * Con base URL: BASE_URL=http://localhost:3000 npx playwright test tests/e2e/encargado-barra-personal.spec.js
 */
const { test, expect } = require('@playwright/test');

const PAGE_URL = '/pages/encargados/encargado-barra-personal.html';

// ── 1. Smoke: La página carga sin errores JS ────────────────────
test.describe('Smoke: Página carga correctamente', () => {
  test('carga sin errores de consola', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    const response = await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    // Auth guard puede redirigir a login - ambos son ok
    const finalUrl = page.url();
    const isOnPage = finalUrl.includes('encargado-barra-personal');
    const isOnLogin = finalUrl.includes('login.html');
    expect(isOnPage || isOnLogin).toBeTruthy();

    expect(errors).toHaveLength(0);
  });

  test('no tiene recursos rotos (CSS/JS 404)', async ({ page }) => {
    const failedResources = [];
    page.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('supabase')) {
        failedResources.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
    expect(failedResources).toHaveLength(0);
  });
});

// ── 2. DOM: Elementos críticos existen ───────────────────────────
test.describe('DOM: Elementos requeridos por JS', () => {
  test('tiene los 3 estados de página (loading, empty, content)', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    // Estos IDs son referenciados por el JS module
    await expect(page.locator('#page-card-loading')).toBeAttached();
    await expect(page.locator('#page-card-empty')).toBeAttached();
    await expect(page.locator('#module-content')).toBeAttached();
  });

  test('tiene controles principales', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#selectWorkday')).toBeAttached();
    await expect(page.locator('#workdayStatus')).toBeAttached();
    await expect(page.locator('#searchStaff')).toBeAttached();
  });

  test('tiene las dos tabs (convocar, nomina)', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-tab="convocar"]')).toBeAttached();
    await expect(page.locator('[data-tab="nomina"]')).toBeAttached();
    await expect(page.locator('#tabConvocar')).toBeAttached();
    await expect(page.locator('#tabNomina')).toBeAttached();
  });

  test('tiene planning summary y cobertura', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#planningSummary')).toBeAttached();
    await expect(page.locator('#requirementsList')).toBeAttached();
    await expect(page.locator('#coveragePercent')).toBeAttached();
    await expect(page.locator('#convocationList')).toBeAttached();
  });

  test('tiene nomina list y botón agregar', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#nominaList')).toBeAttached();
    await expect(page.locator('#btnAddStaff')).toBeAttached();
  });

  test('tiene role modal con elementos requeridos', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#roleModal')).toBeAttached();
    await expect(page.locator('#roleOptions')).toBeAttached();
    await expect(page.locator('#btn-close-role')).toBeAttached();
    await expect(page.locator('#btnCancelRole')).toBeAttached();
  });

  test('tiene confirm modal con elementos requeridos', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#confirmModal')).toBeAttached();
    await expect(page.locator('#confirmTitle')).toBeAttached();
    await expect(page.locator('#confirmMessage')).toBeAttached();
    await expect(page.locator('#btnConfirm')).toBeAttached();
    await expect(page.locator('#btnCancelConfirm')).toBeAttached();
  });

  test('tiene staff panel con formulario', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#staffPanel')).toBeAttached();
    await expect(page.locator('#staffForm')).toBeAttached();
    await expect(page.locator('#staffName')).toBeAttached();
    await expect(page.locator('#btnSaveStaff')).toBeAttached();
    await expect(page.locator('#btnCloseStaffPanel')).toBeAttached();
    await expect(page.locator('#btnCancelStaff')).toBeAttached();
  });
});

// ── 3. DATA: Queries backend funcionan (estos tests DEBEN FALLAR hoy) ───
test.describe('Data: Backend queries devuelven datos', () => {

  /**
   * BUG #1: loadNomina() filtra con .ilike('role', '%staff%')
   * pero los perfiles existentes tienen roles: admin, encargado_barra, etc.
   * NINGUNO contiene "staff" → query devuelve vacío.
   * 
   * Además, RLS de profiles solo permite read_own_profile (auth.uid() = id),
   * así que encargado_barra solo ve SU perfil, no el de otros.
   * 
   * EXPECTED: La lista de nómina debe mostrar miembros del staff.
   * ACTUAL: Muestra "No hay staff registrado."
   */
  test('nómina tab muestra staff cuando hay registros', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

    // Si redirigió a login, skip
    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Cambiar a tab Nómina
    await page.click('[data-tab="nomina"]');
    await page.waitForTimeout(1000);

    // BUG: Esto FALLA porque loadNomina() devuelve vacío
    const emptyMsg = page.locator('#nominaList td:has-text("No hay staff registrado")');
    await expect(emptyMsg).not.toBeVisible();
  });

  /**
   * BUG #2: La lista de convocatorias está vacía porque 
   * renderConvocations() usa state.staffList que está vacío (misma causa que Bug #1).
   * 
   * EXPECTED: Debería mostrar miembros disponibles para convocar.
   * ACTUAL: Muestra "No se encontraron miembros."
   */
  test('convocatorias muestra staff disponible para convocar', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Esperar a que cargue la data
    await page.waitForTimeout(2000);

    // BUG: Esto FALLA porque staffList está vacío
    const emptyMsg = page.locator('#convocationList .empty-state:has-text("No se encontraron miembros")');
    await expect(emptyMsg).not.toBeVisible();
  });

  /**
   * BUG #3: saveStaff() inserta en profiles con role 'staff_barra'.
   * RLS solo permite INSERT a role 'admin' (profiles_insert_admin).
   * Un encargado_barra NO puede crear staff directamente.
   * 
   * EXPECTED: El botón "+ Nuevo" debería crear staff exitosamente.
   * ACTUAL: La operación falla silenciosamente por RLS.
   */
  test('botón Nuevo abre panel y permite guardar staff', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Cambiar a tab Nómina
    await page.click('[data-tab="nomina"]');
    await page.waitForTimeout(500);

    // Abrir panel
    await page.click('#btnAddStaff');
    await page.waitForTimeout(500);

    // El panel debe ser visible
    await expect(page.locator('#staffPanel')).toHaveClass(/open/);

    // Llenar nombre y guardar
    await page.fill('#staffName', 'Test Staff TDD');
    await page.click('#btnSaveStaff');

    await page.waitForTimeout(2000);

    // BUG: Esperamos toast de éxito, pero RLS bloquea el insert
    // para roles que no sean admin.
    const errorToast = page.locator('.toast-error, .toast:has-text("Error")');
    await expect(errorToast).not.toBeVisible();
  });
});

// ── 4. UI: Tabs y estados funcionan correctamente ────────────────
test.describe('UI: Interacciones básicas', () => {
  test('tabs alternan visibilidad de contenido', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Tab Convocar visible por defecto
    await expect(page.locator('#tabConvocar')).not.toHaveClass(/hidden/);
    await expect(page.locator('#tabNomina')).toHaveClass(/hidden/);

    // Click Nómina
    await page.click('[data-tab="nomina"]');
    await expect(page.locator('#tabNomina')).not.toHaveClass(/hidden/);
    await expect(page.locator('#tabConvocar')).toHaveClass(/hidden/);

    // Click Convocar de vuelta
    await page.click('[data-tab="convocar"]');
    await expect(page.locator('#tabConvocar')).not.toHaveClass(/hidden/);
    await expect(page.locator('#tabNomina')).toHaveClass(/hidden/);
  });

  test('workday selector tiene al menos una opción', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    await page.waitForTimeout(2000);

    // Debe tener "Seleccionar Jornada..." + al menos 1 jornada real
    const options = page.locator('#selectWorkday option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('seleccionar jornada muestra planning summary', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    await page.waitForTimeout(2000);

    // Auto-selecciona la primera jornada, planning summary debe ser visible
    await expect(page.locator('#planningSummary')).not.toHaveClass(/hidden/);
    await expect(page.locator('#requirementsList')).not.toBeEmpty();
  });
});
