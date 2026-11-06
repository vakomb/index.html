import { PAYMENT_METHODS } from '../../data/catalog.js'
import { MAIN_NAV, POLICY_NAV, SECONDARY_NAV } from '../../data/navigation.js'
import Logo from '../ui/Logo.jsx'
import NewsletterForm from '../ui/NewsletterForm.jsx'
import { RegionSelect } from './Header.jsx'

export default function Footer({ onNavigate, onShop, region, onRegionChange, newsletter, onSubscribe }) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 bg-[#151413] text-white">
      <div className="mx-auto max-w-7xl px-4 pt-12 md:px-8 md:pt-16">
        <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Gaukite −10 % pirmajam užsakymui</h2>
            <p className="mt-2 max-w-md text-[14px] text-white/60">
              Naujų kvapų anonsai, uždaros akcijos ir patarimai, kaip kvapą išlaikyti ilgiau. Jokio šlamšto.
            </p>
          </div>
          <NewsletterForm tone="dark" subscribed={newsletter} onSubscribe={onSubscribe} />
        </div>

        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo tone="light" onClick={() => onNavigate('home')} />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/55">
              Pasaulinių kvapų ikonų natos, perkurtos su juvelyriniu tikslumu. Išpilstyta Europos Sąjungoje.
            </p>
            <p className="mt-4 text-[13px] text-white/80">labas@vaidore.com</p>
            <p className="text-[13px] text-white/80">+370 600 00000 · I–V 9–18 val.</p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Parduotuvė</h3>
            <ul className="mt-4 space-y-2.5 text-[13px] text-white/75">
              {MAIN_NAV.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onShop(item.filter)}
                    className={`transition hover:text-white ${item.accent ? 'text-red-300' : ''}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Informacija</h3>
            <ul className="mt-4 space-y-2.5 text-[13px] text-white/75">
              {POLICY_NAV.map((item) => (
                <li key={item.route}>
                  <button type="button" onClick={() => onNavigate(item.route)} className="transition hover:text-white">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Vaidore</h3>
            <ul className="mt-4 space-y-2.5 text-[13px] text-white/75">
              {SECONDARY_NAV.map((item) => (
                <li key={item.route}>
                  <button type="button" onClick={() => onNavigate(item.route)} className="transition hover:text-white">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/75"
              >
                {method}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-white/50">
            <span>Šalis:</span>
            <div className="rounded-md bg-white text-black">
              <RegionSelect region={region} onChange={onRegionChange} />
            </div>
          </div>
        </div>

        <div className="pb-8 text-[11px] leading-relaxed text-white/40">
          <p>© {year} Vaidore.com · Visos teisės saugomos</p>
          <p className="mt-2 max-w-3xl">
            Visi minimi prekių ženklai priklauso jų savininkams. Vaidore nėra susijusi su šiais prekių ženklais ir jų
            nepristato; pavadinimai naudojami tik kvapų profiliams apibūdinti.
          </p>
        </div>
      </div>
    </footer>
  )
}
