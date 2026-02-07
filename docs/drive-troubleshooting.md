# Solución de Problemas de Google Drive MCP

Si recibes errores como `Insufficient Permission` al intentar escribir en Google Drive, sigue estos pasos:

## 1. Verificar Scopes de OAuth

Al conectar la cuenta por primera vez, Google muestra una pantalla de consentimiento. Debes marcar **TODAS** las casillas, especialmente:
- Ver, editar, crear y borrar todos los archivos de Google Drive.
- Ver, editar, crear y borrar cualquiera de tus archivos de Google Drive.

Si solo marcaste "Ver", el servidor MCP funcionará en modo solo lectura.

### Solución: Re-autenticar
Ejecuta el script de limpieza para borrar las credenciales guardadas y forzar el login de nuevo:
```powershell
.\scripts\mcp-drive-reset.ps1
```

## 2. Permisos en Unidades Compartidas (Business Drives)

Si estás intentando escribir en una Unidad Compartida (Shared Drive) de tu organización:
1. Ve a drive.google.com.
2. Localiza la Unidad Compartida.
3. Verifica tu rol. Debes tener permiso de **Gestor de contenido** o **Colaborador**.
   - Si eres "Comentarista" o "Lector", no podrás escribir.

## 3. Configuración del Servidor

Asegúrate de que tus servidores en `mcp_config.json` (o similar) estén apuntando a las carpetas correctas.
Ejemplo de configuración robusta:

```json
{
  "mcpServers": {
    "drive-personal": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-drive"],
      "env": {
        "GOOGLE_DRIVE_SHARED_DRIVES": "false"
      }
    },
    "drive-business-1": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-drive"],
      "env": {
        // Habilita soporte para Unidades Compartidas
        "GOOGLE_DRIVE_SHARED_DRIVES": "true" 
      }
    }
  }
}
```
