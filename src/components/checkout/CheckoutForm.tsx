"use client";

/**
 * One-page checkout: contacts → delivery (paštomatas / kurjeris) → payment.
 * Validation runs instantly on blur and again on submit (shared rules with the
 * server). Totals come from /api/quote, never from the client cart alone.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn, formatEur } from "@/lib/format";
import type { Locker } from "@/lib/lockers";
import type { DeliveryType, PaymentMethod } from "@/lib/types";
import { validateCheckout, type CheckoutErrors, type CheckoutField, type CheckoutInput } from "@/lib/validation";
import { useCart } from "../cart/CartProvider";
import { IconCheck, IconLock, IconLocker, IconSearch, IconTruck, Spinner } from "../Icons";

interface QuoteLine {
  offerId: string;
  title: string;
  image: string;
  quantity: number;
  unitEur: number;
  deliveryLabel: string;
}
interface Quote {
  lines: QuoteLine[];
  unavailable: string[];
  itemsEur: number;
  deliveryEur: number;
  totalEur: number;
  freeDeliveryFromEur: number;
}

type FormState = Omit<CheckoutInput, "paymentMethod">;

const METHOD_LABELS: Record<PaymentMethod, string> = {
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  card: "Revolut / mokėjimo kortelė",
};

/* ───────────────────────────── Field primitives ───────────────────────────── */

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1.5 block text-xs text-red-700">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-neutral-400">{hint}</span>
      ) : null}
    </label>
  );
}

const inputCls = (error?: string) =>
  cn(
    "h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] outline-none transition placeholder:text-neutral-400",
    error ? "border-red-300 focus:border-red-500" : "border-black/10 focus:border-ink",
  );

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-black/5 p-5 md:p-7">
      <h2 className="flex items-center gap-3 text-[16px] font-semibold tracking-tight">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">{step}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ───────────────────────────── Main component ───────────────────────────── */

export function CheckoutForm({
  lockers,
  paymentMode,
  cancelled,
}: {
  lockers: Locker[];
  paymentMode: "stripe" | "mock";
  cancelled: boolean;
}) {
  const router = useRouter();
  const { items, hydrated, reprice, remove } = useCart();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    deliveryType: "pastomatas",
    lockerId: "",
    address: "",
    city: "",
    postalCode: "",
    acceptTerms: false,
  });
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<CheckoutErrors>({});
  const [banner, setBanner] = useState<string | null>(cancelled ? "Mokėjimas atšauktas. Jūsų krepšelis išsaugotas — galite bandyti dar kartą." : null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [paying, setPaying] = useState<PaymentMethod | null>(null);
  const [mockSheet, setMockSheet] = useState<{ orderId: string; totalEur: number; method: PaymentMethod } | null>(null);
  const [lockerQuery, setLockerQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const clientErrors = useMemo(() => validateCheckout({ ...form, paymentMethod: "card" }), [form]);
  const errorFor = (f: CheckoutField) => serverErrors[f] ?? ((touched[f] || submitted) ? clientErrors[f] : undefined);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
    setServerErrors((e) => ({ ...e, [key]: undefined }));
  };
  const blur = (f: CheckoutField) => () => setTouched((t) => ({ ...t, [f]: true }));

  // Authoritative re-quote whenever the cart changes.
  const cartKey = items.map((i) => `${i.offerId}:${i.quantity}`).join(",");
  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      setQuote(null);
      return;
    }
    const ctrl = new AbortController();
    setQuoting(true);
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: items.map((i) => ({ offerId: i.offerId, quantity: i.quantity })) }),
      signal: ctrl.signal,
    })
      .then((r) => r.json() as Promise<Quote>)
      .then((q) => {
        setQuote(q);
        const prices: Record<string, number> = {};
        for (const l of q.lines) prices[l.offerId] = l.unitEur;
        reprice(prices);
        if (q.unavailable.length > 0) {
          q.unavailable.forEach(remove);
          setBanner("Kai kurios prekės nebeprieinamos arba jų nebegalima pristatyti į Lietuvą — jos pašalintos iš krepšelio.");
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!ctrl.signal.aborted) setQuoting(false);
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, hydrated]);

  const filteredLockers = useMemo(() => {
    const q = lockerQuery.trim().toLowerCase();
    if (!q) return lockers;
    return lockers.filter((l) => `${l.network} ${l.city} ${l.name} ${l.address}`.toLowerCase().includes(q));
  }, [lockerQuery, lockers]);

  async function pay(method: PaymentMethod) {
    setSubmitted(true);
    setBanner(null);
    if (Object.keys(clientErrors).length > 0) {
      requestAnimationFrame(() => formRef.current?.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    setPaying(method);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { ...form, paymentMethod: method },
          lines: items.map((i) => ({ offerId: i.offerId, quantity: i.quantity })),
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        errors?: CheckoutErrors;
        unavailable?: string[];
        orderId?: string;
        redirectUrl?: string;
        mock?: boolean;
        totalEur?: number;
      };
      if (!json.ok) {
        setServerErrors(json.errors ?? {});
        json.unavailable?.forEach(remove);
        setBanner(json.message ?? "Nepavyko sukurti užsakymo.");
        setPaying(null);
        return;
      }
      if (json.redirectUrl && !json.mock) {
        window.location.assign(json.redirectUrl);
        return;
      }
      setMockSheet({ orderId: json.orderId!, totalEur: json.totalEur!, method });
      setPaying(null);
    } catch {
      setBanner("Ryšio klaida. Patikrinkite interneto ryšį ir bandykite dar kartą.");
      setPaying(null);
    }
  }

  /* ─────────────── Empty cart ─────────────── */
  if (hydrated && items.length === 0 && !mockSheet) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-[26px] font-semibold tracking-[-0.04em]">Krepšelis tuščias</h1>
        <p className="mt-2 text-sm text-neutral-500">Pridėkite prekių, kad galėtumėte pateikti užsakymą.</p>
        <Link href="/" className="tap mt-8 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-white">
          Į parduotuvę
        </Link>
      </div>
    );
  }

  const busy = paying !== null;

  return (
    <>
      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void pay("card");
        }}
        className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-10"
      >
        <div className="space-y-5">
          {banner && (
            <p role="status" className="rounded-2xl border border-black/10 bg-canvas px-4 py-3 text-[13px] text-neutral-700">
              {banner}
            </p>
          )}

          <Section step={1} title="Kontaktiniai duomenys">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Vardas ir pavardė" error={errorFor("fullName")}>
                  <input
                    className={inputCls(errorFor("fullName"))}
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    onBlur={blur("fullName")}
                    autoComplete="name"
                    placeholder="Jonas Jonaitis"
                  />
                </Field>
              </div>
              <Field label="El. paštas" error={errorFor("email")} hint="Naudosime tik su užsakymu susijusiai informacijai">
                <input
                  type="email"
                  inputMode="email"
                  className={inputCls(errorFor("email"))}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={blur("email")}
                  autoComplete="email"
                  placeholder="vardas@pastas.lt"
                />
              </Field>
              <Field label="Mobiliojo telefono numeris" error={errorFor("phone")} hint="Kurjeriui ir paštomato kodui">
                <input
                  type="tel"
                  inputMode="tel"
                  className={inputCls(errorFor("phone"))}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  onBlur={blur("phone")}
                  autoComplete="tel"
                  placeholder="+370 612 34567"
                />
              </Field>
            </div>
          </Section>

          <Section step={2} title="Pristatymas į Lietuvą">
            <div role="radiogroup" aria-label="Pristatymo būdas" className="grid grid-cols-2 gap-2 rounded-2xl bg-canvas p-1">
              {(
                [
                  { value: "pastomatas", label: "Paštomatas", icon: <IconLocker size={18} /> },
                  { value: "kurjeris", label: "Kurjeris", icon: <IconTruck size={18} /> },
                ] as Array<{ value: DeliveryType; label: string; icon: React.ReactNode }>
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={form.deliveryType === opt.value}
                  onClick={() => set("deliveryType", opt.value)}
                  className={cn(
                    "tap flex h-11 items-center justify-center gap-2 rounded-xl text-[14px] font-medium",
                    form.deliveryType === opt.value ? "bg-white shadow-sm" : "text-neutral-500",
                  )}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            {form.deliveryType === "pastomatas" ? (
              <div className="mt-5">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-black/10 px-3.5 focus-within:border-ink">
                  <IconSearch size={16} className="text-neutral-400" />
                  <input
                    value={lockerQuery}
                    onChange={(e) => setLockerQuery(e.target.value)}
                    placeholder="Miestas, prekybos centras ar adresas"
                    className="h-full flex-1 bg-transparent outline-none placeholder:text-neutral-400"
                    aria-label="Ieškoti paštomato"
                  />
                </div>
                <ul role="radiogroup" aria-label="Paštomatai" className="no-scrollbar mt-3 max-h-72 space-y-1.5 overflow-y-auto">
                  {filteredLockers.map((l) => {
                    const selected = form.lockerId === l.id;
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => {
                            set("lockerId", l.id);
                            setTouched((t) => ({ ...t, lockerId: true }));
                          }}
                          className={cn(
                            "tap flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left",
                            selected ? "border-accent bg-accent-soft" : "border-black/5 hover:border-black/15",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                              selected ? "border-accent bg-accent text-white" : "border-black/20",
                            )}
                          >
                            {selected && <IconCheck size={12} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-medium">
                              {l.city}, {l.name}
                            </span>
                            <span className="block text-xs text-neutral-500">
                              {l.network} · {l.address}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {filteredLockers.length === 0 && <li className="px-1 py-4 text-sm text-neutral-500">Paštomatų pagal šią užklausą nerasta.</li>}
                </ul>
                {errorFor("lockerId") && (
                  <p role="alert" className="mt-2 text-xs text-red-700">
                    {errorFor("lockerId")}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <Field label="Adresas" error={errorFor("address")}>
                    <input
                      className={inputCls(errorFor("address"))}
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      onBlur={blur("address")}
                      autoComplete="street-address"
                      placeholder="Gedimino pr. 1-12"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-4">
                  <Field label="Miestas" error={errorFor("city")}>
                    <input
                      className={inputCls(errorFor("city"))}
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      onBlur={blur("city")}
                      autoComplete="address-level2"
                      placeholder="Vilnius"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Pašto kodas" error={errorFor("postalCode")}>
                    <input
                      className={inputCls(errorFor("postalCode"))}
                      value={form.postalCode}
                      onChange={(e) => set("postalCode", e.target.value)}
                      onBlur={blur("postalCode")}
                      autoComplete="postal-code"
                      placeholder="LT-01103"
                    />
                  </Field>
                </div>
              </div>
            )}
          </Section>

          <Section step={3} title="Apmokėjimas">
            <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-neutral-600">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => set("acceptTerms", e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-[#0f5132]"
              />
              <span>
                Sutinku su pirkimo–pardavimo taisyklėmis ir privatumo politika. Patvirtinu, kad susipažinau su 14 dienų sutarties
                atsisakymo teise.
              </span>
            </label>
            {errorFor("acceptTerms") && (
              <p role="alert" className="mt-2 text-xs text-red-700">
                {errorFor("acceptTerms")}
              </p>
            )}

            <div className="mt-6 grid gap-2.5">
              <button
                type="button"
                disabled={busy || quoting}
                onClick={() => pay("apple_pay")}
                className="tap flex h-12 items-center justify-center gap-2 rounded-full bg-black text-[15px] font-medium text-white disabled:opacity-60"
              >
                {paying === "apple_pay" ? <Spinner /> : "Mokėti su Apple Pay"}
              </button>
              <button
                type="button"
                disabled={busy || quoting}
                onClick={() => pay("google_pay")}
                className="tap flex h-12 items-center justify-center gap-2 rounded-full border border-black/15 bg-white text-[15px] font-medium text-ink hover:border-ink disabled:opacity-60"
              >
                {paying === "google_pay" ? <Spinner /> : "Mokėti su Google Pay"}
              </button>
              <button
                type="submit"
                disabled={busy || quoting}
                className="tap flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-medium text-white hover:bg-accent-strong disabled:opacity-60"
              >
                {paying === "card" ? (
                  <Spinner />
                ) : (
                  <>
                    <IconLock size={16} /> Mokėti {quote ? formatEur(quote.totalEur) : ""} — Revolut / kortele
                  </>
                )}
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-neutral-400">
              {paymentMode === "stripe"
                ? "Mokėjimą saugiai apdoroja Stripe. Kortelės duomenų nesaugome."
                : "Demonstracinis režimas: mokėjimas imituojamas, pinigai nenuskaičiuojami."}
            </p>
          </Section>
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-3xl bg-canvas p-5 md:p-7">
            <h2 className="flex items-center justify-between text-[16px] font-semibold tracking-tight">
              Užsakymo suvestinė {quoting && <Spinner size={16} className="text-neutral-400" />}
            </h2>
            <ul className="mt-5 space-y-4">
              {(quote?.lines ?? items).map((l) => (
                <li key={l.offerId} className="flex gap-3">
                  <span className="relative h-16 w-16 shrink-0 rounded-xl bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.image} alt="" className="h-full w-full rounded-xl object-contain p-1.5 mix-blend-multiply" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white">
                      {l.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[13px] leading-snug">{l.title}</span>
                    <span className="mt-0.5 block text-[11px] text-neutral-500">{l.deliveryLabel}</span>
                  </span>
                  <span className="text-[13px] font-medium tabular-nums">{formatEur(l.unitEur * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-black/5 pt-5 text-sm">
              <div className="flex justify-between text-neutral-600">
                <dt>Prekių suma</dt>
                <dd className="tabular-nums">{quote ? formatEur(quote.itemsEur) : "—"}</dd>
              </div>
              <div className="flex justify-between text-neutral-600">
                <dt>Pristatymas</dt>
                <dd className="tabular-nums">{quote ? (quote.deliveryEur === 0 ? "Nemokamai" : formatEur(quote.deliveryEur)) : "—"}</dd>
              </div>
              <div className="flex justify-between pt-2 text-[17px] font-semibold">
                <dt>Mokėti iš viso</dt>
                <dd className="tabular-nums">{quote ? formatEur(quote.totalEur) : "—"}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-neutral-500">Visos kainos nurodytos eurais su PVM.</p>
            {quote && quote.deliveryEur > 0 && (
              <p className="mt-3 text-xs text-neutral-500">
                Užsakius už {formatEur(quote.freeDeliveryFromEur)} ar daugiau — pristatymas nemokamas.
              </p>
            )}
          </div>
        </aside>
      </form>

      {mockSheet && (
        <MockPaymentSheet
          {...mockSheet}
          onClose={() => setMockSheet(null)}
          onPaid={(url) => router.push(url)}
        />
      )}
    </>
  );
}

/* ───────────────────────────── Mock payment sheet ───────────────────────────── */

function MockPaymentSheet({
  orderId,
  totalEur,
  method,
  onClose,
  onPaid,
}: {
  orderId: string;
  totalEur: number;
  method: PaymentMethod;
  onClose: () => void;
  onPaid: (url: string) => void;
}) {
  const [state, setState] = useState<"idle" | "processing" | "done" | "error">("idle");

  async function confirm() {
    setState("processing");
    try {
      const res = await fetch("/api/checkout/mock-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = (await res.json()) as { ok: boolean; redirectUrl?: string };
      if (!json.ok || !json.redirectUrl) throw new Error();
      setState("done");
      setTimeout(() => onPaid(json.redirectUrl!), 450);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label="Mokėjimo patvirtinimas">
      <div className="animate-fade-in absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={state === "idle" ? onClose : undefined} />
      <div className="animate-sheet-up pb-safe relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-neutral-200 md:hidden" />
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Bandomasis mokėjimas</p>
        <p className="mt-2 text-center text-[15px] font-medium">{METHOD_LABELS[method]}</p>
        <p className="mt-6 text-center text-[40px] font-semibold tracking-[-0.04em] tabular-nums">{formatEur(totalEur)}</p>
        <dl className="mt-6 space-y-2 rounded-2xl bg-canvas p-4 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Gavėjas</dt>
            <dd className="font-medium">Lenkynas.lt</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Užsakymas</dt>
            <dd className="font-mono text-xs">{orderId}</dd>
          </div>
        </dl>
        {state === "error" && <p className="mt-4 text-center text-xs text-red-700">Mokėjimo patvirtinti nepavyko. Bandykite dar kartą.</p>}
        <button
          onClick={confirm}
          disabled={state === "processing" || state === "done"}
          className={cn(
            "tap mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white",
            "bg-accent hover:bg-accent-strong disabled:opacity-90",
          )}
        >
          {state === "processing" ? (
            <>
              <Spinner /> Apdorojama…
            </>
          ) : state === "done" ? (
            <>
              <IconCheck /> Apmokėta
            </>
          ) : (
            "Patvirtinti mokėjimą"
          )}
        </button>
        {state === "idle" && (
          <button onClick={onClose} className="tap mt-2 h-11 w-full rounded-full text-sm font-medium text-neutral-500 hover:text-ink">
            Atšaukti
          </button>
        )}
        <p className="mt-3 text-center text-[11px] text-neutral-400">Pridėję STRIPE_SECRET_KEY įjungsite tikrus mokėjimus.</p>
      </div>
    </div>
  );
}
