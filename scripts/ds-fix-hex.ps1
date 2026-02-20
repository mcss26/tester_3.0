# Design System — Fix Hardcoded Hex Colors (Pure PowerShell)
# Uso: .\scripts\ds-fix-hex.ps1
# Fase A: meta theme-color fix
# Fase B: hex-to-token mapping report

$root = $PSScriptRoot | Split-Path
$outputDir = Join-Path $root "docs\_generated\frontend"

# === FASE A: Fix meta theme-color ===
Write-Host "`n=== FASE A: Meta theme-color (#0a0a0f -> #000000) ===" -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path (Join-Path $root "pages") -Filter "*.html" -Recurse
$fixedFiles = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match '#0a0a0f') {
        $newContent = $content -replace '#0a0a0f', '#000000'
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $fixedFiles += $file.FullName.Replace($root, '').TrimStart('\')
    }
}

if ($fixedFiles.Count -gt 0) {
    Write-Host "  Fixed $($fixedFiles.Count) files:" -ForegroundColor Green
    $fixedFiles | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
} else {
    Write-Host "  No files with #0a0a0f found." -ForegroundColor Yellow
}

# === FASE B: Hex-to-Token Mapping ===
Write-Host "`n=== FASE B: Generating hex-to-token map ===" -ForegroundColor Cyan

# Token lookup table (from tokens.css)
$tokenMap = @{
    '#000000' = '--neutral-0 / --bg-body'
    '#050505' = '--neutral-50'
    '#0a0a0a' = '--neutral-100 / --bg-surface'
    '#111111' = '--neutral-150'
    '#111'    = '--neutral-150'
    '#18181b' = '--neutral-200 / --bg-elevated'
    '#1a1a1a' = '--neutral-200 (approx)'
    '#27272a' = '--neutral-300'
    '#3f3f46' = '--neutral-400'
    '#52525b' = '--neutral-500 / --text-tertiary'
    '#71717a' = '--neutral-600'
    '#a1a1aa' = '--neutral-700 / --text-secondary'
    '#d4d4d8' = '--neutral-800'
    '#e4e4e7' = '--neutral-900'
    '#f4f4f5' = '--neutral-950'
    '#ffffff' = '--neutral-1000 / --text-primary'
    '#fff'    = '--neutral-1000 / --text-primary'
    '#000'    = '--neutral-0 / --bg-body'
    '#09090b' = '--neutral-50 (approx)'
    '#4ade80' = '--success / --green-400'
    '#22c55e' = '--green-500'
    '#fbbf24' = '--warning / --yellow-400'
    '#f87171' = '--danger / --red-400'
    '#ef4444' = '--red-500 (approx)'
    '#ff3b30' = '--red-600 / --aurora-red'
    '#ff4d42' = '--red-600 (approx)'
    '#60a5fa' = '--info / --blue-400'
    '#3b82f6' = '--blue-500'
    '#38bdf8' = '--accent-focus / --sky-400'
    '#c084fc' = '--purple-400'
    '#fb923c' = '--orange-400'
    '#f59e0b' = '--orange-500'
    '#e4d2a8' = '--brand-gold'
    '#c9a96e' = '--brand-gold-dark'
    '#30d158' = 'SIN TOKEN (Apple green, use --success)'
    '#34c759' = 'SIN TOKEN (Apple green, use --success)'
    '#d70015' = 'SIN TOKEN (deep red)'
    '#ca8a04' = 'SIN TOKEN (amber-600)'
    '#94a3b8' = 'SIN TOKEN (slate-400)'
    '#FFBC00' = 'SIN TOKEN (gold, use --brand-gold)'
    '#cccccc' = 'SIN TOKEN (light gray)'
    '#999'    = 'SIN TOKEN (mid gray)'
    '#333'    = 'SIN TOKEN (dark gray)'
    '#e5e5e5' = 'SIN TOKEN (gray-200, print only?)'
}

# Parse hardcoded report
$report = Get-Content (Join-Path $outputDir "hardcoded-colors-report.md") -Encoding UTF8
$mapLines = @()
$mapLines += "# Hex-to-Token Mapping"
$mapLines += ""
$mapLines += "| File | Line | Hex | Token | Confidence |"
$mapLines += "| :--- | :--- | :--- | :--- | :--- |"

$currentSection = ""
foreach ($line in $report) {
    if ($line -match '^\| (\S+.*?\S)\s*\|\s*(\d+)\s*\|\s*(#[0-9a-fA-F]{3,6})\s*\|') {
        $file = $Matches[1].Trim()
        $lineNum = $Matches[2].Trim()
        $hex = $Matches[3].Trim()
        
        # Skip header rows
        if ($file -eq ':---' -or $file -eq 'File') { continue }
        
        $token = if ($tokenMap.ContainsKey($hex)) { $tokenMap[$hex] } else { "SIN TOKEN" }
        
        $confidence = if ($token -eq "SIN TOKEN" -or $token -match "SIN TOKEN") {
            "baja"
        } elseif ($token -match "approx") {
            "media"
        } else {
            "alta"
        }
        
        $mapLines += "| $file | $lineNum | ``$hex`` | ``$token`` | $confidence |"
    }
}

# Stats
$alta = ($mapLines | Where-Object { $_ -match '\| alta \|' }).Count
$media = ($mapLines | Where-Object { $_ -match '\| media \|' }).Count
$baja = ($mapLines | Where-Object { $_ -match '\| baja \|' }).Count

$mapLines += ""
$mapLines += "## Summary"
$mapLines += ""
$mapLines += "| Confidence | Count |"
$mapLines += "| :--- | :--- |"
$mapLines += "| Alta (safe to replace) | $alta |"
$mapLines += "| Media (verify context) | $media |"
$mapLines += "| Baja (no token exists) | $baja |"

$outFile = Join-Path $outputDir "hex-to-token-map.md"
$mapLines | Set-Content $outFile -Encoding UTF8

Write-Host "  Generated: hex-to-token-map.md" -ForegroundColor Green
Write-Host "  Alta: $alta | Media: $media | Baja: $baja" -ForegroundColor White
Write-Host "`n=== DONE ===" -ForegroundColor Green
