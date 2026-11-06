import { BadgeCheck, MessageSquareHeart } from 'lucide-react'
import { RATING_DISTRIBUTION, getReviewsForProduct } from '../../data/reviews.js'
import { countLabel, formatDateLong, formatNumber } from '../../lib/format.js'
import Stars from '../ui/Stars.jsx'

export default function ReviewList({ product }) {
  const reviews = getReviewsForProduct(product)

  if (!product.reviewsCount || reviews.length === 0) {
    return (
      <section id="reviews" aria-labelledby="reviews-title" className="rounded-3xl bg-mist p-6 text-center">
        <MessageSquareHeart size={28} strokeWidth={1.5} className="mx-auto text-gray-400" aria-hidden="true" />
        <h3 id="reviews-title" className="mt-3 text-[15px] font-semibold">
          Būkite pirmieji įvertinę
        </h3>
        <p className="mx-auto mt-1 max-w-xs text-[13px] text-gray-500">
          Šis kvapas ką tik pasirodė kolekcijoje. Pirmieji pirkėjai gauna −10 % kitam užsakymui už atsiliepimą.
        </p>
      </section>
    )
  }

  return (
    <section id="reviews" aria-labelledby="reviews-title">
      <h3 id="reviews-title" className="text-[15px] font-semibold">
        Pirkėjų atsiliepimai
      </h3>

      <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-5 rounded-3xl bg-mist p-5">
        <div className="text-center">
          <p className="font-serif text-5xl leading-none tabular-nums">{formatNumber(product.rating, 1)}</p>
          <Stars rating={product.rating} size={13} className="mt-2" />
          <p className="mt-1.5 text-[11px] text-gray-500">
            {countLabel(product.reviewsCount, ['atsiliepimas', 'atsiliepimai', 'atsiliepimų'])}
          </p>
        </div>
        <ul className="space-y-1.5" aria-label="Įvertinimų pasiskirstymas">
          {RATING_DISTRIBUTION.map((row) => (
            <li key={row.stars} className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="w-3 tabular-nums">{row.stars}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-black" style={{ width: `${row.share}%` }} />
              </div>
              <span className="w-8 text-right tabular-nums">{row.share} %</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-4 space-y-3">
        {reviews.map((review) => (
          <li key={`${review.author}-${review.date}`} className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <Stars rating={review.rating} size={12} />
              <time dateTime={review.date} className="text-[11px] text-gray-400">
                {formatDateLong(review.date)}
              </time>
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed text-gray-800">„{review.text}“</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
              <span className="font-medium text-gray-800">{review.author}</span>
              <span>· {review.city}</span>
              {review.size && <span>· {review.size}</span>}
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <BadgeCheck size={12} aria-hidden="true" />
                Patvirtintas pirkimas
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
