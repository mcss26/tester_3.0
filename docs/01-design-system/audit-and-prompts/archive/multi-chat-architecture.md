# Multi-Chat Architecture â€” Design System Redesign

> 2 chats interactivos + verificaciÃ³n automÃ¡tica.

---

## Chats y Roles

| #   | Chat             | DÃ³nde                       | Rol                                                    | Output                          |
| :-- | :--------------- | :-------------------------- | :----------------------------------------------------- | :------------------------------ |
| 1   | **Orchestrator** | CLI terminal                | Planifica, genera specs, decide, auto-verifica         | `docs/80-ephemeral/agent-logs/orchestrator/` |
| 2   | **Frontend**     | Antigravity (chat separado) | DiseÃ±a en Stitch + implementa CSS/HTML + auto-verifica | `swiss-style.css`, pÃ¡ginas HTML |

## Modelo de InteracciÃ³n

El usuario **solo habla con 2 chats**:

- **Orchestrator** â†’ Seguimiento, decisiones, aprobaciones
- **Frontend** â†’ DiseÃ±o visual, revisiÃ³n de componentes

La verificaciÃ³n es **automÃ¡tica**: cada agente corre `scripts/ds-verify.ps1` despuÃ©s de sus cambios y reporta el resultado. No hay "CLI Runner" manual.

## Prompts de InvocaciÃ³n

| Chat         | Prompt                  | Path                                    |
| :----------- | :---------------------- | :-------------------------------------- |
| Orchestrator | `PROMPT-ds-redesign.md` | `docs/80-ephemeral/agent-logs/orchestrator/`         |
| Frontend     | `PROMPT-frontend.md`    | `docs/80-ephemeral/agent-logs/orchestrator/prompts/` |

## Flujo

```mermaid
graph LR
    O["1 Orchestrator (CLI)"] -->|"genera spec â†’ prompts/frontend-*.md"| FE["2 Frontend (Antigravity)"]
    FE -->|"implementa CSS â†’ auto-verify â†’ reporta"| O
    O -->|"genera apply workflow â†’ auto-verify â†’ siguiente spec"| FE
```

## Protocolo de ComunicaciÃ³n

La comunicaciÃ³n entre chats es **via archivos del repo**, nunca copy-paste verbal:

| De â†’ A                      | Mecanismo                                                        |
| :-------------------------- | :--------------------------------------------------------------- |
| Orchestrator â†’ Frontend     | Genera `prompts/frontend-{component}.md` con brief               |
| Frontend â†’ Orchestrator     | Reporta resultado en `docs/80-ephemeral/agent-logs/orchestrator/CHANGELOG.md` |
| Orchestrator â†’ Orchestrator | Corre scripts de scan/verify directamente                        |
| Frontend â†’ Frontend         | Corre `ds-verify.ps1` despuÃ©s de implementar                     |

## Reglas

1. Orchestrator **no escribe cÃ³digo** â€” planifica, escanea, genera prompts
2. Frontend **diseÃ±a (Stitch) e implementa (CSS + HTML)** â€” lee specs del orchestrator
3. **VerificaciÃ³n automÃ¡tica** â€” Cada agente corre scripts de verificaciÃ³n sin pedirle al usuario
4. **Un step a la vez** (R7) â€” no avanzar al siguiente step sin aprobaciÃ³n
5. **Gate entre steps** â€” Orchestrator valida resultado antes de generar siguiente spec

## Secuencia de Arranque

```text
1. Abrir CLI terminal â†’ pegar PROMPT-ds-redesign.md â†’ Orchestrator arranca Step 0
2. Orchestrator verifica docs contra archivos reales, corrige si hay discrepancias
3. Orchestrator genera briefs en prompts/frontend-{toggle,dropdown,...}.md
4. Abrir Antigravity chat â†’ pegar PROMPT-frontend.md â†’ Frontend busca briefs
5. Frontend verifica docs, diseÃ±a en Stitch â†’ implementa CSS â†’ corre ds-verify.ps1 â†’ reporta
6. Orchestrator lee resultado â†’ aprueba o pide fix â†’ siguiente componente
```
