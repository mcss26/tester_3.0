# Domain Agent: Scripts

> Reglas para cualquier agente que trabaje con scripts de tooling dentro de `scripts/`.

## PROJECT STRUCTURE

```text
tester_3.0/
├── AGENTS.md            # Router principal
├── login.html           # Entry point
├── assets/              # CSS, JS, imágenes → assets/agent.md
├── pages/               # HTML por rol → pages/agent.md
├── scripts/             # ★ ESTE DOMINIO — Tooling
├── supabase/            # Migrations SQL
├── docs/                # Documentación
├── tests/               # Tests
├── .agent/              # Rules, skills, workflows
└── .config/             # Configuraciones locales
```

## Estructura

```text
scripts/
├── backups/           # Directorio de backups generados (.gitignore)
├── logs/              # Logs de ejecución (.gitignore)
├── *.ps1              # Scripts PowerShell (seguridad, auditoría, UI, repo)
├── *.js / *.mjs       # Scripts Node.js (auditorías de código)
└── *.py               # Scripts Python (generadores)
```

## Reglas de Dominio

1. **No ejecutar sin confirmación**: Los scripts que modifican estado (backups, security-shutdown, repo-optimize) requieren confirmación explícita del usuario.
2. **Scripts críticos (Tier0)**: `security-watchdog.ps1`, `security-shutdown.ps1`, `security-startup.ps1` — No modificar sin plan de regresión.
3. **Logs**: Los scripts que generan output deben escribir en `scripts/logs/`.
4. **README**: El [README.md](README.md) documenta cada script en detalle. Mantenerlo sincronizado.
5. **PowerShell rules**: Ver `.gemini/powershell.md` para reglas de ejecución.

## Skills Disponibles

- `security-ops` — Seguridad operativa y compliance
- `auditing-workspace` — Auditoría de workspace e higiene

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

### Auditoría de Código

```powershell
node scripts/audit.mjs
node scripts/audit-css.js
node scripts/audit-links.js
node scripts/audit-modules.js [--json reports/module-audit.json]
```

### Análisis Estático y Flujo

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

### QA y Verificación

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

| Elemento      | Patrón                                 | Ejemplo                          |
| :------------ | :------------------------------------- | :------------------------------- |
| Script PS1    | `{verbo}-{sustantivo}.ps1` kebab-case  | `backup-configs.ps1`             |
| Script JS     | `{módulo}.js` o `{acción}-{target}.js` | `audit-css.js`                   |
| Script Python | `{función}_generator.py` snake_case    | `persona_generator.py`           |
| Logs          | Escribir en `scripts/logs/`            | `scripts/logs/audit-2026-02.log` |
| Backups       | Escribir en `scripts/backups/`         | `scripts/backups/config-*.json`  |

## OUTPUT

| Tipo de output        | Ubicación                       |
| :-------------------- | :------------------------------ |
| Logs de ejecución     | `scripts/logs/`                 |
| Backups generados     | `scripts/backups/`              |
| Reportes de auditoría | `docs/output/qa/`               |
| Reportes UI scan      | `docs/output/ui-scan/`          |
| Reportes repo audit   | `docs/output/repo-audit/`       |
| Reportes frontend gen | `docs/_generated/frontend/`     |
| Reportes security     | `docs/_generated/security-ops/` |

## Referencia

- Agente security-ops: [`.agent/agents/security-ops/AGENT.md`](../.agent/agents/security-ops/AGENT.md)
- Agente qa: [`.agent/agents/qa/AGENT.md`](../.agent/agents/qa/AGENT.md)
- README detallado: [`scripts/README.md`](README.md)
- Reglas PowerShell: [`.gemini/powershell.md`](../.gemini/powershell.md)
