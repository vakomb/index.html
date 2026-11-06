import { useMemo, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { CATEGORIES } from '../data/catalog.js'
import { countLabel } from '../lib/format.js'
import { getDefaultSize } from '../lib/pricing.js'
import ProductCard from '../components/product/ProductCard.jsx'
import CountdownPill from '../components/ui/CountdownPill.jsx'

const SORTS = [
  { id: 'popular', label: 'Populiariausi' },
  { id: 'new', label: 'Naujausi' },
  { id: 'price-asc', label: 'Kaina: nuo mažiausios' },
  { id: 'price-desc', label: 'Kaina: nuo didžiausios' },
  { id: 'rating', label: 'Geriausiai įvertinti' },
]

function sortProducts(list, sortId) {
  const sorted = [...list]
  const price = (product) => getDefaultSize(product).price
  switch (sortId) {
    case 'new':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'price-asc':
      return sorted.sort((a, b) => price(a) - price(b))
    case 'price-desc':
      return sorted.sort((a, b) => price(b) - price(a))
    case 'rating':
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0))
    default:
      return sorted.sort(
        (a, b) =>
          (b.badge === 'bestseller') - (a.badge === 'bestseller') || (b.popularity ?? 0) - (a.popularity ?? 0),
      )
  }
}

export default function ShopView({ products, category, onCategoryChange, onOpenProduct, onAdd }) {
  const [query, setQuery] = useState('')
  const [sortId, setSortId] = useState('popular')

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('lt')
    const filtered = products.filter((product) => {
      if (category !== 'visi' && product.category !== category) return false
      if (!needle) return true
      const haystack = [
        product.name,
        product.inspiration,
        ...product.notes.top,
        ...product.notes.heart,
        ...product.notes.base,
      ]
        .join(' ')
        .toLocaleLowerCase('lt')
      return haystack.includes(needle)
    })
    return sortProducts(filtered, sortId)
  }, [products, category, query, sortId])

  const chips = [{ id: 'visi', label: 'Visi' }, ...CATEGORIES.map(({ id, label }) => ({ id, label }))]
  const activeCategory = CATEGORIES.find((item) => item.id === category)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8 md:pt-14">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500">Parduotuvė</p>
          <h1 className="mt-2 font-serif text-5xl font-medium leading-none tracking-tight md:text-6xl">
            {activeCategory ? activeCategory.label : 'Visa kolekcija'}
          </h1>
          <p className="mt-3 text-[14px] text-gray-500">
            {activeCategory ? activeCategory.subtitle : 'Kvepalai, namų kvapai, žvakės ir aliejiniai koncentratai'}
          </p>
        </div>
        <CountdownPill />
      </div>

      <div className="sticky top-14 z-30 -mx-4 mt-7 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur-xl md:top-16 md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {chips.map((chip) => {
              const active = chip.id === category
              const count =
                chip.id === 'visi' ? products.length : products.filter((product) => product.category === chip.id).length
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onCategoryChange(chip.id)}
                  aria-pressed={active}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition active:scale-95 ${
                    active ? 'bg-black text-white' : 'bg-smoke text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {chip.label}
                  <span className={`tabular-nums ${active ? 'text-white/60' : 'text-gray-400'}`}>{count}</span>
                </button>
              )
            })}
          </div>

          <div className="flex gap-2">
            <label className="relative flex-1 md:w-64 md:flex-none">
              <span className="sr-only">Ieškoti kvapo</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Vanilė, oud, Libre…"
                className="h-10 w-full rounded-full border border-gray-200 bg-white pl-10 pr-9 text-base outline-none transition focus:border-black focus:ring-4 focus:ring-black/5 md:text-[13px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Išvalyti paiešką"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <label className="relative">
              <span className="sr-only">Rikiuoti</span>
              <select
                value={sortId}
                onChange={(event) => setSortId(event.target.value)}
                className="h-10 appearance-none rounded-full border border-gray-200 bg-white pl-4 pr-9 text-base outline-none transition focus:border-black md:text-[13px]"
              >
                {SORTS.map((sort) => (
                  <option key={sort.id} value={sort.id}>
                    {sort.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
            </label>
          </div>
        </div>
      </div>

      <p className="mt-6 text-[13px] text-gray-500" aria-live="polite">
        Rodoma: {countLabel(visible.length, ['prekė', 'prekės', 'prekių'])}
      </p>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-[28px] bg-mist px-6 py-16 text-center">
          <p className="font-serif text-3xl">Nieko neradome</p>
          <p className="mt-2 text-sm text-gray-500">Pabandykite kitą natą ar įkvėpimo šaltinį.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              onCategoryChange('visi')
            }}
            className="mt-6 h-11 rounded-full bg-black px-6 text-sm font-medium text-white"
          >
            Rodyti visą kolekciją
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {visible.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onOpen={onOpenProduct} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  )
}
