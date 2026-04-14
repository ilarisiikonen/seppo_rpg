import { useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false)
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
    <>
      {/* ── MOBILE COMPACT ── */}
      <div className="sm:hidden relative">
        <div className="flex flex-col gap-1 bg-surface-container/80 backdrop-blur-sm px-2.5 py-2 pixel-border">
          {/* Top row: portrait + stats */}
          <div className="flex gap-2 items-center">
            {/* Clickable portrait */}
            <button
              onClick={() => setMobileStatsOpen(o => !o)}
              className="bg-surface-container-highest pixel-border overflow-hidden flex-shrink-0 w-9 h-9"
              title="Player Stats"
            >
              <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
            </button>
            <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
            <span className="font-label text-sm font-bold text-tertiary">{atk}</span>
            <span className="material-symbols-outlined text-on-surface-variant text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-label text-sm font-bold text-on-surface-variant">{def}</span>
            <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="font-label text-sm font-bold text-amber-400">{crit}%</span>
            <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span className="font-label text-sm font-bold text-amber-400">{player.coins}</span>
            {player.relics.length > 0 && (
              <button onClick={onOpenRelics} className="flex items-center gap-0.5" title="View Relics">
                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                <span className="font-label text-xs font-bold text-primary">{player.relics.length}</span>
              </button>
            )}
            {buffs.length > 0 && (
              <button onClick={() => setBuffsOpen(o => !o)} className="flex items-center gap-0.5" title="Active Buffs">
                <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_bar</span>
              <span className="font-label text-[11px] font-bold text-secondary">{buffs.length}</span>
            </button>
          )}
          </div>
          {/* HP bar */}
          <div className="flex items-center gap-1.5">
            <span className="font-label text-xs text-error font-bold">HP</span>
            <div className="flex-1 h-3 bg-surface-container-highest overflow-hidden rounded-sm relative">
              <div className="h-full bg-error transition-all duration-500 rounded-sm" style={{ width: hpPct }} />
              <span className="absolute inset-0 flex items-center justify-center font-label text-[9px] font-bold text-on-surface mix-blend-difference">{player.hp}/{player.maxHp}</span>
            </div>
          </div>
        </div>

        {/* Mobile stats popup — portaled to body to escape stacking contexts */}
        {mobileStatsOpen && createPortal(
          <>
            <div className="fixed inset-0 z-[99] bg-black/40" onClick={() => setMobileStatsOpen(false)} />
            <div className="fixed top-2 left-2 right-2 bottom-2 z-[99] bg-surface-container pixel-border border border-primary/30 p-3 shadow-xl overflow-y-auto">
              {/* Close button */}
              <button
                onClick={() => setMobileStatsOpen(false)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
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
              {/* Buffs */}
              {buffs.length > 0 && (
                <div className="pt-1 border-t border-primary/10">
                  <div className="font-label text-[10px] text-secondary/70 uppercase tracking-widest mb-1">Active Buffs</div>
                  <div className="flex flex-wrap gap-1">
                    {buffs.map((b, i) => (
                      <div key={i} className="flex items-center gap-1 bg-surface-container-highest px-1.5 py-0.5 rounded">
                        <span className={`material-symbols-outlined text-${b.color} text-xs`} style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                        <span className={`font-label text-[10px] text-${b.color} font-bold`}>{b.name}</span>
                        {b.turns != null && <span className="font-label text-[9px] text-on-surface-variant/40">{b.turns}t</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Debuffs */}
              {player.debuffs.length > 0 && (
                <div className="pt-1 mt-1 border-t border-error/10">
                  <div className="font-label text-[10px] text-error/70 uppercase tracking-widest mb-1">Debuffs</div>
                  <div className="flex flex-wrap gap-1">
                    {player.debuffs.map((d, i) => (
                      <div key={i} className="flex items-center gap-1 bg-error/10 px-1.5 py-0.5 rounded">
                        <span className="material-symbols-outlined text-error text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>dangerous</span>
                        <span className="font-label text-[10px] text-error font-bold uppercase">{d.type.replace('_', ' ')}</span>
                        <span className="font-label text-[9px] text-on-surface-variant/40">{d.turns}t</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
      </div>
      <div className="hidden sm:flex flex-col gap-[0.7vh] bg-surface-container/80 backdrop-blur-sm p-[1.2vh_1.25rem] pixel-border min-w-[320px]">
      <div className="flex items-center gap-3">
        <div className="bg-surface-container-highest pixel-border flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0" style={{ width: 'clamp(3.5rem, 7vh, 5rem)', height: 'clamp(3.5rem, 7vh, 5rem)' }}>
          <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-headline text-primary text-3xl tracking-tight leading-none">SEPPO</span>
          <span className="font-label text-base uppercase text-on-surface-variant/70 truncate">{levelLabel}</span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="flex items-center gap-2">
        <span className="font-label text-base text-error font-bold w-8">HP</span>
        <div className="diegetic-scroll flex-1 flex items-center px-1 overflow-hidden" style={{ height: 'clamp(1.5rem, 4vh, 2.25rem)' }}>
          <div className="h-full bg-error transition-all duration-500" style={{ width: `${Math.max(0, player.hp / player.maxHp) * 100}%` }} />
          <div className="absolute inset-0 flex items-center justify-center font-label text-base font-bold text-on-surface mix-blend-difference">
            {player.hp} / {player.maxHp}
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="flex items-center gap-2">
        <span className="font-label text-base text-primary/70 font-bold w-8">XP</span>
        <div className="flex-1 h-3.5 bg-surface-container-highest overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${Math.max(0, player.xp / player.xpNext) * 100}%` }} />
        </div>
        <span className="font-label text-base text-on-surface-variant">{player.xp} / {player.xpNext}</span>
      </div>

      {/* ATK / DEF / CRIT / Weapon */}
      <div className="flex items-center gap-4 mt-0.5 flex-wrap">
        <div className="flex items-center gap-1.5 cursor-default" title={`Base: ${player.baseAtk}${player.weapon ? ' + Weapon: ' + player.weapon.atk : ''}`}>
          <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
          <span className="font-label text-xl font-bold text-tertiary">{atk}</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-default" title={`Base: ${player.baseDef}`}>
          <span className="material-symbols-outlined text-on-surface-variant text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          <span className="font-label text-xl font-bold text-on-surface-variant">{def}</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-default">
          <span className="material-symbols-outlined text-amber-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <span className="font-label text-xl font-bold text-amber-400">{crit}%</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-default" title="Coins">
          <span className="material-symbols-outlined text-amber-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
          <span className="font-label text-xl font-bold text-amber-400">{player.coins}</span>
        </div>
        <div className="h-5 w-px bg-outline/30" />
        <span className="font-label text-base text-tertiary/80 truncate">
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
            <span className={`material-symbols-outlined text-lg ${buffs.length ? 'text-secondary' : 'text-on-surface-variant/40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              local_bar
            </span>
            {buffs.length > 0 ? (
              <span className="font-label text-base text-secondary/80 truncate group-hover:text-secondary transition-colors">
                {buffs.length} buff{buffs.length !== 1 ? 's' : ''} active
              </span>
            ) : (
              <span className="font-label text-base text-on-surface-variant/40 truncate">Sober — no buff</span>
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
