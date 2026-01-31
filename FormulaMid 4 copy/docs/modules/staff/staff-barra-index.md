# Staff Barra - Landing

**Ruta**: `pages/staff/staff-barra-index.html`
**Roles**: `staff_barra`, `admin`

## Objetivo Operativo

Punto de entrada para el personal de Barra. Actualmente funciona como un placeholder indicando que el módulo está "Próximamente".

## Flujo Principal

1.  **Login**: El usuario es redirigido aquí si su rol es `staff_barra`.
2.  **Visualización**: Ve un mensaje de bienvenida y estado "Próximamente".
3.  **Logout**: Puede cerrar sesión desde el pie de página.

## Modelo de Datos

_No interactúa con base de datos actualmente._

## Dependencias Técnicas

- `assets/js/core/auth.js`: Verificación de sesión y roles.
- `assets/js/modules/index-navigation.js`: Lógica de navegación genérica.

## Notas

- El módulo está en desarrollo. E