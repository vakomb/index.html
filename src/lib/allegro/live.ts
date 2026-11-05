/**
 * Live Allegro REST API adapter.
 *
 * Activated with ALLEGRO_MODE=live plus ALLEGRO_CLIENT_ID / ALLEGRO_CLIENT_SECRET.
 *
 * Access model (important):
 *  • Public search (`GET /offers/listing`) is only granted to applications that
 *    Allegro has verified. Unverified apps receive 403.
 *  • Shipping-rate data (`/sale/offers/{id}`, `/sale/shipping-rates/{id}`) is
 *    exposed only in a seller's user context, i.e. for offers of partner sellers
 *    who authorised your app. Provide that token as ALLEGRO_USER_TOKEN.
 *
 * Because the logistics rule is strict ("hide anything that does not
 * explicitly ship to LT"), offers whose shipping data cannot be resolved are
 * returned with an empty shipping array and are suppressed downstream.
 */
import { config } from "../config";
import { CATEGORIES } from "../categories";
import type { AllegroRawOffer, AllegroShippingRate, CategorySlug } from "../types";

const AUTH_HOST = config.allegro.sandbox ? "https://allegro.pl.allegrosandbox.pl" : "https://allegro.pl";
const API_HOST = config.allegro.sandbox ? "https://api.allegro.pl.allegrosandbox.pl" : "https://api.allegro.pl";
const ACCEPT = "application/vnd.allegro.public.v1+json";

/* ───────────────────────────── OAuth token ───────────────────────────── */

let appToken: { value: string; expiresAt: number } | null = null;

async function getAppToken(): Promise<string> {
  if (appToken && appToken.expiresAt > Date.now() + 60_000) return appToken.value;
  const basic = Buffer.from(`${config.allegro.clientId}:${config.allegro.clientSecret}`).toString("base64");
  const res = await fetch(`${AUTH_HOST}/auth/oauth/token?grant_type=client_credentials`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Allegro OAuth failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  appToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return appToken.value;
}

async function api<T>(path: string, opts: { user?: boolean; revalidate?: number } = {}): Promise<T> {
  const token = opts.user ? config.allegro.userToken : await getAppToken();
  if (!token) throw new Error("Missing Allegro token for " + path);
  const res = await fetch(`${API_HOST}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: ACCEPT, "Accept-Language": "pl-PL" },
    next: { revalidate: opts.revalidate ?? 300 },
  });
  if (!res.ok) throw new Error(`Allegro ${path} → ${res.status}`);
  return (await res.json()) as T;
}

/* ──────────────────────── Upstream payload shapes ──────────────────────── */

interface ListingItem {
  id: string;
  name: string;
  sellingMode: { price: { amount: string; currency: string } };
  images?: Array<{ url: string }>;
  category: { id: string };
  stock?: { available: number };
  seller?: { login?: string; superSeller?: boolean };
  delivery?: { availableForFree?: boolean; lowestPrice?: { amount: string } };
}

interface ListingResponse {
  items: { promoted: ListingItem[]; regular: ListingItem[] };
  searchMeta?: { totalCount: number };
}

interface SaleOffer {
  delivery?: { shippingRates?: { id: string } | null; handlingTime?: string };
  parameters?: Array<{ name: string; values?: string[]; valuesLabels?: string[] }>;
  description?: { sections?: Array<{ items?: Array<{ type: string; content?: string }> }> };
}

interface ShippingRateSet {
  rates: Array<{
    deliveryMethod: { id: string };
    firstItemRate: { amount: string; currency: string };
    shippingTime?: { from?: string; to?: string } | null;
  }>;
}

interface DeliveryMethod {
  id: string;
  name: string;
  shippingTime?: { from?: string; to?: string } | null;
}

/* ───────────────────────────── Category map ───────────────────────────── */

const topCategoryCache = new Map<string, CategorySlug | null>();

/** Walks up the Allegro category tree until a mapped top-level id is found. */
async function resolveCategory(categoryId: string): Promise<CategorySlug | null> {
  if (topCategoryCache.has(categoryId)) return topCategoryCache.get(categoryId)!;
  let current: string | null = categoryId;
  for (let hop = 0; current && hop < 8; hop++) {
    const match = CATEGORIES.find((c) => c.allegroCategoryId === current);
    if (match) {
      topCategoryCache.set(categoryId, match.slug);
      return match.slug;
    }
    const node: { parent?: { id: string } | null } = await api(`/sale/categories/${current}`, { revalidate: 86_400 });
    current = node.parent?.id ?? null;
  }
  topCategoryCache.set(categoryId, null);
  return null;
}

/* ─────────────────────────── Shipping enrichment ─────────────────────────── */

let deliveryMethods: Map<string, DeliveryMethod> | null = null;

async function getDeliveryMethods(): Promise<Map<string, DeliveryMethod>> {
  if (deliveryMethods) return deliveryMethods;
  const json = await api<{ deliveryMethods: DeliveryMethod[] }>("/sale/delivery-methods", { user: true, revalidate: 86_400 });
  deliveryMethods = new Map(json.deliveryMethods.map((m) => [m.id, m]));
  return deliveryMethods;
}

/** Delivery method names that explicitly serve Lithuania. */
const LT_PATTERN = /(litw|lithuan|lietuv|\bLT\b)/i;

async function resolveShipping(offerId: string): Promise<{ shipping: AllegroShippingRate[]; sale: SaleOffer | null }> {
  if (!config.allegro.userToken) return { shipping: [], sale: null };
  try {
    const sale = await api<SaleOffer>(`/sale/product-offers/${offerId}`, { user: true });
    const rateSetId = sale.delivery?.shippingRates?.id;
    if (!rateSetId) return { shipping: [], sale };
    const [set, methods] = await Promise.all([
      api<ShippingRateSet>(`/sale/shipping-rates/${rateSetId}`, { user: true }),
      getDeliveryMethods(),
    ]);
    const shipping: AllegroShippingRate[] = set.rates.map((rate) => {
      const method = methods.get(rate.deliveryMethod.id);
      const name = method?.name ?? "Kurjeris";
      const time = rate.shippingTime ?? method?.shippingTime ?? null;
      return {
        countryCode: LT_PATTERN.test(name) ? "LT" : "PL",
        carrier: name,
        deliveryTime: time?.from && time?.to ? `${time.from}/${time.to}` : "",
        pricePln: Number(rate.firstItemRate.amount),
      };
    });
    return { shipping, sale };
  } catch (err) {
    console.warn(`[allegro] shipping enrichment failed for ${offerId}:`, (err as Error).message);
    return { shipping: [], sale: null };
  }
}

function extractDescription(sale: SaleOffer | null, fallback: string): string {
  const html = sale?.description?.sections
    ?.flatMap((s) => s.items ?? [])
    .filter((i) => i.type === "TEXT" && i.content)
    .map((i) => i.content!)
    .join(" ");
  if (!html) return fallback;
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200);
}

/* ─────────────────────────────── Mapping ─────────────────────────────── */

async function mapItem(item: ListingItem, forcedCategory?: CategorySlug): Promise<AllegroRawOffer | null> {
  const category = forcedCategory ?? (await resolveCategory(item.category.id));
  if (!category) return null;
  const { shipping, sale } = await resolveShipping(item.id);
  return {
    id: item.id,
    name: item.name,
    description: extractDescription(sale, item.name),
    category,
    pricePln: Number(item.sellingMode.price.amount),
    images: (item.images ?? []).map((i) => i.url),
    parameters: (sale?.parameters ?? []).map((p) => ({ name: p.name, values: p.valuesLabels ?? p.values ?? [] })),
    stock: item.stock?.available ?? 0,
    seller: { login: item.seller?.login ?? "allegro-seller", superSeller: !!item.seller?.superSeller },
    shipping,
    popularity: 0,
    tags: [],
  };
}

/* ───────────────────────────── Public API ───────────────────────────── */

export const liveAllegro = {
  async listOffers(params: { category?: CategorySlug; phrase?: string; limit?: number } = {}): Promise<AllegroRawOffer[]> {
    const qs = new URLSearchParams({ limit: String(params.limit ?? 40), sort: "-popularity" });
    if (params.phrase) qs.set("phrase", params.phrase);
    if (params.category) {
      const cat = CATEGORIES.find((c) => c.slug === params.category);
      if (cat) qs.set("category.id", cat.allegroCategoryId);
    }
    const json = await api<ListingResponse>(`/offers/listing?${qs.toString()}`);
    const items = [...json.items.promoted, ...json.items.regular];
    const mapped = await Promise.all(items.map((i) => mapItem(i, params.category)));
    // Rank by upstream order (Allegro already sorted by popularity).
    return mapped
      .filter((o): o is AllegroRawOffer => o !== null)
      .map((o, index) => ({ ...o, popularity: items.length - index, tags: index < 8 ? ["top" as const] : [] }));
  },

  async getOffer(id: string): Promise<AllegroRawOffer | null> {
    // The listing endpoint is the only public read path for foreign offers.
    const json = await api<ListingResponse>(`/offers/listing?phrase=${encodeURIComponent(id)}&limit=5`);
    const item = [...json.items.promoted, ...json.items.regular].find((i) => i.id === id);
    return item ? mapItem(item) : null;
  },
};
