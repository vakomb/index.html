import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnSuccess } from "@/components/checkout/ClearCartOnSuccess";
import { IconCheck, IconTruck } from "@/components/Icons";
import { config } from "@/lib/config";
import { formatDateTime, formatEur } from "@/lib/format";
import { getOrder, markOrderPaid, STATUS_LABELS } from "@/lib/orders";
import { retrieveCheckoutSession } from "@/lib/stripe";

export const metadata: Metadata = { title: "Užsakymo patvirtinimas", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ session_id?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, { session_id }] = await Promise.all([params, searchParams]);
  let order = await getOrder(id);
  if (!order) notFound();

  // Fallback verification when webhooks are not wired up (e.g. local dev).
  if (order.status === "pending_payment" && session_id && config.stripe.enabled && order.payment.sessionId === session_id) {
    try {
      const session = await retrieveCheckoutSession(session_id);
      if (session.payment_status === "paid") order = (await markOrderPaid(order.id, session.id)) ?? order;
    } catch (err) {
      console.error("[order] session verification failed:", (err as Error).message);
    }
  }

  const paid = order.status !== "pending_payment" && order.status !== "cancelled";
  const firstName = order.customer.fullName.split(/\s+/)[0];
  const maxDays = Math.max(...order.items.map((i) => Number(/–(\d+)/.exec(i.deliveryLabel)?.[1] ?? /(\d+)/.exec(i.deliveryLabel)?.[1] ?? 0)));

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 md:pt-16">
      {paid && <ClearCartOnSuccess />}

      <div className="text-center">
        <span className={paid ? "mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-white" : "mx-auto grid h-14 w-14 place-items-center rounded-full bg-canvas"}>
          {paid ? <IconCheck size={26} /> : <IconTruck size={24} />}
        </span>
        <h1 className="mt-5 text-[28px] font-semibold tracking-[-0.04em]">
          {paid ? `Ačiū, ${firstName}!` : "Laukiame mokėjimo patvirtinimo"}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {paid
            ? "Užsakymas priimtas ir apmokėtas. Išsaugokite užsakymo numerį — jo prireiks bendraujant su mumis."
            : "Kai tik mokėjimas bus patvirtintas, užsakymo būsena atsinaujins."}
        </p>
        {!paid && (
          <Link href={`/uzsakymas/${order.id}`} className="tap mt-4 inline-flex h-10 items-center rounded-full border border-black/10 px-5 text-sm font-medium">
            Atnaujinti būseną
          </Link>
        )}
      </div>

      <div className="mt-10 rounded-3xl border border-black/5 p-5 md:p-7">
        <dl className="grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <dt className="text-neutral-500">Užsakymo nr.</dt>
            <dd className="mt-0.5 font-mono font-medium">{order.id}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Būsena</dt>
            <dd className="mt-0.5 font-medium">{STATUS_LABELS[order.status]}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Pateiktas</dt>
            <dd className="mt-0.5">{formatDateTime(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Pristatymas</dt>
            <dd className="mt-0.5">{order.delivery.type === "pastomatas" ? "Į paštomatą" : "Kurjeriu"}{maxDays > 0 ? `, iki ${maxDays} d.d.` : ""}</dd>
          </div>
        </dl>

        <ul className="mt-6 divide-y divide-black/5 border-t border-black/5">
          {order.items.map((item) => (
            <li key={item.offerId} className="flex items-center gap-3 py-3.5">
              <span className="h-14 w-14 shrink-0 rounded-xl bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
              </span>
              <span className="min-w-0 flex-1 text-[13px]">
                <span className="line-clamp-2">{item.title}</span>
                <span className="text-neutral-500">× {item.quantity}</span>
              </span>
              <span className="text-[13px] font-medium tabular-nums">{formatEur(item.unitEur * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-1.5 border-t border-black/5 pt-4 text-sm">
          <div className="flex justify-between text-neutral-600">
            <dt>Prekių suma</dt>
            <dd className="tabular-nums">{formatEur(order.totals.itemsEur)}</dd>
          </div>
          <div className="flex justify-between text-neutral-600">
            <dt>Pristatymas</dt>
            <dd className="tabular-nums">{order.totals.deliveryEur === 0 ? "Nemokamai" : formatEur(order.totals.deliveryEur)}</dd>
          </div>
          <div className="flex justify-between pt-1.5 text-base font-semibold">
            <dt>Sumokėta</dt>
            <dd className="tabular-nums">{formatEur(order.totals.totalEur)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="tap inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-white">
          Tęsti apsipirkimą
        </Link>
      </div>
    </div>
  );
}
