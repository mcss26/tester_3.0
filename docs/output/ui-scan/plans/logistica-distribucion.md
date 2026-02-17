node.exe : (node:19744) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:19744) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:5772) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 1s.. Retrying after 1703.028581ms...
Attempt 2 failed: You have exhausted your capacity on this model. Your quota will 
reset after 2s.. Retrying after 2548.832443ms...
OK. Voy a crear el plan de remediaci├│n para `logistica-distribucion.html`.

Primero, necesito analizar los archivos de referencia para entender la brecha y la implementaci├│n correcta.
Perfecto, tengo el contenido de `logistica-distribucion.html`.

Ahora, consultar├® la gu├¡a `ui-golden-standard.md` y el archivo de referencia `admin-central-stock.html` para definir los cambios necesarios.
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 266.843104ms...
Excelente. He analizado los archivos y tengo una idea clara de la estrategia.

Aqu├¡ est├í el plan de implementaci├│n detallado para remediar `logistica-distribucion.html` y alinearlo con el Golden Standard.

---

### **Plan de Remediaci├│n: `pages/logistica/logistica-distribucion.html`**

El objetivo es refactorizar el HTML para adoptar los patrones y clases del Golden Standard (GS), mejorando la estructura, consistencia y accesibilidad. No se crear├í CSS nuevo; solo se utilizar├ín las clases de `components.css` y `admin-master.css`.

---

#### **Archivo 1: `pages/logistica/logistica-distribucion.html`**

**1. Remediaci├│n del Header (`.dashboard-header`)**

*   **Qu├® cambia:** Se reestructura el encabezado de la p├ígina para cumplir con el patr├│n GS. Se a├▒ade un subt├¡tulo descriptivo y un `actions-bar` para agrupar los botones de acci├│n, mejorando la jerarqu├¡a visual y la consistencia con otras p├íginas de administraci├│n.
*   **Por qu├®:** El header actual carece de la estructura completa del Golden Standard. Le faltan el subt├¡tulo (`.dashboard-subtitle-soft`) y el contenedor de acciones (`.actions-bar`).
*   **L├¡neas aproximadas:** 88-95.
*   **Patr├│n GS de referencia:** `1. Dashboard Header with Tabs`.

**2. Remediaci├│n de la Barra de Filtros (`.sku-filter-bar`)**

*   **Qu├® cambia:** Se expande la barra de filtros existente. Se agrega un campo de b├║squeda con ├¡cono y un contador de resultados, utilizando los espaciadores correctos para un layout alineado al est├índar.
*   **Por qu├®:** La barra de filtros actual es muy b├ísica. Le faltan componentes clave definidos en el GS como el input de b├║squeda (`.search-input-wrap`), el ├¡cono (`.search-icon`), el espaciador (`.filter-spacer`) y el contador (`.filter-counter`).
*   **L├¡neas aproximadas:** 98-109.
*   **Patr├│n GS de referencia:** `5. Filter Bar with Pills`.

**3. Implementaci├│n del Esqueleto de la Tabla (`.table`)**

*   **Qu├® cambia:** Se agrega una estructura `<table>` est├ítica dentro del contenedor `#list-container`. Incluir├í una cabecera (`<thead>`) con columnas sortables (`.sortable`, `.sort-icon`) y un cuerpo (`<tbody>`) con un mensaje de "Cargando...". Esto proporciona el andamiaje correcto para que el script `logistica-distribucion.js` popule los datos.
*   **Por qu├®:** El archivo actual no tiene una estructura de tabla; el contenido es generado por JS. Para asegurar el cumplimiento, debemos definir el esqueleto de la tabla con las clases GS requeridas (`table`, `table-sticky`, `table-compact`, `is-header`, etc.), incluyendo atributos ARIA para accesibilidad.
*   **L├¡neas aproximadas:** 112-135.
*   **Patr├│n GS de referencia:** `6. Data Table with Sorting`.

**4. Refactorizaci├│n del Modal a `<dialog>` nativo**

*   **Qu├® cambia:** Se reemplaza toda la estructura `div.modal-overlay` por un elemento `<dialog>` nativo. Se aplican las clases est├índar del GS (`.modal`, `.modal-content`, `.modal-header`, `.modal-body`, `.modal-footer`, `.modal-close`). El contenido interno se organiza con `.form-group` y `.form-label` para mayor consistencia.
*   **Por qu├®:** El modal actual utiliza un anti-patr├│n de `divs` anidados. El GS exige el uso del elemento `<dialog>` por sus beneficios nativos de accesibilidad y manejo de foco. Las clases `modal-overlay` y `modal-card` no son est├índar.
*   **L├¡neas aproximadas:** 139-170.
*   **Patr├│n GS de referencia:** `7. Modal Dialog (Native <dialog>)`.

**5. Estandarizaci├│n de Botones y Atributos ARIA**

*   **Qu├® cambia:** Se revisan todos los elementos interactivos (botones, inputs).
    *   Se a├▒ade `aria-label` a los botones que solo tienen ├¡conos para mejorar la accesibilidad.
    *   Se verifica que los botones usen las clases correctas del sistema de botones (ej. `.btn-secondary`, `.btn-primary`). El bot├│n de cierre del modal se reemplazar├í por el est├índar `.modal-close`.
*   **Por qu├®:** Se busca garantizar la accesibilidad y la consistencia visual en todos los botones, eliminando clases no est├índar y asegurando que los lectores de pantalla puedan interpretar correctamente la funci├│n de cada elemento.
*   **L├¡neas aproximadas:** 94 (bot├│n refrescar), 143 (bot├│n cerrar modal), 168-169 (botones de acci├│n del modal).
*   **Patr├│n GS de referencia:** `9. Button System`, `Accessibility Guidelines`.

---
Este plan cubre todas las deficiencias reportadas y llevar├í el score de compliance por encima del 85% al finalizar. Proceder├® con la implementaci├│n.
