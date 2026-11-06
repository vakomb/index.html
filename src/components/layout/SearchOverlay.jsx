import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'
import { CATEGORY_BY_ID } from '../../data/catalog.js'
import { formatEUR } from '../../lib/format.js'
import { getFromSize, hasMultipleSizes } from '../../lib/pricing.js'
import { usePresence } from '../../hooks/usePresence.js'
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior.js'
import SmartImage from '../ui/SmartImage.jsx'

const POPULAR = ['Vanilė', 'Oud', 'Libre', 'Baccarat', 'Mėginukai', 'Difuzorius', 'Rožė']

export function matchProducts(products, rawQuery) {
  const needle = rawQuery.trim().toLocaleLowerCase('lt')
  if (!needle) return []
  return products.filter((product) => {
    const haystack = [
      product.name,
      product.inspiration,
      product.audience,
      CATEGORY_BY_ID[product.category]?.label ?? '',
      ...product.notes.top,
      ...product.notes.heart,
      ...product.notes.base,
    ]
      .join(' ')
      .toLocaleLowerCase('lt')
    return haystack.includes(needle) || (needle.startsWith('difuz') && product.category === 'namu-kvapai')
  })
}

export default function SearchOverlay({ open, onClose, products, onOpenProduct, onSearchAll }) {
  const { mounted, visible } = usePresence(open, 300)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  useOverlayBehavior(open, onClose)

  useEffect(() => {
    if (!open) return undefined
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [open])

  const results = useMemo(() => matchProducts(products, query).slice(0, 8), [products, query])

  if (!mounted) return null

  const submit = (event) => {
    event.preventDefault()
    if (!query.trim()) return
    onSearchAll(query.trim())
    setQuery('')
  }

  return (
    <div className="fixed inset-0 z-[65]" role="dialog" aria-modal="true" aria-label="Paieška">
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-x-0 top-0 flex max-h-full flex-col bg-white shadow-2xl transition-all duration-300 ease-ios max-md:bottom-0 md:max-h-[80vh] md:rounded-b-2xl ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}
      >
        <form onSubmit={submit} className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:px-6 md:pt-5">
          <label className="relative flex-1">
            <span className="sr-only">Paieška</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kvapas, nata arba įkvėpimas…"
              className="h-12 w-full rounded-lg border border-gray-200 bg-mist pl-11 pr-4 text-base outline-none transition focus:border-black focus:bg-white"
            />
          </label>
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti paiešką"
            className="flex size-12 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-mist"
          >
            <X size={20} />
          </button>
        </form>

        <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-3 pb-6 md:px-6">
          {!query.trim() ? (
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">Populiariausios paieškos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-md bg-mist px-3.5 py-2 text-[13px] font-semibold text-gray-800 transition hover:bg-smoke"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">Pagal „{query}“ nieko neradome. Pabandykite kitą natą.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {results.map((product) => {
                  const size = getFromSize(product)
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenProduct(product.id)
                          setQuery('')
                        }}
                        className="flex w-full items-center gap-3 py-3 text-left"
                      >
                        <SmartImage src={product.image} alt="" sizes="56px" className="size-14 shrink-0 rounded-lg" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold">{product.name}</span>
                          <span className="block truncate text-[12px] text-gray-500">
                            {product.audience} · {CATEGORY_BY_ID[product.category]?.label}
                          </span>
                        </span>
                        <span className="shrink-0 text-[13px] font-bold tabular-nums">
                          {hasMultipleSizes(product) ? 'nuo ' : ''}
                          {formatEUR(size.price)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <button
                type="button"
                onClick={submit}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-black text-[13px] font-semibold text-white"
              >
                Visi rezultatai <ArrowRight size={15} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
