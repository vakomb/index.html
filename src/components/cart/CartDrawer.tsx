"use client";

import Link from "next/link";
import { useEffect } from "react";
import { cn, formatEur, pluralPrekes } from "@/lib/format";
import { IconBag, IconClose, IconMinus, IconPlus, IconTrash, IconTruck } from "../Icons";
import { MAX_QTY, useCart } from "./CartProvider";

interface Props {
  deliveryFeeEur: number;
  freeDeliveryFromEur: number;
}

/** Slide-out persistent cart panel. */
export function CartDrawer({ deliveryFeeEur, freeDeliveryFromEur }: Props) {
  const { items, isOpen, close, setQty, remove, count, subtotalEur } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const remaining = Math.max(0, freeDeliveryFromEur - subtotalEur);
  const progress = Math.min(100, (subtotalEur / freeDeliveryFromEur) * 100);
  const deliveryEur = subtotalEur === 0 || remaining === 0 ? 0 : deliveryFeeEur;

  return (
    <div className={cn("fixed inset-0 z-[60]", isOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={cn("absolute inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity duration-200", isOpen ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Pirkinių krepšelis"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-[0_0_60px_rgba(0,0,0,0.08)]",
          "transition-transform duration-[220ms] ease-[var(--ease-ios)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/5 px-5">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight">Krepšelis</h2>
            <p className="text-xs text-neutral-500">{count > 0 ? pluralPrekes(count) : "Tuščias"}</p>
          </div>
          <button onClick={close} className="tap grid h-10 w-10 place-items-center rounded-full hover:bg-canvas" aria-label="Uždaryti krepšelį">
            <IconClose />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-canvas text-neutral-400">
              <IconBag size={24} />
            </div>
            <div>
              <p className="font-medium">Jūsų krepšelis tuščias</p>
              <p className="mt-1 text-sm text-neutral-500">Atraskite populiariausius pasiūlymus iš Lenkijos.</p>
            </div>
            <button onClick={close} className="tap mt-2 h-11 rounded-full border border-black/10 px-6 text-sm font-medium hover:border-ink">
              Tęsti apsipirkimą
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-black/5 px-5 py-3.5">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <IconTruck size={16} />
                {remaining > 0 ? (
                  <span>
                    Iki nemokamo pristatymo trūksta <strong className="font-semibold text-ink">{formatEur(remaining)}</strong>
                  </span>
                ) : (
                  <span className="font-medium text-accent">Jums taikomas nemokamas pristatymas</span>
                )}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-300", remaining > 0 ? "bg-ink" : "bg-accent")}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="no-scrollbar flex-1 divide-y divide-black/5 overflow-y-auto overscroll-contain px-5">
              {items.map((item) => (
                <li key={item.offerId} className="flex gap-4 py-4">
                  <Link
                    href={`/produktas/${item.offerId}`}
                    onClick={close}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-canvas"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" loading="lazy" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/produktas/${item.offerId}`} onClick={close} className="line-clamp-2 text-[13px] leading-snug hover:underline">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-[11px] text-neutral-500">{item.deliveryLabel}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex h-8 items-center rounded-full border border-black/10">
                        <button
                          className="tap grid h-8 w-8 place-items-center text-neutral-600"
                          onClick={() => setQty(item.offerId, item.quantity - 1)}
                          aria-label="Mažinti kiekį"
                        >
                          <IconMinus size={14} />
                        </button>
                        <span className="w-6 text-center text-[13px] tabular-nums">{item.quantity}</span>
                        <button
                          className="tap grid h-8 w-8 place-items-center text-neutral-600 disabled:opacity-30"
                          onClick={() => setQty(item.offerId, item.quantity + 1)}
                          disabled={item.quantity >= MAX_QTY}
                          aria-label="Didinti kiekį"
                        >
                          <IconPlus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold tabular-nums">{formatEur(item.unitEur * item.quantity)}</span>
                        <button
                          onClick={() => remove(item.offerId)}
                          className="tap grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-canvas hover:text-ink"
                          aria-label="Pašalinti prekę"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="pb-safe shrink-0 border-t border-black/5 bg-white px-5 pt-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <dt>Prekių suma</dt>
                  <dd className="tabular-nums">{formatEur(subtotalEur)}</dd>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <dt>Pristatymas į Lietuvą</dt>
                  <dd className="tabular-nums">{deliveryEur === 0 ? "Nemokamai" : formatEur(deliveryEur)}</dd>
                </div>
                <div className="flex justify-between pt-1.5 text-base font-semibold">
                  <dt>Iš viso</dt>
                  <dd className="tabular-nums">{formatEur(subtotalEur + deliveryEur)}</dd>
                </div>
              </dl>
              <p className="mt-1 text-[11px] text-neutral-500">Kainos nurodytos su PVM.</p>
              <Link
                href="/apmokejimas"
                onClick={close}
                className="tap mb-4 mt-4 flex h-12 items-center justify-center rounded-full bg-accent text-[15px] font-medium text-white hover:bg-accent-strong"
              >
                Pereiti prie apmokėjimo
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
