# Feature Spec: Drinks by Web (Consumición Digital)

> **Autor**: Antigravity Agent + User
> **Fecha**: 2026-02-11
> **Estado**: DRAFT — Pendiente validación de canal de pago
> **Impacto**: Transforma el modelo operativo de barras y caja

---

## 1. Resumen Ejecutivo

Permitir que los clientes (members y público general) **compren tragos desde el celular** antes o durante el evento. La compra genera un **QR por cada trago**, que el bartender escanea al entregar. El escaneo **descuenta stock automáticamente** y registra la transacción.

### ¿Por qué?

| Problema actual                                                          | Solución                                                   |
| ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| El bartender sirve y el cajero cobra → dos personas, dos puntos de error | El pago ya está hecho. El bartender solo escanea y entrega |
| El arqueo de caja depende de contar efectivo vs tickets                  | Las ventas web son digitales, sin diferencias de caja      |
| El stock se descuenta manualmente o al cierre                            | El stock se descuenta en el momento exacto de entrega      |
| No hay trazabilidad de quién compró qué                                  | QR vinculado a member + trago + hora + barra + bartender   |
| Mucho efectivo circulando = riesgo                                       | Efectivo mínimo, solo para walk-ins que prefieren cash     |

---

## 2. Los 3 Escenarios de Canal de Pago

```
┌─────────────────────────────────────────────────────────────┐
│  ESCENARIO A: Passline tiene API de productos               │
│  ─────────────────────────────────────────────               │
│  Web FM4 → Passline API → Pago → Webhook → QR generado     │
│  ✅ Un solo canal. ✅ Passline maneja pagos+fraude.          │
│  ⚠️ Depende de que Passline soporte "productos" no tickets. │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ESCENARIO B: Sin API → Web propia para tragos              │
│  ─────────────────────────────────────────────               │
│  Efectivo: Caja carga crédito → QR generado internamente    │
│  Tarjeta: Passline solo para entradas, tragos por web prop. │
│  ✅ Control total. ⚠️ Requiere pasarela de pago propia.     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ESCENARIO C: Híbrido                                        │
│  ─────────────────────────────────────────────               │
│  Entradas → Passline (como hoy)                              │
│  Tragos → Web propia con Mercado Pago / cash                 │
│  ✅ Independiente. ✅ Control de pasarela.                    │
│  ⚠️ Dos sistemas de pago = más complejidad operativa.        │
└─────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **En los 3 escenarios, el flujo del BARTENDER es idéntico**: Escanear QR → Entregar trago → Stock se descuenta. El canal de pago es intercambiable.

---

## 3. Flujo Principal (Agnostic del Canal de Pago)

### 3.1 Compra (Member desde el celular)

```
MEMBER en el venue (o antes de llegar)
  │
  ├─ 1. Abre midnightclub.com.ar → Soy Member → Carta
  │
  ├─ 2. Toca "+" en el trago que quiere
  │     └─ Se agrega al carrito (nuevo componente)
  │
  ├─ 3. Toca "Pedir" → Checkout
  │     ├─ [Escenario A] → Redirect a Passline
  │     ├─ [Escenario B] → Pago en web propia (MP / cash en caja)
  │     └─ [Escenario C] → Pago en web propia
  │
  ├─ 4. Pago confirmado
  │     └─ Se generan N QR codes (uno por trago)
  │     └─ QRs aparecen en sección "Mis Pedidos" del portal
  │
  └─ 5. Member va a la barra y muestra QR
```

### 3.2 Entrega (Bartender con scanner)

```
BARTENDER en la barra
  │
  ├─ 1. Member muestra QR en pantalla del celular
  │
  ├─ 2. Bartender abre scanner.html (ya existe)
  │     └─ Escanea QR
  │
  ├─ 3. Pantalla muestra:
  │     ├─ Nombre del trago
  │     ├─ Nombre del member (o "Invitado #XX")
  │     ├─ Estado: ✅ VÁLIDO / ❌ YA CANJEADO / ⏰ EXPIRADO
  │     └─ Botón "ENTREGAR"
  │
  ├─ 4. Bartender toca "ENTREGAR"
  │     ├─ QR se marca como canjeado (no se puede reusar)
  │     ├─ Stock del SKU se descuenta en `inventory_movements`
  │     ├─ Se registra: bartender_id, barra_id, timestamp, member_id
  │     └─ Confirma visualmente: "✅ Entregado"
  │
  └─ 5. El admin ve la transacción en tiempo real en Night Chief
```

### 3.3 Canal Efectivo (Caja como "cargador de crédito")

```
PERSONA sin member / prefiere efectivo
  │
  ├─ 1. Va a la caja (punto de venta efectivo)
  │
  ├─ 2. Cajero cobra en efectivo
  │     └─ Registra en sistema como "carga de consumición"
  │
  ├─ 3. Sistema genera QR (impreso o en pantalla del cajero)
  │     └─ Entrega ticket QR al cliente
  │
  ├─ 4. Persona va a la barra → mismo flujo de scan que el member
  │
  └─ NOTA: El cajero NO prepara tragos. Solo cobra y genera QRs.
          Esto es un cambio de rol significativo.
```

---

## 4. Roles Afectados

| Rol                 | Cambio                                                            | Impacto                                                       |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| **Member**          | Nuevo: comprar tragos desde el celular, ver "Mis Pedidos"         | Portal member se vuelve transaccional                         |
| **Staff Barra**     | Nuevo: escanear QR de trago antes de servir                       | Cambio de workflow fundamental                                |
| **Staff Caja**      | Cambia: de cobrar+entregar a solo cobrar y generar QR             | Reducción de responsabilidad. Potencial reducción de personal |
| **Encargado Barra** | Nuevo: ver consumiciones en tiempo real, detectar QR no canjeados | Supervisión mejorada                                          |
| **Encargado Caja**  | Cambia: arqueo solo de efectivo (más simple)                      | Reducción de complejidad                                      |
| **Operativo**       | Nuevo: ver ventas web vs cash en tiempo real                      | Mejor control                                                 |
| **Admin**           | Nuevo: reportes de consumición digital, P&L por canal             | Data más rica                                                 |
| **Logístico**       | Sin cambio directo, pero stock se actualiza en real-time          | Mejor visibilidad                                             |

---

## 5. Impacto en Gaps Existentes

| Gap (de user-flows-by-role.md) | Cómo lo afecta Drinks-by-Web                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **#1 Arqueo ciego**            | ✅ **SE SIMPLIFICA**: ventas web no tienen diferencia de caja. Arqueo solo de efectivo residual |
| **#2 Aprobación solicitudes**  | ➡️ Sin cambio directo                                                                           |
| **#3 Audit trail**             | ✅ **SE RESUELVE PARCIAL**: cada consumición digital es trazable automáticamente                |
| **#4 Vista contable**          | ✅ **SE ENRIQUECE**: nuevo canal de ingreso (web) con data granular                             |
| **#5 Alertas stock bajo**      | ✅ **MÁS URGENTE**: stock se consume en tiempo real por scan. Alertas se vuelven críticas       |
| **#6 Roles fantasma**          | ➡️ Sin cambio                                                                                   |
| **#7 Historial rendimiento**   | ✅ **SE ENRIQUECE**: bartender_id por cada entrega → performance medible                        |
| **#8 Flujo bidireccional**     | ➡️ Sin cambio                                                                                   |
| **#9 Dashboard gerente**       | ✅ **SE ENRIQUECE**: métricas de canal web vs cash                                              |
| **#10 Comunicación inter-rol** | ➡️ Sin cambio                                                                                   |
| **#11 Protocolo ingreso**      | ➡️ Sin cambio                                                                                   |
| **#12 ETA proveedores**        | ➡️ Sin cambio                                                                                   |

**Score**: Drinks-by-Web mejora o resuelve **5 de 12 gaps** existentes como efecto secundario.

---

## 6. Modelo de Datos (Nuevas Entidades)

### 6.1 Tabla: `drink_orders` (Pedidos de tragos)

| Columna             | Tipo                | Descripción                                      |
| ------------------- | ------------------- | ------------------------------------------------ |
| `id`                | uuid PK             | ID del pedido                                    |
| `member_id`         | uuid FK → members   | NULL si es compra cash de no-member              |
| `work_day_id`       | uuid FK → work_days | Jornada en curso                                 |
| `channel`           | enum                | `'web_passline'`, `'web_own'`, `'cash'`          |
| `payment_status`    | enum                | `'pending'`, `'paid'`, `'refunded'`, `'expired'` |
| `payment_reference` | text                | ID de Passline, MP, o "CASH-{ticket}"            |
| `total_amount`      | decimal             | Total del pedido                                 |
| `created_at`        | timestamptz         | Hora de compra                                   |
| `expires_at`        | timestamptz         | Vencimiento de los QR (ej: fin de la noche)      |

### 6.2 Tabla: `drink_order_items` (Items de un pedido)

| Columna           | Tipo                   | Descripción                                          |
| ----------------- | ---------------------- | ---------------------------------------------------- |
| `id`              | uuid PK                | ID del item                                          |
| `order_id`        | uuid FK → drink_orders | Pedido padre                                         |
| `sku_id`          | uuid FK → master_sku   | Trago comprado                                       |
| `qr_code`         | text UNIQUE            | Código QR generado (ej: `DRK-{uuid-short}`)          |
| `qr_status`       | enum                   | `'active'`, `'redeemed'`, `'expired'`, `'cancelled'` |
| `redeemed_at`     | timestamptz            | Hora de canje                                        |
| `redeemed_by`     | uuid FK → staff        | Bartender que lo entregó                             |
| `redeemed_at_bar` | text                   | Identificador de barra (barra1, barra2, etc.)        |
| `unit_price`      | decimal                | Precio unitario al momento de compra                 |

### 6.3 Vista: `vw_drink_consumption_live`

```sql
-- Consumiciones en tiempo real para Night Chief
SELECT
    doi.qr_status,
    ms.name AS drink_name,
    m.first_name AS member_name,
    doi.redeemed_at,
    s.name AS bartender_name,
    doi.redeemed_at_bar,
    do.channel
FROM drink_order_items doi
JOIN drink_orders do ON doi.order_id = do.id
JOIN master_sku ms ON doi.sku_id = ms.id
LEFT JOIN members m ON do.member_id = m.id
LEFT JOIN staff s ON doi.redeemed_by = s.id
WHERE do.work_day_id = :current_work_day_id
ORDER BY doi.redeemed_at DESC;
```

### 6.4 Vista: `vw_drink_sales_by_channel`

```sql
-- Comparativa Web vs Cash para reportes
SELECT
    do.channel,
    COUNT(doi.id) AS total_drinks,
    SUM(doi.unit_price) AS total_revenue,
    COUNT(CASE WHEN doi.qr_status = 'redeemed' THEN 1 END) AS delivered,
    COUNT(CASE WHEN doi.qr_status = 'active' THEN 1 END) AS pending,
    COUNT(CASE WHEN doi.qr_status = 'expired' THEN 1 END) AS expired
FROM drink_orders do
JOIN drink_order_items doi ON doi.order_id = do.id
WHERE do.work_day_id = :current_work_day_id
GROUP BY do.channel;
```

---

## 7. Pantallas Nuevas / Modificadas

### 7.1 Portal Member (modificaciones)

| Pantalla                | Cambio                                                                   |
| ----------------------- | ------------------------------------------------------------------------ |
| **Carta** (existente)   | Botón `+` ahora agrega al carrito. Nuevo: carrito flotante, checkout     |
| **Mis Pedidos** (nueva) | Lista de QRs activos con estado. Tap en QR → lo muestra grande para scan |
| **Bottom Nav**          | Agregar badge con cantidad de QRs pendientes                             |

### 7.2 Staff Barra (modificaciones)

| Pantalla                   | Cambio                                                                   |
| -------------------------- | ------------------------------------------------------------------------ |
| **Scanner** (existente)    | Nuevo modo: "Scan Consumición". Muestra trago + member + botón ENTREGAR  |
| **Cola** (nueva, opcional) | Lista de QRs pendientes en su barra (para preparar antes de que lleguen) |

### 7.3 Staff Caja (modificaciones)

| Pantalla                 | Cambio                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| **POS Caja** (existente) | Nuevo botón: "Vender Consumición". Cobra efectivo → genera QR imprimible |

### 7.4 Admin / Operativo

| Pantalla        | Cambio                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| **Night Chief** | Nuevo widget: "Consumiciones en vivo" (web vs cash, activas vs canjeadas) |
| **Reportes**    | Nueva pestaña: "Consumición Digital" con métricas por canal               |

---

## 8. Reglas de Negocio Críticas

| #   | Regla                                                              | Razón                                                                              |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1   | **Un QR = un trago. No reutilizable.**                             | Control absoluto                                                                   |
| 2   | **QR expira al cierre del workday**                                | Evita acumulación de QRs entre noches                                              |
| 3   | **Bartender no puede entregar sin escanear**                       | Si escanea primero, stock se descuenta. Si no escanea, hay diferencia en auditoría |
| 4   | **QR canjeado muestra "YA ENTREGADO"** si se escanea de nuevo      | Previene doble entrega                                                             |
| 5   | **Refund solo desde admin**                                        | El bartender no puede anular                                                       |
| 6   | **Precio se fija al momento de compra**                            | Si cambia el precio durante la noche, los QR previos mantienen precio original     |
| 7   | **Efectivo: el cajero genera QR sin nombre**                       | "Invitado" como fallback, no obliga a registrarse                                  |
| 8   | **QR es visual (pantalla del celular) no printeable** para members | Fomenta uso de la app                                                              |
| 9   | **QR ES printeable para compras cash**                             | El cliente sin celular recibe ticket físico                                        |

---

## 9. Métricas que se desbloquean

| Métrica                        | Antes                           | Después                                                            |
| ------------------------------ | ------------------------------- | ------------------------------------------------------------------ |
| **Tragos vendidos por hora**   | Estimado por cierre             | Exacto en tiempo real                                              |
| **Revenue por canal**          | Solo cash total                 | Web vs Cash desglosado                                             |
| **Performance del bartender**  | No medible                      | Tragos/hora por bartender                                          |
| **SKU popularity**             | Por stock consumido (impreciso) | Por QR canjeados (exacto)                                          |
| **Tiempo promedio de entrega** | No medible                      | Desde compra hasta canje                                           |
| **Tasa de expiración**         | No aplica                       | QRs comprados pero no canjeados (revenue neto sin costo de insumo) |
| **Member engagement**          | Asistencia (entry)              | Asistencia + consumo + frecuencia + favoritos                      |

---

## 10. Riesgos y Mitigaciones

| Riesgo                                            | Probabilidad | Mitigación                                                   |
| ------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| **WiFi inestable** en el venue                    | 🔴 Alta      | Scanner debe funcionar offline con sync posterior            |
| **Member sin batería** para mostrar QR            | 🟡 Media     | Caja puede reimprimir QR por DNI/ID                          |
| **Bartender no escanea** (sirve sin QR a amigos)  | 🟡 Media     | Auditoría: stock consumido vs QR canjeados = diferencia      |
| **Resistencia del staff** al cambio               | 🟡 Media     | Capacitación, período de transición con ambos sistemas       |
| **Passline no soporta productos**                 | 🟡 Media     | Escenarios B y C como fallback                               |
| **Tiempo de espera** por scan en barra concurrida | 🟡 Media     | Pre-preparar con "Cola" de pedidos; escaneo rápido (~2 seg)  |
| **Fraude de QR** (captura de pantalla de otro)    | 🟢 Baja      | QR con animación/timestamp que dificulta screenshot estático |

---

## 11. Dependencias de Investigación (Antes de Código)

| #   | Pregunta                                                    | Responsable | Bloquea                     |
| --- | ----------------------------------------------------------- | ----------- | --------------------------- |
| 1   | ¿Passline tiene API para crear productos (no solo eventos)? | User        | Decisión de escenario A/B/C |
| 2   | ¿MercadoPago es viable como pasarela alternativa?           | User        | Escenario B/C               |
| 3   | ¿Hay impresora térmica en caja para QR físicos?             | User        | Flujo cash                  |
| 4   | ¿WiFi del venue es confiable para scanner?                  | User        | Necesidad de modo offline   |
| 5   | ¿Cuántas barras operan simultáneamente?                     | User        | Diseño de `redeemed_at_bar` |
| 6   | ¿El member ID actual sirve como QR vinculado?               | User        | Simplificación de login     |

---

## 12. Roadmap Sugerido

### Fase 0 — Spec + Validación (ACTUAL)

- [x] Feature spec documentada
- [ ] Responder las 6 preguntas de §11
- [ ] Decidir escenario (A, B, o C)

### Fase 1 — Prototipo Visual

- [ ] `lab-member-carta/` → Carta con carrito + checkout mock
- [ ] `lab-member-pedidos/` → "Mis Pedidos" con QRs visuales
- [ ] `lab-scanner-drink/` → Scanner de consumición con UI de entrega

### Fase 2 — Backend

- [ ] Migración: tablas `drink_orders` + `drink_order_items`
- [ ] Migración: vistas `vw_drink_consumption_live` + `vw_drink_sales_by_channel`
- [ ] RPCs: `rpc_create_drink_order`, `rpc_redeem_drink_qr`
- [ ] Generación de QR codes

### Fase 3 — Integración

- [ ] Conectar portal member → canal de pago elegido
- [ ] Conectar scanner → redeem flow
- [ ] Conectar Night Chief → widget de consumiciones en vivo

### Fase 4 — Piloto

- [ ] Una noche con sistema híbrido (viejo + nuevo)
- [ ] Medir: QRs generados vs canjeados vs stock real
- [ ] Ajustar basado en feedback del staff

---

_Esta feature transforma Midnight Club de "nightclub con sistema" a "nightclub con economía digital interna"._
