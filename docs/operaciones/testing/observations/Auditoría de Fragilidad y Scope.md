# Auditoría de Fragilidad y Scope

> **Fecha**: 2026-02-20
> **Tester**: Luciano
> **Rol probado**: Arquitecto Inverso
> **Sprint**: 0

---

## Hallazgos

### OBS-1: Barrera de Especificidad CSS Legacy

- **Tipo**: UI/UX
- **Severidad**: 🔴 Crítico
- **Descripción**: 142 ocurrencias de `!important` y 89 selectores por `#id` en 17 archivos `admin-*.css` y 7800 líneas de `components.css`. Las nuevas clases del Design System (`.c-`, `.l-`) tienen especificidad `(0,1,0)` vs legacy `(1,1,2)`.
- **Esperado**: Las clases del Design System deben ganar visualmente sin conflictos de especificidad.
- **Afecta a**: Todos los módulos administrativos
- **Ticket**: pendiente

### OBS-2: Mutación de Tokens (Design Drift)

- **Tipo**: UI/UX
- **Severidad**: 🟡 Medio
- **Descripción**: `tokens.css` no es soberano. Los módulos administrativos redefinen variables críticas (`--primary-color`, `--color-danger`) localmente en `:root`, causando falsos positivos en QA.
- **Esperado**: Todas las declaraciones `:root` deben estar centralizadas en `tokens.css` sin redefiniciones locales.
- **Afecta a**: Dashboard, Stock (cross-módulo)
- **Ticket**: pendiente

### OBS-3: Acoplamiento JS-CSS (Listeners a clases de presentación)

- **Tipo**: Lógica
- **Severidad**: 🔴 Crítico
- **Descripción**: 312 selectores en 37 archivos JS vinculados a clases de presentación (`.btn-red`, `.modal-close`). Uso de `.children[x]` en `utils.js` hace que cambios de layout rompan el acceso a datos del DOM.
- **Esperado**: Los listeners deben usar hooks funcionales (`js-` prefixed) y `data-attributes`, no clases de presentación.
- **Afecta a**: Todos los flujos de navegación y botones funcionales
- **Ticket**: pendiente

### OBS-4: Regresión Funcional por poda CSS

- **Tipo**: Lógica
- **Severidad**: 🔴 Crítico
- **Descripción**: Si se poda `components.css` basándose solo en lo visual, se desactivarán botones funcionales y flujos de navegación por la dependencia JS-CSS.
- **Esperado**: La poda debe estar precedida por inyección de hooks `js-` para desacoplar funcionalidad de presentación.
- **Afecta a**: Todos los módulos con interacción JS
- **Ticket**: pendiente

### OBS-5: Inconsistencia de Datos Fiscales

- **Tipo**: Data
- **Severidad**: 🟡 Medio
- **Descripción**: La "Verdad" fiscal se traslada de vistas SQL al Orquestador JS. Riesgo de inconsistencia si SQL y JS divergen en cálculos de IVA 21% y comisiones de canales.
- **Esperado**: El Orquestador JS debe ignorar SQL y recalcular según `FISCAL_PARAMS`, sellando datos en `finance_weekly_closings`.
- **Afecta a**: Cierre financiero (Balance semanal)
- **Ticket**: pendiente

---

## Resumen

| Métrica           | Valor |
| :---------------- | :---- |
| Total hallazgos   | 5     |
| 🔴 Críticos       | 3     |
| 🟡 Medios         | 2     |
| 🟢 Bajos          | 0     |
| Tickets generados | 0     |
