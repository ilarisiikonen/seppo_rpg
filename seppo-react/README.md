# Seppo's Last Round — React

React + TypeScript + Vite + Tailwind CSS pixel-art RPG.

Seppo Virtanen, a 42-year-old IT consultant from Tampere, got fired after telling his boss the new project processes are stupid. Now he wanders through 8 levels — from the office to literal Hell — punching his way to a well-earned beer.

## Features

- **8 levels** with unique enemies, bosses, and backgrounds
- **Route-based map** — choose from 3 routes per level (5–7 nodes each)
- **Turn-based combat** — 3 actions per turn, block/attack/drink/eat/flee
- **Relic system** — 17 passive relics (Common, Uncommon, Rare) from starting pick & treasure nodes
- **Beer & food buffs** — 6 beers with temporary combat buffs, 3 foods for HP
- **Weapon drops** — 7 weapons from enemy loot
- **Level-up choices** — scaling stat bonuses on each level up
- **Score system** — enemies defeated, beers drunk, total damage

## Setup

1. **Install Node.js** (LTS, v18+) from [nodejs.org](https://nodejs.org/)

   **Windows quick option (PowerShell):**
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```

   Then restart your terminal.

2. **Install dependencies:**
   ```bash
   cd seppo-react
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The dev server automatically serves game assets from the parent `../assets/` directory via a Vite plugin.

## Windows One-Command Setup

From repository root:

```powershell
.\setup-windows.ps1
```

Install only dependencies:

```powershell
.\setup-windows.ps1 -InstallDepsOnly
```

## Production Build

```bash
npm run build
```

For production deployment, copy the `assets/` folder into the `dist/` directory:
```bash
cp -r ../assets dist/assets
```

## Project Structure

```
src/
├── main.tsx          # Entry point
├── App.tsx           # Main game layout
├── index.css         # Tailwind + custom styles
├── types.ts          # TypeScript type definitions
├── gameData.ts       # Game constants, enemies, relics, animations, helpers
├── useGameState.ts   # Core game logic hook (combat, relics, progression)
└── components/
    ├── Sprite.tsx    # Animated sprite component
    ├── Overlay.tsx   # Modal overlays (intro, victory, relic choice, etc.)
    ├── LevelMap.tsx  # Route selection & journey map
    ├── PlayerHUD.tsx # Player stats display
    ├── EnemyHUD.tsx  # Enemy stats display
    ├── CombatArea.tsx# Combat sprites + floating damage
    ├── EventFeed.tsx # Floating event messages
    ├── BattleLog.tsx # Expandable battle log
    └── BottomUI.tsx  # Card hand, actions, deck/discard
```
