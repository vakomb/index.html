import { Timer } from 'lucide-react'
import { useCountdown } from '../../hooks/useCountdown.js'

export default function CountdownPill({ tone = 'light', prefix = 'Savaitgalio akcija baigiasi po', className = '' }) {
  const { label } = useCountdown()
  const styles =
    tone === 'dark'
      ? 'bg-black text-white'
      : tone === 'glass'
        ? 'bg-white/80 text-black ring-1 ring-black/5 backdrop-blur-xl'
        : 'bg-smoke text-black'

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium ${styles} ${className}`}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-red-500" />
      </span>
      <Timer size={14} strokeWidth={1.75} aria-hidden="true" />
      <span>
        {prefix} <span className="font-semibold tabular-nums">{label}</span>
      </span>
    </div>
  )
}
