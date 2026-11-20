# Seppo's Last Round

A pixel-art, turn-based RPG about a fired IT consultant's increasingly strange
night out. Choose a route, manage limited food and drinks, build around relics,
and fight through **eight areas**, from the Office to Hell.

[Play on GitHub Pages](https://ilarisiikonen.github.io/seppo_rpg/)

## Documentation

The [documentation index](docs/README.md) separates gameplay references from
implementation details. Updated against the React working tree on **2026-11-20**.

| Guide | Contents |
| --- | --- |
| [Game logic](docs/game-logic.md) | Controls, turns, targeting, damage, block, buffs, battle rewards |
| [World and events](docs/world-and-events.md) | Eight areas, route generation, map nodes, all event choices |
| [Enemies](docs/enemies.md) | Enemy and boss stats, scaling, multi-enemy fights, trait behavior |
| [Items and shops](docs/items.md) | Every drink, food and weapon; scaling, drops, prices and shops |
| [Relics](docs/relics.md) | All 26 relics, acquisition, interactions and implementation caveats |
| [Progression](docs/progression.md) | XP, upgrades, unlocks, scoring, saves and account progression |
| [Technical documentation](TECHNICAL_DOCUMENTATION.md) | Architecture, React, Firebase, assets, PWA, development and deployment |

Some in-game descriptions differ from runtime behavior. The relevant guides
explicitly distinguish those cases instead of treating descriptive text as rules.
The older [text mind map](GAME_MIND_MAP.txt) is historical, not the current rules reference.

## Playing

- Use landscape orientation on phones.
- A short, skippable **How to Play** introduction appears before the first new
  run in each browser. Find it again in **Menu > Guide > Basics**.
- A normal combat turn starts with three actions. Attack, Block, Drink and Eat
  each consume one; enemies act automatically when those actions run out.
- Local checkpoints support **Continue**. They do not resume a fight mid-turn.
- Google sign-in enables cloud-backed profile progression. A player name is
  required for a public leaderboard entry.

## Quick start

Install Node.js and npm. The deployment workflow currently uses **Node 20**.
From the repository root, in PowerShell:

```powershell
Set-Location .\seppo-react
npm ci
npm run dev
```

Open **http://localhost:5173/seppo_rpg/**, or the address printed by Vite.
The alternative Windows helper is [setup-windows.ps1](setup-windows.ps1);
it uses `npm install` and starts the development server.

## Build and preview

Run from the application directory:

```powershell
npm run build
npm run preview
```

The build type-checks TypeScript, bundles the app, copies assets and generates
the PWA service worker. Output is in `seppo-react/dist`.

Pushes to `main` deploy through the
[GitHub Pages workflow](.github/workflows/deploy.yml). There is no custom game
server, but optional accounts and leaderboards use Firebase Auth and Firestore.

## Repository layout

- [seppo-react](seppo-react/): maintained React/TypeScript application.
- [assets](assets/): source artwork and animation frames.
- [docs](docs/): gameplay documentation and content catalogs.
- [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md): contributor reference.
- [index.html](index.html): older standalone implementation, not the Pages build entry.
