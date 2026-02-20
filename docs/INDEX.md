# Índice de Documentación

> **Última Actualización**: 2026-02-17

---

## 🏗️ Arquitectura (`/architecture`)

Documentos core del proyecto — fuente de verdad para estructura, esquema y estándares.

| Documento                                                                 | Propósito                      |
| :------------------------------------------------------------------------ | :----------------------------- |
| [estado-presente.md](./architecture/estado-presente.md)                   | Métricas actuales del proyecto |
| [screen-map.md](./architecture/screen-map.md)                             | Mapa de pantallas por rol      |
| [scheme.md](./architecture/scheme.md)                                     | Esquema de BD (Supabase)       |
| [ui-golden-standard.md](./architecture/ui-golden-standard.md)             | Estándares UI/UX y componentes |
| [backend-architecture-map.md](./architecture/backend-architecture-map.md) | Mapa de arquitectura backend   |

---

## 📚 Guías (`/guides`)

| Documento                                                       | Contenido                               |
| :-------------------------------------------------------------- | :-------------------------------------- |
| [navigation.md](./guides/navigation.md)                         | Navegación por rol, componentes de menú |
| [state-management-guide.md](./guides/state-management-guide.md) | Patrones de estado JS por módulo        |
| [drive-troubleshooting.md](./guides/drive-troubleshooting.md)   | Solución de problemas Google Drive MCP  |

---

## 🔀 Lógica de Negocio (`/business-logic`)

| Documento                                                             | Contenido                           |
| :-------------------------------------------------------------------- | :---------------------------------- |
| [synthesis-report.md](./business-logic/synthesis-report.md)           | Síntesis de reglas de negocio       |
| [workday-management.md](./business-logic/flows/workday-management.md) | Flujo: Gestión de Jornadas          |
| [night-cash-closing.md](./business-logic/flows/night-cash-closing.md) | Flujo: Cierre de Caja Nocturno      |
| [bar-manager-night.md](./business-logic/flows/bar-manager-night.md)   | Flujo: Noche del Encargado de Barra |

---

## 🔍 Auditorías (`/_generated`)

| Documento                                                                                                        | Contenido                         |
| :--------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| [2026-02-16_audit_flow-trace.md](./_generated/qa/2026-02-16_audit_flow-trace.md)                                 | Trace de flujos cross-module      |
| [2026-02-16_audit_workdays-deep-verification.md](./_generated/qa/2026-02-16_audit_workdays-deep-verification.md) | Verificación profunda de Workdays |

---

## 📖 Módulos (`/modules`)

Documentación técnica y operativa por módulo. Ver [README.md](./modules/README.md) para índice completo.

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

## 📋 Referencia (`/reference`)

| Documento                                                                  | Contenido                           |
| :------------------------------------------------------------------------- | :---------------------------------- |
| [user-flows-by-role.md](./reference/user-flows-by-role.md)                 | Flujos de usuario por rol           |
| [feature-spec-drinks-by-web.md](./reference/feature-spec-drinks-by-web.md) | Spec de funcionalidad Drinks-by-Web |

### Datos Externos (`/reference/external-data`)

| Archivo                           | Contenido                      |
| :-------------------------------- | :----------------------------- |
| `Gbol Comandas.xlsx`              | Datos de comandas externas     |
| `Gbol Factura Electronica.xlsx`   | Facturación electrónica AFIP   |
| `Passline.csv`                    | Datos de ticketing Passline    |
| `reporte_Zoco_todos_2025-10.xlsx` | Reporte Zoco completo Oct 2025 |

---

## 🧪 Testing (`/testing`)

| Documento                        | Contenido                                 |
| :------------------------------- | :---------------------------------------- |
| [README.md](./testing/README.md) | Pipeline de testing interactivo           |
| `observations/`                  | Hallazgos crudos por pantalla             |
| `tickets/`                       | Tickets accionables (5 activos)           |
| `plans/`                         | Planes de ejecución generados por agentes |

---

## 🔄 Migración (`/migration`)

| Documento                            | Contenido                              |
| :----------------------------------- | :------------------------------------- |
| [README.md](./migration/README.md)   | Estado de migración WorkDays + Balance |
| [artifacts/](./migration/artifacts/) | Análisis, sprints completados, roadmap |

---

## 🎯 Codex / Planes Estratégicos

| Documento                                                            | Contenido                               |
| :------------------------------------------------------------------- | :-------------------------------------- |
| [ROADMAP.md](../ROADMAP.md)                                          | Plan maestro UI/CSS (fuente de verdad)  |
| [PLAN_PRODUCTION_READY.md](./codex/PLAN_PRODUCTION_READY.md)         | Security, CI/CD, Deploy, Observabilidad |
| [roadmap_production.md](./migration/artifacts/roadmap_production.md) | Workdays Module (8 sprints)             |

---

## 🤖 Generados por Agentes (`/_generated`)

Artefactos generados automáticamente por el sistema de agentes. **No editar manualmente.**

Ver [README](./_generated/README.md) para convención de naming.

| Carpeta                      | Agente         | Contenido                            |
| :--------------------------- | :------------- | :----------------------------------- |
| `_generated/frontend/`       | frontend       | Auditorías CSS, specs de componentes |
| `_generated/logic/`          | logic          | Specs de módulos JS, flujos de auth  |
| `_generated/data/`           | data           | Migraciones schema, specs de RPCs    |
| `_generated/qa/`             | qa             | Auditorías de coherencia, reportes   |
| `_generated/product/`        | product        | Investigación UX, journey maps       |
| `_generated/orchestrator/`   | orchestrator   | Planes cross-cutting, delegaciones   |
| `_generated/ui-scan/`        | ui-scanner     | Compliance matrix, planes UI         |
| `_generated/db-remediation/` | db-remediation | Prompts SQL de remediación           |

---

## 🏛️ Infraestructura de Agentes

| Archivo                                         | Propósito                                             |
| :---------------------------------------------- | :---------------------------------------------------- |
| [`AGENTS.md`](../AGENTS.md)                     | Reglas globales (semáforo de riesgo, gobernanza, DoD) |
| [`.agent/README.md`](../.agent/README.md)       | Estructura del sistema agents-of-agents               |
| [`.agent/REGISTRY.yml`](../.agent/REGISTRY.yml) | Routing canónico por intents + tiers de riesgo        |
