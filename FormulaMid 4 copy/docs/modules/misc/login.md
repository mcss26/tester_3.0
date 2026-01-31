# Login

> **Rol**: Todos
> **Ruta**: `login.html`
> **JS**: `assets/js/modules/login.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Todos los usuarios del sistema que necesitan autenticarse.

### 1.2 ¿Qué hace?
Punto de entrada al sistema. Permite iniciar sesión y redirige al dashboard correspondiente según el rol del usuario.

### 1.3 ¿Cómo lo hace?
1. Valida campos email y contraseña
2. Autentica con Supabase Auth
3. Obtiene perfil y rol del usuario
4. Redirige a landing page según rol

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
URL directa `/login.html` o redirección automática desde páginas protegidas.

### 2.2 Flujo Principal
1. Usuario ingresa email y contraseña
2. Sistema valida campos no vacíos
3. Sistema llama a `window.sb.auth.signInWithPassword`
4. Si exitoso, obtiene perfil con `window.Auth.getMyProfile()`
5. Calcula destino con `window.Auth.roleLanding(role)`
6. Redirige al dashboard correspondiente

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Email (`#email`), Contraseña (`#password`)
- **Acción principal**: Botón "Ingresar" (submit de `#login-form`)
- **Feedback inmediato**: Botón deshabilitado, texto "Ingresando...", error en rojo

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `profiles` | id, role, auth_user_id |

### 3.2 Lógica de Negocio
- Tokens JWT guardados en LocalStorage
- Traduce mensajes de error de Supabase a español ("Invalid login credentials")

### 3.3 Rol Landings

| Rol | Destino |
|:----|:--------|
| admin | `/pages/admin/admin-index.html` |
| gerencia | `/pages/gerencia/gerencia-index.html` |
| encargado_* | `/pages/encargados/` |
| operativo | `/pages/operativo/operativo-index.html` |
| staff | `/pages/staff/staff-index.html` |

---

## 4. Notas

- Botón "¿Eres Staff?" muestra solo `alert` con instrucciones (mejora pendiente)
- Manejo de errores traduce mensajes comunes de Supabase

---

## 5. Historial de Cambios

| Fecha | Autor | Descripción |
|:------|:------|:------------|
| 2026-01-29 | Claude | Migración desde qa/ a modules/ |
| 2026-01-25 | Antigravity | Creación inicial |
