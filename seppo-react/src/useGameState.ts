import { useReducer, useRef } from 'react'
import type { GameState, Player, Enemy, Buff, LogEntry, FeedEntry, FloatDmg, OverlayData, LevelUpChoice, Upgrade } from './types'
import {
  SEPPO_ANIMS_SOUTH, SEPPO_ANIMS_EAST, ISMO_ANIMS,
  BEERS, FOODS, WEAPONS, LEVEL_ENEMIES, LEVEL_NAMES, LEVEL_BGS,
  BOSS_DATA, BLACK_METAL_NAMES, UPGRADES, ROUNDS_PER_LEVEL, ACTIONS_PER_TURN,
  preloadAllAnims, getPlayerAtk, getPlayerDef, getCritChance, calcDmg, buffSummary,
  scaledLevelUpChoices,
} from './gameData'

/* ── Initial State ────────────────────────────── */

function createPlayer(): Player {
  return {
    level: 1, xp: 0, xpNext: 50,
    hp: 50, maxHp: 50,
    baseAtk: 9, baseDef: 5,
    weapon: null,
    beers: { hoppy_ipa: 1, pale_ale: 1, lager: 1, wheat_beer: 0, porter: 1, stout: 0 },
    foods: { burger: 2, kebab: 1, makkaraperunat: 0 },
    buff: null, buff2: null,
    rageBonus: 0, pilsnerTurns: 0, critBonus: 0, regenBonus: 0,
  }
}

function createInitialState(): GameState {
  return {
    phase: 'intro',
    player: createPlayer(),
    enemy: null,
    currentLevel: 0, currentRound: 0,
    actionsLeft: ACTIONS_PER_TURN,
    usedCount: 0,
    inBattle: false, battleLocked: false,
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
      if (p[k] && p[k]!.turns > 0) {
        p[k]!.turns--
        if (p[k]!.turns === 0) {
          if (p[k]!.type === 'rage') p.rageBonus = 0
          logMsg(`${p[k]!.name} buzz wore off.`, 'system')
          p[k] = null
        }
      }
    }
    if (p.pilsnerTurns > 0) p.pilsnerTurns--
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
      p.xpNext = Math.round(p.xpNext * 1.55)
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
      g.runStats.enemiesDefeated.push({ name: g.enemy!.name, dmgDealt: g.runStats.currentFightDmg, xp: g.enemy!.xp })
      g.runStats.currentFightDmg = 0
      if (g.player.regenBonus) {
        const regen = g.player.regenBonus
        g.player.hp = Math.min(g.player.maxHp, g.player.hp + regen)
        logMsg(`Regen: +${regen} HP`, 'system')
      }
      gainXP(g.enemy!.xp)
      // Weapon loot
      if (Math.random() < (g.enemy!.loot || 0)) {
        const cands = WEAPONS.filter(w => !g.player.weapon || w.atk > g.player.weapon.atk)
        if (cands.length) {
          const found = cands[Math.floor(Math.random() * Math.min(3, cands.length))]
          if (!g.player.weapon || found.atk > g.player.weapon.atk) {
            g.player.weapon = { ...found }
            logMsg(`Found: ${found.name} (+${found.atk} ATK) — ${found.lore}`, 'item')
          }
        }
      }
      // Item drops
      const drop1 = dropItem()
      logMsg(`Dropped: ${drop1}!`, 'item')
      if (Math.random() < (0.2 + g.currentLevel * 0.15)) {
        const drop2 = dropItem()
        logMsg(`Bonus drop: ${drop2}!`, 'item')
      }
      if (g.enemy!.isBoss) { triggerVictory(); return }
      g.currentRound++
      if (g.currentRound >= ROUNDS_PER_LEVEL) {
        if (!showLevelUpChoice()) triggerLevelComplete()
        else { g.afterLevelUp = () => triggerLevelComplete() }
      } else {
        logMsg(`Round ${g.currentRound + 1}/${ROUNDS_PER_LEVEL}`, 'system')
        if (!showLevelUpChoice()) showExplore()
        else { g.afterLevelUp = () => showExplore() }
      }
    } else {
      triggerGameOver()
    }
    render()
  }

  function dropItem(): string {
    const g = gsRef.current
    const allItems = [...BEERS, ...FOODS]
    const rb = allItems[Math.floor(Math.random() * allItems.length)]
    if ('restore' in rb) { g.player.foods[rb.id] = (g.player.foods[rb.id] || 0) + 1 }
    else { g.player.beers[rb.id] = (g.player.beers[rb.id] || 0) + 1 }
    return rb.name
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

  function enemyTurn() {
    const g = gsRef.current
    if (!g.enemy || g.enemy.hp <= 0) return
    if (g.enemy.stun > 0) {
      g.enemy.stun--
      logMsg(`${g.enemy.name} is stunned — loses turn!`, 'enemy')
      tickBuffs()
      g.actionsLeft = ACTIONS_PER_TURN
      render()
      return
    }
    let atk = g.enemy.atk
    if (g.enemy.isBoss && g.enemy.phaseIdx >= 1) atk += BOSS_DATA.phases[1].atkBonus
    const { dmg } = calcDmg(atk, getPlayerDef(g.player), 0)
    g.player.hp = Math.max(0, g.player.hp - dmg)
    g.enemyAnimKey = 'attack'
    g.enemyAnimSeq++
    g.playerAnimKey = 'hit'
    g.playerAnimSeq++
    addFloatDmg('player', dmg, '#ffb4ab')
    logMsg(`${g.enemy.name} hits Seppo for ${dmg}!`, 'enemy')
    tickBuffs()
    if (g.player.hp <= 0) {
      g.playerAnimKey = 'death'
      g.playerAnimSeq++
      render()
      const deathAnim = (g.playerAnimSet === 'east' ? SEPPO_ANIMS_EAST : SEPPO_ANIMS_SOUTH).death
      const deathDuration = Math.round(deathAnim.frames / deathAnim.fps * 1000) + 400
      addTimer(() => endBattle(false), deathDuration)
      return
    }
    g.actionsLeft = ACTIONS_PER_TURN
    render()
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
    const healHp = Math.round(g.player.maxHp * 0.4)
    g.player.hp = Math.min(g.player.maxHp, g.player.hp + healHp)
    const bonusItems = 2 + g.currentLevel
    const gained: string[] = []
    for (let i = 0; i < bonusItems; i++) {
      gained.push(dropItem())
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
    g.phase = 'explore'
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
    fresh.phase = 'explore'
    fresh.overlay = null
    fresh.playerAnimKey = 'idle'
    fresh.playerAnimSeq = (gsRef.current.playerAnimSeq || 0) + 1
    fresh.playerAnimSet = 'south'
    Object.assign(gsRef.current, fresh)
    gsRef.current.runStartTime = Date.now()
    logMsg(`— ${LEVEL_NAMES[0]} — Round 1/${ROUNDS_PER_LEVEL}`, 'system')
    logMsg('Seppo stares at his last pint. The corner seat is occupied. This ends tonight.', 'system')
    render()
  }

  function explore() {
    const g = gsRef.current
    if (g.currentLevel === 2 && g.currentRound === ROUNDS_PER_LEVEL - 1) {
      logMsg('You hear a familiar voice from the corner. It\'s time.', 'system')
      spawnEnemy(true)
    } else {
      spawnEnemy(false)
      logMsg(`${g.enemy!.name} steps out of the shadows — ${g.enemy!.lore}`, 'enemy')
    }
    render()
  }

  function spawnEnemy(isBoss: boolean) {
    const g = gsRef.current
    if (isBoss) {
      g.enemy = {
        name: BOSS_DATA.name, portrait: 'assets/characters/ismo/rotations/south.png',
        hp: BOSS_DATA.hp, maxHp: BOSS_DATA.hp,
        atk: BOSS_DATA.atk, def: BOSS_DATA.def, xp: BOSS_DATA.xp,
        loot: 0, stun: 0, isBoss: true, phaseIdx: 0,
        anims: ISMO_ANIMS, lore: BOSS_DATA.lore,
      }
      logMsg('ISMO APPEARS — he\'s sitting in your corner seat. This ends now.', 'enemy')
    } else {
      const pool = LEVEL_ENEMIES[g.currentLevel]
      const base = pool[Math.floor(Math.random() * pool.length)]
      const scale = 1 + (g.player.level - 1) * 0.12
      let name = base.name
      if (base.randomName) name = BLACK_METAL_NAMES[Math.floor(Math.random() * BLACK_METAL_NAMES.length)]
      g.enemy = {
        name, portrait: base.portrait,
        hp: Math.round(base.hp * scale), maxHp: Math.round(base.hp * scale),
        atk: Math.round(base.atk * scale), def: Math.round(base.def * scale),
        xp: base.xp, loot: base.loot,
        stun: 0, isBoss: false, phaseIdx: 0,
        anims: base.anims, lore: base.lore,
      }
    }
    g.inBattle = true
    g.battleLocked = false
    g.actionsLeft = ACTIONS_PER_TURN
    g.runStats.currentFightDmg = 0
    g.phase = 'battle'
    g.subMenuType = null
    g.playerAnimSet = 'east'
    g.playerAnimKey = 'idle'
    g.playerAnimSeq++
    g.enemyAnimKey = 'idle'
    g.enemyAnimSeq++
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
    const { dmg, crit } = calcDmg(getPlayerAtk(g.player), g.enemy.def, getCritChance(g.player))
    g.enemy.hp = Math.max(0, g.enemy.hp - dmg)
    g.runStats.totalDmgDealt += dmg
    g.runStats.currentFightDmg += dmg
    g.playerAnimKey = 'attack'
    g.playerAnimSeq++
    g.enemyAnimKey = 'hit'
    g.enemyAnimSeq++
    addFloatDmg('enemy', dmg, crit ? '#ffe060' : '#ffb68c')
    logMsg(`Seppo attacks for ${dmg}${crit ? ' CRITICAL!' : ''}`, 'player')
    if (g.player.pilsnerTurns > 0) {
      const { dmg: d2, crit: c2 } = calcDmg(getPlayerAtk(g.player), g.enemy.def, getCritChance(g.player))
      g.enemy.hp = Math.max(0, g.enemy.hp - d2)
      g.runStats.totalDmgDealt += d2
      g.runStats.currentFightDmg += d2
      logMsg(`Sahti speed strike: ${d2}${c2 ? ' CRIT!' : ''}`, 'skill')
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
    if (g.actionsLeft <= 0) addTimer(() => enemyTurn(), 500)
  }

  function drinkBeer(id: string) {
    const g = gsRef.current
    const b = BEERS.find(b => b.id === id)
    if (!b || (g.player.beers[id] || 0) <= 0) return
    g.player.beers[id]--
    g.usedCount++
    g.runStats.beersDrunk++
    const lvScale = 1 + (g.currentLevel * 0.3) + (g.player.level - 1) * 0.1
    const scaledVal = Math.round(b.val * lvScale)
    if (b.buff === 'spd') {
      g.player.pilsnerTurns = b.duration
      logMsg(`${b.name}: ×2 hits for ${b.duration} turns!`, 'item')
    } else {
      applyBuff({ ...b, val: scaledVal })
      logMsg(`${b.name}: ${b.buff === 'crit' ? `+${b.val}% CRIT` : `+${scaledVal} ${b.buff.toUpperCase()}`} (${b.duration}t)`, 'item')
    }
    g.playerAnimKey = 'drink'
    g.playerAnimSeq++
    g.subMenuType = null
    if (g.inBattle) {
      g.actionsLeft--
      render()
      if (g.actionsLeft <= 0) addTimer(() => enemyTurn(), 600)
    } else {
      render()
    }
  }

  function eatFood(id: string) {
    const g = gsRef.current
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
      if (g.actionsLeft <= 0) addTimer(() => enemyTurn(), 600)
    } else {
      render()
    }
  }

  function flee() {
    const g = gsRef.current
    if (!g.inBattle) return
    g.subMenuType = null
    if (g.enemy?.isBoss) {
      logMsg('You cannot flee from Ismo. He took your corner seat.', 'enemy')
      render()
      return
    }
    if (Math.random() < 0.35) {
      logMsg('Seppo slips out the side entrance. Cowardly, but alive.', 'system')
      g.currentRound++
      if (g.currentRound >= ROUNDS_PER_LEVEL) {
        triggerLevelComplete()
        return
      }
      logMsg(`Round ${g.currentRound + 1}/${ROUNDS_PER_LEVEL}`, 'system')
      g.inBattle = false
      showExplore()
      render()
    } else {
      logMsg('Escape failed!', 'system')
      g.actionsLeft = 0
      render()
      enemyTurn()
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
    logMsg(`— ${LEVEL_NAMES[g.currentLevel]} — Round 1/${ROUNDS_PER_LEVEL}`, 'system')
    showExplore()
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
      startGame, explore, rest, attack, drinkBeer, eatFood, flee,
      openBeerMenu, openFoodMenu, closeSubMenu,
      applyLevelUpChoice, applyUpgrade, showStatInfo, hideOverlay,
      playerAnimComplete, enemyAnimComplete,
    },
  }
}
