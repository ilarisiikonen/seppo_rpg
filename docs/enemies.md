# Enemies and bosses

[Documentation index](README.md) | [Combat rules](game-logic.md) | [World](world-and-events.md)

Source: [gameData.ts](../seppo-react/src/gameData.ts) and the spawn, intent,
attack and enemy-turn functions in [useGameState.ts](../seppo-react/src/useGameState.ts).

## Reading the tables

HP, ATK and DEF below are **base template values**. Normal enemies and most
bosses scale with player level. `loot` is a template probability, but current
weapon-drop execution uses it only for runtime boss enemies. It is not the
probability of receiving any consumable reward.

Regular templates have no explicit ID. Rows identify them by area and, when
needed, sprite variant. The menu bestiary collapses duplicate display names
within an area, so the two Office consultants do not appear as separate entries.

## Regular enemy catalog

| Area (index) | Template | HP | ATK | DEF | XP | loot | Traits |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Office (0) | Consultant, variant 1 | 62 | 13 | 4 | 20 | 0.24 | `micro_manager` |
| Office (0) | Consultant, variant 2 | 68 | 14 | 5 | 24 | 0.26 | `micro_manager` |
| Park (1) | Cyclist | 96 | 21 | 8 | 36 | 0.33 | `helmet` |
| Park (1) | Drunk Guy, variant 1 | 109 | 23 | 8 | 41 | 0.35 | `drink_steal` |
| Street (2) | Drunk Guy, variant 2 | 140 | 29 | 11 | 54 | 0.39 | `drink_steal` |
| Street (2) | Black Metal Musician | 153 | 31 | 12 | 61 | 0.40 | `dark_scream` |
| Ravintola Kulma (3) | Black Metal Musician | 172 | 34 | 13 | 70 | 0.42 | `dark_scream` |
| Ravintola Kulma (3) | Bouncer | 188 | 36 | 15 | 78 | 0.45 | `iron_body` |
| Ravintola Kulma (3) | Consultant, variant 2 | 161 | 33 | 14 | 68 | 0.41 | `micro_manager` |
| Church (4) | Priest | 210 | 40 | 16 | 88 | 0.46 | `holy_smite` |
| Church (4) | Janitor | 195 | 38 | 17 | 82 | 0.44 | `slippery_floor` |
| Church (4) | Gravedigger | 225 | 42 | 15 | 92 | 0.48 | `grave_chill` |
| Basement (5) | Cult Member | 250 | 46 | 18 | 100 | 0.48 | `self_sacrifice` |
| Meadow (6) | Police Officer | 280 | 50 | 20 | 110 | 0.50 | `tazer` |
| Hell (7) | Satan | 310 | 56 | 22 | 125 | 0.52 | `hellfire`, `low_hp_atk_boost` |
| Hell (7) | Skeleton | 270 | 52 | 19 | 115 | 0.50 | `bone_explosion` |

There are 16 template objects: the table contains 16 rows including both Office
consultant variants and repeated types in different areas.

### Randomized display names

Consultants choose from Junior Data Analyst, Data Engineer, HR Manager, Scrum
Master and Project Manager.

Black Metal Musician templates use `_BM_` internally and choose from Abbath,
Varg, Blargh, Lord Satanacchia, Euronymous, Inferno Skull, Hellstorm and Voidwalker.
Elite display names receive a star prefix. Run kill records store the resulting
display name, not a stable enemy-template ID.

## Area endpoints

| Area | Source constant | Display name | HP | ATK | DEF | XP | loot | Trait |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Office | `ISMO_FIRST_FIGHT` | The Boss (Ismo) | 156 | 22 | 9 | 60 | 0.35 | `boss_weak_frail` |
| Park | `PARK_BOSS_DATA` | Angry Blue-Collar Man | 220 | 28 | 12 | 120 | 0.40 | `boss_vulnerable` |
| Street | `STREET_BOSS_DATA` | The Satanist | 320 | 35 | 14 | 200 | 0.45 | `satanist_rage` |
| Ravintola Kulma | `BAR_BOSS_DATA` | The Bartender | 450 | 44 | 18 | 350 | 0.50 | `bartender_poison` |
| Church | `CHURCH_BOSS_DATA` | The High Priest | 520 | 48 | 20 | 420 | 0.50 | `high_priest_wrath` |
| Basement | `BASEMENT_BOSS_DATA` | The Cult Leader | 600 | 54 | 22 | 480 | 0.55 | `cult_leader_drain` |
| Meadow | `MEADOW_BOSS_DATA` | Karhu Special Operator | 700 | 60 | 24 | 550 | 0.55 | `karhu_fury` |
| Hell | `HELL_BOSS_DATA` | Seppo | 800 | 65 | 26 | 666 | 0.60 | `mirror_self` |

Despite the identifier `ISMO_FIRST_FIGHT`, Ismo is the **Office route endpoint**,
not the first route fight. His dedicated spawn path uses fixed base stats and
sets `isBoss: false`. Accordingly, he does not receive normal boss stat scaling,
boss coin multipliers, boss weapon drops or boss phase handling.

The separate fallback `BOSS_DATA` defines THE BOSS at 585 HP, 50 ATK, 22 DEF,
500 XP and loot 0. The ordinary eight-area route selects the constants above;
this fallback is not an additional ninth endpoint. Its phase configuration is
nevertheless reused by runtime bosses.

## Encounter size and scaling

Let `P` be player level:

```text
normalScale = 1 + (P - 1) * 0.12
multiScale = 0.7 if there is more than one enemy, otherwise 1
eliteScale = 1.5 for an elite, otherwise 1
normal/elite HP, ATK, DEF =
  round(templateStat * normalScale * multiScale * eliteScale)

normal XP = templateXP
elite XP = round(templateXP * 2)
elite loot = min(1, templateLoot * 2)

bossScale = 1 + (P - 1) * 0.08
boss HP, ATK, DEF = round(templateStat * bossScale)
boss XP = templateXP
```

| Area | One regular enemy | Two | Three |
| --- | ---: | ---: | ---: |
| Office, Park, Street | 100% | 0% | 0% |
| Ravintola Kulma | 65% | 35% | 0% |
| Church through Hell | 40% | 35% | 25% |

Elites and bosses are always single-enemy encounters. Group enemies are selected
independently from the same area pool, so duplicates are possible. Their reduced
combat stats do **not** reduce individual XP.

## Traits: declared purpose versus current execution

The preview system chooses trait-specific debuffs, but the active enemy-turn
handler does not apply those choices. Rows marked **preview only** describe
what can be shown, not a guaranteed applied effect.

| Trait | Current implementation |
| --- | --- |
| `micro_manager` | Weak in the preview pool; preview only. |
| `helmet` | Initial active enemy doubles DEF. A player attack taking it to 50% HP or lower breaks the helmet and restores stored DEF. Helmet enemies cannot choose a preview debuff. |
| `drink_steal` | Initial active enemy steals one owned drink at entry when area index is at least 2, then heals 15% of its max HP. At full HP the heal has no benefit. The Park variant does not steal. |
| `dark_scream` | Weak in the preview pool; preview only. |
| `iron_body` | A player attack that deals positive HP damage causes 3 direct recoil damage. It is not triggered by poison or thorns. |
| `holy_smite` | Vulnerable in the preview pool; preview only. |
| `slippery_floor` | Runtime preview pool contains both Weak and Frail, not just Frail; preview only. |
| `grave_chill` | Poisoned in the preview pool; preview only. |
| `self_sacrifice` | Declared as healing the Cult Leader, but no active resolution branch implements it. Bosses do not currently spawn with cult-member allies. |
| `tazer` | Each strike doing positive HP damage has a 25% chance to flag a skipped player turn. Fully blocked hits cannot trigger it. |
| `hellfire` | Alcohol Poisoning in the preview pool; preview only. |
| `bone_explosion` | On a kill in the player attack handler, directly removes `round(enemy.maxHp * 0.10)` player HP. Poison/thorns deaths do not run that branch. |
| `boss_weak_frail` | Weak or Frail in the preview pool; preview only. |
| `boss_vulnerable` | Vulnerable in the preview pool; preview only. |
| `satanist_rage` | Weak preview; preview ATK multiplied by 1.3 at 30% HP or lower. Executed strikes omit this rage multiplier. |
| `bartender_poison` | Alcohol Poisoning in the preview pool; preview only. |
| `high_priest_wrath` | Preview chooses Weak or Vulnerable, not both simultaneously; preview only. |
| `cult_leader_drain` | Heals `round(actual HP damage * 0.20)` after a damaging strike, capped at max HP. |
| `karhu_fury` | During intent rolling, at 30% HP or lower, DEF is multiplied by 1.5 once. Uses `helmetBroken` as its one-time flag. |
| `mirror_self` | At entry chooses one player buff. Only `atk` and `def` types translate into enemy stats; other types can be named in the log without a stat change. |
| `low_hp_atk_boost` | Preview ATK multiplied by 1.3 at 30% HP or lower; executed strikes omit the multiplier. |

Entry-time helmet, steal and mirror processing currently targets only `g.enemy`,
the first active enemy, rather than iterating over every member of a group.

## Intent generation and actual turns

Preview generation:

- 30% block chance.
- If not blocking, a 45% debuff chance with a trait-specific debuff pool, otherwise
  30% with the generic pool.
- The generic pool is Weak, Vulnerable, Frail, Alcohol Poisoning and Poisoned.
- A preview block or debuff leaves one strike; otherwise there are two.
- These are conditional chances, not independent final percentages.

Actual execution:

- Tick that enemy's debuffs, then apply any remaining poison.
- Clear its previous block.
- Independently roll 30% block: gain its current DEF as block and strike once.
- Otherwise strike twice.
- Roll new damage for each strike; enemy critical chance is zero.
- Process drain, tazer, thorns and death as applicable.

Do not interpret preview numbers as committed damage rolls.

## Shared boss phases

Player attacks call the shared boss phase checker at 60% and 30% remaining HP.
It updates a phase index and logs the fallback boss's messages. Once phase index
is at least 1, both preview and executed strikes add **12 ATK**, using the second
phase's bonus. Thus the current bonus begins at the first threshold, not only
at 30%. Ismo's dedicated non-boss spawn does not use this behavior.

## Optional shopkeeper encounter

`SHOPKEEPER_FIGHT_DATA` has 150 HP, 24 ATK, 12 DEF, zero XP and zero loot.
The challenge scales HP/ATK/DEF by
`round(base * (1 + (P - 1) * 0.12) * 1.5)`.

It is elite-flagged but handled by a separate reward path. It does not grant
ordinary elite rewards, XP or a relic choice. Loss leaves Seppo with 15% max HP
(minimum 1) and zero coins. See [shop behavior](items.md) for the current refund
discrepancy.
