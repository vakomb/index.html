import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Minus, Plus, ChevronDown, Star, Truck, RotateCcw, ShieldCheck, Users, Sparkles, FlaskConical } from 'lucide-react';
import {
  GENDERS,
  categoryLabel,
  defaultSizeId,
  discountPercent,
  formatPrice,
  getInci,
  getPricing,
  getSizes,
  noteEmoji,
} from '../data/catalog';
import ProductImage from './ProductImage';

const GENDER_ICON = { Moterims: '👩', Vyrams: '👨', Unisex: '🫧' };

const GENDER_COPY = {
  Moterims: 'Sukurta moteriškam charakteriui – švelnus, bet įsimintinas pėdsakas nuo ryto iki vakaro.',
  Vyrams: 'Sukurta vyriškam charakteriui – tvirtas, pasitikintis ir ilgai išliekantis kvapas.',
  Unisex: 'Universalus kvapas be taisyklių – vienodai gražiai skamba ant bet kurios odos.',
};

const TIERS = [
  { key: 'top', label: 'Viršutinės natos', hint: 'Pirmosios 15 min.', icon: '🍋' },
  { key: 'heart', label: 'Vidurinės natos', hint: '2–4 valandos', icon: '🌸' },
  { key: 'base', label: 'Bazinės natos', hint: '6+ valandos', icon: '🪵' },
];

/** Stabilus pseudo-įvertinimų skaičius pagal produkto ID. */
const reviewCount = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return 180 + (h % 1400);
};

function Accordion({ id, title, icon: Icon, open, onToggle, children }) {
  return (
    <div className="border-b border-brand-line">
      <h3>
        <button
          type="button"
          id={`acc-btn-${id}`}
          aria-controls={`acc-panel-${id}`}
          aria-expanded={open}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 py-4 text-left"
        >
          <span className="flex items-center gap-2.5 font-display text-sm font-extrabold uppercase tracking-[0.12em]">
            <Icon className="h-4 w-4 text-brand-green" strokeWidth={2.4} />
            {title}
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div
        id={`acc-panel-${id}`}
        role="region"
        aria-labelledby={`acc-btn-${id}`}
        className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [sizeId, setSizeId] = useState(() => defaultSizeId(product));
  const [qty, setQty] = useState(1);
  const [openPanels, setOpenPanels] = useState({ kam: false, natos: true, inci: false });
  const closeRef = useRef(null);

  const sizes = getSizes(product);
  const { size, price, salePrice } = useMemo(() => getPricing(product, sizeId), [product, sizeId]);
  const onSale = salePrice < price;
  const discount = discountPercent({ price, salePrice });
  const maxQty = Math.max(1, Math.min(product.stock || 1, 10));
  const reviews = reviewCount(product.id);

  useEffect(() => {
    if (closeRef.current) closeRef.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (key) => setOpenPanels((s) => ({ ...s, [key]: !s[key] }));

  const add = () => onAddToCart(product, size.id, qty);

  const soldOut = (product.stock ?? 0) <= 0;
  const scarcity = soldOut
    ? 'Šiuo metu išparduota – netrukus papildysime'
    : product.stock <= 5
      ? `🔥 Didelė paklausa – liko tik ${Math.max(product.stock, 1)} vnt.`
      : '🔥 Didelė paklausa – greitai išperkama';

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="pdm-title">
      <button
        type="button"
        className="absolute inset-0 h-full w-full animate-fade-in cursor-default bg-black/55"
        onClick={onClose}
        aria-label="Uždaryti prekės langą"
        tabIndex={-1}
      />

      <div className="absolute inset-x-0 bottom-0 top-6 flex animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white sm:top-10 md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-full md:max-w-xl md:animate-slide-in-right md:rounded-none md:shadow-drawer lg:max-w-5xl">
        {/* Viršutinė juosta */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-brand-line px-4 sm:px-6">
          <span className="mx-auto h-1 w-10 rounded-full bg-neutral-300 md:hidden" aria-hidden="true" />
          <span className="hidden text-2xs font-bold uppercase tracking-[0.2em] text-neutral-500 md:block">
            {categoryLabel(product.category)} · {product.gender}
          </span>
          <button ref={closeRef} type="button" onClick={onClose} className="icon-btn absolute right-2 top-2 md:static" aria-label="Uždaryti">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="lg:grid lg:grid-cols-2">
            {/* Nuotrauka */}
            <div className="lg:sticky lg:top-0 lg:h-[calc(100vh-3.5rem)] lg:border-r lg:border-brand-line">
              <div className="relative">
                <ProductImage
                  src={product.image}
                  alt={product.title}
                  loading="eager"
                  className="aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-auto lg:h-[calc(100vh-3.5rem)]"
                />
                <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
                  {discount > 0 && (
                    <span className="rounded-full bg-brand-sale px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-white">
                      -{discount}%
                    </span>
                  )}
                  {product.isNew && (
                    <span className="rounded-full bg-brand-green px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-white">
                      Naujiena
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Informacija */}
            <div className="px-5 pb-6 pt-6 sm:px-8">
              <p className="text-2xs font-bold uppercase tracking-[0.2em] text-brand-green md:hidden">
                {categoryLabel(product.category)} · {product.gender}
              </p>
              <h2 id="pdm-title" className="mt-2 font-display text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-5xl md:mt-0">
                {product.title}
              </h2>

              {product.inspiration && (
                <p className="mt-3 text-sm text-neutral-600">
                  <span className="font-semibold text-black">Įkvėpimas:</span> {product.inspiration}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="flex text-black" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
                <span className="font-semibold">4,9</span>
                <span className="text-neutral-500">· Įvertinimų: {reviews}</span>
              </div>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular">
                {onSale && <s className="text-base font-medium text-neutral-400">{formatPrice(price)}</s>}
                <span className={`text-2xl font-extrabold ${onSale ? 'text-brand-sale' : 'text-black'}`}>{formatPrice(salePrice)}</span>
                {onSale && (
                  <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-brand-sale">
                    Sutaupote {formatPrice(price - salePrice)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-500">PVM įskaičiuotas. Pristatymas apskaičiuojamas krepšelyje.</p>

              {/* Tūris */}
              <fieldset className="mt-6">
                <legend className="input-label">
                  Tūris: <span className="text-black">{size.label}</span>
                </legend>
                <div className="mt-1 flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = s.id === size.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSizeId(s.id)}
                        aria-pressed={active}
                        className={`min-w-[92px] rounded-xl border px-4 py-2.5 text-left transition ${
                          active ? 'border-black bg-black text-white' : 'border-brand-line bg-white hover:border-black'
                        }`}
                      >
                        <span className="block text-sm font-extrabold uppercase">{s.label}</span>
                        <span className={`block text-[11px] font-medium ${active ? 'text-white/70' : 'text-neutral-500'}`}>{s.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Trūkumo indikatorius */}
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-sale opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-sale" />
                </span>
                <p className="text-sm font-bold text-brand-sale">{scarcity}</p>
              </div>

              {/* Akordeonai */}
              <div className="mt-6 border-t border-brand-line">
                <Accordion id="kam" title="Kam skirti" icon={Users} open={openPanels.kam} onToggle={() => toggle('kam')}>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((g) => {
                      const match = g === product.gender || product.gender === 'Unisex';
                      return (
                        <span
                          key={g}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                            match ? 'border-brand-green bg-brand-green text-white' : 'border-brand-line text-neutral-400 line-through'
                          }`}
                        >
                          <span aria-hidden="true">{GENDER_ICON[g]}</span> {g}
                        </span>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">{GENDER_COPY[product.gender] || GENDER_COPY.Unisex}</p>
                </Accordion>

                <Accordion id="natos" title="Natos" icon={Sparkles} open={openPanels.natos} onToggle={() => toggle('natos')}>
                  <ol className="space-y-4">
                    {TIERS.map((tier) => (
                      <li key={tier.key} className="rounded-xl border border-brand-line p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]">
                            <span aria-hidden="true">{tier.icon}</span> {tier.label}
                          </p>
                          <span className="text-[11px] font-medium text-neutral-400">{tier.hint}</span>
                        </div>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {(product.notes?.[tier.key] || []).map((note) => (
                            <li
                              key={note}
                              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-notes text-neutral-700"
                            >
                              <span aria-hidden="true">{noteEmoji(note, tier.key)}</span>
                              {note}
                            </li>
                          ))}
                          {!(product.notes?.[tier.key] || []).length && <li className="text-xs text-neutral-400">Nenurodyta</li>}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </Accordion>

                <Accordion id="inci" title="Ingridientai" icon={FlaskConical} open={openPanels.inci} onToggle={() => toggle('inci')}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">INCI sudėtis</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{getInci(product).join(', ')}.</p>
                  <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                    Pagaminta Lietuvoje. Netestuota su gyvūnais. Laikyti vėsioje vietoje, saugoti nuo tiesioginių saulės spindulių. Tik
                    išoriniam naudojimui.
                  </p>
                </Accordion>
              </div>

              {/* Pasitikėjimo eilutė */}
              <ul className="mt-6 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: Truck, text: 'Nemokamai nuo 40€' },
                  { icon: RotateCcw, text: '14 d. grąžinimas' },
                  { icon: ShieldCheck, text: 'Saugus mokėjimas' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="rounded-xl border border-brand-line px-2 py-3">
                    <Icon className="mx-auto h-5 w-5" strokeWidth={2} />
                    <p className="mt-1.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-neutral-600">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Apatinė veiksmų juosta */}
        <div className="safe-bottom shrink-0 border-t border-brand-line bg-white px-4 pt-3 sm:px-6 lg:ml-[50%]">
          <div className="flex items-stretch gap-3">
            <div className="flex h-[52px] items-center rounded-full border border-black" role="group" aria-label="Kiekis">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="flex h-full w-11 items-center justify-center rounded-l-full transition hover:bg-neutral-100 disabled:opacity-30"
                aria-label="Sumažinti kiekį"
              >
                <Minus className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span className="w-8 text-center text-base font-extrabold tabular" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="flex h-full w-11 items-center justify-center rounded-r-full transition hover:bg-neutral-100 disabled:opacity-30"
                aria-label="Padidinti kiekį"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            <button type="button" onClick={add} disabled={soldOut} className="btn-primary h-[52px] flex-1 px-4">
              {soldOut ? (
                'Išparduota'
              ) : (
                <>
                  Įdėti į krepšelį
                  <span className="hidden font-semibold opacity-80 sm:inline">· {formatPrice(salePrice * qty)}</span>
                </>
              )}
            </button>
          </div>
          {!soldOut && qty >= maxQty && product.stock <= 10 && (
            <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">Pasiektas maksimalus galimas kiekis.</p>
          )}
        </div>
      </div>
    </div>
  );
}
