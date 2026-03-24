import { useGameState } from './useGameState'
import { LEVEL_BGS } from './gameData'
import PlayerHUD from './components/PlayerHUD'
import EnemyHUD from './components/EnemyHUD'
import CombatArea from './components/CombatArea'
import EventFeed from './components/EventFeed'
import BattleLog from './components/BattleLog'
import BottomUI from './components/BottomUI'
import Overlay from './components/Overlay'

export default function App() {
  const { state: g, actions } = useGameState()

  const bgSrc = LEVEL_BGS[g.currentLevel] || LEVEL_BGS[0]

  return (
    <>
      {/* ════════ MAIN COMBAT CANVAS ════════ */}
      <main className="relative h-full w-full flex flex-col items-center justify-between p-6 overflow-hidden">
        {/* DARK TAVERN BG */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={bgSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            style={{ objectPosition: g.currentLevel === 1 ? 'center 30%' : 'center center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/40 to-surface/80" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#39342f 1px,transparent 1px)', backgroundSize: '6px 6px' }} />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface via-transparent to-surface-container-lowest/50 pointer-events-none" />

        {/* ════════ TOP HUD ════════ */}
        <div className="relative z-10 w-full flex justify-between items-start max-w-6xl">
          <PlayerHUD
            player={g.player}
            currentLevel={g.currentLevel}
            currentRound={g.currentRound}
            onStatInfo={actions.showStatInfo}
          />
          <EnemyHUD enemy={g.enemy} />
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
          usedCount={g.usedCount}
          currentLevel={g.currentLevel}
          currentRound={g.currentRound}
          subMenuType={g.subMenuType}
          phase={g.phase}
          onAttack={actions.attack}
          onDrink={actions.drinkBeer}
          onEat={actions.eatFood}
          onFlee={actions.flee}
          onOpenBeer={actions.openBeerMenu}
          onOpenFood={actions.openFoodMenu}
          onCloseSubMenu={actions.closeSubMenu}
          onExplore={actions.explore}
          onRest={actions.rest}
        />

        {/* AMBIENT */}
        <div className="absolute inset-0 pointer-events-none z-40 bg-gradient-to-tr from-amber-500/[0.03] via-transparent to-transparent" />
        <div className="absolute inset-0 pointer-events-none z-[45] ring-[100px] ring-inset ring-surface/40" />
      </main>

      {/* ════════ OVERLAY ════════ */}
      <Overlay
        overlay={g.overlay}
        player={g.player}
        enemy={g.enemy}
        onStartGame={actions.startGame}
        onApplyLevelUp={actions.applyLevelUpChoice}
        onApplyUpgrade={actions.applyUpgrade}
      />
    </>
  )
}
