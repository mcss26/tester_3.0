# Flujo de Negocio: Cierre de Caja Nocturno

**ID de Flujo:** `night-cash-closing`
**Prioridad:** Alta
**Actores Principales:** `encargado de caja`, `admin`
**Puntos de Entrada:** 
- `pages/encargados/encargado-caja-noche.html` (para el encargado)
- `pages/admin/admin-workdays.html` (para el administrador)

---

## Resumen

El Cierre de Caja Nocturno es un flujo de dos fases diseñado para separar la declaración de fondos del encargado de la reconciliación final del sistema. Esto crea un punto de control claro y un rastro de auditoría robusto. Primero, el Encargado de Caja declara el dinero y otros métodos de pago contados físicamente. Segundo, un Administrador sincroniza los datos de ventas del sistema externo (GBOL) para comparar y finalizar el cierre.

---

## Fase 1: Declaración del Encargado de Caja

Esta fase se centra en la responsabilidad del `encargado de caja`.

**Punto de Entrada:** `pages/encargados/encargado-caja-noche.html`
**Lógica Principal:** `assets/js/modules/encargados/encargado-caja-noche.js`

### Secuencia de Operaciones:

1.  **Asegurar Cierre Existente:** Al cargar la página, el script `ensureClosingExists` verifica si ya existe un registro en la tabla `cash_closings` para la jornada activa. Si no, lo crea.
2.  **Cierre por Terminal:** Para cada terminal de venta (POS):
    *   El encargado introduce los montos contados en el formulario (ej. `declared_cash`, `declared_zoco`).
    *   Al enviar, la función `submitCloseTerminal` actualiza la fila correspondiente en la tabla `closing_terminals`, llenando los campos `declared_*`. En este punto, los campos `system_*` permanecen en `0`.
3.  **Cierre de la Noche (Soft Close):**
    *   Una vez que todas las terminales están cerradas, el encargado hace clic en "Cerrar Noche".
    *   La función `submitCloseNight` actualiza el estado del registro principal en `cash_closings` y también el estado del `work_days` a `closed`. Esto es un cierre "suave" o preliminar.

**Resultado de la Fase 1:** Todos los montos declarados por el personal de caja han sido registrados en la base de datos. El sistema está a la espera de los datos oficiales de ventas para la reconciliación.

---

## Fase 2: Sincronización y Reconciliación del Administrador

Esta fase es responsabilidad del rol `admin`, y típicamente se ejecuta desde un panel de control central.

**Punto de Entrada:** `pages/admin/admin-workdays.html` (o similar)
**Lógica Principal:** `assets/js/core/gbol-service.js` orquestado por `assets/js/modules/admin/admin-workdays.js`.

### Secuencia de Operaciones:

1.  **Disparador de Sincronización:** Un administrador inicia el proceso de sincronización, probablemente desde el panel de la jornada de trabajo (`admin-workdays.html`).
2.  **Sincronización con GBOL (`syncNight`):**
    *   Se invoca la función `GbolService.syncNight()`.
    *   Esta función se conecta a la API del sistema de ventas externo (GBOL) y descarga el informe de facturación del día.
    *   Los datos brutos se insertan en una tabla de preparación (staging table) llamada `import_gbol_facturacion`.
3.  **Población de Montos del Sistema (`populateSystemAmounts`):**
    *   A continuación, se llama a `GbolService.populateSystemAmounts()`.
    *   Este método procesa los datos de la tabla `import_gbol_facturacion`.
    *   Calcula los totales por método de pago para cada terminal (ej. `system_cash`, `system_zoco`).
    *   Actualiza las mismas filas en `closing_terminals` que el encargado modificó, pero esta vez llenando los campos `system_*`.

**Resultado de la Fase 2:** La tabla `closing_terminals` ahora contiene tanto los montos declarados (`declared_*`) como los montos reportados por el sistema (`system_*`). El sistema puede ahora calcular y mostrar las discrepancias.

---

## Componentes Técnicos Clave

| Componente                    | Tipo             | Responsabilidad                                                                                                            |
| ----------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `encargado-caja-noche.js`     | Archivo JS       | Maneja la lógica del cliente para la declaración de montos y el cierre suave de la noche.                                    |
| `gbol-service.js`             | Archivo JS       | **Componente crítico.** Actúa como la capa de servicio para el TPV externo, manejando la sincronización y reconciliación de datos. |
| `admin-workdays.js`           | Archivo JS       | Orquesta el proceso de reconciliación llamando a los métodos del `gbol-service`.                                          |
| `cash_closings`               | Tabla (Supabase) | Tabla principal que representa el cierre financiero de una jornada completa.                                                |
| `closing_terminals`           | Tabla (Supabase) | **Tabla clave de reconciliación.** Contiene una fila por terminal, con columnas para `declared_*` y `system_*` para la comparación. |
| `import_gbol_facturacion`     | Tabla (Supabase) | Tabla temporal para almacenar los datos brutos de ventas traídos desde el sistema GBOL antes de ser procesados.            |
| `rpc_close_work_day`          | Función RPC (DB) | Una función más robusta, probablemente usada por el admin para realizar el cierre transaccional final de toda la jornada.       |
