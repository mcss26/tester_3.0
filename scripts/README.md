# Solo listar, no modificar nada

powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -DryRun

# Generar mapa sin invocar Gemini CLI

powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -SkipCli

# Ejecución completa con análisis CLI

powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1

# Solo una categoría

powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -OnlyCategory modules -SkipCli
}

# Scripts - FormulaMid 4

Índice de scripts de automatización. Todos se corren desde la raíz del proyecto.

---

## 🔒 Security Startup

Checks iniciales al abrir VS Code.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/security-startup.ps1
```

---

## 🛡️ Security Watchdog

Monitoreo continuo de seguridad (cada 60s). Detecta: permisos, integridad SHA-256, archivos sospechosos, git leaks, patrones peligrosos, agentes rogue, procesos sospechosos, MCP servers desconocidos.

```powershell
# Sin log
powershell -ExecutionPolicy Bypass -File scripts/security-watchdog.ps1

# Con log persistente (recomendado)
powershell -ExecutionPolicy Bypass -File scripts/security-watchdog.ps1 -LogToFile
```

**Ctrl+C** → resumen de sesión.

---

## 📡 Ops Watchdog

Torre de control operativa (cada 90s). Monitorea: actividad reciente, docs de agentes, estado git, cobertura de documentación.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ops-watchdog.ps1
```

**Ctrl+C** → detiene.

---

## 🔍 Flow Tracer v2

Análisis estático de navegación y datos. Detecta `data-go` + `<a href>` + `navigateTo()`, clasifica operaciones Supabase como READ/WRITE, y cruza flujos entre módulos. Ejecución single-run (no requiere Ctrl+C).

```powershell
# Solo reporte (default)
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1

# Con análisis Gemini CLI
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1 -WithAnalysis
```

Output: `docs/output/qa/{fecha}_audit_flow-trace.md`

---

## 🧠 Context Loader

Genera un reporte de contexto sobre un tema buscando en 7 fuentes: Knowledge Items, código, docs, schema, git history, reportes previos, y conversaciones. Ideal para arrancar sesiones de agente sin repetir preguntas.

```powershell
# Generar contexto sobre un tema
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "workdays"

# Copiar al clipboard (para pegar directo en chat)
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "stock" -Clipboard

# Con análisis Gemini CLI
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "cashflow" -Analyze
```

Output: `docs/output/qa/context-{topic}.md`

---

## 📊 Workdays Verifier v2 (Progressive Scanner)

Escanea el módulo Workdays en 8 fases progresivas. Cada ciclo analiza algo diferente y acumula hallazgos con score ponderado. Estado persistido en JSON para sobrevivir crashes.

**Fases:** Baseline → Deep JS → Deep HTML → Deep CSS → Cross-Module → Supabase → UX Patterns → Summary + Delta

```powershell
# Una sola vez (8 fases, genera reporte y sale)
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1

# Progresivo: 1 fase por ciclo cada 60s
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Watch

# Full scan cada ciclo (8 fases cada 60s)
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Watch -FullScan

# Reset: limpiar estado y empezar de cero
powershell -ExecutionPolicy Bypass -File scripts/workdays-verifier.ps1 -Reset
```

**Ctrl+C** → resumen de sesión. Output: `docs/output/workdays-progressive.md`

---

## 💾 Backup Configs

Backup de archivos de configuración (.env, credenciales, MCP config) en ZIP con timestamp. Retiene últimas 5 copias.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-configs.ps1
```

---

## 🔐 Security Shutdown

Checks finales al cerrar VS Code. Incluye backup automático, limpieza de zombie processes, verificación de secrets en git.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/security-shutdown.ps1
```

---

## 🤖 UI Batch Remediation

Orquesta Gemini CLI en paralelo para generar planes de remediación UI desde prompts del scanner. Workers configurables.

```powershell
# Ejecución (3 workers por defecto)
powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1

# Solo preview sin ejecutar
powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 -DryRun

# Más workers
powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 -Workers 5
```

Output: `docs/output/ui-scan/{page}/remediation-plan.md`

---

## 🗃️ DB Batch Remediation

Orquesta Gemini CLI en paralelo para generar migraciones SQL desde prompts de remediación DB. Limpia markdown residual.

```powershell
# Ejecución (3 workers por defecto)
powershell -ExecutionPolicy Bypass -File scripts/db-batch-remediation.ps1

# Solo preview
powershell -ExecutionPolicy Bypass -File scripts/db-batch-remediation.ps1 -DryRun
```

Output: `supabase/migrations/{timestamp}_{prompt-name}.sql`

---

## 🗺️ Doc Mapper

Escanea todos los `.md` del proyecto, extrae dependencias (links MD, tablas, vistas, RPCs, archivos JS/HTML/CSS) y genera un mapa completo. Al finalizar, invoca Gemini CLI para verificar y generar acciones de actualización.

```powershell
# Solo listar documentos y dependencias (sin CLI)
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -SkipCli

# Preview sin ejecutar nada
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -DryRun

# Ejecución completa (mapa + CLI)
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1

# Solo una categoría
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -OnlyCategory modules

# Más workers para CLI
powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -Workers 3
```

Output:

- `docs/output/qa/doc-map.json` — Mapa de dependencias completo
- `docs/output/qa/doc-map-report.md` — Reporte legible
- `docs/output/qa/doc-map-actions.md` — Acciones recomendadas por Gemini CLI

---

## Flujo de trabajo recomendado

```text
ABRO VS CODE
  └─ security-startup.ps1          (una vez)

DURANTE LA SESION (4 terminales)
  ├─ security-watchdog.ps1 -LogToFile   (siempre corriendo)
  ├─ ops-watchdog.ps1                    (siempre corriendo)
  ├─ workdays-verifier.ps1 -Watch        (durante sprints workdays)
  └─ flow-tracer.ps1                     (cuando quiero auditar flujo)

CIERRO VS CODE
  └─ security-shutdown.ps1          (una vez)
```

## Archivos generados

| Script            | Output             | Ubicación                                       |
| :---------------- | :----------------- | :---------------------------------------------- |
| security-watchdog | Log diario         | `scripts/logs/watchdog-{fecha}.log`             |
| flow-tracer       | Reporte de flujo   | `docs/output/qa/{fecha}_audit_flow-trace.md`    |
| workdays-verifier | Reporte progresivo | `docs/output/qa/workdays-progressive.md`        |
| backup-configs    | ZIP de configs     | `scripts/backups/config-backup-{timestamp}.zip` |
| doc-mapper        | Mapa + acciones    | `docs/output/qa/doc-map-*.{json,md}`            |

> Tanto `scripts/logs/` como `scripts/backups/` están en `.gitignore`.
