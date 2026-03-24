import type { Player } from '../types'
import { getPlayerAtk, getPlayerDef, getCritChance, buffSummary } from '../gameData'
import { LEVEL_NAMES, ROUNDS_PER_LEVEL } from '../gameData'

interface Props {
  player: Player
  currentLevel: number
  currentRound: number
  onStatInfo: () => void
}

export default function PlayerHUD({ player, currentLevel, currentRound, onStatInfo }: Props) {
  const atk = getPlayerAtk(player)
  const def = getPlayerDef(player)
  const crit = Math.round(getCritChance(player) * 100)
  const bs = buffSummary(player)
  const isBossRound = currentLevel === 2 && currentRound === ROUNDS_PER_LEVEL - 1
  const levelLabel = `Lvl ${player.level} — ${LEVEL_NAMES[currentLevel]} ${currentRound + 1}/${isBossRound ? 'BOSS' : ROUNDS_PER_LEVEL}`

  return (
    <div className="flex flex-col gap-2.5 bg-surface-container/80 backdrop-blur-sm p-4 pixel-border min-w-[320px]">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0">
          <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
        </div>
        <div className="flex flex-col flex-1">
          <span className="font-headline text-primary text-2xl tracking-tight leading-none">SEPPO</span>
          <span className="font-label text-sm uppercase text-on-surface-variant/70">{levelLabel}</span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="flex items-center gap-2">
        <span className="font-label text-sm text-error font-bold w-8">HP</span>
        <div className="diegetic-scroll flex-1 h-8 flex items-center px-1 overflow-hidden">
          <div className="h-full bg-error transition-all duration-500" style={{ width: `${Math.max(0, player.hp / player.maxHp) * 100}%` }} />
          <div className="absolute inset-0 flex items-center justify-center font-label text-base font-bold text-on-surface mix-blend-difference">
            {player.hp} / {player.maxHp}
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="flex items-center gap-2">
        <span className="font-label text-sm text-primary/70 font-bold w-8">XP</span>
        <div className="flex-1 h-3 bg-surface-container-highest overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${Math.max(0, player.xp / player.xpNext) * 100}%` }} />
        </div>
        <span className="font-label text-sm text-on-surface-variant">{player.xp} / {player.xpNext}</span>
      </div>

      {/* ATK / DEF / CRIT / Weapon */}
      <div className="flex items-center gap-4 mt-0.5">
        <div className="flex items-center gap-1.5 cursor-default" title={`Base: ${player.baseAtk}${player.weapon ? ' + Weapon: ' + player.weapon.atk : ''}`}>
          <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
          <span className="font-label text-lg font-bold text-tertiary">{atk}</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-default" title={`Base: ${player.baseDef}`}>
          <span className="material-symbols-outlined text-on-surface-variant text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          <span className="font-label text-lg font-bold text-on-surface-variant">{def}</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-default">
          <span className="material-symbols-outlined text-amber-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <span className="font-label text-lg font-bold text-amber-400">{crit}%</span>
        </div>
        <div className="h-4 w-px bg-outline/30" />
        <span className="font-label text-sm text-tertiary/80 truncate">
          {player.weapon ? `${player.weapon.name} +${player.weapon.atk}` : 'Bare Fists'}
        </span>
      </div>

      {/* Buff */}
      <div className="flex items-center gap-2">
        <div className="font-label text-sm text-secondary/80 h-5 truncate flex-1 cursor-default">{bs}</div>
        <button onClick={onStatInfo} className="w-6 h-6 flex items-center justify-center bg-surface-container-highest pixel-border text-on-surface-variant/50 hover:text-primary transition-colors flex-shrink-0" title="Stat guide">
          <span className="material-symbols-outlined text-sm">help</span>
        </button>
      </div>
    </div>
  )
}
