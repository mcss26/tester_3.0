# State Management Guide — FormulaMid 4

## Pattern: Module-Scoped State Object

Every module uses a single `state` object declared at the top of its IIFE:

```javascript
(async function () {
    'use strict';
    
    const state = {
        items: [],
        currentTab: 'DEFAULT',
        isLoading: false
    };
    
    // All functions read/write state.xxx
})();
```

## Tab State Persistence

Use `window.NavState` to remember the user's active tab:

```javascript
const PAGE_KEY = 'admin-pagos';
const saved = window.NavState?.restore(PAGE_KEY) ?? {};

const state = {
    currentTab: saved.currentTab || 'DASHBOARD'
};

function switchTab(name) {
    state.currentTab = name;
    window.NavState?.save(PAGE_KEY, { currentTab: name });
}
```

## UI References (DOM Cache)

Cache all `getElementById` / `querySelector` calls in a `ui` object:

```javascript
const ui = {
    table: document.querySelector('#myTable tbody'),
    modal: document.getElementById('myModal'),
    btnSave: document.getElementById('btnSave')
};
```

> **Rule**: Never call `document.getElementById` inside loops or render functions.

## Data Flow

```
Supabase → state.items → renderTable(state.items) → DOM
                 ↑
           user action → mutation → Supabase → reload
```

## Chart.js Instances

Always destroy before re-creating:

```javascript
if (state.chartInstance) state.chartInstance.destroy();
state.chartInstance = new Chart(ctx, config);
```

## Error Handling

Use `try/catch` with `window.Toast`:

```javascript
try {
    const { data, error } = await window.sb.from('table').select('*');
    if (error) throw error;
    // render
} catch (err) {
    console.error('[module]', err);
    window.Toast?.error('Error: ' + err.message);
}
```
