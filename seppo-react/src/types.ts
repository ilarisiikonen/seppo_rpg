export type RelicRarity = 'common' | 'uncommon' | 'rare'
export type CardRarity = 'common' | 'uncommon' | 'rare'

export interface Relic {
  id: string
  name: string
  rarity: RelicRarity
  icon: string
  desc: string
}

/* ── Types ────────────────────────────────────────── */

export interface AnimDef {
  path: string
  frames: number
  fps: number
  loop: boolean
  images: HTMLImageElement[]
}

export type AnimSet = Record<string, AnimDef>

export interface Buff {
  type: string
  val: number
  turns: number
  name: string
}

export type DebuffType = 'weak' | 'vulnerable' | 'frail' | 'alcohol_poison' | 'poisoned'

export type EnemyTrait =
  | 'micro_manager'     // Consultant: can apply weak 1-2 turns
  | 'helmet'            // Cyclist: extra DEF, breaks at 50% HP
  | 'drink_steal'       // Drunk Guy: steals & uses 1 player drink (after level 2)
  | 'dark_scream'       // Black Metal: can apply weak
  | 'iron_body'         // Bouncer: player takes 3 recoil damage per attack
  | 'holy_smite'        // Priest: can apply vulnerable
  | 'slippery_floor'    // Janitor: can apply frail
  | 'grave_chill'       // Gravedigger: can apply poisoned
  | 'self_sacrifice'    // Cult Member: heals cult leader boss when boss <50% HP
  | 'tazer'             // Police: low chance to stun player for 1 turn
  | 'hellfire'          // Satan: can apply alcohol_poison
  | 'bone_explosion'    // Skeleton: deals damage to player on death
  | 'boss_weak_frail'   // Boss (Ismo): can apply weak or frail
  | 'boss_vulnerable'   // Blue-Collar boss: can apply vulnerable
  | 'satanist_rage'     // Satanist boss: can apply weak + gains ATK when low HP
  | 'bartender_poison'  // Bartender boss: can apply alcohol_poison
  | 'high_priest_wrath' // High Priest boss: can apply weak + vulnerable
  | 'cult_leader_drain' // Cult Leader boss: heals when hitting player
  | 'karhu_fury'        // Karhu Operator boss: gains DEF when low HP
  | 'mirror_self'       // Seppo boss: copies a random player buff
  | 'low_hp_atk_boost'  // Generic: gains ATK when below 30% HP

export interface Debuff {
  type: DebuffType
  turns: number
  /** Damage value for poison / alcohol_poison */
  val: number
}

export interface Weapon {
  id: string
  name: string
  atk: number
  lore: string
}

export interface Player {
  level: number
  xp: number
  xpNext: number
  hp: number
  maxHp: number
  baseAtk: number
  baseDef: number
  weapon: Weapon | null
  beers: Record<string, number>
  foods: Record<string, number>
  buffs: Buff[]
  rageBonus: number
  pilsnerTurns: number
  critBonus: number
  regenBonus: number
  blockBonus: number
  coins: number
  relics: Relic[]
  debuffs: Debuff[]
  beersThisFight: number
  attackCount: number
  overkillBonus: number
  /** Percent damage modifiers — e.g. +0.2 = +20% dmg, -0.15 = -15% dmg */
  dmgModifiers: { id: string; label: string; pct: number }[]
}

export interface EnemyTemplate {
  name: string
  portrait: string
  anims: AnimSet
  lore: string
  hp: number
  atk: number
  def: number
  xp: number
  loot: number
  randomName?: boolean
  randomNames?: string[]
  traits?: EnemyTrait[]
}

export interface Enemy {
  name: string
  portrait: string
  hp: number
  maxHp: number
  atk: number
  def: number
  xp: number
  loot: number
  stun: number
  isBlocking: number
  isElite: boolean
  isBoss: boolean
  phaseIdx: number
  anims: AnimSet
  lore: string
  debuffs: Debuff[]
  traits: EnemyTrait[]
  helmetBroken?: boolean
  baseDef?: number
}

export interface Beer {
  id: string
  name: string
  img: string
  color: string
  buff: string
  val: number
  duration: number
  tier: number
  desc: string
  rarity?: CardRarity
  /** If set, drinking this beer also applies a debuff to the enemy */
  enemyDebuff?: { type: DebuffType; turns: number; val: number }
}

export interface Food {
  id: string
  name: string
  img: string
  color: string
  restore: string
  val: number
  tier: number
  desc: string
  rarity?: CardRarity
}

export interface LevelUpChoice {
  id: string
  icon: string
  color: string
  label: string
  desc: string
  apply: (p: Player) => void
}

export interface Upgrade {
  id: string
  icon: string
  color: string
  label: string
  desc: string
  apply: (p: Player) => void
}

export interface BossPhase {
  threshold: number
  msg: string
  atkBonus: number
}

export interface LogEntry {
  id: number
  msg: string
  cls: string
}

export interface FeedEntry {
  id: number
  msg: string
  cls: string
  createdAt: number
}

export interface FloatDmg {
  id: number
  dmg: number
  color: string
  target: 'player' | 'enemy'
}

export type OverlayType =
  | 'intro'
  | 'level-complete'
  | 'upgrade'
  | 'level-up'
  | 'fight-victory'
  | 'victory'
  | 'game-over'
  | 'stat-info'
  | 'relic-choice'
  | 'event-loot'

export interface OverlayData {
  type: OverlayType
  title: string
  body: unknown
  btnText: string
  onBtn: () => void
  showBtn: boolean
  choices?: LevelUpChoice[] | Upgrade[]
}

export type EventCategory = 'tradeoff' | 'upgrade' | 'optional'

export interface EventChoice {
  label: string
  desc: string
  icon: string
  color: string
}

export interface GameEvent {
  id: string
  name: string
  desc: string
  icon: string
  bg: string
  category: EventCategory
  choices: EventChoice[]
}

export interface ActiveEvent {
  event: GameEvent
  /** Callback per choice index */
  onChoose: (choiceIdx: number) => void
}

export type MapNodeType = 'fight' | 'elite' | 'rest' | 'treasure' | 'shop' | 'mystery' | 'boss_first' | 'boss'

export interface MapNode {
  type: MapNodeType
  done: boolean
}

export type LevelRoute = MapNode[]

export interface EnemyKill {
  name: string
  dmgDealt: number
  xp: number
}

export interface RunStats {
  beersDrunk: number
  enemiesDefeated: EnemyKill[]
  totalDmgDealt: number
  currentFightDmg: number
}

export interface ShopInventory {
  beers: string[]
  foods: string[]
  relics: string[]
  weapon: string | null
  _origRelics: string[]
  _origWeapon: string | null
  /** Pre-rolled prices per item id (±30% randomized) */
  prices: Record<string, number>
}

export interface GameState {
  phase: 'intro' | 'map' | 'explore' | 'battle' | 'shop'
  player: Player
  enemy: Enemy | null
  currentLevel: number
  currentRound: number
  /** All generated routes for every level — [levelIdx][routeIdx] */
  levelRoutes: LevelRoute[][]
  /** Which route the player picked for the current level (null = not yet chosen) */
  chosenRoute: number | null
  /** Current node index within the chosen route */
  routeNodeIdx: number
  actionsLeft: number
  usedCount: number
  inBattle: boolean
  battleLocked: boolean
  isBlocking: number
  enemyNextDmgs: number[]
  enemyWillBlock: boolean
  enemyWillDebuff: DebuffType | null
  pendingLevelUps: number
  subMenuType: 'beer' | 'food' | null
  overlay: OverlayData | null
  activeEvent: ActiveEvent | null
  logEntries: LogEntry[]
  feedEntries: FeedEntry[]
  floatDamages: FloatDmg[]
  playerAnimKey: string
  playerAnimSeq: number
  playerAnimSet: 'south' | 'east'
  enemyAnimKey: string
  enemyAnimSeq: number
  afterLevelUp: (() => void) | null
  afterRelicChoice: (() => void) | null
  nextIdCounter: number
  runStartTime: number
  runStats: RunStats
  shopInventory: ShopInventory | null
  isShopkeeperFight: boolean
  coinsBeforeShopFight: number
  enemyTazedPlayer: boolean
}
