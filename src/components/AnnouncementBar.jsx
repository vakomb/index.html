import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MESSAGES = [
  '🚚 Nemokamas pristatymas užsakymams nuo 40€',
  '✨ 1 000 000+ pagamintų buteliukų',
  '⭐ 4,9 žvaigždučių reitingas iš 20000+ įvertinimų',
];

const INTERVAL_MS = 4000;

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % MESSAGES.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + MESSAGES.length) % MESSAGES.length), []);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(next, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="relative z-40 bg-brand-green text-white"
      role="region"
      aria-roledescription="carousel"
      aria-label="Pranešimai"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container-page flex h-9 items-center gap-2 sm:h-10">
        <button
          type="button"
          onClick={prev}
          className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          aria-label="Ankstesnis pranešimas"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="relative flex-1 overflow-hidden" aria-live="polite">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {MESSAGES.map((msg, i) => (
              <p
                key={msg}
                className="w-full shrink-0 truncate px-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs"
                aria-hidden={i !== index}
              >
                {msg}
              </p>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          aria-label="Kitas pranešimas"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1 sm:hidden" aria-hidden="true">
        {MESSAGES.map((msg, i) => (
          <span
            key={msg}
            className={`h-[3px] rounded-full bg-white transition-all ${i === index ? 'w-3 opacity-100' : 'w-1 opacity-40'}`}
          />
        ))}
      </div>
    </div>
  );
}
