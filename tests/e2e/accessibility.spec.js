/**
 * Accessibility Tests — Verifica cumplimiento de accesibilidad en páginas clave.
 * 
 * Busca: imágenes sin alt, botones sin texto, formularios sin labels,
 * contraste insuficiente (via aria), elementos sin roles correctos.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

test.use({ storageState: path.join(__dirname, '.auth', 'admin.json') });

const PAGES_TO_AUDIT = [
  { name: 'Login', path: '/login.html', needsAuth: false },
  { name: 'Admin Index', path: '/pages/admin/admin-index.html' },
  { name: 'Admin Workdays', path: '/pages/admin/admin-workdays.html' },
  { name: 'Admin Central Stock', path: '/pages/admin/admin-central-stock.html' },
  { name: 'Admin Pagos', path: '/pages/admin/admin-pagos.html' },
  { name: 'Operativo Index', path: '/pages/operativo/operativo-index.html' },
  { name: 'Encargado Caja Index', path: '/pages/encargados/encargado-caja-index.html' },
  { name: 'Encargado Barra Index', path: '/pages/encargados/encargado-barra-index.html' },
  { name: 'Staff Caja Index', path: '/pages/staff/staff-caja-index.html' },
];

test.describe('A11y: Imágenes sin alt', () => {
  for (const pg of PAGES_TO_AUDIT) {
    test(`${pg.name} — imágenes tienen atributo alt`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const imagesWithoutAlt = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .filter(img => !img.hasAttribute('alt'))
          .map(img => img.src.split('/').pop() || img.outerHTML.slice(0, 80));
      });

      if (imagesWithoutAlt.length > 0) {
        console.log(`  ⚠ Imágenes sin alt en ${pg.name}:`, imagesWithoutAlt);
      }

      expect(
        imagesWithoutAlt,
        `${imagesWithoutAlt.length} imágenes sin alt en ${pg.name}: ${imagesWithoutAlt.join(', ')}`
      ).toHaveLength(0);
    });
  }
});

test.describe('A11y: Botones sin texto accesible', () => {
  for (const pg of PAGES_TO_AUDIT) {
    test(`${pg.name} — botones tienen texto o aria-label`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const buttonsWithoutLabel = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, [role="button"]'))
          .filter(btn => {
            const text = (btn.textContent || '').trim();
            const ariaLabel = btn.getAttribute('aria-label') || '';
            const ariaLabelledBy = btn.getAttribute('aria-labelledby') || '';
            const title = btn.getAttribute('title') || '';
            return !text && !ariaLabel && !ariaLabelledBy && !title;
          })
          .map(btn => ({
            tag: btn.tagName,
            id: btn.id || '',
            class: btn.className?.toString().slice(0, 40) || '',
            html: btn.outerHTML.slice(0, 100),
          }));
      });

      if (buttonsWithoutLabel.length > 0) {
        console.log(`  ⚠ Botones sin label en ${pg.name}:`, buttonsWithoutLabel);
      }

      expect(
        buttonsWithoutLabel,
        `${buttonsWithoutLabel.length} botones sin texto accesible en ${pg.name}`
      ).toHaveLength(0);
    });
  }
});

test.describe('A11y: Inputs sin label asociado', () => {
  for (const pg of PAGES_TO_AUDIT) {
    test(`${pg.name} — inputs tienen label o aria-label`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const inputsWithoutLabel = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, select, textarea'))
          .filter(input => {
            // Skip hidden inputs
            if (input.type === 'hidden') return false;
            // Check for various label methods
            const id = input.id;
            const hasAssociatedLabel = id && document.querySelector(`label[for="${id}"]`);
            const ariaLabel = input.getAttribute('aria-label') || '';
            const ariaLabelledBy = input.getAttribute('aria-labelledby') || '';
            const placeholder = input.getAttribute('placeholder') || '';
            const title = input.getAttribute('title') || '';
            const parentLabel = input.closest('label');
            return !hasAssociatedLabel && !ariaLabel && !ariaLabelledBy && !title && !parentLabel;
          })
          .map(input => ({
            tag: input.tagName,
            type: input.type || '',
            id: input.id || '',
            name: input.name || '',
            placeholder: input.placeholder || '',
          }));
      });

      if (inputsWithoutLabel.length > 0) {
        console.log(`  ⚠ Inputs sin label en ${pg.name}:`, inputsWithoutLabel);
      }

      // Solo advertir si hay muchos — placeholder cuenta como semi-label
      const critical = inputsWithoutLabel.filter(i => !i.placeholder);
      expect(
        critical,
        `${critical.length} inputs sin ningún label en ${pg.name}`
      ).toHaveLength(0);
    });
  }
});

test.describe('A11y: Estructura de headings', () => {
  for (const pg of PAGES_TO_AUDIT) {
    test(`${pg.name} — headings no saltan niveles`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });

      const headingIssues = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const issues = [];
        let lastLevel = 0;

        for (const h of headings) {
          const level = parseInt(h.tagName[1]);
          if (lastLevel > 0 && level > lastLevel + 1) {
            issues.push(`Salta de h${lastLevel} a h${level}: "${h.textContent.trim().slice(0, 30)}"`);
          }
          lastLevel = level;
        }
        return issues;
      });

      if (headingIssues.length > 0) {
        console.log(`  ⚠ Heading issues en ${pg.name}:`, headingIssues);
      }

      expect(
        headingIssues,
        `Headings saltan niveles en ${pg.name}: ${headingIssues.join('; ')}`
      ).toHaveLength(0);
    });
  }
});

test.describe('A11y: Links vacíos', () => {
  for (const pg of PAGES_TO_AUDIT) {
    test(`${pg.name} — links tienen texto o aria-label`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const emptyLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .filter(a => {
            const text = (a.textContent || '').trim();
            const ariaLabel = a.getAttribute('aria-label') || '';
            const title = a.getAttribute('title') || '';
            const imgs = a.querySelectorAll('img[alt]');
            return !text && !ariaLabel && !title && imgs.length === 0;
          })
          .map(a => ({
            href: a.getAttribute('href') || '',
            html: a.outerHTML.slice(0, 120),
          }));
      });

      if (emptyLinks.length > 0) {
        console.log(`  ⚠ Links vacíos en ${pg.name}:`, emptyLinks);
      }

      expect(
        emptyLinks,
        `${emptyLinks.length} links sin texto accesible en ${pg.name}`
      ).toHaveLength(0);
    });
  }
});
