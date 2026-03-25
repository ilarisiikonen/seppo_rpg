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
  buff: Buff | null
  buff2: Buff | null
  rageBonus: number
  pilsnerTurns: number
  critBonus: number
  regenBonus: number
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
  isBoss: boolean
  phaseIdx: number
  anims: AnimSet
  lore: string
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
  | 'victory'
  | 'game-over'
  | 'stat-info'

export interface OverlayData {
  type: OverlayType
  title: string
  body: unknown
  btnText: string
  onBtn: () => void
  showBtn: boolean
  choices?: LevelUpChoice[] | Upgrade[]
}

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

export interface GameState {
  phase: 'intro' | 'explore' | 'battle'
  player: Player
  enemy: Enemy | null
  currentLevel: number
  currentRound: number
  actionsLeft: number
  usedCount: number
  inBattle: boolean
  battleLocked: boolean
  pendingLevelUps: number
  subMenuType: 'beer' | 'food' | null
  overlay: OverlayData | null
  logEntries: LogEntry[]
  feedEntries: FeedEntry[]
  floatDamages: FloatDmg[]
  playerAnimKey: string
  playerAnimSeq: number
  playerAnimSet: 'south' | 'east'
  enemyAnimKey: string
  enemyAnimSeq: number
  afterLevelUp: (() => void) | null
  nextIdCounter: number
  runStartTime: number
  runStats: RunStats
}
