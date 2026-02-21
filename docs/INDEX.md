# Índice de Documentación

> **Actualizado**: 2026-02-21 — post-consolidación.
> Estructura por dominio. Cada dominio con `agent.md` de contrato.

---

## 🔒 Source of Truth (`/source-of-truth`)

Esqueleto verificable. Los agentes cruzan datos aquí antes de actuar.

| Documento                                                              | Propósito                                      |
| :--------------------------------------------------------------------- | :--------------------------------------------- |
| [scheme.md](./source-of-truth/scheme.md)                               | Esquema de BD (Supabase)                       |
| [backend-architecture.md](./source-of-truth/backend-architecture.md)   | Mapa RPCs, tablas, vistas, funciones           |
| [screen-map.md](./source-of-truth/screen-map.md)                       | Mapa de pantallas por rol                      |
| [estado-presente.md](./source-of-truth/estado-presente.md)             | Métricas actuales del proyecto                 |
| [user-flows-by-role.md](./source-of-truth/user-flows-by-role.md)       | Gap analysis por rol (12 roles × 45 pantallas) |
| [safe-list-selectors.json](./source-of-truth/safe-list-selectors.json) | Selectores CSS validados                       |
| [agent.md](./source-of-truth/agent.md)                                 | Contrato de interacción                        |

---

## 🎨 Design System (`/design-system`)

SSoT de tokens, spec y componentes. `MASTER.md` = fuente definitiva.

| Documento                                                                  | Propósito                                              |
| :------------------------------------------------------------------------- | :----------------------------------------------------- |
| [MASTER.md](./design-system/MASTER.md)                                     | Tokens + spec visual + inventario P0-P3 (§12)          |
| [audit.md](./design-system/audit.md)                                       | Resultados de auditoría del DS                         |
| [state-management.md](./design-system/state-management.md)                 | Patrones de estado (loading, empty, error)             |
| [token-migration-registry.md](./design-system/token-migration-registry.md) | Tracking de migración de tokens                        |
| `pages/`                                                                   | Specs por página (central-stock, workdays, caja-noche) |
| `prompts/`                                                                 | Prompts de auditoría (frontend, HTML, JS, QA, CSS)     |
| `reports/`                                                                 | FICHA + REPORTs de auditoría                           |
| `archive/`                                                                 | CHANGELOG + multi-chat-architecture (histórico)        |

---

## 🖼 UI/UX (`/UI-UX`)

Pattern library + estándares visuales.

| Documento                                                                | Propósito                                                  |
| :----------------------------------------------------------------------- | :--------------------------------------------------------- |
| [ui-golden-standard.md](./UI-UX/ui-golden-standard.md)                   | Pattern library — 12+ plantillas HTML/JS de componentes    |
| [spec-layout-estandarizacion.md](./UI-UX/spec-layout-estandarizacion.md) | Spec de estandarización de layouts (44 pantallas, 5 roles) |
| [agent.md](./UI-UX/agent.md)                                             | Contrato de interacción                                    |

---

## ⚙️ Lógica de Negocio (`/logica`)

Flujos operativos: máquinas de estado, ciclos de vida, reconciliación.

| Documento                                               | Propósito                                |
| :------------------------------------------------------ | :--------------------------------------- |
| [workday-management.md](./logica/workday-management.md) | Ciclo DRAFT→PLANNED→ACTIVE→CLOSED        |
| [night-cash-closing.md](./logica/night-cash-closing.md) | Reconciliación de caja en 2 fases        |
| [bar-manager-night.md](./logica/bar-manager-night.md)   | Sesión de barra: apertura→activa→cierre  |
| [synthesis-report.md](./logica/synthesis-report.md)     | Visión estratégica + DAG de datos + gaps |
| [agent.md](./logica/agent.md)                           | Contrato de interacción                  |

---

## 🏭 Operaciones (`/operaciones`)

Testing pipeline + documentación operacional.

| Documento                                                          | Propósito                                  |
| :----------------------------------------------------------------- | :----------------------------------------- |
| [plan-production-ready.md](./operaciones/plan-production-ready.md) | Plan de producción (3 fases, 7 PRs)        |
| [README.md](./operaciones/README.md)                               | Guía del dominio operaciones               |
| `testing/observations/`                                            | Reportes de drift CSS y observaciones      |
| `testing/tickets/`                                                 | TK-001 a TK-005 (bugs de compat, UI, data) |

---

## 📦 Artefactos Generados (`/_generated`)

Output de agentes y datos externos. Regenerable bajo demanda.

| Subdirectorio         | Contenido                                 |
| :-------------------- | :---------------------------------------- |
| `data/external-data/` | Archivos Zoco, Passline, Gbol (Excel/CSV) |
| `product/prototypes/` | Feature spec: drinks-by-web               |
| `qa/`                 | Contextos de sistema y UI                 |
| `repo-audit/`         | Optimization report + health JSONs        |

---

## 📊 Output (`/output`)

Salida de workflows y scans. **Regenerable** — `/cleaner` puede borrar todo esto.

| Archivo/Dir                                           | Propósito                                             |
| :---------------------------------------------------- | :---------------------------------------------------- |
| [wiremap.md](./output/wiremap.md)                     | Mapa de conexiones HTML↔JS↔CSS                        |
| [md-routing-map.md](./output/md-routing-map.md)       | Routing de archivos MD                                |
| [code-review.md](./output/code-review.md)             | Resultados de /review                                 |
| [refactor-plan.md](./output/refactor-plan.md)         | Plan de refactorización                               |
| [jsdoc-coverage.md](./output/jsdoc-coverage.md)       | Cobertura JSDoc                                       |
| [workflow-analysis.md](./output/workflow-analysis.md) | Análisis de workflows                                 |
| `qa/`                                                 | Contextos QA por módulo                               |
| `ui-scan/`                                            | CLI prompts + compliance + baseline JSON (42 páginas) |
