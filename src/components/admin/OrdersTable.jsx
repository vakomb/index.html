import { useEffect, useState } from 'react'
import { ORDER_STATUS } from '../../data/telemetry.js'
import { formatEUR, formatRelative } from '../../lib/format.js'

export default function OrdersTable({ orders }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="rounded-[24px] border border-gray-100 bg-white" aria-labelledby="orders-title">
      <div className="flex items-center justify-between border-b border-gray-100 p-4 md:p-5">
        <div>
          <h2 id="orders-title" className="text-[15px] font-semibold">
            Naujausi užsakymai
          </h2>
          <p className="mt-0.5 text-[12px] text-gray-500">Atnaujinama realiu laiku po kiekvieno atsiskaitymo</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
          Gyvai
        </span>
      </div>
      <ul className="divide-y divide-gray-100">
        {orders.slice(0, 6).map((order) => {
          const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.paid
          return (
            <li key={order.id} className={`flex items-center gap-3 px-4 py-3 md:px-5 ${order.isLive ? 'animate-fade-up' : ''}`}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-smoke text-[11px] font-semibold text-gray-700">
                {order.customer
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-[13px] font-medium">
                  {order.customer}
                  {order.isLive && (
                    <span className="rounded-full bg-black px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                      Nauja
                    </span>
                  )}
                </p>
                <p className="truncate text-[12px] text-gray-500">
                  {order.id} · {order.city} · {order.itemsCount} vnt. · {formatRelative(order.createdAt, now)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold tabular-nums">{formatEUR(order.total)}</p>
                <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                  {status.label}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
