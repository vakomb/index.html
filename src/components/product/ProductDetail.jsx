import { useState } from 'react'
import { Check, Flame, Gift, RefreshCw, ShieldCheck, Truck, X, Zap } from 'lucide-react'
import { CATEGORY_BY_ID, FREE_SHIPPING_THRESHOLD } from '../../data/catalog.js'
import { countLabel, formatEUR, formatNumber } from '../../lib/format.js'
import {
  getCategoryMeta,
  getDefaultSize,
  getSize,
  getSizes,
  isLowStock,
  isSoldOut,
  unitPriceLabel,
} from '../../lib/pricing.js'
import { usePresence } from '../../hooks/usePresence.js'
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior.js'
import SmartImage from '../ui/SmartImage.jsx'
import Stars from '../ui/Stars.jsx'
import ProductBadges from '../ui/ProductBadges.jsx'
import QuantityStepper from '../ui/QuantityStepper.jsx'
import CountdownPill from '../ui/CountdownPill.jsx'
import AddToCartButton from './AddToCartButton.jsx'
import ScentPyramid from './ScentPyramid.jsx'
import CompositionBreakdown from './CompositionBreakdown.jsx'
import ReviewList from './ReviewList.jsx'

function PerformanceTile({ item }) {
  return (
    <div className="rounded-2xl bg-mist p-3.5">
      <p className="text-[11px] text-gray-500">{item.label}</p>
      <p className="mt-1 text-[15px] font-semibold">{item.value}</p>
      {item.level ? (
        <div className="mt-2 flex gap-1" aria-label={`${item.level} iš 5`}>
          {[1, 2, 3, 4, 5].map((step) => (
            <span
              key={step}
              className={`h-1 flex-1 rounded-full ${step <= item.level ? 'bg-black' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function ProductDetail({ product, onClose, onAdd, onBuyNow, inCartQty = 0 }) {
  const { mounted, visible } = usePresence(Boolean(product), 450)
  const [shown, setShown] = useState(product)
  const [sizeId, setSizeId] = useState(product ? getDefaultSize(product).id : null)
  const [qty, setQty] = useState(1)
  const [imageIndex, setImageIndex] = useState(0)

  useOverlayBehavior(Boolean(product), onClose)

  // Kai atidaroma kita prekė — atstatome talpą ir kiekį; kai keičiasi tos pačios
  // prekės duomenys (pvz., likutis) — tiesiog atnaujiname rodomą versiją.
  if (product && product !== shown) {
    if (!shown || shown.id !== product.id) {
      setSizeId(getDefaultSize(product).id)
      setQty(1)
      setImageIndex(0)
    }
    setShown(product)
  }

  if (!mounted || !shown) return null

  const sizes = getSizes(shown)
  const size = getSize(shown, sizeId)
  const meta = getCategoryMeta(shown.category)
  const category = CATEGORY_BY_ID[shown.category]
  const soldOut = isSoldOut(shown)
  const lowStock = isLowStock(shown)
  const available = Math.max(0, shown.stock - inCartQty)
  const maxQty = Math.max(1, available)
  const effectiveQty = Math.min(qty, maxQty)
  const lineTotal = size.price * effectiveQty
  const lineSavings = size.compareAt ? (size.compareAt - size.price) * effectiveQty : 0
  const canAdd = !soldOut && available > 0
  const images = [shown.image, shown.imageAlt].filter(Boolean)
  const isSet = shown.category === 'meginukai' || shown.category === 'rinkiniai'
  const unitPrice = unitPriceLabel(size)

  const add = () => onAdd(shown.id, size.id, effectiveQty)
  const buyNow = () => onBuyNow(shown.id, size.id, effectiveQty)

  const scrollToReviews = () => {
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={shown.name}>
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`absolute inset-x-0 bottom-0 top-3 flex flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl transition-all duration-500 ease-ios md:inset-6 md:rounded-[28px] lg:inset-x-[max(2rem,calc((100vw-74rem)/2))] lg:inset-y-8 ${
          visible ? 'translate-y-0 opacity-100 md:scale-100' : 'translate-y-full md:translate-y-8 md:scale-[0.98] md:opacity-0'
        }`}
      >
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 md:p-4">
          <span className="mx-auto h-1 w-10 rounded-full bg-white/80 shadow md:hidden" aria-hidden="true" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti"
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/85 text-black shadow-sm ring-1 ring-black/5 backdrop-blur-xl transition active:scale-90 md:right-4 md:top-4"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="md:grid md:grid-cols-2">
            <div className="relative md:sticky md:top-0 md:h-[calc(100dvh-3rem)] md:self-start lg:h-[calc(100dvh-4rem)]">
              <SmartImage
                src={images[imageIndex] ?? shown.image}
                alt={shown.name}
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-square w-full md:aspect-auto md:h-full"
              />
              <ProductBadges product={shown} className="absolute left-4 top-4 md:left-5 md:top-5" />
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setImageIndex(index)}
                      aria-label={`${index + 1} nuotrauka`}
                      aria-pressed={imageIndex === index}
                      className={`overflow-hidden rounded-lg ring-2 transition ${
                        imageIndex === index ? 'ring-white' : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SmartImage src={image} alt="" sizes="56px" className="size-14" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 pb-36 pt-6 md:px-10 md:pb-12 md:pt-12 lg:px-14">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
                {category?.label} · {shown.audience}
              </p>
              <h2 className="mt-2 text-[30px] font-medium leading-[1.1] tracking-[-0.02em] md:text-[44px]">
                {shown.name}
              </h2>
              <p className="mt-2 text-[13px] text-gray-500">
                {isSet ? 'Rinkinyje: ' : 'Įkvėptas: '}
                <span className="text-gray-800">{shown.inspiration}</span>
              </p>

              {shown.reviewsCount > 0 && (
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="mt-3 inline-flex items-center gap-2 text-[13px] text-gray-600 hover:text-black"
                >
                  <Stars rating={shown.rating} size={13} />
                  <span className="font-medium tabular-nums text-black">{formatNumber(shown.rating, 1)}</span>
                  <span className="underline decoration-gray-300 underline-offset-4">
                    {countLabel(shown.reviewsCount, ['atsiliepimas', 'atsiliepimai', 'atsiliepimų'])}
                  </span>
                </button>
              )}

              <p className="mt-5 text-[18px] leading-snug text-gray-600 md:text-[20px]">{shown.tagline}</p>

              <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-2">
                <span className="text-[34px] font-medium tabular-nums tracking-[-0.02em]">{formatEUR(size.price)}</span>
                {size.compareAt > size.price && (
                  <span className="pb-1 text-base tabular-nums text-gray-400 line-through">{formatEUR(size.compareAt)}</span>
                )}
                {size.compareAt > size.price && (
                  <span className="mb-1 rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white">
                    Sutaupote {formatEUR(size.compareAt - size.price)}
                  </span>
                )}
              </div>
              {unitPrice && <p className="mt-1 text-[13px] tabular-nums text-gray-500">{unitPrice}</p>}
              <p className="mt-1.5 text-xs text-gray-500">
                PVM įskaičiuotas · Nemokamas pristatymas užsakymams nuo {formatEUR(FREE_SHIPPING_THRESHOLD)}
              </p>

              <CountdownPill className="mt-4" prefix="Akcijos kaina galioja dar" />

              <fieldset className="mt-7">
                <legend className="text-[13px] font-medium text-gray-700">Talpa</legend>
                <div className={`mt-2.5 grid gap-2 ${sizes.length === 3 ? 'grid-cols-3' : sizes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {sizes.map((option) => {
                    const active = option.id === size.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSizeId(option.id)}
                        aria-pressed={active}
                        className={`rounded-2xl border px-3 py-3 text-left transition-all duration-300 ease-ios active:scale-[0.97] ${
                          active
                            ? 'border-black bg-black text-white shadow-lg shadow-black/10'
                            : 'border-gray-200 bg-white text-black hover:border-gray-400'
                        }`}
                      >
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className={`mt-0.5 block text-[13px] tabular-nums ${active ? 'text-white/80' : 'text-gray-600'}`}>
                          {formatEUR(option.price)}
                        </span>
                        <span className={`mt-1 block truncate text-[10px] ${active ? 'text-white/60' : 'text-gray-400'}`}>
                          {option.hint}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="mt-6">
                {soldOut ? (
                  <p className="rounded-2xl bg-smoke px-4 py-3 text-[13px] text-gray-600">
                    Šis kvapas laikinai išparduotas. Naujos partijos laukiame per 7–10 dienų.
                  </p>
                ) : lowStock ? (
                  <div className="rounded-2xl bg-red-50 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-red-700">
                      <Flame size={15} aria-hidden="true" />
                      Liko tik {shown.stock} vnt. — paskutinė šios partijos atsarga
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-red-100">
                      <div
                        className="h-full rounded-full bg-red-600"
                        style={{ width: `${Math.max(8, (shown.stock / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-[13px] text-gray-600">
                    <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    Yra sandėlyje ({shown.stock} vnt.) · išsiunčiame per 24 val.
                  </p>
                )}
                {inCartQty > 0 && !soldOut && (
                  <p className="mt-2 text-xs text-gray-500">
                    Jūsų krepšelyje jau yra {inCartQty} vnt. šio kvapo.
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <QuantityStepper value={effectiveQty} onChange={setQty} max={maxQty} />
                <div className="hidden flex-1 gap-3 md:flex">
                  <AddToCartButton
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    soldOut={!canAdd}
                    onAdd={add}
                  />
                  <button
                    type="button"
                    onClick={buyNow}
                    disabled={!canAdd}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 text-[15px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.97] disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    <Zap size={16} aria-hidden="true" />
                    Pirkti dabar
                  </button>
                </div>
                <p className="text-[13px] text-gray-500 md:hidden">
                  Iš viso <span className="font-semibold tabular-nums text-black">{formatEUR(lineTotal)}</span>
                </p>
              </div>
              {lineSavings > 0 && canAdd && (
                <p className="mt-3 text-xs text-gray-500">
                  Iš viso {formatEUR(lineTotal)} · su savaitgalio kaina sutaupote {formatEUR(lineSavings)}
                </p>
              )}

              <ul className="mt-7 grid gap-2.5 border-y border-gray-100 py-5 text-[13px] text-gray-700">
                <li className="flex items-center gap-3">
                  <Truck size={17} strokeWidth={1.5} aria-hidden="true" />
                  Greitas pristatymas iš ES per 1–3 darbo dienas
                </li>
                <li className="flex items-center gap-3">
                  <RefreshCw size={17} strokeWidth={1.5} aria-hidden="true" />
                  Nemokamas kvapo keitimas per 14 dienų
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck size={17} strokeWidth={1.5} aria-hidden="true" />
                  100 % kokybės garantija arba pinigų grąžinimas
                </li>
                <li className="flex items-center gap-3">
                  <Gift size={17} strokeWidth={1.5} aria-hidden="true" />
                  Nemokamas mėginukas ir dovanų pakuotė
                </li>
              </ul>

              {shown.includes?.length > 0 && (
                <section className="mt-7 rounded-xl bg-mist p-4" aria-labelledby="includes-title">
                  <h3 id="includes-title" className="text-[14px] font-bold">
                    Rinkinyje
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-[14px] text-gray-700">
                    {shown.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-600" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="mt-7" aria-labelledby="about-scent">
                <h3 id="about-scent" className="text-[15px] font-semibold">
                  Apie kvapą
                </h3>
                <p className="mt-3 text-[17px] leading-relaxed text-gray-700">{shown.description}</p>
                {shown.season && (
                  <p className="mt-3 text-[13px] text-gray-500">
                    Geriausiai tinka: <span className="text-gray-800">{shown.season}</span>
                  </p>
                )}
              </section>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {meta.performance.map((item) => (
                  <PerformanceTile key={item.label} item={item} />
                ))}
              </div>

              <div className="mt-9">
                <ScentPyramid notes={shown.notes} />
              </div>

              <div className="mt-9">
                <CompositionBreakdown composition={meta.composition} inci={meta.inci} />
              </div>

              <div className="mt-9">
                <ReviewList product={shown} />
              </div>

              <p className="mt-8 text-[11px] leading-relaxed text-gray-400">
                {isSet ? 'Minimi kvapų pavadinimai' : shown.inspiration} yra jų savininkų prekių ženklai. Vaidore nėra susijusi su šiais prekių ženklais;
                pavadinimas naudojamas tik kvapo profiliui apibūdinti.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-black/5 bg-white/90 px-4 pt-3 backdrop-blur-xl pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="min-w-[72px]">
              <p className="text-[11px] text-gray-500">
                {effectiveQty} × {size.label}
              </p>
              <p className="text-[15px] font-semibold tabular-nums">{formatEUR(lineTotal)}</p>
            </div>
            <AddToCartButton
              size="lg"
              variant="outline"
              className="flex-1 px-3"
              soldOut={!canAdd}
              onAdd={add}
            />
            <button
              type="button"
              onClick={buyNow}
              disabled={!canAdd}
              className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-black px-3 text-[14px] font-semibold text-white transition active:scale-[0.97] disabled:bg-gray-200 disabled:text-gray-400"
            >
              <Zap size={15} aria-hidden="true" />
              Pirkti dabar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
