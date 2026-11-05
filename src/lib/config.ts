/**
 * Central runtime configuration.
 *
 * Every value has a safe default so that `npm run dev` works with zero setup:
 * mock Allegro data, mock payments, offline glossary translation.
 */

function num(value: string | undefined, fallback: number): number {
  const parsed = value === undefined || value === "" ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const isProd = process.env.NODE_ENV === "production";

export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  allegro: {
    /** Live mode only activates when credentials are actually present. */
    mode:
      process.env.ALLEGRO_MODE === "live" && !!process.env.ALLEGRO_CLIENT_ID && !!process.env.ALLEGRO_CLIENT_SECRET
        ? ("live" as const)
        : ("mock" as const),
    clientId: process.env.ALLEGRO_CLIENT_ID || "",
    clientSecret: process.env.ALLEGRO_CLIENT_SECRET || "",
    userToken: process.env.ALLEGRO_USER_TOKEN || "",
    sandbox: process.env.ALLEGRO_SANDBOX === "true",
  },

  pricing: {
    defaultMarkup: num(process.env.DEFAULT_MARKUP, 1.5),
    minMarkup: 1.0,
    maxMarkup: 3.0,
    fallbackEurPerPln: num(process.env.FALLBACK_EUR_PER_PLN, 0.235),
    deliveryFeeEur: num(process.env.DELIVERY_FEE_EUR, 3.99),
    freeDeliveryFromEur: num(process.env.FREE_DELIVERY_FROM_EUR, 59),
  },

  logistics: {
    /** ISO 3166-1 alpha-2 destination the storefront serves. */
    destinationCountry: "LT",
    /** Working days the proxy needs to place the order on Allegro. */
    handlingDays: num(process.env.HANDLING_DAYS, 1),
  },

  translation: {
    provider: (process.env.TRANSLATION_PROVIDER || "glossary") as "glossary" | "deepl" | "openai",
    deeplKey: process.env.DEEPL_API_KEY || "",
    openaiKey: process.env.OPENAI_API_KEY || "",
    openaiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    get enabled() {
      return this.secretKey.length > 0;
    },
  },

  admin: {
    user: process.env.ADMIN_USER || "admin",
    /** Dev default keeps the repo turn-key; production stays locked until set. */
    password: process.env.ADMIN_PASSWORD || (isProd ? "" : "lenkynas"),
  },

  dataDir: process.env.DATA_DIR || ".data",
} as const;

export type PaymentMode = "stripe" | "mock";
export const paymentMode = (): PaymentMode => (config.stripe.enabled ? "stripe" : "mock");
