node.exe : (node:14312) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:14312) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:30332) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Basado en el contexto y los requerimientos, he preparado un plan de remediaci├│n para alinear `encargado-barra-personal.html` con el Golden Standard.

Primero, verificar├® si existe una hoja de estilos espec├¡fica para esta p├ígina.
No se encontr├│ un archivo CSS espec├¡fico (`encargado-barra-personal.css`), por lo que todas las modificaciones se realizar├ín directamente en el archivo HTML mediante la adici├│n de clases del Golden Standard.

Aqu├¡ est├í el plan de implementaci├│n detallado.

### **Plan de Remediaci├│n: `encargado-barra-personal.html`**

**Archivo a modificar:** `pages/encargados/encargado-barra-personal.html`

El objetivo es reestructurar el layout, estandarizar la navegaci├│n y los componentes interactivos, y eliminar todos los anti-patrones para alcanzar un score de compliance superior al 85%.

---

#### 1. **Reestructuraci├│n General del Layout y Sidebar**

*   **Qu├® cambia:** Se reestructurar├í la p├ígina para adoptar el layout de `grid-sidebar-main`. El contenido principal se envolver├í en `<main class="main-content-area">` y `<div class="page-card">`. El panel lateral de filtros (`<aside>`) se actualizar├í con la clase `sidebar-filters`.
*   **Por qu├®:** El layout actual carece de la estructura sem├íntica y las clases requeridas por el Golden Standard, lo que afecta la consistencia y el responsive design. Esto soluciona las faltas en las categor├¡as "Layout" y "Sidebar".
*   **L├¡neas afectadas:** ~15-20 (envolviendo y reordenando bloques existentes).
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secciones 2. Layout & Grid, 5. Sidebar & Filters).

#### 2. **Implementaci├│n de Navegaci├│n Est├índar (Topbar y Breadcrumbs)**

*   **Qu├® cambia:** Se agregar├í un encabezado de p├ígina completo, incluyendo la `<div class="topbar">` (con `topbar-start` y `topbar-end`) y la navegaci├│n de `<ul class="breadcrumb">`.
*   **Por qu├®:** La p├ígina actualmente no tiene una barra de navegaci├│n superior ni migas de pan, lo cual es un requisito cr├¡tico de la categor├¡a "Navigation" para la orientaci├│n del usuario y la consistencia de la experiencia.
*   **L├¡neas afectadas:** ~20-25 (se agregar├í un nuevo bloque `<header>` al inicio del `<body>`).
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secci├│n 3. Navigation).

#### 3. **Estandarizaci├│n del Encabezado de P├ígina (Header y Actions)**

*   **Qu├® cambia:** Se introducir├í un bloque `<div class="dashboard-header">` para el t├¡tulo, utilizando `dashboard-title-soft` y `dashboard-subtitle-soft`. Los botones de acci├│n principales se agrupar├ín dentro de un `<div class="actions-bar">`.
*   **Por qu├®:** El t├¡tulo y las acciones de la p├ígina no siguen la estructura est├índar, afectando la jerarqu├¡a visual. Esto corrige las faltas en la categor├¡a "Header".
*   **L├¡neas afectadas:** ~10-15 (reestructurando los `<h2>` y botones existentes).
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secci├│n 4. Page Headers).

#### 4. **Reemplazo de `<select>` Nativo por Componente `.custom-dropdown`**

*   **Qu├® cambia:** Se reemplazar├í el `<select>` nativo detectado con la estructura completa del componente `.custom-dropdown`, que incluye el `custom-dropdown-trigger`, `custom-dropdown-menu`, y las `custom-dropdown-option`.
*   **Por qu├®:** Es un anti-patr├│n de alta prioridad. El GS exige el uso de dropdowns personalizados para una apariencia y comportamiento consistentes. Se agregar├ín los atributos ARIA correspondientes para mantener la accesibilidad.
*   **L├¡neas afectadas:** ~15-20 (sustituyendo el elemento `<select>` por la nueva estructura).
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secci├│n 9. Custom Dropdowns).

#### 5. **Remediaci├│n de Tabla, Formularios y Modales**

*   **Qu├® cambia:**
    *   **Tabla:** Se a├▒adir├ín las clases `table-compact`, `cell-pad`, y el patr├│n `sortable` con `sort-icon` a las cabeceras de columna (`<th>`).
    *   **Formularios:** Cada `<input>` se asociar├í a un `<label class="form-label">`.
    *   **Modales:** Se agregar├ín las clases `modal-title` al t├¡tulo del di├ílogo y `modal-content-md` o `lg` al contenedor.
*   **Por qu├®:** Estos componentes carecen de las clases y estructura para un formato correcto y accesibilidad, como se indica en las categor├¡as "Tables", "Forms" y "Modals".
*   **L├¡neas afectadas:** ~30-40 (distribuidas en la tabla, el formulario y los modales existentes).
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secciones 7. Tables, 10. Modals & Dialogs, 11. Forms).

#### 6. **Aplicaci├│n de Clases de Botones y Utilidades**

*   **Qu├® cambia:** Se aplicar├ín las clases de botones faltantes (`btn-ghost`, `btn-danger`) a los elementos correspondientes (ej. botones de cancelar o eliminar). Se usar├ín clases de utilidad (`text-xs`, `text-muted`, `badge`, `badge-quiet`) para estandarizar textos y estados visuales.
*   **Por qu├®:** Para asegurar consistencia visual en los botones y eliminar la necesidad de CSS personalizado. Se a├▒adir├ín `aria-label` a todos los botones e inputs para cumplir el criterio de ├®xito de accesibilidad.
*   **L├¡neas afectadas:** M├║ltiples l├¡neas, cambios peque├▒os y distribuidos por todo el archivo.
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secciones 8. Buttons, 12. Utility Classes).

---

Este plan aborda de manera integral todos los "Hints de remediacion" y cumple con las reglas establecidas. La ejecuci├│n de estos pasos deber├¡a elevar el score de compliance por encima del 85% y resolver los anti-patrones detectados.
