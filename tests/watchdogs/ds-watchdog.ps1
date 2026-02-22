# =============================================================================
# DS Watchdog - Continuous Contract Monitor
# Corre en background mientras los agentes trabajan.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/ds-watchdog.ps1
#        powershell -ExecutionPolicy Bypass -File scripts/ds-watchdog.ps1 -Once
#
# QUE HACE (cada ciclo):
# 1. CSS contracts: clases usadas en HTML existen en swiss-style.css
# 2. JS contracts:  IDs/names en HTML no fueron cambiados vs snapshot
# 3. Token integrity: detecta hardcoded hex colors en swiss-style.css
# 4. File integrity: tokens.css no fue modificado (R1)
# 5. Genera reporte en docs/output/watchdog-report.md
#
# =============================================================================

param(
    [int]$IntervalSeconds = 60,
    [switch]$Once,
    [switch]$Silent
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot -or -not (Test-Path $ProjectRoot)) {
    $ProjectRoot = (Get-Location).Path
}

$CSSPath       = Join-Path $ProjectRoot 'assets\css\swiss-style.css'
$TokensPath    = Join-Path $ProjectRoot 'assets\css\tokens.css'
$PagesDir      = Join-Path $ProjectRoot 'pages'
$ReportPath    = Join-Path $ProjectRoot 'docs\output\watchdog-report.md'
$SnapshotPath  = Join-Path $ProjectRoot 'docs\output\watchdog-snapshot.json'

function Write-OK    ($msg) { Write-Host "  [OK]    $msg" -ForegroundColor Green }
function Write-Warn  ($msg) { Write-Host "  [WARN]  $msg" -ForegroundColor Yellow }
function Write-Alert ($msg) { Write-Host "  [ALERT] $msg" -ForegroundColor Red }
function Write-Info  ($msg) { Write-Host "  [i]     $msg" -ForegroundColor DarkGray }

# --- Tokens.css hash (R1: inmutable) ---
function Get-FileHash256 ($path) {
    if (Test-Path $path) {
        return (Get-FileHash $path -Algorithm SHA256).Hash
    }
    return $null
}

# --- Extract CSS classes from swiss-style.css ---
function Get-CSSClasses ($cssFile) {
    $classes = @{}
    if (-not (Test-Path $cssFile)) { return $classes }
    $content = Get-Content $cssFile -Raw
    $matches = [regex]::Matches($content, '\.([a-zA-Z][a-zA-Z0-9_-]+)\s*[{,:]')
    foreach ($m in $matches) {
        $classes[$m.Groups[1].Value] = $true
    }
    return $classes
}

# --- Extract classes used in HTML files ---
function Get-HTMLClasses ($htmlDir) {
    $usedClasses = @{}
    $htmlFiles = Get-ChildItem $htmlDir -Filter '*.html' -ErrorAction SilentlyContinue
    foreach ($f in $htmlFiles) {
        $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        $matches = [regex]::Matches($content, 'class="([^"]*)"')
        foreach ($m in $matches) {
            $classList = $m.Groups[1].Value -split '\s+'
            foreach ($cls in $classList) {
                if ($cls -and $cls.Length -gt 1) {
                    if (-not $usedClasses.ContainsKey($cls)) {
                        $usedClasses[$cls] = @()
                    }
                    $usedClasses[$cls] += $f.Name
                }
            }
        }
    }
    return $usedClasses
}

# --- Extract IDs and names from HTML ---
function Get-HTMLContracts ($htmlDir) {
    $contracts = @{}
    $htmlFiles = Get-ChildItem $htmlDir -Filter '*.html' -ErrorAction SilentlyContinue
    foreach ($f in $htmlFiles) {
        $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { continue }

        $fileContracts = @()

        $idMatches = [regex]::Matches($content, '\bid="([^"]+)"')
        foreach ($m in $idMatches) { $fileContracts += ('id:{0}' -f $m.Groups[1].Value) }

        $nameMatches = [regex]::Matches($content, '\bname="([^"]+)"')
        foreach ($m in $nameMatches) { $fileContracts += ('name:{0}' -f $m.Groups[1].Value) }

        $dataMatches = [regex]::Matches($content, '\bdata-([a-z-]+)="([^"]*)"')
        foreach ($m in $dataMatches) { $fileContracts += ('data-{0}:{1}' -f $m.Groups[1].Value, $m.Groups[2].Value) }

        if ($fileContracts.Count -gt 0) {
            $contracts[$f.Name] = $fileContracts | Sort-Object
        }
    }
    return $contracts
}

# --- Detect hardcoded hex in CSS ---
function Get-HardcodedHex ($cssFile) {
    $violations = @()
    if (-not (Test-Path $cssFile)) { return $violations }
    $lines = Get-Content $cssFile
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match '^\s*/[/*]') { continue }
        if ($line -match '#[0-9a-fA-F]{3,8}' -and $line -notmatch 'var\(') {
            $violations += @{ Line = $lineNum; Content = $line.Trim() }
        }
    }
    return $violations
}

# --- Save/load snapshot ---
function Save-Snapshot ($tokensHash, $contracts) {
    $snapshot = @{
        timestamp   = (Get-Date -Format 'o')
        tokensHash  = $tokensHash
        contracts   = $contracts
    }
    $snapshot | ConvertTo-Json -Depth 5 | Set-Content $SnapshotPath -Encoding utf8
}

function Load-Snapshot {
    if (Test-Path $SnapshotPath) {
        return Get-Content $SnapshotPath -Raw | ConvertFrom-Json
    }
    return $null
}

# =============================================================================
#  MAIN CHECK
# =============================================================================
function Run-WatchdogCheck {
    $alerts = @()
    $warnings = @()
    $ok = @()
    $broken = @()
    $orphanClasses = @()
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

    # -- CHECK 1: tokens.css integrity (R1) --
    $currentTokensHash = Get-FileHash256 $TokensPath
    $snapshot = Load-Snapshot

    if ($snapshot -and $snapshot.tokensHash) {
        if ($currentTokensHash -ne $snapshot.tokensHash) {
            $msg = 'tokens.css fue MODIFICADO (violacion R1)'
            $alerts += $msg
            Write-Alert $msg
        } else {
            $ok += 'tokens.css intacto (R1)'
            Write-OK 'tokens.css intacto'
        }
    } else {
        Write-Info 'Primera ejecucion - guardando snapshot de tokens.css'
    }

    # -- CHECK 2: CSS contracts --
    $cssClasses = Get-CSSClasses $CSSPath
    $htmlClasses = Get-HTMLClasses $PagesDir

    $skipPrefixes = @('col-', 'row', 'container', 'btn-', 'form-', 'modal', 'nav', 'table', 'card', 'd-', 'text-', 'bg-', 'p-', 'px-', 'py-', 'pt-', 'pb-', 'ps-', 'pe-', 'm-', 'mx-', 'my-', 'mt-', 'mb-', 'ms-', 'me-', 'g-', 'gx-', 'gy-', 'w-', 'h-', 'gap-', 'align-', 'justify-', 'flex-', 'order-', 'offset-', 'position-', 'top-', 'bottom-', 'start-', 'end-', 'float-', 'overflow-', 'shadow', 'rounded', 'border', 'visually-', 'list-', 'dropdown', 'accordion', 'breadcrumb', 'pagination', 'badge', 'alert', 'toast', 'tooltip', 'popover', 'collapse', 'carousel', 'spinner', 'placeholder', 'ratio', 'vstack', 'hstack', 'clearfix', 'stretched-link', 'focus-ring', 'icon-link', 'object-fit', 'z-', 'opacity-', 'fs-', 'fw-', 'lh-', 'font-', 'fst-', 'link-', 'text-decoration-', 'user-select-', 'pe-none', 'pe-auto')

    foreach ($cls in $htmlClasses.Keys) {
        $isFramework = $false
        foreach ($prefix in $skipPrefixes) {
            if ($cls.StartsWith($prefix) -or $cls -eq $prefix.TrimEnd('-')) {
                $isFramework = $true
                break
            }
        }
        if (-not $isFramework -and -not $cssClasses.ContainsKey($cls)) {
            $pages = ($htmlClasses[$cls] | Select-Object -Unique) -join ', '
            $orphanClasses += ('.{0} usado en [{1}] pero no existe en swiss-style.css' -f $cls, $pages)
        }
    }

    if ($orphanClasses.Count -gt 0) {
        $warnings += $orphanClasses
        Write-Warn ('{0} clases huerfanas detectadas' -f $orphanClasses.Count)
    } else {
        $ok += 'Todas las clases CSS estan definidas'
        Write-OK 'CSS contracts OK'
    }

    # -- CHECK 3: JS contracts (IDs/names) --
    $currentContracts = Get-HTMLContracts $PagesDir

    if ($snapshot -and $snapshot.contracts) {
        $snapshotContracts = @{}
        foreach ($prop in $snapshot.contracts.PSObject.Properties) {
            $snapshotContracts[$prop.Name] = @($prop.Value)
        }

        foreach ($page in $snapshotContracts.Keys) {
            if ($currentContracts.ContainsKey($page)) {
                $oldSet = [System.Collections.Generic.HashSet[string]]::new([string[]]@($snapshotContracts[$page]))
                $newSet = [System.Collections.Generic.HashSet[string]]::new([string[]]@($currentContracts[$page]))

                $removed = [System.Collections.Generic.HashSet[string]]::new($oldSet)
                $removed.ExceptWith($newSet)

                foreach ($r in $removed) {
                    $broken += ('{0}: [{1}] fue REMOVIDO' -f $page, $r)
                }
            }
        }

        if ($broken.Count -gt 0) {
            $alerts += $broken
            Write-Alert ('{0} contratos JS/DB rotos' -f $broken.Count)
        } else {
            $ok += 'IDs, names y data-* intactos'
            Write-OK 'JS/DB contracts OK'
        }
    } else {
        Write-Info 'Primera ejecucion - guardando snapshot de contracts'
    }

    # -- CHECK 4: Hardcoded hex en swiss-style.css --
    $hexViolations = Get-HardcodedHex $CSSPath
    if ($hexViolations.Count -gt 0) {
        foreach ($v in $hexViolations) {
            $warnings += ('swiss-style.css L{0}: hardcoded hex -> {1}' -f $v.Line, $v.Content)
        }
        Write-Warn ('{0} hex hardcodeados en swiss-style.css' -f $hexViolations.Count)
    } else {
        $ok += 'Cero hex hardcodeados en CSS'
        Write-OK 'No hardcoded hex'
    }

    # -- Save snapshot (first run) --
    if (-not $snapshot) {
        Save-Snapshot $currentTokensHash $currentContracts
        Write-Info ('Snapshot guardado en {0}' -f $SnapshotPath)
    }

    # -- Generate report --
    $reportDir = Split-Path $ReportPath -Parent
    if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }

    $status = if ($alerts.Count -gt 0) { 'BROKEN' } elseif ($warnings.Count -gt 0) { 'WARNINGS' } else { 'CLEAN' }

    $tokensResult = if ($alerts | Where-Object { $_ -match 'tokens.css' }) { 'MODIFIED' } else { 'Intact' }
    $cssResult = if ($orphanClasses.Count -gt 0) { ('{0} orphans' -f $orphanClasses.Count) } else { 'OK' }
    $jsResult = if ($broken.Count -gt 0) { ('{0} broken' -f $broken.Count) } else { 'OK' }
    $hexResult = if ($hexViolations.Count -gt 0) { ('{0} violations' -f $hexViolations.Count) } else { 'Clean' }

    $rpt = @()
    $rpt += ('# Watchdog Report - {0}' -f $status)
    $rpt += ''
    $rpt += ('> Generated: {0}' -f $timestamp)
    $rpt += ''
    $rpt += '## Summary'
    $rpt += ''
    $rpt += '| Check | Result |'
    $rpt += '|:---|:---|'
    $rpt += ('| tokens.css (R1) | {0} |' -f $tokensResult)
    $rpt += ('| CSS contracts | {0} |' -f $cssResult)
    $rpt += ('| JS/DB contracts | {0} |' -f $jsResult)
    $rpt += ('| Hardcoded hex | {0} |' -f $hexResult)

    if ($alerts.Count -gt 0) {
        $rpt += ''
        $rpt += '## ALERTS'
        $rpt += ''
        foreach ($a in $alerts) { $rpt += ('- {0}' -f $a) }
    }

    if ($warnings.Count -gt 0) {
        $rpt += ''
        $rpt += '## Warnings'
        $rpt += ''
        foreach ($w in $warnings) { $rpt += ('- {0}' -f $w) }
    }

    if ($ok.Count -gt 0) {
        $rpt += ''
        $rpt += '## Passed'
        $rpt += ''
        foreach ($o in $ok) { $rpt += ('- {0}' -f $o) }
    }

    ($rpt -join "`n") | Set-Content $ReportPath -Encoding utf8

    # Console summary
    $statusColor = if ($alerts.Count -gt 0) { 'Red' } elseif ($warnings.Count -gt 0) { 'Yellow' } else { 'Green' }
    Write-Host ''
    Write-Host ('  Status: {0}' -f $status) -ForegroundColor $statusColor
    Write-Host ('  Report: {0}' -f $ReportPath) -ForegroundColor DarkGray
    Write-Host ''

    return @{ Alerts = $alerts.Count; Warnings = $warnings.Count; OK = $ok.Count }
}

# =============================================================================
#  MAIN LOOP
# =============================================================================
if (-not $Silent) { Clear-Host }
Write-Host ''
Write-Host '  DS WATCHDOG' -ForegroundColor Cyan
Write-Host '  ===========================================' -ForegroundColor Cyan
if ($Once) {
    Write-Host '  Mode: SINGLE RUN' -ForegroundColor DarkGray
} else {
    Write-Host ('  Mode: CONTINUOUS (every {0}s)' -f $IntervalSeconds) -ForegroundColor DarkGray
    Write-Host '  Press Ctrl+C to stop' -ForegroundColor DarkGray
}
Write-Host ''

if ($Once) {
    $result = Run-WatchdogCheck
    exit $(if ($result.Alerts -gt 0) { 1 } else { 0 })
}

while ($true) {
    $result = Run-WatchdogCheck
    if ($result.Alerts -gt 0) {
        Write-Host '  >> Alerts detected - check report <<' -ForegroundColor Red
        [Console]::Beep(800, 300)
        [Console]::Beep(800, 300)
    }
    Write-Host ('  Next check in {0}s...' -f $IntervalSeconds) -ForegroundColor DarkGray
    Start-Sleep -Seconds $IntervalSeconds
    if (-not $Silent) { Clear-Host }
    Write-Host ''
    Write-Host '  DS WATCHDOG (running)' -ForegroundColor Cyan
    Write-Host '  ===========================================' -ForegroundColor Cyan
    Write-Host ''
}
