# KPI Audit: Mock Data vs Supabase Schema

> Generado: 2026-02-13  
> Objetivo: Verificar que cada KPI de los prototipos tenga respaldo real en Supabase.

---

## Track A: lab-workdays (Planner)

### States ✅ Correcto

| Mock      | DB (`work_days.status`) | Match |
| :-------- | :---------------------- | :---: |
| DRAFT     | ✅                      |  ✅   |
| PLANNED   | ✅                      |  ✅   |
| ACTIVE    | ✅                      |  ✅   |
| CLOSED    | ✅                      |  ✅   |
| CANCELLED | ✅                      |  ✅   |

### staffPlan ⚠️ Parcial

| Mock field      | DB Source                            |                              Status                              |
| :-------------- | :----------------------------------- | :--------------------------------------------------------------: |
| `area`          | `master_staff_roles.name` → agrupado | ⚠️ No hay campo `area` en roles, el prototipo agrupa manualmente |
| `roles[].name`  | `master_staff_roles.name`            |                                ✅                                |
| `roles[].count` | `work_day_staff_planning.quantity`   |                                ✅                                |
| `roles[].rate`  | `staff_accruals.base_amount`         |             ✅ Pero es por accrual, no por planning              |

> **Gap**: `work_day_staff_planning` no tiene `rate`. El rate viene de `staff_accruals.base_amount` que se genera post-noche. Para el Planner, el rate sería un presupuesto estimado → **no existe en DB**.
> **Propuesta**: Agregar `work_day_staff_planning.unit_rate` o usar `master_staff_roles.default_rate`.

### fixedCosts ✅ Correcto

| Mock field | DB Source                          |             Status             |
| :--------- | :--------------------------------- | :----------------------------: |
| `name`     | `cost_definitions.title`           |               ✅               |
| `amount`   | `cost_definitions.base_amount`     |               ✅               |
| `paid`     | `finance_opening_cost_defs.status` | ✅ Existe tabla de vinculación |

### solicitudes ⚠️ Parcial

| Mock field | DB Source                                               |       Status        |
| :--------- | :------------------------------------------------------ | :-----------------: |
| `name`     | `replenishment_requests` + `accounts_payable.concept`   | ⚠️ Mezcla 2 fuentes |
| `amount`   | `replenishment_items.SUM()` o `accounts_payable.amount` |         ⚠️          |
| `origin`   | No existe en DB                                         |  ❌ Mock inventado  |
| `status`   | `replenishment_requests.status`                         |         ✅          |

> **Gap**: El prototipo mezcla reposiciones (supply) y gastos extras (accounts_payable) en una sola lista "solicitudes". En DB son tablas separadas.
> **Propuesta**: En producción, separar en 2 secciones o crear un UNION view.

### workdays (rows) ✅ Correcto

| Mock field | DB Source                                  |              Status               |
| :--------- | :----------------------------------------- | :-------------------------------: |
| `date`     | `work_days.work_date`                      |                ✅                 |
| `status`   | `work_days.status`                         |                ✅                 |
| `event`    | `work_days.event_name`                     | ✅ (columna agregada en Sprint 1) |
| `target`   | `work_days.work_date` + `countdown_active` |                ✅                 |

### eventos ✅ Correcto

| Mock field | DB Source                           |    Status     |
| :--------- | :---------------------------------- | :-----------: |
| `name`     | `events.name`                       |      ✅       |
| `qr_count` | `qr_codes WHERE event_id = X` COUNT | ✅ Calculable |

---

## Track A: lab-workdays-night (Night Chief)

### stockAudit ✅ Correcto

| Mock field | DB Source                                       | Status |
| :--------- | :---------------------------------------------- | :----: |
| `sku`      | `master_sku.name`                               |   ✅   |
| `cat`      | `master_categories.name`                        |   ✅   |
| `system`   | `bar_stock_snapshots.quantity (type='opening')` |   ✅   |
| `counted`  | `bar_stock_snapshots.quantity (type='closing')` |   ✅   |
| `cost`     | `master_sku.costo`                              |   ✅   |

> Vista existente: `vw_bar_audit_variance` ✅ — entrega todo esto precalculado.

### cajaTerminals ✅ Correcto

| Mock field        | DB Source                                    |                      Status                      |
| :---------------- | :------------------------------------------- | :----------------------------------------------: |
| `name`            | `pos_terminals.name`                         |                        ✅                        |
| `systemCash`      | `closing_terminals.system_cash`              |                        ✅                        |
| `declaredCash`    | `closing_terminals.declared_cash`            |                        ✅                        |
| `systemDigital`   | `closing_terminals.system_zoco`              |                        ✅                        |
| `declaredDigital` | `closing_terminals.declared_zoco`            |                        ✅                        |
| `withdrawals`     | `cash_movements WHERE type='withdrawal'` SUM | ⚠️ No está en `closing_terminals`, requiere join |

> **Gap menor**: `withdrawals` por terminal requiere cruzar `cash_movements` con `terminal_id`.

### nomina ✅ Correcto

| Mock field | DB Source                                           |           Status           |
| :--------- | :-------------------------------------------------- | :------------------------: |
| `area`     | Agrupación manual de roles                          | ⚠️ Mismo gap que staffPlan |
| `staff`    | `staff_convocations WHERE status='confirmed'` COUNT |             ✅             |
| `total`    | `staff_accruals` SUM(total_amount) agrupado         |             ✅             |

> Vista existente: `vw_staff_accruals_summary` ✅

### acceso ⚠️ Parcial

| Mock field          | DB Source                                   |       Status       |
| :------------------ | :------------------------------------------ | :----------------: |
| `passlineSold`      | `stg_passline_tickets` COUNT                |         ✅         |
| `passlineValidated` | `stg_passline_tickets WHERE validated=true` |  ⚠️ Depende campo  |
| `boleteriaVendidos` | No hay tabla de boletería propia            |         ❌         |
| `guardarropas`      | No existe en DB                             | ❌ Manual / futuro |
| `qrEscaneados`      | `qr_checkins` COUNT                         |         ✅         |
| `qrExpected`        | Calculable (passline + boletería)           |         ✅         |

> **Gap**: Boletería propia y guardarropa no están en DB. Son datos manuales o futuros.

### imports ✅ Correcto

| Mock field | DB Source                                     | Status |
| :--------- | :-------------------------------------------- | :----: |
| `source`   | `import_logs.source`                          |   ✅   |
| `status`   | `import_logs.status`                          |   ✅   |
| `lastSync` | `import_logs.created_at`                      |   ✅   |
| `records`  | `import_logs.record_count` o COUNT de stg\_\* |   ✅   |

---

## Track B: lab-balance-semanal

### FISCAL_PARAMS ✅ Correcto

| Mock field                              | DB Source                               |                          Status                          |
| :-------------------------------------- | :-------------------------------------- | :------------------------------------------------------: |
| `iva`, `iibb`, `municipal`, `ganancias` | Configuración hardcoded / `cost_config` | ⚠️ No hay tabla `cost_config`, son constantes de negocio |
| `fees.debito/credito/qr`                | Reportes Zoco / hardcoded               |                    ⚠️ Misma situación                    |

> **Propuesta**: Crear tabla `business_config` para parametrizar esto, o dejarlo como constantes en JS.

### generateNights (detalle diario) ✅ Correcto

| Mock field     | DB Source                              | Status |
| :------------- | :------------------------------------- | :----: |
| `date`         | `work_days.work_date`                  |   ✅   |
| `event`        | `work_days.event_name`                 |   ✅   |
| `attendance`   | `work_days.attendance`                 |   ✅   |
| `cashSystem`   | `cash_closings.total_system`           |   ✅   |
| `cashDeclared` | `cash_closings.total_declared`         |   ✅   |
| `zocoSystem`   | `SUM(closing_terminals.system_zoco)`   |   ✅   |
| `zocoDeclared` | `SUM(closing_terminals.declared_zoco)` |   ✅   |
| `barSales`     | `SUM(bar_session_sales.total_amount)`  |   ✅   |
| `qrIncome`     | `vw_per_capita_revenue.qr_revenue`     |   ✅   |

### generateStockCross ⚠️ Parcial

| Mock field           | DB Source                               | Status |
| :------------------- | :-------------------------------------- | :----: |
| `cmvTeorico`         | `vw_consumo_teorico` SUM                |   ✅   |
| `cmvReal`            | `vw_bar_audit_variance` SUM(costo_real) |   ✅   |
| `merma`              | Calculable: real - teórico              |   ✅   |
| `freeDrinksCost/Qty` | No existe en DB                         |   ❌   |
| `vipDrinksCost/Qty`  | No existe en DB                         |   ❌   |
| `topMerma`           | `vw_bar_audit_variance` ORDER BY delta  |   ✅   |

> **Gap**: Free drinks y VIP drinks no tienen tracking dedicado en DB. Propuesta: agregar `bar_session_sales.is_free` / `is_vip` boolean.

### generateDigitalIncome (Zoco) ⚠️ Sin tabla dedicada

| Mock field                           | DB Source                            |          Status          |
| :----------------------------------- | :----------------------------------- | :----------------------: |
| `brutoTerminal`                      | `SUM(closing_terminals.system_zoco)` |            ✅            |
| `brutoZoco`                          | No hay tabla de reporte Zoco         | ❌ Importación pendiente |
| `arancel/ivaArancel/costoFinanciero` | No hay desglose Zoco en DB           |            ❌            |
| `netoAcreditar`                      | No existe                            |            ❌            |
| `desfase temporal`                   | No existe                            |            ❌            |

> **Gap mayor**: Todo el bloque de conciliación Zoco (bruto vs neto, retenciones, desfase temporal) no tiene tablas en DB. Existe `vw_fiscal_summary` y `vw_tax_monthly` como base.
> **Propuesta**: Crear `zoco_settlements` table o importar CSV de Zoco a staging.

### generateExpenses ✅ Correcto (parcial)

| Mock field         | DB Source                                     |    Status     |
| :----------------- | :-------------------------------------------- | :-----------: |
| `staff`            | `vw_staff_accruals_summary`                   |      ✅       |
| `compras`          | `replenishment_supplier_orders` SUM           |      ✅       |
| `insumosOp`        | `accounts_payable WHERE category='operativa'` |      ✅       |
| `freeDrinks`       | Gap (ver stockCross)                          |      ❌       |
| `merma`            | `vw_bar_audit_variance` SUM                   |      ✅       |
| `licencias`        | `cost_definitions WHERE category='licencias'` |      ✅       |
| `costosFijos`      | `cost_definitions WHERE frequency='monthly'`  |      ✅       |
| `extras`           | `accounts_payable WHERE category='other'`     |      ✅       |
| `ivaCreditoFiscal` | `cost_definitions.tax_rate` × compras         | ✅ Calculable |

---

## Resumen de Gaps

|  #  | Gap                               | Módulo          | Severidad | Propuesta                                                 |
| :-: | :-------------------------------- | :-------------- | :-------: | :-------------------------------------------------------- |
|  1  | `area` de roles no existe en DB   | Planner + Night |   Baja    | Agrupar por `master_staff_roles.category` o agregar campo |
|  2  | `unit_rate` en planning no existe | Planner         |   Media   | Agregar a `work_day_staff_planning` o usar default de rol |
|  3  | Solicitudes mezclan 2 fuentes     | Planner         |   Baja    | UNION view o separar en UI                                |
|  4  | Boletería propia no existe en DB  | Night Chief     |   Media   | Futuro módulo                                             |
|  5  | Guardarropa no existe en DB       | Night Chief     |   Baja    | Manual / futuro                                           |
|  6  | Free/VIP drinks sin tracking      | Balance         |   Media   | `bar_session_sales.is_free` / `is_vip`                    |
|  7  | Desglose Zoco completo ausente    | Balance         | **Alta**  | Tabla `zoco_settlements` + import                         |
|  8  | `business_config` no existe       | Balance         |   Baja    | Constantes JS suficiente por ahora                        |

> **Decisión requerida**: Gap #7 (Zoco) es el más crítico. ¿Se resuelve antes de migrar Balance, o se deja con datos mock que el usuario carga manualmente?
