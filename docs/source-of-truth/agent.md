# Agent Contract — Source of Truth

> Este dominio contiene los documentos fundacionales del proyecto.
> **Ningún agente puede crear archivos nuevos aquí sin aprobación explícita del usuario.**

## Scope

Esqueleto verificable: esquema BD, arquitectura backend, mapa de pantallas, estado actual, selectores CSS validados, flujos por rol.

## Reglas de Interacción

| Regla                    | Descripción                                                                                                                                                                                  |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1 — Verify First**    | Antes de actuar, el agente DEBE cruzar datos contra el archivo relevante de este dominio. Si hay contradicción entre código y doc, **el código gana** y el doc se marca como desactualizado. |
| **R2 — No Create**       | Prohibido crear archivos nuevos. Solo editar existentes con justificación.                                                                                                                   |
| **R3 — Freshness Check** | Si un doc no se actualizó en >7 días y el agente detecta drift vs código, debe notificar al usuario.                                                                                         |
| **R4 — Cross-Reference** | `scheme.md` es la fuente canónica para tablas/columnas. `backend-architecture.md` para RPCs/vistas. `screen-map.md` para pantallas×roles. Siempre citar la fuente al tomar decisiones.       |

## Inventario

| Archivo                    | Propósito                                     | Tamaño |
| :------------------------- | :-------------------------------------------- | -----: |
| `scheme.md`                | Esquema de BD (Supabase)                      |    66K |
| `backend-architecture.md`  | Mapa de RPCs, tablas, vistas, funciones       |    19K |
| `safe-list-selectors.json` | Selectores CSS validados por audit            |    16K |
| `screen-map.md`            | Mapa de pantallas por rol                     |    22K |
| `estado-presente.md`       | Métricas actuales del proyecto                |    22K |
| `user-flows-by-role.md`    | Gap analysis por rol (12 roles, 45 pantallas) |    21K |
