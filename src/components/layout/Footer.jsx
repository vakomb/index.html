import { PAYMENT_METHODS } from '../../data/catalog.js'
import { MAIN_NAV, POLICY_NAV, SECONDARY_NAV } from '../../data/navigation.js'
import Logo from '../ui/Logo.jsx'
import NewsletterForm from '../ui/NewsletterForm.jsx'
import { RegionSelect } from './Header.jsx'

function Column({ title, children }) {
  return (
    <div>
      <h3 className="text-[14px] font-medium text-gray-400">{title}</h3>
      <ul className="mt-5 space-y-3 text-[15px] text-gray-800">{children}</ul>
    </div>
  )
}

export default function Footer({ onNavigate, onShop, region, onRegionChange, newsletter, onSubscribe }) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-28 border-t border-black/5 bg-mist md:mt-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:items-end md:py-24">
          <div>
            <h2 className="text-[32px] font-medium leading-[1.05] tracking-[-0.02em] md:text-[48px]">
              −10 % pirmajam užsakymui
            </h2>
            <p className="mt-4 max-w-md text-[16px] text-gray-600 md:text-[17px]">
              Naujų kvapų anonsai ir uždaros akcijos. Ne dažniau kaip kartą per savaitę.
            </p>
          </div>
          <NewsletterForm subscribed={newsletter} onSubscribe={onSubscribe} />
        </div>

        <div className="grid grid-cols-2 gap-10 border-t border-black/10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo size="lg" onClick={() => onNavigate('home')} />
            <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-gray-600">
              Pasaulinių kvapų ikonų natos, perkurtos su juvelyriniu tikslumu. Išpilstyta Europos Sąjungoje.
            </p>
            <p className="mt-6 text-[15px]">labas@vaidore.com</p>
            <p className="text-[15px] text-gray-600">I–V 9–18 val.</p>
          </div>
          <Column title="Parduotuvė">
            {MAIN_NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onShop(item.filter)}
                  className={`transition hover:text-gray-500 ${item.accent ? 'text-sale' : ''}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </Column>
          <Column title="Informacija">
            {POLICY_NAV.map((item) => (
              <li key={item.route}>
                <button type="button" onClick={() => onNavigate(item.route)} className="transition hover:text-gray-500">
                  {item.label}
                </button>
              </li>
            ))}
          </Column>
          <Column title="Vaidore">
            {SECONDARY_NAV.map((item) => (
              <li key={item.route}>
                <button type="button" onClick={() => onNavigate(item.route)} className="transition hover:text-gray-500">
                  {item.label}
                </button>
              </li>
            ))}
          </Column>
        </div>

        <div className="flex flex-col gap-5 border-t border-black/10 py-8 text-[13px] text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {year} Vaidore.com</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            {PAYMENT_METHODS.map((method) => (
              <span key={method}>{method}</span>
            ))}
          </p>
          <RegionSelect region={region} onChange={onRegionChange} />
        </div>
        <p className="pb-10 text-[12px] leading-relaxed text-gray-400">
          Visi minimi prekių ženklai priklauso jų savininkams. Vaidore nėra susijusi su šiais prekių ženklais; pavadinimai
          naudojami tik kvapų profiliams apibūdinti.
        </p>
      </div>
    </footer>
  )
}
