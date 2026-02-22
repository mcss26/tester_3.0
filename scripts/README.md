# Scripts â€” FormulaMid 4

Indice completo de scripts de automatizacion. Todos se corren desde la raiz del proyecto.

> **ReorganizaciÃ³n 2026-02-21:** Scripts de testing, auditorÃ­a, scanners, watchdogs y collectors fueron movidos a `tests/`. Ver [`tests/` README](#tests-directory) al final.

**17 scripts operativos** en `scripts/` | **22 scripts de QA** en `tests/`

---

## 1. Seguridad

### security-startup.ps1

Checks iniciales al abrir VS Code.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/security-startup.ps1
```

### security-shutdown.ps1

Checks finales al cerrar VS Code. Incluye backup automatico, limpieza de zombie processes, verificacion de secrets en git.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/security-shutdown.ps1
```

### backup-configs.ps1

Backup de archivos de configuracion (.env, credenciales, MCP config) en ZIP con timestamp. Retiene ultimas 5 copias.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-configs.ps1
```

---

## 2. Analisis Estatico y Flujo

### flow-tracer.ps1

Analisis estatico de navegacion y datos. Detecta `data-go` + `<a href>` + `navigateTo()`, clasifica operaciones Supabase como READ/WRITE, cruza flujos entre modulos.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1 -WithAnalysis
```

Output: `docs/80-ephemeral/agent-logs/qa/{fecha}_audit_flow-trace.md`

### context-loader.ps1

Genera un reporte de contexto sobre un tema buscando en 7 fuentes: Knowledge Items, codigo, docs, schema, git history, reportes previos, y conversaciones.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "workdays"
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "stock" -Clipboard
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "cashflow" -Analyze
```

Output: `docs/80-ephemeral/agent-logs/qa/context-{topic}.md`

### doc-mapper.ps1

Escanea todos los `.md` del proyecto, extrae dependencias (links, tablas, vistas, RPCs, archivos) y genera un mapa completo. Opcionalmente invoca Gemini CLI para acciones.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -DryRun
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -SkipCli
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -OnlyCategory modules
```

Output: `docs/80-ephemeral/agent-logs/qa/doc-map.json`, `doc-map-report.md`, `doc-map-actions.md`

---

## 3. UI / Design System (Herramientas)

### ds-fix-hex.ps1

Fase A: reemplaza `#0a0a0f` por `#000000` en meta theme-color. Fase B: genera mapa hex-to-token desde `hardcoded-colors-report.md`.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ds-fix-hex.ps1
```

Output: `docs/80-ephemeral/agent-logs/frontend/hex-to-token-map.md`

### ds-parallel-launch.ps1

Orquestador visual del Design System. Abre Windows Terminal tabs para ejecutar scripts en paralelo con dependencias automaticas. Requiere `wt.exe`.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ds-parallel-launch.ps1
```

### batch-remediation.ps1

Orquesta Gemini CLI en paralelo para generar planes de remediacion UI desde prompts del scanner.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1
powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 -DryRun
powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 -Workers 5
```

Output: `docs/80-ephemeral/agent-logs/ui-scan/{page}/remediation-plan.md`

### db-batch-remediation.ps1

Orquesta Gemini CLI en paralelo para generar migraciones SQL desde prompts de remediacion DB. Limpia markdown residual.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/db-batch-remediation.ps1
powershell -ExecutionPolicy Bypass -File scripts/db-batch-remediation.ps1 -DryRun
```

Output: `supabase/migrations/{timestamp}_{prompt-name}.sql`

---

## 4. Repo Optimization

### repo-optimize.ps1

Lee los 3 JSON de collectors y ejecuta acciones seguras: borrar dirs vacios, duplicados confirmados, cuarentenar orfanos. Log de items que requieren review manual.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repo-optimize.ps1
powershell -ExecutionPolicy Bypass -File scripts/repo-optimize.ps1 -DryRun
```

Output: `docs/80-ephemeral/agent-logs/repo-audit/optimization-report.md`

### repo-parallel-optimize.ps1

Orquestador. Lanza los 3 collectors en paralelo (Windows Terminal), espera `.done` markers, luego ejecuta optimizer y verificacion.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repo-parallel-optimize.ps1 -DryRun
powershell -ExecutionPolicy Bypass -File scripts/repo-parallel-optimize.ps1
```

---

## 5. QA y Verificacion

### workdays-verifier.ps1

Escanea el modulo Workdays en 8 fases progresivas. Cada ciclo analiza algo diferente y acumula hallazgos con score ponderado. Estado persistido en JSON.

**Fases:** Baseline - Deep JS - Deep HTML - Deep CSS - Cross-Module - Supabase - UX Patterns - Summary + Delta

```powershell
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Watch
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Watch -FullScan
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Reset
```

Output: `docs/80-ephemeral/agent-logs/workdays-progressive.md`

---

## 6. Datos y Utilidades

### extract-recipes.js

Extrae recetas de un XLSX y genera JSON + SQL insert para `master_recipes`.

```powershell
node scripts/extract-recipes.js "./docs/important-data-reference/archivo.xlsx"
```

Output: `supabase/migrations/generated/excel-items.json`, `insert-recipes.sql`

### persona_generator.py

Genera user personas data-driven para el dominio nightclub ERP/CRM. 4 perfiles: admin, operativo, logistico, encargado.

```powershell
python scripts/persona_generator.py
python scripts/persona_generator.py admin
python scripts/persona_generator.py operativo json
```

### \_path-check.ps1

Verifica la existencia de paths criticos del proyecto (scripts, workflows, outputs, CSS). Diagnostico rapido.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/_path-check.ps1
```

### auto-prompter.ps1

Envia prompts estrategicos al CLI activo cada N minutos (via SendKeys). Cicla por 10 prompts predefinidos de verificacion y continuacion.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/auto-prompter.ps1
powershell -ExecutionPolicy Bypass -File scripts/auto-prompter.ps1 -IntervalMinutes 10
```

### modularize-css.ps1

Script one-time para modularizar `components.css` en 5 archivos. Ya ejecutado.

---

## Flujo de trabajo recomendado

```text
ABRO VS CODE
  +-- security-startup.ps1              (una vez)

DURANTE LA SESION (4 terminales)
  |-- tests/watchdogs/security-watchdog.ps1 -LogToFile   (siempre corriendo)
  |-- tests/watchdogs/ops-watchdog.ps1                    (siempre corriendo)
  |-- scripts/workdays-verifier.ps1 -Watch                (durante sprints workdays)
  +-- scripts/flow-tracer.ps1                              (cuando quiero auditar flujo)

REPO MAINTENANCE (bajo demanda)
  +-- scripts/repo-parallel-optimize.ps1 -DryRun  (preview + live)

CIERRO VS CODE
  +-- security-shutdown.ps1              (una vez)
```

## Archivos generados

| Script               | Output              | Ubicacion                                       |
| :------------------- | :------------------ | :---------------------------------------------- |
| security-watchdog    | Log diario          | `tests/watchdogs/logs/watchdog-{fecha}.log`     |
| flow-tracer          | Reporte de flujo    | `docs/80-ephemeral/agent-logs/qa/{fecha}_audit_flow-trace.md`    |
| workdays-verifier    | Reporte progresivo  | `docs/80-ephemeral/agent-logs/qa/workdays-progressive.md`        |
| backup-configs       | ZIP de configs      | `scripts/backups/config-backup-{timestamp}.zip` |
| doc-mapper           | Mapa + acciones     | `docs/80-ephemeral/agent-logs/qa/doc-map-*.{json,md}`            |
| ui-component-scanner | Compliance matrix   | `docs/80-ephemeral/agent-logs/ui-scan/compliance-matrix.md`      |
| ds-verify            | Diff report         | `docs/80-ephemeral/agent-logs/ui-scan/verify-diff.md`            |
| repo collectors      | JSON reports        | `docs/80-ephemeral/agent-logs/repo-audit/*.json`                 |
| repo-optimize        | Optimization report | `docs/80-ephemeral/agent-logs/repo-audit/optimization-report.md` |

> `scripts/backups/` esta en `.gitignore`.

---

## Tests Directory

Scripts de QA movidos a `tests/` â€” ver estructura completa:

```text
tests/
â”œâ”€â”€ sql/          3 SQL audits (cash, payments, stock)
â”œâ”€â”€ audits/       5 JS audits (css, jsdoc, links, modules, audit.mjs)
â”œâ”€â”€ scanners/     4 PS1 (ui-component-scanner, ds-verify, ds-pre-audit, select-risk-analyzer)
â”œâ”€â”€ watchdogs/    3 PS1 (ds, ops, security) + logs/
â”œâ”€â”€ runners/      2 (run-audits.mjs, testing-tracker.js)
â”œâ”€â”€ collectors/   3 PS1 (docs, repo, scripts)
â”œâ”€â”€ fixtures/     3 CSVs de test (gbol, extracciones, passline)
â””â”€â”€ .env.example
```

### Comandos rapidos

```powershell
# Auditorias JS
node tests/audits/audit-css.js
node tests/audits/audit-links.js
node tests/audits/audit-modules.js

# Scanner UI
powershell -ExecutionPolicy Bypass -File tests/scanners/ui-component-scanner.ps1
powershell -ExecutionPolicy Bypass -File tests/scanners/ds-verify.ps1

# Watchdogs
powershell -ExecutionPolicy Bypass -File tests/watchdogs/security-watchdog.ps1 -LogToFile
powershell -ExecutionPolicy Bypass -File tests/watchdogs/ops-watchdog.ps1

# SQL Audits
node tests/runners/run-audits.mjs
node tests/runners/run-audits.mjs --suite stock

# Testing tracker
node tests/runners/testing-tracker.js --tickets
```
