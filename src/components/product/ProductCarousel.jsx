import { useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard.jsx'

export default function ProductCarousel({ title, eyebrow, products, onOpen, onAdd, onViewAll, accent = false, tabs }) {
  const trackRef = useRef(null)

  const scrollBy = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8" aria-label={title}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${accent ? 'text-sale' : 'text-gray-500'}`}>
              {eyebrow}
            </p>
          )}
          <h2 className={`mt-1 text-[22px] font-extrabold tracking-tight md:text-[28px] ${accent ? 'text-sale' : 'text-black'}`}>
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="mr-2 inline-flex items-center gap-1 text-[13px] font-bold underline-offset-4 hover:underline"
            >
              Žiūrėti visus <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Ankstesni"
            className="hidden size-9 items-center justify-center rounded-full border border-gray-200 transition hover:border-black md:flex"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Kiti"
            className="hidden size-9 items-center justify-center rounded-full border border-gray-200 transition hover:border-black md:flex"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {tabs}

      <div
        ref={trackRef}
        className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 md:-mx-1 md:gap-5 md:px-1"
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onOpen={onOpen}
            onAdd={onAdd}
            className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-15px)]"
          />
        ))}
      </div>
    </section>
  )
}
