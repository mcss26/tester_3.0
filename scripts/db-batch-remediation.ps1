# =============================================================================
# DB Batch Remediation Orchestrator v1 - FormulaMid 4
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/db-batch-remediation.ps1
#
# QUE HACE:
# Lee los prompts generados en docs/80-ephemeral/agent-logs/db-remediation/prompts/ y los
# envia a instancias paralelas de Gemini CLI. El output se guarda DIRECTAMENTE
# como migraciones SQL en supabase/migrations/.
# =============================================================================

param(
    [int]$Workers     = 3,
    [int]$DelayMs     = 2000,
    [switch]$DryRun
)

# == Paths ==
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot -or -not (Test-Path $ProjectRoot)) { $ProjectRoot = (Get-Location).Path }

$PromptsDir = Join-Path $ProjectRoot "docs\output\db-remediation\prompts"
$MigrationsDir = Join-Path $ProjectRoot "supabase\migrations"
$LogFile    = Join-Path $ProjectRoot "docs\output\db-remediation\batch-log.txt"

# == Colores ==
function Write-OK    ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info  ($msg) { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
function Write-Alert ($msg) { Write-Host "  [!!] $msg" -ForegroundColor Red }
function Write-Head  ($msg) { Write-Host "`n  $msg" -ForegroundColor Cyan }

Clear-Host
Write-Head "DB BATCH REMEDIATION ORCHESTRATOR v1"

if (-not (Test-Path $PromptsDir)) {
    Write-Alert "No existe $PromptsDir. Ejecuta el prompt del Orquestador primero."
    exit 1
}

if (-not (Test-Path $MigrationsDir)) {
    New-Item -Path $MigrationsDir -ItemType Directory -Force | Out-Null
}

$promptFiles = Get-ChildItem $PromptsDir -Filter "*.md" | Sort-Object Name
Write-OK "$($promptFiles.Count) tareas de base de datos en cola."

if ($DryRun) { exit 0 }

# =============================================================================
# EXECUTE
# =============================================================================
$timestamp_prefix = Get-Date -Format 'yyyyMMddHHmmss'
$completed = 0
$failed = 0

for ($i = 0; $i -lt $promptFiles.Count; $i += $Workers) {
    $batch = $promptFiles[$i..([math]::Min($i + $Workers - 1, $promptFiles.Count - 1))]
    $batchJobs = @()

    foreach ($file in $batch) {
        $promptContent = Get-Content $file.FullName -Raw -Encoding UTF8
        # Format name: 20260216183000_01-vw-night-snapshot.sql
        $sqlFileName = "${timestamp_prefix}_$($file.BaseName).sql"
        $sqlFilePath = Join-Path $MigrationsDir $sqlFileName

        Write-Info "Lanzando Worker para: $($file.Name)"

        $job = Start-Job -ScriptBlock {
            param($Prompt, $OutputPath, $ProjectDir)
            Set-Location $ProjectDir
            
            # Pipe prompt to CLI. Assumes CLI returns raw text.
            $result = $Prompt | & gemini 2>&1

            if ($LASTEXITCODE -eq 0 -or $result) {
                # Clean potential markdown code blocks if the AI disobeys
                $cleanResult = $result -replace '(?ms)^```sql\s*', '' -replace '(?ms)\s*```$', ''
                $cleanResult | Out-File $OutputPath -Encoding utf8
                return @{ Success = $true; Output = "SQL guardado" }
            } else {
                return @{ Success = $false; Output = "Error CLI: $LASTEXITCODE" }
            }
        } -ArgumentList $promptContent, $sqlFilePath, $ProjectRoot

        $batchJobs += @{ Job = $job; Item = $file }
        Start-Sleep -Milliseconds $DelayMs
    }

    foreach ($bj in $batchJobs) {
        $result = $bj.Job | Wait-Job -Timeout 120 | Receive-Job
        if ($result.Success) {
            $completed++
            Write-OK "$($bj.Item.BaseName) -> MigraciÃ³n SQL generada."
        } else {
            $failed++
            Write-Alert "$($bj.Item.BaseName) -> FallÃ³: $($result.Output)"
        }
        Remove-Job $bj.Job -Force -ErrorAction SilentlyContinue
    }
}

Write-Head "RESUMEN DE BATCH"
Write-OK "$completed migraciones generadas en supabase/migrations/"
if ($failed -gt 0) { Write-Alert "$failed tareas fallidas." }
Write-Info "Siguiente Paso: Revisa el SQL generado y ejecuta 'supabase db push' o aplÃ­calos en tu consola."
Write-Host ""
