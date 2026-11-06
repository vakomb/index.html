import { Check } from 'lucide-react'

// Stripe stiliaus akordeono žingsnis su sklandžiu aukščio perėjimu.
export default function CheckoutStep({ index, title, active, complete, locked, summary, onEdit, children }) {
  return (
    <section
      aria-labelledby={`step-${index}-title`}
      className={`rounded-[24px] border bg-white transition-all duration-500 ease-ios ${
        active ? 'border-black/10 shadow-xl shadow-black/[0.04]' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-3.5 px-5 py-4 md:px-6 md:py-5">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-300 ${
            complete && !active
              ? 'bg-emerald-600 text-white'
              : active
                ? 'bg-black text-white'
                : 'bg-smoke text-gray-400'
          }`}
        >
          {complete && !active ? <Check size={15} strokeWidth={2.5} aria-hidden="true" /> : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id={`step-${index}-title`}
            className={`text-[15px] font-semibold ${locked && !active ? 'text-gray-400' : 'text-black'}`}
          >
            {title}
          </h2>
          {complete && !active && summary && <p className="mt-0.5 truncate text-[13px] text-gray-500">{summary}</p>}
        </div>
        {complete && !active && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium text-black underline-offset-4 hover:underline"
          >
            Keisti
          </button>
        )}
      </div>

      <div
        className={`grid grid-cols-1 transition-[grid-template-rows] duration-500 ease-ios ${
          active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden" inert={active ? undefined : true}>
          <div className="px-5 pb-6 md:px-6 md:pb-7">{children}</div>
        </div>
      </div>
    </section>
  )
}
