import { useEffect, useRef, useState } from 'react'
import { TriangleAlert, Search, Trash2 } from 'lucide-react'
import { CATEGORY_BY_ID } from '../../data/catalog.js'
import { countLabel, formatEUR } from '../../lib/format.js'
import { getDefaultSize, isLowStock, isSoldOut } from '../../lib/pricing.js'
import SmartImage from '../ui/SmartImage.jsx'

const BADGE_LABEL = { bestseller: 'Populiariausias', new: 'Naujiena' }

export default function InventoryTable({ products, onDelete, onOpen }) {
  const [pendingId, setPendingId] = useState(null)
  const [query, setQuery] = useState('')
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const requestDelete = (id) => {
    setPendingId(id)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPendingId(null), 4000)
  }

  const confirmDelete = (id) => {
    window.clearTimeout(timer.current)
    setPendingId(null)
    onDelete(id)
  }

  const needle = query.trim().toLocaleLowerCase('lt')
  const rows = needle
    ? products.filter((product) =>
        `${product.name} ${product.inspiration}`.toLocaleLowerCase('lt').includes(needle),
      )
    : products
  const lowStockCount = products.filter((product) => isLowStock(product) || isSoldOut(product)).length

  return (
    <section className="rounded-[24px] border border-gray-100 bg-white" aria-labelledby="inventory-title">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <h2 id="inventory-title" className="text-[15px] font-semibold">
            Atsargų registras
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-gray-500">
            {countLabel(products.length, ['prekė', 'prekės', 'prekių'])} kataloge
            {lowStockCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <TriangleAlert size={12} aria-hidden="true" />
                {countLabel(lowStockCount, ['prekei', 'prekėms', 'prekių'])} baigiasi atsargos
              </span>
            )}
          </p>
        </div>
        <label className="relative md:w-64">
          <span className="sr-only">Ieškoti prekės</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ieškoti kataloge…"
            className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-base outline-none focus:border-black md:text-[13px]"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-wider text-gray-400">
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Prekė</th>
              <th className="px-3 py-3 font-medium">Kategorija</th>
              <th className="px-3 py-3 text-right font-medium">Kaina</th>
              <th className="px-3 py-3 text-right font-medium">Likutis</th>
              <th className="px-3 py-3 font-medium">Žymė</th>
              <th className="px-5 py-3 text-right font-medium">Veiksmai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((product) => {
              const size = getDefaultSize(product)
              const pending = pendingId === product.id
              const soldOut = isSoldOut(product)
              const low = isLowStock(product)
              return (
                <tr key={product.id} className={`transition-colors ${pending ? 'bg-red-50/60' : 'hover:bg-mist'}`}>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => onOpen(product.id)} className="flex items-center gap-3 text-left">
                      <SmartImage src={product.image} alt="" sizes="48px" className="h-12 w-10 shrink-0 rounded-lg" />
                      <span className="min-w-0">
                        <span className="block max-w-[240px] truncate font-medium text-black">{product.name}</span>
                        <span className="block max-w-[240px] truncate text-[12px] text-gray-500">{product.inspiration}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{CATEGORY_BY_ID[product.category]?.label ?? '—'}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <span className="font-medium">{formatEUR(size.price)}</span>
                    {size.compareAt > size.price && (
                      <span className="block text-[11px] text-gray-400 line-through">{formatEUR(size.compareAt)}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums ${
                        soldOut
                          ? 'bg-gray-100 text-gray-500'
                          : low
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {soldOut ? 'Išparduota' : `${product.stock} vnt.`}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {product.badge ? (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          product.badge === 'bestseller' ? 'bg-black text-white' : 'bg-smoke text-black'
                        }`}
                      >
                        {BADGE_LABEL[product.badge]}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {pending ? (
                      <span className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPendingId(null)}
                          className="h-8 rounded-full px-3 text-[12px] font-medium text-gray-600 hover:text-black"
                        >
                          Atšaukti
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(product.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-full bg-red-600 px-3 text-[12px] font-semibold text-white transition active:scale-95"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          Patvirtinti
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => requestDelete(product.id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 px-3 text-[12px] font-medium text-gray-700 transition hover:border-red-300 hover:text-red-700"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        Ištrinti
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                  {products.length === 0
                    ? 'Katalogas tuščias. Pridėkite pirmąją prekę.'
                    : 'Pagal paiešką prekių nerasta.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
