# Auditoría de Skills vs Realidad Operativa

> **Fecha**: 11-Feb-2026
> **Fuentes**: 15 skills + 4 notebooks + user-flows-by-role.md + código tester_3.0
> **Propósito**: Diagnosticar qué skills sirven, cuáles necesitan update, y cuáles faltan

---

## Resumen Ejecutivo

| Veredicto                          | Cantidad | Skills                                                                                                                                       |
| ---------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ **Bien alineadas**              | 3        | css-architect, auditing-workspace, find-skills                                                                                               |
| ⚠️ **Necesitan actualización**     | 8        | db-architect, logic-engineer, erp-architect, project-orchestrator, prototyper, web-designer, methodology-generator, module-coherence-auditor |
| 🔴 **Desalineadas o incompletas**  | 3        | customer-lifecycle-manager, ui-migrator, brand-developer                                                                                     |
| 🟣 **Sin cobertura (skill falta)** | 3        | (ver sección 3)                                                                                                                              |

---

## 1. Diagnóstico Skill por Skill

### ✅ css-architect — Estado: SANA

**Lo que hace bien:**

- Stack de capas bien definido (tokens → components → master → module)
- 7 anti-patrones codificados de auditorías reales
- Pre-commit checklist funcional
- Referencia correcta a tokens

**Lo que le falta:**

- No menciona el sandbox `formulamid-prototypes` ni su `base.css` / `main.css`
- Los rangos de FASE en `components.css` probablemente estén desactualizados (el archivo crece)

**Gaps cubiertos**: Ninguno directo. Es infraestructura de soporte.
**Acción**: Update menor — agregar referencia al sandbox CSS.

---

### ⚠️ db-architect — Estado: DESACTUALIZADA

**Problemas detectados:**

| Issue                                  | Detalle                                                                                                                                                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 **Roles incompletos**               | Lista 10 roles (`admin`, `gerencia`, `encargado`, `contable`, `logistica`, `barra`, `caja`, `puerta`, `passline_entry`, `staff`). Faltan: `staff_operativo`, `staff_guardia`, `staff_seguridad`, `encargado_limpieza`, `encargado_seguridad`, `manager` |
| 🔴 **Status lifecycle desincronizado** | §5.3 dice `status IN ('ABIERTA', 'CERRADA')` pero §1.1 dice `DRAFT → PLANNED → ACTIVE → CLOSED` (el correcto, post-migraciones)                                                                                                                         |
| 🟡 **Vistas desactualizadas**          | No documenta: `vw_per_capita_revenue`, `vw_workday_pnl`, `vw_workday_benchmarks` (creadas en migraciones recientes)                                                                                                                                     |
| 🟡 **Tablas faltantes**                | No documenta: `work_day_templates`, `staff_convocations` (detalle), `revenue_reports` (columnas nuevas)                                                                                                                                                 |
| 🟡 **Tablas inventadas**               | Referencia `products`, `stock_transactions` (que en la DB real son `master_sku`, `inventory_movements`) — inconsistencia con `erp-architect`                                                                                                            |
| 🟢 **FK diagram**                      | El mermaid diagram está correcto pero incompleto                                                                                                                                                                                                        |

**Gaps cubiertos por esta skill**: Ninguno de los 12 gaps directamente. Es infraestructura.
**Acción**: 🔴 **Update urgente** — sincronizar con el estado real de la DB post-migraciones.

---

### ⚠️ logic-engineer — Estado: PARCIALMENTE DESACTUALIZADA

**Problemas detectados:**

| Issue                                    | Detalle                                                                                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 **Roles incompletos**                 | §1.2 lista 8 roles con sus landings. Faltan los sub-roles descubiertos (`encargado_barra`, `encargado_caja`, `staff_barra`, `staff_caja`, etc.) |
| 🔴 **Status lifecycle**                  | §7.3 dice `COUNT(status='ABIERTA') <= 1` — usa el status OLD. Debería ser `'ACTIVE'`                                                            |
| 🟡 **RPCs no documentadas**              | Las 5 RPCs de lifecycle (`rpc_create_work_day`, `rpc_confirm_work_day`, etc.) no están documentadas aquí                                        |
| 🟡 **Validaciones de negocio faltantes** | No documenta: arqueo ciego (Staff no ve totales), tolerancia por terminal, validación de break-even                                             |
| ✅ **Patrón IIFE**                       | Correcto y vigente                                                                                                                              |
| ✅ **Utils**                             | Documentación de utils correcta                                                                                                                 |

**Gaps que DEBERÍA cubrir**:

- Gap #1 (Arqueo ciego) → Necesita validación de negocio documentada
- Gap #3 (Audit trail) → Tiene el concepto de `system_logs` pero sin implementación

**Acción**: 🟡 **Update medio** — roles, status, RPCs, y validaciones de arqueo.

---

### ⚠️ erp-architect — Estado: SUPERFICIAL

**Problemas detectados:**

| Issue                         | Detalle                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 **Tablas incorrectas**     | §Flujos usa `products`, `stock_transactions`, `cash_register_entries`, `staff`, `staff_assignments`, `suppliers`, `purchase_orders` — **NINGUNA existe con ese nombre** en la DB real |
| 🔴 **Flujos incompletos**     | Solo documenta 4 flujos genéricos. Los notebooks documentan ~15 procesos detallados                                                                                                   |
| 🟡 **Sin referencia a roles** | No mapea qué rol ejecuta cada flujo                                                                                                                                                   |
| 🟡 **Gap Analysis de GBol**   | No referencia las 8 auditorías, ni el protocolo de ingreso, ni el workflow de arqueo ciego                                                                                            |

**Gaps que DEBERÍA cubrir**:

- Gap #1 (Arqueo ciego) → Debería tener el flujo completo de cierre
- Gap #2 (Aprobación solicitudes) → Debería tener el flujo de stock cross-rol
- Gap #3 (Audit trail) → Debería documentar los 8 tipos de auditoría

**Acción**: 🔴 **Rewrite necesaria** — con datos reales de los notebooks + DB.

---

### ⚠️ project-orchestrator — Estado: CORRECTA PERO DESACTUALIZADA

**Problemas detectados:**

| Issue                           | Detalle                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| 🟡 **Fases de migración**       | Dice "Fase 1: Coexistencia (Actual)" — esto sigue siendo correcto            |
| 🟡 **Estructura de directorio** | Correcta para tester_3.0, no menciona `formulamid-prototypes`                |
| 🟡 **Tabla de sustitución**     | Los módulos listados son correctos pero faltan los nuevos (workday redesign) |
| ✅ **Protocolo Pencil-First**   | Correcto y vigente                                                           |
| ✅ **Validación cruzada**       | Correcta                                                                     |

**Acción**: 🟢 **Update menor** — agregar prototypes sandbox y nuevos módulos.

---

### 🔴 customer-lifecycle-manager — Estado: DESALINEADA

**Diagnóstico**: Esta skill fue diseñada para un **CRM genérico** (companies, contacts, deals). El negocio real es un **nightclub ERP** — no tiene companies, contacts ni deals en la DB real.

| Issue                        | Detalle                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| 🔴 **Tablas inexistentes**   | Referencia `companies`, `crm_contacts`, `deals`, `system_logs` — NINGUNA existe en Supabase |
| 🔴 **Flujo irrelevante**     | Prospecting → Qualified → Proposal → Negotiation → Closed — No aplica al negocio            |
| 🔴 **Métricas irrelevantes** | Ratio de Aceptación, Reducción de Fricción — No aplican                                     |
| 🟡 **Concepto rescatable**   | El protocolo Lápiz/Tinta y la inferencia de entidades SÍ son útiles                         |

**Gaps que podría cubrir (post-rewrite)**:

- Gestión de miembros del club (QR, membresías)
- Alta de proveedores desde chat
- Gestión de staff desde chat

**Acción**: 🔴 **Rewrite total** o **deprecar** y crear una nueva skill orientada al dominio real.

---

### ⚠️ prototyper — Estado: ACTUALIZADA (12-Feb-2026)

**Problemas resueltos:**

| Issue                               | Detalle                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| ✅ **Guardrails**                   | Correctos — solo escribe en prototypes, lee tester_3.0                             |
| ✅ **Naming**                       | Prefijo `lab-` correcto y vigente                                                  |
| ✅ **Design tokens**                | Tabla de tokens correcta                                                           |
| ✅ **Contexto de módulos**          | §8 nuevo: tabla de módulos activos, roles, flujos, fuentes de datos reales         |
| ✅ **Referencia a Balance Semanal** | `lab-reports` documentado con deep_research_context.md y implementation_plan_v3.md |
| ✅ **Referencia a roles**           | 6 roles con flujo principal documentados en §8                                     |

**Acción**: ✅ **Actualizada** — sección 8 con contexto completo.

---

### ⚠️ web-designer — Estado: GENÉRICA

**Problema principal**: Es una skill genérica de UX/UI. Tiene buen framework teórico (5 fases, checklist de diseño, glosario) pero CERO contexto del dominio nightclub.

| Issue                                | Detalle                                                         |
| ------------------------------------ | --------------------------------------------------------------- |
| 🟡 **Sin dominio**                   | No sabe que es un nightclub, no conoce los roles, ni los flujos |
| ✅ **Integración con tokens**        | Correcta                                                        |
| ✅ **Integración con css-architect** | Correcta                                                        |

**Acción**: 🟡 **Update menor** — inyectar contexto de dominio.

---

### 🔴 ui-migrator — Estado: OBSOLETA

**Problema principal**: Opera sobre `demo/` y `demo.css` — pero el sandbox actual es `formulamid-prototypes/screens/` con `base.css` + `main.css`.

| Issue                          | Detalle                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| 🔴 **Path incorrecto**         | Referencia `pages/demo/` — el sandbox real es `formulamid-prototypes/screens/lab-*/` |
| 🔴 **CSS incorrecto**          | Referencia `demo.css` — el CSS real del sandbox es `base.css` + `main.css`           |
| 🔴 **Componentes incorrectos** | Referencia `components_catalog.html` — no existe en el sandbox                       |
| 🟡 **Proceso de migración**    | El flujo conceptual (Análisis → Mapeo → Construcción → Validación) es correcto       |
| 🟡 **Golden Standard ref**     | La referencia a `ui-golden-standard.md` es correcta                                  |

**Acción**: 🔴 **Rewrite necesaria** — actualizar paths, CSS refs, y alinear con `prototyper`.

---

### ⚠️ methodology-generator — Estado: CORRECTA, SIN DATOS

**Problema**: La skill está bien diseñada (fuentes, dimensiones, matriz de prioridad) pero depende de datos que no se generan regularmente.

| Issue                             | Detalle                                                    |
| --------------------------------- | ---------------------------------------------------------- |
| ✅ **Framework**                  | Matriz de prioridad IMPACTO × ESFUERZO correcta            |
| ✅ **Sprint rules**               | Correctas                                                  |
| 🟡 **Sin input fresco**           | Referencia `docs/planning/` que puede estar desactualizado |
| 🟡 **Sin referencia a notebooks** | No sabe que existen los 4 notebooks con intel de negocio   |

**Acción**: 🟡 **Alimentar con datos** — correr un ciclo con los gaps descubiertos.

---

### ⚠️ module-coherence-auditor — Estado: CORRECTA PARA LEGACY

**Problema**: Audita correctamente `tester_3.0` pero no conoce el sandbox.

| Issue                             | Detalle                             |
| --------------------------------- | ----------------------------------- |
| ✅ **Procedimiento de auditoría** | Los 6 checks son correctos y útiles |
| ✅ **Severidad**                  | Tabla de severidad correcta         |
| 🟡 **Sin sandbox coverage**       | No audita `formulamid-prototypes`   |
| 🟡 **Sin role-awareness**         | No cruza con `data-allowed-roles`   |

**Acción**: 🟢 **Update menor** — agregar sandbox, roles.

---

### ✅ auditing-workspace — Estado: SANA

Correcta y vigente. Jerarquía de fuentes de verdad, patrones sospechosos, procedimiento de limpieza — todo aplica.

**Acción**: Sin cambios necesarios.

---

### 🔴 brand-developer — Estado: FUNCIONAL PERO DESCONECTADA

Opera correctamente para assets de marca, pero depende de archivos en `knowledge/midnight_club_brand_identity/` que necesitan verificación de existencia.

**Acción**: 🟢 Verificar que los archivos de Knowledge Identity existen.

---

### ✅ creative-director — Estado: SANA

Skill meta correcta. Define visión, genera assets, spawna skills.

**Acción**: Sin cambios necesarios.

---

### ✅ find-skills — Estado: SANA

Utilidad correcta. Busca e instala skills externas.

**Acción**: Sin cambios necesarios.

---

## 2. Matriz Skills × Gaps

| Gap                                  | Skills que deberían cubrirlo                                                          | Estado actual                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **#1 Arqueo ciego**                  | `logic-engineer` (validación), `erp-architect` (flujo), `db-architect` (schema)       | ❌ Ninguna lo documenta                                                           |
| **#2 Aprobación solicitudes**        | `erp-architect` (flujo cross-rol), `logic-engineer` (permisos)                        | ❌ Flujo no documentado                                                           |
| **#3 Audit trail**                   | `erp-architect` (8 tipos), `db-architect` (tablas), `logic-engineer` (implementación) | ❌ Solo concepto genérico en `customer-lifecycle-manager`                         |
| **#4 Vista Contable**                | `prototyper` (prototipo), `web-designer` (diseño)                                     | ⚠️ Sin contexto de rol                                                            |
| **#5 Alertas stock bajo**            | `logic-engineer` (lógica real-time), `db-architect` (triggers)                        | ❌ No documentado                                                                 |
| **#6 Roles fantasma**                | `db-architect` (roles), `logic-engineer` (permisos), `erp-architect` (flujos)         | ❌ Roles no listados                                                              |
| **#7 Historial rendimiento**         | `db-architect` (vistas), `prototyper` (UI)                                            | ⚠️ Vista `vw_staff_performance` existe pero sin historial                         |
| **#8 Flujo bidireccional logístico** | `erp-architect` (flujo), `logic-engineer` (implementación)                            | ❌ Solo flujo unidireccional                                                      |
| **#9 Dashboard Gerente**             | `prototyper` (prototipo), `web-designer` (diseño)                                     | ⚠️ `prototyper` §8 tiene contexto; `lab-reports` (Balance Semanal) en rediseño v3 |
| **#10 Comunicación entre roles**     | —                                                                                     | ❌ No hay skill para esto                                                         |
| **#11 Protocolo ingreso**            | `erp-architect`                                                                       | ⚠️ NB4 lo documenta, skill no                                                     |
| **#12 ETA proveedores**              | `erp-architect`, `db-architect`                                                       | ❌ Sin dato de proveedor                                                          |

**Score**: 1 de 12 gaps parcialmente cubierto por skills actuales (Gap #9 por `prototyper` §8).

> [!NOTE]
> **Update 12-Feb-2026**: La skill `prototyper` fue actualizada con sección 8 (contexto de módulos).
> Los docs `knowledge-base-notebooks.md` y `user-flows-by-role.md` también fueron actualizados con el Balance Semanal.

---

## 3. Skills que Faltan (No Existen)

### 🟣 1. operations-playbook

**Necesidad**: Un skill que contenga los **flujos operativos reales** del nightclub — el contenido de los 4 notebooks destilado en reglas de negocio ejecutables.

**Cubriría**:

- Protocolo de apertura/cierre (GBol)
- 8 tipos de auditoría
- Protocolo de ingreso (documento + guardia + validadores)
- Workflow de arqueo ciego
- Flujo de solicitudes cross-rol
- Roles y responsabilidades reales (12 sub-roles)

**Diferencia con erp-architect**: El erp-architect diseña sistemas. El operations-playbook documenta la realidad operativa que el sistema debe implementar.

### 🟣 2. role-navigator

**Necesidad**: Un skill que mapee qué pantalla ve cada rol, qué puede hacer, y cuál es el flujo esperado.

**Cubriría**:

- Matriz pantalla × rol (la de `user-flows-by-role.md`)
- Permisos `data-allowed-roles` como fuente de verdad
- Gaps de pantalla por rol
- Flujos cross-rol (cadena stockista, cadena de caja)

**Diferencia con logic-engineer**: El logic-engineer documenta patrones de código. El role-navigator documenta la experiencia del usuario por rol.

### 🟣 3. notebook-knowledge-bridge

**Necesidad**: Un skill que sepa qué notebooks existen, qué contienen, y cuándo consultarlos.

**Cubriría**:

- Catálogo de notebooks (NB1-NB4 + más)
- Mapeo de topics → notebooks
- Protocolo de consulta a NotebookLM MCP
- Mantenimiento de la base de conocimiento

---

## 4. Plan de Acción Recomendado (Priorizado)

### Sprint 0 — Quick Wins (< 1 hora)

| #   | Acción                                                                                         | Skill         | Impacto       |
| --- | ---------------------------------------------------------------------------------------------- | ------------- | ------------- |
| 1   | Sincronizar `db-architect` status lifecycle: `ABIERTA/CERRADA` → `DRAFT/PLANNED/ACTIVE/CLOSED` | db-architect  | 🔴 Evita bugs |
| 2   | Actualizar roles en `db-architect` y `logic-engineer` con los 12 sub-roles reales              | ambas         | 🔴 Alineación |
| 3   | Corregir tabla names en `erp-architect` (`products` → `master_sku`, etc.)                      | erp-architect | 🟡 Precisión  |

### Sprint 1 — Fundamentals (2-3 horas)

| #   | Acción                                                       | Skill        |
| --- | ------------------------------------------------------------ | ------------ |
| 4   | Crear `operations-playbook` con contenido de los 4 notebooks | NUEVA        |
| 5   | Rewrite `ui-migrator` con paths correctos del sandbox        | ui-migrator  |
| 6   | Agregar RPCs y vistas nuevas a `db-architect`                | db-architect |

### Sprint 2 — Alignment (~2 horas)

| #   | Acción                                                        | Skill     |
| --- | ------------------------------------------------------------- | --------- |
| 7   | Crear `role-navigator` con matriz pantalla × rol              | NUEVA     |
| 8   | Inyectar contexto de dominio en `prototyper` y `web-designer` | ambas     |
| 9   | Decidir: ¿rewrite `customer-lifecycle-manager` o deprecar?    | CRM skill |

### Sprint 3 — Nice to Have

| #   | Acción                                                             | Skill                 |
| --- | ------------------------------------------------------------------ | --------------------- |
| 10  | Crear `notebook-knowledge-bridge`                                  | NUEVA                 |
| 11  | Alimentar `methodology-generator` con gaps y correr ciclo completo | methodology-generator |
| 12  | Verificar assets de `brand-developer` en knowledge/                | brand-developer       |

---

_15 skills analizadas. 0 gaps cubiertos. 3 skills nuevas propuestas. 4 sprints estimados._
