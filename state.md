# Estado del Proyecto: Tester 3.0 â€” Midnight Club

**## Ãšltima ActualizaciÃ³n: 2026-02-22T11:44:00-03:00  
**MÃ©todo:\*\* Wiremap + Admin Conflicts + Merge Plan â€” Navigation wiremap (46 pages, 12 orphans), admin conflict matrix (6 pairs), admin-semanal script loading fix (defer), merge plan admin-semanal â†’ balance-semanal

---

## 1. Capa Activa

> Referencia: [`ROADMAP.md`](ROADMAP.md) â€” 4 capas por dependencia tÃ©cnica.

- **Capa activa:** Capa 3 â€” IntegraciÃ³n + Polish (En cierre)
- **Capa 0 (Seguridad):** âœ… Completada â€” CSP expanded + RLS P0+P1 refined (19 tablas: cash, bar, QR, GBOL, config, replenishment)
- **Capa 1 (ModularizaciÃ³n CSS):** âœ… Completada â€” 5 archivos modulares + theme-swiss.css
- **Capa 2 (Tokens + Layout):** âœ… Completada â€” GS compliance avg 59â†’81, 32/45 pÃ¡ginas compliant
- **Siguiente capa:** Capa 4 â€” UX/DX (JSDoc & E2E Expansion)

## 2. Stack TecnolÃ³gico

| Capa     | TecnologÃ­a                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | HTML estÃ¡tico + Vanilla JS (ES modules)                                                                                                        |
| Estilos  | CSS modular: `tokens.css` + 5 modulares (`base`, `layout`, `components`, `forms`, `utilities`) + `theme-swiss.css` (opt-in) + 16 page-specific |
| Backend  | Supabase (Auth, Postgres 65 tablas, 27 vistas, 38 RPCs, Edge Functions)                                                                        |
| Tooling  | Node.js (audits) + PowerShell (scans, watchdogs, verificaciÃ³n) + Playwright (E2E)                                                              |
| Hosting  | EstÃ¡tico (sin bundler, sin framework)                                                                                                          |

## 3. Estructura del Repositorio

```text
tester_3.0/
â”œâ”€â”€ pages/          46 HTML (7 mÃ³dulos: admin, encargados, operativo, logÃ­stica, staff, gerencia, prototypes)
â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ css/        tokens.css + 5 modulares (base/layout/components/forms/utilities) + theme-swiss.css (opt-in) + 15 page-specific
â”‚   â””â”€â”€ js/
â”‚       â”œâ”€â”€ core/   21 mÃ³dulos (auth, config, router, utils, supabase-client)
â”‚       â”œâ”€â”€ modules/ 41 mÃ³dulos de negocio
â”‚       â””â”€â”€ importers/ 6 importadores (GBOL, AFIP, Passline)
â”œâ”€â”€ scripts/        27 files (22 scripts + 5 docs/data)
â”œâ”€â”€ docs/           _router.md â†’ 00-source-of-truth/ 01-design-system/ 02-ui-ux/ 03-business-logic/ 04-operations/ 80-ephemeral/
â”œâ”€â”€ supabase/       28 migraciones + 1 edge function
â”œâ”€â”€ .agent/         4 agentes, 16 workflows, 22 skills (component-builder absorbida â†’ css-architect v3.0)
â””â”€â”€ tests/          8 subdirs: sql/ audits/ scanners/ watchdogs/ runners/ collectors/ fixtures/ e2e/ (12 specs, 214 tests)
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
| Triggers          | 8     | Auto-cÃ¡lculos, validaciones, propagaciÃ³n                                                        |

### Workday State Machine

`DRAFT` â†’(rpc_confirm)â†’ `PLANNED` â†’(rpc_open)â†’ `ACTIVE` â†’(rpc_close)â†’ `CLOSED` Â· `PLANNED` â†’(rpc_revert)â†’ `DRAFT`

## 5. Roles y Pantallas (12 roles Ã— 45 pantallas)

| Rol       | Sub-roles                                                       | Pantallas | Acceso                                    |
| --------- | --------------------------------------------------------------- | --------- | ----------------------------------------- |
| Admin     | `admin`                                                         | 20+       | Acceso total                              |
| Contable  | `contable`                                                      | 12        | Compartidas con admin (read)              |
| Gerente   | `gerente`                                                       | 1         | `balance-semanal`                         |
| Operativo | `operativo`, `staff_operativo`                                  | 9         | ERP + Scanner                             |
| LogÃ­stico | `logistico`                                                     | 5+3       | Stock + distribuciÃ³n                      |
| Encargado | `enc_barra`, `enc_caja`, `enc_limpieza`, `enc_seguridad`        | 7         | Cierre nocturno                           |
| Staff     | `staff_barra`, `staff_caja`, `staff_guardia`, `staff_seguridad` | 2-3       | POS terminal                              |
| Manager   | `manager`                                                       | 1         | QR monitor                                |
| Member    | (sin rol explÃ­cito)                                             | 0         | Migrado a `midnightclub` (pÃ¡gina pÃºblica) |

> **Nota:** 6 roles sin pantalla propia: `enc_limpieza`, `enc_seguridad`, `staff_guardia`, `staff_seguridad`, `gerente` (1), `manager` (1).

## 6. MÃ©tricas Vivas

| MÃ©trica              | Valor                                                               |
| -------------------- | ------------------------------------------------------------------- |
| Pantallas operativas | 46 (my-qr migrado a midnightclub)                                   |
| Tablas BD            | 65                                                                  |
| Vistas SQL           | 27                                                                  |
| MÃ³dulos JS           | 41 + 21 core + 6 importers = 68 (my-qr.js migrado)                  |
| Archivos CSS         | 23 (5 modulares + 1 theme-swiss opt-in + 15 page-specific + tokens) |
| Migraciones SQL      | 28                                                                  |
| Members registrados  | 2,245                                                               |
| SKUs activos         | 26                                                                  |
| Recetas              | 93                                                                  |
| Proveedores          | 47                                                                  |
| Profiles (users)     | 4                                                                   |

## 7. Completado (Done)

_El agente lee esto para no replanificar trabajo existente._

- [x] AuditorÃ­a de seguridad completa â†’ `Seguridad_Arquitectura.md` (eliminado en reestructuraciÃ³n docs)
- [x] Review del plan de blindaje â†’ `Plan_Blindaje_Review.md` (eliminado en reestructuraciÃ³n docs)
- [x] Wire map de agentes â†’ `Wire_Map_Agentes.md` (eliminado en reestructuraciÃ³n docs)
- [x] ROADMAP reescrito por dependencias tÃ©cnicas â†’ [`ROADMAP.md`](ROADMAP.md)
- [x] AuditorÃ­a de fragilidad CSS â†’ `AuditorÃ­a de Fragilidad y Scope.md` (eliminado en reestructuraciÃ³n docs)
- [x] Script de aplanamiento CSS descartado (solo 2 `#id` reales, regex destructivo)
- [x] Encargados identificados como sandbox de bajo riesgo
- [x] Onboarding e indexado recursivo completo (2026-02-20)
- [x] **T1 Body hide** en `guardOrRedirect` â€” `auth.js` oculta body hasta validar session+rol
- [x] **T3 Deprecar `index.html`** â€” redirect a `login.html` (no a admin)
- [x] **T4 CSP meta tag** piloto en `login.html` (script-src, connect-src, frame-src none)
- [x] **T5 CSS drift report** â€” cruce scanner UI (44 pÃ¡ginas) + CLI â†’ [`css-drift-report.md`](docs/04-operations/testing/observations/css-drift-report.md)
- [x] **CorrecciÃ³n diagnÃ³stico RLS**: 68/68 tablas con RLS + 113 policies (no 6/65 como decÃ­a la auditorÃ­a)
- [x] Scanner UI ejecutado en 44 pÃ¡ginas â†’ avg 59% GS compliance (compliance-matrix eliminado en reestructuraciÃ³n docs)
- [x] **ConsolidaciÃ³n docs DS** â€” 30+ archivos dispersos â†’ `docs/01-design-system/` unificado (6 vigentes, 7 prompts, 4 reports, 5 archive). Vaciados `_generated/frontend/` y `_generated/orchestrator/`
- [x] **AuditorÃ­a colisiones CSS** â€” 112 clases duplicadas entre `swiss-style.css` y `components.css`. `swiss-style.css` cargado por 0 pÃ¡ginas producciÃ³n (solo `visual.html` demo). Bloque legacy contaminado identificado (L786-855)
- [x] **ConsolidaciÃ³n skills** â€” `component-builder` absorbida en `css-architect` v3.0. 4 workflows actualizados.
- [x] **Limpieza docs UI-UX** â€” `canva_layout...` movido a `docs/01-design-system/canva_layout_fm_4.md`. `practicas.md` (vacÃ­o) eliminado.
- [x] **ModularizaciÃ³n CSS** â€” `components.css` (7820L) â†’ 5 archivos: `base.css` (120L), `layout.css` (362L), `components.css` (6797L), `forms.css` (321L), `utilities.css` (200L). 42 pÃ¡ginas HTML actualizadas.
- [x] **ResoluciÃ³n colisiones Swiss** â€” `swiss-style.css` (1325L) â†’ `theme-swiss.css` (774L). 551 lÃ­neas duplicadas eliminadas. Archivo original renombrado a `.bak`.
- [x] **Scanner GS alineado** â€” `ui-component-scanner.ps1` ajustado a arquitectura modular CSS + CustomDropdowns JS. Relevancia contextual + registry trimmed a clases core. Score avg 59â†’76 (+17pts), pÃ¡ginas compliant 4â†’25 (6Ã—).
- [x] **GS Batch 2 remediation** â€” 4 pÃ¡ginas: `balance-semanal` (H1â†’H2, actions-bar, is-header, cell-pad), `encargado-barra-personal` (page-card, btn prefix, modal-title), `encargado-caja-noche` (btn GS classes), `encargado-caja-personal` (tab-content, modal-title, btn prefix). Compliant 25â†’27.
- [x] **GS Batch 3 remediation** â€” 3 pÃ¡ginas: `operativo-analisis` (actions-bar, tab-contentÃ—3, chart-section), `encargado-caja-noche` (dashboard-header/title), `encargado-caja-personal` (dashboard-header/title). Compliant 27â†’30.
- [x] **Scanner relevancia v2** â€” 10 reglas contextuales: Nav/Buttons/Forms/FilterBar excluyen launchers, Sidebar requiere `sidebar-*` classes, Panels usa exact GS class match (no regex), Stats usa `^stat[-s]`, zero-denominator â†’ N/A. 5 launchers correctamente excluidos.
- [x] **GS Batch 4+5 remediation** â€” `operativo-workday` (actions-bar, cell-pad). Scanner fixes generaron mejoras indirectas: `generator` 72â†’94, `admin-workdays` 78â†’86, `encargado-barra-personal` 81â†’90. **Score avg 59â†’81 (+22pts), compliant 2â†’32 (16Ã—).**
- [x] **DT-01: scanner.js auth guard** â€” Restaurado `guardOrRedirect`, eliminado mock user, profile conectado a DB real
- [x] **Track 1: Security + Cleanup** â€” CSP expandida en 46/46 pÃ¡ginas (script `inject-csp.js` mejorado con update mode, fallback head, excluye dirs, escanea root), archivos `.bak` movidos a `.archive/`, IDs `#payModal` y `#btn-view-all-requests` aplanados a clases en CSS, audit CSS con 0 errores (3 fixes aplicados).
- [x] **MigraciÃ³n Member QR** â€” `my-qr.js` + `my-qr.html` eliminados de ERP, lÃ³gica vive en `midnightclub/members-only.js`. Edge function `generate-member-qr` v9 fix (`'open'`â†’`'ACTIVE'`)
- [x] **Deuda tÃ©cnica audit** â€” 18 Ã­tems documentados (3 crÃ­ticos, 4 altos, 7 medios, 4 bajos). Reporte en brain artifacts.
- [x] **Orchestrator workflow** â€” `.agent/workflows/orchestrate.md` creado. Modo planificaciÃ³n invocable con `/orchestrate`
- [x] **Skills-First rule** â€” Agregada a `GEMINI.md` Â§4 FilosofÃ­a de IngenierÃ­a
- [x] **Playwright E2E setup** â€” 9 test specs (234 tests), 4 proyectos (setup/smoke/auth/authenticated). Cobertura: 46 pÃ¡ginas Ã— 3 health checks + 9 pÃ¡ginas a11y + 14 pÃ¡ginas forms. 214 pass, 20 bugs encontrados. Agregado `role-navigation.spec.js` con 20 tests nuevos.
- [x] **ðŸŽ¨ TRACK 2 â€” Visual Polish** â€” ImplementaciÃ³n de sombras multinivel SaaS (5 niveles: xs/sm/md/lg/xl + card/modal/dropdown en `tokens.css`) y micro-interacciones. `.page-card` con hover lifting y card-shadow. `dialog.modal` con modal-shadow y animaciÃ³n `modal-enter` 200ms. `.btn-primary` con hover transform (translateY) y shadow-sm. Dropdowns unificados con `dropdown-shadow`. Keyframes centralizados en `base.css`.
- [x] **ðŸ“š Documentation Sprint (JSDoc)** â€” JSDoc agregado en 7 core files (`auth.js`, `utils.js`, `config.js`, `supabase-client.js`, `navigation.js`, `work-day-helper.js`, `custom-dropdown.js`).
- [x] **ðŸ—ºï¸ Wiremap Navigation** â€” Mapa completo de navegaciÃ³n: 7 launchers, 46 pÃ¡ginas, 9 roles, roleâ†’landing routing. 12 pÃ¡ginas orphan identificadas (5 masters, 3 QR suite, 4 otros). Wiremap actual + ideal generados en Stitch.
- [x] **ðŸ” Admin Conflicts Matrix** â€” AnÃ¡lisis de 6 pares de pÃ¡ginas admin potencialmente conflictivas. 1 conflicto real (`admin-master-proveedores` vs `operativo-master-proveedores`), 1 naming/scope issue (`admin-semanal` vs `balance-semanal`), 4 complementarios.
- [x] **ðŸ”§ Fix admin-semanal.html** â€” Script loading race condition corregida: 5 core scripts + module script sin `defer` â†’ Supabase SDK no disponible â†’ auth guard falla â†’ redirect. Agregado `defer` a todos + `work-day-helper.js` faltante. Verificado: pÃ¡gina renderiza correctamente.
- [x] **ðŸ“‹ Merge Plan: admin-semanal â†’ balance-semanal** â€” Reporte de situaciÃ³n + plan propuesto. balance-semanal (dashboard analÃ­tico: tabla multi-semana + KPIs + Chart.js + CSV) absorbe freeze de admin-semanal (cierre operativo). 3 archivos a eliminar post-merge.

## 8. Pendiente (To Do)

_Trabajo que el agente debe estructurar y delegar, en orden de dependencia._

### Capa 0 â€” Seguridad Core (completada)

- [x] ~~`index.html` â€” redirect a admin sin auth~~ â†’ Deprecado, redirige a `login.html`
- [x] ~~RLS masivo~~ â†’ Ya habilitado en 68/68 tablas con 113 policies (corregido diagnÃ³stico)
- [x] ~~CSP~~ â†’ Meta tag piloto en `login.html`
- [x] ~~Descomentar `guardOrRedirect` en `scanner.js`~~ â†’ âœ… Restaurado + mock user eliminado (2026-02-21)
- [x] Expandir CSP a las demÃ¡s pÃ¡ginas (post-piloto)
- [ ] Refinar policies RLS genÃ©ricas (`authenticated` sin filtro de rol) en ~20 tablas

### âœ… MigraciÃ³n CSS â€” ModularizaciÃ³n (completada)

- [x] **Modularizar `components.css` (7820L)** â†’ 5 archivos modulares
- [x] Resolver 139 colisiones Swiss vs Zinc â†’ `theme-swiss.css` (opt-in layer)
- [x] Eliminar bloque legacy contaminado en `swiss-style.css`
- [x] Actualizar `<link>` en 42 pÃ¡ginas HTML
- [x] `swiss-style.css` â†’ `swiss-style.css.bak`

### âœ… Capa 1 â€” Tokens (completada)

- [x] Consolidar token aliases duplicados â€” 14 pares documentados con migration registry
- [x] Consolidar spacing: semÃ¡ntico (canonical) + numÃ©rico (retrocompat aliases)
- [x] Agregar `--space-3: 12px` (hueco)
- [x] Eliminar legacy Aurora (0 usos)
- [x] Crear `docs/01-design-system/master-design-spec.md`
- [x] Remediar GS compliance â€” scanner alineado a arquitectura actual, 41 prompts regenerados (score avg 59â†’63)
- [x] **GS Batch 1 remediation** â€” 4 encargado pages fixed: `form-label` on 20+ labels, breadcrumb nav on `caja-noche`, `cell-pad` on table headers. `encargado-caja-noche` +12pts (46â†’58). Verified operativo/staff/logistica modules already GS-compliant.

### âœ… Capa 2 â€” Tokens + Layout + GS Compliance (completada)

- [x] Tokens: aliases consolidados, spacing semÃ¡ntico + numÃ©rico, `--space-3: 12px`, Aurora legacy eliminado
- [x] Layout: `page-shell` responsive, `planner-layout` stacking, CustomDropdowns transversal (21 pÃ¡ginas)
- [x] **GS Compliance global** â€” Score avg 59â†’81 (+22pts), 32/45 pÃ¡ginas compliant (â‰¥80). 7 pÃ¡ginas HTML remediadas, scanner con 10 reglas de relevancia contextual. 5 launchers â†’ N/A, 4 parciales restantes (prototipos/scanner), 4 crÃ­ticos (test pages).

### Capa 3+ â€” Ver ROADMAP.md

## 9. Decisiones Pendientes

_Requieren input del usuario antes de implementar._

| DecisiÃ³n            | Opciones                                                                                                                              | Estado                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| RLS por rol         | A) Custom claims vs B) Sub-select a `profiles` â€” B ya estÃ¡ implementado en producciÃ³n con `has_role()`, `is_admin()`, `get_my_role()` | âœ… Resuelto (sub-select)      |
| Body hide post-auth | A) Centralizar en `auth.js` vs B) Por mÃ³dulo                                                                                          | âœ… Resuelto (A: centralizado) |

## 10. Bloqueos

_InformaciÃ³n crÃ­tica que el agente debe tener en cuenta._

- ~~**`index.html`** redirige a admin sin verificar sesiÃ³n~~ â†’ âœ… Deprecado
- ~~**`scanner.js`** tiene guard comentado~~ â†’ âœ… Auth guard restaurado (2026-02-21)
- **~20 tablas** con policies genÃ©ricas `authenticated` sin filtro de rol (aceptable con 4 users, mejorar en siguiente sprint)
- ~~**CSS/Layout** â†’ 112 colisiones Swissâ†”Zinc~~ â†’ âœ… Resuelto. `theme-swiss.css` como opt-in layer
- ~~**`swiss-style.css`** â†’ 1325L~~ â†’ âœ… Reemplazado por `theme-swiss.css` (774L). Original en `.bak`
- **`docs/01-design-system/`** â†’ Consolidado âœ… â€” ver `truth.md`, `audit.md`, `MASTER.md`

## 11. Observaciones de Testing (Sprint 0)

### Seguridad â€” 7 hallazgos (archivo `Seguridad_Arquitectura.md` eliminado en reestructuraciÃ³n docs)

| #   | Hallazgo                                                       | Sev. | Estado                                       |
| --- | -------------------------------------------------------------- | ---- | -------------------------------------------- |
| 1   | ANON_KEY + EmailJS keys en `config.js` (pÃºblico, requiere RLS) | ðŸ”´   | Mitigado (RLS 68/68)                         |
| 2   | `index.html` redirige a admin sin verificar sesiÃ³n             | ðŸ”´   | âœ… Resuelto (T3)                             |
| 3   | Auth 100% client-side, sin refuerzo server-side                | ðŸ”´   | Mitigado (body hide T1 + RLS)                |
| 4   | RLS en solo ~6/65 tablas                                       | ðŸ”´   | âœ… **Dato errÃ³neo** â€” 68/68 con 113 policies |
| 5   | Policies genÃ©ricas `authenticated` sin filtro por rol          | ðŸŸ¡   | ~20 tablas pendientes                        |
| 6   | Guard comentado en `scanner.js`                                | ðŸŸ¡   | âœ… Restaurado (2026-02-21)                   |
| 7   | Sin CSP ni security headers                                    | ðŸŸ¡   | âœ… CSP piloto en `login.html` (T4)           |

### Plan de Blindaje â€” 5 correcciones (archivo `Plan_Blindaje_Review.md` eliminado en reestructuraciÃ³n docs)

| #   | Error en el plan                                    | CorrecciÃ³n                                         |
| --- | --------------------------------------------------- | -------------------------------------------------- |
| 1   | `app_metadata.role` no existe                       | Rol vive en `profiles`, usar `Auth.getMyProfile()` |
| 2   | `auth.jwt() ->> 'role'` retorna `authenticated`     | Custom claims o sub-select a `profiles`            |
| 3   | RLS sin policies de escritura bloquea operaciÃ³n     | Set completo S/I/U/D por tabla                     |
| 4   | Guard afecta solo `scanner.js`                      | Descomentar solo ese archivo                       |
| 5   | CSP incluye `tailwindcss.com`, omite `jsdelivr.net` | Alinear al stack real                              |

### Fragilidad CSS â€” 5 hallazgos (archivo `AuditorÃ­a de Fragilidad y Scope.md` eliminado en reestructuraciÃ³n docs)

> [!NOTE]
> El drift report actualizado (`css-drift-report.md`) corrige estos datos con evidencia real del CLI.

| #   | Hallazgo                  | Dato original                                | Dato corregido (CLI)                                                             |
| --- | ------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Barrera de especificidad  | 142 `!important`, 89 `#id` en admin CSS      | **2 `!important`**, 3 `#id` (solo QR print)                                      |
| 2   | Design drift              | MÃ³dulos redefinen tokens en `:root` local    | Solo `swiss-style.css` redefine `:root` (esperado)                               |
| 3   | Acoplamiento JS-CSS       | 312 selectores de presentaciÃ³n como hooks JS | Hooks son clases de **estado** (`hidden`, `active`, `is-open`) â€” patrÃ³n correcto |
| 4   | Riesgo regresiÃ³n por poda | JS se rompe si se poda CSS sin hooks `js-`   | Bajo riesgo â€” no hay clases de estilo en hooks JS                                |
| 5   | Inconsistencia fiscal     | SQL y JS pueden divergir en IVA/comisiones   | Sin cambios                                                                      |

### Wire Map de Agentes â€” 47 nodos (archivo `Wire_Map_Agentes.md` eliminado en reestructuraciÃ³n docs)

- 41 OK Â· 6 skills huÃ©rfanas (sin auto-invoke) Â· 3 docs agents desconectados del router

### E2E Testing â€” 214 tests (Playwright) â†’ `tests/e2e/report/`

> **Ãšltima corrida:** 121/127 health-scan passed en 5.4 min (2026-02-22). 6 failures son pre-existentes (JS crash en test-devenciones, console.error SlidePanel en logÃ­stica-seguimiento).

| #   | Bug                                               | Sev.     | PÃ¡ginas afectadas                                                              |
| --- | ------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| 1   | ~~JS crash: `assertSbOrShowBlockingError` undef~~ | ~~ðŸ”´~~âœ… | ~~QR Monitor~~ â€” `utils.js` agregado                                           |
| 2   | ~~404: `admin-portal.js` no existe~~              | ~~ðŸ”´~~âœ… | ~~admin-index~~ â€” renombrado a `admin-index.js`                                |
| 3   | ~~ID duplicado `staff-active`~~                   | ~~ðŸ”´~~âœ… | ~~admin-master-nomina~~ â€” checkbox â†’ `staff-is-active`                         |
| 4   | ~~Selects sin placeholder (73 instancias)~~       | ~~ðŸŸ¡~~âœ… | pagos (4 HTML fixed), config/pagos/solicitudes (11 JS templates + aria-labels) |
| 5   | ~~Inputs `required` sin indicador visual (12)~~   | ~~ðŸŸ¡~~âœ… | pagos (5 labels con `*`)                                                       |
| 6   | ~~Inputs sin `<label>` ni `aria-label` (11)~~     | ~~ðŸŸ¡~~âœ… | workdays, stock, config.js, pagos.js, solicitudes.js (aria-labels agregados)   |
| 7   | ~~Headings saltan niveles h2â†’h4~~                 | ~~ðŸŸ¡~~âœ… | pagos, stock, workdays, logÃ­stica-seguimiento (h4â†’h3). **0 h4 tags quedan.**   |

## 12. Gaps Cross-Rol

### ðŸ”´ CrÃ­ticos

1. **Arqueo ciego Staff** â€” Staff no deberÃ­a ver totales del sistema. No implementado.
1. **AprobaciÃ³n solicitudes Encargado** â€” Sin pantalla dedicada.
1. **Audit trail** â€” 8 auditorÃ­as de GBol no existen en FM4.

### ðŸŸ¡ Importantes

1. Vista unificada Contable
1. Alertas stock bajo real-time
1. Roles fantasma sin pantalla
1. Historial rendimiento Staff
1. Flujo bidireccional LogÃ­sticoâ†”Operativo

## 13. Source of Truth â€” Contrato

| Regla                | DescripciÃ³n                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 â€” Verify First    | Cruzar datos contra source-of-truth antes de actuar. CÃ³digo > doc si hay conflicto.                                                                                                                                                                                                                                                                                                   |
| R2 â€” No Create       | Prohibido crear archivos en `docs/00-source-of-truth/`. Solo editar.                                                                                                                                                                                                                                                                                                                     |
| R3 â€” Freshness Check | Si doc >7 dÃ­as sin update y hay drift, notificar.                                                                                                                                                                                                                                                                                                                                     |
| R4 â€” Cross-Reference | [`scheme.md`](docs/00-source-of-truth/db-schema.md) para tablas, [`backend-architecture.md`](docs/00-source-of-truth/backend-rpcs.md) para RPCs, [`screen-map.md`](docs/00-source-of-truth/project-status.md) para pantallasÃ—roles, [`user-flows-by-role.md`](docs/00-source-of-truth/project-status.md) para flujos, [`state.md`](state.md) para mÃ©tricas (reemplaza `estado-presente.md`). |

> **`docs/80-ephemeral/agent-logs/`** â€” `frontend/` y `orchestrator/` vaciados (solo `.gitkeep`). Contenido consolidado en `docs/01-design-system/`.
> **`docs/80-ephemeral/agent-logs/logic/`** estÃ¡ vacÃ­o (solo `.gitkeep`). No se ha generado documentaciÃ³n de lÃ³gica.

## 14. TDD Night Simulation â€” Bugs Encontrados (2026-02-22)

### BUG-001: `rpc_preflight_close_workday` â€” columna inexistente

- **LÃ­nea:** ~171 del PL/pgSQL
- **Error:** `column "amount" does not exist` en `staff_accruals`
- **Fix:** Cambiar `amount` â†’ `base_amount` y `adjustment` â†’ `adjustments`
- **Impacto:** Preflight siempre crashea si hay accruals â†’ bloquea cierre
- **Estado:** âœ… Corregido (migration `fix_rpc_bugs_001_002_003`)

### BUG-002: `rpc_close_work_day` â€” case mismatch en `cash_closings.status`

- **LÃ­nea:** ~63 del PL/pgSQL
- **Error:** Escribe `'CLOSED'` (uppercase) pero CHECK solo permite `'open','closed'` (lowercase)
- **Fix:** Cambiar `status = 'CLOSED'` â†’ `status = 'closed'`
- **Impacto:** No se puede cerrar workday con `p_cash_closing_id` (workaround: pasar NULL)
- **Estado:** âœ… Corregido (migration `fix_rpc_bugs_001_002_003`)

### Nota: Workday 2026-02-01 cerrado

Workday `3719f8a9` (2026-02-01) estaba en ACTIVE sin operaciones. Cerrado durante simulaciÃ³n TDD (health_score=40).

### BUG-003: `rpc_revert_work_day` â€” columna `updated_at` inexistente (TDD #2)

- **LÃ­nea:** ~10 del PL/pgSQL
- **Error:** `column "updated_at" of relation "work_days" does not exist`
- **Fix:** Remover `updated_at = now()` del UPDATE (la tabla no tiene esa columna)
- **Impacto:** No se puede revertir un workday de PLANNED â†’ DRAFT
- **Estado:** âœ… Corregido (migration `fix_rpc_bugs_001_002_003`)

### BUG-004: `rpc_preflight_close_workday` â€” columna `work_date` inexistente en `import_gbol_facturacion`

- **LÃ­nea:** ~165 del PL/pgSQL (CHECK 6: GBOL)
- **Error:** Referencia `work_date` en `import_gbol_facturacion` (la columna real es `noche`)
- **Fix:** Cambiar `work_date` â†’ `noche` (ambos type `date`, comparaciÃ³n directa)
- **Impacto:** Preflight siempre crasheaba en CHECK 6
- **Estado:** âœ… Corregido (migration `fix_rpc_preflight_bug_004`)

### BUG-005: `rpc_distribute_stock` â€” NULL stock_actual crash

- **LÃ­nea:** ~64 del PL/pgSQL
- **Error:** `UPDATE inventory_stock SET stock_actual = stock_actual - qty` falla si `stock_actual` es NULL
- **Fix:** Usar `COALESCE(stock_actual, 0) - qty` o INSERT ON CONFLICT
- **Impacto:** No se puede distribuir stock si el SKU no tiene stock_actual inicializado
- **Estado:** âœ… Corregido (migration `fix_rpc_distribute_stock_bug_005`)

### BUG-006: Encargado Personal Pages â€” Topbar + Page States no-GS

- **PÃ¡ginas:** `encargado-barra-personal.html`, `encargado-caja-personal.html`
- **Error 1:** barra usaba IDs no-GS (`pageLoading`, `pageEmpty`, `pageContent`) sin clases CSS requeridas â†’ pantalla en blanco
- **Error 2:** Topbar tenÃ­a `<button>â†</button>` + `workday-status` pill nunca actualizada â†’ chip confuso
- **Fix:** HTML estandarizado a GS (`page-card-loading`, `page-card-empty`, `module-content`), topbar breadcrumb-only, JS DOM refs alineados
- **Estado:** âœ… Corregido

---

### AUDIT-001: EjecuciÃ³n Prompts B/C/D â€” Error Handling, UX Consistency, UI/Markup

**Fecha:** 2026-02-22  
**MÃ©todo:** EjecuciÃ³n directa de 3 prompts de auditorÃ­a generados previamente

#### Prompt B â€” Error Handling & Safety (5 archivos JS)

| Fix     | Archivo              | Cambio                                              |
| ------- | -------------------- | --------------------------------------------------- |
| B1A     | `admin-semanal.js`   | Silent catch â†’ `Toast.error()`                      |
| B1B+B3A | `qr-monitor.js`      | `isFetching` guard + Toast + `beforeunload` cleanup |
| B1D     | `scanner.js`         | Fire-and-forget insert â†’ `await` + error log        |
| B3B     | `admin-index.js`     | 2 intervals â†’ stored + `beforeunload` cleanup       |
| B3C     | `operativo-index.js` | 1 interval â†’ stored + `beforeunload` cleanup        |

**False positives descartados:** admin-pagos listener leaks (innerHTML destruye DOM), scanner null checks (ya existen L187), balance-semanal.js (no existe)

#### Prompt C â€” UX Consistency (10 archivos JS)

| Fix | Archivos                                                                                                                                        | Cambio                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| C2  | `admin-index.js`, `operativo-index.js`, `logistica-index.js`                                                                                    | `window.confirm` â†’ `Utils.confirmModal`               |
| C4  | `operativo-master-sku.js`, `admin-pagos.js` (Ã—2), `admin-master-tarifario.js`, `scanner.js`, `qr-dashboard.js`, `encargado-barra-noche.js` (Ã—2) | `toLocaleString()`/`toLocaleTimeString()` â†’ `'es-AR'` |
| C3  | `qr-generator.js`                                                                                                                               | Revisado â€” post-print reload es reset legÃ­timo        |

#### Prompt D â€” UI/Markup (13 archivos HTML + 1 CSS)

| Fix | Archivos                                                                                                                                                                                               | Cambio                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| D1  | `admin-semanal.html`                                                                                                                                                                                   | 7 chars corruptos (Â¢/Â£/??) â†’ UTF-8 correcto                              |
| D3  | 12 HTMLs (admin: central-stock, solicitudes, reportes, pagos, master-nomina, config; operativo: master-sku, analisis, cms-members, solicitudes; encargados: caja-personal, caja-noche, barra-personal) | ~20 buttons `type="button"` aÃ±adido                                      |
| D2  | `layout.css`                                                                                                                                                                                           | Z-index auditado â€” jerarquÃ­a OK (topbar:100, overlay:999, dropdown:1000) |
| D4  | `layout.css`                                                                                                                                                                                           | `!important` revisado â€” overrides de especificidad legÃ­timos             |

#### Smoke Tests â€” âœ… Todo verde

- **JS Syntax** (`node --check`): 11/11 archivos OK, exit code 0
- **HTML Encoding** (fetch): 6/6 pÃ¡ginas muestran "AdministraciÃ³n" y "Cerrar SesiÃ³n" con UTF-8 correcto
