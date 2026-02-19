# Midnight Club / FormulaMid

Repositorio de frontend + utilidades de auditoría para módulos operativos (Admin, Operativo, Encargados, Logística, Staff, Members) y assets/migraciones de soporte.

## Quick Start

```bash
npm install
npm run audit:modules
npm run audit:css
npm run audit:pages
npm run audit:links
```

Comando único:

```bash
npm run audit
```

## Scripts

- `npm run audit:modules`: valida reglas base de JS en `assets/js/modules` (`scripts/audit.mjs`).
- `npm run audit:css`: detecta `<style>` e inline styles en `pages/` (`scripts/audit-css.js`).
- `npm run audit:pages`: audita HTML y referencias de assets locales (`scripts/audit-modules.js`).
- `npm run audit:links`: valida links locales en `.md` y `.html` (`scripts/audit-links.js`).
- `npm run extract:recipes -- <input.xlsx> [output-dir]`: genera `excel-items.json` + `insert-recipes.sql` desde un Excel.

## Referencias

- Documentación: [docs/INDEX.md](docs/INDEX.md)
- Estado: [docs/estado-presente.md](docs/estado-presente.md)
- Instrucciones para agentes: [AGENTS.md](AGENTS.md)
