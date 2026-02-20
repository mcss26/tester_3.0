# Índice de Documentación

> Estructura por dominio de gobernanza. Cada dominio tiene un `agent.md` que define las reglas de interacción.

---

## 🔒 Source of Truth (`/source-of-truth`)

Esqueleto verificable del proyecto. Los agentes cruzan datos aquí antes de actuar.

| Documento                                                              | Propósito                                      |
| :--------------------------------------------------------------------- | :--------------------------------------------- |
| [scheme.md](./source-of-truth/scheme.md)                               | Esquema de BD (Supabase)                       |
| [backend-architecture.md](./source-of-truth/backend-architecture.md)   | Mapa de RPCs, tablas, vistas, funciones        |
| [screen-map.md](./source-of-truth/screen-map.md)                       | Mapa de pantallas por rol                      |
| [estado-presente.md](./source-of-truth/estado-presente.md)             | Métricas actuales del proyecto                 |
| [user-flows-by-role.md](./source-of-truth/user-flows-by-role.md)       | Gap analysis por rol (12 roles × 45 pantallas) |
| [safe-list-selectors.json](./source-of-truth/safe-list-selectors.json) | Selectores CSS validados                       |
| [agent.md](./source-of-truth/agent.md)                                 | Contrato de interacción del dominio            |

---

## 🎨 UI/UX (`/UI-UX`)

Estándar visual canónico. Todo cambio de UI se valida contra este dominio.

| Documento                                              | Propósito                                            |
| :----------------------------------------------------- | :--------------------------------------------------- |
| [ui-golden-standard.md](./UI-UX/ui-golden-standard.md) | Estándar UI/UX (fases 1-10, tipografía, componentes) |
| [agent.md](./UI-UX/agent.md)                           | Contrato de interacción del dominio                  |

---

## ⚙️ Lógica de Negocio (`/logica`)

Flujos operativos: máquinas de estado, ciclos de vida, reconciliación.

| Documento                                               | Propósito                                |
| :------------------------------------------------------ | :--------------------------------------- |
| [workday-management.md](./logica/workday-management.md) | Ciclo DRAFT→PLANNED→ACTIVE→CLOSED        |
| [night-cash-closing.md](./logica/night-cash-closing.md) | Reconciliación de caja en 2 fases        |
| [bar-manager-night.md](./logica/bar-manager-night.md)   | Sesión de barra: apertura→activa→cierre  |
| [synthesis-report.md](./logica/synthesis-report.md)     | Visión estratégica + DAG de datos + gaps |
| [agent.md](./logica/agent.md)                           | Contrato de interacción del dominio      |

---

## 🤖 Artefactos Generados (`/_generated`)

Output de agentes. Organizado por agente. Ver [README](./_generated/README.md) para convenciones.

| Subdirectorio         | Contenido                                    |
| :-------------------- | :------------------------------------------- |
| `frontend/`           | Audits UI/CSS, component specs, layout plans |
| `orchestrator/`       | Planes cross-cutting, prompts, truth.md      |
| `qa/`                 | Auditorías, reports, contextos               |
| `ui-scan/`            | Compliance matrix, CLI prompts               |
| `product/prototypes/` | Feature specs no implementadas               |
| `data/external-data/` | Datos de referencia externa                  |
| `migration/`          | Tracking de migraciones                      |
| `repo-audit/`         | Auditorías de repositorio                    |

---

## 🏭 Operaciones (`/operaciones`)

Testing pipeline + documentación operacional.

| Documento                                                          | Propósito                                 |
| :----------------------------------------------------------------- | :---------------------------------------- |
| [plan-production-ready.md](./operaciones/plan-production-ready.md) | Plan de producción (3 fases, 7 PRs)       |
| [testing/](./operaciones/testing/)                                 | Tickets, observaciones, planes de testing |
