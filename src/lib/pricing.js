import {
  CATEGORY_META,
  FREE_SHIPPING_THRESHOLD,
  LOW_STOCK_THRESHOLD,
  PROMO_CODES,
  SHIPPING_METHODS,
  VAT_RATE,
} from '../data/catalog.js'

export const round2 = (value) => Math.round(value * 100) / 100

function scalePrice(base, factor) {
  if (!Number.isFinite(base)) return 0
  return factor === 1 ? base : Math.ceil(base * factor)
}

export function getCategoryMeta(category) {
  return CATEGORY_META[category] ?? CATEGORY_META.kvepalai
}

export function getSizes(product) {
  return getCategoryMeta(product.category).sizes.map((size) => ({
    ...size,
    price: scalePrice(product.price, size.factor),
    compareAt: product.compareAt ? scalePrice(product.compareAt, size.factor) : null,
  }))
}

export function getDefaultSize(product) {
  const sizes = getSizes(product)
  return sizes.find((size) => size.isDefault) ?? sizes[0]
}

export function getSize(product, sizeId) {
  return getSizes(product).find((size) => size.id === sizeId) ?? getDefaultSize(product)
}

export function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0
  return Math.round((1 - price / compareAt) * 100)
}

export function isLowStock(product) {
  return product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD
}

export function isSoldOut(product) {
  return product.stock <= 0
}

export function quantityInCart(cart, productId) {
  return cart.filter((item) => item.productId === productId).reduce((sum, item) => sum + item.qty, 0)
}

export function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0)
}

export function buildCartLines(cart, products) {
  const byId = new Map(products.map((product) => [product.id, product]))
  return cart
    .map((item) => {
      const product = byId.get(item.productId)
      if (!product) return null
      const size = getSize(product, item.sizeId)
      return {
        key: item.key,
        product,
        size,
        qty: item.qty,
        unitPrice: size.price,
        compareAt: size.compareAt,
        lineTotal: round2(size.price * item.qty),
      }
    })
    .filter(Boolean)
}

export function shippingPriceFor(method, subtotal) {
  if (!method) return 0
  if (method.freeOverThreshold && subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  return method.price
}

export function computeTotals(lines, { shippingMethodId = null, promoCode = null } = {}) {
  const subtotal = round2(lines.reduce((sum, line) => sum + line.lineTotal, 0))
  const savings = round2(
    lines.reduce((sum, line) => sum + (line.compareAt ? (line.compareAt - line.unitPrice) * line.qty : 0), 0),
  )
  const promo = promoCode ? PROMO_CODES[promoCode] : null
  const discount = promo ? round2((subtotal * promo.percent) / 100) : 0
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const method = SHIPPING_METHODS.find((item) => item.id === shippingMethodId) ?? null
  const shipping = lines.length === 0 ? 0 : shippingPriceFor(method, subtotal)
  const total = round2(Math.max(0, subtotal - discount) + shipping)
  const vat = round2((total * VAT_RATE) / (1 + VAT_RATE))
  const cheapestShipping = Math.min(...SHIPPING_METHODS.map((item) => item.price))

  return {
    subtotal,
    savings,
    discount,
    promo,
    shipping,
    shippingKnown: Boolean(method) || qualifiesForFreeShipping,
    cheapestShipping,
    total,
    vat,
    qualifiesForFreeShipping,
    remainingForFreeShipping: round2(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)),
    freeShippingProgress: Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD),
    itemsCount: lines.reduce((sum, line) => sum + line.qty, 0),
  }
}
