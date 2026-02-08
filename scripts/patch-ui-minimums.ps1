# Batch patch: Add favicon + theme-color to all HTML files in pages/
# Also normalize titles

$pagesDir = "c:\Users\siste\Documents\GitHub\tester_3.0\pages"
$files = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"

$dash = [char]0x2014  # em-dash

# Title mapping
$titleMap = @{}
$titleMap["Midnight Club - Admin"] = "Admin $dash Midnight"
$titleMap["Central Stock - FormulaMid"] = "Stock Central $dash Midnight"
$titleMap["Cierre Admin - FormulaMid"] = "Cierre $dash Midnight"
$titleMap["Configuraci" + [char]0xF3 + "n de Costos - FormulaMid"] = "Configuraci" + [char]0xF3 + "n $dash Midnight"
$titleMap["Master Categor" + [char]0xED + "as - FormulaMid"] = "Categor" + [char]0xED + "as $dash Midnight"
$titleMap["Master N" + [char]0xF3 + "mina - FormulaMid"] = "N" + [char]0xF3 + "mina $dash Midnight"
$titleMap["Master POS - FormulaMid"] = "POS $dash Midnight"
$titleMap["Master Proveedores - FormulaMid"] = "Proveedores $dash Midnight"
$titleMap["Master Tarifario - FormulaMid"] = "Tarifario $dash Midnight"
$titleMap["Gesti" + [char]0xF3 + "n de Pagos - FormulaMid"] = "Pagos $dash Midnight"
$titleMap["Reportes - FormulaMid"] = "Reportes $dash Midnight"
$titleMap["Cierre Semanal - FormulaMid"] = "Cierre Semanal $dash Midnight"
$titleMap["Gesti" + [char]0xF3 + "n de Pedidos - FormulaMid"] = "Solicitudes $dash Midnight"
$titleMap["Midnight - Jornadas"] = "Jornadas $dash Midnight"
$titleMap["Test: Devenciones Engine"] = "Test Devenciones $dash Midnight"
$titleMap["Gesti" + [char]0xF3 + "n QR - Midnight"] = "QR Gesti" + [char]0xF3 + "n $dash Midnight"
$titleMap["Generador QR - Midnight"] = "QR Generador $dash Midnight"
$titleMap["Midnight $dash Monitor de Accesos"] = "QR Monitor $dash Midnight"
$titleMap["Midnight - Encargado Barra"] = "Encargado Barra $dash Midnight"
$titleMap["FormulaMid $dash Control de Stock Barra"] = "Stock Barra $dash Midnight"
$titleMap["FormulaMid $dash Gesti" + [char]0xF3 + "n Personal Barra"] = "Personal Barra $dash Midnight"
$titleMap["Caja - Midnight Club"] = "Encargado Caja $dash Midnight"
$titleMap["Supervisi" + [char]0xF3 + "n Cajas - Midnight"] = "Supervisi" + [char]0xF3 + "n Cajas $dash Midnight"
$titleMap["Caja - Personal"] = "Personal Caja $dash Midnight"
$titleMap["FormulaMid $dash Recepci" + [char]0xF3 + "n de Pedidos"] = "Recepci" + [char]0xF3 + "n $dash Midnight"
$titleMap["Midnight - Balance Semanal"] = "Balance Semanal $dash Midnight"
$titleMap["Midnight - Log" + [char]0xED + "stica"] = "Log" + [char]0xED + "stica $dash Midnight"
$titleMap["Log" + [char]0xED + "stica - Stock Dep" + [char]0xF3 + "sito"] = "Stock Dep" + [char]0xF3 + "sito $dash Midnight"
$titleMap["Log" + [char]0xED + "stica - Distribuci" + [char]0xF3 + "n"] = "Distribuci" + [char]0xF3 + "n $dash Midnight"
$titleMap["Log" + [char]0xED + "stica - Recepci" + [char]0xF3 + "n"] = "Recepci" + [char]0xF3 + "n Log. $dash Midnight"
$titleMap["Log" + [char]0xED + "stica - Seguimiento"] = "Seguimiento $dash Midnight"
$titleMap["Mi QR - Midnight Club"] = "Mi QR $dash Midnight"
$titleMap["Midnight - Operaciones"] = "Operaciones $dash Midnight"
$titleMap["Operativo - Work Day"] = "Work Day $dash Midnight"
$titleMap["Stock Operativo - FormulaMid"] = "Stock Operativo $dash Midnight"
$titleMap["Solicitudes Operativo - FormulaMid"] = "Solicitudes Op. $dash Midnight"
$titleMap["Solicitudes SKU Operativo - FormulaMid"] = "Master SKU $dash Midnight"
$titleMap["Master Proveedores Operativo - FormulaMid"] = "Proveedores Op. $dash Midnight"
$titleMap["Midnight - An" + [char]0xE1 + "lisis Operativo"] = "An" + [char]0xE1 + "lisis $dash Midnight"
$titleMap["Operativo - ERP"] = "ERP $dash Midnight"
$titleMap["Operativo - CMS"] = "CMS $dash Midnight"
$titleMap["CMS Members - FormulaMid"] = "CMS Members $dash Midnight"
$titleMap["Scanner QR - Midnight"] = "Scanner QR $dash Midnight"
$titleMap["Barra - Midnight Club"] = "Staff Barra $dash Midnight"
$titleMap["Midnight V3.0 $dash Component Catalog"] = "Component Catalog $dash Midnight"
$titleMap["Midnight V3.0 $dash Layout Patterns"] = "Layout Patterns $dash Midnight"

$faviconLine = '    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg">'
$themeColorLine = '    <meta name="theme-color" content="#0a0a0f">'

# Special paths needing different relative path
$qrFaviconLine = '    <link rel="icon" type="image/svg+xml" href="../../../assets/img/favicon.svg">'

$count = 0
$titleChanges = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $modified = $false
    
    # 1. Add favicon if missing
    if ($content -notmatch 'rel="icon"') {
        $relativePath = $file.FullName.Replace($pagesDir, "").TrimStart("\")
        if ($relativePath -match "^admin\\qr\\") {
            $favLine = $qrFaviconLine
        } else {
            $favLine = $faviconLine
        }
        $content = $content -replace '(<meta name="viewport"[^>]*>)', "`$1`r`n$favLine"
        $modified = $true
    }
    
    # 2. Add theme-color if missing
    if ($content -notmatch 'theme-color') {
        $content = $content -replace '(<meta name="viewport"[^>]*>)', "`$1`r`n$themeColorLine"
        $modified = $true
    }
    
    # 3. Normalize title
    foreach ($oldTitle in $titleMap.Keys) {
        $escapedOld = [regex]::Escape($oldTitle)
        if ($content -match "<title>$escapedOld</title>") {
            $newTitle = $titleMap[$oldTitle]
            $content = $content -replace "<title>$escapedOld</title>", "<title>$newTitle</title>"
            $titleChanges++
            $modified = $true
            break
        }
    }
    
    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $count++
        Write-Host "Patched: $($file.Name)"
    } else {
        Write-Host "Skipped: $($file.Name) (no changes needed)"
    }
}

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Files patched: $count"
Write-Host "Titles normalized: $titleChanges"
