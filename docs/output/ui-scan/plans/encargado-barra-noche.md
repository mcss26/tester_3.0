node.exe : (node:15616) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:15616) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:16036) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Perfecto. Crear├® un plan de remediaci├│n para `encargado-barra-noche.html` siguiendo tus instrucciones.

Mi estrategia ser├í abordar las violaciones de compliance en orden de prioridad (Layout, Navegaci├│n, Header, etc.), utilizando `pages/admin/admin-central-stock.html` como modelo estructural.

Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 1s.. Retrying after 1147.293544ms...
Empecemos por definir las tareas.Okay, mi primera acci├│n ser├í inspeccionar los archivos clave para entender el Golden Standard, la implementaci├│n de referencia y el estado actual del archivo a remediar. Esto me permitir├í crear un plan de acci├│n preciso.

Procedo a leer `docs/ui-golden-standard.md`, `pages/admin/admin-central-stock.html`, y `pages/encargados/encargado-barra-noche.html`. Tambi├®n verificar├® si existe un CSS espec├¡fico para la p├ígina en `assets/css/encargado-barra-noche.css`.
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 0s.. Retrying after 214.22824200000002ms...
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 1s.. Retrying after 1722.799454ms...
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 1s.. Retrying after 1466.419817ms...
Basado en el an├ílisis de los documentos de referencia y el archivo de destino, he creado el siguiente plan de remediaci├│n para alinear `encargado-barra-noche.html` con el Golden Standard.

El plan se divide en dos fases: primero, la reestructuraci├│n del archivo HTML para adoptar el layout est├índar y, segundo, el refactor de su CSS asociado para eliminar redundancias y alinearlo con los componentes globales.

---

### Plan de Implementaci├│n

#### **Archivo 1: `pages/encargados/encargado-barra-noche.html`**

1.  **Reestructuraci├│n del Layout Principal**
    *   **Qu├® cambia:** Se reemplazar├í la estructura actual (`header.topbar`, `main.noche-content`) por el layout Golden Standard. Se agregar├í un `header.topbar` can├│nico, seguido de `main.page-shell > .page-card-wrap > .page-card`. Todos los `div` de estado (`#pageLoading`, `#pageNoDay`, etc.) se mover├ín dentro de `.page-card`.
    *   **Por qu├®:** Para cumplir con el requisito de layout fundamental del Golden Standard, asegurando consistencia visual y estructural con el resto de la aplicaci├│n.
    *   **L├¡neas afectadas (aprox):** 15-150.
    *   **Patr├│n GS de referencia:** Secci├│n "Admin Layout Foundation" y "Standard HTML Anatomy" (docs/ui-golden-standard.md).

2.  **Implementaci├│n del Topbar y Breadcrumb Est├índar**
    *   **Qu├® cambia:** El `<header>` actual ser├í reemplazado por el `topbar` de 3 columnas del Golden Standard. Se a├▒adir├í un `breadcrumb` de navegaci├│n.
    *   **Por qu├®:** Para unificar la navegaci├│n superior. El `breadcrumb` mejora la ubicaci├│n del usuario dentro de la jerarqu├¡a de la aplicaci├│n. El `topbar` actual es un anti-patr├│n.
    *   **L├¡neas afectadas (aprox):** 18-29.
    *   **Patr├│n GS de referencia:** Secci├│n "Admin Layout Foundation", Subsecci├│n "Topbar" y "Breadcrumb".

3.  **Refactor de Headers de Secci├│n**
    *   **Qu├® cambia:** Los t├¡tulos `h2.dashboard-title` se anidar├ín dentro de la estructura `.dashboard-header`. Se agregar├ín subt├¡tulos con la clase `.dashboard-subtitle-soft` donde sea apropiado para dar contexto.
    *   **Por qu├®:** Para adoptar el patr├│n de encabezado de p├ígina est├índar, mejorando la jerarqu├¡a visual y la consistencia.
    *   **L├¡neas afectadas (aprox):** 41, 51, 62, 92, 102.
    *   **Patr├│n GS de referencia:** Secci├│n "1. Dashboard Header with Tabs".

4.  **Estandarizaci├│n del Modal de Confirmaci├│n**
    *   **Qu├® cambia:** El `<dialog id="confirmModal">` ser├í refactorizado. El `h2` del t├¡tulo se cambiar├í a `h3.modal-title` y se mover├í dentro de un `.modal-header`. Se verificar├í que el resto de las clases (`.modal-content`, `.modal-body`, `.modal-footer`) cumplan con el est├índar.
    *   **Por qu├®:** Para alinear el ├║nico modal de la p├ígina con el patr├│n GS, asegurando un comportamiento y estilo consistentes para todos los di├ílogos.
    *   **L├¡neas afectadas (aprox):** 128-141.
    *   **Patr├│n GS de referencia:** Secci├│n "7. Modal Dialog (Native `<dialog>`)".

5.  **Mejora de Formularios y Accesibilidad (ARIA)**
    *   **Qu├® cambia:** Se asociar├ín las `textarea` con elementos `<label class="form-label">`. Se agregar├ín `aria-label` descriptivos a todos los botones, especialmente a los de solo ├¡cono (`ÔåÉ`, `Ôå╗`).
    *   **Por qu├®:** Cumple con el criterio de ├®xito de accesibilidad. Las etiquetas correctas mejoran la usabilidad y el soporte para lectores de pantalla. Los `aria-label` son cruciales para botones sin texto visible.
    *   **L├¡neas afectadas (aprox):** 20, 27, 82, 116.
    *   **Patr├│n GS de referencia:** Secciones "Accessibility Guidelines" y "3. Sidebar Filter Panel" (para `form-label`).

#### **Archivo 2: `assets/css/encargado-noche.css`**

1.  **Eliminaci├│n de Estilos de Layout Redundantes**
    *   **Qu├® cambia:** Se eliminar├ín las definiciones de `.noche-content`, `.topbar`, `.topbar-left`, `.topbar-center`, `.topbar-right`, y cualquier otro estilo que defina la estructura principal de la p├ígina.
    *   **Por qu├®:** Estos estilos ahora son provistos globalmente por `components.css` a trav├®s del nuevo marcado HTML. Mantenerlos generar├¡a conflictos y anular├¡a el prop├│sito del Golden Standard.
    *   **L├¡neas afectadas (aprox):** Desconocido (se estima ~30-50% del archivo).
    *   **Patr├│n GS de referencia:** Secci├│n "CSS Architecture" -> "Consolidation Rules".

2.  **Refactor de Estilos de Estado y Componentes**
    *   **Qu├® cambia:** Se auditar├ín y ajustar├ín las clases restantes como `.noche-state`, `.staff-dashboard`, `.staff-list`, `.noche-spinner`. Se asegurar├í que solo contengan estilos espec├¡ficos que no compitan con `components.css`. El spinner se reemplazar├í por el `.state-spinner` del GS si es posible.
    *   **Por qu├®:** Para adaptar los estilos espec├¡ficos de la p├ígina a la nueva estructura de layout y evitar colisiones de especificidad. El objetivo es que este CSS solo *extienda* el Golden Standard, no lo reemplace.
    *   **L├¡neas afectadas (aprox):** Desconocido (se estima ~50-70% del archivo).
    *   **Patr├│n GS de referencia:** Secci├│n "CSS Architecture" -> "Naming Convention" y "Specificity Rules".

Este plan aborda todos los puntos de la solicitud, priorizando los cambios estructurales de alto impacto y finalizando con los ajustes de CSS y accesibilidad para alcanzar el score de compliance deseado.
