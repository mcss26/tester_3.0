# Domain Agent: Pages

> Reglas para cualquier agente que trabaje con archivos HTML dentro de `pages/`.

## PROJECT STRUCTURE

```text
tester_3.0/
â”œâ”€â”€ AGENTS.md            # Router principal
â”œâ”€â”€ login.html           # Entry point
â”œâ”€â”€ assets/              # CSS, JS, imÃ¡genes â†’ assets/agent.md
â”œâ”€â”€ pages/               # â˜… ESTE DOMINIO â€” HTML por rol
â”œâ”€â”€ scripts/             # Tooling â†’ scripts/agent.md
â”œâ”€â”€ supabase/            # Migrations SQL
â”œâ”€â”€ docs/                # DocumentaciÃ³n
â”œâ”€â”€ tests/               # Tests
â”œâ”€â”€ .agent/              # Rules, skills, workflows
â””â”€â”€ .config/             # Configuraciones locales
```

## Estructura

```text
pages/
â”œâ”€â”€ admin/          # Pantallas de administraciÃ³n
â”œâ”€â”€ encargados/     # Cierre de caja/barra
â”œâ”€â”€ gerencia/       # Balance semanal
â”œâ”€â”€ logistica/      # DistribuciÃ³n y recepciÃ³n
â”œâ”€â”€ members/        # QR de socios
â”œâ”€â”€ operativo/      # Solicitudes operativas
â”œâ”€â”€ prototypes/     # Prototipos UI (no producciÃ³n)
â””â”€â”€ staff/          # Caja y barra operativa
```

## Reglas de Dominio

1. **Tier de riesgo**: Antes de tocar cualquier archivo, verificar en `.agent/REGISTRY.yml` si es Tier0 o Tier1. Tier0 = patch mÃ­nimo, no renombrar IDs/attrs.
2. **Consistencia visual**: Seguir los patrones existentes. El sistema CSS estÃ¡ en proceso de consolidaciÃ³n â€” no imponer reglas estrictas de diseÃ±o aÃºn.
3. **IDs y atributos**: Los contratos de `data-*` y `id=` en pantallas Tier0 no se renombran nunca.
4. **Output**: Documentar cambios en `docs/80-ephemeral/agent-logs/frontend/`.

## Skills Disponibles

- `css-architect` â€” Arquitectura CSS y tokens
- `component-builder` â€” Componentes atÃ³micos en swiss-style.css
- `layout-auditor` â€” AuditorÃ­a de layouts y patches CSS

## COMMANDS

```bash
npm run audit:pages    # Auditar coherencia HTMLâ†”JSâ†”CSS
npm run audit:links    # Verificar links rotos
npm run audit          # Todas las auditorÃ­as
npm run test           # Ejecutar test suite completa
```

## NAMING CONVENTIONS

| Elemento     | PatrÃ³n                    | Ejemplo                          |
| :----------- | :------------------------ | :------------------------------- |
| Archivo HTML | `{rol}-{mÃ³dulo}.html`     | `admin-workdays.html`            |
| Directorio   | Nombre de rol, singular   | `admin/`, `staff/`, `logistica/` |
| IDs          | `kebab-case`, descriptivo | `id="stock-table"`               |
| Data attrs   | `data-{contexto}`         | `data-pos-id`, `data-status`     |

## OUTPUT

| Tipo de output           | UbicaciÃ³n                        |
| :----------------------- | :------------------------------- |
| DocumentaciÃ³n de cambios | `docs/80-ephemeral/agent-logs/frontend/`      |
| Reportes de auditorÃ­a    | `docs/80-ephemeral/agent-logs/qa/`            |
| MÃ³dulo docs              | `docs/modules/{rol}/{mÃ³dulo}.md` |

## Referencia

- Routing completo: [`.agent/REGISTRY.yml`](../.agent/REGISTRY.yml)
- Agente frontend: [`.agent/agents/frontend/AGENT.md`](../.agent/agents/frontend/AGENT.md)
