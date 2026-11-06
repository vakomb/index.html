import { useMemo, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { AUDIENCES, CATEGORIES, CATEGORY_BY_ID, matchesAudience } from '../data/catalog.js'
import { EMPTY_FILTER } from '../data/navigation.js'
import { countLabel } from '../lib/format.js'
import { getFromSize } from '../lib/pricing.js'
import { matchProducts } from '../components/layout/SearchOverlay.jsx'
import ProductCard from '../components/product/ProductCard.jsx'

const SORTS = [
  { id: 'popular', label: 'Populiariausi' },
  { id: 'new', label: 'Naujausi' },
  { id: 'price-asc', label: 'Kaina: nuo mažiausios' },
  { id: 'price-desc', label: 'Kaina: nuo didžiausios' },
  { id: 'rating', label: 'Geriausiai įvertinti' },
]

const PRICE_RANGES = [
  { id: 'visi', label: 'Visos kainos', test: () => true },
  { id: 'to20', label: 'Iki 20 €', test: (price) => price <= 20 },
  { id: '20to50', label: '20–50 €', test: (price) => price > 20 && price <= 50 },
  { id: 'over50', label: 'Virš 50 €', test: (price) => price > 50 },
]

function sortProducts(list, sortId) {
  const sorted = [...list]
  const price = (product) => getFromSize(product).price
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
          (b.stock > 0) - (a.stock > 0) ||
          (b.badge === 'bestseller') - (a.badge === 'bestseller') ||
          (b.popularity ?? 0) - (a.popularity ?? 0),
      )
  }
}

function titleFor(filter) {
  if (filter.clearance) return 'Išpardavimas'
  const category = CATEGORY_BY_ID[filter.category]
  if (category && filter.audience !== 'visi') return `${category.label} ${filter.audience.toLowerCase()}`
  if (category) return category.label
  if (filter.audience !== 'visi') return `Kvapai ${filter.audience.toLowerCase()}`
  return 'Visos prekės'
}

function FilterGroup({ title, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400">{title}</legend>
      <ul className="mt-3 space-y-1">
        {options.map((option) => {
          const active = option.id === value
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onChange(option.id)}
                aria-pressed={active}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-[14px] transition ${
                  active ? 'bg-black font-bold text-white' : 'text-gray-700 hover:bg-mist'
                }`}
              >
                {option.label}
                {option.count !== undefined && (
                  <span className={`text-[12px] tabular-nums ${active ? 'text-white/60' : 'text-gray-400'}`}>{option.count}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}

function Chip({ active, onClick, children, accent = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-bold transition active:scale-95 ${
        active ? (accent ? 'bg-sale text-white' : 'bg-black text-white') : accent ? 'bg-red-50 text-sale' : 'bg-mist text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

export default function ShopView({ products, filter, onFilterChange, onOpenProduct, onAdd }) {
  const [trackedFilter, setTrackedFilter] = useState(filter)
  const [query, setQuery] = useState(filter.query ?? '')
  const [sortId, setSortId] = useState(filter.sort ?? 'popular')
  const [priceRange, setPriceRange] = useState('visi')

  // Nauja navigacija iš meniu ar paieškos — atnaujiname paiešką ir rikiavimą
  if (filter !== trackedFilter) {
    setTrackedFilter(filter)
    setQuery(filter.query ?? '')
    setSortId(filter.sort ?? 'popular')
  }

  const update = (patch) => onFilterChange({ ...filter, ...patch, query, sort: sortId })

  const visible = useMemo(() => {
    const base = query.trim() ? matchProducts(products, query) : products
    const range = PRICE_RANGES.find((item) => item.id === priceRange) ?? PRICE_RANGES[0]
    const filtered = base.filter((product) => {
      if (filter.category !== 'visi' && product.category !== filter.category) return false
      if (!matchesAudience(product, filter.audience)) return false
      if (filter.clearance && !product.clearance) return false
      return range.test(getFromSize(product).price)
    })
    return sortProducts(filtered, sortId)
  }, [products, filter, query, sortId, priceRange])

  const categoryOptions = [
    { id: 'visi', label: 'Visos kategorijos', count: products.length },
    ...CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      count: products.filter((product) => product.category === category.id).length,
    })),
  ]
  const audienceOptions = [
    { id: 'visi', label: 'Visi' },
    ...AUDIENCES.map((audience) => ({
      id: audience,
      label: audience,
      count: products.filter((product) => matchesAudience(product, audience)).length,
    })),
  ]
  const hasFilters =
    filter.category !== 'visi' || filter.audience !== 'visi' || filter.clearance || priceRange !== 'visi' || query

  const reset = () => {
    setQuery('')
    setPriceRange('visi')
    onFilterChange({ ...EMPTY_FILTER })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 md:px-8 md:pt-8">
      <nav className="text-[12px] text-gray-500" aria-label="Kelias">
        Pradžia <span className="mx-1 text-gray-300">/</span> Parduotuvė
        {filter.clearance || filter.category !== 'visi' || filter.audience !== 'visi' ? (
          <>
            <span className="mx-1 text-gray-300">/</span>
            <span className="text-gray-800">{titleFor(filter)}</span>
          </>
        ) : null}
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className={`text-[28px] font-extrabold tracking-tight md:text-[36px] ${filter.clearance ? 'text-sale' : ''}`}>
          {titleFor(filter)}
        </h1>
        <p className="pb-1 text-[13px] text-gray-500" aria-live="polite">
          {countLabel(visible.length, ['prekė', 'prekės', 'prekių'])}
        </p>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Filtrai">
          <div className="sticky top-[132px] space-y-7">
            <FilterGroup
              title="Kategorija"
              options={categoryOptions}
              value={filter.category}
              onChange={(id) => update({ category: id, clearance: false })}
            />
            <FilterGroup
              title="Kam skirta"
              options={audienceOptions}
              value={filter.audience}
              onChange={(id) => update({ audience: id })}
            />
            <FilterGroup title="Kaina" options={PRICE_RANGES} value={priceRange} onChange={setPriceRange} />
            <label className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-bold text-sale">
              <input
                type="checkbox"
                checked={filter.clearance}
                onChange={(event) => update({ clearance: event.target.checked })}
                className="size-4 accent-[#b3261e]"
              />
              Tik išpardavimas
            </label>
            {hasFilters && (
              <button type="button" onClick={reset} className="text-[13px] font-bold underline underline-offset-4">
                Išvalyti filtrus
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="sticky top-14 z-30 -mx-4 border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur-xl md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pt-0 md:backdrop-blur-none">
            <div className="flex gap-2">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Ieškoti</span>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ieškoti tarp prekių…"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-9 text-base outline-none transition focus:border-black md:text-[14px]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Išvalyti paiešką"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-black"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              <label className="relative shrink-0">
                <span className="sr-only">Rikiuoti</span>
                <select
                  value={sortId}
                  onChange={(event) => setSortId(event.target.value)}
                  className="h-10 max-w-[150px] appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-base font-semibold outline-none focus:border-black md:max-w-none md:text-[13px]"
                >
                  {SORTS.map((sort) => (
                    <option key={sort.id} value={sort.id}>
                      {sort.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
              </label>
            </div>

            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 lg:hidden">
              {audienceOptions.map((option) => (
                <Chip key={option.id} active={filter.audience === option.id} onClick={() => update({ audience: option.id })}>
                  {option.label}
                </Chip>
              ))}
              <Chip accent active={filter.clearance} onClick={() => update({ clearance: !filter.clearance })}>
                Išpardavimas
              </Chip>
            </div>
            <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 lg:hidden">
              {categoryOptions.map((option) => (
                <Chip
                  key={option.id}
                  active={filter.category === option.id}
                  onClick={() => update({ category: option.id, clearance: false })}
                >
                  {option.id === 'visi' ? 'Visos' : option.label}
                  <span className="font-semibold opacity-50">{option.count}</span>
                </Chip>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mt-8 rounded-xl bg-mist px-6 py-14 text-center">
              <p className="text-xl font-extrabold">Nieko neradome</p>
              <p className="mt-2 text-sm text-gray-500">Pabandykite kitą natą, kategoriją ar kainų intervalą.</p>
              <button type="button" onClick={reset} className="mt-6 h-11 rounded-lg bg-black px-6 text-sm font-bold text-white">
                Rodyti visas prekes
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
              {visible.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} onOpen={onOpenProduct} onAdd={onAdd} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
