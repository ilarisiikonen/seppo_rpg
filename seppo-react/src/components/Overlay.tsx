import { useState } from 'react'
import type { OverlayData, Player, Enemy, EnemyKill, Relic, CardRarity } from '../types'
import type { MetaProfile } from '../firebase'
import type { User } from 'firebase/auth'
import { getPlayerAtk, getPlayerDef, LEVEL_NAMES, getCardBorderClass } from '../gameData'

interface Props {
  overlay: OverlayData | null
  player: Player
  enemy: Enemy | null
  onStartGame: () => void
  onResumeGame?: () => void
  hasSavedRun?: boolean
  onApplyLevelUp: (id: string) => void
  onApplyUpgrade: (id: string, nextLv: number) => void
  onApplyRelic: (id: string) => void
  user?: User | null
  meta?: MetaProfile
  onSignIn?: () => void
  onSignOut?: () => void
  onSetPlayerName?: (name: string) => void
}

export default function Overlay({ overlay, player, enemy, onStartGame, onResumeGame, hasSavedRun, onApplyLevelUp, onApplyUpgrade, onApplyRelic, user, meta, onSignIn, onSignOut, onSetPlayerName }: Props) {
  if (!overlay) return null

  return (
    <div className={`fixed inset-0 z-[100] bg-surface flex ${overlay.type === 'intro' || overlay.type === 'lore' ? 'items-center' : 'items-start sm:items-center'} justify-center overflow-y-auto transition-opacity duration-400`}>
      {/* Relic choice backgrounds */}
      {overlay.type === 'relic-choice' && (overlay.body as Record<string, unknown>)?.context === 'start' && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img src="assets/levels/starter_relic_background.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-surface/40 to-surface/80" />
        </div>
      )}
      {overlay.type === 'relic-choice' && (overlay.body as Record<string, unknown>)?.context === 'treasure' && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img src="assets/event_bg/treasure_bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-surface/40 to-surface/80" />
        </div>
      )}
      {/* Profile icon — top-right corner on intro screen */}
      {overlay.type === 'intro' && (
        <IntroProfileButton user={user} meta={meta} onSignIn={onSignIn} onSignOut={onSignOut} onSetPlayerName={onSetPlayerName} />
      )}
      <div className={`w-full ${overlay.type === 'relic-choice' ? 'max-w-3xl flex flex-col max-h-[100dvh]' : overlay.type === 'lore' ? 'max-w-xl' : 'max-w-lg'} ${overlay.type === 'intro' || overlay.type === 'lore' ? 'p-2 sm:p-8 max-h-[100dvh] overflow-y-auto' : 'p-3 sm:p-8'} text-center relative ${overlay.type === 'relic-choice' ? '' : 'my-auto'} z-10`}>
        {/* Portrait for intro only */}
        {overlay.type === 'intro' && (
          <div className="mx-auto mb-1 sm:mb-4 h-28 w-28 sm:h-44 sm:w-44 bg-surface-container-highest pixel-border flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
          </div>
        )}

        <h1 className={`font-headline text-primary tracking-tight uppercase mb-0.5 sm:mb-1 ${overlay.type === 'intro' ? 'text-2xl sm:text-5xl title-shimmer' : overlay.type === 'lore' ? 'hidden' : 'text-base sm:text-3xl'}`}>{overlay.type === 'relic-choice' && (overlay.body as Record<string, unknown>)?.context === 'start' ? '' : overlay.title}</h1>
        {overlay.type !== 'relic-choice' && overlay.type !== 'lore' && (
          <div className="w-24 sm:w-48 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-1.5 sm:mb-4" />
        )}

        {/* Body content depends on overlay type */}
        {overlay.type === 'lore' && <LoreBody />}
        {overlay.type === 'fight-victory' && <FightVictoryBody overlay={overlay} />}
        {overlay.type === 'victory' && <VictoryBody overlay={overlay} meta={meta} />}
        {overlay.type === 'game-over' && <GameOverBody enemyName={enemy?.name} overlay={overlay} meta={meta} />}
        {overlay.type === 'stat-info' && <StatInfoBody />}
        {overlay.type === 'level-complete' && <LevelCompleteBody overlay={overlay} player={player} />}
        {overlay.type === 'upgrade' && <UpgradeBody overlay={overlay} onApplyUpgrade={onApplyUpgrade} />}
        {overlay.type === 'level-up' && <LevelUpBody overlay={overlay} player={player} onApplyLevelUp={onApplyLevelUp} />}
        {overlay.type === 'relic-choice' && <RelicChoiceBody overlay={overlay} onApplyRelic={onApplyRelic} />}
        {overlay.type === 'event-loot' && <EventLootBody overlay={overlay} />}

        {/* Action button */}
        {overlay.showBtn && (
          <div className={`flex items-center justify-center gap-2 sm:gap-3 ${overlay.type === 'intro' ? 'fixed bottom-6 left-0 right-0 flex-row z-20' : 'flex-col mt-2 sm:mt-4'}`}>
            {overlay.type === 'intro' && hasSavedRun && (
              <button
                onClick={onResumeGame}
                className="relative group w-36 h-9 sm:w-56 sm:h-14 bg-surface-container-highest pixel-border border-primary border-2 active:translate-y-0.5 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                  <span className="material-symbols-outlined text-primary text-base sm:text-2xl">play_arrow</span>
                  <span className="font-headline text-sm sm:text-lg text-primary tracking-widest uppercase">Continue</span>
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
              </button>
            )}
            <button
              onClick={overlay.type === 'intro' ? onStartGame : overlay.onBtn}
              className="relative group w-36 h-9 sm:w-56 sm:h-14 bg-surface-container-highest pixel-border border-amber-900 border-2 active:translate-y-0.5 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                <span className="material-symbols-outlined text-primary text-base sm:text-2xl">swords</span>
                <span className="font-headline text-sm sm:text-lg text-primary tracking-widest uppercase">{overlay.type === 'intro' && hasSavedRun ? 'New Run' : overlay.btnText}</span>
              </div>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-950/40 via-transparent to-amber-950/40" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Intro Profile Button (top-right corner) ── */

function IntroProfileButton({ user, meta, onSignIn, onSignOut, onSetPlayerName }: { user?: User | null; meta?: MetaProfile; onSignIn?: () => void; onSignOut?: () => void; onSetPlayerName?: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(meta?.playerName || '')

  return (
    <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20">
      {/* Icon button */}
      <button
        onClick={() => user ? setOpen(o => !o) : onSignIn?.()}
        className="w-9 h-9 sm:w-11 sm:h-11 bg-surface-container-highest pixel-border flex items-center justify-center overflow-hidden hover:bg-surface-container transition-colors"
      >
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="material-symbols-outlined text-primary text-xl sm:text-2xl">account_circle</span>
        )}
      </button>

      {/* Dropdown popup */}
      {open && user && (
        <div className="absolute top-full right-0 mt-1 w-64 sm:w-72 bg-surface-container-lowest pixel-border p-3 text-left shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {user.photoURL && <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />}
              <span className="font-label text-xs text-on-surface">{user.displayName || 'Player'}</span>
            </div>
            <button onClick={() => { onSignOut?.(); setOpen(false) }} className="font-label text-[9px] text-on-surface-variant/50 hover:text-on-surface-variant uppercase">Sign Out</button>
          </div>
          {/* Player Name */}
          <div className="mb-2 flex items-center gap-2">
            <span className="font-label text-[9px] sm:text-xs text-primary uppercase shrink-0">Leaderboard Name</span>
            {editingName ? (
              <form className="flex gap-1 flex-1" onSubmit={(e) => { e.preventDefault(); const trimmed = nameInput.trim().slice(0, 20); if (trimmed) { onSetPlayerName?.(trimmed); setEditingName(false) } }}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={20}
                  autoFocus
                  className="flex-1 bg-surface-container-highest px-2 py-0.5 font-label text-xs text-on-surface border border-primary/30 focus:border-primary outline-none"
                  placeholder="Enter name..."
                />
                <button type="submit" className="font-label text-[9px] text-primary uppercase hover:underline">Save</button>
                <button type="button" onClick={() => { setEditingName(false); setNameInput(meta?.playerName || '') }} className="font-label text-[9px] text-on-surface-variant/50 uppercase hover:underline">Cancel</button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="font-label text-xs text-on-surface truncate">{meta?.playerName || <span className="italic text-on-surface-variant/50">Not set</span>}</span>
                <button onClick={() => { setNameInput(meta?.playerName || ''); setEditingName(true) }} className="font-label text-[9px] text-primary/70 hover:text-primary uppercase shrink-0">Edit</button>
              </div>
            )}
          </div>
          {meta && meta.totalRuns > 0 && (
            <div className="grid grid-cols-3 gap-1 text-center font-label text-[9px] sm:text-xs text-on-surface-variant">
              <div><span className="text-primary font-bold block">{meta.totalRuns}</span>Runs</div>
              <div><span className="text-primary font-bold block">{meta.totalWins}</span>Wins</div>
              <div><span className="text-primary font-bold block">{meta.highScore}</span>Best Score</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Lore ─────────────────────────────────── */

function LoreBody() {
  return (
    <>
      <div className="bg-surface-container-lowest pixel-border p-2 sm:p-4 mb-2 sm:mb-4 text-left font-label text-xs sm:text-sm leading-relaxed sm:leading-loose text-on-surface-variant">
        <div className="grid grid-cols-[70px_1fr] sm:grid-cols-[80px_1fr] gap-x-2 sm:gap-x-2">
          <span className="text-primary font-bold uppercase">Name</span><span>Seppo Virtanen</span>
          <span className="text-primary font-bold uppercase">Age</span><span>42</span>
          <span className="text-primary font-bold uppercase">Origin</span><span>Tampere, Finland</span>
          <span className="text-primary font-bold uppercase">Title</span><span>Senior IT Consultant</span>
          <span className="text-primary font-bold uppercase">Current</span><span>In between opportunities</span>
          <span className="text-primary font-bold uppercase">Hobbies</span><span>Craft beer, sauna, arguing on forums at 2am</span>
        </div>
      </div>
      <div className="font-body text-sm sm:text-lg text-on-surface-variant text-left leading-relaxed sm:leading-relaxed mb-2 sm:mb-5">
        <p className="mb-1 sm:mb-2">Seppo is a senior IT consultant. Recent years have gone downhill with the industry and his project.</p>
        <p className="mb-1 sm:mb-2">This Friday he had enough — emptied the office fridge, told the <strong className="text-on-surface not-italic">boss</strong> his processes are stupid, and got fired on the spot.</p>
        <p className="mb-1 sm:mb-2">Now Seppo wanders with one goal — <em className="text-primary">numb the frustration.</em></p>
      </div>
    </>
  )
}

/* ── Fight Victory ────────────────────────── */

interface FightVictoryData {
  enemyPortrait: string
  xpGained: number
  coinsDropped: number
  coinsLost?: number
  loreText?: string
  weaponFound: { name: string; atk: number; lore: string } | null
  itemsDropped: { name: string; img: string; color: string; desc: string; rarity?: CardRarity }[]
  regenHp: number
}

function FightVictoryBody({ overlay }: { overlay: OverlayData }) {
  const body = (overlay.body as FightVictoryData) || {}
  const [expandedLoot, setExpandedLoot] = useState<number | null>(null)
  return (
    <div className="text-left space-y-2.5 mb-5">
      {/* Enemy portrait */}
      {body.enemyPortrait && (
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 bg-surface-container-highest pixel-border overflow-hidden">
            <img src={body.enemyPortrait} alt="enemy" className="w-full h-full object-cover sprite-canvas" />
          </div>
        </div>
      )}

      {/* XP */}
      <div className="bg-surface-container-lowest pixel-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="font-label text-sm text-on-surface-variant uppercase tracking-wide">XP Gained</span>
        </div>
        <span className="font-headline text-xl text-primary tabular-nums">+{body.xpGained}</span>
      </div>

      {/* Lore text */}
      {body.loreText && (
        <div className="bg-surface-container-lowest pixel-border p-3">
          <p className="font-body italic text-sm text-on-surface-variant/80 leading-relaxed">{body.loreText}</p>
        </div>
      )}

      {/* Coins lost */}
      {body.coinsLost != null && body.coinsLost > 0 && (
        <div className="bg-surface-container-lowest pixel-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span className="font-label text-sm text-on-surface-variant uppercase tracking-wide">Coins Lost</span>
          </div>
          <span className="font-headline text-xl text-error tabular-nums">-{body.coinsLost}</span>
        </div>
      )}

      {/* Coins */}
      {body.coinsDropped > 0 && (
        <div className="bg-surface-container-lowest pixel-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span className="font-label text-sm text-on-surface-variant uppercase tracking-wide">Coins</span>
          </div>
          <span className="font-headline text-xl text-amber-400 tabular-nums">+{body.coinsDropped}</span>
        </div>
      )}

      {/* Regen */}
      {body.regenHp > 0 && (
        <div className="bg-surface-container-lowest pixel-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="font-label text-sm text-on-surface-variant uppercase tracking-wide">HP Recovered</span>
          </div>
          <span className="font-headline text-xl text-error tabular-nums">+{body.regenHp}</span>
        </div>
      )}

      {/* Weapon */}
      {body.weaponFound && (
        <div className="bg-surface-container-lowest pixel-border p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>hardware</span>
            <span className="font-label text-xs text-tertiary uppercase tracking-widest font-bold">Weapon Found!</span>
          </div>
          <p className="font-headline text-base text-tertiary">
            {body.weaponFound.name}
            <span className="font-label text-sm text-tertiary/70 ml-2">(+{body.weaponFound.atk} ATK)</span>
          </p>
          <p className="font-label text-xs text-on-surface-variant italic mt-0.5">{body.weaponFound.lore}</p>
        </div>
      )}

      {/* Item drops */}
      {body.itemsDropped?.length > 0 && (
        <div className="bg-surface-container-lowest pixel-border p-3">
          <div className="font-label text-xs text-primary/70 uppercase tracking-widest mb-2">Loot</div>
          <div className="flex flex-col gap-2">
            {body.itemsDropped.map((item, i) => (
              <button
                key={i}
                onClick={() => setExpandedLoot(expandedLoot === i ? null : i)}
                className="flex items-center gap-2 w-full text-left group hover:bg-surface-container/50 rounded transition-colors p-1 -m-1"
              >
                <img src={item.img} alt={item.name} className={`w-10 h-10 object-contain flex-shrink-0 group-hover:scale-110 transition-transform ${getCardBorderClass(item.rarity)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-label text-sm text-${item.color} group-hover:underline`}>{item.name}</span>
                    {item.rarity && item.rarity !== 'common' && (
                      <span className={`font-label text-[9px] uppercase ${item.rarity === 'rare' ? 'text-amber-400' : 'text-green-400'}`}>{item.rarity}</span>
                    )}
                  </div>
                  {expandedLoot === i && (
                    <p className="font-label text-xs text-on-surface-variant/70 italic mt-0.5">{item.desc}</p>
                  )}
                </div>
                <span className={`material-symbols-outlined text-on-surface-variant/40 text-sm transition-transform ${expandedLoot === i ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
/* ── Victory ──────────────────────────────── */

function fmtTime(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface EndBody {
  elapsed?: number
  stats?: { beersDrunk: number; enemiesDefeated: EnemyKill[]; totalDmgDealt: number }
  enemyScore?: number
  beerScore?: number
  total?: number
}

function ScoreBreakdown({ body }: { body: EndBody }) {
  if (!body.stats) return null
  const { stats, enemyScore = 0, beerScore = 0, total = 0, elapsed = 0 } = body
  return (
    <div className="mt-4 not-italic">
      {/* Enemies defeated */}
      {stats.enemiesDefeated.length > 0 && (
        <div className="mb-3">
          <div className="font-label text-xs text-primary/70 uppercase tracking-widest mb-1.5">Enemies Defeated</div>
          <div className="bg-surface-container-lowest pixel-border p-2 text-left">
            {stats.enemiesDefeated.map((e, i) => (
              <div key={i} className="flex justify-between font-label text-xs py-0.5 border-b border-white/5 last:border-0">
                <span className="text-on-surface">{e.name}</span>
                <span className="text-tertiary tabular-nums">{e.dmgDealt} dmg · +{e.xp * 5} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Score */}
      <div className="bg-surface-container-lowest pixel-border p-3">
        <div className="font-label text-xs text-primary/70 uppercase tracking-widest mb-2 text-center">Score</div>
        <div className="space-y-1 text-left font-label text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Enemies Defeated</span>
            <span className="text-tertiary font-bold tabular-nums">+{enemyScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Beers Drunk ({stats.beersDrunk} × 50)</span>
            <span className="text-primary font-bold tabular-nums">+{beerScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Damage Dealt</span>
            <span className="text-secondary font-bold tabular-nums">+{stats.totalDmgDealt}</span>
          </div>
          <div className="h-px bg-primary/20 my-1" />
          <div className="flex justify-between">
            <span className="text-primary font-bold uppercase">Total</span>
            <span className="font-headline text-lg text-primary tabular-nums">{total}</span>
          </div>
        </div>
        {elapsed > 0 && (
          <div className="mt-2 text-center">
            <span className="material-symbols-outlined text-on-surface-variant/50 text-sm align-middle mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            <span className="font-label text-xs text-on-surface-variant/50 tabular-nums">{fmtTime(elapsed)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Lifetime Stats (shown when signed in) ── */

function LifetimeStats({ meta }: { meta: MetaProfile }) {
  return (
    <div className="mt-3 not-italic bg-surface-container-lowest pixel-border p-3">
      <div className="font-label text-xs text-primary/70 uppercase tracking-widest mb-2 text-center">Lifetime Stats</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-label text-xs text-on-surface-variant">
        <div><span className="text-primary font-bold block text-sm">{meta.totalRuns}</span>Runs</div>
        <div><span className="text-tertiary font-bold block text-sm">{meta.totalWins}</span>Wins</div>
        <div><span className="text-secondary font-bold block text-sm">{meta.highScore}</span>Best Score</div>
        <div><span className="text-on-surface font-bold block text-sm">{meta.bestLevel + 1}</span>Best Level</div>
      </div>
    </div>
  )
}

function VictoryBody({ overlay, meta }: { overlay: OverlayData; meta?: MetaProfile }) {
  const body = (overlay.body as EndBody) || {}
  return (
    <div className="font-body italic text-sm text-on-surface-variant text-left leading-relaxed mb-5">
      <p className="mb-2">
        Seppo stands over the fallen <strong className="text-on-surface not-italic">Boss</strong>. The bar is utterly silent.<br />
        He straightens his jacket. Walks to the corner table. Sits down.<br />
        Orders a Doppelbock. The barman pours it properly — full pint, no water.
      </p>
      <p>
        <em className="text-primary">"Nobody waters down my beer."</em><br />
        <span className="text-on-surface-variant text-xs">— Seppo Virtanen, reclaiming what was always his</span>
      </p>
      <ScoreBreakdown body={body} />
      {meta && meta.totalRuns > 0 && <LifetimeStats meta={meta} />}
    </div>
  )
}

/* ── Game Over ────────────────────────────── */

function GameOverBody({ enemyName, overlay, meta }: { enemyName?: string; overlay: OverlayData; meta?: MetaProfile }) {
  const body = (overlay.body as EndBody) || {}
  return (
    <div className="font-body italic text-sm text-on-surface-variant text-left leading-relaxed mb-5">
      <p className="mb-2">
        Seppo was beaten by <strong className="text-on-surface not-italic">{enemyName || 'them'}</strong>.<br />
        He sits on the pavement outside Ravintola Kulma,<br />
        beer spilled, jacket torn, dignity questionable.
      </p>
      <p>
        <em className="text-on-surface-variant">The corner seat is still occupied.<br />But a Finnish man does not give up easily.</em>
      </p>
      <ScoreBreakdown body={body} />
      {meta && meta.totalRuns > 0 && <LifetimeStats meta={meta} />}
    </div>
  )
}

/* ── Level Complete ───────────────────────── */

function LevelCompleteBody({ overlay, player }: { overlay: OverlayData; player: Player }) {
  const body = overlay.body as { healHp: number; nextLv: number } | null
  if (!body) return null
  return (
    <>
      <div className="bg-surface-container-lowest pixel-border p-4 mb-4 text-left font-label text-sm leading-loose text-on-surface-variant">
        <div className="grid grid-cols-[100px_1fr] gap-x-2">
          <span className="text-primary font-bold uppercase">Level</span><span>{player.level}</span>
          <span className="text-primary font-bold uppercase">HP</span><span>{player.hp} / {player.maxHp}</span>
          <span className="text-primary font-bold uppercase">ATK</span><span>{getPlayerAtk(player)}</span>
          <span className="text-primary font-bold uppercase">DEF</span><span>{getPlayerDef(player)}</span>
          <span className="text-primary font-bold uppercase">Weapon</span><span>{player.weapon ? player.weapon.name : 'Bare Fists'}</span>
        </div>
      </div>
      <p className="font-body italic text-sm text-on-surface-variant">Seppo recovers <strong className="text-primary not-italic">+{body.healHp} HP</strong>.</p>
      <p className="font-body italic text-sm text-on-surface-variant mt-2">Next: <strong className="text-tertiary not-italic">{LEVEL_NAMES[body.nextLv] || '???'}</strong></p>
    </>
  )
}

/* ── Upgrade Selection ────────────────────── */

function UpgradeBody({ overlay, onApplyUpgrade }: { overlay: OverlayData; onApplyUpgrade: (id: string, nextLv: number) => void }) {
  const body = overlay.body as { nextLv: number; nextName: string } | null
  const choices = overlay.choices || []
  if (!body) return null
  return (
    <>
      <p className="font-body text-sm text-on-surface-variant mb-4">
        Pick one permanent bonus before entering <strong className="text-tertiary not-italic">{body.nextName}</strong>.
      </p>
      <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
        {choices.map(u => (
          <div
            key={u.id}
            className={`w-36 sm:w-48 p-3 sm:p-4 bg-surface-container-highest pixel-border border border-${u.color}/40 cursor-pointer hover:border-${u.color} hover:scale-105 transition-all flex flex-col items-center gap-2 sm:gap-3 text-center`}
            onClick={() => onApplyUpgrade(u.id, body.nextLv)}
          >
            <span className={`material-symbols-outlined text-4xl text-${u.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{u.icon}</span>
            <h3 className={`font-headline text-lg text-${u.color} uppercase tracking-wide`}>{u.label}</h3>
            <p className="font-body text-xs text-on-surface-variant italic leading-snug">{u.desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}

/* ── Level Up Choice ──────────────────────── */

function LevelUpBody({ overlay, player, onApplyLevelUp }: { overlay: OverlayData; player: Player; onApplyLevelUp: (id: string) => void }) {
  const choices = overlay.choices || []
  return (
    <>
      <p className="font-body text-sm text-on-surface-variant mb-3">
        Base: <strong className="text-primary not-italic">+5 HP, +1 ATK, +1 DEF</strong> already applied. Pick an <strong className="text-tertiary not-italic">additional</strong> bonus.
      </p>
      <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
        {choices.map(u => (
          <div
            key={u.id}
            className={`w-36 sm:w-44 p-2 sm:p-3 bg-surface-container-highest pixel-border border border-${u.color}/40 cursor-pointer hover:border-${u.color} hover:scale-105 transition-all flex flex-col items-center gap-2 text-center`}
            onClick={() => onApplyLevelUp(u.id)}
          >
            <span className={`material-symbols-outlined text-3xl text-${u.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{u.icon}</span>
            <h3 className={`font-headline text-base text-${u.color} uppercase tracking-wide`}>{u.label}</h3>
            <p className="font-body text-[11px] text-on-surface-variant italic leading-snug">{u.desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}

/* ── Stat Info ────────────────────────────── */

function StatInfoBody() {
  const stats = [
    { icon: 'favorite', color: 'error', title: 'HP — Hit Points', text: 'When HP reaches 0, it\'s game over. Restore HP with food, resting, or leveling up.' },
    { icon: 'star', color: 'primary', title: 'XP — Experience', text: 'Gain XP from defeating enemies. Level up to get base stat boosts (+5 HP, +1 ATK, +1 DEF) and choose a bonus.' },
    { icon: 'swords', color: 'tertiary', title: 'ATK — Attack', text: 'Damage dealt = ATK − enemy DEF (min 1). Boosted by weapons, drink buffs, and level-ups.' },
    { icon: 'shield', color: 'on-surface-variant', title: 'DEF — Defence', text: 'Reduces incoming damage. Damage taken = enemy ATK − your DEF (min 1).' },
    { icon: 'bolt', color: 'amber-400', title: 'CRIT — Critical Hit', text: 'Chance to deal 1.5× damage. Base 10%. Increased by Wheat Beer buff and level-up perks.' },
    { icon: 'hardware', color: 'tertiary', title: 'Weapon', text: 'Adds flat ATK bonus. Found as loot from enemies.' },
    { icon: 'sports_bar', color: 'secondary', title: 'Drinks & Food', text: 'Drinks give temporary stat buffs. Food restores HP. Both scale stronger in later levels. Each use costs 1 action.' },
    { icon: 'pace', color: 'primary', title: 'Actions', text: 'You get 2 actions per turn. Attack, drink, or eat each cost 1 action. After your actions, the enemy attacks.' },
  ]
  return (
    <div className="text-left space-y-3 max-w-md mx-auto">
      {stats.map(s => (
        <div key={s.title} className="flex items-start gap-3">
          <span className={`material-symbols-outlined text-${s.color} text-2xl mt-0.5`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
          <div>
            <div className={`font-label text-sm font-bold text-${s.color} uppercase tracking-wide`}>{s.title}</div>
            <p className="font-body text-sm text-on-surface-variant">{s.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Relic Choice ─────────────────────────── */

const RARITY_COLOR: Record<string, string> = {
  common: 'on-surface-variant',
  uncommon: 'tertiary',
  rare: 'primary',
}

function RelicChoiceBody({ overlay, onApplyRelic }: { overlay: OverlayData; onApplyRelic: (id: string) => void }) {
  const relics = (overlay.choices || []) as unknown as Relic[]
  const isStart = (overlay.body as Record<string, unknown>)?.context === 'start'
  if (!relics.length) return <p className="font-body text-sm text-on-surface-variant italic">No relics available.</p>
  return (
    <div className="flex flex-col h-full">
      {isStart && (
        <p className="font-headline text-base sm:text-3xl text-primary/90 pt-4 sm:pt-12 pb-2 sm:pb-4 leading-snug">
          Seppo is napping under the conference room table when a weird dream takes hold…
        </p>
      )}
      {!isStart && (
        <p className="font-body text-sm text-on-surface-variant mb-4 italic mt-4">Pick one relic to keep.</p>
      )}
      <div className="flex-1" />
      <div className="relative flex gap-1.5 sm:gap-4 justify-center pb-6 sm:pb-12">
        {isStart && (
          <div className="absolute -top-6 sm:-top-8 left-0 right-0 text-center">
            <span className="font-label text-[9px] sm:text-xs text-on-surface-variant/50 uppercase tracking-widest">Choose a starting relic</span>
          </div>
        )}
        {relics.map(r => {
          const color = RARITY_COLOR[r.rarity] || 'on-surface-variant'
          return (
            <div
              key={r.id}
              className={`w-28 sm:w-48 p-2 sm:p-4 bg-surface-container-highest pixel-border border border-${color}/40 cursor-pointer hover:border-${color} hover:scale-105 transition-all flex flex-col items-center gap-1 sm:gap-3 text-center`}
              onClick={() => onApplyRelic(r.id)}
            >
              <span className={`material-symbols-outlined ${isStart ? 'text-3xl sm:text-6xl' : 'text-3xl sm:text-4xl'} text-${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
              <h3 className={`font-headline ${isStart ? 'text-sm sm:text-xl' : 'text-xs sm:text-base'} text-${color} uppercase tracking-wide`}>{r.name}</h3>
              <span className={`font-label ${isStart ? 'text-[9px] sm:text-xs' : 'text-[9px] sm:text-[10px]'} uppercase tracking-widest text-${color}/60`}>{r.rarity}</span>
              <p className={`font-body ${isStart ? 'text-[10px] sm:text-base' : 'text-[10px] sm:text-xs'} text-on-surface-variant italic leading-snug`}>{r.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Event Loot ───────────────────────────── */

function EventLootBody({ overlay }: { overlay: OverlayData }) {
  const body = overlay.body as { entries: { icon: string; label: string; desc: string; color: string; type: 'gain' | 'loss' | 'stat' | 'relic' }[] }
  const gains = body.entries.filter(e => e.type !== 'loss')
  const losses = body.entries.filter(e => e.type === 'loss')

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {gains.length > 0 && (
        <div className="bg-surface-container-lowest pixel-border p-2.5 sm:p-4">
          <div className="font-label text-[10px] sm:text-xs text-primary/70 uppercase tracking-widest mb-1.5 sm:mb-2">Gained</div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {gains.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <span className={`material-symbols-outlined text-${entry.color} text-xl sm:text-2xl`} style={{ fontVariationSettings: entry.type === 'relic' ? "'FILL' 1" : undefined }}>{entry.icon}</span>
                <div className="flex-1 min-w-0 text-left">
                  <span className={`font-headline text-xs sm:text-sm text-${entry.color} uppercase tracking-wide`}>{entry.label}</span>
                  <p className="font-body italic text-[10px] sm:text-xs text-on-surface-variant/60 leading-tight">{entry.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {losses.length > 0 && (
        <div className="bg-surface-container-lowest pixel-border p-2.5 sm:p-4">
          <div className="font-label text-[10px] sm:text-xs text-error/70 uppercase tracking-widest mb-1.5 sm:mb-2">Cost</div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {losses.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <span className={`material-symbols-outlined text-${entry.color} text-xl sm:text-2xl`}>{entry.icon}</span>
                <div className="flex-1 min-w-0 text-left">
                  <span className={`font-headline text-xs sm:text-sm text-${entry.color} uppercase tracking-wide`}>{entry.label}</span>
                  <p className="font-body italic text-[10px] sm:text-xs text-on-surface-variant/60 leading-tight">{entry.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
