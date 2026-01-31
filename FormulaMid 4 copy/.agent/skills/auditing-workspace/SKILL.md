---
name: auditing-workspace
description: Skill especializada para mantener la higiene, detectar deuda técnica y archivos duplicados, asegurando la "Fuente de Verdad" del proyecto.
version: 2.0.0
---

# Skill: Auditing Workspace

> **Objetivo**: Mantener la higiene y la "Fuente de Verdad" del proyecto FormulaMid 4.
> **Última Actualización**: 2026-01-29

---

## 0. Alcance y Exclusiones

**Incluir**: 
- `/pages/`, `/assets/`, `/docs/`, `/.agent/skills/`

**Excluir**: 
- `node_modules/`, `dist/`, `build/`, `.git/`, `vendor/`, `tmp/`, `*.min.*`, `*.map`, `/assets/vendor/`

---

## 1. Jerarquía de Fuentes de Verdad (OBLIGATORIA)

> [!CAUTION]
> **Regla Cardinal**: UN documento por tipo. Si existe duplicado, ELIMINAR (no archivar).

### 1.1 Ubicaciones Canónicas

| Tipo de Documento | Ubicación ÚNICA | Alternativas PROHIBIDAS |
|:------------------|:----------------|:-----------------------|
| Estado del proyecto | `docs/estado-presente.md` | `.agent/estado*.md` |
| Roadmap | `docs/roadmap.md` | `.agent/roadmap*.md` |
| Mapa de pantallas | `docs/screen-map.md` | Ninguna |
| Esquema BD | `docs/scheme.md` | Ninguna |
| Índice de Docs | `docs/INDEX.md` | Ninguna |
| Estándares UI | `docs/architecture/ui-standards.md` | Archivos `uiux-audit-*.md` |
| CSS Tokens | `assets/css/tokens.css` | Estilos inline |
| Reglas Frontend | `.agent/skills/frontend-developer/SKILL.md` | Duplicados en `docs/` |
| Reglas Backend | `.agent/skills/logic-engineer/SKILL.md` | Duplicados en `docs/` |
| Reglas DB | `.agent/skills/db-architect/SKILL.md` | `docs/scheme.md` (solo datos) |

### 1.2 Reglas de Prioridad

1. **Skills > docs/**: Si un documento existe en un skill, esa es la fuente de verdad técnica.
2. **docs/ = Información pública**: Estado, roadmap, scheme son para consumo humano/gerencial.
3. **NUNCA crear en raíz**: No crear `.md` en la raíz del proyecto.
4. **NUNCA crear en .agent/ (excepto skills)**: Solo los skills viven en `.agent/`.

---

## 2. Detección de Duplicados

### 2.1 Patrones Sospechosos (Eliminar Inmediatamente)

| Patrón | Acción |
|:-------|:-------|
| `*_old*`, `*_backup*`, `*_copy*` | **ELIMINAR** |
| `*_v2*`, `*_v3*` (si existe versión sin sufijo) | **ELIMINAR** la versión con sufijo |
| Archivos en raíz del proyecto (`.md`) | **ELIMINAR** (deben estar en `docs/` o skills) |
| Carpetas `*_backup/` | **ELIMINAR** completamente |
| Carpetas `_archive/` con contenido consolidado | **ELIMINAR** |

### 2.2 Comando de Detección

```bash
# Buscar duplicados potenciales
find . -name "*old*" -o -name "*backup*" -o -name "*copy*" -o -name "*_v[0-9]*" 2>/dev/null | grep -v .git | grep -v node_modules
```

---

## 3. Procedimiento de Limpieza

### 3.1 Antes de Eliminar

1. Verificar que el contenido esté consolidado en la fuente canónica
2. Buscar referencias al archivo (`grep_search`)
3. Actualizar referencias si existen

### 3.2 Eliminar (No Archivar)

```bash
# Ejemplo: Eliminar archivo obsoleto
rm "/ruta/al/archivo_old.md"

# Ejemplo: Eliminar carpeta backup
rm -rf "/ruta/skills_backup/"
```

> [!IMPORTANT]
> **NUNCA archivar** — Archivar solo crea más duplicados. Si no sirve, ELIMINAR.

---

## 4. Reglas para Agentes

### 4.1 Antes de Crear un Archivo

1. **Buscar si existe**: `find_by_name` con el nombre propuesto
2. **Si existe**: ACTUALIZAR el existente, no crear nuevo
3. **Si no existe**: Verificar ubicación canónica según tabla 1.1

### 4.2 Después de Modificar Código

1. Actualizar `docs/estado-presente.md` si cambian métricas
2. Actualizar el SKILL.md correspondiente si cambian patrones
3. **NUNCA crear documentos de resumen en `.agent/`**

### 4.3 Prohibiciones Absolutas

- ❌ Crear archivos `.md` en raíz del proyecto
- ❌ Crear carpetas `*_backup/`
- ❌ Duplicar contenido entre skills y docs/
- ❌ Crear "resúmenes" o "estados" temporales en `.agent/`

---

## 5. Estructura Final Esperada

```
FormulaMid 4/
├── .agent/
│   ├── skills/           # ← ÚNICA ubicación de skills
│   │   ├── frontend-developer/
│   │   ├── logic-engineer/
│   │   ├── db-architect/
│   │   └── ...
│   ├── workflows/        # ← Workflows de automatización
│   ├── data/             # ← Datos para ETL/testing
│   └── checklists/       # ← Checklists de verificación
├── assets/
│   ├── css/              # ← Estilos (tokens.css, components.css, main.css)
│   └── js/               # ← Lógica (core/, modules/)
├── docs/
│   ├── INDEX.md             # ← Índice maestro
│   ├── estado-presente.md   # ← Estado ÚNICO
│   ├── roadmap.md           # ← Roadmap ÚNICO
│   ├── screen-map.md        # ← Mapa ÚNICO
│   ├── scheme.md            # ← Esquema BD
│   ├── architecture/        # ← Estándares UI/UX
│   │   ├── ui-components.md
│   │   └── ui-standards.md
│   ├── guides/              # ← Guías de usuario
│   │   └── navigation.md
│   └── modules/             # ← Documentación de módulos
├── pages/                   # ← HTML de la aplicación
└── login.html               # ← Entry point
```

---

## 6. Checklist de Auditoría

Ejecutar periódicamente:

- [ ] `find . -name "*old*" -o -name "*backup*"` retorna vacío
- [ ] No hay archivos `.md` en raíz del proyecto
- [ ] No hay carpetas `*_archive/` con contenido
- [ ] Cada tipo de documento tiene UNA sola ubicación
- [ ] Skills actualizados con fecha reciente
