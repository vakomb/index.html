import Link from "next/link";
import { CategoryIcon, IconEuro, IconShield, IconTruck } from "@/components/Icons";
import { ProductRow } from "@/components/product/ProductRow";
import { getHomeRows } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/categories";

// Prices depend on live FX + the admin-controlled markup.
export const dynamic = "force-dynamic";

const TRUST = [
  { icon: <IconEuro size={18} />, title: "Galutinė kaina eurais", text: "Jokių valiutos keitimo ar paslėptų mokesčių." },
  { icon: <IconTruck size={18} />, title: "Pristatymas į Lietuvą", text: "Į paštomatą arba iki durų per 3–6 d.d." },
  { icon: <IconShield size={18} />, title: "Saugus apmokėjimas", text: "Apple Pay, Google Pay, Revolut ir kortelės." },
];

export default async function HomePage() {
  const rows = await getHomeRows();

  return (
    <div className="space-y-14 pb-10 md:space-y-20">
      {/* Intro */}
      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-8 md:pt-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">Allegro pasiūlymai · Lietuvai</p>
        <h1 className="mt-3 max-w-3xl text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] md:text-[52px]">
          Didžiausia Lenkijos prekyvietė — lietuviškai, eurais ir su pristatymu į namus.
        </h1>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3 md:mt-10">
          {TRUST.map((t) => (
            <li key={t.title} className="flex items-start gap-3 rounded-2xl border border-black/5 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas">{t.icon}</span>
              <span>
                <span className="block text-[13px] font-medium">{t.title}</span>
                <span className="block text-xs leading-relaxed text-neutral-500">{t.text}</span>
              </span>
            </li>
          ))}
        </ul>

        <ul className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          {CATEGORIES.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link
                href={`/kategorija/${c.slug}`}
                className="tap flex h-10 items-center gap-2 rounded-full border border-black/10 px-4 text-[13px] font-medium hover:border-ink"
              >
                <CategoryIcon icon={c.icon} size={16} />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ProductRow title="Populiariausi pasiūlymai" subtitle="Daugiausiai perkamos prekės šią savaitę" products={rows.top} priority />
      <ProductRow title="Sezono akcentai" subtitle="Viskas, ko reikia šaltajam sezonui" products={rows.seasonal} />
      <ProductRow title="Didžiausios nuolaidos" subtitle="Lyginant su pardavėjo kaina prieš nuolaidą" products={rows.deals} />

      {rows.byCategory.map((row) => (
        <ProductRow key={row.slug} title={row.name} href={`/kategorija/${row.slug}`} products={row.products.slice(0, 5)} />
      ))}
    </div>
  );
}
