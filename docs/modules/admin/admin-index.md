# Admin Index (Portal)

**Ruta**: `pages/admin/admin-index.html`
**Roles**: `admin`, `contable`

## Objetivo Operativo

Punto de entrada principal para el personal administrativo y contable. Permite el acceso rápido a la gestión operativa diaria (Stock, Jornadas, Solicitudes, Cajas, Reportes) y a las tablas maestras de configuración (SKUs, Proveedores, Facturación, Pagos).

## Flujo Principal

1.  **Estado del Sistema**: Muestra la fecha de la jornada operativa actual (en planificación o abierta).
2.  **Navegación Operativa**: Acceso a módulos de gestión de eventos y recursos.
3.  **Navegación Táctica (Masters)**: Acceso a la configuración estructural del ERP.

## Modelo de Datos

**Lectura**:

- `profiles`: Nombre del administrador.
- `work_days`: Estado y fecha de la jornada más próxima (`open`, `planning`, `planned`).

## Dependencias y Arquitectura
- **HTML:** `pages/admin/admin-index.html` (Estructura Base)
- **JS:** `assets/js/pages/admin/admin-index.js` (Lógica de Negocio y Auth)
- **CSS:** `assets/css/pages/admin-index.css` (Estilos Específicos)
- **Dependencias Clave:**
    - `assets/js/modules/admin/admin-navigation.js`: Control de navegación.
    - `assets/js/modules/work-day-helper.js`: Utilidad para estado de jornada.
    - `Auth` (Roles), `Utils` (DOM), `Supabase` (Realtime).

## Lógica Clave: Visibilidad por Roles
El módulo utiliza un sistema híbrido (CSS + JS) para gestionar qué módulos ve cada usuario:

1.  **CSS Default (Restrictivo):**
    Por defecto, CSS oculta todo lo que NO sea explícitamente administrativo o público seguro.
    ```css
    .module-card:not([data-visible-roles*="admin"]) { display: none; }
    ```

2.  **JS Override (Permisivo):**
    Al cargar, JS verifica el rol del usuario y **forza** la visibilidad correcta, sobreescribiendo el CSS.
    ```javascript
    if (allowedRoles.includes(userRole)) { card.style.display = 'block'; }
    ```

### Fixes de Estabilidad
- **FOUC (Flash of Unstyled Content):** Se invirtió la lógica para que CSS oculte por defecto y JS muestre.
- **Layout Shifts:** Se añadieron `min-height` a contenedores críticos (`120px` header, `60vh` grid) y `html { overflow-y: scroll; }` para evitar saltos por scrollbar.

## Mejoras Futuras
- Implementar "Skeleton Loading" para los estados del sistema (KPIs).
- Unificar la navegación con un Shell global (SPA-like) para no recargar al ir a sub-páginas.
