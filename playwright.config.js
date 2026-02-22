// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * FormulaMid 4 — Playwright E2E Configuration
 * 
 * Usa Live Server (5501) o npx serve.
 * Ajustá BASE_URL según tu setup:
 *   - Live Server:  http://127.0.0.1:5501
 *   - npx serve .:  http://localhost:3000
 * 
 * Auth: El proyecto "setup" hace login real contra Supabase y
 * guarda la sesión en tests/e2e/.auth/admin.json.
 * Los demás proyectos reusan esa sesión.
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'tests/e2e/report' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5501',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    // 1. Setup: login y guardar sesión
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },
    // 2. Smoke tests (sin auth)
    {
      name: 'smoke',
      testMatch: /smoke\.spec\.js/,
    },
    // 3. Auth tests (propios de login — no necesitan setup)
    {
      name: 'auth',
      testMatch: /auth\.spec\.js/,
    },
    // 4. Tests autenticados (dependen de setup)
    {
      name: 'authenticated',
      testMatch: /^(?!smoke|auth\.).*\.spec\.js$/,
      dependencies: ['setup'],
    },
  ],
});
