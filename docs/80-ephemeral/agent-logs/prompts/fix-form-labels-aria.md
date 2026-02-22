# Fix: Form Labels + ARIA Input Field Names

> **Instrucciones de ejecucion:** Copia este archivo completo y pegalo como prompt en Claude CLI.

## Objetivo

Agregar `aria-label` a 45 elementos `<input>`, `<select>` y `<textarea>` que carecen de label accesible en 12 archivos HTML.

## Reglas

- **SOLO** agregar atributos `aria-label="..."` a los elementos listados
- **NO** modificar IDs, clases, estructura ni estilos
- **NO** tocar archivos protegidos (`tokens.css`, `components.css`, `auth.js`, `utils.js`)
- Si el elemento ya tiene un `<label for="...">` asociado, **NO** agregar aria-label (redundante)
- Usar español para los labels (el proyecto es en español)

## Archivos y elementos a corregir

### pages/admin/admin-central-stock.html (14 elementos)

| Linea | Tipo         | ID                                          | aria-label sugerido               |
| :---- | :----------- | :------------------------------------------ | :-------------------------------- |
| ~189  | file         | file-consumption                            | "Importar archivo de consumo"     |
| ~199  | file         | file-revenue                                | "Importar archivo de recaudacion" |
| ~295  | select       | chart-mode                                  | "Modo de grafico"                 |
| ~359  | select       | category-filter                             | "Filtrar por categoria"           |
| ~370  | input text   | search-sku                                  | "Buscar SKU"                      |
| ~459  | input search | search-recipe                               | "Buscar receta"                   |
| ~530  | input text   | filter-recipe-search                        | "Buscar receta en rentabilidad"   |
| ~645  | select       | (sin ID, dentro de template ingredient-row) | "Seleccionar SKU ingrediente"     |
| ~648  | input number | (sin ID, dentro de template ingredient-row) | "Cantidad de ingrediente"         |
| ~811  | select       | select-sku-modal                            | "Seleccionar SKU para ajuste"     |
| ~835  | input number | input-qty-modal                             | "Cantidad de ajuste"              |
| ~841  | input text   | input-reason-modal                          | "Motivo del ajuste"               |
| ~862  | input text   | input-pos-code                              | "Codigo POS"                      |
| ~863  | select       | select-recipe                               | "Seleccionar receta"              |

### pages/admin/admin-master-nomina.html (2 elementos)

| Linea | Tipo         | ID              | aria-label sugerido |
| :---- | :----------- | :-------------- | :------------------ |
| ~134  | input search | staff-search    | "Buscar personal"   |
| ~154  | input search | profiles-search | "Buscar perfiles"   |

### pages/admin/admin-master-proveedores.html (1 elemento)

| Linea | Tipo         | ID               | aria-label sugerido  |
| :---- | :----------- | :--------------- | :------------------- |
| ~124  | input search | providers-search | "Buscar proveedores" |

### pages/admin/admin-pagos.html (3 elementos)

| Linea | Tipo         | ID              | aria-label sugerido       |
| :---- | :----------- | :-------------- | :------------------------ |
| ~175  | input search | queueSearch     | "Buscar en cola de pagos" |
| ~305  | input search | supplierSearch  | "Buscar proveedor"        |
| ~597  | input number | ruleFixedAmount | "Monto fijo de regla"     |

### pages/admin/admin-solicitudes.html (2 elementos)

| Linea | Tipo       | ID               | aria-label sugerido     |
| :---- | :--------- | :--------------- | :---------------------- |
| ~299  | input text | reject-reason    | "Motivo de rechazo"     |
| ~325  | input text | prereject-reason | "Motivo de pre-rechazo" |

### pages/admin/admin-workdays.html (5 elementos)

| Linea | Tipo                | ID                  | aria-label sugerido           |
| :---- | :------------------ | :------------------ | :---------------------------- |
| ~433  | select              | select-event        | "Tipo de evento"              |
| ~459  | input text/textarea | input-notes         | "Notas del evento"            |
| ~471  | select              | select-template     | "Seleccionar plantilla"       |
| ~1356 | select              | rpt-chart-mode      | "Modo de grafico de reportes" |
| ~1956 | input text          | input-template-name | "Nombre de la plantilla"      |

### pages/encargados/encargado-barra-noche.html (2 elementos)

| Linea | Tipo     | ID           | aria-label sugerido |
| :---- | :------- | :----------- | :------------------ |
| ~99   | textarea | openingNotes | "Notas de apertura" |
| ~136  | textarea | closingNotes | "Notas de cierre"   |

### pages/encargados/encargado-barra-personal.html (1 elemento)

| Linea | Tipo       | ID        | aria-label sugerido   |
| :---- | :--------- | :-------- | :-------------------- |
| ~184  | input text | staffName | "Nombre del personal" |

### pages/encargados/encargado-caja-noche.html (7 elementos)

| Linea | Tipo         | ID                | aria-label sugerido         |
| :---- | :----------- | :---------------- | :-------------------------- |
| ~170  | input number | open-amount       | "Monto de apertura de caja" |
| ~203  | input number | input-amount      | "Monto de movimiento"       |
| ~210  | input text   | input-reason      | "Motivo del movimiento"     |
| ~237  | input number | close-cash-amount | "Monto efectivo al cierre"  |
| ~246  | input number | close-zoco-amount | "Monto Zoco al cierre"      |
| ~253  | textarea     | close-notes       | "Notas de cierre de caja"   |
| ~302  | textarea     | night-close-notes | "Notas de cierre nocturno"  |

### pages/encargados/encargado-caja-personal.html (1 elemento)

| Linea | Tipo       | ID         | aria-label sugerido   |
| :---- | :--------- | :--------- | :-------------------- |
| ~182  | input text | staff-name | "Nombre del personal" |

### pages/logistica/logistica-recepcion.html (1 elemento)

| Linea | Tipo         | ID       | aria-label sugerido   |
| :---- | :----------- | :------- | :-------------------- |
| ~173  | input number | free-qty | "Cantidad bonificada" |

### pages/prototypes/test-dropdown/index.html (5 elementos)

> NOTA: Este es un prototipo de test. **OMITIR** — no corregir prototipos.

## Excluir

- `scanner-mock.html` — deprecado
- `pages/prototypes/` — prototipos de test, no produccion

## Verificacion post-ejecucion

```powershell
# Contar inputs sin aria-label en paginas de produccion (excluir prototypes y scanner-mock)
Get-ChildItem -Path pages -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'prototypes|scanner-mock' } | ForEach-Object { $c = Get-Content $_.FullName -Raw; $inputs = [regex]::Matches($c, '<(input|select|textarea)[^>]*>'); $noLabel = ($inputs | Where-Object { $_.Value -notmatch 'aria-label' -and $_.Value -notmatch 'type="hidden"' -and $_.Value -notmatch 'type="checkbox"' }).Count; if ($noLabel -gt 0) { Write-Output "$($_.Name): $noLabel sin aria-label" } }
# Objetivo: 0 resultados (o significativamente menos que 45)
```

## Criterio de exito

- 45 elementos (en 11 archivos de produccion) con `aria-label` agregado
- 0 elementos rotos o con IDs renombrados
- Prototipos y scanner-mock intactos
