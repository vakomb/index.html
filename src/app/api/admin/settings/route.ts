/** PATCH /api/admin/settings { markup } — adjusts the global markup coefficient. */
import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { updateMarkup } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as { markup?: unknown } | null;
  const markup = Math.round(Number(body?.markup) * 100) / 100;
  const { minMarkup, maxMarkup } = config.pricing;
  if (!Number.isFinite(markup) || markup < minMarkup || markup > maxMarkup) {
    return NextResponse.json({ ok: false, message: `Koeficientas turi būti tarp ${minMarkup} ir ${maxMarkup}.` }, { status: 422 });
  }
  const settings = await updateMarkup(markup);
  return NextResponse.json({ ok: true, settings });
}
