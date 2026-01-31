# Encargado Barra - Index

> **Ruta**: `pages/encargados/encargado-barra-index.html`
> **Roles**: Encargado Barra
> **Última Actualización**: 2026-01-29

## Objetivo Operativo

Servir como panel principal de navegación para el encargado de barra, mostrando el estado de la jornada y habilitando el acceso a los submódulos de recepción, personal y control de stock nocturno según las reglas de negocio vigentes.

## Flujo Principal (Workflows)

1. **Acceso y Validación**: El usuario ingresa y el sistema valida su rol (`encargado_barra`).
2. **Carga de Perfil**: Se muestra el nombre completo del usuario desde la tabla `profiles`.
3. **Verificación de Jornada**: Se consulta el estado de la jornada laboral mediante `WorkDayHelper`.
4. **Reglas de Navegación**:
    - **Recepción**: Habilitado si existen pedidos a proveedores aprobados y con fecha estimada en la vista `vw_supplier_orders_encargado`.
    - **Personal**: Habilitado si hay una jornada abierta.
    - **Noche**: Habilitado si hay una jornada abierta.
5. **Navegación**: El usuario selecciona un submódulo y es redirigido mediante `index-navigation.js`.

## Modelo de Datos

| Operación | Tablas / Vistas |
|:----------|:---|
| **Lectura** | `profiles`, `vw_supplier_orders_encargado`, `work_days` |
| **Escritura** | (Ninguna en este módulo) |

## Dependencias Técnicas

- **Scripts Core**: `core/config.js`, `core/supabase-client.js`, `core/auth.js`, `core/utils.js`, `core/toast.js`
- **Módulos**: `work-day-helper.js`, `index-navigation.js`
- **Lógica Específica**: `encargados/encargado-barra-index.js` (IIFE Async pattern)
