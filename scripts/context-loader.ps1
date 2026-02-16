# =============================================================================
# Context Loader v1 - FormulaMid 4
# Usage: powershell -ExecutionPolicy Bypass -File scripts/context-loader.ps1 -Topic "workdays"
#
# QUE HACE ESTE SCRIPT:
#
# Genera un reporte de contexto sobre un tema especifico buscando en:
# 1. Knowledge Items (respuestas curadas de sesiones anteriores)
# 2. Codigo fuente (archivos que matchean el tema)
# 3. Documentacion (docs/ que mencionan el tema)
# 4. Schema (tablas relacionadas)
# 5. Git history (commits recientes sobre el tema)
# 6. Reportes previos (audits, flow-traces)
#
# El resultado es un archivo .md listo para pegar en una nueva sesion
# de agente, eliminando la necesidad de repetir preguntas complejas.
# =============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Topic,
    [switch]$Clipboard,     # Copiar al clipboard en vez de archivo
    [switch]$Analyze        # Pasar a Claude CLI para resumen
)

$ProjectRoot    = "C:\Users\siste\Documents\GitHub\tester_3.0"
$KnowledgeRoot  = "C:\Users\siste\.gemini\antigravity\knowledge"
$ConvoRoot      = "C:\Users\siste\.gemini\antigravity\brain"
$DocsDir        = Join-Path $ProjectRoot "docs"
$JsDir          = Join-Path $ProjectRoot "assets\js"
$PagesDir       = Join-Path $ProjectRoot "pages"
$SchemaFile     = Join-Path $ProjectRoot "docs\scheme.md"
$OutputDir      = Join-Path $ProjectRoot "docs\output\qa"
$OutputFile     = Join-Path $OutputDir "context-$($Topic.ToLower()).md"

$startTime = Get-Date

function Write-Head($msg)  { Write-Host "`n  $msg" -ForegroundColor Cyan }
function Write-OK($msg)    { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info($msg)  { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
function Write-Found($msg) { Write-Host "  [+]  $msg" -ForegroundColor Yellow }

Clear-Host
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host "   CONTEXT LOADER v1 - '$Topic'" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host ""

$report = @()
$report += "# Contexto: $Topic"
$report += "Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm') | Topic: ``$Topic``"
$report += ""
$report += "> Este archivo contiene todo el contexto relevante sobre **$Topic**."
$report += "> Pegalo al inicio de una conversacion para que el agente arranque informado."
$report += ""

# =============================================================================
# 1. KNOWLEDGE ITEMS
# =============================================================================
Write-Head "1. KNOWLEDGE ITEMS"
Write-Info "Busco en $(Split-Path $KnowledgeRoot -Leaf) por '$Topic'"

$kiMatches = @()
if (Test-Path $KnowledgeRoot) {
    $kiDirs = Get-ChildItem $KnowledgeRoot -Directory -EA SilentlyContinue
    foreach ($ki in $kiDirs) {
        $metaPath = Join-Path $ki.FullName "metadata.json"
        if (-not (Test-Path $metaPath)) { continue }

        try {
            $meta = Get-Content $metaPath -Raw | ConvertFrom-Json
            $title = $meta.title
            $summary = $meta.summary

            # Buscar en titulo y summary
            if ($title -match $Topic -or $summary -match $Topic -or $ki.Name -match $Topic) {
                $kiMatches += @{ Name = $ki.Name; Title = $title; Summary = $summary; Path = $ki.FullName }
                Write-Found "KI: $title"
            }
        } catch { }
    }

    # Tambien buscar dentro de los artefactos (contenido)
    $artifactMatches = Get-ChildItem $KnowledgeRoot -Recurse -Filter "*.md" -EA SilentlyContinue |
        Select-String -Pattern $Topic -List -EA SilentlyContinue
    foreach ($am in $artifactMatches) {
        $relPath = $am.Path.Replace("$KnowledgeRoot\", "")
        $kiName = ($relPath -split '\\')[0]
        # Solo agregar si no esta ya en kiMatches
        $already = $kiMatches | Where-Object { $_.Name -eq $kiName }
        if (-not $already) {
            $metaPath = Join-Path $KnowledgeRoot "$kiName\metadata.json"
            if (Test-Path $metaPath) {
                $meta = Get-Content $metaPath -Raw | ConvertFrom-Json
                $kiMatches += @{ Name = $kiName; Title = $meta.title; Summary = $meta.summary; Path = (Join-Path $KnowledgeRoot $kiName) }
                Write-Found "KI (por contenido): $($meta.title)"
            }
        }
    }
}

if ($kiMatches.Count -gt 0) {
    $report += "## 1. Knowledge Items ($($kiMatches.Count) encontrados)"
    $report += ""
    foreach ($ki in $kiMatches) {
        $report += "### $($ki.Title)"
        $report += "$($ki.Summary)"
        $report += ""

        # Incluir contenido de artefactos relevantes
        $artifacts = Get-ChildItem (Join-Path $ki.Path "artifacts") -Recurse -Filter "*.md" -EA SilentlyContinue
        foreach ($art in $artifacts) {
            $artContent = Get-Content $art.FullName -Raw -EA SilentlyContinue
            if ($artContent -match $Topic) {
                $relArt = $art.FullName.Replace("$($ki.Path)\artifacts\", "")
                $report += "#### Artefacto: $relArt"
                # Incluir solo las lineas relevantes (contexto)
                $lines = Get-Content $art.FullName -EA SilentlyContinue
                $relevant = @()
                for ($i = 0; $i -lt $lines.Count; $i++) {
                    if ($lines[$i] -match $Topic) {
                        # Incluir 3 lineas antes y 3 despues
                        $start = [Math]::Max(0, $i - 3)
                        $end = [Math]::Min($lines.Count - 1, $i + 3)
                        for ($j = $start; $j -le $end; $j++) {
                            if ($lines[$j] -notin $relevant) { $relevant += $lines[$j] }
                        }
                    }
                }
                if ($relevant.Count -gt 0) {
                    $report += '```'
                    $report += $relevant
                    $report += '```'
                    $report += ""
                }
            }
        }
    }
} else {
    $report += "## 1. Knowledge Items"
    $report += "No se encontraron KIs sobre '$Topic'."
    $report += ""
    Write-Info "Sin matches en knowledge"
}

# =============================================================================
# 2. CODIGO FUENTE
# =============================================================================
Write-Head "2. CODIGO FUENTE"
Write-Info "Busco archivos que matcheen '$Topic'"

$codeFiles = @()

# HTML
$htmlMatch = Get-ChildItem $PagesDir -Recurse -Filter "*$Topic*" -EA SilentlyContinue
$codeFiles += $htmlMatch

# JS
$jsMatch = Get-ChildItem $JsDir -Recurse -Filter "*$Topic*" -EA SilentlyContinue
$codeFiles += $jsMatch

# CSS
$cssMatch = Get-ChildItem (Join-Path $ProjectRoot "assets\css") -Recurse -Filter "*$Topic*" -EA SilentlyContinue
$codeFiles += $cssMatch

$report += "## 2. Codigo fuente ($($codeFiles.Count) archivos)"
$report += ""
if ($codeFiles.Count -gt 0) {
    foreach ($cf in $codeFiles) {
        $rel = $cf.FullName.Replace("$ProjectRoot\", "")
        $size = "{0:N0}" -f $cf.Length
        $mod = $cf.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
        $report += "- ``$rel`` ($size bytes, mod: $mod)"
        Write-Found "$rel"
    }

    # Para cada JS, extraer funciones exportadas y tablas usadas
    foreach ($js in ($codeFiles | Where-Object { $_.Extension -eq '.js' })) {
        $content = Get-Content $js.FullName -Raw -EA SilentlyContinue
        if (-not $content) { continue }

        $report += ""
        $report += "### $(Split-Path $js -Leaf) - Analisis"

        # Funciones
        $funcs = [regex]::Matches($content, '(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(')
        if ($funcs.Count -gt 0) {
            $funcNames = ($funcs | ForEach-Object {
                if ($_.Groups[1].Value) { $_.Groups[1].Value } else { $_.Groups[2].Value }
            }) | Select-Object -Unique
            $report += "**Funciones:** ``$($funcNames -join '``, ``')``"
        }

        # Tablas Supabase
        $tables = [regex]::Matches($content, "\.from\(['""](\w+)['""]\)")
        if ($tables.Count -gt 0) {
            $tableNames = ($tables | ForEach-Object { $_.Groups[1].Value }) | Select-Object -Unique | Sort-Object
            $report += "**Tablas Supabase:** ``$($tableNames -join '``, ``')``"
        }
    }
} else {
    $report += "No se encontraron archivos que matcheen '$Topic'."
}
$report += ""

# =============================================================================
# 3. DOCUMENTACION
# =============================================================================
Write-Head "3. DOCUMENTACION"
Write-Info "Busco en docs/ por '$Topic'"

$docMatches = Get-ChildItem $DocsDir -Recurse -Filter "*.md" -EA SilentlyContinue |
    Select-String -Pattern $Topic -List -EA SilentlyContinue

$report += "## 3. Documentacion ($($docMatches.Count) archivos)"
$report += ""
if ($docMatches.Count -gt 0) {
    foreach ($dm in $docMatches) {
        $rel = $dm.Path.Replace("$ProjectRoot\", "")
        Write-Found "$rel"
        $report += "- ``$rel``"
    }
} else {
    $report += "No se encontraron docs que mencionen '$Topic'."
}
$report += ""

# =============================================================================
# 4. SCHEMA (tablas relacionadas)
# =============================================================================
Write-Head "4. SCHEMA"
if (Test-Path $SchemaFile) {
    Write-Info "Busco tablas en scheme.md que mencionen '$Topic'"
    $schemaContent = Get-Content $SchemaFile -EA SilentlyContinue
    $schemaMatches = @()
    for ($i = 0; $i -lt $schemaContent.Count; $i++) {
        if ($schemaContent[$i] -match $Topic) {
            $start = [Math]::Max(0, $i - 2)
            $end = [Math]::Min($schemaContent.Count - 1, $i + 5)
            for ($j = $start; $j -le $end; $j++) {
                if ($schemaContent[$j] -notin $schemaMatches) { $schemaMatches += $schemaContent[$j] }
            }
        }
    }

    $report += "## 4. Schema"
    $report += ""
    if ($schemaMatches.Count -gt 0) {
        $report += '```sql'
        $report += $schemaMatches
        $report += '```'
        Write-Found "$($schemaMatches.Count) lineas relevantes en scheme.md"
    } else {
        $report += "No se encontraron tablas sobre '$Topic' en scheme.md."
        Write-Info "Sin matches en schema"
    }
} else {
    $report += "## 4. Schema"
    $report += "scheme.md no encontrado."
}
$report += ""

# =============================================================================
# 5. GIT HISTORY
# =============================================================================
Write-Head "5. GIT HISTORY"
Write-Info "Ultimos commits sobre '$Topic'"

$gitLog = git -C $ProjectRoot log --oneline --all -20 --grep="$Topic" 2>$null
$gitFiles = git -C $ProjectRoot log --oneline --all -10 --diff-filter=AMCR -- "*$Topic*" 2>$null

$report += "## 5. Git History"
$report += ""

if ($gitLog) {
    $report += "### Commits que mencionan '$Topic'"
    foreach ($gl in $gitLog) { $report += "- $gl" }
    Write-Found "$($gitLog.Count) commits con '$Topic' en el mensaje"
} else {
    $report += "No hay commits que mencionen '$Topic' en el mensaje."
}

if ($gitFiles) {
    $report += ""
    $report += "### Commits que tocan archivos *$Topic*"
    foreach ($gf in $gitFiles) { $report += "- $gf" }
    Write-Found "$($gitFiles.Count) commits tocando archivos *$Topic*"
}
$report += ""

# =============================================================================
# 6. REPORTES PREVIOS
# =============================================================================
Write-Head "6. REPORTES PREVIOS"
Write-Info "Busco audits y flow-traces sobre '$Topic'"

$prevReports = @()
$outputDirs = @(
    (Join-Path $ProjectRoot "docs\output"),
    (Join-Path $ProjectRoot "docs\migration")
)
foreach ($od in $outputDirs) {
    if (Test-Path $od) {
        $matches = Get-ChildItem $od -Recurse -Filter "*.md" -EA SilentlyContinue |
            Select-String -Pattern $Topic -List -EA SilentlyContinue
        $prevReports += $matches
    }
}

$report += "## 6. Reportes previos ($($prevReports.Count) encontrados)"
$report += ""
if ($prevReports.Count -gt 0) {
    foreach ($pr in $prevReports) {
        $rel = $pr.Path.Replace("$ProjectRoot\", "")
        $report += "- ``$rel``"
        Write-Found "$rel"
    }
} else {
    $report += "No se encontraron reportes previos sobre '$Topic'."
}
$report += ""

# =============================================================================
# 7. CONVERSACIONES RECIENTES
# =============================================================================
Write-Head "7. CONVERSACIONES"
Write-Info "Busco en logs de conversaciones recientes"

$convoMatches = @()
if (Test-Path $ConvoRoot) {
    # Buscar en los overview.txt de las ultimas 10 conversaciones
    $convos = Get-ChildItem $ConvoRoot -Directory -EA SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 15

    foreach ($co in $convos) {
        $logDir = Join-Path $co.FullName ".system_generated\logs"
        $overview = Join-Path $logDir "overview.txt"
        if (Test-Path $overview) {
            $content = Get-Content $overview -Raw -EA SilentlyContinue
            if ($content -match $Topic) {
                # Extraer titulo (primera linea util)
                $firstLine = (Get-Content $overview -EA SilentlyContinue | Where-Object { $_.Trim().Length -gt 0 } | Select-Object -First 1)
                $convoMatches += @{ Id = $co.Name; Title = $firstLine; Date = $co.LastWriteTime.ToString("yyyy-MM-dd") }
                Write-Found "Conversacion: $firstLine"
            }
        }
    }
}

$report += "## 7. Conversaciones previas ($($convoMatches.Count) encontradas)"
$report += ""
if ($convoMatches.Count -gt 0) {
    foreach ($cm in $convoMatches) {
        $report += "- [$($cm.Date)] $($cm.Title) (ID: ``$($cm.Id)``)"
    }
} else {
    $report += "No se encontraron conversaciones recientes sobre '$Topic'."
}

# =============================================================================
# RESUMEN Y OUTPUT
# =============================================================================
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host "   RESUMEN" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Magenta

$totalFinds = $kiMatches.Count + $codeFiles.Count + $docMatches.Count + $prevReports.Count + $convoMatches.Count
$elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)
Write-Host "  Topic: $Topic" -ForegroundColor White
Write-Host "  Hallazgos: $totalFinds total ($elapsed seg)" -ForegroundColor Green
Write-Host "    KIs: $($kiMatches.Count) | Codigo: $($codeFiles.Count) | Docs: $($docMatches.Count)" -ForegroundColor DarkGray
Write-Host "    Reportes: $($prevReports.Count) | Conversaciones: $($convoMatches.Count)" -ForegroundColor DarkGray

if (-not (Test-Path $OutputDir)) { New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null }
$report -join "`n" | Out-File -FilePath $OutputFile -Encoding utf8
Write-Host ""
Write-Host "  Guardado: $OutputFile" -ForegroundColor Green

if ($Clipboard) {
    $report -join "`n" | Set-Clipboard
    Write-Host "  Copiado al clipboard!" -ForegroundColor Cyan
}

if ($Analyze) {
    $claudeExists = Get-Command claude -EA SilentlyContinue
    if ($claudeExists) {
        Write-Host ""
        Write-Host "  Invocando Claude CLI para resumen ejecutivo..." -ForegroundColor Cyan
        $content = $report -join "`n"
        $prompt = @"
Sos un asistente que prepara contexto para agentes de IA.
Lee este reporte de contexto sobre "$Topic" del proyecto FormulaMid 4 y genera:

1. Un RESUMEN EJECUTIVO de 5 lineas: que es $Topic en este proyecto, que archivos lo componen, que tablas usa
2. DECISIONES PREVIAS: que se decidio sobre $Topic en conversaciones/KIs anteriores
3. ESTADO ACTUAL: que esta implementado y que falta
4. PREGUNTAS QUE NO DEBEN REPETIRSE: datos que ya se establecieron y no deben preguntarse de nuevo

Reporte:
$content
"@
        claude -p $prompt
    } else {
        Write-Host "  Claude CLI no disponible. Usa -Clipboard para copiar y pegar manualmente." -ForegroundColor Yellow
    }
}

Write-Host ""
