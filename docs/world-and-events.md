# World, routes and events

[Documentation index](README.md) | [Enemies](enemies.md) | [Items and shops](items.md) | [Progression](progression.md)

Source: route and event definitions in
[gameData.ts](../seppo-react/src/gameData.ts), navigation/event handlers in
[useGameState.ts](../seppo-react/src/useGameState.ts), and
[LevelMap.tsx](../seppo-react/src/components/LevelMap.tsx).

## Setting and area sequence

Seppo is a recently fired IT consultant carrying the contents of the office
fridge. What begins as a night out becomes a journey through increasingly
surreal places, ending with a confrontation with himself.

| Displayed area | Internal index | Location | Main opponents | Endpoint |
| --- | ---: | --- | --- | --- |
| 1 | 0 | Office | Consultants | The Boss / Ismo |
| 2 | 1 | Park | Cyclist, Drunk Guy | Angry Blue-Collar Man |
| 3 | 2 | Street | Drunk Guy, Black Metal Musician | The Satanist |
| 4 | 3 | Ravintola Kulma | Musician, Bouncer, Consultant | The Bartender |
| 5 | 4 | Church | Priest, Janitor, Gravedigger | The High Priest |
| 6 | 5 | Basement | Cult Member | The Cult Leader |
| 7 | 6 | Meadow | Police Officer | Karhu Special Operator |
| 8 | 7 | Hell | Satan, Skeleton | Seppo |

Defeating the final Hell boss wins the run. Earlier endpoint encounters lead
to level-clear healing, supplies and an upgrade choice.

## Route generation

At new-run start, routes for all areas are generated and stored in
`levelRoutes[areaIndex][routeIndex]`. Each area has **three routes**.

Each route:

1. Has a uniformly selected length of 5, 6 or 7 nodes.
2. Begins with a normal fight at position 0.
3. Has a 50% chance of one rest stop, never at position 0.
4. Has a 30% chance of one elite, excluding position 0 and the rest slot.
5. Has a 25% chance of one treasure, excluding already reserved slots.
6. Has a 35% chance of one shop, excluding already reserved slots.
7. Replaces one or two remaining non-start fight slots with mystery nodes, up to
   the number of available slots.
8. Leaves other positions as normal fights.

Special-slot choices are made in that order. A route is not simply a sequence of
independent per-node probability rolls.

The area endpoint is shared across route branches and is handled **outside**
the route array when `routeNodeIdx >= route.length`. Office uses endpoint type
`boss_first`; other areas use `boss`. Neither name changes its position at the
end of the selected route.

The map renders branches and a shared start marker; mechanically each route's
first array entry is its own normal fight. Choosing a route commits progress
to that route; nodes are completed in order rather than freely visited.

The map scrolls horizontally and brings the active node near the left edge.
Future areas are shown as unknown. It also exposes food consumption and relic
inspection.

## Node behavior

| Node | Resolution |
| --- | --- |
| Fight | Start a normal encounter from the current area's enemy pool. |
| Elite | One scaled elite; enhanced XP/drop eligibility and a relic choice after victory. |
| Rest | Heal `round(maxHp * 0.40)`, or 55% with Power Nap; consume one ordinary buff turn and advance. |
| Treasure | One normal consumable drop, optional Scavenger's Charm healing, then a relic choice. |
| Shop | Generate stock and stored prices, enter shop; leaving completes the node. |
| Mystery | Resolve to a fight, shop, treasure or event using the table below. |
| Area endpoint | Ismo's dedicated encounter or the current area's boss encounter. |

The rest popup's displayed estimate is calculated at 40%; actual healing uses
55% when Power Nap is owned. The separate generic `rest()` helper heals 25%;
it is not the map rest-node implementation.

### Mystery distribution

| `random()` interval | Result | Probability |
| --- | --- | ---: |
| `[0, 0.20)` | Normal fight | 20% |
| `[0.20, 0.45)` | Shop | 25% |
| `[0.45, 0.70)` | Treasure | 25% |
| `[0.70, 1)` | Event | 30% |

Fight/shop/treasure resolution changes the node's stored type. Event resolution
retains the mystery type and advances it on completion.

## Event system

There are **12 events**, chosen uniformly when a mystery rolls an event.
Categories control their choice shape:

- `tradeoff`: choose one of two tradeoffs.
- `upgrade`: choose one of two beneficial outcomes.
- `optional`: choose one of two outcomes or walk away.

There is no area restriction or once-per-run exclusion in the random event
selector, so events can repeat.

### Global event rules

- Coin costs use `min(currentCoins, listedCost)` in the paid event branches.
  Unlike shops, events do not require the full price to be affordable.
- Flat event HP damage floors current HP at 1.
- Max-HP reduction events floor maximum HP at 10 and clamp current HP to it.
- Item draws generally sample the complete drink/food catalog, uniformly per
  draw and with replacement; duplicate rewards are possible.
- Several event relic draws do not filter unlocks. The exceptions are described
  below.
- A one-relic draw that matches an owned relic is rejected, not rerolled.
- Effects are applied immediately. A result overlay lists gains/losses, and
  Continue marks the node complete. A choice with no result entries advances
  directly.

## Tradeoff catalog

| ID | Event | Choice A | Choice B |
| --- | --- | --- | --- |
| `shady_dealer` | Shady Dealer | Gain 3 random drinks; pay up to 50 coins. | Gain 80 coins; lose 15 HP, minimum 1 remaining. |
| `back_alley_gym` | Back Alley Gym | Gain 15 max HP and heal 15; clear all player buffs. | Gain 5 base ATK and 5 base DEF; lose 20 HP, minimum 1. |
| `fork_in_alley` | Fork in the Alley | Draw one relic from the complete relic pool; keep it if unowned. Remove up to 3 owned drinks. | Gain 5 random drinks; remove one randomly selected owned relic, if any. |
| `street_musician` | Street Musician's Deal | Clear debuffs and pay up to 25 coins; add the advertised immunity marker if Finnish Sisu is not owned. | Equip Busker's Guitar (+20 ATK); reduce max HP by 30, minimum 10. |

### Tradeoff details

- Fork in the Alley removes drinks in inventory-key iteration order, not by a
  new random draw. It still removes available drinks when the relic draw is a
  duplicate.
- Losing a relic does not reverse stat changes already applied on acquisition.
  See [relic interactions](relics.md).
- Back Alley Gym clears even duration-999 buffs. "Permanent" does not prevent an
  explicit buff-list clear.
- The musician's immunity marker is a `both` buff with value 0, duration 999 and
  name "Debuff Immunity". No current debuff-application check enforces it.
- The guitar replaces a stronger weapon too; it is not restricted to upgrades.

## Free-upgrade catalog

| ID | Event | Choice A | Choice B |
| --- | --- | --- | --- |
| `abandoned_backpack` | Abandoned Backpack | Gain 2 random foods and 1 random drink. | Gain 40 coins. |
| `old_sauna` | Old Sauna | Heal to full HP. | Gain 3 base DEF for the run. |
| `lucky_find` | Lucky Find | Draw one unlocked common relic; keep if unowned, otherwise gain 20 coins. | Gain a random unlocked weapon stronger than the equipped one; if none, gain 20 coins. |

Lucky Find's weapon reward samples the entire eligible stronger pool, unlike
boss weapon drops, which only sample the first three stronger candidates.
It does not use the shop area's weapon-ATK cap.

## Optional-event catalog

All events below also offer a no-cost walk-away choice.

| ID | Event | Choice A | Choice B |
| --- | --- | --- | --- |
| `cursed_pint` | Cursed Pint | Gain 12 base ATK and apply an Alcohol Poisoning debuff with duration 999. | Heal `round(maxHp * 0.40)`. |
| `suspicious_vending` | Suspicious Vending Machine | 50%: draw an unfiltered rare relic, or 50 coins if that draw is owned. 50%: lose 30 HP, minimum 1. | Pay up to 40 coins; gain 3 random foods. |
| `drunk_philosopher` | Drunk Philosopher | Gain 8 base ATK; lose `round(maxHp * 0.25)` max HP, minimum 10. | Pay up to 30 coins; gain 2 random foods. |
| `lottery_booth` | Lottery Booth | Pay up to 20 coins; 33% chance to gain 150 coins, otherwise no reward. | Gain 60 coins; lose 25 HP, minimum 1. |
| `risky_backpack` | Abandoned Backpack (Risky) | Draw an unfiltered uncommon relic, or gain 30 coins if that draw is owned; lose 20 max HP, minimum 10. | Gain 60 coins. |

The lottery threshold is literally `0.33`, not an exact mathematical one-third.

Cursed Pint's label says its poison applies next fight, but combat initialization
clears player debuffs. There is no separate next-fight poison flag, so that
advertised carry-over is not currently preserved.

## Navigation and checkpoints

Completing fights, leaving shops, resolving events and finishing relic choices
generally return to the map or advance to an endpoint. Route progress is tracked
by both node `done` flags and the active node index.

The game saves on specific map-transition paths, not on every state mutation.
In particular route selection, ordinary non-final rest-node resolution and
consumption outside battle are not independently saved by their handlers.
Reloading therefore resumes the most recent saved map state, not necessarily
the most recently visible state. See [progression and persistence](progression.md).
