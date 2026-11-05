import Link from "next/link";
import type { Product } from "@/lib/types";
import { IconChevronRight } from "../Icons";
import { ProductCard } from "./ProductCard";

/**
 * Horizontal, snap-scrolling row on mobile (native carousel feel);
 * multi-column grid matrix on desktop.
 */
export function ProductRow({
  title,
  subtitle,
  href,
  products,
  priority = false,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  products: Product[];
  priority?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[19px] font-semibold tracking-[-0.03em] md:text-[22px]">{title}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-neutral-500">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="tap flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-neutral-500 hover:text-ink">
            Visos <IconChevronRight size={14} />
          </Link>
        )}
      </div>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-10 md:overflow-visible md:px-0 lg:grid-cols-5">
        {products.map((p, i) => (
          <li key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <ProductCard product={p} priority={priority && i < 4} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 md:gap-x-5 md:gap-y-12 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
