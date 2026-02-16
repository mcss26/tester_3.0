# =============================================================================
# Backup de Configuraciones - FormulaMid 4
# Usage: powershell -ExecutionPolicy Bypass -File scripts/backup-configs.ps1
#
# QUE HACE ESTE SCRIPT (explicacion simple):
# 
# Imaginate que tenes las llaves de tu casa, la del auto, y la del local.
# Este script les saca una "fotocopia" y las guarda en una cajita con fecha.
# Si alguna llave se rompe o se pierde, abris la cajita y las recuperas.
#
# En terminos tecnicos:
# Copia tus archivos de configuracion sensibles (.env, credenciales de
# Google Drive, configuracion MCP) a un archivo .zip con la fecha de hoy.
# Si algo se rompe, descomprimis el ZIP y restauras.
# =============================================================================

$ProjectRoot = "C:\Users\siste\Documents\GitHub\tester_3.0"
$GeminiRoot  = "C:\Users\siste\.gemini\antigravity"
$CredDir     = Join-Path $GeminiRoot "scratch\google-drive-mcp-personal"
$BackupDir   = Join-Path $ProjectRoot "scripts\backups"
$DateStamp   = Get-Date -Format "yyyy-MM-dd_HHmmss"
$ZipName     = "config-backup-$DateStamp.zip"
$ZipPath     = Join-Path $BackupDir $ZipName

# Archivos a respaldar
$FilesToBackup = @(
    # .env - Variables de entorno del proyecto
    # Contiene: URL y key de Supabase (tu base de datos)
    # Si lo perdes: el frontend no puede conectar a la base de datos
    @{ Path = (Join-Path $ProjectRoot ".env"); Nombre = ".env (conexion a Supabase)" },

    # mcp_config.json - Configuracion de los servidores MCP
    # Contiene: rutas a las credenciales de Google Drive, NotebookLM, etc.
    # Si lo perdes: los agentes no pueden usar Google Drive, Supabase, etc.
    @{ Path = (Join-Path $GeminiRoot "mcp_config.json"); Nombre = "mcp_config.json (config de agentes)" },

    # credentials-personal.json - Credenciales de Google Drive personal
    # Contiene: tokens de acceso a tu cuenta de Google personal
    # Si lo perdes: tenes que volver a autorizar Google Drive
    @{ Path = (Join-Path $CredDir "credentials-personal.json"); Nombre = "credentials-personal.json (Google Drive personal)" },

    # credentials-business-1.json - Credenciales de Google Drive negocio 1
    @{ Path = (Join-Path $CredDir "credentials-business-1.json"); Nombre = "credentials-business-1.json (Google Drive negocio 1)" },

    # credentials-business-2.json - Credenciales de Google Drive negocio 2
    @{ Path = (Join-Path $CredDir "credentials-business-2.json"); Nombre = "credentials-business-2.json (Google Drive negocio 2)" },

    # gcp-oauth.keys.json - Llaves OAuth de Google Cloud
    # Contiene: la "llave maestra" que permite pedir tokens a Google
    # Si lo perdes: tenes que crear nuevas llaves en Google Cloud Console
    @{ Path = (Join-Path $CredDir "gcp-oauth.keys.json"); Nombre = "gcp-oauth.keys.json (llave maestra Google)" },

    # .gitignore - Reglas de seguridad de git
    # Contiene: la lista de archivos que NO deben subirse a GitHub
    # Si lo perdes: podrias pushear credenciales por accidente
    @{ Path = (Join-Path $ProjectRoot ".gitignore"); Nombre = ".gitignore (reglas de seguridad de git)" }
)

Clear-Host
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "   BACKUP DE CONFIGURACIONES" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Que hace: crea un ZIP con copias de tus archivos" -ForegroundColor DarkGray
Write-Host "  de configuracion y credenciales, por si algo" -ForegroundColor DarkGray
Write-Host "  se rompe y necesitas restaurarlos." -ForegroundColor DarkGray
Write-Host ""

# Crear carpeta de backups
if (-not (Test-Path $BackupDir)) {
    New-Item -Path $BackupDir -ItemType Directory -Force | Out-Null
}

# Crear carpeta temporal para armar el ZIP
$TempDir = Join-Path $env:TEMP "config-backup-$DateStamp"
New-Item -Path $TempDir -ItemType Directory -Force | Out-Null

$backedUp = 0
$skipped  = 0

Write-Host "  Archivos incluidos:" -ForegroundColor White
Write-Host ""

foreach ($item in $FilesToBackup) {
    if (Test-Path $item.Path) {
        Copy-Item $item.Path -Destination $TempDir -Force
        $size = [math]::Round((Get-Item $item.Path).Length / 1KB, 1)
        Write-Host "  [OK] $($item.Nombre)" -ForegroundColor Green
        Write-Host "       Tamano: $size KB" -ForegroundColor DarkGray
        $backedUp++
    } else {
        Write-Host "  [--] $($item.Nombre) (no existe, se omite)" -ForegroundColor DarkGray
        $skipped++
    }
}

Write-Host ""

# Comprimir todo en un ZIP
try {
    Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force
    $zipSize = [math]::Round((Get-Item $ZipPath).Length / 1KB, 1)

    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "   BACKUP CREADO" -ForegroundColor Green
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Archivo : $ZipName" -ForegroundColor White
    Write-Host "  Tamano  : $zipSize KB" -ForegroundColor White
    Write-Host "  Incluye : $backedUp archivos" -ForegroundColor White
    Write-Host "  Ubicacion: scripts\backups\" -ForegroundColor White
    Write-Host ""

    # Mostrar backups existentes
    $existingBackups = @(Get-ChildItem $BackupDir -Filter "config-backup-*.zip" | Sort-Object Name -Descending)
    if ($existingBackups.Count -gt 1) {
        Write-Host "  Backups guardados ($($existingBackups.Count) total):" -ForegroundColor DarkGray
        foreach ($b in $existingBackups | Select-Object -First 5) {
            $bSize = [math]::Round($b.Length / 1KB, 1)
            Write-Host "    $($b.Name) ($bSize KB)" -ForegroundColor DarkGray
        }
        if ($existingBackups.Count -gt 5) {
            Write-Host "    ...y $($existingBackups.Count - 5) mas" -ForegroundColor DarkGray
        }
        Write-Host ""
    }

    # Limpiar backups viejos (mantener los ultimos 5)
    if ($existingBackups.Count -gt 5) {
        $toDelete = $existingBackups | Select-Object -Skip 5
        Write-Host "  Limpiando backups antiguos (mantengo los 5 mas recientes):" -ForegroundColor Yellow
        foreach ($old in $toDelete) {
            Remove-Item $old.FullName -Force
            Write-Host "    Eliminado: $($old.Name)" -ForegroundColor DarkGray
        }
        Write-Host ""
    }

    Write-Host "  COMO RESTAURAR (si algo se rompe):" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Abri el explorador de archivos" -ForegroundColor White
    Write-Host "  2. Anda a: tester_3.0\scripts\backups\" -ForegroundColor White
    Write-Host "  3. Hace clic derecho en el ZIP -> Extraer todo" -ForegroundColor White
    Write-Host "  4. Copia el archivo roto desde la carpeta extraida" -ForegroundColor White
    Write-Host "     a su ubicacion original" -ForegroundColor White
    Write-Host ""
    Write-Host "  O desde terminal:" -ForegroundColor DarkGray
    Write-Host "  Expand-Archive '$ZipPath' -DestinationPath '$env:TEMP\restore'" -ForegroundColor DarkGray
    Write-Host ""

} catch {
    Write-Host "  [!!] Error al crear ZIP: $($_.Exception.Message)" -ForegroundColor Red
}

# Limpiar carpeta temporal
Remove-Item $TempDir -Recurse -Force -EA SilentlyContinue
