import { useState } from 'react'
import { Check } from 'lucide-react'
import { isValidEmail } from '../../lib/format.js'

export default function NewsletterForm({ tone = 'light', subscribed, onSubscribe }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const dark = tone === 'dark'

  if (subscribed) {
    return (
      <div
        role="status"
        className={`flex items-start gap-3 rounded-xl p-4 text-[14px] ${dark ? 'bg-white/10 text-white' : 'bg-white text-black'}`}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check size={15} strokeWidth={2.5} />
        </span>
        <span>
          Ačiū, prenumerata patvirtinta! Jūsų nuolaidos kodas: <strong className="tracking-wider">VAIDORE10</strong> — įveskite
          jį atsiskaitydami.
        </span>
      </div>
    )
  }

  const submit = (event) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setError('Įveskite teisingą el. pašto adresą')
      return
    }
    setError(null)
    onSubscribe(email.trim())
    setEmail('')
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`newsletter-${tone}`}>
          El. paštas
        </label>
        <input
          id={`newsletter-${tone}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setError(null)
          }}
          placeholder="Jūsų el. paštas"
          className={`h-14 w-0 min-w-0 flex-1 rounded-lg px-5 text-base outline-none transition md:text-[16px] ${
            dark
              ? 'border border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white'
              : 'border border-gray-200 bg-white text-black placeholder:text-gray-400 focus:border-black'
          }`}
        />
        <button
          type="submit"
          className={`h-14 shrink-0 rounded-lg px-7 text-[16px] font-medium transition active:scale-[0.97] ${
            dark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          Prenumeruoti
        </button>
      </div>
      {error && <p className={`mt-2 text-xs ${dark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>}
      <p className={`mt-3 text-[13px] ${dark ? 'text-white/40' : 'text-gray-500'}`}>
        Prenumeruodami sutinkate su privatumo politika. Atsisakyti galite bet kada.
      </p>
    </form>
  )
}
