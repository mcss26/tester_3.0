# Token Migration Registry

> **Generado:** 2026-02-21  
> **Decisión:** Semántico gana. Aliases numéricos y shorthand se mantienen como retrocompat.

## Estado del Sistema

### Spacing: Semántico (canonical) + Numérico (alias)

| Canonical    | Value | Alias        | Alias Refs | Migrar cuando |
| :----------- | ----: | :----------- | ---------: | :------------ |
| `--space-xs` |   4px | `--space-1`  |          3 | Low priority  |
| `--space-sm` |   8px | `--space-2`  |         11 | Low priority  |
| `--space-3`  |  12px | —            |          — | N/A (único)   |
| `--space-md` |  16px | `--space-4`  |         14 | Medium        |
| —            |  20px | `--space-5`  |          1 | Can remove    |
| `--space-lg` |  24px | `--space-6`  |          6 | Low           |
| `--space-xl` |  32px | `--space-8`  |          4 | Low           |
| —            |  48px | `--space-12` |          1 | Can remove    |
| —            |  64px | `--space-16` |          2 | Low           |

### Shorthand Aliases

| Canonical          | Canonical Refs | Alias           | Alias Refs | Priority       |
| :----------------- | -------------: | :-------------- | ---------: | :------------- |
| `--text-primary`   |            124 | `--text-1`      |         61 | High (bulk)    |
| `--text-tertiary`  |             89 | `--text-3`      |         34 | High           |
| `--border-subtle`  |             84 | `--border-1`    |         86 | High (biggest) |
| `--text-secondary` |             67 | `--text-2`      |         42 | High           |
| `--white-alpha-05` |              — | `--surface-1`   |         24 | Medium         |
| `--border-active`  |             16 | `--border-2`    |         21 | Medium         |
| `--bg-elevated`    |             19 | `--bg-elev`     |         18 | Medium         |
| `--white-alpha-10` |              — | `--surface-2`   |         17 | Medium         |
| `--topbar-height`  |             10 | `--topbar-h`    |          6 | Low            |
| `--fs-sm`          |              — | `--text-sm`     |          7 | Low            |
| `--bg-body`        |             15 | `--bg-base`     |          6 | Low            |
| `--neutral-300`    |              — | `--bg-tertiary` |          3 | Low            |

## Script de Migración

Para migrar un alias al canónico:

```powershell
# Example: migrate --text-1 → --text-primary
$files = Get-ChildItem -Recurse assets\css\*.css
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  if ($content -match '--text-1[^0-9]') {
    $content = $content -replace '--text-1(?=[^0-9a-z-])', '--text-primary'
    Set-Content $f.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Updated: $($f.Name)"
  }
}
```

## Regla para Código Nuevo

- ✅ Usar nombres **canónicos** (`--space-md`, `--text-primary`, `--border-subtle`)
- ❌ No usar aliases (`--space-4`, `--text-1`, `--border-1`) en código nuevo
- Los aliases se mantendrán hasta que se haga un batch migration
