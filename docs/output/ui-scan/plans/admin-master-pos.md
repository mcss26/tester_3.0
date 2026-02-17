node.exe : (node:37972) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:37972) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:38980) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Perfecto. Crear├® un plan de remediaci├│n detallado para `admin-master-pos.html` siguiendo las instrucciones.

Mi enfoque ser├í comparar la estructura actual con la de referencia (`admin-central-stock.html`) y aplicar los patrones del Golden Standard (`docs/ui-golden-standard.md`) para resolver las deficiencias reportadas.

Aqu├¡ est├í el plan de implementaci├│n:

### Plan de Remediaci├│n: `admin-master-pos.html`

El objetivo es refactorizar el HTML para adoptar la estructura y clases del Golden Standard (GS), mejorando el score de compliance de 51 a m├ís de 85. Los cambios se centrar├ín en la maquetaci├│n, la estructura de componentes y la accesibilidad.

---

#### **Archivo 1: `pages/admin/admin-master-pos.html`**

##### **1. Reestructuraci├│n General del Layout (Sidebar + Main Content)**
*   **Qu├® cambia:** Se introducir├í el layout principal `grid-sidebar-main` para dividir la p├ígina en una barra lateral de filtros (`grid-sidebar`) y el ├írea de contenido principal (`main-content-area`). Actualmente, la p├ígina carece de esta estructura fundamental.
*   **Por qu├®:** Para cumplir con el est├índar de layout que permite una navegaci├│n y filtrado consistentes en todos los m├│dulos de administraci├│n.
*   **L├¡neas afectadas:** `~10-15` (envolviendo el contenido existente).
*   **Patr├│n GS:** Secci├│n 2.1 (Layout Grid), 3.2 (Sidebar).

##### **2. Remediaci├│n del Header**
*   **Qu├® cambia:** Se a├▒adir├í la clase `.dashboard-subtitle-soft` al subt├¡tulo existente y se crear├í una `div.actions-bar` para agrupar los botones de acci├│n principales (ej. "Agregar Producto").
*   **Por qu├®:** Para alinear el header con el dise├▒o est├índar, mejorando la jerarqu├¡a visual y la organizaci├│n de acciones.
*   **L├¡neas afectadas:** `~20-30`.
*   **Patr├│n GS:** Secci├│n 3.1 (Header).

##### **3. Implementaci├│n de la Sidebar de Filtros**
*   **Qu├® cambia:** Dentro de la nueva `grid-sidebar`, se crear├í una secci├│n de filtros utilizando `aside.sidebar-filters`. Se migrar├ín los controles de filtro existentes (inputs de fecha, etc.) a esta ├írea, organiz├índolos con `.sidebar-section` y `.sidebar-section-title`.
*   **Por qu├®:** El reporte indica una falta total de la estructura de sidebar. Centralizar los filtros en una barra lateral es un pilar del Golden Standard.
*   **L├¡neas afectadas:** `~40-60`.
*   **Patr├│n GS:** Secci├│n 3.2 (Sidebar), 4.1 (Filter Bar).

##### **4. Reemplazo de `<select>` nativo por `.custom-dropdown`**
*   **Qu├® cambia:** El `<select>` utilizado para filtrar por categor├¡a ser├í reemplazado por la estructura `div.custom-dropdown` completa, incluyendo `custom-dropdown-trigger`, `custom-dropdown-menu` y las opciones.
*   **Por qu├®:** El uso de selects nativos est├í prohibido por el GS para mantener una consistencia visual y de experiencia de usuario.
*   **L├¡neas afectadas:** `~55-65`.
*   **Patr├│n GS:** Secci├│n 5.4 (Custom Dropdowns).

##### **5. Refactorizaci├│n de la Tabla de Datos**
*   **Qu├® cambia:** La tabla actual ser├í envuelta en una `div.table-scroll`. Se aplicar├ín las clases `.table`, `.table-compact` a `<table>`, `.table-head` a `<thead>`, y se diferenciar├ín celdas de encabezado (`th.is-header.cell-pad`) y de datos (`td.table-cell`). Se agregar├ín `span.sort-icon` a los encabezados `sortable`.
*   **Por qu├®:** El reporte indica una falta casi total de las clases de tabla. Esta remediaci├│n asegura que la tabla sea responsive, estilizada correctamente y funcional.
*   **L├¡neas afectadas:** `~90-150`.
*   **Patr├│n GS:** Secci├│n 5.1 (Tables).

##### **6. Estandarizaci├│n de Botones y Formularios**
*   **Qu├® cambia:**
    *   Se actualizar├ín los `button` existentes, aplicando clases como `.btn-ghost`, `.btn-icon`, y `.btn-danger` seg├║n corresponda.
    *   Se a├▒adir├ín `aria-label` a todos los botones, especialmente a los de ├¡cono.
    *   Los campos de fecha se agrupar├ín en un `div.date-range-inline` y se usar├í la clase `.input-compact`.
    *   Se a├▒adir├ín `aria-label` a todos los `input`.
*   **Por qu├®:** Para cumplir con los est├índares de botones y formularios, mejorar la accesibilidad (ARIA) y la consistencia visual.
*   **L├¡neas afectadas:** `~30-150` (intercalado en todo el archivo).
*   **Patr├│n GS:** Secci├│n 5.2 (Buttons), 5.5 (Forms).

##### **7. Verificaci├│n de Jerarqu├¡a de Headings**
*   **Qu├® cambia:** Se revisar├í que la estructura de encabezados siga el orden l├│gico (ej. `h2` para el t├¡tulo principal, `h3` para secciones, etc.), sin saltos.
*   **Por qu├®:** Para mejorar la sem├íntica del HTML y la accesibilidad para lectores de pantalla.
*   **L├¡neas afectadas:** `~20` y `~80`.
*   **Patr├│n GS:** Secci├│n 1.3 (Accessibility).

---

#### **Archivo 2: `assets/css/admin-master-pos.css`**

*   **An├ílisis:** Actualmente no existe un archivo CSS espec├¡fico para esta p├ígina en la estructura de `assets/css/`.
*   **Acci├│n:** No se requiere ninguna acci├│n. Si durante la remediaci├│n se encontrara la necesidad de un estilo muy espec├¡fico que no pueda ser cubierto por las utilidades del GS, se crear├¡a este archivo. Sin embargo, el objetivo es depender exclusivamente de `components.css`.

---
Este plan aborda sistem├íticamente todas las deficiencias y anti-patrones detectados en el reporte inicial. Al completarlo, se espera que el score supere el 85% y el componente quede alineado con el Golden Standard.
