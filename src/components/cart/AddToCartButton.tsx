"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import { IconCheck, IconMinus, IconPlus } from "../Icons";
import { MAX_QTY, useCart, type CartItem } from "./CartProvider";

type Snapshot = Omit<CartItem, "quantity">;

/** Compact card-level button: "Į krepšelį" → flashes an emerald confirmation. */
export function AddToCartButton({ product, disabled, className }: { product: Snapshot; disabled?: boolean; className?: string }) {
  const { add, notify } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        add(product, 1);
        notify("Prekė pridėta į krepšelį");
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
      className={cn(
        "tap inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border text-[13px] font-medium",
        added ? "border-accent bg-accent text-white" : "border-black/10 bg-white text-ink hover:border-ink hover:bg-ink hover:text-white",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      aria-live="polite"
    >
      {added ? (
        <>
          <IconCheck size={15} /> Pridėta
        </>
      ) : disabled ? (
        "Išparduota"
      ) : (
        "Į krepšelį"
      )}
    </button>
  );
}

/** Product page: quantity stepper + primary add-to-cart action. */
export function QuantityAddToCart({ product, disabled }: { product: Snapshot; disabled?: boolean }) {
  const { add, open } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-stretch gap-3">
      <div className="flex h-12 items-center rounded-full border border-black/10">
        <button
          type="button"
          className="tap grid h-12 w-11 place-items-center rounded-l-full text-neutral-600 hover:text-ink disabled:opacity-30"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
          aria-label="Mažinti kiekį"
        >
          <IconMinus size={16} />
        </button>
        <span className="w-7 text-center text-[15px] font-medium tabular-nums" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          className="tap grid h-12 w-11 place-items-center rounded-r-full text-neutral-600 hover:text-ink disabled:opacity-30"
          onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
          disabled={qty >= MAX_QTY}
          aria-label="Didinti kiekį"
        >
          <IconPlus size={16} />
        </button>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          add(product, qty);
          open();
        }}
        className="tap h-12 flex-1 rounded-full bg-accent px-6 text-[15px] font-medium text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {disabled ? "Šiuo metu neturime" : "Į krepšelį"}
      </button>
    </div>
  );
}
