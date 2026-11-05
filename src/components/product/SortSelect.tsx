"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SortKey } from "@/lib/types";
import { Spinner } from "../Icons";

const OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "popular", label: "Populiariausios" },
  { value: "price-asc", label: "Pigiausios" },
  { value: "price-desc", label: "Brangiausios" },
  { value: "discount", label: "Didžiausia nuolaida" },
];

/** URL-driven sort control (shareable, back-button friendly). */
export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-[13px] text-neutral-500">
      {pending ? <Spinner size={14} /> : <span className="hidden sm:inline">Rikiuoti:</span>}
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "popular") next.delete("rikiuoti");
          else next.set("rikiuoti", e.target.value);
          const qs = next.toString();
          startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
        }}
        className="h-9 cursor-pointer rounded-full border border-black/10 bg-white px-3 pr-8 text-[13px] font-medium text-ink outline-none hover:border-ink"
        style={{ fontSize: 13 }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
