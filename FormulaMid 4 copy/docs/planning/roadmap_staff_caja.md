# Plan de Implementación: Módulo Staff Caja

### Resumen Ejecutivo

Completar el desarrollo del módulo **Staff Caja** (rol subordinado), permitiendo al personal operar terminales POS, gestionar solicitudes de retiros y ejecutar el cierre de turno mediante validación de montos y firma digital.

### Diagnóstico del Estado Actual

- **Estructura**: `staff-caja-index.html` cuenta con el layout completo.
- **Lógica Base**: `staff-caja-index.js` implementa únicamente `Auth.guardOrRedirect`.
- **Pendiente Crítico**: Implementación de la lógica de terminales y convocatorias (Ref: TODO línea 25).

### Objetivos de Desarrollo

- [ ] **Lógica de Negocio**: Implementación de ~600-700 líneas de código reactivo.
- [ ] **Integración Realtime**: Sincronización con Supabase para movimientos y retiros.
- [ ] **UX/UI**: Feedback constante mediante `window.Toast` y estados de carga.
- [ ] **Seguridad**: Validación de integridad de datos y firma digital en cierres.

# Arquitectura y Flujo de Estados

### Máquina de Estados de la UI

1.  **Estado 1: Gestión de Convocación (Opcional)**
    - **Trigger**: Al cargar, verificar convocaciones pendientes.
    - **Vista**: `#convocation-card` con botón "Confirmar Asistencia".
    - **Query**: `staff_convocations` WHERE `staff_id = currentUser` AND `status = 'pending'`.
    - **Acción**: Update `status = 'confirmed'` → Transición a **Estado 2**.

2.  **Estado 2: Selección de Terminal**
    - **Trigger**: Tras confirmar convocación o si no hay pendientes.
    - **Vista**: `#step-select-terminal` visible.
    - **Lógica**:
      - **0 terminales**: Mostrar mensaje "No tienes terminales asignadas".
      - **1 terminal**: Auto-selección y transición automática.
      - **Múltiples**: Renderizar botones de selección.
    - **Acción**: Establecer `state.selectedTerminalId` → Transición a **Estado 3**.

3.  **Estado 3: Dashboard Operativo**
    - **Trigger**: Terminal seleccionada.
    - **Vista**: `#step-dashboard` activo.
    - **Componentes**:
      - Header con nombre de terminal y botón "Cambiar".
      - Lista de retiros/movimientos pendientes (Realtime).
      - Formulario de cierre: Conteo efectivo, Zoco y Signature Pad.
    - **Acción**: Envío de formulario → Transición a **Estado 4**.

4.  **Estado 4: Cierre Enviado**
    - **Trigger**: `upsert` exitoso en `closing_terminals` con `status = 'submitted'`.
    - **Vista**: Dashboard en modo solo lectura (inputs deshabilitados).
    - **Feedback**: Toast de éxito y mensaje "Tu cierre está siendo revisado por el encargado".

### Estructura del Módulo JS

Se implementará bajo el patrón IIFE asíncrono estándar para encapsulamiento de estado:

```javascript
(async function () {
  "use strict";

  // 1. Auth Guard (MANTENER EXISTENTE)
  // 2. DOM References (objeto ui)
  // 3. State Management
  // 4. Helper Functions
  // 5. Data Loading Functions
  // 6. Render Functions
  // 7. Form Handlers
  // 8. Signature Pad
  // 9. Realtime Subscription
  // 10. Event Bindings
  // 11. Initialization
})();
```

### Funciones Principales a Implementar

#### Data Loading (5 funciones)

- **`loadConvocations()`**
  - **Query**: `staff_convocations` con JOIN a `work_days` para fecha.
  - **Filtrar**: `staff_id = currentUser` AND `status = 'pending'` AND `fecha >= hoy`.
  - **Acción**: Renderizar card si hay convocaciones.

- **`loadAssignedTerminals()`**
  - **Query**: Jornada abierta → `cash_closings` → `closing_terminals` con `staff_id`.
  - **JOIN**: `pos_terminals` para obtener `friendly_name`.
  - **Retorno**: Array de terminales asignadas.

- **`loadTerminalData(terminalId)`**
  - **Query**: `closing_terminals` WHERE `terminal_id = X`.
  - **Query**: `cash_movements` WHERE `terminal_id = X` AND `status = 'pending'`.
  - **Acción**: Actualizar `state.closingTerminal` y `state.pendingMovements`.

- **`loadCurrentWorkDay()`**
  - **Query**: `work_days` WHERE `status = 'open'`.
  - **Retorno**: `work_day_id` o `null`.
  - **Lógica**: Si `null` → Mostrar bloqueo "No hay jornada activa".

- **`ensureClosingExists()`**
  - **Lógica**: Verificar/Crear `cash_closing` para la jornada actual.
  - **Referencia**: Reutilizar lógica de `encargado-caja-noche.js:290-318`.

#### Render Functions (4 funciones)

- **`renderConvocationCard(convocation)`**
  - **Vista**: Mostrar `#convocation-card`.
  - **Datos**: Actualizar fecha y rol en el DOM.
  - **Binding**: Click en `#btn-confirm-convocation`.

- **`renderTerminalSelection(terminals)`**
  - **Vista**: Mostrar `#step-select-terminal`.
  - **Lógica**: Inyectar botones usando `map().join('')` para performance.
  - **Binding**: Event delegation para clicks en terminales.

- **`renderDashboard()`**
  - **Vista**: Mostrar `#step-dashboard`.
  - **Lógica**: Actualizar `#active-terminal-name` y renderizar movimientos.
  - **Estado**: Si `status === 'submitted'`, deshabilitar inputs del formulario.

- **`renderPendingMovements(movements)`**
  - **Lógica**: Si array vacío, ocultar sección.
  - **UI**: Inyectar HTML en `#movements-list` con montos formateados y badges de estado.

#### Form Handlers (5 funciones)

- **`handleConfirmConvocation(convocationId)`**
  - **UX**: Bloquear botón (loading state).
  - **Acción**: `UPDATE staff_convocations SET status = 'confirmed'`.
  - **Transición**: Ocultar card y pasar a selección de terminal.

- **`handleTerminalSelection(terminalId)`**
  - **Acción**: Guardar en `state.selectedTerminalId` y cargar datos.
  - **Transición**: Switch de vistas y arranque de suscripción Realtime.

- **`handleChangeTerminal()`**
  - **Lógica**: Limpiar suscripciones y resetear vista a selección.

- **`handleRequestWithdrawal()`**
  - **Acción**: `INSERT INTO cash_movements` (type: 'withdrawal', status: 'pending').
  - **UX**: Cerrar modal y mostrar Toast de éxito.

- **`handleSubmitClosing(e)`**
  - **Validación**: Firma obligatoria y montos no negativos.
  - **Acción**: `UPDATE closing_terminals` con `declared_cash`, `declared_zoco`, `signature_data` y `status = 'submitted'`.

#### Signature Pad & Realtime

- **`initSignaturePad()`**: Configuración de canvas, contextos y listeners (mouse/touch).
- **`startRealtime()`**: Suscripción a `cash_movements` filtrado por `terminal_id`.
- **`handleMovementUpdate(payload)`**: Actualización reactiva de la lista y Toast si un retiro es confirmado.

<!-- Firma Digital -->
<div class="mb-4">
    <label class="block text-sm uppercase faint mb-2">Firma Digital</label>
    <div class="signature-container relative bg-white/5 border border-white/10 rounded-xl"
         style="height: 150px; position: relative;">
        <canvas id="signature-canvas" class="w-full h-full"></canvas>
        <div id="signature-placeholder" class="signature-placeholder">
            Firma aquí
        </div>
    </div>
    <button type="button" id="btn-clear-signature"
            class="btn-ghost btn-sm mt-2 text-xs">
        Limpiar Firma
    </button>
</div>
Agregar antes del cierre de </main> (modal de retiro):

<!-- Modal: Solicitar Retiro -->
<div class="modal-overlay" id="modal-withdrawal">
    <div class="modal-card">
        <div class="modal-header">
            <h3 class="modal-title">Solicitar Retiro</h3>
            <button class="modal-close" data-modal-close>×</button>
        </div>
        <form id="form-withdrawal">
            <div class="modal-body">
                <div class="form-group mb-4">
                    <label class="form-label">Monto a Retirar</label>
                    <input type="number" id="withdrawal-amount"
                           class="input w-full" placeholder="0.00"
                           step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Razón del Retiro</label>
                    <textarea id="withdrawal-reason" class="input w-full"
                              rows="3" placeholder="Ej: Caja saturada" required></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" data-modal-close>
                    Cancelar
                </button>
                <button type="submit" class="btn-primary">
                    Solicitar
                </button>
            </div>
        </form>
    </div>
</div>

Agregar botón de retiro antes del formulario de cierre (línea ~69):

^

<!-- Botón Solicitar Retiro -->
<div class="mb-6 w-full">
    <button type="button" id="btn-request-withdrawal"
            class="btn-warning w-full py-3 text-sm tracking-widest">
        SOLICITAR RETIRO
    </button>
</div>
### Manejo de Errores y Casos de Borde (Edge Cases)

Para garantizar una experiencia de usuario robusta y prevenir inconsistencias en los datos de caja, se implementarán las siguientes validaciones:

1.  **Sin Jornada Activa**:
    - **Validación**: `if (!currentWorkDay)`.
    - **Acción**: Bloqueo total de la UI operativa. Mostrar mensaje en `#step-select-terminal`: _"No hay jornada activa. Contacta al encargado para iniciar el día."_

2.  **Sin Terminales Asignadas**:
    - **Validación**: `if (terminals.length === 0)`.
    - **Acción**: Renderizar en `#terminal-list-container`: _"No tienes terminales asignadas. Espera a que el encargado te asigne una para operar."_

3.  **Terminal ya Cerrada o en Revisión**:
    - **Validación**: `if (['submitted', 'verified', 'closed'].includes(terminal.status))`.
    - **Acción**: Deshabilitar inputs del formulario de cierre (modo Read-Only) y mostrar mensaje: _"Tu cierre está siendo revisado o ya ha sido finalizado."_

4.  **Validación de Integridad de Montos**:
    - **Validación**: `if (cash < 0 || zoco < 0)`.
    - **Acción**: Bloquear `submit` y disparar `window.Toast.error('Los montos no pueden ser negativos')`.

5.  **Resiliencia de Conexión (Supabase)**:
    - **Implementación**: Bloques `try/catch` en todas las peticiones asíncronas.
    - **Acción**: Loguear error con prefijo `[StaffCaja]` y notificar al usuario: _"Error de conexión. Revisa tu internet e intenta nuevamente."_

## Orden de Implementación

### FASE 1: Setup Base (30 min)

- [x] Crear esqueleto IIFE con secciones comentadas.
- [x] Mapear todos los elementos HTML en objeto `ui`.
- [x] Definir objeto `state` con propiedades necesarias.
- [x] Verificar que `Auth.guardOrRedirect` funciona correctamente.

### FASE 2: Flujo de Convocaciones (1 hora)

- [x] Implementar `loadConvocations()`.
- [x] Implementar `renderConvocationCard()`.
- [x] Implementar `handleConfirmConvocation()`.
- [x] **Testing**: Confirmar convocación y verificar `UPDATE` en base de datos.

### FASE 3: Selección de Terminal (1.5 horas)

- [x] Implementar `loadAssignedTerminals()`.
- [x] Implementar `renderTerminalSelection()`.
- [x] Implementar lógica de auto-selección si solo hay 1 terminal.
- [x] Implementar `handleTerminalSelection()`.
- [x] **Testing**: Probar comportamiento con 0, 1 y múltiples terminales.

### FASE 4: Dashboard Básico (1 hora)

- [x] Implementar `loadTerminalData()`.
- [x] Implementar `renderDashboard()`.
- [x] Implementar `handleChangeTerminal()`.
- [x] **Testing**: Verificar carga correcta de datos y navegación entre terminales.

### FASE 5: Movimientos Pendientes (1 hora)

- [x] Implementar `renderPendingMovements()`.
- [x] Agregar modal de retiro al HTML.
- [x] Implementar `handleRequestWithdrawal()`.
- [x] **Testing**: Crear retiro y verificar `INSERT` en `cash_movements`.

### FASE 6: Firma Digital (1.5 horas)

- [x] Agregar elementos de canvas al HTML.
- [x] Implementar `initSignaturePad()` (reutilizar lógica de encargado).
- [x] Implementar `clearSignature()`.
- [x] **Testing**: Dibujar y verificar generación de `toDataURL()`.

### FASE 7: Cierre de Turno (1 hora)

- [x] Implementar `handleSubmitClosing()`.
- [x] Validar firma obligatoria y montos no negativos.
- [x] Implementar `UPDATE` de `closing_terminals`.
- [x] **Testing**: Cerrar turno y verificar cambios de estado en BD.

### FASE 8: Realtime (1 hora)

- [x] Implementar `startRealtime()` (suscripción a movimientos).
- [x] Implementar `handleMovementUpdate()`.
- [x] Implementar cleanup de suscripciones al cambiar terminal.
- [x] **Testing**: Confirmar retiro desde panel de encargado y verificar actualización reactiva.

### FASE 9: Edge Cases (1 hora)

- [x] Implementar detección de jornada cerrada (bloqueo total de UI).
- [x] Implementar mensajes informativos para casos sin terminales asignadas.
- [x] Implementar validaciones de integridad de formulario.
- [x] **Testing**: Probar todos los escenarios críticos identificados en la sección de Edge Cases.

### FASE 10: Pulido y QA (1 hora)

- [x] Verificar _loading states_ en todas las acciones asíncronas.
- [x] Asegurar bloques `try-catch` y manejo de errores consistente.
- [x] Validar feedback visual (`window.Toast`) en cada acción de éxito/error.
- [x] Limpiar logs de depuración y formatear código.
- [x] **Testing Final**: Recorrido completo del flujo de usuario (End-to-End).

**Tiempo Total Estimado**: 10-12 horas de desarrollo efectivo.
