import { useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard.jsx'

export default function ProductCarousel({ title, products, onOpen, onAdd, onViewAll, accent = false, tabs }) {
  const trackRef = useRef(null)

  const scrollBy = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-[1440px] px-5 md:px-10" aria-label={title}>
      <div className="flex items-end justify-between gap-4">
        <h2 className={`text-[32px] font-medium leading-none tracking-[-0.02em] md:text-[48px] ${accent ? 'text-sale' : 'text-black'}`}>
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-[15px] font-medium underline decoration-black/20 underline-offset-[6px] transition hover:decoration-black md:mr-4"
            >
              Žiūrėti visus
            </button>
          )}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Ankstesni"
            className="hidden size-12 items-center justify-center rounded-full border border-black/10 transition hover:border-black md:flex"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Kiti"
            className="hidden size-12 items-center justify-center rounded-full border border-black/10 transition hover:border-black md:flex"
          >
            <ArrowRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {tabs}

      <div
        ref={trackRef}
        className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 md:-mx-1 md:mt-10 md:gap-8 md:px-1"
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onOpen={onOpen}
            onAdd={onAdd}
            className="w-[76%] shrink-0 snap-start sm:w-[44%] lg:w-[calc((100%-4rem)/3)]"
          />
        ))}
      </div>
    </section>
  )
}
