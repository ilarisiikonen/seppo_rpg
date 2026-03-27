import { useEffect, useRef, useState } from 'react'
import Sprite from './Sprite'
import type { AnimSet, FloatDmg } from '../types'
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
}

export default function CombatArea({
  playerAnimSet, playerAnimKey, playerAnimSeq,
  enemyAnims, enemyAnimKey, enemyAnimSeq,
  onPlayerAnimComplete, onEnemyAnimComplete,
  floatDamages, blockAmount, isBlocking, actionsLeft, inBattle, enemyIntents, enemyWillBlock, enemyBlocking, enemyDef, enemyMirrored,
}: Props) {
  const seppoAnims = playerAnimSet === 'east' ? SEPPO_ANIMS_EAST : SEPPO_ANIMS_SOUTH

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
        {/* Enemy block indicator */}
        {enemyBlocking > 0 && (
          <div className="absolute -top-6 sm:-top-10 left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded bg-surface-container-highest/90 pixel-border border-secondary animate-pulse">
            <span className="material-symbols-outlined text-secondary text-base sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-headline text-sm sm:text-xl text-secondary tabular-nums">{enemyBlocking}</span>
          </div>
        )}
        {/* Enemy intent icons — shown during player turn */}
        {inBattle && actionsLeft > 0 && !enemyBlocking && (enemyIntents.length > 0 || enemyWillBlock) && (
          <div className="absolute -top-6 sm:-top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded bg-surface-container-highest/90 pixel-border border-error/40">
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
          </div>
        )}
      </div>
    </div>
  )
}
