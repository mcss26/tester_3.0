# Logística: Seguimiento

> **Rol**: Logístico / Admin
> **Ruta**: `pages/logistica/logistica-seguimiento.html`
> **JS**: `assets/js/modules/logistica/logistica-seguimiento.js`
> **Estado**: Release Candidate
> **Última Actualización**: 2026-02-08

---

## 1. Información General

### 1.1 ¿Quién lo usa?

Personal del área de **Logística** y **Administradores** encargados del control de recepción de mercadería.

### 1.2 ¿Qué hace?

Permite el **monitoreo en tiempo real** de las órdenes de compra a proveedores (Replenishment Orders). Su objetivo es dar visibilidad sobre dónde está la mercadería comprada (ordenada, en tránsito, llegada) y gestionar la recepción final.

### 1.3 ¿Cómo lo hace?

Centraliza todas las órdenes de `replenishment_supplier_orders` y permite actualizar su estado mediante una línea de tiempo (timeline). Se integra con el sistema de stock al confirmar la recepción.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada

- **Navegación**: Desde el Dashboard de Logística (`logistica-index.html`) -> Tarjeta "Seguimiento".
- **Top Bar**: Enlace directo en el breadcrumb de Logística.

### 2.2 Flujo Principal

1. Usuario accede a la pantalla.
2. Visualiza tabla con órdenes filtrables por estado (Ordenado, En Tránsito, Llegado, Entregado).
3. Hace clic en una orden ("Ver →" o fila completa).
4. Se abre el **Panel Deslizante (Slide Panel)** con el detalle.
5. Usuario visualiza el histórico de estados (Timeline).
6. Usuario agrega un nuevo evento (ej: "En Tránsito") con notas opcionales.
7. Sistema guarda y actualiza el estado visible.

### 2.3 Inputs y Acciones Clave

- **Filtros de Estado**: Tabs superiores (Todos, Ordenados, En Tránsito, etc.).
- **Panel de Detalle**: Muestra ETA, costo final y proveedor.
- **Actualización de Estado**: Dropdown para seleccionar nuevo hito + campo de notas.

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
| :--- | :--- | :--- |
| **Lectura** | `replenishment_supplier_orders` | id, supplier_id, status, eta_date, final_cost |
| **Lectura** | `replenishment_tracking` | id, order_id, status, notes, created_at |
| **Lectura** | `master_proveedores` | nombre_fantasia |
| **Escritura** | `replenishment_tracking` | order_id, status, notes, created_by |
| **Escritura** | `replenishment_supplier_orders` | status (cuando se marca como 'received') |

### 3.2 Lógica de Negocio

- **Tracking History**: Se obtiene el último estado de `replenishment_tracking` para determinar el estado actual visual.
- **Ordenamiento**: Por fecha de creación descendente (lo más nuevo primero).
- **Cierre de Orden**: Si el usuario marca el estado `delivered` (Entregado), la orden madre (`replenishment_supplier_orders`) pasa a estado `received`.

---

## 4. Componentes UI

### 4.1 Estructura

- **Layout**: `admin-shell` (Dashboard de Logística).
- **Componente Principal**: `table-sticky` con filas interactivas.
- **Overlay**: `slide-panel` para detalle y acciones.
- **Feedback**: Sistema de `Toast` para confirmaciones de guardado.

### 4.2 Estados del Sistema

| Estado | UI |
| :--- | :--- |
| **Loading** | Spinner central (`page-card-loading`). |
| **Empty** | "No hay pedidos en este estado" (si el filtro no devuelve nada). |
| **Listado** | Tabla con pills de colores según estado (`status-info`, `status-warning`, `status-success`). |

### 4.3 Accesibilidad

- Botones con etiquetas claras.
- Contraste adecuado en pills de estado.
- Navegación por teclado en el panel lateral.

---

## 5. Dependencias

### 5.1 Scripts Core

- `core/auth.js` (Guard: 'logistico', 'admin')
- `core/panel.js` (Manejo del Slide Panel)
- `core/utils.js` (Formato de fechas, escape HTML)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso

- Rol requerido: `logistico` o `admin`.
- RLS en Supabase asegura que solo usuarios autorizados puedan insertar tracking.

### 6.2 Validaciones de Datos

- **Nuevo Estado**: Obligatorio seleccionar un valor del dropdown.
- **Notas**: Opcional, pero sanitizado con `escapeHtml` al renderizar.

---

## 7. Decisiones Arquitectónicas

### 7.1 Separation of Concerns

Se separó la tabla de órdenes (`replenishment_supplier_orders`) de la tabla de seguimiento (`replenishment_tracking`) para permitir un historial de auditoría completo (quién cambió el estado y cuándo) sin mutar la orden original constantemente.

### 7.2 Panel Pattern

Se utiliza el patrón de **Slide Panel** para mantener el contexto. El usuario no pierde de vista la lista de órdenes al editar una específica.

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué pasa si me equivoco de estado?**
R: Puedes agregar un nuevo evento con el estado correcto inmediatamente. El sistema toma el más reciente por fecha.

**P: ¿Las notas son visibles por el proveedor?**
R: No, son internas para el equipo de logística y administración.

---

## 9. Mejoras Futuras

- Búsqueda de órdenes por proveedor o ID.
- Filtro por rango de fechas de ETA.
- Notificaciones push al cambiar estado.
- Exportar historial de tracking a CSV.

---

## 10. Referencias

- [Módulo de Stock (Logística)](logistica-stock.md)
- [Módulo de Recepción (Logística)](logistica-recepcion.md)
