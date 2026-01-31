# Encargado Caja Index

> **Rol**: Encargado
> **Ruta**: `pages/encargados/encargado-caja-index.html`
> **JS**: `assets/js/modules/encargados/encargado-caja-index.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Encargado de Caja** (`encargado_caja`) o **Admin**.

### 1.2 ¿Qué hace?
Portal central para el responsable de tesorería y cajas. Muestra un resumen del estado operativo y proporciona acceso rápido a las sub-secciones de gestión de personal y monitoreo nocturno.

### 1.3 ¿Cómo lo hace?
1. **Autenticación**: Verifica rol con `Auth.guardOrRedirect()`
2. **Personalización**: Carga nombre del usuario desde `profiles`
3. **Estado Operativo**: Consulta `work_days` para mostrar si hay jornada abierta
4. **Navegación**: Provee accesos directos a Personal y Noche

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Encargados > Cajas

### 2.2 Flujo Principal
1. Usuario accede a la pantalla
2. Sistema verifica autenticación (roles: encargado_caja, admin)
3. Sistema muestra estado de carga
4. Sistema carga nombre de usuario y estado de jornada en paralelo
5. Usuario visualiza estado operativo (🟢 Operativa / 🔴 Cerrada)
6. Usuario navega a Personal o Noche según necesidad

### 2.3 Estados de la UI

| Estado | Trigger | Componente |
|:-------|:--------|:-----------|
| **Loading** | Carga inicial | `#page-card-loading.is-visible` |
| **Content** | Datos cargados | `#module-content` visible |
| **Error** | Fallo de conexión | Status pill con ⚠️ |

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `profiles`, `work_days` | full_name, status, work_date |

### 3.2 Lógica de Negocio
- Consulta `work_days` con `status = 'open'` para determinar operatividad
- No realiza escrituras, es solo lectura
- Maneja errores de conexión con feedback visual

### 3.3 Patrón de Código
- **IIFE async** para encapsulación
- **Objeto `ui`** para referencias DOM agrupadas
- **`setPageState()`** para gestión de estados loading/empty/content
- **`Promise.all()`** para carga paralela de datos

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `welcome-screen encargado-landing`
- **Componente principal**: Welcome section con nombre y estado
- **Feedback**: Status pill (success/error/warning)

### 4.2 Navegación
- **Personal**: `encargado-caja-personal.html` - Gestión de staff
- **Noche**: `encargado-caja-noche.html` - Monitor de terminales

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js`
- `core/utils.js`
- `core/toast.js`

### 5.2 Módulos
- `modules/work-day-helper.js`
- `modules/index-navigation.js`
- `modules/encargados/encargado-caja-index.js`

---

## 6. Historial de Cambios

| Fecha | Autor | Descripción |
|:------|:------|:------------|
| 2026-01-29 | Claude Code | Refactorización: JS dedicado, estados de carga, eliminación script inline |
| 2026-01-28 | Antigravity AI | Creación inicial |
