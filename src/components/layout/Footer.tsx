import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/5 bg-canvas">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="text-[20px] font-semibold tracking-[-0.055em]">Lenkynas</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
            Kruopščiai atrinkti Lenkijos prekyvietės pasiūlymai su skaidria kaina eurais ir patikimu pristatymu į Lietuvą.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Kategorijos</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/kategorija/${c.slug}`} className="text-neutral-600 hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Pirkėjams</p>
          <ul className="mt-4 space-y-2.5 text-sm text-neutral-600">
            <li>Pristatymas į Lietuvą per 3–6 d.d.</li>
            <li>14 dienų grąžinimo teisė</li>
            <li>Saugūs mokėjimai: Apple Pay, Google Pay, kortelės</li>
            <li>
              <a href="mailto:labas@lenkynas.lt" className="hover:text-ink">
                labas@lenkynas.lt
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5">
        <p className="mx-auto max-w-7xl px-4 py-6 pb-24 text-xs text-neutral-400 md:px-8 md:pb-6">
          © {new Date().getFullYear()} Lenkynas.lt · Visos kainos nurodytos eurais su PVM.
        </p>
      </div>
    </footer>
  );
}
