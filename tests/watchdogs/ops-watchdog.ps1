# =============================================================================
# Operations Watchdog - FormulaMid 4 (Torre de Control)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/ops-watchdog.ps1
#
# QUE HACE ESTE SCRIPT:
# 
# Es como tener un tablero de mandos de tu proyecto. Cada 90 segundos
# te muestra que esta pasando: que archivos se tocaron, si los agentes
# documentaron lo que hicieron, cuanto llevas sin pushear, y la salud
# general del proyecto.
#
# Pensalo como el panel de control de un aeropuerto: no hace nada,
# solo te muestra lo que necesitas saber para tomar buenas decisiones.
# =============================================================================

param(
    [int]$IntervalSeconds = 90
)

$ProjectRoot = "C:\Users\siste\Documents\GitHub\tester_3.0"
$OutputDir   = Join-Path $ProjectRoot "docs\output"
$ModulesDir  = Join-Path $ProjectRoot "docs\modules"
$PagesDir    = Join-Path $ProjectRoot "pages"
$AgentsDir   = Join-Path $ProjectRoot ".agent\agents"

$checkCount  = 0
$sessionStart = Get-Date

# â”€â”€ Colores â”€â”€
function Write-OK   ($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info ($msg) { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
function Write-Warn ($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Alert($msg) { Write-Host "  [!!] $msg" -ForegroundColor Red }
function Write-Head ($msg) { Write-Host "`n  $msg" -ForegroundColor Cyan }

Clear-Host
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host "   OPS WATCHDOG - Torre de Control" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Que hace: monitorea la actividad de tu proyecto" -ForegroundColor DarkGray
Write-Host "  cada $IntervalSeconds segundos. Te muestra:" -ForegroundColor DarkGray
Write-Host "    1. Archivos modificados recientemente" -ForegroundColor DarkGray
Write-Host "    2. Documentacion de agentes (docs/80-ephemeral/agent-logs/)" -ForegroundColor DarkGray
Write-Host "    3. Estado de git (sin commitear, sin pushear)" -ForegroundColor DarkGray
Write-Host "    4. Cobertura documental (paginas vs docs)" -ForegroundColor DarkGray
Write-Host "    5. Recordatorio para agentes nuevos" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Codigos:" -ForegroundColor DarkGray
Write-Host "    [OK]  = Todo en orden" -ForegroundColor Green
Write-Host "    [!]   = Algo que atender cuando puedas" -ForegroundColor Yellow
Write-Host "    [!!]  = Necesita atencion ahora" -ForegroundColor Red
Write-Host ""
Write-Host "  Ctrl+C para detener" -ForegroundColor DarkGray
Write-Host ""

while ($true) {
    $checkCount++
    $elapsed = [math]::Round(((Get-Date) - $sessionStart).TotalMinutes, 0)
    $time = Get-Date -Format "HH:mm:ss"

    Write-Host "=== Check #$checkCount @ $time (sesion: $elapsed min) ===" -ForegroundColor White

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # 1. ACTIVIDAD RECIENTE
    # Que archivos de codigo se tocaron en los ultimos minutos?
    # Esto te dice que estuvo haciendo el agente (o vos).
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Write-Head "1. ACTIVIDAD RECIENTE (ultimos 30 min)"
    Write-Info "Archivos de codigo modificados recientemente"

    $cutoff = (Get-Date).AddMinutes(-30)
    $recentFiles = @(Get-ChildItem $ProjectRoot -Recurse -File -Include "*.js","*.css","*.html","*.md","*.ps1" -EA SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt $cutoff -and $_.FullName -notmatch 'node_modules|\.git\\|scripts\\logs' } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 8)

    if ($recentFiles.Count -gt 0) {
        foreach ($f in $recentFiles) {
            $rel = $f.FullName.Replace("$ProjectRoot\", "")
            $ago = [math]::Round(((Get-Date) - $f.LastWriteTime).TotalMinutes, 0)
            $ext = $f.Extension
            $icon = switch ($ext) {
                ".js"   { "JS " }
                ".css"  { "CSS" }
                ".html" { "HTM" }
                ".md"   { "DOC" }
                ".ps1"  { "SCR" }
                default { "   " }
            }
            Write-Host "       [$icon] $rel (hace $ago min)" -ForegroundColor DarkCyan
        }
    } else {
        Write-OK "Sin actividad reciente en los ultimos 30 min"
    }

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # 2. DOCUMENTACION DE AGENTES
    # Los agentes dejaron documentacion en docs/80-ephemeral/agent-logs/?
    # Si hay archivos recientes = estan documentando.
    # Si no hay nada = alguien no esta siguiendo las reglas.
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Write-Head "2. DOCUMENTACION DE AGENTES (docs/80-ephemeral/agent-logs/)"
    Write-Info "Verifico si los agentes estan documentando su trabajo"

    $agentFolders = @("frontend", "logic", "data", "qa", "product", "orchestrator")
    $totalDocs = 0
    $todayDocs = 0
    $today = Get-Date -Format "yyyy-MM-dd"

    foreach ($agent in $agentFolders) {
        $folder = Join-Path $OutputDir $agent
        if (Test-Path $folder) {
            $docs = @(Get-ChildItem $folder -File -Filter "*.md" -EA SilentlyContinue | Where-Object { $_.Name -ne ".gitkeep" })
            $todayAgentDocs = @($docs | Where-Object { $_.Name -like "$today*" })
            $totalDocs += $docs.Count

            if ($todayAgentDocs.Count -gt 0) {
                $todayDocs += $todayAgentDocs.Count
                foreach ($d in $todayAgentDocs) {
                    Write-Host "       [+] $agent/ $($d.Name)" -ForegroundColor Green
                }
            } elseif ($docs.Count -gt 0) {
                $last = ($docs | Sort-Object LastWriteTime -Descending | Select-Object -First 1).Name
                Write-Host "       [-] $agent/ ultimo: $last" -ForegroundColor DarkGray
            } else {
                Write-Host "       [ ] $agent/ (vacio)" -ForegroundColor DarkGray
            }
        }
    }

    if ($recentFiles.Count -gt 3 -and $todayDocs -eq 0) {
        Write-Warn "Hay $($recentFiles.Count) archivos modificados pero 0 docs hoy"
        Write-Host "       Recordale al agente: 'Documenta en docs/80-ephemeral/agent-logs/{tu_agente}/'" -ForegroundColor Yellow
    } elseif ($todayDocs -gt 0) {
        Write-OK "$todayDocs docs nuevos hoy, $totalDocs total"
    } else {
        Write-Info "$totalDocs docs total, ninguno nuevo hoy"
    }

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # 3. ESTADO DE GIT
    # Cuantos archivos tenes sin commitear? Hace cuanto fue el
    # ultimo push? Si tenes muchos cambios sin subir, estas en riesgo
    # de perder trabajo.
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Write-Head "3. ESTADO DE GIT"
    Write-Info "Archivos sin commitear y tiempo desde ultimo push"

    $uncommitted = @(git -C $ProjectRoot status --short 2>$null)
    $lastCommit = git -C $ProjectRoot log -1 --format="%ar|%s" 2>$null
    $unpushed = @(git -C $ProjectRoot log origin/main..HEAD --oneline 2>$null)

    if ($lastCommit) {
        $parts = $lastCommit -split '\|', 2
        Write-Host "       Ultimo commit: $($parts[0]) - `"$($parts[1])`"" -ForegroundColor DarkCyan
    }

    if ($uncommitted.Count -eq 0) {
        Write-OK "Todo commiteado"
    } elseif ($uncommitted.Count -le 5) {
        Write-Info "$($uncommitted.Count) archivos sin commitear"
    } elseif ($uncommitted.Count -le 20) {
        Write-Warn "$($uncommitted.Count) archivos sin commitear - considera hacer commit pronto"
    } else {
        Write-Alert "$($uncommitted.Count) archivos sin commitear!"
        Write-Host "       Hace: git add -A; git commit -m 'tu mensaje'; git push" -ForegroundColor Yellow
    }

    if ($unpushed.Count -gt 0) {
        Write-Warn "$($unpushed.Count) commits sin pushear a GitHub"
        Write-Host "       Hace: git push origin main" -ForegroundColor Yellow
    } else {
        Write-OK "Sincronizado con GitHub"
    }

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # 4. COBERTURA DOCUMENTAL
    # Cada pagina HTML deberia tener su doc en docs/modules/.
    # Si hay paginas sin doc, falta documentacion.
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Write-Head "4. COBERTURA DOCUMENTAL"
    Write-Info "Paginas HTML vs documentacion en docs/modules/"

    $htmlPages = @(Get-ChildItem $PagesDir -Recurse -File -Filter "*.html" -EA SilentlyContinue |
        Where-Object { $_.Name -notmatch 'test|demo|sandbox|preview' })
    $moduleDocs = @(Get-ChildItem $ModulesDir -Recurse -File -Filter "*.md" -EA SilentlyContinue |
        Where-Object { $_.Name -ne "_template.md" -and $_.Name -ne "README.md" })

    $coverage = if ($htmlPages.Count -gt 0) { [math]::Round(($moduleDocs.Count / $htmlPages.Count) * 100, 0) } else { 0 }

    if ($coverage -ge 80) {
        Write-OK "$($moduleDocs.Count) docs / $($htmlPages.Count) paginas ($coverage% cobertura)"
    } elseif ($coverage -ge 50) {
        Write-Warn "$($moduleDocs.Count) docs / $($htmlPages.Count) paginas ($coverage% cobertura)"
        Write-Host "       Faltan docs para algunas paginas" -ForegroundColor Yellow
    } else {
        Write-Alert "$($moduleDocs.Count) docs / $($htmlPages.Count) paginas ($coverage% cobertura)"
        Write-Host "       Muchas paginas sin documentar!" -ForegroundColor Yellow
    }

    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # 5. RECORDATORIO PARA AGENTES
    # Un texto listo para copiar y pegar al agente nuevo para
    # darle contexto rapido sin tener que explicar todo.
    # â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Write-Head "5. COPIAR Y PEGAR AL AGENTE NUEVO"
    Write-Info "Si empezas una conversacion nueva, pegale esto:"

    $latestDocs = @(Get-ChildItem $OutputDir -Recurse -File -Filter "*.md" -EA SilentlyContinue |
        Where-Object { $_.Name -ne "README.md" -and $_.Name -ne ".gitkeep" } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 3)

    $docList = if ($latestDocs.Count -gt 0) {
        ($latestDocs | ForEach-Object {
            $rel = $_.FullName.Replace("$ProjectRoot\", "").Replace("\", "/")
            "  - $rel"
        }) -join "`n"
    } else { "  (sin docs recientes)" }

    Write-Host ""
    Write-Host "  +---------------------------------------------+" -ForegroundColor DarkMagenta
    Write-Host "  | Lee AGENT.md y docs/estado-presente.md.     |" -ForegroundColor White
    Write-Host "  | Ultimos docs de contexto:                   |" -ForegroundColor White
    foreach ($d in $latestDocs) {
        $rel = $d.FullName.Replace("$ProjectRoot\", "").Replace("\", "/")
        $padded = $rel.PadRight(43)
        Write-Host "  |  $padded|" -ForegroundColor DarkCyan
    }
    Write-Host "  | Documenta tu trabajo en docs/80-ephemeral/agent-logs/.       |" -ForegroundColor White
    Write-Host "  +---------------------------------------------+" -ForegroundColor DarkMagenta
    Write-Host ""

    # â”€â”€ RESULTADO â”€â”€
    $statusColor = "Green"
    $statusMsg = "PROYECTO EN ORDEN"
    if ($uncommitted.Count -gt 20 -or ($recentFiles.Count -gt 3 -and $todayDocs -eq 0)) {
        $statusColor = "Yellow"
        $statusMsg = "ATENCION: ver items marcados con [!]"
    }
    if ($uncommitted.Count -gt 50 -or $unpushed.Count -gt 5) {
        $statusColor = "Red"
        $statusMsg = "ACCION NECESARIA: ver items marcados con [!!]"
    }

    Write-Host "  RESULTADO: $statusMsg" -ForegroundColor $statusColor
    Write-Host "  Proximo check en $IntervalSeconds segundos..." -ForegroundColor DarkGray
    Write-Host ""

    Start-Sleep -Seconds $IntervalSeconds
}
