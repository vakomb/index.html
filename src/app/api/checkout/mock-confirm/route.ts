/**
 * POST /api/checkout/mock-confirm  { orderId }
 * Simulated payment capture. Disabled automatically once Stripe is configured.
 */
import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { getOrder, markOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (config.stripe.enabled) {
    return NextResponse.json({ ok: false, message: "Bandomieji mokėjimai išjungti." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { orderId?: string } | null;
  const orderId = String(body?.orderId ?? "");
  const order = await getOrder(orderId);
  if (!order) return NextResponse.json({ ok: false, message: "Užsakymas nerastas." }, { status: 404 });
  if (order.payment.provider !== "mock") {
    return NextResponse.json({ ok: false, message: "Šis užsakymas apmokamas per Stripe." }, { status: 409 });
  }

  // Simulated processor round-trip.
  await new Promise((r) => setTimeout(r, 600));
  await markOrderPaid(orderId, `mock_${Date.now()}`);
  return NextResponse.json({ ok: true, redirectUrl: `/uzsakymas/${orderId}` });
}
