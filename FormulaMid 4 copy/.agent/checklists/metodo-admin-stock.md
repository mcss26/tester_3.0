# Checklist de Cierre: admin-stock

> Generado automáticamente basada en `frontend-developer` y `logic-engineer` skills.

## 1. Funcionalidad Específica (Detectada)
- [ ] **Auth**: Verificar acceso solo para roles `admin`, `contable`, `logistica`.
- [ ] **UI**: Verificar `TableShell`, `FilterBar` (filtros de categoría) y `SlidePanel` (detalle de SKU).
- [ ] **Lógica**: Verificar carga de datos (`loadData`) y switch de estado (`toggleActive`).
- [ ] **Datos**: Validar que `vw_stock_global` carga correctamente y el cálculo de valorizado es coherente.

## 2. Estándares Globales (Frontend)
- [ ] **Tokens**: Eliminar clases Alien CSS (`mt-2`, `flex`, `gap-2`, `opacity-60`, `scale-75`) y usar utilidades de `components.css`.
- [ ] **Estados**: Loading y Empty states implementados en overlay (no tabla).
- [ ] **Responsive**: Layout `table-scroll` funciona en móviles.
- [ ] **Feedback**: Botón refrescar muestra feedback visual.

## 3. Estándares Globales (Lógica)
- [ ] **Async**: Patrón IIFE implementado correctamente.
- [ ] **Safety**: `assertSbOrShowBlockingError` presente al inicio.
- [ ] **UI Refs**: Todos los elementos del DOM agrupados en objeto `ui`.

## 4. Protocolo de Cierre
1.  Ejecutar refactorización para eliminar Alien CSS.
2.  Verificar contra este checklist.
3.  Actualizar ficha de módulo.
