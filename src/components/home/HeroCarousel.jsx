import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { HERO_SLIDES } from '../../data/catalog.js'
import SmartImage from '../ui/SmartImage.jsx'
import CountdownPill from '../ui/CountdownPill.jsx'

export default function HeroCarousel({ onShop }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = HERO_SLIDES.length
  const touchStart = useRef(null)

  useEffect(() => {
    if (paused) return undefined
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 6500)
    return () => window.clearInterval(timer)
  }, [paused, count])

  const go = (next) => setIndex((next + count) % count)

  return (
    <section
      className="mx-auto max-w-7xl px-0 md:px-8 md:pt-6"
      aria-roledescription="karuselė"
      aria-label="Akcijos"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden bg-black md:rounded-2xl"
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
        <div
          className="flex transition-transform duration-700 ease-ios"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
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
                className="aspect-[4/5] w-full sm:aspect-[16/9] md:aspect-auto md:h-[500px]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent md:bg-linear-to-r md:from-black/75 md:via-black/35 md:to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 pb-12 text-white md:inset-y-0 md:left-0 md:right-auto md:flex md:max-w-xl md:flex-col md:justify-center md:p-14">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">{slide.eyebrow}</p>
                <h2 className="mt-2 text-[30px] font-extrabold leading-[1.05] tracking-tight text-balance md:text-[46px]">
                  {slide.title}
                </h2>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/80 md:text-[15px]">{slide.text}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    tabIndex={slideIndex === index ? 0 : -1}
                    onClick={() => onShop(slide.target)}
                    className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-[14px] font-bold text-black transition hover:bg-gray-100 active:scale-[0.97]"
                  >
                    {slide.cta} <ArrowRight size={16} aria-hidden="true" />
                  </button>
                  {slide.id === 'weekend' && <CountdownPill tone="glass" prefix="Baigiasi po" className="hidden sm:inline-flex" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:bottom-6">
          {HERO_SLIDES.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => go(slideIndex)}
              aria-label={`Rodyti ${slideIndex + 1} skaidrę`}
              aria-current={slideIndex === index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                slideIndex === index ? 'w-7 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Ankstesnė skaidrė"
          className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black backdrop-blur transition hover:bg-white md:flex"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Kita skaidrė"
          className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black backdrop-blur transition hover:bg-white md:flex"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  )
}
