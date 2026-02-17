# Migración: WorkDays Unificado + Balance Semanal

Documentación de migración para la fusión de los prototipos en 2 módulos de producción.

## Tracks

| Track                    | Prototipos Fuente                     | Módulo Destino                                          | Estado         |
| :----------------------- | :------------------------------------ | :------------------------------------------------------ | :------------- |
| **A** WorkDays Unificado | `lab-workdays` + `lab-workdays-night` | `admin-workdays` (3 tabs: PLANNER, NIGHT CHIEF, REPORT) | 🔄 En progreso |
| **B** Balance Semanal    | `lab-balance-semanal`                 | `balance-semanal` (módulo independiente)                | 📋 Planificado |

## Contenido

| Documento    | Descripción                                  | Estado    |
| :----------- | :------------------------------------------- | :-------- |
| `artifacts/` | Documentos de análisis y sprints completados | ✅ Limpio |

### Artefactos Individuales

| Documento                                                                            | Contenido                               |
| :----------------------------------------------------------------------------------- | :-------------------------------------- |
| [README.md](./artifacts/README.md)                                                   | Índice de artefactos                    |
| [erp-diagnostic-workdays.md](./artifacts/erp-diagnostic-workdays.md)                 | Diagnóstico ERP: Módulo Workdays        |
| [kpi-audit.md](./artifacts/kpi-audit.md)                                             | Auditoría KPI: Mock Data vs Schema      |
| [roadmap_production.md](./artifacts/roadmap_production.md)                           | Roadmap a Producción                    |
| [ux_research_workdays.md](./artifacts/ux_research_workdays.md)                       | UX Research: Workdays Prototypes        |
| [sprint3-implementation_plan.md](./artifacts/sprint3-implementation_plan.md)         | Sprint 3: Plan de Implementación        |
| [sprint3-walkthrough.md](./artifacts/sprint3-walkthrough.md)                         | Sprint 3: Walkthrough                   |
| [workdays-ui-implementation_plan.md](./artifacts/workdays-ui-implementation_plan.md) | Workdays UI: 6 Edits Plan               |
| [workdays-ui-walkthrough.md](./artifacts/workdays-ui-walkthrough.md)                 | Workdays UI: Density Polish Walkthrough |

## Fuentes

- **Prototipos**: `formulamid-prototypes/screens/lab-*`
- **Producción**: `tester_3.0/pages/admin/admin-workdays.html`
- **DB**: Supabase project `iyknbgmcnbpvalvsjxjz`
