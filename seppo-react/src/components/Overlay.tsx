import type { OverlayData, Player, Enemy, EnemyKill, Relic } from '../types'
import { getPlayerAtk, getPlayerDef, LEVEL_NAMES } from '../gameData'

interface Props {
  overlay: OverlayData | null
  player: Player
  enemy: Enemy | null
  onStartGame: () => void
  onApplyLevelUp: (id: string) => void
  onApplyUpgrade: (id: string, nextLv: number) => void
  onApplyRelic: (id: string) => void
}

export default function Overlay({ overlay, player, enemy, onStartGame, onApplyLevelUp, onApplyUpgrade, onApplyRelic }: Props) {
  if (!overlay) return null

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex items-start sm:items-center justify-center overflow-y-auto transition-opacity duration-400">
      <div className="w-full max-w-lg p-3 sm:p-8 text-center relative my-auto">
        {/* Portrait for intro */}
        {overlay.type === 'intro' && (
          <div className="mx-auto mb-1 sm:mb-4 h-10 w-10 sm:h-28 sm:w-28 bg-surface-container-highest pixel-border flex items-center justify-center overflow-hidden">
            <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
          </div>
        )}

        <h1 className="font-headline text-base sm:text-3xl text-primary tracking-tight uppercase mb-0.5 sm:mb-1">{overlay.title}</h1>
        <div className="w-24 sm:w-48 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-1.5 sm:mb-4" />

        {/* Body content depends on overlay type */}
        {overlay.type === 'intro' && <IntroBody />}
        {overlay.type === 'fight-victory' && <FightVictoryBody overlay={overlay} />}
        {overlay.type === 'victory' && <VictoryBody overlay={overlay} />}
        {overlay.type === 'game-over' && <GameOverBody enemyName={enemy?.name} overlay={overlay} />}
        {overlay.type === 'stat-info' && <StatInfoBody />}
        {overlay.type === 'level-complete' && <LevelCompleteBody overlay={overlay} player={player} />}
        {overlay.type === 'upgrade' && <UpgradeBody overlay={overlay} onApplyUpgrade={onApplyUpgrade} />}
        {overlay.type === 'level-up' && <LevelUpBody overlay={overlay} player={player} onApplyLevelUp={onApplyLevelUp} />}
        {overlay.type === 'relic-choice' && <RelicChoiceBody overlay={overlay} onApplyRelic={onApplyRelic} />}

        {/* Action button */}
        {overlay.showBtn && (
          <button
            onClick={overlay.type === 'intro' ? onStartGame : overlay.onBtn}
            className="relative group w-36 h-9 sm:w-56 sm:h-14 bg-surface-container-highest pixel-border border-amber-900 border-2 active:translate-y-0.5 transition-all overflow-hidden mx-auto mt-2 sm:mt-4"
          >
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-1.5 sm:gap-2">
              <span className="material-symbols-outlined text-primary text-base sm:text-2xl">swords</span>
              <span className="font-headline text-sm sm:text-lg text-primary tracking-widest uppercase">{overlay.btnText}</span>
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-950/40 via-transparent to-amber-950/40" />
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Intro ────────────────────────────────── */

function IntroBody() {
  return (
    <>
      <div className="bg-surface-container-lowest pixel-border p-1.5 sm:p-4 mb-1.5 sm:mb-4 text-left font-label text-[9px] sm:text-xs leading-snug sm:leading-loose text-on-surface-variant">
        <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[80px_1fr] gap-x-1.5 sm:gap-x-2">
          <span className="text-primary font-bold uppercase">Name</span><span>Seppo Virtanen</span>
          <span className="text-primary font-bold uppercase">Age</span><span>42</span>
          <span className="text-primary font-bold uppercase">Origin</span><span>Tampere, Finland</span>
          <span className="text-primary font-bold uppercase">Former job</span><span>Senior IT Consultant</span>
          <span className="text-primary font-bold uppercase">Current</span><span>Fired for calling the boss's processes stupid</span>
          <span className="text-primary font-bold uppercase">Hobbies</span><span>Craft beer, sauna, arguing on forums at 2am</span>
          <span className="text-primary font-bold uppercase">Weakness</span><span>Beer on tap. Bad bosses. Empty stomach.</span>
        </div>
      </div>
      <div className="font-body italic text-[10px] sm:text-sm text-on-surface-variant text-left leading-snug sm:leading-relaxed mb-2 sm:mb-5">
        <p className="mb-0.5 sm:mb-2">Seppo is a senior IT consultant. Recent years have gone downhill with the industry and his project.</p>
        <p className="mb-0.5 sm:mb-2">This Friday he had enough — emptied the office fridge, told the <strong className="text-on-surface not-italic">boss</strong> his processes are stupid, and got fired on the spot.</p>
        <p className="mb-0.5 sm:mb-2">Now Seppo wanders with one goal — <em className="text-primary">numb the frustration.</em></p>
      </div>
    </>
  )
}
/* ── Fight Victory ────────────────────────── */

interface FightVictoryData {
  enemyPortrait: string
  xpGained: number
  weaponFound: { name: string; atk: number; lore: string } | null
  itemsDropped: { name: string; img: string; color: string }[]
  regenHp: number
}

function FightVictoryBody({ overlay }: { overlay: OverlayData }) {
  const body = (overlay.body as FightVictoryData) || {}
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
          <div className="flex gap-4 flex-wrap">
            {body.itemsDropped.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={item.img} alt={item.name} className="w-8 h-8 object-contain" />
                <span className={`font-label text-sm text-${item.color}`}>{item.name}</span>
              </div>
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

function VictoryBody({ overlay }: { overlay: OverlayData }) {
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
    </div>
  )
}

/* ── Game Over ────────────────────────────── */

function GameOverBody({ enemyName, overlay }: { enemyName?: string; overlay: OverlayData }) {
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
  if (!relics.length) return <p className="font-body text-sm text-on-surface-variant italic">No relics available.</p>
  return (
    <>
      <p className="font-body text-sm text-on-surface-variant mb-4 italic">Pick one relic to keep.</p>
      <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
        {relics.map(r => {
          const color = RARITY_COLOR[r.rarity] || 'on-surface-variant'
          return (
            <div
              key={r.id}
              className={`w-36 sm:w-48 p-3 sm:p-4 bg-surface-container-highest pixel-border border border-${color}/40 cursor-pointer hover:border-${color} hover:scale-105 transition-all flex flex-col items-center gap-2 sm:gap-3 text-center`}
              onClick={() => onApplyRelic(r.id)}
            >
              <span className={`material-symbols-outlined text-4xl text-${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
              <h3 className={`font-headline text-base text-${color} uppercase tracking-wide`}>{r.name}</h3>
              <span className={`font-label text-[10px] uppercase tracking-widest text-${color}/60`}>{r.rarity}</span>
              <p className="font-body text-xs text-on-surface-variant italic leading-snug">{r.desc}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}
