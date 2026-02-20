$root = 'c:\Users\siste\Documents\GitHub\tester_3.0'
$paths = @(
    'scripts\ui-component-scanner.ps1',
    'scripts\ds-verify.ps1',
    'scripts\select-risk-analyzer.ps1',
    'scripts\ds-parallel-launch.ps1',
    'scripts\batch-remediation.ps1',
    'scripts\flow-tracer.ps1',
    '.agent\workflows\orch-workflow.md',
    '.agent\workflows\verify-components.md',
    'docs\output\ui-scan\baseline.json',
    'docs\output\ui-scan\summary.json',
    'docs\output\ui-scan\compliance-matrix.md',
    'docs\output\ui-scan\select-risk-report.md',
    'docs\_generated\orchestrator\multi-chat-architecture.md',
    'docs\_generated\orchestrator\CHANGELOG.md',
    'docs\_generated\orchestrator\prompts\frontend-custom-dropdown.md',
    'docs\_generated\orchestrator\workflows',
    'docs\output\ui-scan\pages',
    'assets\css\tokens.css',
    'assets\css\swiss-style.css'
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
    else         { $fail++; $icon = 'XX'; $color = 'Red' }
    Write-Host ("  [{0}] {1}" -f $icon, $rel) -ForegroundColor $color
}
Write-Host ''
Write-Host ("  Result: {0} OK, {1} MISSING" -f $ok, $fail) -ForegroundColor $(if ($fail -eq 0) { 'Green' } else { 'Red' })
Write-Host ''
