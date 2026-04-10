import { useEffect, useRef, useState } from 'react'
import type { Player, LevelRoute } from '../types'
import { LEVEL_NAMES, LEVEL_BGS, FOODS, getPlayerAtk, getPlayerDef, getCritChance, getFoodLabel, levelBossType } from '../gameData'

interface Props {
  currentLevel: number
  currentRound: number
  phase: 'intro' | 'map' | 'explore' | 'battle' | 'shop'
  player: Player
  levelRoutes: LevelRoute[][]
  chosenRoute: number | null
  routeNodeIdx: number
  onChooseRoute: (idx: number) => void
  onProceed: () => void
  onEat: (id: string) => void
  popupOpen?: boolean
  onClosePopup?: () => void
  onOpenRelics?: () => void
}

const SEPPO_ICON = 'assets/characters/seppo/rotations/south.png'
const FIGHT_ICON = 'assets/map_icons/fight_map_icon.png'
const ELITE_ICON = 'assets/map_icons/elite_fight_map_icon.png'
const BOSS_ICON = 'assets/map_icons/boss_fight_map_icon.png'
const REST_ICON = 'assets/map_icons/rest_place_map_icon.png'
const MYSTERY_ICON = 'assets/map_icons/question_mark_map_icon.png'
const TREASURE_ICON = 'assets/map_icons/treasure_map_icon.png'

const SHOP_ICON = 'assets/map_icons/shop_map_icon.png'

export default function LevelMap({ currentLevel, currentRound, phase, player, levelRoutes, chosenRoute, routeNodeIdx, onChooseRoute, onProceed, onEat, popupOpen, onClosePopup, onOpenRelics }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)
  const [foodMenuOpen, setFoodMenuOpen] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [restPopupOpen, setRestPopupOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isMapPhase = phase === 'map'
  const visible = isMapPhase || !!popupOpen

  // Auto-scroll so the active node is near the left of the viewport
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      const container = scrollRef.current
      const node = activeRef.current
      if (!container || !node) return
      const containerRect = container.getBoundingClientRect()
      const nodeRect = node.getBoundingClientRect()
      const leftPad = 80
      const targetScroll = container.scrollLeft + (nodeRect.left - containerRect.left) - leftPad
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' })
    }, 150)
    return () => clearTimeout(timer)
  }, [visible, currentLevel, currentRound])

  // Close food menu when leaving map phase
  useEffect(() => { if (!visible) setFoodMenuOpen(false) }, [visible])

  if (!visible) return null

  // Current route info
  const currentRoutes = levelRoutes[currentLevel] || []
  const activeRoute = chosenRoute != null ? currentRoutes[chosenRoute] : null
  const activeNode = activeRoute && routeNodeIdx >= 0 ? activeRoute[routeNodeIdx] : null
  const nodesLeft = activeRoute ? activeRoute.length - routeNodeIdx : 0
  const needsRouteChoice = isMapPhase && chosenRoute == null
  const isAtBoss = activeRoute != null && routeNodeIdx >= activeRoute.length
  const bossType = levelBossType(currentLevel)
  const currentNodeType = isAtBoss && bossType ? bossType : activeNode?.type
  const restHeal = currentNodeType === 'rest' ? Math.round(player.maxHp * 0.4) : 0

  const REST_FLAVOR: Record<string, { title: string; desc: string; icon: string }> = {
    'Office':        { title: 'Nap on the Office Couch', desc: 'Seppo finds the HR meeting room empty, curls up on the couch and sets a 20-minute alarm. Snores loud enough to drown out the open-plan keyboard clatter.', icon: 'weekend' },
    'Park':          { title: 'Doze on a Park Bench', desc: 'Seppo stretches out on a sun-warmed bench, cap pulled over his eyes. Pigeons investigate his shoes. He doesn\'t care.', icon: 'nature' },
    'Street':        { title: 'Lean Against a Dumpster', desc: 'Seppo props himself up in a quiet alley, back against a suspiciously warm dumpster. Not glamorous. Effective.', icon: 'delete' },
    'Ravintola Kulma': { title: 'Corner Table Siesta', desc: 'Seppo commandeers the sticky corner table, folds his arms as a pillow, and closes his eyes. The bartender leaves him be. Regulars know.', icon: 'local_bar' },
  }
  const restFlavor = REST_FLAVOR[LEVEL_NAMES[currentLevel]] ?? { title: 'Rest', desc: 'Seppo takes a breather.', icon: 'self_improvement' }

  const atk = getPlayerAtk(player)
  const def = getPlayerDef(player)
  const crit = Math.round(getCritChance(player) * 100)
  const hpPct = Math.max(0, player.hp / player.maxHp) * 100

  const availFoods = FOODS.filter(f => (player.foods[f.id] || 0) > 0)

  // Buff details
  const buffs: { name: string; detail: string; color: string }[] = []
  for (const b of player.buffs) {
    if (b.turns > 0) {
      buffs.push({ name: b.name, detail: `+${b.val} ${b.type.toUpperCase()} · ${b.turns}t left`, color: 'tertiary' })
    }
  }
  if (player.rageBonus > 0) {
    buffs.push({ name: 'Beer Rage', detail: `+${player.rageBonus} ATK permanent`, color: 'error' })
  }
  if (player.pilsnerTurns > 0) {
    buffs.push({ name: 'Sahti ×2', detail: `Double hit · ${player.pilsnerTurns}t left`, color: 'primary' })
  }
  if (player.regenBonus > 0) {
    buffs.push({ name: 'Regen', detail: `+${player.regenBonus} HP after each fight`, color: 'secondary' })
  }

  function nodeIcon(type: string) {
    if (type === 'boss' || type === 'boss_first') return BOSS_ICON
    if (type === 'elite') return ELITE_ICON
    if (type === 'rest') return REST_ICON
    if (type === 'treasure') return TREASURE_ICON
    if (type === 'shop') return SHOP_ICON
    if (type === 'mystery') return MYSTERY_ICON
    return FIGHT_ICON
  }

  function nodeLabel(type: string) {
    if (type === 'boss') return 'BOSS'
    if (type === 'boss_first') return 'Boss'
    if (type === 'elite') return 'Elite'
    if (type === 'rest') return 'Rest'
    if (type === 'treasure') return 'Treasure'
    if (type === 'shop') return 'Shop'
    if (type === 'mystery') return '???'
    return 'Fight'
  }

  // Summary text for a route (e.g. "3 Fights · 1 Rest")
  function routeSummary(route: LevelRoute) {
    const fights = route.filter(n => n.type === 'fight' || n.type === 'boss_first').length
    const elites = route.filter(n => n.type === 'elite').length
    const rests = route.filter(n => n.type === 'rest').length
    const treasures = route.filter(n => n.type === 'treasure').length
    const shops = route.filter(n => n.type === 'shop').length
    const mysteries = route.filter(n => n.type === 'mystery').length
    const boss = route.filter(n => n.type === 'boss').length
    const parts: string[] = []
    if (fights) parts.push(`${fights} Fight${fights > 1 ? 's' : ''}`)
    if (elites) parts.push(`${elites} Elite`)
    if (rests) parts.push(`${rests} Rest`)
    if (treasures) parts.push(`${treasures} Treasure`)
    if (shops) parts.push(`${shops} Shop${shops > 1 ? 's' : ''}`)
    if (mysteries) parts.push(`${mysteries} ???`)
    if (boss) parts.push('Boss')
    return parts.join(' · ')
  }

  return (
    <div className="fixed inset-0 z-[90] bg-surface flex flex-col">
      {/* Header row: HUD + title + close */}
      <div className="shrink-0 py-1 px-2 sm:py-3 sm:px-6 flex items-center gap-2 sm:gap-3">
        {/* Player HUD — mobile: level + HP only; desktop: full stats with hover */}
        {isMobile ? (
          <div className="flex items-center gap-1.5 bg-surface-container/80 pixel-border px-2 py-1 shrink-0">
            <span className="font-headline text-[10px] text-primary leading-none">Lv.{player.level}</span>
            <div className="w-16 h-1.5 bg-surface-container-highest rounded-sm overflow-hidden">
              <div className="h-full bg-error transition-all duration-300 rounded-sm" style={{ width: `${hpPct}%` }} />
            </div>
            <span className="font-label text-[9px] text-on-surface-variant/60">{player.hp}/{player.maxHp}</span>
          </div>
        ) : (
          <div
            className="relative shrink-0"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <div className="flex items-center gap-2 bg-surface-container/80 pixel-border p-3 cursor-default">
              <div className="w-12 h-12 bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-headline text-primary text-sm tracking-tight leading-none">SEPPO</span>
                  <span className="font-label text-xs text-on-surface-variant/70">Lv.{player.level}</span>
                </div>
                <div className="w-32 h-2 bg-surface-container-highest rounded-sm overflow-hidden">
                  <div className="h-full bg-error transition-all duration-300 rounded-sm" style={{ width: `${hpPct}%` }} />
                </div>
                <span className="font-label text-[10px] text-on-surface-variant/60">{player.hp}/{player.maxHp} HP</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-label text-[10px] text-tertiary">
                    <span className="material-symbols-outlined text-[10px] align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span> {atk}
                  </span>
                  <span className="font-label text-[10px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[10px] align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span> {def}
                  </span>
                  <span className="font-label text-[10px] text-amber-400">
                    <span className="material-symbols-outlined text-[10px] align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> {crit}%
                  </span>
                </div>
              </div>
            </div>

            {/* ── EXPANDED HOVER POPUP ── */}
            {hovering && (
              <div className="absolute top-full left-0 mt-1 z-50 w-80 bg-surface-container pixel-border border border-primary/30 p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-20 h-20 bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                    <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-headline text-primary text-xl tracking-tight leading-none">SEPPO</span>
                    <span className="font-label text-xs text-on-surface-variant/70">Level {player.level}</span>
                    <span className="font-label text-xs text-on-surface-variant/50">{LEVEL_NAMES[currentLevel]}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-label text-xs text-error font-bold">HP</span>
                    <span className="font-label text-xs text-on-surface-variant">{player.hp} / {player.maxHp}</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-highest rounded-sm overflow-hidden">
                    <div className="h-full bg-error transition-all duration-300 rounded-sm" style={{ width: `${hpPct}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="flex flex-col items-center bg-surface-container-highest/60 pixel-border p-1.5">
                    <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                    <span className="font-headline text-lg text-tertiary">{atk}</span>
                    <span className="font-label text-[9px] text-on-surface-variant/60 uppercase">ATK</span>
                    {player.weapon && <span className="font-label text-[8px] text-tertiary/60">({player.baseAtk}+{player.weapon.atk})</span>}
                  </div>
                  <div className="flex flex-col items-center bg-surface-container-highest/60 pixel-border p-1.5">
                    <span className="material-symbols-outlined text-on-surface-variant text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    <span className="font-headline text-lg text-on-surface-variant">{def}</span>
                    <span className="font-label text-[9px] text-on-surface-variant/60 uppercase">DEF</span>
                  </div>
                  <div className="flex flex-col items-center bg-surface-container-highest/60 pixel-border p-1.5">
                    <span className="material-symbols-outlined text-amber-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    <span className="font-headline text-lg text-amber-400">{crit}%</span>
                    <span className="font-label text-[9px] text-on-surface-variant/60 uppercase">CRIT</span>
                  </div>
                </div>
                <div className="mb-3 bg-surface-container-highest/40 pixel-border p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                    <span className="font-headline text-xs text-primary uppercase tracking-wide">Weapon</span>
                  </div>
                  {player.weapon ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label text-sm text-tertiary font-bold">{player.weapon.name} <span className="text-on-surface-variant/60">+{player.weapon.atk} ATK</span></span>
                      <span className="font-body italic text-[10px] text-on-surface-variant/50">{player.weapon.lore}</span>
                    </div>
                  ) : (
                    <span className="font-label text-xs text-on-surface-variant/40">Bare Fists</span>
                  )}
                </div>
                <div className="bg-surface-container-highest/40 pixel-border p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span className="font-headline text-xs text-primary uppercase tracking-wide">Active Buffs</span>
                  </div>
                  {buffs.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {buffs.map((b, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full bg-${b.color} shrink-0`} />
                          <span className={`font-label text-xs text-${b.color} font-bold`}>{b.name}</span>
                          <span className="font-label text-[10px] text-on-surface-variant/60">{b.detail}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="font-label text-xs text-on-surface-variant/40">Sober — no active buffs</span>
                  )}
                </div>
                {/* Relics */}
                {player.relics.length > 0 && (
                  <div className="bg-surface-container-highest/40 pixel-border p-2 mt-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                      <span className="font-headline text-xs text-primary uppercase tracking-wide">Relics</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {player.relics.map(r => (
                        <div key={r.id} className="flex items-center gap-1 bg-surface-container/60 pixel-border px-1.5 py-0.5" title={r.desc}>
                          <span className="material-symbols-outlined text-sm text-primary/80" style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                          <span className="font-label text-[10px] text-on-surface-variant">{r.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Title + status */}
        <div className="flex-1 text-center">
          <h2 className="font-headline text-xs sm:text-2xl text-primary uppercase tracking-wide leading-none">Journey Map</h2>
          <div className="w-16 sm:w-24 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mt-0.5 mb-0.5 sm:mt-1 sm:mb-1" />
          <span className="font-label text-[8px] sm:text-xs text-on-surface-variant/60 uppercase tracking-wider">
            {needsRouteChoice
              ? `${LEVEL_NAMES[currentLevel]} — Choose a route`
              : activeRoute
                ? `${nodesLeft} stop${nodesLeft !== 1 ? 's' : ''} left in ${LEVEL_NAMES[currentLevel]}`
                : LEVEL_NAMES[currentLevel]}
          </span>
        </div>

        {/* Close button (popup mode only) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {onOpenRelics && (
            <button onClick={onOpenRelics} className="text-on-surface-variant hover:text-primary transition-colors p-0.5 sm:p-1" title="View Relics">
              <span className="material-symbols-outlined text-lg sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
            </button>
          )}
          {!isMapPhase && onClosePopup && (
            <button onClick={onClosePopup} className="text-on-surface-variant hover:text-primary transition-colors p-0.5 sm:p-1">
              <span className="material-symbols-outlined text-lg sm:text-2xl">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Tree map */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto scrollbar-none"
      >
        <div className="flex items-stretch min-h-full min-w-max px-2 sm:px-8 pb-10 sm:pb-20">
          {LEVEL_NAMES.map((name, lvIdx) => {
            const unlocked = lvIdx <= currentLevel
            const isCurrent = lvIdx === currentLevel
            const isCompleted = lvIdx < currentLevel
            const lvRoutes = levelRoutes[lvIdx] || []
            const doneIdx = isCompleted ? lvRoutes.findIndex(r => r.length > 0 && r.every(n => n.done)) : -1
            const routesToShow = isCompleted ? (doneIdx >= 0 ? [lvRoutes[doneIdx]] : lvRoutes.slice(0, 1)) : lvRoutes

            if (!unlocked || routesToShow.length === 0) {
              return (
                <div key={lvIdx} className="flex items-stretch shrink-0">
                  <div className="relative flex flex-col items-center justify-center px-8 py-4" style={{ minWidth: 120 }}>
                    <div className="absolute inset-0 bg-surface-container-lowest/50" />
                    <div className="relative z-10 flex flex-col items-center gap-2 opacity-30">
                      <img src={MYSTERY_ICON} alt="???" className="w-10 h-10 sprite-canvas" />
                      <span className="font-headline text-xs text-on-surface-variant/30 uppercase tracking-wider">???</span>
                    </div>
                  </div>
                  {lvIdx < LEVEL_NAMES.length - 1 && (
                    <div className="flex items-center shrink-0">
                      <svg width="40" height="4"><line x1="0" y1="2" x2="40" y2="2" stroke="#45483e33" strokeWidth="2" strokeDasharray="8 5" /></svg>
                    </div>
                  )}
                </div>
              )
            }

            const numR = routesToShow.length
            const maxLen = Math.max(...routesToShow.map(r => r.length), 1)
            const lvBoss = levelBossType(lvIdx)

            // Tree layout constants — smaller on mobile
            const NS = isMobile ? 44 : 80
            const SX = isMobile ? 110 : 200
            const SY = isMobile ? 80 : 160
            const BW = isMobile ? 80 : 150
            const TP = isMobile ? 30 : 60
            const bossExtra = lvBoss ? BW + NS : 0
            const treeW = 2 * TP + NS + BW + Math.max(0, maxLen - 1) * SX + bossExtra
            const treeH = Math.max(NS + 2 * TP, (numR - 1) * SY + NS + 2 * TP)

            const scx = TP + NS / 2
            const scy = treeH / 2
            const ncx = (j: number) => TP + NS / 2 + BW + j * SX
            const ncy = (ri: number) => treeH / 2 + (ri - (numR - 1) / 2) * SY
            // Boss end node position (right side, centered)
            const bossCx = treeW - TP - NS / 2
            const bossCy = treeH / 2

            // Seppo icon is purely decorative — completed once any route node is done
            const stDone = isCurrent ? routeNodeIdx > 0 : isCompleted

            return (
              <div key={lvIdx} className="flex items-stretch shrink-0">
                <div className="relative flex flex-col" style={{ minWidth: `${treeW + 32}px`, minHeight: `${treeH + 80}px` }}>
                  {/* Level background */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img src={LEVEL_BGS[lvIdx]} alt="" className={`w-full h-full object-cover ${isCompleted ? 'opacity-20' : 'opacity-30'}`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-surface" />
                    <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-transparent to-surface/80" />
                  </div>

                  {/* Level label */}
                  <div className="relative z-10 pt-1 sm:pt-3 px-2 sm:px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`material-symbols-outlined ${isMobile ? 'text-[10px]' : 'text-sm'} ${isCompleted ? 'text-secondary' : isCurrent ? 'text-primary' : 'text-on-surface-variant/30'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isCompleted ? 'check_circle' : 'location_on'}
                      </span>
                      <span className={`font-headline ${isMobile ? 'text-[9px]' : 'text-xs sm:text-sm'} uppercase tracking-wider ${isCurrent ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-on-surface-variant/30'}`}>
                        {name}
                      </span>
                    </div>
                  </div>

                  {/* Tree */}
                  <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-2">
                    <div className="relative" style={{ width: treeW, height: treeH }}>
                      {/* SVG connectors */}
                      <svg className="absolute inset-0 pointer-events-none" width={treeW} height={treeH}>
                        {routesToShow.map((route, rIdx) => {
                          if (route.length === 0) return null
                          const isChosen = isCurrent && chosenRoute === rIdx
                          const isOther = isCurrent && chosenRoute != null && !isChosen
                          const x1 = scx + NS / 2
                          const y1 = scy
                          const x2 = ncx(0) - NS / 2
                          const y2 = ncy(rIdx)
                          const mx = (x1 + x2) / 2
                          const branchDone = isChosen ? routeNodeIdx >= 0 : isCompleted
                          const bColor = branchDone ? '#bfcca2' : isChosen ? '#ffba38' : isOther ? '#45483e22' : isCompleted ? '#bfcca2' : '#45483e'
                          return (
                            <g key={`r-${rIdx}`}>
                              <path
                                d={numR === 1 ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
                                stroke={bColor} strokeWidth="3" strokeDasharray="8 4" fill="none"
                              />
                              {route.map((_, nIdx) => {
                                if (nIdx === 0) return null
                                const prevDone = route[nIdx - 1].done
                                const segActive = isChosen && nIdx === routeNodeIdx
                                const sColor = prevDone ? '#bfcca2' : segActive ? '#ffba38' : isOther ? '#45483e22' : isCompleted ? '#bfcca2' : '#45483e'
                                return (
                                  <line key={`s-${rIdx}-${nIdx}`}
                                    x1={ncx(nIdx - 1) + NS / 2} y1={ncy(rIdx)}
                                    x2={ncx(nIdx) - NS / 2} y2={ncy(rIdx)}
                                    stroke={sColor} strokeWidth="3" strokeDasharray="8 4"
                                  />
                                )
                              })}
                            </g>
                          )
                        })}
                        {/* Boss end converging lines */}
                        {lvBoss && routesToShow.map((route, rIdx) => {
                          if (route.length === 0) return null
                          const isChosen = isCurrent && chosenRoute === rIdx
                          const isOther = isCurrent && chosenRoute != null && !isChosen
                          const lastIdx = route.length - 1
                          const x1 = ncx(lastIdx) + NS / 2
                          const y1 = ncy(rIdx)
                          const x2 = bossCx - NS / 2
                          const y2 = bossCy
                          const mx = (x1 + x2) / 2
                          const allDone = route.every(n => n.done)
                          const bossReached = isChosen && routeNodeIdx >= route.length
                          const cColor = allDone || isCompleted ? '#bfcca2' : bossReached ? '#ffba38' : isOther ? '#45483e22' : '#45483e'
                          return (
                            <path key={`be-${rIdx}`}
                              d={numR === 1 ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
                              stroke={cColor} strokeWidth="3" strokeDasharray="8 4" fill="none"
                            />
                          )
                        })}
                      </svg>

                      {/* Start node — Seppo (decorative, no event) */}
                      <div
                        ref={isCurrent && needsRouteChoice ? activeRef : undefined}
                        className={`absolute flex items-center justify-center ${stDone ? 'opacity-40' : 'opacity-80'}`}
                        style={{ left: scx - NS / 2, top: scy - NS / 2, width: NS, height: NS }}
                      >
                        <div className="w-full h-full flex items-center justify-center rounded-full bg-surface-container-highest pixel-border overflow-hidden">
                          <img src={SEPPO_ICON} alt="Seppo" className={`w-full h-full object-cover sprite-canvas ${stDone ? 'grayscale' : ''}`} />
                        </div>
                        {stDone && <span className="material-symbols-outlined text-secondary absolute -top-0.5 -right-0.5" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>check_circle</span>}
                      </div>

                      {/* Route nodes */}
                      {routesToShow.map((route, rIdx) => {
                        const isChosen = isCurrent && chosenRoute === rIdx
                        const isSelectable = isCurrent && needsRouteChoice && isMapPhase
                        const isOther = isCurrent && chosenRoute != null && !isChosen
                        return route.map((node, nIdx) => {
                          const isActiveNode = isChosen && nIdx === routeNodeIdx
                          const isDone = node.done
                          const isFuture = isChosen && nIdx > routeNodeIdx
                          return (
                            <div
                              key={`n-${rIdx}-${nIdx}`}
                              ref={isActiveNode ? activeRef : undefined}
                              onClick={() => { if (isSelectable) onChooseRoute(rIdx) }}
                              className={`absolute flex items-center justify-center ${
                                isSelectable ? 'cursor-pointer hover:scale-110 transition-transform' : ''
                              } ${isDone ? 'opacity-40' : isActiveNode ? '' : isFuture ? 'opacity-60' : isOther ? 'opacity-20' : 'opacity-60'}`}
                              style={{ left: ncx(nIdx) - NS / 2, top: ncy(rIdx) - NS / 2, width: NS, height: NS }}
                            >
                              <div className={`w-full h-full flex items-center justify-center rounded ${isActiveNode ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface animate-pulse' : ''}`}>
                                <img src={nodeIcon(node.type)} alt={nodeLabel(node.type)} className={`${isMobile ? 'w-9 h-9' : 'w-16 h-16'} sprite-canvas ${isDone ? 'grayscale' : ''}`} />
                              </div>
                              {isDone && <span className="material-symbols-outlined text-secondary absolute -top-0.5 -right-0.5" style={{ fontVariationSettings: "'FILL' 1", fontSize: '12px' }}>check_circle</span>}
                              {(node.type === 'boss' || node.type === 'boss_first') && (
                                <span className="font-label text-[7px] sm:text-[8px] text-error/70 uppercase tracking-wider absolute -bottom-3 whitespace-nowrap">Boss</span>
                              )}
                              {node.type === 'rest' && (
                                <span className="font-label text-[7px] sm:text-[8px] text-secondary/70 uppercase tracking-wider absolute -bottom-3 whitespace-nowrap">Rest</span>
                              )}
                              {node.type === 'shop' && (
                                <span className="font-label text-[7px] sm:text-[8px] text-amber-400/70 uppercase tracking-wider absolute -bottom-3 whitespace-nowrap">Shop</span>
                              )}
                              {node.type === 'mystery' && (
                                <span className="font-label text-[7px] sm:text-[8px] text-purple-400/70 uppercase tracking-wider absolute -bottom-3 whitespace-nowrap">???</span>
                              )}
                            </div>
                          )
                        })
                      })}

                      {/* Shared boss end node */}
                      {lvBoss && (() => {
                        const bossActive = isCurrent && chosenRoute != null && routeNodeIdx >= (activeRoute?.length ?? 0)
                        const bossDone = isCompleted
                        return (
                          <div
                            ref={bossActive ? activeRef : undefined}
                            className={`absolute flex flex-col items-center justify-center ${bossDone ? 'opacity-40' : bossActive ? '' : 'opacity-60'}`}
                            style={{ left: bossCx - NS / 2, top: bossCy - NS / 2, width: NS, height: NS }}
                          >
                            <div className={`w-full h-full flex items-center justify-center rounded ${bossActive ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface animate-pulse' : ''}`}>
                              <img src={BOSS_ICON} alt="Boss" className={`${isMobile ? 'w-9 h-9' : 'w-16 h-16'} sprite-canvas ${bossDone ? 'grayscale' : ''}`} />
                            </div>
                            {bossDone && <span className="material-symbols-outlined text-secondary absolute -top-0.5 -right-0.5" style={{ fontVariationSettings: "'FILL' 1", fontSize: '12px' }}>check_circle</span>}
                            <span className="font-label text-[7px] sm:text-[8px] text-error/70 uppercase tracking-wider absolute -bottom-3 whitespace-nowrap">Boss</span>
                          </div>
                        )
                      })()}

                      {/* Path labels (selection mode) */}
                      {isCurrent && needsRouteChoice && routesToShow.map((route, rIdx) => (
                        <div
                          key={`lbl-${rIdx}`}
                          className="absolute pointer-events-none"
                          style={{ left: ncx(0) - NS / 2, top: ncy(rIdx) - NS / 2 - 16 }}
                        >
                          <span className="font-label text-[8px] sm:text-[9px] text-primary/60 uppercase tracking-wider whitespace-nowrap">
                            Path {rIdx + 1} · {routeSummary(route)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Level connector */}
                {lvIdx < LEVEL_NAMES.length - 1 && (
                  <div className="flex items-center shrink-0">
                    <svg width="80" height="6">
                      <line x1="0" y1="3" x2="80" y2="3"
                        stroke={lvIdx < currentLevel ? '#bfcca2' : '#45483e33'}
                        strokeWidth="2" strokeDasharray="10 6" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom bar: eat button + proceed */}
      <div className="shrink-0 flex items-center justify-center gap-2 sm:gap-5 py-1 sm:py-3 px-2 sm:px-3 bg-gradient-to-t from-surface via-surface to-transparent">
        {/* Food submenu (opened by Eat button) */}
        {isMapPhase && foodMenuOpen && (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => setFoodMenuOpen(false)}
              className="relative group w-20 h-11 sm:h-12 bg-surface-container-highest pixel-border border-on-surface-variant/20 border active:translate-y-0.5 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">arrow_back</span>
                <span className="font-headline text-xs text-on-surface-variant/50 uppercase">Back</span>
              </div>
            </button>
            {availFoods.length > 0 ? availFoods.map(f => (
              <button
                key={f.id}
                onClick={() => { onEat(f.id); if ((player.foods[f.id] || 0) <= 1) setFoodMenuOpen(false) }}
                className="relative group w-36 sm:w-44 bg-surface-container-highest pixel-border border border-secondary/30 hover:border-secondary active:translate-y-0.5 transition-all overflow-hidden flex flex-col items-center p-2 sm:p-3 gap-1"
              >
                <img src={f.img} alt={f.name} className="w-14 h-14 sm:w-16 sm:h-16 object-contain sprite-canvas shrink-0" />
                <span className="font-headline text-xs sm:text-sm text-on-surface uppercase tracking-wide leading-tight">{f.name}</span>
                <span className="font-label text-xs sm:text-sm text-secondary font-bold">{getFoodLabel(f, currentLevel)}</span>
                <span className="font-body italic text-[9px] sm:text-[10px] text-on-surface-variant/50 leading-tight text-center">{f.desc}</span>
                <span className="font-label text-xs text-on-surface-variant/60">×{player.foods[f.id]}</span>
              </button>
            )) : (
              <span className="font-body italic text-xs text-on-surface-variant/40">No food left</span>
            )}
          </div>
        )}

        {/* Eat button (map phase, food menu closed, route chosen) */}
        {isMapPhase && !foodMenuOpen && !needsRouteChoice && availFoods.length > 0 && (
          <button
            onClick={() => setFoodMenuOpen(true)}
            className="relative group w-20 sm:w-32 h-8 sm:h-14 bg-surface-container-highest pixel-border border-secondary/40 border-2 active:translate-y-0.5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-base sm:text-lg">restaurant</span>
              <span className="font-headline text-xs sm:text-sm text-secondary tracking-widest uppercase">Eat</span>
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-950/20 via-transparent to-amber-950/20" />
          </button>
        )}

        {/* Proceed button (map phase, route chosen, food menu closed) */}
        {isMapPhase && !foodMenuOpen && !needsRouteChoice && (
          <div className="flex flex-col items-center gap-1">
            <button
            onClick={currentNodeType === 'rest' ? () => setRestPopupOpen(true) : onProceed}
            className="relative group w-36 sm:w-56 h-8 sm:h-14 bg-surface-container-highest pixel-border border-amber-900 border-2 active:translate-y-0.5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm sm:text-base">
                {currentNodeType === 'boss' || currentNodeType === 'boss_first' ? 'whatshot' : currentNodeType === 'rest' ? 'self_improvement' : currentNodeType === 'treasure' ? 'lock_open' : currentNodeType === 'shop' ? 'storefront' : currentNodeType === 'mystery' ? 'help' : 'swords'}
              </span>
              <span className="font-headline text-[10px] sm:text-lg text-primary tracking-widest uppercase">
                {currentNodeType === 'boss' || currentNodeType === 'boss_first'
                  ? 'Face the Boss'
                  : currentNodeType === 'rest'
                    ? 'Rest Here'
                    : currentNodeType === 'treasure'
                      ? 'Open Treasure'
                      : currentNodeType === 'shop'
                        ? 'Enter Shop'
                        : currentNodeType === 'mystery'
                          ? 'Investigate'
                          : 'Next Fight'}
              </span>
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-950/40 via-transparent to-amber-950/40" />
          </button>
          </div>
        )}

        {/* Rest popup */}
        {restPopupOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRestPopupOpen(false)}>
            <div className="relative bg-surface-container pixel-border border border-secondary/40 p-6 sm:p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="material-symbols-outlined text-secondary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>{restFlavor.icon}</span>
                <h3 className="font-headline text-xl sm:text-2xl text-primary uppercase tracking-wide leading-tight">{restFlavor.title}</h3>
                <p className="font-body italic text-sm text-on-surface-variant/70 leading-relaxed">{restFlavor.desc}</p>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/20 pixel-border border border-secondary/40 mt-1">
                  <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  <span className="font-headline text-base text-secondary">+{restHeal} HP</span>
                  <span className="font-label text-[10px] text-on-surface-variant/60 uppercase">restored</span>
                </div>
                <button
                  onClick={() => { setRestPopupOpen(false); onProceed() }}
                  className="relative w-full h-12 bg-surface-container-highest pixel-border border-secondary border-2 active:translate-y-0.5 transition-all overflow-hidden mt-2"
                >
                  <div className="absolute inset-0 z-10 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-secondary">self_improvement</span>
                    <span className="font-headline text-sm text-secondary tracking-widest uppercase">Take the Rest</span>
                  </div>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-secondary/10 via-transparent to-secondary/10" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Route selection hint */}
        {isMapPhase && needsRouteChoice && (
          <div className="font-label text-xs sm:text-sm text-primary/70 uppercase tracking-wider animate-pulse">
            ← Click a path to choose your route →
          </div>
        )}
      </div>
    </div>
  )
}
