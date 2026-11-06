import { Compass, LayoutDashboard, ShoppingBag, Store } from 'lucide-react'

// Autentiška iOS stiliaus apatinė navigacija mobiliesiems įrenginiams.
export default function TabBar({ route, cartOpen, cartCount, onNavigate, onOpenCart }) {
  const tabs = [
    { id: 'home', label: 'Atrasti', icon: Compass, onSelect: () => onNavigate('home') },
    { id: 'shop', label: 'Parduotuvė', icon: Store, onSelect: () => onNavigate('shop') },
    { id: 'cart', label: 'Krepšelis', icon: ShoppingBag, onSelect: onOpenCart, badge: cartCount },
    { id: 'admin', label: 'Admin panelė', icon: LayoutDashboard, onSelect: () => onNavigate('admin') },
  ]

  const activeId = cartOpen ? 'cart' : route === 'success' ? 'home' : route

  return (
    <nav
      aria-label="Apatinė navigacija"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/85 backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeId === tab.id
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={tab.onSelect}
                aria-current={active ? 'page' : undefined}
                className={`relative flex w-full flex-col items-center gap-1 pb-1.5 pt-2.5 transition-colors active:scale-95 ${
                  active ? 'text-black' : 'text-gray-400'
                }`}
              >
                <span
                  className={`absolute top-0 h-[3px] rounded-b-full bg-black transition-all duration-300 ease-ios ${
                    active ? 'w-7 opacity-100' : 'w-0 opacity-0'
                  }`}
                  aria-hidden="true"
                />
                <span className="relative">
                  <Icon size={23} strokeWidth={active ? 2 : 1.6} aria-hidden="true" />
                  {tab.badge > 0 && (
                    <span
                      key={tab.badge}
                      className="absolute -right-2.5 -top-1.5 flex h-[17px] min-w-[17px] animate-pop items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold tabular-nums text-white ring-2 ring-white"
                    >
                      {tab.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none tracking-tight">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
