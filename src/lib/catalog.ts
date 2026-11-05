/**
 * Catalogue engine — the backend pipeline every product passes through:
 *
 *   Allegro raw offer (PL, PLN)
 *     → logistics filter      (suppress anything that does not ship to LT)
 *     → translation filter    (PL → LT, batched)
 *     → markup hub            (PLN → EUR × markup)
 *     → Product               (LT, EUR) — safe to render
 *
 * Nothing upstream reaches a component without passing every stage.
 */
import { allegro, allegroMode } from "./allegro";
import { CATEGORIES } from "./categories";
import { getEurPerPln } from "./currency";
import { resolveDelivery } from "./logistics";
import { discountPercent, toFinalEur } from "./pricing";
import { getSettings } from "./store";
import { normalize, translateBatch, translateQueryToPolish } from "./translate";
import type { AllegroRawOffer, CategorySlug, Product, ProductCost, SortKey } from "./types";

export interface PricingContext {
  eurPerPln: number;
  fxSource: string;
  markup: number;
}

export async function getPricingContext(): Promise<PricingContext> {
  const [fx, settings] = await Promise.all([getEurPerPln(), getSettings()]);
  return { eurPerPln: fx.eurPerPln, fxSource: fx.source, markup: settings.markup };
}

/* ───────────────────────────── Pipeline ───────────────────────────── */

interface Built {
  product: Product;
  cost: ProductCost;
}

async function buildProducts(raw: AllegroRawOffer[], ctx: PricingContext): Promise<Built[]> {
  // 1 — Logistics filter.
  const eligible = raw
    .map((offer) => ({ offer, delivery: resolveDelivery(offer) }))
    .filter((x): x is { offer: AllegroRawOffer; delivery: NonNullable<ReturnType<typeof resolveDelivery>> } => x.delivery !== null);

  // 2 — Translation filter (single batch for the whole page).
  const texts: string[] = [];
  for (const { offer } of eligible) {
    texts.push(offer.name, offer.description);
    for (const p of offer.parameters) texts.push(p.name, ...p.values);
  }
  const translated = await translateBatch(texts, "pl", "lt");
  let cursor = 0;
  const next = () => translated[cursor++];

  // 3 — Markup hub.
  return eligible.map(({ offer, delivery }) => {
    const title = next();
    const description = next();
    const parameters = offer.parameters.map((p) => ({ name: next(), values: p.values.map(() => next()) }));

    const priceEur = toFinalEur(offer.pricePln, ctx.eurPerPln, ctx.markup);
    const compareAtEur = offer.priceBeforeDiscountPln ? toFinalEur(offer.priceBeforeDiscountPln, ctx.eurPerPln, ctx.markup) : null;
    const discountPct = discountPercent(priceEur, compareAtEur);

    return {
      product: {
        id: offer.id,
        title,
        description,
        category: offer.category,
        priceEur,
        compareAtEur: discountPct ? compareAtEur : null,
        discountPct,
        images: offer.images,
        parameters,
        inStock: offer.stock > 0,
        superSeller: offer.seller.superSeller,
        delivery: delivery.estimate,
        popularity: offer.popularity,
        tags: offer.tags,
      },
      cost: {
        pricePln: offer.pricePln,
        shippingCostPln: delivery.shippingCostPln,
        eurPerPln: ctx.eurPerPln,
        markup: ctx.markup,
      },
    };
  });
}

/* ─────────────────────── Short-lived page cache ─────────────────────── */

const CACHE_TTL = 30_000;
const listCache = new Map<string, { at: number; value: Built[] }>();

async function cachedList(key: string, ctx: PricingContext, load: () => Promise<AllegroRawOffer[]>): Promise<Built[]> {
  const fullKey = `${key}|${ctx.markup}|${ctx.eurPerPln}`;
  const hit = listCache.get(fullKey);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.value;
  const value = await buildProducts(await load(), ctx);
  if (listCache.size > 200) listCache.clear();
  listCache.set(fullKey, { at: Date.now(), value });
  return value;
}

async function allProducts(ctx: PricingContext): Promise<Product[]> {
  const built = await cachedList("all", ctx, () => allegro.listOffers({ limit: 60 }));
  return built.map((b) => b.product);
}

/* ───────────────────────────── Sorting ───────────────────────────── */

export function sortProducts(products: Product[], sort: SortKey = "popular"): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceEur - b.priceEur);
    case "price-desc":
      return copy.sort((a, b) => b.priceEur - a.priceEur);
    case "discount":
      return copy.sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0) || b.popularity - a.popularity);
    default:
      return copy.sort((a, b) => b.popularity - a.popularity);
  }
}

export function parseSort(value: string | undefined): SortKey {
  return value === "price-asc" || value === "price-desc" || value === "discount" ? value : "popular";
}

/* ───────────────────────────── Public API ───────────────────────────── */

export interface HomeRows {
  top: Product[];
  seasonal: Product[];
  deals: Product[];
  byCategory: Array<{ slug: CategorySlug; name: string; products: Product[] }>;
}

export async function getHomeRows(): Promise<HomeRows> {
  const ctx = await getPricingContext();
  const products = await allProducts(ctx);
  const popular = sortProducts(products, "popular");
  return {
    top: popular.filter((p) => p.tags.includes("top")).slice(0, 10),
    seasonal: popular.filter((p) => p.tags.includes("seasonal")).slice(0, 10),
    deals: sortProducts(products.filter((p) => p.discountPct), "discount").slice(0, 10),
    byCategory: CATEGORIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      products: popular.filter((p) => p.category === c.slug).slice(0, 10),
    })).filter((row) => row.products.length > 0),
  };
}

export async function getCategoryProducts(slug: CategorySlug, sort: SortKey = "popular"): Promise<Product[]> {
  const ctx = await getPricingContext();
  const built = await cachedList(`cat:${slug}`, ctx, () => allegro.listOffers({ category: slug, limit: 60 }));
  return sortProducts(
    built.map((b) => b.product),
    sort,
  );
}

/**
 * Keyword search over the translated (Lithuanian) catalogue. Diacritics are
 * ignored, so "siurblys", "SIURBLYS" and "siurblys" all match. In live mode
 * the query is translated to Polish and sent to Allegro's search first.
 */
export async function searchProducts(
  query: string,
  opts: { category?: CategorySlug; sort?: SortKey; limit?: number } = {},
): Promise<Product[]> {
  const q = normalize(query);
  const ctx = await getPricingContext();

  let pool: Product[];
  if (allegroMode === "live" && q) {
    const phrase = await translateQueryToPolish(query);
    const built = await cachedList(`q:${phrase}:${opts.category ?? ""}`, ctx, () =>
      allegro.listOffers({ phrase, category: opts.category, limit: 60 }),
    );
    pool = built.map((b) => b.product);
  } else {
    pool = await allProducts(ctx);
  }

  if (opts.category) pool = pool.filter((p) => p.category === opts.category);

  const tokens = q.split(/\s+/).filter(Boolean);
  const categoryName = (slug: CategorySlug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? "";

  const scored = pool
    .map((p) => {
      if (tokens.length === 0) return { p, score: 1 };
      const title = normalize(p.title);
      const rest = normalize([p.description, categoryName(p.category), ...p.parameters.flatMap((x) => x.values)].join(" "));
      let score = 0;
      for (const t of tokens) {
        if (title.includes(t)) score += 3;
        else if (rest.includes(t)) score += 1;
        else return { p, score: 0 };
      }
      return { p, score };
    })
    .filter((x) => x.score > 0);

  const ordered =
    opts.sort && opts.sort !== "popular"
      ? sortProducts(scored.map((x) => x.p), opts.sort)
      : scored.sort((a, b) => b.score - a.score || b.p.popularity - a.p.popularity).map((x) => x.p);

  return ordered.slice(0, opts.limit ?? ordered.length);
}

/** Returns null when the offer is unknown OR suppressed by the LT filter. */
export async function getProduct(id: string): Promise<Product | null> {
  return (await getProductWithCost(id))?.product ?? null;
}

/** Server-only: product plus upstream cost, for checkout & accounting. */
export async function getProductWithCost(id: string): Promise<Built | null> {
  if (!/^\d{6,14}$/.test(id)) return null;
  const raw = await allegro.getOffer(id);
  if (!raw) return null;
  const ctx = await getPricingContext();
  const [built] = await buildProducts([raw], ctx);
  return built ?? null;
}

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const items = await getCategoryProducts(product.category);
  return items.filter((p) => p.id !== product.id).slice(0, limit);
}

/** Admin: how much of the upstream catalogue the LT filter suppresses. */
export async function getCatalogueHealth(): Promise<{ upstream: number; visible: number; suppressed: number; mode: string }> {
  const raw = await allegro.listOffers({ limit: 60 });
  const visible = raw.filter((o) => resolveDelivery(o) !== null).length;
  return { upstream: raw.length, visible, suppressed: raw.length - visible, mode: allegroMode };
}
