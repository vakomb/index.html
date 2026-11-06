import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', label = 'Kiekis' }) {
  const dims = size === 'sm' ? 'h-9 text-sm' : 'h-12 text-[15px]'
  const button = size === 'sm' ? 'w-9' : 'w-11'
  const canDecrease = value > min
  const canIncrease = value < max

  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex items-center rounded-full border border-gray-200 bg-white ${dims}`}
    >
      <button
        type="button"
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        aria-label="Sumažinti kiekį"
        className={`flex h-full ${button} items-center justify-center rounded-full text-gray-700 transition hover:bg-smoke active:scale-90 disabled:text-gray-300 disabled:hover:bg-transparent`}
      >
        <Minus size={15} strokeWidth={1.75} />
      </button>
      <span className="min-w-6 text-center font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        aria-label="Padidinti kiekį"
        className={`flex h-full ${button} items-center justify-center rounded-full text-gray-700 transition hover:bg-smoke active:scale-90 disabled:text-gray-300 disabled:hover:bg-transparent`}
      >
        <Plus size={15} strokeWidth={1.75} />
      </button>
    </div>
  )
}
