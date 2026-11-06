import { useMemo, useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { GENERIC_REVIEWS, RATING_DISTRIBUTION, REVIEWS } from '../data/reviews.js'
import { countLabel, formatDateLong } from '../lib/format.js'
import Stars from '../components/ui/Stars.jsx'

export default function ReviewsView({ products, onOpenProduct }) {
  const [stars, setStars] = useState(0)

  const all = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]))
    const specific = Object.entries(REVIEWS).flatMap(([productId, list]) =>
      list.map((review) => ({ ...review, productId, productName: byId.get(productId)?.name })),
    )
    const generic = GENERIC_REVIEWS.map((review) => ({ ...review, productId: null, productName: null }))
    return [...specific, ...generic].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [products])

  const shown = stars ? all.filter((review) => review.rating === stars) : all
  const total = products.reduce((sum, product) => sum + (product.reviewsCount ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Atsiliepimai</p>
      <h1 className="mt-2 text-[40px] font-medium leading-none tracking-[-0.02em] md:text-[60px]">Ką sako mūsų pirkėjai</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
        <aside>
          <div className="rounded-xl bg-mist p-6 md:sticky md:top-28">
            <p className="text-[56px] font-extrabold leading-none tracking-tight">4,9</p>
            <Stars rating={5} size={16} className="mt-2" />
            <p className="mt-2 text-[13px] text-gray-600">
              {countLabel(total, ['patvirtintas atsiliepimas', 'patvirtinti atsiliepimai', 'patvirtintų atsiliepimų'])}
            </p>
            <ul className="mt-5 space-y-1.5">
              {RATING_DISTRIBUTION.map((row) => (
                <li key={row.stars}>
                  <button
                    type="button"
                    onClick={() => setStars(stars === row.stars ? 0 : row.stars)}
                    aria-pressed={stars === row.stars}
                    className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-[12px] transition ${
                      stars === row.stars ? 'bg-white font-bold' : 'text-gray-600 hover:bg-white/60'
                    }`}
                  >
                    <span className="w-8 text-left tabular-nums">{row.stars} ★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <span className="block h-full rounded-full bg-black" style={{ width: `${row.share}%` }} />
                    </span>
                    <span className="w-9 text-right tabular-nums">{row.share} %</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          <p className="text-[13px] text-gray-500">
            {stars ? `Rodomi ${stars} ★ atsiliepimai` : 'Naujausi atsiliepimai'} · {shown.length}
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {shown.map((review) => (
              <li key={`${review.author}-${review.date}-${review.productId}`} className="rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Stars rating={review.rating} size={13} />
                  <time dateTime={review.date} className="text-[11px] text-gray-400">
                    {formatDateLong(review.date)}
                  </time>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-800">„{review.text}“</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-gray-500">
                  <span className="font-bold text-black">{review.author}</span>
                  <span>· {review.city}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <BadgeCheck size={12} aria-hidden="true" /> Patvirtintas pirkimas
                  </span>
                </div>
                {review.productName && (
                  <button
                    type="button"
                    onClick={() => onOpenProduct(review.productId)}
                    className="mt-3 text-[12px] font-bold underline underline-offset-4"
                  >
                    {review.productName}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
