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

export const HOMELESS_MAN_1_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/homeles_man._1/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/homeles_man._1/animations/surprise-uppercut/west/', 7, 10, false),
  hit:    makeAnim('assets/characters/homeles_man._1/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/homeles_man._1/animations/falling-back-death/west/', 7, 6, false),
}

export const HOMELESS_MAN_2_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/homeless_man_2/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/homeless_man_2/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/homeless_man_2/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/homeless_man_2/animations/falling-back-death/west/', 7, 6, false),
}

export const BLACK_METAL_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/black_metal_musican/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/black_metal_musican/animations/lead-jab/west/', 3, 10, false),
  hit:    makeAnim('assets/characters/black_metal_musican/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/black_metal_musican/animations/falling-back-death/west/', 7, 6, false),
}

export const BOUNCER_ANIMS: AnimSet = {
  idle:   makeAnim('assets/characters/bouncer/animations/fight-stance-idle-8-frames/west/', 8, 5, true),
  attack: makeAnim('assets/characters/bouncer/animations/cross-punch/west/', 6, 10, false),
  hit:    makeAnim('assets/characters/bouncer/animations/taking-punch/west/', 6, 8, false),
  death:  makeAnim('assets/characters/bouncer/animations/falling-back-death/west/', 7, 6, false),
}

export const ALL_ANIM_SETS: AnimSet[] = [
  SEPPO_ANIMS_SOUTH, SEPPO_ANIMS_EAST, ISMO_ANIMS,
  ANGRY_CYCLIST_ANIMS, HOMELESS_MAN_1_ANIMS, HOMELESS_MAN_2_ANIMS,
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

export const LEVEL_ENEMIES: EnemyTemplate[][] = [
  /* Level 1 — Park */
  [
    { name: 'Angry Cyclist', portrait: 'assets/characters/angry_cyclist/rotations/south.png', anims: ANGRY_CYCLIST_ANIMS, lore: 'Someone cut him off. He\'s been like this since.', hp: 45, atk: 12, def: 4, xp: 18, loot: 0.25 },
    { name: 'Homeless Man',  portrait: 'assets/characters/homeles_man._1/rotations/south.png', anims: HOMELESS_MAN_1_ANIMS, lore: 'Territorial about his bench. And your wallet.', hp: 50, atk: 14, def: 3, xp: 22, loot: 0.25 },
  ],
  /* Level 2 — Street */
  [
    { name: 'Homeless Man',  portrait: 'assets/characters/homeless_man_2/rotations/south.png', anims: HOMELESS_MAN_2_ANIMS, lore: 'Back for round two. Angrier this time.', hp: 80, atk: 22, def: 8, xp: 38, loot: 0.35 },
    { name: '_BM_',          portrait: 'assets/characters/black_metal_musican/rotations/south.png', anims: BLACK_METAL_ANIMS, lore: 'Screams in a key that doesn\'t exist.', hp: 95, atk: 26, def: 9, xp: 48, loot: 0.35, randomName: true },
    { name: 'Bouncer',       portrait: 'assets/characters/bouncer/rotations/south.png', anims: BOUNCER_ANIMS, lore: 'Has never read a law. Compensates with mass.', hp: 110, atk: 28, def: 12, xp: 58, loot: 0.4 },
  ],
  /* Level 3 — Inside the Bar */
  [
    { name: 'Bouncer', portrait: 'assets/characters/bouncer/rotations/south.png', anims: BOUNCER_ANIMS, lore: 'The bar\'s last line of defence. Built like a fridge.', hp: 160, atk: 36, def: 16, xp: 85, loot: 0.45 },
  ],
]

export const LEVEL_NAMES = ['The Street', 'The Dark Alley', 'Inside Ravintola Kulma']
export const LEVEL_BGS = ['assets/levels/park.png', 'assets/levels/street.png', 'assets/levels/bar.png']
export const ROUNDS_PER_LEVEL = 5
export const ACTIONS_PER_TURN = 2

export const BOSS_DATA = {
  name: 'ISMO',
  lore: 'He watered down Seppo\'s beer. He sat in the corner seat. He will regret both.',
  hp: 450,
  atk: 50,
  def: 22,
  xp: 500,
  phases: [
    { threshold: 0.6, msg: 'Ismo growls: "I\'ll water down every pint in this neighbourhood!"', atkBonus: 0 } as BossPhase,
    { threshold: 0.3, msg: 'Ismo SCREAMS: "THAT IS MY CORNER SEAT AND I WILL DIE IN IT!"', atkBonus: 12 } as BossPhase,
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
