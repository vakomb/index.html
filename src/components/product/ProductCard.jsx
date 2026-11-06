import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { formatEUR } from '../../lib/format.js'
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

// Minimalistinė kortelė: didelė nuotrauka, pavadinimas, kaina ir vienas veiksmas.
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
  const label = soldOut ? 'Išparduota' : product.badge === 'new' ? 'Naujiena' : product.badge === 'bestseller' ? 'Populiariausias' : null

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
        className="relative block overflow-hidden rounded-md bg-mist text-left outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        aria-label={`Atidaryti ${product.name}`}
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/5] w-full"
          imgClassName="transition-transform duration-[1200ms] ease-ios group-hover:scale-[1.03]"
        />
        {product.imageAlt && (
          <SmartImage
            src={product.imageAlt}
            alt=""
            className="absolute! inset-0 aspect-[4/5] w-full opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        {/* Minimalistiškai — tik viena žymė: išparduota, nuolaida arba naujiena / populiariausias */}
        {!soldOut && discount > 0 ? (
          <span className="absolute left-3 top-3 whitespace-nowrap rounded-sm bg-sale px-2.5 py-1 text-[12px] font-medium tabular-nums text-white">
            −{discount} %
          </span>
        ) : label ? (
          <span className="absolute left-3 top-3 whitespace-nowrap rounded-sm bg-white px-2.5 py-1 text-[12px] font-medium text-black">
            {label}
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col pt-4">
        <button
          type="button"
          onClick={() => onOpen(product.id)}
          className="text-left text-[16px] font-medium leading-snug text-black md:text-[17px]"
        >
          {product.name}
        </button>
        <p className="mt-1 text-[14px] text-gray-500">{product.audience}</p>

        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[16px] md:text-[17px]">
          <span className={`tabular-nums ${discount > 0 ? 'text-sale' : 'text-black'}`}>
            {multiple ? 'nuo ' : ''}
            {formatEUR(from.price)}
          </span>
          {from.compareAt > from.price && (
            <span className="text-[14px] tabular-nums text-gray-400 line-through">{formatEUR(from.compareAt)}</span>
          )}
        </p>
        {unitPrice && <p className="mt-0.5 text-[12px] tabular-nums text-gray-400">{unitPrice}</p>}
        {lowStock && <p className="mt-2 text-[13px] text-sale">Liko tik {product.stock} vnt.</p>}

        <div className="mt-auto pt-4">
          {picking ? (
            <div className="flex h-12 items-stretch gap-1 rounded-lg border border-black p-1" role="group" aria-label="Pasirinkite talpą">
              {getSizes(product).map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => pickSize(size.id)}
                  className="flex-1 rounded-md text-[13px] font-medium transition hover:bg-black hover:text-white"
                >
                  {size.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPicking(false)}
                aria-label="Atšaukti"
                className="flex w-9 shrink-0 items-center justify-center rounded-md text-gray-500 hover:text-black"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddClick}
              disabled={soldOut}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg border text-[15px] font-medium transition-all duration-300 active:scale-[0.98] ${
                soldOut
                  ? 'cursor-not-allowed border-gray-200 text-gray-400'
                  : added
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-black/15 text-black hover:border-black hover:bg-black hover:text-white'
              }`}
            >
              {soldOut ? (
                'Išparduota'
              ) : added ? (
                <>
                  <Check size={17} strokeWidth={2} aria-hidden="true" /> Pridėta
                </>
              ) : (
                'Į krepšelį'
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
