node.exe : (node:4568) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:4568) [DE...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:41360) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
De acuerdo. A continuaci├│n, presento el plan de implementaci├│n para remediar `pages/admin/admin-central-stock.html` y alinearlo con el Golden Standard.

El plan se enfoca en abordar los puntos de baja conformidad y los anti-patrones detectados, utilizando las clases existentes en `components.css` y respetando la l├│gica de la aplicaci├│n.

### Archivo: `pages/admin/admin-central-stock.html`

#### 1. Reemplazo de 8 `<select>` nativos por el patr├│n `custom-dropdown`

*   **Qu├® cambia y por qu├®:** Se reemplazar├ín todos los selectores nativos. El Golden Standard exige el uso del patr├│n `.custom-dropdown` para unificar la apariencia y experiencia de usuario en toda la plataforma, eliminando los estilos por defecto del navegador que son inconsistentes. Cada `<select>` ser├í envuelto en un `div.custom-dropdown`.
*   **L├¡neas aproximadas afectadas:** M├║ltiples secciones, incluyendo la barra de filtros y los modales (aprox. 8 instancias en l├¡neas como 150, 220, 350, 600-700).
*   **Patr├│n GS de referencia:** Secci├│n 6.2 (Custom Dropdowns).
*   **Acci├│n adicional:** Se a├▒adir├ín `aria-label` a cada `select` para mejorar la accesibilidad, cumpliendo con el criterio de ├®xito.

#### 2. Correcci├│n del Componente `Header`

*   **Qu├® cambia y por qu├®:** El encabezado principal de la p├ígina carece de los elementos de t├¡tulo estandarizados. Se agregar├ín las clases `.dashboard-title`, `.dashboard-title-soft`, y `.dashboard-subtitle-soft` para alinear el t├¡tulo de la vista con el dise├▒o del Golden Standard.
*   **L├¡neas aproximadas afectadas:** 30-45.
*   **Patr├│n GS de referencia:** Secci├│n 2.1 (Header).
*   **Acci├│n:** Se estructurar├í el t├¡tulo dentro del `<header>` usando `h2` y `h3` con las clases correspondientes para mantener la jerarqu├¡a sem├íntica.

#### 3. Implementaci├│n de Clases Faltantes en `FilterBar`

*   **Qu├® cambia y por qu├®:** A los filtros actuales les faltan las clases `.pill` y `.is-active` para indicar visualmente qu├® filtro est├í seleccionado. Esto es crucial para la usabilidad.
*   **L├¡neas aproximadas afectadas:** 140-160.
*   **Patr├│n GS de referencia:** Secci├│n 3.2 (Filter Pills).
*   **Acci├│n:** Se aplicar├í la clase `.pill` a los botones de filtro y se asignar├í `.is-active` a la opci├│n por defecto ("Todos").

#### 4. Ajuste de Clases en Botones (`Buttons`)

*   **Qu├® cambia y por qu├®:** Algunos botones de acciones destructivas (ej. "Eliminar") no usan la clase `.btn-danger`. Se corregir├í para comunicar visualmente el riesgo de la acci├│n.
*   **L├¡neas aproximadas afectadas:** M├║ltiples, dentro de tablas y modales (ej. 550, 750).
*   **Patr├│n GS de referencia:** Secci├│n 4.1 (Buttons).

#### 5. Dimensionamiento de Modales (`Modals`)

*   **Qu├® cambia y por qu├®:** Los modales no tienen un tama├▒o definido. Se agregar├ín las clases `.modal-content-md` y `.modal-content-lg` para controlar su ancho seg├║n el contenido que albergan, evitando que se vean demasiado peque├▒os o grandes.
*   **L├¡neas aproximadas afectadas:** 580, 720 (dentro de los `<dialog>`).
*   **Patr├│n GS de referencia:** Secci├│n 5.1 (Modals).

#### 6. Adici├│n de Clases de Utilidad (`Utilities`)

*   **Qu├® cambia y por qu├®:** Para mejorar la densidad de informaci├│n y la legibilidad, se usar├ín clases de utilidad. Se aplicar├í `text-xs` a textos secundarios (ej. fechas, c├│digos de producto), `badge-quiet` a badges informativos que no requieran alta visibilidad, y `u-visible` si es necesario para controlar la visibilidad responsiva de ciertos elementos.
*   **L├¡neas aproximadas afectadas:** Distribuido en tablas y listas.
*   **Patr├│n GS de referencia:** Secci├│n 10 (Utilities).

### Archivo: `assets/css/admin-central-stock.css`

*   **Qu├® cambia y por qu├®:** No se anticipan cambios directos en este archivo. La regla es refactorizar *hacia* este archivo si se eliminan estilos en l├¡nea. Dado que el reporte indica "0 inline styles", no hay nada que mover. Todas las clases a utilizar ya existen en `components.css`, por lo que no ser├í necesario crear CSS nuevo. Se revisar├í el archivo para asegurar que no haya reglas que entren en conflicto con las nuevas clases del Golden Standard.
*   **L├¡neas aproximadas afectadas:** 0.
*   **Patr├│n GS de referencia:** N/A.

Este plan aborda todos los `Hints de remediacion` y anti-patrones, garantizando que el archivo final cumpla con los criterios de ├®xito definidos. Proceder├® a implementarlo.
