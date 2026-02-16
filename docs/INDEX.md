# Índice de Documentación

> **Última Actualización**: 2026-02-16

---

## Documentos Core

| Documento                                        | Propósito                      |
| :----------------------------------------------- | :----------------------------- |
| [estado-presente.md](./estado-presente.md)       | Métricas actuales del proyecto |
| [screen-map.md](./screen-map.md)                 | Mapa de pantallas por rol      |
| [scheme.md](./scheme.md)                         | Esquema de BD (Supabase)       |
| [ui-golden-standard.md](./ui-golden-standard.md) | Estándares UI/UX y componentes |

---

## Guías (`/guides`)

| Documento                                                       | Contenido                               |
| :-------------------------------------------------------------- | :-------------------------------------- |
| [navigation.md](./guides/navigation.md)                         | Navegación por rol, componentes de menú |
| [state-management-guide.md](./guides/state-management-guide.md) | Patrones de estado JS por módulo        |
| [drive-troubleshooting.md](./guides/drive-troubleshooting.md)   | Solución de problemas Google Drive MCP  |

---

## Migración (`/migration`)

| Documento                            | Contenido                              |
| :----------------------------------- | :------------------------------------- |
| [README.md](./migration/README.md)   | Estado de migración WorkDays + Balance |
| [artifacts/](./migration/artifacts/) | Análisis, sprints completados, roadmap |

---

## Datos de Referencia (`/important-data-reference`)

| Documento                         | Contenido                           |
| :-------------------------------- | :---------------------------------- |
| `Gbol Comandas.xlsx`              | Datos de comandas externas (Gbol)   |
| `Gbol Factura Electronica.xlsx`   | Facturación electrónica AFIP        |
| `Passline.csv`                    | Datos de ticketing Passline         |
| `reporte_Zoco_todos_2025-10.xlsx` | Reporte Zoco completo Oct 2025      |
| `feature-spec-drinks-by-web.md`   | Spec de funcionalidad Drinks-by-Web |
| `user-flows-by-role.md`           | Flujos de usuario por rol           |

---

## Módulos (`/modules`)

Documentación técnica y operativa por módulo:

| Área       | Cantidad | Ruta                  |
| :--------- | :------- | :-------------------- |
| Admin      | 12       | `modules/admin/`      |
| Encargados | 7        | `modules/encargados/` |
| Gerencia   | 1        | `modules/gerencia/`   |
| Operativo  | 9        | `modules/operativo/`  |
| Logística  | 5        | `modules/logistica/`  |
| Staff      | 2        | `modules/staff/`      |
| Members    | 1        | `modules/members/`    |
| Misc       | 1        | `modules/misc/`       |

**Template**: [\_template.md](./modules/_template.md)

---

## Output por Agente (`/output`)

Cada agente documenta exclusivamente en su carpeta. Ver [README](./output/README.md) para convención.

| Carpeta                | Agente       | Contenido                            |
| :--------------------- | :----------- | :----------------------------------- |
| `output/frontend/`     | frontend     | Auditorías CSS, specs de componentes |
| `output/logic/`        | logic        | Specs de módulos JS, flujos de auth  |
| `output/data/`         | data         | Migraciones schema, specs de RPCs    |
| `output/qa/`           | qa           | Auditorías de coherencia, reportes   |
| `output/product/`      | product      | Investigación UX, journey maps       |
| `output/orchestrator/` | orchestrator | Planes cross-cutting, delegaciones   |

---

## Infraestructura de Agentes

| Archivo                                         | Propósito                                             |
| :---------------------------------------------- | :---------------------------------------------------- |
| [`AGENT.md`](../AGENT.md)                       | Reglas globales (semáforo de riesgo, gobernanza, DoD) |
| [`.agent/README.md`](../.agent/README.md)       | Estructura del sistema agents-of-agents               |
| [`.agent/REGISTRY.yml`](../.agent/REGISTRY.yml) | Routing canónico por intents + tiers de riesgo        |

### Sub-Agentes (`.agent/agents/`)

| Agente     | Dominio                              | Skills                                                         |
| :--------- | :----------------------------------- | :------------------------------------------------------------- |
| `frontend` | UI/CSS/layout/componentes            | css-architect, web-designer, ui-migrator                       |
| `logic`    | JS modules, state, auth, integración | logic-engineer, prototyper                                     |
| `data`     | Schema Supabase, RPCs, migraciones   | db-architect, erp-architect                                    |
| `qa`       | Auditorías, coherencia, higiene      | auditing-workspace, module-coherence-auditor                   |
| `product`  | UX, journeys, documentación          | ux-researcher-designer, brand-developer, methodology-generator |

### Skills Atómicos (`.agent/skills/`)

13 skills técnicos reutilizables. Skills destacados:

- `leader/` — Orquestación de agentes (orchestrator)
- `css-architect/` — Reglas de UI/CSS
- `logic-engineer/` — Reglas de JS/lógica
- `db-architect/` — Reglas de datos
- `erp-architect/` — Arquitectura ERP
- `ux-researcher-designer/` — Investigación UX
- `auditing-workspace/` — Auditoría de workspace
