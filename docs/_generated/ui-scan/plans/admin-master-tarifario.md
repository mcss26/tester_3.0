node.exe : (node:28924) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:28924) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:29840) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 843.9251340000001ms...
Error executing tool read_file: File not found.
Excelente. He analizado el contexto y los archivos de referencia. El objetivo es claro: refactorizar `pages/admin/admin-master-tarifario.html` para alinearlo con el Golden Standard, apuntando a un score de 85% o m├ís.

Aqu├¡ est├í mi plan de implementaci├│n, siguiendo las reglas y el formato solicitados.

### **Plan de Remediaci├│n: `admin-master-tarifario.html`**

#### **Archivo a modificar:** `pages/admin/admin-master-tarifario.html`

1.  **Estructura Principal (Layout)**
    *   **Cambio:** Se reestructurar├í el `<body>` para adoptar el layout `grid-sidebar-main`. El contenido principal se dividir├í en un `<aside class="sidebar-filters">` para los filtros y un `<div class="main-content-area">` para la tabla de datos. El `div.staff-dashboard` actual ser├í reemplazado por esta nueva estructura.
    *   **Por qu├®:** Para cumplir con el patr├│n de layout principal del Golden Standard, que separa los controles de filtro de la visualizaci├│n de datos, mejorando la organizaci├│n y consistencia.
    *   **L├¡neas afectadas (aprox.):** 95-130.
    *   **Patr├│n GS:** 3 (`grid-sidebar-main`), 11 (`sidebar-filters`, `main-content-area`).

2.  **Header y Barra de Acciones**
    *   **Cambio:** Dentro del `.dashboard-header`, el t├¡tulo se envolver├í en un `div` y se a├▒adir├í un subt├¡tulo con la clase `.dashboard-subtitle-soft`. El bot├│n `+ Nuevo Cargo` se mover├í a un contenedor `<div class="actions-bar">` y se le a├▒adir├ín las clases `btn-icon btn-icon-flat btn-icon-plus` para convertirlo en un bot├│n de ├¡cono.
    *   **Por qu├®:** Para adherirse al patr├│n de `dashboard-header` que requiere una jerarqu├¡a de t├¡tulos clara y una barra de acciones (`actions-bar`) para los controles principales de la p├ígina.
    *   **L├¡neas afectadas (aprox.):** 98-105.
    *   **Patr├│n GS:** 1 (`dashboard-header`, `dashboard-subtitle-soft`, `actions-bar`), 9 (`btn-icon`, `btn-icon-flat`).

3.  **Barra de Filtros y Tabla de Datos**
    *   **Cambio (Filtros):** La barra de filtros de "p├¡ldoras" (`.sku-filter-bar`) se mover├í al nuevo `<div class="main-content-area">`. Se le agregar├í un contador de resultados con la clase `.filter-counter` y las clases `pill` y `is-active` se usar├ín en los botones.
    *   **Cambio (Tabla):** El `div#list-container` ser├í reemplazado por una estructura de tabla HTML completa y sem├íntica (`.table-viewport > .table-scroll > table.table.table-sticky.table-compact`). Se crear├ín `<thead>` y `<tbody>` con las clases correspondientes (`table-head`, `table-cell`, `is-header`, `sortable`).
    *   **Por qu├®:** Reemplaza la estructura de `divs` por una tabla sem├íntica, accesible y estilizada seg├║n el Golden Standard, con header fijo y capacidad de ordenamiento. Los filtros se adaptan al est├índar visual.
    *   **L├¡neas afectadas (aprox.):** 107-130 (reemplazo completo del `div`).
    *   **Patr├│n GS:** 5 (`sku-filter-bar`, `pill`, `filter-counter`), 6 (`table-viewport`, `table-scroll`, `table`, `table-sticky`, etc.).

4.  **Panel Deslizable (Slide Panel) y Formulario**
    *   **Cambio:** El `<select>` nativo para "├ürea" ser├í reemplazado por el patr├│n `.custom-dropdown` del Golden Standard. Esto implica una reescritura a `divs` anidados con `custom-dropdown-trigger` y `custom-dropdown-menu`. A los botones del footer se les aplicar├ín los estilos correctos (`btn-danger` -> `btn btn-danger`, `btn-secondary` -> `btn btn-secondary`, `btn-primary` -> `btn btn-primary`).
    *   **Por qu├®:** Este es el cambio de mayor prioridad para eliminar los anti-patrones. Asegura una experiencia de usuario y un dise├▒o consistentes en todos los formularios de la aplicaci├│n.
    *   **L├¡neas afectadas (aprox.):** 150-165.
    *   **Patr├│n GS:** 4 (`custom-dropdown`), 9 (`btn-danger`).

5.  **Accesibilidad (ARIA)**
    *   **Cambio:** Se a├▒adir├ín `aria-label` a los botones de icono y a los campos de formulario. La nueva tabla tendr├í los roles ARIA (`role="table"`, `role="columnheader"`, `scope="col"`) y `tabindex="0"` en los encabezados `sortable`.
    *   **Por qu├®:** Para cumplir con los criterios de ├®xito de accesibilidad y las directrices del Golden Standard.
    *   **L├¡neas afectadas (aprox.):** M├║ltiples l├¡neas a lo largo del archivo.
    *   **Patr├│n GS:** Accessibility Guidelines.

Proceder├® a ejecutar este plan.
