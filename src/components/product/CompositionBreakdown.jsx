import { useState } from 'react'
import { ChevronDown, Leaf } from 'lucide-react'

export default function CompositionBreakdown({ composition, inci }) {
  const [open, setOpen] = useState(false)

  return (
    <section aria-labelledby="composition-title">
      <h3 id="composition-title" className="text-[15px] font-semibold">
        Žaliavų sudėtis
      </h3>
      <p className="mt-1 text-[13px] text-gray-500">Skaidri formulė — kiekvienas procentas turi paskirtį.</p>

      <ul className="mt-4 space-y-3">
        {composition.map((part) => (
          <li key={part.label}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-gray-800">{part.label}</span>
              <span className="font-medium tabular-nums">{part.value} %</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-smoke">
              <div className="h-full rounded-full bg-black" style={{ width: `${part.value}%` }} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {['Be parabenų', 'Be ftalatų', 'Netestuota su gyvūnais', 'Veganiška formulė'].map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] text-gray-700"
          >
            <Leaf size={11} aria-hidden="true" />
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mt-4 flex w-full items-center justify-between rounded-xl bg-mist px-4 py-3 text-left text-[13px] font-medium"
      >
        Visa INCI sudėtis
        <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid grid-cols-1 transition-[grid-template-rows] duration-500 ease-ios ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="px-4 pt-3 text-xs leading-relaxed text-gray-500">{inci}</p>
        </div>
      </div>
    </section>
  )
}
