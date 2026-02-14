# 🔍 Skills System Audit Report

> **Fecha:** 2026-02-13
> **Skills Auditadas:** 16 (Antigravity) + 2 (`.agent/skills/`)
> **Ubicaciones:** `C:\Users\siste\.gemini\antigravity\skills\` (canónica) + `tester_3.0\.agent\skills\`

---

## 📊 Inventario Completo

### Ubicación Canónica: `.gemini/antigravity/skills/`

| # | Skill                                                                                                            | Versión | Companion `agent.md` | Subdirs                  | Tipo              | Estado              |
| :-: | :--------------------------------------------------------------------------------------------------------------- | :------- | :--------------------- | :----------------------- | :---------------- | :------------------ |
| 1 | [auditing-workspace](file:///C:/Users/siste/.gemini/antigravity/skills/auditing-workspace/SKILL.md)                 | 2.0.0    | ❌                     | —                       | 🧹 Gobernanza     | ✅ Sólida          |
| 2 | [brand-developer](file:///C:/Users/siste/.gemini/antigravity/skills/brand-developer/SKILL.md)                       | 1.1.0    | ✅                     | —                       | 🎨 Marca          | ✅ Sólida          |
| 3 | [creative-director](file:///C:/Users/siste/.gemini/antigravity/skills/creative-director/SKILL.md)                   | 1.2.0    | ✅                     | —                       | 🎨 Marca          | ✅ Sólida          |
| 4 | [css-architect](file:///C:/Users/siste/.gemini/antigravity/skills/css-architect/SKILL.md)                           | 2.0.0    | ❌                     | `references/` (3 docs) | 🏗️ Arquitectura | ✅ Sólida          |
| 5 | [customer-lifecycle-manager](file:///C:/Users/siste/.gemini/antigravity/skills/customer-lifecycle-manager/SKILL.md) | 1.1.0    | ❌                     | —                       | 💼 CRM            | ⚠️ Revisar        |
| 6 | [db-architect](file:///C:/Users/siste/.gemini/antigravity/skills/db-architect/SKILL.md)                             | —       | ❌                     | —                       | 🏗️ Arquitectura | ⚠️ Desactualizada |
| 7 | [erp-architect](file:///C:/Users/siste/.gemini/antigravity/skills/erp-architect/SKILL.md)                           | 2.1.0    | ✅                     | —                       | 💼 ERP            | ✅ Sólida          |
| 8 | [find-skills](file:///C:/Users/siste/.gemini/antigravity/skills/find-skills/SKILL.md)                               | —       | ❌                     | —                       | 🔍 Utility        | ✅ Sólida          |
| 9 | [logic-engineer](file:///C:/Users/siste/.gemini/antigravity/skills/logic-engineer/SKILL.md)                         | —       | ❌                     | —                       | 🏗️ Arquitectura | ⚠️ Desactualizada |
| 10 | [methodology-generator](file:///C:/Users/siste/.gemini/antigravity/skills/methodology-generator/SKILL.md)           | 1.0.0    | ❌                     | —                       | 📋 Planificación | ✅ Sólida          |
| 11 | [module-coherence-auditor](file:///C:/Users/siste/.gemini/antigravity/skills/module-coherence-auditor/SKILL.md)     | 1.0.0    | ❌                     | —                       | 🧹 Gobernanza     | ✅ Sólida          |
| 12 | [prototyper](file:///C:/Users/siste/.gemini/antigravity/skills/prototyper/SKILL.md)                                 | —       | ❌                     | —                       | 🎨 UI/UX          | ✅ Sólida          |
| 13 | [ui-migrator](file:///C:/Users/siste/.gemini/antigravity/skills/ui-migrator/SKILL.md)                               | —       | ❌                     | —                       | 🎨 UI/UX          | ⚠️ Revisar        |
| 14 | [ux-researcher-designer](file:///C:/Users/siste/.gemini/antigravity/skills/ux-researcher-designer/SKILL.md)         | —       | ❌                     | —                       | 🔬 Research       | ✅ Sólida (nueva)  |
| 15 | [web-designer](file:///C:/Users/siste/.gemini/antigravity/skills/web-designer/SKILL.md)                             | —       | ❌                     | —                       | 🎨 UI/UX          | ⚠️ Solapamiento   |

### Ubicación Alternativa: `.agent/skills/`

| # | Skill                  | Companion Files | Estado                         |
| :-: | :--------------------- | :-------------- | :----------------------------- |
| 16 | `leader`             | `SKILL.md`    | 🟡 No auditada en esta sesión |
| 17 | `powershell-windows` | (directorio)    | 🟡 No auditada en esta sesión |

---

## 🔴 Hallazgos Críticos

### 1. Solapamiento de Responsabilidades (UI/UX Pipeline)

Hay **4 skills** que tocan diseño UI/UX con fronteras difusas:

```
web-designer → Guía de diseño genérica (Figma → Handoff)
prototyper   → Motor de prototipado en sandbox (lab-*)
ui-migrator  → Migración legacy → demo/
ux-researcher-designer → Research & validation
```

> [!IMPORTANT]
> **Recomendación**: `web-designer` y `prototyper` tienen solapamiento significativo. Evaluar si `web-designer` se **depreca** (su contenido es más genérico/educativo) y `prototyper` asume el rol de "diseño + prototipado" con sección de principios.

### 2. `db-architect` tiene inconsistencia de status

- El SKILL dice `status IN ('ABIERTA', 'CERRADA')` en sección 5.3
- Pero sección 1.1 documenta el lifecycle correcto: `DRAFT → PLANNED → ACTIVE → CLOSED`
- **Las RPCs ya usan el flujo de 4 estados** (confirmado en conversación `c3336e12`)
- ⚡ **Acción**: Actualizar sección 5.3 para reflejar los 4 estados reales

### 3. `logic-engineer` tiene status legacy

- Sección 7.3 dice `status='ABIERTA'` — debe ser `ACTIVE`
- Sección 7.3 dice "Solo una jornada abierta" — la constraint real es un UNIQUE partial index sobre `(status='ACTIVE')`
- ⚡ **Acción**: Sincronizar con `db-architect` sección 1.1

### 4. `ui-migrator` apunta a carpeta `demo/` obsoleta

- Describe migración hacia `demo/` y uso de `demo.css`
- El sandbox actual es [formulamid-prototypes](file:///C:/Users/siste/Documents/GitHub/formulamid-prototypes/) con `lab-*` folders (según `prototyper`)
- ⚡ **Acción**: Refactorizar `ui-migrator` para alinearse con el pipeline actual (`prototyper` sandbox → producción), o deprecar si `prototyper` + `css-architect` cubren el flujo completo

### 5. `customer-lifecycle-manager` no tiene BD

- Define tablas `companies`, `crm_contacts`, `deals` que **no existen** en Supabase
- El módulo CRM no está implementado aún
- ⚡ **Acción**: Marcar como `WIP` / no invocable hasta que se implemente el módulo CRM

---

## 🟡 Hallazgos Moderados

### 6. Skills sin versión explícita

7 skills no declaran `version:` en frontmatter: `db-architect`, `logic-engineer`, `prototyper`, `ui-migrator`, `ux-researcher-designer`, `web-designer`, `find-skills`.

### 7. `brand-developer` y `creative-director` dependen de `agent.md`

Ambas tienen un pattern de "lee `agent.md` antes de proceder". Este patrón funciona pero hace que la skill sea **opaca** — el SKILL.md por sí solo no da contexto completo. Considerar consolidar las directrices esenciales de `agent.md` en el SKILL.md.

### 8. `erp-architect` tiene agent.md companion

Similar a brand/creative — tiene un `agent.md` con personalidad y directrices adicionales.

### 9. Duplicación de reglas "Fuentes de Verdad"

Las secciones de "Mantenimiento de Fuentes de Verdad" se repiten en:

- `auditing-workspace` (§1) — **Canónica** ✅
- `db-architect` (§8)
- `logic-engineer` (§10)

Las reglas de `auditing-workspace` son la fuente de verdad. Las otras deberían **referenciar** en vez de duplicar.

---

## 🟢 Skills Bien Estructuradas

| Skill                        | Fortaleza                                                          |
| :--------------------------- | :----------------------------------------------------------------- |
| `css-architect`            | Project-agnostic, 5 Golden Rules, reference map con subdirectorio  |
| `prototyper`               | Pipeline claro, guardrails de seguridad, tabla de módulos activos |
| `module-coherence-auditor` | Definiciones precisas, procedimiento paso-a-paso, severidades      |
| `methodology-generator`    | Matriz de priorización, formato de reporte, read-only             |
| `ux-researcher-designer`   | Nielsen 10 adaptado, journey templates, delegación clara          |
| `auditing-workspace`       | Jerarquía de fuentes de verdad, checklist, estructura esperada    |

---

## 📋 Tools MCP Disponibles para Cross-Reference

### Drive (Business-1, Business-2, Personal)

- `search` — Buscar archivos en Google Drive
- `create_file` / `update_file` — Crear/actualizar archivos
- **Use case**: Exportar reportes de auditoría a Drive, buscar documentos operativos para cruces

### Memory Server

- `memory_search` — Full-text search sobre 315 entries (215 ChatGPT + 100 test)
- `memory_get` — Recuperar entry específica por ID
- `assets_list` / `assets_get` — ⚠️ No funcionales (falta `asset_tools.py`)
- **Use case**: Buscar contexto histórico de decisiones, cruces de datos contables, auditoría de recaudación

### NotebookLM

- `ask_question` — Research conversacional con Gemini sobre notebook activo (Auditoría de Recaudación)
- **Use case**: Pricing, descalces ZOCO, faltantes caja, mermas

---

## 🎯 Plan de Acción Recomendado

### Sprint 0: Sincronización Inmediata (≤ 1 hora)

| # | Acción                                                                                                                         | Skill Afectada     | Prioridad |
| :-: | :------------------------------------------------------------------------------------------------------------------------------ | :----------------- | :-------- |
| 1 | Actualizar sección 5.3 de `db-architect`: reemplazar `('ABIERTA','CERRADA')` por `('DRAFT','PLANNED','ACTIVE','CLOSED')` | `db-architect`   | P0        |
| 2 | Actualizar sección 7.3 de `logic-engineer`: sinc con lifecycle de 4 estados                                                  | `logic-engineer` | P0        |
| 3 | Agregar `version:` al frontmatter de las 7 skills que no lo tienen                                                            | Varias             | P2        |

### Sprint 1: Refactorización de Pipeline UI (≤ 2 horas)

| # | Acción                                                                                                                         | Prioridad |
| :-: | :------------------------------------------------------------------------------------------------------------------------------ | :-------- |
| 4 | Decidir: ¿deprecar `web-designer` o mantener como guía educativa?                                                           | P1        |
| 5 | Decidir: ¿refactorizar `ui-migrator` para apuntar a `formulamid-prototypes/` o deprecar?                                   | P1        |
| 6 | Extraer reglas duplicadas de "Fuentes de Verdad" de `db-architect` y `logic-engineer` → referenciar `auditing-workspace` | P1        |

### Sprint 2: Consolidación de agent.md (oportunista)

| # | Acción                                                                                                                      | Prioridad |
| :-: | :--------------------------------------------------------------------------------------------------------------------------- | :-------- |
| 7 | Evaluar si las directrices esenciales de `brand-developer/agent.md` y `creative-director/agent.md` se inline en SKILL.md | P2        |
| 8 | Auditar `leader` y `powershell-windows` en `.agent/skills/`                                                            | P2        |
| 9 | Marcar `customer-lifecycle-manager` como WIP hasta que BD CRM exista                                                       | P2        |
