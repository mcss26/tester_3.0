# fix-aria-accent.ps1
# Normalize "Menu de usuario" -> "Menú de usuario"
$pagesDir = "c:\Users\siste\Documents\GitHub\tester_3.0\pages"
$files = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"
$fixed = 0
$target = 'aria-label="Menu de usuario"'
$replacement = [char]0x00FA
$correct = "aria-label=""Men" + $replacement + " de usuario"""

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content.Contains($target)) {
        $content = $content.Replace($target, $correct)
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $fixed++
        Write-Host "[FIXED] $($file.Name)"
    }
}
Write-Host "Normalized aria-label accent in $fixed files"
