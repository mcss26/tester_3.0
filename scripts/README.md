# Scripts — FormulaMid 4

Indice completo de scripts de automatizacion. Todos se corren desde la raiz del proyecto.

**31 scripts** | PowerShell (.ps1) + Node (.js/.mjs) + Python (.py)

---

## 1. Seguridad

### security-startup.ps1

Checks iniciales al abrir VS Code.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/security-startup.ps1
```

### security-watchdog.ps1

Monitoreo continuo de seguridad (cada 60s). Detecta: permisos, integridad SHA-256, archivos sospechosos, git leaks, patrones peligrosos, agentes rogue, procesos sospechosos, MCP servers desconocidos.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/security-watchdog.ps1
powershell -ExecutionPolicy Bypass -File scripts/security-watchdog.ps1 -LogToFile
```

**Ctrl+C** para resumen de sesion.

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

## 2. Monitoreo

### ops-watchdog.ps1

Torre de control operativa (cada 90s). Monitorea: actividad reciente, docs de agentes, estado git, cobertura de documentacion.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ops-watchdog.ps1
```

**Ctrl+C** para detener.

### auto-prompter.ps1

Envia prompts estrategicos al CLI activo cada N minutos (via SendKeys). Cicla por 10 prompts predefinidos de verificacion y continuacion.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/auto-prompter.ps1
powershell -ExecutionPolicy Bypass -File scripts/auto-prompter.ps1 -IntervalMinutes 10
```

---

## 3. Auditoria de Codigo

Scripts que verifican salud del codebase (JS, HTML, CSS, links).

### audit.mjs

Audita modulos JS contra el Golden Standard: patron IIFE, assertSb, escapeHtml, alert/confirm nativos, getThemeColor duplicados.

```powershell
node scripts/audit.mjs
```

### audit-css.js

Detecta `<style>` tags e inline `style=` en HTML.

```powershell
node scripts/audit-css.js
```

### audit-links.js

Audita links locales rotos en archivos `.md` y `.html`.

```powershell
node scripts/audit-links.js
```

### audit-modules.js

Audita estructura de paginas HTML: assets faltantes, inline styles, metadata, topbar, slide-panel.

```powershell
node scripts/audit-modules.js
node scripts/audit-modules.js --json reports/module-audit.json
```

---

## 4. Analisis Estatico y Flujo

### flow-tracer.ps1

Analisis estatico de navegacion y datos. Detecta `data-go` + `<a href>` + `navigateTo()`, clasifica operaciones Supabase como READ/WRITE, cruza flujos entre modulos.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1 -WithAnalysis
```

Output: `docs/output/qa/{fecha}_audit_flow-trace.md`

### context-loader.ps1

Genera un reporte de contexto sobre un tema buscando en 7 fuentes: Knowledge Items, codigo, docs, schema, git history, reportes previos, y conversaciones.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "workdays"
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "stock" -Clipboard
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "cashflow" -Analyze
```

Output: `docs/output/qa/context-{topic}.md`

### doc-mapper.ps1

Escanea todos los `.md` del proyecto, extrae dependencias (links, tablas, vistas, RPCs, archivos) y genera un mapa completo. Opcionalmente invoca Gemini CLI para acciones.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -DryRun
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -SkipCli
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -OnlyCategory modules
```

Output: `docs/output/qa/doc-map.json`, `doc-map-report.md`, `doc-map-actions.md`

### select-risk-analyzer.ps1

Traza cada `<select>` en HTML a traves de JS hasta operaciones Supabase. Genera reporte de riesgo por pagina para decidir entre wrap vs replace.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/select-risk-analyzer.ps1
```

Output: `docs/output/ui-scan/select-risk-report.md`

---

## 5. UI / Design System

### ui-component-scanner.ps1

Escanea todas las paginas HTML, extrae componentes, mide compliance contra el Golden Standard. Genera JSON por pagina, matriz de compliance, y prompts CLI para remediacion.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ui-component-scanner.ps1
powershell -ExecutionPolicy Bypass -File scripts/ui-component-scanner.ps1 -TargetPage admin-workdays.html
```

Output: `docs/output/ui-scan/compliance-matrix.md`, `pages/*.json`, `cli-prompts/*.md`

### ds-verify.ps1

Post-component verification. Ejecuta ui-component-scanner, compara summary.json contra baseline.json, detecta regresiones en Tier0.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ds-verify.ps1
powershell -ExecutionPolicy Bypass -File scripts/ds-verify.ps1 -SaveBaseline
powershell -ExecutionPolicy Bypass -File scripts/ds-verify.ps1 -SkipScan
```

Output: `docs/output/ui-scan/verify-diff.md`

### ds-pre-audit.ps1

Ejecuta 5 comandos Gemini CLI en secuencia: inventario tokens, inventario swiss-style, diff de tokens, inventario componentes, hex hardcodeados.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ds-pre-audit.ps1
```

Output: `docs/_generated/frontend/*.md`

### ds-fix-hex.ps1

Fase A: reemplaza `#0a0a0f` por `#000000` en meta theme-color. Fase B: genera mapa hex-to-token desde `hardcoded-colors-report.md`.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ds-fix-hex.ps1
```

Output: `docs/_generated/frontend/hex-to-token-map.md`

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

Output: `docs/output/ui-scan/{page}/remediation-plan.md`

### db-batch-remediation.ps1

Orquesta Gemini CLI en paralelo para generar migraciones SQL desde prompts de remediacion DB. Limpia markdown residual.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/db-batch-remediation.ps1
powershell -ExecutionPolicy Bypass -File scripts/db-batch-remediation.ps1 -DryRun
```

Output: `supabase/migrations/{timestamp}_{prompt-name}.sql`

---

## 6. Repo Optimization (Nuevo)

Scripts de auditoria integral y limpieza del repo. Diseñados para ejecucion en paralelo via Windows Terminal.

### repo-audit-collect.ps1

Audita infraestructura de agentes (REGISTRY.yml, AGENT.md, skills). Detecta orfanos, paths rotos, solapamiento de keywords.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repo-audit-collect.ps1
```

Output: `docs/output/repo-audit/agent-crossref.json`

### docs-audit-collect.ps1

Escanea `docs/` completo: directorios vacios, duplicados output vs \_generated, naming violations, stubs, dead references, heatmap de tamanio.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/docs-audit-collect.ps1
```

Output: `docs/output/repo-audit/docs-waste.json`

### scripts-audit-collect.ps1

Audita `scripts/` completo: salud por archivo (tamanio, params, outputs), cross-ref con package.json, scripts muertos, migraciones Supabase.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/scripts-audit-collect.ps1
```

Output: `docs/output/repo-audit/scripts-health.json`

### repo-optimize.ps1

Lee los 3 JSON de collectors y ejecuta acciones seguras: borrar dirs vacios, duplicados confirmados, cuarentenar orfanos. Log de items que requieren review manual.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repo-optimize.ps1
powershell -ExecutionPolicy Bypass -File scripts/repo-optimize.ps1 -DryRun
```

Output: `docs/output/repo-audit/optimization-report.md`

### repo-parallel-optimize.ps1

Orquestador. Lanza los 3 collectors en paralelo (Windows Terminal), espera `.done` markers, luego ejecuta optimizer y verificacion.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repo-parallel-optimize.ps1 -DryRun
powershell -ExecutionPolicy Bypass -File scripts/repo-parallel-optimize.ps1
```

---

## 7. QA y Verificacion

### workdays-verifier.ps1

Escanea el modulo Workdays en 8 fases progresivas. Cada ciclo analiza algo diferente y acumula hallazgos con score ponderado. Estado persistido en JSON.

**Fases:** Baseline - Deep JS - Deep HTML - Deep CSS - Cross-Module - Supabase - UX Patterns - Summary + Delta

```powershell
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Watch
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Watch -FullScan
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Reset
```

Output: `docs/output/workdays-progressive.md`

### testing-tracker.js

CLI para visualizar estado del pipeline de testing: observaciones, tickets y planes.

```powershell
node scripts/testing-tracker.js
node scripts/testing-tracker.js --tickets
node scripts/testing-tracker.js --open
node scripts/testing-tracker.js --obs
```

---

## 8. Datos y Utilidades

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

---

## Flujo de trabajo recomendado

```text
ABRO VS CODE
  +-- security-startup.ps1          (una vez)

DURANTE LA SESION (4 terminales)
  |-- security-watchdog.ps1 -LogToFile   (siempre corriendo)
  |-- ops-watchdog.ps1                    (siempre corriendo)
  |-- workdays-verifier.ps1 -Watch        (durante sprints workdays)
  +-- flow-tracer.ps1                     (cuando quiero auditar flujo)

REPO MAINTENANCE (bajo demanda)
  +-- repo-parallel-optimize.ps1 -DryRun  (preview + live)

CIERRO VS CODE
  +-- security-shutdown.ps1          (una vez)
```

## Archivos generados

| Script               | Output              | Ubicacion                                       |
| :------------------- | :------------------ | :---------------------------------------------- |
| security-watchdog    | Log diario          | `scripts/logs/watchdog-{fecha}.log`             |
| flow-tracer          | Reporte de flujo    | `docs/output/qa/{fecha}_audit_flow-trace.md`    |
| workdays-verifier    | Reporte progresivo  | `docs/output/qa/workdays-progressive.md`        |
| backup-configs       | ZIP de configs      | `scripts/backups/config-backup-{timestamp}.zip` |
| doc-mapper           | Mapa + acciones     | `docs/output/qa/doc-map-*.{json,md}`            |
| ui-component-scanner | Compliance matrix   | `docs/output/ui-scan/compliance-matrix.md`      |
| ds-verify            | Diff report         | `docs/output/ui-scan/verify-diff.md`            |
| repo collectors      | JSON reports        | `docs/output/repo-audit/*.json`                 |
| repo-optimize        | Optimization report | `docs/output/repo-audit/optimization-report.md` |

> Tanto `scripts/logs/` como `scripts/backups/` estan en `.gitignore`.
