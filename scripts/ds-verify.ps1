# =============================================================================
# DS Verify — Post-Component Verification Script
# Trigger B del CLI Executor
# Usage: powershell -ExecutionPolicy Bypass -File scripts/ds-verify.ps1
#
# QUE HACE:
# 1. Ejecuta ui-component-scanner.ps1
# 2. Compara summary.json nuevo vs baseline.json
# 3. Genera diff report: que pages mejoraron, cuales empeoraron
# 4. ALERTA si alguna pagina Tier0 bajo de score
# 5. Guarda nuevo summary como baseline si paso verificacion
#
# =============================================================================

param(
    [switch]$SaveBaseline,    # Guardar resultado actual como nuevo baseline
    [switch]$SkipScan         # Saltar scan (usar summary.json existente)
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot -or -not (Test-Path $ProjectRoot)) {
    $ProjectRoot = (Get-Location).Path
}

$ScanDir     = Join-Path $ProjectRoot 'docs\output\ui-scan'
$SummaryPath = Join-Path $ScanDir 'summary.json'
$BaselinePath = Join-Path $ScanDir 'baseline.json'
$DiffPath    = Join-Path $ScanDir 'verify-diff.md'
$ScannerPath = Join-Path $ProjectRoot 'scripts\ui-component-scanner.ps1'

# Tier0 pages (from REGISTRY.yml)
$Tier0Pages = @(
    'admin-workdays.html',
    'admin-central-stock.html',
    'admin-pagos.html',
    'admin-solicitudes.html',
    'staff-caja-index.html',
    'staff-barra-index.html',
    'encargado-caja-noche.html',
    'encargado-barra-noche.html'
)

function Write-OK   ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn ($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Alert($msg) { Write-Host "  [!!] $msg" -ForegroundColor Red }
function Write-Info ($msg) { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }

Clear-Host
Write-Host ''
Write-Host '  ========================================' -ForegroundColor Blue
Write-Host '   DS VERIFY — Post-Component Check' -ForegroundColor White
Write-Host '  ========================================' -ForegroundColor Blue
Write-Host ''

# == Step 1: Run scanner (unless skipped) ==
if (-not $SkipScan) {
    Write-Info 'Running ui-component-scanner.ps1...'
    & $ScannerPath
    Write-Host ''
}

# == Step 2: Load current summary ==
if (-not (Test-Path $SummaryPath)) {
    Write-Alert 'summary.json not found. Run the scanner first.'
    exit 1
}

$current = Get-Content $SummaryPath -Raw | ConvertFrom-Json

# == Step 3: Save as baseline if requested ==
if ($SaveBaseline) {
    Copy-Item $SummaryPath $BaselinePath -Force
    Write-OK "Baseline saved: $BaselinePath"
    Write-Info "Current avg score: $($current.avgScore) | Pages: $($current.totalPages)"
    exit 0
}

# == Step 4: Compare against baseline ==
if (-not (Test-Path $BaselinePath)) {
    Write-Warn 'No baseline found. Saving current scan as baseline.'
    Copy-Item $SummaryPath $BaselinePath -Force
    Write-OK "Baseline created. Run again after changes to see diff."
    exit 0
}

$baseline = Get-Content $BaselinePath -Raw | ConvertFrom-Json

# Build lookup tables
$baselineMap = @{}
foreach ($p in $baseline.pages) { $baselineMap[$p.page] = $p }
$currentMap = @{}
foreach ($p in $current.pages) { $currentMap[$p.page] = $p }

# == Step 5: Generate diff ==
$improved = @()
$regressed = @()
$unchanged = @()
$newPages = @()
$tier0Alerts = @()

foreach ($p in $current.pages) {
    $pageName = $p.page
    if ($baselineMap.ContainsKey($pageName)) {
        $oldScore = $baselineMap[$pageName].score
        $newScore = $p.score
        $delta = $newScore - $oldScore

        if ($delta -gt 0) {
            $improved += [PSCustomObject]@{
                Page = $pageName; Module = $p.module
                Old = $oldScore; New = $newScore; Delta = "+$delta"
            }
        } elseif ($delta -lt 0) {
            $regressed += [PSCustomObject]@{
                Page = $pageName; Module = $p.module
                Old = $oldScore; New = $newScore; Delta = "$delta"
            }
            # Check Tier0
            if ($pageName -in $Tier0Pages) {
                $tier0Alerts += [PSCustomObject]@{
                    Page = $pageName; Old = $oldScore; New = $newScore; Delta = "$delta"
                }
            }
        } else {
            $unchanged += $pageName
        }
    } else {
        $newPages += $pageName
    }
}

# == Step 6: Print results ==
Write-Host ''
Write-Host '  ========================================' -ForegroundColor Blue
Write-Host '   VERIFICATION RESULTS' -ForegroundColor White
Write-Host '  ========================================' -ForegroundColor Blue
Write-Host ''

Write-Info "Baseline avg: $($baseline.avgScore) | Current avg: $($current.avgScore) | Delta: $(if($current.avgScore -ge $baseline.avgScore){'+'})$($current.avgScore - $baseline.avgScore)"
Write-Host ''

if ($improved.Count -gt 0) {
    Write-OK "$($improved.Count) pages IMPROVED:"
    foreach ($p in $improved | Sort-Object { [int]($_.Delta -replace '\+','') } -Descending) {
        Write-Host "       $($p.Page) : $($p.Old) -> $($p.New) ($($p.Delta))" -ForegroundColor Green
    }
}

if ($regressed.Count -gt 0) {
    Write-Alert "$($regressed.Count) pages REGRESSED:"
    foreach ($p in $regressed) {
        Write-Host "       $($p.Page) : $($p.Old) -> $($p.New) ($($p.Delta))" -ForegroundColor Red
    }
}

if ($tier0Alerts.Count -gt 0) {
    Write-Host ''
    Write-Alert '!!! TIER 0 REGRESSION DETECTED !!!'
    foreach ($a in $tier0Alerts) {
        Write-Alert "    $($a.Page): $($a.Old) -> $($a.New) ($($a.Delta))"
    }
    Write-Alert 'Tier0 pages MUST NOT regress. Review changes immediately.'
}

Write-Info "$($unchanged.Count) pages unchanged"
if ($newPages.Count -gt 0) { Write-Info "$($newPages.Count) new pages: $($newPages -join ', ')" }

# == Step 7: Write diff report ==
$md = @()
$md += '# DS Verify — Diff Report'
$md += ''
$md += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$md += "Baseline avg: $($baseline.avgScore) | Current avg: $($current.avgScore) | Delta: $($current.avgScore - $baseline.avgScore)"
$md += ''
$md += '## Improved'
$md += ''
if ($improved.Count -gt 0) {
    $md += '| Page | Module | Old | New | Delta |'
    $md += '|------|--------|-----|-----|-------|'
    foreach ($p in $improved | Sort-Object { [int]($_.Delta -replace '\+','') } -Descending) {
        $md += "| $($p.Page) | $($p.Module) | $($p.Old) | $($p.New) | $($p.Delta) |"
    }
} else {
    $md += 'None'
}
$md += ''
$md += '## Regressed'
$md += ''
if ($regressed.Count -gt 0) {
    $md += '| Page | Module | Old | New | Delta |'
    $md += '|------|--------|-----|-----|-------|'
    foreach ($p in $regressed) {
        $md += "| $($p.Page) | $($p.Module) | $($p.Old) | $($p.New) | $($p.Delta) |"
    }
} else {
    $md += 'None'
}

if ($tier0Alerts.Count -gt 0) {
    $md += ''
    $md += '## TIER 0 ALERTS'
    $md += ''
    foreach ($a in $tier0Alerts) {
        $md += "- **$($a.Page)**: $($a.Old) -> $($a.New) ($($a.Delta))"
    }
}

$md += ''
$md += '## Unchanged'
$md += ''
$md += "$($unchanged.Count) pages with no score change."

($md -join "`n") | Out-File $DiffPath -Encoding utf8
Write-Host ''
Write-OK "Diff report: $DiffPath"
Write-Host ''
