# Design System — Pre-Audit (Fase 1)
# Ejecuta los 5 comandos de inventario con Gemini CLI
# Uso: .\scripts\ds-pre-audit.ps1

$outputDir = "docs\_generated\frontend"

Write-Host "`n=== FASE 1: Pre-Audit (5 tareas) ===" -ForegroundColor Cyan

Write-Host "`n[1/5] Inventario tokens.css..." -ForegroundColor Yellow
gemini -p "Lee assets/css/tokens.css y genera una tabla markdown con todos los custom properties: nombre, valor, y tier (primitivo/semantico/componente/print). Solo el markdown, sin explicacion." > "$outputDir\tokens-inventory.md"

Write-Host "[2/5] Inventario swiss-style.css..." -ForegroundColor Yellow
gemini -p "Lee assets/css/swiss-style.css y lista todos los custom properties en :root con nombre y valor. Solo tabla markdown." > "$outputDir\swiss-tokens-inventory.md"

Write-Host "[3/5] Diff de tokens..." -ForegroundColor Yellow
gemini -p "Compara los custom properties de assets/css/tokens.css vs assets/css/swiss-style.css. Lista SOLO los que tienen valores diferentes. Formato tabla: token, valor en tokens.css, valor en swiss-style.css. Solo markdown." > "$outputDir\token-diff.md"

Write-Host "[4/5] Inventario componentes swiss-style..." -ForegroundColor Yellow
gemini -p "Lista todas las clases CSS definidas en assets/css/swiss-style.css (solo selectores de clase, no propiedades). Agrupa por categoria. Solo markdown." > "$outputDir\swiss-components-inventory.md"

Write-Host "[5/5] Hex hardcodeados..." -ForegroundColor Yellow
gemini -p "Busca en assets/css/ y pages/ todos los valores hex (#xxx o #xxxxxx) que aparezcan FUERA de bloques :root {}. Lista archivo, linea, y valor. Solo markdown." > "$outputDir\hardcoded-colors-report.md"

Write-Host "`n=== FASE 1 COMPLETA ===" -ForegroundColor Green
Write-Host "Reportes en: $outputDir\" -ForegroundColor Green
Get-ChildItem "$outputDir\*inventory*","$outputDir\token-diff.md","$outputDir\hardcoded-colors-report.md" | Format-Table Name, Length
