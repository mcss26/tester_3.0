# Cierre de Caja Admin

> **Ruta**: `pages/admin/admin-cierre.html`  
> **Roles**: Admin, Contable  
> **Última Actualización**: 2026-01-29

---

## Objetivo Operativo

Este módulo permite a los administradores y contadores **conciliar la caja diaria** comparando los valores declarados por los encargados de terminal contra los valores registrados en el sistema (G-Bol). Además, gestiona la importación de datos desde fuentes externas (CSV) y permite cerrar formalmente la noche.

**Resultado esperado**: Una noche con status `closed`, diferencias documentadas y notas de cierre registradas.

---

## Flujo Principal (Workflows)

### 1. Carga de Datos
1. Usuario selecciona fecha en el input `#input-date`.
2. Hace click en "CARGAR".
3. Sistema consulta `work_days` para obtener el ID de la jornada.
4. Sistema consulta `cash_closings` para obtener el estado del cierre.
5. Sistema carga `pos_terminals` y `closing_terminals` para renderizar la tabla.
6. Sistema muestra totales y diferencias calculadas.

### 2. Importación de Datos (CSV)
1. Usuario hace click en uno de los botones de importación (TESO, GBOL, PASS, AFIP).
2. Sistema abre selector de archivo.
3. Usuario selecciona CSV correspondiente.
4. Sistema procesa archivo usando el Importer correspondiente.
5. Sistema muestra Toast con resultado y refresca datos.

### 3. Conciliación QR
1. Sistema carga automáticamente stats de `qr_codes` filtrados por `work_day_id`.
2. Usuario puede ingresar valores declarados en inputs de Passline y Boletería.
3. Sistema calcula diferencias en tiempo real.

### 4. Cierre de Noche
1. Usuario hace click en "CERRAR NOCHE".
2. Sistema abre Modal de confirmación mostrando diferencia total.
3. Usuario confirma.
4. Sistema actualiza `cash_closings.status` a `'closed'`.
5. Sistema muestra Toast de éxito y recarga la página.

### 5. Guardar Notas
1. Usuario escribe observaciones en textarea.
2. Hace click en "Guardar Notas".
3. Sistema actualiza `cash_closings.notes`.
4. Sistema muestra Toast de confirmación.

---

## Modelo de Datos

| Operación | Tablas/Vistas |
|:----------|:--------------|
| **Lectura** | `work_days`, `cash_closings`, `pos_terminals`, `closing_terminals`, `qr_codes`, `qr_batches` |
| **Escritura** | `cash_closings` (notes, status, closed_at, closed_by) |
| **Importación** | Staging tables via Importers |

---

## Dependencias Técnicas

### Scripts Core
- `core/config.js` - Configuración de entorno
- `core/supabase-client.js` - Cliente Supabase (`window.sb`)
- `core/auth.js` - Autenticación y guardias (`Auth.guardOrRedirect`)
- `core/utils.js` - Utilidades (`formatARS`, `assertSbOrShowBlockingError`)
- `core/toast.js` - Notificaciones (`window.Toast`)

### Importers (módulos de ingesta)
- `importer-utils.js` - Utilidades de parsing CSV
- `importer-extracciones.js` - Movimientos de tesorería
- `importer-gbol.js` - Ventas G-Bol
- `importer-passline.js` - Registros de acceso QR
- `importer-afip.js` - Datos fiscales

### APIs
- Supabase Database (PostgreSQL)
- Supabase Auth

---

## Componentes UI

| Componente | Uso |
|:-----------|:----|
| `app-topbar` | Navegación superior con status pill |
| `filter-bar` | Toolbar con fecha, imports y acción principal |
| `table-shell` | Contenedor de tabla principal con scroll |
| `staff-dashboard` | Cards para QR reconciliation y notas |
| `modal-overlay` + `modal-card` | Modales de confirmación e información |

---

## Estados del Módulo

| Estado | Descripción |
|:-------|:------------|
| `NO INICIADO` | No hay `cash_closing` para la jornada |
| `OPEN` | Cierre en progreso, editable |
| `CLOSED` | Noche cerrada, read-only |

---

## Validaciones de Negocio

- ✅ Auth guard: Solo roles `admin` o `contable` pueden acceder
- ✅ Supabase check: Verifica conexión antes de operar
- ✅ WorkDay required: No se pueden importar datos sin jornada activa
- ✅ Confirmation modal: El cierre requiere confirmación explícita

---

## Changelog

| Fecha | Cambio |
|:------|:-------|
| 2026-01-29 | Refactor UI/UX: eliminadas clases Tailwind, implementados Modals estándar |
| 2026-01-29 | Documentación inicial generada |
