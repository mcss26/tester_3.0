# Admin Pagos (Gestión de Finanzas)

> **Rol**: Admin, Contable
> **Ruta**: `pages/admin/admin-pagos.html`
> **JS**: `assets/js/modules/admin/admin-pagos.js`
> **CSS**: `assets/css/modules/admin/admin-pagos.css`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin** o **Contable** que gestionan la tesorería y todos los egresos de la organización.

### 1.2 ¿Qué hace?
Es el módulo central de tesorería del ERP. Su función es centralizar, programar y ejecutar todos los egresos de la empresa. Administra todos los compromisos y pagos generados por compras a proveedores, costos fijos operativos (apertura diaria), gastos recurrentes (alquileres, servicios) y gastos extras imprevistos. Permite llevar un control exhaustivo del flujo de salida de dinero con proyecciones de vencimientos y conciliación de saldos.

### 1.3 ¿Cómo lo hace?
Utiliza un sistema de pestañas para organizar las diferentes fuentes de pagos:
- **TODOS**: Cola unificada de pagos pendientes y realizados con soporte de acciones masivas (pagar múltiples en lote)
- **PEDIDOS**: Permite importar órdenes de compra aprobadas al flujo de pagos
- **APERTURA**: Define costos fijos que se generan automáticamente al iniciar cada día operativo
- **RECURRENTES**: Reglas configurables (semanales/mensuales) con lógica inteligente para manejo de feriados y domingos
- **EXTRAS**: Carga manual de gastos imprevistos con validación de duplicados

La ejecución del pago abre un modal donde se registra el monto final pagado, el tipo de comprobante fiscal (Factura A/C, Recibo) y el método de pago (Efectivo, Transferencia). La lógica pesada de generación masiva de pagos futuros se delega a funciones RPC de Supabase para optimizar performance.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Admin > Pagos

### 2.2 Flujo Principal

**Pestaña TODOS - Cola de Pagos:**
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable)
3. Sistema carga pagos pendientes y realizados desde `finance_payments`
4. Usuario visualiza dashboard con:
   - Resumen de pagos próximos
   - Calendario de vencimientos
   - Contadores de pendientes por categoría
5. Usuario puede seleccionar múltiples pagos (checkbox)
6. Usuario clickea "Pagar Seleccionados"
7. Se abre modal para cada pago con campos:
   - Monto Pagado (puede diferir del comprometido)
   - Tipo de Comprobante (Factura A, C, Recibo, etc.)
   - Método de Pago (Efectivo, Transferencia)
   - Nota adicional
8. Sistema ejecuta `admin_mark_payment_done` (RPC) para cada pago
9. Sistema actualiza saldos mediante Trigger en BD
10. Lista se actualiza mostrando pagos completados

**Pestaña PEDIDOS - Importación de Compras:**
1. Usuario cambia a pestaña "PEDIDOS"
2. Sistema muestra órdenes de compra aprobadas desde `replenishment_supplier_orders`
3. Usuario revisa órdenes pendientes de pago
4. Usuario clickea "Importar"
5. Sistema convierte órdenes en registros de `finance_payments`
6. Pagos aparecen en pestaña "TODOS" como pendientes

**Pestaña APERTURA - Costos Fijos Diarios:**
1. Usuario cambia a pestaña "APERTURA"
2. Sistema muestra costos definidos en `finance_opening_cost_defs`
3. Usuario puede agregar/editar costos fijos (ej: Hielo, Seguridad, Limpieza)
4. Estos costos se generan automáticamente al abrir jornada

**Pestaña RECURRENTES - Reglas de Pagos Periódicos:**
1. Usuario cambia a pestaña "RECURRENTES"
2. Sistema muestra reglas desde `finance_payment_rules`
3. Usuario crea nueva regla definiendo:
   - Título del pago
   - Tipo (Semanal/Mensual)
   - Proveedor
   - Monto
   - Acción en Feriado (Mover a día hábil anterior/posterior o mantener)
4. Usuario clickea "Generar Próx 8 Sem"
5. Sistema ejecuta RPC `admin_generate_rule_payments`
6. Sistema crea pagos futuros calculando fechas inteligentemente

**Pestaña EXTRAS - Gastos Imprevistos:**
1. Usuario cambia a pestaña "EXTRAS"
2. Usuario completa formulario de gasto:
   - Proveedor
   - Concepto
   - Monto
   - Fecha
3. Sistema verifica duplicados (mismo monto + fecha)
4. Al guardar, crea registro en `finance_payments`

### 2.3 Inputs y Acciones Clave
- **Reglas**: Título, Tipo (Semanal/Mensual), Proveedor, Monto, Acción en Feriado
- **Pagos**: Monto Pagado, Comprobante, Método, Nota
- **Acciones principales**:
  - "Pagar Seleccionados": Procesamiento por lotes
  - "Generar Próx 8 Sem": Genera pagos recurrentes futuros
  - "Importar": Convierte órdenes de compra en compromisos de pago
- **Feedback inmediato**: Notificaciones Toast, refresco de contadores en dashboard, actualización de tablas, badges de estado

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `finance_payments`, `finance_payment_rules`, `finance_opening_cost_defs`, `replenishment_supplier_orders`, `master_proveedores` | id, title, amount, due_date, status (pending/paid), provider_id, payment_type, receipt_type, paid_amount |
| **Escritura** | `finance_payments` (Insert/Update), `finance_payment_rules` (Insert/Update), `finance_opening_cost_defs` (Insert/Update) | Todos los campos listados arriba más: paid_at, paid_by, notes |

### 3.2 Lógica de Negocio
El módulo implementa un sistema complejo de gestión financiera:

**Cola de Pagos**:
- Visualización unificada de todos los compromisos de pago
- Selección múltiple para procesamiento por lotes
- Actualización atómica de estados mediante RPC

**Sistema de Reglas Recurrentes**:
- Generación automática de pagos futuros (hasta 8 semanas)
- Lógica "Smart Rule" para manejo de feriados:
  - Opción 1: Mover a día hábil anterior
  - Opción 2: Mover a día hábil posterior
  - Opción 3: Mantener fecha original
- Cálculo inteligente de fechas considerando calendario de feriados

**Importación de Órdenes de Compra**:
- Conversión automática de `replenishment_supplier_orders` en `finance_payments`
- Preservación de relación con orden original para trazabilidad
- Validación de que la orden esté aprobada antes de importar

**Costos de Apertura**:
- Definiciones maestras que se instancian al abrir jornada
- Vinculación automática con `work_days`
- Generación de pagos al momento de apertura (via Trigger o RPC)

**Gastos Extras**:
- Verificación preventiva de duplicados por monto/fecha
- Captura de proveedor, concepto y documentación
- Inserción directa en cola de pagos pendientes

**Registro de Pagos**:
- Uso de RPC `admin_mark_payment_done` para transacción atómica
- Actualización de saldos via Trigger en BD
- Registro de: monto real pagado, método, comprobante, timestamp, usuario

**Casos especiales**:
- Si el monto pagado difiere del comprometido, se registra la diferencia para auditoría
- Pagos rechazados o cancelados cambian a estado específico sin eliminar registro
- Reglas desactivadas dejan de generar pagos futuros pero mantienen histórico

### 3.3 Endpoints/API
Operaciones Supabase:
- `finance_payments`: SELECT (filtros por fecha/estado), INSERT, UPDATE
- `finance_payment_rules`: SELECT, INSERT, UPDATE, DELETE
- `finance_opening_cost_defs`: SELECT, INSERT, UPDATE
- `replenishment_supplier_orders`: SELECT (filtrado por approved)
- `master_proveedores`: SELECT (para dropdowns y datos bancarios)

Funciones RPC:
- `admin_mark_payment_done`: Marca pago como completado y actualiza saldos
- `admin_generate_rule_payments`: Genera pagos recurrentes para próximas N semanas

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tab view con cinco paneles (TODOS/PEDIDOS/APERTURA/RECURRENTES/EXTRAS)
- **Dashboard**: Resumen con KPIs, calendario de vencimientos, contadores
- **Tablas**: Listas de pagos con filtros, checkboxes para selección múltiple
- **Modal**: Formulario de ejecución de pago con campos de registro fiscal
- **Feedback**: Toast, badges de estado, actualización reactiva de contadores

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial/recarga | `.loading-spinner` |
| **Empty** | Sin pagos/reglas | `.empty-state` con CTA contextual |
| **Pending** | Pago no ejecutado | Badge amarillo, monto en rojo |
| **Paid** | Pago completado | Badge verde, fila con opacidad reducida |
| **Overdue** | Vencimiento pasado | Badge rojo, alerta visual |
| **Processing** | Ejecutando pago | Spinner en botón, deshabilitado |
| **Error** | Fallo en operación | `Toast.error()` con detalle |
| **Success** | Operación exitosa | `Toast.success()` + actualización |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional
- [x] Labels descriptivos en formularios
- [x] Contraste de colores cumple WCAG AA
- [x] Mensajes de error descriptivos
- [ ] ARIA labels en checkboxes de selección múltiple (recomendado)

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles admin/contable)
- `core/utils.js` (formatos monetarios, fechas)
- `core/toast.js`

### 5.2 Módulos Externos
- `modules/modal.js` (modal de ejecución de pago)
- `admin-navigation.js` (navegación común del área admin)

### 5.3 Dependencias entre Módulos
- **Consume**:
  - Master Proveedores (datos bancarios, nombres)
  - Admin Solicitudes (órdenes de compra aprobadas)
  - Admin Workdays (para generar costos de apertura)
  - Calendario de feriados (para lógica de reglas recurrentes)
- **Es consumido por**:
  - Reportes financieros (flujo de caja, proyecciones)
  - Dashboard ejecutivo (métricas de egresos)
  - Módulo de conciliación bancaria

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin` y `contable` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura en tablas financieras
- [x] RPC functions con validación de rol en backend

### 6.2 Validaciones de Datos
- [x] Campos requeridos en reglas: título, tipo, proveedor, monto
- [x] Campos requeridos en pago: monto pagado >= 0
- [x] Formato monetario: valores numéricos positivos
- [x] Prevención de duplicados en gastos extras (monto + fecha)
- [x] Validación de fechas: no permitir pagos con fecha muy pasada sin confirmación
- [ ] Validación de saldo disponible (opcional, según configuración)

### 6.3 Manejo de Errores
- Errores de validación se muestran inline en formularios
- Errores de RPC se capturan y muestran con Toast.error() detallado
- Errores de conexión permiten retry manual
- Pagos fallidos mantienen estado pending para reintento
- Registro de auditoría de todos los errores en console

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La estructura de pestañas por fuente de pago permite:
- **Organización lógica**: Cada tipo de egreso tiene su contexto y flujo
- **Reducción de complejidad**: En lugar de un formulario gigante, múltiples vistas especializadas
- **Flujos optimizados**: Importación masiva desde pedidos, generación automática de recurrentes

El uso de RPC para operaciones pesadas ofrece:
- **Performance**: Generación de 8 semanas de pagos en BD es más rápido que en cliente
- **Atomicidad**: Transacciones complejas garantizan consistencia
- **Seguridad**: Lógica crítica ejecutada en servidor con validaciones

La separación entre "compromiso" y "pago realizado":
- **Control presupuestario**: Visibilidad de obligaciones futuras
- **Auditoría**: Diferencias entre monto comprometido y pagado
- **Flujo de caja**: Proyecciones precisas de egresos

### 7.2 Patrones Utilizados
- **Tab-based Organization**: Múltiples vistas relacionadas sin cambio de página
- **Batch Operations**: Procesamiento de múltiples pagos simultáneamente
- **RPC Pattern**: Delegación de lógica compleja a stored procedures
- **Smart Rules**: Lógica de negocio inteligente para fechas y recurrencias
- **Audit Trail**: Registro completo de quién, qué, cuándo para cada transacción

### 7.3 Consideraciones de Performance
- Filtrado de pagos pendientes vs. históricos para reducir carga inicial
- Generación de reglas vía RPC (no loops en cliente)
- Índices en `due_date`, `status`, `provider_id` para queries rápidas
- Paginación recomendada para histórico de pagos (> 500 registros)
- Debounce en búsquedas de proveedores

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué es una regla recurrente y cómo funciona?**
R: Es una plantilla que genera pagos automáticamente en fechas programadas (semanal o mensual). Por ejemplo: "Alquiler cada 1° del mes" generará pagos para los próximos meses automáticamente.

**P: ¿Qué pasa si un pago recurrente cae en feriado?**
R: Depende de la configuración de la regla. Puedes elegir mover el pago al día hábil anterior, posterior, o mantener la fecha original.

**P: ¿Puedo modificar el monto de un pago ya generado?**
R: Sí, en la pestaña TODOS puedes editar pagos pendientes. Al ejecutar el pago, puedes ingresar el monto real pagado (que puede diferir del comprometido).

**P: ¿Cómo importo una orden de compra a pagos?**
R: En la pestaña PEDIDOS, selecciona las órdenes aprobadas y clickea "Importar". Automáticamente se crearán los pagos pendientes correspondientes.

**P: ¿Qué es la diferencia entre "Monto Comprometido" y "Monto Pagado"?**
R: El comprometido es lo que se estimó pagar. El pagado es lo que realmente se pagó (puede ser diferente por descuentos, ajustes, etc.). El sistema registra ambos para auditoría.

**P: ¿Puedo eliminar un pago por error?**
R: No se recomienda eliminar pagos. Mejor cancélalos o márcalos como anulados para mantener el registro de auditoría.

**P: ¿Cómo sé qué pagos vencen esta semana?**
R: El dashboard muestra un calendario de vencimientos y contadores de pagos próximos. También puedes filtrar por rango de fechas en la tabla principal.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Crear regla recurrente y generar 8 semanas de pagos
- [x] Importación: Importar órdenes de compra desde pestaña PEDIDOS
- [x] Pago individual: Marcar un pago como completado con todos los campos
- [x] Pago múltiple: Seleccionar varios pagos y procesarlos por lotes
- [x] Gastos extras: Agregar gasto imprevisto y verificar que aparece en TODOS
- [x] Validación duplicados: Intentar crear gasto extra con mismo monto/fecha
- [x] Regla con feriado: Crear regla mensual que caiga en feriado y verificar ajuste
- [x] Costos de apertura: Verificar que se generan al abrir jornada
- [x] Estados de pago: Verificar badges y visualización de pendientes/pagados/vencidos
- [x] Permisos: Intentar acceder con rol no autorizado

### 9.2 Datos de Prueba
- Crear 3-5 proveedores con datos bancarios completos
- Crear reglas recurrentes: 1 semanal (ej: limpieza), 2 mensuales (alquiler, servicios)
- Importar 2-3 órdenes de compra aprobadas
- Agregar 2-3 gastos extras con diferentes conceptos
- Definir 2-3 costos de apertura (hielo, seguridad)
- Ejecutar 5-10 pagos con diferentes métodos y comprobantes
- Probar escenario con pago vencido (fecha pasada)

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 con detalle de flujos de importación y reglas recurrentes |

---

## 11. Referencias y Links

- [Master Proveedores](admin-master-proveedores.md) - Datos bancarios para pagos
- [Admin Solicitudes](admin-solicitudes.md) - Órdenes de compra que se importan
- [Admin Workdays](workdays.md) - Generación de costos de apertura
- [Screen Map](../../architecture/screen-map.md#admin-pagos) - Ubicación en arquitectura de pantallas
