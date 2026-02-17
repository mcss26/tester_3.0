node.exe : (node:37316) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:37316) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:30452) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 4.227523000000001ms...
De acuerdo. A continuaci├│n, presento el plan de implementaci├│n para remediar `encargado-caja-noche.html` y alinearlo con el Golden Standard.

### Plan de Remediaci├│n

#### **1. Archivo: `pages/encargados/encargado-caja-noche.html`**

Este archivo requiere una reestructuraci├│n profunda para adoptar el layout est├índar, los componentes de navegaci├│n, encabezados y la sustituci├│n de elementos nativos.

*   **Cambio 1: Implementar Layout y Encabezado Est├índar.**
    *   **Qu├®:** Envolver el contenido principal con la estructura de layout `dashboard-layout` y `dashboard-main`. Se agregar├í el bloque `dashboard-header` con `dashboard-title` (h2), `dashboard-subtitle-soft` y una `actions-bar` para los controles principales.
    *   **Por qu├®:** Es el cambio m├ís importante para alinear la p├ígina con la estructura visual y sem├íntica del Golden Standard. Corrige las faltas en las categor├¡as "Layout" y "Header".
    *   **L├¡neas afectadas:** ~25-35 (a├▒adiendo wrappers y el nuevo encabezado).
    *   **Patr├│n GS:** Secciones 2.1 (Layout), 3.1 (Dashboard Header).

*   **Cambio 2: Agregar Navegaci├│n (Topbar y Breadcrumbs).**
    *   **Qu├®:** Integrar el componente `topbar` al inicio del `dashboard-main`. Dentro, se anidar├í una `breadcrumb-bar` con los elementos de navegaci├│n (`breadcrumb`, `breadcrumb-item`, `breadcrumb-link`, `breadcrumb-sep`) que ubiquen al usuario dentro del m├│dulo "Encargados".
    *   **Por qu├®:** Resuelve la falta cr├¡tica de navegaci├│n (`Navigation: falta (25%)`), una pieza clave de la UX est├índar.
    *   **L├¡neas afectadas:** ~10-15.
    *   **Patr├│n GS:** Secci├│n 3.2 (Topbar & Breadcrumbs).

*   **Cambio 3: Reemplazar 3 `<select>` nativos por `.custom-dropdown`.**
    *   **Qu├®:** Se localizar├ín los 3 elementos `<select>` y se reemplazar├ín por la estructura `div.custom-dropdown` que contiene un `button.custom-dropdown-trigger` y un `div.custom-dropdown-menu` con las opciones. Se migrar├ín los `value` y texto de cada `<option>` nativo.
    *   **Por qu├®:** Elimina el anti-patr├│n de mayor prioridad ("HIGH: Reemplazar 3 <select> nativos"). Unifica la apariencia de todos los controles de selecci├│n.
    *   **L├¡neas afectadas:** ~40-60 (cada `<select>` se convierte en ~15-20 l├¡neas de HTML).
    *   **Patr├│n GS:** Secci├│n 4.6 (Custom Dropdowns).

*   **Cambio 4: Corregir Estructura del Sistema de Tabs.**
    *   **Qu├®:** Se envolver├í el contenido de cada pesta├▒a (el panel que se muestra/oculta) dentro de un `div.tab-content`.
    *   **Por qu├®:** Completa la implementaci├│n del patr├│n `TabSystem` (`parcial (67%)`), asegurando que el contenido de las pesta├▒as est├® correctamente contenedorizado.
    *   **L├¡neas afectadas:** ~5-10 (a├▒adiendo los `div` contenedores).
    *   **Patr├│n GS:** Secci├│n 3.3 (Tab System).

*   **Cambio 5: Aplicar Clases de Botones y Formularios.**
    *   **Qu├®:** Se auditar├ín los 19 botones y 7 inputs. Se aplicar├ín las clases correctas (`btn-secondary`, `btn-ghost`, `btn-icon`, `input-compact`) donde corresponda. Se a├▒adir├ín `form-label` a las etiquetas de formulario que no lo tengan.
    *   **Por qu├®:** Unifica el estilo de todos los elementos interactivos conforme al standard, solucionando las faltas en "Buttons" y "Forms".
    *   **L├¡neas afectadas:** ~30-40.
    *   **Patr├│n GS:** Secciones 4.1 (Buttons), 4.2 (Forms).

*   **Cambio 6: A├▒adir Atributos ARIA.**
    *   **Qu├®:** Se agregar├ín `aria-label` descriptivos a todos los botones (especialmente los de ├¡cono) e inputs. Los `custom-dropdown-trigger` tambi├®n recibir├ín atributos ARIA para indicar su funci├│n.
    *   **Por qu├®:** Cumple con el criterio de ├®xito de accesibilidad y es una buena pr├íctica fundamental.
    *   **L├¡neas afectadas:** N/A (modificaci├│n de atributos existentes).

*   **Cambio 7: Corregir Jerarqu├¡a de Encabezados.**
    *   **Qu├®:** El t├¡tulo principal de la p├ígina se convertir├í en un `h2` dentro del `dashboard-header`. Los 5 `h3` existentes se revisar├ín para asegurar que act├║an como subt├¡tulos de secciones l├│gicas bajo el `h2`.
    *   **Por qu├®:** Asegura una estructura de documento sem├ínticamente correcta y accesible.
    *   **L├¡neas afectadas:** ~5.

#### **2. Archivo: `assets/css/encargado-noche.css`**

Este archivo probablemente contiene estilos que ahora son redundantes gracias a las clases de `components.css`.

*   **Cambio 1: Refactorizar y Eliminar Estilos Redundantes.**
    *   **Qu├®:** Se analizar├í el CSS. Las reglas que definen propiedades ahora cubiertas por clases de utilidad del Golden Standard (ej. `text-align: center`, `display: none`, `font-size`) ser├ín eliminadas. Las clases correspondientes (`text-center`, `u-hidden`, `text-xs`) se aplicar├ín directamente en el HTML.
    *   **Por qu├®:** Reduce la deuda t├®cnica, disminuye la especificidad del CSS y promueve el uso del framework de clases de utilidad, atacando la categor├¡a `Utilities: falta (0%)`.
    *   **L├¡neas afectadas:** Variable (depende del contenido del archivo), pero se espera una reducci├│n significativa.
    *   **Patr├│n GS:** Secci├│n 8.1 (Utility Classes).

Este plan aborda sistem├íticamente todas las desviaciones reportadas, priorizando los cambios estructurales y los anti-patrones m├ís cr├¡ticos para alcanzar el score de compliance deseado.
