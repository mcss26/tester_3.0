# Checklist de Cierre: Admin Cierre

> **Módulo**: `admin-cierre`
> **Contexto**: Auditoría UI/UX (Remediación)

## 1. Funcionalidad Específica & Auditoría
### Correcciones P0 (Prioridad)
- [ ] **Limpieza de HTML**: Eliminar pseudo-Tailwind (`text-[10px]`, `w-24`) y usar `components.css`.
- [ ] **Estilos Inline**: Eliminar `style="..."` y usar utilidades.
- [x] **Feedback UX**: Reemplazar `alert()`/`confirm()` con Modales (`#confirmModal`) y `window.Toast`.
- [ ] **Tokens**: Reemplazar valores hardcodeados con variables (`var(--text-2)`).

### Flujo Crítico
- [ ] **Importación**: Botones (RETIROS, GBOL, PASSLIONE) activan inputs file y procesan.
- [ ] **Cálculos**: Diferencias en "Conciliación" se actualizan en realtime.
- [ ] **Guardado**: "Guardar Notas" persiste datos + Toast de éxito.
- [ ] **Cierre**: "CERRAR NOCHE" cambia estado a 'closed' y bloquea UI.

## 2. Estándares Globales (Frontend)
- [ ] **Arquitectura**: Solo importar `main.css`.
- [ ] **Componentes**: Usar structure `TableShell` y `FilterBar` si aplica.
- [ ] **Responsive**: No rompe en 375px; usar `table-scroll` horizontal.
- [ ] **Estados**: Botones críticos muestran loading (`.btn-loading`) durante async.

## 3. Estándares Globales (Lógica)
- [x] **Seguridad**: `Auth.guardOrRedirect` presente al inicio.
- [x] **Safety**: `assertSbOrShowBlockingError` validado.
- [x] **Errores**: Try/catch global con `window.Toast.error`.
- [x] **Helpers**: Usar `Utils.formatARS` y `Utils.numberOrNull`.

## 4. Protocolo de Cierre
1.  **Code Review**: Auto-revisión (limpiar logs, comentarios muertos).
2.  **Browser Walkthrough**: Ejecutar flujo (Importar -> Editar -> Cerrar) sin errores de consola.
3.  **Docs Update**: `docs/modules/admin/admin-cierre.md` actualizado. ✅
4.  **Commit**: `fix(admin-cierre): ui remediation and logic hardening`.
