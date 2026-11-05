"use client";

/**
 * Local shopping cart state.
 *
 * - Persisted to localStorage (survives reloads, never leaves the device
 *   until checkout).
 * - Pure reducer → state updates are synchronous and render in a single frame,
 *   comfortably inside the 120 ms interaction budget.
 * - Prices stored here are display snapshots only; the server re-quotes every
 *   line at checkout.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";

export const MAX_QTY = 10;
const STORAGE_KEY = "lenkynas.cart.v1";

export interface CartItem {
  offerId: string;
  title: string;
  image: string;
  unitEur: number;
  deliveryLabel: string;
  quantity: number;
}

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "setQty"; offerId: string; quantity: number }
  | { type: "remove"; offerId: string }
  | { type: "reprice"; prices: Record<string, number> }
  | { type: "clear" };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const existing = state.find((i) => i.offerId === action.item.offerId);
      if (existing) {
        return state.map((i) =>
          i.offerId === action.item.offerId ? { ...i, ...action.item, quantity: Math.min(MAX_QTY, i.quantity + action.quantity) } : i,
        );
      }
      return [...state, { ...action.item, quantity: Math.min(MAX_QTY, action.quantity) }];
    }
    case "setQty":
      return action.quantity <= 0
        ? state.filter((i) => i.offerId !== action.offerId)
        : state.map((i) => (i.offerId === action.offerId ? { ...i, quantity: Math.min(MAX_QTY, action.quantity) } : i));
    case "remove":
      return state.filter((i) => i.offerId !== action.offerId);
    case "reprice":
      return state.map((i) => (action.prices[i.offerId] !== undefined ? { ...i, unitEur: action.prices[i.offerId] } : i));
    case "clear":
      return [];
  }
}

interface Toast {
  id: number;
  message: string;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotalEur: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQty: (offerId: string, quantity: number) => void;
  remove: (offerId: string) => void;
  reprice: (prices: Record<string, number>) => void;
  clear: () => void;
  toast: Toast | null;
  notify: (message: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate after mount to keep SSR markup deterministic.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) dispatch({ type: "hydrate", items: parsed.filter((i) => i && i.offerId && i.quantity > 0) });
      }
    } catch {
      /* storage unavailable or corrupted — start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota / private mode — cart still works in memory */
    }
  }, [items, hydrated]);

  // Sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        dispatch({ type: "hydrate", items: e.newValue ? (JSON.parse(e.newValue) as CartItem[]) : [] });
      } catch {
        /* ignore malformed payloads */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    document.documentElement.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  const notify = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotalEur: Math.round(items.reduce((s, i) => s + i.unitEur * i.quantity, 0) * 100) / 100,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: (item, quantity = 1) => dispatch({ type: "add", item, quantity }),
      setQty: (offerId, quantity) => dispatch({ type: "setQty", offerId, quantity }),
      remove: (offerId) => dispatch({ type: "remove", offerId }),
      reprice: (prices) => dispatch({ type: "reprice", prices }),
      clear: () => dispatch({ type: "clear" }),
      toast,
      notify,
    }),
    [items, hydrated, isOpen, toast, notify],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
