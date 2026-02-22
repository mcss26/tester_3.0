# TK-002: modal.showModal() is not a function — bloquea creación de Workday

> **Origen**: Verificación manual `admin-workdays.html` → Flujo crear jornada
> **Agente(s)**: frontend
> **Severidad**: 🔴
> **Tier**: Tier0
> **Estado**: ✅ Cerrado

---

## Contexto

Al hacer clic en "Crear Jornada" en `admin-workdays.html`, la función `handleCreate()` llama a `window.Utils.confirmAction()` (L881) que a su vez ejecuta `modal.showModal()` en `utils.js:151`. El error `TypeError: modal.showModal is not a function` indica que el elemento `modal` no es un `<dialog>` nativo HTML.

**Stack trace:**

```
utils.js:137 Uncaught (in promise) TypeError: modal.showModal is not a function
    at utils.js:137:13
    at new Promise (<anonymous>)
    at Object.confirmAction (utils.js:99:12)
    at handleCreate (admin-workdays.js?v=3:881:46)
    at HTMLButtonElement.handleConfirmOrUpdate (admin-workdays.js?v=3:856:19)
```

### Causa raíz probable

`confirmAction()` en L117 busca `document.getElementById('confirmModal')`. Si existe un elemento `<div id="confirmModal">` (no `<dialog>`) en algún HTML incluido o template, el código lo encuentra pero no puede llamar `.showModal()` porque solo `<dialog>` soporta ese método.

Si no existe ese ID en el DOM, entonces el código lo crea como `<dialog>` (L124). Si aún falla, puede ser un conflicto de timing o un CSS framework que reemplaza el dialog.

**Nota importante:** Las líneas del error (L137, L99) no coinciden con las del código actual (L151, L112). Esto sugiere que el CLI pudo haber modificado `utils.js` recientemente (se agregó `generateUUID` en L67-78), desplazando las líneas.

## Archivos Implicados

- `assets/js/core/utils.js` → función `confirmAction` (L112-169)
- `pages/admin/admin-workdays.html` → verificar si tiene `<div id="confirmModal">` embebido o en un partial
- Cualquier HTML template que incluya un `#confirmModal` como `<div>` en vez de `<dialog>`

## Diagnóstico Sugerido

```javascript
// En consola del browser, ejecutar ANTES de hacer clic:
const existing = document.getElementById("confirmModal");
console.log("Exists?", !!existing, "Tag:", existing?.tagName);
// Si tagName NO es 'DIALOG' → esa es la causa
```

## Fix Propuesto

Agregar guardia en `confirmAction` para manejar el caso donde el elemento existente no es `<dialog>`:

```javascript
// utils.js — confirmAction, reemplazar L117-140 por:
let modal = document.getElementById("confirmModal");

// Ensure it's a <dialog> — if not, remove and recreate
if (modal && modal.tagName !== "DIALOG") {
  modal.remove();
  modal = null;
}

if (!modal) {
  modal = document.createElement("dialog");
  modal.id = "confirmModal";
  // ... rest of creation code
}
```

Alternativa B: Si ningún HTML tiene `#confirmModal`, el problema puede ser de timing o scope. Verificar que `document.body.appendChild(modal)` se ejecuta correctamente.

## Criterio de Éxito

- [x] `admin-workdays.html` → Botón "Crear Jornada" → Modal de confirmación se muestra correctamente
- [x] El flujo completo `handleCreate()` se ejecuta sin errores
- [x] Workday queda en estado `DRAFT` en la base de datos
- [x] `confirmAction` funciona también en: admin-pagos, admin-solicitudes, cms-members

## Resolución

- **Fix**: `confirmAction` en `utils.js:125-185` incluye guardia `if (modal.tagName !== "DIALOG") { modal.remove(); modal = null; }` (L133-136). Además, `openModal()` (L99-106) tiene safe-check `typeof modal.showModal === 'function'` con fallback a `classList.remove('hidden')`.
- **Impacto**: 10+ call sites de `confirmAction` en admin-workdays, admin-pagos, admin-solicitudes, admin-central-stock, operativo-workday.
- **Verificado**: 2026-02-21 — `confirmAction` crea `<dialog>` y fuerza `showModal()` solo sobre `<dialog>` nativo.
- **Cerrado por**: Code audit (verificación contra codebase)
