import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { usePresence } from '../../hooks/usePresence.js'
import SmartImage from './SmartImage.jsx'

export default function Toast({ toast, onDismiss, position = 'bottom' }) {
  const { mounted, visible } = usePresence(Boolean(toast), 300)
  const [shown, setShown] = useState(toast)

  useEffect(() => {
    if (toast) setShown(toast)
  }, [toast])

  if (!mounted || !shown) return null

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-[70] flex justify-center px-4 ${
        position === 'top'
          ? 'top-[calc(0.75rem+env(safe-area-inset-top))]'
          : 'bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-6'
      }`}
    >
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-black p-2.5 pr-3 text-white shadow-2xl shadow-black/20 transition-all duration-300 ease-ios ${
          visible ? 'translate-y-0 opacity-100' : position === 'top' ? '-translate-y-4 opacity-0' : 'translate-y-4 opacity-0'
        }`}
      >
        {shown.image ? (
          <SmartImage src={shown.image} alt="" sizes="48px" className="size-12 shrink-0 rounded-xl" />
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Check size={20} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold">
            <Check size={14} strokeWidth={2.5} aria-hidden="true" />
            {shown.title}
          </p>
          {shown.description && <p className="truncate text-xs text-white/60">{shown.description}</p>}
        </div>
        {shown.action && (
          <button
            type="button"
            onClick={() => {
              shown.action.onClick()
              onDismiss()
            }}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition active:scale-95"
          >
            {shown.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Uždaryti pranešimą"
          className="shrink-0 rounded-full p-1 text-white/50 transition hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
