# Known TODOs — FormulaMid 4

> Última actualización: 2026-02-07

## Prioridad Alta (Fase 4: Integración)

| Archivo | Línea | TODO | Fase |
|---|---|---|---|
| `admin-central-stock.js` | 207 | Implement consumption import logic (conectar dropbox → parseCSV/parseExcel) | 4.2 |
| `admin-central-stock.js` | 213 | Implement revenue import logic (conectar dropbox → parseCSV/parseExcel) | 4.2 |
| `admin-central-stock.js` | 1173 | Wire parseCSV/parseExcel/processImportData/confirmImport into dropbox callbacks | 4.2 |

## Prioridad Media

| Archivo | Línea | TODO | Fase |
|---|---|---|---|
| `importer-extracciones.js` | 115 | Track ignored count in import results | 4.4 |
| `encargado-caja-personal.js` | 383 | Implement proper role selection modal | - |

## Completados (esta sesión)

- [x] `cms-members.js` — DEBUG button y console.log removidos, flujo consolidado en RESEND
- [x] `admin-reportes.js` — console.log("Admin Reportes Init") stale removido
- [x] `balance-semanal.js` — Auth guard no-await bug corregido
- [x] `_deprecated/` — Carpeta eliminada (7 archivos legacy)
- [x] `components.css.backup` — Archivo stale eliminado
