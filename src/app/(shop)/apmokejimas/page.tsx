import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { paymentMode } from "@/lib/config";
import { LOCKERS } from "@/lib/lockers";

export const metadata: Metadata = { title: "Apmokėjimas", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ atsaukta?: string }> }) {
  const { atsaukta } = await searchParams;
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
      <h1 className="mb-6 text-[26px] font-semibold tracking-[-0.04em] md:mb-8 md:text-[34px]">Apmokėjimas</h1>
      <CheckoutForm lockers={LOCKERS} paymentMode={paymentMode()} cancelled={atsaukta === "1"} />
    </div>
  );
}
