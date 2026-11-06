export default function Spinner({ className = 'size-5', tone = 'light' }) {
  const colors = tone === 'light' ? 'border-white/30 border-t-white' : 'border-black/15 border-t-black'
  return (
    <span
      role="status"
      aria-label="Kraunama"
      className={`inline-block animate-spin rounded-full border-2 ${colors} ${className}`}
    />
  )
}
