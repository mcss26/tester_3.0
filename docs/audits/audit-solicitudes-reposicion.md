# Auditoría — Flujo Solicitudes / Reposición

> **Fecha:** 2026-02-17 07:15  
> **Agente:** Antigravity  
> **Estado:** 🔴 FLUJO BLOQUEADO (datos estancados)

---

## 1. Diagrama del Flujo

```
OPERATIVO                   ADMIN                     LOGÍSTICA
─────────                   ─────                     ─────────
operativo-solicitudes.js    admin-solicitudes.js      logistica-recepcion.js
                                                      logistica-seguimiento.js
                                                      logistica-distribucion.js

[ensureDailyRequest]        [loadPreApprovalItems]    [loadData]
       │                           │                       │
       ▼                           ▼                       ▼
replenishment_requests  ──►  replenishment_items  ──►  replenishment_supplier_orders
 (11 rows, ALL draft)     (5 rows, ALL pending)      (5 rows, ALL approved)
       │                           │                       │
       ▼                           ▼                       ▼
  ¿target_work_day_id?      pre_approval_status?    replenishment_receipts (0 rows!)
  ALL = null ⚠️             ALL = "pending" ⚠️      replenishment_receipt_items (0 rows!)
                                                     replenishment_tracking (0 rows!)
                                                     inventory_movements (0 rows!)
```

---

## 2. Estado Actual de Datos

| Tabla                           | Rows | Estado | Problema                                        |
| ------------------------------- | ---- | ------ | ----------------------------------------------- |
| `replenishment_requests`        | 11   | 🔴     | 100% en `draft`, ninguno avanza                 |
| `replenishment_items`           | 5    | 🔴     | 100% `pending`, `pre_approval_status = pending` |
| `replenishment_supplier_orders` | 5    | 🟡     | 100% `approved` pero sin recepción              |
| `replenishment_receipts`        | 0    | 🔴     | Nunca se registró una recepción                 |
| `replenishment_receipt_items`   | 0    | 🔴     | Vacía                                           |
| `replenishment_tracking`        | 0    | 🔴     | Sin seguimiento                                 |
| `inventory_movements`           | 0    | 🔴     | Sin movimientos de entrada/salida               |
| `inventory_stock`               | 22   | 🟡     | Datos estáticos, no por movimientos             |

---

## 3. Ciclo de Vida de Status (Code ↔ DB)

### 3a. replenishment_requests

```
JS STATUS:     draft → ? (no hay lógica para avanzar más allá)
DB STATUS:     draft (11/11)
PROBLEMA:      ❌ No existe función para cerrar/completar un request
```

### 3b. replenishment_items

```
JS STATUS:     pending → cancelled (soft delete via onSupplierChange)
               pre_approval_status: pending → pre_approved | pre_rejected (admin-solicitudes.js)
DB STATUS:     ALL pending, pre_approval_status ALL pending
FILTRO CLAVE:  operativo JS filtra por pre_approval_status = "pre_approved" (línea 183)
PROBLEMA:      ❌ Los 5 items tienen pre_approval_status = "pending"
               → La tabla del operativo muestra 0 items porque filtra por "pre_approved"
               → ¡El operativo no ve nada! Necesita que admin pre-apruebe primero
```

### 3c. replenishment_supplier_orders

```
JS STATUS:     draft → ready_for_approval → approved → RECEIVED/PARTIAL
DB STATUS:     ALL approved (5/5)
PROBLEMA:      ❌ Status "approved" pero 0 recepciones → flujo detenido post-aprobación
               ❌ Inconsistencia case: JS escribe 'RECEIVED'/'PARTIAL' (mayúscula)
                  pero crea con 'draft'/'approved' (minúscula) → CASE MISMATCH
```

### 3d. Flujo de Recepción (logistica-recepcion.js)

```
confirmReceive() hace TODO (correcto en diseño):
  1. Actualiza supplier_order con invoice_number
  2. Propaga factura a finance_payments
  3. Crea replenishment_receipts
  4. Crea replenishment_receipt_items
  5. Crea inventory_movements (type: 'in')
  6. Actualiza inventory_stock (upsert)
  7. Cambia order status → 'RECEIVED' o 'PARTIAL'

PROBLEMA: ❌ Nunca se ejecutó (0 receipts, 0 movements)
POSIBLE RAÍZ: Las órdenes están en status 'approved' (lowercase)
              pero el renderizado puede filtrar por status diferente
```

---

## 4. Bugs Detectados

### 🔴 BUG 1 — Case Mismatch en supplier_orders status

**Impacto: Alto**

El JS escribe status con case mixto:

- `'draft'`, `'ready_for_approval'`, `'approved'` → minúscula (operativo-solicitudes.js)
- `'RECEIVED'`, `'PARTIAL'` → MAYÚSCULA (logistica-recepcion.js)

Esto puede causar que filtros fallen al comparar status.

**Ubicación:**

- `operativo-solicitudes.js:567` → `ready_for_approval` (minúscula)
- `operativo-solicitudes.js:598` → `draft` (minúscula)
- `logistica-recepcion.js:454-455` → `RECEIVED` / `PARTIAL` (MAYÚSCULA)

### 🔴 BUG 2 — Operativo no ve items sin pre-aprobación

**Impacto: Alto**

`operativo-solicitudes.js:183` filtra:

```javascript
.eq("pre_approval_status", "pre_approved")
```

Pero los 5 items tienen `pre_approval_status = "pending"`.

**Resultado:** La tabla SKU del operativo **siempre está vacía** para estos items.
El operativo carga items automáticamente (`populateItems`), pero después no los ve
porque no fueron pre-aprobados por admin aún.

### 🟡 BUG 3 — replenishment_receipts schema vs JS mismatch

**Impacto: Medio**

`logistica-recepcion.js:391-392` intenta insertar:

```javascript
receipt_date: new Date().toISOString(),
total_amount: selectedOrder.final_cost || 0,
```

Pero el schema de `replenishment_receipts` no tiene columnas `receipt_date` ni `total_amount`:

```
id, supplier_order_id, received_by, received_at, notes, created_at
```

→ **INSERT fallará** cuando se intente recibir mercadería.

### 🟡 BUG 4 — replenishment_receipt_items schema vs JS mismatch

**Impacto: Medio**

`logistica-recepcion.js:407-408` intenta insertar:

```javascript
quantity_received: item.quantity_received,
cost_at_receipt: 0
```

Pero el schema tiene columnas diferentes:

```
expected_units, received_units, diff_units, counted_qty, counted_by, counted_at, count_notes, count_status
```

→ **INSERT fallará** — columna `quantity_received` no existe, debe ser `received_units`.
→ **INSERT fallará** — columna `cost_at_receipt` no existe.

### 🔴 BUG 5 — inventory_movements schema mismatch TOTAL

**Impacto: ALTO** (confirmado)

`logistica-recepcion.js:420-425` inserta en `inventory_movements` con columnas:

```javascript
{
  (sku_id, created_by, type, quantity, cost, notes);
}
```

Pero el schema real es completamente diferente:

```
id (uuid, NOT NULL)
sku_id (uuid, NOT NULL)
qty_delta (numeric, NOT NULL)     ← JS usa "quantity"
movement_type (text, NOT NULL)    ← JS usa "type"
ref_table (text, NOT NULL)        ← JS no envía este campo (NOT NULL!)
ref_id (uuid, NOT NULL)           ← JS no envía este campo (NOT NULL!)
created_by (uuid, NOT NULL)
created_at (timestamptz, NOT NULL)
```

→ **INSERT fallará** por múltiples razones:

- `quantity` → debe ser `qty_delta`
- `type` → debe ser `movement_type`
- `cost` → no existe en el schema
- `notes` → no existe en el schema
- `ref_table` y `ref_id` son NOT NULL y no se envían → violación de constraint

### 🔴 BUG 7 — inventory_stock usa `stock_actual`, no `quantity`

**Impacto: ALTO** (confirmado y corregido)

`logistica-recepcion.js` (ambas funciones de recepción) usan:

```javascript
.select('quantity')
// y
{ sku_id, quantity: newQty, updated_at }
```

Pero el schema real tiene `stock_actual`:

```
sku_id (uuid, NOT NULL)
stock_actual (numeric, NOT NULL)  ← JS usaba "quantity"
updated_at (timestamptz, NOT NULL)
requerido (numeric, nullable)
```

→ **SELECT fallará** y el stock nunca se actualizaría post-recepción.

### 🟢 BUG 8 — requests sin target_work_day_id

**Impacto: Bajo**

Los 11 requests tienen `target_work_day_id = null`, lo que impide vincular
la solicitud con una jornada específica para calcular costos del PnL.

---

## 5. Estado de Resolucion

> **Ultima verificacion:** 2026-02-17 10:30 — Schema cruzado contra DB real (Supabase live)

| Bug    | Descripcion                                  | Estado                                                                        | Verificado |
| ------ | -------------------------------------------- | ----------------------------------------------------------------------------- | :--------: |
| BUG 1  | Case mismatch en status                      | ✅ FIXED — lowercase + toUpperCase() en lecturas                              | 2026-02-17 |
| BUG 2  | Items no visibles por pre-aprobacion         | ⚠️ By design — requiere accion de admin                                       | 2026-02-17 |
| BUG 3  | Receipt insert columnas incorrectas          | ✅ FIXED + VERIFIED — `received_at` + `notes` match schema                    | 2026-02-17 |
| BUG 4  | Receipt items columnas incorrectas           | ✅ FIXED + VERIFIED — `expected_units/received_units/diff_units` match schema | 2026-02-17 |
| BUG 5  | Inventory movements schema total mismatch    | ✅ FIXED + VERIFIED — `qty_delta/movement_type/ref_table/ref_id` match schema | 2026-02-17 |
| BUG 7  | Inventory stock `quantity` -> `stock_actual` | ✅ FIXED + VERIFIED — upsert con PK `sku_id` compatible                       | 2026-02-17 |
| BUG 8  | Requests sin work_day_id                     | ℹ️ Mejora pendiente                                                           |     —      |
| BUG 9  | Free receipt: `supplier_order_id` NOT NULL   | ✅ FIXED — Migracion DB: `DROP NOT NULL` aplicada                             | 2026-02-17 |
| BUG 10 | Pre-aprobación: ID mismatch + upsert + RLS   | ✅ FIXED + VERIFIED — Upsert + RLS policy + filtro exclusión. 8 items en DB   | 2026-02-17 |
| BUG 11 | Auto-pago: `supplier_id` siempre null        | ✅ FIXED — Usa `order.supplier_id` directo en vez de ruta anidada inexistente | 2026-02-17 |

### BUG 9 — Detalle (detectado en verificacion P1)

**Problema:** `confirmFreeReceipt()` en `logistica-recepcion.js:553` insertaba `supplier_order_id: null` pero la columna era `NOT NULL` en el schema. Toda recepcion libre fallaba silenciosamente.

**Fix aplicado:** Migracion `fix_receipts_allow_null_supplier_order`:

```sql
ALTER TABLE public.replenishment_receipts
  ALTER COLUMN supplier_order_id DROP NOT NULL;

COMMENT ON COLUMN public.replenishment_receipts.supplier_order_id IS
  'FK to replenishment_supplier_orders. NULL = free receipt (no linked order).';
```

**Rollback:** `ALTER TABLE replenishment_receipts ALTER COLUMN supplier_order_id SET NOT NULL;`

### BUG 10 — Detalle (triple causa raíz)

**Problema:** La pre-aprobación en `admin-solicitudes.js` fallaba silenciosamente:

1. ID mismatch — funciones filtraban por `replenishment_items.id` pero la UI pasaba `sku.id`
2. Items inexistentes — SKUs con déficit no tenían registro en `replenishment_items`
3. RLS bloqueante — policy solo permitía `operativo`/`logistico`, no `admin`/`contable`

**Fix aplicado:**

- Lógica upsert en `preApproveItems()` y `submitPreReject()` (update pending + insert missing)
- RLS policy `Admin pre-approve items` para `admin`/`contable`
- Filtro de exclusión en `loadPreApprovalItems()` para items ya procesados

### BUG 11 — Detalle

**Problema:** `updateStatus()` creaba auto-pago en `finance_payments` con `supplier_id` siempre `null` porque usaba `order.items[0]?.master_sku?.proveedor_default_id` — pero `proveedor_default_id` no estaba en el `select()` de `loadOrders`.
**Fix:** Mapeó `supplier_id` en el objeto order (ya viene del `select *`) y lo usó directamente.

---

## 5b. Verificacion P1 — Schema vs JS (Matriz Completa)

### `replenishment_receipts` INSERT

| Columna DB          | NOT NULL | JS `confirmReceive` | JS `confirmFreeReceipt` | Estado |
| ------------------- | :------: | ------------------- | ----------------------- | :----: |
| `id`                |    Si    | auto (default)      | auto (default)          |   ✅   |
| `supplier_order_id` |  **No**  | `selectedOrder.id`  | `null`                  |   ✅   |
| `received_by`       |    Si    | `session.user.id`   | `session.user.id`       |   ✅   |
| `received_at`       |    Si    | `toISOString()`     | `toISOString()`         |   ✅   |
| `notes`             |    No    | concatenado         | concatenado             |   ✅   |
| `created_at`        |    Si    | auto (default)      | auto (default)          |   ✅   |

### `replenishment_receipt_items` INSERT

| Columna DB       | NOT NULL | JS envia                       | Estado |
| ---------------- | :------: | ------------------------------ | :----: |
| `id`             |    Si    | auto                           |   ✅   |
| `receipt_id`     |    Si    | `receipt.id`                   |   ✅   |
| `sku_id`         |    Si    | `item.sku_id`                  |   ✅   |
| `expected_units` |    Si    | `item.quantity_expected` / `0` |   ✅   |
| `received_units` |    Si    | `item.quantity_received`       |   ✅   |
| `diff_units`     |    No    | calculado                      |   ✅   |
| `counted_*`      |    No    | no envia (nullable, OK)        |   ✅   |

### `inventory_movements` INSERT

| Columna DB      | NOT NULL | JS envia                       | Estado |
| --------------- | :------: | ------------------------------ | :----: |
| `id`            |    Si    | auto                           |   ✅   |
| `sku_id`        |    Si    | `item.sku_id`                  |   ✅   |
| `qty_delta`     |    Si    | `item.quantity_received`       |   ✅   |
| `movement_type` |    Si    | `'receipt'` / `'free_receipt'` |   ✅   |
| `ref_table`     |    Si    | `'replenishment_receipts'`     |   ✅   |
| `ref_id`        |    Si    | `receipt.id`                   |   ✅   |
| `created_by`    |    Si    | `session.user.id`              |   ✅   |
| `created_at`    |    Si    | auto (default)                 |   ✅   |

### `inventory_stock` UPSERT

| Columna DB     | NOT NULL | JS envia      | Constraint              | Estado |
| -------------- | :------: | ------------- | ----------------------- | :----: |
| `sku_id`       |    Si    | `item.sku_id` | PK (soporta onConflict) |   ✅   |
| `stock_actual` |    Si    | `newQty`      | —                       |   ✅   |
| `updated_at`   |    Si    | ISO string    | —                       |   ✅   |

---

## 5c. Verificacion P2 — Pre-Aprobacion Admin

### Flujo verificado en `admin-solicitudes.js`:

| Checkpoint             | Resultado | Detalle                                                                            |
| ---------------------- | :-------: | ---------------------------------------------------------------------------------- |
| Carga items pendientes |    ✅     | Auto-deteccion dinamica via `master_sku` + `vw_stock_global` + consumo 30d         |
| UI de seleccion        |    ✅     | Tabs `por-item` / `por-proveedor` con checkboxes                                   |
| `preApproveItems()`    |    ✅     | Upsert: update pending + insert missing. RLS policy activa                         |
| `submitPreReject()`    |    ✅     | Upsert: update pending + insert rejected con reason                                |
| Post-cambio            |    ✅     | Recarga datos + filtra items procesados + Toast feedback                           |
| Cruce con operativo    |    ✅     | Operativo filtra `.eq('pre_approval_status', 'pre_approved')` — mismo valor exacto |
| Auto-pago              |    ✅     | `supplier_id` mapeado correctamente desde `replenishment_supplier_orders`          |

**Conclusion P2:** El flujo de pre-aprobacion es funcional y verificado en browser real (8 items pre-aprobados en DB).

---

## 6. Flujo Operativo Completo (Actualizado 2026-02-17)

### Narrativa por Rol

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASO 1 — DETECCIÓN AUTOMÁTICA                                             │
│ Sistema detecta SKUs con stock bajo deficit (stock_actual < stock_ideal)   │
│ Tabla: vw_stock_global + master_sku (ROP/MAX)                             │
│ Trigger: Cuando operativo o admin abren la página de solicitudes          │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASO 2 — PRE-APROBACIÓN (ADMIN / CONTABLE)                                │
│ 📍 admin-solicitudes.html → Tab "Pre-Aprobación"                          │
│                                                                             │
│ • Admin ve lista de SKUs con déficit calculado dinámicamente               │
│ • Revisa cantidades, costos estimados, proveedor por defecto              │
│ • Pre-aprueba ✅ o Pre-rechaza ❌ items individuales o en bulk            │
│ • Tabla: replenishment_items (pre_approval_status → 'pre_approved')       │
│                                                                             │
│ ⚡ Sin este paso, operativo NO VE items (filtro by design)                │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASO 3 — OPERATIVO BUSCA PROVEEDOR Y PRECIO                               │
│ 📍 operativo-solicitudes.html                                              │
│                                                                             │
│ • Ve solo items pre-aprobados por admin                                    │
│ • Para cada item: selecciona proveedor, confirma precio (costo_pack)      │
│ • Agrupa items por proveedor → crea supplier_order (status: 'draft')      │
│ • Ingresa costo final y fecha ETA → order pasa a 'ready_for_approval'     │
│ • Tablas: replenishment_supplier_orders, replenishment_items              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASO 4 — APROBACIÓN FINAL (ADMIN)                                          │
│ 📍 admin-solicitudes.html → Tab "Pendientes"                               │
│                                                                             │
│ • Admin ve órdenes con status 'ready_for_approval' o 'draft'              │
│ • Abre panel lateral: proveedor, ETA, presupuesto, costo final, items     │
│ • Aprueba → status = 'approved' + crea auto-pago en finance_payments      │
│ • Rechaza → status = 'rejected' + motivo obligatorio                      │
│ • Tabla: replenishment_supplier_orders                                     │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASO 5 — LOGÍSTICA ASIGNA FECHA Y GESTIONA ENTREGA                        │
│ 📍 logistica-seguimiento.html + logistica-recepcion.html                   │
│                                                                             │
│ • Logística ve órdenes aprobadas y su ETA                                  │
│ • Coordina con proveedor la fecha real de entrega                          │
│ • Registra tracking (replenishment_tracking)                               │
│ • Cuando llega la mercadería: confirma recepción                           │
│   → Crea receipt + receipt_items + inventory_movements                     │
│   → Actualiza inventory_stock (upsert)                                     │
│   → Order status → 'received' o 'partial'                                  │
│ • También puede hacer "recepción libre" (sin orden previa)                 │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASO 6 — ENCARGADO DE BARRA RECIBE FÍSICAMENTE                            │
│ 📍 encargado-recepcion.html                                                │
│                                                                             │
│ • Encargado ve órdenes recibidas por logística (vw_supplier_orders_encargado)│
│ • Confronta lo recibido vs lo esperado (conteo físico)                     │
│ • Registra discrepancias (faltantes, sobrantes, daños)                     │
│ • Confirma recepción en su punto de venta                                  │
│ • Tabla: replenishment_receipt_items (counted_qty, count_status)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Resumen del Ciclo de Status

```
replenishment_items.pre_approval_status:
  pending ──[admin]──► pre_approved ──[operativo ve]──► (linked to supplier_order)
                   └──► pre_rejected (sale del flujo)

replenishment_supplier_orders.status:
  draft ──[operativo]──► ready_for_approval ──[admin]──► approved ──[logística]──► received/partial
                                              └──► rejected       └──► cancelled

replenishment_requests.status:
  draft ──► (sin lógica para avanzar — BUG 8 pendiente)
```

**Estado actual:** Flujo técnicamente funcional de punta a punta. BUGs 1-5, 7, 9-11 resueltos. Bloqueo operacional: admin debe pre-aprobar items para que operativo los vea.

---

## 7. Acciones Requeridas (Actualizado 2026-02-17)

### ✅ RESUELTO

| #   | Accion                               | Estado                                         |
| --- | ------------------------------------ | ---------------------------------------------- |
| F1  | Normalizar status case               | ✅ FIXED + VERIFIED contra schema              |
| F2  | Fix columnas receipt                 | ✅ FIXED + VERIFIED — 6/6 columnas compatibles |
| F3  | Fix columnas receipt_items           | ✅ FIXED + VERIFIED — 7/12 columnas usadas, OK |
| F4  | Verificar inventory_movements schema | ✅ VERIFIED — 8/8 columnas compatibles         |
| F8  | Fix supplier_order_id NOT NULL       | ✅ FIXED — Migracion DB aplicada               |

### 🟡 PENDIENTES (operacion normal)

| #   | Accion                                                             | Tipo             | Impacto                                    |
| --- | ------------------------------------------------------------------ | ---------------- | ------------------------------------------ |
| F5  | **Pre-aprobar items desde admin** para desbloquear flujo operativo | Operacion manual | Operativos no ven items sin pre-aprobacion |

### 🟢 MEJORAS (calidad de datos)

| #   | Accion                                          | Tipo   | Impacto           |
| --- | ----------------------------------------------- | ------ | ----------------- |
| F6  | Vincular requests con `target_work_day_id`      | Mejora | Trazabilidad PnL  |
| F7  | Agregar logica para cerrar requests completados | Mejora | Limpieza de datos |

---

## 8. Rollback

### Cambios JS (fixes anteriores)

Revertir a version anterior del archivo `logistica-recepcion.js` via Git.

### Cambios DB (BUG 9)

```sql
ALTER TABLE replenishment_receipts ALTER COLUMN supplier_order_id SET NOT NULL;
```

---

## 9. Verificacion Final

```sql
-- Post-fix: validar que el flujo permite crear recepciones
-- (ejecutar despues de que admin pre-apruebe items y logistica reciba)

-- 1. Recepciones creadas
SELECT id, supplier_order_id, received_by, received_at, notes
FROM replenishment_receipts;

-- 2. Items de recepcion
SELECT ri.id, ri.receipt_id, ri.sku_id, ri.expected_units, ri.received_units, ri.diff_units
FROM replenishment_receipt_items ri;

-- 3. Movimientos de inventario
SELECT id, sku_id, qty_delta, movement_type, ref_table, ref_id, created_at
FROM inventory_movements
ORDER BY created_at DESC;

-- 4. Stock actualizado
SELECT s.sku_id, m.nombre, s.stock_actual, s.updated_at
FROM inventory_stock s
JOIN master_sku m ON m.id = s.sku_id
ORDER BY s.updated_at DESC;
```
