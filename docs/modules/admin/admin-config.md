# Admin: Configuración

> **Rol**: Admin / Contable
> **Ruta**: `pages/admin/admin-config.html`
> **JS**: `assets/js/modules/admin/admin-config.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-02-08

---

## 1. Información General

### 1.1 ¿Quién lo usa?

**Administradores** y perfil **Contable**.

### 1.2 ¿Qué hace?

Permite configurar los parámetros financieros del sistema:
1. **Tasas de Impuestos**: IVA, IIBB, etc.
2. **Canales de Pago**: Comisiones de tarjetas, QR, Efectivo.
3. **Categorización de SKUs**: Asignación masiva de tipos (Bar, Limpieza, etc.) para reportes de costos.

### 1.3 ¿Cómo lo hace?

Interactúa directamente con la tabla `cost_config` para impuestos/canales y `master_sku` para la categorización.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada

- **Navegación**: Desde el Dashboard de Admin (`admin-index.html`) -> Tarjeta "Configuración".

### 2.2 Flujo Principal

La pantalla se divide en 3 pestañas (Tabs):

#### A. Tab Impuestos
1. Lista tasas configuradas.
2. Usuario edita tasa (%) o activa/desactiva.
3. Guardado automático `onBlur` / `onChange`.

#### B. Tab Canales
1. Muestra matriz de costos por canal (Arancel, Anticipo, Costo Tx, Retenciones).
2. Usuario edita valores porcentuales.
3. Guardado automático.

#### C. Tab Tipos SKU
1. Lista todos los SKUs activos.
2. Usuario filtra por tipo (Bar, Limpieza, Descartables, Otros).
3. Usuario selecciona múltiples SKUs y aplica "Bulk Update" (ej: Marcar todos como "Bar").

### 2.3 Inputs y Acciones Clave

- **Inputs Numéricos**: Validación de decimales. Flash verde al guardar.
- **Selects**: Dropdowns para tipo de SKU.
- **Checkbox**: Selección masiva en tabla de SKUs.

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
| :--- | :--- | :--- |
| **Lectura/Escritura** | `cost_config` | id, category ('tax'/'channel'), name, rate, active, applies_to |
| **Lectura/Escritura** | `master_sku` | id, nombre, tipo, costo, active |

### 3.2 Lógica de Negocio

- **Conversión de Tasas**: Los inputs muestran porcentaje (21.00) pero guardan decimal (0.21) en DB.
- **Normalización**: Channels se agrupan por `channel_name` (ej: "Visa Crédito") teniendo múltiples filas en `cost_config` para cada *fee_type* (arancel, anticipo, etc.).

---

## 4. Componentes UI

### 4.1 Estructura

- **Layout**: `admin-shell`.
- **Navegación**: `tab-bar` con `tab-chip` para swicheo rápido sin recarga.
- **Tablas**: `table-compact` para alta densidad de información.

### 4.2 Estados del Sistema

| Estado | UI |
| :--- | :--- |
| **Loading** | Overlay de carga inicial. |
| **Guardando** | Input border se pone verde (`is-success`) temporalmente. |
| **Error** | Toast notify. |

---

## 5. Dependencias

### 5.1 Scripts Core

- `core/auth.js` (Guard: 'admin', 'contable')
- `core/supabase-client.js`
- `core/toast.js`

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso

- Estricto: Solo roles con permisos financieros (`admin`, `contable`).

### 6.2 Validaciones de Datos

- **Tipos de datos**: Supabase valida constraints numéricos.
- **Integridad**: No se pueden eliminar impuestos/canales desde UI (solo desactivar) para no romper histórico.

---

## 7. Decisiones Arquitectónicas

### 7.1 Auto-Save

Se optó por **guardado automático** por celda en lugar de un botón "Guardar Todo" gigante, para agilizar la edición de múltiples parámetros pequeños sin riesgo de perder sesión.

### 7.2 Bulk Actions SKU

La categorización de SKUs suele ser una tarea tediosa inicial o de mantenimiento. Se implementó selección múltiple para permitir categorizar "lotes" de productos rápidamente.

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Dónde agrego un nuevo impuesto?**
R: Actualmente solo se editan los existentes. Nuevos conceptos requieren inserción en DB por soporte técnico.

**P: ¿El cambio de tasa afecta ventas pasadas?**
R: No, las ventas guardan el snapshot de costos al momento de la transacción. Solo afecta a futuro y a reportes dinámicos.
