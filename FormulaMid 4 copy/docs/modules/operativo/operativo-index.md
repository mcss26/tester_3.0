# Operativo Index (Portal)

**Ruta**: `pages/operativo/operativo-index.html`
**Roles**: `operativo`, `staff_barra`, `staff_operativo`

## Objetivo Operativo

Servir como pantalla de bienvenida y portal de acceso centralizado para el personal operativo, permitiendo elegir entre las ramas de gestión de recursos (ERP) o gestión de comunidad/miembros (CMS).

## Flujo Principal

1.  **Identificación**: Muestra el nombre del agente autenticado.
2.  **Estado del Sistema**: Indica si hay una jornada operativa (`work_day`) abierta.
3.  **Selector de Modo**: Enlaces directos a `ERP` y `CMS`.

## Modelo de Datos

**Lectura**:

- `profiles`: Para obtener el nombre del usuario.
- `work_days`: Para validar el estado de la operación (🟢 Abierto / 🔴 Cerrado).

## Dependencias Técnicas

- `assets/js/modules/index-navigation.js`: Lógica de navegación.
- `assets/js/modules/work-day-helper.js`: Auxiliar para detectar la jornada activa.
