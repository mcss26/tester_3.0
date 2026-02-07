# Script de Diagnostico para MCP Google Drive
# Busca archivos de configuracion y carpetas de credenciales en todo el perfil del usuario.

$searchRoot = $env:USERPROFILE
$patterns = @("*mcp_config.json", "*mcp-server-config.json", "*google-drive-credentials*", "*mcp-google-drive*")

Write-Host "Buscando archivos de configuracion y credenciales en $searchRoot..." -ForegroundColor Cyan
Write-Host "Esto puede tardar unos minutos..." -ForegroundColor Yellow

$results = Get-ChildItem -Path $searchRoot -Include $patterns -Recurse -ErrorAction SilentlyContinue -Force | Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "AppData\\Local\\Temp" }

if ($results) {
    Write-Host "Se encontraron los siguientes elementos:" -ForegroundColor Green
    $results | ForEach-Object {
        Write-Host " - $($_.FullName)"
    }
} else {
    Write-Host "No se encontraron configuraciones ni credenciales obvias." -ForegroundColor Red
}

Write-Host "`n--- RECOMENDACION ---" -ForegroundColor Cyan
Write-Host "Si ves un archivo .json de configuracion (ej: mcp_config.json) en la lista:"
Write-Host "1. Abrelo y cambia el nombre de los servidores 'drive-business-1' a 'drive-business-1-new'."
Write-Host "2. Guarda y reiniciar. Esto forzara una nueva autenticacion limpia."
