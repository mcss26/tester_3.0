# Gerencia: Balance Semanal

> **Rol**: Gerente / Admin / Contable
> **Ruta**: `pages/gerencia/balance-semanal.html`
> **JS**: `assets/js/modules/gerencia/balance-semanal.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-02-08

---

## 1. Información General

### 1.1 ¿Quién lo usa?

**Gerencia** y **Administración** para la toma de decisiones financieras.

### 1.2 ¿Qué hace?

Proporciona una vista consolidada de **Ingresos vs Gastos** agrupados por semana operativa. Calcula automáticamente la utilidad (Profit) y el margen operativo.

### 1.3 ¿Cómo lo hace?

Consume la vista materializada (o virtual) `vw_finance_weekly` de Supabase, que agrega transacciones de todos los canales (Bar, Entradas, Caja) y gastos registrados.

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada

- **Navegación**: Desde el Portal Central o Dashboard Gerencial.

### 2.2 Flujo Principal

1. Al cargar, el sistema consulta datos del año en curso.
2. Muestra 3 tarjetas KPI clave en la parte superior:
   - **Ingresos Totales**: Suma bruta de ventas.
   - **Gastos Operativos**: Suma de compras y pagos.
   - **Profit Semanal**: Diferencia neta y % de margen.
3. Debajo, una tabla detalla semana a semana el desglose.
4. Un gráfico de líneas (Chart.js) permite visualizar la tendencia.

### 2.3 Inputs y Acciones Clave

- **Filtros de Tiempo**: Selectores de Año y Mes.
- **Exportar**: Botón para descargar CSV.
- **Gráfico**: Se carga bajo demanda (Lazy Load) para no bloquear el renderizado inicial.

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
| :--- | :--- | :--- |
| **Lectura** | `vw_finance_weekly` | year_number, week_number, income_gross, expenses_total, operating_profit |

### 3.2 Lógica de Negocio

- **Agrupación Semanal**: La vista DB hace el trabajo pesado de agrupar por `WEEK(date)`.
- **Cálculo de Margen**: `(Profit / Ingresos) * 100`.
- **Estimación Impositiva**: La vista también calcula un aproximado de IVA a pagar (`tax_vat_payable`) basado en la configuración de impuestos.

---

## 4. Componentes UI

### 4.1 Estructura

- **Layout**: `operativo-header` (estilo oscuro inmersivo) + shell fluido.
- **Visualización**:
  - `stat-card`: Tarjetas de alto impacto visual.
  - `table-sticky`: Tabla de datos densos.
  - `chart-card`: Contenedor para Canvas de Chart.js.

### 4.2 Estados del Sistema

| Estado | UI |
| :--- | :--- |
| **Loading** | Spinner oscuro. |
| **Tendencia** | Flechas verdes/rojas en KPIs (vs semana anterior - roadmap). |
| **Profit Negativo** | Los montos se tiñen de rojo (`text-error`) automáticamente. |

---

## 5. Dependencias

### 5.1 Scripts Core

- `core/chart-loader.js` (Cargador dinámico de Chart.js)
- `core/auth.js`
- `core/utils.js`

### 5.2 Librerías

- **Chart.js**: Renderizado de gráficos.

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso

- **Roles**: `admin`, `gerente`, `contable`.
- **Privacidad**: Los datos son sensibles, por lo que RLS debe restringir acceso a la vista `vw_finance_weekly` solo a estos roles.

---

## 7. Decisiones Arquitectónicas

### 7.1 Backend-for-Frontend (View pattern)

En lugar de calcular totales iterando miles de transacciones en JS (lento e inseguro), se delegó la lógica de agregación a PostgreSQL (`vw_finance_weekly`). El Frontend solo "presenta" el resultado pre-calculado.

### 7.2 Lazy Chart

La librería de gráficos es pesada. Usamos `chart-loader.js` para bajarla solo si hay datos para mostrar, mejorando el Time-to-Interactive.

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Por qué no coinciden los gastos con mis facturas de hoy?**
R: El reporte agrupa por **fecha de devengado** (cuándo se generó la obligación), no necesariamente fecha de pago.

**P: ¿Puedo ver el detalle de una semana?**
R: Actualmente es una vista "macro". Para ver detalle, se debe ir a los reportes de `admin-reportes.html`.
