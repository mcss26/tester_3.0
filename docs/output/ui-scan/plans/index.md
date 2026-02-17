node.exe : (node:1968) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:1968) [DE...native instead.:S 
   tring) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:33752) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide 
install.
Hook registry initialized with 0 hook entries
Tengo que crear un plan para actualizar `pages/prototypes/lab-workdays-night/index.html` para que coincida con el "Golden Standard".

Este es mi plan:

1.  **Comprender el Golden Standard:** Comenzar├® leyendo `docs/ui-golden-standard.md` para comprender la estructura y las clases CSS requeridas.
2.  **Analizar la referencia:** Examinar├® `pages/admin/admin-central-stock.html` para ver una implementaci├│n concreta del Golden Standard. Esto me dar├í una idea clara de la estructura objetivo.
3.  **Analizar el archivo de destino:** Leer├® el contenido de `pages/prototypes/lab-workdays-night/index.html` para comprender su estructura y contenido actuales.
4.  **Crear el Plan de Remediaci├│n:** Basado en el Golden Standard, la implementaci├│n de referencia y el estado actual del archivo de destino, crear├® un plan detallado con el formato que me ha dado el usuario.

Ahora ejecutar├® los primeros pasos de mi plan. Leer├® los archivos necesarios.
He le├¡do el archivo `ui-golden-standard.md`. Proporciona una gu├¡a completa de la estructura HTML y las clases CSS requeridas.

Ahora, leer├® el archivo de implementaci├│n de referencia `pages/admin/admin-central-stock.html` y el archivo que necesita ser remediado, `pages/prototypes/lab-workdays-night/index.html`. Esto me permitir├í comparar los dos y crear un plan preciso.
He le├¡do `docs/ui-golden-standard.md` y `pages/admin/admin-central-stock.html`. Ahora leer├® el archivo a remediar, `pages/prototypes/lab-workdays-night/index.html`.
Attempt 1 failed: You have exhausted your capacity on this model. Your quota 
will reset after 0s.. Retrying after 310.13374100000004ms...
He le├¡do todos los archivos necesarios:

1. `docs/ui-golden-standard.md`: El manual de reglas.
2. `pages/admin/admin-central-stock.html`: El ejemplo de una p├ígina "buena".
3. `pages/prototypes/lab-workdays-night/index.html`: El archivo a corregir.
4. Tambi├®n veo que `pages/prototypes/lab-workdays-night/index.html` usa un archivo `style.css`. Necesitar├® leerlo tambi├®n para entender los estilos existentes que podr├¡an necesitar refactorizaci├│n.

Ahora leer├® el archivo `style.css`.
Excelente. He analizado todos los documentos y tengo un panorama claro para la remediaci├│n.

Aqu├¡ est├í el plan de implementaci├│n detallado, siguiendo el formato solicitado.

---

### **Plan de Remediaci├│n para `pages/prototypes/lab-workdays-night/index.html`**

El objetivo es alinear el prototipo `lab-workdays-night` con el **Golden Standard (GS)**, migrando su estructura HTML y refactorizando su CSS para maximizar la reutilizaci├│n de componentes globales y eliminar estilos locales redundantes.

---

#### **Archivo 1: `pages/prototypes/lab-workdays-night/index.html`**

-   **Qu├® cambia y por qu├®:** Se reemplazar├í la estructura de layout principal (`.lab-topbar`, `.lab-shell`) por la estructura est├índar del GS (`.topbar`, `.page-shell`, `.page-card-wrap`, `.page-card`). Se reestructurar├ín los componentes internos como el header y las tablas para usar las clases del GS, mejorando la consistencia y eliminando la necesidad de CSS custom. Se cambiar├í el `<h1>` por un `<h2>` dentro del `dashboard-header` y se a├▒adir├ín los `breadcrumbs` correctos.
-   **L├¡neas aproximadas afectadas:** 1-250 (Pr├ícticamente todo el archivo ser├í reestructurado).
-   **Patrones GS de referencia:**
    -   `Admin Layout Foundation`: Estructura principal con `topbar` y `page-shell`.
    -   `1. Dashboard Header`: Para el t├¡tulo de la p├ígina.
    -   `2. Summary Metrics Cards`: Para la franja de KPIs.
    -   `6. Data Table with Sorting`: Para las tablas de "Stock Audit" y "Rendici├│n de Caja".
    -   `Technical Standards (Implementation)`: Anatom├¡a HTML est├índar de una p├ígina de admin.

---

#### **Archivo 2: `assets/css/admin-workdays-night.css` (Archivo Nuevo)**

-   **Qu├® cambia y por qu├®:** Se crear├í este nuevo archivo para alojar los estilos que sean *verdaderamente* espec├¡ficos de esta p├ígina, despu├®s de haber adoptado los componentes del Golden Standard. Se extraer├ín y adaptar├ín estilos de `style.css` que no tengan un equivalente directo en `components.css`. Por ejemplo, los estilos para `.nc-split` y los paneles de "Stock Audit" y "Rendici├│n de Caja" se refactorizar├ín para que funcionen dentro del nuevo layout `page-card`. El objetivo es que este archivo sea lo m├ís peque├▒o posible.
-   **L├¡neas aproximadas afectadas:** ~100-150 l├¡neas (Estimaci├│n inicial, depender├í de cu├ínto se puede heredar).
-   **Patrones GS de referencia:**
    -   `CSS Architecture`: Define c├│mo deben organizarse los archivos CSS espec├¡ficos de cada p├ígina.

---

#### **Archivo 3: `pages/prototypes/lab-workdays-night/style.css`**

-   **Qu├® cambia y por qu├®:** Este archivo ser├í **eliminado** despu├®s de que todos sus estilos relevantes se hayan migrado a `admin-workdays-night.css` o hayan sido reemplazados por clases del Golden Standard de `components.css`. Esto es un paso crucial para consolidar la base de c├│digo CSS y adherirse a la arquitectura definida.
-   **L├¡neas aproximadas afectadas:** Todas (el archivo ser├í eliminado).
-   **Patrones GS de referencia:**
    -   `CSS Architecture > Consolidation Rules`: La l├│gica detr├ís de eliminar CSS espec├¡fico de p├ígina en favor de componentes globales.

---

### **Pasos Detallados de la Implementaci├│n:**

1.  **Backup y Preparaci├│n:**
    *   Renombrar `pages/prototypes/lab-workdays-night/style.css` a `assets/css/admin-workdays-night.css`.
    *   Actualizar el `<link>` en `index.html` para que apunte al nuevo archivo CSS.

2.  **Remediaci├│n de `index.html` (Layout y Estructura Principal):**
    *   Reemplazar `<header class="lab-topbar">` por la estructura completa del `.topbar` del GS, incluyendo `.topbar-start` (con breadcrumbs), `.topbar-center` (con b├║squeda) y `.topbar-end` (con men├║ de usuario).
    *   Reemplazar `<main class="lab-shell">` por `<main class="page-shell">` y envolver todo el contenido principal dentro de la secuencia `.page-card-wrap > .page-card`.
    *   Reemplazar el header (`.nc-header`) con la estructura `.dashboard-header` del GS. El `<h1>` se convertir├í en `h2 class="dashboard-title"`, y el subt├¡tulo usar├í `dashboard-subtitle-soft`.
    *   A├▒adir `aria-label` a todos los botones e inputs que no los tengan.

3.  **Remediaci├│n de `index.html` (Componentes Internos):**
    *   Adaptar la franja de KPIs (`.nc-kpi-strip`) para que use el patr├│n `.summary-metrics-container > .summary-metrics-grid` del GS.
    *   Reestructurar las tablas (`.nc-table`) para que sigan el patr├│n `.table-viewport > .table-shell > .table-scroll > table.table.table-sticky`. Esto incluye usar `<thead>`, `<th>` con las clases `table-cell is-header`, y `<tbody>` con `table-cell`.
    *   Reemplazar los botones custom (`.nc-btn`) por las clases est├índar `.btn-primary`, `.btn-secondary`, `.btn-ghost`.
    *   Reemplazar los filtros de chip (`.nc-chip`) por el patr├│n `.pill-group > .pill`.

4.  **Refactorizaci├│n de `admin-workdays-night.css`:**
    *   Eliminar todas las reglas que ahora son manejadas por `components.css` (ej. estilos para `.topbar`, `.page-shell`, botones, tablas base).
    *   Adaptar los estilos restantes para que funcionen con la nueva estructura HTML. Por ejemplo, en lugar de `.nc-panel`, los estilos se aplicar├ín a selectores m├ís espec├¡ficos como `.page-card .workday-panel`.
    *   Asegurar que no queden `!important` o selectores excesivamente complejos.

5.  **Limpieza Final:**
    *   Eliminar el archivo original `pages/prototypes/lab-workdays-night/style.css`.
    *   Verificar que no queden estilos inline en `index.html`.
    *   Asegurar que todos los elementos interactivos tengan `aria-label` y sean navegables por teclado.
