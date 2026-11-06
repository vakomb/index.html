import { useState } from 'react'
import { Check } from 'lucide-react'
import { INFO_PAGES } from '../data/pages.js'
import { POLICY_NAV } from '../data/navigation.js'
import { isValidEmail } from '../lib/format.js'
import { TextArea, TextField } from '../components/ui/Field.jsx'

function ContactForm({ subject }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl bg-emerald-50 p-5 text-[14px] text-emerald-900">
        <Check size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        Ačiū! Žinutę gavome ir atsakysime per kelias darbo valandas.
      </div>
    )
  }

  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Įveskite vardą'
    if (!isValidEmail(form.email)) next.email = 'Įveskite teisingą el. pašto adresą'
    if (form.message.trim().length < 10) next.message = 'Žinutė turi būti bent 10 simbolių'
    setErrors(next)
    if (Object.keys(next).length === 0) setSent(true)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-xl border border-gray-100 p-5 md:p-6">
      <p className="text-[15px] font-bold">{subject}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Vardas" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <TextField
          label="El. paštas"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
      </div>
      <TextArea label="Žinutė" rows={4} value={form.message} onChange={set('message')} error={errors.message} />
      <button
        type="submit"
        className="h-12 rounded-lg bg-black text-[14px] font-bold text-white transition hover:bg-gray-800 active:scale-[0.98]"
      >
        Siųsti žinutę
      </button>
    </form>
  )
}

export default function InfoView({ route, onNavigate }) {
  const page = INFO_PAGES[route]
  if (!page) return null
  const isPolicy = POLICY_NAV.some((item) => item.route === route)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
      <div className={isPolicy ? 'md:grid md:grid-cols-[220px_1fr] md:gap-12' : ''}>
        {isPolicy && (
          <aside className="mb-6 md:mb-0" aria-label="Informacija">
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:sticky md:top-[132px] md:mx-0 md:flex-col md:gap-1 md:px-0">
              {POLICY_NAV.map((item) => (
                <li key={item.route} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.route)}
                    aria-current={item.route === route ? 'page' : undefined}
                    className={`w-full rounded-lg px-3 py-2 text-left text-[13px] font-bold transition md:text-[14px] ${
                      item.route === route ? 'bg-black text-white' : 'bg-mist text-gray-700 md:bg-transparent md:hover:bg-mist'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <article className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">{page.eyebrow}</p>
          <h1 className="mt-2 text-[30px] font-extrabold tracking-tight md:text-[40px]">{page.title}</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-gray-600">{page.intro}</p>

          {page.contacts && (
            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              {page.contacts.map((item) => (
                <div key={item.label} className="rounded-xl bg-mist p-4">
                  <dt className="text-[12px] text-gray-500">{item.label}</dt>
                  <dd className="mt-1 text-[15px] font-bold">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {page.sections?.map((section) => (
            <section key={section.title} className="mt-8">
              <h2 className="text-[18px] font-extrabold tracking-tight">{section.title}</h2>
              {section.text && <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{section.text}</p>}
              {section.list && (
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-gray-700">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
              {section.table && (
                <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full min-w-[480px] text-left text-[14px]">
                    <thead className="bg-mist text-[12px] uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-bold">Būdas</th>
                        <th className="px-4 py-3 font-bold">Trukmė</th>
                        <th className="px-4 py-3 font-bold">Kaina</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {section.table.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, index) => (
                            <td key={cell} className={`px-4 py-3 ${index === 0 ? 'font-bold' : 'text-gray-700'}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {page.form && (
            <div className="mt-10">
              <ContactForm subject={route === 'partners' ? 'Pateikite partnerystės užklausą' : 'Parašykite mums'} />
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
