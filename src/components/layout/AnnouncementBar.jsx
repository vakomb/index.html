import { Sparkle } from 'lucide-react'
import { TICKER_MESSAGES } from '../../data/catalog.js'

export default function AnnouncementBar() {
  const items = [...TICKER_MESSAGES, ...TICKER_MESSAGES]

  return (
    <div className="relative h-9 overflow-hidden bg-black text-white" role="region" aria-label="Akcijos ir naujienos">
      <p className="sr-only">{TICKER_MESSAGES.join('. ')}</p>
      <div
        className="flex h-full w-max animate-marquee items-center hover:[animation-play-state:paused]"
        aria-hidden="true"
      >
        {items.map((message, index) => (
          <span
            key={`${message}-${index}`}
            className="flex items-center gap-6 whitespace-nowrap px-6 text-[10px] font-medium uppercase tracking-[0.2em] md:text-[11px]"
          >
            {message}
            <Sparkle size={10} className="fill-white/70 text-white/70" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black to-transparent" />
    </div>
  )
}
