# Contexto: config
Generado: 2026-02-22 14:15 | Topic: `config`

> Este archivo contiene todo el contexto relevante sobre **config**.
> Pegalo al inicio de una conversacion para que el agente arranque informado.

## 1. Knowledge Items (5 encontrados)

### Infrastructure and Developer Tooling
Patterns and configurations for the development ecosystem, including third-party integrations (Figma, Supabase MCP), environment setups, local serving protocols, and production migration workflows for the Antigravity project.

#### Artefacto: overview.md
```
# Infrastructure and Tooling Overview

This Knowledge Item covers the tools and environment configurations used by the Antigravity agent ecosystem to maintain the `tester_3.0` project.
## Core Pillars
```

#### Artefacto: development\local_serving_protocol.md
```

## Verification Workflow
When an agent is asked to "open local server" or "verify visually":
1. **Host Check**: Verify `package.json` for scripts (Reference: zero-config finding).
2. **Server Start**: Execute `npx http-server .` in the background.
3. **Browser Verification**: Use `browser_subagent` to navigate to the module URL.
    - **Handle Redirection**: Be prepared to handle logic redirects (e.g., to `login.html`). Clicking "Ingresar" with pre-filled dev credentials is the standard bypass.
    - **Logging**: Capture console logs to ensure zero runtime errors.
4. **Reporting**: Inform the user of the local URL and the verification status (success/failure).
## Technical Note: Zero-Config
This "Zero-Config" approach ensures that the project remains a clean, static-first repository without heavy build-system overhead, relying on standard browser behaviors and modern JS modules.
```

#### Artefacto: integrations\figma_integration.md
```
### 1. Figma MCP Server
- **Description**: Connecting to a Figma Model Context Protocol server.
- **Workflow**: Allows agents to browse files, inspect layers, and export nodes directly using tool calls.
- **Setup**: Requires a `Personal Access Token` and the configuration of the MCP runtime.

### 2. Direct API Usage
- **Description**: Calling Figma's REST API using basic fetch/axios patterns.
- **Workflow**: Human-guided. The agent receives files via the conversation.
## Security Protocols (CRITICAL)
- **Token Handling**: Personal Access Tokens (PAT) must **NEVER** be committed to the repository (e.g., in `config.js` or `INDEX.md`).
- **Revocation**: If a token is accidentally shared in a conversation log, it must be revoked immediately via Figma User Settings > Personal access tokens.
- **Storage**: Tokens should either be provided per-session by the user or stored in a secure local environment variable accessible to the agent runtime.
```

### Midnight Club Administrative Tools
Documentation of the administrative and operative tools used for managing Midnight Club, including site configuration, stock, and workday planning. Enforces the 'Edit-Not-Create' policy for site_config to maintain synchronicity with the frontend's Controlled Static Mapping.

#### Artefacto: overview.md
```

## Core Responsibilities
1. **Workday Management**: Planning and monitoring of event days, staff payroll, and operational status.
2. **Site Configuration**: Managing the `site_config` table which drives content on the public frontend (Pricing, Access links, Hero images).
3. **Stock & Solicitudes**: Managing inventory and internal requests.
4. **Reporting**: Extraction and visualization of operational data (e.g., QR Ticket volume).
## Key Management Patterns
### Restricted site_config Management
To maintain the stability of the [Controlled Static Mapping](file:///C:/Users/siste/.gemini/antigravity/knowledge/midnight_club_frontend_architecture/artifacts/implementation/dynamic_sync_pattern.md) used in the public frontend, the administrative tools follow a restriction policy:
- **Edit Only**: Admins are encouraged to edit existing entries (Name, Description, URL, Price).
- **No New Keys**: Creating new keys is restricted or discouraged because the public frontend requires proactive code mapping for any new card/slot.
```

#### Artefacto: implementation\qr_report_temp.md
```

## Dependencies
- `@supabase/supabase-js@2`
- `assets/js/core/config.js`
- `assets/js/core/supabase-client.js`
```

#### Artefacto: implementation\site_config_management.md
```
# site_config Management Pattern

The `site_config` table in Supabase acts as a Single Source of Truth for shared state between the administrative backoffice and the public frontend.
## The Synchronization Chain
1. **Database**: `site_config` stores keys (e.g., `passline_acceso__0200`).
2. **Backoffice**: `operativo-workday.js` allows editing the `name`, `description`, `url`, and `is_active` status of these keys.
3. **Public Frontend**: `shared-ui.js` (`syncDynamicCards`) binds these keys to specifically formatted HTML IDs (e.g., `card_0000`).
| **Members** | `passline_members_only__vip` | `card_mem_vip` |
## Maintenance History: DB Cleanup (Feb 6, 2026)
A manual cleanup of the `site_config` table was performed to ensure 100% state consistency:
1. **Renaming**: `passline_members__0200__sujeto_a_capacidad` was renamed to `passline_members__capacity` to match the frontend mapping.
2. **Initialization**: The `passline_acceso__extra` key was created as an inactive placeholder.
3. **Deactivation**: All legacy/obsolete keys (e.g., `passline_accesos_200`, `passline_spoty`) were set to `is_active = false` to prevent data pollution in other possible dynamic views.
```

### Midnight Club Frontend Architecture
Technical specification and implementation patterns for the Midnight Club frontend. Covers the 'Controlled Static Mapping' pattern, staggered fade-in visual transitions, .ilike() Supabase query fixes, secure authentication flows, and 'Content Flash Protection'.

#### Artefacto: overview.md
```
# Frontend Architecture Overview

The Midnight Club frontend (Public and Members-only zones) operates on a "Dynamic Configuration" model. Unlike the Admin zone which is strictly data-driven with heavy tables, the frontend is designed for high aesthetic fidelity and low friction, using Supabase as a lightweight configuration engine.
## Core Pillars
## Key Files
- `assets/js/shared-ui.js`: The "brain" of the frontend. Contains `syncDynamicCards`, `setupAuthUI`, and `initCountdown`.
- `assets/js/global.js`: Initializes the Supabase `client` and session management.
- `assets/js/config.js`: Centralized configuration (Supabase URL/Key, Function endpoints).
## Data Dependency
The system heavily relies on the `site_config` table in Supabase.
- **Columns**: `key` (String), `value` (String/URL), `name` (Label), `description`, `is_active` (Boolean).
- **Behavior**: If `is_active` is false, the frontend automatically applies "SOLD OUT" states and disables links.
```

#### Artefacto: implementation\countdown_logic.md
```
# Countdown Logic

The countdown timer on the homepage (`index.html`) is dynamic and tied to the `events` table via `site_config`.
## Logic Flow
1. **Get Next Event ID**: The script lookups the `url` value for the key `next_event_id` in `site_config`.
2. **Fetch Event Data**: It then queries the `events` table for the record where `id` matches that URL/ID.
3. **Parse Time**: It combines `event.date` and `event.event_time` (defaulting to 23:59:00 if missing).
4. **Calculations**: It calculates the difference between `now` and the event date.
## States
- **Normal**: Displays Days, Hours, Minutes, Seconds.
- **No Event**: If the config is missing or the event doesn't exist, it displays `--` and applies the `.no-event` class (hiding the countdown or showing a placeholder).
- **Live**: If the difference is `<= 0`, it displays `00:00:00:00`, changes the label to `EN VIVO`, and applies the `.is-live` class.
## Internal Sync
```

#### Artefacto: implementation\dynamic_sync_pattern.md
```
The Midnight Club frontend uses a "Hydration" pattern where static HTML elements are updated with live data from Supabase.

## 1. Controlled Static Mapping (Production Standard)
The `syncDynamicCards` function is the primary mechanism. It maps specific, hardcoded HTML IDs to database `keys` in `site_config`. This ensures the UI remains stable and exactly as designed, while allowing pricing and URLs to be managed via the DB.
### Implementation (`shared-ui.js`)
```javascript
export async function syncDynamicCards(mapping) {
  // Use .select('*') or .ilike('key', ...) but never .like() (not a Supabase v2 method)
  const { data, error } = await client.from('site_config').select('*');
  if (error) { console.error("Error sincronizando cards:", error); return; }
  // 1. Initial State: Hide all mapped cards & remove visibility
  const activeCards = [];
  data.forEach(config => {
    const cardId = mapping[config.key];
    if (!cardId) return;
    const card = document.getElementById(cardId);
    if (!card) return;
    // 2. Handle State: Hide inactive entries
    if (config.is_active === false) {
      card.style.display = 'none';
      return;
    }
    // 3. Hydrate content
    const titleId = cardId.replace('card_', 'title_');
    const titleEl = document.getElementById(titleId);
    if (titleEl && config.name) titleEl.textContent = config.name;
    const detailsEl = card.querySelector('.mc-item-details');
    if (detailsEl && config.description) {
      detailsEl.textContent = '';
      const span = document.createElement('span');
      span.textContent = config.description;
      detailsEl.appendChild(span);
    if (config.url && config.url.length > 5) {
      const link = card.querySelector('a');
      if (link) link.href = config.url;
    // 4. Queue for animated appearance
## Maintenance & Risks (Controlled Mapping)
- **Key Synchronicity**: The database keys (e.g., `passline_acceso__0200`) must match the object passed to `syncDynamicCards`.
- **Method Logic**: Always use `.ilike()` or `.eq()` when querying Supabase. The legacy `.like()` method is **invalid** in the current Supabase JS client and will cause silent failures.
- **Backoffice Restrictions**: To prevent broken mappings, the administrative backoffice is restricted from creating *new* keys in `site_config`.
- **ID Stability**: The pattern relies on stable HTML IDs (e.g., `card_0000`). Modifying the HTML structure without updating the JS mapping will break the hydration.
---
```

#### Artefacto: implementation\hero_component_specification.md
```

## 5. Interactive Calibration (Visual Testing)
To facilitate rapid iteration and high-precision tuning of the visual aesthetic, a dedicated test environment (`hero-test.html`) is utilized. This tool allows for real-time comparison of assets and filter configurations.
### Calibration Parameters
- **Asset Swapping**: Comparative testing of original vs. new optimized assets (e.g., "Cherry Lips" artwork).
```

#### Artefacto: implementation\production_vs_local.md
```
## Environment Checklists

### Local Development
- Connects to the **current active Supabase project** (checked in `config.js`).
- Uses `renderDynamicCards` to populate containers.
- HTML contains empty generic containers (e.g., `#accesos-container`).
```

### UI/UX Golden Standard and Remediation Phases
Verified UI/UX Golden Standard framework covering typography, hierarchy, interactions, responsiveness, accessibility (Phase 5), and unification strategy. Includes 10-phase CSS architecture, technical implementation patterns (HTML/JS/Dialogs/Topbar), and successful remediation reports for admin-herramientas and admin-solicitudes.

#### Artefacto: verification\responsive_benchmarks.md
```
- **Benchmark**: No layout breaking or forced overflow on the outer wrapper.

### Chart Scaling
- **Verified Behavior**: Charts (Highcharts/ApexCharts) must have `width: 100% !important` and responsive height configurations.
- **Micro-interaction**: Legends and axes must remain readable at 768px.
### Filter Pills & Header
```

### Workspace Governance and Auditing
Rules and standards for maintaining repository hygiene, canonical document locations, 'Source of Truth' hierarchy, and agent skill lifecycle protocols (Genesis & Synchronization) for the project.

#### Artefacto: cleanup\log_2026_02_05.md
```
- **Current State**: `docs/estado-presente.md` (Update recommended in next audit).

## Audit Results
- **Root Directory**: âœ… No Markdown files remain in the root (except project configuration).
- **Duplicate Docs**: âœ… Obsolete backups and drafts removed.
- **Agent Hygiene**: âœ… Temporary scripts and artifacts cleared.
```

## 2. Codigo fuente (4 archivos)

- `pages\admin\admin-config.html` (11.089 bytes, mod: 2026-02-22 10:47)
- `assets\js\core\config.js` (686 bytes, mod: 2026-02-22 01:43)
- `assets\js\modules\admin\admin-config.js` (14.399 bytes, mod: 2026-02-22 11:07)
- `assets\css\admin-config.css` (1.829 bytes, mod: 2026-02-10 01:32)

### config.js - Analisis

### admin-config.js - Analisis
**Funciones:** `init``, ``bindEvents``, ``switchTab``, ``loadAllData``, ``renderTaxesTable``, ``handleTaxChange``, ``renderChannelsTable``, ``renderChannelInput``, ``handleChannelChange``, ``renderSkuTable``, ``handleSkuTypeChange``, ``bulkUpdateSkuType`
**Tablas Supabase:** `cost_config``, ``master_sku`

## 3. Documentacion (23 archivos)

- `docs\00-source-of-truth\backend-rpcs.md`
- `docs\00-source-of-truth\db-schema.md`
- `docs\00-source-of-truth\project-status.md`
- `docs\01-design-system\master-design-spec.md`
- `docs\01-design-system\audit-and-prompts\audit.md`
- `docs\01-design-system\audit-and-prompts\reports\REPORT-js-db-audit.md`
- `docs\02-ui-ux\ui-golden-standard.md`
- `docs\02-ui-ux\lighthouse\admin-config\README.md`
- `docs\02-ui-ux\lighthouse\admin-index\context.md`
- `docs\02-ui-ux\lighthouse\admin-workdays\context.md`
- `docs\03-business-logic\midnight-workflows.md`
- `docs\04-operations\release-pipeline.md`
- `docs\80-ephemeral\agent-logs\jsdoc-coverage.md`
- `docs\80-ephemeral\agent-logs\refactor-plan.md`
- `docs\80-ephemeral\agent-logs\wiremap.md`
- `docs\80-ephemeral\agent-logs\orchestrator\rls-audit-report.md`
- `docs\80-ephemeral\agent-logs\qa\context-system.md`
- `docs\80-ephemeral\agent-logs\qa\context-ui.md`
- `docs\80-ephemeral\agent-logs\visual-audit\visual-audit-report.md`
- `docs\output\qa\context-index.md`
- `docs\output\qa\context-pagos.md`
- `docs\output\qa\context-solicitudes.md`
- `docs\output\qa\context-workday.md`

## 4. Schema
scheme.md no encontrado.

## 5. Git History

### Commits que mencionan 'config'
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup
- 5a578a7 feat(T2.1): add audit_config to scheme.md

### Commits que tocan archivos *config*
- 0f66978 docs
- f2f59c1 css
- 658e294 feat(security): RLS P0+P1 hardening ÔÇö 10 migrations, 19 tables refined
- e8b69c8 test
- 98ca53c css
- ea06bae refactor
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup
- 32949aa l
- 680917e s
- dff408e lit

## 6. Reportes previos (4 encontrados)

- `docs\output\qa\context-index.md`
- `docs\output\qa\context-pagos.md`
- `docs\output\qa\context-solicitudes.md`
- `docs\output\qa\context-workday.md`

## 7. Conversaciones previas (0 encontradas)

No se encontraron conversaciones recientes sobre 'config'.
