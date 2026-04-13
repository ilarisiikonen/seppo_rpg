import { useReducer, useRef } from 'react'
import type { GameState, Player, Enemy, Buff, Debuff, DebuffType, LogEntry, FeedEntry, FloatDmg, OverlayData, LevelUpChoice, Upgrade, LevelRoute, Relic, ActiveEvent, EnemyTrait, RunStats } from './types'
import {
  SEPPO_ANIMS_SOUTH, SEPPO_ANIMS_EAST, ISMO_ANIMS,
  BEERS, FOODS, WEAPONS, LEVEL_ENEMIES, LEVEL_NAMES, LEVEL_BGS,
  BOSS_DATA, PARK_BOSS_DATA, STREET_BOSS_DATA, BAR_BOSS_DATA, CHURCH_BOSS_DATA, BASEMENT_BOSS_DATA, MEADOW_BOSS_DATA, HELL_BOSS_DATA, ISMO_FIRST_FIGHT, BLACK_METAL_NAMES, CONSULTANT_TITLES, UPGRADES, ROUNDS_PER_LEVEL, PLAYER_ACTIONS, ENEMY_ACTIONS,
  preloadAllAnims, getPlayerAtk, getPlayerDef, getPlayerBlock, getCritChance, calcDmg, buffSummary,
  scaledLevelUpChoices, generateAllRoutes, levelBossType, hasRelic, pickRelics, pickRelicsByRarity, RELICS, SHOP_PRICES, RELIC_SHOP_PRICES, WEAPON_SHOP_PRICE, SHOPKEEPER_FIGHT_DATA, GAME_EVENTS,
  TRAIT_INFO, BEERS_COMMON, FOODS_COMMON, BEERS_NORMAL, BEERS_SPECIAL, RARITY_SHOP_MULT, isItemUnlocked,
} from './gameData'

/* ── Initial State ────────────────────────────── */

function createPlayer(): Player {
  return {
    level: 1, xp: 0, xpNext: 50,
    hp: 80, maxHp: 80,
    baseAtk: 12, baseDef: 7,
    weapon: null,
    beers: { hoppy_ipa: 1, pale_ale: 1, lager: 1, wheat_beer: 0, porter: 1, stout: 0 },
    foods: { burger: 2, kebab: 1, makkaraperunat: 0 },
    buffs: [],
    rageBonus: 0, pilsnerTurns: 0, critBonus: 0, regenBonus: 0, blockBonus: 0,
    coins: 0, relics: [], debuffs: [], beersThisFight: 0, attackCount: 0, overkillBonus: 0,
    dmgModifiers: [],
  }
}

function createInitialState(): GameState {
  return {
    phase: 'intro',
    player: createPlayer(),
    enemy: null,
    currentLevel: 0, currentRound: 0,
    levelRoutes: [],
    chosenRoute: null,
    routeNodeIdx: 0,
    actionsLeft: PLAYER_ACTIONS,
    usedCount: 0,
    inBattle: false, battleLocked: false, isBlocking: 0, enemyNextDmgs: [], enemyWillBlock: false, enemyWillDebuff: null,
    pendingLevelUps: 0,
    subMenuType: null,
    overlay: {
      type: 'intro', title: "Seppo's Last Round",
      body: null, btnText: 'Start Quest',
      onBtn: () => {}, showBtn: true,
    },
    logEntries: [], feedEntries: [], floatDamages: [],
    playerAnimKey: 'idle', playerAnimSeq: 0, playerAnimSet: 'south',
    enemyAnimKey: 'idle', enemyAnimSeq: 0,
    afterLevelUp: null, nextIdCounter: 1,
    afterRelicChoice: null,
    runStartTime: 0,
    runStats: { beersDrunk: 0, enemiesDefeated: [], totalDmgDealt: 0, currentFightDmg: 0 },
    shopInventory: null,
    isShopkeeperFight: false,
    coinsBeforeShopFight: 0,
    enemyTazedPlayer: false,
    activeEvent: null,
  }
}

/* ── Run Save/Load (localStorage) ────────────── */

const SAVE_KEY = 'seppo_saved_run'

interface SavedRun {
  player: Player
  currentLevel: number
  currentRound: number
  levelRoutes: LevelRoute[][]
  chosenRoute: number | null
  routeNodeIdx: number
  elapsedMs: number
  runStats: RunStats
  nextIdCounter: number
}

function saveRunToStorage(g: GameState) {
  try {
    const snap: SavedRun = {
      player: g.player,
      currentLevel: g.currentLevel,
      currentRound: g.currentRound,
      levelRoutes: g.levelRoutes,
      chosenRoute: g.chosenRoute,
      routeNodeIdx: g.routeNodeIdx,
      elapsedMs: Date.now() - g.runStartTime,
      runStats: g.runStats,
      nextIdCounter: g.nextIdCounter,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(snap))
  } catch { /* quota exceeded — silently fail */ }
}

export function loadSavedRun(): SavedRun | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SavedRun
  } catch { return null }
}

function clearSavedRun() {
  try { localStorage.removeItem(SAVE_KEY) } catch {}
}

export function hasSavedRun(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

/* ── Hook ─────────────────────────────────────── */

export interface RunEndData {
  level: number
  won: boolean
  score: number
  kills: number
  elapsed: number
  dmgDealt: number
  beersDrunk: number
  enemyNames: string[]
}

export function useGameState(onRunEnd?: (data: RunEndData) => void, unlockedItemIds?: Set<string>) {
  const [, forceRender] = useReducer((x: number) => x + 1, 0)
  const gsRef = useRef<GameState>(createInitialState())
  const g = gsRef.current
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const onRunEndRef = useRef(onRunEnd)
  onRunEndRef.current = onRunEnd
  const unlockedRef = useRef(unlockedItemIds)
  unlockedRef.current = unlockedItemIds

  function render() { forceRender() }

  function nextId(): number {
    return gsRef.current.nextIdCounter++
  }

  function addTimer(fn: () => void, ms: number) {
    const t = setTimeout(() => {
      timersRef.current.delete(t)
      fn()
    }, ms)
    timersRef.current.add(t)
  }

  /* ── Logging ──────────────────────────────── */

  function logMsg(msg: string, cls: string) {
    const g = gsRef.current
    const entry: LogEntry = { id: nextId(), msg, cls }
    g.logEntries = [...g.logEntries.slice(-69), entry]
    const feedEntry: FeedEntry = { id: nextId(), msg, cls, createdAt: Date.now() }
    g.feedEntries = [...g.feedEntries.slice(-3), feedEntry]
    addTimer(() => {
      const g2 = gsRef.current
      g2.feedEntries = g2.feedEntries.filter((e: FeedEntry) => e.id !== feedEntry.id)
      render()
    }, 3200)
  }

  function addFloatDmg(target: 'player' | 'enemy', dmg: number, color: string) {
    const g = gsRef.current
    const entry: FloatDmg = { id: nextId(), dmg, color, target }
    g.floatDamages = [...g.floatDamages, entry]
    addTimer(() => {
      const g2 = gsRef.current
      g2.floatDamages = g2.floatDamages.filter((e: FloatDmg) => e.id !== entry.id)
      render()
    }, 1200)
  }

  /* ── Buff Management ──────────────────────── */

  function applyBuff(b: { buff: string; val: number; duration: number; name: string }) {
    const g = gsRef.current
    const p = g.player
    // Stack into existing buff of same type
    const existing = p.buffs.find(buf => buf.type === b.buff && buf.turns > 0)
    if (existing) {
      existing.val += b.val
      existing.turns = Math.max(existing.turns, b.duration)
      existing.name = existing.name + ' + ' + b.name
      return
    }
    p.buffs.push({ type: b.buff, val: b.val, turns: b.duration, name: b.name })
  }

  function tickBuffs() {
    const p = gsRef.current.player
    for (let i = p.buffs.length - 1; i >= 0; i--) {
      const buf = p.buffs[i]
      if (buf.turns > 0 && buf.turns < 999) {
        buf.turns--
        if (buf.turns === 0) {
          if (buf.type === 'rage') p.rageBonus = 0
          logMsg(`${buf.name} buzz wore off.`, 'system')
          p.buffs.splice(i, 1)
        }
      }
    }
    if (p.pilsnerTurns > 0 && p.pilsnerTurns < 999) p.pilsnerTurns--
  }

  /* ── Debuffs ──────────────────────────────── */

  const DEBUFF_NAMES: Record<DebuffType, string> = {
    weak: 'Weak', vulnerable: 'Vulnerable', frail: 'Frail',
    alcohol_poison: 'Alcohol Poisoning', poisoned: 'Poisoned',
  }

  function applyDebuff(target: Debuff[], type: DebuffType, turns: number, val = 0) {
    const existing = target.find(d => d.type === type)
    if (existing) {
      existing.turns = Math.max(existing.turns, turns)
      if (val > 0) existing.val = Math.max(existing.val, val)
    } else {
      target.push({ type, turns, val })
    }
  }

  function hasDebuff(target: Debuff[], type: DebuffType): boolean {
    return target.some(d => d.type === type && d.turns > 0)
  }

  function hasTrait(enemy: Enemy | null, trait: EnemyTrait): boolean {
    return !!enemy && enemy.traits.includes(trait)
  }

  function tickDebuffs(target: Debuff[], ownerName: string) {
    for (let i = target.length - 1; i >= 0; i--) {
      const d = target[i]
      d.turns--
      if (d.turns <= 0) {
        logMsg(`${ownerName}: ${DEBUFF_NAMES[d.type]} wore off.`, 'system')
        target.splice(i, 1)
      }
    }
  }

  function applyPoison(target: Debuff[], ownerName: string, isPlayer: boolean) {
    const g = gsRef.current
    const poison = target.find(d => d.type === 'poisoned' && d.turns > 0)
    if (!poison) return
    const rawDmg = poison.val
    if (isPlayer) {
      const absorbed = Math.min(g.isBlocking, rawDmg)
      g.isBlocking = Math.max(0, g.isBlocking - rawDmg)
      const dmg = Math.max(0, rawDmg - absorbed)
      g.player.hp = Math.max(0, g.player.hp - dmg)
      addFloatDmg('player', dmg, '#b388ff')
      logMsg(`${ownerName} takes ${dmg} poison damage!${absorbed > 0 ? ` (Blocked ${absorbed})` : ''}`, 'enemy')
    } else if (g.enemy) {
      const absorbed = Math.min(g.enemy.isBlocking, rawDmg)
      g.enemy.isBlocking = Math.max(0, g.enemy.isBlocking - rawDmg)
      const dmg = Math.max(0, rawDmg - absorbed)
      g.enemy.hp = Math.max(0, g.enemy.hp - dmg)
      addFloatDmg('enemy', dmg, '#b388ff')
      logMsg(`${ownerName} takes ${dmg} poison damage!${absorbed > 0 ? ` (Blocked ${absorbed})` : ''}`, 'player')
    }
  }

  /* ── XP & Leveling ────────────────────────── */

  function gainXP(amount: number) {
    const g = gsRef.current
    const p = g.player
    p.xp += amount
    logMsg(`+${amount} XP`, 'system')
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext
      p.level++
      p.xpNext = Math.round(p.xpNext * 1.45)
      p.maxHp += 5; p.baseAtk += 1; p.baseDef += 1
      p.hp = Math.min(p.hp + 5, p.maxHp)
      const allItems = [...BEERS_COMMON, ...FOODS_COMMON]
      const rb = allItems[Math.floor(Math.random() * allItems.length)]
      if ('restore' in rb) { p.foods[rb.id] = (p.foods[rb.id] || 0) + 1 }
      else { p.beers[rb.id] = (p.beers[rb.id] || 0) + 1 }
      logMsg(`LEVEL UP — Seppo is Level ${p.level}! +5 HP, +1 ATK, +1 DEF + Free ${rb.name}!`, 'system')
      g.pendingLevelUps++
    }
  }

  function showLevelUpChoice(): boolean {
    const g = gsRef.current
    if (g.pendingLevelUps <= 0) return false
    g.pendingLevelUps--
    const pool = scaledLevelUpChoices(g.player.level)
    const picks: LevelUpChoice[] = []
    const remaining = [...pool]
    while (picks.length < 3 && remaining.length) {
      const idx = Math.floor(Math.random() * remaining.length)
      picks.push(remaining.splice(idx, 1)[0])
    }
    g.overlay = {
      type: 'level-up',
      title: `Level ${g.player.level} — Choose a Bonus`,
      body: null,
      btnText: '',
      onBtn: () => {},
      showBtn: false,
      choices: picks,
    }
    render()
    return true
  }

  /* ── Battle End ───────────────────────────── */

  function endBattle(won: boolean) {
    const g = gsRef.current
    if (!g.inBattle) return // already ended — prevent duplicate calls from stacked timers
    g.inBattle = false

    // ── Shopkeeper fight special handling ──
    if (g.isShopkeeperFight) {
      g.isShopkeeperFight = false
      if (won) {
        const refund = g.coinsBeforeShopFight - g.player.coins
        const coinsBack = Math.max(0, refund)
        g.player.coins = g.coinsBeforeShopFight
        g.overlay = {
          type: 'fight-victory',
          title: 'Shopkeeper Defeated!',
          body: { enemyPortrait: g.enemy!.portrait, xpGained: 0, coinsDropped: coinsBack, weaponFound: null, itemsDropped: [], regenHp: 0 },
          btnText: 'Back to Shop',
          onBtn: () => { g.overlay = null; g.phase = 'shop'; render() },
          showBtn: true,
        }
        logMsg(`You beat the shopkeeper and got ${coinsBack} coins back!`, 'system')
      } else {
        const coinsLost = g.player.coins
        g.player.coins = 0
        g.player.hp = Math.max(1, Math.round(g.player.maxHp * 0.15))
        g.overlay = {
          type: 'fight-victory',
          title: 'Beaten by the Shopkeeper!',
          body: {
            enemyPortrait: g.enemy!.portrait,
            xpGained: 0,
            coinsDropped: 0,
            coinsLost,
            loreText: 'The shopkeeper drags Seppo by the collar and tosses him out the door. He lands face-first on the pavement, pockets emptied.',
            weaponFound: null,
            itemsDropped: [],
            regenHp: 0,
          },
          btnText: 'Crawl Away',
          onBtn: () => { g.overlay = null; leaveShop() },
          showBtn: true,
        }
        logMsg(`The shopkeeper threw you out. You lost ${coinsLost} coins!`, 'system')
      }
      g.coinsBeforeShopFight = 0
      render()
      return
    }

    if (won) {
      // Tick buffs down by 1 turn on kill
      const p = g.player
      for (let i = p.buffs.length - 1; i >= 0; i--) {
        const buf = p.buffs[i]
        if (buf.turns > 0 && buf.turns < 999) {
          buf.turns--
          if (buf.turns <= 0) p.buffs.splice(i, 1)
        }
      }
      if (p.pilsnerTurns > 0 && p.pilsnerTurns < 999) p.pilsnerTurns--

      const enemy = g.enemy
      if (!enemy) { render(); return }
      g.runStats.enemiesDefeated.push({ name: enemy.name, dmgDealt: g.runStats.currentFightDmg, xp: enemy.xp })
      g.runStats.currentFightDmg = 0

      // Regen
      let regenHp = 0
      if (g.player.regenBonus) {
        regenHp = g.player.regenBonus
        g.player.hp = Math.min(g.player.maxHp, g.player.hp + regenHp)
      }

      gainXP(enemy.xp)

      // Coin drop — scales with enemy XP (base: xp * 1–2, elite/boss get bonus)
      const coinBase = Math.floor(enemy.xp * (1 + Math.random()))
      const coinBonus = enemy.isElite ? 1.5 : enemy.isBoss ? 3 : 1
      const coinsDropped = Math.round(coinBase * coinBonus)
      g.player.coins += coinsDropped
      logMsg(`+${coinsDropped} coins`, 'system')

      // Weapon loot — bosses only
      let weaponFound: { name: string; atk: number; lore: string } | null = null
      if (enemy.isBoss && Math.random() < (enemy.loot || 0)) {
        const cands = filterUnlocked(WEAPONS).filter(w => !g.player.weapon || w.atk > g.player.weapon.atk)
        if (cands.length) {
          const found = cands[Math.floor(Math.random() * Math.min(3, cands.length))]
          if (!g.player.weapon || found.atk > g.player.weapon.atk) {
            g.player.weapon = { ...found }
            weaponFound = { name: found.name, atk: found.atk, lore: found.lore }
          }
        }
      }

      // Item drops — elite/boss kills can drop rare cards
      const canRare = enemy.isElite || enemy.isBoss
      const isNormalEnemy = !enemy.isElite && !enemy.isBoss
      const drops: { name: string; img: string; color: string; desc: string; rarity?: string }[] = []
      // Normal enemies before level 4: only 1 common card
      const forceCommon = isNormalEnemy && g.currentLevel < 4
      const d1 = forceCommon ? dropCommonItem() : dropItem(canRare)
      drops.push({ name: d1.name, img: d1.img, color: d1.color, desc: d1.desc, rarity: d1.rarity })
      if (!forceCommon && Math.random() < (0.2 + g.currentLevel * 0.15)) {
        const d2 = dropItem(canRare)
        drops.push({ name: d2.name, img: d2.img, color: d2.color, desc: d2.desc, rarity: d2.rarity })
      }

      const isBossEnemy = enemy.isBoss
      const isEliteEnemy = enemy.isElite

      const afterFight = () => {
        g.overlay = null

        // Elite enemies drop a relic choice before continuing
        if (isEliteEnemy) {
          g.afterRelicChoice = () => proceedAfterFight()
          showRelicChoice('elite')
          return
        }

        proceedAfterFight()
      }

      const proceedAfterFight = () => {
        if (isBossEnemy) {
          // Only trigger victory on the very last level's boss
          if (g.currentLevel >= LEVEL_ENEMIES.length - 1) {
            triggerVictory()
            return
          }
          // Otherwise, complete the level and move on
          if (!showLevelUpChoice()) triggerLevelComplete()
          else { g.afterLevelUp = () => triggerLevelComplete() }
          render()
          return
        }

        // At shared boss end node (routeNodeIdx >= route.length) — boss beaten, complete level
        const route = getCurrentRoute()
        if (route && g.routeNodeIdx >= route.length) {
          g.routeNodeIdx++
          g.currentRound++
          if (!showLevelUpChoice()) triggerLevelComplete()
          else { g.afterLevelUp = () => triggerLevelComplete() }
          render()
          return
        }

        // Mark current node done and advance
        if (route && g.routeNodeIdx >= 0 && g.routeNodeIdx < route.length) {
          route[g.routeNodeIdx].done = true
        }
        g.routeNodeIdx++
        g.currentRound++

        // Check if route is complete: if level has boss, go to it; otherwise level done
        if (route && g.routeNodeIdx >= route.length) {
          const bossType = levelBossType(g.currentLevel)
          if (bossType) {
            logMsg(`All paths converge…`, 'system')
            if (!showLevelUpChoice()) showExplore()
            else { g.afterLevelUp = () => showExplore() }
          } else {
            if (!showLevelUpChoice()) triggerLevelComplete()
            else { g.afterLevelUp = () => triggerLevelComplete() }
          }
        } else {
          logMsg(`Round ${g.currentRound + 1}`, 'system')
          if (!showLevelUpChoice()) showExplore()
          else { g.afterLevelUp = () => showExplore() }
        }
        render()
      }

      g.overlay = {
        type: 'fight-victory',
        title: `${enemy.name} Defeated!`,
        body: { enemyPortrait: enemy.portrait, xpGained: enemy.xp, coinsDropped, weaponFound, itemsDropped: drops, regenHp },
        btnText: 'Continue',
        onBtn: afterFight,
        showBtn: true,
      }
    } else {
      triggerGameOver()
    }
    render()
  }

  /** Filter an array to only unlocked items */
  function filterUnlocked<T extends { id: string }>(items: T[]): T[] {
    const u = unlockedRef.current
    if (!u) return items // no unlock data → everything available
    return items.filter(i => isItemUnlocked(i.id, u))
  }

  function dropItem(canDropRare = false) {
    const g = gsRef.current
    // Weight by rarity: common 70%, uncommon 25%, rare 5% (rare only from elite/boss)
    // Special beers (regen/thorns/cleanse/actions/triple) only drop from elite/boss
    const roll = Math.random()
    let pool: (typeof BEERS[number] | typeof FOODS[number])[]
    if (canDropRare && roll < 0.05) {
      pool = filterUnlocked([...BEERS, ...FOODS].filter(i => i.rarity === 'rare'))
    } else if (canDropRare && roll < 0.15) {
      // Elite/boss: 10% chance to drop a special beer
      pool = filterUnlocked([...BEERS_SPECIAL])
    } else if (roll < 0.30) {
      pool = filterUnlocked([...BEERS_NORMAL, ...FOODS].filter(i => i.rarity === 'uncommon'))
    } else {
      pool = filterUnlocked([...BEERS_COMMON, ...FOODS_COMMON])
    }
    if (!pool.length) pool = filterUnlocked([...BEERS_COMMON, ...FOODS_COMMON])
    if (!pool.length) pool = [...BEERS_COMMON, ...FOODS_COMMON] // ultimate fallback
    const rb = pool[Math.floor(Math.random() * pool.length)]
    if ('restore' in rb) { g.player.foods[rb.id] = (g.player.foods[rb.id] || 0) + 1 }
    else { g.player.beers[rb.id] = (g.player.beers[rb.id] || 0) + 1 }
    return rb
  }

  /** Drop a common-only item (no uncommon/rare) */
  function dropCommonItem() {
    const g = gsRef.current
    let pool = filterUnlocked([...BEERS_COMMON, ...FOODS_COMMON])
    if (!pool.length) pool = [...BEERS_COMMON, ...FOODS_COMMON]
    const rb = pool[Math.floor(Math.random() * pool.length)]
    if ('restore' in rb) { g.player.foods[rb.id] = (g.player.foods[rb.id] || 0) + 1 }
    else { g.player.beers[rb.id] = (g.player.beers[rb.id] || 0) + 1 }
    return rb
  }

  /* ── Boss Phases ──────────────────────────── */

  function checkBossPhase() {
    const g = gsRef.current
    if (!g.enemy?.isBoss) return
    BOSS_DATA.phases.forEach((p, i) => {
      if (g.enemy!.hp / g.enemy!.maxHp <= p.threshold && g.enemy!.phaseIdx <= i) {
        g.enemy!.phaseIdx = i + 1
        logMsg(p.msg, 'enemy')
      }
    })
  }

  /* ── Enemy Turn ───────────────────────────── */

  function rollEnemyDmg() {
    const g = gsRef.current
    if (!g.enemy || g.enemy.hp <= 0) { g.enemyNextDmgs = []; g.enemyWillBlock = false; g.enemyWillDebuff = null; return }
    let atk = g.enemy.atk
    // Weak debuff: enemy deals 25% less damage
    if (hasDebuff(g.enemy.debuffs, 'weak')) atk = Math.round(atk * 0.75)
    if (g.enemy.isBoss && g.enemy.phaseIdx >= 1) atk += BOSS_DATA.phases[1].atkBonus
    // Trait: low_hp_atk_boost / satanist_rage — +30% ATK when below 30% HP
    if ((hasTrait(g.enemy, 'low_hp_atk_boost') || hasTrait(g.enemy, 'satanist_rage')) && g.enemy.hp <= g.enemy.maxHp * 0.3) {
      atk = Math.round(atk * 1.3)
    }
    // Trait: karhu_fury — +50% DEF when below 30% HP (applied once via flag)
    if (hasTrait(g.enemy, 'karhu_fury') && g.enemy.hp <= g.enemy.maxHp * 0.3 && !g.enemy.helmetBroken) {
      g.enemy.def = Math.round(g.enemy.def * 1.5)
      g.enemy.helmetBroken = true // reuse flag to prevent re-application
      logMsg(`${g.enemy.name} enters Bear Stance! DEF greatly increased!`, 'enemy')
    }
    // Decide enemy action allocation: block, debuff, or all strikes
    g.enemyWillBlock = ENEMY_ACTIONS > 1 && Math.random() < 0.3
    // Build debuff pool based on enemy traits
    const traitDebuffs: DebuffType[] = []
    if (hasTrait(g.enemy, 'micro_manager')) traitDebuffs.push('weak')
    if (hasTrait(g.enemy, 'dark_scream') || hasTrait(g.enemy, 'satanist_rage')) traitDebuffs.push('weak')
    if (hasTrait(g.enemy, 'holy_smite') || hasTrait(g.enemy, 'boss_vulnerable')) traitDebuffs.push('vulnerable')
    if (hasTrait(g.enemy, 'slippery_floor') || hasTrait(g.enemy, 'boss_weak_frail')) traitDebuffs.push('weak', 'frail')
    if (hasTrait(g.enemy, 'grave_chill')) traitDebuffs.push('poisoned')
    if (hasTrait(g.enemy, 'hellfire') || hasTrait(g.enemy, 'bartender_poison')) traitDebuffs.push('alcohol_poison')
    if (hasTrait(g.enemy, 'high_priest_wrath')) traitDebuffs.push('weak', 'vulnerable')
    // Helmet trait: cyclist can't debuff
    const cannotDebuff = hasTrait(g.enemy, 'helmet')
    const debuffPool: DebuffType[] = traitDebuffs.length > 0 ? traitDebuffs : ['weak', 'vulnerable', 'frail', 'alcohol_poison', 'poisoned']
    const debuffChance = traitDebuffs.length > 0 ? 0.45 : 0.3
    const canDebuff = !cannotDebuff && ENEMY_ACTIONS > 1 && !g.enemyWillBlock && Math.random() < debuffChance
    g.enemyWillDebuff = canDebuff ? debuffPool[Math.floor(Math.random() * debuffPool.length)] : null
    const strikes = g.enemyWillBlock ? ENEMY_ACTIONS - 1 : g.enemyWillDebuff ? ENEMY_ACTIONS - 1 : ENEMY_ACTIONS
    // Vulnerable debuff on player: take 50% more damage
    const vulnMod = hasDebuff(g.player.debuffs, 'vulnerable') ? 1.5 : 1
    g.enemyNextDmgs = Array.from({ length: strikes }, () => Math.round(calcDmg(atk, getPlayerDef(g.player), 0).dmg * vulnMod))
  }

  function enemyTurn() {
    const g = gsRef.current
    if (!g.enemy || g.enemy.hp <= 0) return
    if (g.enemy.stun > 0) {
      g.enemy.stun--
      logMsg(`${g.enemy.name} is stunned — loses turn!`, 'enemy')
      tickBuffs()
      g.isBlocking = 0
      g.actionsLeft = PLAYER_ACTIONS
      render()
      return
    }
    // Tick enemy debuffs at start of enemy turn
    tickDebuffs(g.enemy.debuffs, g.enemy.name)
    // Apply poison to enemy at start of their turn
    applyPoison(g.enemy.debuffs, g.enemy.name, false)
    if (g.enemy.hp <= 0) {
      g.enemyAnimKey = 'death'
      g.enemyAnimSeq++
      render()
      const enemyDeathAnim = g.enemy.anims.death
      const enemyDeathDuration = Math.round(enemyDeathAnim.frames / enemyDeathAnim.fps * 1000) + 1200
      addTimer(() => endBattle(true), enemyDeathDuration)
      return
    }
    // Reset any leftover enemy block from previous turn
    if (g.enemy) g.enemy.isBlocking = 0
    const strikesTotal = g.enemyWillBlock ? ENEMY_ACTIONS - 1 : g.enemyWillDebuff ? ENEMY_ACTIONS - 1 : ENEMY_ACTIONS
    // Apply debuff first if planned
    if (g.enemyWillDebuff) {
      const dt = g.enemyWillDebuff
      g.enemyWillDebuff = null
      // Finnish Sisu relic: immune to debuffs
      if (hasRelic(g.player, 'debuff_immune')) {
        logMsg(`Finnish Sisu blocks ${DEBUFF_NAMES[dt]}!`, 'item')
      } else {
        let debuffTurns = dt === 'alcohol_poison' ? 999 : dt === 'poisoned' ? 3 : 1
        // Micro Manager trait: applies weak for 1-2 turns
        if (hasTrait(g.enemy, 'micro_manager') && dt === 'weak') debuffTurns = 1 + Math.floor(Math.random() * 2)
        // +1 turn so the debuff survives the end-of-enemy-turn tick and is active during the player's next turn
        debuffTurns += 1
        const debuffVal = (dt === 'alcohol_poison') ? 0 : (dt === 'poisoned') ? Math.round(4 + g.currentLevel * 3) : 0
        applyDebuff(g.player.debuffs, dt, debuffTurns, debuffVal)
        logMsg(`${g.enemy.name} inflicts ${DEBUFF_NAMES[dt]}${(debuffTurns - 1) > 1 ? ` (${debuffTurns - 1} turns)` : ''}${debuffVal ? ` (${debuffVal} dmg)` : ''}!`, 'enemy')
      }
      render()
      addTimer(() => {
        if (g.enemyWillBlock) {
          g.enemy!.isBlocking += g.enemy!.def
          logMsg(`${g.enemy!.name} braces for impact! (+${g.enemy!.def} block)`, 'enemy')
          render()
          addTimer(() => enemyStrike(strikesTotal), 1200)
        } else {
          enemyStrike(strikesTotal)
        }
      }, 1200)
      return
    }
    // Use pre-rolled block decision
    if (g.enemyWillBlock) {
      g.enemy.isBlocking += g.enemy.def
      logMsg(`${g.enemy.name} braces for impact! (+${g.enemy.def} block)`, 'enemy')
      render()
      addTimer(() => enemyStrike(strikesTotal), 1200)
    } else {
      enemyStrike(strikesTotal)
    }
  }

  function enemyStrike(remaining: number) {
    const g = gsRef.current
    if (!g.enemy || g.enemy.hp <= 0) return
    let atk = g.enemy.atk
    if (g.enemy.isBoss && g.enemy.phaseIdx >= 1) atk += BOSS_DATA.phases[1].atkBonus
    const preRolled = g.enemyNextDmgs.shift()
    const baseDmg = preRolled != null && preRolled > 0 ? preRolled : calcDmg(atk, getPlayerDef(g.player), 0).dmg
    // Player block absorbs damage, leftover carries to next strike
    const absorbed = Math.min(g.isBlocking, baseDmg)
    g.isBlocking = Math.max(0, g.isBlocking - baseDmg)
    const dmg = Math.max(0, baseDmg - absorbed)
    g.player.hp = Math.max(0, g.player.hp - dmg)
    g.enemyAnimKey = 'attack'
    g.enemyAnimSeq++
    g.playerAnimKey = 'hit'
    g.playerAnimSeq++
    addFloatDmg('player', dmg, '#ffb4ab')
    logMsg(`${g.enemy.name} hits Seppo for ${dmg}!${absorbed > 0 ? ` (Blocked ${absorbed})` : ''}`, 'enemy')
    // Trait: cult_leader_drain — heal on hit
    if (hasTrait(g.enemy, 'cult_leader_drain') && dmg > 0) {
      const drainHeal = Math.round(dmg * 0.2)
      g.enemy.hp = Math.min(g.enemy.maxHp, g.enemy.hp + drainHeal)
      logMsg(`${g.enemy.name} drains ${drainHeal} HP from the hit!`, 'enemy')
    }
    // Trait: tazer — 25% chance to stun player for 1 turn (skip next player turn)
    if (hasTrait(g.enemy, 'tazer') && dmg > 0 && Math.random() < 0.25) {
      g.player.hp = Math.max(0, g.player.hp)
      logMsg(`${g.enemy.name} tazes Seppo! Stunned for 1 turn!`, 'enemy')
      // Stun effect: reduce player actions to 0 at end of enemy turn
      g.enemyTazedPlayer = true
    }
    // Trait: self_sacrifice — during basement boss (level 5), cult members heal the boss
    // (Simulated: enemy heals itself representing cult member sacrifice)
    if (hasTrait(g.enemy, 'cult_leader_drain') && g.currentLevel === 5 && g.enemy.isBoss && g.enemy.hp < g.enemy.maxHp * 0.5 && Math.random() < 0.35) {
      const sacrificeHeal = Math.round(g.enemy.maxHp * 0.08)
      g.enemy.hp = Math.min(g.enemy.maxHp, g.enemy.hp + sacrificeHeal)
      logMsg(`A Cult Member sacrifices themselves! ${g.enemy.name} heals ${sacrificeHeal} HP!`, 'enemy')
    }
    // Thorns buff: reflect damage back to enemy
    const thornsBuff = g.player.buffs.find(buf => buf.type === 'thorns' && buf.turns > 0)
    if (thornsBuff && dmg > 0 && g.enemy.hp > 0) {
      const thornsDmg = thornsBuff.val
      g.enemy.hp = Math.max(0, g.enemy.hp - thornsDmg)
      addFloatDmg('enemy', thornsDmg, '#ce93d8')
      logMsg(`Thorns: ${g.enemy.name} takes ${thornsDmg} reflected damage!`, 'player')
      if (g.enemy.hp <= 0) {
        g.enemyAnimKey = 'death'; g.enemyAnimSeq++
        render()
        const eda = g.enemy.anims.death
        addTimer(() => endBattle(true), Math.round(eda.frames / eda.fps * 1000) + 1200)
        return
      }
    }
    if (remaining === 1) {
      tickBuffs()
      // Poison damage on player at end of enemy turn
      applyPoison(g.player.debuffs, 'Seppo', true)
      // Tick player debuffs
      tickDebuffs(g.player.debuffs, 'Seppo')
    }
    if (g.player.hp <= 0) {
      g.playerAnimKey = 'death'
      g.playerAnimSeq++
      render()
      const deathAnim = (g.playerAnimSet === 'east' ? SEPPO_ANIMS_EAST : SEPPO_ANIMS_SOUTH).death
      const deathDuration = Math.round(deathAnim.frames / deathAnim.fps * 1000) + 1200
      addTimer(() => endBattle(false), deathDuration)
      return
    }
    render()
    if (remaining > 1) {
      // More enemy strikes to go
      addTimer(() => {
        enemyStrike(remaining - 1)
      }, 1200)
    } else {
      // Enemy turn done — give control back to player
      addTimer(() => {
        const g2 = gsRef.current
        // Trait: tazer stun — skip player turn
        if (g2.enemyTazedPlayer) {
          g2.enemyTazedPlayer = false
          logMsg('Seppo is stunned — loses turn!', 'system')
          g2.battleLocked = true
          render()
          addTimer(() => {
            rollEnemyDmg()
            enemyTurn()
          }, 1500)
          return
        }
        g2.actionsLeft = PLAYER_ACTIONS
        // Desperation relic: extra action when below 30% HP
        if (hasRelic(g2.player, 'desperation') && g2.player.hp <= g2.player.maxHp * 0.3) {
          g2.actionsLeft++
        }
        g2.battleLocked = false
        // Player block resets when player turn starts
        g2.isBlocking = 0
        // Regen buff: heal at start of player turn
        const regenBuff = g2.player.buffs.find(buf => buf.type === 'regen' && buf.turns > 0)
        if (regenBuff) {
          const heal = Math.min(regenBuff.val, g2.player.maxHp - g2.player.hp)
          if (heal > 0) {
            g2.player.hp += heal
            addFloatDmg('player', heal, '#66bb6a')
            logMsg(`Regen: +${heal} HP`, 'item')
          }
        }
        // Enemy block persists — player attacks deplete it
        rollEnemyDmg()
        render()
      }, 1200)
    }
  }

  /* ── Overlay Triggers ─────────────────────── */

  function triggerVictory() {
    const g = gsRef.current
    const elapsed = Date.now() - g.runStartTime
    const stats = g.runStats
    const enemyScore = stats.enemiesDefeated.reduce((sum, e) => sum + e.xp * 5, 0)
    const beerScore = stats.beersDrunk * 50
    const total = enemyScore + beerScore + stats.totalDmgDealt
    clearSavedRun()
    g.overlay = {
      type: 'victory', title: 'Victory',
      body: { elapsed, stats, enemyScore, beerScore, total },
      btnText: 'Back to Menu',
      onBtn: () => returnToMenu(), showBtn: true,
    }
    onRunEndRef.current?.({
      level: g.currentLevel, won: true, score: total, kills: stats.enemiesDefeated.length,
      elapsed, dmgDealt: stats.totalDmgDealt, beersDrunk: stats.beersDrunk,
      enemyNames: stats.enemiesDefeated.map(e => e.name),
    })
    render()
  }

  function triggerGameOver() {
    clearSavedRun()
    const g = gsRef.current
    const elapsed = Date.now() - g.runStartTime
    const stats = g.runStats
    const enemyScore = stats.enemiesDefeated.reduce((sum, e) => sum + e.xp * 5, 0)
    const beerScore = stats.beersDrunk * 50
    const total = enemyScore + beerScore + stats.totalDmgDealt
    g.overlay = {
      type: 'game-over', title: 'Defeated',
      body: { elapsed, stats, enemyScore, beerScore, total },
      btnText: 'Back to Menu',
      onBtn: () => returnToMenu(), showBtn: true,
    }
    onRunEndRef.current?.({
      level: g.currentLevel, won: false, score: total, kills: stats.enemiesDefeated.length,
      elapsed, dmgDealt: stats.totalDmgDealt, beersDrunk: stats.beersDrunk,
      enemyNames: stats.enemiesDefeated.map(e => e.name),
    })
    render()
  }

  function triggerLevelComplete() {
    const g = gsRef.current
    const healHp = Math.round(g.player.maxHp * 0.25)
    g.player.hp = Math.min(g.player.maxHp, g.player.hp + healHp)
    const bonusItems = 2 + g.currentLevel
    const gained: string[] = []
    for (let i = 0; i < bonusItems; i++) {
      gained.push(dropItem().name)
    }
    logMsg(`Level clear loot: ${gained.join(', ')}!`, 'item')
    const nextLv = g.currentLevel + 1
    g.overlay = {
      type: 'level-complete',
      title: `${LEVEL_NAMES[g.currentLevel]} — Clear!`,
      body: { healHp, nextLv },
      btnText: 'Continue',
      onBtn: () => showUpgradeScreen(nextLv),
      showBtn: true,
    }
    render()
  }

  function showUpgradeScreen(nextLv: number) {
    const g = gsRef.current
    const pool = [...UPGRADES]
    const picks: Upgrade[] = []
    while (picks.length < 3 && pool.length) {
      const idx = Math.floor(Math.random() * pool.length)
      picks.push(pool.splice(idx, 1)[0])
    }
    g.overlay = {
      type: 'upgrade',
      title: 'Choose an Upgrade',
      body: { nextLv, nextName: LEVEL_NAMES[nextLv] || '???' },
      btnText: '',
      onBtn: () => {},
      showBtn: false,
      choices: picks,
    }
    render()
  }

  function showExplore() {
    const g = gsRef.current
    g.phase = 'map'
    g.subMenuType = null
    g.playerAnimSet = 'south'
    g.playerAnimKey = 'idle'
    g.playerAnimSeq++
    g.enemy = null
    saveRunToStorage(g)
  }

  /* ════════ Public Actions ════════ */

  function returnToMenu() {
    clearSavedRun()
    const fresh = createInitialState()
    fresh.playerAnimSeq = (gsRef.current.playerAnimSeq || 0) + 1
    Object.assign(gsRef.current, fresh)
    render()
  }

  function startGame() {
    clearSavedRun()
    preloadAllAnims()
    const fresh = createInitialState()
    fresh.phase = 'intro'
    fresh.overlay = null
    fresh.playerAnimKey = 'idle'
    fresh.playerAnimSeq = (gsRef.current.playerAnimSeq || 0) + 1
    fresh.playerAnimSet = 'south'
    fresh.levelRoutes = generateAllRoutes()
    Object.assign(gsRef.current, fresh)
    gsRef.current.runStartTime = Date.now()
    // Show relic choice before starting
    showRelicChoice('start')
    render()
  }

  function resumeGame() {
    const saved = loadSavedRun()
    if (!saved) return
    preloadAllAnims()
    const fresh = createInitialState()
    Object.assign(gsRef.current, fresh)
    const g = gsRef.current
    g.player = saved.player
    g.currentLevel = saved.currentLevel
    g.currentRound = saved.currentRound
    g.levelRoutes = saved.levelRoutes
    g.chosenRoute = saved.chosenRoute
    g.routeNodeIdx = saved.routeNodeIdx
    g.runStartTime = Date.now() - saved.elapsedMs
    g.runStats = saved.runStats
    g.nextIdCounter = saved.nextIdCounter
    g.phase = 'map'
    g.overlay = null
    g.enemy = null
    g.inBattle = false
    logMsg('Run resumed — pick up where you left off!', 'system')
    render()
  }

  function showRelicChoice(context: 'start' | 'treasure' | 'elite') {
    const g = gsRef.current
    const unlockedRelics = filterUnlocked(RELICS)
    const picks = context === 'start'
      ? pickRelics(3, 'common', unlockedRelics)
      : context === 'elite'
        ? (() => {
            const pool = unlockedRelics.filter(r => r.rarity === 'common' || r.rarity === 'uncommon')
            const remaining = [...pool]
            const p: typeof pool = []
            while (p.length < 3 && remaining.length) {
              const idx = Math.floor(Math.random() * remaining.length)
              p.push(remaining.splice(idx, 1)[0])
            }
            return p
          })()
        : pickRelicsByRarity(3, unlockedRelics)
    // Filter out relics player already has
    const available = picks.filter(r => !hasRelic(g.player, r.id))
    g.overlay = {
      type: 'relic-choice',
      title: context === 'start' ? 'Choose a Starting Relic' : context === 'elite' ? 'Elite Loot — Choose a Relic' : 'Treasure Found!',
      body: { context },
      btnText: '',
      onBtn: () => {},
      showBtn: false,
      choices: available as any,
    }
    render()
  }

  function applyRelicChoice(relicId: string) {
    const g = gsRef.current
    const relic = RELICS.find(r => r.id === relicId)
    if (!relic) return
    g.player.relics.push(relic)
    logMsg(`Relic acquired: ${relic.name} — ${relic.desc}`, 'item')
    // Apply immediate stat relics
    applyRelicStats(g.player, relic)
    const wasStart = !g.levelRoutes.length || g.phase === 'intro'
    g.overlay = null

    // Elite relic choice — use stored continuation
    if (g.afterRelicChoice) {
      const cb = g.afterRelicChoice
      g.afterRelicChoice = null
      cb()
      return
    }

    // Check if this was the start relic
    if (wasStart) {
      g.phase = 'map'
      logMsg(`— ${LEVEL_NAMES[0]} — Choose your route!`, 'system')
      logMsg('Seppo raided the office fridge for every afterwork beer. Then he told the boss his new project processes are stupid. Now he\'s fired.', 'system')
      saveRunToStorage(g)
    } else {
      // Treasure relic — continue exploring
      const route = getCurrentRoute()
      if (route && g.routeNodeIdx >= 0 && g.routeNodeIdx < route.length) {
        route[g.routeNodeIdx].done = true
      }
      g.routeNodeIdx++
      g.currentRound++
      if (route && g.routeNodeIdx >= route.length) {
        const bossType = levelBossType(g.currentLevel)
        if (bossType) {
          if (!showLevelUpChoice()) showExplore()
          else { g.afterLevelUp = () => showExplore() }
        } else {
          if (!showLevelUpChoice()) triggerLevelComplete()
          else { g.afterLevelUp = () => triggerLevelComplete() }
        }
      } else {
        if (!showLevelUpChoice()) showExplore()
        else { g.afterLevelUp = () => showExplore() }
      }
    }
    render()
  }

  function applyRelicStats(p: Player, relic: Relic) {
    switch (relic.id) {
      case 'bonus_hp':      p.maxHp += 10; p.hp = Math.min(p.hp + 10, p.maxHp); break
      case 'bonus_atk':     p.baseAtk += 5; break
      case 'bonus_def':     p.baseDef += 5; break
      case 'bonus_hp_unc':  p.maxHp += 15; p.hp = Math.min(p.hp + 15, p.maxHp); break
      case 'bonus_atk_unc': p.baseAtk += 10; break
      case 'bonus_def_unc': p.baseDef += 10; break
      case 'glass_cannon':  p.baseAtk += 25; { const loss = Math.round(p.maxHp * 0.3); p.maxHp -= loss; p.hp = Math.min(p.hp, p.maxHp) }; break
    }
  }

  function getCurrentRoute(): LevelRoute | null {
    const g = gsRef.current
    if (g.chosenRoute == null || !g.levelRoutes[g.currentLevel]) return null
    return g.levelRoutes[g.currentLevel][g.chosenRoute] ?? null
  }

  function chooseRoute(routeIdx: number) {
    const g = gsRef.current
    g.chosenRoute = routeIdx
    g.routeNodeIdx = 0
    const route = g.levelRoutes[g.currentLevel][routeIdx]
    logMsg(`Route chosen — ${route.length} stops ahead.`, 'system')
    render()
  }

  function explore() {
    const g = gsRef.current
    const route = getCurrentRoute()
    if (!route) return

    // routeNodeIdx === route.length means shared boss end node
    if (g.routeNodeIdx >= route.length) {
      const bossType = levelBossType(g.currentLevel)
      if (!bossType) return
      if (bossType === 'boss_first') {
        spawnIsmoFirstFight()
        logMsg(`${g.enemy!.name} blocks the exit — ${g.enemy!.lore}`, 'enemy')
      } else {
        logMsg('A familiar management voice cuts through the bar noise. It\'s time.', 'system')
        spawnEnemy(true)
      }
      render()
      return
    }
    const node = route[g.routeNodeIdx]

    if (node.type === 'rest') {
      // Rest: heal 40% maxHP (55% with Power Nap relic), consume 1 buff turn
      const restPct = hasRelic(g.player, 'rest_bonus') ? 0.55 : 0.4
      const healAmt = Math.round(g.player.maxHp * restPct)
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + healAmt)
      logMsg(`Seppo finds a quiet spot and rests. +${healAmt} HP.`, 'system')
      for (let i = g.player.buffs.length - 1; i >= 0; i--) {
        const buf = g.player.buffs[i]
        if (buf.turns > 0 && buf.turns < 999) {
          buf.turns--
          if (buf.turns === 0) {
            logMsg(`${buf.name} wore off during rest.`, 'system')
            g.player.buffs.splice(i, 1)
          }
        }
      }
      if (g.player.pilsnerTurns > 0 && g.player.pilsnerTurns < 999) g.player.pilsnerTurns--
      // Mark done & advance
      route[g.routeNodeIdx].done = true
      g.routeNodeIdx++
      g.currentRound++
      if (g.routeNodeIdx >= route.length) {
        const bossType = levelBossType(g.currentLevel)
        if (bossType) {
          // Route nodes done — boss still awaits, go to map
          if (!showLevelUpChoice()) showExplore()
          else { g.afterLevelUp = () => showExplore() }
        } else {
          if (!showLevelUpChoice()) triggerLevelComplete()
          else { g.afterLevelUp = () => triggerLevelComplete() }
        }
      }
      g.playerAnimKey = 'drink'
      g.playerAnimSeq++
      render()
    } else if (node.type === 'treasure') {
      // Treasure node — show relic choice
      logMsg('Seppo finds a hidden stash!', 'item')
      if (hasRelic(g.player, 'treasure_heal')) {
        g.player.hp = Math.min(g.player.maxHp, g.player.hp + 10)
        logMsg('Scavenger\'s Charm: +10 HP', 'item')
      }
      // Give some items too
      const d = dropItem()
      logMsg(`Found ${d.name}!`, 'item')
      showRelicChoice('treasure')
      render()
    } else if (node.type === 'shop') {
      // Shop node — generate random inventory and switch to shop phase
      logMsg('Seppo spots a dodgy kiosk. Time to spend some coins.', 'system')
      const shopBeerPool = buildShopCardPool(filterUnlocked(BEERS), g.currentLevel)
      const shopFoodPool = buildShopCardPool(filterUnlocked(FOODS), g.currentLevel)
      const shopBeers = pickRandom(shopBeerPool, 3)
      const shopFoods = pickRandom(shopFoodPool, 2)
      const availRelics = filterUnlocked(RELICS).filter(r => !hasRelic(g.player, r.id))
      const shopRelics = pickRandom(availRelics.map(r => r.id), 2)
      const maxAtk = [9, 15, 21, 27, 35, 40, 54, 54][g.currentLevel] ?? 54
      const weaponPool = filterUnlocked(WEAPONS).filter(w => w.atk <= maxAtk && (!g.player.weapon || w.atk > g.player.weapon.atk))
      const shopWeapon = weaponPool.length ? weaponPool[Math.floor(Math.random() * weaponPool.length)].id : null
      const prices = buildShopPrices(shopBeers, shopFoods, shopRelics, shopWeapon)
      g.shopInventory = { beers: shopBeers, foods: shopFoods, relics: shopRelics, weapon: shopWeapon, _origRelics: [...shopRelics], _origWeapon: shopWeapon, prices }
      g.phase = 'shop'
      render()
    } else if (node.type === 'mystery') {
      // Mystery node — resolve randomly into fight, shop, treasure, or event
      const roll = Math.random()
      if (roll < 0.20) {
        // Normal fight
        node.type = 'fight'
        logMsg('The mystery reveals... a fight!', 'enemy')
        spawnEnemy(false, false)
        logMsg(`${g.enemy!.name} steps out of the shadows — ${g.enemy!.lore}`, 'enemy')
      } else if (roll < 0.45) {
        // Shop
        node.type = 'shop'
        logMsg('The mystery reveals... a shop!', 'system')
        const shopBeers = pickRandom(buildShopCardPool(filterUnlocked(BEERS), g.currentLevel), 3)
        const shopFoods = pickRandom(buildShopCardPool(filterUnlocked(FOODS), g.currentLevel), 2)
        const availRelics = filterUnlocked(RELICS).filter(r => !hasRelic(g.player, r.id))
        const shopRelics = pickRandom(availRelics.map(r => r.id), 2)
        const maxAtk = [9, 15, 21, 27, 35, 40, 54, 54][g.currentLevel] ?? 54
        const weaponPool = filterUnlocked(WEAPONS).filter(w => w.atk <= maxAtk && (!g.player.weapon || w.atk > g.player.weapon.atk))
        const shopWeapon = weaponPool.length ? weaponPool[Math.floor(Math.random() * weaponPool.length)].id : null
        const prices = buildShopPrices(shopBeers, shopFoods, shopRelics, shopWeapon)
        g.shopInventory = { beers: shopBeers, foods: shopFoods, relics: shopRelics, weapon: shopWeapon, _origRelics: [...shopRelics], _origWeapon: shopWeapon, prices }
        g.phase = 'shop'
      } else if (roll < 0.70) {
        // Treasure
        node.type = 'treasure'
        logMsg('The mystery reveals... treasure!', 'item')
        if (hasRelic(g.player, 'treasure_heal')) {
          g.player.hp = Math.min(g.player.maxHp, g.player.hp + 10)
          logMsg('Scavenger\'s Charm: +10 HP', 'item')
        }
        const d = dropItem()
        logMsg(`Found ${d.name}!`, 'item')
        showRelicChoice('treasure')
      } else {
        // Event
        logMsg('Something strange catches Seppo\'s eye...', 'system')
        triggerRandomEvent()
      }
      render()
    } else {
      // fight or elite
      const isElite = node.type === 'elite'
      spawnEnemy(false, isElite)
      logMsg(`${g.enemy!.name} steps out of the shadows — ${g.enemy!.lore}`, isElite ? 'skill' : 'enemy')
    }
    render()
  }

  function pickRandom<T>(arr: T[], count: number): T[] {
    const pool = [...arr]
    const picks: T[] = []
    while (picks.length < count && pool.length) {
      const idx = Math.floor(Math.random() * pool.length)
      picks.push(pool.splice(idx, 1)[0])
    }
    return picks
  }

  /** Build a pool of card IDs for the shop, weighted by level → higher levels stock better rarities */
  function buildShopCardPool(items: { id: string; rarity?: string }[], level: number): string[] {
    const ids: string[] = []
    for (const item of items) {
      const r = item.rarity || 'common'
      if (r === 'common') { ids.push(item.id); continue }
      // Uncommon: available from level 1 onward (20% + 8%/level)
      if (r === 'uncommon' && Math.random() < Math.min(0.20 + level * 0.08, 0.65)) { ids.push(item.id); continue }
      // Rare: available from level 3 onward (5% + 5%/level)
      if (r === 'rare' && level >= 3 && Math.random() < Math.min(0.05 + level * 0.05, 0.35)) { ids.push(item.id); continue }
    }
    // Ensure at least some common items are always available
    if (!ids.length) return items.filter(i => !i.rarity || i.rarity === 'common').map(i => i.id)
    return ids
  }

  /** Randomize shop prices ±30% for all items in the inventory */
  function buildShopPrices(beers: string[], foods: string[], relics: string[], weapon: string | null): Record<string, number> {
    const rand = (base: number) => Math.round(base * (0.7 + Math.random() * 0.6))
    const prices: Record<string, number> = {}
    for (const id of beers) {
      const b = BEERS.find(b => b.id === id)
      const base = SHOP_PRICES[b?.tier ?? 1] ?? 30
      const mult = RARITY_SHOP_MULT[b?.rarity || 'common']
      prices[id] = rand(Math.round(base * mult))
    }
    for (const id of foods) {
      const f = FOODS.find(f => f.id === id)
      const base = SHOP_PRICES[f?.tier ?? 1] ?? 30
      const mult = RARITY_SHOP_MULT[f?.rarity || 'common']
      prices[id] = rand(Math.round(base * mult))
    }
    for (const id of relics) {
      const r = RELICS.find(r => r.id === id)
      prices[id] = rand(RELIC_SHOP_PRICES[r?.rarity ?? 'common'])
    }
    if (weapon) prices[weapon] = rand(WEAPON_SHOP_PRICE)
    return prices
  }

  function buyItem(itemId: string, type: 'beer' | 'food' | 'relic' | 'weapon') {
    const g = gsRef.current
    const shopPrices = g.shopInventory?.prices ?? {}
    if (type === 'beer') {
      const item = BEERS.find(b => b.id === itemId)
      if (!item) return
      const base = Math.round((SHOP_PRICES[item.tier] ?? 30) * RARITY_SHOP_MULT[item.rarity || 'common'])
      const price = shopPrices[itemId] ?? base
      if (g.player.coins < price) { logMsg(`Not enough coins! Need ${price}.`, 'system'); render(); return }
      g.player.coins -= price
      g.player.beers[itemId] = (g.player.beers[itemId] || 0) + 1
      logMsg(`Bought ${item.name} for ${price} coins.`, 'item')
    } else if (type === 'food') {
      const item = FOODS.find(f => f.id === itemId)
      if (!item) return
      const base = Math.round((SHOP_PRICES[item.tier] ?? 30) * RARITY_SHOP_MULT[item.rarity || 'common'])
      const price = shopPrices[itemId] ?? base
      if (g.player.coins < price) { logMsg(`Not enough coins! Need ${price}.`, 'system'); render(); return }
      g.player.coins -= price
      g.player.foods[itemId] = (g.player.foods[itemId] || 0) + 1
      logMsg(`Bought ${item.name} for ${price} coins.`, 'item')
    } else if (type === 'relic') {
      const relic = RELICS.find(r => r.id === itemId)
      if (!relic || hasRelic(g.player, itemId)) return
      const price = shopPrices[itemId] ?? RELIC_SHOP_PRICES[relic.rarity]
      if (g.player.coins < price) { logMsg(`Not enough coins! Need ${price}.`, 'system'); render(); return }
      g.player.coins -= price
      g.player.relics.push(relic)
      applyRelicStats(g.player, relic)
      logMsg(`Bought relic: ${relic.name} for ${price} coins.`, 'item')
      if (g.shopInventory) g.shopInventory.relics = g.shopInventory.relics.filter(id => id !== itemId)
    } else if (type === 'weapon') {
      const weapon = WEAPONS.find(w => w.id === itemId)
      if (!weapon) return
      const price = shopPrices[itemId] ?? WEAPON_SHOP_PRICE
      if (g.player.coins < price) { logMsg(`Not enough coins! Need ${price}.`, 'system'); render(); return }
      g.player.coins -= price
      g.player.weapon = { ...weapon }
      logMsg(`Bought ${weapon.name} (+${weapon.atk} ATK) for ${price} coins.`, 'item')
      if (g.shopInventory) g.shopInventory.weapon = null
    }
    render()
  }

  function leaveShop() {
    const g = gsRef.current
    const route = getCurrentRoute()
    if (route && g.routeNodeIdx >= 0 && g.routeNodeIdx < route.length) {
      route[g.routeNodeIdx].done = true
    }
    g.routeNodeIdx++
    g.currentRound++
    if (route && g.routeNodeIdx >= route.length) {
      const bossType = levelBossType(g.currentLevel)
      if (bossType) {
        if (!showLevelUpChoice()) showExplore()
        else { g.afterLevelUp = () => showExplore() }
      } else {
        if (!showLevelUpChoice()) triggerLevelComplete()
        else { g.afterLevelUp = () => triggerLevelComplete() }
      }
    } else {
      if (!showLevelUpChoice()) showExplore()
      else { g.afterLevelUp = () => showExplore() }
    }
    render()
  }

  function fightShopkeeper() {
    const g = gsRef.current
    const b = SHOPKEEPER_FIGHT_DATA
    const scale = 1 + (g.player.level - 1) * 0.12
    const eliteScale = 1.5
    g.coinsBeforeShopFight = g.player.coins
    g.isShopkeeperFight = true
    g.enemy = {
      name: `★ ${b.name}`, portrait: b.portrait,
      hp: Math.round(b.hp * scale * eliteScale), maxHp: Math.round(b.hp * scale * eliteScale),
      atk: Math.round(b.atk * scale * eliteScale), def: Math.round(b.def * scale * eliteScale),
      xp: 0, loot: 0, stun: 0, isBlocking: 0,
      isElite: true, isBoss: false, phaseIdx: 0,
      anims: b.anims, lore: b.lore, debuffs: [], traits: [],
    }
    g.inBattle = true
    g.battleLocked = false
    g.actionsLeft = PLAYER_ACTIONS
    g.runStats.currentFightDmg = 0
    g.phase = 'battle'
    g.subMenuType = null
    g.playerAnimSet = 'east'
    g.playerAnimKey = 'idle'
    g.playerAnimSeq++
    g.enemyAnimKey = 'idle'
    g.enemyAnimSeq++
    rollEnemyDmg()
    initCombatRelics()
    logMsg(`You challenged the Shopkeeper! Fight!`, 'enemy')
    render()
  }

  function spawnIsmoFirstFight() {
    const g = gsRef.current
    const b = ISMO_FIRST_FIGHT
    g.enemy = {
      name: b.name, portrait: b.portrait,
      hp: b.hp, maxHp: b.hp,
      atk: b.atk, def: b.def, xp: b.xp,
      loot: b.loot, stun: 0, isBlocking: 0, isElite: false, isBoss: false, phaseIdx: 0,
      anims: b.anims, lore: b.lore, debuffs: [], traits: b.traits || [],
    }
    g.inBattle = true
    g.battleLocked = false
    g.actionsLeft = PLAYER_ACTIONS
    g.runStats.currentFightDmg = 0
    g.phase = 'battle'
    g.subMenuType = null
    g.playerAnimSet = 'east'
    g.playerAnimKey = 'idle'
    g.playerAnimSeq++
    g.enemyAnimKey = 'idle'
    g.enemyAnimSeq++
    rollEnemyDmg()
    initCombatRelics()
  }

  function spawnEnemy(isBoss: boolean, isElite = false) {
    const g = gsRef.current
    if (isBoss) {
        // Select boss for current level if available
        const bossData = g.currentLevel === 1 ? PARK_BOSS_DATA : g.currentLevel === 2 ? STREET_BOSS_DATA : g.currentLevel === 3 ? BAR_BOSS_DATA : g.currentLevel === 4 ? CHURCH_BOSS_DATA : g.currentLevel === 5 ? BASEMENT_BOSS_DATA : g.currentLevel === 6 ? MEADOW_BOSS_DATA : g.currentLevel === 7 ? HELL_BOSS_DATA : BOSS_DATA
        const bossScale = 1 + (g.player.level - 1) * 0.08
        g.enemy = {
          name: bossData.name, portrait: bossData.portrait || 'assets/characters/ismo/rotations/south.png',
          hp: Math.round(bossData.hp * bossScale), maxHp: Math.round(bossData.hp * bossScale),
          atk: Math.round(bossData.atk * bossScale), def: Math.round(bossData.def * bossScale), xp: bossData.xp,
          loot: bossData.loot || 0, stun: 0, isBlocking: 0, isElite: false, isBoss: true, phaseIdx: 0,
          anims: bossData.anims || ISMO_ANIMS, lore: bossData.lore, debuffs: [], traits: ('traits' in bossData ? bossData.traits : []) as EnemyTrait[],
        }
        logMsg(`${bossData.name} appears — this is your boss fight.`, 'enemy')
    } else {
      const pool = LEVEL_ENEMIES[g.currentLevel]
      const base = pool[Math.floor(Math.random() * pool.length)]
      const scale = 1 + (g.player.level - 1) * 0.12
      const eliteScale = isElite ? 1.5 : 1
      let name = base.name
      if (base.randomNames?.length) {
        name = base.randomNames[Math.floor(Math.random() * base.randomNames.length)]
      } else if (base.randomName) {
        const names = base.name === 'Consultant' ? CONSULTANT_TITLES : BLACK_METAL_NAMES
        name = names[Math.floor(Math.random() * names.length)]
      }
      if (isElite) name = `★ ${name}`
      g.enemy = {
        name, portrait: base.portrait,
        hp: Math.round(base.hp * scale * eliteScale), maxHp: Math.round(base.hp * scale * eliteScale),
        atk: Math.round(base.atk * scale * eliteScale), def: Math.round(base.def * scale * eliteScale),
        xp: Math.round(base.xp * (isElite ? 2 : 1)), loot: Math.min(1, base.loot * (isElite ? 2 : 1)),
        stun: 0, isBlocking: 0, isElite, isBoss: false, phaseIdx: 0,
        anims: base.anims, lore: base.lore, debuffs: [], traits: base.traits || [],
      }
    }
    g.inBattle = true
    g.battleLocked = false
    g.actionsLeft = PLAYER_ACTIONS
    g.runStats.currentFightDmg = 0
    g.phase = 'battle'
    g.subMenuType = null
    g.playerAnimSet = 'east'
    g.playerAnimKey = 'idle'
    g.playerAnimSeq++
    g.enemyAnimKey = 'idle'
    g.enemyAnimSeq++
    rollEnemyDmg()
    initCombatRelics()
  }

  /** Reset per-fight relic counters and apply start-of-combat relics */
  function initCombatRelics() {
    const g = gsRef.current
    const p = g.player
    p.beersThisFight = 0
    p.attackCount = 0
    p.debuffs = []
    // overkill relic: log the carried bonus (will be consumed after this fight)
    if (p.overkillBonus > 0 && hasRelic(p, 'overkill')) {
      logMsg(`Overkill bonus: +${p.overkillBonus} ATK this fight!`, 'item')
    } else {
      p.overkillBonus = 0
    }
    // beer_start: apply a random beer effect at fight start
    if (hasRelic(p, 'beer_start')) {
      const randomBeer = BEERS[Math.floor(Math.random() * BEERS.length)]
      const lvScale = 1 + (g.currentLevel * 0.3) + (p.level - 1) * 0.1
      const val = Math.round(randomBeer.val * lvScale)
      if (randomBeer.buff === 'spd') {
        p.pilsnerTurns = randomBeer.duration
      } else {
        applyBuff({ ...randomBeer, val })
      }
      logMsg(`Lucky Flask: free ${randomBeer.name} effect!`, 'item')
    }
    // desperation: if HP < 30%, get 4 actions
    if (hasRelic(p, 'desperation') && p.hp < p.maxHp * 0.3) {
      g.actionsLeft = 4
    }
    // tough_start: 10 block at combat start
    if (hasRelic(p, 'tough_start')) {
      g.isBlocking = (g.isBlocking || 0) + 10
      logMsg('Taped Fists: +10 block!', 'item')
    }
    // ── Enemy Trait initialization ──
    if (g.enemy) {
      // Helmet trait: double DEF at fight start, store original
      if (hasTrait(g.enemy, 'helmet')) {
        g.enemy.baseDef = g.enemy.def
        g.enemy.def = Math.round(g.enemy.def * 2)
        logMsg(`${g.enemy.name}'s helmet grants extra protection! (DEF ${g.enemy.def})`, 'enemy')
      }
      // Drink steal trait (after level 2): steal and consume one random player drink
      if (hasTrait(g.enemy, 'drink_steal') && g.currentLevel >= 2) {
        const drinkIds = Object.keys(p.beers).filter(id => p.beers[id] > 0)
        if (drinkIds.length > 0) {
          const stolenId = drinkIds[Math.floor(Math.random() * drinkIds.length)]
          const beer = BEERS.find(b => b.id === stolenId)
          if (beer) {
            p.beers[stolenId]--
            // Enemy "uses" the drink: heals 15% of max HP
            const heal = Math.round(g.enemy.maxHp * 0.15)
            g.enemy.hp = Math.min(g.enemy.maxHp, g.enemy.hp + heal)
            logMsg(`${g.enemy.name} steals your ${beer.name} and chugs it! (+${heal} HP)`, 'enemy')
          }
        }
      }
      // Mirror Self trait: copy a random player buff
      if (hasTrait(g.enemy, 'mirror_self') && p.buffs.length > 0) {
        const buff = p.buffs[Math.floor(Math.random() * p.buffs.length)]
        logMsg(`${g.enemy.name} mirrors your ${buff.name} buff!`, 'enemy')
        // Translate buff to enemy stat boost
        if (buff.type === 'atk') g.enemy.atk += buff.val
        else if (buff.type === 'def') g.enemy.def += buff.val
      }
      // Log traits
      for (const t of g.enemy.traits) {
        const info = TRAIT_INFO[t]
        if (info) logMsg(`${info.icon === 'skull' ? '💀' : '⚡'} ${g.enemy.name}: ${info.name} — ${info.desc}`, 'system')
      }
    }
  }

  function rest() {
    const g = gsRef.current
    const h = Math.round(g.player.maxHp * 0.25)
    g.player.hp = Math.min(g.player.maxHp, g.player.hp + h)
    logMsg(`Seppo sinks into a booth. +${h} HP.`, 'system')
    g.playerAnimKey = 'drink'
    g.playerAnimSeq++
    render()
  }

  function attack() {
    const g = gsRef.current
    if (!g.inBattle || g.battleLocked || !g.enemy) return
    g.subMenuType = null
    g.player.attackCount++
    // beer_dmg relic: +3 ATK per beer consumed this fight
    const beerDmgBonus = hasRelic(g.player, 'beer_dmg') ? g.player.beersThisFight * 3 : 0
    // first_strike relic: +10 damage on first attack of each combat
    const firstStrikeBonus = hasRelic(g.player, 'first_strike') && g.player.attackCount === 1 ? 10 : 0
    // tenth_strike relic: every 10th attack deals double
    const tenthStrike = hasRelic(g.player, 'tenth_strike') && g.player.attackCount % 10 === 0
    const pctMods = [...g.player.dmgModifiers.map(m => m.pct)]
    if (tenthStrike) pctMods.push(1.0) // +100% = double
    // Weak debuff on player: deal 25% less damage
    if (hasDebuff(g.player.debuffs, 'weak')) pctMods.push(-0.25)
    // Triple damage buff (from Karhu): consume it and apply ×3
    const tripleBuff = g.player.buffs.find(buf => buf.type === 'triple')
    const tripleMult = tripleBuff ? tripleBuff.val : 1
    if (tripleBuff) {
      g.player.buffs.splice(g.player.buffs.indexOf(tripleBuff), 1)
    }
    const effectiveAtk = getPlayerAtk(g.player) + beerDmgBonus + firstStrikeBonus
    const { dmg: rawDmgBase, crit } = calcDmg(effectiveAtk, g.enemy.def, getCritChance(g.player), pctMods)
    const rawDmgTripled = tripleMult > 1 ? Math.round(rawDmgBase * tripleMult) : rawDmgBase
    // Vulnerable debuff on enemy: take 50% more damage
    const rawDmg = hasDebuff(g.enemy.debuffs, 'vulnerable') ? Math.round(rawDmgTripled * 1.5) : rawDmgTripled
    const absorbed = Math.min(g.enemy.isBlocking, rawDmg)
    g.enemy.isBlocking = Math.max(0, g.enemy.isBlocking - rawDmg)
    const dmg = Math.max(0, rawDmg - absorbed)
    g.enemy.hp = Math.max(0, g.enemy.hp - dmg)
    g.runStats.totalDmgDealt += dmg
    g.runStats.currentFightDmg += dmg
    // lifesteal relic: heal 10% of damage dealt
    if (hasRelic(g.player, 'lifesteal') && dmg > 0) {
      const heal = Math.max(1, Math.round(dmg * 0.1))
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + heal)
    }
    // Trait: iron_body — player takes 3 recoil damage every attack
    if (hasTrait(g.enemy, 'iron_body') && dmg > 0) {
      const recoil = 3
      g.player.hp = Math.max(0, g.player.hp - recoil)
      addFloatDmg('player', recoil, '#ff8a65')
      logMsg(`Iron Body: Seppo takes ${recoil} recoil damage!`, 'enemy')
    }
    // Trait: helmet — breaks at 50% HP, DEF drops to original (50%)
    if (hasTrait(g.enemy, 'helmet') && !g.enemy.helmetBroken && g.enemy.hp <= g.enemy.maxHp * 0.5) {
      g.enemy.helmetBroken = true
      g.enemy.def = g.enemy.baseDef || Math.round(g.enemy.def * 0.5)
      logMsg(`${g.enemy.name}'s helmet shatters! DEF drops to ${g.enemy.def}!`, 'system')
    }
    g.playerAnimKey = 'attack'
    g.playerAnimSeq++
    g.enemyAnimKey = 'hit'
    g.enemyAnimSeq++
    addFloatDmg('enemy', dmg, crit ? '#ffe060' : '#ffb68c')
    logMsg(`Seppo attacks for ${dmg}${crit ? ' CRITICAL!' : ''}${tripleMult > 1 ? ` ×${tripleMult} KARHU POWER!` : ''}${tenthStrike ? ' 10TH STRIKE!' : ''}${firstStrikeBonus > 0 ? ' SUCKER PUNCH!' : ''}${absorbed > 0 ? ` (Blocked ${absorbed})` : ''}`, 'player')
    if (g.player.pilsnerTurns > 0) {
      const { dmg: rawD2, crit: c2 } = calcDmg(effectiveAtk, g.enemy.def, getCritChance(g.player), g.player.dmgModifiers.map(m => m.pct))
      const abs2 = Math.min(g.enemy.isBlocking, rawD2)
      g.enemy.isBlocking = Math.max(0, g.enemy.isBlocking - rawD2)
      const d2 = Math.max(0, rawD2 - abs2)
      g.enemy.hp = Math.max(0, g.enemy.hp - d2)
      g.runStats.totalDmgDealt += d2
      g.runStats.currentFightDmg += d2
      if (hasRelic(g.player, 'lifesteal') && d2 > 0) {
        const heal2 = Math.max(1, Math.round(d2 * 0.1))
        g.player.hp = Math.min(g.player.maxHp, g.player.hp + heal2)
      }
      logMsg(`Sahti speed strike: ${d2}${c2 ? ' CRIT!' : ''}${abs2 > 0 ? ` (Blocked ${abs2})` : ''}`, 'skill')
    }
    checkBossPhase()
    if (g.enemy.hp <= 0) {
      // Trait: bone_explosion — deal damage to player on death
      if (hasTrait(g.enemy, 'bone_explosion')) {
        const explodeDmg = Math.round(g.enemy.maxHp * 0.1)
        g.player.hp = Math.max(0, g.player.hp - explodeDmg)
        addFloatDmg('player', explodeDmg, '#ff6e40')
        logMsg(`${g.enemy.name} explodes! Seppo takes ${explodeDmg} damage!`, 'enemy')
      }
      // Overkill relic: store excess damage as bonus ATK for next fight
      if (hasRelic(g.player, 'overkill')) {
        const excess = Math.abs(g.enemy.hp)
        g.player.overkillBonus = excess
        logMsg(`Overkill! +${excess} bonus ATK next fight.`, 'item')
      }
      g.enemyAnimKey = 'death'
      g.enemyAnimSeq++
      render()
      const enemyDeathAnim = g.enemy.anims.death
      const enemyDeathDuration = Math.round(enemyDeathAnim.frames / enemyDeathAnim.fps * 1000) + 1200
      addTimer(() => endBattle(true), enemyDeathDuration)
      return
    }
    g.actionsLeft--
    render()
    if (g.actionsLeft <= 0) { endPlayerTurn() }
  }

  /** Called when player turn ends — applies auto_block relic and starts enemy turn */
  function endPlayerTurn() {
    const g = gsRef.current
    // auto_block relic: if no block was used, gain 6 block
    if (hasRelic(g.player, 'auto_block') && g.isBlocking === 0) {
      g.isBlocking = 6
      logMsg('Stone Skin Amulet: +6 block!', 'item')
    }
    // desperation check for next turn
    g.battleLocked = true
    render()
    addTimer(() => enemyTurn(), 1800)
  }

  function block() {
    const g = gsRef.current
    if (!g.inBattle || g.battleLocked || !g.enemy) return
    g.subMenuType = null
    let blockGain = getPlayerBlock(g.player)
    // Frail debuff: block gained reduced by 25%
    if (hasDebuff(g.player.debuffs, 'frail')) blockGain = Math.round(blockGain * 0.75)
    g.isBlocking += blockGain
    logMsg(`Seppo braces for impact! (+${blockGain} block, total ${g.isBlocking})`, 'player')
    g.actionsLeft--
    render()
    if (g.actionsLeft <= 0) { endPlayerTurn() }
  }

  function drinkBeer(id: string) {
    const g = gsRef.current
    if (g.inBattle && g.battleLocked) return
    const b = BEERS.find(b => b.id === id)
    if (!b || (g.player.beers[id] || 0) <= 0) return
    g.player.beers[id]--
    g.usedCount++
    g.runStats.beersDrunk++
    g.player.beersThisFight++
    const lvScale = 1 + (g.currentLevel * 0.3) + (g.player.level - 1) * 0.1
    let scaledVal = Math.round(b.val * lvScale)
    // triple_beer relic: every 3rd beer gives double effect
    const isTriple = hasRelic(g.player, 'triple_beer') && g.player.beersThisFight % 3 === 0
    if (isTriple) scaledVal *= 2
    // perma_beer relic: 50% effect but permanent (duration = 999)
    const permaBeer = hasRelic(g.player, 'perma_beer')
    if (permaBeer) scaledVal = Math.round(scaledVal * 0.5)
    const duration = permaBeer ? 999 : b.duration
    if (b.buff === 'cleanse') {
      // Remove all debuffs
      g.player.debuffs = []
      // Immunity: uncommon = 1 turn, rare = 2 turns
      const immuneTurns = b.rarity === 'rare' ? 2 : b.rarity === 'uncommon' ? 1 : 0
      if (immuneTurns > 0) {
        applyBuff({ buff: 'cleanse', val: 0, duration: immuneTurns, name: b.name })
        logMsg(`${b.name}: Debuffs purged + ${immuneTurns}t immunity!${isTriple ? ' (×2!)' : ''}`, 'item')
      } else {
        logMsg(`${b.name}: All debuffs purged!${isTriple ? ' (×2!)' : ''}`, 'item')
      }
    } else if (b.buff === 'actions') {
      // Instant: grant extra actions this turn
      if (g.inBattle) {
        g.actionsLeft += b.val
        logMsg(`${b.name}: +${b.val} actions this turn!${isTriple ? ' (×2!)' : ''}`, 'item')
      } else {
        logMsg(`${b.name}: Wasted outside combat... still tastes good.`, 'item')
      }
    } else if (b.buff === 'triple') {
      // Mark next attack as ×3 damage
      g.player.buffs.push({ type: 'triple', val: b.val, turns: 999, name: b.name })
      logMsg(`${b.name}: Next attack deals ×${b.val} damage!${isTriple ? ' (×2!)' : ''}`, 'item')
    } else if (b.buff === 'regen') {
      applyBuff({ ...b, val: scaledVal, duration })
      logMsg(`${b.name}: +${scaledVal} HP/turn (${permaBeer ? '∞' : duration}t)${isTriple ? ' (×2!)' : ''}`, 'item')
    } else if (b.buff === 'thorns') {
      applyBuff({ ...b, val: scaledVal, duration })
      logMsg(`${b.name}: ${scaledVal} thorns damage (${permaBeer ? '∞' : duration}t)${isTriple ? ' (×2!)' : ''}`, 'item')
    } else if (b.buff === 'spd') {
      g.player.pilsnerTurns = duration
      logMsg(`${b.name}: ×2 hits for ${permaBeer ? '∞' : duration} turns!${isTriple ? ' (×2 Brewer\'s Blessing!)' : ''}`, 'item')
    } else if (b.buff === 'block') {
      applyBuff({ ...b, val: scaledVal, duration })
      if (g.inBattle && g.isBlocking > 0) {
        g.isBlocking += scaledVal
      }
      logMsg(`${b.name}: +${scaledVal} BLOCK (${permaBeer ? '∞' : duration}t)${isTriple ? ' (×2!)' : ''}`, 'item')
    } else {
      applyBuff({ ...b, val: scaledVal, duration })
      logMsg(`${b.name}: ${b.buff === 'crit' ? `+${b.val}% CRIT` : `+${scaledVal} ${b.buff.toUpperCase()}`} (${permaBeer ? '∞' : duration}t)${isTriple ? ' (×2!)' : ''}`, 'item')
    }
    // beer_def relic: +1 DEF per beer this fight
    if (hasRelic(g.player, 'beer_def')) {
      g.player.baseDef += 1
      logMsg('Liquid Armor: +1 DEF!', 'item')
    }
    // beer_block relic: gain block = 50% of beer stat value
    if (hasRelic(g.player, 'beer_block') && g.inBattle) {
      const blockGain = Math.round(scaledVal * 0.5)
      g.isBlocking += blockGain
      logMsg(`Hop Shield: +${blockGain} block!`, 'item')
    }
    g.playerAnimKey = 'drink'
    g.playerAnimSeq++
    g.subMenuType = null
    // Alcohol poisoning: take damage when drinking beer in combat
    if (g.inBattle && hasDebuff(g.player.debuffs, 'alcohol_poison')) {
      const rawDmg = Math.max(1, Math.round(g.player.maxHp * 0.01))
      const absorbed = Math.min(g.isBlocking, rawDmg)
      g.isBlocking = Math.max(0, g.isBlocking - rawDmg)
      const dmg = Math.max(0, rawDmg - absorbed)
      g.player.hp = Math.max(0, g.player.hp - dmg)
      addFloatDmg('player', dmg, '#ff6e40')
      logMsg(`Alcohol Poisoning! -${dmg} HP${absorbed > 0 ? ` (Blocked ${absorbed})` : ''}`, 'enemy')
    }
    if (g.inBattle) {
      // Re-roll enemy intended damage to reflect any DEF changes
      rollEnemyDmg()
      g.actionsLeft--
      render()
      if (g.actionsLeft <= 0) { endPlayerTurn() }
    } else {
      render()
    }
  }

  function eatFood(id: string) {
    const g = gsRef.current
    if (g.inBattle && g.battleLocked) return
    const f = FOODS.find(f => f.id === id)
    if (!f || (g.player.foods[id] || 0) <= 0) return
    g.player.foods[id]--
    g.usedCount++
    const lvScale = 1 + g.currentLevel * 0.4
    const scaledVal = Math.round(f.val * lvScale)
    if (f.restore === 'hp' || f.restore === 'both') {
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + scaledVal)
      logMsg(`${f.name}: +${scaledVal} HP`, 'item')
      if (hasRelic(g.player, 'food_bonus')) {
        g.player.hp = Math.min(g.player.maxHp, g.player.hp + 5)
        logMsg('Lead Belly: +5 bonus HP', 'item')
      }
    }
    g.playerAnimKey = 'drink'
    g.playerAnimSeq++
    g.subMenuType = null
    if (g.inBattle) {
      g.actionsLeft--
      render()
      if (g.actionsLeft <= 0) { endPlayerTurn() }
    } else {
      render()
    }
  }

  function flee() {
    const g = gsRef.current
    if (!g.inBattle) return
    g.subMenuType = null
    if (g.enemy?.isBoss) {
      logMsg('You cannot flee from the Boss. He signed your firing papers.', 'enemy')
      render()
      return
    }
    if (Math.random() < 0.35) {
      logMsg('Seppo slips out the side entrance. Cowardly, but alive.', 'system')
      // Mark current node done & advance
      const route = getCurrentRoute()
      if (route && g.routeNodeIdx >= 0 && g.routeNodeIdx < route.length) {
        route[g.routeNodeIdx].done = true
      }
      g.routeNodeIdx++
      g.currentRound++
      if (route && g.routeNodeIdx >= route.length) {
        const bossType = levelBossType(g.currentLevel)
        if (bossType) {
          // Fled, but boss still awaits
          g.inBattle = false
          showExplore()
          render()
          return
        }
        triggerLevelComplete()
        return
      }
      logMsg(`Round ${g.currentRound + 1}`, 'system')
      g.inBattle = false
      showExplore()
      render()
    } else {
      logMsg('Escape failed!', 'system')
      g.actionsLeft = 0
      render()
      endPlayerTurn()
    }
  }

  function openBeerMenu() {
    const g = gsRef.current
    const avail = BEERS.filter(b => (g.player.beers[b.id] || 0) > 0)
    if (!avail.length) { logMsg('No beer left. Explore to find more.', 'system'); render(); return }
    g.subMenuType = 'beer'
    render()
  }

  function openFoodMenu() {
    const g = gsRef.current
    const avail = FOODS.filter(f => (g.player.foods[f.id] || 0) > 0)
    if (!avail.length) { logMsg('No food left.', 'system'); render(); return }
    g.subMenuType = 'food'
    render()
  }

  function closeSubMenu() {
    gsRef.current.subMenuType = null
    render()
  }

  function applyLevelUpChoice(id: string) {
    const g = gsRef.current
    const choices = scaledLevelUpChoices(g.player.level)
    const u = choices.find(c => c.id === id)
    if (u) u.apply(g.player)
    logMsg(`Level bonus: ${u ? u.label : id}`, 'system')
    g.overlay = null
    if (!showLevelUpChoice()) {
      if (g.afterLevelUp) {
        const fn = g.afterLevelUp
        g.afterLevelUp = null
        fn()
      }
    }
    render()
  }

  function applyUpgrade(id: string, nextLv: number) {
    const g = gsRef.current
    const u = UPGRADES.find(u => u.id === id)
    if (u) u.apply(g.player)
    logMsg(`Upgrade chosen: ${u ? u.label : id}`, 'system')
    g.overlay = null
    g.currentLevel = nextLv
    g.currentRound = 0
    g.chosenRoute = null
    g.routeNodeIdx = 0
    logMsg(`— ${LEVEL_NAMES[g.currentLevel]} — Choose your route!`, 'system')
    g.phase = 'map'
    saveRunToStorage(g)
    render()
  }

  /* ── Events ─────────────────────────────────── */

  function triggerRandomEvent() {
    const g = gsRef.current
    const event = GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)]
    g.activeEvent = { event, onChoose: (idx) => resolveEvent(event.id, idx) }
    render()
  }

  function resolveEvent(eventId: string, choiceIdx: number) {
    const g = gsRef.current
    g.activeEvent = null
    const p = g.player

    // Collect loot entries for overlay
    type LootEntry = { icon: string; label: string; desc: string; color: string; type: 'gain' | 'loss' | 'stat' | 'relic' }
    const loot: LootEntry[] = []

    switch (eventId) {
      case 'shady_dealer': {
        if (choiceIdx === 0) {
          const cost = Math.min(p.coins, 50)
          p.coins -= cost
          const beerIds = BEERS.map(b => b.id)
          const names: string[] = []
          for (let i = 0; i < 3; i++) {
            const id = beerIds[Math.floor(Math.random() * beerIds.length)]
            p.beers[id] = (p.beers[id] || 0) + 1
            const b = BEERS.find(x => x.id === id)
            if (b) names.push(b.name)
          }
          loot.push({ icon: 'sports_bar', label: `3 Beers`, desc: names.join(', '), color: 'secondary', type: 'gain' })
          if (cost > 0) loot.push({ icon: 'monetization_on', label: `-${cost} Coins`, desc: 'Paid the shady dealer', color: 'error', type: 'loss' })
          logMsg(`Shady Dealer: Got 3 beers, lost ${cost} coins.`, 'item')
        } else {
          p.coins += 80
          p.hp = Math.max(1, p.hp - 15)
          loot.push({ icon: 'monetization_on', label: '+80 Coins', desc: 'Cash payment', color: 'amber-400', type: 'gain' })
          loot.push({ icon: 'heart_broken', label: '-15 HP', desc: 'Took a beating for it', color: 'error', type: 'loss' })
          logMsg('Shady Dealer: Got 80 coins, took 15 damage.', 'item')
        }
        break
      }
      case 'back_alley_gym': {
        if (choiceIdx === 0) {
          p.maxHp += 15
          p.hp = Math.min(p.hp + 15, p.maxHp)
          p.buffs = []
          loot.push({ icon: 'favorite', label: '+15 Max HP', desc: 'Feeling stronger', color: 'primary', type: 'stat' })
          loot.push({ icon: 'block', label: 'Buffs Cleared', desc: 'All active buffs removed', color: 'error', type: 'loss' })
          logMsg('Back Alley Gym: +15 max HP, but all buffs cleared.', 'item')
        } else {
          p.baseAtk += 5
          p.baseDef += 5
          p.hp = Math.max(1, p.hp - 20)
          loot.push({ icon: 'swords', label: '+5 ATK', desc: 'Pumped up', color: 'tertiary', type: 'stat' })
          loot.push({ icon: 'shield', label: '+5 DEF', desc: 'Toughened up', color: 'secondary', type: 'stat' })
          loot.push({ icon: 'heart_broken', label: '-20 HP', desc: 'Training hurts', color: 'error', type: 'loss' })
          logMsg('Back Alley Gym: +5 ATK & +5 DEF, took 20 damage.', 'item')
        }
        break
      }
      case 'fork_in_alley': {
        if (choiceIdx === 0) {
          const picks = pickRelics(1)
          const available = picks.filter(r => !hasRelic(p, r.id))
          if (available.length) {
            p.relics.push(available[0])
            applyRelicStats(p, available[0])
            loot.push({ icon: available[0].icon, label: available[0].name, desc: available[0].desc, color: 'primary', type: 'relic' })
            logMsg(`Fork in the Alley: Got ${available[0].name}!`, 'item')
          } else {
            logMsg('Fork in the Alley: No new relics available...', 'system')
          }
          let removed = 0
          for (const id of Object.keys(p.beers)) {
            while (p.beers[id] > 0 && removed < 3) {
              p.beers[id]--
              removed++
            }
            if (removed >= 3) break
          }
          if (removed > 0) {
            loot.push({ icon: 'sports_bar', label: `-${removed} Beer${removed > 1 ? 's' : ''}`, desc: 'Traded away', color: 'error', type: 'loss' })
            logMsg(`Lost ${removed} beer${removed > 1 ? 's' : ''}.`, 'system')
          }
        } else {
          const beerIds = BEERS.map(b => b.id)
          const names: string[] = []
          for (let i = 0; i < 5; i++) {
            const id = beerIds[Math.floor(Math.random() * beerIds.length)]
            p.beers[id] = (p.beers[id] || 0) + 1
            const b = BEERS.find(x => x.id === id)
            if (b) names.push(b.name)
          }
          loot.push({ icon: 'sports_bar', label: '5 Beers', desc: names.join(', '), color: 'secondary', type: 'gain' })
          logMsg('Fork in the Alley: Got 5 random beers!', 'item')
          if (p.relics.length > 0) {
            const idx = Math.floor(Math.random() * p.relics.length)
            const lost = p.relics.splice(idx, 1)[0]
            loot.push({ icon: lost.icon, label: `Lost ${lost.name}`, desc: 'Traded away', color: 'error', type: 'loss' })
            logMsg(`Lost relic: ${lost.name}`, 'enemy')
          }
        }
        break
      }
      case 'street_musician': {
        if (choiceIdx === 0) {
          const cost = Math.min(p.coins, 25)
          p.coins -= cost
          p.debuffs = []
          if (!hasRelic(p, 'debuff_immune')) {
            p.buffs.push({ type: 'both', val: 0, turns: 999, name: 'Debuff Immunity' })
          }
          loot.push({ icon: 'healing', label: 'Debuffs Cleared', desc: 'Feeling fresh', color: 'secondary', type: 'gain' })
          if (cost > 0) loot.push({ icon: 'monetization_on', label: `-${cost} Coins`, desc: 'Tipped the musician', color: 'error', type: 'loss' })
          logMsg(`Street Musician: Cleared debuffs, lost ${cost} coins.`, 'item')
        } else {
          p.weapon = { id: 'guitar', name: 'Busker\'s Guitar', atk: 20, lore: 'Plays a mean riff and hits even meaner.' }
          p.maxHp = Math.max(10, p.maxHp - 30)
          p.hp = Math.min(p.hp, p.maxHp)
          loot.push({ icon: 'music_note', label: 'Busker\'s Guitar', desc: '+20 ATK weapon', color: 'tertiary', type: 'gain' })
          loot.push({ icon: 'heart_broken', label: '-30 Max HP', desc: 'The music takes its toll', color: 'error', type: 'loss' })
          logMsg('Street Musician: Got Busker\'s Guitar (+20 ATK), lost 30 max HP.', 'item')
        }
        break
      }
      case 'abandoned_backpack': {
        if (choiceIdx === 0) {
          const foodIds = FOODS.map(f => f.id)
          const foodNames: string[] = []
          for (let i = 0; i < 2; i++) {
            const id = foodIds[Math.floor(Math.random() * foodIds.length)]
            p.foods[id] = (p.foods[id] || 0) + 1
            const f = FOODS.find(x => x.id === id)
            if (f) foodNames.push(f.name)
          }
          const beerIds = BEERS.map(b => b.id)
          const bid = beerIds[Math.floor(Math.random() * beerIds.length)]
          p.beers[bid] = (p.beers[bid] || 0) + 1
          const beerName = BEERS.find(x => x.id === bid)?.name ?? 'Beer'
          loot.push({ icon: 'restaurant', label: '2 Foods', desc: foodNames.join(', '), color: 'secondary', type: 'gain' })
          loot.push({ icon: 'sports_bar', label: '1 Beer', desc: beerName, color: 'secondary', type: 'gain' })
          logMsg('Abandoned Backpack: Found 2 foods and 1 beer!', 'item')
        } else {
          p.coins += 40
          loot.push({ icon: 'monetization_on', label: '+40 Coins', desc: 'Found in the lining', color: 'amber-400', type: 'gain' })
          logMsg('Abandoned Backpack: Found 40 coins!', 'item')
        }
        break
      }
      case 'old_sauna': {
        if (choiceIdx === 0) {
          p.hp = p.maxHp
          loot.push({ icon: 'spa', label: 'Full Heal', desc: `HP restored to ${p.maxHp}`, color: 'primary', type: 'gain' })
          logMsg('Old Sauna: Healed to full HP!', 'item')
        } else {
          p.baseDef += 3
          loot.push({ icon: 'shield', label: '+3 DEF', desc: 'Permanently toughened', color: 'secondary', type: 'stat' })
          logMsg('Old Sauna: +3 DEF permanently!', 'item')
        }
        break
      }
      case 'lucky_find': {
        if (choiceIdx === 0) {
          const picks = pickRelics(1, 'common', filterUnlocked(RELICS))
          const available = picks.filter(r => !hasRelic(p, r.id))
          if (available.length) {
            p.relics.push(available[0])
            applyRelicStats(p, available[0])
            loot.push({ icon: available[0].icon, label: available[0].name, desc: available[0].desc, color: 'primary', type: 'relic' })
            logMsg(`Lucky Find: Got ${available[0].name}!`, 'item')
          } else {
            p.coins += 20
            loot.push({ icon: 'monetization_on', label: '+20 Coins', desc: 'No new relics... coins instead', color: 'amber-400', type: 'gain' })
            logMsg('Lucky Find: No new relics... found 20 coins instead.', 'item')
          }
        } else {
          const pool = filterUnlocked(WEAPONS).filter(w => !p.weapon || w.atk > p.weapon.atk)
          if (pool.length) {
            const w = pool[Math.floor(Math.random() * pool.length)]
            p.weapon = { ...w }
            loot.push({ icon: 'swords', label: w.name, desc: `+${w.atk} ATK weapon`, color: 'tertiary', type: 'gain' })
            logMsg(`Lucky Find: Found ${w.name} (+${w.atk} ATK)!`, 'item')
          } else {
            p.coins += 20
            loot.push({ icon: 'monetization_on', label: '+20 Coins', desc: 'No better weapons... coins instead', color: 'amber-400', type: 'gain' })
            logMsg('Lucky Find: No better weapons... found 20 coins instead.', 'item')
          }
        }
        break
      }
      case 'cursed_pint': {
        if (choiceIdx === 0) {
          p.baseAtk += 12
          applyDebuff(p.debuffs, 'alcohol_poison', 999, 0)
          loot.push({ icon: 'swords', label: '+12 ATK', desc: 'Raw power', color: 'tertiary', type: 'stat' })
          loot.push({ icon: 'skull', label: 'Alcohol Poison', desc: '1% max HP dmg when drinking (this combat)', color: 'error', type: 'loss' })
          logMsg('Cursed Pint: +12 ATK! But you feel... wrong.', 'item')
        } else if (choiceIdx === 1) {
          const heal = Math.round(p.maxHp * 0.4)
          p.hp = Math.min(p.maxHp, p.hp + heal)
          loot.push({ icon: 'favorite', label: `+${heal} HP`, desc: 'Healed up', color: 'primary', type: 'gain' })
          logMsg(`Cursed Pint: Healed ${heal} HP.`, 'item')
        } else {
          logMsg('Walked away from the cursed pint.', 'system')
        }
        break
      }
      case 'suspicious_vending': {
        if (choiceIdx === 0) {
          if (Math.random() < 0.5) {
            const picks = pickRelics(1, 'rare')
            const available = picks.filter(r => !hasRelic(p, r.id))
            if (available.length) {
              p.relics.push(available[0])
              applyRelicStats(p, available[0])
              loot.push({ icon: available[0].icon, label: available[0].name, desc: available[0].desc, color: 'amber-400', type: 'relic' })
              logMsg(`Jackpot! Got rare relic: ${available[0].name}!`, 'item')
            } else {
              p.coins += 50
              loot.push({ icon: 'monetization_on', label: '+50 Coins', desc: 'Machine glitched', color: 'amber-400', type: 'gain' })
              logMsg('Machine glitches... spits out 50 coins.', 'item')
            }
          } else {
            p.hp = Math.max(1, p.hp - 30)
            loot.push({ icon: 'explosion', label: '-30 HP', desc: 'The machine explodes!', color: 'error', type: 'loss' })
            logMsg('The machine explodes! Took 30 damage.', 'enemy')
          }
        } else if (choiceIdx === 1) {
          const cost = Math.min(p.coins, 40)
          p.coins -= cost
          const foodIds = FOODS.map(f => f.id)
          const names: string[] = []
          for (let i = 0; i < 3; i++) {
            const id = foodIds[Math.floor(Math.random() * foodIds.length)]
            p.foods[id] = (p.foods[id] || 0) + 1
            const f = FOODS.find(x => x.id === id)
            if (f) names.push(f.name)
          }
          loot.push({ icon: 'restaurant', label: '3 Foods', desc: names.join(', '), color: 'secondary', type: 'gain' })
          if (cost > 0) loot.push({ icon: 'monetization_on', label: `-${cost} Coins`, desc: 'Fed the machine', color: 'error', type: 'loss' })
          logMsg(`Vending Machine: Got 3 foods, lost ${cost} coins.`, 'item')
        } else {
          logMsg('Walked away from the vending machine.', 'system')
        }
        break
      }
      case 'drunk_philosopher': {
        if (choiceIdx === 0) {
          p.baseAtk += 8
          const hpLoss = Math.round(p.maxHp * 0.25)
          p.maxHp = Math.max(10, p.maxHp - hpLoss)
          p.hp = Math.min(p.hp, p.maxHp)
          loot.push({ icon: 'swords', label: '+8 ATK', desc: 'Enlightened rage', color: 'tertiary', type: 'stat' })
          loot.push({ icon: 'heart_broken', label: `-${hpLoss} Max HP`, desc: 'Existential dread', color: 'error', type: 'loss' })
          logMsg(`Drunk Philosopher: +8 ATK, lost ${hpLoss} max HP.`, 'item')
        } else if (choiceIdx === 1) {
          const cost = Math.min(p.coins, 30)
          p.coins -= cost
          const foodIds = FOODS.map(f => f.id)
          const names: string[] = []
          for (let i = 0; i < 2; i++) {
            const id = foodIds[Math.floor(Math.random() * foodIds.length)]
            p.foods[id] = (p.foods[id] || 0) + 1
            const f = FOODS.find(x => x.id === id)
            if (f) names.push(f.name)
          }
          loot.push({ icon: 'restaurant', label: '2 Foods', desc: names.join(', '), color: 'secondary', type: 'gain' })
          if (cost > 0) loot.push({ icon: 'monetization_on', label: `-${cost} Coins`, desc: 'Philosophical tax', color: 'error', type: 'loss' })
          logMsg(`Drunk Philosopher: Got 2 foods, lost ${cost} coins.`, 'item')
        } else {
          logMsg('Ignored the drunk philosopher.', 'system')
        }
        break
      }
      case 'lottery_booth': {
        if (choiceIdx === 0) {
          const cost = Math.min(p.coins, 20)
          p.coins -= cost
          if (Math.random() < 0.33) {
            p.coins += 150
            loot.push({ icon: 'casino', label: 'JACKPOT! +150 Coins', desc: 'Lady luck smiles', color: 'amber-400', type: 'gain' })
            logMsg('JACKPOT! Won 150 coins!', 'item')
          } else {
            loot.push({ icon: 'sentiment_dissatisfied', label: 'Nothing', desc: 'Better luck next time', color: 'on-surface-variant', type: 'loss' })
            logMsg('The wheel lands on nothing. Tough luck.', 'enemy')
          }
          if (cost > 0) loot.push({ icon: 'monetization_on', label: `-${cost} Coins`, desc: 'Ticket price', color: 'error', type: 'loss' })
        } else if (choiceIdx === 1) {
          p.coins += 60
          p.hp = Math.max(1, p.hp - 25)
          loot.push({ icon: 'monetization_on', label: '+60 Coins', desc: 'Blood money', color: 'amber-400', type: 'gain' })
          loot.push({ icon: 'heart_broken', label: '-25 HP', desc: 'It hurt', color: 'error', type: 'loss' })
          logMsg('Lottery Booth: Sold blood for 60 coins, took 25 damage.', 'item')
        } else {
          logMsg('Walked past the lottery booth.', 'system')
        }
        break
      }
      case 'risky_backpack': {
        if (choiceIdx === 0) {
          const picks = pickRelics(1, 'uncommon')
          const available = picks.filter(r => !hasRelic(p, r.id))
          if (available.length) {
            p.relics.push(available[0])
            applyRelicStats(p, available[0])
            loot.push({ icon: available[0].icon, label: available[0].name, desc: available[0].desc, color: 'secondary', type: 'relic' })
            logMsg(`Risky Backpack: Got ${available[0].name}!`, 'item')
          } else {
            p.coins += 30
            loot.push({ icon: 'monetization_on', label: '+30 Coins', desc: 'Nothing new in the bag', color: 'amber-400', type: 'gain' })
            logMsg('Risky Backpack: Nothing new... found 30 coins.', 'item')
          }
          p.maxHp = Math.max(10, p.maxHp - 20)
          p.hp = Math.min(p.hp, p.maxHp)
          loot.push({ icon: 'heart_broken', label: '-20 Max HP', desc: 'The strain takes its toll', color: 'error', type: 'loss' })
          logMsg('Lost 20 max HP from the strain.', 'enemy')
        } else if (choiceIdx === 1) {
          p.coins += 60
          loot.push({ icon: 'monetization_on', label: '+60 Coins', desc: 'Found in the pockets', color: 'amber-400', type: 'gain' })
          logMsg('Risky Backpack: Found 60 coins in the pockets!', 'item')
        } else {
          logMsg('Left the backpack alone.', 'system')
        }
        break
      }
    }

    // Show event loot overlay if there was any loot, then advance
    const eventName = GAME_EVENTS.find(e => e.id === eventId)?.name ?? 'Event'
    if (loot.length > 0) {
      g.overlay = {
        type: 'event-loot',
        title: eventName,
        body: { entries: loot },
        btnText: 'Continue',
        onBtn: () => { g.overlay = null; advanceAfterEvent(); render() },
        showBtn: true,
      }
    } else {
      advanceAfterEvent()
    }
    render()
  }

  function advanceAfterEvent() {
    const g = gsRef.current
    const route = getCurrentRoute()
    if (route && g.routeNodeIdx >= 0 && g.routeNodeIdx < route.length) {
      route[g.routeNodeIdx].done = true
    }
    g.routeNodeIdx++
    g.currentRound++
    if (route && g.routeNodeIdx >= route.length) {
      const bossType = levelBossType(g.currentLevel)
      if (bossType) {
        if (!showLevelUpChoice()) showExplore()
        else { g.afterLevelUp = () => showExplore() }
      } else {
        if (!showLevelUpChoice()) triggerLevelComplete()
        else { g.afterLevelUp = () => triggerLevelComplete() }
      }
    } else {
      if (!showLevelUpChoice()) showExplore()
      else { g.afterLevelUp = () => showExplore() }
    }
    render()
  }

  function chooseEvent(choiceIdx: number) {
    const g = gsRef.current
    if (!g.activeEvent) return
    g.activeEvent.onChoose(choiceIdx)
  }

  function showStatInfo() {
    const g = gsRef.current
    g.overlay = {
      type: 'stat-info', title: 'Stat Guide',
      body: null, btnText: 'Got it',
      onBtn: () => hideOverlay(), showBtn: true,
    }
    render()
  }

  function hideOverlay() {
    gsRef.current.overlay = null
    render()
  }

  function playerAnimComplete() {
    const g = gsRef.current
    if (g.playerAnimKey !== 'death') {
      g.playerAnimKey = 'idle'
      g.playerAnimSeq++
      render()
    }
  }

  function enemyAnimComplete() {
    const g = gsRef.current
    if (g.enemyAnimKey !== 'death') {
      g.enemyAnimKey = 'idle'
      g.enemyAnimSeq++
      render()
    }
  }

  return {
    state: gsRef.current,
    actions: {
      startGame, resumeGame, explore, rest, attack, block, drinkBeer, eatFood,
      openBeerMenu, openFoodMenu, closeSubMenu, chooseRoute,
      applyLevelUpChoice, applyUpgrade, applyRelicChoice, showStatInfo, hideOverlay,
      playerAnimComplete, enemyAnimComplete, buyItem, leaveShop, fightShopkeeper, chooseEvent,
    },
  }
}
