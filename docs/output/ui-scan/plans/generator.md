node.exe : (node:21508) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:21508) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:26272) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Plan de Remediaci├│n: `pages/admin/qr/generator.html`

A continuaci├│n, se presenta el plan para alinear el archivo `generator.html` con los est├índares definidos en el Golden Standard.

### Archivos a Modificar

1.  **`pages/admin/qr/generator.html`** (Archivo principal a remediar)
2.  **`assets/css/admin-master.css`** (Asumiendo que no existe un CSS espec├¡fico para el generador de QR y que los estilos comunes de admin se pueden extender aqu├¡).

---

### 1. `pages/admin/qr/generator.html`

#### **Cambio 1: Estructura de Layout y Navegaci├│n (Golden Standard)**
*   **Qu├® cambia:** Se reestructurar├í todo el `<body>` para incorporar el layout principal (`page-shell`), la barra de navegaci├│n superior (`topbar`) y la estructura de tarjeta de p├ígina (`page-card-wrap`, `page-card`). Se agregar├í el `breadcrumb` correspondiente a la ubicaci├│n del archivo.
*   **Por qu├®:** Para cumplir con los requerimientos de Layout y Navegaci├│n del Golden Standard, proporcionando una experiencia de usuario consistente con el resto de la aplicaci├│n.
*   **L├¡neas afectadas:** ~1-20 (inicio del body) y ~150-160 (cierre de tags).
*   **Patr├│n GS de referencia:**
    *   Secci├│n 2.1: Page Shell
    *   Secci├│n 2.2: Topbar
    *   Secci├│n 2.3: Breadcrumbs

#### **Cambio 2: Encabezado de Dashboard**
*   **Qu├® cambia:** Se reemplazar├í el `<h1>` actual por la estructura `dashboard-header`, utilizando `<h2>` para el t├¡tulo principal y `<h3>` para los subt├¡tulos, asegurando la jerarqu├¡a correcta. Se a├▒adir├í una `actions-bar` para los botones principales.
*   **Por qu├®:** Para estandarizar los encabezados de p├ígina seg├║n la secci├│n 3.1 del GS y mejorar la sem├íntica y accesibilidad del documento.
*   **L├¡neas afectadas:** ~25-35.
*   **Patr├│n GS de referencia:**
    *   Secci├│n 3.1: Dashboard Header

#### **Cambio 3: Reemplazo de `<select>` nativos por `custom-dropdown`**
*   **Qu├® cambia:** Los 4 elementos `<select>` ser├ín reemplazados por la estructura de `divs` y clases `custom-dropdown` que simulan un select. Se agregar├ín atributos `aria-labelledby` y `role="listbox"`.
*   **Por qu├®:** Es un anti-patr├│n utilizar selects nativos. El GS exige el uso de `custom-dropdown` para mantener una est├®tica y funcionalidad consistentes en toda la plataforma.
*   **L├¡neas afectadas:** ~40-80 (afecta 4 bloques de c├│digo).
*   **Patr├│n GS de referencia:**
    *   Secci├│n 4.3: Custom Dropdowns

#### **Cambio 4: Estandarizaci├│n de Formularios y Botones**
*   **Qu├® cambia:** Se aplicar├ín las clases `.form-group`, `.input`, y `.input-compact` a los `<div>` e `<input>` existentes. A los botones se les aplicar├ín las clases `btn`, `btn-primary`, `btn-danger`, etc., seg├║n corresponda. Se agregar├ín `aria-label` a todos los elementos interactivos para mejorar la accesibilidad.
*   **Por qu├®:** Para cumplir con los est├índares de formularios y botones, asegurando consistencia visual y mejorando la accesibilidad (ARIA).
*   **L├¡neas afectadas:** M├║ltiples l├¡neas dispersas entre ~35-140.
*   **Patr├│n GS de referencia:**
    *   Secci├│n 4.1: Forms
    *   Secci├│n 4.2: Buttons

---

### 2. `assets/css/admin-master.css`

*   **Qu├® cambia:** Actualmente, no se prev├®n cambios en el CSS. Se priorizar├í el uso exclusivo de las clases existentes en `components.css`. Si durante la implementaci├│n se identifica un estilo irremediablemente espec├¡fico y no existente en `components.css`, se a├▒adir├í aqu├¡, pero se considera un escenario poco probable.
*   **Por qu├®:** La regla es no inventar clases nuevas y reutilizar el framework existente. Se asume que `components.css` es suficiente.
*   **L├¡neas afectadas:** 0 (proyectado).
*   **Patr├│n GS de referencia:** N/A.

Este plan garantiza una cobertura completa de los requerimientos, apuntando a un score de compliance superior al 85% y eliminando todos los anti-patrones detectados.
