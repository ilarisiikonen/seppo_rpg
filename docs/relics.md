# Relics

[Documentation index](README.md) | [Items](items.md) | [Progression and unlocks](progression.md)

Source: `RELICS` and derived-stat helpers in
[gameData.ts](../seppo-react/src/gameData.ts), and acquisition/combat/event
handlers in [useGameState.ts](../seppo-react/src/useGameState.ts).

There are **26 relics**: 12 common, 8 uncommon and 6 rare. Relics are passive or
acquisition-time effects, not cards that spend actions.

## Acquisition and ownership

| Source | Selection |
| --- | --- |
| Starting choice | Up to three unlocked common relics; choose one. |
| Elite reward | Up to three unlocked common/uncommon relics; choose one. |
| Treasure | Up to three unlocked relics of any rarity; choose one, plus a normal consumable drop. |
| Shop | Up to two unlocked unowned relics; buy individually. |
| Events | Event-specific rarity, duplicate and unlock rules. |

Regular boss wins do not directly present a relic choice. Their rewards feed
level completion and upgrades instead.

Selection helpers draw without replacement and uniformly over eligible relic
objects. `pickRelicsByRarity` does not apply rarity weights despite its name.
In choice overlays, already-owned relics are filtered **after** drawing three,
so there can be fewer than three options, or the choice can be skipped even when
some unowned relics remain elsewhere in the pool.

Shop generation filters owned relics before drawing. Several events instead
draw one and reject it if already owned, with no reroll.

## Common catalog

| ID | Name | Current effect and important detail |
| --- | --- | --- |
| `auto_block` | Stone Skin Amulet | At player-turn end, if current block is exactly zero, set it to 6. The check is remaining block, not whether the Block button was used. |
| `beer_start` | Lucky Flask | Select one random drink from the entire drink catalog at combat start and pass its scaled effect into the generic buff helper. See exceptions below. |
| `beer_def` | Liquid Armor | Each consumed drink adds 1 base DEF. There is no end-of-fight subtraction, despite the per-fight description. |
| `bonus_hp` | Tough Hide | On acquisition, +10 max HP and heal 10, capped at the new maximum. |
| `bonus_atk` | Iron Knuckles | On acquisition, +5 base ATK. |
| `bonus_def` | Padded Jacket | On acquisition, +5 base DEF. |
| `treasure_heal` | Scavenger's Charm | Heal 10 on entering a treasure node, including mystery-to-treasure. |
| `first_strike` | Sucker Punch | Add 10 to effective ATK for the first Attack action in each encounter, before defence and multipliers. |
| `tough_start` | Taped Fists | Add 10 to current block at combat start. |
| `food_bonus` | Lead Belly | Eating food heals 5 additional HP, capped at maximum HP. |
| `rest_bonus` | Power Nap | Map rest heals 55% max HP instead of 40%. Does not change the separate generic 25% rest helper or level-clear healing. |
| `crit_ring` | Lucky Ring | Add 5 percentage points to critical chance. |

All common relics are available by default.

## Uncommon catalog

| ID | Name | Current effect | Unlock |
| --- | --- | --- | --- |
| `triple_beer` | Brewer's Blessing | Every third drink since combat-counter reset doubles the computed scaled value. It does not double base-value action/triple branches. | Street Veteran |
| `beer_dmg` | Drunken Fist | Effective attack gains `3 * beersThisFight` when attacking. This bonus is not included in the generic ATK helper. | Street Veteran |
| `beer_block` | Hop Shield | During combat, drinking grants `round(scaledValue * 0.5)` block after Brewer's Blessing/Eternal Buzz modification. | Street Veteran |
| `desperation` | Cornered Rat | Four actions below 30% max HP at combat entry; on later normal turns the comparison is at or below 30%. | Street Veteran |
| `bonus_hp_unc` | Bear Gut | On acquisition, +15 max HP and heal 15. | Night Crawler |
| `bonus_atk_unc` | Brass Knuckles | On acquisition, +10 base ATK. | Night Crawler |
| `bonus_def_unc` | Riot Vest | On acquisition, +10 base DEF. | Night Crawler |
| `tenth_strike` | Momentum | Every tenth Attack action since combat start adds a +100% damage multiplier to the main hit. Counter resets each encounter. | Street Veteran |

## Rare catalog

| ID | Name | Current effect | Unlock |
| --- | --- | --- | --- |
| `perma_beer` | Eternal Buzz | Halves the computed scaled drink value, rounded, and gives ordinary buffs duration 999 so routine ticking does not expire them. | Rising Star |
| `lifesteal` | Vampiric Grip | On positive player attack damage, heal `max(1, round(damage * 0.10))`, capped at max HP. Poison/thorns do not use this handler. | Rising Star |
| `debuff_immune` | Finnish Sisu | Description promises immunity, but current debuff application has no immunity check. | Unstoppable |
| `overkill` | Overkill | Description promises excess-kill damage as future ATK, but the current kill handler reads already-clamped HP, producing zero excess. | Legend |
| `coin_power` | Greed is Good | Derived ATK includes `floor(currentCoins / 20)`. Spending coins immediately lowers that bonus. | Unstoppable |
| `glass_cannon` | Glass Cannon | On acquisition, +25 base ATK, then lose `round(maxHp * 0.30)` maximum HP; current HP is capped at the reduced maximum. | Legend |

See [unlock requirements](progression.md) for exact milestones. Events can
currently award some otherwise locked relics because not every event uses the
unlock-filtered pool.

## Detailed interactions

### Lucky Flask is a buff roll, not a consumed drink

Lucky Flask does not remove inventory, spend an action or increment beer counters.
It samples all 38 drink definitions without rarity or unlock filtering and uses
the normal area/player-level scaling formula.

However, it calls the generic `applyBuff` path rather than `drinkBeer`:

- Ordinary ATK/DEF/both/block/crit/regen/thorns effects can be applied.
- Cleanse and actions drinks have duration zero and do not execute their instant
  cleanse/action behavior.
- A triple-type entry can still be consumed by the attack handler, which searches
  for that type without checking its duration.
- A cursed drink does not apply its enemy debuff.
- Brewer's Blessing and Eternal Buzz's consumption modifiers are not applied.

Thus "a random Beer effect" is not identical to manually drinking that item.

### Brewer's Blessing and Eternal Buzz

For a normal scaling-dependent effect:

```text
v = round(base * areaAndPlayerScale)
if third drink: v *= 2
if Eternal Buzz: v = round(v * 0.5)
```

Hop Shield uses this final `v`, including for special drinks whose own instant
effect uses an unscaled base value. For example, Pilsner's action grant is not
doubled, but its computed value can still feed Hop Shield.

Eternal Buzz's duration 999 only prevents ordinary ticking. Explicit clearing,
such as Back Alley Gym removing all buffs, still removes these effects.
Previously acquired permanent buffs are not converted back if the relic is lost.

### Attack counters and damage

Sucker Punch and Momentum count **Attack actions**, not every separate damage
event. Poison, thorns and consuming drinks do not advance the attack counter.
The counter and per-fight beer count reset at each combat initialization.

Vampiric Grip uses the post-block damage value, which can include overkill beyond
an enemy's remaining HP. This differs from healing based only on HP actually lost.

### Acquisition-time stats and relic removal

Stat relics mutate player stats when acquired rather than continuously deriving
their bonuses from ownership. The Fork in the Alley event removes a relic from
the owned list but does **not** reverse acquisition-time stat changes. Dynamic
ownership checks, such as Greed is Good, stop applying when the relic is removed.

Acquiring Glass Cannon is not automatically a full heal or a proportional
rescaling of current HP; it reduces max HP and clamps current HP only.

### Immunity and per-fight wording

Finnish Sisu, cleanse immunity markers and the Street Musician's "Debuff
Immunity" marker currently lack enforcement in `applyDebuff`. Enemy preview
debuffs also are not executed by the active enemy-turn path. Do not infer a
working immunity system from the absence of those enemy debuffs.

Likewise Liquid Armor's base-DEF increases persist because no cleanup subtracts
them. This page documents execution, not just the wording on the relic card.
