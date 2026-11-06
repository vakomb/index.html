import { useState } from 'react'
import { Gift, LogOut, Package, Timer, User, X, Zap } from 'lucide-react'
import { formatDateLong, formatEUR, isValidEmail } from '../../lib/format.js'
import { usePresence } from '../../hooks/usePresence.js'
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior.js'
import { TextField } from '../ui/Field.jsx'

// Demonstracinė paskyra: duomenys saugomi tik naršyklėje.
// Gyvai parduotuvei prijunkite tikrą autentifikaciją (pvz., Supabase Auth).
export default function AccountDrawer({ open, onClose, account, orders, onLogin, onLogout }) {
  const { mounted, visible } = usePresence(open, 420)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  useOverlayBehavior(open, onClose)

  if (!mounted) return null

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    if (!isValidEmail(form.email)) next.email = 'Įveskite teisingą el. pašto adresą'
    if (form.password.length < 6) next.password = 'Slaptažodis turi būti bent 6 simbolių'
    if (mode === 'register' && form.name.trim().split(/\s+/).length < 2) next.name = 'Įveskite vardą ir pavardę'
    setErrors(next)
    if (Object.keys(next).length) return
    const fallbackName = form.email.split('@')[0].replace(/[._-]+/g, ' ')
    onLogin({
      email: form.email.trim().toLowerCase(),
      name: mode === 'register' ? form.name.trim() : fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
    })
    setForm({ name: '', email: '', password: '' })
  }

  const myOrders = account ? orders.filter((order) => order.customer.email.toLowerCase() === account.email) : []

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Paskyra">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-500 ease-ios ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))]">
          <h2 className="text-lg font-bold tracking-tight">{account ? 'Mano paskyra' : 'Prisijungimas'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti"
            className="flex size-10 items-center justify-center rounded-md bg-mist transition hover:bg-smoke"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {account ? (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-mist p-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-black text-white">
                  <User size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold">Sveiki, {account.name.split(' ')[0]}!</p>
                  <p className="truncate text-[13px] text-gray-500">{account.email}</p>
                </div>
              </div>

              <h3 className="mt-6 text-[13px] font-bold uppercase tracking-[0.12em] text-gray-400">Mano užsakymai</h3>
              {myOrders.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-gray-200 p-5 text-center text-[13px] text-gray-500">
                  Užsakymų dar nėra. Atsiskaitykite su šiuo el. paštu ir jie atsiras čia.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {myOrders.map((order) => (
                    <li key={order.id} className="rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="inline-flex items-center gap-2 text-[14px] font-bold">
                          <Package size={15} aria-hidden="true" />
                          {order.id}
                        </p>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Apmokėta
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-gray-500">
                        {formatDateLong(order.createdAt)} · {order.lines.length} prek. · {formatEUR(order.totals.total)}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-gray-600">{order.lines.map((line) => line.name).join(', ')}</p>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg border border-gray-200 px-4 text-[13px] font-semibold text-gray-700 transition hover:border-black"
              >
                <LogOut size={15} aria-hidden="true" />
                Atsijungti
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 rounded-lg bg-mist p-1" role="tablist">
                {[
                  { id: 'login', label: 'Prisijungti' },
                  { id: 'register', label: 'Registruotis' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === tab.id}
                    onClick={() => {
                      setMode(tab.id)
                      setErrors({})
                    }}
                    className={`h-10 rounded-md text-[13px] font-semibold transition ${
                      mode === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} noValidate className="mt-5 grid gap-4">
                {mode === 'register' && (
                  <TextField
                    id="account-name"
                    label="Vardas ir pavardė"
                    autoComplete="name"
                    value={form.name}
                    onChange={setField('name')}
                    error={errors.name}
                  />
                )}
                <TextField
                  id="account-email"
                  label="El. paštas"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={setField('email')}
                  error={errors.email}
                />
                <TextField
                  id="account-password"
                  label="Slaptažodis"
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={form.password}
                  onChange={setField('password')}
                  error={errors.password}
                />
                <button
                  type="submit"
                  className="h-12 rounded-lg bg-black text-[14px] font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
                >
                  {mode === 'register' ? 'Sukurti paskyrą' : 'Prisijungti'}
                </button>
              </form>

              <ul className="mt-6 space-y-3 text-[13px] text-gray-700">
                <li className="flex items-center gap-3">
                  <Zap size={16} aria-hidden="true" /> Greitesnis atsiskaitymas — duomenys užpildomi automatiškai
                </li>
                <li className="flex items-center gap-3">
                  <Timer size={16} aria-hidden="true" /> Visų užsakymų istorija vienoje vietoje
                </li>
                <li className="flex items-center gap-3">
                  <Gift size={16} aria-hidden="true" /> −10 % gimtadienio proga
                </li>
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
