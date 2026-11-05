/**
 * Order service — quoting, creation, payment capture and fulfilment.
 *
 * Prices are ALWAYS recomputed server-side from the catalogue engine; the
 * client cart is treated as a list of ids and quantities only.
 */
import crypto from "node:crypto";
import { config } from "./config";
import { getPricingContext, getProductWithCost } from "./catalog";
import { getLocker, lockerLabel } from "./lockers";
import { roundCents, toCostEur } from "./pricing";
import { STATUS_FLOW, STATUS_LABELS } from "./status";
import { getOrder, insertOrder, listOrders, mutateOrder } from "./store";
import { normalizeLtPhone, normalizePostalCode, validateCheckout, type CheckoutErrors, type CheckoutInput } from "./validation";
import type { Order, OrderItem, OrderStatus, PaymentMethod } from "./types";

export const MAX_QTY_PER_LINE = 10;
const MAX_LINES = 30;

export interface CartLineInput {
  offerId: string;
  quantity: number;
}

export interface Quote {
  lines: OrderItem[];
  unavailable: string[];
  itemsEur: number;
  deliveryEur: number;
  totalEur: number;
  freeDeliveryFromEur: number;
}

function sanitizeLines(lines: unknown): CartLineInput[] {
  if (!Array.isArray(lines)) return [];
  const merged = new Map<string, number>();
  for (const l of lines.slice(0, MAX_LINES)) {
    const id = String((l as CartLineInput)?.offerId ?? "");
    const qty = Math.floor(Number((l as CartLineInput)?.quantity));
    if (!/^\d{6,14}$/.test(id) || !Number.isFinite(qty) || qty < 1) continue;
    merged.set(id, Math.min(MAX_QTY_PER_LINE, (merged.get(id) ?? 0) + qty));
  }
  return [...merged].map(([offerId, quantity]) => ({ offerId, quantity }));
}

export function deliveryFeeFor(itemsEur: number): number {
  if (itemsEur <= 0) return 0;
  return itemsEur >= config.pricing.freeDeliveryFromEur ? 0 : config.pricing.deliveryFeeEur;
}

/** Authoritative price quote for a cart. */
export async function quoteCart(rawLines: unknown): Promise<Quote> {
  const lines = sanitizeLines(rawLines);
  const resolved = await Promise.all(lines.map(async (l) => ({ l, built: await getProductWithCost(l.offerId) })));

  const unavailable: string[] = [];
  const items: OrderItem[] = [];
  for (const { l, built } of resolved) {
    if (!built || !built.product.inStock) {
      unavailable.push(l.offerId);
      continue;
    }
    items.push({
      offerId: built.product.id,
      title: built.product.title,
      image: built.product.images[0] ?? "",
      quantity: l.quantity,
      unitEur: built.product.priceEur,
      unitCostPln: built.cost.pricePln,
      shippingCostPln: built.cost.shippingCostPln,
      deliveryLabel: built.product.delivery.label,
    });
  }

  const itemsEur = roundCents(items.reduce((s, i) => s + i.unitEur * i.quantity, 0));
  const deliveryEur = deliveryFeeFor(itemsEur);
  return {
    lines: items,
    unavailable,
    itemsEur,
    deliveryEur,
    totalEur: roundCents(itemsEur + deliveryEur),
    freeDeliveryFromEur: config.pricing.freeDeliveryFromEur,
  };
}

function newOrderId(): string {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `LK-${ymd}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; errors?: CheckoutErrors; message: string; unavailable?: string[] };

const PAYMENT_METHODS: PaymentMethod[] = ["apple_pay", "google_pay", "card"];

export async function createOrder(input: CheckoutInput, rawLines: unknown, provider: "stripe" | "mock"): Promise<CreateOrderResult> {
  const errors = validateCheckout(input);
  if (Object.keys(errors).length > 0) return { ok: false, errors, message: "Patikrinkite pažymėtus laukus." };
  if (!PAYMENT_METHODS.includes(input.paymentMethod)) return { ok: false, message: "Pasirinkite mokėjimo būdą." };

  const quote = await quoteCart(rawLines);
  if (quote.lines.length === 0) return { ok: false, message: "Jūsų krepšelis tuščias." };
  if (quote.unavailable.length > 0) {
    return { ok: false, message: "Kai kurios prekės nebeprieinamos. Atnaujinkite krepšelį.", unavailable: quote.unavailable };
  }

  const ctx = await getPricingContext();
  const costPln = quote.lines.reduce((s, l) => s + l.unitCostPln * l.quantity + l.shippingCostPln, 0);
  const costEur = toCostEur(costPln, ctx.eurPerPln);
  const locker = input.deliveryType === "pastomatas" ? getLocker(input.lockerId!) : undefined;
  const now = new Date().toISOString();

  const order: Order = {
    id: newOrderId(),
    createdAt: now,
    status: "pending_payment",
    customer: {
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: normalizeLtPhone(input.phone)!,
    },
    delivery:
      input.deliveryType === "pastomatas"
        ? { type: "pastomatas", lockerId: locker!.id, lockerLabel: lockerLabel(locker!) }
        : {
            type: "kurjeris",
            address: input.address!.trim(),
            city: input.city!.trim(),
            postalCode: normalizePostalCode(input.postalCode!)!,
          },
    items: quote.lines,
    totals: {
      itemsEur: quote.itemsEur,
      deliveryEur: quote.deliveryEur,
      totalEur: quote.totalEur,
      costEur,
      profitEur: roundCents(quote.totalEur - costEur),
    },
    payment: { method: input.paymentMethod, provider },
    pricingSnapshot: { eurPerPln: ctx.eurPerPln, markup: ctx.markup, fxSource: ctx.fxSource },
    fulfillment: {},
    timeline: [{ at: now, status: "pending_payment", note: "Užsakymas sukurtas" }],
  };

  await insertOrder(order);
  return { ok: true, order };
}

/** Idempotent payment capture (webhook, success-page verification or mock). */
export async function markOrderPaid(orderId: string, sessionId?: string): Promise<Order | null> {
  return mutateOrder(orderId, (o) => {
    if (o.status !== "pending_payment") return;
    const at = new Date().toISOString();
    o.status = "paid";
    o.payment.paidAt = at;
    if (sessionId) o.payment.sessionId = sessionId;
    o.timeline.push({ at, status: "paid", note: o.payment.provider === "mock" ? "Bandomasis mokėjimas patvirtintas" : "Stripe mokėjimas patvirtintas" });
  });
}

export async function attachSession(orderId: string, sessionId: string): Promise<void> {
  await mutateOrder(orderId, (o) => {
    o.payment.sessionId = sessionId;
  });
}

/* ───────────────────────────── Back-office ───────────────────────────── */

export { STATUS_FLOW, STATUS_LABELS };

export async function updateFulfilment(
  orderId: string,
  patch: { status?: OrderStatus; allegroOrderRef?: string; trackingNumber?: string; notes?: string },
): Promise<Order | null> {
  return mutateOrder(orderId, (o) => {
    if (patch.allegroOrderRef !== undefined) o.fulfillment.allegroOrderRef = patch.allegroOrderRef.trim().slice(0, 80);
    if (patch.trackingNumber !== undefined) o.fulfillment.trackingNumber = patch.trackingNumber.trim().slice(0, 80);
    if (patch.notes !== undefined) o.fulfillment.notes = patch.notes.trim().slice(0, 500);
    if (patch.status && patch.status !== o.status && STATUS_LABELS[patch.status]) {
      o.status = patch.status;
      o.timeline.push({ at: new Date().toISOString(), status: patch.status });
    }
  });
}

const REVENUE_STATUSES: OrderStatus[] = ["paid", "ordered_on_allegro", "shipped", "delivered"];

export interface DashboardMetrics {
  revenueEur: number;
  profitEur: number;
  marginPct: number;
  paidOrders: number;
  avgOrderEur: number;
  pipeline: Record<OrderStatus, number>;
  daily: Array<{ date: string; revenueEur: number; profitEur: number }>;
}

export async function getDashboardMetrics(): Promise<{ orders: Order[]; metrics: DashboardMetrics }> {
  const orders = await listOrders();
  const paid = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const revenueEur = roundCents(paid.reduce((s, o) => s + o.totals.totalEur, 0));
  const profitEur = roundCents(paid.reduce((s, o) => s + o.totals.profitEur, 0));

  const pipeline = Object.fromEntries(Object.keys(STATUS_LABELS).map((k) => [k, 0])) as Record<OrderStatus, number>;
  for (const o of orders) pipeline[o.status]++;

  const daily: DashboardMetrics["daily"] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const dayOrders = paid.filter((o) => (o.payment.paidAt ?? o.createdAt).slice(0, 10) === day);
    daily.push({
      date: day,
      revenueEur: roundCents(dayOrders.reduce((s, o) => s + o.totals.totalEur, 0)),
      profitEur: roundCents(dayOrders.reduce((s, o) => s + o.totals.profitEur, 0)),
    });
  }

  return {
    orders,
    metrics: {
      revenueEur,
      profitEur,
      marginPct: revenueEur > 0 ? Math.round((profitEur / revenueEur) * 1000) / 10 : 0,
      paidOrders: paid.length,
      avgOrderEur: paid.length ? roundCents(revenueEur / paid.length) : 0,
      pipeline,
      daily,
    },
  };
}

export { getOrder };
