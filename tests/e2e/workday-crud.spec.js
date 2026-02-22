const { test, expect } = require('@playwright/test');
const path = require('path');

// Reutilizar la sesión de administrador
const STORAGE_STATE = path.join(__dirname, '.auth', 'admin.json');

test.describe('Workday Management UI Verification', () => {
  // Aplicar storageState para este set de pruebas
  test.use({ storageState: STORAGE_STATE });

  test.beforeEach(async ({ page }) => {
    // Navegar a la página de gestión de jornadas
    await page.goto('/pages/admin/admin-workdays.html');
    
    // Esperar a que el estado inicial de carga desaparezca si es posible
    // o simplemente esperar a que el contenido principal sea visible
    await page.waitForLoadState('networkidle');
  });

  test('Verificar componentes principales de la UI de Workdays', async ({ page }) => {
    // 1. Verificar Título y Breadcrumb
    await expect(page.locator('.breadcrumb-item.current')).toHaveText('Workdays');
    await expect(page).toHaveTitle(/Jornadas — Midnight/);

    // 2. Verificar Navegación de Fecha (Prev, Next, Today)
    const workdayNav = page.locator('#workday-nav');
    await expect(workdayNav).toBeVisible();
    await expect(page.locator('#btn-prev-day')).toBeVisible();
    await expect(page.locator('#btn-next-day')).toBeVisible();
    await expect(page.locator('#btn-today')).toBeVisible();

    // 3. Verificar Tabs de la Jornada
    const tabs = page.locator('#workday-tabs');
    await expect(tabs).toBeVisible();
    await expect(page.locator('[data-tab="panelPlanner"]')).toBeVisible();
    await expect(page.locator('[data-tab="panelNightChief"]')).toBeVisible();
    await expect(page.locator('[data-tab="panelReport"]')).toBeVisible();

    // 4. Verificar Panel de Planificación (Activo por defecto)
    const planner = page.locator('#panelPlanner');
    await expect(planner).toBeVisible();

    // 5. Verificar Botones de Acción (Crear/Añadir)
    // Nota: Dependiendo de si hay una jornada activa, se verá el panel de planner o el empty state
    const btnNewEvent = page.locator('#btn-new-event');
    const btnNewEmpty = page.locator('#btn-new-empty');
    
    // Al menos uno de los botones para "crear" o "iniciar" algo debe ser detectable (o existir en el DOM)
    // Usamos count() para verificar que existen sin fallar si uno está oculto por el otro
    const createButtonsCount = await btnNewEvent.count() + await btnNewEmpty.count();
    expect(createButtonsCount).toBeGreaterThan(0);

    // 6. Verificar que la tabla de Staff o Contenedor de Staff es visible
    const staffContainer = page.locator('#staff-container');
    await expect(staffContainer).toBeVisible();

    // 7. Verificar que el botón de añadir costo existe
    await expect(page.locator('#btn-add-cost')).toBeAttached();
  });

  test('Verificar visualización de Cierre de Caja (Tab Night Chief)', async ({ page }) => {
    // Cambiar a la pestaña de Night Chief
    await page.locator('[data-tab="panelNightChief"]').click();
    
    // Verificar que el panel de Night Chief es visible
    const nightChiefPanel = page.locator('#panelNightChief');
    await expect(nightChiefPanel).toBeVisible();
    await expect(nightChiefPanel).not.toHaveClass(/hidden/);

    // Verificar la existencia de la tabla de rendición de caja
    const cierreTable = page.locator('#cierre-table-body').locator('xpath=ancestor::table');
    await expect(cierreTable).toBeVisible();
    
    // Verificar encabezados de la tabla (al menos uno característico)
    await expect(cierreTable.locator('th').filter({ hasText: 'Efectivo (Decl)' })).toBeVisible();
  });
});
