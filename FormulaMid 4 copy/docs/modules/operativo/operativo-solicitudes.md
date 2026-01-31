# Operativo Solicitudes

> **Rol**: Operativo, Logístico
> **Ruta**: `pages/operativo/operativo-solicitudes.html`
> **JS**: `assets/js/modules/operativo/operativo-solicitudes.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Operativo** (`operativo`) o **Logístico** (`logistico`) que gestionan pedidos de reposición diarios.

### 1.2 ¿Qué hace?
Gestiona la generación de pedidos de reposición diarios de forma semiautomática. El sistema detecta qué productos tienen stock bajo y crea una propuesta de pedido; el usuario operativo refina esta propuesta asignando proveedores, ajustando cantidades por merma y estableciendo fechas estimadas de llegada (ETA). Funciona como el puente entre la detección de necesidades (Stock) y la aprobación administrativa de órdenes de compra.

### 1.3 ¿Cómo lo hace?
El proceso sigue un flujo de tres etapas:
1. **Detección Automática**: Al abrir el módulo, el sistema busca la jornada abierta (vía `WorkDayHelper`) y carga automáticamente los SKUs con estado "Bajo" en `replenishment_items`
2. **Refinamiento Operativo**:
   - **Vista SKU**: El usuario asigna el proveedor adecuado para cada item y define la fecha de entrega
   - **Ajustes**: Si hay una discrepancia (ej. una rotura), se puede registrar un ajuste con motivo y observación
3. **Consolidación Logística**: En la pestaña "Por Proveedor", el sistema agrupa los items por orden de compra. Aquí se ingresa el **Costo Final** y la **Fecha Repo**. Cuando ambos datos están presentes, la orden pasa automáticamente a estado `Ready for Approval` para que el Administrador pueda confirmarla

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Operativo > Solicitudes

### 2.2 Flujo Principal

**Vista por SKU:**
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: operativo, logistico)
3. Sistema busca jornada abierta usando `WorkDayHelper`
4. Sistema carga automáticamente items con stock bajo en `replenishment_items`
5. Usuario revisa lista de productos que necesitan reposición
6. Para cada item, usuario:
   - Selecciona proveedor del dropdown (carga desde `master_proveedores`)
   - Define fecha estimada de llegada (ETA)
   - Opcionalmente registra ajustes de cantidad si detecta merma/rotura
7. Al cambiar proveedor, sistema crea/actualiza vinculación con orden de compra en `replenishment_supplier_orders`
8. Sistema sincroniza automáticamente fecha ETA con la fecha de toda la orden del proveedor

**Vista por Proveedor:**
1. Usuario cambia a pestaña "Por Proveedor"
2. Sistema agrupa items por proveedor/orden de compra
3. Usuario completa datos de la orden:
   - **Costo Final**: Monto total negociado con proveedor (acepta 0 para bonificaciones)
   - **Fecha Repo**: Fecha confirmada de entrega
4. Sistema valida que ambos campos estén completos
5. Si orden tiene fecha y costo, sistema actualiza automáticamente estado a `Ready for Approval`
6. Orden queda lista para revisión por administrador

**Ajustes de Cantidad:**
1. Usuario detecta discrepancia en cantidad física (ej: rotura, merma)
2. Usuario clickea "Ajustar" en el item
3. Sistema abre modal con selector de motivo (Rotura, Merma, Error de conteo, Otro)
4. Usuario ingresa nueva cantidad y observación
5. Sistema registra ajuste en `replenishment_items` con ID del responsable
6. Ajuste queda registrado para auditoría

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Selección de Proveedor (select), Fecha ETA/Repo (date input), Costo Final (number input), Motivo de Ajuste (modal select)
- **Acción principal**: "Cambiar Proveedor" (asigna/reasigna proveedor), "Confirmar Ajuste" (registra cambio de cantidad)
- **Feedback inmediato**: Sincronización automática de fechas, actualización de estado de orden (Pills de color), Toast notifications

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `replenishment_requests`, `replenishment_items`, `replenishment_supplier_orders`, `master_proveedores`, `work_days` | id, work_day_id, sku_id, quantity_needed, provider_id, eta_date, final_cost, repo_date, status (pending/ready_for_approval/approved) |
| **Escritura** | `replenishment_items` (update provider, eta, quantity), `replenishment_supplier_orders` (update cost, date, status) | provider_id, eta_date, quantity_adjusted, adjustment_reason, adjusted_by, final_cost, repo_date, status |

### 3.2 Lógica de Negocio
El módulo implementa un flujo de reposición proactiva con consolidación por proveedor:

**Detección Automática de Necesidades**:
- Usa `WorkDayHelper` para obtener jornada activa
- Carga items de `replenishment_items` con estado "Bajo" vinculados a la jornada
- Items se generan automáticamente al comparar stock actual vs requerido

**Asignación de Proveedores**:
- Usuario selecciona proveedor de dropdown poblado desde `master_proveedores`
- Al cambiar proveedor, sistema busca o crea orden en `replenishment_supplier_orders`
- Si cambia proveedor, se reinicia el vínculo con la orden anterior y crea nueva

**Sincronización de Fechas**:
- Al cambiar fecha en un item individual, se propaga a todos los items del mismo proveedor
- Mantiene consistencia: todos los items de una orden tienen la misma fecha estimada
- Sincronización bidireccional entre vista SKU y vista Proveedor

**Gobernanza de Aprobación**:
- Orden solo es "aprobable" si tiene fecha y costo (validado en `onOrderInfoChange`)
- Estado `pending`: Orden incompleta, falta fecha o costo
- Estado `ready_for_approval`: Orden completa, lista para revisión de admin
- Estado `approved`: Admin confirmó la orden (bloqueada para edición operativa)

**Ajustes de Cantidad**:
- Registro de merma/rotura con motivo y responsable
- Observaciones quedan registradas para auditoría
- Ajustes no cambian el cálculo original (se comparan "Solicitado" vs "Ajustado")

**Casos especiales**:
- Si jornada no tiene estado `open`, el módulo muestra mensaje informativo
- Items sin proveedor asignado no se pueden consolidar en órdenes
- Cambios en órdenes ya aprobadas requieren permisos de admin

### 3.3 Endpoints/API
Operaciones Supabase:
- `work_days`: SELECT (obtener jornada activa)
- `replenishment_requests`: SELECT (obtener request de la jornada)
- `replenishment_items`: SELECT, UPDATE (gestión de items individuales)
- `replenishment_supplier_orders`: SELECT, INSERT, UPDATE (consolidación por proveedor)
- `master_proveedores`: SELECT (dropdown de proveedores)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tab view con dos vistas (Por SKU / Por Proveedor)
- **Tabla SKU**: Lista de items con selects de proveedor y dates de ETA
- **Tabla Proveedor**: Agrupación de items con inputs de costo y fecha consolidada
- **Modal**: Formulario de ajuste de cantidad con selector de motivo
- **Feedback**: `Toast`, Pills de color para estados de orden, indicadores de sincronización

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de datos | `.loading-spinner` |
| **No Active Workday** | Sin jornada abierta | Mensaje informativo "No hay jornada activa" |
| **Empty Items** | Sin items de reposición | "No hay items pendientes de reposición" |
| **Items Loaded** | Lista de items cargada | Tabla con selects y date inputs |
| **Order Pending** | Orden sin fecha o costo | Badge amarillo "Pendiente" |
| **Order Ready** | Orden con fecha y costo | Badge verde "Lista para Aprobación" |
| **Order Approved** | Orden confirmada por admin | Badge azul "Aprobada" + campos bloqueados |
| **Adjustment Modal** | Modal de ajuste abierto | Overlay con formulario de ajuste |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabs, selects y formularios
- [x] Labels descriptivos en todos los inputs
- [x] Contraste de colores para badges cumple WCAG AA
- [x] Mensajes de error descriptivos en validaciones
- [x] Modal de ajuste con foco automático en campo principal

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles operativo/logistico)
- `core/utils.js` (helpers de fecha, validaciones)
- `core/toast.js`

### 5.2 Módulos Externos
- `helpers/WorkDayHelper.js` (detección de jornada activa)

### 5.3 Dependencias entre Módulos
- **Consume**:
  - `operativo-stock.md` (usa alertas de stock bajo para generar items)
  - `master_proveedores` (dropdown de proveedores)
  - `work_days` (vinculación a jornada activa)
- **Es consumido por**:
  - Módulos de admin que aprueban órdenes de compra
  - Módulos de recepción que verifican entregas contra órdenes
- **Relacionado con**: `operativo-analisis.md` (análisis de consumo alimenta necesidades)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `operativo` y `logistico` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura en tablas de reposición
- [x] Órdenes aprobadas no pueden editarse desde rol operativo

### 6.2 Validaciones de Datos
- [x] Proveedor requerido antes de consolidar en orden
- [x] Fecha ETA debe ser fecha futura válida
- [x] Costo final debe ser número >= 0 (acepta 0 para bonificaciones)
- [x] Ajustes de cantidad requieren motivo y observación
- [x] Validación de estado de orden antes de permitir edición

### 6.3 Manejo de Errores
- Errores de validación se muestran inline en los inputs
- Errores de conexión/permisos se capturan y muestran con Toast.error()
- Si WorkDayHelper no encuentra jornada, muestra estado vacío
- Errores en guardado mantienen valores anteriores y notifican al usuario
- Intentos de editar orden aprobada muestran mensaje de bloqueo

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La separación entre vista SKU y vista Proveedor permite:
- **Flexibilidad operativa**: Usuario puede trabajar item por item o por orden completa
- **Consolidación eficiente**: Agrupa items por proveedor para negociación y seguimiento
- **Control de flujo**: Solo órdenes completas pasan a aprobación
- **Auditoría de ajustes**: Registro de cambios de cantidad con responsable y motivo

### 7.2 Patrones Utilizados
- **Doble vista (SKU/Proveedor)**: Dos perspectivas del mismo dataset
- **Sincronización automática**: Cambios en una vista se reflejan en la otra
- **Estado de gobernanza**: Transición pending → ready → approved
- **WorkDayHelper**: Abstracción para gestión de jornadas activas
- **Validación de completitud**: Orden solo avanza si cumple requisitos mínimos

### 7.3 Consideraciones de Performance
- Carga inicial filtra solo items de jornada activa
- Agrupación por proveedor se realiza client-side (pocos registros)
- Updates individuales de items (no bulk) para permitir concurrencia
- Validaciones síncronas antes de actualizar BD
- Sincronización de fechas usa throttling para evitar updates excesivos

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Por qué no aparecen items en la lista?**
R: Si no hay items, puede ser porque: 1) No hay jornada abierta, 2) Todos los productos tienen stock suficiente, o 3) No se han detectado alertas de reposición en el módulo de Stock.

**P: ¿Qué pasa si cambio el proveedor de un item que ya tenía uno asignado?**
R: El sistema reinicia el vínculo con la orden anterior y crea/asigna a una nueva orden del proveedor seleccionado. Los demás items del proveedor anterior no se ven afectados.

**P: ¿Por qué la fecha cambia en todos los items cuando modifico una?**
R: Para mantener consistencia, todos los items de un mismo proveedor comparten la misma fecha estimada de llegada. Esto simplifica la coordinación logística.

**P: ¿Puedo aprobar una orden desde este módulo?**
R: No, la aprobación final la realiza un administrador. Este módulo prepara las órdenes y las marca como "Listas para Aprobación" cuando están completas.

**P: ¿Cómo registro una rotura o merma?**
R: Usa el botón "Ajustar" en el item, selecciona el motivo (Rotura/Merma/etc.), ingresa la nueva cantidad y agrega una observación. El ajuste quedará registrado para auditoría.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Asignar proveedores, definir fechas y completar orden
- [x] Sin jornada activa: Verificar mensaje cuando no hay work_day open
- [x] Lista vacía: Verificar mensaje cuando no hay items de reposición
- [x] Cambio de proveedor: Verificar reasignación de item a nueva orden
- [x] Sincronización de fecha: Verificar propagación de fecha a todos items del proveedor
- [x] Completar orden: Verificar cambio de estado a "Ready for Approval"
- [x] Ajuste de cantidad: Verificar registro de ajuste con motivo y responsable
- [x] Permisos: Intentar acceder con rol no autorizado (debe redirigir)
- [x] Orden aprobada: Verificar bloqueo de edición en órdenes ya aprobadas

### 9.2 Datos de Prueba
- 1 jornada con `status = 'open'` en `work_days`
- Al menos 5 items en `replenishment_items` vinculados a la jornada con stock bajo
- Al menos 3 proveedores en `master_proveedores` activos
- Órdenes en diferentes estados (pending, ready_for_approval, approved) para probar bloqueos

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 detallando el flujo de reposición proactiva y consolidación de órdenes |

---

## 11. Referencias y Links

- [Operativo Stock](operativo-stock.md) - Detección de alertas de reposición
- [Operativo Análisis](operativo-analisis.md) - Análisis de consumo para planificación
- [Master Proveedores](operativo-master-proveedores.md) - Gestión de proveedores referenciados
- [Admin Órdenes](../admin/admin-ordenes.md) - Aprobación de órdenes de compra (si existe)
- [Screen Map](../../screen-map.md#operativo-solicitudes) - Ubicación en arquitectura de pantallas
