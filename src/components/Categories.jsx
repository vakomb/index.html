import React from 'react';
import { Check, X } from 'lucide-react';
import { CATEGORIES } from '../data/catalog';
import ProductImage from './ProductImage';

const pluralItems = (n) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} prekė`;
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return `${n} prekės`;
  return `${n} prekių`;
};

export default function Categories({ activeCategory, onSelect, counts }) {
  return (
    <section className="border-b border-brand-line bg-white py-10 sm:py-14" aria-labelledby="produktai-title">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="produktai-title" className="heading-section">
              Produktai
            </h2>
            <p className="mt-1 text-sm text-neutral-500">Pasirinkite kategoriją – parduotuvė atsinaujins akimirksniu.</p>
          </div>
          {activeCategory && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black px-3 py-1.5 text-2xs font-bold uppercase tracking-wider transition hover:bg-black hover:text-white"
            >
              <X className="h-3.5 w-3.5" /> Rodyti viską
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <ul
          className="scrollbar-none container-page flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:gap-4 lg:grid lg:grid-cols-5 lg:overflow-visible"
          aria-label="Produktų kategorijos"
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            const count = counts[cat.id] || 0;
            return (
              <li key={cat.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
                <button
                  type="button"
                  onClick={() => onSelect(active ? null : cat.id)}
                  aria-pressed={active}
                  className={`group relative block w-full overflow-hidden rounded-2xl border text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                    active ? 'border-brand-green ring-2 ring-brand-green' : 'border-brand-line hover:border-black'
                  }`}
                >
                  <ProductImage
                    src={cat.image}
                    alt={cat.label}
                    className="aspect-[4/5] w-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {active && (
                    <span className="absolute right-3 top-3 flex h-7 w-7 animate-pop-in items-center justify-center rounded-full bg-brand-green text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-[0.14em] sm:text-xs ${
                        active ? 'bg-brand-green text-white' : 'bg-white text-black'
                      }`}
                    >
                      {cat.label}
                    </span>
                    <p className="mt-2 text-xs font-medium text-white/90">{cat.tagline}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">{pluralItems(count)}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
