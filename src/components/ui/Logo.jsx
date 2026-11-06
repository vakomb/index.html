export default function Logo({ onClick, tone = 'dark', size = 'md', className = '' }) {
  const color = tone === 'light' ? 'text-white' : 'text-black'
  const scale = size === 'lg' ? 'text-[17px] md:text-[21px]' : size === 'sm' ? 'text-[14px]' : 'text-[16px]'
  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label="Vaidore — į pradžią"
      className={`inline-flex select-none items-center font-medium leading-none ${color} ${scale} ${className}`}
    >
      <span className="-mr-[0.5em] tracking-[0.5em]">VAIDORE</span>
    </Tag>
  )
}
