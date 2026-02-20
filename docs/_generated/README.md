# Artefactos Generados por Agentes

> **Regla**: Cada agente solo puede crear documentos en su carpeta asignada.
> **No editar manualmente**: estos archivos se regeneran automáticamente.

## Convención

| Regla                    | Detalle                                                                                     |
| :----------------------- | :------------------------------------------------------------------------------------------ |
| **R1 — Output canónico** | Cada agente crea archivos SOLO en `docs/_generated/{agent_name}/`                           |
| **R2 — Naming**          | `{YYYY-MM-DD}_{tipo}_{tema}.md`                                                             |
| **R3 — Tipos válidos**   | `audit`, `plan`, `report`, `spec`, `research`, `migration`, `walkthrough`                   |
| **R4 — Docs core**       | Los docs canónicos (`source-of-truth/`, `UI-UX/`, `logica/`) solo se EDITAN, nunca se crean |
| **R5 — No duplicar**     | Antes de crear, buscar si ya existe un doc similar en la carpeta                            |
| **R6 — Agent contracts** | Cada dominio tiene un `agent.md` con reglas de interacción. Respetar siempre.               |
| **R7 — Prototypes**      | Features no implementadas van a `_generated/product/prototypes/`                            |
| **R8 — External data**   | Datos de referencia externa van a `_generated/data/external-data/`                          |

## Estructura

```
docs/_generated/
├── frontend/        # UI/CSS audits, component specs, layout plans, guides
├── logic/           # JS module specs, auth flows, state diagrams
├── data/            # Schema migrations, RPC specs, integrity reports
│   └── external-data/  # Datos de referencia externa (CSV, exports)
├── qa/              # Coherence audits, regression reports, hygiene checks
├── product/         # UX research, journey maps, backlog specs
│   └── prototypes/  # Feature specs no implementadas (DRAFT)
├── orchestrator/    # Cross-cutting plans, delegation reports
├── ui-scan/         # Compliance matrix, CLI prompts, plans UI
├── repo-audit/      # Repository-wide audits
├── migration/       # Migration tracking and plans
└── security-ops/    # Security operations reports
```

## Ejemplo de nombre

```
2026-02-16_audit_css-drift.md        → qa/
2026-02-16_spec_workdays-unified.md  → product/
2026-02-16_migration_stock-views.md  → data/
```
