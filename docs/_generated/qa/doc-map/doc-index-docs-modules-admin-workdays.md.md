(node:22820) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:30356) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
Hook registry initialized with 0 hook entries
## docs/modules/admin/workdays.md
- **Estado:** DESACTUALIZADO
- **Problemas:**
  - La tabla `work_day_staff_planning` no fue encontrada en los archivos de migraci├│n.
  - La vista `vw_daily_sales` no fue encontrada en los archivos de migraci├│n.
  - Ninguna de las 5 funciones RPC (`admin_generate_workday_accruals`, `rpc_close_work_day`, `rpc_confirm_work_day`, `rpc_open_work_day`, `rpc_revert_work_day`) fue encontrada en los archivos de migraci├│n. La m├íquina de estados descrita depende enteramente de estas funciones.
- **Acciones:**
  - Investigar si los objetos de base de datos faltantes existen con nombres diferentes o si la l├│gica fue alterada.
  - Auditar `assets/js/modules/admin/admin-workdays.js` para identificar las llamadas a RPCs que realmente se est├ín utilizando.
  - Actualizar la documentaci├│n para reflejar la arquitectura de base de datos y los flujos de la m├íquina de estados correctos.
- **Score:** 40
