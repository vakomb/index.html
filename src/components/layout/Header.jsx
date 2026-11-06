import { ChevronDown, Menu, Search, ShoppingBag, User } from 'lucide-react'
import { REGIONS } from '../../data/catalog.js'
import { MAIN_NAV, filterMatchesNav } from '../../data/navigation.js'
import { formatEUR } from '../../lib/format.js'
import Logo from '../ui/Logo.jsx'

function RegionSelect({ region, onChange, className = 'inline-flex' }) {
  return (
    <label className={`relative items-center ${className}`}>
      <span className="sr-only">Šalis ir valiuta</span>
      <select
        value={region}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-md bg-transparent pl-2 pr-7 text-[12px] font-semibold text-gray-700 outline-none transition hover:bg-mist focus:bg-mist"
      >
        {REGIONS.map((item) => (
          <option key={item.code} value={item.code}>
            {item.code} · {item.currency}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2 text-gray-500" aria-hidden="true" />
    </label>
  )
}

export default function Header({
  route,
  shopFilter,
  onNavigate,
  onShop,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
  onOpenMenu,
  account,
  region,
  onRegionChange,
  minimal = false,
}) {
  if (minimal) {
    return (
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-8">
          <Logo onClick={() => onNavigate('home')} />
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Saugus atsiskaitymas
          </span>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 md:h-[68px] md:grid-cols-[auto_1fr_auto] md:gap-8 md:px-8">
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Atidaryti meniu"
            className="flex size-10 items-center justify-center rounded-md text-black transition hover:bg-mist"
          >
            <Menu size={21} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Paieška"
            className="flex size-10 items-center justify-center rounded-md text-black transition hover:bg-mist"
          >
            <Search size={19} strokeWidth={1.75} />
          </button>
        </div>

        <Logo onClick={() => onNavigate('home')} className="justify-self-center md:justify-self-start" />

        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden h-11 w-full max-w-xl items-center gap-3 justify-self-center rounded-lg border border-gray-200 bg-mist px-4 text-left text-[14px] text-gray-500 transition hover:border-gray-300 md:flex"
        >
          <Search size={17} strokeWidth={1.75} className="text-gray-700" aria-hidden="true" />
          Ieškokite kvapo, natos ar įkvėpimo — pvz., „vanilė“, „Libre“
        </button>

        <div className="flex items-center justify-end gap-0.5 md:gap-1">
          <RegionSelect region={region} onChange={onRegionChange} className="mr-1 hidden md:inline-flex" />
          <button
            type="button"
            onClick={onOpenAccount}
            aria-label={account ? `Paskyra: ${account.name}` : 'Prisijungti'}
            className="hidden h-10 items-center gap-2 rounded-md px-2.5 text-[13px] font-semibold text-black transition hover:bg-mist md:inline-flex"
          >
            <User size={19} strokeWidth={1.75} aria-hidden="true" />
            <span className="max-w-[110px] truncate">{account ? account.name.split(' ')[0] : 'Prisijungti'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenAccount}
            aria-label={account ? 'Paskyra' : 'Prisijungti'}
            className="flex size-10 items-center justify-center rounded-md text-black transition hover:bg-mist md:hidden"
          >
            <User size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Krepšelis, prekių: ${cartCount}`}
            className="relative inline-flex h-10 items-center gap-2 rounded-md px-2 text-[13px] font-semibold text-black transition hover:bg-mist active:scale-95 md:px-3"
          >
            <span className="relative">
              <ShoppingBag size={20} strokeWidth={1.75} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] animate-pop items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-white"
                >
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden tabular-nums lg:inline">{cartCount > 0 ? formatEUR(cartTotal) : 'Krepšelis'}</span>
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-black/5 md:block" aria-label="Kategorijos">
        <ul className="no-scrollbar mx-auto flex h-11 max-w-7xl items-center gap-1 overflow-x-auto px-6">
          {MAIN_NAV.map((item) => {
            const active = route === 'shop' && filterMatchesNav(shopFilter, item)
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onShop(item.filter)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative h-11 px-3 text-[13px] font-semibold transition ${
                    item.accent ? 'text-sale hover:text-red-800' : active ? 'text-black' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-current transition-opacity ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
          <li className="ml-auto shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className={`h-11 px-3 text-[13px] font-semibold transition ${
                route === 'about' ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Apie mus
            </button>
          </li>
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('reviews')}
              className={`h-11 px-3 text-[13px] font-semibold transition ${
                route === 'reviews' ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Atsiliepimai
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export { RegionSelect }
