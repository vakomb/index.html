/**
 * Shared domain types.
 *
 * `Allegro*` types describe the normalised upstream payload (always PLN, always
 * Polish). `Product*` types describe what the storefront renders (always EUR,
 * always Lithuanian). Nothing PLN-denominated ever crosses into Product types
 * except the internal cost fields that never leave the server.
 */

export type CategorySlug =
  | "elektronika"
  | "drabuziai"
  | "namai-ir-sodas"
  | "autodalys"
  | "sportas"
  | "grozis";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  /** Allegro category id used in live mode. */
  allegroCategoryId: string;
  /** Single-glyph monochrome icon key used by the UI. */
  icon: "chip" | "shirt" | "leaf" | "gear" | "ball" | "drop";
}

/** One shipping option offered by the Allegro seller. */
export interface AllegroShippingRate {
  /** Destination country (ISO alpha-2). */
  countryCode: string;
  carrier: string;
  /**
   * Raw carrier delivery deadline as delivered by the upstream source.
   * Can be an ISO-8601 duration range ("PT72H/PT120H"), a Polish phrase
   * ("3-5 dni robocze") or plain numbers. Parsed by lib/logistics.ts.
   */
  deliveryTime: string;
  pricePln: number;
}

export interface AllegroParameter {
  name: string;
  values: string[];
}

/** Normalised Allegro offer — Polish text, PLN prices. */
export interface AllegroRawOffer {
  id: string;
  name: string;
  description: string;
  category: CategorySlug;
  pricePln: number;
  /** Reference price before discount, when the seller provides one. */
  priceBeforeDiscountPln?: number;
  images: string[];
  parameters: AllegroParameter[];
  stock: number;
  seller: { login: string; superSeller: boolean };
  shipping: AllegroShippingRate[];
  /** Sold units in the last 30 days — drives "popular" ranking. */
  popularity: number;
  tags: Array<"top" | "seasonal">;
}

export interface DeliveryEstimate {
  carrier: string;
  minDays: number;
  maxDays: number;
  /** "Pristatymas į Lietuvą: 3–5 d.d." */
  label: string;
  /** "lapkričio 10–12 d." */
  dateLabel: string;
}

/** Storefront-facing product — Lithuanian text, EUR prices. */
export interface Product {
  id: string;
  title: string;
  description: string;
  category: CategorySlug;
  priceEur: number;
  compareAtEur: number | null;
  discountPct: number | null;
  images: string[];
  parameters: AllegroParameter[];
  inStock: boolean;
  superSeller: boolean;
  delivery: DeliveryEstimate;
  popularity: number;
  tags: Array<"top" | "seasonal">;
}

/** Server-only cost information attached to a product during checkout. */
export interface ProductCost {
  pricePln: number;
  shippingCostPln: number;
  eurPerPln: number;
  markup: number;
}

export type SortKey = "popular" | "price-asc" | "price-desc" | "discount";

/* ───────────────────────────── Orders ───────────────────────────── */

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "ordered_on_allegro"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "apple_pay" | "google_pay" | "card";

export type DeliveryType = "pastomatas" | "kurjeris";

export interface OrderItem {
  offerId: string;
  title: string;
  image: string;
  quantity: number;
  unitEur: number;
  /** Upstream cost per unit, PLN (internal). */
  unitCostPln: number;
  /** Upstream shipping to LT for this line, PLN (internal). */
  shippingCostPln: number;
  deliveryLabel: string;
}

export interface OrderTotals {
  itemsEur: number;
  deliveryEur: number;
  totalEur: number;
  /** Upstream cost converted to EUR (items + Allegro shipping). */
  costEur: number;
  profitEur: number;
}

export interface OrderEvent {
  at: string;
  status: OrderStatus;
  note?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: { fullName: string; email: string; phone: string };
  delivery: {
    type: DeliveryType;
    lockerId?: string;
    lockerLabel?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  items: OrderItem[];
  totals: OrderTotals;
  payment: {
    method: PaymentMethod;
    provider: "stripe" | "mock";
    sessionId?: string;
    paidAt?: string;
  };
  pricingSnapshot: { eurPerPln: number; markup: number; fxSource: string };
  fulfillment: { allegroOrderRef?: string; trackingNumber?: string; notes?: string };
  timeline: OrderEvent[];
}

export interface Settings {
  markup: number;
  updatedAt: string;
}
