import { ArrowRight, BadgeCheck, ShieldCheck, Star, Truck } from 'lucide-react'
import { CATEGORIES, TRUST_ITEMS } from '../data/catalog.js'
import { HIGHLIGHT_REVIEWS } from '../data/reviews.js'
import { PHOTO, unsplash } from '../data/images.js'
import { countLabel } from '../lib/format.js'
import { getIcon } from '../components/ui/icons.js'
import SmartImage from '../components/ui/SmartImage.jsx'
import Stars from '../components/ui/Stars.jsx'
import CountdownPill from '../components/ui/CountdownPill.jsx'
import ProductCard from '../components/product/ProductCard.jsx'

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500">{eyebrow}</p>
        )}
        <h2 className="mt-2 font-serif text-[34px] font-medium leading-none tracking-tight md:text-5xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export default function HomeView({ products, onNavigate, onSelectCategory, onOpenProduct, onAdd }) {
  const featured = [...products]
    .filter((product) => product.stock > 0)
    .sort((a, b) => {
      const score = (product) => (product.badge === 'bestseller' ? 1000 : 0) + (product.popularity ?? 0)
      return score(b) - score(a)
    })
    .slice(0, 4)

  const totalReviews = products.reduce((sum, product) => sum + (product.reviewsCount ?? 0), 0)

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-6 md:px-8 md:pt-12">
        <div className="grid items-center gap-8 md:grid-cols-[1.05fr_1fr] md:gap-14">
          <div className="order-2 md:order-1">
            <CountdownPill />
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-gray-500">
              Kolekcija 2026 · Eau de Parfum
            </p>
            <h1 className="mt-3 font-serif text-[52px] font-medium leading-[0.95] tracking-tight text-black text-balance sm:text-6xl lg:text-[88px]">
              Kvapas, kuris lieka <em className="font-normal italic text-gray-500">po jūsų.</em>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-gray-600 md:text-base">
              Kiekvienas flakonas — tai 22 % kvapiųjų esencijų, šešias savaites brandintų tamsoje. Pasaulinių ikonų
              natos, perkurtos su juvelyriniu tikslumu, kad jūsų kvapas skleistųsi visą dieną ir dar ilgai liktų kitų
              atmintyje.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="group inline-flex h-13 items-center gap-2 rounded-full bg-black px-8 text-[15px] font-medium text-white shadow-xl shadow-black/15 transition hover:bg-gray-800 active:scale-[0.97]"
              >
                Pirkti kolekciją
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="inline-flex h-13 items-center rounded-full px-5 text-[15px] font-medium text-black underline decoration-gray-300 underline-offset-[6px] transition hover:decoration-black"
              >
                Mūsų filosofija
              </button>
            </div>
            <div className="mt-8 flex items-center gap-3 text-[13px] text-gray-600">
              <div className="flex -space-x-2" aria-hidden="true">
                {['GK', 'RP', 'MV', 'IS'].map((initials) => (
                  <span
                    key={initials}
                    className="flex size-8 items-center justify-center rounded-full bg-smoke text-[10px] font-semibold text-gray-700 ring-2 ring-white"
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <span>
                <span className="inline-flex items-center gap-1 font-semibold text-black">
                  <Star size={13} className="fill-black" aria-hidden="true" /> 4,9 / 5
                </span>{' '}
                · {countLabel(totalReviews, ['atsiliepimas', 'atsiliepimai', 'atsiliepimų'])}
              </span>
            </div>
          </div>

          <div className="relative order-1 md:order-2">
            <SmartImage
              src={unsplash(PHOTO.perfumeReflections, 1400)}
              alt="Skaidrus kvepalų flakonas šviesos atspindžiuose"
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/5] w-full rounded-[32px] md:aspect-[5/6]"
            />
            <div className="absolute -bottom-5 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/85 p-3 shadow-xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl md:-left-10 md:right-auto md:w-72">
              <SmartImage
                src={unsplash(PHOTO.diffuserInterior, 300)}
                alt=""
                sizes="56px"
                className="size-14 shrink-0 rounded-xl"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Olfaktorinė inžinerija</p>
                <p className="mt-0.5 text-[13px] font-medium leading-snug">Ilgaamžiškumas — 12+ valandų ant odos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Pasitikėjimo juosta ---------- */}
      <section className="mx-auto mt-16 max-w-7xl px-4 md:mt-24 md:px-8" aria-label="Mūsų garantijos">
        <div className="grid divide-y divide-gray-100 overflow-hidden rounded-[28px] border border-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          {TRUST_ITEMS.map((item) => {
            const Icon = getIcon(item.icon)
            return (
              <div key={item.title} className="flex gap-4 p-5 md:p-7">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[14px] font-semibold">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------- Kategorijos ---------- */}
      <section className="mt-20 md:mt-28" aria-labelledby="collections-title">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeading eyebrow="Kolekcijos" title="Raskite savo ritualą" />
        </div>
        <div className="no-scrollbar mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-auto md:grid md:max-w-7xl md:grid-cols-4 md:gap-5 md:overflow-visible md:px-8">
          {CATEGORIES.map((category) => {
            const Icon = getIcon(category.icon)
            const count = products.filter((product) => product.category === category.id).length
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className="group relative w-[72%] shrink-0 snap-start overflow-hidden rounded-[26px] text-left sm:w-[44%] md:w-auto"
              >
                <SmartImage
                  src={category.image}
                  alt={category.label}
                  sizes="(min-width: 768px) 25vw, 72vw"
                  className="aspect-[3/4] w-full"
                  imgClassName="transition-transform duration-[1400ms] ease-ios group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/85 text-black backdrop-blur-xl">
                  <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <p className="text-[11px] text-white/70">{countLabel(count, ['kvapas', 'kvapai', 'kvapų'])}</p>
                  <p className="mt-0.5 font-serif text-[26px] leading-tight">{category.label}</p>
                  <p className="mt-1 flex items-center justify-between text-[12px] text-white/80">
                    {category.subtitle}
                    <ArrowRight
                      size={16}
                      className="shrink-0 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ---------- Populiariausi ---------- */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:mt-28 md:px-8" aria-labelledby="featured-title">
        <SectionHeading
          eyebrow="Kuruota atranka"
          title="Populiariausi šią savaitę"
          action={
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="hidden shrink-0 items-center gap-1.5 text-[13px] font-medium underline-offset-4 hover:underline md:inline-flex"
            >
              Visa kolekcija <ArrowRight size={15} aria-hidden="true" />
            </button>
          }
        />
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onOpen={onOpenProduct} onAdd={onAdd} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="mt-10 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gray-200 text-sm font-medium md:hidden"
        >
          Visa kolekcija <ArrowRight size={15} aria-hidden="true" />
        </button>
      </section>

      {/* ---------- Socialinis įrodymas ---------- */}
      <section className="mt-20 bg-mist py-16 md:mt-28 md:py-24" aria-labelledby="reviews-home-title">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500">Pirkėjų balsas</p>
              <p id="reviews-home-title" className="mt-3 font-serif text-[88px] leading-none tracking-tight md:text-[120px]">
                4,9
              </p>
              <Stars rating={5} size={18} className="mt-3" />
              <p className="mt-3 max-w-xs text-[14px] text-gray-600">
                Daugiau nei {countLabel(totalReviews, ['patvirtintas atsiliepimas', 'patvirtinti atsiliepimai', 'patvirtintų atsiliepimų'])}{' '}
                iš visos Lietuvos ir Europos.
              </p>
            </div>
            <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
              {HIGHLIGHT_REVIEWS.map((review) => (
                <figure
                  key={`${review.author}-${review.product}`}
                  className="w-[80%] shrink-0 snap-start rounded-[24px] bg-white p-5 shadow-sm shadow-black/[0.03] sm:w-[46%] md:w-auto"
                >
                  <Stars rating={review.rating} size={13} />
                  <blockquote className="mt-3 text-[15px] leading-relaxed text-gray-800">„{review.text}“</blockquote>
                  <figcaption className="mt-4 text-[12px] text-gray-500">
                    <span className="font-medium text-black">{review.author}</span> · {review.city}
                    <span className="mt-0.5 flex items-center gap-1 text-gray-400">
                      <BadgeCheck size={12} className="text-emerald-600" aria-hidden="true" />
                      {review.product}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Filosofija ---------- */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:mt-28 md:px-8" aria-labelledby="philosophy-title">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <SmartImage
            src={unsplash(PHOTO.oilDropperWood, 1200)}
            alt="Aliejinis kvapų koncentratas su lašintuvu"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/3] w-full rounded-[32px]"
          />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500">Filosofija</p>
            <h2 id="philosophy-title" className="mt-3 font-serif text-4xl font-medium leading-[1.02] tracking-tight md:text-6xl">
              Ne kopija. <em className="italic text-gray-500">Interpretacija.</em>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-gray-600">
              Mes nekuriame pigių atitikmenų. Kiekvieną legendinį kvapą išardome iki molekulių, atrenkame švariausias
              žaliavas ir sukomponuojame iš naujo — su didesne koncentracija ir ilgesniu brandinimu nei dauguma
              prabangos namų.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="mt-7 inline-flex items-center gap-2 text-[14px] font-medium underline decoration-gray-300 underline-offset-[6px] hover:decoration-black"
            >
              Skaityti mūsų istoriją <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Garantija ---------- */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:mt-28 md:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-black px-6 py-12 text-white md:px-14 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <h2 className="font-serif text-4xl font-medium leading-[1.02] md:text-5xl">
                100 % kokybės garantija.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">
                Jei kvapas jūsų nesužavės, per 14 dienų nemokamai pakeisime jį kitu arba grąžinsime pinigus. Jokių
                smulkių šriftų.
              </p>
            </div>
            <div className="grid gap-3 text-[13px]">
              <p className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <ShieldCheck size={18} strokeWidth={1.6} aria-hidden="true" /> Pinigų grąžinimo garantija
              </p>
              <p className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <Truck size={18} strokeWidth={1.6} aria-hidden="true" /> Greitas pristatymas iš ES
              </p>
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-medium text-black transition active:scale-[0.98]"
              >
                Rinktis kvapą <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
