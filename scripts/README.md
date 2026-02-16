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

## 🔍 Flow Tracer

Análisis estático del flujo de datos y navegación. Traza `data-go`, cruza `.from()` con `scheme.md`, detecta JS huérfanos. Al pausar, genera reporte e invoca Claude CLI automáticamente.

```powershell
# Con análisis Claude CLI al pausar
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1

# Solo reporte (sin Claude)
powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1 -NoAnalysis
```

**Ctrl+C** → genera `docs/output/qa/{fecha}_audit_flow-trace.md` → Claude CLI analiza.

---

## 🧠 Context Loader

Genera un reporte de contexto sobre un tema buscando en 7 fuentes: Knowledge Items, código, docs, schema, git history, reportes previos, y conversaciones. Ideal para arrancar sesiones de agente sin repetir preguntas.

```powershell
# Generar contexto sobre un tema
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "workdays"

# Copiar al clipboard (para pegar directo en chat)
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "stock" -Clipboard

# Con análisis Claude CLI
powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "cashflow" -Analyze
```

Output: `docs/output/qa/context-{topic}.md`

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

## Flujo de trabajo recomendado

```
ABRO VS CODE
  └─ security-startup.ps1          (una vez)

DURANTE LA SESION (3 terminales)
  ├─ security-watchdog.ps1 -LogToFile   (siempre corriendo)
  ├─ ops-watchdog.ps1                    (siempre corriendo)
  └─ flow-tracer.ps1                     (cuando quiero auditar flujo)

CIERRO VS CODE
  └─ security-shutdown.ps1          (una vez)
```

## Archivos generados

| Script            | Output           | Ubicación                                       |
| :---------------- | :--------------- | :---------------------------------------------- |
| security-watchdog | Log diario       | `scripts/logs/watchdog-{fecha}.log`             |
| flow-tracer       | Reporte de flujo | `docs/output/qa/{fecha}_audit_flow-trace.md`    |
| backup-configs    | ZIP de configs   | `scripts/backups/config-backup-{timestamp}.zip` |

> Tanto `scripts/logs/` como `scripts/backups/` están en `.gitignore`.
