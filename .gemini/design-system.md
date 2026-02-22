---
trigger: always
glob: "assets/css/**"
description: Design system boundaries â€” tokens, CSS hierarchy, and component migration rules
---

# Design System Rules

> Applied when any agent works with CSS, tokens, or visual components.

## Immutability

| #   | Rule                          | Detail                                                                                                                    |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| R1  | **`tokens.css` is IMMUTABLE** | No agent may edit `assets/css/tokens.css` without explicit user approval. Propose change â†’ wait for approval â†’ then edit. |
| R2  | **Source hierarchy**          | `tokens.css` > `MASTER.md` > `swiss-style.css` > `design-system-visual.html`. When values conflict, higher priority wins. |

## Workflow

| #   | Rule                            | Detail                                                                                                               |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| R3  | **Channel by task type**        | Grep/inventories â†’ CLI. Visual HTML generation â†’ Chat. Token edits â†’ approval only. Design decisions â†’ orchestrator. |
| R4  | **One step at a time**          | Executor receives ONE workflow step per instruction. Orchestrator reviews between steps.                             |
| R5  | **Verify before claiming done** | Run `grep_search` against target file. 0 results = task NOT done. Never mark âœ… on intention alone.                  |

## Architecture

| #   | Rule                              | Detail                                                                                                                  |
| --- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| R6  | **No duplication of `MASTER.md`** | Never duplicate token tables or component patterns already in `.agent/design-system/MASTER.md`. Reference it.           |
| R7  | **CSS naming prefixes**           | Components: `c-` (`.c-btn`). Utilities: `u-` (`.u-flex`). States: `is-` (`.is-loading`). IDs reserved for JS/a11y only. |
| R8  | **Strangler refactor**            | Migrate one component / one page at a time. Each task ends with smoke-test. No big-bang rewrites.                       |
| R9  | **Freeze check**                  | While `assets/agent.md` has consolidation note: always verify tokens against `tokens.css` current values.               |

## Output

Reports go to `docs/80-ephemeral/agent-logs/frontend/`:

- `design-system-audit.md` â€” Audit report
- `design-system-visual.html` â€” Visual showcase
- `tokens-inventory.md` â€” Token inventory
- `token-diff.md` â€” Divergences
