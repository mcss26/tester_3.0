node.exe : (node:35340) [DEP0040] DeprecationWarning: The `punycode` module is 
deprecated. Please use a userland alternative instead.
En C:\Users\siste\AppData\Roaming\npm\gemini.ps1: 22 Carácter: 14
+ ...    $input | & "node$exe"  "$basedir/node_modules/@google/gemini-cli/d ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:35340) [D...native instead.:Stri 
   ng) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:16056) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. 
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
[ERROR] [IDEClient] Failed to connect to IDE companion extension in Antigravity. 
Please ensure the extension is running. To install the extension, run /ide install.
Hook registry initialized with 0 hook entries
Aqu├¡ est├í el plan de implementaci├│n para remediar `admin-semanal.html` y alinearlo con el Golden Standard.

### Resumen del Plan
El objetivo es elevar el score de compliance de 61 a >85%. La estrategia se centra en tres acciones principales:
1.  **Refactorizaci├│n de Header:** Incorporar el subt├¡tulo faltante.
2.  **Reemplazo de Componentes Nativos:** Sustituir el `<select>` nativo por el componente `.custom-dropdown` del Golden Standard.
3.  **Aplicaci├│n de Clases de Utilitarios:** Estandarizar botones, inputs y otros elementos con las clases definidas en `components.css`.

Se intervendr├ín dos archivos: `pages/admin/admin-semanal.html` para la estructura y `assets/css/admin-semanal.css` para refactorizar estilos espec├¡ficos del m├│dulo a clases est├índar.

---

### Plan de Implementaci├│n Detallado

#### **Archivo 1: `pages/admin/admin-semanal.html`**

*   **Cambio 1: Enriquecer el Header.**
    *   **Qu├® cambia:** Se agregar├í un `<span>` con la clase `dashboard-title-soft` junto al `<h2>` principal para proveer contexto adicional, siguiendo el patr├│n del Golden Standard.
    *   **Por qu├®:** El reporte indica `Missing: dashboard-title-soft`. Esta adici├│n completa el componente Header.
    *   **L├¡neas afectadas:** ~9-12.
    *   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md`, Secci├│n 3 (Header).

*   **Cambio 2: Reemplazar `<select>` nativo.**
    *   **Qu├® cambia:** El `<select>` para el rango de fechas ser├í completamente reemplazado por la estructura de `divs` y `button` que conforman el componente `.custom-dropdown`. Se agregar├ín atributos `aria-haspopup="true"` y `aria-expanded="false"` para accesibilidad.
    *   **Por qu├®:** Es un anti-patr├│n (Hint HIGH). El GS exige componentes custom para una experiencia de usuario y look-and-feel consistentes.
    *   **L├¡neas afectadas:** ~20-35 (reemplazo de 1 l├¡nea por una estructura m├ís compleja).
    *   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md`, Secci├│n 5 (CustomDropdowns).

*   **Cambio 3: Estandarizar botones.**
    *   **Qu├® cambia:** Se aplicar├ín clases est├índar a los 3 botones existentes. Por ejemplo: `class="btn btn-primary"` para la acci├│n principal y `class="btn btn-secondary"` o `btn-ghost` para acciones secundarias. Se a├▒adir├í `aria-label` a cada bot├│n para describir su funci├│n.
    *   **Por qu├®:** El reporte indica una falta de cobertura del 12% en botones. La estandarizaci├│n es clave para la consistencia visual y la accesibilidad.
    *   **L├¡neas afectadas:** ~35-50.
    *   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md`, Secci├│n 4 (Buttons).

*   **Cambio 4: Estructurar campos de fecha.**
    *   **Qu├® cambia:** Los dos campos de fecha (`Desde`, `Hasta`) se envolver├ín en un `div` con la clase `date-range-inline`. Cada `input` ser├í acompa├▒ado por un `label` con la clase `form-label` y el `input` mismo recibir├í la clase `input input-compact`.
    *   **Por qu├®:** El reporte indica una falta total de compliance en Forms. Esto asegura una estructura sem├íntica correcta, mejora la accesibilidad y aplica el estilo visual del GS.
    *   **L├¡neas afectadas:** ~40-55.
    *   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md`, Secci├│n 6 (Forms).

#### **Archivo 2: `assets/css/admin-semanal.css`**

*   **Cambio 1: Refactorizar y eliminar estilos.**
    *   **Qu├® cambia:** Se analizar├í el CSS existente. Las reglas que definen propiedades ya cubiertas por clases de `components.css` (e.g., `margin`, `padding`, `font-size`, `display`) ser├ín eliminadas. El estilo se aplicar├í directamente en el HTML a trav├®s de clases de utilidad (`text-xs`, `text-muted`, `u-hidden`, etc.).
    *   **Por qu├®:** Reduce la especificidad, elimina c├│digo redundante y convierte el HTML en la ├║nica fuente de verdad para el layout y la apariencia, facilitando el mantenimiento.
    *   **L├¡neas afectadas:** Potencialmente todo el archivo. El objetivo es reducirlo al m├¡nimo indispensable o eliminarlo si todas las reglas son reemplazables.
    *   **Patr├│n GS de referencia:** `docs/ui-golden-standard.md`, Secci├│n 7 (Utilities).
