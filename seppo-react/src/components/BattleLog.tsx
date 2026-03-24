import { useRef, useEffect, useState } from 'react'
import type { LogEntry } from '../types'

const logColors: Record<string, string> = {
  player: 'text-secondary', enemy: 'text-tertiary', system: 'text-primary',
  skill: 'text-secondary', item: 'text-primary-fixed-dim',
}

interface Props {
  entries: LogEntry[]
}

export default function BattleLog({ entries }: Props) {
  const [open, setOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [entries.length])

  return (
    <div className="fixed bottom-2 left-2 z-[60]">
      <button
        onClick={() => setOpen(v => !v)}
        className="bg-surface-container-highest pixel-border px-3 py-1.5 font-label text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-sm align-middle">receipt_long</span> FULL LOG
      </button>
      {open && (
        <div className="absolute bottom-10 left-0 w-96 h-64 bg-surface-container-lowest/95 backdrop-blur-md border border-amber-900/30 pixel-border overflow-hidden flex flex-col">
          <div className="px-3 py-1.5 border-b border-amber-900/20 font-label text-[10px] text-primary/60 uppercase tracking-widest">
            Battle Log
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 text-sm leading-relaxed font-body log-scrollbar">
            {entries.map(e => (
              <p key={e.id} className={`${logColors[e.cls] || 'text-on-surface-variant'} border-b border-white/5 py-0.5`}>
                {e.msg}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
