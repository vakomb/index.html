export default function Logo({ onClick, tone = 'dark', size = 'md', className = '' }) {
  const color = tone === 'light' ? 'text-white' : 'text-black'
  const scale = size === 'lg' ? 'text-xl md:text-2xl' : size === 'sm' ? 'text-[13px]' : 'text-[15px]'
  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label="Vaidore — į pradžią"
      className={`inline-flex select-none items-center font-medium leading-none ${color} ${scale} ${className}`}
    >
      <span className="-mr-[0.48em] tracking-[0.48em]">VAIDORE</span>
    </Tag>
  )
}
