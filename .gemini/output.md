---
trigger: always
glob: "docs/**"
description: Canonical output rules for all agents — where and how to write documentation
---

# Output Rules

> Applied when any agent creates or modifies documentation.

## File Creation

| #   | Rule                      | Detail                                                                            |
| --- | ------------------------- | --------------------------------------------------------------------------------- |
| R1  | **Canonical output path** | Each agent writes ONLY to `docs/_generated/{agent_name}/`                         |
| R2  | **Naming convention**     | `{YYYY-MM-DD}_{type}_{topic}.md` — e.g. `2026-02-16_audit_css-drift.md`           |
| R3  | **Valid types**           | `audit`, `plan`, `report`, `spec`, `research`, `migration`, `walkthrough`         |
| R4  | **No duplicates**         | Before creating a doc, search if one with the same topic exists. Edit it instead. |

## Protection

| #   | Rule                        | Detail                                                                                                            |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| R5  | **Core docs are edit-only** | Docs in `docs/source-of-truth/`, `docs/UI-UX/`, `docs/logica/` are never created new — only edited with approval. |
| R6  | **Flow-centric logic docs** | Logic is documented by flow in `docs/logica/`, never by individual module.                                        |

## Special Paths

| #   | Rule              | Detail                                                                |
| --- | ----------------- | --------------------------------------------------------------------- |
| R7  | **Prototypes**    | Unimplemented features go to `docs/_generated/product/prototypes/`    |
| R8  | **External data** | External reference data goes to `docs/_generated/data/external-data/` |
