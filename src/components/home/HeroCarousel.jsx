import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { HERO_SLIDES } from '../../data/catalog.js'
import SmartImage from '../ui/SmartImage.jsx'

// Viso pločio minimalistinė karuselė: didelė nuotrauka, didelis šriftas, vienas veiksmas.
export default function HeroCarousel({ onShop }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStart = useRef(null)
  const count = HERO_SLIDES.length

  useEffect(() => {
    if (paused) return undefined
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 7000)
    return () => window.clearInterval(timer)
  }, [paused, count])

  const go = (next) => setIndex((next + count) % count)

  return (
    <section
      className="relative overflow-hidden bg-black"
      aria-roledescription="karuselė"
      aria-label="Akcijos"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX
        setPaused(true)
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current
        touchStart.current = null
        setPaused(false)
        if (start === null) return
        const delta = event.changedTouches[0].clientX - start
        if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1))
      }}
    >
      <div className="flex transition-transform duration-[900ms] ease-ios" style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}>
        {HERO_SLIDES.map((slide, slideIndex) => (
          <div
            key={slide.id}
            className="relative w-full shrink-0"
            aria-hidden={slideIndex !== index}
            role="group"
            aria-roledescription="skaidrė"
            aria-label={`${slideIndex + 1} iš ${count}`}
          >
            <SmartImage
              src={slide.image}
              alt=""
              priority={slideIndex === 0}
              sizes="100vw"
              className="h-[78svh] max-h-[860px] min-h-[540px] w-full"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-black/5" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1440px] px-6 pb-20 text-white md:px-10 md:pb-24">
              <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/75">{slide.eyebrow}</p>
              <h2 className="mt-4 max-w-3xl text-[44px] font-medium leading-[1.02] tracking-[-0.02em] text-balance md:text-[84px]">
                {slide.title}
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/80 md:text-[19px]">{slide.text}</p>
              <button
                type="button"
                tabIndex={slideIndex === index ? 0 : -1}
                onClick={() => onShop(slide.target)}
                className="mt-8 inline-flex h-14 items-center gap-3 rounded-lg bg-white px-8 text-[16px] font-medium text-black transition hover:bg-gray-100 active:scale-[0.98]"
              >
                {slide.cta} <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-8 mx-auto flex max-w-[1440px] gap-2 px-6 md:bottom-10 md:px-10">
        {HERO_SLIDES.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => go(slideIndex)}
            aria-label={`Rodyti ${slideIndex + 1} skaidrę`}
            aria-current={slideIndex === index}
            className="group flex h-6 w-12 items-center md:w-16"
          >
            <span className={`h-px w-full transition-colors duration-500 ${slideIndex === index ? 'bg-white' : 'bg-white/35 group-hover:bg-white/60'}`} />
          </button>
        ))}
      </div>
    </section>
  )
}
