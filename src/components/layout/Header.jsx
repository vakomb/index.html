import { ChevronDown, Menu, Search, ShoppingBag, User } from 'lucide-react'
import { REGIONS } from '../../data/catalog.js'
import { DESKTOP_NAV, filterMatchesNav } from '../../data/navigation.js'
import Logo from '../ui/Logo.jsx'

function RegionSelect({ region, onChange, className = 'inline-flex' }) {
  return (
    <label className={`relative items-center ${className}`}>
      <span className="sr-only">Šalis ir valiuta</span>
      <select
        value={region}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 appearance-none rounded-md bg-transparent pl-2 pr-7 text-[14px] font-medium text-gray-800 outline-none transition hover:bg-mist focus:bg-mist"
      >
        {REGIONS.map((item) => (
          <option key={item.code} value={item.code}>
            {item.country} · {item.currency}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 text-gray-500" aria-hidden="true" />
    </label>
  )
}

function IconButton({ label, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`relative flex size-11 items-center justify-center rounded-full text-black transition hover:bg-mist active:scale-95 ${className}`}
    >
      {children}
    </button>
  )
}

export default function Header({
  route,
  shopFilter,
  onNavigate,
  onShop,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
  onOpenMenu,
  account,
  minimal = false,
}) {
  if (minimal) {
    return (
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-10">
          <Logo size="lg" onClick={() => onNavigate('home')} />
          <span className="inline-flex items-center gap-2 text-[14px] text-gray-600">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Saugus atsiskaitymas
          </span>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-3 md:h-20 md:px-10 xl:flex xl:justify-between">
        <div className="flex items-center xl:hidden">
          <IconButton label="Atidaryti meniu" onClick={onOpenMenu}>
            <Menu size={23} strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Paieška" onClick={onOpenSearch} className="md:hidden">
            <Search size={21} strokeWidth={1.5} />
          </IconButton>
        </div>

        <Logo size="lg" onClick={() => onNavigate('home')} className="justify-self-center xl:justify-self-start" />

        <nav className="hidden xl:block" aria-label="Kategorijos">
          <ul className="flex items-center gap-1">
            {DESKTOP_NAV.map((item) => {
              const active = route === 'shop' && filterMatchesNav(shopFilter, item)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onShop(item.filter)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-4 py-2 text-[15px] font-medium transition ${
                      item.accent ? 'text-sale' : active ? 'text-black' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute inset-x-4 -bottom-0.5 h-px bg-current transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-0.5">
          <IconButton label="Paieška" onClick={onOpenSearch} className="hidden md:flex">
            <Search size={21} strokeWidth={1.5} />
          </IconButton>
          <IconButton label={account ? `Paskyra: ${account.name}` : 'Prisijungti'} onClick={onOpenAccount}>
            <User size={22} strokeWidth={1.5} />
          </IconButton>
          <IconButton label={`Krepšelis, prekių: ${cartCount}`} onClick={onOpenCart}>
            <ShoppingBag size={22} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="absolute right-1 top-1 flex h-[18px] min-w-[18px] animate-pop items-center justify-center rounded-full bg-black px-1 text-[11px] font-semibold tabular-nums text-white"
              >
                {cartCount}
              </span>
            )}
          </IconButton>
        </div>
      </div>
    </header>
  )
}

export { RegionSelect }
