import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

const control =
  'w-full rounded-xl border bg-white px-4 text-base text-ink placeholder:text-gray-400 transition outline-none focus:border-black focus:ring-4 focus:ring-black/5 disabled:bg-smoke md:text-[15px]'

function frame(error) {
  return error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200'
}

function FieldShell({ id, label, error, hint, optional, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-gray-700">
          <span>{label}</span>
          {optional && <span className="text-xs font-normal text-gray-400">neprivaloma</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({ label, error, hint, optional, className, trailing, inputClassName = '', ...props }) {
  const autoId = useId()
  const id = props.id ?? autoId
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${control} ${frame(error)} h-12 ${trailing ? 'pr-24' : ''} ${inputClassName}`}
          {...props}
        />
        {trailing && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5">{trailing}</div>
        )}
      </div>
    </FieldShell>
  )
}

export function TextArea({ label, error, hint, optional, className, ...props }) {
  const autoId = useId()
  const id = props.id ?? autoId
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={`${control} ${frame(error)} min-h-28 py-3 leading-relaxed`}
        {...props}
      />
    </FieldShell>
  )
}

export function SelectField({ label, error, hint, optional, className, children, ...props }) {
  const autoId = useId()
  const id = props.id ?? autoId
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          className={`${control} ${frame(error)} h-12 appearance-none pr-10`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </FieldShell>
  )
}
