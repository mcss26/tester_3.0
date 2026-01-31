# Auditoría UI/UX - Admin Modules

> **Fecha**: 2026-01-29
> **Auditor**: ui-ux-auditor skill
> **Estado General**: 🟠 PARCIALMENTE CONFORME

---

## Resumen Ejecutivo

| Categoría | Estado | Detalle |
|:----------|:------:|:--------|
| **Auth Guard** | ✅ OK | 18/18 módulos con `Auth.guardOrRedirect` |
| **Alien CSS** | 🚨 CRÍTICO | 78+ instancias en barras/* y qr/* |
| **Blocking UX** | 🚨 CRÍTICO | 33+ usos de `alert()`/`confirm()` |
| **Hardcoded HEX** | 🟡 P1 | 1 instancia en session.html |
| **Módulos Core** | ✅ OK | admin-master-*, admin-stock, admin-cierre limpios |

---

## 🚨 Blockers (Must Fix)

### 1. Alien CSS (Tailwind) - CRÍTICO

Los siguientes módulos usan clases pseudo-Tailwind incompatibles:

| Archivo | Clases Detectadas | Líneas |
|:--------|:------------------|:-------|
| `barras/recipes.html` | `mb-6`, `px-4`, `py-2`, `gap-1`, `mt-2`, `mt-4` | 23-77 |
| `barras/session.html` | `w-full`, `py-1`, `gap-4`, `mt-4` | 39-114 |
| `barras/index.html` | `gap-2`, `px-4`, `py-3`, `flex-col`, `mt-4` | 29-81 |
| `qr/generator.html` | `gap-4`, `px-6`, `h-[60px]` | 15-16 |
| `qr/index.html` | `gap-4`, `mb-4`, `mt-8` | 12-76 |
| `qr/monitor.html` | `gap-4`, `gap-6`, `mb-4`, `mb-2` | 12-59 |

**Acción**: Migrar a clases estándar de `components.css`.

---

### 2. Blocking UX (alert/confirm) - CRÍTICO

| Archivo | Problema | Líneas |
|:--------|:---------|:-------|
| `bar-recipes.js` | 3× `alert()` | 120, 134, 156 |
| `bar-dashboard.js` | 2× `alert()` | 25, 165 |
| `bar-session.js` | 8× `alert()`/`confirm()` | 14, 64, 170, 189, 211, 214, 220, 249, 254 |
| `qr-generator.js` | 4× `alert()`/`confirm()` | 64, 85, 130, 134 |
| `qr-dashboard.js` | 1× `alert()` | 125 |
| `admin-pagos.js` | 10× fallback `alert()` | 430, 441, 470, 520, 531, 545, 586, 603, 655, 720 |
| `admin-workdays.js` | 1× `confirm()` fallback | 396 |
| `admin-master-tarifario.js` | 1× `confirm()` | 218 |

**Acción**: Reemplazar con `window.Toast` y modales `<dialog>`.

---

### 3. Hardcoded Color - P1

| Archivo | Problema | Línea |
|:--------|:---------|:------|
| `barras/session.html` | `bg-[#1c1c1e]` | 45 |

**Acción**: Usar `var(--surface-1)` o clase estándar.

---

## ✅ Módulos Conformes (Golden Standard)

Los siguientes módulos admin PASAN la auditoría:

| Módulo | Auth | CSS | UX | States |
|:-------|:----:|:---:|:--:|:------:|
| `admin-master-proveedores` | ✅ | ✅ | ✅ | ✅ |
| `admin-master-categorias` | ✅ | ✅ | ✅ | ✅ |
| `admin-master-sku` | ✅ | ✅ | ✅ | ✅ |
| `admin-master-pos` | ✅ | ✅ | ✅ | ✅ |
| `admin-stock` | ✅ | ✅ | ✅ | ✅ |
| `admin-solicitudes` | ✅ | ✅ | ✅ | ✅ |
| `admin-cierre` | ✅ | ✅ | ✅ | ✅ |
| `admin-reportes` | ✅ | ✅ | ✅ | ✅ |
| `admin-workdays` | ✅ | ✅ | 🟡* | ✅ |
| `admin-stock-ajustes` | ✅ | ✅ | ✅ | ✅ |

> *`admin-workdays.js` tiene fallback a `confirm()` en L396

---

## 📊 Prioridades de Remediación

### Sprint 1: Barras Module (Alta Prioridad)
```
barras/index.html     → Migrar HTML a components.css
barras/session.html   → Migrar HTML + eliminar HEX
barras/recipes.html   → Migrar HTML
bar-dashboard.js      → Reemplazar alert() con Toast
bar-session.js        → Reemplazar alert/confirm con Modal
bar-recipes.js        → Reemplazar alert() con Toast
```

### Sprint 2: QR Module
```
qr/index.html        → Migrar HTML
qr/generator.html    → Migrar HTML
qr/monitor.html      → Migrar HTML
qr-generator.js      → Reemplazar alert/confirm
qr-dashboard.js      → Reemplazar alert()
```

### Sprint 3: Admin Pagos Cleanup
```
admin-pagos.js       → Eliminar fallbacks alert()
admin-workdays.js    → Eliminar fallback confirm()
admin-master-tarifario.js → Reemplazar confirm() con modal
```

---

## 🔗 Referencias

- [Standard Module Guide](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/standard-module-guide.md)
- [UI Components](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/ui-components.md)
- [components.css](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/css/components.css)
