import type { AnimSet, Beer, Food, Weapon, EnemyTemplate, BossPhase, Upgrade, Player, LevelUpChoice, Relic } from './types'

/* ── Animation Definitions ─────────────────────── */

function makeAnim(path: string, frames: number, fps: number, loop: boolean) {
  return { path, frames, fps, loop, images: [] as HTMLImageElement[] }
}

export const SEPPO_ANIMS_SOUTH: AnimSet = {
  idle:   makeAnim('assets/characters/seppo/animations/breathing-idle/south/', 4, 4, true),
  attack: makeAnim('assets/characters/seppo/animations/lead-jab/south/', 3, 10, false),
  kick:   makeAnim('assets/characters/seppo/animations/high-kick/south/', 7, 10, false),
  drink:  makeAnim('assets/characters/seppo/animations/drinking/south/', 6, 6, false),
  hit:    makeAnim('assets/characters/seppo/animations/taking-punch/south/', 6, 8, false),
  death:  makeAnim('assets/characters/seppo/animations/falling-back-death/south/', 7, 6, false),
}

export const SEPPO_ANIMS_EAST: AnimSet = {
  idle:   makeAnim('assets/characters/seppo/animations/breathing-idle/east/', 4, 4, true),
  attack: makeAnim('assets/characters/seppo/animations/lead-jab/east/', 3, 10, false),
  kick:   makeAnim('assets/characters/seppo/animations/high-kick/east/', 7, 10, false),
  drink:  makeAnim('assets/characters/seppo/animations/drinking/east/', 6, 6, false),
  hit:    makeAnim('assets/characters/seppo/animations/taking-punch/east/', 6, 8, false),
  death:  makeAnim('assets/characters/seppo/animations/falling-back-death/east/', 7, 6, false),
}

export const ISMO_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/ismo/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/ismo/animations/surprise-uppercut/west/', 7, 10, false),
  drink:  makeAnim('assets/characters/ismo/animations/drinking/south/', 6, 6, false),
  hit:    makeAnim('assets/characters/ismo/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/ismo/animations/falling-back-death/south/', 7, 6, false),
}

export const ANGRY_CYCLIST_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/angry_cyclist/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/angry_cyclist/animations/cross-punch/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/angry_cyclist/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/angry_cyclist/animations/falling-back-death/west/', 7, 6, false),
}

export const CONSULTANT_1_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/consultant_1/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/consultant_1/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/consultant_1/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/consultant_1/animations/falling-back-death/west/', 7, 6, false),
}

export const CONSULTANT_2_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/consultant_2/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/consultant_2/animations/high-kick/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/consultant_2/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/consultant_2/animations/falling-back-death/west/', 7, 6, false),
}

export const DRUNK_GUY_1_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/drunk_guy_1/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/drunk_guy_1/animations/surprise-uppercut/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/drunk_guy_1/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/drunk_guy_1/animations/falling-back-death/west/', 7, 6, false),
}

export const DRUNK_GUY_2_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/drunk_guy_2/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/drunk_guy_2/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/drunk_guy_2/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/drunk_guy_2/animations/falling-back-death/west/', 7, 6, false),
}

export const BLACK_METAL_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/black_metal_musician/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/black_metal_musician/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/black_metal_musician/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/black_metal_musician/animations/falling-back-death/west/', 7, 6, false),
}

export const BOUNCER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/bouncer/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/bouncer/animations/cross-punch/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/bouncer/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/bouncer/animations/falling-back-death/west/', 7, 6, false),
}

export const SHOPKEEPER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/shopkeeper/animations/breathing-idle/west/', 4, 4, true),
  attack: makeAnim('assets/characters/shopkeeper/animations/surprise-uppercut/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/shopkeeper/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/shopkeeper/animations/falling-back-death/west/', 7, 6, false),
}

export const BARTENDER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/bartender/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/bartender/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/bartender/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/bartender/animations/falling-back-death/west/', 7, 6, false),
}

export const PRIEST_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/Priest/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/Priest/animations/roundhouse-kick/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/Priest/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/Priest/animations/falling-back-death/west/', 7, 6, false),
}

export const JANITOR_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/janitor/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/janitor/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/janitor/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/janitor/animations/falling-back-death/west/', 7, 6, false),
}

export const GRAVEDIGGER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/Gravedigger/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/Gravedigger/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/Gravedigger/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/Gravedigger/animations/falling-back-death/west/', 7, 6, false),
}

export const CULT_MEMBER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/cult_member/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/cult_member/animations/roundhouse-kick/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/cult_member/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/cult_member/animations/falling-back-death/west/', 7, 6, false),
}

export const CULT_LEADER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/cult_leader/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/cult_leader/animations/hurricane-kick/west/', 4, 10, false),
  hit:    makeAnim('assets/characters/cult_leader/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/cult_leader/animations/falling-back-death/west/', 7, 6, false),
}

export const POLICE_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/police_man/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/police_man/animations/cross-punch/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/police_man/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/police_man/animations/falling-back-death/west/', 7, 6, false),
}

export const KARHU_OPERATOR_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/karhu_special_operator/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/karhu_special_operator/animations/roundhouse-kick/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/karhu_special_operator/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/karhu_special_operator/animations/falling-back-death/west/', 7, 6, false),
}

export const SATAN_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/satan/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/satan/animations/flying-kick/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/satan/animations/fight-stance-idle-8-frames/west/', 8, 8, false),
  death:  makeAnim('assets/characters/satan/animations/falling-back-death/west/', 7, 6, false),
}

export const SKELETON_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/Skeleton_on_fire/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/Skeleton_on_fire/animations/flying-kick/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/Skeleton_on_fire/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/Skeleton_on_fire/animations/falling-back-death/west/', 7, 6, false),
}

export const SEPPO_ENEMY_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/seppo/animations/breathing-idle/east/', 4, 4, true),
  attack: makeAnim('assets/characters/seppo/animations/high-kick/east/', 7, 10, false),
  hit:    makeAnim('assets/characters/seppo/animations/taking-punch/east/', 6, 8, false),
  death:  makeAnim('assets/characters/seppo/animations/falling-back-death/east/', 7, 6, false),
}

export const ALL_ANIM_SETS: AnimSet[] = [
  SEPPO_ANIMS_SOUTH, SEPPO_ANIMS_EAST, ISMO_ANIMS,
  CONSULTANT_1_ANIMS, CONSULTANT_2_ANIMS,
  ANGRY_CYCLIST_ANIMS, DRUNK_GUY_1_ANIMS, DRUNK_GUY_2_ANIMS,
  BLACK_METAL_ANIMS, BOUNCER_ANIMS, SHOPKEEPER_ANIMS, BARTENDER_ANIMS,
  PRIEST_ANIMS, JANITOR_ANIMS, GRAVEDIGGER_ANIMS,
  CULT_MEMBER_ANIMS, CULT_LEADER_ANIMS,
  POLICE_ANIMS, KARHU_OPERATOR_ANIMS,
  SATAN_ANIMS, SKELETON_ANIMS, SEPPO_ENEMY_ANIMS,
]

export function preloadAllAnims() {
  for (const set of ALL_ANIM_SETS) {
    for (const key in set) {
      const a = set[key]
      a.images = []
      for (let i = 0; i < a.frames; i++) {
        const img = new Image()
        img.src = a.path + `frame_${String(i).padStart(3, '0')}.png`
        a.images.push(img)
      }
    }
  }
}

/* ── Game Data ─────────────────────────────────── */

export const BEERS: Beer[] = [
  { id: 'hoppy_ipa',  name: 'Hoppy IPA',  img: 'assets/cards/drinks/hoppy_ipa.png',  color: 'tertiary',  buff: 'atk',  val: 7,  duration: 3, tier: 2, desc: '+ATK — dangerously hoppy' },
  { id: 'pale_ale',   name: 'Pale Ale',   img: 'assets/cards/drinks/pale_ale.png',   color: 'secondary', buff: 'both', val: 4,  duration: 3, tier: 2, desc: '+ATK & DEF — balanced & bright' },
  { id: 'lager',      name: 'Lager',      img: 'assets/cards/drinks/lager.png',      color: 'primary',   buff: 'block', val: 8, duration: 3, tier: 1, desc: '+BLOCK — crisp & defensive' },
  { id: 'wheat_beer', name: 'Wheat Beer', img: 'assets/cards/drinks/wheat_beer.png', color: 'primary',   buff: 'crit', val: 22, duration: 3, tier: 2, desc: '+CRIT — cloudy luck' },
  { id: 'porter',     name: 'Porter',     img: 'assets/cards/drinks/porter.png',     color: 'secondary', buff: 'def',  val: 6,  duration: 3, tier: 1, desc: '+DEF — smooth & heavy' },
  { id: 'stout',      name: 'Stout',      img: 'assets/cards/drinks/stout.png',      color: 'tertiary',  buff: 'atk',  val: 5,  duration: 4, tier: 3, desc: '+ATK — dark power' },
]

export const FOODS: Food[] = [
  { id: 'burger',         name: 'Burger',         img: 'assets/cards/food/burger.png',         color: 'primary', restore: 'hp',   val: 22, tier: 1, desc: 'Restore HP — greasy but effective' },
  { id: 'kebab',          name: 'Kebab',          img: 'assets/cards/food/kebab.png',          color: 'primary', restore: 'hp',   val: 35, tier: 2, desc: 'Restore HP — the 2am lifesaver' },
  { id: 'makkaraperunat', name: 'Makkaraperunat', img: 'assets/cards/food/makkaraperunat.png', color: 'primary', restore: 'both', val: 18, tier: 3, desc: 'Restore HP — Finnish street fuel' },
]

export const TIER_LABELS = ['?', '★', '★★', '★★★']
export const TIER_COLORS = ['on-surface-variant', 'primary', 'secondary', 'tertiary']

export const WEAPONS: Weapon[] = [
  { id: 'glass',    name: 'Pint Glass',      atk: 3,  lore: 'Still has a finger of beer in it.' },
  { id: 'bottle',   name: 'Beer Bottle',     atk: 5,  lore: 'Heavier when full. Messier when not.' },
  { id: 'pipe',     name: 'Iron Pipe',       atk: 8,  lore: 'Found in the pub cellar.' },
  { id: 'bat',      name: 'Baseball Bat',    atk: 12, lore: 'Left behind after a match.' },
  { id: 'tap',      name: 'Beer Tap Handle', atk: 17, lore: 'Ripped from the bar itself.' },
  { id: 'axe',      name: 'Fire Axe',        atk: 23, lore: 'From the fire cabinet. Technically borrowed.' },
  { id: 'kegsword', name: 'Keg Saber',       atk: 30, lore: 'Forged from pressurised steel. Legendary.' },
]

export const BLACK_METAL_NAMES = [
  'Abbath', 'Varg', 'Blargh', 'Lord Satanacchia', 'Euronymous',
  'Inferno Skull', 'Hellstorm', 'Voidwalker',
]

export const CONSULTANT_TITLES = [
  'Junior Data Analyst',
  'Data Engineer',
  'HR Manager',
  'Scrum Master',
  'Project Manager',
]

export const LEVEL_ENEMIES: EnemyTemplate[][] = [
  /* Level 1 — Office */
  [
    { name: 'Consultant', portrait: 'assets/characters/consultant_1/rotations/south.png', anims: CONSULTANT_1_ANIMS, lore: 'Slides first. Questions later.', hp: 62, atk: 13, def: 4, xp: 20, loot: 0.24, randomNames: CONSULTANT_TITLES },
    { name: 'Consultant', portrait: 'assets/characters/consultant_2/rotations/south.png', anims: CONSULTANT_2_ANIMS, lore: 'Booked this conflict as a recurring ceremony.', hp: 68, atk: 14, def: 5, xp: 24, loot: 0.26, randomNames: CONSULTANT_TITLES },
  ],

  // Boss is always the first fight — spawned specially in useGameState
  /* Level 2 — Park */
  [
    { name: 'Cyclist', portrait: 'assets/characters/angry_cyclist/rotations/south.png', anims: ANGRY_CYCLIST_ANIMS, lore: 'Rings the bell like it is a battle cry.', hp: 96, atk: 21, def: 8, xp: 36, loot: 0.33 },
    { name: 'Drunk Guy', portrait: 'assets/characters/drunk_guy_1/rotations/south.png', anims: DRUNK_GUY_1_ANIMS, lore: 'Friendly until someone looks at his can.', hp: 109, atk: 23, def: 8, xp: 41, loot: 0.35 },
  ],
  /* Level 3 — Street */
  [
    { name: 'Drunk Guy', portrait: 'assets/characters/drunk_guy_2/rotations/south.png', anims: DRUNK_GUY_2_ANIMS, lore: 'Promises this is definitely his last one.', hp: 140, atk: 29, def: 11, xp: 54, loot: 0.39 },
    { name: '_BM_', portrait: 'assets/characters/black_metal_musician/rotations/south.png', anims: BLACK_METAL_ANIMS, lore: 'Screams in a key that doesn\'t exist.', hp: 153, atk: 31, def: 12, xp: 61, loot: 0.4, randomName: true },
  ],
  /* Level 4 — Bar */
  [
    { name: '_BM_', portrait: 'assets/characters/black_metal_musician/rotations/south.png', anims: BLACK_METAL_ANIMS, lore: 'His warm-up vocal drill sounds like a chainsaw.', hp: 172, atk: 34, def: 13, xp: 70, loot: 0.42, randomName: true },
    { name: 'Bouncer', portrait: 'assets/characters/bouncer/rotations/south.png', anims: BOUNCER_ANIMS, lore: 'Built like a fridge and equally conversational.', hp: 188, atk: 36, def: 15, xp: 78, loot: 0.45 },
    { name: 'Consultant', portrait: 'assets/characters/consultant_2/rotations/south.png', anims: CONSULTANT_2_ANIMS, lore: 'Trying to retrospective this whole evening.', hp: 161, atk: 33, def: 14, xp: 68, loot: 0.41, randomNames: CONSULTANT_TITLES },
  ],
  /* Level 5 — Church */
  [
    { name: 'Priest', portrait: 'assets/characters/Priest/rotations/south.png', anims: PRIEST_ANIMS, lore: 'Forgiveness is off the table. So is mercy.', hp: 210, atk: 40, def: 16, xp: 88, loot: 0.46 },
    { name: 'Janitor', portrait: 'assets/characters/janitor/rotations/south.png', anims: JANITOR_ANIMS, lore: 'Cleans up messes. Tonight, you\'re the mess.', hp: 195, atk: 38, def: 17, xp: 82, loot: 0.44 },
    { name: 'Gravedigger', portrait: 'assets/characters/Gravedigger/rotations/south.png', anims: GRAVEDIGGER_ANIMS, lore: 'Already measured you for a plot.', hp: 225, atk: 42, def: 15, xp: 92, loot: 0.48 },
  ],
  /* Level 6 — Basement */
  [
    { name: 'Cult Member', portrait: 'assets/characters/cult_member/rotations/south.png', anims: CULT_MEMBER_ANIMS, lore: 'Chants something unholy. Kicks even harder.', hp: 250, atk: 46, def: 18, xp: 100, loot: 0.48 },
  ],
  /* Level 7 — Meadow */
  [
    { name: 'Police Officer', portrait: 'assets/characters/police_man/rotations/south.png', anims: POLICE_ANIMS, lore: 'Stop resisting. He hasn\'t even started yet.', hp: 280, atk: 50, def: 20, xp: 110, loot: 0.5 },
  ],
  /* Level 8 — Hell */
  [
    { name: 'Satan', portrait: 'assets/characters/satan/rotations/south.png', anims: SATAN_ANIMS, lore: 'The Prince of Darkness moonlights as a bouncer down here.', hp: 310, atk: 56, def: 22, xp: 125, loot: 0.52 },
    { name: 'Skeleton', portrait: 'assets/characters/Skeleton_on_fire/rotations/south.png', anims: SKELETON_ANIMS, lore: 'On fire and furious. Calcium-enriched rage.', hp: 270, atk: 52, def: 19, xp: 115, loot: 0.5 },
  ],
]

export const LEVEL_NAMES = ['Office', 'Park', 'Street', 'Ravintola Kulma', 'Church', 'Basement', 'Meadow', 'Hell']
export const LEVEL_BGS = ['assets/levels/office.png', 'assets/levels/park.png', 'assets/levels/street.png', 'assets/levels/bar.png', 'assets/levels/cucrh.png', 'assets/levels/basement.png', 'assets/levels/meadow.png', 'assets/levels/hell.png']
export const ROUNDS_PER_LEVEL = 5
export const PLAYER_ACTIONS = 3
export const ENEMY_ACTIONS = 2
export const NUM_ROUTES_PER_LEVEL = 3

/** Which levels end with a shared boss fight (index → boss type). */
export function levelBossType(lvIdx: number): 'boss_first' | 'boss' | null {
  if (lvIdx === 0) return 'boss_first'
  if (lvIdx >= 1 && lvIdx <= LEVEL_ENEMIES.length - 1) return 'boss'
  return null
}

/**
 * Generate random routes for all levels as a tree.
 * Each level has a shared start node (fight) and optionally a shared boss end node.
 * Routes contain only fights / rests — bosses are handled as shared endpoints.
 */
export function generateAllRoutes(): import('./types').LevelRoute[][] {
  const totalLevels = LEVEL_ENEMIES.length
  const allRoutes: import('./types').LevelRoute[][] = []

  for (let lvIdx = 0; lvIdx < totalLevels; lvIdx++) {
    const routes: import('./types').LevelRoute[] = []

    for (let r = 0; r < NUM_ROUTES_PER_LEVEL; r++) {
      const nodes: import('./types').MapNode[] = []
      // 5–7 nodes per route
      const routeLen = 5 + Math.floor(Math.random() * 3)

      // 50% chance of a rest stop, never at position 0
      const hasRest = Math.random() < 0.5
      const restIdx = hasRest ? 1 + Math.floor(Math.random() * (routeLen - 1)) : -1

      // ~30% chance of one elite fight, never at position 0 or rest slot
      const hasElite = Math.random() < 0.3
      let eliteIdx = -1
      if (hasElite) {
        const candidates = Array.from({ length: routeLen }, (_, i) => i).filter(i => i !== 0 && i !== restIdx)
        if (candidates.length) eliteIdx = candidates[Math.floor(Math.random() * candidates.length)]
      }

      // ~25% chance of a treasure node, never at position 0, rest, or elite slot
      const hasTreasure = Math.random() < 0.25
      let treasureIdx = -1
      if (hasTreasure) {
        const candidates = Array.from({ length: routeLen }, (_, i) => i).filter(i => i !== 0 && i !== restIdx && i !== eliteIdx)
        if (candidates.length) treasureIdx = candidates[Math.floor(Math.random() * candidates.length)]
      }

      for (let i = 0; i < routeLen; i++) {
        const type = i === restIdx ? 'rest' : i === eliteIdx ? 'elite' : i === treasureIdx ? 'treasure' : 'fight'
        nodes.push({ type, done: false })
      }

      routes.push(nodes)
    }
    allRoutes.push(routes)
  }
  return allRoutes
}

export const ISMO_FIRST_FIGHT = {
  name: 'The Boss',
  portrait: 'assets/characters/ismo/rotations/south.png',
  anims: ISMO_ANIMS,
  lore: 'Called Seppo\'s feedback "insubordination" and hit print on the termination letter.',
  hp: 156, atk: 22, def: 9, xp: 60, loot: 0.35,
}

export const PARK_BOSS_DATA = {
  name: 'Angry Blue-Collar Man',
  portrait: 'assets/characters/shopkeeper/rotations/south.png',
  anims: SHOPKEEPER_ANIMS,
  lore: 'Took one too many complaints. Now he\'s the one filing grievances — with his fists.',
  hp: 220, atk: 28, def: 12, xp: 120, loot: 0.4,
}

export const STREET_BOSS_DATA = {
  name: 'The Satanist',
  portrait: 'assets/characters/black_metal_musician/rotations/south.png',
  anims: BLACK_METAL_ANIMS,
  lore: 'He sold his soul for a killer riff — and killer fists.',
  hp: 320, atk: 35, def: 14, xp: 200, loot: 0.45,
}
export const BAR_BOSS_DATA = {
  name: 'The Bartender',
  portrait: 'assets/characters/bartender/rotations/south.png',
  anims: BARTENDER_ANIMS,
  lore: 'Last call was an hour ago. Now he\'s calling the shots.',
  hp: 450, atk: 44, def: 18, xp: 350, loot: 0.5,
}

export const CHURCH_BOSS_DATA = {
  name: 'The High Priest',
  portrait: 'assets/characters/Priest/rotations/south.png',
  anims: PRIEST_ANIMS,
  lore: 'His sermons hit different. Mostly your face.',
  hp: 520, atk: 48, def: 20, xp: 420, loot: 0.5,
}

export const BASEMENT_BOSS_DATA = {
  name: 'The Cult Leader',
  portrait: 'assets/characters/cult_leader/rotations/south.png',
  anims: CULT_LEADER_ANIMS,
  lore: 'The ritual is complete. You are the final sacrifice.',
  hp: 600, atk: 54, def: 22, xp: 480, loot: 0.55,
}

export const MEADOW_BOSS_DATA = {
  name: 'Karhu Special Operator',
  portrait: 'assets/characters/karhu_special_operator/rotations/south.png',
  anims: KARHU_OPERATOR_ANIMS,
  lore: 'Trained in the woods. Fights like a bear. Smells like one too.',
  hp: 700, atk: 60, def: 24, xp: 550, loot: 0.55,
}

export const HELL_BOSS_DATA = {
  name: 'Seppo',
  portrait: 'assets/characters/seppo/rotations/south.png',
  anims: SEPPO_ENEMY_ANIMS,
  lore: 'You stare into the abyss and see… yourself. The final fight is with who you\'ve become.',
  hp: 800, atk: 65, def: 26, xp: 666, loot: 0.6,
}

export const BOSS_DATA = {
  name: 'THE BOSS',
  lore: 'Seppo\'s boss. Fired him for calling the new processes stupid. Now he\'s back for round two.',
  hp: 585,
  atk: 50,
  def: 22,
  xp: 500,
  phases: [
    { threshold: 0.6, msg: 'Boss snaps: "You\'re still underperforming, Seppo!"', atkBonus: 0 } as BossPhase,
    { threshold: 0.3, msg: 'Boss screams: "THIS IS MY TEAM AND YOU ARE OFF THE PROJECT!"', atkBonus: 12 } as BossPhase,
  ],
}

export const UPGRADES: Upgrade[] = [
  { id: 'hp',    icon: 'favorite',              color: 'error',     label: '+15 Max HP',    desc: 'Toughen up. More health means more drinks.',  apply: (p) => { p.maxHp += 15; p.hp = Math.min(p.hp + 15, p.maxHp) } },
  { id: 'atk',   icon: 'swords',                color: 'tertiary',  label: '+5 ATK',        desc: 'Hit harder. Enough said.',                    apply: (p) => { p.baseAtk += 5 } },
  { id: 'def',   icon: 'shield',                color: 'secondary', label: '+4 DEF',        desc: 'Thicker skin from years of bar brawls.',      apply: (p) => { p.baseDef += 4 } },
  { id: 'crit',  icon: 'bolt',                  color: 'primary',   label: '+8% Crit',      desc: 'Sharper instincts. More devastating blows.',  apply: (p) => { p.critBonus = (p.critBonus || 0) + 8 } },
  { id: 'regen', icon: 'self_improvement',       color: 'primary',   label: '+3 HP Regen',   desc: 'Recover 3 HP after every fight.',             apply: (p) => { p.regenBonus = (p.regenBonus || 0) + 3 } },
  { id: 'fury',  icon: 'local_fire_department',  color: 'tertiary',  label: '+3 ATK & DEF',  desc: 'Balanced power. A veteran\'s choice.',        apply: (p) => { p.baseAtk += 3; p.baseDef += 3 } },
]

/* ── Relics ─────────────────────────────────────── */

export const RELICS: Relic[] = [
  // Common
  { id: 'auto_block',      name: 'Stone Skin Amulet',   rarity: 'common',   icon: 'shield_with_heart', desc: 'End turn without blocking → gain 6 block.' },
  { id: 'beer_start',      name: 'Lucky Flask',         rarity: 'common',   icon: 'liquor',            desc: 'Start each combat with +1 random Beer effect.' },
  { id: 'beer_def',        name: 'Liquid Armor',        rarity: 'common',   icon: 'local_drink',       desc: '+1 DEF each time you drink a Beer (per fight).' },
  { id: 'bonus_hp',        name: 'Tough Hide',          rarity: 'common',   icon: 'favorite',          desc: '+10 Max HP.' },
  { id: 'bonus_atk',       name: 'Iron Knuckles',       rarity: 'common',   icon: 'swords',            desc: '+5 ATK.' },
  { id: 'bonus_def',       name: 'Padded Jacket',       rarity: 'common',   icon: 'shield',            desc: '+5 DEF.' },
  { id: 'treasure_heal',   name: 'Scavenger\'s Charm',  rarity: 'common',   icon: 'health_and_safety', desc: 'Gain 10 HP when opening a treasure.' },
  // Uncommon
  { id: 'triple_beer',     name: 'Brewer\'s Blessing',  rarity: 'uncommon', icon: 'sports_bar',        desc: 'Every 3rd Beer gives double effect.' },
  { id: 'beer_dmg',        name: 'Drunken Fist',        rarity: 'uncommon', icon: 'local_fire_department', desc: '+3 ATK per Beer consumed this fight.' },
  { id: 'beer_block',      name: 'Hop Shield',          rarity: 'uncommon', icon: 'verified_user',     desc: 'Gain block equal to 50% of Beer stat bonuses.' },
  { id: 'desperation',     name: 'Cornered Rat',        rarity: 'uncommon', icon: 'crisis_alert',      desc: 'HP < 30% → 4 actions per turn.' },
  { id: 'bonus_hp_unc',    name: 'Bear Gut',            rarity: 'uncommon', icon: 'favorite',          desc: '+15 Max HP.' },
  { id: 'bonus_atk_unc',   name: 'Brass Knuckles',      rarity: 'uncommon', icon: 'swords',            desc: '+10 ATK.' },
  { id: 'bonus_def_unc',   name: 'Riot Vest',           rarity: 'uncommon', icon: 'shield',            desc: '+10 DEF.' },
  { id: 'tenth_strike',    name: 'Momentum',            rarity: 'uncommon', icon: 'speed',             desc: 'Every 10th attack deals double damage.' },
  // Rare
  { id: 'perma_beer',      name: 'Eternal Buzz',        rarity: 'rare',     icon: 'all_inclusive',     desc: 'Beer effects are 50% strength but permanent for the run.' },
  { id: 'lifesteal',       name: 'Vampiric Grip',       rarity: 'rare',     icon: 'bloodtype',         desc: 'Heal 10% of damage dealt.' },
]

export function hasRelic(p: Player, id: string): boolean {
  return p.relics.some(r => r.id === id)
}

export function pickRelics(count: number, rarity?: Relic['rarity']): Relic[] {
  const pool = rarity ? RELICS.filter(r => r.rarity === rarity) : [...RELICS]
  const picks: Relic[] = []
  const remaining = [...pool]
  while (picks.length < count && remaining.length) {
    const idx = Math.floor(Math.random() * remaining.length)
    picks.push(remaining.splice(idx, 1)[0])
  }
  return picks
}

export function pickRelicsByRarity(count: number): Relic[] {
  // For treasure: pick from mixed pool, weighted toward rarity
  const pool = [...RELICS]
  const picks: Relic[] = []
  const remaining = [...pool]
  while (picks.length < count && remaining.length) {
    const idx = Math.floor(Math.random() * remaining.length)
    picks.push(remaining.splice(idx, 1)[0])
  }
  return picks
}

/* ── Helper Functions ──────────────────────────── */

export function getPlayerAtk(p: Player): number {
  let a = p.baseAtk + (p.weapon ? p.weapon.atk : 0) + p.rageBonus
  for (const k of ['buff', 'buff2'] as const) {
    const b = p[k]
    if (b && (b.type === 'atk' || b.type === 'both')) a += b.val
  }
  return a
}

export function getPlayerDef(p: Player): number {
  let d = p.baseDef
  for (const k of ['buff', 'buff2'] as const) {
    const b = p[k]
    if (b && (b.type === 'def' || b.type === 'both')) d += b.val
  }
  return d
}

export function getPlayerBlock(p: Player): number {
  let b = p.baseDef + (p.blockBonus || 0)
  for (const k of ['buff', 'buff2'] as const) {
    const buf = p[k]
    if (buf && buf.type === 'block') b += buf.val
  }
  return b
}

export function getCritChance(p: Player): number {
  let c = 0.1 + (p.critBonus || 0) / 100
  for (const k of ['buff', 'buff2'] as const) {
    const b = p[k]
    if (b && b.type === 'crit') c += b.val / 100
  }
  return c
}

export function calcDmg(atk: number, def: number, critChance: number, pctModifiers: number[] = []): { dmg: number; crit: boolean } {
  const base = Math.max(1, atk - def)
  // ±15% natural variance
  const variance = 0.85 + Math.random() * 0.3
  let modified = base * variance
  // Apply percent modifiers (buffs/debuffs)
  for (const pct of pctModifiers) modified *= (1 + pct)
  const crit = Math.random() < critChance
  return { dmg: Math.max(1, Math.round(modified * (crit ? 1.5 : 1))), crit }
}

export function buffSummary(p: Player): string {
  const parts: string[] = []
  if (p.buff && p.buff.turns > 0) parts.push(`${p.buff.name} (${p.buff.turns}t)`)
  if (p.buff2 && p.buff2.turns > 0) parts.push(`${p.buff2.name} (${p.buff2.turns}t)`)
  if (p.rageBonus > 0) parts.push(`Beer Rage +${p.rageBonus}`)
  if (p.pilsnerTurns > 0) parts.push(`Sahti ×2 (${p.pilsnerTurns}t)`)
  const block = getPlayerBlock(p)
  if (block > 0) parts.push(`Block +${block}`)
  return parts.length ? parts.join(' · ') : 'Sober — no buff'
}

export function getStatLabel(c: Beer, currentLevel: number, playerLevel: number): string {
  const lvScale = 1 + (currentLevel * 0.3) + (playerLevel - 1) * 0.1
  const v = Math.round(c.val * lvScale)
  switch (c.buff) {
    case 'atk':  return `+${v} ATK ${c.duration}t`
    case 'def':  return `+${v} DEF ${c.duration}t`
    case 'crit': return `+${c.val}% CRIT ${c.duration}t`
    case 'both': return `+${v} ATK/DEF ${c.duration}t`
    case 'spd':   return `×2 HIT ${c.duration}t`
    case 'block': return `+${v} BLOCK ${c.duration}t`
    default:     return c.desc.split('—')[0].trim()
  }
}

export function getFoodLabel(f: Food, currentLevel: number): string {
  const lvScale = 1 + currentLevel * 0.4
  const v = Math.round(f.val * lvScale)
  if (f.restore === 'hp' || f.restore === 'both') return `+${v} HP`
  return f.desc.split('—')[0].trim()
}

export function scaledLevelUpChoices(playerLevel: number): LevelUpChoice[] {
  const s = Math.max(1, playerLevel - 1)
  return [
    { id: 'lhp',  icon: 'favorite',              color: 'error',      label: `+${8 + s * 3} Max HP`,       desc: 'Extra padding for the road ahead.', apply: (p: Player) => { const v = 8 + s * 3; p.maxHp += v; p.hp = Math.min(p.hp + v, p.maxHp) } },
    { id: 'latk', icon: 'swords',                color: 'tertiary',   label: `+${2 + Math.floor(s * 0.7)} ATK`, desc: 'Heavier fists.', apply: (p: Player) => { p.baseAtk += 2 + Math.floor(s * 0.7) } },
    { id: 'ldef', icon: 'shield',                color: 'secondary',  label: `+${2 + Math.floor(s * 0.7)} DEF`, desc: 'Thicker hide.', apply: (p: Player) => { p.baseDef += 2 + Math.floor(s * 0.7) } },
    { id: 'lcrit',icon: 'bolt',                  color: 'amber-400',  label: `+${5 + s}% Crit`,            desc: 'Sharper aim.', apply: (p: Player) => { p.critBonus = (p.critBonus || 0) + 5 + s } },
    { id: 'lreg', icon: 'self_improvement',       color: 'primary',    label: `+${2 + s} HP Regen`,     desc: 'Heal after every fight.', apply: (p: Player) => { p.regenBonus = (p.regenBonus || 0) + 2 + s } },
    { id: 'lmix', icon: 'local_fire_department',  color: 'tertiary',   label: `+${1 + Math.floor(s * 0.4)} ATK & DEF`, desc: 'A little of everything.', apply: (p: Player) => { const v = 1 + Math.floor(s * 0.4); p.baseAtk += v; p.baseDef += v } },
  ]
}
