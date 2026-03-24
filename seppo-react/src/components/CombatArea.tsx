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
}

export default function CombatArea({
  playerAnimSet, playerAnimKey, playerAnimSeq,
  enemyAnims, enemyAnimKey, enemyAnimSeq,
  onPlayerAnimComplete, onEnemyAnimComplete,
  floatDamages,
}: Props) {
  const seppoAnims = playerAnimSet === 'east' ? SEPPO_ANIMS_EAST : SEPPO_ANIMS_SOUTH

  return (
    <div className="relative z-10 w-full flex-1 flex items-end justify-around px-16 max-w-5xl pb-4">
      {/* Hero Sprite */}
      <div className="relative" id="player-sprite-box">
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-36 h-6 bg-black/30 blur-xl rounded-full" />
        <Sprite
          animSet={seppoAnims}
          animKey={playerAnimKey}
          animSeq={playerAnimSeq}
          onComplete={onPlayerAnimComplete}
          className="w-56 h-56 object-contain drop-shadow-[0_15px_40px_rgba(255,186,56,0.25)] transition-transform duration-200"
        />
        {/* Float damage on player */}
        {floatDamages.filter(d => d.target === 'player').map(d => (
          <span key={d.id} className="float-dmg" style={{ color: d.color, left: '30%', top: '10px' }}>
            -{d.dmg}
          </span>
        ))}
      </div>

      {/* VS */}
      <div className="font-headline text-surface-container-highest text-8xl opacity-15 italic select-none self-center">VS</div>

      {/* Enemy Sprite */}
      <div className="relative" id="enemy-sprite-box">
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-44 h-7 bg-black/40 blur-xl rounded-full" />
        {enemyAnims ? (
          <Sprite
            animSet={enemyAnims}
            animKey={enemyAnimKey}
            animSeq={enemyAnimSeq}
            onComplete={onEnemyAnimComplete}
            className="w-56 h-56 object-contain brightness-90 transition-transform duration-200"
          />
        ) : (
          <div className="text-8xl transition-transform duration-200 brightness-90 w-56 h-56 flex items-center justify-center">❓</div>
        )}
        {/* Float damage on enemy */}
        {floatDamages.filter(d => d.target === 'enemy').map(d => (
          <span key={d.id} className="float-dmg" style={{ color: d.color, left: '30%', top: '10px' }}>
            -{d.dmg}
          </span>
        ))}
      </div>
    </div>
  )
}
