---
name: logic-engineer
description: Lógica JavaScript, validaciones de negocio, seguridad y patrones de código para FormulaMid 4.
---

# Skill: Logic Engineer (Reglas de Negocio)

> **Fuente de Verdad**: `docs/architecture/standard-module-guide.md` (Estructura JS), `assets/js/core/` (Utilidades).
> **Última Actualización**: 2026-01-29

Este documento contiene los patrones de lógica JS y validaciones de negocio obligatorias.

---

## 1. Seguridad

### 1.1 Guard de Autenticación

> [!CAUTION]
> **OBLIGATORIO** al inicio de CADA módulo JS.

```javascript
(async function() {
    'use strict';
    
    // Guard obligatorio - roles permitidos para este módulo
    const authResult = await window.Auth.guardOrRedirect(['admin', 'encargado']);
    if (!authResult) return; // Usuario redirigido al login
    
    const { user, profile } = authResult;
    
    // Resto del código...
})();
```

### 1.2 Roles y Permisos

| Rol | Landing | Accesos |
|:----|:--------|:--------|
| `admin` | `/pages/admin/` | Todo el sistema |
| `gerencia` | `/pages/gerencia/` | Reportes, KPIs |
| `encargado` | `/pages/encargados/` | Operaciones, personal, cierres |
| `contable` | `/pages/contable/` | Finanzas, pagos |
| `logistica` | `/pages/logistica/` | Stock, recepciones |
| `barra` | `/pages/staff/` | Solicitudes de stock |
| `caja` | `/pages/staff/` | Movimientos de caja |
| `puerta` | `/pages/puerta/` | Control de acceso |

### 1.3 Verificación de Cliente Supabase

```javascript
// Siempre verificar que el cliente esté disponible
if (!window.Utils.assertSbOrShowBlockingError()) return;
```

---

## 2. Patrón de Módulo JS (IIFE Async)

> [!IMPORTANT]
> Todo módulo debe seguir esta estructura exacta definida en `docs/architecture/standard-module-guide.md`.

```javascript
(async function() {
    'use strict';
    
    // 1. Guard de autenticación
    const authResult = await window.Auth.guardOrRedirect(['admin']);
    if (!authResult) return;
    const { user, profile } = authResult;
    
    // 2. Verificar cliente Supabase
    if (!window.Utils.assertSbOrShowBlockingError()) return;
    
    // 3. Referencias DOM
    const refs = {
        table: document.getElementById('dataTable'),
        searchInput: document.getElementById('searchInput'),
        btnNew: document.getElementById('btnNew'),
        // ...
    };
    
    // 4. Estado local
    let state = {
        items: [],
        selectedId: null,
        isLoading: false
    };
    
    // 5. Funciones de carga de datos
    async function loadData() {
        try {
            const { data, error } = await window.sb
                .from('mi_tabla')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            state.items = data || [];
            renderTable();
        } catch (err) {
            console.error(err);
            window.Toast.error('Error al cargar datos');
        }
    }
    
    // 6. Funciones de renderizado
    function renderTable() {
        // ...
    }
    
    // 7. Event listeners
    refs.btnNew?.addEventListener('click', () => openPanel('formPanel'));
    refs.searchInput?.addEventListener('input', 
        window.Utils.debounce(handleSearch, 300)
    );
    
    // 8. Inicialización
    loadData();
})();
```

---

## 3. Validaciones de Negocio

### 3.1 Cierre de Caja

```javascript
// Validación: No cerrar con diferencias fuera de tolerancia
const TOLERANCIA_CAJA = 500; // ARS

function validarCierreCaja(totalSistema, totalDeclarado) {
    const diferencia = Math.abs(totalDeclarado - totalSistema);
    
    if (diferencia > TOLERANCIA_CAJA) {
        window.Toast.error(`Diferencia de $${diferencia} excede la tolerancia permitida`);
        return false;
    }
    
    return true;
}
```

### 3.2 Permisos de Cierre de Jornada

```javascript
// Solo SUPERVISOR o superior puede cerrar jornada
const ROLES_CIERRE_JORNADA = ['admin', 'encargado', 'gerencia'];

function puedeEsteCerrarJornada(profile) {
    return ROLES_CIERRE_JORNADA.includes(profile.role);
}

// Uso
if (!puedeEsteCerrarJornada(profile)) {
    window.Toast.error('No tienes permisos para cerrar la jornada');
    return;
}
```

### 3.3 Validación de Recepción vs Orden de Compra

```javascript
async function validarRecepcion(ordenId, itemsRecibidos) {
    // Obtener items de la orden original
    const { data: ordenItems, error } = await window.sb
        .from('replenishment_supplier_order_items')
        .select('sku_id, quantity_ordered')
        .eq('order_id', ordenId);
    
    if (error) {
        window.Toast.error('Error al validar orden');
        return false;
    }
    
    // Comparar cantidades
    for (const recibido of itemsRecibidos) {
        const ordenado = ordenItems.find(o => o.sku_id === recibido.sku_id);
        
        if (!ordenado) {
            window.Toast.warning(`SKU ${recibido.nombre} no estaba en la orden`);
        } else if (recibido.cantidad > ordenado.quantity_ordered) {
            window.Toast.warning(
                `${recibido.nombre}: Recibido (${recibido.cantidad}) > Ordenado (${ordenado.quantity_ordered})`
            );
        }
    }
    
    return true;
}
```

---

## 4. Utils Globales

### 4.1 window.Utils.formatARS

Formateo de moneda argentina.

```javascript
const precio = window.Utils.formatARS(15000);
// Resultado: "$15.000,00"

const precio2 = window.Utils.formatARS(1234.5);
// Resultado: "$1.234,50"
```

### 4.2 window.Utils.debounce

Prevención de llamadas excesivas.

```javascript
const searchHandler = window.Utils.debounce((term) => {
    // Ejecutar búsqueda
    filterTable(term);
}, 300);

inputBuscar.addEventListener('input', (e) => {
    searchHandler(e.target.value);
});
```

### 4.3 window.Utils.numberOrNull

Parseo seguro de números.

```javascript
const num = window.Utils.numberOrNull('1.234,56');
// Resultado: 1234.56

const invalid = window.Utils.numberOrNull('abc');
// Resultado: null
```

### 4.4 window.Utils.assertSbOrShowBlockingError

Verificación de cliente Supabase.

```javascript
// Retorna false y muestra error si el cliente no está disponible
if (!window.Utils.assertSbOrShowBlockingError()) return;
```

### 4.5 window.Utils.hide / show / isHidden

Control de visibilidad de elementos.

```javascript
window.Utils.hide(elementoLoader);
window.Utils.show(elementoContenido);

if (window.Utils.isHidden(panel)) {
    openPanel('panel');
}
```

### 4.6 window.Utils.calcReplenishment

Cálculo de reposición por packs.

```javascript
const reposicion = window.Utils.calcReplenishment({
    requerido: 100,
    stock_actual: 25,
    pack_qty: 12
});
// Resultado: { unidades: 75, pack: 7, total: 84 }
```

---

## 5. Manejo de Errores

### 5.1 Try-Catch Estándar

```javascript
async function guardarDatos(datos) {
    try {
        const { data, error } = await window.sb
            .from('mi_tabla')
            .insert(datos)
            .select();
        
        if (error) throw error;
        
        window.Toast.success('Datos guardados correctamente');
        return data;
        
    } catch (err) {
        console.error('Error al guardar:', err);
        window.Toast.error(err.message || 'Error desconocido al guardar');
        return null;
    }
}
```

### 5.2 Validación de Formularios

```javascript
function validarFormulario(form) {
    const campos = {
        nombre: form.querySelector('#nombre'),
        cantidad: form.querySelector('#cantidad'),
        precio: form.querySelector('#precio')
    };
    
    // Validar campos requeridos
    for (const [key, input] of Object.entries(campos)) {
        if (!input.value.trim()) {
            window.Toast.error(`El campo ${key} es requerido`);
            input.focus();
            return null;
        }
    }
    
    // Validar tipos
    const cantidad = window.Utils.numberOrNull(campos.cantidad.value);
    if (cantidad === null || cantidad <= 0) {
        window.Toast.error('Cantidad debe ser un número positivo');
        return null;
    }
    
    return {
        nombre: campos.nombre.value.trim(),
        cantidad,
        precio: window.Utils.numberOrNull(campos.precio.value) || 0
    };
}
```

---

## 6. Patrones de UI

### 6.1 Abrir/Cerrar Panel

```javascript
function openPanel(panelId) {
    document.getElementById('panelOverlay').classList.add('open');
    document.getElementById(panelId).classList.add('open');
}

function closePanel(panelId) {
    document.getElementById('panelOverlay').classList.remove('open');
    document.getElementById(panelId).classList.remove('open');
    document.getElementById(panelId).classList.remove('open');
}
```

### 6.2 Navegación con Transición

```javascript
// Usar siempre data-go en HTML, pero si necesitas redireccionar por JS:
function navigateTo(url) {
    document.body.classList.add('is-leaving');
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}
```

### 6.3 Renderizado de Tabla (Performance)
 
 ```javascript
 function renderTable(items) {
     const tbody = refs.tableBody;
     
     if (!items.length) {
         tbody.innerHTML = `
             <tr>
                 <td colspan="5" class="empty-state">
                     No hay registros para mostrar.
                 </td>
             </tr>
         `;
         return;
     }
     
     // 🚀 Performance: Usar map().join('') SIEMPRE
     // NUNCA usar innerHTML += en un loop
     tbody.innerHTML = items.map(item => `
         <tr class="table-row" data-id="${item.id}">
             <td class="table-cell">${item.nombre}</td>
             <td class="table-cell text-center">${item.cantidad}</td>
             <td class="table-cell text-right">${window.Utils.formatARS(item.precio)}</td>
             <td class="table-cell text-center">
                 <span class="status-pill status-${getStatusClass(item.status)}">
                     ${item.status}
                 </span>
             </td>
             <td class="table-cell text-center">
                 <button class="btn-ghost btn-sm" onclick="editItem('${item.id}')">
                     Editar
                 </button>
             </td>
         </tr>
     `).join('');
 }
 ```

---

## 7. Reglas de Negocio por Módulo

### 7.1 Caja

| Regla | Validación |
|:------|:-----------|
| Cierre con diferencia | `diferencia <= TOLERANCIA_CAJA` |
| Permisos de cierre | `role IN ('admin', 'encargado')` |
| Movimiento requiere terminal | `terminal_id IS NOT NULL` |

### 7.2 Inventario

| Regla | Validación |
|:------|:-----------|
| Recepción vs Orden | `cantidad_recibida <= cantidad_ordenada` (warn if exceeded) |
| Movimiento requiere creador | `created_by IS NOT NULL` |
| Movimiento requiere SKU | `sku_id IS NOT NULL` |

### 7.3 Jornadas

| Regla | Validación |
|:------|:-----------|
| Solo una jornada abierta | `COUNT(status='ABIERTA') <= 1` |
| Cerrar requiere rol | `role IN ('admin', 'encargado', 'gerencia')` |

---

## 8. Development Standards & Integrity

### 8.1 File Safety (Health Check)
> [!IMPORTANT]
> **NEVER** delete a file without checking for references first.

- **Grep Before Delete**: Use `grep_search` to find all references to `.js`, `.css`, or `.html` files before deletion.
- **Ghost Imports**: Remove `<script>` or `<link>` tags immediately if deleting the source file.
- **Archive First**: Move obsolete files to `docs/_archive/` instead of deleting.

### 8.2 Strict Mode & Native Modules
- **Strict Mode**: All new JS modules must be strict.
- **Utils**: Use `window.Utils` for common operations (formatting, alerts).

---

## 9. Checklist de Validación

Al crear lógica JS, verificar:

- [ ] Guard `Auth.guardOrRedirect()` al inicio
- [ ] Verificación `assertSbOrShowBlockingError()`
- [ ] Patrón IIFE async
- [ ] Try-catch en operaciones async
- [ ] Toast para feedback al usuario
- [ ] Validaciones de negocio según módulo
- [ ] No console.log en producción (usar console.error solo para errores)

---

## 10. Mantenimiento de Fuentes de Verdad

> [!CAUTION]
> **Reglas para evitar duplicación de documentación**

### 10.1 Ubicaciones Canónicas

| Tipo de Documento | Ubicación Única | NO crear en |
|:------------------|:----------------|:------------|
| Estado del proyecto | `docs/estado-presente.md` | `.agent/` |
| Roadmap | `docs/roadmap.md` | `.agent/` |
| Utilidades JS | `assets/js/core/utils.js` | Otros archivos |
| Auth patterns | `assets/js/core/auth.js` | Módulos individuales |
| Skills técnicos | `.agent/skills/` | `docs/` |

### 10.2 Reglas de Actualización

1. **Si agregas utility** → Agregar a `utils.js` y documentar en este SKILL.md
2. **Si cambias patrón de auth** → Actualizar este SKILL.md (sección 1)
3. **Si agregas validación de negocio** → Documentar en sección 3 o 7
4. **NUNCA crear archivos duplicados** → Si existe, actualizar el existente

### 10.3 Checklist Pre-Commit

- [ ] ¿Existe ya un archivo similar? → Actualizar, no crear nuevo
- [ ] ¿Las referencias en otros docs apuntan a la fuente correcta?
- [ ] ¿Se actualizó la fecha `Última Actualización` del skill?

---

## 11. Orquestación Post-Tarea

> [!IMPORTANT]
> **Al finalizar cualquier tarea que modifique un módulo JS, DEBES:**

### 11.1 Llamar a `documentation-generator`

Si creaste o modificaste significativamente la lógica de un módulo:

```
Ejecutar skill: documentation-generator
Target: pages/[categoria]/[modulo].html
Output: docs/modules/[categoria]/[modulo].md
```

### 11.2 Actualizar Documentos Relacionados

| Si modificaste... | Actualizar... |
|:------------------|:--------------|
| Nuevo patrón de negocio | Este SKILL.md (sección correspondiente) |
| Nueva utility en core | Este SKILL.md (sección 5) |
| Cambio de flujo de datos | `docs/modules/[modulo].md` (sección Modelo de Datos) |
| Nueva tabla/vista usada | `docs/scheme.md` + `db-architect/SKILL.md` |

### 11.3 Verificación Final

- [ ] Ficha de módulo existe en `docs/modules/`
- [ ] Tablas/vistas usadas documentadas en ficha
- [ ] Validaciones de negocio documentadas

---

## 🔗 Referencias

- [Guía de Módulos](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/standard-module-guide.md) — Anatomía JS y patrón IIFE
- [Estándares UI](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/ui-standards.md) — Principios de feedback
- [Componentes UI](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/ui-components.md) — Estados y validación
- [Utils Core](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/js/core/utils.js) — Helpers globales
