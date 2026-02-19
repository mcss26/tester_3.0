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
├── backups/       # Directorio de backups generados
├── logs/          # Logs de ejecución
├── *.ps1          # Scripts PowerShell (auditorías, seguridad, backups)
├── *.js / *.mjs   # Scripts Node.js (auditorías de código)
└── *.py           # Scripts Python (generadores)
```

## Reglas de Dominio

1. **No ejecutar sin confirmación**: Los scripts que modifican estado (backups, security-shutdown) requieren confirmación explícita del usuario.
2. **Scripts críticos**: `security-watchdog.ps1`, `security-shutdown.ps1`, `security-startup.ps1` son Tier0. No modificar sin plan de regresión.
3. **Logs**: Los scripts que generan output deben escribir en `scripts/logs/`.
4. **README**: El [README.md](README.md) documenta el propósito de cada script. Mantenerlo actualizado.

## Skills Disponibles

- `security-ops` — Seguridad operativa y compliance
- `auditing-workspace` — Auditoría de workspace e higiene

## COMMANDS

```bash
# Node.js scripts
npm run audit:modules              # Auditoría de módulos
npm run audit:css                  # Auditoría CSS
npm run audit:links                # Auditoría de links
npm run audit                      # Todas las auditorías
node scripts/testing-tracker.js    # Tracker de testing

# PowerShell scripts (requieren confirmación)
.\scripts\security-watchdog.ps1    # Watchdog de seguridad
.\scripts\backup-configs.ps1       # Backup de configuraciones
.\scripts\flow-tracer.ps1          # Trazador de flujos

# Python scripts
python scripts/persona_generator.py  # Generador de personas UX
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

| Tipo de output        | Ubicación             |
| :-------------------- | :-------------------- |
| Logs de ejecución     | `scripts/logs/`       |
| Backups generados     | `scripts/backups/`    |
| Reportes de auditoría | `docs/_generated/qa/` |

## Referencia

- Agente security-ops: [`.agent/agents/security-ops/AGENT.md`](../.agent/agents/security-ops/AGENT.md)
- Agente qa: [`.agent/agents/qa/AGENT.md`](../.agent/agents/qa/AGENT.md)
