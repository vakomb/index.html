// Simuliuota analitika administratoriaus panelei. Gyvi užsakymai,
// atlikti per atsiskaitymą, pridedami prie šių bazinių reikšmių realiu laiku.

export const PERIODS = [
  {
    id: '24h',
    label: '24 val.',
    revenueLabel: 'Dienos apyvarta',
    compareLabel: 'nei vakar',
    sessions: 1842,
    orders: 37,
    revenue: 2146.8,
    deltas: { revenue: 12.4, orders: 8.8, cr: 3.1, aov: 3.4 },
    buckets: 12,
    unit: 'hour',
    weights: [2, 1, 1, 2, 5, 8, 9, 11, 10, 13, 16, 14],
  },
  {
    id: '7d',
    label: '7 dienos',
    revenueLabel: 'Savaitės apyvarta',
    compareLabel: 'nei praėjusią savaitę',
    sessions: 12960,
    orders: 268,
    revenue: 15412.3,
    deltas: { revenue: 8.1, orders: 6.4, cr: -1.2, aov: 1.6 },
    buckets: 7,
    unit: 'day',
    weights: [11, 12, 13, 12, 16, 19, 17],
  },
  {
    id: '30d',
    label: '30 dienų',
    revenueLabel: 'Mėnesio apyvarta',
    compareLabel: 'nei praėjusį mėnesį',
    sessions: 54300,
    orders: 1094,
    revenue: 63870.5,
    deltas: { revenue: 21.7, orders: 18.2, cr: 2.4, aov: 2.9 },
    buckets: 30,
    unit: 'day',
    weights: [
      7, 8, 8, 9, 11, 13, 12, 8, 9, 9, 10, 12, 14, 13, 9, 9, 10, 10, 13, 15, 14, 10, 10, 11, 11, 14, 16, 15,
      11, 12,
    ],
  },
]

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString()

export const SEED_ORDERS = [
  {
    id: 'VD-48213',
    customer: 'Gabija K.',
    city: 'Vilnius',
    itemsCount: 2,
    total: 104,
    status: 'paid',
    createdAt: minutesAgo(9),
  },
  {
    id: 'VD-48212',
    customer: 'Mantas V.',
    city: 'Kaunas',
    itemsCount: 1,
    total: 59,
    status: 'preparing',
    createdAt: minutesAgo(26),
  },
  {
    id: 'VD-48211',
    customer: 'Eglė J.',
    city: 'Klaipėda',
    itemsCount: 3,
    total: 129,
    status: 'preparing',
    createdAt: minutesAgo(58),
  },
  {
    id: 'VD-48210',
    customer: 'Paulius A.',
    city: 'Šiauliai',
    itemsCount: 1,
    total: 36,
    status: 'shipped',
    createdAt: minutesAgo(124),
  },
]

export const ORDER_STATUS = {
  paid: { label: 'Apmokėta', dot: 'bg-emerald-500' },
  preparing: { label: 'Ruošiama', dot: 'bg-amber-500' },
  shipped: { label: 'Išsiųsta', dot: 'bg-gray-900' },
}
