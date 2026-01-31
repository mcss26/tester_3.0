---
name: Documentation Generator
description: Auto-generates operational documentation (fichas) for FormulaMid 4 modules by analyzing source code.
---

# Skill: Documentation Generator

> **Última Actualización**: 2026-01-29
> **Objetivo**: Proveer información operativa clara y concisa para agentes y desarrolladores.

---

## 1. Definición de "Módulo"

Un **módulo** se define como una unidad funcional representada por una página principal en la carpeta `pages/` (ej. `admin-cierre.html`, `staff-cierre.html`).

---

## 2. Estructura de Archivos

La documentación debe residir en `docs/modules/` y reflejar la estructura de carpetas de `pages/`.

| Código | Documentación |
|:-------|:--------------|
| `pages/admin/admin-cierre.html` | `docs/modules/admin/admin-cierre.md` |
| `pages/encargados/encargado-caja-noche.html` | `docs/modules/encargados/encargado-caja-noche.md` |

---

## 3. Formato de la "Ficha de Módulo"

Cada módulo debe tener una ficha en Markdown con la siguiente estructura mínima:

### 3.1 Encabezado

```markdown
# [Nombre del Módulo]

> **Ruta**: `pages/[categoria]/[archivo].html`
> **Roles**: Admin, Encargado (según corresponda)
> **Última Actualización**: YYYY-MM-DD
```

### 3.2 Objetivo Operativo

- ¿Qué problema resuelve este módulo?
- ¿Cuál es el resultado esperado de su uso?

### 3.3 Flujo Principal (Workflows)

Lista numerada de pasos que realiza el usuario:

```markdown
1. Usuario ingresa a la pantalla
2. Sistema carga datos desde `tabla_x`
3. Usuario hace click en "Acción"
4. Sistema guarda en `tabla_y`
```

### 3.4 Modelo de Datos

| Operación | Tablas |
|:----------|:-------|
| **Lectura** | `tabla_a`, `vista_b` |
| **Escritura** | `tabla_c` |

### 3.5 Dependencias Técnicas

- Scripts: `core/auth.js`, `core/utils.js`
- APIs: Supabase Auth, Supabase Realtime (si aplica)

---

## 4. Procedimiento de Generación

### 4.1 Análisis del Código

1. **Leer HTML**: Identificar `<title>`, headings, formularios y botones.
2. **Leer JS**: Buscar:
   - `Auth.guardOrRedirect(['roles'])` → Roles permitidos
   - `sb.from('tabla')` → Tablas de lectura/escritura
   - Funciones principales → Flujos de trabajo

### 4.2 Generar Markdown

Usar la plantilla de sección 3 y completar con la información extraída.

### 4.3 Guardar

- **Ubicación**: `docs/modules/[categoria]/[nombre-modulo].md`
- **Nombrado**: Igual que el archivo HTML (sin extensión)

---

## 5. Reglas de Mantenimiento

> [!IMPORTANT]
> **Regla de Oro**: Si cambias la lógica (`.js`) o la estructura (`.html`), **DEBES** actualizar la ficha correspondiente.

- **Antes de asignar tarea**: Verificar que la ficha exista y esté actualizada.
- **Después de implementar**: Actualizar la fecha y los flujos modificados.

---

## 6. Ejemplo de Prompt

```
Generar documentación para `pages/admin/admin-cierre.html`. 
Guardar en `docs/modules/admin/admin-cierre.md`.
```
