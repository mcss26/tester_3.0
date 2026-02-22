# Contexto: index
Generado: 2026-02-22 14:13 | Topic: `index`

> Este archivo contiene todo el contexto relevante sobre **index**.
> Pegalo al inicio de una conversacion para que el agente arranque informado.

## 1. Knowledge Items (4 encontrados)

### Infrastructure and Developer Tooling
Patterns and configurations for the development ecosystem, including third-party integrations (Figma, Supabase MCP), environment setups, local serving protocols, and production migration workflows for the Antigravity project.

#### Artefacto: development\local_serving_protocol.md
```

### URL Mapping
Once the server is running (usually on `http://127.0.0.1:8080`), modules can be accessed at:
- **Admin**: `http://127.0.0.1:8080/pages/admin/admin-index.html`
- **Solicitudes**: `http://127.0.0.1:8080/pages/admin/admin-solicitudes.html`
- **Stock**: `http://127.0.0.1:8080/pages/admin/admin-central-stock.html`
```

#### Artefacto: integrations\figma_integration.md
```
- **Workflow**: Human-guided. The agent receives files via the conversation.

## Security Protocols (CRITICAL)
- **Token Handling**: Personal Access Tokens (PAT) must **NEVER** be committed to the repository (e.g., in `config.js` or `INDEX.md`).
- **Revocation**: If a token is accidentally shared in a conversation log, it must be revoked immediately via Figma User Settings > Personal access tokens.
- **Storage**: Tokens should either be provided per-session by the user or stored in a secure local environment variable accessible to the agent runtime.
```

### Midnight Club Frontend Architecture
Technical specification and implementation patterns for the Midnight Club frontend. Covers the 'Controlled Static Mapping' pattern, staggered fade-in visual transitions, .ilike() Supabase query fixes, secure authentication flows, and 'Content Flash Protection'.

#### Artefacto: overview.md
```

1. **Hybrid SSR/Client-Side Hydration**: HTML pages are served static, then "hydrated" with live data from Supabase for critical components (Hero images, Countdown, Tickets).
2. **Controlled Static Mapping**: UI elements (Cards) are hardcoded in groups (e.g., 3 slots) and mapped to database entries via specific keys. This provides maximum stability and predictability while allowing data updates without code changes. Full dynamic rendering was explored but discarded for production stability.
3. **Shared UI Engine**: A central module (`shared-ui.js`) manages the heavy lifting for Authentication, Component Sync (`syncDynamicCards`), and Timers across all frontend pages (`index`, `accesos`, `members-only`).
## Key Files
- `assets/js/shared-ui.js`: The "brain" of the frontend. Contains `syncDynamicCards`, `setupAuthUI`, and `initCountdown`.
```

#### Artefacto: implementation\countdown_logic.md
```
# Countdown Logic

The countdown timer on the homepage (`index.html`) is dynamic and tied to the `events` table via `site_config`.
## Logic Flow
```

#### Artefacto: implementation\dynamic_sync_pattern.md
```
  });

  // 5. Staggered Fade-In (100ms delay per item)
  activeCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('is-visible');
    }, index * 100);
}
```
```

#### Artefacto: implementation\hero_component_specification.md
```

## 1. Technical Structure
The Hero is not a simple image container but a multi-layered stack defined in `index.html` and `layout.css`:
```html
<!-- Background Layer -->
Before committing a new `hero-optimized.jpg`, it must be validated against the `mc-main-logo` and `mc-brand-header` transparency in the test dashboard to ensure no legibility regressions occur.
---
*Verified: Feb 6, 2026 - Documented from layout.css/index.html and hero-test.html audit.*
```

### UI/UX Golden Standard and Remediation Phases
Verified UI/UX Golden Standard framework covering typography, hierarchy, interactions, responsiveness, accessibility (Phase 5), and unification strategy. Includes 10-phase CSS architecture, technical implementation patterns (HTML/JS/Dialogs/Topbar), and successful remediation reports for admin-herramientas and admin-solicitudes.

#### Artefacto: implementation\topbar_dropdown_pattern.md
```
<header class="topbar">
    <!-- Left: Navigation context -->
    <nav class="breadcrumb topbar-start">
        <a href="./admin-index.html" class="breadcrumb-item breadcrumb-link">AdministraciÃ³n</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item current">MÃ³dulo</span>
    </nav>
.topbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: var(--topbar-height);
  display: grid;
  grid-template-columns: 1fr auto 1fr;

## 5. Best Practices
- **CSS Synchronization**: Ensure the module links a stylesheet containing the FASE 1-10 rules for the Topbar.
- **Z-Index**: Always keep the Topbar at `z-index: 100` or higher to ensure it floats above data tables and charts.
- **Search Shortcuts**: Support `âŒ˜K` or `/` for focusing the `global-search` input.
- **Click-Outside Handle**: Use the `e.stopPropagation()` and document listeners to manage menu lifetimes.
```

### Workspace Governance and Auditing
Rules and standards for maintaining repository hygiene, canonical document locations, 'Source of Truth' hierarchy, and agent skill lifecycle protocols (Genesis & Synchronization) for the project.

#### Artefacto: governance_standard.md
```
| **Project State**       | `docs/estado-presente.md`                   |
| **Screen Map**          | `docs/screen-map.md`                        |
| **Database Schema**     | `docs/scheme.md`                            |
| **Documentation Index** | `docs/INDEX.md`                             |
| **UI/UX Standards**     | `docs/ui-golden-standard.md`                |
| **CSS Tokens**          | `assets/css/tokens.css`                     |
| **Frontend Rules**      | `.agent/skills/frontend-developer/SKILL.md` |
```

## 2. Codigo fuente (19 archivos)

- `pages\admin\admin-index.html` (5.767 bytes, mod: 2026-02-22 04:19)
- `pages\admin\qr\index.html` (6.336 bytes, mod: 2026-02-22 01:29)
- `pages\encargados\encargado-barra-index.html` (4.815 bytes, mod: 2026-02-22 01:29)
- `pages\encargados\encargado-caja-index.html` (4.165 bytes, mod: 2026-02-22 01:29)
- `pages\logistica\logistica-index.html` (4.412 bytes, mod: 2026-02-22 03:19)
- `pages\operativo\operativo-index.html` (5.845 bytes, mod: 2026-02-22 07:50)
- `pages\prototypes\lab-balance-semanal\index.html` (8.819 bytes, mod: 2026-02-22 01:29)
- `pages\prototypes\lab-workdays\index.html` (33.575 bytes, mod: 2026-02-22 01:29)
- `pages\prototypes\lab-workdays-night\index.html` (15.023 bytes, mod: 2026-02-22 01:29)
- `pages\prototypes\test-dropdown\index.html` (3.511 bytes, mod: 2026-02-22 01:51)
- `pages\staff\staff-barra-index.html` (4.623 bytes, mod: 2026-02-22 06:24)
- `pages\staff\staff-caja-index.html` (11.017 bytes, mod: 2026-02-22 04:34)
- `assets\js\modules\admin\admin-index.js` (9.495 bytes, mod: 2026-02-22 11:13)
- `assets\js\modules\encargados\encargado-barra-index.js` (8.614 bytes, mod: 2026-02-22 03:16)
- `assets\js\modules\encargados\encargado-caja-index.js` (4.616 bytes, mod: 2026-02-22 03:18)
- `assets\js\modules\logistica\logistica-index.js` (3.162 bytes, mod: 2026-02-22 10:28)
- `assets\js\modules\operativo\operativo-index.js` (4.328 bytes, mod: 2026-02-22 11:13)
- `assets\js\modules\staff\staff-caja-index.js` (19.252 bytes, mod: 2026-02-19 21:40)
- `assets\css\pages\admin-index.css` (6.763 bytes, mod: 2026-02-08 03:00)

### admin-index.js - Analisis
**Funciones:** `loadUserProfile``, ``loadSystemStatus``, ``initQrWidget``, ``fetchQrCount``, ``initMcoQrWidget``, ``fetchMcoStats``, ``updateModuleVisibility``, ``initTabs`
**Tablas Supabase:** `profiles``, ``qr_codes`

### encargado-barra-index.js - Analisis
**Funciones:** `loadWorkdayAndRules``, ``enableLink``, ``disableLink`
**Tablas Supabase:** `profiles``, ``vw_supplier_orders_encargado`

### encargado-caja-index.js - Analisis
**Funciones:** `enableLink``, ``disableLink`
**Tablas Supabase:** `profiles`

### logistica-index.js - Analisis

### operativo-index.js - Analisis
**Funciones:** `initMcoQrWidget``, ``fetchMcoStats`
**Tablas Supabase:** `qr_codes`

### staff-caja-index.js - Analisis
**Funciones:** `renderConvocationCard``, ``handleConfirmConvocation``, ``loadConvocations``, ``loadCurrentWorkDay``, ``checkForAssignment``, ``updateTimeline``, ``renderDashboard``, ``initSignaturePad``, ``getPos``, ``start``, ``move``, ``end``, ``clearSignature``, ``resizeCanvas``, ``handleSubmitClosing``, ``startAssignmentWatcher``, ``loadUserProfile`
**Tablas Supabase:** `cash_closings``, ``closing_terminals``, ``profiles``, ``staff_convocations``, ``work_days`

## 3. Documentacion (22 archivos)

- `docs\00-source-of-truth\db-schema.md`
- `docs\00-source-of-truth\project-status.md`
- `docs\01-design-system\master-design-spec.md`
- `docs\01-design-system\audit-and-prompts\audit.md`
- `docs\01-design-system\audit-and-prompts\archive\CHANGELOG.md`
- `docs\01-design-system\audit-and-prompts\prompts\frontend-custom-dropdown.md`
- `docs\01-design-system\audit-and-prompts\prompts\PROMPT-frontend.md`
- `docs\01-design-system\audit-and-prompts\prompts\PROMPT-js-audit.md`
- `docs\01-design-system\audit-and-prompts\reports\REPORT-js-db-audit.md`
- `docs\01-design-system\audit-and-prompts\reports\REPORT-resource-analysis-css.md`
- `docs\01-design-system\pages\admin-workdays.md`
- `docs\02-ui-ux\ui-golden-standard.md`
- `docs\02-ui-ux\lighthouse\admin-index\README.md`
- `docs\04-operations\release-pipeline.md`
- `docs\80-ephemeral\agent-logs\css-drift-report.md`
- `docs\80-ephemeral\agent-logs\docs-sync-report.md`
- `docs\80-ephemeral\agent-logs\jsdoc-coverage.md`
- `docs\80-ephemeral\agent-logs\refactor-plan.md`
- `docs\80-ephemeral\agent-logs\wiremap.md`
- `docs\80-ephemeral\agent-logs\orchestrator\prompts\ux-state-brief.md`
- `docs\80-ephemeral\agent-logs\qa\context-ui.md`
- `docs\80-ephemeral\agent-logs\visual-audit\visual-audit-report.md`

## 4. Schema
scheme.md no encontrado.

## 5. Git History

### Commits que mencionan 'index'
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup
- e03b54c feat(T1.1): connect 3 orphan admin pages to admin-index nav

### Commits que tocan archivos *index*
- 0f66978 docs
- f2f59c1 css
- 01acf26 test
- 658e294 feat(security): RLS P0+P1 hardening ÔÇö 10 migrations, 19 tables refined
- e8b69c8 test
- 98ca53c css
- ea06bae refactor
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup
- 32949aa l
- 7e906ac s

## 6. Reportes previos (0 encontrados)

No se encontraron reportes previos sobre 'index'.

## 7. Conversaciones previas (0 encontradas)

No se encontraron conversaciones recientes sobre 'index'.
