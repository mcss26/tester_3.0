# =============================================================================
# Batch Remediation Orchestrator v1 - FormulaMid 4
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 -Workers 5
#   powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 -DryRun
#   powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 -OnlyModule admin
#   powershell -ExecutionPolicy Bypass -File scripts/batch-remediation.ps1 -OnlyCritical
#
# QUE HACE:
# Lee los prompts generados por ui-component-scanner.ps1 y los envia
# a instancias paralelas de Gemini CLI. Cada instancia recibe un prompt
# y genera un plan de remediacion que se guarda en docs/output/ui-scan/plans/.
#
# PREREQUISITOS:
# - Gemini CLI instalado y autenticado (gemini en PATH)
# - Haber corrido ui-component-scanner.ps1 primero
# =============================================================================

param(
    [int]$Workers     = 3,        # Instancias paralelas de gemini CLI
    [int]$DelayMs     = 2000,     # Delay entre lanzamientos (rate limit)
    [string]$OnlyModule = "",     # Filtrar por modulo: admin, operativo, etc.
    [switch]$OnlyCritical,        # Solo paginas con score < 50
    [switch]$DryRun               # Solo mostrar que haria, sin ejecutar
)

# == Paths ==
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot -or -not (Test-Path $ProjectRoot)) {
    $ProjectRoot = (Get-Location).Path
}

$ScanDir    = Join-Path $ProjectRoot "docs\output\ui-scan"
$PromptsDir = Join-Path $ScanDir "cli-prompts"
$PlansDir   = Join-Path $ScanDir "plans"
$SummaryFile = Join-Path $ScanDir "summary.json"
$LogFile    = Join-Path $ScanDir "batch-log.txt"

# == Colores ==
function Write-OK    ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info  ($msg) { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
function Write-Warn  ($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Alert ($msg) { Write-Host "  [!!] $msg" -ForegroundColor Red }
function Write-Head  ($msg) { Write-Host "`n  $msg" -ForegroundColor Cyan }

# =============================================================================
# VALIDATION
# =============================================================================
Clear-Host
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Blue
Write-Host "   BATCH REMEDIATION ORCHESTRATOR v1" -ForegroundColor White
Write-Host "  ==========================================" -ForegroundColor Blue
Write-Host ""

# Check prerequisites
if (-not (Test-Path $PromptsDir)) {
    Write-Alert "No existe $PromptsDir"
    Write-Alert "Ejecuta primero: scripts/ui-component-scanner.ps1"
    exit 1
}

if (-not (Test-Path $SummaryFile)) {
    Write-Alert "No existe summary.json - ejecuta el scanner primero"
    exit 1
}

# Check gemini CLI
$geminiPath = Get-Command "gemini" -ErrorAction SilentlyContinue
if (-not $geminiPath -and -not $DryRun) {
    Write-Alert "gemini CLI no encontrado en PATH"
    Write-Info  "Instala con: npm install -g @anthropic-ai/gemini-cli"
    exit 1
}

# Ensure output dir
if (-not (Test-Path $PlansDir)) {
    New-Item -Path $PlansDir -ItemType Directory -Force | Out-Null
}

# =============================================================================
# LOAD AND PRIORITIZE
# =============================================================================
Write-Head "CARGANDO PROMPTS"

$summary = Get-Content $SummaryFile -Raw | ConvertFrom-Json
$promptFiles = Get-ChildItem $PromptsDir -Filter "*.md" | Sort-Object Name

# Build prioritized queue
$queue = @()
foreach ($pf in $promptFiles) {
    $pageName = $pf.Name -replace '\.md$', '.html'

    # Find score from summary
    $pageInfo = $summary.pages | Where-Object { $_.page -eq $pageName }
    $score = if ($pageInfo) { $pageInfo.score } else { 50 }
    $module = if ($pageInfo) { $pageInfo.module } else { "unknown" }

    # Filter by module
    if ($OnlyModule -ne "" -and $module -ne $OnlyModule) { continue }

    # Filter critical only
    if ($OnlyCritical -and $score -ge 50) { continue }

    # Skip if plan already exists
    $planPath = Join-Path $PlansDir $pf.Name
    $alreadyDone = Test-Path $planPath

    $queue += [PSCustomObject]@{
        PromptFile = $pf.FullName
        PlanFile   = $planPath
        PageName   = $pageName
        Module     = $module
        Score      = $score
        Done       = $alreadyDone
        FileName   = $pf.Name
    }
}

# Sort by score ascending (worst first = highest priority)
$queue = $queue | Sort-Object Score

$pending = @($queue | Where-Object { -not $_.Done })
$done    = @($queue | Where-Object { $_.Done })

Write-OK "$($queue.Count) paginas en cola"
if ($done.Count -gt 0) {
    Write-Info "$($done.Count) ya tienen plan (skip)"
}
Write-Info "$($pending.Count) pendientes"

if ($pending.Count -eq 0) {
    Write-OK "Todas las paginas ya tienen plan de remediacion"
    exit 0
}

# =============================================================================
# SHOW PLAN
# =============================================================================
Write-Head "COLA DE EJECUCION (ordenada por prioridad)"
Write-Host ""

$batchNum = 0
for ($i = 0; $i -lt $pending.Count; $i++) {
    $item = $pending[$i]
    if ($i % $Workers -eq 0) {
        $batchNum++
        Write-Host "  --- Batch $batchNum ---" -ForegroundColor DarkYellow
    }
    $tier = if ($item.Score -lt 50) { "CRIT" } elseif ($item.Score -lt 80) { "PARC" } else { " OK " }
    $color = if ($item.Score -lt 50) { "Red" } elseif ($item.Score -lt 80) { "Yellow" } else { "Green" }
    Write-Host "    [$tier] $($item.PageName) (score: $($item.Score), mod: $($item.Module))" -ForegroundColor $color
}

$totalBatches = [math]::Ceiling($pending.Count / $Workers)
$estimatedMinutes = [math]::Round(($totalBatches * 90 + ($pending.Count * $DelayMs / 1000)) / 60, 1)

Write-Host ""
Write-Info "$($pending.Count) prompts en $totalBatches batches de $Workers workers"
Write-Info "Tiempo estimado: ~${estimatedMinutes} minutos (asumiendo ~90s por prompt)"
Write-Host ""

if ($DryRun) {
    Write-Warn "MODO DRY RUN - no se ejecutara nada"
    Write-Host ""
    Write-Info "Para ejecutar de verdad:"
    Write-Info "  powershell -File scripts/batch-remediation.ps1 -Workers $Workers"
    exit 0
}

# =============================================================================
# EXECUTE
# =============================================================================
Write-Head "EJECUTANDO"

# Log start
$logContent = "Batch Remediation - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$logContent += "Workers: $Workers | Pending: $($pending.Count) | Delay: ${DelayMs}ms`n"
$logContent += "---`n"

$startTime = Get-Date
$completed = 0
$failed = 0
$jobs = @{}

# Process in batches
for ($i = 0; $i -lt $pending.Count; $i += $Workers) {
    $batch = $pending[$i..([math]::Min($i + $Workers - 1, $pending.Count - 1))]
    $batchIdx = [math]::Floor($i / $Workers) + 1

    Write-Host ""
    Write-Host "  === Batch $batchIdx/$totalBatches ===" -ForegroundColor Cyan

    # Launch workers
    $batchJobs = @()
    foreach ($item in $batch) {
        $promptContent = Get-Content $item.PromptFile -Raw -Encoding UTF8
        $planPath = $item.PlanFile
        $pageName = $item.PageName

        Write-Info "Lanzando: $pageName (score: $($item.Score))"

        # Launch gemini CLI as background job
        $job = Start-Job -ScriptBlock {
            param($Prompt, $OutputPath, $ProjectDir)

            # Set working directory for gemini to have file access
            Set-Location $ProjectDir

            # Pipe prompt to gemini CLI
            $result = $Prompt | & gemini 2>&1

            if ($LASTEXITCODE -eq 0 -or $result) {
                $result | Out-File $OutputPath -Encoding utf8
                return @{ Success = $true; Output = "Plan saved" }
            } else {
                return @{ Success = $false; Output = "gemini exit code: $LASTEXITCODE" }
            }
        } -ArgumentList $promptContent, $planPath, $ProjectRoot

        $batchJobs += @{ Job = $job; Item = $item }

        # Delay between launches
        if ($DelayMs -gt 0) {
            Start-Sleep -Milliseconds $DelayMs
        }
    }

    # Wait for batch to complete
    Write-Info "Esperando batch $batchIdx..."
    $timeout = 300  # 5 min max per batch

    foreach ($bj in $batchJobs) {
        $result = $bj.Job | Wait-Job -Timeout $timeout | Receive-Job
        $item = $bj.Item

        if ($result.Success) {
            $completed++
            Write-OK "$($item.PageName) - Plan generado"
            $logContent += "[OK] $($item.PageName) (score: $($item.Score))`n"
        } else {
            $failed++
            Write-Alert "$($item.PageName) - Error: $($result.Output)"
            $logContent += "[FAIL] $($item.PageName): $($result.Output)`n"
        }

        Remove-Job $bj.Job -Force -ErrorAction SilentlyContinue
    }

    # Delay between batches (rate limiting)
    if ($i + $Workers -lt $pending.Count) {
        Write-Info "Pausa entre batches (${DelayMs}ms)..."
        Start-Sleep -Milliseconds ($DelayMs * 2)
    }
}

# =============================================================================
# REPORT
# =============================================================================
$elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Blue
Write-Host "   RESULTADOS" -ForegroundColor White
Write-Host "  ==========================================" -ForegroundColor Blue
Write-Host ""
Write-OK    "$completed planes generados"
if ($failed -gt 0) {
    Write-Alert "$failed fallidos"
}
Write-Info  "Tiempo total: ${elapsed} minutos"
Write-Info  "Planes en: $PlansDir"
Write-Host ""

# Save log
$logContent += "---`nCompleted: $completed | Failed: $failed | Time: ${elapsed}min`n"
$logContent | Out-File $LogFile -Encoding utf8

# Check for remaining gaps
$allPlans = Get-ChildItem $PlansDir -Filter "*.md" -ErrorAction SilentlyContinue
Write-Info "Total planes disponibles: $($allPlans.Count) / $($queue.Count)"

if ($allPlans.Count -eq $queue.Count) {
    Write-Host ""
    Write-OK "TODOS LOS PLANES GENERADOS"
    Write-Host ""
    Write-Host "  SIGUIENTE PASO:" -ForegroundColor Cyan
    Write-Host "  Antigravity puede ingestar todos los planes y ejecutar" -ForegroundColor DarkGray
    Write-Host "  la pasada coordinada de remediacion." -ForegroundColor DarkGray
}
Write-Host ""
