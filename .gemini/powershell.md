---
trigger: always
glob: "**/*"
description: PowerShell safety rules to prevent recurring shell errors on Windows
---

# PowerShell Safety Rules

> Applied every time an agent runs shell commands. If any rule produces truncated or invalid output, **stop and report immediately**.

## Execution

| #   | Rule                                            | Bad                           | Good                        |
| --- | ----------------------------------------------- | ----------------------------- | --------------------------- |
| R1  | **Chain with `;`** — never `&&` (bash-only)     | `cd src && npm run dev`       | `cd src; npm run dev`       |
| R2  | **Use `Cwd` param** — `cd` doesn't persist      | `run_command("cd src/pages")` | Set `Cwd` on the tool call  |
| R3  | **No emojis in `CommandLine`** — encoding crash | `Write-Host "✅ Done"`        | Emojis only in file content |

## Quoting & Escaping

| #   | Rule                                                   | Bad                    | Good                         |
| --- | ------------------------------------------------------ | ---------------------- | ---------------------------- |
| R4  | **Single-quote literals** — doubles expand `$vars`     | `"literal $string"`    | `'literal $string'`          |
| R5  | **Escape glob chars** — `` ` `` before `[` `]` `*` `?` | `Get-Item file[1].txt` | ``Get-Item 'file`[1`].txt'`` |

## Output Control

| #   | Rule                                                | Bad                                 | Good                                       |
| --- | --------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| R6  | **Limit output** — always cap results               | `git log` (thousands of lines)      | `git log -n 10`, `Select-Object -First 20` |
| R7  | **No large file reads via shell** — use agent tools | `type bigfile.js` (overflow)        | `view_file` with `StartLine`/`EndLine`     |
| R8  | **Set `WaitMsBeforeAsync` correctly**               | `npm install` @ 500ms → lost output | Estimate: `npm install` → 10000ms          |

## Behavior

| #   | Rule                                     | Bad                               | Good                                       |
| --- | ---------------------------------------- | --------------------------------- | ------------------------------------------ |
| R9  | **Max 2 retries** — then report to user  | Error → retry → retry → retry…    | 2 attempts max, then stop                  |
| R10 | **Prefer native agent tools** over shell | `grep -r "pattern" .` (not found) | `grep_search`, `find_by_name`, `view_file` |

## Resources

- Script index: `scripts/agent.md`
