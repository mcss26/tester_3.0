# modularize-css.ps1
# Extracts the components.css monolith (7820 lines) into 5 modular files.
# Run from the project root.

$ErrorActionPreference = 'Stop'

$src = Join-Path $PSScriptRoot '..\assets\css\components.css'
$outDir = Join-Path $PSScriptRoot '..\assets\css'

if (-not (Test-Path $src)) {
          Write-Error "Not found: $src"
          exit 1
}

$lines = Get-Content $src -Encoding UTF8
$total = $lines.Count
Write-Host "Reading $src ($total lines)"

function Extract-Lines([int]$from, [int]$to) {
          $lines[($from - 1)..($to - 1)]
}

# === base.css: Reset, body, accessibility, workday-status ===
# Sections 1-3: L44-160
$base = @()
$base += '/* base.css - Reset, Body, Accessibility, Workday Status */'
$base += '/* Extracted from components.css monolith */'
$base += ''
$base += Extract-Lines 44 160

# === layout.css: Admin topbar, navigation, shared admin overrides ===
# Section 18 (admin topbar+nav): L1160-1277
# Section 19 (admin topbar dropdowns): L1278-1417
# Section 37 (shared admin overrides): L7504-7603
$layout = @()
$layout += '/* layout.css - Admin Topbar, Navigation, Shared Admin Overrides */'
$layout += '/* Extracted from components.css monolith */'
$layout += ''
$layout += Extract-Lines 1160 1417
$layout += ''
$layout += Extract-Lines 7504 7603

# === forms.css: Inputs, selects, checkbox, toggle, custom dropdown ===
# Section 5 (form system): L293-464
# Section 31 (toggle switch/checkbox): L7105-7157
# Section 35 (custom dropdown): L7326-7416
$forms = @()
$forms += '/* forms.css - Form System, Toggle Switch, Custom Dropdown */'
$forms += '/* Extracted from components.css monolith */'
$forms += ''
$forms += Extract-Lines 293 464
$forms += ''
$forms += Extract-Lines 7105 7157
$forms += ''
$forms += Extract-Lines 7326 7416

# === utilities.css: Utility classes + responsive media queries ===
# Section 25 (utility classes): L1774-1824
# Section 36 (utility classes inline replacement): L7605-7690
# Section 38 (responsive tablet): L7691-7749
$utils = @()
$utils += '/* utilities.css - Utility Classes, Responsive Media Queries */'
$utils += '/* Extracted from components.css monolith */'
$utils += ''
$utils += Extract-Lines 1774 1824
$utils += ''
$utils += Extract-Lines 7605 7749

# === components.css (slim): Everything else ===
$comp = @()
$comp += '/* components.css - Buttons, Cards, Modals, Toasts, Badges, Tabs, KPIs */'
$comp += '/* Modularized from 7820-line monolith */'
$comp += ''
$comp += Extract-Lines 161 292       # Buttons
$comp += ''
$comp += Extract-Lines 465 1159      # Badges -> Dropdowns (sections 6-17)
$comp += ''
$comp += Extract-Lines 1418 1773     # Progress bars -> Pre-flight (sections 20-24)
$comp += ''
$comp += Extract-Lines 1825 7104     # Big mixed block -> before toggle switch
$comp += ''
$comp += Extract-Lines 7158 7325     # Summary metrics -> Precarga stock
$comp += ''
$comp += Extract-Lines 7417 7503     # Chart KPI system
$comp += ''
$comp += Extract-Lines 7750 7820     # Empty and Error states

# === WRITE FILES ===

# Backup components.css first
$backup = Join-Path $outDir 'components.css.bak'
Copy-Item $src $backup -Force
Write-Host "Backup: $backup"

$files = @{
          'base.css'      = $base
          'layout.css'    = $layout
          'forms.css'     = $forms
          'utilities.css' = $utils
}

foreach ($name in $files.Keys) {
          $path = Join-Path $outDir $name
          $files[$name] | Out-File $path -Encoding UTF8
          Write-Host "Created: $name ($($files[$name].Count) lines)"
}

# Overwrite components.css with slim version
$comp | Out-File $src -Encoding UTF8
Write-Host "Rewritten: components.css ($($comp.Count) lines, was $total)"

# === SUMMARY ===
Write-Host ''
Write-Host '=== SUMMARY ==='
Write-Host "Original: $total lines"
$totalNew = $base.Count + $layout.Count + $forms.Count + $utils.Count + $comp.Count
Write-Host "Total in 5 files: $totalNew lines"
Write-Host "Backup at: $backup"
