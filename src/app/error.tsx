"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-[26px] font-semibold tracking-[-0.04em]">Įvyko nenumatyta klaida</h1>
        <p className="mt-3 text-sm text-neutral-500">Atsiprašome už nepatogumus. Pabandykite dar kartą po kelių akimirkų.</p>
        <button onClick={reset} className="tap mt-8 h-11 rounded-full bg-ink px-6 text-sm font-medium text-white">
          Bandyti dar kartą
        </button>
      </div>
    </div>
  );
}
