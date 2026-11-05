/**
 * POST /api/webhooks/stripe
 * Configure in Stripe Dashboard → Developers → Webhooks with events:
 *   checkout.session.completed, checkout.session.async_payment_succeeded
 * Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
 */
import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/stripe";

export const dynamic = "force-dynamic";

interface StripeEvent {
  type: string;
  data: { object: { id: string; payment_status?: string; metadata?: Record<string, string>; client_reference_id?: string } };
}

export async function POST(request: Request) {
  const payload = await request.text();
  if (!verifyWebhookSignature(payload, request.headers.get("stripe-signature"))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (orderId && session.payment_status === "paid") await markOrderPaid(orderId, session.id);
  }
  return NextResponse.json({ received: true });
}
