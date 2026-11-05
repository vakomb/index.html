"use client";

import { IconCheck } from "../Icons";
import { useCart } from "./CartProvider";

/** iOS-style confirmation pill. Sits above the mobile tab bar. */
export function Toast() {
  const { toast, open } = useCart();
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      role="status"
      className="animate-toast fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink py-2 pl-3 pr-2 text-[13px] text-white shadow-lg md:bottom-8"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-accent">
        <IconCheck size={14} />
      </span>
      <span className="whitespace-nowrap">{toast.message}</span>
      <button onClick={open} className="tap rounded-full bg-white/10 px-3 py-1 font-medium hover:bg-white/20">
        Peržiūrėti
      </button>
    </div>
  );
}
