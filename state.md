# Estado del Proyecto: Tester 3.0 — Midnight Club

**Última actualización:** 2026-02-21 05:06  
**Método:** Indexado recursivo completo

---

## 1. Capa Activa

> Referencia: [`ROADMAP.md`](ROADMAP.md) — 4 capas por dependencia técnica.

- **Capa activa:** Capa 2 (completada) → Capa 3
- **Capa 0 (Seguridad):** ~90% completa — 3 ítems menores pendientes
- **Capa 1 (Modularización CSS):** ✅ Completada — 5 archivos modulares + theme-swiss.css
- **Capa 2 (Tokens + Layout):** ✅ Completada — GS compliance avg 59→81, 32/45 páginas compliant
- **Siguiente capa:** Capa 3 — Integración + Polish

## 2. Stack Tecnológico

| Capa     | Tecnología                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | HTML estático + Vanilla JS (ES modules)                                                                                                        |
| Estilos  | CSS modular: `tokens.css` + 5 modulares (`base`, `layout`, `components`, `forms`, `utilities`) + `theme-swiss.css` (opt-in) + 16 page-specific |
| Backend  | Supabase (Auth, Postgres 65 tablas, 27 vistas, 38 RPCs, Edge Functions)                                                                        |
| Tooling  | Node.js (audits) + PowerShell (scans, watchdogs, verificación)                                                                                 |
| Hosting  | Estático (sin bundler, sin framework)                                                                                                          |

## 3. Estructura del Repositorio

```text
tester_3.0/
├── pages/          47 HTML (8 módulos: admin, encargados, operativo, logística, staff, gerencia, members, prototypes)
├── assets/
│   ├── css/        tokens.css + 5 modulares (base/layout/components/forms/utilities) + theme-swiss.css (opt-in) + 16 page-specific
│   └── js/
│       ├── core/   20 módulos (auth, config, router, utils, supabase-client)
│       ├── modules/ 42 módulos de negocio
│       └── importers/ 6 importadores (GBOL, AFIP, Passline)
├── scripts/        34 herramientas (audit, extract, scan)
├── docs/           design-system/ (consolidado ✅), source-of-truth/, operaciones/
├── supabase/       29 migraciones + 1 edge function
├── .agent/         4 agentes, 11 workflows, 22 skills (component-builder absorbida → css-architect v3.0)
└── tests/          4 suites
```

## 4. Dominios de Negocio (Backend)

### Tablas por Dominio (65 total)

| Dominio          | Tablas                                                                                                                                                                         | Cant. |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| Workday Core     | `work_days`, `work_day_staff_planning`, `work_day_templates`, `events`                                                                                                         | 4     |
| Cash Closing     | `cash_closings`, `closing_terminals`, `cash_movements`, `pos_terminals`, `pos_terminals_alias`                                                                                 | 5     |
| Bar Operations   | `bar_sessions`, `bar_stock_snapshots`, `bar_session_sales`                                                                                                                     | 3     |
| Replenishment    | `replenishment_requests`, `_items`, `_supplier_orders`, `_receipts`, `_receipt_items`, `_tracking`                                                                             | 6     |
| Inventory        | `master_sku`, `master_categories`, `master_recipes`, `recipe_code_mappings`, `inventory_stock`, `_movements`, `_stock_adjustments`, `inventory_ideal`                          | 8     |
| Staff / Payroll  | `master_staff_roles`, `staff_convocations`, `staff_accruals`, `staff_functions`, `profile_functions`, `profiles`                                                               | 6     |
| Finance          | `finance_payments`, `_payment_rules`, `_opening_cost_defs`, `_weekly_closings`, `cost_definitions`, `cost_config`, `accounts_payable`, `payment_categories`, `payment_methods` | 9     |
| Revenue / Fiscal | `revenue_reports`, `revenue_details`, `consumption_reports`, `consumption_details`                                                                                             | 4     |
| QR / Access      | `qr_batches`, `qr_codes`, `qr_checkins`                                                                                                                                        | 3     |
| Members          | `members`                                                                                                                                                                      | 1     |
| Auth / Config    | `auth_audit_log`, `audit_config`, `site_config`, `sku_change_requests`                                                                                                         | 4     |
| Menu             | `menu_categories`, `menu_items`                                                                                                                                                | 2     |
| Suppliers        | `master_proveedores`                                                                                                                                                           | 1     |
| GBOL Import      | `import_gbol_facturacion`, `_gbol_comandas`, `_gbol_withdrawals`, `gbol_sync_log`, `import_logs`                                                                               | 5     |
| Staging          | `stg_afip_facturas`, `stg_extracciones`, `stg_gbol_items`, `stg_passline_tickets`                                                                                              | 4     |

### RPCs Clave (34 total)

| Grupo             | Cant. | RPCs principales                                                                                |
| ----------------- | ----- | ----------------------------------------------------------------------------------------------- |
| Workday Lifecycle | 8     | `rpc_create_work_day`, `rpc_confirm`, `rpc_open`, `rpc_close`, `calculate_health_score`         |
| Payroll / Finance | 7     | `admin_generate_workday_accruals`, `admin_export_accruals_to_payments`, `admin_approve_payment` |
| Inventory         | 2     | `admin_bulk_set_stock`, `rpc_receive_supplier_order`                                            |
| Auth / Helpers    | 6     | `get_my_role`, `has_role`, `is_admin`, `verify_member_password`                                 |
| Triggers          | 8     | Auto-cálculos, validaciones, propagación                                                        |

### Workday State Machine

`DRAFT` →(rpc_confirm)→ `PLANNED` →(rpc_open)→ `ACTIVE` →(rpc_close)→ `CLOSED` · `PLANNED` →(rpc_revert)→ `DRAFT`

## 5. Roles y Pantallas (12 roles × 45 pantallas)

| Rol       | Sub-roles                                                       | Pantallas | Acceso                       |
| --------- | --------------------------------------------------------------- | --------- | ---------------------------- |
| Admin     | `admin`                                                         | 20+       | Acceso total                 |
| Contable  | `contable`                                                      | 12        | Compartidas con admin (read) |
| Gerente   | `gerente`                                                       | 1         | `balance-semanal`            |
| Operativo | `operativo`, `staff_operativo`                                  | 9         | ERP + Scanner                |
| Logístico | `logistico`                                                     | 5+3       | Stock + distribución         |
| Encargado | `enc_barra`, `enc_caja`, `enc_limpieza`, `enc_seguridad`        | 7         | Cierre nocturno              |
| Staff     | `staff_barra`, `staff_caja`, `staff_guardia`, `staff_seguridad` | 2-3       | POS terminal                 |
| Manager   | `manager`                                                       | 1         | QR monitor                   |
| Member    | (sin rol explícito)                                             | 1         | `my-qr` autoservicio         |

> **Nota:** 6 roles sin pantalla propia: `enc_limpieza`, `enc_seguridad`, `staff_guardia`, `staff_seguridad`, `gerente` (1), `manager` (1).

## 6. Métricas Vivas

| Métrica              | Valor                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| Pantallas operativas | 47                                                                                   |
| Tablas BD            | 65                                                                                   |
| Vistas SQL           | 27                                                                                   |
| Módulos JS           | 42 + 20 core + 6 importers = 68                                                      |
| Archivos CSS         | 24 (5 modulares + 1 theme-swiss opt-in + 16 page-specific + tokens + 1 bak monolito) |
| Migraciones SQL      | 29                                                                                   |
| Members registrados  | 2,245                                                                                |
| SKUs activos         | 26                                                                                   |
| Recetas              | 93                                                                                   |
| Proveedores          | 47                                                                                   |
| Profiles (users)     | 4                                                                                    |

## 7. Completado (Done)

_El agente lee esto para no replanificar trabajo existente._

- [x] Auditoría de seguridad completa → [`Seguridad_Arquitectura.md`](docs/operaciones/testing/observations/Seguridad_Arquitectura.md)
- [x] Review del plan de blindaje → [`Plan_Blindaje_Review.md`](docs/operaciones/testing/observations/Plan_Blindaje_Review.md)
- [x] Wire map de agentes → [`Wire_Map_Agentes.md`](docs/operaciones/testing/observations/Wire_Map_Agentes.md)
- [x] ROADMAP reescrito por dependencias técnicas → [`ROADMAP.md`](ROADMAP.md)
- [x] Auditoría de fragilidad CSS → [`Auditoría de Fragilidad y Scope.md`](docs/operaciones/testing/observations/Auditoría%20de%20Fragilidad%20y%20Scope.md)
- [x] Script de aplanamiento CSS descartado (solo 2 `#id` reales, regex destructivo)
- [x] Encargados identificados como sandbox de bajo riesgo
- [x] Onboarding e indexado recursivo completo (2026-02-20)
- [x] **T1 Body hide** en `guardOrRedirect` — `auth.js` oculta body hasta validar session+rol
- [x] **T3 Deprecar `index.html`** — redirect a `login.html` (no a admin)
- [x] **T4 CSP meta tag** piloto en `login.html` (script-src, connect-src, frame-src none)
- [x] **T5 CSS drift report** — cruce scanner UI (44 páginas) + CLI → [`css-drift-report.md`](docs/operaciones/testing/observations/css-drift-report.md)
- [x] **Corrección diagnóstico RLS**: 68/68 tablas con RLS + 113 policies (no 6/65 como decía la auditoría)
- [x] Scanner UI ejecutado en 44 páginas → avg 59% GS compliance → [`compliance-matrix.md`](docs/output/ui-scan/compliance-matrix.md)
- [x] **Consolidación docs DS** — 30+ archivos dispersos → `docs/design-system/` unificado (6 vigentes, 7 prompts, 4 reports, 5 archive). Vaciados `_generated/frontend/` y `_generated/orchestrator/`
- [x] **Auditoría colisiones CSS** — 112 clases duplicadas entre `swiss-style.css` y `components.css`. `swiss-style.css` cargado por 0 páginas producción (solo `visual.html` demo). Bloque legacy contaminado identificado (L786-855)
- [x] **Consolidación skills** — `component-builder` absorbida en `css-architect` v3.0. 4 workflows actualizados.
- [x] **Limpieza docs UI-UX** — `canva_layout...` movido a `docs/design-system/canva_layout_fm_4.md`. `practicas.md` (vacío) eliminado.
- [x] **Modularización CSS** — `components.css` (7820L) → 5 archivos: `base.css` (120L), `layout.css` (362L), `components.css` (6797L), `forms.css` (321L), `utilities.css` (200L). 42 páginas HTML actualizadas.
- [x] **Resolución colisiones Swiss** — `swiss-style.css` (1325L) → `theme-swiss.css` (774L). 551 líneas duplicadas eliminadas. Archivo original renombrado a `.bak`.
- [x] **Scanner GS alineado** — `ui-component-scanner.ps1` ajustado a arquitectura modular CSS + CustomDropdowns JS. Relevancia contextual + registry trimmed a clases core. Score avg 59→76 (+17pts), páginas compliant 4→25 (6×).
- [x] **GS Batch 2 remediation** — 4 páginas: `balance-semanal` (H1→H2, actions-bar, is-header, cell-pad), `encargado-barra-personal` (page-card, btn prefix, modal-title), `encargado-caja-noche` (btn GS classes), `encargado-caja-personal` (tab-content, modal-title, btn prefix). Compliant 25→27.
- [x] **GS Batch 3 remediation** — 3 páginas: `operativo-analisis` (actions-bar, tab-content×3, chart-section), `encargado-caja-noche` (dashboard-header/title), `encargado-caja-personal` (dashboard-header/title). Compliant 27→30.
- [x] **Scanner relevancia v2** — 10 reglas contextuales: Nav/Buttons/Forms/FilterBar excluyen launchers, Sidebar requiere `sidebar-*` classes, Panels usa exact GS class match (no regex), Stats usa `^stat[-s]`, zero-denominator → N/A. 5 launchers correctamente excluidos.
- [x] **GS Batch 4+5 remediation** — `operativo-workday` (actions-bar, cell-pad). Scanner fixes generaron mejoras indirectas: `generator` 72→94, `admin-workdays` 78→86, `encargado-barra-personal` 81→90. **Score avg 59→81 (+22pts), compliant 2→32 (16×).**

## 8. Pendiente (To Do)

_Trabajo que el agente debe estructurar y delegar, en orden de dependencia._

### Capa 0 — Seguridad Core (en cierre)

- [x] ~~`index.html` — redirect a admin sin auth~~ → Deprecado, redirige a `login.html`
- [x] ~~RLS masivo~~ → Ya habilitado en 68/68 tablas con 113 policies (corregido diagnóstico)
- [x] ~~CSP~~ → Meta tag piloto en `login.html`
- [ ] Descomentar `guardOrRedirect` en `scanner.js` (delegado)
- [ ] Expandir CSP a las demás páginas (post-piloto)
- [ ] Refinar policies RLS genéricas (`authenticated` sin filtro de rol) en ~20 tablas

### ✅ Migración CSS — Modularización (completada)

- [x] **Modularizar `components.css` (7820L)** → 5 archivos modulares
- [x] Resolver 139 colisiones Swiss vs Zinc → `theme-swiss.css` (opt-in layer)
- [x] Eliminar bloque legacy contaminado en `swiss-style.css`
- [x] Actualizar `<link>` en 42 páginas HTML
- [x] `swiss-style.css` → `swiss-style.css.bak`

### ✅ Capa 1 — Tokens (completada)

- [x] Consolidar token aliases duplicados — 14 pares documentados con migration registry
- [x] Consolidar spacing: semántico (canonical) + numérico (retrocompat aliases)
- [x] Agregar `--space-3: 12px` (hueco)
- [x] Eliminar legacy Aurora (0 usos)
- [x] Crear `docs/design-system/token-migration-registry.md`
- [x] Remediar GS compliance — scanner alineado a arquitectura actual, 41 prompts regenerados (score avg 59→63)
- [x] **GS Batch 1 remediation** — 4 encargado pages fixed: `form-label` on 20+ labels, breadcrumb nav on `caja-noche`, `cell-pad` on table headers. `encargado-caja-noche` +12pts (46→58). Verified operativo/staff/logistica modules already GS-compliant.

### ✅ Capa 2 — Tokens + Layout + GS Compliance (completada)

- [x] Tokens: aliases consolidados, spacing semántico + numérico, `--space-3: 12px`, Aurora legacy eliminado
- [x] Layout: `page-shell` responsive, `planner-layout` stacking, CustomDropdowns transversal (21 páginas)
- [x] **GS Compliance global** — Score avg 59→81 (+22pts), 32/45 páginas compliant (≥80). 7 páginas HTML remediadas, scanner con 10 reglas de relevancia contextual. 5 launchers → N/A, 4 parciales restantes (prototipos/scanner), 4 críticos (test pages).

### Capa 3+ — Ver ROADMAP.md

## 9. Decisiones Pendientes

_Requieren input del usuario antes de implementar._

| Decisión            | Opciones                                                                                                                              | Estado                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| RLS por rol         | A) Custom claims vs B) Sub-select a `profiles` — B ya está implementado en producción con `has_role()`, `is_admin()`, `get_my_role()` | ✅ Resuelto (sub-select)      |
| Body hide post-auth | A) Centralizar en `auth.js` vs B) Por módulo                                                                                          | ✅ Resuelto (A: centralizado) |

## 10. Bloqueos

_Información crítica que el agente debe tener en cuenta._

- ~~**`index.html`** redirige a admin sin verificar sesión~~ → ✅ Deprecado
- **`scanner.js`** tiene guard comentado → accesible sin auth (pendiente)
- **~20 tablas** con policies genéricas `authenticated` sin filtro de rol (aceptable con 4 users, mejorar en siguiente sprint)
- ~~**CSS/Layout** → 112 colisiones Swiss↔Zinc~~ → ✅ Resuelto. `theme-swiss.css` como opt-in layer
- ~~**`swiss-style.css`** → 1325L~~ → ✅ Reemplazado por `theme-swiss.css` (774L). Original en `.bak`
- **`docs/design-system/`** → Consolidado ✅ — ver `truth.md`, `audit.md`, `MASTER.md`

## 11. Observaciones de Testing (Sprint 0)

### Seguridad — 7 hallazgos → [`Seguridad_Arquitectura.md`](docs/operaciones/testing/observations/Seguridad_Arquitectura.md)

| #   | Hallazgo                                                       | Sev. | Estado                                       |
| --- | -------------------------------------------------------------- | ---- | -------------------------------------------- |
| 1   | ANON_KEY + EmailJS keys en `config.js` (público, requiere RLS) | 🔴   | Mitigado (RLS 68/68)                         |
| 2   | `index.html` redirige a admin sin verificar sesión             | 🔴   | ✅ Resuelto (T3)                             |
| 3   | Auth 100% client-side, sin refuerzo server-side                | 🔴   | Mitigado (body hide T1 + RLS)                |
| 4   | RLS en solo ~6/65 tablas                                       | 🔴   | ✅ **Dato erróneo** — 68/68 con 113 policies |
| 5   | Policies genéricas `authenticated` sin filtro por rol          | 🟡   | ~20 tablas pendientes                        |
| 6   | Guard comentado en `scanner.js`                                | 🟡   | Pendiente                                    |
| 7   | Sin CSP ni security headers                                    | 🟡   | ✅ CSP piloto en `login.html` (T4)           |

### Plan de Blindaje — 5 correcciones → [`Plan_Blindaje_Review.md`](docs/operaciones/testing/observations/Plan_Blindaje_Review.md)

| #   | Error en el plan                                    | Corrección                                         |
| --- | --------------------------------------------------- | -------------------------------------------------- |
| 1   | `app_metadata.role` no existe                       | Rol vive en `profiles`, usar `Auth.getMyProfile()` |
| 2   | `auth.jwt() ->> 'role'` retorna `authenticated`     | Custom claims o sub-select a `profiles`            |
| 3   | RLS sin policies de escritura bloquea operación     | Set completo S/I/U/D por tabla                     |
| 4   | Guard afecta solo `scanner.js`                      | Descomentar solo ese archivo                       |
| 5   | CSP incluye `tailwindcss.com`, omite `jsdelivr.net` | Alinear al stack real                              |

### Fragilidad CSS — 5 hallazgos → [`Auditoría de Fragilidad y Scope.md`](docs/operaciones/testing/observations/Auditoría%20de%20Fragilidad%20y%20Scope.md)

> [!NOTE]
> El drift report actualizado (`css-drift-report.md`) corrige estos datos con evidencia real del CLI.

| #   | Hallazgo                  | Dato original                                | Dato corregido (CLI)                                                             |
| --- | ------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Barrera de especificidad  | 142 `!important`, 89 `#id` en admin CSS      | **2 `!important`**, 3 `#id` (solo QR print)                                      |
| 2   | Design drift              | Módulos redefinen tokens en `:root` local    | Solo `swiss-style.css` redefine `:root` (esperado)                               |
| 3   | Acoplamiento JS-CSS       | 312 selectores de presentación como hooks JS | Hooks son clases de **estado** (`hidden`, `active`, `is-open`) — patrón correcto |
| 4   | Riesgo regresión por poda | JS se rompe si se poda CSS sin hooks `js-`   | Bajo riesgo — no hay clases de estilo en hooks JS                                |
| 5   | Inconsistencia fiscal     | SQL y JS pueden divergir en IVA/comisiones   | Sin cambios                                                                      |

### Wire Map de Agentes — 47 nodos → [`Wire_Map_Agentes.md`](docs/operaciones/testing/observations/Wire_Map_Agentes.md)

- 41 OK · 6 skills huérfanas (sin auto-invoke) · 3 docs agents desconectados del router

## 12. Gaps Cross-Rol

### 🔴 Críticos

1. **Arqueo ciego Staff** — Staff no debería ver totales del sistema. No implementado.
1. **Aprobación solicitudes Encargado** — Sin pantalla dedicada.
1. **Audit trail** — 8 auditorías de GBol no existen en FM4.

### 🟡 Importantes

1. Vista unificada Contable
1. Alertas stock bajo real-time
1. Roles fantasma sin pantalla
1. Historial rendimiento Staff
1. Flujo bidireccional Logístico↔Operativo

## 13. Source of Truth — Contrato

| Regla                | Descripción                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 — Verify First    | Cruzar datos contra source-of-truth antes de actuar. Código > doc si hay conflicto.                                                                                                                                                                                                                                                                                                           |
| R2 — No Create       | Prohibido crear archivos en `docs/source-of-truth/`. Solo editar.                                                                                                                                                                                                                                                                                                                             |
| R3 — Freshness Check | Si doc >7 días sin update y hay drift, notificar.                                                                                                                                                                                                                                                                                                                                             |
| R4 — Cross-Reference | [`scheme.md`](docs/source-of-truth/scheme.md) para tablas, [`backend-architecture.md`](docs/source-of-truth/backend-architecture.md) para RPCs, [`screen-map.md`](docs/source-of-truth/screen-map.md) para pantallas×roles, [`user-flows-by-role.md`](docs/source-of-truth/user-flows-by-role.md) para flujos, [`estado-presente.md`](docs/source-of-truth/estado-presente.md) para métricas. |

> **`docs/_generated/`** — `frontend/` y `orchestrator/` vaciados (solo `.gitkeep`). Contenido consolidado en `docs/design-system/`.
> **`docs/_generated/logic/`** está vacío (solo `.gitkeep`). No se ha generado documentación de lógica.
