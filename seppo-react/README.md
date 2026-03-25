# Seppo's Last Round — React

React + TypeScript + Vite + Tailwind CSS port of the original HTML game.

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
├── gameData.ts       # Game constants, animations, helpers
├── useGameState.ts   # Core game logic hook
└── components/
    ├── Sprite.tsx    # Animated sprite component
    ├── Overlay.tsx   # Modal overlays (intro, victory, etc.)
    ├── PlayerHUD.tsx # Player stats display
    ├── EnemyHUD.tsx  # Enemy stats display
    ├── CombatArea.tsx# Combat sprites + floating damage
    ├── EventFeed.tsx # Floating event messages
    ├── BattleLog.tsx # Expandable battle log
    └── BottomUI.tsx  # Card hand, actions, deck/discard
```
