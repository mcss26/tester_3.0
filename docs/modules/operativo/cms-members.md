# CMS Members

> **Rol**: Operativo, Staff Barra, Staff Operativo
> **Ruta**: `pages/operativo/cms-members.html`
> **JS**: `assets/js/modules/cms-members.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Operativo** (`operativo`), **Staff de Barra** (`staff_barra`) o **Staff Operativo** (`staff_operativo`) que gestionan la comunidad de miembros del club.

### 1.2 ¿Qué hace?
Gestiona el ciclo de vida de los miembros del club (clientes), desde el procesamiento de solicitudes de registro hasta la gestión de la base de datos de la comunidad. Permite procesar solicitudes de registro (Lead to Member), validar identidades mediante redes sociales (Instagram), y gestionar acciones de lealtad como saludos de cumpleaños. Además, incluye herramientas para la verificación masiva de perfiles de redes sociales.

### 1.3 ¿Cómo lo hace?
El módulo se divide en dos áreas principales:
1. **Gestión de Solicitudes**:
   - Lista los registros provenientes del formulario público
   - El staff utiliza la herramienta **Instagram Bulk** para abrir múltiples perfiles de RRSS en paralelo y verificar la identidad/perfil del solicitante
   - Al **Aprobar**, el sistema genera automáticamente un ID de Miembro (`MC-XXXX`) y una contraseña aleatoria, enviándolos por correo electrónico mediante la integración con **EmailJS**
   - **Rechazar** permite marcar solicitudes que no cumplen criterios sin generar credenciales
2. **Control de Cumpleaños**:
   - Filtra automáticamente a los miembros activos que cumplen años en la fecha actual
   - Permite enviar un saludo personalizado vía email con un solo clic
   - Pestaña dedicada para visualización y gestión de cumpleañeros

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Operativo > CMS

### 2.2 Flujo Principal

**Gestión de Solicitudes:**
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: operativo, staff_barra, staff_operativo)
3. Sistema carga solicitudes desde tabla `members` filtradas por estado
4. Usuario puede filtrar por:
   - Estado: Pendiente, Activo, Rechazado, Debug
   - Búsqueda por Nombre/Instagram/Email
5. Para verificación masiva de perfiles:
   - Usuario define rango (Desde/Hasta)
   - Usuario clickea "Instagram Bulk"
   - Sistema abre múltiples pestañas con perfiles de Instagram para verificación manual
6. Para aprobar solicitud individual:
   - Usuario clickea "Aprobar" en solicitud
   - Sistema genera `member_id` único (formato MC-XXXX)
   - Sistema genera contraseña aleatoria segura
   - Sistema actualiza registro en `members` con credenciales y estado `activo`
   - Sistema dispara EmailJS con template de bienvenida incluyendo credenciales
   - Sistema muestra feedback con Toast.success()
7. Para rechazar solicitud:
   - Usuario clickea "Rechazar"
   - Sistema actualiza estado a `rechazado`
   - Registro queda en histórico sin generar credenciales

**Control de Cumpleaños:**
1. Usuario cambia a pestaña "Cumpleaños"
2. Sistema filtra automáticamente miembros activos con cumpleaños = fecha actual
3. Sistema muestra lista de cumpleañeros con datos de contacto
4. Usuario clickea "Felicitar" en un miembro
5. Sistema dispara EmailJS con template de felicitación personalizado
6. Sistema muestra confirmación con Toast.success()

**Modo Debug:**
1. Usuario filtra por estado "Debug"
2. Sistema muestra miembros activos con credenciales inválidas o nulas
3. Función `hasCredsIssue` detecta: IDs nulos, passwords nulos, formato inválido
4. Usuario clickea "Debug" en un miembro
5. Sistema regenera credenciales válidas
6. Sistema actualiza registro y dispara email con nuevas credenciales

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Buscador por Nombre/IG/Email, Filtros de estado (Pendiente/Activo/Rechazado/Debug), Rango para apertura Bulk (Desde/Hasta)
- **Acción principal**: "Aprobar" (genera credenciales y envía email), "Rechazar" (marca como rechazado), "Felicitar" (envía saludo de cumpleaños), "Instagram Bulk" (abre perfiles masivamente), "Debug" (regenera credenciales)
- **Feedback inmediato**: Toast notifications, actualización de badges de estado, cards detalladas con fecha de alta

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `members` | id, full_name, email, instagram_handle, birthdate, status (pendiente/activo/rechazado), member_id (MC-XXXX), access_password, created_at |
| **Escritura** | `members` | status, member_id, access_password, updated_at |

### 3.2 Lógica de Negocio
El módulo implementa un flujo de gestión de membresía con integración de email automatizada:

**Generación de Credenciales**:
- `member_id`: Formato `MC-XXXX` donde XXXX es número secuencial autoincremental
- `access_password`: Contraseña aleatoria de 8-12 caracteres (letras, números, símbolos)
- Validación de unicidad de member_id antes de guardar
- Solo se generan al aprobar solicitudes (no en rechazos)

**Integración con EmailJS**:
- Lee configuración desde `APP_CONFIG.emailjs` (config.js)
- Templates configurados:
  - Template de bienvenida: Incluye member_id y password
  - Template de cumpleaños: Mensaje personalizado con nombre
  - Template de debug: Nuevas credenciales regeneradas
- Usa public key y service ID de EmailJS
- Envío asíncrono con manejo de errores

**Detección de Issues (Debug)**:
- `hasCredsIssue()`: Verifica integridad de credenciales
- Detecta: member_id nulo, password nulo, formato inválido de MC-XXXX
- Permite regeneración sin duplicar miembros
- Auditoría de correcciones

**Verificación de Instagram Bulk**:
- Abre perfiles en nuevas pestañas (window.open)
- Respeta límites de pestañas por navegador
- Construye URLs con formato: `https://instagram.com/{handle}`
- Permite verificación paralela de múltiples solicitantes

**Casos especiales**:
- Si EmailJS falla, credenciales se guardan pero se muestra error de envío
- Solicitudes rechazadas mantienen datos originales para auditoría
- Cumpleaños se detectan comparando día/mes (ignora año)
- Búsqueda es case-insensitive y busca en nombre, email e Instagram

### 3.3 Endpoints/API
Operaciones Supabase:
- `members`: SELECT (con filtros por estado, fecha, búsqueda), UPDATE (cambio de estado, actualización de credenciales)

Operaciones EmailJS:
- `emailjs.send()`: Envío de templates (bienvenida, cumpleaños, debug)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Tab view con dos paneles (Solicitudes / Cumpleaños)
- **Cards de miembros**: Listado con información detallada (nombre, email, IG, fecha alta)
- **Filtros**: Dropdown de estado, buscador de texto, range selector para bulk
- **Badges**: Indicadores de estado (Pendiente/Activo/Rechazado/Debug) con colores
- **Feedback**: `Toast`, loading spinners durante envío de emails

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Carga inicial de datos | `.loading-spinner` |
| **Empty** | Sin solicitudes/miembros | Mensaje informativo según filtro activo |
| **Pending** | Solicitud sin revisar | Badge amarillo "Pendiente" |
| **Active** | Miembro aprobado | Badge verde "Activo" |
| **Rejected** | Solicitud rechazada | Badge rojo "Rechazado" |
| **Debug** | Credenciales inválidas | Badge naranja "Debug" + botón "Regenerar" |
| **Email Sending** | Enviando email | Loading spinner en botón de acción |
| **Success** | Operación exitosa | `Toast.success()` + actualización de card |
| **Error** | Fallo en operación | `Toast.error()` con mensaje descriptivo |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabs, botones y filtros
- [x] Labels descriptivos en buscador y filtros
- [x] Contraste de colores para badges cumple WCAG AA
- [x] Mensajes de error descriptivos en validaciones
- [x] Loading states con feedback visual claro
- [x] Links de Instagram con target="_blank" y rel="noopener"

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js` (configuración de EmailJS)
- `core/supabase-client.js`
- `core/auth.js` (guard para roles operativos)
- `core/utils.js` (generación de passwords, normalización de texto)
- `core/toast.js`

### 5.2 Módulos Externos
- **EmailJS**: Servicio de envío de emails transaccionales
- **Instagram API**: Apertura de perfiles públicos (no requiere autenticación)

### 5.3 Dependencias entre Módulos
- **Consume**: Configuración de EmailJS desde `APP_CONFIG`
- **Es consumido por**: Ninguno (módulo terminal de gestión)
- **Fuente de Datos**: Formulario público de registro (externo al ERP)
- **Relacionado con**: Sistema de autenticación de miembros (login/acceso MCO)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `operativo`, `staff_barra` y `staff_operativo` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura en `members`

### 6.2 Validaciones de Datos
- [x] Validación de formato de email antes de aprobar
- [x] Verificación de unicidad de member_id generado
- [x] Validación de formato de Instagram handle (sin @)
- [x] Contraseñas generadas cumplen criterios de seguridad (8-12 chars, mix de tipos)
- [x] Validación de fecha de cumpleaños (formato válido, no futura)

### 6.3 Manejo de Errores
- Errores de EmailJS se capturan y muestran con Toast.error() pero credenciales se guardan
- Errores de generación de credenciales previenen aprobación hasta corregir
- Errores de conexión a Supabase se capturan y notifican al usuario
- Instagram Bulk maneja bloqueos de popup por navegador con advertencia
- Fallo en regeneración de debug mantiene credenciales anteriores

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La decisión de usar tabla única `members` para solicitudes y activos permite:
- **Simplicidad de datos**: Sin necesidad de migrar entre tablas
- **Auditoría completa**: Histórico de rechazos y aprobaciones en un solo lugar
- **Estados claros**: Campo `status` gobierna todo el flujo
- **Integración EmailJS**: Envío automatizado sin backend custom

### 7.2 Patrones Utilizados
- **Estado como driver**: Campo `status` controla visibilidad y acciones
- **Generación automática de credenciales**: Reduce errores humanos
- **Verificación masiva**: Instagram Bulk para eficiencia operativa
- **Integración EmailJS**: Servicios externos para envío de emails
- **Modo Debug**: Corrección de inconsistencias de datos sin eliminar registros

### 7.3 Consideraciones de Performance
- Filtrado por estado se ejecuta en query (no client-side)
- Búsqueda con debounce para evitar queries excesivas
- Carga incremental de cards para listas grandes
- EmailJS con retry automático en caso de fallo temporal
- Instagram Bulk respeta límites de ventanas por navegador

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Qué pasa si no llega el email de bienvenida al miembro?**
R: Las credenciales se guardan en la base de datos aunque falle el envío. Puedes usar el modo Debug para regenerar y reenviar las credenciales.

**P: ¿Cómo funciona la herramienta Instagram Bulk?**
R: Seleccionas un rango de solicitudes y el sistema abre múltiples pestañas con sus perfiles de Instagram para que puedas verificarlos rápidamente. Asegúrate de permitir pop-ups en tu navegador.

**P: ¿Puedo reactivar una solicitud rechazada?**
R: Sí, pero debes cambiar manualmente el estado en la base de datos. El módulo no tiene función de reactivación automática para evitar errores.

**P: ¿Qué es el modo Debug y cuándo debo usarlo?**
R: El modo Debug muestra miembros activos con credenciales inválidas o faltantes. Úsalo cuando detectes que un miembro no puede acceder por problemas con su ID o contraseña.

**P: ¿Los cumpleaños se detectan automáticamente?**
R: Sí, la pestaña Cumpleaños filtra automáticamente miembros cuyo día y mes de cumpleaños coinciden con la fecha actual.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Aprobar solicitud y verificar envío de email con credenciales
- [x] Rechazo: Marcar solicitud como rechazada sin generar credenciales
- [x] Instagram Bulk: Verificar apertura de múltiples perfiles en rango definido
- [x] Búsqueda: Probar filtrado por nombre, email e Instagram
- [x] Cumpleaños: Verificar detección automática de cumpleañeros del día
- [x] Envío de felicitación: Verificar email de cumpleaños se envía correctamente
- [x] Modo Debug: Verificar detección de credenciales inválidas y regeneración
- [x] Estado vacío: Acceder sin solicitudes pendientes
- [x] Permisos: Intentar acceder con rol no autorizado (debe redirigir)

### 9.2 Datos de Prueba
- Al menos 5 solicitudes con estado `pendiente`
- Al menos 3 miembros con estado `activo`
- 1-2 solicitudes con estado `rechazado` para histórico
- Al menos 1 miembro con cumpleaños en fecha actual (para probar pestaña)
- 1 miembro con credenciales inválidas (para probar modo Debug)
- Configuración válida de EmailJS en `APP_CONFIG`

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 detallando integración con EmailJS y flujo de validación de miembros |

---

## 11. Referencias y Links

- Formulario Público de Registro: pendiente de documentar en `docs/`
- Config EmailJS: pendiente de documentar en `docs/`
- Sistema de Autenticación MCO: pendiente de documentar en `docs/`
- [Screen Map](../../architecture/screen-map.md#cms-members) - Ubicación en arquitectura de pantallas

---

## NOTAS TÉCNICAS

### Configuración de EmailJS
El módulo requiere que `APP_CONFIG.emailjs` esté correctamente configurado:
```javascript
APP_CONFIG = {
  emailjs: {
    publicKey: "your_public_key",
    serviceId: "your_service_id",
    templates: {
      welcome: "template_welcome_id",
      birthday: "template_birthday_id",
      debug: "template_debug_id"
    }
  }
}
```

### Gestión Centralizada
La lógica de negocio está implementada siguiendo los protocolos de la skill `members-manager`, asegurando consistencia entre módulos que interactúan con la tabla `members`.
