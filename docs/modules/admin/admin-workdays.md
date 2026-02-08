# Admin Workdays (Dashboard de 3 Tabs)

> **Ruta**: `pages/admin/admin-workdays.html`
> **JS**: `assets/js/modules/admin/admin-workdays.js`
> **CSS**: `assets/css/admin-workdays.css`
> **Roles**: Admin, Contable
> **Estado**: Release Candidate
> **Última Actualización**: 2026-02-08

---

## Objetivo Operativo

Centro de comando para la operación nocturna. Permite **planificar, ejecutar y cerrar** una jornada completa desde una sola pantalla.

## Arquitectura: 3 Tabs

```
┌──────────────────────────────────────────────┐
│  Tab 1: PLANIFICACIÓN (ZBB)                 │
│  ├─ Panel A: Definición (fecha, evento)     │
│  ├─ Panel B: Staff (dimensionamiento)       │
│  └─ Panel C: Costos apertura                │
├──────────────────────────────────────────────┤
│  Tab 2: EVENTO (Cierre Operativo)           │
│  ├─ KPIs: Sistema vs Declarado vs Diff      │
│  ├─ Caja: Reconciliación terminales         │
│  ├─ QR: Passline + Boletería + RRPP        │
│  ├─ Desglose: Ventas Barra + Entradas       │
│  ├─ Devenciones: Nómina devengada           │
│  └─ Barra: Auditoría (placeholder)          │
├──────────────────────────────────────────────┤
│  Tab 3: HISTÓRICO                           │
│  └─ Tabla de jornadas cerradas con KPIs     │
└──────────────────────────────────────────────┘
```

## Flujos Principales

### 1. Planificación ZBB (Tab 1)
1. Admin selecciona **fecha** → sistema verifica si ya existe jornada.
2. Configura **staff** por rol (cantidad + costo calculado).
3. Ajusta **costos de apertura** (Hielo, Seguridad, etc.).
4. Vincula **evento** del calendario y activa **countdown** web.
5. **Guarda/Abre** → crea `work_days`, `work_day_staff_planning`, `finance_payments`.

### 2. Cierre Operativo (Tab 2)
1. Importa CSVs: **Retiros**, **GBol**, **Passline**, **Terminales AFIP**.
2. Reconcilia caja por terminal (efectivo vs zoco, declarado vs sistema).
3. Genera **devenciones** de nómina basado en staff convocado.
4. Registra **notas de cierre**.
5. **Cierra Noche** → actualiza estado a `closed`.

### 3. Histórico (Tab 3)
- Tabla con fecha, evento, ingreso sistema, declarado, diferencia, staff, estado.

## Modelo de Datos

| Operación | Tablas | Descripción |
|:---|:---|:---|
| **Lectura** | `work_days` | Historial de jornadas |
| **Lectura** | `master_staff_roles` | Cargos y tarifas base |
| **Lectura** | `finance_opening_cost_defs` | Costos recurrentes default |
| **Lectura** | `events` | Eventos del calendario |
| **Lectura** | `cash_closings` | Datos de cierre por terminal |
| **Lectura** | `staff_accruals` | Devenciones de nómina |
| **Lectura** | `vw_daily_sales` | Desglose de ventas (vista) |
| **Escritura** | `work_days` | Crear/actualizar jornada |
| **Escritura** | `work_day_staff_planning` | Plan de staff (upsert) |
| **Escritura** | `staff_convocations` | Asignación de personal (upsert) |
| **Escritura** | `finance_payments` | Costos de apertura |
| **Escritura** | `staff_accruals` | Generar devenciones |
| **RPC** | `rpc_open_work_day` | Apertura con fallback automático |

## Importadores CSV (Tab Evento)

| Botón | Archivo | Función |
|:---|:---|:---|
| RETIROS | `file-extracciones` | `importer-extracciones.js` |
| GBOL | `file-gbol` | `importer-gbol.js` |
| PASSLINE | `file-passline` | `importer-passline.js` |
| TERMINALES | `file-afip` | `importer-afip.js` |

## Componentes UI

- **Layout**: `app-shell admin-shell admin-scroll`
- **Tab Bar**: `.tab-bar` con 3 tabs (Planificación / Evento / Histórico)
- **Planner**: `.planner-layout` (sidebar + canvas)
- **Modals**: Confirmar cierre, crear evento, agregar costo
- **Sticky Footer**: Estado + botones Guardar / Abrir

## Bugs Corregidos & Mejoras

- **v2.0**: Modal Eventos fix, RPC fallback, carga paralela.
- **v2.1**: Inline styles removidos, JS opacity refactorizado a CSS class `.is-checking`.
