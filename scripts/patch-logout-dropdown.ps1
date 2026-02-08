# patch-logout-dropdown.ps1
# Inserts the Golden Standard user dropdown (with logout) into pages
# that have a topbar avatar but no dropdown-menu.

$pagesDir = "c:\Users\siste\Documents\GitHub\tester_3.0\pages"
$files = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"

# The dropdown menu HTML to inject (after the avatar button, inside dropdown-container)
$dropdownMenu = @"
                <div class="dropdown-menu dropdown-user hidden" id="user-menu">
                    <div class="dropdown-header" id="user-name-display">Usuario</div>
                    <div class="dropdown-divider"></div>
                    <a href="#" id="btn-logout" class="dropdown-item dropdown-item-danger">
                        <svg class="dropdown-icon" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Cerrar Sesi`u00f3n
                    </a>
                </div>
"@

$patched = 0
$skipped = 0
$errors = @()

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $name = $file.Name

    # Skip files that already have dropdown-menu / btn-logout
    if ($content -match 'dropdown-menu' -and $content -match 'btn-logout') {
        $skipped++
        continue
    }

    # Skip dev tools
    if ($name -in @('components_catalog.html', 'layout_patterns.html', 'module-audit.html', 'test-devenciones.html')) {
        $skipped++
        continue
    }

    # Skip if no topbar at all
    if ($content -notmatch 'class="topbar"') {
        $skipped++
        continue
    }

    $modified = $false

    # PATTERN A: <div class="avatar avatar-sm">XX</div> inside dropdown-container (no button, no id)
    # Replace the div avatar with a button avatar + append dropdown-menu
    $patternA = '<div class="dropdown-container">\s*\r?\n\s*<div class="avatar avatar-sm">[A-Z]{2}</div>\s*\r?\n\s*</div>'
    if ($content -match $patternA) {
        $match = [regex]::Match($content, $patternA)
        $indent = "            "
        $replacement = @"
<div class="dropdown-container">
$indent    <button class="avatar avatar-sm" id="user-avatar" aria-label="Menu de usuario">AD</button>
$dropdownMenu
$indent</div>
"@
        $content = $content.Substring(0, $match.Index) + $indent + $replacement + $content.Substring($match.Index + $match.Length)
        $modified = $true
    }

    # PATTERN B: <button class="avatar avatar-sm" id="user-avatar">XX</button> inside dropdown-container but NO dropdown-menu after it
    $patternB = '(<button class="avatar avatar-sm" id="user-avatar"[^>]*>[A-Z]{2,4}</button>)\s*\r?\n(\s*</div>)'
    if (-not $modified -and $content -match $patternB -and $content -notmatch 'dropdown-menu') {
        # Add aria-label if missing and inject dropdown menu
        $content = [regex]::Replace($content, $patternB, {
            param($m)
            $btn = $m.Groups[1].Value
            $closingDiv = $m.Groups[2].Value
            # Add aria-label if not present
            if ($btn -notmatch 'aria-label') {
                $btn = $btn -replace '(id="user-avatar")', '$1 aria-label="Menu de usuario"'
            }
            return "$btn`r`n$dropdownMenu`r`n$closingDiv"
        })
        $modified = $true
    }

    # PATTERN C: Just a bare <div class="avatar" id="user-avatar">XX</div> (no dropdown-container)
    $patternC = '(<div class="topbar-end">)\s*\r?\n\s*<div class="avatar" id="user-avatar">[A-Z]{2,4}</div>\s*\r?\n\s*(</div>)'
    if (-not $modified -and $content -match $patternC -and $content -notmatch 'dropdown-menu') {
        $content = [regex]::Replace($content, $patternC, {
            param($m)
            $topbarEnd = $m.Groups[1].Value
            $closingDiv = $m.Groups[2].Value
            $indent = "            "
            return @"
$topbarEnd
$indent<div class="dropdown-container">
$indent    <button class="avatar avatar-sm" id="user-avatar" aria-label="Menu de usuario">AD</button>
$dropdownMenu
$indent</div>
$indent$closingDiv
"@
        })
        $modified = $true
    }

    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $patched++
        Write-Host "[PATCHED] $($file.FullName)" -ForegroundColor Green
    } else {
        # Has topbar but we couldn't match a pattern
        if ($content -notmatch 'btn-logout') {
            $errors += $name
            Write-Host "[SKIP-NOPATTERN] $name" -ForegroundColor Yellow
        } else {
            $skipped++
        }
    }
}

Write-Host ""
Write-Host "=== RESULTS ==="
Write-Host "Patched: $patched"
Write-Host "Skipped (already OK): $skipped"
if ($errors.Count -gt 0) {
    Write-Host "Needs manual fix: $($errors -join ', ')" -ForegroundColor Yellow
}
