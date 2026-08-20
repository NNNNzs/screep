---
name: screeps-strategy
description: Apply the project's Screeps strategy and architecture rules when designing, reviewing, or implementing rooms, creeps, Memory, CPU scheduling, spawning, logistics, construction, pathfinding, or defense. Use the smallest relevant project reference and verify uncertain API details with Context7.
---

# Screeps Strategy

Use this skill for Screeps game strategy and bot architecture work. It is a project-specific routing layer, not a copy of the complete Screeps manual.

## Context budget

1. Start with `AGENTS.md` and [the architecture document](../../../docs/architecture-v2.md).
2. Read [the Screeps knowledge layer](../../../docs/screeps-knowledge-layer.md) only when the task needs strategy, API, or repository-selection context.
3. Load only the relevant source subtree under `src/v2/`; do not read the legacy tree unless comparing behavior.
4. For API signatures, return codes, body-part rules, Memory, CPU, PathFinder, or version-sensitive behavior, resolve `Screeps` with `ctx7 library` first and query `/websites/screeps` with one focused question.

## Architecture invariants

- Keep the flow `Game observation -> stable snapshot -> planner/request ledger -> one-tick executor action`.
- Observers read the world and write only stable IDs, coordinates, timestamps, and compact state.
- Planners create room-scoped requests; Creep executors consume one action at a time.
- Never store live `Room`, `Creep`, `Structure`, `Source`, `ConstructionSite`, or path objects in persistent Memory.
- Use `Game.getObjectById` for IDs. Use heap/global caches for current-tick objects and TTL-based expensive calculations.
- Keep CPU-heavy work behind Scheduler interval, priority, bucket, or max-CPU controls.
- Treat old Memory and old Creep roles as incompatible with V2; do not invent a migration layer.

## Strategy decisions

When changing behavior, state the target room, resource flow, demand/request, body capability, action, and failure/retry condition. Prefer a small deterministic request over a global task list. Make spawn bodies derive from the current energy budget and role demand, not hard-coded population assumptions.

For movement, prefer native `moveTo` path reuse or a heap CostMatrix cache with an explicit TTL. Do not add serialized paths to the persistent bot schema unless a later Segment design explicitly requires it.

For defense, treat hostiles, tower energy, injured creeps, ramparts, and room criticality as separate facts. Do not let a low-priority planner delay an immediate tower or creep defense action.

## Verification

After implementation, run the project checks documented in `AGENTS.md`. If a claim depends on live game state, distinguish static TypeScript/build evidence from an actual Screeps tick or console observation.
