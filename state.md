# **Estado del Proyecto: Tester 3.0 — Midnight Club**

**Última Actualización:** 2026-02-22T17:41:00-03:00

**Método:** Lighthouse Audit Pipeline — 13/13 reports generados (Lighthouse v13 CLI + chrome-launcher + puppeteer auth), cross-audit matrix, console errors collector (Playwright)

## **1\. Capa Activa**

Referencia: [ROADMAP.md](https://www.google.com/search?q=ROADMAP.md) — 4 capas por dependencia técnica.

- **Capa activa:** Capa 3 — Integración \+ Polish (En cierre)
- **Capa 0 (Seguridad):** ✅ Completada — CSP expanded \+ RLS P0+P1 refined (19 tablas: cash, bar, QR, GBOL, config, replenishment)
- **Capa 1 (Modularización CSS):** ✅ Completada — 5 archivos modulares \+ theme-swiss.css
- **Capa 2 (Tokens \+ Layout):** ✅ Completada — GS compliance avg 59→81, 32/45 páginas compliant
- **Siguiente capa:** Capa 4 — UX/DX (JSDoc & E2E Expansion)

## **2\. Stack Tecnológico**

| Capa         | Tecnología                                                                                                                          |
| :----------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | HTML estático \+ Vanilla JS (ES modules)                                                                                            |
| **Estilos**  | CSS modular: tokens.css \+ 5 modulares (base, layout, components, forms, utilities) \+ theme-swiss.css (opt-in) \+ 16 page-specific |
| **Backend**  | Supabase (Auth, Postgres 65 tablas, 27 vistas, 38 RPCs, Edge Functions)                                                             |
| **Tooling**  | Node.js (audits) \+ PowerShell (scans, watchdogs, verificación) \+ Playwright (E2E)                                                 |
| **Hosting**  | Estático (sin bundler, sin framework)                                                                                               |

## **3\. Estructura del Repositorio**

tester_3.0/  
├── pages/ 46 HTML (7 módulos: admin, encargados, operativo, logística, staff, gerencia, prototypes)  
├── assets/  
│ ├── css/ tokens.css \+ 5 modulares (base/layout/components/forms/utilities) \+ theme-swiss.css (opt-in) \+ 15 page-specific  
│ └── js/  
│ ├── core/ 21 módulos (auth, config, router, utils, supabase-client)  
│ ├── modules/ 41 módulos de negocio  
│ └── importers/ 6 importadores (GBOL, AFIP, Passline)  
├── scripts/ 27 files (22 scripts \+ 5 docs/data)  
├── docs/ \_router.md → 00-source-of-truth/ 01-design-system/ 02-ui-ux/ 03-business-logic/ 04-operations/ 80-ephemeral/  
├── supabase/ 28 migraciones \+ 1 edge function  
├── .agent/ 4 agentes, 16 workflows, 24 skills (component-builder absorbida → css-architect v3.0)  
└── tests/ 8 subdirs: sql/ audits/ scanners/ watchdogs/ runners/ collectors/ fixtures/ e2e/ (12 specs, 214 tests)

## **4\. Dominios de Negocio (Backend)**

### **Tablas por Dominio (65 total)**

| Dominio              | Tablas                                                                                                                                                          | Cant. |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---- |
| **Workday Core**     | work_days, work_day_staff_planning, work_day_templates, events                                                                                                  | 4     |
| **Cash Closing**     | cash_closings, closing_terminals, cash_movements, pos_terminals, pos_terminals_alias                                                                            | 5     |
| **Bar Operations**   | bar_sessions, bar_stock_snapshots, bar_session_sales                                                                                                            | 3     |
| **Replenishment**    | replenishment_requests, \_items, \_supplier_orders, \_receipts, \_receipt_items, \_tracking                                                                     | 6     |
| **Inventory**        | master_sku, master_categories, master_recipes, recipe_code_mappings, inventory_stock, \_movements, \_stock_adjustments, inventory_ideal                         | 8     |
| **Staff / Payroll**  | master_staff_roles, staff_convocations, staff_accruals, staff_functions, profile_functions, profiles                                                            | 6     |
| **Finance**          | finance_payments, \_payment_rules, \_opening_cost_defs, \_weekly_closings, cost_definitions, cost_config, accounts_payable, payment_categories, payment_methods | 9     |
| **Revenue / Fiscal** | revenue_reports, revenue_details, consumption_reports, consumption_details                                                                                      | 4     |
| **QR / Access**      | qr_batches, qr_codes, qr_checkins                                                                                                                               | 3     |
| **Members**          | members                                                                                                                                                         | 1     |
| **Auth / Config**    | auth_audit_log, audit_config, site_config, sku_change_requests                                                                                                  | 4     |
| **Menu**             | menu_categories, menu_items                                                                                                                                     | 2     |
| **Suppliers**        | master_proveedores                                                                                                                                              | 1     |
| **GBOL Import**      | import_gbol_facturacion, \_gbol_comandas, \_gbol_withdrawals, gbol_sync_log, import_logs                                                                        | 5     |
| **Staging**          | stg_afip_facturas, stg_extracciones, stg_gbol_items, stg_passline_tickets                                                                                       | 4     |

### **RPCs Clave (34 total)**

| Grupo                 | Cant. | RPCs principales                                                                          |
| :-------------------- | :---- | :---------------------------------------------------------------------------------------- |
| **Workday Lifecycle** | 8     | rpc_create_work_day, rpc_confirm, rpc_open, rpc_close, calculate_health_score             |
| **Payroll / Finance** | 7     | admin_generate_workday_accruals, admin_export_accruals_to_payments, admin_approve_payment |
| **Inventory**         | 2     | admin_bulk_set_stock, rpc_receive_supplier_order                                          |
| **Auth / Helpers**    | 6     | get_my_role, has_role, is_admin, verify_member_password                                   |
| **Triggers**          | 8     | Auto-cálculos, validaciones, propagación                                                  |

## **5\. Roles y Pantallas (12 roles × 45 pantallas)**

| Rol           | Sub-roles                                               | Pantallas | Acceso                           |
| :------------ | :------------------------------------------------------ | :-------- | :------------------------------- |
| **Admin**     | admin                                                   | 20+       | Acceso total                     |
| **Contable**  | contable                                                | 12        | Compartidas con admin (read)     |
| **Gerente**   | gerente                                                 | 1         | balance-semanal                  |
| **Operativo** | operativo, staff_operativo                              | 9         | ERP \+ Scanner                   |
| **Logístico** | logistico                                               | 5+3       | Stock \+ distribución            |
| **Encargado** | enc_barra, enc_caja, enc_limpieza, enc_seguridad        | 7         | Cierre nocturno                  |
| **Staff**     | staff_barra, staff_caja, staff_guardia, staff_seguridad | 2-3       | POS terminal                     |
| **Manager**   | manager                                                 | 1         | QR monitor                       |
| **Member**    | (sin rol explícito)                                     | 0         | Migrado a midnightclub (pública) |

## **6\. Métricas Vivas**

| Métrica                  | Valor                                                           |
| :----------------------- | :-------------------------------------------------------------- |
| **Pantallas operativas** | 46 (my-qr migrado a midnightclub)                               |
| **Tablas BD**            | 65                                                              |
| **Vistas SQL**           | 27                                                              |
| **Módulos JS**           | 68 (41 módulos \+ 21 core \+ 6 importers)                       |
| **Archivos CSS**         | 23 (5 modulares \+ 1 theme-swiss \+ 15 page-specific \+ tokens) |
| **Migraciones SQL**      | 28                                                              |
| **Members registrados**  | 2,245                                                           |
| **Profiles (users)**     | 4                                                               |

## **7\. Completado (Done)**

- \[x\] **Seguridad:** T1 Body hide en auth.js, T3 Deprecar index.html, T4 CSP meta tag global (46 páginas).
- \[x\] **Modularización CSS:** components.css dividido en base, layout, components, forms, utilities.
- \[x\] **GS Compliance:** Promedio GS subió de 59% a 81%. 32 de 45 páginas son ahora 100% compliant.
- \[x\] **Visual Polish:** Sombras SaaS multinivel, animaciones modal-enter, hover lifting en .page-card.
- \[x\] **E2E Playwright:** 214 tests aprobados. Cobertura en 46 páginas x 3 health checks.
- \[x\] **JSDoc:** Documentación de 7 archivos core (auth.js, supabase-client.js, etc.).
- \[x\] **Fix admin-semanal:** Corregida race condition de carga de scripts y redirección errónea.
- \[x\] **Lighthouse Audit Pipeline:** 13/13 pantallas admin auditadas. Scripts automatizados: `lighthouse-playwright.js`, `console-errors-collector.js`, `lighthouse-matrix.js`, `parse-report.js`. Cross-audit matrix y console errors report generados.
- \[x\] **Navigation Architecture Skill:** Auditoría completa de navegación. Skill `.agent/skills/navigation-architecture/` con reachability graph, diagnostic script, HTML patterns, design decisions. 7 errores factuales corregidos tras double-check. Identificados 7 orphaned pages (5 admin masters sin entry por ring roto, admin-config sin link, QR sin launcher entry).
- \[x\] **UX Researcher Skill (robustecida):** Reestructurada `.agent/skills/ux-researcher-designer/`. SKILL.md reducido 273→90 líneas (progressive disclosure). Script `persona_generator.py` reescrito con 6 personas FormulaMid (admin, operativo, logístico, encargado, staff, gerente) con pain points verificados contra codebase. 3 references nuevos: heuristic-checklist, ia-validation, verification-methods. Workflow TDD+UX integration agregado.

## **8\. Pendiente (To Do)**

### **Capa 0 — Seguridad Core**

- \[ \] Refinar policies RLS genéricas (authenticated sin filtro de rol) en \~20 tablas.

### **Capa 3+ — Integración y UX**

- \[ \] **Arqueo ciego Staff:** Ocultar totales esperados en terminales de barra y caja.
- \[ \] **Aprobación Encargado:** Pantalla para que el encargado valide solicitudes de stock.
- \[ \] **Audit trail GBOL:** Migrar las 8 auditorías de discrepancias faltantes de GBol.
- \[ \] **Vista Contable:** Consolidar reportes financieros en una sola vista de lectura.

### **Lighthouse Remediation**

- \[ \] **CSP script-src:** Agregar hashes de inline scripts o `'unsafe-inline'` (28 errores en 13 pantallas).
- \[ \] **CSP cdn.sheetjs.com:** Agregar dominio a `script-src` en admin-central-stock.
- \[ \] **color-contrast:** Corregir ratio de contraste (13 pantallas, 19 elementos).
- \[ \] **aria-input-field-name:** Agregar nombres accesibles a inputs ARIA (7 pantallas, 11 elementos).
- \[ \] **label:** Asociar labels a form elements (4 pantallas, 50 elementos).
- \[ \] **meta-description:** Agregar `<meta name="description">` a las 13 pantallas admin.

## **9\. Decisiones y Bloqueos**

- **Bloqueo RLS:** \~20 tablas permiten acceso a cualquier authenticated. Prioridad: Sprint 4\.
- **Bloqueo Flujo Logístico:** La transferencia bidireccional entre stock central y barras requiere lógica de "recepción" manual aún no implementada.

## **10\. Hallazgos E2E (Playwright) — 214 tests**

| \#  | Hallazgo                                     | Sev. | Estado                        |
| :-- | :------------------------------------------- | :--- | :---------------------------- |
| 1   | JS crash en QR Monitor por utils.js faltante | 🔴   | ✅ Corregido                  |
| 2   | 404 en admin-index por script mal nombrado   | 🔴   | ✅ Corregido                  |
| 4   | 73 instancias de Selects sin placeholder     | 🟡   | ✅ Corregido                  |
| 7   | Saltos de jerarquía en headings (h2→h4)      | 🟡   | ✅ Corregido (0 h4 restantes) |

## **11\. TDD Night Simulation — Bugs Corregidos (2026-02-22)**

### **BUG-001: Preflight Close Workday**

- **Error:** Columna amount inexistente en staff_accruals.
- **Fix:** Cambiado a base_amount y adjustments.

### **BUG-002: Case Mismatch en status**

- **Error:** SQL intentaba escribir 'CLOSED' pero el constraint solo permite 'closed'.
- **Fix:** Estandarización a lowercase en el RPC.

### **BUG-003: Revert Workday Crash**

- **Error:** Referencia a updated_at en tabla work_days (no existe).
- **Fix:** Eliminada la columna del UPDATE.

### **BUG-004: GBOL Preflight Check**

- **Error:** Referencia a work_date en lugar de noche en la tabla de facturación.
- **Fix:** Alineación con el esquema real.

### **BUG-005: Null Stock Crash**

- **Error:** La resta de stock fallaba si el valor era NULL.
- **Fix:** Implementado COALESCE(stock_actual, 0).

### **BUG-006: Encargado Personal Pages**

- **Error:** IDs no-GS en loaders (pageLoading vs page-card-loading) causaban pantallas blancas.
- **Fix:** Estandarización de HTML/JS a la arquitectura Zinc.

## **12\. AUDIT-001: Ejecución de Prompts de Calidad**

### **Prompt B — Error Handling & Safety**

- **QR Monitor:** Añadido isFetching guard y limpieza de intervalos en beforeunload.
- **Scanner:** Añadido await en inserts de escaneo para evitar fire-and-forget fallidos.

### **Prompt C — UX Consistency**

- **Modales:** Reemplazados todos los window.confirm por Utils.confirmModal personalizado.
- **Locales:** Forzado el formato 'es-AR' en todas las funciones de fecha y moneda (toLocaleString).

### **Prompt D — UI/Markup**

- **Encoding:** Corregidos caracteres corruptos en admin-semanal.html (UTF-8).
- **Buttons:** Añadido type="button" a \~20 botones para prevenir envíos de formularios accidentales.
- **Z-Index:** Auditada la jerarquía (Topbar: 100, Overlays: 999, Dropdowns: 1000).

## **13\. Source of Truth — Reglas**

- **R1:** El código siempre manda sobre la documentación.
- **R2:** Prohibido crear archivos en docs/00-source-of-truth/.
- **R4:** Usar db-schema.md y backend-rpcs.md como únicos contratos de datos.

## **14\. Lighthouse Audit Pipeline (2026-02-22)**

### **Score Grid (13/13 pantallas)**

| Pantalla                 | P      | A     | BP    | SEO   |
| :----------------------- | :----- | :---- | :---- | :---- |
| admin-index              | 🟢 100 | 🟢 95 | 🟢 92 | 🟢 90 |
| admin-central-stock      | 🟢 98  | 🟡 88 | 🟢 92 | 🟢 90 |
| admin-pagos              | 🟢 98  | 🟢 93 | 🟢 92 | 🟢 90 |
| admin-reportes           | 🟢 97  | 🟢 90 | 🟢 92 | 🟢 90 |
| admin-master-pos         | 🟢 94  | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-master-tarifario   | 🟢 94  | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-solicitudes        | 🟢 94  | 🟢 91 | 🟢 92 | 🟢 90 |
| admin-semanal            | 🟢 93  | 🟢 95 | 🟢 92 | 🟢 90 |
| admin-master-nomina      | 🟢 93  | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-workdays           | 🟢 90  | 🟡 88 | 🟢 92 | 🟢 90 |
| admin-master-categorias  | 🟡 89  | 🟢 95 | 🟢 92 | 🟢 90 |
| admin-config             | 🟡 88  | 🟢 92 | 🟢 92 | 🟢 90 |
| admin-master-proveedores | 🟡 86  | 🟢 92 | 🟢 92 | 🟢 90 |

### **Console Errors (30 total → remediado)**

| Patrón                        | Cant. | Pantallas           | Estado                               |
| :---------------------------- | :---- | :------------------ | :----------------------------------- |
| CSP inline script violation   | 28    | Todas (13)          | ✅ Remediado (CSP actualizada 46pp)  |
| SheetJS CDN bloqueado por CSP | 2     | admin-central-stock | ✅ Remediado (cdn.sheetjs.com added) |

### **Top Remediación (por prioridad)**

| #   | Issue                          | Peso | Pantallas                        |
| :-- | :----------------------------- | :--- | :------------------------------- |
| 1   | LCP (Largest Contentful Paint) | 300  | 12                               |
| 2   | Speed Index                    | 110  | 11                               |
| 3   | FCP (First Contentful Paint)   | 100  | 10                               |
| 4   | Color contrast ratio           | 91   | 0 (was 13, remediado tokens.css) |
| 5   | ARIA input field names         | 49   | 0 (was 7, remediado 45 labels)   |
| 6   | Form labels                    | 40   | 0 (was 4, remediado con ARIA)    |
| 7   | Meta description faltante      | 13   | 1 (was 13, remediado 12/12)      |

### **Scripts creados**

- `scripts/lighthouse-playwright.js` — Runner Lighthouse v13 CLI con auth automática
- `scripts/console-errors-collector.js` — Collector de errores de consola (Playwright)
- `scripts/lighthouse-matrix.js` — Generador de cross-audit matrix
- `docs/02-ui-ux/lighthouse/parse-report.js` — Parser individual report → summary.md

**Estado del Sistema:** 🟢 Operativo y Verificado.
