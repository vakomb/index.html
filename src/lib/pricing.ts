/**
 * Automated markup hub.
 *
 *     finalEur = (rawPln × currentExchangeRate) × markup
 *
 * The markup coefficient defaults to 1.5 and is adjustable at runtime from the
 * admin terminal. Results are rounded to whole cents (half-up).
 */

export const roundCents = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export function toFinalEur(rawPln: number, eurPerPln: number, markup: number): number {
  return roundCents(rawPln * eurPerPln * markup);
}

/** Converts PLN to EUR without markup — used for internal cost accounting. */
export function toCostEur(rawPln: number, eurPerPln: number): number {
  return roundCents(rawPln * eurPerPln);
}

export function discountPercent(priceEur: number, compareAtEur: number | null): number | null {
  if (!compareAtEur || compareAtEur <= priceEur) return null;
  const pct = Math.round((1 - priceEur / compareAtEur) * 100);
  return pct >= 1 ? pct : null;
}
