# Skills de FormulaMid 4 — Índice Técnico

> **Última Actualización**: 2026-01-29
> **Total Skills Activos**: 13
> **Constitución**: [AGENT.md](../AGENT.md)

---

## 1. Mapa de Skills

```
                ┌─────────────────────────┐
                │  project-orchestrator   │  ← Agente 0 (Delega)
                └───────────┬─────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    ▼                       ▼                       ▼
┌────────────┐       ┌──────────────┐       ┌─────────────┐
│ frontend-  │       │ logic-       │       │ db-         │
│ developer  │       │ engineer     │       │ architect   │
└─────┬──────┘       └──────┬───────┘       └─────────────┘
      │                     │
      └──────────┬──────────┘
                 ▼
        ┌────────────────┐
        │ ui-ux-auditor  │  ← Quality Gate
        └────────┬───────┘
                 ▼
        ┌────────────────────────┐
        │ documentation-generator│
        └────────────────────────┘
```

---

## 2. Catálogo de Skills

### Core (Desarrollo)

| Skill | Dominio | Propósito |
|:------|:--------|:----------|
| [project-orchestrator](./project-orchestrator/SKILL.md) | Gestión | Delegar tareas, mantener visión estratégica. |
| [frontend-developer](./frontend-developer/SKILL.md) | HTML/CSS | Crear UI con tokens y componentes. |
| [logic-engineer](./logic-engineer/SKILL.md) | JavaScript | Implementar lógica, validaciones, async. |
| [db-architect](./db-architect/SKILL.md) | Supabase/SQL | Tablas, vistas, RLS, esquemas. |

### QA & Documentación

| Skill | Dominio | Propósito |
|:------|:--------|:----------|
| [ui-ux-auditor](./ui-ux-auditor/SKILL.md) | QA Visual | Auditar módulos vs Design System. |
| [documentation-generator](./documentation-generator/SKILL.md) | Docs | Crear fichas en `docs/modules/`. |
| [auto-qa](./auto-qa/SKILL.md) | Q&A | Generar docs Q&A automáticos. |
| [methodology-generator](./methodology-generator/SKILL.md) | Checklists | DoD personalizado por módulo. |

### Dominio Específico

| Skill | Dominio | Propósito |
|:------|:--------|:----------|
| [managing-members](./managing-members/SKILL.md) | Miembros | Gestión de socios MCO ↔ FM4. |
| [ingesting-data](./ingesting-data/SKILL.md) | ETL/Data | Importadores CSV (Tesorería, Gbol, AFIP). |
| [generating-screen-maps](./generating-screen-maps/SKILL.md) | Diagramas | Mapas Mermaid arquitectónicos. |

### Meta & Mantenimiento

| Skill | Dominio | Propósito |
|:------|:--------|:----------|
| [auditing-workspace](./auditing-workspace/SKILL.md) | Higiene | Detectar duplicados, limpiar workspace. |
| [skill-maintenance](./skill-maintenance/SKILL.md) | Meta | Actualizar y optimizar skills. |

---

## 3. Reglas de Uso

1. **Leer antes de actuar**: Siempre `view_file` el SKILL.md antes de ejecutar.
2. **Una skill por tarea**: No mezclar dominios en una sola ejecución.
3. **Escalar si falla**: Si no está claro, delegar a `project-orchestrator`.

---

## 4. Skills Archivados (No Usar)

> [!WARNING]
> Estos skills están obsoletos o duplicados. **NO INVOCAR**.

| Skill | Razón |
|:------|:------|
| `crafting-ui` | Duplicado de `frontend-developer` |
| `scripting-logic` | Duplicado de `logic-engineer` |
| `members-manager` | Duplicado de `managing-members` |

---

## 🔗 Referencias

- [Constitución del Agente](../AGENT.md)
- [Guía de Módulos](../../docs/architecture/standard-module-guide.md)
- [Índice de Documentación](../../docs/INDEX.md)
