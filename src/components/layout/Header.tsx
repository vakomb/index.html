"use client";

/**
 * Floating glass navigation layer + native-style mobile tab bar.
 * Owns the category drawer state so both bars can open it.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/format";
import { useCart } from "../cart/CartProvider";
import { IconBag, IconGrid, IconHome, IconMenu, IconSearch } from "../Icons";
import { CategoryDrawer } from "./CategoryDrawer";
import { FOCUS_SEARCH_EVENT, SearchBox } from "./SearchBox";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-baseline gap-0.5 select-none", className)} aria-label="Lenkynas — pradžia">
      <span className="text-[20px] font-semibold tracking-[-0.055em] text-ink">Lenkynas</span>
      <span className="text-[11px] font-medium tracking-tight text-neutral-400 transition-colors group-hover:text-ink">.lt</span>
    </Link>
  );
}

function CartButton({ className }: { className?: string }) {
  const { count, hydrated, open } = useCart();
  return (
    <button onClick={open} className={cn("tap relative grid h-10 w-10 place-items-center rounded-full hover:bg-black/[0.04]", className)} aria-label="Atidaryti krepšelį">
      <IconBag />
      {hydrated && count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold tabular-nums text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export function Header() {
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const pathname = usePathname();
  const { count, hydrated, open: openCart } = useCart();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2.5 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+10px)] md:flex-nowrap md:gap-6 md:px-8 md:py-3">
          <button
            onClick={() => setDrawer(true)}
            className="tap -ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-black/[0.04] md:ml-0 md:flex md:w-auto md:gap-2 md:px-3"
            aria-label="Kategorijos"
          >
            <IconMenu />
            <span className="hidden text-[13px] font-medium md:inline">Kategorijos</span>
          </button>

          <Wordmark className="mr-auto md:mr-0" />

          <div className="order-last w-full md:order-none md:mx-auto md:max-w-xl md:flex-1">
            <Suspense fallback={<div className="h-10 rounded-full bg-black/[0.04]" />}>
              <SearchBox />
            </Suspense>
          </div>

          <CartButton className="-mr-2 md:mr-0" />
        </div>

        <nav aria-label="Pagrindinės kategorijos" className="hidden border-t border-black/5 md:block">
          <ul className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6">
            {CATEGORIES.map((c) => {
              const active = pathname === `/kategorija/${c.slug}`;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/kategorija/${c.slug}`}
                    className={cn(
                      "relative block whitespace-nowrap px-3 py-2.5 text-[13px] transition-colors",
                      active ? "font-medium text-ink" : "text-neutral-500 hover:text-ink",
                    )}
                  >
                    {c.name}
                    {active && <span className="absolute inset-x-3 -bottom-px h-px bg-ink" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <CategoryDrawer open={drawer} onClose={closeDrawer} />

      {/* Mobile tab bar */}
      <nav
        aria-label="Navigacija"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/85 backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-4">
          {[
            { label: "Pradžia", icon: <IconHome size={22} />, href: "/", active: pathname === "/" },
            { label: "Kategorijos", icon: <IconGrid size={22} />, onClick: () => setDrawer(true), active: pathname.startsWith("/kategorija") },
            {
              label: "Paieška",
              icon: <IconSearch size={22} />,
              onClick: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                window.dispatchEvent(new Event(FOCUS_SEARCH_EVENT));
              },
              active: pathname === "/paieska",
            },
            { label: "Krepšelis", icon: <IconBag size={22} />, onClick: openCart, active: false, badge: hydrated ? count : 0 },
          ].map((tab) => {
            const inner = (
              <>
                <span className="relative">
                  {tab.icon}
                  {!!tab.badge && (
                    <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-semibold text-white">
                      {tab.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </>
            );
            const cls = cn("tap flex h-14 w-full flex-col items-center justify-center gap-0.5", tab.active ? "text-ink" : "text-neutral-400");
            return (
              <li key={tab.label}>
                {tab.href ? (
                  <Link href={tab.href} className={cls} aria-current={tab.active ? "page" : undefined}>
                    {inner}
                  </Link>
                ) : (
                  <button type="button" onClick={tab.onClick} className={cls}>
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
