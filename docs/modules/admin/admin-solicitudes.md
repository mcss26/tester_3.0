# Admin Solicitudes (Aprobación de Pedidos)

> **Rol**: Admin, Contable
> **Ruta**: `pages/admin/admin-solicitudes.html`
> **JS**: `assets/js/modules/admin/admin-solicitudes.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin** o **Contable** que ejercen control sobre las compras y reposiciones del establecimiento.

### 1.2 ¿Qué hace?
Actúa como la autoridad de aprobación para todas las compras y reposiciones del club. Su objetivo es auditar las propuestas de pedido enviadas por el equipo operativo, comparar los costos estimados contra los finales y dar el visto bueno financiero antes de que se formalice la orden con el proveedor. Es el puente crítico entre la necesidad de stock identificada por operaciones y el compromiso de pago.

### 1.3 ¿Cómo lo hace?
El administrador supervisa el flujo de reposición en dos vistas principales:

1. **Control de Pendientes**: Lista todas las órdenes de suministros agrupadas por proveedor que ya tienen un costo y fecha definida por el operador (estado `Ready for Approval`). El administrador puede abrir el detalle de cada orden, revisar item por item con sus cantidades y costos, y **Aprobar** o **Rechazar** la orden completa.

2. **Auditoría de Sin Asignar**: Identifica discrepancias o items "sueltos" que aún no han sido vinculados a una orden de compra, permitiendo ver el impacto presupuestario de lo que aún falta gestionar y tomar acciones correctivas.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Admin > Pedidos (Solicitudes)

### 2.2 Flujo Principal

**Vista Pendientes:**
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable)
3. Sistema carga órdenes pendientes desde `replenishment_supplier_orders` (status = 'ready_for_approval')
4. Usuario visualiza:
   - Dashboard de control con indicadores de costo y presupuesto estimado
   - Lista de órdenes agrupadas por proveedor
   - Pills de estado (Pendiente, Aprobada, Rechazada)
5. Usuario clickea en una orden para ver detalle
6. Sistema muestra modal/panel con:
   - Items solicitados con cantidades
   - Costos por pack (del Master SKU)
   - Presupuesto total calculado (requested_packs × costo_pack)
   - Fecha de entrega esperada
   - Proveedor y sus datos de contacto
7. Usuario tiene dos opciones:
   - **Aprobar**: Cambia estado a `approved`, registra approved_by y approved_at
   - **Rechazar**: Cambia estado a `rejected`, solicita motivo (textarea) para audit trail
8. Sistema actualiza estado en `replenishment_supplier_orders`
9. Lista se actualiza removiendo la orden procesada
10. Sistema muestra feedback con Toast

**Vista Sin Asignar:**
1. Usuario cambia a pestaña "Sin Asignar"
2. Sistema muestra items de solicitudes que no están en ninguna orden
3. Usuario puede ver el impacto presupuestario total
4. Identifica qué productos necesitan asignación a proveedor

### 2.3 Inputs y Acciones Clave
- **Inputs principales**: Motivo de Rechazo (Textarea en modal, opcional pero recomendado)
- **Acciones principales**:
  - "Aprobar": Confirma la orden y la libera para proceso de pago
  - "Rechazar": Cancela la orden e intenta guardar el motivo
- **Feedback inmediato**: Toast notifications, actualización de contadores, badges de estado actualizados

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `replenishment_supplier_orders`, `replenishment_requests`, `replenishment_items`, `master_sku`, `master_proveedores` | id, provider_id, status, total_cost, delivery_date, requested_packs, sku_id, pack_cost |
| **Escritura** | `replenishment_supplier_orders` (Update) | status (approved/rejected), approved_by, approved_at, rejection_reason |

### 3.2 Lógica de Negocio
El módulo implementa un flujo de aprobación con las siguientes características:

**Control de Aprobación**:
- Solo permite aprobar si la orden tiene fecha de entrega definida
- Solo permite aprobar si el costo final es mayor o igual a cero
- Registra quién aprobó y cuándo (audit trail)
- Actualización atómica del estado para evitar aprobaciones duplicadas

**Cálculo de Presupuesto**:
- Multiplica `requested_packs` por el costo del pack definido en Master SKU
- Suma todos los items de la orden para obtener total
- Compara presupuesto estimado vs. costo final reportado por operativo
- Alerta si hay discrepancias significativas

**Gestión de Rechazos**:
- Permite rechazar con o sin motivo (recomendado con motivo)
- Motivo se guarda en `rejection_reason` para trazabilidad
- Orden rechazada queda registrada pero no genera pago
- Operativo puede ver motivo de rechazo para corregir

**Items Sin Asignar**:
- Identifica items de solicitudes sin orden asociada
- Calcula impacto presupuestario de items pendientes
- Permite detectar problemas en el flujo operativo
- Útil para auditoría y seguimiento

**Casos especiales**:
- Si no hay costo en Master SKU, se muestra alerta pero permite aprobar
- Si proveedor no tiene datos de contacto completos, se muestra advertencia
- Órdenes parcialmente recibidas pueden aprobarse de todos modos (el pago se ajusta al recibido)

### 3.3 Endpoints/API
Operaciones Supabase:
- `replenishment_supplier_orders`: SELECT (filtrado por status), UPDATE (cambio de estado y campos de aprobación)
- `replenishment_items`: SELECT (para detalle de la orden)
- `master_sku`: SELECT (para costos)
- `master_proveedores`: SELECT (para datos de contacto)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Dashboard de Control**: KPIs con indicadores de costo, presupuesto estimado, contador de pendientes
- **Lista de Órdenes**: Tabla con pills de estado, filtros
- **Modal de Detalle**: Muestra items, costos, totales, botones de acción
- **Feedback**: Toast notifications, badges de estado

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial | `.loading-spinner` |
| **Empty** | Sin órdenes pendientes | `.empty-state` con mensaje "No hay pedidos pendientes de aprobación" |
| **Pending Approval** | Orden lista para revisar | Badge amarillo "Pendiente" |
| **Approved** | Orden aprobada | Badge verde "Aprobada", fila desaparece de lista pendientes |
| **Rejected** | Orden rechazada | Badge rojo "Rechazada", muestra motivo si existe |
| **Processing** | Ejecutando aprobación/rechazo | Spinner en botón, botones deshabilitados |
| **Error** | Fallo en operación | `Toast.error()` con detalle |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional
- [x] Labels descriptivos en formularios
- [x] Contraste de colores cumple WCAG AA
- [x] Mensajes de error descriptivos
- [x] Focus management en modal

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles admin/contable)
- `core/utils.js` (formatos monetarios, fechas)
- `core/toast.js`

### 5.2 Módulos Externos
- `modules/modal.js` (modal de detalle y acciones)
- `admin-navigation.js` (navegación común del área admin)

### 5.3 Dependencias entre Módulos
- **Consume**:
  - Master SKU (costos de productos)
  - Master Proveedores (datos de contacto)
  - Módulo Staff Solicitudes (órdenes generadas por operativos)
- **Es consumido por**:
  - Admin Pagos (importación de órdenes aprobadas)
  - Módulo de Recepción (validación de entregas contra órdenes aprobadas)
  - Reportes de compras (análisis de aprobaciones/rechazos)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin` y `contable` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura en replenishment_supplier_orders

### 6.2 Validaciones de Datos
- [x] Validación de existencia de orden antes de aprobar/rechazar
- [x] Validación de fecha de entrega presente antes de aprobar
- [x] Validación de costo final >= 0 antes de aprobar
- [x] Prevención de doble aprobación (validación de estado actual)
- [ ] Validación de presupuesto disponible (opcional, según configuración)

### 6.3 Manejo de Errores
- Errores de validación se muestran con Toast.error() antes de enviar
- Errores de Supabase se capturan y muestran de forma amigable
- Errores de conexión permiten retry manual
- Operaciones fallidas no cambian el estado de la orden

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La separación en dos vistas (Pendientes / Sin Asignar) permite:
- **Enfoque dual**: Control de lo que está listo vs. identificación de problemas
- **Priorización**: Atender primero lo que puede aprobarse
- **Auditoría proactiva**: Detectar items olvidados antes de que causen faltantes

El flujo de aprobación centralizado ofrece:
- **Control financiero**: Un solo punto de autorización para egresos
- **Visibilidad**: Claridad de costos antes de comprometer pago
- **Trazabilidad**: Registro completo de quién aprobó qué y cuándo

### 7.2 Patrones Utilizados
- **Approval Workflow**: Flujo de tres estados (pending → approved/rejected)
- **Audit Trail**: Registro de approved_by, approved_at, rejection_reason
- **Master-Detail**: Lista de órdenes con modal de detalle para revisión
- **Calculated Budget**: Cálculo client-side de presupuesto para validación pre-aprobación

### 7.3 Consideraciones de Performance
- Filtrado por estado para cargar solo órdenes relevantes
- Join con master_sku para evitar queries adicionales por costos
- Cálculo de totales en cliente (no query adicional)
- Índices en `status`, `provider_id`, `delivery_date`

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué pasa cuando apruebo una orden?**
R: La orden cambia a estado `approved`, se registra tu usuario y la fecha, y la orden queda disponible para importarse en el módulo de Pagos.

**P: ¿Puedo aprobar una orden parcialmente?**
R: No, la aprobación es por orden completa. Si hay items que no quieres aprobar, debes rechazar la orden completa y solicitar al operativo que cree una nueva sin esos items.

**P: ¿Es obligatorio dar un motivo al rechazar?**
R: No es obligatorio técnicamente, pero es altamente recomendado para que el operativo entienda qué corregir.

**P: ¿Qué significa "Sin Asignar"?**
R: Son items de solicitudes que el operativo no ha vinculado a ninguna orden de compra. Pueden indicar productos sin proveedor definido o solicitudes incompletas.

**P: ¿Puedo revertir una aprobación?**
R: No directamente desde esta pantalla. Si necesitas revertir, debes hacerlo desde el módulo de Pagos antes de ejecutar el pago.

**P: ¿El presupuesto mostrado es exacto?**
R: Es estimado, basado en los costos actuales del Master SKU multiplicados por los packs solicitados. El costo final puede variar según negociación con el proveedor.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Aprobar orden con todos los datos correctos
- [x] Rechazo: Rechazar orden con motivo y sin motivo
- [x] Validación: Intentar aprobar orden sin fecha de entrega (debe fallar)
- [x] Estado vacío: Acceder sin órdenes pendientes
- [x] Permisos: Intentar acceder con rol no autorizado
- [x] Items sin asignar: Verificar que se muestran correctamente
- [x] Cálculo de presupuesto: Verificar totales con diferentes cantidades y costos
- [x] Múltiples items: Orden con 5+ items diferentes
- [x] Estados: Verificar badges para órdenes pendientes, aprobadas, rechazadas

### 9.2 Datos de Prueba
- Crear 3-5 solicitudes de reposición desde módulo Staff
- Generar órdenes para diferentes proveedores
- Incluir items con costos variados (algunos con $0)
- Crear solicitudes con items sin proveedor asignado
- Probar con órdenes de 1 item y órdenes de 10+ items
- Incluir una orden con fecha de entrega muy lejana

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 detallando el flujo de auditoría y aprobación de compras |

---

## 11. Referencias y Links

- [Admin Pagos](admin-pagos.md) - Importa órdenes aprobadas para gestionar pagos
- [Admin Central Stock](admin-central-stock.md) - Fuente de costos unitarios y por pack
- [Master Proveedores](admin-master-proveedores.md) - Datos de contacto y bancarios
- [Screen Map](../../screen-map.md#admin-solicitudes) - Ubicación en arquitectura de pantallas
