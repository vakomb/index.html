import { useEffect, useRef, useState } from 'react'
import { Check, Flame, ShoppingBag, X } from 'lucide-react'
import { CATEGORY_BY_ID } from '../../data/catalog.js'
import { formatEUR, formatNumber } from '../../lib/format.js'
import {
  discountPercent,
  getFromSize,
  getSizes,
  hasMultipleSizes,
  isLowStock,
  isSoldOut,
  unitPriceLabel,
} from '../../lib/pricing.js'
import SmartImage from '../ui/SmartImage.jsx'
import Stars from '../ui/Stars.jsx'

function CardBadges({ product, discount }) {
  const soldOut = isSoldOut(product)
  return (
    <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
      {soldOut && (
        <span className="rounded-md bg-gray-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Išparduota
        </span>
      )}
      {!soldOut && discount > 0 && (
        <span className="rounded-md bg-sale px-2 py-1 text-[11px] font-bold tabular-nums text-white">−{discount} %</span>
      )}
      {!soldOut && product.badge === 'bestseller' && (
        <span className="rounded-md bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Populiariausias
        </span>
      )}
      {!soldOut && product.badge === 'new' && (
        <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black shadow-sm">
          Naujiena
        </span>
      )}
    </div>
  )
}

const shortNotes = (notes) =>
  [notes.top[0], notes.heart[0], notes.base[0]].filter(Boolean).join(' · ')

// Parduotuvės kortelė: „nuo“ kaina, kaina už 100 ml, antra nuotrauka užvedus pelę
// ir greitas dydžio pasirinkimas tiesiai kortelėje.
export default function ProductCard({ product, onOpen, onAdd, index = 0, className = '' }) {
  const [picking, setPicking] = useState(false)
  const [added, setAdded] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const from = getFromSize(product)
  const multiple = hasMultipleSizes(product)
  const discount = discountPercent(from.price, from.compareAt)
  const soldOut = isSoldOut(product)
  const lowStock = isLowStock(product)
  const unitPrice = unitPriceLabel(from)

  const confirmAdded = () => {
    setAdded(true)
    setPicking(false)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1500)
  }

  const handleAddClick = (event) => {
    event.stopPropagation()
    if (soldOut) return
    if (multiple) {
      setPicking(true)
      return
    }
    if (onAdd(product.id, from.id, 1) !== false) confirmAdded()
  }

  const pickSize = (sizeId) => {
    if (onAdd(product.id, sizeId, 1) !== false) confirmAdded()
  }

  return (
    <article
      className={`group flex animate-fade-up flex-col ${className}`}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <button
        type="button"
        onClick={() => onOpen(product.id)}
        className="relative block overflow-hidden rounded-xl bg-mist text-left outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        aria-label={`Atidaryti ${product.name}`}
      >
        <SmartImage src={product.image} alt={product.name} className="aspect-square w-full" />
        {product.imageAlt && (
          <SmartImage
            src={product.imageAlt}
            alt=""
            className="absolute! inset-0 aspect-square w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <CardBadges product={product} discount={discount} />
      </button>

      <div className="flex flex-1 flex-col pt-3">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
          {product.audience} · {CATEGORY_BY_ID[product.category]?.label ?? 'Kolekcija'}
        </p>
        <button
          type="button"
          onClick={() => onOpen(product.id)}
          className="mt-1 line-clamp-2 text-left text-[14px] font-bold leading-snug text-black hover:underline hover:underline-offset-2"
        >
          {product.name}
        </button>
        <p className="mt-1 truncate text-[12px] text-gray-500">{shortNotes(product.notes)}</p>

        {product.reviewsCount > 0 && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-500">
            <Stars rating={product.rating} size={11} />
            <span className="tabular-nums">
              {formatNumber(product.rating, 1)} ({formatNumber(product.reviewsCount)})
            </span>
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
          {multiple && <span className="text-[12px] text-gray-500">nuo</span>}
          <span className={`text-[16px] font-extrabold tabular-nums ${discount > 0 ? 'text-sale' : 'text-black'}`}>
            {formatEUR(from.price)}
          </span>
          {from.compareAt > from.price && (
            <span className="text-[12px] tabular-nums text-gray-400 line-through">{formatEUR(from.compareAt)}</span>
          )}
        </div>
        {unitPrice && <p className="text-[11px] tabular-nums text-gray-400">({unitPrice})</p>}

        {lowStock && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-sale">
            <Flame size={12} aria-hidden="true" /> Liko tik {product.stock} vnt.
          </p>
        )}

        <div className="mt-auto pt-3">
          {picking ? (
            <div className="flex items-center gap-1 rounded-lg border border-black p-1" role="group" aria-label="Pasirinkite talpą">
              {getSizes(product).map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => pickSize(size.id)}
                  className="h-8 flex-1 rounded-md bg-mist text-[11px] font-bold transition hover:bg-black hover:text-white"
                >
                  {size.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPicking(false)}
                aria-label="Atšaukti"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:text-black"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddClick}
              disabled={soldOut}
              className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-bold transition-all duration-300 active:scale-[0.97] ${
                soldOut
                  ? 'cursor-not-allowed bg-smoke text-gray-400'
                  : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {soldOut ? (
                'Išparduota'
              ) : added ? (
                <>
                  <Check size={15} strokeWidth={2.5} aria-hidden="true" /> Pridėta
                </>
              ) : (
                <>
                  <ShoppingBag size={15} strokeWidth={2} aria-hidden="true" /> Į krepšelį
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
