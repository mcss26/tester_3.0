# Estándares UI/UX

> **Última Actualización**: 2026-01-29
> **Estado Plan UI/UX**: Fase 3 en progreso

---

## Principios de Diseño

1. **Consistencia visual**: Mismos patrones de layout, tablas, acciones y estados
2. **Densidad controlada**: Información clara sin saturar
3. **Acción primaria única**: Un CTA principal por vista
4. **Feedback inmediato**: loading, empty, error siempre visibles
5. **Accesibilidad básica**: Contraste, focus visible, targets clickeables

> [!IMPORTANT]
> **Golden Standard Visual**: [`admin-master-proveedores`](file:///Users/lucianopieve/Documents/FormulaMid%204/pages/admin/admin-master-proveedores.html)
> Todos los módulos tipo Master/CRUD deben replicar esta estructura visual exacta.

---

## Sistema Base (Estándar ERP)

### Layout

```
page-card-wrap > page-card > staff-dashboard
```

### Regla de Overlays (loading/empty)

- Cuando `page-card-loading` o `page-card-empty` están visibles, el contenido principal debe ocultarse para evitar superposición visual.
- Patrón recomendado: envolver contenido en `#module-content` y togglear `.hidden` cuando `loading || empty`.

### Tabla

```
table-viewport > table-scroll > table (table-sticky)
```

### Componentes Core

| Componente   | Propósito                               |
| :----------- | :-------------------------------------- |
| `TableShell` | Wrapper y estilos de tabla unificados   |
| `FilterBar`  | Chips + search + select                 |
| `ActionBar`  | CTA principal + acciones secundarias    |
| `SlidePanel` | Header, body con secciones, footer fijo |
| Estados      | loading, empty, error                   |

### Guía rápida para tablas amplias (ej: Admin Solicitudes / Master Proveedores)

- Usa el stack `table-viewport > table-shell > table-scroll > table` con `table-viewport-limited` para que la cabecera se mantenga sticky sin perder el scroll interno.
- Para cards "hero" grandes, pon `max-width` cercano a `1400px`, fondo oscuro (`rgba(6,6,10,0.7)`) y `table-layout: fixed` con columnas proporcionales.
- Los `<th>` deben tener `background: rgba(0,0,0,0.6)` y bordes suaves para resaltar el header.
- En filas inactivas aplica `.is-inactive` y baja la opacidad en lugar de mostrar un badge extra; así el color del row comunica el estado.
- Si un dato se edita en otro módulo (por ejemplo, Rubro en Categorías), marca el campo con un span `.note` dentro del panel y habilita solo selección desde allí.

---

## Progreso por Módulo

### Admin Master (5 módulos)

- [x] Proveedores
- [x] Categorías
- [ ] SKU (pendiente overlays estándar)
- [x] POS
- [x] Tarifario

### Operativo Master

- [ ] Proveedores
- [ ] SKU

### Admin Soporte

- [ ] Stock
- [ ] Solicitudes
- [ ] Stock Ajustes
- [ ] Pagos

---

## Hallazgos de Auditorías

### P0 (Bloqueantes)

| Módulo      | Issue                                 | Estado    |
| :---------- | :------------------------------------ | :-------- |
| CMS Members | Clases CSS fantasma (`w-200`, `w-70`) | Pendiente |

### P1 (Calidad)

| Módulo           | Issue                                   | Estado    |
| :--------------- | :-------------------------------------- | :-------- |
| Admin Master SKU | Falta overlays estándar (loading/empty) | Pendiente |
| CMS Members      | Uso de `confirm()` nativo               | Pendiente |
| CMS Members      | Inconsistencia en estado de carga       | Pendiente |

### P2 (Nitpicks)

- Admin Master SKU: JS define HTML como strings (deuda técnica)
- CMS Members: `btn-xs` no definido, hardcoded border styles

---

## Patrones de Arquitectura por Rol

### Encargados

- **Patrón**: Master-Detail + Real-time Status Pills
- **Objetivo**: Visión "ojos en local, manos en app"
- **Módulos**: barra-personal, caja-noche, recepcion

### Operativo ERP

- **Patrón**: Arquitectura basada en vistas (`vw_stock_global`)
- **Objetivo**: Desacoplar UI de cálculos de inventario
- **Módulos**: stock, solicitudes, análisis

### Staff

- **Patrón**: Wizard Step-by-Step
- **Objetivo**: Reducir error humano con hitos específicos
- **Módulos**: caja-index, barra-index

---

## Referencias Técnicas

- **Ver también**: `frontend-developer/SKILL.md` para reglas de código
- **Tokens**: `assets/css/tokens.css`
- **Componentes**: `assets/css/components.css`

---

## Historial de Consolidación

| Fecha | Descripción |
| :---- | :---------- |

### 2026-01-29 Consolidación de `plan-ui-ux.md`, `matriz-modulos-ui.md`, 8 audits y 3 docs modern/
