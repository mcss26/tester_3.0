$root = 'c:\Users\siste\Documents\GitHub\tester_3.0'
$paths = @(
    # Scanners (moved to tests\scanners\)
    'tests\scanners\ui-component-scanner.ps1',
    'tests\scanners\ds-verify.ps1',
    'tests\scanners\select-risk-analyzer.ps1',
    # Scripts
    'scripts\ds-parallel-launch.ps1',
    'scripts\batch-remediation.ps1',
    'scripts\flow-tracer.ps1',
    # Workflows
    '.agent\workflows\orch-workflow.md',
    '.agent\workflows\verify-components.md',
    # Docs (reorganized)
    'docs\80-ephemeral\agent-logs\ui-scan\summary.json',
    'docs\01-design-system\audit-and-prompts\archive\multi-chat-architecture.md',
    'docs\01-design-system\audit-and-prompts\archive\CHANGELOG.md',
    'docs\01-design-system\audit-and-prompts\prompts\frontend-custom-dropdown.md',
    'docs\01-design-system\pages',
    # Assets
    'assets\css\tokens.css'
)
Write-Host ''
Write-Host '  PATH CHECK' -ForegroundColor Cyan
Write-Host '  ==========' -ForegroundColor Cyan
Write-Host ''
$ok = 0; $fail = 0
foreach ($rel in $paths) {
    $full = Join-Path $root $rel
    $exists = Test-Path $full
    if ($exists) { $ok++; $icon = 'OK'; $color = 'Green' }
    else { $fail++; $icon = 'XX'; $color = 'Red' }
    Write-Host ("  [{0}] {1}" -f $icon, $rel) -ForegroundColor $color
}
Write-Host ''
Write-Host ("  Result: {0} OK, {1} MISSING" -f $ok, $fail) -ForegroundColor $(if ($fail -eq 0) { 'Green' } else { 'Red' })
Write-Host ''
