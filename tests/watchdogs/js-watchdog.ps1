# =============================================================================
# JS Safety Watchdog - Error Handling & Mutation Monitor
# Companion to scripts/audit-js-safety.js
# Follows ds-watchdog.ps1 pattern: snapshot > check > diff > report
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File tests/watchdogs/js-watchdog.ps1 -Once
#   powershell -ExecutionPolicy Bypass -File tests/watchdogs/js-watchdog.ps1
#
# WHAT IT DOES (each cycle):
# 1. Runs audit-js-safety.js > parses the generated report
# 2. Compares findings against saved snapshot (baseline)
# 3. Detects REGRESSIONS (new findings) and FIXES (removed findings)
# 4. Error handling coverage: scans for try/catch around Supabase calls
# 5. Generates watchdog-js-report.md + updates snapshot
# =============================================================================

param(
          [int]$IntervalSeconds = 120,
          [switch]$Once,
          [switch]$Silent,
          [switch]$ResetBaseline
)

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$AuditScript = Join-Path $ProjectRoot 'scripts\audit-js-safety.js'
$AuditReport = Join-Path $ProjectRoot 'docs\output\js-safety-report.md'
$SnapshotPath = Join-Path $ProjectRoot 'docs\output\js-watchdog-snapshot.json'
$ReportPath = Join-Path $ProjectRoot 'docs\output\watchdog-js-report.md'
$LogDir = Join-Path $PSScriptRoot 'logs'
$ModulesDir = Join-Path $ProjectRoot 'assets\js\modules'
$CoreDir = Join-Path $ProjectRoot 'assets\js\core'

# -- Console helpers (match ds-watchdog style) --
function Write-OK    ($msg) { Write-Host "  [OK]    $msg" -ForegroundColor Green }
function Write-Warn  ($msg) { Write-Host "  [WARN]  $msg" -ForegroundColor Yellow }
function Write-Alert ($msg) { Write-Host "  [ALERT] $msg" -ForegroundColor Red }
function Write-Info  ($msg) { Write-Host "  [i]     $msg" -ForegroundColor DarkGray }
function Write-Fix   ($msg) { Write-Host "  [FIX]   $msg" -ForegroundColor Cyan }

# -- Snapshot I/O --
function Save-Snapshot ($data) {
          $snapshot = @{
                    timestamp = (Get-Date -Format 'o')
                    findings  = $data
          }
          $json = $snapshot | ConvertTo-Json -Depth 10 -Compress
          $dir = Split-Path $SnapshotPath -Parent
          if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
          Set-Content -Path $SnapshotPath -Value $json -Encoding utf8
}

function Load-Snapshot {
          if (Test-Path $SnapshotPath) {
                    try {
                              return Get-Content $SnapshotPath -Raw | ConvertFrom-Json
                    }
                    catch {
                              Write-Warn 'Snapshot corrupto, se regenerara.'
                              return $null
                    }
          }
          return $null
}

# -- Parse audit-js-safety.js markdown report --
function Parse-AuditReport ($reportPath) {
          if (-not (Test-Path $reportPath)) { return $null }
          $content = Get-Content $reportPath -Raw
          $lines = $content -split "`n"

          $result = @{
                    fireForget   = 0
                    silentCatch  = 0
                    singleUsage  = 0
                    intervals    = 0
                    total        = 0
                    score        = 0
                    filesScanned = 0
          }

          foreach ($ln in $lines) {
                    if ($ln -match 'Fire-and-forget mutations \| (\d+)') { $result.fireForget = [int]$Matches[1] }
                    if ($ln -match 'Silent catches \| (\d+)') { $result.silentCatch = [int]$Matches[1] }
                    if ($ln -match '\.single\(\) usage \| (\d+)') { $result.singleUsage = [int]$Matches[1] }
                    if ($ln -match 'Uncleaned intervals \| (\d+)') { $result.intervals = [int]$Matches[1] }
                    if ($ln -match 'Total findings.+\*\*(\d+)\*\*') { $result.total = [int]$Matches[1] }
                    if ($ln -match 'Safety Score: (\d+)/100.*\((\d+) files') {
                              $result.score = [int]$Matches[1]
                              $result.filesScanned = [int]$Matches[2]
                    }
          }
          return $result
}

# -- Error handling coverage (PowerShell-based scan) --
function Get-ErrorHandlingCoverage {
          $totalMut = 0
          $handledMut = 0
          $unhandled = @()

          $dirs = @($ModulesDir, $CoreDir)
          $jsFiles = @()
          foreach ($d in $dirs) {
                    if (Test-Path $d) {
                              $jsFiles += Get-ChildItem $d -Filter '*.js' -Recurse -ErrorAction SilentlyContinue
                    }
          }

          $openBrace = [char]'{'
          $closeBrace = [char]'}'

          foreach ($f in $jsFiles) {
                    $fileLines = Get-Content $f.FullName -ErrorAction SilentlyContinue
                    if (-not $fileLines) { continue }
                    $rel = $f.FullName.Replace($ProjectRoot.Path + '\', '').Replace('\', '/')

                    for ($i = 0; $i -lt $fileLines.Count; $i++) {
                              $line = $fileLines[$i].Trim()
                              # Match Supabase mutation calls
                              if ($line -notmatch '\.(insert|update|delete|upsert|rpc)\s*\(') { continue }
                              # Verify it references sb
                              $prevLine = ''
                              if ($i -gt 0) { $prevLine = $fileLines[$i - 1] }
                              if ($line -notmatch '(?:window\.)?sb\b' -and $prevLine -notmatch '(?:window\.)?sb\b') { continue }

                              $totalMut++

                              # Check: is result captured? (same line or previous line)
                              $combined = "$prevLine $line"
                              $isCaptured = ($combined -match '(?:const|let|var)\s*[{]') -or ($combined -match '(?:const|let|var)\s+\w+\s*=')

                              # Check: is it inside a try block? (scan up to 30 lines above)
                              $inTry = $false
                              $depth = 0
                              for ($j = $i; $j -ge [Math]::Max(0, $i - 30); $j--) {
                                        $scanLine = $fileLines[$j]
                                        # Count braces using char comparison
                                        foreach ($ch in $scanLine.ToCharArray()) {
                                                  if ($ch -eq $closeBrace) { $depth++ }
                                                  if ($ch -eq $openBrace) { $depth-- }
                                        }
                                        if ($scanLine -match 'try\s*[{]') {
                                                  $inTry = $true
                                                  break
                                        }
                              }

                              if ($isCaptured -or $inTry) {
                                        $handledMut++
                              }
                              else {
                                        $snippet = $line
                                        if ($snippet.Length -gt 100) { $snippet = $snippet.Substring(0, 100) }
                                        $unhandled += @{ file = $rel; line = ($i + 1); content = $snippet }
                              }
                    }
          }

          $pct = 100
          if ($totalMut -gt 0) { $pct = [Math]::Round(($handledMut / $totalMut) * 100, 1) }

          return @{
                    totalMutations     = $totalMut
                    handledMutations   = $handledMut
                    unhandledMutations = ($totalMut - $handledMut)
                    coveragePercent    = $pct
                    unhandledDetails   = $unhandled
          }
}

# =============================================================================
#  MAIN CHECK
# =============================================================================
function Run-WatchdogCheck {
          $alerts = @()
          $fixes = @()
          $ok = @()
          $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

          # -- Step 1: Run the scanner --
          Write-Info 'Running audit-js-safety.js...'
          $null = & node $AuditScript 2>&1
          if (-not (Test-Path $AuditReport)) {
                    Write-Alert 'Scanner failed: no report generated'
                    return @{ Alerts = 1; Fixes = 0; OK = 0 }
          }

          # -- Step 2: Parse results --
          $current = Parse-AuditReport $AuditReport
          if (-not $current) {
                    Write-Alert 'Could not parse audit report'
                    return @{ Alerts = 1; Fixes = 0; OK = 0 }
          }

          Write-Info ('Scan: {0} findings, Score {1}/100, {2} files' -f $current.total, $current.score, $current.filesScanned)

          # -- Step 3: Error handling coverage --
          Write-Info 'Checking error handling coverage...'
          $ehCov = Get-ErrorHandlingCoverage
          Write-Info ('Coverage: {0}% ({1}/{2} mutations handled)' -f $ehCov.coveragePercent, $ehCov.handledMutations, $ehCov.totalMutations)

          # -- Step 4: Compare with snapshot --
          $snapshot = $null
          if (-not $ResetBaseline) { $snapshot = Load-Snapshot }
          $isFirstRun = ($null -eq $snapshot)

          if (-not $isFirstRun) {
                    $prev = $snapshot.findings

                    # Compare category counts
                    $categories = @(
                              @{ name = 'Fire-and-forget'; cur = $current.fireForget; prev = $prev.fireForget },
                              @{ name = 'Silent catches'; cur = $current.silentCatch; prev = $prev.silentCatch },
                              @{ name = '.single() usage'; cur = $current.singleUsage; prev = $prev.singleUsage },
                              @{ name = 'Unclean intervals'; cur = $current.intervals; prev = $prev.intervals }
                    )

                    foreach ($cat in $categories) {
                              $delta = $cat.cur - $cat.prev
                              if ($delta -gt 0) {
                                        $msg = '{0}: +{1} REGRESSION ({2} > {3})' -f $cat.name, $delta, $cat.prev, $cat.cur
                                        $alerts += $msg
                                        Write-Alert $msg
                              }
                              elseif ($delta -lt 0) {
                                        $msg = '{0}: {1} FIXED ({2} > {3})' -f $cat.name, [Math]::Abs($delta), $cat.prev, $cat.cur
                                        $fixes += $msg
                                        Write-Fix $msg
                              }
                              else {
                                        $ok += ('{0}: stable at {1}' -f $cat.name, $cat.cur)
                                        Write-OK ('{0}: stable' -f $cat.name)
                              }
                    }

                    # Score change
                    $scoreDelta = $current.score - $prev.score
                    if ($scoreDelta -lt 0) {
                              $msg = 'Safety Score DROPPED: {0} > {1} ({2})' -f $prev.score, $current.score, $scoreDelta
                              $alerts += $msg
                              Write-Alert $msg
                    }
                    elseif ($scoreDelta -gt 0) {
                              $msg = 'Safety Score IMPROVED: {0} > {1} (+{2})' -f $prev.score, $current.score, $scoreDelta
                              $fixes += $msg
                              Write-Fix $msg
                    }
                    else {
                              $ok += ('Safety Score: stable at {0}/100' -f $current.score)
                    }
          }
          else {
                    Write-Info 'First run - saving baseline snapshot'
                    $ok += ('Baseline captured: {0} findings, Score {1}/100' -f $current.total, $current.score)
          }

          # Error handling coverage threshold
          if ($ehCov.coveragePercent -lt 90) {
                    $msg = 'Error handling coverage LOW: {0}% ({1} unhandled mutations)' -f $ehCov.coveragePercent, $ehCov.unhandledMutations
                    $alerts += $msg
                    Write-Warn $msg
          }
          else {
                    $ok += ('Error handling coverage: {0}%' -f $ehCov.coveragePercent)
                    Write-OK ('Error handling: {0}%' -f $ehCov.coveragePercent)
          }

          # -- Step 5: Save snapshot --
          Save-Snapshot $current
          Write-Info ('Snapshot saved: {0}' -f $SnapshotPath)

          # -- Step 6: Generate report --
          $status = 'STABLE'
          if ($alerts.Count -gt 0) { $status = 'REGRESSION' }
          elseif ($fixes.Count -gt 0) { $status = 'IMPROVING' }

          $rpt = @()
          $rpt += '# JS Watchdog Report - {0}' -f $status
          $rpt += ''
          $rpt += '> Generated: {0}' -f $timestamp
          if ($isFirstRun) {
                    $rpt += '> Baseline: NEW'
          }
          else {
                    $rpt += '> Baseline: {0}' -f $snapshot.timestamp
          }
          $rpt += ''
          $rpt += '## Current State'
          $rpt += ''
          $rpt += '| Metric | Value |'
          $rpt += '|:---|:---|'
          $rpt += '| Safety Score | **{0}/100** |' -f $current.score
          $rpt += '| Fire-and-forget | {0} |' -f $current.fireForget
          $rpt += '| Silent catches | {0} |' -f $current.silentCatch
          $rpt += '| .single() usage | {0} |' -f $current.singleUsage
          $rpt += '| Uncleaned intervals | {0} |' -f $current.intervals
          $rpt += '| **Total findings** | **{0}** |' -f $current.total
          $rpt += '| Files scanned | {0} |' -f $current.filesScanned
          $rpt += '| Error handling coverage | **{0}%** ({1}/{2}) |' -f $ehCov.coveragePercent, $ehCov.handledMutations, $ehCov.totalMutations
          $rpt += ''

          if ($fixes.Count -gt 0) {
                    $rpt += '## Progress (Fixed)'
                    $rpt += ''
                    foreach ($fx in $fixes) { $rpt += '- {0}' -f $fx }
                    $rpt += ''
          }

          if ($alerts.Count -gt 0) {
                    $rpt += '## Regressions'
                    $rpt += ''
                    foreach ($al in $alerts) { $rpt += '- {0}' -f $al }
                    $rpt += ''
          }

          if ($ehCov.unhandledDetails.Count -gt 0) {
                    $rpt += '## Unhandled Mutations'
                    $rpt += ''
                    $rpt += '| File | Line | Code |'
                    $rpt += '|:---|---:|:---|'
                    foreach ($d in $ehCov.unhandledDetails) {
                              $rpt += '| {0} | L{1} | {2} |' -f $d.file, $d.line, $d.content
                    }
                    $rpt += ''
          }

          if ($ok.Count -gt 0) {
                    $rpt += '## Passed'
                    $rpt += ''
                    foreach ($o in $ok) { $rpt += '- {0}' -f $o }
          }

          $reportDir = Split-Path $ReportPath -Parent
          if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }
          ($rpt -join "`n") | Set-Content $ReportPath -Encoding utf8

          # -- Log to file --
          if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
          $logFile = Join-Path $LogDir ('js-watchdog-{0}.log' -f (Get-Date -Format 'yyyyMMdd'))
          $logEntry = '[{0}] Status={1} Score={2} FF={3} SC={4} SI={5} IV={6} EH={7}% Alerts={8} Fixes={9}' -f `
                    $timestamp, $status, $current.score, $current.fireForget, $current.silentCatch, `
                    $current.singleUsage, $current.intervals, $ehCov.coveragePercent, `
                    $alerts.Count, $fixes.Count
          Add-Content $logFile $logEntry

          # Console summary
          $statusColor = 'Green'
          if ($alerts.Count -gt 0) { $statusColor = 'Red' }
          elseif ($fixes.Count -gt 0) { $statusColor = 'Cyan' }

          Write-Host ''
          Write-Host ('  Status: {0}' -f $status) -ForegroundColor $statusColor
          Write-Host ('  Report: {0}' -f $ReportPath) -ForegroundColor DarkGray
          Write-Host ''

          return @{ Alerts = $alerts.Count; Fixes = $fixes.Count; OK = $ok.Count }
}

# =============================================================================
#  MAIN LOOP
# =============================================================================
if (-not $Silent) { Clear-Host }
Write-Host ''
Write-Host '  JS SAFETY WATCHDOG' -ForegroundColor Cyan
Write-Host '  ===========================================' -ForegroundColor Cyan
if ($Once) {
          Write-Host '  Mode: SINGLE RUN' -ForegroundColor DarkGray
}
else {
          Write-Host ('  Mode: CONTINUOUS (every {0}s)' -f $IntervalSeconds) -ForegroundColor DarkGray
          Write-Host '  Press Ctrl+C to stop' -ForegroundColor DarkGray
}
Write-Host ''

if ($Once) {
          $result = Run-WatchdogCheck
          $exitCode = 0
          if ($result.Alerts -gt 0) { $exitCode = 1 }
          exit $exitCode
}

while ($true) {
          $result = Run-WatchdogCheck
          if ($result.Alerts -gt 0) {
                    Write-Host '  >> REGRESSIONS DETECTED - check report <<' -ForegroundColor Red
                    [Console]::Beep(800, 300)
                    [Console]::Beep(800, 300)
          }
          Write-Host ('  Next check in {0}s...' -f $IntervalSeconds) -ForegroundColor DarkGray
          Start-Sleep -Seconds $IntervalSeconds
          if (-not $Silent) { Clear-Host }
          Write-Host ''
          Write-Host '  JS SAFETY WATCHDOG (running)' -ForegroundColor Cyan
          Write-Host '  ===========================================' -ForegroundColor Cyan
          Write-Host ''
}
