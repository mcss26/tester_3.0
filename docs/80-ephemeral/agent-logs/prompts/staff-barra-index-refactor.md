# Refactorizar staff-barra-index.html

> **Instrucciones de ejecucion:** Copia TODO este archivo y pegalo como prompt en el agente ejecutor. El agente debe crear 1 archivo nuevo y modificar 1 existente.

---

## Que hacer

Extraer el inline script de `pages/staff/staff-barra-index.html` a un modulo JS dedicado, siguiendo el patron de `assets/js/modules/encargados/encargado-caja-index.js`.

---

## Paso 1: Crear `assets/js/modules/staff/staff-barra-index.js` (NUEVO)

Seguir el patron exacto de `assets/js/modules/encargados/encargado-caja-index.js` (123 lineas). Copiar y adaptar:

- IIFE async con `'use strict'`
- Auth guard: `window.Auth.guardOrRedirect(['staff_barra', 'admin'])`
- Supabase assertion: `window.Utils.assertSbOrShowBlockingError()`
- DOM refs: `user-avatar`, `user-name-display`, `user-menu`, `workday-status`, `workday-text`
- Profile load desde tabla `profiles` con `session.user.id`
- Workday status con `WorkDayHelper.getPlannableWorkDay()`
- Avatar dropdown toggle (click abre/cierra, click-outside cierra)
- Logout handler con `Utils.confirmModal`
- Console prefix: `[StaffBarraIndex]`

---

## Paso 2: Modificar `pages/staff/staff-barra-index.html`

### 2A. Eliminar inline script (lineas 96-113)

Borrar desde `<script>` hasta `</script>`:

```html
<!-- ELIMINAR TODO ESTO (lineas 96-113) -->
<script>
  document.addEventListener('DOMContentLoaded', async () => {
    ...
  });
</script>
```

### 2B. Agregar defer a navigation.js (linea 93)

```html
<!-- ANTES (linea 93) -->
<script src="../../assets/js/core/navigation.js"></script>

<!-- DESPUES -->
<script defer src="../../assets/js/core/navigation.js"></script>
```

### 2C. Agregar script del modulo nuevo (antes de `</body>`)

```html
<script defer src="../../assets/js/modules/staff/staff-barra-index.js"></script>
```

---

## NO modificar

- IDs existentes (Tier T0 — prohibido renombrar)
- Estructura HTML (topbar, main-nav, footer)
- CSS linked (ya usa launcher.css)
- `data-allowed-roles="staff_barra,admin"`
- Texto "Proximamente" en el nav link

---

## Verificacion post-ejecucion

```powershell
# El archivo nuevo debe existir
Test-Path 'assets\js\modules\staff\staff-barra-index.js'

# No debe haber inline scripts en el HTML (solo tags con src=)
Select-String -Path 'pages\staff\staff-barra-index.html' -Pattern '<script>' -SimpleMatch

# navigation.js debe tener defer
Select-String -Path 'pages\staff\staff-barra-index.html' -Pattern 'navigation'
```

## Criterio de exito

- Pagina carga sin errores de consola
- Avatar muestra iniciales del usuario logueado
- Workday status muestra fecha o "Sin jornada activa"
- Dropdown de usuario funcional
- Logout funcional con confirmacion
- 0 inline scripts
