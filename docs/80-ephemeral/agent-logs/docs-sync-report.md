# Docs Sync Report — 2026-02-22

## Métricas: state.md vs Realidad

| Campo          | state.md | Real | Status | Nota                                                                  |
| -------------- | -------- | ---- | ------ | --------------------------------------------------------------------- |
| HTML pages     | 46       | 46   | ✅     |                                                                       |
| JS core        | 21       | 21   | ✅     |                                                                       |
| JS modules     | 41       | 41   | ✅     |                                                                       |
| CSS files      | 24       | 23   | ❌     | `bak monolito` está en `.archive/`, no en `assets/css/`               |
| SQL migrations | 28       | 28   | ✅     |                                                                       |
| Workflows      | 16       | 16   | ✅     |                                                                       |
| E2E specs      | 12       | 12   | ✅     |                                                                       |
| Scripts        | 26       | 27   | ⚠️     | `scripts/` incluye 5 non-scripts (.md, .txt); ejecutables reales = 22 |

## Screen Map Gaps

- **En doc pero no en disco:** `my-qr.html` (migrado a midnightclub)
- En disco pero no en doc: Ninguno

## REGISTRY.yml Landing Pages

✅ Todas las landings apuntan a archivos existentes (10 checked, 1 null)

## INDEX.md Links

✅ 25 links verificados, todos válidos

## Design System Token Drift

| Métrica                        | Valor   |
| ------------------------------ | ------- |
| Tokens declarados en MASTER.md | 91      |
| Tokens usados en CSS           | 180     |
| Declarados pero no usados      | 18      |
| **Usados pero no declarados**  | **107** |

> ⚠️ Drift significativo: 107 tokens custom properties en uso sin documentar en MASTER.md.

## Documentos Obsoletos (>7 días)

✅ Todos los source-of-truth actualizados dentro de los últimos 7 días

## Acciones Recomendadas

| #   | Acción                                                                                 | Prioridad |
| --- | -------------------------------------------------------------------------------------- | --------- |
| 1   | Actualizar `state.md` CSS count: 24 → 23 (remover mención del bak monolito)            | 🟢        |
| 2   | Actualizar `state.md` scripts: clarificar "22 scripts + 5 docs/data" o listar 27 files | 🟢        |
| 3   | Remover `my-qr.html` de `screen-map.md` (ya migrado)                                   | 🟡        |
| 4   | Actualizar `MASTER.md` para documentar los 107 tokens en uso no declarados             | 🔴        |
