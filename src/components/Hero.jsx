import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react';
import { BottleArt } from './ProductImage';

const PITCH = ['NAUDOKIS MĖGSTAMU PRODUKTU', 'REKOMENDUOK DRAUGUI', 'UŽDIRBK IŠ PARDAVIMŲ'];

const STATS = [
  { value: 'iki 30%', label: 'komisinis atlygis' },
  { value: '0€', label: 'pradinis mokestis' },
  { value: '24/7', label: 'partnerio panelė' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Hero({ onShopNow }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const submit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 900);
  };

  return (
    <section id="distributoriai" className="relative overflow-hidden bg-black text-white">
      {/* Fono akcentai */}
      <div
        className="pointer-events-none absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-brand-gold/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[380px] w-[380px] rounded-full bg-brand-green/40 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-page relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
        {/* Kairė – tekstas */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 px-3 py-1 text-2xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            <Sparkles className="h-3.5 w-3.5" /> VAIDORE partnerių programa
          </p>

          <h1 className="mt-5 font-display text-[2.15rem] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            Tapk <span className="text-brand-gold">nepriklausomu</span>
            <br />
            distributoriumi
          </h1>

          <ul className="mt-7 space-y-3">
            {PITCH.map((line) => (
              <li key={line} className="flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.12em] sm:text-base">
                <span className="h-px w-5 bg-brand-gold" aria-hidden="true" />
                <span>
                  <span className="sr-only">- </span>
                  {line}
                </span>
              </li>
            ))}
          </ul>

          {status === 'success' ? (
            <div className="mt-8 flex max-w-md animate-pop-in items-start gap-3 rounded-2xl border border-brand-gold/40 bg-white/5 p-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold text-black">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">Paraiška gauta!</p>
                <p className="mt-1 text-sm text-white/70">
                  Partnerystės gidą išsiuntėme adresu <strong className="text-white">{email.trim()}</strong>. Susisieksime per 24 val.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 max-w-md" noValidate>
              <label htmlFor="hero-email" className="sr-only">
                El. paštas
              </label>
              <div
                className={`flex flex-col gap-2 rounded-2xl border bg-white/5 p-1.5 sm:flex-row sm:rounded-full ${
                  status === 'error' ? 'border-brand-sale' : 'border-white/15 focus-within:border-brand-gold'
                }`}
              >
                <input
                  id="hero-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Jūsų el. paštas"
                  className="h-11 w-full rounded-full bg-transparent px-4 text-white placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-gold px-6 text-xs font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-brand-gold-light disabled:opacity-70"
                >
                  {status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Prisijungti <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              {status === 'error' && (
                <p className="mt-2 px-2 text-xs font-semibold text-red-400" role="alert">
                  Įveskite teisingą el. pašto adresą.
                </p>
              )}
            </form>
          )}

          <button
            type="button"
            onClick={onShopNow}
            className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70 underline-offset-4 transition hover:text-white hover:underline"
          >
            Arba apsipirk dabar <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <dl className="mt-10 grid max-w-md grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-6">
            {STATS.map((s) => (
              <div key={s.label} className="px-3 first:pl-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-xl font-extrabold text-brand-gold sm:text-2xl">{s.value}</dd>
                <dd className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55 sm:text-2xs">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Dešinė – prabangus buteliuko konteineris */}
        <div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[260px] sm:max-w-[360px] lg:max-w-[440px]">
            <div className="absolute inset-0 rounded-[2rem] border border-brand-gold/30 bg-gradient-to-b from-neutral-900 via-black to-neutral-950" />
            <div className="absolute inset-4 rounded-[1.6rem] border border-white/5" />
            <div className="absolute left-1/2 top-[18%] h-[60%] w-[70%] -translate-x-1/2 rounded-full bg-brand-gold/25 blur-3xl" aria-hidden="true" />
            <BottleArt tone="dark" label="VAIDORE signature" className="absolute inset-x-0 bottom-[8%] mx-auto h-[78%] w-auto drop-shadow-2xl" />

            <span className="absolute left-4 top-6 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur sm:left-6 sm:top-8">
              🌹 Rožė · Oudas
            </span>
            <span className="absolute bottom-10 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur sm:right-6">
              🪵 Ambra · Kedras
            </span>
            <span className="absolute right-4 top-6 rounded-full bg-brand-gold px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-black sm:right-6 sm:top-8">
              Eau de Parfum
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
