import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown, CreditCard, Lock, MapPin, ShieldCheck, ShoppingBag } from 'lucide-react'
import { COUNTRIES, PARCEL_LOCKERS, PROMO_CODES, SHIPPING_METHODS } from '../data/catalog.js'
import {
  CARD_BRAND_LABEL,
  cardNumberLength,
  detectCardBrand,
  formatCardNumber,
  formatDeliveryWindow,
  formatEUR,
  formatExpiry,
  isExpiryValid,
  isValidEmail,
  isValidPhone,
  isValidPostcode,
  luhnCheck,
  onlyDigits,
} from '../lib/format.js'
import { computeTotals, shippingPriceFor } from '../lib/pricing.js'
import { SelectField, TextField } from '../components/ui/Field.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import CheckoutStep from '../components/checkout/CheckoutStep.jsx'
import OrderSummary from '../components/checkout/OrderSummary.jsx'

const INITIAL_FORM = {
  email: '',
  name: '',
  phone: '',
  marketing: true,
  country: 'Lietuva',
  method: 'omniva',
  locker: '',
  address: '',
  city: '',
  postcode: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
  cardName: '',
}

const STEP_TITLES = ['Kontaktai', 'Pristatymas', 'Mokėjimas']

function validateContacts(form) {
  const errors = {}
  if (!isValidEmail(form.email)) errors.email = 'Įveskite teisingą el. pašto adresą'
  if (form.name.trim().split(/\s+/).length < 2) errors.name = 'Įveskite vardą ir pavardę'
  if (!isValidPhone(form.phone)) errors.phone = 'Įveskite telefono numerį, pvz., +370 600 00000'
  return errors
}

function validateDelivery(form) {
  const errors = {}
  if (form.method === 'omniva') {
    if (!form.locker) errors.locker = 'Pasirinkite paštomatą'
  } else {
    if (form.address.trim().length < 4) errors.address = 'Įveskite gatvę ir namo numerį'
    if (form.city.trim().length < 2) errors.city = 'Įveskite miestą'
    if (!isValidPostcode(form.postcode)) errors.postcode = 'Pašto kodas, pvz., LT-01100'
  }
  return errors
}

function validatePayment(form) {
  const errors = {}
  const brand = detectCardBrand(form.cardNumber)
  const digits = onlyDigits(form.cardNumber)
  if (digits.length !== cardNumberLength(brand) || !luhnCheck(digits)) {
    errors.cardNumber = 'Neteisingas kortelės numeris'
  }
  if (!isExpiryValid(form.expiry)) errors.expiry = 'Neteisinga galiojimo data'
  if (onlyDigits(form.cvc).length !== (brand === 'amex' ? 4 : 3)) errors.cvc = 'Neteisingas CVC kodas'
  if (form.cardName.trim().length < 3) errors.cardName = 'Įveskite vardą, nurodytą ant kortelės'
  return errors
}

const VALIDATORS = [validateContacts, validateDelivery, validatePayment]

function BrandMark({ brand, active }) {
  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition ${
        active ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-400'
      }`}
    >
      {brand === 'mastercard' ? 'MC' : brand === 'amex' ? 'AMEX' : 'VISA'}
    </span>
  )
}

export default function CheckoutView({ lines, onPlaceOrder, onBackToCart, onNavigate }) {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [promoCode, setPromoCode] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const deliveryChosen = completed.includes(1) || step >= 1
  const totals = useMemo(
    () => computeTotals(lines, { shippingMethodId: deliveryChosen ? form.method : null, promoCode }),
    [lines, form.method, promoCode, deliveryChosen],
  )

  const brand = detectCardBrand(form.cardNumber)
  const method = SHIPPING_METHODS.find((item) => item.id === form.method)

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setField(field, event.target.value),
    error: errors[field],
  })

  const focusFirstError = (nextErrors) => {
    const first = Object.keys(nextErrors)[0]
    if (!first) return
    window.requestAnimationFrame(() => document.getElementById(`checkout-${first}`)?.focus())
  }

  const goNext = (index) => {
    const nextErrors = VALIDATORS[index](form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors)
      return
    }
    setCompleted((current) => (current.includes(index) ? current : [...current, index]))
    setStep(index + 1)
  }

  const editStep = (index) => {
    if (processing) return
    setErrors({})
    setStep(index)
  }

  const applyPromo = (raw) => {
    const normalized = raw.trim().toUpperCase()
    if (PROMO_CODES[normalized]) {
      setPromoCode(normalized)
      return { ok: true, text: `Pritaikyta: ${PROMO_CODES[normalized].label}` }
    }
    return { ok: false, text: 'Toks nuolaidos kodas negalioja' }
  }

  const pay = (event) => {
    event.preventDefault()
    if (processing) return
    const allErrors = { ...validateContacts(form), ...validateDelivery(form), ...validatePayment(form) }
    const contactErrors = validateContacts(form)
    const deliveryErrors = validateDelivery(form)
    if (Object.keys(contactErrors).length) {
      setErrors(contactErrors)
      setStep(0)
      focusFirstError(contactErrors)
      return
    }
    if (Object.keys(deliveryErrors).length) {
      setErrors(deliveryErrors)
      setStep(1)
      focusFirstError(deliveryErrors)
      return
    }
    if (Object.keys(allErrors).length) {
      setErrors(allErrors)
      focusFirstError(allErrors)
      return
    }

    setProcessing(true)
    const finalTotals = computeTotals(lines, { shippingMethodId: form.method, promoCode })
    timer.current = window.setTimeout(() => {
      onPlaceOrder({
        customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), marketing: form.marketing },
        delivery: {
          methodId: form.method,
          methodLabel: method.label,
          country: form.country,
          city: form.method === 'omniva' ? form.locker.split(' — ')[0] : form.city.trim(),
          destination:
            form.method === 'omniva'
              ? form.locker
              : `${form.address.trim()}, ${form.postcode.trim().toUpperCase()} ${form.city.trim()}`,
          eta: formatDeliveryWindow(method.eta),
        },
        payment: {
          brand: CARD_BRAND_LABEL[brand] ?? 'Kortelė',
          last4: onlyDigits(form.cardNumber).slice(-4),
        },
        promoCode,
        totals: finalTotals,
      })
    }, 1500)
  }

  if (lines.length === 0 && !processing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-mist">
          <ShoppingBag size={30} strokeWidth={1.25} aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-serif text-4xl">Krepšelis tuščias</h1>
        <p className="mt-2 text-sm text-gray-500">Pridėkite bent vieną kvapą, kad galėtumėte atsiskaityti.</p>
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="mt-7 h-12 rounded-full bg-black px-7 text-sm font-medium text-white"
        >
          Į parduotuvę
        </button>
      </div>
    )
  }

  const contactSummary = `${form.email} · ${form.phone}`
  const deliverySummary = `${method.label} · ${
    form.method === 'omniva' ? form.locker : `${form.address}, ${form.city}`
  } · ${shippingPriceFor(method, totals.subtotal) === 0 ? 'Nemokamai' : formatEUR(method.price)}`

  const summaryProps = {
    lines,
    totals,
    shippingSelected: deliveryChosen,
    promoCode,
    onApplyPromo: applyPromo,
    onRemovePromo: () => setPromoCode(null),
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <button
        type="button"
        onClick={onBackToCart}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-black"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Grįžti į krepšelį
      </button>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">Atsiskaitymas</h1>
        <ol className="flex items-center gap-2 text-[12px]" aria-label="Atsiskaitymo eiga">
          {STEP_TITLES.map((title, index) => {
            const done = completed.includes(index) && step !== index
            const current = step === index
            return (
              <li key={title} className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 font-medium transition ${
                    current ? 'bg-black text-white' : done ? 'bg-emerald-50 text-emerald-700' : 'bg-smoke text-gray-400'
                  }`}
                >
                  {title}
                </span>
                {index < STEP_TITLES.length - 1 && <span className="h-px w-4 bg-gray-200" aria-hidden="true" />}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-6 lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((value) => !value)}
          aria-expanded={summaryOpen}
          className="flex w-full items-center justify-between rounded-2xl bg-mist px-4 py-3.5 text-[13px] font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag size={16} aria-hidden="true" />
            {summaryOpen ? 'Slėpti užsakymo santrauką' : 'Rodyti užsakymo santrauką'}
            <ChevronDown size={15} className={`transition-transform ${summaryOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tabular-nums">{formatEUR(totals.total)}</span>
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-ios ${
            summaryOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-3">
              <OrderSummary {...summaryProps} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        <form onSubmit={pay} noValidate className="space-y-3">
          <fieldset disabled={processing} className="space-y-3">
            <CheckoutStep
              index={0}
              title="Kontaktai"
              active={step === 0}
              complete={completed.includes(0)}
              summary={contactSummary}
              onEdit={() => editStep(0)}
            >
              <div className="grid gap-4">
                <TextField
                  id="checkout-email"
                  label="El. paštas"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="vardas@pastas.lt"
                  hint="Čia atsiųsime užsakymo patvirtinimą ir siuntos sekimo nuorodą."
                  {...bind('email')}
                />
                <TextField
                  id="checkout-name"
                  label="Vardas ir pavardė"
                  autoComplete="name"
                  placeholder="Gabija Kazlauskienė"
                  {...bind('name')}
                />
                <TextField
                  id="checkout-phone"
                  label="Telefono numeris"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+370 600 00000"
                  hint="Kurjeris paskambins tik prireikus."
                  {...bind('phone')}
                />
                <label className="flex items-start gap-3 rounded-2xl bg-mist p-3.5 text-[13px] text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.marketing}
                    onChange={(event) => setField('marketing', event.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-black"
                  />
                  <span>Noriu gauti išskirtinius pasiūlymus ir naujų kvapų anonsus (−10 % kitam užsakymui).</span>
                </label>
                <button
                  type="button"
                  onClick={() => goNext(0)}
                  className="h-12 rounded-full bg-black text-[15px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
                >
                  Tęsti į pristatymą
                </button>
              </div>
            </CheckoutStep>

            <CheckoutStep
              index={1}
              title="Pristatymas"
              active={step === 1}
              complete={completed.includes(1)}
              locked={!completed.includes(0)}
              summary={deliverySummary}
              onEdit={() => editStep(1)}
            >
              <div className="grid gap-4">
                <SelectField id="checkout-country" label="Šalis" {...bind('country')}>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </SelectField>

                <fieldset>
                  <legend className="mb-2 text-[13px] font-medium text-gray-700">Pristatymo būdas</legend>
                  <div className="grid gap-2">
                    {SHIPPING_METHODS.map((option) => {
                      const selected = form.method === option.id
                      const price = shippingPriceFor(option, totals.subtotal)
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                            selected ? 'border-black bg-white ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipping-method"
                            value={option.id}
                            checked={selected}
                            onChange={() => setField('method', option.id)}
                            className="size-4 shrink-0 accent-black"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-medium">{option.label}</span>
                            <span className="block text-xs text-gray-500">
                              {option.description} · pristatysime {formatDeliveryWindow(option.eta)}
                            </span>
                          </span>
                          <span className={`shrink-0 text-[13px] font-semibold tabular-nums ${price === 0 ? 'text-emerald-700' : ''}`}>
                            {price === 0 ? 'Nemokamai' : formatEUR(price)}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                {form.method === 'omniva' ? (
                  <SelectField
                    id="checkout-locker"
                    label="Omniva paštomatas"
                    hint="Siuntą galėsite atsiimti 7 dienas nuo pristatymo."
                    {...bind('locker')}
                  >
                    <option value="">Pasirinkite paštomatą…</option>
                    {PARCEL_LOCKERS.map((locker) => (
                      <option key={locker} value={locker}>
                        {locker}
                      </option>
                    ))}
                  </SelectField>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-6">
                    <TextField
                      id="checkout-address"
                      className="sm:col-span-6"
                      label="Adresas"
                      autoComplete="street-address"
                      placeholder="Gedimino pr. 9-12"
                      trailing={<MapPin size={16} className="text-gray-400" aria-hidden="true" />}
                      {...bind('address')}
                    />
                    <TextField
                      id="checkout-city"
                      className="sm:col-span-4"
                      label="Miestas"
                      autoComplete="address-level2"
                      placeholder="Vilnius"
                      {...bind('city')}
                    />
                    <TextField
                      id="checkout-postcode"
                      className="sm:col-span-2"
                      label="Pašto kodas"
                      autoComplete="postal-code"
                      placeholder="LT-01103"
                      {...bind('postcode')}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => goNext(1)}
                  className="h-12 rounded-full bg-black text-[15px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
                >
                  Tęsti į mokėjimą
                </button>
              </div>
            </CheckoutStep>

            <CheckoutStep
              index={2}
              title="Mokėjimas"
              active={step === 2}
              complete={false}
              locked={!completed.includes(1)}
              onEdit={() => editStep(2)}
            >
              <div className="rounded-2xl border border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-[14px] font-medium">
                    <CreditCard size={17} strokeWidth={1.75} aria-hidden="true" />
                    Mokėjimo kortelė
                  </p>
                  <div className="flex gap-1" aria-hidden="true">
                    <BrandMark brand="visa" active={brand === 'visa'} />
                    <BrandMark brand="mastercard" active={brand === 'mastercard'} />
                    <BrandMark brand="amex" active={brand === 'amex'} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="checkout-cardNumber"
                    className="sm:col-span-2"
                    label="Kortelės numeris"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 1234 1234 1234"
                    inputClassName="tracking-wider tabular-nums"
                    trailing={
                      brand ? (
                        <span className="rounded-md bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                          {CARD_BRAND_LABEL[brand]}
                        </span>
                      ) : (
                        <Lock size={15} className="text-gray-300" aria-hidden="true" />
                      )
                    }
                    value={form.cardNumber}
                    error={errors.cardNumber}
                    onChange={(event) => setField('cardNumber', formatCardNumber(event.target.value))}
                  />
                  <TextField
                    id="checkout-expiry"
                    label="Galiojimo data"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / MM"
                    inputClassName="tabular-nums"
                    value={form.expiry}
                    error={errors.expiry}
                    onChange={(event) => setField('expiry', formatExpiry(event.target.value))}
                  />
                  <TextField
                    id="checkout-cvc"
                    label="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder={brand === 'amex' ? '4 skaitmenys' : '3 skaitmenys'}
                    inputClassName="tabular-nums"
                    value={form.cvc}
                    error={errors.cvc}
                    onChange={(event) =>
                      setField('cvc', onlyDigits(event.target.value).slice(0, brand === 'amex' ? 4 : 3))
                    }
                  />
                  <TextField
                    id="checkout-cardName"
                    className="sm:col-span-2"
                    label="Vardas ir pavardė ant kortelės"
                    autoComplete="cc-name"
                    placeholder="GABIJA KAZLAUSKIENE"
                    {...bind('cardName')}
                  />
                </div>
                <p className="mt-3 rounded-xl bg-mist px-3.5 py-2.5 text-xs text-gray-500">
                  Demonstracinė versija: naudokite 4242 4242 4242 4242, bet kokią būsimą datą ir bet kokį CVC.
                </p>
              </div>

              <button
                type="submit"
                className="mt-5 flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-black text-[16px] font-medium text-white shadow-xl shadow-black/15 transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-wait disabled:bg-gray-800"
              >
                {processing ? (
                  <>
                    <Spinner className="size-5" />
                    Apdorojamas mokėjimas…
                  </>
                ) : (
                  <>
                    <Lock size={17} aria-hidden="true" />
                    Mokėti dabar · {formatEUR(totals.total)}
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-500">
                <ShieldCheck size={13} aria-hidden="true" />
                Mokėjimus saugiai apdoroja Stripe. Kortelės duomenys nesaugomi Vaidore serveriuose.
              </p>
            </CheckoutStep>
          </fieldset>
        </form>

        <aside className="hidden lg:block" aria-label="Užsakymo santrauka">
          <div className="sticky top-24">
            <OrderSummary {...summaryProps} />
            <ul className="mt-4 space-y-2 px-1 text-[12px] text-gray-500">
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} aria-hidden="true" /> 100 % kokybės garantija arba pinigų grąžinimas
              </li>
              <li className="flex items-center gap-2">
                <Lock size={14} aria-hidden="true" /> 256 bitų SSL šifravimas
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
