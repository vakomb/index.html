/**
 * GET /api/products?q=…&kategorija=…&limit=…
 * Powers the instant search dropdown. Returns customer-safe fields only
 * (EUR, Lithuanian) — no upstream cost data ever leaves the server.
 */
import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";
import { isCategorySlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const cat = url.searchParams.get("kategorija") ?? "";
  const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit")) || 12));

  if (q.length < 2) return NextResponse.json({ products: [], total: 0 });

  const all = await searchProducts(q, { category: isCategorySlug(cat) ? cat : undefined });
  return NextResponse.json(
    {
      total: all.length,
      products: all.slice(0, limit).map((p) => ({
        id: p.id,
        title: p.title,
        priceEur: p.priceEur,
        image: p.images[0],
        deliveryLabel: p.delivery.label,
      })),
    },
    { headers: { "Cache-Control": "private, max-age=15" } },
  );
}
