import { useState } from 'react'
import type { Player } from '../types'
import { getPlayerAtk, getPlayerDef, getCritChance } from '../gameData'
import { LEVEL_NAMES, LEVEL_ENEMIES, ROUNDS_PER_LEVEL } from '../gameData'

interface Props {
  player: Player
  currentLevel: number
  currentRound: number
  onOpenRelics: () => void
}

export default function PlayerHUD({ player, currentLevel, currentRound, onOpenRelics }: Props) {
  const atk = getPlayerAtk(player)
  const def = getPlayerDef(player)
  const crit = Math.round(getCritChance(player) * 100)
  const [open, setOpen] = useState(false)
  const isBossRound = currentLevel === LEVEL_ENEMIES.length - 1 && currentRound === ROUNDS_PER_LEVEL - 1
  const levelLabel = `Lvl ${player.level} — ${LEVEL_NAMES[currentLevel]} ${currentRound + 1}/${isBossRound ? 'BOSS' : ROUNDS_PER_LEVEL}`
  const hpPct = `${Math.max(0, player.hp / player.maxHp) * 100}%`

  // Build structured buff list
  const buffs: { icon: string; name: string; detail: string; color: string; turns?: number }[] = []
  for (const b of player.buffs) {
    if (b.turns > 0) {
      buffs.push({ icon: 'local_bar', name: b.name, detail: `+${b.val} ${b.type.toUpperCase()}`, color: 'tertiary', turns: b.turns })
    }
  }
  if (player.rageBonus > 0) {
    buffs.push({ icon: 'local_fire_department', name: 'Beer Rage', detail: `+${player.rageBonus} ATK permanent`, color: 'error' })
  }
  if (player.pilsnerTurns > 0) {
    buffs.push({ icon: 'speed', name: 'Sahti ×2', detail: 'Double hit per attack', color: 'primary', turns: player.pilsnerTurns })
  }
  if ((player.blockBonus || 0) > 0) {
    buffs.push({ icon: 'shield', name: 'Block Bonus', detail: `+${player.blockBonus} shield`, color: 'on-surface-variant' })
  }
  if (player.regenBonus > 0) {
    buffs.push({ icon: 'favorite', name: 'Regen', detail: `+${player.regenBonus} HP after fight`, color: 'error' })
  }
  for (const dm of player.dmgModifiers) {
    buffs.push({ icon: 'trending_up', name: dm.label, detail: `+${dm.pct}% DMG`, color: 'tertiary' })
  }

  return (
    <div className="relative">
      {/* ── Compact bar: portrait icon + HP bar ── */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setOpen(o => !o)}
          className="bg-surface-container/80 backdrop-blur-sm pixel-border overflow-hidden flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 active:scale-95 transition-transform"
          title="Player Stats"
        >
          <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
        </button>
        {/* Inline HP bar */}
        <div className="flex items-center gap-1 bg-surface-container/80 backdrop-blur-sm pixel-border px-2 py-1 sm:px-3 sm:py-1.5">
          <span className="font-label text-xs sm:text-sm text-error font-bold">HP</span>
          <div className="w-20 sm:w-32 h-3 sm:h-4 bg-surface-container-highest overflow-hidden rounded-sm relative">
            <div className="h-full bg-error transition-all duration-500 rounded-sm" style={{ width: hpPct }} />
            <span className="absolute inset-0 flex items-center justify-center font-label text-[8px] sm:text-[10px] font-bold text-on-surface mix-blend-difference">
              {player.hp}/{player.maxHp}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats popup ── */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 w-72 sm:w-80 bg-surface-container pixel-border border border-primary/30 p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-surface-container-highest pixel-border overflow-hidden flex-shrink-0 w-10 h-10">
                <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
              </div>
              <div>
                <div className="font-headline text-primary text-lg tracking-tight leading-none">SEPPO</div>
                <div className="font-label text-xs text-on-surface-variant/70 uppercase">{levelLabel}</div>
              </div>
            </div>
            {/* HP */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-label text-xs text-error font-bold w-6">HP</span>
              <div className="flex-1 h-4 bg-surface-container-highest overflow-hidden rounded-sm relative">
                <div className="h-full bg-error transition-all duration-500" style={{ width: `${Math.max(0, player.hp / player.maxHp) * 100}%` }} />
                <span className="absolute inset-0 flex items-center justify-center font-label text-[10px] font-bold text-on-surface mix-blend-difference">{player.hp}/{player.maxHp}</span>
              </div>
            </div>
            {/* XP */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-label text-xs text-primary/70 font-bold w-6">XP</span>
              <div className="flex-1 h-3 bg-surface-container-highest overflow-hidden rounded-sm">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${Math.max(0, player.xp / player.xpNext) * 100}%` }} />
              </div>
              <span className="font-label text-[10px] text-on-surface-variant">{player.xp}/{player.xpNext}</span>
            </div>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                <span className="font-label text-sm font-bold text-tertiary">{atk}</span>
                <span className="font-label text-[10px] text-on-surface-variant/50">ATK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-on-surface-variant text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span className="font-label text-sm font-bold text-on-surface-variant">{def}</span>
                <span className="font-label text-[10px] text-on-surface-variant/50">DEF</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span className="font-label text-sm font-bold text-amber-400">{crit}%</span>
                <span className="font-label text-[10px] text-on-surface-variant/50">CRIT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                <span className="font-label text-sm font-bold text-amber-400">{player.coins}</span>
                <span className="font-label text-[10px] text-on-surface-variant/50">COINS</span>
              </div>
            </div>
            {/* Weapon */}
            <div className="flex items-center gap-1.5 mb-1.5 py-1 border-t border-primary/10">
              <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>hardware</span>
              <span className="font-label text-xs text-tertiary/80">{player.weapon ? `${player.weapon.name} +${player.weapon.atk}` : 'Bare Fists'}</span>
            </div>
            {/* Relics */}
            {player.relics.length > 0 && (
              <div className="flex items-center gap-1.5 mb-1.5 py-1 border-t border-primary/10">
                <button onClick={() => { setOpen(false); onOpenRelics() }} className="flex items-center gap-1.5 hover:opacity-80">
                  <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                  <span className="font-label text-xs text-primary font-bold">{player.relics.length} Relics</span>
                  <span className="font-label text-[10px] text-on-surface-variant/50">Tap to view</span>
                </button>
              </div>
            )}
            {/* Buffs */}
            {buffs.length > 0 && (
              <div className="pt-1 border-t border-primary/10">
                <div className="font-label text-[10px] text-secondary/70 uppercase tracking-widest mb-1">Active Buffs</div>
                <div className="flex flex-col gap-1">
                  {buffs.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={`material-symbols-outlined text-${b.color} text-sm`} style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                      <span className={`font-label text-xs text-${b.color} font-bold`}>{b.name}</span>
                      <span className="font-label text-[10px] text-on-surface-variant/50">{b.detail}</span>
                      {b.turns != null && <span className="font-label text-[10px] text-on-surface-variant/40">{b.turns}t</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Debuffs */}
            {player.debuffs.length > 0 && (
              <div className="pt-1 mt-1 border-t border-error/10">
                <div className="font-label text-[10px] text-error/70 uppercase tracking-widest mb-1">Debuffs</div>
                <div className="flex flex-col gap-1">
                  {player.debuffs.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>dangerous</span>
                      <span className="font-label text-xs text-error font-bold uppercase">{d.type.replace('_', ' ')}</span>
                      <span className="font-label text-[10px] text-on-surface-variant/50">{d.turns}t</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
