/**
 * Surgical logistics filter + delivery lifecycle parser.
 *
 * 1. `resolveDelivery()` scans an offer's shipping array. If no rate explicitly
 *    targets the destination country (LT), it returns `null` and the catalogue
 *    engine suppresses the offer entirely.
 * 2. Carrier deadlines arrive in heterogeneous formats (ISO-8601 durations,
 *    Polish phrases, bare numbers). They are normalised into working-day
 *    ranges, padded with the proxy's own handling time, and rendered as a
 *    unified Lithuanian indicator: "Pristatymas į Lietuvą: 3–5 d.d."
 */
import { config } from "./config";
import type { AllegroRawOffer, AllegroShippingRate, DeliveryEstimate } from "./types";

export interface DayRange {
  min: number;
  max: number;
}

/* ───────────────────────────── Parsing ───────────────────────────── */

/** "PT72H" → 3, "P2D" → 2, "P1DT12H" → 2 (rounded up to whole days). */
function isoDurationToDays(token: string): number | null {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/i.exec(token.trim());
  if (!m) return null;
  const days = Number(m[1] ?? 0);
  const hours = Number(m[2] ?? 0);
  const minutes = Number(m[3] ?? 0);
  const total = days + hours / 24 + minutes / 1440;
  return total > 0 ? Math.max(1, Math.ceil(total)) : null;
}

/**
 * Parses any supported carrier deadline into a working-day range.
 * Returns null when the string carries no usable information.
 */
export function parseDeliveryTime(raw: string): DayRange | null {
  const text = (raw ?? "").trim();
  if (!text) return null;

  // ISO-8601 duration, single or "from/to" range.
  if (/^P/i.test(text)) {
    const [fromToken, toToken] = text.split("/");
    const from = isoDurationToDays(fromToken);
    const to = toToken ? isoDurationToDays(toToken) : from;
    if (from !== null && to !== null) return { min: Math.min(from, to), max: Math.max(from, to) };
    return null;
  }

  // Hours expressed in text ("48 godz.", "24h").
  const hourRange = /(\d+)\s*(?:[-–—]|do)\s*(\d+)\s*(?:h|godz)/i.exec(text) ?? /(\d+)\s*(?:h|godz)/i.exec(text);
  if (hourRange) {
    const a = Math.ceil(Number(hourRange[1]) / 24);
    const b = Math.ceil(Number(hourRange[2] ?? hourRange[1]) / 24);
    return { min: Math.max(1, Math.min(a, b)), max: Math.max(1, a, b) };
  }

  // Day ranges ("3-5 dni robocze", "3–5 dni", "2 do 4 dni") or single values ("1 dzień").
  const range = /(\d+)\s*(?:[-–—]|do)\s*(\d+)/i.exec(text);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  const single = /(\d+)/.exec(text);
  if (single) {
    const d = Number(single[1]);
    return { min: d, max: d };
  }
  return null;
}

/* ─────────────────────────── Date formatting ─────────────────────────── */

const LT_MONTHS_GENITIVE = [
  "sausio", "vasario", "kovo", "balandžio", "gegužės", "birželio",
  "liepos", "rugpjūčio", "rugsėjo", "spalio", "lapkričio", "gruodžio",
];

/** Order cut-off in Vilnius time; later orders start counting tomorrow. */
const CUTOFF_HOUR = 14;

/** Today's calendar date in Europe/Vilnius as a UTC-midnight Date. */
function vilniusToday(now = new Date()): { date: Date; hour: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vilnius",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { date: new Date(Date.UTC(get("year"), get("month") - 1, get("day"))), hour: get("hour") };
}

function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return d;
}

export function formatDateRangeLt(from: Date, to: Date): string {
  const fm = LT_MONTHS_GENITIVE[from.getUTCMonth()];
  const tm = LT_MONTHS_GENITIVE[to.getUTCMonth()];
  if (from.getTime() === to.getTime()) return `${fm} ${from.getUTCDate()} d.`;
  if (fm === tm) return `${fm} ${from.getUTCDate()}–${to.getUTCDate()} d.`;
  return `${fm} ${from.getUTCDate()} d. – ${tm} ${to.getUTCDate()} d.`;
}

export function formatDayRangeLabel(range: DayRange): string {
  const span = range.min === range.max ? `${range.min}` : `${range.min}–${range.max}`;
  return `Pristatymas į Lietuvą: ${span} d.d.`;
}

/* ───────────────────────────── Resolution ───────────────────────────── */

/** True only when at least one rate explicitly targets the destination. */
export function shipsToDestination(offer: Pick<AllegroRawOffer, "shipping">, country = config.logistics.destinationCountry): boolean {
  return offer.shipping.some((r) => r.countryCode.toUpperCase() === country);
}

/**
 * Picks the fastest LT-capable rate (cheapest on ties) and produces the
 * unified estimate. Returns null → offer must be suppressed.
 */
export interface ResolvedDelivery {
  /** Customer-facing estimate (safe to render). */
  estimate: DeliveryEstimate;
  /** Upstream carrier fee — internal cost accounting only, never rendered. */
  shippingCostPln: number;
}

export function resolveDelivery(
  offer: Pick<AllegroRawOffer, "shipping">,
  now = new Date(),
  country = config.logistics.destinationCountry,
): ResolvedDelivery | null {
  const candidates = offer.shipping
    .filter((r) => r.countryCode.toUpperCase() === country)
    .map((rate: AllegroShippingRate) => ({ rate, range: parseDeliveryTime(rate.deliveryTime) }))
    .filter((c): c is { rate: AllegroShippingRate; range: DayRange } => c.range !== null);

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.range.max - b.range.max || a.range.min - b.range.min || a.rate.pricePln - b.rate.pricePln);
  const best = candidates[0];

  const handling = config.logistics.handlingDays;
  const range = { min: best.range.min + handling, max: best.range.max + handling };

  const today = vilniusToday(now);
  const start = today.hour >= CUTOFF_HOUR ? addBusinessDays(today.date, 1) : today.date;
  const from = addBusinessDays(start, range.min);
  const to = addBusinessDays(start, range.max);

  return {
    estimate: {
      carrier: best.rate.carrier,
      minDays: range.min,
      maxDays: range.max,
      label: formatDayRangeLabel(range),
      dateLabel: formatDateRangeLt(from, to),
    },
    shippingCostPln: best.rate.pricePln,
  };
}
