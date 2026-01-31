# Checklist de Cierre: encargado-barra-noche

> Generado automáticamente basada en `frontend-developer` y `logic-engineer` skills.

## 1. Funcionalidad Específica (Detectada)
- [ ] **State Machine**: Verificar transiciones de estado en `setPageState`:
    - [ ] `noDay`: Si no hay jornada abierta.
    - [ ] `open`: Si hay jornada pero el usuario no tiene sesión abierta.
    - [ ] `active`: Si hay sesión abierta (muestra dashboard).
    - [ ] `sessionClosed`: Si la sesión ya fue cerrada.
- [ ] **Apertura**:
    - [ ] El stock se carga desde `master_sku`.
    - [ ] Se crea registro en `bar_sessions` y múltiples en `bar_stock_snapshots` (type: opening).
- [ ] **Cierre**:
    - [ ] Vista de cierre carga stock actual.
    - [ ] Se actualiza `bar_sessions` (closed_at, status='closed') e inserta snapshots (type: closing).
- [ ] **Confirmación**: Modal de confirmación intercepta Apertura y Cierre.

## 2. Estándares Globales (Frontend)
- [ ] **Visual**: Layout Aurora Red premium, uso de `system-status-pill`.
- [ ] **Components**: Tabla de stock con inputs numéricos alineados a la derecha.
- [ ] **Tokens**: Sin estilos inline ni HEX hardcodeados.

## 3. Estándares Globales (Lógica)
- [ ] **Async Trace**: Patrón IIFE async con manejo robusto de `currentWorkDay` y `currentSession`.
- [ ] **Integridad**: Los snapshots se guardan ANTES de actualizar el estado de la sesión para evitar estados inconsistentes (Atomicidad simulada).
- [ ] **Feedback**: `window.Toast` confirma éxito en apertura y cierre.

## 4. Protocolo de Cierre
1. Ejecutar verificación técnica (Checklist arriba).
2. Probar flujo crítico: Apertura (con stock) -> Panel Activo -> Cierre (con stock).
3. Verificar persistencia en base de datos (Supabase Dashboard).
4. Actualizar ficha de módulo con `documentation-generator`.
