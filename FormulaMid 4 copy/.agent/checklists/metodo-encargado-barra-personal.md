# Checklist de Cierre: encargado-barra-personal

> Generado automáticamente basada en `frontend-developer` y `logic-engineer` skills.

## 1. Funcionalidad Específica (Detectada)
- [ ] **Tab Navigation**: Verificar cambio fluido entre "Convocatorias" y "Nómina".
- [ ] **Data Selection**: Selector de jornada carga solo estados `planning` y `open`.
- [ ] **Planning UI**: El resumen de dotación se actualiza al cambiar de jornada y al convocar.
- [ ] **Modales**:
    - [ ] `roleModal`: Se abre al convocar, muestra roles correctos, al seleccionar convoca.
    - [ ] `confirmModal`: Se abre al forzar asistencia, botón confirmar ejecuta la acción.
- [ ] **Staff Management**:
    - [ ] Búsqueda en tiempo real (debounced) en ambas pestañas.
    - [ ] Side Panel de "Nuevo Staff" abre, valida nombre y guarda en `profiles`.

## 2. Estándares Globales (Frontend)
- [ ] **Layout**: Estructura `app-shell` + `page-card-wrap` + `page-shell`.
- [ ] **States**: Overlay de loading visible al cargar jornada; empty state visible si no hay selección.
- [ ] **Components**: Uso de `staff-list`, `staff-row`, `status-pill`, `avatar-initial`.
- [ ] **Tokens**: Sin estilos inline (excepto los gestionados vía P1 remediation si aplica).

## 3. Estándares Globales (Lógica)
- [ ] **Async**: Patrón IIFE async con objeto `ui` consolidado.
- [ ] **Safety**: `window.Utils.assertSbOrShowBlockingError` presente.
- [ ] **Delegation**: Listeners de acciones en listas implementados con delegación de eventos.
- [ ] **Validación**: Campos de staff requeridos validados antes de insertar.

## 4. Protocolo de Cierre
1. Ejecutar verificación técnica (Checklist arriba).
2. Probar ciclo completo: Seleccionar jornada -> Convocar Staff -> Forzar Asistencia.
3. Actualizar ficha de módulo con `documentation-generator`.
