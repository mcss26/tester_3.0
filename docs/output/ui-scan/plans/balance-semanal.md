node.exe : (node:42200) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:42200) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:10340) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 1s.. Retrying after 1145.722463ms...
Absolutamente. Aqu├¡ est├í el plan de remediaci├│n para actualizar `pages/gerencia/balance-semanal.html` al Golden Standard.

El plan se enfoca en reemplazar componentes nativos por sus equivalentes del Golden Standard (GS), reestructurar el layout general y aplicar clases de utilidad para alinear el visual al 100% con la nueva especificaci├│n.

---

### **Plan de Remediaci├│n: M├│dulo de Gerencia**

#### **1. Archivo: `pages/gerencia/balance-semanal.html`**

Este es el archivo principal a modificar. Los cambios se centran en la estructura del DOM para adoptar los componentes y patrones del Golden Standard.

*   **Cambio 1: Correcci├│n de Jerarqu├¡a de Headings**
    *   **Qu├®:** Cambiar el `<h1>` principal por un `<h2>`. El `h1` est├í reservado para el `index.html` general.
    *   **Por qu├®:** Para cumplir con la sem├íntica correcta de headings en p├íginas anidadas.
    *   **L├¡neas afectadas:** ~15
    *   **Patr├│n GS:** 2.1. Headings

*   **Cambio 2: Reestructuraci├│n del Header de la P├ígina**
    *   **Qu├®:** Envolver el header actual en la estructura `.dashboard-header`. Agregar un subt├¡tulo con `.dashboard-subtitle-soft` y una barra de acciones `.actions-bar` para contener los filtros y botones principales.
    *   **Por qu├®:** Para alinear el header con el layout est├índar de las p├íginas de administraci├│n y reportes.
    *   **L├¡neas afectadas:** ~15-25
    *   **Patr├│n GS:** 3.1. Dashboard Header

*   **Cambio 3: Reemplazo de `<select>` Nativos por `custom-dropdown`**
    *   **Qu├®:** Eliminar los 2 `<select>` de rangos de fecha y reemplazarlos por el componente `.custom-dropdown`. Se agregar├ín atributos ARIA para accesibilidad. Los elementos `label` ser├ín asociados correctamente.
    *   **Por qu├®:** Es el anti-patr├│n de mayor prioridad. Los `select` nativos no son customizables y rompen la consistencia del UI.
    *   **L├¡neas afectadas:** ~25-40 (por cada `select`)
    *   **Patr├│n GS:** 5.2. Custom Dropdown

*   **Cambio 4: Implementaci├│n de Form Groups y Date Range**
    *   **Qu├®:** Envolver los nuevos dropdowns y el input de fecha en `div.form-group` con `label.form-label`. Aplicar el patr├│n `.date-range-inline` a los contenedores de filtros de fecha.
    *   **Por qu├®:** Para estandarizar el espaciado, alineaci├│n y etiquetado de los controles de formulario.
    *   **L├¡neas afectadas:** ~20-30
    *   **Patr├│n GS:** 5.1. Forms

*   **Cambio 5: Refactor de la Tabla de Datos**
    *   **Qu├®:** Envolver la `<table>` existente en un `div.table-shell`. Agregar clases `.table-compact` a la tabla, `.is-header` al `<thead>`, y `.cell-pad` a los `<td>`. Se a├▒adir├ín `div.sort-icon` a las cabeceras de columna que sean ordenables.
    *   **Por qu├®:** Para aplicar el estilo est├índar de tablas, asegurando consistencia en padding, bordes y comportamiento responsive.
    *   **L├¡neas afectadas:** ~50-70
    *   **Patr├│n GS:** 4.1. Tables

*   **Cambio 6: Estandarizaci├│n de Botones**
    *   **Qu├®:** Reemplazar las clases y estilos actuales de los 3 botones (`Ver Detalle`, `Exportar`, etc.) por las clases del Golden Standard como `.btn`, `.btn-primary` y `.btn-secondary`. Agregar `aria-label` a los botones que solo usen ├¡conos.
    *   **Por qu├®:** Para asegurar que todos los botones de la aplicaci├│n sean visualmente consistentes y accesibles.
    *   **L├¡neas afectadas:** ~5-10
    *   **Patr├│n GS:** 6.1. Buttons

*   **Cambio 7: Estructura de la Secci├│n de Gr├íficos**
    *   **Qu├®:** Envolver el `<canvas>` y sus KPIs asociados dentro de un `section.chart-section`. Agregar un `.chart-header` y organizar los KPIs en un `.chart-kpis-grid` con `divs.chart-kpi-card`.
    *   **Por qu├®:** Para estandarizar la presentaci├│n de visualizaciones de datos, asegurando un layout y estilo consistentes.
    *   **L├¡neas afectadas:** ~40-60
    *   **Patr├│n GS:** 8.1. Charts

#### **2. Archivo: `assets/css/balance-semanal.css`**

El objetivo aqu├¡ es eliminar la mayor cantidad de CSS custom, ya que el Golden Standard deber├¡a proveer todas las clases necesarias.

*   **Cambio 1: Eliminar Estilos Redundantes**
    *   **Qu├®:** Analizar el archivo y eliminar todas las reglas de CSS cuyos selectores apunten a elementos que fueron refactorizados (ej. `table`, `select`, `button`). Se eliminar├ín tambi├®n estilos de layout como `margin`, `padding` o `display: flex` que ahora son manejados por clases de utilidad o componentes GS.
    *   **Por qu├®:** Para reducir la especificidad, evitar sobreescrituras y hacer que la p├ígina dependa casi en su totalidad de `components.css`, facilitando el mantenimiento.
    *   **L├¡neas afectadas:** Pr├ícticamente todo el archivo (se espera eliminar entre el 80% y 100% del contenido).
    *   **Patr├│n GS:** 1.1. Atomic CSS Philosophy

---

Proceder├® a implementar este plan.
