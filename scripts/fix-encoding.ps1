# fix-encoding.ps1
# Fix encoding issue: "Sesiu00f3n" -> "Sesión"
$pagesDir = "c:\Users\siste\Documents\GitHub\tester_3.0\pages"
$files = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"
$fixed = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match 'Sesiu00f3n') {
        $content = $content -replace 'Sesiu00f3n', ([char]0x00F3 + 'n')
        # Build the correct string: "Sesi" + ó + "n"
        $content = $content -replace 'Cerrar Sesi.n', 'Cerrar Sesión'
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $fixed++
        Write-Host "[FIXED] $($file.Name)"
    }
}
Write-Host "Fixed encoding in $fixed files"
