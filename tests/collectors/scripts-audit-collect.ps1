<#
  Repo Audit -- Scripts Health Collector
  Validates scripts/, cross-references package.json, maps outputs, checks supabase.
  Output: docs/80-ephemeral/agent-logs/repo-audit/scripts-health.json
  Usage: .\scripts\scripts-audit-collect.ps1 [-TempDir <path>]
#>
param(
  [string]$TempDir = ""
)

$root = $PSScriptRoot | Split-Path
Set-Location $root

$outDir = Join-Path $root "docs\output\repo-audit"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host ""
Write-Host "  REPO AUDIT -- Scripts Health" -ForegroundColor Cyan
Write-Host ("  " + ("=" * 45)) -ForegroundColor DarkGray
Write-Host ""

$scriptsDir = Join-Path $root "scripts"

$report = @{
  timestamp         = (Get-Date -Format "yyyy-MM-dd HH:mm")
  all_scripts       = @()
  dead_scripts      = @()
  broken_references = @()
  npm_script_map    = @()
  output_map        = @()
  readme_issues     = @()
  migration_status  = @{}
  summary           = @{}
}

# ====================================================
# 1) Inventory all scripts
# ====================================================
Write-Host "  [1/6] Inventorying scripts..." -ForegroundColor White

$scriptFiles = Get-ChildItem -Path $scriptsDir -File -ErrorAction SilentlyContinue |
               Where-Object { $_.Extension -in @(".ps1", ".js", ".mjs", ".py") }

foreach ($sf in $scriptFiles) {
  $report.all_scripts += @{
    name     = $sf.Name
    ext      = $sf.Extension
    size_kb  = [math]::Round($sf.Length / 1024, 1)
    modified = $sf.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
  }
}

Write-Host "    $($scriptFiles.Count) scripts found" -ForegroundColor Green

# ====================================================
# 2) Cross-reference with package.json
# ====================================================
Write-Host "  [2/6] Cross-referencing package.json commands..." -ForegroundColor White

$packageJson = Get-Content (Join-Path $root "package.json") -Raw | ConvertFrom-Json
$npmScripts = $packageJson.scripts.PSObject.Properties

foreach ($ns in $npmScripts) {
  $cmd = $ns.Value
  # Extract script file path from command
  $scriptRef = $null
  if ($cmd -match 'node\s+(\S+)') {
    $scriptRef = $Matches[1]
  }
  $exists = $false
  if ($scriptRef) {
    $fullPath = Join-Path $root $scriptRef
    $exists = Test-Path $fullPath
  }

  $report.npm_script_map += @{
    npm_name   = $ns.Name
    command    = $cmd
    script_ref = $scriptRef
    exists     = $exists
  }

  if ($scriptRef -and -not $exists) {
    Write-Host "    BROKEN npm script '$($ns.Name)': $scriptRef NOT FOUND" -ForegroundColor Red
  }
}

# ====================================================
# 3) Find dead scripts (not referenced anywhere)
# ====================================================
Write-Host "  [3/6] Finding unreferenced scripts..." -ForegroundColor White

# Collect all references to scripts from: package.json, workflows, agent.md, AGENT.md, skills
$allReferences = @()

# From package.json
foreach ($ns in $npmScripts) {
  $allReferences += $ns.Value
}

# From workflows
$workflowDir = Join-Path $root ".agent\workflows"
if (Test-Path $workflowDir) {
  $wfFiles = Get-ChildItem -Path $workflowDir -Filter "*.md" -ErrorAction SilentlyContinue
  foreach ($wf in $wfFiles) {
    $allReferences += (Get-Content $wf.FullName -Raw)
  }
}

# From agent.md files
$agentMdFiles = @("pages\agent.md", "assets\agent.md", "scripts\agent.md")
foreach ($am in $agentMdFiles) {
  $amPath = Join-Path $root $am
  if (Test-Path $amPath) {
    $allReferences += (Get-Content $amPath -Raw)
  }
}

# From AGENT.md files
$agentDirs = Get-ChildItem -Path (Join-Path $root ".agent\agents") -Directory -ErrorAction SilentlyContinue
foreach ($ad in $agentDirs) {
  $mdPath = Join-Path $ad.FullName "AGENT.md"
  if (Test-Path $mdPath) {
    $allReferences += (Get-Content $mdPath -Raw)
  }
}

# From skills
$skillDirs = Get-ChildItem -Path (Join-Path $root ".agent\skills") -Directory -ErrorAction SilentlyContinue
foreach ($sd in $skillDirs) {
  $skillMd = Join-Path $sd.FullName "SKILL.md"
  if (Test-Path $skillMd) {
    $allReferences += (Get-Content $skillMd -Raw)
  }
}

# From other scripts (cross-references)
foreach ($sf in $scriptFiles) {
  $allReferences += (Get-Content $sf.FullName -Raw -ErrorAction SilentlyContinue)
}

$refBlob = $allReferences -join "`n"

foreach ($sf in $scriptFiles) {
  # Check if the script's name (without extension sometimes) appears anywhere
  $baseName = $sf.BaseName
  $fullName = $sf.Name
  # Use simple contains check
  $isReferenced = $refBlob -match [regex]::Escape($fullName)
  if (-not $isReferenced) {
    # Also check basename (some references omit extension)
    $isReferenced = $refBlob -match [regex]::Escape($baseName)
  }
  # A script always references itself, so we need at least 2 mentions
  # Simpler: check if it's referenced OUTSIDE its own file
  $selfRef = Get-Content $sf.FullName -Raw -ErrorAction SilentlyContinue
  $otherRefs = $refBlob.Replace($selfRef, "")

  $isExternal = $otherRefs -match [regex]::Escape($fullName)
  if (-not $isExternal) {
    $isExternal = $otherRefs -match [regex]::Escape($baseName)
  }

  if (-not $isExternal) {
    $report.dead_scripts += @{
      name     = $fullName
      size_kb  = [math]::Round($sf.Length / 1024, 1)
      modified = $sf.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
    }
    Write-Host "    UNREFERENCED: $fullName" -ForegroundColor Yellow
  }
}

Write-Host "    $($report.dead_scripts.Count) unreferenced scripts" -ForegroundColor $(if ($report.dead_scripts.Count -gt 0) { "Yellow" } else { "Green" })

# ====================================================
# 4) Check script internal references (require/source)
# ====================================================
Write-Host "  [4/6] Checking internal references..." -ForegroundColor White

foreach ($sf in $scriptFiles) {
  $content = Get-Content $sf.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }

  # JS: require('./path') or import from './path'
  if ($sf.Extension -in @(".js", ".mjs")) {
    $reqMatches = [regex]::Matches($content, '(?:require|from)\s*\(?["''](\.[\/][^"'']+)["'']')
    foreach ($rm in $reqMatches) {
      $refPath = $rm.Groups[1].Value
      $resolved = Join-Path (Split-Path $sf.FullName) $refPath
      if (-not (Test-Path $resolved) -and -not (Test-Path "$resolved.js") -and -not (Test-Path "$resolved.mjs")) {
        $report.broken_references += @{ script = $sf.Name; ref = $refPath; type = "require/import" }
        Write-Host "    BROKEN ref in $($sf.Name): $refPath" -ForegroundColor Red
      }
    }
  }

  # PS1: dot-source or call operator
  if ($sf.Extension -eq ".ps1") {
    $dotMatches = [regex]::Matches($content, '\.\s+["''](\.[\\/][\w\-\\/\.]+)["'']')
    foreach ($dm in $dotMatches) {
      $refPath = $dm.Groups[1].Value
      $resolved = Join-Path (Split-Path $sf.FullName) $refPath
      if (-not (Test-Path $resolved)) {
        $report.broken_references += @{ script = $sf.Name; ref = $refPath; type = "dot-source" }
        Write-Host "    BROKEN ref in $($sf.Name): $refPath" -ForegroundColor Red
      }
    }
  }
}

# ====================================================
# 5) Map script -> output paths
# ====================================================
Write-Host "  [5/6] Mapping script output paths..." -ForegroundColor White

foreach ($sf in $scriptFiles) {
  $content = Get-Content $sf.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }

  # Find paths that look like output destinations
  $outMatches = [regex]::Matches($content, '(?:docs[\\/](?:output|_generated)[\\/][\w\-\\/\.]+)')
  $outputs = @()
  foreach ($om in $outMatches) {
    $outPath = $om.Value -replace '\\', '/'
    if ($outPath -notin $outputs) { $outputs += $outPath }
  }

  if ($outputs.Count -gt 0) {
    $report.output_map += @{
      script  = $sf.Name
      outputs = $outputs
    }
  }
}

# ====================================================
# 6) Supabase migration status
# ====================================================
Write-Host "  [6/6] Checking Supabase migrations..." -ForegroundColor White

$migrationDir = Join-Path $root "supabase\migrations"
if (Test-Path $migrationDir) {
  $migrations = Get-ChildItem -Path $migrationDir -Filter "*.sql" -ErrorAction SilentlyContinue |
                Sort-Object Name
  $report.migration_status = @{
    count = $migrations.Count
    first = if ($migrations.Count -gt 0) { $migrations[0].Name } else { "none" }
    last  = if ($migrations.Count -gt 0) { $migrations[-1].Name } else { "none" }
    total_size_kb = [math]::Round(($migrations | Measure-Object -Property Length -Sum).Sum / 1024, 1)
  }
  Write-Host "    $($migrations.Count) migrations, last: $($report.migration_status.last)" -ForegroundColor Green
} else {
  $report.migration_status = @{ count = 0; status = "no migrations directory" }
  Write-Host "    No migrations directory" -ForegroundColor Yellow
}

# ====================================================
# Check scripts/README.md accuracy
# ====================================================
$readmePath = Join-Path $scriptsDir "README.md"
if (Test-Path $readmePath) {
  $readmeContent = Get-Content $readmePath -Raw
  foreach ($sf in $scriptFiles) {
    if ($readmeContent -notmatch [regex]::Escape($sf.Name)) {
      $report.readme_issues += @{
        issue  = "Script not documented in README"
        script = $sf.Name
      }
    }
  }
  if ($report.readme_issues.Count -gt 0) {
    Write-Host "    $($report.readme_issues.Count) scripts not in README.md" -ForegroundColor Yellow
  }
}

# ====================================================
# Summary
# ====================================================
$report.summary = @{
  total_scripts       = $scriptFiles.Count
  dead_scripts        = $report.dead_scripts.Count
  broken_references   = $report.broken_references.Count
  npm_scripts_mapped  = $report.npm_script_map.Count
  scripts_with_output = $report.output_map.Count
  readme_issues       = $report.readme_issues.Count
  total_issues        = $report.dead_scripts.Count + $report.broken_references.Count + $report.readme_issues.Count
}

# ====================================================
# Output
# ====================================================
$outFile = Join-Path $outDir "scripts-health.json"
$report | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding utf8
Write-Host ""
Write-Host "  Saved: $outFile" -ForegroundColor Green
Write-Host "  Issues: $($report.summary.total_issues)" -ForegroundColor $(if ($report.summary.total_issues -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# --- Done marker ---
if ($TempDir) {
  New-Item -Path (Join-Path $TempDir "scripts-audit-collect.done") -ItemType File -Force | Out-Null
}
