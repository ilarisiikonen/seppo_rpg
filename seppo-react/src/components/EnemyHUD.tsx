import type { Enemy } from '../types'

interface Props {
  enemy: Enemy | null
  playerDef: number
  actionsLeft: number
  inBattle: boolean
}

export default function EnemyHUD({ enemy, playerDef, actionsLeft, inBattle }: Props) {
  const hpPct = enemy ? `${Math.max(0, enemy.hp / enemy.maxHp) * 100}%` : '100%'
  const estDmg = enemy ? Math.max(1, enemy.atk - playerDef) : 0
  const showIntent = inBattle && enemy && actionsLeft > 0

  return (
    <>
      {/* ── MOBILE COMPACT ── */}
      <div
        className="sm:hidden flex gap-2 bg-surface-container/80 backdrop-blur-sm px-3 py-2 pixel-border items-center flex-row-reverse transition-opacity duration-300"
        style={{ opacity: enemy ? 1 : 0 }}
      >
        <div className="w-1.5 h-6 rounded-sm bg-surface-container-highest relative overflow-hidden flex-shrink-0">
          <div className="absolute bottom-0 w-full bg-tertiary-container transition-all duration-500 rounded-sm" style={{ height: hpPct }} />
        </div>
        <span className="font-headline text-tertiary text-sm tracking-tight leading-none uppercase">{enemy?.name || '???'}</span>
        <span className="font-label text-[11px] text-on-surface-variant/70">{enemy ? `${enemy.hp}/${enemy.maxHp}` : '—'}</span>
        <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
        <span className="font-label text-xs font-bold text-tertiary">{enemy?.atk ?? '—'}</span>
        <span className="material-symbols-outlined text-on-surface-variant text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        <span className="font-label text-xs font-bold text-on-surface-variant">{enemy?.def ?? '—'}</span>
      </div>

      {/* ── DESKTOP ── */}
      <div
        className="hidden sm:flex flex-col items-end gap-[0.7vh] bg-surface-container/80 backdrop-blur-sm p-[1.2vh_1.25rem] pixel-border min-w-[320px] transition-opacity duration-300"
        style={{ opacity: enemy ? 1 : 0 }}
      >
        <div className="flex items-center gap-3 flex-row-reverse w-full">
          <div className="bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 border-tertiary/40 border overflow-hidden flex-shrink-0" style={{ width: 'clamp(3.5rem, 7vh, 5rem)', height: 'clamp(3.5rem, 7vh, 5rem)' }}>
            {enemy?.portrait ? (
              <img src={enemy.portrait} alt={enemy.name} className="w-full h-full object-cover sprite-canvas" />
            ) : (
              <span className="text-4xl">❓</span>
            )}
          </div>
          <div className="flex flex-col items-end flex-1">
            <span className="font-headline text-tertiary text-3xl tracking-tight uppercase leading-none">
              {enemy?.name || '???'}
            </span>
          </div>
        </div>

        {/* Enemy HP */}
        <div className="flex items-center gap-2 w-full">
          <span className="font-label text-base text-tertiary font-bold w-8 text-right">HP</span>
          <div className="diegetic-scroll flex-1 flex items-center px-1 overflow-hidden" style={{ height: 'clamp(1.5rem, 4vh, 2.25rem)' }}>
            <div
              className="h-full bg-tertiary-container transition-all duration-500"
              style={{ width: enemy ? `${Math.max(0, enemy.hp / enemy.maxHp) * 100}%` : '100%' }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-label text-base font-bold text-on-surface mix-blend-difference">
              {enemy ? `${enemy.hp} / ${enemy.maxHp}` : '— / —'}
            </div>
          </div>
        </div>

        {/* Enemy ATK / DEF */}
        <div className="flex gap-5 items-center">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
            <span className="font-label text-xl font-bold text-tertiary">{enemy?.atk ?? '—'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-label text-xl font-bold text-on-surface-variant">{enemy?.def ?? '—'}</span>
          </div>
        </div>
      </div>
    </>
  )
}
