/** PATCH /api/admin/orders/:id { status?, allegroOrderRef?, trackingNumber?, notes? } */
import { NextResponse } from "next/server";
import { STATUS_LABELS, updateFulfilment } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, message: "Neteisinga užklausa." }, { status: 400 });

  const status = body.status as OrderStatus | undefined;
  if (status !== undefined && !(status in STATUS_LABELS)) {
    return NextResponse.json({ ok: false, message: "Nežinoma būsena." }, { status: 422 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const order = await updateFulfilment(id, {
    status,
    allegroOrderRef: str(body.allegroOrderRef),
    trackingNumber: str(body.trackingNumber),
    notes: str(body.notes),
  });
  if (!order) return NextResponse.json({ ok: false, message: "Užsakymas nerastas." }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}
