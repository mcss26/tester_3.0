param(
    [int]$IntervalMinutes = 5
)

$wshell = New-Object -ComObject wscript.shell
$IntervalSeconds = $IntervalMinutes * 60

# Set de 10 prompts
$Prompts = @(
    "continua con el siguiente paso del plan.",
    "haz un double check de los archivos que modificaste para no dejar errores de sintaxis.",
    "verifica la DB: asegúrate de no estar violando ninguna regla arquitectónica.",
    "continua con la limpieza.",
    "verifica la UI: revisa que no hayas roto ningún id de HTML.",
    "continua iterando la lista de tareas pendientes.",
    "haz una pausa, verifica que no hayas dejado console.logs perdidos, y luego continua.",
    "verifica tu progreso contra el reporte de discrepancias. ¿Qué falta?",
    "continua ejecutando la remediación.",
    "haz un resumen de lo que lograste, verifica que sea estable y continua."
)

Clear-Host
Write-Host ""
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host "  🤖 AUTO-PROMPTER ESTRATÉGICO ACTIVADO" -ForegroundColor White
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host "  Intervalo: $IntervalMinutes minutos" -ForegroundColor DarkGray
Write-Host "  Presiona Ctrl+C en esta terminal para detener." -ForegroundColor Red
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host ""

$loopCount = 1

while ($true) {
    Write-Host " --- INICIANDO CICLO #$loopCount ---" -ForegroundColor Magenta

    foreach ($currentPrompt in $Prompts) {
        $timeLeft = $IntervalSeconds
        
        # Cuenta regresiva
        while ($timeLeft -gt 0) {
            Write-Progress -Activity "Esperando..." -Status "$timeLeft seg restantes" -PercentComplete (($IntervalSeconds - $timeLeft) / $IntervalSeconds * 100)
            Start-Sleep -Seconds 1
            $timeLeft--
        }
        Write-Progress -Activity "Esperando..." -Completed

        $time = Get-Date -Format "HH:mm:ss"
        Write-Host " [$time] Enviando:" -ForegroundColor Green
        Write-Host " > '$currentPrompt'" -ForegroundColor DarkGray
        
        # Escribe y da Enter
        $wshell.SendKeys($currentPrompt)
        Start-Sleep -Milliseconds 500
        $wshell.SendKeys("{ENTER}")
    }
    
    $loopCount++
} <#
 # {:Enter a comment or description}
#>