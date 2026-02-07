# Script para resetear credenciales de Google Drive MCP y forzar re-autenticación
# Este script busca y elimina los tokens de acceso cacheados para los servidores de Google Drive.

Write-Host "Iniciando limpieza de credenciales de Google Drive MCP..." -ForegroundColor Cyan

# Definir rutas comunes donde se almacenan los tokens
$tokenPaths = @(
    "$env:APPDATA\google-drive-server",
    "$env:USERPROFILE\.config\google-drive-server",
    "$env:APPDATA\modelcontextprotocol\google-drive",
    "$env:USERPROFILE\.modelcontextprotocol\google-drive"
)

$found = $false

foreach ($path in $tokenPaths) {
    if (Test-Path $path) {
        Write-Host "Encontrada carpeta de credenciales en: $path" -ForegroundColor Yellow
        $confirmation = Read-Host "¿Desea eliminar estas credenciales para forzar re-login? (S/N)"
        if ($confirmation -eq 'S' -or $confirmation -eq 's') {
            Remove-Item -Path $path -Recurse -Force
            Write-Host "Credenciales eliminadas correctamente." -ForegroundColor Green
            $found = $true
        } else {
            Write-Host "Operación cancelada para $path." -ForegroundColor Gray
        }
    }
}

if (-not $found) {
    Write-Host "No se encontraron credenciales en las rutas estándar." -ForegroundColor Red
    Write-Host "Es posible que estén en una ubicación personalizada o dentro de la carpeta 'node_modules' del servidor."
}

Write-Host "`n--- PASOS SIGUIENTES ---" -ForegroundColor Cyan
Write-Host "1. Reinicia tu entorno de desarrollo (cierra y abre VSCode/Terminal)."
Write-Host "2. Al reiniciar, el servidor MCP te pedirá autenticarte de nuevo en el navegador."
Write-Host "3. IMPORTANTE: Asegúrate de marcar TODAS las casillas de permisos (Ver, Editar, Crear, Borrar) para que la escritura funcione."
Write-Host "   - Si usas cuentas de negocio, verifica que tengas permisos de EDITOR en las Unidades Compartidas."
Write-Host "------------------------"
