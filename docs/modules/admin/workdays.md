# WORKDAYS — Admin Module

## Arquitectura del Sistema

Módulo de gestión integral de jornadas de trabajo. Arquitectura 3-tab con máquina de estados.

### Status Machine

```
DRAFT → PLANNED → ACTIVE → CLOSED
  ↑________↗ (revert)
```

| Estado | Quién ve | Acciones permitidas |
|--------|----------|---------------------|
| **DRAFT** | Admin | Editar plan, asignar staff, agregar costos |
| **PLANNED** | Admin + Encargados | Revisar, revertir a DRAFT, abrir jornada |
| **ACTIVE** | Todos | Night Chief live, importar datos, cerrar noche |
| **CLOSED** | Admin | Solo lectura, reports, P&L |

### Archivos

| Archivo | Propósito |
|---------|-----------|
| `pages/admin/admin-workdays.html` | Vista HTML (3 tabs) |
| `assets/js/modules/admin/admin-workdays.js` | Lógica principal (IIFE async) |
| `assets/css/components.css` | Estilos compartidos (FASE 4-5) |

---

## TAB 1: PLANNER (Planificación)

**Siempre visible.** Gestión pre-operativa.

- **Selector de Fecha** → verifica existencia en DB (`work_days`)
- **Staff Plan** → dotación por cargo (`work_day_staff_planning`)
- **Costos Fijos** → `finance_payments` con `source_type: RECURRENTE`
- **Eventos** → selector + creación rápida con QR batch automático
- **KPIs** → Staff estimado, Costo fijo, Costo staff, Total

### Flujo
1. Admin selecciona fecha
2. Si no existe → modo "Crear Jornada" (status: DRAFT)
3. Si existe → modo "Editar" con botón dinámico según estado
4. `Confirmar Plan` → DRAFT → PLANNED
5. `Abrir Jornada` → PLANNED → ACTIVE (vía `rpc_open_work_day`)

---

## TAB 2: NIGHT CHIEF (Supervisión Nocturna)

**Solo visible con status ACTIVE.** Consolida cierre de caja + stock audit.

### Cierre de Caja
- Terminales POS → declarado vs sistema → diferencias
- QR stats (Passline, Boletería, RRPP)
- Breakdown de ventas (`vw_daily_sales`)
- Notas de cierre
- Botón **CERRAR NOCHE** (con pre-checks: barras + terminales)

### Stock Audit
- KPIs: costo físico, costo teórico, eficiencia, variación
- Tabla de consumo por categoría (teórico vs real)

### Live Features (Phase D)
- **Polling 60s**: actualiza KPIs automáticamente mientras ACTIVE
- **Anomaly Alerts**: diferencia de caja >$5000, variación stock >±15%
- **Import Bar**: Extracciones CSV, GBOL, Passline, AFIP

### Devengaciones
- Generación de accruals para staff (`admin_generate_workday_accruals`)
- Ajuste manual de montos

---

## TAB 3: REPORT (Histórico)

**Siempre accesible.** Vista de jornadas pasadas.

- Tabla premium desde `vw_night_snapshot` (últimas 50 jornadas)
- Columnas: fecha, evento, ingresos, GBOL, retiros, declarado, diferencia, stock loss, staff cost, estado
- Click en fila → navega a esa fecha en tab PLANNER

---

## Metodología Operativa

Protocolo **Lápiz vs. Tinta** (Constitution §2):

1. **Lápiz (Draft)**: Propuesta visual, validación de reglas sin tocar DB
2. **Tinta (Commit)**: Persistencia en Supabase tras confirmación explícita

### RPCs del módulo

| RPC | Transición | Descripción |
| :--- | :---------- | :----------- |
| `rpc_confirm_work_day` | DRAFT → PLANNED | Confirma planificación |
| `rpc_revert_work_day` | PLANNED → DRAFT | Revierte a borrador |
| `rpc_open_work_day` | PLANNED → ACTIVE | Abre jornada con pre-flight |
| `rpc_close_work_day` | ACTIVE → CLOSED | Cierra con health_score + net_result |
| `admin_generate_workday_accruals` | — | Genera devengaciones de staff |

> **Estado CANCELLED**: Disponible para jornadas que se anulan antes de ejecutarse. No se alcanza automáticamente; requiere acción manual.
