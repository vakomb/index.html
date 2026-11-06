import { useMemo, useState } from 'react'
import { Euro, MousePointerClick, Plus, RotateCcw, ShoppingCart, Wallet } from 'lucide-react'
import { PERIODS, SEED_ORDERS } from '../data/telemetry.js'
import { formatEUR, formatNumber, formatPercent } from '../lib/format.js'
import KpiTile from '../components/admin/KpiTile.jsx'
import RevenueChart from '../components/admin/RevenueChart.jsx'
import InventoryTable from '../components/admin/InventoryTable.jsx'
import OrdersTable from '../components/admin/OrdersTable.jsx'
import ProductFormModal from '../components/admin/ProductFormModal.jsx'

const pad = (value) => String(value).padStart(2, '0')
const weekdayFormatter = new Intl.DateTimeFormat('lt-LT', { weekday: 'short' })
const dayFormatter = new Intl.DateTimeFormat('lt-LT', { month: 'short', day: 'numeric' })

function buildSeries(period, liveRevenue, now = new Date()) {
  const sum = period.weights.reduce((total, weight) => total + weight, 0)
  return period.weights.map((weight, index) => {
    const isCurrent = index === period.weights.length - 1
    const value = (period.revenue * weight) / sum + (isCurrent ? liveRevenue : 0)
    const stepsBack = period.weights.length - 1 - index
    if (period.unit === 'hour') {
      const start = new Date(now)
      start.setMinutes(0, 0, 0)
      start.setHours(start.getHours() - stepsBack * 2 - 1)
      const end = new Date(start)
      end.setHours(end.getHours() + 2)
      return {
        key: `${period.id}-${index}`,
        value,
        isCurrent,
        shortLabel: `${pad(start.getHours())}:00`,
        label: `${pad(start.getHours())}:00–${pad(end.getHours())}:00`,
      }
    }
    const day = new Date(now)
    day.setDate(day.getDate() - stepsBack)
    return {
      key: `${period.id}-${index}`,
      value,
      isCurrent,
      shortLabel: period.weights.length > 7 ? String(day.getDate()) : weekdayFormatter.format(day),
      label: isCurrent ? `Šiandien, ${dayFormatter.format(day)}` : dayFormatter.format(day),
    }
  })
}

export default function AdminView({ products, orders, onAddProduct, onDeleteProduct, onResetDemo, onOpenProduct }) {
  const [periodId, setPeriodId] = useState('24h')
  const [formOpen, setFormOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const period = PERIODS.find((item) => item.id === periodId) ?? PERIODS[0]
  const liveRevenue = orders.reduce((sum, order) => sum + order.totals.total, 0)
  const revenue = period.revenue + liveRevenue
  const ordersCount = period.orders + orders.length
  const conversion = (ordersCount / period.sessions) * 100
  const averageOrder = revenue / ordersCount

  const series = useMemo(() => buildSeries(period, liveRevenue), [period, liveRevenue])

  const orderRows = useMemo(
    () => [
      ...orders.map((order) => ({
        id: order.id,
        customer: order.customer.name,
        city: order.delivery.city || order.delivery.country,
        itemsCount: order.lines.reduce((sum, line) => sum + line.qty, 0),
        total: order.totals.total,
        status: 'paid',
        createdAt: order.createdAt,
        isLive: true,
      })),
      ...SEED_ORDERS,
    ],
    [orders],
  )

  const handleSubmit = (product) => {
    onAddProduct(product)
    setFormOpen(false)
  }

  return (
    <div className="bg-mist pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8 md:pt-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500">Admin panelė</p>
            <h1 className="mt-2 font-serif text-[42px] font-medium leading-none tracking-tight md:text-6xl">
              Valdymo terminalas
            </h1>
            <p className="mt-3 text-[14px] text-gray-500">
              Pardavimų telemetrija, katalogo valdymas ir atsargos — viskas vienoje vietoje.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {confirmReset ? (
              <span className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="h-11 rounded-lg px-4 text-[13px] font-medium text-gray-600"
                >
                  Atšaukti
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetDemo()
                    setConfirmReset(false)
                  }}
                  className="h-11 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white"
                >
                  Patvirtinti atkūrimą
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition hover:border-black"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Atkurti demo duomenis
              </button>
            )}
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-black px-5 text-[13px] font-medium text-white shadow-lg shadow-black/10 transition hover:bg-gray-800 active:scale-[0.97]"
            >
              <Plus size={16} aria-hidden="true" />
              Nauja prekė
            </button>
          </div>
        </div>

        <div className="mt-8 inline-flex rounded-full bg-white p-1 ring-1 ring-black/5" role="tablist" aria-label="Laikotarpis">
          {PERIODS.map((item) => {
            const active = item.id === periodId
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriodId(item.id)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                  active ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile
            label={period.revenueLabel}
            value={formatEUR(revenue)}
            delta={period.deltas.revenue}
            compareLabel={period.compareLabel}
            icon={Euro}
            live={orders.length > 0}
          />
          <KpiTile
            label="Užsakymai"
            value={formatNumber(ordersCount)}
            delta={period.deltas.orders}
            compareLabel={period.compareLabel}
            icon={ShoppingCart}
            live={orders.length > 0}
          />
          <KpiTile
            label="Konversija (CR %)"
            value={formatPercent(conversion, 2)}
            delta={period.deltas.cr}
            compareLabel={period.compareLabel}
            icon={MousePointerClick}
          />
          <KpiTile
            label="Vid. krepšelio vertė"
            value={formatEUR(averageOrder)}
            delta={period.deltas.aov}
            compareLabel={period.compareLabel}
            icon={Wallet}
          />
        </div>
        <p className="mt-2 text-[11px] text-gray-500">
          Sesijos per laikotarpį: {formatNumber(period.sessions)} · Demonstracinė telemetrija su gyvais šios naršyklės
          užsakymais
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <RevenueChart
            title="Apyvarta pagal laikotarpį"
            subtitle={period.unit === 'hour' ? 'Paskutinės 24 valandos, 2 val. intervalai' : `Paskutinės ${period.label}`}
            data={series}
          />
          <OrdersTable orders={orderRows} />
        </div>

        <div className="mt-6">
          <InventoryTable products={products} onDelete={onDeleteProduct} onOpen={onOpenProduct} />
        </div>
      </div>

      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
    </div>
  )
}
