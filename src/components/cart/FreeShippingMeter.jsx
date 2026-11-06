import { PartyPopper, Truck } from 'lucide-react'
import { formatEUR } from '../../lib/format.js'

export default function FreeShippingMeter({ totals, className = '' }) {
  const percent = Math.round(totals.freeShippingProgress * 100)

  return (
    <div className={`rounded-2xl bg-mist p-3.5 ${className}`}>
      <p className="flex items-center gap-2 text-[13px] text-gray-700">
        {totals.qualifiesForFreeShipping ? (
          <>
            <PartyPopper size={16} strokeWidth={1.75} className="text-black" aria-hidden="true" />
            <span>
              Puiku! Jūsų užsakymui <span className="font-semibold text-black">pristatymas nemokamas</span>.
            </span>
          </>
        ) : (
          <>
            <Truck size={16} strokeWidth={1.75} className="text-black" aria-hidden="true" />
            <span>
              Iki nemokamo pristatymo trūksta{' '}
              <span className="font-semibold tabular-nums text-black">{formatEUR(totals.remainingForFreeShipping)}</span>
            </span>
          </>
        )}
      </p>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Pažanga iki nemokamo pristatymo"
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-ios ${
            totals.qualifiesForFreeShipping ? 'bg-emerald-600' : 'bg-black'
          }`}
          style={{ width: `${Math.max(4, percent)}%` }}
        />
      </div>
    </div>
  )
}
