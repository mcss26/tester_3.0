# Artefactos Generados

> Output automatizado de agentes. **Regenerable bajo demanda.**

## Estructura

```
_generated/
├── data/external-data/     # Archivos Zoco, Passline, Gbol (importados)
├── product/prototypes/     # Feature specs no implementadas
├── qa/                     # Contextos de sistema y UI
└── repo-audit/             # Scripts-health, docs-waste, optimization
```

## Convenciones

- Los agentes escriben aquí, nunca en `/source-of-truth`.
- Todo contenido es regenerable; `/cleaner` puede purgar.
- No editar manualmente: los cambios se pierden en la próxima generación.
