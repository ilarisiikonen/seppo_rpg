# Documentation index

[Project home](../README.md) | [Technical documentation](../TECHNICAL_DOCUMENTATION.md)

## Scope and conventions

This documentation describes the **current React implementation**, checked on
**2026-11-20**, including the current local working-tree changes. It is not a
description of the older standalone HTML game or a promise of intended behavior.

- **Area** means a world location, such as Office or Park. `currentLevel` is its
  zero-based index, from 0 to 7.
- **Player level** means Seppo's XP level, starting at 1.
- **Round** is a route-progress counter, not the number of combat turns.
- **Turn** is a player's action budget or the enemies' response.
- **Base values** are content-definition values before scaling and modifiers.
- `round`, `floor`, `min` and `max` refer to the corresponding JavaScript math
  operations. `random()` is a value in `[0, 1)`.
- A bonus described as permanent generally lasts for the **current run**, not
  across new runs.
- IDs in backticks are source/save identifiers, not necessarily display names.

The source code takes precedence over tables, comments, card descriptions and
historical documentation. Known discrepancies are called out where they affect
the documented mechanic. No gameplay changes are made by these documents.

## Reading paths

### Players

1. [Game logic](game-logic.md): controls and combat.
2. [World and events](world-and-events.md): routes and decisions.
3. [Items](items.md) and [relics](relics.md): planning a build.
4. [Enemies](enemies.md): encounters and traits.
5. [Progression](progression.md): leveling, unlocks and saving.

The in-game equivalent of a quick introduction is **Menu > Guide > Basics**.

### Contributors

Read the [agent guidelines](../AGENTS.md) when working with coding agents.
Start with the [technical documentation](../TECHNICAL_DOCUMENTATION.md), then
use the gameplay reference for the subsystem being changed.

| Document | Primary source |
| --- | --- |
| [Game logic](game-logic.md) | [useGameState.ts](../seppo-react/src/useGameState.ts), [gameData.ts](../seppo-react/src/gameData.ts) |
| [World and events](world-and-events.md) | Route/event definitions and their runtime handlers in the same two files |
| [Enemies](enemies.md) | Enemy templates, spawn functions, turn resolution and [CombatArea.tsx](../seppo-react/src/components/CombatArea.tsx) |
| [Items](items.md) | Item definitions, drink/eat/drop/shop handlers and [Shop.tsx](../seppo-react/src/components/Shop.tsx) |
| [Relics](relics.md) | Relic definitions, stat helpers and acquisition/combat hooks |
| [Progression](progression.md) | XP/end-run handlers, [firebase.ts](../seppo-react/src/firebase.ts), [App.tsx](../seppo-react/src/App.tsx) |
| [Technical documentation](../TECHNICAL_DOCUMENTATION.md) | Source, dependency manifest, Vite/Tailwind config and deployment workflow |

## Keeping the reference current

When changing content, update the matching catalog and any formulas or acquisition
rules that changed. When changing logic, check both the action handler and its UI
labels. In particular:

- An enemy trait name does not prove that the execution path applies it.
- A card label may omit relic modifiers or differ from actual scaling.
- A generated random pool is not necessarily the same as the final selection.
- A profile save is separate from a local run checkpoint.
- The build reads `seppo-react/package.json`, not the old standalone game.

The catalogs cover **38 drinks, 9 foods, 15 regular weapons plus the event guitar,
26 relics, 16 regular enemy templates, 8 area endpoints, 12 events and 8 unlocks**.
Bestiary entries are not a one-to-one count of enemy templates: duplicate names
within an area are collapsed.
