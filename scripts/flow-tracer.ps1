# =============================================================================
# Flow Tracer v1 - FormulaMid 4
# Usage: powershell -ExecutionPolicy Bypass -File scripts/flow-tracer.ps1
#
# QUE HACE ESTE SCRIPT:
#
# Recorre tu codigo fuente analizando como se conectan las piezas:
# - HTML: que paginas existen, a donde navegan (data-go)
# - JS: que tablas de Supabase leen/escriben, que funciones exportan
# - Schema: que tablas deberian existir segun docs/scheme.md
#
# Al pausar con Ctrl+C, genera un reporte en docs/output/qa/ y
# opcionalmente invoca Claude CLI para que analice los gaps.
#
# Pensalo como un detective que sigue el rastro del dinero (o los datos)
# a traves de tu sistema y te dice donde se pierde la pista.
# =============================================================================

param(
    [int]$IntervalSeconds = 120,
    [switch]$NoAnalysis  # Saltear el analisis con Claude CLI al pausar
)

$ProjectRoot = "C:\Users\siste\Documents\GitHub\tester_3.0"
$PagesDir    = Join-Path $ProjectRoot "pages"
$JsDir       = Join-Path $ProjectRoot "assets\js"
$SchemaFile  = Join-Path $ProjectRoot "docs\scheme.md"
$OutputDir   = Join-Path $ProjectRoot "docs\output\qa"
$ReportFile  = Join-Path $OutputDir "$(Get-Date -Format 'yyyy-MM-dd')_audit_flow-trace.md"

$startTime   = Get-Date
$scanCount   = 0

# ── State acumulado ──
$navMap       = @{}    # pagina -> [destinos data-go]
$tableUsage   = @{}    # tabla -> [archivos que la usan]
$brokenLinks  = @()    # data-go a paginas que no existen
$brokenTables = @()    # .from('tabla') donde tabla no esta en schema
$orphanPages  = @()    # paginas sin ningun data-go apuntando a ellas
$orphanJs     = @()    # JS sin HTML que lo referencie
$functionMap  = @{}    # archivo.js -> [funciones exportadas]
$scriptRefs   = @{}    # HTML -> [JS que referencia via <script>]
$schemaTables = @()    # tablas del schema

# ── Colores ──
function Write-OK   ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info ($msg) { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
function Write-Warn ($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Alert($msg) { Write-Host "  [!!] $msg" -ForegroundColor Red }
function Write-Gap  ($msg) { Write-Host "  [G]  $msg" -ForegroundColor Magenta }
function Write-Head ($msg) { Write-Host "`n  $msg" -ForegroundColor Cyan }

# =============================================================================
# SCAN 1: MAPA DE NAVEGACION
# Lee todos los HTML, extrae data-go, y verifica que el destino exista.
# =============================================================================
function Scan-Navigation {
    Write-Head "1. MAPA DE NAVEGACION (data-go)"
    Write-Info "Sigo los links entre paginas HTML"

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

        # Extraer todos los data-go
        $goMatches = [regex]::Matches($content, 'data-go="([^"]+)"')
        $destinations = @()
        foreach ($m in $goMatches) {
            $dest = $m.Groups[1].Value
            $destinations += $dest
            $totalLinks++

            # Verificar que el destino existe
            $fullDest = Join-Path $ProjectRoot $dest
            if (-not (Test-Path $fullDest)) {
                $script:brokenLinks += @{ From = $rel; To = $dest }
            }
        }
        if ($destinations.Count -gt 0) {
            $script:navMap[$rel] = $destinations
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
        $_ -notmatch '(index\.html|components_catalog|layout_patterns|test-|generator|module-audit|monitor)'
    })

    Write-OK "$totalLinks links encontrados en $($htmlFiles.Count) paginas"
    if ($brokenLinks.Count -gt 0) {
        Write-Alert "$($brokenLinks.Count) links rotos:"
        foreach ($bl in $brokenLinks) {
            Write-Gap  "$($bl.From) -> $($bl.To) (NO EXISTE)"
        }
    } else { Write-OK "Todos los data-go apuntan a paginas que existen" }

    if ($orphanPages.Count -gt 0) {
        Write-Warn "$($orphanPages.Count) paginas sin ningun link apuntando a ellas"
    }
}

# =============================================================================
# SCAN 2: TABLAS SUPABASE
# Extrae todas las .from('tabla') del JS y cruza con scheme.md.
# =============================================================================
function Scan-Tables {
    Write-Head "2. TABLAS SUPABASE (.from)"
    Write-Info "Cruzo las queries del JS con el schema documentado"

    # Leer tablas del schema
    $script:schemaTables = @()
    if (Test-Path $SchemaFile) {
        $schemaContent = Get-Content $SchemaFile -Raw
        $tableMatches = [regex]::Matches($schemaContent, '(?m)^#{2,3}\s+(?:Tabla:\s+)?`?(\w+)`?')
        foreach ($m in $tableMatches) {
            $script:schemaTables += $m.Groups[1].Value.ToLower()
        }
        # Tambien capturar nombres de vista (vw_*)
        $viewMatches = [regex]::Matches($schemaContent, '(?m)(vw_\w+)')
        foreach ($m in $viewMatches) {
            $script:schemaTables += $m.Groups[1].Value.ToLower()
        }
        $script:schemaTables = $script:schemaTables | Select-Object -Unique
    }

    # Extraer .from('tabla') de todos los JS
    $script:tableUsage = @{}
    $script:brokenTables = @()
    $jsFiles = Get-ChildItem $JsDir -Recurse -Filter "*.js" -EA SilentlyContinue

    foreach ($js in $jsFiles) {
        $content = Get-Content $js.FullName -Raw -EA SilentlyContinue
        if (-not $content) { continue }
        $rel = $js.FullName.Replace("$ProjectRoot\", "").Replace("\", "/")

        $fromMatches = [regex]::Matches($content, "\.from\(['""](\w+)['""]\)")
        foreach ($m in $fromMatches) {
            $table = $m.Groups[1].Value.ToLower()
            if (-not $tableUsage.ContainsKey($table)) {
                $tableUsage[$table] = @()
            }
            if ($rel -notin $tableUsage[$table]) {
                $tableUsage[$table] += $rel
            }
        }
    }

    $usedTables = $tableUsage.Keys | Sort-Object
    Write-OK "$($usedTables.Count) tablas/vistas referenciadas en el codigo"

    if ($schemaTables.Count -gt 0) {
        Write-Info "Schema tiene $($schemaTables.Count) tablas documentadas"

        # Tablas usadas pero no en schema
        $undocumented = $usedTables | Where-Object { $_ -notin $schemaTables }
        if ($undocumented.Count -gt 0) {
            Write-Warn "$($undocumented.Count) tablas usadas pero NO en scheme.md:"
            foreach ($t in $undocumented) {
                $files = ($tableUsage[$t] | ForEach-Object { Split-Path $_ -Leaf }) -join ", "
                Write-Gap  "$t (usada en: $files)"
                $script:brokenTables += @{ Table = $t; UsedIn = $tableUsage[$t] }
            }
        }

        # Tablas en schema pero nunca usadas
        $unused = $schemaTables | Where-Object { $_ -notin $usedTables }
        if ($unused.Count -gt 0) {
            Write-Info "$($unused.Count) tablas en schema pero sin uso en el codigo"
        }
    } else {
        Write-Warn "No se pudo leer scheme.md para cruzar tablas"
    }
}

# =============================================================================
# SCAN 3: JS HUERFANOS
# Busca archivos JS que ningun HTML referencia via <script>.
# =============================================================================
function Scan-OrphanJs {
    Write-Head "3. JS HUERFANOS"
    Write-Info "Busco archivos JS que ningun HTML carga"

    $allJsFiles = Get-ChildItem $JsDir -Recurse -Filter "*.js" -EA SilentlyContinue |
        ForEach-Object { $_.Name }
    $referencedJs = $scriptRefs.Values | ForEach-Object { $_ } |
        ForEach-Object { Split-Path $_ -Leaf } | Select-Object -Unique

    # JS compartidos que siempre se cargan (no huerfanos)
    $shared = @('supabase-client.js','auth.js','navigation.js','config.js','constants.js',
                'utils.js','toast.js','panel.js','error-logger.js','breadcrumbs.js',
                'keyboard-nav.js','tab-manager.js','navigation-analytics.js',
                'navigation-debug.js','navigation-history.js','navigation-state.js',
                'chart-helper.js','chart-loader.js','work-day-helper.js')

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
# SCAN 4: FLUJO DE DATOS (RESUMEN)
# Construye un resumen de como fluyen los datos por modulo.
# =============================================================================
function Scan-DataFlow {
    Write-Head "4. FLUJO DE DATOS POR MODULO"
    Write-Info "Agrupo paginas y tablas por modulo de negocio"

    $modules = @{
        'admin'      = @{ Pages = @(); Tables = @() }
        'operativo'  = @{ Pages = @(); Tables = @() }
        'encargados' = @{ Pages = @(); Tables = @() }
        'logistica'  = @{ Pages = @(); Tables = @() }
        'staff'      = @{ Pages = @(); Tables = @() }
    }

    # Agrupar paginas por modulo
    foreach ($page in $navMap.Keys) {
        foreach ($mod in $modules.Keys) {
            if ($page -match $mod) {
                $modules[$mod].Pages += $page
            }
        }
    }

    # Agrupar tablas por modulo (segun que JS las usa)
    foreach ($table in $tableUsage.Keys) {
        foreach ($file in $tableUsage[$table]) {
            foreach ($mod in $modules.Keys) {
                if ($file -match $mod -and $table -notin $modules[$mod].Tables) {
                    $modules[$mod].Tables += $table
                }
            }
        }
    }

    foreach ($mod in $modules.Keys | Sort-Object) {
        $p = $modules[$mod].Pages.Count
        $t = $modules[$mod].Tables.Count
        if ($p -gt 0 -or $t -gt 0) {
            Write-Host "       $($mod.ToUpper()): $p paginas, $t tablas" -ForegroundColor DarkCyan
        }
    }
}

# =============================================================================
# GENERADOR DE REPORTE (al pausar con Ctrl+C)
# =============================================================================
function Generate-Report {
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
    $date = Get-Date -Format "yyyy-MM-dd HH:mm"

    if (-not (Test-Path $OutputDir)) { New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null }

    $report = @"
# Flow Trace Report - $date

## Contexto
Analisis estatico del flujo de datos y navegacion de FormulaMid 4.
Generado por flow-tracer.ps1 despues de $scanCount scans ($elapsed min).

## Navegacion (data-go)

### Links rotos (paginas que no existen)
"@

    if ($brokenLinks.Count -gt 0) {
        foreach ($bl in $brokenLinks) {
            $report += "`n- ``$($bl.From)`` -> ``$($bl.To)`` **NO EXISTE**"
        }
    } else {
        $report += "`nNinguno. Todos los data-go apuntan a paginas existentes."
    }

    $report += "`n`n### Paginas huerfanas (sin links entrantes)"
    if ($orphanPages.Count -gt 0) {
        foreach ($op in $orphanPages) {
            $report += "`n- ``$op``"
        }
    } else {
        $report += "`nNinguna."
    }

    $report += "`n`n## Tablas Supabase"
    $report += "`n`n### Tablas usadas en codigo pero NO en scheme.md"
    if ($brokenTables.Count -gt 0) {
        foreach ($bt in $brokenTables) {
            $files = ($bt.UsedIn | ForEach-Object { Split-Path $_ -Leaf }) -join ", "
            $report += "`n- ``$($bt.Table)`` (usada en: $files)"
        }
    } else {
        $report += "`nNinguna. Todas las tablas estan documentadas."
    }

    $report += "`n`n### Uso de tablas por archivo"
    foreach ($table in ($tableUsage.Keys | Sort-Object)) {
        $files = ($tableUsage[$table] | ForEach-Object { Split-Path $_ -Leaf }) -join ", "
        $report += "`n- ``$table``: $files"
    }

    $report += "`n`n## JS huerfanos (sin referencia HTML)"
    if ($orphanJs.Count -gt 0) {
        foreach ($oj in $orphanJs) {
            $report += "`n- ``$oj``"
        }
    } else {
        $report += "`nNinguno."
    }

    $report += "`n`n## Mapa de navegacion"
    foreach ($page in ($navMap.Keys | Sort-Object)) {
        $dests = ($navMap[$page] | ForEach-Object { Split-Path $_ -Leaf }) -join " -> "
        $report += "`n- ``$(Split-Path $page -Leaf)`` -> $dests"
    }

    $report += "`n`n## Proximos pasos"
    $report += "`n- Resolver links rotos"
    $report += "`n- Documentar tablas faltantes en scheme.md"
    $report += "`n- Revisar paginas huerfanas (eliminar o conectar)"
    $report += "`n- Verificar JS huerfanos (eliminar o integrar)"

    $report | Out-File -FilePath $ReportFile -Encoding utf8
    return $ReportFile
}

# ── Main ─────────────────────────────────────────────────────────────────────
Clear-Host
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host "   FLOW TRACER v1 - FormulaMid 4" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "  Que hace: recorre tu codigo siguiendo el flujo de" -ForegroundColor DarkGray
Write-Host "  datos y navegacion. Detecta links rotos, tablas" -ForegroundColor DarkGray
Write-Host "  sin documentar, JS huerfanos, y paginas aisladas." -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Al pausar con Ctrl+C:" -ForegroundColor DarkGray
Write-Host "    1. Genera reporte en docs/output/qa/" -ForegroundColor DarkGray
Write-Host "    2. Invoca Claude CLI para analisis inteligente" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Ctrl+C para generar reporte y analizar" -ForegroundColor DarkGray
Write-Host ""

try {
    while ($true) {
        $scanCount++
        $ts = Get-Date -Format "HH:mm:ss"
        $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 0)
        Write-Host "=== Scan #$scanCount @ $ts (sesion: $elapsed min) ===" -ForegroundColor White

        Scan-Navigation
        Scan-Tables
        Scan-OrphanJs
        Scan-DataFlow

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
        Write-Host "  Ctrl+C para generar reporte. Proximo scan en $IntervalSeconds seg..." -ForegroundColor DarkGray
        Write-Host ""

        Start-Sleep -Seconds $IntervalSeconds
    }
}
finally {
    Write-Host ""
    Write-Host "  ========================================" -ForegroundColor Blue
    Write-Host "   GENERANDO REPORTE..." -ForegroundColor White
    Write-Host "  ========================================" -ForegroundColor Blue

    $reportPath = Generate-Report
    Write-Host ""
    Write-Host "  Reporte guardado: $reportPath" -ForegroundColor Green
    Write-Host ""

    if (-not $NoAnalysis) {
        # Verificar que Claude CLI esta disponible
        $claudeExists = Get-Command claude -EA SilentlyContinue
        if ($claudeExists) {
            Write-Host "  Invocando Claude CLI para analisis..." -ForegroundColor Cyan
            Write-Host "  (esto puede tardar 30-60 segundos)" -ForegroundColor DarkGray
            Write-Host ""

            $reportContent = Get-Content $reportPath -Raw
            $prompt = @"
Sos el agente de QA del proyecto FormulaMid 4 (Midnight Club ERP).
Lee este reporte de flow-trace y:

1. Identifica los 3 gaps mas criticos y por que son importantes
2. Propone el flujo ideal para cada modulo (admin, operativo, encargados, logistica)
3. Detecta datos que deberian fluir entre modulos pero no lo hacen
4. Lista acciones concretas ordenadas por prioridad

Reporte:
$reportContent
"@
            claude -p $prompt
        } else {
            Write-Host "  Claude CLI no encontrado. Instala con: npm install -g @anthropic-ai/claude-code" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  Para analizar manualmente, abre una conversacion y pega:" -ForegroundColor DarkGray
            Write-Host "  'Lee docs/output/qa/$(Split-Path $reportPath -Leaf) y analiza los gaps'" -ForegroundColor White

            # Copiar prompt al clipboard
            $clipText = "Lee docs/output/qa/$(Split-Path $reportPath -Leaf) y analiza los gaps del flujo. Propone flujo ideal por modulo y acciones por prioridad."
            $clipText | Set-Clipboard
            Write-Host ""
            Write-Host "  (Prompt copiado al clipboard - pegalo con Ctrl+V)" -ForegroundColor Green
        }
    } else {
        Write-Host "  Analisis con Claude CLI omitido (flag -NoAnalysis)" -ForegroundColor DarkGray
    }

    Write-Host ""
}
