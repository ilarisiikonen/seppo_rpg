import { useState, useEffect } from 'react'
import type { MetaProfile, LeaderboardEntry } from '../firebase'
import { fetchLeaderboard } from '../firebase'
import { UNLOCKS, BESTIARY, LEVEL_NAMES, RELICS, WEAPONS, TRAIT_INFO, isItemUnlocked, getEarnedUnlocks, getUnlockedItemIds, getUnlockForItem } from '../gameData'
import type { User } from 'firebase/auth'
import type { EnemyTrait, Relic, Weapon, RunStats } from '../types'
import type { BestiaryEntry } from '../gameData'

type Tab = 'leaderboard' | 'stats' | 'unlocks' | 'guide'

/* ── Detail Modal ──────────────────────────── */

type DetailData =
  | { kind: 'enemy'; entry: BestiaryEntry }
  | { kind: 'relic'; relic: Relic; rarityColor: string; unlockDesc?: string }
  | { kind: 'weapon'; weapon: Weapon; unlockDesc?: string }
  | { kind: 'stat'; icon: string; color: string; title: string; text: string; debuffs?: { icon: string; color: string; label: string; desc: string }[] }

function DetailModal({ data, onClose }: { data: DetailData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] bg-surface/95 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-surface-container pixel-border p-4 relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {data.kind === 'enemy' && <EnemyDetail entry={data.entry} />}
        {data.kind === 'relic' && <RelicDetail relic={data.relic} rarityColor={data.rarityColor} unlockDesc={data.unlockDesc} />}
        {data.kind === 'weapon' && <WeaponDetail weapon={data.weapon} unlockDesc={data.unlockDesc} />}
        {data.kind === 'stat' && <StatDetail icon={data.icon} color={data.color} title={data.title} text={data.text} debuffs={data.debuffs} />}
      </div>
    </div>
  )
}

function EnemyDetail({ entry }: { entry: BestiaryEntry }) {
  return (
    <div className="text-center">
      <img src={entry.portrait} alt={entry.name} className="w-20 h-20 mx-auto object-contain pixelated mb-3" />
      <div className="flex items-center justify-center gap-2 mb-1">
        <h3 className={`font-headline text-lg uppercase tracking-wide ${entry.isBoss ? 'text-tertiary' : 'text-on-surface'}`}>{entry.name}</h3>
        {entry.isBoss && <span className="font-label text-xs text-tertiary/70 uppercase">Boss</span>}
      </div>
      <p className="font-body text-sm text-on-surface-variant mb-3">{entry.lore}</p>
      <div className="flex justify-center gap-4 mb-3 font-label text-sm tabular-nums">
        <span className="text-error">HP {entry.hp}</span>
        <span className="text-tertiary">ATK {entry.atk}</span>
        <span className="text-secondary">DEF {entry.def}</span>
      </div>
      {entry.traits.length > 0 && (
        <div className="space-y-1.5 text-left">
          <div className="font-label text-xs text-primary/70 uppercase tracking-widest">Abilities</div>
          {entry.traits.map(t => {
            const info = TRAIT_INFO[t]
            return (
              <div key={t} className="flex items-start gap-2 bg-surface-container-lowest p-2 rounded">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">{info.icon}</span>
                <div>
                  <div className="font-label text-sm font-bold text-on-surface">{info.name}</div>
                  <p className="font-body text-sm text-on-surface-variant">{info.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RelicDetail({ relic, rarityColor, unlockDesc }: { relic: Relic; rarityColor: string; unlockDesc?: string }) {
  return (
    <div className="text-center">
      <span className={`material-symbols-outlined text-${rarityColor} text-4xl mb-3 inline-block`} style={{ fontVariationSettings: "'FILL' 1" }}>{relic.icon}</span>
      <h3 className={`font-headline text-lg uppercase tracking-wide text-${rarityColor} mb-1`}>{relic.name}</h3>
      <div className={`font-label text-xs text-${rarityColor}/70 uppercase tracking-widest mb-3`}>{relic.rarity}</div>
      <p className="font-body text-sm text-on-surface-variant">{relic.desc}</p>
      {unlockDesc && (
        <div className="mt-3 pt-2 border-t border-primary/10 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-primary/60 text-sm">lock_open</span>
          <span className="font-label text-xs text-primary/60 uppercase">{unlockDesc}</span>
        </div>
      )}
    </div>
  )
}

function WeaponDetail({ weapon, unlockDesc }: { weapon: Weapon; unlockDesc?: string }) {
  return (
    <div className="text-center">
      <span className="material-symbols-outlined text-tertiary text-4xl mb-3 inline-block" style={{ fontVariationSettings: "'FILL' 1" }}>hardware</span>
      <h3 className="font-headline text-lg uppercase tracking-wide text-on-surface mb-1">{weapon.name}</h3>
      <div className="font-label text-sm text-tertiary tabular-nums mb-3">+{weapon.atk} ATK</div>
      <p className="font-body text-sm text-on-surface-variant">{weapon.lore}</p>
      {unlockDesc && (
        <div className="mt-3 pt-2 border-t border-primary/10 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-primary/60 text-sm">lock_open</span>
          <span className="font-label text-xs text-primary/60 uppercase">{unlockDesc}</span>
        </div>
      )}
    </div>
  )
}

function StatDetail({ icon, color, title, text, debuffs }: { icon: string; color: string; title: string; text: string; debuffs?: { icon: string; color: string; label: string; desc: string }[] }) {
  return (
    <div className="text-center">
      <span className={`material-symbols-outlined text-${color} text-4xl mb-3 inline-block`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <h3 className={`font-headline text-lg uppercase tracking-wide text-${color} mb-2`}>{title}</h3>
      <p className="font-body text-base text-on-surface-variant leading-relaxed">{text}</p>
      {debuffs && debuffs.length > 0 && (
        <div className="mt-3 space-y-2 text-left">
          {debuffs.map(d => (
            <div key={d.label} className="flex items-start gap-2 bg-surface-container-lowest p-2 rounded">
              <span className={`material-symbols-outlined ${d.color} text-lg mt-0.5`} style={{ fontVariationSettings: "'FILL' 1" }}>{d.icon}</span>
              <div>
                <div className={`font-label text-sm font-bold ${d.color}`}>{d.label}</div>
                <p className="font-body text-sm text-on-surface-variant">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  user: User | null
  meta: MetaProfile
  onClose: () => void
  onGiveUp: () => void
  runStats: RunStats | null
  currentLevel: number
  runActive: boolean
  initialTab?: Tab
}

export default function MainMenu({ user, meta, onClose, onGiveUp, runStats, currentLevel, runActive, initialTab }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab || 'stats')
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmGiveUp, setConfirmGiveUp] = useState(false)

  useEffect(() => {
    if (tab === 'leaderboard' && leaders.length === 0) {
      setLoading(true)
      fetchLeaderboard(20)
        .then(setLeaders)
        .catch(e => console.error('Leaderboard fetch failed:', e))
        .finally(() => setLoading(false))
    }
  }, [tab])

  return (
    <div className="fixed inset-0 z-[110] bg-surface/95 flex items-start sm:items-center justify-center overflow-y-auto p-2 sm:p-4">
      <div className="w-full max-w-3xl h-[100dvh] sm:h-[80vh] bg-surface-container pixel-border p-3 sm:p-5 relative flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <h2 className="font-headline text-xl sm:text-2xl text-primary uppercase tracking-widest text-center mb-3 sm:mb-4">Menu</h2>

        {/* Tabs */}
        <div className="flex border-b border-primary/20 mb-3">
          {([
            { id: 'stats' as Tab, icon: 'bar_chart', label: 'My Stats' },
            { id: 'leaderboard' as Tab, icon: 'leaderboard', label: 'Leaderboard' },
            { id: 'unlocks' as Tab, icon: 'lock_open', label: 'Unlocks' },
            { id: 'guide' as Tab, icon: 'help', label: 'Guide' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 font-label text-xs sm:text-sm uppercase tracking-wide transition-colors ${tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant/50 hover:text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {tab === 'leaderboard' && <LeaderboardTab leaders={leaders} loading={loading} uid={user?.uid} />}
          {tab === 'stats' && <StatsTab meta={meta} user={user} runStats={runStats} currentLevel={currentLevel} runActive={runActive} />}
          {tab === 'unlocks' && <UnlocksTab meta={meta} />}
          {tab === 'guide' && <GuideTab meta={meta} />}
        </div>

        {/* Give Up Run */}
        {runActive && (
          <div className="pt-3 border-t border-primary/10 mt-2 flex justify-center">
            {!confirmGiveUp ? (
              <button
                onClick={() => setConfirmGiveUp(true)}
                className="font-label text-xs text-error/60 hover:text-error uppercase tracking-widest transition-colors"
              >
                Give Up Run
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-label text-xs text-error uppercase">Are you sure?</span>
                <button
                  onClick={onGiveUp}
                  className="font-label text-xs text-surface bg-error hover:bg-error/80 px-3 py-1 pixel-border uppercase tracking-wide transition-colors"
                >
                  Yes, give up
                </button>
                <button
                  onClick={() => setConfirmGiveUp(false)}
                  className="font-label text-xs text-on-surface-variant/60 hover:text-on-surface uppercase tracking-wide transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Leaderboard Tab ───────────────────────── */

function formatPlayTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function LeaderboardTab({ leaders, loading, uid }: { leaders: LeaderboardEntry[]; loading: boolean; uid?: string }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  if (loading) {
    return <p className="font-body text-sm text-on-surface-variant/50 italic text-center py-8">Loading leaderboard...</p>
  }
  if (!leaders.length) {
    return <p className="font-body text-sm text-on-surface-variant/50 italic text-center py-8">No entries yet. Complete a run to appear!</p>
  }
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center px-2 py-1 text-on-surface-variant/50 font-label text-[11px] uppercase tracking-widest border-b border-primary/10">
        <span className="w-8 text-center">#</span>
        <span className="flex-1">Player</span>
        <span className="w-16 text-right">Score</span>
        <span className="w-12 text-right">Level</span>
        <span className="w-12 text-right">Wins</span>
      </div>
      {leaders.map((e, i) => {
        const isMe = uid && e.uid === uid
        const medal = i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : ''
        const isOpen = expanded === e.uid
        return (
          <div key={e.uid}>
            <div
              className={`flex items-center px-2 py-1.5 border-b border-white/5 cursor-pointer hover:bg-surface-container-lowest/50 transition-colors ${isMe ? 'bg-primary/10' : ''}`}
              onClick={() => setExpanded(isOpen ? null : e.uid)}
            >
              <span className={`w-8 text-center font-headline text-base ${medal || 'text-on-surface-variant/50'}`}>{i + 1}</span>
              <span className={`flex-1 font-label text-sm truncate ${isMe ? 'text-primary font-bold' : 'text-on-surface'}`}>{e.playerName}</span>
              <span className="w-16 text-right font-label text-sm text-tertiary tabular-nums">{e.totalScore || e.highScore}</span>
              <span className="w-12 text-right font-label text-sm text-on-surface-variant tabular-nums">{e.bestLevel + 1}</span>
              <span className="w-12 text-right font-label text-sm text-on-surface-variant tabular-nums">{e.totalWins}</span>
            </div>
            {isOpen && (
              <div className="px-3 py-2 bg-surface-container-lowest/40 border-b border-white/5">
                {(e.runHistory?.length ?? 0) > 0 ? (
                  <div>
                    <div className="font-label text-[11px] text-on-surface-variant/50 uppercase tracking-widest mb-1">Completed Runs</div>
                    <div className="space-y-0.5 max-h-32 overflow-y-auto">
                      {[...(e.runHistory ?? [])].reverse().map((r, ri) => (
                        <div key={ri} className="flex items-center justify-between font-label text-xs py-0.5 border-b border-white/5">
                          <span className={r.won ? 'text-tertiary' : 'text-error'}>{r.won ? 'WIN' : 'LOSS'}</span>
                          <span className="text-on-surface-variant">Lv{r.level + 1}</span>
                          <span className="text-on-surface tabular-nums">{r.score} pts</span>
                          <span className="text-on-surface-variant/50">{r.kills} kills</span>
                          <span className="text-on-surface-variant/30 text-[10px]">{formatPlayTime(r.elapsed)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-xs text-on-surface-variant/40 italic text-center py-2">No completed runs yet</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Stats Tab ─────────────────────────────── */

function StatsTab({ meta, user, runStats, currentLevel, runActive }: { meta: MetaProfile; user: User | null; runStats: RunStats | null; currentLevel: number; runActive: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Current Run Stats */}
      {runActive && runStats && (
        <div className="bg-surface-container-lowest pixel-border p-3 flex-1">
          <div className="font-label text-xs text-tertiary/70 uppercase tracking-widest mb-2">Current Run</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              { label: 'Score', value: runStats.enemiesDefeated.reduce((s, e) => s + e.xp * 5, 0) + runStats.beersDrunk * 50 + runStats.totalDmgDealt, color: 'primary' },
              { label: 'Level', value: currentLevel + 1, color: 'secondary' },
              { label: 'Kills', value: runStats.enemiesDefeated.length, color: 'tertiary' },
              { label: 'Damage', value: runStats.totalDmgDealt, color: 'secondary' },
              { label: 'Beers', value: runStats.beersDrunk, color: 'primary' },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="font-label text-xs text-on-surface-variant uppercase">{s.label}</span>
                <span className={`font-headline text-sm text-${s.color} tabular-nums`}>{s.value}</span>
              </div>
            ))}
          </div>
          {runStats.enemiesDefeated.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-primary/10">
              <div className="font-label text-xs text-on-surface-variant/50 uppercase tracking-widest mb-1">Defeated</div>
              <div className="space-y-0.5 max-h-24 overflow-y-auto">
                {runStats.enemiesDefeated.map((e, i) => (
                  <div key={i} className="flex items-center justify-between font-label text-xs py-0.5 border-b border-white/5">
                    <span className="text-on-surface">{e.name}</span>
                    <span className="text-secondary tabular-nums">{e.dmgDealt} dmg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All-time Stats */}
      {user && meta.totalRuns > 0 ? (
        <div className="bg-surface-container-lowest pixel-border p-3 flex-1">
          <div className="font-label text-xs text-primary/70 uppercase tracking-widest mb-2">All-Time Stats</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              { label: 'Name', value: meta.playerName || '—', color: 'primary' },
              { label: 'Runs', value: meta.totalRuns, color: 'on-surface' },
              { label: 'Wins', value: meta.totalWins, color: 'tertiary' },
              { label: 'Win Rate', value: `${Math.round((meta.totalWins / meta.totalRuns) * 100)}%`, color: 'tertiary' },
              { label: 'High Score', value: meta.highScore, color: 'primary' },
              { label: 'Best Level', value: meta.bestLevel + 1, color: 'secondary' },
              { label: 'Kills', value: meta.totalKills, color: 'tertiary' },
              { label: 'Damage', value: meta.totalDmgDealt, color: 'secondary' },
              { label: 'Beers', value: meta.totalBeersDrunk, color: 'primary' },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="font-label text-xs text-on-surface-variant uppercase">{s.label}</span>
                <span className={`font-headline text-sm text-${s.color} tabular-nums`}>{s.value}</span>
              </div>
            ))}
          </div>
          {/* Recent runs */}
          {meta.runHistory.length > 0 && (
            <div className="mt-2 pt-2 border-t border-primary/10">
              <div className="font-label text-xs text-primary/70 uppercase tracking-widest mb-1">Recent Runs</div>
              <div className="space-y-0.5 max-h-24 overflow-y-auto">
                {[...meta.runHistory].reverse().slice(0, 10).map((r, i) => (
                  <div key={i} className="flex items-center justify-between font-label text-xs py-0.5 border-b border-white/5">
                    <span className={r.won ? 'text-tertiary' : 'text-error'}>{r.won ? 'WIN' : 'LOSS'}</span>
                    <span className="text-on-surface-variant">Lv{r.level + 1}</span>
                    <span className="text-on-surface tabular-nums">{r.score} pts</span>
                    <span className="text-on-surface-variant/50">{r.kills} kills</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        !runActive && (
          <p className="font-body text-sm text-on-surface-variant/50 italic text-center py-8">
            {!user ? 'Sign in to track your stats.' : 'No runs completed yet. Get out there, Seppo!'}
          </p>
        )
      )}
    </div>
  )
}

/* ── Unlocks Tab ──────────────────────────── */

function UnlocksTab({ meta }: { meta: MetaProfile }) {
  const earned = new Set(meta.unlockedIds ?? [])
  return (
    <div className="grid grid-cols-2 gap-2">
      {UNLOCKS.map(u => {
        const unlocked = earned.has(u.id)
        let current = 0
        let target = u.conditionValue
        if (u.conditionType === 'bestLevel') current = meta.bestLevel
        else if (u.conditionType === 'highScore') current = meta.highScore
        else if (u.conditionType === 'totalWins') current = meta.totalWins
        const pct = Math.min(current / target, 1)
        return (
          <div key={u.id} className={`p-2.5 pixel-border ${unlocked ? 'bg-primary/10' : 'bg-surface-container-lowest'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`material-symbols-outlined text-lg ${unlocked ? 'text-primary' : 'text-on-surface-variant/30'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {unlocked ? u.icon : 'lock'}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`font-label text-sm font-bold uppercase tracking-wide ${unlocked ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                  {u.name}
                </div>
                <div className="font-body text-xs text-on-surface-variant/60">{u.desc}</div>
              </div>
              {unlocked && (
                <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              )}
            </div>
            {/* Progress bar */}
            {!unlocked && (
              <div className="mt-1.5">
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 transition-all" style={{ width: `${pct * 100}%` }} />
                </div>
                <div className="font-label text-[11px] text-on-surface-variant/40 text-right mt-0.5 tabular-nums">
                  {current} / {target}
                </div>
              </div>
            )}
            {/* Unlocked items preview */}
            {unlocked && (
              <div className="font-body text-xs text-on-surface-variant/50 mt-1">
                {u.unlockIds.length} item{u.unlockIds.length !== 1 ? 's' : ''} unlocked
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Enemies Guide ─────────────────────────── */

function EnemiesGuide({ meta }: { meta: MetaProfile }) {
  const defeated = new Set(meta.defeatedEnemies ?? [])
  const [detail, setDetail] = useState<BestiaryEntry | null>(null)
  const grouped = LEVEL_NAMES.map((name, lvIdx) => ({
    levelName: name,
    levelIdx: lvIdx,
    entries: BESTIARY.filter(e => e.level === lvIdx),
  }))

  return (
    <div className="space-y-3">
      {detail && <DetailModal data={{ kind: 'enemy', entry: detail }} onClose={() => setDetail(null)} />}
      {grouped.map(g => (
        <div key={g.levelIdx}>
          <div className="font-label text-xs text-primary/70 uppercase tracking-widest mb-1">
            Lv{g.levelIdx + 1} — {g.levelName}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {g.entries.map(entry => {
              const known = defeated.has(entry.name) || meta.bestLevel >= entry.level
              return (
                <div
                  key={entry.name + entry.level}
                  className={`p-2 pixel-border ${known ? (entry.isBoss ? 'bg-tertiary/10 hover:bg-tertiary/20' : 'bg-surface-container-lowest hover:bg-surface-container-lowest/80') : 'bg-surface-container-lowest/50'} ${known ? 'cursor-pointer transition-colors' : ''}`}
                  onClick={known ? () => setDetail(entry) : undefined}
                >
                  {known ? (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <img src={entry.portrait} alt={entry.name} className="w-8 h-8 object-contain pixelated" />
                      <span className={`font-label text-[10px] font-bold uppercase tracking-wide leading-tight ${entry.isBoss ? 'text-tertiary' : 'text-on-surface'}`}>
                        {entry.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-1">
                      <span className="material-symbols-outlined text-on-surface-variant/20 text-lg">lock</span>
                      <span className="font-label text-[10px] text-on-surface-variant/30 italic">???</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Relics Guide ─────────────────────────── */

function RelicsGuide({ meta }: { meta: MetaProfile }) {
  const earnedIds = getEarnedUnlocks(meta)
  const unlockedItems = getUnlockedItemIds(earnedIds)
  const rarities = ['common', 'uncommon', 'rare'] as const
  const rarityColors = { common: 'on-surface-variant', uncommon: 'secondary', rare: 'tertiary' }
  const [detail, setDetail] = useState<{ relic: Relic; color: string; unlockDesc?: string } | null>(null)

  return (
    <div className="space-y-3">
      {detail && <DetailModal data={{ kind: 'relic', relic: detail.relic, rarityColor: detail.color, unlockDesc: detail.unlockDesc }} onClose={() => setDetail(null)} />}
      {rarities.map(rarity => {
        const relics = RELICS.filter(r => r.rarity === rarity)
        const color = rarityColors[rarity]
        return (
          <div key={rarity}>
            <div className={`font-label text-xs text-${color} uppercase tracking-widest mb-1`}>
              {rarity} ({relics.filter(r => isItemUnlocked(r.id, unlockedItems)).length}/{relics.length})
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {relics.map(relic => {
                const unlocked = isItemUnlocked(relic.id, unlockedItems)
                const unlock = getUnlockForItem(relic.id)
                return (
                  <div
                    key={relic.id}
                    className={`p-2 pixel-border ${unlocked ? 'bg-surface-container-lowest hover:bg-surface-container-lowest/80 cursor-pointer transition-colors' : 'bg-surface-container-lowest/50'}`}
                    onClick={unlocked ? () => setDetail({ relic, color, unlockDesc: unlock?.desc }) : undefined}
                  >
                    {unlocked ? (
                      <div className="flex flex-col items-center gap-1 text-center">
                        <span
                          className={`material-symbols-outlined text-${color} text-lg`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {relic.icon}
                        </span>
                        <span className={`font-label text-[10px] font-bold uppercase tracking-wide leading-tight text-${color}`}>
                          {relic.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-0.5">
                        <span className="material-symbols-outlined text-on-surface-variant/20 text-lg">lock</span>
                        <span className="font-label text-[10px] text-on-surface-variant/30 italic">???</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Guide Tab (with sub-sections) ────────────────────────────── */

type GuideSection = 'stats' | 'enemies' | 'relics' | 'weapons'

function GuideTab({ meta }: { meta: MetaProfile }) {
  const [section, setSection] = useState<GuideSection>('stats')
  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-3">
        {([
          { id: 'stats' as GuideSection, icon: 'help', label: 'Stats' },
          { id: 'enemies' as GuideSection, icon: 'menu_book', label: 'Enemies' },
          { id: 'relics' as GuideSection, icon: 'auto_awesome', label: 'Relics' },
          { id: 'weapons' as GuideSection, icon: 'hardware', label: 'Weapons' },
        ]).map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded font-label text-xs sm:text-sm uppercase tracking-wide transition-colors ${
              section === s.id
                ? 'bg-primary/15 text-primary'
                : 'text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container-lowest'
            }`}
          >
            <span className="material-symbols-outlined text-base">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
      {section === 'stats' && <StatsGuide />}
      {section === 'enemies' && <EnemiesGuide meta={meta} />}
      {section === 'relics' && <RelicsGuide meta={meta} />}
      {section === 'weapons' && <WeaponsGuide meta={meta} />}
    </div>
  )
}

function StatsGuide() {
  const [detail, setDetail] = useState<{ icon: string; color: string; title: string; text: string } | null>(null)
  const stats = [
    { icon: 'favorite', color: 'error', title: 'HP — Hit Points', text: 'When HP reaches 0, it\'s game over. Restore HP with food, resting, or leveling up.' },
    { icon: 'star', color: 'primary', title: 'XP — Experience', text: 'Gain XP from defeating enemies. Level up to get base stat boosts (+5 HP, +1 ATK, +1 DEF) and choose a bonus.' },
    { icon: 'swords', color: 'tertiary', title: 'ATK — Attack', text: 'Damage dealt = ATK − enemy DEF (min 1). Boosted by weapons, drink buffs, and level-ups.' },
    { icon: 'shield', color: 'on-surface-variant', title: 'DEF — Defence', text: 'Reduces incoming damage. Damage taken = enemy ATK − your DEF (min 1).' },
    { icon: 'security', color: 'secondary', title: 'Block', text: 'Temporary shield that absorbs damage before HP. Resets each combat. Gained from relics and abilities.' },
    { icon: 'bolt', color: 'amber-400', title: 'CRIT — Critical Hit', text: 'Chance to deal 1.5× damage. Base 10%. Increased by Wheat Beer buff and level-up perks.' },
    { icon: 'hardware', color: 'tertiary', title: 'Weapon', text: 'Adds flat ATK bonus. Found as loot from enemies. Stronger weapons replace weaker ones.' },
    { icon: 'sports_bar', color: 'secondary', title: 'Drinks & Food', text: 'Drinks give temporary stat buffs. Food restores HP. Both scale stronger in later levels. Each use costs 1 action.' },
    { icon: 'pace', color: 'primary', title: 'Actions', text: 'You get 3 actions per turn. Attack, drink, or eat each cost 1 action. After your actions, the enemy attacks.' },
    { icon: 'auto_awesome', color: 'tertiary', title: 'Relics', text: 'Passive items that last the entire run. Offered after boss fights. Rarities: Common, Uncommon, Rare.' },
    { icon: 'dangerous', color: 'error', title: 'Debuffs', text: 'Enemies can inflict the following status effects:', debuffs: [
      { icon: 'trending_down', color: 'text-orange-400', label: 'Weak', desc: 'Deal 25% less attack damage.' },
      { icon: 'heart_broken', color: 'text-yellow-400', label: 'Frail', desc: 'Block gained is reduced by 25%.' },
      { icon: 'broken_image', color: 'text-red-400', label: 'Vulnerable', desc: 'Take 50% more damage from attacks.' },
      { icon: 'skull', color: 'text-purple-400', label: 'Poisoned', desc: 'Take damage at the end of every turn.' },
      { icon: 'local_bar', color: 'text-green-400', label: 'Alcohol Poisoning', desc: 'Take 1% max HP damage when drinking beer. Lasts entire combat.' },
    ] },
  ]
  return (
    <div className="text-left space-y-1.5">
      {detail && <DetailModal data={{ kind: 'stat', ...detail }} onClose={() => setDetail(null)} />}
      {stats.map(s => (
        <div
          key={s.title}
          className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-surface-container-lowest transition-colors"
          onClick={() => setDetail(s)}
        >
          <span className={`material-symbols-outlined text-${s.color} text-xl`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
          <div className="flex-1 min-w-0">
            <div className={`font-label text-sm font-bold text-${s.color} uppercase tracking-wide`}>{s.title}</div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant/30 text-base">chevron_right</span>
        </div>
      ))}
    </div>
  )
}

/* ── Weapons Guide ────────────────────────── */

function WeaponsGuide({ meta }: { meta: MetaProfile }) {
  const earnedIds = getEarnedUnlocks(meta)
  const unlockedItems = getUnlockedItemIds(earnedIds)
  const [detail, setDetail] = useState<{ weapon: Weapon; unlockDesc?: string } | null>(null)
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {detail && <DetailModal data={{ kind: 'weapon', weapon: detail.weapon, unlockDesc: detail.unlockDesc }} onClose={() => setDetail(null)} />}
      {WEAPONS.map(w => {
        const unlocked = isItemUnlocked(w.id, unlockedItems)
        const unlock = getUnlockForItem(w.id)
        return (
          <div
            key={w.id}
            className={`p-2 pixel-border ${unlocked ? 'bg-surface-container-lowest hover:bg-surface-container-lowest/80 cursor-pointer transition-colors' : 'bg-surface-container-lowest/50'}`}
            onClick={unlocked ? () => setDetail({ weapon: w, unlockDesc: unlock?.desc }) : undefined}
          >
            {unlocked ? (
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>hardware</span>
                <span className="font-label text-[10px] font-bold uppercase tracking-wide leading-tight text-on-surface">{w.name}</span>
                <span className="font-label text-[10px] text-tertiary tabular-nums">+{w.atk}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-0.5">
                <span className="material-symbols-outlined text-on-surface-variant/20 text-lg">lock</span>
                <span className="font-label text-[10px] text-on-surface-variant/30 italic">???</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
