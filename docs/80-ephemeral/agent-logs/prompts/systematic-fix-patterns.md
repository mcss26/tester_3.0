# Remediacion Sistematica — Meta Descriptions + ARIA

> **Instrucciones de ejecucion:** Copia TODO este archivo y pegalo como prompt en el agente ejecutor (ej: Cursor, Claude CLI, otro chat de Antigravity). El agente debe aplicar los cambios archivo por archivo.

---

## Que hacer

Aplicar 2 correcciones sistematicas a 12 archivos HTML. Ambas correcciones son mecanicas y no requieren modificar logica JS ni estructura de layout.

---

## Correccion A: Meta Description (12 archivos)

Agregar `<meta name="description" content="...">` en el `<head>` de cada archivo, inmediatamente **despues** de la linea `<meta name="theme-color" content="#000000">` y **antes** de `<link rel="icon">`.

Textos exactos por archivo:

```
pages/encargados/encargado-barra-noche.html → "Cierre nocturno de barra — verificacion de caja y stock para Encargado"
pages/encargados/encargado-caja-noche.html  → "Cierre nocturno de caja — arqueo y conciliacion para Encargado"
pages/encargados/encargado-recepcion.html   → "Recepcion de pedidos — verificacion de entregas de proveedores"
pages/admin/admin-workdays.html             → "Gestion de jornadas laborales — apertura, planificacion y cierre"
pages/admin/admin-config.html               → "Configuracion del sistema — perfil, roles y parametros generales"
pages/admin/admin-reportes.html             → "Reportes y analisis — dashboards financieros y operativos"
pages/admin/admin-semanal.html              → "Balance semanal — consolidado de ingresos, gastos y metricas"
pages/operativo/operativo-solicitudes.html  → "Solicitudes de compra — creacion y seguimiento de pedidos a proveedores"
pages/operativo/operativo-analisis.html     → "Analisis operativo — metricas de rendimiento y tendencias"
pages/operativo/cms-members.html            → "CMS de Miembros — gestion de membresias y datos de clientes"
pages/staff/staff-caja-index.html           → "Terminal de caja — punto de venta y registro de transacciones"
pages/logistica/logistica-index.html        → "Panel logistico — distribucion de stock y control de entregas"
```

Ejemplo de como debe quedar:

```html
<!-- ANTES -->
<meta name="theme-color" content="#000000" />
<link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />

<!-- DESPUES -->
<meta name="theme-color" content="#000000" />
<meta
  name="description"
  content="Cierre nocturno de barra — verificacion de caja y stock para Encargado"
/>
<link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />
```

---

## Correccion B: ARIA Labels (en los mismos 12 archivos)

Mientras editas cada archivo para la Correccion A, revisa TODOS los `<button>` e `<input>` y agrega `aria-label` a los que no lo tengan:

### Reglas

- `<button>` con solo icono/emoji → agregar `aria-label="[descripcion de la accion]"`
- `<input>` sin `<label>` asociado → agregar `aria-label="[descripcion del campo]"`
- `<select>` sin `<label>` asociado → agregar `aria-label="[descripcion del selector]"`
- `<button>` con texto visible (ej: `<button>Guardar</button>`) → NO necesita `aria-label`

Ejemplo:

```html
<!-- ANTES -->
<button class="btn-icon" id="btn-refresh">↻</button>

<!-- DESPUES -->
<button class="btn-icon" id="btn-refresh" aria-label="Actualizar datos">
  ↻
</button>
```

---

## Restricciones

1. **NO** modificar IDs existentes
2. **NO** modificar logica JS (no tocar `<script>` tags ni archivos .js)
3. **NO** modificar estructura del layout (topbar, main, footer)
4. **NO** agregar clases CSS que no existan ya en el proyecto
5. **NO** tocar `balance-semanal.html` (esta en `pages/gerencia/`, no en la lista)

---

## Verificacion post-ejecucion

Despues de aplicar, ejecutar en PowerShell:

```powershell
# Contar paginas sin meta description (debe dar 0 resultados de las 12 editadas)
Get-ChildItem pages -Recurse -Filter *.html | Where-Object {
  $c = Get-Content $_.FullName -Raw
  $c -notmatch 'name="description"'
} | Select-Object -ExpandProperty Name
```
