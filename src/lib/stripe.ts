/**
 * Minimal, dependency-free Stripe integration (REST + webhook signatures).
 *
 * Stripe Checkout with dynamic payment methods surfaces Apple Pay, Google Pay,
 * cards and Revolut Pay automatically, according to what you enable in the
 * Stripe Dashboard (Settings → Payment methods). All amounts are EUR.
 */
import crypto from "node:crypto";
import { config } from "./config";
import type { Order } from "./types";

const API = "https://api.stripe.com/v1";

/** Flattens nested objects into Stripe's form-encoding: a[b][0][c]=v */
function formEncode(data: Record<string, unknown>, prefix = "", out = new URLSearchParams()): URLSearchParams {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) value.forEach((v, i) => (typeof v === "object" ? formEncode(v as Record<string, unknown>, `${name}[${i}]`, out) : out.append(`${name}[${i}]`, String(v))));
    else if (typeof value === "object") formEncode(value as Record<string, unknown>, name, out);
    else out.append(name, String(value));
  }
  return out;
}

async function stripe<T>(method: "GET" | "POST", path: string, body?: Record<string, unknown>, idempotencyKey?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.stripe.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: body ? formEncode(body).toString() : undefined,
    cache: "no-store",
  });
  const json = (await res.json()) as T & { error?: { message: string } };
  if (!res.ok) throw new Error(json.error?.message ?? `Stripe ${res.status}`);
  return json;
}

const cents = (eur: number) => Math.round(eur * 100);

export interface CheckoutSession {
  id: string;
  url: string;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  metadata?: Record<string, string>;
}

export function createCheckoutSession(order: Order): Promise<CheckoutSession> {
  const absolute = (path: string) => (path.startsWith("http") ? path : `${config.siteUrl}${path}`);
  const lineItems = order.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "eur",
      unit_amount: cents(item.unitEur),
      product_data: {
        name: item.title.slice(0, 250),
        ...(item.image.startsWith("http") ? { images: [item.image] } : {}),
      },
    },
  }));
  if (order.totals.deliveryEur > 0) {
    lineItems.push({
      quantity: 1,
      price_data: { currency: "eur", unit_amount: cents(order.totals.deliveryEur), product_data: { name: "Pristatymas į Lietuvą" } },
    });
  }

  return stripe<CheckoutSession>(
    "POST",
    "/checkout/sessions",
    {
      mode: "payment",
      locale: "lt",
      customer_email: order.customer.email,
      client_reference_id: order.id,
      success_url: absolute(`/uzsakymas/${order.id}?session_id={CHECKOUT_SESSION_ID}`),
      cancel_url: absolute(`/apmokejimas?atsaukta=1`),
      line_items: lineItems,
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id }, description: `Lenkynas užsakymas ${order.id}` },
    },
    `checkout-${order.id}`,
  );
}

export function retrieveCheckoutSession(id: string): Promise<CheckoutSession> {
  return stripe<CheckoutSession>("GET", `/checkout/sessions/${encodeURIComponent(id)}`);
}

/** Verifies the `Stripe-Signature` header (v1 HMAC-SHA256, 5-minute tolerance). */
export function verifyWebhookSignature(payload: string, header: string | null, secret = config.stripe.webhookSecret): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, ...v] = kv.split("=");
      return [k.trim(), v.join("=")];
    }),
  ) as Record<string, string>;
  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const signatures = header
    .split(",")
    .filter((kv) => kv.trim().startsWith("v1="))
    .map((kv) => kv.trim().slice(3));
  return signatures.some((sig) => sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
}
