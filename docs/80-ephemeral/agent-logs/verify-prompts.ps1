$pages = @{
          'pages\encargados\encargado-barra-noche.html' = 'encargado-barra-noche'
          'pages\encargados\encargado-caja-noche.html'  = 'encargado-caja-noche'
          'pages\encargados\encargado-recepcion.html'   = 'encargado-recepcion'
          'pages\admin\admin-workdays.html'             = 'admin-workdays'
          'pages\admin\admin-config.html'               = 'admin-config'
          'pages\admin\admin-reportes.html'             = 'admin-reportes'
          'pages\admin\admin-semanal.html'              = 'admin-semanal'
          'pages\operativo\operativo-solicitudes.html'  = 'operativo-solicitudes'
          'pages\operativo\operativo-analisis.html'     = 'operativo-analisis'
          'pages\operativo\cms-members.html'            = 'cms-members'
          'pages\staff\staff-caja-index.html'           = 'staff-caja-index'
          'pages\logistica\logistica-index.html'        = 'logistica-index'
}

Write-Host "VERIFICATION REPORT" -ForegroundColor Cyan
Write-Host ("=" * 70)

# 1. Check file existence
Write-Host "`n[1] FILE EXISTENCE" -ForegroundColor Yellow
foreach ($path in $pages.Keys) {
          $ex = Test-Path $path
          $icon = if ($ex) { "OK" } else { "MISSING" }
          $color = if ($ex) { 'Green' } else { 'Red' }
          Write-Host ("  {0,-50} {1}" -f $path, $icon) -ForegroundColor $color
}

# 2. Check meta desc
Write-Host "`n[2] META DESCRIPTION STATUS" -ForegroundColor Yellow
foreach ($path in $pages.Keys) {
          if (-not (Test-Path $path)) { continue }
          $raw = Get-Content $path -Raw
          $has = $raw -match 'name="description"'
          $icon = if ($has) { "HAS-META" } else { "NO-META" }
          $color = if ($has) { 'Green' } else { 'Red' }
          Write-Host ("  {0,-50} {1}" -f (Split-Path $path -Leaf), $icon) -ForegroundColor $color
}

# 3. Check theme-color anchor exists
Write-Host "`n[3] THEME-COLOR ANCHOR (insertion point)" -ForegroundColor Yellow
foreach ($path in $pages.Keys) {
          if (-not (Test-Path $path)) { continue }
          $raw = Get-Content $path -Raw
          $has = $raw -match 'name="theme-color"'
          $icon = if ($has) { "OK" } else { "NO-ANCHOR" }
          Write-Host ("  {0,-50} {1}" -f (Split-Path $path -Leaf), $icon) -ForegroundColor $(if ($has) { 'Green' } else { 'Yellow' })
}

# 4. Staff barra
Write-Host "`n[4] STAFF-BARRA-INDEX CHECKS" -ForegroundColor Yellow
$sbPath = 'pages\staff\staff-barra-index.html'
$sbContent = Get-Content $sbPath
Write-Host ("  Line 93: " + $sbContent[92].Trim())
Write-Host ("  Line 96: " + $sbContent[95].Trim())
Write-Host ("  JS module exists: " + (Test-Path 'assets\js\modules\staff\staff-barra-index.js'))
Write-Host ("  Staff JS dir contents:")
Get-ChildItem 'assets\js\modules\staff' -EA SilentlyContinue | ForEach-Object { Write-Host ("    " + $_.Name) }

# 5. Balance semanal location
Write-Host "`n[5] BALANCE-SEMANAL LOCATION" -ForegroundColor Yellow
Get-ChildItem 'pages' -Recurse -Filter 'balance*' -EA SilentlyContinue | ForEach-Object { Write-Host ("  " + $_.FullName) }
