# Game logic

[Documentation index](README.md) | [Enemies](enemies.md) | [Items](items.md) | [Progression](progression.md)

Source: [useGameState.ts](../seppo-react/src/useGameState.ts),
[gameData.ts](../seppo-react/src/gameData.ts),
[BottomUI.tsx](../seppo-react/src/components/BottomUI.tsx).

## Run flow

```text
Title screen
  -> first-new-run tutorial, unless already dismissed in this browser
  -> story
  -> choose a common starting relic
  -> choose one route for the current area
  -> resolve route nodes
  -> area's shared endpoint encounter
  -> heal, supplies, upgrade, next area
  -> defeat Hell's Seppo endpoint to win
```

Death normally ends the run. The shopkeeper challenge has a separate, nonfatal
loss path. **Give Up Run** records a defeat. **Continue** resumes a local
checkpoint at the map, not a live combat state.

There are eight areas. The route has 5-7 generated nodes followed by its endpoint;
the legacy `ROUNDS_PER_LEVEL = 5` constant is not the actual route length.

## Starting state

These are ordinary-run values; the development-mode override is not game balance.

| Property | Start |
| --- | --- |
| Player level / XP / next threshold | 1 / 0 / 50 |
| HP / maximum HP | 80 / 80 |
| Base ATK / base DEF | 12 / 7 |
| Critical chance | 10% |
| Weapon / coins | None / 0 |
| Drinks | Hoppy IPA, Pale Ale, Lager and Porter: one each |
| Food | Two Burgers and one Kebab |
| Relics | None until the starting choice |
| Buffs, debuffs and bonus counters | Empty or zero |

## Controls and information

| Control | Behavior |
| --- | --- |
| Attack | Attack the selected living enemy. |
| Block | Add block to Seppo's current shield. |
| Drink / Eat | Open available inventory choices, then consume a selected item. Opening the menu is not itself an action. |
| Hand cards | Another way to consume owned drinks and food; copies represent available quantities. |
| Enemy sprite in a group | Switch target without spending an action, while the player can act. |
| Map | View route progress. Choose a route and proceed through its current node. |
| Food on the map | Heal outside battle without spending combat actions. |
| Relics | Inspect owned passive items. |
| Menu | Stats, leaderboard, unlocks, guide and giving up the run. |
| Enemy information | Inspect stats, flavor and declared traits. |

Desktop uses a card fan at the `lg` breakpoint; narrower screens use a horizontal
card strip. Mobile is landscape-oriented. The tutorial and shop use their own
scrollable content areas rather than scrolling the hidden-overflow page body.

## Turns and targeting

1. Combat initializes the action budget to **3**, then applies start-of-combat
   relic behavior.
2. Attack, Block, consuming a drink and eating food each cost **one action** in
   battle. Special drinks can add actions before their own action cost is deducted.
3. At zero actions, input is locked and the enemy sequence is scheduled after
   1,800 ms.
4. Living enemies act in array order. Ordinary responses are either two strikes,
   or a block followed by one strike.
5. After the enemy sequence, buffs and debuffs are processed, block clears for
   the next normal player turn, actions reset and intent previews are refreshed.

Killing one enemy in a group selects the next living enemy and uses an action;
remaining actions can still be spent. Killing the last enemy schedules victory
after its death animation. Enemy turns also change the active target for
animation; the selected enemy after the response need not be the one previously
chosen by the player.

**Cornered Rat** can grant a fourth action at low HP. A successful police tazer
effect skips the next player turn and starts another enemy response.

There is a private `flee()` implementation, but it is not exported in the current
action object or exposed by the current action buttons. Fleeing is not a
documented player control.

## Derived stats

### Attack

```text
displayed/helper ATK =
  baseAtk
  + equipped weapon ATK
  + rageBonus
  + active atk and both buff values
  + floor(coins / 20), when Greed is Good is owned
  + overkillBonus
```

An actual attack additionally includes:

- **Drunken Fist:** `3 * beersThisFight`.
- **Sucker Punch:** `+10` on the first attack in the fight.

These additions enter ATK **before defence, variance and multipliers**. Sucker
Punch is not a guaranteed flat 10 HP removed after all mitigation.

### Defence and block

```text
DEF = baseDef + active def and both buff values
Block gained by Block = baseDef + blockBonus + active block buff values
```

Temporary DEF/both buffs therefore reduce incoming damage but do not directly
increase the Block action's gain. A Frail player receives
`round(blockGain * 0.75)`.

Block is a separate consumable shield:

```text
absorbed = min(currentBlock, incomingDamage)
newBlock = max(0, currentBlock - incomingDamage)
HP damage = max(0, incomingDamage - absorbed)
```

Multiple Block actions stack. Block absorbs ordinary hits, poison ticks and
alcohol-poison damage. Recoil and skeleton explosions directly subtract HP.
Unused player block is cleared when a normal new player turn begins; unused
enemy block clears at the start of that enemy's next active turn.

The combat initializer does not explicitly clear `g.isBlocking`; Taped Fists
adds to the current value. Do not assume all encounter-entry paths reset it.

### Critical chance

```text
critChance =
  0.10
  + critBonus / 100
  + active crit buff values / 100
  + 0.05 if Lucky Ring is owned
```

The helper does not cap this value. Enemy attacks pass zero critical chance.

## Damage calculation

The shared damage helper calculates:

```text
base = max(1, attack - defence)
variance = 0.85 + random() * 0.30
modified = base * variance
for each percentage modifier p: modified *= (1 + p)
critical multiplier = 1.5 if random() < critChance, otherwise 1
helperDamage = max(1, round(modified * critical multiplier))
```

Player attack processing then:

1. Builds ATK, including the attack-specific relic additions.
2. Applies stored percentage modifiers, Momentum's `+100%` on every tenth
   attack, and Weak's `-25%`.
3. Calls the shared helper.
4. Consumes one queued Karhu effect and multiplies by its value, normally 3.
5. Multiplies by 1.5 if the target is Vulnerable, with rounding.
6. Subtracts enemy block, then clamps enemy HP to zero.
7. Records damage and processes lifesteal, recoil, helmet breakage and death.

Percentage modifiers multiply rather than add: +20% and -25% produce
`1.2 * 0.75`, not a net -5%.

Damage counters include the post-block damage value even when it exceeds the
target's remaining HP. Poison and thorns do not increment the same attack
damage counter.

The source retains a `pilsnerTurns` double-hit path labeled "Sahti", but no drink
in the current catalog has the `spd` buff type that normally enables it.

## Buffs and debuffs

### Positive effects

Effects of the same active buff type merge: values add, remaining duration
becomes the greater of the old and new duration, and names are combined.
Different types coexist.

- Ordinary buffs tick down after the enemy sequence.
- Completing a won encounter also consumes one ordinary buff turn.
- A map rest consumes one ordinary buff turn.
- Buff durations of 999 or more are excluded from ordinary buff ticking.
- Remaining buffs can carry between encounters; not every buff is cleared on entry.
- Regeneration buffs heal at the start of a normal player turn, **after** buff
  ticking, so a buff that has just expired does not heal that turn.
- `regenBonus` is different: it heals after a won ordinary encounter.

See [items](items.md) for exact drink handling and exceptions.

### Negative effects

| Type | Current effect |
| --- | --- |
| `weak` | Player attack damage gets a 0.75 multiplier; enemy ATK is multiplied by 0.75 before the shared damage helper. |
| `vulnerable` | Incoming attack damage is multiplied by 1.5 before block. |
| `frail` | Player Block gain is multiplied by 0.75. Current enemy block execution does not check Frail. |
| `poisoned` | Damage equal to its stored value per tick, absorbed by block first. |
| `alcohol_poison` | Drinking during combat causes `max(1, round(maxHp * 0.01))` raw damage, absorbed by block first. |

Reapplying a debuff uses the greater duration; a positive damage value replaces
the old value only if larger. Debuff values do not add.

Enemy debuffs are decremented **before** poison at the start of their turn. A
one-turn enemy poison can expire before dealing damage. Player poison ticks
before player debuff durations decrement at the end of the enemy sequence.
All player debuffs are cleared by the combat initializer.

### Intent previews are not guaranteed outcomes

The current preview code rolls block/debuff decisions and damage separately
from execution. The actual enemy-turn handler rerolls block and damage and
does **not execute the displayed debuff choice**. Consequently:

- A displayed strike total or damage amount may differ from the actual response.
- Declared debuff traits do not currently inflict their previewed debuffs.
- Some low-HP bonuses appear in previews but are absent from executed strikes.

These are current implementation discrepancies, not intended strategic rules.
See the [enemy trait reference](enemies.md) before relying on a label.

## Encounter rewards

For a won non-shopkeeper encounter:

1. Tick ordinary buff duration once.
2. Add one defeated-enemy record per enemy in the encounter.
3. Heal by `regenBonus`, capped at maximum HP.
4. Grant the sum of all enemy XP.
5. Roll coins for each enemy and add the results.
6. Potentially equip a boss weapon drop.
7. Award one or possibly two consumable drops for the **encounter**, not per enemy.
8. Show the reward overlay; elites then offer a relic selection.
9. Resolve queued level-up choices and continue along the route or to the next area.

Per-enemy coins are:

```text
coinBase = floor(enemy.xp * (1 + random()))
coins = round(coinBase * multiplier)
multiplier = 1.5 for elites, 3 for bosses, otherwise 1
```

XP scaling, drop pools, Ismo's special runtime flags and shopkeeper rewards are
documented separately in [progression](progression.md), [items](items.md) and
[enemies](enemies.md).

## Current edge cases to preserve awareness of

- Attack-triggered recoil/explosion can set player HP to zero without an
  immediate loss check in that attack handler. Simultaneous-death outcomes are
  therefore not a universal "HP 0 always loses first" rule.
- Thorns killing the final attacker can schedule a win before the later
  player-death check in that strike handler.
- Overkill currently reads already-clamped enemy HP and therefore records zero
  excess damage on normal attack kills.
- Some active effects are missing from HUD estimates. Displayed ATK and damage
  are not a full simulation of all attack-specific modifiers.
