# Workdays Progressive Report

> Session: 20260216-105842
> Ronda: 45 | Score: 96/100 [OK]
> Actualizado: 2026-02-16 11:42:07

## Health Dashboard

| Fase | Score | Status |
|:---|:---:|:---|
| Baseline (Files, Cross-Ref, Sprints) | 88 [WARN] | DONE 11:42 |
| Deep JS (Dead Code, Queries, Complexity) | 88 [WARN] | DONE 11:42 |
| Deep HTML (Forms, Aria, Empty States) | 90 [OK] | DONE 11:42 |
| Deep CSS (Unused Classes, Responsive) | 99 [OK] | DONE 11:42 |
| Cross-Module (Data Flow, Dependencies) | 100 [OK] | DONE 11:42 |
| Supabase Health (Queries, Error Handling) | 100 [OK] | DONE 11:42 |
| UX Patterns (Loading, Errors, Confirms) | 100 [OK] | DONE 11:42 |
| Summary + Delta Detection | 100 [OK] | DONE 11:42 |

---

## Fase 0 : Baseline (Files, Cross-Ref, Sprints) (11:42)

- [!] 1 IDs huerfanos en JS: stock-variance
- [i] HTML: 190 IDs | JS: 148 refs
- [i] S4 [DONE] 6/6
- [i] S5 [DONE] 4/4
- [i] Sprints: 10/10 (100%)
- [!] rpc_revert_work_day no referenciado en JS

## Fase 1 : Deep JS (Dead Code, Queries, Complexity) (11:42)

- [!] 1 funciones sin caller: handleRevert
- [i] 86 funciones declaradas
- [!] 3 queries .from() sin error handling
- [i] 49 queries Supabase totales
- [i] 3 console.log
- [i] 66 operaciones async (await)
- [i] 85 funciones declaradas
- [i] 64 operaciones async (await)

## Fase 2 : Deep HTML (Forms, Aria, Empty States) (11:42)

- [!] 16 inputs sin label/aria-label
- [i] 18 inputs totales
- [!] 36 botones sin type explicito
- [i] 36 botones totales
- [!] 36 modals sin role=dialog
- [i] 5 selects, 0 forms, 36 modals
- [!] 12 modals sin role=dialog
- [!] 2 inputs sin label/aria-label

## Fase 3 : Deep CSS (Unused Classes, Responsive) (11:42)

- [i] 11 clases CSS sin referencia en HTML/JS
- [i] 86 clases CSS totales
- [!] Breakpoints faltantes: 480, 768, 1280px
- [i] 33 CSS custom properties

## Fase 4 : Cross-Module (Data Flow, Dependencies) (11:42)

- [i] 17 modulos admin encontrados
- [i] 18 tablas read-only: master_categories, vw_financial_week_live, vw_night_snapshot, pos_terminals, vw_daily_sales
- [i] 33 tablas Supabase en 17 modulos
- [i] 4 modulos tocan work_days

## Fase 5 : Supabase Health (Queries, Error Handling) (11:42)

- [i] .single(): 5 | .maybeSingle(): 11
- [i] 7 RPCs, 10 selects, 0 deletes
- [i] 6 RPCs, 10 selects, 0 deletes

## Fase 6 : UX Patterns (Loading, Errors, Confirms) (11:42)

- [i] Empty states: 0 | Tablas: 18

## Fase 7 : Summary + Delta Detection (11:42)

- [OK] Sin hallazgos negativos

---

## Historial

| Ronda | Timestamp | Score | Findings |
|:---:|:---|:---:|:---:|
| R1 | 2026-02-16T10:58:43.8899402-03:00 | 96 [OK] | 7 |
| R2 | 2026-02-16T10:58:54.3347582-03:00 | 97 [OK] | 7 |
| R3 | 2026-02-16T10:59:54.7453747-03:00 | 97 [OK] | 7 |
| R4 | 2026-02-16T11:00:55.0471106-03:00 | 97 [OK] | 7 |
| R5 | 2026-02-16T11:01:55.3694781-03:00 | 97 [OK] | 7 |
| R6 | 2026-02-16T11:02:55.6693005-03:00 | 96 [OK] | 8 |
| R7 | 2026-02-16T11:03:55.9865593-03:00 | 96 [OK] | 8 |
| R8 | 2026-02-16T11:04:56.2526327-03:00 | 96 [OK] | 9 |
| R9 | 2026-02-16T11:05:56.5504938-03:00 | 96 [OK] | 9 |
| R10 | 2026-02-16T11:06:56.8327708-03:00 | 96 [OK] | 9 |
| R11 | 2026-02-16T11:07:57.1678693-03:00 | 96 [OK] | 9 |
| R12 | 2026-02-16T11:08:57.4756765-03:00 | 96 [OK] | 9 |
| R13 | 2026-02-16T11:09:57.8489625-03:00 | 96 [OK] | 9 |
| R14 | 2026-02-16T11:10:58.1179270-03:00 | 96 [OK] | 9 |
| R15 | 2026-02-16T11:11:58.5222505-03:00 | 96 [OK] | 9 |
| R16 | 2026-02-16T11:12:58.7886462-03:00 | 96 [OK] | 9 |
| R17 | 2026-02-16T11:13:59.0616636-03:00 | 96 [OK] | 9 |
| R18 | 2026-02-16T11:14:59.4470122-03:00 | 96 [OK] | 9 |
| R19 | 2026-02-16T11:15:59.6874957-03:00 | 96 [OK] | 9 |
| R20 | 2026-02-16T11:16:59.9505723-03:00 | 96 [OK] | 9 |
| R21 | 2026-02-16T11:18:00.1957937-03:00 | 96 [OK] | 9 |
| R22 | 2026-02-16T11:19:00.5613196-03:00 | 96 [OK] | 9 |
| R23 | 2026-02-16T11:20:00.9031116-03:00 | 96 [OK] | 9 |
| R24 | 2026-02-16T11:21:01.3140631-03:00 | 96 [OK] | 9 |
| R25 | 2026-02-16T11:22:01.5839356-03:00 | 96 [OK] | 9 |
| R26 | 2026-02-16T11:23:01.9049687-03:00 | 96 [OK] | 9 |
| R27 | 2026-02-16T11:24:02.1291418-03:00 | 96 [OK] | 9 |
| R28 | 2026-02-16T11:25:02.4486297-03:00 | 96 [OK] | 9 |
| R29 | 2026-02-16T11:26:02.7231120-03:00 | 96 [OK] | 9 |
| R30 | 2026-02-16T11:27:02.9612644-03:00 | 96 [OK] | 9 |
| R31 | 2026-02-16T11:28:03.2382486-03:00 | 96 [OK] | 9 |
| R32 | 2026-02-16T11:29:03.5137641-03:00 | 96 [OK] | 9 |
| R33 | 2026-02-16T11:30:03.8518783-03:00 | 96 [OK] | 9 |
| R34 | 2026-02-16T11:31:04.2057775-03:00 | 96 [OK] | 9 |
| R35 | 2026-02-16T11:32:04.4968346-03:00 | 96 [OK] | 10 |
| R36 | 2026-02-16T11:33:04.7291196-03:00 | 96 [OK] | 10 |
| R37 | 2026-02-16T11:34:04.9823841-03:00 | 96 [OK] | 10 |
| R38 | 2026-02-16T11:35:05.2238202-03:00 | 96 [OK] | 10 |
| R39 | 2026-02-16T11:36:05.4930063-03:00 | 96 [OK] | 10 |
| R40 | 2026-02-16T11:37:05.7196968-03:00 | 96 [OK] | 10 |
| R41 | 2026-02-16T11:38:06.1518465-03:00 | 96 [OK] | 10 |
| R42 | 2026-02-16T11:39:06.4771997-03:00 | 96 [OK] | 10 |
| R43 | 2026-02-16T11:40:06.7638605-03:00 | 96 [OK] | 10 |
| R44 | 2026-02-16T11:41:07.0214411-03:00 | 96 [OK] | 10 |
| R45 | 2026-02-16T11:42:07.2850588-03:00 | 96 [OK] | 10 |

---
_Generado por workdays-verifier.ps1 v2 (Progressive Scanner)_
