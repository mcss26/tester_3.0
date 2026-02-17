# Remediation Report: QR Generator

**Fecha:** 2026-02-16  
**Página:** `pages/admin/qr/generator.html`  
**CSS:** `assets/css/qr-generator.css`

---

## Diff CSS

| Archivo            | Cambio                                                          | Razón                                                                                         |
| ------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `qr-generator.css` | `.qr-gen-config .field { margin-bottom: 0 }`                    | Anula `margin-bottom: 1rem` de `components.css` que crea espacio duplicado dentro de flex+gap |
| `qr-generator.css` | `.qr-gen-preview-grid .preview-card` (scoped)                   | Gana especificidad sobre `.preview-card` genérico de `components.css:4850`                    |
| `qr-generator.css` | `.preview-card-qr { background: #fff; padding; border-radius }` | Contraste para QR negro sobre fondo oscuro                                                    |
| `qr-generator.css` | `:focus-visible` en inputs/selects                              | Accesibilidad — anillo de foco visible al tabular                                             |
| `qr-generator.css` | `@keyframes qr-pulse` en `.qr-gen-empty-icon`                   | Micro-interacción FASE 10 — empty state animado                                               |
| `qr-generator.css` | `.preview-card:hover` glow sutil                                | Micro-interacción FASE 10 — feedback visual                                                   |
| `qr-generator.css` | `.qr-gen-config .btn-secondary` refuerzo                        | Asegura estilos incluso sin `.btn` base                                                       |

## Clases/IDs Afectados

| Selector            | Tipo             | Cambio                                                      | Impacto JS                                             |
| ------------------- | ---------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `#btnPrint`         | ID               | Agregada clase `.btn` en HTML, movido fuera de `.page-card` | Ninguno (`getElementById` es global)                   |
| `#btnPreview`       | ID               | Agregada clase `.btn` en HTML                               | Ninguno                                                |
| `#btnClear`         | ID               | Agregada clase `.btn` en HTML                               | Ninguno                                                |
| `.dashboard-header` | Clase            | Movido de dentro a fuera de `.page-card`                    | `navigation.js` lo encuentra igual vía `querySelector` |
| `.preview-card`     | Clase (dinámica) | Scoped bajo `.qr-gen-preview-grid` en CSS                   | Ninguno (clase no renombrada)                          |

**IDs no modificados (15/15):** `batchName`, `financialType`, `marketSource`, `unitPrice`, `marketSourceField`, `priceField`, `qty`, `baseText`, `paper`, `qrSize`, `titleText`, `previewArea`, `printArea`, `previewMeta`, `previewEmpty`.

## Checklist Responsive

- [x] `@media (max-width: 1024px)` — Layout colapsa a 1 columna
- [x] `@media (max-width: 600px)` — Print row colapsa a 1 columna
- [x] Dashboard header fuera de card tiene breathing room nativo del `.page-card-wrap`

## Checklist Accesibilidad

- [x] `<h1>` único (Generador QR) → heading hierarchy correcta
- [x] `<h2>` section-labels (Información del Lote, Generación, Impresión)
- [x] Todos los inputs tienen `aria-label` o `<label for="">`
- [x] Todos los botones tienen `aria-label`
- [x] `:focus-visible` con `outline: 2px solid var(--accent-focus)` y `outline-offset: 2px`
- [x] Botones ahora heredan `.btn` base con `focus-visible` ring
