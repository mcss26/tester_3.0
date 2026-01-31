# Operativo Master Proveedores

> **Rol**: Operativo, Staff Barra, Staff Operativo
> **Ruta**: `pages/operativo/operativo-master-proveedores.html`
> **JS**: `assets/js/modules/operativo/operativo-master-proveedores.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Operativo** (`operativo`), **Staff de Barra** (`staff_barra`) o **Staff Operativo** (`staff_operativo`) que necesitan gestionar el directorio de proveedores durante las operaciones diarias.

### 1.2 ¿Qué hace?
Permite al equipo de operaciones gestionar el directorio de contactos y datos comerciales de los proveedores. A diferencia de la versión de administración, esta vista está optimizada para el uso rápido por parte del staff que necesita dar de alta un proveedor nuevo o consultar datos de contacto/pago durante la recepción o compras de urgencia. Prioriza la información de contacto rápido (nombre, teléfono, email) para la coordinación diaria.

### 1.3 ¿Cómo lo hace?
El módulo utiliza un patrón de lista-panel donde los cambios impactan directamente la tabla maestra:
1. **Lista Interactiva**: Muestra los proveedores con filas expandibles que revelan datos secundarios como CBU y CUIT sin recargar la página
2. **Panel Lateral (Slide Panel)**: Utiliza `panel.js` para ofrecer un formulario de edición/creación que no interrumpe la navegación de la lista
3. **Persistencia Directa**: Los cambios se impactan directamente en `master_proveedores` mediante el cliente de Supabase, sin flujo de aprobación

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Operativo > Proveedores

### 2.2 Flujo Principal
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: operativo, staff_barra, staff_operativo)
3. Sistema carga tabla de proveedores desde `master_proveedores`
4. Usuario puede:
   - **Expandir fila**: Click en una fila expande datos adicionales (Razón Social, CUIT, Banco, CBU)
   - **Nuevo proveedor**: Click en "+" abre panel lateral limpio
   - **Editar**: Click en "Editar" carga datos existentes en el panel lateral
5. Usuario completa/modifica campos en el panel
6. Sistema valida campos obligatorios (nombre_fantasia)
7. Al guardar, sistema actualiza `master_proveedores`
8. Sistema recarga la lista y muestra feedback con `Toast.success()`

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Nombre Fantasía (obligatorio), Razón Social, CUIT, Teléfono, Email, Datos Bancarios (Banco, CBU/Alias)
- **Acción principal**: Botón "Guardar" en panel lateral, "Nuevo Proveedor" y "Editar"
- **Feedback inmediato**: Recarga de la lista tras confirmar cambios, Toast notifications, badges de estado (Activo/Inactivo)

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `master_proveedores` | id, nombre_fantasia, razon_social, cuit, contacto_nombre, contacto_telefono, email, banco, cbu_alias, active |
| **Escritura** | `master_proveedores` | id, nombre_fantasia (requerido), razon_social, cuit, contacto_nombre, contacto_telefono, email, banco, cbu_alias, active |

### 3.2 Lógica de Negocio
El módulo implementa operaciones CRUD completas con énfasis en accesibilidad rápida:

**Gestión de Contactos**:
- Prioriza datos de contacto rápido en la vista principal
- Datos fiscales/bancarios visibles mediante expansión de filas
- Validación de campos obligatorios antes de guardar

**Limpieza de Datos**:
- Limpieza automática de CUIT (solo números, elimina guiones y espacios)
- Normalización de formato de teléfono
- Validación de formato de email

**Control de Estados**:
- Proveedores pueden marcarse como activos o inactivos
- Proveedores inactivos se mantienen en el histórico pero no aparecen en selects de otros módulos

**Casos especiales**:
- Si un proveedor está vinculado a SKUs, no puede eliminarse (solo desactivarse)
- Validación de duplicados por nombre fantasía (case insensitive)
- Campos fiscales son opcionales para permitir alta rápida durante operación

### 3.3 Endpoints/API
Operaciones Supabase:
- `master_proveedores`: SELECT, INSERT, UPDATE (ordenado por nombre_fantasia)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tabla minimalista con filas expandibles
- **Overlay**: `slide-panel` para creación/edición de proveedores
- **Feedback**: `Toast`, badges de estado (Activo/Inactivo), panel de deslizamiento suave

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de datos | `.loading-spinner` |
| **Empty** | Sin proveedores | `.empty-state` con CTA "Nuevo Proveedor" |
| **Error** | Fallo en operación | `Toast.error()` con mensaje descriptivo |
| **Success** | Proveedor guardado | `Toast.success()` + recarga de tabla + cierre de panel |
| **Expanded** | Click en fila | Muestra datos secundarios sin recargar |
| **Panel Open** | Crear/Editar | Slide panel desde derecha con formulario |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabla y formularios
- [x] Labels descriptivos en todos los campos del formulario
- [x] Contraste de colores cumple WCAG AA
- [x] Mensajes de error descriptivos en validaciones
- [x] Filas expandibles con indicadores visuales claros

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles operativos)
- `core/utils.js` (limpieza de CUIT, validaciones)
- `core/toast.js`

### 5.2 Módulos Externos
- `modules/panel.js` (manejo del panel lateral de edición)

### 5.3 Dependencias entre Módulos
- **Consume**: Ninguna dependencia directa
- **Es consumido por**:
  - `operativo-master-sku.md` (selección de proveedor default)
  - `operativo-solicitudes.md` (asignación de proveedores a órdenes)
  - `admin-master-sku.md` (selección de proveedor en admin)
- **Versión alternativa**: Existe versión admin con más campos de auditoría

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `operativo`, `staff_barra` y `staff_operativo` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura

### 6.2 Validaciones de Datos
- [x] Campos requeridos: `nombre_fantasia`
- [x] Limpieza automática de CUIT (solo números)
- [x] Validación de formato de email (si se proporciona)
- [x] Prevención de duplicados por nombre fantasía (case insensitive)
- [x] Campos fiscales/bancarios opcionales para permitir alta rápida

### 6.3 Manejo de Errores
- Errores de validación se muestran inline en el formulario del panel
- Errores de conexión/permisos se capturan y muestran con Toast.error()
- Intento de duplicación muestra mensaje específico
- Errores en guardado mantienen el panel abierto con datos para corrección

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La decisión de usar filas expandibles y panel lateral permite:
- **Velocidad operativa**: Vista principal muestra solo datos críticos (nombre, contacto)
- **Acceso completo sin navegación**: Datos fiscales accesibles con un click, sin cambiar de pantalla
- **Contexto visual**: El panel lateral mantiene visible la lista mientras se edita
- **Alta rápida**: Campos opcionales permiten crear proveedores durante urgencias

### 7.2 Patrones Utilizados
- **Patrón Lista-Panel**: Separación entre navegación (tabla) y edición (panel)
- **Filas expandibles**: Revelan información secundaria sin perder contexto
- **Limpieza automática de datos**: Normaliza CUIT y otros campos antes de guardar
- **Persistencia directa**: Sin flujo de aprobación para agilizar operación

### 7.3 Consideraciones de Performance
- Carga única de todos los proveedores (normalmente < 100 registros)
- Expansión de filas puramente client-side (sin queries adicionales)
- Panel reutilizable para crear/editar sin re-renderizar lista
- Validaciones síncronas antes de enviar a BD

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Cuál es la diferencia entre el módulo operativo y admin de proveedores?**
R: La versión operativa prioriza contactos y permite alta rápida con menos campos. La versión admin incluye más datos fiscales, auditoría y control de cambios.

**P: ¿Por qué no puedo eliminar un proveedor?**
R: Si el proveedor está vinculado a SKUs, solo puede desactivarse para mantener la integridad referencial. Usa el toggle "Activo/Inactivo" en lugar de eliminar.

**P: ¿Es obligatorio llenar todos los campos bancarios?**
R: No, los campos fiscales y bancarios son opcionales. Solo el "Nombre Fantasía" es obligatorio, permitiendo alta rápida durante operaciones urgentes.

**P: ¿Los cambios aquí afectan al módulo de admin?**
R: Sí, ambos módulos consultan y modifican la misma tabla `master_proveedores`. Los cambios son inmediatos en todas las vistas.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Crear nuevo proveedor con campos mínimos y verificar guardado
- [x] Edición: Modificar datos de contacto de proveedor existente
- [x] Expansión: Verificar que datos secundarios se muestran al expandir fila
- [x] Error de validación: Intentar guardar sin nombre fantasía
- [x] Duplicados: Intentar crear proveedor con nombre existente
- [x] Estado vacío: Acceder sin proveedores existentes
- [x] Permisos: Intentar acceder con rol no autorizado (debe redirigir)
- [x] Limpieza CUIT: Verificar que guiones y espacios se eliminan automáticamente

### 9.2 Datos de Prueba
- Al menos 3 proveedores con datos completos
- 1 proveedor con datos mínimos (solo nombre fantasía)
- 1 proveedor inactivo (para verificar filtrado)
- Proveedores con diferentes formatos de CUIT (con/sin guiones)

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 detallando el flujo de edición lateral y estructura de datos comerciales |

---

## 11. Referencias y Links

- [Admin Master Proveedores](../admin/admin-master-proveedores.md) - Versión administrativa con más campos
- [Operativo Master SKU](operativo-master-sku.md) - Gestión de productos que referencian proveedores
- [Operativo Solicitudes](operativo-solicitudes.md) - Asignación de proveedores a órdenes de compra
- [Screen Map](../../screen-map.md#operativo-master-proveedores) - Ubicación en arquitectura de pantallas
