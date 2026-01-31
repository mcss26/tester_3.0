---
name: Markdown Formatter
description: Experto en formatear, convertir y estandarizar textos a Markdown con alta calidad y consistencia.
tags: [documentation, formatting, markdown, text-processing]
version: 1.0.0
---

# Markdown Formatter

## Propósito

Skill especializada en transformar texto plano, código, datos estructurados o markdown deficiente en documentos markdown de alta calidad, siguiendo convenciones estándar y mejores prácticas.

---

## Cuándo Invocar

- El usuario pide "formatear a markdown", "convertir a .md", "limpiar markdown"
- Necesitas generar documentación estructurada desde texto crudo
- Debes estandarizar formato de archivos `.md` existentes
- Requieres convertir outputs de comandos, logs o CSVs a tablas markdown
- Necesitas crear README, changelogs, guías técnicas

---

## Principios de Formateo

### 1. Jerarquía Clara

- **H1 (`#`)**: Título principal del documento (1 solo por archivo)
- **H2 (`##`)**: Secciones principales
- **H3 (`###`)**: Subsecciones
- **H4-H6**: Detalles menores (usar con moderación)

### 2. Formato de Código

````markdown
# Inline code

Usar `backticks` para comandos, variables, nombres de archivos

# Bloques de código

```language
código aquí
```
````

````

**Lenguajes comunes**: `javascript`, `sql`, `bash`, `json`, `html`, `css`, `python`

### 3. Listas y Estructura
- **Listas no ordenadas**: `-` (guión con espacio)
- **Listas ordenadas**: `1.`, `2.`, etc.
- **Checkboxes**: `- [ ]` (pendiente), `- [x]` (completado)
- **Indentación**: 2 espacios para sublistas

### 4. Énfasis
- **Negrita**: `**texto importante**`
- _Cursiva_: `*énfasis leve*` o `_énfasis_`
- ~~Tachado~~: `~~texto obsoleto~~`
- `Código inline`: Para nombres técnicos

### 5. Tablas
```markdown
| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Dato A    | Dato B    | Dato C    |
| Valor 1   | Valor 2   | Valor 3   |
````

**Reglas**:

- Alinear pipes (`|`) verticalmente para legibilidad
- Header siempre separado con `---`
- Usar `:---` (izq), `:---:` (centro), `---:` (der) para alineación

### 6. Enlaces y Referencias

```markdown
[Texto visible](https://url.com)
[Referencia][id]

[id]: https://url.com "Título opcional"
```

### 7. Bloques de Información

```markdown
> **Nota**: Información relevante
> Puede ocupar múltiples líneas

> **Advertencia**: Acción crítica

> **Tip**: Sugerencia útil
```

### 8. Separadores Horizontales

```markdown
---
```

Usar para separar secciones mayores (no abusar).

---

## Transformaciones Comunes

### Texto Plano → Markdown

**Input**:

```
Instalación
Para instalar, ejecuta: npm install
Luego corre: npm run dev
```

**Output**:

````markdown
## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```
````

2. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

```

### CSV/TSV → Tabla Markdown
**Input**:
```

Nombre,Edad,Ciudad
Juan,30,Buenos Aires
María,25,Córdoba

````

**Output**:
```markdown
| Nombre | Edad | Ciudad       |
|--------|------|--------------|
| Juan   | 30   | Buenos Aires |
| María  | 25   | Córdoba      |
````

### Log/Output → Bloque de Código

**Input**:

```
Error: Cannot find module 'express'
    at Function.Module._resolveFilename
```

**Output**:

````markdown
```text
Error: Cannot find module 'express'
    at Function.Module._resolveFilename
```
````

```

### JSON → Formato Legible
**Input**:
```

{"name":"FormulaMid","version":"4.0.0"}

````

**Output**:
```markdown
```json
{
  "name": "FormulaMid",
  "version": "4.0.0"
}
````

````

---

## Checklist de Calidad

Antes de entregar un documento markdown, verificar:

- [ ] **H1 único**: Solo un título principal
- [ ] **Jerarquía lógica**: H2 → H3 → H4 (sin saltos)
- [ ] **Código con lenguaje**: Todos los bloques tienen sintaxis highlight
- [ ] **Tablas alineadas**: Pipes verticales, headers separados
- [ ] **Enlaces válidos**: URLs completas y correctas
- [ ] **Líneas en blanco**: Separación entre secciones (1 línea)
- [ ] **Sin trailing spaces**: No espacios al final de líneas
- [ ] **Consistencia**: Mismo estilo de listas, énfasis y formato
- [ ] **Nombres técnicos**: En `backticks` (ej: `admin-master.html`)

---

## Convenciones FormulaMid 4

Para documentación del proyecto:

1. **Nombres de archivos**: Siempre en `code-style` (ej: `assets/js/modules/auth.js`)
2. **Términos de negocio**: En **negrita** la primera mención (ej: **Proveedor**, **Solicitud**)
3. **Secciones estándar** (según tipo):
   - README: Descripción, Instalación, Uso, Configuración, Contribución
   - Skills: Propósito, Cuándo Invocar, Principios, Checklist
   - Fichas técnicas: Overview, Funcionalidades, Endpoints, UI/UX, Archivo Principal

4. **Bloques de advertencia**:
```markdown
> **⚠️ CRÍTICO**: Mensaje de seguridad o riesgo alto

> **💡 TIP**: Sugerencia o best practice

> **📌 NOTA**: Información complementaria
````

5. **Versionado**: Incluir `version: X.Y.Z` en frontmatter YAML cuando aplique

---

## Antipatrones a Evitar

❌ **Headers en negrita**: `**## Título**` (redundante)  
✅ **Correcto**: `## Título`

❌ **Listas sin espacio**: `-Item` (ilegible)  
✅ **Correcto**: `- Item`

❌ **Código sin lenguaje**: ` ```código``` ` (sin syntax highlight)  
✅ **Correcto**: ` ```javascript ... ``` `

❌ **Tablas desalineadas**:

```markdown
| A   | B   | C   |
| --- | --- | --- |
| 1   | 2   | 3   |
```

✅ **Correcto**:

```markdown
| A   | B   | C   |
| --- | --- | --- |
| 1   | 2   | 3   |
```

❌ **Headers consecutivos sin contenido**:

```markdown
## Sección

### Subsección

Texto aquí...
```

✅ **Correcto**:

```markdown
## Sección

Introducción breve.

### Subsección

Texto aquí...
```

---

## Workflow de Ejecución

1. **Analizar input**: Identificar tipo (texto plano, CSV, JSON, código, markdown corrupto)
2. **Aplicar estructura**: Definir jerarquía de headers según contenido semántico
3. **Formatear elementos**: Código, tablas, listas según convenciones
4. **Aplicar énfasis**: Negrita para términos clave, inline code para nombres técnicos
5. **Validar calidad**: Ejecutar checklist antes de entregar
6. **Entregar**: Archivo `.md` completo o bloque markdown listo para copiar

---

## Salida Estándar

Al procesar una solicitud de formateo:

**ESTADO**: OK  
**RESULTADO**: Documento markdown generado siguiendo convenciones estándar  
**EVIDENCIA**:

- Jerarquía H1 → H2 → H3 aplicada correctamente
- Código formateado con syntax highlighting (`javascript`, `sql`, etc.)
- Tablas alineadas con headers separados  
  **CAMBIOS**: Creado `[archivo].md` o bloque markdown en chat  
  **SIGUIENTE PASO**: —

---

## Mantenimiento

- **Versión actual**: 1.0.0
- **Última actualización**: 2026-01-29
- **Responsable**: project-orchestrator
