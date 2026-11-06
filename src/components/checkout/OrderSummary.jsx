import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { formatEUR } from '../../lib/format.js'
import SmartImage from '../ui/SmartImage.jsx'

function Row({ label, value, tone = 'default' }) {
  const color = tone === 'muted' ? 'text-gray-500' : tone === 'positive' ? 'text-emerald-700' : 'text-gray-900'
  return (
    <div className="flex items-baseline justify-between gap-4 text-[13px]">
      <span className="text-gray-600">{label}</span>
      <span className={`tabular-nums ${color}`}>{value}</span>
    </div>
  )
}

export default function OrderSummary({ lines, totals, shippingSelected, promoCode, onApplyPromo, onRemovePromo }) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState(null)

  const apply = (event) => {
    event.preventDefault()
    const result = onApplyPromo(code)
    setMessage(result)
    if (result.ok) setCode('')
  }

  const shippingValue = shippingSelected
    ? totals.shipping === 0
      ? 'Nemokamas'
      : formatEUR(totals.shipping)
    : totals.qualifiesForFreeShipping
      ? 'Nemokamas'
      : 'Pasirinkite būdą'

  return (
    <div className="rounded-[24px] bg-mist p-5 md:p-6">
      <ul className="space-y-4">
        {lines.map((line) => (
          <li key={line.key} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <SmartImage src={line.product.image} alt="" sizes="56px" className="h-[68px] w-14 rounded-xl" />
              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-gray-700 text-[10px] font-semibold text-white ring-2 ring-mist">
                {line.qty}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{line.product.name}</p>
              <p className="text-xs text-gray-500">{line.size.label}</p>
            </div>
            <p className="text-[13px] font-medium tabular-nums">{formatEUR(line.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-gray-200 pt-5">
        {promoCode ? (
          <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-[13px]">
            <span className="inline-flex items-center gap-2 font-medium">
              <Tag size={14} aria-hidden="true" />
              {promoCode}
            </span>
            <button
              type="button"
              onClick={() => {
                onRemovePromo()
                setMessage(null)
              }}
              aria-label="Pašalinti nuolaidos kodą"
              className="rounded-full p-1 text-gray-400 hover:text-black"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={apply} className="flex gap-2">
            <label className="sr-only" htmlFor="promo-code">
              Nuolaidos kodas
            </label>
            <input
              id="promo-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Nuolaidos kodas (pvz., VAIDORE10)"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 text-base uppercase outline-none transition placeholder:normal-case placeholder:text-gray-400 focus:border-black md:text-[13px]"
            />
            <button
              type="submit"
              disabled={!code.trim()}
              className="h-11 shrink-0 rounded-xl bg-black px-4 text-[13px] font-medium text-white transition disabled:bg-gray-200 disabled:text-gray-400"
            >
              Taikyti
            </button>
          </form>
        )}
        {message && (
          <p className={`mt-2 text-xs ${message.ok ? 'text-emerald-700' : 'text-red-600'}`} role="status">
            {message.text}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-2 border-t border-gray-200 pt-5">
        <Row label="Tarpinė suma" value={formatEUR(totals.subtotal)} />
        {totals.discount > 0 && <Row label={totals.promo.label} value={`−${formatEUR(totals.discount)}`} tone="positive" />}
        <Row label="Pristatymas" value={shippingValue} tone={totals.shipping === 0 && shippingSelected ? 'positive' : 'default'} />
        {totals.savings > 0 && (
          <Row label="Sutaupote su savaitgalio kainomis" value={formatEUR(totals.savings)} tone="positive" />
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-gray-200 pt-4">
        <span className="text-[15px] font-semibold">Iš viso</span>
        <span className="text-2xl font-semibold tabular-nums tracking-tight">{formatEUR(totals.total)}</span>
      </div>
      <p className="mt-1 text-right text-[11px] text-gray-500">PVM (21 %) įskaičiuotas: {formatEUR(totals.vat)}</p>
    </div>
  )
}
