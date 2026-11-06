import { useState } from 'react'
import { ChartColumn, Table2 } from 'lucide-react'
import { formatEUR, formatEURWhole } from '../../lib/format.js'

function niceCeil(value) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((multiplier) => multiplier * magnitude >= value) ?? 10
  return step * magnitude
}

// Vienos serijos stulpelinė diagrama: plonos žymės, 4 px suapvalinti viršūnių kampai,
// rami tinklelio linija ir patarimas (tooltip) užvedus pele arba fokusavus klaviatūra.
export default function RevenueChart({ title, subtitle, data }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [view, setView] = useState('chart')

  const max = niceCeil(Math.max(...data.map((point) => point.value), 1))
  const ticks = [max, max / 2, 0]
  const labelEvery = data.length > 14 ? 5 : data.length > 8 ? 2 : 1
  const active = activeIndex !== null ? data[activeIndex] : null

  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-4 md:p-6" aria-label={title}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <p className="mt-0.5 text-[12px] text-gray-500">{subtitle}</p>
        </div>
        <div className="flex rounded-full bg-smoke p-0.5" role="tablist" aria-label="Rodinys">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'chart'}
            onClick={() => setView('chart')}
            className={`flex size-8 items-center justify-center rounded-full transition ${
              view === 'chart' ? 'bg-white text-black shadow-sm' : 'text-gray-500'
            }`}
            aria-label="Diagrama"
          >
            <ChartColumn size={15} />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'table'}
            onClick={() => setView('table')}
            className={`flex size-8 items-center justify-center rounded-full transition ${
              view === 'table' ? 'bg-white text-black shadow-sm' : 'text-gray-500'
            }`}
            aria-label="Lentelė"
          >
            <Table2 size={15} />
          </button>
        </div>
      </div>

      {view === 'chart' ? (
        <>
          <div className="mt-6 flex">
            <div className="relative h-48 w-12 shrink-0 text-[10px] tabular-nums text-gray-400" aria-hidden="true">
              {ticks.map((tick, index) => (
                <span
                  key={tick}
                  className="absolute right-2 -translate-y-1/2"
                  style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
                >
                  {formatEURWhole(tick)}
                </span>
              ))}
            </div>
            <div className="relative h-48 flex-1">
              {ticks.map((tick, index) => (
                <div
                  key={tick}
                  className={`absolute inset-x-0 border-t ${index === ticks.length - 1 ? 'border-gray-300' : 'border-dashed border-gray-100'}`}
                  style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
                  aria-hidden="true"
                />
              ))}
              <div className="absolute inset-0 flex items-end gap-[2px]" onPointerLeave={() => setActiveIndex(null)}>
                {data.map((point, index) => {
                  const height = Math.max(1.5, (point.value / max) * 100)
                  const isActive = activeIndex === index
                  return (
                    <button
                      key={point.key}
                      type="button"
                      className="group relative flex h-full flex-1 items-end justify-center outline-none"
                      onPointerEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onBlur={() => setActiveIndex(null)}
                      aria-label={`${point.label}: ${formatEUR(point.value)}`}
                    >
                      <span
                        className={`block w-full max-w-7 rounded-t-[4px] transition-all duration-500 ease-ios ${
                          point.isCurrent ? 'bg-black' : isActive ? 'bg-gray-700' : 'bg-gray-300'
                        } ${isActive ? 'opacity-100' : activeIndex !== null ? 'opacity-60' : 'opacity-100'} group-focus-visible:ring-2 group-focus-visible:ring-black group-focus-visible:ring-offset-2`}
                        style={{ height: `${height}%` }}
                      />
                      {isActive && (
                        <span
                          className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-black px-2.5 py-1.5 text-left text-[11px] font-medium text-white shadow-lg ${
                            index < 2 ? 'left-0' : index > data.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                          }`}
                          style={{ bottom: `calc(${height}% + 6px)` }}
                        >
                          <span className="block text-white/60">{point.label}</span>
                          <span className="tabular-nums">{formatEUR(point.value)}</span>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="ml-12 mt-2 flex gap-[2px] text-[10px] text-gray-400" aria-hidden="true">
            {data.map((point, index) => (
              <span key={point.key} className="flex-1 truncate text-center">
                {index % labelEvery === 0 || index === data.length - 1 ? point.shortLabel : ''}
              </span>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
            <span className="size-2.5 rounded-[3px] bg-black" aria-hidden="true" /> Dabartinis laikotarpis (įskaičiuoti gyvi
            užsakymai)
          </p>
        </>
      ) : (
        <div className="mt-4 max-h-64 overflow-y-auto">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-white text-left text-[11px] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-2 font-medium">Laikotarpis</th>
                <th className="py-2 text-right font-medium">Apyvarta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((point) => (
                <tr key={point.key}>
                  <td className="py-2 text-gray-700">{point.label}</td>
                  <td className="py-2 text-right tabular-nums">{formatEUR(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
