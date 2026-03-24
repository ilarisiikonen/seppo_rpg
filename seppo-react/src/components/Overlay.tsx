import type { OverlayData, Player, Enemy } from '../types'
import { getPlayerAtk, getPlayerDef, LEVEL_NAMES } from '../gameData'

interface Props {
  overlay: OverlayData | null
  player: Player
  enemy: Enemy | null
  onStartGame: () => void
  onApplyLevelUp: (id: string) => void
  onApplyUpgrade: (id: string, nextLv: number) => void
}

export default function Overlay({ overlay, player, enemy, onStartGame, onApplyLevelUp, onApplyUpgrade }: Props) {
  if (!overlay) return null

  return (
    <div className="fixed inset-0 z-[100] bg-surface/95 backdrop-blur-md flex items-center justify-center transition-opacity duration-400">
      <div className="bg-surface-container pixel-border max-w-lg w-[92%] p-8 text-center relative max-h-[90vh] overflow-y-auto">
        {/* Portrait for intro */}
        {overlay.type === 'intro' && (
          <div className="mx-auto mb-4 h-28 w-28 bg-surface-container-highest pixel-border flex items-center justify-center overflow-hidden">
            <img src="assets/characters/seppo/rotations/south.png" alt="Seppo" className="w-full h-full object-cover sprite-canvas" />
          </div>
        )}

        <h1 className="font-headline text-3xl text-primary tracking-tight uppercase mb-1">{overlay.title}</h1>
        <div className="w-48 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-4" />

        {/* Body content depends on overlay type */}
        {overlay.type === 'intro' && <IntroBody />}
        {overlay.type === 'victory' && <VictoryBody />}
        {overlay.type === 'game-over' && <GameOverBody enemyName={enemy?.name} />}
        {overlay.type === 'stat-info' && <StatInfoBody />}
        {overlay.type === 'level-complete' && <LevelCompleteBody overlay={overlay} player={player} />}
        {overlay.type === 'upgrade' && <UpgradeBody overlay={overlay} onApplyUpgrade={onApplyUpgrade} />}
        {overlay.type === 'level-up' && <LevelUpBody overlay={overlay} player={player} onApplyLevelUp={onApplyLevelUp} />}

        {/* Action button */}
        {overlay.showBtn && (
          <button
            onClick={overlay.type === 'intro' ? onStartGame : overlay.onBtn}
            className="relative group w-56 h-14 bg-surface-container-highest pixel-border border-amber-900 border-2 active:translate-y-0.5 transition-all overflow-hidden mx-auto mt-4"
          >
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary">swords</span>
              <span className="font-headline text-lg text-primary tracking-widest uppercase">{overlay.btnText}</span>
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
      <div className="bg-surface-container-lowest pixel-border p-4 mb-4 text-left font-label text-xs leading-loose text-on-surface-variant">
        <div className="grid grid-cols-[80px_1fr] gap-x-2">
          <span className="text-primary font-bold uppercase">Name</span><span>Seppo Virtanen</span>
          <span className="text-primary font-bold uppercase">Age</span><span>42</span>
          <span className="text-primary font-bold uppercase">Origin</span><span>Tampere, Finland</span>
          <span className="text-primary font-bold uppercase">Former job</span><span>Senior Software Developer</span>
          <span className="text-primary font-bold uppercase">Current</span><span>"Between opportunities" — 14 months</span>
          <span className="text-primary font-bold uppercase">Hobbies</span><span>Craft beer, sauna, arguing on forums at 2am</span>
          <span className="text-primary font-bold uppercase">Weakness</span><span>Stout on tap. Justice. Corner seats.</span>
        </div>
      </div>
      <div className="font-body italic text-sm text-on-surface-variant text-left leading-relaxed mb-5">
        <p className="mb-2">Seppo Virtanen asked little of the world. Every Friday at six he walked to <strong className="text-on-surface not-italic">Ravintola Kulma</strong> — the old bar on Hämeenkatu — and took his corner seat. The last booth by the broken radiator. Nobody else wanted it. He'd sat there for <em className="text-primary">eleven years.</em></p>
        <p className="mb-2">Then the company "restructured." Not personal. Seppo said nothing, collected his laptop, and headed for Ravintola Kulma. A Doppelbock would fix this. They always did.</p>
        <p className="mb-2">But an angry cyclist nearly ran him over in the <strong className="text-on-surface not-italic">park</strong>. Then some homeless men blocked the path. By the time Seppo reached the <strong className="text-on-surface not-italic">street</strong>, a black-metal musician was screaming in his face and a bouncer shoved him aside. The whole neighbourhood had gone mad.</p>
        <p className="mb-2">And somewhere inside <strong className="text-on-surface not-italic">Ravintola Kulma</strong>, <strong className="text-on-surface not-italic">Ismo</strong> — neighbourhood loudmouth, self-declared hard man, the kind of person who calls craft beer "pretentious" while ordering the same lager since 1998 — was sitting in Seppo's corner seat.</p>
        <p>Seppo cracked his knuckles in the particular way his father had taught him. He'd fight through the park, down the street, and into the bar.<br /><em className="text-primary">Some injustices cannot go unanswered.</em></p>
      </div>
    </>
  )
}

/* ── Victory ──────────────────────────────── */

function VictoryBody() {
  return (
    <div className="font-body italic text-sm text-on-surface-variant text-left leading-relaxed mb-5">
      <p className="mb-2">
        Seppo stands over the fallen <strong className="text-on-surface not-italic">Ismo</strong>. The bar is utterly silent.<br />
        He straightens his jacket. Walks to the corner table. Sits down.<br />
        Orders a Doppelbock. The barman pours it properly — full pint, no water.
      </p>
      <p>
        <em className="text-primary">"Nobody waters down my beer."</em><br />
        <span className="text-on-surface-variant text-xs">— Seppo Virtanen, reclaiming what was always his</span>
      </p>
    </div>
  )
}

/* ── Game Over ────────────────────────────── */

function GameOverBody({ enemyName }: { enemyName?: string }) {
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
      <div className="flex gap-4 justify-center flex-wrap">
        {choices.map(u => (
          <div
            key={u.id}
            className={`w-48 p-4 bg-surface-container-highest pixel-border border border-${u.color}/40 cursor-pointer hover:border-${u.color} hover:scale-105 transition-all flex flex-col items-center gap-3 text-center`}
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
      <div className="flex gap-3 justify-center flex-wrap">
        {choices.map(u => (
          <div
            key={u.id}
            className={`w-44 p-3 bg-surface-container-highest pixel-border border border-${u.color}/40 cursor-pointer hover:border-${u.color} hover:scale-105 transition-all flex flex-col items-center gap-2 text-center`}
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
    { icon: 'pace', color: 'primary', title: 'Actions', text: 'You get 2 actions per turn. Attack, drink, eat, or flee each cost 1 action. After your actions, the enemy attacks.' },
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
