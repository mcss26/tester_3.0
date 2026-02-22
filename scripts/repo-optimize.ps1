<#
  Repo Audit -- Optimizer (Consolidator)
  Reads the 3 collector JSONs and executes safe cleanup operations.
  Output: docs/80-ephemeral/agent-logs/repo-audit/optimization-report.md
  Usage: .\scripts\repo-optimize.ps1 [-TempDir <path>] [-DryRun]
#>
param(
  [string]$TempDir = "",
  [switch]$DryRun
)

$root = $PSScriptRoot | Split-Path
Set-Location $root

$auditDir = Join-Path $root "docs\output\repo-audit"

Write-Host ""
Write-Host "  REPO OPTIMIZER" -ForegroundColor Cyan
Write-Host ("  " + ("=" * 45)) -ForegroundColor DarkGray
if ($DryRun) { Write-Host "  MODE: DRY RUN (no changes)" -ForegroundColor Yellow }
else         { Write-Host "  MODE: LIVE (changes will be applied)" -ForegroundColor Red }
Write-Host ""

# --- Load collector outputs ---
$agentReport   = $null
$docsReport    = $null
$scriptsReport = $null

$path1 = Join-Path $auditDir "agent-crossref.json"
$path2 = Join-Path $auditDir "docs-waste.json"
$path3 = Join-Path $auditDir "scripts-health.json"

if (Test-Path $path1) { $agentReport   = Get-Content $path1 -Raw | ConvertFrom-Json }
else { Write-Host "  WARNING: agent-crossref.json not found" -ForegroundColor Red }

if (Test-Path $path2) { $docsReport    = Get-Content $path2 -Raw | ConvertFrom-Json }
else { Write-Host "  WARNING: docs-waste.json not found" -ForegroundColor Red }

if (Test-Path $path3) { $scriptsReport = Get-Content $path3 -Raw | ConvertFrom-Json }
else { Write-Host "  WARNING: scripts-health.json not found" -ForegroundColor Red }

# --- Action log ---
$actions = @()
$warnings = @()

function Log-Action {
  param([string]$Type, [string]$Target, [string]$Reason)
  $script:actions += @{ type = $Type; target = $Target; reason = $Reason; executed = (-not $DryRun) }
  $color = switch ($Type) {
    "DELETE"     { "Red" }
    "QUARANTINE" { "Yellow" }
    "CREATE"     { "Green" }
    default      { "White" }
  }
  $prefix = if ($DryRun) { "[DRY] " } else { "" }
  Write-Host "    $prefix$Type`: $Target" -ForegroundColor $color
}

function Log-Warning {
  param([string]$Message)
  $script:warnings += $Message
  Write-Host "    MANUAL: $Message" -ForegroundColor Magenta
}

# =========================================
# SAFE ACTIONS -- Execute automatically
# =========================================
Write-Host "  [SAFE] Automated cleanup..." -ForegroundColor White
Write-Host ""

# --- 0) Prepare quarantine directories ---
$scriptBackup = Join-Path $root "scripts\backups"
$wfBackup     = Join-Path $root ".agent\workflows\backups"
$skillBackup  = Join-Path $root ".agent\skills\backups"

if (-not $DryRun) {
  if (-not (Test-Path $scriptBackup)) { New-Item -ItemType Directory -Force -Path $scriptBackup | Out-Null }
  if (-not (Test-Path $wfBackup))     { New-Item -ItemType Directory -Force -Path $wfBackup | Out-Null }
  if (-not (Test-Path $skillBackup))  { New-Item -ItemType Directory -Force -Path $skillBackup | Out-Null }
}

# --- 1) Delete empty directories ---
if ($docsReport -and $docsReport.empty_dirs) {
  foreach ($dir in $docsReport.empty_dirs) {
    $fullPath = Join-Path $root ($dir -replace '\\', '/')
    if (Test-Path $fullPath) {
      Log-Action -Type "DELETE" -Target $dir -Reason "Empty directory"
      if (-not $DryRun) { Remove-Item -Path $fullPath -Recurse -Force }
    }
  }
}

# --- 2) Delete gitkeep-only directories (that have no actual content) ---
if ($docsReport -and $docsReport.gitkeep_only) {
  foreach ($dir in $docsReport.gitkeep_only) {
    # Only delete if it's in _generated/ (agent output dirs)
    if ($dir -match '_generated[\\/]') {
      $fullPath = Join-Path $root ($dir -replace '\\', '/')
      if (Test-Path $fullPath) {
        Log-Action -Type "DELETE" -Target $dir -Reason "Only contains .gitkeep, no agent output"
        if (-not $DryRun) { Remove-Item -Path $fullPath -Recurse -Force }
      }
    } else {
      Log-Warning "gitkeep-only dir outside _generated: $dir -- review manually"
    }
  }
}

# --- 3) Delete confirmed _generated/ui-scan duplicates ---
if ($docsReport -and $docsReport.duplicates) {
  foreach ($dupe in $docsReport.duplicates) {
    # Only auto-delete if output is newer or identical
    if ($dupe.verdict -match "safe to delete|delete _generated") {
      $genPath = Join-Path $root ($dupe.generated -replace '\\', '/')
      if (Test-Path $genPath) {
        Log-Action -Type "DELETE" -Target $dupe.generated -Reason $dupe.verdict
        if (-not $DryRun) { Remove-Item -Path $genPath -Force }
      }
    } else {
      Log-Warning "Dupe needs review: $($dupe.generated) -- $($dupe.verdict)"
    }
  }
}

# --- 4) Clean up _generated/ui-scan if now empty ---
$genUiScan = Join-Path $root "docs\_generated\ui-scan"
if ((Test-Path $genUiScan) -and -not $DryRun) {
  $remaining = Get-ChildItem -Path $genUiScan -Recurse -File -ErrorAction SilentlyContinue
  if (-not $remaining -or $remaining.Count -eq 0) {
    Log-Action -Type "DELETE" -Target "docs\_generated\ui-scan" -Reason "Empty after duplicate cleanup"
    Remove-Item -Path $genUiScan -Recurse -Force
  }
}

# --- 5) Quarantine dead scripts ---
# Build protected set from scripts/README.md (any script documented there is safe)
$readmePath = Join-Path $root "scripts\README.md"
$documentedScripts = @{}
if (Test-Path $readmePath) {
  $readmeContent = Get-Content $readmePath -Raw
  # Match ### headings that look like script filenames (e.g., ### my-script.ps1 or ### \_path-check.ps1)
  $headingMatches = [regex]::Matches($readmeContent, '###\s+(\\?[\w\-]+\.(ps1|js|mjs|py))')
  foreach ($m in $headingMatches) {
    $scriptName = $m.Groups[1].Value -replace '\\', ''
    $documentedScripts[$scriptName] = $true
  }
  Write-Host "    Protected by README: $($documentedScripts.Count) scripts" -ForegroundColor DarkGray
}

if ($scriptsReport -and $scriptsReport.dead_scripts) {
  foreach ($ds in $scriptsReport.dead_scripts) {
    # Skip scripts documented in README.md
    if ($documentedScripts.ContainsKey($ds.name)) { continue }
    $srcPath = Join-Path $root "scripts\$($ds.name)"
    if (Test-Path $srcPath) {
      Log-Action -Type "QUARANTINE" -Target "scripts/$($ds.name)" -Reason "Unreferenced and undocumented script"
      if (-not $DryRun) { Move-Item -Path $srcPath -Destination $scriptBackup -Force }
    }
  }
}

# --- 6) Quarantine orphan workflows ---
if ($agentReport -and $agentReport.orphan_workflows) {
  foreach ($wf in $agentReport.orphan_workflows) {
    $srcPath = Join-Path $root ".agent\workflows\$wf"
    if (Test-Path $srcPath) {
      Log-Action -Type "QUARANTINE" -Target ".agent/workflows/$wf" -Reason "Unreferenced workflow"
      if (-not $DryRun) { Move-Item -Path $srcPath -Destination $wfBackup -Force }
    }
  }
}

# --- 7) Quarantine orphan skills ---
if ($agentReport -and $agentReport.orphan_skills) {
  foreach ($skill in $agentReport.orphan_skills) {
    $srcPath = Join-Path $root ".agent\skills\$skill"
    if (Test-Path $srcPath) {
      Log-Action -Type "QUARANTINE" -Target ".agent/skills/$skill" -Reason "Skill not in REGISTRY.yml"
      if (-not $DryRun) { Move-Item -Path $srcPath -Destination $skillBackup -Force }
    }
  }
}

# =========================================
# MANUAL REVIEW ITEMS -- Log but don't act
# =========================================
Write-Host ""
Write-Host "  [MANUAL] Items for review..." -ForegroundColor White
Write-Host ""

# --- Missing skills ---
if ($agentReport -and $agentReport.missing_skills) {
  foreach ($skill in $agentReport.missing_skills) {
    Log-Warning "MISSING skill: '$skill' is in REGISTRY.yml but folder is missing!"
  }
}

# --- Unrouted agents ---
if ($agentReport -and $agentReport.unrouted_agents) {
  foreach ($ua in $agentReport.unrouted_agents) {
    Log-Warning "Agent issue ($($ua.agent)): $($ua.issue)"
  }
}

# --- Broken commands ---
if ($agentReport -and $agentReport.broken_commands) {
  foreach ($cmd in $agentReport.broken_commands) {
    Log-Warning "Broken command in $($cmd.file): $($cmd.command)"
  }
}

# --- Broken rule paths ---
if ($agentReport -and $agentReport.broken_rule_paths) {
  foreach ($brp in $agentReport.broken_rule_paths) {
    Log-Warning "Broken path in rule $($brp.rule): $($brp.path)"
  }
}

# --- Broken script references ---
if ($scriptsReport -and $scriptsReport.broken_references) {
  foreach ($br in $scriptsReport.broken_references) {
    Log-Warning "Broken $($br.type) in $($br.script): $($br.ref)"
  }
}

# --- Broken NPM scripts ---
if ($scriptsReport -and $scriptsReport.npm_script_map) {
  foreach ($ns in $scriptsReport.npm_script_map) {
    if ($ns.script_ref -and -not $ns.exists) {
      Log-Warning "Broken npm script '$($ns.npm_name)': $($ns.script_ref) not found"
    }
  }
}

# --- Keyword overlaps ---
if ($agentReport -and $agentReport.keyword_overlaps) {
  foreach ($ko in $agentReport.keyword_overlaps) {
    Log-Warning "Keyword '$($ko.keyword)' appears in routes: $($ko.routes -join ', ')"
  }
}

# --- Naming violations ---
if ($docsReport -and $docsReport.naming_violations -and $docsReport.naming_violations.Count -gt 0) {
  Log-Warning "$($docsReport.naming_violations.Count) naming violations in docs/80-ephemeral/agent-logs (see docs-waste.json)"
}

# --- Stubs ---
if ($docsReport -and $docsReport.stubs -and $docsReport.stubs.Count -gt 0) {
  foreach ($stub in $docsReport.stubs) {
    Log-Warning "Stub file ($($stub.bytes)): $($stub.path)"
  }
}

# --- Dead references ---
if ($docsReport -and $docsReport.dead_refs -and $docsReport.dead_refs.Count -gt 0) {
  Log-Warning "$($docsReport.dead_refs.Count) dead references in docs/ markdown files (see docs-waste.json)"
}

# --- Script README issues ---
if ($scriptsReport -and $scriptsReport.readme_issues) {
  foreach ($ri in $scriptsReport.readme_issues) {
    Log-Warning "README issue: $($ri.script) is not documented in scripts/README.md"
  }
}

# =========================================
# Generate optimization report
# =========================================
Write-Host ""
Write-Host "  Generating report..." -ForegroundColor White

$reportMd = @"
# Repo Optimization Report

Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm")
Mode: $(if ($DryRun) { "DRY RUN" } else { "LIVE" })

---

## Actions Executed

| # | Type | Target | Reason |
|:--|:-----|:-------|:-------|
"@

$i = 1
foreach ($a in $actions) {
  $reportMd += "`n| $i | $($a.type) | $($a.target) | $($a.reason) |"
  $i++
}
if ($actions.Count -eq 0) { $reportMd += "`n| - | - | No automated actions taken | - |" }

$reportMd += @"


---

## Manual Review Required

"@

$j = 1
foreach ($w in $warnings) {
  $reportMd += "`n$j. $w"
  $j++
}
if ($warnings.Count -eq 0) { $reportMd += "`nNo manual review items." }

$reportMd += @"


---

## Source Reports

- Agent cross-ref: ``docs/80-ephemeral/agent-logs/repo-audit/agent-crossref.json``
- Docs waste: ``docs/80-ephemeral/agent-logs/repo-audit/docs-waste.json``
- Scripts health: ``docs/80-ephemeral/agent-logs/repo-audit/scripts-health.json``

## Summary

- **Automated actions:** $($actions.Count)
- **Manual review items:** $($warnings.Count)
"@

$reportPath = Join-Path $auditDir "optimization-report.md"
$reportMd | Out-File -FilePath $reportPath -Encoding utf8

Write-Host ""
Write-Host "  Saved: $reportPath" -ForegroundColor Green
Write-Host "  Actions executed: $($actions.Count)" -ForegroundColor $(if ($actions.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "  Manual items: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# --- Done marker ---
if ($TempDir) {
  New-Item -Path (Join-Path $TempDir "repo-optimize.done") -ItemType File -Force | Out-Null
}
