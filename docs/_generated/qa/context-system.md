# Contexto: system
Generado: 2026-02-19 12:22 | Topic: `system`

> Este archivo contiene todo el contexto relevante sobre **system**.
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
4. **Reporting**: Inform the user of the local URL and the verification status (success/failure).

## Technical Note: Zero-Config
This "Zero-Config" approach ensures that the project remains a clean, static-first repository without heavy build-system overhead, relying on standard browser behaviors and modern JS modules.
```

#### Artefacto: integrations\figma_integration.md
```
# Figma Integration Strategy

The project utilizes Figma for visual design and brand identity. Several paths for integration are available to the Antigravity agent ecosystem.
## Integration Options
```

### Modern Design Philosophies (2026)
Comprehensive framework for design in 2026, focusing on Generation Z luxury visual language (Refined Maximalism, Neo-Brutalism, Y2K Hi-Fi), Integrated Design Systems (Engine vs Soul, Design Tokens), and Machine Experience (MX) for AI-compatibility.

#### Artefacto: operational_execution.md
```
# Integrated Design Systems & Operational Execution

## Operationalizing Identity
The design system manifests the brand's character through technical components and code.
## 1. Design Tokens Hierarchy
Tokens should follow a descriptive naming pattern to ensure scalability across teams:
```

#### Artefacto: overview.md
```
- **Philosophy**: Retro-futurism rooted in early internet nostalgia but rendered with high precision.
- **Key Traits**: Chrome/metallic finishes, liquid metal forms, pixelation/glitch art, and vibrant neon gradients (e.g., Cyber Lime, Brat Green).

## 2. The Integrated Design System (Engine vs. Soul)
In 2026, a distinction is made between **Brand Identity** ("The Soul") and the **Design System** ("The Engine").
| Variable | Brand Identity (Soul) | Design System (Engine) |
| :--- | :--- | :--- |
| **Objective** | Defining character and values. | Facilitating rapid, consistent delivery. |
| **Components** | Logos, mission, tone of voice. | UI components, design tokens, code. |
| **Audience** | Marketers, partners. | Designers, engineers, QA. |
### Design Tokens
Atomic infrastructure for design systems. Tokens (name-value pairs) represent design decisions (e.g., `primary-brand-color: #000000`). This abstraction allows global updates across all platforms (Web, iOS, Android) by changing a single variable.
## 3. Machine Experience (MX) Design
Brands no longer design solely for humans; they design for AI agents that crawl and interpret content.
```

### Midnight Club Brand Identity
Brand strategy, visual identity standards, and implementation patterns for Midnight Club. Defines the 'Luxury Urban' aesthetic, including the newly established 'Master Tape' VHS workflow for high-end social content and AI-video pipelines.

#### Artefacto: overview.md
```
The brand moves away from "dirty urban" or "messy Y2K" aesthetics toward a more refined, "Fashion House" approach. Visual elements are implemented directly in code (HTML/CSS/SVG) to ensure pixel perfection and scalability.

## Theoretical Framework
The brand's evolution is guided by the **Modern Design Philosophies (2026)** framework, incorporating concepts of *Refined Maximalism*, *MX Design*, and *Integrated Design Systems* to maintain relevance in the high-end Gen Z luxury sector.
## Brand Leadership
The project's visual and systemic evolution is led by the **Creative Director (Agent Zero)**, who serves as the brand architect, overseeing the transition from legacy assets to a modernized, code-driven identity system.
```

#### Artefacto: implementation\interactive_brand_guide.md
```
The brand guide is implemented as a single-page HTML document that serves as both a reference and a live demonstration of brand assets (SVG Logo, Colors, Typography, and Motion).

## CSS Design Tokens
The design system is powered by CSS variables defined in `:root`.
```css
:root {
```

#### Artefacto: implementation\premium_layout_system.md
```
# Premium Layout System: Technical Specification

## 1. Overview
The Premium Layout System provides a standardized grid for all Midnight Club social assets. It moves away from arbitrary placements toward a mathematically balanced zoning system that ensures high conversion without sacrificing luxury status.
## 2. Grid Proportions
- **Transition**: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)`.
## 4. Editorial Mode (Overlay Strategy)
For high-fashion assets where the hero image requires full bleeding (no segregated zones), the club applies the editorial overlay system:
- **Photo Treatment**: Full canvas (4:5 or 9:16). Grainy, analog, or high-contrast editorial photography (Saint Laurent / TYFD style).
- **Typography Overlay**:
    - **Logo**: Positioned in top-center or top-left. Maintaining high-contrast (usually white outline).
```

#### Artefacto: implementation\web_brand_execution.md
```
# Web Brand Execution Guidelines

While the [Premium Layout System](./premium_layout_system.md) focuses on social media formats (4:5/9:16), the Web Execution adapts these principles for the interactive, scrollable environment of the browser.
## 1. The "Luxury Urban" Web Aesthetic
The digital facade of Midnight Club relies on **Visual Weight** and **Depth**.
```

#### Artefacto: strategy\branding_guidelines.md
```
| **Acid Green** (Optional) | `#CCFF00` | Accents, "Live" indicators, Laser effects. |
| **Electric Blue** (Optional) | `#0033CC` | Rare accents, mood lighting. |

## 4. Logo System
The logo system maintains the brand's heritage of bold, outlined sans-serif typography while increasing geometric precision.
### V1: The Legacy (Refined)
- **Style:** Outlined, All Caps, Impact.
```

#### Artefacto: strategy\operational_execution.md
```
# Integrated Design Systems & Operational Execution

## Operationalizing Identity
The design system manifests the brand's character through technical components and code.
## 1. Design Tokens Hierarchy
Tokens should follow a descriptive naming pattern to ensure scalability:
```

#### Artefacto: strategy\philosophies_2026.md
```
- **Philosophy**: Retro-futurism rooted in early internet nostalgia but rendered with high precision.
- **Key Traits**: Chrome/metallic finishes, liquid metal forms, pixelation/glitch art, and vibrant neon gradients (e.g., Cyber Lime, Brat Green).

## 2. The Integrated Design System (Engine vs. Soul)
In 2026, a distinction is made between **Brand Identity** ("The Soul") and the **Design System** ("The Engine").
| Variable | Brand Identity (Soul) | Design System (Engine) |
| :--- | :--- | :--- |
| **Objective** | Defining character and values. | Facilitating rapid, consistent delivery. |
| **Components** | Logos, mission, tone of voice. | UI components, design tokens, code. |
```

#### Artefacto: strategy\social_and_print_standards.md
```
# Social & Print Conversion Standards

This document outlines the strategic and technical standards for high-performance visual communication, specifically tailored for the **Midnight Club** "Luxury Urban" ecosystem but applicable as a general high-conversion framework.
## 1. High-Conversion Philosophy (The KISS Mandate)
In a high-friction physical or digital environment, complexity reduces ROI. Every piece of collateral must follow the KISS (Keep It Simple & Strategic) mandate:
```

#### Artefacto: strategy\visual_language_system.md
```
# ðŸŒ‘ Midnight Club: Visual Language System (VLS 2026)

> **Status:** Living Document
> **Archetype:** The Ruler (Exclusivity) x The Rebel (Underground)
## 2. Visual Taxonomy (The Body)
### A. The Logo System
*   **Primary Mark:** `MIDNIGHT CLUB` (Custom SVG). Thick strokes, tight kerning, `stroke-linejoin: round`. Designed to look like a racing decal or a luxury fashion label.
*   **The Monogram:** `MC` (Intertwined). Used for avatars, app icons, and wristbands.
*   **Usage Rule:** The logo must always have breathing room. Never crowd it. It prefers to sit pure white on pure black.
### B. Typography: "The Voice"
We use a dual-system to balance readability and impact.
*   **Primary Display (The Shout):** `Outfit` (Weight: 800/900).
    *   *Role:* Headlines, Dates, Artist Names.
    *   *Treatment:* All Caps, Tight Tracking (-2%), Massive Scale.
*   **Secondary Utility (The Whisper):** `Space Mono` or `JetBrains Mono`.
    *   *Role:* Metadata (Time, Location, Price), Footer info.
    *   *Treatment:* Small caps, wide tracking (+2px), "System Error" vibe.
### C. Color Palette: "Chromatics of Night"
```

### Midnight Club Frontend Architecture
Technical specification and implementation patterns for the Midnight Club frontend. Covers the 'Controlled Static Mapping' pattern, staggered fade-in visual transitions, .ilike() Supabase query fixes, secure authentication flows, and 'Content Flash Protection'.

#### Artefacto: overview.md
```
- `assets/js/config.js`: Centralized configuration (Supabase URL/Key, Function endpoints).

## Data Dependency
The system heavily relies on the `site_config` table in Supabase.
- **Columns**: `key` (String), `value` (String/URL), `name` (Label), `description`, `is_active` (Boolean).
- **Behavior**: If `is_active` is false, the frontend automatically applies "SOLD OUT" states and disables links.
## Related Systems
- [Administrative Tools](file:///C:/Users/siste/.gemini/antigravity/knowledge/midnight_club_administrative_tools/artifacts/overview.md): Managing the data that drives this frontend.
```

#### Artefacto: implementation\authentication_system.md
```
# Authentication System

Midnight Club uses a centralized authentication UI handled by `shared-ui.js` and a custom Supabase Edge Function (`auth-member`).
The login UI is defined as a template string (`LOGIN_GATE_HTML`) in `shared-ui.js` and injected into `#mc-login-gate-container` via `setupAuthUI()`. This ensures the Login UI is consistent across all pages.
### 2. ID Formatting
The system automatically formats IDs (e.g., typing `1234` becomes `MC-1234`).
```javascript
if(inpId) inpId.addEventListener('input', function(e) {
  let val = this.value.toUpperCase();
```

#### Artefacto: implementation\production_vs_local.md
```
# Production vs Development Synchronicity

During the implementation of the Dynamic Rendering System (February 2026), a significant discrepancy was identified between the local development state and the production environment.
## The Incident
Despite a successful local implementation of `renderDynamicCards` and a database update in Supabase (FormulaMid project), the production site at `midnightclub.com.ar/accesos` continued to display stale, static content.
```

### UI/UX Golden Standard and Remediation Phases
Verified UI/UX Golden Standard framework covering typography, hierarchy, interactions, responsiveness, accessibility (Phase 5), and unification strategy. Includes 10-phase CSS architecture, technical implementation patterns (HTML/JS/Dialogs/Topbar), and successful remediation reports for admin-herramientas and admin-solicitudes.

#### Artefacto: overview.md
```
# Golden Standard Overview

The Golden Standard defines the visual and functional consistency for all admin modules in the `tester_3.0` project. It ensures a professional, high-performance "dark mode" experience designed for the Antigravity ecosystem.
## 1. Design Tokens
- **Zinc Palette**: Pure black backgrounds (`#000000`), white primary text, zinc/zinc-secondary for subtle elements.
- **FASE 4**: Filter bar and pills.
- **FASE 5**: Main table (Golden Standard).
- **FASE 6**: Chart section.
- **FASE 7**: Tabs system.
- **FASE 8**: Modals and panels.
- **FASE 9**: Buttons and actions.
- **FASE 10**: Micro-interactions and polish.
```

#### Artefacto: implementation\dashboard_header_pattern.md
```

    <!-- Right: Contextual Actions -->
    <div class="row-flex align-center gap-sm">
        <span class="system-status-pill status-open topbar-pill topbar-pill-quiet">ESTADO</span>
        <button class="btn-icon btn-icon-flat" id="btn-refresh" title="Refrescar">â†»</button>
    </div>
</div>
```

#### Artefacto: verification\admin_solicitudes_report.md
```
2. **Dashboard Header**: Implemented the standardized `.dashboard-header` following the "Soft Hierarchy" (Title + Subtitle). Per user request, the header was moved **outside** the `.page-card` container (directly into the `.page-shell`), ensuring exact alignment with the `admin-central-stock` visual style.
3. **Tab Navigation**: Adopted `.sku-filter-bar` pattern. Updated JS to use `.is-active` class and standard `switchTab` logic.
4. **Table Lifecycle**: Tables now wrapped in `table-viewport` > `table-shell` > `table-scroll`. Headers are sticky and content is compact.
5. **Dialog System**: Legacy modal structure replaced with native `<dialog class="modal">`. Interaction logic migrated to `.showModal()`/`.close()`.
6. **State Management**: JS synchronized with HTML by removing dead references (e.g., `btnRefresh`) after visual refinement. Removed "alien" CSS classes and legacy toggling.

## Technical Details
```

## 2. Codigo fuente (0 archivos)

No se encontraron archivos que matcheen 'system'.

## 3. Documentacion (49 archivos)

- `docs\architecture\backend-architecture-map.md`
- `docs\architecture\estado-presente.md`
- `docs\architecture\scheme.md`
- `docs\architecture\ui-golden-standard.md`
- `docs\business-logic\synthesis-report.md`
- `docs\business-logic\flows\night-cash-closing.md`
- `docs\business-logic\flows\workday-management.md`
- `docs\guides\navigation.md`
- `docs\migration\artifacts\erp-diagnostic-workdays.md`
- `docs\migration\artifacts\kpi-audit.md`
- `docs\migration\artifacts\roadmap_production.md`
- `docs\migration\artifacts\ux_research_workdays.md`
- `docs\output\qa\context-desing system.md`
- `docs\output\qa\context-ui.md`
- `docs\output\ui-scan\compliance-matrix.md`
- `docs\output\ui-scan\cli-prompts\admin-central-stock.md`
- `docs\output\ui-scan\cli-prompts\admin-config.md`
- `docs\output\ui-scan\cli-prompts\admin-master-nomina.md`
- `docs\output\ui-scan\cli-prompts\admin-pagos.md`
- `docs\output\ui-scan\cli-prompts\admin-reportes.md`
- `docs\output\ui-scan\cli-prompts\admin-solicitudes.md`
- `docs\output\ui-scan\cli-prompts\admin-workdays.md`
- `docs\output\ui-scan\cli-prompts\cms-members.md`
- `docs\output\ui-scan\cli-prompts\encargado-barra-personal.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-noche.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-personal.md`
- `docs\output\ui-scan\cli-prompts\operativo-analisis.md`
- `docs\output\ui-scan\cli-prompts\operativo-master-sku.md`
- `docs\_generated\frontend\2026-02-16_plan_workdays-unified.md`
- `docs\_generated\frontend\2026-02-16_spec_workdays-screen-map.md`
- `docs\_generated\frontend\component-inventory.md`
- `docs\_generated\frontend\design-system-audit.md`
- `docs\_generated\frontend\swiss-tokens-inventory.md`
- `docs\_generated\frontend\token-diff.md`
- `docs\_generated\frontend\tokens-inventory.md`
- `docs\_generated\orchestrator\2026-02-16_report_context-and-work-summary.md`
- `docs\_generated\orchestrator\2026-02-19_plan_page-build.md`
- `docs\_generated\orchestrator\CHANGELOG.md`
- `docs\_generated\orchestrator\multi-chat-architecture.md`
- `docs\_generated\orchestrator\PROMPT-ds-redesign.md`
- `docs\_generated\orchestrator\PROMPT-page-build.md`
- `docs\_generated\orchestrator\prompts\frontend-custom-dropdown.md`
- `docs\_generated\orchestrator\prompts\PROMPT-frontend.md`
- `docs\_generated\orchestrator\prompts\PROMPT-html-audit.md`
- `docs\_generated\orchestrator\prompts\PROMPT-resource-analysis.md`
- `docs\_generated\orchestrator\reports\REPORT-resource-analysis-css.md`
- `docs\_generated\qa\2026-02-16_audit_workdays-deep-verification.md`
- `docs\_generated\qa\2026-02-16_context_workdays.md`
- `docs\_generated\qa\broken-refs-report.md`

## 4. Schema
scheme.md no encontrado.

## 5. Git History

No hay commits que mencionen 'system' en el mensaje.

### Commits que tocan archivos *system*
- 853528a chore: workspace cleanup + agent routing fixes
- aaaf6aa agent

## 6. Reportes previos (20 encontrados)

- `docs\output\qa\context-desing system.md`
- `docs\output\qa\context-ui.md`
- `docs\output\ui-scan\compliance-matrix.md`
- `docs\output\ui-scan\cli-prompts\admin-central-stock.md`
- `docs\output\ui-scan\cli-prompts\admin-config.md`
- `docs\output\ui-scan\cli-prompts\admin-master-nomina.md`
- `docs\output\ui-scan\cli-prompts\admin-pagos.md`
- `docs\output\ui-scan\cli-prompts\admin-reportes.md`
- `docs\output\ui-scan\cli-prompts\admin-solicitudes.md`
- `docs\output\ui-scan\cli-prompts\admin-workdays.md`
- `docs\output\ui-scan\cli-prompts\cms-members.md`
- `docs\output\ui-scan\cli-prompts\encargado-barra-personal.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-noche.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-personal.md`
- `docs\output\ui-scan\cli-prompts\operativo-analisis.md`
- `docs\output\ui-scan\cli-prompts\operativo-master-sku.md`
- `docs\migration\artifacts\erp-diagnostic-workdays.md`
- `docs\migration\artifacts\kpi-audit.md`
- `docs\migration\artifacts\roadmap_production.md`
- `docs\migration\artifacts\ux_research_workdays.md`

## 7. Conversaciones previas (0 encontradas)

No se encontraron conversaciones recientes sobre 'system'.
