import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Lock,
  CreditCard,
  Check,
  ChevronDown,
  Loader2,
  Droplets,
  ArrowLeft,
  PartyPopper,
} from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, UPSELL_OIL, VAT_RATE, formatEur, formatPrice, IMAGES } from '../data/catalog';
import ProductImage from './ProductImage';

/* ------------------------------------------------------------------ */
/* Kortelės formatavimo ir validavimo pagalbininkai                    */
/* ------------------------------------------------------------------ */

const onlyDigits = (v) => v.replace(/\D/g, '');

const detectBrand = (digits) => {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return null;
};

const formatCardNumber = (value) => {
  const digits = onlyDigits(value);
  const brand = detectBrand(digits);
  if (brand === 'amex') {
    const d = digits.slice(0, 15);
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
  }
  return digits
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
};

const formatExpiry = (value, prev) => {
  let digits = onlyDigits(value).slice(0, 4);
  // „5“ -> „05/“ patogumui
  if (digits.length === 1 && Number(digits) > 1) digits = `0${digits}`;
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  // leidžiame ištrinti „/“
  if (digits.length === 2 && !(prev && prev.length > value.length)) return `${digits}/`;
  return digits;
};

const formatPostal = (value) => {
  const digits = onlyDigits(value.replace(/^LT-?/i, '')).slice(0, 5);
  return digits ? `LT-${digits}` : '';
};

const luhnValid = (digits) => {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return digits.length >= 13 && sum % 10 === 0;
};

const expiryValid = (exp) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(exp);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const BRAND_LABEL = { visa: 'VISA', mastercard: 'Mastercard', amex: 'AMEX' };

const EMPTY_FORM = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  postal: '',
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

/* ------------------------------------------------------------------ */
/* Pagalbiniai komponentai                                             */
/* ------------------------------------------------------------------ */

function Field({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      <span className="input-label">{label}</span>
      {children}
      {error && (
        <p className="mt-1 text-[11px] font-semibold text-brand-sale" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Step({ index, title, summary, active, done, onEdit, children }) {
  return (
    <div className={`rounded-2xl border transition ${active ? 'border-black' : 'border-brand-line'}`}>
      <button
        type="button"
        onClick={onEdit}
        disabled={!done || active}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left disabled:cursor-default"
        aria-expanded={active}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
            done && !active ? 'bg-brand-green text-white' : active ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          {done && !active ? <Check className="h-4 w-4" strokeWidth={3} /> : index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-extrabold uppercase tracking-[0.14em]">{title}</span>
          {done && !active && summary && <span className="block truncate text-xs text-neutral-500">{summary}</span>}
        </span>
        {done && !active && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 underline underline-offset-2">Keisti</span>
        )}
        {!done && !active && <ChevronDown className="h-4 w-4 text-neutral-300" />}
      </button>
      <div className={`grid transition-all duration-300 ${active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagrindinis komponentas                                             */
/* ------------------------------------------------------------------ */

export default function CartDrawer({
  open,
  onClose,
  items,
  totals,
  upsell,
  onToggleUpsell,
  onUpdateQty,
  onRemove,
  onPlaceOrder,
}) {
  const [stage, setStage] = useState('cart'); // cart | checkout | success
  const [step, setStep] = useState(1);
  const [doneSteps, setDoneSteps] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const panelRef = useRef(null);
  const scrollRef = useRef(null);

  const itemCount = items.reduce((s, it) => s + it.qty, 0);
  const brand = detectBrand(onlyDigits(form.cardNumber));
  const progress = Math.min(100, (totals.merchandise / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !processing) onClose();
    };
    window.addEventListener('keydown', onKey);
    if (panelRef.current) panelRef.current.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, processing]);

  // Po sėkmingo užsakymo uždarius krepšelį – grįžtame į pradinę būseną.
  useEffect(() => {
    if (!open && stage === 'success') {
      const t = window.setTimeout(() => {
        setStage('cart');
        setPlacedOrder(null);
      }, 350);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open, stage]);

  // Jei krepšelis ištuštėja atsiskaitymo metu – grąžiname į krepšelio vaizdą.
  useEffect(() => {
    if (stage === 'checkout' && items.length === 0) setStage('cart');
  }, [items.length, stage]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [stage]);

  const set = (key) => (e) => {
    const raw = e.target.value;
    let value = raw;
    if (key === 'cardNumber') value = formatCardNumber(raw);
    if (key === 'expiry') value = formatExpiry(raw, form.expiry);
    if (key === 'cvc') value = onlyDigits(raw).slice(0, brand === 'amex' ? 4 : 3);
    if (key === 'postal') value = formatPostal(raw);
    if (key === 'phone') value = raw.replace(/[^\d+\s]/g, '').slice(0, 16);
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = (which) => {
    const er = {};
    if (which === 1) {
      if (!EMAIL_RE.test(form.email.trim())) er.email = 'Įveskite teisingą el. paštą';
      if (onlyDigits(form.phone).length < 8) er.phone = 'Įveskite telefono numerį';
    }
    if (which === 2) {
      if (!form.firstName.trim()) er.firstName = 'Privalomas laukas';
      if (!form.lastName.trim()) er.lastName = 'Privalomas laukas';
      if (form.address.trim().length < 4) er.address = 'Įveskite adresą';
      if (!form.city.trim()) er.city = 'Įveskite miestą';
      if (!/^LT-\d{5}$/.test(form.postal)) er.postal = 'Formatas: LT-12345';
    }
    if (which === 3) {
      const digits = onlyDigits(form.cardNumber);
      if (!form.cardName.trim()) er.cardName = 'Įveskite vardą kaip kortelėje';
      if (!luhnValid(digits)) er.cardNumber = 'Neteisingas kortelės numeris';
      if (!expiryValid(form.expiry)) er.expiry = 'Neteisinga data';
      if (form.cvc.length < (brand === 'amex' ? 4 : 3)) er.cvc = 'Neteisingas CVC';
    }
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const nextStep = (current) => {
    if (!validate(current)) return;
    setDoneSteps((d) => ({ ...d, [current]: true }));
    setStep(current + 1);
  };

  const pay = (e) => {
    e.preventDefault();
    if (!validate(3)) return;
    setProcessing(true);
    window.setTimeout(() => {
      const order = onPlaceOrder({
        customer: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: `${form.address.trim()}, ${form.city.trim()}, ${form.postal}`,
        cardLast4: onlyDigits(form.cardNumber).slice(-4),
        cardBrand: brand,
      });
      setProcessing(false);
      setPlacedOrder(order);
      setStage('success');
      setStep(1);
      setDoneSteps({});
      setErrors({});
      setForm((f) => ({ ...EMPTY_FORM, email: f.email, firstName: f.firstName, lastName: f.lastName, phone: f.phone }));
    }, 1600);
  };

  const shippingSummary = useMemo(
    () => [form.firstName, form.lastName].filter(Boolean).join(' ') + (form.city ? `, ${form.city}` : ''),
    [form.firstName, form.lastName, form.city]
  );

  const title = stage === 'checkout' ? 'Atsiskaitymas' : stage === 'success' ? 'Užsakymas pateiktas' : 'Krepšelis';

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <button
        type="button"
        tabIndex={-1}
        onClick={() => !processing && onClose()}
        className={`absolute inset-0 h-full w-full cursor-default bg-black/55 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Uždaryti krepšelį"
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-white shadow-drawer outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-x-0' : 'invisible translate-x-full'
        }`}
      >
        {/* Antraštė */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-brand-line px-4 sm:px-5">
          <div className="flex items-center gap-2">
            {stage === 'checkout' && (
              <button type="button" onClick={() => setStage('cart')} className="icon-btn -ml-2" aria-label="Atgal į krepšelį" disabled={processing}>
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="font-display text-base font-extrabold uppercase tracking-[0.12em]">
              {title}
              {stage === 'cart' && itemCount > 0 && <span className="ml-2 text-neutral-400">({itemCount})</span>}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Uždaryti" disabled={processing}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nemokamo pristatymo juosta */}
        {stage !== 'success' && items.length > 0 && (
          <div className="shrink-0 border-b border-brand-line bg-brand-green-light px-4 py-3 sm:px-5">
            <p className="flex items-center gap-2 text-xs font-semibold text-brand-green-dark">
              <Truck className="h-4 w-4" />
              {totals.freeShippingRemaining > 0 ? (
                <span>
                  Iki nemokamo pristatymo trūksta <strong>{formatEur(totals.freeShippingRemaining)}</strong>
                </span>
              ) : (
                <span className="font-bold">Jums taikomas nemokamas pristatymas! 🎉</span>
              )}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-brand-green transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
          {/* ---------------- KREPŠELIS ---------------- */}
          {stage === 'cart' &&
            (items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <ShoppingBag className="h-7 w-7 text-neutral-400" />
                </span>
                <p className="mt-5 font-display text-lg font-extrabold uppercase">Krepšelis tuščias</p>
                <p className="mt-1 text-sm text-neutral-500">Atraskite savo kvapą – nemokamas pristatymas nuo 40€.</p>
                <button type="button" onClick={onClose} className="btn-primary mt-6">
                  Tęsti apsipirkimą
                </button>
              </div>
            ) : (
              <div className="px-4 py-4 sm:px-5">
                <ul className="divide-y divide-brand-line">
                  {items.map((it) => (
                    <li key={it.key} className="flex gap-3 py-4 first:pt-0">
                      <ProductImage src={it.product.image} alt={it.product.title} className="h-24 w-20 shrink-0 rounded-lg border border-brand-line" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-extrabold uppercase">{it.product.title}</p>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{it.sizeLabel}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(it.key)}
                            className="-mr-1 -mt-1 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-brand-sale"
                            aria-label={`Pašalinti ${it.product.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                          <div className="flex h-9 items-center rounded-full border border-brand-line">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(it.key, it.qty - 1)}
                              className="flex h-full w-8 items-center justify-center rounded-l-full hover:bg-neutral-100"
                              aria-label="Sumažinti"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold tabular">{it.qty}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(it.key, it.qty + 1)}
                              disabled={it.qty >= it.maxQty}
                              className="flex h-full w-8 items-center justify-center rounded-r-full hover:bg-neutral-100 disabled:opacity-30"
                              aria-label="Padidinti"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                          <div className="text-right tabular">
                            {it.regularPrice > it.unitPrice && (
                              <s className="block text-[11px] text-neutral-400">{formatPrice(it.regularPrice * it.qty)}</s>
                            )}
                            <span className="text-sm font-extrabold text-brand-sale">{formatPrice(it.unitPrice * it.qty)}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Upsell valdiklis */}
                <div
                  className={`mt-2 flex items-center gap-3 rounded-2xl border-2 p-3 transition ${
                    upsell ? 'border-brand-green bg-brand-green-light' : 'border-dashed border-brand-line'
                  }`}
                >
                  <ProductImage src={IMAGES.oilA} alt="Kvepalų aliejus" className="h-16 w-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-green">
                      <Droplets className="h-3 w-3" /> Rekomenduojame
                    </p>
                    <p className="text-sm font-bold leading-tight">Pridėti kvepalų aliejų (+{formatEur(UPSELL_OIL.price)})</p>
                    <p className="text-[11px] text-neutral-500">10 ml koncentratas ilgesniam kvapui</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={upsell}
                    onClick={onToggleUpsell}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${upsell ? 'bg-brand-green' : 'bg-neutral-300'}`}
                    aria-label="Pridėti kvepalų aliejų"
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${upsell ? 'left-6' : 'left-1'}`}
                    />
                  </button>
                </div>
              </div>
            ))}

          {/* ---------------- ATSISKAITYMAS ---------------- */}
          {stage === 'checkout' && (
            <form onSubmit={pay} className="space-y-3 px-4 py-4 sm:px-5" noValidate>
              <Step
                index={1}
                title="Kontaktai"
                summary={form.email}
                active={step === 1}
                done={!!doneSteps[1]}
                onEdit={() => setStep(1)}
              >
                <div className="space-y-3">
                  <Field label="El. paštas" error={errors.email}>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      className="input-field"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="vardas@pastas.lt"
                    />
                  </Field>
                  <Field label="Telefonas" error={errors.phone}>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className="input-field"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="+370 600 00000"
                    />
                  </Field>
                  <button type="button" onClick={() => nextStep(1)} className="btn-primary w-full">
                    Tęsti
                  </button>
                </div>
              </Step>

              <Step
                index={2}
                title="Pristatymas"
                summary={shippingSummary}
                active={step === 2}
                done={!!doneSteps[2]}
                onEdit={() => setStep(2)}
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vardas" error={errors.firstName}>
                    <input autoComplete="given-name" className="input-field" value={form.firstName} onChange={set('firstName')} />
                  </Field>
                  <Field label="Pavardė" error={errors.lastName}>
                    <input autoComplete="family-name" className="input-field" value={form.lastName} onChange={set('lastName')} />
                  </Field>
                  <Field label="Adresas" error={errors.address} className="col-span-2">
                    <input
                      autoComplete="street-address"
                      className="input-field"
                      value={form.address}
                      onChange={set('address')}
                      placeholder="Gedimino pr. 1-10"
                    />
                  </Field>
                  <Field label="Miestas" error={errors.city}>
                    <input autoComplete="address-level2" className="input-field" value={form.city} onChange={set('city')} placeholder="Vilnius" />
                  </Field>
                  <Field label="Pašto kodas" error={errors.postal}>
                    <input
                      inputMode="numeric"
                      autoComplete="postal-code"
                      className="input-field"
                      value={form.postal}
                      onChange={set('postal')}
                      placeholder="LT-01103"
                    />
                  </Field>
                  <button type="button" onClick={() => nextStep(2)} className="btn-primary col-span-2 w-full">
                    Tęsti į apmokėjimą
                  </button>
                </div>
              </Step>

              <Step index={3} title="Mokėjimas" active={step === 3} done={false} onEdit={() => setStep(3)}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                    <span>
                      Demonstracinis režimas – mokėjimas nevykdomas. Testinė kortelė: <strong className="tabular">4242 4242 4242 4242</strong>
                    </span>
                  </div>

                  <Field label="Kortelės numeris" error={errors.cardNumber}>
                    <div className="relative">
                      <input
                        inputMode="numeric"
                        autoComplete="cc-number"
                        className="input-field pr-24 tabular tracking-wider"
                        value={form.cardNumber}
                        onChange={set('cardNumber')}
                        placeholder="1234 1234 1234 1234"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        {brand ? (
                          <span className="rounded bg-black px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                            {BRAND_LABEL[brand]}
                          </span>
                        ) : (
                          <CreditCard className="h-5 w-5 text-neutral-300" />
                        )}
                      </span>
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Galioja iki" error={errors.expiry}>
                      <input
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        className="input-field tabular"
                        value={form.expiry}
                        onChange={set('expiry')}
                        placeholder="MM / YY"
                      />
                    </Field>
                    <Field label="CVC" error={errors.cvc}>
                      <input
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        className="input-field tabular"
                        value={form.cvc}
                        onChange={set('cvc')}
                        placeholder={brand === 'amex' ? '1234' : '123'}
                      />
                    </Field>
                  </div>
                  <Field label="Vardas kortelėje" error={errors.cardName}>
                    <input autoComplete="cc-name" className="input-field uppercase" value={form.cardName} onChange={set('cardName')} />
                  </Field>

                  <button type="submit" disabled={processing} className="btn-primary h-[52px] w-full">
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Apdorojama…
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" /> Mokėti {formatEur(totals.total)}
                      </>
                    )}
                  </button>
                </div>
              </Step>
            </form>
          )}

          {/* ---------------- SĖKMĖ ---------------- */}
          {stage === 'success' && placedOrder && (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-brand-green text-white">
                <PartyPopper className="h-8 w-8" />
              </span>
              <p className="mt-5 font-display text-2xl font-extrabold uppercase">Ačiū už užsakymą!</p>
              <p className="mt-2 text-sm text-neutral-600">
                Užsakymo nr. <strong className="text-black">{placedOrder.id}</strong>. Patvirtinimą išsiuntėme adresu{' '}
                <strong className="text-black">{placedOrder.email}</strong>.
              </p>
              <div className="mt-6 w-full rounded-2xl border border-brand-line p-4 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Apmokėta</span>
                  <span className="font-extrabold tabular">{formatEur(placedOrder.total)}</span>
                </div>
                {placedOrder.cardLast4 && (
                  <div className="mt-1 flex justify-between">
                    <span className="text-neutral-500">Kortelė</span>
                    <span className="font-semibold tabular">•••• {placedOrder.cardLast4}</span>
                  </div>
                )}
                <div className="mt-1 flex justify-between">
                  <span className="text-neutral-500">Pristatymas</span>
                  <span className="font-semibold">1–3 darbo dienos</span>
                </div>
              </div>
              <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
                Tęsti apsipirkimą
              </button>
            </div>
          )}
        </div>

        {/* Suvestinė */}
        {stage !== 'success' && items.length > 0 && (
          <div className="safe-bottom shrink-0 border-t border-brand-line bg-white px-4 pt-4 sm:px-5">
            {stage === 'checkout' && (
              <button
                type="button"
                onClick={() => setShowBreakdown((v) => !v)}
                className="mb-2 flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-500"
                aria-expanded={showBreakdown}
              >
                {showBreakdown ? 'Slėpti suvestinę' : 'Rodyti užsakymo suvestinę'}
                <ChevronDown className={`h-4 w-4 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
              </button>
            )}
            <div className="space-y-1.5 text-sm tabular">
              <dl className={`${stage === 'checkout' && !showBreakdown ? 'hidden' : ''} space-y-1.5`}>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Tarpinė suma</dt>
                <dd className="font-semibold">{formatEur(totals.subtotal)}</dd>
              </div>
              {totals.savings > 0 && (
                <div className="flex justify-between text-brand-sale">
                  <dt>Nuolaida</dt>
                  <dd className="font-semibold">−{formatEur(totals.savings)}</dd>
                </div>
              )}
              {upsell && (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Kvepalų aliejus</dt>
                  <dd className="font-semibold">+{formatEur(UPSELL_OIL.price)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-neutral-600">Siuntimas</dt>
                <dd className={`font-semibold ${totals.shipping === 0 ? 'text-brand-green' : ''}`}>
                  {totals.shipping === 0 ? 'Nemokamas siuntimas' : formatEur(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <dt>PVM įskaičiuotas ({Math.round(VAT_RATE * 100)}%)</dt>
                <dd>{formatEur(totals.vat)}</dd>
              </div>
              </dl>
              <dl
                className={`flex items-baseline justify-between ${
                  stage === 'checkout' && !showBreakdown ? '' : 'border-t border-brand-line pt-2.5'
                }`}
              >
                <dt className="font-display text-sm font-extrabold uppercase tracking-wider">Iš viso</dt>
                <dd className="text-xl font-extrabold">{formatEur(totals.total)}</dd>
              </dl>
            </div>

            {stage === 'cart' && (
              <button type="button" onClick={() => setStage('checkout')} className="btn-primary mt-4 h-[52px] w-full">
                <Lock className="h-4 w-4" /> Apmokėti
              </button>
            )}
            <p className="mt-2 flex items-center justify-center gap-1.5 pb-1 text-[11px] text-neutral-400">
              <Lock className="h-3 w-3" /> Saugus atsiskaitymas · VISA · Mastercard · AMEX
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
