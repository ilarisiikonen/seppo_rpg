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

  const hpPct = `${Math.max(0, player.hp / player.maxHp) * 100}%`

  return (
    <>
      {/* ── MOBILE COMPACT ── */}
      <div className="sm:hidden flex gap-1.5 bg-surface-container/80 backdrop-blur-sm p-1.5 pixel-border items-stretch">
        <div className="h-9 w-9 bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 self-center">
          <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
        </div>
        <div className="w-1.5 rounded-sm bg-surface-container-highest relative overflow-hidden flex-shrink-0">
          <div className="absolute bottom-0 w-full bg-error transition-all duration-500 rounded-sm" style={{ height: hpPct }} />
        </div>
        <div className="flex flex-col justify-center min-w-0 gap-0.5">
          <div className="flex items-center gap-1">
            <span className="font-headline text-primary text-[11px] tracking-tight leading-none">SEPPO</span>
            <span className="font-label text-[8px] text-on-surface-variant/70">{player.hp}/{player.maxHp}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-tertiary text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
            <span className="font-label text-[9px] font-bold text-tertiary">{atk}</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-label text-[9px] font-bold text-on-surface-variant">{def}</span>
            <span className="material-symbols-outlined text-amber-400 text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="font-label text-[9px] font-bold text-amber-400">{crit}%</span>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden sm:flex flex-col gap-[0.6vh] bg-surface-container/80 backdrop-blur-sm p-[1vh_1rem] pixel-border min-w-[280px]">
      <div className="flex items-center gap-3">
        <div className="bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0" style={{ width: 'clamp(2.5rem, 6vh, 4rem)', height: 'clamp(2.5rem, 6vh, 4rem)' }}>
          <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-headline text-primary text-2xl tracking-tight leading-none">SEPPO</span>
          <span className="font-label text-sm uppercase text-on-surface-variant/70 truncate">{levelLabel}</span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="flex items-center gap-2">
        <span className="font-label text-sm text-error font-bold w-8">HP</span>
        <div className="diegetic-scroll flex-1 flex items-center px-1 overflow-hidden" style={{ height: 'clamp(1.25rem, 3.5vh, 2rem)' }}>
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
      <div className="flex items-center gap-4 mt-0.5 flex-wrap">
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
    </>
  )
}
