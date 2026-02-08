# fix-aria-search.ps1
# Add aria-label to global-search inputs
$pagesDir = "c:\Users\siste\Documents\GitHub\tester_3.0\pages"
$files = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"
$fixed = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    # Only add aria-label if the input has global-search but NOT aria-label already
    if ($content.Contains('id="global-search"') -and -not ($content -match 'id="global-search"[^>]*aria-label')) {
        # Add aria-label before the closing >
        $content = $content -replace '(id="global-search"[^>]*)(>)', '$1 aria-label="Navegación rápida"$2'
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $fixed++
        Write-Host "[FIXED] $($file.Name)"
    }
}
Write-Host "Added aria-label to $fixed global-search inputs"
