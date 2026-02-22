# CSS Design Drift Report

**Fecha:** 2026-02-20  
**Método:** CLI scan (`Select-String`) + cruce con `ui-component-scanner.ps1` (44 páginas)

---

## 1. Scanner UI — Score Global

| Métrica               | Valor                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| Páginas escaneadas    | **44**                                                                                                    |
| Score promedio        | **59%**                                                                                                   |
| Compliant (≥80%)      | 3 — `admin-central-stock` (91), `logistica-index` (82), `admin-reportes` (80)                             |
| Parcial (50–79%)      | 34                                                                                                        |
| Crítico (<50%)        | 7 — `scanner-mock` (2), `my-qr` (14), `index` (31/32/39), `encargado-caja-noche` (35), `admin index` (46) |
| Inline styles totales | **3** (solo `admin-workdays`: 2, `index prototype`: 1)                                                    |
| Hints de remediación  | **312**                                                                                                   |

### Distribución por módulo

| Módulo     | Páginas | Score promedio | Peor | Mejor |
| ---------- | ------- | -------------- | ---- | ----- |
| admin      | 14      | 63             | 46   | 91    |
| operativo  | 9       | 52             | 2    | 74    |
| encargados | 7       | 58             | 35   | 75    |
| logistica  | 5       | 66             | 56   | 82    |
| staff      | 2       | 71             | 67   | 74    |
| gerencia   | 1       | 55             | 55   | 55    |
| members    | 1       | 14             | 14   | 14    |
| prototypes | 3       | 34             | 31   | 39    |

### Top 5 categorías con más fallas transversales

1. **CustomDropdowns** — `!!` en ~25 páginas. Patrón: `<select>` nativo sin `.custom-dropdown`
2. **Tables** — `!!` en ~20 páginas. Falta: `table-compact`, `sortable`, `sort-icon`, `cell-pad`
3. **Header** — `!!` en ~15 páginas. Falta: `dashboard-header`, `actions-bar`
4. **Layout** — `!!` en ~10 páginas. Falta: `page-card-wrap`, `page-card`
5. **Modals** — `!!` en ~8 páginas. Falta: `modal-content-md`, `modal-content-lg`

---

## 2. Token Adoption (tokens.css → otros CSS)

**Veredicto: Alta adopción ✅**

| Token             | Refs | Token            | Refs |
| ----------------- | ---- | ---------------- | ---- |
| `--border-subtle` | 94   | `--bg-surface`   | 50   |
| `--border-1`      | 87   | `--bg-elevated`  | 25   |
| `--border-subt`   | 95   | `--bg-body`      | 20   |
| `--bg-elev`       | 43   | `--accent`       | 71   |
| `--border-act`    | 20   | `--accent-focus` | 13   |

### Drift detectado

| Problema                                                                                                               | Acción Capa 1                             |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Aliases duplicados**: `--border-1`/`--border-subtle`, `--bg-elev`/`--bg-elevated`, `--border-subt`/`--border-subtle` | Consolidar a un nombre canónico           |
| `swiss-style.css` redefine `:root`                                                                                     | ✅ Esperado — es el design system central |
| `tokens.css` tiene 5 bloques `:root`                                                                                   | ✅ Esperado — separación por categoría    |

---

## 3. `!important` — Solo 2 instancias ✅

| Archivo                       | Línea                                 | Propiedad |
| ----------------------------- | ------------------------------------- | --------- |
| `admin-central-stock.css:87`  | `color: var(--purple-400) !important` |
| `admin-central-stock.css:721` | `border-color: rgba(…) !important`    |

---

## 4. `#id` Selectors — Solo QR print ✅

| Selector                      | Archivo            | Uso                       |
| ----------------------------- | ------------------ | ------------------------- |
| `#printArea` / `#printArea *` | `qr-generator.css` | `@media print` — legítimo |

---

## 5. JS ↔ CSS Hooks — Patrón saludable ✅

Clases más toggleadas por JS (todas de **estado**, no de estilo):

`hidden`, `active`, `collapsed`, `is-open`, `is-visible`, `btn-loading`, `is-dragover`, `selected`

**Excepción**: `text-red-500` (tailwind-like) — candidata a `.text-danger`.

---

## Conclusión y Prioridades Capa 1

| Dimensión       | Estado         | Prioridad                               |
| --------------- | -------------- | --------------------------------------- |
| Token adoption  | ✅ Alta        | Consolidar aliases duplicados           |
| `!important`    | ✅ Mínimo (2)  | Resolver en Capa 1                      |
| `#id` selectors | ✅ Acotado     | No action                               |
| JS↔CSS hooks    | ✅ Saludable   | Migrar `text-red-500`                   |
| GS compliance   | 🟡 59% avg     | **Remediar con CLI prompts existentes** |
| Inline styles   | ✅ Mínimo (3)  | Resolver en remediación de workdays     |
| CustomDropdowns | 🔴 Transversal | **Mayor impacto visual y de UX**        |
| Tables          | 🟡 Transversal | Segundo en impacto                      |

### Roadmap sugerido de remediación

1. **Batch 1** (alto impacto, bajo riesgo): Páginas `index` (admin, operativo, encargado) — son landing pages, pocas dependencias
2. **Batch 2** (alto impacto, medio riesgo): CustomDropdowns transversal — crear componente una vez, aplicar en batch
3. **Batch 3** (medio impacto): Tables compliance — `table-compact`, `sortable`, `sort-icon`
4. **Batch 4** (polish): Páginas restantes usando CLI prompts individuales
