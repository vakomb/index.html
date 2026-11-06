import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatNumber } from '../../lib/format.js'

export default function KpiTile({ label, value, delta, compareLabel, icon: Icon, live = false }) {
  const positive = delta >= 0

  return (
    <div className="flex flex-col rounded-[22px] border border-gray-100 bg-white p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-gray-500">{label}</p>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-full bg-smoke text-gray-700">
            <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-[24px] font-semibold leading-none tracking-tight tabular-nums text-black md:text-[28px]">
        {value}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px]">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold tabular-nums ${
            positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {positive ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
          {positive ? '+' : '−'}
          {formatNumber(Math.abs(delta), 1)} %
        </span>
        <span className="text-gray-500">{compareLabel}</span>
        {live && (
          <span className="ml-auto inline-flex items-center gap-1 text-emerald-700">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
            Gyvai
          </span>
        )}
      </div>
    </div>
  )
}
