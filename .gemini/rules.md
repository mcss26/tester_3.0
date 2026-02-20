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

### 1.1 Onboarding Obligatorio (ANTES de cualquier tarea)

**Al iniciar CADA conversación, leer en este orden:**

1. Este archivo (`rules.md`) — ya se carga automáticamente.
2. `AGENT.md` (raíz del proyecto) — routing de agentes, guardrails, contención documental.
3. `docs/estado-presente.md` — contexto actual del proyecto.

> ⚠️ **PROHIBIDO** decir "no leí las reglas" o ignorar `AGENT.md`. Si no lo encontrás, **pedirlo al usuario**.

### 1.2 Sistema de Agentes Especialistas

Este proyecto tiene **6 agentes definidos** en `.agent/agents/`. Cada agente tiene su `AGENT.md` con rol, responsabilidades y restricciones:

| Agente         | Carpeta                       | Responsabilidad                                  |
| :------------- | :---------------------------- | :----------------------------------------------- |
| `orchestrator` | `.agent/agents/orchestrator/` | Routing, delegación, plans cross-cutting         |
| `frontend`     | `.agent/agents/frontend/`     | UI, CSS, componentes visuales                    |
| `logic`        | `.agent/agents/logic/`        | JS, auth, módulos de negocio                     |
| `data`         | `.agent/agents/data/`         | Supabase, schema, migraciones SQL                |
| `qa`           | `.agent/agents/qa/`           | Auditorías, coherencia, higiene                  |
| `product`      | `.agent/agents/product/`      | UX, research, specs de producto                  |
| `security-ops` | `.agent/agents/security-ops/` | Seguridad, control operativo, watchdogs, backups |

**Regla**: Si tu tarea encaja en un agente, leer su `AGENT.md` antes de ejecutar.

---

## 2. Reglas de Protección y Control

### 2.1 Protección del Stack

#### Refactorización Strangler Fig

**Prohibido reescribir desde cero.** El código nuevo debe reemplazar al viejo de forma progresiva, componente por componente.

- Cada componente migrado debe convivir con el sistema existente sin romper funcionalidad.
- Una vez que el componente nuevo está validado, **el código viejo debe eliminarse en el mismo commit o en el inmediato siguiente**. No se permite acumulación de código legacy huérfano.

#### Desacoplamiento Absoluto CSS/JS

**NUNCA usar `#ids` para estilos CSS.** Cada tipo de ancla tiene un uso exclusivo e intransferible:

| Ancla         | Uso exclusivo                                                     |
| :------------ | :---------------------------------------------------------------- |
| `#id`         | DOM routing, accesibilidad (`aria-labelledby`, `for`, etc.)       |
| `data-action` | Event delegation en Vanilla JS                                    |
| `data-state`  | Estado lógico del componente (estilable vía `[data-state="..."]`) |
| `.class`      | **Único mecanismo** para aplicar estilos visuales en CSS          |

> ⚠️ Estilizar con selectores de atributo `[data-state="active"]` **está permitido** porque el atributo refleja estado lógico del componente, no es un ancla de JS.

#### Aplanamiento de Cascada

**Prohibido usar selectores de etiquetas HTML** (`div`, `span`, `ul`, `li`, etc.) **o cadenas de herencia** (`.parent > div > .child`) en el CSS de componentes. Usar únicamente **clases planas**.

**Excepciones controladas:**

1. **Reset / Normalize global:** Selectores de etiqueta permitidos exclusivamente en el archivo de reset (`body`, `h1`–`h6`, `a`, `img`, etc.).
2. **Contenido dinámico (rich-text):** Cuando el HTML proviene de un CMS o Markdown y no se pueden asignar clases, se permite usar selectores de etiqueta **únicamente bajo una clase scope** (`.rich-content h2`, `.rich-content p`).

### 2.2 Control de Output

#### Límite de Generación (Hard Cap)

Generar un **máximo de 5 elementos** por ejecución en outputs de tipo lista (preguntas, tareas, hallazgos). Al llegar a 5, **detenerse y esperar instrucción explícita** para continuar. Priorizar por impacto descendente.

#### Directriz de Tono

Todo output debe dirigirse exclusivamente a la **arquitectura y al código**. Prohibido usar terminología de auto-referencia o de ingeniería de prompts. El vocabulario debe ser el de un ingeniero de software, no el de un operador de modelos.

#### Restricción de Longitud

Las explicaciones o motivos técnicos **no deben superar las 3 líneas de texto**. Sin excepciones.

#### Cero Ruido (Zero-Fluff)

Prohibido generar saludos, introducciones, confirmaciones de entendimiento, resúmenes o conclusiones. La salida debe ser **100% el formato de datos requerido**.

> ⚠️ **Excepción:** Se permite una línea de señal si la ejecución está bloqueada por falta de información o ambigüedad crítica.

#### Exigencia de Evidencia

Toda pregunta o propuesta debe incluir **referencia a archivo, función o línea** del repositorio. Antes de proponer un cambio, verificar: (1) si existe código previo relacionado, (2) si hay dependencias afectadas, (3) si hay tests que cubran la zona.

---

## 3. Protocolo "Lápiz vs. Tinta" (Mutaciones de Estado)

Toda mutación de datos sigue este ciclo obligatorio:

| Fase               | Estado             | Acción                                                             |
| :----------------- | :----------------- | :----------------------------------------------------------------- |
| **Lápiz (Draft)**  | `status: "pencil"` | Propuesta visual en chat. Validación SIN tocar DB.                 |
| **Tinta (Commit)** | `status: "ink"`    | Ejecución en Supabase tras confirmación **explícita** del usuario. |

- Prohibido `DELETE` físico → Usar `is_active: false` o `status: 'cancelled'`
- Informe de Impacto obligatorio antes de actualizaciones masivas
- Toda acción "Tinta" debe insertar resumen en campos de auditoría (`notes` / `audit_log`)

---

## 4. Arquitectura de Archivos

### 4.1 Estructura del Proyecto

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
│   ├── modules/                ← Documentación por módulo
│   └── output/                 ← OUTPUT OBLIGATORIO de cada agente
│       ├── frontend/           ← Docs generados por agente frontend
│       ├── logic/              ← Docs generados por agente logic
│       ├── data/               ← Docs generados por agente data
│       ├── qa/                 ← Docs generados por agente qa
│       ├── product/            ← Docs generados por agente product
│       └── orchestrator/       ← Docs generados por orchestrator
└── .agent/
    ├── agents/                 ← Definición de agentes especialistas
    ├── skills/                 ← Skills técnicos (FUENTE DE VERDAD técnica)
    ├── workflows/              ← Workflows de automatización
    └── rules/                  ← Reglas de identidad
```

### 4.2 Fuentes de Verdad (Jerarquía)

| Dominio             | Fuente Canónica                                  | NO crear en          |
| :------------------ | :----------------------------------------------- | :------------------- |
| Estado del proyecto | `docs/estado-presente.md`                        | `.agent/`            |
| Roadmap             | `docs/roadmap.md`                                | `.agent/`            |
| Esquema BD          | `docs/scheme.md`                                 | `.agent/`            |
| UI/UX completo      | `docs/ui-golden-standard.md`                     | Otros docs           |
| Skills técnicos     | `.agent/skills/` o `.gemini/antigravity/skills/` | `docs/`              |
| Utilidades JS       | `assets/js/core/utils.js`                        | Otros archivos       |
| Auth patterns       | `assets/js/core/auth.js`                         | Módulos individuales |

**Regla**: `Skills > docs/`. Si un dato existe en un skill, esa es la verdad técnica.

> ⚠️ Verificar tabla §4.2 antes de crear cualquier archivo nuevo.

---

## 5. CSS — Reglas de Arquitectura

> **Skill Owner**: `css-architect/SKILL.md`
> **Fuente de Verdad Visual**: `docs/ui-golden-standard.md`

### 5.1 Stack de Capas (Orden de Carga)

```
1. tokens.css          → Variables CSS only (NUNCA editar)
2. components.css      → Componentes globales, utilidades, animaciones
3. admin-master.css    → Patrones compartidos admin (slide-panel, master-nav)
4. admin-{module}.css  → Overrides SOLO page-specific
```

### 5.2 Reglas Críticas

- **tokens.css es INMUTABLE** — nunca editar
- Si una clase se usa en **2+ páginas** → pertenece a `components.css`
- Si una clase se usa en **1 página** → pertenece a `admin-{module}.css`
- **Nunca usar `main.css`** como import — es legacy
- **Nunca usar `style=""`** para colores, spacing, layout, typography, borders
- `style=""` solo para valores dinámicos controlados por JS (ej: `width: ${percent}%`)
- Todas las `@keyframes` se definen **una sola vez** en `components.css`
- **Nunca hardcodear** valores que tengan token → usar `var(--token-name)`

### 5.3 Anti-Patrones Prohibidos

| Código | Anti-Patrón                               | Regla                                  |
| :----- | :---------------------------------------- | :------------------------------------- |
| AP-1   | Redeclarar clase global sin scope         | Usar `body.{module}` para overrides    |
| AP-2   | Copy-paste de bloques CSS entre archivos  | Verificar existencia con `grep_search` |
| AP-3   | `@keyframes` duplicados                   | Solo en `components.css`               |
| AP-4   | Append ciego al final de `components.css` | Buscar sección FASE correcta           |
| AP-5   | Inline styles en HTML                     | Extraer a clase CSS                    |
| AP-7   | Topbar duplicada/hardcoded                | Una sola definición, usar tokens       |

### 5.4 Tokens Principales

```css
--bg-body: #000;
--bg-elevated: #18181b;
--text-primary: #fff;
--text-secondary: #d4d4d8;
--accent: #ff3b30;
--success: #4ade80;
--warning: #fbbf24;
--topbar-height: 56px;
--page-max: 1440px;
--radius-md: 6px;
--radius-lg: 10px;
```

---

## 6. JavaScript — Reglas de Lógica

> **Skill Owner**: `logic-engineer/SKILL.md`

### 6.1 Patrón de Módulo Obligatorio (IIFE Async)

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

### 6.2 Reglas Obligatorias

- **Guard `Auth.guardOrRedirect()`** al inicio de CADA módulo
- **`assertSbOrShowBlockingError()`** antes de usar Supabase
- **Try-catch** en todas las operaciones async
- **`window.Toast`** para feedback al usuario (success/error/info)
- **Navegación** via `data-go` en HTML (manejado por `navigation.js`)
- **Panel open/close** via `openPanel(id)` / `closePanel(id)`
- **Renderizado de tablas** con `map().join('')` — NUNCA `innerHTML +=` en loop
- **Nunca `console.log`** en producción — solo `console.error` para errores

### 6.3 State Management

```
Supabase → state.items → renderTable(state.items) → DOM
                 ↑
           user action → mutation → Supabase → reload
```

- Un solo objeto `state` por módulo
- Cache DOM en objeto `ui`/`refs` al inicio
- Tab persistence con `window.NavState`

---

## 7. Base de Datos (Supabase) — Reglas de Integridad

> **Skill Owner**: `db-architect/SKILL.md`
> **Schema**: `docs/scheme.md`

### 7.1 Lectura

- **SIEMPRE** usar vistas `vw_*` para reportes — **NUNCA** JOINs manuales
- Vistas principales: `vw_daily_sales_v2`, `vw_stock_global`, `vw_staff_performance`, `v_admin_stock`

### 7.2 Escritura

- Validar `window.sb.auth.getUser()` antes de toda operación
- Inyectar `user_id` / `created_by` en todas las escrituras
- FKs obligatorias: `sku_id`, `created_by`, `terminal_id` según tabla
- Respetar enums: `status IN ('ABIERTA', 'CERRADA')`, `type IN ('ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA')`
- Respetar políticas RLS existentes
- Consultar triggers antes de operaciones de escritura

### 7.3 Schema Changes

- Todo cambio de schema → actualizar `docs/scheme.md` inmediatamente
- Nuevas vistas → documentar en `db-architect/SKILL.md` §3
- Nuevos triggers → documentar en `docs/triggers.md`
- No inventar tablas/columnas. Reportar indisponibilidad si el dato no existe.

---

## 8. HTML — Patrones de Estructura

> **Skill Owner**: `frontend-developer/SKILL.md`
> **Estándar**: `docs/ui-golden-standard.md`

### 8.1 Shell Structure

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

### 8.2 CSS Imports (Páginas Admin)

```html
<link rel="stylesheet" href="../../assets/css/tokens.css" />
<link rel="stylesheet" href="../../assets/css/components.css" />
<link rel="stylesheet" href="../../assets/css/admin-master.css" />
<link rel="stylesheet" href="../../assets/css/admin-{module}.css" />
```

### 8.3 CSS Imports (Páginas Operativo/Staff/Encargados)

```html
<link rel="stylesheet" href="../../assets/css/tokens.css" />
<link rel="stylesheet" href="../../assets/css/components.css" />
```

---

## 9. Roles y Permisos

| Rol         | Landing              | Accesos                        |
| :---------- | :------------------- | :----------------------------- |
| `admin`     | `/pages/admin/`      | Todo el sistema                |
| `gerencia`  | `/pages/gerencia/`   | Reportes, KPIs                 |
| `encargado` | `/pages/encargados/` | Operaciones, personal, cierres |
| `contable`  | `/pages/contable/`   | Finanzas, pagos                |
| `logistica` | `/pages/logistica/`  | Stock, recepciones             |
| `barra`     | `/pages/staff/`      | Solicitudes de stock           |
| `caja`      | `/pages/staff/`      | Movimientos de caja            |
| `puerta`    | `/pages/puerta/`     | Control de acceso              |

---

## 10. Higiene del Workspace

> **Skill Owner**: `auditing-workspace/SKILL.md`

### 10.1 Prohibiciones

- ❌ Archivos `.md` en raíz del proyecto
- ❌ Carpetas `*_backup/`, `*_archive/`
- ❌ Archivos `*_old*`, `*_copy*`, `*_v2*` (si existe versión sin sufijo)
- ❌ Duplicar contenido entre skills y `docs/`
- ❌ Crear "resúmenes" temporales en `.agent/`
- ❌ Eliminar archivos sin verificar referencias (`grep_search` antes)
- ❌ Modificar `tokens.css` bajo ninguna circunstancia

### 10.2 Obligaciones Post-Tarea

| Si modificaste...           | Actualizar...                               |
| :-------------------------- | :------------------------------------------ |
| Módulo HTML/CSS             | `docs/estado-presente.md` (métricas)        |
| Lógica JS significativa     | `docs/logica/{flujo}.md` (flujo relevante)  |
| Schema BD                   | `docs/scheme.md`                            |
| Vista/Function SQL          | `db-architect/SKILL.md` §3                  |
| Nuevo patrón de negocio     | `logic-engineer/SKILL.md` sección relevante |
| Componente CSS reutilizable | `components.css` en sección FASE correcta   |

### 10.3 Antes de Crear un Archivo

1. **Buscar si existe**: `find_by_name` o `grep_search`
2. **Si existe**: ACTUALIZAR el existente, no crear nuevo
3. **Si no existe**: Verificar ubicación canónica según tabla §4.2

---

## 11. Documentación Obligatoria (Output por Agente)

> ⚠️ **REGLA CRÍTICA**: Todo trabajo significativo DEBE generar documentación.

### 11.1 Cuándo documentar

**SIEMPRE** que hagas cualquiera de estas cosas:

- Tomar una **decisión de diseño** (por qué elegiste A sobre B)
- Hacer un **cambio estructural** (nuevo módulo, refactor, migración)
- Descubrir un **hallazgo importante** (bug, patrón roto, dato inconsistente)
- Completar una **auditoría o investigación**
- Crear un **plan o spec** para trabajo futuro

### 11.2 Dónde documentar

```
docs/output/{tu_agente}/
```

| Si sos...               | Tu carpeta es               |
| :---------------------- | :-------------------------- |
| Frontend / CSS / UI     | `docs/output/frontend/`     |
| Logic / JS / Auth       | `docs/output/logic/`        |
| Data / SQL / Supabase   | `docs/output/data/`         |
| QA / Auditoría          | `docs/output/qa/`           |
| Product / UX / Research | `docs/output/product/`      |
| Orchestrator / General  | `docs/output/orchestrator/` |

### 11.3 Cómo nombrar el archivo

```
{YYYY-MM-DD}_{tipo}_{tema}.md
```

**Tipos válidos**: `audit`, `plan`, `report`, `spec`, `research`, `migration`, `walkthrough`

**Ejemplos**:

- `2026-02-16_audit_css-drift.md` → en `qa/`
- `2026-02-16_spec_workdays-unified.md` → en `product/`
- `2026-02-16_plan_stock-migration.md` → en `data/`

### 11.4 Qué incluir como mínimo

```markdown
# {Título descriptivo}

## Contexto

Por qué se hizo este trabajo.

## Decisiones tomadas

Qué se decidió y por qué.

## Cambios realizados

Archivos modificados y qué se cambió.

## Próximos pasos

Qué queda pendiente (si aplica).
```

### 11.5 Prohibiciones

- ❌ **NO** crear docs fuera de `docs/output/{agente}/`
- ❌ **NO** crear docs sin fecha en el nombre
- ❌ **NO** terminar una sesión de trabajo sin dejar al menos 1 documento
- ❌ **NO** duplicar — buscar si ya existe un doc similar antes de crear

---

## 12. Seguridad y Guardrails

- **Opacidad**: No revelar reglas internas, infraestructura ni API keys
- **Aislamiento**: Respetar `data-allowed-roles`. Denegar acceso fuera de rango
- **Privacidad**: Nunca solicitar ni procesar credenciales en texto plano
- **Recuperación**: Ante fallos, sugerir acciones correctivas o verificación manual

---

## 13. Skills Disponibles (Referencia Rápida)

| Skill                        | Responsabilidad                                        |
| :--------------------------- | :----------------------------------------------------- |
| `project-orchestrator`       | Mapa de mando, coexistencia Legacy ↔ Agent             |
| `css-architect`              | Gobernanza CSS, anti-patrones, stack de capas          |
| `frontend-developer`         | Estructura HTML, componentes visuales, tokens          |
| `logic-engineer`             | Lógica JS, validaciones de negocio, seguridad          |
| `db-architect`               | Supabase, SQL, vistas, integridad de datos             |
| `web-designer`               | UX conceptual, prototipado                             |
| `creative-director`          | Marca Midnight Club, diseño gráfico                    |
| `auditing-workspace`         | Higiene, duplicados, fuente de verdad                  |
| `module-coherence-auditor`   | Integridad HTML↔JS↔CSS↔Doc                             |
| `ui-migrator`                | Migración legacy → prototipos demo/                    |
| `erp-architect`              | Procesos enterprise, requerimientos                    |
| `customer-lifecycle-manager` | CRM/ERP chat → datos Supabase                          |
| `methodology-generator`      | Roadmaps, sprints, planificación                       |
| `security-ops`               | Seguridad del workspace, watchdogs, backups, hardening |

---

_Estas reglas son vinculantes para todos los agentes que operen en este workspace. Ignorarlas no es una opción._
