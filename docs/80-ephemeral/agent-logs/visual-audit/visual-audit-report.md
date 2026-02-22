# Visual Audit Report — FormulaMid 4.0

> **Fecha:** 2026-02-22 · **Páginas analizadas:** 36 capturadas / 46 totales · **Módulos:** 6

---

## Resumen Ejecutivo

La aplicación Midnight Club presenta un **dark-mode consistente** y una paleta base sólida. Sin embargo, existen **inconsistencias sistémicas** en navegación, tipografía de estados vacíos, estructura de tablas y madurez de módulos que impiden una experiencia unificada. Este reporte clasifica los hallazgos por severidad y propone un plan de corrección por fases.

---

## 1. Patrones Positivos (Golden Patterns)

| Patrón                                  | Ejemplo                                                                      | Dónde                                               |
| :-------------------------------------- | :--------------------------------------------------------------------------- | :-------------------------------------------------- |
| **Tab navigation con underline activo** | Stock / Distribución / Recepción / Seguimiento                               | Logística (todas las sub-pages)                     |
| **Breadcrumb `MÓDULO / PÁGINA`**        | `LOGÍSTICA / DISTRIBUCIÓN`, `OPERATIVO / STOCK`                              | Logística, Operativo, Admin sub-pages               |
| **Filter chips con estado activo**      | `Todos [filled]` / `Pendientes [ghost]` / etc.                               | Distribución, Recepción, Seguimiento, Central Stock |
| **Jump-to search bar (⌘K)**             | `Ir a...` search input centrado en topbar                                    | Logística, Operativo, Gerencia sub-pages            |
| **Data tables con separadores y hover** | Tablas con bordes sutiles y contraste adecuado                               | Stock, Solicitudes, Balance Semanal                 |
| **Botón de acción contextual**          | `+ Nueva Solicitud`, `+ Nueva Recepción`                                     | Operativo master-sku, Logística recepción           |
| **Badge de estado con color**           | `ORDENADO` (blue), `PENDIENTE` (yellow), `PLANNED` (white), `Normal` (green) | Seguimiento, Solicitudes, Personal                  |
| **Refrescar button**                    | Icono + label "Refrescar" alineado a derecha                                 | Logística, Operativo, Admin central-stock           |

---

## 2. Hallazgos Críticos (P0 — Fix Inmediato)

### 2.1 Balance Semanal: Datos Corruptos

**Página:** `gerencia/balance-semanal`

- Múltiples filas muestran **"Invalid Date"** en la columna Semana
- Columnas IMPUESTOS (EST) y CASH FLOW muestran **"$NaN"** y **"Venta: $NaN"**
- Esto indica un bug en el parsing de fechas y el cálculo financiero, no un problema CSS

> [!CAUTION]
> Datos financieros corruptos visibles al usuario final. Prioridad de fix: **inmediata**.

### 2.2 Encargado Caja Noche: Modal Overlay Bug

**Página:** `encargados/encargado-caja-noche`

- La página se capturó con un **modal "Confirmar"** parcialmente visible sobre contenido borroso
- Indica que el modal se abre automáticamente al navegar, o hay un estado persistido incorrectamente
- El backdrop blur es excesivo y oculta todo el contenido detrás

### 2.3 Admin Nómina: Página Completamente Vacía

**Página:** `admin/admin-master-nomina`

- La página renderiza con **cero contenido** — solo navbar y footer
- No hay tabla, no hay empty state, no hay heading
- Comparar con admin-master-categorias que sí muestra contenido completo

---

## 3. Inconsistencias de Navegación (P1)

### 3.1 Tres Patrones de Navbar Diferentes

| Patrón                      | Componentes                                                       | Módulos                                                                   |
| :-------------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **A: Index**                | Nombre módulo (izq) + Badge fecha (centro) + Avatar (der)         | Admin index, Encargado Barra/Caja index, Logística index, Operativo index |
| **B: Sub-page con Jump-to** | Breadcrumb (izq) + Search ⌘K (centro) + Avatar (der)              | Logística sub-pages, Operativo sub-pages, Gerencia, Admin sub-pages       |
| **C: Sub-page sin Search**  | ← Back arrow + Breadcrumb (izq) + Título centrado + Refresh (der) | Encargado Recepción, Encargado Barra noche (stock)                        |

> [!IMPORTANT]
> Los patrones B y C deben unificarse. Las sub-pages de Encargados no tienen Jump-to search, mientras que las de Logística y Operativo sí. La decisión es: **todas las sub-pages usan Patrón B** (con search).

### 3.2 Breadcrumb Inconsistente

| Variante                                            | Ejemplo                  | Módulo           |
| :-------------------------------------------------- | :----------------------- | :--------------- |
| `ADMINISTRACIÓN`                                    | Admin index              | Admin            |
| `BARRA / PERSONAL`                                  | Encargado barra personal | Encargados barra |
| `CAJAS / PERSONAL`                                  | Encargado caja personal  | Encargados caja  |
| `LOGÍSTICA / STOCK DEPÓSITO`                        | Logística stock          | Logística        |
| `OPERATIVO / STOCK`                                 | Operativo stock          | Operativo        |
| `GERENCIA / BALANCE SEMANAL`                        | Balance semanal          | Gerencia         |
| `INICIO / STAFF CAJA`                               | Staff caja               | Staff            |
| `CONTROL DE STOCK` (título centrado, no breadcrumb) | Barra noche stock        | Encargados       |

**Problema:** Encargados usa un formato diferente donde el nivel 1 es el área (`BARRA`, `CAJAS`) en lugar del módulo (`ENCARGADO BARRA`, `ENCARGADO CAJA`). Staff usa `INICIO` como nivel 1.

---

## 4. Inconsistencias de Layout (P1)

### 4.1 Index Pages: Desigualdad en Features

| Index Page      | Search Bar   | Nav Items                                                          | Footer    |
| :-------------- | :----------- | :----------------------------------------------------------------- | :-------- |
| Admin           | ✅ Buscar... | 7 items (text links + 1 highlighted)                               | ✅ © 2026 |
| Encargado Barra | ❌           | 3 items (RECEPCIÓN con badge, PERSONAL, NOCHE)                     | ✅        |
| Encargado Caja  | ❌           | 2 items (PERSONAL, NOCHE)                                          | ✅        |
| Logística       | ❌           | 4 items (STOCK, DISTRIBUCIÓN, RECEPCIÓN, SEGUIMIENTO)              | ✅        |
| Operativo       | ✅ Buscar... | 5 items (WORK DAY, STOCK, SOLICITUDES, CMS MEMBERS, CONFIGURACIÓN) | ✅        |

**Decisión necesaria:** ¿Todos los index pages deben tener search bar, o solo Admin y Operativo?

### 4.2 Stock Tables: Columnas Diferentes para Mismos Datos

| Página              | Columnas                                                                    |
| :------------------ | :-------------------------------------------------------------------------- |
| Logística Stock     | ESTADO · SKU · CATEGORÍA · STOCK ACTUAL · REQUERIDO · DIFERENCIA · ACCIONES |
| Operativo Stock     | SKU · STOCK ACTUAL · REQUERIDO · DIFERENCIA · ESTADO                        |
| Admin Central Stock | ESTADO · SKU · CATEGORÍA · STOCK ACTUAL · REQUERIDO · DIFERENCIA · ACCIONES |

**Problema:** Operativo muestra solo 5 columnas (sin CATEGORÍA ni ACCIONES), pero los datos son iguales. El badge de ESTADO usa `Normal` (green pill) en Operativo vs dot-indicator (●) en Logística/Admin.

### 4.3 Botón Refrescar: Posición y Estilo Inconsistente

| Página                | Posición                        | Estilo                                    |
| :-------------------- | :------------------------------ | :---------------------------------------- |
| Logística stock       | Debajo del h2, alineado derecha | Icono ↻ + "Refrescar"                     |
| Operativo stock       | Debajo del h2, alineado derecha | "Refrescar" (sin icono)                   |
| Operativo solicitudes | **Centro de la página, suelto** | "Refrescar" (sin icono, posición anómala) |
| Operativo master-sku  | **Centro de la página, suelto** | "Refrescar" (desalineado)                 |

---

## 5. Módulos Placeholder (P2)

### 5.1 Staff Barra — "PRÓXIMAMENTE"

- Muestra solo `MIDNIGHT CLUB / Panel Staff Barra / PRÓXIMAMENTE`
- Topbar muestra "CARGANDO..." que nunca se resuelve a la fecha activa
- **Acción:** Evaluar si mantener como placeholder visible o eliminar del menú

### 5.2 Staff Caja — "NO HAY JORNADA ACTIVA"

- Muestra heading "Staff Caja" + descripción + banner `NO HAY JORNADA ACTIVA`
- Más maduro que Staff Barra — tiene layout pero depende de workday
- Breadcrumb usa `INICIO / STAFF CAJA` (inconsistente con otros módulos)

---

## 6. Problemas de Tipografía y Color (P2)

### 6.1 Mixed Language in Labels

| Hallazgo                            | Ejemplo                                                                        |
| :---------------------------------- | :----------------------------------------------------------------------------- |
| Admin index mezcla inglés y español | `WORKDAYS`, `PAYMENTS`, `STOCK CENTRAL`, pero `SOLICITUDES`, `REPORTES`        |
| Operativo index                     | `WORK DAY`, `CMS MEMBERS` en inglés; `SOLICITUDES`, `CONFIGURACIÓN` en español |

**Recomendación:** Unificar todo a español para consistencia de usuario final.

### 6.2 Badge/Pill Color Variants

| Badge              | Color              | Usado en                          |
| :----------------- | :----------------- | :-------------------------------- |
| `PLANNED`          | White border pill  | Personal (barra/caja)             |
| `PENDIENTE`        | Yellow filled pill | Operativo solicitudes             |
| `Aprobado`         | Blue text          | Logística recepción               |
| `ORDENADO`         | Blue filled pill   | Logística seguimiento             |
| `Normal`           | Green filled pill  | Operativo stock                   |
| Notification badge | Red circle (5)     | Encargado barra index → Recepción |

**Estado actual:** No hay un sistema unificado de badges. Cada módulo define sus propios estilos.

---

## 7. Empty States (P2)

| Página                 | Empty State                           | Calidad                        |
| :--------------------- | :------------------------------------ | :----------------------------- |
| Admin nómina           | **Ninguno** — blank page              | ❌ Crítico                     |
| Caja personal          | "No se encontró staff de caja."       | ✅ Aceptable                   |
| Barra noche stock      | "Sin Jornada Activa" + botón "Volver" | ✅ Bueno                       |
| Logística distribución | (tabla vacía, sin mensaje)            | ⚠️ Necesita empty state        |
| Operativo master-sku   | "No hay solicitudes registradas."     | ✅ Aceptable                   |
| Staff barra            | "PRÓXIMAMENTE"                        | ⚠️ Placeholder, no empty state |
| Staff caja             | "NO HAY JORNADA ACTIVA"               | ✅ Bueno                       |

---

## 8. Resumen de Hallazgos por Módulo

| Módulo     | Páginas | Madurez      | Issues P0              | Issues P1                          | Issues P2                |
| :--------- | :------ | :----------- | :--------------------- | :--------------------------------- | :----------------------- |
| Admin      | 14      | ⬛⬛⬛⬜ 75% | 1 (nómina vacía)       | 2 (nav, breadcrumb)                | 1 (idioma mixto)         |
| Encargados | 7       | ⬛⬛⬛⬜ 70% | 1 (modal bug)          | 2 (nav patrón C, breadcrumb)       | 1 (personal layout diff) |
| Logística  | 5       | ⬛⬛⬛⬛ 90% | 0                      | 1 (stock cols vs operativo)        | 0                        |
| Operativo  | 5       | ⬛⬛⬛⬜ 75% | 0                      | 2 (refrescar posición, stock cols) | 1 (idioma)               |
| Gerencia   | 1       | ⬛⬛⬜⬜ 50% | 1 (Invalid Date, $NaN) | 0                                  | 0                        |
| Staff      | 2       | ⬛⬜⬜⬜ 25% | 0                      | 0                                  | 2 (placeholders)         |

---

## 9. Arquitectura CSS (Diagnóstico)

Basado en el skill `css-architect` (v3.0), el proyecto tiene definida una arquitectura modular target:

```
assets/css/
├── tokens.css       ← IMMUTABLE, 4-tier design tokens
├── base.css         ← [NEW] Reset, body, @keyframes
├── layout.css       ← [NEW] Topbar, breadcrumb, grids
├── components.css   ← Shared components
├── forms.css        ← [NEW] Inputs, selects, dropdown
├── utilities.css    ← [NEW] Helpers
└── {page}.css       ← Page-specific
```

**Estado actual:** Los archivos `[NEW]` aún no existen completamente migrados. El CSS está parcialmente en `swiss-style.css` (monolito legacy) y archivos page-specific. Los hallazgos visuales confirman que la falta de modularización causa las inconsistencias de badges, botones y layouts entre módulos.

### Violaciones Hard Rules detectadas visualmente:

- **HR-1:** Badge colors probablemente hardcodeados (no tokenizados)
- **GR-1:** Breadcrumb styles redefinidos en múltiples page CSS
- **GR-5:** Probable inline styles en modal overlay (blur intensity)

---

_Generado automáticamente por Visual Audit Script + análisis manual de 36 screenshots._
