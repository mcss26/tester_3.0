# Task - Operativo Workday Improvements (2026-01-30)

## Scope
- Topbar con breadcrumbs (pipes) sin boton "VOLVER".
- Fila desplegable PASSLINE con 5 links exactos.
- Panel izquierdo: viewer de solicitudes operativas con packs calculados.
- Panel derecho: comparativa convocado vs confirmado.
- Actualizar documentacion del modulo y estado del proyecto.

## Plan
- [x] Revisar HTML/JS actual y validar contra ui-standards/ui-components (sin CSS nuevo).
- [x] Ajustar HTML: breadcrumbs, passline, headers tabla, scripts requeridos.
- [x] Ajustar JS: render breadcrumbs, data source solicitudes, calculo packs, navegacion a solicitudes.
- [x] Verificar comportamientos (passline colapsado, filas link, redirect correcto, resumen staff).
- [x] Documentar cambios en docs/modules/operativo/operativo-workday.md y docs/estado-presente.md.
