import { BookOpen, ShoppingBag } from 'lucide-react'
import Logo from '../ui/Logo.jsx'

const NAV = [
  { route: 'home', label: 'Atrasti' },
  { route: 'shop', label: 'Parduotuvė' },
  { route: 'about', label: 'Apie mus' },
  { route: 'admin', label: 'Admin panelė' },
]

export default function Header({ route, onNavigate, cartCount, onOpenCart, minimal = false }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 md:h-16 md:px-8">
        <Logo onClick={() => onNavigate('home')} />

        {!minimal && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Pagrindinė navigacija">
            {NAV.map((item) => {
              const active = route === item.route
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition ${
                    active ? 'bg-black text-white' : 'text-gray-600 hover:bg-smoke hover:text-black'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        )}

        <div className="flex items-center gap-1">
          {minimal ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Saugus atsiskaitymas
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                aria-label="Apie mus"
                className={`flex size-10 items-center justify-center rounded-full transition hover:bg-smoke md:hidden ${
                  route === 'about' ? 'text-black' : 'text-gray-600'
                }`}
              >
                <BookOpen size={19} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={onOpenCart}
                aria-label={`Krepšelis, prekių: ${cartCount}`}
                className="relative flex size-10 items-center justify-center rounded-full text-black transition hover:bg-smoke active:scale-90"
              >
                <ShoppingBag size={20} strokeWidth={1.6} />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] animate-pop items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold tabular-nums text-white ring-2 ring-white"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
