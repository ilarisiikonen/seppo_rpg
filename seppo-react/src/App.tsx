import { useState, useEffect } from 'react'
import { useGameState } from './useGameState'
import { LEVEL_BGS, getPlayerBlock, getPlayerDef, getPlayerAtk } from './gameData'
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

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function App() {
  const { state: g, actions } = useGameState()
  const [now, setNow] = useState(Date.now())
  const [mapOpen, setMapOpen] = useState(false)
  const [relicOpen, setRelicOpen] = useState(false)

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

        {/* ════════ LIVE TIMER ════════ */}
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
        <div className="fixed bottom-2 right-2 sm:bottom-5 sm:right-5 z-[80] flex flex-col gap-1 sm:gap-2">
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
            onClick={actions.showStatInfo}
            className="w-7 h-7 sm:w-12 sm:h-12 bg-surface-container-highest pixel-border border border-on-surface-variant/30 hover:border-primary active:translate-y-0.5 transition-all flex items-center justify-center"
            title="Stat Guide"
          >
            <span className="material-symbols-outlined text-on-surface-variant/60 text-base sm:text-2xl">help</span>
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
        onApplyLevelUp={actions.applyLevelUpChoice}
        onApplyUpgrade={actions.applyUpgrade}
        onApplyRelic={actions.applyRelicChoice}
      />

      {/* ════════ RELIC VIEWER ════════ */}
      {relicOpen && <RelicViewer relics={g.player.relics} onClose={() => setRelicOpen(false)} />}

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
