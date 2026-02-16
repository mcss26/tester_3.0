# =============================================================================
# Security Shutdown - FormulaMid 4
# Usage: pwsh scripts/security-shutdown.ps1
# Ejecuta esto ANTES de cerrar VS Code para limpiar y lockear todo.
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
Write-Host "   SECURITY SHUTDOWN - FormulaMid 4" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0

# ── PASO 1: Matar procesos zombie de Node ────────────────────────────────────
# Los MCP servers corren como procesos Node.js. Cuando cerras VS Code,
# a veces quedan "zombies" que siguen corriendo sin hacer nada.
# Este paso los detecta y los mata.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "  1. LIMPIEZA DE PROCESOS" -ForegroundColor Cyan
Write-Host "     Buscando procesos Node.js zombie..." -ForegroundColor DarkGray

$nodeProcs = @(Get-Process node -EA SilentlyContinue)
if ($nodeProcs.Count -gt 0) {
    $killed = 0
    foreach ($p in $nodeProcs) {
        try {
            $name = Split-Path $p.Path -Leaf -EA SilentlyContinue
            $age = [math]::Round(((Get-Date) - $p.StartTime).TotalHours, 1)
            Write-Host "     Matando: PID $($p.Id) ($name, $age hs activo)" -ForegroundColor Yellow
            Stop-Process -Id $p.Id -Force -EA Stop
            $killed++
        } catch {
            Write-Host "     No se pudo matar PID $($p.Id): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host "     $killed procesos Node.js terminados" -ForegroundColor Green
} else {
    Write-Host "     No hay procesos Node.js corriendo" -ForegroundColor Green
}
Write-Host ""

# ── PASO 2: Backup automatico de configs ─────────────────────────────────────
# Antes de lockear, guarda una copia de seguridad de tus archivos
# de configuracion. Asi si algo se rompe, tenes un ZIP para restaurar.
# Mantiene los 5 backups mas recientes y borra los viejos.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "  2. BACKUP AUTOMATICO" -ForegroundColor Cyan
Write-Host "     Guardando copia de seguridad de configs..." -ForegroundColor DarkGray

$BackupDir = Join-Path $ProjectRoot "scripts\backups"
if (-not (Test-Path $BackupDir)) { New-Item -Path $BackupDir -ItemType Directory -Force | Out-Null }
$DateStamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$TempDir = Join-Path $env:TEMP "config-backup-$DateStamp"
New-Item -Path $TempDir -ItemType Directory -Force | Out-Null

$backupFiles = @(
    (Join-Path $ProjectRoot ".env"),
    (Join-Path $GeminiRoot "mcp_config.json"),
    (Join-Path $CredDir "credentials-personal.json"),
    (Join-Path $CredDir "credentials-business-1.json"),
    (Join-Path $CredDir "credentials-business-2.json"),
    (Join-Path $CredDir "gcp-oauth.keys.json"),
    (Join-Path $ProjectRoot ".gitignore")
)
$count = 0
foreach ($bf in $backupFiles) {
    if (Test-Path $bf) { Copy-Item $bf $TempDir -Force; $count++ }
}
$ZipPath = Join-Path $BackupDir "config-backup-$DateStamp.zip"
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force
Remove-Item $TempDir -Recurse -Force -EA SilentlyContinue
$zipSize = [math]::Round((Get-Item $ZipPath).Length / 1KB, 1)
Write-Host "     [OK] $count archivos -> $ZipPath ($zipSize KB)" -ForegroundColor Green

# Limpiar backups viejos (mantener 5)
$old = @(Get-ChildItem $BackupDir -Filter "config-backup-*.zip" | Sort-Object Name -Descending | Select-Object -Skip 5)
if ($old.Count -gt 0) {
    $old | ForEach-Object { Remove-Item $_.FullName -Force }
    Write-Host "     [OK] $($old.Count) backups viejos eliminados (quedan los 5 mas recientes)" -ForegroundColor DarkGray
}
Write-Host ""

# ── PASO 3: Lockear archivos sensibles ───────────────────────────────────────
# Restringe los permisos de archivos con credenciales y tokens para
# que SOLO tu usuario de Windows pueda leerlos. Esto evita que otros
# programas o usuarios puedan acceder a tus llaves mientras no
# estas usando VS Code.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "  3. LOCKEO DE ARCHIVOS SENSIBLES" -ForegroundColor Cyan
Write-Host "     Restringiendo permisos a solo tu usuario..." -ForegroundColor DarkGray

foreach ($f in $SensitiveFiles) {
    if (-not (Test-Path $f)) { continue }
    $n = Split-Path $f -Leaf
    try {
        $result = icacls $f /inheritance:r /grant:r "siste:(R)" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "     [OK] $n -> solo lectura para tu usuario" -ForegroundColor Green
        } else {
            Write-Host "     [!!] $n -> fallo al lockear" -ForegroundColor Red
            $errors++
        }
    } catch {
        Write-Host "     [!!] $n -> error: $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}
Write-Host ""

# ── PASO 3: Verificar que nada quedo en git ──────────────────────────────────
# Ultima verificacion de que ningun archivo sensible esta siendo
# trackeado por git. Si lo esta, podria subirse a GitHub (publico)
# la proxima vez que hagas git push.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "  4. VERIFICACION GIT" -ForegroundColor Cyan
Write-Host "     Confirmando que no hay secrets en git..." -ForegroundColor DarkGray

$patterns = @('.env', 'mcp.json', 'credentials*.json', '*.pem', '*.key')
$tracked = @()
foreach ($p in $patterns) {
    $result = git -C $ProjectRoot ls-files $p 2>$null
    if ($result) { $tracked += $result }
}
if ($tracked.Count -gt 0) {
    Write-Host "     [!!] PELIGRO: Archivos sensibles en git: $($tracked -join ', ')" -ForegroundColor Red
    Write-Host "          Sacalos con: git rm --cached <archivo>" -ForegroundColor DarkCyan
    $errors++
} else {
    Write-Host "     [OK] Ningun archivo sensible en git" -ForegroundColor Green
}
Write-Host ""

# ── PASO 4: Limpiar archivos temporales ──────────────────────────────────────
# Elimina archivos temporales que puedan contener informacion sensible
# en cache.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "  5. LIMPIEZA DE TEMPORALES" -ForegroundColor Cyan
Write-Host "     Limpiando caches temporales..." -ForegroundColor DarkGray

$tempDirs = @(
    (Join-Path $env:TEMP "npm-*"),
    (Join-Path $env:TEMP "npx-*")
)
$cleanedSize = 0
foreach ($pattern in $tempDirs) {
    $dirs = Get-ChildItem (Split-Path $pattern) -Directory -Filter (Split-Path $pattern -Leaf) -EA SilentlyContinue
    foreach ($d in $dirs) {
        try {
            $size = (Get-ChildItem $d.FullName -Recurse -EA SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $cleanedSize += $size
            Remove-Item $d.FullName -Recurse -Force -EA SilentlyContinue
        } catch {}
    }
}
$cleanedMB = [math]::Round($cleanedSize / 1MB, 1)
Write-Host "     [OK] $cleanedMB MB de caches temporales limpiados" -ForegroundColor Green
Write-Host ""

# ── PASO 5: God-mode check final ─────────────────────────────────────────────
# Verificacion final de que no reaparecieron agentes rogue.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "  6. CHECK FINAL DE SEGURIDAD" -ForegroundColor Cyan
$godMode = Join-Path $GeminiRoot "god-mode"
$agente0 = Join-Path $GeminiRoot "agente-0"
if ((Test-Path $godMode) -or (Test-Path $agente0)) {
    Write-Host "     [!!] ALERTA: god-mode o agente-0 reaparecieron!" -ForegroundColor Red
    $errors++
} else {
    Write-Host "     [OK] No hay agentes rogue" -ForegroundColor Green
}

# MCP config check
if (Test-Path $McpConfig) {
    try {
        $cfg = Get-Content $McpConfig -Raw | ConvertFrom-Json
        $known = @('supabase-mcp-server','notebooklm-mcp-server','figma-mcp-server',
                    'drive-personal','drive-business-1','drive-business-2','stitch','memory-server')
        $unknown = $cfg.mcpServers.PSObject.Properties | Where-Object { $_.Name -notin $known }
        if ($unknown) {
            Write-Host "     [!!] MCP servers desconocidos: $($unknown.Name -join ', ')" -ForegroundColor Red
            $errors++
        } else {
            Write-Host "     [OK] MCP config intacto (8 servers conocidos)" -ForegroundColor Green
        }
    } catch {}
}
Write-Host ""

# ── RESUMEN ──────────────────────────────────────────────────────────────────
Write-Host "  ========================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "   TODO LOCKEADO. Podes cerrar VS Code." -ForegroundColor Green
} else {
    Write-Host "   ATENCION: $errors problemas detectados" -ForegroundColor Red
    Write-Host "   Revisa los items marcados con [!!]" -ForegroundColor Yellow
}
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""
