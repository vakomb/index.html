/**
 * Live / cached currency pool — PLN → EUR.
 *
 * Sources are tried in order; the first healthy answer wins and is cached in
 * memory for 6 hours. If every source is unreachable (e.g. offline dev), the
 * configured fallback rate is used and re-checked after 10 minutes so local
 * development never blocks on the network.
 *
 *  1. Frankfurter (ECB reference rates)  → EUR per PLN directly
 *  2. NBP — National Bank of Poland, table A → PLN per EUR, inverted
 */
import { config } from "./config";

export interface FxRate {
  eurPerPln: number;
  source: "frankfurter" | "nbp" | "fallback";
  fetchedAt: string;
}

const TTL_OK = 6 * 60 * 60 * 1000;
const TTL_FALLBACK = 10 * 60 * 1000;
const TIMEOUT_MS = 1500;

let cache: { rate: FxRate; expiresAt: number } | null = null;
let inflight: Promise<FxRate> | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

const isSane = (r: number) => Number.isFinite(r) && r > 0.1 && r < 0.5;

const SOURCES: Array<{ name: FxRate["source"]; load: () => Promise<number> }> = [
  {
    name: "frankfurter",
    load: async () => {
      const json = await fetchJson<{ rates: { EUR: number } }>("https://api.frankfurter.app/latest?from=PLN&to=EUR");
      return json.rates.EUR;
    },
  },
  {
    name: "nbp",
    load: async () => {
      const json = await fetchJson<{ rates: Array<{ mid: number }> }>("https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json");
      return 1 / json.rates[0].mid;
    },
  },
];

async function resolve(): Promise<FxRate> {
  for (const source of SOURCES) {
    try {
      const eurPerPln = await source.load();
      if (isSane(eurPerPln)) {
        const rate: FxRate = { eurPerPln, source: source.name, fetchedAt: new Date().toISOString() };
        cache = { rate, expiresAt: Date.now() + TTL_OK };
        return rate;
      }
    } catch {
      /* try next source in the pool */
    }
  }
  const rate: FxRate = { eurPerPln: config.pricing.fallbackEurPerPln, source: "fallback", fetchedAt: new Date().toISOString() };
  cache = { rate, expiresAt: Date.now() + TTL_FALLBACK };
  return rate;
}

/** Returns the current EUR-per-PLN rate (de-duplicated, cached). */
export async function getEurPerPln(): Promise<FxRate> {
  if (cache && cache.expiresAt > Date.now()) return cache.rate;
  inflight ??= resolve().finally(() => {
    inflight = null;
  });
  return inflight;
}
