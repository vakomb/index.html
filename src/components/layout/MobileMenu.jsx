import { ChevronRight, User, X } from 'lucide-react'
import { MAIN_NAV, POLICY_NAV, SECONDARY_NAV } from '../../data/navigation.js'
import { usePresence } from '../../hooks/usePresence.js'
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior.js'
import Logo from '../ui/Logo.jsx'
import { RegionSelect } from './Header.jsx'

export default function MobileMenu({ open, onClose, onShop, onNavigate, onOpenAccount, account, region, onRegionChange }) {
  const { mounted, visible } = usePresence(open, 400)
  useOverlayBehavior(open, onClose)
  if (!mounted) return null

  const go = (action) => {
    onClose()
    action()
  }

  return (
    <div className="fixed inset-0 z-[60] xl:hidden" role="dialog" aria-modal="true" aria-label="Meniu">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`absolute inset-y-0 left-0 flex w-[88%] max-w-md flex-col bg-white shadow-2xl transition-transform duration-400 ease-ios ${
          visible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <Logo size="lg" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti meniu"
            className="flex size-10 items-center justify-center rounded-md bg-mist"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => go(onOpenAccount)}
            className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-4 text-left"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-mist">
              <User size={18} strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">{account ? account.name : 'Prisijungti / Registruotis'}</span>
              <span className="block text-[12px] text-gray-500">
                {account ? 'Užsakymų istorija ir nustatymai' : 'Greitesnis atsiskaitymas ir užsakymų istorija'}
              </span>
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          <p className="px-5 pb-1 pt-6 text-[13px] font-medium text-gray-400">Parduotuvė</p>
          <ul>
            {MAIN_NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(() => onShop(item.filter))}
                  className={`flex w-full items-center justify-between px-5 py-3 text-left text-[20px] font-medium tracking-[-0.01em] ${
                    item.accent ? 'text-sale' : 'text-black'
                  }`}
                >
                  {item.label}
                  <ChevronRight size={16} className="text-gray-300" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <p className="px-5 pb-1 pt-8 text-[13px] font-medium text-gray-400">Vaidore</p>
          <ul>
            {[...SECONDARY_NAV, ...POLICY_NAV].map((item) => (
              <li key={item.route}>
                <button
                  type="button"
                  onClick={() => go(() => onNavigate(item.route))}
                  className="flex w-full px-5 py-2.5 text-left text-[16px] text-gray-600"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <span className="text-[12px] text-gray-500">Šalis ir valiuta</span>
          <RegionSelect region={region} onChange={onRegionChange} />
        </div>
      </aside>
    </div>
  )
}
