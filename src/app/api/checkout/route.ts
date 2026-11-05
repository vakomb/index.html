/**
 * POST /api/checkout  { input: CheckoutInput, lines: [{ offerId, quantity }] }
 *
 * Creates the order (validated + re-priced server-side), then:
 *  • Stripe configured → returns a hosted Checkout URL (Apple Pay, Google Pay,
 *    Revolut Pay, cards — per your Stripe Dashboard settings).
 *  • No Stripe key     → returns the order id for the built-in mock sheet.
 */
import { NextResponse } from "next/server";
import { paymentMode } from "@/lib/config";
import { attachSession, createOrder } from "@/lib/orders";
import { createCheckoutSession } from "@/lib/stripe";
import type { CheckoutInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { input?: Partial<CheckoutInput>; lines?: unknown } | null;
  if (!body?.input) return NextResponse.json({ message: "Neteisinga užklausa." }, { status: 400 });

  const input: CheckoutInput = {
    fullName: String(body.input.fullName ?? ""),
    email: String(body.input.email ?? ""),
    phone: String(body.input.phone ?? ""),
    deliveryType: body.input.deliveryType === "kurjeris" ? "kurjeris" : "pastomatas",
    lockerId: body.input.lockerId ? String(body.input.lockerId) : undefined,
    address: body.input.address ? String(body.input.address) : undefined,
    city: body.input.city ? String(body.input.city) : undefined,
    postalCode: body.input.postalCode ? String(body.input.postalCode) : undefined,
    acceptTerms: body.input.acceptTerms === true,
    paymentMethod: body.input.paymentMethod ?? "card",
  };

  const mode = paymentMode();
  const result = await createOrder(input, body.lines, mode);
  if (!result.ok) return NextResponse.json(result, { status: 422 });

  if (mode === "stripe") {
    try {
      const session = await createCheckoutSession(result.order);
      await attachSession(result.order.id, session.id);
      return NextResponse.json({ ok: true, orderId: result.order.id, redirectUrl: session.url });
    } catch (err) {
      console.error("[checkout] Stripe session failed:", (err as Error).message);
      return NextResponse.json({ ok: false, message: "Mokėjimo paslauga laikinai nepasiekiama. Bandykite dar kartą." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, orderId: result.order.id, mock: true, totalEur: result.order.totals.totalEur });
}
