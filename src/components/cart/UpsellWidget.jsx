import { useMemo } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { formatEUR, formatEURWhole } from '../../lib/format.js'
import { getDefaultSize, isSoldOut } from '../../lib/pricing.js'
import SmartImage from '../ui/SmartImage.jsx'

// Išmanusis papildomo pardavimo blokas: pirmiausia siūlo aliejinį koncentratą,
// sukurtą poroje su krepšelyje esančiais kvepalais, kitu atveju — populiariausią.
export function pickUpsell(products, lines) {
  if (lines.length === 0) return null
  const inCart = new Set(lines.map((line) => line.product.id))
  const candidates = products
    .filter((product) => product.category === 'aliejai' && !isSoldOut(product) && !inCart.has(product.id))
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
  return candidates.find((product) => product.pairsWith && inCart.has(product.pairsWith)) ?? candidates[0] ?? null
}

export default function UpsellWidget({ products, lines, onAdd }) {
  const pick = useMemo(() => pickUpsell(products, lines), [products, lines])
  if (!pick) return null

  const size = getDefaultSize(pick)
  const paired = pick.pairsWith && lines.some((line) => line.product.id === pick.pairsWith)

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
        <Sparkles size={12} aria-hidden="true" />
        {paired ? 'Sukurta poroje su jūsų kvepalais' : 'Užbaikite ritualą'}
      </p>
      <div className="mt-2.5 flex items-center gap-3">
        <SmartImage src={pick.image} alt={pick.name} sizes="64px" className="size-16 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{pick.name}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
            Sluoksniuokite su kvepalais — kvapas išsilaiko dar 4 val. ilgiau.
          </p>
          <p className="mt-1 text-xs">
            <span className="font-semibold tabular-nums">{formatEUR(size.price)}</span>
            {size.compareAt > size.price && (
              <span className="ml-1.5 tabular-nums text-gray-400 line-through">{formatEUR(size.compareAt)}</span>
            )}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAdd(pick.id, size.id, 1)}
        className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-black text-[13px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
      >
        <Plus size={15} strokeWidth={2} aria-hidden="true" />
        Pridėti aliejinį koncentratą (+{formatEURWhole(size.price)})
      </button>
    </div>
  )
}
