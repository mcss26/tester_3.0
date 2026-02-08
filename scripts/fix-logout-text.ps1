# fix-logout-text.ps1
# Fix garbled logout text to proper "Cerrar Sesión"
$pagesDir = "c:\Users\siste\Documents\GitHub\tester_3.0\pages"
$files = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"
$fixed = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Match any garbled form of the logout text
    $needsFix = $false
    
    if ($content -match 'Cerrar .n\b' -and $content -notmatch 'Cerrar Sesi') {
        $content = $content -replace 'Cerrar [óo]n', "Cerrar Sesión"
        $needsFix = $true
    }
    
    if ($needsFix) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $fixed++
        Write-Host "[FIXED] $($file.Name)"
    }
}
Write-Host "Fixed text in $fixed files"
