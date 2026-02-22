<#
  Repo Audit -- Agent Infrastructure Collector
  Cross-references REGISTRY.yml, AGENT.md, agent.md, workflows, rules.
  Output: docs/output/repo-audit/agent-crossref.json
  Usage: .\scripts\repo-audit-collect.ps1 [-TempDir <path>]
#>
param(
  [string]$TempDir = ""
)

$root = $PSScriptRoot | Split-Path
Set-Location $root

$outDir = Join-Path $root "docs\output\repo-audit"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host ""
Write-Host "  REPO AUDIT -- Agent Infrastructure" -ForegroundColor Cyan
Write-Host ("  " + ("=" * 45)) -ForegroundColor DarkGray
Write-Host ""

$report = @{
  timestamp       = (Get-Date -Format "yyyy-MM-dd HH:mm")
  orphan_skills   = @()
  missing_skills  = @()
  unrouted_agents = @()
  broken_commands = @()
  orphan_workflows = @()
  broken_rule_paths = @()
  stale_readmes   = @()
  keyword_overlaps = @()
  summary         = @{}
}

# ====================================================
# 1) Parse REGISTRY.yml - extract agents and skills
# ====================================================
Write-Host "  [1/7] Parsing REGISTRY.yml..." -ForegroundColor White

$registryPath = Join-Path $root ".agent\REGISTRY.yml"
$registryLines = Get-Content $registryPath

$registryAgents = @{}
$registryRouting = @()
$currentSection = ""
$currentAgent = ""
$currentRoute = $null

foreach ($line in $registryLines) {
  # Detect top-level sections
  if ($line -match '^agents:')   { $currentSection = "agents";  continue }
  if ($line -match '^routing:')  { $currentSection = "routing"; continue }
  if ($line -match '^(critical_screens|roles|version):') { $currentSection = "other"; continue }

  if ($currentSection -eq "agents") {
    # Agent name (2-space indent, no further indent)
    if ($line -match '^\s{2}(\S+):$') {
      $currentAgent = $Matches[1]
      $registryAgents[$currentAgent] = @{ skills = @(); delegates = @() }
    }
    # Skills list
    if ($currentAgent -and $line -match 'skills:\s*\[(.+)\]') {
      $skills = $Matches[1] -split ',\s*' | ForEach-Object { $_.Trim() }
      $registryAgents[$currentAgent].skills = $skills
    }
    # Delegates list
    if ($currentAgent -and $line -match 'delegates:\s*\[(.+)\]') {
      $dels = $Matches[1] -split ',\s*' | ForEach-Object { $_.Trim() }
      $registryAgents[$currentAgent].delegates = $dels
    }
  }

  if ($currentSection -eq "routing") {
    if ($line -match '^\s+-\s+id:\s+(.+)') {
      if ($currentRoute) { $registryRouting += $currentRoute }
      $currentRoute = @{ id = $Matches[1].Trim(); keywords = @(); agent = ""; also = @() }
    }
    if ($currentRoute -and $line -match '^\s+-\s+(\S+)$' -and $line -notmatch 'id:') {
      $kw = $Matches[1].Trim()
      if ($kw -ne "when_any:") { $currentRoute.keywords += $kw }
    }
    if ($currentRoute -and $line -match 'agent:\s+(.+)') {
      $currentRoute.agent = $Matches[1].Trim()
    }
    if ($currentRoute -and $line -match 'also:\s*\[(.+)\]') {
      $alsoList = $Matches[1] -split ',\s*' | ForEach-Object { $_.Trim() }
      $currentRoute.also = $alsoList
    }
  }
}
if ($currentRoute) { $registryRouting += $currentRoute }

Write-Host "    Found $($registryAgents.Count) agents, $($registryRouting.Count) routes" -ForegroundColor Green

# ====================================================
# 2) Check skills existence vs assignment
# ====================================================
Write-Host "  [2/7] Cross-referencing skills..." -ForegroundColor White

$skillDirs = Get-ChildItem -Path (Join-Path $root ".agent\skills") -Directory | Select-Object -ExpandProperty Name

# All skills referenced in REGISTRY
$referencedSkills = @()
foreach ($agent in $registryAgents.Keys) {
  $referencedSkills += $registryAgents[$agent].skills
}
$referencedSkills = $referencedSkills | Sort-Object -Unique

# Orphan skills: exist as dirs but not in REGISTRY
foreach ($dir in $skillDirs) {
  if ($dir -notin $referencedSkills) {
    $report.orphan_skills += $dir
    Write-Host "    ORPHAN skill: $dir" -ForegroundColor Yellow
  }
}

# Missing skills: in REGISTRY but no dir
foreach ($skill in $referencedSkills) {
  if ($skill -notin $skillDirs) {
    $report.missing_skills += $skill
    Write-Host "    MISSING skill dir: $skill" -ForegroundColor Red
  }
}

Write-Host "    $($skillDirs.Count) dirs, $($referencedSkills.Count) referenced, $($report.orphan_skills.Count) orphans, $($report.missing_skills.Count) missing" -ForegroundColor Green

# ====================================================
# 3) Check agents have AGENT.md + routing
# ====================================================
Write-Host "  [3/7] Checking agent definitions..." -ForegroundColor White

$agentDirs = Get-ChildItem -Path (Join-Path $root ".agent\agents") -Directory | Select-Object -ExpandProperty Name
$routedAgents = ($registryRouting | ForEach-Object { $_.agent }) + ($registryRouting | ForEach-Object { $_.also } | ForEach-Object { $_ }) | Sort-Object -Unique

foreach ($agent in $registryAgents.Keys) {
  # Check AGENT.md exists
  $agentMd = Join-Path $root ".agent\agents\$agent\AGENT.md"
  if (-not (Test-Path $agentMd)) {
    $report.unrouted_agents += @{ agent = $agent; issue = "No AGENT.md file" }
    Write-Host "    NO AGENT.md: $agent" -ForegroundColor Red
  }
  # Check agent appears in routing (unless orchestrator)
  if ($agent -ne "orchestrator" -and $agent -notin $routedAgents) {
    $report.unrouted_agents += @{ agent = $agent; issue = "Not in routing table" }
    Write-Host "    NOT ROUTED: $agent" -ForegroundColor Yellow
  }
}

# ====================================================
# 4) Check domain agent.md commands vs package.json
# ====================================================
Write-Host "  [4/7] Validating domain agent.md commands..." -ForegroundColor White

$packageJson = Get-Content (Join-Path $root "package.json") -Raw | ConvertFrom-Json
$npmScripts = $packageJson.scripts.PSObject.Properties.Name

$domainAgents = @("pages\agent.md", "assets\agent.md", "scripts\agent.md")
foreach ($da in $domainAgents) {
  $daPath = Join-Path $root $da
  if (Test-Path $daPath) {
    $content = Get-Content $daPath -Raw
    # Find npm run commands
    $matches = [regex]::Matches($content, 'npm\s+run\s+(\S+)')
    foreach ($m in $matches) {
      $cmd = $m.Groups[1].Value
      if ($cmd -notin $npmScripts) {
        $report.broken_commands += @{ file = $da; command = "npm run $cmd" }
        Write-Host "    BROKEN cmd in ${da}: npm run $cmd" -ForegroundColor Red
      }
    }
  }
}

# ====================================================
# 5) Check workflows — are they referenced anywhere?
# ====================================================
Write-Host "  [5/7] Checking workflow references..." -ForegroundColor White

$workflowDir = Join-Path $root ".agent\workflows"
if (Test-Path $workflowDir) {
  $workflows = Get-ChildItem -Path $workflowDir -Filter "*.md" | Select-Object -ExpandProperty Name
  foreach ($wf in $workflows) {
    $wfBaseName = [System.IO.Path]::GetFileNameWithoutExtension($wf)
    # Search for references in AGENT.md files and REGISTRY
    $found = $false
    $searchDirs = @(
      (Join-Path $root ".agent\agents"),
      (Join-Path $root ".agent\skills"),
      (Join-Path $root ".agent")
    )
    foreach ($sd in $searchDirs) {
      if (Test-Path $sd) {
        $grep = Get-ChildItem -Path $sd -Recurse -Include "*.md","*.yml" -ErrorAction SilentlyContinue |
                Select-String -Pattern $wfBaseName -SimpleMatch -ErrorAction SilentlyContinue
        if ($grep) { $found = $true; break }
      }
    }
    # Also check domain agent.md files
    foreach ($da in $domainAgents) {
      $daPath = Join-Path $root $da
      if ((Test-Path $daPath) -and (Select-String -Path $daPath -Pattern $wfBaseName -SimpleMatch -Quiet)) {
        $found = $true; break
      }
    }
    if (-not $found) {
      $report.orphan_workflows += $wf
      Write-Host "    ORPHAN workflow: $wf" -ForegroundColor Yellow
    }
  }
}

Write-Host "    $($workflows.Count) workflows, $($report.orphan_workflows.Count) orphans" -ForegroundColor Green

# ====================================================
# 6) Check rules — do referenced paths exist?
# ====================================================
Write-Host "  [6/7] Validating rule file paths..." -ForegroundColor White

$rulesDir = Join-Path $root ".agent\rules"
if (Test-Path $rulesDir) {
  $ruleFiles = Get-ChildItem -Path $rulesDir -Filter "*.md"
  foreach ($rf in $ruleFiles) {
    $content = Get-Content $rf.FullName -Raw
    # Find path-like references (docs/*, assets/*, .agent/*)
    $pathMatches = [regex]::Matches($content, '(?:docs|assets|pages|scripts|\.agent|supabase)/[\w\-/\*\.]+')
    foreach ($pm in $pathMatches) {
      $refPath = $pm.Value -replace '\*.*', ''   # strip glob
      $refPath = $refPath.TrimEnd('/')
      $fullRef = Join-Path $root $refPath
      if ($refPath -and -not (Test-Path $fullRef)) {
        $report.broken_rule_paths += @{ rule = $rf.Name; path = $pm.Value }
        Write-Host "    BROKEN path in $($rf.Name): $($pm.Value)" -ForegroundColor Red
      }
    }
  }
}

# ====================================================
# 7) Detect keyword overlaps in routing
# ====================================================
Write-Host "  [7/7] Detecting routing keyword overlaps..." -ForegroundColor White

$kwMap = @{}
foreach ($route in $registryRouting) {
  foreach ($kw in $route.keywords) {
    if (-not $kwMap[$kw]) { $kwMap[$kw] = @() }
    $kwMap[$kw] += $route.id
  }
}
foreach ($kw in $kwMap.Keys) {
  if ($kwMap[$kw].Count -gt 1) {
    $report.keyword_overlaps += @{ keyword = $kw; routes = $kwMap[$kw] }
    Write-Host "    OVERLAP: '$kw' in routes: $($kwMap[$kw] -join ', ')" -ForegroundColor Yellow
  }
}

# ====================================================
# Summary
# ====================================================
$report.summary = @{
  total_agents     = $registryAgents.Count
  total_skills     = $skillDirs.Count
  total_routes     = $registryRouting.Count
  total_workflows  = $workflows.Count
  issues_found     = $report.orphan_skills.Count + $report.missing_skills.Count +
                     $report.unrouted_agents.Count + $report.broken_commands.Count +
                     $report.orphan_workflows.Count + $report.broken_rule_paths.Count +
                     $report.keyword_overlaps.Count
}

# ====================================================
# Output
# ====================================================
$outFile = Join-Path $outDir "agent-crossref.json"
$report | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding utf8
Write-Host ""
Write-Host "  Saved: $outFile" -ForegroundColor Green
Write-Host "  Issues: $($report.summary.issues_found)" -ForegroundColor $(if ($report.summary.issues_found -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# --- Done marker ---
if ($TempDir) {
  New-Item -Path (Join-Path $TempDir "repo-audit-collect.done") -ItemType File -Force | Out-Null
}
