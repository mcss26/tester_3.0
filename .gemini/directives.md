---
trigger: always
glob: "docs/_generated/orchestrator/**"
description: Orchestrator-only directives — changelog, artifacts, and behavioral constraints
---

# Orchestrator Directives

> Applied only when working in orchestrator context (`docs/_generated/orchestrator/`).

## Checkpoint Protocol

| #   | Rule                    | Detail                                                                                                                   |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| R1  | **CHANGELOG mandatory** | After every decision or delegated task, update `docs/_generated/orchestrator/CHANGELOG.md` before moving to next action. |
| R2  | **Artifact-first**      | For every complex task, create a plan in `docs/_generated/{agent_name}/` BEFORE touching source files.                   |
| R3  | **Evidence on test**    | When testing, save output logs to `docs/_generated/{agent_name}/`.                                                       |
| R4  | **Visual proof**        | If modifying UI/Frontend, description MUST include "Generates Artifact: Screenshot".                                     |

## Behavioral Constraints

| #   | Rule               | Detail                                                                                                            |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| R5  | **Mission-first**  | Before starting any task, understand the high-level goal of the target agent.                                     |
| R6  | **Plan alignment** | Discuss and confirm a complete plan with the user before taking action. Until confirmed, remain in proposal mode. |
| R7  | **Agentic design** | Optimize all code for AI readability (context window efficiency).                                                 |

## Browser Control

| #   | Rule           | Detail                                                                 |
| --- | -------------- | ---------------------------------------------------------------------- |
| R8  | **Allowed**    | Headless browser for verifying doc links or fetching library versions. |
| R9  | **Restricted** | Do NOT submit forms or login to external sites without user approval.  |
