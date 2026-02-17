node.exe : (node:16472) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:16472) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:28200) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 773.651329ms...
Plan de implementaci├│n para la remediaci├│n de `admin-master-proveedores.html` al Golden Standard.

### Resumen de la Estrategia
El plan se enfoca en tres ├íreas principales de remediaci├│n:
1.  **Estructura y Layout:** Se actualizar├í el encabezado y la estructura general de la p├ígina para alinearse con el layout del dashboard (`Header`, `actions-bar`).
2.  **Componentes Clave:** Se reemplazar├í el `select` nativo por el componente `custom-dropdown` y se reconstruir├í la tabla de datos aplicando el set completo de clases Golden Standard (`Tables`).
3.  **Estilo y Accesibilidad:** Se aplicar├ín las clases de `Buttons`, `Forms` y `Utilities` faltantes, se eliminar├ín estilos inline y se a├▒adir├ín atributos ARIA para mejorar la accesibilidad.

La referencia principal para la estructura ser├í `pages/admin/admin-central-stock.html` y las clases se tomar├ín de `docs/ui-golden-standard.md`.

---

### **1. Archivo: `pages/admin/admin-master-proveedores.html`**

#### **a. Remediaci├│n del Encabezado (Header)**
*   **Qu├® cambia y por qu├®:** Se reestructurar├í el encabezado de la p├ígina para que coincida con el layout est├índar del dashboard. Esto implica envolver el t├¡tulo principal y agregar un subt├¡tulo (`dashboard-title-soft`) y una barra de acciones (`actions-bar`) para los botones principales, mejorando la consistencia visual y la jerarqu├¡a de la informaci├│n.
*   **L├¡neas aproximadas afectadas:** 5-20.
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secci├│n 3: Layout & Navigation).

#### **b. Reemplazo de `<select>` Nativo por `custom-dropdown`**
*   **Qu├® cambia y por qu├®:** Se reemplazar├í el elemento `<select>` existente para filtrar por categor├¡a. El componente `custom-dropdown` ofrece una mejor experiencia de usuario, consistencia de marca y es requerido por el Golden Standard. Se agregar├ín atributos ARIA para accesibilidad.
*   **L├¡neas aproximadas afectadas:** 35-45.
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secci├│n 6.2: Custom Dropdowns).

#### **c. Reconstrucci├│n de la Tabla de Datos**
*   **Qu├® cambia y por qu├®:** La tabla actual carece de las clases y estructura del Golden Standard. Se envolver├í la tabla en un `div.table-scroll` y se aplicar├ín las clases `table`, `table-compact`, y `table-sticky`. Se diferenciar├ín los `th` y `td` con `table-head`, `table-cell`, y `cell-pad`. Se agregar├ín ├¡conos de ordenamiento (`sort-icon`) a las cabeceras `sortable`. Esto asegura un dise├▒o responsivo, una apariencia consistente y una funcionalidad mejorada.
*   **L├¡neas aproximadas afectadas:** 60-150.
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secci├│n 5: Tables).

#### **d. Aplicaci├│n de Clases de Botones y Utilidades**
*   **Qu├® cambia y por qu├®:** Se identificar├ín los botones que requieran estilos espec├¡ficos como `btn-danger` (para acciones destructivas como "Eliminar") y `btn-icon-flat` (para botones con solo un ├¡cono sin fondo). Se agregar├ín atributos `aria-label` a todos los botones para describir su funci├│n. Adem├ís, se usar├ín clases de utilidad como `text-center` o `text-right` en celdas de la tabla para alinear el contenido correctamente.
*   **L├¡neas aproximadas afectadas:** Dispersas por todo el archivo (principalmente en la `actions-bar` y dentro de la tabla).
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secci├│n 6.1: Buttons & Secci├│n 9: Utilities).

#### **e. Remediaci├│n de Formularios**
*   **Qu├® cambia y por qu├®:** Se revisar├ín los formularios de edici├│n y creaci├│n. Se aplicar├ín clases como `date-range-inline` si hay campos de fecha contiguos. Se asegurar├í que todos los `input` tengan `aria-label` o un `label` asociado correctamente.
*   **L├¡neas aproximadas afectadas:** 150-250.
*   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md` (Secci├│n 6.3: Forms).

### **2. Archivo: `assets/css/admin-master-proveedores.css` (Si existe)**

*   **Qu├® cambia y por qu├®:** Se verificar├í la existencia de este archivo. Si existe, se analizar├í para identificar y eliminar cualquier regla de CSS que se vuelva redundante despu├®s de aplicar las clases del Golden Standard. El objetivo es que el estilo provenga de `components.css` y las clases de utilidad, no de CSS espec├¡fico de la p├ígina.
*   **L├¡neas aproximadas afectadas:** N/A (depende del contenido del archivo).
*   **Patr├│n GS de referencia:** N/A (Refactorizaci├│n y eliminaci├│n de c├│digo).

Este plan garantiza una cobertura completa de los "Hints de remediaci├│n", apuntando a superar el 85% de compliance y cumplir con todos los criterios de ├®xito definidos.
