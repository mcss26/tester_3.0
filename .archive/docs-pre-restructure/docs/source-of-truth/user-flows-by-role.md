# User Flows por Rol — Mapa Completo + Gap Analysis

> **Fuentes**: 4 notebooks NotebookLM + 45 pantallas tester_3.0 + screen-map.md + data-allowed-roles
> **Fecha**: 11-Feb-2026
> **Propósito**: Alinear skills de desarrollo con la realidad operativa

---

## Descubrimiento Clave: 12 Roles en Código vs 6 Documentados

Los notebooks documentan 6 roles (Admin, Contable, Operativo, Logístico, Encargado, Staff).
El código **implementa 12 sub-roles**:

| Rol Base      | Sub-roles en código                                                              | Pantallas                    |
| ------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| **Admin**     | `admin`                                                                          | 20+ (acceso total)           |
| **Contable**  | `contable`                                                                       | 12 (compartidas con admin)   |
| **Gerente**   | `gerente`                                                                        | 1 (`balance-semanal`)        |
| **Operativo** | `operativo`, `staff_operativo`                                                   | 9                            |
| **Logístico** | `logistico`                                                                      | 5 + 3 compartidas            |
| **Encargado** | `encargado_barra`, `encargado_caja`, `encargado_limpieza`, `encargado_seguridad` | 7                            |
| **Staff**     | `staff_barra`, `staff_caja`, `staff_guardia`, `staff_seguridad`                  | 2-3                          |
| **Manager**   | `manager`                                                                        | 1 (`qr/monitor`)             |
| **Member**    | (sin rol explícito)                                                              | 0 (migrado a `midnightclub`) |

> [!IMPORTANT]
> Los roles `encargado_limpieza`, `encargado_seguridad`, `staff_guardia`, `staff_seguridad`, `gerente`, y `manager` no están documentados en ningún notebook pero SÍ están en el código.

---

## 1. Admin — Control Total

### Pantallas (20+)

```
admin-index.html ─── Dashboard
├── Operaciones Diarias
│   ├── admin-workdays.html ─── Gestión jornadas + Night Chief + Cierre
│   ├── admin-solicitudes.html ─── Centro de solicitudes
│   ├── admin-reportes.html ─── Reportes
│   ├── admin-semanal.html ─── Cierre semanal
│   └── admin-config.html ─── Configuración
├── Inventario
│   └── admin-central-stock.html ─── Stock + Recetas + Rentabilidad
├── Maestros
│   ├── admin-master-proveedores.html
│   ├── admin-master-categorias.html
│   ├── admin-master-tarifario.html
│   ├── admin-master-nomina.html
│   ├── admin-master-pos.html
│   └── admin-pagos.html
└── QR
    ├── qr/index.html
    ├── qr/generator.html
    └── qr/monitor.html
```

### Flujo de un día típico (Admin) — Ciclo OPERACIONAL (diario)

```
1. ANTES de abrir ───────────────────────────────────────────────────
   admin-workdays.html → Crear/Planificar workday (staff, evento, template)
   admin-solicitudes.html → Revisar solicitudes pendientes
   admin-central-stock.html → Verificar stock general

2. DURANTE la noche ─────────────────────────────────────────────────
   admin-workdays.html (Night Chief tab) → KPIs en vivo, break-even
   qr/monitor.html → Monitorear ingresos QR
   admin-reportes.html → Reportes en tiempo real

3. DESPUÉS (pre-cierre/cierre) ──────────────────────────────────────
   admin-workdays.html (Cierre tab) → P&L, verificar diferencias
   admin-pagos.html → Generar pagos pendientes
   ★ FIN del ciclo operacional diario
```

### Flujo semanal (Admin) — Ciclo FINANCIERO (lunes)

```
4. LUNES — Balance Semanal ──────────────────────────────────────────
   balance-semanal.html → Cruces de caja (8 POS × sistema vs rendición)
                        → Cruces de rendimiento (SKU × comandas vs consumido)
                        → ZOCO vs Sistema (descalces de procesadores)
                        → Gap fiscal (POS vs AFIP)
                        → Documentos/evidencia (GBOL exports, extractos)
                        → Export CSV/PDF
   ★ Módulo INDEPENDIENTE, no parte de Workdays
```

### Gaps del Admin

| Lo que debería tener (GBol) | Estado                                   | Prioridad |
| --------------------------- | ---------------------------------------- | --------- |
| 8 tipos de auditoría        | ❌ No existe                             | 🔴 Alta   |
| Dashboard de health score   | ⚠️ Calculado, sin visualización dedicada | 🟡 Media  |
| Comparativa GBol vs FM4     | ❌ No existe                             | 🟢 Baja   |

---

## 2. Operativo — Manager de Turno

### Pantallas (9)

```
operativo-index.html ─── Dashboard
├── ERP Operativo
│   ├── operativo-workday.html ─── Jornada del día (passline, staff, stock)
│   ├── operativo-stock.html ─── Stock en tiempo real
│   ├── operativo-solicitudes.html ─── Solicitudes (crear + seguimiento)
│   ├── operativo-analisis.html ─── Análisis de datos
│   └── scanner.html ─── Scanner QR
├── Comunidad
│   └── cms-members.html ─── Gestión miembros
└── Maestros (vista)
    ├── operativo-master-sku.html ─── Catálogo SKU (lectura)
    └── operativo-master-proveedores.html ─── Proveedores (lectura)
```

### Flujo de un día típico (Operativo)

```
1. PRE-APERTURA ─────────────────────────────────────────────────────
   operativo-workday.html → Ver staff confirmado, ausentes, rendimiento
   operativo-stock.html → Verificar stock actual vs ideal
   operativo-solicitudes.html → Crear solicitudes urgentes

2. DURANTE ──────────────────────────────────────────────────────────
   operativo-workday.html → Passline links (capacidad, ventas)
   scanner.html → Escanear QR de ingreso
   operativo-stock.html → Monitorear consumo en vivo

3. POST ─────────────────────────────────────────────────────────────
   operativo-analisis.html → Revisar performance
   operativo-solicitudes.html → Generar solicitudes para reposición
```

### Gaps del Operativo

| Lo que debería tener                  | Estado                               | Prioridad |
| ------------------------------------- | ------------------------------------ | --------- |
| Vista de rendimiento staff individual | ⚠️ Existe workday pero sin historial | 🔴 Alta   |
| Alerta stock bajo en tiempo real      | ⚠️ Stock existe, alertas no          | 🟡 Media  |
| Chat/comunicación con Encargados      | ❌ No existe                         | 🟡 Media  |
| Panel de emergencia (seguridad)       | ❌ No digitalizado (es físico hoy)   | 🟢 Baja   |

---

## 3. Logístico — Jefe de Depósito

### Pantallas (5)

```
logistica-index.html ─── Dashboard
├── logistica-stock.html ─── Stock en depósito central
├── logistica-distribucion.html ─── Órdenes de distribución
├── logistica-recepcion.html ─── Recepción de mercadería
└── logistica-seguimiento.html ─── Seguimiento de órdenes
```

### Flujo principal (Logístico)

```
1. RECIBE solicitud (de Operativo/Encargado vía operativo-solicitudes)
2. logistica-seguimiento → Ve solicitudes pendientes
3. logistica-stock → Verifica disponibilidad en depósito
4. logistica-distribucion → Prepara orden de distribución
5. logistica-recepcion → Registra recepción de proveedor
6. → Staff de barra confirma recepción (encargado-recepcion.html)
```

### Gaps del Logístico

| Lo que debería tener                           | Estado                                        | Prioridad |
| ---------------------------------------------- | --------------------------------------------- | --------- |
| Conexión directa con Solicitudes del Operativo | ⚠️ Puede ver, pero no hay flujo bidireccional | 🔴 Alta   |
| Notificaciones de stock crítico                | ❌ No existe                                  | 🔴 Alta   |
| Historial de recepciones vs pedidos            | ⚠️ Parcial                                    | 🟡 Media  |
| Integración con proveedores (ETA)              | ❌ No existe                                  | 🟢 Baja   |

---

## 4. Encargado — Supervisión de Área

### Pantallas (7, divididas en Barra y Caja)

```
ENCARGADO BARRA (3):                    ENCARGADO CAJA (3):
encargado-barra-index.html ─ Dashboard  encargado-caja-index.html ─ Dashboard
encargado-barra-noche.html ─ Cierre     encargado-caja-noche.html ─ Cierre
encargado-barra-personal.html ─ Staff   encargado-caja-personal.html ─ Staff

COMPARTIDA (1):
encargado-recepcion.html ─── Confirmar recepción de insumos
```

### Flujo principal (Encargado Barra)

```
1. PRE-APERTURA ─────────────────────────────────────────────────────
   encargado-barra-personal.html → Confirmar staff presente
   encargado-recepcion.html → Verificar insumos recibidos

2. DURANTE ──────────────────────────────────────────────────────────
   encargado-barra-index.html → Monitorear ventas por terminal
   (Sin pantalla dedicada) → Aprobar solicitudes de su zona

3. CIERRE ───────────────────────────────────────────────────────────
   encargado-barra-noche.html → Cierre de barras, verificar diferencias
   → Datos fluyen a admin-workdays (Night Chief tab)
```

### Flujo principal (Encargado Caja)

```
1. PRE-APERTURA → encargado-caja-personal.html → Staff asignado
2. DURANTE → encargado-caja-index.html → Monitor terminales
3. CIERRE → encargado-caja-noche.html → Arqueo, validar cierres Staff
```

### Gaps del Encargado

| Lo que debería tener                                   | Estado                                                                                    | Prioridad |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- | --------- |
| Arqueo ciego del Staff (GBol workflow)                 | ❌ El workflow dice que Staff cierra sin ver totales, Encargado verifica. No implementado | 🔴 Alta   |
| Aprobación de solicitudes desde su vista               | ⚠️ Puede ver, no aprobar directamente                                                     | 🟡 Media  |
| `encargado_limpieza` y `encargado_seguridad` pantallas | ❌ Roles en código, sin pantallas propias                                                 | 🟡 Media  |
| Dashboard unificado (no tener que elegir barra/caja)   | ❌ Son dos flujos separados                                                               | 🟢 Baja   |

---

## 5. Staff — Terminal POS

### Pantallas (2)

```
staff-barra-index.html ─── POS Barra (venta de tragos)
staff-caja-index.html ─── POS Caja/Boletería (venta de entradas)
```

### Flujo (Staff)

```
1. Login → Se valida rol → Redirige a su POS
2. Abrirl turno → Vende durante la noche
3. Cierre → Arqueo ciego (debería no ver totales del sistema)
4. → Encargado verifica diferencias
```

### Sub-roles sin pantalla propia

| Sub-rol           | En código                      | Pantalla dedicada                 | Gap                                 |
| ----------------- | ------------------------------ | --------------------------------- | ----------------------------------- |
| `staff_barra`     | ✅                             | ✅ `staff-barra-index`            | —                                   |
| `staff_caja`      | ✅                             | ✅ `staff-caja-index`             | —                                   |
| `staff_guardia`   | ✅ (en `scanner.html`)         | ❌ Comparte scanner con Operativo | Podría necesitar vista simplificada |
| `staff_seguridad` | ✅ (en `encargado-caja-noche`) | ❌ Sin vista propia               | Aclarar si necesita algo            |
| `staff_operativo` | ✅ (en varias operativo)       | ❌ Comparte con Operativo         | Aclarar permisos                    |

---

## 6. Roles Secundarios

### Contable

- Acceso a **12 pantallas** de Admin (solo lectura/validación)
- No tiene dashboard propio — entra por las mismas pantallas de Admin
- **Gap**: No tiene vista de auditoría dedicada (las 8 auditorías de GBol)

### Gerente

- Acceso principal: `balance-semanal.html` — módulo financiero semanal
- El Balance Semanal es un módulo completo: cruces de caja, rendimiento, ZOCO, fiscal, documentos
- **Gap**: Necesita comparativas históricas (semana vs semana anterior), tendencias multiperiodo

### Manager

- Solo `qr/monitor.html`
- **Gap**: Rol poco documentado. ¿Es un alias de otro rol?

### Member

- Migrado a repo público `midnightclub` (`members-only.html`)
- QR se genera en la propia página del member via edge function `generate-member-qr`

---

## 7. Flujos Cross-Rol (Cadena Completa)

### Flujo de Stock (5 pasos, 4 roles)

```
Operativo detecta falta        Encargado aprueba          Logístico prepara           Encargado recibe
operativo-solicitudes.html  →  (sin pantalla propia)  →  logistica-distribucion  →  encargado-recepcion
       [OPERATIVO]                 [ENCARGADO]              [LOGÍSTICO]              [ENCARGADO]
                                                                                         │
                                                                                         ▼
                                                                              Admin verifica
                                                                           admin-solicitudes
                                                                               [ADMIN]
```

> [!WARNING]
> **Gap crítico**: El paso 2 (aprobación del Encargado) no tiene pantalla dedicada. El Encargado no puede aprobar/rechazar solicitudes desde su propia interfaz.

### Flujo de Caja (5 pasos, 3 roles)

```
Staff abre terminal → Staff vende → Staff cierra (arqueo ciego) → Encargado verifica → Admin cierra definitivo
  staff-*-index       staff-*-index     (NO EXISTE)            encargado-*-noche      admin-workdays
    [STAFF]             [STAFF]          [STAFF]                 [ENCARGADO]             [ADMIN]
```

> [!WARNING]
> **Gap crítico**: El arqueo ciego (Staff cierra sin ver totales del sistema) no está implementado. El Staff ve todo.

### Flujo de Ingreso (3 fases, roles físicos)

```
Seguridad Privada → Policía → Validadores → Operativo (Scanner)
    [FÍSICO]        [FÍSICO]    [FÍSICO]     scanner.html
                                              [OPERATIVO / STAFF_GUARDIA]
```

> [!NOTE]
> Este flujo es mayormente físico. Solo el paso final (scanner QR) está digitalizado. El protocolo está en NB4 pero no hay necesidad inmediata de digitalizarlo más allá del scanner.

---

## 8. Matriz Pantalla × Rol (Permisos Reales del Código)

| Pantalla               | admin | contable | operativo | logistico | enc_barra | enc_caja | staff_barra | staff_caja |
| ---------------------- | :---: | :------: | :-------: | :-------: | :-------: | :------: | :---------: | :--------: |
| admin-index            |  ✅   |          |           |           |           |          |             |            |
| admin-workdays         |  ✅   |    ✅    |           |           |           |          |             |            |
| admin-solicitudes      |  ✅   |    ✅    |           |           |           |          |             |            |
| admin-reportes         |  ✅   |    ✅    |           |           |           |          |             |            |
| admin-semanal          |  ✅   |    ✅    |           |           |           |          |             |            |
| admin-central-stock    |  ✅   |    ✅    |           |    ✅     |           |          |             |            |
| admin-pagos            |  ✅   |    ✅    |           |           |           |          |             |            |
| admin-config           |  ✅   |          |           |           |           |          |             |            |
| admin-master-\* (6)    |  ✅   |    ✅    |           |           |           |          |             |            |
| operativo-index        |  ✅   |          |    ✅     |           |    ✅     |    ✅    |             |            |
| operativo-workday      |  ✅   |          |    ✅     |           |    ✅     |    ✅    |     ✅      |     ✅     |
| operativo-stock        |  ✅   |          |    ✅     |    ✅     |           |          |             |            |
| operativo-solicitudes  |  ✅   |          |    ✅     |    ✅     |           |          |             |            |
| operativo-analisis     |  ✅   |          |    ✅     |    ✅     |           |          |             |            |
| operativo-master-sku   |  ✅   |          |    ✅     |           |           |          |             |            |
| scanner                |  ✅   |          |    ✅     |           |           |          |             |            |
| cms-members            |  ✅   |    ✅    |    ✅     |           |           |          |             |            |
| logistica-\* (5)       |  ✅   |          |           |    ✅     |           |          |             |            |
| encargado-barra-\* (3) |  ✅   |          |           |           |    ✅     |          |             |            |
| encargado-caja-\* (3)  |  ✅   |          |           |           |           |    ✅    |             |            |
| encargado-recepcion    |  ✅   |    ✅    |           |           |    ✅     |          |             |            |
| staff-barra-index      |  ✅   |          |           |           |           |          |     ✅      |            |
| staff-caja-index       |       |          |    ✅     |           |           |          |             |     ✅     |
| balance-semanal        |  ✅   |    ✅    |           |           |           |          |             |            |
| qr/index               |  ✅   |          |           |           |           |    ✅    |             |            |
| qr/generator           |  ✅   |          |           |           |           |          |             |            |
| qr/monitor             |  ✅   |          |           |           |           |          |             |            |

---

## 9. Resumen de Gaps — Priorizado por Impacto

### 🔴 Críticos (bloquean workflows documentados)

1. **Arqueo ciego Staff** — El workflow de GBol dice que Staff no debe ver totales. No implementado.
2. **Aprobación de solicitudes por Encargado** — Sin pantalla, el Encargado no puede aprobar solicitudes de su zona.
3. **Audit trail** — Las 8 auditorías de GBol (anulaciones, precios, conexiones) no existen en FM4.

### 🟡 Importantes (mejoran significativamente la operación)

4. **Vista unificada Contable** — Contable entra por pantallas de Admin sin dashboard propio.
5. **Alertas de stock bajo en tiempo real** — Solo hay check manual.
6. **Roles fantasma** — `encargado_limpieza`, `encargado_seguridad`, `staff_guardia` existen en código sin pantalla propia.
7. **Historial de rendimiento Staff** — Solo datos del día actual, sin tendencia.
8. **Flujo bidireccional Logístico ↔ Operativo** — Solicitudes van en una dirección, no hay feedback.

### 🟢 Deseables (nice-to-have)

9. **Dashboard Gerente expandido** — Balance Semanal ya es módulo completo (rediseño v3), necesita comparativas históricas.
10. **Chat/notificaciones entre roles** — Comunicación es verbal/WhatsApp hoy.
11. **Digitalización protocolo ingreso** — Funciona bien en físico.
12. **Integración ETA proveedores** — Datos de proveedor no disponibles.

---

_Documento basado en 4 notebooks NotebookLM, 45 pantallas de tester_3.0, y `data-allowed-roles` del código fuente._
