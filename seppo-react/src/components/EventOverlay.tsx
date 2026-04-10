import type { ActiveEvent } from '../types'

interface Props {
  activeEvent: ActiveEvent
  onChoose: (idx: number) => void
}

export default function EventOverlay({ activeEvent, onChoose }: Props) {
  const { event } = activeEvent

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col">
      <img src={event.bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-transparent to-surface/60 z-[2]" />

      {/* Top: title, description, badge */}
      <div className="relative z-[3] pt-4 px-4 sm:pt-8 sm:px-8 text-center">
        {/* Event icon */}
        <div className="mx-auto mb-1 sm:mb-3 h-10 w-10 sm:h-20 sm:w-20 bg-surface-container-highest pixel-border flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl sm:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>{event.icon}</span>
        </div>

        {/* Title */}
        <h1 className="font-headline text-base sm:text-3xl text-primary tracking-tight uppercase mb-0.5 sm:mb-1">{event.name}</h1>
        <div className="w-24 sm:w-48 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-1.5 sm:mb-3" />

        {/* Description */}
        <p className="font-body text-xs sm:text-base text-on-surface mb-2 sm:mb-4 leading-relaxed px-2 max-w-xl mx-auto">{event.desc}</p>

        {/* Category badge */}
        {event.category !== 'optional' && (
        <div className="flex justify-center">
          <span className={`px-2 py-0.5 text-[10px] sm:text-sm font-label uppercase tracking-wider pixel-border ${
            event.category === 'tradeoff' ? 'bg-error/20 text-error' :
            'bg-primary/20 text-primary'
          }`}>
            {event.category === 'tradeoff' ? 'Choose One' : 'Free Upgrade'}
          </span>
        </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: choices in a row */}
      <div className="relative z-[3] px-3 pb-4 sm:px-8 sm:pb-8">
        <div className="flex gap-2 sm:gap-4 justify-center">
          {event.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => onChoose(idx)}
              className="group relative flex-1 max-w-[220px] bg-surface-container-highest pixel-border border border-on-surface-variant/20 hover:border-primary active:translate-y-0.5 transition-all overflow-hidden text-center"
            >
              <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4">
                <div className="shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-surface-container pixel-border flex items-center justify-center">
                  <span className={`material-symbols-outlined text-${choice.color} text-lg sm:text-3xl`} style={{ fontVariationSettings: "'FILL' 1" }}>{choice.icon}</span>
                </div>
                <div className={`font-headline text-xs sm:text-lg text-${choice.color} uppercase tracking-wide leading-tight`}>{choice.label}</div>
                <div className="font-label text-[10px] sm:text-sm text-on-surface-variant leading-tight">{choice.desc}</div>
              </div>
              <div className={`absolute inset-0 z-0 bg-gradient-to-t from-${choice.color}/10 to-transparent pointer-events-none`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
