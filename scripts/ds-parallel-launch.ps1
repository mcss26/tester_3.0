<#
  Design System — Visual Orchestrator
  Uso: .\scripts\ds-parallel-launch.ps1
  Abre Windows Terminal tabs visibles + maneja dependencias automaticamente.
  Requisito: Windows Terminal (wt.exe)
#>

$root = $PSScriptRoot | Split-Path
Set-Location $root

# --- Prompts ---
$prompts = @{
  chat1 = "Fix all hardcoded hex colors in assets/css/components.css. There are ~34 hex values outside :root blocks that need to be replaced with var(--token) references. Use the token map from assets/css/tokens.css (e.g. #000 to var(--neutral-0), #fff to var(--text-primary), #4ade80 to var(--success)). Do NOT touch hex inside :root blocks or rgba() fallbacks. If no token exists, add a comment /* TODO: no token */. After changes verify with a grep that no styling hex remain outside :root."
  chat2 = "Migrate 7 component groups from inline CSS in docs/_generated/frontend/design-system-visual.html style block to assets/css/swiss-style.css: .toast variants, .modal-demo/.modal-body/.modal-footer, .pill-nav/.pill-item, .pagination/.page-item, .status-dot variants, .skeleton with @keyframes shimmer, and .btn-lg. All colors must use var() tokens from tokens.css. Remove the duplicates from visual.html after migrating. Keep same visual appearance. Verify by opening visual.html in browser."
  chat3 = "Add showcases for 8 core components to docs/_generated/frontend/design-system-visual.html. Components already have CSS in assets/css/components.css: .toggle-switch+.toggle-slider, .checkbox+.checkbox-custom, .spinner+.spinner-sm, .progress-bar+.progress-bar-fill, .tooltip, .dropdown+.dropdown-menu+.dropdown-item, .health-badge, .btn-icon-sm/.btn-xs/.btn-outline. See docs/_generated/frontend/component-inventory.md for exact CSS line numbers. Follow existing .ds-section pattern. Add interactive demos."
  chat4 = "Add showcases for 9 more components to docs/_generated/frontend/design-system-visual.html: dialog.modal+.modal-content, .modal-overlay+.modal-card, .tab+.tab-chip, .wk-tabs+.wk-tab, .tab-group-logic, .pill standalone, .system-status-pill, .custom-dropdown, .breadcrumbs+.breadcrumb-item. CSS in assets/css/components.css. See component-inventory.md for line numbers. Follow .ds-section pattern. Add interactive JS where appropriate."
  chat5 = "Add domain and layout showcases to docs/_generated/frontend/design-system-visual.html. Domain: .stat-card+.kpi-strip+.kpi-badge, .summary-metrics-grid, .pnl-summary+.pnl-row, .timeline+.status-timeline, .profile-card, .panel-header/body/footer, .list-stack-row, .anomaly-alert, .preflight-panel+.preflight-item, .shimmer. Layout: .page-header, .notif-panel-minimal, .history-compact+.history-chip, .input-currency-wrap, .workday-status+.workday-dot. CSS in assets/css/components.css. Reference component-inventory.md."
  chat6 = "Clean up structural issues in assets/css/components.css: 1) Deduplicate .list-stack, .progress-bar, .panel-scroll (defined 2-3 times, keep most complete). 2) Consolidate .toggle (old) and .toggle-switch (new canonical), add redirect comment at old location. 3) Add section index comment at top of file. Do NOT change visual behavior. Verify with diff."
}

# --- Setup temp directory ---
$tempDir = Join-Path $env:TEMP "ds-phases"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
Get-ChildItem -Path $tempDir -Filter "*.done" -ErrorAction SilentlyContinue | Remove-Item -Force

foreach ($key in $prompts.Keys) {
  $prompts[$key] | Out-File -FilePath (Join-Path $tempDir "$key.txt") -Encoding utf8 -NoNewline
}

# --- Wrapper script: runs gemini, creates .done marker ---
$wrapperScript = @'
param(
  [string]$ChatName,
  [string]$PromptFile,
  [string]$TempDir,
  [string]$WorkDir
)
Set-Location $WorkDir
Write-Host ""
Write-Host "  $ChatName" -ForegroundColor Cyan
Write-Host ("  " + ("=" * 50)) -ForegroundColor DarkGray
Write-Host ""
Get-Content $PromptFile | gemini
New-Item -Path (Join-Path $TempDir "$ChatName.done") -ItemType File -Force | Out-Null
Write-Host ""
Write-Host "  COMPLETE: $ChatName" -ForegroundColor Green
Write-Host "  Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
'@
$wrapperPath = Join-Path $tempDir "wrapper.ps1"
$wrapperScript | Out-File -FilePath $wrapperPath -Encoding utf8

# --- Launch helper ---
function Launch-Tab {
  param([string]$
  Title, [string]$ChatName, [string]$PromptKey)
  $promptFile = Join-Path $tempDir "$PromptKey.txt"
  wt -w 0 nt --title $Title -d $root -- powershell -ExecutionPolicy Bypass -NoExit -File $wrapperPath -ChatName $ChatName -PromptFile $promptFile -TempDir $tempDir -WorkDir $root
  Start-Sleep -Seconds 1
}

# --- Header ---
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  Design System  -  Visual Orchestrator" -ForegroundColor Cyan
Write-Host "  Watch all chats run in separate terminal tabs!" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# === GROUP A: Independent ===
Write-Host "  [GROUP A]" -ForegroundColor Yellow
Write-Host "    Chat 1: Hex Cleanup - components.css" -ForegroundColor White
Write-Host "    Chat 2: CSS Migration - HTML to swiss-style" -ForegroundColor White

Launch-Tab -Title "Chat1-HexCleanup" -ChatName "Chat1-HexCleanup" -PromptKey "chat1"
Launch-Tab -Title "Chat2-CSSMigrate" -ChatName "Chat2-CSSMigrate" -PromptKey "chat2"

Write-Host "    2 tabs opened!" -ForegroundColor Green
Write-Host ""

# === Monitor and launch dependents ===
$groupBLaunched = $false
$groupCLaunched = $false

Write-Host "  Monitoring progress..." -ForegroundColor DarkGray
Write-Host ""

while ($true) {
  Start-Sleep -Seconds 3
  $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)

  # Check Chat 2 done -> launch Group B
  $chat2Marker = Join-Path $tempDir "Chat2-CSSMigrate.done"
  if ((-not $groupBLaunched) -and (Test-Path $chat2Marker)) {
    $groupBLaunched = $true
    Write-Host ""
    Write-Host ("  Chat 2 finished! - " + $elapsed + "min") -ForegroundColor Green
    Write-Host ""
    Write-Host "  [GROUP B]" -ForegroundColor Yellow
    Write-Host "    Chat 3: Core Showcases batch 1" -ForegroundColor White
    Write-Host "    Chat 4: Core Showcases batch 2" -ForegroundColor White
    Write-Host "    Chat 5: Domain + Layout" -ForegroundColor White

    Launch-Tab -Title "Chat3-CoreShowcase1" -ChatName "Chat3-CoreShowcase1" -PromptKey "chat3"
    Launch-Tab -Title "Chat4-CoreShowcase2" -ChatName "Chat4-CoreShowcase2" -PromptKey "chat4"
    Launch-Tab -Title "Chat5-DomainLayout"  -ChatName "Chat5-DomainLayout"  -PromptKey "chat5"

    Write-Host "    3 tabs opened!" -ForegroundColor Green
  }

  # Check Chat 1 done -> launch Group C
  $chat1Marker = Join-Path $tempDir "Chat1-HexCleanup.done"
  if ((-not $groupCLaunched) -and (Test-Path $chat1Marker)) {
    $groupCLaunched = $true
    Write-Host ""
    Write-Host ("  Chat 1 finished! - " + $elapsed + "min") -ForegroundColor Green
    Write-Host ""
    Write-Host "  [GROUP C]" -ForegroundColor Yellow
    Write-Host "    Chat 6: CSS Health" -ForegroundColor White

    Launch-Tab -Title "Chat6-CSSHealth" -ChatName "Chat6-CSSHealth" -PromptKey "chat6"

    Write-Host "    1 tab opened!" -ForegroundColor Green
  }

  # Count completed
  $doneFiles = Get-ChildItem -Path $tempDir -Filter "*.done" -ErrorAction SilentlyContinue
  $doneCount = 0
  if ($doneFiles) { $doneCount = @($doneFiles).Count }

  # Progress bar
  $total = 6
  $remaining = $total - $doneCount
  $bar = ("X" * $doneCount) + ("." * $remaining)
  Write-Host ("`r  [$bar] $doneCount/$total complete | $elapsed min") -NoNewline -ForegroundColor DarkGray

  if ($doneCount -ge 6) { break }
}

# === DONE ===
$totalMin = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
Write-Host ""
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host ("  ALL 6 PHASES COMPLETE  -  " + $totalMin + " minutes total") -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host ""
Write-Host "  Run 'git diff --stat' to see all changes." -ForegroundColor DarkGray

# Cleanup markers
Get-ChildItem -Path $tempDir -Filter "*.done" -ErrorAction SilentlyContinue | Remove-Item -Force
