$pages = @(
          'pages\encargados\encargado-barra-noche.html',
          'pages\encargados\encargado-caja-noche.html',
          'pages\encargados\encargado-recepcion.html',
          'pages\admin\admin-workdays.html',
          'pages\admin\admin-config.html',
          'pages\admin\admin-reportes.html',
          'pages\admin\admin-semanal.html',
          'pages\operativo\operativo-solicitudes.html',
          'pages\operativo\operativo-analisis.html',
          'pages\operativo\cms-members.html',
          'pages\staff\staff-caja-index.html',
          'pages\staff\balance-semanal.html',
          'pages\logistica\logistica-index.html'
)

Write-Host "`nPATTERN ANALYSIS - 13 Partial Pages`n" -ForegroundColor Cyan
Write-Host ("{0,-35} {1}" -f "PAGE", "MISSING GS PATTERNS") -ForegroundColor Yellow
Write-Host ("-" * 90)

$allIssues = @{}

foreach ($p in $pages) {
          $content = Get-Content $p -Raw -EA SilentlyContinue
          if (-not $content) { Write-Host ("{0,-35} MISSING" -f (Split-Path $p -Leaf)) -ForegroundColor Red; continue }
  
          $cls = [regex]::Matches($content, 'class\s*=\s*"([^"]*)"') | ForEach-Object { $_.Groups[1].Value -split '\s+' } | Sort-Object -Unique
          $name = Split-Path $p -Leaf
          $checks = @()
  
          # Breadcrumb completeness
          if ('breadcrumb-link' -notin $cls -and 'breadcrumb' -in $cls) { 
                    $checks += 'NO-breadcrumb-link'
                    if (-not $allIssues.ContainsKey('NO-breadcrumb-link')) { $allIssues['NO-breadcrumb-link'] = 0 }
                    $allIssues['NO-breadcrumb-link']++
          }
          if ('breadcrumb-sep' -notin $cls -and 'breadcrumb' -in $cls) { 
                    $checks += 'NO-breadcrumb-sep'
                    if (-not $allIssues.ContainsKey('NO-breadcrumb-sep')) { $allIssues['NO-breadcrumb-sep'] = 0 }
                    $allIssues['NO-breadcrumb-sep']++
          }
  
          # Actions bar
          if ('actions-bar' -notin $cls -and 'dashboard-header' -in $cls) { 
                    $checks += 'NO-actions-bar'
                    if (-not $allIssues.ContainsKey('NO-actions-bar')) { $allIssues['NO-actions-bar'] = 0 }
                    $allIssues['NO-actions-bar']++
          }
  
          # Metrics
          if ('summary-metrics-container' -notin $cls -and 'summary-metrics-grid' -notin $cls) { 
                    $checks += 'NO-metrics'
                    if (-not $allIssues.ContainsKey('NO-metrics')) { $allIssues['NO-metrics'] = 0 }
                    $allIssues['NO-metrics']++
          }
  
          # Native selects without custom-dropdown.js
          $nSel = ([regex]::Matches($content, '<select[\s>]')).Count
          $hasDDJS = $content -match 'custom-dropdown\.js'
          if ($nSel -gt 0 -and -not $hasDDJS) { 
                    $checks += "nativeSelect($nSel)"
                    if (-not $allIssues.ContainsKey('nativeSelect-no-JS')) { $allIssues['nativeSelect-no-JS'] = 0 }
                    $allIssues['nativeSelect-no-JS']++
          }
  
          # Inline styles
          $inlCount = ([regex]::Matches($content, 'style\s*=\s*"[^"]*"')).Count
          if ($inlCount -gt 0) { 
                    $checks += "inline($inlCount)"
                    if (-not $allIssues.ContainsKey('inline-styles')) { $allIssues['inline-styles'] = 0 }
                    $allIssues['inline-styles']++
          }
  
          # Table without table-scroll wrapper
          $hasTables = $content -match '<table[\s>]'
          if ($hasTables -and 'table-scroll' -notin $cls) { 
                    $checks += 'NO-table-scroll'
                    if (-not $allIssues.ContainsKey('NO-table-scroll')) { $allIssues['NO-table-scroll'] = 0 }
                    $allIssues['NO-table-scroll']++
          }
  
          # Missing meta description
          if ($content -notmatch 'meta\s+name\s*=\s*"description"') {
                    $checks += 'NO-meta-desc'
                    if (-not $allIssues.ContainsKey('NO-meta-description')) { $allIssues['NO-meta-description'] = 0 }
                    $allIssues['NO-meta-description']++
          }
  
          # Missing dashboard-title-soft (content pages should use soft variant)
          if ('dashboard-title' -in $cls -and 'dashboard-title-soft' -notin $cls) {
                    $checks += 'NO-title-soft'
                    if (-not $allIssues.ContainsKey('NO-title-soft')) { $allIssues['NO-title-soft'] = 0 }
                    $allIssues['NO-title-soft']++
          }
  
          # ARIA coverage
          $ariaCount = ([regex]::Matches($content, 'aria-label\s*=')).Count
          $btnCount = ([regex]::Matches($content, '<button[\s>]')).Count
          $inputCount = ([regex]::Matches($content, '<input[\s>]')).Count
          $interactiveCount = $btnCount + $inputCount
          if ($interactiveCount -gt 0 -and $ariaCount -lt [math]::Floor($interactiveCount * 0.5)) {
                    $checks += "LOW-aria($ariaCount/$interactiveCount)"
                    if (-not $allIssues.ContainsKey('LOW-aria')) { $allIssues['LOW-aria'] = 0 }
                    $allIssues['LOW-aria']++
          }
  
          # navigation.js without defer
          if ($content -match '<script\s+src="[^"]*navigation\.js"' -and $content -notmatch '<script\s+defer\s+src="[^"]*navigation\.js"') {
                    $checks += 'navJS-no-defer'
                    if (-not $allIssues.ContainsKey('navJS-no-defer')) { $allIssues['navJS-no-defer'] = 0 }
                    $allIssues['navJS-no-defer']++
          }
  
          $result = if ($checks.Count -eq 0) { "CLEAN" } else { $checks -join ', ' }
          $color = if ($checks.Count -eq 0) { 'Green' } elseif ($checks.Count -le 2) { 'Yellow' } else { 'Red' }
          Write-Host ("{0,-35} {1}" -f $name, $result) -ForegroundColor $color
}

Write-Host "`n"
Write-Host ("=" * 90)
Write-Host "`nSYSTEMIC PATTERNS (sorted by frequency):`n" -ForegroundColor Cyan

$allIssues.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
          $pct = [math]::Round(($_.Value / 13) * 100)
          $bar = '#' * [math]::Min($_.Value, 13)
          Write-Host ("  {0,-25} {1,2} pages ({2,3}%)  {3}" -f $_.Key, $_.Value, $pct, $bar) -ForegroundColor $(if ($_.Value -ge 8) { 'Red' } elseif ($_.Value -ge 4) { 'Yellow' } else { 'DarkGray' })
}
