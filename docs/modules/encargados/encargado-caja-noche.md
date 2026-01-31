# Encargado Caja Noche

> **Rol**: Encargado
> **Ruta**: `pages/encargados/encargado-caja-noche.html`
> **JS**: `assets/js/modules/encargados/encargado-caja-noche.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Encargado de Caja** (`encargado_caja`) o **Admin**.

### 1.2 ¿Qué hace?
Dashboard de supervisión nocturna para gestión de terminales de caja:
- **Monitor**: Estado en tiempo real de todas las terminales
- **Movimientos**: Historial de retiros y egresos
- **Apertura/Cierre**: Control del ciclo de vida de las terminales
- **Cierre de Noche**: Finalización de la jornada de caja

### 1.3 ¿Cómo lo hace?
1. **Realtime**: Suscripción a cambios en `cash_movements` y `closing_terminals`
2. **Grid de Cards**: Cada terminal muestra estado, acciones disponibles y totales
3. **Sistema de Modales**: Apertura, retiros, cierre de terminal, cierre global
4. **Firma Digital**: Canvas signature pad para conformidad de cierre

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Encargados > Cajas > Noche

### 2.2 Flujo Principal - Apertura
1. Click "+ Abrir"
2. Modal: Seleccionar terminal + responsable + fondo inicial
3. Click "ABRIR"
4. Terminal aparece en grid con estado "open"

### 2.3 Flujo Principal - Solicitar Retiro
1. Click "$ Retiro" o botón "Retiro" en card de terminal
2. Modal: Seleccionar terminal + monto + motivo
3. Click "Solicitar"
4. Movimiento aparece como pendiente

### 2.4 Flujo Principal - Cerrar Terminal
1. Click "Cerrar" en card de terminal
2. Modal: Ingresar efectivo + zoco/QR + notas
3. Firma en signature pad (opcional pero recomendado)
4. Click "CERRAR CAJA"
5. Terminal se marca como "submitted"

### 2.5 Flujo Principal - Cerrar Noche
1. Click "Cerrar Noche" (topbar)
2. Modal: Confirmar y agregar notas
3. Click "FINALIZAR"
4. Pantalla de noche cerrada

### 2.6 Estados de la UI

| Estado | Trigger | Componente |
|:-------|:--------|:-----------|
| **Loading** | Carga inicial | `#page-card-loading.is-visible` |
| **Empty** | Sin jornada abierta | `#page-card-empty` visible |
| **Content** | Datos cargados | `#page-card-content` visible |
| **Closed** | Noche cerrada | Body reemplazado con resumen |

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `work_days`, `cash_closings`, `pos_terminals`, `closing_terminals`, `cash_movements`, `profiles` | id, status, work_day_id, terminal_id, declared_cash, declared_zoco |
| **Escritura** | `cash_closings`, `closing_terminals`, `cash_movements` | status, signature_data, submitted_at, closed_at |

### 3.2 Lógica de Negocio
- Una jornada abierta (`work_days.status = 'open'`) es prerequisito
- Si no existe `cash_closings` para la jornada, se crea automáticamente
- Estados de terminal: `pending_open` → `open` → `submitted` → `verified`
- Firma opcional pero registrada si se proporciona
- Cálculo de totales al cerrar noche

### 3.3 Patrón de Código
- **IIFE async** para encapsulación total
- **Objeto `ui`** con todas las referencias DOM agrupadas
- **Objeto `state`** para datos reactivos
- **`setPageState()`** para gestión de estados loading/empty/content
- **Modal de confirmación** en lugar de `confirm()` nativo
- **`map().join('')`** para renderizado de grids y logs
- **Realtime subscription** para actualizaciones en vivo

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` estándar
- **Topbar**: Simple con navegación Personal/Noche + botón Cerrar Noche
- **Tabs**: `.tab-bar` con `.tab-chip` (Monitor/Movimientos)
- **FilterBar**: Stats + botones de acción
- **CardGrid**: Grid de terminal cards

### 4.2 Terminal Card
- **Header**: Nombre + status dot + warning badge
- **Body**: Acciones (Retiro/Cerrar) o Total declarado

### 4.3 Overlays/Modales
- `#modal-open-terminal`: Apertura de terminal
- `#modal-withdrawal`: Solicitud de retiro
- `#modal-close-terminal`: Cierre con arqueo y firma
- `#modal-close-night`: Cierre global de noche
- `#confirmModal`: Confirmaciones genéricas

### 4.4 Signature Pad
- Canvas HTML5 con touch support
- Botón para limpiar firma
- Placeholder "Firmar Aquí"
- Export a base64 PNG

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js`
- `core/utils.js`
- `core/toast.js`

### 5.2 Módulos
- `modules/index-navigation.js`
- `modules/encargados/encargado-caja-noche.js`

---

## 6. Historial de Cambios

| Fecha | Autor | Descripción |
|:------|:------|:------------|
| 2026-01-29 | Claude Code | Refactorización mayor: IIFE async, eliminación pseudo-Tailwind (~40 clases), modales estándar, DOM duplicado corregido, `confirm()` → modal |
| 2026-01-28 | Antigravity AI | Creación inicial |
