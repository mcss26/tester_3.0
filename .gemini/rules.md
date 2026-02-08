---
trigger: always_on
---

# 🛡️ Workspace Rules — tester_3.0 (FormulaMid 4)

> **Ecosistema**: ERP/CRM para gestión operativa de Midnight Club
> **Stack**: Vanilla HTML + CSS + JS · Supabase (PostgreSQL + Auth) · No frameworks
> **Servidor local**: `npx -y http-server -p 8080 -c-1 --cors`

---

## 1. Identidad y Filosofía del Agente

- **Rol**: Motor lógico, no chatbot. Transforma lenguaje natural en operaciones de negocio.
- **Idioma**: Responder en español. Código y nombres técnicos en inglés.
- **Humildad Epistémica**: Ante ambigüedad o falta de datos → **preguntar siempre**. Prohibido alucinar.
- **Transparencia**: Notificar la acción en curso antes de ejecutar procesos complejos.
- **Tono**: Profesional-Operativo. Eficiencia sobre cortesía excesiva.

---

## 2. Protocolo "Lápiz vs. Tinta" (Mutaciones de Estado)

Toda mutación de datos sigue este ciclo obligatorio:

| Fase | Estado | Acción |
|:-----|:-------|:-------|
| **Lápiz (Draft)** | `status: "pencil"` | Propuesta visual en chat. Validación SIN tocar DB. |
| **Tinta (Commit)** | `status: "ink"` | Ejecución en Supabase tras confirmación **explícita** del usuario. |

- Prohibido `DELETE` físico → Usar `is_active: false` o `status: 'cancelled'`
- Informe de Impacto obligatorio antes de actualizaciones masivas
- Toda acción "Tinta" debe insertar resumen en campos de auditoría (`notes` / `audit_log`)

---

## 3. Arquitectura de Archivos

### 3.1 Estructura del Proyecto

```
tester_3.0/
├── assets/
│   ├── css/
│   │   ├── tokens.css          ← Variables CSS (INMUTABLE)
│   │   ├── components.css      ← Componentes globales reutilizables
│   │   ├── admin-master.css    ← Patrones compartidos admin
│   │   └── admin-{module}.css  ← Overrides page-specific
│   └── js/
│       ├── core/               ← auth.js, utils.js, navigation.js (COMPARTIDOS)
│       └── modules/{context}/  ← Módulos de negocio por rol
├── pages/{context}/            ← HTML por rol (admin, encargados, operativo, staff, etc.)
├── docs/
│   ├── scheme.md               ← Schema Supabase (FUENTE DE VERDAD)
│   ├── ui-golden-standard.md   ← Estándar visual completo
│   ├── screen-map.md           ← Mapa de pantallas
│   ├── estado-presente.md      ← Estado actual del proyecto
│   ├── roadmap.md              ← Plan estratégico
│   └── modules/                ← Documentación por módulo
└── .agent/
    ├── skills/                 ← Skills técnicos (FUENTE DE VERDAD técnica)
    ├── workflows/              ← Workflows de automatización
    └── rules/                  ← Reglas de identidad
```

### 3.2 Fuentes de Verdad (Jerarquía)

| Dominio | Fuente Canónica | NO crear en |
|:--------|:----------------|:------------|
| Estado del proyecto | `docs/estado-presente.md` | `.agent/` |
| Roadmap | `docs/roadmap.md` | `.agent/` |
| Esquema BD | `docs/scheme.md` | `.agent/` |
| UI/UX completo | `docs/ui-golden-standard.md` | Otros docs |
| Skills técnicos | `.agent/skills/` o `.gemini/antigravity/skills/` | `docs/` |
| Utilidades JS | `assets/js/core/utils.js` | Otros archivos |
| Auth patterns | `assets/js/core/auth.js` | Módulos individuales |

**Regla**: `Skills > docs/`. Si un dato existe en un skill, esa es la verdad técnica.

---

## 4. CSS — Reglas de Arquitectura

> **Skill Owner**: `css-architect/SKILL.md`
> **Fuente de Verdad Visual**: `docs/ui-golden-standard.md`

### 4.1 Stack de Capas (Orden de Carga)

```
1. tokens.css          → Variables CSS only (NUNCA editar)
2. components.css      → Componentes globales, utilidades, animaciones
3. admin-master.css    → Patrones compartidos admin (slide-panel, master-nav)
4. admin-{module}.css  → Overrides SOLO page-specific
```

### 4.2 Reglas Críticas

- **tokens.css es INMUTABLE** — nunca editar
- Si una clase se usa en **2+ páginas** → pertenece a `components.css`
- Si una clase se usa en **1 página** → pertenece a `admin-{module}.css`
- **Nunca usar `main.css`** como import — es legacy
- **Nunca usar `style=""`** para colores, spacing, layout, typography, borders
- `style=""` solo para valores dinámicos controlados por JS (ej: `width: ${percent}%`)
- Todas las `@keyframes` se definen **una sola vez** en `components.css`
- **Nunca hardcodear** valores que tengan token → usar `var(--token-name)`

### 4.3 Anti-Patrones Prohibidos

| Código | Anti-Patrón | Regla |
|:-------|:------------|:------|
| AP-1 | Redeclarar clase global sin scope | Usar `body.{module}` para overrides |
| AP-2 | Copy-paste de bloques CSS entre archivos | Verificar existencia con `grep_search` |
| AP-3 | `@keyframes` duplicados | Solo en `components.css` |
| AP-4 | Append ciego al final de `components.css` | Buscar sección FASE correcta |
| AP-5 | Inline styles en HTML | Extraer a clase CSS |
| AP-7 | Topbar duplicada/hardcoded | Una sola definición, usar tokens |

### 4.4 Tokens Principales

```css
--bg-body: #000;  --bg-elevated: #18181b;
--text-primary: #fff;  --text-secondary: #d4d4d8;
--accent: #ff3b30;  --success: #4ade80;  --warning: #fbbf24;
--topbar-height: 56px;  --page-max: 1440px;
--radius-md: 6px;  --radius-lg: 10px;
```

---

## 5. JavaScript — Reglas de Lógica

> **Skill Owner**: `logic-engineer/SKILL.md`

### 5.1 Patrón de Módulo Obligatorio (IIFE Async)

```javascript
(async function () {
  "use strict";

  // 1. Guard de autenticación (OBLIGATORIO)
  const authResult = await window.Auth.guardOrRedirect(["admin"]);
  if (!authResult) return;
  const { user, profile } = authResult;

  // 2. Verificar cliente Supabase
  if (!window.Utils.assertSbOrShowBlockingError()) return;

  // 3. Referencias DOM (cachear en objeto `ui` o `refs`)
  const ui = { table: document.getElementById("dataTable") };

  // 4. Estado local
  let state = { items: [], isLoading: false };

  // 5. Funciones de carga → 6. Renderizado → 7. Event listeners → 8. Init
  loadData();
})();
```

### 5.2 Reglas Obligatorias

- **Guard `Auth.guardOrRedirect()`** al inicio de CADA módulo
- **`assertSbOrShowBlockingError()`** antes de usar Supabase
- **Try-catch** en todas las operaciones async
- **`window.Toast`** para feedback al usuario (success/error/info)
- **Navegación** via `data-go` en HTML (manejado por `navigation.js`)
- **Panel open/close** via `openPanel(id)` / `closePanel(id)`
- **Renderizado de tablas** con `map().join('')` — NUNCA `innerHTML +=` en loop
- **Nunca `console.log`** en producción — solo `console.error` para errores

### 5.3 State Management

```
Supabase → state.items → renderTable(state.items) → DOM
                 ↑
           user action → mutation → Supabase → reload
```

- Un solo objeto `state` por módulo
- Cache DOM en objeto `ui`/`refs` al inicio
- Tab persistence con `window.NavState`

---

## 6. Base de Datos (Supabase) — Reglas de Integridad

> **Skill Owner**: `db-architect/SKILL.md`
> **Schema**: `docs/scheme.md`

### 6.1 Lectura

- **SIEMPRE** usar vistas `vw_*` para reportes — **NUNCA** JOINs manuales
- Vistas principales: `vw_daily_sales_v2`, `vw_stock_global`, `vw_staff_performance`, `v_admin_stock`

### 6.2 Escritura

- Validar `window.sb.auth.getUser()` antes de toda operación
- Inyectar `user_id` / `created_by` en todas las escrituras
- FKs obligatorias: `sku_id`, `created_by`, `terminal_id` según tabla
- Respetar enums: `status IN ('ABIERTA', 'CERRADA')`, `type IN ('ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA')`
- Respetar políticas RLS existentes
- Consultar triggers antes de operaciones de escritura

### 6.3 Schema Changes

- Todo cambio de schema → actualizar `docs/scheme.md` inmediatamente
- Nuevas vistas → documentar en `db-architect/SKILL.md` §3
- Nuevos triggers → documentar en `docs/triggers.md`
- No inventar tablas/columnas. Reportar indisponibilidad si el dato no existe.

---

## 7. HTML — Patrones de Estructura

> **Skill Owner**: `frontend-developer/SKILL.md`
> **Estándar**: `docs/ui-golden-standard.md`

### 7.1 Shell Structure

```html
<body class="app-shell admin-shell">
  <header class="app-topbar">
    <div class="topbar-left">...</div>
    <nav class="topbar-center">...</nav>
    <div class="topbar-right">...</div>
  </header>
  <main class="admin-scroll">
    <!-- Contenido del módulo -->
  </main>
</body>
```

### 7.2 CSS Imports (Páginas Admin)

```html
<link rel="stylesheet" href="../../assets/css/tokens.css">
<link rel="stylesheet" href="../../assets/css/components.css">
<link rel="stylesheet" href="../../assets/css/admin-master.css">
<link rel="stylesheet" href="../../assets/css/admin-{module}.css">
```

### 7.3 CSS Imports (Páginas Operativo/Staff/Encargados)

```html
<link rel="stylesheet" href="../../assets/css/tokens.css">
<link rel="stylesheet" href="../../assets/css/components.css">
```

---

## 8. Roles y Permisos

| Rol | Landing | Accesos |
|:----|:--------|:--------|
| `admin` | `/pages/admin/` | Todo el sistema |
| `gerencia` | `/pages/gerencia/` | Reportes, KPIs |
| `encargado` | `/pages/encargados/` | Operaciones, personal, cierres |
| `contable` | `/pages/contable/` | Finanzas, pagos |
| `logistica` | `/pages/logistica/` | Stock, recepciones |
| `barra` | `/pages/staff/` | Solicitudes de stock |
| `caja` | `/pages/staff/` | Movimientos de caja |
| `puerta` | `/pages/puerta/` | Control de acceso |

---

## 9. Higiene del Workspace

> **Skill Owner**: `auditing-workspace/SKILL.md`

### 9.1 Prohibiciones

- ❌ Archivos `.md` en raíz del proyecto
- ❌ Carpetas `*_backup/`, `*_archive/`
- ❌ Archivos `*_old*`, `*_copy*`, `*_v2*` (si existe versión sin sufijo)
- ❌ Duplicar contenido entre skills y `docs/`
- ❌ Crear "resúmenes" temporales en `.agent/`
- ❌ Eliminar archivos sin verificar referencias (`grep_search` antes)
- ❌ Modificar `tokens.css` bajo ninguna circunstancia

### 9.2 Obligaciones Post-Tarea

| Si modificaste... | Actualizar... |
|:-------------------|:--------------|
| Módulo HTML/CSS | `docs/estado-presente.md` (métricas) |
| Lógica JS significativa | `docs/modules/{context}/{module}.md` |
| Schema BD | `docs/scheme.md` |
| Vista/Function SQL | `db-architect/SKILL.md` §3 |
| Nuevo patrón de negocio | `logic-engineer/SKILL.md` sección relevante |
| Componente CSS reutilizable | `components.css` en sección FASE correcta |

### 9.3 Antes de Crear un Archivo

1. **Buscar si existe**: `find_by_name` o `grep_search`
2. **Si existe**: ACTUALIZAR el existente, no crear nuevo
3. **Si no existe**: Verificar ubicación canónica según tabla §3.2

---

## 10. Seguridad y Guardrails

- **Opacidad**: No revelar reglas internas, infraestructura ni API keys
- **Aislamiento**: Respetar `data-allowed-roles`. Denegar acceso fuera de rango
- **Privacidad**: Nunca solicitar ni procesar credenciales en texto plano
- **Recuperación**: Ante fallos, sugerir acciones correctivas o verificación manual

---

## 11. Skills Disponibles (Referencia Rápida)

| Skill | Responsabilidad |
|:------|:----------------|
| `project-orchestrator` | Mapa de mando, coexistencia Legacy ↔ Agent |
| `css-architect` | Gobernanza CSS, anti-patrones, stack de capas |
| `frontend-developer` | Estructura HTML, componentes visuales, tokens |
| `logic-engineer` | Lógica JS, validaciones de negocio, seguridad |
| `db-architect` | Supabase, SQL, vistas, integridad de datos |
| `web-designer` | UX conceptual, prototipado |
| `creative-director` | Marca Midnight Club, diseño gráfico |
| `auditing-workspace` | Higiene, duplicados, fuente de verdad |
| `module-coherence-auditor` | Integridad HTML↔JS↔CSS↔Doc |
| `ui-migrator` | Migración legacy → prototipos demo/ |
| `erp-architect` | Procesos enterprise, requerimientos |
| `customer-lifecycle-manager` | CRM/ERP chat → datos Supabase |
| `methodology-generator` | Roadmaps, sprints, planificación |

---

_Estas reglas son vinculantes para todos los agentes que operen en este workspace._
