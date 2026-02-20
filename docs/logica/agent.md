# Agent Contract — Lógica de Negocio

> Este dominio documenta los flujos de negocio, máquinas de estado, y ciclos de vida de entidades.
> Cada flujo DEBE documentar: FSM + Tablas + RPCs + Componentes JS.

## Scope

Flujos operativos del sistema: workday lifecycle, cierre de caja, sesión de barra, síntesis estratégica. Los module docs detallados por pantalla ya no se mantienen — la lógica se documenta por **flujo**, no por módulo.

## Reglas de Interacción

| Regla                   | Descripción                                                                                                                        |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **R1 — Flow-Centric**   | Documentar por flujo de negocio, no por archivo JS. Un flujo puede involucrar múltiples módulos.                                   |
| **R2 — FSM Required**   | Cada flujo DEBE incluir su máquina de estados finitos con transiciones explícitas.                                                 |
| **R3 — Code Mapping**   | Cada flujo DEBE incluir una tabla de componentes técnicos (archivo JS, tabla DB, RPC, vista).                                      |
| **R4 — Verify vs Code** | Las referencias a funciones/tablas se verifican contra el código real. Si `rpc_close_work_day` se renombra, este doc se actualiza. |

## Inventario

| Archivo                 | Propósito                                           | Tamaño |
| :---------------------- | :-------------------------------------------------- | -----: |
| `workday-management.md` | Ciclo DRAFT→PLANNED→ACTIVE→CLOSED del Workday       |   6.7K |
| `night-cash-closing.md` | Reconciliación de caja en 2 fases                   |   5.5K |
| `bar-manager-night.md`  | Sesión de barra: apertura→activa→cierre             |   4.7K |
| `synthesis-report.md`   | Visión estratégica + DAG de datos + gaps de control |   7.1K |
