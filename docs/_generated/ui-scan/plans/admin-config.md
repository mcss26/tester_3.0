node.exe : (node:22076) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:22076) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:26380) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 2s.. Retrying after 2511.413062ms...
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 1s.. Retrying after 1508.013152ms...
Plan de Remediaci├│n: `admin-config.html` al Golden Standard.

### Archivo: `pages/admin/admin-config.html`

1.  **Header:**
    *   **Cambio:** Implementar la estructura completa del `dashboard-header`, incluyendo `.actions-bar` y el subt├¡tulo `.dashboard-title-soft` para consistencia y funcionalidad.
    *   **L├¡neas:** 15-25.
    *   **Patr├│n GS:** 2.1 Dashboard Header.

2.  **Reemplazo de `<select>` Nativo:**
    *   **Cambio:** Sustituir el `<select>` para seleccionar per├¡odos por el componente `.custom-dropdown`, mejorando la est├®tica y experiencia de usuario.
    *   **L├¡neas:** 30-40.
    *   **Patr├│n GS:** 4.2 Custom Dropdowns.

3.  **Mejora de Formularios y Fechas:**
    *   **Cambio:** Envolver el `input` de fecha en un `.form-group` y agregar `.form-label`. Utilizar el patr├│n `.date-range-inline` para alinear el dropdown de per├¡odo y el input de fecha.
    *   **L├¡neas:** 30-45.
    *   **Patr├│n GS:** 5.1 Forms, 5.3 Date Pickers.

4.  **Optimizaci├│n de Tablas:**
    *   **Cambio:** Envolver las tablas en `.table-scroll` para habilitar el scroll horizontal. Aplicar `.cell-pad` para un espaciado consistente. Agregar `.sortable` y `.sort-icon` a los `<th>` para indicar que las columnas son ordenables.
    *   **L├¡neas:** 50-80, 90-120, 130-160.
    *   **Patr├│n GS:** 3.1 Tables.

5.  **Estandarizaci├│n de Botones:**
    *   **Cambio:** Aplicar las clases de bot├│n correspondientes a los 7 botones existentes. Usar `btn-icon` y `btn-icon-flat` para acciones en tablas, `btn-icon-plus` para a├▒adir elementos, y `btn-danger` para acciones destructivas.
    *   **L├¡neas:** A lo largo del archivo.
    *   **Patr├│n GS:** 4.1 Buttons.

6.  **Atributos ARIA:**
    *   **Cambio:** A├▒adir `aria-label` descriptivos a todos los elementos interactivos (botones, inputs, dropdowns) para mejorar la accesibilidad.
    *   **L├¡neas:** A lo largo del archivo.
    *   **Patr├│n GS:** 1.3 Accessibility (ARIA).

### Archivo: `assets/css/admin-config.css`

1.  **Refactorizaci├│n y Eliminaci├│n:**
    *   **Cambio:** Analizar el CSS existente. Eliminar reglas que ahora son cubiertas por las clases del Golden Standard (ej. espaciado, estilos de bot├│n). Mover cualquier estilo personalizado restante que sea reutilizable a `components.css` si aplica, o mantenerlo si es muy espec├¡fico de esta p├ígina y no contradice al GS.
    *   **L├¡neas:** Todas.
    *   **Patr├│n GS:** 1.1 CSS Utility Classes.

Este plan aborda todos los `anti-patrones` y `missing items` detectados, asegurando superar el 85% de compliance al finalizar.
