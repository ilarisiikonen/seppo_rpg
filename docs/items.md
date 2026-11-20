# Items, equipment and shops

[Documentation index](README.md) | [Relics](relics.md) | [Unlocks](progression.md) | [Events](world-and-events.md)

Source: [gameData.ts](../seppo-react/src/gameData.ts), consumption/drop/shop
handlers in [useGameState.ts](../seppo-react/src/useGameState.ts), and
[Shop.tsx](../seppo-react/src/components/Shop.tsx).

## Inventory and rarity

Drinks and foods are quantity maps keyed by item ID. Consuming an item removes
one copy; in combat it also costs one action. An equipped weapon is a single
object, not a consumable card. Relics form a separate owned list.

Cards have a **tier** (1-3, used for pricing and stars) and a **rarity**
(common, uncommon, rare). These are separate properties. Missing rarity means
common. Uncommon cards use green borders and rare cards use gold borders.

Unlock requirements are listed centrally in [progression](progression.md).
An item absent from the unlock table is available by default, subject to its
drop/shop pool.

## Drink scaling

Let `A` be the zero-based area index and `P` the player's XP level:

```text
scale = 1 + A * 0.3 + (P - 1) * 0.1
scaledValue = round(baseValue * scale)
if Brewer's Blessing triggers: scaledValue *= 2
if Eternal Buzz is owned: scaledValue = round(scaledValue * 0.5)
ordinary duration = 999 with Eternal Buzz, otherwise catalog duration
```

The ordinary runtime path also scales critical-chance values, although the card
label and log show the unscaled base percentage. Other card labels likewise do
not include every relic modifier.

### Effect semantics

| Effect | Meaning |
| --- | --- |
| ATK | Adds to active attack buffs. |
| DEF | Adds to active defence buffs. |
| ATK + DEF | Adds the value to both stats. |
| Block | Adds to the Block action's gain. If Seppo already has positive block when drinking, immediately adds the scaled value to that shield too. |
| Crit | Adds percentage points to critical chance; runtime value is scaled. |
| Regen | Heals at the beginning of normal player turns while the buff survives duration ticking. |
| Thorns | After an enemy strike causes positive HP damage, deals the buff value directly to that enemy, bypassing its block. |
| Cleanse | Immediately removes player debuffs. Uncommon/rare versions add a 1/2-turn `cleanse` marker, but current debuff application does not enforce its advertised immunity. |
| Actions | Immediately adds the **base** value to actions in combat, then paying the drink's action cost makes the net gain base value minus one. Consumed outside combat without granting actions. |
| Triple | Queues a next-attack multiplier using the **base** value, normally 3. Each queued entry is consumed by one attack. |

Actions, triple multipliers and cleanse immunity duration do not use the
scaled/doubled/halved value. Their log can still mention Brewer's Blessing.
Cursed-drink poison uses `round(basePoison * scale)` independently of those relic
modifiers. Cursed debuffs apply only to the current target during combat.

Buffs of the same type normally add their values and keep the longer duration.
Queued triple effects are separate entries rather than additive multipliers.
See [game logic](game-logic.md) for ticking and stacking order.

## Drink catalog

Values and durations below are **base** values. `t` means ordinary buff turns;
instant effects have no ordinary duration.

### Common drinks

| ID | Name | Effect | Base value | Duration | Tier |
| --- | --- | --- | ---: | ---: | ---: |
| `hoppy_ipa` | Hoppy IPA | ATK | 7 | 3t | 2 |
| `pale_ale` | Pale Ale | ATK + DEF | 4 | 3t | 2 |
| `lager` | Lager | Block | 8 | 3t | 1 |
| `wheat_beer` | Wheat Beer | Crit | 22 | 3t | 2 |
| `porter` | Porter | DEF | 6 | 3t | 1 |
| `stout` | Stout | ATK | 5 | 4t | 3 |
| `olvi` | Olvi | Regen | 5 | 3t | 2 |
| `sour` | Sour | Thorns | 4 | 3t | 2 |
| `karjala` | Karjala | Cleanse | 0 | Instant | 2 |
| `pilsner` | Pilsner | Actions | 2 | Instant | 3 |
| `karhu` | Karhu | Triple | 3 | Next attack | 3 |

### Uncommon drinks

| ID | Name | Effect | Base value | Duration | Tier |
| --- | --- | --- | ---: | ---: | ---: |
| `hoppy_ipa_u` | Nitro IPA | ATK | 10 | 4t | 2 |
| `pale_ale_u` | Session Ale | ATK + DEF | 6 | 4t | 2 |
| `lager_u` | Export Lager | Block | 12 | 4t | 2 |
| `wheat_beer_u` | Hefeweizen | Crit | 30 | 4t | 2 |
| `porter_u` | Robust Porter | DEF | 9 | 4t | 2 |
| `stout_u` | Oatmeal Stout | ATK | 7 | 5t | 3 |
| `olvi_u` | Olvi Export | Regen | 7 | 4t | 2 |
| `sour_u` | Gose | Thorns | 6 | 4t | 2 |
| `karjala_u` | Karjala Export | Cleanse | 0 | Instant + 1t marker | 2 |
| `pilsner_u` | Czech Pils | Actions | 2 | Instant | 3 |
| `karhu_u` | Karhu A | Triple | 3 | Next attack | 3 |

### Rare drinks

| ID | Name | Effect | Base value | Duration | Tier |
| --- | --- | --- | ---: | ---: | ---: |
| `hoppy_ipa_r` | Imperial IPA | ATK | 13 | 5t | 3 |
| `pale_ale_r` | Double Ale | ATK + DEF | 8 | 5t | 3 |
| `lager_r` | Doppelbock | Block | 15 | 5t | 3 |
| `wheat_beer_r` | Weizenbock | Crit | 38 | 5t | 3 |
| `porter_r` | Baltic Porter | DEF | 12 | 5t | 3 |
| `stout_r` | Imperial Stout | ATK | 10 | 6t | 3 |
| `olvi_r` | Olvi Tuplapukki | Regen | 10 | 5t | 3 |
| `sour_r` | Lambic | Thorns | 8 | 5t | 3 |
| `karjala_r` | Karjala Reserve | Cleanse | 0 | Instant + 2t marker | 3 |
| `pilsner_r` | Urquell | Actions | 3 | Instant | 3 |
| `karhu_r` | Karhu III | Triple | 3 | Next attack | 3 |

### Cursed drinks

All five are rare, tier 3. They buff Seppo and apply the listed target debuff.

| ID | Name | Player effect | Base value | Duration | Enemy effect |
| --- | --- | --- | ---: | ---: | --- |
| `cursed_ipa` | Ruinous IPA | ATK | 11 | 4t | Weak, 3t |
| `toxic_porter` | Midnight Porter | DEF | 10 | 4t | Poisoned, 4t, base damage 5 |
| `volatile_wheat` | Dunkelweizen | Crit | 30 | 4t | Vulnerable, 3t |
| `blinding_lager` | Kellerbier | Block | 13 | 4t | Frail, 3t |
| `venom_ale` | Old Ale | ATK + DEF | 7 | 4t | Poisoned, 3t, base damage 8 |

Enemy Frail is stored but currently ignored when enemies gain block. Enemy poison
duration decrements before its tick, which matters for the effective tick count.

## Food catalog

```text
healing = round(baseValue * (1 + A * 0.4))
with Lead Belly: heal an additional 5
newHP is capped at maxHP
```

Player XP level does not scale food. All current foods heal HP only; the
`restore: 'both'` data value on the potato dishes does not restore another
resource in the current handler.

| ID | Name | Rarity | Base healing | Tier |
| --- | --- | --- | ---: | ---: |
| `burger` | Burger | Common | 22 | 1 |
| `kebab` | Kebab | Common | 35 | 2 |
| `makkaraperunat` | Makkaraperunat | Common | 18 | 3 |
| `burger_u` | Double Burger | Uncommon | 32 | 2 |
| `kebab_u` | Iskender Kebab | Uncommon | 50 | 2 |
| `makkaraperunat_u` | Mega Perunat | Uncommon | 26 | 3 |
| `burger_r` | Gourmet Burger | Rare | 42 | 3 |
| `kebab_r` | King Kebab | Rare | 65 | 3 |
| `makkaraperunat_r` | Jumbo Perunat | Rare | 35 | 3 |

## Weapon catalog

One weapon is equipped at a time. Its ATK is added directly without area or
player-level scaling. Normal boss drops and generated shop stock only offer
upgrades over the current weapon.

| ID | Name | ATK | Unlock |
| --- | --- | ---: | --- |
| `ashtray` | Pub Ashtray | 2 | Default |
| `glass` | Pint Glass | 4 | Default |
| `bottle` | Beer Bottle | 6 | Default |
| `cue` | Pool Cue | 9 | Default |
| `pipe` | Iron Pipe | 12 | Default |
| `barstool` | Bar Stool | 15 | Default |
| `bat` | Baseball Bat | 18 | Bar Brawler |
| `cone` | Traffic Cone | 21 | Bar Brawler |
| `tap` | Beer Tap Handle | 24 | Bar Brawler |
| `crowbar` | Crowbar | 27 | Hellraiser |
| `axe` | Fire Axe | 31 | Hellraiser |
| `chain` | Bike Chain | 35 | Hellraiser |
| `kegsword` | Keg Saber | 40 | Legend |
| `pitchfork` | Pitchfork | 46 | Legend |
| `chalice` | Holy Chalice | 54 | Legend |
| `guitar` | Busker's Guitar | 20 | Street Musician event only |

The guitar is constructed by the event handler, not included in `WEAPONS`.
That event **replaces** the equipped weapon even if it is stronger.

## Consumable drops

Pool definitions:

- `BEERS_COMMON`: common non-special, non-cursed drinks.
- `BEERS_NORMAL`: all rarities of non-special, non-cursed drinks.
- `BEERS_SPECIAL`: regen, thorns, cleanse, actions and triple drinks.
- `BEERS_CURSED`: drinks with an enemy debuff.
- `FOODS_COMMON`: common foods.

Normal encounters in areas 0-3 award exactly **one common normal drink or common
food**. From Church (index 4), ordinary encounter drops use the normal selection
below. Elites and runtime bosses use the elite/boss selection in every area.

| Roll range | Normal selection | Elite/boss selection |
| --- | --- | --- |
| `[0, 0.05)` | Uncommon normal drink/food | Rare normal drink/food |
| `[0.05, 0.10)` | Uncommon normal drink/food | Cursed drink |
| `[0.10, 0.20)` | Uncommon normal drink/food | Special drink, any eligible rarity |
| `[0.20, 0.30)` | Uncommon normal drink/food | Uncommon normal drink/food |
| `[0.30, 1)` | Common normal drink/food | Common normal drink/food |

Normal selection is therefore 30% uncommon and 70% common. The elite/boss
distribution is 5% rare normal, 5% cursed, 10% special, 10% uncommon normal
and 70% common normal. Special-pool results can themselves be rare.

Unlock filtering occurs before a uniformly random item is selected. Empty pools
fall back to the common normal pool. A final fallback uses that common pool
without filtering if needed.

For encounters not forced to one common item, the second-drop check is:

```text
random() < 0.20 + A * 0.15
```

It is not capped; at Meadow and Hell a second item is guaranteed. Drops are
per encounter, not multiplied by group size.

Level-clear supply drops and the extra treasure item call normal selection,
not elite/boss selection. Events have their own rules, often sampling complete
catalogs without unlock filtering.

### Weapon drops

Only a runtime boss can roll a weapon drop using `enemy.loot`. Candidates are
unlocked weapons stronger than the equipped weapon, in catalog order. The
handler randomly chooses among the **first three** candidates, not the entire
stronger-weapon pool. Ismo's dedicated endpoint spawn is not runtime boss-flagged.

## Shop generation

Each visit generates up to:

- Three distinct drink types.
- Two distinct food types.
- Two unlocked relics the player does not own.
- One unlocked stronger weapon under the area's ATK cap, or no weapon.

Drinks and foods can be purchased repeatedly while affordable. Relics and the
weapon are single-purchase stock and remain visually represented as sold.

Before picking distinct drink/food IDs, stock eligibility is rolled per item:

| Rarity | Eligibility |
| --- | --- |
| Common | Always included in the candidate pool |
| Uncommon | `random() < min(0.20 + A * 0.08, 0.65)` |
| Rare | Only if `A >= 3`, then `random() < min(0.05 + A * 0.05, 0.35)` |

These are **candidate inclusion** probabilities, not final stock rarity weights.
Uncommon stock can occur even in Office; rare stock begins in Ravintola Kulma.

| Area | Maximum weapon ATK |
| --- | ---: |
| Office | 9 |
| Park | 15 |
| Street | 21 |
| Ravintola Kulma | 27 |
| Church | 35 |
| Basement | 40 |
| Meadow | 54 |
| Hell | 54 |

### Prices

| Base price category | Coins |
| --- | ---: |
| Tier 1 drink/food | 15 |
| Tier 2 drink/food | 30 |
| Tier 3 drink/food | 50 |
| Common relic | 40 |
| Uncommon relic | 70 |
| Rare relic | 120 |
| Weapon | 60 |

For drinks and food, first multiply tier price by rarity multiplier:
common 1, uncommon 1.8, rare 1. Round that value, then randomize every offered
item's price:

```text
visitPrice = round(basePrice * (0.7 + random() * 0.6))
```

Relics and weapons use their base price without a card-rarity multiplier.
Prices are rolled once per visit and stored; repeated purchases use the same
price. Rare cards do not currently have a higher rarity multiplier than common.

The shop keeps header controls available, wraps them on narrow screens and
scrolls item rows vertically. Short inventories are bottom-aligned; overflowing
ones start at the top. Space is reserved for map/relic utility buttons.

### Shopkeeper challenge

The UI advertises a refund of spent coins for winning. Current execution stores
the player's balance **at challenge start**, then restores that balance on victory.
It does not remember the balance before purchases, so purchases made earlier in
the visit are **not actually refunded**. The usual victory refund is zero.

On loss, all remaining coins are removed, HP becomes
`max(1, round(maxHp * 0.15))`, and leaving advances the shop node. Victory returns
to the same shop. Neither result grants normal elite loot or XP.

## Other implementation distinctions

- Drinking always increments run beer count and the per-fight beer counter,
  including consumption outside battle. Combat initialization resets the latter.
- Liquid Armor directly raises base DEF; its advertised per-fight expiry is not
  implemented.
- Existing immunity labels are not enforced by the current debuff function.
- Pilsner is extra actions, **not** the legacy Sahti double-hit mechanic.
- Restock and random event behavior should be read from handlers, not inferred
  from item tier or card flavor text.
