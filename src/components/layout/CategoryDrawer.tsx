"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/format";
import { CategoryIcon, IconChevronRight, IconClose } from "../Icons";

/** Native-like slide-out category hierarchy panel. */
export function CategoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-[60]", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn("absolute inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
      />
      <nav
        aria-label="Kategorijos"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[86%] max-w-[360px] flex-col bg-white shadow-[0_0_60px_rgba(0,0,0,0.08)]",
          "transition-transform duration-[220ms] ease-[var(--ease-ios)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/5 px-5">
          <span className="text-[15px] font-semibold tracking-tight">Kategorijos</span>
          <button onClick={onClose} className="tap grid h-10 w-10 place-items-center rounded-full hover:bg-canvas" aria-label="Uždaryti">
            <IconClose />
          </button>
        </header>
        <ul className="flex-1 overflow-y-auto px-3 py-3">
          {CATEGORIES.map((c) => {
            const active = pathname === `/kategorija/${c.slug}`;
            return (
              <li key={c.slug}>
                <Link
                  href={`/kategorija/${c.slug}`}
                  onClick={onClose}
                  className={cn("tap flex items-center gap-4 rounded-2xl px-3 py-3.5", active ? "bg-canvas" : "hover:bg-canvas")}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/5 bg-white">
                    <CategoryIcon icon={c.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{c.name}</span>
                    <span className="line-clamp-1 text-xs text-neutral-500">{c.description}</span>
                  </span>
                  <IconChevronRight size={16} className="text-neutral-300" />
                </Link>
              </li>
            );
          })}
        </ul>
        <footer className="pb-safe border-t border-black/5 px-5 py-4 text-xs leading-relaxed text-neutral-500">
          Visos kainos eurais su PVM. Rodomos tik prekės, kurias galima pristatyti į Lietuvą.
        </footer>
      </nav>
    </div>
  );
}
