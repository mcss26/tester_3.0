# Encargado Barra - Control de Stock (Noche)

> **Ruta**: `pages/encargados/encargado-barra-noche.html`
> **Roles**: Encargado Barra, Admin
> **Última Actualización**: 2026-01-29

## Objetivo Operativo

Controlar el inventario de la barra durante el turno, registrando los niveles de stock al abrir y cerrar la sesión para garantizar la trazabilidad de los insumos.

## Flujo Principal (Workflows)

### 1. Apertura de Barra
1. El usuario ingresa; si hay jornada abierta y no tiene sesión, el sistema muestra la vista de Apertura.
2. El sistema carga los productos activos de `master_sku`.
3. El usuario ingresa el stock inicial físico y notas (opcional).
4. Al confirmar, se crea una entrada en `bar_sessions` y múltiples registros de stock en `bar_stock_snapshots` (type: opening).

### 2. Barra Activa
1. El sistema muestra un indicador de tiempo transcurrido desde la apertura.
2. El usuario opera normalmente hasta el final de su turno.

### 3. Cierre de Barra
1. El usuario pulsa "🛑 Cerrar Barra".
2. El sistema despliega el listado de productos para ingreso de stock final (sobrante).
3. Al confirmar (vía modal), el sistema actualiza `bar_sessions` a `status='closed'` y registra los snapshots finales (type: closing).

## Modelo de Datos

| Operación | Tablas / Vistas |
|:----------|:---|
| **Lectura** | `work_days`, `bar_sessions`, `bar_stock_snapshots`, `master_sku` |
| **Escritura** | `bar_sessions`, `bar_stock_snapshots` |

## Dependencias Técnicas

- **Scripts Core**: `core/config.js`, `core/supabase-client.js`, `core/auth.js`, `core/utils.js`, `core/toast.js`
- **Módulos**: `work-day-helper.js`, `index-navigation.js`, `encargados/encargado-barra-noche.js`
- **Lógica Específica**: Gestión de estados `setPageState` (Multiple states logic).
