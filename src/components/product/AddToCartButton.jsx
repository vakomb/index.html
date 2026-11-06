import { useEffect, useRef, useState } from 'react'
import { Check, ShoppingBag } from 'lucide-react'

const SIZES = {
  sm: 'h-10 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

const VARIANTS = {
  solid: 'bg-black text-white hover:bg-gray-800',
  outline: 'bg-white text-black ring-1 ring-inset ring-black/15 hover:ring-black/40',
  soft: 'bg-smoke text-black hover:bg-gray-200',
}

// Mygtukas su mikrosąveika: po paspaudimo trumpam virsta „Pridėta ✓“.
export default function AddToCartButton({
  onAdd,
  soldOut = false,
  size = 'md',
  variant = 'solid',
  label = 'Į krepšelį',
  className = '',
  showIcon = true,
}) {
  const [added, setAdded] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleClick = (event) => {
    event.stopPropagation()
    if (soldOut) return
    const result = onAdd?.()
    if (result === false) return
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1500)
  }

  const visual = soldOut
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : added
      ? 'bg-emerald-600 text-white'
      : VARIANTS[variant]

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      aria-live="polite"
      className={`relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-lg font-semibold transition-all duration-300 ease-ios active:scale-[0.97] ${SIZES[size]} ${visual} ${className}`}
    >
      <span
        className={`inline-flex items-center gap-2 transition-all duration-300 ease-ios ${
          added ? '-translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {showIcon && !soldOut && <ShoppingBag size={16} strokeWidth={1.75} aria-hidden="true" />}
        {soldOut ? 'Išparduota' : label}
      </span>
      <span
        className={`absolute inset-0 inline-flex items-center justify-center gap-1.5 transition-all duration-300 ease-ios ${
          added ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
        aria-hidden={!added}
      >
        <Check size={16} strokeWidth={2.5} />
        Pridėta
      </span>
    </button>
  )
}
