import type { Relic } from '../types'

const RARITY_COLOR: Record<string, string> = {
  common: 'on-surface-variant',
  uncommon: 'tertiary',
  rare: 'primary',
}

interface Props {
  relics: Relic[]
  onClose: () => void
}

export default function RelicViewer({ relics, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-surface-container pixel-border border border-primary/30 p-5 sm:p-8 max-w-lg w-[96%] sm:w-[92%] shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 flex items-center justify-center text-on-surface-variant/60 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
            <h2 className="font-headline text-xl sm:text-2xl text-primary uppercase tracking-wide">Relics</h2>
          </div>
          <div className="w-32 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {relics.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant/60 text-center italic py-6">No relics collected yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {relics.map(r => {
              const color = RARITY_COLOR[r.rarity] || 'on-surface-variant'
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 bg-surface-container-highest/60 pixel-border p-3 border border-${color}/20`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl sm:text-3xl text-${color} shrink-0`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {r.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-headline text-sm sm:text-base text-${color} uppercase tracking-wide`}>{r.name}</span>
                      <span className={`font-label text-[9px] uppercase tracking-widest text-${color}/50`}>{r.rarity}</span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant/80 italic leading-snug mt-0.5">{r.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
