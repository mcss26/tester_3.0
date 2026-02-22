# Domain Agent: Scripts

> Reglas para cualquier agente que trabaje con scripts de tooling dentro de `scripts/`.

## PROJECT STRUCTURE

```text
tester_3.0/
â”œâ”€â”€ AGENTS.md            # Router principal
â”œâ”€â”€ login.html           # Entry point
â”œâ”€â”€ assets/              # CSS, JS, imÃ¡genes â†’ assets/agent.md
â”œâ”€â”€ pages/               # HTML por rol â†’ pages/agent.md
â”œâ”€â”€ scripts/             # â˜… ESTE DOMINIO â€” Tooling
â”œâ”€â”€ supabase/            # Migrations SQL
â”œâ”€â”€ docs/                # DocumentaciÃ³n
â”œâ”€â”€ tests/               # Tests
â”œâ”€â”€ .agent/              # Rules, skills, workflows
â””â”€â”€ .config/             # Configuraciones locales
```

## Estructura

```text
scripts/
â”œâ”€â”€ backups/           # Directorio de backups generados (.gitignore)
â”œâ”€â”€ logs/              # Logs de ejecuciÃ³n (.gitignore)
â”œâ”€â”€ *.ps1              # Scripts PowerShell (seguridad, auditorÃ­a, UI, repo)
â”œâ”€â”€ *.js / *.mjs       # Scripts Node.js (auditorÃ­as de cÃ³digo)
â””â”€â”€ *.py               # Scripts Python (generadores)
```

## Reglas de Dominio

1. **No ejecutar sin confirmaciÃ³n**: Los scripts que modifican estado (backups, security-shutdown, repo-optimize) requieren confirmaciÃ³n explÃ­cita del usuario.
2. **Scripts crÃ­ticos (Tier0)**: `security-watchdog.ps1`, `security-shutdown.ps1`, `security-startup.ps1` â€” No modificar sin plan de regresiÃ³n.
3. **Logs**: Los scripts que generan output deben escribir en `scripts/logs/`.
4. **README**: El [README.md](README.md) documenta cada script en detalle. Mantenerlo sincronizado.
5. **PowerShell rules**: Ver `.gemini/powershell.md` para reglas de ejecuciÃ³n.

## Skills Disponibles

- `security-ops` â€” Seguridad operativa y compliance
- `auditing-workspace` â€” AuditorÃ­a de workspace e higiene

## COMMANDS

### Seguridad

```powershell
powershell -ExecutionPolicy Bypass -File scripts/security-startup.ps1
powershell -ExecutionPolicy Bypass -File scripts/security-watchdog.ps1 [-LogToFile]
powershell -ExecutionPolicy Bypass -File scripts/security-shutdown.ps1
powershell -ExecutionPolicy Bypass -File scripts/backup-configs.ps1
```

### Monitoreo

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ops-watchdog.ps1
powershell -ExecutionPolicy Bypass -File scripts/auto-prompter.ps1 [-IntervalMinutes 10]
```

### AuditorÃ­a de CÃ³digo

```powershell
node scripts/audit.mjs
node scripts/audit-css.js
node scripts/audit-links.js
node scripts/audit-modules.js [--json reports/module-audit.json]
```

### AnÃ¡lisis EstÃ¡tico y Flujo

```powershell
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1 [-WithAnalysis]
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "tema" [-Clipboard] [-Analyze]
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 [-DryRun] [-SkipCli] [-OnlyCategory modules]
powershell -ExecutionPolicy Bypass -File scripts/select-risk-analyzer.ps1
```

### UI / Design System

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ui-component-scanner.ps1 [-TargetPage admin-workdays.html]
powershell -ExecutionPolicy Bypass -File scripts/ds-verify.ps1 [-SaveBaseline] [-SkipScan]
powershell -ExecutionPolicy Bypass -File scripts/ds-pre-audit.ps1
powershell -ExecutionPolicy Bypass -File scripts/ds-fix-hex.ps1
powershell -ExecutionPolicy Bypass -File scripts/ds-parallel-launch.ps1
powershell -ExecutionPolicy Bypass -File scripts/ds-watchdog.ps1
powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 [-DryRun] [-Workers 5]
powershell -ExecutionPolicy Bypass -File scripts/db-batch-remediation.ps1 [-DryRun]
```

### Repo Optimization

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repo-audit-collect.ps1
powershell -ExecutionPolicy Bypass -File scripts/docs-audit-collect.ps1
powershell -ExecutionPolicy Bypass -File scripts/scripts-audit-collect.ps1
powershell -ExecutionPolicy Bypass -File scripts/repo-optimize.ps1 [-DryRun]
powershell -ExecutionPolicy Bypass -File scripts/repo-parallel-optimize.ps1 [-DryRun]
```

### QA y VerificaciÃ³n

```powershell
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 [-Watch] [-FullScan] [-Reset]
node scripts/testing-tracker.js [--tickets] [--open] [--obs]
```

### Datos y Utilidades

```powershell
node scripts/extract-recipes.js "./docs/important-data-reference/archivo.xlsx"
python scripts/persona_generator.py [admin|operativo|logistico|encargado] [json]
powershell -ExecutionPolicy Bypass -File scripts/_path-check.ps1
```

## NAMING CONVENTIONS

| Elemento      | PatrÃ³n                                 | Ejemplo                          |
| :------------ | :------------------------------------- | :------------------------------- |
| Script PS1    | `{verbo}-{sustantivo}.ps1` kebab-case  | `backup-configs.ps1`             |
| Script JS     | `{mÃ³dulo}.js` o `{acciÃ³n}-{target}.js` | `audit-css.js`                   |
| Script Python | `{funciÃ³n}_generator.py` snake_case    | `persona_generator.py`           |
| Logs          | Escribir en `scripts/logs/`            | `scripts/logs/audit-2026-02.log` |
| Backups       | Escribir en `scripts/backups/`         | `scripts/backups/config-*.json`  |

## OUTPUT

| Tipo de output        | UbicaciÃ³n                       |
| :-------------------- | :------------------------------ |
| Logs de ejecuciÃ³n     | `scripts/logs/`                 |
| Backups generados     | `scripts/backups/`              |
| Reportes de auditorÃ­a | `docs/80-ephemeral/agent-logs/qa/`               |
| Reportes UI scan      | `docs/80-ephemeral/agent-logs/ui-scan/`          |
| Reportes repo audit   | `docs/80-ephemeral/agent-logs/repo-audit/`       |
| Reportes frontend gen | `docs/80-ephemeral/agent-logs/frontend/`     |
| Reportes security     | `docs/80-ephemeral/agent-logs/security-ops/` |

## Referencia

- Agente security-ops: [`.agent/agents/security-ops/AGENT.md`](../.agent/agents/security-ops/AGENT.md)
- Agente qa: [`.agent/agents/qa/AGENT.md`](../.agent/agents/qa/AGENT.md)
- README detallado: [`scripts/README.md`](README.md)
- Reglas PowerShell: [`.gemini/powershell.md`](../.gemini/powershell.md)
