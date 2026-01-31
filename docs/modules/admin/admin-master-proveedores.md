# Admin Master Proveedores

> **Rol**: Admin, Contable
> **Ruta**: `pages/admin/admin-master-proveedores.html`
> **JS**: `assets/js/modules/admin/admin-master-proveedores.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Admin** o **Contable** que gestionan la base de datos maestra de proveedores de la organización.

### 1.2 ¿Qué hace?
Centraliza y gestiona la información completa de proveedores, incluyendo datos fiscales (CUIT, Razón Social), de contacto (Email, Teléfono) y bancarios (CBU/Alias). Funciona como fuente única de verdad para todos los procesos de compras, pagos y facturación del sistema.

### 1.3 ¿Cómo lo hace?
Presenta una lista tabular expandible donde cada fila puede desplegarse para mostrar detalles adicionales de contacto. La creación y edición se realiza mediante un panel lateral deslizable (slide-panel) que permite capturar todos los campos requeridos y opcionales. La persistencia es directa contra la tabla `master_proveedores` de Supabase, con validaciones de campos obligatorios y normalización automática de datos (limpieza de CUIT).

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
Dashboard Admin > Master Proveedores (o vía navegación superior en el ERP)

### 2.2 Flujo Principal
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: admin, contable)
3. Sistema carga lista de proveedores desde `master_proveedores` ordenados alfabéticamente
4. Usuario puede expandir filas para ver detalles de contacto
5. Usuario clickea en "+" (Crear) o "Editar" en una fila
6. Se abre `slide-panel` lateral con formulario
7. Usuario completa campos (Nombre Fantasía es obligatorio)
8. Sistema normaliza CUIT eliminando caracteres no numéricos
9. Al guardar, sistema valida campos y actualiza `master_proveedores`
10. Panel se cierra automáticamente y tabla se recarga
11. Sistema muestra feedback con Toast

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Nombre Fantasía (requerido), Razón Social, CUIT, Categoría, Email, Teléfono, Banco, CBU/Alias
- **Acción principal**: Botón "Guardar" o "Actualizar" en footer del panel
- **Feedback inmediato**: Cierre automático del panel, recarga instantánea de tabla, badges de estado (Activo/Inactivo)

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `master_proveedores` | id, nombre_fantasia, razon_social, cuit, categoria, email, telefono, banco, cbu_alias, active |
| **Escritura** | `master_proveedores` (Insert/Update) | Todos los campos listados arriba. Los opcionales se guardan como `null` si están vacíos |

### 3.2 Lógica de Negocio
El módulo implementa un CRUD completo con las siguientes características:

**Normalización de Datos**:
- CUIT: se eliminan guiones, espacios y caracteres no numéricos antes de guardar
- Campos opcionales: se guardan como `null` en lugar de strings vacíos

**Validaciones**:
- Nombre Fantasía es obligatorio (validación client-side)
- Prevención de envío con campos requeridos vacíos

**Casos especiales**:
- Si el proveedor tiene órdenes de compra asociadas, debe mantenerse activo en el sistema
- Los campos opcionales permiten captura incremental de información

### 3.3 Endpoints/API
Operaciones Supabase:
- `master_proveedores`: SELECT (ordenado por nombre_fantasia), INSERT, UPDATE

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tabla expandible con filas clickeables
- **Overlay**: `slide-panel` para creación/edición
- **Feedback**: `Toast`, badges de estado

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de datos | `.loading-spinner` |
| **Empty** | Sin proveedores | `.empty-state` con CTA "Crear Proveedor" |
| **Error** | Fallo en operación | `Toast.error()` con mensaje descriptivo |
| **Success** | Proveedor guardado | `Toast.success()` + actualización de tabla |
| **Expanded** | Click en fila | Muestra detalles de contacto adicionales |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabla y formularios
- [x] Labels descriptivos en todos los campos
- [x] Contraste de colores cumple WCAG AA
- [x] Mensajes de error descriptivos en validaciones

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles admin/contable)
- `core/utils.js` (formatos, validaciones)
- `core/toast.js`

### 5.2 Módulos Externos
- `modules/panel.js` (slide-panel para edición)
- `admin-navigation.js` (navegación común del área admin)

### 5.3 Dependencias entre Módulos
- **Es consumido por**:
  - Master SKU (asignación de proveedor default a productos)
  - Solicitudes de Compra (selección de proveedor en órdenes)
  - Módulo de Pagos (datos bancarios para transferencias)
  - Recepción de Mercadería (validación de entregas)
- **Consume**: Ninguno (es una tabla maestra independiente)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `admin` y `contable` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura

### 6.2 Validaciones de Datos
- [x] Campos requeridos: `nombre_fantasia`
- [x] Normalización: CUIT (eliminación de caracteres no numéricos)
- [x] Formato: Email (validación HTML5)
- [x] Prevención de duplicados por nombre (recomendado implementar)

### 6.3 Manejo de Errores
- Errores de validación se muestran inline en el formulario
- Errores de conexión/permisos se capturan y muestran con Toast.error()
- Errores de Supabase se registran en console y se muestran al usuario de forma amigable

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
El uso de tabla expandible en lugar de navegación a página de detalle permite:
- **Escaneo rápido**: El usuario puede ver todos los proveedores de un vistazo
- **Consulta eficiente**: Los detalles de contacto se revelan on-demand sin cambiar de contexto
- **Edición ágil**: El slide-panel mantiene la lista visible mientras se edita

### 7.2 Patrones Utilizados
- **Master-Detail con SlidePanel**: Mantiene al usuario en el contexto de la lista principal, reduciendo carga cognitiva
- **Normalización de datos**: Limpieza automática de CUIT para consistencia en búsquedas y reportes
- **Campos opcionales como null**: Evita valores por defecto arbitrarios y permite diferenciar "no capturado" de "vacío"

### 7.3 Consideraciones de Performance
- Ordenamiento alfabético en base de datos (`.order('nombre_fantasia')`)
- Sin paginación (asumiendo cantidad moderada de proveedores)
- Expansión de detalles sin queries adicionales (todos los datos se cargan inicialmente)

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué diferencia hay entre Nombre Fantasía y Razón Social?**
R: Nombre Fantasía es el nombre comercial del proveedor (ej: "La Cervecería"). Razón Social es el nombre legal/fiscal (ej: "Cervecería del Sur S.A."). Solo Nombre Fantasía es obligatorio.

**P: ¿Puedo eliminar un proveedor?**
R: No se eliminan proveedores para mantener integridad referencial. Se desactivan usando el campo `active`, lo que los oculta de los selectores pero mantiene el histórico de transacciones.

**P: ¿Para qué sirve el campo Categoría?**
R: Permite agrupar proveedores (ej: "Bebidas", "Descartables", "Servicios") para reportes y filtros en otros módulos.

**P: ¿Es obligatorio cargar los datos bancarios?**
R: No son obligatorios al crear el proveedor, pero son necesarios para poder procesarle pagos en el módulo de Finanzas.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Crear nuevo proveedor con todos los campos completos
- [x] Validación: Intentar guardar sin Nombre Fantasía (debe mostrar error)
- [x] Estado vacío: Acceder sin proveedores existentes (debe mostrar empty state)
- [x] Permisos: Intentar acceder con rol staff (debe redirigir)
- [x] Edición: Modificar datos de proveedor existente y verificar actualización
- [x] Normalización: Ingresar CUIT con guiones y verificar que se guarda limpio
- [x] Expansión: Click en fila debe mostrar detalles de contacto

### 9.2 Datos de Prueba
- Crear 3-5 proveedores de diferentes categorías
- Incluir al menos uno con datos bancarios completos
- Incluir uno con solo Nombre Fantasía (campos mínimos)
- Probar CUIT con diferentes formatos: "20-12345678-9", "20123456789"

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Migración a formato Q&A V2 y actualización de campos (incluyendo Categoría) |

---

## 11. Referencias y Links

- [Master SKU](admin-master-sku.md) - Vincula proveedores a productos
- [Admin Pagos](admin-pagos.md) - Utiliza datos bancarios de proveedores
- [Admin Solicitudes](admin-solicitudes.md) - Aprobación de órdenes de compra por proveedor
- [Screen Map](../../screen-map.md#admin-master-proveedores) - Ubicación en arquitectura de pantallas
