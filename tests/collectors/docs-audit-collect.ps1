<#
  Repo Audit -- Docs Structure Collector
  Scans docs/ for empty dirs, duplicates, naming violations, stubs, dead refs.
  Output: docs/80-ephemeral/agent-logs/repo-audit/docs-waste.json
  Usage: .\scripts\docs-audit-collect.ps1 [-TempDir <path>]
#>
param(
  [string]$TempDir = ""
)

$root = $PSScriptRoot | Split-Path
Set-Location $root

$outDir = Join-Path $root "docs\output\repo-audit"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host ""
Write-Host "  REPO AUDIT -- Docs Structure" -ForegroundColor Cyan
Write-Host ("  " + ("=" * 45)) -ForegroundColor DarkGray
Write-Host ""

$docsRoot = Join-Path $root "docs"

$report = @{
  timestamp          = (Get-Date -Format "yyyy-MM-dd HH:mm")
  empty_dirs         = @()
  duplicates         = @()
  naming_violations  = @()
  stubs              = @()
  dead_refs          = @()
  size_heatmap       = @()
  gitkeep_only       = @()
  summary            = @{}
}

# ====================================================
# 1) Find empty dirs and gitkeep-only dirs
# ====================================================
Write-Host "  [1/6] Scanning for empty directories..." -ForegroundColor White

$allDirs = Get-ChildItem -Path $docsRoot -Directory -Recurse -ErrorAction SilentlyContinue
foreach ($dir in $allDirs) {
  $children = Get-ChildItem -Path $dir.FullName -Force -ErrorAction SilentlyContinue
  $relativePath = $dir.FullName.Substring($root.Length + 1)

  if (-not $children -or $children.Count -eq 0) {
    $report.empty_dirs += $relativePath
    Write-Host "    EMPTY: $relativePath" -ForegroundColor Yellow
  }
  elseif ($children.Count -eq 1 -and $children[0].Name -eq ".gitkeep") {
    $report.gitkeep_only += $relativePath
    Write-Host "    GITKEEP-ONLY: $relativePath" -ForegroundColor Yellow
  }
}

# ====================================================
# 2) Find _generated vs output duplicates (by filename)
# ====================================================
Write-Host "  [2/6] Checking _generated vs output overlap..." -ForegroundColor White

$generatedDir = Join-Path $docsRoot "_generated"
$outputDir = Join-Path $docsRoot "output"

if ((Test-Path $generatedDir) -and (Test-Path $outputDir)) {
  $genFiles = Get-ChildItem -Path $generatedDir -Recurse -File -ErrorAction SilentlyContinue
  $outFiles = Get-ChildItem -Path $outputDir -Recurse -File -ErrorAction SilentlyContinue

  $outFileNames = @{}
  foreach ($of in $outFiles) {
    $outFileNames[$of.Name] = @{
      path     = $of.FullName.Substring($root.Length + 1)
      modified = $of.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
      size     = $of.Length
    }
  }

  foreach ($gf in $genFiles) {
    if ($outFileNames.ContainsKey($gf.Name)) {
      $genRel = $gf.FullName.Substring($root.Length + 1)
      $outInfo = $outFileNames[$gf.Name]

      # Compare file hashes
      $genHash = (Get-FileHash $gf.FullName -Algorithm MD5).Hash
      $outHash = (Get-FileHash (Join-Path $root $outInfo.path) -Algorithm MD5).Hash
      $identical = $genHash -eq $outHash

      $genMod = $gf.LastWriteTime.ToString("yyyy-MM-dd HH:mm")

      $verdict = if ($identical) { "IDENTICAL -- safe to delete _generated copy" }
                 elseif ($outInfo.modified -gt $genMod) { "output is NEWER -- delete _generated" }
                 else { "generated is NEWER -- review before deleting" }

      $report.duplicates += @{
        generated      = $genRel
        output         = $outInfo.path
        identical      = $identical
        gen_modified   = $genMod
        out_modified   = $outInfo.modified
        verdict        = $verdict
      }
      Write-Host "    DUPE: $($gf.Name) -> $verdict" -ForegroundColor Yellow
    }
  }
}

# ====================================================
# 3) Naming convention violations in _generated/
# ====================================================
Write-Host "  [3/6] Checking naming conventions in _generated/..." -ForegroundColor White

# Convention: {YYYY-MM-DD}_{type}_{topic}.md  OR  README.md / .gitkeep
$validPattern = '^\d{4}-\d{2}-\d{2}_[a-z\-]+_[a-z\-]+\.md$'
$exemptNames = @("README.md", ".gitkeep", "CHANGELOG.md")

if (Test-Path $generatedDir) {
  $genFiles = Get-ChildItem -Path $generatedDir -Recurse -File -ErrorAction SilentlyContinue
  foreach ($gf in $genFiles) {
    if ($gf.Name -in $exemptNames) { continue }
    if ($gf.Name -notmatch $validPattern) {
      $genRel = $gf.FullName.Substring($root.Length + 1)
      $report.naming_violations += @{
        path   = $genRel
        name   = $gf.Name
        reason = "Does not match {YYYY-MM-DD}_{type}_{topic}.md"
      }
    }
  }
  if ($report.naming_violations.Count -gt 0) {
    Write-Host "    $($report.naming_violations.Count) naming violations" -ForegroundColor Yellow
  } else {
    Write-Host "    All names compliant" -ForegroundColor Green
  }
}

# ====================================================
# 4) Stub files (< 500 bytes, non-.gitkeep)
# ====================================================
Write-Host "  [4/6] Finding stub files..." -ForegroundColor White

$allDocFiles = Get-ChildItem -Path $docsRoot -Recurse -File -ErrorAction SilentlyContinue |
               Where-Object { $_.Name -ne ".gitkeep" -and $_.Extension -in @(".md", ".txt", ".json") }

foreach ($df in $allDocFiles) {
  if ($df.Length -lt 500) {
    $relPath = $df.FullName.Substring($root.Length + 1)
    $report.stubs += @{
      path  = $relPath
      size  = $df.Length
      bytes = "$($df.Length) bytes"
    }
  }
}

if ($report.stubs.Count -gt 0) {
  Write-Host "    $($report.stubs.Count) stubs (< 500 bytes)" -ForegroundColor Yellow
} else {
  Write-Host "    No stubs found" -ForegroundColor Green
}

# ====================================================
# 5) Dead references (md files linking to non-existent paths)
# ====================================================
Write-Host "  [5/6] Checking for dead internal references..." -ForegroundColor White

$mdFiles = Get-ChildItem -Path $docsRoot -Recurse -Include "*.md" -File -ErrorAction SilentlyContinue
foreach ($mf in $mdFiles) {
  $content = Get-Content $mf.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }

  # Find markdown links: [text](path)
  $linkMatches = [regex]::Matches($content, '\[([^\]]*)\]\(([^)]+)\)')
  foreach ($lm in $linkMatches) {
    $linkTarget = $lm.Groups[2].Value
    # Skip external URLs, anchors, mailto
    if ($linkTarget -match '^(https?://|#|mailto:)') { continue }
    # Resolve relative path from the file's directory
    $fileDir = Split-Path $mf.FullName
    $resolved = Join-Path $fileDir $linkTarget
    # Normalize
    try {
      $normalized = [System.IO.Path]::GetFullPath($resolved)
    } catch { continue }

    if (-not (Test-Path $normalized)) {
      $relFile = $mf.FullName.Substring($root.Length + 1)
      $report.dead_refs += @{
        file   = $relFile
        target = $linkTarget
      }
    }
  }
}

if ($report.dead_refs.Count -gt 0) {
  Write-Host "    $($report.dead_refs.Count) dead references" -ForegroundColor Yellow
} else {
  Write-Host "    No dead references" -ForegroundColor Green
}

# ====================================================
# 6) Size heatmap -- top 15 largest files
# ====================================================
Write-Host "  [6/6] Generating size heatmap..." -ForegroundColor White

$allFiles = Get-ChildItem -Path $docsRoot -Recurse -File -ErrorAction SilentlyContinue |
            Sort-Object -Property Length -Descending |
            Select-Object -First 15

foreach ($f in $allFiles) {
  $relPath = $f.FullName.Substring($root.Length + 1)
  $sizeKB = [math]::Round($f.Length / 1024, 1)
  $report.size_heatmap += @{
    path    = $relPath
    size_kb = $sizeKB
  }
}

Write-Host "    Top file: $($report.size_heatmap[0].path) ($($report.size_heatmap[0].size_kb) KB)" -ForegroundColor DarkGray

# ====================================================
# Summary
# ====================================================
$totalDocFiles = (Get-ChildItem -Path $docsRoot -Recurse -File -ErrorAction SilentlyContinue).Count
$totalDocDirs  = (Get-ChildItem -Path $docsRoot -Recurse -Directory -ErrorAction SilentlyContinue).Count

$report.summary = @{
  total_files         = $totalDocFiles
  total_dirs          = $totalDocDirs
  empty_dirs          = $report.empty_dirs.Count
  gitkeep_only_dirs   = $report.gitkeep_only.Count
  duplicates          = $report.duplicates.Count
  naming_violations   = $report.naming_violations.Count
  stubs               = $report.stubs.Count
  dead_refs           = $report.dead_refs.Count
  total_issues        = $report.empty_dirs.Count + $report.gitkeep_only.Count +
                        $report.duplicates.Count + $report.naming_violations.Count +
                        $report.stubs.Count + $report.dead_refs.Count
}

# ====================================================
# Output
# ====================================================
$outFile = Join-Path $outDir "docs-waste.json"
$report | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding utf8
Write-Host ""
Write-Host "  Saved: $outFile" -ForegroundColor Green
Write-Host "  Issues: $($report.summary.total_issues)" -ForegroundColor $(if ($report.summary.total_issues -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# --- Done marker ---
if ($TempDir) {
  New-Item -Path (Join-Path $TempDir "docs-audit-collect.done") -ItemType File -Force | Out-Null
}
