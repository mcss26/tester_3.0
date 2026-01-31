# Admin Stock Ajustes (Ajustes Manuales de Inventario)

> **Rol**: Admin, Contable
> **Ruta**: `pages/admin/admin-stock-ajustes.html`
> **JS**: `assets/js/modules/admin/admin-stock-ajustes.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin** o **Contable** que necesitan realizar correcciones en el inventario.

### 1.2 ¿Qué hace?
Permite realizar correcciones manuales negativas en el inventario (salidas que no provienen de una recepción o venta normal). Se utiliza principalmente para registrar mermas (botellas rotas), consumos internos (degustaciones, cortesía de la casa) o correcciones de auditoría cuando el stock físico no coincide con el sistema. Es un mecanismo de control para ajustar discrepancias y mantener la integridad del inventario.

### 1.3 ¿Cómo lo hace?
El administrador sigue un proceso lineal guiado:

1. **Selección de Producto**: Elige un SKU del listado completo, el cual muestra el stock actual y la unidad de medida en tiempo real.
2. **Definición de Salida**: Selecciona el tipo de movimiento (Consumo/Merma o Corrección de Auditoría) mediante tabs y define la cantidad a descontar.
3. **Justificación**: Ingresa una nota obligatoria para el registro de auditoría que explica el motivo del ajuste.
4. **Ejecución**: El sistema resta la cantidad del stock maestro y crea un registro histórico de movimiento con timestamp y usuario.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Admin > Stock > Ajustes

### 2.2 Flujo Principal
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable)
3. Usuario visualiza formulario de ajuste con tres secciones:
   - Buscador de SKU (con autocomplete o dropdown)
   - Tipo de ajuste (tabs: Consumo/Merma vs. Corrección Audit)
   - Cantidad y motivo
4. Usuario selecciona un SKU del listado
5. Sistema muestra el stock actual del producto seleccionado
6. Usuario selecciona el tipo de ajuste clickeando en tab correspondiente
7. Usuario ingresa:
   - Cantidad a descontar (número positivo, que se restará del stock)
   - Motivo (text area obligatorio)
8. Sistema valida que:
   - SKU esté seleccionado
   - Cantidad sea > 0
   - Motivo no esté vacío
9. Usuario clickea "Confirmar Ajuste"
10. Sistema ejecuta transacción doble:
    - Crea registro en `inventory_movements` con signo negativo
    - Actualiza `inventory_stock` restando la cantidad
11. Sistema muestra feedback con Toast.success()
12. Formulario se resetea para permitir nuevo ajuste

### 2.3 Inputs y Acciones Clave
- **Campos principales**:
  - Buscador de SKU (select/autocomplete)
  - Tipo de Ajuste (Tabs: consumption/merma vs. adjustment/audit)
  - Cantidad (Number, positivo)
  - Motivo (Text area, obligatorio)
- **Acción principal**: "Confirmar Ajuste" - Realiza la transacción doble (Log + Update)
- **Feedback inmediato**: Toast notifications, actualización de KPIs de stock, reset del formulario

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `vw_stock_global`, `inventory_skus`, `master_sku` | sku_id, name, current_qty, unit |
| **Escritura** | `inventory_movements` (Insert), `inventory_stock` (Update) | sku_id, movement_type, quantity (negativo), reason, created_by, created_at |

### 3.2 Lógica de Negocio
El módulo implementa un flujo de ajuste con las siguientes características:

**Tipos de Ajuste**:
- **Consumo/Merma** (`consumption`): Salidas por roturas, degustaciones, uso interno
- **Corrección de Auditoría** (`adjustment`): Correcciones tras conteo físico que detectó discrepancias

**Integridad de Movimientos**:
- Cada ajuste genera una fila en `inventory_movements` con cantidad negativa
- El movimiento se vincula al usuario que lo realizó (`created_by`)
- Timestamp automático para auditoría (`created_at`)
- Motivo obligatorio para trazabilidad

**Actualización de Stock**:
- Resta directa en `inventory_stock.quantity`
- Puede hacerse vía trigger en BD o update directo en JS
- Validación de que la cantidad a restar no exceda el stock actual (opcional según configuración)

**Prevención de Errores**:
- El módulo está diseñado explícitamente para **salidas negativas**
- Para ingresos (compras), se debe utilizar el flujo de Solicitudes/Recepción
- No permite ajustes que dejen stock negativo (según configuración de negocio)

**Casos especiales**:
- Ajustes de auditoría pueden ser grandes diferencias (100+ unidades)
- Consumos internos suelen ser pequeños (1-5 unidades)
- Si el stock después del ajuste queda en 0, el sistema lo permite (útil para discontinuar productos)

### 3.3 Endpoints/API
Operaciones Supabase:
- `vw_stock_global` / `inventory_skus`: SELECT (para listar productos y stock actual)
- `inventory_movements`: INSERT (crear registro de ajuste)
- `inventory_stock`: UPDATE (actualizar cantidad, puede ser via trigger automático)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Formulario simplificado con pasos secuenciales
- **Selector de producto**: Dropdown o autocomplete con búsqueda
- **Tabs de tipo**: Selector visual entre Consumo y Auditoría
- **Feedback**: Toast notifications, indicadores de stock actual

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de SKUs | `.loading-spinner` |
| **Empty** | Sin SKU seleccionado | Formulario deshabilitado excepto selector |
| **Ready** | SKU seleccionado | Muestra stock actual, habilita campos |
| **Validating** | Click en confirmar | Validación de campos requeridos |
| **Processing** | Ejecutando ajuste | Spinner en botón, formulario deshabilitado |
| **Success** | Ajuste completado | `Toast.success()` + reset de formulario |
| **Error** | Fallo en operación | `Toast.error()` con detalle del problema |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional
- [x] Labels descriptivos en todos los campos
- [x] Contraste de colores cumple WCAG AA
- [x] Mensajes de error específicos por campo
- [x] Feedback visual del stock actual

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles admin/contable)
- `core/utils.js`
- `core/toast.js`

### 5.2 Módulos Externos
- Ninguno (módulo standalone)

### 5.3 Dependencias entre Módulos
- **Consume**:
  - Vista de stock (`vw_stock_global` o `inventory_skus`) para selección de productos
  - Master SKU para información de productos
- **Es consumido por**:
  - Reportes de movimientos de inventario (análisis de mermas y correcciones)
  - Dashboard de control (alertas de ajustes frecuentes)
- **Relacionado con**:
  - Admin Stock (visualización del stock actualizado tras ajuste)
  - Reportes de auditoría (seguimiento de correcciones)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin` y `contable` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura en inventory_movements e inventory_stock

### 6.2 Validaciones de Datos
- [x] Campo requerido: SKU seleccionado
- [x] Campo requerido: Cantidad > 0
- [x] Campo requerido: Motivo no vacío
- [x] Tipo de ajuste: debe ser consumption o adjustment
- [ ] Validación opcional: No permitir stock negativo (según configuración)
- [ ] Validación opcional: Límite de cantidad por ajuste (ej: máximo 100 unidades)

### 6.3 Manejo de Errores
- Errores de validación se muestran inline antes de enviar
- Errores de Supabase (permisos, conexión) se capturan y muestran con Toast.error()
- Si la actualización de stock falla, el movimiento no se registra (transaccionalidad)
- Registro de todos los ajustes para auditoría posterior

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La separación de tipos de ajuste (Consumo vs. Auditoría) permite:
- **Análisis diferenciado**: Reportes separados de mermas vs. errores de conteo
- **Control de gestión**: Identificar si hay problemas operativos (muchos consumos) o de registro (muchas correcciones)
- **Claridad**: El usuario entiende el propósito del ajuste al seleccionar el tipo

El flujo lineal paso a paso ofrece:
- **Prevención de errores**: No se puede ajustar sin seleccionar producto primero
- **Contexto**: Muestra stock actual antes de permitir el ajuste
- **Auditoría**: Obliga a justificar cada movimiento

La separación entre movimientos y stock:
- **Historial completo**: Nunca se pierde información, todos los ajustes quedan registrados
- **Trazabilidad**: Se puede auditar quién hizo qué ajuste y cuándo
- **Reversibilidad conceptual**: Aunque no se revierten, se pueden compensar con nuevo movimiento

### 7.2 Patrones Utilizados
- **Dual Write**: Escribe en inventory_movements (log) e inventory_stock (balance) simultáneamente
- **Audit Trail**: Registro completo con usuario, fecha, motivo
- **Wizard Pattern**: Flujo guiado paso a paso (seleccionar → configurar → ejecutar)
- **Positive Input, Negative Application**: Usuario ingresa número positivo, sistema aplica como negativo

### 7.3 Consideraciones de Performance
- Carga de SKUs puede ser on-demand con autocomplete (evita cargar 500+ productos)
- Escritura dual puede ser atómica via trigger de BD (mejor que dos queries desde cliente)
- Sin paginación de histórico (el histórico se consulta desde otro módulo de reportes)

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Cuál es la diferencia entre Consumo/Merma y Corrección de Auditoría?**
R: Consumo/Merma es para salidas reales (botellas rotas, degustaciones). Corrección de Auditoría es para ajustar errores cuando el conteo físico no coincide con el sistema.

**P: ¿Puedo usar este módulo para agregar stock?**
R: No, este módulo es solo para restar stock. Para agregar stock, usa el flujo de Recepción de Mercadería (cuando llegan compras).

**P: ¿Puedo deshacer un ajuste?**
R: No directamente. Los ajustes quedan registrados permanentemente. Si te equivocaste, debes hacer un ajuste compensatorio (ej: si restaste 10 de más, tendrás que registrar una recepción manual).

**P: ¿El motivo es obligatorio?**
R: Sí, es obligatorio para mantener trazabilidad. Es importante explicar por qué se está ajustando el stock.

**P: ¿Qué pasa si intento descontar más de lo que hay en stock?**
R: Depende de la configuración. Algunos sistemas lo permiten (stock negativo), otros bloquean la operación. Consulta con tu administrador.

**P: ¿Quién puede ver el histórico de ajustes?**
R: Admin y Contable pueden ver el histórico completo en el módulo de Reportes de Movimientos de Inventario.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Ajuste de consumo con todos los campos válidos
- [x] Ajuste de auditoría: Corrección de stock con cantidad grande
- [x] Validación: Intentar ajustar sin seleccionar SKU (debe bloq uear)
- [x] Validación: Intentar ajustar sin motivo (debe mostrar error)
- [x] Validación: Intentar ajustar con cantidad 0 o negativa (debe rechazar)
- [x] Stock en cero: Ajustar producto hasta dejarlo en 0
- [x] Permisos: Intentar acceder con rol no autorizado
- [x] Reset de formulario: Verificar que se limpia tras ajuste exitoso
- [x] Feedback: Verificar que stock se actualiza en Admin Stock tras ajuste

### 9.2 Datos de Prueba
- Seleccionar productos con stock variado (algunos con mucho, otros con poco)
- Probar ajuste de consumo pequeño (1-2 unidades)
- Probar ajuste de auditoría grande (50+ unidades)
- Probar con producto con stock = 1 (dejarlo en 0)
- Verificar motivos descriptivos: "Botella rota en barra", "Degustación evento X", "Corrección tras inventario mensual"

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 detallando el flujo de mermas y ajustes de auditoría |

---

## 11. Referencias y Links

- [Admin Stock](admin-stock.md) - Visualización de stock actualizado
- [Screen Map](../../screen-map.md#admin-stock-ajustes) - Ubicación en arquitectura de pantallas
