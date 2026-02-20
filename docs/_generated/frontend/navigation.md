# Navigation System Architecture

**Version**: 1.0  
**Updated**: 2026-01-29  
**Status**: Standardized

---

## 1. Overview

The `FormulaMid 4` navigation system is a unified, event-driven module designed to handle page transitions, authentication checks, and role-based routing consistently across the entire application.

It replaces previous localized handlers (`admin-navigation.js`, `index-navigation.js`) with a single source of truth located at `/assets/js/core/navigation.js`.

---

## 2. Core Components

### 2.1 Navigation Module (`/assets/js/core/navigation.js`)

The specific implementation uses an IIFE pattern that auto-initializes on load. It provides:

- **Event Delegation**: Listens for clicks on any element with `data-go`.
- **Soft Transitions**: Applies CSS-based fade effects (controlled by `is-leaving` class) unless disabled.
- **Path Resolution**: Integrates with `Auth.toAppPath()` to ensure 404-safe routing.
- **Logout Handling**: Centralizes `signOutAndGoLogin` logic.

### 2.2 Auth Integration (`/assets/js/core/auth.js`)

Navigation relies on `Auth` for:

- **Base Path Resolution**: `Auth.toAppPath(path)` ensures links work from deep subdirectories.
- **Role Guards**: `Auth.guardOrRedirect(roles)` protects pages on load.
- **Landing Routing**: `Auth.roleLanding(role)` determines where a user goes after login.

---

## 3. Usage Patterns

### 3.1 Declarative Navigation (HTML default)

Use the `data-go` attribute on any clickable element (button, link, div).

```html
<!-- Standard Link with Transition -->
<button data-go="pages/admin/admin-stock.html">Ir a Stock</button>

<!-- Link WITHOUT Transition (e.g., Logout or Modal) -->
<button data-go="../../login.html" data-no-transition>Logout</button>
```

### 3.2 Programmatic Navigation (JS)

Use the exposed `Navigation` object.

```javascript
// With transition (default)
Navigation.navigateTo("pages/admin/stock.html");

// Without transition
Navigation.navigateTo("pages/login.html", { transition: false });
```

---

## 4. Role Mapping System

Roles are standardized to the following values in the database and code:

| Role Code     | Canonical Name | Landing Page                               |
| ------------- | -------------- | ------------------------------------------ |
| `admin`       | Administrator  | `/pages/admin/admin-index.html`            |
| `contable`    | Contabilidad   | `/pages/admin/admin-index.html`            |
| `manager`     | Gerente        | `/pages/admin/admin-index.html`            |
| `logistico`   | Logística      | `/pages/logistica/logistica-index.html`    |
| `operativo`   | Operaciones    | `/pages/operativo/operativo-index.html`    |
| `encargado_X` | Encargados     | `/pages/encargados/encargado-X-index.html` |

> **Note**: Previous variations like `logistica` (ending in 'a') or `gerente` are deprecated. Use the canonical codes above.

---

## 5. Troubleshooting & FAQ

**Q: Navigation clicks do nothing.**
A: Ensure `core/navigation.js` is included in your HTML usually after `auth.js`. Check console for errors.

**Q: Transition happens but page doesn't change.**
A: Check if the path in `data-go` is correct relative to the application root (e.g., `pages/...`).

**Q: Page reloads instantly without fade.**
A: Ensure the element doesn't have `data-no-transition` and that CSS for `.is-leaving` is loaded (`main.css`).

**Q: Logout button doesn't work.**
A: Ensure the button has `id="btn-logout"`. The navigation module automatically binds to this ID.
