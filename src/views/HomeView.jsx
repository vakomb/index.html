import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { AUDIENCES, CATEGORIES, matchesAudience } from '../data/catalog.js'
import { HIGHLIGHT_REVIEWS } from '../data/reviews.js'
import { PHOTO, unsplash } from '../data/images.js'
import { countLabel } from '../lib/format.js'
import SmartImage from '../components/ui/SmartImage.jsx'
import Stars from '../components/ui/Stars.jsx'
import HeroCarousel from '../components/home/HeroCarousel.jsx'
import ProductCarousel from '../components/product/ProductCarousel.jsx'

const byPopularity = (a, b) =>
  (b.badge === 'bestseller') - (a.badge === 'bestseller') || (b.popularity ?? 0) - (a.popularity ?? 0)

const PROMISES = [
  { value: '22 %', label: 'kvapiųjų esencijų' },
  { value: '12+ val.', label: 'ant odos' },
  { value: '14 d.', label: 'nemokamas keitimas' },
  { value: '40 €', label: 'nemokamas pristatymas nuo' },
]

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-[32px] font-medium leading-none tracking-[-0.02em] md:text-[48px]">{children}</h2>
      {action}
    </div>
  )
}

function TextLink({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 text-[15px] font-medium underline decoration-black/20 underline-offset-[6px] transition hover:decoration-black"
    >
      {children}
    </button>
  )
}

export default function HomeView({ products, onNavigate, onShop, onOpenProduct, onAdd }) {
  const [audience, setAudience] = useState('Moterims')

  const available = useMemo(() => products.filter((product) => product.stock > 0), [products])
  const newest = useMemo(
    () => [...available].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    [available],
  )
  const bestsellers = useMemo(
    () => available.filter((product) => matchesAudience(product, audience)).sort(byPopularity).slice(0, 8),
    [available, audience],
  )
  const clearance = useMemo(() => products.filter((product) => product.clearance), [products])
  const totalReviews = products.reduce((sum, product) => sum + (product.reviewsCount ?? 0), 0)

  return (
    <div>
      <HeroCarousel onShop={onShop} />

      {/* ---------- Pažadas ---------- */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-32">
        <p className="mx-auto max-w-4xl text-center text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-balance md:text-[48px]">
          Pasaulinių ikonų natos, perkurtos taip, kad išsilaikytų visą dieną.
        </p>
        <dl className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-y-10 md:mt-20 md:grid-cols-4">
          {PROMISES.map((item) => (
            <div key={item.label} className="text-center">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block text-[34px] font-medium tracking-[-0.02em] md:text-[44px]">{item.value}</span>
                <span className="mt-1 block text-[14px] text-gray-500 md:text-[15px]">{item.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- Kategorijos ---------- */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10" aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-[32px] font-medium leading-none tracking-[-0.02em] md:text-[48px]">
          Kategorijos
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-10 md:grid-cols-3 md:gap-x-8 md:gap-y-14">
          {CATEGORIES.map((category) => {
            const count = products.filter((product) => product.category === category.id).length
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onShop({ category: category.id })}
                className="group text-left"
              >
                <SmartImage
                  src={category.image}
                  alt={category.label}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="aspect-[4/5] w-full rounded-md"
                  imgClassName="transition-transform duration-[1400ms] ease-ios group-hover:scale-[1.03]"
                />
                <p className="mt-4 flex items-center justify-between gap-2 text-[18px] font-medium md:text-[22px]">
                  {category.label}
                  <ArrowRight
                    size={20}
                    strokeWidth={1.5}
                    className="hidden shrink-0 transition-transform group-hover:translate-x-1 md:block"
                    aria-hidden="true"
                  />
                </p>
                <p className="mt-1 text-[14px] text-gray-500">{countLabel(count, ['prekė', 'prekės', 'prekių'])}</p>
              </button>
            )
          })}
        </div>
      </section>

      <div className="mt-24 md:mt-36">
        <ProductCarousel
          title="Naujienos"
          products={newest}
          onOpen={onOpenProduct}
          onAdd={onAdd}
          onViewAll={() => onShop({ sort: 'new' })}
        />
      </div>

      <div className="mt-24 md:mt-36">
        <ProductCarousel
          title="Populiariausi"
          products={bestsellers}
          onOpen={onOpenProduct}
          onAdd={onAdd}
          onViewAll={() => onShop({ audience })}
          tabs={
            <div className="mt-6 flex gap-6 border-b border-black/10" role="tablist" aria-label="Kam skirta">
              {AUDIENCES.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={audience === item}
                  onClick={() => setAudience(item)}
                  className={`-mb-px border-b-2 pb-3 text-[16px] font-medium transition md:text-[17px] ${
                    audience === item ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          }
        />
      </div>

      {/* ---------- Mėginukai ---------- */}
      <section className="mt-24 md:mt-36">
        <div className="grid grid-cols-1 bg-mist md:grid-cols-2">
          <SmartImage
            src={unsplash(PHOTO.perfumeGrey, 1600)}
            alt="Kvepalų mėginukų rinkinys"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/5] w-full md:aspect-auto md:h-[760px]"
          />
          <div className="flex flex-col justify-center px-6 py-16 md:px-20">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-gray-500">Mėginukų rinkiniai</p>
            <h2 className="mt-5 text-[36px] font-medium leading-[1.05] tracking-[-0.02em] md:text-[60px]">
              Išbandykite prieš pirkdami.
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-gray-600 md:text-[19px]">
              8 kvapai po 2 ml už 19 €. Rinkinio kainą atskaitysime, kai pasirinksite 50 ml flakoną.
            </p>
            <button
              type="button"
              onClick={() => onShop({ category: 'meginukai' })}
              className="mt-10 inline-flex h-14 w-fit items-center gap-3 rounded-lg bg-black px-8 text-[16px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
            >
              Rinktis mėginukus <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {clearance.length > 0 && (
        <div className="mt-24 md:mt-36">
          <ProductCarousel
            title="Išpardavimas"
            accent
            products={clearance}
            onOpen={onOpenProduct}
            onAdd={onAdd}
            onViewAll={() => onShop({ clearance: true })}
          />
        </div>
      )}

      {/* ---------- Atsiliepimai ---------- */}
      <section className="mx-auto mt-24 max-w-[1440px] px-5 md:mt-36 md:px-10" aria-labelledby="home-reviews-title">
        <SectionTitle action={<TextLink onClick={() => onNavigate('reviews')}>Visi atsiliepimai</TextLink>}>
          <span id="home-reviews-title">Atsiliepimai</span>
        </SectionTitle>
        <p className="mt-4 flex items-center gap-3 text-[15px] text-gray-600">
          <Stars rating={5} size={16} />
          4,9 / 5 · {countLabel(totalReviews, ['atsiliepimas', 'atsiliepimai', 'atsiliepimų'])}
        </p>
        <div className="no-scrollbar -mx-5 mt-10 flex snap-x gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
          {HIGHLIGHT_REVIEWS.slice(0, 3).map((review) => (
            <figure
              key={`${review.author}-${review.product}`}
              className="flex w-[84%] shrink-0 snap-start flex-col justify-between rounded-md bg-mist p-7 sm:w-[60%] md:w-auto md:p-10"
            >
              <blockquote className="text-[20px] font-medium leading-[1.4] tracking-[-0.01em] md:text-[24px]">
                „{review.text}“
              </blockquote>
              <figcaption className="mt-8 text-[14px] text-gray-500">
                <span className="text-black">{review.author}</span> · {review.city}
                <span className="mt-1 block">{review.product}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- Apie ---------- */}
      <section className="mx-auto mt-24 max-w-[1440px] px-5 md:mt-36 md:px-10" aria-labelledby="home-about-title">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-20">
          <SmartImage
            src={unsplash(PHOTO.oilDropperWood, 1600)}
            alt="Aliejinis kvapų koncentratas su lašintuvu"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/5] w-full rounded-md"
          />
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-gray-500">Apie Vaidore</p>
            <h2 id="home-about-title" className="mt-5 text-[36px] font-medium leading-[1.05] tracking-[-0.02em] md:text-[60px]">
              Ne kopija. Interpretacija.
            </h2>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-gray-600 md:text-[19px]">
              Kiekvieną legendinį kvapą išardome iki molekulių, atrenkame švariausias žaliavas ir sukomponuojame iš
              naujo — su didesne koncentracija ir šešių savaičių brandinimu.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="mt-10 inline-flex h-14 items-center gap-3 rounded-lg border border-black px-8 text-[16px] font-medium transition hover:bg-black hover:text-white"
            >
              Mūsų istorija <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
