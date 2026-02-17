node.exe : (node:39364) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:39364) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:39412) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Okay, I will create a remediation plan for `logistica-stock.html` to align it with the Golden Standard.

First, I will analyze the necessary files to create the plan.
I have confirmed that `assets/css/logistica-stock.css` does not exist, so all changes will be contained within the HTML file, utilizing the existing classes from `components.css`.

Now, I will read the necessary files to formulate the remediation plan.
Plan de Remediaci├│n: `logistica-stock.html`

A continuaci├│n se detalla el plan para actualizar `pages/logistica/logistica-stock.html` y alinearlo con el Golden Standard, apuntando a un score de compliance de 85% o superior.

---

### Archivo a Modificar: `pages/logistica/logistica-stock.html`

#### 1. Estructura General y Encabezado (`Header`)

*   **Qu├® cambia:**
    *   Reemplazar el `<h1>` por un `<h2>` para una correcta jerarqu├¡a de headings.
    *   Reestructurar el `div.dashboard-header` para que coincida con el patr├│n Golden Standard. Se agregar├í un `div` contenedor para el t├¡tulo y el nuevo subt├¡tulo, y un `div.actions-bar` para el bot├│n de refrescar.
    *   Se cambiar├í el subt├¡tulo actual de un `p.text-sm.text-muted` a un `p.dashboard-subtitle.dashboard-subtitle-soft`.
    *   El bot├│n de refrescar ser├í refactorizado a `btn-icon-flat` y se mover├í dentro del `actions-bar`.
*   **Por qu├®:** Para cumplir con la jerarqu├¡a sem├íntica de HTML5 y alinear la cabecera con el dise├▒o est├índar, mejorando la consistencia visual y la estructura.
*   **L├¡neas aproximadas afectadas:** 100-115
*   **Patr├│n GS de referencia:** Secci├│n 1: Dashboard Header with Tabs

#### 2. Barra de Filtros (`FilterBar`)

*   **Qu├® cambia:**
    *   Aunque la barra (`.sku-filter-bar`) ya existe, se asegurar├í la correcta implementaci├│n de sus componentes internos.
    *   Los filtros de categor├¡a generados por JS (`#category-tabs`) ser├ín `button.pill`. Se debe verificar que el JS agregue la clase `.is-active` al elemento activo.
    *   Se a├▒adir├í un `span.filter-counter` para mostrar el n├║mero de resultados, un elemento faltante clave.
*   **Por qu├®:** Para implementar completamente el patr├│n de la barra de filtros, proporcionando al usuario una mejor retroalimentaci├│n visual sobre el estado de los filtros y la cantidad de resultados.
*   **L├¡neas aproximadas afectadas:** 118-129
*   **Patr├│n GS de referencia:** Secci├│n 5: Filter Bar with Pills

#### 3. Tabla de Datos (`Tables`)

*   **Qu├® cambia:**
    *   El contenedor de la tabla (`#list-container`) ser├í reescrito para usar la estructura completa del Golden Standard: `.table-viewport > .table-scroll > table.table.table-sticky.table-compact`.
    *   La tabla que actualmente se inyecta v├¡a JavaScript deber├í ser modificada en su origen (`logistica-stock.js`) para que genere el `<thead>` con `tr.table-head` y `th.table-cell.is-header.cell-pad`.
    *   Se agregar├ín las clases `sortable` y el `span.sort-icon` a las cabeceras que permitan ordenamiento.
    *   Las celdas `<td>` usar├ín la clase `.table-cell.cell-pad`. Se aplicar├ín clases de utilidad como `text-right` o `text-center` seg├║n corresponda.
    *   Se a├▒adir├ín los atributos `role` y `aria-label` correspondientes para accesibilidad.
*   **Por qu├®:** Esta es la desviaci├│n m├ís significativa. La refactorizaci├│n es crucial para obtener el comportamiento de scroll, el `sticky header`, el estilo compacto y la accesibilidad definidos en el Golden Standard.
*   **L├¡neas aproximadas afectadas:** 132 (y el JS que genera la tabla).
*   **Patr├│n GS de referencia:** Secci├│n 6: Data Table with Sorting

#### 4. Modal de Ajuste y Reemplazo de `<select>` Nativo

*   **Qu├® cambia:**
    *   El contenedor principal del modal (`div#modal-adjust`) ser├í reemplazado por un elemento `<dialog id="modal-adjust" class="modal">`.
    *   La estructura interna se adaptar├í al patr├│n `.modal-content > .modal-header, .modal-body, .modal-footer`. Se usar├í `modal-content-md`.
    *   El `<select id="adjust-reason">` nativo ser├í reemplazado por el patr├│n `.custom-dropdown`. Esto implica crear un `div.custom-dropdown` con un `div.custom-dropdown-trigger` (que mostrar├í la opci├│n seleccionada) y un `div.custom-dropdown-menu` (que contendr├í las `div.custom-dropdown-option`).
    *   Los botones del footer se estandarizar├ín a `.btn-secondary` y `.btn-primary`.
    *   El bot├│n de cierre usar├í la clase `.modal-close`.
*   **Por qu├®:** Para eliminar el anti-patr├│n del `<select>` nativo y usar el componente `custom-dropdown` del GS. Adem├ís, se migrar├í a la estructura sem├íntica y accesible del `<dialog>`, resolviendo varias faltas de compliance de la categor├¡a "Modals".
*   **L├¡neas aproximadas afectadas:** 138-180
*   **Patr├│n GS de referencia:** Secci├│n 7: Modal Dialog y Secci├│n 4: Chart Section with KPIs (para el dropdown).

#### 5. Botones y Atributos ARIA

*   **Qu├® cambia:**
    *   Se revisar├ín todos los botones (`<button>`) para asegurar que usen las clases correctas del sistema de botones (`btn-primary`, `btn-secondary`, `btn-icon`, `btn-icon-flat`, etc.).
    *   El bot├│n de cierre del modal (`#close-modal`) usar├í la clase `.modal-close`.
    *   Se agregar├ín `aria-label` descriptivos a todos los botones que solo contienen ├¡conos (como el bot├│n de cerrar modal) y a los inputs/controles complejos para mejorar la accesibilidad.
*   **Por qu├®:** Para garantizar la consistencia visual y funcional de los elementos interactivos y cumplir con los requisitos de accesibilidad.
*   **L├¡neas aproximadas afectadas:** A lo largo de todo el archivo.
*   **Patr├│n GS de referencia:** Secci├│n 9: Button System y Secci├│n de Accesibilidad.

Este plan aborda todos los "Hints de remediacion" y se enfoca en las ├íreas de mayor impacto para mejorar el score de compliance. La ejecuci├│n se realizar├í modificando ├║nicamente el archivo HTML, asumiendo que la l├│gica de renderizado de la tabla en el archivo JS asociado tambi├®n ser├í actualizada para generar el marcado correcto.
