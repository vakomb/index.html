import { useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck } from 'lucide-react'
import { AUDIENCES, CATEGORIES, TRUST_ITEMS, TRUST_TICKER, matchesAudience } from '../data/catalog.js'
import { HIGHLIGHT_REVIEWS } from '../data/reviews.js'
import { PHOTO, unsplash } from '../data/images.js'
import { countLabel } from '../lib/format.js'
import { getIcon } from '../components/ui/icons.js'
import SmartImage from '../components/ui/SmartImage.jsx'
import Stars from '../components/ui/Stars.jsx'
import HeroCarousel from '../components/home/HeroCarousel.jsx'
import ProductCarousel from '../components/product/ProductCarousel.jsx'

const byPopularity = (a, b) =>
  (b.badge === 'bestseller') - (a.badge === 'bestseller') || (b.popularity ?? 0) - (a.popularity ?? 0)

function TrustMarquee() {
  const items = [...TRUST_TICKER, ...TRUST_TICKER]
  return (
    <div className="overflow-hidden border-y border-gray-100 bg-white py-3.5" aria-label="Mūsų privalumai">
      <ul className="sr-only">
        {TRUST_TICKER.map((item) => (
          <li key={item.text}>{item.text}</li>
        ))}
      </ul>
      <div className="flex w-max animate-marquee items-center [animation-duration:55s]" aria-hidden="true">
        {items.map((item, index) => {
          const Icon = getIcon(item.icon)
          return (
            <span
              key={`${item.text}-${index}`}
              className="flex items-center gap-2 whitespace-nowrap px-6 text-[13px] font-semibold text-gray-800"
            >
              <Icon size={16} strokeWidth={1.75} className="text-black" />
              {item.text}
            </span>
          )
        })}
      </div>
    </div>
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

      <div className="mt-0 md:mt-6">
        <TrustMarquee />
      </div>

      {/* ---------- Kategorijos ---------- */}
      <section className="mx-auto mt-10 max-w-7xl px-4 md:mt-14 md:px-8" aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-[22px] font-extrabold tracking-tight md:text-[28px]">
          Kategorijos
        </h2>
        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-6 md:gap-5">
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
                  sizes="(min-width: 768px) 16vw, 33vw"
                  className="aspect-square w-full rounded-xl"
                  imgClassName="transition-transform duration-700 ease-ios group-hover:scale-105"
                />
                <p className="mt-2 text-[13px] font-bold leading-tight md:text-[14px]">{category.label}</p>
                <p className="text-[11px] text-gray-500">{countLabel(count, ['prekė', 'prekės', 'prekių'])}</p>
              </button>
            )
          })}
        </div>
      </section>

      <div className="mt-14 md:mt-20">
        <ProductCarousel
          eyebrow="Ką tik atvyko"
          title="Naujienos"
          products={newest}
          onOpen={onOpenProduct}
          onAdd={onAdd}
          onViewAll={() => onShop({ sort: 'new' })}
        />
      </div>

      <div className="mt-14 md:mt-20">
        <ProductCarousel
          eyebrow="Labiausiai perkami"
          title="Populiariausi kvapai"
          products={bestsellers}
          onOpen={onOpenProduct}
          onAdd={onAdd}
          onViewAll={() => onShop({ audience })}
          tabs={
            <div className="mt-4 flex gap-2" role="tablist" aria-label="Kam skirta">
              {AUDIENCES.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={audience === item}
                  onClick={() => setAudience(item)}
                  className={`h-9 rounded-lg px-4 text-[13px] font-bold transition ${
                    audience === item ? 'bg-black text-white' : 'bg-mist text-gray-700 hover:bg-smoke'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          }
        />
      </div>

      {/* ---------- Mėginukų reklama ---------- */}
      <section className="mx-auto mt-14 max-w-7xl px-4 md:mt-20 md:px-8">
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-mist md:grid-cols-2">
          <SmartImage
            src={unsplash(PHOTO.perfumeGrey, 1200)}
            alt="Kvepalų mėginukų rinkinys"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[16/10] w-full md:aspect-auto md:h-full md:min-h-[360px]"
          />
          <div className="flex flex-col justify-center p-6 md:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Mėginukų rinkiniai</p>
            <h2 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight md:text-[36px]">
              Išbandykite prieš pirkdami — 8 kvapai už 19 €
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-gray-600">
              Kiekvieną kvapą nešiokite visą dieną ir pajuskite, kaip jis keičiasi ant jūsų odos. Rinkinio kainą
              atskaitysime, kai pirksite 50 ml flakoną.
            </p>
            <button
              type="button"
              onClick={() => onShop({ category: 'meginukai' })}
              className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-black px-6 text-[14px] font-bold text-white transition hover:bg-gray-800 active:scale-[0.97]"
            >
              Rinktis mėginukus <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {clearance.length > 0 && (
        <div className="mt-14 md:mt-20">
          <ProductCarousel
            eyebrow="Kol dar yra"
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
      <section className="mt-14 bg-mist py-12 md:mt-20 md:py-16" aria-labelledby="home-reviews-title">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="home-reviews-title" className="text-[22px] font-extrabold tracking-tight md:text-[28px]">
                Ką sako pirkėjai
              </h2>
              <p className="mt-1 flex items-center gap-2 text-[13px] text-gray-600">
                <Stars rating={5} size={14} />
                <span className="font-bold text-black">4,9 / 5</span>·{' '}
                {countLabel(totalReviews, ['atsiliepimas', 'atsiliepimai', 'atsiliepimų'])}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reviews')}
              className="inline-flex items-center gap-1 text-[13px] font-bold underline-offset-4 hover:underline"
            >
              Visi atsiliepimai <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
          <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {HIGHLIGHT_REVIEWS.map((review) => (
              <figure
                key={`${review.author}-${review.product}`}
                className="w-[78%] shrink-0 snap-start rounded-xl bg-white p-5 sm:w-[45%] md:w-auto"
              >
                <Stars rating={review.rating} size={13} />
                <blockquote className="mt-3 text-[14px] leading-relaxed text-gray-800">„{review.text}“</blockquote>
                <figcaption className="mt-4 text-[12px] text-gray-500">
                  <span className="font-bold text-black">{review.author}</span> · {review.city}
                  <span className="mt-1 flex items-center gap-1 text-gray-500">
                    <BadgeCheck size={12} className="text-emerald-600" aria-hidden="true" />
                    {review.product}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Privalumai ---------- */}
      <section className="mx-auto mt-14 max-w-7xl px-4 md:mt-20 md:px-8" aria-label="Mūsų garantijos">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {TRUST_ITEMS.map((item) => {
            const Icon = getIcon(item.icon)
            return (
              <div key={item.title} className="flex gap-4 rounded-xl border border-gray-100 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                  <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[14px] font-bold">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------- Apie ---------- */}
      <section className="mx-auto mt-14 max-w-7xl px-4 md:mt-20 md:px-8" aria-labelledby="home-about-title">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
          <SmartImage
            src={unsplash(PHOTO.oilDropperWood, 1200)}
            alt="Aliejinis kvapų koncentratas su lašintuvu"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/3] w-full rounded-2xl"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Apie Vaidore</p>
            <h2 id="home-about-title" className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight md:text-[36px]">
              Ne kopija — interpretacija su didesne koncentracija
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
              Kiekvieną legendinį kvapą išardome iki molekulių, atrenkame švariausias žaliavas ir sukomponuojame iš
              naujo. 22 % esencijų ir šešių savaičių brandinimas reiškia, kad kvapas išsilaiko visą dieną.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg border border-black px-6 text-[14px] font-bold transition hover:bg-black hover:text-white"
            >
              Mūsų istorija <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
