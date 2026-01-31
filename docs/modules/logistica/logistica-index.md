# Logística Index

**Ruta**: `pages/logistica/logistica-index.html`
**Roles**: `logistico`

## Objetivo Operativo

Pantalla de bienvenida y hub de navegación para el rol de Logística. Centraliza el acceso a las funcionalidades de recepción, distribución y control de inventario del depósito.

## Flujo Principal

1.  **Bienvenida**: Saludo personalizado con el nombre del usuario logístico.
2.  **Dashboard Rápido** (opcional a futuro): Contadores de:
    - Pedidos pendientes de despacho
    - Recepciones esperadas hoy
    - Alertas de stock crítico
3.  **Navegación**: Links a los sub-módulos:
    - Stock Depósito
    - Distribución a Barras
    - Recepción de Mercadería

## Modelo de Datos

**Lectura**:

- `profiles`: Nombre del usuario logueado.
- `replenishment_requests`: Conteo de pedidos pendientes (para dashboard).
- `replenishment_supplier_orders`: Órdenes con llegada esperada hoy.

## Dependencias Técnicas

- `assets/js/core/auth.js`: Validación de sesión y rol.
- `assets/js/modules/index-navigation.js`: Manejo de navegación interna.
