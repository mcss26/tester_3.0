# Roadmap FormulaMid 4

> **Última Actualización**: 2026-02-01

---

## Visión General

Documento maestro de planificación. Los roadmaps detallados para módulos en desarrollo se encuentran en `planning/`.

---

## 🗺️ Módulos en Desarrollo

| Módulo                          | Roadmap Detallado                                                | Estado         | Prioridad |
| :------------------------------ | :--------------------------------------------------------------- | :------------- | :-------- |
| **Admin Solicitudes**           | [Remediation](./planning/roadmap_solicitudes_remediation.md)     | 🟡 En Progreso | Alta      |
| **Admin Workdays**              | [Planner](./planning/roadmap_admin_workdays_planner.md)          | 🟡 En Progreso | Alta      |
| **Balance Semanal**             | [Plan](./planning/roadmap_balance_semanal.md)                    | 🔴 Pendiente   | Media     |
| **UI/UX Remediation**           | [General](./planning/roadmap_remediation_uiux.md)                | 🟡 En Progreso | Media     |
| **Admin Solicitudes (General)** | [Roadmap](./planning/roadmap_admin_solicitudes.md)               | 🟡 En Progreso | Media     |

---

## 🎯 Prioridades Q1 2026

1. **Consolidación UI/UX**: Estandarizar módulos bajo "Golden Standard" (`admin-master-proveedores`)
2. **Cierre de Caja & Balance**: Finalizar lógica contable y reportes
3. **Seguridad**: Auditoría y remediación de vulnerabilidades XSS y roles
4. **Integración MCO**: Refinar sincronización de miembros MCO ↔ FM4

---

## ✅ Hitos Completados

### Navigation System (Phases 1 & 2)

**Completado**: 2026-01-29

- Unificación de `navigation.js` (reemplazo de 2 módulos legacy)
- Estandarización de roles (`logistica`→`logistico`, mapping `manager`)
- State persistence, breadcrumbs, scroll restoration
- Migración de inline scripts a módulos externos

### Admin Modules Remediation

**Completado**: 2026-01-30

- ~50 inconsistencias corregidas en 13 módulos
- Estados globales (loading/empty) en todos los módulos
- Eliminación de `confirm()`/`alert()` nativos
- Eliminación de pseudo-Tailwind
- Accesibilidad (`aria-label` en botones icon-only)

### Staff Caja Module

**Completado**: 2026-01-30

- Flujo completo: convocaciones → selección terminal → dashboard → cierre
- Firma digital con canvas
- Realtime para movimientos de caja
- Edge cases y validaciones

### Estandarización UI

**Completado**: 2026-01-29

- Tokens CSS consolidados
- Componentes estandarizados
- Golden Standard documented

### Remodelación Topbar

**Completado**: 2026-01-29

- Nuevo diseño de topbar unificado
- Navegación consistente

---

> [!NOTE]
> Para detalles técnicos específicos, consultar los `SKILL.md` correspondientes en `.agent/skills/`.
