# Domain Agent: Assets

> Reglas para cualquier agente que trabaje con CSS, JavaScript o recursos visuales dentro de `assets/`.

## PROJECT STRUCTURE

```text
tester_3.0/
├── AGENTS.md            # Router principal
├── login.html           # Entry point
├── assets/              # ★ ESTE DOMINIO — CSS, JS, imágenes
├── pages/               # HTML por rol → pages/agent.md
├── scripts/             # Tooling → scripts/agent.md
├── supabase/            # Migrations SQL
├── docs/                # Documentación
├── tests/               # Tests
├── .agent/              # Rules, skills, workflows
└── .config/             # Configuraciones locales
```

## Estructura

```text
assets/
├── css/    # Estilos, tokens, design system
├── js/     # Módulos JS del cliente
└── img/    # Imágenes y assets visuales
```

## Reglas de Dominio

1. **Sistema CSS en consolidación**: El sistema de diseño está siendo redefinido. No aplicar tokens ni referencias al design-system anterior hasta que se consolide la nueva versión.
2. **JS modules**: Cada archivo JS es un módulo con responsabilidad única. Respetar la separación existente.
3. **Naming CSS**: Archivos CSS siguen `kebab-case`. Variables CSS usan `--prefix-name`.
4. **No borrar assets en uso**: Verificar referencias antes de eliminar cualquier archivo.

## Skills Disponibles

- `css-architect` — Arquitectura CSS y tokens
- `component-builder` — Componentes atómicos en swiss-style.css
- `layout-auditor` — Auditoría de layouts y patches CSS
- `logic-engineer` — Lógica JS, state management, integración

## COMMANDS

```bash
npm run audit:css      # Auditar CSS: orphans, duplicados, tokens
npm run audit          # Todas las auditorías
```

## NAMING CONVENTIONS

| Elemento      | Patrón                                 | Ejemplo                        |
| :------------ | :------------------------------------- | :----------------------------- |
| Archivo CSS   | `{página-o-componente}.css` kebab-case | `admin-workdays.css`           |
| Archivo JS    | `{módulo}.js` kebab-case               | `auth-guard.js`                |
| Variables CSS | `--{prefijo}-{nombre}`                 | `--color-primary`, `--fs-base` |
| Tokens        | Definidos en `tokens.css`              | `--space-4`, `--radius-md`     |
| Imágenes      | `{descripción}.{ext}` kebab-case       | `icon-192.png`                 |

## OUTPUT

| Tipo de output            | Ubicación                   |
| :------------------------ | :-------------------------- |
| Reportes de auditoría CSS | `docs/_generated/qa/`       |
| Documentación de tokens   | `docs/_generated/frontend/` |

## Referencia

- Agente frontend: [`.agent/agents/frontend/AGENT.md`](../.agent/agents/frontend/AGENT.md)
- Agente logic: [`.agent/agents/logic/AGENT.md`](../.agent/agents/logic/AGENT.md)
