import { useReducer, useRef } from 'react'
import type { GameState, Player, Enemy, Buff, LogEntry, FeedEntry, FloatDmg, OverlayData, LevelUpChoice, Upgrade, LevelRoute, Relic } from './types'
import {
  SEPPO_ANIMS_SOUTH, SEPPO_ANIMS_EAST, ISMO_ANIMS,
  BEERS, FOODS, WEAPONS, LEVEL_ENEMIES, LEVEL_NAMES, LEVEL_BGS,
  BOSS_DATA, PARK_BOSS_DATA, STREET_BOSS_DATA, BAR_BOSS_DATA, CHURCH_BOSS_DATA, BASEMENT_BOSS_DATA, MEADOW_BOSS_DATA, HELL_BOSS_DATA, ISMO_FIRST_FIGHT, BLACK_METAL_NAMES, CONSULTANT_TITLES, UPGRADES, ROUNDS_PER_LEVEL, PLAYER_ACTIONS, ENEMY_ACTIONS,
  preloadAllAnims, getPlayerAtk, getPlayerDef, getPlayerBlock, getCritChance, calcDmg, buffSummary,
  scaledLevelUpChoices, generateAllRoutes, levelBossType, hasRelic, pickRelics, pickRelicsByRarity, RELICS,
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
    buff: null, buff2: null,
    rageBonus: 0, pilsnerTurns: 0, critBonus: 0, regenBonus: 0, blockBonus: 0,
    relics: [], beersThisFight: 0, attackCount: 0,
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
    inBattle: false, battleLocked: false, isBlocking: 0, enemyNextDmgs: [], enemyWillBlock: false,
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
    runStartTime: 0,
    runStats: { beersDrunk: 0, enemiesDefeated: [], totalDmgDealt: 0, currentFightDmg: 0 },
  }
}

/* ── Hook ─────────────────────────────────────── */

export function useGameState() {
  const [, forceRender] = useReducer((x: number) => x + 1, 0)
  const gsRef = useRef<GameState>(createInitialState())
  const g = gsRef.current
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

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
    for (const k of ['buff', 'buff2'] as const) {
      if (p[k] && p[k]!.type === b.buff && p[k]!.turns > 0) {
        p[k]!.val += b.val
        p[k]!.turns = Math.max(p[k]!.turns, b.duration)
        p[k]!.name = p[k]!.name + ' + ' + b.name
        return
      }
    }
    const slot: 'buff' | 'buff2' = (!p.buff || p.buff.turns === 0) ? 'buff' : 'buff2'
    p[slot] = { type: b.buff, val: b.val, turns: b.duration, name: b.name }
  }

  function tickBuffs() {
    const p = gsRef.current.player
    for (const k of ['buff', 'buff2'] as const) {
      if (p[k] && p[k]!.turns > 0 && p[k]!.turns < 999) {
        p[k]!.turns--
        if (p[k]!.turns === 0) {
          if (p[k]!.type === 'rage') p.rageBonus = 0
          logMsg(`${p[k]!.name} buzz wore off.`, 'system')
          p[k] = null
        }
      }
    }
    if (p.pilsnerTurns > 0 && p.pilsnerTurns < 999) p.pilsnerTurns--
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
      p.hp = p.maxHp
      const allItems = [...BEERS, ...FOODS]
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
    g.inBattle = false
    if (won) {
      // Tick buffs down by 1 turn on kill
      const p = g.player
      if (p.buff && p.buff.turns > 0 && p.buff.turns < 999) p.buff.turns--
      if (p.buff && p.buff.turns <= 0) p.buff = null
      if (p.buff2 && p.buff2.turns > 0 && p.buff2.turns < 999) p.buff2.turns--
      if (p.buff2 && p.buff2.turns <= 0) p.buff2 = null
      if (p.pilsnerTurns > 0 && p.pilsnerTurns < 999) p.pilsnerTurns--

      const enemy = g.enemy!
      g.runStats.enemiesDefeated.push({ name: enemy.name, dmgDealt: g.runStats.currentFightDmg, xp: enemy.xp })
      g.runStats.currentFightDmg = 0

      // Regen
      let regenHp = 0
      if (g.player.regenBonus) {
        regenHp = g.player.regenBonus
        g.player.hp = Math.min(g.player.maxHp, g.player.hp + regenHp)
      }

      gainXP(enemy.xp)

      // Weapon loot
      let weaponFound: { name: string; atk: number; lore: string } | null = null
      if (Math.random() < (enemy.loot || 0)) {
        const cands = WEAPONS.filter(w => !g.player.weapon || w.atk > g.player.weapon.atk)
        if (cands.length) {
          const found = cands[Math.floor(Math.random() * Math.min(3, cands.length))]
          if (!g.player.weapon || found.atk > g.player.weapon.atk) {
            g.player.weapon = { ...found }
            weaponFound = { name: found.name, atk: found.atk, lore: found.lore }
          }
        }
      }

      // Item drops
      const drops: { name: string; img: string; color: string }[] = []
      const d1 = dropItem()
      drops.push({ name: d1.name, img: d1.img, color: d1.color })
      if (Math.random() < (0.2 + g.currentLevel * 0.15)) {
        const d2 = dropItem()
        drops.push({ name: d2.name, img: d2.img, color: d2.color })
      }

      const isBossEnemy = enemy.isBoss

      const afterFight = () => {
        g.overlay = null
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
        body: { enemyPortrait: enemy.portrait, xpGained: enemy.xp, weaponFound, itemsDropped: drops, regenHp },
        btnText: 'Continue',
        onBtn: afterFight,
        showBtn: true,
      }
    } else {
      triggerGameOver()
    }
    render()
  }

  function dropItem() {
    const g = gsRef.current
    const allItems = [...BEERS, ...FOODS]
    const rb = allItems[Math.floor(Math.random() * allItems.length)]
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
    if (!g.enemy || g.enemy.hp <= 0) { g.enemyNextDmgs = []; g.enemyWillBlock = false; return }
    let atk = g.enemy.atk
    if (g.enemy.isBoss && g.enemy.phaseIdx >= 1) atk += BOSS_DATA.phases[1].atkBonus
    g.enemyWillBlock = ENEMY_ACTIONS > 1 && Math.random() < 0.3
    const strikes = g.enemyWillBlock ? ENEMY_ACTIONS - 1 : ENEMY_ACTIONS
    g.enemyNextDmgs = Array.from({ length: strikes }, () => calcDmg(atk, getPlayerDef(g.player), 0).dmg)
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
    // Reset any leftover enemy block from previous turn
    if (g.enemy) g.enemy.isBlocking = 0
    // Use pre-rolled block decision
    if (g.enemyWillBlock) {
      g.enemy.isBlocking += g.enemy.def
      logMsg(`${g.enemy.name} braces for impact! (+${g.enemy.def} block)`, 'enemy')
      render()
      addTimer(() => enemyStrike(ENEMY_ACTIONS - 1), 1200)
    } else {
      enemyStrike(ENEMY_ACTIONS)
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
    if (remaining === 1) tickBuffs()
    if (g.player.hp <= 0) {
      g.playerAnimKey = 'death'
      g.playerAnimSeq++
      render()
      const deathAnim = (g.playerAnimSet === 'east' ? SEPPO_ANIMS_EAST : SEPPO_ANIMS_SOUTH).death
      const deathDuration = Math.round(deathAnim.frames / deathAnim.fps * 1000) + 400
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
        g2.actionsLeft = PLAYER_ACTIONS
        // Desperation relic: extra action when below 30% HP
        if (hasRelic(g2.player, 'desperation') && g2.player.hp <= g2.player.maxHp * 0.3) {
          g2.actionsLeft++
        }
        g2.battleLocked = false
        // Player block resets when player turn starts
        g2.isBlocking = 0
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
    g.overlay = {
      type: 'victory', title: 'Victory',
      body: { elapsed, stats, enemyScore, beerScore, total },
      btnText: 'Play Again',
      onBtn: () => startGame(), showBtn: true,
    }
    render()
  }

  function triggerGameOver() {
    const g = gsRef.current
    const elapsed = Date.now() - g.runStartTime
    const stats = g.runStats
    const enemyScore = stats.enemiesDefeated.reduce((sum, e) => sum + e.xp * 5, 0)
    const beerScore = stats.beersDrunk * 50
    const total = enemyScore + beerScore + stats.totalDmgDealt
    g.overlay = {
      type: 'game-over', title: 'Defeated',
      body: { elapsed, stats, enemyScore, beerScore, total },
      btnText: 'Try Again',
      onBtn: () => startGame(), showBtn: true,
    }
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
  }

  /* ════════ Public Actions ════════ */

  function startGame() {
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

  function showRelicChoice(context: 'start' | 'treasure') {
    const g = gsRef.current
    const picks = context === 'start' ? pickRelics(3, 'common') : pickRelicsByRarity(3)
    // Filter out relics player already has
    const available = picks.filter(r => !hasRelic(g.player, r.id))
    g.overlay = {
      type: 'relic-choice',
      title: context === 'start' ? 'Choose a Starting Relic' : 'Treasure Found!',
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
    // Check if this was the start relic
    if (wasStart) {
      g.phase = 'map'
      logMsg(`— ${LEVEL_NAMES[0]} — Choose your route!`, 'system')
      logMsg('Seppo raided the office fridge for every afterwork beer. Then he told the boss his new project processes are stupid. Now he\'s fired.', 'system')
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
      // Rest: heal 40% maxHP, consume 1 buff turn
      const healAmt = Math.round(g.player.maxHp * 0.4)
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + healAmt)
      logMsg(`Seppo finds a quiet spot and rests. +${healAmt} HP.`, 'system')
      for (const k of ['buff', 'buff2'] as const) {
        if (g.player[k] && g.player[k]!.turns > 0 && g.player[k]!.turns < 999) {
          g.player[k]!.turns--
          if (g.player[k]!.turns === 0) {
            logMsg(`${g.player[k]!.name} wore off during rest.`, 'system')
            g.player[k] = null
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
    } else {
      // fight or elite
      const isElite = node.type === 'elite'
      spawnEnemy(false, isElite)
      logMsg(`${g.enemy!.name} steps out of the shadows — ${g.enemy!.lore}`, isElite ? 'skill' : 'enemy')
    }
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
      anims: b.anims, lore: b.lore,
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
          anims: bossData.anims || ISMO_ANIMS, lore: bossData.lore,
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
        anims: base.anims, lore: base.lore,
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
    // tenth_strike relic: every 10th attack deals double
    const tenthStrike = hasRelic(g.player, 'tenth_strike') && g.player.attackCount % 10 === 0
    const pctMods = [...g.player.dmgModifiers.map(m => m.pct)]
    if (tenthStrike) pctMods.push(1.0) // +100% = double
    const effectiveAtk = getPlayerAtk(g.player) + beerDmgBonus
    const { dmg: rawDmg, crit } = calcDmg(effectiveAtk, g.enemy.def, getCritChance(g.player), pctMods)
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
    g.playerAnimKey = 'attack'
    g.playerAnimSeq++
    g.enemyAnimKey = 'hit'
    g.enemyAnimSeq++
    addFloatDmg('enemy', dmg, crit ? '#ffe060' : '#ffb68c')
    logMsg(`Seppo attacks for ${dmg}${crit ? ' CRITICAL!' : ''}${tenthStrike ? ' 10TH STRIKE!' : ''}${absorbed > 0 ? ` (Blocked ${absorbed})` : ''}`, 'player')
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
      g.enemyAnimKey = 'death'
      g.enemyAnimSeq++
      render()
      endBattle(true)
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
    g.isBlocking += getPlayerBlock(g.player)
    logMsg(`Seppo braces for impact! (+${getPlayerBlock(g.player)} block, total ${g.isBlocking})`, 'player')
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
    if (b.buff === 'spd') {
      g.player.pilsnerTurns = duration
      logMsg(`${b.name}: ×2 hits for ${permaBeer ? '∞' : duration} turns!${isTriple ? ' (×2 Brewer\'s Blessing!)' : ''}`, 'item')
    } else if (b.buff === 'block') {
      applyBuff({ ...b, val: scaledVal, duration })
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
    if (g.inBattle) {
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
    render()
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
      startGame, explore, rest, attack, block, drinkBeer, eatFood,
      openBeerMenu, openFoodMenu, closeSubMenu, chooseRoute,
      applyLevelUpChoice, applyUpgrade, applyRelicChoice, showStatInfo, hideOverlay,
      playerAnimComplete, enemyAnimComplete,
    },
  }
}
