import Link from "next/link";
import { formatEur } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "../cart/AddToCartButton";
import { IconTruck } from "../Icons";

/** Grid/row product tile: EUR price, MSRP discount marker, LT delivery window, add-to-cart. */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/produktas/${product.id}`} className="tap block" prefetch={false}>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-500 ease-[var(--ease-ios)] group-hover:scale-[1.03]"
          />
          {product.discountPct && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              −{product.discountPct}%
            </span>
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-[2.6em] text-[13px] leading-[1.3] text-neutral-800">{product.title}</h3>
      </Link>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[15px] font-semibold tracking-tight tabular-nums">{formatEur(product.priceEur)}</span>
        {product.compareAtEur && (
          <s className="text-xs text-neutral-400 tabular-nums" aria-label="Kaina be nuolaidos">
            {formatEur(product.compareAtEur)}
          </s>
        )}
      </div>

      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
        <IconTruck size={14} className="shrink-0" />
        <span className="line-clamp-1">{product.delivery.label}</span>
      </p>

      <div className="mt-auto pt-3">
        <AddToCartButton
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
    </article>
  );
}
