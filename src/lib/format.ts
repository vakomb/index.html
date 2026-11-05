/** Locale-aware formatting helpers (Lithuanian business conventions). */

const eur = new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

/** 1234.5 → "1 234,50 €" */
export const formatEur = (value: number): string => eur.format(value);

const dateTime = new Intl.DateTimeFormat("lt-LT", {
  timeZone: "Europe/Vilnius",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDateTime = (iso: string): string => dateTime.format(new Date(iso));

/** Lithuanian plural forms for item counts: 1 prekė, 2 prekės, 10 prekių. */
export function pluralPrekes(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} prekė`;
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return `${n} prekės`;
  return `${n} prekių`;
}

export const cn = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");
