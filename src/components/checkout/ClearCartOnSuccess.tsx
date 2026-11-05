"use client";

import { useEffect } from "react";
import { useCart } from "../cart/CartProvider";

/** Empties the local cart once the server has confirmed payment. */
export function ClearCartOnSuccess() {
  const { clear, hydrated } = useCart();
  useEffect(() => {
    if (hydrated) clear();
  }, [hydrated, clear]);
  return null;
}
