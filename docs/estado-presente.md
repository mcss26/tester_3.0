# Estado Presente del Proyecto - FormulaMid 4

> **Fecha**: 02/02/2026
> **Versión**: 4.0.0 (Fase de Consolidación)
> **Estado General**: 🟡 En Desarrollo / Consolidación
> **Fuente de Verdad**: Este documento

---

## 📊 Métricas Clave

| Métrica                     | Estado Actual | Variación (vs mes anterior) |
| :-------------------------- | :------------ | :-------------------------- |
| **Pantallas Operativas**    | **48**        | +5 (Nuevos módulos staff)   |
| **Tablas en Base de Datos** | **48**        | +2 (Staging tables)         |
| **Vistas Materializadas**   | **12**        | +2 (Reportes eficiencia)    |
| **Módulos JS (Legacy)**     | **44**        | +4                          |
| **Roles Configurados**      | **6**         | -                           |
| **Skills Globales**         | **5**         | -                           |
| **Recetas Master**          | **79**        | +79 (Poblado inicial)       |

---

## 🚦 Semáforo de Módulos

### 🟢 Completos y Verificados

- **Navigation System**: Unificación de rutas y estado global.
- **Sistema de Autenticación**: `Auth.guardOrRedirect()` implementado en 91% de módulos.
- **Staff Caja (Operativo)**: Flujo completo con firma digital y cierre ciego.
- **Remediación Admin (Fase 1)**: Eliminación de `alert()` en 13 módulos clave.
- **Gestión de Stock**: Vistas `vw_stock_global` y ajustes validados.
- **Blocking UX**: Eliminación total de `alert()` y `confirm()` nativos en módulos auditados.
- **Balance Semanal**: Vista SQL `vw_finance_weekly` y dashboard implementado.
- **Arqueo de Recaudación**: Comparación consumo real vs esperado con detección de faltantes.

### 🟡 En Progreso / Calidad Beta

- **UI/UX Remediation**: Migración de Alien CSS crítica completada. Restan módulos menores.
- **Admin Workdays**: Planner de staff en desarrollo.
- **Admin Solicitudes**: Refactorización de lógica de aprobación.
- **Reportes de Eficiencia**: Vistas creadas, falta integración UI.

### 🔴 Pendiente / Bloqueado

- **Agente IA (Antigravity Agent)**: ⚠️ **PAUSADO** hasta consolidación del legacy.
- **Sandbox WYSIWYG**: Archivado temporalmente.

---

## 🛠️ Deuda Técnica Identificada

Según auditoría del 01/02/2026 y verificación del 02/02/2026:

1.  **Blocking UX Remaining**: ✅ **RESUELTO** (0 ocurrencias detectadas).
2.  **Alien CSS**:
    - ✅ **RESUELTO**: `staff-caja-index.html`, `scanner.html`, `admin-solicitudes.html`, `balance-semanal.html`.
    - ⏳ **PENDIENTE**: Archivos menores (`logistica-*.html`).
3.  **Hardcoded Colors (18 casos)**:
    - Colores en hex (`#fff`, `#ff3b30`) dentro de los charts JS.

---

## 📝 Última Actualización

**Fecha**: 02/02/2026 09:58
**Cambios**:
- **Arqueo de Recaudación implementado** en `admin-herramientas`:
  - 79 recetas pobladas en `master_recipes` con ingredientes
  - Schema: `report_type` en `consumption_reports` permite consumo + recaudación mismo día
  - Import con match por `external_id` primero (más confiable)
  - Filtro "Sin Match" clickeable para identificar items no vinculados
- Correcciones en `bar-recipes.js` (columnas DB + soporte dual de campo `quantity`)

---

> [!IMPORTANT]
> **Este documento debe actualizarse inmediatamente después de cada cambio significativo**.
>
> Ver reglas completas en: [auditing-workspace/SKILL.md](../../.gemini/antigravity/skills/auditing-workspace/SKILL.md)

---
