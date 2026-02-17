node.exe : (node:37320) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:37320) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:7316) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 601.2842400000001ms...
Perfecto. Antes de crear el plan, necesito analizar el estado actual del archivo a remediar, la implementaci├│n de referencia y el est├índar de UI. Esto me permitir├í crear un plan preciso y factible.

Procedo a leer los archivos necesarios.
Confirmado. No existe un archivo CSS dedicado para `operativo-master-proveedores.html`, por lo que todas las clases de remediaci├│n provendr├ín de `components.css` y se aplicar├ín directamente en el HTML.

Ahora, leer├® el archivo a modificar, la implementaci├│n de referencia y el Golden Standard para construir el plan.
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 626.0262009999999ms...
Excelente. He analizado los archivos y estoy listo para detallar el plan de remediaci├│n.

Aqu├¡ est├í el plan de implementaci├│n para llevar `operativo-master-proveedores.html` al Golden Standard, enfocado en alcanzar un score de 85% o superior.

---

### **Plan de Remediaci├│n: `pages/operativo/operativo-master-proveedores.html`**

#### **1. Header: Implementaci├│n de `actions-bar`**

*   **Qu├® cambia y por qu├®:** El header actual tiene un t├¡tulo y un bot├│n de "Nuevo" separados. Para cumplir con el Golden Standard, se agrupar├ín los elementos de acci├│n dentro de un contenedor `.actions-bar`. Esto mejora la consistencia estructural con otras p├íginas maestras. El bot├│n "+" ser├í reemplazado por un bot├│n con texto para mayor claridad.
*   **L├¡neas aproximadas afectadas:** 65-72
*   **Patr├│n GS de referencia:** Secci├│n 1: Dashboard Header with Tabs

```diff
- <div class="dashboard-header align-start">
-     <div>
-         <h2 class="dashboard-title dashboard-title-soft">Gesti├│n de proveedores</h2>
-         <p class="dashboard-subtitle dashboard-subtitle-soft">Alta y edici├│n de contactos de proveedor</p>
-     </div>
-     <button class="btn-icon btn-icon-flat btn-icon-plus" id="btn-new" aria-label="Nuevo proveedor">+</button>
- </div>

+ <div class="dashboard-header">
+     <div>
+         <h2 class="dashboard-title">Gesti├│n de Proveedores</h2>
+         <p class="dashboard-subtitle">Alta, baja y edici├│n de contactos de proveedor.</p>
+     </div>
+     <div class="actions-bar">
+         <button class="btn-primary" id="btn-new" aria-label="Crear nuevo proveedor">+ Nuevo Proveedor</button>
+     </div>
+ </div>
```

#### **2. Tables: Refactorizaci├│n a Tabla Golden Standard**

*   **Qu├® cambia y por qu├®:** El contenedor de la lista (`#list-container`) es un `div` simple. Se reemplazar├í con la estructura completa de tabla del Golden Standard (`.table-viewport > .table-scroll > .table.table-sticky`). Se definir├í un `<thead>` est├ítico con las clases correctas (`.table-head`, `.is-header`, `.sortable`, etc.) y atributos ARIA. Esto permite que el JavaScript existente popule el `<tbody>` en una estructura compatible con GS, habilitando el sticky header, el scroll horizontal y la ordenaci├│n.
*   **L├¡neas aproximadas afectadas:** 75-78
*   **Patr├│n GS de referencia:** Secci├│n 6: Data Table with Sorting

```diff
- <div class="staff-list table-viewport table-shell" id="list-container">
-     <!-- Content injected by JS -->
- </div>

+ <div class="table-viewport table-shell" id="table-viewport" role="region" aria-label="Tabla de Proveedores">
+     <div class="table-scroll" id="main-table-container">
+         <table class="table table-sticky table-compact" role="table" aria-label="Listado de Proveedores">
+             <thead>
+                 <tr class="table-head" role="row">
+                     <th class="table-cell is-header cell-pad sortable" scope="col" role="columnheader" data-sort="nombre" tabindex="0" aria-label="Ordenar por Nombre">
+                         Nombre <span class="sort-icon"></span>
+                     </th>
+                     <th class="table-cell is-header cell-pad sortable" scope="col" role="columnheader" data-sort="telefono" tabindex="0" aria-label="Ordenar por Tel├®fono">
+                         Tel├®fono <span class="sort-icon"></span>
+                     </th>
+                     <th class="table-cell is-header cell-pad sortable u-hidden-sm" scope="col" role="columnheader" data-sort="email" tabindex="0" aria-label="Ordenar por Email">
+                         Email <span class="sort-icon"></span>
+                     </th>
+                     <th class="table-cell is-header cell-pad text-center sortable" scope="col" role="columnheader" data-sort="activo" tabindex="0" aria-label="Ordenar por Estado">
+                         Activo <span class="sort-icon"></span>
+                     </th>
+                     <th class="table-cell is-header cell-pad text-center" scope="col" role="columnheader" aria-label="Acciones disponibles">Acciones</th>
+                 </tr>
+             </thead>
+             <tbody id="list-container" role="rowgroup">
+                 <!-- JS content is injected here -->
+             </tbody>
+         </table>
+     </div>
+ </div>
```
*(Nota: El `id="list-container"` se mueve al `tbody` para mantener la compatibilidad con el script existente que lo usa como contenedor.)*

#### **3. Forms & Buttons (Slide Panel): Aplicar clases GS**

*   **Qu├® cambia y por qu├®:** Los elementos del formulario en el panel lateral no usan las clases de utilidad y botones del GS. Se agregar├ín clases como `btn-ghost` y `btn-sm` a los botones y se asegurar├í que todos los `input` y `button` tengan `aria-label` para accesibilidad. Se aplicar├í `input-compact` si el dise├▒o lo requiere, aunque en el panel no suele ser necesario. El bot├│n de cerrar panel ser├í estandarizado. Los botones de acci├│n del pie de p├ígina ser├ín actualizados.
*   **L├¡neas aproximadas afectadas:** 84, 151-153
*   **Patr├│n GS de referencia:** Secci├│n 8: Slide Panel & Secci├│n 9: Button System

```diff
// Panel Header
- <button class="panel-close" id="btn-close-panel" aria-label="Cerrar panel">├ù</button>
+ <button class="btn-icon btn-icon-flat" id="btn-close-panel" aria-label="Cerrar panel">
+     <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
+ </button>

// Panel Footer
- <button class="btn-secondary" id="btn-cancel">Cancelar</button>
- <button class="btn-primary" id="btn-save">Guardar</button>
+ <button class="btn-ghost" id="btn-delete" aria-label="Eliminar proveedor">Eliminar</button>
+ <div class="filter-spacer"></div>
+ <button class="btn-secondary" id="btn-cancel" aria-label="Cancelar edici├│n">Cancelar</button>
+ <button class="btn-primary" id="btn-save" aria-label="Guardar cambios">Guardar</button>
```

#### **4. Utilities & ARIA:**

*   **Qu├® cambia y por qu├®:** Se a├▒adir├ín atributos `aria-label` a todos los elementos interactivos que no los tengan (`input`, `button`). Se usar├ín clases de utilidad como `text-right` o `text-center` en las celdas de la tabla para alinear correctamente los datos num├®ricos o de estado. Tambi├®n se agregar├í `u-hidden-sm` a columnas menos cr├¡ticas (como el email) para mejorar la vista en pantallas peque├▒as.
*   **L├¡neas aproximadas afectadas:** 92-149 (en el panel lateral) y en la nueva estructura de tabla.
*   **Patr├│n GS de referencia:** Secci├│n 13: Utility Classes & Secci├│n 15: Accessibility Guidelines

*Ejemplo de ARIA label en un input del panel:*
```diff
- <input type="text" id="prov-nombre" class="input" placeholder="Ej: Distribuidora Central" required>
+ <input type="text" id="prov-nombre" class="input" placeholder="Ej: Distribuidora Central" required aria-label="Nombre de fantas├¡a del proveedor">
```

#### **Criterios de ├ëxito a Verificar:**

*   **[ ] Score >= 85%:** Los cambios en Header, Tables y Buttons deber├¡an sumar los puntos necesarios.
*   **[ ] 0 Inline Styles:** Se confirmar├í que el archivo no contiene `style="...".`
*   **[ ] 0 Native Selects:** Se confirmar├í que no hay elementos `<select>` sin el wrapper `.custom-dropdown`. (Actualmente no hay selects en la p├ígina).
*   **[ ] ARIA Labels:** Todos los 5 botones y 10 inputs (y la nueva tabla) tendr├ín atributos de accesibilidad.

Este plan aborda sistem├íticamente todas las deficiencias reportadas, utilizando los est├índares y referencias proporcionados para garantizar una remediaci├│n exitosa y consistente.
