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

## Fuentes

- **Prototipos**: `formulamid-prototypes/screens/lab-*`
- **Producción**: `tester_3.0/pages/admin/admin-workdays.html`
- **DB**: Supabase project `iyknbgmcnbpvalvsjxjz`
