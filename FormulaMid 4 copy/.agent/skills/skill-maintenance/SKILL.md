---
name: skill-maintenance
description: Meta-skill para mantener, actualizar y optimizar otras skills del proyecto. Invocar cuando se detecten skills desactualizadas, referencias rotas, o cuando se necesite crear/refactorizar skills existentes.
---

# Skill Maintenance (Meta-Skill)

> **Propósito**: Mantener la salud y calidad de todas las skills del proyecto.  
> **Alcance**: Creación, actualización, validación y optimización de archivos SKILL.md.  
> **Frecuencia**: Ejecutar después de cambios arquitectónicos significativos o al menos una vez por sprint.

---

## 🎯 Responsabilidades

1. **Auditar Skills**: Verificar que cada skill esté alineada con la realidad del código
2. **Crear Skills Nuevas**: Generar skills con estructura robusta y sin errores
3. **Actualizar Skills**: Mantener referencias, clases CSS, patrones JS actualizados
4. **Optimizar Skills**: Mejorar claridad, eliminar redundancias, agregar ejemplos
5. **Validar Índice**: Asegurar que `README.md` refleje todas las skills existentes

---

## 📋 Procedimiento de Auditoría

### Paso 1: Inventariar Skills

```bash
# Listar todas las skills existentes
ls -la .agent/skills/*/SKILL.md
```

### Paso 2: Verificar Cada Skill

Para cada `SKILL.md`, validar:

| Check                    | Pregunta                                                        |
| :----------------------- | :-------------------------------------------------------------- |
| **Frontmatter válido**   | ¿Tiene `---` + `name` + `description` + `---`?                  |
| **Referencias existen**  | ¿Los archivos citados (`tokens.css`, `components.css`) existen? |
| **Clases correctas**     | ¿Las clases CSS mencionadas existen en `components.css`?        |
| **Tokens correctos**     | ¿Los tokens CSS mencionados existen en `tokens.css`?            |
| **Patrones JS actuales** | ¿El código de ejemplo sigue el patrón IIFE async actual?        |
| **Sin texto basura**     | ¿No hay explicaciones/comentarios fuera del contenido útil?     |
| **Checklist completo**   | ¿Tiene sección de verificación QA?                              |

### Paso 3: Verificar Índice

Comparar `README.md` contra carpetas físicas:

```bash
# Skills listadas vs existentes
diff <(grep -o '\[.*\](.*/SKILL.md)' README.md | sort) <(ls -d */SKILL.md | sort)
```

---

## 🔧 Template de Skill Robusta

````markdown
---
name: nombre-skill
description: Descripción clara de cuándo invocar esta skill. Incluir keywords para auto-detección.
---

# Nombre de la Skill

> **Fuente de Verdad**: [archivo-principal.md](file:///ruta/absoluta)  
> **Última Actualización**: YYYY-MM-DD

---

## 🛑 Restricciones Críticas (NO IGNORAR)

1. Regla obligatoria 1
2. Regla obligatoria 2

---

## 📐 Estructura/Patrón Principal

`código o template`

---

## 🎨 Diccionario de Elementos

### Categoría 1

| Elemento | Valor/Clase | Notas |
| :------- | :---------- | :---- |
| Item     | Valor       | Nota  |

### Categoría 2

| Elemento | Valor/Clase | Notas |
| :------- | :---------- | :---- |
| Item     | Valor       | Nota  |

---

## ⚡ Patrón de Código (si aplica)

```javascript
// Código de ejemplo completo y funcional
```
````

---

## ✅ Checklist de Calidad (Definition of Done)

Antes de cerrar la tarea, verificar:

- [ ] Check 1
- [ ] Check 2
- [ ] Check 3

---

## 🔗 Referencias

- [Doc 1](file:///ruta)
- [Doc 2](file:///ruta)

````

---

## 🚨 Errores Comunes a Detectar

### 1. Frontmatter Inválido

```markdown
❌ INCORRECTO (línea vacía antes)

---
name: skill
---

✅ CORRECTO
---
name: skill
description: ...
---
````

### 2. Clases CSS Inexistentes

```markdown
❌ INCORRECTO
| Table | `table-shell` | (no existe en components.css)

✅ CORRECTO
| Table | `table-viewport table-scroll` | (existen)
```

### 3. Tokens CSS Inexistentes

```markdown
❌ INCORRECTO
`var(--app-bg)` | (no existe en tokens.css)

✅ CORRECTO
`var(--bg-base)` | (existe)
```

### 4. Texto Explicativo Fuera de Lugar

```markdown
❌ INCORRECTO (al final del archivo)
```

### Por qué esta estructura:

1. Explicación innecesaria...

```

✅ CORRECTO
(El archivo termina con la última sección útil)
```

### 5. Patrones JS Obsoletos

```javascript
❌ INCORRECTO
const session = await Auth.guardOrRedirect();
// Sin 'use strict', sin IIFE

✅ CORRECTO
(async function () {
    'use strict';
    const session = await window.Auth.guardOrRedirect(['admin']);
    if (!session) return;
    // ...
})();
```

---

## 📊 Fuentes de Verdad para Validación

| Tipo                | Archivo                                                  |
| :------------------ | :------------------------------------------------------- |
| **Tokens CSS**      | `assets/css/tokens.css`                                  |
| **Componentes CSS** | `assets/css/components.css`                              |
| **Patrones HTML**   | `docs/architecture/standard-module-guide.md`             |
| **Patrones JS**     | `docs/architecture/standard-module-guide.md` (sección 4) |
| **Estándares UI**   | `docs/architecture/ui-standards.md`                      |
| **Índice Skills**   | `.agent/skills/README.md`                                |

---

## ✅ Checklist de Mantenimiento

Ejecutar periódicamente:

- [ ] **Inventario**: ¿Todas las carpetas en `skills/` tienen `SKILL.md`?
- [ ] **Índice sincronizado**: ¿`README.md` lista todas las skills existentes?
- [ ] **Referencias válidas**: ¿Los links `file://` apuntan a archivos existentes?
- [ ] **Clases actuales**: ¿Las clases CSS citadas existen en `components.css`?
- [ ] **Tokens actuales**: ¿Los tokens citados existen en `tokens.css`?
- [ ] **Patrones vigentes**: ¿El código de ejemplo sigue el patrón actual?
- [ ] **Sin duplicados**: ¿No hay skills con responsabilidades solapadas?
- [ ] **Fechas actualizadas**: ¿Las fechas de última actualización son recientes?

---

## 🔄 Flujo de Trabajo

### Crear Skill Nueva

1. Crear carpeta: `.agent/skills/nombre-skill/`
2. Crear `SKILL.md` usando el template
3. Validar contra fuentes de verdad
4. Actualizar `README.md` con la nueva skill
5. Probar invocando la skill en un caso real

### Actualizar Skill Existente

1. Leer la skill actual
2. Cruzar con fuentes de verdad (`tokens.css`, `components.css`, `standard-module-guide.md`)
3. Identificar discrepancias
4. Corregir referencias, clases, tokens
5. Actualizar fecha de última actualización
6. Verificar que no se rompió ningún ejemplo

### Eliminar Skill

1. Verificar que ninguna otra skill la referencia
2. Verificar que `README.md` no la lista como dependencia
3. Eliminar carpeta
4. Actualizar `README.md`

---

## 🔗 Referencias

- [Skills Index](file:///Users/lucianopieve/Documents/FormulaMid%204/.agent/skills/README.md)
- [Standard Module Guide](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/standard-module-guide.md)
- [UI Standards](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/ui-standards.md)
- [Tokens CSS](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/css/tokens.css)
- [Components CSS](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/css/components.css)
