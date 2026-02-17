node.exe : (node:20224) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:20224) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:1352) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 2s.. Retrying after 2274.808622ms...
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 884.896268ms...
Okay, aqu├¡ est├í el plan de implementaci├│n para remediar `admin-master-categorias.html` y alinearlo con el Golden Standard.

### Plan de Remediaci├│n

Basado en el an├ílisis de `docs/ui-golden-standard.md` y la implementaci├│n de referencia en `pages/admin/admin-central-stock.html`, el plan se centrar├í en un ├║nico archivo.

---

#### 1. Archivo: `pages/admin/admin-master-categorias.html`

Este archivo requiere una reestructuraci├│n significativa para cumplir con los est├índares de Header, Tables, Buttons y Forms.

*   **Cambio 1: Reestructuraci├│n del Header**
    *   **Qu├® cambia:** Se modificar├í el encabezado principal de la p├ígina. Se agregar├í un `div.actions-bar` para agrupar los controles principales (filtros y botones de acci├│n). El t├¡tulo secundario o descripci├│n utilizar├í la clase `dashboard-title-soft`.
    *   **Por qu├®:** Para cumplir con el Golden Standard de `Header` (score actual 60%), que exige una barra de acciones definida y un estilo de t├¡tulo secundario consistente.
    *   **L├¡neas afectadas (aprox):** 10-15
    *   **Patr├│n GS de referencia:** 2.1 (Dashboard Header), 2.2 (Actions Bar)

*   **Cambio 2: Overhaul Completo de la Tabla de Datos**
    *   **Qu├® cambia:** La tabla HTML actual ser├í completamente reescrita para adoptar la estructura del Golden Standard. Esto incluye:
        1.  Envolver la `<table>` en un `<div class="table-scroll">`.
        2.  A├▒adir las clases `table` y `table-compact` a la etiqueta `<table>`.
        3.  Usar `<thead>` con celdas que lleven las clases `table-cell is-header cell-pad sortable`.
        4.  Incluir un `<i class="sort-icon"></i>` dentro de los encabezados de columna para indicar la capacidad de ordenamiento.
        5.  Usar celdas de `<tbody>` con las clases `table-cell cell-pad`.
        6.  Aplicar clases de utilidad como `text-center` o `text-right` a celdas num├®ricas o de acciones.
    *   **Por qu├®:** Para solucionar la falta de compliance de `Tables` (score actual 17%). Esto mejora la consistencia visual, la legibilidad y la funcionalidad en diferentes tama├▒os de pantalla.
    *   **L├¡neas afectadas (aprox):** 30-50
    *   **Patr├│n GS de referencia:** 4.1 (Standard Table), 4.2 (Table Scroll), 4.4 (Compact Table)

*   **Cambio 3: Estandarizaci├│n de Botones**
    *   **Qu├® cambia:** Se buscar├ín los botones de acci├│n para asignarles las clases correctas. El bot├│n para eliminar una categor├¡a recibir├í la clase `btn-danger`. Los botones que solo contienen un ├¡cono (si existen) usar├ín `btn-icon-flat`. Se a├▒adir├í un atributo `aria-label` descriptivo a cada bot├│n.
    *   **Por qu├®:** Para mejorar el score de `Buttons` (75%) y crucialmente, mejorar la accesibilidad (ARIA) y la previsibilidad de la interfaz.
    *   **L├¡neas afectadas (aprox):** 5-10
    *   **Patr├│n GS de referencia:** 5.2 (Button Styles), 5.4 (Icon Buttons)

*   **Cambio 4: Aplicaci├│n de Clases de Utilidad**
    *   **Qu├® cambia:** Se escanear├í el componente en busca de oportunidades para usar utilidades. Por ejemplo, se usar├ín clases como `badge` o `badge-quiet` para mostrar el estado de una categor├¡a (ej. "Activa", "Inactiva") y `text-muted` para informaci├│n secundaria. Se usar├ín `u-hidden` o `u-visible` si hay elementos que se muestran/ocultan condicionalmente sin una clase de utilidad.
    *   **Por qu├®:** Para solucionar la falta total de compliance en `Utilities` (0%) y reducir la necesidad de CSS custom, haciendo el layout m├ís predecible.
    *   **L├¡neas afectadas (aprox):** 10-15
    *   **Patr├│n GS de referencia:** 8 (Utilities)

*   **Cambio 5: Mejora de Formularios y Accesibilidad**
    *   **Qu├® cambia:** Se inspeccionar├ín los 3 inputs del formulario. Si hay un filtro de rango de fechas, se envolver├í en un `div.date-range-inline` con un `span.date-separator`. A todos los `input` se les a├▒adir├í un `aria-label` claro y conciso.
    *   **Por qu├®:** Para cumplir con el est├índar de `Forms`, mejorar la sem├íntica del HTML y la accesibilidad (ARIA).
    *   **L├¡neas afectadas (aprox):** 5-10
    *   **Patr├│n GS de referencia:** 7.3 (Date Range)

---

Este plan cubre todas las deficiencias reportadas y se enfoca en alcanzar un score de compliance superior al 85% modificando ├║nicamente el archivo HTML con las clases existentes en `components.css`.
