$topics = @(
  'semanal',
  'reportes',
  'pagos',
  'solicitudes',
  'config',
  'central-stock',
  'master-categorias',
  'master-nomina',
  'master-pos',
  'master-proveedores',
  'master-tarifario'
)

foreach ($t in $topics) {
  Write-Host "--- Cargando contexto: $t ---"
  & "$PSScriptRoot\context-loader.ps1" -Topic $t
}

Write-Host "`n=== Terminado ==="
