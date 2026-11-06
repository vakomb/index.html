import React, { useMemo, useState } from 'react';
import { Plus, Check, SearchX } from 'lucide-react';
import { SECTIONS, categoryLabel, discountPercent, formatPrice, notesLine } from '../data/catalog';
import ProductImage from './ProductImage';

const PREVIEW_COUNT = 4;

function ProductCard({ product, onOpen, onQuickAdd, priority }) {
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product);
  const onSale = product.salePrice < product.price;
  const soldOut = (product.stock ?? 0) <= 0;

  const quickAdd = () => {
    onQuickAdd(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="block w-full overflow-hidden rounded-xl border border-brand-line focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          aria-label={`Peržiūrėti ${product.title}`}
        >
          <ProductImage
            src={product.image}
            alt={product.title}
            loading={priority ? 'eager' : 'lazy'}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 60vw"
            className="aspect-[3/4] w-full"
            imgClassName="transition-transform duration-700 group-hover:scale-105"
          />
        </button>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-brand-sale px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-brand-green px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
              Naujiena
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
              Išparduota
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={quickAdd}
          disabled={soldOut}
          className={`absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full shadow-card transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40 ${
            added ? 'bg-brand-green text-white' : 'bg-black text-white hover:scale-105'
          }`}
          aria-label={`Greitai įdėti ${product.title} į krepšelį`}
        >
          {added ? <Check className="h-5 w-5" strokeWidth={3} /> : <Plus className="h-5 w-5" strokeWidth={2.5} />}
        </button>
      </div>

      <button type="button" onClick={() => onOpen(product)} className="mt-3 flex flex-1 flex-col text-left focus:outline-none">
        <h3 className="font-display text-sm font-extrabold uppercase leading-tight tracking-wide text-black sm:text-[15px]">
          {product.title}
        </h3>
        <p className="notes-text mt-1.5 line-clamp-2">{notesLine(product)}</p>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-2.5 tabular">
          {onSale && <s className="text-xs font-medium text-neutral-400">{formatPrice(product.price)}</s>}
          <span className={`text-sm font-extrabold sm:text-[15px] ${onSale ? 'text-brand-sale' : 'text-black'}`}>
            {formatPrice(product.salePrice)}
          </span>
        </div>
        {product.stock > 0 && product.stock <= 2 && (
          <p className="mt-1 text-[11px] font-semibold text-brand-sale">🔥 Liko tik {product.stock} vnt.</p>
        )}
      </button>
    </article>
  );
}

function CollectionSection({ section, items, onOpen, onQuickAdd, firstSection }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = items.length > 1;
  const visible = items.slice(0, 8);

  return (
    <section className="py-8 sm:py-10" aria-labelledby={`sec-${section.id}`}>
      <div className="bg-brand-green">
        <div className="container-page py-3.5 sm:py-4">
          <h2 id={`sec-${section.id}`} className="text-center font-display text-lg font-extrabold uppercase tracking-[0.08em] text-white sm:text-2xl">
            {section.title}
          </h2>
        </div>
      </div>

      <p className="container-page mt-4 text-center text-sm text-neutral-600">
        {section.subtitle}
        {canExpand && (
          <>
            <span className="mx-2 text-neutral-300">|</span>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="font-bold text-black underline underline-offset-4 transition hover:text-brand-green"
              aria-expanded={expanded}
            >
              {expanded ? 'Rodyti mažiau' : 'Peržiūrėti'}
            </button>
          </>
        )}
      </p>

      <div className="mt-6">
        {expanded ? (
          <ul className="container-page grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
            {items.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} onOpen={onOpen} onQuickAdd={onQuickAdd} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="scrollbar-none container-page flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:gap-5 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {visible.map((p, i) => (
              <li
                key={p.id}
                className={`w-[62%] shrink-0 snap-start sm:w-[38%] lg:w-auto ${i >= PREVIEW_COUNT ? 'lg:hidden' : ''}`}
              >
                <ProductCard product={p} onOpen={onOpen} onQuickAdd={onQuickAdd} priority={firstSection && i < 2} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function ProductGrid({ products, activeCategory, searchQuery, onOpenProduct, onQuickAdd, onClearFilters }) {
  const query = searchQuery.trim().toLowerCase();

  const sections = useMemo(() => {
    if (query) {
      const results = products.filter((p) => {
        const haystack = [
          p.title,
          p.inspiration,
          p.gender,
          categoryLabel(p.category),
          ...(p.notes?.top || []),
          ...(p.notes?.heart || []),
          ...(p.notes?.base || []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
      return [
        {
          section: {
            id: 'paieska',
            title: 'PAIEŠKOS REZULTATAI',
            subtitle: `Rasta prekių: ${results.length} pagal „${searchQuery.trim()}“`,
          },
          items: results,
        },
      ];
    }

    if (activeCategory) {
      const label = categoryLabel(activeCategory);
      const items = products.filter((p) => p.category === activeCategory);
      return [
        {
          section: { id: `kat-${activeCategory}`, title: label, subtitle: `Visa ${label.toLowerCase()} kolekcija` },
          items,
        },
      ];
    }

    return SECTIONS.map((s) => ({ section: s, items: s.select(products) })).filter((s) => s.items.length > 0);
  }, [products, activeCategory, query, searchQuery]);

  const isFiltered = Boolean(query || activeCategory);
  const empty = sections.length === 0 || sections.every((s) => s.items.length === 0);

  return (
    <div id="parduotuve" className="scroll-mt-28 bg-white pb-6">
      {isFiltered && (
        <div className="container-page flex items-center justify-between gap-3 pt-6 text-xs">
          <span className="font-semibold uppercase tracking-wider text-neutral-500">
            Filtras: <span className="text-black">{query ? `„${searchQuery.trim()}“` : categoryLabel(activeCategory)}</span>
          </span>
          <button
            type="button"
            onClick={onClearFilters}
            className="font-bold uppercase tracking-wider text-black underline underline-offset-4 hover:text-brand-green"
          >
            Išvalyti
          </button>
        </div>
      )}

      {empty ? (
        <div className="container-page flex flex-col items-center py-20 text-center">
          <SearchX className="h-10 w-10 text-neutral-300" />
          <p className="mt-4 font-display text-lg font-extrabold uppercase">Nieko neradome</p>
          <p className="mt-1 max-w-sm text-sm text-neutral-500">Pabandykite kitą natą, pavadinimą ar kategoriją.</p>
          <button type="button" onClick={onClearFilters} className="btn-primary mt-6">
            Rodyti visas prekes
          </button>
        </div>
      ) : (
        sections.map(({ section, items }, idx) =>
          isFiltered ? (
            <FilteredSection key={section.id} section={section} items={items} onOpen={onOpenProduct} onQuickAdd={onQuickAdd} />
          ) : (
            <CollectionSection
              key={section.id}
              section={section}
              items={items}
              onOpen={onOpenProduct}
              onQuickAdd={onQuickAdd}
              firstSection={idx === 0}
            />
          )
        )
      )}
    </div>
  );
}

function FilteredSection({ section, items, onOpen, onQuickAdd }) {
  return (
    <section className="py-6 sm:py-8" aria-labelledby={`sec-${section.id}`}>
      <div className="bg-brand-green">
        <div className="container-page py-3.5 sm:py-4">
          <h2 id={`sec-${section.id}`} className="text-center font-display text-lg font-extrabold uppercase tracking-[0.08em] text-white sm:text-2xl">
            {section.title}
          </h2>
        </div>
      </div>
      <p className="container-page mt-4 text-center text-sm text-neutral-600">{section.subtitle}</p>
      <ul className="container-page mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
        {items.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} onOpen={onOpen} onQuickAdd={onQuickAdd} priority={i < 4} />
          </li>
        ))}
      </ul>
    </section>
  );
}
