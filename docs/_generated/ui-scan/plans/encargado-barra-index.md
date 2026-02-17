node.exe : (node:18348) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:18348) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:2776) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
De acuerdo. A continuaci├│n, presento el plan de remediaci├│n para `encargado-barra-index.html` siguiendo las directrices proporcionadas.

### Plan de Remediaci├│n: `encargado-barra-index.html`

El objetivo es refactorizar el HTML para cumplir con el Golden Standard (GS), enfoc├índose en la estructura, la navegaci├│n y la sem├íntica, sin alterar la funcionalidad existente. Se usar├í `pages/admin/admin-central-stock.html` como gu├¡a de implementaci├│n.

---

#### **Archivo 1: `pages/encargados/encargado-barra-index.html`**

1.  **Cambio: Reemplazar `<h1>` con la estructura `dashboard-header` completa.**
    *   **Por qu├®:** El `<h1>` actual no sigue la jerarqu├¡a de encabezados del GS y carece de contexto. Se reemplazar├í por un `<h2>` dentro de un `dashboard-header`, que incluye el t├¡tulo principal, un subt├¡tulo descriptivo y una barra de acciones, mejorando la consistencia y la accesibilidad.
    *   **L├¡neas afectadas (aprox):** 5-15
    *   **Patr├│n GS de referencia:** 3.1 (Dashboard Header), 3.2 (Actions Bar)

2.  **Cambio: Implementar la estructura de layout `page-shell` y `page-card`.**
    *   **Por qu├®:** El contenido actual no tiene un contenedor principal estandarizado. Envolver el contenido en `<div class="page-shell">` y `<div class="page-card">` asegura que la p├ígina siga el layout principal del sistema, controlando el espaciado, los anchos m├íximos y el fondo.
    *   **L├¡neas afectadas (aprox):** 1-5 (inicio) y 30-35 (cierre).
    *   **Patr├│n GS de referencia:** 2.1 (Page Shell), 2.2 (Page Card)

3.  **Cambio: Agregar navegaci├│n `breadcrumb`.**
    *   **Por qu├®:** Falta una ruta de navegaci├│n que ubique al usuario dentro del sistema. Se a├▒adir├í un `nav` con la clase `breadcrumb` antes del `dashboard-header` para indicar la jerarqu├¡a de la p├ígina (e.g., "Encargados > Barra > Inicio").
    *   **L├¡neas afectadas (aprox):** 5-10
    *   **Patr├│n GS de referencia:** 4.1 (Breadcrumb)

4.  **Cambio: Mejorar sem├íntica de botones y agregar atributos ARIA.**
    *   **Por qu├®:** El bot├│n existente necesita mayor contexto para lectores de pantalla y debe seguir el patr├│n de clases del GS. Se le agregar├ín clases como `btn` y `btn-primary` y un `aria-label` descriptivo.
    *   **L├¡neas afectadas (aprox):** 20-25
    *   **Patr├│n GS de referencia:** 5.1 (Buttons), 10.1 (ARIA)

#### **Archivo 2: `assets/css/encargado-barra-index.css` (Hipot├®tico)**

*   **An├ílisis:** No se encontr├│ un archivo CSS espec├¡fico para `encargado-barra-index.css` en la estructura de archivos. Si existiera, el plan ser├¡a:
    1.  **Cambio:** Migrar estilos custom a clases de `components.css`.
        *   **Por qu├®:** Para eliminar CSS espec├¡fico de la p├ígina y maximizar el uso de utilidades y componentes reusables del Golden Standard.
        *   **L├¡neas afectadas (aprox):** Todas.
        *   **Patr├│n GS de referencia:** 1.2 (Principios de Dise├▒o), 8.0 (Utilities)

Este plan aborda las deficiencias de Layout, Navigation, Header y ARIA, que son las de mayor impacto. Al completarlo, se espera que el score de compliance supere el 85% y se cumplan todos los criterios de ├®xito definidos.
