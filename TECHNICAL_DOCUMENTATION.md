# Seppo's Last Round — Technical Documentation

## Tech Stack Overview

| Layer            | Technology                      | Version  |
| ---------------- | ------------------------------- | -------- |
| UI Framework     | React                           | 18.3.1   |
| Language         | TypeScript                      | 5.6.2    |
| Build Tool       | Vite                            | 6.0.5    |
| CSS Framework    | Tailwind CSS                    | 3.4.17   |
| PostCSS          | PostCSS + Autoprefixer          | 8.5.3    |
| Deployment       | GitHub Pages (Actions workflow) | —        |
| Runtime          | Node.js                         | 24.x LTS |

**Zero runtime dependencies beyond React.** No state management library, no router, no animation library — all game logic is built from scratch with React hooks and vanilla TypeScript.

---

## Project Structure

```
seppo_rpg/
├── assets/                          # Pixel art sprites & game assets (shared)
│   ├── characters/
│   │   ├── seppo/                   # Player character
│   │   ├── ismo/                    # Level 0 boss
│   │   ├── angry_cyclist/           # Level 1 enemy
│   │   ├── consultant_1/            # Level 0 enemy
│   │   ├── consultant_2/            # Level 0+3 enemy
│   │   ├── drunk_guy_1/             # Level 1 enemy
│   │   ├── drunk_guy_2/             # Level 2 enemy
│   │   ├── black_metal_musician/    # Level 2+3 enemy
│   │   ├── bouncer/                 # Level 3 enemy
│   │   ├── shopkeeper/              # Level 1 boss (Blue-Collar Man)
│   │   ├── bartender/               # Level 3 boss
│   │   ├── Priest/                  # Level 4 enemy + boss
│   │   ├── janitor/                 # Level 4 enemy
│   │   ├── Gravedigger/             # Level 4 enemy
│   │   ├── cult_member/             # Level 5 enemy
│   │   ├── cult_leader/             # Level 5 boss
│   │   ├── police_man/              # Level 6 enemy
│   │   ├── karhu_special_operator/  # Level 6 boss
│   │   ├── satan/                   # Level 7 enemy
│   │   └── Skeleton_on_fire/        # Level 7 enemy
│   ├── cards/
│   │   ├── attacks/                 # Weapon card images
│   │   ├── drinks/                  # Beer card images
│   │   └── food/                    # Food card images
│   ├── levels/                      # Level background images (8 levels)
│   └── map_icons/                   # Map node icons
│       ├── fight_map_icon.png
│       ├── elite_fight_map_icon.png
│       ├── boss_fight_map_icon.png
│       ├── rest_place_map_icon.png
│       ├── treasure_map_icon.png
│       ├── mystery_map_icon.png
│       └── shop_map_icon.png
│
├── seppo-react/                     # React application root
│   ├── index.html                   # SPA shell (Google Fonts, dark mode)
│   ├── package.json                 # ESM project, minimal dependencies
│   ├── vite.config.ts               # Custom plugins for parent asset serving
│   ├── tailwind.config.js           # M3 dark palette, pixel-art theme
│   ├── postcss.config.js            # Tailwind + Autoprefixer
│   ├── tsconfig.json                # Project references
│   ├── tsconfig.app.json            # App source (ES2020, react-jsx, strict)
│   ├── tsconfig.node.json           # Vite config (ES2022)
│   └── src/
│       ├── main.tsx                 # React 18 createRoot entry
│       ├── index.css                # Tailwind directives + game CSS
│       ├── vite-env.d.ts            # Vite client types
│       ├── types.ts                 # All TypeScript interfaces
│       ├── gameData.ts              # Constants, items, enemies, relics, helpers
│       ├── useGameState.ts          # Game engine hook
│       ├── App.tsx                  # Main layout & timer
│       └── components/
│           ├── Sprite.tsx           # Frame-by-frame animation engine
│           ├── PlayerHUD.tsx        # Player stats panel (dual layout)
│           ├── EnemyHUD.tsx         # Enemy stats panel (dual layout)
│           ├── CombatArea.tsx       # Central combat stage + floating damage
│           ├── BottomUI.tsx         # Card hand, actions, menus
│           ├── Overlay.tsx          # Modal screens: intro, victory, relic choice, etc.
│           ├── LevelMap.tsx         # Route selection & journey map
│           ├── EventFeed.tsx        # Floating combat messages
│           └── BattleLog.tsx        # Expandable battle log (desktop only)
│
├── .github/workflows/deploy.yml     # GitHub Pages CI/CD
├── GAME_MIND_MAP.txt                # Game content mind map
└── TECHNICAL_DOCUMENTATION.md       # This file
```

---

## Architecture

### State Management — Imperative Mutable Ref Pattern

The entire game state lives in a single `useRef<GameState>` inside `useGameState()`. Instead of using `useState` (which would trigger renders on every mutation) or an external library like Redux, the game uses:

```
useRef<GameState>   ←  mutable state (direct property assignment)
      +
useReducer(counter) ←  manual forceRender() trigger
```

**Why this pattern:**
- RPG game state has ~35+ fields mutated in complex sequences (combat resolution, buff ticking, death checks, relic effects)
- A single `setState` call per action turn avoids intermediate re-renders
- Timer-based animation sequencing (e.g., 500ms delay between player and enemy turns) requires stable references
- All game logic stays co-located in one hook

**Timer management:** All `setTimeout` handles are tracked in a `Set<ReturnType<typeof setTimeout>>` ref, cleared on component unmount to prevent memory leaks.

### Component Architecture

```
App.tsx
├── PlayerHUD          ← left panel, player stats
├── EnemyHUD           ← right panel, enemy stats
├── CombatArea         ← center, sprites + floating damage
│   └── Sprite (x2)   ← player & enemy sprite renderers
├── BottomUI           ← card hand, action buttons, sub-menus
│   ├── CardHand       ← desktop: trigonometric card fan arc
│   ├── MobileCardStrip ← mobile: horizontal scroll strip
│   ├── SubMenu        ← beer/food selection grid
│   └── ActionButton   ← styled pixel-border buttons
├── LevelMap           ← route selection & journey map
│   ├── RouteNodes     ← scrollable node chain
│   ├── RestPopup      ← rest stop confirmation
│   └── FoodMenu       ← eat food on the map
├── EventFeed          ← floating toast messages (top-center)
├── BattleLog          ← expandable log panel (desktop only)
└── Overlay            ← full-screen modals
    ├── IntroBody
    ├── VictoryBody + ScoreBreakdown
    ├── GameOverBody + ScoreBreakdown
    ├── LevelCompleteBody
    ├── UpgradeBody
    ├── LevelUpBody
    ├── StatInfoBody
    ├── FightVictoryBody
    └── RelicChoiceBody
```

All components receive state and actions from `useGameState()` via props — no context providers, no prop drilling beyond one level.

---

## Game Systems

### Levels & Routes

The game spans **8 levels**, each with a unique background, enemy pool, and boss:

| Level | Name | Enemies | Boss |
|-------|------|---------|------|
| 0 | Office | Consultant 1, Consultant 2 | THE BOSS (Ismo) |
| 1 | Park | Angry Cyclist, Drunk Guy 1 | Angry Blue-Collar Man |
| 2 | Street | Drunk Guy 2, Black Metal | The Satanist |
| 3 | Ravintola Kulma | Black Metal, Bouncer, Consultant 2 | The Bartender |
| 4 | Church | Priest, Janitor, Gravedigger | The High Priest |
| 5 | Basement | Cult Member | The Cult Leader |
| 6 | Meadow | Police Officer | Karhu Special Operator |
| 7 | Hell | Satan, Skeleton | Seppo (himself) |

**Route generation:** Each level offers 3 randomly generated routes with 5–7 nodes each. Node types:
- **Fight** (default) — standard enemy encounter
- **Elite** (~30% chance) — tougher enemies
- **Rest** (~50% chance) — heal 40% max HP
- **Treasure** (~25% chance) — pick 1 of 3 relics
- **Boss** — always after completing the route

### Combat

- **Player actions per turn:** 3 (4 with Cornered Rat relic when HP < 30%)
- **Enemy actions per turn:** 2 strikes (or 1 strike + block at 30% chance)
- **Block:** Player gains DEF as shield; enemy can block with their DEF. Auto-block relic adds +6 if player didn't block.
- **Damage:** `max(1, ATK − target DEF)`, with 1.5× on crit
- **Flee:** 35% success (skip node), 65% fail (enemy turn). Cannot flee from bosses.

### Relic System

Relics are permanent passive bonuses collected during the run:
- **Starting relic:** Pick 1 of 3 Common relics at game start
- **Treasure nodes:** Pick 1 of 3 relics (mixed rarity) during routes

**17 relics** across 3 rarities: 7 Common, 8 Uncommon, 2 Rare. Effects include stat boosts, beer synergies, combat mechanics (auto-block, lifesteal, momentum), and the rare Eternal Buzz (permanent beer effects at 50% strength).

### Progression

- **XP per kill** → level up at threshold (starts 50, ×1.45 each level)
- **Level up:** +5 HP, +1 ATK, +1 DEF, full heal, pick 1 of 3 scaling bonuses
- **Between levels:** Pick 1 of 3 upgrades (+HP, +ATK, +DEF, +Crit, +Regen, +ATK&DEF)
- **Weapons:** Drop from enemies (loot chance %), always upgrade (never downgrade)

---

## Animation System

### Sprite Pipeline

1. **Asset format:** Each animation is a directory of numbered PNG frames (`frame_000.png`, `frame_001.png`, …) organized by character, animation name, and direction (south/east/west).

2. **Animation definition (`AnimDef`):**
   ```ts
   { path: string, frames: number, fps: number, loop: boolean }
   ```

3. **Preloading:** `preloadAllAnims()` runs at import time — creates `HTMLImageElement` objects for every frame across all 22 character animation sets. This ensures zero loading delay during gameplay.

4. **Playback (`Sprite.tsx`):** A `useEffect` keyed on `[animSet, animKey, animSeq]` sets up a `setInterval` at the animation's FPS rate. Each tick advances to the next frame by swapping the `<img>` element's `src`. Non-looping animations invoke `onComplete` when the last frame is reached.

5. **Animation sequencing:** The `animSeq` counter (a number incremented each time a new animation is triggered) forces the `useEffect` to restart even if the animation name hasn't changed.

### Direction Conventions

| Character      | Idle/Explore | Combat (attacking) |
| -------------- | ------------ | ------------------ |
| Seppo          | south        | east               |
| Enemies        | south (HUD)  | west               |
| Seppo (Hell)   | east         | east (mirrored via scaleX(-1)) |

---

## Asset Pipeline

### Development

A custom Vite plugin (`serveParentAssets`) intercepts all `/assets/*` HTTP requests during dev and serves files from the parent `../assets/` directory.

**Security:** Includes path traversal protection — resolved paths must start with the known `assetsDir`. Supports MIME types for png, jpg, gif, webp, json, svg. Sets `Cache-Control: max-age=3600`.

### Production Build

A build-time plugin (`copyParentAssets`) copies the entire `../assets/` tree into `public/assets/` via Node's `cpSync` at `buildStart`, so Vite includes them in the final `dist/` bundle.

### Image Rendering

All sprites use `image-rendering: pixelated` (via `.sprite-canvas` CSS class) to maintain crisp pixel art at any scale factor.

---

## Responsive Design Strategy

### Approach: Landscape-Only with Fluid Scaling

The game targets landscape orientation on all devices. Portrait mobile users see a CSS-only "Rotate Your Device" overlay.

### Dual Layout Pattern

Every HUD component renders two complete layouts:
- **Mobile** (`sm:hidden`): Compact, minimal text, vertical HP bars, inline stats
- **Desktop** (`hidden sm:flex`): Full bars, labels, detailed stats

### Fluid Sizing with `clamp()`

Key elements use CSS `clamp()` for smooth scaling between screen sizes:

| Element          | Sizing                          |
| ---------------- | ------------------------------- |
| Combat sprites   | `clamp(7rem, 28vh, 14rem)`      |
| HUD portraits    | `clamp(3rem, 8vh, 5rem)`        |
| Action buttons   | `clamp(2rem, 5vh, 3rem)` height |
| Card hand        | `clamp(7rem, 24vh, 11rem)`      |
| Header padding   | `p-[1vh_0.5rem]`                |

### Mobile-Specific Adaptations

| Feature                | Desktop              | Mobile                    |
| ---------------------- | -------------------- | ------------------------- |
| Card hand              | Trigonometric fan arc | Horizontal scroll strip   |
| Battle log             | Expandable panel     | Hidden                    |
| Deck/discard piles     | Shown                | Hidden                    |
| Hover effects          | Enabled              | Disabled (`hover: none`)  |
| Pixel borders          | 4px box-shadow       | 2px box-shadow            |
| Floating damage text   | 1.5rem               | 1rem                      |
| Portrait orientation   | N/A                  | "Rotate device" overlay   |

---

## Tailwind CSS Configuration

### Material Design 3 Dark Palette

The theme uses a full Material You dark color scheme with semantic tokens:

| Token              | Hex       | Usage                           |
| ------------------ | --------- | ------------------------------- |
| `primary`          | `#ffba38` | Headings, primary buttons, gold |
| `secondary`        | `#bfcca2` | XP bars, secondary text         |
| `tertiary`         | `#ffb68c` | Buff indicators, accents        |
| `error`            | `#ffb4ab` | Damage, enemy attacks           |
| `surface`          | `#141218` | Main background                 |
| `surface-container`| `#211f26` | Card backgrounds                |
| `on-surface`       | `#e6e0e9` | Primary text                    |
| `outline`          | `#938f99` | Borders, dividers               |

### Dynamic Class Safelist

A programmatic safelist generates `text-`, `border-`, and `bg-` variants for 11 colors at 10 opacity levels to survive Tailwind's tree-shaking when classes are built dynamically (e.g., `text-${color}`).

### Typography

| Family    | Font           | Usage                    |
| --------- | -------------- | ------------------------ |
| headline  | Epilogue       | Titles, section headers  |
| body      | Newsreader     | Flavor text, descriptions|
| label     | Space Grotesk  | Stats, labels, UI text   |

---

## Game Logic Summary

### Combat Flow

```
Player Turn (2 actions)
  ├── Attack → animation → damage calc → enemy hit animation
  ├── Drink Beer → heal + buff → consumes action
  ├── Eat Food → sustain heal → consumes action
  └── Flee → 60% success, costs 1 action on fail
  │
  └── Actions exhausted ──→ 500ms delay ──→ Enemy Turn
                                              ├── Enemy attacks → damage calc
                                              ├── Buffs tick (decrement duration)
                                              └── Round counter increments
                                                    └── Check: round >= ROUNDS_PER_LEVEL?
                                                          ├── Yes → Level complete overlay
                                                          └── No → Next player turn
```

### Damage Calculation

```ts
damage = max(1, attackerATK - defenderDEF ± random(0..3))
critical = random() < critChance ? damage * 2 : damage
```

Player ATK = `base + weapon + buff`. Player DEF = `base + buff`.

### Scoring System

| Source                  | Points                           |
| ----------------------- | -------------------------------- |
| Enemies defeated        | `enemy.xp × 5` per enemy        |
| Beers consumed          | `50` per beer                    |
| Total damage dealt      | `1` per point of damage          |

The run timer tracks elapsed time (displayed but not penalized).

### Progression

- **4 Levels:** Office → Park → Street → Bar (5 rounds each)
- **Between levels:** Choose 1 of 3 permanent upgrades (HP, ATK, DEF, Crit, Heal, XP)
- **Level-ups:** Gain XP from combat → pick stat improvements
- **Boss fight:** Ismo at level 4, 450 HP, 2 phase transitions

---

## CI/CD — GitHub Pages Deployment

### Workflow (`.github/workflows/deploy.yml`)

**Trigger:** Push to `main` branch

**Steps:**
1. Checkout repository
2. Setup Node.js 20 with npm cache
3. `npm ci` (clean install)
4. `npm run build` → runs `tsc -b && vite build` inside `seppo-react/`
5. Add `.nojekyll` to `dist/` (prevents Jekyll processing)
6. Upload `dist/` as GitHub Pages artifact
7. Deploy via `actions/deploy-pages@v4`

**Permissions:** `contents: read`, `pages: write`, `id-token: write`

**Build output:** `seppo-react/dist/` — static SPA with relative paths (`base: './'`).

---

## Dependencies (Full List)

### Runtime

| Package     | Version  |
| ----------- | -------- |
| react       | ^18.3.1  |
| react-dom   | ^18.3.1  |

### Development

| Package                | Version  | Purpose                        |
| ---------------------- | -------- | ------------------------------ |
| typescript             | ~5.6.2   | Type checking                  |
| vite                   | ^6.0.5   | Dev server + bundler           |
| @vitejs/plugin-react   | ^4.3.4   | React Fast Refresh for Vite    |
| tailwindcss            | ^3.4.17  | Utility-first CSS              |
| postcss                | ^8.5.3   | CSS transformation pipeline    |
| autoprefixer           | ^10.4.21 | Vendor prefix automation       |
| @types/react           | ^18.3.12 | React type definitions         |
| @types/react-dom       | ^18.3.1  | ReactDOM type definitions      |

---

## Key Design Decisions

1. **No state management library** — Game state is inherently mutable and sequential. A single `useRef` + manual render is simpler and more performant than Redux/Zustand for this use case.

2. **No animation library** — Frame-by-frame sprite animation via `setInterval` + `<img>` src swapping is lighter than Framer Motion or CSS sprite sheets for pixel art with variable frame counts.

3. **Eager frame preloading** — All sprite frames are loaded as `HTMLImageElement` objects at startup. This trades ~2–3 seconds of initial load for zero animation hitches during gameplay.

4. **Custom Vite plugins over symlinks** — Serving parent-directory assets via middleware (dev) and `cpSync` (build) avoids cross-platform symlink issues on Windows.

5. **Dual mobile/desktop rendering** — Rather than complex responsive CSS, each HUD component renders two separate layouts toggled by Tailwind breakpoint classes. More markup, but clearer and easier to maintain.

6. **CSS-only portrait detection** — The rotate-device overlay uses `@media` queries instead of JavaScript orientation APIs, avoiding permission prompts and working on all browsers.

7. **Tailwind safelist for dynamic classes** — Since game data constructs class names dynamically (e.g., `text-${color}`), a programmatic safelist ensures these survive production tree-shaking.
