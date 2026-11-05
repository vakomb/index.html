/** Order status vocabulary — pure module, safe for client components. */
import type { OrderStatus } from "./types";

export const STATUS_FLOW: OrderStatus[] = ["pending_payment", "paid", "ordered_on_allegro", "shipped", "delivered"];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Laukiama apmokėjimo",
  paid: "Apmokėta",
  ordered_on_allegro: "Užsakyta Allegro",
  shipped: "Išsiųsta",
  delivered: "Pristatyta",
  cancelled: "Atšaukta",
};
