# =============================================================================
# Security Startup - FormulaMid 4
# Usage: pwsh scripts/security-startup.ps1
# Ejecuta esto AL ABRIR VS Code para desbloquear archivos y arrancar el watchdog.
# =============================================================================

$ProjectRoot = "C:\Users\siste\Documents\GitHub\tester_3.0"
$GeminiRoot  = "C:\Users\siste\.gemini\antigravity"
$McpConfig   = Join-Path $GeminiRoot "mcp_config.json"
$CredDir     = Join-Path $GeminiRoot "scratch\google-drive-mcp-personal"

$SensitiveFiles = @(
    $McpConfig,
    (Join-Path $CredDir "credentials-personal.json"),
    (Join-Path $CredDir "credentials-business-1.json"),
    (Join-Path $CredDir "credentials-business-2.json"),
    (Join-Path $CredDir "gcp-oauth.keys.json"),
    (Join-Path $ProjectRoot ".env")
)

Clear-Host
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "   SECURITY STARTUP - FormulaMid 4" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""

# ── PASO 1: Desbloquear archivos sensibles ───────────────────────────────────
# El script de shutdown deja todo en solo lectura (R). Los MCP servers
# necesitan lectura+escritura (R,W) para funcionar — por ejemplo,
# Google Drive MCP necesita escribir el refresh_token actualizado.
# Este paso restaura los permisos necesarios.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "  1. DESBLOQUEANDO ARCHIVOS" -ForegroundColor Cyan
Write-Host "     Restaurando permisos de lectura+escritura..." -ForegroundColor DarkGray

foreach ($f in $SensitiveFiles) {
    if (-not (Test-Path $f)) { continue }
    $n = Split-Path $f -Leaf
    try {
        icacls $f /inheritance:r /grant:r "siste:(R,W)" 2>&1 | Out-Null
        Write-Host "     [OK] $n -> lectura+escritura para tu usuario" -ForegroundColor Green
    } catch {
        Write-Host "     [!!] $n -> error al desbloquear" -ForegroundColor Red
    }
}
Write-Host ""

# ── PASO 2: Limpiar zombies de sesion anterior ──────────────────────────────
# Si la sesion anterior no cerro limpiamente, pueden quedar procesos
# Node.js zombie. Los detectamos y matamos.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "  2. LIMPIEZA DE ZOMBIES" -ForegroundColor Cyan
$zombies = @(Get-Process node -EA SilentlyContinue | Where-Object {
    $_.StartTime -lt (Get-Date).AddHours(-6)
})
if ($zombies.Count -gt 0) {
    Write-Host "     Encontre $($zombies.Count) procesos zombie (>6 hs):" -ForegroundColor Yellow
    $zombies | ForEach-Object {
        $age = [math]::Round(((Get-Date) - $_.StartTime).TotalHours, 1)
        Write-Host "     Matando PID $($_.Id) ($age hs)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -EA SilentlyContinue
    }
    Write-Host "     [OK] Zombies eliminados" -ForegroundColor Green
} else {
    Write-Host "     [OK] Sin procesos zombie" -ForegroundColor Green
}
Write-Host ""

# ── PASO 3: Quick security check ─────────────────────────────────────────────
Write-Host "  3. CHECK RAPIDO DE SEGURIDAD" -ForegroundColor Cyan

$godMode = Join-Path $GeminiRoot "god-mode"
if (Test-Path $godMode) {
    Write-Host "     [!!] ALERTA: god-mode/ reaparecio!" -ForegroundColor Red
} else {
    Write-Host "     [OK] No hay agentes rogue" -ForegroundColor Green
}

$tracked = git -C $ProjectRoot ls-files .env mcp.json 2>$null
if ($tracked) {
    Write-Host "     [!!] Archivos sensibles en git: $tracked" -ForegroundColor Red
} else {
    Write-Host "     [OK] Git limpio" -ForegroundColor Green
}
Write-Host ""

# ── RESUMEN ──────────────────────────────────────────────────────────────────
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "   LISTO. Workspace desbloqueado." -ForegroundColor Green
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Ahora inicia el watchdog en otra terminal:" -ForegroundColor DarkGray
Write-Host "  pwsh scripts/security-watchdog.ps1 -LogToFile" -ForegroundColor White
Write-Host ""
