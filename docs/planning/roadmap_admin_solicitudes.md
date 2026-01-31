# Roadmap: Admin Solicitudes

## Resumen ejecutivo
Integrar el flujo completo de reposición de stock con el ciclo de pagos, desde la detección automática de bajo stock hasta el conteo final por parte del encargado de barra. El foco inmediato está en habilitar la pre-aprobación de items por parte del admin, seguimiento logístico, registro de facturas y conteo de mercadería para cerrar el ciclo con pagos automáticos.

## Flujo de negocio correcto

1. **Solicitud automática**
   - El sistema detecta stock bajo y genera automáticamente la solicitud con costo estimado.

2. **Admin: pre-aprobación (presupuesto aproximado)**
   - El Admin revisa solicitudes abiertas con el costo estimado agregado.
   - Puede aprobar o rechazar antes de que operativo consulte proveedores.

3. **Operativo: gestión con proveedor**
   - Contacta al proveedor.
   - Registra precio final y fecha de entrega negociados.
   - Envía la orden para aprobación final del admin.

4. **Admin: aprobación final**
   - Verifica precio final versus presupuesto.
   - Al aprobar, la orden se envía automáticamente al calendario de pagos.
   - Si rechaza, regresa a operativo con motivo.

5. **Logística: seguimiento y recepción**
   - Hace seguimiento del pedido y actualiza estados.
   - Registra recepción de factura física.

6. **Encargado de barra: conteo**
   - Cuenta la mercadería recibida y valida cantidades versus el pedido original.
   - Confirma recepción completa o reporta discrepancias.

## Estado actual vs requerido

| Paso | Estado actual | Estado requerido |
| --- | --- | --- |
| Solicitud automática | ✅ Funciona | OK |
| Pre-aprobación admin (presupuesto) | ❌ No existe | Implementar |
| Operativo asienta precio/fecha | ✅ Funciona | OK |
| Aprobación final admin | ✅ Funciona | OK |
| Envío a calendario pagos | ✅ Funciona (importar) | OK |
| Seguimiento logística | ⚠️ Básico | Mejorar |
| Recepción de factura | ❌ No existe | Implementar |
| Conteo encargado barra | ❌ No existe | Implementar |

## Decisiones de diseño

- **Rol conteo:** reutilizar el perfil `encargado_barra` ya existente para el nuevo módulo de conteo en lugar de crear un rol adicional.
- **Granularidad pre-aprobación:** se ofrecerá por ítem/SKU y por proveedor, manteniendo ambas vistas actuales para consistencia.
- **Vistas actuales:** conservar la lógica de vistas “por item” y “por proveedor” en `admin-solicitudes`.

## Brechas e implementaciones

### Nuevas funcionalidades

| Funcionalidad | Módulo | Rol | Prioridad |
| --- | --- | --- | --- |
| Pre-aprobación con presupuesto estimado | admin-solicitudes | Admin | 🔴 Crítica |
| Aprobar/rechazar por item individual | admin-solicitudes | Admin | 🔴 Crítica |
| Seguimiento de pedido | logistica-seguimiento | Logística | 🟠 Alta |
| Recepción de factura | logistica-recepcion | Logística | 🟠 Alta |
| Conteo de mercadería | encargado-barra-conteo | Encargado Barra | 🟠 Alta |
| Validación conteo vs pedido | encargado-barra-conteo | Encargado Barra | 🟠 Alta |

### Mejoras existentes

| Brecha | Módulo | Prioridad |
| --- | --- | --- |
| Edición de costos de apertura | admin-pagos | 🟡 Media |
| Búsqueda de pagos | admin-pagos | 🟡 Media |
| Auditoría de cambios | solicitudes | 🟡 Media |

## Archivos a modificar o crear

### Modificar

- `admin-solicitudes.js`: agregar lógica de pre-aprobación (carga, aprobación/rechazo por item y por proveedor).
- `admin-solicitudes.html`: UI para aprobar/rechazar items individuales, selección múltiple y modal de rechazo global.
- `logistica-recepcion.js`: registrar datos de factura (número, fecha, monto) y validar diferencias.
- `logistica-recepcion.html`: formulario para recepción de factura.

### Crear nuevos

- `encargado-barra-conteo.js`: lógica del conteo y validación frente al pedido.
- `encargado-barra-conteo.html`: pantalla de conteo para encargado de barra.
- `logistica-seguimiento.js`: dashboard con línea de tiempo de estados.
- `logistica-seguimiento.html`: UI del seguimiento con botones para cambios de estado.

## Cambios en la base de datos

- `replenishment_items`
  - `pre_approval_status` (`TEXT`, default `pending`)
  - `pre_approved_by` (`UUID`, FK `profiles(id)`)
  - `pre_approved_at` (`TIMESTAMPTZ`)
  - `pre_rejection_reason` (`TEXT`)

- `replenishment_supplier_orders`
  - `invoice_number` (`TEXT`)
  - `invoice_date` (`DATE`)
  - `invoice_amount` (`NUMERIC`)
  - `invoice_received_by` (`UUID`, FK `profiles(id)`)
  - `invoice_received_at` (`TIMESTAMPTZ`)

- `replenishment_receipt_items`
  - `counted_qty` (`NUMERIC`)
  - `counted_by` (`UUID`, FK `profiles(id)`)
  - `counted_at` (`TIMESTAMPTZ`)
  - `count_notes` (`TEXT`)
  - `count_status` (`TEXT`, default `pending`) — estados `pending | counted | discrepancy`

- Nueva tabla `replenishment_tracking`
  - `id` (`UUID`, PK)
  - `order_id` (`UUID`, FK `replenishment_supplier_orders(id)`)
  - `status` (`TEXT`, forced: `ordered | in_transit | arrived | delivered`)
  - `notes` (`TEXT`)
  - `created_by` (`UUID`, FK `profiles(id)`)
  - `created_at` (`TIMESTAMPTZ`, default `NOW()`)

## Plan de implementación

| Fase | Objetivo | Tiempo estimado | Dependencias |
| --- | --- | --- | --- |
| 1 | Campos de pre-aprobación y UI Admin para vistas por item/proveedor | 6 h | Ninguna |
| 2 | Filtrar items pre-aprobados en operativo y mostrar badges | 1 h | Fase 1 |
| 3 | Campos de factura y tracking, + pantalla de seguimiento logística | 4 h | Ninguna |
| 4 | Formulario de recepción de factura con validaciones | 2 h | Fase 3 |
| 5 | Nuevos campos de conteo y pantalla para encargado de barra | 6 h | Ninguna |
| 6 | Validación de conteo vs pedido y discrepancias | 1 h | Fase 5 |
| 7 | Automatizar creación de pago al aprobar orden | 2 h | Fase 1 |
| 8 | Testing E2E del flujo completo | 2 h | Todo lo anterior |

Tiempo total estimado: 25‑27 horas

## Verificación post-implementación

- **Fase 1 (Pre-aprobación)**: generar solicitud automática, pre-aprobar/rechazar por item y por proveedor, asegurar que los items rechazados no aparecen para operativo.
- **Fase 2 (Operativo)**: operativo ve solo items pre-aprobados, asienta precio y fecha, envía a aprobación final.
- **Fase 3 (Logística)**: tablero muestra pedidos aprobados, puede actualizar estados y registrar factura con alertas de montos.
- **Fase 4 (Encargado de barra)**: recepciones pendientes, ingreso de cantidades contadas, validación automática, alertas y confirmación de conteo.
- **Fase 5 (Integración con pagos)**: aprobación final crea `finance_payment`, el pago aparece en calendario con link al pedido.
- **Prueba E2E**: recorrido completo desde stock bajo hasta actualización de inventario.

## Criterios de éxito

- Admin puede pre-aprobar o rechazar items individuales y por proveedor antes de la gestión operativa.
- Operativo solo gestiona items pre-aprobados.
- Logística puede seguir el estado del pedido, registrar facturas y recibir alertas de discrepancias.
- Encargado de barra cuenta mercadería y valida cantidades contra el pedido.
- Pagos se generan automáticamente al aprobar la orden final.
- Los nuevos campos en la BD están disponibles y respetan permisos por rol.

