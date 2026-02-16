# =============================================================================
# Security Watchdog v3 - FormulaMid 4
# Usage: pwsh scripts/security-watchdog.ps1 [-IntervalSeconds 60] [-LogToFile]
# Run in VS Code terminal. Press Ctrl+C for session summary.
# =============================================================================

param(
    [int]$IntervalSeconds = 60,
    [switch]$LogToFile
)

# ── Paths ────────────────────────────────────────────────────────────────────
$ProjectRoot = "C:\Users\siste\Documents\GitHub\tester_3.0"
$GeminiRoot  = "C:\Users\siste\.gemini\antigravity"
$McpConfig   = Join-Path $GeminiRoot "mcp_config.json"
$CredDir     = Join-Path $GeminiRoot "scratch\google-drive-mcp-personal"
$LogDir      = Join-Path $ProjectRoot "scripts\logs"
$LogFile     = Join-Path $LogDir "watchdog-$(Get-Date -Format 'yyyyMMdd').log"

$SensitiveFiles = @(
    $McpConfig,
    (Join-Path $CredDir "credentials-personal.json"),
    (Join-Path $CredDir "credentials-business-1.json"),
    (Join-Path $CredDir "credentials-business-2.json"),
    (Join-Path $CredDir "gcp-oauth.keys.json"),
    (Join-Path $ProjectRoot ".env")
)

$WatchDirs = @(
    (Join-Path $ProjectRoot ".agent"),
    (Join-Path $GeminiRoot "skills"),
    (Join-Path $GeminiRoot "scratch")
)

$Whitelist = @(
    @{ File = 'login.js';        Pattern = 'password' },
    @{ File = 'cms-members.js';  Pattern = 'password' },
    @{ File = 'cms-members.js';  Pattern = 'bearer' },
    @{ File = 'gbol-service.js'; Pattern = 'password' },
    @{ File = 'gbol-service.js'; Pattern = 'bearer' },
    @{ File = 'my-qr.js';       Pattern = 'bearer' }
)

$DangerPatterns  = @('password','bearer','private_key','ssh-rsa','BEGIN RSA','BEGIN PRIVATE','api_secret')
$SuspiciousProcs = @('keylogger','mimikatz','lazagne','nirsoft')
$KnownMcpServers = @('supabase-mcp-server','notebooklm-mcp-server','figma-mcp-server',
                      'drive-personal','drive-business-1','drive-business-2','stitch','memory-server')
$GodModePaths    = @((Join-Path $GeminiRoot "god-mode"), (Join-Path $GeminiRoot "agente-0"))

# ── State ────────────────────────────────────────────────────────────────────
$fileHashes    = @{}
$initialCounts = @{}
$alertLog      = @()
$warnLog       = @()
$checkCount    = 0
$startTime     = Get-Date
$watchers      = @()

# ── Output ───────────────────────────────────────────────────────────────────
function Log($level, $msg) {
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts] [$level] $msg"
    switch ($level) {
        "OK"    { Write-Host "  [OK] $msg" -ForegroundColor Green }
        "WARN"  { Write-Host "  [!]  $msg" -ForegroundColor Yellow; $script:warnLog += $line }
        "ALERT" { Write-Host "  [!!] $msg" -ForegroundColor Red;    $script:alertLog += $line }
        "INFO"  { Write-Host "  [i]  $msg" -ForegroundColor DarkGray }
        "TIP"   { Write-Host "       $msg" -ForegroundColor DarkCyan }
        "HDR"   { Write-Host "`n$msg" -ForegroundColor Cyan }
    }
    if ($LogToFile -and $level -ne "HDR") { $line | Out-File -Append -FilePath $LogFile -Encoding utf8 }
}

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 1: PERMISOS DE ARCHIVOS
# Que hace: Verifica que solo tu usuario de Windows pueda leer los archivos
# sensibles (credenciales, tokens, configuracion MCP).
# Si alguien o algo cambia los permisos, cualquier programa en tu PC
# podria leer tus llaves de acceso.
# ═════════════════════════════════════════════════════════════════════════════
function Test-Perms {
    Log "HDR" "1. PERMISOS DE ARCHIVOS"
    Log "INFO" "Verifico que solo tu usuario pueda leer credenciales y configs"
    foreach ($f in $SensitiveFiles) {
        if (-not (Test-Path $f)) { continue }
        $n = Split-Path $f -Leaf
        $acl = Get-Acl $f
        $c = $acl.Access.Count
        $dangerous = $acl.Access | Where-Object {
            $_.IdentityReference -match '(Everyone|Users|Authenticated Users|BUILTIN)' -and
            $_.FileSystemRights -match '(Read|Write|FullControl|Modify)'
        }
        if ($dangerous) {
            Log "ALERT" "$n tiene permisos ABIERTOS a: $($dangerous.IdentityReference -join ', ')"
            Log "TIP"   "Esto significa que CUALQUIER programa en tu PC puede leer este archivo."
            Log "TIP"   "Para arreglarlo, ejecuta en terminal:"
            Log "TIP"   "icacls '$f' /inheritance:r /grant:r siste:(R,W)"
        } elseif ($c -le 2) {
            Log "OK" "$($n): solo tu usuario puede acceder"
        } else {
            Log "WARN" "$($n): tiene $c permisos (lo normal es 1-2)"
            Log "TIP"  "Revisalo con: icacls '$f'"
        }
    }
}

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 2: INTEGRIDAD DE ARCHIVOS (SHA-256)
# Que hace: Calcula un "fingerprint" unico de cada archivo sensible.
# Si el fingerprint cambia entre checks, significa que alguien (o algo)
# modifico el archivo. Puede ser un agente, un virus, o vos mismo.
# ═════════════════════════════════════════════════════════════════════════════
function Test-Integrity {
    Log "HDR" "2. INTEGRIDAD DE ARCHIVOS"
    Log "INFO" "Comparo fingerprints SHA-256 para detectar modificaciones"
    foreach ($f in $SensitiveFiles) {
        if (-not (Test-Path $f)) { continue }
        $n = Split-Path $f -Leaf
        $h = (Get-FileHash $f -Algorithm SHA256).Hash
        if ($fileHashes.ContainsKey($f)) {
            if ($fileHashes[$f] -ne $h) {
                Log "ALERT" "$n FUE MODIFICADO desde el ultimo check!"
                Log "TIP"   "Alguien o algo cambio este archivo. Puede ser:"
                Log "TIP"   "  - Un agente de IA que edito la config"
                Log "TIP"   "  - Vos mismo editandolo (si fue intencional, ignora esta alerta)"
                Log "TIP"   "  - Un proceso malicioso inyectando tokens nuevos"
                Log "TIP"   "Revisa el contenido: code '$f'"
                $fileHashes[$f] = $h
            } else { Log "OK" "$($n): sin cambios" }
        } else {
            $fileHashes[$f] = $h
            Log "OK" "$($n): fingerprint registrado ($($h.Substring(0,12))...)"
        }
    }
}

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 3: ARCHIVOS NUEVOS SOSPECHOSOS
# Que hace: Busca si aparecieron archivos con nombres tipicos de
# credenciales (.pem, .key, credentials, private_key, id_rsa) en tu
# proyecto. Tambien monitorea si la cantidad de archivos en carpetas
# clave cambio drasticamente (posible scaffolding de un agente rogue).
# ═════════════════════════════════════════════════════════════════════════════
function Test-NewFiles {
    Log "HDR" "3. ARCHIVOS NUEVOS SOSPECHOSOS"
    Log "INFO" "Busco archivos tipo credencial/key que no deberian estar en el proyecto"
    $suspects = Get-ChildItem $ProjectRoot -Recurse -File -EA SilentlyContinue |
        Where-Object {
            $_.Name -match '(credential|secret|private.key|\.pem$|\.key$|id_rsa)' -and
            $_.Name -notmatch '(\.gitignore|package-lock|node_modules)'
        }
    if ($suspects) {
        foreach ($s in $suspects) {
            Log "ALERT" "Archivo sospechoso encontrado: $($s.FullName)"
            Log "TIP"   "Este archivo tiene nombre de credencial/key. No deberia estar en el proyecto."
            Log "TIP"   "Si lo creaste vos, asegurate de que este en .gitignore."
            Log "TIP"   "Si NO lo creaste, un agente o proceso lo genero. Revisalo y eliminalo."
        }
    } else { Log "OK" "No hay archivos sospechosos en el proyecto" }

    Log "INFO" "Verifico que no hayan aparecido archivos masivamente en carpetas clave"
    foreach ($d in $WatchDirs) {
        if (-not (Test-Path $d)) { continue }
        $dn = Split-Path $d -Leaf
        $cnt = @(Get-ChildItem $d -Recurse -File -EA SilentlyContinue).Count
        if ($initialCounts.ContainsKey($d)) {
            $diff = $cnt - $initialCounts[$d]
            if ($diff -gt 5) {
                Log "ALERT" "$($dn): +$diff archivos nuevos (creacion masiva detectada!)"
                Log "TIP"   "Se crearon muchos archivos de golpe en '$dn'. Esto es tipico de"
                Log "TIP"   "un agente haciendo scaffolding sin permiso (como paso con god-mode)."
                Log "TIP"   "Revisa que hay nuevo: Get-ChildItem '$d' -Recurse | Sort LastWriteTime -Desc | Select -First 10"
            } elseif ($diff -gt 0) {
                Log "WARN" "$($dn): +$diff archivos nuevos"
                Log "TIP"  "Pocos archivos nuevos. Puede ser normal si estas trabajando."
            } else { Log "OK" "$($dn): estable ($cnt archivos)" }
        } else {
            $initialCounts[$d] = $cnt
            Log "OK" "$($dn): baseline registrado ($cnt archivos)"
        }
    }
}

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 4: GIT LEAK
# Que hace: Verifica que archivos sensibles (.env, mcp.json, credentials)
# NO esten siendo trackeados por git. Si git los trackea, cuando hagas
# "git push", se subirian a GitHub (que es PUBLICO) y cualquiera
# podria ver tus tokens y acceder a tus servicios.
# ═════════════════════════════════════════════════════════════════════════════
function Test-GitLeak {
    Log "HDR" "4. GIT LEAK CHECK"
    Log "INFO" "Verifico que ningun archivo sensible este siendo trackeado por git"
    $patterns = @('.env', 'mcp.json', 'credentials*.json', 'gcp-oauth*.json', '*.pem', '*.key')
    $tracked = @()
    foreach ($p in $patterns) {
        $result = git -C $ProjectRoot ls-files $p 2>$null
        if ($result) { $tracked += $result }
    }
    if ($tracked.Count -gt 0) {
        Log "ALERT" "ARCHIVOS SENSIBLES EN GIT: $($tracked -join ', ')"
        Log "TIP"   "PELIGRO: Estos archivos se subirian a GitHub (que es PUBLICO)."
        Log "TIP"   "Cualquiera podria ver tus tokens y acceder a Supabase/Google Drive."
        Log "TIP"   "Para sacarlo de git sin borrar el archivo:"
        Log "TIP"   "  git rm --cached <archivo>"
        Log "TIP"   "  Agregar al .gitignore"
        Log "TIP"   "  git commit -m 'Remove sensitive file from tracking'"
    } else { Log "OK" "Ningun archivo sensible esta trackeado por git" }
}

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 5: PATRONES PELIGROSOS EN CODIGO
# Que hace: Busca palabras como "password", "bearer", "private_key" en
# los archivos .js y .html del proyecto. Tiene una WHITELIST de archivos
# donde esas palabras son normales (login.js usa "password" para el
# campo de login, por ejemplo). Si aparece en un archivo NUEVO que no
# esta en la whitelist, te avisa porque podria ser un leak.
# ═════════════════════════════════════════════════════════════════════════════
function Test-CodePatterns {
    Log "HDR" "5. PATRONES EN CODIGO"
    Log "INFO" "Busco palabras sensibles en .js/.html (con whitelist de falsos positivos)"
    $assetsPath = Join-Path $ProjectRoot "assets"
    $found = $false
    foreach ($p in $DangerPatterns) {
        $matches = Get-ChildItem $assetsPath -Recurse -Include *.js,*.html -EA SilentlyContinue |
            Select-String -Pattern $p -CaseSensitive:$false -List
        foreach ($m in $matches) {
            $fileName = Split-Path $m.Path -Leaf
            $isWhitelisted = $Whitelist | Where-Object { $_.File -eq $fileName -and $_.Pattern -eq $p }
            if (-not $isWhitelisted) {
                Log "WARN" "Patron '$p' encontrado en: $fileName (NO esta en whitelist)"
                Log "TIP"  "Este archivo tiene una palabra sensible que no estaba antes."
                Log "TIP"  "Si lo escribiste vos (ej: campo de formulario), agregalo a la whitelist"
                Log "TIP"  "en la variable Whitelist del script."
                Log "TIP"  "Si NO lo escribiste, revisalo: puede ser un leak real."
                $found = $true
            }
        }
    }
    if (-not $found) { Log "OK" "Sin patrones peligrosos nuevos (whitelist activa)" }
}

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 6: RESUCITACION DE GOD-MODE
# Que hace: Verifica que no hayan reaparecido las carpetas "god-mode" o
# "agente-0" que fueron eliminadas. Tambien busca skills con nombres
# sospechosos (solidity, hack, exploit, attack) que podrian indicar
# que un agente esta instalando cosas sin tu permiso.
# ═════════════════════════════════════════════════════════════════════════════
function Test-GodMode {
    Log "HDR" "6. GOD-MODE / AGENTE ROGUE"
    Log "INFO" "Verifico que no hayan reaparecido agentes o skills eliminados"
    $found = $false
    foreach ($gm in $GodModePaths) {
        if (Test-Path $gm) {
            $name = Split-Path $gm -Leaf
            Log "ALERT" "El directorio '$name' REEMPARECIO!"
            Log "TIP"   "Este directorio fue eliminado en la limpieza. Si reaparecio,"
            Log "TIP"   "significa que algun agente lo recreo. Esto es scope creep."
            Log "TIP"   "Eliminalo: Remove-Item '$gm' -Recurse -Force"
            $found = $true
        }
    }

    $skillsDir = Join-Path $GeminiRoot "skills"
    $sol = Get-ChildItem $skillsDir -Directory -EA SilentlyContinue |
        Where-Object { $_.Name -match 'solidity|hack|exploit|attack' }
    if ($sol) {
        Log "ALERT" "Skill sospechosa encontrada: $($sol.Name)"
        Log "TIP"   "Esta skill no es parte del proyecto. Un agente la instalo sin permiso."
        Log "TIP"   "Eliminala: Remove-Item '$($sol.FullName)' -Recurse -Force"
        $found = $true
    }
    if (-not $found) { Log "OK" "No hay agentes rogue ni skills sospechosas" }
}

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 7: PROCESOS SOSPECHOSOS
# Que hace: Busca procesos con nombres de herramientas de hacking
# (keylogger, mimikatz, etc). Tambien cuenta los procesos "node"
# activos. Si hay demasiados, podria indicar un MCP server rogue
# corriendo en background.
# ═════════════════════════════════════════════════════════════════════════════
function Test-Processes {
    Log "HDR" "7. MONITOREO DE PROCESOS"
    Log "INFO" "Busco procesos sospechosos y verifico cantidad de procesos Node.js"
    foreach ($proc in $SuspiciousProcs) {
        $running = Get-Process -Name "*$proc*" -EA SilentlyContinue
        if ($running) {
            Log "ALERT" "Proceso sospechoso corriendo: $($running.Name) (PID: $($running.Id))"
            Log "TIP"   "PELIGRO: '$($running.Name)' es una herramienta conocida de robo de credenciales."
            Log "TIP"   "Si no la instalaste vos, tu PC puede estar comprometida."
            Log "TIP"   "Matalo: Stop-Process -Id $($running.Id) -Force"
            Log "TIP"   "Luego escanea con Windows Defender."
        }
    }

    $nodeProcs = @(Get-Process -Name "node" -EA SilentlyContinue)
    $expectedMax = 10
    if ($nodeProcs.Count -gt $expectedMax) {
        Log "WARN" "Hay $($nodeProcs.Count) procesos Node.js (lo normal es max $expectedMax)"
        Log "TIP"  "Muchos procesos Node pueden indicar MCP servers extra o procesos zombie."
        Log "TIP"  "Revisa cuales son: Get-Process node | Select Id, StartTime, Path"
    } else {
        Log "OK" "Procesos Node.js: $($nodeProcs.Count) (normal)"
    }
}

# ═════════════════════════════════════════════════════════════════════════════
# CHECK 8: AUDITORIA DE MCP CONFIG
# Que hace: Lee el archivo mcp_config.json (donde estan configurados
# todos los servidores MCP como Supabase, Google Drive, etc) y
# verifica que no haya aparecido un servidor NUEVO que no deberia
# estar ahi. Si un agente agrega un MCP server rogue, podria tener
# acceso a servicios sin tu permiso.
# ═════════════════════════════════════════════════════════════════════════════
function Test-McpConfig {
    Log "HDR" "8. AUDITORIA MCP CONFIG"
    Log "INFO" "Verifico que no hayan aparecido MCP servers desconocidos"
    if (-not (Test-Path $McpConfig)) {
        Log "WARN" "mcp_config.json no existe! Fue eliminado?"
        Log "TIP"  "Este archivo es la configuracion de todos tus MCP servers."
        Log "TIP"  "Sin el, los agentes no pueden usar Supabase, Google Drive, etc."
        return
    }
    try {
        $cfg = Get-Content $McpConfig -Raw | ConvertFrom-Json
        $servers = $cfg.mcpServers.PSObject.Properties
        $count = @($servers).Count
        Log "OK" "$count MCP servers configurados"

        foreach ($s in $servers) {
            if ($s.Name -notin $KnownMcpServers) {
                Log "ALERT" "MCP SERVER DESCONOCIDO: '$($s.Name)'"
                Log "TIP"   "Este servidor NO estaba en la lista original de 8 servers conocidos."
                Log "TIP"   "Si no lo agregaste vos, un agente lo hizo sin permiso."
                Log "TIP"   "Esto le daria acceso a un servicio externo."
                Log "TIP"   "Revisa: code '$McpConfig'"
            }
        }
    } catch {
        Log "WARN" "No se pudo leer mcp_config.json (archivo corrupto?)"
    }
}

# ── FileSystemWatcher (Real-time) ────────────────────────────────────────────
function Start-Watchers {
    if (Test-Path $CredDir) {
        $w = New-Object System.IO.FileSystemWatcher
        $w.Path = $CredDir
        $w.Filter = "*.json"
        $w.EnableRaisingEvents = $true
        $action = {
            $name = $Event.SourceEventArgs.Name
            $type = $Event.SourceEventArgs.ChangeType
            Write-Host ""
            Write-Host "  [!!] ALERTA EN TIEMPO REAL: '$name' fue $type!" -ForegroundColor Red
            Write-Host "       Alguien modifico un archivo de credenciales mientras trabajabas." -ForegroundColor DarkCyan
            Write-Host "       Revisa si fuiste vos o si un agente lo hizo sin permiso." -ForegroundColor DarkCyan
            Write-Host ""
        }
        Register-ObjectEvent $w "Changed" -Action $action | Out-Null
        Register-ObjectEvent $w "Created" -Action $action | Out-Null
        Register-ObjectEvent $w "Deleted" -Action $action | Out-Null
        $script:watchers += $w
        Log "INFO" "Vigilancia en tiempo real ACTIVA sobre archivos de credenciales"
    }

    if (Test-Path $GeminiRoot) {
        $w2 = New-Object System.IO.FileSystemWatcher
        $w2.Path = $GeminiRoot
        $w2.Filter = "*"
        $w2.EnableRaisingEvents = $true
        $action2 = {
            $name = $Event.SourceEventArgs.Name
            if ($name -match 'god-mode|agente-0') {
                Write-Host ""
                Write-Host "  [!!] ALERTA EN TIEMPO REAL: Se detecto '$name' en antigravity!" -ForegroundColor Red
                Write-Host "       El directorio god-mode o agente-0 fue recreado." -ForegroundColor DarkCyan
                Write-Host "       Un agente esta intentando resucitar god-mode." -ForegroundColor DarkCyan
                Write-Host "       Eliminalo inmediatamente:" -ForegroundColor DarkCyan
                Write-Host "       Remove-Item 'C:\Users\siste\.gemini\antigravity\$name' -Recurse -Force" -ForegroundColor DarkCyan
                Write-Host ""
            }
        }
        Register-ObjectEvent $w2 "Created" -Action $action2 | Out-Null
        $script:watchers += $w2
        Log "INFO" "Vigilancia en tiempo real ACTIVA sobre directorio antigravity"
    }
}

# ── Main ─────────────────────────────────────────────────────────────────────
Clear-Host

if ($LogToFile) {
    if (-not (Test-Path $LogDir)) { New-Item -Path $LogDir -ItemType Directory -Force | Out-Null }
}

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "   SECURITY WATCHDOG v3 - FormulaMid 4" -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Este script verifica la seguridad de tu workspace" -ForegroundColor DarkGray
Write-Host "  cada $IntervalSeconds segundos. Busca:" -ForegroundColor DarkGray
Write-Host "    1. Permisos de archivos sensibles" -ForegroundColor DarkGray
Write-Host "    2. Archivos modificados sin tu permiso" -ForegroundColor DarkGray
Write-Host "    3. Archivos nuevos sospechosos" -ForegroundColor DarkGray
Write-Host "    4. Secrets que se hayan colado en git" -ForegroundColor DarkGray
Write-Host "    5. Patrones peligrosos en codigo" -ForegroundColor DarkGray
Write-Host "    6. Agentes rogue (god-mode, skills no autorizadas)" -ForegroundColor DarkGray
Write-Host "    7. Procesos sospechosos en Windows" -ForegroundColor DarkGray
Write-Host "    8. MCP servers desconocidos" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Codigos de colores:" -ForegroundColor DarkGray
Write-Host "    [OK]  = Todo bien" -ForegroundColor Green
Write-Host "    [!]   = Atencion, revisalo cuando puedas" -ForegroundColor Yellow
Write-Host "    [!!]  = PELIGRO, accion inmediata necesaria" -ForegroundColor Red
Write-Host "           = Explicacion de que hacer" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "  Ctrl+C para detener y ver resumen de sesion" -ForegroundColor DarkGray
if ($LogToFile) {
    Write-Host "  Log: scripts/logs/watchdog-$(Get-Date -f 'yyyyMMdd').log" -ForegroundColor DarkGray
}
Write-Host ""

Start-Watchers

try {
    while ($true) {
        $checkCount++
        $ts = Get-Date -Format "HH:mm:ss"
        $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 0)
        Write-Host "=== Check #$checkCount @ $ts (sesion activa: $elapsed min) ===" -ForegroundColor White

        Test-Perms
        Test-Integrity
        Test-NewFiles
        Test-GitLeak
        Test-CodePatterns
        Test-GodMode
        Test-Processes
        Test-McpConfig

        Write-Host ""
        if ($alertLog.Count -gt 0) {
            Write-Host "  RESULTADO: $($alertLog.Count) ALERTAS | $($warnLog.Count) avisos" -ForegroundColor Red
        } elseif ($warnLog.Count -gt 0) {
            Write-Host "  RESULTADO: TODO BIEN | $($warnLog.Count) avisos menores" -ForegroundColor Yellow
        } else {
            Write-Host "  RESULTADO: TODO BIEN" -ForegroundColor Green
        }
        Write-Host "  Proximo check en $IntervalSeconds segundos..." -ForegroundColor DarkGray
        Write-Host ""

        Start-Sleep -Seconds $IntervalSeconds
    }
}
finally {
    $watchers | ForEach-Object { $_.EnableRaisingEvents = $false; $_.Dispose() }
    Get-EventSubscriber | Unregister-Event -Force -EA SilentlyContinue

    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)

    Write-Host ""
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "   RESUMEN DE SESION" -ForegroundColor White
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "  Duracion  : $elapsed minutos"
    Write-Host "  Checks    : $checkCount"
    Write-Host "  Alertas   : $($alertLog.Count)" -ForegroundColor $(if ($alertLog.Count) { 'Red' } else { 'Green' })
    Write-Host "  Avisos    : $($warnLog.Count)" -ForegroundColor $(if ($warnLog.Count) { 'Yellow' } else { 'Green' })

    if ($alertLog.Count -gt 0) {
        Write-Host ""
        Write-Host "  ALERTAS DURANTE LA SESION:" -ForegroundColor Red
        $alertLog | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    }
    if ($warnLog.Count -gt 0) {
        Write-Host ""
        Write-Host "  AVISOS DURANTE LA SESION:" -ForegroundColor Yellow
        $warnLog | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkYellow }
    }

    if ($LogToFile -and (Test-Path $LogFile)) {
        "=== Sesion finalizada @ $(Get-Date -f 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -Append $LogFile
        "Duracion: $elapsed min | Checks: $checkCount | Alertas: $($alertLog.Count) | Avisos: $($warnLog.Count)" | Out-File -Append $LogFile
        Write-Host ""
        Write-Host "  Log guardado en: $LogFile" -ForegroundColor DarkGray
    }
    Write-Host ""
}
