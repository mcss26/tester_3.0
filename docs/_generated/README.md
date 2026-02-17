# Artefactos Generados por Agentes

> **Regla**: Cada agente solo puede crear documentos en su carpeta asignada.
> **No editar manualmente**: estos archivos se regeneran automáticamente.

## Convención

| Regla                    | Detalle                                                                            |
| :----------------------- | :--------------------------------------------------------------------------------- |
| **R1 — Output canónico** | Cada agente crea archivos SOLO en `docs/_generated/{agent_name}/`                  |
| **R2 — Naming**          | `{YYYY-MM-DD}_{tipo}_{tema}.md`                                                    |
| **R3 — Tipos válidos**   | `audit`, `plan`, `report`, `spec`, `research`, `migration`, `walkthrough`          |
| **R4 — Docs core**       | Los docs canónicos (en `docs/architecture/`) solo se EDITAN, nunca se crean nuevos |
| **R5 — Module docs**     | `docs/modules/` es para fichas de módulo (no cambia)                               |
| **R6 — No duplicar**     | Antes de crear, buscar si ya existe un doc similar en la carpeta                   |

## Estructura

```
docs/_generated/
├── frontend/        # UI/CSS audits, component specs, layout plans
├── logic/           # JS module specs, auth flows, state diagrams
├── data/            # Schema migrations, RPC specs, integrity reports
├── qa/              # Coherence audits, regression reports, hygiene checks
│   └── doc-map/     # Índices generados automáticamente (doc-index-*)
├── product/         # UX research, journey maps, backlog specs
├── orchestrator/    # Cross-cutting plans, delegation reports
├── ui-scan/         # Compliance matrix, CLI prompts, plans UI
└── db-remediation/  # Prompts SQL de remediación
```

## Ejemplo de nombre

```
2026-02-16_audit_css-drift.md        → qa/
2026-02-16_spec_workdays-unified.md  → product/
2026-02-16_migration_stock-views.md  → data/
```
