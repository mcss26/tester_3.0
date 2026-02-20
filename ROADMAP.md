# ✦ Plan Maestro Unificado: Rediseño UI & Resiliencia (Refactoring UI)

> **Última actualización:** 2026-02-19
> **Estado de componentes:** [truth.md](docs/_generated/orchestrator/truth.md) (P0 ✅ 8/8 | P1-P3 pendientes)

Este documento es la fuente de verdad definitiva para la transformación del sistema visual Swiss/Zinc. Integra protocolos de blindaje JS, validación bloqueante y reestructuración de rutas limpias.

---

## 1. Objetivos Estratégicos y Alcance

### Objetivos Principales

1.  **Estética Premium SaaS:** Elevar la interfaz a nivel corporativo mediante jerarquía visual, sistema de 8pt y profundidad (sombras multinivel) sin dependencias externas.
2.  **Arquitectura de "Ruta Limpia":** Consolidar 15+ archivos fragmentados en una estructura modular y atómica para optimizar el rendimiento y el contexto de desarrollo.
3.  **Resiliencia y Blindaje:** Garantizar integridad total (0 roturas) en los mapeos JS-to-DOM y habilitar monitoreo proactivo de errores de UI.

### Alcance (Scope)

- **In-Scope:** Archivos en `assets/css/`, módulos JS críticos (`admin`, `staff`, `operativo`), y archivos HTML en `pages/`.
- **Out-of-Scope:** Lógica de backend (SQL/RPC), librerías externas (Chart.js) y cambios en flujos de datos de Supabase.

---

## 2. Mapa de Arquitectura "Ruta Limpia" (Target)

Se migrará de un modelo fragmentado a uno organizado por responsabilidades:

```text
assets/css/
├── foundations/         # La "Verdad" del Diseño
│   ├── tokens.css       # Variables: Zinc Palette, Spacing (8pt), Shadows, Z-Index.
│   └── reset.css        # Normalización y estilos globales.
│
├── layout/              # Estructura del "Shell"
│   ├── swiss-shell.css  # Topbar, Sidebar, Grids (Reemplaza swiss-style.css).
│   └── navigation.css   # Menús, Breadcrumbs, Tabs.
│
├── components/          # Átomos e Iones (Atómicos)
│   ├── buttons.css      # Variantes de botones y estados.
│   ├── forms.css        # Inputs, Selects, Dropboxes, Toggles.
│   ├── cards.css        # KPI Cards, Contenedores, Modales.
│   ├── data-viz.css     # Tablas, Badges, Status Indicators.
│   └── feedback.css     # Toasts, Spinners, Empty States, Skeletons.
│
└── .archive/            # Depósito de deuda técnica (NO cargar en HTML)
    ├── admin-central-stock.css
    ├── launcher.css
    └── ... (Archivos consolidados)
```

---

## 3. Protocolo de Resiliencia y Validación Bloqueante

### Reglas de Operación (Anti-Error)

- **Atomicidad:** Cada cambio se divide en micro-pasos. No se avanza si el validador retorna `false`.
- **Blindaje JS (Safe-List):** Se prohíbe renombrar IDs o clases funcionales detectadas en la auditoría JS.
- **Snapshots:** Lectura previa obligatoria de cada archivo antes de aplicar cambios.
- **Rollback Inmediato:** Si el Gatekeeper detecta fallo, se revierte el archivo a su estado previo al micro-paso.

### Motor de Validación (Phase Gatekeeper)

| Fase              | Check de Validación      | Lógica de Bloqueo                                  | Criterio de Éxito     |
| :---------------- | :----------------------- | :------------------------------------------------- | :-------------------- |
| **1. AUDIT**      | `verifySafeList`         | ¿Falta algún ID crítico en el HTML?                | `missingIDs === 0`    |
| **2. TOKENS**     | `verifyFoundations`      | ¿Hay `px` hardcoded fuera de `tokens.css`?         | `hardcodedPx === 0`   |
| **3. ATOMIC**     | `scripts/audit-links.js` | ¿Hay errores 404 en los nuevos paths?              | `brokenLinks === 0`   |
| **4. RESILIENCE** | `checkErrorLogging`      | ¿Hay bloques `catch` silenciosos en el JS migrado? | `silentCatches === 0` |

---

## 4. Cronograma de Ejecución (Fases Detalladas)

### Fase 1: Blindaje y Auditoría (La Muralla) - ✅ P0 COMPLETO / ⏳ P1+ EN PROGRESO

- **Acción:** Mapear el 100% de `getElementById` y `querySelector` en módulos Tier 0.
- **Estado Actual:** P0 (8 componentes universales) verificados en `swiss-style.css`. P1 (10 componentes) pendiente.
- **Resultado:** `docs/architecture/safe-list-selectors.json` generado. `truth.md` es el tracker canónico.

### Fase 2: Cimientos (Foundations) - 🔥 CRÍTICA

- **Acción:** Refactor de `tokens.css`. Sistema 8pt, Zinc Palette WCAG y Shadows SaaS.
- **Validación:** No existen estilos computados que no usen variables de tokens.

### Fase 3: Consolidación Atómica - ⚡ ALTA

- **Acción:** Creación de carpetas y migración de estilos de `admin-*.css` a `components/`.
- **Resultado:** `buttons.css`, `forms.css`, `cards.css` y `data-viz.css` funcionales.

### Fase 4: Re-mapeo Global y Limpieza - ⚡ ALTA

- **Acción:** Actualización masiva de `<link>` en HTML. Movimiento de archivos a `.archive/`.
- **Validación:** Ejecución de `audit-links.js` con éxito.

### Fase 5: Refactoring UI (Polish) - 📈 MEDIA

- **Acción:** Tratamiento de profundidad, refinamiento tipográfico y micro-interacciones.
- **Validación:** Cumplimiento de jerarquía visual en `components_catalog.html`.

### Fase 6: Resiliencia y Monitoreo - 📈 MEDIA

- **Acción:** Centralized Logging y Fallback Components (Circuit Breakers).
- **Validación:** 100% de los errores de red muestran feedback visual proactivo.

---

## 5. Métricas de Éxito y Entregables

- **Integridad:** 0 Errores de Referencia en consola post-migración.
- **Rendimiento:** Reducción del 20% en tiempo de renderizado (FCP).
- **Entregable 1:** `docs/architecture/ui-golden-standard.md` (Documentación del Sistema).
- **Entregable 2:** Carpeta `assets/css/` limpia y modularizada.
- **Entregable 3:** `docs/_generated/orchestrator/CHANGELOG.md` actualizado.

---

## 6. Planes Relacionados (Otros Dominios)

| Plan                  | Dominio                                       | Ubicación                                        |
| :-------------------- | :-------------------------------------------- | :----------------------------------------------- |
| PLAN_PRODUCTION_READY | Security, CI/CD, Deploy, Observabilidad       | `docs/codex/PLAN_PRODUCTION_READY.md`            |
| Workdays Roadmap      | Módulo Workdays (8 sprints, backend+frontend) | `docs/migration/artifacts/roadmap_production.md` |

> [!NOTE]
> Estos planes cubren dominios **fuera del scope** de este ROADMAP (que es solo UI/CSS). Se abordarán en Fase 2 de consolidación.
