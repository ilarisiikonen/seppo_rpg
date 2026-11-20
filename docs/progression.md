# Progression, scoring and persistence

[Documentation index](README.md) | [Game logic](game-logic.md) | [Technical documentation](../TECHNICAL_DOCUMENTATION.md)

Source: leveling/end-run/save handlers in
[useGameState.ts](../seppo-react/src/useGameState.ts), upgrades/unlocks in
[gameData.ts](../seppo-react/src/gameData.ts), and
[firebase.ts](../seppo-react/src/firebase.ts) / [App.tsx](../seppo-react/src/App.tsx).

## Three different progress measures

| Measure | Meaning |
| --- | --- |
| Player level | XP-based stats and bonus choices; starts at 1. |
| Area index | Location in the eight-area run; 0 for Office through 7 for Hell. |
| Meta progression | Profile totals, high score, best area, wins and unlock milestones across recorded runs. |

A new run resets player stats, inventory, routes and owned relics. Profile unlocks
affect what can appear; they are not carried equipment or retained player levels.

## XP and player levels

Initial XP is 0 and the first threshold is 50. On gaining XP:

```text
while xp >= xpNext:
  xp -= xpNext
  playerLevel += 1
  xpNext = round(xpNext * 1.45)
  maxHp += 5
  baseAtk += 1
  baseDef += 1
  hp = min(hp + 5, maxHp)
  grant one random common normal drink or common food
  queue one bonus choice
```

Overflow XP is retained, so a large encounter reward can produce multiple levels.
The free level-up item uses the common normal pool, not special/cursed drinks.

Each queued level-up presents three distinct options sampled from the six below.
Let `s = max(1, currentPlayerLevel - 1)`:

| ID | Choice | Effect |
| --- | --- | --- |
| `lhp` | Max HP | Add `8 + 3*s` max HP and heal by that amount. |
| `latk` | ATK | Add `2 + floor(0.7*s)` base ATK. |
| `ldef` | DEF | Add `2 + floor(0.7*s)` base DEF. |
| `lcrit` | Crit | Add `5 + s` percentage points of critical chance. |
| `lreg` | Post-fight regen | Add `2 + s` to HP healed after a won encounter. |
| `lmix` | ATK and DEF | Add `1 + floor(0.4*s)` to both base stats. |

Queued choices are generated using the player's **current** level when shown,
not a stored historical level for each queued increment.

## Area-clear rewards

For each non-final area endpoint:

1. Heal `round(maxHp * 0.25)`.
2. Receive `2 + currentAreaIndex` normal consumable drops.
3. Choose one of three distinct upgrades sampled from the following six.
4. Advance to the next area, reset route choice/progress and save a map checkpoint.

| ID | Upgrade | Effect |
| --- | --- | --- |
| `hp` | +15 Max HP | Add 15 max HP and heal 15. |
| `atk` | +5 ATK | Add 5 base ATK. |
| `def` | +4 DEF | Add 4 base DEF. |
| `crit` | +8% Crit | Add 8 percentage points to critical chance. |
| `regen` | +3 HP Regen | Add 3 to post-fight healing. |
| `fury` | +3 ATK & DEF | Add 3 to both base stats. |

The final Hell boss transitions directly to victory after its fight reward
continuation, rather than offering another area-clear upgrade.

## Unlock catalog

Unlocks are computed from profile `bestLevel`, `highScore` and `totalWins`.
`bestLevel` stores an **area index**, not player XP level.

| ID | Name | Requirement | Gated IDs |
| --- | --- | --- | --- |
| `unlock_lv2` | Street Veteran | Best area index >= 1: reach Park (displayed area 2) | `triple_beer`, `beer_dmg`, `beer_block`, `desperation`, `tenth_strike`, `sour`, `sour_u` |
| `unlock_lv3` | Bar Brawler | Best area index >= 2: reach Street (area 3) | `karjala`, `karjala_u`, `bat`, `cone`, `tap` |
| `unlock_lv4` | Night Crawler | Best area index >= 3: reach Ravintola Kulma (area 4) | `pilsner`, `pilsner_u`, `bonus_hp_unc`, `bonus_atk_unc`, `bonus_def_unc` |
| `unlock_lv5` | Hellraiser | Best area index >= 4: reach Church (area 5) | `karhu`, `karhu_u`, `crowbar`, `axe`, `chain` |
| `unlock_score_1k` | Rising Star | Single-run high score >= 1,000 | `perma_beer`, `lifesteal` |
| `unlock_score_3k` | Legend | Single-run high score >= 3,000 | `overkill`, `glass_cannon`, `kegsword`, `pitchfork`, `chalice` |
| `unlock_score_5k` | Unstoppable | Single-run high score >= 5,000 | `debuff_immune`, `coin_power` |
| `unlock_win` | Champion | At least one recorded win | `olvi_r`, `sour_r`, `karjala_r`, `pilsner_r`, `karhu_r` |

There are **eight** milestone definitions in this table. Their display titles
are flavor, not reliable area names: for example Street Veteran unlocks at Park.

Unlock evaluation happens when a run is recorded as won, lost or given up;
reaching an area does not immediately update profile milestones mid-run.
The application derives eligible IDs from the loaded profile's statistics.

Most generated drops, shop stock, boss weapons and ordinary relic choices use
unlock filtering. Some events and Lucky Flask sample unfiltered catalogs.
Unlocks therefore are not an absolute prohibition on acquiring every gated item
through every mechanism.

## Scoring

Both win and loss use the same formula:

```text
enemyScore = sum(recordedDefeatedEnemy.xp * 5)
beerScore = beersDrunk * 50
totalScore = enemyScore + beerScore + totalDmgDealt
```

There is no explicit time, area-clear or victory multiplier.

- Every consumed drink adds to `beersDrunk`, including drinks outside battle.
- The attack handler records post-block damage, including numerical overkill.
- Poison and thorns damage are not added to that attack counter.
- Enemies are added to the defeated list on a **won encounter**. Killing one
  member of a group and then losing does not record a win for that partial group.
- Every enemy record in a won group receives the same encounter-wide
  `currentFightDmg`, so that field is not a per-target damage attribution.
- The special shopkeeper end path skips normal kill recording and XP. Attack
  damage and drinks used during the challenge can still contribute to run totals.

Elapsed time is displayed and saved in run history but is not part of score.
It starts when the actual run begins after the tutorial and includes time in
the story, map and overlays; there is no general pause subtraction.

## Local run checkpoints

Storage key: `seppo_saved_run`.

| Saved field | Content |
| --- | --- |
| `player` | Stats, inventory, weapon, relics, buffs/debuffs and player counters |
| `currentLevel`, `currentRound` | Current area and route-progress counter |
| `levelRoutes` | Generated routes and completion flags for all areas |
| `chosenRoute`, `routeNodeIdx` | Selected route and position |
| `elapsedMs` | Elapsed time at checkpoint |
| `runStats` | Beer count, defeated records and attack damage counters |
| `nextIdCounter` | Next UI/log identifier |

Checkpoints are written at starting-relic completion, common return-to-map
transitions, area upgrade completion and some relic-skip paths. They are not
written continuously.

**Continue** creates a fresh transient game state, restores the snapshot,
sets phase to map, clears active enemies and battle flags, and reconstructs
start time from saved elapsed time. It does not restore:

- A fight, enemy HP or whose turn it was.
- Shop inventory/prices or an active event.
- Open modal choices, pending animations or battle logs.
- Time spent away after the checkpoint.

Choosing New Run, reaching victory/defeat, or returning through the end-run
menu clears the stored run. Checkpoints are local to the browser and origin,
not cloud-synchronized.

The current loader uses JSON parsing plus a TypeScript cast, without schema
validation or version migration. Save failures can be silent, and checking for
a saved run only checks key presence. Do not promise recovery from incompatible
or corrupted saves.

## Tutorial preference

Storage key: `seppo_tutorial_seen`, with value `1` after either completion or skip.

The tutorial appears before the first new run in that browser, not before
Continue. It does not start the run timer until dismissed. It can always be read
in **Menu > Guide > Basics**. Preference read/write failures are logged; a failed
write does not block starting the run.

This preference is separate from the run checkpoint and Firebase profile.

## Accounts and meta profile

Playing does not require signing in. Firebase Google sign-in enables profile
loading/saving. The private meta document is stored at:

```text
users/{uid}/data/meta
```

Its fields are:

- `playerName`
- `totalRuns`, `totalWins`, `bestLevel`
- `totalKills`, `totalDmgDealt`, `totalBeersDrunk`
- `highScore`
- `unlockedIds` (milestone IDs)
- `defeatedEnemies` (unique recorded display names)
- `runHistory` (date, area, result, score, kills and elapsed time)

Run end increments totals, updates maxima, merges enemy names and evaluates new
unlocks. Cloud saves cap history at the latest **50 runs**. Loading merges stored
fields with defaults; it is not a comprehensive schema migration.

Guest progression is updated in memory during the current application session,
but is not independently saved as a persistent guest profile. A local run save
is not a replacement for cloud meta storage.

## Leaderboard

Public entries live at `leaderboard/{uid}`. An entry is written only when the
profile has a nonempty player name.

| Field | Meaning |
| --- | --- |
| `highScore` | Highest single-run score recorded in profile |
| `totalScore` | Sum of scores in the currently retained profile history |
| `bestLevel` | Best area index |
| `totalWins`, `totalRuns`, `totalBeersDrunk` | Cumulative profile totals |
| `totalPlayTime` | Sum of elapsed times in retained profile history |
| `runHistory` | Last 20 records copied into the public entry |

The query orders by `totalScore` descending and normally fetches 20 entries.
Because score/time are derived from retained history, they are not guaranteed
lifetime totals after the profile history cap.

Name availability is checked by an exact name query against public leaderboard
entries; the client does not make a transactional name reservation.

The current Delete Account handler deletes the meta and leaderboard documents
and signs out. It does **not** delete the Firebase Authentication user or clear
local run/tutorial storage.
