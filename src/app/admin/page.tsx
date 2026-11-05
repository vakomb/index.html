import type { Metadata } from "next";
import Link from "next/link";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { getCatalogueHealth, getPricingContext } from "@/lib/catalog";
import { config, paymentMode } from "@/lib/config";
import { getDashboardMetrics } from "@/lib/orders";

export const metadata: Metadata = { title: "Administravimas", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [{ orders, metrics }, pricing, health] = await Promise.all([getDashboardMetrics(), getPricingContext(), getCatalogueHealth()]);

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-semibold tracking-[-0.055em]">Lenkynas</span>
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Terminalas</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="hidden rounded-full border border-black/10 px-2.5 py-1 sm:inline">
              Allegro: {health.mode === "live" ? "gyvas API" : "bandomieji duomenys"}
            </span>
            <span className="hidden rounded-full border border-black/10 px-2.5 py-1 sm:inline">
              Mokėjimai: {paymentMode() === "stripe" ? "Stripe" : "bandomieji"}
            </span>
            <Link href="/" className="font-medium text-ink hover:underline">
              Į parduotuvę →
            </Link>
          </div>
        </div>
      </header>
      <AdminConsole
        orders={orders}
        metrics={metrics}
        pricing={pricing}
        health={health}
        markupBounds={{ min: config.pricing.minMarkup, max: config.pricing.maxMarkup }}
      />
    </div>
  );
}
