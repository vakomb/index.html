import { useEffect, useState } from 'react'
import { TICKER_MESSAGES } from '../../data/catalog.js'

// Minimalistinė juosta: viena žinutė vienu metu, švelniai keičiasi kas 4 s.
export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % TICKER_MESSAGES.length), 4200)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="relative flex h-10 items-center justify-center overflow-hidden bg-black px-4 text-white" role="region" aria-label="Akcijos">
      {TICKER_MESSAGES.map((message, messageIndex) => (
        <p
          key={message}
          aria-hidden={messageIndex !== index}
          className={`absolute inset-x-4 truncate text-center text-[12px] font-medium tracking-[0.04em] transition-all duration-700 ease-ios md:text-[13px] ${
            messageIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          {message}
        </p>
      ))}
    </div>
  )
}
