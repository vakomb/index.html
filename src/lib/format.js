const LOCALE = 'lt-LT'

const eurFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' })
const eurWholeFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function formatEUR(value) {
  return eurFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatEURWhole(value) {
  return eurWholeFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatPercent(value, digits = 1) {
  return `${formatNumber(value, digits)} %`
}

// Lietuvių kalbos daugiskaitos formos: [1 prekė, 2 prekės, 10 prekių]
export function plural(count, [one, few, many]) {
  const n = Math.abs(count)
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return few
  return many
}

export function countLabel(count, forms) {
  return `${formatNumber(count)} ${plural(count, forms)}`
}

export function formatDateLong(value) {
  return new Intl.DateTimeFormat(LOCALE, { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(value),
  )
}

export function formatDayMonth(value) {
  return new Intl.DateTimeFormat(LOCALE, { month: 'long', day: 'numeric' }).format(new Date(value))
}

export function formatTime(value) {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function formatRelative(value, now = Date.now()) {
  const diffMinutes = Math.max(0, Math.round((now - new Date(value).getTime()) / 60000))
  if (diffMinutes < 1) return 'ką tik'
  if (diffMinutes < 60) return `prieš ${diffMinutes} min.`
  const hours = Math.floor(diffMinutes / 60)
  if (hours < 24) return `prieš ${hours} val.`
  const days = Math.floor(hours / 24)
  return `prieš ${days} d.`
}

export function addBusinessDays(date, days) {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const weekday = result.getDay()
    if (weekday !== 0 && weekday !== 6) added += 1
  }
  return result
}

export function formatDeliveryWindow([minDays, maxDays], from = new Date()) {
  const start = addBusinessDays(from, minDays)
  const end = addBusinessDays(from, maxDays)
  if (minDays === maxDays) return formatDayMonth(start)
  return `${formatDayMonth(start)} – ${formatDayMonth(end)}`
}

/* ---------- Mokėjimo kortelės ---------- */

export function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function detectCardBrand(value) {
  const digits = onlyDigits(value)
  if (/^4/.test(digits)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard'
  if (/^3[47]/.test(digits)) return 'amex'
  return null
}

export const CARD_BRAND_LABEL = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
}

export function cardNumberLength(brand) {
  return brand === 'amex' ? 15 : 16
}

// Automatinis tarpų įterpimas: 4242 4242 4242 4242 arba Amex 3782 822463 10005
export function formatCardNumber(value) {
  const brand = detectCardBrand(value)
  const digits = onlyDigits(value).slice(0, cardNumberLength(brand))
  if (brand === 'amex') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ')
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatExpiry(value) {
  let digits = onlyDigits(value).slice(0, 4)
  if (digits.length === 1 && Number(digits) > 1) digits = `0${digits}`
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

export function isExpiryValid(value, now = new Date()) {
  const digits = onlyDigits(value)
  if (digits.length !== 4) return false
  const month = Number(digits.slice(0, 2))
  const year = 2000 + Number(digits.slice(2))
  if (month < 1 || month > 12) return false
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)
  return endOfMonth >= now
}

export function luhnCheck(value) {
  const digits = onlyDigits(value)
  if (digits.length < 12) return false
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

/* ---------- Kontaktai ---------- */

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())
}

export function isValidPhone(value) {
  const digits = onlyDigits(value)
  return digits.length >= 8 && digits.length <= 15
}

export function isValidPostcode(value) {
  return /^(LT-?)?\d{4,5}$/i.test(String(value).trim())
}

export function generateOrderId() {
  const tail = String(Date.now()).slice(-5)
  return `VD-${tail}`
}

export function firstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || ''
}
