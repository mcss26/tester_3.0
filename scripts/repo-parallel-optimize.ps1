<#
  Repo Audit -- Parallel Orchestrator
  Launches collectors in Windows Terminal tabs, monitors, then runs optimizer.
  Usage: .\scripts\repo-parallel-optimize.ps1 [-DryRun]
  Requires: Windows Terminal (wt.exe)
#>
param(
  [switch]$DryRun
)

$root = $PSScriptRoot | Split-Path
Set-Location $root

# --- Setup temp directory ---
$tempDir = Join-Path $env:TEMP "repo-audit"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
Get-ChildItem -Path $tempDir -Filter "*.done" -ErrorAction SilentlyContinue | Remove-Item -Force

# --- Ensure output dir exists ---
$outDir = Join-Path $root "docs\output\repo-audit"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# --- Wrapper: runs script, creates .done marker ---
$wrapperScript = @'
param(
  [string]$ScriptPath,
  [string]$TempDir,
  [string]$WorkDir,
  [string]$ScriptName,
  [string]$ExtraArgs
)
Set-Location $WorkDir
Write-Host ""
Write-Host "  $ScriptName" -ForegroundColor Cyan
Write-Host ("  " + ("=" * 50)) -ForegroundColor DarkGray
Write-Host ""
try {
  $argHash = @{ TempDir = $TempDir }
  if ($ExtraArgs -eq "-DryRun") { $argHash["DryRun"] = $true }
  & $ScriptPath @argHash
} catch {
  Write-Host ""
  Write-Host "  ERROR: $_" -ForegroundColor Red
}
Write-Host ""
Write-Host "  DONE: $ScriptName" -ForegroundColor Green
Write-Host "  Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
'@

$wrapperPath = Join-Path $tempDir "wrapper.ps1"
$wrapperScript | Out-File -FilePath $wrapperPath -Encoding utf8

# --- Launch helper ---
function Launch-Tab {
  param(
    [string]$Title,
    [string]$ScriptPath,
    [string]$ScriptName,
    [string]$ExtraArgs = ""
  )
  wt -w 0 nt --title $Title -d $root -- powershell -ExecutionPolicy Bypass -NoExit -File $wrapperPath -ScriptPath $ScriptPath -TempDir $tempDir -WorkDir $root -ScriptName $ScriptName -ExtraArgs $ExtraArgs
  Start-Sleep -Seconds 1
}

# --- Header ---
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  Repo Audit  -  Parallel Optimizer" -ForegroundColor Cyan
if ($DryRun) {
  Write-Host "  MODE: DRY RUN" -ForegroundColor Yellow
} else {
  Write-Host "  MODE: LIVE" -ForegroundColor Red
}
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# ===================================================
# GROUP A: 3 Collectors (parallel, independent)
# ===================================================
Write-Host "  [GROUP A] Launching 3 collectors..." -ForegroundColor Yellow
Write-Host "    1. Agent Infrastructure Cross-Reference" -ForegroundColor White
Write-Host "    2. Docs Structure Audit" -ForegroundColor White
Write-Host "    3. Scripts Health Check" -ForegroundColor White

$script1 = Join-Path $root "scripts\repo-audit-collect.ps1"
$script2 = Join-Path $root "scripts\docs-audit-collect.ps1"
$script3 = Join-Path $root "scripts\scripts-audit-collect.ps1"

Launch-Tab -Title "Audit-Agents" -ScriptPath $script1 -ScriptName "Agent Infrastructure"
Launch-Tab -Title "Audit-Docs"   -ScriptPath $script2 -ScriptName "Docs Structure"
Launch-Tab -Title "Audit-Scripts" -ScriptPath $script3 -ScriptName "Scripts Health"

Write-Host "    3 tabs opened!" -ForegroundColor Green
Write-Host ""

# ===================================================
# Monitor Group A
# ===================================================
$groupBLaunched = $false
$groupCDone     = $false

Write-Host "  Monitoring progress..." -ForegroundColor DarkGray
Write-Host ""

$markerA1 = Join-Path $tempDir "repo-audit-collect.done"
$markerA2 = Join-Path $tempDir "docs-audit-collect.done"
$markerA3 = Join-Path $tempDir "scripts-audit-collect.done"
$markerB  = Join-Path $tempDir "repo-optimize.done"

while ($true) {
  Start-Sleep -Seconds 3
  $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)

  $a1 = Test-Path $markerA1
  $a2 = Test-Path $markerA2
  $a3 = Test-Path $markerA3
  $b  = Test-Path $markerB

  # Count completed
  $doneCount = @($a1, $a2, $a3, $b) | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count

  # When all 3 collectors done -> launch Group B
  if ((-not $groupBLaunched) -and $a1 -and $a2 -and $a3) {
    $groupBLaunched = $true
    Write-Host ""
    Write-Host ("  GROUP A complete! - " + $elapsed + " min") -ForegroundColor Green
    Write-Host ""
    Write-Host "  [GROUP B] Launching optimizer..." -ForegroundColor Yellow

    $script4 = Join-Path $root "scripts\repo-optimize.ps1"
    $extra = if ($DryRun) { "-DryRun" } else { "" }
    Launch-Tab -Title "Repo-Optimize" -ScriptPath $script4 -ScriptName "Repo Optimizer" -ExtraArgs $extra

    Write-Host "    1 tab opened!" -ForegroundColor Green
  }

  # Progress bar
  $total = 4
  $remaining = $total - $doneCount
  $bar = ("X" * $doneCount) + ("." * $remaining)
  Write-Host ("`r  [$bar] $doneCount/$total complete | $elapsed min") -NoNewline -ForegroundColor DarkGray

  if ($b) { break }
}

# ===================================================
# GROUP C: Quick verification (inline, no extra tab)
# ===================================================
$totalMin = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
Write-Host ""
Write-Host ""
Write-Host ("  GROUP B complete! - " + $totalMin + " min") -ForegroundColor Green
Write-Host ""
Write-Host "  [GROUP C] Running verification..." -ForegroundColor Yellow

# Run npm audit
Write-Host "    npm run audit..." -ForegroundColor White
$auditResult = & npm run audit 2>&1
$auditExit = $LASTEXITCODE
if ($auditExit -eq 0) {
  Write-Host "    npm audit: PASS" -ForegroundColor Green
} else {
  Write-Host "    npm audit: ISSUES FOUND (exit code $auditExit)" -ForegroundColor Yellow
}

# Check REGISTRY parses
Write-Host "    REGISTRY.yml integrity..." -ForegroundColor White
$registryContent = Get-Content (Join-Path $root ".agent\REGISTRY.yml") -Raw -ErrorAction SilentlyContinue
if ($registryContent) {
  Write-Host "    REGISTRY.yml: readable" -ForegroundColor Green
} else {
  Write-Host "    REGISTRY.yml: CANNOT READ" -ForegroundColor Red
}

# Check all AGENT.md files exist
Write-Host "    AGENT.md files..." -ForegroundColor White
$agentDirs = Get-ChildItem -Path (Join-Path $root ".agent\agents") -Directory -ErrorAction SilentlyContinue
$missing = 0
foreach ($ad in $agentDirs) {
  $mdPath = Join-Path $ad.FullName "AGENT.md"
  if (-not (Test-Path $mdPath)) { $missing++ }
}
if ($missing -eq 0) {
  Write-Host "    All $($agentDirs.Count) AGENT.md files present" -ForegroundColor Green
} else {
  Write-Host "    $missing AGENT.md files missing!" -ForegroundColor Red
}

# Git diff summary
Write-Host ""
Write-Host "  Changes summary:" -ForegroundColor White
& git diff --stat 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }

# ===================================================
# DONE
# ===================================================
$finalMin = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host ("  REPO OPTIMIZATION COMPLETE  -  " + $finalMin + " min") -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host ""
Write-Host "  Reports:" -ForegroundColor White
Write-Host "    docs/output/repo-audit/agent-crossref.json" -ForegroundColor DarkGray
Write-Host "    docs/output/repo-audit/docs-waste.json" -ForegroundColor DarkGray
Write-Host "    docs/output/repo-audit/scripts-health.json" -ForegroundColor DarkGray
Write-Host "    docs/output/repo-audit/optimization-report.md" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Next: review optimization-report.md and run 'git add -p'" -ForegroundColor Cyan
Write-Host ""

# Cleanup markers
Get-ChildItem -Path $tempDir -Filter "*.done" -ErrorAction SilentlyContinue | Remove-Item -Force
