<#
.SYNOPSIS
  Workdays Progressive Verifier v2 - FormulaMid 4
.DESCRIPTION
  8-phase progressive scanner: Baseline, Deep JS, Deep HTML, Deep CSS,
  Cross-Module, Supabase Health, UX Patterns, Summary+Delta.
  JSON state persistence for crash recovery. Weighted scoring.
.EXAMPLE
  pwsh scripts/workdays-verifier.ps1                   # one-shot (8 fases)
  pwsh scripts/workdays-verifier.ps1 -Watch             # 1 fase/ciclo
  pwsh scripts/workdays-verifier.ps1 -Watch -FullScan   # 8 fases/ciclo
  pwsh scripts/workdays-verifier.ps1 -Reset             # limpiar estado
#>

param(
    [switch]$Watch,
    [switch]$FullScan,
    [int]$IntervalSeconds = 60,
    [switch]$Reset,
    [switch]$Verbose
)

# -- Paths (relative to script) -----------------------------------------------
$ProjectRoot = Split-Path $PSScriptRoot -Parent

$HtmlFile    = Join-Path $ProjectRoot "pages\admin\admin-workdays.html"
$JsFile      = Join-Path $ProjectRoot "assets\js\modules\admin\admin-workdays.js"
$CssFile     = Join-Path $ProjectRoot "assets\css\admin-workdays.css"
$SchemeFile  = Join-Path $ProjectRoot "docs\scheme.md"
$OutputDir   = Join-Path $ProjectRoot "docs\output\qa"
$ReportFile  = Join-Path $OutputDir "workdays-progressive.md"
$StateFile   = Join-Path $OutputDir ".verifier-state.json"
$HistoryFile = Join-Path $OutputDir ".verifier-history.jsonl"

# -- Constants -----------------------------------------------------------------
$MaxPhases  = 8
$PhaseNames = @("baseline","deepJS","deepHTML","deepCSS","crossModule","supabase","uxPatterns","summary")
$PhaseTitles = @(
    "Baseline (Files, Cross-Ref, Sprints)",
    "Deep JS (Dead Code, Queries, Complexity)",
    "Deep HTML (Forms, Aria, Empty States)",
    "Deep CSS (Unused Classes, Responsive)",
    "Cross-Module (Data Flow, Dependencies)",
    "Supabase Health (Queries, Error Handling)",
    "UX Patterns (Loading, Errors, Confirms)",
    "Summary + Delta Detection"
)

$Weights = @{
    alert = 10; warn = 3; info = 0
    baseline = 2.0; deepJS = 1.5; deepHTML = 1.0; deepCSS = 0.5
    crossModule = 1.8; supabase = 1.5; uxPatterns = 1.0; summary = 0.0
}

# -- Output functions ----------------------------------------------------------
function Write-OK    ($msg) { Write-Host "  [OK]  $msg" -ForegroundColor Green }
function Write-Info  ($msg) { Write-Host "  [i]   $msg" -ForegroundColor DarkGray }
function Write-Warn  ($msg) { Write-Host "  [!]   $msg" -ForegroundColor Yellow }
function Write-Alert ($msg) { Write-Host "  [!!]  $msg" -ForegroundColor Red }
function Write-Head  ($msg) { Write-Host "`n  $msg" -ForegroundColor Cyan }
function Write-Phase ($num, $title) {
    Write-Host ""
    Write-Host "  +-- FASE $num -------------------------------------------" -ForegroundColor Magenta
    Write-Host "  |   $title" -ForegroundColor White
    Write-Host "  +--------------------------------------------------------" -ForegroundColor Magenta
}

# -- State Management ----------------------------------------------------------
function New-BlankState {
    $f = @{}
    foreach ($pn in $PhaseNames) { $f[$pn] = [System.Collections.ArrayList]@() }
    @{
        version        = 2
        lastPhase      = -1
        lastRound      = 0
        lastTimestamp   = $null
        sessionId      = (Get-Date -Format "yyyyMMdd-HHmmss")
        scores         = @{}
        findings       = $f
        history        = [System.Collections.ArrayList]@()
        checksums      = @{}
        phaseTimestamps = @{}
    }
}

function Convert-PSObjToHash($obj) {
    if ($null -eq $obj) { return $null }
    if ($obj -is [System.Management.Automation.PSCustomObject]) {
        $h = @{}
        foreach ($p in $obj.PSObject.Properties) { $h[$p.Name] = Convert-PSObjToHash $p.Value }
        return $h
    }
    if ($obj -is [System.Object[]]) {
        $list = [System.Collections.ArrayList]@()
        foreach ($item in $obj) { $list.Add((Convert-PSObjToHash $item)) | Out-Null }
        return $list
    }
    return $obj
}

function Load-State {
    if ($Reset) { return New-BlankState }
    if (-not (Test-Path $StateFile)) { return New-BlankState }
    try {
        $raw = Get-Content $StateFile -Raw -Encoding UTF8
        $psObj = $raw | ConvertFrom-Json -ErrorAction Stop
        $loaded = Convert-PSObjToHash $psObj
        if ($loaded.version -eq 2) {
            foreach ($pn in $PhaseNames) {
                if (-not $loaded.findings.ContainsKey($pn)) {
                    $loaded.findings[$pn] = [System.Collections.ArrayList]@()
                }
                # Ensure findings are ArrayList
                if ($loaded.findings[$pn] -isnot [System.Collections.ArrayList]) {
                    $temp = [System.Collections.ArrayList]@()
                    if ($loaded.findings[$pn]) {
                        if ($loaded.findings[$pn] -is [hashtable]) { $temp.Add($loaded.findings[$pn]) | Out-Null }
                        else { foreach ($it in $loaded.findings[$pn]) { $temp.Add($it) | Out-Null } }
                    }
                    $loaded.findings[$pn] = $temp
                }
            }
            if ($loaded.history -isnot [System.Collections.ArrayList]) {
                $temp = [System.Collections.ArrayList]@()
                if ($loaded.history) { foreach ($h in $loaded.history) { $temp.Add($h) | Out-Null } }
                $loaded.history = $temp
            }
            return $loaded
        }
    } catch {
        Write-Warn "State file corrupto, empezando de cero: $($_.Exception.Message)"
    }
    return New-BlankState
}

function Save-State {
    param($st)
    if (-not (Test-Path $OutputDir)) { New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null }
    $st.lastTimestamp = (Get-Date -Format "o")
    $st | ConvertTo-Json -Depth 10 | Set-Content $StateFile -Encoding UTF8 -Force
}

function Get-FileChecksums {
    $cs = @{}
    foreach ($f in @($HtmlFile, $JsFile, $CssFile)) {
        if (Test-Path $f) {
            $cs[(Split-Path $f -Leaf)] = (Get-FileHash $f -Algorithm SHA256).Hash.Substring(0, 16)
        }
    }
    $cs
}

# -- Findings ------------------------------------------------------------------
function Add-Finding {
    param([string]$Phase, [string]$Level, [string]$Msg, [int]$Weight = 0)
    if ($Weight -eq 0) { $Weight = $Weights[$Level] }

    switch ($Level) {
        "ok"    { Write-OK $Msg }
        "warn"  { Write-Warn $Msg }
        "alert" { Write-Alert $Msg }
        default { Write-Info $Msg }
    }

    if ($Level -eq "ok") { return }

    $id    = "$Phase-$($Msg.GetHashCode())"
    $round = "R$($script:state.lastRound)"

    $existing = $script:state.findings[$Phase] | Where-Object { $_.id -eq $id }
    if ($existing) { $existing.lastSeen = $round; return }

    $script:state.findings[$Phase].Add(@{
        id = $id; level = $Level; msg = $Msg; weight = $Weight
        firstSeen = $round; lastSeen = $round
    }) | Out-Null
}

function Calculate-PhaseScore($phaseName) {
    $penalty = 0
    $mult = if ($Weights.ContainsKey($phaseName)) { $Weights[$phaseName] } else { 1.0 }
    foreach ($f in $script:state.findings[$phaseName]) { $penalty += $f.weight * $mult }
    [Math]::Max(0, [Math]::Min(100, [int](100 - $penalty)))
}

function Calculate-OverallScore {
    $total = 0; $cnt = 0
    foreach ($pn in $PhaseNames) {
        if ($script:state.scores.ContainsKey($pn) -and $null -ne $script:state.scores[$pn]) {
            $total += $script:state.scores[$pn]; $cnt++
        }
    }
    if ($cnt -eq 0) { return $null }
    [Math]::Round($total / $cnt, 0)
}

function Get-ScoreTag($score) {
    if ($null -eq $score) { return "[...]" }
    if ($score -ge 90) { return "[OK]" }
    if ($score -ge 70) { return "[WARN]" }
    if ($score -ge 50) { return "[LOW]" }
    return "[CRIT]"
}

# -- Helpers -------------------------------------------------------------------
function Get-Context($content, $charIndex, $radius) {
    $s = [Math]::Max(0, $charIndex - $radius)
    $e = [Math]::Min($content.Length, $charIndex + $radius)
    $content.Substring($s, $e - $s)
}

# ==============================================================================
# PHASE 0: BASELINE
# ==============================================================================
function Check-Baseline {
    $pn = "baseline"

    # Files
    foreach ($f in @(@{P=$HtmlFile;N="HTML"},@{P=$JsFile;N="JS"},@{P=$CssFile;N="CSS"})) {
        if (Test-Path $f.P) {
            $sz = [math]::Round((Get-Item $f.P).Length/1024,1)
            $ln = (Get-Content $f.P).Count
            Add-Finding $pn "ok" "$($f.N): $ln lineas, ${sz}KB"
        } else {
            Add-Finding $pn "alert" "$($f.N) NO ENCONTRADO" 15
        }
    }

    if (-not (Test-Path $HtmlFile) -or -not (Test-Path $JsFile)) { return }
    $html = Get-Content $HtmlFile -Raw
    $js   = Get-Content $JsFile -Raw
    $css  = if (Test-Path $CssFile) { Get-Content $CssFile -Raw } else { "" }

    # Cross-ref HTML<->JS
    $htmlIds = @([regex]::Matches($html, 'id="([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
    $jsIds   = @([regex]::Matches($js, "getElementById\(['\`"]([^'\`"]+)['\`"]\)") |
                 ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
    $orphans = @($jsIds | Where-Object {
        if ($htmlIds -contains $_) { return $false }
        # Exclude IDs with null-checks (graceful degradation)
        $idPattern = 'getElementById\([''"]' + [regex]::Escape($_) + '[''"]'
        $match = [regex]::Match($js, $idPattern)
        if ($match.Success) {
            $after = $js.Substring($match.Index, [Math]::Min(200, $js.Length - $match.Index))
            if ($after -match 'if\s*\(\w+\)') { return $false }
        }
        return $true
    })
    if ($orphans.Count -gt 0) {
        $sample = ($orphans | Select-Object -First 5) -join ', '
        Add-Finding $pn "warn" "$($orphans.Count) IDs huerfanos en JS: $sample" 3
    } else {
        Add-Finding $pn "ok" "Todos los IDs de JS ($($jsIds.Count)) existen en HTML"
    }
    Add-Finding $pn "info" "HTML: $(@($htmlIds | Sort-Object -Unique).Count) IDs | JS: $($jsIds.Count) refs"

    # State machine
    foreach ($st in @("DRAFT","PLANNED","ACTIVE","CLOSED","CANCELLED")) {
        $cnt = ([regex]::Matches($js, "'$st'|`"$st`"")).Count
        if ($cnt -eq 0) { Add-Finding $pn "warn" "Estado '$st' no referenciado en JS" 2 }
    }

    # DB scheme
    if (Test-Path $SchemeFile) {
        $scheme = Get-Content $SchemeFile -Raw
        foreach ($v in @("vw_night_snapshot","vw_bar_audit_variance","vw_fiscal_summary")) {
            if ($scheme -notmatch $v) { Add-Finding $pn "alert" "$v NO documentada en scheme.md" 10 }
        }
    }

    # RPCs
    foreach ($rpc in @("rpc_open_work_day","rpc_close_work_day")) {
        if ($js -notmatch $rpc) { Add-Finding $pn "warn" "$rpc no referenciado en JS" 3 }
    }

    # Sprint progress
    $sprints = @{
        "S4" = @(
            @{N="Template selector";  C=($html -match "select-template|templateModal")}
            @{N="Break-even card";    C=($html -match "breakeven-card|wd-breakeven")}
            @{N="Break-even JS";      C=($js -match "updateBreakEvenCard|breakEven")}
            @{N="Benchmarks";         C=($js -match "vw_workday_benchmarks|loadBenchmarks")}
            @{N="Template save/load"; C=($js -match "handleSaveTemplate|loadTemplates")}
            @{N="Benchmark pills";    C=($html -match "benchmark-pills|wd-benchmark-pill")}
        )
        "S5" = @(
            @{N="Health score";       C=($js -match "health_score|healthScore")}
            @{N="Net result";         C=($js -match "net_result|netResult")}
            @{N="P&L view";           C=($js -match "vw_workday_pnl")}
            @{N="LIVE indicator";     C=($html -match "live-dot|live-chip")}
        )
    }
    $totalDone = 0; $totalItems = 0
    foreach ($sk in @("S4","S5")) {
        $items = $sprints[$sk]; $done = @($items | Where-Object { $_.C }).Count
        $totalDone += $done; $totalItems += $items.Count
        $tag = if ($done -eq $items.Count) { "DONE" } else { "WIP" }
        Add-Finding $pn "info" "$sk [$tag] $done/$($items.Count)"
    }
    $pct = if ($totalItems -gt 0) { [math]::Round(($totalDone/$totalItems)*100,0) } else { 0 }
    Add-Finding $pn "info" "Sprints: $totalDone/$totalItems ($pct%)"
}

# ==============================================================================
# PHASE 1: DEEP JS
# ==============================================================================
function Check-DeepJS {
    $pn = "deepJS"
    if (-not (Test-Path $JsFile)) { Add-Finding $pn "alert" "JS no encontrado"; return }
    $js = Get-Content $JsFile -Raw

    # Functions declared but never called
    $declared = [regex]::Matches($js, '(?:function\s+(\w+)\s*\(|const\s+(\w+)\s*=\s*(?:async\s*)?\()')
    $fnNames = @($declared | ForEach-Object {
        if ($_.Groups[1].Value) { $_.Groups[1].Value } else { $_.Groups[2].Value }
    } | Where-Object { $_ -and $_.Length -gt 2 })

    $uncalled = @()
    foreach ($fn in $fnNames) {
        $refs = ([regex]::Matches($js, "\b$fn\b")).Count
        if ($refs -le 1) { $uncalled += $fn }
    }
    if ($uncalled.Count -gt 0) {
        $sample = ($uncalled | Select-Object -First 5) -join ', '
        Add-Finding $pn "warn" "$($uncalled.Count) funciones sin caller: $sample" 3
    } else {
        Add-Finding $pn "ok" "Todas las funciones tienen al menos 1 caller"
    }
    Add-Finding $pn "info" "$($fnNames.Count) funciones declaradas"

    # Supabase queries without error handling
    $fromCalls = [regex]::Matches($js, "\.from\(['\`"](\w+)['\`"]\)")
    $noErr = 0
    foreach ($q in $fromCalls) {
        $ctx = Get-Context $js $q.Index 2000
        if ($ctx -notmatch 'catch|\.catch|try\s*\{|if\s*\(error\)|throw\s+error|\.error') { $noErr++ }
    }
    if ($noErr -gt 0) {
        Add-Finding $pn "warn" "$noErr queries .from() sin error handling" 5
    } else {
        Add-Finding $pn "ok" "Todas las queries tienen error handling"
    }
    Add-Finding $pn "info" "$($fromCalls.Count) queries Supabase totales"

    # Console.log count
    $consoleLogs = ([regex]::Matches($js, 'console\.log\(')).Count
    if ($consoleLogs -gt 10) {
        Add-Finding $pn "warn" "$consoleLogs console.log residuales" 2
    } elseif ($consoleLogs -gt 0) {
        Add-Finding $pn "info" "$consoleLogs console.log"
    }

    # Await count
    $awaitCount = ([regex]::Matches($js, '\bawait\b')).Count
    Add-Finding $pn "info" "$awaitCount operaciones async (await)"
}

# ==============================================================================
# PHASE 2: DEEP HTML
# ==============================================================================
function Check-DeepHTML {
    $pn = "deepHTML"
    if (-not (Test-Path $HtmlFile)) { Add-Finding $pn "alert" "HTML no encontrado"; return }
    $html = Get-Content $HtmlFile -Raw

    # Inputs without label
    $inputs = [regex]::Matches($html, '<input[^>]+id="([^"]+)"[^>]*>')
    $noLabel = 0
    foreach ($inp in $inputs) {
        $id = $inp.Groups[1].Value
        if ($html -notmatch "for=['\`"]$id['\`"]" -and $inp.Value -notmatch 'aria-label') { $noLabel++ }
    }
    if ($noLabel -gt 0) {
        Add-Finding $pn "warn" "$noLabel inputs sin label/aria-label" 2
    } else {
        Add-Finding $pn "ok" "Todos los inputs tienen label o aria-label"
    }
    Add-Finding $pn "info" "$($inputs.Count) inputs totales"

    # Buttons without type
    $buttons = [regex]::Matches($html, '<button[^>]*>')
    $noType = @($buttons | Where-Object { $_.Value -notmatch 'type=' }).Count
    if ($noType -gt 0) { Add-Finding $pn "warn" "$noType botones sin type explicito" 2 }
    Add-Finding $pn "info" "$($buttons.Count) botones totales"

    # Modals without role=dialog (only modal-overlay = actual dialogs)
    $modals = [regex]::Matches($html, 'class="[^"]*modal-overlay[^"]*"')
    $noRole = @($modals | Where-Object {
        $ctx = Get-Context $html $_.Index 200
        $ctx -notmatch 'role="dialog"'
    }).Count
    if ($noRole -gt 0) { Add-Finding $pn "warn" "$noRole modals sin role=dialog" 2 }

    # Links with href="#"
    $hashLinks = ([regex]::Matches($html, 'href="#"')).Count
    if ($hashLinks -gt 3) { Add-Finding $pn "warn" "$hashLinks links con href='#'" 2 }

    $selects = ([regex]::Matches($html, '<select')).Count
    $forms   = ([regex]::Matches($html, '<form')).Count
    Add-Finding $pn "info" "$selects selects, $forms forms, $($modals.Count) modals"
}

# ==============================================================================
# PHASE 3: DEEP CSS
# ==============================================================================
function Check-DeepCSS {
    $pn = "deepCSS"
    if (-not (Test-Path $CssFile)) { Add-Finding $pn "alert" "CSS no encontrado"; return }
    $css  = Get-Content $CssFile -Raw
    $html = if (Test-Path $HtmlFile) { Get-Content $HtmlFile -Raw } else { "" }
    $js   = if (Test-Path $JsFile ) { Get-Content $JsFile -Raw  } else { "" }

    # CSS classes
    $cssClasses = @([regex]::Matches($css, '\.([a-zA-Z][\w-]+)\s*[{,:\s]') |
                    ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
    $orphanCss = @($cssClasses | Where-Object { $html -notmatch $_ -and $js -notmatch $_ })
    if ($orphanCss.Count -gt 5) {
        Add-Finding $pn "info" "$($orphanCss.Count) clases CSS sin referencia en HTML/JS"
    }
    Add-Finding $pn "info" "$($cssClasses.Count) clases CSS totales"

    # Responsive breakpoints
    $breakpoints = @(480, 768, 1024, 1280)
    $missing = @($breakpoints | Where-Object { $css -notmatch "${_}px" })
    if ($missing.Count -gt 0) {
        Add-Finding $pn "warn" "Breakpoints faltantes: $($missing -join ', ')px" 2
    } else {
        Add-Finding $pn "ok" "4 breakpoints cubiertos (480, 768, 1024, 1280)"
    }

    # !important
    $importantCount = ([regex]::Matches($css, '!important')).Count
    if ($importantCount -gt 10) {
        Add-Finding $pn "warn" "$importantCount usos de !important" 2
    } else {
        Add-Finding $pn "ok" "$importantCount !important (aceptable)"
    }

    # CSS custom properties
    $vars = @([regex]::Matches($css, '--[\w-]+') | ForEach-Object { $_.Value } | Sort-Object -Unique)
    Add-Finding $pn "info" "$($vars.Count) CSS custom properties"

    # z-index
    $zIndexes = @([regex]::Matches($css, 'z-index:\s*(\d+)') |
                  ForEach-Object { [int]$_.Groups[1].Value } | Sort-Object -Unique)
    if ($zIndexes.Count -gt 0) { Add-Finding $pn "info" "z-index: $($zIndexes -join ', ')" }
}

# ==============================================================================
# PHASE 4: CROSS-MODULE
# ==============================================================================
function Check-CrossModule {
    $pn = "crossModule"
    $adminDir = Join-Path $ProjectRoot "assets\js\modules\admin"
    if (-not (Test-Path $adminDir)) { Add-Finding $pn "alert" "Dir admin no encontrado"; return }

    $modules = Get-ChildItem $adminDir -Filter "*.js" -ErrorAction SilentlyContinue
    Add-Finding $pn "info" "$($modules.Count) modulos admin encontrados"

    $tableOps = @{}
    foreach ($mod in $modules) {
        $code = Get-Content $mod.FullName -Raw
        $modName = $mod.BaseName

        $reads  = [regex]::Matches($code, "\.from\(['\`"](\w+)['\`"]\)\.select") |
                  ForEach-Object { $_.Groups[1].Value }
        $writes = [regex]::Matches($code, "\.from\(['\`"](\w+)['\`"]\)\.(insert|update|upsert|delete)") |
                  ForEach-Object { $_.Groups[1].Value }

        foreach ($t in $reads) {
            if (-not $tableOps.ContainsKey($t)) { $tableOps[$t] = @{readers=@();writers=@()} }
            $tableOps[$t].readers += $modName
        }
        foreach ($t in $writes) {
            if (-not $tableOps.ContainsKey($t)) { $tableOps[$t] = @{readers=@();writers=@()} }
            $tableOps[$t].writers += $modName
        }
    }

    # Tables that are "written" here but read through views don't need direct reads
    $viewBacked = @('work_days','revenue_details','qr_batches','finance_weekly_closings','work_day_templates')
    $writeOnly = @($tableOps.Keys | Where-Object {
        $tableOps[$_].writers.Count -gt 0 -and $tableOps[$_].readers.Count -eq 0 -and
        $viewBacked -notcontains $_
    })
    foreach ($t in $writeOnly) {
        Add-Finding $pn "warn" "Tabla '$t': se escribe pero nunca se lee desde admin" 3
    }

    $readOnly = @($tableOps.Keys | Where-Object { $tableOps[$_].readers.Count -gt 0 -and $tableOps[$_].writers.Count -eq 0 })
    if ($readOnly.Count -gt 0) {
        $sample = ($readOnly | Select-Object -First 5) -join ', '
        Add-Finding $pn "info" "$($readOnly.Count) tablas read-only: $sample"
    }

    Add-Finding $pn "info" "$($tableOps.Keys.Count) tablas Supabase en $($modules.Count) modulos"

    # work_days cross-refs
    $wdMods = @($modules | Where-Object { (Get-Content $_.FullName -Raw) -match "work_days|work_day" })
    Add-Finding $pn "info" "$($wdMods.Count) modulos tocan work_days"
}

# ==============================================================================
# PHASE 5: SUPABASE HEALTH
# ==============================================================================
function Check-SupabaseHealth {
    $pn = "supabase"
    if (-not (Test-Path $JsFile)) { Add-Finding $pn "alert" "JS no encontrado"; return }
    $js = Get-Content $JsFile -Raw

    # Full table scans
    $selectAll = [regex]::Matches($js, "\.from\(['\`"](\w+)['\`"]\)\.select\(['\`"]?\*['\`"]?\)")
    $fullScans = 0
    foreach ($s in $selectAll) {
        $ctx = Get-Context $js $s.Index 300
        if ($ctx -notmatch '\.(eq|match|filter|in|gte|lte|limit|range|ilike)\(') { $fullScans++ }
    }
    if ($fullScans -gt 0) {
        Add-Finding $pn "warn" "$fullScans full table scans sin filtro" 5
    } else {
        Add-Finding $pn "ok" "No hay full table scans sin filtro"
    }

    # .single() vs .maybeSingle()
    $singles = ([regex]::Matches($js, '\.single\(\)')).Count
    $maybeSingles = ([regex]::Matches($js, '\.maybeSingle\(\)')).Count
    if ($singles -gt 2 -and $maybeSingles -eq 0) {
        Add-Finding $pn "warn" "$singles .single() sin .maybeSingle() (crash si 0 rows)" 4
    }
    Add-Finding $pn "info" ".single(): $singles | .maybeSingle(): $maybeSingles"

    # DELETE without confirm
    $deletes = [regex]::Matches($js, "\.from\(['\`"](\w+)['\`"]\)\.delete\(\)")
    if ($deletes.Count -gt 0) {
        $noConfirm = 0
        foreach ($d in $deletes) {
            $ctx = Get-Context $js $d.Index 800
            if ($ctx -notmatch 'confirm\(|confirmDialog|confirmAction|showConfirm') { $noConfirm++ }
        }
        if ($noConfirm -gt 0) { Add-Finding $pn "warn" "$noConfirm DELETE sin confirm()" 4 }
    }

    # Realtime
    $subs   = ([regex]::Matches($js, '\.channel\(|\.on\(.*postgres_changes')).Count
    $unsubs = ([regex]::Matches($js, '\.unsubscribe\(|removeChannel')).Count
    if ($subs -gt 0) {
        Add-Finding $pn "info" "Realtime: $subs subs, $unsubs unsubs"
        if ($unsubs -lt $subs) { Add-Finding $pn "warn" "Posible memory leak: $subs subs vs $unsubs unsubs" 3 }
    }

    $rpcs = ([regex]::Matches($js, '\.rpc\(')).Count
    Add-Finding $pn "info" "$rpcs RPCs, $($selectAll.Count) selects, $($deletes.Count) deletes"
}

# ==============================================================================
# PHASE 6: UX PATTERNS
# ==============================================================================
function Check-UXPatterns {
    $pn = "uxPatterns"
    if (-not (Test-Path $JsFile) -or -not (Test-Path $HtmlFile)) {
        Add-Finding $pn "alert" "Archivos faltantes"; return
    }
    $js   = Get-Content $JsFile -Raw
    $html = Get-Content $HtmlFile -Raw
    $css  = if (Test-Path $CssFile) { Get-Content $CssFile -Raw } else { "" }

    # Loading vs async
    $awaits   = ([regex]::Matches($js, '\bawait\b')).Count
    $spinners = ([regex]::Matches($html, 'spinner|loading|skeleton|lds-')).Count +
                ([regex]::Matches($css, 'spinner|loading|skeleton')).Count
    if ($awaits -gt 5 -and $spinners -lt 2) {
        Add-Finding $pn "warn" "$awaits async ops pero solo ~$spinners loading indicators" 3
    } else {
        Add-Finding $pn "ok" "Loading states: $spinners para $awaits async ops"
    }

    # Error feedback
    $catches = ([regex]::Matches($js, 'catch\s*\(|\.catch\(')).Count
    $toasts  = ([regex]::Matches($js, 'Toast\.(error|warning|success|info)|showToast|showError|showAlert|alert\(')).Count
    if ($catches -gt 0 -and $toasts -lt [Math]::Floor($catches / 2)) {
        Add-Finding $pn "warn" "$catches catches pero solo $toasts feedback al usuario" 3
    } else {
        Add-Finding $pn "ok" "Error feedback: $toasts toasts para $catches catches"
    }

    # Confirm before destructive
    $destructive = ([regex]::Matches($js, '\.delete\(|CANCELLED|status.*CLOSED')).Count
    $confirms    = ([regex]::Matches($js, 'confirm\(|confirmDialog|confirmAction')).Count
    if ($destructive -gt 0 -and $confirms -eq 0) {
        Add-Finding $pn "warn" "$destructive acciones destructivas sin confirm()" 3
    }

    # Empty states
    $emptyStates = ([regex]::Matches($html, 'empty-state|no-data|no-results|emptyState')).Count
    $tables = ([regex]::Matches($html, '<table|<tbody')).Count
    Add-Finding $pn "info" "Empty states: $emptyStates | Tablas: $tables"

    # Form validation
    $forms = ([regex]::Matches($html, '<form')).Count
    $validations = ([regex]::Matches($js, 'required|validate|checkValidity')).Count
    if ($forms -gt 0) { Add-Finding $pn "info" "Forms: $forms | Validaciones: $validations" }
}

# ==============================================================================
# PHASE 7: SUMMARY + DELTA
# ==============================================================================
function Check-Summary {
    $pn = "summary"

    $overall = Calculate-OverallScore
    $script:state.scores["overall"] = $overall
    $tag = Get-ScoreTag $overall

    Write-Host ""
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "   SCORE GLOBAL: $overall/100  $tag" -ForegroundColor White
    Write-Host "  ========================================" -ForegroundColor Cyan

    # Phase scores
    Write-Host ""
    foreach ($i in 0..($MaxPhases - 2)) {
        $pname = $PhaseNames[$i]
        $sc = $script:state.scores[$pname]
        if ($null -ne $sc) {
            $t = Get-ScoreTag $sc
            $color = if ($sc -ge 70) { "Green" } else { "Yellow" }
            Write-Host "  $t $pname : $sc/100" -ForegroundColor $color
        }
    }

    # Delta
    $prevHistory = @($script:state.history | Where-Object { $_.round -lt $script:state.lastRound })
    if ($prevHistory.Count -gt 0) {
        $prevScore = $prevHistory[-1].score
        if ($null -ne $prevScore -and $null -ne $overall) {
            $delta = $overall - $prevScore
            $arrow = if ($delta -gt 0) { "^" } elseif ($delta -lt 0) { "v" } else { "=" }
            $color = if ($delta -gt 0) { "Green" } elseif ($delta -lt 0) { "Red" } else { "DarkGray" }
            Write-Host ""
            Write-Host "  Tendencia: $arrow $delta puntos vs ronda anterior" -ForegroundColor $color
        }
    }

    # Top issues
    $allFindings = @()
    foreach ($phase in $PhaseNames) {
        foreach ($f in $script:state.findings[$phase]) {
            if ($f.level -ne "info") {
                $allFindings += @{ phase = $phase; msg = $f.msg; weight = $f.weight; level = $f.level }
            }
        }
    }
    $top = @($allFindings | Sort-Object { $_.weight } -Descending | Select-Object -First 5)
    if ($top.Count -gt 0) {
        Write-Host ""
        Write-Host "  TOP $($top.Count) ACCIONES:" -ForegroundColor Yellow
        $rank = 1
        foreach ($t in $top) {
            $icon = if ($t.level -eq "alert") { "[!!]" } else { "[!]" }
            $color = if ($t.level -eq "alert") { "Red" } else { "Yellow" }
            Write-Host "  $rank. $icon [$($t.phase)] $($t.msg)" -ForegroundColor $color
            $rank++
        }
    }

    # History
    $script:state.history.Add(@{
        round = $script:state.lastRound
        timestamp = (Get-Date -Format "o")
        score = $overall
        findings = @($allFindings).Count
    }) | Out-Null

    $histLine = @{ round = $script:state.lastRound; ts = (Get-Date -Format "o"); score = $overall; findings = @($allFindings).Count }
    ($histLine | ConvertTo-Json -Compress) | Out-File -Append -FilePath $HistoryFile -Encoding UTF8
}

# ==============================================================================
# REPORT GENERATOR
# ==============================================================================
function Save-ProgressiveReport {
    if (-not (Test-Path $OutputDir)) { New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null }

    $overall = $script:state.scores["overall"]
    $tag = Get-ScoreTag $overall
    $scoreText = if ($null -ne $overall) { "$overall/100 $tag" } else { "En progreso..." }

    $md = @()
    $md += "# Workdays Progressive Report"
    $md += ""
    $md += "> Session: $($script:state.sessionId)"
    $md += "> Ronda: $($script:state.lastRound) | Score: $scoreText"
    $md += "> Actualizado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $md += ""
    $md += "## Health Dashboard"
    $md += ""
    $md += "| Fase | Score | Status |"
    $md += "|:---|:---:|:---|"
    for ($i = 0; $i -lt $MaxPhases; $i++) {
        $pname = $PhaseNames[$i]
        $sc = $script:state.scores[$pname]
        $ts = $script:state.phaseTimestamps[$pname]
        if ($null -ne $sc) {
            $t = Get-ScoreTag $sc
            $md += "| $($PhaseTitles[$i]) | $sc $t | DONE $ts |"
        } else {
            $md += "| $($PhaseTitles[$i]) | -- | Pendiente |"
        }
    }
    $md += ""
    $md += "---"

    foreach ($i in 0..($MaxPhases - 1)) {
        $pname = $PhaseNames[$i]
        $ts = $script:state.phaseTimestamps[$pname]
        if (-not $ts) { continue }
        $md += ""
        $md += "## Fase $i : $($PhaseTitles[$i]) ($ts)"
        $md += ""
        $phaseFindings = $script:state.findings[$pname]
        if ($phaseFindings -and $phaseFindings.Count -gt 0) {
            foreach ($f in $phaseFindings) {
                $icon = switch ($f.level) { "alert" { "[!!]" }; "warn" { "[!]" }; default { "[i]" } }
                $md += "- $icon $($f.msg)"
            }
        } else {
            $md += "- [OK] Sin hallazgos negativos"
        }
    }

    if ($script:state.history.Count -gt 0) {
        $md += ""
        $md += "---"
        $md += ""
        $md += "## Historial"
        $md += ""
        $md += "| Ronda | Timestamp | Score | Findings |"
        $md += "|:---:|:---|:---:|:---:|"
        foreach ($h in $script:state.history) {
            $t = Get-ScoreTag $h.score
            $md += "| R$($h.round) | $($h.timestamp) | $($h.score) $t | $($h.findings) |"
        }
    }

    $md += ""
    $md += "---"
    $md += "_Generado por workdays-verifier.ps1 v2 (Progressive Scanner)_"

    ($md -join "`r`n") | Set-Content $ReportFile -Encoding UTF8 -Force
}

# ==============================================================================
# PHASE RUNNER
# ==============================================================================
function Run-Phase($phaseNum) {
    $pname = $PhaseNames[$phaseNum]
    Write-Phase $phaseNum $PhaseTitles[$phaseNum]

    try {
        switch ($phaseNum) {
            0 { Check-Baseline }
            1 { Check-DeepJS }
            2 { Check-DeepHTML }
            3 { Check-DeepCSS }
            4 { Check-CrossModule }
            5 { Check-SupabaseHealth }
            6 { Check-UXPatterns }
            7 { Check-Summary }
        }
        $script:state.scores[$pname] = Calculate-PhaseScore $pname
        $script:state.phaseTimestamps[$pname] = (Get-Date -Format "HH:mm")
        Write-Host "`n  >> Fase $phaseNum completada (score: $($script:state.scores[$pname]))" -ForegroundColor Green
    }
    catch {
        Write-Alert "Fase $phaseNum fallo: $($_.Exception.Message)"
        $script:state.scores[$pname] = 0
    }
    finally {
        $script:state.lastPhase = $phaseNum
        Save-State $script:state
    }
}

# ==============================================================================
# MAIN
# ==============================================================================
Clear-Host
Write-Host ""
Write-Host "  ========================================================" -ForegroundColor Magenta
Write-Host "   WORKDAYS PROGRESSIVE VERIFIER v2" -ForegroundColor White
Write-Host "  ========================================================" -ForegroundColor Magenta
if ($Watch -and $FullScan) {
    Write-Host "   Modo: FULL SCAN (8 fases cada ${IntervalSeconds}s)" -ForegroundColor Green
} elseif ($Watch) {
    Write-Host "   Modo: WATCH (1 fase cada ${IntervalSeconds}s)" -ForegroundColor Green
} else {
    Write-Host "   Modo: ONE-SHOT (8 fases de una vez)" -ForegroundColor Yellow
}
Write-Host "  ========================================================" -ForegroundColor Magenta
Write-Host ""
for ($i = 0; $i -lt $MaxPhases; $i++) {
    Write-Host "    $i. $($PhaseTitles[$i])" -ForegroundColor DarkGray
}
Write-Host ""
if ($Watch) { Write-Host "  Ctrl+C para detener" -ForegroundColor DarkGray; Write-Host "" }

# Load state
$script:state = Load-State
if ($Reset) { Write-Warn "Estado reseteado" }

# Checksum comparison
$currentChecksums = Get-FileChecksums
if ($script:state.checksums.Count -gt 0) {
    $changed = $false
    foreach ($k in $currentChecksums.Keys) {
        if ($script:state.checksums[$k] -ne $currentChecksums[$k]) { $changed = $true; break }
    }
    if ($changed) {
        Write-Warn "Archivos modificados -- invalidando fases"
        $script:state.findings = @{}
        foreach ($pn in $PhaseNames) { $script:state.findings[$pn] = @() }
        $script:state.scores = @{}
        $script:state.lastPhase = -1
    }
}
$script:state.checksums = $currentChecksums
$sessionStart = Get-Date

try {
    do {
        $script:state.lastRound++
        $elapsed = [math]::Round(((Get-Date) - $sessionStart).TotalMinutes, 0)
        $time = Get-Date -Format "HH:mm:ss"

        if ($Watch -and -not $FullScan) {
            $currentPhase = ($script:state.lastPhase + 1) % $MaxPhases
            Write-Host "=== Ronda $($script:state.lastRound) | FASE $currentPhase/7 @ $time (sesion: $elapsed min) ===" -ForegroundColor White
            Run-Phase $currentPhase
        }
        else {
            Write-Host "=== ESCANEO COMPLETO @ $time ===" -ForegroundColor White
            for ($p = 0; $p -lt $MaxPhases; $p++) { Run-Phase $p }
        }

        Save-ProgressiveReport

        $overall = $script:state.scores["overall"]
        $tag = Get-ScoreTag $overall
        Write-Host ""
        $barColor = if ($null -ne $overall -and $overall -ge 70) { "Green" } else { "Yellow" }
        Write-Host "  +---------------------------------------------+" -ForegroundColor $barColor
        $scoreDisp = if ($null -ne $overall) { "$overall/100 $tag" } else { "Parcial..." }
        Write-Host "  |  Score: $scoreDisp  |  Reporte: docs/80-ephemeral/agent-logs/qa/workdays-progressive.md" -ForegroundColor White
        Write-Host "  +---------------------------------------------+" -ForegroundColor $barColor

        if ($Watch) {
            $nextPhase = ($script:state.lastPhase + 1) % $MaxPhases
            Write-Host "  Proxima: Fase $nextPhase ($($PhaseTitles[$nextPhase])) en ${IntervalSeconds}s..." -ForegroundColor DarkGray
            Write-Host ""
            Start-Sleep -Seconds $IntervalSeconds
        }
    } while ($Watch)
}
finally {
    $elapsed = [math]::Round(((Get-Date) - $sessionStart).TotalMinutes, 1)
    Write-Host ""
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "   RESUMEN DE SESION" -ForegroundColor White
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "   Duracion : $elapsed min" -ForegroundColor White
    Write-Host "   Rondas   : $($script:state.lastRound)" -ForegroundColor White
    $ov = $script:state.scores["overall"]
    if ($null -ne $ov) { Write-Host "   Score    : $ov/100 $(Get-ScoreTag $ov)" -ForegroundColor White }
    Write-Host "   Reporte  : docs/80-ephemeral/agent-logs/qa/workdays-progressive.md" -ForegroundColor White
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host ""
}
