# JS Watchdog Report - STABLE

> Generated: 2026-02-22 19:39:45
> Baseline: 2026-02-22T19:30:39.5087558-03:00

## Current State

| Metric | Value |
|:---|:---|
| Safety Score | **87/100** |
| Fire-and-forget | 4 |
| Silent catches | 9 |
| .single() usage | 36 |
| Uncleaned intervals | 5 |
| **Total findings** | **54** |
| Files scanned | 64 |
| Error handling coverage | **97,6%** (40/41) |

## Unhandled Mutations

| File | Line | Code |
|:---|---:|:---|
| assets/js/core/gbol-service.js | L139 | await window.sb.from('gbol_sync_log').insert({ |

## Passed

- Fire-and-forget: stable at 4
- Silent catches: stable at 9
- .single() usage: stable at 36
- Unclean intervals: stable at 5
- Safety Score: stable at 87/100
- Error handling coverage: 97,6%
