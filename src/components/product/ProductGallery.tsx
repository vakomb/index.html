"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/format";

/** Swipeable gallery on mobile (scroll-snap), thumbnail rail on desktop. */
export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    setIndex(i);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth * i, behavior: "smooth" });
  };

  return (
    <div className="md:sticky md:top-32">
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index) setIndex(i);
        }}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto md:mx-0 md:rounded-3xl"
      >
        {images.map((src, i) => (
          <div key={src} className="aspect-square w-full shrink-0 snap-center bg-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={i === 0 ? title : `${title} — nuotrauka ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full object-contain p-10 mix-blend-multiply"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-ink" : "w-1.5 bg-neutral-300")} />
            ))}
          </div>
          <div className="mt-4 hidden gap-3 md:flex">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => goTo(i)}
                className={cn(
                  "tap h-20 w-20 overflow-hidden rounded-xl bg-canvas ring-1 transition",
                  i === index ? "ring-ink" : "ring-transparent hover:ring-black/10",
                )}
                aria-label={`Rodyti nuotrauką ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
