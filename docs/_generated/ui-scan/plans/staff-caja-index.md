node.exe : (node:35552) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:35552) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:31264) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 355.903822ms...
Plan de Remediaci├│n: `pages/staff/staff-caja-index.html`

A continuaci├│n se presenta el plan para alinear `pages/staff/staff-caja-index.html` con el Golden Standard (GS), apuntando a un score de compliance superior al 85%.

### 1. Archivo: `pages/staff/staff-caja-index.html`

#### 1.1. Agregar Breadcrumbs (Navegaci├│n)
*   **Qu├® y Por Qu├®:** Se insertar├í una estructura de navegaci├│n `breadcrumbs` al inicio del `main-content` para mejorar la ubicaci├│n del usuario dentro de la aplicaci├│n, siguiendo el est├índar de navegaci├│n.
*   **L├¡neas Afectadas:** ~5-10 (al inicio del `div.main-content`).
*   **Patr├│n GS de Referencia:** Secci├│n 2.1 (Navigation & Breadcrumbs).

#### 1.2. Implementar `dashboard-header`
*   **Qu├® y Por Qu├®:** Se reemplazar├í el `h3` actual con una cabecera estandarizada `dashboard-header`. Esto incluye el t├¡tulo principal, subt├¡tulos descriptivos y una `actions-bar` para agrupar los controles principales, mejorando la jerarqu├¡a visual y la consistencia.
*   **L├¡neas Afectadas:** ~15-25 (reemplazando el `h3` existente).
*   **Patr├│n GS de Referencia:** Secci├│n 3.1 (Dashboard Header).

#### 1.3. Refactorizar Controles y Formularios
*   **Qu├® y Por Qu├®:** Los controles de fecha y botones de acci├│n se agrupar├ín dentro de la nueva `actions-bar`. Se aplicar├ín las clases `form-group`, `form-label` y `date-range-inline` a los inputs de fecha para estandarizar su apariencia y se a├▒adir├ín `aria-label` para accesibilidad.
*   **L├¡neas Afectadas:** ~10-15.
*   **Patr├│n GS de Referencia:** Secci├│n 6.2 (Forms) y 4.1 (Buttons).

#### 1.4. Estructurar Secci├│n de Gr├ífico (Chart)
*   **Qu├® y Por Qu├®:** Se envolver├í el `canvas` del gr├ífico en una estructura `chart-section` con un `chart-header` y una `chart-kpis-grid`. Aunque no se implementar├í la l├│gica de los KPIs, se dejar├í la estructura HTML lista para alinearla con el est├índar visual de reporter├¡a.
*   **L├¡neas Afectadas:** ~20-30.
*   **Patr├│n GS de Referencia:** Secci├│n 5.1 y 5.2 (Charts).

#### 1.5. Estandarizar Botones
*   **Qu├® y Por Qu├®:** Se aplicar├ín las clases de bot├│n correctas (`btn-primary`, `btn-secondary`) a los botones existentes y se a├▒adir├ín los atributos `aria-label` correspondientes para describir su funci├│n.
*   **L├¡neas Afectadas:** ~4-8.
*   **Patr├│n GS de Referencia:** Secci├│n 4.1 (Buttons).

### 2. Archivo: `assets/css/staff-caja.css`

#### 2.1. Crear y Poblar `staff-caja.css`
*   **Qu├® y Por Qu├®:** Actualmente no existe un CSS dedicado. Se crear├í `assets/css/staff-caja.css` para mover cualquier estilo espec├¡fico que pudiera ser necesario, aunque el objetivo es usar exclusivamente las clases del Golden Standard de `components.css`. Se a├▒adir├í el `link` correspondiente en el `head` de `staff-caja-index.html`. Por ahora, el archivo estar├í mayormente vac├¡o, sirviendo como placeholder para futuras customizaciones menores.
*   **L├¡neas Afectadas (HTML):** 1 (en el `<head>`).
*   **L├¡neas Afectadas (CSS):** 5 (inicializaci├│n y comentarios).
*   **Patr├│n GS de Referencia:** Secci├│n 1.3 (CSS Architecture).
