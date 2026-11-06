import { ArrowRight } from 'lucide-react'
import { PHOTO, unsplash } from '../data/images.js'
import SmartImage from '../components/ui/SmartImage.jsx'

const PILLARS = [
  {
    number: '01',
    title: 'Tvarus žaliavų tiekimas',
    text: 'Bergamotę perkame iš Kalabrijos ūkių, levandas — iš Provanso kooperatyvų, vanilę — tiesiai iš Madagaskaro augintojų. Kiekviena partija turi kilmės sertifikatą, o tiekėjus lankome patys. Jokių tarpininkų, jokių kompromisų dėl kokybės.',
  },
  {
    number: '02',
    title: 'Švari kompaundavimo chemija',
    text: 'Formulėse nėra parabenų, ftalatų ir dirbtinių dažiklių. Kvapus maišome IFRA standartus atitinkančioje laboratorijoje Europos Sąjungoje, o kiekvieną partiją tikriname dujų chromatografu, kad kvapas būtų identiškas nuo pirmo iki tūkstantojo flakono.',
  },
  {
    number: '03',
    title: 'Absoliutus ilgaamžiškumas',
    text: 'Kiekvienas kvapas brandinamas šešias savaites tamsoje ir +14 °C temperatūroje. Per šį laiką molekulės susijungia ir sukuria gilų, stabilų šleifą, kuris ant odos išsilaiko 12 ir daugiau valandų, o ant drabužių — kelias dienas.',
  },
  {
    number: '04',
    title: 'Didelės koncentracijos filosofija',
    text: 'Mūsų Eau de Parfum turi 22 % kvapiųjų esencijų, aliejiniai koncentratai — net 30 %. Tai daugiau nei daugelyje prabangos namų flakonų, todėl užtenka dviejų purškimų, o vienas 50 ml flakonas tarnauja keletą mėnesių.',
  },
]

const STATS = [
  { value: '22 %', label: 'kvapiųjų esencijų EDP formulėje' },
  { value: '12+', label: 'valandų ilgaamžiškumas ant odos' },
  { value: '6 sav.', label: 'brandinimas prieš išpilstymą' },
  { value: '0', label: 'parabenų, ftalatų ir bandymų su gyvūnais' },
]

export default function AboutView({ onNavigate }) {
  return (
    <article>
      <header className="mx-auto max-w-5xl px-4 pt-12 text-center md:px-8 md:pt-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gray-500">Apie mus · Vaidore.com</p>
        <h1 className="mt-5 font-serif text-[38px] font-semibold leading-[1.02] tracking-tight text-balance md:text-[68px]">
          Mes kuriame kvapus, kurie <em className="text-gray-500">atlaiko dieną.</em>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-[16px] leading-relaxed text-gray-600 md:text-lg">
          Vaidore gimė iš paprasto klausimo: kodėl už kvapą, kuris išgaruoja iki pietų, turėtume mokėti už prekės ženklą?
          Atsakymas — laboratorija, žaliavos ir kantrybė.
        </p>
      </header>

      <div className="mx-auto mt-14 max-w-7xl px-4 md:mt-20 md:px-8">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr] md:gap-5">
          <SmartImage
            src={unsplash(PHOTO.diffuserInterior, 1600)}
            alt="Kvapų difuzorius prabangiame interjere"
            priority
            sizes="(min-width: 768px) 62vw, 100vw"
            className="aspect-[4/3] w-full rounded-[32px] md:aspect-auto md:h-[560px]"
          />
          <SmartImage
            src={unsplash(PHOTO.candleDark, 1000)}
            alt="Degančios žvakės šviesa tamsoje"
            sizes="(min-width: 768px) 38vw, 100vw"
            className="aspect-[4/3] w-full rounded-[32px] md:aspect-auto md:h-[560px]"
          />
        </div>
      </div>

      <section className="mx-auto mt-16 max-w-3xl px-4 md:mt-24 md:px-8">
        <p className="text-[17px] leading-[1.8] text-gray-700 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[84px] first-letter:leading-[0.8] first-letter:text-black md:text-[19px]">
          Kiekvienas legendinis kvapas yra architektūra. Viršutinės natos — tai fasadas, kurį pamatote pirmiausia.
          Širdis — erdvės, kuriose gyvenate. Bazė — pamatai, ant kurių viskas laikosi. Mes šią architektūrą išmatuojame
          iki molekulės, atrenkame švariausias žaliavas ir pastatome iš naujo — tvirčiau, tankiau, ilgaamžiškiau. Ne
          tam, kad nukopijuotume, o tam, kad prabanga taptų kasdienybe, o ne išimtimi.
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:mt-24 md:px-8" aria-label="Vaidore vertybės">
        <div className="grid gap-px overflow-hidden rounded-[32px] bg-gray-100 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div key={pillar.number} className="bg-white p-7 md:p-12">
              <p className="font-serif text-2xl text-gray-300">{pillar.number}</p>
              <h2 className="mt-4 font-serif text-3xl font-medium leading-tight md:text-4xl">{pillar.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-gray-600">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:mt-24 md:px-8" aria-label="Vaidore skaičiais">
        <div className="grid grid-cols-2 gap-y-10 border-y border-gray-100 py-12 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-2 text-center">
              <p className="font-serif text-5xl tracking-tight md:text-7xl">{stat.value}</p>
              <p className="mx-auto mt-2 max-w-[12rem] text-[13px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-4 text-center md:mt-24 md:px-8">
        <blockquote className="font-serif text-[26px] font-medium leading-[1.25] text-black md:text-[40px]">
          „Kvapas yra vienintelis drabužis, kurio niekas nepamato, bet visi prisimena.“
        </blockquote>
        <p className="mt-5 text-[12px] uppercase tracking-[0.22em] text-gray-500">Vaidore kvapų laboratorija</p>
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="mt-10 inline-flex h-13 items-center gap-2 rounded-lg bg-black px-8 text-[15px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.97]"
        >
          Atrasti kolekciją <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>
    </article>
  )
}
