/**
 * Checkout form validation — shared by the client (instant feedback) and the
 * server (authoritative). Pure functions, no dependencies.
 */
import { getLocker } from "./lockers";
import type { DeliveryType, PaymentMethod } from "./types";

export interface CheckoutInput {
  fullName: string;
  email: string;
  phone: string;
  deliveryType: DeliveryType;
  lockerId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  acceptTerms: boolean;
  paymentMethod: PaymentMethod;
}

export type CheckoutField = Exclude<keyof CheckoutInput, "paymentMethod">;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

/** "+370 612 34567", "861234567", "370612..." → "+37061234567" */
export function normalizeLtPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  let m = /^\+3706(\d{7})$/.exec(digits) ?? /^3706(\d{7})$/.exec(digits) ?? /^86(\d{7})$/.exec(digits);
  if (m) return `+3706${m[1]}`;
  m = /^\+370([3-5]\d{7})$/.exec(digits); // landline
  return m ? `+370${m[1]}` : null;
}

/** "12345", "LT12345", "lt-12345" → "LT-12345" */
export function normalizePostalCode(raw: string): string | null {
  const m = /^(?:LT)?-?\s*(\d{5})$/i.exec(raw.trim());
  return m ? `LT-${m[1]}` : null;
}

const NAME_RE = /^[\p{L}][\p{L}' .-]+\s+[\p{L}][\p{L}' .-]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateCheckout(input: Partial<CheckoutInput>): CheckoutErrors {
  const e: CheckoutErrors = {};
  const name = (input.fullName ?? "").trim();

  if (!name) e.fullName = "Įveskite vardą ir pavardę.";
  else if (name.length > 80 || !NAME_RE.test(name)) e.fullName = "Nurodykite vardą ir pavardę, pvz., Jonas Jonaitis.";

  if (!input.email?.trim()) e.email = "Įveskite el. pašto adresą.";
  else if (!EMAIL_RE.test(input.email.trim())) e.email = "El. pašto adresas neteisingas.";

  if (!input.phone?.trim()) e.phone = "Įveskite telefono numerį.";
  else if (!normalizeLtPhone(input.phone)) e.phone = "Įveskite Lietuvos numerį, pvz., +370 612 34567.";

  if (input.deliveryType === "pastomatas") {
    if (!input.lockerId || !getLocker(input.lockerId)) e.lockerId = "Pasirinkite paštomatą.";
  } else if (input.deliveryType === "kurjeris") {
    if (!input.address || input.address.trim().length < 5) e.address = "Nurodykite gatvę, namo ir buto numerį.";
    if (!input.city || input.city.trim().length < 2) e.city = "Nurodykite miestą.";
    if (!input.postalCode || !normalizePostalCode(input.postalCode)) e.postalCode = "Pašto kodas turi būti formato LT-12345.";
  } else {
    e.deliveryType = "Pasirinkite pristatymo būdą.";
  }

  if (!input.acceptTerms) e.acceptTerms = "Patvirtinkite, kad sutinkate su pirkimo taisyklėmis.";
  return e;
}
