# Agent Contract — UI/UX

> Este dominio gobierna la capa visual del proyecto.
> Todo cambio de UI se valida contra `ui-golden-standard.md` + `tokens.css`.

## Scope

Estándar visual canónico: tipografía, jerarquía, interacciones, responsiveness, accesibilidad. Los artefactos generados por agentes (audits, visual.html, reports) viven en `_generated/frontend/`.

## Reglas de Interacción

| Regla                        | Descripción                                                                                                                      |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **R1 — Golden Standard**     | Todo cambio visual DEBE ser validado contra `ui-golden-standard.md`. Si no cumple, se rechaza.                                   |
| **R2 — No Hardcode Hex**     | Prohibido usar valores hex fuera de `:root`. Usar tokens de `tokens.css`.                                                        |
| **R3 — Swiss Style First**   | Los componentes se implementan en `swiss-style.css`. `design-system-visual.html` es referencia visual, no source of truth.       |
| **R4 — Audit Before Change** | Antes de modificar CSS, ejecutar `audit:css` para baseline. Después de modificar, ejecutar de nuevo para verificar no-regresión. |

## Inventario

| Archivo                 | Propósito                            | Tamaño |
| :---------------------- | :----------------------------------- | -----: |
| `ui-golden-standard.md` | Estándar UI/UX canónico (fases 1-10) |    43K |

## Artefactos Relacionados (en `_generated/frontend/`)

- `design-system-audit.md` — Reporte de divergencias tokens/componentes
- `design-system-visual.html` — Referencia visual (no editar directamente)
- `hardcoded-colors-report.md` — Auditoría de hex fuera de `:root`
