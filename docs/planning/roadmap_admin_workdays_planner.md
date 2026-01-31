# Roadmap: Planificador de Jornadas - Centro de Comando Pre-Operativo

## Resumen Ejecutivo
Transformar el módulo `admin-workdays` de un simple listado de jornadas a un dashboard estratégico de **Presupuestación Base Cero**. El objetivo es permitir al administrador planificar la operación completa (personal y costos fijos) antes de abrir la jornada, generando automáticante las obligaciones financieras y KPIs de rentabilidad proyectada (Break-even).

---

## Flujo de Negocio (ZBB)

1. **Definición del Evento (Panel A)**:
   - Se selecciona una fecha y se vincula opcionalmente a un evento del calendario.
   - Se marca si es una noche de "Alta Demanda" (influye en la planificación sugerida).

2. **Dimensionamiento de Personal (Panel B)**:
   - Se indica la cantidad de staff por rol.
   - El sistema calcula en tiempo real el costo total de nómina basado en `base_rate`.

3. **Asignación de Costos de Apertura (Panel C)**:
   - Se listan los costos predefinidos (Hielo, Seguridad Externa, Limpieza, etc.).
   - Se permite ajustar montos específicos para esa noche puntual.

4. **Análisis de Punto de Equilibrio (Real-time KPIs)**:
   - El dashboard muestra: `Costo Staff + Costo Fijo = Inversión Inicial`.
   - El admin visualiza el "Break-even" antes de confirmar.

5. **Apertura y Generación de Deuda**:
   - Al confirmar, el sistema crea la jornada en estado `planning`.
   - **Novedad**: Se insertan automáticamente registros en `accounts_payable` para cada costo de apertura, integrándose con el ciclo de pagos.

---

## Estado Actual vs Requerido

| Característica | Estado Actual | Estado Requerido |
| :--- | :--- | :--- |
| **Layout** | Listado + Panel Lateral | Dashboard de 3 Paneles |
| **KPIs** | No existen | Costo Staff, Costo Fijo, Total |
| **Costos Operativos** | No se contemplan | Panel C (Opening Costs) |
| **Vínculo Eventos** | Campo de texto libre | Selector de tabla `events` |
| **Integración Pagos** | Manual | Automática (via `accounts_payable`) |
| **State Management** | Local simple | State persistente durante edición |

---

## Decisiones de Diseño

- **UI/UX**: Se utilizará un layout de 3 columnas (A: Evento, B: Staff, C: Costos) con un header pegajoso para los KPIs globales.
- **Persistencia**: Solo se guarda en la base de datos al hacer clic en "Confirmar". No hay autoguardado de borradores en esta fase.
- **Trazabilidad**: Las cuentas por pagar generadas tendrán el `source_type: 'opening_cost'` para diferenciar gastos operativos de compras de insumos.
- **Frozen CSS**: Se utilizarán las clases `.planner-*` integradas en `components.css`.

---

## Plan de Implementación

### Fase 1: Estructura HTML & UX (~20%)
- Reemplazar el contenedor principal de `admin-workdays.html`.
- Implementar el Header de KPIs con badges dinámicos.
- Crear los contenedores para los 3 paneles operativos.

### Fase 2: Lógica de Estado y Datos (~40%)
- Refactorizar `admin-workdays.js` para usar un `state` centralizado.
- Implementar cargadores paralelos (`Promise.all`) para Roles, Costos de Apertura y Eventos Próximos.
- Lógica de actualización de KPIs ante cualquier cambio en inputs.

### Fase 3: Integración Financiera (~30%)
- Modificar el flujo de guardado para incluir la inserción masiva en `accounts_payable`.
- Implementar validaciones de seguridad (no permitir planificar el mismo día dos veces, validación de fechas pasadas).
- Sanitización de inputs numéricos.

### Fase 4: QA & Polish (~10%)
- Pruebas de cálculo (Staff Cost vs Fixed Cost).
- Verificación de inserción en DB.
- Feedback visual con `Toast` y estados de carga.

---

## Archivos a Modificar

| Archivo | Responsabilidad |
| :--- | :--- |
| `pages/admin/admin-workdays.html` | Nuevo layout de dashboard y 3 paneles. |
| `assets/js/modules/admin/admin-workdays.js` | Refactorización completa de lógica y cálculos. |
| `assets/css/components.css` | Adición de clases `.planner-*` y estilos de grid. |

---

## Verificación (QA Checklist)

- [ ] **KPI Staff**: Al sumar un rol con tasa $10,000, el KPI "Costo Staff" debe actualizarse al perder el foco del input.
- [ ] **Reset de Costos**: El botón ↺ en el Panel C debe restaurar el monto al `default_amount` original.
- [ ] **Selector de Eventos**: Solo deben aparecer eventos futuros (próximos 30 días).
- [ ] **Confirmación**: Al confirmar, se debe crear 1 registro en `work_days`, N en `work_day_staff_planning` y M en `accounts_payable`.
- [ ] **Seguridad**: Intentar crear una jornada para una fecha que ya tiene una jornada (Open/Closed) debe arrojar error.

---

## Criterios de Éxito
1. El Administrador puede ver el costo total de apertura ANTES de iniciar la noche.
2. Los gastos de apertura aparecen automáticamente en el Panel de Pagos (`admin-pagos.html`) como pendientes.ı
3. El dashboard es responsivo y mantiene el estándar visual Aurora Red / Midnight.
