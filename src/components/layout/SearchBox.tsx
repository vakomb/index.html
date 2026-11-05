"use client";

/**
 * Instant keyword search.
 * Debounced (120 ms) + abortable requests to /api/products; full keyboard
 * navigation; Enter opens the full results grid at /paieska.
 */
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn, formatEur } from "@/lib/format";
import { IconClose, IconSearch, Spinner } from "../Icons";

interface Hit {
  id: string;
  title: string;
  priceEur: number;
  image: string;
  deliveryLabel: string;
}

export const FOCUS_SEARCH_EVENT = "lenkynas:focus-search";

export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(pathname === "/paieska" ? params.get("q") ?? "" : "");
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // Allow other components (mobile tab bar) to focus the search field.
  useEffect(() => {
    const focus = () => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: "nearest" });
    };
    window.addEventListener(FOCUS_SEARCH_EVENT, focus);
    return () => window.removeEventListener(FOCUS_SEARCH_EVENT, focus);
  }, []);

  // Close on outside click / route change.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  // Debounced, abortable fetch.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=6`, { signal: ctrl.signal });
        const json = (await res.json()) as { products: Hit[]; total: number };
        setHits(json.products);
        setTotal(json.total);
        setActive(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setHits([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 120);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/paieska?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(hits.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && hits[active]) {
        setOpen(false);
        router.push(`/produktas/${hits[active].id}`);
      } else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex h-10 items-center gap-2 rounded-full bg-black/[0.04] px-3.5 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-black/10"
      >
        <IconSearch size={18} className="shrink-0 text-neutral-500" />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Ieškoti tarp tūkstančių prekių…"
          aria-label="Prekių paieška"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {loading ? (
          <Spinner size={16} className="text-neutral-400" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="tap grid h-6 w-6 place-items-center rounded-full text-neutral-400 hover:text-ink"
            aria-label="Išvalyti paiešką"
          >
            <IconClose size={14} />
          </button>
        ) : null}
      </form>

      {showPanel && (
        <div className="animate-fade-in absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)]">
          {hits.length === 0 && !loading ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              Pagal užklausą „{query.trim()}“ prekių nerasta. Pabandykite kitą raktažodį.
            </p>
          ) : (
            <ul id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto py-1.5">
              {hits.map((hit, i) => (
                <li key={hit.id} role="option" aria-selected={i === active}>
                  <Link
                    href={`/produktas/${hit.id}`}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActive(i)}
                    className={cn("flex items-center gap-3 px-3 py-2", i === active && "bg-canvas")}
                  >
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={hit.image} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[13px]">{hit.title}</span>
                      <span className="block text-[11px] text-neutral-500">{hit.deliveryLabel}</span>
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums">{formatEur(hit.priceEur)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {total > 0 && (
            <button
              type="button"
              onClick={submit}
              className="tap flex w-full items-center justify-between border-t border-black/5 px-4 py-3 text-[13px] font-medium hover:bg-canvas"
            >
              Rodyti visus rezultatus
              <span className="text-neutral-500">{total}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
