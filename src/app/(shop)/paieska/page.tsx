import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/ProductRow";
import { SortSelect } from "@/components/product/SortSelect";
import { parseSort, searchProducts } from "@/lib/catalog";
import { CATEGORIES, isCategorySlug } from "@/lib/categories";
import { cn, pluralPrekes } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; kategorija?: string; rikiuoti?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `„${q}“ paieškos rezultatai` : "Paieška", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", kategorija, rikiuoti } = await searchParams;
  const query = q.trim().slice(0, 100);
  const category = kategorija && isCategorySlug(kategorija) ? kategorija : undefined;
  const sort = parseSort(rikiuoti);
  const products = query ? await searchProducts(query, { category, sort }) : [];

  const chipHref = (slug?: string) => {
    const p = new URLSearchParams({ q: query });
    if (slug) p.set("kategorija", slug);
    if (rikiuoti) p.set("rikiuoti", rikiuoti);
    return `/paieska?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8 md:pt-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Paieška</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] md:text-[34px]">
            {query ? <>„{query}“</> : "Ką norėtumėte rasti?"}
          </h1>
          {query && <p className="mt-1 text-[13px] text-neutral-500">Rasta: {pluralPrekes(products.length)}</p>}
        </div>
        {query && (
          <Suspense>
            <SortSelect value={sort} />
          </Suspense>
        )}
      </header>

      {query && (
        <ul className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {[{ slug: undefined, name: "Visos" }, ...CATEGORIES].map((c) => {
            const active = c.slug === category;
            return (
              <li key={c.name} className="shrink-0">
                <Link
                  href={chipHref(c.slug)}
                  className={cn(
                    "tap flex h-9 items-center rounded-full border px-4 text-[13px] font-medium",
                    active ? "border-ink bg-ink text-white" : "border-black/10 hover:border-ink",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8">
        {!query ? (
          <p className="rounded-2xl bg-canvas px-6 py-16 text-center text-sm text-neutral-500">
            Įveskite prekės pavadinimą, prekės ženklą arba kategoriją paieškos laukelyje.
          </p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-canvas px-6 py-16 text-center">
            <p className="font-medium">Atitikmenų nerasta</p>
            <p className="mt-1 text-sm text-neutral-500">Patikrinkite rašybą arba naudokite bendresnį raktažodį, pvz., „ausinės“.</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
