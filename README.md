# Lenkynas.lt

White-label storefront for Lithuania that resells **Allegro** offers. Prices are shown in **EUR**, every customer-facing text is in **Lithuanian**, only offers that **ship to LT** are listed, and checkout supports Apple Pay, Google Pay and Revolut/cards.

Built with Next.js 15 (App Router), TypeScript and Tailwind CSS v4. The only runtime dependencies are `next`, `react` and `react-dom`.

```bash
git clone https://github.com/<you>/lenkynas.git
cd lenkynas
npm install
npm run dev
# → http://localhost:3000        storefront
# → http://localhost:3000/admin  back-office (admin / lenkynas)
```

You don't need a `.env` file to start. With no configuration the app uses simulated Allegro data (36 offers, 6 of which deliberately can't ship to LT), mock payments and an offline glossary translator.

---

## How a product reaches the screen

```
Allegro offer (PL, PLN)
  │  src/lib/allegro/{mock,live}.ts      upstream source (mock middleware or REST)
  ▼
Logistics filter                         src/lib/logistics.ts
  │  no explicit LT shipping rate → offer suppressed everywhere (grid, search, PDP → 404)
  │  carrier deadlines (PT72H/PT120H, "3-5 dni robocze", "48 godz.") → working days
  │  + HANDLING_DAYS → "Pristatymas į Lietuvą: 3–5 d.d." + calendar dates
  ▼
Translation filter                       src/lib/translate.ts
  │  batched PL → LT (glossary | DeepL | OpenAI-compatible / local Ollama), memoised
  ▼
Markup hub                               src/lib/pricing.ts + src/lib/currency.ts
  │  finalEur = (rawPln × eurPerPln) × markup   (markup is live-editable in /admin)
  │  FX pool: ECB (Frankfurter) → NBP → fallback, cached 6 h
  ▼
Product (LT, EUR)                        src/lib/catalog.ts
```

The PLN cost of an offer and of its LT shipping stays on the server. It's used only for profit accounting and is visible only in the admin terminal. Public API responses (`/api/products`, `/api/quote`) strip it.

## Features

| Area | Where |
|---|---|
| Glass header, category drawer, instant search (debounced, abortable, keyboard nav) | `src/components/layout/*` |
| Native-style mobile tab bar, snap-scroll rows, press feedback, safe-area insets | `Header.tsx`, `ProductRow.tsx`, `globals.css` |
| Home rows: top offers, seasonal, biggest discounts, per category | `src/app/(shop)/page.tsx` |
| Category & search grids with URL-driven sorting | `kategorija/[slug]`, `paieska` |
| Product page: gallery, delivery dates, specs, JSON-LD | `produktas/[id]` |
| Persistent cart drawer (localStorage, cross-tab sync, free-delivery progress bar) | `src/components/cart/*` |
| One-page checkout: validated contacts, paštomatas picker / courier address, 3 payment triggers | `src/components/checkout/CheckoutForm.tsx` |
| Server-side re-quote and validation (the client is never trusted) | `src/lib/orders.ts`, `src/lib/validation.ts` |
| Stripe Checkout + signed webhook (no SDK), or a built-in mock payment sheet | `src/lib/stripe.ts`, `src/app/api/checkout/*` |
| Admin terminal: revenue and profit KPIs, 14-day profit chart, markup control, catalogue health, buyer pipeline, fulfilment lines with Allegro links | `src/app/admin`, `src/components/admin/AdminConsole.tsx` |

## Configuration

Copy `.env.example` to `.env.local`. Every variable is optional.

| Variable | Purpose |
|---|---|
| `ALLEGRO_MODE=live`, `ALLEGRO_CLIENT_ID`, `ALLEGRO_CLIENT_SECRET` | switch to the live REST API |
| `ALLEGRO_USER_TOKEN` | seller-context token used to resolve shipping rates (see below) |
| `DEFAULT_MARKUP` | initial coefficient (1.5). After that, change it in `/admin` |
| `TRANSLATION_PROVIDER` | `glossary` (default), `deepl` or `openai` |
| `DEEPL_API_KEY` / `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` | translation provider credentials. Point `OPENAI_BASE_URL` at `http://localhost:11434/v1` to use a local Ollama model |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | real payments. Setting the key disables mock payments automatically |
| `DELIVERY_FEE_EUR`, `FREE_DELIVERY_FROM_EUR`, `HANDLING_DAYS` | delivery commercial terms |
| `ADMIN_USER`, `ADMIN_PASSWORD` | admin Basic auth. In production `/admin` stays locked until a password is set |

## Going live: what to know about Allegro access

* **Public search requires a verified application.** Allegro restricts `GET /offers/listing` to verified apps, so apply for verification on the Allegro Developer Portal before switching to `live`. Unverified apps get 403. The adapter then falls back to mock data automatically and logs the error.
* **Shipping data per offer** (`/sale/product-offers/{id}` → `/sale/shipping-rates/{id}` → `/sale/delivery-methods`) is exposed only in a **seller's** context. The intended model is partner sellers who authorise your app, with their token passed as `ALLEGRO_USER_TOKEN`. If a shipping rate can't be resolved, the strict LT rule hides the offer. That's by design: nothing is listed unless it explicitly ships to LT.
* **Category ids** in `src/lib/categories.ts` are top-level Allegro ids. Check them against `GET /sale/categories`.
* **Translation in live mode:** the glossary only knows the mock catalogue. Use `deepl` or `openai` so real Allegro titles come out in Lithuanian.

The adapter in `src/lib/allegro/live.ts` follows Allegro's documented resources, but it hasn't been run against production credentials. Test it in the sandbox first (`ALLEGRO_SANDBOX=true`).

## Payments

* **Mock mode** (no Stripe key): each payment button creates a real order, then opens a test payment sheet. The order appears in `/admin` right away.
* **Stripe:** Checkout runs with dynamic payment methods and the Lithuanian locale. Enable Apple Pay, Google Pay, cards and **Revolut Pay** under Dashboard → Settings → Payment methods. Add a webhook to `/api/webhooks/stripe` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. For local testing run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. The success page also verifies the session directly, so orders get marked paid even without a webhook.

## Data storage

Orders and settings live in `.data/db.json`, written atomically through a serialised queue. That's fine for local development and a single server. On serverless or multi-instance hosting (e.g. Vercel), replace `src/lib/store.ts` with a database. Its five exported functions are the whole contract.

## Fonts

The font stack is Inter → Geist → system UI, so nothing has to download at startup. To bundle Inter, add `next/font/google` in `src/app/layout.tsx` and put its variable on `<html>`.

## Before you sell

Reselling marketplace offers comes with obligations: Allegro's API and marketplace terms, EU consumer law (14-day withdrawal, pre-contract information, prices with VAT), VAT/OSS registration and Lithuanian company requirements. Review all of them with a professional. This codebase gives you the tooling, not the legal setup.

## Project structure

```
src/
├── app/
│   ├── (shop)/                 storefront (header, cart drawer, tab bar)
│   │   ├── page.tsx            home rows
│   │   ├── kategorija/[slug]/  category grid
│   │   ├── paieska/            search results
│   │   ├── produktas/[id]/     product page
│   │   ├── apmokejimas/        checkout
│   │   └── uzsakymas/[id]/     order confirmation
│   ├── admin/                  back-office terminal (Basic auth)
│   └── api/                    products, quote, checkout, webhooks, admin, placeholder
├── components/                 layout · product · cart · checkout · admin
├── lib/                        the data engine (see pipeline above)
└── middleware.ts               admin protection
```

MIT licence.
