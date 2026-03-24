import type { Player, Beer, Food } from '../types'
import { BEERS, FOODS, TIER_LABELS, TIER_COLORS, ROUNDS_PER_LEVEL, getStatLabel, getFoodLabel } from '../gameData'

interface Props {
  player: Player
  inBattle: boolean
  actionsLeft: number
  usedCount: number
  currentLevel: number
  currentRound: number
  subMenuType: 'beer' | 'food' | null
  onAttack: () => void
  onDrink: (id: string) => void
  onEat: (id: string) => void
  onFlee: () => void
  onOpenBeer: () => void
  onOpenFood: () => void
  onCloseSubMenu: () => void
  onExplore: () => void
  onRest: () => void
  phase: 'intro' | 'explore' | 'battle'
}

export default function BottomUI({
  player, inBattle, actionsLeft, usedCount, currentLevel, currentRound,
  subMenuType, onAttack, onDrink, onEat, onFlee, onOpenBeer, onOpenFood,
  onCloseSubMenu, onExplore, onRest, phase,
}: Props) {
  let totalItems = 0
  for (const k in player.beers) totalItems += player.beers[k]
  for (const k in player.foods) totalItems += player.foods[k]

  const isBossRound = currentLevel === 2 && currentRound === ROUNDS_PER_LEVEL - 1

  return (
    <div className="relative z-20 w-full flex flex-col items-center gap-3">
      {/* Card hand */}
      <CardHand player={player} currentLevel={currentLevel} inBattle={inBattle} onDrink={onDrink} onEat={onEat} />

      {/* Piles & actions */}
      <div className="w-full max-w-6xl flex items-end justify-between pb-3">
        {/* DECK */}
        <div className="relative cursor-help" title="Your beer cellar">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-24">
              <div className="absolute inset-0 bg-surface-container-highest pixel-border translate-x-1.5 translate-y-1.5 opacity-30" />
              <div className="absolute inset-0 bg-surface-container-highest pixel-border translate-x-0.5 translate-y-0.5 opacity-60" />
              <div className="absolute inset-0 bg-surface-container-high pixel-border border-primary/40 border flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">sports_bar</span>
              </div>
            </div>
            <div className="mt-3 bg-surface-container-low px-3 py-0.5 pixel-border">
              <span className="font-label text-[10px] text-primary font-bold">ITEMS: {totalItems}</span>
            </div>
          </div>
        </div>

        {/* ACTION AREA */}
        <div className="flex gap-2 items-center">
          {/* Battle actions */}
          {phase === 'battle' && !subMenuType && (
            <div className="flex gap-2 items-center">
              <div className="flex flex-col items-center justify-center mr-1">
                <span className="font-label text-[10px] text-on-surface-variant uppercase">Acts</span>
                <span className="font-headline text-lg text-primary">{actionsLeft}</span>
              </div>
              <ActionButton onClick={onAttack} icon="swords" label="Attack" color="tertiary" width="w-32" />
              <ActionButton onClick={onOpenBeer} icon="sports_bar" label="Drink" color="primary" width="w-32" />
              <ActionButton onClick={onOpenFood} icon="restaurant" label="Eat" color="secondary" width="w-32" />
              <ActionButton onClick={onFlee} icon="directions_run" label="Flee" color="on-surface-variant/50" width="w-24" />
            </div>
          )}

          {/* Explore actions */}
          {phase === 'explore' && (
            <div className="flex gap-3 items-center">
              <button onClick={onExplore} className="explore-btn relative group w-48 h-16 bg-surface-container-highest pixel-border border-amber-900 border-2 active:translate-y-0.5 transition-all overflow-hidden">
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-primary">{isBossRound ? 'whatshot' : 'swords'}</span>
                  <span className="font-headline text-lg text-primary tracking-widest uppercase">{isBossRound ? 'Face Ismo' : 'Next Fight'}</span>
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-950/30 via-transparent to-amber-950/30" />
              </button>
              <button onClick={onRest} className="explore-btn relative group w-44 h-16 bg-surface-container-highest pixel-border border-secondary/30 border-2 active:translate-y-0.5 transition-all overflow-hidden">
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-secondary">local_bar</span>
                  <span className="font-headline text-lg text-secondary tracking-widest uppercase">Rest</span>
                </div>
              </button>
            </div>
          )}

          {/* Sub-menu */}
          {subMenuType && (
            <SubMenu
              type={subMenuType}
              player={player}
              currentLevel={currentLevel}
              onDrink={onDrink}
              onEat={onEat}
              onClose={onCloseSubMenu}
            />
          )}
        </div>

        {/* DISCARD */}
        <div className="relative cursor-help" title="Used cards">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-24">
              <div className="absolute inset-0 bg-surface-container-highest pixel-border translate-x-[-6px] translate-y-0.5 rotate-[-12deg] opacity-20" />
              <div className="absolute inset-0 bg-surface-container-high pixel-border border-tertiary/20 border flex items-center justify-center opacity-80">
                <span className="material-symbols-outlined text-tertiary/50 text-2xl">delete_sweep</span>
              </div>
            </div>
            <div className="mt-3 bg-surface-container-low px-3 py-0.5 pixel-border">
              <span className="font-label text-[10px] text-tertiary/80 font-bold">USED: {usedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Action Button ─────────────────────────── */

function ActionButton({ onClick, icon, label, color, width }: {
  onClick: () => void; icon: string; label: string; color: string; width: string
}) {
  return (
    <button
      onClick={onClick}
      className={`action-btn relative group ${width} h-14 bg-surface-container-highest pixel-border border-${color}/60 border active:translate-y-0.5 transition-all overflow-hidden`}
    >
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-1.5">
        <span className={`material-symbols-outlined text-${color} text-lg`}>{icon}</span>
        <span className={`font-headline text-sm text-${color} tracking-widest uppercase`}>{label}</span>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-950/30 via-transparent to-amber-950/30" />
    </button>
  )
}

/* ── Sub Menu (Beer / Food) ────────────────── */

function SubMenu({ type, player, currentLevel, onDrink, onEat, onClose }: {
  type: 'beer' | 'food'; player: Player; currentLevel: number
  onDrink: (id: string) => void; onEat: (id: string) => void; onClose: () => void
}) {
  const items = type === 'beer'
    ? BEERS.filter(b => (player.beers[b.id] || 0) > 0)
    : FOODS.filter(f => (player.foods[f.id] || 0) > 0)

  return (
    <div className="flex gap-2 items-center flex-wrap justify-center max-w-4xl">
      <button
        onClick={onClose}
        className="relative group w-20 h-12 bg-surface-container-highest pixel-border border-on-surface-variant/20 border active:translate-y-0.5 transition-all overflow-hidden"
      >
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">arrow_back</span>
          <span className="font-headline text-xs text-on-surface-variant/50 uppercase">Back</span>
        </div>
      </button>
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          type={type}
          count={type === 'beer' ? player.beers[item.id] : player.foods[item.id]}
          currentLevel={currentLevel}
          playerLevel={player.level}
          onClick={() => type === 'beer' ? onDrink(item.id) : onEat(item.id)}
        />
      ))}
    </div>
  )
}

/* ── Item Card ─────────────────────────────── */

function ItemCard({ item, type, count, currentLevel, playerLevel, onClick }: {
  item: Beer | Food; type: 'beer' | 'food'; count: number
  currentLevel: number; playerLevel: number; onClick: () => void
}) {
  const stat = type === 'beer'
    ? getStatLabel(item as Beer, currentLevel, playerLevel)
    : getFoodLabel(item as Food, currentLevel)
  const tierStr = TIER_LABELS[item.tier || 1]
  const tierClr = TIER_COLORS[item.tier || 1]

  return (
    <div
      className="beer-menu-card w-40 h-56 parchment-texture pixel-border p-1.5 flex-shrink-0"
      onClick={onClick}
    >
      <div className={`h-full w-full border border-${item.color}/20 flex flex-col items-center justify-between relative`}>
        <div className="flex w-full justify-between px-1 z-10">
          <span className={`font-label text-[10px] text-${item.color}`}>×{count}</span>
          <span className={`font-label text-[10px] text-${tierClr}`}>{tierStr}</span>
        </div>
        <div className="flex-1 w-full bg-surface-container-lowest flex items-center justify-center overflow-hidden relative">
          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm px-1 py-0.5 text-center">
            <span className={`font-headline text-[11px] text-${item.color} uppercase tracking-wide`}>{stat}</span>
          </div>
        </div>
        <div className="text-center py-0.5 px-1">
          <h3 className="font-headline text-[11px] text-on-surface uppercase">{item.name}</h3>
          <p className="font-body italic text-[8px] text-on-surface-variant leading-tight">{item.desc}</p>
        </div>
        <div className={`h-0.5 w-full bg-${item.color}/20`} />
      </div>
    </div>
  )
}

/* ── Card Hand (Fan) ───────────────────────── */

function CardHand({ player, currentLevel, inBattle, onDrink, onEat }: {
  player: Player; currentLevel: number; inBattle: boolean
  onDrink: (id: string) => void; onEat: (id: string) => void
}) {
  const cards: { type: 'beer' | 'food'; data: Beer | Food }[] = []
  BEERS.forEach(b => {
    const ct = player.beers[b.id] || 0
    for (let i = 0; i < ct; i++) cards.push({ type: 'beer', data: b })
  })
  FOODS.forEach(f => {
    const ct = player.foods[f.id] || 0
    for (let i = 0; i < ct; i++) cards.push({ type: 'food', data: f })
  })

  if (!cards.length) {
    return (
      <div className="flex items-end justify-center h-60 w-full relative -mb-8">
        <div className="font-body italic text-sm text-on-surface-variant/40 self-center">No cards in hand</div>
      </div>
    )
  }

  const total = cards.length
  const spreadAngle = Math.min(total * 5, 60)
  const startAngle = -spreadAngle / 2
  const step = total > 1 ? spreadAngle / (total - 1) : 0
  const centerPct = 50
  const spreadPct = Math.min(total * 5, 70)

  return (
    <div className="flex items-end justify-center h-60 w-full relative -mb-8">
      {cards.map((card, i) => {
        const angle = startAngle + step * i
        const leftPct = centerPct - spreadPct / 2 + (total > 1 ? (spreadPct * i / (total - 1)) : 0)
        const yOffset = Math.abs(angle) * 0.4
        const c = card.data
        const color = c.color || 'primary'
        const isFood = card.type === 'food'
        const stat = isFood
          ? getFoodLabel(c as Food, currentLevel)
          : getStatLabel(c as Beer, currentLevel, player.level)
        const countLabel = isFood ? `×${player.foods[c.id] || 1}` : `×${player.beers[c.id] || 1}`
        const tierStr = TIER_LABELS[c.tier || 1]
        const tierClr = TIER_COLORS[c.tier || 1]

        return (
          <div
            key={`${c.id}-${i}`}
            className="card-fan-item w-40 h-56 parchment-texture pixel-border absolute bottom-0 cursor-pointer p-1.5"
            style={{
              left: `${leftPct}%`,
              transform: `rotate(${angle}deg) translateY(${yOffset}px)`,
            }}
            onClick={inBattle ? () => (isFood ? onEat(c.id) : onDrink(c.id)) : undefined}
          >
            <div className={`h-full w-full border border-${color}/20 flex flex-col items-center justify-between relative`}>
              <div className="flex w-full justify-between px-0.5 z-10">
                <span className={`font-label text-[9px] text-${color}`}>{countLabel}</span>
                <span className={`font-label text-[9px] text-${tierClr}`}>{tierStr}</span>
              </div>
              <div className="flex-1 w-full bg-surface-container-lowest flex items-center justify-center overflow-hidden relative">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm px-1 py-px text-center">
                  <span className={`font-headline text-[10px] text-${color} uppercase tracking-wide`}>{stat}</span>
                </div>
              </div>
              <div className="text-center py-px">
                <h3 className="font-headline text-[10px] text-on-surface uppercase">{c.name}</h3>
              </div>
              <div className={`h-px w-full bg-${color}/20`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
