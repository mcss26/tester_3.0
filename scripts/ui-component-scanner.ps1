# =============================================================================
# UI Component Scanner v1 - FormulaMid 4
# Usage: powershell -ExecutionPolicy Bypass -File scripts/ui-component-scanner.ps1
#        powershell -ExecutionPolicy Bypass -File scripts/ui-component-scanner.ps1 -TargetPage admin-workdays.html
#
# QUE HACE ESTE SCRIPT:
#
# Recorre TODAS las paginas HTML del proyecto y para cada una extrae:
# - Inventario completo de clases CSS utilizadas
# - Elementos HTML (headings, forms, tables, dialogs, buttons)
# - Inline styles (anti-patron)
# - Cobertura ARIA (accesibilidad)
# - Assets vinculados (CSS/JS)
# - Compliance contra Golden Standard
# - Hints de remediacion priorizados
#
# Genera:
#   1. JSON por pagina en docs/output/ui-scan/pages/
#   2. Matriz de compliance en docs/output/ui-scan/compliance-matrix.md
#   3. Prompts listos para CLI en docs/output/ui-scan/cli-prompts/
#
# Pensalo como un radiografo: escanea cada pagina y te dice
# exactamente que tiene y que le falta para cumplir el Golden Standard.
# =============================================================================

param(
    [string]$TargetPage    # Opcional: escanear solo una pagina
)

# == Paths ==
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot -or -not (Test-Path $ProjectRoot)) {
    $ProjectRoot = (Get-Location).Path
}
$PagesDir = Join-Path $ProjectRoot "pages"
$OutputDir = Join-Path $ProjectRoot "docs\output\ui-scan"
$PagesOut = Join-Path $OutputDir "pages"
$PromptsOut = Join-Path $OutputDir "cli-prompts"

$startTime = Get-Date

# == Colores ==
function Write-OK   ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info ($msg) { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
function Write-Warn ($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Alert($msg) { Write-Host "  [!!] $msg" -ForegroundColor Red }
function Write-Head ($msg) { Write-Host "`n  $msg" -ForegroundColor Cyan }

# =============================================================================
# GOLDEN STANDARD COMPONENT REGISTRY
# Cada categoria tiene las clases esperadas. El scanner detecta cuales
# estan presentes y cuales faltan en cada pagina.
# =============================================================================

$GSRegistry = [ordered]@{
    Layout          = @{
        Classes  = @('page-shell', 'page-card-wrap', 'page-card')
        Weight   = 3  # 1=low, 2=med, 3=high priority
        Required = $true
    }
    Navigation      = @{
        Classes  = @('topbar', 'topbar-start', 'topbar-center', 'topbar-end',
            'breadcrumb', 'breadcrumb-item', 'breadcrumb-link', 'breadcrumb-sep')
        Weight   = 3
        Required = $true
    }
    Header          = @{
        Classes  = @('dashboard-header', 'dashboard-title', 'dashboard-title-soft',
            'dashboard-subtitle-soft', 'actions-bar')
        Weight   = 2
        Required = $true
    }
    Metrics         = @{
        Classes  = @('summary-metrics-container', 'summary-metrics-grid',
            'summary-metric-card', 'summary-metric-label', 'summary-metric-value')
        Weight   = 2
        Required = $false
    }
    Sidebar         = @{
        Classes  = @('sidebar-filters', 'sidebar-section-title', 'sidebar-section',
            'sidebar-actions', 'grid-sidebar-main', 'main-content-area')
        Weight   = 2
        Required = $false
    }
    TabSystem       = @{
        Classes  = @('tab-bar', 'tab-chip', 'tab-content')
        Weight   = 2
        Required = $false
    }
    FilterBar       = @{
        Classes  = @('sku-filter-bar', 'pill-group', 'pill', 'is-active',
            'search-input-wrap', 'search-icon', 'filter-counter', 'filter-spacer')
        Weight   = 1
        Required = $false
    }
    Tables          = @{
        Classes  = @('table-viewport', 'table-shell', 'table-scroll', 'table',
            'table-sticky', 'table-compact', 'table-head', 'table-cell',
            'is-header', 'cell-pad', 'sortable', 'sort-icon')
        Weight   = 2
        Required = $false
    }
    Buttons         = @{
        Classes  = @('btn-primary', 'btn-secondary', 'btn-ghost', 'btn-icon',
            'btn-icon-flat', 'btn-icon-plus', 'btn-danger', 'btn-sm')
        Weight   = 1
        Required = $false
    }
    Modals          = @{
        Classes  = @('modal', 'modal-content', 'modal-content-md', 'modal-content-lg',
            'modal-header', 'modal-title', 'modal-close', 'modal-body', 'modal-footer')
        Weight   = 2
        Required = $false
    }
    Panels          = @{
        Classes  = @('slide-panel', 'panel-overlay', 'panel-header', 'panel-title',
            'panel-close', 'panel-body', 'panel-footer')
        Weight   = 1
        Required = $false
    }
    CustomDropdowns = @{
        Classes  = @('custom-dropdown', 'custom-dropdown-trigger', 'custom-dropdown-menu',
            'custom-dropdown-option', 'custom-dropdown-text', 'custom-dropdown-icon')
        Weight   = 2
        Required = $false
    }
    Charts          = @{
        Classes  = @('chart-section', 'chart-header', 'chart-kpis-grid',
            'chart-kpi-card', 'chart-kpi-label', 'chart-kpi-value',
            'chart-kpi-trend', 'chart-canvas-max')
        Weight   = 1
        Required = $false
    }
    Dropbox         = @{
        Classes  = @('dropbox-zone', 'dropbox-grid-2', 'dropbox-icon',
            'dropbox-title', 'dropbox-subtitle')
        Weight   = 1
        Required = $false
    }
    Forms           = @{
        Classes  = @('input', 'input-compact', 'form-group', 'form-label',
            'date-range-inline', 'date-separator')
        Weight   = 1
        Required = $false
    }
    Stats           = @{
        Classes  = @('stats-header', 'stats-body', 'stats-compact',
            'stat-item', 'stat-label', 'stat-value', 'toggle-icon')
        Weight   = 1
        Required = $false
    }
    Utilities       = @{
        Classes  = @('u-hidden', 'u-visible', 'hidden', 'text-center', 'text-right',
            'text-xs', 'text-muted', 'badge', 'badge-quiet')
        Weight   = 0
        Required = $false
    }
}

# Flatten ALL GS classes for quick lookup
$AllGSClasses = @()
foreach ($cat in $GSRegistry.Values) {
    $AllGSClasses += $cat.Classes
}
$AllGSClasses = $AllGSClasses | Select-Object -Unique

# =============================================================================
# SCAN: Analizar un archivo HTML
# =============================================================================
function Scan-Page {
    param([System.IO.FileInfo]$File)

    $content = Get-Content $File.FullName -Raw -Encoding UTF8 -EA SilentlyContinue
    if (-not $content) { return $null }

    $lines = $content -split "`n"
    $fileName = $File.Name
    $relPath = $File.FullName.Replace("$ProjectRoot\", "").Replace("\", "/")

    # ── 1. Extract ALL CSS classes ──
    $classMatches = [regex]::Matches($content, 'class\s*=\s*"([^"]*)"')
    $allClasses = @()
    foreach ($m in $classMatches) {
        $vals = $m.Groups[1].Value -split '\s+'
        foreach ($v in $vals) {
            if ($v -ne '') { $allClasses += $v }
        }
    }
    $uniqueClasses = $allClasses | Sort-Object -Unique

    # ── 2. Linked CSS/JS ──
    $linkedCSS = @()
    $cssMatches = [regex]::Matches($content, 'href\s*=\s*"([^"]*\.css)"')
    foreach ($m in $cssMatches) { $linkedCSS += $m.Groups[1].Value }

    $linkedJS = @()
    $jsMatches = [regex]::Matches($content, 'src\s*=\s*"([^"]*\.js)"')
    foreach ($m in $jsMatches) { $linkedJS += $m.Groups[1].Value }

    # ── 3. Inline styles (anti-pattern) ──
    $inlineStyles = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match 'style\s*=\s*"([^"]*)"') {
            $snippet = $line.Trim()
            if ($snippet.Length -gt 100) { $snippet = $snippet.Substring(0, 100) + "..." }
            $inlineStyles += @{
                line    = $i + 1
                style   = $Matches[1]
                snippet = $snippet
            }
        }
    }

    # ── 4. Element inventory ──
    $headings = [ordered]@{}
    for ($h = 1; $h -le 6; $h++) {
        $count = ([regex]::Matches($content, "<h$h[\s>]")).Count
        if ($count -gt 0) { $headings["h$h"] = $count }
    }

    $elements = [ordered]@{
        headings     = $headings
        nativeSelect = ([regex]::Matches($content, '<select[\s>]')).Count
        input        = ([regex]::Matches($content, '<input[\s>]')).Count
        textarea     = ([regex]::Matches($content, '<textarea[\s>]')).Count
        button       = ([regex]::Matches($content, '<button[\s>]')).Count
        dialog       = ([regex]::Matches($content, '<dialog[\s>]')).Count
        table        = ([regex]::Matches($content, '<table[\s>]')).Count
        form         = ([regex]::Matches($content, '<form[\s>]')).Count
        canvas       = ([regex]::Matches($content, '<canvas[\s>]')).Count
        aside        = ([regex]::Matches($content, '<aside[\s>]')).Count
    }

    # ── 5. ARIA coverage ──
    $aria = [ordered]@{
        ariaLabel   = ([regex]::Matches($content, 'aria-label\s*=')).Count
        ariaLabelBy = ([regex]::Matches($content, 'aria-labelledby\s*=')).Count
        role        = ([regex]::Matches($content, '\srole\s*=')).Count
        scope       = ([regex]::Matches($content, '\sscope\s*=')).Count
        tabindex    = ([regex]::Matches($content, '\stabindex\s*=')).Count
    }
    $ariaTotal = ($aria.Values | Measure-Object -Sum).Sum

    # ── 6. Data attributes (behavior markers) ──
    $dataAttrs = @()
    $dataMatches = [regex]::Matches($content, '(data-[a-zA-Z-]+)\s*=')
    foreach ($m in $dataMatches) { $dataAttrs += $m.Groups[1].Value }
    $dataAttrs = $dataAttrs | Sort-Object -Unique

    # ── 7. Golden Standard compliance ──
    $gsCompliance = [ordered]@{}
    $totalScore = 0
    $maxScore = 0
    $allPresent = @()
    $allMissing = @()
    $remediationHints = @()

    foreach ($catName in $GSRegistry.Keys) {
        $cat = $GSRegistry[$catName]
        $present = @($cat.Classes | Where-Object { $_ -in $uniqueClasses })
        $missing = @($cat.Classes | Where-Object { $_ -notin $uniqueClasses })

        # Determine if this category is relevant for this page
        $isRelevant = $cat.Required
        if (-not $isRelevant -and $present.Count -gt 0) { $isRelevant = $true }

        # Contextual relevance detection
        if (-not $isRelevant) {
            switch ($catName) {
                'Tables' { $isRelevant = $elements.table -gt 0 }
                'Modals' { $isRelevant = $elements.dialog -gt 0 }
                'CustomDropdowns' { $isRelevant = $elements.nativeSelect -gt 0 }
                'Sidebar' { $isRelevant = $elements.aside -gt 0 }
                'Charts' { $isRelevant = $elements.canvas -gt 0 }
                'Forms' { $isRelevant = $elements.input -gt 0 -or $elements.nativeSelect -gt 0 }
            }
        }

        $catScore = 0
        $catMax = 0
        if ($isRelevant) {
            $catMax = $cat.Classes.Count * $cat.Weight
            $catScore = $present.Count * $cat.Weight
            $maxScore += $catMax
            $totalScore += $catScore
        }

        $gsCompliance[$catName] = [ordered]@{
            relevant = $isRelevant
            present  = $present
            missing  = if ($isRelevant) { $missing } else { @() }
            score    = $catScore
            maxScore = $catMax
            pct      = if ($catMax -gt 0) { [math]::Round(($catScore / $catMax) * 100) } else { 0 }
        }

        # Generate remediation hints for relevant missing items
        if ($isRelevant -and $missing.Count -gt 0) {
            $allMissing += $missing
            $priority = switch ($cat.Weight) { 3 { "HIGH" }; 2 { "MED" }; default { "LOW" } }
            $remediationHints += "$priority`: [$catName] Agregar: $($missing -join ', ')"
        }
        if ($isRelevant -and $present.Count -gt 0) {
            $allPresent += $present
        }
    }

    # Anti-pattern hints
    if ($inlineStyles.Count -gt 0) {
        $remediationHints = @("HIGH: Eliminar $($inlineStyles.Count) inline style= atributos") + $remediationHints
    }
    if ($elements.nativeSelect -gt 0 -and 'custom-dropdown' -notin $uniqueClasses) {
        $remediationHints = @("HIGH: Reemplazar $($elements.nativeSelect) ``<select>`` nativos con .custom-dropdown") + $remediationHints
    }
    if ($ariaTotal -eq 0 -and ($elements.button -gt 0 -or $elements.input -gt 0)) {
        $remediationHints += "MED: Agregar atributos ARIA a elementos interactivos"
    }

    # Unknown classes (not in GS registry)
    $unknownClasses = @($uniqueClasses | Where-Object { $_ -notin $AllGSClasses -and $_ -ne '' })

    # Overall score
    $overallPct = if ($maxScore -gt 0) { [math]::Round(($totalScore / $maxScore) * 100) } else { 0 }

    # ── Build result ──
    return [ordered]@{
        meta             = [ordered]@{
            page       = $fileName
            path       = $relPath
            scannedAt  = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            totalLines = $lines.Count
            module     = ($relPath -split '/')[1]  # admin, operativo, etc.
        }
        linkedAssets     = [ordered]@{
            css = @($linkedCSS)
            js  = @($linkedJS)
        }
        classInventory   = [ordered]@{
            totalUnique    = $uniqueClasses.Count
            goldenStandard = @($allPresent)
            unclassified   = @($unknownClasses)
        }
        elements         = $elements
        aria             = [ordered]@{
            coverage = $aria
            total    = $ariaTotal
        }
        dataAttributes   = @($dataAttrs)
        antiPatterns     = [ordered]@{
            inlineStyles      = @($inlineStyles)
            inlineStyleCount  = $inlineStyles.Count
            nativeSelectCount = $elements.nativeSelect
            hasCustomDropdown = ('custom-dropdown' -in $uniqueClasses)
        }
        goldenCompliance = [ordered]@{
            overallScore = $overallPct
            totalPoints  = $totalScore
            maxPoints    = $maxScore
            categories   = $gsCompliance
        }
        remediationHints = @($remediationHints)
    }
}

# =============================================================================
# GENERATE: CLI prompt para remediacion de una pagina
# =============================================================================
function Generate-CliPrompt {
    param($ScanResult)

    $page = $ScanResult.meta.page
    $path = $ScanResult.meta.path
    $score = $ScanResult.goldenCompliance.overallScore
    $mod = $ScanResult.meta.module
    $hints = $ScanResult.remediationHints -join "`n  * "
    $cssFile = $page -replace '\.html$', '.css'

    # Build category status
    $catLines = @()
    foreach ($catName in $ScanResult.goldenCompliance.categories.Keys) {
        $cat = $ScanResult.goldenCompliance.categories[$catName]
        if ($cat.relevant) {
            $icon = if ($cat.pct -ge 80) { "pass" } elseif ($cat.pct -ge 40) { "parcial" } else { "falta" }
            $missTxt = if ($cat.missing.Count -gt 0) { "Missing: $($cat.missing -join ', ')" } else { "Completo" }
            $catLines += "  * ${catName}: ${icon} ($($cat.pct)%) -- ${missTxt}"
        }
    }
    $catStatus = $catLines -join "`n"

    $inline = $ScanResult.antiPatterns.inlineStyleCount
    $selects = $ScanResult.antiPatterns.nativeSelectCount
    $ariaT = $ScanResult.aria.total

    # Element summary
    $elLines = @()
    foreach ($key in $ScanResult.elements.Keys) {
        if ($key -eq 'headings') { continue }
        $val = $ScanResult.elements[$key]
        if ($val -gt 0) { $elLines += "  * ${key}: ${val}" }
    }
    $elSummary = $elLines -join "`n"

    $hParts = @()
    foreach ($key in $ScanResult.elements.headings.Keys) {
        $hParts += "${key}($($ScanResult.elements.headings[$key]))"
    }
    $hSummary = $hParts -join " "

    # Build prompt line by line (avoids here-string parsing issues)
    $lines = @()
    $lines += "# Remediacion Golden Standard: ${page}"
    $lines += ""
    $lines += "## Contexto"
    $lines += "Archivo: ${path}"
    $lines += "Score actual: ${score}/100"
    $lines += "Modulo: ${mod}"
    $lines += ""
    $lines += "## Estado actual del componente"
    $lines += ""
    $lines += "### Compliance por categoria (solo relevantes)"
    $lines += ""
    $lines += $catStatus
    $lines += ""
    $lines += "### Anti-patrones detectados"
    $lines += ""
    $lines += "  * Inline styles: ${inline}"
    $lines += "  * Native select sin custom-dropdown: ${selects}"
    $lines += "  * Cobertura ARIA total: ${ariaT} attrs"
    $lines += ""
    $lines += "### Elementos HTML"
    $lines += ""
    $lines += $elSummary
    $lines += ""
    $lines += "### Headings: ${hSummary}"
    $lines += ""
    $lines += "### Hints de remediacion (priorizados)"
    $lines += ""
    $lines += "* ${hints}"
    $lines += ""
    $lines += "## Instrucciones"
    $lines += ""
    $lines += "Crea un plan de implementacion para remediar ${page} al Golden Standard."
    $lines += ""
    $lines += "### Reglas"
    $lines += ""
    $lines += "1. Consulta docs/ui-golden-standard.md como referencia absoluta"
    $lines += "2. Referencia de implementacion: pages/admin/admin-central-stock.html"
    $lines += "3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)"
    $lines += "4. Usa clases de components.css, no inventes clases nuevas"
    $lines += "5. Si la pagina tiene CSS propio (ej: assets/css/${cssFile}), refactoriza ahi"
    $lines += "6. Elimina TODOS los inline style y reemplazalos con clases GS"
    $lines += "7. Reemplaza select nativos con el patron .custom-dropdown"
    $lines += "8. Asegura heading hierarchy correcta (h2, h3, h4 -- sin h1)"
    $lines += "9. Agrega atributos ARIA a elementos interactivos"
    $lines += ""
    $lines += "### Formato del plan"
    $lines += ""
    $lines += "Para cada archivo a modificar, indica:"
    $lines += ""
    $lines += "* Que cambia y por que"
    $lines += "  * Lineas aproximadas afectadas"
    $lines += "  * Patron GS de referencia (numero de seccion del golden standard)"
    $lines += ""
    $lines += "### Criterio de exito"
    $lines += ""
    $lines += "* Score de compliance mayor o igual a 85%"
    $lines += "* 0 inline styles"
    $lines += "* 0 native selects sin custom-dropdown"
    $lines += "* ARIA labels en todos los botones e inputs"

    return ($lines -join "`n")
}

# =============================================================================
# GENERATE: Compliance Matrix (Markdown)
# =============================================================================
function Generate-Matrix {
    param($AllResults)

    $date = Get-Date -Format "yyyy-MM-dd HH:mm"
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

    # Count tiers
    $tier1 = @($AllResults | Where-Object { $_.goldenCompliance.overallScore -ge 80 }).Count
    $tier2 = @($AllResults | Where-Object { $_.goldenCompliance.overallScore -ge 50 -and $_.goldenCompliance.overallScore -lt 80 }).Count
    $tier3 = @($AllResults | Where-Object { $_.goldenCompliance.overallScore -lt 50 }).Count
    $avgScore = if ($AllResults.Count -gt 0) {
        [math]::Round(($AllResults | ForEach-Object { $_.goldenCompliance.overallScore } | Measure-Object -Average).Average)
    }
    else { 0 }

    # Build markdown line by line (avoids here-string parsing issues)
    $md = @()
    $md += "# UI Component Scan -- Golden Standard Compliance Matrix"
    $md += ""
    $md += "Generado: ${date} | Duracion: ${elapsed}s | Paginas: $($AllResults.Count)"
    $md += "Referencia: docs/ui-golden-standard.md"
    $md += ""
    $md += "---"
    $md += ""
    $md += "## Resumen ejecutivo"
    $md += ""
    $md += "| Metrica | Valor |"
    $md += "| --- | --- |"
    $md += "| Score promedio | **${avgScore}** |"
    $md += "| Paginas compliant (80+) | ${tier1} |"
    $md += "| Paginas parcial (50-79) | ${tier2} |"
    $md += "| Paginas critico (bajo 50) | ${tier3} |"
    $md += ""
    $md += "---"
    $md += ""
    $md += "## Matriz de compliance"
    $md += ""
    $md += "| Pagina | Modulo | Score | Layout | Nav | Header | Metrics | Tables | Dropdowns | Inline | ARIA | Hints |"
    $md += "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"

    foreach ($r in ($AllResults | Sort-Object { $_.goldenCompliance.overallScore })) {
        $pg = $r.meta.page
        $mo = $r.meta.module
        $sc = $r.goldenCompliance.overallScore

        $cats = $r.goldenCompliance.categories
        $li = Get-CategoryIcon $cats 'Layout'
        $ni = Get-CategoryIcon $cats 'Navigation'
        $hi = Get-CategoryIcon $cats 'Header'
        $mi = Get-CategoryIcon $cats 'Metrics'
        $ti = Get-CategoryIcon $cats 'Tables'
        $di = Get-CategoryIcon $cats 'CustomDropdowns'

        $il = $r.antiPatterns.inlineStyleCount
        $ar = $r.aria.total
        $hc = $r.remediationHints.Count

        $md += "| ${pg} | ${mo} | **${sc}** | ${li} | ${ni} | ${hi} | ${mi} | ${ti} | ${di} | ${il} | ${ar} | ${hc} |"
    }

    $md += ""
    $md += "### Leyenda"
    $md += ""
    $md += "OK = categoria 80+ compliance"
    $md += "!! = categoria bajo 80 y relevante (necesita remediacion)"
    $md += "-- = categoria no relevante para esta pagina"
    $md += ""
    $md += "---"
    $md += ""
    $md += "## Detalle por pagina (Top 10 con mas hints)"
    $md += ""

    $topPages = $AllResults | Sort-Object { $_.remediationHints.Count } -Descending | Select-Object -First 10
    foreach ($r in $topPages) {
        $pgName = $r.meta.page
        $pgScore = $r.goldenCompliance.overallScore
        $md += "### ${pgName} -- Score: ${pgScore}"
        $md += ""
        if ($r.remediationHints.Count -gt 0) {
            foreach ($h in $r.remediationHints) {
                $h = $h -replace '<select>', '``<select>``'
                $md += "  * ${h}"
            }
        }
        else {
            $md += "  * Sin hints pendientes"
        }
        $md += ""
    }

    $md += "---"
    $md += ""
    $md += "## Proximos pasos"
    $md += ""
    $md += "1. Ejecutar CLIs en paralelo con los prompts de docs/output/ui-scan/cli-prompts/"
    $md += "2. Cada CLI genera un plan de implementacion para su pagina asignada"
    $md += "3. Antigravity ingesta todos los planes y ejecuta la pasada coordinada"
    $md += "4. Re-ejecutar este scanner para verificar compliance post-remediacion"

    return ($md -join "`n")
}

function Get-CategoryIcon {
    param($Categories, $CatName)

    if (-not $Categories.Contains($CatName)) { return '--' }
    $cat = $Categories[$CatName]
    if (-not $cat.relevant) { return '--' }
    if ($cat.pct -ge 80) { return 'OK' }
    return '!!'
}

# =============================================================================
# MAIN
# =============================================================================
Clear-Host
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host "   UI COMPONENT SCANNER v1 - FormulaMid 4" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "  Escanea HTML -> extrae componentes -> mide compliance GS" -ForegroundColor DarkGray
Write-Host "  Genera: JSON + Matriz + Prompts CLI" -ForegroundColor DarkGray
Write-Host ""

# Ensure output dirs
foreach ($dir in @($OutputDir, $PagesOut, $PromptsOut)) {
    if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }
}

# Collect HTML files
$htmlFiles = Get-ChildItem $PagesDir -Recurse -Filter "*.html" -EA SilentlyContinue

# Filter if target specified
if ($TargetPage) {
    $htmlFiles = $htmlFiles | Where-Object { $_.Name -eq $TargetPage }
    if ($htmlFiles.Count -eq 0) {
        Write-Alert "Pagina no encontrada: $TargetPage"
        exit 1
    }
}

# Exclude non-production pages
$excludePatterns = @('components_catalog', 'layout_patterns', 'test-', 'prototype', 'module-audit', 'monitor')
$htmlFiles = $htmlFiles | Where-Object {
    $name = $_.Name
    $excluded = $false
    foreach ($pat in $excludePatterns) {
        if ($name -match $pat) { $excluded = $true; break }
    }
    -not $excluded
}

Write-Head "ESCANEANDO $($htmlFiles.Count) PAGINAS"

$allResults = @()
$scanned = 0

foreach ($file in $htmlFiles) {
    $scanned++
    $pct = [math]::Round(($scanned / $htmlFiles.Count) * 100)
    Write-Host "`r  [$pct%] $($file.Name)                    " -NoNewline -ForegroundColor DarkGray

    $result = Scan-Page $file
    if (-not $result) {
        Write-Warn "No se pudo leer: $($file.Name)"
        continue
    }

    $allResults += $result

    # Save per-page JSON
    $jsonName = $file.Name -replace '\.html$', '.json'
    $jsonPath = Join-Path $PagesOut $jsonName
    $result | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding utf8

    # Generate CLI prompt
    $promptContent = Generate-CliPrompt $result
    $promptName = $file.Name -replace '\.html$', '.md'
    $promptPath = Join-Path $PromptsOut $promptName
    $promptContent | Out-File $promptPath -Encoding utf8
}

Write-Host ""
Write-Host ""

# Results summary
$compliant = @($allResults | Where-Object { $_.goldenCompliance.overallScore -ge 80 }).Count
$partial = @($allResults | Where-Object { $_.goldenCompliance.overallScore -ge 50 -and $_.goldenCompliance.overallScore -lt 80 }).Count
$critical = @($allResults | Where-Object { $_.goldenCompliance.overallScore -lt 50 }).Count
$totalInline = ($allResults | ForEach-Object { $_.antiPatterns.inlineStyleCount } | Measure-Object -Sum).Sum
$totalHints = ($allResults | ForEach-Object { $_.remediationHints.Count } | Measure-Object -Sum).Sum

Write-Head "RESULTADOS"
Write-OK    "$($allResults.Count) paginas escaneadas"
Write-OK    "$compliant compliant (80+)"
Write-Warn  "$partial parciales (50-79)"
Write-Alert "$critical criticas (bajo 50)"
Write-Info  "$totalInline inline styles totales"
Write-Info  "$totalHints hints de remediacion totales"

# Generate compliance matrix
$matrixContent = Generate-Matrix $allResults
$matrixPath = Join-Path $OutputDir "compliance-matrix.md"
$matrixContent | Out-File $matrixPath -Encoding utf8

# Summary JSON
$summaryJson = [ordered]@{
    scannedAt         = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    totalPages        = $allResults.Count
    compliant         = $compliant
    partial           = $partial
    critical          = $critical
    avgScore          = if ($allResults.Count -gt 0) {
        [math]::Round(($allResults | ForEach-Object { $_.goldenCompliance.overallScore } | Measure-Object -Average).Average)
    }
    else { 0 }
    totalInlineStyles = $totalInline
    totalHints        = $totalHints
    pages             = @($allResults | ForEach-Object {
            [ordered]@{
                page   = $_.meta.page
                module = $_.meta.module
                score  = $_.goldenCompliance.overallScore
                hints  = $_.remediationHints.Count
                inline = $_.antiPatterns.inlineStyleCount
            }
        } | Sort-Object { $_.score })
}
$summaryJson | ConvertTo-Json -Depth 5 | Out-File (Join-Path $OutputDir "summary.json") -Encoding utf8

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host "   REPORTES GENERADOS" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Blue
Write-Host ""
Write-OK "Matriz:  $matrixPath"
$jsonCount = $allResults.Count
$promptCount = $allResults.Count
Write-OK "JSON:    $PagesOut - ${jsonCount} archivos"
Write-OK "Prompts: $PromptsOut - ${promptCount} archivos"
Write-Host ""
Write-Host "  WORKFLOW:" -ForegroundColor Cyan
Write-Host "  1. Revisa compliance-matrix.md para ver el panorama" -ForegroundColor DarkGray
Write-Host "  2. Abre cli-prompts/<pagina>.md y pasalo a un CLI" -ForegroundColor DarkGray
Write-Host "  3. Cada CLI genera un plan de implementacion" -ForegroundColor DarkGray
Write-Host "  4. Antigravity ingesta los planes y ejecuta" -ForegroundColor DarkGray
Write-Host ""
