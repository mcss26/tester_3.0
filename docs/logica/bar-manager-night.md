# Flujo de Negocio: Noche del Encargado de Barra

**ID de Flujo:** `bar-manager-night`
**Prioridad:** Media
**Actores Principales:** `encargado de barra`
**Punto de Entrada Principal:** `pages/encargados/encargado-barra-noche.html`

---

## Resumen

Este flujo define el proceso operativo para un `encargado de barra` durante su turno. El ciclo de vida completo de su sesión (apertura, actividad, cierre) está rígidamente estructurado en torno a la toma de inventario. Todo el proceso depende de que exista una "Jornada de Trabajo" (`work_day`) activa en el sistema.

---

## Prerrequisito Crítico: Jornada de Trabajo Activa

Antes de que cualquier operación pueda comenzar, el sistema realiza una verificación fundamental a través de `WorkDayHelper.getOpenWorkDay()`.

- **Si existe un `work_day` con `status = 'open'`:** El flujo puede continuar.
- **Si no existe un `work_day` activo:** La interfaz de usuario se bloquea y muestra un mensaje indicando al encargado que debe contactar a la administración para abrir la jornada.

---

## Ciclo de Vida de la Sesión de Barra

El flujo se gestiona como una máquina de estados controlada desde el cliente (`encargado-barra-noche.js`) que interactúa directamente con la base de datos.

### 1. Apertura de Sesión

- **Contexto:** El encargado inicia su turno.
- **Lógica Principal:** `executeOpenBar`
- **Proceso:**
    1.  El sistema presenta una lista de todos los productos (`master_sku`) para registrar el inventario inicial.
    2.  **Mecanismo de Precarga:** Para agilizar el conteo, los campos de stock inicial se rellenan automáticamente (`precarga`) con los valores del **cierre de la última sesión de barra registrada**, sin importar a qué jornada perteneció. Esta lógica reside en `fetchLastClosingStock`.
    3.  El encargado verifica y ajusta las cantidades.
    4.  Al confirmar, el sistema:
        -   Crea un nuevo registro en `bar_sessions` con `status='active'`, asociando la sesión al `work_day` activo y al usuario.
        -   Guarda cada item del inventario inicial como un registro de tipo `opening` en la tabla `bar_stock_snapshots`.

### 2. Sesión Activa

- **Contexto:** El turno está en progreso.
- **UI:** La vista de apertura se oculta y se muestra un panel que indica que la sesión está activa, mostrando la hora de inicio.
- **Acciones:** La única acción principal disponible en esta fase es iniciar el proceso de cierre del turno.

### 3. Cierre de Sesión

- **Contexto:** El encargado finaliza su turno.
- **Lógica Principal:** `executeCloseBar`
- **Proceso:**
    1.  El sistema vuelve a presentar la lista completa de SKUs para que el encargado registre el inventario físico final.
    2.  Al confirmar, el sistema:
        -   Guarda el inventario final como registros de tipo `closing` en la tabla `bar_stock_snapshots`.
        -   Actualiza el estado de la sesión actual en `bar_sessions` a `status='closed'`.

---

## Modelo de Datos y Componentes Técnicos

Este flujo se caracteriza por una lógica del lado del cliente que interactúa directamente con las tablas de Supabase, sin usar Funciones Remotas (RPCs).

| Componente                | Tipo             | Responsabilidad                                                                                                                      |
| ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `encargado-barra-noche.js`| Archivo JS       | **Corazón del flujo.** Orquesta toda la lógica de la UI, el ciclo de vida de la sesión y las operaciones de base de datos.               |
| `work-day-helper.js`      | Archivo JS       | Provee la función crítica `getOpenWorkDay()` que actúa como barrera de entrada para todo el proceso.                                   |
| `work_days`               | Tabla (Supabase) | Tabla maestra que define si el local está operativo. El flujo depende de un registro `open` aquí.                                      |
| `master_sku`              | Tabla (Supabase) | La lista canónica de todos los productos que deben ser contados.                                                                     |
| `bar_sessions`            | Tabla (Supabase) | Registra el ciclo de vida (`active`, `closed`) de cada turno de un encargado, vinculándolo a un `work_day`.                         |
| `bar_stock_snapshots`     | Tabla (Supabase) | **Tabla de Auditoría.** Funciona como un libro mayor que registra el `opening` y `closing` stock para cada `bar_session`. Esto permite un seguimiento detallado del inventario a lo largo del tiempo. |
