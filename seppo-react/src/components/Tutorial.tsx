import { useEffect, useRef } from 'react'
import { PLAYER_ACTIONS } from '../gameData'

export function TutorialContent() {
  const tips = [
    {
      icon: 'swords',
      title: 'Take your turn',
      text: `You normally get ${PLAYER_ACTIONS} actions per turn. In combat, Attack, Block, Drink and Eat each cost 1 action. When your actions run out, the enemies take their turn automatically.`,
    },
    {
      icon: 'shield',
      title: 'Watch and defend',
      text: 'Enemy intent icons preview their next moves. Tap an enemy to target it. ATK boosts damage; DEF reduces incoming damage. Block absorbs hits, but unused block clears at your next turn.',
    },
    {
      icon: 'restaurant',
      title: 'Use your supplies',
      text: 'Drinks give buffs or special effects; food restores HP. Each use consumes an item. Try boosting ATK before attacking, and heal before HP reaches 0 or your run ends.',
    },
    {
      icon: 'map',
      title: 'Choose your path',
      text: 'Pick a starting relic, then follow the map to each boss. Fights earn XP and coins; rest stops heal, shops sell supplies, and treasure offers relics. Weapons boost ATK; relics give passive bonuses for the run.',
    },
  ]

  return (
    <ol className="space-y-3 text-left">
      {tips.map((tip, index) => (
        <li key={tip.title} className="flex items-start gap-3">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl mt-0.5">{tip.icon}</span>
          <div>
            <h3 className="font-label text-sm font-bold text-primary">{index + 1}. {tip.title}</h3>
            <p className="font-body text-sm sm:text-base text-on-surface-variant leading-snug">{tip.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function Tutorial({ onContinue }: { onContinue: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="tutorial-title"
      onCancel={event => { event.preventDefault(); onContinue() }}
      className="m-auto w-[calc(100%-1rem)] max-w-xl max-h-[calc(100dvh-1rem)] p-0 bg-surface-container text-on-surface pixel-border backdrop:bg-black/80"
    >
      <div className="flex flex-col max-h-[calc(100dvh-1rem)]">
        <div className="shrink-0 flex items-center justify-between gap-3 p-3 sm:p-5 border-b border-primary/20">
          <h2 id="tutorial-title" className="font-headline text-lg sm:text-xl text-primary uppercase tracking-wide">How to Play</h2>
          <button autoFocus onClick={onContinue} className="font-label text-xs text-on-surface-variant hover:text-primary px-2 py-2">
            Skip tutorial
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5">
          <TutorialContent />
        </div>
        <div className="shrink-0 p-3 sm:p-5 border-t border-primary/20 flex flex-wrap items-center justify-between gap-2">
          <p className="font-label text-xs text-on-surface-variant">Read again in Menu / Guide / Basics.</p>
          <button onClick={onContinue} className="px-4 py-2 bg-primary text-on-primary pixel-border font-headline text-sm uppercase active:translate-y-0.5">
            Let's go!
          </button>
        </div>
      </div>
    </dialog>
  )
}
