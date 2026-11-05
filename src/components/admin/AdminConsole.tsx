"use client";

/**
 * Back-office terminal: profit KPIs, daily profit chart, global markup
 * control, catalogue health, buyer pipeline and fulfilment lines.
 */
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { cn, formatDateTime, formatEur } from "@/lib/format";
import { STATUS_FLOW, STATUS_LABELS } from "@/lib/status";
import type { Order, OrderStatus } from "@/lib/types";
import { IconCheck, IconChevronRight, Spinner } from "../Icons";

interface Metrics {
  revenueEur: number;
  profitEur: number;
  marginPct: number;
  paidOrders: number;
  avgOrderEur: number;
  pipeline: Record<OrderStatus, number>;
  daily: Array<{ date: string; revenueEur: number; profitEur: number }>;
}

interface Props {
  orders: Order[];
  metrics: Metrics;
  pricing: { eurPerPln: number; fxSource: string; markup: number };
  health: { upstream: number; visible: number; suppressed: number; mode: string };
  markupBounds: { min: number; max: number };
}

const FX_SOURCE_LABEL: Record<string, string> = {
  frankfurter: "ECB (Frankfurter)",
  nbp: "Lenkijos nacionalinis bankas",
  fallback: "atsarginis kursas",
};

const pln = (v: number) => `${v.toFixed(2).replace(".", ",")} PLN`;

/* ───────────────────────────── Primitives ───────────────────────────── */

function Card({ title, aside, children, className }: { title?: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-black/5 bg-white p-5 md:p-6", className)}>
      {(title || aside) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 text-[26px] font-semibold tracking-[-0.04em] tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

/* ───────────────────────────── Profit chart ───────────────────────────── */

/** Single-series bar chart: daily net profit, last 14 days. Hover → tooltip. */
function ProfitChart({ daily }: { daily: Metrics["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.profitEur));
  const W = 560;
  const H = 160;
  const pad = { top: 8, bottom: 22 };
  const slot = W / daily.length;
  const barW = Math.min(22, slot - 6);
  const plotH = H - pad.top - pad.bottom;
  const dayLabel = (iso: string) => `${iso.slice(5, 7)}-${iso.slice(8, 10)}`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" role="img" aria-label="Grynasis pelnas per paskutines 14 dienų">
        {[0.5, 1].map((t) => (
          <line key={t} x1={0} x2={W} y1={pad.top + plotH * (1 - t)} y2={pad.top + plotH * (1 - t)} stroke="#0a0a0a" strokeOpacity={0.06} />
        ))}
        <line x1={0} x2={W} y1={pad.top + plotH} y2={pad.top + plotH} stroke="#0a0a0a" strokeOpacity={0.15} />
        {daily.map((d, i) => {
          const h = d.profitEur > 0 ? Math.max(3, (d.profitEur / max) * plotH) : 0;
          const x = i * slot + (slot - barW) / 2;
          const y = pad.top + plotH - h;
          const r = Math.min(4, h / 2);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* Hit target larger than the mark */}
              <rect x={i * slot} y={0} width={slot} height={H} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${y + h} Z`}
                  fill="#262626"
                  opacity={hover === null || hover === i ? 1 : 0.35}
                />
              )}
              {(i % 2 === 1 || daily.length <= 7) && (
                <text x={i * slot + slot / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="#a3a3a3">
                  {dayLabel(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: `${((hover + 0.5) / daily.length) * 100}%` }}
        >
          <p className="text-white/60">{daily[hover].date}</p>
          <p className="font-semibold tabular-nums">Pelnas {formatEur(daily[hover].profitEur)}</p>
          <p className="tabular-nums text-white/70">Pajamos {formatEur(daily[hover].revenueEur)}</p>
        </div>
      )}
      <table className="sr-only">
        <caption>Dienos pajamos ir pelnas</caption>
        <thead>
          <tr>
            <th>Data</th>
            <th>Pajamos</th>
            <th>Pelnas</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{formatEur(d.revenueEur)}</td>
              <td>{formatEur(d.profitEur)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────────── Markup control ───────────────────────────── */

function MarkupControl({ pricing, bounds }: { pricing: Props["pricing"]; bounds: Props["markupBounds"] }) {
  const router = useRouter();
  const [value, setValue] = useState(pricing.markup);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [, startTransition] = useTransition();
  const dirty = Math.abs(value - pricing.markup) > 0.001;

  const example = 100 * pricing.eurPerPln * value;
  const marginPct = ((value - 1) / value) * 100;

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markup: value }),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      setMessage(json.ok ? { ok: true, text: "Koeficientas atnaujintas — naujos kainos jau galioja." } : { ok: false, text: json.message ?? "Klaida." });
      if (json.ok) startTransition(() => router.refresh());
    } catch {
      setMessage({ ok: false, text: "Ryšio klaida." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Globalus antkainio koeficientas">
      <div className="flex items-end justify-between gap-4">
        <p className="text-[40px] font-semibold leading-none tracking-[-0.05em] tabular-nums">×{value.toFixed(2)}</p>
        <input
          type="number"
          min={bounds.min}
          max={bounds.max}
          step={0.01}
          value={value}
          onChange={(e) => setValue(Math.min(bounds.max, Math.max(bounds.min, Number(e.target.value) || bounds.min)))}
          className="h-10 w-24 rounded-xl border border-black/10 px-3 text-right tabular-nums outline-none focus:border-ink"
          aria-label="Antkainio koeficientas"
        />
      </div>
      <input
        type="range"
        min={bounds.min}
        max={bounds.max}
        step={0.05}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-5 w-full accent-[#0a0a0a]"
        aria-label="Antkainio koeficiento slankiklis"
      />
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-2xl bg-canvas p-3">
          <dt className="text-neutral-500">100 PLN klientui kainuos</dt>
          <dd className="mt-1 text-[15px] font-semibold tabular-nums">{formatEur(example)}</dd>
        </div>
        <div className="rounded-2xl bg-canvas p-3">
          <dt className="text-neutral-500">Bendroji marža</dt>
          <dd className="mt-1 text-[15px] font-semibold tabular-nums">{marginPct.toFixed(1)} %</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-neutral-500">
        Kursas: 1 PLN = {pricing.eurPerPln.toFixed(4)} EUR · šaltinis: {FX_SOURCE_LABEL[pricing.fxSource] ?? pricing.fxSource}
      </p>
      <button
        onClick={save}
        disabled={!dirty || saving}
        className="tap mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white hover:bg-accent-strong disabled:bg-neutral-200 disabled:text-neutral-500"
      >
        {saving ? <Spinner size={16} /> : dirty ? `Taikyti ×${value.toFixed(2)}` : "Koeficientas taikomas"}
      </button>
      {message && <p className={cn("mt-2 text-xs", message.ok ? "text-accent" : "text-red-700")}>{message.text}</p>}
    </Card>
  );
}

/* ───────────────────────────── Order row ───────────────────────────── */

function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    status: order.status,
    allegroOrderRef: order.fulfillment.allegroOrderRef ?? "",
    trackingNumber: order.fulfillment.trackingNumber ?? "",
    notes: order.fulfillment.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  async function save(patch: Partial<typeof draft>) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const costPln = order.items.reduce((s, i) => s + i.unitCostPln * i.quantity + i.shippingCostPln, 0);

  return (
    <li className="border-t border-black/5 first:border-t-0">
      <button onClick={() => setOpen((o) => !o)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-1 py-3.5 text-left md:grid-cols-[150px_1fr_110px_110px_150px_20px]">
        <span className="font-mono text-xs font-medium">{order.id}</span>
        <span className="hidden truncate text-[13px] md:block">
          {order.customer.fullName} <span className="text-neutral-400">· {formatDateTime(order.createdAt)}</span>
        </span>
        <span className="text-right text-[13px] font-medium tabular-nums">{formatEur(order.totals.totalEur)}</span>
        <span className="hidden text-right text-[13px] tabular-nums text-neutral-600 md:block">+{formatEur(order.totals.profitEur)}</span>
        <span className="col-span-2 flex items-center gap-1.5 text-xs md:col-span-1 md:justify-end">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              order.status === "delivered" ? "bg-accent" : order.status === "cancelled" ? "bg-neutral-300" : order.status === "pending_payment" ? "bg-neutral-400" : "bg-ink",
            )}
          />
          {STATUS_LABELS[order.status]}
        </span>
        <IconChevronRight size={14} className={cn("hidden text-neutral-400 transition-transform md:block", open && "rotate-90")} />
      </button>

      {open && (
        <div className="animate-fade-in mb-4 grid gap-5 rounded-2xl bg-canvas p-4 md:grid-cols-[1.4fr_1fr] md:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">Įvykdymo eilutės</p>
            <ul className="mt-3 space-y-2">
              {order.items.map((item) => (
                <li key={item.offerId} className="rounded-xl bg-white p-3 text-[13px]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="line-clamp-2">{item.title}</span>
                    <span className="shrink-0 font-medium tabular-nums">× {item.quantity}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>Savikaina: {pln(item.unitCostPln)}/vnt.</span>
                    <span>Siuntimas į LT: {pln(item.shippingCostPln)}</span>
                    <span>Pardavimo kaina: {formatEur(item.unitEur)}</span>
                  </div>
                  <a
                    href={`https://allegro.pl/oferta/${item.offerId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-ink underline underline-offset-2"
                  >
                    Atidaryti Allegro pasiūlymą {item.offerId} ↗
                  </a>
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {[
                ["Pajamos", formatEur(order.totals.totalEur)],
                ["Savikaina", `${formatEur(order.totals.costEur)} (${pln(costPln)})`],
                ["Pelnas", formatEur(order.totals.profitEur)],
                ["Kursas / koef.", `${order.pricingSnapshot.eurPerPln.toFixed(4)} / ×${order.pricingSnapshot.markup}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white p-2.5">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 text-xs leading-relaxed text-neutral-600">
              <p className="font-medium text-ink">{order.customer.fullName}</p>
              <p>
                {order.customer.email} · {order.customer.phone}
              </p>
              <p>
                {order.delivery.type === "pastomatas"
                  ? order.delivery.lockerLabel
                  : `${order.delivery.address}, ${order.delivery.postalCode} ${order.delivery.city}`}
              </p>
              <p className="mt-1 text-neutral-400">
                Mokėjimas: {order.payment.provider === "stripe" ? "Stripe" : "bandomasis"} · {order.payment.method}
                {order.payment.paidAt ? ` · ${formatDateTime(order.payment.paidAt)}` : ""}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs">
              <span className="mb-1 block text-neutral-500">Būsena</span>
              <select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as OrderStatus }))}
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-ink"
                style={{ fontSize: 14 }}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            {(
              [
                ["allegroOrderRef", "Allegro užsakymo nr."],
                ["trackingNumber", "Siuntos sekimo nr."],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-xs">
                <span className="mb-1 block text-neutral-500">{label}</span>
                <input
                  value={draft[key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-ink"
                  style={{ fontSize: 14 }}
                />
              </label>
            ))}
            <label className="block text-xs">
              <span className="mb-1 block text-neutral-500">Pastabos</span>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                style={{ fontSize: 14 }}
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => save(draft)}
                disabled={saving}
                className="tap flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? <Spinner size={14} /> : saved ? <IconCheck size={16} /> : null}
                Išsaugoti
              </button>
              {nextStatus && (
                <button
                  onClick={() => {
                    setDraft((d) => ({ ...d, status: nextStatus }));
                    void save({ ...draft, status: nextStatus });
                  }}
                  disabled={saving}
                  className="tap h-10 flex-1 rounded-full border border-black/10 bg-white text-sm font-medium hover:border-ink disabled:opacity-60"
                >
                  → {STATUS_LABELS[nextStatus]}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

/* ───────────────────────────── Console ───────────────────────────── */

export function AdminConsole({ orders, metrics, pricing, health, markupBounds }: Props) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const visible = useMemo(() => (filter === "all" ? orders : orders.filter((o) => o.status === filter)), [orders, filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8 md:py-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Pajamos" value={formatEur(metrics.revenueEur)} hint="Apmokėti užsakymai, EUR" />
        <Kpi label="Grynasis pelnas" value={formatEur(metrics.profitEur)} hint="Po Allegro savikainos ir siuntimo" />
        <Kpi label="Marža" value={`${metrics.marginPct.toFixed(1)} %`} />
        <Kpi label="Apmokėti užsakymai" value={String(metrics.paidOrders)} />
        <Kpi label="Vidutinis krepšelis" value={formatEur(metrics.avgOrderEur)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Grynasis pelnas per 14 dienų" aside={<span className="text-xs text-neutral-400">EUR per dieną</span>}>
          <ProfitChart daily={metrics.daily} />
        </Card>
        <MarkupControl pricing={pricing} bounds={markupBounds} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <Card title="Katalogo būklė (LT logistikos filtras)">
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[
              ["Gauta iš Allegro", health.upstream],
              ["Rodoma", health.visible],
              ["Paslėpta (be LT)", health.suppressed],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-canvas p-3">
                <dd className="text-[22px] font-semibold tabular-nums">{v}</dd>
                <dt className="mt-0.5 text-[11px] text-neutral-500">{k}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-neutral-500">
            Pasiūlymai be aiškaus siuntimo į Lietuvą automatiškai pašalinami iš paieškos ir katalogo.
          </p>
        </Card>

        <Card title="Pirkėjų srautas">
          <div className="flex flex-wrap gap-2">
            {(["all", ...STATUS_FLOW, "cancelled"] as const).map((s) => {
              const count = s === "all" ? orders.length : metrics.pipeline[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "tap flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-medium",
                    filter === s ? "border-ink bg-ink text-white" : "border-black/10 hover:border-ink",
                  )}
                >
                  {s === "all" ? "Visi" : STATUS_LABELS[s]}
                  <span className={cn("tabular-nums", filter === s ? "text-white/70" : "text-neutral-400")}>{count}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="Užsakymai ir įvykdymas" aside={<span className="text-xs text-neutral-400">{visible.length} įraš.</span>}>
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">
            Užsakymų dar nėra. Pateikite bandomąjį užsakymą parduotuvėje — jis atsiras čia akimirksniu.
          </p>
        ) : (
          <>
            <div className="hidden grid-cols-[150px_1fr_110px_110px_150px_20px] gap-3 px-1 pb-2 text-[11px] uppercase tracking-[0.12em] text-neutral-400 md:grid">
              <span>Nr.</span>
              <span>Pirkėjas</span>
              <span className="text-right">Suma</span>
              <span className="text-right">Pelnas</span>
              <span className="text-right">Būsena</span>
              <span />
            </div>
            <ul>
              {visible.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
