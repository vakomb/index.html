import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuantityAddToCart } from "@/components/cart/AddToCartButton";
import { IconBadge, IconLock, IconReturn, IconTruck } from "@/components/Icons";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductRow } from "@/components/product/ProductRow";
import { getProduct, getRelatedProducts } from "@/lib/catalog";
import { getCategory } from "@/lib/categories";
import { formatEur } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  if (!product) return { title: "Prekė nerasta" };
  return {
    title: product.title,
    description: `${product.description.slice(0, 150)} Kaina ${formatEur(product.priceEur)}. ${product.delivery.label}.`,
    openGraph: { title: product.title, images: product.images[0]?.startsWith("http") ? [product.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).id);
  // Unknown ids AND offers suppressed by the LT logistics filter both 404.
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = await getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.priceEur.toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-7xl px-4 pt-4 md:px-8 md:pt-8">
        <nav aria-label="Naršymo kelias" className="mb-4 hidden text-xs text-neutral-400 md:block">
          <Link href="/" className="hover:text-ink">
            Pradžia
          </Link>
          <span className="mx-1.5">/</span>
          {category && (
            <>
              <Link href={`/kategorija/${category.slug}`} className="hover:text-ink">
                {category.name}
              </Link>
              <span className="mx-1.5">/</span>
            </>
          )}
          <span className="text-neutral-600">{product.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-14">
          <ProductGallery images={product.images} title={product.title} />

          <div>
            {category && (
              <Link href={`/kategorija/${category.slug}`} className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400 hover:text-ink">
                {category.name}
              </Link>
            )}
            <h1 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.035em] md:text-[32px]">{product.title}</h1>

            {product.superSeller && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/5 px-3 py-1 text-xs text-neutral-600">
                <IconBadge size={14} /> Patikrintas pardavėjas
              </p>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-[30px] font-semibold tracking-[-0.03em] tabular-nums">{formatEur(product.priceEur)}</span>
              {product.compareAtEur && (
                <>
                  <s className="text-base text-neutral-400 tabular-nums">{formatEur(product.compareAtEur)}</s>
                  <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-white">−{product.discountPct}%</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">Kaina su PVM. Galutinė kaina — jokių papildomų muitų ar mokesčių.</p>

            <div className="mt-6 rounded-2xl border border-black/5 p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas">
                  <IconTruck size={18} />
                </span>
                <div className="text-[13px]">
                  <p className="font-medium">{product.delivery.label}</p>
                  <p className="mt-0.5 text-neutral-500">
                    Numatoma pristatymo data: <span className="text-ink">{product.delivery.dateLabel}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">Į paštomatą arba kurjeriu iki durų. Užsakymai iki 14:00 apdorojami tą pačią dieną.</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <QuantityAddToCart
                disabled={!product.inStock}
                product={{
                  offerId: product.id,
                  title: product.title,
                  image: product.images[0],
                  unitEur: product.priceEur,
                  deliveryLabel: product.delivery.label,
                }}
              />
            </div>

            <ul className="mt-6 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <IconLock size={16} /> Saugus apmokėjimas
              </li>
              <li className="flex items-center gap-2">
                <IconReturn size={16} /> 14 dienų grąžinimo teisė
              </li>
            </ul>

            <section className="mt-10 border-t border-black/5 pt-8">
              <h2 className="text-[15px] font-semibold tracking-tight">Aprašymas</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{product.description}</p>
            </section>

            {product.parameters.length > 0 && (
              <section className="mt-8">
                <h2 className="text-[15px] font-semibold tracking-tight">Specifikacijos</h2>
                <dl className="mt-3 divide-y divide-black/5 text-[13px]">
                  {product.parameters.map((p) => (
                    <div key={p.name} className="grid grid-cols-2 gap-4 py-2.5">
                      <dt className="text-neutral-500">{p.name}</dt>
                      <dd>{p.values.join(", ")}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ProductRow title="Panašios prekės" href={category ? `/kategorija/${category.slug}` : undefined} products={related.slice(0, 5)} />
      </div>
    </>
  );
}
