import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { useGameState, hasSavedRun, type RunEndData } from './useGameState'
import { LEVEL_BGS, getPlayerBlock, getPlayerDef, getPlayerAtk, getEarnedUnlocks, getUnlockedItemIds, UNLOCKS } from './gameData'
import { onAuth, signInWithGoogle, signOutUser, loadMeta, saveMeta, updateMetaAfterRun, updateLeaderboardEntry, isPlayerNameTaken, deleteAccount, createDefaultMeta, type MetaProfile } from './firebase'
import type { User } from 'firebase/auth'
import PlayerHUD from './components/PlayerHUD'
import EnemyHUD from './components/EnemyHUD'
import CombatArea from './components/CombatArea'
import EventFeed from './components/EventFeed'
import BattleLog from './components/BattleLog'
import BottomUI, { MobileSubMenuOverlay } from './components/BottomUI'
import Overlay from './components/Overlay'
import LevelMap from './components/LevelMap'
import Shop from './components/Shop'
import RelicViewer from './components/RelicViewer'
import EventOverlay from './components/EventOverlay'
import MainMenu from './components/MainMenu'

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const userRef = useRef<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const metaRef = useRef<MetaProfile>(createDefaultMeta())
  const metaDirty = useRef(false)           // true once handleRunEnd has updated meta
  const metaLoaded = useRef(false)          // true once loadMeta has completed
  const [metaTick, setMetaTick] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [newUnlocks, setNewUnlocks] = useState<string[]>([])

  // Read meta from ref (metaTick forces re-render when it changes)
  void metaTick
  const meta = metaRef.current

  // Compute unlocked item IDs from meta
  const earnedUnlockIds = getEarnedUnlocks(meta)
  const unlockedItemIds = getUnlockedItemIds(earnedUnlockIds)

  // Listen to auth state — load meta once
  useEffect(() => {
    let cancelled = false
    const unsub = onAuth(async (u) => {
      setUser(u)
      userRef.current = u
      setAuthReady(true)
      if (u && !metaLoaded.current) {
        metaLoaded.current = true
        const loaded = await loadMeta(u.uid)
        if (!cancelled && !metaDirty.current) {
          metaRef.current = loaded
          setMetaTick(v => v + 1)
        }
      } else if (!u) {
        metaLoaded.current = false
        metaDirty.current = false
        if (!cancelled) {
          metaRef.current = createDefaultMeta()
          setMetaTick(v => v + 1)
        }
      }
    })
    return () => { cancelled = true; unsub() }
  }, [])

  // Run-end callback — update meta and save to Firestore
  const handleRunEnd = useCallback((data: RunEndData) => {
    const { meta: updated, newUnlocks: unlocked } = updateMetaAfterRun(metaRef.current, data)
    metaRef.current = updated
    metaDirty.current = true
    // Defer React state updates so triggerGameOver/triggerVictory render() runs first
    setTimeout(() => {
      setMetaTick(v => v + 1)
      if (unlocked.length > 0) setNewUnlocks(unlocked)
    }, 0)
    // Fire-and-forget Firestore save
    const u = userRef.current
    if (u) {
      console.log('[handleRunEnd] saving to Firestore, uid:', u.uid, 'totalRuns:', updated.totalRuns)
      saveMeta(u.uid, updated)
        .then(() => {
          console.log('[handleRunEnd] Firestore save SUCCESS, totalRuns:', updated.totalRuns)
          return updateLeaderboardEntry(u.uid, updated)
        })
        .catch(e => console.error('[handleRunEnd] Firestore save FAILED:', e))
    } else {
      console.warn('[handleRunEnd] No user signed in — cannot save to Firestore!')
    }
  }, [])

  const handleSetPlayerName = useCallback(async (name: string): Promise<string | null> => {
    const u = userRef.current
    if (!u) return 'Not signed in'
    try {
      const taken = await isPlayerNameTaken(name, u.uid)
      if (taken) return 'Name already taken'
    } catch {
      return 'Could not verify name'
    }
    metaRef.current = { ...metaRef.current, playerName: name }
    setMetaTick(v => v + 1)
    saveMeta(u.uid, metaRef.current).catch(e => console.error('Failed to save player name:', e))
    updateLeaderboardEntry(u.uid, metaRef.current).catch(e => console.error('Failed to update leaderboard:', e))
    return null
  }, [])

  const handleDeleteAccount = useCallback(async () => {
    const u = userRef.current
    if (!u) return
    try {
      await deleteAccount(u.uid)
    } catch (e) {
      console.error('Failed to delete account:', e)
    }
    metaRef.current = createDefaultMeta()
    metaLoaded.current = false
    metaDirty.current = false
    setMetaTick(v => v + 1)
  }, [])

  const { state: g, actions } = useGameState(handleRunEnd, unlockedItemIds)
  const [now, setNow] = useState(Date.now())
  const [mapOpen, setMapOpen] = useState(false)
  const [relicOpen, setRelicOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuTab, setMenuTab] = useState<'stats' | 'leaderboard' | 'unlocks' | 'guide'>('stats')

  // Phase transition overlay
  const transitionRef = useRef<HTMLDivElement>(null)
  const prevPhaseRef = useRef(g.phase)
  const transitionTimer = useRef<ReturnType<typeof setTimeout>>()
  useLayoutEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = g.phase
    if (prev === g.phase || g.phase === 'intro') return
    const show = g.phase === 'battle' || g.phase === 'shop' || (g.phase === 'map' && prev !== 'intro')
    if (!show) return
    const el = transitionRef.current
    if (!el) return
    // Force black immediately before browser paints
    el.style.opacity = '1'
    el.classList.remove('phase-transition')
    // Trigger reflow then start fade-out animation
    void el.offsetWidth
    el.classList.add('phase-transition')
    clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => {
      el.classList.remove('phase-transition')
      el.style.opacity = '0'
    }, 1000)
  }, [g.phase])

  useEffect(() => {
    if (g.phase === 'intro' || g.runStartTime === 0) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [g.phase, g.runStartTime])

  const elapsed = g.runStartTime ? now - g.runStartTime : 0

  const bgSrc = g.isShopkeeperFight ? 'assets/levels/shop_fight.png' : (LEVEL_BGS[g.currentLevel] || LEVEL_BGS[0])

  return (
    <>
      {/* ════════ MAIN COMBAT CANVAS ════════ */}
      <main className="relative h-[100dvh] w-full flex flex-col items-center justify-between p-[1vh_0.5rem] sm:p-[1.5vh_1.5rem] overflow-hidden">
        {/* DARK TAVERN BG */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={bgSrc}
            alt=""
            className={`absolute inset-0 w-full h-full opacity-50 ${g.currentLevel === 0 ? 'object-contain' : 'object-cover'}`}
            style={{ objectPosition: g.currentLevel === 1 ? 'center 30%' : 'center center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/40 to-surface/80" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#39342f 1px,transparent 1px)', backgroundSize: '6px 6px' }} />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface via-transparent to-surface-container-lowest/50 pointer-events-none" />

        {/* ════════ TOP HUD ════════ */}
        <div className="relative z-10 w-full flex flex-row justify-between items-start gap-1.5 sm:gap-0 max-w-6xl">
          <PlayerHUD
            player={g.player}
            currentLevel={g.currentLevel}
            currentRound={g.currentRound}
            onOpenRelics={() => setRelicOpen(true)}
          />
          <EnemyHUD enemy={g.enemy} playerDef={getPlayerDef(g.player)} actionsLeft={g.actionsLeft} inBattle={g.inBattle} />
        </div>

        {/* ════════ MID: COMBATANTS ════════ */}
        <CombatArea
          playerAnimSet={g.playerAnimSet}
          playerAnimKey={g.playerAnimKey}
          playerAnimSeq={g.playerAnimSeq}
          enemyAnims={g.enemy?.anims ?? null}
          enemyAnimKey={g.enemyAnimKey}
          enemyAnimSeq={g.enemyAnimSeq}
          onPlayerAnimComplete={actions.playerAnimComplete}
          onEnemyAnimComplete={actions.enemyAnimComplete}
          floatDamages={g.floatDamages}
          blockAmount={getPlayerBlock(g.player)}
          isBlocking={g.isBlocking}
          actionsLeft={g.actionsLeft}
          inBattle={g.inBattle}
          enemyIntents={g.enemyNextDmgs}
          enemyWillBlock={g.enemyWillBlock}
          enemyBlocking={g.enemy?.isBlocking ?? 0}
          enemyDef={g.enemy?.def ?? 0}
          enemyMirrored={g.currentLevel === 7}
          playerDebuffs={g.player.debuffs}
          enemyDebuffs={g.enemy?.debuffs ?? []}
          enemyWillDebuff={g.enemyWillDebuff}
        />

        {/* ════════ FLOATING LOG ════════ */}
        <EventFeed
          entries={g.feedEntries}
          currentLevel={g.currentLevel}
          currentRound={g.currentRound}
        />

        {/* ════════ EXPANDABLE LOG ════════ */}
        <BattleLog entries={g.logEntries} />

        {/* ════════ BOTTOM UI ════════ */}
        <BottomUI
          player={g.player}
          inBattle={g.inBattle}
          actionsLeft={g.actionsLeft}
          currentLevel={g.currentLevel}
          currentRound={g.currentRound}
          subMenuType={g.subMenuType}
          phase={g.phase}
          isBlocking={g.isBlocking}
          playerDmg={Math.max(1, Math.round((getPlayerAtk(g.player) - (g.enemy?.def ?? 0)) * (g.player.debuffs.some(d => d.type === 'weak' && d.turns > 0) ? 0.75 : 1)))}
          blockAmount={getPlayerBlock(g.player)}
          onAttack={actions.attack}
          onBlock={actions.block}
          onDrink={actions.drinkBeer}
          onEat={actions.eatFood}
          onOpenBeer={actions.openBeerMenu}
          onOpenFood={actions.openFoodMenu}
          onCloseSubMenu={actions.closeSubMenu}
          onExplore={actions.explore}
          onRest={actions.rest}
        />

        {/* AMBIENT */}
        <div className="absolute inset-0 pointer-events-none z-40 bg-gradient-to-tr from-amber-500/[0.03] via-transparent to-transparent" />
        <div className="absolute inset-0 pointer-events-none z-[45] ring-[40px] sm:ring-[100px] ring-inset ring-surface/40" />

        {/* ════════ LIVE TIMER + AUTH ════════ */}
        {g.runStartTime > 0 && !g.overlay && g.phase !== 'map' && (
          <div className="absolute top-0.5 right-1 sm:top-3 sm:right-4 z-50 flex items-center gap-2">
            <span className="font-label text-[9px] sm:text-sm text-on-surface-variant/50 tabular-nums">
              <span className="material-symbols-outlined text-[9px] sm:text-sm align-middle mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
              {formatTime(elapsed)}
            </span>
          </div>
        )}
      </main>

      {/* ════════ BOTTOM-RIGHT BUTTONS ════════ */}
      {!g.overlay && g.phase !== 'intro' && (
        <div className="fixed bottom-2 right-2 sm:bottom-5 sm:right-5 z-[95] flex flex-col gap-1 sm:gap-2">
          {g.phase === 'battle' && !mapOpen && !relicOpen && (
            <button
              onClick={() => setMapOpen(true)}
              className="w-7 h-7 sm:w-12 sm:h-12 bg-surface-container-highest pixel-border border border-primary/40 hover:border-primary active:translate-y-0.5 transition-all flex items-center justify-center"
              title="Open Map"
            >
              <span className="material-symbols-outlined text-primary text-base sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
            </button>
          )}
          <button
            onClick={() => { setMenuTab('leaderboard'); setMenuOpen(true) }}
            className="w-7 h-7 sm:w-12 sm:h-12 bg-surface-container-highest pixel-border border border-amber-400/40 hover:border-amber-400 active:translate-y-0.5 transition-all flex items-center justify-center"
            title="Leaderboard"
          >
            <span className="material-symbols-outlined text-amber-400/70 text-base sm:text-2xl">leaderboard</span>
          </button>
          <button
            onClick={() => { setMenuTab('stats'); setMenuOpen(true) }}
            className="w-7 h-7 sm:w-12 sm:h-12 bg-surface-container-highest pixel-border border border-on-surface-variant/30 hover:border-primary active:translate-y-0.5 transition-all flex items-center justify-center"
            title="Menu"
          >
            <span className="material-symbols-outlined text-on-surface-variant/60 text-base sm:text-2xl">menu</span>
          </button>
        </div>
      )}

      {/* ════════ LEVEL MAP ════════ */}
      <LevelMap
        currentLevel={g.currentLevel}
        currentRound={g.currentRound}
        phase={g.phase}
        player={g.player}
        levelRoutes={g.levelRoutes}
        chosenRoute={g.chosenRoute}
        routeNodeIdx={g.routeNodeIdx}
        onChooseRoute={actions.chooseRoute}
        onProceed={actions.explore}
        onEat={actions.eatFood}
        popupOpen={mapOpen}
        onClosePopup={() => setMapOpen(false)}
        onOpenRelics={() => setRelicOpen(true)}
      />

      {/* ════════ SHOP ════════ */}
      {g.phase === 'shop' && (
        <Shop
          player={g.player}
          inventory={g.shopInventory}
          currentLevel={g.currentLevel}
          currentRound={g.currentRound}
          onBuy={actions.buyItem}
          onLeave={actions.leaveShop}
          onFightShopkeeper={actions.fightShopkeeper}
          onOpenMap={() => setMapOpen(true)}
          onOpenRelics={() => setRelicOpen(true)}
        />
      )}

      {/* ════════ EVENT OVERLAY ════════ */}
      {g.activeEvent && (
        <EventOverlay
          activeEvent={g.activeEvent}
          onChoose={actions.chooseEvent}
        />
      )}

      {/* ════════ OVERLAY ════════ */}
      <Overlay
        overlay={g.overlay}
        player={g.player}
        enemy={g.enemy}
        onStartGame={actions.startGame}
        onResumeGame={actions.resumeGame}
        hasSavedRun={hasSavedRun()}
        onApplyLevelUp={actions.applyLevelUpChoice}
        onApplyUpgrade={actions.applyUpgrade}
        onApplyRelic={actions.applyRelicChoice}
        user={user}
        meta={meta}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
        onSetPlayerName={handleSetPlayerName}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* ════════ RELIC VIEWER ════════ */}
      {relicOpen && <RelicViewer relics={g.player.relics} onClose={() => setRelicOpen(false)} />}

      {/* ════════ MAIN MENU ════════ */}
      {menuOpen && <MainMenu user={user} meta={meta} onClose={() => setMenuOpen(false)} onGiveUp={() => { setMenuOpen(false); actions.giveUpRun() }} runStats={g.phase !== 'intro' ? g.runStats : null} currentLevel={g.currentLevel} runActive={g.phase !== 'intro'} initialTab={menuTab} />}

      {/* ════════ UNLOCK NOTIFICATION ════════ */}
      {newUnlocks.length > 0 && (
        <div className="fixed inset-0 z-[120] bg-surface/90 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-container pixel-border p-5 text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
            <h2 className="font-headline text-lg text-primary uppercase tracking-widest mb-3">New Unlocks!</h2>
            <div className="space-y-2 mb-4">
              {newUnlocks.map(uid => {
                const def = UNLOCKS.find(u => u.id === uid)
                if (!def) return null
                return (
                  <div key={uid} className="flex items-center gap-2 p-2 bg-primary/10 pixel-border">
                    <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{def.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-label text-xs font-bold text-primary uppercase">{def.name}</div>
                      <div className="font-body text-[10px] text-on-surface-variant">{def.unlockIds.length} new item{def.unlockIds.length !== 1 ? 's' : ''} available</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setNewUnlocks([])}
              className="px-6 py-2 bg-primary text-on-primary font-label text-sm uppercase tracking-wider pixel-border hover:brightness-110 active:translate-y-0.5 transition-all"
            >
              Nice!
            </button>
          </div>
        </div>
      )}

      {/* ════════ PHASE TRANSITION ════════ */}
      <div ref={transitionRef} className="fixed inset-0 z-[130] pointer-events-none bg-black opacity-0" />

      {/* ════════ ROTATE DEVICE OVERLAY (portrait mobile only) ════════ */}
      <div className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center gap-6 p-8 text-center portrait-only">
        <span className="material-symbols-outlined text-primary text-6xl animate-spin-slow">screen_rotation</span>
        <h2 className="font-headline text-2xl text-primary uppercase tracking-wide">Rotate Your Device</h2>
        <p className="font-body text-sm text-on-surface-variant max-w-xs">
          Seppo's Last Round is best played in landscape mode. Please rotate your device to continue.
        </p>
      </div>

      {/* ════════ MOBILE DRINK/FOOD MENU ════════ */}
      {g.subMenuType && (
        <MobileSubMenuOverlay
          type={g.subMenuType}
          player={g.player}
          currentLevel={g.currentLevel}
          onDrink={actions.drinkBeer}
          onEat={actions.eatFood}
          onClose={actions.closeSubMenu}
        />
      )}
    </>
  )
}
