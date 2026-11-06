import { ArrowRight, Lock, RefreshCw, ShoppingBag, Trash2, User, X } from 'lucide-react'
import { countLabel, formatEUR } from '../../lib/format.js'
import { quantityInCart } from '../../lib/pricing.js'
import { usePresence } from '../../hooks/usePresence.js'
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior.js'
import SmartImage from '../ui/SmartImage.jsx'
import QuantityStepper from '../ui/QuantityStepper.jsx'
import FreeShippingMeter from './FreeShippingMeter.jsx'
import UpsellWidget from './UpsellWidget.jsx'

function TotalsRow({ label, value, strong = false, muted = false }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? 'text-base font-semibold' : 'text-[13px]'}`}>
      <span className={muted ? 'text-gray-500' : 'text-gray-700'}>{label}</span>
      <span className={`tabular-nums ${muted ? 'text-gray-500' : strong ? 'text-black' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}

export default function CartDrawer({
  open,
  onClose,
  cart,
  lines,
  totals,
  products,
  onUpdateQty,
  onRemove,
  onAdd,
  onCheckout,
  onBrowse,
  onOpenProduct,
  account,
  onOpenAccount,
}) {
  const { mounted, visible } = usePresence(open, 450)
  useOverlayBehavior(open, onClose)

  if (!mounted) return null

  const empty = lines.length === 0

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Pirkinių krepšelis">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-500 ease-ios sm:inset-y-2 sm:right-2 sm:rounded-[28px] ${
          visible ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Krepšelis</h2>
            <p className="text-xs text-gray-500">
              {empty ? 'Kol kas tuščias' : countLabel(totals.itemsCount, ['prekė', 'prekės', 'prekių'])}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti krepšelį"
            className="flex size-10 items-center justify-center rounded-full bg-smoke transition hover:bg-gray-200 active:scale-90"
          >
            <X size={18} />
          </button>
        </header>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-mist">
              <ShoppingBag size={30} strokeWidth={1.25} aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">Jūsų krepšelis tuščias</h3>
            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Atraskite kvapą, kuris taps jūsų parašu. Savaitgalio kainos — iki −30 %.
            </p>
            <button
              type="button"
              onClick={onBrowse}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-black px-7 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.97]"
            >
              Atrasti kolekciją
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <FreeShippingMeter totals={totals} />
              {!account && (
                <button
                  type="button"
                  onClick={onOpenAccount}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3.5 py-3 text-left text-[13px] transition hover:border-black"
                >
                  <User size={17} strokeWidth={1.75} aria-hidden="true" />
                  <span className="flex-1">
                    <span className="font-bold">Prisijunkite</span> ir atsiskaitykite greičiau
                  </span>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              )}

              <ul className="mt-4 divide-y divide-gray-100">
                {lines.map((line) => {
                  const otherQty = quantityInCart(cart, line.product.id) - line.qty
                  const maxQty = Math.max(1, line.product.stock - otherQty)
                  return (
                    <li key={line.key} className="flex gap-3.5 py-4">
                      <button
                        type="button"
                        onClick={() => onOpenProduct(line.product.id)}
                        className="shrink-0"
                        aria-label={`Atidaryti ${line.product.name}`}
                      >
                        <SmartImage
                          src={line.product.image}
                          alt={line.product.name}
                          sizes="88px"
                          className="h-[104px] w-[84px] rounded-2xl"
                        />
                      </button>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium leading-snug">{line.product.name}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{line.size.label}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(line.key)}
                            aria-label={`Pašalinti ${line.product.name}`}
                            className="-mr-1.5 -mt-1 rounded-full p-1.5 text-gray-400 transition hover:bg-smoke hover:text-black"
                          >
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                          <QuantityStepper
                            size="sm"
                            value={line.qty}
                            max={maxQty}
                            onChange={(next) => onUpdateQty(line.key, next)}
                          />
                          <div className="text-right">
                            <p className="text-[14px] font-semibold tabular-nums">{formatEUR(line.lineTotal)}</p>
                            {line.compareAt > line.unitPrice && (
                              <p className="text-[11px] tabular-nums text-gray-400 line-through">
                                {formatEUR(line.compareAt * line.qty)}
                              </p>
                            )}
                          </div>
                        </div>
                        {line.qty >= line.product.stock - otherQty && (
                          <p className="mt-1.5 text-[11px] text-red-700">Paėmėte paskutinius sandėlio vienetus</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-2">
                <UpsellWidget products={products} lines={lines} onAdd={onAdd} />
              </div>
            </div>

            <footer className="border-t border-gray-100 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5">
              <div className="space-y-1.5">
                <TotalsRow label="Tarpinė suma" value={formatEUR(totals.subtotal)} />
                <TotalsRow
                  label="Pristatymas"
                  value={totals.qualifiesForFreeShipping ? 'Nemokamas siuntimas' : `nuo ${formatEUR(totals.cheapestShipping)}`}
                />
                {totals.savings > 0 && (
                  <TotalsRow label="Jūs sutaupote" value={`−${formatEUR(totals.savings)}`} muted />
                )}
                <div className="pt-2">
                  <TotalsRow label="Iš viso" value={formatEUR(totals.total)} strong />
                </div>
                <p className="text-[11px] text-gray-500">
                  PVM įskaičiuotas ({formatEUR(totals.vat)})
                  {' · nuolaidos kodai ir pristatymas apskaičiuojami atsiskaitant'}
                </p>
              </div>

              <button
                type="button"
                onClick={onCheckout}
                className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-black text-[15px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
              >
                <Lock size={15} aria-hidden="true" />
                Tęsti atsiskaitymą
              </button>
              <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Lock size={11} aria-hidden="true" /> Saugus Stripe atsiskaitymas
                </span>
                <span className="inline-flex items-center gap-1">
                  <RefreshCw size={11} aria-hidden="true" /> 14 d. keitimas
                </span>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
