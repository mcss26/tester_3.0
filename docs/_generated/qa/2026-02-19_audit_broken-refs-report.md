# Broken References Report

> Generated: 2026-02-19  
> Scope: `.agent/skills/`, `.agent/agents/`, `REGISTRY.yml`

---

## 1. Broken Markdown Links

Links to local files that **do not exist** on disk.

| #   | Source File                         | Line | Broken Path                         | Fix Sugerido                                                                                                  |
| --- | ----------------------------------- | ---- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | `skill-creator/SKILL.md`            | 141  | `FORMS.md`                          | Crear el archivo en `skill-creator/` o eliminar la referencia. No existe ningún `FORMS.md` en el skill.       |
| 2   | `skill-creator/SKILL.md`            | 142  | `REFERENCE.md`                      | Idem. Crear o eliminar.                                                                                       |
| 3   | `skill-creator/SKILL.md`            | 143  | `EXAMPLES.md`                       | Idem. Crear o eliminar.                                                                                       |
| 4   | `skill-creator/SKILL.md`            | 186  | `DOCX-JS.md`                        | Idem. Crear o eliminar.                                                                                       |
| 5   | `skill-creator/SKILL.md`            | 192  | `REDLINING.md`                      | Idem. Crear o eliminar.                                                                                       |
| 6   | `skill-creator/SKILL.md`            | 193  | `OOXML.md`                          | Idem. Crear o eliminar.                                                                                       |
| 7   | `repo-cleanup/SKILL.md`             | 766  | `../module-based-refactor/SKILL.md` | La skill `module-based-refactor` no existe. Eliminar referencia o reemplazar con skill equivalente existente. |
| 8   | `repo-cleanup/SKILL.md`             | 767  | `../session-start-routine/SKILL.md` | La skill `session-start-routine` no existe. Eliminar referencia.                                              |
| 9   | `logic-engineer/SKILL.md`           | 531  | `docs/ui-golden-standard.md`        | El archivo no existe en `docs/`. Fue renombrado/movido o nunca creado. Update path o eliminar.                |
| 10  | `logic-engineer/SKILL.md`           | 532  | `docs/architecture/navigation.md`   | No existe `docs/architecture/`. Crear o eliminar referencia.                                                  |
| 11  | `ux-researcher-designer/SKILL.md`   | 121  | `docs/screen-map.md`                | No existe. Crear el screen-map o eliminar referencia.                                                         |
| 12  | `ui-ux-pro-max/resources/README.md` | 489  | `CLAUDE.md`                         | No existe `CLAUDE.md` en `ui-ux-pro-max/resources/`. Eliminar referencia.                                     |

> [!IMPORTANT]
> Los items 1–6 (`skill-creator`) parecen heredados de un template genérico (referencias a docs de `docx-js`). Probablemente el SKILL.md fue copiado de otro contexto sin adaptar las referencias.

> [!WARNING]
> Items 7–8 (`repo-cleanup`) referencian skills que fueron eliminadas o nunca existieron: `module-based-refactor` y `session-start-routine`. Estas son referencias zombies post-cleanup.

---

## 2. HTML sin CSS — `visual-template.html`

**Archivo:** `.agent/skills/component-builder/resources/visual-template.html`

### Diagnóstico

| Check                        | Estado         | Detalle                                                                                                            |
| ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `<link>` a `tokens.css`      | ❌ **FALTA**   | No hay ningún `<link rel="stylesheet">` a `tokens.css`.                                                            |
| `<link>` a `swiss-style.css` | ❌ **FALTA**   | No hay ningún `<link rel="stylesheet">` a `swiss-style.css`.                                                       |
| Estilos inline `<style>`     | ⚠️ Presente    | Contiene un bloque `<style>` con ~170 líneas, pero el `:root` está vacío (solo comentarios "Paste...").            |
| Tokens funcionales           | ❌ **NINGUNO** | El `:root` no define ningún token real. Usa `var(--bg-body)`, `var(--text-primary)`, etc., pero nunca los declara. |
| Componentes renderizados     | ❌ **MÍNIMOS** | Secciones 04–19 son solo comentarios HTML, sin markup real (ej: `<!-- btn-primary, btn-secondary... -->`).         |

### Análisis de Standalone

El archivo **no funciona como standalone**. Sin los `<link>` a los CSS externos, todas las referencias a `var(--token)` se resuelven como vacías, produciendo una página invisible (fondo default, texto sin color, layouts rotos).

### Fix Sugerido

Agregar en el `<head>`, **después del link a Google Fonts y antes del `<style>`**:

```html
<!-- Design System CSS -->
<link rel="stylesheet" href="../../../../../assets/css/tokens.css" />
<link rel="stylesheet" href="../../../../../assets/css/swiss-style.css" />
```

> [!NOTE]
> El path relativo `../../../../../assets/css/` es correcto para la ubicación del archivo en `.agent/skills/component-builder/resources/`. Sin embargo, dado que este HTML es un template/referencia para el agente y no se sirve desde un web server, puede ser más práctico usar un path absoluto o documentar que requiere ser copiado junto con los CSS.

---

## 3. Skills en Conflicto — REGISTRY.yml vs Carpetas

### 3A. Skills en REGISTRY que no existan como carpeta

| Skill | Estado                                                                                     |
| ----- | ------------------------------------------------------------------------------------------ |
| —     | ✅ Todas las 23 skills asignadas en REGISTRY.yml existen como carpeta en `.agent/skills/`. |

**Resultado: 0 fantasmas.**

---

### 3B. Carpetas que existen pero no están asignadas a ningún agente

| Carpeta                   | Descripción                                                                 | Fix Sugerido                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `backups`                 | Skill de backup/respaldo, sin uso activo.                                   | Asignar a `security-ops` agent (que ya tiene `auditing-workspace`) o eliminar si es legacy.                                                                        |
| `design-system-architect` | Audita y genera la página visual del design system.                         | Asignar a `frontend` agent, o confirmar que fue absorbida por `component-builder` (cuya descripción dice "Absorbs design-system-architect") y eliminar la carpeta. |
| `ui-ux-pro-max`           | Intelligence UI/UX con 50 estilos, paletas, stacks. Skill genérica/externa. | Asignar a `product` o `frontend`, o eliminar si `ux-researcher-designer` la reemplaza.                                                                             |

**Resultado: 3 skills huérfanas.**

---

### 3C. Skills que dicen hacer lo mismo (overlap funcional)

#### Overlap 1: `component-builder` ↔ `design-system-architect`

| Aspecto     | `component-builder`                           | `design-system-architect`                                   |
| ----------- | --------------------------------------------- | ----------------------------------------------------------- |
| Propósito   | Diseñar, construir y verificar componentes UI | Auditar, diseñar y generar la página de verificación visual |
| Output      | Clases CSS en `swiss-style.css`               | `design-system-visual.html`                                 |
| Declaración | **"Absorbs design-system-architect"**         | —                                                           |
| Asignada    | ✅ `frontend`                                 | ❌ Ningún agente                                            |

> **Veredicto:** `component-builder` declaró absorción explícita. `design-system-architect` es un residuo. Sin embargo, comparten resources idénticos (`audit-checklist.md`, `visual-template.html`).
>
> **Fix:** Confirmar que todo lo útil de `design-system-architect/` está en `component-builder/` y eliminar la carpeta, o formalizarla como sub-skill del frontend agent.

#### Overlap 2: `ux-researcher-designer` ↔ `ui-ux-pro-max`

| Aspecto   | `ux-researcher-designer`                                                  | `ui-ux-pro-max`                                                          |
| --------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Propósito | UX Research & Design Validation (personas, journeys, heurísticas Nielsen) | UI/UX design intelligence (50 estilos, stacks React/Next/Vue, shadcn/ui) |
| Enfoque   | Investigación y validación UX                                             | Ejecución visual y conocimiento de stacks                                |
| Asignada  | ✅ `product`                                                              | ❌ Ningún agente                                                         |
| Tamaño    | 1 archivo SKILL.md                                                        | 56 archivos (CSVs, templates, scripts)                                   |

> **Veredicto:** Complementarios pero con solapamiento en la superficie (ambos hablan de "UI/UX"). `ui-ux-pro-max` es una skill externa/genérica con mucho peso (56 archivos, stacks que el proyecto no usa como Flutter/SwiftUI). `ux-researcher-designer` es project-specific.
>
> **Fix:** Si se necesita el conocimiento de `ui-ux-pro-max`, asignarla a un agente. Si no, eliminar — pesa mucho y la mayoría de sus stacks (Flutter, SwiftUI, React Native) son irrelevantes para este proyecto.

---

## Resumen Ejecutivo

| Categoría                     | Items Encontrados                                         | Severidad                                                                 |
| ----------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Broken Links                  | 12 referencias rotas                                      | 🔴 Alta — agentes que leen estos SKILL.md seguirán links muertos          |
| HTML sin CSS                  | 2 `<link>` faltantes + `:root` vacío                      | 🟡 Media — el template no funciona standalone pero existe como referencia |
| Skills fantasma en REGISTRY   | 0                                                         | ✅ OK                                                                     |
| Skills huérfanas (sin agente) | 3 (`backups`, `design-system-architect`, `ui-ux-pro-max`) | 🟡 Media — peso muerto en el repo                                         |
| Overlaps funcionales          | 2 pares identificados                                     | 🟡 Media — confusión potencial para routing                               |
