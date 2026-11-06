import { Flame, Star, Truck } from 'lucide-react'
import { CATEGORY_BY_ID, PYRAMID_TIERS } from '../../data/catalog.js'
import { formatEUR, formatNumber } from '../../lib/format.js'
import { discountPercent, getDefaultSize, isLowStock, isSoldOut } from '../../lib/pricing.js'
import SmartImage from '../ui/SmartImage.jsx'
import ProductBadges from '../ui/ProductBadges.jsx'
import AddToCartButton from './AddToCartButton.jsx'

const SHORT_TIER = { top: 'Viršutinės', heart: 'Širdies', base: 'Bazinės' }

export default function ProductCard({ product, onOpen, onAdd, index = 0 }) {
  const size = getDefaultSize(product)
  const discount = discountPercent(size.price, size.compareAt)
  const lowStock = isLowStock(product)
  const soldOut = isSoldOut(product)
  const category = CATEGORY_BY_ID[product.category]

  return (
    <article
      className="group flex animate-fade-up flex-col"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <button
        type="button"
        onClick={() => onOpen(product.id)}
        className="relative block overflow-hidden rounded-[22px] text-left outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        aria-label={`Atidaryti ${product.name}`}
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/5] w-full"
          imgClassName="transition-transform duration-[1200ms] ease-ios group-hover:scale-[1.04]"
        />
        <ProductBadges product={product} className="absolute left-3 top-3" />
        {discount > 0 && !soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold tabular-nums text-black backdrop-blur">
            −{discount} %
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-full bg-white/90 py-2 text-center text-xs font-medium text-black opacity-0 backdrop-blur transition-all duration-500 ease-ios group-hover:translate-y-0 group-hover:opacity-100 md:block">
          Peržiūrėti kvapo profilį
        </span>
      </button>

      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-gray-500">
            {category?.label ?? 'Kolekcija'} · {product.audience}
          </p>
          {product.reviewsCount > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-gray-600">
              <Star size={11} className="fill-black text-black" aria-hidden="true" />
              <span className="font-medium tabular-nums">{formatNumber(product.rating, 1)}</span>
              <span className="hidden text-gray-400 sm:inline">({formatNumber(product.reviewsCount)})</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpen(product.id)}
          className="mt-1.5 text-left text-[14px] font-medium leading-snug text-black hover:underline hover:underline-offset-4 md:text-[15px]"
        >
          {product.name}
        </button>

        <dl className="mt-2.5 space-y-1 text-[11px] leading-snug">
          {PYRAMID_TIERS.map((tier) => (
            <div key={tier.key} className="flex gap-2" title={`${tier.label}: ${product.notes[tier.key].join(', ')}`}>
              <dt className="w-[58px] shrink-0 text-gray-400">{SHORT_TIER[tier.key]}</dt>
              <dd className="truncate text-gray-700">{product.notes[tier.key].join(', ')}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tabular-nums text-black md:text-base">{formatEUR(size.price)}</span>
          {size.compareAt > size.price && (
            <span className="text-xs tabular-nums text-gray-400 line-through">{formatEUR(size.compareAt)}</span>
          )}
          <span className="ml-auto text-[11px] text-gray-400">{size.label}</span>
        </div>

        <div className="mt-2 min-h-[30px]">
          {soldOut ? (
            <p className="text-[11px] font-medium text-gray-500">Laikinai išparduota — netrukus vėl prekyboje</p>
          ) : lowStock ? (
            <div>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-red-700">
                <Flame size={12} aria-hidden="true" />
                Liko tik {product.stock} vnt.
              </p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-red-100">
                <div
                  className="h-full rounded-full bg-red-600 transition-all duration-700"
                  style={{ width: `${Math.max(8, (product.stock / 10) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Truck size={12} aria-hidden="true" />
              Išsiunčiame per 24 val.
            </p>
          )}
        </div>

        <AddToCartButton
          className="mt-3 w-full"
          size="sm"
          soldOut={soldOut}
          onAdd={() => onAdd(product.id, size.id, 1)}
        />
      </div>
    </article>
  )
}
