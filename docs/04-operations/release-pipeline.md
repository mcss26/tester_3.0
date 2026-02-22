# PLAN PRODUCTION READY - tester_3.0

Fecha de auditoria: 2026-02-17
Repositorio: `C:\Users\siste\Documents\GitHub\tester_3.0`

## 1) Executive summary

- `tester_3.0` es un frontend multipantalla (HTML + JS vanilla) con backend en Supabase (DB/Auth + 1 Edge Function) y flujos operativos de noche (workday, caja, barra, QR, pagos).
- El core loop principal es `workday` con ciclo `DRAFT -> PLANNED -> ACTIVE -> CLOSED`, integrado con cierres de caja/barra y conciliacion (`docs/architecture/backend-architecture-map.md`, `assets/js/modules/admin/admin-workdays.js`).
- El riesgo mas alto hoy es de seguridad operacional: scanner productivo con guard de auth deshabilitado y usuario mock (`assets/js/modules/operativo/scanner.js:7-13`).
- Hay configuracion hardcodeada en frontend y function (`assets/js/core/config.js`, `supabase/functions/generate-member-qr/index.ts`), lo que dificulta separar dev/staging/prod.
- CI/CD no existe en repo (`.github` ausente) y no hay pipeline de tests automatizados (solo scripts de auditoria estaticos).
- Build/deploy no esta estandarizado: `package.json` no tiene `build/start/test` (`package.json:4-13`).
- RLS/policies aparece parcial: algunas tablas nuevas tienen RLS, pero en integracion GBOL queda comentado (`supabase/migrations/20260207000002_migration_gbol_integration.sql:170-174`).
- Observabilidad es limitada: hay `ErrorLogger` pero no se usa en modulos, y no hay integracion de telemetria externa.
- Se pudo ejecutar auditoria local con `npm.cmd` (no con `npm` por ExecutionPolicy de PowerShell).
- Meta realista: 3 fases / 7 PRs para llegar a baseline production-ready con rollback y runbook.

## 2) Repo Map

### 2.1 Que es este sistema y core loop

- Sistema: suite operativa FormulaMid/Midnight para administracion nocturna (admin, operativo, encargados, logistica, staff, members).
- Core loop (evidencia):
  - Ciclo de jornada: `rpc_create_work_day`, `rpc_confirm_work_day`, `rpc_open_work_day`, `rpc_preflight_close_workday`, `rpc_close_work_day` en `docs/architecture/backend-architecture-map.md` y llamadas en `assets/js/modules/admin/admin-workdays.js:956,1059,1511,1674`.
  - Flujo QR member: `assets/js/members/my-qr.js` consume `functions/v1/generate-member-qr`; function en `supabase/functions/generate-member-qr/index.ts`.
  - Conciliacion caja/GBOL: `assets/js/core/gbol-service.js` + tablas `import_gbol_*` (`supabase/migrations/20260207000002_migration_gbol_integration.sql`).

### 2.2 Estructura de carpetas y componentes clave

- UI:
  - `pages/` (45+ pantallas por rol)
  - `assets/js/modules/*` (modulos por dominio)
  - `assets/js/core/*` (auth, supabase client, utilidades)
  - `assets/css/*`
- Datos/backend:
  - `supabase/migrations/*` (SQL evolutivo)
  - `supabase/functions/generate-member-qr/index.ts`
- Calidad/docs:
  - `scripts/*` (auditorias y utilidades)
  - `docs/*` (mapas funcionales, arquitectura, testing manual)

### 2.3 Entorno de ejecucion y build/deploy actual

- Runtime actual: frontend estatico con scripts `<script defer ...>` cargados por pagina (`login.html:16-18`, `pages/admin/admin-index.html:102-104`).
- Dependencia backend en tiempo de ejecucion: Supabase JS SDK por CDN + `window.APP_CONFIG`.
- Build actual: inexistente como pipeline de app (no `build/start/dev/test` en `package.json:4-13`).
- Deploy actual: no hay archivos de despliegue detectables (`__NO_DEPLOY_CONFIG_FILES__`), ni workflows CI (`__NO_GITHUB_WORKFLOWS__`).
- Ejecucion local documentada: enfocada en scripts de auditoria (`README.md`, `scripts/README.md`), no en release/deploy reproducible.

### 2.4 Dependencias y tooling

- Dependencias npm: solo `xlsx` (`package.json:12-13`).
- Scripts disponibles: `audit:*` y `extract:recipes` (`package.json:5-10`).
- Resultado de auditorias ejecutadas:
  - `npm.cmd run audit:modules` -> 4 issues (scanner-mock + qr-generator)
  - `npm.cmd run audit:pages` -> 51 paginas auditadas, 0 refs faltantes, 6 con inline style, 9 con inline onclick
  - `npm.cmd run audit:css` -> fail (3 issues)
  - `npm.cmd run audit:links` -> 0 links rotos
- Nota operativa: `npm` fallo por policy de PowerShell, `npm.cmd` funciono.

## 3) Audit table

| Area           | Hallazgo (con evidencia)                                                                                                                                                                                 | Riesgo en prod                                                                      | Severidad                                                                                         | Esfuerzo                                                          | Fix recomendado (pasos concretos)                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seguridad      | Scanner productivo con auth guard deshabilitado y usuario mock (`assets/js/modules/operativo/scanner.js:7-13`) y pagina lo carga directo (`pages/operativo/scanner.html:121`)                            | Acreditaciones no autorizadas + auditoria fraudulenta (`accredited_by = mock-user`) | P0                                                                                                | S                                                                 | 1) Rehabilitar `Auth.guardOrRedirect` 2) Remover `mock-user` 3) Bloquear acceso por rol en DB (RLS/policy) 4) Agregar smoke test de acceso no autenticado => 401/redirect |
| Seguridad      | Edge function QR con fallback inseguro de secreto (`JWT_SECRET                                                                                                                                           |                                                                                     | "change-this-in-production"`) y CORS `\*` (`supabase/functions/generate-member-qr/index.ts:8,12`) | Si falta env, secreto predecible; abuso cross-origin del endpoint | P0                                                                                                                                                                        | S   | 1) Eliminar fallback y fail-fast al boot si falta secret 2) Restringir CORS a dominios permitidos por entorno 3) Agregar prueba de rechazo para origin/token invalidos |
| Config/Secrets | Config hardcodeada en frontend (`assets/js/core/config.js:2-9`) y cargada en login/admin/operativo (`login.html:17`, `pages/admin/admin-index.html:103`)                                                 | Mezcla de entornos, rotacion de claves compleja, riesgo de apuntar staging a prod   | P1                                                                                                | M                                                                 | 1) Migrar a config por entorno (`config.dev.js`, `config.staging.js`, `config.prod.js`) 2) Generar en build/deploy 3) Agregar validacion de config al inicio              |
| Config/Secrets | `MCO_BATCH_ID` hardcodeado en multiples modulos (`assets/js/modules/admin/admin-index.js:141`, `assets/js/modules/operativo/scanner.js:14`, `assets/js/modules/operativo/operativo-index.js:111`)        | Errores funcionales en eventos/lotes nuevos; metricas sesgadas                      | P1                                                                                                | S                                                                 | 1) Mover a tabla/config (`site_config` o `qr_batches`) 2) Resolver por workday activo 3) Fallback controlado y alerta                                                     |
| Build/Deploy   | No existe pipeline de build/start/test (`package.json:4-13`)                                                                                                                                             | Deploy manual no reproducible; drift entre ambientes                                | P1                                                                                                | M                                                                 | 1) Definir comando de build reproducible 2) Artifact versionado 3) Checklist pre/post deploy automatizado                                                                 |
| CI/CD          | No hay workflows (`.github` no existe)                                                                                                                                                                   | Sin quality gates automáticos antes de merge/deploy                                 | P1                                                                                                | M                                                                 | 1) Crear `ci.yml` (audit scripts + smoke + checks SQL) 2) Requerir status checks para merge 3) Publicar artefactos de auditoria                                           |
| Testing        | No se detectan archivos/directorios de tests (`__NO_TEST_FILES_OR_TEST_DIRECTORIES__`), testing actual es manual (`docs/testing/README.md`)                                                              | Regresiones en flujos criticos (caja/pagos/QR)                                      | P1                                                                                                | M                                                                 | 1) Definir smoke E2E minimo (login, open/close workday, scanner, pago) 2) Ejecutar en CI 3) Baseline de regression                                                        |
| Datos/DB       | En migracion GBOL, RLS/policies quedan comentados (`supabase/migrations/20260207000002_migration_gbol_integration.sql:170-174`)                                                                          | Superficie de datos importados sin proteccion uniforme                              | P1                                                                                                | M                                                                 | 1) Activar RLS real en `import_gbol_facturacion/comandas/gbol_sync_log` 2) Crear policies por rol 3) Test de acceso por rol                                               |
| Datos/DB       | Documentacion indica tablas con RLS OFF: `import_logs`, `replenishment_tracking` (`docs/scheme.md:371,752`, `docs/architecture/backend-architecture-map.md:200`)                                         | Exposicion de tracking operativo y metadatos de importacion                         | P1                                                                                                | M                                                                 | 1) Activar RLS y policies minimas de lectura/escritura por rol 2) Revisar grants 3) Validar con pruebas de permisos                                                       |
| Auth           | Control de acceso es principalmente frontend (`assets/js/core/auth.js:119`); un modulo productivo ya lo omite (`scanner.js`)                                                                             | Bypass por cliente modificado si no hay RLS fuerte en tablas sensibles              | P1                                                                                                | M                                                                 | 1) Tratar frontend guard como UX, no seguridad 2) Consolidar enforcement en RLS/RPC SECURITY DEFINER controlado 3) Test de acceso directo via API                         |
| Observabilidad | `ErrorLogger` existe pero no se usa en modulos (`assets/js/core/error-logger.js`; sin referencias fuera del archivo) y no hay vendor de observabilidad (`__NO_OBSERVABILITY_VENDOR_INTEGRATION_FOUND__`) | Incidentes sin trazabilidad ni alertas                                              | P1                                                                                                | M                                                                 | 1) Integrar `ErrorLogger` en rutas criticas 2) Exportar errores a backend + dashboard 3) Alertas basicas (fallos de import, cierre, QR)                                   |
| Performance    | Carga de SDKs desde CDN sin `integrity` y sin pipeline de bundle (`login.html:16`, `pages/admin/admin-index.html:102`)                                                                                   | Mayor latencia, dependencia runtime externa, mayor riesgo supply-chain              | P2                                                                                                | M                                                                 | 1) Pin de versiones + SRI 2) Bundle local para core libs 3) Cache headers y preload selectivo                                                                             |
| UX resiliente  | Auditorias detectan inline styles/onclick (`npm.cmd run audit:pages` + `npm.cmd run audit:css`)                                                                                                          | Deuda UI, mas bugs visuales y mantenibilidad baja                                   | P2                                                                                                | S                                                                 | 1) Remediar inline styles prioritarios 2) Mover handlers inline a JS modular 3) Gate en CI para no reintroducir                                                           |
| DX             | En PowerShell, `npm` bloqueado por policy; requiere `npm.cmd` (evidencia de ejecucion)                                                                                                                   | Friccion de onboarding/ejecucion en equipos Windows                                 | P3                                                                                                | S                                                                 | 1) Documentar comando Windows (`npm.cmd`) 2) script wrapper cross-shell 3) agregar troubleshooting en README                                                              |
| Docs           | Hay material de roadmap en `docs/migration/artifacts/roadmap_production.md`, pero no runbook operativo canonico en `docs/_router.md`                                                                       | Respuesta inconsistente ante incidentes/deploy rollback                             | P2                                                                                                | M                                                                 | 1) Crear runbook canónico (`docs/ops/runbook.md`) 2) incluir rollback por capa (frontend/DB/functions) 3) checklists de on-call                                           |

## 4) Target State (Definition of Done de produccion)

### 4.1 Checklist verificable

- [ ] Build reproducible
  - DoD: comando unico de build/release, versionado y artifact trazable
  - Verificacion: pipeline CI genera mismo hash para mismo commit
- [ ] Config por entorno (dev/staging/prod)
  - DoD: no hay valores de entorno hardcodeados en `assets/js/core/config.js`
  - Verificacion: check automatizado que bloquea URLs/IDs productivos en ramas no-prod
- [ ] Manejo de secrets
  - DoD: sin fallback inseguros; `.env.example` presente; rotacion documentada
  - Verificacion: startup checks fallan si faltan secrets obligatorios
- [ ] Logging/telemetria + errores
  - DoD: errores criticos centralizados (import, auth, workday close, QR)
  - Verificacion: dashboard/log table con correlacion por `work_day_id` + alertas
- [ ] Deploy + rollback
  - DoD: estrategia definida por capa (frontend estatico, SQL migrations, edge functions)
  - Verificacion: rollback ensayado en staging en <30 min
- [ ] Seguridad base
  - DoD: scanner sin bypass; RLS en tablas sensibles; CORS restringido; headers de seguridad/SRI cuando aplique
  - Verificacion: pruebas de acceso no autorizado y escaneo basico de headers
- [ ] Backups/migraciones
  - DoD: migraciones idempotentes y plan de backup/restore documentado
  - Verificacion: restore drill de snapshot de staging + re-run de migraciones
- [ ] Pruebas minimas + CI
  - DoD: smoke/regression automatizados para flujo critico
  - Verificacion: CI obligatorio en PR + reporte de resultados
- [ ] Documentacion operativa
  - DoD: runbook, checklist de release, matriz de dueños, playbook de incidentes
  - Verificacion: simulacro tabletop + links desde `docs/_router.md`

### 4.2 Integraciones externas y validacion en staging

- Supabase DB/Auth/RPC: validar permisos por rol + flujos `workday` y `pagos`.
- Supabase Edge Function (`generate-member-qr`): validar token valido/invalido, origen permitido, expiracion, idempotencia QR.
- GBOL API (`assets/js/core/gbol-service.js`): validar sync nocturno con dataset de staging y conciliacion contra `import_gbol_*`.
- CSV importers (Passline/AFIP/Extracciones): validar deduplicacion y estados en `qr_codes`, `cash_movements`, tablas de import.
- EmailJS (`assets/js/modules/operativo/cms-members.js`): validar envio en entorno no productivo con templates separados.

## 5) Roadmap por fases (03)

### Fase 1 - Contencion de Riesgo (seguridad + control de acceso)

Objetivo: eliminar riesgos P0/P1 de explotacion o fraude operacional.

Tareas atomicas

1. Hardening scanner

- DoD: `scanner.js` usa `guardOrRedirect` activo; sin `mock-user`.
- Criterio de aceptacion: sin sesion => redirect/login; con rol invalido => acceso denegado.
- Como se prueba: smoke E2E de acceso anonimo y rol permitido.

2. Hardening edge function QR

- DoD: sin fallback `change-this-in-production`; CORS whitelist por entorno.
- Criterio de aceptacion: request sin secret/origin permitido falla 401/403.
- Como se prueba: pruebas HTTP contra staging con origin permitido/no permitido.

3. Baseline RLS en tablas sensibles de importacion

- DoD: policies activas en `import_gbol_facturacion`, `import_gbol_comandas`, `gbol_sync_log`, `import_logs`, `replenishment_tracking`.
- Criterio de aceptacion: roles no autorizados no leen/escriben.
- Como se prueba: test SQL por rol JWT (allowed/denied matrix).

Dependencias

- Definir matriz de roles efectiva (admin, contable, operativo, etc.).

Riesgos y mitigaciones

- Riesgo: romper flujos actuales por policies estrictas.
- Mitigacion: rollout en staging + fallback script de rollback SQL.

Entregables

- SQL migrations de seguridad
- fixes en `scanner.js` y function QR
- documento de matriz de permisos

### Fase 2 - Release Engineering (build, CI, tests, entornos)

Objetivo: convertir el release en proceso repetible y verificable.

Tareas atomicas

1. Estandar de config por entorno

- DoD: config runtime separada dev/staging/prod; cero hardcode de ambiente.
- Criterio de aceptacion: misma build deployable con config inyectada por entorno.
- Como se prueba: deploy de un mismo artefacto a staging/prod con resultados distintos esperados.

2. Pipeline CI minimo

- DoD: workflow ejecuta `audit:modules`, `audit:pages`, `audit:css`, `audit:links` + smoke critico.
- Criterio de aceptacion: PR no mergea si falla gate.
- Como se prueba: PR de prueba con falla intencional.

3. Smoke/regression automatizado

- DoD: cobertura minima de login + workday open/close + scanner + pagos.
- Criterio de aceptacion: suite estable en 3 corridas consecutivas.
- Como se prueba: ejecucion CI en rama limpia.

Dependencias

- Fase 1 completada para evitar falsos positivos de seguridad.

Riesgos y mitigaciones

- Riesgo: friccion inicial por fallos mas frecuentes en PR.
- Mitigacion: modo warning 1 semana + luego modo blocking.

Entregables

- `.github/workflows/ci.yml`
- smoke tests
- guia de entornos y `.env.example`

### Fase 3 - Operacion Production Ready (observabilidad + runbook + performance basica)

Objetivo: operar con monitoreo, rollback claro y mantenimiento sostenible.

Tareas atomicas

1. Observabilidad operativa

- DoD: errores/eventos criticos centralizados con dashboards y alertas.
- Criterio de aceptacion: incidente simulado genera alerta y traza completa.
- Como se prueba: drill de error en importacion y cierre de jornada.

2. Runbook + rollback por capa

- DoD: runbook canonico con pasos de rollback frontend/DB/function.
- Criterio de aceptacion: simulacro ejecutado por un operador distinto al autor.
- Como se prueba: tabletop + evidencia en docs.

3. Hardening frontend security/perf

- DoD: SRI/pin version en CDN o bundle local de librerias criticas; minimizar inline style pendientes.
- Criterio de aceptacion: checklist security/perf en PR de release.
- Como se prueba: auditoria automatica + revisión manual de headers.

Dependencias

- Fases 1 y 2 completadas.

Riesgos y mitigaciones

- Riesgo: scope creep de observabilidad.
- Mitigacion: limitar a eventos P0/P1 primero.

Entregables

- `docs/ops/runbook.md`
- dashboard de errores/alertas
- checklist de release

### Quick Wins (max 5)

1. Reactivar auth real en `scanner.js` y quitar `mock-user`.
2. Eliminar fallback `change-this-in-production` en edge function.
3. Mover `MCO_BATCH_ID` a config dinámica por `work_day`.
4. Agregar workflow CI inicial solo con `audit:*`.
5. Publicar `docs/ops/runbook.md` con rollback minimo.

## 6) PR Plan + checklists

### PR#1 - Security Hotfix Scanner + Member QR Function

Alcance

- `assets/js/modules/operativo/scanner.js`
- `supabase/functions/generate-member-qr/index.ts`

Validaciones

- acceso sin sesion bloqueado
- token invalido/origen no permitido rechazado
- no regresion en scanner y my-qr

Checklist de review (PR#1)

- [ ] Seguridad: sin bypass auth, sin fallback secret
- [ ] Pruebas: smoke manual/e2e documentado
- [ ] Performance: sin loops/polling extra
- [ ] Rollback: commit/script de revert documentado
- [ ] Docs: changelog de seguridad

### PR#2 - Config por entorno + limpieza hardcodes

Alcance

- `assets/js/core/config.js` + consumo en modulos
- remocion de hardcodes `MCO_BATCH_ID`

Validaciones

- dev/staging/prod con valores distintos
- feature QR y dashboard funcionan con config dinamica

Checklist de review (PR#2)

- [ ] Seguridad: sin valores de prod hardcodeados
- [ ] Pruebas: check de carga de config por entorno
- [ ] Performance: sin roundtrips innecesarios
- [ ] Rollback: compatibilidad backward temporal
- [ ] Docs: guia de configuracion actualizada

### PR#3 - RLS/Policies para tablas criticas

Alcance

- migraciones SQL de policies + grants

Validaciones

- matriz de acceso por rol (allow/deny)
- imports y consultas operativas siguen funcionando

Checklist de review (PR#3)

- [ ] Seguridad: principle of least privilege
- [ ] Pruebas: test SQL por rol
- [ ] Performance: indices adecuados para policies
- [ ] Rollback: migration down/plan de revert
- [ ] Docs: matriz de permisos

### PR#4 - CI baseline

Alcance

- `.github/workflows/ci.yml`
- ejecucion de scripts `audit:*`

Validaciones

- PR con falla intencional bloquea merge
- artefactos de reporte adjuntos

Checklist de review (PR#4)

- [ ] Seguridad: secrets CI aislados
- [ ] Pruebas: pipeline estable en 3 runs
- [ ] Performance: tiempo de CI aceptable
- [ ] Rollback: desactivar workflow sin romper repo
- [ ] Docs: README de CI

### PR#5 - Smoke tests criticos

Alcance

- suite smoke (login/workday/scanner/pagos)

Validaciones

- pasa en staging de punta a punta

Checklist de review (PR#5)

- [ ] Seguridad: casos negativos incluidos
- [ ] Pruebas: cobertura de happy-path + fail-path
- [ ] Performance: runtime de suite razonable
- [ ] Rollback: tests no bloquean releases urgentes (modo controlado)
- [ ] Docs: guia de ejecucion local/CI

### PR#6 - Observabilidad minima

Alcance

- adopcion de `ErrorLogger` en modulos criticos
- dashboard/tabla de errores operativos

Validaciones

- errores de import y cierre quedan trazados

Checklist de review (PR#6)

- [ ] Seguridad: sanitizacion de datos en logs
- [ ] Pruebas: evento error observable end-to-end
- [ ] Performance: logging no bloqueante
- [ ] Rollback: feature flag/log level
- [ ] Docs: playbook de incidentes

### PR#7 - Runbook + release checklist

Alcance

- `docs/ops/runbook.md`
- checklist release/rollback

Validaciones

- simulacro de rollback exitoso en staging

Checklist de review (PR#7)

- [ ] Seguridad: contactos y permisos claros
- [ ] Pruebas: drill documentado
- [ ] Performance: N/A (docs)
- [ ] Rollback: pasos ejecutables y medibles
- [ ] Docs: indexado desde `docs/_router.md`

## 7) Preguntas bloqueantes (max 5)

1. Cual es el host objetivo de produccion para el frontend estatico (Vercel/Netlify/S3+CDN/otro)?
2. Cuales son los dominios exactos permitidos para CORS de `generate-member-qr` en staging y prod?
3. Existe proyecto Supabase separado para staging con datos anonimizados?
4. Cual es la matriz final de roles/autorizaciones para tablas de importacion y conciliacion?
5. `pages/operativo/scanner.html` debe quedar productivo o reemplazarse por `scanner-mock` solo en entornos de prueba?

## Evidencia de ejecucion de comandos

- Ejecutado con exito: `npm.cmd run audit:modules`, `npm.cmd run audit:pages`, `npm.cmd run audit:css`, `npm.cmd run audit:links`.
- No ejecutable en este entorno via `npm` (PowerShell `ExecutionPolicy` bloquea `npm.ps1`), workaround aplicado con `npm.cmd`.
- No se pudo leer `.env` por permisos de archivo (`Access denied`), por eso no se auditaron sus valores internos.
