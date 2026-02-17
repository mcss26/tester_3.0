# =============================================================================
# Doc Mapper v1 - FormulaMid 4
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -DryRun
#   powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -OnlyCategory modules
#   powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -SkipCli
#   powershell -ExecutionPolicy Bypass -File scripts/doc-mapper.ps1 -Workers 3
#
# QUE HACE:
# 1. Escanea TODOS los .md del proyecto (excluye node_modules, .git, docs/output)
# 2. Extrae dependencias de cada uno:
#    - Referencias a otros .md (links markdown)
#    - Tablas/Vistas Supabase mencionadas
#    - Archivos JS/HTML referenciados
#    - RPCs / funciones mencionadas
#    - Modulos dependientes
# 3. Genera un mapa de dependencias en JSON + reporte .md
# 4. Invoca Gemini CLI para que mapee, actualice e indexe cada documento
#
# OUTPUT:
#   docs/output/qa/doc-map.json        (mapa de dependencias completo)
#   docs/output/qa/doc-map-report.md   (reporte legible)
# =============================================================================

param(
    [switch]$DryRun,                # Solo listar, no invocar CLI
    [switch]$SkipCli,               # Generar mapa pero no invocar CLI
    [string]$OnlyCategory = "",     # Filtrar: modules, guides, business-logic, migration, testing, core
    [int]$Workers = 2,              # Instancias paralelas de Gemini CLI
    [int]$DelayMs = 3000,           # Delay entre invocaciones (rate limit)
    [switch]$Verbose                # Mostrar contenido de dependencias encontradas
)

# == Paths ==
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot -or -not (Test-Path $ProjectRoot)) {
    $ProjectRoot = (Get-Location).Path
}

$OutputDir   = Join-Path $ProjectRoot "docs\output\qa"
$MapJson     = Join-Path $OutputDir "doc-map.json"
$MapReport   = Join-Path $OutputDir "doc-map-report.md"

# == Exclusiones ==
$ExcludeDirs = @(
    "node_modules",
    ".git",
    ".agent",
    ".claude",
    ".config",
    ".gemini",
    ".vscode",
    "docs\output"  # output de agentes - no son docs canonicos
)

# == Colores ==
function Write-OK    ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info  ($msg) { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
function Write-Warn  ($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Alert ($msg) { Write-Host "  [!!] $msg" -ForegroundColor Red }
function Write-Head  ($msg) { Write-Host "`n  $msg" -ForegroundColor Cyan }
function Write-Found ($msg) { Write-Host "  [+]  $msg" -ForegroundColor Yellow }

# == Patterns para extraer dependencias ==
$Patterns = @{
    # Links markdown: [texto](ruta.md) o [texto](./ruta.md)
    MdLinks     = '\[([^\]]*)\]\(\.?/?([^\)]+\.md)\)'
    # Tablas Supabase: .from('tabla') o `tabla` en contexto de tabla
    SupaTable   = '`((?:work_days|master_sku|cash_closings|closing_terminals|cash_movements|pos_terminals|pos_terminals_alias|bar_sessions|bar_stock_snapshots|bar_session_sales|replenishment_requests|replenishment_items|replenishment_supplier_orders|replenishment_receipts|replenishment_receipt_items|replenishment_tracking|master_categories|master_recipes|recipe_code_mappings|inventory_stock|inventory_movements|inventory_stock_adjustments|inventory_ideal|master_staff_roles|staff_convocations|staff_accruals|staff_functions|profile_functions|profiles|finance_payments|finance_payment_rules|finance_opening_cost_defs|finance_weekly_closings|cost_definitions|cost_config|accounts_payable|payment_categories|payment_methods|revenue_reports|revenue_details|consumption_reports|consumption_details|qr_batches|qr_codes|qr_checkins|members|auth_audit_log|audit_config|site_config|sku_change_requests|menu_categories|menu_items|master_proveedores|import_gbol_facturacion|import_gbol_comandas|import_gbol_withdrawals|gbol_sync_log|import_logs|stg_afip_facturas|stg_extracciones|stg_gbol_items|stg_passline_tickets|work_day_staff_planning|work_day_templates|events))`'
    # Vistas: vw_* o v_*
    SupaView    = '`((?:vw_|v_)\w+)`'
    # RPCs: rpc_* o admin_* o calculate_* o fn_*
    SupaRpc     = '`((?:rpc_|admin_|calculate_|fn_)\w+)`'
    # Archivos JS: assets/js/... o *.js
    JsFile      = '`((?:assets/js/|core/|modules/)[^\s`]+\.js)`'
    # Archivos HTML: pages/... o *.html
    HtmlFile    = '`((?:pages/)[^\s`]+\.html)`'
    # Archivos CSS
    CssFile     = '`((?:assets/css/)[^\s`]+\.css)`'
}

# =============================================================================
# INICIO
# =============================================================================
Clear-Host
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Magenta
Write-Host "   DOC MAPPER v1 - FormulaMid 4" -ForegroundColor White
Write-Host "  ==========================================" -ForegroundColor Magenta
Write-Host ""

$startTime = Get-Date

# =============================================================================
# 1. DESCUBRIR TODOS LOS .md
# =============================================================================
Write-Head "1. DESCUBRIMIENTO DE DOCUMENTOS"

$allMdFiles = Get-ChildItem $ProjectRoot -Recurse -Filter "*.md" -File -ErrorAction SilentlyContinue |
    Where-Object {
        $relPath = $_.FullName.Replace("$ProjectRoot\", "")
        $excluded = $false
        foreach ($ex in $ExcludeDirs) {
            if ($relPath.StartsWith($ex)) { $excluded = $true; break }
        }
        -not $excluded
    } |
    Sort-Object FullName

Write-OK "$($allMdFiles.Count) documentos .md encontrados"

# Categorizar documentos
function Get-DocCategory($relPath) {
    if ($relPath -match "^docs\\modules\\")          { return "modules" }
    if ($relPath -match "^docs\\guides\\")            { return "guides" }
    if ($relPath -match "^docs\\business-logic\\")    { return "business-logic" }
    if ($relPath -match "^docs\\migration\\")         { return "migration" }
    if ($relPath -match "^docs\\testing\\")           { return "testing" }
    if ($relPath -match "^docs\\audits\\")            { return "audits" }
    if ($relPath -match "^docs\\codex\\")             { return "codex" }
    if ($relPath -match "^docs\\important-data-reference\\") { return "data-reference" }
    if ($relPath -match "^docs\\")                    { return "core" }
    if ($relPath -match "^scripts\\")                 { return "scripts" }
    if ($relPath -match "^supabase\\")                { return "supabase" }
    return "root"
}

# =============================================================================
# 2. EXTRAER DEPENDENCIAS
# =============================================================================
Write-Head "2. EXTRACCION DE DEPENDENCIAS"

$docMap = @()
$totalDeps = 0

foreach ($mdFile in $allMdFiles) {
    $relPath  = $mdFile.FullName.Replace("$ProjectRoot\", "")
    $category = Get-DocCategory $relPath

    # Filtrar por categoría si se especificó
    if ($OnlyCategory -ne "" -and $category -ne $OnlyCategory) { continue }

    $content = Get-Content $mdFile.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    $lines = Get-Content $mdFile.FullName -ErrorAction SilentlyContinue
    $lineCount = if ($lines) { $lines.Count } else { 0 }

    # Extraer título (primer H1)
    $title = ""
    if ($content -match '(?m)^#\s+(.+)$') { $title = $Matches[1].Trim() }

    # Extraer dependencias
    $mdLinks   = @([regex]::Matches($content, $Patterns.MdLinks)   | ForEach-Object { $_.Groups[2].Value } | Select-Object -Unique)
    $tables    = @([regex]::Matches($content, $Patterns.SupaTable)  | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique | Sort-Object)
    $views     = @([regex]::Matches($content, $Patterns.SupaView)   | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique | Sort-Object)
    $rpcs      = @([regex]::Matches($content, $Patterns.SupaRpc)    | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique | Sort-Object)
    $jsFiles   = @([regex]::Matches($content, $Patterns.JsFile)     | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique | Sort-Object)
    $htmlFiles = @([regex]::Matches($content, $Patterns.HtmlFile)   | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique | Sort-Object)
    $cssFiles  = @([regex]::Matches($content, $Patterns.CssFile)    | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique | Sort-Object)

    $depCount = $mdLinks.Count + $tables.Count + $views.Count + $rpcs.Count + $jsFiles.Count + $htmlFiles.Count + $cssFiles.Count
    $totalDeps += $depCount

    $entry = [PSCustomObject]@{
        path       = $relPath -replace '\\', '/'
        title      = $title
        category   = $category
        lines      = $lineCount
        sizeKb     = [math]::Round($mdFile.Length / 1024, 1)
        modified   = $mdFile.LastWriteTime.ToString("yyyy-MM-dd")
        deps       = [PSCustomObject]@{
            md_links    = $mdLinks
            tables      = $tables
            views       = $views
            rpcs        = $rpcs
            js_files    = $jsFiles
            html_files  = $htmlFiles
            css_files   = $cssFiles
        }
        dep_count  = $depCount
    }
    $docMap += $entry

    if ($depCount -gt 0) {
        Write-Found "$relPath → $depCount dependencias"
    } else {
        Write-Info  "$relPath (sin dependencias detectadas)"
    }
}

Write-Host ""
Write-OK "$($docMap.Count) documentos procesados | $totalDeps dependencias totales"

# =============================================================================
# 3. ANALISIS DE GRAFO
# =============================================================================
Write-Head "3. ANALISIS DE GRAFO"

# Documentos huérfanos (nadie los referencia)
$allPaths = $docMap | ForEach-Object { $_.path }
$referencedPaths = @()
foreach ($d in $docMap) {
    foreach ($link in $d.deps.md_links) {
        # Resolver path relativo
        $basePath = Split-Path $d.path
        if (-not $basePath -or $basePath -eq "") {
            $resolved = $link
        } else {
            $resolved = Join-Path $basePath $link
        }
        $resolved = $resolved -replace '\\', '/'
        # Normalizar (remove ./ y ../)
        $resolved = $resolved -replace '/\./', '/'
        $referencedPaths += $resolved
    }
}
$referencedPaths = $referencedPaths | Select-Object -Unique

$orphans = $allPaths | Where-Object { $_ -notin $referencedPaths -and $_ -ne "docs/INDEX.md" -and $_ -ne "AGENT.md" -and $_ -ne "README.md" }

# Tablas más referenciadas
$tableFreq = @{}
foreach ($d in $docMap) {
    foreach ($t in $d.deps.tables) {
        if ($tableFreq.ContainsKey($t)) { $tableFreq[$t]++ } else { $tableFreq[$t] = 1 }
    }
}
$topTables = $tableFreq.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 15

# Documentos más conectados
$topConnected = $docMap | Sort-Object dep_count -Descending | Select-Object -First 10

# Categorías
$categories = $docMap | Group-Object category | Sort-Object Count -Descending

Write-OK "Huerfanos: $($orphans.Count) documentos sin referencia entrante"
Write-OK "Top tabla: $(if ($topTables.Count -gt 0) { "$($topTables[0].Key) ($($topTables[0].Value) refs)" } else { 'ninguna' })"
Write-OK "Top doc: $(if ($topConnected.Count -gt 0) { "$($topConnected[0].path) ($($topConnected[0].dep_count) deps)" } else { 'ninguno' })"

# =============================================================================
# 4. GENERAR OUTPUT
# =============================================================================
Write-Head "4. GENERANDO REPORTES"

if (-not (Test-Path $OutputDir)) { New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null }

# 4a. JSON
$jsonOutput = [PSCustomObject]@{
    generated    = (Get-Date -Format "yyyy-MM-dd HH:mm")
    project      = "FormulaMid 4"
    total_docs   = $docMap.Count
    total_deps   = $totalDeps
    orphan_count = $orphans.Count
    categories   = ($categories | ForEach-Object { [PSCustomObject]@{ name = $_.Name; count = $_.Count } })
    documents    = $docMap
}
$jsonOutput | ConvertTo-Json -Depth 6 | Out-File $MapJson -Encoding utf8
Write-OK "JSON: $MapJson"

# 4b. Reporte Markdown
$report = @()
$report += "# Doc Mapper Report -- FormulaMid 4"
$report += ""
$report += "`> **Generado:** $(Get-Date -Format 'yyyy-MM-dd HH:mm') | **Documentos:** $($docMap.Count) | **Dependencias:** $totalDeps"
$report += ""
$report += "---"
$report += ""

# Resumen por categoría
$report += "## 1. Resumen por Categoría"
$report += ""
$report += "| Categoria | Cantidad | Dependencias |"
$report += "| :--- | :---: | :---: |"
foreach ($cat in $categories) {
    $catDeps = ($docMap | Where-Object { $_.category -eq $cat.Name } | Measure-Object -Property dep_count -Sum).Sum
    $report += "| **$($cat.Name)** | $($cat.Count) | $catDeps |"
}
$report += ""

# Top tablas
$report += "## 2. Tablas Mas Referenciadas"
$report += ""
$report += "| Tabla | Referencias |"
$report += "| :--- | :---: |"
foreach ($t in $topTables) {
    $report += "| ``$($t.Key)`` | $($t.Value) |"
}
$report += ""

# Top documentos conectados
$report += "## 3. Documentos Mas Conectados"
$report += ""
$report += "| Documento | Categoría | Deps | Tablas | Vistas | RPCs |"
$report += "| :--- | :--- | :---: | :---: | :---: | :---: |"
foreach ($tc in $topConnected) {
    $tCount = $tc.deps.tables.Count
    $vCount = $tc.deps.views.Count
    $rCount = $tc.deps.rpcs.Count
    $report += "| ``$($tc.path)`` | $($tc.category) | $($tc.dep_count) | $tCount | $vCount | $rCount |"
}
$report += ""

# Huérfanos
$report += "## 4. Documentos Huerfanos (sin referencia entrante)"
$report += ""
if ($orphans.Count -gt 0) {
    foreach ($o in $orphans) {
        $oDoc = $docMap | Where-Object { $_.path -eq $o }
        $title = if ($oDoc -and $oDoc.title) { $oDoc.title } else { "(sin titulo)" }
        $report += "- ``$o`` -- $title"
    }
} else {
    $report += "Todos conectados ✅"
}
$report += ""

# Inventario completo
$report += "## 5. Inventario Completo"
$report += ""

foreach ($cat in $categories) {
    $report += "### $($cat.Name) ($($cat.Count) docs)"
    $report += ""
    $catDocs = $docMap | Where-Object { $_.category -eq $cat.Name } | Sort-Object path
    foreach ($cd in $catDocs) {
        $report += "#### ``$($cd.path)``"
        $report += "- **Titulo:** $($cd.title)"
        $report += "- **Lineas:** $($cd.lines) | **Tamano:** $($cd.sizeKb) KB | **Modificado:** $($cd.modified)"

        if ($cd.deps.md_links.Count -gt 0)   { $report += "- **Links MD:** $($cd.deps.md_links -join ', ')" }
        if ($cd.deps.tables.Count -gt 0)     { $report += "- **Tablas:** ``$($cd.deps.tables -join '``, ``')``" }
        if ($cd.deps.views.Count -gt 0)      { $report += "- **Vistas:** ``$($cd.deps.views -join '``, ``')``" }
        if ($cd.deps.rpcs.Count -gt 0)       { $report += "- **RPCs:** ``$($cd.deps.rpcs -join '``, ``')``" }
        if ($cd.deps.js_files.Count -gt 0)   { $report += "- **JS:** ``$($cd.deps.js_files -join '``, ``')``" }
        if ($cd.deps.html_files.Count -gt 0) { $report += "- **HTML:** ``$($cd.deps.html_files -join '``, ``')``" }
        if ($cd.deps.css_files.Count -gt 0)  { $report += "- **CSS:** ``$($cd.deps.css_files -join '``, ``')``" }

        $report += ""
    }
}

$report -join "`n" | Out-File $MapReport -Encoding utf8
Write-OK "Reporte: $MapReport"

# =============================================================================
# 5. INVOCACION A GEMINI CLI
# =============================================================================

if ($DryRun) {
    Write-Host ""
    Write-Head "MODO DRY RUN -- no se invoca CLI"
    Write-Info "Documentos detectados: $($docMap.Count)"
    Write-Info "Para ejecutar: scripts/doc-mapper.ps1"
    Write-Info "Para solo mapa: scripts/doc-mapper.ps1 -SkipCli"
    Write-Host ""
    exit 0
}

if ($SkipCli) {
    Write-Host ""
    Write-Head "MAPA GENERADO -- CLI omitido por -SkipCli"
    Write-OK "JSON: $MapJson"
    Write-OK "Reporte: $MapReport"
    Write-Host ""
    exit 0
}

# Verificar Gemini CLI
$geminiPath = Get-Command "gemini" -ErrorAction SilentlyContinue
if (-not $geminiPath) {
    Write-Alert "gemini CLI no encontrado en PATH"
    Write-Info  "El mapa fue generado correctamente."
    Write-Info  "Instala gemini CLI para la fase de indexación automática."
    Write-Host ""
    exit 1
}

Write-Head "5. INVOCACION GEMINI CLI"

# Generar el prompt maestro con el mapa completo
$mapContent = Get-Content $MapReport -Raw -Encoding UTF8

$masterPrompt = @"
Sos el agente QA del proyecto FormulaMid 4.

Recibiste el mapa completo de documentación del proyecto con dependencias.
Tu trabajo es:

1. **VERIFICAR** que cada documento tenga sus dependencias correctas y actualizadas.
2. **DETECTAR** documentos desactualizados (comparando fecha de modificación con sus dependencias).
3. **IDENTIFICAR** dependencias rotas (links a archivos que no existen, tablas renombradas, RPCs obsoletas).
4. **RECOMENDAR** acciones concretas:
   - Documentos que necesitan actualización
   - Links rotos que reparar
   - Dependencias faltantes que agregar
   - Documentos huérfanos que conectar o eliminar

5. **GENERAR** un reporte de acción con prioridades (CRITICO / ALTO / MEDIO / BAJO).

== MAPA DE DOCUMENTACION ==

$mapContent

== FIN DEL MAPA ==

Genera el reporte de acción. Sé conciso y accionable.
Para cada hallazgo incluye:
- Prioridad (CRITICO/ALTO/MEDIO/BAJO)
- Documento afectado
- Problema detectado
- Acción recomendada

Al final, incluye un resumen ejecutivo con el health score general de la documentación (0-100).
"@

Write-Info "Enviando mapa completo a Gemini CLI..."
Write-Info "($($docMap.Count) documentos, $totalDeps dependencias)"

$cliOutputFile = Join-Path $OutputDir "doc-map-actions.md"

$job = Start-Job -ScriptBlock {
    param($Prompt, $OutputPath, $ProjectDir)
    Set-Location $ProjectDir
    $result = $Prompt | & gemini 2>&1
    if ($LASTEXITCODE -eq 0 -or $result) {
        # Prepend header
        $header = "# Doc Mapper -- Acciones Recomendadas`n`n> Generado por Gemini CLI: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`n`n---`n`n"
        ($header + ($result -join "`n")) | Out-File $OutputPath -Encoding utf8
        return @{ Success = $true; Lines = ($result | Measure-Object).Count }
    } else {
        return @{ Success = $false; Error = "Exit code: $LASTEXITCODE" }
    }
} -ArgumentList $masterPrompt, $cliOutputFile, $ProjectRoot

Write-Info "Job lanzado (ID: $($job.Id)). Esperando respuesta..."

# Esperar con timeout de 5 minutos
$result = $job | Wait-Job -Timeout 300 | Receive-Job

if ($result.Success) {
    Write-OK "Reporte de acciones generado ($($result.Lines) lineas)"
    Write-OK "Archivo: $cliOutputFile"
} else {
    Write-Alert "Error en CLI: $($result.Error)"
    Write-Info  "El mapa fue generado correctamente. Revisa manualmente."
}

Remove-Job $job -Force -ErrorAction SilentlyContinue

# =============================================================================
# 6. PROCESAMIENTO INDIVIDUAL POR DOCUMENTO (opcional - solo docs criticos)
# =============================================================================

# Identificar docs críticos (core + módulos con alta conectividad)
$criticalDocs = $docMap | Where-Object {
    $_.category -eq "core" -or
    ($_.category -eq "modules" -and $_.dep_count -ge 5) -or
    $_.path -in @("AGENT.md", "docs/INDEX.md", "docs/backend-architecture-map.md")
}

if ($criticalDocs.Count -gt 0 -and -not $SkipCli) {
    Write-Head "6. INDEXACION INDIVIDUAL DE DOCS CRITICOS ($($criticalDocs.Count))"

    $batchCompleted = 0
    $batchFailed    = 0

    for ($i = 0; $i -lt $criticalDocs.Count; $i += $Workers) {
        $batch = @($criticalDocs[$i..([math]::Min($i + $Workers - 1, $criticalDocs.Count - 1))])
        $batchIdx = [math]::Floor($i / $Workers) + 1
        $totalBatches = [math]::Ceiling($criticalDocs.Count / $Workers)

        Write-Info "Batch $batchIdx/$totalBatches"

        $batchJobs = @()
        foreach ($doc in $batch) {
            $docContent = Get-Content (Join-Path $ProjectRoot ($doc.path -replace '/', '\')) -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if (-not $docContent) { continue }

            # Truncar si es muy largo
            if ($docContent.Length -gt 15000) {
                $docContent = $docContent.Substring(0, 15000) + "`n`n[... truncado a 15000 chars ...]"
            }

            $docPrompt = @"
Sos el agente QA del proyecto FormulaMid 4.
Analiza este documento y genera un mini-reporte de salud:

**Documento:** ``$($doc.path)``
**Categoria:** $($doc.category)
**Dependencias detectadas:**
- Tablas: $($doc.deps.tables -join ', ')
- Vistas: $($doc.deps.views -join ', ')
- RPCs: $($doc.deps.rpcs -join ', ')
- Links: $($doc.deps.md_links -join ', ')

== CONTENIDO ==
$docContent
== FIN ==

Responde SOLO con formato:
## $($doc.path)
- **Estado:** [ACTUALIZADO|DESACTUALIZADO|INCOMPLETO]
- **Problemas:** [lista o "Ninguno"]
- **Acciones:** [lista o "Ninguna"]
- **Score:** [0-100]
"@

            $docOutputFile = Join-Path $OutputDir "doc-index-$($doc.path -replace '[/\\:]', '-').md"

            $j = Start-Job -ScriptBlock {
                param($Prompt, $OutputPath, $ProjectDir)
                Set-Location $ProjectDir
                $result = $Prompt | & gemini 2>&1
                if ($LASTEXITCODE -eq 0 -or $result) {
                    $result -join "`n" | Out-File $OutputPath -Encoding utf8
                    return @{ Success = $true }
                }
                return @{ Success = $false }
            } -ArgumentList $docPrompt, $docOutputFile, $ProjectRoot

            $batchJobs += @{ Job = $j; Doc = $doc }

            if ($DelayMs -gt 0) { Start-Sleep -Milliseconds $DelayMs }
        }

        # Esperar batch
        foreach ($bj in $batchJobs) {
            $r = $bj.Job | Wait-Job -Timeout 120 | Receive-Job
            if ($r.Success) {
                $batchCompleted++
                Write-OK "$($bj.Doc.path)"
            } else {
                $batchFailed++
                Write-Warn "$($bj.Doc.path) - timeout o error"
            }
            Remove-Job $bj.Job -Force -ErrorAction SilentlyContinue
        }

        # Delay entre batches
        if ($i + $Workers -lt $criticalDocs.Count) {
            Start-Sleep -Milliseconds ($DelayMs * 2)
        }
    }

    Write-Host ""
    Write-OK "Indexacion: $batchCompleted OK, $batchFailed fallidos"
}

# =============================================================================
# RESUMEN FINAL
# =============================================================================
$elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Magenta
Write-Host "   RESUMEN FINAL" -ForegroundColor White
Write-Host "  ==========================================" -ForegroundColor Magenta
Write-Host ""
Write-OK    "Documentos escaneados: $($docMap.Count)"
Write-OK    "Dependencias totales:  $totalDeps"
Write-OK    "Huerfanos:             $($orphans.Count)"
Write-OK    "Tiempo:                ${elapsed} segundos"
Write-Host ""
Write-Info  "JSON:     $MapJson"
Write-Info  "Reporte:  $MapReport"
if (Test-Path $cliOutputFile) {
    Write-Info "Acciones: $cliOutputFile"
}
Write-Host ""

# Categorías resumen
foreach ($cat in $categories) {
    $icon = switch ($cat.Name) {
        "core"           { "[C]" }
        "modules"        { "[M]" }
        "guides"         { "[G]" }
        "business-logic" { "[B]" }
        "migration"      { "[R]" }
        "testing"        { "[T]" }
        "audits"         { "[A]" }
        "scripts"        { "[S]" }
        "supabase"       { "[D]" }
        default          { "[?]" }
    }
    Write-Host "  $icon $($cat.Name): $($cat.Count) docs" -ForegroundColor DarkGray
}

Write-Host ""
