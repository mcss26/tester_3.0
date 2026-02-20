---
name: orchestrator
description: Punto de entrada. Interpreta, clasifica riesgo, delega y valida.
---

# Midnight Club — Tester 3.0

## How to Use This Guide

- Start here for cross-project norms
- Each component has an `agent.md` file with specific guidelines
- Component docs override this file when guidance conflicts

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                             | Skill                                 |
| :--------------------------------- | :------------------------------------ |
| Editar CSS / layout / tokens       | `css-architect`                       |
| Componentes UI / layout audits     | `component-builder`, `layout-auditor` |
| Lógica JS / state / auth           | `logic-engineer`                      |
| Schema SQL / RPCs / vistas         | `db-architect`, `erp-architect`       |
| SQL performance / indexes / RLS    | `supabase-postgres-best-practices`    |
| Auditoría de módulo / coherencia   | `module-coherence-auditor`            |
| Auditoría de workspace / higiene   | `auditing-workspace`                  |
| Testing interactivo / tickets      | `testing-pipeline`                    |
| Research UX / personas / journeys  | `ux-researcher-designer`              |
| Prototipado UI (sandbox)           | `prototyper`                          |
| Assets de marca / social / merch   | `brand-developer`                     |
| Planificación / roadmaps / sprints | `methodology-generator`               |
| Seguridad / permisos               | `security-ops`                        |
| Limpieza de repo / higiene         | `repo-cleanup`                        |
| Documentación / planes             | `writing-clearly-and-concisely`       |

---

## Project Overview

| Component    | Location                       | Tech Stack                  |
| :----------- | :----------------------------- | :-------------------------- |
| Pages (HTML) | [`pages/`](pages/agent.md)     | HTML, CSS, vanilla JS       |
| Assets       | [`assets/`](assets/agent.md)   | CSS tokens, JS modules      |
| Scripts      | [`scripts/`](scripts/agent.md) | PowerShell, Node.js, Python |
| Database     | `supabase/migrations/`         | PostgreSQL, Supabase RPCs   |
| Docs         | `docs/`                        | Markdown                    |

---

## Architecture Layers

| #   | Layer             | Location                                                | State               |
| :-- | :---------------- | :------------------------------------------------------ | :------------------ |
| 1   | **Router**        | `AGENTS.md` (this file)                                 | Always active       |
| 2   | **Domain Agents** | `pages/agent.md`, `assets/agent.md`, `scripts/agent.md` | Always active       |
| 3   | **Rules (DNA)**   | `.agent/rules/`                                         | Always active       |
| 4   | **Skills**        | `.agent/skills/`                                        | On demand           |
| 5   | **Workflows**     | `.agent/workflows/`                                     | Explicit invocation |

## Abstract Agents

Agents without their own code folder. Live in `.agent/agents/`:

| Agent          | When to use                           |
| :------------- | :------------------------------------ |
| `orchestrator` | Always. Entry point.                  |
| `frontend`     | CSS, layout, components, visual       |
| `logic`        | JS modules, auth, state, integration  |
| `data`         | Schema, RPCs, views, migrations       |
| `qa`           | Audits, coherence, testing, cleanup   |
| `product`      | UX, journeys, prioritization, metrics |
| `security-ops` | Permissions, compliance, watchdogs    |

## Routing

See [`.agent/REGISTRY.yml`](.agent/REGISTRY.yml) for intent matching, risk tiers, and delegation.
