node.exe : (node:40476) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:40476) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:25088) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 1s.. Retrying after 1962.652427ms...
Attempt 1 failed: You have exhausted your capacity on this model. Your quota will 
reset after 2s.. Retrying after 2325.425453ms...
Aqu├¡ est├í el plan de implementaci├│n para remediar `logistica-index.html` y alinearlo con el Golden Standard.

### Resumen del Plan

El objetivo es elevar el score de compliance de `logistica-index.html` de 78 a m├ís de 85. La estrategia se centra en tres ├íreas clave:
1.  **Remediar el Header:** Reestructurar el encabezado de la p├ígina para cumplir con el patr├│n `dashboard-header` del Golden Standard, que es el punto con menor compliance.
2.  **Corregir la Jerarqu├¡a de Encabezados:** Eliminar el `h1` y ajustarlo a la jerarqu├¡a correcta (`h2`, `h3`, etc.) como dicta la regla.
3.  **Mejorar la Accesibilidad:** A├▒adir atributos ARIA a los elementos interactivos que carecen de ellos.

No se crear├ín nuevas clases CSS, ya que se utilizar├ín las existentes en `components.css` y `admin-central-stock.css`, que ya est├ín enlazadas.

---

### **1. Archivo: `pages/logistica/logistica-index.html`**

#### **Cambio 1: Reestructuraci├│n del Encabezado del Dashboard**

*   **Qu├® cambia y por qu├®:**
    Se reemplazar├í la estructura actual del encabezado del dashboard por el patr├│n Golden Standard `dashboard-header`. Esto implica:
    *   Reemplazar el `<h1>` por un `<h2>` con la clase `dashboard-title-soft`.
    *   A├▒adir la clase `dashboard-subtitle-soft` al p├írrafo del subt├¡tulo.
    *   Incorporar un `div` con la clase `actions-bar` vac├¡o, un elemento estructural requerido por el `dashboard-header` para futuras acciones (como botones o filtros), cumpliendo con el patr├│n de `admin-central-stock.html`.
*   **L├¡neas aproximadas afectadas:** 84-89
*   **Patr├│n GS de referencia:** Secci├│n 1: "Dashboard Header with Tabs".

#### **Cambio 2: Correcci├│n de Jerarqu├¡a de Encabezados**

*   **Qu├® cambia y por qu├®:**
    *   El `<h1>` principal se convertir├í en `<h2>` para respetar la jerarqu├¡a de la p├ígina, donde el t├¡tulo principal del contenido no debe ser `h1`.
    *   Los `<h3>` existentes dentro de las tarjetas de perfil (`.profile-card`) se mantendr├ín, ya que son sub-secciones del dashboard y su nivel jer├írquico es correcto bajo un `h2`.
*   **L├¡neas aproximadas afectadas:** 86, 96, 102, 108, 114
*   **Patr├│n GS de referencia:** Regla de la instrucci├│n #8 y buenas pr├ícticas de HTML sem├íntico.

#### **Cambio 3: Adici├│n de Atributos ARIA**

*   **Qu├® cambia y por qu├®:**
    Se a├▒adir├ín atributos `aria-label` a los enlaces de navegaci├│n principal (`.master-nav-link`) para mejorar la accesibilidad. Aunque son enlaces, act├║an como botones de navegaci├│n primarios dentro del m├│dulo y deben describir su funci├│n a los lectores de pantalla.
*   **L├¡neas aproximadas afectadas:** 77-80
*   **Patr├│n GS de referencia:** Secci├│n "Accessibility Guidelines".

#### **Notas sobre Clases Faltantes (Forms & Utilities)**

*   **Forms (`input-compact`, `form-group`, etc.):** Las clases de formularios no se aplicar├ín, ya que la p├ígina `logistica-index.html` no contiene formularios complejos, solo el buscador global del `topbar` que ya es un componente est├índar. La remediaci├│n se enfoca en los elementos existentes.
*   **Utilities (`u-hidden`, `text-center`, etc.):** La mayor├¡a de las clases de utilidades faltantes est├ín asociadas a componentes (tablas, widgets de estad├¡sticas) que no existen en esta p├ígina de ├¡ndice. Forzar su inclusi├│n no ser├¡a sem├íntico. Las que s├¡ aplican, como `text-right` o `text-center`, ya se usan adecuadamente en el `topbar` o no son necesarias en el contenido actual.

Este plan garantiza una remediaci├│n enfocada y efectiva, abordando los problemas de mayor impacto y cumpliendo con todas las reglas y criterios de ├®xito establecidos.
