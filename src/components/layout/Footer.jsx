import { CATEGORIES } from '../../data/catalog.js'
import Logo from '../ui/Logo.jsx'

export default function Footer({ onNavigate, onSelectCategory }) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-gray-100 bg-mist">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo onClick={() => onNavigate('home')} />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-gray-500">
              Pasaulinių kvapų ikonų natos, perkurtos su juvelyriniu tikslumu. Išpilstyta Europos Sąjungoje.
            </p>
            <p className="mt-4 text-[13px] text-gray-700">labas@vaidore.com</p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Kolekcijos</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-gray-700">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <button type="button" onClick={() => onSelectCategory(category.id)} className="hover:text-black">
                    {category.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Pagalba</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-gray-700">
              <li>Pristatymas per 1–3 d. d.</li>
              <li>Nemokamas keitimas per 14 d.</li>
              <li>Pinigų grąžinimo garantija</li>
              <li>Kvapų konsultacija internetu</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Vaidore</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-gray-700">
              <li>
                <button type="button" onClick={() => onNavigate('about')} className="hover:text-black">
                  Apie mus
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('shop')} className="hover:text-black">
                  Visa parduotuvė
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('admin')} className="hover:text-black">
                  Admin panelė
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-gray-200 pt-6 text-[11px] text-gray-400 md:flex-row md:items-center md:justify-between">
          <p>© {year} Vaidore.com · Visos teisės saugomos</p>
          <div className="flex flex-wrap items-center gap-2">
            {['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'Stripe'].map((method) => (
              <span key={method} className="rounded-md border border-gray-200 bg-white px-2 py-1 font-medium text-gray-600">
                {method}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-gray-400">
          Visi minimi prekių ženklai priklauso jų savininkams. Vaidore nėra susijusi su šiais prekių ženklais ir jų
          nepristato; pavadinimai naudojami tik kvapų profiliams apibūdinti.
        </p>
      </div>
    </footer>
  )
}
