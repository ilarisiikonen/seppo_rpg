import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Enemy } from '../types'
import { TRAIT_INFO } from '../gameData'

interface Props {
  enemy: Enemy | null
  playerDef: number
  actionsLeft: number
  inBattle: boolean
}

export default function EnemyHUD({ enemy, playerDef, actionsLeft, inBattle }: Props) {
  const [showLore, setShowLore] = useState(false)
  const hpPct = enemy ? `${Math.max(0, enemy.hp / enemy.maxHp) * 100}%` : '100%'
  const estDmg = enemy ? Math.max(1, enemy.atk - playerDef) : 0
  const showIntent = inBattle && enemy && actionsLeft > 0
  const traits = enemy?.traits ?? []

  return (
    <>
      {/* ── LORE POPUP (portaled to body to escape stacking context) ── */}
      {showLore && enemy && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={() => setShowLore(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-surface-container pixel-border p-5 max-w-sm mx-4 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-surface-container-highest pixel-border p-1 border-tertiary/40 border overflow-hidden" style={{ width: '5rem', height: '5rem' }}>
              <img src={enemy.portrait} alt={enemy.name} className="w-full h-full object-cover sprite-canvas" />
            </div>
            <span className="font-headline text-tertiary text-2xl tracking-tight uppercase text-center">{enemy.name}</span>
            <div className="flex gap-5 items-center">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                <span className="font-label text-lg font-bold text-tertiary">{enemy.atk}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-on-surface-variant text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span className="font-label text-lg font-bold text-on-surface-variant">{enemy.def}</span>
              </div>
            </div>
            <p className="font-label text-on-surface-variant text-sm text-center italic leading-relaxed">"{enemy.lore}"</p>
            {traits.length > 0 && (
              <div className="flex flex-col gap-1.5 w-full mt-1">
                {traits.map(t => {
                  const info = TRAIT_INFO[t]
                  return info ? (
                    <div key={t} className="flex items-center gap-2 bg-surface-container-highest/60 px-2.5 py-1 rounded">
                      <span className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{info.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-label text-xs text-on-surface font-bold">{info.name}</span>
                        <span className="font-label text-[11px] text-on-surface-variant/70">{info.desc}</span>
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            )}
            <button onClick={() => setShowLore(false)} className="mt-1 px-4 py-1 bg-tertiary/20 hover:bg-tertiary/30 pixel-border font-label text-sm text-tertiary transition-colors">
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── MOBILE COMPACT ── */}
      <div
        className="sm:hidden bg-surface-container/80 backdrop-blur-sm px-2.5 py-2 pixel-border transition-opacity duration-300"
        style={{ opacity: enemy ? 1 : 0 }}
      >
        {/* Top row: stats + portrait */}
        <div className="flex gap-2 items-center flex-row-reverse">
          <button
            onClick={() => enemy && setShowLore(true)}
            className="bg-surface-container-highest pixel-border overflow-hidden flex-shrink-0 w-9 h-9 border-tertiary/40 border"
            title="Enemy Info"
          >
            {enemy?.portrait ? (
              <img src={enemy.portrait} alt={enemy.name} className="w-full h-full object-cover sprite-canvas" />
            ) : (
              <span className="text-lg">❓</span>
            )}
          </button>
          <span className="font-headline text-tertiary text-sm tracking-tight leading-none uppercase">{enemy?.name || '???'}</span>
          <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
          <span className="font-label text-sm font-bold text-tertiary">{enemy?.atk ?? '—'}</span>
          <span className="material-symbols-outlined text-on-surface-variant text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          <span className="font-label text-sm font-bold text-on-surface-variant">{enemy?.def ?? '—'}</span>
        </div>
        {/* HP bar */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="font-label text-xs text-tertiary font-bold">HP</span>
          <div className="flex-1 h-3 bg-surface-container-highest overflow-hidden rounded-sm relative">
            <div className="h-full bg-tertiary-container transition-all duration-500 rounded-sm" style={{ width: hpPct }} />
            <span className="absolute inset-0 flex items-center justify-center font-label text-[9px] font-bold text-on-surface mix-blend-difference">{enemy ? `${enemy.hp}/${enemy.maxHp}` : '—'}</span>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div
        className="hidden sm:flex flex-col items-end gap-[0.7vh] bg-surface-container/80 backdrop-blur-sm p-[1.2vh_1.25rem] pixel-border min-w-[320px] transition-opacity duration-300"
        style={{ opacity: enemy ? 1 : 0 }}
      >
        <div className="flex items-center gap-3 flex-row-reverse w-full">
          <div
            className="bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 border-tertiary/40 border overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-tertiary/50 transition-all group relative"
            style={{ width: 'clamp(3.5rem, 7vh, 5rem)', height: 'clamp(3.5rem, 7vh, 5rem)' }}
            onClick={() => enemy && setShowLore(true)}
            title="Lore"
          >
            {enemy?.portrait ? (
              <img src={enemy.portrait} alt={enemy.name} className="w-full h-full object-cover sprite-canvas" />
            ) : (
              <span className="text-4xl">❓</span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined text-white/0 group-hover:text-white/90 text-lg transition-all" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
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
      </div>
    </>
  )
}
