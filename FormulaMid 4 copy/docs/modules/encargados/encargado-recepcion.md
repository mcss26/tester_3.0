# Encargado Recepción

> **Rol**: Encargado
> **Ruta**: `pages/encargados/encargado-recepcion.html`
> **JS**: `assets/js/modules/encargados/encargado-recepcion.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Principalmente usuarios con rol **Encargado de Barra** (`encargado_barra`) que gestionan la recepción física de mercadería.

### 1.2 ¿Qué hace?
Gestiona la recepción física de mercadería enviada por proveedores. Permite contrastar lo que el sistema esperaba recibir (según la orden de reposición aprobada por Admin) contra lo que efectivamente llegó al local, registrando faltantes o discrepancias. Es el paso final del workflow de reposición que actualiza el stock real en el sistema.

### 1.3 ¿Cómo lo hace?
El módulo opera mediante un flujo de verificación y confirmación:
1. **Listado**: Muestra órdenes en estado `approved` que ya tienen una fecha estimada de llegada (ETA)
2. **Conteo**: Abre un modal detallando cada SKU de la orden. El encargado ingresa la cantidad de **unidades** recibidas (no packs)
3. **Procesamiento**: Al confirmar, se invoca una función de base de datos (`rpc_receive_supplier_order`) que de forma atómica actualiza la orden y procesa el ingreso de stock, generando movimientos en `inventory_movements` y actualizando `inventory_stocks`

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Encargados > Recepción

### 2.2 Flujo Principal
1. Usuario accede a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: encargado_barra, admin)
3. Sistema carga órdenes de compra aprobadas pendientes de recepción desde `replenishment_supplier_orders`
4. Usuario visualiza listado de órdenes con estado `approved` y ETA definida
5. Usuario selecciona una orden para recepcionar
6. Sistema abre modal con detalle de cada SKU y cantidad esperada
7. Usuario verifica mercadería física y registra cantidad de unidades recibidas por SKU
8. Usuario agrega notas de recepción si hay discrepancias (opcional)
9. Usuario confirma recepción
10. Sistema invoca `rpc_receive_supplier_order` que:
    - Actualiza estado de la orden a `received`
    - Genera movimientos de stock en `inventory_movements`
    - Actualiza stock actual en `inventory_stocks`
    - Registra faltantes o sobrantes si los hay
11. Sistema muestra feedback con Toast de éxito
12. Sistema recarga listado (orden recepcionada ya no aparece)

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Unidades recibidas por SKU (Numérico), Notas de recepción (Texto opcional)
- **Acción principal**: "Confirmar Recepción" (invoca RPC para procesar ingreso)
- **Feedback inmediato**: Notificación Toast de éxito/error, recarga del listado principal, actualización de stock en tiempo real

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `replenishment_supplier_orders`, `replenishment_items`, `master_sku` | order_id, sku_id, final_packs, pack_qty, eta, status |
| **Escritura** | `supplier_orders`, `replenishment_items`, `inventory_movements`, `inventory_stocks` (vía RPC) | order_id, status, received_units, movement_type, quantity |

### 3.2 Lógica de Negocio
El módulo implementa un flujo crítico de recepción de mercadería:

**Visualización de Órdenes**:
- Solo muestra órdenes en estado `approved` con ETA definida
- Filtra órdenes pendientes de recepción
- Muestra detalle de cada SKU con cantidad esperada (en packs)

**Conversión de Unidades**:
- Las órdenes se crean en packs (`final_packs`)
- El sistema convierte a unidades esperadas: `final_packs * pack_qty`
- El encargado registra unidades recibidas (más granular)
- Permite detectar discrepancias a nivel unitario

**Procesamiento Atómico**:
- Utiliza RPC de Supabase (`rpc_receive_supplier_order`) para garantizar integridad
- Envía payload JSON con unidades recibidas por SKU
- Actualiza múltiples tablas en una transacción
- Registra timestamp de recepción y responsable

**Casos especiales**:
- Si se reciben menos unidades de las esperadas, se registra el faltante pero se procesa la orden
- Si se reciben más unidades, se registra el sobrante
- Las órdenes con discrepancias generan alertas para revisión posterior
- Solo permite recibir órdenes aprobadas con ETA

### 3.3 Endpoints/API
Operaciones Supabase:
- `replenishment_supplier_orders`: SELECT (filtrado por approved con ETA)
- `replenishment_items`: SELECT (detalle de SKUs de la orden)
- `master_sku`: SELECT (para información de productos)

**RPC de Supabase**:
- `rpc_receive_supplier_order`: Función de base de datos que procesa atómicamente:
  - Actualización de `supplier_orders` (status → received)
  - Creación de registros en `inventory_movements` (tipo: ingreso)
  - Actualización de `inventory_stocks` (suma de unidades recibidas)
  - Registro de discrepancias si las hay

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Listado de órdenes pendientes de recepción
- **Overlay/Modal**: Modal de conteo de recepción con detalle por SKU
- **Feedback**: `Toast`, actualización de listado

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial | `.loading-spinner` |
| **Empty** | Sin órdenes pendientes | `.empty-state` con mensaje "No hay órdenes para recepcionar" |
| **Error** | Fallo en operación | `Toast.error()` con mensaje descriptivo |
| **Success** | Recepción confirmada | `Toast.success()` + recarga de listado |
| **Approved** | Orden lista para recepcionar | Badge verde "Aprobada" con ETA visible |
| **Received** | Orden ya recepcionada | No aparece en listado (filtrada) |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional
- [x] Labels descriptivos en campos de unidades
- [x] Contraste de colores cumple WCAG AA
- [x] Mensajes de error descriptivos
- [x] Inputs numéricos con validación en tiempo real

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles encargado_barra, admin)
- `core/utils.js`
- `core/toast.js`

### 5.2 Módulos Externos
- Ninguno

### 5.3 Dependencias entre Módulos
- **Consume**: Datos de `replenishment_supplier_orders` (creadas por Admin), `master_sku` (catálogo de productos)
- **Es consumido por**: Módulos de inventario y stock que consultan `inventory_stocks` actualizado
- **Relacionado con**: Admin Reposición (aprobación de órdenes), Admin Stock (visualización de inventario)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `encargado_barra` y `admin` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura

### 6.2 Validaciones de Datos
- [x] Campos requeridos: `order_id`, `received_units` por cada SKU
- [x] Rangos numéricos: `received_units >= 0`
- [x] Validación de orden aprobada con ETA
- [x] Prevención de doble recepción de la misma orden
- [x] Validación de formato JSON del payload

### 6.3 Manejo de Errores
- Errores de validación se muestran con Toast.error()
- Errores de conexión/permisos se capturan y muestran mensajes descriptivos
- Errores en RPC se capturan y muestran el detalle del problema
- Discrepancias de stock se registran pero no bloquean la recepción
- Validación de integridad referencial en base de datos

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
El diseño responde a necesidades operativas y de integridad de datos:
- **RPC para atomicidad**: Garantiza que todas las actualizaciones se hagan en una transacción o ninguna se haga
- **Conteo en unidades**: Permite detectar discrepancias más precisas que contar solo packs completos
- **Conversión automática**: El sistema calcula unidades esperadas para facilitar la comparación
- **Registro de discrepancias**: Faltantes y sobrantes quedan documentados para auditoría
- **Filtrado inteligente**: Solo muestra órdenes listas para recepcionar (aprobadas con ETA)

### 7.2 Patrones Utilizados
- **RPC para operaciones complejas**: Uso de funciones de base de datos para lógica transaccional
- **Conversión de unidades**: Transformación de packs a unidades para granularidad
- **Payload JSON**: Envío estructurado de datos al RPC
- **Registro de auditoría**: Timestamp y responsable en cada recepción
- **Actualización optimista**: Recarga de UI asumiendo éxito del RPC

### 7.3 Consideraciones de Performance
- Filtrado de órdenes en base de datos (no client-side)
- RPC optimizado para actualizaciones en lote
- Índices en `supplier_orders` por status y ETA
- Carga selectiva de SKUs solo de la orden seleccionada

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué pasa si recibo menos unidades de las esperadas?**
R: El sistema registra el faltante y actualiza el stock con las unidades realmente recibidas. La discrepancia queda documentada para auditoría y seguimiento con el proveedor.

**P: ¿Puedo recepcionar una orden parcialmente?**
R: Sí, puedes ingresar cero unidades para algunos SKUs si no llegaron. El sistema procesará solo lo que efectivamente recibiste.

**P: ¿Qué pasa si me equivoco al contar?**
R: Una vez confirmada la recepción, el stock ya está actualizado. Debes contactar a Admin para hacer un ajuste manual de inventario si es necesario.

**P: ¿Por qué cuento en unidades y no en packs?**
R: Contar en unidades permite detectar packs incompletos o rotos. Es más preciso para la auditoría de stock.

**P: ¿Puedo agregar notas en la recepción?**
R: Sí, hay un campo de notas opcional donde puedes registrar observaciones sobre el estado de la mercadería, discrepancias o problemas con la entrega.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Recepcionar orden completa con unidades exactas
- [x] Recepción con faltantes: Registrar menos unidades de las esperadas
- [x] Recepción con sobrantes: Registrar más unidades de las esperadas
- [x] Error de validación: Intentar recepcionar con unidades negativas
- [x] Estado vacío: Acceder sin órdenes aprobadas pendientes
- [x] Permisos: Intentar acceder con rol staff (debe redirigir)
- [x] Actualización de stock: Verificar que inventory_stocks se actualiza correctamente
- [x] Prevención de duplicados: Intentar recepcionar la misma orden dos veces

### 9.2 Datos de Prueba
- Al menos 2 órdenes en estado `approved` con ETA definida
- Órdenes con múltiples SKUs (al menos 3 productos diferentes)
- SKUs con diferentes pack_qty para probar conversión
- Stock inicial registrado en `inventory_stocks` para verificar sumas

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Actualización V2 detallando lógica de conversión de packs a unidades y uso de RPC |

---

## 11. Referencias y Links

- [Admin Reposición](../admin/admin-replenishment.md) - Aprobación de órdenes de compra
- [Admin Stock](../admin/admin-stock.md) - Visualización de inventario actualizado
- [Master SKU](../admin/admin-master-sku.md) - Catálogo de productos
- [Master Proveedores](../admin/admin-master-proveedores.md) - Gestión de proveedores
- [Screen Map](../../screen-map.md#encargado-recepcion) - Ubicación en arquitectura de pantallas
