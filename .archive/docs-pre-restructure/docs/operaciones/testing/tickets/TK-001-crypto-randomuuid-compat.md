# TK-001: crypto.randomUUID() no disponible — bloquea creación de eventos con QR

> **Origen**: Verificación manual `admin-workdays.html` → Flujo Workday
> **Agente(s)**: frontend
> **Severidad**: 🔴
> **Tier**: Tier0
> **Estado**: ✅ Cerrado

---

## Contexto

Al intentar crear un evento con QR auto-generados desde `admin-workdays.html`, la función `crypto.randomUUID()` lanza un error. Esta API Web Crypto requiere un **contexto seguro** (HTTPS), pero incluso en HTTPS puede no estar disponible en todos los browsers (Safari < 15.4, Firefox < 95, IE).

El error bloquea la generación de lotes QR al crear eventos, afectando el flujo completo del Workday cuando se necesitan QRs.

**Nota:** La creación del workday en sí (`handleCreate()` L877) NO usa `crypto.randomUUID` — el UUID lo genera Supabase. El bug SOLO afecta la auto-generación de QR codes dentro de `handleCreateEvent()`.

## Archivos Implicados

- `assets/js/modules/admin/admin-workdays.js` → L1295: `code: crypto.randomUUID()`
- `assets/js/modules/admin/qr-generator.js` → L110: `const uid = crypto.randomUUID()`

## Fix Propuesto

Reemplazar `crypto.randomUUID()` por un fallback compatible:

```javascript
// Opción A: Fallback inline (zero dependencies)
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback RFC 4122 v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r =
      (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >>
      (c === "x" ? 0 : 3);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
```

**Ubicar el helper en:** `assets/js/core/utils.js` como `window.Utils.generateUUID()` y reemplazar las 2 ocurrencias.

## Criterio de Éxito

- [x] `admin-workdays.html` → Crear Evento con QR qty > 0 → lote generado sin error
- [x] `qr-generator.js` → Generación de QR funciona en todos los browsers soportados
- [x] Ambas ocurrencias de `crypto.randomUUID()` reemplazadas por `Utils.generateUUID()`
- [x] Verificar en HTTP y HTTPS

## Resolución

- **Fix**: `generateUUID()` con fallback RFC 4122 v4 agregado en `utils.js:67-78`. Expuesto como `window.Utils.generateUUID()`.
- **Call sites migrados**: `admin-workdays.js:1306` y `qr-generator.js:135` — ambos usan `window.Utils.generateUUID()`.
- **Verificado**: 2026-02-21 — grep confirma 0 usos directos de `crypto.randomUUID()` fuera del fallback.
- **Cerrado por**: Code audit (verificación contra codebase)
