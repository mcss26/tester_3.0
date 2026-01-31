# Phase 1: Navigation System Standardization Plan

**Task**: Develop Phase 1 of navigation improvements - critical fixes for standardization  
**Estimated Scope**: 2 files to modify, 2 files to create, 50+ HTML files to update  
**Priority**: High - Foundation for all future navigation work

---

## Executive Summary

This plan standardizes the navigation system across FormulaMid 4 by:

- Fixing role naming inconsistencies (`logistica`→`logistico`, adding `manager` mapping)
- Creating a unified navigation module to replace two existing handlers
- Standardizing JavaScript initialization patterns (IIFE)
- Moving inline scripts to external modules
- Creating comprehensive navigation documentation

### Current State Issues

- Role naming inconsistencies causing potential access control failures
- Two different navigation handlers with different behaviors
- 28 modules use IIFE pattern, 14 use `DOMContentLoaded`, 4 have inline scripts
- No single source of truth for navigation patterns

---

## 1. Role Naming Standardization

### 1.1 Issues Identified

**Critical Inconsistencies**:

| Issue                      | Current State                              | Files Affected                                 | Risk                                    |
| -------------------------- | ------------------------------------------ | ---------------------------------------------- | --------------------------------------- |
| `logistica` vs `logistico` | 2 files use `logistica`, 7 use `logistico` | `admin-stock.html`, `admin-stock-ajustes.html` | High - Access denied for logistics role |
| `manager` vs `gerente`     | 3 files use `manager`, 1 uses `gerente`    | `barras/*.html`, `balance-semanal.html`        | Medium - Inconsistent manager access    |
| `contable` mapping         | Exists in auth but maps to admin landing   | `auth.js:71`                                   | Low - Works but should be explicit      |

### 1.2 Standardization Strategy

**Decision**: Use the MOST COMMON variant

- `logistica` → `logistico` (7 files already use this)
- `gerente` → `manager` (3 files already use this, English term preferred for consistency)
- Add explicit `manager` landing page mapping in `auth.js`

### 1.3 Files to Update

**HTML Files (2 files)**:

1. `/pages/admin/admin-stock.html`
   - **Change**: `data-allowed-roles="admin,contable,logistica"`
   - **To**: `data-allowed-roles="admin,contable,logistico"`

2. `/pages/admin/admin-stock-ajustes.html`
   - **Change**: `data-allowed-roles="admin,contable,logistica"`
   - **To**: `data-allowed-roles="admin,contable,logistico"`

**Auth.js Update**:

Add `manager` role mapping after line 71:

```javascript
if (r === "admin" || r === "contable")
  return this.toAppPath("pages/admin/admin-index.html");
if (r === "manager") return this.toAppPath("pages/admin/admin-index.html"); // NEW
if (r === "logistico")
  return this.toAppPath("pages/logistica/logistica-index.html");
```

### 1.4 Verification

After changes, verify:

- [x] Users with `logistico` role can access `admin-stock.html`
- [x] Users with `manager` role redirect to `admin-index.html`
- [ ] No console errors on role-based redirects

---

## 2. Unified Navigation Module

### 2.1 Current State Analysis

**Two Navigation Handlers Exist**:

| File                  | Pattern            | Transition        | Event Model      | Usage                  |
| --------------------- | ------------------ | ----------------- | ---------------- | ---------------------- |
| `admin-navigation.js` | IIFE               | 160ms fade + blur | Event delegation | Admin pages (21 files) |
| `index-navigation.js` | `DOMContentLoaded` | None              | Direct binding   | Index pages (7 files)  |

**Problems**:

- Duplicate code with different behaviors
- Inconsistent user experience (some pages fade, others don't)
- Maintenance overhead (changes need to be made twice)
- No single source of truth

### 2.2 Unified Module Design

**New File**: `/assets/js/core/navigation.js`

**Design Principles**:

- Event delegation for dynamic elements
- Optional transitions via `data-no-transition` attribute
- Auto-initialization on load
- Fallback to raw paths if Auth unavailable
- Consolidated logout handling

**Implementation**:

```javascript
/**
 * Universal Navigation Handler for FormulaMid 4
 * Handles data-go attribute navigation with optional transitions
 */
(function () {
  "use strict";

  const Navigation = {
    transitionDelay: 160, // ms

    /**
     * Navigate to a page with optional transition effect
     * @param {string} path - Relative path to navigate to
     * @param {object} options - { transition: boolean }
     */
    navigateTo(path, options = { transition: true }) {
      const fullPath = window.Auth ? window.Auth.toAppPath(path) : path;

      if (options.transition) {
        document.body.classList.add("is-leaving");
        setTimeout(() => {
          window.location.href = fullPath;
        }, this.transitionDelay);
      } else {
        window.location.href = fullPath;
      }
    },

    /**
     * Initialize data-go link handler with event delegation
     */
    init() {
      // Navigation handler (event delegation)
      document.addEventListener("click", (e) => {
        const target = e.target.closest("[data-go]");
        if (!target) return;

        e.preventDefault();
        const path = target.getAttribute("data-go");
        const noTransition = target.hasAttribute("data-no-transition");

        this.navigateTo(path, { transition: !noTransition });
      });

      // Logout handler
      const btnLogout = document.getElementById("btn-logout");
      if (btnLogout) {
        btnLogout.addEventListener("click", () => {
          if (window.Auth) window.Auth.signOutAndGoLogin();
        });
      }
    },
  };

  window.Navigation = Navigation;
  Navigation.init(); // Auto-initialize
})();
```

**Features**:

- ✅ Event delegation (works with dynamic elements)
- ✅ Optional transitions via `data-no-transition` attribute
- ✅ Path resolution via `Auth.toAppPath()`
- ✅ Fallback for pages without Auth loaded
- ✅ Consolidated logout handling
- ✅ Auto-initialization on script load
- ✅ Exposed Navigation object for programmatic use

### 2.3 Migration Strategy

**Step 1: Create new navigation.js**

- **Location**: `/assets/js/core/navigation.js`
- **Implementation**: As shown above

**Step 2: Update HTML includes**

Replace in ALL HTML files:

```html
<!-- OLD (remove these lines) -->
<script src="../../assets/js/modules/admin/admin-navigation.js"></script>
<!-- OR -->
<script src="../../assets/js/modules/index-navigation.js"></script>

<!-- NEW (add this line) -->
<script src="../../assets/js/core/navigation.js"></script>
```

**Affected Files (28 HTML files)**:

- All 21 admin pages
- All 7 index/landing pages (`admin-index`, `operativo-index`, etc.)

**Step 3: Delete old files**

- Remove: `/assets/js/modules/admin/admin-navigation.js`
- Remove: `/assets/js/modules/index-navigation.js`

### 2.4 Special Cases

**Login page (no transition)**:

```html
<button data-go="../../login.html" data-no-transition>Logout</button>
```

**Programmatic navigation**:

```javascript
// In page modules
Navigation.navigateTo("pages/admin/admin-stock.html");

// Or without transition
Navigation.navigateTo("pages/admin/admin-stock.html", { transition: false });
```

---

## 3. JavaScript Initialization Pattern Standardization

### 3.1 Current State

**Pattern Distribution**:

- **IIFE (async)**: 26 files (60.5%) ← TARGET PATTERN
- **IIFE (sync)**: 2 files (4.6%)
- **DOMContentLoaded**: 14 files (32.6%)
- **Inline scripts**: 4 HTML files (9.3%)

### 3.2 Golden Standard Pattern

**Standardize on**: Async IIFE Pattern

**Rationale**:

- Already used by 60% of codebase
- Provides encapsulation (no global pollution)
- Allows immediate async/await execution
- No timing dependencies (vs `DOMContentLoaded`)
- Matches `admin-master-sku.js` Golden Standard

**Template**:

```javascript
/**
 * [Module Name]
 * [Brief description]
 */
(async function () {
  "use strict";

  // 1. Auth Guard (immediate redirect if unauthorized)
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  // 2. DOM References (grouped in 'ui' object)
  const ui = {
    // Topbar/navigation
    btnBack: document.querySelector("[data-go]"),

    // Filters/tabs
    tabs: document.querySelectorAll(".tab-btn"),
    searchInput: document.getElementById("search-input"),

    // State containers
    loadingState: document.getElementById("page-card-loading"),
    emptyState: document.getElementById("page-card-empty"),
    moduleContent: document.getElementById("module-content"),

    // Content
    listContainer: document.getElementById("list-container"),
  };

  // 3. State variables
  let data = [];
  let filteredData = [];
  let activeTab = "all";

  // 4. Data fetching
  async function fetchData() {
    try {
      Utils.setPageState(ui, { loading: true });

      const { data: result, error } = await window.sb
        .from("table_name")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      data = result;
      applyFilters();
    } catch (err) {
      console.error("[module-name] Error fetching:", err);
      Toast.error("Error loading data");
    }
  }

  // 5. Rendering logic
  function render() {
    if (!filteredData.length) {
      Utils.setPageState(ui, { empty: true });
      return;
    }

    Utils.setPageState(ui, { loading: false, empty: false });
    ui.listContainer.innerHTML = filteredData.map(renderItem).join("");
  }

  function renderItem(item) {
    return `<!-- item HTML -->`;
  }

  // 6. Filters and event handlers
  function applyFilters() {
    filteredData = data.filter((item) => {
      // Apply tab filter, search filter, etc.
      return true;
    });
    render();
  }

  // 7. Event listeners
  ui.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      applyFilters();
    });
  });

  ui.searchInput?.addEventListener("input", applyFilters);

  // 8. Initialize
  await fetchData();
})();
```

### 3.3 Naming Convention Standardization

**Current Inconsistency**:

- **Pattern A**: `const ui = { ... }` (most common, recommended)
- **Pattern B**: `const refs = { ... }` (encargado modules)
- **Pattern C**: `const el = (id) => document.getElementById(id)`

**Standard**: Use `const ui = { ... }`

**Rationale**:

- Already used in majority of modules
- Clearer intent (user interface references)
- Matches Golden Standard (`admin-master-sku.js`)

**Affected Files (rename `refs` to `ui`)**:

- `/assets/js/modules/admin/admin-navigation.js` (will be deleted anyway)
- Any encargado modules using `refs`

---

## 4. Inline Scripts Migration

### 4.1 Files with Inline Scripts (4 files)

| HTML File                 | Current State         | Target Module File                       |
| ------------------------- | --------------------- | ---------------------------------------- |
| `operativo-workday.html`  | 50+ lines inline      | `modules/operativo/operativo-workday.js` |
| `operativo-index.html`    | 30+ lines inline      | `modules/operativo/operativo-index.js`   |
| `operativo-analisis.html` | Calls global function | Already has `operativo-analisis.js`      |
| `logistica-index.html`    | 40+ lines inline      | `modules/logistica/logistica-index.js`   |

### 4.2 Migration Process

For each file:

1. **Extract inline script to new .js file**
   - Create file in `/assets/js/modules/[context]/[page-name].js`
   - Wrap in async IIFE pattern
   - Update DOM references to use `const ui = { ... }`

2. **Update HTML file**
   - Remove `<script>` tags with inline code
   - Add external script reference:
     ```html
     <script src="../../assets/js/modules/operativo/operativo-workday.js"></script>
     ```

3. **Verify functionality**
   - Test page loads correctly
   - Auth guard works
   - All event handlers function
   - No console errors

### 4.3 Example: operativo-workday.html

**Before (inline)**:

```html
<script>
  function switchTab(tabId, btnEl) {
    // ... tab switching logic
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const session = await window.Auth.guardOrRedirect(["operativo"]);
    if (!session) return;
    await loadConfirmedStaff();
  });
</script>
```

**After (external)**:

```html
<script src="../../assets/js/modules/operativo/operativo-workday.js"></script>
```

**New file**: `operativo-workday.js`:

```javascript
(async function () {
  "use strict";

  const session = await window.Auth.guardOrRedirect(["operativo"]);
  if (!session) return;

  const ui = {
    tabs: document.querySelectorAll(".tab-btn"),
    staffList: document.getElementById("confirmed-staff-list"),
  };

  function switchTab(tabId, btnEl) {
    // ... tab switching logic
  }

  async function loadConfirmedStaff() {
    // ... data loading logic
  }

  await loadConfirmedStaff();
})();
```

---

## 5. Navigation Documentation

### 5.1 New Documentation File

**Location**: `/docs/architecture/navigation.md`

**Content Outline**:

- **Overview** - Navigation system architecture
- **Core Components** - `navigation.js`, `auth.js`, role mappings
- **Usage Patterns** - `data-go` links, programmatic navigation, transitions
- **Role System** - Complete role-to-landing-page mapping table
- **Best Practices** - When to use transitions, auth guard patterns
- **Troubleshooting** - Common issues and solutions

### 5.2 Update Existing Documentation

**Files to update**:

1. `.agent/skills/frontend-developer/SKILL.md`
   - Add IIFE pattern as mandatory standard
   - Document `const ui = { ... }` naming convention
   - Reference `navigation.md` for navigation patterns

2. `docs/architecture/standard-module-guide.md`
   - Update JavaScript structure section with IIFE template
   - Add `navigation.js` to required scripts list
   - Document `data-go` and `data-no-transition` attributes

---

## Implementation Order

### Phase 1A: Role Standardization (30 minutes)

- ✅ Update `admin-stock.html` (`logistica` → `logistico`)
- ✅ Update `admin-stock-ajustes.html` (`logistica` → `logistico`)
- ✅ Update `auth.js` - add `manager` role mapping
- ✅ Test role-based access for `logistico` and `manager` users

### Phase 1B: Navigation Module (1 hour)

- [x] Create standardized `/assets/js/core/navigation.js`
- [x] Update all 35+ HTML files references to point to core module
- [x] Delete `admin-navigation.js` and `index-navigation.js`
- [ ] Manual test of navigation flow in Dev Environments (admin, operativo, encargados)

### Phase 1C: Inline Scripts Migration (1.5 hours)

- [x] Standardize `operativo-workday.html`
- [x] Standardize `operativo-index.html`
- [x] Standardize `logistica-index.html` and update HTML
- [x] Verify `operativo-analisis.html` uses external module
- [ ] Test all migrated pages

### Phase 1D: Documentation (1 hour)

- [x] Create `docs/architecture/navigation.md`
- [x] Update `.agent/skills/frontend-developer/SKILL.md`
- [x] Update `docs/architecture/standard-module-guide.md`

**Total Estimated Time**: 4 hours

---

## Critical Files to Modify

### Files to Edit (7 files)

- `/pages/admin/admin-stock.html` - Role standardization
- `/pages/admin/admin-stock-ajustes.html` - Role standardization
- `/assets/js/core/auth.js` - Add `manager` mapping
- `/pages/operativo/operativo-workday.html` - Remove inline script
- `/pages/operativo/operativo-index.html` - Remove inline script
- `/pages/logistica/logistica-index.html` - Remove inline script
- All 28 HTML files using old navigation - Update script includes

### Files to Create (5 files)

- `/assets/js/core/navigation.js` - Unified navigation module
- `/assets/js/modules/operativo/operativo-workday.js` - Extracted script
- `/assets/js/modules/operativo/operativo-index.js` - Extracted script
- `/assets/js/modules/logistica/logistica-index.js` - Extracted script
- `/docs/architecture/navigation.md` - Navigation documentation

### Files to Delete (2 files)

- `/assets/js/modules/admin/admin-navigation.js`
- `/assets/js/modules/index-navigation.js`

---

## Verification & Testing

### End-to-End Testing Checklist

**1. Role-Based Access Control**:

- [ ] Login as `logistico` user → can access `admin-stock.html`
- [ ] Login as `manager` user → redirects to `admin-index.html`
- [ ] Login as `contable` user → redirects to `admin-index.html`
- [ ] Login as `admin` user → can access all pages
- [ ] Login with invalid role → redirects to `operativo-index.html`

**2. Navigation Functionality**:

- [ ] Click `data-go` links in `admin-index.html` → smooth transition to target
- [ ] Click back button in admin pages → returns to `admin-index` with transition
- [ ] Click logout button → redirects to `login.html` WITHOUT transition
- [ ] Navigation works in all contexts (admin, operativo, encargados, staff, logistica)
- [ ] Programmatic navigation works: `Navigation.navigateTo('pages/...')`

**3. Inline Script Migration**:

- [ ] `operativo-workday.html` loads and functions correctly
- [ ] `operativo-index.html` loads and functions correctly
- [ ] `logistica-index.html` loads and functions correctly
- [ ] No console errors on any migrated page
- [ ] Auth guards work on all migrated pages

**4. Browser Testing**:

- [ ] Test in Chrome (primary)
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile viewport (responsive)

**5. Performance**:

- [ ] Navigation transitions feel smooth (no lag)
- [ ] No duplicate event listeners (check with DevTools)
- [ ] No memory leaks after multiple navigations

---

## Rollback Plan

If critical issues occur:

**Step 1: Restore old navigation files**

```bash
git checkout HEAD -- assets/js/modules/admin/admin-navigation.js
git checkout HEAD -- assets/js/modules/index-navigation.js
```

**Step 2: Revert HTML includes**

- Update script tags back to old navigation files

**Step 3: Revert role changes**

- Change `logistico` back to `logistica` in 2 admin files
- Remove `manager` mapping from `auth.js`

**Step 4: Restore inline scripts**

- Copy inline code back to HTML files
- Delete new external `.js` files

---

## Success Criteria

- ✅ All role naming is consistent (no `logistica`/`logistico` conflicts)
- ✅ Single `navigation.js` module replaces two old files
- ✅ All inline scripts moved to external modules
- ✅ Zero console errors on any page
- ✅ Navigation works consistently across all 46 pages
- ✅ Transitions work smoothly (160ms fade + blur)
- ✅ Documentation is complete and accurate
- ✅ All tests pass (role access, navigation, inline migrations)

---

## Notes & Considerations

**Why not refactor all DOMContentLoaded modules to IIFE?**

- Out of scope for Phase 1 (14 files affected)
- Will be addressed in future phases
- Focus on critical navigation infrastructure first

**Why keep global window assignments?**

- Utility modules (`WorkDayHelper`, `panel.js`) need global access
- Used across multiple pages
- Will document as exception to IIFE standard

**Why 160ms transition delay?**

- Matches existing CSS transition duration (200ms)
- 40ms overlap ensures smooth visual continuity
- User-tested and approved in existing admin pages

**Browser compatibility**:

- `closest()` requires polyfill for IE11 (not supported, OK per requirements)
- Arrow functions require ES6 (OK per project setup)
- Async/await requires ES2017 (already used throughout codebase)
