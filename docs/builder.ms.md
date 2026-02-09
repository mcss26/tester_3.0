

@@ -0,0 +1,387 @@
@@ -0,0 +1,387 @@
# Midnight Admin UI Components Library
This document outlines all reusable components extracted from the admin portal, with specifications for Figma export and implementation guidelines.
## Component Structure Overview
The component system is organized into:
- **Core Components**: Base interactive elements (buttons, inputs, dropdowns, avatars)
- **Composite Components**: Complex UI patterns combining multiple core components
- **Layout Components**: Structural containers and navigation elements
---
## Core Components
### 1. Avatar Component
**File**: `assets/css/components.css` (lines 963-978)  
**Classes**: `.avatar`, `.avatar-sm`
#### Specifications
- **Size**: 32px × 32px (default), 28px × 28px (`.avatar-sm`)
- **Background**: `var(--purple-500)` (#a855f7)
- **Border**: 1px solid `rgba(255, 255, 255, 0.15)`
- **Border Radius**: 8px
- **Text**: Centered initials, white, semi-bold
- **Hover State**: Scale 1.05, border brightens to `rgba(255, 255, 255, 0.2)`
#### HTML Usage
```html
<button class="avatar avatar-sm" id="user-avatar" aria-label="Menú de usuario">AB</button>
```
#### Figma Properties
- Component Name: `Avatar / Small`
- Variants: Size (Small, Default), State (Default, Hover)
- Text: 2-character string
- Background: Purple 500
---
### 2. Search Input Component
**File**: `assets/css/launcher.css` (lines 35-63)  
**Classes**: `.search-wrapper`, `.search-input`, `.search-icon`
#### Specifications
- **Container Width**: 100%, max-width 400px
- **Input Height**: 36px (`var(--control-h)`)
- **Padding Left**: 36px (for icon)
- **Border**: 1px solid `var(--border-subtle)`
- **Icon**: 16px × 16px SVG, positioned absolute right 12px
- **Placeholder Text**: "Buscar..."
- **Placeholder Color**: `var(--text-placeholder)`
#### HTML Usage
```html
<div class="search-wrapper">
   <input type="text" id="global-search" class="search-input" placeholder="Buscar...">
   <svg class="search-icon" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
   </svg>
</div>
```
#### Figma Properties
- Component Name: `Input / Search`
- Width: 400px
- Height: 36px
- Icon: Magnifying glass (system icon)
- Input State: Default, Focus, Disabled
---
### 3. Dropdown Menu Component
**File**: `assets/css/components.css` (lines 746-1058)  
**Classes**: `.dropdown-container`, `.dropdown-menu`, `.dropdown-item`, `.dropdown-divider`, `.dropdown-header`
#### Specifications
- **Container**: Position relative, display flex
- **Menu**: Position absolute, min-width 200px (for user menu)
- **Menu Background**: `var(--bg-surface)` with border
- **Items**: Display flex, gap 8px, padding 12px 16px
- **Item Hover**: Background `var(--bg-surface-hover)`
- **Divider**: Height 1px, color `var(--border-subtle)`
- **Danger State**: Color `var(--error)`, hover background red tint
#### HTML Usage
```html
<div class="dropdown-container">
   <button class="avatar avatar-sm" id="user-avatar" aria-label="Menú de usuario">AB</button>
   <div class="dropdown-menu dropdown-user hidden" id="user-menu" role="menu">
      <div class="dropdown-header">Usuario Name</div>
      <div class="dropdown-divider"></div>
      <a href="#" class="dropdown-item" role="menuitem">
         <svg class="dropdown-icon" viewBox="0 0 24 24"><!-- icon --></svg>
         <span>Profile</span>
      </a>
      <a href="#" class="dropdown-item dropdown-item-danger">
         <svg class="dropdown-icon" viewBox="0 0 24 24"><!-- icon --></svg>
         <span>Logout</span>
      </a>
   </div>
</div>
```
#### Figma Properties
- Component Name: `Dropdown / User Menu`
- States: Hidden, Open
- Items: Header, Menu Item, Divider, Danger Item
- Trigger: Avatar Button
---
### 4. Workday Status Badge
**File**: `assets/css/components.css` (lines 4-56)  
**Classes**: `.workday-status`, `.status-open`, `.status-planning`, `.status-closed`, `.workday-dot`
#### Specifications
- **Container**: Display flex, gap 8px, padding 6px 14px
- **Border Radius**: 999px (pill shape)
- **Font Size**: 11px, font-weight 600
- **Text Transform**: Uppercase
- **Letter Spacing**: 0.5px
- **States**:
  - **Open**: Border `rgba(74, 222, 128, 0.3)`, Background `rgba(74, 222, 128, 0.08)`, Color `#4ade80`
  - **Planning**: Border `rgba(251, 191, 36, 0.3)`, Background `rgba(251, 191, 36, 0.08)`, Color `#fbbf24`
  - **Closed**: Border `rgba(161, 161, 170, 0.3)`, Background `rgba(161, 161, 170, 0.08)`, Color `#a1a1aa`
- **Dot**: 6px × 6px, animated pulse, currentColor
- **Animation**: `pulse` 2s infinite (opacity 1 → 0.5 → 1)
#### HTML Usage
```html
<div class="workday-status status-open">
   <span class="workday-dot"></span>
   <span>Martes 06/07</span>
</div>
```
#### Figma Properties
- Component Name: `Badge / Workday Status`
- Variants: Status (Open, Planning, Closed)
- Content: Dot indicator + Status text
- Animation: Pulse on Open state
---
## Composite Components
### 5. Navigation Link Component
**File**: `assets/css/launcher.css` (lines 65-99)  
**Classes**: `.main-nav`, `.nav-link`, `.nav-badge`
#### Specifications
- **Container**: Display flex, gap 32px, flex-wrap wrap
- **Link**: 
  - Display inline-flex, padding 12px 24px
  - Border: 1px solid transparent
  - Border Radius: 8px
  - Font Size: 12px, font-weight 600
  - Text Transform: Uppercase, letter-spacing 1px
  - Color: `var(--text-tertiary)`
  - Transition: all 0.2s ease
- **Hover State**: 
  - Color: `var(--text-primary)`
  - Background: `rgba(255, 255, 255, 0.03)`
  - Border: `rgba(255, 255, 255, 0.08)`
- **Badge** (optional):
  - Position absolute, top -4px, right -4px
  - Min-width 18px, height 18px
  - Background: `var(--danger)` (#ef4444)
  - Border Radius: 999px
  - Font Size: 10px, font-weight 700
  - Color: White
#### HTML Usage
```html
<nav class="main-nav">
   <a href="page1.html" class="nav-link">Link One</a>
   <a href="page2.html" class="nav-link">
      Link Two
      <span class="nav-badge">3</span>
   </a>
</nav>
```
#### Figma Properties
- Component Name: `Navigation / Link Group`
- Child Component: `Navigation / Link Item`
- Variants: State (Default, Hover, Disabled), Badge (With/Without)
---
### 6. Portal Header Component
**File**: `pages/admin/admin-index.html` (lines 39-100)  
**Nested Components**: Breadcrumb, Avatar Dropdown, Workday Status
#### Specifications
- **Container Class**: `.topbar`
- **Layout**: Flex row with `topbar-start`, `topbar-center`, `topbar-end` sections
- **Height**: `var(--topbar-height)` (56px)
- **Background**: `var(--bg-surface)`
- **Border**: 1px bottom, `var(--border-subtle)`
#### Sections
1. **Breadcrumb** (`.topbar-start`): Semantic `<nav>` with breadcrumb items
2. **Center**: Workday status badge
3. **End** (`.topbar-end`): Avatar dropdown menu
#### HTML Usage
```html
<header class="topbar">
   <nav class="breadcrumb topbar-start">
      <span class="breadcrumb-item current">SECTION</span>
   </nav>
   <div class="topbar-center">
      <div class="workday-status status-open"><!-- --></div>
   </div>
   <div class="topbar-end">
      <!-- Avatar dropdown component -->
   </div>
</header>
```
#### Figma Properties
- Component Name: `Header / Portal`
- Sub-components: Breadcrumb, Workday Status, User Menu
- Height: 56px
- Responsive: Desktop layout
---
### 7. Portal Main Content Component
**File**: `assets/css/launcher.css` (lines 10-34)  
**Classes**: `.launcher-center`, `.launcher-title`, `.launcher-footer`
#### Specifications
- **Container**: Flex column, center aligned, gap 12px
- **Margin Top**: `calc(var(--topbar-height) + 40px)` (96px total)
- **Title** (`.launcher-title`):
  - Font Size: 64px (responsive: 40px on mobile)
  - Font Weight: 800
  - Color: `var(--text-primary)`
  - Letter Spacing: -1px
  - Margin: 0, text-align center
- **Footer** (`.launcher-footer`):
  - Position fixed, bottom 0, full width
  - Font Size: 10px
  - Color: `var(--text-tertiary)`
  - Opacity: 0.5
  - Padding: 16px
#### HTML Usage
```html
<main class="launcher-center">
   <h1 class="launcher-title">PAGE TITLE</h1>
   <div class="search-wrapper"><!-- search component --></div>
   <nav class="main-nav"><!-- navigation links --></nav>
</main>
<footer class="launcher-footer">
   &copy; 2026 Midnight Systems
</footer>
```
#### Figma Properties
- Component Name: `Layout / Portal Main`
- Responsive: Desktop (1920px), Tablet (768px), Mobile (375px)
- Safe areas for content
---
## Design Tokens Reference
### Colors
- **Text Primary**: `#ffffff` (var(--text-primary))
- **Text Secondary**: `#d4d4d8` (var(--text-secondary))
- **Text Tertiary**: `#a1a1aa` (var(--text-tertiary))
- **Success**: `#4ade80` (var(--success))
- **Warning**: `#fbbf24` (var(--warning))
- **Danger/Error**: `#ef4444` (var(--danger))
- **Purple 500**: `#a855f7` (Avatar default)
### Spacing
- Control Height: 36px (var(--control-h))
- Control Height Small: 28px (var(--control-h-sm))
- Standard Gap: 8px, 16px, 24px, 32px
### Typography
- Font Family: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif
- Base Font Size: 13px (var(--fs-base))
- Small Font Size: 11px (var(--fs-sm))
- Large Font Size: 14px (var(--fs-lg))
- Title Font Size: 64px (var(--fs-4xl))
### Border Radius
- Small: 4px (var(--radius-sm))
- Medium: 6px (var(--radius-md))
- Large: 10px (var(--radius-lg))
- Full/Pill: 9999px (var(--radius-full))
---
## Figma Export Instructions
### Option 1: Manual Export (Recommended for Initial Setup)
1. Open Figma design file
2. Create a new project called "Midnight Admin Components"
3. Manually create components based on specifications above
4. Organize in component library following the structure:
   ```
   Midnight Admin/
   ├── Core/
   │   ├── Avatar
   │   ├── Badge
   │   ├── Dropdown
   │   └── Input
   ├── Composite/
   │   ├── Navigation
   │   ├── Header
   │   └── Search
   └── Layout/
       └── Portal Main
   ```
### Option 2: Programmatic Export (Advanced)
Use the Figma REST API to create components:
```bash
# Install Figma CLI
npm install -g @figma/cli
# Create components from JSON specification
figma components create --file [FILE_ID] --data components.json
```
### Option 3: HTML to Figma Plugin
Use Figma's "Design Tokens" or "Component from Code" plugins:
1. Install plugin in Figma
2. Upload component HTML files
3. Auto-generate Figma components
---
## Implementation Guidelines
### Creating New Components
1. Define component in CSS with semantic class names
2. Create HTML markup following accessibility standards
3. Document component in this file with:
   - File location
   - CSS classes
   - Specifications (dimensions, colors, states)
   - HTML usage example
   - Figma properties
### Using Components
- Import required CSS files (tokens.css, components.css, launcher.css)
- Use semantic HTML with proper ARIA attributes
- Apply class names as documented
- Leverage CSS variables for consistent theming
### Naming Convention
- **Classes**: Kebab-case (`.component-name`, `.component-name-variant`)
- **IDs**: Camel-case for JavaScript hooks (`#userMenu`, `#globalSearch`)
- **CSS Variables**: Kebab-case with prefix (`--text-primary`, `--bg-surface`)
---
## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
All components use CSS3 features (CSS Grid, Flexbox, CSS Variables, Animations).
---
## Version History
- **v1.0** (2026-02-09): Initial component extraction and documentation
  - Extracted 7 core and composite components
  - Documented for Figma export
  - Added accessibility improvements
---
## Questions or Updates?
For component updates, modifications, or Figma export questions, please reference this documentation and the source CSS/HTML files indicated for each component.
assets/css/launcher.css

+76

-27

@@ -1,6 +1,7 @@
/* =========================================================================
   LAUNCHER PAGE — Shared styles for index/landing pages
   Used by: admin-index.html, encargado-barra-index.html
   ========================================================================= */
body.launcher-page {
@@ -8,6 +9,7 @@
  overflow: hidden;
}
.launcher-center {
  flex: 1;
  display: flex;
@@ -18,7 +20,8 @@
  margin-top: calc(var(--topbar-height) + 40px);
}
.main-title {
  font-size: 64px;
  font-weight: 800;
  color: var(--text-primary);
@@ -27,29 +30,59 @@
  text-align: center;
}
/* WORKDAY STATUS BADGE
   Moved to components.css (Global Component)
*/
/* QUICK LINKS */
.quick-links {
  display: flex;
  gap: 32px;
  margin-top: 8px;
}
.nav-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
}
.nav-link:hover {
@@ -58,13 +91,18 @@
  border-color: rgba(255, 255, 255, 0.08);
}
.nav-link.is-disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
}
/* BADGE for pending items */
.nav-badge {
  position: absolute;
  top: -4px;
@@ -73,8 +111,8 @@
  height: 18px;
  padding: 0 5px;
  border-radius: 99px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
@@ -83,27 +121,38 @@
  line-height: 1;
}
/* LAUNCHER SEARCH (replaces inline styles) */
.launcher-search {
  width: 100%;
  max-width: 400px;
  margin: 8px 0;
}
.launcher-search .input {
  width: 100%;
  padding-left: 36px;
}
/* FOOTER */
.launcher-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10px;
  color: var(--text-tertiary);
  padding: 16px;
  opacity: 0.5;
}
@@ -1,6 +1,7 @@
/* =========================================================================
   LAUNCHER PAGE — Shared styles for index/landing pages
   Used by: admin-index.html, encargado-barra-index.html
   Component: Portal/Dashboard entry points
   ========================================================================= */
body.launcher-page {
@@ -8,6 +9,7 @@
  overflow: hidden;
}
/* MAIN CONTENT LAYOUT */
.launcher-center {
  flex: 1;
  display: flex;
@@ -18,7 +20,8 @@
  margin-top: calc(var(--topbar-height) + 40px);
}
/* PAGE TITLE */
.launcher-title {
  font-size: 64px;
  font-weight: 800;
  color: var(--text-primary);
@@ -27,29 +30,59 @@
  text-align: center;
}
/* SEARCH COMPONENT */
.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 8px 0;
}
.search-input {
  width: 100%;
  padding-left: 36px;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  pointer-events: none;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* MAIN NAVIGATION */
.main-nav {
  display: flex;
  gap: 32px;
  margin-top: 8px;
}
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.nav-link:hover {
@@ -58,13 +91,18 @@
  border-color: rgba(255, 255, 255, 0.08);
}
.nav-link:focus-visible {
  outline: 2px solid var(--accent-focus);
  outline-offset: 2px;
}
.nav-link.is-disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
}
/* BADGE INDICATOR for nav links */
.nav-badge {
  position: absolute;
  top: -4px;
@@ -73,8 +111,8 @@
  height: 18px;
  padding: 0 5px;
  border-radius: 99px;
  background: var(--danger);
  color: var(--neutral-1000);
  font-size: 10px;
  font-weight: 700;
  display: flex;
@@ -83,27 +121,38 @@
  line-height: 1;
}
/* FOOTER */
.launcher-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  text-align: center;
  font-size: 10px;
  color: var(--text-tertiary);
  opacity: 0.5;
}
/* RESPONSIVE ADJUSTMENTS */
@media (max-width: 768px) {
  .launcher-title {
    font-size: 40px;
  }
  .main-nav {
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 300px;
  }
  .nav-link {
    width: 100%;
    justify-content: center;
  }
  .search-wrapper {
    max-width: 300px;
  }
}
assets/js/modules/admin/admin-portal.js

+220

-0

@@ -0,0 +1,220 @@
@@ -0,0 +1,220 @@
/**
 * Admin Portal Module
 * Handles authentication, user profile display, workday status, and navigation menu
 * 
 * Features:
 * - Auth guard and session validation
 * - User avatar with initials
 * - Workday status display with real-time updates
 * - Dropdown menu with logout functionality
 * - Keyboard & click-away handling for accessibility
 */
(async function () {
    'use strict';
    // ===== CONSTANTS =====
    const ROLE_GUARD = ['admin'];
    
    // ===== DOM REFERENCES =====
    const domRefs = {
        avatar: document.getElementById('user-avatar'),
        userNameDisplay: document.getElementById('user-name-display'),
        userMenu: document.getElementById('user-menu'),
        workdayStatus: document.getElementById('workday-status'),
        workdayText: document.getElementById('workday-text'),
        logoutBtn: document.getElementById('btn-logout'),
        globalSearch: document.getElementById('global-search')
    };
    // ===== VALIDATION =====
    // Verify all required DOM elements exist
    if (!domRefs.avatar || !domRefs.userMenu) {
        console.warn('Required DOM elements not found for admin portal');
        return;
    }
    // ===== AUTHENTICATION =====
    /**
     * Guard access to this page based on user role
     */
    const session = await window.Auth.guard(ROLE_GUARD);
    if (!session) return;
    // ===== USER PROFILE =====
    /**
     * Initialize user display with name and avatar initials
     */
    function initializeUserProfile() {
        const user = session.user;
        const metadata = user.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || user.email || 'User';
        
        // Generate avatar initials
        const initials = fullName
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase();
        
        domRefs.avatar.textContent = initials;
        domRefs.userNameDisplay.textContent = fullName;
        domRefs.avatar.setAttribute('aria-label', `Menú de usuario - ${fullName}`);
    }
    // ===== WORKDAY STATUS =====
    /**
     * Update workday status indicator
     */
    async function updateWorkdayStatus() {
        try {
            const workday = await window.WorkDayHelper.getOpenWorkDay();
            
            if (workday) {
                updateWorkdayDisplay(workday);
            } else {
                updateWorkdayDisplay(null);
            }
        } catch (error) {
            console.warn('WorkDay fetch error:', error);
            domRefs.workdayText.textContent = 'Error';
        }
    }
    /**
     * Helper: Update workday display with status and formatting
     */
    function updateWorkdayDisplay(workday) {
        if (!workday) {
            domRefs.workdayText.textContent = 'Sin jornada activa';
            domRefs.workdayStatus.classList.remove('status-open', 'status-planning');
            domRefs.workdayStatus.classList.add('status-closed');
            return;
        }
        // Format date
        const date = new Date(workday.work_date + 'T12:00:00');
        const dayName = date.toLocaleDateString('es-AR', { weekday: 'long' });
        const dayNum = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        domRefs.workdayText.textContent = `${dayName} ${dayNum}`;
        // Update status classes
        domRefs.workdayStatus.classList.remove('status-closed', 'status-planning');
        const statusClass = workday.status === 'open' ? 'status-open' : 'status-planning';
        domRefs.workdayStatus.classList.add(statusClass);
    }
    // ===== DROPDOWN MENU =====
    /**
     * Initialize dropdown menu interactions
     */
    function initializeDropdown() {
        // Toggle on avatar click
        domRefs.avatar.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown();
        });
        // Close on document click (click away)
        document.addEventListener('click', () => {
            closeDropdown();
        });
        // Close on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeDropdown();
            }
        });
        // Prevent closing when clicking inside menu
        domRefs.userMenu.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
    /**
     * Toggle dropdown visibility
     */
    function toggleDropdown() {
        const isHidden = domRefs.userMenu.classList.contains('hidden');
        
        if (isHidden) {
            openDropdown();
        } else {
            closeDropdown();
        }
    }
    /**
     * Open dropdown menu
     */
    function openDropdown() {
        domRefs.userMenu.classList.remove('hidden');
        domRefs.avatar.setAttribute('aria-expanded', 'true');
    }
    /**
     * Close dropdown menu
     */
    function closeDropdown() {
        domRefs.userMenu.classList.add('hidden');
        domRefs.avatar.setAttribute('aria-expanded', 'false');
    }
    // ===== LOGOUT =====
    /**
     * Initialize logout functionality
     */
    function initializeLogout() {
        if (!domRefs.logoutBtn) return;
        domRefs.logoutBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            
            if (confirm('¿Cerrar sesión?')) {
                try {
                    await window.Auth.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Error al cerrar sesión. Por favor intente nuevamente.');
                }
            }
        });
    }
    // ===== SEARCH FUNCTIONALITY =====
    /**
     * Initialize global search functionality (placeholder for future expansion)
     */
    function initializeSearch() {
        if (!domRefs.globalSearch) return;
        domRefs.globalSearch.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const searchTerm = domRefs.globalSearch.value.trim();
                if (searchTerm) {
                    // TODO: Implement search navigation logic
                    console.log('Search:', searchTerm);
                }
            }
        });
    }
    // ===== INITIALIZATION SEQUENCE =====
    /**
     * Initialize all portal components
     */
    function initialize() {
        initializeUserProfile();
        initializeDropdown();
        initializeLogout();
        initializeSearch();
        updateWorkdayStatus();
    }
    // Run initialization
    initialize();
})();
assets/js/utils/figma-export.js

+365

-0

@@ -0,0 +1,365 @@
@@ -0,0 +1,365 @@
/**
 * Figma Export Utility
 * Provides utilities to export components to Figma via REST API
 * 
 * Requirements:
 * - Figma Access Token (https://www.figma.com/developers/api#authentication)
 * - File ID for target Figma file
 * 
 * Usage:
 * 1. Set up Figma token: export FIGMA_TOKEN="your_token_here"
 * 2. Run: node assets/js/utils/figma-export.js
 */
// This is a placeholder for client-side implementation
// For actual Figma API integration, use a Node.js backend or Figma CLI
/**
 * Component Metadata for Figma Export
 * Can be used with Figma REST API or plugins
 */
const COMPONENTS_METADATA = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    components: [
        {
            name: 'Avatar / Small',
            group: 'Core/Avatar',
            description: 'Small user avatar with initials',
            properties: {
                width: 28,
                height: 28,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#a855f7',
                border: '1px solid rgba(255, 255, 255, 0.15)'
            },
            variants: {
                size: ['Small', 'Default'],
                state: ['Default', 'Hover']
            },
            documentation: 'Avatar component with initials. Used for user identification.',
            cssClass: '.avatar.avatar-sm'
        },
        {
            name: 'Input / Search',
            group: 'Core/Input',
            description: 'Search input with magnifying glass icon',
            properties: {
                width: 400,
                height: 36,
                maxWidth: '100%',
                borderRadius: 6,
                fontSize: 13,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                paddingLeft: 36,
                backgroundColor: '#000000'
            },
            variants: {
                state: ['Default', 'Focus', 'Disabled']
            },
            documentation: 'Search input component with icon. Responsive width.',
            cssClass: '.search-wrapper',
            icon: 'magnifying-glass'
        },
        {
            name: 'Badge / Workday Status',
            group: 'Core/Badge',
            description: 'Status indicator with pulse animation',
            properties: {
                height: 24,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                paddingX: 14,
                paddingY: 6,
                textTransform: 'uppercase',
                letterSpacing: 0.5
            },
            variants: {
                status: ['Open', 'Planning', 'Closed']
            },
            statusColors: {
                open: {
                    bg: 'rgba(74, 222, 128, 0.08)',
                    border: 'rgba(74, 222, 128, 0.3)',
                    text: '#4ade80'
                },
                planning: {
                    bg: 'rgba(251, 191, 36, 0.08)',
                    border: 'rgba(251, 191, 36, 0.3)',
                    text: '#fbbf24'
                },
                closed: {
                    bg: 'rgba(161, 161, 170, 0.08)',
                    border: 'rgba(161, 161, 170, 0.3)',
                    text: '#a1a1aa'
                }
            },
            documentation: 'Workday status badge with animated dot indicator.',
            cssClass: '.workday-status'
        },
        {
            name: 'Navigation / Link Item',
            group: 'Composite/Navigation',
            description: 'Navigation link with optional badge',
            properties: {
                height: 'auto',
                paddingX: 24,
                paddingY: 12,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1
            },
            variants: {
                state: ['Default', 'Hover', 'Disabled'],
                badge: ['Without', 'With']
            },
            documentation: 'Navigation link with hover state and optional notification badge.',
            cssClass: '.nav-link'
        },
        {
            name: 'Dropdown / User Menu',
            group: 'Composite/Dropdown',
            description: 'User menu with profile and logout options',
            properties: {
                minWidth: 200,
                borderRadius: 6,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: '#000000',
                fontSize: 13
            },
            variants: {
                state: ['Hidden', 'Open']
            },
            children: [
                { name: 'Header', type: 'text' },
                { name: 'Divider', type: 'line' },
                { name: 'Menu Item', type: 'button' },
                { name: 'Danger Item', type: 'button' }
            ],
            documentation: 'Dropdown menu component with header, items, and dividers.',
            cssClass: '.dropdown-menu.dropdown-user'
        },
        {
            name: 'Header / Portal',
            group: 'Layout/Header',
            description: 'Top navigation bar with breadcrumb, status, and user menu',
            properties: {
                height: 56,
                layout: 'flexRow',
                sections: ['topbar-start', 'topbar-center', 'topbar-end']
            },
            children: [
                { name: 'Breadcrumb', component: 'Breadcrumb' },
                { name: 'Workday Status', component: 'Badge / Workday Status' },
                { name: 'User Menu', component: 'Dropdown / User Menu' }
            ],
            documentation: 'Main header component combining navigation, status, and user controls.',
            cssClass: '.topbar'
        },
        {
            name: 'Layout / Portal Main',
            group: 'Layout/Container',
            description: 'Main content area for portal pages',
            properties: {
                layout: 'flexColumn',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginTop: 96,
                minHeight: 'calc(100vh - topbar)'
            },
            children: [
                { name: 'Title', type: 'heading' },
                { name: 'Search', component: 'Input / Search' },
                { name: 'Navigation', component: 'Navigation / Link Group' }
            ],
            documentation: 'Main layout container for portal pages with centered content.',
            cssClass: '.launcher-center'
        }
    ]
};
/**
 * Export components metadata as JSON
 * Can be imported into Figma via API or plugins
 */
function exportComponentsMetadata() {
    return JSON.stringify(COMPONENTS_METADATA, null, 2);
}
/**
 * Generate Figma Design System description
 */
function generateFigmaReadme() {
    const markdown = `
# Midnight Admin Components - Figma Import Guide
## Overview
This design system contains ${COMPONENTS_METADATA.components.length} components organized into 3 categories:
- **Core Components**: Base interactive elements (Avatar, Input, Badge, Dropdown)
- **Composite Components**: Complex patterns (Navigation, Header, Search)
- **Layout Components**: Structural containers (Portal Main)
## Import Methods
### Method 1: Figma REST API (Recommended for Automation)
Use the Figma API to programmatically create components:
\`\`\`javascript
const figmaToken = 'YOUR_TOKEN_HERE';
const fileId = 'YOUR_FILE_ID_HERE';
const response = await fetch(\`https://api.figma.com/v1/files/\${fileId}/components\`, {
    method: 'POST',
    headers: {
        'X-Figma-Token': figmaToken,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(COMPONENTS_METADATA)
});
\`\`\`
### Method 2: Figma CLI
\`\`\`bash
figma components import --file-id [FILE_ID] --json components.json
\`\`\`
### Method 3: Manual Import via Plugin
1. Install "Figma Design System" plugin
2. Upload components.json
3. Auto-generate Figma components
### Method 4: Design Tokens Export
1. Use "Design Tokens" plugin in Figma
2. Import tokens.css variables
3. Create token library
## Component Organization
\`\`\`
📁 Midnight Admin
├── 📁 Core
│   ├── Avatar
│   ├── Badge / Workday Status
│   ├── Dropdown / User Menu
│   └── Input / Search
├── 📁 Composite
│   ├── Header / Portal
│   └── Navigation / Link Item
└── 📁 Layout
    └── Layout / Portal Main
\`\`\`
## CSS Variable Integration
All components use CSS variables for consistent theming. Import from:
- \`assets/css/tokens.css\` - Design tokens and semantic colors
- \`assets/css/components.css\` - Component styles
- \`assets/css/launcher.css\` - Portal layout styles
## Responsive Design
Components support responsive breakpoints:
- **Desktop**: 1920px (no constraints)
- **Tablet**: 768px and below
- **Mobile**: 375px and below
See COMPONENTS.md for detailed specifications.
## Export Date
Generated: ${new Date().toISOString()}
## Next Steps
1. Review component specifications in COMPONENTS.md
2. Choose import method based on your workflow
3. Create components in Figma design file
4. Add to team library for reuse
5. Sync with development team
`;
    return markdown;
}
/**
 * Export as TypeScript types for Figma API integration
 */
function generateTypeDefinitions() {
    const types = `
/**
 * Figma Component Metadata Types
 * For use with Figma REST API integration
 */
export interface ComponentProperty {
    width?: number;
    height?: number;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    backgroundColor?: string;
    border?: string;
    [key: string]: any;
}
export interface ComponentVariant {
    [key: string]: string[];
}
export interface ComponentMetadata {
    name: string;
    group: string;
    description: string;
    properties: ComponentProperty;
    variants: ComponentVariant;
    documentation: string;
    cssClass: string;
    icon?: string;
    children?: ComponentChild[];
    statusColors?: Record<string, any>;
}
export interface ComponentChild {
    name: string;
    type?: string;
    component?: string;
}
export interface DesignSystemMetadata {
    version: string;
    exportDate: string;
    components: ComponentMetadata[];
}
// Export metadata for use with Figma API
export const COMPONENTS_METADATA: DesignSystemMetadata = ${JSON.stringify(COMPONENTS_METADATA, null, 2)};
`;
    return types;
}
// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COMPONENTS_METADATA,
        exportComponentsMetadata,
        generateFigmaReadme,
        generateTypeDefinitions
    };
}
// For browser environment, make available globally
if (typeof window !== 'undefined') {
    window.FigmaExport = {
        COMPONENTS_METADATA,
        exportComponentsMetadata,
        generateFigmaReadme,
        generateTypeDefinitions
    };
}
pages/admin/admin-index.html

+51

-87

@@ -15,14 +15,14 @@
<body class="app-shell admin-shell launcher-page" data-allowed-roles="admin">
   <!-- TOPBAR (Same as admin-central-stock) -->
   <header class="topbar">
      <!-- Left: Breadcrumb -->
      <nav class="breadcrumb topbar-start">
         <span class="breadcrumb-item current">ADMINISTRACIÓN</span>
      </nav>
      <!-- Center: Workday Status -->
      <div class="topbar-center">
         <div id="workday-status" class="workday-status status-closed">
            <span class="workday-dot"></span>
@@ -30,50 +30,75 @@
         </div>
      </div>
      <!-- Right: Notifications + Avatar -->
      <div class="topbar-end">
         <!-- User Menu Dropdown -->
         <div class="dropdown-container">
            <button class="avatar avatar-sm" id="user-avatar" aria-label="Menú de usuario">...</button>
            <div class="dropdown-menu dropdown-user hidden" id="user-menu">
               <div class="dropdown-header" id="user-name-display">Usuario</div>
               <div class="dropdown-divider"></div>
               <a href="./admin-config.html" class="dropdown-item">
                  <svg class="dropdown-icon" viewBox="0 0 24 24">
                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                     <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Perfil
               </a>
               <div class="dropdown-divider"></div>
               <a href="#" id="btn-logout" class="dropdown-item dropdown-item-danger">
                  <svg class="dropdown-icon" viewBox="0 0 24 24">
                     <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                     <polyline points="16 17 21 12 16 7"></polyline>
                     <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Cerrar Sesión
               </a>
            </div>
         </div>
      </div>
   </header>
   <!-- CENTER CONTENT -->
   <main class="launcher-center">
      <h1 class="main-title">MIDNIGHT CLUB</h1>
      <!-- Search Bar -->
      <div class="launcher-search">
         <input type="text" id="global-search" class="input" placeholder="Buscar..." aria-label="NavegaciÃ³n rÃ¡pida">
         <svg class="header-search-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
         </svg>
      </div>
      <nav class="quick-links">
         <a href="admin-workdays.html" class="nav-link">Workdays</a>
         <a href="admin-central-stock.html" class="nav-link">Stock Central</a>
         <a href="admin-pagos.html" class="nav-link">Payments</a>
@@ -96,69 +121,8 @@
   <script defer src="../../assets/js/core/work-day-helper.js"></script>
   <script defer src="../../assets/js/core/navigation.js"></script>
   <script>
      (async function () {
         'use strict';
         // Auth Guard
         const session = await window.Auth.guard(['admin']);
         if (!session) return;
         const avatar = document.getElementById('user-avatar');
         const userNameDisplay = document.getElementById('user-name-display');
         const userMenu = document.getElementById('user-menu');
         const workdayStatus = document.getElementById('workday-status');
         const workdayText = document.getElementById('workday-text');
         const logoutBtn = document.getElementById('btn-logout');
         // 1. Set user info
         const user = session.user;
         const meta = user.user_metadata || {};
         const fullName = meta.full_name || meta.name || user.email || '';
         const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
         avatar.textContent = initials;
         userNameDisplay.textContent = fullName || user.email;
         // 2. Load workday status
         try {
            const workday = await window.WorkDayHelper.getOpenWorkDay();
            if (workday) {
               const date = new Date(workday.work_date + 'T12:00:00');
               const dayName = date.toLocaleDateString('es-AR', { weekday: 'long' });
               const dayNum = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
               workdayText.textContent = `${dayName} ${dayNum}`;
               workdayStatus.classList.remove('status-closed', 'status-planning');
               workdayStatus.classList.add(workday.status === 'open' ? 'status-open' : 'status-planning');
            } else {
               workdayText.textContent = 'Sin jornada activa';
               workdayStatus.classList.remove('status-open', 'status-planning');
               workdayStatus.classList.add('status-closed');
            }
         } catch (err) {
            console.warn('WorkDay fetch error:', err);
            workdayText.textContent = 'Error';
         }
         // 3. Avatar Dropdown Toggle
         avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('hidden');
         });
         document.addEventListener('click', () => {
            userMenu.classList.add('hidden');
         });
         // 4. Logout
         logoutBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('¿Cerrar sesión?')) {
               await window.Auth.logout();
            }
         });
      })();
   </script>
</body>
</html>
@@ -15,14 +15,14 @@
<body class="app-shell admin-shell launcher-page" data-allowed-roles="admin">
   <!-- TOPBAR HEADER -->
   <header class="topbar">
      <!-- Left: Breadcrumb Navigation -->
      <nav class="breadcrumb topbar-start">
         <span class="breadcrumb-item current">ADMINISTRACIÓN</span>
      </nav>
      <!-- Center: Workday Status Indicator -->
      <div class="topbar-center">
         <div id="workday-status" class="workday-status status-closed">
            <span class="workday-dot"></span>
@@ -30,50 +30,75 @@
         </div>
      </div>
      <!-- Right: User Controls -->
      <div class="topbar-end">
         <!-- User Menu Dropdown Component -->
         <div class="dropdown-container">
            <button
               class="avatar avatar-sm"
               id="user-avatar"
               aria-label="Menú de usuario"
               aria-haspopup="true"
               aria-expanded="false"
            >...</button>
            <div
               class="dropdown-menu dropdown-user hidden"
               id="user-menu"
               role="menu"
            >
               <div class="dropdown-header" id="user-name-display">Usuario</div>
               <div class="dropdown-divider" role="separator"></div>
               <a
                  href="./admin-config.html"
                  class="dropdown-item"
                  role="menuitem"
               >
                  <svg class="dropdown-icon" viewBox="0 0 24 24" aria-hidden="true">
                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                     <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Perfil</span>
               </a>
               <div class="dropdown-divider" role="separator"></div>
               <a
                  href="#"
                  id="btn-logout"
                  class="dropdown-item dropdown-item-danger"
                  role="menuitem"
               >
                  <svg class="dropdown-icon" viewBox="0 0 24 24" aria-hidden="true">
                     <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                     <polyline points="16 17 21 12 16 7"></polyline>
                     <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Cerrar Sesión</span>
               </a>
            </div>
         </div>
      </div>
   </header>
   <!-- MAIN CONTENT AREA -->
   <main class="launcher-center">
      <h1 class="launcher-title">MIDNIGHT CLUB</h1>
      <!-- Quick Search Component -->
      <div class="search-wrapper">
         <input
            type="text"
            id="global-search"
            class="search-input"
            placeholder="Buscar..."
            aria-label="Búsqueda de navegación rápida"
         >
         <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
         </svg>
      </div>
      <!-- Main Navigation Links -->
      <nav class="main-nav">
         <a href="admin-workdays.html" class="nav-link">Workdays</a>
         <a href="admin-central-stock.html" class="nav-link">Stock Central</a>
         <a href="admin-pagos.html" class="nav-link">Payments</a>
@@ -96,69 +121,8 @@
   <script defer src="../../assets/js/core/work-day-helper.js"></script>
   <script defer src="../../assets/js/core/navigation.js"></script>
   <script defer src="../../assets/js/modules/admin/admin-portal.js"></script>
</body>
</html>
pages/components-showcase.html

+448

-0

@@ -0,0 +1,448 @@
@@ -0,0 +1,448 @@
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0a0a0f">
    <link rel="icon" type="image/svg+xml" href="../assets/img/favicon.svg">
    <title>Midnight Components Showcase — Design System</title>
    <link rel="stylesheet" href="../assets/css/tokens.css">
    <link rel="stylesheet" href="../assets/css/components.css">
    <link rel="stylesheet" href="../assets/css/launcher.css">
    <style>
        /* SHOWCASE-SPECIFIC STYLES */
        body {
            background: var(--bg-body);
            color: var(--text-primary);
        }
        .showcase-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .showcase-header {
            margin-bottom: 60px;
            padding-bottom: 40px;
            border-bottom: 1px solid var(--border-subtle);
        }
        .showcase-title {
            font-size: 48px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 16px;
            letter-spacing: -1px;
        }
        .showcase-subtitle {
            font-size: 16px;
            color: var(--text-secondary);
            margin: 0;
        }
        .showcase-section {
            margin-bottom: 80px;
        }
        .section-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 32px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--border-active);
        }
        .component-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
        }
        .component-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s ease;
        }
        .component-card:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--border-active);
        }
        .component-name {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-primary);
            margin: 0 0 8px;
        }
        .component-description {
            font-size: 13px;
            color: var(--text-secondary);
            margin: 0 0 20px;
            line-height: 1.4;
        }
        .component-demo {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60px;
        }
        .component-specs {
            font-size: 11px;
            color: var(--text-tertiary);
            background: rgba(255, 255, 255, 0.02);
            padding: 12px;
            border-radius: 6px;
            margin-top: 16px;
            font-family: var(--font-mono);
            line-height: 1.5;
        }
        .export-section {
            background: rgba(74, 222, 128, 0.08);
            border: 1px solid rgba(74, 222, 128, 0.3);
            border-radius: 12px;
            padding: 24px;
            margin: 40px 0;
        }
        .export-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--success);
            margin: 0 0 12px;
        }
        .export-description {
            color: var(--text-secondary);
            margin: 0 0 16px;
            line-height: 1.5;
        }
        .export-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--success);
            color: var(--neutral-0);
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            font-size: 13px;
        }
        .export-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(74, 222, 128, 0.2);
        }
        .breadcrumb-demo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-secondary);
        }
        .breadcrumb-item {
            color: var(--text-tertiary);
        }
        .breadcrumb-separator {
            color: var(--text-tertiary);
            opacity: 0.5;
        }
        @media (max-width: 768px) {
            .showcase-title {
                font-size: 32px;
            }
            .section-title {
                font-size: 18px;
            }
            .component-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="showcase-container">
        <!-- HEADER -->
        <div class="showcase-header">
            <h1 class="showcase-title">Midnight UI Components</h1>
            <p class="showcase-subtitle">Reusable component library for admin portal • Ready for Figma export</p>
        </div>
        <!-- EXPORT INSTRUCTIONS -->
        <div class="export-section">
            <h2 class="export-title">Ready for Figma?</h2>
            <p class="export-description">
                This component library has been documented for Figma export. Reference <code>COMPONENTS.md</code> for detailed specifications, or use <code>assets/js/utils/figma-export.js</code> for programmatic export via Figma API.
            </p>
            <a href="../COMPONENTS.md" class="export-button">
                <span>📋</span>
                <span>View Component Specs</span>
            </a>
        </div>
        <!-- CORE COMPONENTS -->
        <div class="showcase-section">
            <h2 class="section-title">Core Components</h2>
            <div class="component-grid">
                <!-- AVATAR -->
                <div class="component-card">
                    <h3 class="component-name">Avatar</h3>
                    <p class="component-description">User avatar with initials and hover state</p>
                    <div class="component-demo">
                        <button class="avatar avatar-sm" title="User Avatar">AB</button>
                    </div>
                    <div class="component-specs">
                        Size: 28px × 28px<br>
                        Class: .avatar.avatar-sm<br>
                        Background: #a855f7
                    </div>
                </div>
                <!-- SEARCH INPUT -->
                <div class="component-card">
                    <h3 class="component-name">Search Input</h3>
                    <p class="component-description">Text input with integrated search icon</p>
                    <div class="component-demo">
                        <div class="search-wrapper" style="width: 100%;">
                            <input type="text" class="search-input" placeholder="Buscar..." disabled style="width: 100%;">
                            <svg class="search-icon" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                    <div class="component-specs">
                        Height: 36px<br>
                        Class: .search-wrapper<br>
                        Max-width: 400px
                    </div>
                </div>
                <!-- WORKDAY STATUS -->
                <div class="component-card">
                    <h3 class="component-name">Status Badge</h3>
                    <p class="component-description">Workday status indicator with animation</p>
                    <div class="component-demo" style="flex-direction: column; gap: 8px;">
                        <div class="workday-status status-open">
                            <span class="workday-dot"></span>
                            <span>Abierta</span>
                        </div>
                        <div class="workday-status status-planning">
                            <span class="workday-dot"></span>
                            <span>Planeada</span>
                        </div>
                        <div class="workday-status status-closed">
                            <span class="workday-dot"></span>
                            <span>Cerrada</span>
                        </div>
                    </div>
                    <div class="component-specs">
                        Height: 24px<br>
                        Class: .workday-status<br>
                        Variants: Open, Planning, Closed
                    </div>
                </div>
                <!-- DROPDOWN -->
                <div class="component-card">
                    <h3 class="component-name">Dropdown Menu</h3>
                    <p class="component-description">User menu with profile and logout options</p>
                    <div class="component-demo" style="position: relative; height: 150px;">
                        <div class="dropdown-container">
                            <button class="avatar avatar-sm" id="demo-avatar">JD</button>
                            <div class="dropdown-menu dropdown-user" style="position: relative; opacity: 1; visibility: visible;">
                                <div class="dropdown-header">John Doe</div>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item">
                                    <svg class="dropdown-icon" viewBox="0 0 24 24">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    Profile
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item dropdown-item-danger">
                                    <svg class="dropdown-icon" viewBox="0 0 24 24">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="component-specs">
                        Min-width: 200px<br>
                        Class: .dropdown-menu<br>
                        States: Hidden, Open
                    </div>
                </div>
            </div>
        </div>
        <!-- COMPOSITE COMPONENTS -->
        <div class="showcase-section">
            <h2 class="section-title">Composite Components</h2>
            <div class="component-grid">
                <!-- NAVIGATION LINKS -->
                <div class="component-card">
                    <h3 class="component-name">Navigation Links</h3>
                    <p class="component-description">Navigation menu with optional status badges</p>
                    <div class="component-demo">
                        <nav class="main-nav" style="gap: 12px;">
                            <a href="#" class="nav-link">Workdays</a>
                            <a href="#" class="nav-link">
                                Stock
                                <span class="nav-badge">3</span>
                            </a>
                        </nav>
                    </div>
                    <div class="component-specs">
                        Class: .main-nav<br>
                        Item: .nav-link<br>
                        Badge: .nav-badge
                    </div>
                </div>
                <!-- HEADER TOPBAR -->
                <div class="component-card">
                    <h3 class="component-name">Header / Topbar</h3>
                    <p class="component-description">Top navigation bar with breadcrumb and user menu</p>
                    <div class="component-demo" style="flex-direction: column; gap: 12px; align-items: flex-start; padding: 12px; background: rgba(0, 0, 0, 0.5);">
                        <nav class="breadcrumb-demo">
                            <span class="breadcrumb-item">Home</span>
                            <span class="breadcrumb-separator">/</span>
                            <span class="breadcrumb-item">Admin</span>
                        </nav>
                        <div class="workday-status status-open">
                            <span class="workday-dot"></span>
                            <span>Lunes 06/07</span>
                        </div>
                    </div>
                    <div class="component-specs">
                        Height: 56px<br>
                        Class: .topbar<br>
                        Sections: start, center, end
                    </div>
                </div>
            </div>
        </div>
        <!-- LAYOUT COMPONENTS -->
        <div class="showcase-section">
            <h2 class="section-title">Layout Components</h2>
            <div class="component-grid">
                <div class="component-card">
                    <h3 class="component-name">Portal Main Layout</h3>
                    <p class="component-description">Centered content area for portal pages</p>
                    <div class="component-demo" style="height: auto; flex-direction: column; gap: 16px;">
                        <h2 style="font-size: 32px; font-weight: 800; margin: 0;">Page Title</h2>
                        <div class="search-wrapper">
                            <input type="text" class="search-input" placeholder="Search..." disabled>
                            <svg class="search-icon" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                    <div class="component-specs">
                        Class: .launcher-center<br>
                        Title: .launcher-title<br>
                        Responsive: Mobile to Desktop
                    </div>
                </div>
            </div>
        </div>
        <!-- DESIGN TOKENS -->
        <div class="showcase-section">
            <h2 class="section-title">Design Tokens</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px;">
                    <h4 style="margin: 0 0 12px; font-size: 12px; color: var(--text-tertiary); text-transform: uppercase;">Colors</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; background: #ffffff; border-radius: 2px; border: 1px solid var(--border-subtle);"></div>
                            <span>Primary #ffffff</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; background: #a855f7; border-radius: 2px;"></div>
                            <span>Purple #a855f7</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; background: #4ade80; border-radius: 2px;"></div>
                            <span>Success #4ade80</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; background: #ef4444; border-radius: 2px;"></div>
                            <span>Danger #ef4444</span>
                        </div>
                    </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px;">
                    <h4 style="margin: 0 0 12px; font-size: 12px; color: var(--text-tertiary); text-transform: uppercase;">Spacing</h4>
                    <div style="font-family: var(--font-mono); font-size: 11px; line-height: 1.6; color: var(--text-secondary);">
                        --control-h: 36px<br>
                        --control-h-sm: 28px<br>
                        --space-sm: 8px<br>
                        --space-md: 16px<br>
                        --space-lg: 24px
                    </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px;">
                    <h4 style="margin: 0 0 12px; font-size: 12px; color: var(--text-tertiary); text-transform: uppercase;">Typography</h4>
                    <div style="font-family: var(--font-mono); font-size: 11px; line-height: 1.6; color: var(--text-secondary);">
                        Font: Inter<br>
                        Base: 13px<br>
                        Small: 11px<br>
                        Large: 14px<br>
                        Title: 64px
                    </div>
                </div>
            </div>
        </div>
        <!-- FOOTER -->
        <div style="margin-top: 80px; padding-top: 40px; border-top: 1px solid var(--border-subtle); text-align: center; color: var(--text-tertiary); font-size: 12px;">
            <p>Midnight Admin Components • Design System v1.0</p>
            <p>For Figma export details, see <code>COMPONENTS.md</code></p>
        </div>
    </div>
    <script src="../assets/js/utils/figma-export.js"></script>
    <script>
        // Showcase-specific script
        console.log('Component Showcase loaded');
        console.log('Export metadata available at:', window.FigmaExport?.COMPONENTS_METADATA);
    </script>
</body>
</html>

Dev Command


Setup Command



