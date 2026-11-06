import { ArrowRight, Check, Mail, Package, Truck } from 'lucide-react'
import { firstName, formatEUR } from '../lib/format.js'
import SmartImage from '../components/ui/SmartImage.jsx'

function SuccessMark() {
  return (
    <div className="relative mx-auto size-24">
      <span className="absolute inset-0 animate-ring rounded-full bg-emerald-500/40" aria-hidden="true" />
      <span className="absolute inset-0 animate-ring rounded-full bg-emerald-500/25 [animation-delay:0.9s]" aria-hidden="true" />
      <div className="relative flex size-24 animate-scale-in items-center justify-center rounded-full bg-black shadow-2xl shadow-black/20">
        <svg viewBox="0 0 52 52" className="size-12" aria-hidden="true">
          <path
            d="M15 27.5 L22.5 35 L38 18"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw"
            style={{ strokeDasharray: 40, strokeDashoffset: 40 }}
          />
        </svg>
      </div>
    </div>
  )
}

const TIMELINE = [
  { icon: Check, label: 'Užsakymas gautas', done: true },
  { icon: Package, label: 'Ruošiama siunta', done: false },
  { icon: Truck, label: 'Išsiųsta', done: false },
]

export default function SuccessView({ order, onNavigate }) {
  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Užsakymų nerasta</h1>
        <p className="mt-2 text-sm text-gray-500">Atrodo, kad šis puslapis buvo atnaujintas. Grįžkite į parduotuvę.</p>
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="mt-7 h-12 rounded-lg bg-black px-7 text-sm font-medium text-white"
        >
          Į parduotuvę
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-12 md:pt-20">
      <div className="text-center">
        <SuccessMark />
        <p className="mt-8 animate-fade-up text-[11px] font-medium uppercase tracking-[0.24em] text-gray-500 [animation-delay:0.3s]">
          Užsakymas {order.id}
        </p>
        <h1 className="mt-3 animate-fade-up font-serif text-[42px] font-medium leading-[1.02] tracking-tight [animation-delay:0.4s] md:text-6xl">
          Užsakymas sėkmingai gautas
        </h1>
        <p className="mx-auto mt-4 max-w-md animate-fade-up text-[15px] leading-relaxed text-gray-600 [animation-delay:0.5s]">
          Ačiū, {firstName(order.customer.name)}! Jūsų kvapas jau ruošiamas kelionei. Patvirtinimą išsiuntėme adresu{' '}
          <span className="font-medium text-black">{order.customer.email}</span>.
        </p>
      </div>

      <div className="mt-10 animate-fade-up rounded-[28px] border border-gray-100 p-5 shadow-xl shadow-black/[0.04] [animation-delay:0.6s] md:p-7">
        <ol className="grid grid-cols-3 gap-2">
          {TIMELINE.map((item, index) => {
            const Icon = item.icon
            return (
              <li key={item.label} className="flex flex-col items-center text-center">
                <span
                  className={`flex size-10 items-center justify-center rounded-full ${
                    item.done ? 'bg-emerald-600 text-white' : 'bg-smoke text-gray-400'
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className={`mt-2 text-[11px] ${index === 0 ? 'font-semibold text-black' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mt-6 grid gap-3 rounded-2xl bg-mist p-4 text-[13px] sm:grid-cols-2">
          <div>
            <p className="text-gray-500">Pristatymas</p>
            <p className="mt-0.5 font-medium">{order.delivery.methodLabel}</p>
            <p className="text-gray-600">{order.delivery.destination}</p>
          </div>
          <div>
            <p className="text-gray-500">Numatoma pristatymo data</p>
            <p className="mt-0.5 font-medium">{order.delivery.eta}</p>
            <p className="text-gray-600">
              Apmokėta: {order.payment.brand} •••• {order.payment.last4}
            </p>
          </div>
        </div>

        <ul className="mt-6 divide-y divide-gray-100">
          {order.lines.map((line) => (
            <li key={line.key} className="flex items-center gap-3 py-3">
              <SmartImage src={line.image} alt="" sizes="56px" className="h-16 w-13 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{line.name}</p>
                <p className="text-xs text-gray-500">
                  {line.sizeLabel} · {line.qty} vnt.
                </p>
              </div>
              <p className="text-[13px] font-medium tabular-nums">{formatEUR(line.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-4 text-[13px]">
          <div className="flex justify-between text-gray-600">
            <span>Tarpinė suma</span>
            <span className="tabular-nums">{formatEUR(order.totals.subtotal)}</span>
          </div>
          {order.totals.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Nuolaida ({order.promoCode})</span>
              <span className="tabular-nums">−{formatEUR(order.totals.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Pristatymas</span>
            <span className="tabular-nums">
              {order.totals.shipping === 0 ? 'Nemokamas' : formatEUR(order.totals.shipping)}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <span>Iš viso</span>
            <span className="tabular-nums">{formatEUR(order.totals.total)}</span>
          </div>
          <p className="text-right text-[11px] text-gray-500">PVM įskaičiuotas: {formatEUR(order.totals.vat)}</p>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-black p-4 text-white">
        <Mail size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-white/80">
          Kai siunta bus perduota kurjeriui, atsiųsime sekimo nuorodą. Prie užsakymo pridėsime nemokamą kvapo
          mėginuką — galbūt tai bus jūsų kitas mėgstamiausias.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="flex h-13 flex-1 items-center justify-center gap-2 rounded-lg bg-black text-[15px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
        >
          Tęsti apsipirkimą <ArrowRight size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className="flex h-13 flex-1 items-center justify-center rounded-lg border border-gray-200 text-[15px] font-medium transition hover:border-black"
        >
          Peržiūrėti Admin panelėje
        </button>
      </div>
    </div>
  )
}
