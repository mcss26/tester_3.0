# Checklist de Cierre: encargado-barra-index

> Generado automáticamente basada en `frontend-developer` y `logic-engineer` skills.

## 1. Funcionalidad Específica (Detectada)
- [ ] **Auth**: Verificar acceso solo para rol `encargado_barra`.
- [ ] **Data**: Verificar carga de perfil de usuario (`profiles.full_name`).
- [ ] **Nav**: Verificar habilitación/deshabilitación de botones según estado:
    - [ ] Botón Recepción habilitado si hay órdenes pendientes en `vw_supplier_orders_encargado`.
    - [ ] Botones Personal/Noche habilitados solo si la jornada está abierta (`WorkDayHelper`).
- [ ] **Status**: Verificar que el pill de estado muestre el color correcto (Verde: Abierta / Rojo: Cerrada).

## 2. Estándares Globales (Frontend)
- [ ] **Tokens**: Sin colores HEX ni tamaños en px hardcodeados.
- [ ] **Responsive**: Layout `welcome-screen` centrado y estable en mobile.
- [ ] **Nav**: Uso de `data-go` e `index-navigation.js`.
- [ ] **Scripts**: Importación de `utils.js` y `toast.js` presente.

## 3. Estándares Globales (Lógica)
- [ ] **Async**: Patrón IIFE async implementado.
- [ ] **Safety**: `window.Utils.assertSbOrShowBlockingError` presente.
- [ ] **Handling**: `window.Toast` para errores en carga de perfil o reglas de botones.

## 4. Protocolo de Cierre
1. Ejecutar verificación técnica (Checklist arriba).
2. Probar manualmente flujo de navegación.
3. Actualizar ficha de módulo con `documentation-generator`.
