# Análisis de Inconsistencias y Recomendaciones - FormulaMid 4

## Resumen Ejecutivo
FormulaMid 4 es una aplicación web vanilla (HTML/CSS/JS) con backend Supabase para la gestión de un establecimiento gastronómico. El proyecto cuenta con documentación extensa, pero presenta problemas críticos de seguridad y una deuda técnica acumulada que requiere atención inmediata.

---

## 🔴 Problemas Críticos (Acción Inmediata)

### 1. Credenciales Expuestas en Código Fuente
**Archivo:** `assets/js/core/config.js`

```javascript
window.APP_CONFIG = {
  SUPABASE_URL: "https://...",
  SUPABASE_ANON_KEY: "eyJhbGci...",  // JWT visible públicamente
  EMAILJS: {
    PUBLIC_KEY: "FaYbPCI_5oJSsC9g4",
    SERVICE_ID: "service_j7h80jk"
  }
};
```
- **Impacto:** Acceso no autorizado a la base de datos y agotamiento de cuotas de servicios externos (EmailJS).
- **Recomendación (Estándar de Producción):** 
    - **Rotación de Secretos:** Revocar keys comprometidas en los dashboards de Supabase y EmailJS de forma inmediata.
    - **Inyección en Build-time:** Migrar a un bundler (Vite/Webpack) para utilizar variables de entorno (`.env`) que se inyecten durante la compilación, evitando archivos `.js` estáticos con credenciales.
    - **Gestión de Secretos en CI/CD:** Configurar las variables en el entorno de despliegue (GitHub Secrets, Vercel, Netlify) para que nunca toquen el sistema de archivos del repositorio.
    - **Higiene de Git:** Agregar `config.js` y `.env` al `.gitignore` de forma retroactiva (usando `git rm --cached`) y mantener únicamente un `.env.example` como referencia.

### 2. .gitignore Incompleto
**Estado actual:**
```text
.DS_Store
*.png
```
**Falta agregar:**
- `*.tmp`
- `.env*`
- `config.js`
- `.agent/data/**`

### 3. Método Inexistente en Código
**Archivo:** `assets/js/modules/admin/qr-generator.js:64`
```javascript
const confirmed = await window.Utils.confirmModal(...);
// ✗ confirmModal NO EXISTE - debería ser confirmAction
```
- **Impacto:** Error en tiempo de ejecución (Runtime Error) al intentar generar QRs.

---

## 🟠 Inconsistencias de Código (Alta Prioridad)

### 4. Patrones de Inicialización Mezclados
| Patrón | Archivos que lo usan |
| :--- | :--- |
| **IIFE** `(async function(){})()` | `admin-stock.js`, `admin-master-*.js` |
| **DOMContentLoaded** | `operativo-stock.js`, `login.js` |
| **Sin wrapper** | `work-day-helper.js` |
- **Recomendación:** Estandarizar el uso de `DOMContentLoaded` en todos los módulos de página.

### 5. Convenciones de Nomenclatura (Naming)
Existen múltiples formas de referenciar elementos del DOM:
- **Patrón A:** Objeto `ui` (`const ui = { ... }`).
- **Patrón B:** Objeto `refs` (`const refs = { ... }`).
- **Patrón C:** Helper `el()` (`const el = (id) => ...`).
- **Patrón D:** Variables sueltas.
- **Recomendación:** Estandarizar en `const ui = { ... }` para todas las referencias DOM.

### 6. Manejo de Errores
- **Inconsistencia:** Algunos módulos usan prefijos en `console.error`, otros no tienen contexto y otros ignoran errores silenciosamente.
- **Recomendación:** Implementar un helper `logError(module, message, error)` en `utils.js`.

### 7. Estado Global vs. Variables Sueltas
- **Inconsistencia:** Algunos módulos agrupan el estado en `const state = { ... }`, mientras otros usan variables `let` dispersas.
- **Recomendación:** Migrar todos los módulos al patrón `const state = { ... }`.

---

## 🟡 Problemas de Configuración y Estilo (Media Prioridad)

### 8. Herramientas de Desarrollo
- **Problema:** `extensions.json` recomienda Prettier y ESLint, pero no existen los archivos `.prettierrc` ni `.eslintrc`.
- **Recomendación:** Crear las configuraciones base o eliminar las recomendaciones.

### 9. Gestión de Dependencias
- **Problema:** Falta `package.json`.
- **Recomendación:** Crear un `package.json` básico para scripts de desarrollo (`serve`, `lint`).

### 10. CSS Alien Classes (Violación de Frozen CSS)
**Archivo:** `pages/admin/admin-workdays.html`
```html
<div class="border-white/10 mb-3 text-xs bg-white/5 text-green-500">
```
- **Problema:** Uso de clases Tailwind prohibidas por la política de CSS congelado del proyecto.

---

## 🟡 Problemas de Documentación

1. **Ubicación del README:** El principal está en `docs/README.md` en lugar de la raíz `./README.md`.
2. **Carpeta `_archive`:** Viola la política de "no backups" establecida en la documentación.
3. **Archivos Temporales:** `all_docs.tmp` y `all_pages.tmp` en la raíz deben eliminarse o ignorarse.
4. **TODOs Pendientes:** Seguimiento inexistente en `importer-extracciones.js` y `encargado-caja-personal.js`.

---

## 🔵 Inconsistencias Menores

- **JSDoc:** Documentación incompleta o inexistente en módulos como `operativo-stock.js`.
- **Logging:** Presencia de `console.log` y `console.error` sin un sistema centralizado.
- **Botón Debug:** Expuesto en `assets/js/modules/cms-members.js`.
- **Versión de SDK:** Supabase SDK cargado sin versión fija (`@2` en lugar de `@2.x.x`).

---

## Matriz de Prioridades

| Prioridad | Problema | Esfuerzo Estimado |
| :--- | :--- | :--- |
| 🔴 **Crítico** | Revocar credenciales + .gitignore | 1 hora |
| 🔴 **Crítico** | Fix `qr-generator.js` (`confirmModal`) | 5 min |
| 🟠 **Alta** | Estandarizar patrones de código (UI/State) | 2-3 días |
| 🟡 **Media** | Agregar `.eslintrc` / `.prettierrc` | 1 hora |
| 🟡 **Media** | Corregir CSS alien classes | 30 min |
| 🔵 **Baja** | Mover README a raíz y limpieza temporal | 10 min |

---

## Estadísticas del Proyecto

- **Páginas HTML:** 46
- **Módulos JS:** 43
- **Líneas de CSS:** 3,435 (Congelado)
- **Documentación:** 38 docs de módulos
- **Agent Skills:** 13 skills definidas

---

## Próximos Pasos (Checklist)

- [ ] **Configurar Entorno Seguro**: Crear `.env` y `.env.example` para trasladar las credenciales antes de eliminarlas del código fuente, asegurando la continuidad del acceso a datos.
- [ ] Actualizar `.gitignore` para excluir `config.js` y archivos `.env`, permitiendo el desarrollo local sin exponer secretos en el repositorio.
- [ ] Corregir `confirmModal` por `confirmAction` en `qr-generator.js`.
- [ ] Mover `docs/README.md` a la raíz (`./README.md`) y eliminar archivos temporales (`.tmp`).
- [ ] **Rotación de Secretos**: Revocar las keys comprometidas en los dashboards de Supabase y EmailJS una vez verificado que el sistema local carga las nuevas credenciales correctamente.