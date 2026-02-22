# =============================================================================
# Flow Tracer v2 - FormulaMid 4
# Usage: powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1
#        powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1 -WithAnalysis
#
# QUE HACE ESTE SCRIPT:
#
# Recorre tu codigo fuente analizando como se conectan las piezas:
# - HTML: que paginas existen, a donde navegan (data-go + <a href> + JS)
# - JS: que tablas de Supabase leen/escriben (clasificado READ/WRITE)
# - Schema: cruza con docs/scheme.md para tablas sin documentar
# - Cross-Module: muestra que modulo ESCRIBE y cual LEE cada tabla
#
# Genera un reporte en docs/80-ephemeral/agent-logs/qa/ y opcionalmente invoca Gemini CLI.
#
# Pensalo como un detective que sigue el rastro de los datos
# a traves de tu sistema y te dice donde se pierde la pista.
# =============================================================================

param(
    [switch]$WithAnalysis  # Invocar Gemini CLI al final
)

# â”€â”€ Paths â”€â”€
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot -or -not (Test-Path $ProjectRoot)) {
    $ProjectRoot = (Get-Location).Path
}
$PagesDir    = Join-Path $ProjectRoot "pages"
$JsDir       = Join-Path $ProjectRoot "assets\js"
$SchemaFile  = Join-Path $ProjectRoot "docs\scheme.md"
$OutputDir   = Join-Path $ProjectRoot "docs\output\qa"
$ReportFile  = Join-Path $OutputDir "$(Get-Date -Format 'yyyy-MM-dd')_audit_flow-trace.md"

$startTime   = Get-Date

# â”€â”€ State â”€â”€
$navMap       = @{}    # pagina -> [destinos]
$tableUsage   = @{}    # tabla -> @{ Reads = @(); Writes = @() }
$rpcUsage     = @{}    # funcion_rpc -> [archivos]
$brokenLinks  = @()    # links a paginas que no existen
$brokenTables = @()    # .from('tabla') sin schema
$orphanPages  = @()    # paginas sin links entrantes
$orphanJs     = @()    # JS sin HTML que lo referencie
$functionMap  = @{}    # archivo.js -> [funciones exportadas]
$scriptRefs   = @{}    # HTML -> [JS refs]
$schemaTables = @()    # tablas del schema
$htmlToJs     = @{}    # HTML -> JS module (1:1 mapping by naming convention)

# â”€â”€ Colores â”€â”€
function Write-OK   ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info ($msg) { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
function Write-Warn ($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Alert($msg) { Write-Host "  [!!] $msg" -ForegroundColor Red }
function Write-Gap  ($msg) { Write-Host "  [G]  $msg" -ForegroundColor Magenta }
function Write-Head ($msg) { Write-Host "`n  $msg" -ForegroundColor Cyan }

# =============================================================================
# HELPER: Normalizar path relativo de link
# Convierte "./admin-workdays.html" relativo a "pages/admin/admin-index.html"
# en "pages/admin/admin-workdays.html"
# =============================================================================
function Normalize-LinkPath {
    param([string]$Link, [string]$SourceFile)

    # Ignorar links externos, anclas, javascript
    if ($Link -match '^(https?://|#|javascript:|mailto:|tel:)') { return $null }
    # Ignorar links vacios
    if ([string]::IsNullOrWhiteSpace($Link)) { return $null }

    # Si ya es path absoluto desde project root
    if ($Link -match '^pages/') { return $Link }

    # Path relativo: resolver contra el directorio del archivo source
    $sourceDir = Split-Path $SourceFile -Parent
    $resolved = Join-Path $sourceDir $Link
    $resolved = [System.IO.Path]::GetFullPath($resolved)

    # Convertir a path relativo al project root
    if ($resolved.StartsWith($ProjectRoot)) {
        return $resolved.Replace("$ProjectRoot\", "").Replace("\", "/")
    }
    return $null
}

# =============================================================================
# SCAN 1: MAPA DE NAVEGACION
# Lee todos los HTML, extrae data-go + <a href> + sidebar links.
# =============================================================================
function Scan-Navigation {
    Write-Head "1. MAPA DE NAVEGACION (data-go + href)"
    Write-Info "Sigo los links entre paginas HTML (todos los mecanismos)"

    $htmlFiles = Get-ChildItem $PagesDir -Recurse -Filter "*.html" -EA SilentlyContinue
    $allPaths = $htmlFiles | ForEach-Object {
        $_.FullName.Replace("$ProjectRoot\", "").Replace("\", "/")
    }

    $script:navMap = @{}
    $script:brokenLinks = @()
    $totalLinks = 0

    foreach ($html in $htmlFiles) {
        $rel = $html.FullName.Replace("$ProjectRoot\", "").Replace("\", "/")
        $content = Get-Content $html.FullName -Raw -EA SilentlyContinue
        if (-not $content) { continue }

        $destinations = @()

        # 1. data-go="..."
        $goMatches = [regex]::Matches($content, 'data-go="([^"]+)"')
        foreach ($m in $goMatches) {
            $dest = Normalize-LinkPath $m.Groups[1].Value $html.FullName
            if ($dest) { $destinations += $dest; $totalLinks++ }
        }

        # 2. <a href="..."> (excluir CDN, external, anchors)
        $hrefMatches = [regex]::Matches($content, '<a[^>]+href="([^"]+)"')
        foreach ($m in $hrefMatches) {
            $dest = Normalize-LinkPath $m.Groups[1].Value $html.FullName
            if ($dest) { $destinations += $dest; $totalLinks++ }
        }

        # 3. <button ... onclick="...navigateTo..." o similar en HTML
        $navToMatches = [regex]::Matches($content, "navigateTo\(['""]([^'""]+)['""]")
        foreach ($m in $navToMatches) {
            $dest = Normalize-LinkPath $m.Groups[1].Value $html.FullName
            if ($dest) { $destinations += $dest; $totalLinks++ }
        }

        # Deduplicar
        $destinations = $destinations | Select-Object -Unique

        if ($destinations.Count -gt 0) {
            $script:navMap[$rel] = $destinations
        }

        # Verificar que cada destino existe
        foreach ($dest in $destinations) {
            $fullDest = Join-Path $ProjectRoot $dest
            if (-not (Test-Path $fullDest)) {
                $script:brokenLinks += @{ From = $rel; To = $dest }
            }
        }

        # Extraer <script src="...">
        $scriptMatches = [regex]::Matches($content, '<script[^>]+src="([^"]+)"')
        $scripts = @()
        foreach ($m in $scriptMatches) { $scripts += $m.Groups[1].Value }
        if ($scripts.Count -gt 0) { $script:scriptRefs[$rel] = $scripts }
    }

    # Detectar paginas huerfanas (nadie apunta a ellas)
    $allDestinations = $navMap.Values | ForEach-Object { $_ } | Select-Object -Unique
    $script:orphanPages = @($allPaths | Where-Object {
        $_ -notin $allDestinations -and
        $_ -notmatch '(index\.html|components_catalog|layout_patterns|test-|generator|module-audit|monitor|prototype)'
    })

    Write-OK "$totalLinks links encontrados en $($htmlFiles.Count) paginas"
    if ($brokenLinks.Count -gt 0) {
        Write-Alert "$($brokenLinks.Count) links rotos:"
        foreach ($bl in $brokenLinks) {
            Write-Gap  "$($bl.From) -> $($bl.To) (NO EXISTE)"
        }
    } else { Write-OK "Todos los links apuntan a paginas existentes" }

    if ($orphanPages.Count -gt 0) {
        Write-Warn "$($orphanPages.Count) paginas sin links entrantes"
    }
}

# =============================================================================
# SCAN 2: TABLAS SUPABASE (con clasificacion READ/WRITE)
# Extrae .from('tabla').select/insert/update/delete y .rpc()
# =============================================================================
function Scan-Tables {
    Write-Head "2. TABLAS SUPABASE (.from + R/W)"
    Write-Info "Clasifico cada query como lectura o escritura"

    # Leer tablas del schema
    $script:schemaTables = @()
    if (Test-Path $SchemaFile) {
        $schemaContent = Get-Content $SchemaFile -Raw
        $tableMatches = [regex]::Matches($schemaContent, '(?m)^#{2,3}\s+(?:Tabla:\s+)?`?(\w+)`?')
        foreach ($m in $tableMatches) {
            $script:schemaTables += $m.Groups[1].Value.ToLower()
        }
        $viewMatches = [regex]::Matches($schemaContent, '(?m)(vw_\w+)')
        foreach ($m in $viewMatches) {
            $script:schemaTables += $m.Groups[1].Value.ToLower()
        }
        $script:schemaTables = $script:schemaTables | Select-Object -Unique
    }

    # Extraer .from('tabla').operation() y .rpc() de JS
    $script:tableUsage = @{}
    $script:rpcUsage = @{}
    $script:brokenTables = @()
    $jsFiles = Get-ChildItem $JsDir -Recurse -Filter "*.js" -EA SilentlyContinue

    foreach ($js in $jsFiles) {
        $content = Get-Content $js.FullName -Raw -EA SilentlyContinue
        if (-not $content) { continue }
        $rel = $js.FullName.Replace("$ProjectRoot\", "").Replace("\", "/")
        $fileName = Split-Path $rel -Leaf

        # --- .from('tabla') followed by operation ---
        # Match patterns like .from('table').select( or .from("table").insert(
        # We look for .from('table') and then check what follows within a reasonable window
        $fromMatches = [regex]::Matches($content, "\.from\(['""](\w+)['""]\)")
        foreach ($m in $fromMatches) {
            $table = $m.Groups[1].Value.ToLower()

            if (-not $tableUsage.ContainsKey($table)) {
                $tableUsage[$table] = @{ Reads = @(); Writes = @() }
            }

            # Check context: what operation follows this .from() call?
            $afterFrom = $content.Substring($m.Index, [Math]::Min(200, $content.Length - $m.Index))

            if ($afterFrom -match '\.(select|eq|order|limit|single|maybeSingle|range|count)\s*\(') {
                if ($fileName -notin $tableUsage[$table].Reads) {
                    $tableUsage[$table].Reads += $fileName
                }
            }
            if ($afterFrom -match '\.(insert|upsert|update|delete)\s*\(') {
                if ($fileName -notin $tableUsage[$table].Writes) {
                    $tableUsage[$table].Writes += $fileName
                }
            }

            # If no operation detected, default to READ (most .from() are selects)
            if ($afterFrom -notmatch '\.(select|insert|upsert|update|delete|eq|order|limit|single|maybeSingle|range|count)\s*\(') {
                if ($fileName -notin $tableUsage[$table].Reads) {
                    $tableUsage[$table].Reads += $fileName
                }
            }
        }

        # --- .rpc('function') ---
        $rpcMatches = [regex]::Matches($content, "\.rpc\(['""](\w+)['""]\)")
        foreach ($m in $rpcMatches) {
            $fn = $m.Groups[1].Value
            if (-not $rpcUsage.ContainsKey($fn)) { $rpcUsage[$fn] = @() }
            if ($fileName -notin $rpcUsage[$fn]) { $rpcUsage[$fn] += $fileName }
        }
    }

    $usedTables = $tableUsage.Keys | Sort-Object
    $readCount = ($tableUsage.Values | ForEach-Object { $_.Reads.Count } | Measure-Object -Sum).Sum
    $writeCount = ($tableUsage.Values | ForEach-Object { $_.Writes.Count } | Measure-Object -Sum).Sum
    Write-OK "$($usedTables.Count) tablas referenciadas ($readCount reads, $writeCount writes)"

    if ($rpcUsage.Count -gt 0) {
        Write-Info "$($rpcUsage.Count) funciones RPC detectadas"
    }

    if ($schemaTables.Count -gt 0) {
        Write-Info "Schema tiene $($schemaTables.Count) tablas documentadas"

        $undocumented = $usedTables | Where-Object { $_ -notin $schemaTables }
        if ($undocumented.Count -gt 0) {
            Write-Warn "$($undocumented.Count) tablas usadas pero NO en scheme.md:"
            foreach ($t in $undocumented) {
                $allFiles = @($tableUsage[$t].Reads) + @($tableUsage[$t].Writes) | Select-Object -Unique
                $files = $allFiles -join ", "
                Write-Gap  "$t (usada en: $files)"
                $script:brokenTables += @{ Table = $t; UsedIn = $allFiles }
            }
        }

        $unused = $schemaTables | Where-Object { $_ -notin $usedTables }
        if ($unused.Count -gt 0) {
            Write-Info "$($unused.Count) tablas en schema pero sin uso en codigo"
        }
    } else {
        Write-Warn "No se pudo leer scheme.md para cruzar tablas"
    }
}

# =============================================================================
# SCAN 3: JS HUERFANOS
# =============================================================================
function Scan-OrphanJs {
    Write-Head "3. JS HUERFANOS"
    Write-Info "Busco archivos JS que ningun HTML carga"

    $allJsFiles = Get-ChildItem $JsDir -Recurse -Filter "*.js" -EA SilentlyContinue |
        ForEach-Object { $_.Name }
    $referencedJs = $scriptRefs.Values | ForEach-Object { $_ } |
        ForEach-Object { Split-Path $_ -Leaf } | Select-Object -Unique

    # JS compartidos (core) - never orphan
    $shared = @('supabase-client.js','auth.js','navigation.js','config.js','constants.js',
                'utils.js','toast.js','panel.js','error-logger.js','breadcrumbs.js',
                'keyboard-nav.js','tab-manager.js','navigation-analytics.js',
                'navigation-debug.js','navigation-history.js','navigation-state.js',
                'chart-helper.js','chart-loader.js','work-day-helper.js','import-logger.js')

    $script:orphanJs = @($allJsFiles | Where-Object {
        $_ -notin $referencedJs -and $_ -notin $shared -and
        $_ -notmatch '(importer-|gbol-)'
    })

    if ($orphanJs.Count -gt 0) {
        Write-Warn "$($orphanJs.Count) archivos JS sin referencia HTML directa"
    } else {
        Write-OK "Todos los JS estan referenciados"
    }
}

# =============================================================================
# HELPER: Map JS filename to module name
# =============================================================================
function Get-ModuleForFile {
    param([string]$FileName)

    # Prefix-based mapping (order matters: most specific first)
    if ($FileName -match '^admin-')       { return 'admin' }
    if ($FileName -match '^qr-')          { return 'admin' }       # QR tools are admin
    if ($FileName -match '^operativo-')   { return 'operativo' }
    if ($FileName -match '^cms-')         { return 'operativo' }   # CMS is operativo
    if ($FileName -match '^scanner')      { return 'operativo' }
    if ($FileName -match '^encargado-')   { return 'encargados' }  # singular filename
    if ($FileName -match '^logistica-')   { return 'logistica' }
    if ($FileName -match '^staff-')       { return 'staff' }
    if ($FileName -match '^balance-')     { return 'gerencia' }
    if ($FileName -match '^gbol-')        { return 'admin' }       # importers = admin
    if ($FileName -match '^importer-')    { return 'admin' }
    if ($FileName -match '^import-')      { return 'admin' }

    return $null  # core/shared files (auth.js, utils.js, etc.)
}

# =============================================================================
# SCAN 4: FLUJO DE DATOS CROSS-MODULE
# =============================================================================
function Scan-CrossModule {
    Write-Head "4. FLUJO DE DATOS CROSS-MODULE"
    Write-Info "Analizo que modulo LEE y cual ESCRIBE cada tabla"

    $moduleNames = @('admin', 'operativo', 'encargados', 'logistica', 'staff', 'gerencia')
    $script:crossFlows = @{}   # tabla -> @{ Readers = @(modulos); Writers = @(modulos) }
    $script:moduleStats = @{}  # modulo -> @{ Reads = N; Writes = N; Tables = @() }

    foreach ($mod in $moduleNames) {
        $moduleStats[$mod] = @{ Reads = 0; Writes = 0; TablesRead = @(); TablesWritten = @() }
    }

    foreach ($table in $tableUsage.Keys) {
        $readers = @()
        $writers = @()

        foreach ($file in $tableUsage[$table].Reads) {
            $mod = Get-ModuleForFile $file
            if ($mod -and $mod -notin $readers) { $readers += $mod }
        }

        foreach ($file in $tableUsage[$table].Writes) {
            $mod = Get-ModuleForFile $file
            if ($mod -and $mod -notin $writers) { $writers += $mod }
        }

        if ($readers.Count -gt 0 -or $writers.Count -gt 0) {
            $crossFlows[$table] = @{ Readers = $readers; Writers = $writers }
        }

        # Update module stats
        foreach ($r in $readers) {
            if ($moduleStats.ContainsKey($r)) {
                $moduleStats[$r].Reads++
                if ($table -notin $moduleStats[$r].TablesRead) {
                    $moduleStats[$r].TablesRead += $table
                }
            }
        }
        foreach ($w in $writers) {
            if ($moduleStats.ContainsKey($w)) {
                $moduleStats[$w].Writes++
                if ($table -notin $moduleStats[$w].TablesWritten) {
                    $moduleStats[$w].TablesWritten += $table
                }
            }
        }
    }

    # Detect patterns
    $silos = @()
    $conflicts = @()
    $healthyFlows = @()

    foreach ($table in ($crossFlows.Keys | Sort-Object)) {
        $r = $crossFlows[$table].Readers
        $w = $crossFlows[$table].Writers
        $allMods = @($r) + @($w) | Select-Object -Unique

        if ($allMods.Count -eq 1) {
            $silos += $table
        } elseif ($w.Count -gt 1) {
            $conflicts += $table
        } elseif ($w.Count -eq 1 -and $r.Count -ge 1) {
            $healthyFlows += $table
        }
    }

    foreach ($mod in ($moduleStats.Keys | Sort-Object)) {
        $s = $moduleStats[$mod]
        if ($s.Reads -gt 0 -or $s.Writes -gt 0) {
            Write-Host "       $($mod.ToUpper()): $($s.Reads) reads, $($s.Writes) writes" -ForegroundColor DarkCyan
        }
    }

    Write-OK "$($healthyFlows.Count) cross-flows sanos, $($silos.Count) silos, $($conflicts.Count) multi-writer"
}

# =============================================================================
# GENERADOR DE REPORTE
# =============================================================================
function Generate-Report {
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 0)
    $date = Get-Date -Format "yyyy-MM-dd HH:mm"

    if (-not (Test-Path $OutputDir)) { New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null }

    $report = @"
# Flow Trace Report v2 - $date

> Analisis estatico del flujo de datos y navegacion de FormulaMid 4.
> Generado por `flow-tracer.ps1 v2` en $elapsed segundos.

---

## 1. Navegacion

### Links rotos (destinos que no existen)

"@

    if ($brokenLinks.Count -gt 0) {
        $report += "| Origen | Destino | Estado |`n"
        $report += "|---|---|---|`n"
        foreach ($bl in $brokenLinks) {
            $report += "| ``$($bl.From)`` | ``$($bl.To)`` | **NO EXISTE** |`n"
        }
    } else {
        $report += "Ninguno. Todos los links apuntan a paginas existentes.`n"
    }

    $report += "`n### Mapa de navegacion`n`n"
    $report += "| Pagina | Destinos |`n"
    $report += "|---|---|`n"
    foreach ($page in ($navMap.Keys | Sort-Object)) {
        $pageName = Split-Path $page -Leaf
        $dests = ($navMap[$page] | ForEach-Object { Split-Path $_ -Leaf }) -join ", "
        $report += "| ``$pageName`` | $dests |`n"
    }

    $report += "`n### Paginas huerfanas (sin links entrantes)`n`n"
    if ($orphanPages.Count -gt 0) {
        foreach ($op in $orphanPages) {
            $report += "- ``$op```n"
        }
    } else {
        $report += "Ninguna.`n"
    }

    # â”€â”€ Tablas con R/W â”€â”€
    $report += "`n---`n`n## 2. Tablas Supabase (Read/Write)`n`n"
    $report += "### Tablas usadas en codigo pero NO en scheme.md`n`n"
    if ($brokenTables.Count -gt 0) {
        $report += "| Tabla | Usada en |`n"
        $report += "|---|---|`n"
        foreach ($bt in $brokenTables) {
            $files = $bt.UsedIn -join ", "
            $report += "| ``$($bt.Table)`` | $files |`n"
        }
    } else {
        $report += "Ninguna. Todas las tablas estan documentadas.`n"
    }

    $report += "`n### Uso de tablas por archivo (clasificado)`n`n"
    $report += "| Tabla | Reads (archivos) | Writes (archivos) |`n"
    $report += "|---|---|---|`n"
    foreach ($table in ($tableUsage.Keys | Sort-Object)) {
        $reads = if ($tableUsage[$table].Reads.Count -gt 0) { $tableUsage[$table].Reads -join ", " } else { "-" }
        $writes = if ($tableUsage[$table].Writes.Count -gt 0) { $tableUsage[$table].Writes -join ", " } else { "-" }
        $report += "| ``$table`` | $reads | $writes |`n"
    }

    if ($rpcUsage.Count -gt 0) {
        $report += "`n### Funciones RPC`n`n"
        $report += "| Funcion | Usada en |`n"
        $report += "|---|---|`n"
        foreach ($fn in ($rpcUsage.Keys | Sort-Object)) {
            $files = $rpcUsage[$fn] -join ", "
            $report += "| ``$fn`` | $files |`n"
        }
    }

    # â”€â”€ Cross-Module â”€â”€
    $report += "`n---`n`n## 3. Cross-Module Data Flows`n`n"
    $report += "### Resumen por modulo`n`n"
    $report += "| Modulo | Tablas leidas | Tablas escritas |`n"
    $report += "|---|---|---|`n"
    foreach ($mod in ($moduleStats.Keys | Sort-Object)) {
        $s = $moduleStats[$mod]
        if ($s.Reads -gt 0 -or $s.Writes -gt 0) {
            $report += "| **$($mod.ToUpper())** | $($s.Reads) | $($s.Writes) |`n"
        }
    }

    $report += "`n### Tablas compartidas entre modulos`n`n"
    $report += "| Tabla | Escritura (modulos) | Lectura (modulos) | Patron |`n"
    $report += "|---|---|---|---|`n"
    foreach ($table in ($crossFlows.Keys | Sort-Object)) {
        $r = $crossFlows[$table].Readers
        $w = $crossFlows[$table].Writers
        $allMods = @($r) + @($w) | Select-Object -Unique
        if ($allMods.Count -le 1) { continue }  # Skip silos

        $readMods = if ($r.Count -gt 0) { $r -join ", " } else { "-" }
        $writeMods = if ($w.Count -gt 0) { $w -join ", " } else { "-" }
        $pattern = if ($w.Count -gt 1) { "[!!] MULTI-WRITER" }
                   elseif ($w.Count -eq 1 -and $r.Count -ge 1) { "[OK] Cross-flow" }
                   else { "[RO] Read-only" }
        $report += "| ``$table`` | $writeMods | $readMods | $pattern |`n"
    }

    # Silos section
    $siloTables = @()
    foreach ($table in ($crossFlows.Keys | Sort-Object)) {
        $r = $crossFlows[$table].Readers
        $w = $crossFlows[$table].Writers
        $combined = [System.Collections.ArrayList]@()
        foreach ($item in $r) { [void]$combined.Add($item) }
        foreach ($item in $w) { if ($item -notin $combined) { [void]$combined.Add($item) } }
        if ($combined.Count -eq 1) { $siloTables += @{ Table = $table; Module = [string]$combined[0] } }
    }
    if ($siloTables.Count -gt 0) {
        $report += "`n### Silos de datos (tabla usada por un solo modulo)`n`n"
        $report += "| Tabla | Modulo |`n"
        $report += "|---|---|`n"
        foreach ($s in $siloTables) {
            $report += "| ``$($s.Table)`` | $($s.Module) |`n"
        }
    }

    # â”€â”€ JS Huerfanos â”€â”€
    $report += "`n---`n`n## 4. JS huerfanos (sin referencia HTML)`n`n"
    if ($orphanJs.Count -gt 0) {
        foreach ($oj in $orphanJs) {
            $report += "- ``$oj```n"
        }
    } else {
        $report += "Ninguno.`n"
    }

    # â”€â”€ Schema unused â”€â”€
    if ($schemaTables.Count -gt 0) {
        $unused = $schemaTables | Where-Object { $_ -notin ($tableUsage.Keys) }
        if ($unused.Count -gt 0) {
            $report += "`n---`n`n## 5. Tablas en schema sin uso en codigo`n`n"
            foreach ($t in $unused) {
                $report += "- ``$t```n"
            }
        }
    }

    $report += "`n---`n`n## Proximos pasos`n`n"
    $report += "- Resolver links rotos`n"
    $report += "- Documentar tablas faltantes en scheme.md`n"
    $report += "- Revisar paginas huerfanas`n"
    $report += "- Verificar JS huerfanos`n"
    $report += "- Investigar tablas con patron MULTI-WRITER`n"
    $report += "- Conectar silos de datos que deberian fluir entre modulos`n"

    $report | Out-File -FilePath $ReportFile -Encoding utf8
    return $ReportFile
}

# â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Clear-Host
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host "   FLOW TRACER v2 - FormulaMid 4" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "  Detecta: data-go + <a href> + navigateTo()" -ForegroundColor DarkGray
Write-Host "  Clasifica: .from().select = READ, .insert/.update = WRITE" -ForegroundColor DarkGray
Write-Host "  Cruza: tablas compartidas entre modulos" -ForegroundColor DarkGray
Write-Host ""

# Single run
Scan-Navigation
Scan-Tables
Scan-OrphanJs
Scan-CrossModule

# Resumen
$totalGaps = $brokenLinks.Count + $brokenTables.Count + $orphanPages.Count + $orphanJs.Count
Write-Host ""
if ($totalGaps -gt 0) {
    Write-Host "  GAPS DETECTADOS: $totalGaps total" -ForegroundColor Yellow
    Write-Host "    Links rotos: $($brokenLinks.Count) | Tablas sin doc: $($brokenTables.Count)" -ForegroundColor DarkGray
    Write-Host "    Paginas huerfanas: $($orphanPages.Count) | JS huerfanos: $($orphanJs.Count)" -ForegroundColor DarkGray
} else {
    Write-Host "  SIN GAPS - todo conectado" -ForegroundColor Green
}
Write-Host ""

# Generate report
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host "   GENERANDO REPORTE..." -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Blue

$reportPath = Generate-Report
Write-Host ""
Write-Host "  Reporte guardado: $reportPath" -ForegroundColor Green
Write-Host ""

# Optional Gemini analysis
if ($WithAnalysis) {
    $geminiExists = Get-Command gemini -EA SilentlyContinue
    if ($geminiExists) {
        Write-Host "  Invocando Gemini CLI para analisis..." -ForegroundColor Cyan
        Write-Host "  (esto puede tardar 30-60 segundos)" -ForegroundColor DarkGray
        Write-Host ""

        $reportContent = Get-Content $reportPath -Raw
        $prompt = @"
Sos el agente de QA del proyecto FormulaMid 4 (Midnight Club ERP).
Lee este reporte de flow-trace v2 y:

1. Identifica los 3 gaps mas criticos y por que son importantes
2. Propone el flujo ideal para cada modulo (admin, operativo, encargados, logistica)
3. Detecta datos que deberian fluir entre modulos pero no lo hacen
4. Lista acciones concretas ordenadas por prioridad

Reporte:
$reportContent
"@
        gemini -p $prompt
    } else {
        Write-Host "  Gemini CLI no detectado." -ForegroundColor Yellow
        $clipText = "Lee docs/80-ephemeral/agent-logs/qa/$(Split-Path $reportPath -Leaf) y analiza los gaps del flujo. Propone flujo ideal por modulo y acciones por prioridad."
        $clipText | Set-Clipboard
        Write-Host "  (Prompt copiado al clipboard)" -ForegroundColor Green
    }
}

Write-Host ""
