# Knowledge Base — Consolidado de NotebookLM

> **Fuente**: 7 notebooks consultados entre 11 y 12-Feb-2026.
> **Propósito**: Biblia de referencia para alinear skills de desarrollo con la realidad operativa del negocio.
> **Última actualización**: 12-Feb-2026 (Balance Semanal + Deep Research)

---

## Índice de Notebooks

| #   | ID                             | Contenido Principal                                                                                            | Relevancia |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | `baac7e71`                     | Mix: docs técnicos tester_3.0, schema Supabase, reglas IA + contenido cultural (no relevante)                  | ⭐⭐       |
| 2   | `416cd1ca`                     | **Biblia ERP**: arquitectura, 6 roles, 3 workflows, GBol reference, schema completo                            | ⭐⭐⭐⭐⭐ |
| 3   | `c810bfca`                     | **GBol Operations**: logs reales (caja, comandas), auditorías, tipos de pago, estructura física                | ⭐⭐⭐⭐   |
| 4   | `b2140d2b`                     | **Seguridad & Acceso**: protocolo de ingreso, evacuación, plano físico, roles de puerta                        | ⭐⭐⭐⭐   |
| 5   | MCP `auditor-a-de-recaudaci-n` | **Auditoría Recaudación**: pricing, ROP/MAX, descalces ZOCO, faltantes caja, dossier legal, auditoría bancaria | ⭐⭐⭐⭐⭐ |
| 6   | MCP (GBOL)                     | **GBOL Operativo**: logs reales 28/jun y 4/oct, extracciones/rendiciones por POS, recargos TD/TC 15%           | ⭐⭐⭐⭐   |
| 7   | MCP (ERP)                      | **ERP FormulaMid**: 17 módulos, DB schema, vistas SQL, stack completo                                          | ⭐⭐⭐     |

---

## 1. Roles del Sistema (6 niveles)

Fuente: NB2 (ROLES.md + mapeo-roles.md)

| Rol           | Nombre Operativo     | Acceso                  | Responsabilidades Clave                                              |
| ------------- | -------------------- | ----------------------- | -------------------------------------------------------------------- |
| **Admin**     | Dueño / Socio        | Total                   | Config financiera, ABM usuarios, auditoría global, cierre definitivo |
| **Contable**  | Contador externo     | Solo lectura financiera | Auditoría, reportes, validación. No ejecuta                          |
| **Operativo** | Manager de Turno     | Gestión diaria          | Stock diario, personal, workdays, solicitudes                        |
| **Logístico** | Jefe de Depósito     | Stock central           | Recepción mercadería, transferencias, preparación pedidos            |
| **Encargado** | Encargado Barra/Caja | Su área                 | Cierre de barra, arqueo, aprobación solicitudes de su zona           |
| **Staff**     | Cajero / Bartender   | Solo su POS             | Venta, arqueo ciego. Sin acceso a reportes ni config                 |

### Jerarquía de Permisos

```
Admin ──────────────────────────── Control Total
  │
  ├── Contable ─────────────────── Lectura Financiera
  │
  ├── Operativo ────────────────── Gestión Diaria (sin finanzas sensibles)
  │     │
  │     └── Logístico ──────────── Stock Central (preparación, recepción)
  │
  └── Encargado ────────────────── Su Área (barra o caja)
        │
        └── Staff ──────────────── Solo POS Terminal
```

---

## 2. Workflows Principales

### 2.1 Ciclo de Caja (Cash Flow)

Fuentes: NB2 (flujos) + NB3 (datos reales GBol)

```
Apertura Terminal    Venta (POS)     Arqueo Ciego     Verificación      Cierre Definitivo
    [Staff]      →     [Staff]    →    [Staff]     →   [Encargado]   →     [Admin]
                                   (no ve totales)   (compara diffs)   (confirma/ajusta)
```

**Detalle operativo (de GBol):**

- Extracciones parciales durante la noche (retiro de exceso de efectivo por seguridad)
- Rendición final al cierre
- Montos significativos: rendiciones de $784.000 - $873.000 por caja/noche
- Métodos de pago: Efectivo, TD (con recargo auto), TC (con recargo auto), Free (QR/Staff/VIP/Promotoras)

### 2.2 Flujo de Stock (Replenishment)

Fuente: NB2

```
Solicitud         Aprobación          Preparación         Recepción
  [Barra]     →   [Encargado]    →    [Logístico]    →   [Barra + Descuento Stock]
(detecta falta)  (valida necesidad)  (prepara pedido)   (confirma recepción)
```

### 2.3 Flujo de Ingreso (Acceso & Seguridad)

Fuente: NB4 — Guía Operativa MIDNIGHT

**3 Fases:**

**Fase 1 — Ingreso:**

```
Llegada → Cuenta Ganado → Boletería → Seguridad Privada (cacheo) → Policía (antecedentes) → Validadores (QR scan)
```

- 2 carriles: **PAGOS** (verde) y **FREE** (rojo)
- "Honguitos" = estructuras de control que canalizan flujo
- Validadores al final, escaneo QR para liberar paso

**Fase 2 — Permanencia:**

- Rutas de circulación libres alrededor de pista
- Puntos críticos: tableros eléctricos y matafuegos (ABC Polvo Químico) siempre accesibles
- Cartelería "SALIDA" iluminada

**Fase 3 — Emergencia/Evacuación:**

- Liberación de puertas con cartelería verde
- Personal de pista dirige por flechas verdes
- Personal de ingreso retira vallas externas
- Punto de reunión exterior designado

**Roles de puerta:**

| Rol               | Color ID   | Ubicación                   | Función                                                |
| ----------------- | ---------- | --------------------------- | ------------------------------------------------------ |
| Seguridad Privada | 🟠 Naranja | Primer contacto + perímetro | Cacheo, orden filas, guía evacuación                   |
| Policía           | 🔵 Celeste | Centro acceso (Honguitos)   | Control antecedentes, seguridad "dura"                 |
| Validadores       | 🔴 Rojo    | Post-Policía                | Escaneo QR/tickets, flujo rápido                       |
| Boletería         | —          | Inicio                      | Venta/validación entrada, despeje vallas en emergencia |

---

## 3. Estructura Física del Local

Fuentes: NB3 + NB4

### Sectores Operativos (de GBol)

| Sector       | Terminales/Cajas       | Notas                                   |
| ------------ | ---------------------- | --------------------------------------- |
| Boleterías   | General 1, General 2   | Entrada principal                       |
| Barras       | 02, 03, 04, 05, 09, 10 | Múltiples puntos, cajas "1.2", "5" etc. |
| Resto        | —                      | Sector gastronómico                     |
| Guardarropas | —                      | Servicio complementario                 |
| Pista        | —                      | Central, rodeada de rutas de evacuación |

### Ubicación

- Calle Balcarce 2550, Salta, Argentina
- Zona de expansión fuera del circuito histórico
- Apertura real: después de 1:00 AM (la "Paradoja de la Medianoche")

---

## 4. Stack Tecnológico

Fuentes: NB1 + NB2

| Capa              | Tecnología                                          | Estado                            |
| ----------------- | --------------------------------------------------- | --------------------------------- |
| Frontend          | Vanilla JS modular (ESM)                            | Producción (tester_3.0)           |
| CSS               | Design System "Midnight Glass" (tokens + variables) | Producción                        |
| Backend/DB        | Supabase (PostgreSQL)                               | Producción                        |
| Seguridad         | AuthGuard + RLS + Bloqueo escrituras directas       | Implementado                      |
| IA Agent          | Gemini 2.0 Flash ("Antigravity")                    | En desarrollo                     |
| Protocolo         | "Lápiz vs. Tinta" (proponer → confirmar)            | Activo                            |
| Legacy/Referencia | GBol (sistema externo de gestión nocturna)          | Referencia para paridad funcional |

### Schema Principal (Supabase)

| Dominio        | Tablas                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| **Finanzas**   | `cash_closings`, `cash_movements`, `accounts_payable`, `finance_payments`        |
| **Inventario** | `master_sku`, `inventory_stock`, `replenishment_requests`, `inventory_movements` |
| **Personal**   | `profiles`, `master_staff_roles`, `staff_convocations`, `work_days`              |
| **Operativa**  | `pos_terminals`, `events`                                                        |
| **Accesos**    | `qr_codes`                                                                       |

### Componentes UI Estandarizados

| Patrón    | Uso                                           |
| --------- | --------------------------------------------- |
| `/tabla`  | ABM (Alta/Baja/Modificación) de maestros      |
| `/pos`    | Grilla táctil para venta rápida               |
| `/wizard` | Procesos paso a paso (ej. Cierre de Caja)     |
| `/kanban` | Gestión de estados (ej. Solicitudes de Stock) |

---

## 5. Auditorías (GBol Reference)

Fuente: NB3

El sistema GBol (referencia para paridad funcional) implementa las siguientes auditorías:

| Auditoría                | Qué Controla                                            |
| ------------------------ | ------------------------------------------------------- |
| Anulaciones Solicitadas  | Intentos de anulación (incluso rechazados)              |
| Anulaciones Efectivas    | Anulaciones confirmadas realmente ejecutadas            |
| Cambio de Precios        | Quién cambió qué precio y cuándo                        |
| Cambio de Artículos      | Eliminaciones de productos del catálogo                 |
| Cambio de Tragos/Recetas | Modificaciones a composición de tragos                  |
| Conexiones               | IPs desde donde se accede al sistema                    |
| Devoluciones             | Devoluciones de dinero autorizadas                      |
| Ticket Free              | Anulaciones de tickets gratuitos (VIP/Staff/Promotoras) |

**Proceso estándar**: Gestión → Solapa Barras/Sistemas → Recaudación/Auditorías → Filtrar por fecha/turno → Exportar PDF.

---

## 6. Productos y Volumen de Negocio

Fuente: NB3 (logs reales)

### Catálogo Real (de comandas)

- **Alcohol**: Skyy (variedades), Fernet Branca, Mumm Extra Brut, Budweiser, Brighton Gin
- **Mezcladores**: Speed (energizante), Coca Cola, Agua tónica
- **Promos**: Combos "Botella + 4 Speed"
- **Horario pico de ventas**: 02:00 AM - 04:00 AM

### Tipos de Ticket

- Efectivo
- TD (Tarjeta Débito, con recargo automático)
- TC (Tarjeta Crédito, con recargo automático)
- Free: QR, Staff, VIP, Promotoras

---

## 7. Gaps Identificados (Skill Alignment)

Cruzando lo que los notebooks documentan vs lo que el código actual tiene:

| Área                        | Documentado en Notebooks                            | Estado en tester_3.0                                          | Gap                                        |
| --------------------------- | --------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| 6 roles con permisos        | ✅ Definido en ROLES.md                             | ⚠️ Parcial (AuthGuard existe, pero no todos los roles rutean) | Falta ruteo completo por rol               |
| Flujo de caja completo      | ✅ Apertura → Arqueo Ciego → Verificación → Cierre  | ⚠️ Cierre existe, arqueo ciego no                             | Falta arqueo ciego del Staff               |
| Flujo de stock              | ✅ Solicitud → Aprobación → Preparación → Recepción | ⚠️ Solicitudes existen, logística no                          | Falta vista Logístico                      |
| Auditorías GBol-level       | ✅ 8 tipos documentados                             | ❌ No implementadas                                           | Audit trail completo pendiente             |
| Protocolo ingreso/seguridad | ✅ 3 fases, 4 roles de puerta                       | ❌ No digitalizado                                            | Fuera de scope software (operativo físico) |
| Tipos de pago con recargo   | ✅ TD/TC auto-recargo                               | ⚠️ POS existe, recargos no confirmados                        | Verificar implementación                   |
| Vista Contable              | ✅ Rol definido                                     | ❌ No existe pantalla                                         | Falta dashboard contable                   |

---

## 8. Balance Semanal — Módulo Independiente

> **Descubrimiento**: 12-Feb-2026 (deep research de conv. `b6fe52e2`)
> **Fuentes**: 7 consultas NotebookLM + deep_research_context.md (426 líneas)

### Definición del módulo

El **Balance Semanal** es un módulo financiero **independiente de Workdays**:

- **Workdays** = flujo operacional (diario): Planificar → Night Chief → Pre-cierre → Cierre
- **Balance Semanal** = flujo financiero (semanal): se ejecuta el **lunes**, cruza datos de la semana

### Ubicación en arquitectura

```
admin-index.html
  └── 🟡 FINANCIERO (semanal)
        ├── admin-reportes.html   → Reportes por noche individual
        ├── admin-pagos.html      → Pagos a proveedores
        └── balance-semanal.html  → ★ Balance Semanal (módulo)
```

### Datos reales disponibles (de la investigación)

| Dato               | Fuente                      | Detalle                                                    |
| ------------------ | --------------------------- | ---------------------------------------------------------- |
| 8 puntos de venta  | NB5 (Auditoría Recaudación) | 2 boleterías + 6 barras, con Sistema vs Rendición          |
| ZOCO vs Sistema    | NB5                         | 3 fechas con descalces: $4.2M, +$557K, +$594K              |
| Recargos TD/TC     | NB6 (GBOL)                  | 15% flat, automático, evidenciado en comandas reales       |
| Faltante de caja   | NB5                         | $720K boletería noche 28/jun                               |
| Pricing completo   | NB5                         | Fórmula inversa: Costo → Base → Final con IVA/IIBB/canal   |
| Stock ideal        | NB5                         | ROP/MAX con demanda diaria, lead time, frecuencia revisión |
| SKUs reales        | NB6                         | Skyy, Fernet, Budweiser, Speed, Red Bull, combos           |
| Passline           | CSV local                   | 986 filas, tickets evento 25/oct                           |
| Dossier legal      | NB5                         | Clasificación de irregularidades por responsabilidad       |
| Auditoría bancaria | NB5                         | 3 cuentas, cargos sospechosos (Apple, Paddle, Rappi)       |

### Prototipo actual

- **Carpeta**: `formulamid-prototypes/screens/lab-reports/`
- **Estado**: En rediseño (v3) — de 6 accordions a layout 2 columnas
- **Plan**: `brain/b6fe52e2/implementation_plan_v3.md`
- **Deep research**: `brain/b6fe52e2/deep_research_context.md` (426 líneas)

### Relación con tester_3.0

| tester_3.0                            | Prototipo                                       |
| ------------------------------------- | ----------------------------------------------- |
| `pages/gerencia/balance-semanal.html` | `screens/lab-reports/` (se renombrará)          |
| `pages/admin/admin-semanal.html`      | Candidato a consolidar con balance-semanal      |
| Vista `vw_finance_weekly`             | Consume Ingresos vs Gastos agregados por semana |

---

_Documento generado desde NotebookLM MCP + deep research. Última actualización: 12-Feb-2026._
