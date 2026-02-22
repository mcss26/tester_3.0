# Domain Agent: Assets

> Reglas para cualquier agente que trabaje con CSS, JavaScript o recursos visuales dentro de `assets/`.

## PROJECT STRUCTURE

```text
tester_3.0/
â”œâ”€â”€ AGENTS.md            # Router principal
â”œâ”€â”€ login.html           # Entry point
â”œâ”€â”€ assets/              # â˜… ESTE DOMINIO â€” CSS, JS, imÃ¡genes
â”œâ”€â”€ pages/               # HTML por rol â†’ pages/agent.md
â”œâ”€â”€ scripts/             # Tooling â†’ scripts/agent.md
â”œâ”€â”€ supabase/            # Migrations SQL
â”œâ”€â”€ docs/                # DocumentaciÃ³n
â”œâ”€â”€ tests/               # Tests
â”œâ”€â”€ .agent/              # Rules, skills, workflows
â””â”€â”€ .config/             # Configuraciones locales
```

## Estructura

```text
assets/
â”œâ”€â”€ css/    # Estilos, tokens, design system
â”œâ”€â”€ js/     # MÃ³dulos JS del cliente
â””â”€â”€ img/    # ImÃ¡genes y assets visuales
```

## Reglas de Dominio

1. **Sistema CSS en consolidaciÃ³n**: El sistema de diseÃ±o estÃ¡ siendo redefinido. No aplicar tokens ni referencias al design-system anterior hasta que se consolide la nueva versiÃ³n.
2. **JS modules**: Cada archivo JS es un mÃ³dulo con responsabilidad Ãºnica. Respetar la separaciÃ³n existente.
3. **Naming CSS**: Archivos CSS siguen `kebab-case`. Variables CSS usan `--prefix-name`.
4. **No borrar assets en uso**: Verificar referencias antes de eliminar cualquier archivo.

## Skills Disponibles

- `css-architect` â€” Arquitectura CSS y tokens
- `component-builder` â€” Componentes atÃ³micos en swiss-style.css
- `layout-auditor` â€” AuditorÃ­a de layouts y patches CSS
- `logic-engineer` â€” LÃ³gica JS, state management, integraciÃ³n

## COMMANDS

```bash
npm run audit:css      # Auditar CSS: orphans, duplicados, tokens
npm run audit          # Todas las auditorÃ­as
```

## NAMING CONVENTIONS

| Elemento      | PatrÃ³n                                 | Ejemplo                        |
| :------------ | :------------------------------------- | :----------------------------- |
| Archivo CSS   | `{pÃ¡gina-o-componente}.css` kebab-case | `admin-workdays.css`           |
| Archivo JS    | `{mÃ³dulo}.js` kebab-case               | `auth-guard.js`                |
| Variables CSS | `--{prefijo}-{nombre}`                 | `--color-primary`, `--fs-base` |
| Tokens        | Definidos en `tokens.css`              | `--space-4`, `--radius-md`     |
| ImÃ¡genes      | `{descripciÃ³n}.{ext}` kebab-case       | `icon-192.png`                 |

## OUTPUT

| Tipo de output            | UbicaciÃ³n                   |
| :------------------------ | :-------------------------- |
| Reportes de auditorÃ­a CSS | `docs/80-ephemeral/agent-logs/qa/`       |
| DocumentaciÃ³n de tokens   | `docs/80-ephemeral/agent-logs/frontend/` |

## Referencia

- Agente frontend: [`.agent/agents/frontend/AGENT.md`](../.agent/agents/frontend/AGENT.md)
- Agente logic: [`.agent/agents/logic/AGENT.md`](../.agent/agents/logic/AGENT.md)
