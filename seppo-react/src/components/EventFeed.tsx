import type { FeedEntry } from '../types'
import { LEVEL_NAMES, ROUNDS_PER_LEVEL } from '../gameData'

const logColors: Record<string, string> = {
  player: 'text-secondary', enemy: 'text-tertiary', system: 'text-primary',
  skill: 'text-secondary', item: 'text-primary-fixed-dim',
}
const feedBgs: Record<string, string> = {
  player: 'bg-secondary/15 border-secondary/30',
  enemy: 'bg-tertiary/15 border-tertiary/30',
  system: 'bg-primary/10 border-primary/20',
  skill: 'bg-secondary/15 border-secondary/30',
  item: 'bg-amber-900/20 border-amber-700/30',
}

interface Props {
  entries: FeedEntry[]
  currentLevel: number
  currentRound: number
}

export default function EventFeed({ entries, currentLevel, currentRound }: Props) {
  const isBossRound = currentLevel === 2 && currentRound === ROUNDS_PER_LEVEL - 1
  return (
    <div className="fixed top-12 sm:top-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1rem)] sm:w-[32rem] pointer-events-none">
      <div className="flex flex-col gap-1 items-center">
        {entries.map(e => (
          <div
            key={e.id}
            className={`${logColors[e.cls] || 'text-on-surface-variant'} ${feedBgs[e.cls] || 'bg-surface-container-lowest/80 border-white/10'} border px-2 sm:px-4 py-1 font-label text-xs sm:text-sm tracking-wide backdrop-blur-sm whitespace-nowrap animate-feed-in`}
          >
            {e.msg}
          </div>
        ))}
      </div>
      <div className="text-center mt-1">
        <div className="font-label text-[11px] text-primary/60">
          {LEVEL_NAMES[currentLevel]} — {isBossRound ? 'BOSS' : `Round ${currentRound + 1}/${ROUNDS_PER_LEVEL}`}
        </div>
      </div>
    </div>
  )
}
