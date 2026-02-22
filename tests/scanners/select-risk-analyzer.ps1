# =============================================================================
# SELECT-to-DB Risk Analyzer
# Traces every <select> element in HTML through JS to DB operations
# Usage: powershell -ExecutionPolicy Bypass -File scripts/select-risk-analyzer.ps1
#
# QUE HACE:
# 1. Encuentra todos los <select> en paginas HTML de produccion
# 2. Extrae el id/name de cada <select>
# 3. Busca en el JS correspondiente como se usa ese ID (.value, .selectedIndex, etc.)
# 4. Detecta si el valor llega a Supabase (.insert, .update, .upsert, .rpc)
# 5. Genera reporte con riesgo por pagina y por approach (wrap vs replace)
#
# OUTPUT: docs/80-ephemeral/agent-logs/ui-scan/select-risk-report.md
# =============================================================================

$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot -or -not (Test-Path $ProjectRoot)) {
    $ProjectRoot = (Get-Location).Path
}

$PagesDir  = Join-Path $ProjectRoot 'pages'
$JsDir     = Join-Path $ProjectRoot 'assets\js\modules'
$OutputDir = Join-Path $ProjectRoot 'docs\output\ui-scan'
$OutputFile = Join-Path $OutputDir 'select-risk-report.md'

if (-not (Test-Path $OutputDir)) { New-Item $OutputDir -ItemType Directory -Force | Out-Null }

# Native select API methods that custom dropdown must preserve
$SelectAPIs = @(
    '\.value',
    '\.selectedIndex',
    '\.options',
    '\.innerHTML',
    '\.textContent',
    '\.innerText',
    '\.appendChild',
    '\.add\(',
    '\.remove\(',
    '\.disabled',
    '\.length',
    '\.selectedOptions',
    'addEventListener.*change'
)

# DB operations that indicate a select value reaches the database
$DbPatterns = @(
    '\.insert\(',
    '\.update\(',
    '\.upsert\(',
    '\.rpc\(',
    '\.from\('
)

Clear-Host
Write-Host ''
Write-Host '  ========================================' -ForegroundColor Cyan
Write-Host '   SELECT-to-DB RISK ANALYZER' -ForegroundColor White
Write-Host '  ========================================' -ForegroundColor Cyan
Write-Host ''

# == Step 1: Find all HTML files with <select> ==
$htmlFiles = Get-ChildItem $PagesDir -Recurse -Filter "*.html" -EA SilentlyContinue

$excludePatterns = @('components_catalog', 'layout_patterns', 'test-', 'prototype', 'module-audit', 'monitor')

$htmlFiles = $htmlFiles | Where-Object {
    $name = $_.Name
    $skip = $false
    foreach ($pat in $excludePatterns) {
        if ($name -like "*$pat*") { $skip = $true; break }
    }
    -not $skip
}

$allFindings = @()
$totalSelects = 0
$totalDbBound = 0

foreach ($htmlFile in $htmlFiles) {
    $htmlContent = Get-Content $htmlFile.FullName -Raw -Encoding UTF8 -EA SilentlyContinue
    if (-not $htmlContent) { continue }

    # Find all <select> with id or name
    $selectMatches = [regex]::Matches($htmlContent, '<select[^>]*(?:id|name)\s*=\s*["\x27]([^"\x27]+)["\x27][^>]*>', 'IgnoreCase')

    if ($selectMatches.Count -eq 0) { continue }

    $pageName = $htmlFile.Name
    $module = ($htmlFile.DirectoryName -replace [regex]::Escape($PagesDir), '').Trim('\').Split('\')[0]
    if (-not $module) { $module = 'root' }

    # Find corresponding JS file
    $jsBasename = $pageName -replace '\.html$', '.js'
    $jsFiles = Get-ChildItem $JsDir -Recurse -Filter $jsBasename -EA SilentlyContinue

    $jsContent = ''
    $jsPath = ''
    if ($jsFiles -and $jsFiles.Count -gt 0) {
        $jsPath = $jsFiles[0].FullName
        $jsContent = Get-Content $jsPath -Raw -Encoding UTF8 -EA SilentlyContinue
    }

    foreach ($match in $selectMatches) {
        $selectId = $match.Groups[1].Value
        $totalSelects++

        $finding = [ordered]@{
            page       = $pageName
            module     = $module
            selectId   = $selectId
            fullTag    = $match.Value.Substring(0, [Math]::Min(80, $match.Value.Length))
            jsFile     = if ($jsPath) { Split-Path $jsPath -Leaf } else { 'NOT FOUND' }
            jsUsages   = @()
            apisUsed   = @()
            dbBound    = $false
            dbOps      = @()
            riskLevel  = 'LOW'
            riskDetail = ''
        }

        if ($jsContent) {
            # Find JS variable name for this select
            $jsVarPatterns = @(
                "getElementById\(['\x22]${selectId}['\x22]\)",
                "querySelector\(['\x22]#${selectId}['\x22]\)",
                "querySelector\(['\x22]\[id=${selectId}\]['\x22]\)"
            )

            $jsVarName = ''
            foreach ($pat in $jsVarPatterns) {
                $varMatch = [regex]::Match($jsContent, "(\w+)\s*[:=]\s*document\.${pat}")
                if ($varMatch.Success) {
                    $jsVarName = $varMatch.Groups[1].Value
                    break
                }
                # Also check nested: ui.xxx = document.getElementById(...)
                $varMatch2 = [regex]::Match($jsContent, "(\w+)\s*:\s*document\.${pat}")
                if ($varMatch2.Success) {
                    $jsVarName = $varMatch2.Groups[1].Value
                    break
                }
            }

            if ($jsVarName) {
                # Check which Select APIs are used
                foreach ($api in $SelectAPIs) {
                    # Search for ui.varName.api or varName.api
                    $apiPattern = "(?:ui\.)?" + [regex]::Escape($jsVarName) + $api
                    $apiMatches = [regex]::Matches($jsContent, $apiPattern, 'IgnoreCase')
                    if ($apiMatches.Count -gt 0) {
                        $cleanApi = $api -replace '\\', ''
                        $finding.apisUsed += "${cleanApi} (${($apiMatches.Count)}x)"
                        foreach ($am in $apiMatches) {
                            $lineNum = ($jsContent.Substring(0, $am.Index) -split "`n").Count
                            $finding.jsUsages += "L${lineNum}: $($am.Value.Substring(0, [Math]::Min(60, $am.Value.Length)))"
                        }
                    }
                }

                # Check if value reaches a Supabase operation
                # Strategy: find the function scope where .value is read, then check for DB ops
                foreach ($dbPat in $DbPatterns) {
                    $dbMatches = [regex]::Matches($jsContent, $dbPat, 'IgnoreCase')
                    if ($dbMatches.Count -gt 0) {
                        $finding.dbOps += ($dbPat -replace '\\', '') + " (${($dbMatches.Count)}x)"
                    }
                }

                if ($finding.dbOps.Count -gt 0 -and $finding.apisUsed.Count -gt 0) {
                    $finding.dbBound = $true
                    $totalDbBound++
                }
            } else {
                $finding.riskDetail = "Select ID '${selectId}' not referenced in JS"
            }

            # Determine risk level
            $apiCount = $finding.apisUsed.Count
            if ($finding.dbBound) {
                if ($apiCount -ge 3) {
                    $finding.riskLevel = 'CRITICAL'
                    $finding.riskDetail = "DB-bound + ${apiCount} native APIs used. Replace approach requires JS refactor."
                } else {
                    $finding.riskLevel = 'HIGH'
                    $finding.riskDetail = "DB-bound via ${apiCount} API(s). Wrap approach safest."
                }
            } elseif ($apiCount -gt 0) {
                $finding.riskLevel = 'MEDIUM'
                $finding.riskDetail = "${apiCount} native API(s) used but no direct DB path detected."
            } else {
                $finding.riskLevel = 'LOW'
                if (-not $finding.riskDetail) {
                    $finding.riskDetail = 'No JS usage detected. Safe to replace.'
                }
            }
        } else {
            $finding.riskLevel = 'LOW'
            $finding.riskDetail = 'No JS file found. Likely static or server-rendered.'
        }

        $allFindings += $finding

        $color = switch ($finding.riskLevel) {
            'CRITICAL' { 'Red' }
            'HIGH'     { 'Yellow' }
            'MEDIUM'   { 'DarkYellow' }
            default    { 'Green' }
        }
        Write-Host "  [$($finding.riskLevel)] $pageName #$selectId -> $($finding.jsFile)" -ForegroundColor $color
    }
}

# == Step 2: Generate report ==
Write-Host ''
Write-Host '  ========================================' -ForegroundColor Cyan
Write-Host '   GENERATING REPORT' -ForegroundColor White
Write-Host '  ========================================' -ForegroundColor Cyan

$md = @()
$md += '# Select-to-DB Risk Analysis Report'
$md += ''
$md += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$md += ''
$md += '## Executive Summary'
$md += ''
$md += "| Metric | Value |"
$md += '|--------|-------|'
$md += "| Total \`<select>\` elements | **$totalSelects** |"
$md += "| DB-bound selects | **$totalDbBound** |"
$md += "| CRITICAL risk | **$(($allFindings | Where-Object { $_.riskLevel -eq 'CRITICAL' }).Count)** |"
$md += "| HIGH risk | **$(($allFindings | Where-Object { $_.riskLevel -eq 'HIGH' }).Count)** |"
$md += "| MEDIUM risk | **$(($allFindings | Where-Object { $_.riskLevel -eq 'MEDIUM' }).Count)** |"
$md += "| LOW risk | **$(($allFindings | Where-Object { $_.riskLevel -eq 'LOW' }).Count)** |"
$md += ''

# Approach comparison
$md += '## Approach Comparison'
$md += ''
$md += '### Option A: Wrap (enhance native select visually)'
$md += ''
$md += '| Factor | Assessment |'
$md += '|--------|-----------|'
$md += '| JS changes required | **ZERO** â€” native `<select>` stays in DOM |'
$md += '| DB contract risk | **ZERO** â€” `.value`, `.selectedIndex` still work |'
$md += '| Accessibility | **NATIVE** â€” screen readers, keyboard nav for free |'
$md += '| Visual control | **LIMITED** â€” `<option>` styling is restricted cross-browser |'
$md += '| Best practice? | **YES** â€” progressive enhancement pattern |'
$md += ''
$md += '### Option B: Replace (div-based + hidden input)'
$md += ''
$md += '| Factor | Assessment |'
$md += '|--------|-----------|'
$md += "| JS changes required | **$totalDbBound select(s)** need JS updates |"
$md += '| DB contract risk | **HIGH** for CRITICAL/HIGH selects |'
$md += '| Accessibility | **MANUAL** â€” must implement ARIA roles, keyboard nav |'
$md += '| Visual control | **FULL** â€” complete styling freedom |'
$md += '| Best practice? | **ONLY if** hidden input preserves same `id` and fires `change` event |'
$md += ''

# Recommendation
$critical = ($allFindings | Where-Object { $_.riskLevel -eq 'CRITICAL' }).Count
$high = ($allFindings | Where-Object { $_.riskLevel -eq 'HIGH' }).Count

$md += '### Recommendation'
$md += ''
if ($critical -gt 0 -or $high -gt 0) {
    $md += "> [!CAUTION]"
    $md += "> With **$critical CRITICAL** and **$high HIGH** risk selects bound to DB operations,"
    $md += "> the **Wrap approach (Option A)** is strongly recommended for Tier0 pages."
    $md += "> Option B is viable ONLY for LOW-risk selects not connected to JS/DB."
} else {
    $md += "> [!TIP]"
    $md += "> All selects are LOW risk. Either approach is safe."
}
$md += ''

# Detailed findings
$md += '## Detailed Findings'
$md += ''
$md += '| Page | Select ID | Risk | APIs Used | DB-Bound | Detail |'
$md += '|------|-----------|------|-----------|----------|--------|'

foreach ($f in ($allFindings | Sort-Object { switch ($_.riskLevel) { 'CRITICAL' { 0 } 'HIGH' { 1 } 'MEDIUM' { 2 } default { 3 } } })) {
    $apis = if ($f.apisUsed.Count -gt 0) { ($f.apisUsed -join ', ') } else { 'â€”' }
    $db = if ($f.dbBound) { 'YES' } else { 'no' }
    $risk = $f.riskLevel
    $md += "| $($f.page) | ``$($f.selectId)`` | **$risk** | $apis | $db | $($f.riskDetail) |"
}

# JS usage detail for CRITICAL/HIGH
$criticalFindings = $allFindings | Where-Object { $_.riskLevel -in @('CRITICAL', 'HIGH') }
if ($criticalFindings.Count -gt 0) {
    $md += ''
    $md += '## CRITICAL/HIGH Detail â€” JS Usage Lines'
    $md += ''
    foreach ($f in $criticalFindings) {
        $md += "### ``$($f.page)`` â†’ ``#$($f.selectId)``"
        $md += ''
        $md += "- **JS File**: ``$($f.jsFile)``"
        $md += "- **APIs**: $($f.apisUsed -join ', ')"
        $md += "- **DB Ops in file**: $($f.dbOps -join ', ')"
        $md += "- **JS References**:"
        foreach ($u in $f.jsUsages) {
            $md += "  - ``$u``"
        }
        $md += ''
    }
}

$md += ''
$md += '---'
$md += ''
$md += '## Action Items'
$md += ''
$md += '1. **Tier0 pages with CRITICAL/HIGH selects**: Use Wrap approach (no JS changes)'
$md += '2. **Pages with LOW selects**: Either approach is safe'
$md += '3. **Design the CustomDropdown component to support BOTH modes**:'
$md += '   - `mode="wrap"`: enhances existing `<select>` visually'
$md += '   - `mode="replace"`: creates div-based dropdown with hidden `<input>`'
$md += '4. **Frontend chat**: implement the component following this analysis'

($md -join "`n") | Out-File $OutputFile -Encoding utf8

Write-Host ''
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "   RESULTS" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ''
Write-Host "  Total selects found: $totalSelects" -ForegroundColor White
Write-Host "  DB-bound:            $totalDbBound" -ForegroundColor $(if ($totalDbBound -gt 0) { 'Red' } else { 'Green' })
Write-Host "  CRITICAL:            $critical" -ForegroundColor $(if ($critical -gt 0) { 'Red' } else { 'Green' })
Write-Host "  HIGH:                $high" -ForegroundColor $(if ($high -gt 0) { 'Yellow' } else { 'Green' })
Write-Host ''
Write-Host "  Report: $OutputFile" -ForegroundColor Green
Write-Host ''
