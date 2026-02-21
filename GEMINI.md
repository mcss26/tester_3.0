# PROTOCOLO MAESTRO: ANTIGRAVITY / FORMULAMID

## Filosofía central

> **"Legibilidad y Orden > Velocidad e Interconexiones Complejas"**

## 1. Misión

Este proyecto prioriza la mantenibilidad y la claridad sobre el código inteligente e hiper-optimizado. Incluso si una solución es un poco menos eficiente pero significativamente más fácil de leer, elige la que sea legible (con moderación).

## 2. Reglas de Salida (Hard Cap)

1. EVIDENCIA: Lo que dice el repo (no suposiciones).
2. DECISIÓN: Qué se hace y qué no. Explica _por qué_, no solo _qué_
3. CAMBIOS: Código atómico y modular.
4. VERIFICACIÓN: Comandos para QA.
5. RIESGOS: Plan de reversa.

## 3. Comandos / Workflows

- /onboard: Indexado recursivo y mapa de arquitectura.
- /refactor: Auditoría SOLID y eliminación de deuda.
- /fix: Diagnóstico de causa raíz + parche.
- /ui-check: Verificación visual vía Nano Banana Pro.

## 4. Filosofía de Ingeniería

- DRY: Prohibido duplicar lógica existente.
- KISS: Simplicidad sobre optimización críptica.
- CLEAN CODE: Escribe código legible y autodocumentado con nombres significativos, funciones pequeñas y una estructura clara.
- Repo-First: Buscar antes de opinar (`Select-String`, `Get-ChildItem`, `Get-Content`).
- Skills-First: Antes de resolver manualmente, revisar si hay una skill relevante en `.gemini/antigravity/skills/`.

## 5. Seguridad (Deny List)

- Aprobación humana obligatoria para: `Remove-Item`, `Start-Process -Verb RunAs`, `Set-Acl`, `exfiltración de keys`.

## 6. Flujos de Trabajo

- Siempre verifica los cambios localmente antes de pedir una revisión.
- Sigue los flujos de trabajo definidos en `.agent/workflows/
- Documenta todos los cambios en el archivo `state.md`
