import { Star } from 'lucide-react'

export default function Stars({ rating = 5, size = 14, className = '', muted = false }) {
  const filled = Math.round(rating)
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`Įvertinimas ${rating} iš 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={1.5}
          aria-hidden="true"
          className={
            index < filled
              ? muted
                ? 'fill-gray-400 text-gray-400'
                : 'fill-black text-black'
              : 'fill-transparent text-gray-300'
          }
        />
      ))}
    </span>
  )
}
