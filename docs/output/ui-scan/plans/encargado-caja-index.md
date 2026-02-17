node.exe : (node:11140) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:11140) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:33892) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Excelente. Basado en los archivos y el contexto, aqu├¡ est├í el plan de implementaci├│n detallado para remediar `encargado-caja-index.html` y alinearlo con el Golden Standard.

### Plan de Remediaci├│n: `encargado-caja-index.html`

---

#### **1. Archivo a Modificar: `pages/encargados/encargado-caja-index.html`**

El objetivo principal es reemplazar la estructura obsoleta `launcher-page` por el layout moderno y est├índar `page-shell`, `page-card` y `dashboard-header`, logrando una consistencia visual y estructural con el resto de la aplicaci├│n.

*   **Cambio 1: Adoptar la Estructura de Layout Golden Standard (GS)**
    *   **Qu├® y por qu├®:** Se reemplazar├í `class="launcher-page"` en el `<body>` por `class="app-shell admin-shell"`. El `main` con clase `launcher-center` ser├í sustituido por la estructura anidada `<main class="page-shell">` -> `<div class="page-card-wrap">` -> `<div class="page-card">`. Esta acci├│n corrige el incumplimiento principal de "Layout" (Missing: page-shell, page-card-wrap, page-card) y establece la base para los dem├ís cambios.
    *   **L├¡neas Afectadas:** ~15-45 (reestructuraci├│n del `<body>` y `main`).
    *   **Patr├│n GS de Referencia:** Secci├│n "Admin Layout Foundation".

*   **Cambio 2: Implementar `dashboard-header` y Corregir Jerarqu├¡a de T├¡tulos**
    *   **Qu├® y por qu├®:** Se eliminar├í el `<h1>` actual. Dentro del nuevo `page-card`, se insertar├í un `<div class="dashboard-header">` que contendr├í un t├¡tulo `h2 class="dashboard-title"` ("Encargado de Caja") y un subt├¡tulo `p class="dashboard-subtitle-soft"` ("Seleccione la tarea a realizar"). Esto resuelve la falta del `dashboard-header` y corrige la jerarqu├¡a de encabezados, un requisito del GS.
    *   **L├¡neas Afectadas:** ~25-30 (dentro del nuevo `page-card`).
    *   **Patr├│n GS de Referencia:** Secci├│n 1 "Dashboard Header with Tabs".

*   **Cambio 3: Refactorizar Navegaci├│n a Botones de Acci├│n y Mejorar ARIA**
    *   **Qu├® y por qu├®:** Los enlaces de navegaci├│n (`<a class="nav-link">`) se convertir├ín en botones m├ís prominentes y visualmente acordes al GS. Se colocar├ín dentro de un contenedor `actions-bar` o similar. Se les aplicar├ín clases como `btn btn-primary btn-lg` para darles jerarqu├¡a visual. Se a├▒adir├ín atributos `aria-label` descriptivos a cada bot├│n (ej: `aria-label="Acceder a la gesti├│n de personal"`), cumpliendo el requisito de cobertura ARIA.
    *   **L├¡neas Afectadas:** ~35-40.
    *   **Patr├│n GS de Referencia:** Secci├│n 9 "Button System" y "Accessibility Guidelines".

*   **Cambio 4: Limpiar Referencias CSS Obsoletas**
    *   **Qu├® y por qu├®:** Se eliminar├í el `<link>` que apunta a `assets/css/launcher.css`. Las clases de este archivo ser├ín reemplazadas por las clases de `components.css` y utilidades del Golden Standard. Esto reduce la carga de estilos innecesarios y centraliza el dise├▒o en la fuente de verdad (`components.css`).
    *   **L├¡neas Afectadas:** ~10 (en el `<head>`).
    *   **Patr├│n GS de Referencia:** Secci├│n "CSS Architecture" (promueve la consolidaci├│n y eliminaci├│n de CSS redundante).

---

#### **2. Archivo a Modificar: `assets/css/admin-central-stock.css`**

*   **Cambio 1: Ajustar Breadcrumb en el Topbar**
    *   **Qu├® y por qu├®:** El breadcrumb actual solo muestra "ENCARGADO CAJA". Se modificar├í para seguir la estructura de la referencia `admin-central-stock.html`, anidando un `<a>` dentro del primer `span.breadcrumb-item` y agregando el separador. Aunque sea una p├ígina de inicio, se preparar├í la estructura correcta para futuras p├íginas del m├│dulo. El `breadcrumb-item` actual se marcar├í con la clase `current`.
    *   **L├¡neas Afectadas:** ~18-21 (en `encargado-caja-index.html`).
    *   **Patr├│n GS de Referencia:** Secci├│n "Breadcrumb".

---

Este plan aborda de manera integral todos los incumplimientos detectados en la auditor├¡a, siguiendo las reglas y utilizando los patrones definidos en la documentaci├│n del Golden Standard. La ejecuci├│n de estos pasos deber├¡a elevar el score de compliance por encima del 85% requerido.
