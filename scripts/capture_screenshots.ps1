# Automation Script: Capture all HTML pages using Chrome Headless (Final Robust Version)
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

$baseDir = "c:\Users\siste\Documents\GitHub\tester_3.0"
$outputDir = Join-Path $baseDir "screenshots"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# Find all HTML files
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }

# Define extra states for multi-view modules
$extraStates = @(
    @{ Path = "pages\admin\admin-central-stock.html"; View = "recetas" },
    @{ Path = "pages\admin\admin-central-stock.html"; View = "rentabilidad" },
    @{ Path = "pages\admin\admin-solicitudes.html"; View = "pendientes" },
    @{ Path = "pages\admin\admin-workdays.html"; View = "panelEvento" },
    @{ Path = "pages\admin\admin-workdays.html"; View = "panelStockAudit" },
    @{ Path = "pages\admin\admin-workdays.html"; View = "panelHistorico" }
)

$captureList = $htmlFiles | ForEach-Object { @{ FullName = $_.FullName; View = $null } }
$extraCaptureList = $extraStates | ForEach-Object { 
    $fullPath = Join-Path $baseDir $_.Path
    if (Test-Path $fullPath) { @{ FullName = $fullPath; View = $_.View } }
}
$finalList = $captureList + $extraCaptureList

foreach ($item in $finalList) {
    $fileFullName = $item.FullName
    $view = $item.View
    
    # Simple path surgery
    $rel = $fileFullName.Substring($baseDir.Length)
    $cleanPath = $rel.Replace("\", "_").Replace("/", "_").TrimStart("_")
    $cleanPath = $cleanPath.Replace(".html", "")
    if ($view) { $cleanPath = "$cleanPath" + "_view_" + "$view" }
    
    $outputPath = Join-Path $outputDir "$cleanPath.png"
    $url = $fileFullName
    if ($view) { $url = "$url?view=$view" }

    Write-Host "Capturing: $cleanPath"
    
    $chromeArgs = @(
        "--headless",
        "--screenshot=`"$outputPath`"",
        "--window-size=1280,1024",
        "--virtual-time-budget=10000",
        "--disable-gpu",
        "--hide-scrollbars",
        "`"$url`""
    )
    Start-Process -FilePath $chromePath -ArgumentList $chromeArgs -Wait
}

Write-Host "Done! Screenshots saved in $outputDir"
