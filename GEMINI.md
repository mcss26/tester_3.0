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

- Antes de comenzar una tarea lista las skills dispnibles en .agent\skills y elige la que mas se ajuste a la tarea. Si no hay una skill que se ajuste a la tarea, crea una o propone una adaptacion de una skill existente.

- Siempre verifica los cambios localmente antes de pedir una revisión.

- Sigue los flujos de trabajo definidos en [.agent/workflows/](C:\Users\siste\Documents\GitHub\tester_3.0\state.md)

- Documenta todos los cambios que realices en el repo en [state.md](C:\Users\siste\Documents\GitHub\tester_3.0\state.md)

## 7. Browser Subagent (Anti-Loop)

- **Prompts acotados**: Nunca pedir "scrollea hasta encontrar X" ni "cuenta todas las filas". El subagente no tiene criterio de parada y entra en loop infinito.
- **Patrón correcto**: 1 screenshot + 1 `browser_get_dom` + reportar. Si necesitás verificar un selector específico, pedirlo explícitamente por CSS selector, no por scroll visual.
- **Máximo de acciones**: Limitar a ~5-8 pasos por invocación. Si la tarea requiere más, dividir en múltiples llamadas.
