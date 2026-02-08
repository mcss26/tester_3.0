# Members: Mi QR

> **Rol**: Member (Cliente)
> **Ruta**: `pages/members/my-qr.html`
> **JS**: `assets/js/members/my-qr.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-02-08

---

## 1. Información General

### 1.1 ¿Quién lo usa?

**Miembros (Clientes)** registrados en el programa "Midnight".

### 1.2 ¿Qué hace?

Genera y muestra un código QR único y temporal para el acceso a eventos. Este QR es la "entrada digital" del miembro.

### 1.3 ¿Cómo lo hace?

Utiliza un token JWT almacenado (`member_token`) para autenticarse contra una Edge Function (`generate-member-qr`). Esta función valida la membresía y si hay un evento activo, retornando un código firmado.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada

- **Acceso Directo**: URL compartida o rediccionamiento post-login.
- **Login**: Si no hay token, redirige a `pages/members/login.html`.

### 2.2 Flujo Principal

1. **Carga**: Verifica token local. Si expiró, logout forzado.
2. **Consulta**: Llama a API `generate-member-qr`.
3. **Estados**:
   - **Éxito**: Muestra QR grande en pantalla + Nombre del miembro + Hora límite.
   - **Usado**: Muestra sello rojo "USADO" sobre la tarjeta.
   - **Sin Evento**: Muestra mensaje "Sin evento disponible".
   - **Error**: Error genérico (conexión, membresía vencida).

### 2.3 Inputs y Acciones Clave

- **Automático**: La generación es automática al cargar.
- **Botón Generar**: (Opcional) Permite reintentar si falló la conexión.

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

Interactúa principalmente via **Edge Function**, no directo a tablas, por seguridad.

El backend (Edge Function) consulta:
- `members` (estado de membresía)
- `events` (evento activo hoy)
- `event_access_logs` (si ya ingresó)

### 3.2 Lógica de Negocio

- **Anti-Fraude**: El QR se genera en el servidor, no en el cliente.
- **Validez Temporal**: El QR tiene un TTL (Time To Live) corto o válido solo para la noche del evento.
- **Estado Visual**: Si el backend detecta que el miembro ya ingresó (`event_access_logs`), retorna `status: 'ACREDITADO'`, lo que activa el sello visual de "USADO".

---

## 4. Componentes UI

### 4.1 Estructura

- **Layout**: Diseño móvil-first ("App-like"). Fondo oscuro.
- **Visualización**: Tarjeta blanca central con QR negro de alto contraste para facilitar escaneo.
- **Feedback**:
  - `state-block.loading`: Spinner inicial.
  - `qr-warning`: Instrucciones claras ("Mostrá esto en la entrada").

### 4.2 Dependencias JS

- **QRCode.js** (CDN): Para renderizar el canvas del código QR en el cliente a partir del string seguro.

---

## 5. Decisiones Arquitectónicas

### 5.1 Seguridad por Diseño

Al usar una Edge Function:
1. No se exponen las reglas de negocio de eventos en el JS del cliente.
2. Se previene la generación de QRs falsos.
3. Se centraliza la lógica de "Evento Activo".

---

## 6. Referencias

- [Módulo de Login](login.md)
- [Monitor de Accesos (QR Admin)](../admin/qr-monitor.md)
