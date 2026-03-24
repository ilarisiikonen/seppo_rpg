import type { Enemy } from '../types'

interface Props {
  enemy: Enemy | null
}

export default function EnemyHUD({ enemy }: Props) {
  return (
    <div
      className="flex flex-col items-end gap-2.5 bg-surface-container/80 backdrop-blur-sm p-4 pixel-border min-w-[320px] transition-opacity duration-300"
      style={{ opacity: enemy ? 1 : 0 }}
    >
      <div className="flex items-center gap-3 flex-row-reverse w-full">
        <div className="h-16 w-16 bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 border-tertiary/40 border overflow-hidden flex-shrink-0">
          {enemy?.portrait ? (
            <img src={enemy.portrait} alt={enemy.name} className="w-full h-full object-cover sprite-canvas" />
          ) : (
            <span className="text-4xl">❓</span>
          )}
        </div>
        <div className="flex flex-col items-end flex-1">
          <span className="font-headline text-tertiary text-2xl tracking-tight uppercase leading-none">
            {enemy?.name || '???'}
          </span>
          <span className="font-label text-sm text-on-surface-variant/70 italic">
            {enemy ? `Intent: ~${enemy.atk} dmg` : 'Waiting...'}
          </span>
        </div>
      </div>

      {/* Enemy HP */}
      <div className="flex items-center gap-2 w-full">
        <span className="font-label text-sm text-tertiary font-bold w-8 text-right">HP</span>
        <div className="diegetic-scroll flex-1 h-8 flex items-center px-1 overflow-hidden">
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
          <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
          <span className="font-label text-lg font-bold text-tertiary">{enemy?.atk ?? '—'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-on-surface-variant text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          <span className="font-label text-lg font-bold text-on-surface-variant">{enemy?.def ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}
