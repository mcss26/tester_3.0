# fix-logout-final.ps1
$pagesDir = "c:\Users\siste\Documents\GitHub\tester_3.0\pages"
$files = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"
$fixed = 0
$target = "Cerrar " + [char]0x00F3 + "n"
$replacement = "Cerrar Sesi" + [char]0x00F3 + "n"

Write-Host "Looking for: [$target]"
Write-Host "Replacing with: [$replacement]"

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content.Contains($target)) {
        $content = $content.Replace($target, $replacement)
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $fixed++
        Write-Host "[FIXED] $($file.Name)"
    }
}
Write-Host "Fixed: $fixed files"
