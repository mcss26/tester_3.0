# Fix: CSP Violations + Black Screen Regression

> **Instrucciones de ejecucion:** Copia TODO este archivo y pegalo como prompt en el agente ejecutor. Son 2 bugs independientes, ambos criticos.

---

## Bug 1: Pantalla Negra en TODAS las paginas (CRITICO)

### Causa raiz

`assets/js/core/auth.js` linea 183: `guardOrRedirect()` ejecuta `document.body.style.visibility = 'hidden'` al inicio. Solo restaura `visibility = 'visible'` en linea 205 **si el auth completa exitosamente**. Si Supabase no responde, hay timeout, o error de red, el body queda invisible para siempre → pantalla negra (el fondo oscuro de `--bg-body` se ve debajo).

### Fix requerido en `assets/js/core/auth.js`

Agregar un timeout de seguridad y un catch que restaure visibility. Modificar la funcion `guardOrRedirect`:

```javascript
// ANTES (linea 183):
async guardOrRedirect(allowedRoles = []) {
    document.body.style.visibility = 'hidden';

    const allowed = (allowedRoles || [])
      .map((r) => String(r).toLowerCase().trim())
      .filter(Boolean);

    const session = await this.getSession();
    // ... resto de la funcion

// DESPUES:
async guardOrRedirect(allowedRoles = []) {
    document.body.style.visibility = 'hidden';

    // Safety timeout: restore visibility after 5s to prevent permanent black screen
    const safetyTimer = setTimeout(() => {
      document.body.style.visibility = 'visible';
      console.warn('[Auth] Safety timeout: restoring body visibility after 5s');
    }, 5000);

    try {
      const allowed = (allowedRoles || [])
        .map((r) => String(r).toLowerCase().trim())
        .filter(Boolean);

      const session = await this.getSession();

      if (!session) {
        clearTimeout(safetyTimer);
        window.location.href = this.toAppPath("login");
        return null;
      }

      const profile = await this.getMyProfile();

      if (!profile) {
        clearTimeout(safetyTimer);
        console.error("Session exists but no profile found.");
        document.body.style.visibility = 'visible';
        return null;
      }

      const role = String(profile.role || "").toLowerCase().trim();

      if (allowed.length > 0 && !allowed.includes(role)) {
        clearTimeout(safetyTimer);
        const landingPath = this.roleLanding(role);
        if (window.location.pathname !== landingPath) {
          window.location.href = landingPath;
        }
        return null;
      }

      clearTimeout(safetyTimer);
      document.body.style.visibility = 'visible';
      return { user: session.user, profile: { ...profile, role } };
    } catch (err) {
      clearTimeout(safetyTimer);
      document.body.style.visibility = 'visible';
      console.error('[Auth] guardOrRedirect failed:', err);
      return null;
    }
  },
```

### Reglas para Bug 1

- **NO** renombrar la funcion `guardOrRedirect`
- **NO** cambiar el comportamiento de redireccion
- **NO** modificar `getSession`, `getMyProfile`, ni `roleLanding`
- El timeout de 5s es un safety net, NO afecta el flujo normal
- El `try/catch` previene que errores inesperados dejen la pantalla negra

---

## Bug 2: CSP Violations en admin-central-stock.html y operativo-analisis.html

### Causa raiz

La Content Security Policy en `<meta http-equiv="Content-Security-Policy">` no incluye:

1. `https://cdn.sheetjs.com` en `script-src` (SheetJS bloqueado en 2 paginas)
2. `https://cdn.jsdelivr.net` en `connect-src` (source maps bloqueados en todas)

### Fix requerido: actualizar CSP en TODAS las paginas

La CSP es identica en las 46 paginas del proyecto. Hay que actualizar el bloque CSP en TODAS.

Buscar en cada archivo HTML:

```html
<!-- ANTES -->
content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline'; connect-src 'self'
https://iyknbgmcnbpvalvsjxjz.supabase.co; img-src 'self' data:; font-src 'self';
frame-src 'none';">
```

Reemplazar con:

```html
<!-- DESPUES -->
content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net
https://cdn.sheetjs.com; style-src 'self' 'unsafe-inline'; connect-src 'self'
https://iyknbgmcnbpvalvsjxjz.supabase.co https://cdn.jsdelivr.net; img-src
'self' data:; font-src 'self'; frame-src 'none';">
```

Cambios:

- `script-src`: agregado `https://cdn.sheetjs.com`
- `connect-src`: agregado `https://cdn.jsdelivr.net` (para source maps)

### Reglas para Bug 2

- Aplicar en TODAS las paginas HTML bajo `pages/` que tengan este bloque CSP
- NO modificar nada mas en los archivos
- El reemplazo es identico en todos los archivos

---

## Verificacion post-ejecucion

```powershell
# 1. auth.js debe tener safetyTimer
Select-String -Path 'assets\js\core\auth.js' -Pattern 'safetyTimer'

# 2. Ninguna pagina debe tener la CSP vieja (sin sheetjs)
Get-ChildItem pages -Recurse -Filter *.html | Where-Object {
  (Get-Content $_.FullName -Raw) -match 'script-src.*cdn\.jsdelivr' -and
  (Get-Content $_.FullName -Raw) -notmatch 'cdn\.sheetjs'
} | Select-Object -ExpandProperty Name
# Debe dar 0 resultados
```

## Criterio de exito

- Ninguna pagina se queda en negro (el safety timeout restaura visibility)
- SheetJS carga correctamente en admin-central-stock y operativo-analisis
- 0 CSP violations en consola
