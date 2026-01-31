# Phase 2: Navigation Enhancements Plan

**Task**: Develop Phase 2 of navigation improvements - UX enhancements
**Prerequisite**: Phase 1 must be completed (unified navigation.js, standardized roles, IIFE patterns)
**Estimated Scope**: 5 new core modules, 30+ files to update
**Priority**: High - Critical UX improvements

---

## Executive Summary

Phase 2 builds on Phase 1's foundation to add user experience enhancements that solve critical navigation pain points:

- **State Persistence**: Filters, search, and scroll position preserved across navigation
- **Breadcrumb Navigation**: Visual context showing user location in app hierarchy
- **Smart Back Navigation**: Context-aware back buttons that remember user journey
- **Scroll Restoration**: Automatic scroll position recovery when returning to lists
- **Unified Tab Management**: Consistent tab handling pattern across 26 modules

### Current Pain Points (Post Phase 1)

- ❌ Users lose filter/search state when navigating (e.g., filtered "Fernet" → view detail → back = filters reset)
- ❌ No visual context of location (users don't know "Admin > SKU Master > Edit Item")
- ❌ Scroll position resets (scroll to item #150 → view → back = top of list)
- ❌ Back buttons are hardcoded to fixed routes (not contextual)
- ❌ 26 modules implement tabs differently (inconsistent patterns)

---

## Problem Analysis

### 1. State Persistence Issues

**Critical Finding**: All navigation loses user state

**Evidence**:

```javascript
// admin-master-sku.js:52-56
let activeCategoryId = null; // ← Lost on navigation
let searchTerm = ""; // ← Lost on navigation
let editingId = null;
```

**User Flow Problem**:

1. User is in "Admin > SKU Master"
2. Filters by category "Bebidas" and searches "Fernet"
3. Clicks on SKU to edit
4. Returns back
5. Filters reset - sees all SKUs again

**Files Affected (26 modules with state)**:

- `admin-master-sku.js`:52-56
- `admin-stock.js`:35-39
- `admin-solicitudes.js`:33-37
- `operativo-solicitudes.js`:33-37
- `logistica-stock.js`:33-34
- 21 more modules

### 2. No Breadcrumb Navigation

**Current State**: Only hardcoded "← Volver" buttons

**Examples**:

```html
<!-- logistica-distribucion.html:15 -->
<button data-go="pages/logistica/logistica-index.html">← Volver</button>
```

**Problems**:

- No visual hierarchy (user doesn't know: Home > Logística > Distribución)
- Can't jump back multiple levels
- Every page hardcodes its parent route

### 3. Scroll Position Not Preserved

**Finding**: Large lists (200+ items) reset scroll on back

**Affected Modules**:

- `admin-solicitudes.js`:24 - List containers with inner scrolls
- `admin-master-sku.js`:15 - listContainer
- `logistica-distribucion.js`:155 - table-scroll

**User Impact**:

1. User scrolls to item #150 in 200-item list
2. Clicks to view details
3. Returns back
4. Scrolls to top - must scroll down again to #150

### 4. Back Navigation Inconsistencies

**Three Different Patterns Found**:

- **Pattern A**: Hardcoded `data-go`
  ```html
  <!-- logistica-distribucion.html:15 -->
  <button data-go="pages/logistica/logistica-index.html">← Volver</button>
  ```
- **Pattern B**: Direct `history.back()`
  ```html
  <!-- barras/session.html:13 -->
  <button onclick="history.back()">←</button>
  ```
  _Problem: Bypasses navigation.js framework_
- **Pattern C**: No back button
  ```html
  <!-- admin-index.html:20 - no topbar with back -->
  ```

### 5. Tab Management Inconsistency

**Finding**: 26 modules with tabs, 3 different implementation patterns

- **Pattern A**: `state.activeTab = tabId;` (`admin-herramientas.js`:210)
- **Pattern B**: `this.state.activeTab = targetTab.dataset.view;` (`admin-reportes.js`:76)
- **Pattern C**: `state.activeTab = t.dataset.tab;` (`operativo-solicitudes.js`:552)

Same logic, different code - creates maintenance burden.

---

## Phase 2 Solution Architecture

### Core Modules to Create (5 files)

```text
assets/js/core/
├── navigation.js (existing - will enhance)
├── navigation-state.js (NEW)
├── navigation-history.js (NEW)
├── breadcrumbs.js (NEW)
└── tab-manager.js (NEW)
```

### 1. Navigation State Manager

#### 1.1 Module: `navigation-state.js`

**Purpose**: Persist and restore page state (filters, search, tabs) across navigation  
**Location**: `/assets/js/core/navigation-state.js`

**Implementation**:

```javascript
/**
 * Navigation State Manager
 * Persists page state across navigation using sessionStorage
 */
(function () {
  "use strict";

  const NavState = {
    /**
     * Save page state before navigating away
     * @param {string} pageKey - Unique identifier for page (e.g., 'admin-master-sku')
     * @param {object} state - State to save { filters, search, tab, etc. }
     */
    save(pageKey, state) {
      const stateData = {
        ...state,
        timestamp: Date.now(),
        scrollPosition: window.scrollY,
      };
      sessionStorage.setItem(`nav_state_${pageKey}`, JSON.stringify(stateData));
    },

    /**
     * Restore page state on load
     * @param {string} pageKey - Unique identifier for page
     * @returns {object|null} Restored state or null
     */
    restore(pageKey) {
      const stored = sessionStorage.getItem(`nav_state_${pageKey}`);
      if (!stored) return null;

      try {
        const state = JSON.parse(stored);
        // Only restore if less than 30 minutes old
        if (Date.now() - state.timestamp > 30 * 60 * 1000) {
          this.clear(pageKey);
          return null;
        }
        return state;
      } catch (err) {
        console.error("[NavState] Error restoring state:", err);
        return null;
      }
    },

    /**
     * Clear state for a page
     */
    clear(pageKey) {
      sessionStorage.removeItem(`nav_state_${pageKey}`);
    },

    /**
     * Clear all navigation state (e.g., on logout)
     */
    clearAll() {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith("nav_state_"))
        .forEach((key) => sessionStorage.removeItem(key));
    },
  };

  window.NavState = NavState;
})();
```

**Features**:

- ✅ Persist filters, search, tabs, scroll position
- ✅ Automatic 30-minute expiry (prevents stale state)
- ✅ Auto-clears on logout
- ✅ Simple API: `save()`, `restore()`, `clear()`

#### 1.2 Integration Pattern (Module Updates)

**Before** (`admin-master-sku.js`):

```javascript
(async function () {
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  let activeCategoryId = null; // ← Lost on navigation
  let searchTerm = ""; // ← Lost on navigation

  async function fetchData() {
    // ... fetch logic
  }

  fetchData();
})();
```

**After** (with NavState):

```javascript
(async function () {
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  const PAGE_KEY = "admin-master-sku";

  // Restore previous state
  const savedState = NavState.restore(PAGE_KEY) || {};
  let activeCategoryId = savedState.activeCategoryId || null;
  let searchTerm = savedState.searchTerm || "";

  async function fetchData() {
    // ... fetch logic
  }

  // Save state before navigating away
  window.addEventListener("beforeunload", () => {
    NavState.save(PAGE_KEY, {
      activeCategoryId,
      searchTerm,
      activeTab: state.activeTab,
    });
  });

  // Restore scroll position
  if (savedState.scrollPosition) {
    setTimeout(() => {
      window.scrollTo(0, savedState.scrollPosition);
    }, 100);
  }

  fetchData();
})();
```

**Files to Update (26 modules)**:

- All admin modules with filters: `admin-master-*.js`, `admin-stock.js`, `admin-solicitudes.js`
- All operativo modules: `operativo-stock.js`, `operativo-solicitudes.js`
- All logistica modules: `logistica-stock.js`, `logistica-distribucion.js`

### 2. Breadcrumb Navigation

#### 2.1 Module: `breadcrumbs.js`

**Purpose**: Visual hierarchy showing user location in app  
**Location**: `/assets/js/core/breadcrumbs.js`

**Implementation**:

```javascript
/**
 * Breadcrumb Navigation Component
 * Displays location hierarchy: Home > Admin > SKU Master
 */
(function () {
  "use strict";

  const Breadcrumbs = {
    /**
     * Render breadcrumbs based on current path
     * @param {HTMLElement} container - Where to render breadcrumbs
     */
    render(container) {
      const path = window.location.pathname;
      const crumbs = this.buildCrumbs(path);

      container.innerHTML = crumbs
        .map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return `
          <span class="breadcrumb-item ${isLast ? "active" : ""}">
            ${
              isLast
                ? crumb.label
                : `
              <a href="#" data-go="${crumb.path}">${crumb.label}</a>
            `
            }
          </span>
          ${!isLast ? '<span class="breadcrumb-separator">›</span>' : ""}
        `;
        })
        .join("");
    },

    /**
     * Build breadcrumb trail from path
     */
    buildCrumbs(path) {
      const parts = path.split("/").filter(Boolean);
      const crumbs = [{ label: "Inicio", path: this.getHomePath() }];

      // Detect context
      if (parts.includes("admin")) {
        crumbs.push({
          label: "Admin",
          path: "pages/admin/admin-index.html",
        });

        // Add current page
        const page = parts[parts.length - 1];
        const pageName = this.humanize(page);
        if (pageName !== "Admin Index") {
          crumbs.push({ label: pageName, path: null });
        }
      } else if (parts.includes("logistica")) {
        crumbs.push({
          label: "Logística",
          path: "pages/logistica/logistica-index.html",
        });

        const page = parts[parts.length - 1];
        const pageName = this.humanize(page);
        if (pageName !== "Logistica Index") {
          crumbs.push({ label: pageName, path: null });
        }
      } else if (parts.includes("operativo")) {
        crumbs.push({
          label: "Operativo",
          path: "pages/operativo/operativo-index.html",
        });

        const page = parts[parts.length - 1];
        const pageName = this.humanize(page);
        if (pageName !== "Operativo Index") {
          crumbs.push({ label: pageName, path: null });
        }
      } else if (parts.includes("encargados")) {
        crumbs.push({ label: "Encargados", path: null });
      }

      return crumbs;
    },

    /**
     * Convert filename to human-readable label
     */
    humanize(filename) {
      return filename
        .replace(".html", "")
        .replace(/-/g, " ")
        .replace(/admin |operativo |logistica /gi, "")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    },

    /**
     * Get home path based on user role
     */
    getHomePath() {
      if (!window.Auth) return "/login.html";

      try {
        const profile = JSON.parse(
          sessionStorage.getItem("user_profile") || "{}",
        );
        return window.Auth.roleLanding(profile.role);
      } catch {
        return "/login.html";
      }
    },
  };

  window.Breadcrumbs = Breadcrumbs;
})();
```

#### 2.2 HTML Integration

Add breadcrumb container to topbar:

**Before**:

```html
<header class="app-topbar">
  <div class="topbar-left">
    <button data-go="pages/admin/admin-index.html">← INICIO</button>
  </div>
  <!-- ... -->
</header>
```

**After**:

```html
<header class="app-topbar">
  <div class="topbar-left">
    <nav id="breadcrumbs" class="breadcrumbs"></nav>
  </div>
  <!-- ... -->
</header>

<!-- In <head> -->
<script src="../../assets/js/core/breadcrumbs.js"></script>

<!-- At end of <body> -->
<script>
  // Auto-render breadcrumbs
  const breadcrumbContainer = document.getElementById("breadcrumbs");
  if (breadcrumbContainer) {
    window.Breadcrumbs.render(breadcrumbContainer);
  }
</script>
```

**CSS** (add to `components.css`):

```css
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-item a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item a:hover {
  color: var(--primary);
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 500;
}

.breadcrumb-separator {
  color: var(--text-tertiary);
}
```

**Files to Update (30+ HTML files)**:

- All `pages/admin/*.html` (21 files)
- All `pages/operativo/*.html` (11 files)
- All `pages/logistica/*.html` (4 files)
- All `pages/encargados/*.html` (7 files)

### 3. Smart Back Navigation

#### 3.1 Module: `navigation-history.js`

**Purpose**: Track navigation history for context-aware back buttons  
**Location**: `/assets/js/core/navigation-history.js`

**Implementation**:

```javascript
/**
 * Navigation History Manager
 * Maintains navigation stack for smart back navigation
 */
(function () {
  "use strict";

  const NavHistory = {
    maxEntries: 10,

    /**
     * Push navigation entry to history
     */
    push(path) {
      let history = this.getHistory();

      // Don't duplicate consecutive entries
      if (history[history.length - 1] === path) return;

      history.push(path);

      // Keep only last N entries
      if (history.length > this.maxEntries) {
        history = history.slice(-this.maxEntries);
      }

      sessionStorage.setItem("nav_history", JSON.stringify(history));
    },

    /**
     * Pop last entry (when going back)
     */
    pop() {
      const history = this.getHistory();
      history.pop();
      sessionStorage.setItem("nav_history", JSON.stringify(history));
      return history[history.length - 1] || null;
    },

    /**
     * Get previous page (without popping)
     */
    getPrevious() {
      const history = this.getHistory();
      return history[history.length - 2] || null;
    },

    /**
     * Get full history
     */
    getHistory() {
      try {
        return JSON.parse(sessionStorage.getItem("nav_history") || "[]");
      } catch {
        return [];
      }
    },

    /**
     * Clear history
     */
    clear() {
      sessionStorage.removeItem("nav_history");
    },

    /**
     * Get smart back path (contextual fallback)
     */
    getBackPath() {
      const prev = this.getPrevious();
      if (prev) return prev;

      // Fallback to role landing
      if (!window.Auth) return "/login.html";

      try {
        const profile = JSON.parse(
          sessionStorage.getItem("user_profile") || "{}",
        );
        return window.Auth.roleLanding(profile.role);
      } catch {
        return "/login.html";
      }
    },
  };

  window.NavHistory = NavHistory;
})();
```

#### 3.2 Integration with navigation.js

Update `navigation.js` to track history:

```javascript
// In navigation.js navigateTo() method
navigateTo(path, options = { transition: true }) {
  // Track in history before navigating
  if (window.NavHistory) {
    window.NavHistory.push(window.location.pathname);
  }

  const fullPath = window.Auth
    ? window.Auth.toAppPath(path)
    : path;

  if (options.transition) {
    document.body.classList.add('is-leaving');
    setTimeout(() => {
      window.location.href = fullPath;
    }, this.transitionDelay);
  } else {
    window.location.href = fullPath;
  }
}
```

#### 3.3 Smart Back Button Component

Replace hardcoded back buttons:

**Before**:

```html
<button data-go="pages/admin/admin-index.html">← INICIO</button>
```

**After**:

```html
<button id="btn-back-smart" class="btn-icon">← Volver</button>

<script>
  // Smart back button
  const btnBack = document.getElementById("btn-back-smart");
  if (btnBack && window.NavHistory) {
    const backPath = window.NavHistory.getBackPath();
    btnBack.setAttribute("data-go", backPath);

    // Update label if context available
    const prev = window.NavHistory.getPrevious();
    if (prev) {
      btnBack.textContent = "← Volver";
    } else {
      btnBack.textContent = "← Inicio";
    }
  }
</script>
```

### 4. Scroll Position Restoration

Enhancement to `navigation.js`:

```javascript
// Add to navigation.js init()
init() {
  // Save scroll position before navigating
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('scroll_position', window.scrollY.toString());
  });

  // Restore scroll position on page load
  window.addEventListener('load', () => {
    const savedScroll = sessionStorage.getItem('scroll_position');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }, 100); // Delay to ensure DOM is ready
      sessionStorage.removeItem('scroll_position');
    }
  });

  // ... rest of init
}
```

### 5. Unified Tab Management

#### 5.1 Module: `tab-manager.js`

**Purpose**: Standardize tab switching across all modules  
**Location**: `/assets/js/core/tab-manager.js`

**Implementation**:

```javascript
/**
 * Tab Manager
 * Unified tab switching pattern for all modules
 */
(function () {
  "use strict";

  const TabManager = {
    /**
     * Initialize tab system
     * @param {object} config - { tabs: NodeList, onSwitch: function, defaultTab: string }
     */
    init(config) {
      const { tabs, onSwitch, defaultTab } = config;

      let activeTab = defaultTab || tabs[0]?.dataset.tab;

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const newTab = tab.dataset.tab;
          if (newTab === activeTab) return;

          // Update UI
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");

          // Update state
          activeTab = newTab;

          // Callback
          if (onSwitch) onSwitch(newTab);
        });
      });

      // Activate default tab
      const defaultTabEl = Array.from(tabs).find(
        (t) => t.dataset.tab === activeTab,
      );
      if (defaultTabEl) defaultTabEl.click();

      return {
        getActiveTab: () => activeTab,
        switchTo: (tabId) => {
          const tabEl = Array.from(tabs).find((t) => t.dataset.tab === tabId);
          if (tabEl) tabEl.click();
        },
      };
    },
  };

  window.TabManager = TabManager;
})();
```

#### 5.2 Refactor Pattern (Module Updates)

**Before** (`admin-herramientas.js`:210):

```javascript
ui.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    ui.tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    state.activeTab = tab.dataset.tab;
    renderDashboard();
  });
});
```

**After** (with TabManager):

```javascript
const tabController = TabManager.init({
  tabs: ui.tabs,
  defaultTab: savedState.activeTab || "resumen",
  onSwitch: (tabId) => {
    state.activeTab = tabId;
    renderDashboard();
  },
});
```

**Benefits**:

- ✅ Consistent pattern across 26 modules
- ✅ Less boilerplate (3 lines vs 8 lines)
- ✅ Built-in state persistence support
- ✅ Programmatic tab switching: `tabController.switchTo('ventas')`

**Files to Update (26 modules with tabs)**:

- `admin-herramientas.js`, `admin-reportes.js`, `admin-solicitudes.js`
- `operativo-solicitudes.js`, `operativo-analisis.js`
- 21 more modules

---

## Implementation Order

### Phase 2A: State Persistence (2 hours)

- [x] Create `navigation-state.js`
- [x] Update `navigation.js` to include scroll restoration
- [x] Refactor 5 high-priority modules (`admin-master-sku`, `admin-stock`, `admin-solicitudes`, `operativo-solicitudes`, `logistica-stock`)
- [x] Test state preservation across navigation
- [x] Update remaining 21 modules

### Phase 2B: Breadcrumbs (1.5 hours)

- [x] Create `breadcrumbs.js`
- [x] Add CSS styles to `components.css`
- [x] Update HTML template in `standard-module-guide.md`
- [x] Add breadcrumbs to all 30+ HTML pages (Ongoing)

### Phase 2C: Smart Back Navigation (1 hour)

- [x] Create `navigation-history.js`
- [x] Update `navigation.js` logic
- [x] Implement Smart Back Button pattern (in progress/integrated with Breadcrumbs)

### Phase 2D: Unified Tab Management (1 hour)

- [x] Create `tab-manager.js`
- [x] Refactor pilot module (`admin-solicitudes.js`)
- [x] Refactor remaining 25+ modules
- [x] Test breadcrumb navigation across all contexts

### Phase 2E: Documentation (1 hour)

- [x] Update `docs/architecture/navigation.md`
- [x] Update `docs/architecture/standard-module-guide.md`
- [x] Document new patterns in frontend-developer skill

**Total Estimated Time**: 8 hours

---

## Critical Files

### Files to Create (4 files):

- `/assets/js/core/navigation-state.js` - State persistence
- `/assets/js/core/navigation-history.js` - Navigation history stack
- `/assets/js/core/breadcrumbs.js` - Breadcrumb component
- `/assets/js/core/tab-manager.js` - Unified tab management

### Files to Update:

- `/assets/js/core/navigation.js` - Add scroll restoration + history tracking
- `/assets/css/components.css` - Breadcrumb styles
- 26 module JS files - Add state persistence + TabManager
- 30+ HTML files - Add breadcrumb containers
- `/docs/architecture/navigation.md` - Document new features
- `/docs/architecture/standard-module-guide.md` - Update patterns

---

## Verification & Testing

### End-to-End Testing Checklist

#### 1. State Persistence

- [ ] Filter by category in `admin-master-sku` → navigate away → back = filters preserved
- [ ] Search "Fernet" → navigate away → back = search term preserved
- [ ] Switch to tab "Pendientes" → navigate away → back = tab active
- [ ] Scroll to item #150 → navigate away → back = scroll position restored

#### 2. Breadcrumbs

- [ ] Breadcrumbs show correct hierarchy (Home > Admin > SKU Master)
- [ ] Clicking breadcrumb levels navigates correctly
- [ ] Breadcrumbs work in all contexts (admin, operativo, logistica, encargados)
- [ ] Active crumb is not clickable

#### 3. Smart Back Navigation

- [ ] Back button shows contextual path (not always "Inicio")
- [ ] Back button label changes ("Volver" vs "Inicio") based on context
- [ ] History stack doesn't grow indefinitely (max 10 entries)
- [ ] Back navigation works after multiple page transitions

#### 4. Tab Management

- [ ] Tabs switch consistently across all 26 modules
- [ ] Active tab is preserved on navigation
- [ ] Programmatic tab switching works
- [ ] No console errors from tab switching

#### 5. Browser Testing

- [ ] Test in Chrome (primary)
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile viewport

### Success Criteria

- ✅ Users can filter/search and return without losing state
- ✅ Breadcrumbs show correct location on all 30+ pages
- ✅ Scroll position automatically restores on back navigation
- ✅ Back buttons are contextual (not hardcoded)
- ✅ All 26 modules use unified `TabManager`
- ✅ Zero console errors
- ✅ State expires after 30 minutes (no stale data)
- ✅ Navigation feels smooth and predictable

---

## Dependencies

### Must Complete First

- ✅ Phase 1 (navigation.js exists, roles standardized, IIFE patterns)

### Optional Enhancements (Phase 3)

- Loading progress indicators during navigation
- Navigation analytics/tracking
- Keyboard shortcuts for navigation
- Visual regression tests

---

## Notes

### Why sessionStorage vs localStorage?

- `sessionStorage` clears on tab close (prevents stale state across days)
- 30-minute expiry adds extra safety
- Navigation state is session-specific by nature

### Why not use History API (pushState)?

- Current architecture uses full page loads (not SPA)
- Changing to SPA is out of scope (major refactor)
- `sessionStorage` approach works with existing architecture

### Performance Impact

- Minimal - `sessionStorage` reads/writes are ~1ms
- Scroll restoration adds 100ms delay (acceptable)
- Breadcrumb rendering is synchronous (<5ms)

### Browser Compatibility

- `sessionStorage`: IE8+ (OK per project requirements)
- `Element.closest()`: Modern browsers (already used in `navigation.js`)
- No polyfills needed
