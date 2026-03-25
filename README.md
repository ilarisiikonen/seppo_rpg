# Seppo's Last Round

A pixel-art RPG where Seppo — a recently fired software developer — fights his way through Helsinki's nightlife armed with nothing but beer, snacks, and sheer stubbornness.

## Story

Seppo gets fired after an argument with his boss Ismo. With nothing left to lose, he stumbles through four stages of the evening:

1. **Office** — Consultants and Ismo himself block the exit
2. **Park** — Angry cyclists and drunk guys lurk in the dark
3. **Street** — Drunk guys and black metal musicians roam freely
4. **Ravintola Kulma** — Bouncers, musicians, and consultants guard the final bar

Survive all four levels and defeat the boss to earn Seppo's last round.

## Tech Stack

- React 18 + TypeScript + Vite + Tailwind CSS
- Frame-by-frame sprite animation system
- No backend — runs entirely in the browser

## Quick Start (Windows)

```powershell
cd seppo-react
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

> **Need Node.js?** Run `winget install OpenJS.NodeJS.LTS` in PowerShell first.

## Project Layout

```
assets/              # Shared sprites, backgrounds, card art
seppo-react/         # React app (Vite)
  src/
    gameData.ts      # All game constants (enemies, levels, items)
    useGameState.ts  # Core game engine hook
    types.ts         # TypeScript interfaces
    components/      # UI components (combat, HUD, overlays)
  public/assets/     # Copy of assets for production builds
```

## Build for Production

```bash
cd seppo-react
npm run build
```

Output goes to `seppo-react/dist/`.
