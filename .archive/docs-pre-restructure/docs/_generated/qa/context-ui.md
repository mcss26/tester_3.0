# Contexto: UI

Generado: 2026-02-19 09:39 | Topic: `UI`

> Este archivo contiene todo el contexto relevante sobre **UI**.
> Pegalo al inicio de una conversacion para que el agente arranque informado.

## 1. Knowledge Items (7 encontrados)

### UI/UX Golden Standard and Remediation Phases

Verified UI/UX Golden Standard framework covering typography, hierarchy, interactions, responsiveness, accessibility (Phase 5), and unification strategy. Includes 10-phase CSS architecture, technical implementation patterns (HTML/JS/Dialogs/Topbar), and successful remediation reports for admin-herramientas and admin-solicitudes.

#### Artefacto: overview.md

```

## 7. Skill Integration & Enforcement
The Golden Standard is enforced by the **Antigravity Agent Skills**:
- **Skill Sync**: When a remediation phase is verified, skills (Web Designer, UI Migrator) are updated to acknowledge the new "Source of Truth".
- **Enforcement**: Skills are instructed to reject patterns that deviate from `docs/ui-golden-standard.md`.
- **Last Sync**: 2026-02-05 (Consolidated `standard-module-guide.md` and `ui-components.md` into `ui-golden-standard.md`).
- **Realigned Skills**: `frontend-developer`, `ui-polisher`, and `ui-ux-auditor` now point exclusively to the Golden Standard as their technical authority.
## 8. Reference Implementation: admin-central-stock.html
The primary reference for all Golden Standard work.
- **HTML Anatomy**: Base esqueleto with Topbar, Breadcrumbs, and Page Shell.
- **Standard Topbar**: Tri-column layout with search integration and glassmorphism dropdowns.
- **Dashboard Header**: Soft-hierarchy title and subtitle with an integrated status/action bar.
- **JS IIFE Skeleton**: Async pattern with Auth Guard, Grouped UI references, and State management.
- **Dashboard/Landing**: Glassmorphism header and Segmented Filter Bar.
## 12. Canonical Documentation
In accordance with the **Workspace Governance Standard**:
- **Source of Truth**: `docs/ui-golden-standard.md`
- **Status**: Phase 5 Verified & Technically Consolidated.
- **Consolidated Files**: `ui-standards.md`, `standard-module-guide.md`, `ui-components.md`.
- **Obsolete Files**: `golden.md` (root), `uiux-audit-*.md` (deprecated).
## 10. Migration Checklist
When updating a legacy page to the Golden Standard:
```

#### Artefacto: implementation\dashboard_header_pattern.md

```

    <!-- Right: Contextual Actions -->
    <div class="row-flex align-center gap-sm">
        <span class="system-status-pill status-open topbar-pill topbar-pill-quiet">ESTADO</span>
        <button class="btn-icon btn-icon-flat" id="btn-refresh" title="Refrescar">â†»</button>
    </div>
</div>
    margin-top: 4px;
}
.topbar-pill-quiet {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
## 5. Best Practices
- **Spacing**: Maintain a `24px` padding and clear separation from the Topbar (usually handled by `.page-shell` margins).
- **Containment**: When placed outside the card, use `mb-4` or a `24px` bottom margin to create breathing room between the header and the data container.
- **Titles**: Keep titles descriptive but concise. Avoid repeating "GestiÃ³n de..." if not necessary, though it is standard in the current admin suite.
- **Pills**: Use the "Quiet" pill style for general statuses to avoid visual competition with primary action buttons.
- **Actions**: The `.actions-bar` (or `.row-flex`) often contains a refresh button or a primary create button.
- **Minimal Setup**: For a cleaner "Soft Hierarchy" (as seen in `admin-central-stock` and `admin-solicitudes`), contextual action groups can be omitted if the functionality is already handled by a lower-level `.sku-filter-bar`.
```

#### Artefacto: implementation\module_remediation_workflow.md

```
# Workflow: Admin Module UI Remediation

This document outlines the standardized process for migrating legacy admin modules (e.g., `admin-solicitudes.html`) to the UI Golden Standard.
## 1. Primary Layout Restructuring
  </main>
```

- **Rationale**: Separating the identity from the container provides better visual breathing room ("Soft Hierarchy") and improves responsiveness on tablets and small laptops.
- **Padding Requirement**: When placed outside the card, the header **must** have `padding: 0 24px` to visually align with the Topbar breadcrumbs and Logo. Failure to do so causes a "staircase" indent effect that breaks the Golden Standard grid.

## 2. Topbar Standardization

```

#### Artefacto: implementation\topbar_dropdown_pattern.md
```

The logic handles opening/closing dropdowns and specific "click-outside" behavior to prevent multiple open menus.

```javascript
const ui = {
  btnNotifications: document.getElementById("btn-notifications"),
  menuNotifications: document.getElementById("notifications-menu"),
  btnUserAvatar: document.getElementById("user-avatar"),
};
// Initialize
setupDropdown(ui.btnNotifications, ui.menuNotifications);
setupDropdown(ui.btnUserAvatar, ui.menuUser);
```

## 4. Visual Integrity & CSS Globalization

During the remediation of `admin-solicitudes.html`, a significant "Visual Regression" was observed when copying the Topbar HTML without the corresponding styles.

- **The Problem**: Standardized HTML architecture relies on page-specific FASE 1-10 CSS (originally in `admin-central-stock.css`). Removing this association breaks the layout (spacing, alignment, glassmorphism effects).
- **The Solution**: Until global styles are centralized, remediation required localizing the Topbar CSS into module-specific files (e.g., `admin-solicitudes.css`).
- **Globalization Goal**: The visual architecture should be migrated to `components.css` or a dedicated `topbar.css` to enable "Copy-Paste" architecture across the repo.

## 5. Best Practices

```

#### Artefacto: verification\admin_herramientas_report.md
```

**Reference Implementation**: `pages/admin/admin-herramientas.html`
**Phase Status**: Phase 5 Verified (Accessibility & Semantic Integrity)

## 1. UI Rendering Verification (8 Sections)

All key UI components render according to the Golden Standard:

- **Topbar**: Breadcrumb, search, notifications (3), avatar visible. âœ…
- **Dashboard Header**: Tabs (Stock/Recetas/Rentabilidad) + action button. âœ…
- **Summary Metrics**: Metrics cards display correctly. âœ…

## 3. Responsive Testing (4 Breakpoints)

Layout stability confirmed across all target resolutions:

- **Desktop (1920px)**: Full layout with sidebar fixed. âœ…
- **Laptop (1366px)**: Optimized fluid layout. âœ…
- **Tablet (1024px)**: Sidebar stacks above content. âœ…
- **Mobile (768px)**: 1-column layout; filter pills wrap correctly. âœ…

```

#### Artefacto: verification\admin_solicitudes_report.md
```

## Technical Details

- **JS Pattern**: Async IIFE with `Auth.guardOrRedirect`.
- **UI References**: Centralized in a `ui` object for easy maintenance.
- **Dynamic Content**: Render functions (Item, Supplier, Orders) now inject the full `table-scroll` hierarchy.

## Visual Integrity & Dropdowns

```

#### Artefacto: verification\responsive_benchmarks.md
```

| Breakpoint  | Target Resolution | Layout Behavior    | Pattern                                                                 |
| :---------- | :---------------- | :----------------- | :---------------------------------------------------------------------- |
| **Desktop** | 1920px+           | **2-Column Dash**  | Fixed Sidebar (left) + Fluid Main Content.                              |
| **Laptop**  | 1366px            | **2-Column Dash**  | Optimized spacing, maintaining sidebar visibility.                      |
| **Tablet**  | 1024px            | **Stacked/Hybrid** | Sidebar components (Filters/Stats) stack vertically above main content. |
| **Mobile**  | 768px and below   | **1-Column Stack** | Full-width single column. Filter pills wrap; Sidebar sections stack.    |

### Table Responsiveness

- **Desktop/Laptop**: All columns visible.
- **Mobile (<1024px)**: Tables should be wrapped in a `.table-responsive` container with `overflow-x: auto`. Columns like "Proveedor" or "Valorizado" may require horizontal scrolling on small viewports.
- **Benchmark**: No layout breaking or forced overflow on the outer wrapper.

### Chart Scaling

```

### Infrastructure and Developer Tooling
Patterns and configurations for the development ecosystem, including third-party integrations (Figma, Supabase MCP), environment setups, local serving protocols, and production migration workflows for the Antigravity project.

#### Artefacto: deployment\migration_workflow.md
```

## 2. Refactoring Phase

- **Extract Styles**: Move styles to `assets/css/` following the `admin-[module].css` pattern.
- **Centralize Logic**: Ensure business logic uses reusable core helpers (`Auth`, `Utils`, `Toast`).
- **Standardize UI**: Apply Golden Standard components (TableShell, Topbar, SlidePanel).

## 3. Deployment Phase

- **File Relocation**: Move the `.html` file from temporary or `operativo/` paths to the official `pages/admin/` or appropriate hierarchy.

```

#### Artefacto: development\local_serving_protocol.md
```

# Protocol: Local Serving (Tester 3.0)

Since the project's `package.json` is intentionally minimalist and lacks a standard `start` or `dev` script, a direct serving method is required for local development and UI verification.

## Local Server Recommendation

The preferred tool is `http-server`, run via `npx` to avoid global installation dependencies. 4. **Reporting**: Inform the user of the local URL and the verification status (success/failure).

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
- **Benefit**: No dependency on specific MCP servers; fully customizable logic.

### 3. Manual Asset Export

- **Description**: Traditional workflow where assets are exported from the Figma UI and saved to the project.
- **Workflow**: Human-guided. The agent receives files via the conversation.

## Security Protocols (CRITICAL)

- **Token Handling**: Personal Access Tokens (PAT) must **NEVER** be committed to the repository (e.g., in `config.js` or `INDEX.md`).
- **Revocation**: If a token is accidentally shared in a conversation log, it must be revoked immediately via Figma User Settings > Personal access tokens.
- **Storage**: Tokens should either be provided per-session by the user or stored in a secure local environment variable accessible to the agent runtime.

## UI Globalization Lesson

A key finding from February 2026: **Mirroring HTML architecture from Figma/Design-Reference is insufficient without the associated design tokens and CSS architecture.**

- Visual regressions often occur because of page-specific CSS overrides.
- Recommendation: Ensure design-to-code components (like the Topbar) are truly "Atomic" and decoupled from local page styles.

```

### Midnight Club Administrative Tools
Documentation of the administrative and operative tools used for managing Midnight Club, including site configuration, stock, and workday planning. Enforces the 'Edit-Not-Create' policy for site_config to maintain synchronicity with the frontend's Controlled Static Mapping.

#### Artefacto: overview.md
```

# Midnight Club Administrative Tools Overview

The project includes a suite of administrative and operative tools (typically found in the `tester_3.0` repository or `pages/operativo/`) designed for club management.

## Core Responsibilities

1. **Workday Management**: Planning and monitoring of event days, staff payroll, and operational status.

### Restricted site_config Management

To maintain the stability of the [Controlled Static Mapping](file:///C:/Users/siste/.gemini/antigravity/knowledge/midnight_club_frontend_architecture/artifacts/implementation/dynamic_sync_pattern.md) used in the public frontend, the administrative tools follow a restriction policy:

- **Edit Only**: Admins are encouraged to edit existing entries (Name, Description, URL, Price).
- **No New Keys**: Creating new keys is restricted or discouraged because the public frontend requires proactive code mapping for any new card/slot.

## Key Files

- `pages/operativo/operativo-workday.html`: Main dashboard for operational event management.
- `assets/js/modules/operativo/operativo-workday.js`: Logic for managing links and operational data.
- `pages/informes/temp-qr-report.html`: Quick reporting tool for monitoring QR ticket printing activity.

```

#### Artefacto: implementation\qr_report_temp.md
```

- Groups tickets by creation timestamp (rounded to the minute) to visualize "batches" of printing activity.
- Calculates total tickets and unique days registered.
- **Styling**:
  - Adheres to the Midnight Club UI (Golden Standard zinc palette).
  - Uses compact table styling (`padding: 0.35rem 0.75rem`) to maximize information density.
  - Responsive shell with `.app-shell` and `.page-shell` patterns.

```

#### Artefacto: implementation\site_config_management.md
```

## The Synchronization Chain

1. **Database**: `site_config` stores keys (e.g., `passline_acceso__0200`).
2. **Backoffice**: `operativo-workday.js` allows editing the `name`, `description`, `url`, and `is_active` status of these keys.
3. **Public Frontend**: `shared-ui.js` (`syncDynamicCards`) binds these keys to specifically formatted HTML IDs (e.g., `card_0000`).

## Restriction Policy: "Edit-Not-Create"

Because the public frontend relies on **Controlled Static Mapping**, adding a new entry in the database without a corresponding code update in `accesos.js` or `members-only.js` results in an "invisible entry" that takes up DB space but never renders.

### Implementation Details

- **UI Restrictions**: The "+ Nuevo Link" button in `operativo-workday.html` has been removed (or hidden) and the creation logic in `operativo-workday.js` is disabled. This is a **deliberate design decision** to prevent non-mapped entries from cluttering the database.
- **Workflow**: Staff should only toggle `is_active` and update `url`/`name`/`description` for the 6 canonical slots.
- **Deletion**: The "Eliminar" (ðŸ—‘ï¸) button has been removed to preserve the fixed slot structure.
- **Naming Convention**: Keys follow the standard double-underscore prefixing (e.g., `passline_acceso__`, `passline_members__`).

```

### Midnight Club Brand Identity
Brand strategy, visual identity standards, and implementation patterns for Midnight Club. Defines the 'Luxury Urban' aesthetic, including the newly established 'Master Tape' VHS workflow for high-end social content and AI-video pipelines.

#### Artefacto: overview.md
```

The brand moves away from "dirty urban" or "messy Y2K" aesthetics toward a more refined, "Fashion House" approach. Visual elements are implemented directly in code (HTML/CSS/SVG) to ensure pixel perfection and scalability.

## Theoretical Framework

The brand's evolution is guided by the **Modern Design Philosophies (2026)** framework, incorporating concepts of _Refined Maximalism_, _MX Design_, and _Integrated Design Systems_ to maintain relevance in the high-end Gen Z luxury sector.

## Brand Leadership

The project's visual and systemic evolution is led by the **Creative Director (Agent Zero)**, who serves as the brand architect, overseeing the transition from legacy assets to a modernized, code-driven identity system.

```

#### Artefacto: examples\midnight_club_flyer_case.md
```

## 2. Principle Application

### The KISS Protocol

- **Word Count**: Under 20 words (Protocol requires < 50).
- **The Trinity**:
  - **Headline**: DJ PHANTOM (Emotional anchor/Artist).
  - **Offer**: Nightclub Event (Implicit in branding).

```

#### Artefacto: examples\midnight_club_instagram_case.md
```

This asset was developed to maximize attention in the Instagram mobile feed, utilizing the full vertical space available (4:5 aspect ratio) while maintaining the "Luxury Urban" brand soul.

## 2. Layout Strategy: Vertical Zoning

The 4:5 canvas is divided into three functional zones to guide the eye:

1. **Top Zone (10%)**: Monoscaped metadata (`SAB 15 FEB`) in `Space Mono`. Set with wide tracking to feel "deliberate" and elite.
2. **Middle Zone (60%)**: Hero focus. Massive `Outfit Black` (900) typography for the Artist Name (`DJ PHANTOM`). This zone captures the initial scroll attention.
3. **Bottom Zone (30%)**: The Conversion Anchor.

```

#### Artefacto: implementation\css_logo_patterns.md
```

## Official Vector Specification (SVG)

For production environments where precise vector control is required, the logo is implemented as an SVG. The following specification defines the official layout and style as derived from the Figma design.

### Layout Properties

- **Width**: `1000px`

```

#### Artefacto: implementation\interactive_brand_guide.md
```

# Interactive Brand Guide Implementation

## Overview

The brand guide is implemented as a single-page HTML document that serves as both a reference and a live demonstration of brand assets (SVG Logo, Colors, Typography, and Motion).

## CSS Design Tokens

The design system is powered by CSS variables defined in `:root`.
Interactive elements (buttons) demonstrate the `Ease-In-Out` transition for brand "body language".

- **Transition**: `transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)`.

### 4. Print & Flyer Guidelines

Detailed in Section 06 of the interactive guide, this component bridges digital aesthetics with physical conversion rules.

- **KISS Mandate Implementation**: UI blocks documenting word count limits and element trios (Headline, Offer, CTA).
- **Typography Hierarchy**: Documentation of 48pt/36pt/24pt ratios for physical legibility.
- **Verification Protocols**: Integration of the "5-Step Test" directly into the brand reference.

## Semantic Hierarchy (MX)

The guide uses semantic sections (`<section>`, `<h1-h2>`, `<ul>`) to ensure that AI agents and search engines can parse the brand hierarchy effectively.

```

#### Artefacto: implementation\premium_layout_system.md
```

- **Chrome/Gray (#888888)**: Secondary utility details (Monospace).

### Hero Fade Protocol

All hero images must include a transition layer at the bottom edge to guide the eye toward the conversion anchor.

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

While the Premium Layout System focuses on social media formats (4:5/9:16), the Web Execution adapts these principles for the interactive, scrollable environment of the browser.

## 3. Color & Interaction

- **Midnight Red (#ff2d2d)**: Used for primary brand markers (Logo shadow, active menu items).
- **Signal Lime (#cdfb3e)**: Used strictly for "Live" states (Event on-going) or primary conversion.
- **Glassmorphism**: Popups (`#mc-login-gate`) and navigation bars (`.mc-nav`) use heavy `backdrop-filter: blur(12px)` and low-opacity backgrounds (`rgba(0,0,0,0.78)`) to maintain the sense of depth behind the UI.

## 4. Asset Optimization for Hero

When preparing hero images for the website:

```

#### Artefacto: strategy\branding_guidelines.md
```

# Midnight Club - Brand Identity Guidelines

## 1. Core Concept

**"Luxury Urban / Night Racing"**

- **Style:** Interlocked 'M' and 'C' using the same heavy weight. Designed by Agent Zero for social media avatars, seals, and hardware branding.
- **Use Case:** Social Media Avatar (IG/TikTok), Wristbands, Stamps.

## 5. High-Conversion Guidelines (KISS & ROI)

For physical and digital advertisements, the club follows a strict performance protocol to ensure maximum ROI:

### 1. The KISS (Keep It Simple) Protocol

```

#### Artefacto: strategy\design_workflow.md
```

# Design Workflow & Collaboration

## ðŸŽ¨ Creative Direction

All brand evolution and asset generation are overseen by the **Creative Director (Agent Zero)**. This agent acts as the bridge between conceptual requirements and technical execution (Code/SVG/Raster).

### Collaborative Process

1. **Conceptualization**: User provides high-level intent or mood.

```

#### Artefacto: strategy\philosophies_2026.md
```

### High-Fidelity Y2K

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

```

#### Artefacto: strategy\social_and_print_standards.md
```

### B. The Editorial Series (Full Bleed Overlay)

Inspired by high-fashion houses (Saint Laurent, Mario Testino). Used for brand-soul and positioning assets.

- **Photo Treatment**: Full canvas bleed (4:5 or 9:16). Analog grain or high-contrast editorial.
- **Typography Overlay**: Integrated as "Annotation" or "Punctuation" rather than UI elements.
- **Alignment**: **Left-Alignment** is mandatory for utility text to mimic high-end lookbooks.
- **Contrast**: Relies on a four-point `linear-gradient` (Top/Bottom) to ground the typography while keeping the center of the image "clean".
- **Asset Hierarchy**: Most premium assets use this pattern over the zoned architecture.

```

#### Artefacto: strategy\social_media_strategy.md
```

### 6. The Master Tape Post (VHS Stylized)

- **Layout**: Usually 4:5 or 9:16.
- **Design**: Uses the "Master Tape" aesthetic (Ruido/Scanlines/Interlace). Hero image is the stylized photo. overlays are "PLAY" and a date stamp.
- **Color Grade**: Saturated reds/neons contrast with washed-out deep blacks.
- **CTA**: Often none or highly minimal (text-based) to maintain the "found footage" illusion.
- **Purpose**: "Underground" vibe for after-hours events and raw club culture highlights.
- **Color Discipline**: Cyber Lime is strictly for CTAs. Utility text (address, time) uses Space Mono in #888/Chrome.
- **Hero Fade**: The hero image must utilize a bottom-up transparent-to-black gradient to merge into the footer zone.

## Platform Guidelines

- **Instagram**: Focus on the grid as an architectural statement. Use the 4:5 Portrait format for high-impact announcements and Stories for fast-paced, high-energy content.
- **TikTok**: Utilize fast cuts and metallic/neon accents consistent with the "Acid Green" or "Electric Blue" palette secondary colors. Always prioritize mobile-native safe zones for typography.

```

#### Artefacto: strategy\visual_archetypes.md
```

### 3. High-Fidelity Y2K (Futuristic Nostalgia)

- **Chrome**: 3D word art and holographic finishes.
- **Liquid Forms**: Organic, "melted" shapes suggested movement and energy.
- **Color**: Cyber Lime, Brat Green, and electric blues.
- **Master Tape Aesthetics (VHS/Lo-Fi)**: Injecting analog "imperfections" (chromatic aberration, scanlines, tape noise) into clean digital layouts to create a sense of tangible history and "underground" exclusivity.

```

#### Artefacto: strategy\visual_language_system.md
```

**Midnight Club** is not just a place; it's a state of mind. It sits at the intersection of high-speed adrenaline and high-fashion exclusivity. Our visual language is designed to signal **status** to the Gen Z elite while retaining the **grit** of real urban culture.

### Brand Pillars

1.  **Speed & Chrome:** The visual metaphor includes velocity, liquid metal, and high-gloss reflections.
2.  **Nocturnal Dominance:** We own the night. Our palette is 90% black.
3.  **Unapologetic Boldness:** We don't whisper. We shout in Uppercase Sans-Serif.

## 4. Motion Principles (Body Language)

- **The "Flash"**: Strobe-like transitions (Hard Cuts) for high-energy announcements.
- **The "Drift"**: Slow, liquid movement for background textures (Ease-In-Out, Duration: 10s+). A sense of perpetual motion.

---

```

### Midnight Club Frontend Architecture
Technical specification and implementation patterns for the Midnight Club frontend. Covers the 'Controlled Static Mapping' pattern, staggered fade-in visual transitions, .ilike() Supabase query fixes, secure authentication flows, and 'Content Flash Protection'.

#### Artefacto: overview.md
```

## Core Pillars

1. **Hybrid SSR/Client-Side Hydration**: HTML pages are served static, then "hydrated" with live data from Supabase for critical components (Hero images, Countdown, Tickets).
2. **Controlled Static Mapping**: UI elements (Cards) are hardcoded in groups (e.g., 3 slots) and mapped to database entries via specific keys. This provides maximum stability and predictability while allowing data updates without code changes. Full dynamic rendering was explored but discarded for production stability.
3. **Shared UI Engine**: A central module (`shared-ui.js`) manages the heavy lifting for Authentication, Component Sync (`syncDynamicCards`), and Timers across all frontend pages (`index`, `accesos`, `members-only`).

## Key Files

- `assets/js/shared-ui.js`: The "brain" of the frontend. Contains `syncDynamicCards`, `setupAuthUI`, and `initCountdown`.
- `assets/js/global.js`: Initializes the Supabase `client` and session management.
- `assets/js/config.js`: Centralized configuration (Supabase URL/Key, Function endpoints).

```

#### Artefacto: implementation\authentication_system.md
```

# Authentication System

Midnight Club uses a centralized authentication UI handled by `shared-ui.js` and a custom Supabase Edge Function (`auth-member`).

## Components

### 1. Injected Login Gate

The login UI is defined as a template string (`LOGIN_GATE_HTML`) in `shared-ui.js` and injected into `#mc-login-gate-container` via `setupAuthUI()`. This ensures the Login UI is consistent across all pages.

### 2. ID Formatting

The system automatically formats IDs (e.g., typing `1234` becomes `MC-1234`).

## Storage & Session

- `mc_member_token`: A JWT token returned by the auth function.
- `mc_member_session`: JSON string containing the member's profile data.
- **Validation**: On page load, `setupAuthUI` checks if a token exists and validates it via `authRequest('validate', { token })`.

## Views

The gate has two primary views:

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
### Implementation
export async function renderDynamicCards(containerSelector, keyPrefix) {
  // ... (refer to shared-ui.js for full implementation)
}
```

```

#### Artefacto: implementation\production_vs_local.md
```

3. **Verify Data Flow**: Check the Network tab for successful calls to the Supabase Edge Functions or REST API.

## Corrective Actions for Stale Production

1. **Force Redeploy**: Trigger a clean build and deploy cycle.
2. **Purge CDN**: If using a CDN (Cloudflare/Netlify), purge the cache for `assets/js/shared-ui.js` and the HTML pages.
3. **Service Worker Update**: Increment the version in `sw.js` to force clients to fetch updated assets.

```

### Modern Design Philosophies (2026)
Comprehensive framework for design in 2026, focusing on Generation Z luxury visual language (Refined Maximalism, Neo-Brutalism, Y2K Hi-Fi), Integrated Design Systems (Engine vs Soul, Design Tokens), and Machine Experience (MX) for AI-compatibility.

#### Artefacto: overview.md
```

### High-Fidelity Y2K

- **Philosophy**: Retro-futurism rooted in early internet nostalgia but rendered with high precision.
- **Key Traits**: Chrome/metallic finishes, liquid metal forms, pixelation/glitch art, and vibrant neon gradients (e.g., Cyber Lime, Brat Green).

## 2. The Integrated Design System (Engine vs. Soul)

| Variable       | Brand Identity (Soul)          | Design System (Engine)                   |
| :------------- | :----------------------------- | :--------------------------------------- |
| **Objective**  | Defining character and values. | Facilitating rapid, consistent delivery. |
| **Components** | Logos, mission, tone of voice. | UI components, design tokens, code.      |
| **Audience**   | Marketers, partners.           | Designers, engineers, QA.                |

### Design Tokens

```

#### Artefacto: visual_archetypes.md
```

### 3. High-Fidelity Y2K (Futuristic Nostalgia)

- **Chrome**: 3D word art and holographic finishes.
- **Liquid Forms**: Organic, "melted" shapes suggested movement and energy.
- **Color**: Cyber Lime, Brat Green, and electric blues.
- **Master Tape Aesthetics (VHS/Lo-Fi)**: Injecting analog "imperfections" (chromatic aberration, scanlines, tape noise) into clean digital layouts to create a sense of tangible history and "underground" exclusivity.
- **Footer Zone (38%)**: Maximum-impact conversion zone. Designed for "Swipe Up" or "Link Sticker" interaction proximity.

### The Full-Bleed Editorial Pattern

A shift from structured "UI-looking" layouts to pure photographic immersion.

- **Hierarchy**: The image is the primary communicator. Text is treated as "Annotation" or "Punctuation".
- **Contrast**: Relies on specific photographic "Negative Space" or a **Four-Point Masking Gradient** (subtle vignetting at top/bottom corners) to ground typography without breaking the photographic canvas.
- **Vibe**: Analog, raw, paparazzi-style, or high-studio minimalism.

```

### Workspace Governance and Auditing
Rules and standards for maintaining repository hygiene, canonical document locations, 'Source of Truth' hierarchy, and agent skill lifecycle protocols (Genesis & Synchronization) for the project.

#### Artefacto: governance_standard.md
```

| **Screen Map** | `docs/screen-map.md` |
| **Database Schema** | `docs/scheme.md` |
| **Documentation Index** | `docs/INDEX.md` |
| **UI/UX Standards** | `docs/ui-golden-standard.md` |
| **CSS Tokens** | `assets/css/tokens.css` |
| **Frontend Rules** | `.agent/skills/frontend-developer/SKILL.md` |
| **Backend Rules** | `.agent/skills/logic-engineer/SKILL.md` |

Documentation must be updated immediately following significant architectural or structural changes:

- New UI screens -> Update `docs/estado-presente.md` and `docs/screen-map.md`.
- Schema changes -> Update `docs/scheme.md`.
- Completed phases -> Update progress meters in `docs/roadmap.md`.

```

#### Artefacto: skill_genesis_protocol.md
```

# Protocolo de CreaciÃ³n de Skills (Skill Genesis)

El protocolo **Skill Genesis** define el estÃ¡ndar para la expansiÃ³n del ecosistema de agentes mediante la creaciÃ³n de nuevas habilidades (Skills). Este proceso es liderado conceptualmente por el **Agente Cero (Director Creativo y Arquitecto de Skills)**.

## ðŸ§¬ Pasos del Protocolo

Antes de crear la skill, se debe identificar claramente el problema que resuelve y el rol especÃ­fico del nuevo agente.

### 2. Nomenclatura

El nombre de la skill debe ser descriptivo y seguir el formato `kebab-case`.

- Ejemplos correctos: `social-media-manager`, `music-curator`, `fleet-coordinator`.

### 3. Estructura de Directorios

### 4. Archivos Obligatorios

#### A. `SKILL.md` (Punto de entrada)

Debe contener el frontmatter YAML con el nombre y descripciÃ³n, seguido de las capacidades generales y el mÃ©todo de uso.

```markdown
---

Contiene la personalidad, directrices operativas detalladas, instrucciones de comportamiento y protocolos especÃ­ficos del agente. Es el "cerebro" de la skill.

### 5. Registro (Opcional)

Se recomienda sugerir al usuario la actualizaciÃ³n de Ã­ndices de habilidades o documentaciÃ³n de gobernanza si el sistema requiere un registro formal de capacidades.

## ðŸ“ EstÃ¡ndares de Calidad

- **Markdown Enriquecido**: Uso de encabezados, listas y bloques de cÃ³digo para legibilidad.
```

#### Artefacto: skill_synchronization_protocol.md

```
## 1. Triggering a Sync
A synchronization point is reached when:
- A new **Remediation Phase** is verified and documented.
- The **Golden Standard** (`docs/ui-golden-standard.md`) receives a major update.
- A new **Canonical Source of Truth** is established (e.g., new Schema or Business Logic doc).

## 2. Synchronization Actions
## 3. Verified Sync Points
| Date | Phase / Standard | Affected Skills | Notes |
|:---|:---|:---|:---|
| 2026-02-05 | Phase 5 (Accessibility) | Web Designer, UI Migrator, All | Enforcing H2>H3 sequence and ARIA labeling. |
| 2026-02-05 | Governance Standard | Auditing Workspace, Project Orchestrator | Enforcing "No Root MD" and Canonical Locations. |
## 4. Verification of Sync
```

#### Artefacto: cleanup\log_2026_02_05.md

```

| File Path | Description | Reason for Deletion |
|:---|:---|:---|
| `golden.md` | Root markdown file. | Superseded by `docs/ui-golden-standard.md`. Violates "No Root MD" rule. |
| `.agent/temp-analyze.js` | Temporary JS script. | One-time analysis tool; no longer needed for production logic. |
| `.agent/excel-items.json` | Temporary data artifact. | Intermediate JSON from Excel parsing; data integrated or obsolete. |
| `.agent/excel-parsed.json` | Temporary data artifact. | Intermediate JSON from Excel parsing; data integrated or obsolete. |
## Verified Canonical Locations
The following files were confirmed as the active Sources of Truth:
- **UI/UX Standard**: `docs/ui-golden-standard.md`
- **Current State**: `docs/estado-presente.md` (Update recommended in next audit).
## Audit Results
```

## 2. Codigo fuente (2 archivos)

- `pages\logistica\logistica-seguimiento.html` (6.677 bytes, mod: 2026-02-18 23:38)
- `assets\js\modules\logistica\logistica-seguimiento.js` (10.819 bytes, mod: 2026-02-07 21:55)

### logistica-seguimiento.js - Analisis

**Funciones:** `setPageState``, ``loadOrders``, ``renderOrders``, ``openPanel``, ``renderTimeline``, ``addTrackingEvent``, ``bindEvents`
**Tablas Supabase:** `replenishment_supplier_orders``, ``replenishment_tracking`

## 3. Documentacion (131 archivos)

- `docs\INDEX.md`
- `docs\architecture\backend-architecture-map.md`
- `docs\architecture\estado-presente.md`
- `docs\architecture\scheme.md`
- `docs\architecture\screen-map.md`
- `docs\architecture\ui-golden-standard.md`
- `docs\business-logic\synthesis-report.md`
- `docs\business-logic\flows\bar-manager-night.md`
- `docs\business-logic\flows\workday-management.md`
- `docs\codex\PLAN_PRODUCTION_READY.md`
- `docs\guides\drive-troubleshooting.md`
- `docs\guides\state-management-guide.md`
- `docs\migration\README.md`
- `docs\migration\artifacts\erp-diagnostic-workdays.md`
- `docs\migration\artifacts\kpi-audit.md`
- `docs\migration\artifacts\README.md`
- `docs\migration\artifacts\roadmap_production.md`
- `docs\migration\artifacts\sprint3-implementation_plan.md`
- `docs\migration\artifacts\sprint3-walkthrough.md`
- `docs\migration\artifacts\ux_research_workdays.md`
- `docs\modules\README.md`
- `docs\modules\_template.md`
- `docs\modules\admin\admin-config.md`
- `docs\modules\admin\admin-index.md`
- `docs\modules\admin\admin-master-categorias.md`
- `docs\modules\admin\admin-master-pos.md`
- `docs\modules\admin\admin-master-proveedores.md`
- `docs\modules\admin\admin-master-tarifario.md`
- `docs\modules\admin\admin-pagos.md`
- `docs\modules\admin\admin-solicitudes.md`
- `docs\modules\admin\test-devenciones.md`
- `docs\modules\admin\workdays.md`
- `docs\modules\encargados\encargado-barra-personal.md`
- `docs\modules\encargados\encargado-caja-index.md`
- `docs\modules\encargados\encargado-caja-noche.md`
- `docs\modules\encargados\encargado-caja-personal.md`
- `docs\modules\encargados\encargado-recepcion.md`
- `docs\modules\gerencia\balance-semanal.md`
- `docs\modules\logistica\logistica-recepcion.md`
- `docs\modules\logistica\logistica-seguimiento.md`
- `docs\modules\logistica\logistica-stock.md`
- `docs\modules\members\my-qr.md`
- `docs\modules\misc\login.md`
- `docs\modules\operativo\cms-members.md`
- `docs\modules\operativo\operativo-analisis.md`
- `docs\modules\operativo\operativo-master-proveedores.md`
- `docs\modules\operativo\operativo-master-sku.md`
- `docs\modules\operativo\operativo-solicitudes.md`
- `docs\modules\operativo\operativo-stock.md`
- `docs\modules\operativo\operativo-workday.md`
- `docs\modules\staff\staff-caja-index.md`
- `docs\output\repo-audit\optimization-report.md`
- `docs\output\ui-scan\compliance-matrix.md`
- `docs\output\ui-scan\select-risk-report.md`
- `docs\output\ui-scan\cli-prompts\admin-central-stock.md`
- `docs\output\ui-scan\cli-prompts\admin-config.md`
- `docs\output\ui-scan\cli-prompts\admin-index.md`
- `docs\output\ui-scan\cli-prompts\admin-master-categorias.md`
- `docs\output\ui-scan\cli-prompts\admin-master-nomina.md`
- `docs\output\ui-scan\cli-prompts\admin-master-pos.md`
- `docs\output\ui-scan\cli-prompts\admin-master-proveedores.md`
- `docs\output\ui-scan\cli-prompts\admin-master-tarifario.md`
- `docs\output\ui-scan\cli-prompts\admin-pagos.md`
- `docs\output\ui-scan\cli-prompts\admin-reportes.md`
- `docs\output\ui-scan\cli-prompts\admin-semanal.md`
- `docs\output\ui-scan\cli-prompts\admin-solicitudes.md`
- `docs\output\ui-scan\cli-prompts\admin-workdays.md`
- `docs\output\ui-scan\cli-prompts\balance-semanal.md`
- `docs\output\ui-scan\cli-prompts\cms-members.md`
- `docs\output\ui-scan\cli-prompts\encargado-barra-index.md`
- `docs\output\ui-scan\cli-prompts\encargado-barra-noche.md`
- `docs\output\ui-scan\cli-prompts\encargado-barra-personal.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-index.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-noche.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-personal.md`
- `docs\output\ui-scan\cli-prompts\encargado-recepcion.md`
- `docs\output\ui-scan\cli-prompts\generator.md`
- `docs\output\ui-scan\cli-prompts\index.md`
- `docs\output\ui-scan\cli-prompts\logistica-distribucion.md`
- `docs\output\ui-scan\cli-prompts\logistica-index.md`
- `docs\output\ui-scan\cli-prompts\logistica-recepcion.md`
- `docs\output\ui-scan\cli-prompts\logistica-seguimiento.md`
- `docs\output\ui-scan\cli-prompts\logistica-stock.md`
- `docs\output\ui-scan\cli-prompts\my-qr.md`
- `docs\output\ui-scan\cli-prompts\operativo-analisis.md`
- `docs\output\ui-scan\cli-prompts\operativo-index.md`
- `docs\output\ui-scan\cli-prompts\operativo-master-proveedores.md`
- `docs\output\ui-scan\cli-prompts\operativo-master-sku.md`
- `docs\output\ui-scan\cli-prompts\operativo-solicitudes.md`
- `docs\output\ui-scan\cli-prompts\operativo-stock.md`
- `docs\output\ui-scan\cli-prompts\operativo-workday.md`
- `docs\output\ui-scan\cli-prompts\scanner-mock.md`
- `docs\output\ui-scan\cli-prompts\scanner.md`
- `docs\output\ui-scan\cli-prompts\staff-barra-index.md`
- `docs\output\ui-scan\cli-prompts\staff-caja-index.md`
- `docs\reference\feature-spec-drinks-by-web.md`
- `docs\reference\user-flows-by-role.md`
- `docs\testing\observations\_template.md`
- `docs\testing\tickets\TK-001-crypto-randomuuid-compat.md`
- `docs\testing\tickets\TK-002-modal-showmodal-compat.md`
- `docs\testing\tickets\TK-003-staff-cost-not-recalculating.md`
- `docs\testing\tickets\TK-004-staff-dropdowns-empty.md`
- `docs\testing\tickets\TK-005-base-salary-column-missing.md`
- `docs\_generated\README.md`
- `docs\_generated\frontend\2026-02-16_plan_workdays-unified.md`
- `docs\_generated\frontend\2026-02-16_research_workdays-deep-research.md`
- `docs\_generated\frontend\2026-02-16_spec_workdays-screen-map.md`
- `docs\_generated\frontend\component-inventory.md`
- `docs\_generated\frontend\design-system-audit.md`
- `docs\_generated\frontend\swiss-tokens-inventory.md`
- `docs\_generated\frontend\token-diff.md`
- `docs\_generated\orchestrator\2026-02-16_plan_botellas_audit.md`
- `docs\_generated\orchestrator\2026-02-16_report_context-and-work-summary.md`
- `docs\_generated\orchestrator\2026-02-16_report_verifier-remediation.md`
- `docs\_generated\orchestrator\2026-02-16_supabase_discrepancies.md`
- `docs\_generated\orchestrator\2026-02-19_plan_page-build.md`
- `docs\_generated\orchestrator\CHANGELOG.md`
- `docs\_generated\orchestrator\multi-chat-architecture.md`
- `docs\_generated\orchestrator\PROMPT-page-build.md`
- `docs\_generated\orchestrator\prompts\frontend-custom-dropdown.md`
- `docs\_generated\orchestrator\prompts\PROMPT-frontend.md`
- `docs\_generated\orchestrator\prompts\PROMPT-html-audit.md`
- `docs\_generated\orchestrator\prompts\PROMPT-js-audit.md`
- `docs\_generated\orchestrator\prompts\PROMPT-resource-analysis.md`
- `docs\_generated\orchestrator\reports\REPORT-js-db-audit.md`
- `docs\_generated\orchestrator\reports\REPORT-resource-analysis-css.md`
- `docs\_generated\qa\2026-02-16_audit_flow-trace.md`
- `docs\_generated\qa\2026-02-16_audit_workdays-deep-verification.md`
- `docs\_generated\qa\2026-02-16_context_workdays.md`
- `docs\_generated\qa\2026-02-19_audit_routing-docs-redundancies.md`
- `docs\_generated\ui-scan\rescan-report-20260217-0639.md`

## 4. Schema

scheme.md no encontrado.

## 5. Git History

No hay commits que mencionen 'UI' en el mensaje.

## 6. Reportes previos (52 encontrados)

- `docs\output\repo-audit\optimization-report.md`
- `docs\output\ui-scan\compliance-matrix.md`
- `docs\output\ui-scan\select-risk-report.md`
- `docs\output\ui-scan\cli-prompts\admin-central-stock.md`
- `docs\output\ui-scan\cli-prompts\admin-config.md`
- `docs\output\ui-scan\cli-prompts\admin-index.md`
- `docs\output\ui-scan\cli-prompts\admin-master-categorias.md`
- `docs\output\ui-scan\cli-prompts\admin-master-nomina.md`
- `docs\output\ui-scan\cli-prompts\admin-master-pos.md`
- `docs\output\ui-scan\cli-prompts\admin-master-proveedores.md`
- `docs\output\ui-scan\cli-prompts\admin-master-tarifario.md`
- `docs\output\ui-scan\cli-prompts\admin-pagos.md`
- `docs\output\ui-scan\cli-prompts\admin-reportes.md`
- `docs\output\ui-scan\cli-prompts\admin-semanal.md`
- `docs\output\ui-scan\cli-prompts\admin-solicitudes.md`
- `docs\output\ui-scan\cli-prompts\admin-workdays.md`
- `docs\output\ui-scan\cli-prompts\balance-semanal.md`
- `docs\output\ui-scan\cli-prompts\cms-members.md`
- `docs\output\ui-scan\cli-prompts\encargado-barra-index.md`
- `docs\output\ui-scan\cli-prompts\encargado-barra-noche.md`
- `docs\output\ui-scan\cli-prompts\encargado-barra-personal.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-index.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-noche.md`
- `docs\output\ui-scan\cli-prompts\encargado-caja-personal.md`
- `docs\output\ui-scan\cli-prompts\encargado-recepcion.md`
- `docs\output\ui-scan\cli-prompts\generator.md`
- `docs\output\ui-scan\cli-prompts\index.md`
- `docs\output\ui-scan\cli-prompts\logistica-distribucion.md`
- `docs\output\ui-scan\cli-prompts\logistica-index.md`
- `docs\output\ui-scan\cli-prompts\logistica-recepcion.md`
- `docs\output\ui-scan\cli-prompts\logistica-seguimiento.md`
- `docs\output\ui-scan\cli-prompts\logistica-stock.md`
- `docs\output\ui-scan\cli-prompts\my-qr.md`
- `docs\output\ui-scan\cli-prompts\operativo-analisis.md`
- `docs\output\ui-scan\cli-prompts\operativo-index.md`
- `docs\output\ui-scan\cli-prompts\operativo-master-proveedores.md`
- `docs\output\ui-scan\cli-prompts\operativo-master-sku.md`
- `docs\output\ui-scan\cli-prompts\operativo-solicitudes.md`
- `docs\output\ui-scan\cli-prompts\operativo-stock.md`
- `docs\output\ui-scan\cli-prompts\operativo-workday.md`
- `docs\output\ui-scan\cli-prompts\scanner-mock.md`
- `docs\output\ui-scan\cli-prompts\scanner.md`
- `docs\output\ui-scan\cli-prompts\staff-barra-index.md`
- `docs\output\ui-scan\cli-prompts\staff-caja-index.md`
- `docs\migration\README.md`
- `docs\migration\artifacts\erp-diagnostic-workdays.md`
- `docs\migration\artifacts\kpi-audit.md`
- `docs\migration\artifacts\README.md`
- `docs\migration\artifacts\roadmap_production.md`
- `docs\migration\artifacts\sprint3-implementation_plan.md`
- `docs\migration\artifacts\sprint3-walkthrough.md`
- `docs\migration\artifacts\ux_research_workdays.md`

## 7. Conversaciones previas (0 encontradas)

No se encontraron conversaciones recientes sobre 'UI'.
