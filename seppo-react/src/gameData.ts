import type { AnimSet, Beer, Food, Weapon, EnemyTemplate, BossPhase, Upgrade, Player, LevelUpChoice } from './types'

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

export const ALL_ANIM_SETS: AnimSet[] = [
  SEPPO_ANIMS_SOUTH, SEPPO_ANIMS_EAST, ISMO_ANIMS,
  CONSULTANT_1_ANIMS, CONSULTANT_2_ANIMS,
  ANGRY_CYCLIST_ANIMS, DRUNK_GUY_1_ANIMS, DRUNK_GUY_2_ANIMS,
  BLACK_METAL_ANIMS, BOUNCER_ANIMS,
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
  { id: 'lager',      name: 'Lager',      img: 'assets/cards/drinks/lager.png',      color: 'primary',   buff: 'spd',  val: 1,  duration: 2, tier: 1, desc: '×2 hits — crisp & fast' },
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
  { id: 'glass',    name: 'Pint Glass',      atk: 4,  lore: 'Still has a finger of beer in it.' },
  { id: 'bottle',   name: 'Beer Bottle',     atk: 7,  lore: 'Heavier when full. Messier when not.' },
  { id: 'pipe',     name: 'Iron Pipe',       atk: 13, lore: 'Found in the pub cellar.' },
  { id: 'bat',      name: 'Baseball Bat',    atk: 18, lore: 'Left behind after a match.' },
  { id: 'tap',      name: 'Beer Tap Handle', atk: 25, lore: 'Ripped from the bar itself.' },
  { id: 'axe',      name: 'Fire Axe',        atk: 34, lore: 'From the fire cabinet. Technically borrowed.' },
  { id: 'kegsword', name: 'Keg Saber',       atk: 45, lore: 'Forged from pressurised steel. Legendary.' },
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
    { name: 'Consultant', portrait: 'assets/characters/consultant_1/rotations/south.png', anims: CONSULTANT_1_ANIMS, lore: 'Slides first. Questions later.', hp: 48, atk: 13, def: 4, xp: 20, loot: 0.24, randomNames: CONSULTANT_TITLES },
    { name: 'Consultant', portrait: 'assets/characters/consultant_2/rotations/south.png', anims: CONSULTANT_2_ANIMS, lore: 'Booked this conflict as a recurring ceremony.', hp: 52, atk: 14, def: 5, xp: 24, loot: 0.26, randomNames: CONSULTANT_TITLES },
  ],

  // Boss is always the first fight — spawned specially in useGameState
  /* Level 2 — Park */
  [
    { name: 'Cyclist', portrait: 'assets/characters/angry_cyclist/rotations/south.png', anims: ANGRY_CYCLIST_ANIMS, lore: 'Rings the bell like it is a battle cry.', hp: 74, atk: 21, def: 8, xp: 36, loot: 0.33 },
    { name: 'Drunk Guy', portrait: 'assets/characters/drunk_guy_1/rotations/south.png', anims: DRUNK_GUY_1_ANIMS, lore: 'Friendly until someone looks at his can.', hp: 84, atk: 23, def: 8, xp: 41, loot: 0.35 },
  ],
  /* Level 3 — Street */
  [
    { name: 'Drunk Guy', portrait: 'assets/characters/drunk_guy_2/rotations/south.png', anims: DRUNK_GUY_2_ANIMS, lore: 'Promises this is definitely his last one.', hp: 108, atk: 29, def: 11, xp: 54, loot: 0.39 },
    { name: '_BM_', portrait: 'assets/characters/black_metal_musician/rotations/south.png', anims: BLACK_METAL_ANIMS, lore: 'Screams in a key that doesn\'t exist.', hp: 118, atk: 31, def: 12, xp: 61, loot: 0.4, randomName: true },
  ],
  /* Level 4 — Bar */
  [
    { name: '_BM_', portrait: 'assets/characters/black_metal_musician/rotations/south.png', anims: BLACK_METAL_ANIMS, lore: 'His warm-up vocal drill sounds like a chainsaw.', hp: 132, atk: 34, def: 13, xp: 70, loot: 0.42, randomName: true },
    { name: 'Bouncer', portrait: 'assets/characters/bouncer/rotations/south.png', anims: BOUNCER_ANIMS, lore: 'Built like a fridge and equally conversational.', hp: 145, atk: 36, def: 15, xp: 78, loot: 0.45 },
    { name: 'Consultant', portrait: 'assets/characters/consultant_2/rotations/south.png', anims: CONSULTANT_2_ANIMS, lore: 'Trying to retrospective this whole evening.', hp: 124, atk: 33, def: 14, xp: 68, loot: 0.41, randomNames: CONSULTANT_TITLES },
  ],
]

export const LEVEL_NAMES = ['Office', 'Park', 'Street', 'Ravintola Kulma']
export const LEVEL_BGS = ['assets/levels/office.png', 'assets/levels/park.png', 'assets/levels/street.png', 'assets/levels/bar.png']
export const ROUNDS_PER_LEVEL = 5
export const ACTIONS_PER_TURN = 2
export const NUM_ROUTES_PER_LEVEL = 3

/** Which levels end with a shared boss fight (index → boss type). */
export function levelBossType(lvIdx: number): 'boss_first' | 'boss' | null {
  if (lvIdx === 0) return 'boss_first'
  if (lvIdx === LEVEL_ENEMIES.length - 1) return 'boss'
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
      // 3–5 nodes per route
      const routeLen = 3 + Math.floor(Math.random() * 3)

      // 50% chance of a rest stop, never at position 0
      const hasRest = Math.random() < 0.5
      const restIdx = hasRest ? 1 + Math.floor(Math.random() * (routeLen - 1)) : -1

      for (let i = 0; i < routeLen; i++) {
        nodes.push({ type: i === restIdx ? 'rest' : 'fight', done: false })
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
  hp: 55, atk: 16, def: 5, xp: 28, loot: 0.25,
}

export const BOSS_DATA = {
  name: 'THE BOSS',
  lore: 'Seppo\'s boss. Fired him for calling the new processes stupid. Now he\'s back for round two.',
  hp: 450,
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
  { id: 'regen', icon: 'self_improvement',       color: 'primary',   label: '+10 HP Regen',  desc: 'Recover 10 HP after every fight.',            apply: (p) => { p.regenBonus = (p.regenBonus || 0) + 10 } },
  { id: 'fury',  icon: 'local_fire_department',  color: 'tertiary',  label: '+3 ATK & DEF',  desc: 'Balanced power. A veteran\'s choice.',        apply: (p) => { p.baseAtk += 3; p.baseDef += 3 } },
]

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

export function getCritChance(p: Player): number {
  let c = 0.1 + (p.critBonus || 0) / 100
  for (const k of ['buff', 'buff2'] as const) {
    const b = p[k]
    if (b && b.type === 'crit') c += b.val / 100
  }
  return c
}

export function calcDmg(atk: number, def: number, critChance: number): { dmg: number; crit: boolean } {
  const eff = Math.max(1, atk - def)
  const crit = Math.random() < critChance
  return { dmg: Math.max(1, Math.round(eff * (crit ? 1.5 : 1))), crit }
}

export function buffSummary(p: Player): string {
  const parts: string[] = []
  if (p.buff && p.buff.turns > 0) parts.push(`${p.buff.name} (${p.buff.turns}t)`)
  if (p.buff2 && p.buff2.turns > 0) parts.push(`${p.buff2.name} (${p.buff2.turns}t)`)
  if (p.rageBonus > 0) parts.push(`Beer Rage +${p.rageBonus}`)
  if (p.pilsnerTurns > 0) parts.push(`Sahti ×2 (${p.pilsnerTurns}t)`)
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
    case 'spd':  return `×2 HIT ${c.duration}t`
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
    { id: 'lreg', icon: 'self_improvement',       color: 'primary',    label: `+${5 + s * 2} HP Regen`,     desc: 'Heal after every fight.', apply: (p: Player) => { p.regenBonus = (p.regenBonus || 0) + 5 + s * 2 } },
    { id: 'lmix', icon: 'local_fire_department',  color: 'tertiary',   label: `+${1 + Math.floor(s * 0.4)} ATK & DEF`, desc: 'A little of everything.', apply: (p: Player) => { const v = 1 + Math.floor(s * 0.4); p.baseAtk += v; p.baseDef += v } },
  ]
}
