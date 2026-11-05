import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/Icons";
import { ProductGrid } from "@/components/product/ProductRow";
import { SortSelect } from "@/components/product/SortSelect";
import { getCategoryProducts, parseSort } from "@/lib/catalog";
import { getCategory } from "@/lib/categories";
import { pluralPrekes } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rikiuoti?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { rikiuoti }] = await Promise.all([params, searchParams]);
  const category = getCategory(slug);
  if (!category) notFound();

  const sort = parseSort(rikiuoti);
  const products = await getCategoryProducts(category.slug, sort);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8 md:pt-10">
      <nav aria-label="Naršymo kelias" className="text-xs text-neutral-400">
        <Link href="/" className="hover:text-ink">
          Pradžia
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-neutral-600">{category.name}</span>
      </nav>

      <header className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-black/5">
            <CategoryIcon icon={category.icon} size={22} />
          </span>
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.04em] md:text-[34px]">{category.name}</h1>
            <p className="text-[13px] text-neutral-500">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-y border-black/5 py-2 md:border-0 md:py-0">
          <span className="text-[13px] text-neutral-500">{pluralPrekes(products.length)}</span>
          <Suspense>
            <SortSelect value={sort} />
          </Suspense>
        </div>
      </header>

      <div className="mt-8">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p className="rounded-2xl bg-canvas px-6 py-16 text-center text-sm text-neutral-500">
            Šioje kategorijoje šiuo metu nėra prekių, kurias galėtume pristatyti į Lietuvą.
          </p>
        )}
      </div>
    </div>
  );
}
