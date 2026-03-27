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
  const [buffsOpen, setBuffsOpen] = useState(false)
  const isBossRound = currentLevel === LEVEL_ENEMIES.length - 1 && currentRound === ROUNDS_PER_LEVEL - 1
  const levelLabel = `Lvl ${player.level} — ${LEVEL_NAMES[currentLevel]} ${currentRound + 1}/${isBossRound ? 'BOSS' : ROUNDS_PER_LEVEL}`

  const hpPct = `${Math.max(0, player.hp / player.maxHp) * 100}%`

  // Build structured buff list
  const buffs: { icon: string; name: string; detail: string; color: string; turns?: number }[] = []
  if (player.buff && player.buff.turns > 0) {
    buffs.push({ icon: 'local_bar', name: player.buff.name, detail: `+${player.buff.val} ${player.buff.type.toUpperCase()}`, color: 'tertiary', turns: player.buff.turns })
  }
  if (player.buff2 && player.buff2.turns > 0) {
    buffs.push({ icon: 'local_bar', name: player.buff2.name, detail: `+${player.buff2.val} ${player.buff2.type.toUpperCase()}`, color: 'secondary', turns: player.buff2.turns })
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
    <>
      {/* ── MOBILE COMPACT ── */}
      <div className="sm:hidden flex gap-2 bg-surface-container/80 backdrop-blur-sm px-3 py-2 pixel-border items-center">
        <div className="w-1.5 h-6 rounded-sm bg-surface-container-highest relative overflow-hidden flex-shrink-0">
          <div className="absolute bottom-0 w-full bg-error transition-all duration-500 rounded-sm" style={{ height: hpPct }} />
        </div>
        <span className="font-headline text-primary text-sm tracking-tight leading-none">SEPPO</span>
        <span className="font-label text-[11px] text-on-surface-variant/70">{player.hp}/{player.maxHp}</span>
        <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
        <span className="font-label text-xs font-bold text-tertiary">{atk}</span>
        <span className="material-symbols-outlined text-on-surface-variant text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        <span className="font-label text-xs font-bold text-on-surface-variant">{def}</span>
        <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        <span className="font-label text-xs font-bold text-amber-400">{crit}%</span>
        {player.relics.length > 0 && (
          <button onClick={onOpenRelics} className="flex items-center gap-0.5" title="View Relics">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
            <span className="font-label text-[11px] font-bold text-primary">{player.relics.length}</span>
          </button>
        )}
        {buffs.length > 0 && (
          <button onClick={() => setBuffsOpen(o => !o)} className="flex items-center gap-0.5" title="Active Buffs">
            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_bar</span>
            <span className="font-label text-[11px] font-bold text-secondary">{buffs.length}</span>
          </button>
        )}
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

      {/* Buff / Relics / Help */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <button
            onClick={() => setBuffsOpen(o => !o)}
            className="flex items-center gap-1.5 w-full text-left group"
            title={buffs.length ? 'Click to view active buffs' : 'No active buffs'}
          >
            <span className={`material-symbols-outlined text-base ${buffs.length ? 'text-secondary' : 'text-on-surface-variant/40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              local_bar
            </span>
            {buffs.length > 0 ? (
              <span className="font-label text-sm text-secondary/80 truncate group-hover:text-secondary transition-colors">
                {buffs.length} buff{buffs.length !== 1 ? 's' : ''} active
              </span>
            ) : (
              <span className="font-label text-sm text-on-surface-variant/40 truncate">Sober — no buff</span>
            )}
          </button>

          {/* Buff popup */}
          {buffsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setBuffsOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-50 w-64 max-h-[40vh] overflow-y-auto bg-surface-container pixel-border border border-secondary/30 p-3 shadow-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_bar</span>
                  <span className="font-headline text-xs text-primary uppercase tracking-wide">Active Buffs</span>
                </div>
                {buffs.length === 0 ? (
                  <span className="font-label text-xs text-on-surface-variant/40">Sober — no active buffs</span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {buffs.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-${b.color} text-base shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1">
                            <span className={`font-label text-xs text-${b.color} font-bold`}>{b.name}</span>
                            {b.turns != null && (
                              <span className="font-label text-[10px] text-on-surface-variant/60">{b.turns}t left</span>
                            )}
                          </div>
                          <span className="font-label text-[10px] text-on-surface-variant/60">{b.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {player.relics.length > 0 && (
          <button onClick={onOpenRelics} className="w-6 h-6 flex items-center justify-center bg-surface-container-highest pixel-border text-primary/60 hover:text-primary transition-colors flex-shrink-0" title="View Relics">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
          </button>
        )}
      </div>
    </div>
    </>
  )
}
