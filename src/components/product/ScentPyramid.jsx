import { PYRAMID_TIERS } from '../../data/catalog.js'

const TIER_COLOR = {
  top: 'bg-gray-300',
  heart: 'bg-gray-500',
  base: 'bg-black',
}

export default function ScentPyramid({ notes }) {
  return (
    <section aria-labelledby="pyramid-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 id="pyramid-title" className="text-[15px] font-semibold">
            Kvapo piramidė
          </h3>
          <p className="mt-1 text-[13px] text-gray-500">Kaip kompozicija atsiskleidžia ant odos laikui bėgant.</p>
        </div>
      </div>

      <div className="mt-4 flex h-2 gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
        {PYRAMID_TIERS.map((tier) => (
          <div key={tier.key} className={TIER_COLOR[tier.key]} style={{ width: `${tier.share}%` }} />
        ))}
      </div>

      <ol className="mt-4 space-y-2.5">
        {PYRAMID_TIERS.map((tier) => (
          <li key={tier.key} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${TIER_COLOR[tier.key]}`} aria-hidden="true" />
                <span className="text-sm font-medium">{tier.label}</span>
              </span>
              <span className="text-xs tabular-nums text-gray-500">{tier.share} % formulės</span>
            </div>
            <p className="mt-1 pl-[18px] text-xs text-gray-500">{tier.timing}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 pl-[18px]">
              {(notes?.[tier.key] ?? []).map((note) => (
                <span key={note} className="rounded-full bg-smoke px-3 py-1 text-xs text-gray-800">
                  {note}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
