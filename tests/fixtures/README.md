# Archivos CSV de Prueba - Testing Fases 1-5

## Archivos Creados

### 1. gbol_ventas_test.csv

**Contenido**: 15 productos de ventas de barra

**Payment Methods Esperados**:

- **Cash** (7 productos): Cerveza Corona, Fernet Branca, Gin Tonic, Vodka Naranja, Cerveza Quilmes, Ron Cola, Whisky On The Rocks, Cerveza Stella, Cerveza Heineken, Ron Miel
- **Card** (5 productos): Fernet Zoco, Tarjeta Gin Tonic, QR Mesa 5 Fernet, Vodka Energizante Zoco, Tarjeta Digital Whisky

**Total Cash**: $45,600  
**Total Card**: $40,500  
**Total General**: $86,100

---

### 2. passline_tickets_test.csv

**Contenido**: 10 tickets QR con diferentes status

**Status Distribution**:

- **ACREDITADO**: 6 tickets ($30,000 total)
- **PENDIENTE**: 2 tickets
- **ANULADO**: 2 tickets

**Income Esperado**: $30,000 (solo ACREDITADO)

---

### 3. extracciones_test.csv

**Contenido**: 5 retiros de tesorería

**Terminales**:

- CAJA 1: 2 retiros ($10,000 + $3,500 = $13,500)
- CAJA 2: 2 retiros ($5,000 + $4,500 = $9,500)
- CAJA 3: 1 retiro ($8,000)

**Total Retiros**: $31,000

**Formato**: Montos con signo negativo (CSV), pero deben guardarse como positivos en la BD

---

## Uso en Testing

### Setup Requerido

Antes de importar, ejecutar el SQL de setup:

```sql
-- 1. Crear work_day de prueba
INSERT INTO work_days (work_date, status, opened_at)
VALUES ('2026-02-01', 'open', NOW())
RETURNING id;

-- 2. Crear cash_closing, bar_session, closing_terminals
-- asociados al work_day creado arriba
```

### Orden de Importación

1. **Gbol** (gbol_ventas_test.csv) → Test payment methods + trigger
2. **Passline** (passline_tickets_test.csv) → Test status dinámico
3. **Extracciones** (extracciones_test.csv) → Test external_id + UPSERT

### Validaciones SQL

Después de cada importación, ejecutar las queries de la sección "Valores Esperados finales" de abajo.

---

## Valores Esperados finales

Después de importar los 3 archivos:

```sql
-- vw_daily_sales debería mostrar:
SELECT
    bar_sales_cash,      -- $45,600
    bar_sales_card,      -- $40,500
    bar_sales_system,    -- $86,100
    qr_total,            -- $30,000 (solo ACREDITADO)
    withdrawals,         -- $31,000
    total_system         -- $116,100 (cash + card + qr)
FROM vw_daily_sales
WHERE work_day_id = '[TEST_WORK_DAY_ID]';
```

```sql
-- closing_terminals debería mostrar (trigger):
SELECT
    system_cash,  -- $45,600 (auto-updated)
    system_zoco   -- $40,500 (auto-updated)
FROM closing_terminals
WHERE cash_closing_id = '[TEST_CASH_CLOSING_ID]';
```

```sql
-- import_logs debería tener 3 filas:
SELECT importer_type, status, rows_imported
FROM import_logs
WHERE work_day_id = '[TEST_WORK_DAY_ID]'
ORDER BY started_at;

-- Resultado esperado:
-- gbol         | success | 15
-- passline     | success | 10
-- extracciones | success | 5
```
