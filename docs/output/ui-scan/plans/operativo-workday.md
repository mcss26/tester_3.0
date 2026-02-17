node.exe : (node:11800) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:11800) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:24180) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 609.670591ms...
Plan de Remediaci├│n: `operativo-workday.html`

A continuaci├│n se presenta el plan para alinear el archivo `pages/operativo/operativo-workday.html` con los est├índares definidos en el Golden Standard (GS), apuntando a un score de compliance superior al 85%.

### Archivo 1: `pages/operativo/operativo-workday.html`

#### 1.1. Refactor de Header

*   **Qu├® cambia:** Se reestructurar├í el encabezado principal para incluir un subt├¡tulo y una barra de acciones, mejorando la jerarqu├¡a visual y la consistencia con otras p├íginas.
*   **Acciones:**
    1.  Envolver el `h2` principal en un `div.dashboard-header`.
    2.  A├▒adir un `h3.dashboard-subtitle-soft` despu├®s del `h2` para contexto adicional.
    3.  Crear un `div.actions-bar` para agrupar los controles principales (filtros de fecha y botones de acci├│n).
*   **L├¡neas aproximadas:** 10-25
*   **Patr├│n GS:** Secci├│n 2.1 (Header & Page Title), 2.2 (Actions Bar).

#### 1.2. Remediaci├│n de Tabla de Datos

*   **Qu├® cambia:** La tabla de workdays ser├í modernizada para cumplir con los est├índares de visualizaci├│n, interactividad y accesibilidad.
*   **Acciones:**
    1.  Envolver la `<table>` en un `div.table-scroll` para habilitar el desbordamiento horizontal en pantallas peque├▒as.
    2.  Aplicar la clase `table-sticky` a la tabla para que el encabezado (`thead`) permanezca fijo durante el scroll vertical.
    3.  Asegurar que `<thead>` contenga `th` con la clase `table-head`.
    4.  A├▒adir la clase `cell-pad` a todos los `td` para un espaciado consistente.
    5.  Agregar la clase `sortable` a los `th` que permitan ordenamiento y anidar un `span.sort-icon` dentro de ellos.
    6.  Aplicar clases de utilidad como `text-right` a las celdas num├®ricas.
*   **L├¡neas aproximadas:** 30-70
*   **Patr├│n GS:** Secci├│n 4.1 (Data Tables), 4.2 (Table Styles).

#### 1.3. Estandarizaci├│n de Formularios y Controles

*   **Qu├® cambia:** Los campos de fecha y los botones de filtro ser├ín reestructurados para usar los patrones GS, mejorando la usabilidad y la consistencia.
*   **Acciones:**
    1.  Agrupar los `input[type="date"]` en un `div.date-range-inline`.
    2.  Insertar un `span.date-separator` entre los dos inputs de fecha.
    3.  Aplicar la clase `input-compact` a los campos de fecha para integrarlos mejor en la `actions-bar`.
*   **L├¡neas aproximadas:** 20-30
*   **Patr├│n GS:** Secci├│n 6.2 (Form Inputs), 6.4 (Date Pickers).

#### 1.4. Actualizaci├│n de Botones y Accesibilidad (ARIA)

*   **Qu├® cambia:** Se reemplazar├ín las clases de botones no est├índar y se mejorar├í la accesibilidad a├▒adiendo atributos ARIA.
*   **Acciones:**
    1.  Aplicar `btn-ghost` a botones de acciones secundarias.
    2.  Utilizar `btn-icon-flat` para botones con ├¡conos sin fondo.
    3.  Implementar `btn-danger` para acciones destructivas (ej. "Eliminar").
    4.  A├▒adir `aria-label` a todos los `button` e `input` para describir su funci├│n (ej., `aria-label="Filtrar por rango de fechas"`).
*   **L├¡neas aproximadas:** 25-60
*   **Patr├│n GS:** Secci├│n 5.1 (Buttons), 1.3 (Accessibility).

#### 1.5. Implementaci├│n de Modal

*   **Qu├® cambia:** Si existe una funcionalidad de modal (actualmente no visible o con clases incorrectas), se refactorizar├í para usar el patr├│n GS.
*   **Acciones:**
    1.  Estructurar el contenedor principal con la clase `modal`.
    2.  Dentro del modal, usar `modal-content` y `modal-content-md` o `lg` para definir el tama├▒o.
    3.  A├▒adir un bot├│n con la clase `modal-close` para cerrar la ventana.
*   **L├¡neas aproximadas:** 75-90 (si el modal se crea desde cero).
*   **Patr├│n GS:** Secci├│n 7.1 (Modals).

### Archivo 2: `assets/css/admin-workdays.css` (Si aplica)

*   **Justificaci├│n:** El archivo `operativo-workday.html` podr├¡a estar utilizando estilos del m├│dulo de `admin` por similitud de funcionalidad. Si se encuentra un CSS espec├¡fico para `operativo-workday`, se actuar├í sobre ├®l. De lo contrario, se asumir├í que los estilos base est├ín en `components.css`.
*   **Qu├® cambia:** Se buscar├ín y eliminar├ín las clases o estilos que se reemplazar├ín con las utilidades y componentes del Golden Standard.
*   **Acciones:**
    1.  Identificar y eliminar cualquier estilo que genere `inline-styles` en el HTML.
    2.  Refactorizar o eliminar clases que dupliquen la funcionalidad de `btn-*`, `table-*`, `text-*`, etc.
*   **L├¡neas aproximadas:** Variable, dependiendo del contenido del archivo.
*   **Patr├│n GS:** Secci├│n 1.1 (Guiding Principles - Don't Re-invent).
