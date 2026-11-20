# Technical documentation

[Project home](README.md) | [Gameplay documentation index](docs/README.md)

Checked against the React working tree on **2026-11-20**. This document describes
implementation and operations; game rules and content catalogs live in the
separate [gameplay guides](docs/README.md).

## 1. System overview

Seppo's Last Round is a React single-page application deployed as static files
to GitHub Pages. Combat, random generation, inventory, routes and score are
computed in the browser. There is no dedicated game server.

Optional account features use **Firebase Authentication** and **Cloud Firestore**.
It is therefore inaccurate to describe the current application as having no
backend dependencies. A PWA service worker caches the app and assets, but does
not make authentication or leaderboard queries available offline.

### Dependency baseline

These are ranges from [package.json](seppo-react/package.json), not a claim that
the lockfile resolves to the lower bound:

| Purpose | Package | Declared range |
| --- | --- | --- |
| UI | React / React DOM | `^18.3.1` |
| Accounts and database | Firebase | `^12.12.0` |
| Type checking | TypeScript | `~5.6.2` |
| Development/build | Vite | `^6.0.5` |
| React transform | `@vitejs/plugin-react` | `^4.3.4` |
| Styling | Tailwind CSS | `^3.4.17` |
| CSS processing | PostCSS / Autoprefixer | `^8.5.3` / `^10.4.21` |
| PWA generation | `vite-plugin-pwa` | `^1.2.0` |

The project is ESM (`"type": "module"`). It has no router, external game engine,
Redux-style state library or separate animation library. CI currently uses
**Node 20**, as specified by the deployment workflow.

## 2. Repository and entry points

```text
repository root
  assets/                         source images and animation frames
  docs/                           gameplay guides and catalogs
  .github/workflows/deploy.yml     GitHub Pages build/deploy
  seppo-react/
    index.html                    maintained app HTML shell
    package.json / package-lock.json
    vite.config.ts                base path, assets, PWA
    tailwind.config.js            theme, breakpoints, safelist
    postcss.config.js
    tsconfig*.json
    public/                       static files; assets copied here by plugin
    src/
      main.tsx                    React root and orientation-lock attempt
      App.tsx                     composition, account coordination, UI state
      useGameState.ts             mutable game state and action handlers
      gameData.ts                 content definitions and shared calculations
      types.ts                    game interfaces and discriminated string types
      firebase.ts                 Auth / Firestore functions and meta aggregation
      index.css                   global effects and responsive rules
      components/                 rendered game UI
    dist/                         generated production output
  index.html                      older standalone game
  GAME_MIND_MAP.txt                historical text reference
  README.md
  TECHNICAL_DOCUMENTATION.md
```

The Pages workflow builds [seppo-react](seppo-react/), not the root HTML file.
Use the application-level lockfile with `npm ci`.

[main.tsx](seppo-react/src/main.tsx) mounts `App` with React `StrictMode`,
imports global CSS and attempts to lock screen orientation to landscape when
supported. Failure to lock orientation is ignored. The HTML shell sets dark
mode, mobile viewport/PWA metadata and loads Google Fonts / Material Symbols.

## 3. State architecture

### Game engine

[useGameState.ts](seppo-react/src/useGameState.ts) owns a single mutable
`useRef<GameState>`. Action functions read and mutate `gsRef.current`; a
`useReducer` counter forces React rendering when `render()` is called.

```text
User interaction
  -> action function
  -> mutate gsRef.current
  -> schedule any animation/combat timers
  -> render() / forceRender()
  -> App passes current state and callbacks to components
```

This is not an immutable reducer architecture. Adding a state mutation without
a corresponding render can leave the UI stale; reading captured values in an
asynchronous callback instead of the current ref can produce stale decisions.

Callbacks for profile run-end updates and unlocked-item IDs are themselves kept
in refs so the engine can use their current values.

### Phase, combat and overlays

These fields are related but not interchangeable:

| State | Purpose |
| --- | --- |
| `phase` | `intro`, `map`, `explore`, `battle` or `shop` |
| `inBattle` | Whether an encounter is active |
| `battleLocked` | Whether player combat actions must wait |
| `overlay` | Story, reward, stat, upgrade, relic and run-end screens |
| `activeEvent` | Current map event plus choice callback |
| `subMenuType` | Drink/food picker state |

The current normal traversal uses `map`; `explore` remains in types/UI but is
not the usual transition target.

An overlay can exist while the underlying phase remains unchanged. Do not infer
that closing a modal must change phase. Some overlays carry callbacks, so live
`GameState` is not directly suitable for JSON serialization.

### Multi-enemy state

- `enemies` contains all encounter enemies, including defeated entries until
  the encounter is cleared.
- `targetIdx` identifies the current target.
- `enemy` references the active enemy object used by legacy/single-target code.
- Each enemy can carry its own animation key/sequence and preview intentions.
- Global intent fields mirror the active target for existing HUD consumers.

Target changes, death auto-selection and enemy-turn sequencing must keep those
representations synchronized. Rewards aggregate all encounter XP/coins, while
several mechanics still use only the active enemy. Consult the
[enemy implementation notes](docs/enemies.md) before generalizing a single-target
effect to groups.

### Timers and logs

The engine's `addTimer` wraps `setTimeout`, tracks the handle in a set and removes
it when fired. Current code does **not** include a hook cleanup that cancels
every tracked engine timeout on unmount or reset. Do not rely on the historical
documentation's claim that it does.

Timing examples:

- Player-turn completion schedules the enemy response after 1,800 ms.
- Enemy strikes and block-to-strike transitions commonly use 1,200 ms.
- Death transitions derive duration from animation frames/fps and add a delay.
- Floating damage removes itself after 1,200 ms.
- Feed messages expire after 3,200 ms.

The battle log retains up to 70 entries; the short event feed retains up to four.
App separately manages its elapsed-time interval and phase-transition timer.

## 4. UI responsibilities

| Component | Responsibility |
| --- | --- |
| [App](seppo-react/src/App.tsx) | Screen composition, UI visibility, auth/meta orchestration, tutorial entry, phase fade and elapsed timer |
| [PlayerHUD](seppo-react/src/components/PlayerHUD.tsx) | Player stats, equipment and effect displays |
| [EnemyHUD](seppo-react/src/components/EnemyHUD.tsx) | Target stats, group HP information and enemy detail popup |
| [CombatArea](seppo-react/src/components/CombatArea.tsx) | Sprites, targeting, intent/effect displays and floating damage |
| [Sprite](seppo-react/src/components/Sprite.tsx) | Frame-by-frame image animation |
| [BottomUI](seppo-react/src/components/BottomUI.tsx) | Action buttons, desktop card fan, narrow-screen card strip and inventory picker |
| [LevelMap](seppo-react/src/components/LevelMap.tsx) | Route tree, progress, horizontal navigation, rest confirmation and map food menu |
| [Shop](seppo-react/src/components/Shop.tsx) | Stock, prices, purchase controls and shopkeeper challenge confirmation |
| [Overlay](seppo-react/src/components/Overlay.tsx) | Title/story, rewards, level-up/upgrade/relic choices, final score and profile UI |
| [EventOverlay](seppo-react/src/components/EventOverlay.tsx) | Event scene and choices |
| [RelicViewer](seppo-react/src/components/RelicViewer.tsx) | Owned relic inspection |
| [MainMenu](seppo-react/src/components/MainMenu.tsx) | Stats, leaderboard, unlocks, guide and giving up |
| [Tutorial](seppo-react/src/components/Tutorial.tsx) | First-run dialog and shared Basics content |
| [BattleLog](seppo-react/src/components/BattleLog.tsx) / [EventFeed](seppo-react/src/components/EventFeed.tsx) | Long and short log views |

Components receive game data and actions through props. Local component state is
used for UI-only selections and popups, not a second authoritative combat model.

### Tutorial

App checks the local `seppo_tutorial_seen` preference before a new run.
The native dialog opens with `showModal`, has a labeled title, and focuses its
Skip control. Completing, skipping or native cancellation stores the preference
and starts the run. Continue bypasses it.

`TutorialContent` is reused in **Menu > Guide > Basics**, avoiding two versions
of the introductory mechanics. Its central content scrolls while header/footer
controls remain outside the scroll area.

### Responsive layout

[tailwind.config.js](seppo-react/tailwind.config.js) changes the standard
Tailwind breakpoint meanings:

| Prefix | Minimum width |
| --- | ---: |
| `sm` | 1024 px |
| `md` | 1024 px |
| `lg` | 1280 px |
| `xl` | 1536 px |

Do not assume `sm` means 640 px. The map also uses a JavaScript width check at
1024 px. The card hand switches at `lg`, so the horizontal strip is used below
1280 px even when some HUDs already use their larger layout.

The page body hides overflow. Fixed/full-height screens must define their own
scroll regions. For a column-flex scroller, a bounded available height,
`min-h-0`, and a nonshrinking content child prevent unreachable overflow.
The shop uses an auto top margin to bottom-align short stock without pushing
overflow above the scroll origin.

Below 1024 px in portrait, a CSS-controlled "Rotate Your Device" screen is shown.
Some elements use viewport-based `clamp()` sizing. Touch CSS suppresses hover
transforms, and mobile pixel borders use smaller shadows.

The theme defines semantic colors and a safelist for dynamically constructed
color utility classes. New dynamic Tailwind class names must be represented in
content scanning or the safelist; interpolation alone is not sufficient.

## 5. Content and calculations

[gameData.ts](seppo-react/src/gameData.ts) contains:

- Animation definitions and preload helpers.
- Drink, food, weapon, relic, event and unlock definitions.
- Enemy pools, bosses, display-name pools and bestiary construction.
- Route generation.
- Stat helpers, shared damage calculation and UI label helpers.
- Level-up and area-clear upgrade choices.

[types.ts](seppo-react/src/types.ts) describes the data models, including
`GameState`, `Player`, `Enemy`, `Beer`, `Food`, `Relic`, route nodes and overlays.
The code currently retains permissive fields such as `OverlayData.body: unknown`,
string buff types and some casts; strict TypeScript does not mean every persisted
or dynamically selected value is runtime-validated.

Content-definition descriptions are not executable effects. New relics and
traits commonly require changes in both definitions and runtime handlers.

### Adding content safely

| Change | Places to inspect |
| --- | --- |
| Drink or food | Definition, buff/consumption handler, label helper, pool filters, shop and unlock eligibility |
| Weapon | Weapon catalog, boss drop order, area shop caps, event-only equipment and unlocks |
| Relic | Catalog, immediate stat handler, relevant combat/reward hooks, removal behavior, choice pools and unlocks |
| Enemy | Types, trait descriptions, animations/preload list, area pool, spawn scaling, execution and intent paths |
| Boss | Area boss selection, endpoint type, bestiary list, phase logic and rewards |
| Area | Names/backgrounds, enemy pool, endpoint selection, route generation, shop caps and UI assumptions |
| Event | Event definition, resolver branch, costs, unlock filtering, duplicate fallback and node advancement |

Use the stable catalog IDs in persistence and condition checks; display names
can change and randomized enemy names are not stable IDs. Update the corresponding
[documentation catalog](docs/README.md) alongside code.

## 6. Animation and assets

The source of truth for artwork is the root [assets](assets/) directory.
Character frames are individual images, not a sprite atlas.

Each `AnimDef` stores path, frame count, fps, loop flag and an array of
`HTMLImageElement`s. `preloadAllAnims` fills those arrays with URLs such as
`frame_000.png`, `frame_001.png`, and so on. It assigns image URLs without
awaiting a complete preload promise.

`Sprite`:

1. Selects an animation by key.
2. Falls back to its first frame path if preloaded images are absent.
3. Advances with `setInterval(1000 / fps)`.
4. Loops or calls `onComplete` after the final frame.
5. Restarts when animation set/key/sequence changes.
6. Clears its own interval on effect cleanup.

The sequence counter allows the same attack/hit animation to restart without
changing its key. South/east Seppo sets are selected for map/combat presentation.
Image CSS uses pixelated/crisp-edge rendering.

Preserve exact asset casing and filenames: some directories contain capitals,
and existing filenames include nonstandard spellings. Linux deployment is
case-sensitive even when Windows development is not.

### Vite asset plugins

[vite.config.ts](seppo-react/vite.config.ts) installs:

- A development middleware serving root assets for matching asset URLs.
- A `buildStart` hook copying root assets into `seppo-react/public/assets`.
- React transformation and PWA generation.

The copy hook also runs during development-server startup. Concurrent starts
or builds can contend on those same copied files, especially in a synchronized
folder. If an asset copy fails with a file-lock error, wait for the other copy
to finish and retry rather than deleting the source artwork.

## 7. Persistence and Firebase

### Local state

| Key | Purpose |
| --- | --- |
| `seppo_saved_run` | Local map-oriented checkpoint |
| `seppo_tutorial_seen` | Whether first-run introduction was dismissed |
| `seppo_dev_mode` | Local development override consulted by player creation |

The checkpoint deliberately excludes enemy state, active overlays and callbacks.
Resume reconstructs transient state and returns to the map. Not every
inventory/rest/navigation mutation saves immediately. See
[checkpoint semantics](docs/progression.md) before changing save boundaries.

The loader parses JSON and casts it; there is no schema version, migration layer
or deep validation. Some save/load errors are swallowed by existing code.
The newer tutorial preference reports failures with console warnings.

### Account orchestration

[firebase.ts](seppo-react/src/firebase.ts) initializes the Firebase client and
exposes Google popup sign-in, sign-out and an auth-state subscription.
Client project configuration is held in that module; this repository does not
use a documented `VITE_*` environment-variable mapping for it.

App:

- Subscribes to auth state.
- Loads a signed-in user's meta profile.
- Maintains meta in a ref and uses a state counter to trigger re-rendering.
- Uses loaded/dirty guards to avoid a delayed load overwriting newly updated
  run-end meta.
- On run end, updates profile statistics and starts an asynchronous meta save,
  followed by a leaderboard update.
- Derives eligible item IDs from current meta statistics.

Guest meta exists in memory; local checkpoints are independent of sign-in.
Cloud profile data does not contain a synchronized active run.

### Firestore documents

| Path | Data |
| --- | --- |
| `users/{uid}/data/meta` | Player name, cumulative statistics, unlock IDs, defeated names and retained run history |
| `leaderboard/{uid}` | Named public summary, aggregated retained-history score/time and latest 20 runs |

Profile saving caps history at 50 entries. Leaderboard writes require a player
name. The leaderboard is queried by descending `totalScore`, normally limited
to 20.

Name checking queries exact matches in the leaderboard. It is not an atomic
name reservation. The current delete-account operation removes the two
Firestore documents and signs out; it does not delete the Auth user.

### Deployment responsibilities

For a separate Firebase deployment, configure Google authentication, authorized
hosting domains and appropriate Firestore rules in the target project. Do not
embed service-account credentials or private keys in the browser bundle.

The repository's Pages workflow deploys static assets, not Firebase
infrastructure. Scores and results are calculated client-side; this is not
server-authoritative competitive validation. Do not claim protection against
client-edited state merely because a player is authenticated.

## 8. PWA and caching

PWA generation is configured in Vite with `registerType: 'autoUpdate'`.

| Setting | Current configuration |
| --- | --- |
| Base / scope / start URL | `/seppo_rpg/` |
| Display | Fullscreen |
| Orientation | Landscape |
| Icons | 192x192 and 512x512, including maskable 512x512 |
| Navigation fallback | `/seppo_rpg/index.html` |
| Build precache glob | JS, CSS, HTML and WOFF2 |
| Included public assets | `assets/**/*` |
| Maximum precached file size | 5 MiB per file |

Runtime caches:

| Cache | Strategy | Limit |
| --- | --- | --- |
| Game asset PNG/JPG/WebP/JSON URLs | CacheFirst | 500 entries, 30 days |
| Google Fonts CSS | CacheFirst | 10 entries, 365 days |
| Google font files | CacheFirst | 30 entries, 365 days |

Do not interpret runtime caching as a guarantee that every unvisited asset or
online account feature will work offline. Cached assets/service workers can also
explain stale production visuals. Test PWA behavior on a production preview or
deployment, not solely with the development server.

If hosting at another path, update the Vite base, PWA scope/start/fallback, HTML
icon URL and deployment assumptions together. Changing only one can break
navigation, assets or install behavior.

## 9. Development and validation

From the repository root in PowerShell:

```powershell
Set-Location .\seppo-react
npm ci
npm run dev
```

Open the Vite URL with `/seppo_rpg/`, normally
`http://localhost:5173/seppo_rpg/`. The optional
[Windows setup helper](setup-windows.ps1) checks Node/npm, runs `npm install`
and starts Vite unless `-InstallDepsOnly` is supplied.

### Available scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | `tsc -b`, then Vite production build and PWA generation |
| `npm run preview` | Serve the built output locally |
| `npm run deploy` | Build plus Unix-style copy/`.nojekyll` shell operations; not itself a remote Pages publication |

Use the workflow for deployment. The `deploy` package script uses commands that
are not portable to a default Windows npm shell.

TypeScript uses strict checking, ES2020 application target, bundler module
resolution and React JSX transformation. `noUnusedLocals` and
`noUnusedParameters` are disabled. This explains why retained helpers can compile
without being active game features.

There are no test or lint scripts declared in the current application manifest.
The existing automated baseline is the build/type-check. Useful focused browser
checks include:

- First-run tutorial, skip/completion persistence, Guide reopening and Continue.
- Attack, Block and drink/food consumption through a complete enemy response.
- Target switching and final victory in a multi-enemy encounter.
- Route completion, event result continuation, shop exit and saved-run resume.
- Full inventory scrolling at short landscape sizes such as 568x320 and 667x375.
- Desktop layout at 1440x900 and behavior around 1024/1280 px breakpoints.
- Production preview, asset URLs, installation and refresh behavior for the PWA.
- Account flows with authorized test accounts; guest gameplay without sign-in.

Do not use someone else's active run/profile as a test fixture. Separate browser
origins/profiles can isolate local storage. Avoid treating card text alone as
proof that a combat mechanic works.

## 10. GitHub Pages deployment

[deploy.yml](.github/workflows/deploy.yml):

1. Runs on pushes to `main` or manual workflow dispatch.
2. Checks out the repository on Ubuntu.
3. Sets up Node 20 and npm caching using the app lockfile.
4. Runs `npm ci` and `npm run build` from `seppo-react`.
5. Adds `.nojekyll` to the generated output.
6. Uploads `seppo-react/dist` as the Pages artifact.
7. Deploys the artifact to the `github-pages` environment.

The workflow uses read access to contents, write access to Pages and an ID token.
Pages deployments share a concurrency group and do not cancel an in-progress
deployment.

## 11. Known implementation gaps

These are observed behavior distinctions, not changes introduced by the docs:

- Intent previews and actual enemy execution are separate random paths; displayed
  debuff actions are not executed.
- Some declared traits and immunity effects are only partially implemented.
- Entry-time trait initialization uses the active enemy rather than every group
  member.
- Ismo is an endpoint but not runtime boss-flagged.
- Overkill reads zero-clamped HP; Liquid Armor lacks its advertised per-fight
  reset; shopkeeper victory restores challenge-start balance rather than
  pre-purchase balance.
- Save data has no schema migration/validation, and saves are not continuous.
- Engine timeout tracking does not currently provide a general cancellation
  cleanup on reset/unmount.
- Profile/leaderboard persistence is asynchronous and client-authored.

Detailed gameplay effects and exceptions are located in the corresponding
[game logic](docs/game-logic.md), [enemy](docs/enemies.md),
[item](docs/items.md), [relic](docs/relics.md),
[event](docs/world-and-events.md) and [progression](docs/progression.md) references.
