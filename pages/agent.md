# Domain Agent: Pages

> Reglas para cualquier agente que trabaje con archivos HTML dentro de `pages/`.

## PROJECT STRUCTURE

```text
tester_3.0/
├── AGENTS.md            # Router principal
├── login.html           # Entry point
├── assets/              # CSS, JS, imágenes → assets/agent.md
├── pages/               # ★ ESTE DOMINIO — HTML por rol
├── scripts/             # Tooling → scripts/agent.md
├── supabase/            # Migrations SQL
├── docs/                # Documentación
├── tests/               # Tests
├── .agent/              # Rules, skills, workflows
└── .config/             # Configuraciones locales
```

## Estructura

```text
pages/
├── admin/          # Pantallas de administración
├── encargados/     # Cierre de caja/barra
├── gerencia/       # Balance semanal
├── logistica/      # Distribución y recepción
├── members/        # QR de socios
├── operativo/      # Solicitudes operativas
├── prototypes/     # Prototipos UI (no producción)
└── staff/          # Caja y barra operativa
```

## Reglas de Dominio

1. **Tier de riesgo**: Antes de tocar cualquier archivo, verificar en `.agent/REGISTRY.yml` si es Tier0 o Tier1. Tier0 = patch mínimo, no renombrar IDs/attrs.
2. **Consistencia visual**: Seguir los patrones existentes. El sistema CSS está en proceso de consolidación — no imponer reglas estrictas de diseño aún.
3. **IDs y atributos**: Los contratos de `data-*` y `id=` en pantallas Tier0 no se renombran nunca.
4. **Output**: Documentar cambios en `docs/_generated/frontend/`.

## Skills Disponibles

- `css-architect` — Arquitectura CSS y tokens
- `component-builder` — Componentes atómicos en swiss-style.css
- `layout-auditor` — Auditoría de layouts y patches CSS

## COMMANDS

```bash
npm run audit:pages    # Auditar coherencia HTML↔JS↔CSS
npm run audit:links    # Verificar links rotos
npm run audit          # Todas las auditorías
npm run test           # Ejecutar test suite completa
```

## NAMING CONVENTIONS

| Elemento     | Patrón                    | Ejemplo                          |
| :----------- | :------------------------ | :------------------------------- |
| Archivo HTML | `{rol}-{módulo}.html`     | `admin-workdays.html`            |
| Directorio   | Nombre de rol, singular   | `admin/`, `staff/`, `logistica/` |
| IDs          | `kebab-case`, descriptivo | `id="stock-table"`               |
| Data attrs   | `data-{contexto}`         | `data-pos-id`, `data-status`     |

## OUTPUT

| Tipo de output           | Ubicación                        |
| :----------------------- | :------------------------------- |
| Documentación de cambios | `docs/_generated/frontend/`      |
| Reportes de auditoría    | `docs/_generated/qa/`            |
| Módulo docs              | `docs/modules/{rol}/{módulo}.md` |

## Referencia

- Routing completo: [`.agent/REGISTRY.yml`](../.agent/REGISTRY.yml)
- Agente frontend: [`.agent/agents/frontend/AGENT.md`](../.agent/agents/frontend/AGENT.md)
