---
name: Methodology Generator
description: Generates a customized verification checklist (metodo-nombre.md) for closing a specific screen or module, ensuring it meets the project's quality standards.
---

# Methodology Generator Skill

## Description
This skill automates the creation of a "Definition of Done" (DoD) checklist tailored to a specific screen or module. It combines the global standards defined in `.agent/metodo.md` with specific checks derived from the code of the target module.

## Usage
Use this skill when the user wants to "close", "verify", or "finalize" a screen.
**Trigger Phase:** Verification / Closing.

## Input
- **Module Name** (e.g., `admin-usuarios`, `barra-comandas`).

## Workflow

### 1. Analyze Context
1.  **Read Standards**: Read `frontend-developer/SKILL.md` (UI/UX) and `logic-engineer/SKILL.md` (Logic) to get the latest checklists.
2.  **Locate Target Files**: Find the implementation files for the module. usually:
    -   `pages/{category}/{module_name}.html`
    -   `assets/js/modules/{module_name}.js`
    -   `docs/modules/{category}/{module_name}.md`

### 2. Extract Specific Features
Analyze the target HTML and JS files to identify specific items to verify:
-   **Auth**: Does it use `Auth.guardOrRedirect`? -> *Add check: "Role Guard: redirects correctly for unprivileged users".*
-   **UI Components**: Uses `TableShell`? -> *Add check: "TableShell: sticky header works and filters affect valid rows".*
-   **Forms**: Has `slide-panel`? -> *Add check: "Side Panel: opens/closes correctly, overlay click closes it".*
-   **Data**: Calls `supabase.from(...)`? -> *Add check: "Data: Loads correctly and shows Empty State if 0 rows".*
-   **Feedback**: Calls `Toast.success/error`? -> *Add check: "Feedback: Toasts appear on success/error".*

### 3. Generate Checklist File
Create a new file at `.agent/checklists/metodo-{module_name}.md` with the following structure:

```markdown
# Checklist de Cierre: {Module Name}

> Generado automáticamente basada en `frontend-developer` y `logic-engineer` skills.

## 1. Funcionalidad Específica (Detectada)
- [ ] **Auth**: Verificar acceso solo para roles [roles detectados].
- [ ] **UI**: Verificar componentes detectados ([TableShell / FilterBar / SlidePanel]).
- [ ] **Lógica**: Verificar flujo principal ([función principal del módulo]).
- [ ] **Datos**: Validar carga, guardado y manejo de errores.

## 2. Estándares Globales (Frontend)
- [ ] **Tokens**: No hay colores HEX ni tamaños en px hardcodeados.
- [ ] **Estados**: Loading y Empty states implementados en overlay (no tabla).
- [ ] **Responsive**: Layout no se rompe en mobile (table-scroll horizontal).
- [ ] **Feedback**: Todas las acciones async muestran loading + toast.

## 3. Estándares Globales (Lógica)
- [ ] **Async**: Patrón IIFE implementado correctamente.
- [ ] **Safety**: `assertSbOrShowBlockingError` presente.
- [ ] **Validación**: Inputs validados antes de enviar a DB.

## 4. Protocolo de Cierre
1.  Ejecutar auditoría final (Checklist arriba).
2.  Si todo OK, commitear cambios.
3.  Actualizar ficha de módulo con `documentation-generator`.
```

### 4. Output
-   Present the link to the generated file to the user.
-   Ask the user to perform the checks.
