import { useEffect, useRef, useState } from 'react'
import Sprite from './Sprite'
import type { AnimSet, FloatDmg, Debuff, DebuffType } from '../types'
import { SEPPO_ANIMS_SOUTH, SEPPO_ANIMS_EAST } from '../gameData'

interface Props {
  playerAnimSet: 'south' | 'east'
  playerAnimKey: string
  playerAnimSeq: number
  enemyAnims: AnimSet | null
  enemyAnimKey: string
  enemyAnimSeq: number
  onPlayerAnimComplete: () => void
  onEnemyAnimComplete: () => void
  floatDamages: FloatDmg[]
  blockAmount: number
  isBlocking: number
  actionsLeft: number
  inBattle: boolean
  enemyIntents: number[]
  enemyWillBlock: boolean
  enemyBlocking: number
  enemyDef: number
  enemyMirrored?: boolean
  playerDebuffs: Debuff[]
  enemyDebuffs: Debuff[]
  enemyWillDebuff: DebuffType | null
}

export default function CombatArea({
  playerAnimSet, playerAnimKey, playerAnimSeq,
  enemyAnims, enemyAnimKey, enemyAnimSeq,
  onPlayerAnimComplete, onEnemyAnimComplete,
  floatDamages, blockAmount, isBlocking, actionsLeft, inBattle, enemyIntents, enemyWillBlock, enemyBlocking, enemyDef, enemyMirrored,
  playerDebuffs, enemyDebuffs, enemyWillDebuff,
}: Props) {
  const seppoAnims = playerAnimSet === 'east' ? SEPPO_ANIMS_EAST : SEPPO_ANIMS_SOUTH

  const DEBUFF_ICON: Record<DebuffType, { icon: string; color: string; label: string; desc: string }> = {
    weak: { icon: 'trending_down', color: 'text-orange-400', label: 'Weak', desc: 'Deal 25% less attack damage.' },
    vulnerable: { icon: 'broken_image', color: 'text-red-400', label: 'Vulnerable', desc: 'Take 50% more damage from attacks.' },
    frail: { icon: 'heart_broken', color: 'text-yellow-400', label: 'Frail', desc: 'Block gained is reduced by 25%.' },
    alcohol_poison: { icon: 'local_bar', color: 'text-green-400', label: 'Alcohol Poisoning', desc: 'Take damage after drinking any beer.' },
    poisoned: { icon: 'skull', color: 'text-purple-400', label: 'Poisoned', desc: 'Take damage at the end of every turn.' },
  }

  function DebuffRow({ debuffs }: { debuffs: Debuff[] }) {
    if (!debuffs.length) return null
    return (
      <div className="flex gap-1 justify-center mt-1">
        {debuffs.map((d) => {
          const info = DEBUFF_ICON[d.type]
          return (
            <div key={d.type} className={`group relative flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/50 ${info.color} cursor-help`}>
              <span className="material-symbols-outlined text-xs sm:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{info.icon}</span>
              <span className="font-headline text-[10px] sm:text-xs tabular-nums">{d.turns}</span>
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-40 sm:w-48 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="bg-surface-container-highest/95 pixel-border border border-outline/30 rounded p-2 text-center shadow-xl">
                  <div className={`font-headline text-xs sm:text-sm ${info.color} uppercase tracking-wide`}>{info.label}</div>
                  {d.val > 0 && <div className="font-headline text-[10px] sm:text-xs text-on-surface tabular-nums">{d.val} dmg</div>}
                  <div className="font-body text-[10px] sm:text-xs text-on-surface-variant/80 mt-0.5 leading-snug">{info.desc}</div>
                  <div className="font-label text-[9px] sm:text-[10px] text-on-surface-variant/50 mt-1">{d.turns} turn{d.turns !== 1 ? 's' : ''} left</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Turn banner state
  const [banner, setBanner] = useState<{ text: string; color: string; key: number } | null>(null)
  const prevActionsRef = useRef(actionsLeft)
  const prevBattleRef = useRef(inBattle)

  useEffect(() => {
    const wasInBattle = prevBattleRef.current
    const prevActions = prevActionsRef.current
    prevActionsRef.current = actionsLeft
    prevBattleRef.current = inBattle

    if (!inBattle) return

    // Battle just started
    if (!wasInBattle && inBattle) {
      setBanner({ text: 'Your Turn', color: 'text-primary', key: Date.now() })
      return
    }

    // Player turn started (enemy finished → actions refilled)
    if (prevActions === 0 && actionsLeft > 0) {
      setBanner({ text: 'Your Turn', color: 'text-primary', key: Date.now() })
      return
    }

    // Enemy turn started (actions ran out)
    if (prevActions > 0 && actionsLeft === 0) {
      setBanner({ text: 'Enemy Turn', color: 'text-error', key: Date.now() })
    }
  }, [actionsLeft, inBattle])

  return (
    <div className="relative z-10 w-full flex-1 flex items-end justify-around px-2 sm:px-16 max-w-5xl min-h-0 pb-2 sm:pb-10">
      {/* Hero Sprite */}
      <div className="relative" id="player-sprite-box">
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 sm:w-36 h-3 sm:h-6 bg-black/30 blur-xl rounded-full" />
        <Sprite
          animSet={seppoAnims}
          animKey={playerAnimKey}
          animSeq={playerAnimSeq}
          onComplete={onPlayerAnimComplete}
          className="object-contain drop-shadow-[0_15px_40px_rgba(255,186,56,0.25)] transition-transform duration-200"
          style={{ width: 'clamp(5.5rem, 20vh, 14rem)', height: 'clamp(5.5rem, 20vh, 14rem)' }}
        />
        {/* Float damage on player */}
        {floatDamages.filter(d => d.target === 'player').map(d => (
          <span key={d.id} className="float-dmg" style={{ color: d.color, left: '30%', top: '10px' }}>
            -{d.dmg}
          </span>
        ))}
        {/* Block indicator */}
        {isBlocking > 0 && (
          <div className="absolute -top-6 sm:-top-10 left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded bg-surface-container-highest/90 pixel-border border-secondary animate-pulse">
            <span className="material-symbols-outlined text-secondary text-base sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-headline text-sm sm:text-xl text-secondary tabular-nums">{isBlocking}</span>
          </div>
        )}
        {/* Player debuffs */}
        <DebuffRow debuffs={playerDebuffs} />
      </div>

      {/* VS */}
      <div className="self-center hidden sm:flex flex-col items-center gap-1">
        <div className="font-headline text-surface-container-highest text-4xl sm:text-8xl opacity-15 italic select-none">VS</div>
      </div>

      {/* Turn banner overlay */}
      {banner && (
        <div key={banner.key} className="turn-banner absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <span className={`font-headline text-2xl sm:text-4xl uppercase tracking-[0.25em] ${banner.color} drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]`}>
            {banner.text}
          </span>
        </div>
      )}

      {/* Enemy Sprite */}
      <div className="relative" id="enemy-sprite-box">
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 sm:w-44 h-3 sm:h-7 bg-black/40 blur-xl rounded-full" />
        {enemyAnims ? (
          <Sprite
            animSet={enemyAnims}
            animKey={enemyAnimKey}
            animSeq={enemyAnimSeq}
            onComplete={onEnemyAnimComplete}
            className="object-contain brightness-90 transition-transform duration-200"
            style={{ width: 'clamp(5.5rem, 20vh, 14rem)', height: 'clamp(5.5rem, 20vh, 14rem)', transform: enemyMirrored ? 'scaleX(-1)' : undefined }}
          />
        ) : (
          <div className="text-4xl sm:text-8xl transition-transform duration-200 brightness-90 flex items-center justify-center" style={{ width: 'clamp(5.5rem, 20vh, 14rem)', height: 'clamp(5.5rem, 20vh, 14rem)' }}>❓</div>
        )}
        {/* Float damage on enemy */}
        {floatDamages.filter(d => d.target === 'enemy').map(d => (
          <span key={d.id} className="float-dmg" style={{ color: d.color, left: '30%', top: '10px' }}>
            -{d.dmg}
          </span>
        ))}
        {/* Enemy block + intent row */}
        {(enemyBlocking > 0 || (inBattle && actionsLeft > 0 && (enemyIntents.length > 0 || enemyWillBlock || enemyWillDebuff))) && (
          <div className="absolute -top-6 sm:-top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded bg-surface-container-highest/90 pixel-border border-error/40">
            {enemyBlocking > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1.5 animate-pulse">
                <span className="material-symbols-outlined text-secondary text-base sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span className="font-headline text-sm sm:text-xl text-secondary tabular-nums">{enemyBlocking}</span>
              </div>
            )}
            {inBattle && actionsLeft > 0 && (enemyIntents.length > 0 || enemyWillBlock || enemyWillDebuff) && (
              <>
                {enemyBlocking > 0 && <div className="w-px h-4 sm:h-6 bg-outline/30 mx-1 sm:mx-2" />}
                {enemyWillDebuff && (
                  <div className={`flex items-center gap-0.5 ${DEBUFF_ICON[enemyWillDebuff].color}`}>
                    <span className="material-symbols-outlined text-base sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{DEBUFF_ICON[enemyWillDebuff].icon}</span>
                  </div>
                )}
                {enemyWillBlock && (
                  <div className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-secondary text-base sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    <span className="font-headline text-sm sm:text-lg text-secondary tabular-nums">{enemyDef}</span>
                  </div>
                )}
                {enemyIntents.map((dmg, i) => (
                  <div key={i} className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-error text-base sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                    <span className="font-headline text-sm sm:text-lg text-error tabular-nums">{dmg}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
        {/* Enemy debuffs */}
        <DebuffRow debuffs={enemyDebuffs} />
      </div>
    </div>
  )
}
