# 📚 Documentation Router — FormulaMid 4

> **Actualizado:** 2026-02-22
> **Regla:** Si necesitás X, leé Y. No explorés carpetas, seguí esta tabla.

---

## Tabla de Decisión

| Necesitás...                              | Leé...                                                                       |
| :---------------------------------------- | :--------------------------------------------------------------------------- |
| Esquema de BD (tablas, columnas, tipos)   | [db-schema.md](./00-source-of-truth/db-schema.md)                            |
| RPCs, vistas, funciones de backend        | [backend-rpcs.md](./00-source-of-truth/backend-rpcs.md)                      |
| Selectores CSS validados (safelist)       | [safe-list-selectors.json](./00-source-of-truth/safe-list-selectors.json)    |
| Mapa de pantallas, roles, gaps            | [project-status.md](./00-source-of-truth/project-status.md)                  |
| Métricas actuales del proyecto            | [state.md](../state.md) (SSoT fuera de docs/)                                |
| Tokens CSS, spec visual, colores          | [master-design-spec.md](./01-design-system/master-design-spec.md)            |
| Spec de una página específica             | [01-design-system/pages/](./01-design-system/pages/)                         |
| Auditoría design system, prompts, reports | [01-design-system/audit-and-prompts/](./01-design-system/audit-and-prompts/) |
| Pattern library, componentes HTML/JS      | [ui-golden-standard.md](./02-ui-ux/ui-golden-standard.md)                    |
| Flujos de negocio (workday, caja, barra)  | [midnight-workflows.md](./03-business-logic/midnight-workflows.md)           |
| Plan de producción, PRs, pipeline         | [release-pipeline.md](./04-operations/release-pipeline.md)                   |
| Tickets de testing activos                | [04-operations/testing/](./04-operations/testing/)                           |
| Excels Zoco/Passline/Gbol                 | [80-ephemeral/external-data/](./80-ephemeral/external-data/)                 |
| Wiremaps, code-review, refactors, scans   | [80-ephemeral/agent-logs/](./80-ephemeral/agent-logs/)                       |

---

## Estructura

```text
docs/
├── _router.md                          ← estás aquí
├── 00-source-of-truth/                 # Esquema BD, RPCs, mapa de pantallas
├── 01-design-system/                   # Tokens, spec visual, auditorías
├── 02-ui-ux/                           # Pattern library + layout spec
├── 03-business-logic/                  # Flujos operativos (workday, caja, barra)
├── 04-operations/                      # Pipeline producción + tickets
└── 80-ephemeral/                       # Datos externos + logs de agentes (purgable)
```

---

## Reglas de Gobernanza

1. **`00-source-of-truth/`** — Solo datos verificables. Cambios requieren cruce con repo real.
2. **`01-design-system/`** — `master-design-spec.md` es SSoT de tokens. Pages overridean si existen.
3. **`02-ui-ux/`** — Componentes y layouts. Referencia para implementar cualquier pantalla.
4. **`03-business-logic/`** — Flujos inmutables. Cambios solo si cambia la lógica de negocio.
5. **`04-operations/`** — Pipeline vivo. Se actualiza con cada fase completada.
6. **`80-ephemeral/`** — Regenerable. Se puede purgar con `/cleaner`.
