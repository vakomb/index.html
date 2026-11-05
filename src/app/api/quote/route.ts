/**
 * POST /api/quote  { lines: [{ offerId, quantity }] }
 * Authoritative server-side re-pricing of the cart (handles markup/FX changes
 * and offers that went out of stock or lost LT shipping since being added).
 */
import { NextResponse } from "next/server";
import { quoteCart } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { lines?: unknown } | null;
  const quote = await quoteCart(body?.lines);

  // Strip internal cost fields before responding.
  return NextResponse.json({
    lines: quote.lines.map(({ offerId, title, image, quantity, unitEur, deliveryLabel }) => ({
      offerId,
      title,
      image,
      quantity,
      unitEur,
      deliveryLabel,
    })),
    unavailable: quote.unavailable,
    itemsEur: quote.itemsEur,
    deliveryEur: quote.deliveryEur,
    totalEur: quote.totalEur,
    freeDeliveryFromEur: quote.freeDeliveryFromEur,
  });
}
