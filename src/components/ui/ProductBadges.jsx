import { isLowStock, isSoldOut } from '../../lib/pricing.js'

const base =
  'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.14em]'

export default function ProductBadges({ product, className = '' }) {
  const badges = []

  if (isSoldOut(product)) {
    badges.push(
      <span key="soldout" className={`${base} bg-gray-200 text-gray-600`}>
        Išparduota
      </span>,
    )
  } else {
    if (product.badge === 'bestseller') {
      badges.push(
        <span key="bestseller" className={`${base} bg-black text-white`}>
          Populiariausias
        </span>,
      )
    }
    if (product.badge === 'new') {
      badges.push(
        <span key="new" className={`${base} bg-white text-black ring-1 ring-black/10`}>
          Naujiena
        </span>,
      )
    }
    if (isLowStock(product)) {
      badges.push(
        <span key="limited" className={`${base} bg-white/90 text-red-700 ring-1 ring-red-200 backdrop-blur`}>
          Ribotas kiekis
        </span>,
      )
    }
  }

  if (badges.length === 0) return null
  return <div className={`flex flex-col items-start gap-1.5 ${className}`}>{badges}</div>
}
